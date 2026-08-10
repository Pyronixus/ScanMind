import React, { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { motion } from 'framer-motion';
import styles from './ScanNamingUI.module.css';

export default function ScanNamingUI({ onCreateCard, onBack, isLoading }) {
  const { folders } = useAppStore();
  const [name, setName] = useState('');
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [selectedFolder, setSelectedFolder] = useState(null);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (index) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      alert('Veuillez entrer un nom');
      return;
    }
    onCreateCard(name, tags, selectedFolder);
  };

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className={styles.form}>
        <h2 className="text-headline">Détails de la fiche</h2>

        <div className={styles.formGroup}>
          <label className="text-subheadline">Nom</label>
          <input
            type="text"
            placeholder="Ex: Algèbre linéaire"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            className={styles.input}
            autoFocus
          />
        </div>

        <div className={styles.formGroup}>
          <label className="text-subheadline">Tags</label>
          <div className={styles.tagInput}>
            <input
              type="text"
              placeholder="Ajouter un tag"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              className={styles.input}
            />
            <button
              onClick={handleAddTag}
              className="btn btn-primary"
              style={{ padding: '10px 16px' }}
            >
              +
            </button>
          </div>
          <div className={styles.tags}>
            {tags.map((tag, i) => (
              <motion.div
                key={i}
                className={styles.tag}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                {tag}
                <button onClick={() => handleRemoveTag(i)}>×</button>
              </motion.div>
            ))}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className="text-subheadline">Dossier</label>
          <select
            value={selectedFolder || ''}
            onChange={(e) => setSelectedFolder(e.target.value || null)}
            className={styles.input}
          >
            <option value="">Racine</option>
            {folders.map((folder) => (
              <option key={folder.id} value={folder.id}>
                📁 {folder.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.actions}>
          <button
            onClick={onBack}
            className="btn btn-secondary"
            disabled={isLoading}
          >
            Retour
          </button>
          <motion.button
            onClick={handleSubmit}
            className="btn btn-primary"
            disabled={isLoading || !name.trim()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? 'Création...' : 'Créer la fiche'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
