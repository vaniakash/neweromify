/**
 * generate-avatar-post.ts — MCP tool: generate_avatar_post
 *
 * Generates an image that LOOKS LIKE the user's saved avatar (Ava, Sofia, etc.)
 * using Pollinations.ai "klein" model with image-edit mode — the exact same
 * model used on the /tools/creator/ai-influencer page.
 *
 * Flow:
 *  1. Look up the avatar by name/@tag in MongoDB (UserAvatar collection).
 *  2. Fetch the avatar's base image from Cloudinary as a binary file.
 *  3. Send it + the prompt to Pollinations /v1/images/edits (model=klein).
 *  4. Upload result to Cloudinary, save to gallery, deduct credits.
 *
 * Credit cost: 500 internal credits = 5 displayed credits per image.
 * (Matches the same cost as the website's AI Influencer tool.)
 * Model: Pollinations.ai "klein"
 */

import { v2 as cloudinary } from "cloudinary";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { UserAvatar } from "@/models/UserAvatar";
import { GalleryImage } from "@/models/GalleryImage";
import type { McpToolDefinition, McpCallToolResult, McpUserContext } from "./types";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key:    process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  secure:     true,
});

const GEN_API = "https://gen.pollinations.ai";
const AVATAR_POST_CREDIT_COST = 500; // 5 credits — same as website

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function withRetry(fn: () => Promise<Response>, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    if (i > 0) await sleep(3000 * i);
    const res = await fn();
    if (res.status !== 429) return res;
  }
  throw new Error("Max retries exceeded (rate limited by Pollinations)");
}

// ── Tool definition ───────────────────────────────────────────────────────────

