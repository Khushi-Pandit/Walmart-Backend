// components/AdvancedMarker.tsx
import { useEffect } from "react";

interface AdvancedMarkerProps {
  map: google.maps.Map | null;
  position: google.maps.LatLngLiteral;
  svgHTML: string;
  onClick?: () => void;
}

const AdvancedMarker: React.FC<AdvancedMarkerProps> = ({ map, position, svgHTML, onClick }) => {
  useEffect(() => {
    if (!map || !window.google?.maps?.marker) return;

    const div = document.createElement("div");
    div.innerHTML = svgHTML.trim();

    const marker = new window.google.maps.marker.AdvancedMarkerElement({
      map,
      position,
      content: div,
    });

    if (onClick) marker.addListener("click", onClick);

    return () => {
      marker.map = null;
    };
  }, [map, position, svgHTML, onClick]);

  return null;
};

export default AdvancedMarker;
