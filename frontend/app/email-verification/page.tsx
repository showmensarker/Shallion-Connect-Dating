"use client";

import Link from "next/link";
import {
  type FormEvent,
  useEffect,
  useState,
} from "react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import { AuthShell } from "@/components/AuthShell";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://127.0.0.1:8000";

type CurrentUser = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
};

type VerifyOtpResponse = {
  message?: string;
  access?: string;
  refresh?: string;
  user?: CurrentUser;
  code?: string | string[];
  email?: string | string[];
  non_field_errors?: string[];
  detail?: string | string[];
};

function getApiErrorMessage(
  data: VerifyOtpResponse,
): string {
  const preferredFields: Array<
    keyof VerifyOtpResponse
  > = [
    "code",
    "email",
    "non_field_errors",
    "detail",
  ];

  for (const field of preferredFields) {
    const value = data[field];

    if (
      Array.isArray(value) &&
      typeof value[0] === "string"
    ) {
      return value[0];
    }

    if (typeof value === "string") {
      return value;
    }
  }

  return "OTP verification failed.";
}

export default function EmailVerificationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isVerifying, setIsVerifying] =
    useState(false);

  useEffect(() => {
    const queryEmail = searchParams.get("email");

    const storedEmail = sessionStorage.getItem(
      "verification_email",
    );

    setEmail(
      queryEmail ||
        storedEmail ||
        "",
    );
  }, [searchParams]);

  async function handleVerify(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!email) {
      setError(
        "Your email address is missing. Please register again.",
      );
      return;
    }

    if (!/^\d{6}$/.test(code)) {
      setError(
        "Enter the complete six-digit OTP.",
      );
      return;
    }

    setIsVerifying(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/auth/verify-otp/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            code,
          }),
        },
      );

      const data = (await response
        .json()
        .catch(
          () => ({}),
        )) as VerifyOtpResponse;

      if (!response.ok) {
        throw new Error(
          getApiErrorMessage(data),
        );
      }

      if (
        !data.access ||
        !data.refresh ||
        !data.user
      ) {
        throw new Error(
          "Email verification succeeded, but automatic login could not be completed.",
        );
      }

      localStorage.setItem(
        "access_token",
        data.access,
      );

      localStorage.setItem(
        "refresh_token",
        data.refresh,
      );

      localStorage.setItem(
        "current_user",
        JSON.stringify(data.user),
      );

      sessionStorage.removeItem(
        "verification_email",
      );

      sessionStorage.removeItem(
        "registrationData",
      );

      window.dispatchEvent(
        new Event("auth-changed"),
      );

      setMessage(
        "Email verified successfully.",
      );

      router.replace("/email-confirmed");
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "OTP verification failed.",
      );
    } finally {
      setIsVerifying(false);
    }
  }

  function handleCodeChange(
    value: string,
  ) {
    setCode(
      value
        .replace(/\D/g, "")
        .slice(0, 6),
    );
  }

  return (
    <AuthShell
      title="Verify your email"
      subtitle="Enter the six-digit code we sent to your email."
    >
      <form
        className="signup-page"
        onSubmit={handleVerify}
      >
        <p>
          We sent a verification code to:
        </p>

        <p>
          <strong>
            {email || "your email address"}
          </strong>
        </p>

        <div className="form-field">
          <label htmlFor="verificationCode">
            Verification code
          </label>

          <input
            className="input"
            id="verificationCode"
            name="verificationCode"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="Enter 6-digit code"
            value={code}
            onChange={(event) =>
              handleCodeChange(
                event.target.value,
              )
            }
            maxLength={6}
            pattern="[0-9]{6}"
            required
          />
        </div>

        {error && (
          <div
            className="form-error"
            role="alert"
          >
            <strong>
              There is a problem
            </strong>

            <p>{error}</p>
          </div>
        )}

        {message && (
          <div role="status">
            <p>{message}</p>
          </div>
        )}

        <button
          className="btn btn-primary create-account-button"
          type="submit"
          disabled={
            isVerifying ||
            code.length !== 6
          }
        >
          {isVerifying
            ? "VERIFYING..."
            : "VERIFY EMAIL"}
        </button>

        <p className="account-link">
          Wrong email address?{" "}
          <Link href="/user-registration">
            Go back and change it
          </Link>
        </p>

        <p className="terms-note">
          Can&apos;t find the email? Check
          your Spam or Junk folder.
        </p>
      </form>
    </AuthShell>
  );
}