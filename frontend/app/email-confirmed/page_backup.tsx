"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { AuthShell } from "@/components/AuthShell";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://127.0.0.1:8000";

type PreferenceData = {
  relationship_type: string;
  preferred_gender: string;
  preferred_min_age: number | null;
  preferred_max_age: number | null;
  max_distance: number | null;
};

type PreferencesResponse = {
  message?: string;
  preferences_completed?: boolean;
  detail?: string | string[];
  relationship_type?: string[];
  preferred_gender?: string[];
  preferred_min_age?: string[];
  preferred_max_age?: string[];
  max_distance?: string[];
};

type StoredUser = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  preferences_completed?: boolean;
  payment_completed?: boolean;
};

function getErrorMessage(
  data: PreferencesResponse
): string {
  const detail = Array.isArray(data.detail)
    ? data.detail[0]
    : data.detail;

  return (
    detail ||
    data.relationship_type?.[0] ||
    data.preferred_gender?.[0] ||
    data.preferred_min_age?.[0] ||
    data.preferred_max_age?.[0] ||
    data.max_distance?.[0] ||
    "We could not save your preferences."
  );
}

export default function EmailConfirmedPreferencesPage() {
  const router = useRouter();

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    const relationshipType = String(
      formData.get("relationshipType") ?? ""
    ).trim();

    const preferredGender = String(
      formData.get("preferredGender") ?? ""
    ).trim();

    const minAgeText = String(
      formData.get("minAge") ?? ""
    ).trim();

    const maxAgeText = String(
      formData.get("maxAge") ?? ""
    ).trim();

    const maxDistanceText = String(
      formData.get("maxDistance") ?? ""
    ).trim();

    const minAge = minAgeText
      ? Number(minAgeText)
      : null;

    const maxAge = maxAgeText
      ? Number(maxAgeText)
      : null;

    const maxDistance = maxDistanceText
      ? Number(maxDistanceText)
      : null;

    if (!relationshipType) {
      setError(
        "Please select what type of connection you are looking for."
      );
      setIsSubmitting(false);
      return;
    }

    if (!preferredGender) {
      setError(
        "Please select your preferred gender."
      );
      setIsSubmitting(false);
      return;
    }

    if (
      minAge !== null &&
      (
        !Number.isInteger(minAge) ||
        minAge < 18 ||
        minAge > 100
      )
    ) {
      setError(
        "Minimum age must be a whole number between 18 and 100."
      );
      setIsSubmitting(false);
      return;
    }

    if (
      maxAge !== null &&
      (
        !Number.isInteger(maxAge) ||
        maxAge < 18 ||
        maxAge > 100
      )
    ) {
      setError(
        "Maximum age must be a whole number between 18 and 100."
      );
      setIsSubmitting(false);
      return;
    }

    if (
      minAge !== null &&
      maxAge !== null &&
      minAge > maxAge
    ) {
      setError(
        "Minimum age cannot be greater than maximum age."
      );
      setIsSubmitting(false);
      return;
    }

    if (
      maxDistance !== null &&
      (
        !Number.isInteger(maxDistance) ||
        maxDistance < 1 ||
        maxDistance > 500
      )
    ) {
      setError(
        "Maximum distance must be a whole number between 1 and 500 kilometres."
      );
      setIsSubmitting(false);
      return;
    }

    const accessToken =
      localStorage.getItem("access_token");

    if (!accessToken) {
      setError(
        "Your login session is missing. Please log in again."
      );
      setIsSubmitting(false);
      router.replace("/login");
      return;
    }

    const preferenceData: PreferenceData = {
      relationship_type: relationshipType,
      preferred_gender: preferredGender,
      preferred_min_age: minAge,
      preferred_max_age: maxAge,
      max_distance: maxDistance,
    };

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/profiles/preferences/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(preferenceData),
        }
      );

      const data = (await response
        .json()
        .catch(() => ({}))) as PreferencesResponse;

      if (response.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("current_user");

        window.dispatchEvent(
          new Event("auth-changed")
        );

        throw new Error(
          "Your session has expired. Please log in again."
        );
      }

      if (!response.ok) {
        throw new Error(
          getErrorMessage(data)
        );
      }

      sessionStorage.setItem(
        "preferenceData",
        JSON.stringify(preferenceData)
      );

      const storedUser =
        localStorage.getItem("current_user");

      if (storedUser) {
        try {
          const currentUser =
            JSON.parse(storedUser) as StoredUser;

          localStorage.setItem(
            "current_user",
            JSON.stringify({
              ...currentUser,
              preferences_completed: true,
            })
          );
        } catch {
          localStorage.removeItem("current_user");
        }
      }

      window.dispatchEvent(
        new Event("auth-changed")
      );

      router.replace("/payment");
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "We could not save your preferences."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Email verified successfully"
      subtitle=""
    >
      <form
        className="signup-page"
        onSubmit={handleSubmit}
      >
        <div
          className="notice"
          role="status"
        >
          <p className="form-help">
            Your account is ready. Tell us who you
            would like to connect with.
          </p>
        </div>

        {error && (
          <div
            className="form-error"
            role="alert"
            aria-live="assertive"
          >
            <strong>There is a problem</strong>
            <p>{error}</p>
          </div>
        )}

        <div className="form-field">
          <label htmlFor="relationshipType">
            What are you looking for?
          </label>

          <select
            className="select"
            id="relationshipType"
            name="relationshipType"
            defaultValue=""
            required
          >
            <option value="" disabled>
              Select a connection type
            </option>

            <option value="friendship">
              Friendship
            </option>

            <option value="relationship">
              Relationship
            </option>
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="preferredGender">
            Preferred gender
          </label>

          <select
            className="select"
            id="preferredGender"
            name="preferredGender"
            defaultValue=""
            required
          >
            <option value="" disabled>
              Select a preferred gender
            </option>

            <option value="female">
              Female
            </option>

            <option value="male">
              Male
            </option>
          </select>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label htmlFor="minAge">
              Minimum age
            </label>

            <input
              className="input"
              id="minAge"
              name="minAge"
              type="number"
              min={18}
              max={100}
              step={1}
              inputMode="numeric"
              placeholder="18"
            />
          </div>

          <div className="form-field">
            <label htmlFor="maxAge">
              Maximum age
            </label>

            <input
              className="input"
              id="maxAge"
              name="maxAge"
              type="number"
              min={18}
              max={100}
              step={1}
              inputMode="numeric"
              placeholder="60"
            />
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="maxDistance">
            Maximum distance in kilometres
          </label>

          <input
            className="input"
            id="maxDistance"
            name="maxDistance"
            type="number"
            min={1}
            max={500}
            step={1}
            inputMode="numeric"
            placeholder="For example, 25"
          />
        </div>

        <button
          className="btn btn-primary create-account-button"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Saving preferences..."
            : "Continue to payment"}
        </button>

        <p className="account-link">
          <Link href="/">
            Back to home
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}