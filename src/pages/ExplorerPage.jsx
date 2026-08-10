import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store/appStore';
import { motion } from 'framer-motion';
import FolderGrid from '../components/FolderGrid';
import { CardGrid } from '../components/CardGrid';
import CreateFolderModal from '../components/CreateFolderModal';
import styles from './ExplorerPage.module.css';

export default function ExplorerPage() {
  const {
    currentFolder,
    setCurrentFolder,
    folders,
    cards,
    loading,
    loadFolders,
    loadCards,
    createFolder,
    deleteFolder,
    deleteCard
  } = useAppStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    // Charger les dossiers et fiches du dossier courant
    loadFolders(currentFolder?.id || null);
    if (currentFolder) {
      loadCards(currentFolder.id);
    }
  }, [currentFolder]);

  const handleFolderClick = (folder) => {
    setCurrentFolder(folder);
  };

  const handleBackClick = () => {
    if (currentFolder?.parentId) {
      // Naviguer vers le parent
      // À implémenter: récupérer le dossier parent
    } else {
      setCurrentFolder(null);
    }
  };

  const handleCreateFolder = async (name, colorHex) => {
    await createFolder(name, colorHex, currentFolder?.id || null);
    setShowCreateModal(false);
  };

  const filteredCards = cards.filter((card) =>
    card.name.toLowerCase().includes(searchText.toLowerCase()) ||
    card.tags.some((tag) => tag.toLowerCase().includes(searchText.toLowerCase())) ||
    card.rectoOCRText.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <motion.div
      className={styles.page}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <header className={styles.header}>
        <div className={styles.headerTop}>
          {currentFolder && (
            <button className={styles.backButton} onClick={handleBackClick}>
              ← Retour
            </button>
          )}
          <h1 className="text-display-large">
            {currentFolder?.name || 'ScanMind'}
          </h1>
          <button
            className={styles.createButton}
            onClick={() => setShowCreateModal(true)}
            title="Créer un dossier"
          >
            📁+
          </button>
        </div>

        {/* Barre de recherche */}
        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="Rechercher une fiche ou un tag..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </header>

      <main className={styles.main}>
        {loading ? (
          <div className="flex-center" style={{ height: '200px' }}>
            <div className={styles.spinner}>Chargement...</div>
          </div>
        ) : (
          <>
            {folders.length > 0 && (
              <section className={styles.section}>
                <h2 className="text-headline">Dossiers</h2>
                <FolderGrid
                  folders={folders}
                  onFolderClick={handleFolderClick}
                  onDeleteClick={deleteFolder}
                />
              </section>
            )}

            {filteredCards.length > 0 && (
              <section className={styles.section}>
                <h2 className="text-headline">Fiches</h2>
                <CardGrid
                  cards={filteredCards}
                  onDeleteClick={deleteCard}
                />
              </section>
            )}

            {folders.length === 0 && filteredCards.length === 0 && !loading && (
              <div className={styles.emptyState}>
                <p className="text-headline">Ce dossier est vide</p>
                <p className="text-body-small text-muted">
                  Crée un dossier ou scanne une fiche depuis l'onglet Scan
                </p>
              </div>
            )}
          </>
        )}
      </main>

      {showCreateModal && (
        <CreateFolderModal
          onCreateFolder={handleCreateFolder}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </motion.div>
  );
}
