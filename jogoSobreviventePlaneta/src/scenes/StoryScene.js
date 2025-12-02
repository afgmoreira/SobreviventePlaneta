export class StoryScene extends Phaser.Scene {
    constructor() {
        super({ key: 'StoryScene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Fundo preto
        this.add.rectangle(0, 0, width, height, 0x000000).setOrigin(0);
        
        // Criar estrelas aleatórias para ambiente espacial
        for (let i = 0; i < 100; i++) {
            this.add.circle(Phaser.Math.Between(0, width), Phaser.Math.Between(0, height), Phaser.Math.Between(1, 3), 0xffffff);
        }

        // --- PREPARAÇÃO DA NAVE ---
        let ship;
        if (this.textures.exists('spaceship')) {
            ship = this.add.image(-150, height/2, 'spaceship'); // Começa fora do ecrã
            ship.setScale(4); // Aumentar tamanho (Pixel Art)
            ship.angle = 90;  // Rodar para a direita
        } else {
            // Fallback se a imagem falhar
            ship = this.add.rectangle(-100, height/2, 100, 50, 0x00ff00);
        }

        // Sistema de Partículas (Rasto do Motor)
        // Usa a textura 'flare' criada no Preloader
        const particles = this.add.particles(0, 0, 'flare', {
            speed: 100,
            scale: { start: 1, end: 0 },
            alpha: { start: 1, end: 0 },
            tint: 0xffaa00, // Laranja
            blendMode: 'ADD',
            follow: ship, // As partículas seguem a nave
            followOffset: { x: -60, y: 0 } 
        });

        // Texto do Log (Começa verde)
        const logText = this.add.text(50, 50, 'Diário de Bordo: Dia 452\nMissão de Rotina...', { 
            fontSize: '26px', fontFamily: 'Verdana', fill: '#00ff00', stroke: '#000000', strokeThickness: 4
        });

        // --- FASE 1: NAVE A ENTRAR ---
        this.tweens.add({
            targets: ship,
            x: width / 2, // Vai até ao meio
            duration: 4000,
            ease: 'Power1',
            onComplete: () => {
                this.phase2_Alert(ship, logText, particles);
            }
        });
    }

    // --- FASE 2: O ALERTA ---
    phase2_Alert(ship, logText, particles) {
        logText.setText('AVISO: CAMPO DE ASTEROIDES DETETADO!');
        logText.setColor('#ff0000'); // Muda texto para vermelho

        // Tween Yoyo para simular a nave a tremer
        this.tweens.add({
            targets: ship,
            y: ship.y + 10,
            yoyo: true,
            duration: 50,
            repeat: 30
        });

        // Flash vermelho no ecrã (alarme)
        this.cameras.main.flash(3000, 255, 0, 0, 0.3);

        this.time.delayedCall(3000, () => {
            this.phase3_Explosion(ship, logText, particles);
        });
    }

    // --- FASE 3: A EXPLOSÃO E SUCATA ---
    phase3_Explosion(ship, logText, particles) {
        logText.setText('ERRO CRÍTICO! EJEÇÃO DE CARGA!');
        this.cameras.main.shake(1000, 0.05); // Abanar câmara
        this.sound.play('gameover'); 

        particles.destroy(); // Parar motor

        // Explosão de Sucata: Justifica a mecânica do jogo!
        for (let i = 0; i < 50; i++) {
            const scrap = this.add.image(ship.x, ship.y, 'scrap');
            scrap.setScale(0.02);
            
            // Espalhar sucata aleatoriamente
            this.tweens.add({
                targets: scrap,
                x: Phaser.Math.Between(0, 800),
                y: Phaser.Math.Between(0, 600),
                angle: 720,
                duration: Phaser.Math.Between(1000, 2500),
                ease: 'Cubic.out'
            });
        }

        ship.setVisible(false); // Esconder nave
        const boom = this.add.circle(ship.x, ship.y, 10, 0xffaa00);
        this.tweens.add({ targets: boom, scale: 30, alpha: 0, duration: 800 });

        this.time.delayedCall(2000, () => {
            this.phase4_Landing();
        });
    }

    // --- FASE 4: A QUEDA DO ASTRONAUTA ---
    phase4_Landing() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const player = this.add.sprite(width/2, -100, 'astronaut');
        player.setScale(2);
        
        // Animação de queda e rotação
        this.tweens.add({
            targets: player,
            y: height/2 + 50,
            angle: 360 * 3,
            duration: 2000,
            ease: 'Bounce.out', // Bate no chão
            onComplete: () => {
                player.play('astro_idle');
                this.showFinalText();
            }
        });
    }

    // --- FASE 5: INSTRUÇÕES FINAIS ---
    showFinalText() {
        const width = this.cameras.main.width;
        
        this.add.rectangle(width/2, 400, 750, 300, 0x000000, 0.9).setStrokeStyle(4, 0xffffff);
        this.add.text(width/2, 290, 'Sobreviveste à queda...', { fontSize: '30px', fill: '#00ff00', fontStyle: 'bold', stroke:'#000', strokeThickness:4 }).setOrigin(0.5);
        this.add.text(width/2, 350, 'A tua nave foi destruída e a carga espalhou-se.\nOs Aliens locais estão a tentar roubar a Energia!', { fontSize: '20px', fill: '#ffffff', align: 'center', stroke:'#000', strokeThickness:3 }).setOrigin(0.5);
        this.add.text(width/2, 400, 'Apanhe as peças para aumentar o recorde e\napanhe as baterias para ganhar energia!', { fontSize: '20px', fill: '#ffffff', align: 'center', stroke:'#000', strokeThickness:3 }).setOrigin(0.5);

        const btn = this.add.text(width/2, 480, '[ COMEÇAR MISSÃO ]', { 
            fontSize: '32px', fill: '#000000', backgroundColor: '#00ff00', padding: { x: 15, y: 10 }, fontStyle: 'bold' 
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        // Iniciar o jogo real
        btn.on('pointerdown', () => this.scene.start('GameScene'));
        this.tweens.add({ targets: btn, scale: 1.1, duration: 800, yoyo: true, repeat: -1 });
    }
}