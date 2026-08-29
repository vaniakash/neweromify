/**
 * list-avatars.ts — MCP tool: list_avatars
 *
 * Returns the user's OWN saved avatars (created at eromify.in/avatar),
 * NOT the public template gallery. No credits consumed.
 */

import { connectDB } from "@/lib/db";
import { UserAvatar } from "@/models/UserAvatar";
import type { McpToolDefinition, McpCallToolResult, McpUserContext } from "./types";

// ── Tool definition ────────────────────────────────────────────────────────────

export const listAvatarsDefinition: McpToolDefinition = {
  name: "list_avatars",
  description:
    "List YOUR saved avatars from eromify.in/avatar — these are the personal avatars " +
    "you created (e.g. Ava, Emily). Use this to see which avatars are available before " +
    "calling generate_avatar_post. No credits required.",
  inputSchema: {
    type: "object",
    properties: {},
    required: [],
    additionalProperties: false,
  },
};

// ── Tool handler ──────────────────────────────────────────────────────────────

export async function executeListAvatars(
  _input: Record<string, never>,
  user: McpUserContext
): Promise<McpCallToolResult> {
  await connectDB();

  const avatars = await UserAvatar.find({ userEmail: user.email })
    .sort({ createdAt: 1 })
    .select("name username baseImage createdAt")
    .lean();

  if (avatars.length === 0) {
    return {
      content: [{
        type: "text",
        text:
          "You have no saved avatars yet.\n\n" +
          "Create one at https://eromify.in/avatar, then come back and I can generate posts for her.",
      }],
    };
  }

  const lines = avatars.map(
    (a) => `• ${a.name} (${a.username})${a.baseImage ? " ✅" : " ⚠️ no image"}`
  );

  return {
    content: [{
      type: "text",
      text:
        `You have ${avatars.length} saved avatar${avatars.length !== 1 ? "s" : ""}:\n\n` +
        lines.join("\n") +
        "\n\nUse generate_avatar_post with any of these names to create content.",
    }],
  };
}
