"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Mail, FileWarning } from "lucide-react";

export default function CopyrightPolicyPage() {
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
    { id: "dmca-notice", label: "2. Filing a DMCA Notice" },
    { id: "counter-notice", label: "3. Counter-Notice" },
    { id: "repeat-infringers", label: "4. Repeat Infringers" },
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
              <span className="text-slate-900 font-medium">Copyright Policy</span>
            </nav>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              Copyright Policy
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
                <FileWarning className="h-6 w-6 text-[#1736cf]" />
                1. Introduction
              </h2>
              <p className="text-slate-600 mb-4 leading-relaxed">
                Eromify respects the intellectual property rights of others and expects its users to do the same. It is our policy, in appropriate circumstances and at our discretion, to disable and/or terminate the accounts of users who repeatedly infringe or are repeatedly charged with infringing the copyrights or other intellectual property rights of others.
              </p>
            </section>

            <section id="dmca-notice" className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                2. Filing a DMCA Notice
              </h2>
              <p className="text-slate-600 mb-4 leading-relaxed">
                If you are a copyright owner, or are authorized to act on behalf of one, and you believe that any material on our platform infringes upon your copyrights, you may submit a notification pursuant to the Digital Millennium Copyright Act (DMCA) by providing our Copyright Agent with the following information in writing:
              </p>
              <ul className="list-disc pl-5 mb-6 text-slate-600 space-y-2">
                <li>An electronic or physical signature of the person authorized to act on behalf of the owner of the copyright's interest.</li>
                <li>A description of the copyrighted work that you claim has been infringed.</li>
                <li>A description of where the material that you claim is infringing is located on the platform (e.g., URL or specific user identifier).</li>
                <li>Your address, telephone number, and email address.</li>
                <li>A statement by you that you have a good faith belief that the disputed use is not authorized by the copyright owner, its agent, or the law.</li>
                <li>A statement by you, made under penalty of perjury, that the above information in your notice is accurate and that you are the copyright owner or authorized to act on the copyright owner's behalf.</li>
              </ul>
              <p className="text-slate-600 mb-4 leading-relaxed font-semibold">
                Submit claims to: <a href="mailto:eromify.in@gmail.com" className="text-[#1736cf]">eromify.in@gmail.com</a>
              </p>
            </section>

            <section id="counter-notice" className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                3. Counter-Notice
              </h2>
              <p className="text-slate-600 mb-4 leading-relaxed">
                If you believe that your content that was removed (or to which access was disabled) is not infringing, or that you have the authorization from the copyright owner, the copyright owner's agent, or pursuant to the law, to post and use the material in your content, you may send a counter-notice containing the relevant information to our Copyright Agent.
              </p>
            </section>

            <section id="repeat-infringers" className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                4. Repeat Infringers
              </h2>
              <p className="text-slate-600 mb-4 leading-relaxed">
                In accordance with the DMCA and other applicable law, Eromify has adopted a policy of terminating, in appropriate circumstances and at Eromify's sole discretion, users who are deemed to be repeat infringers. Eromify may also at its sole discretion limit access to the platform and/or terminate the memberships of any users who infringe any intellectual property rights of others, whether or not there is any repeat infringement.
              </p>
            </section>

          </article>
        </div>
      </main>
    </div>
  );
}
