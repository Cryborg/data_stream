// Configuration du jeu Data Stream
// Principe DRY : toutes les constantes et configs au même endroit

export const CONFIG = {
    // Canvas
    CANVAS_WIDTH: 1200,
    CANVAS_HEIGHT: 800,

    // Couleurs (palette cyber-organique)
    COLORS: {
        BACKGROUND: '#0a1628',
        CORE: '#00ffff',        // Cyan
        PROCESSOR: '#4db8ff',    // Bleu clair
        ROUTER: '#00ff88',       // Vert
        COMPRESSOR: '#a855f7',   // Violet
        MEMORY: '#fbbf24',       // Jaune
        MIRROR: '#ec4899',       // Rose
        SUBCORE: '#ffffff',      // Blanc
        CONNECTION: '#00ffff',
        CONNECTION_SATURATED: '#ff4444',
        PARTICLE: '#00ffff',
        GRID: '#1e3a5f',
        TEXT: '#e0f2fe'
    },

    // Tailles
    NODE_RADIUS: 12,
    NODE_GLOW: 20,
    CONNECTION_WIDTH: 2,
    PARTICLE_SIZE: 3,

    // Gameplay
    INITIAL_DATA: 10,
    INITIAL_BANDWIDTH: 100,
    INITIAL_INTEGRITY: 100,
    TICK_RATE: 100, // ms

    // Progression
    PRESTIGE_THRESHOLD: 1000, // Data nécessaire pour prestige
};

// Définition des types de nœuds
// Principe SOLID : chaque type a des propriétés bien définies
// NOUVEAU : Effets locaux sur les nœuds connectés
export const NODE_TYPES = {
    CORE: {
        name: 'Core',
        color: '#00ffff',
        cost: 0,
        bandwidthCost: 0,
        dataRate: 2, // Data/s
        description: 'Point de départ du réseau. Génère de la Data. Sert de hub pour connecter les nœuds.',
        unique: true, // Un seul Core par réseau
        icon: '⬢',
        // Pas d'effet sur les voisins
    },

    PROCESSOR: {
        name: 'Processor',
        color: '#4db8ff',
        cost: 10,
        bandwidthCost: 8,
        dataRate: 6,
        description: 'Génère de la Data. Sert de hub pour connecter les autres nœuds (Router, Cache, etc.).',
        icon: '◆'
    },

    ROUTER: {
        name: 'Router',
        color: '#00ff88',
        cost: 15,
        bandwidthCost: 3,
        dataRate: 0,
        description: 'Divise par 2 la consommation Bandwidth des nœuds connectés.',
        icon: '◇',
        // Effet sur voisins
        neighborEffect: {
            type: 'bandwidthReduction',
            value: 0.5 // Divise par 2
        }
    },

    COMPRESSOR: {
        name: 'Compressor',
        color: '#a855f7',
        cost: 20,
        bandwidthCost: 4,
        dataRate: 0,
        description: 'Réduit de 50% les pertes sur les connexions des nœuds voisins.',
        icon: '◈',
        // Effet sur voisins
        neighborEffect: {
            type: 'lossReduction',
            value: 0.5 // -50% pertes
        }
    },

    CACHE: {
        name: 'Cache',
        color: '#fbbf24',
        cost: 25,
        bandwidthCost: 3,
        dataRate: 0,
        description: 'Augmente de 30% la production Data des nœuds connectés.',
        icon: '◐',
        // Effet sur voisins
        neighborEffect: {
            type: 'dataBoost',
            value: 1.3 // x1.3
        }
    },

    AMPLIFIER: {
        name: 'Amplifier',
        color: '#ec4899',
        cost: 35,
        bandwidthCost: 12,
        dataRate: 0,
        description: 'Multiplie par 1.8 la production des voisins, mais consomme beaucoup de Bandwidth.',
        icon: '◎',
        // Effet sur voisins
        neighborEffect: {
            type: 'dataBoost',
            value: 1.8 // x1.8
        }
    },

    OPTIMIZER: {
        name: 'Optimizer',
        color: '#ffffff',
        cost: 100,
        bandwidthCost: 8,
        dataRate: 8,
        description: 'Réduit de 40% la Bandwidth des voisins et augmente leur production de 25%.',
        requiresPrestige: 1, // Débloqué après 1 prestige
        icon: '◉',
        // Effet sur voisins
        neighborEffect: {
            type: 'hybrid',
            bandwidthReduction: 0.6, // -40% conso
            dataBoost: 1.25 // +25% prod
        }
    }
};

// Modules de prestige (métas)
export const PRESTIGE_MODULES = {
    PREDICTIVE_FLOW: {
        name: 'Predictive Flow',
        description: 'Prévisualise la charge avant placement',
        cost: 5, // Fragments
        icon: '🧠'
    },

    QUANTUM_COMPRESSION: {
        name: 'Quantum Compression',
        description: '-25% pertes globales',
        cost: 10,
        lossReduction: 25,
        icon: '⚡'
    },

    FRACTAL_ROUTING: {
        name: 'Fractal Routing',
        description: 'Routers peuvent dupliquer les flux (10% chance)',
        cost: 15,
        icon: '🌀'
    },

    SELF_HEALING: {
        name: 'Self-Healing',
        description: 'Integrity remonte de +1%/s',
        cost: 20,
        healingRate: 1,
        icon: '🔄'
    }
};

// Upgrades permanents (achetés avec Fragments de Conscience)
export const PERMANENT_UPGRADES = {
    offlineRate: {
        name: 'Production Offline',
        description: 'Augmente les gains offline de +5% par niveau',
        baseDescription: 'Base: 25% des gains en ligne',
        icon: '💤',
        baseCost: 5,
        costIncrease: 1.5, // Coût x1.5 par niveau
        maxLevel: 10
    },
    coreProduction: {
        name: 'Optimisation Core',
        description: 'Augmente la production du Core de +1 Data/s par niveau',
        baseDescription: 'Base: 2 Data/s',
        icon: '⬢',
        baseCost: 3,
        costIncrease: 1.4,
        maxLevel: 15
    },
    processorProduction: {
        name: 'Optimisation Processor',
        description: 'Augmente la production des Processors de +1 Data/s par niveau',
        baseDescription: 'Base: 6 Data/s',
        icon: '◆',
        baseCost: 5,
        costIncrease: 1.5,
        maxLevel: 15
    },
    nodeDiscount: {
        name: 'Efficacité Réseau',
        description: 'Réduit le coût de tous les nœuds de 5% par niveau',
        baseDescription: 'Rend l\'expansion moins coûteuse',
        icon: '💰',
        baseCost: 10,
        costIncrease: 1.6,
        maxLevel: 10
    },
    inflationReduction: {
        name: 'Contrôle d\'Inflation',
        description: 'Réduit l\'inflation des coûts de 1% par niveau',
        baseDescription: 'Base: coûts augmentent de 10% par nœud placé',
        icon: '📉',
        baseCost: 8,
        costIncrease: 1.5,
        maxLevel: 10
    }
};

// Messages d'ambiance (affichés aléatoirement)
export const AMBIENT_MESSAGES = [
    "Le réseau s'étend...",
    "Conscience émergente détectée",
    "Flux optimal atteint",
    "Synchronisation en cours",
    "Données traitées avec succès",
    "Réseau stable",
    "Évolution imminente"
];
