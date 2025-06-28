import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';

const presets: Preset[] = [
  {
    name: 'Walmart 1 → Walmart 2',
    source: [36.15398, -95.99277] as [number, number],
    destination: [35.46756, -97.51643] as [number, number],
    color: 'blue',
  },
  {
    name: 'Walmart 3 → Walmart 4',
    source: [34.74648, -92.28959] as [number, number],
    destination: [32.77657, -96.797] as [number, number],
    color: 'green',
  },
  {
    name: 'Walmart 5 → Walmart 6',
    source: [29.76043, -95.3698] as [number, number],
    destination: [30.26715, -97.74306] as [number, number],
    color: 'red',
  },
  {
    name: 'Walmart 7 → Walmart 8',
    source: [33.44838, -112.07404] as [number, number],
    destination: [36.16994, -115.13983] as [number, number],
    color: 'orange',
  },
  {
    name: 'Walmart 9 → Walmart 10',
    source: [40.76078, -111.89105] as [number, number],
    destination: [39.73924, -104.99025] as [number, number],
    color: 'purple',
  },
  {
    name: 'Walmart 11 → Walmart 12',
    source: [38.25266, -85.75845] as [number, number],
    destination: [39.7684, -86.1581] as [number, number],
    color: 'teal',
  },
  {
    name: 'Walmart 13 → Walmart 14',
    source: [39.96118, -82.99879] as [number, number],
    destination: [41.49932, -81.69436] as [number, number],
    color: 'cyan',
  },
  {
    name: 'Walmart 15 → Walmart 16',
    source: [33.749, -84.38798] as [number, number],
    destination: [30.33218, -81.65565] as [number, number],
    color: 'yellow',
  },
  {
    name: 'Walmart 17 → Walmart 18',
    source: [40.71278, -74.00597] as [number, number],
    destination: [42.36008, -71.05888] as [number, number],
    color: 'lime',
  },
  {
    name: 'Walmart 19 → Walmart 20',
    source: [34.05223, -118.24368] as [number, number],
    destination: [37.77493, -122.41942] as [number, number],
    color: 'pink',
  },
];

function getAirDistance(
  [lat1, lon1]: [number, number],
  [lat2, lon2]: [number, number]
): number {
  const toRad = (deg: number) => deg * Math.PI / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 0) {
      map.fitBounds(positions);
    }
  }, [positions, map]);
  return null;
}

type Preset = {
  name: string;
  source: [number, number];
  destination: [number, number];
  color: string;
};

type RouteData = {
  coords: [number, number][];
  color: string;
  source: [number, number];
  destination: [number, number];
};

type RouteDetails = Preset & {
  roadDistance: string;
  etaRoad: string;
  airDistance: string;
  etaAir: string;
};

