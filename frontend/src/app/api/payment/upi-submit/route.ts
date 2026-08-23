// ─── /api/payment/upi-submit ─────────────────────────────────────────────────
// TEMPORARY: Saves a UPI payment submission for manual verification.
// Remove this file when a proper payment gateway (Cashfree / PhonePe / PayU)
// is integrated. The "upi-submit" route will be replaced by the gateway webhook.

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { Payment } from "@/models/Payment";

// Plan metadata — mirrors the PLANS array on the pricing page
const PLAN_META: Record<string, { credits: number; planName: string }> = {
  value:   { credits: 2500,  planName: "Beginner Pack"      },
  pro:     { credits: 4000,  planName: "Creator Pack"        },
  mega:    { credits: 12000, planName: "Professional Pack"   },
  premium: { credits: 30000, planName: "Enterprise Pack"     },
};

export async function POST(req: NextRequest) {
  try {
    // ── Auth check ──────────────────────────────────────────────────────────
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorised. Please sign in." },
        { status: 401 }
      );
    }

    // ── Parse body ──────────────────────────────────────────────────────────
    const { utrId, plan, amount } = await req.json() as {
      utrId: string;
      plan:  string;
      amount: number;
    };

    if (!utrId?.trim()) {
      return NextResponse.json(
        { error: "UTR / Transaction ID is required." },
        { status: 400 }
      );
    }
    if (!plan || !PLAN_META[plan]) {
      return NextResponse.json(
        { error: "Invalid plan." },
        { status: 400 }
      );
    }
    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount." },
        { status: 400 }
      );
    }

    const meta = PLAN_META[plan];

    // ── Prevent duplicate UTR submissions ───────────────────────────────────
    await connectDB();
    const existing = await Payment.findOne({ utrId: utrId.trim() });
    if (existing) {
      return NextResponse.json(
        { error: "This UTR ID has already been submitted. Contact support if this is an error." },
        { status: 409 }
      );
    }

    // ── Save pending payment record ─────────────────────────────────────────
    // NOTE: Credits are NOT added here. Subscription is NOT activated.
    // Access is granted only after manual admin verification.
    await Payment.create({
      userId:        session.user.id  || "",
      userEmail:     session.user.email,
      utrId:         utrId.trim(),
      upiStatus:     "pending_verification",
      amount,
      currency:      "INR",
      plan,
      planName:      meta.planName,
      creditsToAdd:  meta.credits,
      paymentMethod: "upi",
      status:        "pending_verification",
    });

    return NextResponse.json({
      success: true,
      message:
        "Payment recorded successfully. Your subscription will be activated within 1 hour after verification.",
    });
  } catch (err) {
    console.error("[upi-submit] Error:", err);
    return NextResponse.json(
      { error: "Server error. Please try again or contact support." },
      { status: 500 }
    );
  }
}
