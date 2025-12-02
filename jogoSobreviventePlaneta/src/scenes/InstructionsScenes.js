export class InstructionsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'InstructionsScene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Fundo preto
        this.add.rectangle(0, 0, width, height, 0x000000).setOrigin(0);
        
        // Título
        this.add.text(width/2, 50, 'COMO JOGAR', { 
            fontSize: '40px', 
            fill: '#ffffff', 
            fontStyle: 'bold' 
        }).setOrigin(0.5);

        // Estilo do texto
        const headerStyle = { fontSize: '24px', fill: '#00ff00', fontStyle: 'bold' };
        const textStyle = { fontSize: '18px', fill: '#cccccc', align: 'center', lineSpacing: 5 };

        // --- SECÇÃO 1: OBJETIVO ---
        this.add.text(width/2, 120, 'MISSÃO', headerStyle).setOrigin(0.5);
        this.add.text(width/2, 160, 
            'A tua nave despenhou-se.\nRecolhe o máximo de SUCATA possível para ganhar pontos.\nNão deixes a tua ENERGIA chegar a zero!', 
            textStyle
        ).setOrigin(0.5);

        // --- SECÇÃO 2: ITENS ---
        // Desenhar os itens para explicar o que fazem (se já tiveres as imagens carregadas)
        this.add.image(width/2 - 100, 240, 'scrap').setScale(0.05); // Ícone Sucata
        this.add.text(width/2 + 20, 240, '= +10 Pontos', { fontSize: '20px', fill: '#fff' }).setOrigin(0, 0.5);

        this.add.image(width/2 - 100, 290, 'energy').setScale(0.1); // Ícone Energia
        this.add.text(width/2 + 20, 290, '= +20 Energia', { fontSize: '20px', fill: '#fff' }).setOrigin(0, 0.5);

        // --- SECÇÃO 3: CONTROLOS ---
        this.add.text(width/2, 360, 'CONTROLOS', headerStyle).setOrigin(0.5);
        this.add.text(width/2, 400, 
            'PC: Usa W, A, S, D ou Setas para mover.\nMobile: Usa o Joystick Virtual no ecrã.', 
            textStyle
        ).setOrigin(0.5);

        // --- SECÇÃO 4: PERIGOS ---
        this.add.text(width/2, 460, 'PERIGOS', { fontSize: '24px', fill: '#ff0000', fontStyle: 'bold' }).setOrigin(0.5);
        this.add.text(width/2, 490, 
            'Foge dos Aliens! Eles tiram-te vida.\nA energia desce com o tempo, sê rápido!', 
            textStyle
        ).setOrigin(0.5);

        // --- BOTÃO VOLTAR ---
        const backBtn = this.add.text(width/2, 560, '[ VOLTAR AO MENU ]', { 
            fontSize: '24px', 
            fill: '#000000', 
            backgroundColor: '#ffffff',
            padding: { x: 10, y: 5 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

        // Efeitos do botão
        backBtn.on('pointerover', () => backBtn.setStyle({ fill: '#ffff00', backgroundColor: '#333' }));
        backBtn.on('pointerout', () => backBtn.setStyle({ fill: '#000000', backgroundColor: '#fff' }));
        
        backBtn.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });
    }
}