/**
 * GameScene.js
 * Esta é a cena principal onde toda a ação do jogo acontece.
 * Controla o jogador, inimigos, mapa, colisões e lógica de pontuação.
 */
export class GameScene extends Phaser.Scene {
    
    // O construtor define a chave única para esta cena
    constructor() { 
        super({ key: 'GameScene' }); 
    }

    /**
     * INIT: Executado antes da cena ser criada.
     * Serve para inicializar variáveis e carregar configurações guardadas.
     */
    init() {
        // Variáveis de estado do jogo
        this.score = 0;       // Pontuação atual (Sucata)
        this.energy = 100;    // Energia (decresce com o tempo)
        this.isGameOver = false; // Flag para impedir ações após morrer
        
        // Sistema de progressão
        this.level = 1;       // Nível de dificuldade atual
        this.lives = 3;       // Vidas do jogador

        // Carregar configurações do LocalStorage (definidas no Menu de Opções)
        // Se não existir nada guardado, usa valores por defeito (||)
        this.playerColor = parseInt(localStorage.getItem('playerColor')) || 0xffffff;
        this.difficulty = localStorage.getItem('difficulty') || 'normal';
        this.isMuted = localStorage.getItem('muded') === 'true';

        // Ajustar a velocidade base dos inimigos conforme a dificuldade escolhida
        if (this.difficulty === 'easy') this.enemySpeedBase = 40;       // Fácil: Lentos
        else if (this.difficulty === 'normal') this.enemySpeedBase = 80; // Normal
        else this.enemySpeedBase = 120;                                 // Difícil: Rápidos
    }

