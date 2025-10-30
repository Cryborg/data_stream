// Point d'entrée principal du jeu Data Stream
// Principe KISS : logique simple et claire

import { CONFIG, NODE_TYPES, PRESTIGE_MODULES, PERMANENT_UPGRADES } from './config.js';
import { GameState } from './classes/GameState.js';
import { NetworkRenderer } from './classes/NetworkRenderer.js';
import { Tutorial } from './classes/Tutorial.js';

class Game {
    constructor() {
        // Canvas
        this.canvas = document.getElementById('gameCanvas');
        this.canvas.width = CONFIG.CANVAS_WIDTH;
        this.canvas.height = CONFIG.CANVAS_HEIGHT;

        // État et rendu
        this.gameState = new GameState();
        this.renderer = new NetworkRenderer(this.canvas);

        // Input
        this.mouseX = 0;
        this.mouseY = 0;

        // Game loop
        this.lastUpdate = Date.now();
        this.isRunning = false;

        // Alertes
        this.criticalWarningShown = false;

        // Aide sur les nœuds (activée par défaut)
        this.nodeHelpEnabled = localStorage.getItem('datastream_node_help') !== 'false';

        // UI Elements
        this.initUI();

        // Event listeners
        this.initEventListeners();

        // Essaie de charger une sauvegarde
        this.loadGame();

        // Démarre le jeu
        this.start();

        // Initialise le tutoriel (après le démarrage pour que game soit accessible)
        this.tutorial = new Tutorial(this);
    }

    // Initialise les éléments d'UI
    initUI() {
        // Boutons de nœuds
        const nodeButtons = document.getElementById('nodeButtons');
        Object.entries(NODE_TYPES).forEach(([key, config]) => {
            if (key === 'CORE') return; // Pas de bouton pour le Core

            const button = document.createElement('button');
            button.className = 'node-button';
            button.innerHTML = `
                ${config.icon} ${config.name}
                <span class="cost">${config.cost} Data</span>
            `;
            button.style.borderColor = config.color;
            button.dataset.nodeType = key;

            button.addEventListener('click', () => this.selectNodeType(key));
            nodeButtons.appendChild(button);
        });

        // Boutons de prestige
        const prestigeButtons = document.getElementById('prestigeModules');
        Object.entries(PRESTIGE_MODULES).forEach(([key, module]) => {
            const button = document.createElement('button');
            button.className = 'prestige-button';
            button.innerHTML = `
                ${module.icon} ${module.name}
                <span class="cost">${module.cost} Fragments</span>
            `;
            button.dataset.moduleKey = key;

            button.addEventListener('click', () => this.unlockModule(key, module.cost));
            prestigeButtons.appendChild(button);
        });

        // Met à jour l'état visuel du bouton d'aide
        this.updateNodeHelpButton();
    }

