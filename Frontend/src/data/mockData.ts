export interface ShipmentOrder {
  id: string;
  itemName: string;
  orderDate: string;
  estimatedShipDate: string;
  estimatedDeliveryDate: string;
  supplierLocation: {
    city: string;
    lat: number;
    lng: number;
  };
  storeLocation: {
    city: string;
    lat: number;
    lng: number;
  };
  riskLevel: number;
  weatherCondition: string;
  deliveryStatus: 'On time' | 'Delayed';
}

export interface Location {
  id: string;
  name: string;
  type: 'supplier' | 'store';
  lat: number;
  lng: number;
  riskScore: number;
}

export const mockOrders: ShipmentOrder[] = [
  {
    id: 'ORD-001',
    itemName: 'Samsung 55" 4K Smart TV',
    orderDate: '2024-01-15',
    estimatedShipDate: '2024-01-17',
    estimatedDeliveryDate: '2024-01-20',
    supplierLocation: { city: 'Shenzhen, China', lat: 22.5431, lng: 114.0579 },
    storeLocation: { city: 'Dallas, TX', lat: 32.7767, lng: -96.7970 },
    riskLevel: 0.8,
    weatherCondition: 'Heavy Snow',
    deliveryStatus: 'Delayed'
  },
  {
    id: 'ORD-002',
    itemName: 'Apple iPhone 15 Pro',
    orderDate: '2024-01-16',
    estimatedShipDate: '2024-01-18',
    estimatedDeliveryDate: '2024-01-21',
    supplierLocation: { city: 'Cupertino, CA', lat: 37.3230, lng: -122.0322 },
    storeLocation: { city: 'New York, NY', lat: 40.7128, lng: -74.0060 },
    riskLevel: 0.2,
    weatherCondition: 'Clear',
    deliveryStatus: 'On time'
  },
  {
    id: 'ORD-003',
    itemName: 'Nike Air Max Sneakers',
    orderDate: '2024-01-14',
    estimatedShipDate: '2024-01-16',
    estimatedDeliveryDate: '2024-01-19',
    supplierLocation: { city: 'Portland, OR', lat: 45.5152, lng: -122.6784 },
    storeLocation: { city: 'Miami, FL', lat: 25.7617, lng: -80.1918 },
    riskLevel: 0.6,
    weatherCondition: 'Thunderstorms',
    deliveryStatus: 'On time'
  },
  {
    id: 'ORD-004',
    itemName: 'Dell XPS 13 Laptop',
    orderDate: '2024-01-17',
    estimatedShipDate: '2024-01-19',
    estimatedDeliveryDate: '2024-01-22',
    supplierLocation: { city: 'Austin, TX', lat: 30.2672, lng: -97.7431 },
    storeLocation: { city: 'Seattle, WA', lat: 47.6062, lng: -122.3321 },
    riskLevel: 0.3,
    weatherCondition: 'Light Rain',
    deliveryStatus: 'On time'
  },
  {
    id: 'ORD-005',
    itemName: 'Sony PlayStation 5',
    orderDate: '2024-01-13',
    estimatedShipDate: '2024-01-15',
    estimatedDeliveryDate: '2024-01-18',
    supplierLocation: { city: 'Tokyo, Japan', lat: 35.6762, lng: 139.6503 },
    storeLocation: { city: 'Los Angeles, CA', lat: 34.0522, lng: -118.2437 },
    riskLevel: 0.9,
    weatherCondition: 'Severe Weather',
    deliveryStatus: 'Delayed'
  },
  {
    id: 'ORD-006',
    itemName: 'Dyson V15 Vacuum',
    orderDate: '2024-01-16',
    estimatedShipDate: '2024-01-18',
    estimatedDeliveryDate: '2024-01-21',
    supplierLocation: { city: 'Chicago, IL', lat: 41.8781, lng: -87.6298 },
    storeLocation: { city: 'Phoenix, AZ', lat: 33.4484, lng: -112.0740 },
    riskLevel: 0.1,
    weatherCondition: 'Sunny',
    deliveryStatus: 'On time'
  },
  {
    id: 'ORD-007',
    itemName: 'KitchenAid Stand Mixer',
    orderDate: '2024-01-15',
    estimatedShipDate: '2024-01-17',
    estimatedDeliveryDate: '2024-01-20',
    supplierLocation: { city: 'Detroit, MI', lat: 42.3314, lng: -83.0458 },
    storeLocation: { city: 'Atlanta, GA', lat: 33.7490, lng: -84.3880 },
    riskLevel: 0.5,
    weatherCondition: 'Cloudy',
    deliveryStatus: 'On time'
  }
];

