import React from 'react';
import { CloudSun, LogOut, Database } from 'lucide-react';

export const Navbar = ({
  user,
  onLogout,
  onOpenAuth,
  onOpenSettings,
  mongoConnected,
}) => {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-white/80 border-b border-sky-100 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3 cursor-pointer group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
            <CloudSun className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xl font-bold tracking-tight text-slate-900 font-['Outfit']">
                Sky<span className="text-sky-600">Sync</span>
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 uppercase tracking-wider">
                Full-Stack
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">Your sky, synced.</p>
          </div>
        </div>

        {/* Right side items */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* System status pill / settings trigger */}
          <button
            onClick={onOpenSettings}
            title="Inspect Database & API credentials"
            className="flex items-center space-x-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                mongoConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span className="hidden md:inline">
              {mongoConnected ? 'MongoDB Atlas Connected' : 'DB Setup'}
            </span>
            <Database className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {user ? (
            /* Authenticated actions */
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center text-white text-xs font-bold uppercase shadow-xs">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-semibold text-slate-800 leading-tight">
                    {user.name}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate max-w-[120px]">
                    {user.email}
                  </div>
                </div>
              </div>

              <button
                onClick={onLogout}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition"
                title="Log out of SkySync"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            /* Guest actions */
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-3.5 py-1.5 text-xs sm:text-sm font-medium text-slate-700 hover:text-sky-600 transition"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-sm shadow-sky-500/25 transition active:scale-95"
              >
                Create Account
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
