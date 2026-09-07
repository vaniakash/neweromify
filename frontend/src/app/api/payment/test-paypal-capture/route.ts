import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { orderID } = await request.json();
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!;
    const secret   = process.env.PAYPAL_SECRET!;
    const base     = "https://api-m.paypal.com";

    // 1. Get Access Token
    const tokenRes = await fetch(`${base}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString("base64")}`,
      },
      body: "grant_type=client_credentials",
    });

    if (!tokenRes.ok) {
      return NextResponse.json({ error: "Token error" }, { status: 401 });
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // 2. Capture Order
    const captureRes = await fetch(`${base}/v2/checkout/orders/${orderID}/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!captureRes.ok) {
      const err = await captureRes.text();
      return NextResponse.json({ error: `Capture error: ${err}` }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
