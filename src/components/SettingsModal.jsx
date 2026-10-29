import React, { useState } from 'react';
import {
  X,
  Database,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Terminal,
} from 'lucide-react';
import { submitRuntimeConfig, fetchSystemStatus } from '../services/api.js';

export const SettingsModal = ({
  isOpen,
  onClose,
  status,
  onStatusUpdate,
}) => {
  const [mongoUri, setMongoUri] = useState('');
  const [weatherKey, setWeatherKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState(null);
  const [copiedEnv, setCopiedEnv] = useState(false);

  if (!isOpen) return null;

  const sampleEnvText = `# SkySync Environment Variables (.env)
MONGO_URI="mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/skysync?retryWrites=true&w=majority"
JWT_SECRET="skysync_super_secret_jwt_key_2026_secure"
WEATHER_API_KEY="your_openweathermap_api_key_here"
PORT=3000`;

  const handleCopyEnv = () => {
    navigator.clipboard.writeText(sampleEnvText);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2000);
  };

  const handleApplyConfig = async (e) => {
    e.preventDefault();
    setMessage(null);
    setTesting(true);

    try {
      const res = await submitRuntimeConfig(
        mongoUri.trim() || undefined,
        weatherKey.trim() || undefined
      );
      setMessage({ text: res.message || 'Configuration applied!', type: 'success' });
      // Refresh system status
      const updated = await fetchSystemStatus();
      onStatusUpdate(updated);
    } catch (err) {
      setMessage({
        text: err.message || 'Failed to connect with provided credentials.',
        type: 'error',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleRefreshStatus = async () => {
    try {
      const updated = await fetchSystemStatus();
      onStatusUpdate(updated);
    } catch (e) {
      console.warn('Could not refresh status:', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header decoration */}
        <div className="h-2 bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600" />

        {/* Top bar */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800">
              <Database className="w-5 h-5 text-sky-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-['Outfit']">
                System Credentials & Database Setup
              </h2>
              <p className="text-xs text-slate-500">
                Connect your MongoDB Atlas cluster and OpenWeatherMap API key
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body with scrolling */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-700">
          {/* Live Status Diagnostics */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Live Backend Diagnostics
              </span>
              <button
                onClick={handleRefreshStatus}
                className="text-xs font-medium text-sky-600 hover:text-sky-700 flex items-center space-x-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Check Status</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* MongoDB Status */}
              <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900">MongoDB Atlas</div>
                  <div className="text-[11px] text-slate-500">Mongoose Connection</div>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      status?.mongo.connected ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                  />
                  <span
                    className={`font-semibold ${
                      status?.mongo.connected ? 'text-emerald-700' : 'text-amber-700'
                    }`}
                  >
                    {status?.mongo.connected ? 'Connected' : 'Not Connected'}
                  </span>
                </div>
              </div>

              {/* Weather API Key Status */}
              <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900">OpenWeatherMap API</div>
                  <div className="text-[11px] text-slate-500">WEATHER_API_KEY</div>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      status?.weather.hasKey ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                  />
                  <span
                    className={`font-semibold ${
                      status?.weather.hasKey ? 'text-emerald-700' : 'text-amber-700'
                    }`}
                  >
                    {status?.weather.hasKey ? 'Configured' : 'Missing Key'}
                  </span>
                </div>
              </div>
            </div>

            {status?.mongo.error && (
              <div className="text-[11px] text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                <strong>Connection note:</strong> {status.mongo.error}
              </div>
            )}
          </div>

          {/* Runtime Config Form */}
          <form onSubmit={handleApplyConfig} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-800">
                  MongoDB Atlas Connection URI (MONGO_URI)
                </label>
                <a
                  href="https://cloud.mongodb.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-semibold text-sky-600 hover:text-sky-700 flex items-center space-x-1"
                >
                  <span>MongoDB Atlas Console</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <input
                type="text"
                value={mongoUri}
                onChange={(e) => setMongoUri(e.target.value)}
                placeholder="mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/skysync?retryWrites=true&w=majority"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:bg-white"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Ensure your Atlas Network Access allows your IP or <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">0.0.0.0/0</code>.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-800">
                  OpenWeatherMap API Key (WEATHER_API_KEY)
                </label>
                <a
                  href="https://home.openweathermap.org/api_keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-semibold text-sky-600 hover:text-sky-700 flex items-center space-x-1"
                >
                  <span>Get Free Key</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <input
                type="text"
                value={weatherKey}
                onChange={(e) => setWeatherKey(e.target.value)}
                placeholder="Paste your 32-character OpenWeatherMap API key"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:bg-white"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Note: Brand new OpenWeatherMap API keys take 15–60 minutes to activate on OpenWeather servers.
              </p>
            </div>

            {message && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center space-x-2 ${
                  message.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border border-rose-200 text-rose-800'
                }`}
              >
                {message.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                )}
                <span>{message.text}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={testing || (!mongoUri.trim() && !weatherKey.trim())}
              className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:bg-slate-200 text-white font-semibold text-xs transition cursor-pointer disabled:cursor-not-allowed shadow-xs"
            >
              {testing ? 'Testing & Applying Connection...' : 'Apply & Test Connection'}
            </button>
          </form>

          {/* Student Guide / .env template */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                <Terminal className="w-3.5 h-3.5 text-slate-600" />
                <span>Permanent Setup via .env File</span>
              </span>
              <button
                type="button"
                onClick={handleCopyEnv}
                className="text-xs font-medium text-sky-600 hover:text-sky-700 flex items-center space-x-1 cursor-pointer"
              >
                {copiedEnv ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedEnv ? 'Copied' : 'Copy Template'}</span>
              </button>
            </div>
            <pre className="p-3 bg-slate-900 text-sky-300 rounded-xl text-[11px] font-mono overflow-x-auto leading-relaxed">
              {sampleEnvText}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
