import { Router } from 'express';

const router = Router();

// Helper to validate and get OpenWeather API key
const getApiKey = () => {
  const key = process.env.WEATHER_API_KEY;
  if (!key || key.trim() === '' || key === 'your_openweathermap_api_key_here') {
    return null;
  }
  return key.trim();
};

// Format raw current weather into clean frontend structure
const formatCurrentWeather = (data) => {
  return {
    city: data.name,
    country: data.sys?.country || '',
    coord: {
      lat: data.coord.lat,
      lon: data.coord.lon,
    },
    temperature: Math.round(data.main.temp),
    feelsLike: Math.round(data.main.feels_like),
    tempMin: Math.round(data.main.temp_min),
    tempMax: Math.round(data.main.temp_max),
    condition: data.weather[0]?.main || 'Clear',
    description: data.weather[0]?.description || '',
    icon: data.weather[0]?.icon || '01d',
    iconUrl: `https://openweathermap.org/img/wn/${data.weather[0]?.icon || '01d'}@2x.png`,
    humidity: data.main.humidity,
    windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h for intuitive display
    windSpeedMs: data.wind.speed,
    pressure: data.main.pressure,
    visibility: Math.round(data.visibility / 1000), // In km
    sunrise: data.sys.sunrise,
    sunset: data.sys.sunset,
    timestamp: data.dt,
  };
};

// Aggregate 3-hour forecast slots into 5 distinct daily entries
const formatForecast = (forecastData) => {
  const dailyMap = {};

  forecastData.list.forEach((item) => {
    // Extract date YYYY-MM-DD
    const dateKey = item.dt_txt.split(' ')[0];
    if (!dailyMap[dateKey]) {
      dailyMap[dateKey] = {
        temps: [],
        icons: [],
        conditions: [],
        descriptions: [],
        items: [],
      };
    }
    dailyMap[dateKey].temps.push(item.main.temp);
    dailyMap[dateKey].icons.push(item.weather[0]?.icon || '01d');
    dailyMap[dateKey].conditions.push(item.weather[0]?.main || 'Clear');
    dailyMap[dateKey].descriptions.push(item.weather[0]?.description || '');
    dailyMap[dateKey].items.push(item);
  });

  const dailyForecasts = Object.keys(dailyMap).slice(0, 5).map((dateStr) => {
    const dayData = dailyMap[dateStr];
    const minTemp = Math.round(Math.min(...dayData.temps));
    const maxTemp = Math.round(Math.max(...dayData.temps));
    const avgTemp = Math.round(dayData.temps.reduce((a, b) => a + b, 0) / dayData.temps.length);

    // Pick midday or representative icon
    const repIndex = Math.floor(dayData.icons.length / 2);
    const icon = dayData.icons[repIndex] || '01d';
    const condition = dayData.conditions[repIndex] || 'Clear';
    const description = dayData.descriptions[repIndex] || '';

    // Date object
    const dateObj = new Date(dateStr + 'T12:00:00Z');
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
    const fullDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    return {
      date: dateStr,
      dayName,
      fullDate,
      temp: avgTemp,
      tempMin: minTemp,
      tempMax: maxTemp,
      condition,
      description,
      icon,
      iconUrl: `https://openweathermap.org/img/wn/${icon}@2x.png`,
    };
  });

  return {
    city: forecastData.city.name,
    country: forecastData.city.country,
    list: dailyForecasts,
  };
};

// GET /api/weather/current?lat=...&lon=...
router.get('/current', async (req, res) => {
  try {
    const apiKey = getApiKey();
    if (!apiKey) {
      return res.status(503).json({
        success: false,
        message: 'OpenWeatherMap API key is missing. Please add WEATHER_API_KEY to your .env file or server environment.',
        missingApiKey: true,
      });
    }

    const { lat, lon } = req.query;
    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and Longitude query parameters (lat, lon) are required.',
      });
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${encodeURIComponent(
      String(lat)
    )}&lon=${encodeURIComponent(String(lon))}&units=metric&appid=${apiKey}`;

    const apiRes = await fetch(url);
    const data = await apiRes.json();

    if (!apiRes.ok) {
      if (apiRes.status === 401) {
        return res.status(401).json({
          success: false,
          message: 'Invalid OpenWeatherMap API key. Note that newly created keys may take 30-60 minutes to activate.',
        });
      }
      return res.status(apiRes.status).json({
        success: false,
        message: data.message || 'Failed to fetch current weather for coordinates.',
      });
    }

    return res.status(200).json({
      success: true,
      data: formatCurrentWeather(data),
    });
  } catch (error) {
    console.error('Weather coordinates error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Unable to connect to OpenWeatherMap service.',
    });
  }
});

// GET /api/weather/city?city=...
router.get('/city', async (req, res) => {
  try {
    const apiKey = getApiKey();
    if (!apiKey) {
      return res.status(503).json({
        success: false,
        message: 'OpenWeatherMap API key is missing. Please add WEATHER_API_KEY to your .env file or server environment.',
        missingApiKey: true,
      });
    }

    const { city } = req.query;
    if (!city || typeof city !== 'string' || city.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'City name query parameter is required (e.g. ?city=London).',
      });
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
      city.trim()
    )}&units=metric&appid=${apiKey}`;

    const apiRes = await fetch(url);
    const data = await apiRes.json();

    if (!apiRes.ok) {
      if (apiRes.status === 404) {
        return res.status(404).json({
          success: false,
          message: `City "${city}" was not found. Please check the spelling and try again.`,
        });
      }
      if (apiRes.status === 401) {
        return res.status(401).json({
          success: false,
          message: 'Invalid OpenWeatherMap API key. Note that newly created keys may take 30-60 minutes to activate.',
        });
      }
      return res.status(apiRes.status).json({
        success: false,
        message: data.message || `Failed to fetch weather for "${city}".`,
      });
    }

    return res.status(200).json({
      success: true,
      data: formatCurrentWeather(data),
    });
  } catch (error) {
    console.error('Weather city error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Unable to connect to OpenWeatherMap service.',
    });
  }
});

// GET /api/weather/forecast?lat=...&lon=... OR ?city=...
router.get('/forecast', async (req, res) => {
  try {
    const apiKey = getApiKey();
    if (!apiKey) {
      return res.status(503).json({
        success: false,
        message: 'OpenWeatherMap API key is missing. Please add WEATHER_API_KEY to your .env file.',
        missingApiKey: true,
      });
    }

    const { lat, lon, city } = req.query;

    let url = '';
    if (lat && lon) {
      url = `https://api.openweathermap.org/data/2.5/forecast?lat=${encodeURIComponent(
        String(lat)
      )}&lon=${encodeURIComponent(String(lon))}&units=metric&appid=${apiKey}`;
    } else if (city && typeof city === 'string' && city.trim() !== '') {
      url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(
        city.trim()
      )}&units=metric&appid=${apiKey}`;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Provide either latitude/longitude (lat, lon) or city name (city).',
      });
    }

    const apiRes = await fetch(url);
    const data = await apiRes.json();

    if (!apiRes.ok) {
      if (apiRes.status === 404) {
        return res.status(404).json({
          success: false,
          message: 'Forecast location not found.',
        });
      }
      return res.status(apiRes.status).json({
        success: false,
        message: data.message || 'Failed to fetch weather forecast.',
      });
    }

    return res.status(200).json({
      success: true,
      data: formatForecast(data),
    });
  } catch (error) {
    console.error('Forecast error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Unable to connect to OpenWeatherMap forecast service.',
    });
  }
});

export default router;
