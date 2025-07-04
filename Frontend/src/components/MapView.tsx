import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import { MapPin, Loader2 } from 'lucide-react';
import type { ShipmentOrder } from '../data/mockData';

// Fix for default markers
delete (L.Icon.Default.prototype as unknown as { _getIconUrl: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapViewProps {
  orders: ShipmentOrder[];
  selectedOrderId: string | null;
}

const createCustomIcon = (color: string) =>
  L.divIcon({
    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
    className: 'custom-marker',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

const supplierIcon = createCustomIcon('#f97316');
const storeIcon = createCustomIcon('#3b82f6');

const MapController: React.FC<{ selectedOrderId: string | null; orders: ShipmentOrder[] }> = ({
  selectedOrderId,
  orders,
}) => {
  const map = useMap();

  useEffect(() => {
    if (!selectedOrderId) return;

    const selectedOrder = orders.find((order) => order.id === selectedOrderId);
    if (selectedOrder) {
      const bounds = L.latLngBounds([
        [selectedOrder.supplierLocation.lat, selectedOrder.supplierLocation.lng],
        [selectedOrder.storeLocation.lat, selectedOrder.storeLocation.lng],
      ]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [selectedOrderId, orders, map]);

  return null;
};

export const MapView: React.FC<MapViewProps> = ({ orders, selectedOrderId }) => {
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRoute = async () => {
      if (!selectedOrderId) {
        setRouteCoords([]);
        return;
      }

      const selectedOrder = orders.find((order) => order.id === selectedOrderId);
      if (!selectedOrder) return;

      const apiKey = import.meta.env.VITE_GEOAPIFY_API_KEY;
      const { supplierLocation, storeLocation } = selectedOrder;
      const waypoints = `${supplierLocation.lat},${supplierLocation.lng}|${storeLocation.lat},${storeLocation.lng}`;
      const url = `https://api.geoapify.com/v1/routing?waypoints=${waypoints}&mode=drive&apiKey=${apiKey}`;

      try {
        setLoading(true);
        const response = await axios.get(url);
        const features = response.data.features;

        if (features?.length > 0) {
          const geometry = features[0].geometry;
          let coords: [number, number][] = [];

          if (geometry.type === 'LineString') {
            coords = geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng]);
          } else if (geometry.type === 'MultiLineString') {
            coords = geometry.coordinates.flat().map(([lng, lat]: [number, number]) => [lat, lng]);
          } else {
            console.warn('Unexpected geometry type:', geometry.type);
          }

          setRouteCoords(coords);
        } else {
          console.warn('No features found in route response', response.data);
          setRouteCoords([]);
        }
      } catch (error) {
        console.error('Route fetch error:', error);
        setRouteCoords([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRoute();
  }, [selectedOrderId, orders]);

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden h-full relative">
      <div className="px-8 py-6 bg-gradient-to-r from-green-600 to-green-700">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <MapPin className="w-7 h-7" />
          Global Shipment Routes
        </h2>
        <p className="text-green-100 mt-1">Live tracking of order movements worldwide</p>
      </div>

      <div className="h-96 relative">
        <MapContainer
          center={[39.8283, -98.5795]}
          zoom={4}
          className="h-full w-full"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          <MapController selectedOrderId={selectedOrderId} orders={orders} />

          {orders.map((order) => (
            <React.Fragment key={order.id}>
              <Marker
                position={[order.supplierLocation.lat, order.supplierLocation.lng]}
                icon={supplierIcon}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-semibold text-orange-600">Supplier Location</h3>
                    <p className="text-sm text-gray-600">{order.supplierLocation.city}</p>
                    <p className="text-xs text-gray-500 mt-1">Order: {order.id}</p>
                  </div>
                </Popup>
              </Marker>

              <Marker
                position={[order.storeLocation.lat, order.storeLocation.lng]}
                icon={storeIcon}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-semibold text-blue-600">Walmart Store</h3>
                    <p className="text-sm text-gray-600">{order.storeLocation.city}</p>
                    <p className="text-xs text-gray-500 mt-1">Order: {order.id}</p>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          ))}

          {routeCoords.length > 0 && (
            <Polyline
              positions={routeCoords}
              color="#2563eb"
              weight={5}
              opacity={0.8}
            />
          )}
        </MapContainer>

        {/* ✅ Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <Loader2 className="w-10 h-10 text-white animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
};
