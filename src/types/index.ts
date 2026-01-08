// === TIPOS DO SISTEMA DE AUTO-ATENDIMENTO ===

export type ScreenType = 'idle' | 'identification' | 'products' | 'weighing' | 'summary';

export type ScaleStatus = 'disconnected' | 'waiting' | 'unstable' | 'stable' | 'overload';

export type ProductUnit = 'kg' | 'un';

export interface Product {
  id: string;
  name: string;
  image: string;
  pricePerUnit: number;
  unit: ProductUnit;
  requiresScale: boolean;
}

export interface OrderItem {
  id: string;
  product: Product;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  customerName: string;
  items: OrderItem[];
  total: number;
  createdAt: Date;
}

export interface AppState {
  currentScreen: ScreenType;
  
  currentOrder: Order | null;
  customerName: string;
  
  selectedProduct: Product | null;
  
  scaleWeight: number;
  scaleStatus: ScaleStatus;
  
  lastInteractionTime: number;
}

export interface AppActions {
  setScreen: (screen: ScreenType) => void;
  
  setCustomerName: (name: string) => void;
  startOrder: () => void;
  
  selectProduct: (product: Product) => void;
  clearSelectedProduct: () => void;
  
  addItemToOrder: (product: Product, quantity: number) => void;
  removeItemFromOrder: (itemId: string) => void;
  updateItemQuantity: (itemId: string, quantity: number) => void;
  
  setScaleWeight: (weight: number) => void;
  setScaleStatus: (status: ScaleStatus) => void;
  simulateWeighing: () => void;
  
  resetOrder: () => void;
  updateInteractionTime: () => void;
}

export type AppStore = AppState & AppActions;
