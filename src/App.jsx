import React, { useState, useEffect } from 'react';
import "./App.css";

import { Navbar } from './components/Navbar.jsx';
import { LandingPage } from './components/LandingPage.jsx';
import { WeatherDashboard } from './components/WeatherDashboard.jsx';
import { AuthModal } from './components/AuthModal.jsx';
import { SettingsModal } from './components/SettingsModal.jsx';
import { Footer } from './components/Footer.jsx';

import {
  clearAuthSession,
  fetchCurrentUser,
  fetchSystemStatus,
  getStoredUser,
} from './services/api.js';

export default function App() {
  const [user, setUser] = useState(getStoredUser());
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [systemStatus, setSystemStatus] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  // Initialize: verify token with backend & fetch system health
  useEffect(() => {
    const initApp = async () => {
      try {
        const [me, status] = await Promise.allSettled([
          fetchCurrentUser(),
          fetchSystemStatus(),
        ]);

        if (me.status === 'fulfilled' && me.value) {
          setUser(me.value);
        } else if (me.status === 'fulfilled' && !me.value) {
          setUser(null);
        }

        if (status.status === 'fulfilled') {
          setSystemStatus(status.value);
        }
      } catch (err) {
        console.warn('Initialization check error:', err);
      } finally {
        setInitialLoading(false);
      }
    };

    initApp();
  }, []);

  const handleLogout = () => {
    clearAuthSession();
    setUser(null);
  };

  const handleOpenAuth = (mode) => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (authenticatedUser) => {
    setUser(authenticatedUser);
    setAuthModalOpen(false);
  };

  return (
    <div className="sky-app min-h-screen flex flex-col bg-slate-50 text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] selection:bg-sky-500 selection:text-white">

      {/* Navigation Bar */}
      <Navbar
        user={user}
        onLogout={handleLogout}
        onOpenAuth={handleOpenAuth}
        onOpenSettings={() => setSettingsModalOpen(true)}
        mongoConnected={Boolean(systemStatus?.mongo?.connected)}
        hasWeatherKey={Boolean(systemStatus?.weather?.hasKey)}
      />

      {/* Main Content: Conditional based on Authentication */}
      <main className="flex-1">
        {user ? (
          /* Authenticated User Experience (Dashboard) */
          <WeatherDashboard
            user={user}
            hasWeatherKey={Boolean(systemStatus?.weather?.hasKey)}
            onOpenSettings={() => setSettingsModalOpen(true)}
          />
        ) : (
          /* Public Experience (Landing Page) */
          <LandingPage
            onOpenAuth={handleOpenAuth}
            onOpenSettings={() => setSettingsModalOpen(true)}
            mongoConnected={Boolean(systemStatus?.mongo?.connected)}
          />
        )}
      </main>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        onOpenSettings={() => setSettingsModalOpen(true)}
        mongoConnected={Boolean(systemStatus?.mongo?.connected)}
      />

      {/* System Settings & Credentials Inspector Modal */}
      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        status={systemStatus}
        onStatusUpdate={(newStatus) => setSystemStatus(newStatus)}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}