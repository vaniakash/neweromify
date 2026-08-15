"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { XCircle } from "lucide-react";

export default function PaymentFailedContent() {
  const params = useSearchParams();
  const router = useRouter();
  const reason = params.get("reason") ?? "unknown";

  const messages: Record<string, string> = {
    hash_mismatch:    "Payment verification failed. Please contact support.",
    payment_failed:   "Your payment was not completed. No charges were made.",
    record_not_found: "Payment record not found. Please contact support.",
    server_error:     "A server error occurred. Please try again.",
    unknown:          "Something went wrong. Please try again.",
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: "linear-gradient(160deg,#09091a 0%,#0f0f24 100%)" }}
    >
      <div className="text-center max-w-sm">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)" }}
        >
          <XCircle className="h-12 w-12" style={{ color: "#f87171" }} />
        </div>
        <h1 className="text-3xl font-black text-white mb-3">Payment Failed</h1>
        <p className="text-white/60 text-sm mb-8">
          {messages[reason] ?? messages.unknown}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => router.push("/pricing")}
            className="px-6 py-3 rounded-2xl font-black text-white text-sm"
            style={{ background: "linear-gradient(135deg,#be123c,#f43f5e)", boxShadow: "0 0 25px rgba(244,63,94,0.4)" }}
          >
            Try Again
          </button>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 rounded-2xl font-black text-sm"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}
