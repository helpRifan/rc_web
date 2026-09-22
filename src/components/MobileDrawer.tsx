import { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { LogOut, X } from 'lucide-react';
import { AuthUserSummary, ClubTab } from '../types';
import { Button } from './ui/Button';
import { CLUB_NAV_ITEMS } from '../nav';

interface MobileDrawerProps {
  open: boolean;
  activeTab: ClubTab;
  onNavigate: (tab: ClubTab) => void;
  onClose: () => void;
  authUser: AuthUserSummary | null;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  loginPending?: boolean;
}

const NAV_ITEMS = CLUB_NAV_ITEMS.filter((item) => item.id !== 'admin');

export function MobileDrawer({
  open,
  activeTab,
  onNavigate,
  onClose,
  authUser,
  onLoginClick,
  onLogoutClick,
  loginPending,
}: MobileDrawerProps) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 md:hidden bg-bg-deep/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.nav
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 top-0 h-full w-full max-w-xs bg-bg-elevated border-l border-border-subtle p-6 flex flex-col gap-2"
          >
            <div className="flex justify-end mb-4">
              <button
                onClick={onClose}
                aria-label="Close menu"
                className="p-2 text-fg-muted hover:text-fg-primary transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4 pb-4 border-b border-border-subtle">
              {authUser ? (
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm text-fg-muted">
                    {authUser.avatarUrl ? (
                      <img
                        src={authUser.avatarUrl}
                        alt={authUser.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <span className="w-8 h-8 rounded-full bg-accent-blue-dim/30 flex items-center justify-center text-xs font-mono text-accent-blue-bright">
                        {authUser.name.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                    <span className="text-fg-primary font-medium">{authUser.name}</span>
                  </div>
                  <button
                    onClick={() => {
                      onLogoutClick();
                      onClose();
                    }}
                    className="flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg-primary transition-colors cursor-pointer"
                    title="Sign out"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              ) : (
                <Button
                  variant="secondary"
                  className="w-full"
                  disabled={loginPending}
                  onClick={() => {
                    onLoginClick();
                    onClose();
                  }}
                >
                  Student login
                </Button>
              )}
            </div>

            {NAV_ITEMS.map((item, i) => (
              <motion.a
                key={item.id}
                href={`#${item.id}`}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, duration: 0.25 }}
                aria-current={activeTab === item.id ? 'page' : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(item.id);
                  onClose();
                }}
                className={[
                  'px-3 py-3 rounded-lg text-base font-medium transition-colors',
                  activeTab === item.id ? 'text-fg-primary bg-bg-card' : 'text-fg-muted hover:text-fg-primary',
                ].join(' ')}
              >
                {item.label}
              </motion.a>
            ))}
          </motion.nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
