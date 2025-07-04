import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { LatLngTuple } from "leaflet";

type Latlon = { lat: number; lon: number };

interface Props {
  source: Latlon;
  destination: Latlon;
}

// 📌 Automatically fit the map to route bounds
const FitBounds: React.FC<{ bounds: LatLngTuple[] }> = ({ bounds }) => {
  const map = useMap();

  useEffect(() => {
    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [30, 30] });
    }
  }, [map, bounds]);

  return null;
};

const RouteMap: React.FC<Props> = ({ source, destination }) => {
  const [routeCoords, setRouteCoords] = useState<LatLngTuple[]>([]);

  useEffect(() => {
    const fetchRoute = async () => {
      const apiKey = import.meta.env.VITE_GEOAPIFY_API_KEY;
      if (!apiKey) {
        console.error("Geoapify API key is missing");
        return;
      }

      const waypoints = `${source.lat},${source.lon}|${destination.lat},${destination.lon}`;
      const url = `https://api.geoapify.com/v1/routing?waypoints=${waypoints}&mode=drive&apiKey=${apiKey}`;

      try {
        const res = await fetch(url);
        const data = await res.json();
        const geom = data?.features?.[0]?.geometry;

        if (!geom) {
          console.warn("No geometry in Geoapify response");
          return;
        }

        const coords: LatLngTuple[] =
          geom.type === "LineString"
            ? geom.coordinates.map(([lon, lat]: [number, number]) => [lat, lon])
            : geom.coordinates
                .flat()
                .map(([lon, lat]: [number, number]) => [lat, lon]);

        setRouteCoords(coords);
      } catch (err) {
        console.error("Error fetching route", err);
      }
    };

    fetchRoute();
  }, [source, destination]);

  return (
    <MapContainer
      center={[source.lat, source.lon]}
      zoom={7}
      className="h-full w-full rounded-lg"
    >
      <TileLayer
        attribution="© OpenMapTiles © OpenStreetMap contributors"
        url={`https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${import.meta.env.VITE_GEOAPIFY_API_KEY}`}
      />

      {routeCoords.length > 0 && <FitBounds bounds={routeCoords} />}

      <Marker position={[source.lat, source.lon]}>
        <Popup>Source</Popup>
      </Marker>

      <Marker position={[destination.lat, destination.lon]}>
        <Popup>Destination</Popup>
      </Marker>

      {routeCoords.length > 0 && (
        <Polyline positions={routeCoords} pathOptions={{ color: "blue" }} />
      )}
    </MapContainer>
  );
};

export default RouteMap;
