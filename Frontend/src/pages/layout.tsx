import React, { useState } from "react";

const Layout: React.FC = () => {
  const [selectedShipmentId, setSelectedShipmentId] = useState<string | null>(null);

  const shipments = [
    { id: "TX123", region: "Dallas", store: "#112", risk: "High", eta: "14:35", status: "Delayed" },
    { id: "OK245", region: "Tulsa", store: "#215", risk: "Medium", eta: "15:10", status: "On Time" },
    { id: "AR368", region: "Little Rock", store: "#308", risk: "Low", eta: "16:00", status: "On Time" },
  ];

  const selectedShipment = shipments.find((s) => s.id === selectedShipmentId);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Top Header */}

      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Walmart Weather & Logistics Dashboard <span className="text-red-500">This is a layout only page</span></h1>
        <p className="text-sm text-gray-500">Live shipment tracking with weather intelligence</p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-6">
        {/* Left Panel: Live Shipments */}
        <aside className="col-span-1 bg-white rounded-xl shadow p-4 overflow-y-auto max-h-[80vh]">
          <h2 className="text-lg font-semibold mb-4">📦 Live Shipments</h2>
          {shipments.map((shipment) => (
            <div
              key={shipment.id}
              onClick={() => setSelectedShipmentId(shipment.id)}
              className={`p-3 mb-3 rounded-lg cursor-pointer border ${
                selectedShipmentId === shipment.id ? "bg-blue-100 border-blue-500" : "bg-gray-50 border-gray-200"
              }`}
            >
              <p className="font-medium">ID: {shipment.id}</p>
              <p className="text-sm text-gray-600">Region: {shipment.region}</p>
              <p className="text-sm text-gray-600">ETA: {shipment.eta}</p>
              <span
                className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${
                  shipment.risk === "High"
                    ? "bg-red-100 text-red-700"
                    : shipment.risk === "Medium"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {shipment.risk} Risk
              </span>
            </div>
          ))}
        </aside>

        {/* Center Panel: Map + Forecast */}
        <main className="col-span-2 space-y-6">
          {/* Risk Map */}
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="text-lg font-semibold mb-4">🗺️ Risk Map</h2>
            <div className="h-[30vh] bg-gray-200 rounded-lg flex items-center justify-center text-gray-600">
              {selectedShipmentId ? `Map centered on ${selectedShipmentId}` : "Select a shipment to view route and weather"}
            </div>
          </div>

          {/* 7-Day Weather Forecast */}
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="text-lg font-semibold mb-4">📈 7-Day Weather Forecast</h2>
            <div className="h-[20vh] bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
              [Chart Placeholder – integrate Recharts/D3]
            </div>
          </div>
        </main>

        {/* Right Panel: Shipment Details + AI + Thresholds */}
        <section className="col-span-1 space-y-6">
          {/* Shipment Details & AI */}
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="text-lg font-semibold">📄 Details & AI Insights</h2>
            {selectedShipment ? (
              <div className="text-sm space-y-2">
                <p><strong>Store:</strong> {selectedShipment.store}</p>
                <p><strong>Region:</strong> {selectedShipment.region}</p>
                <p><strong>Status:</strong> {selectedShipment.status}</p>
                <p><strong>ETA:</strong> {selectedShipment.eta}</p>
                <div className="bg-gray-50 border rounded-lg p-3 text-gray-700">
                  🤖 <strong>AI Suggestion:</strong>
                  <p className="mt-1 text-sm">
                    {selectedShipment.risk === "High"
                      ? "Severe weather detected. Recommend delaying delivery by 2 hours or rerouting through I-30."
                      : "No critical issues. Maintain current schedule."}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Select a shipment to see details and AI suggestions.</p>
            )}
          </div>

          {/* Threshold Settings */}
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="text-lg font-semibold">🔧 Threshold Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Weather Severity Sensitivity</label>
                <input type="range" min="1" max="10" className="w-full mt-1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Max Route Delay (minutes)</label>
                <input type="range" min="0" max="120" className="w-full mt-1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Product Priority</label>
                <select className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option>All Goods</option>
                  <option>Cold Chain Only</option>
                  <option>High Value Only</option>
                </select>
              </div>
              <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                Apply Thresholds
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Bottom Row: Risk Scores Table */}
      <div className="bg-white rounded-xl shadow p-4 mt-6">
        <h2 className="text-lg font-semibold mb-4">📋 Regional Risk Scores</h2>
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left bg-gray-100">
              <tr>
                <th className="p-2">Region</th>
                <th className="p-2">Store</th>
                <th className="p-2">Risk Level</th>
                <th className="p-2">Route Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="p-2">North Texas</td>
                <td className="p-2">Store #142</td>
                <td className="p-2 text-red-600 font-semibold">High</td>
                <td className="p-2">Delayed</td>
              </tr>
              <tr className="border-t">
                <td className="p-2">Louisiana</td>
                <td className="p-2">Store #245</td>
                <td className="p-2 text-yellow-600 font-semibold">Moderate</td>
                <td className="p-2">On Watch</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Layout;
