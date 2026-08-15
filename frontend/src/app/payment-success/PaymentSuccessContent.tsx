"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { CheckCircle } from "lucide-react";

export default function PaymentSuccessContent() {
  const params = useSearchParams();
  const router = useRouter();
  const credits = params.get("credits") ?? "0";

  useEffect(() => {
    // Sync pro status in localStorage and fire update events
    fetch("/api/user/sync-pro")
      .then((r) => r.json())
      .then((data) => {
        if (data.isPro) localStorage.setItem("eromify_pro", "true");
        window.dispatchEvent(
          new CustomEvent("eromify_credits_updated", { detail: { credits: data.credits } })
        );
        window.dispatchEvent(new Event("eromify_pro_updated"));
      })
      .catch(() => {});
  }, []);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: "linear-gradient(160deg,#09091a 0%,#0f0f24 100%)" }}
    >
      <div className="text-center max-w-sm">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.4)" }}
        >
          <CheckCircle className="h-12 w-12" style={{ color: "#34d399" }} />
        </div>
        <h1 className="text-3xl font-black text-white mb-3">Payment Successful!</h1>
        <p className="text-white/60 text-sm mb-2">
          <strong className="text-white">{Number(credits).toLocaleString()} credits</strong> have been added to your account.
        </p>
        <p className="text-white/40 text-xs mb-8">Your Pro access is now active.</p>
        <button
          onClick={() => router.push("/")}
          className="px-8 py-3 rounded-2xl font-black text-white text-sm"
          style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)", boxShadow: "0 0 30px rgba(124,58,237,0.4)" }}
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}
