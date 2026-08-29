/**
 * /api/user/avatars — CRUD for user-created avatars (synced to MongoDB)
 *
 * GET  /api/user/avatars          → list all avatars for the logged-in user
 * POST /api/user/avatars          → upsert avatar by clientId
 * DELETE /api/user/avatars?id=... → delete by clientId
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { UserAvatar } from "@/models/UserAvatar";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const avatars = await UserAvatar.find({ userEmail: session.user.email })
    .sort({ createdAt: 1 })
    .lean();

  return NextResponse.json({ avatars });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { clientId, name, username, baseImage } = body;

  if (!clientId || !name || !baseImage) {
    return NextResponse.json({ error: "clientId, name, and baseImage are required" }, { status: 400 });
  }

  await connectDB();

  // Upsert: update if exists (same clientId + user), create if not
  const avatar = await UserAvatar.findOneAndUpdate(
    { userEmail: session.user.email, clientId },
    { userEmail: session.user.email, clientId, name, username, baseImage },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return NextResponse.json({ avatar });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("id");
  if (!clientId) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  await connectDB();
  await UserAvatar.deleteOne({ userEmail: session.user.email, clientId });

  return NextResponse.json({ success: true });
}
