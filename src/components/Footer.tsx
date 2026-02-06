import React from 'react';
import { Link } from 'react-router-dom';
import { Code2, Github, Twitter } from 'lucide-react';
import { WavyLine } from "@/components/ui/decorative-elements";

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#130b43] text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2 space-y-4">
            <Link
              to="/"
              className="flex items-center gap-3 text-xl font-bold"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-primary to-purple-500 rounded-xl flex items-center justify-center shadow-sm">
                <Code2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="tracking-tight">CodeEasy<WavyLine className="mt-1" color="accent" /></span>
            </Link>

            <p className="text-muted-foreground max-w-md leading-relaxed">
              Develop real fluency in programming languages through hands-on
              practice. Learn by doing, progress with confidence.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide mb-4 text-white">
              Quick Links
              <WavyLine className="mt-1" color="accent" />
            </h4>
            
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  to="/tracks"
                  className="text-white hover:text-violet-500 transition-colors"
                >
                  All Tracks
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard"
                  className="text-white hover:text-violet-500 transition-colors"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/signup"
                  className="text-white hover:text-violet-500 transition-colors"
                >
                  Get Started
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide mb-4 text-white">
              Connect
              <WavyLine className="mt-1" color="accent" />
            </h4>

            <div className="flex gap-3">
              <a
                href="#"
                aria-label="GitHub"
                className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-violet-500 transition-all"
              >
                <Github className="w-5 h-5" />
              </a>

              <a
                href="#"
                aria-label="Twitter"
                className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-violet-500 transition-all"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 pt-6 border-t border-border text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} CodeEasy. Built with ❤️ for developers.
        </div>
      </div>
    </footer>
  );
};

export default Footer;