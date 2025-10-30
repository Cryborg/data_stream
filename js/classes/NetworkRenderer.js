// Classe NetworkRenderer - Gère le rendu visuel du réseau
// Principe SOLID : Single Responsibility (gère uniquement le rendu)

import { CONFIG, NODE_TYPES } from '../config.js';
import { calculateDistance, canNodesConnect, CONSTANTS } from '../utils.js';

export class NetworkRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // État du rendu
        this.hoveredNode = null;
        this.previewNode = null;
        this.previewConnection = null;

        // Effets visuels
        this.stars = this.generateStars(100);
        this.gridOffset = { x: 0, y: 0 };
    }

    // Génère des étoiles de fond
    generateStars(count) {
        const stars = [];
        for (let i = 0; i < count; i++) {
            stars.push({
                x: Math.random() * CONFIG.CANVAS_WIDTH,
                y: Math.random() * CONFIG.CANVAS_HEIGHT,
                size: Math.random() * 2 + 0.5,
                opacity: Math.random() * 0.5 + 0.3
            });
        }
        return stars;
    }

    // Nettoie le canvas
    clear() {
        this.ctx.fillStyle = CONFIG.COLORS.BACKGROUND;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // Dessine le fond avec étoiles
    drawBackground() {
        // Étoiles
        this.stars.forEach(star => {
            this.ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // Grille subtile (optionnelle)
        this.drawGrid();
    }

    // Dessine une grille de fond
    drawGrid() {
        this.ctx.strokeStyle = CONFIG.COLORS.GRID;
        this.ctx.lineWidth = 0.5;
        this.ctx.globalAlpha = 0.15;

        const gridSize = 50;

        // Lignes verticales
        for (let x = 0; x < CONFIG.CANVAS_WIDTH; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, CONFIG.CANVAS_HEIGHT);
            this.ctx.stroke();
        }

        // Lignes horizontales
        for (let y = 0; y < CONFIG.CANVAS_HEIGHT; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(CONFIG.CANVAS_WIDTH, y);
            this.ctx.stroke();
        }

        this.ctx.globalAlpha = 1;
    }

    // Dessine toutes les connexions
    drawConnections(connections) {
        connections.forEach(connection => {
            this.drawConnection(connection);
        });
    }

    // Dessine une connexion
    drawConnection(connection) {
        const from = connection.fromNode;
        const to = connection.toNode;

        // Couleur selon l'état
        const color = connection.getFlowColor();

        // Ligne principale (centre à centre)
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = CONFIG.CONNECTION_WIDTH;
        this.ctx.globalAlpha = 0.6 + connection.flowRate * 0.1;

        this.ctx.beginPath();
        this.ctx.moveTo(from.x, from.y);
        this.ctx.lineTo(to.x, to.y);
        this.ctx.stroke();

        // Effet de glow
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = color;
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;

        this.ctx.globalAlpha = 1;

        // Dessine les particules
        connection.particles.forEach(particle => {
            this.drawParticle(from, to, particle.progress, color);
        });
    }

    // Dessine une particule en mouvement
    drawParticle(from, to, progress, color) {
        // Clamp le progress à 1.0 max pour ne pas dépasser visuellement
        const clampedProgress = Math.min(progress, 1.0);

        // Particules vont de centre à centre (comme les lignes)
        const x = from.x + (to.x - from.x) * clampedProgress;
        const y = from.y + (to.y - from.y) * clampedProgress;

        this.ctx.fillStyle = color;
        this.ctx.shadowBlur = 8;
        this.ctx.shadowColor = color;

        this.ctx.beginPath();
        this.ctx.arc(x, y, CONFIG.PARTICLE_SIZE, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.shadowBlur = 0;
    }

    // Dessine tous les nœuds
    drawNodes(nodes) {
        nodes.forEach(node => {
            this.drawNode(node, node === this.hoveredNode);
        });
    }

    // Dessine un nœud
    drawNode(node, isHovered = false) {
        const config = node.config;

        // Taille avec effet hover
        const radius = CONFIG.NODE_RADIUS + (isHovered ? 4 : 0);

        // Glow pulsant
        const glowSize = CONFIG.NODE_GLOW * (0.5 + node.glowIntensity * 0.5);

        // Cercle de glow
        const gradient = this.ctx.createRadialGradient(
            node.x, node.y, radius,
            node.x, node.y, radius + glowSize
        );
        gradient.addColorStop(0, config.color + 'AA');
        gradient.addColorStop(1, config.color + '00');

        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(node.x, node.y, radius + glowSize, 0, Math.PI * 2);
        this.ctx.fill();

        // Cercle principal
        this.ctx.fillStyle = config.color;
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;

        this.ctx.beginPath();
        this.ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();

        // Icône du nœud
        this.ctx.fillStyle = '#000000';
        this.ctx.font = `${radius}px sans-serif`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(config.icon, node.x, node.y);

        // Label si survolé
        if (isHovered) {
            this.drawNodeLabel(node);
        }
    }

    // Dessine le label d'un nœud
    drawNodeLabel(node) {
        const text = node.config.name;
        const padding = 8;

        this.ctx.font = '12px monospace';
        const metrics = this.ctx.measureText(text);
        const width = metrics.width + padding * 2;
        const height = 20;

        const x = node.x - width / 2;
        const y = node.y - CONFIG.NODE_RADIUS - height - 10;

        // Background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(x, y, width, height);

        // Bordure
        this.ctx.strokeStyle = node.config.color;
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x, y, width, height);

        // Texte
        this.ctx.fillStyle = CONFIG.COLORS.TEXT;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(text, node.x, y + height / 2);
    }

    // Dessine un aperçu de nœud (placement)
    drawPreviewNode(x, y, nodeType, canPlace) {
        const config = NODE_TYPES[nodeType];

        this.ctx.globalAlpha = 0.5;

        // Cercle de placement
        this.ctx.strokeStyle = canPlace ? '#00ff00' : '#ff0000';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);

        this.ctx.beginPath();
        this.ctx.arc(x, y, CONFIG.NODE_RADIUS, 0, Math.PI * 2);
        this.ctx.stroke();

        this.ctx.setLineDash([]);

        // Zone d'influence
        this.ctx.strokeStyle = config.color + '33';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 50, 0, Math.PI * 2);
        this.ctx.stroke();

        this.ctx.globalAlpha = 1;
    }

    // Dessine une prévisualisation de connexion
    drawPreviewConnection(fromNode, mouseX, mouseY) {
        this.ctx.strokeStyle = '#00ffff';
        this.ctx.lineWidth = CONFIG.CONNECTION_WIDTH;
        this.ctx.globalAlpha = 0.4;
        this.ctx.setLineDash([5, 5]);

        this.ctx.beginPath();
        this.ctx.moveTo(fromNode.x, fromNode.y);
        this.ctx.lineTo(mouseX, mouseY);
        this.ctx.stroke();

        this.ctx.setLineDash([]);
        this.ctx.globalAlpha = 1;
    }

    // Rendu principal
    render(gameState, mouseX, mouseY) {
        this.clear();
        this.drawBackground();

        // Connexions
        this.drawConnections(gameState.connections);

        // Nœuds
        this.drawNodes(gameState.nodes);

        // Prévisualisation de placement
        if (gameState.selectedNodeType && mouseX && mouseY) {
            const canPlace = this.checkCanPlace(gameState, mouseX, mouseY);
            // N'affiche l'aperçu que si le placement est possible
            if (canPlace) {
                this.drawPreviewNode(mouseX, mouseY, gameState.selectedNodeType, canPlace);
            }
        }
    }

    // Vérifie si on peut placer un nœud
    checkCanPlace(gameState, x, y) {
        const type = gameState.selectedNodeType;

        // Vérifie la distance minimum avec les autres nœuds
        const minDistanceOk = gameState.nodes.every(node => {
            const distance = calculateDistance({x, y}, node);
            return distance >= CONSTANTS.MIN_NODE_DISTANCE;
        });

        if (!minDistanceOk) return false;

        // Vérifie qu'au moins une connexion sera possible
        const canConnect = gameState.nodes.some(node => {
            const distance = calculateDistance({x, y}, node);

            // Distance OK ?
            if (distance > CONSTANTS.MAX_CONNECTION_DISTANCE) return false;

            // Règle : au moins un des deux doit être PROCESSOR ou CORE
            return canNodesConnect(type, node.type);
        });

        if (!canConnect) return false;

        // Règle spéciale : deux Routers ne peuvent pas se connecter entre eux
        if (type === 'ROUTER') {
            const tooCloseToRouter = gameState.nodes.some(n => {
                if (n.type !== 'ROUTER') return false;
                const distance = calculateDistance({x, y}, n);
                return distance < CONSTANTS.MAX_CONNECTION_DISTANCE;
            });

            if (tooCloseToRouter) return false;
        }

        return true;
    }

    // Trouve le nœud sous la souris
    getNodeAtPosition(nodes, x, y) {
        return nodes.find(node => {
            const distance = calculateDistance({x, y}, node);
            return distance <= CONFIG.NODE_RADIUS + 5;
        });
    }

    // Met à jour le nœud survolé
    updateHoveredNode(nodes, x, y) {
        this.hoveredNode = this.getNodeAtPosition(nodes, x, y);
    }
}
