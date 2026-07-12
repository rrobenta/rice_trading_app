export type UserRole = 'TRADER' | 'BUYER' | 'SUPPLIER' | 'ADMIN';
export type OrderType = 'BUY' | 'SELL';
export type OrderStatus = 'OPEN' | 'PARTIALLY_FILLED' | 'FILLED' | 'CANCELLED';
export type TradeStatus = 'PENDING' | 'COMPLETED' | 'DISPUTED';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  company?: string;
  phone?: string;
  createdAt: string;
  stats?: {
    totalListings: number;
    totalOrders: number;
    totalTrades: number;
  };
}

export interface RiceVariety {
  id: string;
  name: string;
  description?: string;
  origin?: string;
}

export interface Listing {
  id: string;
  title: string;
  description?: string;
  pricePerKg: string;
  quantityKg: string;
  minOrderKg: string;
  grade?: string;
  moisture?: string;
  location?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  variety: RiceVariety;
  seller: { id: string; name: string; company?: string };
}

export interface Order {
  id: string;
  type: OrderType;
  status: OrderStatus;
  pricePerKg: string;
  quantityKg: string;
  filledKg: string;
  notes?: string;
  expiresAt?: string;
  createdAt: string;
  variety: RiceVariety;
  userId: string;
}

export interface Trade {
  id: string;
  quantityKg: string;
  pricePerKg: string;
  totalAmount: string;
  status: TradeStatus;
  createdAt: string;
  completedAt?: string;
  buyer: { id: string; name: string; company?: string };
  seller: { id: string; name: string; company?: string };
  buyOrder: Order & { variety: RiceVariety };
}

export interface PricePoint {
  varietyName: string;
  pricePerKg: string;
  volumeKg: string;
  recordedAt: string;
}

export interface MarketSummaryItem {
  variety: RiceVariety;
  currentPrice: string | null;
  change: string | null;
  changePct: string | null;
  openOrders: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
