import Tesseract from 'tesseract.js';

const worker = await Tesseract.createWorker(['fra', 'eng']);

export const ocrService = {
  /**
   * Reconnaît le texte dans une image
   * @param {HTMLImageElement | Canvas | Blob} image
   * @returns {Promise<{text: string, boxes: Array}>}
   */
  async recognizeText(image) {
    try {
      const result = await worker.recognize(image);
      const { text, data } = result;

      // Extraire les boîtes englobantes
      const boxes = data.words.map((word) => ({
        text: word.text,
        x: word.bbox.x0 / data.width, // Normalisé 0...1
        y: word.bbox.y0 / data.height,
        width: (word.bbox.x1 - word.bbox.x0) / data.width,
        height: (word.bbox.y1 - word.bbox.y0) / data.height,
        confidence: word.confidence
      }));

      return {
        plainText: text,
        boxes,
        lines: extractLines(data.words, data)
      };
    } catch (error) {
      console.error('Erreur OCR:', error);
      throw new Error('Erreur lors de la reconnaissance de texte');
    }
  },

  async terminate() {
    await worker.terminate();
  }
};

/**
 * Extrait les lignes de texte (pour exercice à trous)
 */
function extractLines(words, data) {
  const lines = [];
  let currentLine = [];
  let currentY = null;

  words.forEach((word) => {
    const wordY = word.bbox.y0;
    
    // Nouvelle ligne si Y change significativement
    if (currentY !== null && Math.abs(wordY - currentY) > 5) {
      if (currentLine.length > 0) {
        lines.push({
          text: currentLine.map((w) => w.text).join(' '),
          x: currentLine[0].bbox.x0 / data.width,
          y: currentLine[0].bbox.y0 / data.height,
          width: (currentLine[currentLine.length - 1].bbox.x1 - currentLine[0].bbox.x0) / data.width,
          height: (Math.max(...currentLine.map((w) => w.bbox.y1)) - Math.min(...currentLine.map((w) => w.bbox.y0))) / data.height
        });
      }
      currentLine = [];
      currentY = null;
    }

    currentLine.push(word);
    currentY = wordY;
  });

  // Ajouter la dernière ligne
  if (currentLine.length > 0) {
    lines.push({
      text: currentLine.map((w) => w.text).join(' '),
      x: currentLine[0].bbox.x0 / data.width,
      y: currentLine[0].bbox.y0 / data.height,
      width: (currentLine[currentLine.length - 1].bbox.x1 - currentLine[0].bbox.x0) / data.width,
      height: (Math.max(...currentLine.map((w) => w.bbox.y1)) - Math.min(...currentLine.map((w) => w.bbox.y0))) / data.height
    });
  }

  return lines;
}
