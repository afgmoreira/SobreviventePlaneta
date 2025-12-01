export class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        // --- ELEMENTOS VISUAIS ---
        // Títulos
        this.add.text(400, 150, 'SOBREVIVENTE DO PLANETA', { fontSize: '40px', fill: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
        this.add.text(400, 220, 'Gestão de Recursos', { fontSize: '20px', fill: '#00ff00' }).setOrigin(0.5);

        // --- BOTÃO JOGAR ---
        const playButton = this.add.text(400, 320, 'JOGAR', { 
            fontSize: '32px', fill: '#ffffff', backgroundColor: '#333333', padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        // Ao clicar, inicia a cena da História (StoryScene) para dar contexto
        playButton.on('pointerdown', () => this.scene.start('StoryScene'));

        // --- BOTÃO OPÇÕES ---
        const optionsButton = this.add.text(400, 400, 'OPÇÕES / CONFIG', { 
            fontSize: '24px', fill: '#aaaaaa'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        // Navega para o menu de configurações
        optionsButton.on('pointerdown', () => this.scene.start('OptionsScene'));

        // --- INSTRUÇÕES E RECORDE ---
        this.add.text(400, 500, 'WASD para mover', { fontSize: '16px', fill: '#aaaaaa' }).setOrigin(0.5);
        
        // Ler o recorde guardado no localStorage do browser
        // Se não existir, assume 0
        const highScore = localStorage.getItem('survivor_highscore') || 0;
        this.add.text(400, 550, 'Recorde: ' + highScore, { fontSize: '18px', fill: '#ffff00' }).setOrigin(0.5);
    }
}