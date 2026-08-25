'use client';

import { useAvatarStore } from "@/lib/store/avatarStore";
import { ChevronLeft, Wand2, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export function AvatarProfileClient({ id }: { id: string }) {
  const router = useRouter();
  const { avatars } = useAvatarStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => { setHydrated(true); }, []);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0f]">
        <RefreshCw className="h-8 w-8 text-violet-400 animate-spin" />
      </div>
    );
  }

  const avatar = avatars.find((a) => a.id === id);

  if (!avatar) {
    return (
      <div className="flex flex-col min-h-screen bg-[#0a0a0f] items-center justify-center gap-5">
        <p className="text-slate-400">Avatar not found.</p>
        <button onClick={() => router.push('/avatar')} className="px-5 py-2 bg-violet-600 text-white rounded-xl text-sm font-semibold">Back to Avatars</button>
      </div>
    );
  }

  const tag = avatar.username?.startsWith('@') ? avatar.username : `@${avatar.name.toLowerCase()}`;
  const createLink = avatar.baseImage
    ? `/tools/creator/ai-influencer?avatarId=${avatar.id}&ref=${encodeURIComponent(avatar.baseImage)}`
    : `/tools/creator/ai-influencer?avatarId=${avatar.id}`;

  return (
    <div className="flex flex-col min-h-full bg-[#0a0a0f]">
      {/* Back */}
      <div className="sticky top-0 z-20 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4">
        <Link href="/avatar" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium w-fit">
          <ChevronLeft className="h-4 w-4" /> Back to Avatars
        </Link>
      </div>

      {/* Content */}
      <div className="flex flex-col items-center justify-center flex-1 py-20 px-6">
        {/* Avatar image */}
        <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-violet-500/30 shadow-2xl shadow-violet-500/20 bg-[#151520] flex items-center justify-center mb-6 relative">
          {avatar.baseImage ? (
            <Image src={avatar.baseImage} alt={avatar.name} fill className="object-cover object-top" />
          ) : (
            <span className="text-6xl font-bold text-violet-400">{avatar.name.charAt(0).toUpperCase()}</span>
          )}
        </div>

        <h1 className="text-3xl font-bold text-white mb-1">{avatar.name}</h1>
        <p className="text-slate-500 font-mono text-sm mb-10">{tag}</p>

        <Link href={createLink}>
          <button className="px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/30 flex items-center gap-3 text-base transition-all">
            <Wand2 className="w-5 h-5" />
            Generate with {tag}
          </button>
        </Link>

        <p className="text-slate-600 text-xs mt-5">
          Tag <span className="font-mono text-slate-400">{tag}</span> in the AI creator prompt to use this avatar&apos;s image as reference
        </p>
      </div>
    </div>
  );
}
