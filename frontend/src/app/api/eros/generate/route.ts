/**
 * POST /api/eros/generate
 *
 * Server-side proxy for fal-ai/flux-2-pro image generation.
 * Keeps FAL_KEY off the client.
 * Access restricted to Professional Pack (mega) and Enterprise Pack (premium) — mcpAccess: true.
 */

import { NextRequest, NextResponse } from "next/server";
import { fal } from "@fal-ai/client";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

fal.config({ credentials: process.env.FAL_KEY });

export async function POST(req: NextRequest) {
  // ── Auth + access gate (Professional / Enterprise Pack only) ───────────────
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Sign in to use Eros." }, { status: 401 });
  }
  await connectDB();
  const user = await User.findOne({ email: session.user.email }).lean();
  if (!user || !user.mcpAccess) {
    return NextResponse.json(
      { error: "Eros requires a Professional Pack or Enterprise Pack subscription." },
      { status: 403 }
    );
  }
  // ───────────────────────────────────────────────────────────────────────────

  try {
    const body = await req.json();
    const {
      prompt,
      image_size = "landscape_4_3",
      safety_tolerance = "5",
      seed,
      output_format = "jpeg",
    } = body;

    if (!prompt?.trim()) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // safety_tolerance must be a string "1"–"5"; clamp to valid range
    const toleranceNum = Math.min(5, Math.max(1, Number(safety_tolerance) || 5));
    const input: Record<string, unknown> = {
      prompt,
      image_size,
      safety_tolerance: String(toleranceNum),
      output_format,
      enable_safety_checker: false,
    };
    if (seed !== undefined && seed !== null && seed !== "") {
      input.seed = Number(seed);
    }

    const result = await fal.subscribe("fal-ai/flux-2-pro", {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      input: input as any,
      logs: false,
    });

    const images = (result.data as { images?: Array<{ url: string; width: number; height: number }> }).images ?? [];

    return NextResponse.json({
      images,
      seed: (result.data as { seed?: number }).seed,
      requestId: result.requestId,
    });
  } catch (err: unknown) {
    const body = (err as { body?: unknown })?.body;
    console.error("[eros/generate] Error:", err, "body:", JSON.stringify(body));
    return NextResponse.json(
      { error: "Generation failed. Please try again." },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS" } });
}
