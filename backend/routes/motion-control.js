const express = require("express");
const crypto  = require("crypto");
const fetch   = require("node-fetch");
const { MongoClient, ServerApiVersion } = require("mongodb");
const router  = express.Router();

// Credit cost for Motion Control
const MOTION_CONTROL_CREDIT_COST = 2000;

// ── MongoDB ───────────────────────────────────────────────────────────────────
let mongoClient = null;
async function getDB() {
  if (!mongoClient) {
    mongoClient = new MongoClient(process.env.MONGODB_URI, {
      serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
    });
    await mongoClient.connect();
    console.log("[motion-control] Connected to MongoDB");
  }
  return mongoClient.db();
}

// ── Ticket verification (shared with video backend) ───────────────────────────
function verifyTicket(ticketStr) {
  try {
    const [data, sig] = ticketStr.split(".");
    if (!data || !sig) return null;
    const expected = crypto
      .createHmac("sha256", process.env.VIDEO_BACKEND_SECRET)
      .update(data)
      .digest("hex");
    if (sig !== expected) return null;
    const payload = JSON.parse(Buffer.from(data, "base64").toString("utf8"));
    if (Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

// ── Upload to Cloudinary (image or video) ─────────────────────────────────────
async function uploadToCloudinary(dataUri, resourceType) {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET)
    throw new Error("Cloudinary not configured");

  const timestamp = Math.floor(Date.now() / 1000);
  const folder    = "eromify-motion-control";
  const sigStr    = `folder=${folder}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`;
  const signature = crypto.createHash("sha1").update(sigStr).digest("hex");

  // node-fetch compatible form data
  const FormData = require("../form-data-compat");
  const formData = new FormData();
  formData.append("file",      dataUri);
  formData.append("api_key",   CLOUDINARY_API_KEY);
  formData.append("timestamp", String(timestamp));
  formData.append("signature", signature);
  formData.append("folder",    folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
    { method: "POST", body: formData }
  );
  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`Cloudinary ${resourceType} upload failed (${res.status}): ${err.slice(0, 200)}`);
  }
  const data = await res.json();
  let url = data.secure_url;
  if (resourceType === "image") url = url.replace(/\.(webp|png|gif|avif)$/i, ".jpg");
  return url;
}

