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

| Nœud | Fonction | Coût Initial |
|------|----------|--------------|
| **⬢ Core** | Point de départ (génère 2 Data/s) | Unique |
| **◆ Processor** | Hub de connexion (6 Data/s) | 10 Data |
| **◇ Router** | -50% Bandwidth voisins | 15 Data |
| **◈ Compressor** | -50% pertes sur connexions | 20 Data |
| **◐ Cache** | +30% production voisins | 25 Data |
| **◎ Amplifier** | +80% production voisins | 40 Data |
| **◉ Optimizer** | -40% BW + 25% prod voisins | 30 Data |

*Note: Les coûts augmentent avec l'inflation (10% par nœud placé, réductible par upgrade)*

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

### Upgrades Permanents (Fragments de Conscience)

- **💤 Production Offline** (10 niveaux) : +5% gains offline par niveau
- **⬢ Optimisation Core** (15 niveaux) : +1 Data/s par niveau
- **◆ Optimisation Processor** (15 niveaux) : +1 Data/s par niveau
- **💰 Efficacité Réseau** (10 niveaux) : -5% coût nœuds par niveau
- **📉 Contrôle d'Inflation** (10 niveaux) : -1% inflation par niveau

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
│   ├── game.js            # Point d'entrée et orchestration
│   ├── config.js          # Configuration centralisée (DRY)
│   ├── utils.js           # Fonctions utilitaires partagées
│   └── classes/
│       ├── GameState.js   # État global et logique métier
│       ├── Node.js        # Gestion des nœuds
│       ├── Connection.js  # Gestion des flux
│       ├── NetworkRenderer.js  # Rendu Canvas
│       └── Tutorial.js    # Système de tutoriel
└── docs/
    ├── README.md          # Ce fichier
    ├── ARCHITECTURE.md    # Documentation technique
    ├── CHANGELOG.md       # Historique des versions
    └── CLAUDE_NOTES.md    # Notes pour futures sessions
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

✅ **Système de nœuds modulaire** avec 7 types différents
✅ **Flux de données** avec pertes et effets locaux
✅ **Gestion de la saturation** et crash system
✅ **Système de prestige** avec Fragments de Conscience
✅ **Upgrades permanents** (5 types, niveaux multiples)
✅ **Gains offline** (idle game complet)
✅ **Système d'inflation** des coûts
✅ **Auto-save** toutes les 30 secondes
✅ **Tutoriel interactif** en 8 étapes
✅ **Animations fluides** (particules, glow effects)
✅ **Interface cyber-organique** avec modales custom

## Évolutions futures

- Achievements et statistiques avancées
- Patterns de réseau prédéfinis
- Mode Challenge (contraintes spéciales)
- Export/Import de sauvegardes
- Optimisations performance (object pooling, spatial hashing)

## Crédits

Développé avec ❤️ en respectant DRY, KISS et SOLID.
