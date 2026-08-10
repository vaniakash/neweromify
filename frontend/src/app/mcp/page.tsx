"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Check, Copy, ExternalLink, Zap, ChevronDown } from "lucide-react";

export default function McpLandingPage() {
  const [copiedUrl, setCopiedUrl] = useState(false);

  const copyUrl = () => {
    navigator.clipboard.writeText("https://api.eromify.in/mcp");
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans overflow-x-hidden relative">
      {/* Background radial glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-violet-600/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-fuchsia-600/5 blur-[120px] rounded-full pointer-events-none" />

      <main className="relative z-10 pt-20 pb-32 max-w-7xl mx-auto px-6">
        
        {/* ── HERO SECTION ── */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-32 pt-12">
          <div>
            <div className="flex items-center gap-3 text-xs font-bold tracking-widest text-violet-600 uppercase mb-8">
              <div className="w-6 h-[2px] bg-violet-600"></div>
              MCP CONNECTOR
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6">
              Run<br/>
              Eromify<br/>
              <span className="italic text-violet-600">inside Claude<span className="text-slate-300">.</span></span>
            </h1>
            <p className="text-lg text-slate-600 mb-10 max-w-lg leading-relaxed">
              Connect your account once. Then generate AI images and videos, upload references, and check credits straight from a Claude conversation. Same credits as the app, no markup.
            </p>
            
            <div className="max-w-md">
              <div 
                onClick={copyUrl}
                className="flex items-center justify-between gap-4 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl mb-6 cursor-pointer hover:border-slate-300 transition-all group"
              >
                <span className="text-sm font-mono text-slate-700 truncate">https://api.eromify.in/mcp</span>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500 group-hover:text-slate-700 transition-colors">
                  {copiedUrl ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  {copiedUrl ? "Copied" : "Copy"}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <Link href="https://claude.ai" target="_blank" className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold rounded-xl transition-colors">
                  <Zap className="w-4 h-4" />
                  Connect in Claude
                </Link>
                <Link href="/mcp-keys" className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-xl transition-colors border border-slate-200 hover:border-slate-300 shadow-sm">
                  Get a key for Cursor &rarr;
                </Link>
              </div>
            </div>
          </div>

          {/* Chat Mockup */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/10 to-fuchsia-500/10 blur-3xl rounded-[3rem]" />
            <div className="relative bg-white border border-slate-200 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-8 pb-4 border-b border-slate-100">
                <div className="flex gap-1.5 mr-4">
                  <div className="w-3 h-3 rounded-full bg-slate-200" />
                  <div className="w-3 h-3 rounded-full bg-slate-200" />
                  <div className="w-3 h-3 rounded-full bg-slate-200" />
                </div>
                <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">Claude &middot; Eromify</span>
              </div>

              <div className="space-y-6">
                <div className="flex justify-end">
                  <div className="bg-violet-600 text-white text-sm px-5 py-3 rounded-2xl rounded-tr-sm inline-block shadow-sm">
                    List my AI characters
                  </div>
                </div>
                
                <div className="flex justify-start">
                  <div className="bg-slate-50 text-slate-700 text-sm px-5 py-3 rounded-2xl rounded-tl-sm inline-block border border-slate-100 shadow-sm">
                    Aria, Noa, Maya &mdash; all ready to generate.
                  </div>
                </div>

                <div className="flex justify-end">
                  <div className="bg-violet-600 text-white text-sm px-5 py-3 rounded-2xl rounded-tr-sm inline-block shadow-sm">
                    Make 4 portraits of Aria at golden hour, 4:5
                  </div>
                </div>
                
                <div className="flex justify-start">
                  <div className="bg-emerald-50 text-emerald-800 text-sm px-4 py-2.5 rounded-xl border border-emerald-100 inline-flex items-center gap-2 shadow-sm">
                    <Check className="w-4 h-4 text-emerald-600" />
                    Done &middot; 8,000 credits used
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-24" />

        {/* ── THREE STEPS ── */}
        <div className="mb-32">
          <div className="flex items-center gap-3 text-xs font-bold tracking-widest text-violet-600 uppercase mb-8">
            <div className="w-6 h-[2px] bg-violet-600"></div>
            THREE STEPS, ~30 SECONDS
          </div>
          
          <div className="grid md:grid-cols-3 gap-0 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
            <div className="p-8 border-b md:border-b-0 md:border-r border-slate-200">
              <h4 className="text-xl font-black text-slate-900 mb-4">01</h4>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Open Claude connectors</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                In Claude, go to Settings &rarr; Connectors.
              </p>
            </div>
            <div className="p-8 border-b md:border-b-0 md:border-r border-slate-200">
              <h4 className="text-xl font-black text-slate-900 mb-4">02</h4>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Add a custom connector</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Paste the Eromify server URL. No client secret needed.
              </p>
            </div>
            <div className="p-8">
              <h4 className="text-xl font-black text-slate-900 mb-4">03</h4>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Sign in & authorize</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Approve with your Eromify account. Connected &mdash; no API key to paste.
              </p>
            </div>
          </div>
        </div>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-24" />

        {/* ── WHAT YOU CAN DO ── */}
        <div className="mb-32">
          <div className="flex items-center gap-3 text-xs font-bold tracking-widest text-violet-600 uppercase mb-10">
            <div className="w-6 h-[2px] bg-violet-600"></div>
            WHAT YOU CAN DO FROM CHAT
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-slate-300 transition-colors shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center mb-6">
                <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Generate images</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                GPT Image 2, Seedance 2, Nano Banana &mdash; from a sentence.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-slate-300 transition-colors shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center mb-6">
                <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Generate videos</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Text-to-video or animate a still. Sora 2, Veo 3.1, Kling v3.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-slate-300 transition-colors shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center mb-6">
                <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">See results inline</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Claude views each output right in the chat, no link-hopping.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-slate-300 transition-colors shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center mb-6">
                <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Use your references</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Upload a character or product image and generate from it.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-slate-300 transition-colors shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center mb-6">
                <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Stay in control</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Check credits, plan, and history before any spend.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-slate-300 transition-colors shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center mb-6">
                <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Safe by default</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Keys hashed, revocable, rate-limited per account.
              </p>
            </div>
          </div>
        </div>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-24" />

        {/* ── POWERED BY ── */}
        <div className="mb-32">
          <div className="flex items-center gap-3 text-xs font-bold tracking-widest text-violet-600 uppercase mb-8">
            <div className="w-6 h-[2px] bg-violet-600"></div>
            POWERED BY THE BEST MODELS
          </div>
          
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <div className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-full flex items-center gap-2">
              <span className="font-bold text-slate-800 text-sm">GPT Image 2</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">OpenAI</span>
            </div>
            <div className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-full flex items-center gap-2">
              <span className="font-bold text-slate-800 text-sm">Seedance 2</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">ByteDance</span>
            </div>
            <div className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-full flex items-center gap-2">
              <span className="font-bold text-slate-800 text-sm">Sora 2</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">OpenAI</span>
            </div>
            <div className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-full flex items-center gap-2">
              <span className="font-bold text-slate-800 text-sm">Veo 3.1</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Google</span>
            </div>
            <div className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-full flex items-center gap-2">
              <span className="font-bold text-slate-800 text-sm">Kling v3</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Kuaishou</span>
            </div>
            <div className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-full flex items-center gap-2">
              <span className="font-bold text-slate-800 text-sm">Nano Banana</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Google</span>
            </div>
          </div>

          <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
            Claude picks the right model from your prompt. You pay the same credits as in the app &mdash; connecting through Claude never costs extra.
          </p>
        </div>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-24" />

        {/* ── FAQ ── */}
        <div className="mb-32">
          <h2 className="text-3xl font-black text-slate-900 mb-12">FAQ</h2>
          
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-10">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">How do I connect Eromify to Claude?</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                In Claude, open Settings &rarr; Connectors &rarr; Add custom connector and paste the server URL <code className="text-violet-700 bg-violet-100 px-1 rounded">https://api.eromify.in/mcp</code>. Sign in with your Eromify account and approve &mdash; no API key to paste. The whole setup takes about 30 seconds.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Does using Eromify inside Claude cost extra?</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                No. You spend the same credits as in the app, and connecting through Claude never adds a markup. You can check your credit balance from the chat before generating.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Can I use it in Cursor or scripts instead of Claude?</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Yes. Cursor, Claude Desktop, and custom scripts connect with a personal API key from Settings &rarr; Claude/MCP, using the same server URL as a Bearer token.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">What can I do from a Claude conversation?</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Generate AI images and videos, view results inline, upload reference images, check your credit balance and plan, and browse your generation history &mdash; all without leaving the chat.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Which AI models are available?</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                GPT Image 2 (OpenAI) and Seedance 2 (ByteDance) lead the lineup, with Sora 2 (OpenAI), Veo 3.1 (Google), Kling v3 (Kuaishou), and Nano Banana (Google) also available. Claude picks the right model from your prompt.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Is the connection secure?</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Yes. Connections use OAuth, API keys are hashed at rest and revocable anytime, and usage is rate-limited per account (120 requests and 20 generations per minute).
              </p>
            </div>
          </div>
        </div>

        {/* ── FOOTER CTA ── */}
        <div className="text-center py-20 bg-slate-50 border border-slate-200 rounded-3xl shadow-sm">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">
            Your AI studio, one message away.
          </h2>
          <p className="text-slate-600 mb-10 max-w-lg mx-auto">
            Connect Eromify to Claude and start creating from chat.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="https://claude.ai" target="_blank" className="inline-flex items-center gap-2 px-8 py-4 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl transition-colors">
              <Zap className="w-4 h-4" />
              Connect in Claude
            </Link>
            <Link href="/" className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 font-bold rounded-xl transition-colors shadow-sm">
              Go to dashboard &rarr;
            </Link>
          </div>
        </div>

      </main>
    </div>
  );
}
