import { Globe, Sparkles } from 'lucide-react';
import { WebsiteTile } from './Tile';

const websites = [
  {
    title: 'Generation Catalyst',
    description: 'AI-powered estate planning platform that simplifies trust creation and management.',
    thumbnail: '/screenshots/iamatrust.png',
    url: 'https://iamatrust.com',
    domain: 'iamatrust.com',
    tags: ['AI', 'Legal Tech', 'Estate Planning'],
  },
  {
    title: 'Vencat Consulting',
    description: 'Strategic consulting services leveraging AI to help businesses scale.',
    thumbnail: '/screenshots/vencat.png',
    url: 'https://vencat.com',
    domain: 'vencat.com',
    tags: ['Consulting', 'Business'],
  },
  {
    title: 'Air Chuck Parts',
    description: 'E-commerce platform for industrial parts with smart inventory and search.',
    thumbnail: '/screenshots/airchuckparts.png',
    url: 'https://airchuckparts.com',
    domain: 'airchuckparts.com',
    tags: ['E-commerce', 'Industrial'],
  },
  {
    title: 'VencatAI',
    description: 'Free AI-powered web scraping tool for automated data extraction.',
    thumbnail: '/screenshots/vencatai.png',
    url: 'https://vencatai.com',
    domain: 'vencatai.com',
    tags: ['AI Tool', 'Web Scraping'],
  },
];

export default function CustomWebsites() {
  return (
    <section id="websites" className="py-20 sm:py-28 relative bg-slate-900/30">
      {/* Background accent */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 right-0 w-[600px] h-[600px] bg-cyber-cyan/10 rounded-full blur-[150px] translate-x-1/2" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyber-cyan to-blue-500">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-semibold text-cyber-cyan uppercase tracking-wider">
                Web Design
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3">
              Custom Websites
            </h2>
            <p className="text-slate-400 text-lg max-w-xl">
              Fully customized websites built with modern technologies and AI-assisted design.
            </p>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Sparkles className="w-4 h-4 text-cyber-cyan" />
            <span>{websites.length} sites</span>
          </div>
        </div>

        {/* Website grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {websites.map((site, index) => (
            <WebsiteTile key={index} {...site} />
          ))}
        </div>
      </div>
    </section>
  );
}
