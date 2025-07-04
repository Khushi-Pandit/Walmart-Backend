import { useState, useMemo, useEffect } from "react";
import { shipments } from "./mockdata"; // Assuming this mockdata exists
import RouteMap from "../components/RouteMap"; // Assuming

const API_KEY = import.meta.env.VITE_OWS_KEY; // OpenWeatherMap API key from environment variables

interface Weather {
  id: number;
  main: string;
  description: string;
  icon: string;
}

interface MainWeatherData {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  pressure: number;
  humidity: number;
}

interface ForecastListItem {
  dt: number;
  main: MainWeatherData;
  weather: Weather[];
  dt_txt: string; // Add this line to define dt_txt as a string
  [key: string]: unknown; // For other properties we don't use
}

interface ForecastData {
  list: ForecastListItem[];
  [key: string]: unknown; // For other properties we don't use
}

const fetchForecast = async (lat: number, lon: number): Promise<ForecastData> => {
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
  const res = await fetch(url);
  const data: ForecastData = await res.json();
  return data;
};

const Dashboard = () => {
  const [selectedShipmentId, setSelectedShipmentId] = useState<string | null>(null);
  const selectedShipment = useMemo(() => {
    return shipments.find((s) => s.id === selectedShipmentId);
  }, [selectedShipmentId]);

  const [weatherSeverity, setWeatherSeverity] = useState(5);
  const [maxRouteDelay, setMaxRouteDelay] = useState(60);
  const [productPriority, setProductPriority] = useState("All Goods");
  const [forecastData, setForecastData] = useState<{
    source: ForecastData | null;
    midpoint: ForecastData | null;
    destination: ForecastData | null;
  }>({ source: null, midpoint: null, destination: null });

  useEffect(() => {
    const getForecasts = async () => {
      if (!selectedShipment) return;

      const { source, destination } = selectedShipment;
      const midLat = (source.lat + destination.lat) / 2;
      const midLon = (source.lon + destination.lon) / 2;

      const [sourceData, midpointData, destinationData] = await Promise.all([
        fetchForecast(source.lat, source.lon),
        fetchForecast(midLat, midLon),
        fetchForecast(destination.lat, destination.lon),
      ]);

      setForecastData({
        source: sourceData,
        midpoint: midpointData,
        destination: destinationData,
      });
    };

    getForecasts();
  }, [selectedShipment]);

const renderForecastSummary = (data: ForecastData | null) => {
  if (!data || !data.list || data.list.length === 0) return <p>No forecast available.</p>;

  const groupedByDay: { [date: string]: ForecastListItem } = {};

  data.list.forEach((entry) => {
    const date = new Date(entry.dt * 1000).toLocaleDateString();
    if (!groupedByDay[date]) {
      // Prefer 12:00 PM forecasts if available
      if (entry.dt_txt.includes("12:00:00")) {
        groupedByDay[date] = entry;
      } else {
        groupedByDay[date] = groupedByDay[date] || entry;
      }
    }
  });

  const days = Object.keys(groupedByDay).slice(0, 5); // Show next 5 days

  return (
    <div className="space-y-2">
      {days.map((date) => {
        const entry = groupedByDay[date];
        return (
          <div key={date} className="text-center bg-white rounded-lg p-2 shadow-sm">
            <p className="font-semibold text-gray-800 text-sm">{date}</p>
            <p className="text-gray-700 text-sm capitalize">{entry.weather[0].description}</p>
            <p className="text-gray-600 text-xs">Temp: {entry.main.temp.toFixed(1)} °C</p>
          </div>
        );
      })}
    </div>
  );
};


  const handleApplyThresholds = () => {
    console.log("Applying Thresholds:", {
      weatherSeverity,
      maxRouteDelay,
      productPriority,
    });
    alert("Threshold settings applied!");
  };

  return (
    <div className="min-h-screen bg-gray-300 p-6 font-sans">
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 leading-tight">Walmart Weather & Logistics Dashboard</h1>
        <p className="text-md text-gray-600 mt-1">Live shipment tracking with real-time weather intelligence</p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-8">
        <aside className="col-span-1 bg-white rounded-2xl shadow-lg p-5 overflow-y-auto max-h-[calc(100vh-50px)]">
          <h2 className="text-xl font-bold mb-5 text-gray-800">📦 Live Shipments</h2>
          {shipments.length > 0 ? (
            shipments.map((shipment) => (
              <div
                key={shipment.id}
                onClick={() => setSelectedShipmentId(shipment.id)}
                className={`p-4 mb-3 rounded-xl cursor-pointer transition-all duration-200 ease-in-out border-2 ${
                  selectedShipmentId === shipment.id
                    ? "bg-blue-50 border-blue-600 shadow-md"
                    : "bg-white border-gray-200 hover:border-gray-400"
                }`}
              >
                <p className="font-semibold text-gray-900">ID: {shipment.id}</p>
                <p className="text-sm text-gray-700">From: {shipment.source.city}</p>
                <p className="text-sm text-gray-700">To: {shipment.destination.city}</p>
                <p className="text-sm text-gray-700">ETA: {shipment.eta}</p>
                <span className={`inline-block mt-2 px-3 py-1 text-xs font-medium rounded-full ${
                  shipment.risk === "High"
                    ? "bg-red-100 text-red-800"
                    : shipment.risk === "Medium"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-green-100 text-green-800"
                }`}>
                  {shipment.risk} Risk
                </span>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-6">No shipments to display.</div>
          )}
        </aside>

        <main className="col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-5 h-[40vh] flex flex-col">
            <h2 className="text-xl font-bold mb-4 text-gray-800">🗌️ Risk Map</h2>
            {selectedShipment ? (
              <div className="flex-grow">
                <RouteMap
                  source={selectedShipment.source}
                  destination={selectedShipment.destination}
                />
              </div>
            ) : (
              <div className="h-full bg-gray-100 rounded-xl flex items-center justify-center text-gray-600 text-lg">
                <p>Select a shipment from the left to view its route and weather.</p>
              </div>
            )}
          </div>

<div className="bg-white rounded-2xl shadow-lg p-5">
  <h2 className="text-xl font-bold mb-4 text-gray-800">📈 7-Day Weather Forecast</h2>
  {selectedShipment ? (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      
      {/* Source Forecast */}
      <div className="bg-gray-50 p-4 rounded-xl text-sm border border-gray-200">
        <h3 className="font-semibold text-gray-700 mb-2">
          Source: {selectedShipment.source.city}
        </h3>
        <div className="h-[32vh] overflow-y-auto bg-gray-200 rounded-lg p-2 text-gray-800">
          {renderForecastSummary(forecastData.source)}
        </div>
      </div>

      {/* Midpoint Forecast */}
      <div className="bg-gray-50 p-4 rounded-xl text-sm border border-gray-200">
        <h3 className="font-semibold text-gray-700 mb-2">Midpoint Forecast</h3>
        <div className="h-[32vh] overflow-y-auto bg-gray-200 rounded-lg p-2 text-gray-800">
          {renderForecastSummary(forecastData.midpoint)}
        </div>
      </div>

      {/* Destination Forecast */}
      <div className="bg-gray-50 p-4 rounded-xl text-sm border border-gray-200">
        <h3 className="font-semibold text-gray-700 mb-2">
          Destination: {selectedShipment.destination.city}
        </h3>
        <div className="h-[32vh] overflow-y-auto bg-gray-200 rounded-lg p-2 text-gray-800">
          {renderForecastSummary(forecastData.destination)}
        </div>
      </div>

    </div>
  ) : (
    <div className="h-[20vh] bg-gray-100 rounded-xl flex items-center justify-center text-gray-600 text-lg">
      <p>Select a shipment to see its detailed 7-day forecast.</p>
    </div>
  )}
</div>



        </main>

        <section className="col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-5">
            <h2 className="text-xl font-bold mb-4 text-gray-800">📄 Details & AI Insights</h2>
            {selectedShipment ? (
              <div className="text-sm space-y-3">
                <p><strong className="text-gray-700">Store:</strong> {selectedShipment.store}</p>
                <p><strong className="text-gray-700">From:</strong> {selectedShipment.source.city}</p>
                <p><strong className="text-gray-700">To:</strong> {selectedShipment.destination.city}</p>
                <p><strong className="text-gray-700">Status:</strong> {selectedShipment.status}</p>
                <p><strong className="text-gray-700">ETA:</strong> {selectedShipment.eta}</p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-gray-800">
                  <strong className="flex items-center text-blue-700 mb-2">
                    <span role="img" aria-label="robot" className="mr-2 text-lg">🤖</span> AI Suggestion:
                  </strong>
                  <p className="mt-1 text-sm leading-relaxed">
                    {selectedShipment.risk === "High"
                      ? "Severe weather detected along the route. Recommend delaying delivery by at least 2 hours or exploring alternative rerouting options for safety and efficiency."
                      : "No critical weather or logistical issues identified. Maintain current schedule for optimal delivery."}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-base py-4 text-center">
                Select a shipment to view its comprehensive details and AI-powered suggestions.
              </p>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-5">
            <h2 className="text-xl font-bold mb-4 text-gray-800">🔧 Threshold Settings</h2>
            <div className="space-y-5">
              <div>
                <label htmlFor="weather-severity" className="block text-sm font-medium text-gray-700 mb-1">
                  Weather Severity Sensitivity: <span className="font-semibold">{weatherSeverity}</span>
                </label>
                <input
                  id="weather-severity"
                  type="range"
                  min="1"
                  max="10"
                  value={weatherSeverity}
                  onChange={(e) => setWeatherSeverity(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  title="Weather Severity Sensitivity"
                />
              </div>
              <div>
                <label htmlFor="max-route-delay" className="block text-sm font-medium text-gray-700 mb-1">
                  Max Route Delay (minutes): <span className="font-semibold">{maxRouteDelay}</span>
                </label>
                <input
                  id="max-route-delay"
                  type="range"
                  min="0"
                  max="180"
                  value={maxRouteDelay}
                  onChange={(e) => setMaxRouteDelay(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  title="Max Route Delay"
                />
              </div>
              <div>
                <label htmlFor="product-priority" className="block text-sm font-medium text-gray-700 mb-1">
                  Product Priority
                </label>
                <select
                  id="product-priority"
                  value={productPriority}
                  onChange={(e) => setProductPriority(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="All Goods">All Goods</option>
                  <option value="Cold Chain Only">Cold Chain Only</option>
                  <option value="High Value Only">High Value Only</option>
                  <option value="Perishable">Perishable</option>
                </select>
              </div>
              <button
                onClick={handleApplyThresholds}
                className="mt-5 w-full bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition duration-200 ease-in-out font-semibold text-base"
              >
                Apply Thresholds
              </button>
            </div>
          </div>
        </section>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-5 mt-8">
        <h2 className="text-xl font-bold mb-4 text-gray-800">📋 Regional Risk Scores</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">Region</th>
                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Store</th>
                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Level</th>
                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg">Route Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr className="hover:bg-gray-50">
                <td className="p-3 whitespace-nowrap">North Texas</td>
                <td className="p-3 whitespace-nowrap">Store #142</td>
                <td className="p-3 whitespace-nowrap text-red-600 font-semibold">High</td>
                <td className="p-3 whitespace-nowrap">Delayed</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="p-3 whitespace-nowrap">Louisiana</td>
                <td className="p-3 whitespace-nowrap">Store #245</td>
                <td className="p-3 whitespace-nowrap text-yellow-600 font-semibold">Moderate</td>
                <td className="p-3 whitespace-nowrap">On Watch</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="p-3 whitespace-nowrap">Florida South</td>
                <td className="p-3 whitespace-nowrap">Store #301</td>
                <td className="p-3 whitespace-nowrap text-green-600 font-semibold">Low</td>
                <td className="p-3 whitespace-nowrap">On Schedule</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="p-3 whitespace-nowrap">California Central</td>
                <td className="p-3 whitespace-nowrap">Store #088</td>
                <td className="p-3 whitespace-nowrap text-yellow-600 font-semibold">Moderate</td>
                <td className="p-3 whitespace-nowrap">Potential Delays</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
