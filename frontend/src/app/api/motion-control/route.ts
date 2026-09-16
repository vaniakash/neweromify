import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import crypto from "crypto";

// ── Thin proxy — all heavy lifting done in Express backend (no timeout) ────────

const MOTION_CONTROL_CREDIT_COST = 2000;

function issueTicket(email: string, credits: number, secret: string): string {
  const payload = Buffer.from(
    JSON.stringify({ email, credits, exp: Date.now() + 10 * 60 * 1000 })
  ).toString("base64");
  const sig = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

async function getSessionAndUser() {
  const session = await auth();
  if (!session?.user?.email) return { error: "Unauthorized", status: 401 };

  await connectDB();
  const user = await User.findOne({ email: session.user.email }).lean();
  if (!user) return { error: "User not found", status: 404 };

  return { session, user };
}

// ── POST /api/motion-control ──────────────────────────────────────────────────
// Validates user, then proxies to backend which uploads to Cloudinary + submits
// to fal.ai and returns { requestId } immediately.
export async function POST(req: NextRequest) {
  try {
    const result = await getSessionAndUser();
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    const { session, user } = result;

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
    if (!secret) return NextResponse.json({ error: "VIDEO_BACKEND_SECRET not configured" }, { status: 500 });

    const backendUrl = process.env.NEXT_PUBLIC_VIDEO_BACKEND_URL;
    if (!backendUrl) return NextResponse.json({ error: "Backend URL not configured" }, { status: 500 });

    const ticket = issueTicket(session.user!.email!, currentCredits, secret);
    const body   = await req.json();

    const backendRes = await fetch(`${backendUrl}/motion-control`, {
      method:  "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${ticket}` },
      body:    JSON.stringify(body),
    });

    const contentType = backendRes.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      const text = await backendRes.text();
      console.error("[motion-control proxy] Non-JSON from backend:", backendRes.status, text.slice(0, 400));
      return NextResponse.json(
        { error: `Backend error (${backendRes.status}). Please try again.` },
        { status: 502 }
      );
    }

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[motion-control proxy] POST error:", msg);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

// ── GET /api/motion-control?requestId=xxx ─────────────────────────────────────
// Polls the backend status endpoint and returns { status, videoUrl? }
export async function GET(req: NextRequest) {
  try {
    const requestId = req.nextUrl.searchParams.get("requestId");
    if (!requestId) return NextResponse.json({ error: "requestId is required" }, { status: 400 });

    const result = await getSessionAndUser();
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    const { session, user } = result;

    const secret = process.env.VIDEO_BACKEND_SECRET;
    if (!secret) return NextResponse.json({ error: "VIDEO_BACKEND_SECRET not configured" }, { status: 500 });

    const backendUrl = process.env.NEXT_PUBLIC_VIDEO_BACKEND_URL;
    if (!backendUrl) return NextResponse.json({ error: "Backend URL not configured" }, { status: 500 });

    const currentCredits = typeof user.credits === "number" ? user.credits : 0;
    const ticket = issueTicket(session.user!.email!, currentCredits, secret);

    // Build the backend URL — forward statusUrl and responseUrl if provided
    const backendParams = new URLSearchParams();
    const statusUrl   = req.nextUrl.searchParams.get("statusUrl");
    const responseUrl = req.nextUrl.searchParams.get("responseUrl");
    if (statusUrl)   backendParams.set("statusUrl",   statusUrl);
    if (responseUrl) backendParams.set("responseUrl", responseUrl);
    const queryStr = backendParams.toString() ? `?${backendParams.toString()}` : "";

    const backendRes = await fetch(`${backendUrl}/motion-control/status/${requestId}${queryStr}`, {
      headers: { "Authorization": `Bearer ${ticket}` },
    });

    const contentType = backendRes.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      const text = await backendRes.text();
      console.error("[motion-control proxy] Non-JSON status from backend:", backendRes.status, text.slice(0, 400));
      return NextResponse.json(
        { error: `Backend error (${backendRes.status}). Please try again.` },
        { status: 502 }
      );
    }

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[motion-control proxy] GET error:", msg);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
