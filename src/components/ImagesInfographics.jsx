import { Image, Sparkles } from 'lucide-react';
import { ImageTile } from './Tile';
import img3dLogo from '../assets/3d-logo.png';
import imgDiagram from '../assets/diagram.png';
import imgPartnerJourney from '../assets/partner-journey-new.jpeg';
import imgOrig from '../assets/orig.png';
import imgStock from '../assets/2109.w026.n002.828B.p1.828.jpg';
import imgDownload from '../assets/download.svg';
import imgGlassDashboard from '../assets/glassmorphic-app-dashboard.png';
import imgGlassIphone from '../assets/glassmorphic-iphone-floating.png';

const capabilities = [
  'High-Res 3D Logo Generation',
  'Retro Pixel Art',
  'Parallax Art Layers',
  'Story-Driven Infographics',
  'Data Visualizations',
  'Glassmorphic 3D',
];

const images = [
  {
    title: 'High-Res 3D Logo',
    image: img3dLogo,
    url: null,
    category: '3D Design',
  },
  {
    title: 'Intricate Labeled Artifact Diagrams',
    image: imgDiagram,
    url: null,
    category: 'Data Viz',
  },
  {
    title: 'Partner Journey Infographic',
    image: imgPartnerJourney,
    url: null,
    category: 'Story Infographic',
  },
  {
    title: 'Pixelated Retro Artifacts',
    image: imgOrig,
    url: null,
    category: 'Art',
  },
  {
    title: 'Parallax Layered Scroll Artifacts',
    image: imgStock,
    url: null,
    category: 'Branding',
  },
  {
    title: 'Network Topography Diagrams',
    image: imgDownload,
    url: null,
    category: 'Design',
  },
  {
    title: 'Glassmorphic App Interface',
    image: imgGlassDashboard,
    url: null,
    category: 'Glassmorphic 3D',
  },
  {
    title: 'Floating iPhone Concept',
    image: imgGlassIphone,
    url: null,
    category: 'Glassmorphic 3D',
  },
];

export default function ImagesInfographics() {
  return (
    <section id="images" className="py-12 sm:py-20 lg:py-28 relative bg-slate-900/30 scroll-mt-36 sm:scroll-mt-40">
      {/* Background accent */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[150px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-6 mb-8 sm:mb-12">
          <div>
            <div className="flex items-center gap-3 mb-3 sm:mb-4">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500">
                <Image className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">
                Visual Content
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-3">
              Images & Infographics
            </h2>
            <p className="text-slate-400 text-sm sm:text-lg max-w-xl mb-3 sm:mb-4">
              From photorealistic renders to narrative data — AI makes it possible.
            </p>
            <div className="flex flex-wrap gap-2">
              {capabilities.map((cap) => (
                <span
                  key={cap}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                >
                  {cap}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>{images.length} images</span>
          </div>
        </div>

        {/* Image grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {images.map((img) => (
            <ImageTile key={img.title} {...img} />
          ))}
        </div>
      </div>
    </section>
  );
}
