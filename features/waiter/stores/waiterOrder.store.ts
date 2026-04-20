import { create } from 'zustand';

export interface OrderLineItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  customizations: Record<string, string>;
  notes: string;
}

interface WaiterOrderStore {
  orderId: string | null;
  tableId: string | null;
  roomId: string | null;
  items: OrderLineItem[];
  type: 'dinein' | 'pickup';
  notes: string;
  totalAmount: number;

  // Actions
  startOrder: (tableId: string, roomId: string) => void;
  addItem: (item: OrderLineItem) => void;
  removeItem: (menuItemId: string) => void;
  updateItem: (menuItemId: string, updates: Partial<OrderLineItem>) => void;
  setOrderType: (type: 'dinein' | 'pickup') => void;
  setOrderNotes: (notes: string) => void;
  clearOrder: () => void;
  getSubtotal: () => number;
  getTotalItems: () => number;
}

export const useWaiterOrderStore = create<WaiterOrderStore>((set, get) => ({
  orderId: null,
  tableId: null,
  roomId: null,
  items: [],
  type: 'dinein',
  notes: '',
  totalAmount: 0,

  startOrder: (tableId: string, roomId: string) => {
    set({ tableId, roomId, items: [], type: 'dinein', notes: '' });
  },

  addItem: (item: OrderLineItem) => {
    set((state) => {
      const existingItem = state.items.find((i) => i.menuItemId === item.menuItemId);
      let newItems;

      if (existingItem) {
        newItems = state.items.map((i) =>
          i.menuItemId === item.menuItemId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      } else {
        newItems = [...state.items, item];
      }

      const subtotal = newItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

      return {
        items: newItems,
        totalAmount: subtotal,
      };
    });
  },

  removeItem: (menuItemId: string) => {
    set((state) => {
      const newItems = state.items.filter((i) => i.menuItemId !== menuItemId);
      const subtotal = newItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

      return {
        items: newItems,
        totalAmount: subtotal,
      };
    });
  },

  updateItem: (menuItemId: string, updates: Partial<OrderLineItem>) => {
    set((state) => {
      const newItems = state.items.map((i) =>
        i.menuItemId === menuItemId ? { ...i, ...updates } : i
      );
      const subtotal = newItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

      return {
        items: newItems,
        totalAmount: subtotal,
      };
    });
  },

  setOrderType: (type: 'dinein' | 'pickup') => {
    set({ type });
  },

  setOrderNotes: (notes: string) => {
    set({ notes });
  },

  clearOrder: () => {
    set({
      orderId: null,
      tableId: null,
      roomId: null,
      items: [],
      type: 'dinein',
      notes: '',
      totalAmount: 0,
    });
  },

  getSubtotal: () => {
    return get().items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  },

  getTotalItems: () => {
    return get().items.reduce((sum, i) => sum + i.quantity, 0);
  },
}));
