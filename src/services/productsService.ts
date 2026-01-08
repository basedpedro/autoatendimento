import { API_CONFIG, getDefaultHeaders } from '../config/api';
import type { ApiProductsResponse, Product } from '../types';
import { mapApiProductToProduct } from '../types';

const getProductImage = (productName: string): string => {
  const name = productName.toLowerCase();
  
  const imageMap: Record<string, string> = {
    'alho': 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2f3d?w=300&h=300&fit=crop',
    'batata': 'https://images.unsplash.com/photo-1518977676601-b53f82ber59?w=300&h=300&fit=crop',
    'cebola': 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=300&h=300&fit=crop',
    'feijao': 'https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=300&h=300&fit=crop',
    'moranga': 'https://images.unsplash.com/photo-1570586437263-ab629fccc818?w=300&h=300&fit=crop',
    'tomate': 'https://images.unsplash.com/photo-1546470427-0d4db154ceb8?w=300&h=300&fit=crop',
    'banana': 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&h=300&fit=crop',
    'maca': 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300&h=300&fit=crop',
    'laranja': 'https://images.unsplash.com/photo-1547514701-42782101795e?w=300&h=300&fit=crop',
  };

  for (const [keyword, url] of Object.entries(imageMap)) {
    if (name.includes(keyword)) {
      return url;
    }
  }

  return 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&h=300&fit=crop';
};

class ProductsService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_CONFIG.baseUrl;
  }


  async getProducts(): Promise<Product[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/edi/v1/produtos`, {
        method: 'GET',
        headers: getDefaultHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
      }

      const data: ApiProductsResponse = await response.json();

      if (data.ret.codigo !== '0') {
        throw new Error(`Erro do backend: ${data.ret.mensagem}`);
      }

      const products = data.dados.map((apiProduct) => {
        const product = mapApiProductToProduct(apiProduct);
        product.image = getProductImage(product.name);
        return product;
      });

      return products;
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      throw error;
    }
  }


  async getProductById(id: string): Promise<Product | null> {
    const products = await this.getProducts();
    return products.find(p => p.id === id) || null;
  }


  async searchProducts(query: string): Promise<Product[]> {
    const products = await this.getProducts();
    
    if (!query.trim()) {
      return products;
    }

    const normalizedQuery = query
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    return products.filter(product => {
      const normalizedName = product.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
      
      return normalizedName.includes(normalizedQuery);
    });
  }
}

export const productsService = new ProductsService();

export const useProducts = () => {
  return productsService;
};
