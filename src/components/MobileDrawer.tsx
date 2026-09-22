import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { ClubTab } from '../types';

interface MobileDrawerProps {
  open: boolean;
  activeTab: ClubTab;
  onNavigate: (tab: ClubTab) => void;
  onClose: () => void;
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

export function MobileDrawer({ open, activeTab, onNavigate, onClose }: MobileDrawerProps) {
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
