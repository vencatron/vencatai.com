import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const close = () => setMobileOpen(false);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-xl border-b border-white/5 pt-safe"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3" onClick={close}>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-cyber-cyan via-cyber-purple to-cyber-pink flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-base sm:text-lg">V</span>
            </div>
            <div>
              <span className="text-white font-bold text-lg sm:text-xl">VencatAI</span>
              <span className="text-slate-500 text-xs sm:text-sm ml-1.5">Portfolio</span>
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
          <div className="flex items-center gap-3">
            <a
              href="mailto:ron@vencat.com"
              className="hidden sm:block btn-glass text-sm"
            >
              Contact
            </a>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-3 rounded-xl glass"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <nav className="md:hidden py-3 border-t border-white/5">
            <div className="flex flex-col">
              {[
                { href: '#videos', label: 'Videos' },
                { href: '#websites', label: 'Websites' },
                { href: '#apps', label: 'Apps' },
                { href: '#images', label: 'Images' },
              ].map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  onClick={close}
                  className="text-slate-300 font-medium py-3.5 px-2 active:text-white transition-colors border-b border-white/5 last:border-0"
                >
                  {label}
                </a>
              ))}
              <a
                href="mailto:ron@vencat.com"
                onClick={close}
                className="btn-glass text-center text-sm mt-3"
              >
                Contact
              </a>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
