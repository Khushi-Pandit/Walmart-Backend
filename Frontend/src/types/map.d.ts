
export interface WeatherPoint {
  lat: number;
  lon: number;
  city: string;
  temperature: number;
  condition: string;
  description: string;
  risk: 'High' | 'Medium' | 'Low';
}

export interface EcoDetails {
  carbonFootprint: number;
  fuelEfficiency: number;
  airQualityImpact: 'High' | 'Medium' | 'Low';
  recommendations: string[];
}

export interface RouteInfo {
  route: google.maps.DirectionsRoute;
  index: number;
  isEcoFriendly: boolean;
  weatherPoints: WeatherPoint[];
  ecoDetails?: EcoDetails;
}

export interface WeatherSummary {
  high: number;
  medium: number;
  low: number;
  total: number;
}

export interface WeatherApiResponse {
  success: boolean;
  data: WeatherPoint[];
  error?: string;
}

export interface LocationMarker {
  type: 'origin' | 'current' | 'destination';
  location: Location;
  address: string;
}

export interface WeatherMapProps {
  shipment: Shipment | null;
  onWeatherSummary?: (summary: WeatherSummary) => void;
  isFullscreen?: boolean;
  onFullscreenChange?: (fullscreen: boolean) => void;
}

export interface MapError {
  type: 'GOOGLE_MAPS_LOAD_ERROR' | 'ROUTE_CALCULATION_ERROR' | 'WEATHER_DATA_ERROR' | 'GENERAL_ERROR';
  message: string;
  details?: string;
}

export interface MapState {
  mapCenter: Location;
  selectedRouteIndex: number;
  selectedWeatherPoint: WeatherPoint | null;
  selectedLocationMarker: LocationMarker | null;
  showRoutePanel: boolean;
  showWeatherCircles: boolean;
  showControlPanel: boolean;
}