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
  barcode?: string;
  groupId?: number | null;
  groupName?: string | null;
  stockAvailable?: number;
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

// === TIPOS DA API DO BACKEND ===

export interface ApiProductRaw {
  ID: number;
  CodigoBarras: string;
  Nome: string;
  IDGrupo: number | null;
  Grupo: string | null;
  IDUnidade: number;
  UN: string;
  EstoqueDisponivel: number;
  PrecoVenda: number | null;
  Obs: string | null;
}

export interface ApiProductsResponse {
  ret: {
    codigo: string;
    mensagem: string;
  };
  query: {
    filtros: {
      disponives: string[];
    };
  };
  dados: ApiProductRaw[];
}

// Mapeamento de IDUnidade para tipo de unidade
// 2 = KG (pesável), outros = UN (unidade)
export const mapApiProductToProduct = (apiProduct: ApiProductRaw): Product => {
  const isKg = apiProduct.UN.toUpperCase() === 'KG';
  
  return {
    id: String(apiProduct.ID),
    name: apiProduct.Nome,
    image: '', // Será preenchido depois (pode usar filtro img na API ou placeholder)
    pricePerUnit: apiProduct.PrecoVenda ?? 0,
    unit: isKg ? 'kg' : 'un',
    requiresScale: isKg,
    barcode: apiProduct.CodigoBarras,
    groupId: apiProduct.IDGrupo,
    groupName: apiProduct.Grupo,
    stockAvailable: apiProduct.EstoqueDisponivel,
  };
};
