export class PreloaderScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloaderScene' });
    }

    preload() {
        // --- 1. CARREGAMENTO DE PLUGINS ---
        // Carrega o plugin do Joystick Virtual para controlos mobile
        this.load.plugin('rexvirtualjoystickplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexvirtualjoystickplugin.min.js', true);

        // --- 2. CARREGAMENTO DE IMAGENS ---
        // Spritesheets (Imagens com animação). Definimos o tamanho de cada frame (64x64)
        this.load.spritesheet('astronaut', 'assets/images/astronaut.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('alien', 'assets/images/alien.png', { frameWidth: 64, frameHeight: 64 });
        
        // Imagens estáticas
        this.load.image('scrap', 'assets/images/scrap.png');
        this.load.image('energy', 'assets/images/energy.png');
        this.load.image('spaceship', 'assets/images/spaceship.png'); 
        
        // --- 3. CARREGAMENTO DO MAPA ---
        // 'tiles': A imagem com os blocos de construção
        this.load.image('tiles', 'assets/images/tiles.png'); 
        // 'map': O ficheiro de dados criado no Tiled (formato JSON)
        this.load.tilemapTiledJSON('map', 'assets/maps/map.json');

        // --- 4. CARREGAMENTO DE SONS ---
        this.load.audio('pickup', 'assets/audio/pickup.wav');
        this.load.audio('gameover', 'assets/audio/gameover.wav');

        // --- 5. BARRA DE PROGRESSO VISUAL ---
        // Criação de gráficos para mostrar o loading
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const progressBox = this.add.graphics();
        const progressBar = this.add.graphics();
        
        // Desenhar a caixa cinzenta de fundo
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width/2 - 160, height/2 - 25, 320, 50);
        
        const loadingText = this.add.text(width/2, height/2 - 50, 'A carregar...', { font: '20px monospace', fill: '#ffffff' }).setOrigin(0.5);

        // --- SIMULAÇÃO DE LOADING (Cinemática) ---
        // Usamos um objeto 'fakeProgress' e um Tween para animar a barra durante 3 segundos
        // Isto dá um aspeto mais profissional, mesmo que o carregamento real seja instantâneo
        let fakeProgress = { value: 0 };
        this.tweens.add({
            targets: fakeProgress,
            value: 1,       // Vai de 0 a 1 (100%)
            duration: 3000, // Demora 3000ms (3 segundos)
            ease: 'Linear',
            onUpdate: () => {
                // Atualiza o desenho da barra branca a cada frame
                progressBar.clear();
                progressBar.fillStyle(0xffffff, 1);
                progressBar.fillRect(width/2 - 150, height/2 - 15, 300 * fakeProgress.value, 30);
                loadingText.setText(`A carregar sistemas... ${Math.floor(fakeProgress.value * 100)}%`);
            },
            onComplete: () => {
                // Quando terminar, avança para o Menu
                this.scene.start('MenuScene');
            }
        });
    }

    create() {
        // --- 6. CRIAÇÃO DE ANIMAÇÕES GLOBAIS ---
        // Criamos as animações aqui para estarem disponíveis em todas as cenas (GameScene, StoryScene)
        
        // Textura para partículas (Fogo do motor) - Cria um círculo branco em memória
        const graphics = this.make.graphics({x: 0, y: 0, add: false});
        graphics.fillStyle(0xffffff, 1);
        graphics.fillCircle(4, 4, 4);
        graphics.generateTexture('flare', 8, 8);

        // Animações do Astronauta (Baixo, Cima, Lado, Parado)
        this.anims.create({ key: 'astro_down', frames: this.anims.generateFrameNumbers('astronaut', { start: 0, end: 3 }), frameRate: 8, repeat: -1 });
        this.anims.create({ key: 'astro_up', frames: this.anims.generateFrameNumbers('astronaut', { start: 4, end: 7 }), frameRate: 8, repeat: -1 });
        this.anims.create({ key: 'astro_side', frames: this.anims.generateFrameNumbers('astronaut', { start: 8, end: 11 }), frameRate: 8, repeat: -1 });
        this.anims.create({ key: 'astro_idle', frames: [{ key: 'astronaut', frame: 0 }], frameRate: 20 });

        // Animações do Alien (Inimigo)
        this.anims.create({ key: 'alien_down', frames: this.anims.generateFrameNumbers('alien', { start: 0, end: 3 }), frameRate: 6, repeat: -1 });
        this.anims.create({ key: 'alien_left', frames: this.anims.generateFrameNumbers('alien', { start: 4, end: 7 }), frameRate: 6, repeat: -1 });
        this.anims.create({ key: 'alien_up', frames: this.anims.generateFrameNumbers('alien', { start: 8, end: 11 }), frameRate: 6, repeat: -1 });
        this.anims.create({ key: 'alien_right', frames: this.anims.generateFrameNumbers('alien', { start: 12, end: 15 }), frameRate: 6, repeat: -1 });
    }
}