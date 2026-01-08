import { API_CONFIG, getDefaultHeaders } from '../config/api';
import type { Order, ApiOrderPayload, ApiOrderResponse } from '../types';
import { mapOrderToApiPayload } from '../types';

export type OrderStatus = 'idle' | 'submitting' | 'success' | 'error';

export interface SubmitOrderResult {
  success: boolean;
  orderId?: number;
  documentNumber?: string;
  message: string;
}

class OrdersService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_CONFIG.baseUrl;
  }

  async submitOrder(order: Order): Promise<SubmitOrderResult> {
    try {
      const payload: ApiOrderPayload = mapOrderToApiPayload(order);

      console.log('Enviando pedido para API:', JSON.stringify(payload, null, 2));

      const response = await fetch(`${this.baseUrl}/api/edi/v1/pedidos`, {
        method: 'POST',
        headers: getDefaultHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
      }

      const data: ApiOrderResponse = await response.json();

      if (data.ret.codigo !== '0') {
        return {
          success: false,
          message: data.ret.mensagem || 'Erro ao enviar pedido',
        };
      }

      return {
        success: true,
        orderId: data.dados?.ID,
        documentNumber: data.dados?.NumeroDocumento,
        message: 'Pedido enviado com sucesso!',
      };
    } catch (error) {
      console.error('Erro ao enviar pedido:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Erro desconhecido ao enviar pedido';

      return {
        success: false,
        message: errorMessage,
      };
    }
  }
}

export const ordersService = new OrdersService();

export const useOrders = () => {
  return ordersService;
};
