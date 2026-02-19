import { Video, Globe, Code2, Image } from 'lucide-react';

const sections = [
  { id: 'videos', label: 'AI Videos', icon: Video, color: 'from-cyber-pink to-red-500' },
  { id: 'websites', label: 'Custom Websites', icon: Globe, color: 'from-cyber-cyan to-blue-500' },
  { id: 'apps', label: 'Next.js Apps', icon: Code2, color: 'from-cyber-purple to-violet-500' },
  { id: 'images', label: 'Images', icon: Image, color: 'from-emerald-400 to-cyan-500' },
];

export default function SectionNav() {
  return (
    <section className="py-8 sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-2 sm:gap-4 overflow-x-auto pb-2 -mb-2 scrollbar-hide">
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="group flex items-center gap-2 px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl glass glass-hover whitespace-nowrap"
            >
              <div className={`p-1.5 rounded-lg bg-gradient-to-br ${section.color} bg-opacity-20`}>
                <section.icon className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm sm:text-base font-medium text-slate-300 group-hover:text-white transition-colors">
                {section.label}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
