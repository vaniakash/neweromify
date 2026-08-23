import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { User, IUser } from "@/models/User";
import {
  toggleProStatus,
  giveCredits,
  giveCreditsToUser,
  reduceCredits,
  reduceCreditsFromUser,
  assignSubscription,
  resetCreditsToZero,
} from "@/app/admin/actions";
import { UserSearch } from "./UserSearch";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 15;

// ── Inline styles shared across the page ─────────────────────────────────────
const S = {
  card: {
    background: "var(--bg-surface)",
    border: "1px solid var(--border-subtle)",
    borderRadius: 16,
    overflow: "hidden",
  } as React.CSSProperties,
  pill: (active: boolean, color = "#7c6cfe") =>
    ({
      display: "inline-flex",
      alignItems: "center",
      padding: "6px 14px",
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 700,
      border: `1px solid ${active ? `${color}40` : "var(--border-subtle)"}`,
      background: active ? `${color}18` : "var(--bg-elevated)",
      color: active ? color : "var(--text-secondary)",
      textDecoration: "none",
      transition: "all 0.2s",
      cursor: "pointer",
      whiteSpace: "nowrap" as const,
    } as React.CSSProperties),
};

export default async function AdminUsers({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; plan?: string; sort?: string; q?: string }>;
}) {
  const params = await searchParams;
  const page       = Math.max(1, parseInt(params.page || "1"));
  const planFilter = params.plan;
  const sortOrder  = params.sort === "oldest" ? 1 : -1;
  const searchQ    = params.q?.trim() ?? "";

  await connectDB();

  // ── Stats ────────────────────────────────────────────────────────────────────
  const totalUsers = await User.countDocuments();
  const activeSubs = await User.countDocuments({ isPro: true });
  const freeUsers  = totalUsers - activeSubs;

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const minId   = new mongoose.Types.ObjectId(
    Math.floor(weekAgo.getTime() / 1000).toString(16).padStart(8, "0") + "0000000000000000"
  );
  const newThisWeek = await User.countDocuments({ _id: { $gte: minId } });

  // ── Filter + search ──────────────────────────────────────────────────────────
  const filter: Record<string, unknown> = {};
  if (planFilter === "pro")  filter.isPro = true;
  if (planFilter === "free") filter.isPro = { $ne: true };
  if (searchQ) {
    filter.$or = [
      { email: { $regex: searchQ, $options: "i" } },
      { name:  { $regex: searchQ, $options: "i" } },
    ];
  }

  const filteredTotal = await User.countDocuments(filter);
  const totalPages    = Math.max(1, Math.ceil(filteredTotal / PAGE_SIZE));
  const safePage      = Math.min(page, totalPages);

  const users = (await User.find(filter)
    .sort({ _id: sortOrder })
    .skip((safePage - 1) * PAGE_SIZE)
    .limit(PAGE_SIZE)
    .lean()) as IUser[];

  // ── URL helpers ──────────────────────────────────────────────────────────────
  const buildUrl = (overrides: Record<string, string | undefined>) => {
    const base: Record<string, string> = {};
    if (planFilter) base.plan = planFilter;
    if (params.sort) base.sort = params.sort;
    if (searchQ) base.q = searchQ;
    const merged = { ...base, ...overrides };
    const q = Object.entries(merged)
      .filter(([, v]) => v !== undefined && v !== "")
      .map(([k, v]) => `${k}=${encodeURIComponent(v!)}`)
      .join("&");
    return `/admin/users${q ? `?${q}` : ""}`;
  };

  const filterHref = (plan?: string) => buildUrl({ plan: plan ?? "", page: "" });
  const sortHref   = (s: string)     => buildUrl({ sort: s, page: "" });
  const pageHref   = (p: number)     => buildUrl({ page: String(p) });

  const pageNums = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => Math.abs(p - safePage) <= 2
  );

  const STATS = [
    { label: "Total Users",      value: totalUsers,  sub: "all accounts",      color: "#7c6cfe", icon: "group" },
    { label: "New This Week",    value: newThisWeek, sub: "last 7 days",       color: "#22d3ee", icon: "person_add" },
    { label: "Pro Members",      value: activeSubs,  sub: `${totalUsers > 0 ? ((activeSubs / totalUsers) * 100).toFixed(1) : 0}% of total`, color: "#fbbf24", icon: "workspace_premium" },
    { label: "Free Users",       value: freeUsers,   sub: `${totalUsers > 0 ? ((freeUsers / totalUsers) * 100).toFixed(1) : 0}% of total`,  color: "#f472b6", icon: "person" },
  ];

  return (
    <>
      {/* ── Page Header ──────────────────────────────────────────────── */}
      <div className="page-header" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div className="page-header-eyebrow">User Management</div>
          <h1 className="shimmer-text">All Users</h1>
          <p>Manage accounts, credits, and subscription tiers across the platform.</p>
        </div>
        <a
          href="/admin/plan-clicks"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            padding: "9px 18px",
            borderRadius: 11,
            background: "rgba(251,146,60,0.10)",
            border: "1px solid rgba(251,146,60,0.25)",
            color: "#fb923c",
            fontSize: 12,
            fontWeight: 700,
            textDecoration: "none",
            flexShrink: 0,
            marginTop: 6,
            transition: "all 0.2s",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>ads_click</span>
          Plan Clicks
        </a>
      </div>

      {/* ── Stat Cards ───────────────────────────────────────────────── */}
      <div className="kpi-grid" style={{ marginBottom: 28 }}>
        {STATS.map((s, idx) => (
          <div
            className="kpi-card"
            key={s.label}
            style={{ animationDelay: `${idx * 70}ms` }}
          >
            <div
              style={{
                position: "absolute", top: -24, right: -24,
                width: 100, height: 100, borderRadius: "50%",
                background: s.color, opacity: 0.07, filter: "blur(24px)", pointerEvents: "none",
              }}
            />
            <div className="kpi-icon-wrap" style={{ background: `${s.color}18`, color: s.color }}>
              <span className="material-symbols-outlined">{s.icon}</span>
            </div>
            <div className="kpi-label">{s.label}</div>
            <div className="kpi-value">{s.value.toLocaleString()}</div>
            <div className="kpi-footer">
              <span className="material-symbols-outlined" style={{ fontSize: 12 }}>info</span>
              {s.sub}
            </div>
          </div>
        ))}
      </div>

      {/* ── Credit Control Panel ─────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          marginBottom: 24,
        }}
      >
        {/* Give Credits */}
        <div
          style={{
            ...S.card,
            padding: 24,
            borderColor: "rgba(34,211,238,0.15)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div
              style={{
                width: 40, height: 40, borderRadius: 12,
                background: "rgba(34,211,238,0.12)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#22d3ee", fontSize: 20,
              }}
            >
              <span className="material-symbols-outlined">add_circle</span>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Give Credits</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>Add image credits by email or user ID</div>
            </div>
          </div>
          <form action={giveCredits} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input
              type="text"
              name="identifier"
              required
              placeholder="Email or User ID"
              style={{
                background: "var(--bg-deep)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 10,
                padding: "9px 14px",
                fontSize: 13,
                color: "var(--text-primary)",
                outline: "none",
                fontFamily: "inherit",
                width: "100%",
              }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="number"
                name="amount"
                required
                min={1}
                max={10000}
                defaultValue={10}
                placeholder="Credits"
                style={{
                  background: "var(--bg-deep)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 10,
                  padding: "9px 14px",
                  fontSize: 13,
                  color: "var(--text-primary)",
                  outline: "none",
                  fontFamily: "inherit",
                  width: 100,
                }}
              />
              <button
                type="submit"
                style={{
                  flex: 1,
                  padding: "9px 16px",
                  borderRadius: 10,
                  background: "rgba(34,211,238,0.12)",
                  color: "#22d3ee",
                  border: "1px solid rgba(34,211,238,0.25)",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.2s",
                }}
              >
                ⚡ Give Credits
              </button>
            </div>
          </form>
        </div>

        {/* Reduce Credits */}
        <div
          style={{
            ...S.card,
            padding: 24,
            borderColor: "rgba(244,114,182,0.15)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div
              style={{
                width: 40, height: 40, borderRadius: 12,
                background: "rgba(244,114,182,0.12)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#f472b6", fontSize: 20,
              }}
            >
              <span className="material-symbols-outlined">remove_circle</span>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Reduce Credits</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>Deduct credits · won&apos;t go below 0</div>
            </div>
          </div>
          <form action={reduceCredits} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input
              type="text"
              name="identifier"
              required
              placeholder="Email or User ID"
              style={{
                background: "var(--bg-deep)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 10,
                padding: "9px 14px",
                fontSize: 13,
                color: "var(--text-primary)",
                outline: "none",
                fontFamily: "inherit",
                width: "100%",
              }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="number"
                name="amount"
                required
                min={1}
                max={10000}
                defaultValue={10}
                placeholder="Credits"
                style={{
                  background: "var(--bg-deep)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 10,
                  padding: "9px 14px",
                  fontSize: 13,
                  color: "var(--text-primary)",
                  outline: "none",
                  fontFamily: "inherit",
                  width: 100,
                }}
              />
              <button
                type="submit"
                style={{
                  flex: 1,
                  padding: "9px 16px",
                  borderRadius: 10,
                  background: "rgba(244,114,182,0.12)",
                  color: "#f472b6",
                  border: "1px solid rgba(244,114,182,0.25)",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.2s",
                }}
              >
                🔻 Reduce Credits
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ── Assign Subscription Panel ─────────────────────────────────── */}
      <div
        style={{
          ...S.card,
          padding: 28,
          marginBottom: 24,
          borderColor: "rgba(251,191,36,0.20)",
          background: "linear-gradient(135deg, rgba(25,37,64,0.95) 0%, rgba(30,20,60,0.95) 100%)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
          <div
            style={{
              width: 44, height: 44, borderRadius: 13,
              background: "rgba(251,191,36,0.13)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fbbf24", flexShrink: 0,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 22 }}>workspace_premium</span>
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.2px" }}>
              Assign Subscription
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
              Enter user email · pick a plan · credits &amp; access are added instantly
            </div>
          </div>
        </div>

        <form action={assignSubscription}>
          {/* Email row */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: 7 }}>
              User Email
            </label>
            <div style={{ position: "relative", maxWidth: 400 }}>
              <span
                className="material-symbols-outlined"
                style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 16, color: "var(--text-muted)", pointerEvents: "none" }}
              >
                mail
              </span>
              <input
                type="email"
                name="email"
                required
                placeholder="user@example.com"
                style={{
                  width: "100%",
                  background: "var(--bg-deep)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 11,
                  padding: "10px 14px 10px 38px",
                  fontSize: 13,
                  color: "var(--text-primary)",
                  outline: "none",
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          {/* Plan picker */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: 10 }}>
              Select Plan
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
              {([
                {
                  id: "value",
                  name: "Beginner Pack",
                  price: "₹499",
                  credits: "1,500",
                  color: "#22d3ee",
                  icon: "bolt",
                  perks: ["Image generation", "HD quality", "No video access"],
                },
                {
                  id: "pro",
                  name: "Creator Pack",
                  price: "₹999",
                  credits: "4,000",
                  color: "#a78bfa",
                  icon: "auto_awesome",
                  perks: ["Image + limited video", "Face Swap", "Video Upscale"],
                },
                {
                  id: "mega",
                  name: "Professional Pack",
                  price: "₹1,999",
                  credits: "12,000",
                  color: "#fbbf24",
                  icon: "workspace_premium",
                  perks: ["Full video access", "MCP Automation", "Priority queue"],
                },
                {
                  id: "premium",
                  name: "Enterprise Pack",
                  price: "₹3,999",
                  credits: "30,000",
                  color: "#f472b6",
                  icon: "diamond",
                  perks: ["Everything included", "4K Video", "All models"],
                },
              ] as { id: string; name: string; price: string; credits: string; color: string; icon: string; perks: string[] }[]).map((plan) => (
                <label
                  key={plan.id}
                  htmlFor={`plan-${plan.id}`}
                  style={{ cursor: "pointer", display: "block" }}
                >
                  <input
                    type="radio"
                    id={`plan-${plan.id}`}
                    name="plan"
                    value={plan.id}
                    required
                    style={{ position: "absolute", opacity: 0, pointerEvents: "none" }}
                  />
                  <div
                    style={{
                      border: `1.5px solid rgba(255,255,255,0.08)`,
                      borderRadius: 13,
                      padding: "14px 16px",
                      background: "var(--bg-elevated)",
                      transition: "all 0.2s",
                      position: "relative",
                      overflow: "hidden",
                    }}
                    className={`plan-card plan-card-${plan.id}`}
                  >
                    {/* Glow accent */}
                    <div style={{
                      position: "absolute", top: -20, right: -20,
                      width: 70, height: 70, borderRadius: "50%",
                      background: plan.color, opacity: 0.10, filter: "blur(20px)", pointerEvents: "none",
                    }} />
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: 16, color: plan.color }}
                      >
                        {plan.icon}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 800, color: plan.color }}>{plan.name}</span>
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: "var(--text-primary)", marginBottom: 2 }}>
                      {plan.credits}
                      <span style={{ fontSize: 11, fontWeight: 500, color: "var(--text-muted)", marginLeft: 4 }}>credits</span>
                    </div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 10 }}>{plan.price} one-time</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                      {plan.perks.map((p) => (
                        <div key={p} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "var(--text-secondary)" }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 11, color: plan.color }}>check_circle</span>
                          {p}
                        </div>
                      ))}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "11px 28px",
              borderRadius: 11,
              background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
              color: "#0a0a0a",
              border: "none",
              fontSize: 13,
              fontWeight: 800,
              cursor: "pointer",
              fontFamily: "inherit",
              boxShadow: "0 4px 20px rgba(251,191,36,0.35)",
              transition: "all 0.2s",
              letterSpacing: "-0.1px",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>workspace_premium</span>
            Assign Subscription
          </button>
        </form>
      </div>

      {/* ── Toolbar: Search + Filters ─────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 10,
          marginBottom: 16,
        }}
      >
        {/* Live Search */}
        <Suspense fallback={null}>
          <UserSearch defaultValue={searchQ} />
        </Suspense>

        {/* Plan filter pills */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {([
            { label: "All",  value: undefined },
            { label: "⚡ Pro",  value: "pro" },
            { label: "Free", value: "free" },
          ] as { label: string; value: string | undefined }[]).map(({ label, value }) => {
            const active = planFilter === value;
            const color  = value === "pro" ? "#fbbf24" : value === "free" ? "#f472b6" : "#7c6cfe";
            return (
              <a key={label} href={filterHref(value)} style={S.pill(active, color)}>
                {label}
              </a>
            );
          })}
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 20, background: "var(--border-subtle)" }} />

        {/* Sort */}
        <div style={{ display: "flex", gap: 6 }}>
          {([
            { label: "↓ Newest", value: "latest" },
            { label: "↑ Oldest", value: "oldest" },
          ] as { label: string; value: string }[]).map(({ label, value }) => {
            const active = (params.sort ?? "latest") === value;
            return (
              <a key={value} href={sortHref(value)} style={S.pill(active, "#22d3ee")}>
                {label}
              </a>
            );
          })}
        </div>

        {/* Result count */}
        <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>
          {filteredTotal.toLocaleString()} result{filteredTotal !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── User Table ───────────────────────────────────────────────── */}
      <div style={{ ...S.card, marginBottom: 0 }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 680 }}>
            <thead>
              <tr
                style={{
                  background: "var(--bg-elevated)",
                  borderBottom: "1px solid var(--border-subtle)",
                }}
              >
                {["User", "Plan", "Credits", "Joined", "Actions"].map((h, i) => (
                  <th
                    key={h}
                    style={{
                      padding: "14px 20px",
                      fontSize: 9,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "1.2px",
                      color: "var(--text-muted)",
                      textAlign: i === 4 ? "right" : "left",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => (
                <tr
                  key={user._id?.toString() || i}
                  className="users-tr"
                >
                  {/* User cell */}
                  <td style={{ padding: "14px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        alt={user.name || "User"}
                        src={
                          user.image ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            user.name || user.email || "U"
                          )}&background=7c6cfe&color=fff&bold=true&size=64`
                        }
                        style={{
                          width: 36, height: 36,
                          borderRadius: 10,
                          objectFit: "cover",
                          border: "1.5px solid var(--border-subtle)",
                          flexShrink: 0,
                        }}
                      />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                          {user.name || "Unknown"}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Plan */}
                  <td style={{ padding: "14px 20px" }}>
                    {user.isPro ? (
                      <span className="badge badge-pro">⚡ Pro</span>
                    ) : (
                      <span className="badge badge-free">Free</span>
                    )}
                  </td>

                  {/* Credits */}
                  <td style={{ padding: "14px 20px" }}>
                    <span
                      style={{
                        fontSize: 16, fontWeight: 800,
                        color: (user.credits ?? 0) > 0 ? "#22d3ee" : "var(--text-muted)",
                      }}
                    >
                      {(user.credits ?? 0).toLocaleString()}
                    </span>
                    <span style={{ fontSize: 10, color: "var(--text-muted)", marginLeft: 4 }}>cr</span>
                  </td>

                  {/* Joined */}
                  <td style={{ padding: "14px 20px", fontSize: 12, color: "var(--text-muted)" }}>
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric",
                        })
                      : "N/A"}
                  </td>

                  {/* Actions */}
                  <td style={{ padding: "14px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6 }}>
                      {/* Toggle Pro */}
                      <form action={toggleProStatus.bind(null, user._id!.toString(), user.isPro ?? false)}>
                        <button
                          type="submit"
                          style={{
                            padding: "5px 11px",
                            borderRadius: 8,
                            fontSize: 11,
                            fontWeight: 700,
                            cursor: "pointer",
                            fontFamily: "inherit",
                            border: user.isPro
                              ? "1px solid rgba(244,114,182,0.3)"
                              : "1px solid rgba(251,191,36,0.3)",
                            background: user.isPro
                              ? "rgba(244,114,182,0.08)"
                              : "rgba(251,191,36,0.08)",
                            color: user.isPro ? "#f472b6" : "#fbbf24",
                            transition: "all 0.2s",
                          }}
                        >
                          {user.isPro ? "Revoke Pro" : "Grant Pro"}
                        </button>
                      </form>

                      {/* +10 credits */}
                      <form action={giveCreditsToUser.bind(null, user._id!.toString(), 10)}>
                        <button
                          type="submit"
                          title="Give 10 credits"
                          style={{
                            padding: "5px 10px",
                            borderRadius: 8,
                            fontSize: 11,
                            fontWeight: 700,
                            cursor: "pointer",
                            fontFamily: "inherit",
                            border: "1px solid rgba(34,211,238,0.3)",
                            background: "rgba(34,211,238,0.08)",
                            color: "#22d3ee",
                            transition: "all 0.2s",
                          }}
                        >
                          +10 ⚡
                        </button>
                      </form>

                      {/* -10 credits */}
                      <form action={reduceCreditsFromUser.bind(null, user._id!.toString(), 10)}>
                        <button
                          type="submit"
                          title="Reduce 10 credits"
                          style={{
                            padding: "5px 10px",
                            borderRadius: 8,
                            fontSize: 11,
                            fontWeight: 700,
                            cursor: "pointer",
                            fontFamily: "inherit",
                            border: "1px solid rgba(244,114,182,0.3)",
                            background: "rgba(244,114,182,0.08)",
                            color: "#f472b6",
                            transition: "all 0.2s",
                          }}
                        >
                          −10 🔻
                        </button>
                      </form>

                      {/* Reset credits to 0 */}
                      <form action={resetCreditsToZero.bind(null, user._id!.toString())}>
                        <button
                          type="submit"
                          title={`Reset ALL credits to 0 for ${user.email ?? user.name}. This cannot be undone.`}
                          style={{
                            padding: "5px 10px",
                            borderRadius: 8,
                            fontSize: 11,
                            fontWeight: 700,
                            cursor: "pointer",
                            fontFamily: "inherit",
                            border: "1px solid rgba(239,68,68,0.45)",
                            background: "rgba(239,68,68,0.1)",
                            color: "#f87171",
                            transition: "all 0.2s",
                          }}
                        >
                          ⚠ Reset 0
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}

              {users.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      padding: "56px 20px",
                      textAlign: "center",
                      color: "var(--text-muted)",
                      fontSize: 14,
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 40, display: "block", marginBottom: 8 }}>
                      manage_search
                    </span>
                    No users match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div
          style={{
            padding: "14px 20px",
            background: "var(--bg-elevated)",
            borderTop: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>
            Showing{" "}
            <strong style={{ color: "var(--text-secondary)" }}>
              {filteredTotal === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filteredTotal)}
            </strong>{" "}
            of{" "}
            <strong style={{ color: "var(--text-secondary)" }}>{filteredTotal.toLocaleString()}</strong> users
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {safePage > 1 && (
              <a
                href={pageHref(safePage - 1)}
                style={{
                  width: 32, height: 32, borderRadius: 8,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-secondary)",
                  textDecoration: "none",
                  fontSize: 18,
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_left</span>
              </a>
            )}
            {pageNums.map((p) => (
              <a
                key={p}
                href={pageHref(p)}
                style={{
                  width: 32, height: 32, borderRadius: 8,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: p === safePage ? "#7c6cfe" : "var(--bg-surface)",
                  border: `1px solid ${p === safePage ? "#7c6cfe" : "var(--border-subtle)"}`,
                  color: p === safePage ? "#fff" : "var(--text-secondary)",
                  textDecoration: "none",
                  fontSize: 12,
                  fontWeight: 700,
                  boxShadow: p === safePage ? "0 0 12px rgba(124,108,254,0.4)" : "none",
                }}
              >
                {p}
              </a>
            ))}
            {safePage < totalPages && (
              <a
                href={pageHref(safePage + 1)}
                style={{
                  width: 32, height: 32, borderRadius: 8,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-secondary)",
                  textDecoration: "none",
                  fontSize: 18,
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_right</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
