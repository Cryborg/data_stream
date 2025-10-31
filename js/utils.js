// Utilitaires partagés - Principe DRY
// Regroupe les fonctions utilisées dans plusieurs fichiers

/**
 * Calcule la distance euclidienne entre deux points
 * @param {Object} pointA - {x, y}
 * @param {Object} pointB - {x, y}
 * @returns {number} Distance en pixels
 */
export function calculateDistance(pointA, pointB) {
    const dx = pointB.x - pointA.x;
    const dy = pointB.y - pointA.y;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Vérifie si un nœud peut servir de hub (CORE ou PROCESSOR)
 * @param {string} nodeType - Type du nœud
 * @returns {boolean}
 */
export function isHubNode(nodeType) {
    return nodeType === 'CORE' || nodeType === 'PROCESSOR';
}

/**
 * Vérifie si deux nœuds peuvent se connecter selon les règles
 * @param {string} typeA - Type du nœud A
 * @param {string} typeB - Type du nœud B
 * @returns {boolean}
 */
export function canNodesConnect(typeA, typeB) {
    // Au moins un des deux doit être un hub
    return isHubNode(typeA) || isHubNode(typeB);
}

/**
 * Calcule le coût d'un upgrade avec croissance exponentielle
 * @param {number} baseCost - Coût de base
 * @param {number} currentLevel - Niveau actuel
 * @param {number} growthFactor - Facteur de croissance
 * @returns {number}
 */
export function calculateUpgradeCost(baseCost, currentLevel, growthFactor) {
    return Math.ceil(baseCost * Math.pow(growthFactor, currentLevel));
}

/**
 * Formate un nombre avec séparateurs de milliers
 * @param {number} num - Nombre à formater
 * @returns {string}
 */
export function formatNumber(num) {
    return Math.floor(num).toLocaleString('fr-FR');
}

/**
 * Formate un temps en minutes/heures
 * @param {number} milliseconds - Temps en ms
 * @returns {string}
 */
export function formatTime(milliseconds) {
    const minutes = Math.floor(milliseconds / 60000);
    if (minutes < 60) {
        return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h${remainingMinutes > 0 ? remainingMinutes + 'min' : ''}`;
}

/**
 * Clamp une valeur entre min et max
 * @param {number} value - Valeur
 * @param {number} min - Minimum
 * @param {number} max - Maximum
 * @returns {number}
 */
export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * Interpole linéairement entre deux valeurs
 * @param {number} a - Valeur de départ
 * @param {number} b - Valeur d'arrivée
 * @param {number} t - Facteur (0-1)
 * @returns {number}
 */
export function lerp(a, b, t) {
    return a + (b - a) * t;
}

/**
 * Snap une position à la grille la plus proche
 * @param {number} x - Position X
 * @param {number} y - Position Y
 * @param {number} gridSize - Taille de la grille (défaut: 50)
 * @returns {Object} Position snappée {x, y}
 */
export function snapToGrid(x, y, gridSize = 50) {
    return {
        x: Math.round(x / gridSize) * gridSize,
        y: Math.round(y / gridSize) * gridSize
    };
}

// Constantes de configuration (extraites pour éviter magic numbers)
export const CONSTANTS = {
    GRID_SIZE: 50,                  // Taille de la grille de placement
    MAX_CONNECTION_DISTANCE: 200,   // Distance max pour auto-connexion (4 cases)
    MIN_NODE_DISTANCE: 50,          // Distance min entre nœuds (1 case)
    MAX_CONNECTIONS_PER_NODE: 3,    // Max de connexions auto
    OFFLINE_MIN_TIME: 60000,        // 1 minute minimum pour gains offline
    AUTOSAVE_INTERVAL: 30000,       // 30 secondes entre auto-saves
    BASE_OFFLINE_RATE: 0.25,        // 25% de gains offline de base
    BASE_INFLATION_RATE: 0.10,      // 10% d'inflation par nœud
};
