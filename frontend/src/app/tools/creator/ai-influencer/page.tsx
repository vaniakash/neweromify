"use client";

import { useState, useRef, useCallback, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { Wand2, ImagePlus, Layers, Download, RefreshCw, X,
  Sparkles, AlertCircle, Clock, ChevronRight, Zap,
  Eye, Trash2, Copy, Check, Images, Lock, AtSign,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { ImageGenPayModal } from "@/components/ImageGenPayModal";
import { useAvatarStore } from "@/lib/store/avatarStore";

type Mode = "text2img" | "edit" | "multiref";

interface GalleryItem {
  _id: string;
  cloudinaryUrl: string;
  prompt: string;
  mode: Mode;
  generationMs?: number;
  createdAt: string;
}

const MODE_META: Record<Mode, { label: string; icon: React.ReactNode; color: string; desc: string }> = {
  text2img: { label: "Text → Image", icon: <Wand2 className="h-4 w-4" />, color: "from-violet-600 to-indigo-600", desc: "Generate any image from a text prompt" },
  edit: { label: "Image Editing", icon: <ImagePlus className="h-4 w-4" />, color: "from-pink-600 to-rose-600", desc: "Upload an image and transform it with AI" },
  multiref: { label: "Multi-Reference", icon: <Layers className="h-4 w-4" />, color: "from-amber-500 to-orange-500", desc: "Combine 2 reference images into something new" },
};

const EXAMPLES: Record<Mode, string[]> = {
  text2img: [
    "A stunning AI influencer with glowing skin, neon city at night, fashion editorial",
    "Hyperrealistic portrait of a female influencer with perfect makeup, golden hour lighting",
    "Futuristic AI model in cyberpunk outfit, Tokyo street, cinematic lighting",
  ],
  edit: ["Make it a Studio Ghibli anime painting", "Add dramatic storm clouds to background", "Convert to dark cinematic oil painting"],
  multiref: ["Blend both images into a cohesive surrealist artwork", "Merge style of image 1 with subject of image 2"],
};

function UploadBox({ label, file, preview, onFile, onClear, id }: {
  label: string; file: File | null; preview: string | null;
  onFile: (f: File) => void; onClear: () => void; id: string;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</p>
      {preview ? (
        <div className="relative group overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt={label} className="w-full max-h-48 object-contain bg-slate-100" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={onClear} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-lg">
              <Trash2 className="h-3 w-3" /> Remove
            </button>
          </div>
          <p className="absolute bottom-2 left-2 text-[10px] bg-black/60 text-white px-2 py-0.5 rounded">{file?.name}</p>
        </div>
      ) : (
        <label htmlFor={id} className="flex flex-col items-center justify-center gap-3 h-36 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 cursor-pointer hover:border-violet-400 hover:bg-violet-50/50 transition-all">
          <ImagePlus className="h-8 w-8 text-slate-400" />
          <p className="text-xs text-slate-400">Click to upload image</p>
          <input id={id} type="file" accept="image/png,image/jpeg,image/webp" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
        </label>
      )}
    </div>
  );
}

function AIInfluencerInner() {
  const { data: session, status } = useSession();
  const { avatars } = useAvatarStore();
  const [mode, setMode] = useState<Mode>("text2img");
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  // Avatar @mention state
  const [activeAvatarId, setActiveAvatarId] = useState<string | null>(null);

  // Auto-detect @mention in prompt and inject avatar reference
  const handlePromptChange = (val: string) => {
    setPrompt(val);
    const match = val.match(/@([\w]+)/g);
    if (match) {
      for (const tag of match) {
        const slug = tag.slice(1).toLowerCase();
        const found = avatars.find((a) => {
          const aSlug = (a.username?.replace('@','') || a.name).toLowerCase().replace(/\s+/g,'');
          return aSlug === slug || a.name.toLowerCase().replace(/\s+/g,'') === slug;
        });
        if (found) {
          setActiveAvatarId(found.id);
          if (found.baseImage) {
            // inject as ref1 preview
            setRef1Preview(found.baseImage);
            // convert URL to File-like by fetching isn't needed — we pass URL directly via state
            setAvatarRefUrl(found.baseImage);
            setMode("multiref");
          }
          return;
        }
      }
    }
    // No match found — clear avatar ref only if user removed the tag
    if (!val.includes('@')) {
      setActiveAvatarId(null);
      setAvatarRefUrl(null);
    }
  };

  const [avatarRefUrl, setAvatarRefUrl] = useState<string | null>(null);

  const injectAvatar = (avatar: typeof avatars[0]) => {
    const tag = avatar.username?.startsWith('@') ? avatar.username : `@${avatar.name.toLowerCase().replace(/\s+/g,'')}`;
    setPrompt((prev) => {
      // remove any existing @tags then append this one
      const cleaned = prev.replace(/@[\w.]+/g, '').trim();
      return `${tag} ${cleaned}`.trim();
    });
    setActiveAvatarId(avatar.id);
    if (avatar.baseImage) {
      setRef1Preview(avatar.baseImage);
      setAvatarRefUrl(avatar.baseImage);
      setMode("multiref");
    }
  };

  const searchParams = useSearchParams();
  const [payModal, setPayModal] = useState<{ open: boolean; mode: "login" | "payment" }>({ open: false, mode: "payment" });
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    if (searchParams.get("upgrade") === "true") {
      setPayModal({ open: true, mode: status === "authenticated" ? "payment" : "login" });
    }
  }, [searchParams, status]);

  // Auto-inject avatar from URL params (coming from /avatar hub)
  useEffect(() => {
    const avatarId = searchParams.get("avatarId");
    const ref = searchParams.get("ref");
    if (avatarId && ref && avatars.length > 0) {
      const av = avatars.find((a) => a.id === avatarId);
      if (av) {
        injectAvatar(av);
      } else if (ref) {
        // Avatar not in store but ref URL given — just set the image
        setRef1Preview(ref);
        setAvatarRefUrl(ref);
        setMode("multiref");
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, avatars.length]);

  const fetchCredits = useCallback(async () => {
    if (status !== "authenticated") return;
    try {
      const res = await fetch("/api/user/credits");
      if (res.ok) {
        const data = await res.json();
        setCredits(data.credits);
      }
    } catch (err) {
      console.error("Failed to fetch credits", err);
    }
  }, [status]);

  useEffect(() => { fetchCredits(); }, [fetchCredits]);

  const [editFile, setEditFile] = useState<File | null>(null);
  const [editPreview, setEditPreview] = useState<string | null>(null);
  const [ref1File, setRef1File] = useState<File | null>(null);
  const [ref1Preview, setRef1Preview] = useState<string | null>(null);
  const [ref2File, setRef2File] = useState<File | null>(null);
  const [ref2Preview, setRef2Preview] = useState<string | null>(null);

  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [galleryZoomed, setGalleryZoomed] = useState<GalleryItem | null>(null);

  const loadPreview = useCallback((file: File, setter: (s: string) => void) => {
    const reader = new FileReader();
    reader.onload = (e) => setter(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const fetchGallery = useCallback(async () => {
    if (!session?.user?.email) return;
    setGalleryLoading(true);
    try {
      const res = await fetch("/api/influencer-gallery");
      const data = await res.json();
      if (data.images) setGallery(data.images);
    } finally {
      setGalleryLoading(false);
    }
  }, [session?.user?.email]);

  useEffect(() => { fetchGallery(); }, [fetchGallery]);

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    if (mode === "edit" && !editFile) { setError("Upload a source image for edit mode."); return; }
    if (mode === "multiref" && !ref1File && !avatarRefUrl) { setError("Upload at least one reference image."); return; }

    if (credits !== null && credits < 5) {
      setPayModal({ open: true, mode: "payment" });
      return;
    }

    setIsGenerating(true); setError(null);
    try {
      const fd = new FormData();
      // If avatar ref URL is set, fetch and attach as blob
      let effectiveMode = mode;
      let ref1Blob: Blob | null = null;
      if (avatarRefUrl && mode === "multiref") {
        try {
          const resp = await fetch(avatarRefUrl);
          ref1Blob = await resp.blob();
        } catch { /* ignore, fall back to text2img */ }
      }
      if (ref1Blob) { effectiveMode = "multiref"; }

      fd.append("mode", effectiveMode); fd.append("prompt", prompt.trim());
      if (effectiveMode === "edit" && editFile) fd.append("image", editFile);
      if (effectiveMode === "multiref") {
        if (ref1Blob) fd.append("ref1", ref1Blob, "avatar-ref.jpg");
        else if (ref1File) fd.append("ref1", ref1File);
        if (ref2File) fd.append("ref2", ref2File);
      }
      const res = await fetch("/api/influencer-generate", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        if (data.code === "INSUFFICIENT_CREDITS") {
          setPayModal({ open: true, mode: "payment" });
          throw new Error("Insufficient credits. Generating an influencer image costs 5 credits.");
        }
        throw new Error(data.error || "Generation failed");
      }
      if (!data.image) throw new Error("Generation failed");

      setCredits((prev) => (prev !== null ? Math.max(0, prev - 5) : null));
      setLastResult(data.image);
      await fetchGallery();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/influencer-gallery?id=${id}`, { method: "DELETE" });
    setGallery((prev) => prev.filter((g) => g._id !== id));
    if (galleryZoomed?._id === id) setGalleryZoomed(null);
  };

  const handleDownload = (url: string, id: string) => {
    const a = document.createElement("a"); a.href = url; a.download = `influencer-${id}.jpg`; a.click();
  };

  const copyPrompt = (text: string) => {
    navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  if (status === "loading") return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <RefreshCw className="h-8 w-8 text-violet-500 animate-spin" />
    </div>
  );

  if (!session) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-900">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto">
          <Lock className="h-10 w-10 text-violet-500" />
        </div>
        <h2 className="text-2xl font-black">Sign in to create</h2>
        <p className="text-slate-500">You need to be signed in to use the AI Influencer Creator.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
        {/* Generator Panel */}
        <div className="grid lg:grid-cols-[400px_1fr] gap-8">
          {/* LEFT */}
          <div className="space-y-5">
            {/* NSFW / capability badge */}
            <div className="relative overflow-hidden rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50 p-5">
              <div className="absolute top-0 right-0 w-40 h-40 bg-violet-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  {["18+ Only", "NSFW", "Popular", "Auto Gallery"].map((tag) => (
                    <span key={tag}
                      className="px-2.5 py-1 rounded-full text-xs font-bold"
                      style={{
                        background: tag === "18+ Only" || tag === "NSFW" ? "rgba(220,38,38,0.1)" : "rgba(139,92,246,0.1)",
                        color: tag === "18+ Only" || tag === "NSFW" ? "rgba(185,28,28,1)" : "rgba(109,40,217,1)",
                        border: tag === "18+ Only" || tag === "NSFW" ? "1px solid rgba(239,68,68,0.4)" : "1px solid rgba(139,92,246,0.3)",
                      }}>
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-slate-500">Generate, edit, and blend ultra-realistic AI influencer images — every image is auto-saved to your gallery.</p>
              </div>
            </div>

            {/* Mode */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mode</p>
              {(["text2img", "edit", "multiref"] as Mode[]).map((m) => {
                const meta = MODE_META[m];
                const isActive = mode === m;
                return (
                  <button key={m} onClick={() => { setMode(m); setError(null); }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${isActive ? "border-violet-300 bg-violet-50" : "border-slate-200 bg-white hover:border-violet-200 hover:bg-violet-50/50"}`}>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-br ${meta.color} ${isActive ? "shadow-md" : "opacity-70"}`}>{meta.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold ${isActive ? "text-violet-700" : "text-slate-600"}`}>{meta.label}</p>
                      <p className="text-xs text-slate-400 truncate">{meta.desc}</p>
                    </div>
                    {isActive && <ChevronRight className="h-4 w-4 text-violet-400 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Upload zones */}
            {mode === "edit" && <UploadBox label="Source Image" id="edit-upload" file={editFile} preview={editPreview} onFile={(f) => { setEditFile(f); loadPreview(f, setEditPreview); }} onClear={() => { setEditFile(null); setEditPreview(null); }} />}
            {mode === "multiref" && (
              <div className="space-y-4">
                <UploadBox label="Reference Image 1" id="ref1-upload" file={ref1File} preview={ref1Preview} onFile={(f) => { setRef1File(f); loadPreview(f, setRef1Preview); }} onClear={() => { setRef1File(null); setRef1Preview(null); }} />
                <UploadBox label="Reference Image 2 (optional)" id="ref2-upload" file={ref2File} preview={ref2Preview} onFile={(f) => { setRef2File(f); loadPreview(f, setRef2Preview); }} onClear={() => { setRef2File(null); setRef2Preview(null); }} />
              </div>
            )}

            {/* Avatar @mention pills */}
            {avatars.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AtSign className="w-3 h-3" /> Tag Avatar
                </p>
                <div className="flex flex-wrap gap-2">
                  {avatars.map((av) => {
                    const tag = av.username?.startsWith('@') ? av.username : `@${av.name.toLowerCase().replace(/\s+/g,'')}`;
                    const isActive = activeAvatarId === av.id;
                    return (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => isActive ? (setActiveAvatarId(null), setAvatarRefUrl(null), setPrompt(p => p.replace(/@[\w.]+/g,'').trim())) : injectAvatar(av)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all ${
                          isActive
                            ? 'border-violet-500 bg-violet-500/10 text-violet-300 shadow shadow-violet-500/20'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-violet-300 hover:text-violet-600'
                        }`}
                      >
                        {av.baseImage && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={av.baseImage} alt={av.name} className="w-4 h-4 rounded-full object-cover" />
                        )}
                        {tag}
                        {isActive && <Check className="w-3 h-3" />}
                      </button>
                    );
                  })}
                </div>
                {activeAvatarId && (
                  <p className="text-[10px] text-violet-500">✓ Avatar image set as reference — generates in her likeness</p>
                )}
              </div>
            )}

            {/* Prompt */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Prompt</p>
              <textarea value={prompt} onChange={(e) => handlePromptChange(e.target.value)} placeholder="Describe your AI influencer… (or tag @sofia above)" rows={4}
                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-300 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition" />
              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">Examples:</p>
                {EXAMPLES[mode].map((ex, i) => (
                  <button key={i} onClick={() => setPrompt(ex)} className="text-left text-xs text-slate-400 hover:text-violet-600 py-1 px-2 rounded-lg hover:bg-violet-50 transition-all w-full truncate">→ {ex}</button>
                ))}
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                <p className="text-xs text-red-600 leading-relaxed">{error}</p>
              </div>
            )}

            <button onClick={handleGenerate} disabled={!prompt.trim() || isGenerating}
              className="w-full py-4 rounded-2xl font-black text-base text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed relative overflow-hidden group"
              style={{ background: isGenerating ? "linear-gradient(135deg,#94a3b8,#64748b)" : "linear-gradient(135deg,#7c3aed,#4f46e5)", boxShadow: isGenerating ? "none" : "0 4px 20px rgba(124,58,237,0.35)" }}>
              {!isGenerating && <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />}
              <span className="relative flex items-center justify-center gap-3">
                {isGenerating ? <><RefreshCw className="h-5 w-5 animate-spin" />Generating…</> : <><Wand2 className="h-5 w-5" />Generate Influencer Image <span className="ml-1 flex items-center justify-center rounded-full bg-white/20 px-2 py-0.5 text-[10px] text-white backdrop-blur-sm"><Zap className="mr-1 h-3 w-3" /> 5 Credits</span></>}
              </span>
            </button>
          </div>

          {/* RIGHT — Live output */}
          <div className="space-y-4">
            {isGenerating && (
              <div className="flex flex-col items-center justify-center gap-6 rounded-2xl border border-slate-200 bg-white p-16 text-center min-h-[400px]">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-4 border-violet-200 border-t-violet-500 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center"><Sparkles className="h-7 w-7 text-violet-500 animate-pulse" /></div>
                </div>
                <div>
                  <p className="font-black text-slate-900 text-lg">AI is generating…</p>
                  <p className="text-sm text-slate-400 mt-1">Uploading to your gallery when done</p>
                </div>
              </div>
            )}

            {lastResult && !isGenerating && (
              <div className="rounded-2xl border border-violet-200 overflow-hidden bg-white shadow-sm">
                <div className="relative cursor-pointer" onClick={() => setZoomed(true)}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={lastResult} alt="Generated" className="w-full object-cover hover:scale-[1.01] transition-transform" />
                  <div className="absolute top-3 right-3"><Eye className="h-5 w-5 text-white drop-shadow-lg" /></div>
                  <div className="absolute top-3 left-3 bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md">✓ Saved to Gallery</div>
                </div>
                <div className="p-4 flex gap-3">
                  <button onClick={() => copyPrompt(prompt)} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-sm text-slate-500 hover:text-slate-700 transition">
                    {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}{copied ? "Copied!" : "Copy Prompt"}
                  </button>
                  <button onClick={() => handleDownload(lastResult, "latest")} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-violet-50 hover:bg-violet-100 border border-violet-200 text-sm text-violet-600 hover:text-violet-700 transition">
                    <Download className="h-4 w-4" />Download
                  </button>
                </div>
              </div>
            )}

            {!lastResult && !isGenerating && (
              <div className="flex flex-col items-center justify-center gap-6 rounded-2xl border-2 border-dashed border-slate-200 bg-white p-16 text-center min-h-[400px]">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 border border-violet-200 flex items-center justify-center">
                  <Wand2 className="h-10 w-10 text-violet-400" />
                </div>
                <div>
                  <p className="font-black text-slate-400 text-lg">Ready to create</p>
                  <p className="text-sm text-slate-400 mt-1 max-w-xs">Enter a prompt and hit Generate. Every image is saved to your gallery automatically.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* GALLERY SECTION */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-violet-100 rounded-xl flex items-center justify-center">
                <Images className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">My Gallery</h2>
                <p className="text-xs text-slate-400">{gallery.length} image{gallery.length !== 1 ? "s" : ""} saved to Cloudinary</p>
              </div>
            </div>
            <button onClick={fetchGallery} disabled={galleryLoading} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-sm text-slate-500 hover:text-slate-700 transition">
              <RefreshCw className={`h-3.5 w-3.5 ${galleryLoading ? "animate-spin" : ""}`} />Refresh
            </button>
          </div>

          {galleryLoading && gallery.length === 0 ? (
            <div className="flex items-center justify-center py-16"><RefreshCw className="h-8 w-8 text-violet-400 animate-spin" /></div>
          ) : gallery.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4 rounded-2xl border-2 border-dashed border-slate-200 bg-white">
              <Images className="h-12 w-12 text-slate-300" />
              <p className="text-slate-400 text-sm">No images yet. Generate your first AI influencer above!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {gallery.map((item) => (
                <div key={item._id} className="group relative rounded-xl overflow-hidden border border-slate-200 hover:border-violet-300 bg-white transition-all hover:-translate-y-1 shadow-sm hover:shadow-md">
                  <div className="relative aspect-square cursor-pointer" onClick={() => setGalleryZoomed(item)}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.cloudinaryUrl} alt={item.prompt} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                      <p className="text-[10px] text-white/90 line-clamp-2">{item.prompt}</p>
                    </div>
                  </div>
                  <div className="p-2 flex gap-1">
                    <button onClick={() => handleDownload(item.cloudinaryUrl, item._id)} className="flex-1 flex items-center justify-center py-1 rounded-lg bg-violet-50 hover:bg-violet-100 border border-violet-200 text-[10px] text-violet-600 transition">
                      <Download className="h-3 w-3" />
                    </button>
                    <button onClick={() => handleDelete(item._id)} className="flex items-center justify-center px-2 py-1 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-500 transition">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox - latest result */}
      {zoomed && lastResult && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4" onClick={() => setZoomed(false)}>
          <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition">
            <X className="h-5 w-5" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lastResult} alt="Generated" className="max-w-4xl max-h-[85vh] rounded-2xl object-contain shadow-2xl" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      {/* Gallery lightbox */}
      {galleryZoomed && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4" onClick={() => setGalleryZoomed(null)}>
          <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition">
            <X className="h-5 w-5" />
          </button>
          <div className="max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={galleryZoomed.cloudinaryUrl} alt={galleryZoomed.prompt} className="w-full max-h-[70vh] rounded-2xl object-contain shadow-2xl mb-4" />
            <div className="bg-white rounded-xl p-4 space-y-2 shadow-lg">
              <p className="text-slate-900 text-sm font-semibold">{galleryZoomed.prompt}</p>
              <div className="flex gap-3 text-xs text-slate-400">
                <span className="bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium">{MODE_META[galleryZoomed.mode]?.label}</span>
                {galleryZoomed.generationMs && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{(galleryZoomed.generationMs / 1000).toFixed(1)}s</span>}
                <span>{new Date(galleryZoomed.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={() => handleDownload(galleryZoomed.cloudinaryUrl, galleryZoomed._id)} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-violet-50 hover:bg-violet-100 border border-violet-200 text-sm text-violet-600 transition">
                  <Download className="h-4 w-4" />Download
                </button>
                <button onClick={() => handleDelete(galleryZoomed._id)} className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-sm text-red-500 transition">
                  <Trash2 className="h-4 w-4" />Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pay Modal */}
      <ImageGenPayModal
        isOpen={payModal.open}
        mode={payModal.mode}
        onClose={() => setPayModal({ ...payModal, open: false })}
        onSuccess={(creditsAdded) => {
          if (creditsAdded) setCredits((prev) => (prev ?? 0) + creditsAdded);
          setPayModal({ ...payModal, open: false });
          fetchCredits();
        }}
      />
    </div>
  );
}

export default function AIInfluencerPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="w-8 h-8 border-4 border-violet-200 border-t-violet-500 rounded-full animate-spin" /></div>}>
      <AIInfluencerInner />
    </Suspense>
  );
}
