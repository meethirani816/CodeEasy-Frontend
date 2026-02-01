import React from 'react';
import { Link } from 'react-router-dom';
import { Code2, Github, Twitter } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-secondary text-secondary-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Code2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <span>CodeEasy</span>
            </Link>
            <p className="text-secondary-foreground/70 max-w-md">
              Develop fluency in programming languages with practice exercises. 
              Master your skills with our carefully crafted learning paths.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/tracks" className="text-secondary-foreground/70 hover:text-secondary-foreground transition-colors">
                  All Tracks
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-secondary-foreground/70 hover:text-secondary-foreground transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/signup" className="text-secondary-foreground/70 hover:text-secondary-foreground transition-colors">
                  Get Started
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 bg-secondary-foreground/10 rounded-lg flex items-center justify-center hover:bg-secondary-foreground/20 transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-secondary-foreground/10 rounded-lg flex items-center justify-center hover:bg-secondary-foreground/20 transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-secondary-foreground/10 mt-8 pt-8 text-center text-secondary-foreground/50">
          <p>&copy; {new Date().getFullYear()} CodeEasy. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;