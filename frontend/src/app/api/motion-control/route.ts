import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import crypto from "crypto";

// ── This route is now a THIN PROXY ────────────────────────────────────────────
// 1. Verify session + access flags here (fast, no timeout risk)
// 2. Issue a signed HMAC ticket
// 3. Forward the full request to the Express backend (runs on Render — NO timeout)
// The Express backend does: Cloudinary uploads → fal.ai submit → polling → respond

const MOTION_CONTROL_CREDIT_COST = 2000;

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email }).lean();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Gate: Enterprise Pack only
    const rawUser = (user as unknown) as Record<string, unknown>;
    if (!rawUser.motionControlAccess) {
      return NextResponse.json(
        { error: "Motion Control requires the Enterprise Pack (₹3,999).", code: "NO_MOTION_CONTROL_ACCESS" },
        { status: 403 }
      );
    }

    const currentCredits = typeof user.credits === "number" ? user.credits : 0;
    if (currentCredits < MOTION_CONTROL_CREDIT_COST) {
      return NextResponse.json(
        { error: "Insufficient credits.", code: "INSUFFICIENT_CREDITS" },
        { status: 402 }
      );
    }

    const secret = process.env.VIDEO_BACKEND_SECRET;
    if (!secret) {
      return NextResponse.json({ error: "VIDEO_BACKEND_SECRET not configured" }, { status: 500 });
    }

    const backendUrl = process.env.NEXT_PUBLIC_VIDEO_BACKEND_URL;
    if (!backendUrl) {
      return NextResponse.json({ error: "Backend URL not configured" }, { status: 500 });
    }

    // Issue HMAC-signed ticket (10 min TTL) — same pattern as video-ticket
    const payload = Buffer.from(
      JSON.stringify({ email: session.user.email, credits: currentCredits, exp: Date.now() + 10 * 60 * 1000 })
    ).toString("base64");
    const sig    = crypto.createHmac("sha256", secret).update(payload).digest("hex");
    const ticket = `${payload}.${sig}`;

    // Forward the body to the Express backend
    const body = await req.json();

    const backendRes = await fetch(`${backendUrl}/motion-control`, {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${ticket}`,
      },
      body: JSON.stringify(body),
      // No timeout set here — Express on Render handles it without time limits
    });

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[motion-control proxy] error:", msg);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
