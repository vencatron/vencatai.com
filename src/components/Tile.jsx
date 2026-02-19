import { ExternalLink, Play } from 'lucide-react';

export function VideoTile({ title, description, thumbnail, url, duration }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-2xl glass-card glass-hover overflow-hidden"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-cyber-pink/30 to-cyber-purple/30 flex items-center justify-center">
            <Play className="w-16 h-16 text-white/30" />
          </div>
        )}
        
        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center transform group-hover:scale-110 transition-transform">
            <Play className="w-7 h-7 text-white fill-white ml-1" />
          </div>
        </div>
        
        {/* Duration badge */}
        {duration && (
          <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur text-xs font-medium text-white">
            {duration}
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-semibold text-white group-hover:text-cyber-cyan transition-colors line-clamp-2 mb-2">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-slate-400 line-clamp-2">{description}</p>
        )}
      </div>
    </a>
  );
}

export function WebsiteTile({ title, description, thumbnail, url, domain, tags }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-2xl glass-card glass-hover overflow-hidden"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-cyber-cyan/20 to-cyber-purple/20" />
        )}
        
        {/* Live indicator */}
        <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs font-medium text-white">{domain}</span>
        </div>
        
        {/* External link */}
        <div className="absolute top-3 right-3 p-2 rounded-lg bg-black/60 backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity">
          <ExternalLink className="w-4 h-4 text-white" />
        </div>
      </div>
      
      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-semibold text-white group-hover:text-cyber-cyan transition-colors mb-2">
          {title}
        </h3>
        <p className="text-sm text-slate-400 line-clamp-2 mb-4">{description}</p>
        
        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/5 text-slate-300 border border-white/10"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </a>
  );
}

export function ImageTile({ title, image, url, category }) {
  return (
    <a
      href={url || image}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-2xl glass-card glass-hover overflow-hidden"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20" />
        )}
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute bottom-4 left-4 right-4">
            <p className="text-white font-medium line-clamp-2">{title}</p>
            {category && (
              <span className="text-xs text-slate-300">{category}</span>
            )}
          </div>
        </div>
      </div>
    </a>
  );
}
