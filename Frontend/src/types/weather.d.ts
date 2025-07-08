interface Location {
  lat: number;
  lng: number;
}

interface WeatherPoint {
  lat: number;
  lon: number;
  city: string;
  temperature: number;
  condition: string;
  risk: 'High' | 'Medium' | 'Low';
  description: string;
  humidity?: number;
  windSpeed?: number;
  precipitation?: number;
}

interface EcoDetails {
  carbonFootprint: number; // kg CO2
  fuelEfficiency: number; // km/L
  airQualityImpact: 'High' | 'Medium' | 'Low';
  recommendations: string[];
}

interface WeatherApiResponse {
  success: boolean;
  message: string;
  data: WeatherPoint[];
  eco_details?: EcoDetails; // Optional for now, will be added later
}

interface WeatherSummary {
  high: number;
  medium: number;
  low: number;
  total: number;
}