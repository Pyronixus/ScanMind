import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store/appStore';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import styles from './StatsPage.module.css';

export default function StatsPage() {
  const { stats, loadStats, getReviewHistory } = useAppStore();
  const [historyData, setHistoryData] = useState([]);

  useEffect(() => {
    loadStats();
    loadReviewHistory();
  }, []);

  const loadReviewHistory = async () => {
    const history = await getReviewHistory(30);
    const data = Object.entries(history).map(([date, count]) => ({
      date: new Date(date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }),
      reviews: count
    })).reverse();
    setHistoryData(data);
  };

  if (!stats) return <div style={{ padding: 'var(--spacing-l)', textAlign: 'center' }}>Chargement...</div>;

  const COLORS_CHART = ['#999', '#FFB800', '#FF6B6B', '#4C7EFF', '#2E9E6B', '#16A34A'];
  const levelNames = ['Nouvelle', 'Vue', 'Fragile', 'Correcte', 'Solide', 'Maîtrisée'];

  const pieData = Object.entries(stats.levelDistribution).map(([level, count], i) => ({
    name: levelNames[i],
    value: count
  })).filter(d => d.value > 0);

  return (
    <motion.div
      className={styles.page}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h1 className="text-display-large" style={{ padding: 'var(--spacing-l)', paddingBottom: 0 }}>
        Statistiques
      </h1>

      {/* KPIs */}
      <div className={styles.kpiGrid}>
        <motion.div
          className={styles.kpiCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className={styles.kpiValue}>{stats.cardCount}</div>
          <div className={styles.kpiLabel}>Fiches</div>
        </motion.div>

        <motion.div
          className={styles.kpiCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className={styles.kpiValue}>{stats.masteryPercentage}%</div>
          <div className={styles.kpiLabel}>Maîtrise</div>
        </motion.div>

        <motion.div
          className={styles.kpiCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className={styles.kpiValue}>{stats.successRate}%</div>
          <div className={styles.kpiLabel}>Taux réussite</div>
        </motion.div>
      </div>

      {/* Charts */}
      <div className={styles.chartsContainer}>
        {pieData.length > 0 && (
          <motion.div
            className={styles.chartCard}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-headline">Répartition par niveau</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" labelLine={false} label outerRadius={100}>
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={COLORS_CHART[index]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {historyData.length > 0 && (
          <motion.div
            className={styles.chartCard}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="text-headline">Révisions (30 jours)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={historyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="reviews" stroke="var(--color-accent)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
