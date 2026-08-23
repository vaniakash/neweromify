import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import { Payment } from "@/models/Payment";
import { User } from "@/models/User";

// ── PayU reverse hash verification ──────────────────────────────────────────
// PayU docs: SALT|status|udf5|udf4|udf3|udf2|udf1||||||email|firstname|productinfo|amount|txnid|key
function computeReverseHash(params: {
  salt: string;
  status: string;
  udf5?: string;
  udf4?: string;
  udf3?: string;
  udf2?: string;
  udf1?: string;
  email: string;
  firstname: string;
  productinfo: string;
  amount: string;
  txnid: string;
  key: string;
}): string {
  const {
    salt, status,
    udf5 = "", udf4 = "", udf3 = "", udf2 = "", udf1 = "",
    email, firstname, productinfo, amount, txnid, key,
  } = params;

  // Exact PayU reverse hash format:
  // SALT|status|udf5|udf4|udf3|udf2|udf1||||||email|firstname|productinfo|amount|txnid|key
  const hashString = `${salt}|${status}|${udf5}|${udf4}|${udf3}|${udf2}|${udf1}||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
  console.log("[payu/verify] reverse hash string:", hashString);
  return crypto.createHash("sha512").update(hashString).digest("hex");
}

export async function POST(request: Request) {
  try {
    await connectDB();

    // PayU sends form-encoded data
    const contentType = request.headers.get("content-type") ?? "";
    let fields: Record<string, string> = {};

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const text = await request.text();
      const params = new URLSearchParams(text);
      params.forEach((value, key) => { fields[key] = value; });
    } else {
      fields = await request.json();
    }

    // Log ALL fields PayU sent for debugging
    console.log("[payu/verify] ALL fields from PayU:", JSON.stringify(fields, null, 2));

    const {
      txnid,
      mihpayid,
      status,
      hash: receivedHash,
      amount,
      productinfo,
      firstname,
      email,
      udf1 = "",
      udf2 = "",
      udf3 = "",
      udf4 = "",
      udf5 = "",
    } = fields;

    const key  = process.env.PAYU_MERCHANT_KEY!;
    const salt = process.env.PAYU_SALT!;

    // ── Verify hash ───────────────────────────────────────────────────────────
    const computedHash = computeReverseHash({
      salt, status,
      udf5, udf4, udf3, udf2, udf1,
      email, firstname, productinfo, amount, txnid, key,
    });

    console.log("[payu/verify] received hash :", receivedHash);
    console.log("[payu/verify] computed hash :", computedHash);
    console.log("[payu/verify] match         :", receivedHash === computedHash);

    const isValid = receivedHash === computedHash;

    const baseUrl = process.env.NEXTAUTH_URL ?? "https://www.eromify.in";

    if (!isValid) {
      console.error("[payu/verify] Hash mismatch for txnid:", txnid);
      await Payment.findOneAndUpdate(
        { payuTxnId: txnid },
        { status: "failed", payuPaymentId: mihpayid }
      );
      return NextResponse.redirect(
        new URL("/payment-failed?reason=hash_mismatch", baseUrl)
      );
    }

    if (status !== "success") {
      console.warn("[payu/verify] Payment not successful. Status:", status, "txnid:", txnid);
      await Payment.findOneAndUpdate(
        { payuTxnId: txnid },
        { status: "failed", payuPaymentId: mihpayid }
      );
      return NextResponse.redirect(
        new URL("/payment-failed?reason=payment_failed", baseUrl)
      );
    }

    // ── Update payment record ─────────────────────────────────────────────────
    const payment = await Payment.findOneAndUpdate(
      { payuTxnId: txnid },
      { status: "paid", payuPaymentId: mihpayid },
      { new: true }
    );

    if (!payment) {
      console.error("[payu/verify] Payment record not found for txnid:", txnid);
      return NextResponse.redirect(
        new URL("/payment-failed?reason=record_not_found", baseUrl)
      );
    }

    // ── Grant credits + Pro status ────────────────────────────────────────────
    const userEmail = payment.userEmail ?? email;
    if (userEmail && payment.creditsToAdd) {
      const hasVideoAccess         = ["pro", "mega", "premium"].includes(payment.plan ?? "");
      const hasMcpAccess           = ["mega", "premium"].includes(payment.plan ?? "");
      const hasMotionControlAccess = ["premium"].includes(payment.plan ?? "");

      const result = await User.updateOne(
        { email: userEmail },
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
        `[payu/verify] update → matchedCount:${result.matchedCount} creditsAdded:${payment.creditsToAdd} ` +
        `isPro:true videoAccess:${hasVideoAccess} mcpAccess:${hasMcpAccess} plan:${payment.plan} user:${userEmail}`
      );
    } else if (userEmail) {
      await User.updateOne({ email: userEmail }, { $set: { isPro: true } });
    }

    return NextResponse.redirect(
      new URL(`/payment-success?credits=${payment.creditsToAdd ?? 0}`, baseUrl)
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("PayU verification error:", msg);
    const baseUrl = process.env.NEXTAUTH_URL ?? "https://www.eromify.in";
    return NextResponse.redirect(
      new URL("/payment-failed?reason=server_error", baseUrl)
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS" },
  });
}
