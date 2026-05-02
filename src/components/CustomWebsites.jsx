import { Globe, Sparkles } from 'lucide-react';
import { WebsiteTile } from './Tile';
import iamatrustImg from '../assets/iamatrust.png';
import vencatImg from '../assets/vencat.png';
import airchuckImg from '../assets/airchuckparts.png';
import claremontImg from '../assets/claremont.png';

const websites = [
  {
    title: 'Generation Catalyst',
    description: 'AI-powered estate planning platform that simplifies trust creation and management.',
    thumbnail: iamatrustImg,
    url: 'https://iamatrust.com',
    domain: 'iamatrust.com',
    tags: ['AI', 'Legal Tech', 'Estate Planning'],
  },
  {
    title: 'Vencat Consulting',
    description: 'Strategic consulting services leveraging AI to help businesses scale.',
    thumbnail: vencatImg,
    url: 'https://vencat.com',
    domain: 'vencat.com',
    tags: ['Consulting', 'Business'],
  },
  {
    title: 'Air Chuck Parts',
    description: 'E-commerce platform for industrial parts with smart inventory and search.',
    thumbnail: airchuckImg,
    url: 'https://airchuckparts.com',
    domain: 'airchuckparts.com',
    tags: ['E-commerce', 'Industrial'],
  },
  {
    title: 'Claremont Life',
    description: 'The definitive living guide for students at the 7 Claremont Colleges.',
    thumbnail: claremontImg,
    url: 'https://claremont.life',
    domain: 'claremont.life',
    tags: ['Next.js', 'College Guide'],
  },
];

export default function CustomWebsites() {
  return (
    <section id="websites" className="py-12 sm:py-20 lg:py-28 relative bg-slate-900/30 scroll-mt-36 sm:scroll-mt-40">
      {/* Background accent */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 right-0 w-[600px] h-[600px] bg-cyber-cyan/10 rounded-full blur-[150px] translate-x-1/2" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-6 mb-8 sm:mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyber-cyan to-blue-500">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-semibold text-cyber-cyan uppercase tracking-wider">
                Web Design
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-3">
              Custom Websites
            </h2>
            <p className="text-slate-400 text-sm sm:text-lg max-w-xl">
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
          {websites.map((site) => (
            <WebsiteTile key={site.url} {...site} />
          ))}
        </div>
      </div>
    </section>
  );
}
