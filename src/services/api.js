
const TOKEN_KEY = 'skysync_jwt_token';
const USER_KEY = 'skysync_user_profile';

// Common response handler
const handleResponse = async (res, defaultMessage = 'Something went wrong') => {
  let json;

  try {
    json = await res.json();
  } catch {
    throw new Error('Invalid server response. Please try again.');
  }

  if (!res.ok) {
    throw new Error(json.message || defaultMessage);
  }

  return json;
};

// Authentication storage
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
    console.error('Failed to save auth session:', e);
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
      headers.Authorization = `Bearer ${token}`;
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

  return handleResponse(res, 'Registration failed');
};

export const loginUser = async (credentials) => {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(credentials),
  });

  return handleResponse(res, 'Login failed');
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
  const json = await handleResponse(res, 'Failed to fetch weather');
  return json.data;
};

export const fetchWeatherByCity = async (city) => {
  const res = await fetch(
    `/api/weather/city?city=${encodeURIComponent(city)}`
  );

  const json = await handleResponse(res, `Failed to fetch weather for ${city}`);
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
  const json = await handleResponse(res, 'Failed to fetch weather forecast');

  return json.data;
};

// Search History Endpoints
export const fetchSearchHistory = async () => {
  try {
    const res = await fetch('/api/history', {
      headers: getHeaders(true),
    });

    if (!res.ok) return [];

    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
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

// System Status
export const fetchSystemStatus = async () => {
  const res = await fetch('/api/status');
  return handleResponse(res, 'Failed to fetch system status');
};

// Runtime Configuration (local development only)
export const submitRuntimeConfig = async (mongoUri, weatherKey) => {
  if (!import.meta.env.DEV) {
    throw new Error(
      'Configuration changes are disabled on the public website.'
    );
  }

  const res = await fetch('/api/config/test-connection', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ mongoUri, weatherKey }),
  });

  return handleResponse(res, 'Failed to apply configuration');
};
