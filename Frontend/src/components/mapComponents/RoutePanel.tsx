// RoutePanel.tsx
import React from 'react';
import { Route, X, Navigation, Clock, Leaf, Zap } from 'lucide-react';
import { RouteInfo } from '../../types/map';

interface RoutePanelProps {
  isFullscreen: boolean;
  routeInfos: RouteInfo[];
  selectedRouteIndex: number;
  showRoutePanel: boolean;
  onRouteChange: (index: number) => void;
  onTogglePanel: () => void;
}

export const RoutePanel: React.FC<RoutePanelProps> = ({
  isFullscreen,
  routeInfos,
  selectedRouteIndex,
  showRoutePanel,
  onRouteChange,
  onTogglePanel,
}) => {
  if (!showRoutePanel || routeInfos.length <= 1) return null;

  return (
    <div className={`absolute ${isFullscreen ? 'top-6 left-6' : 'top-4 left-4'} bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-200 overflow-hidden max-w-sm`}>
      <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 text-sm flex items-center">
            <Route size={16} className="mr-2 text-blue-600" />
            Route Options
          </h3>
          <button
            onClick={onTogglePanel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>
      <div className="p-3 space-y-2 max-h-60 overflow-y-auto">
        {routeInfos.map((routeInfo, index) => (
          <button
            key={index}
            onClick={() => onRouteChange(index)}
            className={`w-full text-left p-3 rounded-lg border-2 transition-all duration-200 ${
              selectedRouteIndex === index
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-sm text-gray-900">
                  Route {index + 1}
                </span>
                {routeInfo.isEcoFriendly && (
                  <div className="flex items-center space-x-1 bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    <Leaf size={10} />
                    <span className="text-xs">Eco</span>
                  </div>
                )}
              </div>
              {index === selectedRouteIndex && (
                <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                  Active
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4 text-xs text-gray-600">
              <div className="flex items-center">
                <Navigation size={12} className="mr-1" />
                {routeInfo.route.legs[0].distance.text}
              </div>
              <div className="flex items-center">
                <Clock size={12} className="mr-1" />
                {routeInfo.route.legs[0].duration.text}
              </div>
            </div>
            {routeInfo.ecoDetails && (
              <div className="mt-2 p-2 bg-green-50 rounded-md">
                <div className="flex items-center space-x-2 text-xs text-green-800">
                  <Zap size={10} />
                  <span>{routeInfo.ecoDetails.carbonFootprint}kg CO₂</span>
                </div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};