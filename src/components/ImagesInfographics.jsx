import { Image, Sparkles } from 'lucide-react';
import { ImageTile } from './Tile';

// TODO: Replace with actual image data
const images = [
  {
    title: 'AI Brand Identity Concept',
    image: null, // Add image URL
    url: null,
    category: 'Branding',
  },
  {
    title: 'Data Visualization Infographic',
    image: null,
    url: null,
    category: 'Infographic',
  },
  {
    title: 'Product Launch Graphics',
    image: null,
    url: null,
    category: 'Marketing',
  },
  {
    title: 'Social Media Campaign',
    image: null,
    url: null,
    category: 'Social',
  },
  {
    title: 'Technical Architecture Diagram',
    image: null,
    url: null,
    category: 'Technical',
  },
  {
    title: 'AI-Generated Artwork',
    image: null,
    url: null,
    category: 'Art',
  },
];

export default function ImagesInfographics() {
  return (
    <section id="images" className="py-20 sm:py-28 relative bg-slate-900/30">
      {/* Background accent */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[150px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500">
                <Image className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">
                Visual Content
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3">
              Images & Infographics
            </h2>
            <p className="text-slate-400 text-lg max-w-xl">
              AI-generated visuals, infographics, and creative graphics for brands.
            </p>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>{images.length} images</span>
          </div>
        </div>

        {/* Image grid - masonry-like with varied sizes */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {images.map((img, index) => (
            <ImageTile key={index} {...img} />
          ))}
        </div>
      </div>
    </section>
  );
}
