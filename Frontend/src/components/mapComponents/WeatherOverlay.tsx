// WeatherOverlay.tsx
import React from 'react';
import { Circle, InfoWindowF } from '@react-google-maps/api';
import { Thermometer, AlertTriangle } from 'lucide-react';
import AdvancedMarker from './AdvanceMarker';

interface WeatherOverlayProps {
  weatherPoints: WeatherPoint[];
  selectedRouteIndex: number;
  showWeatherCircles: boolean;
  selectedWeatherPoint: WeatherPoint | null;
  mapRef: React.RefObject<google.maps.Map>;
  onWeatherPointClick: (point: WeatherPoint) => void;
  onWeatherPointClose: () => void;
}

const getRiskColor = (risk: string): string => {
  switch (risk?.toLowerCase()) {
    case 'high': return '#ef4444';
    case 'medium': return '#f59e0b';
    case 'low': return '#10b981';
    default: return '#6b7280';
  }
};

const getWeatherIcon = (condition: string): string => {
  switch (condition?.toLowerCase()) {
    case 'rain': return '🌧️';
    case 'clouds': return '☁️';
    case 'clear': return '☀️';
    case 'snow': return '❄️';
    case 'thunderstorm': return '⛈️';
    default: return '🌤️';
  }
};

export const WeatherOverlay: React.FC<WeatherOverlayProps> = ({
  weatherPoints,
  selectedRouteIndex,
  showWeatherCircles,
  selectedWeatherPoint,
  mapRef,
  onWeatherPointClick,
  onWeatherPointClose,
}) => {
  return (
    <>
      {/* Weather Risk Circles */}
      {showWeatherCircles && weatherPoints.map((weather, index) => (
        <Circle
          key={`circle-${selectedRouteIndex}-${index}`}
          center={{ lat: weather.lat, lng: weather.lon }}
          radius={5000}
          options={{
            fillColor: getRiskColor(weather.risk),
            fillOpacity: 0.2,
            strokeColor: getRiskColor(weather.risk),
            strokeOpacity: 0.8,
            strokeWeight: 2,
            clickable: true,
          }}
          onClick={() => onWeatherPointClick(weather)}
        />
      ))}

      {/* Weather Point Markers */}
      {weatherPoints.map((weather, index) => (
        <AdvancedMarker
          map={mapRef.current}
          key={`weather-${selectedRouteIndex}-${index}`}
          position={{ lat: weather.lat, lng: weather.lon }}
          svgHTML={`
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="14" cy="14" r="12" fill="${getRiskColor(weather.risk)}" stroke="white" stroke-width="2"/>
              <text x="14" y="18" text-anchor="middle" fill="white" font-size="14">${getWeatherIcon(weather.condition)}</text>
            </svg>
          `}
          onClick={() => onWeatherPointClick(weather)}
        />
      ))}

      {/* Weather Info Window */}
      {selectedWeatherPoint && (
        <InfoWindowF
          position={{ lat: selectedWeatherPoint.lat, lng: selectedWeatherPoint.lon }}
          onCloseClick={onWeatherPointClose}
        >
          <div className="p-4 max-w-sm">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Thermometer size={16} className="mr-2 text-blue-600" />
              {selectedWeatherPoint.city}
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Temperature:</span>
                <span className="font-medium">{selectedWeatherPoint.temperature}°C</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Condition:</span>
                <span className="font-medium flex items-center">
                  {getWeatherIcon(selectedWeatherPoint.condition)}
                  <span className="ml-1">{selectedWeatherPoint.condition}</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Risk Level:</span>
                <span
                  className={`font-medium px-2 py-1 rounded-full text-xs flex items-center ${
                    selectedWeatherPoint.risk === 'High' ? 'bg-red-100 text-red-800' :
                    selectedWeatherPoint.risk === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}
                >
                  {selectedWeatherPoint.risk === 'High' && <AlertTriangle size={12} className="mr-1" />}
                  {selectedWeatherPoint.risk}
                </span>
              </div>
              <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                <p className="text-gray-700 text-xs leading-relaxed">
                  {selectedWeatherPoint.description}
                </p>
              </div>
            </div>
          </div>
        </InfoWindowF>
      )}
    </>
  );
};