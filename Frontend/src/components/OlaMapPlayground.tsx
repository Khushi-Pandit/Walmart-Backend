// src/components/MapComponent.tsx
import React, { useEffect, useRef, useState } from 'react';
// We'll import OlaMaps dynamically in useEffect, as it's a large library

interface MapComponentProps {
  initialMode?: 'light' | 'dark';
}

// eslint-disable-next-line no-empty-pattern
const MapComponent: React.FC<MapComponentProps> = ({ }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<any>(null); // Store the map object
  const [olaMapsInstance, setOlaMapsInstance] = useState<any>(null); // Store the OlaMaps SDK object
  const [mode, setMode] = useState<'light' | 'dark'>(() => {
    // Initialize mode from localStorage or system preference
    const stored = localStorage.getItem('theme');
    return stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)
      ? 'dark'
      : 'light';
  });

  const API_KEY = import.meta.env.VITE_OLA_MAPS_API_KEY;

  // Effect to manage theme (light/dark mode)
  useEffect(() => {
    localStorage.setItem('theme', mode);
    document.documentElement.classList.toggle('dark', mode === 'dark');
    // If map exists, update its style
    if (mapInstance && olaMapsInstance) {
      mapInstance.setStyle(
        mode === 'dark'
          ? 'https://api.olamaps.io/tiles/vector/v1/styles/default-dark-standard/style.json'
          : 'https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json'
      );
    }
  }, [mode, mapInstance, olaMapsInstance]); // Re-run when mode, mapInstance, or olaMapsInstance changes

  // Effect to initialize the map
  useEffect(() => {
    if (!mapContainerRef.current) return; // Ensure the div is available

    // Dynamically import OlaMaps SDK to prevent bundling issues
    import('olamaps-web-sdk')
      .then((module) => {
        const { OlaMaps } = module;

        // Check if API_KEY is loaded
        if (!API_KEY) {
          console.error("Ola Maps API Key is not set. Please check your .env file.");
          alert("Ola Maps API Key is missing. Map cannot be loaded.");
          return;
        }

        const olaMaps = new OlaMaps({ apiKey: API_KEY });
        setOlaMapsInstance(olaMaps); // Save the OlaMaps SDK instance

        const map = olaMaps.init({
          container: mapContainerRef.current, // Use ref here
          style:
            mode === 'dark'
              ? 'https://api.olamaps.io/tiles/vector/v1/styles/default-dark-standard/style.json'
              : 'https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json',
          center: [77.61648, 12.93142], // Default center: Bengaluru coordinates
          zoom: 12,
        });

        setMapInstance(map); // Save the map instance

        // Cleanup function: remove map when component unmounts
        return () => {
          if (map) {
            map.remove();
          }
        };
      })
      .catch((error) => {
        console.error('Failed to load Ola Maps SDK or initialize map:', error);
        alert('Failed to load map. Please check your network and API key.');
      });
  }, [API_KEY, mode]); // Depend on API_KEY and mode to re-initialize if they change

  return (
    <div className="flex flex-col items-center min-h-screen p-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className="flex gap-4 mb-4 w-full max-w-3xl justify-between">
        <h1 className="text-2xl font-bold">Ola Maps Display</h1>
        <button
          className="px-4 py-2 bg-blue-600 dark:bg-blue-400 text-white dark:text-gray-900 rounded hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors"
          onClick={() => setMode((prev) => (prev === 'dark' ? 'light' : 'dark'))}
        >
          Toggle {mode === 'dark' ? 'Light' : 'Dark'} Mode
        </button>
      </div>

      <div
        id="map-container" // Use a consistent ID or remove it if using ref only
        ref={mapContainerRef}
        className="w-[90vw] md:w-[70vw] h-[60vh] rounded-xl shadow-lg border border-gray-300 dark:border-gray-700"
        style={{ minHeight: '400px' }} // Ensure a minimum height for visibility
      >
        {!API_KEY && (
          <div className="flex items-center justify-center h-full text-red-500 font-semibold">
            Please set your VITE_OLA_MAPS_API_KEY in the .env file.
          </div>
        )}
      </div>

      <div className="mt-6 w-full max-w-3xl space-y-2 text-sm bg-gray-100 dark:bg-gray-800 p-4 rounded shadow-md">
        <p className="text-center text-gray-600 dark:text-gray-400">
          This is a basic map display using Ola Maps SDK.
        </p>
      </div>
    </div>
  );
};

export default MapComponent;