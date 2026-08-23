import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

// Credit cost: 15 displayed credits = 1500 internal credits per video
const KLING_CREDIT_COST = 1500;

async function uploadImageToCloudinary(base64DataUri: string): Promise<string> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) throw new Error("Cloudinary not configured");

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = "eromify-kling-refs";

  const crypto = await import("crypto");
  const sigStr = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash("sha1").update(sigStr).digest("hex");

  const formData = new FormData();
  formData.append("file", base64DataUri);
  formData.append("api_key", apiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("signature", signature);
  formData.append("folder", folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: formData }
  );
  if (!res.ok) throw new Error(`Cloudinary upload failed: ${res.status}`);
  const data = await res.json();
  // Force JPEG — Kling requires JPEG
  const url = (data.secure_url as string).replace(/\.(webp|png|gif|avif)$/i, ".jpg");
  return url;
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const currentCredits = typeof user.credits === "number" ? user.credits : 0;

    // ── Enterprise Pack gate ─────────────────────────────────────────────────
    // Kling Video is exclusive to the Enterprise Pack (₹3,999 · motionControlAccess = true)
    if (!user.motionControlAccess) {
      return NextResponse.json(
        {
          error: "Kling Video Generator is exclusive to the Enterprise Pack (₹3,999). Upgrade to unlock 1080p AI video generation.",
          code: "NO_ENTERPRISE_ACCESS",
        },
        { status: 403 }
      );
    }

    if (currentCredits < KLING_CREDIT_COST) {
      return NextResponse.json(
        {
          error: `Not enough credits. Kling Video costs ${KLING_CREDIT_COST / 100} credits. You have ${Math.floor(currentCredits / 100)}.`,
          code: "INSUFFICIENT_CREDITS",
          required: KLING_CREDIT_COST,
          available: currentCredits,
        },
        { status: 402 }
      );
    }

    const falKey = process.env.FAL_KEY;
    if (!falKey) {
      return NextResponse.json({ error: "FAL_KEY not configured" }, { status: 500 });
    }

    const body = await req.json();
    const { prompt = "", image, duration = "5" } = body;

    // Resolve image URL
    let imageUrl: string | null = null;
    if (image && typeof image === "string") {
      if (image.startsWith("data:")) {
        imageUrl = await uploadImageToCloudinary(image);
      } else if (image.startsWith("http")) {
        imageUrl = image;
      }
    }

    // Submit to fal.ai queue
    const falEndpoint = "fal-ai/kling-video/v3/turbo/pro/image-to-video";
    const inputPayload: Record<string, unknown> = {
      duration: String(duration),
    };
    if (prompt.trim()) inputPayload.prompt = prompt.trim().slice(0, 2500);
    if (imageUrl) inputPayload.image_url = imageUrl;

    // Submit request
    const submitRes = await fetch(
      `https://queue.fal.run/${falEndpoint}`,
      {
        method: "POST",
        headers: {
          "Authorization": `Key ${falKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(inputPayload),
      }
    );

    if (!submitRes.ok) {
      const errText = await submitRes.text().catch(() => "");
      console.error("[kling-video] fal.ai submit error:", submitRes.status, errText);
      return NextResponse.json({ error: "Failed to submit to Kling AI", details: errText }, { status: 502 });
    }

    const submitData = await submitRes.json();
    const requestId: string = submitData.request_id;

    // Poll for result (max 5 minutes)
    const maxAttempts = 60;
    let attempt = 0;
    let resultData: Record<string, unknown> | null = null;

    while (attempt < maxAttempts) {
      await new Promise((r) => setTimeout(r, 5000)); // wait 5s between polls
      attempt++;

      const statusRes = await fetch(
        `https://queue.fal.run/${falEndpoint}/requests/${requestId}/status`,
        {
          headers: { "Authorization": `Key ${falKey}` },
        }
      );

      if (!statusRes.ok) continue;
      const statusData = await statusRes.json();

      if (statusData.status === "COMPLETED") {
        // Fetch actual result
        const resultRes = await fetch(
          `https://queue.fal.run/${falEndpoint}/requests/${requestId}`,
          {
            headers: { "Authorization": `Key ${falKey}` },
          }
        );
        if (resultRes.ok) {
          resultData = await resultRes.json();
        }
        break;
      }

      if (statusData.status === "FAILED") {
        return NextResponse.json({ error: "Kling AI generation failed", details: statusData }, { status: 502 });
      }
    }

    if (!resultData) {
      return NextResponse.json({ error: "Generation timed out. Please try again." }, { status: 504 });
    }

    const videoResult = resultData.video as { url: string; file_name: string; file_size: number } | undefined;
    if (!videoResult?.url) {
      return NextResponse.json({ error: "No video in result", raw: resultData }, { status: 502 });
    }

    // Deduct credits on success
    await User.updateOne({ _id: user._id }, { $inc: { credits: -KLING_CREDIT_COST } });

    return NextResponse.json({
      videoUrl: videoResult.url,
      fileName: videoResult.file_name ?? `kling-video-${Date.now()}.mp4`,
      creditsDeducted: KLING_CREDIT_COST,
      creditsRemaining: currentCredits - KLING_CREDIT_COST,
    });
  } catch (err: unknown) {
    console.error("[kling-video] Error:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
