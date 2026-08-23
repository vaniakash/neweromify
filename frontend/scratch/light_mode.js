const fs = require('fs');
const path = require('path');

const replacements = {
  // Common Dark Backgrounds
  'bg-[#0a0a0f]': 'bg-slate-50',
  'bg-[#0d0d14]': 'bg-white',
  'bg-[#151520]': 'bg-slate-100',
  'bg-[#1e1e2e]': 'bg-slate-100',
  'bg-[#080810]': 'bg-slate-50',
  'bg-[#09090b]': 'bg-slate-50',
  'bg-[#0c0c0e]': 'bg-white',
  'bg-[#050505]': 'bg-slate-50',
  'bg-[#0a0a0c]': 'bg-white',
  'bg-[#18181b]': 'bg-white',
  'bg-[#202024]': 'bg-slate-50',
  'bg-[#0f0f13]': 'bg-white',
  
  // Text Colors
  'text-white': 'text-slate-900',
  'text-slate-400': 'text-slate-500',
  'text-slate-300': 'text-slate-600',
  'text-slate-200': 'text-slate-800',
  
  // Borders
  'border-white/5': 'border-slate-200',
  'border-white/10': 'border-slate-200',
  'border-white/[0.08]': 'border-slate-200',
  'border-white/[0.04]': 'border-slate-200',
  'border-white/[0.05]': 'border-slate-200',
  'border-white/[0.1]': 'border-slate-200',
  
  // Hover & BG states
  'bg-white/5': 'bg-white',
  'hover:bg-white/10': 'hover:bg-slate-50',
  'hover:bg-white/5': 'hover:bg-slate-50',
  'bg-white/[0.03]': 'bg-white',
  'bg-white/[0.05]': 'bg-white',
  'bg-white/[0.02]': 'bg-white',
  'bg-black/50': 'bg-white/80',
  
  // Specific Gradient fixes
  'from-[#0d0d14]': 'from-black/60',
  'from-[#050505]': 'from-black/60',
  'via-[#0d0d14]/20': 'via-black/30',
  'via-[#050505]/40': 'via-black/40',
};

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  for (const [dark, light] of Object.entries(replacements)) {
    // Escape brackets for regex
    const escapedDark = dark.replace(/[\[\]\/\.]/g, '\\$&');
    const regex = new RegExp(escapedDark, 'g');
    content = content.replace(regex, light);
  }
  
  // Manual fix for gallery page inline styles
  if (filePath.includes('galary/page.tsx')) {
    content = content.replace(/background: #080810;/g, 'background: #f8fafc;');
    content = content.replace(/bg-\[\#080810\]\/80/g, 'bg-slate-50/80');
    content = content.replace(/bg-white\/3/g, 'bg-white');
    content = content.replace(/border-white\/8/g, 'border-slate-200');
    content = content.replace(/text-white\/80/g, 'text-slate-900/80');
    content = content.replace(/text-white\/90/g, 'text-slate-900/90');
    content = content.replace(/bg-black\/95/g, 'bg-slate-900/95'); // Lightbox bg should stay dark
  }

  // Text-to-image fixes
  if (filePath.includes('TextToImageClient.tsx')) {
    content = content.replace(/text-white hover:scale-\[1.02\]/g, 'text-slate-900 hover:scale-[1.02]');
    content = content.replace(/bg-white text-black/g, 'bg-slate-900 text-white'); // main button
  }
  
  // Video generation fixes
  if (filePath.includes('video-generation/page.tsx')) {
    content = content.replace(/bg-\[\#000000\]/g, 'bg-slate-100');
    content = content.replace(/bg-black\/20/g, 'bg-slate-50');
    content = content.replace(/bg-black\/40/g, 'bg-slate-100');
    content = content.replace(/text-white hover:text-slate-300/g, 'text-slate-900 hover:text-slate-700');
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${filePath}`);
}

const files = [
  'src/components/avatar/AvatarHubClient.tsx',
  'src/components/avatar/TemplateGalleryClient.tsx',
  'src/app/galary/page.tsx',
  'src/components/tools/TextToImageClient.tsx',
  'src/app/video-generation/page.tsx'
];

files.forEach(f => {
  const fullPath = path.join('/Users/akashrana/Desktop/bca6thsem/ero/frontend', f);
  if (fs.existsSync(fullPath)) {
    processFile(fullPath);
  } else {
    console.log(`File not found: ${fullPath}`);
  }
});
