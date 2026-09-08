"use client";
import { useState } from "react";

interface Country {
  code: string;
  name: string;
  count: number;
}

interface Props {
  visitorsToday: number;
  visitors7d: number;
  visitors30d: number;
  topCountries: Country[];
  maxCountryCount: number;
}

export function VisitorStats({ visitorsToday, visitors7d, visitors30d, topCountries, maxCountryCount }: Props) {
  const [period, setPeriod] = useState<"today" | "7d" | "30d">("today");

  const count = period === "today" ? visitorsToday : period === "7d" ? visitors7d : visitors30d;
  const label = period === "today" ? "Today" : period === "7d" ? "Last 7 Days" : "Last 30 Days";

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 28 }}>
      {/* Visitor Counter Card */}
      <div className="kpi-card" style={{ padding: "24px 28px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "1.2px", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 4 }}>
              Website Visitors
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{label}</div>
          </div>
          <div className="kpi-icon-wrap" style={{ background: "rgba(34,211,238,0.12)", color: "#22d3ee" }}>
            <span className="material-symbols-outlined">visibility</span>
          </div>
        </div>

        {/* Filter buttons */}
        <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
          {(["today", "7d", "30d"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                padding: "4px 12px",
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 700,
                border: "1px solid",
                cursor: "pointer",
                transition: "all 0.2s",
                background: period === p ? "rgba(34,211,238,0.15)" : "transparent",
                borderColor: period === p ? "rgba(34,211,238,0.4)" : "var(--border-subtle)",
                color: period === p ? "#22d3ee" : "var(--text-muted)",
              }}
            >
              {p === "today" ? "Today" : p === "7d" ? "7 Days" : "30 Days"}
            </button>
          ))}
        </div>

        {/* Big number */}
        <div style={{ fontSize: 48, fontWeight: 900, lineHeight: 1, color: "var(--text-primary)", marginBottom: 8 }}>
          {count.toLocaleString()}
        </div>
        <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
          page views tracked
        </div>

        {/* Mini comparison bar */}
        <div style={{ marginTop: 20, display: "flex", gap: 12, alignItems: "center" }}>
          {[
            { label: "Today", val: visitorsToday, color: "#22d3ee" },
            { label: "7d", val: visitors7d, color: "#7c6cfe" },
            { label: "30d", val: visitors30d, color: "#34d399" },
          ].map((item) => {
            const max = Math.max(visitorsToday, visitors7d, visitors30d, 1);
            return (
              <div key={item.label} style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: item.color, marginBottom: 4 }}>
                  {item.val.toLocaleString()}
                </div>
                <div style={{ height: 4, background: "var(--bg-deep)", borderRadius: 2, overflow: "hidden", marginBottom: 4 }}>
                  <div style={{ width: `${(item.val / max) * 100}%`, height: "100%", background: item.color, borderRadius: 2 }} />
                </div>
                <div style={{ fontSize: 9, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>
                  {item.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top 5 Countries Card */}
      <div className="kpi-card" style={{ padding: "24px 28px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "1.2px", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 4 }}>
              Top Countries
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>By page views · all time</div>
          </div>
          <div className="kpi-icon-wrap" style={{ background: "rgba(124,108,254,0.12)", color: "#7c6cfe" }}>
            <span className="material-symbols-outlined">public</span>
          </div>
        </div>

        {topCountries.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {topCountries.map((c, i) => {
              const pct = Math.round((c.count / maxCountryCount) * 100);
              const colors = ["#7c6cfe", "#22d3ee", "#34d399", "#fbbf24", "#f472b6"];
              const color = colors[i] ?? "#7c6cfe";
              return (
                <div key={c.code}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                      {c.name}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 800, color }}>
                      {c.count.toLocaleString()}
                    </span>
                  </div>
                  <div style={{ height: 6, background: "var(--bg-deep)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{
                      width: `${pct}%`,
                      height: "100%",
                      background: color,
                      borderRadius: 3,
                      boxShadow: `0 0 6px ${color}66`,
                      transition: "width 0.6s ease",
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-muted)", fontSize: 13 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 36, display: "block", marginBottom: 8 }}>public_off</span>
            No country data yet.<br />
            <span style={{ fontSize: 11 }}>Country tracking starts once users visit on production.</span>
          </div>
        )}
      </div>
    </div>
  );
}