export const generateAvatarPostDefinition: McpToolDefinition = {
  name: "generate_avatar_post",
  description:
    "Generate an AI image that looks exactly like one of YOUR saved avatars (e.g. Ava, Sofia). " +
    "Uses the same Pollinations 'klein' model as the eromify.in AI Influencer tool — " +
    "preserves the avatar's face and identity using image-edit mode. " +
    "Use this when the user says 'create a post for Ava', 'make Ava at the beach', 'generate content with Sofia', etc. " +
    `Costs ${AVATAR_POST_CREDIT_COST / 100} credits per image.`,
  inputSchema: {
    type: "object",
    properties: {
      avatarName: {
        type: "string",
        description:
          "Name or @tag of the avatar to use. Examples: 'Ava', '@ava', 'Sofia', '@sofia'. " +
          "Must match one of the user's saved avatars.",
      },
      prompt: {
        type: "string",
        description:
          "Describe what you want the avatar to be doing, wearing, or the scene/setting. " +
          "Examples: 'sitting at a café, golden hour, editorial photo style', " +
          "'wearing a red dress at the beach, sunset lighting, Instagram post'. " +
          "The model will apply the scene while preserving her face.",
        minLength: 3,
        maxLength: 800,
      },
    },
    required: ["avatarName", "prompt"],
    additionalProperties: false,
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Fetch a remote image URL and return it as a Blob/File for multipart upload.
 */
async function fetchImageAsFile(imageUrl: string, filename = "avatar.jpg"): Promise<File> {
  const res = await fetch(imageUrl, { signal: AbortSignal.timeout(30_000) });
  if (!res.ok) throw new Error(`Failed to fetch avatar image (${res.status})`);
  const buf = await res.arrayBuffer();
  const ct = res.headers.get("content-type") ?? "image/jpeg";
  return new File([buf], filename, { type: ct });
}

/**
 * Call Pollinations /v1/images/edits with the reference image and prompt.
 * Returns a data URI or remote URL string.
 */
async function generateWithKlein(
  avatarImageUrl: string,
  prompt: string,
  apiKey: string | undefined
): Promise<string> {
  const authHeaders: Record<string, string> = {};
  if (apiKey) authHeaders["Authorization"] = `Bearer ${apiKey}`;

  const imageFile = await fetchImageAsFile(avatarImageUrl);

  const form = new FormData();
  form.append("model", "klein");
  form.append("prompt", prompt);
  form.append("image", imageFile, imageFile.name);

  const res = await withRetry(() =>
    fetch(`${GEN_API}/v1/images/edits`, {
      method: "POST",
      headers: authHeaders,
      body: form,
      signal: AbortSignal.timeout(120_000),
    })
  );

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Pollinations klein error (${res.status}): ${body.slice(0, 200)}`);
  }

  const ct = res.headers.get("content-type") ?? "";

  if (ct.includes("application/json")) {
    const json = await res.json();
    const b64: string | undefined = json?.data?.[0]?.b64_json;
    const imgUrl: string | undefined = json?.data?.[0]?.url;
    if (b64) return `data:image/png;base64,${b64}`;
    if (imgUrl) return imgUrl;
    throw new Error("No image in Pollinations JSON response");
  }

  // Binary image response
  const buf = await res.arrayBuffer();
  const b64 = Buffer.from(buf).toString("base64");
  return `data:image/jpeg;base64,${b64}`;
}

// ── Tool handler ──────────────────────────────────────────────────────────────

interface GenerateAvatarPostInput {
  avatarName: string;
  prompt: string;
}

export async function executeGenerateAvatarPost(
  input: GenerateAvatarPostInput,
  user: McpUserContext
): Promise<McpCallToolResult> {
  // ── Credit check ─────────────────────────────────────────────────────────
  if (user.credits < AVATAR_POST_CREDIT_COST) {
    return {
      isError: true,
      content: [{
        type: "text",
        text: `Insufficient credits: generating an avatar post costs ${AVATAR_POST_CREDIT_COST / 100} credits but you only have ${Math.floor(user.credits / 100)}. Top up at eromify.in.`,
      }],
    };
  }

  await connectDB();

  // ── Find avatar by name or @tag ───────────────────────────────────────────
  const searchName = input.avatarName.replace(/^@/, "").toLowerCase().trim();

  const avatar = await UserAvatar.findOne({
    userEmail: user.email,
    $or: [
      { name: { $regex: new RegExp(`^${searchName}$`, "i") } },
      { username: { $regex: new RegExp(`^@?${searchName}$`, "i") } },
    ],
  }).lean();

  if (!avatar) {
    const allAvatars = await UserAvatar.find({ userEmail: user.email })
      .select("name username")
      .lean();

    const list = allAvatars.length
      ? allAvatars.map((a) => `• ${a.name} (${a.username})`).join("\n")
      : "(no avatars saved yet — create one at eromify.in/avatar)";

    return {
      isError: true,
      content: [{
        type: "text",
        text:
          `Avatar "${input.avatarName}" not found in your saved avatars.\n\n` +
          `Your saved avatars:\n${list}\n\n` +
          `Tip: create the avatar first at eromify.in/avatar, then try again.`,
      }],
    };
  }

  // ── Generate with Pollinations klein (image-edit mode) ────────────────────
  const apiKey = process.env.POLLINATIONS_API_KEY;
  let dataUri: string;

  try {
    dataUri = await generateWithKlein(avatar.baseImage, input.prompt.trim(), apiKey);
  } catch (err) {
    return {
      isError: true,
      content: [{
        type: "text",
        text: `Generation failed: ${err instanceof Error ? err.message : "Unknown error"}. Credits were not deducted.`,
      }],
    };
  }

  // ── Upload result to Cloudinary ───────────────────────────────────────────
  let cloudinaryUrl: string;
  try {
    const uploadResult = await cloudinary.uploader.upload(dataUri, {
      folder: "eromify/avatar-posts",
      resource_type: "image",
    });
    cloudinaryUrl = uploadResult.secure_url;
  } catch {
    // If Cloudinary upload fails, fall back to returning the raw data (edge case)
    return {
      isError: true,
      content: [{ type: "text", text: "Image generated but Cloudinary upload failed. Credits were not deducted." }],
    };
  }

  // ── Save to gallery ───────────────────────────────────────────────────────
  GalleryImage.create({
    userEmail:          user.email,
    userName:           user.email,
    cloudinaryUrl,
    cloudinaryPublicId: cloudinaryUrl,
    prompt:             input.prompt.trim(),
    mode:               "avatar-post",
    model:              "klein",
    generationMs:       0,
  }).catch(() => {});

  // ── Deduct credits ────────────────────────────────────────────────────────
  await User.updateOne({ _id: user._id }, { $inc: { credits: -AVATAR_POST_CREDIT_COST } });

  const creditsLeft = user.credits - AVATAR_POST_CREDIT_COST;

  return {
    content: [{
      type: "text",
      text:
        `✅ Generated a post for **${avatar.name}** using Pollinations klein!\n\n` +
        `📸 Image: ${cloudinaryUrl}\n\n` +
        `💳 ${AVATAR_POST_CREDIT_COST / 100} credits deducted · ${Math.floor(creditsLeft / 100)} remaining`,
    }],
  };
}
