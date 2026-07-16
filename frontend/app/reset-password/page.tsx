"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/AuthShell";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);

    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(
      formData.get("confirmPassword") ?? ""
    );

    if (password.length < 8) {
      setError("Your password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("The passwords do not match. Please try again.");
      return;
    }

    // Add your password reset API request here.

    router.push("/password-reset-success");
  }

  return (
    <AuthShell
      title="Create a new password"
      subtitle="Choose a strong password that you have not used before"
    >
      <form className="form-grid" onSubmit={handleSubmit}>
        {error && (
          <div
            className="form-error"
            role="alert"
            aria-live="assertive"
            tabIndex={-1}
          >
            {error}
          </div>
        )}

        <div>
          <label htmlFor="password">New password</label>

          <input
            className="input"
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            aria-describedby="password-help"
          />

          <p id="password-help" className="form-help">
            Use at least 8 characters.
          </p>
        </div>

        <div>
          <label htmlFor="confirmPassword">Confirm new password</label>

          <input
            className="input"
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </div>

        <button className="btn btn-primary" type="submit">
          Save new password
        </button>
      </form>
    </AuthShell>
  );
}