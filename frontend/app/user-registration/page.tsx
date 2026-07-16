"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/AuthShell";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

type ApiErrorResponse = Record<string, unknown>;

function getApiErrorMessage(data: ApiErrorResponse): string {
  const preferredFields = [
    "first_name",
    "last_name",
    "gender",
    "date_of_birth",
    "location",
    "phone_number",
    "email",
    "password",
    "non_field_errors",
    "detail",
  ];

  for (const field of preferredFields) {
    const value = data[field];

    if (Array.isArray(value) && typeof value[0] === "string") {
      return value[0];
    }

    if (typeof value === "string") {
      return value;
    }
  }

  return "Registration failed. Please check your details and try again.";
}

function EyeIcon({ isVisible }: { isVisible: boolean }) {
  return isVisible ? (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 3l18 18" />
      <path d="M10.6 10.6a2 2 0 002.8 2.8" />
      <path d="M9.9 4.2A10.7 10.7 0 0112 4c5 0 9 4.2 10 8a12.5 12.5 0 01-2 3.9" />
      <path d="M6.2 6.2A12.1 12.1 0 002 12c1 3.8 5 8 10 8a10.8 10.8 0 005-1.2" />
    </svg>
  ) : (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export default function RegisterPage() {
  const router = useRouter();

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordRules = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const passwordIsValid = Object.values(passwordRules).every(Boolean);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    const firstName = String(formData.get("firstName") ?? "").trim();
    const lastName = String(formData.get("lastName") ?? "").trim();
    const gender = String(formData.get("gender") ?? "").trim();
    const dateOfBirth = String(formData.get("dateOfBirth") ?? "").trim();
    const location = String(formData.get("location") ?? "").trim();
    const phoneNumber = String(formData.get("phoneNumber") ?? "").trim();
    const email = String(formData.get("email") ?? "")
      .trim()
      .toLowerCase();
    const acceptedTerms = formData.get("acceptedTerms") === "on";

    if (
      !firstName ||
      !lastName ||
      !gender ||
      !dateOfBirth ||
      !location ||
      !phoneNumber ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      setError("Please complete all required fields.");
      setIsSubmitting(false);
      return;
    }

    if (!passwordIsValid) {
      setError("Please make sure your password meets all requirements.");
      setIsSubmitting(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Your passwords do not match.");
      setIsSubmitting(false);
      return;
    }

    if (!acceptedTerms) {
      setError("You must agree to the Terms and Conditions.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/auth/register/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            first_name: firstName,
            last_name: lastName,
            gender,
            date_of_birth: dateOfBirth,
            location,
            phone_number: phoneNumber,
            email,
            password,
          }),
        }
      );

      const data = (await response.json().catch(() => ({}))) as ApiErrorResponse;

      if (!response.ok) {
        throw new Error(getApiErrorMessage(data));
      }

      sessionStorage.setItem("verification_email", email);

      sessionStorage.setItem(
        "registrationData",
        JSON.stringify({
          firstName,
          lastName,
          gender,
          dateOfBirth,
          location,
          phoneNumber,
          email,
        })
      );

      router.push(
        `/email-verification?email=${encodeURIComponent(email)}`
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Registration failed. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Complete your details to get started."
    >
      <form className="signup-page" onSubmit={handleSubmit}>
        {error && (
          <div className="form-error" role="alert">
            <strong>There is a problem</strong>
            <p>{error}</p>
          </div>
        )}

        <div className="form-row">
          <div className="form-field">
            <label htmlFor="firstName">Name</label>
            <input
              className="input"
              id="firstName"
              name="firstName"
              type="text"
              autoComplete="given-name"
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="lastName">Surname</label>
            <input
              className="input"
              id="lastName"
              name="lastName"
              type="text"
              autoComplete="family-name"
              placeholder="Enter your surname"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label htmlFor="gender">Gender</label>
            <select
              className="select"
              id="gender"
              name="gender"
              defaultValue=""
              required
            >
              <option value="" disabled>
                Select your gender
              </option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              </select>
          </div>

          <div className="form-field">
            <label htmlFor="dateOfBirth">Date of birth</label>
            <input
              className="input date-input"
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              autoComplete="bday"
              max={new Date().toISOString().split("T")[0]}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label htmlFor="location">Location</label>
            <input
              className="input"
              id="location"
              name="location"
              type="text"
              autoComplete="address-level2"
              placeholder="Location"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="phoneNumber">Phone number</label>
            <input
              className="input"
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+44 7123 456789"
              required
            />
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="email">Email address</label>
          <input
            className="input"
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="name@example.com"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-field">
            <label htmlFor="password">Password</label>

            <div className="password-input-wrapper">
              <input
                className="input password-input"
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                placeholder="Create a password"
                required
              />

              <button
                className="password-toggle"
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
              >
                <EyeIcon isVisible={showPassword} />
              </button>
            </div>

 {password.length > 0 && (
  <ul className="password-rules" aria-live="polite">
    <li className={passwordRules.length ? "valid" : ""}>
      At least 8 characters
    </li>

    <li className={passwordRules.uppercase ? "valid" : ""}>
      One uppercase letter (A–Z)
    </li>

    <li className={passwordRules.number ? "valid" : ""}>
      One number (0–9)
    </li>

    <li className={passwordRules.special ? "valid" : ""}>
      One special character (!@#$%^&*)
    </li>
  </ul>
)}
          </div>

          <div className="form-field">
            <label htmlFor="confirmPassword">Confirm password</label>

            <div className="password-input-wrapper">
              <input
                className="input password-input"
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                placeholder="Repeat your password"
                required
              />

              <button
                className="password-toggle"
                type="button"
                onClick={() =>
                  setShowConfirmPassword((current) => !current)
                }
                aria-label={
                  showConfirmPassword
                    ? "Hide confirmed password"
                    : "Show confirmed password"
                }
                aria-pressed={showConfirmPassword}
              >
                <EyeIcon isVisible={showConfirmPassword} />
              </button>
            </div>

            {confirmPassword && (
              <p
                className={
                  password === confirmPassword
                    ? "password-match valid"
                    : "password-match invalid"
                }
                role="status"
              >
                {password === confirmPassword
                  ? "Passwords match."
                  : "Passwords do not match."}
              </p>
            )}
          </div>
        </div>

        <label className="terms-checkbox">
          <input name="acceptedTerms" type="checkbox" required />
          <span>
            I agree to the <Link href="/terms">Terms of Service</Link> and{" "}
            <Link href="/privacy">Privacy Policy</Link>.
          </span>
        </label>

        <button
          className="btn btn-primary create-account-button"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
        </button>

        <p className="account-link">
          Already have an account? <Link href="/login">Sign in</Link>
        </p>
        <p className="terms-note">
  By clicking <strong>CREATE ACCOUNT</strong>, you agree to our{" "}
  <Link href="/terms">Terms of Service</Link> and{" "}
  <Link href="/privacy">Privacy Policy</Link>.
</p>
      </form>
    </AuthShell>
  );
}