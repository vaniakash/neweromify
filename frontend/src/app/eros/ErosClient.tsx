"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Download,
  RefreshCw,
  Wand2,
  Image as ImageIcon,
  Settings2,
  Clock,
  Flame,
  Loader2,
  ChevronDown,
  Lock,
  Crown,
  Zap,
  ShieldCheck,
} from "lucide-react";

// ── Style presets ──────────────────────────────────────────────────────────────
const STYLE_PRESETS = [
  { label: "Cinematic", prompt: "cinematic lighting, film grain, dramatic atmosphere, professional photography" },
  { label: "Fantasy", prompt: "fantasy art, ethereal glow, magical atmosphere, intricate details, vibrant colors" },
  { label: "Photorealistic", prompt: "photorealistic, 8k resolution, studio lighting, sharp focus, ultra detailed" },
  { label: "Anime", prompt: "anime style, vibrant colors, detailed illustration, manga-inspired, cel shading" },
  { label: "Dark Gothic", prompt: "gothic aesthetic, dark moody atmosphere, chiaroscuro, deep shadows, ornate details" },
  { label: "Neon Cyber", prompt: "cyberpunk neon lights, futuristic city, rain-slicked streets, holographic displays" },
];

// ── Size options ───────────────────────────────────────────────────────────────
const SIZES = [
  { label: "Square HD", value: "square_hd", aspect: "1:1" },
  { label: "Landscape 4:3", value: "landscape_4_3", aspect: "4:3" },
  { label: "Landscape 16:9", value: "landscape_16_9", aspect: "16:9" },
  { label: "Portrait 4:3", value: "portrait_4_3", aspect: "3:4" },
  { label: "Portrait 16:9", value: "portrait_16_9", aspect: "9:16" },
  { label: "Square", value: "square", aspect: "1:1" },
];

// ── Gallery items (placeholder examples) ─────────────────────────────────────
interface GeneratedImage {
  url: string;
  prompt: string;
  seed?: number;
  size: string;
  timestamp: Date;
}

