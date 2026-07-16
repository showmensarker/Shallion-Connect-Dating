import secrets
from datetime import timedelta

from django.contrib.auth.hashers import check_password, make_password
from django.utils import timezone

from accounts.models import PasswordResetOTP


PASSWORD_RESET_EXPIRY_MINUTES = 10
PASSWORD_RESET_RESEND_SECONDS = 60
MAX_FAILED_ATTEMPTS = 5


def generate_password_reset_otp() -> str:
    return f"{secrets.randbelow(1_000_000):06d}"


def create_password_reset_otp(user) -> str:
    code = generate_password_reset_otp()
    now = timezone.now()

    PasswordResetOTP.objects.update_or_create(
        user=user,
        defaults={
            "code_hash": make_password(code),
            "expires_at": (
                now + timedelta(minutes=PASSWORD_RESET_EXPIRY_MINUTES)
            ),
            "last_sent_at": now,
            "failed_attempts": 0,
            "is_verified": False,
        },
    )

    return code


def verify_password_reset_otp(
    user,
    submitted_code: str,
) -> tuple[bool, str]:
    try:
        otp = PasswordResetOTP.objects.get(user=user)
    except PasswordResetOTP.DoesNotExist:
        return False, "No active password reset code exists."

    if otp.failed_attempts >= MAX_FAILED_ATTEMPTS:
        return False, "Too many incorrect attempts. Request a new code."

    if timezone.now() > otp.expires_at:
        return False, "The password reset code has expired."

    if not check_password(submitted_code, otp.code_hash):
        otp.failed_attempts += 1
        otp.save(update_fields=["failed_attempts"])

        return False, "The password reset code is incorrect."

    otp.is_verified = True
    otp.save(update_fields=["is_verified"])

    return True, "Password reset code verified successfully."