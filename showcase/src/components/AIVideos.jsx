import { Video, Sparkles } from 'lucide-react';
import { VideoTile } from './Tile';

// TODO: Replace with actual video data
const videos = [
  {
    title: 'AI-Generated Product Demo',
    description: 'Fully automated product showcase created with generative AI.',
    thumbnail: null, // Add thumbnail URL
    url: '#', // Add video URL (YouTube, Vimeo, etc.)
    duration: '2:34',
  },
  {
    title: 'Brand Story Animation',
    description: 'AI-powered storytelling for modern brand narratives.',
    thumbnail: null,
    url: '#',
    duration: '3:15',
  },
  {
    title: 'AI Commercial Spot',
    description: 'Full commercial created entirely with AI tools.',
    thumbnail: null,
    url: '#',
    duration: '0:45',
  },
  {
    title: 'Explainer Video',
    description: 'Complex concepts simplified through AI-generated visuals.',
    thumbnail: null,
    url: '#',
    duration: '4:20',
  },
];

export default function AIVideos() {
  return (
    <section id="videos" className="py-20 sm:py-28 relative">
      {/* Background accent */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-0 w-[600px] h-[600px] bg-cyber-pink/10 rounded-full blur-[150px] -translate-x-1/2" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyber-pink to-red-500">
                <Video className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-semibold text-cyber-pink uppercase tracking-wider">
                Video Content
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3">
              AI Videos
            </h2>
            <p className="text-slate-400 text-lg max-w-xl">
              Explore our collection of AI-generated video content, from commercials to explainers.
            </p>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Sparkles className="w-4 h-4 text-cyber-pink" />
            <span>{videos.length} videos</span>
          </div>
        </div>

        {/* Video grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {videos.map((video, index) => (
            <VideoTile key={index} {...video} />
          ))}
        </div>
      </div>
    </section>
  );
}
