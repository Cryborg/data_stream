// Classe GameState - Gère l'état global du jeu et les ressources
// Principe SOLID : Single Responsibility (gère uniquement l'état global)

import { CONFIG, NODE_TYPES } from '../config.js';
import { Node } from './Node.js';
import { Connection } from './Connection.js';

export class GameState {
    constructor() {
        // Ressources
        this.data = CONFIG.INITIAL_DATA;
        this.bandwidth = CONFIG.INITIAL_BANDWIDTH;
        this.bandwidthUsed = 0; // Consommation réelle (avec effets locaux)
        this.integrity = CONFIG.INITIAL_INTEGRITY;
        this.consciousnessFragments = 0;

        // Statistiques
        this.totalDataGenerated = 0;
        this.totalDataLost = 0;
        this.prestigeCount = 0;

        // Réseau
        this.nodes = [];
        this.connections = [];

        // Modules de prestige débloqués
        this.unlockedModules = [];

        // Upgrades permanents achetés (niveau de chaque upgrade)
        this.permanentUpgrades = {
            offlineRate: 0,
            coreProduction: 0,
            processorProduction: 0,
            nodeDiscount: 0
        };

        // État du jeu
        this.isPaused = false;
        this.gameTime = 0;
        this.lastSaveTime = Date.now(); // Pour calculer les gains offline

        // Mode construction
        this.selectedNodeType = null;

        // Initialise avec le Core au centre
        this.initializeCore();
    }

    // Initialise le nœud Core
    initializeCore() {
        const coreX = CONFIG.CANVAS_WIDTH / 2;
        const coreY = CONFIG.CANVAS_HEIGHT / 2;
        const core = new Node('CORE', coreX, coreY);
        // Applique les upgrades au Core
        this.applyUpgradesToNode(core);
        this.nodes.push(core);
    }

    // Applique les upgrades permanents à un nœud
    applyUpgradesToNode(node) {
        // Bonus de production
        if (node.type === 'CORE') {
            node.dataRate += this.permanentUpgrades.coreProduction;
        } else if (node.type === 'PROCESSOR') {
            node.dataRate += this.permanentUpgrades.processorProduction;
        }
    }

    // Calcule le coût d'un nœud avec les upgrades
    getNodeCost(nodeType) {
        const baseCost = NODE_TYPES[nodeType].cost;
        const discount = this.permanentUpgrades.nodeDiscount * 0.05; // 5% par niveau
        return Math.ceil(baseCost * (1 - discount));
    }

    // Met à jour le jeu (appelé chaque tick)
    update(deltaTime) {
        if (this.isPaused) return;

        this.gameTime += deltaTime;

        // Met à jour tous les nœuds (avec les voisins pour calculer les bonus)
        this.nodes.forEach(node => node.update(deltaTime, this.nodes));

        // Met à jour toutes les connexions
        this.connections.forEach(connection => {
            connection.update(deltaTime, this.bandwidth, this.nodes);

            // Comptabilise les pertes
            if (connection.losses > 0) {
                this.totalDataLost += connection.flowRate * connection.losses * (deltaTime / 1000);
            }
        });

        // Collecte la data générée
        this.collectData();

        // Calcule la bandwidth totale (avec effets locaux)
        this.updateBandwidthUsage();

        // Met à jour l'intégrité
        this.updateIntegrity(deltaTime);

        // Vérifie le crash
        this.checkCrash();

        // Génère les Fragments de Conscience (si Subcores présents)
        this.generateConsciousness(deltaTime);
    }

    // Collecte la data de tous les nœuds
    collectData() {
        this.nodes.forEach(node => {
            if (node.dataStored > 0) {
                const collected = node.extractData();
                this.data += collected;
                this.totalDataGenerated += collected;
            }
        });
    }

    // Calcule l'utilisation réelle de Bandwidth (avec effets locaux)
    updateBandwidthUsage() {
        // Calcule la consommation totale en tenant compte des effets des voisins
        this.bandwidthUsed = this.nodes.reduce((sum, node) => {
            const baseCost = node.config.bandwidthCost || 0;
            const reduction = node.calculateBandwidthReduction(this.nodes);
            return sum + (baseCost * reduction);
        }, 0);

        // La bandwidth disponible est fixe
        this.bandwidth = CONFIG.INITIAL_BANDWIDTH;

        // Applique les modules de prestige
        if (this.unlockedModules.includes('FRACTAL_ROUTING')) {
            this.bandwidth *= 1.15; // +15% bonus
        }
    }

