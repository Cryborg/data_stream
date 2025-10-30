// Classe Tutorial - Gère le tutoriel interactif
// Guide le joueur pas à pas dans la découverte du jeu

export class Tutorial {
    constructor(game) {
        this.game = game;
        this.currentStep = 0;
        this.isActive = false;
        this.overlay = null;
        this.tooltip = null;
        this.arrow = null;

        // Définition des étapes du tutoriel
        this.steps = [
            {
                id: 'welcome',
                title: '🧠 Bienvenue dans Data Stream',
                message: `Tu incarnes une **IA naissante** qui étend son réseau de conscience.

Ton objectif : construire un réseau de nœuds pour générer de la **Data** et évoluer.

Le nœud cyan au centre est ton **Core** - il génère lentement de la Data.`,
                position: 'center',
                highlight: null,
                action: null,
                button: 'Commencer le tutoriel'
            },
            {
                id: 'resources',
                title: '📊 Les ressources',
                message: `En haut à droite, tu vois tes ressources :

**Data** : Ta ressource principale (tu en as ${this.game?.gameState?.data?.toFixed(0) || '10'})
**Bandwidth** : Capacité de ton réseau
**Integrity** : Stabilité (ne doit jamais tomber à 0%)
**Conscience** : Points de prestige (pour plus tard)`,
                position: 'top-right',
                highlight: '.resources',
                action: null,
                button: 'Compris !'
            },
            {
                id: 'select_processor',
                title: '◆ Place ton premier Processor',
                message: `Pour générer plus de Data, tu dois placer des **Processors**.

**Clique sur le bouton "◆ Processor"** dans le panneau de droite.

Il coûte 10 Data et génère 5 Data/s.`,
                position: 'right',
                highlight: '[data-node-type="PROCESSOR"]',
                action: 'selectNodeType',
                waitFor: 'nodeTypeSelected',
                button: null
            },
            {
                id: 'place_processor',
                title: '🖱️ Place le Processor',
                message: `Bien ! Maintenant **clique n'importe où sur le canvas** (zone noire avec étoiles) pour placer ton Processor.

Place-le près du Core (nœud cyan central) pour qu'ils se connectent automatiquement !`,
                position: 'left',
                highlight: '#gameCanvas',
                action: null,
                waitFor: 'nodePlaced',
                button: null
            },
            {
                id: 'observe_flow',
                title: '✨ Observe le flux automatique !',
                message: `Excellent ! Le Processor s'est **automatiquement connecté** au Core !

Tu vois la ligne cyan entre les deux nœuds ? C'est le **flux de données**.

Regarde bien : des petites particules voyagent le long de la connexion.

Observe aussi ta **Data** en haut à droite : elle augmente maintenant plus vite !`,
                position: 'top-right',
                highlight: '.resource.data',
                action: null,
                button: 'Cool ! 😎'
            },
            {
                id: 'add_more',
                title: '🎯 Construis ton réseau',
                message: `Tu peux maintenant :

• Placer d'autres **Processors** pour générer plus de Data
• Les **Processors servent de hubs** : les autres nœuds doivent se connecter à eux !
• Ajouter des **Routers** (◇) connectés aux Processors pour réduire leur Bandwidth

**Astuce** : Plus la distance entre 2 nœuds est grande, plus tu perds de Data !`,
                position: 'right',
                highlight: '.node-buttons',
                action: null,
                button: 'Compris !'
            },
            {
                id: 'integrity_warning',
                title: '⚠️ Attention à l\'Integrity !',
                message: `Chaque nœud consomme de la **Bandwidth**.

Si tu places trop de nœuds, ta Bandwidth sera saturée et ton **Integrity** va baisser.

Si l'Integrity tombe à 0% → **CRASH** → tu perds tout et recommences !

**Astuce** : Les Routers (◇) divisent par 2 la consommation des Processors auxquels ils sont connectés !`,
                position: 'top-right',
                highlight: '.resource.integrity',
                action: null,
                button: 'Noté ! 📝'
            },
            {
                id: 'prestige',
                title: '🌀 Le Prestige',
                message: `Quand tu auras accumulé beaucoup de Data (1000+), tu pourras faire un **Prestige** :

• Tu redémarres de zéro
• Mais tu gagnes des **Fragments de Conscience**
• Ces Fragments débloquent des **bonus permanents**

Le Prestige est la clé pour progresser sur le long terme !`,
                position: 'right',
                highlight: '.panel.prestige',
                action: null,
                button: 'D\'accord !'
            },
            {
                id: 'end',
                title: '🎉 Tutoriel terminé !',
                message: `Tu connais maintenant les bases de Data Stream !

**Rappel des commandes** :
• **Clic gauche** : Placer un nœud (connexions automatiques !)
• **Clic droit** : Annuler / Supprimer un nœud
• **Espace** : Pause
• **Ctrl+S** : Sauvegarder

**Astuce** : Chaque type de nœud a des effets sur les nœuds voisins. Expérimente !

Amuse-toi bien et que ton réseau prospère ! 🚀`,
                position: 'center',
                highlight: null,
                action: null,
                button: 'Let\'s go ! 🎮'
            }
        ];

        this.checkIfTutorialNeeded();
    }

    // Vérifie si le tutoriel a déjà été fait
    checkIfTutorialNeeded() {
        const tutorialDone = localStorage.getItem('datastream_tutorial_done');
        if (!tutorialDone) {
            this.start();
        }
    }

    // Démarre le tutoriel
    start() {
        this.isActive = true;
        this.currentStep = 0;
        this.createOverlay();
        this.showStep();
    }

