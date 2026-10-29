import React, { useState } from 'react';
import { X, Mail, Lock, User as UserIcon, AlertCircle, CheckCircle2, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import { loginUser, registerUser, setAuthSession } from '../services/api.js';

export const AuthModal = ({
  isOpen,
  initialMode,
  onClose,
  onSuccess,
  onOpenSettings,
  mongoConnected,
}) => {
  const [mode, setMode] = useState(initialMode);
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  if (!isOpen) return null;

  const handleTabChange = (newMode) => {
    setMode(newMode);
    setError(null);
    setSuccessMsg(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    // Frontend pre-validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setError('Please provide a valid email address (e.g. user@example.com).');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (mode === 'register') {
      if (!name.trim() || name.trim().length < 2) {
        setError('Name must be at least 2 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please verify both passwords.');
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === 'register') {
        const res = await registerUser({
          name: name.trim(),
          email: email.trim(),
          password,
          confirmPassword,
        });

        if (res.token && res.user) {
          setAuthSession(res.token, res.user);
          setSuccessMsg('Account created successfully! Loading dashboard...');
          setTimeout(() => {
            onSuccess(res.user);
            onClose();
          }, 800);
        }
      } else {
        const res = await loginUser({
          email: email.trim(),
          password,
        });

        if (res.token && res.user) {
          setAuthSession(res.token, res.user);
          setSuccessMsg('Welcome back! Loading dashboard...');
          setTimeout(() => {
            onSuccess(res.user);
            onClose();
          }, 600);
        }
      }
    } catch (err) {
      const msg = err.message || 'Authentication failed. Please check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header decoration */}
        <div className="h-2 bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          {/* Logo & Headline */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-slate-900 font-['Outfit']">
              {mode === 'login' ? 'Welcome Back to SkySync' : 'Create Your SkySync Account'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {mode === 'login'
                ? 'Sign in to access your synchronized weather dashboard'
                : 'Enter your credentials to sync with personalized meteorological data'}
            </p>
          </div>

          {/* Database Notice if not connected */}
          {!mongoConnected && (
            <div className="mb-5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              <div>
                <span className="font-semibold">MongoDB Atlas Notice: </span>
                Atlas connection is waiting for your <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">MONGO_URI</code>.
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenSettings();
                  }}
                  className="underline ml-1 font-semibold hover:text-amber-900 cursor-pointer"
                >
                  Configure MongoDB URI
                </button>
              </div>
            </div>
          )}

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl mb-6 text-sm font-semibold">
            <button
              type="button"
              onClick={() => handleTabChange('login')}
              className={`py-2 rounded-lg transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('register')}
              className={`py-2 rounded-lg transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Register
            </button>
          </div>

          {/* Error / Success Banners */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <span className="leading-tight">{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Miller"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password {mode === 'register' && <span className="text-slate-400 font-normal">(min. 6 characters)</span>}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold text-sm shadow-md shadow-sky-500/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{mode === 'register' ? 'Creating Account...' : 'Signing In...'}</span>
                </>
              ) : (
                <>
                  <span>{mode === 'register' ? 'Register with MongoDB Atlas' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Toggle between login/register */}
          <div className="mt-6 text-center text-xs text-slate-500">
            {mode === 'login' ? (
              <>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => handleTabChange('register')}
                  className="font-semibold text-sky-600 hover:text-sky-700 underline cursor-pointer"
                >
                  Create one now
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => handleTabChange('login')}
                  className="font-semibold text-sky-600 hover:text-sky-700 underline cursor-pointer"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
