"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Film, Upload, X, Sparkles, Download, RefreshCw,
  Crown, AlertTriangle, Play, Image as ImageIcon,
  Video, ChevronDown, Info, Loader2, Activity,
} from "lucide-react";

type CharacterOrientation = "image" | "video";

const ORIENTATION_OPTIONS: { value: CharacterOrientation; label: string; desc: string }[] = [
  {
    value: "image",
    label: "Image Orientation",
    desc: "Output matches reference image pose — better for camera movements. Max 10s video.",
  },
  {
    value: "video",
    label: "Video Orientation",
    desc: "Output matches reference video orientation — better for complex motions. Max 30s video.",
  },
];

const STAGES = [
  { label: "Initializing",  desc: "Preparing request",             pct: 5,  color: "#818cf8" },
  { label: "Uploading",     desc: "Sending assets to Kling AI",    pct: 15, color: "#60a5fa" },
  { label: "Queuing",       desc: "Waiting for GPU slot",          pct: 30, color: "#a78bfa" },
  { label: "Rendering",     desc: "Transferring motion to image",  pct: 82, color: "#34d399" },
  { label: "Finalizing",    desc: "Encoding & compressing video",  pct: 97, color: "#fbbf24" },
];

export default function MotionControlPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Access state
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [credits, setCredits] = useState<number | null>(null);

  // Inputs
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoFileName, setVideoFileName] = useState("");
  const [orientation, setOrientation] = useState<CharacterOrientation>("image");
  const [keepSound, setKeepSound] = useState(true);
  const [orientationOpen, setOrientationOpen] = useState(false);

  // File upload refs
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Generation state
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [videoResult, setVideoResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [noAccess, setNoAccess] = useState(false);

  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  // Check access
  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/user/sync-pro")
      .then((r) => r.json())
      .then((d) => {
        setHasAccess(!!d.motionControlAccess);
        setCredits(typeof d.credits === "number" ? Math.floor(d.credits / 100) : null);
      })
      .catch(() => setHasAccess(false));
  }, [status]);

  const startProgress = useCallback(() => {
    setProgress(0);
    setStageIndex(0);
    setElapsed(0);
    startTimeRef.current = Date.now();

    elapsedRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

    let p = 0;
    progressRef.current = setInterval(() => {
      const speed = p < 30 ? 3 : p < 82 ? 0.6 : p < 97 ? 0.15 : 0;
      p = Math.min(p + speed + Math.random() * 0.4, 97);
      setProgress(p);
      const idx = [5, 15, 30, 82, 97].findLastIndex((t) => p >= t);
      setStageIndex(Math.max(0, idx));
    }, 800);
  }, []);

  const stopProgress = useCallback(() => {
    if (progressRef.current) clearInterval(progressRef.current);
    if (elapsedRef.current) clearInterval(elapsedRef.current);
    setProgress(100);
    setStageIndex(4);
  }, []);

  // Image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setImagePreview(dataUrl);
      setImageUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Video upload
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setVideoUrl(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const generate = async () => {
    if (!imageUrl || !videoUrl || generating) return;
    if (status !== "authenticated") {
      router.push("/login?callbackUrl=/tools/creator/motion-control");
      return;
    }

    // Gate check — show upgrade prompt if no access
    if (hasAccess === false) {
      setNoAccess(true);
      return;
    }

    setError(null);
    setNoAccess(false);
    setVideoResult(null);
    setGenerating(true);
    startProgress();

    try {
      const res = await fetch("/api/motion-control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          image_url: imageUrl,
          video_url: videoUrl,
          character_orientation: orientation,
          keep_original_sound: keepSound,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.code === "NO_MOTION_CONTROL_ACCESS") {
          setNoAccess(true);
        } else {
          setError(data.error || "Generation failed.");
        }
        stopProgress();
        return;
      }

      stopProgress();
      setVideoResult(data.videoUrl);

      // Refresh credits
      fetch("/api/user/sync-pro")
        .then((r) => r.json())
        .then((d) => {
          if (typeof d.credits === "number") setCredits(Math.floor(d.credits / 100));
        })
        .catch(() => {});
    } catch (err: unknown) {
      stopProgress();
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setGenerating(false);
    }
  };

  const download = () => {
    if (!videoResult) return;
    const a = document.createElement("a");
    a.href = videoResult;
    a.download = `motion-control-${Date.now()}.mp4`;
    a.click();
  };

  const selectedOrientation = ORIENTATION_OPTIONS.find((o) => o.value === orientation)!;

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-50 text-slate-900 font-sans">
      <style dangerouslySetInnerHTML={{ __html: `
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 10px; }
      ` }} />

      {/* Header breadcrumb */}
      <div className="bg-white border-b border-slate-200 px-6 py-3.5 flex-shrink-0 z-10">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link href="/" className="hover:text-slate-700 transition-colors">Dashboard</Link>
          <span>/</span>
          <Link href="/tools/creator" className="hover:text-slate-700 transition-colors">Creator</Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-violet-600" />
            Motion Control
          </span>
          <span className="ml-1 text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wide bg-amber-100 text-amber-700 border border-amber-300">
            Enterprise
          </span>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="flex flex-col lg:flex-row flex-1 lg:overflow-hidden">

        {/* LEFT: Control panel */}
        <div className="w-full lg:w-[360px] flex-shrink-0 border-b lg:border-b-0 lg:border-r border-slate-200 bg-white flex flex-col lg:h-full">

          {/* Scrollable form */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-5 pt-6 pb-5">
              <div className="flex items-center gap-3 mb-1.5">
                <div className="p-2 rounded-xl bg-violet-50 border border-violet-200">
                  <Activity className="h-4 w-4 text-violet-600" />
                </div>
                <div>
                  <h1 className="text-base font-bold text-slate-900">Motion Control</h1>
                  <p className="text-xs text-slate-500">Powered by Kling v3 Pro</p>
                </div>
                </div>
              </div>

            <div className="px-5 pb-5 space-y-5 border-t border-slate-100 pt-4">

              {/* Prompt */}
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                  Prompt <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value.slice(0, 400))}
                  placeholder='E.g. "A man dancing gracefully"'
                  rows={3}
                  className="w-full px-3.5 py-3 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-xl resize-none outline-none transition-all placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/10"
                />
              </div>

              {/* Reference Image */}
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-violet-500" />
                  Reference Image <span className="text-red-500">*</span>
                </label>
                {imagePreview ? (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imagePreview} alt="Reference" className="w-full h-36 object-cover" />
                    <button
                      onClick={() => { setImagePreview(null); setImageUrl(""); if (imageInputRef.current) imageInputRef.current.value = ""; }}
                      className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-red-50 hover:text-red-500 transition"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => imageInputRef.current?.click()}
                    className="w-full flex flex-col items-center justify-center gap-2 py-6 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 text-slate-500 hover:border-violet-400 hover:text-violet-600 hover:bg-violet-50/50 transition-all group"
                  >
                    <Upload className="h-5 w-5 opacity-60 group-hover:opacity-100" />
                    <div className="text-center">
                      <p className="text-xs font-semibold">Upload character image</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">JPG, PNG, WebP — max 50MB</p>
                    </div>
                  </button>
                )}
                <input ref={imageInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp,image/avif" className="hidden" onChange={handleImageUpload} />
                <p className="text-[10px] text-slate-400 mt-1.5">Character should occupy &gt;5% of image area with clear proportions.</p>
              </div>

              {/* Reference Video */}
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-violet-500" />
                  Reference Video <span className="text-red-500">*</span>
                </label>
                {videoUrl ? (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <Play className="w-4 h-4 text-violet-500 flex-shrink-0" />
                    <p className="text-xs text-slate-700 flex-1 truncate font-medium">{videoFileName}</p>
                    <button
                      onClick={() => { setVideoUrl(""); setVideoFileName(""); if (videoInputRef.current) videoInputRef.current.value = ""; }}
                      className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-red-500 transition"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => videoInputRef.current?.click()}
                    className="w-full flex flex-col items-center justify-center gap-2 py-6 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 text-slate-500 hover:border-violet-400 hover:text-violet-600 hover:bg-violet-50/50 transition-all group"
                  >
                    <Upload className="h-5 w-5 opacity-60 group-hover:opacity-100" />
                    <div className="text-center">
                      <p className="text-xs font-semibold">Upload motion reference video</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">MP4, MOV, WebM — character must be visible</p>
                    </div>
                  </button>
                )}
                <input ref={videoInputRef} type="file" accept="video/mp4,video/quicktime,video/webm" className="hidden" onChange={handleVideoUpload} />
              </div>

              {/* Character Orientation */}
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1.5">
                  <Film className="w-3.5 h-3.5 text-violet-500" />
                  Character Orientation
                </label>
                <div className="relative">
                  <button
                    onClick={() => setOrientationOpen((v) => !v)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white text-sm text-slate-800 transition-all"
                  >
                    <span className="font-medium">{selectedOrientation.label}</span>
                    <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${orientationOpen ? "rotate-180" : ""}`} />
                  </button>
                  {orientationOpen && (
                    <div className="absolute z-20 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
                      {ORIENTATION_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => { setOrientation(opt.value); setOrientationOpen(false); }}
                          className={`w-full text-left px-4 py-3 transition-colors border-b border-slate-100 last:border-0 hover:bg-slate-50 ${orientation === opt.value ? "bg-violet-50" : ""}`}
                        >
                          <p className={`text-sm font-semibold mb-0.5 ${orientation === opt.value ? "text-violet-700" : "text-slate-800"}`}>{opt.label}</p>
                          <p className="text-[10px] text-slate-500 leading-relaxed">{opt.desc}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Keep Sound */}
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-slate-600">Keep Original Sound</label>
                  <Info className="w-3.5 h-3.5 text-slate-400" aria-label="Retain audio from the reference video" />
                </div>
                <button
                  onClick={() => setKeepSound((v) => !v)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${keepSound ? "bg-violet-500" : "bg-slate-200"}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${keepSound ? "translate-x-5" : "translate-x-0.5"}`} />
                </button>
              </div>

            </div>
          </div>

          {/* Bottom Action Area */}
          <div className="p-5 border-t border-slate-200 bg-white">

            {/* No Access Gate */}
            {noAccess && (
              <div className="p-4 rounded-xl mb-3 bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-200">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="h-4 w-4 text-violet-600" />
                  <span className="text-xs font-bold text-violet-700 uppercase tracking-wide">Enterprise Only</span>
                </div>
                <p className="text-xs text-violet-600/80 leading-relaxed mb-3">
                  Motion Control is exclusively available in the <strong className="text-violet-700">Enterprise Pack (₹3,999)</strong>.
                </p>
                <a
                  href="/pricing"
                  className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 transition-all shadow-lg shadow-violet-500/20"
                >
                  <Crown className="h-3.5 w-3.5" />
                  Upgrade to Enterprise
                </a>
              </div>
            )}

            {/* Error */}
            {error && !noAccess && (
              <div className="flex items-start gap-2 p-3 mb-3 rounded-lg bg-red-50 border border-red-200">
                <AlertTriangle className="h-3.5 w-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-600 leading-relaxed">{error}</p>
              </div>
            )}

            {/* Credits + Cost */}
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs text-slate-500">
                Balance: <span className="font-bold text-slate-900">{credits !== null ? credits : "—"} credits</span>
              </span>
              <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                Cost: 20 credits
              </span>
            </div>

            <button
              onClick={generate}
              disabled={generating || !imageUrl || !videoUrl}
              className="w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: generating || !imageUrl || !videoUrl
                  ? "#e2e8f0"
                  : "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
                color: generating || !imageUrl || !videoUrl ? "#94a3b8" : "#fff",
                boxShadow: generating || !imageUrl || !videoUrl
                  ? "none"
                  : "0 4px 20px rgba(124,58,237,0.3)",
              }}
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {STAGES[stageIndex]?.label}… {Math.round(progress)}%
                </>
              ) : (
                <>
                  <Activity className="h-4 w-4" />
                  Generate Motion Video
                </>
              )}
              {generating && (
                <div
                  className="absolute bottom-0 left-0 h-1 transition-all duration-700"
                  style={{
                    width: `${progress}%`,
                    background: `linear-gradient(90deg, ${STAGES[stageIndex]?.color ?? "#818cf8"}, ${STAGES[Math.min(stageIndex + 1, STAGES.length - 1)]?.color ?? "#34d399"})`,
                  }}
                />
              )}
            </button>

            <p className="text-[10px] text-center text-slate-400 mt-2">
              Kling v3 Pro · ~60-180s generation time
            </p>
          </div>
        </div>

        {/* RIGHT: Preview area */}
        <div className="flex-1 flex flex-col relative bg-slate-100 lg:overflow-hidden min-h-[400px] lg:min-h-0">
          {/* Grid background */}
          <div
            className="absolute inset-0 pointer-events-none opacity-40"
            style={{ backgroundImage: "radial-gradient(circle at center, #cbd5e1 1px, transparent 1px)", backgroundSize: "24px 24px" }}
          />

          {videoResult ? (
            <div className="flex-1 flex flex-col z-10 relative h-full p-4 sm:p-6">
              <div className="flex-1 flex items-center justify-center bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xl min-h-[300px]">
                <video src={videoResult} controls autoPlay loop className="w-full h-full object-contain" />
              </div>

              <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono text-slate-600">Kling v3 Pro</span>
                  <span className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono text-violet-600">motion-control</span>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => { setVideoResult(null); setError(null); setProgress(0); }}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-all"
                  >
                    <RefreshCw className="h-4 w-4" />
                    New
                  </button>
                  <button
                    onClick={download}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-bold hover:bg-violet-500 transition-all shadow-lg shadow-violet-500/25"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </button>
                </div>
              </div>
            </div>

          ) : generating ? (
            // Generating state
            <div className="flex-1 flex flex-col items-center justify-center px-8 z-10 relative">
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none transition-colors duration-1000"
                style={{ background: `${STAGES[stageIndex]?.color ?? "#818cf8"}15` }}
              />

              {/* Animated icon */}
              <div className="relative mb-8">
                <div
                  className="w-24 h-24 rounded-3xl flex items-center justify-center"
                  style={{
                    background: "rgba(255,255,255,0.9)",
                    border: `2px solid ${STAGES[stageIndex]?.color ?? "#818cf8"}30`,
                    boxShadow: `0 0 40px ${STAGES[stageIndex]?.color ?? "#818cf8"}20`,
                  }}
                >
                  <Activity className="h-10 w-10 animate-pulse" style={{ color: STAGES[stageIndex]?.color ?? "#7c3aed" }} />
                </div>
                <div className="absolute inset-0 animate-spin" style={{ animationDuration: "4s" }}>
                  <div
                    className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full"
                    style={{ background: STAGES[stageIndex]?.color ?? "#818cf8", boxShadow: `0 0 12px ${STAGES[stageIndex]?.color ?? "#818cf8"}` }}
                  />
                </div>
              </div>

              <h2 className="text-2xl font-black text-slate-900 mb-1 tracking-tight">
                {STAGES[stageIndex]?.label}…
              </h2>
              <p className="text-sm text-slate-500 mb-6">{STAGES[stageIndex]?.desc}</p>

              {/* Progress bar */}
              <div className="w-full max-w-sm mb-3">
                <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${progress}%`,
                      background: `linear-gradient(90deg, ${STAGES[Math.max(0, stageIndex - 1)]?.color ?? "#818cf8"}, ${STAGES[stageIndex]?.color ?? "#34d399"})`,
                    }}
                  />
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="text-[10px] font-mono" style={{ color: STAGES[stageIndex]?.color ?? "#7c3aed" }}>{Math.round(progress)}%</span>
                  <span className="text-[10px] font-mono text-slate-400">{elapsed}s elapsed</span>
                </div>
              </div>

              {/* Stage pipeline */}
              <div className="flex items-center gap-1.5 mt-2">
                {STAGES.map((s, i) => (
                  <div key={s.label} className="flex items-center gap-1.5">
                    <div className="flex flex-col items-center">
                      <div
                        className="w-2 h-2 rounded-full transition-all duration-500"
                        style={{
                          background: i < stageIndex ? "#34d399" : i === stageIndex ? (STAGES[stageIndex]?.color ?? "#818cf8") : "#e2e8f0",
                          boxShadow: i === stageIndex ? `0 0 8px ${STAGES[stageIndex]?.color ?? "#818cf8"}` : "none",
                          transform: i === stageIndex ? "scale(1.5)" : "scale(1)",
                        }}
                      />
                      <span className="text-[8px] mt-1 font-medium hidden sm:block" style={{ color: i <= stageIndex ? "#64748b" : "#cbd5e1" }}>
                        {s.label}
                      </span>
                    </div>
                    {i < STAGES.length - 1 && (
                      <div className="w-6 h-px mb-3" style={{ background: i < stageIndex ? "#34d399" : "#e2e8f0" }} />
                    )}
                  </div>
                ))}
              </div>

              <p className="text-[11px] mt-8 text-slate-400 text-center max-w-xs">
                {elapsed < 20 ? "Connecting to Kling v3 Pro…" :
                  elapsed < 60 ? "⚡ Analyzing motion patterns…" :
                    elapsed < 120 ? "🎥 Transferring motion to character…" :
                      "✅ Almost done — don't close this tab"}
              </p>
            </div>

          ) : (
            // Idle state
            <div className="flex-1 flex flex-col items-center justify-center px-8 z-10 relative">
              <div className="w-20 h-20 rounded-3xl bg-white border border-slate-200 flex items-center justify-center shadow-sm mb-6">
                <Activity className="h-9 w-9 text-violet-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2 text-center">Motion Control Studio</h2>
              <p className="text-sm text-slate-500 text-center max-w-sm leading-relaxed mb-8">
                Upload a <strong className="text-slate-700">character image</strong> and a <strong className="text-slate-700">motion reference video</strong> to transfer movements from the video onto the character.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-md">
                {[
                  { icon: ImageIcon, label: "1. Upload Image", desc: "Your character" },
                  { icon: Video, label: "2. Upload Video", desc: "Motion reference" },
                  { icon: Sparkles, label: "3. Generate", desc: "Kling v3 Pro" },
                ].map((step) => (
                  <div key={step.label} className="flex flex-col items-center p-4 bg-white rounded-2xl border border-slate-200 shadow-sm gap-2 text-center">
                    <step.icon className="w-5 h-5 text-violet-500" />
                    <p className="text-xs font-semibold text-slate-800">{step.label}</p>
                    <p className="text-[10px] text-slate-500">{step.desc}</p>
                  </div>
                ))}
              </div>

              {noAccess && (
                <div className="mt-8 p-5 rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-200 text-center max-w-sm">
                  <Crown className="w-6 h-6 text-violet-600 mx-auto mb-2" />
                  <p className="text-sm font-bold text-violet-800 mb-1">Enterprise Pack Required</p>
                  <p className="text-xs text-violet-600/70 mb-4 leading-relaxed">
                    Motion Control is exclusively available in the <strong>Enterprise Pack</strong> (₹3,999).
                  </p>
                  <a
                    href="/pricing"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold hover:from-violet-500 hover:to-indigo-500 transition-all shadow-lg shadow-violet-500/25"
                  >
                    <Crown className="w-3.5 h-3.5" />
                    Upgrade to Enterprise
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
