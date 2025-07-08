import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, RefreshCw, MapPin, Package, Clock, AlertTriangle, Check, Truck, SortAsc, SortDesc, X } from 'lucide-react';

interface ShipmentsResponse {
  success: boolean;
  message: string;
  data: Shipment[];
}

interface ShipmentsWidgetProps {
  onShipmentSelect?: (shipment: Shipment | null) => void;
  maxHeight?: string;
  className?: string;
}

const ShipmentsWidget: React.FC<ShipmentsWidgetProps> = ({ 
  onShipmentSelect, 
  maxHeight = "600px",
  className = "" 
}) => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'expectedDeliveryDate' | 'totalAmount' | 'status'>('expectedDeliveryDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterColdChain, setFilterColdChain] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch shipments
  const fetchShipments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:3000/api/v1/shipments/get_all_shipments');
      if (!response.ok) {
        throw new Error('Failed to fetch shipments');
      }
      const data: ShipmentsResponse = await response.json();
      if (data.success) {
        console.log(data.data);
        setShipments(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch shipments');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setShipments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  // Handle shipment selection
  const handleShipmentSelect = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    onShipmentSelect?.(shipment);
  };

  // Get status color and icon
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'Pending':
        return { color: 'text-yellow-600 bg-yellow-50', icon: Clock };
      case 'Packed':
        return { color: 'text-blue-600 bg-blue-50', icon: Package };
      case 'In-Transit':
        return { color: 'text-purple-600 bg-purple-50', icon: Truck };
      case 'Delivered':
        return { color: 'text-green-600 bg-green-50', icon: Check };
      default:
        return { color: 'text-gray-600 bg-gray-50', icon: AlertTriangle };
    }
  };

  // Filter and sort shipments
  const filteredAndSortedShipments = useMemo(() => {
    let filtered = shipments.filter(shipment => {
      const matchesSearch = 
        shipment._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.walmartStoreId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.supplierId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.deliveryAgents.some(agent => 
          agent.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      const matchesStatus = filterStatus === 'all' || shipment.status === filterStatus;
      const matchesColdChain = filterColdChain === 'all' || 
        (filterColdChain === 'required' && shipment.isColdChainRequired) ||
        (filterColdChain === 'not-required' && !shipment.isColdChainRequired);
      
      return matchesSearch && matchesStatus && matchesColdChain;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'expectedDeliveryDate':
          aValue = new Date(a.expectedDeliveryDate).getTime();
          bValue = new Date(b.expectedDeliveryDate).getTime();
          break;
        case 'totalAmount':
          aValue = a.totalAmount;
          bValue = b.totalAmount;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [shipments, searchTerm, sortBy, sortOrder, filterStatus, filterColdChain]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get risk level based on delivery time and status
  const getRiskLevel = (shipment: Shipment) => {
    const now = new Date();
    const expected = new Date(shipment.expectedDeliveryDate);
    const hoursRemaining = (expected.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (shipment.status === 'Delivered') return 'none';
    if (hoursRemaining < 0) return 'high';
    if (hoursRemaining < 24) return 'medium';
    return 'low';
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-lg border ${className}`} style={{ maxHeight }}>
        <div className="p-6 flex items-center justify-center">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mr-2" />
          <span className="text-gray-600">Loading shipments...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-xl shadow-lg border ${className}`} style={{ maxHeight }}>
        <div className="p-6">
          <div className="flex items-center text-red-600 mb-4">
            <AlertTriangle className="w-5 h-5 mr-2" />
            <span className="font-medium">Error loading shipments</span>
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchShipments}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg border ${className}`} style={{ maxHeight }}>
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Package className="w-5 h-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-800">Live Shipments</h2>
            <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
              {filteredAndSortedShipments.length}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-colors ${
                showFilters ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Filter className="w-4 h-4" />
            </button>
            <button
              onClick={fetchShipments}
              className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search shipments, stores, suppliers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 p-4 bg-white rounded-lg border space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                <div className="flex">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="flex-1 text-sm border border-gray-200 rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="expectedDeliveryDate">Delivery Date</option>
                    <option value="totalAmount">Amount</option>
                    <option value="status">Status</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-200 rounded-r-lg hover:bg-gray-200 transition-colors"
                  >
                    {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Packed">Packed</option>
                  <option value="In-Transit">In-Transit</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cold Chain</label>
                <select
                  value={filterColdChain}
                  onChange={(e) => setFilterColdChain(e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All</option>
                  <option value="required">Required</option>
                  <option value="not-required">Not Required</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSortBy('expectedDeliveryDate');
                  setSortOrder('asc');
                  setFilterStatus('all');
                  setFilterColdChain('all');
                }}
                className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Shipments List */}
      <div className="overflow-y-auto" style={{ maxHeight: 'calc(100% - 200px)' }}>
        {filteredAndSortedShipments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">No shipments found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {filteredAndSortedShipments.map((shipment) => {
              const statusInfo = getStatusInfo(shipment.status);
              const StatusIcon = statusInfo.icon;
              const riskLevel = getRiskLevel(shipment);
              
              return (
                <div
                  key={shipment._id}
                  onClick={() => handleShipmentSelect(shipment)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                    selectedShipment?._id === shipment._id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${statusInfo.color}`}>
                        <StatusIcon className="w-5 h-5" />
                      </div>
                      <div className="ml-3">
                        <div className="font-medium text-gray-900">#{shipment._id.slice(-6)}</div>
                        <div className="text-sm text-gray-500">{shipment.deliveryAgents[0]?.name}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {shipment.isColdChainRequired && (
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-blue-600">❄</span>
                        </div>
                      )}
                      {riskLevel !== 'none' && (
                        <div className={`w-2 h-2 rounded-full ${
                          riskLevel === 'high' ? 'bg-red-500' : 
                          riskLevel === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`} />
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="truncate">{shipment.walmartStoreId.name}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{formatDate(shipment.expectedDeliveryDate)}</span>
                      </div>
                      <div className="font-semibold text-gray-900">
                        {formatCurrency(shipment.totalAmount)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                        {shipment.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        {shipment.products.length} item{shipment.products.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShipmentsWidget;