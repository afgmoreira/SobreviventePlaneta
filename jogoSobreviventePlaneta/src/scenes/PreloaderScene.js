export class PreloaderScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloaderScene' });
    }

    preload() {
        // --- 1. CARREGAR ASSETS REAIS ---
        // O carregamento real acontece aqui (é muito rápido)
        
        this.load.plugin('rexvirtualjoystickplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexvirtualjoystickplugin.min.js', true);

        // Assets Imagens
        this.load.spritesheet('astronaut', 'assets/images/astronaut.png', { frameWidth: 64, frameHeight: 64 });
        this.load.image('scrap', 'assets/images/scrap.png');
        this.load.image('energy', 'assets/images/energy.png');

        // Assets Sons
        this.load.audio('pickup', 'assets/audio/pickup.wav');
        this.load.audio('gameover', 'assets/audio/gameover.wav');
    }

    create() {
        // --- 2. CRIAR ANIMAÇÕES ---
        // (Fazemos isto logo, fica pronto em memória)
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('astronaut', { start: 0, end: 3 }),
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'idle',
            frames: [{ key: 'astronaut', frame: 0 }],
            frameRate: 20
        });

        // --- 3. BARRA DE CARREGAMENTO FALSA (VISUAL) ---
        // Vamos simular um carregamento para o jogador ver a barra a encher
        
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Fundo da barra (Caixa escura)
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

        // A Barra Branca (que vai encher)
        const progressBar = this.add.graphics();

        // Texto "A carregar..."
        const loadingText = this.add.text(width / 2, height / 2 - 60, 'A carregar...', {
            font: '20px monospace',
            fill: '#ffffff'
        }).setOrigin(0.5);



        // --- 4. ANIMAÇÃO (TWEEN) ---
        // Vamos usar um "Tween" para animar um valor de 0 a 1 durante 2 segundos
        let fakeLoading = { value: 0 };

        this.tweens.add({
            targets: fakeLoading,
            value: 1,
            duration: 2500, // <--- TEMPO DE ESPERA (2.5 segundos) - Aumenta se quiseres mais lento
            ease: 'Linear',
            onUpdate: () => {
                // A cada frame, redesenha a barra com o novo valor
                progressBar.clear();
                progressBar.fillStyle(0xffffff, 1);
                progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * fakeLoading.value, 30);
                
            },
            onComplete: () => {
                // Quando acabar o tempo, destrói tudo e inicia o jogo
                progressBar.destroy();
                progressBox.destroy();
                loadingText.destroy();

                
                this.scene.start('MenuScene');
            }
        });
    }
}