import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { productsService } from '../services/productsService';
import { mockProducts } from '../data/products';
import type { Product } from '../types';
import styles from './ProductsScreen.module.css';

const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ç/g, 'c')
    .replace(/ñ/g, 'n')
    .trim();
};

const SearchIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.3-4.3"/>
  </svg>
);

const ClearIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="m15 9-6 6"/>
    <path d="m9 9 6 6"/>
  </svg>
);

const ScaleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/>
    <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/>
    <path d="M7 21h10"/>
    <path d="M12 3v18"/>
    <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18"/>
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
  </svg>
);

const UserIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const ShoppingBagIcon = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
    <path d="M3 6h18"/>
    <path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

export const ProductsScreen: React.FC = () => {
  const { 
    customerName, 
    currentOrder, 
    selectProduct, 
    removeItemFromOrder, 
    resetOrder,
    setScreen 
  } = useAppStore();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cartEndRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Carrega produtos da API ao montar o componente
  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const apiProducts = await productsService.getProducts();
        if (apiProducts.length > 0) {
          setProducts(apiProducts);
        } else {
          // Fallback para mock se API retornar vazio
          setProducts(mockProducts);
        }
      } catch (err) {
        console.error('Erro ao carregar produtos da API:', err);
        setError('Não foi possível carregar os produtos do servidor. Usando dados locais.');
        // Fallback para mock em caso de erro
        setProducts(mockProducts);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) {
      return products;
    }
    const normalizedQuery = normalizeText(searchQuery);
    return products.filter(product => {
      const normalizedName = normalizeText(product.name);
      return normalizedName.includes(normalizedQuery);
    });
  }, [searchQuery, products]);

  useEffect(() => {
    if (cartEndRef.current) {
      cartEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentOrder?.items.length]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 900) {
        setIsCartOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleFinalize = () => {
    if (currentOrder && currentOrder.items.length > 0) {
      setScreen('summary');
    }
  };

  const itemCount = currentOrder?.items.length || 0;
  const total = currentOrder?.total || 0;

  const CartContent = () => (
    <>
      <div className={styles.cartHeader}>
        <div className={styles.customerInfo}>
          <div className={styles.avatar}>
            <UserIcon />
          </div>
          <div className={styles.greeting}>
            <span className={styles.greetingLabel}>Cliente</span>
            <span className={styles.customerName}>{customerName || 'Visitante'}</span>
          </div>
        </div>
        <button 
          className={styles.closeButton}
          onClick={() => setIsCartOpen(false)}
          aria-label="Fechar carrinho"
        >
          <CloseIcon />
        </button>
      </div>

      <div className={styles.cartList}>
        {!currentOrder || currentOrder.items.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <ShoppingBagIcon />
            </div>
            <p className={styles.emptyText}>Seu carrinho está vazio</p>
            <p className="text-muted text-center text-sm">Toque nos produtos ao lado para começar</p>
          </div>
        ) : (
          <>
            {currentOrder.items.map((item) => (
              <div key={item.id} className={styles.cartItem}>
                <img 
                  src={item.product.image} 
                  alt={item.product.name} 
                  className={styles.itemImage} 
                />
                <div className={styles.itemInfo}>
                  <div className={styles.itemName}>{item.product.name}</div>
                  <div className={styles.itemDetails}>
                    {item.product.unit === 'kg' 
                      ? `${item.quantity.toFixed(3).replace('.', ',')} kg x ${formatCurrency(item.product.pricePerUnit)}`
                      : `${item.quantity} un x ${formatCurrency(item.product.pricePerUnit)}`
                    }
                  </div>
                </div>
                <div className={styles.itemPrice}>
                  {formatCurrency(item.subtotal)}
                </div>
                <button 
                  className={styles.removeButton}
                  onClick={() => removeItemFromOrder(item.id)}
                  aria-label="Remover item"
                >
                  <TrashIcon />
                </button>
              </div>
            ))}
            <div ref={cartEndRef} />
          </>
        )}
      </div>

      <div className={styles.cartFooter}>
        <div className={styles.summaryRow}>
          <span className={styles.totalLabel}>Total a Pagar</span>
          <span className={styles.totalValue}>
            {formatCurrency(currentOrder?.total || 0)}
          </span>
        </div>

        <div className={styles.actions}>
          <button 
            className="btn btn-primary btn-lg btn-full"
            onClick={handleFinalize}
            disabled={!currentOrder || currentOrder.items.length === 0}
          >
            FINALIZAR COMPRA
          </button>
          
          <button 
            className={styles.restartButton + " btn btn-lg"}
            onClick={resetOrder}
          >
            RECOMEÇAR
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className={styles.container}>
      <main className={styles.productsSection}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Produtos</h1>
            <p className={styles.subtitle}>Selecione os itens para adicionar ao carrinho</p>
          </div>
        </header>

        {/* Estado de erro */}
        {error && (
          <div className={styles.errorBanner}>
            <span>⚠️ {error}</span>
          </div>
        )}

        <div className={styles.searchContainer}>
          <div className={styles.searchInputWrapper}>
            <SearchIcon />
            <input
              ref={searchInputRef}
              type="text"
              className={styles.searchInput}
              placeholder="Buscar produto... (ex: maca, banana)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Buscar produtos"
            />
            {searchQuery && (
              <button 
                className={styles.clearButton}
                onClick={() => setSearchQuery('')}
                aria-label="Limpar busca"
              >
                <ClearIcon />
              </button>
            )}
          </div>
          {searchQuery && (
            <p className={styles.searchResults}>
              {filteredProducts.length} produto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        <div className={styles.grid}>
          {isLoading ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner} />
              <p>Carregando produtos...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className={styles.noResults}>
              <p>Nenhum produto encontrado para "{searchQuery}"</p>
              <button 
                className="btn btn-secondary"
                onClick={() => setSearchQuery('')}
              >
                Limpar busca
              </button>
            </div>
          ) : (
            filteredProducts.map((product) => (
            <button
              key={product.id}
              className={`${styles.card} animate-scale-in`}
              onClick={() => selectProduct(product)}
              aria-label={`Adicionar ${product.name}`}
            >
              <div className={styles.imageContainer}>
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className={styles.productImage}
                  loading="lazy"
                />
                {product.requiresScale && (
                  <div className={styles.scaleIcon} title="Produto pesável">
                    <ScaleIcon />
                  </div>
                )}
              </div>
              
              <div className={styles.info}>
                <h3 className={styles.productName}>{product.name}</h3>
                
                <div className={styles.priceContainer}>
                  <span className={styles.currency}>R$</span>
                  <span className={styles.price}>
                    {product.pricePerUnit.toFixed(2).replace('.', ',')}
                  </span>
                  <span className={styles.unit}>
                    /{product.unit}
                  </span>
                </div>
              </div>
            </button>
          ))
          )}
        </div>
      </main>

      <aside className={styles.sidebar}>
        <CartContent />
      </aside>

      <div 
        className={`${styles.mobileCartOverlay} ${isCartOpen ? styles.open : ''}`}
        onClick={() => setIsCartOpen(false)}
      />
      
      <aside className={`${styles.mobileCart} ${isCartOpen ? styles.open : ''}`}>
        <CartContent />
      </aside>

      <button 
        className={styles.cartFab}
        onClick={() => setIsCartOpen(true)}
        aria-label="Abrir carrinho"
      >
        <ShoppingBagIcon size={28} />
        {itemCount > 0 && (
          <span className={styles.fabBadge}>{itemCount}</span>
        )}
        <span className={styles.fabTotal}>{formatCurrency(total)}</span>
      </button>
    </div>
  );
};
