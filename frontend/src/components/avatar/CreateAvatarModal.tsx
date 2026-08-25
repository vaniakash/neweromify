'use client';

import { useState, useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Upload, X, Check, ArrowRight, ImagePlus } from 'lucide-react';
import { useAvatarStore } from '@/lib/store/avatarStore';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface CreateAvatarModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CLOUDINARY = 'https://res.cloudinary.com/z6nizbkh/image/upload/modie';

const TEMPLATES = [
  { id: 't1', src: `${CLOUDINARY}/sofi.png`,   label: 'Sofia'     },
  { id: 't2', src: `${CLOUDINARY}/alia.png`,   label: 'Alia'      },
  { id: 't3', src: `${CLOUDINARY}/kira.png`,   label: 'Kira'      },
  { id: 't4', src: `${CLOUDINARY}/llia.png`,   label: 'Isabella'  },
  { id: 't5', src: `${CLOUDINARY}/sia.png`,    label: 'Sia'       },
  { id: 't6', src: `${CLOUDINARY}/ria.png`,    label: 'Ria'       },
  { id: 't7', src: `${CLOUDINARY}/nia.png`,    label: 'Mia'       },
  { id: 't8', src: `${CLOUDINARY}/kia.png`,    label: 'Ava'       },
  { id: 't9', src: `${CLOUDINARY}/gg.png`,     label: 'Emily'     },
  { id: 't10', src: `${CLOUDINARY}/sweedy.png`, label: 'Chloe'   },
  { id: 't11', src: `${CLOUDINARY}/sturm.png`,  label: 'Hannah'  },
  { id: 't12', src: `${CLOUDINARY}/akash.png`,  label: 'Arjun'   },
];

type Tab = 'templates' | 'upload';

export function CreateAvatarModal({ open, onOpenChange }: CreateAvatarModalProps) {
  const router = useRouter();
  const { createAvatarWithImage } = useAvatarStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const [tab, setTab] = useState<Tab>('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedImage = tab === 'templates' ? selectedTemplate : uploadedImage;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setUploadedImage(ev.target?.result as string);
    reader.readAsDataURL(file);
    setTab('upload');
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!username || username === autoUser(name)) {
      setUsername(autoUser(val));
    }
  };

  const autoUser = (n: string) => `@${n.trim().toLowerCase().replace(/\s+/g, '')}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !selectedImage) return;
    setIsSubmitting(true);
    setTimeout(() => {
      createAvatarWithImage(
        name.trim(),
        username.trim() || autoUser(name),
        selectedImage
      );
      setIsSubmitting(false);
      // reset
      setName(''); setUsername('');
      setSelectedTemplate(null); setUploadedImage(null);
      setTab('templates');
      onOpenChange(false);
    }, 400);
  };

  const handleClose = () => {
    setName(''); setUsername('');
    setSelectedTemplate(null); setUploadedImage(null);
    setTab('templates');
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && handleClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
        <Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-2xl bg-[#0f0f13] border border-white/10 shadow-2xl rounded-2xl z-50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/5">
            <div>
              <Dialog.Title className="text-lg font-bold text-white">Create Avatar</Dialog.Title>
              <Dialog.Description className="text-slate-500 text-sm mt-0.5">Pick a base image and give her a name</Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button onClick={handleClose} className="text-slate-500 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-xl">
                <X className="w-4 h-4" />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="flex gap-0 max-h-[70vh]">

              {/* LEFT — image picker */}
              <div className="flex-1 border-r border-white/5 flex flex-col">
                {/* Tabs */}
                <div className="flex border-b border-white/5">
                  <button
                    type="button"
                    onClick={() => setTab('templates')}
                    className={`flex-1 py-3 text-sm font-semibold transition-colors ${tab === 'templates' ? 'text-white border-b-2 border-violet-500' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    Templates
                  </button>
                  <button
                    type="button"
                    onClick={() => { setTab('upload'); fileRef.current?.click(); }}
                    className={`flex-1 py-3 text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 ${tab === 'upload' ? 'text-white border-b-2 border-violet-500' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    <ImagePlus className="w-3.5 h-3.5" /> Upload
                  </button>
                </div>

                {/* Template grid */}
                {tab === 'templates' && (
                  <div className="grid grid-cols-3 gap-2 p-3 overflow-y-auto flex-1 custom-scrollbar">
                    {TEMPLATES.map((t) => {
                      const isSelected = selectedTemplate === t.src;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => { setSelectedTemplate(t.src); if (!name) handleNameChange(t.label); }}
                          className={`relative aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all group ${isSelected ? 'border-violet-500 shadow-lg shadow-violet-500/30' : 'border-white/5 hover:border-white/20'}`}
                        >
                          <Image src={t.src} alt={t.label} fill className="object-cover" sizes="120px" />
                          <div className={`absolute inset-0 bg-black/40 flex items-end justify-center pb-2 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                            <span className="text-white text-[10px] font-bold">{t.label}</span>
                          </div>
                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-violet-500 rounded-full flex items-center justify-center shadow">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Upload preview */}
                {tab === 'upload' && (
                  <div className="flex-1 flex flex-col items-center justify-center p-6">
                    {uploadedImage ? (
                      <div className="relative w-48 aspect-[3/4] rounded-xl overflow-hidden border-2 border-violet-500 shadow-lg shadow-violet-500/30">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={uploadedImage} alt="Uploaded" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setUploadedImage(null)}
                          className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-red-500 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center gap-3 w-full h-full border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-violet-500/50 hover:bg-violet-500/5 transition-all p-8">
                        <Upload className="w-8 h-8 text-slate-500" />
                        <p className="text-slate-400 text-sm text-center">Click to upload your image<br /><span className="text-xs text-slate-600">PNG, JPG or WEBP</span></p>
                        <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleFileChange} />
                      </label>
                    )}
                    <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleFileChange} />
                  </div>
                )}
              </div>

              {/* RIGHT — name inputs */}
              <div className="w-64 p-5 flex flex-col justify-between">
                <div className="space-y-4">
                  {/* Preview of selected image */}
                  <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-white/10 bg-white/5 flex items-center justify-center">
                    {selectedImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-slate-600 text-2xl font-bold">{name ? name.charAt(0).toUpperCase() : '?'}</span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="e.g. Sofia"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 text-sm transition"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Username</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="@sofia"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 text-sm transition"
                    />
                    <p className="text-[11px] text-slate-600">Use this as @tag in the creator</p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!name.trim() || !selectedImage || isSubmitting}
                  className="w-full mt-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 text-sm"
                >
                  {isSubmitting ? 'Creating…' : <><span>Create Avatar</span><ArrowRight className="w-4 h-4" /></>}
                </button>
              </div>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
