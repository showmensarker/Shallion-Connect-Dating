from datetime import timedelta

from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import check_password
from django.utils import timezone

from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from accounts.models import (
    EmailVerificationOTP,
    PasswordResetOTP,
)
from accounts.serializers import (
    ForgotPasswordSendOTPSerializer,
    ForgotPasswordVerifyOTPSerializer,
    LoginSerializer,
    RegisterSerializer,
    ResetPasswordSerializer,
    VerifyOTPSerializer,
)
from accounts.services.email_service import (
    send_password_reset_otp,
)
from accounts.services.otp_service import (
    verify_otp_for_user,
)
from accounts.services.password_reset_service import (
    PASSWORD_RESET_RESEND_SECONDS,
    create_password_reset_otp,
    verify_password_reset_otp,
)
from profiles.models import UserProfile


User = get_user_model()


class RegisterUserView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(
            data=request.data,
        )

        serializer.is_valid(
            raise_exception=True,
        )

        user = serializer.save()

        return Response(
            {
                "message": (
                    "Registration successful. "
                    "A verification OTP has been sent."
                ),
                "email": user.email,
            },
            status=status.HTTP_201_CREATED,
        )


class VerifyOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = VerifyOTPSerializer(
            data=request.data,
        )

        serializer.is_valid(
            raise_exception=True,
        )

        email = serializer.validated_data["email"]
        code = serializer.validated_data["code"]

        try:
            user = User.objects.get(
                email__iexact=email,
            )
        except User.DoesNotExist:
            return Response(
                {
                    "email": [
                        "No account was found with this email."
                    ]
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if user.is_active:
            return Response(
                {
                    "detail": (
                        "This account has already been verified. "
                        "Please sign in."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        valid, message = verify_otp_for_user(
            user=user,
            submitted_code=code,
        )

        if not valid:
            return Response(
                {
                    "code": [message],
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.is_active = True
        user.save(
            update_fields=["is_active"],
        )

        EmailVerificationOTP.objects.filter(
            user=user,
        ).delete()

        refresh = RefreshToken.for_user(user)

        try:
            profile = user.profile
        except UserProfile.DoesNotExist:
            profile = None

        return Response(
            {
                "message": "Email verified successfully.",
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "preferences_completed": (
                        profile.preferences_completed
                        if profile
                        else False
                    ),
                    "payment_completed": (
                        profile.payment_completed
                        if profile
                        else False
                    ),
                },
            },
            status=status.HTTP_200_OK,
        )


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(
            data=request.data,
            context={
                "request": request,
            },
        )

        serializer.is_valid(
            raise_exception=True,
        )

        return Response(
            serializer.validated_data,
            status=status.HTTP_200_OK,
        )


class ForgotPasswordSendOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSendOTPSerializer(
            data=request.data,
        )

        serializer.is_valid(
            raise_exception=True,
        )

        email = serializer.validated_data["email"]

        try:
            user = User.objects.get(
                email__iexact=email,
            )
        except User.DoesNotExist:
            return Response(
                {
                    "message": (
                        "If an account exists with this email, "
                        "a reset code has been sent."
                    )
                },
                status=status.HTTP_200_OK,
            )

        existing_otp = PasswordResetOTP.objects.filter(
            user=user,
        ).first()

        if existing_otp:
            next_allowed = (
                existing_otp.last_sent_at
                + timedelta(
                    seconds=PASSWORD_RESET_RESEND_SECONDS,
                )
            )

            if timezone.now() < next_allowed:
                seconds_left = max(
                    1,
                    int(
                        (
                            next_allowed
                            - timezone.now()
                        ).total_seconds()
                    ),
                )

                return Response(
                    {
                        "detail": (
                            f"Please wait {seconds_left} seconds "
                            "before requesting another code."
                        )
                    },
                    status=status.HTTP_429_TOO_MANY_REQUESTS,
                )

        otp_code = create_password_reset_otp(user)

        send_password_reset_otp(
            recipient_email=user.email,
            otp_code=otp_code,
        )

        return Response(
            {
                "message": (
                    "If an account exists with this email, "
                    "a reset code has been sent."
                )
            },
            status=status.HTTP_200_OK,
        )


class ForgotPasswordVerifyOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ForgotPasswordVerifyOTPSerializer(
            data=request.data,
        )

        serializer.is_valid(
            raise_exception=True,
        )

        email = serializer.validated_data["email"]
        code = serializer.validated_data["code"]

        try:
            user = User.objects.get(
                email__iexact=email,
            )
        except User.DoesNotExist:
            return Response(
                {
                    "code": [
                        "The reset code is invalid or expired."
                    ]
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        valid, message = verify_password_reset_otp(
            user=user,
            submitted_code=code,
        )

        if not valid:
            return Response(
                {
                    "code": [message],
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "message": message,
            },
            status=status.HTTP_200_OK,
        )


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(
            data=request.data,
        )

        serializer.is_valid(
            raise_exception=True,
        )

        email = serializer.validated_data["email"]
        code = serializer.validated_data["code"]
        new_password = serializer.validated_data[
            "new_password"
        ]

        try:
            user = User.objects.get(
                email__iexact=email,
            )

            otp = PasswordResetOTP.objects.get(
                user=user,
            )

        except (
            User.DoesNotExist,
            PasswordResetOTP.DoesNotExist,
        ):
            return Response(
                {
                    "detail": (
                        "The password reset request "
                        "is invalid or expired."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if timezone.now() > otp.expires_at:
            return Response(
                {
                    "detail": (
                        "The password reset code has expired."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not otp.is_verified:
            return Response(
                {
                    "detail": (
                        "Verify the password reset code before "
                        "setting a new password."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not check_password(
            code,
            otp.code_hash,
        ):
            return Response(
                {
                    "detail": (
                        "The password reset code is incorrect."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(new_password)

        user.save(
            update_fields=["password"],
        )

        otp.delete()

        return Response(
            {
                "message": (
                    "Your password has been reset successfully. "
                    "You can now sign in."
                )
            },
            status=status.HTTP_200_OK,
        )