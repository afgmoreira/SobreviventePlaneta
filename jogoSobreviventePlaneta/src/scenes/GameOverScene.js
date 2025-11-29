export class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    // Recebe os dados passados pelo scene.start()
    init(data) {
        this.finalScore = data.score || 0;
    }

    create() {
        // --- 1. LÓGICA DE HIGHSCORE (O QUE FALTAVA) ---
        
        // Ir buscar o recorde guardado no browser (ou 0 se não houver)
        const storedScore = localStorage.getItem('survivor_highscore');
        let highScore = storedScore ? parseInt(storedScore) : 0;
        
        let messageText = 'Sucata Recolhida: ' + this.finalScore;
        let textColor = '#ffffff';

        // Verificar se batemos o recorde
        if (this.finalScore > highScore) {
            // SUCESSO! Guardar o novo recorde no browser
            localStorage.setItem('survivor_highscore', this.finalScore);
            highScore = this.finalScore; // Atualiza a variável local
            
            messageText = 'NOVO RECORDE!\n' + this.finalScore;
            textColor = '#ffff00'; // Amarelo para festejar
            
            // Efeito visual de celebração (flash)
            this.cameras.main.flash(1000, 255, 255, 0);
        } else {
            // Se não bateu recorde, mostra o atual
            messageText += '\nRecorde Atual: ' + highScore;
        }

        // --- 2. INTERFACE (UI) ---

        // Título
        this.add.text(400, 150, 'GAME OVER', { 
            fontSize: '64px', 
            fill: '#ff0000',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Mostrar Pontuação (Com a nova lógica)
        this.add.text(400, 300, messageText, { 
            fontSize: '32px', 
            fill: textColor,
            align: 'center'
        }).setOrigin(0.5);
        
        // Botão Reiniciar
        const restartBtn = this.add.text(400, 450, 'Jogar Novamente', { 
            fontSize: '24px', 
            fill: '#aaaaaa',
            backgroundColor: '#222222',
            padding: { x: 20, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });
        
        restartBtn.on('pointerover', () => restartBtn.setStyle({ fill: '#ffffff' }));
        restartBtn.on('pointerout', () => restartBtn.setStyle({ fill: '#aaaaaa' }));
        restartBtn.on('pointerdown', () => this.scene.start('GameScene'));
        
        // Botão Menu
        const menuBtn = this.add.text(400, 520, 'Voltar ao Menu', { 
            fontSize: '18px', 
            fill: '#aaaaaa' 
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });
        
        menuBtn.on('pointerdown', () => this.scene.start('MenuScene'));
    }
}