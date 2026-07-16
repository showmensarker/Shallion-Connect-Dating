"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthShell } from "@/components/AuthShell";

export default function PaymentPage() {
  const router = useRouter();

  const [isProcessing, setIsProcessing] = useState(false);

  function handlePayPalPayment() {
    setIsProcessing(true);

    /*
      Frontend demonstration only.

      A real PayPal payment must create and confirm an order
      through PayPal and your backend.

      For your frontend demonstration, this button continues
      to the successful payment page.
    */

    window.setTimeout(() => {
      router.push("/payment-successful");
    }, 1000);
  }

  return (
    <AuthShell
      title="Complete your payment"
      subtitle=""
    >
      <div className="signup-page">
        <div className="payment-summary">
  <h2>Become a Premium Member</h2>

  <div className="payment-price">
    <strong>£35</strong>
    <span> one-time payment</span>
  </div>

  <ul className="payment-features">
   <ul className="payment-features">
  <li>💬 Unlimited messaging with members</li>
  <li>❤️ Advanced compatibility matching</li>
  <li>👤 View complete member profiles and photos</li>
  <li>🔍 Unlimited profile browsing</li>
  <li>📍 Find matches within your preferred distance</li>
 
</ul>
 
  </ul>
</div>

        <button
  className="paypal-button"
  type="button"
  onClick={handlePayPalPayment}
  disabled={isProcessing}
>
  <img
    src="/assets/paypal-logo.svg"
    alt="PayPal"
    className="paypal-logo"
  />

  {isProcessing
    ? "Processing..."
    : "Pay with PayPal"}
</button>
       
<p className="payment-security">
  🔒 Secure payment powered by PayPal.
</p>




        <p className="account-link">
          <Link href="/preferences">
            Back to preferences
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}