    // Initialise les event listeners
    initEventListeners() {
        // Souris
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.handleRightClick(e);
        });

        // Boutons UI
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('saveBtn').addEventListener('click', () => this.saveGame());
        document.getElementById('prestigeBtn').addEventListener('click', () => this.showPrestigeModal());
        document.getElementById('upgradesBtn').addEventListener('click', () => this.showUpgradesModal());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetProgress());
        document.getElementById('toggleNodeHelp').addEventListener('click', () => this.toggleNodeHelp());

        // Modale de prestige
        document.getElementById('prestigeCancelBtn').addEventListener('click', () => this.hidePrestigeModal());
        document.getElementById('prestigeConfirmBtn').addEventListener('click', () => this.confirmPrestige());

        // Modale d'upgrades
        document.getElementById('upgradesCloseBtn').addEventListener('click', () => this.hideUpgradesModal());

        // Modales génériques
        document.getElementById('alertOkBtn').addEventListener('click', () => this.hideAlert());
        document.getElementById('confirmCancelBtn').addEventListener('click', () => this.hideConfirm(false));
        document.getElementById('confirmOkBtn').addEventListener('click', () => this.hideConfirm(true));

        // Raccourcis clavier
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }

    // Gestion de la souris
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;

        // Met à jour le nœud survolé
        this.renderer.updateHoveredNode(this.gameState.nodes, this.mouseX, this.mouseY);
    }

    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Mode placement de nœud
        if (this.gameState.selectedNodeType) {
            this.placeNode(x, y);
            return;
        }
    }

    handleRightClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Annule la sélection
        this.gameState.selectedNodeType = null;

        // Cache le panneau d'info
        this.hideNodeInfo();

        // Retire le highlight des boutons
        document.querySelectorAll('.node-button').forEach(btn => {
            btn.classList.remove('selected');
        });

        // Ou supprime un nœud
        const clickedNode = this.renderer.getNodeAtPosition(this.gameState.nodes, x, y);
        if (clickedNode) {
            const result = this.gameState.deleteNode(clickedNode);
            if (!result.success) {
                this.showMessage(result.message);
            }
        }
    }

    handleKeyPress(e) {
        switch(e.key) {
            case 'Escape':
                this.gameState.selectedNodeType = null;
                this.hideNodeInfo();
                document.querySelectorAll('.node-button').forEach(btn => {
                    btn.classList.remove('selected');
                });
                break;
            case ' ':
                this.togglePause();
                break;
            case 's':
                if (e.ctrlKey) {
                    e.preventDefault();
                    this.saveGame();
                }
                break;
        }
    }

    // Sélectionne un type de nœud à placer
    selectNodeType(nodeType) {
        this.gameState.selectedNodeType = nodeType;

        // Highlight du bouton
        document.querySelectorAll('.node-button').forEach(btn => {
            btn.classList.remove('selected');
        });
        document.querySelector(`[data-node-type="${nodeType}"]`).classList.add('selected');

        // Affiche le panneau d'info du nœud
        this.showNodeInfo(nodeType);

        // Notifie le tutoriel
        if (this.tutorial) {
            this.tutorial.notifyAction('nodeTypeSelected');
        }
    }

    // Affiche les infos du nœud sélectionné
    showNodeInfo(nodeType) {
        // Ne rien faire si l'aide est désactivée
        if (!this.nodeHelpEnabled) return;

        const config = NODE_TYPES[nodeType];

        document.getElementById('nodeInfoIcon').textContent = config.icon;
        document.getElementById('nodeInfoName').textContent = config.name;
        document.getElementById('nodeInfoDescription').textContent = config.description;
        document.getElementById('nodeInfoCost').textContent = `${config.cost} Data`;

        // Bandwidth
        if (config.bandwidthCost > 0) {
            document.getElementById('nodeInfoBandwidth').style.display = 'flex';
            document.getElementById('nodeInfoBandwidthValue').textContent = `-${config.bandwidthCost}`;
        } else if (config.bandwidthBonus) {
            document.getElementById('nodeInfoBandwidth').style.display = 'flex';
            document.getElementById('nodeInfoBandwidthValue').textContent = `+${config.bandwidthBonus}`;
            document.getElementById('nodeInfoBandwidthValue').style.color = '#00ff88';
        } else {
            document.getElementById('nodeInfoBandwidth').style.display = 'none';
        }

        // Effet principal
        let effectText = '';
        if (config.dataRate > 0) {
            effectText = `+${config.dataRate} Data/s`;
        } else if (config.lossReduction) {
            effectText = `-${config.lossReduction}% pertes`;
        } else if (config.multiplier) {
            effectText = `x${config.multiplier} flux`;
        } else if (config.bufferCapacity) {
            effectText = `Tampon ${config.bufferCapacity}`;
        } else {
            effectText = 'Voir description';
        }

        document.getElementById('nodeInfoEffectValue').textContent = effectText;

        // Change la couleur de bordure selon le type
        document.getElementById('nodeInfoPanel').style.borderColor = config.color;

        // Affiche le panneau
        document.getElementById('nodeInfoPanel').classList.remove('hidden');
    }

    // Cache les infos du nœud
    hideNodeInfo() {
        document.getElementById('nodeInfoPanel').classList.add('hidden');
    }

    // Toggle l'aide sur les nœuds
    toggleNodeHelp() {
        this.nodeHelpEnabled = !this.nodeHelpEnabled;
        localStorage.setItem('datastream_node_help', this.nodeHelpEnabled);
        this.updateNodeHelpButton();

        // Cache le panneau si on désactive l'aide
        if (!this.nodeHelpEnabled) {
            this.hideNodeInfo();
        }

        // Affiche un message
        this.showMessage(this.nodeHelpEnabled ? 'Aide activée' : 'Aide désactivée');
    }

    // Met à jour l'apparence du bouton d'aide
    updateNodeHelpButton() {
        const button = document.getElementById('toggleNodeHelp');
        if (this.nodeHelpEnabled) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    }

    // Place un nœud
    placeNode(x, y) {
        const result = this.gameState.addNode(this.gameState.selectedNodeType, x, y);

        if (!result.success) {
            this.showMessage(result.message);
            return;
        }

        this.showMessage(`${NODE_TYPES[this.gameState.selectedNodeType].name} placé`);

        // Notifie le tutoriel
        if (this.tutorial) {
            this.tutorial.notifyAction('nodePlaced');
        }

        // Garde le mode actif pour placer plusieurs nœuds
        // (décommenter la ligne suivante pour désactiver après placement)
        // this.gameState.selectedNodeType = null;
    }

    // Débloque un module de prestige
    unlockModule(moduleKey, cost) {
        const result = this.gameState.unlockModule(moduleKey, cost);

        if (result.success) {
            this.showMessage(`Module ${PRESTIGE_MODULES[moduleKey].name} débloqué !`);
            document.querySelector(`[data-module-key="${moduleKey}"]`).classList.add('unlocked');
        } else {
            this.showMessage(result.message);
        }
    }

    // Affiche la modale de prestige
    showPrestigeModal() {
        const reward = this.gameState.calculatePrestigeReward();

        if (reward === 0) {
            this.showMessage('Pas assez de Data pour le Prestige (min 1000)');
            return;
        }

        // Met à jour le montant affiché
        document.getElementById('prestigeRewardAmount').textContent = reward;

        // Affiche la modale
        document.getElementById('prestigeModal').classList.remove('hidden');
    }

    // Cache la modale de prestige
    hidePrestigeModal() {
        document.getElementById('prestigeModal').classList.add('hidden');
    }

    // Confirme et exécute le prestige
    confirmPrestige() {
        const result = this.gameState.prestige();

        if (result.success) {
            this.hidePrestigeModal();
            this.showMessage(result.message);
        } else {
            this.hidePrestigeModal();
            this.showMessage(result.message);
        }
    }

    // Pause/Resume
    togglePause() {
        this.gameState.isPaused = !this.gameState.isPaused;
        document.getElementById('pauseBtn').textContent =
            this.gameState.isPaused ? '▶ Resume' : '⏸ Pause';
    }

    // Sauvegarde
    saveGame() {
        const result = this.gameState.save();
        if (result.success) {
            this.showMessage('Partie sauvegardée');
        }
    }

    // Chargement
    loadGame() {
        const result = this.gameState.load();
        if (result.success) {
            // Si gains offline, affiche une modale
            if (result.offlineGains && result.offlineGains > 0) {
                this.showAlert(
                    '💤 Gains offline !',
                    `Tu es revenu après ${result.offlineMinutes} minute${result.offlineMinutes > 1 ? 's' : ''} d'absence.\n\nTu as gagné ${result.offlineGains.toFixed(1)} Data pendant ton absence !\n\n(${(this.gameState.permanentUpgrades.offlineRate * 5 + 25)}% des gains en ligne)`,
                    '💤'
                );
            } else {
                this.showMessage('Sauvegarde chargée');
            }
        }
    }

    // Affiche la modale d'upgrades permanents
    showUpgradesModal() {
        const grid = document.getElementById('upgradesGrid');
        grid.innerHTML = '';

        // Met à jour le compteur de fragments
        document.getElementById('upgradesFragmentsCount').textContent =
            this.gameState.consciousnessFragments;

        // Génère les cartes d'upgrades
        Object.entries(PERMANENT_UPGRADES).forEach(([key, upgrade]) => {
            const currentLevel = this.gameState.permanentUpgrades[key] || 0;
            const isMaxed = currentLevel >= upgrade.maxLevel;
            const cost = Math.ceil(upgrade.baseCost * Math.pow(upgrade.costIncrease, currentLevel));
            const canAfford = this.gameState.consciousnessFragments >= cost;

            const card = document.createElement('div');
            card.className = `upgrade-card ${isMaxed ? 'maxed' : ''}`;
            card.innerHTML = `
                <div class="upgrade-header">
                    <div class="upgrade-icon">${upgrade.icon}</div>
                    <div class="upgrade-title">
                        <h3>${upgrade.name}</h3>
                        <div class="upgrade-level">Niveau ${currentLevel} / ${upgrade.maxLevel}</div>
                    </div>
                </div>
                <div class="upgrade-description">${upgrade.description}</div>
                <div class="upgrade-base-desc">${upgrade.baseDescription}</div>
                <button
                    class="upgrade-buy-btn ${isMaxed ? 'maxed' : ''}"
                    ${isMaxed || !canAfford ? 'disabled' : ''}
                    data-upgrade-key="${key}">
                    ${isMaxed ? 'MAX' : `Améliorer (${cost} Fragments)`}
                </button>
            `;

            // Event listener pour le bouton d'achat
            const btn = card.querySelector('.upgrade-buy-btn');
            if (!isMaxed) {
                btn.addEventListener('click', () => this.buyUpgrade(key));
            }

            grid.appendChild(card);
        });

        // Affiche la modale
        document.getElementById('upgradesModal').classList.remove('hidden');
    }

    // Cache la modale d'upgrades
    hideUpgradesModal() {
        document.getElementById('upgradesModal').classList.add('hidden');
    }

    // Achète un upgrade permanent
    buyUpgrade(upgradeKey) {
        const upgrade = PERMANENT_UPGRADES[upgradeKey];
        const currentLevel = this.gameState.permanentUpgrades[upgradeKey] || 0;

        // Vérifie le niveau max
        if (currentLevel >= upgrade.maxLevel) {
            this.showMessage('Niveau maximum atteint');
            return;
        }

        // Calcule le coût
        const cost = Math.ceil(upgrade.baseCost * Math.pow(upgrade.costIncrease, currentLevel));

        // Vérifie si on a assez de fragments
        if (this.gameState.consciousnessFragments < cost) {
            this.showMessage('Pas assez de Fragments');
            return;
        }

        // Achète l'upgrade
        this.gameState.consciousnessFragments -= cost;
        this.gameState.permanentUpgrades[upgradeKey] = currentLevel + 1;

        // Applique l'upgrade aux nœuds existants si nécessaire
        if (upgradeKey === 'coreProduction' || upgradeKey === 'processorProduction') {
            this.gameState.nodes.forEach(node => {
                if ((upgradeKey === 'coreProduction' && node.type === 'CORE') ||
                    (upgradeKey === 'processorProduction' && node.type === 'PROCESSOR')) {
                    node.dataRate += 1;
                }
            });
        }

        // Rafraîchit la modale
        this.showUpgradesModal();
        this.showMessage(`${upgrade.name} amélioré !`);
    }

    // Affiche un message
    showMessage(message) {
        const messageEl = document.getElementById('message');
        messageEl.textContent = message;
        messageEl.style.opacity = '1';

        setTimeout(() => {
            messageEl.style.opacity = '0';
        }, 3000);
    }

    // Met à jour l'UI
    updateUI() {
        // Ressources
        document.getElementById('dataAmount').textContent = this.gameState.data.toFixed(1);
        // Affiche la bandwidth utilisée (avec réductions) / disponible
        document.getElementById('bandwidthAmount').textContent =
            `${this.gameState.bandwidthUsed.toFixed(0)} / ${this.gameState.bandwidth.toFixed(0)}`;
        document.getElementById('integrityAmount').textContent =
            `${this.gameState.integrity.toFixed(1)}%`;
        document.getElementById('fragmentsAmount').textContent =
            this.gameState.consciousnessFragments.toFixed(0);

        // Stats
        document.getElementById('nodeCount').textContent = this.gameState.nodes.length;
        document.getElementById('connectionCount').textContent = this.gameState.connections.length;
        document.getElementById('dataGenerated').textContent =
            this.gameState.totalDataGenerated.toFixed(0);
        document.getElementById('dataLost').textContent =
            this.gameState.totalDataLost.toFixed(0);

        // Barre d'intégrité
        const integrityBar = document.querySelector('.integrity-bar-fill');
        integrityBar.style.width = `${this.gameState.integrity}%`;

        if (this.gameState.integrity < 30) {
            integrityBar.style.backgroundColor = '#ff4444';
            // Alerte visuelle si critique
            if (this.gameState.integrity < 20 && !this.criticalWarningShown) {
                this.showMessage('🚨 ALERTE : Integrity critique ! Place des Routers !');
                this.criticalWarningShown = true;
            }
        } else {
            this.criticalWarningShown = false;
            if (this.gameState.integrity < 60) {
                integrityBar.style.backgroundColor = '#ffaa00';
            } else {
                integrityBar.style.backgroundColor = '#00ff88';
            }
        }
    }

    // Affiche la modale de crash
    showCrashModal(callback) {
        this.showAlert(
            '💥 SYSTEM CRASH !',
            'Ton réseau était trop chargé.\nL\'Integrity est tombée à 0%.\n\nTous les nœuds ont été perdus.\n\n💡 Conseil : Place plus de Routers pour augmenter la Bandwidth !',
            '💥',
            callback
        );
    }

    // Affiche une alerte
    showAlert(title, message, icon = '⚠️', callback = null) {
        document.getElementById('alertTitle').textContent = title;
        document.getElementById('alertMessage').textContent = message;
        document.getElementById('alertIcon').textContent = icon;
        document.getElementById('alertModal').classList.remove('hidden');
        this.alertCallback = callback;
    }

    // Cache l'alerte
    hideAlert() {
        document.getElementById('alertModal').classList.add('hidden');
        if (this.alertCallback) {
            this.alertCallback();
            this.alertCallback = null;
        }
    }

    // Affiche une confirmation
    showConfirm(title, message, icon = '❓') {
        return new Promise((resolve) => {
            document.getElementById('confirmTitle').textContent = title;
            document.getElementById('confirmMessage').textContent = message;
            document.getElementById('confirmIcon').textContent = icon;
            document.getElementById('confirmModal').classList.remove('hidden');
            this.confirmResolve = resolve;
        });
    }

    // Cache la confirmation
    hideConfirm(result) {
        document.getElementById('confirmModal').classList.add('hidden');
        if (this.confirmResolve) {
            this.confirmResolve(result);
            this.confirmResolve = null;
        }
    }

    // Réinitialise la progression (debug)
    async resetProgress() {
        const confirmed = await this.showConfirm(
            '⚠️ Réinitialisation totale',
            'Cela supprimera :\n- Toutes tes sauvegardes\n- Tous tes Fragments de Conscience\n- Le tutoriel sera relancé\n\nCette action est irréversible !',
            '⚠️'
        );

        if (!confirmed) return;

        // Supprime toutes les sauvegardes
        localStorage.removeItem('datastream_save');
        localStorage.removeItem('datastream_tutorial_done');

        // Recharge la page
        location.reload();
    }

    // Game loop
    update() {
        if (!this.isRunning) return;

        const now = Date.now();
        const deltaTime = Math.min(now - this.lastUpdate, 100); // Cap à 100ms
        this.lastUpdate = now;

        // Met à jour le jeu
        this.gameState.update(deltaTime);

        // Met à jour l'UI
        this.updateUI();

        // Rendu
        this.renderer.render(this.gameState, this.mouseX, this.mouseY);

        // Auto-save toutes les 30 secondes
        if (Math.floor(this.gameState.gameTime / 30000) > this.lastAutoSave) {
            this.lastAutoSave = Math.floor(this.gameState.gameTime / 30000);
            this.gameState.save();
        }

        requestAnimationFrame(() => this.update());
    }

    // Démarre le jeu
    start() {
        this.isRunning = true;
        this.lastUpdate = Date.now();
        this.lastAutoSave = 0;
        this.update();
    }

    // Arrête le jeu
    stop() {
        this.isRunning = false;
    }
}

// Initialise le jeu quand le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});
