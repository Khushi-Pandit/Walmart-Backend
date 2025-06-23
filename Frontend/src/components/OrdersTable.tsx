import React from 'react';
import { Package, Calendar, MapPin, AlertTriangle } from 'lucide-react';
import type { ShipmentOrder } from '../data/mockData';

interface OrdersTableProps {
  orders: ShipmentOrder[];
  selectedOrderId: string | null;
  onOrderClick: (orderId: string) => void;
}

const getRiskColor = (riskLevel: number) => {
  if (riskLevel > 0.7) return 'text-red-500 bg-red-50';
  if (riskLevel > 0.4) return 'text-orange-500 bg-orange-50';
  return 'text-green-500 bg-green-50';
};

const getRiskLabel = (riskLevel: number) => {
  if (riskLevel > 0.7) return 'High Risk';
  if (riskLevel > 0.4) return 'Medium Risk';
  return 'Low Risk';
};

export const OrdersTable: React.FC<OrdersTableProps> = ({ orders, selectedOrderId, onOrderClick }) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="px-8 py-6 bg-gradient-to-r from-blue-600 to-blue-700">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <Package className="w-7 h-7" />
          Shipment Orders
        </h2>
        <p className="text-blue-100 mt-1">Click on any order to view route details</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Order Details</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Timeline</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Route</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Risk Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.map((order) => (
              <tr 
                key={order.id}
                onClick={() => onOrderClick(order.id)}
                className={`cursor-pointer transition-all duration-200 hover:bg-blue-50 ${
                  selectedOrderId === order.id ? 'bg-blue-100 ring-2 ring-blue-500 ring-inset' : ''
                }`}
              >
                <td className="px-6 py-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{order.id}</div>
                      <div className="text-sm text-gray-600 mt-1">{order.itemName}</div>
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Ordered:</span>
                      <span className="font-medium">{new Date(order.orderDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-blue-400" />
                      <span className="text-gray-600">Ships:</span>
                      <span className="font-medium">{new Date(order.estimatedShipDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-green-400" />
                      <span className="text-gray-600">Delivers:</span>
                      <span className="font-medium">{new Date(order.estimatedDeliveryDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-orange-400" />
                      <span className="font-medium text-gray-900">{order.supplierLocation.city}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <span>↓</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-blue-400" />
                      <span className="font-medium text-gray-900">{order.storeLocation.city}</span>
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4">
                  <div className="space-y-2">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(order.riskLevel)}`}>
                      <AlertTriangle className="w-4 h-4" />
                      {getRiskLabel(order.riskLevel)}
                    </div>
                    <div className="text-sm text-gray-600">{order.weatherCondition}</div>
                    <div className={`text-sm font-medium ${order.deliveryStatus === 'On time' ? 'text-green-600' : 'text-red-600'}`}>
                      {order.deliveryStatus}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};