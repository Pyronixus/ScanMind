import Dexie from 'dexie';

export const db = new Dexie('ScanMindDB');

db.version(1).stores({
  folders: '++id, parentId',
  cards: '++id, folderId',
  images: '++id, cardId',
  stats: '++id'
});

export const storageService = {
  // ==================== FOLDERS ====================

  async createFolder(name, colorHex, parentId = null) {
    const id = Date.now().toString();
    return await db.folders.add({
      id,
      name,
      colorHex,
      parentId,
      createdAt: new Date(),
      sortIndex: 0
    });
  },

  async getFolders(parentId = null) {
    return await db.folders
      .where('parentId')
      .equals(parentId)
      .sortBy('sortIndex');
  },

  async getAllFolders() {
    return await db.folders.toArray();
  },

  async updateFolder(id, updates) {
    return await db.folders.update(id, updates);
  },

  async deleteFolder(id) {
    // Récursif: supprimer sous-dossiers
    const subfolders = await db.folders.where('parentId').equals(id).toArray();
    for (const sub of subfolders) {
      await this.deleteFolder(sub.id);
    }
    // Supprimer cartes
    const cards = await db.cards.where('folderId').equals(id).toArray();
    for (const card of cards) {
      await this.deleteCard(card.id);
    }
    // Supprimer dossier
    return await db.folders.delete(id);
  },

  async getFolderStats(folderId) {
    const cards = await db.cards.where('folderId').equals(folderId).toArray();
    return {
      cardCount: cards.length,
      masteredCount: cards.filter((c) => c.level === 5).length
    };
  },

  // ==================== CARDS (FICHES) ====================

  async createCard(name, rectoImageId, folderId, tags = []) {
    const id = Date.now().toString();
    return await db.cards.add({
      id,
      name,
      rectoImageId,
      versoImageId: null,
      folderId,
      tags,
      rectoOCRText: '',
      versoOCRText: '',
      rectoOCRBoxes: [],
      versoOCRBoxes: [],
      rectoCleanImageId: null,
      versoCleanImageId: null,
      level: 0, // new
      reviewHistory: [],
      createdAt: new Date(),
      lastReviewedAt: null,
      sortIndex: 0
    });
  },

  async getCards(folderId) {
    return await db.cards.where('folderId').equals(folderId).toArray();
  },

  async getCard(id) {
    return await db.cards.get(id);
  },

  async updateCard(id, updates) {
    return await db.cards.update(id, updates);
  },

  async deleteCard(id) {
    const card = await db.cards.get(id);
    if (card) {
      // Supprimer les images associées
      if (card.rectoImageId) {
        await db.images.delete(card.rectoImageId);
      }
      if (card.versoImageId) {
        await db.images.delete(card.versoImageId);
      }
      if (card.rectoCleanImageId) {
        await db.images.delete(card.rectoCleanImageId);
      }
      if (card.versoCleanImageId) {
        await db.images.delete(card.versoCleanImageId);
      }
    }
    return await db.cards.delete(id);
  },

  async moveCard(cardId, newFolderId) {
    return await db.cards.update(cardId, { folderId: newFolderId });
  },

  async recordReview(cardId, success) {
    const card = await db.cards.get(cardId);
    if (!card) return;

    const history = card.reviewHistory || [];
    history.push({
      date: new Date(),
      success
    });

    // Ajuster le niveau de maîtrise
    let newLevel = card.level;
    if (success) {
      newLevel = Math.min(newLevel + 1, 5);
    } else {
      newLevel = Math.max(newLevel - 1, 0);
    }

    return await db.cards.update(cardId, {
      reviewHistory: history,
      level: newLevel,
      lastReviewedAt: new Date()
    });
  },

  // ==================== IMAGES ====================

  async saveImage(blob) {
    const id = Date.now().toString();
    const arrayBuffer = await blob.arrayBuffer();
    return await db.images.add({
      id,
      data: arrayBuffer,
      type: blob.type,
      size: blob.size,
      createdAt: new Date()
    });
  },

  async getImage(id) {
    const img = await db.images.get(id);
    if (!img) return null;
    return new Blob([img.data], { type: img.type });
  },

  async getImageDataURL(id) {
    const blob = await this.getImage(id);
    if (!blob) return null;
    return URL.createObjectURL(blob);
  },

  async deleteImage(id) {
    return await db.images.delete(id);
  },

  // ==================== STATS ====================

  async getStats() {
    const cards = await db.cards.toArray();
    const folders = await db.folders.toArray();

    const masteredCount = cards.filter((c) => c.level === 5).length;
    const totalCards = cards.length;
    const masteryPercentage = totalCards > 0 ? Math.round((masteredCount / totalCards) * 100) : 0;

    const totalReviews = cards.reduce((sum, c) => sum + (c.reviewHistory?.length || 0), 0);
    const successReviews = cards.reduce(
      (sum, c) => sum + (c.reviewHistory?.filter((r) => r.success).length || 0),
      0
    );

    return {
      cardCount: totalCards,
      folderCount: folders.length,
      masteredCount,
      masteryPercentage,
      totalReviews,
      successReviews,
      successRate: totalReviews > 0 ? Math.round((successReviews / totalReviews) * 100) : 0,
      levelDistribution: {
        new: cards.filter((c) => c.level === 0).length,
        seen: cards.filter((c) => c.level === 1).length,
        fragile: cards.filter((c) => c.level === 2).length,
        correct: cards.filter((c) => c.level === 3).length,
        solid: cards.filter((c) => c.level === 4).length,
        mastered: masteredCount
      }
    };
  },

  async getReviewHistory(days = 30) {
    const cards = await db.cards.toArray();
    const history = {};

    const now = new Date();
    for (let i = 0; i < days; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      history[dateStr] = 0;
    }

    cards.forEach((card) => {
      (card.reviewHistory || []).forEach((review) => {
        if (review.success) {
          const dateStr = new Date(review.date).toISOString().split('T')[0];
          if (history[dateStr] !== undefined) {
            history[dateStr]++;
          }
        }
      });
    });

    return history;
  },

  async clearAllData() {
    await db.folders.clear();
    await db.cards.clear();
    await db.images.clear();
  }
};
