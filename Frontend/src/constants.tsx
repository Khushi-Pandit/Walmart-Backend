export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export const libraries: ("places" | "marker")[] = ['places', 'marker'];

export const mapOptions: google.maps.MapOptions = {
  mapId: "YOUR_MAP_ID_HERE",
  disableDefaultUI: true,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
  gestureHandling: 'cooperative',
};

export const API_ENDPOINTS = {
  WEATHER: 'http://localhost:3000/api/v1/weather/get_route_weather',
} as const;

export const COLORS = {
  RISK: {
    HIGH: '#ef4444',
    MEDIUM: '#f59e0b',
    LOW: '#10b981',
    DEFAULT: '#6b7280'
  },
  ROUTE: {
    ECO_SELECTED: '#10b981',
    ECO_UNSELECTED: '#34d399',
    NORMAL_SELECTED: '#3b82f6',
    NORMAL_UNSELECTED: '#60a5fa'
  },
  MARKERS: {
    ORIGIN: '#8b5cf6',
    CURRENT: '#3b82f6',
    DESTINATION: '#10b981'
  }
} as const;

export const WEATHER_ICONS = {
  RAIN: '🌧️',
  CLOUDS: '☁️',
  CLEAR: '☀️',
  SNOW: '❄️',
  THUNDERSTORM: '⛈️',
  DEFAULT: '🌤️'
} as const;

export const LOCATION_ICONS = {
  ORIGIN: '🏭',
  CURRENT: '📦',
  DESTINATION: '🏪'
} as const;

export const SAMPLING_CONFIG = {
  SMALL_ROUTE: { threshold: 50000, interval: 10000 },
  MEDIUM_ROUTE: { threshold: 200000, interval: 20000 },
  LARGE_ROUTE: { threshold: 500000, interval: 50000 },
  XLARGE_ROUTE: { threshold: Infinity, interval: 200000 }
} as const;

export const DEFAULT_CENTER = { lat: 28.6139, lng: 77.2090 };

export const MAX_WEATHER_POINTS = 100;

export const MARKER_SIZES = {
  LOCATION: 40,
  WEATHER: 28
} as const;