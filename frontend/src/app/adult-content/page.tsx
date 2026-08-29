"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function AdultContentPolicyPage() {
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
    { id: "age-restriction", label: "1. 18+ Age Restriction" },
    { id: "ai-only", label: "2. AI Characters Only" },
    { id: "no-minors", label: "3. Absolute Ban on Minors" },
    { id: "violations", label: "4. Violations & Termination" },
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
              <span className="text-slate-900 font-medium">18+ / Adult Content Policy</span>
            </nav>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              18+ / Adult Content Policy
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
            
            <section id="age-restriction" className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                1. 18+ Age Restriction
              </h2>
              <p className="text-slate-600 mb-4 leading-relaxed">
                Access to any adult or NSFW generation features on Eromify is strictly limited to users who are 18 years of age or older. By registering and utilizing these features, you legally affirm that you are of legal age in your jurisdiction.
              </p>
            </section>

            <section id="ai-only" className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                2. AI Characters Only
              </h2>
              <p className="text-slate-600 mb-4 leading-relaxed font-semibold">
                The adult-content feature is strictly limited to AI influencers and fictional characters generated through our platform.
              </p>
              <p className="text-slate-600 mb-4 leading-relaxed">
                You may not upload images of real people to sexualize them or create non-consensual intimate imagery (NCII). This is a severe violation of our policies and against the law in many jurisdictions. We utilize automated safety checks to prevent the uploading or generation of deepfakes involving real individuals.
              </p>
            </section>

            <section id="no-minors" className="mb-10">
              <div className="p-6 bg-red-50 border border-red-200 rounded-xl">
                <h2 className="text-2xl font-bold text-red-900 mb-4 pb-2 border-b border-red-200 flex items-center gap-2">
                  <ShieldAlert className="h-6 w-6" />
                  3. Absolute Ban on Minors
                </h2>
                <p className="text-red-800 font-bold mb-4 leading-relaxed">
                  Absolutely no minors. Sexual or explicit content involving anyone under 18 is strictly prohibited.
                </p>
                <p className="text-red-800 mb-4 leading-relaxed">
                  This prohibition includes real persons, AI-generated characters, fictional characters, or any persons whose age is ambiguous or who appear to be under 18. Any attempt to bypass these restrictions will result in immediate intervention.
                </p>
              </div>
            </section>

            <section id="violations" className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                4. Violations & Termination
              </h2>
              <p className="text-slate-600 mb-4 leading-relaxed">
                If a user is found creating or attempting to create prohibited adult content, their account will be permanently terminated without notice, and all associated content will be immediately deleted. We will fully cooperate with law enforcement regarding the attempted generation or distribution of illegal materials.
              </p>
            </section>

          </article>
        </div>
      </main>
    </div>
  );
}
