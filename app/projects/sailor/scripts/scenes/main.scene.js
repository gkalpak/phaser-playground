import {Phaser as p} from '../../../_shared/scripts/index.js';
import {GameScene} from './game.scene.js';


export class MainScene extends p.Scene {
  constructor() {
    super('main');
  }

  create() {
    const params = new URLSearchParams(window.location.search);
    const isScreenshotMode = params.get('mode') === 'screenshot';
    const gameMode = isScreenshotMode ? GameScene.Mode.Screenshot : GameScene.Mode.Normal;

    this.scene.stop();

    this.scene.launch('header-footer');
    this.scene.launch('game', {mode: gameMode});
  }
}
