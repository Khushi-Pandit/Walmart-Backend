import { useState, useCallback } from 'react';

interface WeatherApiResponse {
  success: boolean;
  data: WeatherPoint[];
}

interface WeatherDataError {
  message: string;
  code?: string;
}

export const useWeatherData = () => {
  const [isLoadingWeather, setIsLoadingWeather] = useState<boolean>(false);
  const [error, setError] = useState<WeatherDataError | null>(null);

  const fetchWeatherData = useCallback(async (points: [number, number][]): Promise<WeatherPoint[]> => {
    if (!points || points.length === 0) return [];

    setIsLoadingWeather(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3000/api/v1/weather/get_route_weather', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ points }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: WeatherApiResponse = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error('Weather API returned unsuccessful response');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch weather data';
      setError({ message: errorMessage });
      console.error('Error fetching weather data:', err);
      return [];
    } finally {
      setIsLoadingWeather(false);
    }
  }, []);

  return {
    isLoadingWeather,
    error,
    fetchWeatherData
  };
};