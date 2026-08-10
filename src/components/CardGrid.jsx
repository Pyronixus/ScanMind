import React from 'react';
import { motion } from 'framer-motion';
import styles from './CardGrid.module.css'; // Ou ajuste selon ton fichier de styles

export function CardGrid({ cards = [], onDeleteCard, onSelectCard }) {
  if (!cards || cards.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.6 }}>
        <p>Aucune fiche pour le moment.</p>
      </div>
    );
  }

  return (
    <div 
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: '1rem',
        marginTop: '1rem'
      }}
    >
      {cards.map((card) => (
        <motion.div
          key={card.id || card._id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          whileHover={{ scale: 1.02 }}
          onClick={() => onSelectCard && onSelectCard(card)}
          style={{
            padding: '1rem',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            cursor: 'pointer',
            position: 'relative'
          }}
        >
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>
            {card.title || 'Fiche sans titre'}
          </h3>
          
          {card.description && (
            <p style={{ fontSize: '0.875rem', opacity: 0.8, margin: 0 }}>
              {card.description}
            </p>
          )}

          {onDeleteCard && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteCard(card.id || card._id);
              }}
              style={{
                marginTop: '1rem',
                background: 'transparent',
                border: 'none',
                color: '#ff4d4d',
                cursor: 'pointer',
                fontSize: '0.8rem'
              }}
            >
              Supprimer
            </button>
          )}
        </motion.div>
      ))}
    </div>
  );
}

// Export par défaut pour éviter toute erreur d'import avec ou sans accolades
export default CardGrid;