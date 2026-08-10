import React, { useState } from 'react';
import { motion } from 'framer-motion';
import styles from './ScanReviewUI.module.css';

export default function ScanReviewUI({ images, onContinue, onRestart }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviewedImages, setReviewedImages] = useState([...images]);

  const handleDeleteCurrent = () => {
    const newImages = reviewedImages.filter((_, i) => i !== currentIndex);
    setReviewedImages(newImages);
    if (currentIndex >= newImages.length && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleContinue = () => {
    if (reviewedImages.length === 0) {
      alert('Veuillez conserver au moins une page');
      return;
    }
    onContinue(reviewedImages);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < reviewedImages.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className={styles.header}>
        <button onClick={onRestart} className="btn btn-secondary">
          ← Recommencer
        </button>
        <h2 className="text-headline">
          {currentIndex + 1} / {reviewedImages.length}
        </h2>
        <div style={{ width: '80px' }} />
      </div>

      <div className={styles.imageContainer}>
        {reviewedImages.length > 0 && (
          <motion.img
            key={currentIndex}
            src={URL.createObjectURL(reviewedImages[currentIndex])}
            alt={`Scan ${currentIndex + 1}`}
            className={styles.image}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </div>

      <div className={styles.footer}>
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="btn btn-secondary"
        >
          ← Précédent
        </button>

        <motion.button
          onClick={handleDeleteCurrent}
          className={styles.deleteButton}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          🗑️ Supprimer
        </motion.button>

        <button
          onClick={handleNext}
          disabled={currentIndex === reviewedImages.length - 1}
          className="btn btn-secondary"
        >
          Suivant →
        </button>

        <motion.button
          onClick={handleContinue}
          className="btn btn-primary"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Continuer →
        </motion.button>
      </div>
    </motion.div>
  );
}
