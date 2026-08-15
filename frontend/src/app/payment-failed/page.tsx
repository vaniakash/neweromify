import { Suspense } from "react";
import PaymentFailedContent from "./PaymentFailedContent";

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(160deg,#09091a 0%,#0f0f24 100%)" }}>
        <div className="text-white/40 text-sm">Loading…</div>
      </div>
    }>
      <PaymentFailedContent />
    </Suspense>
  );
}
