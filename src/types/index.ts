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

// === TIPOS DA API DE PEDIDOS ===

export interface ApiOrderItemPayload {
  Seq: number;
  IDTabOrigem: number;
  IDItem: number;
  UnitarioTabela: string;
  PercDesconto: string;
  ValorDesconto: string;
  IDUnidadeDigitada: number;
  QtdDigitada: string;
  UnitarioDigitada: string;
  IDUnidadeFaturar: number;
  QtdFaturar: string;
  QtdEstoque: string;
}

export interface ApiOrderFaturaPayload {
  IDTipoPgto: number;
  Vencimento: string;
  Valor: string;
  ValorPago: string;
}

export interface ApiOrderPayload {
  IDRota: number;
  ID: number;
  DataSistema: string;
  IDFormaPgto: number;
  IDNatureza: number;
  IDTabelaPreco: number;
  Data: string;
  DataEntrega: string;
  PercDesconto: string;
  ValorDesconto: string;
  Total: string;
  Maps_Latitude: string;
  Maps_Longitude: string;
  Cancelado: boolean;
  ProntaEntrega: boolean;
  OBS: string;
  IDCliente: number;
  Itens: ApiOrderItemPayload[];
  Faturas: ApiOrderFaturaPayload[];
}

export interface ApiOrderResponse {
  ret: {
    codigo: string;
    mensagem: string;
  };
  dados?: {
    ID: number;
    NumeroDocumento?: string;
  };
}

// Helper para formatar data no formato esperado pela API
export const formatDateForApi = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

export const formatDateOnlyForApi = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Mapeia o pedido do frontend para o formato da API
export const mapOrderToApiPayload = (order: Order): ApiOrderPayload => {
  const now = new Date();
  const dateStr = formatDateOnlyForApi(now);
  const dateTimeStr = formatDateForApi(now);

  const itens: ApiOrderItemPayload[] = order.items.map((item, index) => ({
    Seq: index + 1,
    IDTabOrigem: 0,
    IDItem: parseInt(item.product.id, 10),
    UnitarioTabela: item.product.pricePerUnit.toFixed(1),
    PercDesconto: '0.0',
    ValorDesconto: '0.0',
    IDUnidadeDigitada: item.product.unit === 'kg' ? 2 : 5,
    QtdDigitada: item.quantity.toFixed(1),
    UnitarioDigitada: item.product.pricePerUnit.toFixed(1),
    IDUnidadeFaturar: item.product.unit === 'kg' ? 2 : 5,
    QtdFaturar: item.quantity.toFixed(1),
    QtdEstoque: item.quantity.toFixed(1),
  }));

  const faturas: ApiOrderFaturaPayload[] = [{
    IDTipoPgto: 1,
    Vencimento: dateStr,
    Valor: order.total.toFixed(1),
    ValorPago: order.total.toFixed(1),
  }];

  return {
    IDRota: 1,
    ID: 1,
    DataSistema: dateTimeStr,
    IDFormaPgto: 1,
    IDNatureza: 1,
    IDTabelaPreco: 0,
    Data: dateStr,
    DataEntrega: dateStr,
    PercDesconto: '0.0',
    ValorDesconto: '0.0',
    Total: order.total.toFixed(1),
    Maps_Latitude: '-29.95810807',
    Maps_Longitude: '-51.10938067',
    Cancelado: false,
    ProntaEntrega: false,
    OBS: `Pedido auto-atendimento - Cliente: ${order.customerName}`,
    IDCliente: 1,
    Itens: itens,
    Faturas: faturas,
  };
};
