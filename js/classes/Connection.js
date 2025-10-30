// Classe Connection - Représente un flux de données entre deux nœuds
// Principe SOLID : Single Responsibility (gère uniquement le flux)

export class Connection {
    constructor(fromNode, toNode) {
        this.fromNode = fromNode;
        this.toNode = toNode;

        // État du flux
        this.flowRate = 0; // Data/s qui transite
        this.saturation = 0; // 0-1 (0% à 100%)
        this.losses = 0; // % de pertes

        // Particules visuelles
        this.particles = [];
        this.lastParticleSpawn = 0;

        // Animation
        this.pulsePhase = 0;
    }

    // Met à jour le flux
    update(deltaTime, bandwidth, allNodes = []) {
        // Calcule le flux en fonction de la data disponible
        const availableData = this.fromNode.dataStored;
        const distance = this.fromNode.distanceTo(this.toNode);

        // Calcule la saturation basée sur la distance et la bandwidth
        const idealBandwidth = (availableData / distance) * 100;
        this.saturation = Math.min(idealBandwidth / bandwidth, 1);

        // Calcule les pertes (augmentent avec distance et saturation)
        const distanceLoss = Math.min(distance / 500, 0.3); // Max 30% pour distance
        const saturationLoss = this.saturation * 0.2; // Max 20% pour saturation
        let baseLosses = distanceLoss + saturationLoss;

        // Applique les réductions de pertes des nœuds voisins (moyenne des deux)
        const fromReduction = this.fromNode.calculateLossReduction(allNodes);
        const toReduction = this.toNode.calculateLossReduction(allNodes);
        const avgReduction = (fromReduction + toReduction) / 2;

        this.losses = Math.max(baseLosses * (1 - avgReduction), 0);

        // Transfère la data avec pertes
        if (availableData > 0) {
            const transferAmount = Math.min(availableData, 1) * (deltaTime / 1000);
            const effectiveTransfer = transferAmount * (1 - this.losses);

            this.fromNode.dataStored -= transferAmount;
            this.toNode.addData(effectiveTransfer);

            this.flowRate = effectiveTransfer;

            // Crée des particules pour l'animation
            this.spawnParticle();
        } else {
            this.flowRate = 0;
        }

        // Met à jour les particules existantes
        this.updateParticles(deltaTime);

        // Animation du pulse
        this.pulsePhase += deltaTime * 0.002 * (1 + this.flowRate * 0.5);
    }

    // Crée une particule visuelle
    spawnParticle() {
        const now = Date.now();
        if (now - this.lastParticleSpawn > 200) { // Une particule toutes les 200ms
            this.particles.push({
                progress: 0,
                speed: 0.5 // Vitesse fixe : 2 secondes pour parcourir tout le trajet
            });
            this.lastParticleSpawn = now;
        }
    }

    // Met à jour les particules
    updateParticles(deltaTime) {
        this.particles.forEach(particle => {
            particle.progress += particle.speed * (deltaTime / 1000);
        });

        // Garde les particules jusqu'à ce qu'elles dépassent largement 1.0
        // Cela permet de s'assurer qu'elles sont rendues au moins une fois à 1.0
        this.particles = this.particles.filter(particle => particle.progress < 1.3);

        // Limite le nombre de particules
        if (this.particles.length > 10) {
            this.particles.shift();
        }
    }

    // Retourne la couleur du flux selon la saturation
    getFlowColor() {
        if (this.saturation > 0.8) {
            return '#ff4444'; // Rouge si saturé
        } else if (this.saturation > 0.5) {
            return '#ffaa00'; // Orange si charge moyenne
        } else {
            return '#00ffff'; // Cyan si fluide
        }
    }

    // Retourne les infos pour l'UI
    getInfo() {
        return {
            from: this.fromNode.id,
            to: this.toNode.id,
            flowRate: this.flowRate.toFixed(2),
            saturation: (this.saturation * 100).toFixed(0),
            losses: (this.losses * 100).toFixed(1)
        };
    }

    // Vérifie si cette connexion existe déjà
    static exists(fromNode, toNode, connections) {
        return connections.some(conn =>
            (conn.fromNode.id === fromNode.id && conn.toNode.id === toNode.id) ||
            (conn.fromNode.id === toNode.id && conn.toNode.id === fromNode.id)
        );
    }
}
