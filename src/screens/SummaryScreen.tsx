import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { ordersService } from '../services/ordersService';
import styles from './SummaryScreen.module.css';

const ArrowLeftIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5" />
    <path d="M12 19l-7-7 7-7" />
  </svg>
);

const CheckIcon = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const AlertIcon = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const ShoppingBagIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

const SpinnerIcon = () => (
  <svg className={styles.spinner} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

export const SummaryScreen: React.FC = () => {
  const { currentOrder, customerName, resetOrder, setScreen } = useAppStore();
  
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [resultMessage, setResultMessage] = useState('');
  const [orderId, setOrderId] = useState<number | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatQuantity = (quantity: number, isWeighed: boolean) => {
    if (isWeighed) {
      return `${quantity.toFixed(3).replace('.', ',')} kg`;
    }
    return `${quantity} un`;
  };

  const handleConfirm = async () => {
    if (!currentOrder) return;

    setStatus('submitting');
    
    try {
      const result = await ordersService.submitOrder(currentOrder);
      
      if (result.success) {
        setOrderId(result.orderId || null);
        setStatus('success');
      } else {
        setResultMessage(result.message);
        setStatus('error');
      }
    } catch (error) {
      setResultMessage('Ocorreu um erro inesperado. Tente novamente.');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className={`${styles.container} animate-fade-in`}>
        <div className={styles.centerContent}>
          <div className={styles.successIconWrapper}>
            <CheckIcon />
          </div>
          <h1 className={styles.statusTitle}>Pedido Confirmado!</h1>
          <p className={styles.statusMessage}>
            Seu pedido {orderId ? `#${orderId}` : ''} foi enviado para o balcão.
          </p>
          <p className={styles.statusSubMessage}>
            Dirija-se ao caixa para realizar o pagamento.
          </p>
          
          <button 
            className={`btn btn-primary btn-lg ${styles.actionButton}`}
            onClick={resetOrder}
          >
            NOVO PEDIDO
          </button>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className={`${styles.container} animate-fade-in`}>
        <div className={styles.centerContent}>
          <div className={styles.errorIconWrapper}>
            <AlertIcon />
          </div>
          <h1 className={styles.statusTitle}>Algo deu errado</h1>
          <p className={styles.statusMessage}>{resultMessage}</p>
          
          <div className={styles.buttonGroup}>
            <button 
              className={`btn btn-primary btn-lg ${styles.actionButton}`}
              onClick={() => setStatus('idle')}
            >
              TENTAR NOVAMENTE
            </button>
            <button 
              className={`btn btn-secondary ${styles.actionButton}`}
              onClick={() => setScreen('products')}
            >
              VOLTAR
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentOrder || currentOrder.items.length === 0) {
    return (
      <div className={`${styles.container} animate-fade-in`}>
        <header className={styles.header}>
          <button 
            className={styles.backButton}
            onClick={() => setScreen('products')}
          >
            <ArrowLeftIcon />
            VOLTAR
          </button>
        </header>
        <div className={styles.centerContent}>
          <ShoppingBagIcon />
          <h2 className={styles.emptyTitle}>Seu carrinho está vazio</h2>
          <button 
            className={`btn btn-primary ${styles.actionButton}`}
            onClick={() => setScreen('products')}
          >
            ADICIONAR PRODUTOS
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} animate-fade-in`}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <button 
            className={styles.backButton}
            onClick={() => setScreen('products')}
            disabled={status === 'submitting'}
          >
            <ArrowLeftIcon />
            VOLTAR
          </button>
          <div className={styles.customerInfo}>
            <span className={styles.greeting}>Olá,</span>
            <span className={styles.customerName}>{customerName}</span>
          </div>
        </div>
        <h1 className={styles.pageTitle}>Resumo do Pedido</h1>
      </header>
      <main className={styles.scrollArea}>
        <div className={styles.itemsList}>
          {currentOrder.items.map((item) => (
            <div key={item.id} className={styles.itemCard}>
              <div className={styles.itemImage}>
                {item.product.image ? (
                  <img src={item.product.image} alt={item.product.name} />
                ) : (
                  <div className={styles.placeholderImage}>
                    <ShoppingBagIcon />
                  </div>
                )}
              </div>
              
              <div className={styles.itemDetails}>
                <h3 className={styles.itemName}>{item.product.name}</h3>
                <div className={styles.itemMeta}>
                  <span className={styles.itemQuantity}>
                    {formatQuantity(item.quantity, !!item.product.requiresScale)}
                  </span>
                  <span className={styles.itemUnitPrice}>
                    x {formatCurrency(item.product.pricePerUnit)}
                  </span>
                </div>
              </div>
              
              <div className={styles.itemTotal}>
                {formatCurrency(item.subtotal)}
              </div>
            </div>
          ))}
        </div>
      </main>
      <footer className={styles.footer}>
        <div className={styles.totalRow}>
          <span className={styles.totalLabel}>Total a Pagar</span>
          <span className={styles.totalValue}>{formatCurrency(currentOrder.total)}</span>
        </div>
        
        <div className={styles.actions}>
          <button 
            className={`btn btn-primary btn-lg btn-full ${styles.confirmButton}`}
            onClick={handleConfirm}
            disabled={status === 'submitting'}
          >
            {status === 'submitting' ? (
              <>
                <SpinnerIcon />
                PROCESSANDO...
              </>
            ) : (
              'CONFIRMAR E PAGAR'
            )}
          </button>
          
          <button 
            className={`btn btn-secondary ${styles.secondaryButton}`}
            onClick={() => setScreen('products')}
            disabled={status === 'submitting'}
          >
            VOLTAR PARA PRODUTOS
          </button>
          
          <button 
            className={styles.cancelLink}
            onClick={resetOrder}
            disabled={status === 'submitting'}
          >
            CANCELAR PEDIDO
          </button>
        </div>
      </footer>
    </div>
  );
};
