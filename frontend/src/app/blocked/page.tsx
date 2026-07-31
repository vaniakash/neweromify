import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Service Temporarily Unavailable",
  description: "This website is currently unavailable.",
  robots: { index: false, follow: false },
};

export default function BlockedPage() {
  return (
    <>
      <style>{`
        body {
          background-color: white !important;
          color: black !important;
        }
        .blank-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: white;
          z-index: 999999;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: flex-start;
          padding: 50px;
          font-family: sans-serif;
          color: black;
        }
        h1 {
          font-size: 32px;
          font-weight: normal;
          margin-bottom: 20px;
        }
        p {
          font-size: 16px;
          margin-bottom: 8px;
        }
      `}</style>

      <div className="blank-overlay">
        <h1>Service Temporarily Unavailable</h1>
        <p>This website is currently unavailable.</p>
        <p>We're performing maintenance and infrastructure updates.</p>
        <p>Please try again later.</p>
      </div>
    </>
  );
}
