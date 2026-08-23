"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight, Upload, X, Sparkles, Download, RefreshCw,
  Film, Play, AlertTriangle, Loader2, Clapperboard, ImageIcon, Lock, Crown,
} from "lucide-react";

const DURATION_OPTIONS = ["3", "5", "8", "10"] as const;
type Duration = typeof DURATION_OPTIONS[number];

const STAGES = [
  { label: "Initializing",   desc: "Preparing your request",          pct: 5,  color: "#c084fc" },
  { label: "Uploading",      desc: "Sending image to Kling AI",        pct: 18, color: "#818cf8" },
  { label: "Queuing",        desc: "Waiting for GPU slot",             pct: 35, color: "#60a5fa" },
  { label: "Rendering",      desc: "Generating 1080p video frames",    pct: 80, color: "#34d399" },
  { label: "Finalizing",     desc: "Encoding & optimising video",      pct: 97, color: "#fbbf24" },
];

export default function KinkVideoPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [credits, setCredits]             = useState<number | null>(null);
  const [hasEnterprise, setHasEnterprise] = useState<boolean | null>(null);
  const [prompt, setPrompt]               = useState("");
  const [duration, setDuration]           = useState<Duration>("5");
  const [imageFile, setImageFile]         = useState<File | null>(null);
  const [imagePreview, setImagePreview]   = useState<string | null>(null);
  const [imageDataUri, setImageDataUri]   = useState<string | null>(null);

  const [generating, setGenerating]       = useState(false);
  const [progress, setProgress]           = useState(0);
  const [stageIdx, setStageIdx]           = useState(0);
  const [elapsed, setElapsed]             = useState(0);
  const [videoUrl, setVideoUrl]           = useState<string | null>(null);
  const [error, setError]                 = useState<string | null>(null);

  const fileInputRef  = useRef<HTMLInputElement>(null);
  const progressRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef    = useRef<ReturnType<typeof setInterval> | null>(null);

  // Redirect if not signed in
  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  // Load credits + Enterprise access
  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/user/sync-pro")
      .then((r) => r.json())
      .then((d) => {
        setHasEnterprise(!!d.motionControlAccess);
        setCredits(typeof d.credits === "number" ? Math.floor(d.credits / 100) : null);
      })
      .catch(() => setHasEnterprise(false));
  }, [status]);

  // Handle image selection
  const handleImageChange = (file: File) => {
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const uri = e.target?.result as string;
      setImagePreview(uri);
      setImageDataUri(uri);
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageDataUri(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const clearIntervals = useCallback(() => {
    if (progressRef.current) clearInterval(progressRef.current);
    if (elapsedRef.current)  clearInterval(elapsedRef.current);
  }, []);

  const startProgress = useCallback(() => {
    setProgress(0);
    setStageIdx(0);
    setElapsed(0);
    const start = Date.now();

    elapsedRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);

    let pct = 0;
    progressRef.current = setInterval(() => {
      pct = Math.min(pct + 0.4, 97);
      setProgress(pct);
      // Pick stage
      const idx = STAGES.findLastIndex((s) => pct >= s.pct);
      setStageIdx(Math.max(0, idx));
    }, 800);
  }, []);

  const handleGenerate = async () => {
    if (generating) return;
    if (!session) { router.push("/login"); return; }
    if (!imageDataUri && !prompt.trim()) {
      setError("Please provide an image or a prompt.");
      return;
    }

    setError(null);
    setVideoUrl(null);
    setGenerating(true);
    startProgress();

    try {
      const res = await fetch("/api/kling-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          image: imageDataUri ?? undefined,
          duration,
        }),
      });

      clearIntervals();

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 402) {
          setError(`Not enough credits. ${data.error ?? ""}`);
        } else {
          setError(data.error ?? "Generation failed. Please try again.");
        }
        setGenerating(false);
        setProgress(0);
        return;
      }

      const data = await res.json();
      setProgress(100);
      setVideoUrl(data.videoUrl);
      if (typeof data.creditsRemaining === "number") {
        setCredits(Math.floor(data.creditsRemaining / 100));
      }
    } catch {
      clearIntervals();
      setError("Network error. Please try again.");
    } finally {
      clearIntervals();
      setGenerating(false);
    }
  };

  const currentStage = STAGES[stageIdx];

  if (status === "loading" || hasEnterprise === null) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #0a0a16 0%, #12062a 100%)" }}>
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  // ── Enterprise-only locked screen ─────────────────────────────────────────────
  if (!hasEnterprise) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(135deg, #0a0a16 0%, #12062a 50%, #0a0a16 100%)" }}>
        {/* Header */}
        <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}
          className="px-6 py-4">
          <div className="max-w-5xl mx-auto flex items-center gap-2 text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
            <Link href="/tools/creator" className="hover:text-purple-400 transition-colors">Creator Tools</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-purple-300 font-semibold">🎬 Kling Video Generator</span>
          </div>
        </div>

        {/* Locked content */}
        <div className="flex-1 flex items-center justify-center px-6 py-20">
          <div className="max-w-lg w-full text-center">
            {/* Animated lock */}
            <div className="relative mx-auto w-28 h-28 mb-8">
              <div className="absolute inset-0 rounded-3xl animate-pulse"
                style={{ background: "linear-gradient(135deg, rgba(251,191,36,0.2), rgba(245,158,11,0.1))", border: "1px solid rgba(251,191,36,0.3)" }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <Lock className="w-12 h-12 text-amber-400" />
              </div>
            </div>

            {/* Pack badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{ background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.35)", color: "#fbbf24" }}>
              <Crown className="w-4 h-4" />
              <span className="text-sm font-black">Enterprise Pack Exclusive</span>
            </div>

            <h1 className="text-4xl font-black text-white mb-4">
              🎬 Kling Video Generator
            </h1>
            <p className="text-lg mb-3" style={{ color: "rgba(255,255,255,0.5)" }}>
              Generate stunning <span className="text-purple-300 font-bold">1080p AI videos</span> using Kling V3 Turbo Pro.
              This feature is exclusively available to Enterprise Pack members.
            </p>

            {/* Plan card */}
            <div className="rounded-2xl p-6 mb-8 text-left"
              style={{ background: "linear-gradient(135deg, rgba(251,191,36,0.08), rgba(245,158,11,0.04))", border: "1px solid rgba(251,191,36,0.25)" }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-white font-black text-xl">Enterprise Pack</p>
                  <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>One-time payment · 30,000 credits</p>
                </div>
                <div className="text-right">
                  <p className="text-amber-400 font-black text-3xl">₹3,999</p>
                  <p className="text-xs line-through" style={{ color: "rgba(255,255,255,0.3)" }}>₹7,999 · ↓50% OFF</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  "🎬 Kling V3 Video (1080p)",
                  "🎨 30,000 AI Credits",
                  "🤖 Claude MCP Automation",
                  "🎭 Motion Control",
                  "🚀 Priority Queue",
                  "♾️ Credits Never Expire",
                ].map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            <Link href="/pricing"
              className="inline-flex items-center justify-center gap-2 w-full py-4 rounded-xl font-black text-lg text-white transition-all"
              style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", boxShadow: "0 8px 30px rgba(245,158,11,0.4)" }}>
              <Crown className="w-5 h-5" />
              Upgrade to Enterprise Pack
            </Link>
            <p className="text-xs mt-3" style={{ color: "rgba(255,255,255,0.25)" }}>
              One-time purchase · No subscription · Credits never expire
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #0a0a16 0%, #12062a 50%, #0a0a16 100%)" }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", backdropFilter: "blur(12px)" }}
        className="sticky top-0 z-10 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
            <Link href="/tools/creator" className="hover:text-purple-400 transition-colors">Creator Tools</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-purple-300 font-semibold flex items-center gap-1.5">
              <span>🎬</span> Kling Video Generator
            </span>
          </div>
          {credits !== null && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold"
              style={{ background: "rgba(192,132,252,0.12)", color: "#c084fc", border: "1px solid rgba(192,132,252,0.25)" }}>
              <Sparkles className="w-3.5 h-3.5" />
              {credits} credits
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Title */}
        <div className="mb-10 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
              style={{ background: "linear-gradient(135deg, rgba(192,132,252,0.2), rgba(99,102,241,0.2))", border: "1px solid rgba(192,132,252,0.3)" }}>
              🎬
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">Kling Video Generator</h1>
          </div>
          <p className="text-lg max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.45)" }}>
            Turn any image into a stunning 1080p video using <span className="text-purple-400 font-semibold">Kling V3 Turbo Pro</span>. Add a prompt to guide the motion.
          </p>
          <div className="flex items-center justify-center gap-3 mt-4 flex-wrap">
            {["1080p HD", "Up to 10s", "Image-to-Video", "Kling V3 Turbo"].map((badge) => (
              <span key={badge} className="px-3 py-1 rounded-full text-xs font-bold"
                style={{ background: "rgba(192,132,252,0.1)", color: "rgba(192,132,252,0.9)", border: "1px solid rgba(192,132,252,0.2)" }}>
                {badge}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT: Controls */}
          <div className="space-y-6">
            {/* Image Upload */}
            <div className="rounded-2xl p-6"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <label className="block text-sm font-bold text-white mb-3 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-purple-400" />
                Reference Image <span className="text-purple-400">*</span>
              </label>
              {imagePreview ? (
                <div className="relative rounded-xl overflow-hidden" style={{ aspectRatio: "16/9" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                  <button onClick={clearImage}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                    style={{ background: "rgba(0,0,0,0.7)", border: "1px solid rgba(255,255,255,0.15)" }}>
                    <X className="w-4 h-4 text-white" />
                  </button>
                  {imageFile && (
                    <div className="absolute bottom-2 left-2 px-2 py-1 rounded-lg text-xs text-white font-medium"
                      style={{ background: "rgba(0,0,0,0.7)" }}>
                      {imageFile.name}
                    </div>
                  )}
                </div>
              ) : (
                <button onClick={() => fileInputRef.current?.click()}
                  className="w-full rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-3 py-12 transition-all hover:border-purple-500/50 hover:bg-purple-500/5"
                  style={{ borderColor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.4)" }}>
                  <Upload className="w-8 h-8" />
                  <div className="text-center">
                    <p className="text-sm font-semibold text-white">Upload Image</p>
                    <p className="text-xs mt-1">JPG, PNG, WebP · Max 50MB · Min 300px</p>
                  </div>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => { if (e.target.files?.[0]) handleImageChange(e.target.files[0]); }}
              />
            </div>

            {/* Prompt */}
            <div className="rounded-2xl p-6"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <label className="block text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Clapperboard className="w-4 h-4 text-purple-400" />
                Motion Prompt <span style={{ color: "rgba(255,255,255,0.35)" }} className="font-normal">(optional)</span>
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                maxLength={2500}
                rows={4}
                placeholder="Describe the motion: e.g. 'She softly smiles, hair drifts gently, dappled light, photorealistic'"
                className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 resize-none outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(192,132,252,0.5)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
              />
              <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.25)" }}>
                {prompt.length}/2500 characters
              </p>
            </div>

            {/* Duration */}
            <div className="rounded-2xl p-6"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <label className="block text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Film className="w-4 h-4 text-purple-400" />
                Duration
              </label>
              <div className="grid grid-cols-4 gap-2">
                {DURATION_OPTIONS.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className="py-2.5 rounded-xl text-sm font-bold transition-all"
                    style={duration === d
                      ? { background: "linear-gradient(135deg, #c084fc, #818cf8)", color: "#fff", boxShadow: "0 4px 15px rgba(192,132,252,0.4)" }
                      : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.08)" }
                    }
                  >
                    {d}s
                  </button>
                ))}
              </div>
              <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.3)" }}>
                Cost: <span className="text-purple-400 font-bold">15 credits</span> · Longer = more detail
              </p>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={generating || (!imageDataUri && !prompt.trim())}
              className="w-full py-4 rounded-xl font-black text-lg flex items-center justify-center gap-3 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: generating
                  ? "rgba(192,132,252,0.2)"
                  : "linear-gradient(135deg, #c084fc 0%, #818cf8 50%, #60a5fa 100%)",
                boxShadow: generating ? "none" : "0 8px 30px rgba(192,132,252,0.4)",
                color: "#fff",
              }}>
              {generating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <span>🎬</span>
                  Generate Video — 15 Credits
                </>
              )}
            </button>
          </div>

          {/* RIGHT: Output */}
          <div className="space-y-6">
            {/* Progress */}
            {generating && (
              <div className="rounded-2xl p-6"
                style={{ background: "rgba(192,132,252,0.05)", border: "1px solid rgba(192,132,252,0.2)" }}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-white font-bold text-sm">{currentStage.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{currentStage.desc}</p>
                  </div>
                  <span className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.35)" }}>
                    {elapsed}s elapsed
                  </span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${currentStage.color}, #c084fc)` }}
                  />
                </div>
                <p className="text-xs text-right mt-1 font-mono" style={{ color: currentStage.color }}>
                  {Math.round(progress)}%
                </p>
                <div className="mt-4 grid grid-cols-5 gap-1">
                  {STAGES.map((s, i) => (
                    <div key={s.label} className="text-center">
                      <div className="h-1 rounded-full mb-1"
                        style={{ background: i <= stageIdx ? s.color : "rgba(255,255,255,0.08)" }} />
                      <p className="text-xs" style={{ color: i <= stageIdx ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.2)", fontSize: "9px" }}>
                        {s.label}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-center mt-4" style={{ color: "rgba(255,255,255,0.3)" }}>
                  ⏱ Kling V3 Turbo Pro typically takes 1–3 minutes
                </p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="rounded-2xl p-5 flex gap-3"
                style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)" }}>
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-300 font-semibold text-sm">Generation Failed</p>
                  <p className="text-red-400/70 text-xs mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Video Result */}
            {videoUrl && (
              <div className="rounded-2xl overflow-hidden"
                style={{ border: "1px solid rgba(192,132,252,0.3)", background: "rgba(192,132,252,0.05)" }}>
                <div className="p-4 flex items-center justify-between"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-white font-bold text-sm">Video Ready</span>
                  </div>
                  <div className="flex gap-2">
                    <a href={videoUrl} download={`kling-video-${Date.now()}.mp4`} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                      style={{ background: "rgba(192,132,252,0.2)", color: "#c084fc", border: "1px solid rgba(192,132,252,0.3)" }}>
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </a>
                    <button onClick={() => { setVideoUrl(null); setProgress(0); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                      style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.1)" }}>
                      <RefreshCw className="w-3.5 h-3.5" />
                      New
                    </button>
                  </div>
                </div>
                <video
                  src={videoUrl}
                  controls
                  autoPlay
                  loop
                  playsInline
                  className="w-full"
                  style={{ maxHeight: "360px", background: "#000" }}
                />
              </div>
            )}

            {/* Placeholder when idle */}
            {!generating && !videoUrl && !error && (
              <div className="rounded-2xl flex flex-col items-center justify-center py-20 text-center"
                style={{ background: "rgba(255,255,255,0.02)", border: "2px dashed rgba(255,255,255,0.07)" }}>
                <div className="text-6xl mb-4">🎬</div>
                <p className="text-white font-bold text-lg mb-2">Your video will appear here</p>
                <p className="text-sm max-w-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                  Upload an image, add a motion prompt, then click Generate to create your 1080p Kling video.
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <Play className="w-5 h-5 text-purple-400" />
                  <span className="text-xs text-purple-400/70">Powered by Kling V3 Turbo Pro</span>
                </div>
              </div>
            )}

            {/* Info Card */}
            <div className="rounded-xl p-4"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <p className="text-xs font-bold text-white mb-2">💡 Tips for best results</p>
              <ul className="space-y-1 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                <li>• Use a clear, high-quality reference image (min 300px per side)</li>
                <li>• Keep the subject centered with no heavy occlusion</li>
                <li>• Describe subtle motion — wind, breathing, hair movement</li>
                <li>• Photorealistic images work best with Kling V3</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
