import { connectDB } from "@/lib/db";
import { PlanClick, IPlanClick } from "@/models/PlanClick";
import { formatDistanceToNow, format } from "date-fns";

export const dynamic = "force-dynamic";

const PLAN_COLORS: Record<string, { color: string; bg: string; border: string }> = {
  value:   { color: "#60a5fa", bg: "rgba(96,165,250,0.1)",  border: "rgba(96,165,250,0.25)"  },
  pro:     { color: "#c084fc", bg: "rgba(192,132,252,0.1)", border: "rgba(192,132,252,0.25)" },
  mega:    { color: "#f87171", bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.25)" },
  premium: { color: "#facc15", bg: "rgba(250,204,21,0.1)",  border: "rgba(250,204,21,0.25)"  },
};

export default async function PlanClicksPage() {
  await connectDB();

  const clicks = (await PlanClick.find()
    .sort({ createdAt: -1 })
    .limit(200)
    .lean()) as IPlanClick[];

  // ── Aggregation per plan ──────────────────────────────────────────────────
  const planAgg: Record<string, { name: string; count: number; amount: number }> = {};
  for (const c of clicks) {
    if (!planAgg[c.planId]) {
      planAgg[c.planId] = { name: c.planName, count: 0, amount: c.amount };
    }
    planAgg[c.planId].count++;
  }

  const planStats = Object.entries(planAgg).sort((a, b) => b[1].count - a[1].count);
  const totalClicks = clicks.length;
  const uniqueUsers = new Set(clicks.filter((c) => c.userEmail).map((c) => c.userEmail)).size;
  const guestClicks = clicks.filter((c) => !c.userEmail).length;

  return (
    <>
      <div className="page-header">
        <div className="page-header-eyebrow">Pricing Analytics</div>
        <h1 className="shimmer-text">Plan Click Tracker</h1>
        <p>Who clicked which plan and when · {totalClicks} total clicks</p>
      </div>

      {/* ── KPI row ── */}
      <div className="kpi-grid" style={{ marginBottom: 24 }}>
        {[
          {
            label: "Total Clicks",
            value: totalClicks,
            footer: "All plan button clicks",
            color: "#7c6cfe",
            icon: "ads_click",
          },
          {
            label: "Logged-in Users",
            value: uniqueUsers,
            footer: "Unique signed-in users",
            color: "#34d399",
            icon: "person",
          },
          {
            label: "Guest Clicks",
            value: guestClicks,
            footer: "Clicked without signing in",
            color: "#fbbf24",
            icon: "person_off",
          },
          {
            label: "Most Wanted",
            value: planStats[0]?.[1].name ?? "—",
            footer: planStats[0] ? `${planStats[0][1].count} clicks` : "No data yet",
            color: "#f472b6",
            icon: "local_fire_department",
          },
        ].map((k) => (
          <div className="kpi-card" key={k.label} style={{ padding: "20px 24px" }}>
            <div className="kpi-icon-wrap" style={{ background: `${k.color}1a`, color: k.color }}>
              <span className="material-symbols-outlined">{k.icon}</span>
            </div>
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value" style={{ fontSize: typeof k.value === "string" ? 18 : undefined }}>
              {k.value}
            </div>
            <div className="kpi-footer" style={{ marginTop: 8 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 13 }}>info</span>
              {k.footer}
            </div>
          </div>
        ))}
      </div>

      {/* ── Plan popularity breakdown ── */}
      <div className="table-card" style={{ marginBottom: 24 }}>
        <div className="table-card-header">
          <span className="table-card-title">Plan Popularity</span>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Click distribution per plan</span>
        </div>
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
          {planStats.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center", padding: "24px 0" }}>
              No clicks recorded yet.
            </p>
          ) : (
            planStats.map(([planId, stat]) => {
              const pct = totalClicks > 0 ? Math.round((stat.count / totalClicks) * 100) : 0;
              const style = PLAN_COLORS[planId] ?? PLAN_COLORS.pro;
              return (
                <div key={planId}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{
                        fontSize: 10, fontWeight: 800, padding: "2px 10px", borderRadius: 999,
                        background: style.bg, color: style.color, border: `1px solid ${style.border}`,
                        textTransform: "uppercase", letterSpacing: "0.5px",
                      }}>
                        {stat.name}
                      </span>
                      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>₹{stat.amount.toLocaleString("en-IN")}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
                        {stat.count} clicks
                      </span>
                      <span style={{ fontSize: 11, color: style.color, fontWeight: 700, minWidth: 36, textAlign: "right" }}>
                        {pct}%
                      </span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div style={{ height: 8, borderRadius: 6, background: "var(--bg-deep)", overflow: "hidden" }}>
                    <div style={{
                      height: "100%", borderRadius: 6,
                      width: `${pct}%`,
                      background: `linear-gradient(90deg, ${style.color}aa, ${style.color})`,
                      boxShadow: `0 0 8px ${style.color}66`,
                      transition: "width 0.5s ease",
                    }} />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── All clicks table ── */}
      <div className="table-card">
        <div className="table-card-header">
          <span className="table-card-title">All Click Events</span>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Latest {clicks.length} events</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>User</th>
              <th>Name</th>
              <th>Plan</th>
              <th>Amount</th>
              <th>Time</th>
              <th>Exact Date</th>
            </tr>
          </thead>
          <tbody>
            {clicks.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
                  No plan clicks recorded yet. Clicks will appear here in real time.
                </td>
              </tr>
            ) : (
              clicks.map((c, i) => {
                const style = PLAN_COLORS[c.planId] ?? PLAN_COLORS.pro;
                const isGuest = !c.userEmail;
                return (
                  <tr key={String(c._id ?? i)}>
                    {/* Row number */}
                    <td style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700 }}>
                      {i + 1}
                    </td>

                    {/* Email */}
                    <td style={{ fontSize: 12, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {isGuest ? (
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: "rgba(251,191,36,0.1)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.2)" }}>
                          Guest
                        </span>
                      ) : (
                        <span style={{ color: "var(--text-secondary)" }}>{c.userEmail}</span>
                      )}
                    </td>

                    {/* Name */}
                    <td style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      {c.userName || "—"}
                    </td>

                    {/* Plan badge */}
                    <td>
                      <span style={{
                        fontSize: 10, fontWeight: 800, padding: "2px 10px", borderRadius: 999,
                        background: style.bg, color: style.color, border: `1px solid ${style.border}`,
                        textTransform: "uppercase", letterSpacing: "0.5px",
                      }}>
                        {c.planName}
                      </span>
                    </td>

                    {/* Amount */}
                    <td style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: 14 }}>
                      ₹{c.amount.toLocaleString("en-IN")}
                    </td>

                    {/* Relative time */}
                    <td suppressHydrationWarning style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      {c.createdAt
                        ? formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })
                        : "N/A"}
                    </td>

                    {/* Exact timestamp */}
                    <td suppressHydrationWarning style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "monospace", whiteSpace: "nowrap" }}>
                      {c.createdAt
                        ? format(new Date(c.createdAt), "dd MMM yyyy, hh:mm:ss a")
                        : "—"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
