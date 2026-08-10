import React, { useEffect } from 'react';
import { useAppStore } from './store/appStore';
import ExplorerPage from './pages/ExplorerPage';
import ScanPage from './pages/ScanPage';
import StatsPage from './pages/StatsPage';
import FloatingTabBar from './components/FloatingTabBar';
import './styles/global.css';

export default function App() {
  const { currentTab, setCurrentTab, loadFolders, loadStats } = useAppStore();

  useEffect(() => {
    // Initialiser les données au démarrage
    loadFolders();
    loadStats();

    // Enregistrer la PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.log('Service Worker enregistrement échoué:', err);
      });
    }
  }, []);

  return (
    <div className="app-container">
      <div className="content-area">
        {currentTab === 'fiches' && <ExplorerPage />}
        {currentTab === 'scan' && <ScanPage />}
        {currentTab === 'stats' && <StatsPage />}
      </div>

      <FloatingTabBar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
      />
    </div>
  );
}

// Styles pour l'app container
const styles = `
  .app-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    position: relative;
  }

  .content-area {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding-bottom: 100px; /* Espace pour la tab bar */
  }

  @supports (padding: max(0px)) {
    .content-area {
      padding-bottom: calc(100px + max(0px, env(safe-area-inset-bottom)));
    }
  }
`;

if (!document.querySelector('style[data-app-styles]')) {
  const style = document.createElement('style');
  style.setAttribute('data-app-styles', '');
  style.textContent = styles;
  document.head.appendChild(style);
}
