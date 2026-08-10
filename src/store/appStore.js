import { create } from 'zustand';
import { storageService } from '../services/storageService';

export const useAppStore = create((set, get) => ({
  // ==================== STATE ====================

  currentTab: 'fiches', // 'fiches', 'scan', 'stats'
  currentFolder: null,
  folders: [],
  cards: [],
  stats: null,
  loading: false,
  error: null,

  // ==================== TAB NAVIGATION ====================

  setCurrentTab: (tab) => set({ currentTab: tab }),

  setCurrentFolder: (folder) => set({ currentFolder: folder }),

  // ==================== FOLDERS ====================

  createFolder: async (name, colorHex, parentId = null) => {
    try {
      set({ loading: true });
      await storageService.createFolder(name, colorHex, parentId);
      await get().loadFolders();
      set({ loading: false, error: null });
    } catch (err) {
      set({ loading: false, error: err.message });
    }
  },

  loadFolders: async (parentId = null) => {
    try {
      set({ loading: true });
      const folders = await storageService.getFolders(parentId);
      set({ folders, loading: false, error: null });
    } catch (err) {
      set({ loading: false, error: err.message });
    }
  },

  deleteFolder: async (folderId) => {
    try {
      set({ loading: true });
      await storageService.deleteFolder(folderId);
      await get().loadFolders();
      set({ loading: false, error: null });
    } catch (err) {
      set({ loading: false, error: err.message });
    }
  },

  // ==================== CARDS ====================

  createCard: async (name, rectoImageId, folderId, tags = []) => {
    try {
      set({ loading: true });
      const cardId = await storageService.createCard(name, rectoImageId, folderId, tags);
      await get().loadCards(folderId);
      set({ loading: false, error: null });
      return cardId;
    } catch (err) {
      set({ loading: false, error: err.message });
    }
  },

  loadCards: async (folderId) => {
    try {
      set({ loading: true });
      const cards = await storageService.getCards(folderId);
      set({ cards, loading: false, error: null });
    } catch (err) {
      set({ loading: false, error: err.message });
    }
  },

  updateCard: async (cardId, updates) => {
    try {
      set({ loading: true });
      await storageService.updateCard(cardId, updates);
      const { cards, currentFolder } = get();
      const updated = cards.map((c) => (c.id === cardId ? { ...c, ...updates } : c));
      set({ cards: updated, loading: false, error: null });
    } catch (err) {
      set({ loading: false, error: err.message });
    }
  },

  deleteCard: async (cardId) => {
    try {
      set({ loading: true });
      await storageService.deleteCard(cardId);
      const { cards } = get();
      set({ cards: cards.filter((c) => c.id !== cardId), loading: false, error: null });
    } catch (err) {
      set({ loading: false, error: err.message });
    }
  },

  moveCard: async (cardId, newFolderId) => {
    try {
      set({ loading: true });
      await storageService.moveCard(cardId, newFolderId);
      const { cards } = get();
      const updated = cards.map((c) =>
        c.id === cardId ? { ...c, folderId: newFolderId } : c
      );
      set({ cards: updated, loading: false, error: null });
    } catch (err) {
      set({ loading: false, error: err.message });
    }
  },

  recordReview: async (cardId, success) => {
    try {
      await storageService.recordReview(cardId, success);
      const card = await storageService.getCard(cardId);
      const { cards } = get();
      const updated = cards.map((c) => (c.id === cardId ? card : c));
      set({ cards: updated });
    } catch (err) {
      set({ error: err.message });
    }
  },

  // ==================== STATS ====================

  loadStats: async () => {
    try {
      const stats = await storageService.getStats();
      set({ stats, error: null });
    } catch (err) {
      set({ error: err.message });
    }
  },

  getReviewHistory: async (days = 30) => {
    try {
      return await storageService.getReviewHistory(days);
    } catch (err) {
      set({ error: err.message });
    }
  },

  // ==================== UTILITY ====================

  clearError: () => set({ error: null }),

  clearAllData: async () => {
    try {
      set({ loading: true });
      await storageService.clearAllData();
      set({
        loading: false,
        folders: [],
        cards: [],
        stats: null,
        error: null
      });
    } catch (err) {
      set({ loading: false, error: err.message });
    }
  }
}));
