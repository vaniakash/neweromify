"use client";

// ─── Pricing Page ─────────────────────────────────────────────────────────────
// Payment: TEMPORARY UPI flow (pending gateway approval).
// To restore Razorpay / switch to Cashfree / PhonePe / PayU:
//   1. Delete the UpiModal component below
//   2. Delete handlePurchase and restore the Razorpay handlePurchase
//   3. Re-add <Script src="https://checkout.razorpay.com/v1/checkout.js" />
//   4. Delete /api/payment/upi-submit/route.ts

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession, signIn } from "next-auth/react";
import {
  Check, Lock, Zap, Crown, Star, Sparkles, Shield,
  ChevronDown, Flame, Layers, Video, Copy, CheckCheck,
  Smartphone, Monitor, X, type LucideIcon,
} from "lucide-react";
import QRCode from "qrcode";

/* ─── constants ──────────────────────────────────────────────────────────── */
const UPI_ID = "akashranageu@okaxis";
const UPI_NAME = "Eromify";

function buildUpiLink(amount: number, planName: string) {
  const tn = encodeURIComponent(planName);
  const pn = encodeURIComponent(UPI_NAME);
  return `upi://pay?pa=${UPI_ID}&pn=${pn}&am=${amount}&cu=INR&tn=${tn}`;
}

/* ─── plan data ─────────────────────────────────────────────────────────── */
const PLANS: {
  id: string; name: string; tagline: string;
  price: number; mrp: number; discount: number; credits: number; unitPrice: string;
  accent: string; glow: string; border: string;
  iconBg: string; icon: LucideIcon;
  badge: string | null; available: boolean;
  features: string[];
  videoAccess?: boolean;
}[] = [
    {
      id: "value", name: "Beginner Pack", tagline: "₹499 · ~$5.99",
      price: 499, mrp: 999, discount: 50, credits: 1500, unitPrice: "",
      accent: "#3b82f6", glow: "rgba(59,130,246,0.28)", border: "rgba(59,130,246,0.45)",
      iconBg: "linear-gradient(135deg,#1e3a8a,#1d4ed8)",
      icon: Star,
      badge: null, available: true,
      features: [
        "1,500 AI Credits",
        "Image generation",
        "HD quality output",
        "All art styles & models",
        "Commercial use",
        "Credits never expire",
        "NanoBanana Pro",
        "Wan 2.7 Image Pro",
        "GPT Image 2",
        "Seedream 4.5 Pro",
        "Qwen Image Plus",
      ],
    },
    {
      id: "pro", name: "Creator Pack", tagline: "₹999 · ~$11.99",
      price: 999, mrp: 1999, discount: 50, credits: 4000, unitPrice: "",
      accent: "#a855f7", glow: "rgba(168,85,247,0.3)", border: "rgba(168,85,247,0.55)",
      iconBg: "linear-gradient(135deg,#4c1d95,#6d28d9)",
      icon: Flame,
      badge: "MOST POPULAR", available: true,
      videoAccess: true,
      features: [
        "4,000 AI Credits",
        "Influencer Training",
        "Image generation",
        "🎬 Limited video generation model",
        "Workflow Canvas",
        "disabled:Motion Control",
        "Face Swap",
        "Image Upscale",
        "disabled:Video Upscale",
      ],
    },
    {
      id: "mega", name: "Professional Pack", tagline: "₹1,999 · ~$23.99",
      price: 1999, mrp: 3999, discount: 50, credits: 12000, unitPrice: "",
      accent: "#f43f5e", glow: "rgba(244,63,94,0.28)", border: "rgba(244,63,94,0.45)",
      iconBg: "linear-gradient(135deg,#881337,#be123c)",
      icon: Layers,
      badge: "MOST POPULAR", available: true,
      videoAccess: true,
      features: [
        "12,000 AI Credits",
        "Ultra HD output",
        "All art styles & models",
        "Commercial use",
        "Priority queue",
        "🎬 Video Generation Access",
        "mcp:Claude MCP AUTOMATION",
        "Wan 2.6",
        "Wan 2.2 Fast",
        "LTX-2.3",
        "Pruna P-Video",
        "Nova Reel",
        "Veo 3.1 Fast",
        "Grok Video Pro",
        "Seedance 2.0",
        "Seedance Pro-Fast",
        "Seedance Lite",
      ],
    },
    {
      id: "premium", name: "Enterprise Pack", tagline: "₹3,999 · ~$47.99",
      price: 3999, mrp: 7999, discount: 50, credits: 30000, unitPrice: "",
      accent: "#eab308", glow: "rgba(234,179,8,0.3)", border: "rgba(234,179,8,0.55)",
      iconBg: "linear-gradient(135deg,#a16207,#ca8a04)",
      icon: Sparkles,
      badge: "ULTIMATE", available: true,
      videoAccess: true,
      features: [
        "30,000 AI Credits",
        "Influencer Training",
        "Image generation",
        "🎬 Video generation",
        "mcp:Claude MCP AUTOMATION",
        "Workflow Canvas",
        "Motion Control",
        "Face Swap",
        "Image Upscale",
        "Video Upscale",
        "Nano Banana 2",
        "Z-image Turbo",
        "Kling Image O3",
        "GPT Image 2",
        "Seedream 4.5",
        "Kling 2.6 Pro",
        "Kling 3.0 Pro",
        "4K",
        "SeedVR Upscale 4K",
        "Seedance 2.0"
      ],
    },
  ];

