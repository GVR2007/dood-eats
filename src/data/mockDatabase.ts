import type { User, Restaurant, MenuItem, Order } from '../types';

export const mockUsers: User[] = [
  { id: '1', loginId: 'alice', password: 'password', name: 'Alice (Customer)', role: 'customer' },
  { id: '2', loginId: 'bob_admin', password: 'password', name: 'Bob (Admin - Burger King)', role: 'admin', restaurantId: 'r1' },
  { id: '3', loginId: 'charlie_admin', password: 'password', name: 'Charlie (Admin - Pizza Hut)', role: 'admin', restaurantId: 'r2' },
  { id: 'super1', loginId: 'superadmin', password: 'password', name: 'Boss User (Super Admin)', role: 'super_admin' },
];

export const mockRestaurants: Restaurant[] = [
  { id: 'r1', name: 'Burger King', adminId: '2', image: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&q=80&w=800' },
  { id: 'r2', name: 'Pizza Hut', adminId: '3', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800' },
];

export const mockMenuItems: MenuItem[] = [
  { id: 'm1', restaurantId: 'r1', name: 'Whopper', price: 5.99, qty: 10, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400' },
  { id: 'm2', restaurantId: 'r1', name: 'Fries', price: 2.49, qty: 50, image: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&q=80&w=400' },
  { id: 'm3', restaurantId: 'r2', name: 'Pepperoni Pizza', price: 12.99, qty: 5, image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&q=80&w=400' },
];

export const mockOrders: Order[] = [];
