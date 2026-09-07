import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Payment } from "@/models/Payment";

// ── USD price table (server-side only, not derived from INR conversion) ────────
const USD_TIERS: Record<string, { priceUSD: number; credits: number; planName: string }> = {
  value:   { priceUSD: 4.99,  credits: 2500,  planName: "Beginner Pack" },
  pro:     { priceUSD: 9.99,  credits: 4000,  planName: "Creator Pack" },
  mega:    { priceUSD: 19.99, credits: 12000, planName: "Professional Pack" },
  premium: { priceUSD: 39.99, credits: 30000, planName: "Enterprise Pack" },
};

// ── PayPal OAuth2 token ────────────────────────────────────────────────────────
async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!;
  const secret   = process.env.PAYPAL_SECRET!;
  const base     = "https://api-m.paypal.com"; // Force live mode

  const res = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`PayPal token error: ${err}`);
  }

  const data = await res.json();
  return data.access_token as string;
}

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      packId    = "value",
      userEmail = "",
      userId    = "",
      userName  = "User",
    } = body;

    if (!userEmail) {
      return NextResponse.json({ error: "Please sign in to continue" }, { status: 401 });
    }

    // ── Backend region guard ───────────────────────────────────────────────────
    // Dev override support
    let country: string | null =
      request.headers.get("x-vercel-ip-country") ||
      request.headers.get("cf-ipcountry") ||
      null;

    if (process.env.NODE_ENV === "development") {
      const url      = new URL(request.url);
      const override = url.searchParams.get("country");
      if (override) country = override.toUpperCase();
    }

    if (country === "IN") {
      return NextResponse.json(
        { error: "Indian users should use PayU. Please refresh the page." },
        { status: 400 }
      );
    }
    if (!country) {
      return NextResponse.json(
        { error: "Could not determine your region. Please try again or contact support." },
        { status: 400 }
      );
    }

    // ── Resolve pricing ────────────────────────────────────────────────────────
    const tier = USD_TIERS[packId as string] ?? USD_TIERS.value;
    const { priceUSD, credits, planName } = tier;

    // ── Get PayPal access token ────────────────────────────────────────────────
    const accessToken = await getPayPalAccessToken();
    const base        = process.env.PAYPAL_BASE_URL ?? "https://api-m.paypal.com";
    const baseUrl     = process.env.NEXTAUTH_URL    ?? "https://www.eromify.in";

    // ── Create PayPal order ────────────────────────────────────────────────────
    const orderRes = await fetch(`${base}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        Authorization:   `Bearer ${accessToken}`,
        "PayPal-Request-Id": `ero_pp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value:         priceUSD.toFixed(2),
            },
            description: planName,
          },
        ],
        application_context: {
          return_url: `${baseUrl}/payment-success`,
          cancel_url: `${baseUrl}/pricing`,
          brand_name: "Eromify",
          user_action: "PAY_NOW",
        },
      }),
    });

    if (!orderRes.ok) {
      const err = await orderRes.text();
      console.error("[paypal/create-order] PayPal error:", err);
      return NextResponse.json({ error: "Failed to create PayPal order" }, { status: 500 });
    }

    const order = await orderRes.json();
    const orderID: string = order.id;

    // ── Save pending Payment record ────────────────────────────────────────────
    await Payment.create({
      userId:        userId || null,
      userEmail:     userEmail,
      paypalOrderId: orderID,
      amount:        priceUSD,
      currency:      "USD",
      status:        "created",
      plan:          packId,
      planName,
      creditsToAdd:  credits,
      paymentMethod: "paypal",
    });

    console.log(`[paypal/create-order] orderID:${orderID} plan:${packId} amount:${priceUSD} user:${userEmail}`);

    return NextResponse.json({ orderID });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[paypal/create-order] error:", msg);
    return NextResponse.json({ error: "Failed to create PayPal order", detail: msg }, { status: 500 });
  }
}
