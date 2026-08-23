"use server";

// ── Plan definitions (mirrors pricing page) ───────────────────────────────────
const SUBSCRIPTION_PLANS: Record<
  string,
  { planName: string; credits: number; videoAccess: boolean; mcpAccess: boolean }
> = {
  value:   { planName: "Beginner Pack",      credits: 2500,  videoAccess: false, mcpAccess: false },
  pro:     { planName: "Creator Pack",        credits: 4000,  videoAccess: true,  mcpAccess: false },
  mega:    { planName: "Professional Pack",   credits: 12000, videoAccess: true,  mcpAccess: true  },
  premium: { planName: "Enterprise Pack",     credits: 30000, videoAccess: true,  mcpAccess: true  },
};

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

const ADMIN_EMAILS = [
  "akashrana4992@gmail.com",
  "akashrana49927@gmail.com",
];
const ADMIN_PASSWORD = "MASTER";

export async function loginAdmin(formData: FormData) {
  const email    = (formData.get("email")    as string)?.trim().toLowerCase();
  const password = (formData.get("password") as string)?.trim();

  if (ADMIN_EMAILS.includes(email) && password === ADMIN_PASSWORD) {
    const cookieStore = await cookies();
    cookieStore.set("admin_session", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",          // lax works for ngrok too
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    redirect("/admin");
  }

  // Wrong credentials — redirect back with error flag
  redirect("/admin/login?error=1");
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  redirect("/admin/login");
}

export async function toggleProStatus(userId: string, currentStatus: boolean) {
  await connectDB();
  await User.findByIdAndUpdate(userId, { isPro: !currentStatus });
  revalidatePath("/admin/users");
}

export async function giveCredits(formData: FormData) {
  const identifier = (formData.get("identifier") as string)?.trim();
  const amount = parseInt(formData.get("amount") as string, 10);

  if (!identifier || isNaN(amount) || amount <= 0) return;

  await connectDB();

  // Support both email and userId
  const isEmail = identifier.includes("@");
  const filter = isEmail
    ? { email: identifier.toLowerCase() }
    : { _id: identifier };

  await User.updateOne(filter, { $inc: { credits: amount } });
  revalidatePath("/admin/users");
}

export async function giveCreditsToUser(userId: string, amount: number) {
  if (!userId || isNaN(amount) || amount <= 0) return;
  await connectDB();
  await User.findByIdAndUpdate(userId, { $inc: { credits: amount } });
  revalidatePath("/admin/users");
}

export async function reduceCredits(formData: FormData) {
  const identifier = (formData.get("identifier") as string)?.trim();
  const amount = parseInt(formData.get("amount") as string, 10);

  if (!identifier || isNaN(amount) || amount <= 0) return;

  await connectDB();

  const isEmail = identifier.includes("@");
  const filter = isEmail
    ? { email: identifier.toLowerCase() }
    : { _id: identifier };

  // Fetch current credits, compute new value in JS (floor at 0), then plain $set
  const user = await User.findOne(filter).select("credits").lean();
  const current = (user as { credits?: number } | null)?.credits ?? 0;
  const newCredits = Math.max(current - amount, 0);
  await User.updateOne(filter, { $set: { credits: newCredits } });
  revalidatePath("/admin/users");
}

export async function reduceCreditsFromUser(userId: string, amount: number) {
  if (!userId || isNaN(amount) || amount <= 0) return;
  await connectDB();
  // Fetch current credits, compute new value in JS (floor at 0), then plain $set
  const user = await User.findById(userId).select("credits").lean();
  const current = (user as { credits?: number } | null)?.credits ?? 0;
  const newCredits = Math.max(current - amount, 0);
  await User.findByIdAndUpdate(userId, { $set: { credits: newCredits } });
  revalidatePath("/admin/users");
}

// ── Assign a full subscription plan to a user by email ───────────────────────
export async function assignSubscription(formData: FormData) {
  const email  = (formData.get("email")  as string)?.trim().toLowerCase();
  const planId = (formData.get("plan")   as string)?.trim();

  if (!email || !planId) return;

  const plan = SUBSCRIPTION_PLANS[planId];
  if (!plan) return;

  await connectDB();

  await User.updateOne(
    { email },
    {
      $inc: { credits: plan.credits },
      $set: {
        isPro: true,
        ...(plan.videoAccess && { videoAccess: true }),
        ...(plan.mcpAccess   && { mcpAccess:   true  }),
      },
    }
  );

  revalidatePath("/admin/users");
}

// ── Reset a user's credits to zero ───────────────────────────────────────────
export async function resetCreditsToZero(userId: string) {
  if (!userId) return;
  await connectDB();
  await User.findByIdAndUpdate(userId, { $set: { credits: 0 } });
  revalidatePath("/admin/users");
}
