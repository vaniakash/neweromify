"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function AISafetyPolicyPage() {
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll("section[id]");
      let current = "";
      sections.forEach((section) => {
        const sectionTop = (section as HTMLElement).offsetTop;
        if (window.scrollY >= sectionTop - 120) {
          current = section.getAttribute("id") || "";
        }
      });
      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { id: "introduction", label: "1. Introduction" },
    { id: "no-deepfakes", label: "2. Deepfakes & Impersonation" },
    { id: "moderation", label: "3. Automated Moderation" },
    { id: "user-responsibility", label: "4. User Responsibility" },
  ];

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 100,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <section className="bg-white pt-16 pb-12 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <nav className="flex mb-4 text-sm text-slate-500 gap-2 items-center">
              <Link className="hover:text-[#1736cf]" href="/">
                Home
              </Link>
              <span className="text-xs">&gt;</span>
              <span className="text-slate-900 font-medium">AI Safety & Ethical Use</span>
            </nav>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              AI Safety & Ethical Use Policy
            </h1>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:gap-16">
          <aside className="mb-12 lg:mb-0 lg:w-64 flex-shrink-0">
            <nav className="hidden lg:block sticky top-24 space-y-1">
              <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
                On this page
              </h3>
              {navLinks.map((link) => (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  onClick={(e) => scrollToSection(e, link.id)}
                  className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    activeSection === link.id
                      ? "bg-[#1736cf]/10 text-[#1736cf]"
                      : "text-slate-600 hover:bg-slate-100 hover:text-[#1736cf]"
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </aside>

          <article className="prose prose-blue max-w-[800px] flex-grow bg-white p-8 sm:p-12 shadow-sm ring-1 ring-slate-200 rounded-xl">
            
            <section id="introduction" className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-[#1736cf]" />
                1. Introduction
              </h2>
              <p className="text-slate-600 mb-4 leading-relaxed">
                Eromify is committed to the safe, responsible, and ethical use of artificial intelligence. We believe in providing powerful tools for creativity while putting robust guardrails in place to prevent harm and abuse.
              </p>
            </section>

            <section id="no-deepfakes" className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                2. Deepfakes & Impersonation
              </h2>
              <p className="text-slate-600 mb-4 leading-relaxed font-semibold text-red-600">
                Generating deepfakes, impersonating real people without their consent, and manipulating images of real individuals is strictly prohibited.
              </p>
              <p className="text-slate-600 mb-4 leading-relaxed">
                Users are strictly forbidden from uploading images of real people to alter them in any way that violates their privacy, dignity, or rights, including but not limited to the creation of sexualized content. Eromify's generative features are intended for the creation of fictional AI influencers only. 
              </p>
            </section>

            <section id="moderation" className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                3. Automated Moderation
              </h2>
              <p className="text-slate-600 mb-4 leading-relaxed">
                We employ automated moderation and safety checks in our AI generation pipelines. These systems are designed to detect and block prohibited requests, including keywords, image structures, and concepts related to minors, extreme violence, and known non-consensual imagery.
              </p>
              <p className="text-slate-600 mb-4 leading-relaxed">
                If the system flags a prompt or an uploaded image, the generation will be blocked. Repeated attempts to bypass these systems will result in permanent account termination.
              </p>
            </section>

            <section id="user-responsibility" className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                4. User Responsibility
              </h2>
              <p className="text-slate-600 mb-4 leading-relaxed">
                While we strive to maintain a safe platform through automated tools and active moderation, safety is a shared responsibility. Users are required to adhere to all policies, report violations via the <Link href="/report-abuse" className="text-[#1736cf] font-medium hover:underline">Report Abuse</Link> tool, and use the platform ethically. Any attempts to jailbreak, trick, or manipulate the AI into producing harmful content is a violation of our Terms of Service.
              </p>
            </section>

          </article>
        </div>
      </main>
    </div>
  );
}
