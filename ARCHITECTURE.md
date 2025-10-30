# Data Stream - Architecture Technique

## 📁 Structure du Projet

```
data_stream/
├── index.html              # Point d'entrée HTML
├── styles.css              # Styles globaux (thème cyber-organique)
├── js/
│   ├── config.js           # Configuration centrale (DRY)
│   ├── game.js             # Orchestration principale
│   └── classes/
│       ├── GameState.js    # État du jeu (logique métier)
│       ├── Node.js         # Nœuds du réseau
│       ├── Connection.js   # Connexions entre nœuds
│       ├── NetworkRenderer.js # Rendu Canvas
│       └── Tutorial.js     # Système de tutoriel
├── GDD.md.txt             # Game Design Document
└── README.md              # Documentation utilisateur
```

## 🎯 Principes Appliqués

### DRY (Don't Repeat Yourself)
- ✅ Configuration centralisée dans `config.js`
- ✅ Méthodes utilitaires partagées
- ⚠️ **À améliorer** : Calcul de distance répété (voir Refactoring)

### KISS (Keep It Simple, Stupid)
- ✅ Séparation claire des responsabilités
- ✅ Flux de données unidirectionnel
- ✅ Pas de sur-ingénierie

### SOLID
- **S**ingle Responsibility : Chaque classe a UNE responsabilité
  - `GameState` : Logique métier
  - `NetworkRenderer` : Rendu visuel
  - `Node` : État d'un nœud
  - `Connection` : Flux de données
  - `Tutorial` : Guidage utilisateur

- **O**pen/Closed : Extensible via `config.js` sans modifier le code

- **L**iskov Substitution : Pas d'héritage pour l'instant (YAGNI)

- **I**nterface Segregation : Classes légères, pas de méthodes inutiles

- **D**ependency Inversion : Dépendances via imports ES6

## 🔄 Flux de Données

```
User Input → Game → GameState → Update Logic
                  ↓
             NetworkRenderer → Canvas
                  ↓
             Tutorial (si actif)
```

## 💾 Système de Sauvegarde

**LocalStorage Keys:**
- `datastream_save` : État complet du jeu
- `datastream_tutorial_done` : Tutoriel complété
- `datastream_node_help` : Aide des nœuds activée/désactivée

**Structure de sauvegarde:**
```javascript
{
  data, bandwidth, integrity, consciousnessFragments,
  totalDataGenerated, totalDataLost, prestigeCount,
  nodesPlaced,  // Pour système d'inflation
  nodes: [],    // Sérialisés
  unlockedModules: [],
  permanentUpgrades: {},
  gameTime,
  lastSaveTime  // Pour gains offline
}
```

## 🎮 Systèmes de Jeu

### 1. Réseau de Nœuds
- **Core** : Nœud central unique (génère 2 Data/s)
- **Processors** : Hubs de connexion (génèrent 6 Data/s)
- **Support** : Router, Cache, Compressor, Amplifier, Optimizer

### 2. Effets Locaux
Les nœuds affectent leurs voisins **directement connectés** :
- Router → -50% Bandwidth des voisins
- Cache → +30% production des voisins
- Compressor → -50% pertes des connexions
- Amplifier → +80% production (coûte cher)
- Optimizer → -40% Bandwidth + 25% production

### 3. Règles de Connexion
- Connexions automatiques dans un rayon de 200px
- **Seuls CORE et PROCESSOR peuvent se connecter à tout**
- Les autres types doivent se connecter à un PROCESSOR/CORE
- Max 3 connexions par nœud

### 4. Système d'Inflation
**Formule:** `coût = baseCost × (1 - rabais) × (1 + inflation)^nodesPlaced`

- Inflation de base : 10% par nœud placé
- Réductible via upgrade "Contrôle d'Inflation"
- Réinitialisé au Prestige ou crash

### 5. Gains Offline
**Formule:** `gains = production/s × temps × tauxOffline`

- Taux de base : 25%
- Améliorable via upgrade (+5% par niveau)
- Minimum 1 minute offline

### 6. Prestige
- Seuil : 1000 Data
- Récompense : 1 Fragment par 1000 Data
- Réinitialise : Data, nœuds, inflation, integrity
- Conserve : Fragments, upgrades

## 🔧 Upgrades Permanents

| Nom | Effet | Coût Base | Max |
|-----|-------|-----------|-----|
| Production Offline | +5% gains offline | 5 | 10 |
| Optimisation Core | +1 Data/s Core | 3 | 15 |
| Optimisation Processor | +1 Data/s Processor | 5 | 15 |
| Efficacité Réseau | -5% coût nœuds | 10 | 10 |
| Contrôle d'Inflation | -1% inflation | 8 | 10 |

**Formule coût:** `coût = baseCost × facteur^niveau`

## 📊 Métriques de Performance

- **Tick Rate** : 100ms (10 FPS logique)
- **Render** : RequestAnimationFrame (~60 FPS)
- **Auto-save** : Toutes les 30 secondes
- **Particules** : Max 10 par connexion

## ⚠️ Points d'Attention

### Intégrité du Réseau
- Bandwidth surchargée → Integrity baisse
- Integrity = 0% → Crash (perte de tous les nœuds)
- Avertissement à 20%

### Validation Placement
1. Coût suffisant
2. Distance min 50px des autres nœuds
3. Au moins 1 connexion possible (200px)
4. Respect règles de connexion
5. Règles spéciales (ex: Routers pas trop proches)

## 🐛 Bugs Connus / Résolus

✅ Particules n'atteignaient pas 100% → **Résolu** (clamping + filter à 1.3)
✅ Tutorial bloquait les nœuds → **Résolu** (position bottom-left)
✅ Cache navigateur → **Info** : Toujours faire Ctrl+F5
✅ Nœuds isolés après suppression → **Résolu** (BFS check)

## 🚀 Prochaines Améliorations Potentielles

### Performance
- [ ] Pool d'objets pour particules (éviter GC)
- [ ] Spatial hashing pour collision detection

### Refactoring
- [ ] Utilitaire `distanceTo(a, b)` (répété 10+ fois)
- [ ] Extraction constantes magiques (200px, 50px, etc.)

### Features
- [ ] Modes de jeu (Challenge, Zen, etc.)
- [ ] Achievements
- [ ] Export/Import de save

## 📝 Conventions de Code

```javascript
// Nommage
- Classes: PascalCase (GameState, Node)
- Méthodes: camelCase (calculateCost, update)
- Constantes: UPPER_SNAKE_CASE (MAX_DISTANCE)
- Variables locales: camelCase (nodeType, cost)

// Organisation méthodes
1. Constructor
2. Init methods
3. Update/Logic methods
4. Helper methods
5. Serialization
```

## 🔍 Debug

**Commandes utiles:**
```javascript
// Console
window.game.gameState.data = 10000  // Ajouter de la Data
window.game.gameState.consciousnessFragments = 100  // Ajouter Fragments
window.game.gameState.save()  // Sauvegarder
```

**Bouton Reset** dans l'UI (panneau Aide)
