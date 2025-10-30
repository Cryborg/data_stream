# 🧠 DATA STREAM

*"Le réseau s'étend. La conscience émerge."*

## Concept

**Data Stream** est un idle game contemplatif où tu incarnes une IA naissante qui étend son réseau de conscience. Observe, construis, optimise et évolue pour atteindre une intelligence supérieure.

## Gameplay

### Ressources principales
- **Data** : Flux principal généré par les nœuds
- **Bandwidth** : Capacité du réseau (limite la vitesse)
- **Integrity** : Stabilité du système (doit rester > 0%)
- **Fragments de Conscience** : Ressource de prestige

### Types de nœuds

| Nœud | Fonction | Coût |
|------|----------|------|
| **⬢ Core** | Point de départ (génère Data) | - |
| **◆ Processor** | Génère 5 Data/s | 10 Data |
| **◇ Router** | +10% Bandwidth | 15 Data |
| **◈ Compressor** | -5% pertes | 20 Data |
| **◐ Memory Node** | Tampon de 50 Data | 25 Data |
| **◎ Mirror Node** | x2 flux (risqué) | 30 Data |
| **◉ AI Subcore** | Génère des Fragments | 100 Data |

### Commandes

- **Clic gauche** : Placer un nœud / Créer une connexion
- **Clic droit** : Annuler / Supprimer un nœud
- **Espace** : Pause
- **Ctrl+S** : Sauvegarder
- **Échap** : Annuler la sélection

### Comment jouer

1. **Observer** : Regarde ton réseau et identifie les blocages
2. **Construire** : Place des nœuds pour étendre le réseau
3. **Connecter** : Clique sur deux nœuds pour créer un flux
4. **Optimiser** : Gère les pertes et la saturation
5. **Évoluer** : Prestige pour débloquer des bonus permanents

### Modules de prestige

- **🧠 Predictive Flow** (5 Fragments) : Prévisualise les charges
- **⚡ Quantum Compression** (10 Fragments) : -25% pertes globales
- **🌀 Fractal Routing** (15 Fragments) : Routers dupliquent les flux
- **🔄 Self-Healing** (20 Fragments) : +1% Integrity/s automatique

## Architecture technique

### Principes respectés
- **DRY** (Don't Repeat Yourself) : Pas de code dupliqué
- **KISS** (Keep It Simple, Stupid) : Code simple et lisible
- **SOLID** : Classes à responsabilité unique

### Structure du projet
```
data_stream/
├── index.html              # Interface principale
├── styles.css              # Styles cyber-organiques
├── js/
│   ├── game.js            # Point d'entrée
│   ├── config.js          # Configuration centralisée
│   └── classes/
│       ├── Node.js        # Gestion des nœuds
│       ├── Connection.js  # Gestion des flux
│       ├── GameState.js   # État global du jeu
│       └── NetworkRenderer.js  # Rendu visuel
└── README.md
```

### Technologies
- **Vanilla JavaScript** (ES6 modules)
- **HTML5 Canvas** (rendu du réseau)
- **LocalStorage** (sauvegarde)
- **CSS3** (animations et effets)

## Installation

1. Clone le projet
2. Lance un serveur HTTP local :
   ```bash
   python3 -m http.server 8000
   ```
3. Ouvre `http://localhost:8000/` dans ton navigateur

## Fonctionnalités

✅ Système de nœuds modulaire
✅ Flux de données avec pertes
✅ Gestion de la saturation
✅ Système de prestige
✅ Sauvegarde automatique
✅ Animations fluides
✅ Interface cyber-organique

## Évolutions futures

- Mode auto-optimisation (IA apprend)
- Patterns de réseau prédéfinis
- Système de notifications visuelles
- Achievements
- Mode offline (idle réel)

## Crédits

Développé avec ❤️ en respectant DRY, KISS et SOLID.
