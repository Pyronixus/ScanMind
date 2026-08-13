# ScanMind 

<div align="center">

![ScanMind Banner](https://img.shields.io/badge/ScanMind-PWA_Revision_Assistant-6366f1?style=for-the-badge&logo=react&logoColor=white)

> **Transformez vos fiches de révision physiques en un hub numérique intelligent, rapide et accessible partout.**

[![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

---

</div>

## 📌 Aperçu

**ScanMind** est une **Progressive Web App (PWA)** moderne conçue pour numériser, traiter et organiser vos fiches de révision papier. Grâce à son moteur d'OCR intégré et ses algorithmes de traitement d'image local, convertissez vos cours physiques en fiches numériques ultra lisibles et faciles à réviser.

---

## ⚡ Fonctionnalités Clés

> [!NOTE]
> ScanMind est conçu selon une philosophie **Offline-First** : toutes vos données et vos scans restent stockés localement sur votre appareil.

- 📷 **Capture & Numérisation Multi-Source**
  - Prise de vue instantanée via la caméra de votre appareil
  - Importation rapide d'images depuis votre galerie

- 🧹 **Traitement & Nettoyage d'Image Intelligente**
  - Filtres dynamiques d'amélioration de lisibilité (contraste, balance des blancs)
  - Suppression automatique des ombres et mise en valeur de l'écriture manuscrite/imprimée

- 🔤 **Reconnaissance Optique de Caractères (OCR)**
  - Extraction automatique du texte contenu dans vos fiches
  - Indexation du contenu pour la relecture rapide

- 📁 **Organisation par Dossiers & Thèmes**
  - Arborescence personnalisable par matière ou chapitre
  - Interface intuitive pour déplacer, renommer et trier vos fiches

- 📊 **Statistiques & Suivi de Révision**
  - Tableaux de bord synthétiques pour suivre votre volume de travail
  - Indicateurs visuels sur l'évolution de vos révisions

- 📱 **Expérience App Native (PWA)**
  - Installable sur mobile, tablette et desktop
  - Fonctionnement 100% hors-ligne via Service Workers

---

## 🛠️ Stack Technique

<details>
<summary><b>Découvrir les technologies utilisées</b></summary>

<br />

| Composant | Technologie | Description |
| :--- | :--- | :--- |
| **Framework Front-end** | `React 18` | Interface utilisateur réactive et modulaire |
| **Build Tool** | `Vite` | Bundler ultra-rapide avec HMR instantané |
| **Styling** | `CSS Modules` | Styles scopés pour éviter toute collision CSS |
| **Moteur OCR** | `Tesseract.js` / `Canvas API` | Traitement et extraction de texte local |
| **PWA Core** | `Service Workers` & `Manifest` | Mise en cache locale et installabilité |
| **CI/CD** | `GitHub Actions` | Build et déploiement automatisés |

</details>

---

## 📂 Structure du Projet

```text
ScanMind/
├── 📁 public/                 # Assets statiques, manifest PWA & Service Worker
├── 📁 src/
│   ├── 📁 components/         # Composants UI réutilisables (Modales, Grilles, Caméra)
│   ├── 📁 pages/              # Pages principales (Scan, Explorer, Stats)
│   ├── 📁 services/           # Logique métier (OCR, Nettoyage d'image, Storage)
│   ├── 📁 store/              # Gestion d'état centralisée
│   └── 📁 styles/             # Thèmes globaux et variables CSS
├── 📄 vite.config.js          # Config Vite & plugins PWA
└── 📄 package.json            # Dépendances et scripts
```

---

## 🚀 Démarrage Rapide

### Prérequis

- **Node.js** (v18.0.0 ou supérieur)
- **npm** ou **pnpm** / **yarn**

### 1. Installation

```bash
# Cloner le dépôt
git clone https://github.com/Pyronixus/ScanMind.git

# Accéder au dossier du projet
cd ScanMind

# Installer les dépendances
npm install
```

### 2. Environnement de Développement

```bash
# Lancer le serveur local
npm run dev
```

L'application sera accessible sur `http://localhost:5173`.

### 3. Build pour la Production

```bash
# Générer le build de production optimisé
npm run build
```

---

## 🤝 Contribution

Les contributions, issues et suggestions d'améliorations sont les bienvenues ! N'hésitez pas à consulter la page des [Issues](https://github.com/Pyronixus/ScanMind/issues) pour participer au projet.

---

## 🛡️ Licence

Ce projet est sous licence [MIT](LICENSE).

<div align="center">

---

*Développé pour rendre la révision plus simple et moderne.*

</div>
