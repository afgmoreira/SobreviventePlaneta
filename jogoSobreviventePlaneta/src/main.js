// Importar as Cenas (Scenes) dos outros ficheiros
import { MenuScene } from './scenes/MenuScene.js';
import { PreloaderScene } from './scenes/PreloaderScene.js';
import { GameScene } from './scenes/GameScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';
import { OptionsScene } from './scenes/OptionsScene.js';
import { StoryScene } from './scenes/StoryScene.js';
import { InstructionsScene } from './scenes/InstructionsScenes.js';

// Configuração principal do Phaser
const config = {
    type: Phaser.AUTO, // O Phaser escolhe WebGL ou Canvas automaticamente
    width: 800,       // Largura do jogo em pixeis
    height: 600,      // Altura do jogo em pixeis
    parent: 'game-container', // ID do elemento HTML onde o jogo vai aparecer
    backgroundColor: '#000000', // Fundo preto
    
    // Configurações visuais para Pixel Art
    pixelArt: true,   // Garante que as imagens não ficam desfocadas ao aumentar
    roundPixels: true, // Força o desenho em pixeis inteiros (evita linhas estranhas nos tiles)
    
    // Configuração de Escala (Responsividade)
    scale: {
        mode: Phaser.Scale.FIT, // Ajusta o jogo para caber na janela mantendo a proporção
        autoCenter: Phaser.Scale.CENTER_BOTH // Centra o jogo no ecrã horizontal e verticalmente
    },
    
    // Motor de Física (Arcade Physics)
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }, // Gravidade 0 porque é um jogo visto de cima (Top-Down)
            debug: false       // Coloca a 'true' para veres as caixas de colisão (hitboxes)
        }
    },
    
    // Lista de Cenas pela ordem de execução
    // A primeira cena (PreloaderScene) arranca automaticamente
    scene: [PreloaderScene, MenuScene, OptionsScene, InstructionsScene, StoryScene, GameScene, GameOverScene]
};

// Iniciar o jogo com as configurações acima
new Phaser.Game(config);