/* ─── animated counter ──────────────────────────────────────────────────── */
function Counter({ value, prefix = "" }: { value: number; prefix?: string }) {
  const [display, setDisplay] = useState(0);
  const raf = useRef<number>(0);
  useEffect(() => {
    const start = performance.now();
    const duration = 700;
    const animate = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.floor(ease * value));
      if (t < 1) raf.current = requestAnimationFrame(animate);
    };
    raf.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf.current);
  }, [value]);
  return <>{prefix}{display}</>;
}

/* ─── UPI Modal ─────────────────────────────────────────────────────────── */
// TEMPORARY — remove this entire component when proper payment gateway is live
interface UpiModalProps {
  plan: (typeof PLANS)[0];
  onClose: () => void;
  onSuccess: (planName: string, credits: number) => void;
  userEmail: string;
  userId: string;
}

function UpiModal({ plan, onClose, onSuccess, userEmail, userId }: UpiModalProps) {
  const upiLink = buildUpiLink(plan.price, plan.name);

  const [isMobile, setIsMobile] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [showUtroStep, setShowUtrStep] = useState(false);
  const [utrValue, setUtrValue] = useState("");
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Detect mobile
  useEffect(() => {
    const mobile =
      /android|iphone|ipad|ipod|windows phone/i.test(navigator.userAgent) ||
      window.innerWidth < 768;
    setIsMobile(mobile);
  }, []);

  // Generate QR code locally using the qrcode package
  useEffect(() => {
    if (isMobile) return;
    QRCode.toDataURL(upiLink, {
      width: 240,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
      errorCorrectionLevel: "M",
    }).then(setQrDataUrl).catch(console.error);
  }, [isMobile, upiLink]);

  const copyUpiId = () => {
    navigator.clipboard.writeText(UPI_ID).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleUpiPay = () => {
    window.location.href = upiLink;
    // Show UTR step after a short delay so user can switch back
    setTimeout(() => setShowUtrStep(true), 1500);
  };

  const handleSubmitUtr = useCallback(async () => {
    if (!utrValue.trim()) {
      setSubmitError("Please enter your UTR / Transaction ID.");
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/payment/upi-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          utrId: utrValue.trim(),
          plan: plan.id,
          amount: plan.price,
          userEmail,
          userId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed.");
      setSubmitted(true);
      setTimeout(() => onSuccess(plan.name, plan.credits), 2500);
    } catch (err: any) {
      setSubmitError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [utrValue, plan, userEmail, userId, onSuccess]);

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-md rounded-3xl overflow-hidden"
        style={{
          background: "linear-gradient(160deg,#0e0e22 0%,#131330 100%)",
          border: `1px solid ${plan.border}`,
          boxShadow: `0 0 0 1px ${plan.border}, 0 30px 80px ${plan.glow}, inset 0 1px 0 rgba(255,255,255,0.06)`,
        }}
      >
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background: `linear-gradient(90deg,transparent,${plan.accent},transparent)` }} />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-white/10"
          style={{ color: "rgba(255,255,255,0.5)" }}
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-7">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: plan.iconBg }}>
                <plan.icon className="w-4 h-4" style={{ color: plan.accent }} />
              </div>
              <span className="text-sm font-bold" style={{ color: "rgba(255,255,255,0.5)" }}>
                Pay for
              </span>
            </div>
            <h2 className="text-2xl font-black text-white">{plan.name}</h2>
            <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
              {plan.credits.toLocaleString()} credits · one-time payment
            </p>
          </div>

          {/* Amount pill */}
          <div className="flex items-center justify-between mb-6 px-4 py-3 rounded-2xl"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <span className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.5)" }}>
              Amount to pay
            </span>
            <span className="text-2xl font-black text-white">₹{plan.price.toLocaleString()}</span>
          </div>

          {/* ── Success state ── */}
          {submitted ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.4)" }}>
                <CheckCheck className="w-8 h-8" style={{ color: "#34d399" }} />
              </div>
              <h3 className="text-xl font-black text-white mb-2">Payment Submitted!</h3>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
                Your UTR has been recorded. Your subscription will be activated
                within <strong className="text-white">1 hour</strong> after verification.
              </p>
            </div>
          ) : (
            <>
              {/* ── Mobile: UPI deep link ── */}
              {isMobile ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Smartphone className="w-4 h-4" style={{ color: plan.accent }} />
                    <span className="text-xs font-bold uppercase tracking-widest"
                      style={{ color: "rgba(255,255,255,0.4)" }}>
                      Mobile Payment
                    </span>
                  </div>
                  <button
                    onClick={handleUpiPay}
                    className="w-full py-4 rounded-2xl font-black text-white text-base flex items-center justify-center gap-2 transition-all hover:brightness-110 hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      background: `linear-gradient(135deg,${plan.accent}cc,${plan.accent})`,
                      boxShadow: `0 0 30px ${plan.glow}`,
                    }}
                  >
                    <Smartphone className="w-5 h-5" />
                    Pay ₹{plan.price.toLocaleString()} with UPI
                  </button>
                  <p className="text-[11px] text-center" style={{ color: "rgba(255,255,255,0.3)" }}>
                    Opens Google Pay · PhonePe · Paytm · BHIM or any UPI app
                  </p>

                  {/* After tapping Pay, show UTR step */}
                  {!showUtroStep && (
                    <button
                      onClick={() => setShowUtrStep(true)}
                      className="w-full py-2.5 rounded-xl text-sm font-semibold transition-colors hover:bg-white/5"
                      style={{ color: "rgba(255,255,255,0.4)", border: "1px dashed rgba(255,255,255,0.12)" }}
                    >
                      Already paid? Enter Transaction ID →
                    </button>
                  )}
                </div>
              ) : (
                /* ── Desktop: QR code ── */
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Monitor className="w-4 h-4" style={{ color: plan.accent }} />
                    <span className="text-xs font-bold uppercase tracking-widest"
                      style={{ color: "rgba(255,255,255,0.4)" }}>
                      Scan &amp; Pay
                    </span>
                  </div>

                  {/* QR code */}
                  <div className="flex justify-center">
                    <div className="p-4 rounded-2xl" style={{ background: "#fff", display: "inline-block" }}>
                      {qrDataUrl ? (
                        <img
                          src={qrDataUrl}
                          alt={`UPI QR code for ${plan.name}`}
                          width={200}
                          height={200}
                          className="block"
                        />
                      ) : (
                        <div className="w-[200px] h-[200px] flex items-center justify-center"
                          style={{ color: "#888" }}>
                          <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-center" style={{ color: "rgba(255,255,255,0.4)" }}>
                    Scan with Google Pay · PhonePe · Paytm · BHIM or any UPI app
                  </p>

                  {/* UPI ID row */}
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <span className="flex-1 text-sm font-mono font-bold text-white">{UPI_ID}</span>
                    <button
                      onClick={copyUpiId}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105 active:scale-95"
                      style={{
                        background: copied ? "rgba(16,185,129,0.2)" : `rgba(255,255,255,0.08)`,
                        color: copied ? "#34d399" : "rgba(255,255,255,0.7)",
                        border: copied ? "1px solid rgba(16,185,129,0.4)" : "1px solid rgba(255,255,255,0.12)",
                      }}
                    >
                      {copied ? <CheckCheck className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copied ? "Copied!" : "Copy UPI ID"}
                    </button>
                  </div>

                  {/* Show UTR step on desktop */}
                  {!showUtroStep && (
                    <button
                      onClick={() => setShowUtrStep(true)}
                      className="w-full py-2.5 rounded-xl text-sm font-semibold transition-colors hover:bg-white/5"
                      style={{ color: "rgba(255,255,255,0.4)", border: "1px dashed rgba(255,255,255,0.12)" }}
                    >
                      Paid? Enter Transaction ID →
                    </button>
                  )}
                </div>
              )}

              {/* ── UTR Submission step (shared mobile + desktop) ── */}
              {showUtroStep && (
                <div className="mt-5 pt-5 space-y-3"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                  <p className="text-sm font-bold text-white">Enter your UTR / Transaction ID</p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                    Find it in your UPI app under payment history. Example: <span className="font-mono">427812345678</span>
                  </p>
                  <input
                    id="utr-input"
                    type="text"
                    value={utrValue}
                    onChange={(e) => setUtrValue(e.target.value)}
                    placeholder="e.g. 427812345678"
                    className="w-full px-4 py-3 rounded-xl text-sm font-mono text-white outline-none transition-all"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: `1px solid ${submitError ? "rgba(239,68,68,0.6)" : "rgba(255,255,255,0.12)"}`,
                    }}
                    onFocus={(e) =>
                      (e.target.style.border = `1px solid ${plan.accent}88`)
                    }
                    onBlur={(e) =>
                      (e.target.style.border = `1px solid ${submitError ? "rgba(239,68,68,0.6)" : "rgba(255,255,255,0.12)"}`)
                    }
                    autoFocus
                  />
                  {submitError && (
                    <p className="text-xs" style={{ color: "#f87171" }}>{submitError}</p>
                  )}
                  <button
                    id="ive-paid-btn"
                    onClick={handleSubmitUtr}
                    disabled={submitting || !utrValue.trim()}
                    className="w-full py-3.5 rounded-2xl font-black text-white text-sm flex items-center justify-center gap-2 transition-all hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                    style={{
                      background: `linear-gradient(135deg,${plan.accent}cc,${plan.accent})`,
                      boxShadow: `0 0 25px ${plan.glow}`,
                    }}
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Verifying…
                      </>
                    ) : (
                      <>
                        <CheckCheck className="w-4 h-4" />
                        I&apos;ve Paid — Submit
                      </>
                    )}
                  </button>
                  <p className="text-[11px] text-center" style={{ color: "rgba(255,255,255,0.3)" }}>
                    ⚡ Your subscription will be activated within 1 hour after verification
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── main component ────────────────────────────────────────────────────── */
export default function PricingPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [visible, setVisible] = useState(false);
  const [stars, setStars] = useState<{ w: number; h: number; top: number; left: number; dur: number; delay: number }[]>([]);

  // UPI modal state
  const [upiPlan, setUpiPlan] = useState<(typeof PLANS)[0] | null>(null);

  useEffect(() => { setTimeout(() => setVisible(true), 80); }, []);

  useEffect(() => {
    setStars(
      Array.from({ length: 24 }, () => ({
        w: Math.random() * 2 + 1,
        h: Math.random() * 2 + 1,
        top: Math.random() * 100,
        left: Math.random() * 100,
        dur: 2 + Math.random() * 3,
        delay: Math.random() * 2,
      }))
    );
  }, []);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 5000);
  };

  // ── TEMPORARY: UPI checkout — replace with gateway handler when approved ──
  const handlePurchase = (plan: (typeof PLANS)[0]) => {
    if (!plan.available) return;
    if (status === "unauthenticated") { signIn("google"); return; }
    setUpiPlan(plan);
  };

  const handleUpiSuccess = (planName: string, credits: number) => {
    setUpiPlan(null);
    showToast(
      `✅ Payment submitted! Your ${planName} (${credits.toLocaleString()} credits) will be activated within 1 hour.`,
      true
    );
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        .pricing-root *{font-family:'Inter',sans-serif}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
        @keyframes pulse-ring{0%{transform:scale(1);opacity:0.6}70%{transform:scale(1.4);opacity:0}100%{transform:scale(1.4);opacity:0}}
        @keyframes shimmer{0%{background-position:200% center}100%{background-position:-200% center}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin-slow{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes glow-pulse{0%,100%{opacity:0.5}50%{opacity:1}}
        @keyframes badge-pop{0%{transform:scale(0.7);opacity:0}100%{transform:scale(1);opacity:1}}
        .card-enter{animation:fadeUp 0.55s cubic-bezier(.22,1,.36,1) both}
        .card-enter:nth-child(1){animation-delay:0.05s}
        .card-enter:nth-child(2){animation-delay:0.18s}
        .card-enter:nth-child(3){animation-delay:0.31s}
        .card-enter:nth-child(4){animation-delay:0.44s}
        .plan-card{transition:transform 0.3s cubic-bezier(.22,1,.36,1),box-shadow 0.3s ease}
        .plan-card.available:hover{transform:translateY(-6px)}
        .shimmer-text{
          background:linear-gradient(90deg,#fff 0%,#a78bfa 40%,#fff 60%,#fff 100%);
          background-size:200% auto;
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
          animation:shimmer 3s linear infinite
        }
        @keyframes strike-in{from{width:0}to{width:100%}}
        @keyframes price-pop{0%{transform:scale(0.7);opacity:0}80%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}
        @keyframes discount-bounce{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-3px) rotate(-2deg)}}
        .badge-pop{animation:badge-pop 0.4s cubic-bezier(.34,1.56,.64,1) both}
        .float-orb{animation:float 6s ease-in-out infinite}
        .glow-ring{animation:pulse-ring 2.5s ease-out infinite}
        @keyframes mega-pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 1px rgba(244,63,94,0.45), 0 20px 60px rgba(244,63,94,0.28); }
          50% { transform: scale(1.02); box-shadow: 0 0 0 2px rgba(244,63,94,0.7), 0 25px 70px rgba(244,63,94,0.4); }
        }
        .mega-special {
          animation: mega-pulse 3s infinite ease-in-out;
          z-index: 10;
        }
        .spin-slow{animation:spin-slow 20s linear infinite}
        .check-icon{transition:transform 0.2s ease}
        .plan-card.available:hover .check-icon{transform:scale(1.15)}
        .locked-shimmer{
          background:linear-gradient(90deg,transparent 20%,rgba(255,255,255,0.04) 50%,transparent 80%);
          background-size:200% 100%;animation:shimmer 2.5s linear infinite
        }
        .toast-enter{animation:fadeUp 0.35s ease both}
        .mrp-line{position:relative;display:inline-block}
        .mrp-line::after{
          content:"";position:absolute;left:0;top:50%;height:2px;
          background:rgba(239,68,68,0.7);border-radius:2px;
          animation:strike-in 0.5s 0.3s ease both;
          width:100%
        }
        .price-pop{animation:price-pop 0.5s 0.15s cubic-bezier(.34,1.56,.64,1) both}
        .discount-badge{animation:discount-bounce 2s 0.8s ease-in-out infinite}
      `}</style>

      {/* ── UPI Modal (TEMPORARY) ── */}
      {upiPlan && (
        <UpiModal
          plan={upiPlan}
          onClose={() => { setUpiPlan(null); setLoading(null); }}
          onSuccess={handleUpiSuccess}
          userEmail={session?.user?.email || ""}
          userId={(session?.user as any)?.id || ""}
        />
      )}

      <div className="pricing-root min-h-screen w-full relative overflow-hidden" style={{ background: "linear-gradient(135deg,#060610 0%,#0a0a1c 50%,#07071a 100%)" }}>

        {/* ── Background mesh ── */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="float-orb absolute top-[-100px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full" style={{ background: "radial-gradient(circle,rgba(124,58,237,0.12) 0%,transparent 65%)", filter: "blur(60px)" }} />
          <div className="absolute bottom-[-120px] left-[10%] w-[500px] h-[500px] rounded-full" style={{ background: "radial-gradient(circle,rgba(34,197,94,0.08) 0%,transparent 65%)", filter: "blur(50px)" }} />
          <div className="absolute top-1/2 right-[-100px] w-[400px] h-[400px] rounded-full" style={{ background: "radial-gradient(circle,rgba(59,130,246,0.07) 0%,transparent 65%)", filter: "blur(60px)" }} />
          {/* grid */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
          {/* stars — client only to avoid hydration mismatch */}
          {stars.map((s, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${s.w}px`,
                height: `${s.h}px`,
                top: `${s.top}%`,
                left: `${s.left}%`,
                background: "rgba(255,255,255,0.5)",
                animation: `glow-pulse ${s.dur}s ease-in-out ${s.delay}s infinite`,
              }}
            />
          ))}
        </div>

        {/* ── Toast ── */}
        {toast && (
          <div className="toast-enter fixed top-6 right-6 z-[9999] px-5 py-4 rounded-2xl text-sm font-semibold shadow-2xl border max-w-sm" style={{ background: toast.ok ? "rgba(21,128,61,0.95)" : "rgba(185,28,28,0.95)", borderColor: toast.ok ? "rgba(34,197,94,0.4)" : "rgba(239,68,68,0.4)", color: "#fff", backdropFilter: "blur(12px)" }}>
            {toast.msg}
          </div>
        )}

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

          {/* ── Header ── */}
          <div className={`text-center mb-16 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold mb-6 border" style={{ background: "rgba(168,85,247,0.08)", borderColor: "rgba(168,85,247,0.25)", color: "#c084fc" }}>
              <Sparkles className="h-3 w-3" />
              TRANSPARENT PRICING · NO SUBSCRIPTIONS
            </div>
            <h1 className="text-5xl md:text-6xl font-black mb-5 tracking-tight leading-none">
              <span className="shimmer-text">Pick your plan</span>
            </h1>
            <p className="text-lg md:text-xl max-w-lg mx-auto font-medium" style={{ color: "rgba(255,255,255,0.45)" }}>
              One-time payments. Credits never expire. No recurring charges.
            </p>

            {/* Stats row */}
            <div className="flex flex-wrap justify-center gap-8 mt-10">
              {[{ val: 393, label: "Creators", suffix: "+" }, { val: 10000, label: "Images Generated", suffix: "+" }, { val: 100, label: "Satisfaction", suffix: "%" }].map(({ val, label, suffix }) => (
                <div key={label} className="text-center">
                  <div className="text-3xl font-black text-white">
                    {visible && <Counter value={val} />}{suffix}
                  </div>
                  <div className="text-xs font-semibold mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Cards ── */}
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start max-w-7xl mx-auto ${visible ? "" : "opacity-0"}`}>
            {PLANS.map((plan) => {
              const isLoading = loading === plan.id;
              return (
                <div
                  key={plan.id}
                  className={`card-enter plan-card ${plan.available ? "available" : ""} ${plan.id === "mega" ? "mega-special" : ""} relative rounded-3xl flex flex-col overflow-hidden`}
                  style={{
                    background: plan.available ? "linear-gradient(160deg,#0e0e20 0%,#131328 100%)" : "rgba(255,255,255,0.015)",
                    border: `1px solid ${plan.border}`,
                    boxShadow: plan.available ? `0 0 0 1px ${plan.border}, 0 20px 60px ${plan.glow}, inset 0 1px 0 rgba(255,255,255,0.05)` : "none",
                  }}
                >
                  {/* Top glow line */}
                  {plan.available && (
                    <div className="absolute top-0 left-0 right-0 h-[1px]" style={{ background: `linear-gradient(90deg,transparent,${plan.accent},transparent)` }} />
                  )}

                  {/* Popular glow ring */}
                  {plan.id === "pro" && (
                    <div className="glow-ring absolute -inset-px rounded-3xl pointer-events-none" style={{ border: `1px solid ${plan.accent}`, borderRadius: "inherit" }} />
                  )}

                  {/* Badge */}
                  {plan.badge && (
                    <div className="absolute top-4 right-4 badge-pop">
                      <span
                        className="text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest"
                        style={{
                          background:
                            plan.id === "value" ? "rgba(59,130,246,0.2)"
                              : plan.id === "mega" ? "rgba(244,63,94,0.2)"
                                : plan.id === "premium" ? "rgba(234,179,8,0.2)"
                                  : "rgba(168,85,247,0.2)",
                          color:
                            plan.id === "value" ? "#93c5fd"
                              : plan.id === "mega" ? "#fda4af"
                                : plan.id === "premium" ? "#fef08a"
                                  : "#c084fc",
                          border:
                            plan.id === "value" ? "1px solid rgba(59,130,246,0.35)"
                              : plan.id === "mega" ? "1px solid rgba(244,63,94,0.35)"
                                : plan.id === "premium" ? "1px solid rgba(234,179,8,0.35)"
                                  : "1px solid rgba(168,85,247,0.35)",
                        }}
                      >
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  <div className="p-7 flex flex-col flex-1">
                    {/* Icon + Name */}
                    <div className="mb-6">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
                        style={{
                          background: plan.available ? plan.iconBg : "rgba(31,41,55,0.6)",
                          boxShadow: plan.available ? `0 0 20px ${plan.glow}` : "none",
                        }}
                      >
                        <plan.icon
                          className="h-6 w-6"
                          style={{ color: plan.available ? plan.accent : "#4b5563" }}
                        />
                      </div>
                      <h2 className="text-xl font-black" style={{ color: plan.available ? "#fff" : "#374151" }}>{plan.name}</h2>
                      <p className="text-xs font-semibold mt-0.5" style={{ color: plan.available ? "rgba(255,255,255,0.4)" : "#374151" }}>{plan.tagline}</p>
                    </div>

                    {/* Price */}
                    <div className="mb-6">
                      {/* MRP crossed out + discount badge */}
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="mrp-line text-sm font-bold tabular-nums"
                          style={{ color: "rgba(255,255,255,0.3)" }}
                        >
                          ₹{plan.mrp}
                        </span>
                        <span
                          className="discount-badge inline-flex items-center gap-0.5 text-[11px] font-black px-2 py-0.5 rounded-full"
                          style={{
                            background: "linear-gradient(135deg,#dc2626,#f43f5e)",
                            color: "#fff",
                            boxShadow: "0 0 10px rgba(244,63,94,0.5)",
                            transform: "rotate(-2deg)",
                          }}
                        >
                          ↓{plan.discount}% OFF
                        </span>
                      </div>

                      {/* Actual price */}
                      <div className="flex items-baseline gap-1 mb-2">
                        <span className="text-lg font-bold" style={{ color: "rgba(255,255,255,0.5)" }}>₹</span>
                        <span
                          className="price-pop text-6xl font-black tabular-nums leading-none"
                          style={{ color: "#fff" }}
                        >
                          {visible ? <Counter value={plan.price} /> : plan.price}
                        </span>
                        <span className="text-xs font-semibold ml-1 mb-1 self-end" style={{ color: "rgba(255,255,255,0.35)" }}>one-time</span>
                      </div>

                      <div
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                        style={{
                          background:
                            plan.id === "value" ? "rgba(59,130,246,0.12)"
                              : plan.id === "pro" ? "rgba(168,85,247,0.12)"
                                : plan.id === "mega" ? "rgba(244,63,94,0.12)"
                                  : "rgba(234,179,8,0.12)",
                          color: plan.accent,
                        }}
                      >
                        <Zap className="h-3 w-3" />
                        {plan.credits.toLocaleString()} credits
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="mb-5 h-px" style={{ background: plan.available ? `linear-gradient(90deg,${plan.border},transparent)` : "rgba(107,114,128,0.1)" }} />

                    {/* Features */}
                    <ul className="space-y-3 mb-8 flex-1">
                      {plan.features.map((feat) => {
                        const isDisabled = feat.startsWith("disabled:");
                        const isMcp = feat.startsWith("mcp:");
                        const cleanFeat = feat.replace("disabled:", "").replace("🎬 ", "").replace("mcp:", "");

                        return (
                          <li key={feat} className={`flex items-center gap-3 ${isDisabled ? "opacity-50" : ""}`}>
                            <div
                              className="check-icon w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                              style={{
                                background: isDisabled ? "rgba(255,255,255,0.05)" : (
                                  plan.id === "value" ? "rgba(59,130,246,0.15)"
                                    : plan.id === "pro" ? "rgba(168,85,247,0.15)"
                                      : plan.id === "mega" ? "rgba(244,63,94,0.15)"
                                        : "rgba(234,179,8,0.15)"
                                ),
                              }}
                            >
                              {isDisabled ? (
                                <Lock className="h-3 w-3" style={{ color: "rgba(255,255,255,0.3)" }} />
                              ) : isMcp ? (
                                <img src="/claude-color.webp" alt="Claude" className="w-3 h-3 object-contain" />
                              ) : feat.includes("🎬") ? (
                                <Video className="h-3 w-3" style={{ color: plan.accent }} />
                              ) : (
                                <Check className="h-3 w-3" style={{ color: plan.accent }} />
                              )}
                            </div>
                            <span className="text-sm font-medium" style={{ color: isDisabled ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.75)" }}>{cleanFeat}</span>
                          </li>
                        );
                      })}
                    </ul>

                    {/* CTA */}
                    <button
                      id={`plan-btn-${plan.id}`}
                      onClick={() => handlePurchase(plan)}
                      disabled={!!isLoading}
                      className="w-full py-4 rounded-2xl font-black text-white text-sm flex items-center justify-center gap-2 transition-all duration-200 hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{
                        background:
                          plan.id === "value" ? "linear-gradient(135deg,#1d4ed8,#3b82f6)"
                            : plan.id === "pro" ? "linear-gradient(135deg,#7c3aed,#a855f7)"
                              : plan.id === "mega" ? "linear-gradient(135deg,#be123c,#f43f5e)"
                                : "linear-gradient(135deg,#a16207,#ca8a04)",
                        boxShadow: `0 0 25px ${plan.glow}`,
                      }}
                    >
                      {plan.id === "value" ? <Star className="h-4 w-4" /> : plan.id === "pro" ? <Crown className="h-4 w-4" /> : plan.id === "mega" ? <Layers className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                      Get {plan.name}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Trust strip ── */}
          <div className={`mt-14 flex flex-wrap justify-center gap-6 transition-all duration-700 delay-300 ${visible ? "opacity-100" : "opacity-0"}`}>
            {[
              { icon: Shield, label: "Secure UPI Payment" },
              { icon: Zap, label: "Activated within 1 hour" },
              { icon: Star, label: "24-hr refund guarantee" },
              { icon: Check, label: "Credits never expire" },
            ].map(({ icon: Ic, label }) => (
              <div key={label} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}>
                <Ic className="h-3.5 w-3.5" style={{ color: "rgba(255,255,255,0.3)" }} />
                <span className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.35)" }}>{label}</span>
              </div>
            ))}
          </div>

          {/* ── UPI notice banner ── */}
          <div className={`mt-6 flex justify-center transition-all duration-700 delay-300 ${visible ? "opacity-100" : "opacity-0"}`}>
            <p className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border shadow-lg"
              style={{ background: "rgba(99,102,241,0.08)", borderColor: "rgba(99,102,241,0.25)", color: "#a5b4fc", boxShadow: "0 4px 20px rgba(99,102,241,0.05)" }}>
              <span className="text-lg">⚡</span>
              <span>
                <strong className="text-white tracking-wide">Payment via UPI.</strong>{" "}
                Your subscription will be automatically approved within{" "}
                <strong className="text-white">1 hour</strong> after payment verification.
              </span>
            </p>
          </div>

          <div className={`mt-4 flex justify-center transition-all duration-700 delay-300 ${visible ? "opacity-100" : "opacity-0"}`}>
            <p className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border shadow-lg" style={{ background: "rgba(16,185,129,0.08)", borderColor: "rgba(16,185,129,0.25)", color: "#34d399", boxShadow: "0 4px 20px rgba(16,185,129,0.05)" }}>
              <span className="text-lg">💡</span>
              <span><strong className="text-white tracking-wide">Note:</strong> There is no monthly limit. These credits will last until you use all of them.</span>
            </p>
          </div>

          {/* ── How Credits Work ── */}
          <div className={`mt-24 max-w-4xl mx-auto transition-all duration-700 delay-350 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold mb-4 border" style={{ background: "rgba(99,102,241,0.08)", borderColor: "rgba(99,102,241,0.25)", color: "#a5b4fc" }}>
                <Zap className="h-3 w-3" />
                TRANSPARENT CREDIT SYSTEM
              </div>
              <h2 className="text-3xl font-black text-white mb-3">How We Calculate Credits</h2>
              <p className="text-sm max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.4)" }}>
                Simple, transparent, no hidden fees. Here&apos;s exactly how your credits are spent.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Left: What costs what */}
              <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="px-6 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
                  <p className="text-xs font-black uppercase tracking-widest" style={{ color: "rgba(165,180,252,0.8)" }}>Credit Cost Per Action</p>
                </div>
                <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                  {[
                    { action: "🖼️ Text-to-Image", cost: "100 credits", display: "= 1 credit shown", color: "#a78bfa" },
                    { action: "✏️ AI Image Edit", cost: "100 credits", display: "= 1 credit shown", color: "#60a5fa" },
                    { action: "🎬 Video Generation", cost: "1,500 credits", display: "= 15 credits shown", color: "#f472b6" },
                    { action: "🎭 AI Influencer", cost: "100 credits", display: "= 1 credit shown", color: "#34d399" },
                  ].map(({ action, cost, display, color }) => (
                    <div key={action} className="flex items-center justify-between px-6 py-4">
                      <span className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.75)" }}>{action}</span>
                      <div className="text-right">
                        <span className="text-sm font-black tabular-nums" style={{ color }}>{cost}</span>
                        <p className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>{display}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Pack value breakdown */}
              <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="px-6 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
                  <p className="text-xs font-black uppercase tracking-widest" style={{ color: "rgba(165,180,252,0.8)" }}>What You Get Per Pack</p>
                </div>
                <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                  {[
                    { pack: "Beginner Pack ₹499", internal: "1,500 credits", images: "15 images", videos: "—", color: "#60a5fa" },
                    { pack: "Creator Pack ₹999", internal: "4,000 credits", images: "40 images", videos: "2 videos", color: "#c084fc" },
                    { pack: "Professional Pack ₹1,999", internal: "12,000 credits", images: "120 images", videos: "8 videos", color: "#f87171" },
                    { pack: "Enterprise Pack ₹3,999", internal: "30,000 credits", images: "300 images", videos: "20 videos", color: "#facc15" },
                  ].map(({ pack, internal, images, videos, color }) => (
                    <div key={pack} className="px-6 py-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-black" style={{ color }}>{pack}</span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full tabular-nums" style={{ background: `${color}18`, color, border: `1px solid ${color}35` }}>{internal}</span>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex items-center gap-1.5">
                          <span className="text-lg">🖼️</span>
                          <span className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.5)" }}>{images}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-lg">🎬</span>
                          <span className="text-xs font-semibold" style={{ color: videos === "—" ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.5)" }}>{videos === "—" ? "No video access" : videos}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Formula note */}
                <div className="px-6 py-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(99,102,241,0.05)" }}>
                  <p className="text-[11px] leading-relaxed" style={{ color: "rgba(165,180,252,0.7)" }}>
                    <span className="font-black text-indigo-300">Formula:</span> Your balance shown ÷ 100 = images available. Credits deduct in the background — you always see a clean number.
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* ── FAQ ── */}
          <div className={`mt-24 max-w-2xl mx-auto transition-all duration-700 delay-400 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <h2 className="text-3xl font-black text-white text-center mb-2">Questions? Answered.</h2>
            <p className="text-center text-sm mb-10" style={{ color: "rgba(255,255,255,0.35)" }}>Everything you need to know before buying.</p>
            <div className="space-y-3">
              {[
                { q: "What are credits?", a: "Each 100 credits = 1 AI image generation, or 1,500 credits = 1 video generation. Credits are added within 1 hour after payment verification." },
                { q: "Do credits expire?", a: "Never. Once purchased, your credits stay on your account forever." },
                { q: "Can I get a refund?", a: "Yes — 24-hour no-questions-asked refund policy. Contact support within 24 hours." },
                { q: "What payment methods work?", a: "We currently accept UPI payments (Google Pay, PhonePe, Paytm, BHIM, and all UPI apps). More payment options coming soon." },
                { q: "How long does activation take?", a: "Your subscription is activated within 1 hour after your UTR/Transaction ID is verified by our team." },
                { q: "Which plans include video generation?", a: "Creator Pack (₹999), Professional Pack (₹1,999), and Enterprise Pack (₹3,999) include video generation access. Each video costs 1,500 credits." },
              ].map(({ q, a }, i) => (
                <details key={i} className="group rounded-2xl border overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}>
                  <summary className="flex items-center justify-between px-6 py-4 text-sm font-bold text-white list-none cursor-pointer select-none hover:bg-white/[0.02] transition-colors">
                    {q}
                    <ChevronDown className="h-4 w-4 transition-transform duration-300 group-open:rotate-180" style={{ color: "rgba(255,255,255,0.35)" }} />
                  </summary>
                  <p className="px-6 pb-5 text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>{a}</p>
                </details>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
