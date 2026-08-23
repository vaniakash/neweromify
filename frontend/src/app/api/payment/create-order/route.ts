import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import { Payment } from "@/models/Payment";

// ── PayU hash computation ─────────────────────────────────────────────────────
// Required string: key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||salt
function computePayuHash(params: {
  key: string;
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  salt: string;
}): string {
  const { key, txnid, amount, productinfo, firstname, email, salt } = params;
  const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${salt}`;
  return crypto.createHash("sha512").update(hashString).digest("hex");
}

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();

    // Accept user identity from the request body (sent by the client from session)
    // The hash is server-computed so there's no security risk in accepting email from client
    const {
      packId = "value",
      userEmail = "",
      userId = "",
      userName = "User",
    } = body;

    if (!userEmail) {
      return NextResponse.json({ error: "Please sign in to continue" }, { status: 401 });
    }

    // ── Pricing tiers ─────────────────────────────────────────────────────────
    const tiers: Record<string, { priceRupees: number; credits: number; planName: string }> = {
      value:   { priceRupees: 499,  credits: 2500,  planName: "Beginner Pack" },
      pro:     { priceRupees: 999,  credits: 4000,  planName: "Creator Pack" },
      mega:    { priceRupees: 1999, credits: 12000, planName: "Professional Pack" },
      premium: { priceRupees: 3999, credits: 30000, planName: "Enterprise Pack" },
    };

    const selectedTier = tiers[packId as string] ?? tiers.value;
    const { priceRupees, credits, planName } = selectedTier;

    // ── PayU params ───────────────────────────────────────────────────────────
    const key      = process.env.PAYU_MERCHANT_KEY!;
    const salt     = process.env.PAYU_SALT!;
    const txnid    = `ero_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const amount   = priceRupees.toFixed(2);            // PayU requires string like "149.00"
    const productinfo = planName;
    const firstname   = (userName as string).split(" ")[0] || "User";
    const email       = userEmail as string;

    const baseUrl = process.env.NEXTAUTH_URL ?? "https://www.eromify.in";
    const surl = `${baseUrl}/api/payment/verify`;       // PayU POSTs here on success
    const furl = `${baseUrl}/api/payment/verify`;       // PayU POSTs here on failure too

    const hash = computePayuHash({ key, txnid, amount, productinfo, firstname, email, salt });

    // ── Save pending Payment record ───────────────────────────────────────────
    await Payment.create({
      userId:        userId || null,
      userEmail:     email,
      payuTxnId:     txnid,
      amount:        priceRupees,
      currency:      "INR",
      status:        "created",
      plan:          packId,
      planName,
      creditsToAdd:  credits,
      paymentMethod: "payu",
    });

    console.log(`[payu/create-order] txnid:${txnid} plan:${packId} amount:${amount} user:${email}`);

    return NextResponse.json({
      key,
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      surl,
      furl,
      hash,
      payuUrl: process.env.PAYU_URL ?? "https://secure.payu.in/_payment",
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : "";
    console.error("PayU order creation error:", msg);
    console.error("Stack:", stack);
    return NextResponse.json(
      { error: "Failed to create payment order", detail: msg },
      { status: 500 }
    );
  }
}
