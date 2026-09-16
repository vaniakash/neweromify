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

    // Force safety_tolerance to "5" (most permissive allowed by flux-2-pro)
    const input: Record<string, unknown> = {
      prompt,
      image_size,
      safety_tolerance: "5",
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
  } catch (err: any) {
    const status = err.status || 500;
    const body = err.body;
    console.error("[eros/generate] Error:", err.message, "body:", JSON.stringify(body));
    
    // Pass Fal validation errors (like safety checker violations) back to the client
    if (status === 422 && body?.detail?.[0]?.msg) {
      return NextResponse.json(
        { error: body.detail[0].msg },
        { status: 422 }
      );
    }

    return NextResponse.json(
      { error: "Generation failed. Please try again." },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS" } });
}
