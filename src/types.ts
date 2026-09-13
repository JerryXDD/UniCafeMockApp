export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'breakfast' | 'lunch' | 'snacks' | 'beverages';
  available: boolean;
  prepTime: number; // in minutes
  image?: string;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'picked_up';

export interface Order {
  id: string;
  userId: string;
  studentName: string;
  items: CartItem[];
  total: number;
  paymentMethod: 'wallet' | 'cash';
  status: OrderStatus;
  createdAt: string;
  estimatedPickup: string;
}

export interface Wallet {
  balance: number;
  studentName: string;
}

export type UserRole = 'student' | 'staff' | null;

export interface AppState {
  menu: MenuItem[];
  orders: Order[];
  wallet: Wallet;
}
