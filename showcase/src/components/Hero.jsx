import { Sparkles, ArrowDown } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        
        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyber-cyan/15 rounded-full blur-[100px] animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyber-purple/15 rounded-full blur-[100px] animate-float" style={{ animationDelay: '-3s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyber-pink/10 rounded-full blur-[120px] animate-float" style={{ animationDelay: '-1.5s' }} />
        
        {/* Grid overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-card mb-10 animate-slide-up">
          <Sparkles className="w-4 h-4 text-cyber-cyan animate-pulse-glow" />
          <span className="text-sm font-medium text-slate-200">Venture Catalyst AI Portfolio</span>
        </div>

        {/* Main heading */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <span className="block text-white mb-2">Built with</span>
          <span className="text-gradient">Artificial Intelligence</span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-400 leading-relaxed mb-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          Explore our portfolio of AI-generated videos, custom websites, 
          Next.js applications, and creative visuals.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <a href="#videos" className="btn-primary text-lg">
            View Portfolio
          </a>
          <a href="mailto:ron@vencat.com" className="btn-glass text-slate-200 hover:text-white">
            Get in Touch
          </a>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
          <ArrowDown className="w-6 h-6 text-slate-400" />
        </div>
      </div>
    </section>
  );
}
