import React from 'react';
import { CloudSun, Database, Shield, Server } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="mt-auto border-t border-slate-200/80 bg-white/60 backdrop-blur-xs py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-lg bg-sky-500 flex items-center justify-center text-white">
            <CloudSun className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-slate-800 font-['Outfit']">SkySync</span>
          <span>— Your sky, synced.</span>
        </div>

        {/* Tech stack badges */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-600">
          <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 flex items-center space-x-1">
            <Server className="w-3 h-3 text-sky-600" />
            <span>Node + Express (JS)</span>
          </span>
          <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 flex items-center space-x-1">
            <Database className="w-3 h-3 text-indigo-600" />
            <span>MongoDB Atlas</span>
          </span>
          <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 flex items-center space-x-1">
            <Shield className="w-3 h-3 text-emerald-600" />
            <span>JWT + Bcrypt</span>
          </span>
          <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 flex items-center space-x-1">
            <CloudSun className="w-3.5 h-3.5 text-amber-500" />
            <span>OpenWeatherMap API</span>
          </span>
        </div>
      </div>
    </footer>
  );
};
