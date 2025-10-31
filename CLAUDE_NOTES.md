# Notes pour Futures Sessions Claude

## ⚡ Résumé Ultra-Rapide

**Data Stream** = Idle game de construction de réseau IA avec méta-progression.

- **Stack** : Vanilla JS (ES6), Canvas, LocalStorage
- **Architecture** : Classes séparées, config centralisée, principes SOLID
- **Code** : ~2500 lignes, 7 fichiers JS principaux

## 🎯 Demandes Récurrentes de l'Utilisateur

### Style de Communication
- ✅ **TOUJOURS tutoyer** (tu/toi, jamais vous)
- ✅ Parler comme des amis
- ✅ Pas d'emojis sauf si demandé explicitement
- ✅ Réponses concises et techniques

### Principes de Code (CRITIQUES)
- **DRY** : Pas de duplication
- **KISS** : Simplicité maximale
- **SOLID** : Responsabilités claires

### Préférences Techniques
- ❌ Jamais de `alert()` ou `confirm()` → Utiliser modales custom
- ✅ Toujours permettre de modifier les valeurs via upgrades
- ✅ Ctrl+F5 obligatoire pour voir les changements (cache)
- ✅ Git commit avec messages descriptifs

## 📂 Structure Fichiers Critiques

```
js/
├── config.js           → TOUTE la configuration (NODE_TYPES, UPGRADES, etc.)
├── utils.js            → Fonctions utilitaires partagées (nouveau)
├── game.js             → Orchestration, UI, événements
└── classes/
    ├── GameState.js    → LOGIQUE MÉTIER (state, règles)
    ├── Node.js         → État d'un nœud
    ├── Connection.js   → Flux entre nœuds
    ├── NetworkRenderer.js → Rendu Canvas
    └── Tutorial.js     → Tutoriel
```

## 🔧 Systèmes Clés

### 1. Coût des Nœuds
```javascript
coût = baseCost × (1 - rabais) × (1 + inflation)^nodesPlaced
```
- Rabais : Upgrade "Efficacité Réseau" (5% par niveau)
- Inflation : 10% base, réduit par upgrade (-1% par niveau)

### 2. Gains Offline
```javascript
gains = production/s × temps × (0.25 + upgrades × 0.05)
```
- Base : 25%
- Upgrade : +5% par niveau (max 10)

### 3. Système de Grille
- **Grille de placement** : 50x50px
- Les nœuds se placent **uniquement sur les intersections**
- Snap automatique : `snapToGrid(x, y, gridSize)`
- Preview visuelle : carré vert (placement OK) ou rouge (impossible)
- Grille visible : lignes + points blancs aux intersections

### 4. Règles de Connexion (IMPORTANT)
- **Seuls CORE et PROCESSOR** peuvent se connecter à tous types
- Autres types → **doivent** se connecter à CORE/PROCESSOR
- Distance auto : 200px (4 cases de grille)
- Distance min : 50px (1 case de grille)
- Max 3 connexions auto

### 5. Effets Locaux (Nœuds → Voisins)
| Nœud | Effet |
|------|-------|
| Router | -50% Bandwidth voisins |
| Cache | +30% production voisins |
| Compressor | -50% pertes connexions |
| Amplifier | +80% production (cher) |
| Optimizer | -40% BW + 25% prod |

### 6. Prestige
- Seuil : 1000 Data
- Gain : 1 Fragment / 1000 Data
- Reset : Data, nœuds, inflation, integrity
- Conserve : Fragments, upgrades permanents

## 🐛 Bugs Résolus (NE PAS RÉINTRODUIRE)

1. ✅ Particules s'arrêtaient à ~75% → `filter(p => p.progress < 1.3)` + `clamp(progress, 0, 1)` dans render
2. ✅ Tutorial bloquait nœuds → Position `bottom-left` au lieu de `center`
3. ✅ Nœuds isolés après suppression → BFS check avec `isNetworkConnected()`
4. ✅ Cache navigateur → **Toujours rappeler Ctrl+F5**

## 💡 Patterns Utilisés

### Calcul de Distance (utiliser utils.js maintenant)
```javascript
import { calculateDistance } from './utils.js';
const dist = calculateDistance(nodeA, nodeB);
```

### Vérification Hub
```javascript
import { isHubNode } from './utils.js';
if (isHubNode(type)) { /* ... */ }
```

### Constantes (utiliser CONSTANTS)
```javascript
import { CONSTANTS } from './utils.js';
const maxDist = CONSTANTS.MAX_CONNECTION_DISTANCE;
```

## 🚀 Workflow Git

```bash
git add .
git commit -m "Description claire"
git push
```

**Messages de commit** : Utiliser verbes à l'infinitif en anglais
- ✅ "Add offline gains system"
- ✅ "Fix particle animation bug"
- ✅ "Refactor distance calculation"

## 📝 Fichiers à Mettre à Jour

Quand tu ajoutes une feature :
1. **Code** → Implémenter
2. **config.js** → Si nouvelles constantes/configs
3. **CHANGELOG.md** → Documenter changements
4. **ARCHITECTURE.md** → Si architecture change
5. **README.md** → Si comportement utilisateur change

## ⚠️ Points d'Attention Critiques

### Lors de Modifications
- [ ] Respecter les principes DRY/KISS/SOLID
- [ ] Tester avec Ctrl+F5
- [ ] Vérifier sauvegarde/chargement
- [ ] Vérifier Prestige/Crash ne cassent rien
- [ ] Update les coûts affichés si changement inflation/rabais

### LocalStorage Keys
- `datastream_save` → État complet
- `datastream_tutorial_done` → Tutorial fait
- `datastream_node_help` → Aide activée

### Valeurs Magiques à NE JAMAIS hardcoder
Utiliser `CONSTANTS` de utils.js :
- ❌ `if (distance < 200)`
- ✅ `if (distance < CONSTANTS.MAX_CONNECTION_DISTANCE)`

## 🔍 Debug Rapide

```javascript
// Console browser
window.game.gameState.data = 10000
window.game.gameState.consciousnessFragments = 100
window.game.gameState.save()

// Reset complet
localStorage.clear()
location.reload()
```

## 📊 Métriques Performance

- Tick logic : 100ms (10 FPS)
- Render : RAF (~60 FPS)
- Max particules : 10 par connexion
- Auto-save : 30s

## 🎨 Couleurs du Thème

```css
Background: #0a1628
Core: #00ffff (cyan)
Processor: #4db8ff (bleu clair)
Router: #00ff88 (vert)
Violet (upgrades): #a855f7
```

## 📌 TODO Potentiel (Non Urgent)

### Performance
- Pool d'objets pour particules (éviter GC)
- Spatial hashing pour collisions

### Refactoring
- [x] Créer utils.js
- [ ] Utiliser utils.js partout (remplacer duplications)
- [ ] Extraire magic numbers restants

### Features
- Achievements
- Export/Import save
- Modes de jeu (Challenge, Zen)

## 🗣️ Citations Importantes de l'Utilisateur

> "N'oublie pas DRY, KISS, SOLID. Même pour le CSS"

> "il ne faut vraiment pas utiliser de confirm() ou alert() js, il faut de belles modales pour tout ça"

> "Les particules ne couvrent pas l'intégralité de la liaison" → Résolu avec clamping

> "Toujours tutoyer l'utilisateur"

---

**Dernière mise à jour** : Session 2 (ajout idle mechanics)
**Prochaine session** : À déterminer
