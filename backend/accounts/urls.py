from django.urls import path

from accounts.views import (
    ForgotPasswordSendOTPView,
    ForgotPasswordVerifyOTPView,
    LoginView,
    RegisterUserView,
    ResetPasswordView,
    VerifyOTPView,
)


urlpatterns = [
    path(
        "register/",
        RegisterUserView.as_view(),
        name="register",
    ),
    path(
        "verify-otp/",
        VerifyOTPView.as_view(),
        name="verify-otp",
    ),
    path(
        "login/",
        LoginView.as_view(),
        name="login",
    ),
    path(
        "forgot-password/send-otp/",
        ForgotPasswordSendOTPView.as_view(),
        name="forgot-password-send-otp",
    ),
    path(
        "forgot-password/verify-otp/",
        ForgotPasswordVerifyOTPView.as_view(),
        name="forgot-password-verify-otp",
    ),
    path(
        "forgot-password/reset/",
        ResetPasswordView.as_view(),
        name="forgot-password-reset",
    ),
]