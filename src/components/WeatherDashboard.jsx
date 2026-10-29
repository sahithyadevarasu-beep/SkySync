import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  MapPin,
  Compass,
  Wind,
  Droplets,
  Eye,
  Sunrise,
  Sunset,
  Calendar,
  History,
  Trash2,
  RefreshCw,
  AlertTriangle,
  Sparkles,
  Loader2,
} from 'lucide-react';
import {
  fetchCurrentWeatherByCoords,
  fetchWeatherByCity,
  fetchForecast,
  fetchSearchHistory,
  saveSearchHistory,
  clearAllSearchHistory,
  deleteSearchHistoryItem,
} from '../services/api.js';

export const WeatherDashboard = ({
  user,
  hasWeatherKey,
  onOpenSettings,
}) => {
  // Weather state
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [weatherError, setWeatherError] = useState(null);

  // Search input & history
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);

  // Location permission state
  const [locationStatus, setLocationStatus] = useState('prompt');
  const [unit, setUnit] = useState('C');

  // Convert Celsius to Fahrenheit
  const formatTemp = (tempC) => {
    if (unit === 'F') {
      return `${Math.round((tempC * 9) / 5 + 32)}°F`;
    }
    return `${tempC}°C`;
  };

  // Format UNIX timestamp to local readable time (e.g., 6:30 AM)
  const formatTime = (unixSeconds) => {
    if (!unixSeconds) return '--:--';
    const date = new Date(unixSeconds * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Load search history from MongoDB
  const loadHistory = useCallback(async () => {
    try {
      const items = await fetchSearchHistory();
      setSearchHistory(items);
    } catch (e) {
      console.warn('Could not load search history:', e);
    }
  }, []);

  // Fetch weather and forecast for given coordinates
  const loadWeatherByCoords = useCallback(
    async (lat, lon) => {
      setLoading(true);
      setWeatherError(null);
      try {
        const [current, forecastData] = await Promise.all([
          fetchCurrentWeatherByCoords(lat, lon),
          fetchForecast({ lat, lon }),
        ]);
        setCurrentWeather(current);
        setForecast(forecastData);
        // Save to MongoDB search history if city is detected
        if (current.city) {
          await saveSearchHistory(current.city, current.country);
          loadHistory();
        }
      } catch (err) {
        setWeatherError(
          err.message || 'Failed to fetch weather for your coordinates.'
        );
      } finally {
        setLoading(false);
      }
    },
    [loadHistory]
  );

  // Fetch weather and forecast by city name
  const loadWeatherByCity = useCallback(
    async (cityName, addToHistory = true) => {
      if (!cityName || cityName.trim() === '') return;
      setLoading(true);
      setWeatherError(null);
      try {
        const [current, forecastData] = await Promise.all([
          fetchWeatherByCity(cityName.trim()),
          fetchForecast({ city: cityName.trim() }),
        ]);
        setCurrentWeather(current);
        setForecast(forecastData);

        if (addToHistory && current.city) {
          await saveSearchHistory(current.city, current.country);
          loadHistory();
        }
      } catch (err) {
        setWeatherError(
          err.message || `Unable to load weather for "${cityName}".`
        );
      } finally {
        setLoading(false);
      }
    },
    [loadHistory]
  );

  // Request browser geolocation immediately after dashboard loads (Requirement 5)
  useEffect(() => {
    loadHistory();

    if (!navigator.geolocation) {
      setLocationStatus('unavailable');
      // Fallback default city so the dashboard doesn't stay empty
      loadWeatherByCity('Hyderabad', false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationStatus('granted');
        loadWeatherByCoords(
          position.coords.latitude,
          position.coords.longitude
        );
      },
      (error) => {
        console.warn('Geolocation permission denied or error:', error.message);
        setLocationStatus('denied');
        // Graceful fallback to default city
        loadWeatherByCity('Hyderabad', false);
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  }, [loadHistory, loadWeatherByCoords, loadWeatherByCity]);

  // Handle manual city search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      loadWeatherByCity(searchQuery.trim(), true);
      setSearchQuery('');
    }
  };

  // Clear all search history
  const handleClearHistory = async () => {
    const success = await clearAllSearchHistory();
    if (success) {
      setSearchHistory([]);
    }
  };

  // Delete individual search item
  const handleDeleteHistoryItem = async (e, id) => {
    e.stopPropagation();
    const success = await deleteSearchHistoryItem(id);
    if (success) {
      setSearchHistory((prev) => prev.filter((item) => item.id !== id));
    }
  };

  // Dynamic sky backdrop class based on weather condition
  const getSkyBackdrop = (condition = 'Clear') => {
    const c = condition.toLowerCase();
    if (c.includes('rain') || c.includes('drizzle')) {
      return 'from-slate-800 via-blue-950 to-slate-900 border-blue-400/30';
    }
    if (c.includes('thunder') || c.includes('storm')) {
      return 'from-purple-950 via-slate-900 to-indigo-950 border-purple-400/30';
    }
    if (c.includes('snow')) {
      return 'from-sky-900 via-slate-800 to-indigo-900 border-sky-300/40';
    }
    if (c.includes('cloud')) {
      return 'from-slate-800 via-sky-950 to-slate-900 border-sky-400/20';
    }
    return 'from-sky-600 via-blue-700 to-indigo-800 border-sky-300/30';
  };

  const quickCities = ['Hyderabad', 'London', 'New York', 'Tokyo', 'Paris', 'Sydney'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome & Geolocation status header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-sky-100 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Outfit']">
              Welcome back, <span className="text-sky-600">{user.name}</span>
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
              <Sparkles className="w-3 h-3 mr-1" />
              Synced
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time meteorological monitoring & personalized atmospheric sync.
          </p>
        </div>

        {/* Temperature unit switch & refresh button */}
        <div className="flex items-center space-x-3 self-start md:self-auto">
          {/* Unit Toggle */}
          <div className="flex items-center bg-slate-100 rounded-xl p-1 text-xs font-bold border border-slate-200">
            <button
              onClick={() => setUnit('C')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                unit === 'C'
                  ? 'bg-white text-sky-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              °C
            </button>
            <button
              onClick={() => setUnit('F')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                unit === 'F'
                  ? 'bg-white text-sky-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              °F
            </button>
          </div>

          {/* Quick Refresh */}
          <button
            onClick={() => {
              if (currentWeather) {
                loadWeatherByCity(currentWeather.city, false);
              }
            }}
            disabled={loading}
            title="Refresh current weather data"
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-xs transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Geolocation Notice (if denied or unavailable) */}
      {locationStatus === 'denied' && (
        <div className="p-4 rounded-2xl bg-sky-50/80 border border-sky-200 text-sky-900 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center space-x-3">
            <MapPin className="w-4 h-4 text-sky-600 shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <span className="font-semibold">Browser Location Access Denied: </span>
              Displaying default city forecast. You can search for any city or region across the world using the search bar below!
            </div>
          </div>
          <button
            onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  (pos) => {
                    setLocationStatus('granted');
                    loadWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
                  },
                  () => setLocationStatus('denied')
                );
              }
            }}
            className="text-xs font-semibold text-sky-700 hover:underline shrink-0 text-left cursor-pointer"
          >
            Retry Location Permission
          </button>
        </div>
      )}

      {/* Weather API Key banner if missing */}
      {!hasWeatherKey && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start sm:items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <span className="font-semibold">OpenWeatherMap API Key Required: </span>
              Please provide your free OpenWeatherMap API key in <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">.env</code> as <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">WEATHER_API_KEY</code>.
            </div>
          </div>
          <button
            onClick={onOpenSettings}
            className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition cursor-pointer shrink-0"
          >
            Enter Key / Credentials
          </button>
        </div>
      )}

      {/* Search Bar & Quick City Chips (Requirement 9) */}
      <div className="space-y-3">
        <form onSubmit={handleSearchSubmit} className="relative max-w-3xl">
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search city (e.g. Hyderabad, London, Tokyo, New York, Paris)..."
              className="w-full pl-12 pr-28 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 text-sm sm:text-base focus:outline-hidden focus:ring-2 focus:ring-sky-500 shadow-sm transition"
            />
            <button
              type="submit"
              disabled={loading || !searchQuery.trim()}
              className="absolute right-2 px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 disabled:bg-slate-200 text-white font-semibold text-xs sm:text-sm shadow-xs transition disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
            </button>
          </div>
        </form>

        {/* Quick Suggestion Chips */}
        <div className="flex items-center flex-wrap gap-2 text-xs text-slate-500 pt-1">
          <span className="font-semibold text-slate-700">Quick explore:</span>
          {quickCities.map((cityName) => (
            <button
              key={cityName}
              type="button"
              onClick={() => loadWeatherByCity(cityName, true)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-sky-50 hover:text-sky-700 text-slate-700 font-medium transition cursor-pointer border border-slate-200/60"
            >
              {cityName}
            </button>
          ))}
        </div>
      </div>

      {/* Error Message if search or API failed */}
      {weatherError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
          <div className="flex-1">
            <div className="font-semibold">Unable to fetch meteorological data:</div>
            <p className="mt-0.5">{weatherError}</p>
          </div>
        </div>
      )}

      {/* Loading state indicator */}
      {loading && !currentWeather && (
        <div className="py-24 text-center">
          <Loader2 className="w-10 h-10 animate-spin text-sky-500 mx-auto mb-4" />
          <p className="text-sm font-semibold text-slate-700">
            Synchronizing satellite weather metrics...
          </p>
          <p className="text-xs text-slate-500 mt-1">Connecting to OpenWeatherMap backend service</p>
        </div>
      )}

      {/* Current Weather Display Card (Requirement 7) */}
      {currentWeather && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div
            className={`relative rounded-3xl p-6 sm:p-10 text-white shadow-xl overflow-hidden bg-gradient-to-br ${getSkyBackdrop(
              currentWeather.condition
            )} border`}
          >
            {/* Ambient atmospheric lighting */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-white/15">
              {/* Location & condition overview */}
              <div>
                <div className="flex items-center space-x-2 text-sky-200 text-xs font-semibold uppercase tracking-wider mb-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>
                    Lat: {currentWeather.coord.lat.toFixed(2)}°, Lon: {currentWeather.coord.lon.toFixed(2)}°
                  </span>
                </div>
                <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-['Outfit']">
                  {currentWeather.city}
                  {currentWeather.country && (
                    <span className="text-2xl sm:text-3xl font-medium text-white/80 ml-2">
                      ({currentWeather.country})
                    </span>
                  )}
                </h2>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wide backdrop-blur-xs">
                    {currentWeather.condition}
                  </span>
                  <span className="text-xs sm:text-sm text-white/80 capitalize">
                    {currentWeather.description}
                  </span>
                </div>
              </div>

              {/* Large Temperature & Icon Hero */}
              <div className="flex items-center space-x-6">
                <img
                  src={currentWeather.iconUrl}
                  alt={currentWeather.condition}
                  className="w-24 h-24 sm:w-28 sm:h-28 object-contain filter drop-shadow-md"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <div>
                  <div className="text-5xl sm:text-7xl font-extrabold tracking-tight font-['Outfit']">
                    {formatTemp(currentWeather.temperature)}
                  </div>
                  <div className="text-xs sm:text-sm text-white/80 mt-1 flex items-center space-x-2">
                    <span>Feels like: <strong>{formatTemp(currentWeather.feelsLike)}</strong></span>
                    <span>•</span>
                    <span>H: {formatTemp(currentWeather.tempMax)} / L: {formatTemp(currentWeather.tempMin)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Meteorological Metric Grid: Humidity, Wind Speed, Pressure, Visibility, Sunrise, Sunset */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mt-8">
              {/* Humidity */}
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
                <div className="flex items-center space-x-2 text-white/70 text-xs font-medium">
                  <Droplets className="w-4 h-4 text-sky-300" />
                  <span>Humidity</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold font-['Outfit'] mt-1.5">
                  {currentWeather.humidity}%
                </div>
                <div className="text-[11px] text-white/60 mt-0.5">Atmospheric moisture</div>
              </div>

              {/* Wind Speed */}
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
                <div className="flex items-center space-x-2 text-white/70 text-xs font-medium">
                  <Wind className="w-4 h-4 text-teal-300" />
                  <span>Wind Speed</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold font-['Outfit'] mt-1.5">
                  {currentWeather.windSpeed} km/h
                </div>
                <div className="text-[11px] text-white/60 mt-0.5">{currentWeather.windSpeedMs} m/s</div>
              </div>

              {/* Pressure */}
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
                <div className="flex items-center space-x-2 text-white/70 text-xs font-medium">
                  <Compass className="w-4 h-4 text-indigo-300" />
                  <span>Pressure</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold font-['Outfit'] mt-1.5">
                  {currentWeather.pressure} hPa
                </div>
                <div className="text-[11px] text-white/60 mt-0.5">Barometric level</div>
              </div>

              {/* Visibility */}
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
                <div className="flex items-center space-x-2 text-white/70 text-xs font-medium">
                  <Eye className="w-4 h-4 text-emerald-300" />
                  <span>Visibility</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold font-['Outfit'] mt-1.5">
                  {currentWeather.visibility} km
                </div>
                <div className="text-[11px] text-white/60 mt-0.5">Horizontal range</div>
              </div>

              {/* Sunrise */}
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
                <div className="flex items-center space-x-2 text-white/70 text-xs font-medium">
                  <Sunrise className="w-4 h-4 text-amber-300" />
                  <span>Sunrise</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold font-['Outfit'] mt-1.5">
                  {formatTime(currentWeather.sunrise)}
                </div>
                <div className="text-[11px] text-white/60 mt-0.5">Dawn transit</div>
              </div>

              {/* Sunset */}
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
                <div className="flex items-center space-x-2 text-white/70 text-xs font-medium">
                  <Sunset className="w-4 h-4 text-rose-300" />
                  <span>Sunset</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold font-['Outfit'] mt-1.5">
                  {formatTime(currentWeather.sunset)}
                </div>
                <div className="text-[11px] text-white/60 mt-0.5">Dusk transit</div>
              </div>
            </div>
          </div>

          {/* 5-Day Forecast Section (Requirement 8) */}
          {forecast && forecast.list && forecast.list.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-sky-600" />
                  <h3 className="text-xl font-bold text-slate-900 font-['Outfit']">
                    5-Day Weather Forecast
                  </h3>
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  Aggregated daily trajectory
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5">
                {forecast.list.map((day, idx) => (
                  <div
                    key={day.date || idx}
                    className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition text-center flex flex-col items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-800 text-base font-['Outfit']">
                        {idx === 0 ? 'Today' : day.dayName}
                      </div>
                      <div className="text-[11px] text-slate-400 font-medium">
                        {day.fullDate}
                      </div>
                    </div>

                    <img
                      src={day.iconUrl}
                      alt={day.condition}
                      className="w-16 h-16 my-2 object-contain"
                    />

                    <div>
                      <div className="text-xl font-extrabold text-slate-900 font-['Outfit']">
                        {formatTemp(day.temp)}
                      </div>
                      <div className="text-xs font-semibold text-slate-500 capitalize mt-0.5">
                        {day.condition}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        H: {formatTemp(day.tempMax)} • L: {formatTemp(day.tempMin)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search History Section (Requirement 10) */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <History className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-900 font-['Outfit']">
                  Recent Searches
                </h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                  MongoDB Atlas
                </span>
              </div>

              {searchHistory.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="flex items-center space-x-1 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1 rounded-lg transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear History</span>
                </button>
              )}
            </div>

            {searchHistory.length === 0 ? (
              <p className="text-xs text-slate-500 italic">
                No recent searches yet. Search for any city above to store it in your personalized MongoDB collection.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2.5 pt-1">
                {searchHistory.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => loadWeatherByCity(item.city, false)}
                    className="group inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-300 text-slate-800 hover:text-sky-800 transition cursor-pointer shadow-2xs"
                  >
                    <MapPin className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600" />
                    <span className="text-xs font-semibold">
                      {item.city} {item.country ? `(${item.country})` : ''}
                    </span>
                    <button
                      onClick={(e) => handleDeleteHistoryItem(e, item.id)}
                      title="Remove from history"
                      className="text-slate-400 hover:text-rose-600 p-0.5 rounded transition cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
