import React, { useState, useCallback } from "react";
import { 
  CloudRain, 
  AlertTriangle, 
  Shield, 
  TrendingUp, 
  Clock, 
  MapPin,
  Thermometer,
  Eye,
  Settings,
  ChevronDown,
  ChevronUp,
  Activity
} from 'lucide-react';
import ShipmentsWidget from "../components/Shipments";
import WeatherMapComponent from "../components/Map";

interface WeatherSummary {
  high: number;
  medium: number;
  low: number;
  total: number;
  overallRisk: 'High' | 'Medium' | 'Low';
}

const Dashboard: React.FC = () => {
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [weatherSeverity, setWeatherSeverity] = useState<number>(5);
  const [maxRouteDelay, setMaxRouteDelay] = useState<number>(60);
  const [productPriority, setProductPriority] = useState<string>("All Goods");
  const [weatherSummary, setWeatherSummary] = useState<WeatherSummary | null>(null);
  const [showThresholdSettings, setShowThresholdSettings] = useState<boolean>(false);

  const handleShipmentSelect = useCallback((shipment: Shipment | null) => {
    setSelectedShipment(shipment);
  }, []);

  const handleWeatherSummary = useCallback((summary: Omit<WeatherSummary, 'overallRisk'>) => {
    const overallRisk: 'High' | 'Medium' | 'Low' = 
      summary.high > 0 ? 'High' : 
      summary.medium > 2 ? 'Medium' : 'Low';
    
    setWeatherSummary({
      ...summary,
      overallRisk
    });
  }, []);

  const handleApplyThresholds = useCallback(() => {
    console.log('Applying thresholds:', { weatherSeverity, maxRouteDelay, productPriority });
    // Add your threshold application logic here
  }, [weatherSeverity, maxRouteDelay, productPriority]);

  const getRiskColor = (risk: 'High' | 'Medium' | 'Low'): string => {
    switch(risk) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskIcon = (risk: 'High' | 'Medium' | 'Low'): React.ReactNode => {
    switch(risk) {
      case 'High': return <AlertTriangle size={16} className="text-red-600" />;
      case 'Medium': return <Eye size={16} className="text-yellow-600" />;
      case 'Low': return <Shield size={16} className="text-green-600" />;
      default: return <Activity size={16} className="text-gray-600" />;
    }
  };

  const RouteWeatherForecast: React.FC = () => (
    <div className="bg-white rounded-2xl shadow-lg p-5">
      <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
        <TrendingUp size={24} className="mr-2 text-blue-600" />
        Route Weather Forecast
      </h2>
      {selectedShipment ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">
                {selectedShipment.supplierId.name} → {selectedShipment.walmartStoreId.name}
              </span>
            </div>
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <Clock size={14} />
              <span>ETA: {new Date(selectedShipment.expectedDeliveryDate).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Weather Summary - Compact Version */}
          {weatherSummary && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                  <CloudRain size={16} className="mr-2 text-blue-600" />
                  Weather Summary
                </h3>
                <div className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center ${getRiskColor(weatherSummary.overallRisk)}`}>
                  {getRiskIcon(weatherSummary.overallRisk)}
                  <span className="ml-1">Overall Risk: {weatherSummary.overallRisk}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="bg-white rounded-lg p-2 border">
                  <div className="text-red-600 text-lg font-bold">{weatherSummary.high}</div>
                  <div className="text-red-600 text-xs">High</div>
                </div>
                <div className="bg-white rounded-lg p-2 border">
                  <div className="text-yellow-600 text-lg font-bold">{weatherSummary.medium}</div>
                  <div className="text-yellow-600 text-xs">Medium</div>
                </div>
                <div className="bg-white rounded-lg p-2 border">
                  <div className="text-green-600 text-lg font-bold">{weatherSummary.low}</div>
                  <div className="text-green-600 text-xs">Low</div>
                </div>
                <div className="bg-white rounded-lg p-2 border">
                  <div className="text-blue-600 text-lg font-bold">{weatherSummary.total}</div>
                  <div className="text-blue-600 text-xs">Total</div>
                </div>
              </div>
            </div>
          )}

          {weatherSummary ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Weather Impact</span>
                    <Thermometer size={16} className="text-blue-500" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {weatherSummary.overallRisk}
                  </div>
                  <div className="text-sm text-gray-600">Risk Level</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Monitoring Points</span>
                    <MapPin size={16} className="text-green-500" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{weatherSummary.total}</div>
                  <div className="text-sm text-gray-600">Along Route</div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <CloudRain size={16} className="text-blue-600 mr-2" />
                  <span className="font-medium text-blue-800">Weather Recommendations</span>
                </div>
                <div className="text-sm text-blue-700">
                  {weatherSummary.high > 0 ? (
                    <>
                      <p className="mb-1">• High risk conditions detected along route</p>
                      <p className="mb-1">• Consider delaying shipment or using alternative route</p>
                      <p>• Monitor weather updates closely</p>
                    </>
                  ) : weatherSummary.medium > 2 ? (
                    <>
                      <p className="mb-1">• Multiple medium risk areas identified</p>
                      <p className="mb-1">• Proceed with caution and monitor conditions</p>
                      <p>• Have contingency plans ready</p>
                    </>
                  ) : (
                    <>
                      <p className="mb-1">• Favorable weather conditions for delivery</p>
                      <p className="mb-1">• No significant weather-related delays expected</p>
                      <p>• Continue with planned route</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-500">Loading weather forecast...</p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-gray-500 text-center py-8">
          <CloudRain size={48} className="mx-auto mb-4 text-gray-300" />
          <p>Select a shipment to view detailed weather forecast</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-300 p-6 font-sans">
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 leading-tight">
          Walmart Weather & Logistics Dashboard
        </h1>
        <p className="text-md text-gray-600 mt-1">
          Live shipment tracking with real-time weather intelligence
        </p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-8">
        {/* Shipments Widget */}
        <ShipmentsWidget onShipmentSelect={handleShipmentSelect} />

        {/* Main Content */}
        <main className="col-span-2 space-y-6">
          {/* Risk Map - Increased height */}
          <div className="bg-white rounded-2xl shadow-lg p-5 h-[55vh] flex flex-col">
            <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
              <MapPin size={24} className="mr-2 text-blue-600" />
              Risk Map
            </h2>
            <div className="flex-grow">
              <WeatherMapComponent 
                shipment={selectedShipment} 
                onWeatherSummary={handleWeatherSummary}
              />
            </div>
          </div>

          {/* Route Weather Forecast */}
          <RouteWeatherForecast />
        </main>

        {/* Sidebar */}
        <section className="col-span-1 space-y-6">
          {/* Details & AI Insights */}
          <div className="bg-white rounded-2xl shadow-lg p-5">
            <h2 className="text-xl font-bold mb-4 text-gray-800">📄 Details & AI Insights</h2>
            {selectedShipment ? (
              <div className="text-sm space-y-3">
                <p><strong className="text-gray-700">Store:</strong> {selectedShipment.walmartStoreId.name}</p>
                <p><strong className="text-gray-700">From:</strong> {selectedShipment.supplierId.name}</p>
                <p><strong className="text-gray-700">To:</strong> {selectedShipment.walmartStoreId.name}</p>
                <p><strong className="text-gray-700">Status:</strong> {selectedShipment.status}</p>
                <p><strong className="text-gray-700">ETA:</strong> {new Date(selectedShipment.expectedDeliveryDate).toLocaleString()}</p>
                <p><strong className="text-gray-700">Cold Chain:</strong> {selectedShipment.isColdChainRequired ? 'Yes' : 'No'}</p>
                <p><strong className="text-gray-700">Total Amount:</strong> ₹{selectedShipment.totalAmount.toLocaleString()}</p>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-gray-800">
                  <strong className="flex items-center text-blue-700 mb-2">
                    <span role="img" aria-label="robot" className="mr-2 text-lg">🤖</span> AI Suggestion:
                  </strong>
                  <p className="mt-1 text-sm leading-relaxed">
                    {selectedShipment.isColdChainRequired
                      ? "Cold chain shipment detected. Monitor temperature-sensitive segments closely and consider fastest route options."
                      : "Standard shipment. Monitor weather conditions along the route for optimal delivery timing."}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-base py-4 text-center">
                Select a shipment to view its comprehensive details and AI-powered suggestions.
              </p>
            )}
          </div>

          {/* Threshold Settings */}
          <div className="bg-white rounded-2xl shadow-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Settings size={24} className="mr-2 text-blue-600" />
                Threshold Settings
              </h2>
              <button
                onClick={() => setShowThresholdSettings(!showThresholdSettings)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                {showThresholdSettings ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>
            
            {showThresholdSettings && (
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
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;