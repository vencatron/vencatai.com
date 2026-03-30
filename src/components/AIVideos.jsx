import { Video, Sparkles } from 'lucide-react';
import { VideoTile } from './Tile';
import auraThumbnail from '../assets/aura-pro-thumbnail.jpg';
import bonusThumbnail from '../assets/bonus-depreciation-thumbnail.jpg';
import uncutThumbnail from '../assets/uncut-commercial-thumbnail.jpg';
import showcaseThumbnail from '../assets/ai-showcase-thumbnail.jpg';
import geometryThumbnail from '../assets/geometry-boss-thumbnail.jpg';

const videos = [
  {
    title: 'AI Capabilities Showcase',
    description: 'See what\'s possible — cinematic visuals generated entirely by AI.',
    thumbnail: showcaseThumbnail,
    url: '/videos/ai-showcase-narrated.mp4',
    duration: '0:41',
  },
  {
    title: 'AI-Generated Product Demo',
    description: 'Fully automated product showcase created with generative AI.',
    thumbnail: auraThumbnail,
    url: '/videos/aura-pro-with-narration.mp4',
    duration: '1:04',
  },
  {
    title: 'AI Commercial Spot',
    description: 'Full commercial created entirely with AI tools.',
    thumbnail: uncutThumbnail,
    url: '/videos/uncut-packaging-v7.mp4',
    duration: '0:45',
  },
  {
    title: 'Explainer Video',
    description: 'Complex concepts simplified through AI-generated visuals.',
    thumbnail: bonusThumbnail,
    url: '/videos/The_Power_of_Bonus_Depreciation.mp4',
    duration: '1:07',
  },
  {
    title: 'AI Boss Fight',
    description: 'AI-generated math explainer — visualizing geometric concepts in motion.',
    thumbnail: geometryThumbnail,
    url: '/videos/The_Geometry_Boss_Fight.mp4',
    duration: '2:59',
  },
];

export default function AIVideos() {
  return (
    <section id="videos" className="py-12 sm:py-20 lg:py-28 relative scroll-mt-36 sm:scroll-mt-40">
      {/* Background accent */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-0 w-[600px] h-[600px] bg-cyber-pink/10 rounded-full blur-[150px] -translate-x-1/2" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-6 mb-8 sm:mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyber-pink to-red-500">
                <Video className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-semibold text-cyber-pink uppercase tracking-wider">
                Video Content
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-3">
              AI Videos
            </h2>
            <p className="text-slate-400 text-sm sm:text-lg max-w-xl">
              Explore our collection of AI-generated video content, from commercials to explainers.
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Sparkles className="w-4 h-4 text-cyber-pink" />
            <span>{videos.length} videos</span>

          </div>
        </div>

        {/* Video grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <VideoTile key={video.url} {...video} />
          ))}
        </div>
      </div>
    </section>
  );
}
