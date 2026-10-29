const TOKEN_KEY = 'skysync_jwt_token';
const USER_KEY = 'skysync_user_profile';

export const getAuthToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setAuthSession = (token, user) => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (e) {
    console.error('Failed to save auth to localStorage:', e);
  }
};

export const clearAuthSession = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch (e) {
    console.error('Failed to clear auth session:', e);
  }
};

const getHeaders = (includeAuth = false) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
};

// Authentication Endpoints
export const registerUser = async (data) => {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || 'Registration failed');
  }
  return json;
};

export const loginUser = async (credentials) => {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(credentials),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || 'Login failed');
  }
  return json;
};

export const fetchCurrentUser = async () => {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const res = await fetch('/api/auth/me', {
      headers: getHeaders(true),
    });
    if (!res.ok) {
      if (res.status === 401) {
        clearAuthSession();
      }
      return null;
    }
    const json = await res.json();
    return json.user;
  } catch {
    return null;
  }
};

// Weather Endpoints
export const fetchCurrentWeatherByCoords = async (lat, lon) => {
  const res = await fetch(`/api/weather/current?lat=${lat}&lon=${lon}`);
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || 'Failed to fetch coordinates weather');
  }
  return json.data;
};

export const fetchWeatherByCity = async (city) => {
  const res = await fetch(`/api/weather/city?city=${encodeURIComponent(city)}`);
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || `Failed to fetch weather for ${city}`);
  }
  return json.data;
};

export const fetchForecast = async (options = {}) => {
  let url = '/api/weather/forecast';
  if (options.lat !== undefined && options.lon !== undefined) {
    url += `?lat=${options.lat}&lon=${options.lon}`;
  } else if (options.city) {
    url += `?city=${encodeURIComponent(options.city)}`;
  }
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || 'Failed to fetch weather forecast');
  }
  return json.data;
};

// Search History Endpoints
export const fetchSearchHistory = async () => {
  const res = await fetch('/api/history', {
    headers: getHeaders(true),
  });
  const json = await res.json();
  if (!res.ok) {
    return [];
  }
  return json.data || [];
};

export const saveSearchHistory = async (city, country = '') => {
  try {
    const res = await fetch('/api/history', {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ city, country }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
};

export const deleteSearchHistoryItem = async (id) => {
  try {
    const res = await fetch(`/api/history/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    return res.ok;
  } catch {
    return false;
  }
};

export const clearAllSearchHistory = async () => {
  try {
    const res = await fetch('/api/history', {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    return res.ok;
  } catch {
    return false;
  }
};

// System Health & Configuration Endpoints
export const fetchSystemStatus = async () => {
  const res = await fetch('/api/status');
  return res.json();
};

export const submitRuntimeConfig = async (mongoUri, weatherKey) => {
  const res = await fetch('/api/config/test-connection', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ mongoUri, weatherKey }),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || 'Failed to apply configuration');
  }
  return json;
};
