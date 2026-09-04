import { Lock } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Service Unavailable | Eromify',
  description: 'Eromify is currently only available in select regions.',
};

export default function NotAvailable() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a050f] text-white p-4">
      <div className="max-w-md w-full p-8 bg-[#130820] rounded-3xl border border-rose-500/20 shadow-2xl text-center relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-rose-600/20 blur-[60px]" />
        
        <div className="relative z-10">
          <div className="w-16 h-16 mx-auto mb-6 bg-rose-500/10 rounded-full flex items-center justify-center border border-rose-500/30">
            <Lock className="w-8 h-8 text-rose-500" />
          </div>
          <h1 className="text-2xl font-black mb-3">Service Unavailable</h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            We apologize, but Eromify is currently not available in your region. We are working hard to expand our services globally. Please check back later.
          </p>
          <p className="text-xs font-semibold text-rose-500 uppercase tracking-widest">
            Error: Region Blocked
          </p>
        </div>
      </div>
    </div>
  );
}
