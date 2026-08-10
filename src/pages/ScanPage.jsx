import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/appStore';
import { scanService } from '../services/scanService';
import { ocrService } from '../services/ocrService';
import { cleanCardService } from '../services/cleanCardService';
import { storageService } from '../services/storageService';
import ScanCameraUI from '../components/ScanCameraUI';
import ScanReviewUI from '../components/ScanReviewUI';
import ScanNamingUI from '../components/ScanNamingUI';
import styles from './ScanPage.module.css';

const STEPS = {
  CAPTURE: 'capture',
  REVIEW: 'review',
  NAME: 'name',
  GENERATE: 'generate',
  COMPLETE: 'complete'
};

export default function ScanPage() {
  const { createCard, loadCards, currentFolder } = useAppStore();
  const [currentStep, setCurrentStep] = useState(STEPS.CAPTURE);
  const [scannedBlobs, setScannedBlobs] = useState([]);
  const [ocrResults, setOcrResults] = useState([]);
  const [cleanCardImages, setCleanCardImages] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleCapture = async (blobs) => {
    setScannedBlobs(blobs);
    setCurrentStep(STEPS.REVIEW);
  };

  const handleReviewContinue = async (reviewedBlobs) => {
    setScannedBlobs(reviewedBlobs);
    setCurrentStep(STEPS.NAME);
  };

  const handleCreateCard = async (name, tags, selectedFolderId) => {
    setProcessing(true);
    setProgress(0);

    try {
      // 1. Sauvegarder les images originales
      const imageIds = [];
      for (let i = 0; i < scannedBlobs.length; i++) {
        const imageId = await storageService.saveImage(scannedBlobs[i]);
        imageIds.push(imageId);
        setProgress(Math.round((i / scannedBlobs.length) * 20));
      }

      setProgress(25);

      // 2. Lancer l'OCR
      const ocrData = [];
      for (let i = 0; i < scannedBlobs.length; i++) {
        const img = new Image();
        img.src = URL.createObjectURL(scannedBlobs[i]);
        
        await new Promise((resolve) => {
          img.onload = async () => {
            const result = await ocrService.recognizeText(img);
            ocrData.push(result);
            setProgress(25 + Math.round((i / scannedBlobs.length) * 25));
            resolve();
          };
        });
      }

      setOcrResults(ocrData);
      setProgress(50);

      // 3. Générer les fiches propres (FEATURE CLÉE!)
      const cleanImages = [];
      for (let i = 0; i < scannedBlobs.length; i++) {
        const img = new Image();
        img.src = URL.createObjectURL(scannedBlobs[i]);

        await new Promise((resolve) => {
          img.onload = async () => {
            // Générer la version "propre" avec police cursive
            const canvas = await cleanCardService.generateCleanCard(
              img,
              ocrData[i].boxes
            );
            const blob = await cleanCardService.canvasToBlob(canvas);
            cleanImages.push(blob);
            setProgress(50 + Math.round((i / scannedBlobs.length) * 35));
            resolve();
          };
        });
      }

      setCleanCardImages(cleanImages);
      setProgress(85);

      // 4. Créer la fiche dans la base de données
      const recto = imageIds[0];
      const verso = imageIds[1] || null;

      const cardId = await createCard(
        name,
        recto,
        selectedFolderId || currentFolder?.id || null,
        tags
      );

      // Sauvegarder les données OCR
      await storageService.updateCard(cardId, {
        rectoOCRText: ocrData[0]?.plainText || '',
        rectoOCRBoxes: ocrData[0]?.boxes || [],
        versoOCRText: verso ? ocrData[1]?.plainText || '' : '',
        versoOCRBoxes: verso ? ocrData[1]?.boxes || [] : []
      });

      setProgress(100);
      setCurrentStep(STEPS.COMPLETE);

      // Recharger les fiches
      if (currentFolder) {
        await loadCards(currentFolder.id);
      }
    } catch (error) {
      console.error('Erreur lors de la création de la fiche:', error);
      alert('Erreur: ' + error.message);
      setCurrentStep(STEPS.CAPTURE);
    } finally {
      setProcessing(false);
    }
  };

  const handleRestart = () => {
    setScannedBlobs([]);
    setOcrResults([]);
    setCleanCardImages([]);
    setProgress(0);
    setCurrentStep(STEPS.CAPTURE);
  };

  return (
    <motion.div
      className={styles.page}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {currentStep === STEPS.CAPTURE && (
        <ScanCameraUI onCapture={handleCapture} />
      )}

      {currentStep === STEPS.REVIEW && (
        <ScanReviewUI
          images={scannedBlobs}
          onContinue={handleReviewContinue}
          onRestart={handleRestart}
        />
      )}

      {currentStep === STEPS.NAME && (
        <ScanNamingUI
          onCreateCard={handleCreateCard}
          onBack={() => setCurrentStep(STEPS.REVIEW)}
          isLoading={processing}
        />
      )}

      {currentStep === STEPS.GENERATE && (
        <div className={styles.processingScreen}>
          <h2 className="text-headline">Génération de la fiche propre...</h2>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-body-small text-muted">{progress}%</p>
        </div>
      )}

      {currentStep === STEPS.COMPLETE && (
        <div className={styles.completeScreen}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className={styles.checkmark}
          >
            ✓
          </motion.div>
          <h2 className="text-headline">Fiche créée!</h2>
          <p className="text-body-small text-muted">
            Votre fiche a été scannée, traitée avec OCR et une version propre a été générée.
          </p>
          <button className="btn btn-primary" onClick={handleRestart}>
            Scanner une autre fiche
          </button>
        </div>
      )}
    </motion.div>
  );
}
