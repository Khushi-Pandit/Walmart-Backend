import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleMap, useLoadScript, Marker, DirectionsRenderer, InfoWindow, Circle } from '@react-google-maps/api';

import {
    Maximize2,
    Minimize2,
    MapPin,
    Route,
    X,
    Navigation,
    Clock,
    Thermometer,
    AlertTriangle,
    Settings,
    Leaf,
    Zap
} from 'lucide-react';
import AdvancedMarker from './AdvanceMarker';

interface RouteInfo {
    route: google.maps.DirectionsRoute;
    index: number;
    isEcoFriendly: boolean;
    weatherPoints: WeatherPoint[];
    ecoDetails?: EcoDetails;
}

interface WeatherMapProps {
    shipment: Shipment | null;
    onWeatherSummary?: (summary: WeatherSummary) => void;
}

// Constants
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const libraries: ("places" | "marker")[] = ['places', 'marker'];

const mapContainerStyle: React.CSSProperties = {
    width: '100%',
    height: '100%'
};

const mapOptions: google.maps.MapOptions = {
    mapId: "YOUR_MAP_ID_HERE",
    disableDefaultUI: true,
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: false,
    gestureHandling: 'cooperative',
    styles: [
        {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
        },
        {
            featureType: 'transit',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
        }
    ]
};

// Mock eco-friendly data generator
const generateMockEcoDetails = (route: google.maps.DirectionsRoute): EcoDetails => {
    const distance = route.legs[0].distance.value / 1000; // Convert to km
    const duration = route.legs[0].duration.value / 3600; // Convert to hours

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
};

// Algorithm to sample points along a route based on distance
const sampleRoutePoints = (route: google.maps.DirectionsRoute, maxPoints: number = 10): [number, number][] => {
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
        samplingInterval = 100000;
    }

    let currentDistance = 0;
    let nextSampleDistance = 0;

    const startPoint = route.legs[0].start_location;
    allPoints.push([startPoint.lat(), startPoint.lng()]);

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
};

const getRiskColor = (risk: string): string => {
    switch (risk?.toLowerCase()) {
        case 'high': return '#ef4444';
        case 'medium': return '#f59e0b';
        case 'low': return '#10b981';
        default: return '#6b7280';
    }
};

const getWeatherIcon = (condition: string): string => {
    switch (condition?.toLowerCase()) {
        case 'rain': return '🌧️';
        case 'clouds': return '☁️';
        case 'clear': return '☀️';
        case 'snow': return '❄️';
        case 'thunderstorm': return '⛈️';
        default: return '🌤️';
    }
};

const getRouteColor = (isEcoFriendly: boolean, isSelected: boolean): string => {
    if (isEcoFriendly) {
        return isSelected ? '#10b981' : '#34d399';
    }
    return isSelected ? '#3b82f6' : '#60a5fa';
};

