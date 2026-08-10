import React from 'react';
import { motion } from 'framer-motion';
import styles from './FloatingTabBar.module.css';

const TABS = [
  { id: 'fiches', label: 'Fiches', icon: '📁' },
  { id: 'scan', label: 'Scan', icon: '📷' },
  { id: 'stats', label: 'Stats', icon: '📊' }
];

export default function FloatingTabBar({ currentTab, onTabChange }) {
  const handleTabClick = (tabId) => {
    const audio = new Audio('data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==');
    audio.play().catch(() => {}); // Haptic feedback simple
    onTabChange(tabId);
  };

  return (
    <div className={styles.container}>
      <motion.div
        className={styles.tabBar}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <div className={styles.tabs}>
          {TABS.map((tab) => (
            <motion.button
              key={tab.id}
              className={`${styles.tabButton} ${currentTab === tab.id ? styles.active : ''}`}
              onClick={() => handleTabClick(tab.id)}
              layout
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            >
              <span className={styles.icon}>{tab.icon}</span>
              {currentTab === tab.id && (
                <motion.span
                  className={styles.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {tab.label}
                </motion.span>
              )}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
