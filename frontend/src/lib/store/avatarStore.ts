import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AvatarProfile {
  id: string;
  name: string;
  username: string;
  baseImage: string | null;
  createdAt: number;
}

interface AvatarStore {
  avatars: AvatarProfile[];
  createAvatar: (name: string, username: string) => AvatarProfile;
  createAvatarWithImage: (name: string, username: string, baseImage: string) => AvatarProfile;
  updateAvatarBaseImage: (id: string, imageUrl: string) => void;
  deleteAvatar: (id: string) => void;
}

/** Sync an avatar to MongoDB so MCP tools can access it server-side */
async function syncAvatarToServer(avatar: AvatarProfile) {
  if (!avatar.baseImage) return;
  try {
    await fetch('/api/user/avatars', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId:  avatar.id,
        name:      avatar.name,
        username:  avatar.username,
        baseImage: avatar.baseImage,
      }),
    });
  } catch {
    // Non-fatal — local store is source of truth for UI
  }
}

/** Remove an avatar from MongoDB */
async function removeAvatarFromServer(id: string) {
  try {
    await fetch(`/api/user/avatars?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
  } catch {
    // Non-fatal
  }
}

export const useAvatarStore = create<AvatarStore>()(
  persist(
    (set) => ({
      avatars: [],

      createAvatar: (name, username) => {
        const newAvatar: AvatarProfile = {
          id: Math.random().toString(36).substring(2, 11),
          name,
          username,
          baseImage: null,
          createdAt: Date.now(),
        };
        set((state) => ({ avatars: [...state.avatars, newAvatar] }));
        return newAvatar;
      },

      createAvatarWithImage: (name, username, baseImage) => {
        const newAvatar: AvatarProfile = {
          id: Math.random().toString(36).substring(2, 11),
          name,
          username,
          baseImage,
          createdAt: Date.now(),
        };
        set((state) => ({ avatars: [...state.avatars, newAvatar] }));
        // Sync to MongoDB for MCP access (fire-and-forget)
        syncAvatarToServer(newAvatar);
        return newAvatar;
      },

      updateAvatarBaseImage: (id, imageUrl) => {
        set((state) => {
          const updated = state.avatars.map((avatar) =>
            avatar.id === id ? { ...avatar, baseImage: imageUrl } : avatar
          );
          const updatedAvatar = updated.find((a) => a.id === id);
          if (updatedAvatar) syncAvatarToServer(updatedAvatar);
          return { avatars: updated };
        });
      },

      deleteAvatar: (id) => {
        set((state) => ({
          avatars: state.avatars.filter((avatar) => avatar.id !== id),
        }));
        // Remove from MongoDB too
        removeAvatarFromServer(id);
      },
    }),
    {
      name: 'eromify-avatars',
    }
  )
);
