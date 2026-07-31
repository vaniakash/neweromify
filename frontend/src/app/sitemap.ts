import { MetadataRoute } from "next";

const BASE = "https://www.eromify.in";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // ── Core pages ────────────────────────────────────────────────────────────
  const core: MetadataRoute.Sitemap = [
    { url: `${BASE}/`,        lastModified: now, changeFrequency: "daily",   priority: 1.0 },
    { url: `${BASE}/pricing`, lastModified: now, changeFrequency: "weekly",  priority: 0.9 },
    { url: `${BASE}/explore`, lastModified: now, changeFrequency: "daily",   priority: 0.8 },
    { url: `${BASE}/about`,   lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/help`,    lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/blog`,    lastModified: now, changeFrequency: "weekly",  priority: 0.8 },
  ];

  // ── AI Tools / Creator Studio ─────────────────────────────────────────────
  const tools: MetadataRoute.Sitemap = [
    { url: `${BASE}/tools/creator`,                    lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/tools/creator/ai-influencer`,      lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/tools/creator/image-generator`,    lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/tools/creator/text-to-image`,      lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/tools/creator/gpt-image`,          lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/tools/creator/image-editor`,       lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/tools/creator/asciikit`,           lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/tools/creator/instagram-autodm`,   lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/tools/image-gen`,                  lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/video-generation`,                 lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/ai-influencer-studio`,             lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/avatar`,                           lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/avatar/templates`,                 lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/galary`,                           lastModified: now, changeFrequency: "daily",  priority: 0.7 },
    { url: `${BASE}/mcp`,                              lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];

  // ── SEO landing pages (AI influencer generator variants) ─────────────────
  const landingPages: MetadataRoute.Sitemap = [
    { url: `${BASE}/ai-influencer-generator`,          lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/ai-influencer-maker`,              lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/free-ai-influencer-generator`,     lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/virtual-influencer-creator`,       lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/realistic-ai-influencer-generator`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/ai-fashion-influencer-generator`,  lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/ai-female-influencer-generator`,   lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/ai-male-influencer-generator`,     lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/ai-fitness-influencer-generator`,  lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/ai-instagram-influencer-generator`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
  ];

  // ── Blog posts ────────────────────────────────────────────────────────────
  const blogPosts: MetadataRoute.Sitemap = [
    { url: `${BASE}/blog/eromify-alternative`,                                    lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/blog/future-of-ai-software-development`,                      lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/blog/generative-ai-development-guide`,                        lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/blog/top-10-ai-influencer-blog-post-ideas-2026`,              lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/blog/what-is-eromify-future-ai-influencer-ugc-creation`,      lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];

  // ── Legal / policy pages ──────────────────────────────────────────────────
  const legal: MetadataRoute.Sitemap = [
    { url: `${BASE}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${BASE}/terms`,   lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${BASE}/cookie`,  lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  return [...core, ...tools, ...landingPages, ...blogPosts, ...legal];
}
