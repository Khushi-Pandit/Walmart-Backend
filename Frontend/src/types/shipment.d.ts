interface Location {
  type: string;
  coordinates: [number, number];
}

interface Store {
  _id: string;
  name: string;
  location: Location;
}

interface Supplier {
  _id: string;
  name: string;
  contact: string;
  address: string;
  location: Location;
}

interface Product {
  _id: string;
  productId: {
    _id: string;
    name: string;
    isPerishable: boolean;
    category: string;
  };
  prodQuantity: number;
}

interface DeliveryAgent {
  _id: string;
  name: string;
  contact: string;
  vehicle: string;
  email: string;
  fcm: string;
}

interface Shipment {
  _id: string;
  currentLocation: Location;
  walmartStoreId: Store;
  supplierId: Supplier;
  products: Product[];
  totalAmount: number;
  status: 'Pending' | 'Packed' | 'In-Transit' | 'Delivered';
  deliveryAgents: DeliveryAgent[];
  expectedDeliveryDate: string;
  actualDeliveryDate: string | null;
  isColdChainRequired: boolean;
  createdAt: string;
  updatedAt: string;
}