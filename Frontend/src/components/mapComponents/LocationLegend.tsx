// LocationLegend.tsx
import React from 'react';

interface LocationLegendProps {
  isFullscreen: boolean;
}

export const LocationLegend: React.FC<LocationLegendProps> = ({ isFullscreen }) => (
  <div className={`absolute ${isFullscreen ? 'bottom-6 left-6' : 'bottom-4 left-4'} bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-3`}>
    <h4 className="font-semibold text-gray-900 mb-2 text-sm">Location Types</h4>
    <div className="space-y-1 text-xs">
      <div className="flex items-center space-x-2">
        <span className="text-lg">🏭</span>
        <span className="text-gray-700">Supplier (Origin)</span>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-lg">📦</span>
        <span className="text-gray-700">Current Location</span>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-lg">🏪</span>
        <span className="text-gray-700">Walmart Store (Destination)</span>
      </div>
    </div>
  </div>
);