// ── POST /motion-control ──────────────────────────────────────────────────────
router.post("/", async (req, res) => {
  const FAL_KEY = process.env.FAL_KEY;
  if (!FAL_KEY) return res.status(500).json({ error: "FAL_KEY not configured on server." });

  // 1. Verify HMAC ticket
  const authHeader = req.headers.authorization || "";
  const ticketStr  = authHeader.replace("Bearer ", "").trim();
  const ticket     = verifyTicket(ticketStr);
  if (!ticket) return res.status(401).json({ error: "Invalid or expired ticket. Please try again." });

  const { email } = ticket;

  // 2. Check user access in DB
  const db   = await getDB();
  const user = await db.collection("users").findOne({ email });
  if (!user) return res.status(404).json({ error: "User not found" });

  if (!user.motionControlAccess) {
    return res.status(403).json({
      error: "Motion Control requires the Enterprise Pack (₹3,999).",
      code:  "NO_MOTION_CONTROL_ACCESS",
    });
  }

  const currentCredits = typeof user.credits === "number" ? user.credits : 0;
  if (currentCredits < MOTION_CONTROL_CREDIT_COST) {
    return res.status(402).json({ error: "Insufficient credits.", code: "INSUFFICIENT_CREDITS" });
  }

  // 3. Parse body
  const {
    image_url: rawImage,
    video_url: rawVideo,
    prompt              = "",
    character_orientation = "image",
    keep_original_sound   = true,
  } = req.body;

  if (!rawImage || !rawVideo)
    return res.status(400).json({ error: "Both image_url and video_url are required." });

  // 4. Upload image + video to Cloudinary → get public HTTPS URLs
  let imagePublicUrl, videoPublicUrl;
  try {
    console.log("[motion-control] Uploading image to Cloudinary…");
    imagePublicUrl = await uploadToCloudinary(rawImage, "image");
    console.log("[motion-control] Image:", imagePublicUrl);
  } catch (e) {
    return res.status(422).json({ error: `Image upload failed: ${e.message}` });
  }
  try {
    console.log("[motion-control] Uploading video to Cloudinary…");
    videoPublicUrl = await uploadToCloudinary(rawVideo, "video");
    console.log("[motion-control] Video:", videoPublicUrl);
  } catch (e) {
    return res.status(422).json({ error: `Video upload failed: ${e.message}` });
  }

  // 5. Deduct credits
  await db.collection("users").updateOne({ email }, { $inc: { credits: -MOTION_CONTROL_CREDIT_COST } });

  const refund = () =>
    db.collection("users").updateOne({ email }, { $inc: { credits: MOTION_CONTROL_CREDIT_COST } });

  try {
    // 6. Submit to fal.ai queue
    console.log("[motion-control] Submitting to fal.ai…", { imagePublicUrl, videoPublicUrl, character_orientation });
    const falRes = await fetch(
      "https://queue.fal.run/fal-ai/kling-video/v3/pro/motion-control",
      {
        method:  "POST",
        headers: { Authorization: `Key ${FAL_KEY}`, "Content-Type": "application/json" },
        body:    JSON.stringify({ prompt, image_url: imagePublicUrl, video_url: videoPublicUrl, keep_original_sound, character_orientation }),
      }
    );

    if (!falRes.ok) {
      await refund();
      const errText = await falRes.text().catch(() => "");
      console.error("[motion-control] fal.ai submit error:", falRes.status, errText);
      return res.status(502).json({ error: `fal.ai error (${falRes.status}): ${errText.slice(0, 200)}` });
    }

    const queued    = await falRes.json();
    const requestId = queued.request_id;
    console.log("[motion-control] Queued — requestId:", requestId);

    // 7. Poll for completion — no timeout issue on Express/Render!
    // fal.ai queue:  status → GET /requests/{id}/status
    //                result → GET /requests/{id}
    const base      = `https://queue.fal.run/fal-ai/kling-video/v3/pro/motion-control/requests/${requestId}`;
    const statusUrl = `${base}/status`;
    const resultUrl = base;

    // Poll every 10s up to 8 minutes (plenty of margin for 3-4min generation)
    const MAX_POLLS   = 48;
    const POLL_DELAY  = 10_000;

    for (let i = 0; i < MAX_POLLS; i++) {
      await new Promise((r) => setTimeout(r, POLL_DELAY));

      const statusRes = await fetch(statusUrl, { headers: { Authorization: `Key ${FAL_KEY}` } });
      if (!statusRes.ok) {
        console.warn(`[motion-control] status poll ${i+1} non-ok: ${statusRes.status}`);
        continue;
      }

      const statusData = await statusRes.json();
      const status     = statusData.status ?? "";
      console.log(`[motion-control] poll ${i+1}/${MAX_POLLS} status: ${status}`);

      if (status === "COMPLETED") {
        const resultRes = await fetch(resultUrl, { headers: { Authorization: `Key ${FAL_KEY}` } });
        if (!resultRes.ok) {
          await refund();
          return res.status(502).json({ error: "Failed to fetch result from fal.ai. Credits refunded." });
        }

        const result        = await resultRes.json();
        const videoOutputUrl = result?.video?.url ?? result?.data?.video?.url ?? "";

        if (!videoOutputUrl) {
          await refund();
          return res.status(502).json({ error: "No video URL in fal.ai result. Credits refunded." });
        }

        console.log("[motion-control] ✅ Done! videoUrl:", videoOutputUrl);
        return res.json({ videoUrl: videoOutputUrl, requestId });
      }

      if (status === "FAILED" || status === "CANCELLED") {
        await refund();
        const reason = statusData.error ?? status;
        console.error("[motion-control] Generation failed:", reason);
        return res.status(422).json({ error: `Generation ${status}: ${reason}. Credits refunded.` });
      }
      // IN_QUEUE / IN_PROGRESS → keep polling
    }

    // If we somehow exhaust 8 minutes (unlikely for a 3-4min job)
    await refund();
    console.error("[motion-control] Timed out — requestId:", requestId);
    return res.status(504).json({ error: "Generation timed out (8 min). Credits refunded. Try again." });

  } catch (err) {
    await refund();
    console.error("[motion-control] Unexpected error:", err.message);
    return res.status(500).json({ error: "Internal server error. Credits refunded." });
  }
});

module.exports = router;
