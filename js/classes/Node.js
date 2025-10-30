// Classe Node - Représente un nœud du réseau
// Principe SOLID : Single Responsibility (gère uniquement l'état d'un nœud)

import { NODE_TYPES } from '../config.js';

export class Node {
    static nextId = 0;

    constructor(type, x, y) {
        this.id = Node.nextId++;
        this.type = type;
        this.config = NODE_TYPES[type];

        // Position
        this.x = x;
        this.y = y;

        // État
        this.dataStored = 0;
        this.dataRate = this.config.dataRate || 0;
        this.isActive = true;

        // Connexions (IDs des nœuds connectés)
        this.connections = [];

        // Visuels (pour animations)
        this.glowIntensity = 0;
        this.pulsePhase = Math.random() * Math.PI * 2;

        // Buffer pour Memory Node
        if (type === 'MEMORY') {
            this.buffer = [];
            this.bufferCapacity = this.config.bufferCapacity;
        }
    }

    // Calcule les bonus de production appliqués par les voisins
    calculateDataBonus(allNodes) {
        let bonus = 1.0;

        // Trouve les nœuds voisins connectés
        this.connections.forEach(neighborId => {
            const neighbor = allNodes.find(n => n.id === neighborId);
            if (!neighbor || !neighbor.isActive) return;

            const effect = neighbor.config.neighborEffect;
            if (!effect) return;

            // Applique les bonus de production
            if (effect.type === 'dataBoost') {
                bonus *= effect.value;
            } else if (effect.type === 'hybrid' && effect.dataBoost) {
                bonus *= effect.dataBoost;
            }
        });

        return bonus;
    }

    // Calcule la réduction de Bandwidth appliquée par les voisins
    calculateBandwidthReduction(allNodes) {
        let multiplier = 1.0;

        this.connections.forEach(neighborId => {
            const neighbor = allNodes.find(n => n.id === neighborId);
            if (!neighbor || !neighbor.isActive) return;

            const effect = neighbor.config.neighborEffect;
            if (!effect) return;

            // Applique les réductions de Bandwidth
            if (effect.type === 'bandwidthReduction') {
                multiplier *= effect.value;
            } else if (effect.type === 'hybrid' && effect.bandwidthReduction) {
                multiplier *= effect.bandwidthReduction;
            }
        });

        return multiplier;
    }

    // Calcule la réduction de pertes appliquée par les voisins
    calculateLossReduction(allNodes) {
        let reduction = 0;

        this.connections.forEach(neighborId => {
            const neighbor = allNodes.find(n => n.id === neighborId);
            if (!neighbor || !neighbor.isActive) return;

            const effect = neighbor.config.neighborEffect;
            if (!effect) return;

            // Applique les réductions de pertes (cumulatives)
            if (effect.type === 'lossReduction') {
                reduction += effect.value;
            }
        });

        // Maximum 90% de réduction
        return Math.min(reduction, 0.9);
    }

    // Met à jour le nœud (appelé chaque tick)
    update(deltaTime, allNodes = []) {
        if (!this.isActive) return;

        // Génération de data pour les nœuds producteurs (avec bonus des voisins)
        if (this.dataRate > 0) {
            const dataBonus = this.calculateDataBonus(allNodes);
            this.dataStored += this.dataRate * dataBonus * (deltaTime / 1000);
        }

        // Animation du glow
        this.pulsePhase += deltaTime * 0.003;
        this.glowIntensity = (Math.sin(this.pulsePhase) + 1) * 0.5;
    }

    // Ajoute de la data au nœud
    addData(amount) {
        if (this.type === 'MEMORY') {
            // Stocke dans le buffer
            if (this.buffer.length < this.bufferCapacity) {
                this.buffer.push({ amount, timestamp: Date.now() });
            }
        } else {
            this.dataStored += amount;
        }
    }

    // Récupère la data disponible
    extractData() {
        const data = this.dataStored;
        this.dataStored = 0;
        return data;
    }

    // Traite le buffer (Memory Node uniquement)
    processBuffer(deltaTime) {
        if (this.buffer.length > 0) {
            // Libère les données après un délai
            const now = Date.now();
            this.buffer = this.buffer.filter(item => {
                if (now - item.timestamp > 10000) { // 10s de buffer
                    this.dataStored += item.amount;
                    return false;
                }
                return true;
            });
        }
    }

    // Connecte ce nœud à un autre
    connectTo(nodeId) {
        if (!this.connections.includes(nodeId)) {
            this.connections.push(nodeId);
        }
    }

    // Déconnecte ce nœud d'un autre
    disconnectFrom(nodeId) {
        this.connections = this.connections.filter(id => id !== nodeId);
    }

    // Calcule la distance vers un autre nœud
    distanceTo(otherNode) {
        const dx = this.x - otherNode.x;
        const dy = this.y - otherNode.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // Vérifie si ce nœud peut être placé (collision)
    canPlaceAt(x, y, existingNodes, minDistance = 50) {
        return existingNodes.every(node => {
            const dx = x - node.x;
            const dy = y - node.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance >= minDistance;
        });
    }

    // Retourne les infos du nœud pour l'UI
    getInfo() {
        return {
            id: this.id,
            type: this.config.name,
            dataRate: this.dataRate,
            dataStored: this.dataStored.toFixed(1),
            connections: this.connections.length,
            cost: this.config.cost,
            bandwidthCost: this.config.bandwidthCost,
            description: this.config.description
        };
    }

    // Sérialisation pour sauvegarde
    serialize() {
        return {
            id: this.id,
            type: this.type,
            x: this.x,
            y: this.y,
            dataStored: this.dataStored,
            connections: this.connections,
            isActive: this.isActive
        };
    }

    // Désérialisation
    static deserialize(data) {
        const node = new Node(data.type, data.x, data.y);
        node.id = data.id;
        node.dataStored = data.dataStored;
        node.connections = data.connections;
        node.isActive = data.isActive;

        // Mise à jour du compteur d'ID
        if (data.id >= Node.nextId) {
            Node.nextId = data.id + 1;
        }

        return node;
    }
}