    // Met à jour l'intégrité du système
    updateIntegrity(deltaTime) {
        // Si surcharge, l'intégrité baisse
        if (this.bandwidthUsed > this.bandwidth) {
            const overload = (this.bandwidthUsed - this.bandwidth) / this.bandwidth;
            this.integrity -= overload * 5 * (deltaTime / 1000);
        }

        // Module Self-Healing
        if (this.unlockedModules.includes('SELF_HEALING')) {
            this.integrity += 1 * (deltaTime / 1000);
        }

        // Limite à 100%
        this.integrity = Math.min(Math.max(this.integrity, 0), 100);
    }

    // Vérifie le crash du système
    checkCrash() {
        if (this.integrity <= 0 && !this.crashTriggered) {
            // Évite les crashs multiples
            this.crashTriggered = true;

            // Pause le jeu avant le crash
            this.isPaused = true;

            // Notifie le game pour afficher la modale
            if (window.game) {
                window.game.showCrashModal(() => {
                    this.softReboot();
                    this.isPaused = false;
                    this.crashTriggered = false;
                });
            } else {
                // Fallback si window.game n'est pas disponible
                this.softReboot();
                this.isPaused = false;
                this.crashTriggered = false;
            }
        }
    }

    // Soft reboot (sans gain de Fragments)
    softReboot() {
        // Réinitialise les ressources
        this.data = CONFIG.INITIAL_DATA;
        this.integrity = CONFIG.INITIAL_INTEGRITY;

        // Garde seulement le Core
        const core = this.nodes.find(n => n.type === 'CORE');
        this.nodes = [core];
        this.connections = [];

        // Message au joueur
        this.showMessage('⚠️ SYSTEM CRASH - Rebooting...');
    }

    // Génère les Fragments de Conscience (désactivé - seulement au prestige)
    generateConsciousness(deltaTime) {
        // Les Fragments ne sont plus générés pendant la partie
        // Ils sont uniquement gagnés lors du Prestige
    }

    // Ajoute un nœud au réseau
    addNode(type, x, y) {
        const nodeType = NODE_TYPES[type];

        // Calcule le coût avec rabais
        const nodeCost = this.getNodeCost(type);

        // Vérifie si on a assez de data
        if (this.data < nodeCost) {
            return { success: false, message: 'Pas assez de Data' };
        }

        // Vérifie si c'est unique et déjà présent
        if (nodeType.unique && this.nodes.some(n => n.type === type)) {
            return { success: false, message: 'Nœud unique déjà présent' };
        }

        // Vérifie la distance minimum avec les autres nœuds
        const canPlace = this.nodes.every(n => {
            const dx = x - n.x;
            const dy = y - n.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance >= 50;
        });

        if (!canPlace) {
            return { success: false, message: 'Trop proche d\'un autre nœud' };
        }

        // Règle spéciale : deux Routers ne peuvent pas se connecter entre eux
        // S'ils sont assez proches pour se connecter (200px), c'est interdit
        if (type === 'ROUTER') {
            const tooCloseToRouter = this.nodes.some(n => {
                if (n.type !== 'ROUTER') return false;
                const dx = x - n.x;
                const dy = y - n.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                return distance < 200; // Distance de connexion automatique
            });

            if (tooCloseToRouter) {
                return { success: false, message: 'Routers ne peuvent pas être connectés entre eux' };
            }
        }

        // Vérifie qu'au moins une connexion sera créée
        const MAX_CONNECTION_DISTANCE = 200;
        const canConnectToAny = this.nodes.some(n => {
            const dx = x - n.x;
            const dy = y - n.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Distance OK ?
            if (distance > MAX_CONNECTION_DISTANCE) return false;

            // Règle : au moins un des deux doit être PROCESSOR ou CORE
            return (type === 'PROCESSOR' || type === 'CORE' ||
                    n.type === 'PROCESSOR' || n.type === 'CORE');
        });

        if (!canConnectToAny) {
            return { success: false, message: 'Trop loin : aucune connexion possible !' };
        }

        // Crée le nœud
        const node = new Node(type, x, y);

        // Applique les upgrades permanents au nouveau nœud
        this.applyUpgradesToNode(node);

        this.nodes.push(node);

        // Déduit le coût (avec rabais)
        this.data -= nodeCost;

        // Crée automatiquement des connexions avec les nœuds proches
        this.autoConnectNode(node);

        return { success: true, node };
    }

