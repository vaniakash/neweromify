import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "This Website Is Unavailable",
  description: "The website you are trying to access is currently unavailable.",
  robots: { index: false, follow: false },
};

export default function BlockedPage() {
  return (
    <>
      <style>{`
        body {
          background-color: #ffffff !important;
          color: #333 !important;
          margin: 0;
          padding: 0;
        }
        .page-container {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background-color: #ffffff;
          z-index: 999999;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }
        .header-wrap {
          background-color: #ffffff;
          width: 100%;
          display: flex;
          justify-content: center;
        }
        .header-content {
          width: 100%;
          max-width: 960px;
          padding: 48px 20px 24px;
        }
        .header-content h1 {
          font-size: 40px;
          font-weight: 700;
          color: #222;
          margin: 0 0 10px 0;
          letter-spacing: -0.5px;
        }
        .header-content p {
          font-size: 17px;
          color: #666;
          margin: 0;
        }
        
        .middle-band {
          background-color: #f2f2f2;
          width: 100%;
          display: flex;
          justify-content: center;
          padding: 40px 20px;
          border-top: 1px solid #eaeaea;
          border-bottom: 1px solid #eaeaea;
        }
        .browser-mockup {
          width: 100%;
          max-width: 920px;
          background: #ffffff;
          border-radius: 6px 6px 0 0;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .browser-top {
          background-color: #9ca3af;
          height: 26px;
          display: flex;
          align-items: flex-end;
          position: relative;
        }
        .browser-dots {
          display: flex;
          gap: 6px;
          position: absolute;
          left: 12px;
          top: 9px;
        }
        .browser-dots span {
          width: 8px; height: 8px;
          background-color: #ffffff;
          border-radius: 50%;
        }
        .browser-tab {
          background-color: #ffffff;
          height: 18px;
          width: 120px;
          border-radius: 4px 4px 0 0;
          margin-left: 60px;
        }
        .browser-content {
          height: 380px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .error-circle {
          width: 120px;
          height: 120px;
          background-color: #cc3333;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .error-cross {
          position: relative;
          width: 48px;
          height: 48px;
        }
        .error-cross::before, .error-cross::after {
          content: '';
          position: absolute;
          top: 50%; left: 50%;
          width: 100%; height: 10px;
          background-color: #ffffff;
          border-radius: 5px;
        }
        .error-cross::before { transform: translate(-50%, -50%) rotate(45deg); }
        .error-cross::after { transform: translate(-50%, -50%) rotate(-45deg); }
        
        .footer-wrap {
          background-color: #ffffff;
          width: 100%;
          display: flex;
          justify-content: center;
        }
        .footer-content {
          width: 100%;
          max-width: 920px;
          padding: 40px 20px 80px;
        }
        .columns {
          display: flex;
          gap: 40px;
          margin-bottom: 40px;
        }
        .column {
          flex: 1;
        }
        .column h2 {
          font-size: 20px;
          font-weight: 500;
          color: #222;
          margin: 0 0 16px 0;
        }
        .column p {
          font-size: 15px;
          color: #555;
          margin: 0;
          line-height: 1.6;
        }
        hr.separator {
          border: 0;
          border-top: 1px solid #f0f0f0;
          margin: 0 0 24px 0;
        }
        .thank-you {
          text-align: center;
          font-size: 14px;
          color: #666;
          margin: 0;
        }

        /* Mobile adjustments */
        @media (max-width: 600px) {
          .columns {
            flex-direction: column;
            gap: 30px;
          }
          .browser-content {
            height: 250px;
          }
        }
      `}</style>

      <div className="page-container">
        {/* Top Header */}
        <div className="header-wrap">
          <div className="header-content">
            <h1>This Website Is Unavailable</h1>
            <p>The website you are trying to access is currently unavailable.</p>
          </div>
        </div>
        
        {/* Middle Band with Browser Window */}
        <div className="middle-band">
          <div className="browser-mockup">
            <div className="browser-top">
              <div className="browser-dots">
                <span />
                <span />
                <span />
              </div>
              <div className="browser-tab" />
            </div>
            <div className="browser-content">
              <div className="error-circle">
                <div className="error-cross" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer Section */}
        <div className="footer-wrap">
          <div className="footer-content">
            <div className="columns">
              <div className="column">
                <h2>What happened?</h2>
                <p>The website you are trying to access is currently<br/>unavailable.</p>
              </div>
              <div className="column">
                <h2>What can I do?</h2>
                <p>Please try again later.</p>
              </div>
            </div>
            <hr className="separator" />
            <p className="thank-you">Thank you for your understanding.</p>
          </div>
        </div>
      </div>
    </>
  );
}
