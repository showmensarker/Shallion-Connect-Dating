"use client";

import Link from "next/link";
import { AuthShell } from "@/components/AuthShell";

export default function PaymentSuccessfulPage() {
  return (
    <AuthShell
      title=""
      subtitle=""
    >
      <div className="signup-page">
        <div className="notice">
  <h2 className="success-title" >🎉 Welcome to Shallion Connections!</h2>

  <p className="success-message"> 
    Your payment has been received and your Premium Membership
    has been activated successfully.
  </p>

  
</div>
        <Link
          href="/login"
          className="btn btn-primary login-btn"
        >
          Log in 
        </Link>

        <p className="account-link">
          <Link href="/payment">
            Back to payment page
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}