    /**
     * CREATE: Onde todos os objetos do jogo são criados e colocados no ecrã.
     * Executado apenas uma vez quando a cena arranca.
     */
    create() {
        // ----------------------------------------------------------------
        // 1. CRIAÇÃO DO MAPA (Usando Tilemap do Tiled)
        // ----------------------------------------------------------------
        const map = this.make.tilemap({ key: 'map' }); // Cria o mapa a partir do JSON carregado
        
        // Verificação de segurança: Se o mapa estiver vazio, pára para não crashar
        if (!map.tilesets.length) { 
            console.error("ERRO: Mapa não carregou corretamente."); 
            return;
        }

        // Adiciona a imagem (tileset) ao mapa. 
        // 'tiles' (1º) = nome no Tiled. 'tiles' (2º) = chave da imagem no Phaser.
        const tileset = map.addTilesetImage('tiles', 'tiles'); 

        // Cria as camadas visuais (Layers) baseadas nos nomes dados no Tiled
        // Usamos || createBlankLayer como segurança caso o nome esteja errado no JSON
        const groundLayer = map.createLayer('Chao', tileset, 0, 0) || map.createBlankLayer('Chao', tileset);
        const wallLayer = map.createLayer('Paredes', tileset, 0, 0) || map.createBlankLayer('Paredes', tileset);
        
        // Define colisão para a camada 'Paredes'
        // setCollisionByExclusion([-1]) ativa colisão em todos os blocos que não sejam vazios (-1)
        if (wallLayer) wallLayer.setCollisionByExclusion([-1]);

        // Define os limites do mundo de física para coincidirem com o tamanho total do mapa
        this.physics.world.bounds.width = map.widthInPixels;
        this.physics.world.bounds.height = map.heightInPixels;

        // ----------------------------------------------------------------
        // 2. JOGADOR (ASTRONAUTA)
        // ----------------------------------------------------------------
        // Cria o sprite com física na posição (200, 200)
        this.player = this.physics.add.sprite(200, 200, 'astronaut');
        
        this.player.setCollideWorldBounds(true); // Impede o jogador de sair dos limites do mapa
        this.player.setScale(0.7);               // Ajusta o tamanho (Pixel art pode ser grande)
        
        // Ajuste fino da Caixa de Colisão (Hitbox) para ser mais justa
        this.player.body.setSize(40, 40); 
        this.player.body.setOffset(12, 12);      // Centra a hitbox no sprite
        
        this.player.setTint(this.playerColor);   // Pinta o jogador com a cor escolhida nas opções

        // Adiciona colisão entre o jogador e as paredes do mapa
        if (wallLayer) this.physics.add.collider(this.player, wallLayer);

        // ----------------------------------------------------------------
        // 3. CÂMARA (SISTEMA DE FOLLOW)
        // ----------------------------------------------------------------
        // Define os limites da câmara para não mostrar a área preta fora do mapa
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        
        // Faz a câmara seguir o jogador suavemente
        this.cameras.main.startFollow(this.player);
        
        // Evita linhas estranhas entre tiles (Tile Bleeding) ao arredondar posições
        this.cameras.main.setRoundPixels(true); 

        // ----------------------------------------------------------------
        // 4. ITENS (RECURSOS)
        // ----------------------------------------------------------------
        // Cria grupos de física para gerir múltiplos itens de forma eficiente
        this.scraps = this.physics.add.group();
        this.energyCells = this.physics.add.group();
        
        // Gera 5 sucatas e 3 baterias iniciais em posições aleatórias
        for (let i = 0; i < 5; i++) this.spawnScrap();
        for (let i = 0; i < 3; i++) this.spawnEnergy();

        // ----------------------------------------------------------------
        // 5. INIMIGOS (ALIENS)
        // ----------------------------------------------------------------
        this.enemies = this.physics.add.group();
        this.spawnEnemy(); // Cria o primeiro inimigo (aumentam com o nível)

        // Os inimigos também colidem com as paredes
        if (wallLayer) this.physics.add.collider(this.enemies, wallLayer);

        // ----------------------------------------------------------------
        // 6. GESTÃO DE COLISÕES (INTERAÇÕES)
        // ----------------------------------------------------------------
        // overlap: quando um objeto passa por cima do outro (sem bater) -> Recolha de itens
        this.physics.add.overlap(this.player, this.scraps, this.collectScrap, null, this);
        this.physics.add.overlap(this.player, this.energyCells, this.collectEnergy, null, this);
        
        // collider: colisão física ou de dano -> Jogador vs Inimigo
        this.physics.add.collider(this.player, this.enemies, this.hitEnemy, null, this);

        // ----------------------------------------------------------------
        // 7. INTERFACE DE UTILIZADOR (UI)
        // ----------------------------------------------------------------
        // setScrollFactor(0) fixa o texto no ecrã (HUD), impedindo que mexa com a câmara
        // setDepth(100) garante que o texto fica sempre por cima de tudo (Z-Index)
        this.scoreText = this.add.text(16, 16, 'Sucata: 0', { fontSize: '24px', fill: '#ffffff' }).setScrollFactor(0).setDepth(100);
        this.energyText = this.add.text(16, 48, 'Energia: 100%', { fontSize: '24px', fill: '#00ff00' }).setScrollFactor(0).setDepth(100);
        this.levelText = this.add.text(600, 16, 'Nível: 1', { fontSize: '24px', fill: '#ffff00' }).setScrollFactor(0).setDepth(100);
        this.livesText = this.add.text(600, 48, 'Vidas: 3', { fontSize: '24px', fill: '#ff0000' }).setScrollFactor(0).setDepth(100);

        // ----------------------------------------------------------------
        // 8. SONS E CONTROLOS
        // ----------------------------------------------------------------
        if (!this.isMuted) { 
            try { 
                this.pickupSound = this.sound.add('pickup'); 
                this.gameOverSound = this.sound.add('gameover'); 
            } catch(e) { console.warn("Erro ao carregar sons."); }
        }
        
        // Timer Loop: Chama a função decreaseEnergy a cada 1000ms (1 segundo)
        this.time.addEvent({ delay: 1000, callback: this.decreaseEnergy, callbackScope: this, loop: true });
        
        // Inicializa controlos de teclado (WASD e Setas)
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys('W,A,S,D');

        // Inicializa Joystick Virtual (se o plugin estiver carregado)
        if (this.plugins.get('rexvirtualjoystickplugin')) {
             this.joyStick = this.plugins.get('rexvirtualjoystickplugin').add(this, {
                x: 100, y: 500, radius: 50,
                base: this.add.circle(0, 0, 50, 0x888888, 0.5).setScrollFactor(0).setDepth(100),
                thumb: this.add.circle(0, 0, 25, 0xcccccc, 0.8).setScrollFactor(0).setDepth(100),
                dir: '8dir', forceMin: 16
            });
        }
    }

