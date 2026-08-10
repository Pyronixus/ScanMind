/**
 * Service pour générer des fiches propres :
 * - Analyse l'image avec OCR
 * - Redessine le texte avec police cursive
 * - Garde les positions exactes
 * - Conserve couleurs/soulignages
 */

export const cleanCardService = {
  /**
   * Génère une fiche propre à partir d'une image
   * @param {HTMLImageElement} originalImage
   * @param {Array} ocrBoxes - Boîtes englobantes du texte
   * @returns {Promise<Canvas>} Canvas avec le texte propre
   */
  async generateCleanCard(originalImage, ocrBoxes) {
    const canvas = document.createElement('canvas');
    canvas.width = originalImage.width;
    canvas.height = originalImage.height;
    const ctx = canvas.getContext('2d');

    // 1. Dessiner l'image de fond (légèrement plus claire/floutée)
    ctx.drawImage(originalImage, 0, 0);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Extraire les zones de texte original (pour couleur)
    const colorMap = await this._extractTextColors(originalImage, ocrBoxes);

    // 3. Redessiner le texte avec police cursive
    ctx.font = "700 24px 'Caveat', 'Indie Flower', cursive";
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ocrBoxes.forEach((box) => {
      const x = box.x * canvas.width;
      const y = (box.y + box.height * 0.8) * canvas.height; // Baseline
      const textColor = colorMap[`${box.x}-${box.y}`] || '#16161A';

      ctx.fillStyle = textColor;
      ctx.fillText(box.text, x, y);

      // Ajouter un léger soulignage de couleur
      const textWidth = ctx.measureText(box.text).width;
      ctx.strokeStyle = textColor;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.moveTo(x, y + 2);
      ctx.lineTo(x + textWidth, y + 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    });

    return canvas;
  },

  /**
   * Extrait les couleurs dominantes des zones de texte
   * pour les réappliquer au texte propre
   */
  async _extractTextColors(image, boxes) {
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);

    const colorMap = {};

    boxes.forEach((box) => {
      const x = box.x * image.width;
      const y = box.y * image.height;
      const width = Math.max(box.width * image.width, 20);
      const height = Math.max(box.height * image.height, 20);

      // Récupérer les pixels de la zone
      const imageData = ctx.getImageData(x, y, width, height);
      const data = imageData.data;

      // Calculer la couleur moyenne (excluant le blanc et le fond)
      let r = 0, g = 0, b = 0, count = 0;
      for (let i = 0; i < data.length; i += 4) {
        const pixelR = data[i];
        const pixelG = data[i + 1];
        const pixelB = data[i + 2];
        const brightness = (pixelR + pixelG + pixelB) / 3;

        // Ignorer les pixels blancs/gris clairs
        if (brightness < 200) {
          r += pixelR;
          g += pixelG;
          b += pixelB;
          count++;
        }
      }

      if (count > 0) {
        r = Math.round(r / count);
        g = Math.round(g / count);
        b = Math.round(b / count);
        const hex = `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
        colorMap[`${box.x}-${box.y}`] = hex;
      }
    });

    return colorMap;
  },

  /**
   * Analyse les soulignages et mises en évidence dans l'image
   * @returns {Array} Zones à surligner
   */
  async _detectHighlights(image, boxes) {
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);

    const highlights = [];
    const colorThreshold = 100; // Détection des couleurs saturées

    // Parcourir la zone de texte
    boxes.forEach((box) => {
      const x = box.x * image.width;
      const y = box.y * image.height;
      const width = box.width * image.width;
      const height = box.height * image.height;

      const imageData = ctx.getImageData(x, y, width, height);
      const data = imageData.data;

      // Détecter les pixels colorés (surlignage)
      let hasHighlight = false;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const saturation = Math.max(r, g, b) - Math.min(r, g, b);

        if (saturation > colorThreshold) {
          hasHighlight = true;
          break;
        }
      }

      if (hasHighlight) {
        highlights.push(box);
      }
    });

    return highlights;
  },

  /**
   * Génère une fiche EXTRÊMEMENT propre (texte uniquement, fond blanc)
   * @param {Array} ocrBoxes
   * @returns {Promise<Canvas>}
   */
  async generateUltraClean(ocrBoxes, width = 800, height = 1000) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Fond blanc
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    // Redessiner le texte
    ctx.font = "600 18px 'Caveat', 'Indie Flower', cursive";
    ctx.fillStyle = '#16161A';
    ctx.lineHeight = 1.6;

    const padding = 40;
    const maxWidth = width - padding * 2;
    let y = padding;

    ocrBoxes.forEach((box) => {
      // Adapter la position au canvas ultra-clean
      const x = padding;
      y += 28; // Interligne

      ctx.fillText(box.text, x, y);
    });

    return canvas;
  },

  /**
   * Convertir canvas en blob pour téléchargement/stockage
   */
  canvasToBlob(canvas) {
    return new Promise((resolve) => {
      canvas.toBlob(resolve, 'image/webp', 0.92);
    });
  },

  /**
   * Convertir canvas en data URL
   */
  canvasToDataURL(canvas) {
    return canvas.toDataURL('image/webp', 0.92);
  }
};
