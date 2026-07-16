"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { AuthShell } from "@/components/AuthShell";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

type ApiResponse = {
  message?: string;
  detail?: string | string[];
  email?: string[];
  code?: string[];
  new_password?: string[];
  non_field_errors?: string[];
};

function getErrorMessage(data: ApiResponse): string {
  const detail = Array.isArray(data.detail)
    ? data.detail[0]
    : data.detail;

  return (
    detail ||
    data.email?.[0] ||
    data.code?.[0] ||
    data.new_password?.[0] ||
    data.non_field_errors?.[0] ||
    "Something went wrong. Please try again."
  );
}

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState<"email" | "otp" | "password">("email");

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function sendResetOTP(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/auth/forgot-password/send-otp/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
          }),
        }
      );

      const data = (await response
        .json()
        .catch(() => ({}))) as ApiResponse;

      if (!response.ok) {
        throw new Error(getErrorMessage(data));
      }

      setMessage(
        data.message || "A password reset OTP has been sent to your email."
      );

      setStep("otp");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Could not send the password reset OTP."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function verifyResetOTP(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!/^\d{6}$/.test(code)) {
      setError("Enter a valid six-digit OTP.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/auth/forgot-password/verify-otp/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            code,
          }),
        }
      );

      const data = (await response
        .json()
        .catch(() => ({}))) as ApiResponse;

      if (!response.ok) {
        throw new Error(getErrorMessage(data));
      }

      setMessage(data.message || "OTP verified successfully.");
      setStep("password");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "The OTP could not be verified."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function resetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (newPassword.length < 8) {
      setError("Your new password must contain at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/auth/forgot-password/reset/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            code,
            new_password: newPassword,
          }),
        }
      );

      const data = (await response
        .json()
        .catch(() => ({}))) as ApiResponse;

      if (!response.ok) {
        throw new Error(getErrorMessage(data));
      }

      router.replace("/login?passwordReset=true");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Your password could not be reset."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle={
        step === "email"
          ? "Enter your email and we will send you a six-digit reset code."
          : step === "otp"
            ? "Enter the six-digit code sent to your email."
            : "Create a new password for your account."
      }
    >
      {error && (
        <div className="form-error" role="alert">
          <strong>There is a problem</strong>
          <p>{error}</p>
        </div>
      )}

      {message && (
        <div role="status">
          <p>{message}</p>
        </div>
      )}

      {step === "email" && (
        <form className="form-grid" onSubmit={sendResetOTP}>
          <div>
            <label htmlFor="email">Email address</label>

            <input
              className="input"
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <button
            className="btn btn-primary"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "SENDING CODE..." : "SEND RESET CODE"}
          </button>
        </form>
      )}

      {step === "otp" && (
        <form className="form-grid" onSubmit={verifyResetOTP}>
          <div>
            <label htmlFor="code">Verification code</label>

            <input
              className="input"
              id="code"
              name="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(event) =>
                setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="123456"
              required
            />
          </div>

          <button
            className="btn btn-primary"
            type="submit"
            disabled={isSubmitting || code.length !== 6}
          >
            {isSubmitting ? "VERIFYING..." : "VERIFY CODE"}
          </button>
        </form>
      )}

      {step === "password" && (
        <form className="form-grid" onSubmit={resetPassword}>
          <div>
            <label htmlFor="newPassword">New password</label>

            <input
              className="input"
              id="newPassword"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword">Confirm new password</label>

            <input
              className="input"
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
            />
          </div>

          <button
            className="btn btn-primary"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "RESETTING PASSWORD..." : "RESET PASSWORD"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}