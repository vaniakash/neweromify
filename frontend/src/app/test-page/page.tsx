"use client";

import { useState, useEffect } from "react";
import Script from "next/script";

export default function TestPage() {
  const [status, setStatus] = useState<string>("Loading script...");
  const [sdkReady, setSdkReady] = useState(false);

  // Use the env variable directly for local testing
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";

  useEffect(() => {
    if (sdkReady && (window as any).paypal) {
      setStatus("Ready to pay $1");
      (window as any).paypal.Buttons({
        createOrder: async () => {
          setStatus("Creating Order...");
          const res = await fetch("/api/payment/test-paypal-create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          });
          
          if (!res.ok) {
            const error = await res.text();
            setStatus(`Error creating order: ${error}`);
            throw new Error(error);
          }

          const data = await res.json();
          setStatus(`Order Created: ${data.orderID}`);
          return data.orderID;
        },
        onApprove: async (data: { orderID: string }) => {
          setStatus("Capturing Payment...");
          const res = await fetch("/api/payment/test-paypal-capture", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderID: data.orderID }),
          });

          if (!res.ok) {
            const error = await res.text();
            setStatus(`Error capturing order: ${error}`);
            return;
          }

          setStatus("✅ Payment Successful! Credentials work.");
        },
        onError: (err: unknown) => {
          setStatus(`PayPal SDK Error: ${String(err)}`);
          console.error("PayPal Error:", err);
        }
      }).render("#paypal-button-container");
    }
  }, [sdkReady]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50 text-gray-900">
      {clientId && (
        <Script
          src={`https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`}
          strategy="lazyOnload"
          onLoad={() => setSdkReady(true)}
          onError={() => setStatus("Failed to load PayPal SDK.")}
        />
      )}
      
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg text-center">
        <h1 className="text-2xl font-bold mb-4">PayPal $1 Test</h1>
        <p className="mb-6 text-sm text-gray-500">
          This is a dedicated test page to verify if your Live PayPal credentials are working end-to-end.
          It will attempt to charge $1.00 USD.
        </p>

        <div className="mb-6 p-4 bg-gray-100 rounded text-sm text-left font-mono break-all">
          <strong>Client ID:</strong><br />
          {clientId ? `${clientId.substring(0, 15)}...${clientId.substring(clientId.length - 15)}` : "Missing"}
        </div>

        <div className="mb-6 font-semibold text-blue-600">
          Status: {status}
        </div>

        {clientId ? (
          <div id="paypal-button-container" className="mt-4 min-h-[150px]"></div>
        ) : (
          <p className="text-red-500">NEXT_PUBLIC_PAYPAL_CLIENT_ID is not set in .env.local</p>
        )}
      </div>
    </div>
  );
}
