import { Video, Globe, Code2, Image } from 'lucide-react';

const sections = [
  { id: 'videos', label: 'AI Videos', icon: Video, color: 'from-cyber-pink to-red-500' },
  { id: 'websites', label: 'Websites', icon: Globe, color: 'from-cyber-cyan to-blue-500' },
  { id: 'apps', label: 'Next.js Apps', icon: Code2, color: 'from-cyber-purple to-violet-500' },
  { id: 'images', label: 'Images', icon: Image, color: 'from-emerald-400 to-cyan-500' },
];

export default function SectionNav() {
  return (
    /* nav-sticky-top is defined in index.css — keeps this just below the fixed header
       and correctly accounts for safe-area-inset-top on iPhone notch devices */
    <section className="py-3 sm:py-4 sticky nav-sticky-top z-40 bg-slate-950/90 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto scrollbar-hide">
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="group flex items-center gap-2 px-3.5 py-2.5 sm:px-5 sm:py-3 rounded-xl glass glass-hover whitespace-nowrap flex-shrink-0"
            >
              <div className={`p-1 sm:p-1.5 rounded-lg bg-gradient-to-br ${section.color}`}>
                <section.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
                {section.label}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
