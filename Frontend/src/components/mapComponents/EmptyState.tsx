// EmptyState.tsx
import React from 'react';
import { MapPin } from 'lucide-react';

export const EmptyState: React.FC = () => (
  <div className="h-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center">
    <div className="text-center max-w-md">
      <div className="bg-white rounded-full p-6 shadow-lg mb-4 inline-block">
        <MapPin size={32} className="text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Shipment</h3>
      <p className="text-gray-600">Choose a shipment from the list to view its route and weather analysis</p>
    </div>
  </div>
);