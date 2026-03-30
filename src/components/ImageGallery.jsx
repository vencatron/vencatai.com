import { useState } from 'react';
import { Image, Sparkles, X, ChevronLeft, ChevronRight } from 'lucide-react';

const images = [
  { file: '01-bioluminescent-ocean.png', title: 'Bioluminescent Ocean', desc: 'Deep sea jellyfish, glowing blue and violet' },
  { file: '02-cyberpunk-city.png', title: 'Cyberpunk Cityscape', desc: 'Neon-lit streets, flying cars, Blade Runner vibes' },
  { file: '03-dewdrop-macro.png', title: 'Dewdrop Macro', desc: 'Landscape reflected inside a single droplet' },
  { file: '04-jungle-temple.png', title: 'Jungle Temple', desc: 'Ancient ruins swallowed by rainforest' },
  { file: '05-mars-astronaut.png', title: 'Mars at Dusk', desc: 'Lone astronaut facing a Martian dust storm' },
  { file: '06-portrait-elder.png', title: 'Portrait Study', desc: 'Candlelit hyperrealistic portrait' },
  { file: '07-supercell-storm.png', title: 'Supercell Storm', desc: 'Lightning and drama over the Great Plains' },
  { file: '08-butterfly-micro.png', title: 'Butterfly Microscopy', desc: 'Wing nanostructures up close' },
  { file: '09-baroque-library.png', title: 'Baroque Library', desc: 'Floor-to-ceiling books in golden light' },
  { file: '10-wolf-pack-snow.png', title: 'Wolf Pack', desc: 'Running through snow at blue hour' },
];

export default function ImageGallery() {
  const [lightbox, setLightbox] = useState(null); // index

  const prev = () => setLightbox(i => (i - 1 + images.length) % images.length);
  const next = () => setLightbox(i => (i + 1) % images.length);

  return (
    <section id="images" className="py-12 sm:py-20 lg:py-28 relative scroll-mt-36 sm:scroll-mt-40">
      {/* Background accent */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 right-0 w-[600px] h-[600px] bg-cyber-cyan/8 rounded-full blur-[150px] translate-x-1/2" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-6 mb-8 sm:mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyber-cyan to-cyber-purple">
                <Image className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-semibold text-cyber-cyan uppercase tracking-wider">
                Image Generation
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-3">
              AI Images
            </h2>
            <p className="text-slate-400 text-sm sm:text-lg max-w-xl">
              10 original 4K images generated entirely by Gemini 3 Pro — zero photography, zero editing.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Sparkles className="w-4 h-4 text-cyber-cyan" />
            <span>{images.length} images · Gemini 3 Pro</span>
          </div>
        </div>

        {/* Masonry-style grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {images.map((img, i) => (
            <div
              key={img.file}
              className="break-inside-avoid glass-card rounded-2xl overflow-hidden cursor-pointer group glass-hover"
              onClick={() => setLightbox(i)}
            >
              <div className="relative overflow-hidden">
                <img
                  src={`/images/ai-gallery/${img.file}`}
                  alt={img.title}
                  className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                  <p className="text-white font-semibold text-sm">{img.title}</p>
                  <p className="text-slate-300 text-xs mt-0.5">{img.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setLightbox(null)}
        >
          {/* Close */}
          <button
            className="absolute top-4 right-4 p-2 rounded-full glass text-white hover:bg-white/10 transition-colors"
            onClick={() => setLightbox(null)}
          >
            <X className="w-6 h-6" />
          </button>

          {/* Prev */}
          <button
            className="absolute left-4 p-2 rounded-full glass text-white hover:bg-white/10 transition-colors"
            onClick={e => { e.stopPropagation(); prev(); }}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Image */}
          <div
            className="max-w-5xl max-h-[90vh] mx-12 flex flex-col items-center gap-4"
            onClick={e => e.stopPropagation()}
          >
            <img
              src={`/images/ai-gallery/${images[lightbox].file}`}
              alt={images[lightbox].title}
              className="max-h-[80vh] max-w-full object-contain rounded-xl shadow-2xl"
            />
            <div className="text-center">
              <p className="text-white font-semibold">{images[lightbox].title}</p>
              <p className="text-slate-400 text-sm">{images[lightbox].desc}</p>
            </div>
          </div>

          {/* Next */}
          <button
            className="absolute right-4 p-2 rounded-full glass text-white hover:bg-white/10 transition-colors"
            onClick={e => { e.stopPropagation(); next(); }}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}
    </section>
  );
}
