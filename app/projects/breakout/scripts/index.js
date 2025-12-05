import {Phaser as p} from '../../_shared/scripts/index.js';
import {BACKGROUND_COLOR, CANVAS_HEIGHT, CANVAS_WIDTH} from './constants.js';
import {GameScene} from './scenes/game.scene.js';
import {HeaderFooterScene} from './scenes/header-footer.scene.js';
import {MainScene} from './scenes/main.scene.js';
import {StartScene} from './scenes/start.scene.js';


new p.Game({
  backgroundColor: BACKGROUND_COLOR,
  width: CANVAS_WIDTH,
  height: CANVAS_HEIGHT,
  scale: {
    autoCenter: p.Scale.CENTER_BOTH,
    mode: p.Scale.FIT,
  },
  physics: {
    default: 'arcade',
  },
  scene: [
    MainScene,

    HeaderFooterScene,
    GameScene,
    StartScene,
  ],
});
