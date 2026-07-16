"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/components/AppShell";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://127.0.0.1:8000";

type ProfileResponse = {
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    full_name: string;
  };
  profile: {
    gender: string;
    date_of_birth: string;
    age: number;
    location: string;
    phone_number: string;
    relationship_type: string;
    preferred_gender: string;
    preferred_min_age: number | null;
    preferred_max_age: number | null;
    max_distance: number | null;
    preferences_completed: boolean;
    payment_completed: boolean;
    created_at: string;
    updated_at: string;
  };
  detail?: string;
};

function formatValue(value: string | null | undefined) {
  if (!value) {
    return "Not provided";
  }

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase()
    );
}

export default function ProfilePage() {
  const router = useRouter();

  const [profileData, setProfileData] =
    useState<ProfileResponse | null>(null);

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const accessToken =
        localStorage.getItem("access_token");

      if (!accessToken) {
        router.replace("/login");
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/v1/profiles/me/`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const data = (await response
          .json()
          .catch(() => ({}))) as ProfileResponse;

        if (response.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("current_user");

          window.dispatchEvent(
            new Event("auth-changed")
          );

          router.replace("/login");
          return;
        }

        if (!response.ok) {
          throw new Error(
            data.detail ||
              "We could not load your profile."
          );
        }

        setProfileData(data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "We could not load your profile."
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  if (isLoading) {
    return (
      <AppShell
        title="My profile"
        subtitle="Health, neurodiversity and disability information are optional and user-controlled."
      >
        <div className="card">
          <p>Loading profile...</p>
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell
        title="My profile"
        subtitle="Health, neurodiversity and disability information are optional and user-controlled."
      >
        <div
          className="form-error"
          role="alert"
        >
          <strong>There is a problem</strong>
          <p>{error}</p>
        </div>
      </AppShell>
    );
  }

  if (!profileData) {
    return null;
  }

  const { user, profile } = profileData;

  return (
    <AppShell
      title="My profile"
      subtitle="Health, neurodiversity and disability information are optional and user-controlled."
    >
      <div className="grid-2">
        <article className="card">
          <div
            className="avatar-placeholder large"
            aria-hidden="true"
          />

          <h2>
            {user.full_name || user.email}
          </h2>

          <p>
            {profile.location}
            {" · "}
            Looking for{" "}
            {formatValue(
              profile.relationship_type
            )}.
          </p>

          <p>
            <strong>Age:</strong>{" "}
            {profile.age}
          </p>

          <p>
            <strong>Email:</strong>{" "}
            {user.email}
          </p>

          <button
            className="btn btn-primary"
            type="button"
            onClick={() =>
              router.push("/profile/edit")
            }
          >
            Edit profile
          </button>
        </article>

        <article className="card">
          <h2>Profile details</h2>

          <p>
            <strong>Gender:</strong>{" "}
            {formatValue(profile.gender)}
          </p>

          <p>
            <strong>Date of birth:</strong>{" "}
            {profile.date_of_birth}
          </p>

          <p>
            <strong>Phone number:</strong>{" "}
            {profile.phone_number}
          </p>

          <p>
            <strong>Connection type:</strong>{" "}
            {formatValue(
              profile.relationship_type
            )}
          </p>

          <p>
            <strong>Preferred gender:</strong>{" "}
            {formatValue(
              profile.preferred_gender
            )}
          </p>

          <p>
            <strong>Preferred age range:</strong>{" "}
            {profile.preferred_min_age ??
              "Not provided"}
            {" – "}
            {profile.preferred_max_age ??
              "Not provided"}
          </p>

          <p>
            <strong>Maximum distance:</strong>{" "}
            {profile.max_distance !== null
              ? `${profile.max_distance} km`
              : "Not provided"}
          </p>
        </article>
      </div>
    </AppShell>
  );
}