    /**
     * UPDATE: Executado 60 vezes por segundo (Game Loop).
     * Controla movimento, animações e lógica contínua.
     */
    update() {
        if (this.isGameOver) return; // Se acabou o jogo, pára tudo

        // --- MOVIMENTO DO JOGADOR ---
        const speed = 200;
        const body = this.player.body;
        body.setVelocity(0); // Reset da velocidade a cada frame

        // Ler inputs (Teclado OU Joystick)
        let left = this.cursors.left.isDown || this.keys.A.isDown;
        let right = this.cursors.right.isDown || this.keys.D.isDown;
        let up = this.cursors.up.isDown || this.keys.W.isDown;
        let down = this.cursors.down.isDown || this.keys.S.isDown;

        // Adiciona input do Joystick se estiver a ser usado
        if (this.joyStick) {
            left = left || this.joyStick.left; 
            right = right || this.joyStick.right; 
            up = up || this.joyStick.up; 
            down = down || this.joyStick.down;
        }

        // Aplicar velocidade e animação correta
        if (left) {
            body.setVelocityX(-speed);
            this.player.anims.play('astro_side', true);
            this.player.setFlipX(true); // Vira o sprite horizontalmente para a esquerda
        } else if (right) {
            body.setVelocityX(speed);
            this.player.anims.play('astro_side', true);
            this.player.setFlipX(false); // Vira normal (direita)
        } else if (up) {
            body.setVelocityY(-speed);
            this.player.anims.play('astro_up', true);
        } else if (down) {
            body.setVelocityY(speed);
            this.player.anims.play('astro_down', true);
        } else {
            this.player.anims.play('astro_idle', true); // Se não mexer, toca idle
        }

        // --- INTELIGÊNCIA ARTIFICIAL (INIMIGOS) ---
        // A velocidade aumenta com o nível do jogo
        const currentEnemySpeed = this.enemySpeedBase + (this.level * 10);
        
        this.enemies.getChildren().forEach(enemy => {
            // Perseguição simples: move o inimigo em direção ao jogador
            this.physics.moveToObject(enemy, this.player, currentEnemySpeed);
            
            // Sistema de Animação do Inimigo (4 Direções)
            // Compara a velocidade X e Y para saber para onde ele "olha"
            const vx = enemy.body.velocity.x;
            const vy = enemy.body.velocity.y;

            if (Math.abs(vx) > Math.abs(vy)) {
                // Movimento Horizontal predominante
                if (vx > 0) enemy.anims.play('alien_right', true);
                else enemy.anims.play('alien_left', true);
            } else {
                // Movimento Vertical predominante
                if (vy > 0) enemy.anims.play('alien_down', true);
                else enemy.anims.play('alien_up', true);
            }
        });

        // --- SISTEMA DE REPOSIÇÃO (FAILSAFE) ---
        // Garante que o jogo nunca fica vazio. Se houver poucos itens, cria novos.
        if (this.scraps.countActive(true) < 5) this.spawnScrap();
        if (this.energyCells.countActive(true) < 3) this.spawnEnergy();
    }

    /**
     * Funções de Spawn (Criação de Objetos)
     * Utilizam as dimensões do mapa para posicionar itens aleatoriamente
     */
    spawnScrap() {
        const w = (this.physics.world.bounds.width||800)-100; 
        const h = (this.physics.world.bounds.height||600)-100; 
        const scrap = this.scraps.create(Phaser.Math.Between(100, w), Phaser.Math.Between(100, h), 'scrap');
        scrap.setScale(0.03); 
        scrap.refreshBody(); // Atualiza a hitbox após mudar a escala
        scrap.setCollideWorldBounds(true);
    }

    spawnEnergy() {
        const w = (this.physics.world.bounds.width||800)-100;
        const h = (this.physics.world.bounds.height||600)-100;
        const cell = this.energyCells.create(Phaser.Math.Between(100, w), Phaser.Math.Between(100, h), 'energy');
        cell.setScale(0.08); 
        cell.refreshBody(); 
        cell.setCollideWorldBounds(true);
    }
    
