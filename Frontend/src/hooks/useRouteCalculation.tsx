import { useState, useCallback, useRef, useMemo } from 'react';
import { RouteInfo } from '../types/map';

interface RouteCalculationError {
  message: string;
  code?: string;
}

export const useRouteCalculation = (
  shipment: Shipment | null,
  mapRef: React.MutableRefObject<google.maps.Map | null>
) => {
  const [routeInfos, setRouteInfos] = useState<RouteInfo[]>([]);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [error, setError] = useState<RouteCalculationError | null>(null);
  const directionsServiceRef = useRef<google.maps.DirectionsService | null>(null);

  // Memoize shipment coordinates to prevent unnecessary recalculations
  const shipmentCoordinates = useMemo(() => {
    if (!shipment) return null;
    return {
      origin: {
        lat: shipment.currentLocation.coordinates[1],
        lng: shipment.currentLocation.coordinates[0]
      },
      destination: {
        lat: shipment.walmartStoreId.location.coordinates[1],
        lng: shipment.walmartStoreId.location.coordinates[0]
      }
    };
  }, [shipment?.currentLocation.coordinates, shipment?.walmartStoreId.location.coordinates]);

  // Algorithm to sample points along a route based on distance
  const sampleRoutePoints = useCallback((route: google.maps.DirectionsRoute, maxPoints: number = 100): [number, number][] => {
    if (!route || !route.legs) return [];

    const allPoints: [number, number][] = [];
    const totalDistance = route.legs.reduce((sum, leg) => sum + leg.distance.value, 0);

    let samplingInterval: number;
    if (totalDistance < 50000) {
      samplingInterval = 10000;
    } else if (totalDistance < 200000) {
      samplingInterval = 20000;
    } else if (totalDistance < 500000) {
      samplingInterval = 50000;
    } else {
      samplingInterval = 200000;
    }

    let currentDistance = 0;
    let nextSampleDistance = 0;

    for (const leg of route.legs) {
      for (const step of leg.steps) {
        const stepDistance = step.distance.value;

        while (nextSampleDistance <= currentDistance + stepDistance) {
          if (nextSampleDistance > 0) {
            const ratio = (nextSampleDistance - currentDistance) / stepDistance;
            const startLat = step.start_location.lat();
            const startLng = step.start_location.lng();
            const endLat = step.end_location.lat();
            const endLng = step.end_location.lng();

            const interpolatedLat = startLat + (endLat - startLat) * ratio;
            const interpolatedLng = startLng + (endLng - startLng) * ratio;

            allPoints.push([interpolatedLat, interpolatedLng]);
          }
          nextSampleDistance += samplingInterval;
        }
        currentDistance += stepDistance;
      }
    }

    const endPoint = route.legs[route.legs.length - 1].end_location;
    allPoints.push([endPoint.lat(), endPoint.lng()]);

    const uniquePoints = allPoints.filter((point, index, arr) =>
      index === 0 ||
      index === arr.length - 1 ||
      (Math.abs(point[0] - arr[index - 1][0]) > 0.01 || Math.abs(point[1] - arr[index - 1][1]) > 0.01)
    );

    return uniquePoints.slice(0, maxPoints);
  }, []);

  // Mock eco-friendly data generator
  const generateMockEcoDetails = useCallback((route: google.maps.DirectionsRoute): EcoDetails => {
    const distance = route.legs[0].distance.value / 1000; // Convert to km

    return {
      carbonFootprint: Math.round(distance * 0.2 * 100) / 100, // Rough estimate
      fuelEfficiency: Math.round((distance / (distance * 0.08)) * 100) / 100, // Mock calculation
      airQualityImpact: distance > 100 ? 'High' : distance > 50 ? 'Medium' : 'Low',
      recommendations: [
        'Consider consolidating shipments',
        'Use hybrid vehicles for shorter routes',
        'Optimize route timing to avoid traffic',
        'Consider rail transport for longer distances'
      ]
    };
  }, []);

  // Fetch weather data for route points
  const fetchWeatherData = useCallback(async (points: [number, number][]): Promise<WeatherPoint[]> => {
    if (!points || points.length === 0) return [];

    try {
      const response = await fetch('http://localhost:3000/api/v1/weather/get_route_weather', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ points }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          return data.data;
        }
      }
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
    return [];
  }, []);

  const calculateRoutes = useCallback(async (): Promise<void> => {
    if (!shipmentCoordinates) {
      setError({ message: 'No shipment data available' });
      return;
    }

    setIsCalculating(true);
    setError(null);

    try {
      const directionsService = new window.google.maps.DirectionsService();
      directionsServiceRef.current = directionsService;

      const origin = new window.google.maps.LatLng(
        shipmentCoordinates.origin.lat,
        shipmentCoordinates.origin.lng
      );

      const destination = new window.google.maps.LatLng(
        shipmentCoordinates.destination.lat,
        shipmentCoordinates.destination.lng
      );

      const request: google.maps.DirectionsRequest = {
        origin,
        destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: true,
        avoidHighways: false,
        avoidTolls: false,
      };

      return new Promise((resolve, reject) => {
        directionsService.route(request, async (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK && result) {
            const routes = result.routes;
            const routeInfosWithWeather: RouteInfo[] = [];

            // Process each route
            for (let i = 0; i < routes.length; i++) {
              const route = routes[i];
              const sampledPoints = sampleRoutePoints(route);
              const weatherPoints = await fetchWeatherData(sampledPoints);

              // Mock eco-friendly detection - assume every second route is eco-friendly
              const isEcoFriendly = i % 2 === 1;

              routeInfosWithWeather.push({
                route,
                index: i,
                isEcoFriendly,
                weatherPoints,
                ecoDetails: isEcoFriendly ? generateMockEcoDetails(route) : undefined
              });
            }

            setRouteInfos(routeInfosWithWeather);
            setIsCalculating(false);
            resolve();
          } else {
            const errorMessage = `Failed to calculate routes: ${status}`;
            setError({ message: errorMessage, code: status });
            setIsCalculating(false);
            reject(new Error(errorMessage));
          }
        });
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError({ message: errorMessage });
      setIsCalculating(false);
      throw err;
    }
  }, [shipmentCoordinates, sampleRoutePoints, fetchWeatherData, generateMockEcoDetails]);

  return {
    routeInfos,
    isCalculating,
    error,
    calculateRoutes
  };
};