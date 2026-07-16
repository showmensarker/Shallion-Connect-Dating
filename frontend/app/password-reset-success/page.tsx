import Link from "next/link";
import { AuthShell } from "@/components/AuthShell";

export default function PasswordResetSuccessPage() {
  return (
    <AuthShell
      title="Password updated"
      subtitle="Your password has been changed successfully"
    >
      <div className="form-grid">
        <div
          className="notice"
          role="status"
          aria-live="polite"
          tabIndex={-1}
        >
          You can now log in using your new password.
        </div>

        <Link className="btn btn-primary" href="/login">
          Continue to login
        </Link>
      </div>
    </AuthShell>
  );
}