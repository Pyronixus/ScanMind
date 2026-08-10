import html2canvas from 'html2canvas';

export const scanService = {
  /**
   * Ouvre la caméra pour scanner un document
   * @returns {Promise<Array<Blob>>} Array d'images scannées
   */
  async scanWithCamera() {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      navigator.mediaDevices
        .getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }
        })
        .then((stream) => {
          video.srcObject = stream;
          video.play();

          // Attendre que la vidéo soit chargée
          video.onloadedmetadata = () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            // Interface UI pour capturer/valider
            showCameraUI(video, canvas, ctx, stream, resolve, reject);
          };
        })
        .catch((error) => {
          reject(new Error('Impossible d\'accéder à la caméra: ' + error.message));
        });
    });
  },

  /**
   * Simule un scan depuis un fichier image
   * @param {File} file
   * @returns {Promise<Blob>}
   */
  async scanFromFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Appliquer les filtres de scan (contraste, netteté)
          const scanImage = this._applyScanFilters(img);
          scanImage.toBlob((blob) => {
            resolve(blob);
          }, 'image/jpeg', 0.92);
        };
        img.onerror = () => reject(new Error('Impossible de charger l\'image'));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
      reader.readAsDataURL(file);
    });
  },

  /**
   * Applique les filtres de scan (contraste, netteté, redressement)
   */
  _applyScanFilters(image) {
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext('2d');

    // Dessiner l'image
    ctx.drawImage(image, 0, 0);

    // 1. Augmenter le contraste
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Appliquer une courbe de contraste
    for (let i = 0; i < data.length; i += 4) {
      data[i] = this._contrastValue(data[i]); // R
      data[i + 1] = this._contrastValue(data[i + 1]); // G
      data[i + 2] = this._contrastValue(data[i + 2]); // B
    }

    ctx.putImageData(imageData, 0, 0);

    // 2. Ajouter une légère netteté (convolution)
    // Simplifié : on peut ajouter plus de traitement si nécessaire

    // 3. Détecter et corriger l'angle (très simplifié)
    // Dans une vraie app, utiliser une lib de détection de bords

    return canvas;
  },

  _contrastValue(value) {
    // Courbe S pour augmenter le contraste
    const contrast = 1.5;
    return Math.min(255, Math.max(0, ((value - 128) * contrast + 128)));
  }
};

/**
 * UI pour la capture caméra
 */
function showCameraUI(video, canvas, ctx, stream, resolve, reject) {
  // Créer un conteneur pour la caméra
  const container = document.createElement('div');
  container.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: black;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 10000;
  `;

  // Video element
  video.style.cssText = `
    max-width: 100%;
    max-height: 80%;
    object-fit: contain;
  `;

  // Boutons
  const buttonsDiv = document.createElement('div');
  buttonsDiv.style.cssText = `
    display: flex;
    gap: 16px;
    margin-top: 20px;
  `;

  const captureBtn = document.createElement('button');
  captureBtn.textContent = '📸 Capturer';
  captureBtn.style.cssText = `
    padding: 12px 24px;
    font-size: 16px;
    background: #2F4B7C;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
  `;

  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = '✕ Annuler';
  cancelBtn.style.cssText = `
    padding: 12px 24px;
    font-size: 16px;
    background: #8A8A93;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
  `;

  const scannedImages = [];

  captureBtn.onclick = () => {
    // Capturer le frame vidéo
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      scannedImages.push(blob);

      // Proposer de continuer ou valider
      const continueDiv = document.createElement('div');
      continueDiv.style.cssText = `
        position: absolute;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(255, 255, 255, 0.9);
        padding: 16px;
        border-radius: 12px;
        text-align: center;
      `;

      continueDiv.innerHTML = `
        <p style="color: #16161A; margin-bottom: 16px;">
          ${scannedImages.length} page(s) capturée(s)
        </p>
      `;

      const continueCaptureBtn = document.createElement('button');
      continueCaptureBtn.textContent = '+ Scanner une autre page';
      continueCaptureBtn.style.cssText = `
        padding: 10px 16px;
        margin-right: 10px;
        background: #2F4B7C;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
      `;

      const validateBtn = document.createElement('button');
      validateBtn.textContent = '✓ Valider';
      validateBtn.style.cssText = `
        padding: 10px 16px;
        background: #2E9E6B;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
      `;

      continueCaptureBtn.onclick = () => {
        continueDiv.remove();
      };

      validateBtn.onclick = () => {
        stream.getTracks().forEach((track) => track.stop());
        container.remove();
        resolve(scannedImages);
      };

      continueDiv.appendChild(continueCaptureBtn);
      continueDiv.appendChild(validateBtn);
      container.appendChild(continueDiv);
    }, 'image/jpeg', 0.92);
  };

  cancelBtn.onclick = () => {
    stream.getTracks().forEach((track) => track.stop());
    container.remove();
    reject(new Error('Scan annulé par l\'utilisateur'));
  };

  buttonsDiv.appendChild(captureBtn);
  buttonsDiv.appendChild(cancelBtn);

  container.appendChild(video);
  container.appendChild(buttonsDiv);
  document.body.appendChild(container);
}
