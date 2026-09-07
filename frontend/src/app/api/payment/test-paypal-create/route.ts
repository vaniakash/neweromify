import { NextResponse } from "next/server";

export async function POST() {
  try {
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!;
    const secret   = process.env.PAYPAL_SECRET!;
    const base     = "https://api-m.paypal.com"; // Force live

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
      const err = await tokenRes.text();
      return NextResponse.json({ error: `PayPal token error: ${err}` }, { status: 401 });
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // 2. Create $1 Order
    const orderRes = await fetch(`${base}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: `test_transaction_${Date.now()}`,
            amount: { currency_code: "USD", value: "1.00" },
            description: "Test $1 Transaction",
          },
        ],
      }),
    });

    if (!orderRes.ok) {
      const err = await orderRes.text();
      return NextResponse.json({ error: `Failed to create order: ${err}` }, { status: 500 });
    }

    const orderData = await orderRes.json();
    return NextResponse.json({ orderID: orderData.id });

  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
