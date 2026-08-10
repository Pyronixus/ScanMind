import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { storageService } from '../services/storageService';
import { useAppStore } from '../store/appStore';
import { cleanCardService } from '../services/cleanCardService';
import styles from './CardDetailModal.module.css';

export default function CardDetailModal({ card, onClose, onDelete }) {
  const { updateCard, recordReview } = useAppStore();
  const [imageURL, setImageURL] = useState(null);
  const [cleanImageURL, setCleanImageURL] = useState(null);
  const [tab, setTab] = useState('image');
  const [generatingClean, setGeneratingClean] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      if (card.rectoImageId) {
        const url = await storageService.getImageDataURL(card.rectoImageId);
        setImageURL(url);
      }
    };
    loadImage();
  }, [card.rectoImageId]);

  const handleGenerateClean = async () => {
    if (!imageURL) return;

    setGeneratingClean(true);
    try {
      const img = new Image();
      img.src = imageURL;

      await new Promise((resolve) => {
        img.onload = async () => {
          // Générer la version "ultra propre"
          const canvas = await cleanCardService.generateUltraClean(
            card.rectoOCRBoxes,
            800,
            1000
          );
          const url = cleanCardService.canvasToDataURL(canvas);
          setCleanImageURL(url);
          resolve();
        };
      });
    } finally {
      setGeneratingClean(false);
      setTab('clean');
    }
  };

  const handleReviewSuccess = async () => {
    await recordReview(card.id, true);
    alert('✓ Bravo! Niveau augmenté.');
  };

  const handleReviewFail = async () => {
    await recordReview(card.id, false);
    alert('À revoir. Niveau ajusté.');
  };

  const levelLabel = ['Nouvelle', 'Vue', 'Fragile', 'Correcte', 'Solide', 'Maîtrisée'][card.level] || 'Nouvelle';

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
        <div className={styles.header}>
          <div>
            <h2 className="text-headline">{card.name}</h2>
            <p className="text-caption text-muted">{levelLabel}</p>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.tabs}>
          {['image', 'ocr', 'clean', 'exercise'].map((t) => (
            <motion.button
              key={t}
              className={`${styles.tab} ${tab === t ? styles.active : ''}`}
              onClick={() => setTab(t)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {t === 'image' && '📷'}
              {t === 'ocr' && '📝'}
              {t === 'clean' && '✨'}
              {t === 'exercise' && '🎯'}
              <span className={styles.tabLabel}>{t}</span>
            </motion.button>
          ))}
        </div>

        <div className={styles.content}>
          {tab === 'image' && imageURL && (
            <motion.img
              src={imageURL}
              alt="Original"
              className={styles.image}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            />
          )}

          {tab === 'ocr' && (
            <motion.div
              className={styles.ocrText}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {card.rectoOCRText || 'Pas de texte détecté'}
            </motion.div>
          )}

          {tab === 'clean' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {cleanImageURL ? (
                <motion.img
                  src={cleanImageURL}
                  alt="Version propre"
                  className={styles.image}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                />
              ) : (
                <motion.button
                  onClick={handleGenerateClean}
                  className="btn btn-primary"
                  disabled={generatingClean}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {generatingClean ? 'Génération...' : '✨ Générer la version propre'}
                </motion.button>
              )}
            </motion.div>
          )}

          {tab === 'exercise' && (
            <motion.div
              className={styles.exercise}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-body">📚 Maîtrises-tu cette fiche?</p>
              <div className={styles.exerciseActions}>
                <motion.button
                  onClick={handleReviewSuccess}
                  className="btn btn-primary"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  ✓ Je maîtrise
                </motion.button>
                <motion.button
                  onClick={handleReviewFail}
                  className="btn btn-secondary"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  ✗ À revoir
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>

        <div className={styles.actions}>
          <motion.button
            onClick={() => onDelete(card.id)}
            className={styles.deleteButton}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            🗑️ Supprimer
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