    spawnEnemy() { 
        const w = (this.physics.world.bounds.width||800)-100; 
        const h = (this.physics.world.bounds.height||600)-100; 
        const enemy = this.enemies.create(0, 0, 'alien'); 
        enemy.setX(Phaser.Math.Between(100, w)); 
        enemy.setY(Phaser.Math.Between(100, h));
        enemy.setScale(0.7); 
        enemy.body.setSize(40, 40); 
        enemy.setBounce(1); // Faz ricochete nas paredes
        enemy.setCollideWorldBounds(true);
    }

    /**
     * Funções de Recolha e Lógica de Jogo
     */
    collectScrap(player, scrap) {
        // Técnica de "Object Pooling": Em vez de destruir, movemos para outro sítio
        // Isto é mais eficiente para a memória do que criar/destruir constantemente
        const w = (this.physics.world.bounds.width||800)-100;
        const h = (this.physics.world.bounds.height||600)-100;
        scrap.body.reset(Phaser.Math.Between(100, w), Phaser.Math.Between(100, h));
        
        // Atualizar Score
        this.score += 10;
        this.scoreText.setText('Sucata: ' + this.score);
        
        // Tocar som
        if (this.pickupSound && !this.isMuted) this.pickupSound.play();
        
        // Verificar se sobe de nível (a cada 100 pontos)
        if (this.score % 100 === 0) this.levelUp();
    }

    collectEnergy(player, cell) {
        const w = (this.physics.world.bounds.width||800)-100;
        const h = (this.physics.world.bounds.height||600)-100;
        cell.body.reset(Phaser.Math.Between(100, w), Phaser.Math.Between(100, h));
        
        // Recuperar energia (não passa de 100)
        this.energy += 20;
        if (this.energy > 100) this.energy = 100;
        this.updateEnergyUI();
        
        if (this.pickupSound && !this.isMuted) this.pickupSound.play();
    }

    // Aumenta dificuldade
    levelUp() {
        this.level++;
        this.levelText.setText('Nível: ' + this.level);
        this.cameras.main.flash(500); // Feedback visual (flash branco)
        if (this.level % 2 === 0) this.spawnEnemy(); // Adiciona um inimigo a cada 2 níveis
    }

    // Quando o jogador toca num inimigo
    hitEnemy(player, enemy) {
        // Afastar inimigo para não tirar todas as vidas num segundo
        const w = (this.physics.world.bounds.width||800)-100;
        const h = (this.physics.world.bounds.height||600)-100;
        enemy.body.reset(Phaser.Math.Between(100, w), Phaser.Math.Between(100, h));
        
        this.loseLife();
    }

    // Função chamada a cada segundo pelo Timer
    decreaseEnergy() {
        if (this.isGameOver) return;
        this.energy -= 2;
        this.updateEnergyUI();
        
        // Se a energia acabar, perde uma vida e a energia reseta
        if (this.energy <= 0) {
            this.energy = 100;
            this.loseLife();
        }
    }

    loseLife() {
        this.lives--;
        this.livesText.setText('Vidas: ' + this.lives);
        this.cameras.main.shake(200, 0.02); // Feedback: abanar ecrã
        
        if (this.lives <= 0) {
            this.gameOver();
        } else {
            // Efeito de invulnerabilidade temporária (piscar)
            this.tweens.add({ targets: this.player, alpha: 0, duration: 100, yoyo: true, repeat: 3 });
        }
    }

    updateEnergyUI() {
        const displayEnergy = Math.floor(this.energy);
        this.energyText.setText('Energia: ' + displayEnergy + '%');
        // Muda a cor para vermelho se estiver crítico (<20%)
        if (this.energy <= 20) this.energyText.setColor('#ff0000');
        else this.energyText.setColor('#00ff00');
    }

    gameOver() {
        this.isGameOver = true;
        this.physics.pause(); // Pára toda a física do jogo
        if (this.gameOverSound && !this.isMuted) this.gameOverSound.play();
        
        // Transita para a cena de Game Over enviando a pontuação final
        this.scene.start('GameOverScene', { score: this.score });
    }
}