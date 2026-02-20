import { Sparkles, ArrowDown } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-[100svh] sm:min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />

        {/* Floating orbs — scaled down on mobile to prevent perf issues */}
        <div className="absolute top-1/4 left-1/4 w-48 h-48 sm:w-80 sm:h-80 lg:w-[500px] lg:h-[500px] bg-cyber-cyan/15 rounded-full blur-[80px] sm:blur-[100px] animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 sm:w-64 sm:h-64 lg:w-[400px] lg:h-[400px] bg-cyber-purple/15 rounded-full blur-[80px] sm:blur-[100px] animate-float" style={{ animationDelay: '-3s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 sm:w-[400px] sm:h-[400px] lg:w-[600px] lg:h-[600px] bg-cyber-pink/10 rounded-full blur-[80px] sm:blur-[120px] animate-float" style={{ animationDelay: '-1.5s' }} />

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
      <div className="relative z-10 w-full max-w-5xl mx-auto px-5 sm:px-6 lg:px-8 text-center pt-20 sm:pt-0">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8 sm:mb-10 animate-slide-up">
          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyber-cyan animate-pulse-glow flex-shrink-0" />
          <span className="text-xs sm:text-sm font-medium text-slate-200">Venture Catalyst AI Portfolio</span>
        </div>

        {/* Main heading with robot video */}
        <div className="relative inline-block">
          {/* Robot video behind heading */}
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 sm:translate-x-1/3 h-[280px] sm:h-[350px] md:h-[450px] lg:h-[550px] w-auto object-contain opacity-90 pointer-events-none z-0 mix-blend-screen"
          >
            <source src="/videos/robot-transparent.webm" type="video/webm" />
            <source src="/videos/robot-cropped.mp4" type="video/mp4" />
          </video>
          
          <h1
            className="relative z-10 text-[2.6rem] leading-[1.1] sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 sm:mb-8 animate-slide-up"
            style={{ animationDelay: '0.1s' }}
          >
            <span className="block text-white mb-1 sm:mb-2">Built with</span>
            <span className="text-gradient">Artificial Intelligence</span>
          </h1>
        </div>

        {/* Subtitle */}
        <p
          className="max-w-2xl mx-auto text-base sm:text-lg text-slate-400 leading-relaxed mb-10 sm:mb-12 animate-slide-up px-2 sm:px-0"
          style={{ animationDelay: '0.2s' }}
        >
          Explore our portfolio of AI-generated videos, custom websites,
          Next.js applications, and creative visuals.
        </p>

        {/* CTA */}
        <div
          className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 animate-slide-up px-2 sm:px-0"
          style={{ animationDelay: '0.3s' }}
        >
          <a href="#videos" className="btn-primary text-base sm:text-lg w-full sm:w-auto">
            View Portfolio
          </a>
          <a href="mailto:ron@vencat.com" className="btn-glass text-slate-200 hover:text-white w-full sm:w-auto">
            Get in Touch
          </a>
        </div>

        {/* Scroll indicator */}
        <div className="mt-16 sm:mt-0 sm:absolute sm:bottom-8 sm:left-1/2 sm:-translate-x-1/2 animate-bounce opacity-40">
          <ArrowDown className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400 mx-auto" />
        </div>
      </div>
    </section>
  );
}
