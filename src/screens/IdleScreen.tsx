import React, { useState, type MouseEvent } from 'react';
import styles from './IdleScreen.module.css';
import { useAppStore } from '../store/useAppStore';

export const IdleScreen: React.FC = () => {
  const setScreen = useAppStore((state) => state.setScreen);
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newRipple = { x, y, id: Date.now() };
    
    setRipples((prev) => [...prev, newRipple]);
    setTimeout(() => {
      setScreen('identification');
    }, 200);
  };

  React.useEffect(() => {
    if (ripples.length > 0) {
      const timer = setTimeout(() => {
        setRipples((prev) => prev.slice(1));
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [ripples]);

  return (
    <div className={styles.container} onClick={handleClick}>
      <div className={`${styles.decoration} ${styles.blob1}`} />
      <div className={`${styles.decoration} ${styles.blob2}`} />
      <div className={`${styles.decoration} ${styles.blob3}`} />

      <div className={styles.content}>

        <div className={styles.logoPlaceholder}>
          <div className={styles.logoIcon}>
            <span>LOGO</span>
          </div>
        </div>

        <div>
          <h1 className={styles.welcomeText}>Bem-vindo ao<br/>NETO</h1>
          <p className={styles.subText}>TESTE INSANO</p>
        </div>

        <div className={styles.ctaContainer}>
          <svg 
            className={styles.tapIcon} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 13v1a7 7 0 0 1-14 0v-1" />
            <line x1="12" y1="22" x2="12" y2="19" />
          </svg>
          <span className={styles.ctaText}>Toque para Começar</span>
        </div>
      </div>

      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className={styles.ripple}
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 100,
            height: 100,
            marginLeft: -50,
            marginTop: -50,
          }}
        />
      ))}
    </div>
  );
};
