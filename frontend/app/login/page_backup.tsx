"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { AuthShell } from "@/components/AuthShell";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

type LoginResponse = {
  access?: string;
  refresh?: string;
  user?: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    preferences_completed: boolean;
    payment_completed: boolean;
  };
  detail?: string | string[];
  non_field_errors?: string[];
  email?: string[];
  password?: string[];
};

export default function LoginPage() {
  const router = useRouter();

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    const email = String(formData.get("email") ?? "")
      .trim()
      .toLowerCase();

    const password = String(formData.get("password") ?? "");

    if (!email || !password) {
      setError("Enter your email address and password.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/auth/login/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = (await response
        .json()
        .catch(() => ({}))) as LoginResponse;

      if (!response.ok) {
        const detailMessage = Array.isArray(data.detail)
          ? data.detail[0]
          : data.detail;

        const message =
          detailMessage ||
          data.non_field_errors?.[0] ||
          data.email?.[0] ||
          data.password?.[0] ||
          "Email address or password is incorrect.";

        throw new Error(message);
      }

      if (!data.access || !data.refresh || !data.user) {
        throw new Error(
          "The server did not return complete login information."
        );
      }

      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);
      localStorage.setItem(
        "current_user",
        JSON.stringify(data.user)
      );

      window.dispatchEvent(new Event("auth-changed"));

      if (!data.user.preferences_completed) {
        router.replace("/email-confirmed");
      } else if (!data.user.payment_completed) {
        router.replace("/payment");
      } else {
        router.replace("/dashboard");
      }

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Login failed. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to continue your Shallion Connections journey"
    >
      <form className="form-grid" onSubmit={handleSubmit}>
        {error && (
          <div className="form-error" role="alert">
            <strong>There is a problem</strong>
            <p>{error}</p>
          </div>
        )}

        <div>
          <label htmlFor="email">Email address</label>

          <input
            className="input"
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
        </div>

        <div>
          <label htmlFor="password">Password</label>

          <input
            className="input"
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>

        <button
          className="btn btn-primary"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "LOGGING IN..." : "LOG IN"}
        </button>

        <p className="helplog">
          <Link href="/forgot-password">
            Forgot password?
          </Link>

          <Link href="/user-registration">
            Create account
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}