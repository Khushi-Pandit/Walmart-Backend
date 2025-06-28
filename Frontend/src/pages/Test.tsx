import React, { useEffect, useRef } from 'react';

const Test = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const apiKey = import.meta.env.VITE_OLA_MAPS_API_KEY; // or process.env.REACT_APP_OLA_MAPS_API_KEY

  useEffect(() => {
    if (!apiKey) {
      console.error('Ola Maps API key is missing');
      return;
    }

    import('olamaps-web-sdk').then((module) => {
      const { OlaMaps } = module;

      const olaMaps = new OlaMaps({ apiKey });

      olaMaps.init({
        style: 'https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json',
        container: mapRef.current!,
        center: [77.61648476788898, 12.931423492103944],
        zoom: 15,
      });
    });
  }, [apiKey]);

  return (
    <div
      style={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f9fafb',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div
        style={{
          width: '50%',
          maxWidth: '500px',
          padding: '2rem',
          backgroundColor: '#fff',
          borderRadius: '12px',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
        }}
      >
        <h2 style={{ marginBottom: '1.5rem', color: '#111827' }}>Welcome to Test!</h2>
        <div
          ref={mapRef}
          style={{
            height: '250px',
            width: '100%',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        />
      </div>
    </div>
  );
};

export default Test;
