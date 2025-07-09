// RouteRenderer.tsx
import React from 'react';
import { DirectionsRenderer } from '@react-google-maps/api';
import { RouteInfo } from '../../types/map';

interface RouteRendererProps {
  selectedRouteInfo: RouteInfo | null;
}

const getRouteColor = (isEcoFriendly: boolean, isSelected: boolean): string => {
  if (isEcoFriendly) {
    return isSelected ? '#10b981' : '#34d399';
  }
  return isSelected ? '#3b82f6' : '#60a5fa';
};

export const RouteRenderer: React.FC<RouteRendererProps> = ({ selectedRouteInfo }) => {
  if (!selectedRouteInfo) return null;

  return (
    <DirectionsRenderer
      directions={{
        routes: [selectedRouteInfo.route],
        request: { origin: null, destination: null }
      }}
      routeIndex={0}
      options={{
        polylineOptions: {
          strokeColor: getRouteColor(selectedRouteInfo.isEcoFriendly, true),
          strokeOpacity: 0.8,
          strokeWeight: 5,
        },
        suppressMarkers: true,
        suppressInfoWindows: true,
      }}
    />
  );
};