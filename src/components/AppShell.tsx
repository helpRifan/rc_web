import { ReactNode, useState } from 'react';
import { AuthUserSummary, ClubTab } from '../types';
import { TopBar } from './TopBar';
import { MobileDrawer } from './MobileDrawer';
import { Footer } from './Footer';

interface AppShellProps {
  activeTab: ClubTab;
  onNavigate: (tab: ClubTab) => void;
  authUser: AuthUserSummary | null;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  loginPending?: boolean;
  children: ReactNode;
}

export function AppShell({
  activeTab,
  onNavigate,
  authUser,
  onLoginClick,
  onLogoutClick,
  loginPending,
  children,
}: AppShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-bg-deep text-fg-muted overflow-x-hidden">
      <TopBar
        activeTab={activeTab}
        onNavigate={onNavigate}
        authUser={authUser}
        onLoginClick={onLoginClick}
        onLogoutClick={onLogoutClick}
        onMenuToggle={() => setDrawerOpen(true)}
        loginPending={loginPending}
      />
      <MobileDrawer
        open={drawerOpen}
        activeTab={activeTab}
        onNavigate={onNavigate}
        onClose={() => setDrawerOpen(false)}
        authUser={authUser}
        onLoginClick={onLoginClick}
        onLogoutClick={onLogoutClick}
        loginPending={loginPending}
      />
      <main className="flex-grow w-full max-w-container-max mx-auto px-gutter py-12 relative z-10">
        {children}
      </main>
      <Footer onNavigate={onNavigate} />
    </div>
  );
}