export default function ErosClient() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // ── Access gate: only Professional (mega) & Enterprise (premium) ────────────
  const [accessChecked, setAccessChecked] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      setAccessChecked(true);
      setHasAccess(false);
      return;
    }
    // Fetch live access flags from DB
    fetch("/api/user/sync-pro")
      .then((r) => r.json())
      .then((data) => {
        setHasAccess(data.mcpAccess === true);
        setAccessChecked(true);
      })
      .catch(() => {
        setHasAccess(false);
        setAccessChecked(true);
      });
  }, [status]);


  const [prompt, setPrompt] = useState("");
  const [selectedSize, setSelectedSize] = useState("landscape_4_3");
  const [safetyTolerance, setSafetyTolerance] = useState("6");
  const [seed, setSeed] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentImage, setCurrentImage] = useState<GeneratedImage | null>(null);
  const [gallery, setGallery] = useState<GeneratedImage[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const promptRef = useRef<HTMLTextAreaElement>(null);

  const applyPreset = (preset: typeof STYLE_PRESETS[0]) => {
    setPrompt((p) => {
      const base = p.replace(/,?\s*(cinematic|fantasy|photorealistic|anime|gothic|cyberpunk).*/i, "").trim();
      return base ? `${base}, ${preset.prompt}` : preset.prompt;
    });
    promptRef.current?.focus();
  };

  const generate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/eros/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          image_size: selectedSize,
          safety_tolerance: safetyTolerance,
          seed: seed || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error ?? "Generation failed.");
        return;
      }

      const img: GeneratedImage = {
        url: data.images?.[0]?.url ?? "",
        prompt: prompt.trim(),
        seed: data.seed,
        size: selectedSize,
        timestamp: new Date(),
      };
      setCurrentImage(img);
      setGallery((prev) => [img, ...prev].slice(0, 12));
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = async (url: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = `eros-${Date.now()}.jpg`;
    a.target = "_blank";
    a.click();
  };

  // ── Loading: waiting for session + access check ───────────────────────────
  if (!accessChecked || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(160deg,#09091a 0%,#0f0f24 100%)" }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-white/10 border-t-violet-500 animate-spin" />
          <p className="text-white/50 text-sm font-medium">Checking access…</p>
        </div>
      </div>
    );
  }

  // ── Not signed in ────────────────────────────────────────────────────────────
  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "linear-gradient(160deg,#09091a 0%,#0f0f24 100%)" }}>
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6" style={{ background: "linear-gradient(135deg,#881337,#be123c)", boxShadow: "0 0 40px rgba(244,63,94,0.3)" }}>
            <Lock className="h-9 w-9 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white mb-3">Sign in to access Eros</h1>
          <p className="text-white/50 text-sm mb-6 leading-relaxed">Eros is exclusive to Professional Pack subscribers. Sign in to verify your access.</p>
          <button
            onClick={() => signIn("google", { callbackUrl: "/eros" })}
            className="w-full py-3.5 rounded-2xl font-black text-white text-sm flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)", boxShadow: "0 0 30px rgba(124,58,237,0.4)" }}
          >
            Continue with Google
          </button>
        </div>
      </div>
    );
  }

  // ── No Professional Pack ─────────────────────────────────────────────────────
  if (!hasAccess) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{ background: "linear-gradient(160deg,#09091a 0%,#0f0f24 100%)" }}
      >
        <style>{`
          @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
          @keyframes glow-pulse { 0%,100%{opacity:0.5} 50%{opacity:1} }
          .eros-lock-float { animation: float 4s ease-in-out infinite; }
          .eros-glow-ring { animation: glow-pulse 2.5s ease-in-out infinite; }
        `}</style>

        {/* Background stars */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="absolute rounded-full bg-white"
              style={{
                width: Math.random() * 2 + 1 + "px",
                height: Math.random() * 2 + 1 + "px",
                top: Math.random() * 100 + "%",
                left: Math.random() * 100 + "%",
                opacity: Math.random() * 0.4 + 0.1,
              }}
            />
          ))}
        </div>

        <div className="relative max-w-md w-full">
          {/* Glow behind card */}
          <div className="absolute inset-0 -z-10 rounded-3xl blur-3xl opacity-30" style={{ background: "radial-gradient(circle,#f43f5e 0%,#7c3aed 60%,transparent 100%)" }} />

          <div
            className="relative rounded-3xl overflow-hidden"
            style={{
              background: "linear-gradient(160deg,#0e0e22 0%,#131330 100%)",
              border: "1px solid rgba(244,63,94,0.25)",
              boxShadow: "0 0 0 1px rgba(244,63,94,0.1), 0 40px 80px rgba(0,0,0,0.7)",
            }}
          >
            {/* Top accent line */}
            <div className="h-[2px]" style={{ background: "linear-gradient(90deg,transparent,#f43f5e 30%,#7c3aed 70%,transparent)" }} />

            <div className="p-8 flex flex-col items-center text-center">
              {/* Lock icon */}
              <div className="eros-lock-float relative mb-8">
                <div className="eros-glow-ring absolute -inset-4 rounded-full" style={{ background: "radial-gradient(circle,rgba(244,63,94,0.25) 0%,transparent 70%)" }} />
                <div
                  className="w-24 h-24 rounded-3xl flex items-center justify-center relative"
                  style={{
                    background: "linear-gradient(135deg,#881337,#f43f5e)",
                    boxShadow: "0 0 50px rgba(244,63,94,0.5), inset 0 1px 0 rgba(255,255,255,0.15)",
                  }}
                >
                  <Lock className="h-10 w-10 text-white" />
                </div>
              </div>

              {/* Badge */}
              <div
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-5"
                style={{ background: "rgba(244,63,94,0.12)", border: "1px solid rgba(244,63,94,0.3)", color: "#fb7185" }}
              >
                <Crown className="h-3 w-3" />
                Professional Pack Required
              </div>

              <h1 className="text-3xl font-black text-white mb-3 leading-tight">
                Eros is Exclusive
              </h1>
              <p className="text-white/50 text-sm leading-relaxed mb-8">
                Eros Studio is powered by <strong className="text-white">FLUX 2 Pro</strong> — the most advanced image generation model.
                Access is reserved for <strong className="text-white">Professional Pack</strong> and <strong className="text-white">Enterprise Pack</strong> subscribers.
              </p>

              {/* Features included */}
              <div
                className="w-full rounded-2xl p-4 mb-8 text-left space-y-2.5"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                {[
                  { icon: Sparkles, text: "FLUX 2 Pro — Black Forest Labs" },
                  { icon: Zap, text: "Ultra HD · Cinematic quality output" },
                  { icon: ShieldCheck, text: "12,000 credits · Video Generation" },
                  { icon: Crown, text: "Claude MCP Automation access" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: "rgba(244,63,94,0.12)", border: "1px solid rgba(244,63,94,0.2)" }}>
                      <Icon className="h-3.5 w-3.5" style={{ color: "#fb7185" }} />
                    </div>
                    <span className="text-sm text-white/70">{text}</span>
                  </div>
                ))}
              </div>

              {/* Price + CTA */}
              <div className="w-full space-y-3">
                <div className="flex items-baseline justify-center gap-3 mb-1">
                  <span className="text-white/30 line-through text-lg">₹3,999</span>
                  <span className="text-4xl font-black text-white">₹1,999</span>
                  <span className="text-xs font-black px-2 py-0.5 rounded-full" style={{ background: "rgba(244,63,94,0.2)", color: "#fb7185", border: "1px solid rgba(244,63,94,0.3)" }}>50% OFF</span>
                </div>
                <p className="text-xs text-white/30 mb-4">12,000 credits · one-time payment · never expire</p>

                <button
                  onClick={() => router.push("/pricing")}
                  className="w-full py-4 rounded-2xl font-black text-white text-sm flex items-center justify-center gap-2.5 transition-all hover:brightness-110 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: "linear-gradient(135deg,#be123c,#f43f5e)",
                    boxShadow: "0 0 30px rgba(244,63,94,0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
                  }}
                >
                  <Crown className="h-4 w-4" />
                  Get Professional Pack — ₹1,999
                </button>

                <p className="text-[11px] text-white/25">
                  Already purchased?{" "}
                  <button onClick={() => window.location.reload()} className="underline hover:text-white/50 transition-colors">
                    Refresh access
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Full Eros Studio (Professional+ only) ────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col lg:flex-row gap-6">

        {/* ── Left Panel: Controls ────────────────────────────────────────── */}
        <aside className="w-full lg:w-[380px] shrink-0 flex flex-col gap-4">

          {/* Prompt */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 block flex items-center gap-2">
              <Wand2 className="h-3.5 w-3.5 text-violet-500" /> Prompt
            </label>
            <textarea
              ref={promptRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) generate(); }}
              placeholder="Describe your image in detail… e.g. 'A fierce warrior queen standing on a cliff at sunset, cinematic lighting, ultra detailed armor'"
              className="w-full bg-slate-50 text-slate-900 placeholder:text-slate-400 text-sm rounded-xl p-3.5 border border-slate-200 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 resize-none leading-relaxed transition-all"
              rows={5}
            />
            <p className="text-[10px] text-slate-500 mt-1.5 font-medium">⌘ + Enter to generate</p>
          </div>

          {/* Image Size */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 block">
              ⊞ Image Size
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SIZES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setSelectedSize(s.value)}
                  className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all text-left ${selectedSize === s.value
                      ? "bg-violet-50 border-violet-500 text-violet-700 ring-1 ring-violet-500"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-100"
                    }`}
                >
                  <span className="block">{s.label}</span>
                  <span className="text-[10px] opacity-60 font-medium">{s.aspect}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between px-5 py-4 text-xs font-bold text-slate-700 uppercase tracking-wider hover:bg-slate-50 transition-colors"
            >
              <span className="flex items-center gap-2"><Settings2 className="h-3.5 w-3.5" /> Advanced</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
            </button>
            {showAdvanced && (
              <div className="px-5 pb-5 space-y-4 border-t border-slate-100 pt-4 bg-slate-50/50">
                {/* Safety Tolerance */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-xs font-semibold text-slate-600">Safety Tolerance</label>
                    <span className="text-xs font-black text-violet-600">{safetyTolerance}</span>
                  </div>
                  <input
                    type="range" min="1" max="5" step="1"
                    value={safetyTolerance}
                    onChange={(e) => setSafetyTolerance(e.target.value)}
                    className="w-full accent-violet-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-medium">
                    <span>Strict</span><span>Permissive</span>
                  </div>
                </div>

                {/* Seed */}
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-2 block">Seed (optional)</label>
                  <input
                    type="number"
                    value={seed}
                    onChange={(e) => setSeed(e.target.value)}
                    placeholder="Random"
                    className="w-full bg-white text-slate-900 placeholder:text-slate-400 text-sm rounded-lg px-3 py-2 border border-slate-200 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Generate Button */}
          <button
            onClick={generate}
            disabled={loading || !prompt.trim()}
            className="w-full py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-rose-500/20 hover:shadow-lg hover:shadow-rose-500/30 active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, #e11d48, #7c3aed)",
              color: "white",
            }}
          >
            {loading ? (
              <><Loader2 className="h-5 w-5 animate-spin" /> Generating…</>
            ) : (
              <><Sparkles className="h-5 w-5" /> Generate Image</>
            )}
          </button>

          {error && (
            <div className="text-rose-600 text-sm bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 font-medium">
              {error}
            </div>
          )}
        </aside>

        {/* ── Right Panel: Output ─────────────────────────────────────────── */}
        <main className="flex-1 flex flex-col gap-6">

          {/* Main Output */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex-1 min-h-[400px] flex flex-col shadow-sm">
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 bg-slate-50/50">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-2 border-slate-200 border-t-rose-500 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Flame className="h-6 w-6 text-rose-500 animate-pulse" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-slate-800 font-bold text-sm">Generating your masterpiece…</p>
                  <p className="text-slate-500 text-xs mt-1 font-medium">FLUX 2 Pro · This takes 10–30 seconds</p>
                </div>
                {/* Shimmer bar */}
                <div className="w-48 h-1.5 bg-slate-200 rounded-full overflow-hidden mt-2">
                  <div className="h-full w-1/2 bg-gradient-to-r from-rose-500 to-violet-500 rounded-full animate-[shimmer_1.5s_ease-in-out_infinite]" style={{ animation: "shimmer 1.5s ease-in-out infinite" }} />
                </div>
              </div>
            ) : currentImage ? (
              <div className="flex flex-col h-full bg-slate-50/30">
                <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-white">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-violet-500" />
                    <span className="text-sm font-bold text-slate-800">Generated Result</span>
                    {currentImage.seed && (
                      <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200">seed: {currentImage.seed}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={generate}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 shadow-sm transition-all hover:text-slate-900"
                    >
                      <RefreshCw className="h-3.5 w-3.5" /> Regenerate
                    </button>
                    <button
                      onClick={() => downloadImage(currentImage.url)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 rounded-lg shadow-sm transition-all"
                    >
                      <Download className="h-3.5 w-3.5" /> Download
                    </button>
                  </div>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <div className="flex-1 p-4 flex items-center justify-center">
                  <img
                    src={currentImage.url}
                    alt={currentImage.prompt}
                    className="w-full object-contain max-h-[600px] rounded-lg shadow-sm border border-slate-200 bg-white"
                  />
                </div>
                <div className="px-5 py-4 border-t border-slate-100 bg-white">
                  <p className="text-sm text-slate-600 font-medium">"{currentImage.prompt}"</p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 bg-slate-50/50">
                {/* Decorative gradient orb */}
                <div className="relative w-24 h-24">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-rose-500/20 to-violet-600/20 blur-xl" />
                  <div className="relative w-24 h-24 rounded-full border border-slate-200 bg-white flex items-center justify-center shadow-sm">
                    <Flame className="h-10 w-10 text-rose-400" />
                  </div>
                </div>
                <div className="text-center mt-2">
                  <p className="text-slate-800 font-bold text-lg">Your image will appear here</p>
                  <p className="text-slate-500 text-sm mt-1 font-medium">Write a prompt and click Generate</p>
                </div>
              </div>
            )}
          </div>

          {/* Gallery */}
          {gallery.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3 px-1">
                <Clock className="h-4 w-4 text-slate-500" />
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Recent Generations</h3>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {gallery.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImage(img)}
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all shadow-sm ${currentImage?.url === img.url
                        ? "border-violet-500 ring-4 ring-violet-500/20"
                        : "border-slate-200 hover:border-slate-300 hover:shadow-md"
                      }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt={img.prompt} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
}
