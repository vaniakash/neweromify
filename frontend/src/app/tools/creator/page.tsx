"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { ChevronRight, ArrowRight, Wand2, Sparkles, Lock } from "lucide-react";

export default function CreatorHub() {
  const { status } = useSession();
  const [isPro, setIsPro] = useState(false);
  const [isEnterprise, setIsEnterprise] = useState(false);

  useEffect(() => {
    const check = () => {
      setIsPro(localStorage.getItem("eromify_pro") === "true");
    };
    check();
    window.addEventListener("eromify_pro_updated", check);
    return () => window.removeEventListener("eromify_pro_updated", check);
  }, []);

  // Also fetch server-side isPro + isEnterprise so localStorage doesn't lie
  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/user/sync-pro")
      .then((r) => r.json())
      .then((d) => {
        if (d.isPro || d.credits > 0) {
          setIsPro(true);
          localStorage.setItem("eromify_pro", "true");
        }
        setIsEnterprise(!!d.motionControlAccess);
      })
      .catch(() => { });
  }, [status]);

  return (
    <div className="flex flex-col min-h-full bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-8">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
            <Link href="/" className="hover:text-[#1736cf]">Dashboard</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-slate-900 font-medium">Creator Tools</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <Wand2 className="h-8 w-8 text-[#1736cf]" />
            Creator Toolkit
          </h1>
          <p className="text-slate-500 mt-2 text-base max-w-2xl leading-relaxed">
            A growing collection of creative and AI-powered tools designed to help you generate stunning visuals and automate creative workflows.
          </p>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="flex-1 max-w-screen-xl mx-auto w-full px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* ── AI Influencer Creator ─────────────────────────────────────── */}
          {isPro ? (
            <Link
              href="/tools/creator/ai-influencer"
              className="group block rounded-2xl overflow-hidden border border-slate-200 hover:border-violet-400 hover:shadow-2xl transition-all duration-300 shadow-md bg-white"
            >
              <div className="h-60 w-full relative overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/couple.webp" alt="AI Influencer Creator" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%)" }} />
                {/* Transparent action overlay icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                    style={{ background: "rgba(255,255,255,0.22)", backdropFilter: "blur(8px)", border: "2px solid rgba(255,255,255,0.5)", boxShadow: "0 4px 24px rgba(0,0,0,0.18)" }}>
                    <Sparkles className="w-7 h-7 text-white" />
                  </div>
                </div>
                <div className="absolute bottom-3 left-3 flex gap-1.5 flex-wrap">
                  {["18+ Only", "NSFW", "Popular", "Auto Gallery"].map((label) => (
                    <span key={label} className="px-2 py-0.5 rounded-full text-[11px] font-bold"
                      style={{
                        background: label === "18+ Only" || label === "NSFW" ? "rgba(220,38,38,0.75)" : "rgba(255,255,255,0.2)",
                        color: "white",
                        border: "1px solid rgba(255,255,255,0.35)",
                        backdropFilter: "blur(6px)",
                      }}>
                      {label}
                    </span>
                  ))}
                </div>
              </div>
              <div className="p-5 bg-white">
                <h2 className="text-slate-900 text-2xl font-bold tracking-tight mb-1.5">AI Influencer Creator</h2>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Create ultra-realistic AI influencer images. Generate, edit, and blend — every image is securely saved to your gallery.
                </p>
              </div>
              <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50 group-hover:bg-violet-50 transition-colors">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-violet-500" />
                  <span className="text-slate-800 font-bold">Create Influencer</span>
                </div>
                <ArrowRight className="h-5 w-5 text-violet-500 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ) : (
            <div className="block rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-white opacity-80">
              <div className="h-60 w-full relative overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/couple.webp" alt="AI Influencer Creator" className="w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%)" }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)", border: "2px solid rgba(255,255,255,0.4)" }}>
                    <Sparkles className="w-7 h-7 text-white" />
                  </div>
                </div>
                <div className="absolute bottom-3 left-3 flex gap-1.5 flex-wrap">
                  {["18+ Only", "NSFW", "Popular", "Auto Gallery"].map((label) => (
                    <span key={label} className="px-2 py-0.5 rounded-full text-[11px] font-bold"
                      style={{
                        background: label === "18+ Only" || label === "NSFW" ? "rgba(220,38,38,0.75)" : "rgba(255,255,255,0.2)",
                        color: "white", border: "1px solid rgba(255,255,255,0.35)", backdropFilter: "blur(6px)",
                      }}>
                      {label}
                    </span>
                  ))}
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1"
                    style={{ background: "rgba(0,0,0,0.45)", color: "white", border: "1px solid rgba(255,255,255,0.3)", backdropFilter: "blur(6px)" }}>
                    <Lock style={{ width: 9, height: 9 }} /> Needs Pro
                  </span>
                </div>
              </div>
              <div className="p-5 bg-white">
                <h2 className="text-slate-900 text-2xl font-bold tracking-tight mb-1.5">AI Influencer Creator</h2>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Create ultra-realistic AI influencer images. Generate, edit, and blend — every image is securely saved to your gallery.
                </p>
              </div>
              <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-400 font-bold">Create Influencer</span>
                </div>
                <Link href="/pricing" className="text-[11px] font-black text-amber-600 border border-amber-400/40 bg-amber-50 rounded-full px-3 py-1 hover:bg-amber-100 transition">
                  Upgrade →
                </Link>
              </div>
            </div>
          )}

          {/* ── AI Image Editor ───────────────────────────────────────────── */}
          <Link
            href="/tools/creator/image-editor"
            className="group block rounded-2xl overflow-hidden border border-slate-200 hover:border-violet-400 hover:shadow-2xl transition-all duration-300 shadow-md bg-white"
          >
            <div className="h-60 w-full relative overflow-hidden bg-gradient-to-br from-violet-100 via-slate-100 to-blue-100 flex items-center justify-center">
              {/* Action icon overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-white shadow-lg border border-slate-200 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <svg className="w-9 h-9 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  <div className="w-20 h-20 rounded-2xl bg-white shadow-lg border border-blue-200 flex items-center justify-center group-hover:scale-105 transition-transform duration-300" style={{ transitionDelay: "50ms" }}>
                    <svg className="w-9 h-9 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-3 left-3 flex gap-1.5 flex-wrap">
                {["Style Transfer", "100 Credits"].map((label) => (
                  <span key={label} className="px-2 py-0.5 rounded-full text-[11px] font-bold"
                    style={{ background: "rgba(109,40,217,0.12)", color: "#7c3aed", border: "1px solid rgba(109,40,217,0.2)", backdropFilter: "blur(6px)" }}>
                    {label}
                  </span>
                ))}
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold"
                  style={{ background: "rgba(16,185,129,0.15)", color: "#059669", border: "1px solid rgba(16,185,129,0.3)", backdropFilter: "blur(6px)" }}>
                  Free Credits
                </span>
              </div>
            </div>
            <div className="p-5 bg-white">
              <h2 className="text-slate-900 text-2xl font-bold tracking-tight mb-1.5">AI Image Editor</h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                Transfer outfits, lighting, and style from any reference photo onto your own image — your face stays untouched.
              </p>
            </div>
            <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50 group-hover:bg-violet-50 transition-colors">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-violet-500" />
                <span className="text-slate-800 font-bold">Edit Image</span>
              </div>
              <ArrowRight className="h-5 w-5 text-violet-500 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* ── AI Image Generator ────────────────────────────────────────── */}
          <Link
            href="/tools/creator/image-generator"
            className="group block rounded-2xl overflow-hidden border border-slate-200 hover:border-violet-400 hover:shadow-2xl transition-all duration-300 shadow-md bg-white"
          >
            <div className="h-60 w-full relative overflow-hidden">
              <Image
                src="/imagegenerationposter.png"
                alt="AI Image Generator"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%)" }} />
              {/* Transparent action overlay icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                  style={{ background: "rgba(255,255,255,0.22)", backdropFilter: "blur(8px)", border: "2px solid rgba(255,255,255,0.5)", boxShadow: "0 4px 24px rgba(0,0,0,0.18)" }}>
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
              </div>
              <div className="absolute bottom-3 left-3 flex gap-1.5 flex-wrap">
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold"
                  style={{ background: "rgba(255,255,255,0.2)", color: "white", border: "1px solid rgba(255,255,255,0.35)", backdropFilter: "blur(6px)" }}>
                  No Watermark
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold"
                  style={{ background: "rgba(16,185,129,0.75)", color: "white", border: "1px solid rgba(255,255,255,0.3)", backdropFilter: "blur(6px)" }}>
                  Credits Required
                </span>
              </div>
            </div>
            <div className="p-5 bg-white">
              <h2 className="text-slate-900 text-2xl font-bold tracking-tight mb-1.5">AI Image Generator</h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                Turn any text prompt into stunning, high-resolution images without watermarks. Ideal for brands, marketers, and creators.
              </p>
            </div>
            <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50 group-hover:bg-violet-50 transition-colors">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-violet-500" />
                <span className="text-slate-800 font-bold">Generate Images</span>
              </div>
              <ArrowRight className="h-5 w-5 text-violet-500 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>



          {/* ── Kling Video Generator ─────────────────────────────────────── */}
          {/* Render as <div> for non-Enterprise to avoid nested <a> hydration error */}
          {isEnterprise ? (
            <Link
              href="/tools/creator/kling-video"
              className="group block rounded-2xl overflow-hidden border border-slate-200 hover:border-violet-400 hover:shadow-2xl transition-all duration-300 shadow-md bg-white"
            >
              {/* Thumbnail with play overlay */}
              <div className="h-60 w-full relative overflow-hidden">
                <Image
                  src="/images/kling.jpg"
                  alt="Kling Video Generator"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Dark gradient overlay at bottom for badges */}
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%)" }} />
                {/* Transparent play button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                    style={{ background: "rgba(255,255,255,0.22)", backdropFilter: "blur(8px)", border: "2px solid rgba(255,255,255,0.5)", boxShadow: "0 4px 24px rgba(0,0,0,0.18)" }}>
                    <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7 ml-1" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
                {/* Badges on top of image */}
                <div className="absolute bottom-3 left-3 flex gap-1.5 flex-wrap">
                  {["1080p HD", "Image-to-Video", "NSFW"].map((label) => (
                    <span key={label} className="px-2 py-0.5 rounded-full text-[11px] font-bold"
                      style={{
                        background: label === "NSFW" ? "rgba(220,38,38,0.75)" : "rgba(255,255,255,0.2)",
                        color: "white",
                        border: "1px solid rgba(255,255,255,0.35)",
                        backdropFilter: "blur(6px)",
                      }}>
                      {label}
                    </span>
                  ))}
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold"
                    style={{ background: "rgba(245,158,11,0.75)", color: "white", border: "1px solid rgba(255,255,255,0.3)", backdropFilter: "blur(6px)" }}>
                    15 Credits
                  </span>
                </div>
              </div>
              {/* Body */}
              <div className="p-5 bg-white">
                <h2 className="text-slate-900 text-2xl font-bold tracking-tight mb-1.5">Kling Video Generator</h2>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Transform any image into a stunning 1080p video using Kling V3 Turbo Pro.
                </p>
              </div>
              {/* Footer */}
              <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50 group-hover:bg-violet-50 transition-colors">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-violet-500" />
                  <span className="text-slate-800 font-bold">Generate Video</span>
                </div>
                <ArrowRight className="h-5 w-5 text-violet-500 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ) : (
            <div className="block rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-white opacity-80">
              {/* Thumbnail with play + lock overlay */}
              <div className="h-60 w-full relative overflow-hidden">
                <Image
                  src="/images/kling.jpg"
                  alt="Kling Video Generator"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%)" }} />
                {/* Transparent play button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)", border: "2px solid rgba(255,255,255,0.4)" }}>
                    <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7 ml-1" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
                {/* Badges */}
                <div className="absolute bottom-3 left-3 flex gap-1.5 flex-wrap">
                  {["1080p HD", "Image-to-Video", "NSFW"].map((label) => (
                    <span key={label} className="px-2 py-0.5 rounded-full text-[11px] font-bold"
                      style={{
                        background: label === "NSFW" ? "rgba(220,38,38,0.75)" : "rgba(255,255,255,0.2)",
                        color: "white",
                        border: "1px solid rgba(255,255,255,0.35)",
                        backdropFilter: "blur(6px)",
                      }}>
                      {label}
                    </span>
                  ))}
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold"
                    style={{ background: "rgba(245,158,11,0.75)", color: "white", border: "1px solid rgba(255,255,255,0.3)", backdropFilter: "blur(6px)" }}>
                    15 Credits
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1"
                    style={{ background: "rgba(0,0,0,0.45)", color: "white", border: "1px solid rgba(255,255,255,0.3)", backdropFilter: "blur(6px)" }}>
                    <Lock style={{ width: 9, height: 9 }} /> Enterprise Only
                  </span>
                </div>
              </div>
              {/* Body */}
              <div className="p-5 bg-white">
                <h2 className="text-slate-900 text-2xl font-bold tracking-tight mb-1.5">Kling Video Generator</h2>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Transform any image into a stunning 1080p video using Kling V3 Turbo Pro.
                </p>
              </div>
              {/* Footer */}
              <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-400 font-bold">Generate Video</span>
                </div>
                <Link
                  href="/pricing"
                  className="text-[11px] font-black text-amber-600 border border-amber-400/40 bg-amber-50 rounded-full px-3 py-1 hover:bg-amber-100 transition"
                >
                  Upgrade →
                </Link>
              </div>
            </div>
          )}

        </div>



      </div>
    </div>
  );
}
