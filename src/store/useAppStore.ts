import { create } from 'zustand';
import type { AppStore, Order, ScaleStatus, ScreenType, Product } from '../types';

const generateId = () => Math.random().toString(36).substring(2, 11);

const initialState = {
  currentScreen: 'idle' as ScreenType,
  currentOrder: null,
  customerName: '',
  selectedProduct: null,
  scaleWeight: 0,
  scaleStatus: 'waiting' as ScaleStatus,
  lastInteractionTime: Date.now(),
};

export const useAppStore = create<AppStore>((set, get) => ({
  ...initialState,

  setScreen: (screen: ScreenType) => {
    set({ currentScreen: screen });
    get().updateInteractionTime();
  },

  setCustomerName: (name: string) => {
    set({ customerName: name });
    get().updateInteractionTime();
  },

  startOrder: () => {
    const { customerName } = get();
    if (!customerName.trim()) return;

    const newOrder: Order = {
      id: generateId(),
      customerName: customerName.trim(),
      items: [],
      total: 0,
      createdAt: new Date(),
    };

    set({
      currentOrder: newOrder,
      currentScreen: 'products',
    });
    get().updateInteractionTime();
  },

  selectProduct: (product: Product) => {
    set({ selectedProduct: product });
    
    if (product.requiresScale) {
      set({ 
        currentScreen: 'weighing',
        scaleWeight: 0,
        scaleStatus: 'waiting',
      });
      get().simulateWeighing();
    } else {
      get().addItemToOrder(product, 1);
    }
    get().updateInteractionTime();
  },

  clearSelectedProduct: () => {
    set({ 
      selectedProduct: null,
      scaleWeight: 0,
      scaleStatus: 'waiting',
      currentScreen: 'products',
    });
    get().updateInteractionTime();
  },

  addItemToOrder: (product: Product, quantity: number) => {
    const { currentOrder } = get();
    if (!currentOrder) return;

    const subtotal = product.pricePerUnit * quantity;
    const newItem = {
      id: generateId(),
      product,
      quantity,
      subtotal,
    };

    const updatedItems = [...currentOrder.items, newItem];
    const newTotal = updatedItems.reduce((sum, item) => sum + item.subtotal, 0);

    set({
      currentOrder: {
        ...currentOrder,
        items: updatedItems,
        total: newTotal,
      },
      selectedProduct: null,
      scaleWeight: 0,
      scaleStatus: 'waiting',
      currentScreen: 'products',
    });
    get().updateInteractionTime();
  },

  removeItemFromOrder: (itemId: string) => {
    const { currentOrder } = get();
    if (!currentOrder) return;

    const updatedItems = currentOrder.items.filter(item => item.id !== itemId);
    const newTotal = updatedItems.reduce((sum, item) => sum + item.subtotal, 0);

    set({
      currentOrder: {
        ...currentOrder,
        items: updatedItems,
        total: newTotal,
      },
    });
    get().updateInteractionTime();
  },

  updateItemQuantity: (itemId: string, quantity: number) => {
    const { currentOrder } = get();
    if (!currentOrder) return;

    const updatedItems = currentOrder.items.map(item => {
      if (item.id === itemId) {
        const newSubtotal = item.product.pricePerUnit * quantity;
        return { ...item, quantity, subtotal: newSubtotal };
      }
      return item;
    });
    const newTotal = updatedItems.reduce((sum, item) => sum + item.subtotal, 0);

    set({
      currentOrder: {
        ...currentOrder,
        items: updatedItems,
        total: newTotal,
      },
    });
    get().updateInteractionTime();
  },

  setScaleWeight: (weight: number) => {
    set({ scaleWeight: weight });
  },

  setScaleStatus: (status: ScaleStatus) => {
    set({ scaleStatus: status });
  },

  simulateWeighing: () => {
    set({ scaleStatus: 'waiting', scaleWeight: 0 });

    setTimeout(() => {
      if (get().currentScreen !== 'weighing') return;
      set({ scaleStatus: 'unstable' });
      
      let weight = 0;
      const interval = setInterval(() => {
        if (get().currentScreen !== 'weighing') {
          clearInterval(interval);
          return;
        }
        
        weight += Math.random() * 0.3;
        if (weight > 2) weight = 0.5 + Math.random() * 1.5;
        set({ scaleWeight: weight });
      }, 100);

      setTimeout(() => {
        clearInterval(interval);
        if (get().currentScreen !== 'weighing') return;
        
        const finalWeight = 0.3 + Math.random() * 2.2;
        set({ 
          scaleWeight: finalWeight,
          scaleStatus: 'stable',
        });
      }, 2000);
    }, 1000);
  },

  resetOrder: () => {
    set({
      ...initialState,
      lastInteractionTime: Date.now(),
    });
  },

  updateInteractionTime: () => {
    set({ lastInteractionTime: Date.now() });
  },
}));
