import { Code2, Sparkles } from 'lucide-react';
import { WebsiteTile } from './Tile';
import uncutImg from '../assets/uncut.png';
import webFlayerImg from '../assets/web-flayer.png';

const apps = [
  {
    title: 'Uncut Packaging',
    description: 'Full-featured e-commerce platform built with Next.js 15 and AI product recommendations.',
    thumbnail: uncutImg,
    url: 'https://uncut-tau.vercel.app',
    domain: 'uncut-tau.vercel.app',
    tags: ['Next.js 15', 'E-commerce', 'AI'],
  },
  {
    title: 'Web Flayer',
    description: 'Real-time web scraping dashboard with visual workflow builder.',
    thumbnail: webFlayerImg,
    url: 'https://web-flayer.vercel.app/',
    domain: 'web-flayer.vercel.app',
    tags: ['Next.js', 'Dashboard', 'Real-time'],
  },
];

export default function NextJsApps() {
  return (
    <section id="apps" className="py-12 sm:py-20 lg:py-28 relative scroll-mt-36 sm:scroll-mt-40">
      {/* Background accent */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyber-purple/10 rounded-full blur-[150px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-6 mb-8 sm:mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyber-purple to-violet-500">
                <Code2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-semibold text-cyber-purple uppercase tracking-wider">
                Web Applications
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-3">
              Next.js Apps
            </h2>
            <p className="text-slate-400 text-sm sm:text-lg max-w-xl">
              Production-ready web applications built with Next.js, React, and modern frameworks.
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Sparkles className="w-4 h-4 text-cyber-purple" />
            <span>{apps.length} apps</span>
          </div>
        </div>

        {/* Apps grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {apps.map((app, index) => (
            <WebsiteTile key={index} {...app} />
          ))}
        </div>
      </div>
    </section>
  );
}