export default function RouteMap() {
  const [selectedRoutes, setSelectedRoutes] = useState<Preset[]>([]);
  const [routeData, setRouteData] = useState<RouteData[]>([]);
  const [selectedRouteDetails, setSelectedRouteDetails] = useState<RouteDetails | null>(null);

  useEffect(() => {
    const fetchRoutes = async () => {
      const apiKey = import.meta.env.VITE_GEOAPIFY_API_KEY;
      const allRoutes = [];
      for (const preset of selectedRoutes) {
        try {
          const url = `https://api.geoapify.com/v1/routing?waypoints=${preset.source.join(',')}|${preset.destination.join(',')}&mode=drive&apiKey=${apiKey}`;
          const response = await axios.get(url);
          const geometry = response.data.features[0].geometry;
          let coords = [];
          if (geometry.type === 'LineString') {
            coords = geometry.coordinates.map((c: [number, number]) => [c[1], c[0]] as [number, number]);
          } else if (geometry.type === 'MultiLineString') {
            coords = (geometry.coordinates as [number, number][][])
              .flat()
              .map((c: [number, number]) => [c[1], c[0]] as [number, number]);
          }
          allRoutes.push({ coords, color: preset.color, source: preset.source, destination: preset.destination });
        } catch (error) {
          console.error('Error fetching route:', error);
        }
      }
      setRouteData(allRoutes);
    };
    if (selectedRoutes.length > 0) fetchRoutes();
  }, [selectedRoutes]);

  const handleRouteToggle = async (preset: Preset) => {
    const isSelected = selectedRoutes.includes(preset);
    const updated = isSelected
      ? selectedRoutes.filter(p => p !== preset)
      : [...selectedRoutes, preset];
    setSelectedRoutes(updated);

    if (!isSelected) {
      const apiKey = import.meta.env.VITE_GEOAPIFY_API_KEY;
      const url = `https://api.geoapify.com/v1/routing?waypoints=${preset.source.join(',')}|${preset.destination.join(',')}&mode=drive&details=route_segments&apiKey=${apiKey}`;
      try {
        const response = await axios.get(url);
        const feature = response.data.features[0];
        const distance = feature.properties.distance; // meters
        const time = feature.properties.time; // seconds
        const airDist = getAirDistance(preset.source, preset.destination);

        setSelectedRouteDetails({
          ...preset,
          roadDistance: (distance / 1000).toFixed(2),
          etaRoad: (time / 60).toFixed(1),
          airDistance: airDist.toFixed(2),
          etaAir: (airDist / 800).toFixed(1), // assuming 800 km/h
        });
      } catch (err) {
        console.error('Failed to fetch route details', err);
      }
    } else {
      setSelectedRouteDetails(null);
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white relative">
      {/* Sidebar */}
      <aside className="w-1/4 bg-gray-800 p-6 flex flex-col space-y-6 border-r border-gray-700">
        <div>
          <h1 className="text-3xl font-bold mb-2">Route Dashboard</h1>
          <p className="text-gray-400 text-sm">Select routes to visualize them on the map.</p>
        </div>

        <div className="space-y-3 overflow-auto">
          {presets.map((preset, idx) => (
            <label
              key={idx}
              className="flex items-center justify-between bg-gray-700 hover:bg-gray-600 p-3 rounded-lg transition cursor-pointer"
            >
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedRoutes.includes(preset)}
                  onChange={() => handleRouteToggle(preset)}
                  className="accent-blue-500"
                />
                <span className="font-medium">{preset.name}</span>
              </div>
              <div className={`w-3 h-3 rounded-full bg-${preset.color}-400`} />
            </label>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="w-3/4 p-6 overflow-hidden relative">
        <div className="bg-gray-800 rounded-xl shadow-xl h-full flex flex-col">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-xl font-semibold">Route Map View</h2>
          </div>
          <div className="flex-1">
            <MapContainer center={[20, 78]} zoom={5} className="h-full w-full rounded-b-xl">
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              {routeData.map((route, idx) => (
                <React.Fragment key={idx}>
                  <Marker
                    position={route.source}
                    icon={L.icon({
                      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
                      iconSize: [25, 41],
                      iconAnchor: [12, 41]
                    })}
                  />
                  <Marker
                    position={route.destination}
                    icon={L.icon({
                      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
                      iconSize: [25, 41],
                      iconAnchor: [12, 41]
                    })}
                  />
                  <Polyline positions={route.coords} pathOptions={{ color: route.color }} />
                  <FitBounds positions={route.coords} />
                </React.Fragment>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Details Panel */}
        {selectedRouteDetails && (
          <div className="absolute right-6 top-6 bg-white text-black shadow-xl rounded-lg p-6 max-w-sm z-[1000]">
            <h3 className="text-lg font-bold mb-2">Route Details</h3>
            <p><strong>Route:</strong> {selectedRouteDetails.name}</p>
            <p><strong>From:</strong> {selectedRouteDetails.source.join(', ')}</p>
            <p><strong>To:</strong> {selectedRouteDetails.destination.join(', ')}</p>
            <p><strong>Road Distance:</strong> {selectedRouteDetails.roadDistance} km</p>
            <p><strong>ETA by Road:</strong> {selectedRouteDetails.etaRoad} mins</p>
            <p><strong>Air Distance:</strong> {selectedRouteDetails.airDistance} km</p>
            <p><strong>ETA by Air:</strong> {selectedRouteDetails.etaAir} hrs</p>
            <button
              onClick={() => setSelectedRouteDetails(null)}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
            >
              Close
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