    // Connecte automatiquement un nœud aux nœuds proches
    autoConnectNode(newNode) {
        const MAX_CONNECTION_DISTANCE = 200; // Distance max pour connexion auto
        const MAX_CONNECTIONS_PER_NODE = 3;  // Max 3 connexions par nœud

        // Règle : seuls les Processors (et Core) peuvent se connecter entre eux
        // Les autres types ne peuvent se connecter qu'à des Processors/Core
        const canConnectTo = (nodeA, nodeB) => {
            const typeA = nodeA.type;
            const typeB = nodeB.type;

            // Au moins un des deux doit être PROCESSOR ou CORE
            return (typeA === 'PROCESSOR' || typeA === 'CORE' ||
                    typeB === 'PROCESSOR' || typeB === 'CORE');
        };

        // Trouve les nœuds dans le rayon
        const nearbyNodes = this.nodes
            .filter(n => n.id !== newNode.id)
            .filter(n => canConnectTo(newNode, n)) // Filtre selon les règles de connexion
            .map(n => ({
                node: n,
                distance: newNode.distanceTo(n)
            }))
            .filter(item => item.distance <= MAX_CONNECTION_DISTANCE)
            .sort((a, b) => a.distance - b.distance)
            .slice(0, MAX_CONNECTIONS_PER_NODE);

        // Crée les connexions
        nearbyNodes.forEach(item => {
            if (!Connection.exists(newNode, item.node, this.connections)) {
                const connection = new Connection(newNode, item.node);
                this.connections.push(connection);
                newNode.connectTo(item.node.id);
                item.node.connectTo(newNode.id);
            }
        });
    }

    // Crée une connexion entre deux nœuds
    createConnection(fromNode, toNode) {
        // Vérifie si la connexion n'existe pas déjà
        if (Connection.exists(fromNode, toNode, this.connections)) {
            return { success: false, message: 'Connexion déjà existante' };
        }

        // Crée la connexion
        const connection = new Connection(fromNode, toNode);
        this.connections.push(connection);

        // Ajoute la connexion aux nœuds
        fromNode.connectTo(toNode.id);
        toNode.connectTo(fromNode.id);

        return { success: true, connection };
    }

    // Vérifie si tous les nœuds (sauf excludedNodeId) sont connectés au Core
    isNetworkConnected(excludedNodeId = null) {
        const core = this.nodes.find(n => n.type === 'CORE');
        if (!core) return false;

        // Liste des nœuds à vérifier (tous sauf le Core et le nœud exclu)
        const nodesToCheck = this.nodes.filter(n =>
            n.type !== 'CORE' && n.id !== excludedNodeId
        );

        if (nodesToCheck.length === 0) return true; // Seulement le Core

        // BFS depuis le Core pour trouver tous les nœuds accessibles
        const visited = new Set();
        const queue = [core.id];
        visited.add(core.id);

        while (queue.length > 0) {
            const currentId = queue.shift();
            const currentNode = this.nodes.find(n => n.id === currentId);
            if (!currentNode) continue;

            // Parcourt les connexions de ce nœud
            currentNode.connections.forEach(neighborId => {
                // Ignore le nœud exclu
                if (neighborId === excludedNodeId) return;

                // Si pas encore visité, l'ajouter
                if (!visited.has(neighborId)) {
                    visited.add(neighborId);
                    queue.push(neighborId);
                }
            });
        }

        // Vérifie que tous les nœuds (sauf exclu) sont visités
        return nodesToCheck.every(n => visited.has(n.id));
    }

    // Supprime un nœud
    deleteNode(node) {
        if (node.type === 'CORE') {
            return { success: false, message: 'Impossible de supprimer le Core' };
        }

        // Vérifie que la suppression ne déconnecte pas le réseau
        if (!this.isNetworkConnected(node.id)) {
            return { success: false, message: 'Suppression impossible : déconnecterait le réseau' };
        }

        // Supprime toutes les connexions liées
        this.connections = this.connections.filter(conn =>
            conn.fromNode.id !== node.id && conn.toNode.id !== node.id
        );

        // Met à jour les listes de connexions des nœuds voisins
        this.nodes.forEach(n => {
            n.disconnectFrom(node.id);
        });

        // Supprime le nœud
        this.nodes = this.nodes.filter(n => n.id !== node.id);

        return { success: true };
    }

    // Calcule les Fragments qui seraient gagnés (pour preview)
    calculatePrestigeReward() {
        if (this.data < CONFIG.PRESTIGE_THRESHOLD) {
            return 0;
        }
        return Math.floor(this.data / 1000);
    }