export const mockLocations: Location[] = [
  // Suppliers
  {
    id: 'SUP-001',
    name: 'Shenzhen Electronics Hub',
    type: 'supplier',
    lat: 22.5431,
    lng: 114.0579,
    riskScore: 0.8
  },
  {
    id: 'SUP-002',
    name: 'Apple Cupertino Campus',
    type: 'supplier',
    lat: 37.3230,
    lng: -122.0322,
    riskScore: 0.2
  },
  {
    id: 'SUP-003',
    name: 'Nike Portland HQ',
    type: 'supplier',
    lat: 45.5152,
    lng: -122.6784,
    riskScore: 0.6
  },
  {
    id: 'SUP-004',
    name: 'Dell Austin Facility',
    type: 'supplier',
    lat: 30.2672,
    lng: -97.7431,
    riskScore: 0.3
  },
  {
    id: 'SUP-005',
    name: 'Sony Tokyo Manufacturing',
    type: 'supplier',
    lat: 35.6762,
    lng: 139.6503,
    riskScore: 0.9
  },
  {
    id: 'SUP-006',
    name: 'Dyson Chicago Distribution',
    type: 'supplier',
    lat: 41.8781,
    lng: -87.6298,
    riskScore: 0.1
  },
  {
    id: 'SUP-007',
    name: 'KitchenAid Detroit Plant',
    type: 'supplier',
    lat: 42.3314,
    lng: -83.0458,
    riskScore: 0.5
  },
  {
    id: 'SUP-008',
    name: 'Samsung Vietnam Factory',
    type: 'supplier',
    lat: 21.0285,
    lng: 105.8542,
    riskScore: 0.7
  },
  {
    id: 'SUP-009',
    name: 'LG South Korea Hub',
    type: 'supplier',
    lat: 37.5665,
    lng: 126.9780,
    riskScore: 0.4
  },
  {
    id: 'SUP-010',
    name: 'Foxconn Taiwan Center',
    type: 'supplier',
    lat: 25.0330,
    lng: 121.5654,
    riskScore: 0.6
  },
  // Walmart Stores
  {
    id: 'STORE-001',
    name: 'Walmart Dallas Supercenter',
    type: 'store',
    lat: 32.7767,
    lng: -96.7970,
    riskScore: 0.3
  },
  {
    id: 'STORE-002',
    name: 'Walmart Times Square',
    type: 'store',
    lat: 40.7128,
    lng: -74.0060,
    riskScore: 0.2
  },
  {
    id: 'STORE-003',
    name: 'Walmart Miami Beach',
    type: 'store',
    lat: 25.7617,
    lng: -80.1918,
    riskScore: 0.8
  },
  {
    id: 'STORE-004',
    name: 'Walmart Seattle Downtown',
    type: 'store',
    lat: 47.6062,
    lng: -122.3321,
    riskScore: 0.1
  },
  {
    id: 'STORE-005',
    name: 'Walmart Los Angeles Central',
    type: 'store',
    lat: 34.0522,
    lng: -118.2437,
    riskScore: 0.4
  },
  {
    id: 'STORE-006',
    name: 'Walmart Phoenix West',
    type: 'store',
    lat: 33.4484,
    lng: -112.0740,
    riskScore: 0.1
  },
  {
    id: 'STORE-007',
    name: 'Walmart Atlanta Midtown',
    type: 'store',
    lat: 33.7490,
    lng: -84.3880,
    riskScore: 0.5
  },
  {
    id: 'STORE-008',
    name: 'Walmart Houston Galleria',
    type: 'store',
    lat: 29.7604,
    lng: -95.3698,
    riskScore: 0.7
  },
  {
    id: 'STORE-009',
    name: 'Walmart Chicago Loop',
    type: 'store',
    lat: 41.8781,
    lng: -87.6298,
    riskScore: 0.3
  },
  {
    id: 'STORE-010',
    name: 'Walmart Denver Tech Center',
    type: 'store',
    lat: 39.7392,
    lng: -104.9903,
    riskScore: 0.2
  },
  {
    id: 'STORE-011',
    name: 'Walmart Las Vegas Strip',
    type: 'store',
    lat: 36.1699,
    lng: -115.1398,
    riskScore: 0.6
  },
  {
    id: 'STORE-012',
    name: 'Walmart Orlando Universal',
    type: 'store',
    lat: 28.5383,
    lng: -81.3792,
    riskScore: 0.9
  }
];