"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Mail, Scale } from "lucide-react";

export default function GrievanceRedressalPage() {
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
    { id: "officer", label: "2. Grievance Officer" },
    { id: "process", label: "3. Redressal Process" },
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
              <span className="text-slate-900 font-medium">Grievance Redressal</span>
            </nav>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              Grievance Redressal Mechanism
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
                <Scale className="h-6 w-6 text-[#1736cf]" />
                1. Introduction
              </h2>
              <p className="text-slate-600 mb-4 leading-relaxed">
                In accordance with applicable laws, including Information Technology rules, Eromify provides a robust grievance redressal mechanism to ensure user complaints regarding safety, content violations, or other serious issues are addressed promptly and effectively.
              </p>
            </section>

            <section id="officer" className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                2. Grievance Officer Details
              </h2>
              <p className="text-slate-600 mb-4 leading-relaxed">
                If you have any grievance or complaint, you may contact our designated Grievance Officer:
              </p>
              <div className="mt-6 p-6 bg-slate-50 border border-slate-200 rounded-xl">
                <ul className="list-none space-y-4 text-slate-700">
                  <li><strong>Email:</strong> <a href="mailto:eromify.in@gmail.com" className="text-[#1736cf]">eromify.in@gmail.com</a> (Please include "Grievance" in the subject line)</li>
                </ul>
              </div>
            </section>

            <section id="process" className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                3. Redressal Process
              </h2>
              <p className="text-slate-600 mb-4 leading-relaxed">
                Upon receiving a grievance, our team will:
              </p>
              <ul className="list-decimal pl-5 mb-6 text-slate-600 space-y-2">
                <li>Acknowledge the grievance within 24 hours.</li>
                <li>Investigate the claims, especially those involving NCII, threats, or explicit policy violations.</li>
                <li>Take necessary action, which may include disabling access to content, terminating the offending user's account, and cooperating with law enforcement.</li>
                <li>Dispose of the grievance within 15 days of its receipt.</li>
              </ul>
            </section>

          </article>
        </div>
      </main>
    </div>
  );
}
