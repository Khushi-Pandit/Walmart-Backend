// LoadingSpinner.tsx
import React from 'react';
import { MapPin } from 'lucide-react';

export const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl">
    <div className="text-center">
      <div className="relative">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <MapPin size={20} className="text-blue-600" />
        </div>
      </div>
      <p className="text-gray-700 font-medium">Loading Interactive Map...</p>
      <p className="text-sm text-gray-500 mt-1">Initializing Google Maps API</p>
    </div>
  </div>
);