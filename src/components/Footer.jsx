import { Github, Twitter, Linkedin, Mail } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="pt-12 sm:pt-16 border-t border-white/5" style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom, 0px))' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start gap-3 sm:gap-4">
            <a href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyber-cyan via-cyber-purple to-cyber-pink flex items-center justify-center">
                <span className="text-white font-bold text-lg">V</span>
              </div>
              <span className="text-white font-bold text-xl">VencatAI</span>
            </a>
            <p className="text-slate-500 text-sm text-center md:text-left">
              AI-powered solutions for modern businesses.
            </p>
          </div>

          {/* Social links */}
          <div className="flex items-center gap-3 sm:gap-4">
            {[
              { href: 'https://github.com/vencatron', icon: Github, label: 'GitHub' },
              { href: 'https://twitter.com/vencat', icon: Twitter, label: 'Twitter' },
              { href: 'https://linkedin.com/company/vencat', icon: Linkedin, label: 'LinkedIn' },
              { href: 'mailto:ron@vencat.com', icon: Mail, label: 'Email' },
            ].map(({ href, icon: Icon, label }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith('mailto') ? undefined : '_blank'}
                rel={href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
                className="p-3 rounded-xl glass glass-hover"
                aria-label={label}
              >
                <Icon className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
              </a>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 sm:mt-12 pt-6 sm:pt-8 border-t border-white/5 text-center">
          <p className="text-slate-500 text-sm">
            © {currentYear} Venture Catalyst. Built with AI.
          </p>
        </div>
      </div>
    </footer>
  );
}