    // Crée l'overlay
    createOverlay() {
        // Overlay sombre
        this.overlay = document.createElement('div');
        this.overlay.id = 'tutorial-overlay';
        this.overlay.className = 'tutorial-overlay';
        document.body.appendChild(this.overlay);

        // Tooltip
        this.tooltip = document.createElement('div');
        this.tooltip.id = 'tutorial-tooltip';
        this.tooltip.className = 'tutorial-tooltip';
        document.body.appendChild(this.tooltip);

        // Flèche
        this.arrow = document.createElement('div');
        this.arrow.id = 'tutorial-arrow';
        this.arrow.className = 'tutorial-arrow';
        document.body.appendChild(this.arrow);
    }

    // Affiche l'étape courante
    showStep() {
        const step = this.steps[this.currentStep];

        // Met à jour le tooltip
        this.tooltip.innerHTML = `
            <div class="tutorial-header">
                <h3>${step.title}</h3>
                <button class="tutorial-skip" onclick="window.game.tutorial.skip()">Passer le tutoriel</button>
            </div>
            <div class="tutorial-content">
                ${step.message.split('\n').map(line => `<p>${line}</p>`).join('')}
            </div>
            ${step.button ? `
                <div class="tutorial-footer">
                    <button class="tutorial-next" onclick="window.game.tutorial.nextStep()">${step.button}</button>
                </div>
            ` : `
                <div class="tutorial-footer">
                    <p class="tutorial-waiting">Effectue l'action demandée...</p>
                </div>
            `}
        `;

        // Positionne le tooltip
        this.positionTooltip(step.position);

        // Highlight l'élément
        if (step.highlight) {
            this.highlightElement(step.highlight);
        } else {
            this.removeHighlight();
        }

        // Configure l'attente d'action
        if (step.waitFor) {
            this.waitForAction(step.waitFor);
        }

        // Flèche indicative
        if (step.highlight && step.position !== 'center') {
            this.showArrow(step.highlight, step.position);
        } else {
            this.hideArrow();
        }
    }

    // Positionne le tooltip
    positionTooltip(position) {
        this.tooltip.className = 'tutorial-tooltip';
        this.tooltip.classList.add(`tutorial-${position}`);
    }

    // Met en évidence un élément
    highlightElement(selector) {
        this.removeHighlight();
        const element = document.querySelector(selector);
        if (element) {
            element.classList.add('tutorial-highlight');
            // Rend l'élément cliquable même avec l'overlay
            element.style.position = 'relative';
            element.style.zIndex = '10001';
        }
    }

    // Retire la mise en évidence
    removeHighlight() {
        document.querySelectorAll('.tutorial-highlight').forEach(el => {
            el.classList.remove('tutorial-highlight');
            if (el.style.zIndex === '10001') {
                el.style.zIndex = '';
            }
        });
    }

    // Affiche la flèche
    showArrow(targetSelector, direction) {
        const target = document.querySelector(targetSelector);
        if (!target) {
            this.arrow.style.display = 'none';
            return;
        }

        const rect = target.getBoundingClientRect();
        this.arrow.style.display = 'block';
        this.arrow.className = 'tutorial-arrow';

        // Positionne selon la direction
        switch(direction) {
            case 'right':
                this.arrow.classList.add('arrow-right');
                this.arrow.style.left = (rect.left - 60) + 'px';
                this.arrow.style.top = (rect.top + rect.height / 2 - 20) + 'px';
                break;
            case 'left':
                this.arrow.classList.add('arrow-left');
                this.arrow.style.left = (rect.right + 20) + 'px';
                this.arrow.style.top = (rect.top + rect.height / 2 - 20) + 'px';
                break;
            case 'top-right':
                this.arrow.classList.add('arrow-up');
                this.arrow.style.left = (rect.left + rect.width / 2 - 20) + 'px';
                this.arrow.style.top = (rect.bottom + 10) + 'px';
                break;
        }
    }

    // Cache la flèche
    hideArrow() {
        this.arrow.style.display = 'none';
    }

    // Attend une action du joueur
    waitForAction(actionType) {
        this.waitingFor = actionType;
    }

    // Notifie qu'une action a été effectuée
    notifyAction(actionType) {
        if (this.isActive && this.waitingFor === actionType) {
            this.waitingFor = null;
            setTimeout(() => this.nextStep(), 500);
        }
    }

    // Passe à l'étape suivante
    nextStep() {
        this.currentStep++;
        if (this.currentStep >= this.steps.length) {
            this.end();
        } else {
            this.showStep();
        }
    }

    // Termine le tutoriel
    end() {
        this.isActive = false;
        localStorage.setItem('datastream_tutorial_done', 'true');
        this.cleanup();
        this.game.showMessage('Tutoriel terminé ! Amuse-toi bien ! 🎮');
    }

    // Passe le tutoriel
    async skip() {
        const confirmed = await this.game.showConfirm(
            '⏭️ Passer le tutoriel ?',
            'Es-tu sûr de vouloir passer le tutoriel ?\n\nTu peux toujours le relancer en supprimant ta sauvegarde.',
            '❓'
        );

        if (confirmed) {
            this.isActive = false;
            localStorage.setItem('datastream_tutorial_done', 'true');
            this.cleanup();
            this.game.showMessage('Tutoriel passé. Tu peux le relancer en supprimant la sauvegarde.');
        }
    }

    // Nettoie les éléments du DOM
    cleanup() {
        this.removeHighlight();
        if (this.overlay) this.overlay.remove();
        if (this.tooltip) this.tooltip.remove();
        if (this.arrow) this.arrow.remove();
    }

    // Réinitialise le tutoriel (pour debug)
    reset() {
        localStorage.removeItem('datastream_tutorial_done');
        this.cleanup();
        this.start();
    }
}
