import { useState, useEffect } from 'react';
import { DEFAULT_CENTER } from '../constants';
import { LocationMarker } from '../types/map';

export const useMapState = (shipment: Shipment | null) => {
  const [mapCenter, setMapCenter] = useState<Location>(DEFAULT_CENTER);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number>(0);
  const [selectedWeatherPoint, setSelectedWeatherPoint] = useState<WeatherPoint | null>(null);
  const [selectedLocationMarker, setSelectedLocationMarker] = useState<LocationMarker | null>(null);
  const [showRoutePanel, setShowRoutePanel] = useState<boolean>(true);
  const [showWeatherCircles, setShowWeatherCircles] = useState<boolean>(true);
  const [showControlPanel, setShowControlPanel] = useState<boolean>(false);

  // Update map center when shipment changes
  useEffect(() => {
    if (shipment?.currentLocation?.coordinates) {
      setMapCenter({
        lat: shipment.currentLocation.coordinates[1],
        lng: shipment.currentLocation.coordinates[0]
      });
    }
  }, [shipment]);

  // Reset selections when shipment changes
  useEffect(() => {
    setSelectedRouteIndex(0);
    setSelectedWeatherPoint(null);
    setSelectedLocationMarker(null);
  }, [shipment]);

  return {
    mapCenter,
    selectedRouteIndex,
    selectedWeatherPoint,
    selectedLocationMarker,
    showRoutePanel,
    showWeatherCircles,
    showControlPanel,
    setMapCenter,
    setSelectedRouteIndex,
    setSelectedWeatherPoint,
    setSelectedLocationMarker,
    setShowRoutePanel,
    setShowWeatherCircles,
    setShowControlPanel
  };
};