    // Prestige (reboot avec bonus)
    prestige() {
        if (this.data < CONFIG.PRESTIGE_THRESHOLD) {
            return { success: false, message: 'Pas assez de Data pour le Prestige' };
        }

        // Calcule les Fragments gagnés
        const fragmentsGained = this.calculatePrestigeReward();
        this.consciousnessFragments += fragmentsGained;
        this.prestigeCount++;

        // Réinitialise le jeu
        this.data = CONFIG.INITIAL_DATA;
        this.integrity = CONFIG.INITIAL_INTEGRITY;

        // Garde seulement le Core
        const core = this.nodes.find(n => n.type === 'CORE');
        this.nodes = [core];
        this.connections = [];

        return {
            success: true,
            fragmentsGained,
            message: `+${fragmentsGained} Fragments de Conscience`
        };
    }

    // Débloque un module de prestige
    unlockModule(moduleName, cost) {
        if (this.consciousnessFragments < cost) {
            return { success: false, message: 'Pas assez de Fragments' };
        }

        if (this.unlockedModules.includes(moduleName)) {
            return { success: false, message: 'Module déjà débloqué' };
        }

        this.consciousnessFragments -= cost;
        this.unlockedModules.push(moduleName);

        return { success: true };
    }

    // Affiche un message (pour debug ou notifications)
    showMessage(message) {
        console.log(message);
        // TODO: Ajouter un système de notifications visuelles
    }

    // Sauvegarde l'état du jeu
    save() {
        const saveData = {
            data: this.data,
            bandwidth: this.bandwidth,
            integrity: this.integrity,
            consciousnessFragments: this.consciousnessFragments,
            totalDataGenerated: this.totalDataGenerated,
            totalDataLost: this.totalDataLost,
            prestigeCount: this.prestigeCount,
            nodes: this.nodes.map(n => n.serialize()),
            unlockedModules: this.unlockedModules,
            permanentUpgrades: this.permanentUpgrades,
            gameTime: this.gameTime,
            lastSaveTime: Date.now()
        };

        localStorage.setItem('datastream_save', JSON.stringify(saveData));
        return { success: true };
    }

    // Calcule les gains offline
    calculateOfflineGains(offlineTime) {
        // Calcule le taux de production total par seconde
        let productionRate = 0;
        this.nodes.forEach(node => {
            if (node.dataRate > 0) {
                const dataBonus = node.calculateDataBonus(this.nodes);
                productionRate += node.dataRate * dataBonus;
            }
        });

        // Gains offline = production * temps * pourcentage offline
        const baseOfflineRate = 0.25; // 25% de base
        const upgradeBonus = this.permanentUpgrades.offlineRate * 0.05; // +5% par niveau
        const offlineRate = baseOfflineRate + upgradeBonus;

        const offlineGains = productionRate * (offlineTime / 1000) * offlineRate;
        return Math.floor(offlineGains);
    }

    // Charge l'état du jeu
    load() {
        const saveData = localStorage.getItem('datastream_save');
        if (!saveData) {
            return { success: false, message: 'Aucune sauvegarde trouvée' };
        }

        try {
            const data = JSON.parse(saveData);

            this.data = data.data;
            this.bandwidth = data.bandwidth;
            this.integrity = data.integrity;
            this.consciousnessFragments = data.consciousnessFragments;
            this.totalDataGenerated = data.totalDataGenerated;
            this.totalDataLost = data.totalDataLost;
            this.prestigeCount = data.prestigeCount;
            this.unlockedModules = data.unlockedModules || [];
            this.permanentUpgrades = data.permanentUpgrades || { offlineRate: 0 };
            this.gameTime = data.gameTime;

            // Recrée les nœuds
            this.nodes = data.nodes.map(nodeData => Node.deserialize(nodeData));

            // Applique les upgrades aux nœuds chargés
            this.nodes.forEach(node => this.applyUpgradesToNode(node));

            // Recrée les connexions
            this.connections = [];
            this.nodes.forEach(node => {
                node.connections.forEach(targetId => {
                    const targetNode = this.nodes.find(n => n.id === targetId);
                    if (targetNode && !Connection.exists(node, targetNode, this.connections)) {
                        this.connections.push(new Connection(node, targetNode));
                    }
                });
            });

            // Calcule les gains offline
            const now = Date.now();
            const lastSave = data.lastSaveTime || now;
            const offlineTime = now - lastSave;

            // Minimum 1 minute offline pour avoir des gains
            if (offlineTime > 60000) {
                const offlineGains = this.calculateOfflineGains(offlineTime);
                this.data += offlineGains;

                const offlineMinutes = Math.floor(offlineTime / 60000);
                return {
                    success: true,
                    offlineGains,
                    offlineMinutes
                };
            }

            return { success: true };
        } catch (error) {
            return { success: false, message: 'Erreur de chargement' };
        }
    }
}
