import {Phaser as p, phaserUtils, uiUtils} from '../../../_shared/scripts/index.js';
import {TOOLBAR_HEIGHT} from '../constants.js';
import {soundService} from '../services/sound.service.js';
import {StartScene} from './start.scene.js';


export class GameScene extends p.Scene {
  constructor() {
    super('game');
  }

  create() {
    const width = this.width = this.game.renderer.width;
    const height = this.height = this.game.renderer.height;

    // Define and configure objects.
    const floor = this.add.
      rectangle(0, height, width, TOOLBAR_HEIGHT).
      setOrigin(0, 1).
      setVisible(false);

    const pauseGameCallback = () => this.scene.isActive() && this._waitToStart(StartScene.Mode.Resume);
    const pauseGameButtonLink = phaserUtils.createLinkButton(this, 'Παύση', pauseGameCallback).
      setOrigin(1, 0.5).
      setPosition(width - 10, height - (TOOLBAR_HEIGHT / 2)).
      updateHitArea(undefined, TOOLBAR_HEIGHT);

    // Initialize the game state.
    // ...

    // Create animations.
    // this.anims.create({
    //   key: 'some-key:animated',
    //   frames: this.anims.generateFrameNumbers('some-object', {frames: [<SOME>, <FRAME>, <NUMBERS>]}),
    // });

    // Configure physics.
    this.physics.add.existing(floor, true);
    // this.physics.add.collider(someObject, somethingElse, (a, b) => this._onCollision(a, b));
    // this.physics.add.overlap(someObject, floor, () => this._onSomeObjectDropped());

    // Configure controls and event listeners.
    // (Some listeners are registered lazily to work around the fact that
    // `scene.pause()` takes effect asynchronously.)
    let registerLazyListeners = () => {
      // this.input.on('some-event', evt => { /* Do something. */ });

      // window.addEventListener('some-event', evt => { /* Do something. */ });

      registerLazyListeners = () => undefined;
    };

    // this.cursors = this.input.keyboard.createCursorKeys();
    this.input.keyboard.on('keydown-P', pauseGameCallback);

    this.events.on('pause', () => pauseGameButtonLink.setVisible(false));
    this.events.on('resume', () => {
      registerLazyListeners();
      pauseGameButtonLink.setVisible(true);
    });

    // Go!
    switch (this.mode) {
      case GameScene.Mode.Screenshot:
        return this._takeScreenshot();
      default:
        // Wait for the game to start.
        return this._waitToStart(StartScene.Mode.Start);
    }
  }

  init({mode}) {
    this.mode = mode;
  }

  preload() {
    soundService.load(this, 'you-win', 'assets/audio/you-win.mp3');

    // this.load.image('some-image', 'assets/images/some-image.ext');

    // this.load.spritesheet('some-spritesheet', 'assets/images/some.sprite.ext', {frameWidth: <SOME_WIDTH>});
  }

  update() {
    // ...
  }

  async _onGameEnd(won) {
    this.scene.pause();

    const message = won ? 'Συγχαρητήρια!<br />Κέρδισες.' : 'Έχασες!<br />Προσπάθησε ξανά.';
    await uiUtils.alertDialog(
        `<div style="font-style: italic; font-weight: bold; text-align: center;">${message}</div>`,
        'Νέο παιχνίδι');

    this.scene.restart();
  }

  _waitToStart(mode) {
    this.scene.pause();
    this.scene.launch('start', {mode});
  }

  _takeScreenshot() {
    // Prepare the scene for screenshot.
    // ...

    console.log('Right-click on the game and choose "Save image as...".');
  }
}
GameScene.Mode = {
  Normal: 0,
  Screenshot: 1,
};
