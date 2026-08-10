import React from 'react';
import { motion } from 'framer-motion';
import styles from './FolderGrid.module.css';

const COLORS = {
  '#2F4B7C': '🔵',
  '#2E9E6B': '💚',
  '#8E5AA8': '💜',
  '#D96B4A': '🔴',
  '#3D8FA6': '🔷',
  '#A8455C': '❤️',
  '#5C6B4E': '🟢'
};

export default function FolderGrid({ folders, onFolderClick, onDeleteClick }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      className={styles.grid}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {folders.map((folder) => (
        <motion.div
          key={folder.id}
          className={styles.folderCard}
          variants={itemVariants}
          onClick={() => onFolderClick(folder)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div
            className={styles.folderIcon}
            style={{ backgroundColor: folder.colorHex + '20', borderColor: folder.colorHex }}
          >
            <span style={{ fontSize: '40px' }}>📁</span>
          </div>
          <h3 className={styles.folderName}>{folder.name}</h3>
          <button
            className={styles.deleteButton}
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`Supprimer "${folder.name}" ?`)) {
                onDeleteClick(folder.id);
              }
            }}
            title="Supprimer"
          >
            🗑️
          </button>
        </motion.div>
      ))}
    </motion.div>
  );
}
