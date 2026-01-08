import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import styles from './IdentificationScreen.module.css';

export const IdentificationScreen: React.FC = () => {
  const { setCustomerName, startOrder, setScreen, resetOrder } = useAppStore();
  const [name, setName] = useState('');

  useEffect(() => {
    setName('');
  }, []);

  const handleContinue = () => {
    if (name.trim()) {
      setCustomerName(name.trim());
      startOrder();
    }
  };

  const handleBack = () => {
    resetOrder();
    setScreen('idle');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && name.trim()) {
      handleContinue();
    }
  };

  return (
    <div className={styles.container}>
      <main className={styles.content}>
        <div className={styles.iconWrapper} role="img" aria-label="Acenando">
          👋
        </div>

        <h1 className={styles.title}>
          Olá! Qual é o seu nome?
        </h1>

        <div className={styles.inputWrapper}>
          <input
            type="text"
            className={styles.input}
            placeholder="Digite seu nome aqui"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            autoComplete="off"
            aria-label="Seu nome"
          />
        </div>

        <div className={styles.actions}>
          <button
            className={styles.buttonContinue}
            onClick={handleContinue}
            disabled={!name.trim()}
          >
            CONTINUAR
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <button
            className={styles.buttonBack}
            onClick={handleBack}
          >
            Voltar ao início
          </button>
        </div>
      </main>
    </div>
  );
};
