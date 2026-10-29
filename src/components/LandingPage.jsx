import React from 'react';
import {
  CloudSun,
  Compass,
  Droplets,
  Wind,
  Eye,
  ArrowRight,
  Database,
  Lock,
  MapPin,
} from 'lucide-react';

export const LandingPage = ({
  onOpenAuth,
  onOpenSettings,
  mongoConnected,
}) => {
  return (
    <div className="relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-sky-200/50 via-sky-100/20 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 -right-40 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/2 -left-40 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="pt-12 sm:pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Subtle pill badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-sky-50 border border-sky-200/80 shadow-xs text-xs font-semibold text-sky-700 mb-6">
          <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping" />
          <span>Full-Stack Weather Intelligence Platform</span>
        </div>

        {/* Hero title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight font-['Outfit'] max-w-4xl mx-auto leading-[1.1]">
          Your sky, <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600">synced.</span>
        </h1>

        <p className="mt-6 text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          SkySync delivers live meteorological tracking, automatic geolocation weather, 5-day forecasts, and persistent search history powered by MongoDB Atlas and OpenWeatherMap.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <button
            onClick={() => onOpenAuth('register')}
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold text-base shadow-lg shadow-sky-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center space-x-2 cursor-pointer"
          >
            <span>Create Free Account</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onOpenAuth('login')}
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-base border border-slate-200/90 shadow-sm transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <span>Sign In to Dashboard</span>
          </button>
        </div>

        {/* Live Weather Preview Hero Card */}
        <div className="mt-14 max-w-4xl mx-auto">
          <div className="relative rounded-3xl p-1 bg-gradient-to-b from-sky-300/40 via-blue-200/20 to-indigo-300/40 shadow-2xl backdrop-blur-sm">
            <div className="rounded-[22px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6 sm:p-8 overflow-hidden text-left relative">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/10 gap-4">
                <div>
                  <div className="flex items-center space-x-2 text-sky-400 text-xs font-semibold uppercase tracking-wider">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Real-Time Coordinates Sync</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold font-['Outfit'] mt-1">
                    San Francisco, US
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400">Clear Skies • Synced via OpenWeatherMap</p>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-400/20 flex items-center justify-center">
                    <CloudSun className="w-10 h-10 text-amber-400" />
                  </div>
                  <div className="text-right">
                    <div className="text-4xl sm:text-5xl font-extrabold tracking-tight font-['Outfit']">
                      22°C
                    </div>
                    <div className="text-xs text-slate-400">Feels like 23°C</div>
                  </div>
                </div>
              </div>

              {/* Metric pills preview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6">
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                  <div className="flex items-center space-x-2 text-slate-400 text-xs">
                    <Droplets className="w-3.5 h-3.5 text-sky-400" />
                    <span>Humidity</span>
                  </div>
                  <div className="text-lg font-bold mt-1">54%</div>
                </div>
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                  <div className="flex items-center space-x-2 text-slate-400 text-xs">
                    <Wind className="w-3.5 h-3.5 text-teal-400" />
                    <span>Wind Speed</span>
                  </div>
                  <div className="text-lg font-bold mt-1">14 km/h</div>
                </div>
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                  <div className="flex items-center space-x-2 text-slate-400 text-xs">
                    <Eye className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Visibility</span>
                  </div>
                  <div className="text-lg font-bold mt-1">10 km</div>
                </div>
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                  <div className="flex items-center space-x-2 text-slate-400 text-xs">
                    <Compass className="w-3.5 h-3.5 text-purple-400" />
                    <span>Pressure</span>
                  </div>
                  <div className="text-lg font-bold mt-1">1016 hPa</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Architecture Cards */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-sky-100/80">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-['Outfit']">
            Engineered for Meteorological Precision
          </h2>
          <p className="mt-2 text-slate-600 text-sm sm:text-base max-w-xl mx-auto">
            A production-ready stack adhering to full-stack engineering standards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center mb-4">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-['Outfit']">
              Auto-Geolocation Permission
            </h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Upon login, SkySync immediately checks browser geolocation coordinates to fetch instant, hyperlocal weather metrics. Denied permissions fallback gracefully to manual search.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
              <Database className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-['Outfit']">
              MongoDB Atlas Search History
            </h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Every city you explore is persisted in MongoDB Atlas using Mongoose models. Authenticated users can reload past searches with a single click.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-['Outfit']">
              JWT & Bcrypt Security
            </h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Passwords are salted and hashed with bcrypt (10 rounds) and never stored as plain text. API routes are protected with stateless JSON Web Tokens.
            </p>
          </div>
        </div>

        {/* Database Status Alert Bar */}
        <div className="mt-12 p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div
              className={`w-3 h-3 rounded-full ${
                mongoConnected ? 'bg-emerald-500 ring-4 ring-emerald-100' : 'bg-amber-500 ring-4 ring-amber-100'
              }`}
            />
            <div className="text-left text-xs sm:text-sm text-slate-700">
              <span className="font-semibold text-slate-900">Database Status: </span>
              {mongoConnected
                ? 'MongoDB Atlas is connected and ready for user registration.'
                : 'MongoDB Atlas is waiting for your connection URI in .env (or click Setup to test).'}
            </div>
          </div>
          <button
            onClick={onOpenSettings}
            className="text-xs font-semibold text-sky-600 hover:text-sky-700 underline text-left cursor-pointer"
          >
            Configure MONGO_URI / API Keys →
          </button>
        </div>
      </section>
    </div>
  );
};
