import uuid

from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.password_validation import validate_password
from django.db import transaction

from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from accounts.services.email_service import send_verification_otp
from accounts.services.otp_service import create_otp_for_user
from profiles.models import UserProfile


User = get_user_model()


def generate_unique_username(email: str) -> str:
    """
    Generate an internal unique username because users register
    and log in with their email address.
    """
    email_prefix = email.split("@", 1)[0]

    safe_prefix = "".join(
        character
        for character in email_prefix
        if character.isalnum() or character in {"_", "-", "."}
    )

    safe_prefix = safe_prefix[:100] or "user"
    suffix = uuid.uuid4().hex[:8]

    return f"{safe_prefix}_{suffix}"


class RegisterSerializer(serializers.Serializer):
    first_name = serializers.CharField(
        max_length=150,
    )

    last_name = serializers.CharField(
        max_length=150,
    )

    gender = serializers.ChoiceField(
        choices=UserProfile.Gender.choices,
    )

    date_of_birth = serializers.DateField()

    location = serializers.CharField(
        max_length=150,
    )

    phone_number = serializers.CharField(
        max_length=30,
    )

    email = serializers.EmailField()

    password = serializers.CharField(
        write_only=True,
        min_length=8,
        trim_whitespace=False,
    )

    def validate_email(self, value):
        email = value.strip().lower()

        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError(
                "An account with this email already exists."
            )

        return email

    def validate_phone_number(self, value):
        phone_number = value.strip()

        if UserProfile.objects.filter(
            phone_number=phone_number
        ).exists():
            raise serializers.ValidationError(
                "An account with this phone number already exists."
            )

        return phone_number

    def validate_first_name(self, value):
        first_name = value.strip()

        if not first_name:
            raise serializers.ValidationError(
                "First name is required."
            )

        return first_name

    def validate_last_name(self, value):
        last_name = value.strip()

        if not last_name:
            raise serializers.ValidationError(
                "Last name is required."
            )

        return last_name

    def validate_location(self, value):
        location = value.strip()

        if not location:
            raise serializers.ValidationError(
                "Location is required."
            )

        return location

    def create(self, validated_data):
        first_name = validated_data["first_name"]
        last_name = validated_data["last_name"]
        gender = validated_data["gender"]
        date_of_birth = validated_data["date_of_birth"]
        location = validated_data["location"]
        phone_number = validated_data["phone_number"]
        email = validated_data["email"]
        password = validated_data["password"]

        try:
            with transaction.atomic():
                user = User.objects.create_user(
                    username=generate_unique_username(email),
                    first_name=first_name,
                    last_name=last_name,
                    email=email,
                    password=password,
                    is_active=False,
                )

                UserProfile.objects.create(
                    user=user,
                    gender=gender,
                    date_of_birth=date_of_birth,
                    location=location,
                    phone_number=phone_number,
                    preferences_completed=False,
                    payment_completed=False,
                )

                otp_code = create_otp_for_user(user)

                send_verification_otp(
                    recipient_email=user.email,
                    otp_code=otp_code,
                )

                return user

        except serializers.ValidationError:
            raise

        except Exception as exc:
            print("EMAIL SEND ERROR:", repr(exc))

            raise serializers.ValidationError(
                {
                    "email": [
                        "We could not send the verification email. "
                        "Please try again."
                    ]
                }
            ) from exc


class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()

    code = serializers.RegexField(
        regex=r"^\d{6}$",
        error_messages={
            "invalid": "Enter a valid six-digit OTP."
        },
    )

    def validate_email(self, value):
        return value.strip().lower()


class ResendOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        email = value.strip().lower()

        try:
            user = User.objects.get(
                email__iexact=email
            )
        except User.DoesNotExist:
            raise serializers.ValidationError(
                "No account was found with this email."
            )

        if user.is_active:
            raise serializers.ValidationError(
                "This account is already verified."
            )

        self.context["user"] = user

        return email


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()

    password = serializers.CharField(
        write_only=True,
        trim_whitespace=False,
    )

    def validate_email(self, value):
        return value.strip().lower()

    def validate(self, attrs):
        email = attrs["email"]
        password = attrs["password"]

        try:
            user = User.objects.get(
                email__iexact=email
            )
        except User.DoesNotExist:
            raise serializers.ValidationError(
                {
                    "detail": (
                        "The email address or password is incorrect."
                    )
                }
            )

        if not user.is_active:
            raise serializers.ValidationError(
                {
                    "detail": (
                        "Your email address has not been verified yet."
                    )
                }
            )

        authenticated_user = authenticate(
            request=self.context.get("request"),
            username=user.username,
            password=password,
        )

        if authenticated_user is None:
            raise serializers.ValidationError(
                {
                    "detail": (
                        "The email address or password is incorrect."
                    )
                }
            )

        refresh = RefreshToken.for_user(
            authenticated_user
        )

        try:
            profile = authenticated_user.profile
        except UserProfile.DoesNotExist:
            profile = None

        return {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": {
                "id": authenticated_user.id,
                "email": authenticated_user.email,
                "first_name": authenticated_user.first_name,
                "last_name": authenticated_user.last_name,
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
        }


class ForgotPasswordSendOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        return value.strip().lower()


class ForgotPasswordVerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()

    code = serializers.RegexField(
        regex=r"^\d{6}$",
        error_messages={
            "invalid": "Enter a valid six-digit code."
        },
    )

    def validate_email(self, value):
        return value.strip().lower()


class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

    code = serializers.RegexField(
        regex=r"^\d{6}$",
        error_messages={
            "invalid": "Enter a valid six-digit code."
        },
    )

    new_password = serializers.CharField(
        write_only=True,
        min_length=8,
        trim_whitespace=False,
    )

    def validate_email(self, value):
        return value.strip().lower()

    def validate_new_password(self, value):
        validate_password(value)
        return value