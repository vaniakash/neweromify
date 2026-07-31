import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Access Restricted | Eromify",
  description: "This website is only available in India.",
  robots: { index: false, follow: false },
};

export default function BlockedPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'Inter', sans-serif;
          background: #060610;
          color: #fff;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-14px); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.95); opacity: 0.7; }
          70% { transform: scale(1.15); opacity: 0; }
          100% { transform: scale(1.15); opacity: 0; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 1; }
        }
        @keyframes scanline {
          0%   { top: -10%; }
          100% { top: 110%; }
        }

        .blocked-root {
          position: relative;
          width: 100vw;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #060610 0%, #0a0510 50%, #07060f 100%);
        }

        /* Background blobs */
        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
        }
        .blob-1 { top: -80px; left: 50%; transform: translateX(-50%); width: 600px; height: 600px; background: radial-gradient(circle, rgba(239,68,68,0.10) 0%, transparent 65%); }
        .blob-2 { bottom: -80px; left: 10%; width: 400px; height: 400px; background: radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 65%); }
        .blob-3 { top: 40%; right: -60px; width: 350px; height: 350px; background: radial-gradient(circle, rgba(239,68,68,0.06) 0%, transparent 65%); }

        /* Grid */
        .grid-bg {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 60px 60px;
        }

        /* Stars */
        .star {
          position: absolute;
          border-radius: 50%;
          background: rgba(255,255,255,0.55);
          animation: glow-pulse 3s ease-in-out infinite;
        }

        /* Card */
        .card {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 480px;
          margin: 0 24px;
          background: linear-gradient(160deg, #0e0e20 0%, #131328 100%);
          border: 1px solid rgba(239,68,68,0.35);
          border-radius: 28px;
          padding: 52px 44px 44px;
          text-align: center;
          box-shadow:
            0 0 0 1px rgba(239,68,68,0.2),
            0 30px 80px rgba(239,68,68,0.15),
            inset 0 1px 0 rgba(255,255,255,0.05);
          animation: fadeUp 0.6s cubic-bezier(.22,1,.36,1) both;
          overflow: hidden;
        }

        /* Scanline effect */
        .card::after {
          content: "";
          position: absolute;
          left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(239,68,68,0.4), transparent);
          animation: scanline 4s linear infinite;
          pointer-events: none;
        }

        /* Top accent line */
        .card-accent {
          position: absolute;
          top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, #ef4444, transparent);
          border-radius: 28px 28px 0 0;
        }

        /* Icon ring */
        .icon-wrap {
          position: relative;
          width: 88px;
          height: 88px;
          margin: 0 auto 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: float 5s ease-in-out infinite;
        }
        .icon-ring {
          position: absolute;
          inset: -6px;
          border-radius: 50%;
          border: 1.5px solid rgba(239,68,68,0.4);
          animation: pulse-ring 2.5s ease-out infinite;
        }
        .icon-bg {
          width: 88px;
          height: 88px;
          border-radius: 50%;
          background: linear-gradient(135deg, #7f1d1d, #dc2626);
          box-shadow: 0 0 40px rgba(239,68,68,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 40px;
        }

        /* Badge */
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 14px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          background: rgba(239,68,68,0.1);
          color: #f87171;
          border: 1px solid rgba(239,68,68,0.25);
          margin-bottom: 20px;
        }
        .badge-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #ef4444;
          box-shadow: 0 0 6px #ef4444;
          animation: glow-pulse 1.5s ease-in-out infinite;
        }

        h1 {
          font-size: 32px;
          font-weight: 900;
          color: #fff;
          line-height: 1.1;
          margin-bottom: 12px;
          letter-spacing: -0.5px;
        }
        h1 span { color: #ef4444; }

        .subtitle {
          font-size: 15px;
          color: rgba(255,255,255,0.45);
          line-height: 1.6;
          margin-bottom: 32px;
        }

        /* Flag detail */
        .flag-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 14px 20px;
          border-radius: 14px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          margin-bottom: 28px;
          font-size: 13px;
          font-weight: 600;
          color: rgba(255,255,255,0.5);
        }
        .flag-emoji { font-size: 22px; }
        .flag-text strong { color: rgba(255,255,255,0.85); }

        /* Error code */
        .error-code {
          font-size: 11px;
          font-family: monospace;
          color: rgba(255,255,255,0.2);
          letter-spacing: 1px;
        }
      `}</style>

      <div className="blocked-root">
        {/* Background */}
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
        <div className="grid-bg" />

        {/* Scattered stars */}
        {[
          { top: "8%",  left: "12%",  size: 2, delay: "0s" },
          { top: "15%", left: "85%",  size: 1.5, delay: "0.8s" },
          { top: "75%", left: "8%",   size: 2, delay: "1.2s" },
          { top: "80%", left: "90%",  size: 1, delay: "0.3s" },
          { top: "40%", left: "5%",   size: 1.5, delay: "2s" },
          { top: "55%", left: "95%",  size: 2, delay: "0.6s" },
          { top: "25%", left: "55%",  size: 1, delay: "1.5s" },
          { top: "90%", left: "45%",  size: 1.5, delay: "0.9s" },
        ].map((s, i) => (
          <div
            key={i}
            className="star"
            style={{
              top: s.top, left: s.left,
              width: s.size, height: s.size,
              animationDelay: s.delay,
              animationDuration: `${2 + i * 0.4}s`,
            }}
          />
        ))}

        {/* Card */}
        <div className="card">
          <div className="card-accent" />

          {/* Icon */}
          <div className="icon-wrap">
            <div className="icon-ring" />
            <div className="icon-bg">🚫</div>
          </div>

          {/* Badge */}
          <div className="badge">
            <div className="badge-dot" />
            Access Restricted
          </div>

          <h1>This website is <span>blocked</span> in your region</h1>

          <p className="subtitle">
            Eromify is currently only available in India.
            We are not accessible from your location at this time.
          </p>

          {/* Flag row */}
          <div className="flag-row">
            <span className="flag-emoji">🇮🇳</span>
            <div className="flag-text">
              Available exclusively in <strong>India</strong>
            </div>
          </div>

          <div className="error-code">ERR_GEO_RESTRICTED · EROMIFY</div>
        </div>
      </div>
    </>
  );
}
