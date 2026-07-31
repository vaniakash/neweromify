// /api/payment/track-click
// Fires when a user clicks any plan button on the pricing page.
// Lightweight fire-and-forget — returns 200 quickly, never blocks the UI.

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { PlanClick } from "@/models/PlanClick";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    const { planId, planName, amount } = await req.json() as {
      planId: string;
      planName: string;
      amount: number;
    };

    if (!planId || !planName || !amount) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    await connectDB();

    await PlanClick.create({
      userId:    session?.user?.id    || null,
      userEmail: session?.user?.email || null,
      userName:  session?.user?.name  || null,
      planId,
      planName,
      amount,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    // Silent fail — never break the pricing page over analytics
    console.error("[track-click]", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
