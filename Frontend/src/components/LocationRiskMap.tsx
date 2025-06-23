import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, AlertTriangle, Building, Factory } from 'lucide-react';
import type { Location } from '../data/mockData';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationRiskMapProps {
  locations: Location[];
}

const createRiskIcon = (riskScore: number, type: 'supplier' | 'store') => {
  let color = '#22c55e'; // Green for low risk
  if (riskScore > 0.7) color = '#ef4444'; // Red for high risk
  else if (riskScore > 0.4) color = '#f97316'; // Orange for medium risk

  const size = type === 'supplier' ? 16 : 14;
  const borderColor = type === 'supplier' ? '#f97316' : '#3b82f6';

  return L.divIcon({
    html: `
      <div style="
        background-color: ${color}; 
        width: ${size}px; 
        height: ${size}px; 
        border-radius: 50%; 
        border: 3px solid ${borderColor}; 
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        animation: pulse 2s infinite;
      "></div>
      <style>
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
      </style>
    `,
    className: 'custom-risk-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  });
};

const getRiskLabel = (riskScore: number) => {
  if (riskScore > 0.7) return 'High Risk';
  if (riskScore > 0.4) return 'Medium Risk';
  return 'Low Risk';
};

const getRiskColor = (riskScore: number) => {
  if (riskScore > 0.7) return 'text-red-600';
  if (riskScore > 0.4) return 'text-orange-600';
  return 'text-green-600';
};

export const LocationRiskMap: React.FC<LocationRiskMapProps> = ({ locations }) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="px-8 py-6 bg-gradient-to-r from-purple-600 to-purple-700">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <AlertTriangle className="w-7 h-7" />
          Location Risk Assessment
        </h2>
        <p className="text-purple-100 mt-1">Real-time risk monitoring across all supply chain locations</p>
      </div>
      
      <div className="h-96 relative">
        <MapContainer
          center={[39.8283, -98.5795]} // Center of USA
          zoom={4}
          className="h-full w-full"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {locations.map((location) => (
            <Marker
              key={location.id}
              position={[location.lat, location.lng]}
              icon={createRiskIcon(location.riskScore, location.type)}
            >
              <Popup>
                <div className="p-3 min-w-[220px]">
                  <div className="flex items-center gap-2 mb-3">
                    {location.type === 'supplier' ? (
                      <Factory className="w-5 h-5 text-orange-600" />
                    ) : (
                      <Building className="w-5 h-5 text-blue-600" />
                    )}
                    <h3 className="font-semibold text-gray-900 capitalize">
                      {location.type}
                    </h3>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <p className="font-medium text-gray-900">{location.name}</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Risk Score:</span>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${getRiskColor(location.riskScore)}`}>
                          {Math.round(location.riskScore * 100)}%
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          location.riskScore > 0.7 ? 'bg-red-100 text-red-700' :
                          location.riskScore > 0.4 ? 'bg-orange-100 text-orange-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {getRiskLabel(location.riskScore)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500 pt-2 border-t">
                      <div>Lat: {location.lat.toFixed(4)}</div>
                      <div>Lng: {location.lng.toFixed(4)}</div>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Legend */}
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 z-[1000] border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-3 text-sm">Risk Levels</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow-sm"></div>
              <span className="text-xs text-gray-600">Low Risk (≤40%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-orange-500 border-2 border-white shadow-sm"></div>
              <span className="text-xs text-gray-600">Medium Risk (40-70%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow-sm"></div>
              <span className="text-xs text-gray-600">High Risk (&gt;70%)</span>
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-gray-200">
            <h5 className="font-semibold text-gray-900 mb-2 text-xs">Location Types</h5>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gray-400 border-2 border-orange-500 shadow-sm"></div>
                <span className="text-xs text-gray-600">Suppliers</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-400 border-2 border-blue-500 shadow-sm"></div>
                <span className="text-xs text-gray-600">Walmart Stores</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};