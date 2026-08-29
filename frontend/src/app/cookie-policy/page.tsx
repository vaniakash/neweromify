"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";

export default function CookiePolicyPage() {
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
    { id: "what-are-cookies", label: "1. What are Cookies?" },
    { id: "how-we-use", label: "2. How We Use Cookies" },
    { id: "third-party", label: "3. Third-Party Cookies" },
    { id: "your-choices", label: "4. Your Choices" },
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
              <span className="text-slate-900 font-medium">Cookie Policy</span>
            </nav>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              Cookie Policy
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
            
            <section id="what-are-cookies" className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                <Cookie className="h-6 w-6 text-[#1736cf]" />
                1. What are Cookies?
              </h2>
              <p className="text-slate-600 mb-4 leading-relaxed">
                Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently, as well as to provide information to the owners of the site.
              </p>
            </section>

            <section id="how-we-use" className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                2. How We Use Cookies
              </h2>
              <p className="text-slate-600 mb-4 leading-relaxed">
                We use cookies for several reasons, including:
              </p>
              <ul className="list-disc pl-5 mb-6 text-slate-600 space-y-2">
                <li><strong>Essential Cookies:</strong> Required for the operation of our platform, such as enabling you to log into secure areas.</li>
                <li><strong>Performance Cookies:</strong> Allow us to recognize and count the number of visitors and see how visitors move around our website.</li>
                <li><strong>Functionality Cookies:</strong> Used to recognize you when you return to our website, enabling us to personalize content for you.</li>
              </ul>
            </section>

            <section id="third-party" className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                3. Third-Party Cookies
              </h2>
              <p className="text-slate-600 mb-4 leading-relaxed">
                In some special cases, we also use cookies provided by trusted third parties, such as Google Analytics, to help us understand how you use the site and ways that we can improve your experience. These cookies may track things such as how long you spend on the site and the pages that you visit.
              </p>
            </section>

            <section id="your-choices" className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                4. Your Choices Regarding Cookies
              </h2>
              <p className="text-slate-600 mb-4 leading-relaxed">
                If you prefer to avoid the use of cookies on the Website, first you must disable the use of Cookies in your browser and then delete the Cookies saved in your browser associated with this website. You may use this option for preventing the use of Cookies at any time.
              </p>
            </section>

          </article>
        </div>
      </main>
    </div>
  );
}
