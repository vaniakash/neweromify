'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import { Users, Plus, Sparkles, Trash2, Wand2 } from "lucide-react";
import { useAvatarStore } from "@/lib/store/avatarStore";
import { CreateAvatarModal } from "./CreateAvatarModal";
import { useRouter } from "next/navigation";

export function AvatarHubClient() {
  const router = useRouter();
  const { avatars, deleteAvatar } = useAvatarStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Sync all localStorage avatars to MongoDB on mount so MCP can access them.
  // This runs once per page load and is a no-op if already synced (upsert).
  useEffect(() => {
    const avatarsWithImages = avatars.filter((a) => a.baseImage);
    if (avatarsWithImages.length === 0) return;
    avatarsWithImages.forEach((avatar) => {
      fetch('/api/user/avatars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId:  avatar.id,
          name:      avatar.name,
          username:  avatar.username,
          baseImage: avatar.baseImage,
        }),
      }).catch(() => {}); // fire-and-forget, non-fatal
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // only on mount

  const goToCreator = (avatarId: string, baseImage: string | null) => {
    const url = baseImage
      ? `/tools/creator/ai-influencer?avatarId=${avatarId}&ref=${encodeURIComponent(baseImage)}`
      : `/tools/creator/ai-influencer?avatarId=${avatarId}`;
    router.push(url);
  };

  if (avatars.length === 0) {
    return (
      <div className="flex flex-col min-h-full bg-slate-50">
        {/* Header */}
        <div className="px-8 py-8 flex items-center justify-between border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Avatars</h1>
            <p className="text-slate-500 text-sm">Create an AI avatar and generate content with her @tag</p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-900 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors border border-slate-200"
          >
            <Plus className="w-4 h-4" />
            Create
          </button>
        </div>

        {/* Empty State */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="w-full max-w-md border border-slate-200 rounded-3xl bg-white flex flex-col items-center justify-center py-20 shadow-xl">
            <div className="w-14 h-14 mb-5 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center">
              <Users className="w-7 h-7 text-violet-400" strokeWidth={1.5} />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-1">No avatars yet</h2>
            <p className="text-slate-500 text-sm mb-7 text-center max-w-xs">Create an avatar, then tag her with <span className="font-mono font-bold text-violet-600">@name</span> in the AI creator to generate her images.</p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/25"
            >
              <Plus className="w-4 h-4" />
              Create First Avatar
            </button>
          </div>
        </div>

        <CreateAvatarModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full bg-slate-50">
      {/* Header */}
      <div className="px-8 py-8 flex items-center justify-between border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Avatars</h1>
          <p className="text-slate-500 text-sm">Tag your avatars with <span className="font-mono font-bold text-violet-600">@name</span> in the AI creator</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors shadow-lg shadow-indigo-500/25"
        >
          <Plus className="w-4 h-4" />
          Create
        </button>
      </div>

      {/* Avatars Grid */}
      <div className="flex-1 max-w-screen-xl mx-auto w-full px-8 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {avatars.map((avatar) => {
            const tag = avatar.username?.startsWith('@') ? avatar.username : `@${avatar.name.toLowerCase()}`;
            return (
              <div
                key={avatar.id}
                className="group relative rounded-2xl border border-slate-200 overflow-hidden bg-white hover:border-violet-300 hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-300"
              >
                {/* Image */}
                <div className="aspect-[3/4] w-full relative overflow-hidden bg-slate-100 flex items-center justify-center">
                  {avatar.baseImage ? (
                    <>
                      <Image
                        src={avatar.baseImage}
                        alt={avatar.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    </>
                  ) : (
                    <span className="text-5xl font-bold text-violet-300">{avatar.name.charAt(0).toUpperCase()}</span>
                  )}

                  {/* Tag badge */}
                  <div className="absolute bottom-2 left-2">
                    <span className="text-xs font-mono font-bold text-white bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10">
                      {tag}
                    </span>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete ${avatar.name}?`)) deleteAvatar(avatar.id);
                    }}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-slate-300 hover:text-red-400 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Footer */}
                <div className="p-3">
                  <p className="text-slate-900 font-bold text-sm mb-2 truncate">{avatar.name}</p>
                  <button
                    onClick={() => goToCreator(avatar.id, avatar.baseImage)}
                    className="w-full py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center gap-1.5"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    Generate
                  </button>
                </div>
              </div>
            );
          })}

          {/* Add new card */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="rounded-2xl border-2 border-dashed border-slate-200 hover:border-violet-400 hover:bg-violet-50/30 aspect-[3/4] flex flex-col items-center justify-center gap-3 text-slate-400 hover:text-violet-500 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl border-2 border-current flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-sm font-semibold">Add Avatar</span>
          </button>
        </div>
      </div>

      <CreateAvatarModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} />
    </div>
  );
}
