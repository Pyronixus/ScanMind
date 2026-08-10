import React, { useState } from 'react';
import { motion } from 'framer-motion';
import styles from './CreateFolderModal.module.css';

const COLORS = [
  '#2F4B7C', '#2E9E6B', '#8E5AA8', '#D96B4A',
  '#3D8FA6', '#A8455C', '#5C6B4E', '#B8843F'
];

export default function CreateFolderModal({ onCreateFolder, onClose }) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);

  const handleSubmit = () => {
    if (name.trim()) {
      onCreateFolder(name.trim(), color);
      onClose();
    }
  };

  return (
    <motion.div
      className={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className={styles.modal}
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-headline">Nouveau dossier</h2>

        <div className={styles.formGroup}>
          <label className="text-subheadline">Nom</label>
          <input
            type="text"
            placeholder="Mon dossier"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            autoFocus
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label className="text-subheadline">Couleur</label>
          <div className={styles.colorGrid}>
            {COLORS.map((c) => (
              <motion.button
                key={c}
                className={`${styles.colorButton} ${color === c ? styles.selected : ''}`}
                style={{ backgroundColor: c }}
                onClick={() => setColor(c)}
                title={c}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              />
            ))}
          </div>
        </div>

        <div className={styles.actions}>
          <button onClick={onClose} className="btn btn-secondary">
            Annuler
          </button>
          <motion.button
            onClick={handleSubmit}
            className="btn btn-primary"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Créer
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
