# Changelog - Data Stream

## [1.1.0] - Session 2 (Nuit)

### ✨ Nouvelles Fonctionnalités
- **Système Idle Complet**
  - Gains offline (25% de base, améliorable)
  - Modale d'accueil avec récap des gains
  - Auto-save toutes les 30 secondes

- **5 Upgrades Permanents**
  - 💤 Production Offline (10 niveaux)
  - ⬢ Optimisation Core (15 niveaux)
  - ◆ Optimisation Processor (15 niveaux)
  - 💰 Efficacité Réseau (10 niveaux)
  - 📉 Contrôle d'Inflation (10 niveaux)

- **Système d'Inflation**
  - Coûts augmentent de 10% par nœud placé
  - Formule exponentielle composée
  - Réinitialisé au Prestige/Crash

- **Interface Upgrades**
  - Modale dédiée avec grille responsive
  - Affichage niveau actuel/max
  - Boutons désactivés si pas assez de Fragments
  - Indication visuelle niveau MAX atteint

### 🔧 Améliorations
- Coûts des nœuds s'affichent en temps réel (avec inflation)
- Panneau d'info montre le coût réel
- Application automatique des upgrades aux nœuds existants
- Gestion correcte des données par défaut au chargement

### 🐛 Corrections
- Fix chargement des upgrades depuis sauvegarde
- Fix application des upgrades aux nœuds chargés
- Fix réinitialisation inflation au Prestige

---

## [1.0.0] - Session 1 (Création)

### ✨ Fonctionnalités Initiales

#### Réseau de Nœuds
- 7 types de nœuds (Core, Processor, Router, Compressor, Cache, Amplifier, Optimizer)
- Connexions automatiques (200px de rayon)
- Effets locaux entre nœuds connectés
- Animations de particules sur les flux

#### Règles de Connexion
- Seuls CORE et PROCESSOR peuvent servir de hub
- Autres types doivent se connecter à un hub
- Distance minimum 50px entre nœuds
- Max 3 connexions auto par nœud
- Routers ne peuvent pas se connecter entre eux

#### Système de Ressources
- Data : Ressource principale
- Bandwidth : Capacité réseau
- Integrity : Santé du système (0% = crash)
- Fragments de Conscience : Monnaie de prestige

#### Prestige
- Seuil : 1000 Data minimum
- Récompense : 1 Fragment / 1000 Data
- Réinitialise le réseau mais garde les Fragments

#### Interface
- Canvas avec rendu temps réel
- Sidebar avec boutons de nœuds
- Panneau d'info contextuel (activable/désactivable)
- Modales pour alerts, confirmations, prestige
- Tutoriel interactif 8 étapes

#### Système de Sauvegarde
- Auto-save toutes les 30s
- Save manuelle (Ctrl+S)
- LocalStorage
- Sérialisation complète du réseau

#### Tutoriel
- 8 étapes guidées
- Highlighting des éléments
- Flèches indicatives
- Position adaptative
- Skipable avec confirmation

### 🎨 Visuel
- Thème cyber-organique
- Palette cyan/violet
- Particules animées
- Glow effects
- Grille de fond avec étoiles

### 🔧 Technique
- Architecture ES6 Modules
- Principes DRY, KISS, SOLID respectés
- Classes séparées par responsabilité
- Configuration centralisée
- ~2500 lignes de code

---

## Format
Ce changelog suit [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/)
