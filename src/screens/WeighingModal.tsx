import React from 'react';
import { useAppStore } from '../store/useAppStore';
import styles from './WeighingModal.module.css';

const WeighingModal: React.FC = () => {
  const { 
    selectedProduct, 
    scaleWeight, 
    scaleStatus, 
    clearSelectedProduct, 
    addItemToOrder 
  } = useAppStore();

  if (!selectedProduct) return null;

  const isStable = scaleStatus === 'stable';
  const isWaiting = scaleStatus === 'waiting';
  const isUnstable = scaleStatus === 'unstable';
  const hasWeight = scaleWeight > 0;

  const totalPrice = scaleWeight * selectedProduct.pricePerUnit;

  const handleAdd = () => {
    if (isStable && hasWeight) {
      addItemToOrder(selectedProduct, scaleWeight);
    }
  };

  const formatMoney = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatWeight = (value: number) => {
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
  };

  return (
    <div className="modal-overlay">
      <div className={`modal-content ${styles.container}`}>
        
        <div className={styles.header}>
          <div className={styles.imageContainer} style={{ margin: '0 auto 16px' }}>
            {selectedProduct.image ? (
              <img 
                src={selectedProduct.image} 
                alt={selectedProduct.name} 
                className={styles.productImage} 
              />
            ) : (
              <div style={{ fontSize: '3rem' }}>🍎</div>
            )}
          </div>
          <h2 className={styles.productName}>{selectedProduct.name}</h2>
          <p className={styles.instructions}>
            R$ {selectedProduct.pricePerUnit.toFixed(2)} / kg
          </p>
        </div>

        <div className={styles.content}>
          <div className={`
            ${styles.scaleDisplay} 
            ${isStable ? styles.stable : ''} 
            ${isWaiting ? styles.waiting : ''}
          `}>
            
            <div className={`
              ${styles.scaleIcon}
              ${isUnstable ? styles.unstable : ''}
              ${isWaiting ? styles.waiting : ''}
            `}>
              {isStable ? '✅' : '⚖️'}
            </div>

            <div className={styles.weightValue}>
              {formatWeight(scaleWeight)}
              <span className={styles.weightUnit}>kg</span>
            </div>

            <div className={`
              ${styles.statusMessage}
              ${styles[scaleStatus]}
            `}>
              {isWaiting && "Coloque o item na balança"}
              {isUnstable && "Estabilizando..."}
              {isStable && "Peso confirmado"}
              {scaleStatus === 'overload' && "Erro: Peso excedido"}
            </div>

            <div className={styles.priceCalculation}>
              <span className={styles.priceLabel}>Total a pagar</span>
              <span className={styles.priceValue}>{formatMoney(totalPrice)}</span>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button 
            className="btn btn-cancel btn-lg" 
            onClick={clearSelectedProduct}
          >
            CANCELAR
          </button>
          
          <button 
            className="btn btn-primary btn-lg" 
            disabled={!isStable || !hasWeight}
            onClick={handleAdd}
          >
            ADICIONAR
          </button>
        </div>
      </div>
    </div>
  );
};

export default WeighingModal;
