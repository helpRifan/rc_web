import { ReactNode, useState } from 'react';
import { ClubTab } from '../types';
import { TopBar } from './TopBar';
import { MobileDrawer } from './MobileDrawer';
import { Footer } from './Footer';

interface AuthUserSummary {
  name: string;
  avatarUrl?: string;
}

interface AppShellProps {
  activeTab: ClubTab;
  onNavigate: (tab: ClubTab) => void;
  authUser: AuthUserSummary | null;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  children: ReactNode;
}

export function AppShell({
  activeTab,
  onNavigate,
  authUser,
  onLoginClick,
  onLogoutClick,
  children,
}: AppShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-bg-deep text-fg-muted">
      <TopBar
        activeTab={activeTab}
        onNavigate={onNavigate}
        authUser={authUser}
        onLoginClick={onLoginClick}
        onLogoutClick={onLogoutClick}
        onMenuToggle={() => setDrawerOpen(true)}
      />
      <MobileDrawer
        open={drawerOpen}
        activeTab={activeTab}
        onNavigate={onNavigate}
        onClose={() => setDrawerOpen(false)}
      />
      <main className="flex-grow w-full max-w-container-max mx-auto px-gutter py-12 relative z-10">
        {children}
      </main>
      <Footer onNavigate={onNavigate} />
    </div>
  );
}
