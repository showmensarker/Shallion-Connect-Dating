from django.conf import settings
from django.core.mail import EmailMultiAlternatives


def send_verification_otp(
    recipient_email: str,
    otp_code: str,
) -> None:
    subject = "Your Shallion Connections verification code"

    text_body = (
        f"Your verification code is: {otp_code}\n\n"
        "This code expires in 10 minutes."
    )

    html_body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 520px; margin: auto;">
        <h2>Verify your email</h2>

        <p>Enter this code on the verification page:</p>

        <div style="
            margin: 24px 0;
            padding: 20px;
            background: #f2f2f2;
            border-radius: 8px;
            text-align: center;
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 8px;
        ">
            {otp_code}
        </div>

        <p>This code expires in 10 minutes.</p>

        <p>
            If you did not create this account, ignore this email.
        </p>
    </div>
    """

    email = EmailMultiAlternatives(
        subject=subject,
        body=text_body,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[recipient_email],
    )

    email.attach_alternative(html_body, "text/html")
    email.send(fail_silently=False)


def send_password_reset_otp(
    recipient_email: str,
    otp_code: str,
) -> None:
    subject = "Reset your Shallion Connections password"

    text_body = (
        f"Your password reset code is: {otp_code}\n\n"
        "This code expires in 10 minutes.\n\n"
        "If you did not request a password reset, ignore this email."
    )

    html_body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 520px; margin: auto;">
        <h2>Reset your password</h2>

        <p>Enter this code on the password reset page:</p>

        <div style="
            margin: 24px 0;
            padding: 20px;
            background: #f2f2f2;
            border-radius: 8px;
            text-align: center;
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 8px;
        ">
            {otp_code}
        </div>

        <p>This code expires in 10 minutes.</p>

        <p>
            If you did not request this password reset,
            you can safely ignore this email.
        </p>
    </div>
    """

    email = EmailMultiAlternatives(
        subject=subject,
        body=text_body,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[recipient_email],
    )

    email.attach_alternative(html_body, "text/html")
    email.send(fail_silently=False)