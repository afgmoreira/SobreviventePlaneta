export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init() {
        // --- VARIÁVEIS DE JOGO ---
        this.score = 0;
        this.energy = 100;
        this.isGameOver = false;
        
        // --- NOVO: SISTEMA DE NÍVEIS E VIDAS ---
        this.level = 1;
        this.lives = 3; // Começa com 3 vidas

        // --- CARREGAR CONFIGURAÇÕES ---
        this.playerColor = parseInt(localStorage.getItem('playerColor')) || 0xffffff;
        this.difficulty = localStorage.getItem('difficulty') || 'normal';
        this.isMuted = localStorage.getItem('muded') === 'true';

        // Definir velocidade base baseada na dificuldade
        if (this.difficulty === 'easy') this.enemySpeedBase = 40;
        else if (this.difficulty === 'normal') this.enemySpeedBase = 80;
        else this.enemySpeedBase = 120; // Hard
    }

    create() {
        // 1. CENÁRIO
        this.add.rectangle(400, 300, 800, 600, 0x8B4513);
        this.add.grid(400, 300, 800, 600, 64, 64, 0x8B4513, 1, 0x5c2e0c, 1);

        // 2. JOGADOR
        this.player = this.physics.add.sprite(400, 300, 'astronaut');
        this.player.setCollideWorldBounds(true);
        this.player.setScale(0.7); 
        this.player.body.setSize(40, 40);
        this.player.body.setOffset(12, 12);
        
        // --- APLICAR COR ESCOLHIDA ---
        this.player.setTint(this.playerColor);

        // 3. ITENS
        this.scraps = this.physics.add.group();
        this.energyCells = this.physics.add.group();
        
        for (let i = 0; i < 5; i++) this.spawnScrap();
        for (let i = 0; i < 3; i++) this.spawnEnergy();

        // 4. INIMIGOS
        this.enemies = this.physics.add.group();
        this.spawnEnemy(); // Começa com 1, aumentamos com o nível

        // 5. COLISÕES
        this.physics.add.overlap(this.player, this.scraps, this.collectScrap, null, this);
        this.physics.add.overlap(this.player, this.energyCells, this.collectEnergy, null, this);
        this.physics.add.collider(this.player, this.enemies, this.hitEnemy, null, this);

        // 6. UI (INTERFACE)
        // Adicionei Nível e Vidas à interface
        this.scoreText = this.add.text(16, 16, 'Sucata: 0', { fontSize: '24px', fill: '#ffffff' });
        this.energyText = this.add.text(16, 48, 'Energia: 100%', { fontSize: '24px', fill: '#00ff00' });
        this.levelText = this.add.text(600, 16, 'Nível: 1', { fontSize: '24px', fill: '#ffff00' });
        this.livesText = this.add.text(600, 48, 'Vidas: 3', { fontSize: '24px', fill: '#ff0000' });

        // 7. SONS
        if (!this.isMuted) {
            try {
                this.pickupSound = this.sound.add('pickup');
                this.gameOverSound = this.sound.add('gameover');
            } catch (e) { console.log("Erro sons"); }
        }

        // 8. CONTROLO
        this.time.addEvent({ delay: 1000, callback: this.decreaseEnergy, callbackScope: this, loop: true });
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys('W,A,S,D');

        // Plugin Joystick (se existir)
        if (this.plugins.get('rexvirtualjoystickplugin')) {
             this.joyStick = this.plugins.get('rexvirtualjoystickplugin').add(this, {
                x: 100, y: 500, radius: 50,
                base: this.add.circle(0, 0, 50, 0x888888, 0.5),
                thumb: this.add.circle(0, 0, 25, 0xcccccc, 0.8),
                dir: '8dir', forceMin: 16
            });
        }
    }

    update() {
        if (this.isGameOver) return;

        // --- MOVIMENTO ---
        const speed = 200;
        const body = this.player.body;
        body.setVelocity(0);
        let moving = false;

        // Inputs combinados (Teclado + Joystick)
        let left = this.cursors.left.isDown || this.keys.A.isDown;
        let right = this.cursors.right.isDown || this.keys.D.isDown;
        let up = this.cursors.up.isDown || this.keys.W.isDown;
        let down = this.cursors.down.isDown || this.keys.S.isDown;

        if (this.joyStick) {
            left = left || this.joyStick.left;
            right = right || this.joyStick.right;
            up = up || this.joyStick.up;
            down = down || this.joyStick.down;
        }

        if (left) { body.setVelocityX(-speed); this.player.setFlipX(true); moving = true; }
        else if (right) { body.setVelocityX(speed); this.player.setFlipX(false); moving = true; }

        if (up) { body.setVelocityY(-speed); moving = true; }
        else if (down) { body.setVelocityY(speed); moving = true; }

        if (moving) this.player.anims.play('walk', true);
        else this.player.anims.play('idle', true);

        // --- IA INIMIGOS (COM VELOCIDADE BASEADA NO NÍVEL) ---
        // A velocidade aumenta 10% por cada nível
        const currentEnemySpeed = this.enemySpeedBase + (this.level * 10);
        
        this.enemies.getChildren().forEach(enemy => {
            this.physics.moveToObject(enemy, this.player, currentEnemySpeed);
            enemy.anims.play('walk', true);
            if (enemy.body.velocity.x < 0) enemy.setFlipX(true);
            else enemy.setFlipX(false);
        });

        // --- REPOSIÇÃO AUTOMÁTICA ---
        if (this.scraps.countActive(true) < 5) this.spawnScrap();
        if (this.energyCells.countActive(true) < 3) this.spawnEnergy();
    }

    // ... (spawnScrap e spawnEnergy IGUAIS) ...
    spawnScrap() {
        const scrap = this.scraps.create(Phaser.Math.Between(50, 750), Phaser.Math.Between(50, 550), 'scrap');
        scrap.setScale(0.03); scrap.refreshBody(); scrap.setCollideWorldBounds(true);
    }
    spawnEnergy() {
        const cell = this.energyCells.create(Phaser.Math.Between(50, 750), Phaser.Math.Between(50, 550), 'energy');
        cell.setScale(0.08); cell.refreshBody(); cell.setCollideWorldBounds(true);
    }

    spawnEnemy() {
        const enemy = this.enemies.create(0, 0, 'astronaut');
        // O inimigo nasce sempre longe do jogador (nos cantos)
        enemy.setX(Phaser.Math.Between(0, 1) ? 50 : 750);
        enemy.setY(Phaser.Math.Between(0, 1) ? 50 : 550);
        
        enemy.setScale(0.7);
        enemy.setTint(0xff0000); // Inimigo é vermelho
        enemy.body.setSize(40, 40);
        enemy.setBounce(1);
    }

    collectScrap(player, scrap) {
        scrap.body.reset(Phaser.Math.Between(50, 750), Phaser.Math.Between(50, 550));
        this.score += 10;
        this.scoreText.setText('Sucata: ' + this.score);
        if (this.pickupSound && !this.isMuted) this.pickupSound.play();

        // --- SUBIR DE NÍVEL ---
        // A cada 100 pontos, sobe de nível
        if (this.score % 100 === 0) {
            this.levelUp();
        }
    }

    collectEnergy(player, cell) {
        cell.body.reset(Phaser.Math.Between(50, 750), Phaser.Math.Between(50, 550));
        this.energy += 20;
        if (this.energy > 100) this.energy = 100;
        this.updateEnergyUI();
        if (this.pickupSound && !this.isMuted) this.pickupSound.play();
    }

    // --- NOVO: FUNÇÃO LEVEL UP ---
    levelUp() {
        this.level++;
        this.levelText.setText('Nível: ' + this.level);
        
        // Efeito visual
        this.cameras.main.flash(500);
        
        // Adiciona mais um inimigo a cada 2 níveis
        if (this.level % 2 === 0) {
            this.spawnEnemy();
        }
    }

    // --- NOVO: FUNÇÃO DE DANO E VIDAS ---
    hitEnemy(player, enemy) {
        // Empurra inimigo para longe para não tirar vidas todas de seguida
        enemy.x = Phaser.Math.Between(0, 1) ? 50 : 750;
        enemy.y = Phaser.Math.Between(0, 1) ? 50 : 550;
        
        this.loseLife();
    }

    decreaseEnergy() {
        if (this.isGameOver) return;
        this.energy -= 2; // Perde energia com o tempo
        this.updateEnergyUI();
        
        if (this.energy <= 0) {
            this.energy = 100; // Reset energia
            this.loseLife();   // Mas perde uma vida
        }
    }

    loseLife() {
        this.lives--;
        this.livesText.setText('Vidas: ' + this.lives);
        this.cameras.main.shake(200, 0.02); // Abana o ecrã

        if (this.lives <= 0) {
            this.gameOver();
        } else {
            // Efeito de "perdeu vida" (piscar)
            this.tweens.add({
                targets: this.player,
                alpha: 0,
                duration: 100,
                yoyo: true,
                repeat: 3
            });
        }
    }

    updateEnergyUI() {
        const displayEnergy = Math.floor(this.energy);
        this.energyText.setText('Energia: ' + displayEnergy + '%');
        if (this.energy <= 20) this.energyText.setColor('#ff0000');
        else this.energyText.setColor('#00ff00');
    }

    gameOver() {
        this.isGameOver = true;
        this.physics.pause();
        if (this.gameOverSound && !this.isMuted) this.gameOverSound.play();
        this.scene.start('GameOverScene', { score: this.score });
    }
}