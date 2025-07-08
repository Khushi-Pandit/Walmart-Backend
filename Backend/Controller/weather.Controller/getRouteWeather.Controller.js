const axios = require('axios');

const getRouteWeatherController = async (req, res) => {
  try {
    const { points } = req.body;
    if (!points || !Array.isArray(points)) {
      return res.status(400).json({ success: false, message: "Invalid route points" });
    }

    const apiKey = process.env.OPENWEATHER_API_KEY;

    // Build all requests first
    const weatherPromises = points.map(([lat, lon]) => {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
      return axios.get(url).then(({ data }) => ({
        lat,
        lon,
        city: data.name,
        country: data.sys.country,
        timestamp: data.dt,
        condition: data.weather[0].main,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        temperature: data.main.temp,
        feels_like: data.main.feels_like,
        temp_min: data.main.temp_min,
        temp_max: data.main.temp_max,
        pressure: data.main.pressure,
        humidity: data.main.humidity,
        sea_level: data.main.sea_level || null,
        ground_level: data.main.grnd_level || null,
        wind_speed: data.wind.speed,
        wind_gust: data.wind.gust || null,
        wind_deg: data.wind.deg,
        visibility: data.visibility,
        cloud_coverage: data.clouds?.all || null,
        sunrise: data.sys.sunrise,
        sunset: data.sys.sunset,
        risk: getRiskLevel(data.weather[0].main, data.main.temp, data.wind.speed)
      }));
    });

    // Resolve all requests in parallel
    const weatherResults = await Promise.all(weatherPromises);

    return res.status(200).json({
      success: true,
      message: "Weather data fetched for route",
      data: weatherResults
    });

  } catch (error) {
    console.error("Weather fetch failed:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch weather for route",
      error: error.message
    });
  }
};

const getRiskLevel = (condition, temp, wind) => {
  const severeConditions = ["Thunderstorm", "Tornado"];
  const mediumConditions = ["Rain", "Snow", "Fog"];

  if (severeConditions.includes(condition) || wind > 30 || temp > 40) return "High";
  if (mediumConditions.includes(condition) || wind > 20 || temp > 35) return "Medium";
  return "Low";
};

module.exports = getRouteWeatherController;
