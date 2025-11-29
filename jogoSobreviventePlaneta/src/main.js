import { MenuScene } from './scenes/MenuScene.js';
import { PreloaderScene } from './scenes/PreloaderScene.js';
import { GameScene } from './scenes/GameScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';
import { OptionsScene } from './scenes/OptionsScene.js';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container', // ID do div HTML
    backgroundColor: '#000000',
    scale: {
        mode: Phaser.Scale.FIT, // Ajusta o jogo para caber na janela
        autoCenter: Phaser.Scale.CENTER_BOTH // Centra automaticamente
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }, // Top-down não tem gravidade a puxar para baixo
            debug: false
        }
    },
    scene: [PreloaderScene, MenuScene, OptionsScene, GameScene, GameOverScene]
};

new Phaser.Game(config);
            