export class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    // Recebe os dados (score) da GameScene
    init(data) {
        this.finalScore = data.score || 0;
    }

    create() {
        // --- SISTEMA DE HIGHSCORE (PERSISTÊNCIA DE DADOS) ---
        // Tenta ler do localStorage. Se não existir, retorna 0.
        const storedScore = localStorage.getItem('survivor_highscore');
        let highScore = storedScore ? parseInt(storedScore) : 0;
        
        let messageText = 'Sucata Recolhida: ' + this.finalScore;
        let textColor = '#ffffff';

        // Verifica se batemos o recorde
        if (this.finalScore > highScore) {
            // Gravar o novo recorde no browser do jogador
            localStorage.setItem('survivor_highscore', this.finalScore);
            
            messageText = 'NOVO RECORDE!\n' + this.finalScore;
            textColor = '#ffff00'; // Amarelo (Destaque)
            this.cameras.main.flash(1000, 255, 255, 0); // Efeito de festa
        } else {
            messageText += '\nRecorde Atual: ' + highScore;
        }

        // --- INTERFACE (UI) ---
        this.add.text(400, 150, 'GAME OVER', { fontSize: '64px', fill: '#ff0000', fontStyle: 'bold' }).setOrigin(0.5);
        
        this.add.text(400, 300, messageText, { fontSize: '32px', fill: textColor, align: 'center' }).setOrigin(0.5);
        
        // Botão Reiniciar
        const restartBtn = this.add.text(400, 450, 'Jogar Novamente', { 
            fontSize: '24px', fill: '#aaaaaa', backgroundColor: '#222222', padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        // Feedback visual no botão (Hover)
        restartBtn.on('pointerover', () => restartBtn.setStyle({ fill: '#ffffff' }));
        restartBtn.on('pointerout', () => restartBtn.setStyle({ fill: '#aaaaaa' }));
        restartBtn.on('pointerdown', () => this.scene.start('GameScene'));
        
        // Botão Menu
        const menuBtn = this.add.text(400, 520, 'Voltar ao Menu', { fontSize: '18px', fill: '#aaaaaa' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        menuBtn.on('pointerdown', () => this.scene.start('MenuScene'));
    }
}