const WeatherMapComponent: React.FC<WeatherMapProps> = ({ shipment, onWeatherSummary }) => {
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
        libraries,
    });

    const mapRef = useRef<google.maps.Map | null>(null);
    const directionsServiceRef = useRef<google.maps.DirectionsService | null>(null);

    const [routeInfos, setRouteInfos] = useState<RouteInfo[]>([]);
    const [selectedRouteIndex, setSelectedRouteIndex] = useState<number>(0);
    const [selectedWeatherPoint, setSelectedWeatherPoint] = useState<WeatherPoint | null>(null);
    const [isLoadingWeather, setIsLoadingWeather] = useState<boolean>(false);
    const [mapCenter, setMapCenter] = useState<Location>({ lat: 28.6139, lng: 77.2090 });
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
    const [showRoutePanel, setShowRoutePanel] = useState<boolean>(true);
    const [showWeatherCircles, setShowWeatherCircles] = useState<boolean>(true);
    const [showControlPanel, setShowControlPanel] = useState<boolean>(false);

    // Fetch weather data for route points
    const fetchWeatherData = useCallback(async (points: [number, number][]): Promise<WeatherPoint[]> => {
        if (!points || points.length === 0) return [];

        setIsLoadingWeather(true);
        try {
            const response = await fetch('http://localhost:3000/api/v1/weather/get_route_weather', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ points }),
            });

            if (response.ok) {
                const data: WeatherApiResponse = await response.json();
                if (data.success) {
                    return data.data;
                }
            }
        } catch (error) {
            console.error('Error fetching weather data:', error);
        } finally {
            setIsLoadingWeather(false);
        }
        return [];
    }, []);

    // Update weather summary
    const updateWeatherSummary = useCallback((allWeatherPoints: WeatherPoint[]) => {
        if (onWeatherSummary) {
            const summary: WeatherSummary = {
                high: allWeatherPoints.filter(w => w.risk === 'High').length,
                medium: allWeatherPoints.filter(w => w.risk === 'Medium').length,
                low: allWeatherPoints.filter(w => w.risk === 'Low').length,
                total: allWeatherPoints.length
            };
            onWeatherSummary(summary);
        }
    }, [onWeatherSummary]);

    // Calculate routes using Google Directions API
    const calculateRoutes = useCallback(async (): Promise<void> => {
        if (!shipment || !isLoaded) return;

        const directionsService = new window.google.maps.DirectionsService();
        directionsServiceRef.current = directionsService;

        const origin = new window.google.maps.LatLng(
            shipment.currentLocation.coordinates[1],
            shipment.currentLocation.coordinates[0]
        );

        const destination = new window.google.maps.LatLng(
            shipment.walmartStoreId.location.coordinates[1],
            shipment.walmartStoreId.location.coordinates[0]
        );

        setMapCenter({
            lat: shipment.currentLocation.coordinates[1],
            lng: shipment.currentLocation.coordinates[0]
        });

        try {
            const request: google.maps.DirectionsRequest = {
                origin,
                destination,
                travelMode: window.google.maps.TravelMode.DRIVING,
                provideRouteAlternatives: true,
                avoidHighways: false,
                avoidTolls: false,
            };

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

                    // Determine best route based on shipment type
                    let bestRouteIndex = 0;
                    if (shipment.isColdChainRequired) {
                        bestRouteIndex = routes.reduce((fastestIndex, route, index) =>
                            route.legs[0].duration.value < routes[fastestIndex].legs[0].duration.value ? index : fastestIndex
                            , 0);
                    } else {
                        bestRouteIndex = routes.reduce((shortestIndex, route, index) =>
                            route.legs[0].distance.value < routes[shortestIndex].legs[0].distance.value ? index : shortestIndex
                            , 0);
                    }

                    setSelectedRouteIndex(bestRouteIndex);

                    // Update weather summary with selected route's weather
                    if (routeInfosWithWeather[bestRouteIndex]) {
                        updateWeatherSummary(routeInfosWithWeather[bestRouteIndex].weatherPoints);
                    }
                }
            });
        } catch (error) {
            console.error('Error calculating routes:', error);
        }
    }, [shipment, isLoaded, fetchWeatherData, updateWeatherSummary]);

    useEffect(() => {
        if (shipment) {
            calculateRoutes();
        }
    }, [shipment, calculateRoutes]);

    const handleRouteChange = (index: number): void => {
        setSelectedRouteIndex(index);
        if (routeInfos[index]) {
            updateWeatherSummary(routeInfos[index].weatherPoints);
        }
    };

    const toggleFullscreen = (): void => {
        setIsFullscreen(!isFullscreen);
    };

    const getCurrentWeatherPoints = (): WeatherPoint[] => {
        return routeInfos[selectedRouteIndex]?.weatherPoints || [];
    };

    const MapControls: React.FC = () => (
        <div className="absolute top-4 right-4 flex flex-col gap-2">
            {/* Fullscreen Toggle */}
            <button
                onClick={toggleFullscreen}
                className="bg-white/90 backdrop-blur-sm hover:bg-white border border-gray-200 rounded-lg p-2 shadow-lg transition-all duration-200 hover:shadow-xl"
                title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
                {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>

            {/* Settings Toggle */}
            <button
                onClick={() => setShowControlPanel(!showControlPanel)}
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
                                onChange={(e) => setShowWeatherCircles(e.target.checked)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">Weather Circles</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={showRoutePanel}
                                onChange={(e) => setShowRoutePanel(e.target.checked)}
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

    const RoutePanel: React.FC = () => (
        showRoutePanel && routeInfos.length > 1 ? (
            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-200 overflow-hidden max-w-sm">
                <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 text-sm flex items-center">
                            <Route size={16} className="mr-2 text-blue-600" />
                            Route Options
                        </h3>
                        <button
                            onClick={() => setShowRoutePanel(false)}
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
                            onClick={() => handleRouteChange(index)}
                            className={`w-full text-left p-3 rounded-lg border-2 transition-all duration-200 ${selectedRouteIndex === index
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
        ) : null
    );

    if (!isLoaded) {
        return (
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
    }

    if (!shipment) {
        return (
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
    }

    const currentWeatherPoints = getCurrentWeatherPoints();
    const selectedRouteInfo = routeInfos[selectedRouteIndex];

    return (
        <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'h-full'}`}>
            <GoogleMap
                ref={mapRef}
                onLoad={(map) => (mapRef.current = map)}
                mapContainerStyle={mapContainerStyle}
                center={mapCenter}
                zoom={isFullscreen ? 9 : 8}
                options={mapOptions}
            >
                {/* Origin Marker */}
                <AdvancedMarker
                    map={mapRef.current}
                    position={{
                        lat: shipment.currentLocation.coordinates[1],
                        lng: shipment.currentLocation.coordinates[0]
                    }}
                    svgHTML={`
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="18" fill="#3b82f6" stroke="white" stroke-width="4"/>
      <text x="20" y="25" text-anchor="middle" fill="white" font-size="18">📦</text>
    </svg>
  `}
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
                <text x="20" y="25" text-anchor="middle" fill="white" font-size="18">🏪</text>
              </svg>
            `}
                />

                {/* Route Renderer */}
                {selectedRouteInfo && (
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
                            suppressInfoWindows: true, // <- Add this line!
                        }}
                    />

                )}

                {/* Weather Risk Circles - Only for selected route */}
                {showWeatherCircles && currentWeatherPoints.map((weather, index) => (
                    <Circle
                        key={`circle-${selectedRouteIndex}-${index}`}
                        center={{ lat: weather.lat, lng: weather.lon }}
                        radius={5000}
                        options={{
                            fillColor: getRiskColor(weather.risk),
                            fillOpacity: 0.2,
                            strokeColor: getRiskColor(weather.risk),
                            strokeOpacity: 0.8,
                            strokeWeight: 2,
                            clickable: true,
                        }}
                        onClick={() => setSelectedWeatherPoint(weather)}
                    />
                ))}

                {/* Weather Point Markers - Only for selected route */}
                {currentWeatherPoints.map((weather, index) => (
                    <AdvancedMarker
                        map={mapRef.current}
                        key={`weather-${selectedRouteIndex}-${index}`}
                        position={{ lat: weather.lat, lng: weather.lon }}
                        svgHTML={`
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="14" cy="14" r="12" fill="${getRiskColor(weather.risk)}" stroke="white" stroke-width="2"/>
                  <text x="14" y="18" text-anchor="middle" fill="white" font-size="14">${getWeatherIcon(weather.condition)}</text>
                </svg>
              `}
                        onClick={() => setSelectedWeatherPoint(weather)}
                    />
                ))}

                {/* Weather Info Window */}
                {selectedWeatherPoint && (
                    <InfoWindow
                        position={{ lat: selectedWeatherPoint.lat, lng: selectedWeatherPoint.lon }}
                        onCloseClick={() => setSelectedWeatherPoint(null)}
                    >
                        <div className="p-4 max-w-sm">
                            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                                <Thermometer size={16} className="mr-2 text-blue-600" />
                                {selectedWeatherPoint.city}
                            </h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Temperature:</span>
                                    <span className="font-medium">{selectedWeatherPoint.temperature}°C</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Condition:</span>
                                    <span className="font-medium flex items-center">
                                        {getWeatherIcon(selectedWeatherPoint.condition)}
                                        <span className="ml-1">{selectedWeatherPoint.condition}</span>
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Risk Level:</span>
                                    <span
                                        className={`font-medium px-2 py-1 rounded-full text-xs flex items-center ${selectedWeatherPoint.risk === 'High' ? 'bg-red-100 text-red-800' :
                                                selectedWeatherPoint.risk === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-green-100 text-green-800'
                                            }`}
                                    >
                                        {selectedWeatherPoint.risk === 'High' && <AlertTriangle size={12} className="mr-1" />}
                                        {selectedWeatherPoint.risk}
                                    </span>
                                </div>
                                <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                                    <p className="text-gray-700 text-xs leading-relaxed">
                                        {selectedWeatherPoint.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </InfoWindow>
                )}
            </GoogleMap>

            <MapControls />
            <RoutePanel />

            {/* Floating Route Toggle (when panel is hidden) */}
            {!showRoutePanel && routeInfos.length > 1 && (
                <button
                    onClick={() => setShowRoutePanel(true)}
                    className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm hover:bg-white border border-gray-200 rounded-lg p-2 shadow-lg transition-all duration-200 hover:shadow-xl"
                    title="Show Route Options"
                >
                    <Route size={18} />
                </button>
            )}
        </div>
    );
};

export default WeatherMapComponent;