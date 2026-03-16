import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Restaurant, MenuItem, Order, CartItem, OrderStatus } from '../types';


interface AppState {
  users: User[];
  restaurants: Restaurant[];
  menuItems: MenuItem[];
  orders: Order[];
  
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;

  cart: CartItem[];
  cartRestaurantId: string | null;
  addToCart: (item: MenuItem) => void;
  removeFromCart: (itemId: string) => void;
  updateCartQty: (itemId: string, qty: number) => void;
  clearCart: () => void;
  cartTotal: () => number;

  placeOrder: () => void;

  addMenuItem: (item: MenuItem) => Promise<void>;
  updateMenuItem: (itemId: string, data: Partial<MenuItem>) => Promise<void>;
  deleteMenuItem: (itemId: string) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  fetchData: () => Promise<void>;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      users: [],
      restaurants: [],
      menuItems: [],
      orders: [],

      fetchData: async () => {
        try {
          const res = await fetch('/api/data');
          if (res.ok) {
            const data = await res.json();
            set({
              users: data.users,
              restaurants: data.restaurants,
              menuItems: data.menuItems,
              orders: data.orders
            });
          }
        } catch (err) {
          console.error('Failed to fetch from backend', err);
        }
      },

  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),

  cart: [],
  cartRestaurantId: null,

  addToCart: (menuItem) => set((state) => {
    let newCart = state.cart;
    if (state.cartRestaurantId !== menuItem.restaurantId) {
      newCart = [];
    }

    const existingItem = newCart.find(i => i.menuItem.id === menuItem.id);
    if (existingItem) {
      if (existingItem.qty < menuItem.qty) {
        return {
          cart: newCart.map(i => i.menuItem.id === menuItem.id ? { ...i, qty: i.qty + 1 } : i),
          cartRestaurantId: menuItem.restaurantId
        };
      }
      return state;
    } else {
      if (menuItem.qty > 0) {
        return {
          cart: [...newCart, { menuItem, qty: 1 }],
          cartRestaurantId: menuItem.restaurantId
        };
      }
      return state;
    }
  }),

  removeFromCart: (itemId) => set((state) => {
    const newCart = state.cart.filter(i => i.menuItem.id !== itemId);
    return {
      cart: newCart,
      cartRestaurantId: newCart.length === 0 ? null : state.cartRestaurantId
    };
  }),

  updateCartQty: (itemId, qty) => set((state) => {
    if (qty <= 0) {
      const newCart = state.cart.filter(i => i.menuItem.id !== itemId);
      return { cart: newCart, cartRestaurantId: newCart.length === 0 ? null : state.cartRestaurantId };
    }
    
    const menuItem = state.menuItems.find(m => m.id === itemId);
    if (!menuItem || qty > menuItem.qty) return state;

    return {
      cart: state.cart.map(i => i.menuItem.id === itemId ? { ...i, qty } : i)
    };
  }),

  clearCart: () => set({ cart: [], cartRestaurantId: null }),

  cartTotal: () => {
    return get().cart.reduce((total, item) => total + (item.menuItem.price * item.qty), 0);
  },

  placeOrder: async () => {
    const { currentUser, cart, cartRestaurantId, cartTotal, orders } = get();
    if (!currentUser || cart.length === 0 || !cartRestaurantId) return;

    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      customerId: currentUser.id,
      restaurantId: cartRestaurantId,
      items: cart.map(c => ({
        menuItemId: c.menuItem.id,
        name: c.menuItem.name,
        price: c.menuItem.price,
        qty: c.qty
      })),
      total: cartTotal(),
      status: 'PENDING',
      createdAt: Date.now()
    };

    try {
      // 1. Post to backend
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });
      
      if (res.ok) {
        // 2. Update local state
        set({
          orders: [...orders, newOrder],
          cart: [],
          cartRestaurantId: null
        });
      }
    } catch (err) {
      console.error('Failed to place order', err);
    }
  },

  addMenuItem: async (item) => {
    try {
      const res = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      if (res.ok) {
        console.log('Successfully added menu item to DB');
        set((state) => ({ menuItems: [...state.menuItems, item] }));
      } else {
        const errorText = await res.text();
        console.error('Backend failed to add item:', errorText);
      }
    } catch (err) {
      console.error('Network Error while adding menu item:', err);
    }
  },
  
  updateMenuItem: async (itemId, data) => {
    // If we are only updating qty, we can use the existing qty endpoint
    if (Object.keys(data).length === 1 && data.qty !== undefined) {
      try {
        const res = await fetch(`/api/menu/${itemId}/qty`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ qty: data.qty })
        });
        if (res.ok) {
          set((state) => ({
            menuItems: state.menuItems.map(m => m.id === itemId ? { ...m, ...data } : m)
          }));
        }
      } catch (err) {
        console.error('Failed to update qty', err);
      }
    } else {
      // General update (not implemented in backend yet, but local for now)
      set((state) => ({
        menuItems: state.menuItems.map(m => m.id === itemId ? { ...m, ...data } : m)
      }));
    }
  },

  deleteMenuItem: (itemId) => set((state) => ({
    menuItems: state.menuItems.filter(m => m.id !== itemId)
  })),

  updateOrderStatus: async (orderId: string, status: OrderStatus) => {
    const state = get();
    const order = state.orders.find(o => o.id === orderId);
    if (!order) return;

    let newMenuItems = state.menuItems;
    let menuItemsUpdates: { id: string; qty: number }[] = [];

    // Deduct inventory only when admin accepts the order
    if (status === 'ACCEPTED' && order.status === 'PENDING') {
      newMenuItems = state.menuItems.map(menuItem => {
        const orderedItem = order.items.find(i => i.menuItemId === menuItem.id);
        if (orderedItem) {
          const newQty = Math.max(0, menuItem.qty - orderedItem.qty);
          menuItemsUpdates.push({ id: menuItem.id, qty: newQty });
          return { ...menuItem, qty: newQty };
        }
        return menuItem;
      });
    }

    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, menuItemsUpdates })
      });

      if (res.ok) {
        set({
          menuItems: newMenuItems,
          orders: state.orders.map(o => o.id === orderId ? { ...o, status } : o)
        });
      }
    } catch (err) {
      console.error('Failed to update status', err);
    }
  }
    }),
    {
      name: 'dood-eats-storage-v2',
      version: 1,
      partialize: (state) => ({
        // ONLY persist the "Database" stuff across tabs. 
        // Do NOT persist currentUser or cart, allowing multiple tabs to act as different users!
        users: state.users,
        restaurants: state.restaurants,
        menuItems: state.menuItems,
        orders: state.orders,
      }),
    }
  )
);
