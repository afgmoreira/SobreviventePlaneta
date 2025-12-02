export class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        // Título
        this.add.text(400, 150, 'SOBREVIVENTE DO PLANETA', { fontSize: '40px', fill: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
        this.add.text(400, 220, 'Gestão de Recursos', { fontSize: '20px', fill: '#00ff00' }).setOrigin(0.5);

        // Botão JOGAR
        const playButton = this.add.text(400, 300, 'JOGAR', { 
            fontSize: '32px', fill: '#ffffff', backgroundColor: '#333333', padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        playButton.on('pointerdown', () => this.scene.start('StoryScene'));

        // --- NOVO: BOTÃO INSTRUÇÕES ---
        const instructionsButton = this.add.text(400, 380, 'INSTRUÇÕES', { 
            fontSize: '24px', fill: '#aaaaaa'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        instructionsButton.on('pointerdown', () => this.scene.start('InstructionsScene'));

        // Botão OPÇÕES
        const optionsButton = this.add.text(400, 440, 'OPÇÕES / CONFIG', { 
            fontSize: '24px', fill: '#aaaaaa'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        optionsButton.on('pointerdown', () => this.scene.start('OptionsScene'));

        // Recorde
        const highScore = localStorage.getItem('survivor_highscore') || 0;
        this.add.text(400, 550, 'Recorde: ' + highScore, { fontSize: '18px', fill: '#ffff00' }).setOrigin(0.5);
    }
}