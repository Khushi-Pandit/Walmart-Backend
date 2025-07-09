// WeatherMapComponent.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleMap, InfoWindowF, useLoadScript } from '@react-google-maps/api';
import { MapPin } from 'lucide-react';

// Components
import { MapControls } from './mapComponents/MapControls';
import { RoutePanel } from './mapComponents/RoutePanel';
import { LocationLegend } from './mapComponents/LocationLegend';
import { RouteRenderer } from './mapComponents/RouteRenderer';
import { WeatherOverlay } from './mapComponents/WeatherOverlay';
import { LoadingSpinner } from './LoadingSpinner';
import { EmptyState } from './mapComponents/EmptyState';
import { ErrorBoundary } from './ErrorBoundary';

// Hooks
import { useRouteCalculation } from '../hooks/useRouteCalculation';
import { useWeatherData } from '../hooks/useWeatherData';
import { useMapState } from '../hooks/useMapState';
import { useFullscreen } from '../hooks/useFullScreen';

// Constants
import { GOOGLE_MAPS_API_KEY, libraries, mapOptions } from '../constants';
import { MapError, WeatherMapProps } from '../types/map';
import AdvancedMarker from './mapComponents/AdvanceMarker';

const WeatherMapComponent: React.FC<WeatherMapProps> = ({ 
  shipment, 
  onWeatherSummary, 
  isFullscreen: externalFullscreen,
  onFullscreenChange 
}) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const [error, setError] = useState<MapError | null>(null);

  // Custom hooks
  const { 
    isFullscreen, 
    toggleFullscreen 
  } = useFullscreen(externalFullscreen, onFullscreenChange);

  const {
    mapCenter,
    selectedRouteIndex,
    selectedWeatherPoint,
    selectedLocationMarker,
    showRoutePanel,
    showWeatherCircles,
    showControlPanel,
    setSelectedRouteIndex,
    setSelectedWeatherPoint,
    setSelectedLocationMarker,
    setShowRoutePanel,
    setShowWeatherCircles,
    setShowControlPanel
  } = useMapState(shipment);

  const {
    routeInfos,
    error: routeError,
    calculateRoutes
  } = useRouteCalculation(shipment, mapRef);

  const {
    isLoadingWeather,
    error: weatherError
  } = useWeatherData();

  // Handle errors
  useEffect(() => {
    if (loadError) {
      setError({
        type: 'GOOGLE_MAPS_LOAD_ERROR',
        message: 'Failed to load Google Maps API',
        details: loadError.message
      });
    } else if (routeError) {
      setError({
        type: 'ROUTE_CALCULATION_ERROR',
        message: 'Failed to calculate routes',
        details: routeError.message
      });
    } else if (weatherError) {
      setError({
        type: 'WEATHER_DATA_ERROR',
        message: 'Failed to fetch weather data',
        details: weatherError.message
      });
    } else {
      setError(null);
    }
  }, [loadError, routeError, weatherError]);

  // Calculate routes when shipment changes
  useEffect(() => {
  if (shipment && isLoaded) {
    calculateRoutes()
      .then(() => {
        // Update weather summary if available
        if (routeInfos[selectedRouteIndex] && onWeatherSummary) {
          const weatherPoints = routeInfos[selectedRouteIndex].weatherPoints;
          onWeatherSummary({
            high: weatherPoints.filter(w => w.risk === 'High').length,
            medium: weatherPoints.filter(w => w.risk === 'Medium').length,
            low: weatherPoints.filter(w => w.risk === 'Low').length,
            total: weatherPoints.length
          });
        }
      })
      .catch((err) => {
        console.error('Route calculation failed:', err);
      });
  }
}, [shipment?._id, isLoaded]);

