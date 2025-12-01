export class OptionsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'OptionsScene' });
    }

    create() {
        this.add.text(400, 100, 'OPÇÕES', { fontSize: '40px', fill: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);

        // --- 1. CONFIGURAÇÃO DE COR (PERSONAGEM) ---
        this.add.text(400, 200, 'Cor do Astronauta:', { fontSize: '24px', fill: '#aaaaaa' }).setOrigin(0.5);
        
        // Ler a cor guardada ou usar branco por defeito
        let currentColor = localStorage.getItem('playerColor') || '0xffffff';
        
        // Mostrar o nome da cor e pintar o texto
        const colorText = this.add.text(400, 240, this.getColorName(currentColor), { 
            fontSize: '32px', 
            fill: currentColor.replace('0x', '#') // Converter Hex do Phaser (0x) para CSS (#)
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        // Lógica de troca de cor ao clicar
        colorText.on('pointerdown', () => {
            if (currentColor == '0xffffff') currentColor = '0xff0000';      // Branco -> Vermelho
            else if (currentColor == '0xff0000') currentColor = '0x0000ff'; // Vermelho -> Azul
            else if (currentColor == '0x0000ff') currentColor = '0x00ff00'; // Azul -> Verde
            else currentColor = '0xffffff';                                 // Verde -> Branco

            // Guardar permanentemente no browser
            localStorage.setItem('playerColor', currentColor);
            
            // Atualizar UI
            colorText.setText(this.getColorName(currentColor));
            colorText.setFill(currentColor.replace('0x', '#'));
        });

        // --- 2. CONFIGURAÇÃO DE DIFICULDADE ---
        this.add.text(400, 320, 'Dificuldade:', { fontSize: '24px', fill: '#aaaaaa' }).setOrigin(0.5);
        let currentDiff = localStorage.getItem('difficulty') || 'normal';

        const diffText = this.add.text(400, 360, currentDiff.toUpperCase(), { 
            fontSize: '32px', fill: '#ffff00' 
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        diffText.on('pointerdown', () => {
            // Ciclo: Normal -> Hard -> Easy
            if (currentDiff === 'normal') currentDiff = 'hard';
            else if (currentDiff === 'hard') currentDiff = 'easy';
            else currentDiff = 'normal';

            localStorage.setItem('difficulty', currentDiff);
            diffText.setText(currentDiff.toUpperCase());
        });

        // --- 3. CONFIGURAÇÃO DE SOM ---
        this.add.text(400, 440, 'Som:', { fontSize: '24px', fill: '#aaaaaa' }).setOrigin(0.5);
        let isMuted = localStorage.getItem('muded') === 'true';

        const soundText = this.add.text(400, 480, isMuted ? 'OFF' : 'ON', { 
            fontSize: '32px', fill: isMuted ? '#ff0000' : '#00ff00' 
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        soundText.on('pointerdown', () => {
            isMuted = !isMuted; // Inverter valor
            localStorage.setItem('muded', isMuted);
            soundText.setText(isMuted ? 'OFF' : 'ON');
            soundText.setFill(isMuted ? '#ff0000' : '#00ff00');
        });

        // Botão Voltar
        const backBtn = this.add.text(400, 550, 'Voltar ao Menu', { fontSize: '24px', fill: '#ffffff' })
            .setOrigin(0.5).setInteractive({ useHandCursor: true });

        backBtn.on('pointerdown', () => this.scene.start('MenuScene'));
    }

    // Função auxiliar para traduzir o código hexadecimal em nome legível
    getColorName(color) {
        if (color == '0xffffff') return 'BRANCO';
        if (color == '0xff0000') return 'VERMELHO';
        if (color == '0x0000ff') return 'AZUL';
        if (color == '0x00ff00') return 'VERDE';
        return 'NORMAL';
    }
}