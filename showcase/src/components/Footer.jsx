import { Github, Twitter, Linkedin, Mail } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-16 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start gap-4">
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

          {/* Links */}
          <div className="flex items-center gap-6">
            <a
              href="https://github.com/vencatron"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-lg glass glass-hover"
            >
              <Github className="w-5 h-5 text-slate-400 hover:text-white transition-colors" />
            </a>
            <a
              href="https://twitter.com/vencat"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-lg glass glass-hover"
            >
              <Twitter className="w-5 h-5 text-slate-400 hover:text-white transition-colors" />
            </a>
            <a
              href="https://linkedin.com/company/vencat"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-lg glass glass-hover"
            >
              <Linkedin className="w-5 h-5 text-slate-400 hover:text-white transition-colors" />
            </a>
            <a
              href="mailto:ron@vencat.com"
              className="p-2.5 rounded-lg glass glass-hover"
            >
              <Mail className="w-5 h-5 text-slate-400 hover:text-white transition-colors" />
            </a>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-white/5 text-center">
          <p className="text-slate-500 text-sm">
            © {currentYear} Venture Catalyst. Built with AI.
          </p>
        </div>
      </div>
    </footer>
  );
}