useEffect(() => {
  if (routeInfos[selectedRouteIndex] && onWeatherSummary) {
    const weatherPoints = routeInfos[selectedRouteIndex].weatherPoints;
    onWeatherSummary({
      high: weatherPoints.filter(w => w.risk === 'High').length,
      medium: weatherPoints.filter(w => w.risk === 'Medium').length,
      low: weatherPoints.filter(w => w.risk === 'Low').length,
      total: weatherPoints.length
    });
  }
}, [routeInfos, selectedRouteIndex, onWeatherSummary]);

  // Fit map bounds when shipment changes
  useEffect(() => {
    if (!shipment || !mapRef.current || !isLoaded) return;

    try {
      const bounds = new google.maps.LatLngBounds();
      
      bounds.extend({
        lat: shipment.supplierId.location.coordinates[1],
        lng: shipment.supplierId.location.coordinates[0],
      });
      bounds.extend({
        lat: shipment.currentLocation.coordinates[1],
        lng: shipment.currentLocation.coordinates[0],
      });
      bounds.extend({
        lat: shipment.walmartStoreId.location.coordinates[1],
        lng: shipment.walmartStoreId.location.coordinates[0],
      });

      const padding = 60;

      setTimeout(() => {
        mapRef.current?.fitBounds(bounds, padding);
      }, 100);
    } catch (err) {
      console.error('Failed to fit map bounds:', err);
    }
  }, [shipment, isLoaded]);

  const handleRouteChange = useCallback((index: number): void => {
    try {
      setSelectedRouteIndex(index);
      if (routeInfos[index] && onWeatherSummary) {
        const weatherPoints = routeInfos[index].weatherPoints;
        onWeatherSummary({
          high: weatherPoints.filter(w => w.risk === 'High').length,
          medium: weatherPoints.filter(w => w.risk === 'Medium').length,
          low: weatherPoints.filter(w => w.risk === 'Low').length,
          total: weatherPoints.length
        });
      }
    } catch (err) {
      console.error('Failed to change route:', err);
    }
  }, [routeInfos, onWeatherSummary, setSelectedRouteIndex]);

  const getMapContainerStyle = useCallback((isFullscreen: boolean): React.CSSProperties => ({
    width: '100%',
    height: isFullscreen ? '100vh' : '100%',
    position: 'relative'
  }), []);

  // Loading state
  if (!isLoaded) {
    return <LoadingSpinner />;
  }

  // Error state
  if (error) {
    return (
      <div className="h-full bg-red-50 rounded-xl flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-100 rounded-full p-4 mb-4 inline-block">
            <MapPin size={32} className="text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-red-900 mb-2">{error.message}</h3>
          <p className="text-red-700 text-sm">{error.details}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!shipment) {
    return <EmptyState />;
  }

  const containerClassName = isFullscreen
    ? 'fixed inset-0 z-50 bg-white'
    : 'relative h-full';

  const currentWeatherPoints = routeInfos[selectedRouteIndex]?.weatherPoints || [];
  const selectedRouteInfo = routeInfos[selectedRouteIndex];

  return (
    <ErrorBoundary>
      <div className={containerClassName}>
        <GoogleMap
          ref={mapRef}
          onLoad={(map) => (mapRef.current = map)}
          mapContainerStyle={getMapContainerStyle(isFullscreen)}
          center={mapCenter}
          zoom={isFullscreen ? 9 : 8}
          options={mapOptions}
        >
          {/* Supplier Marker */}
      <AdvancedMarker
        map={mapRef.current}
        position={{
          lat: shipment.supplierId.location.coordinates[1],
          lng: shipment.supplierId.location.coordinates[0]
        }}
        svgHTML={`
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="18" fill="#8b5cf6" stroke="white" stroke-width="4"/>
            <text x="20" y="25" text-anchor="middle" fill="white" font-size="16">🏭</text>
          </svg>
        `}
        onClick={() => setSelectedLocationMarker({
          type: 'origin',
          location: shipment.supplierId.location,
          address: shipment.supplierId.address
        })}
      />

      {/* Current Location Marker */}
      <AdvancedMarker
        map={mapRef.current}
        position={{
          lat: shipment.currentLocation.coordinates[1],
          lng: shipment.currentLocation.coordinates[0]
        }}
        svgHTML={`
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="18" fill="#3b82f6" stroke="white" stroke-width="4"/>
            <text x="20" y="25" text-anchor="middle" fill="white" font-size="16">📦</text>
          </svg>
        `}
        onClick={() => setSelectedLocationMarker({
          type: 'current',
          location: shipment.currentLocation,
          address: 'Current Location'
        })}
      />

      {/* Destination Marker */}
      <AdvancedMarker
        map={mapRef.current}
        position={{
          lat: shipment.walmartStoreId.location.coordinates[1],
          lng: shipment.walmartStoreId.location.coordinates[0]
        }}
        svgHTML={`
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="18" fill="#10b981" stroke="white" stroke-width="4"/>
            <text x="20" y="25" text-anchor="middle" fill="white" font-size="16">🏪</text>
          </svg>
        `}
        onClick={() => setSelectedLocationMarker({
          type: 'destination',
          location: shipment.walmartStoreId.location,
          address: shipment.walmartStoreId.name
        })}
      />

      {/* Location Info Window */}
      {selectedLocationMarker && (
        <InfoWindowF
          position={{
            lat: selectedLocationMarker.location.coordinates[1],
            lng: selectedLocationMarker.location.coordinates[0]
          }}
          onCloseClick={() => setSelectedLocationMarker(null)}
          options={{
            disableAutoPan: true,
            pixelOffset: new google.maps.Size(0, -10),
          }}
        >
          <div className="p-4 max-w-sm">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <MapPin size={16} className="mr-2 text-blue-600" />
              {selectedLocationMarker.type === 'origin' ? 'Supplier Location' :
                selectedLocationMarker.type === 'current' ? 'Current Location' :
                'Destination Store'}
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-start justify-between">
                <span className="text-gray-600">Address:</span>
                <span className="font-medium text-right ml-2 flex-1">
                  {selectedLocationMarker.address}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Coordinates:</span>
                <span className="font-medium text-xs text-gray-500">
                  {selectedLocationMarker.location.coordinates[1].toFixed(4)}, {selectedLocationMarker.location.coordinates[0].toFixed(4)}
                </span>
              </div>
              {selectedLocationMarker.type === 'origin' && (
                <div className="mt-3 p-2 bg-purple-50 rounded-lg">
                  <p className="text-purple-700 text-xs leading-relaxed">
                    <strong>Supplier:</strong> {shipment.supplierId.name}
                  </p>
                </div>
              )}
              {selectedLocationMarker.type === 'current' && (
                <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                  <p className="text-blue-700 text-xs leading-relaxed">
                    <strong>Status:</strong> {shipment.status} • Current shipment location
                  </p>
                </div>
              )}
              {selectedLocationMarker.type === 'destination' && (
                <div className="mt-3 p-2 bg-green-50 rounded-lg">
                  <p className="text-green-700 text-xs leading-relaxed">
                    <strong>Store:</strong> {shipment.walmartStoreId.name}
                  </p>
                </div>
              )}
            </div>
          </div>
        </InfoWindowF>
      )}

          <RouteRenderer
            selectedRouteInfo={selectedRouteInfo}
          />

          <WeatherOverlay
            weatherPoints={currentWeatherPoints}
            selectedRouteIndex={selectedRouteIndex}
            showWeatherCircles={showWeatherCircles}
            selectedWeatherPoint={selectedWeatherPoint}
            mapRef={mapRef}
            onWeatherPointClick={setSelectedWeatherPoint}
            onWeatherPointClose={() => setSelectedWeatherPoint(null)}
          />
        </GoogleMap>

        <MapControls
          isFullscreen={isFullscreen}
          showControlPanel={showControlPanel}
          showWeatherCircles={showWeatherCircles}
          showRoutePanel={showRoutePanel}
          isLoadingWeather={isLoadingWeather}
          onToggleFullscreen={toggleFullscreen}
          onToggleControlPanel={() => setShowControlPanel(!showControlPanel)}
          onToggleWeatherCircles={setShowWeatherCircles}
          onToggleRoutePanel={setShowRoutePanel}
        />

        <RoutePanel
          isFullscreen={isFullscreen}
          routeInfos={routeInfos}
          selectedRouteIndex={selectedRouteIndex}
          showRoutePanel={showRoutePanel}
          onRouteChange={handleRouteChange}
          onTogglePanel={() => setShowRoutePanel(!showRoutePanel)}
        />

        <LocationLegend isFullscreen={isFullscreen} />
      </div>
    </ErrorBoundary>
  );
};

export default WeatherMapComponent;