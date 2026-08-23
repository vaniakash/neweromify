const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix buttons with gradient or primary colors to have text-white
  content = content.replace(/bg-gradient-to-r([^>]+)text-slate-900/g, 'bg-gradient-to-r$1text-white');
  content = content.replace(/bg-violet-600([^>]+)text-slate-900/g, 'bg-violet-600$1text-white');
  
  // Fix black overlays to have text-white
  content = content.replace(/bg-black\/60([^>]+)text-slate-900/g, 'bg-black/60$1text-white');
  content = content.replace(/bg-black\/50([^>]+)text-slate-900/g, 'bg-black/50$1text-white');
  content = content.replace(/bg-black\/95([^>]+)text-slate-900/g, 'bg-black/95$1text-white');
  content = content.replace(/bg-black\/90([^>]+)text-slate-900/g, 'bg-black/90$1text-white');
  
  // Specific to galary lightbox
  content = content.replace(/bg-slate-900\/95 p-4 backdrop-blur-xl"([^>]+)onClick/g, 'bg-slate-900/95 p-4 backdrop-blur-xl text-white"$1onClick');
  
  // AvatarHubClient:
  content = content.replace(/bg-black\/50 backdrop-blur-md border border-slate-200 flex items-center justify-center text-slate-600/g, 'bg-black/50 backdrop-blur-md border border-slate-200 flex items-center justify-center text-white');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Fixed ${filePath}`);
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
  }
});
