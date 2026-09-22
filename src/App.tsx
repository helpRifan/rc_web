import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ShieldAlert, X } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { ClubTab } from './types';
import { supabase, signInWithGoogle, signOut, isAuthorizedStudentEmail } from './lib/supabase';
import { AppShell } from './components/AppShell';

import HomeView from './components/HomeView';
import ActivitiesView from './components/ActivitiesView';

const AboutView = React.lazy(() => import('./components/AboutView'));
const DepartmentsView = React.lazy(() => import('./components/DepartmentsView'));
const MembersView = React.lazy(() => import('./components/MembersView'));
const CertificatesView = React.lazy(() => import('./components/CertificatesView'));
const AdminView = React.lazy(() => import('./components/AdminView'));
const AchievementsView = React.lazy(() => import('./components/AchievementsView'));

export default function App() {
  const [activeTab, setActiveTab] = useState<ClubTab>('home');
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        if (isAuthorizedStudentEmail(session.user.email)) {
          setAuthUser(session.user);
          setAuthError(null);
        } else {
          const rejectedEmail = session.user.email || 'Unknown email';
          signOut().then(() => {
            setAuthUser(null);
            setAuthError(`Access Denied: ${rejectedEmail} is not authorized. Only @vitstudent.ac.in accounts are permitted.`);
          });
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        if (isAuthorizedStudentEmail(session.user.email)) {
          setAuthUser(session.user);
          setAuthError(null);
        } else {
          const rejectedEmail = session.user.email || 'Unknown email';
          await signOut();
          setAuthUser(null);
          setAuthError(`Access Denied: ${rejectedEmail} is not authorized. Only @vitstudent.ac.in accounts are permitted.`);
        }
      } else {
        setAuthUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const { error } = await signInWithGoogle();
      if (error) setAuthError(error.message);
    } catch (err: any) {
      setAuthError(err.message || 'Failed to initialize Google login.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setAuthUser(null);
      localStorage.removeItem('vit_robotics_club_admin_session');
    } catch (err: any) {
      console.error('Logout error:', err);
    }
  };

  const handleNavigate = (tab: ClubTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const authUserSummary = authUser
    ? {
        name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Student',
        avatarUrl: authUser.user_metadata?.avatar_url,
      }
    : null;

  return (
    <>
      <AnimatePresence>
        {authError && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-0 inset-x-0 z-50 bg-red-950/95 border-b border-red-500/50 backdrop-blur-md px-4 py-3 text-red-200 text-xs flex items-center justify-between shadow-2xl"
          >
            <div className="max-w-container-max mx-auto w-full flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
                <span className="font-mono">{authError}</span>
              </div>
              <button
                onClick={() => setAuthError(null)}
                className="p-1 hover:bg-red-900/50 rounded text-red-400 hover:text-white transition-colors cursor-pointer"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AppShell
        activeTab={activeTab}
        onNavigate={handleNavigate}
        authUser={authUserSummary}
        onLoginClick={handleGoogleLogin}
        onLogoutClick={handleLogout}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <React.Suspense
              fallback={
                <div className="w-full flex justify-center py-24">
                  <div className="w-8 h-8 border-2 border-accent-blue-dim border-t-accent-blue rounded-full animate-spin" />
                </div>
              }
            >
              {activeTab === 'home' && <HomeView onNavigate={(tab) => handleNavigate(tab as ClubTab)} />}
              {activeTab === 'about' && <AboutView />}
              {activeTab === 'achievements' && <AchievementsView />}
              {activeTab === 'departments' && <DepartmentsView />}
              {activeTab === 'members' && <MembersView />}
              {activeTab === 'activities' && <ActivitiesView />}
              {activeTab === 'certificates' && <CertificatesView />}
              {activeTab === 'admin' && <AdminView />}
            </React.Suspense>
          </motion.div>
        </AnimatePresence>
      </AppShell>
    </>
  );
}
