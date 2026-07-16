import secrets
from datetime import timedelta

from django.contrib.auth.hashers import check_password, make_password
from django.utils import timezone

from accounts.models import EmailVerificationOTP


OTP_EXPIRY_MINUTES = 10
MAX_FAILED_ATTEMPTS = 5


def generate_otp() -> str:
    return f"{secrets.randbelow(1_000_000):06d}"


def create_otp_for_user(user) -> str:
    code = generate_otp()

    EmailVerificationOTP.objects.update_or_create(
        user=user,
        defaults={
            "code_hash": make_password(code),
            "expires_at": timezone.now()
            + timedelta(minutes=OTP_EXPIRY_MINUTES),
            "failed_attempts": 0,
        },
    )

    return code


def verify_otp_for_user(user, submitted_code: str) -> tuple[bool, str]:
    try:
        otp = EmailVerificationOTP.objects.get(user=user)
    except EmailVerificationOTP.DoesNotExist:
        return False, "No active OTP was found."

    if otp.failed_attempts >= MAX_FAILED_ATTEMPTS:
        return False, "Too many incorrect attempts. Request a new OTP."

    if timezone.now() > otp.expires_at:
        return False, "The OTP has expired."

    if not check_password(submitted_code, otp.code_hash):
        otp.failed_attempts += 1
        otp.save(update_fields=["failed_attempts"])
        return False, "The OTP is incorrect."

    return True, "OTP verified successfully."