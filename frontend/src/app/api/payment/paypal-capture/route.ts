import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Payment } from "@/models/Payment";
import { User } from "@/models/User";

async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!;
  const secret   = process.env.PAYPAL_SECRET!;
  const base     = process.env.PAYPAL_BASE_URL ?? "https://api-m.paypal.com";

  const res = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) throw new Error(`PayPal token error: ${await res.text()}`);
  const data = await res.json();
  return data.access_token as string;
}

export async function POST(request: Request) {
  const baseUrl = process.env.NEXTAUTH_URL ?? "https://www.eromify.in";

  try {
    await connectDB();

    const { orderID, userEmail } = await request.json();

    if (!orderID || !userEmail) {
      return NextResponse.json({ error: "Missing orderID or userEmail" }, { status: 400 });
    }

    // ── Idempotency check — same pattern as PayU verify ────────────────────────
    const existingPayment = await Payment.findOne({ paypalOrderId: orderID });

    if (!existingPayment) {
      console.error("[paypal/capture] Payment record not found for orderID:", orderID);
      return NextResponse.redirect(new URL("/payment-failed?reason=record_not_found", baseUrl));
    }

    if (existingPayment.status === "paid") {
      console.log(`[paypal/capture] Order ${orderID} already processed, skipping.`);
      return NextResponse.json({
        success: true,
        credits: existingPayment.creditsToAdd ?? 0,
      });
    }

    // ── Capture the PayPal order ───────────────────────────────────────────────
    const accessToken = await getPayPalAccessToken();
    const base        = process.env.PAYPAL_BASE_URL ?? "https://api-m.paypal.com";

    const captureRes = await fetch(`${base}/v2/checkout/orders/${orderID}/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:  `Bearer ${accessToken}`,
      },
    });

    if (!captureRes.ok) {
      const err = await captureRes.text();
      console.error("[paypal/capture] PayPal capture error:", err);
      return NextResponse.json({ error: "PayPal capture failed", detail: err }, { status: 500 });
    }

    const captureData = await captureRes.json();
    const captureStatus: string = captureData.status;

    if (captureStatus !== "COMPLETED") {
      console.warn("[paypal/capture] Capture not completed. Status:", captureStatus);
      await Payment.findOneAndUpdate(
        { paypalOrderId: orderID },
        { status: "failed" }
      );
      return NextResponse.json({ error: "Payment not completed", status: captureStatus }, { status: 402 });
    }

    // Extract the capture ID from the response
    const captureId: string =
      captureData.purchase_units?.[0]?.payments?.captures?.[0]?.id ?? "";

    // ── Atomic update — only if not already paid (concurrency safe) ────────────
    const payment = await Payment.findOneAndUpdate(
      { paypalOrderId: orderID, status: { $ne: "paid" } },
      { status: "paid", paypalCaptureId: captureId },
      { new: true }
    );

    if (!payment) {
      // Race condition: another request already processed it
      console.log(`[paypal/capture] Race condition for ${orderID} — already paid.`);
      return NextResponse.json({
        success: true,
        credits: existingPayment.creditsToAdd ?? 0,
      });
    }

    // ── Grant credits + Pro access ─────────────────────────────────────────────
    const grantEmail = payment.userEmail ?? userEmail;
    if (grantEmail && payment.creditsToAdd) {
      const hasVideoAccess         = ["pro", "mega", "premium"].includes(payment.plan ?? "");
      const hasMcpAccess           = ["mega", "premium"].includes(payment.plan ?? "");
      const hasMotionControlAccess = ["premium"].includes(payment.plan ?? "");

      const result = await User.updateOne(
        { email: grantEmail },
        {
          $inc: { credits: payment.creditsToAdd },
          $set: {
            isPro: true,
            ...(hasVideoAccess         && { videoAccess:         true }),
            ...(hasMcpAccess           && { mcpAccess:           true }),
            ...(hasMotionControlAccess && { motionControlAccess: true }),
          },
        }
      );

      console.log(
        `[paypal/capture] credits granted → matchedCount:${result.matchedCount} ` +
        `credits:${payment.creditsToAdd} plan:${payment.plan} user:${grantEmail}`
      );
    } else if (grantEmail) {
      await User.updateOne({ email: grantEmail }, { $set: { isPro: true } });
    }

    return NextResponse.json({
      success: true,
      credits: payment.creditsToAdd ?? 0,
    });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[paypal/capture] error:", msg);
    return NextResponse.json({ error: "PayPal capture failed", detail: msg }, { status: 500 });
  }
}
