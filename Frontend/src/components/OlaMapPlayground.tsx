import { useEffect, useRef, useState } from 'react';

const OlaMapPlayground = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<'light' | 'dark'>(() => {
    const stored = localStorage.getItem('theme');
    return stored === 'dark' ||
      (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)
      ? 'dark'
      : 'light';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [olaMapsInstance, setOlaMapsInstance] = useState<any>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);

  useEffect(() => {
    localStorage.setItem('theme', mode);
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [mode]);

  useEffect(() => {
    import('olamaps-web-sdk').then((module) => {
      const { OlaMaps } = module;

      const olaMaps = new OlaMaps({
        apiKey: import.meta.env.VITE_OLA_MAPS_API_KEY,
      });

      const map = olaMaps.init({
        container: 'map',
        style:
          mode === 'dark'
            ? 'https://api.olamaps.io/tiles/vector/v1/styles/default-dark-standard/style.json'
            : 'https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json',
        center: [77.61648, 12.93142],
        zoom: 12,
      });

      setOlaMapsInstance(olaMaps);
      setMapInstance(map);
    });
  }, [mode]);

const handleSearch = async () => {
  if (!searchQuery.trim() || !mapInstance || !olaMapsInstance) return;

  try {
    const apiKey = import.meta.env.VITE_OLA_MAPS_API_KEY;
    const url = `https://api.olamaps.io/places/v1/geocode?address=${encodeURIComponent(
      searchQuery
    )}&api_key=${apiKey}`;

    const res = await fetch(url);
    const json = await res.json();

    const first = json.geocodingResults?.[0];
    if (!first) {
      alert('No results found.');
      return;
    }

    const lat = first.geometry.location.lat;
    const lng = first.geometry.location.lng;
    const address = first.formatted_address;

    mapInstance.flyTo({ center: [lng, lat], zoom: 16 });

    olaMapsInstance
      .addMarker({ color: '#007AFF' })
      .setLngLat([lng, lat])
      .setPopup(olaMapsInstance.addPopup().setText(address))
      .addTo(mapInstance);
  } catch (err) {
    console.error('Search error:', err);
    alert('Failed to search location.');
  }
};


  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className="flex gap-4 mb-4 w-full max-w-3xl">
        <button
          className="px-4 py-2 bg-blue-600 dark:bg-blue-400 text-white dark:text-gray-900 rounded hover:bg-blue-700 dark:hover:bg-blue-300 transition"
          onClick={() => setMode((prev) => (prev === 'dark' ? 'light' : 'dark'))}
        >
          Toggle {mode === 'dark' ? 'Light' : 'Dark'} Mode
        </button>

        <input
          type="text"
          placeholder="Search for a place"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2 text-black rounded border dark:border-gray-600 border-gray-300"
        />
        <button
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          onClick={handleSearch}
        >
          Search
        </button>
      </div>

      <div
        id="map"
        ref={mapRef}
        className="w-[90vw] md:w-[70vw] h-[60vh] rounded-xl shadow-lg border border-gray-300 dark:border-gray-700"
      ></div>
    </div>
  );
};

export default OlaMapPlayground;
