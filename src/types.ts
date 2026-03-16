export type Role = 'customer' | 'admin' | 'super_admin';

export interface User {
  id: string;
  loginId?: string;
  password?: string;
  name: string;
  role: Role;
  restaurantId?: string; // If admin
}

export interface Restaurant {
  id: string;
  name: string;
  adminId: string;
  image: string;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  price: number;
  qty: number;
  image: string;
}

export type OrderStatus = 'PENDING' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'REJECTED';

export interface OrderItem {
  menuItemId: string;
  name: string;
  qty: number;
  price: number;
}

export interface Order {
  id: string;
  customerId: string;
  restaurantId: string;
  items: OrderItem[];
  status: OrderStatus;
  total: number;
  createdAt: number;
}

export interface CartItem {
  menuItem: MenuItem;
  qty: number;
}
