import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyber-cyan via-cyber-purple to-cyber-pink flex items-center justify-center">
              <span className="text-white font-bold text-lg">V</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-white font-bold text-xl">VencatAI</span>
              <span className="text-slate-500 text-sm ml-2">Portfolio</span>
            </div>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#videos" className="text-slate-300 hover:text-white transition-colors font-medium">
              Videos
            </a>
            <a href="#websites" className="text-slate-300 hover:text-white transition-colors font-medium">
              Websites
            </a>
            <a href="#apps" className="text-slate-300 hover:text-white transition-colors font-medium">
              Apps
            </a>
            <a href="#images" className="text-slate-300 hover:text-white transition-colors font-medium">
              Images
            </a>
          </nav>

          {/* CTA + Mobile toggle */}
          <div className="flex items-center gap-4">
            <a
              href="mailto:ron@vencat.com"
              className="hidden sm:block btn-glass text-sm"
            >
              Contact
            </a>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg glass"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <nav className="md:hidden py-4 border-t border-white/5">
            <div className="flex flex-col gap-4">
              <a href="#videos" className="text-slate-300 hover:text-white transition-colors font-medium py-2">
                Videos
              </a>
              <a href="#websites" className="text-slate-300 hover:text-white transition-colors font-medium py-2">
                Websites
              </a>
              <a href="#apps" className="text-slate-300 hover:text-white transition-colors font-medium py-2">
                Apps
              </a>
              <a href="#images" className="text-slate-300 hover:text-white transition-colors font-medium py-2">
                Images
              </a>
              <a href="mailto:ron@vencat.com" className="btn-glass text-center text-sm mt-2">
                Contact
              </a>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
