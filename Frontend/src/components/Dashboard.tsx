import React, { useState } from 'react';
import { Map, Table, TrendingUp, AlertTriangle, Package, Clock } from 'lucide-react';
import { mockOrders, mockLocations } from '../data/mockData';
import { OrdersTable } from './OrdersTable';
import { MapView } from './MapView';
import { LocationRiskMap } from './LocationRiskMap';

export const Dashboard: React.FC = () => {
  const [isMapView, setIsMapView] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const handleOrderClick = (orderId: string) => {
    setSelectedOrderId(selectedOrderId === orderId ? null : orderId);
    if (!isMapView) {
      setIsMapView(true);
    }
  };

  const totalOrders = mockOrders.length;
  const highRiskOrders = mockOrders.filter(order => order.riskLevel > 0.7).length;
  const delayedOrders = mockOrders.filter(order => order.deliveryStatus === 'Delayed').length;
  const onTimeOrders = mockOrders.filter(order => order.deliveryStatus === 'On time').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Shipment Orders Dashboard
          </h1>
          <p className="text-gray-600 text-lg">
            Monitor real-time shipment status and delivery routes
          </p>
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors">
            <a href='/Direction' className="flex items-center gap-2">
            Map Routes
            </a>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900">{totalOrders}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">High Risk</p>
                <p className="text-3xl font-bold text-red-600">{highRiskOrders}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">On Time</p>
                <p className="text-3xl font-bold text-green-600">{onTimeOrders}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Delayed</p>
                <p className="text-3xl font-bold text-orange-600">{delayedOrders}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Toggle Button */}
        <div className="flex justify-end mb-6">
          <div className="bg-white rounded-xl shadow-lg p-1 flex">
            <button
              onClick={() => {
                setIsMapView(false);
                setSelectedOrderId(null);
              }}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
                !isMapView
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Table className="w-5 h-5" />
              Table View
            </button>
            <button
              onClick={() => setIsMapView(true)}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
                isMapView
                  ? 'bg-green-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Map className="w-5 h-5" />
              Map View
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="transition-all duration-500 ease-in-out mb-8">
          {isMapView ? (
            <div className="animate-in slide-in-from-right-4 duration-500">
              <MapView orders={mockOrders} selectedOrderId={selectedOrderId} />
            </div>
          ) : (
            <div className="animate-in slide-in-from-left-4 duration-500">
              <OrdersTable 
                orders={mockOrders} 
                selectedOrderId={selectedOrderId}
                onOrderClick={handleOrderClick}
              />
            </div>
          )}
        </div>

        {/* Location Risk Map */}
        <div className="animate-in fade-in duration-700">
          <LocationRiskMap locations={mockLocations} />
        </div>

        {/* Selected Order Info */}
        {selectedOrderId && (
          <div className="fixed bottom-6 right-6 bg-white rounded-xl shadow-2xl p-6 max-w-sm border border-gray-200 animate-in slide-in-from-bottom-4 duration-300">
            {(() => {
              const selectedOrder = mockOrders.find(order => order.id === selectedOrderId);
              if (!selectedOrder) return null;
              
              return (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">{selectedOrder.id}</h3>
                    <button
                      onClick={() => setSelectedOrderId(null)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{selectedOrder.itemName}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Risk Level:</span>
                      <span className={`font-medium ${
                        selectedOrder.riskLevel > 0.7 ? 'text-red-600' :
                        selectedOrder.riskLevel > 0.4 ? 'text-orange-600' :
                        'text-green-600'
                      }`}>
                        {Math.round(selectedOrder.riskLevel * 100)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Weather:</span>
                      <span className="font-medium">{selectedOrder.weatherCondition}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Status:</span>
                      <span className={`font-medium ${
                        selectedOrder.deliveryStatus === 'On time' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {selectedOrder.deliveryStatus}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};