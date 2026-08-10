import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import styles from './ScanCameraUI.module.css';

export default function ScanCameraUI({ onCapture }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [stream, setStream] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [scannedImages, setScannedImages] = useState([]);
  const fileInputRef = useRef(null);

  const handleCameraClick = async () => {
    setLoading(true);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setCameraActive(true);
    } catch (error) {
      alert('Erreur accès caméra: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      setScannedImages([...scannedImages, blob]);

      // Show confirmation
      const audio = new Audio(
        'data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA=='
      );
      audio.play().catch(() => {});
    }, 'image/jpeg', 0.92);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);

          canvas.toBlob((blob) => {
            setScannedImages([...scannedImages, blob]);
          }, 'image/jpeg', 0.92);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (scannedImages.length === 0) {
      alert('Veuillez capturer au moins une page');
      return;
    }

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    onCapture(scannedImages);
  };

  const handleStopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setCameraActive(false);
  };

  if (cameraActive) {
    return (
      <motion.div
        className={styles.cameraContainer}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <video
          ref={videoRef}
          className={styles.video}
          autoPlay
          playsInline
        />

        <canvas ref={canvasRef} style={{ display: 'none' }} />

        <div className={styles.overlay}>
          <div className={styles.guidelines}>
            <div className={styles.corner} />
            <div className={styles.corner} />
            <div className={styles.corner} />
            <div className={styles.corner} />
          </div>
        </div>

        <div className={styles.controls}>
          <button
            className={`${styles.button} ${styles.stopButton}`}
            onClick={handleStopCamera}
          >
            ✕ Fermer
          </button>

          <button
            className={`${styles.button} ${styles.captureButton}`}
            onClick={handleCapture}
          >
            📸 Capturer ({scannedImages.length})
          </button>

          <button
            className={`${styles.button} ${styles.continueButton}`}
            onClick={handleContinue}
            disabled={scannedImages.length === 0}
          >
            ✓ Continuer
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className={styles.content}>
        <h1 className="text-display-large">Scanner une fiche</h1>

        <div className={styles.options}>
          <motion.button
            className="btn btn-primary"
            onClick={handleCameraClick}
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center' }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            📷 Ouvrir la caméra
          </motion.button>

          <label className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', cursor: 'pointer' }}>
            📁 Charger une image
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={loading}
              style={{ display: 'none' }}
              ref={fileInputRef}
            />
          </label>
        </div>

        {loading && <p className="text-body-small text-muted">Chargement...</p>}
      </div>
    </motion.div>
  );
}
