"use client";

import { useState } from "react";
import { PaymentsService, PaymentInitiationParams } from "@/services/payments";

interface PaymentButtonProps {
  params: PaymentInitiationParams;
  onSuccess?: (transaction: any) => void;
  onError?: (error: string) => void;
  className?: string;
}

export function PaymentButton({ params, onSuccess, onError, className }: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      // 1. Initiate payment in backend
      const transaction = await PaymentsService.initiatePayment(params);
      
      // 2. Simulate external gateway redirect / Razorpay window
      // For MVP, we simulate instant success callback
      
      const callbackResult = await fetch(`/api/v1/payments/${transaction.id}/callback/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("mapansetu_access_token")}`
        },
        body: JSON.stringify({
          gateway_payment_id: `mock_pay_${Date.now()}`,
          status: 'SUCCESS'
        })
      }).then(res => res.json());

      if (onSuccess) {
        onSuccess(callbackResult);
      }
    } catch (err: any) {
      console.error(err);
      if (onError) {
        onError(err.message || "Payment failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className={className || "inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"}
    >
      {loading ? "Processing..." : "Pay Now"}
    </button>
  );
}
