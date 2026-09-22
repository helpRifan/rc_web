import { useState } from 'react';
import { Check, Instagram, Linkedin, Mail, ShieldCheck } from 'lucide-react';
import { ClubTab } from '../types';
import { Button } from './ui/Button';

interface FooterProps {
  onNavigate: (tab: ClubTab) => void;
}

const QUICK_LINKS: { id: ClubTab; label: string }[] = [
  { id: 'home', label: 'Homepage' },
  { id: 'activities', label: 'Events' },
  { id: 'departments', label: 'Divisions' },
  { id: 'achievements', label: 'Collaborations' },
  { id: 'members', label: 'Team Page' },
  { id: 'about', label: 'Genesis' },
];

export function Footer({ onNavigate }: FooterProps) {
  const [emailCopied, setEmailCopied] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('robotics.club@vit.ac.in');
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 2000);
  };

  return (
    <footer className="border-t border-border-subtle bg-bg-deep py-16 md:py-24 relative z-10">
      <div className="w-full max-w-container-max mx-auto px-gutter grid grid-cols-1 md:grid-cols-12 gap-12 border-b border-border-subtle pb-12 mb-8">
        <div className="md:col-span-5 space-y-6">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Robotics Club logo" className="w-11 h-11 object-contain" />
            <span className="font-display font-semibold text-fg-subtle text-lg">Robotics Club</span>
          </div>
          <p className="text-sm text-fg-muted leading-relaxed max-w-sm">
            Precision mechanical rigs, embedded systems, and autonomous platforms — built by
            students, for the campus, at VIT Chennai.
          </p>
        </div>

        <div className="md:col-span-4 space-y-4">
          <span className="text-sm font-medium text-fg-subtle">Explore</span>
          <div className="grid grid-cols-2 gap-y-3 gap-x-2">
            {QUICK_LINKS.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(link.id);
                }}
                className="text-sm text-fg-muted hover:text-fg-primary transition-colors w-fit py-1"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        <div className="md:col-span-3 space-y-4">
          <span className="text-sm font-medium text-fg-subtle">Connect</span>
          <div className="flex flex-col gap-3">
            <button
              onClick={handleCopyEmail}
              className="text-sm text-fg-muted hover:text-fg-primary transition-colors flex items-center gap-2.5 w-fit cursor-pointer"
            >
              {emailCopied ? <Check className="w-4 h-4 text-accent-blue" /> : <Mail className="w-4 h-4" />}
              {emailCopied ? 'Copied to clipboard' : 'robotics.club@vit.ac.in'}
            </button>
            <a
              href="https://www.instagram.com/robotics_club_vitc/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-fg-muted hover:text-fg-primary transition-colors flex items-center gap-2.5 w-fit"
            >
              <Instagram className="w-4 h-4" /> Instagram
            </a>
            <a
              href="https://in.linkedin.com/company/robotics-club-vitc"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-fg-muted hover:text-fg-primary transition-colors flex items-center gap-2.5 w-fit"
            >
              <Linkedin className="w-4 h-4" /> LinkedIn
            </a>
          </div>
        </div>
      </div>

      <div className="w-full max-w-container-max mx-auto px-gutter flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm text-fg-dim text-center md:text-left">
          &copy; {new Date().getFullYear()} VIT Chennai Robotics Club
        </div>
        <Button variant="terminal" size="sm" onClick={() => onNavigate('admin')}>
          <ShieldCheck className="w-4 h-4 mr-2 inline" />
          Admin control panel
        </Button>
      </div>
    </footer>
  );
}
