import './index.css';
import { useAppStore } from './store/useAppStore';
import { IdleScreen } from './screens/IdleScreen';
import { IdentificationScreen } from './screens/IdentificationScreen';
import { ProductsScreen } from './screens/ProductsScreen';
import WeighingModal from './screens/WeighingModal';
import { useEffect } from 'react';

function App() {
  const { currentScreen, resetOrder, updateInteractionTime, lastInteractionTime } = useAppStore();

  useEffect(() => {
    const INACTIVITY_TIMEOUT = 2 * 60 * 1000;

    const checkInactivity = () => {
      const now = Date.now();
      if (now - lastInteractionTime > INACTIVITY_TIMEOUT && currentScreen !== 'idle') {
        resetOrder();
      }
    };

    const interval = setInterval(checkInactivity, 10000); 
    return () => clearInterval(interval);
  }, [lastInteractionTime, currentScreen, resetOrder]);

  useEffect(() => {
    const handleInteraction = () => {
      updateInteractionTime();
    };

    window.addEventListener('touchstart', handleInteraction);
    window.addEventListener('click', handleInteraction);
    window.addEventListener('keydown', handleInteraction);

    return () => {
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, [updateInteractionTime]);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'idle':
        return <IdleScreen />;
      case 'identification':
        return <IdentificationScreen />;
      case 'products':
        return <ProductsScreen />;
      case 'weighing':
        return (
          <>
            <ProductsScreen />
            <WeighingModal />
          </>
        );
      case 'summary':
        return <ProductsScreen />;
      default:
        return <IdleScreen />;
    }
  };

  return renderScreen();
}

export default App;
