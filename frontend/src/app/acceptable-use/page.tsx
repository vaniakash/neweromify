"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";

export default function AcceptableUsePolicyPage() {
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
    { id: "prohibited-content", label: "2. Prohibited Content" },
    { id: "real-people", label: "3. No Real-Person Manipulation" },
    { id: "no-minors", label: "4. Protection of Minors" },
    { id: "enforcement", label: "5. Enforcement & Termination" },
    { id: "reporting", label: "6. Reporting Violations" },
  ];

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 100,
        behavior: "smooth",
      });
    }
  };

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
              <span className="text-slate-900 font-medium">Acceptable Use Policy</span>
            </nav>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              Acceptable Use Policy
            </h1>
            <p className="mt-4 text-lg text-slate-500">
              Last updated: <time dateTime="2026-03-13">March 13, 2026</time>
            </p>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:gap-16">
          <aside className="mb-12 lg:mb-0 lg:w-64 flex-shrink-0">
            <div className="lg:hidden mb-8">
              <label
                className="block text-sm font-medium text-slate-700 mb-2"
                htmlFor="toc-select"
              >
                Jump to section
              </label>
              <select
                className="block w-full rounded-md border-slate-300 shadow-sm focus:border-[#1736cf] focus:ring-[#1736cf] text-sm"
                id="toc-select"
                onChange={handleSelectChange}
                value={activeSection || "introduction"}
              >
                {navLinks.map((link) => (
                  <option key={link.id} value={link.id}>
                    {link.label}
                  </option>
                ))}
              </select>
            </div>

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
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                1. Introduction
              </h2>
              <p className="text-slate-600 mb-4 leading-relaxed">
                This Acceptable Use Policy dictates what is and is not permitted on Eromify. Our goal is to provide a creative and expansive platform for AI character generation while ensuring the safety, privacy, and well-being of all individuals. By using our services, you agree to adhere strictly to this policy.
              </p>
            </section>

            <section id="prohibited-content" className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                2. Prohibited Content & User Generated Content (UGC)
              </h2>
              <p className="text-slate-600 mb-4 leading-relaxed">
                You may not use Eromify to create, generate, upload, or share content that:
              </p>
              <ul className="list-disc pl-5 mb-6 text-slate-600 space-y-2">
                <li>Promotes violence, terrorism, or illegal acts.</li>
                <li>Contains hate speech, harassment, or bullying.</li>
                <li>Depicts non-consensual sexual acts, sexual violence, or bestiality.</li>
                <li>Violates the intellectual property, privacy, or publicity rights of others.</li>
              </ul>
              <p className="text-slate-600 mb-4 leading-relaxed">
                Automated moderation checks are integrated into our systems to detect and block prohibited requests where technically possible.
              </p>
            </section>

            <section id="real-people" className="mb-10">
              <div className="p-6 bg-red-50 border border-red-200 rounded-xl">
                <h2 className="text-2xl font-bold text-red-900 mb-4 pb-2 border-b border-red-200">
                  3. No Real-Person Manipulation & Deepfakes
                </h2>
                <p className="text-red-800 font-medium mb-4 leading-relaxed">
                  Real-person image manipulation is strictly prohibited on our platform. 
                </p>
                <p className="text-red-800 mb-4 leading-relaxed">
                  Users must not upload, morph, face-swap, sexualize, or generate altered sexual or intimate content involving a real person. We maintain a zero-tolerance policy against Non-Consensual Intimate Imagery (NCII) and deepfakes of real individuals. Do not allow users to use the platform to impersonate or sexually depict real people.
                </p>
              </div>
            </section>

            <section id="no-minors" className="mb-10">
              <div className="p-6 bg-red-50 border border-red-200 rounded-xl">
                <h2 className="text-2xl font-bold text-red-900 mb-4 pb-2 border-b border-red-200">
                  4. Protection of Minors
                </h2>
                <p className="text-red-800 font-medium mb-4 leading-relaxed">
                  Absolutely no minors.
                </p>
                <p className="text-red-800 mb-4 leading-relaxed">
                  Sexual or explicit content involving anyone under the age of 18 is strictly prohibited. This rule applies universally to real individuals, AI-generated persons, fictional characters, or any persons whose age is ambiguous or who appear to be under 18. Any attempt to generate such content will trigger automatic bans and reporting.
                </p>
              </div>
            </section>

            <section id="enforcement" className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                5. Enforcement & Termination
              </h2>
              <p className="text-slate-600 mb-4 leading-relaxed font-semibold">
                If a user is found creating or attempting to create prohibited content, their account will be permanently terminated.
              </p>
              <p className="text-slate-600 mb-4 leading-relaxed">
                We reserve the right to remove any content, disable accounts, and report violations to law enforcement agencies, especially concerning child exploitation, NCII, or other illegal activities. 
              </p>
            </section>

            <section id="reporting" className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                6. Reporting Violations
              </h2>
              <p className="text-slate-600 mb-4 leading-relaxed">
                If you encounter content or user behavior that violates this policy, please report it immediately using our <Link href="/report-abuse" className="text-[#1736cf] font-medium hover:underline">Report Abuse / NCII</Link> tool.
              </p>
              <div className="mt-6 p-6 bg-slate-50 border border-slate-200 rounded-xl">
                <ul className="list-none space-y-4">
                  <li className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-[#1736cf]" />
                    <a
                      className="text-[#1736cf] font-medium hover:underline"
                      href="mailto:eromify.in@gmail.com"
                    >
                      eromify.in@gmail.com
                    </a>
                  </li>
                </ul>
              </div>
            </section>
          </article>
        </div>
      </main>
    </div>
  );
}
