// MapControls.tsx
import React from 'react';
import { Maximize2, Minimize2, Settings } from 'lucide-react';

interface MapControlsProps {
  isFullscreen: boolean;
  showControlPanel: boolean;
  showWeatherCircles: boolean;
  showRoutePanel: boolean;
  isLoadingWeather: boolean;
  onToggleFullscreen: () => void;
  onToggleControlPanel: () => void;
  onToggleWeatherCircles: (show: boolean) => void;
  onToggleRoutePanel: (show: boolean) => void;
}

export const MapControls: React.FC<MapControlsProps> = ({
  isFullscreen,
  showControlPanel,
  showWeatherCircles,
  showRoutePanel,
  isLoadingWeather,
  onToggleFullscreen,
  onToggleControlPanel,
  onToggleWeatherCircles,
  onToggleRoutePanel,
}) => (
  <div className={`absolute ${isFullscreen ? 'top-6 right-6' : 'top-4 right-4'} flex flex-col gap-2`}>
    {/* Fullscreen Toggle */}
    <button
      onClick={onToggleFullscreen}
      className="bg-white/90 backdrop-blur-sm hover:bg-white border border-gray-200 rounded-lg p-2 shadow-lg transition-all duration-200 hover:shadow-xl"
      title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
    >
      {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
    </button>

    {/* Settings Toggle */}
    <button
      onClick={onToggleControlPanel}
      className="bg-white/90 backdrop-blur-sm hover:bg-white border border-gray-200 rounded-lg p-2 shadow-lg transition-all duration-200 hover:shadow-xl"
      title="Map Settings"
    >
      <Settings size={18} />
    </button>

    {/* Control Panel */}
    {showControlPanel && (
      <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-200 p-3 min-w-[200px]">
        <h3 className="font-semibold text-gray-900 mb-3 text-sm">Map Controls</h3>
        <div className="space-y-2">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showWeatherCircles}
              onChange={(e) => onToggleWeatherCircles(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Weather Circles</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showRoutePanel}
              onChange={(e) => onToggleRoutePanel(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Route Panel</span>
          </label>
        </div>
      </div>
    )}

    {/* Loading Indicator */}
    {isLoadingWeather && (
      <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 px-3 py-2 flex items-center space-x-2">
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
        <span className="text-sm text-gray-700">Loading weather...</span>
      </div>
    )}
  </div>
);