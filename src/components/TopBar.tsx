import { LogOut, Menu } from 'lucide-react';
import { ClubTab } from '../types';
import { Button } from './ui/Button';

interface AuthUserSummary {
  name: string;
  avatarUrl?: string;
}

interface TopBarProps {
  activeTab: ClubTab;
  onNavigate: (tab: ClubTab) => void;
  authUser: AuthUserSummary | null;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  onMenuToggle: () => void;
}

const NAV_ITEMS: { id: ClubTab; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'achievements', label: 'Achievements' },
  { id: 'departments', label: 'Departments' },
  { id: 'members', label: 'Members' },
  { id: 'activities', label: 'Activities' },
  { id: 'certificates', label: 'Certificates' },
];

export function TopBar({
  activeTab,
  onNavigate,
  authUser,
  onLoginClick,
  onLogoutClick,
  onMenuToggle,
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border-subtle bg-bg-deep/90 backdrop-blur-md">
      <div className="max-w-container-max mx-auto px-gutter h-16 flex items-center justify-between gap-6">
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('home');
          }}
          className="flex items-center gap-2.5 shrink-0"
        >
          <img src="/logo-nobg.png" alt="Robotics Club logo" className="w-8 h-8 object-contain" />
          <span className="font-display font-semibold text-fg-subtle text-base hidden sm:inline">
            Robotics Club
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              aria-current={activeTab === item.id ? 'page' : undefined}
              onClick={(e) => {
                e.preventDefault();
                onNavigate(item.id);
              }}
              className={[
                'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                activeTab === item.id
                  ? 'text-fg-primary bg-bg-card'
                  : 'text-fg-muted hover:text-fg-primary',
              ].join(' ')}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {authUser ? (
            <button
              onClick={onLogoutClick}
              className="flex items-center gap-2 text-sm text-fg-muted hover:text-fg-primary transition-colors cursor-pointer"
              title="Sign out"
            >
              {authUser.avatarUrl ? (
                <img src={authUser.avatarUrl} alt={authUser.name} className="w-7 h-7 rounded-full object-cover" />
              ) : (
                <span className="w-7 h-7 rounded-full bg-accent-blue-dim/30 flex items-center justify-center text-xs font-mono text-accent-blue-bright">
                  {authUser.name.slice(0, 2).toUpperCase()}
                </span>
              )}
              {authUser.name}
              <LogOut className="w-3.5 h-3.5" />
            </button>
          ) : (
            <Button variant="secondary" size="sm" onClick={onLoginClick}>
              Student login
            </Button>
          )}
        </div>

        <button
          onClick={onMenuToggle}
          aria-label="Open menu"
          className="md:hidden p-2 text-fg-muted hover:text-fg-primary transition-colors cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
