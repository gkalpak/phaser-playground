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
    const ball = this.ball = this.physics.add.
      sprite(-1, -1, 'ball').
      setBounce(1).
      setCollideWorldBounds(true);
    const bricks = this.bricks = this._createBricks(2 * ball.displayWidth, TOOLBAR_HEIGHT, this.mode);
    const floor = this.add.
      rectangle(0, height, width, TOOLBAR_HEIGHT).
      setOrigin(0, 1).
      setVisible(false);
    const paddle = this.paddle = this.physics.add.
      image(-1, -1, 'brick').
      setScale(2, 0.5).
      setCollideWorldBounds(true).
      setImmovable(true);

    const textStyle = {fill: '#000f', fontFamily: '"roboto mono", monospace', fontSize: '20px'};
    const livesText = this.livesText = this.add.
      text(width - 10, 5, '', textStyle).
      setOrigin(1, 0);
    const scoreText = this.scoreText = this.add.
      text(10, 5, '', textStyle).
      setOrigin(0, 0);

    const pauseGameCallback = () => this.scene.isActive() && this._waitToStart(StartScene.Mode.Resume);
    const pauseGameButtonLink = phaserUtils.createLinkButton(this, 'Παύση', pauseGameCallback).
      setOrigin(1, 0.5).
      setPosition(width - 10, height - (TOOLBAR_HEIGHT / 2)).
      updateHitArea(undefined, TOOLBAR_HEIGHT);

    // Initialize the game state.
    this._resetBallAndPaddle(this.mode);
    this._updateLives(3);
    this._updateScore(0);

    // Create animations.
    this.anims.create({
      key: 'ball:wobble',
      frames: this.anims.generateFrameNumbers('ball', {frames: [0, 1, 0, 2, 0, 1, 0]}),
    });

    // Configure physics.
    this.physics.add.existing(floor, true);
    this.physics.add.collider(ball, bricks, (_, brick) => this._onHitBrick(brick));
    this.physics.add.collider(ball, paddle, (b, p) => this._onHitPaddle(b, p));
    this.physics.add.overlap(ball, floor, () => this._onBallDropped());

    // Configure controls and event listeners.
    // (Some listeners are registered lazily to work around the fact that
    // `scene.pause()` takes effect asynchronously.)
    let registerLazyListeners = () => {
      this.input.on('pointermove', evt => paddle.x = evt.x);

      window.addEventListener('deviceorientation', evt => {
        if (!this.scene.isActive() || this.input.activePointer.isDown) return;

        const isLandscape = window.screen.orientation.type.startsWith('landscape');
        const rawValue = isLandscape ? -evt.beta : evt.gamma;
        const maxAngle = 25;
        const widthPercentage = (p.Math.Clamp(rawValue, -maxAngle, maxAngle) + maxAngle) / (2 * maxAngle);

        paddle.x = width * widthPercentage;
      });

      registerLazyListeners = () => undefined;
    };

    this.cursors = this.input.keyboard.createCursorKeys();
    this.input.keyboard.on('keydown-P', pauseGameCallback);

    this.events.on('pause', () => pauseGameButtonLink.setVisible(false));
    this.events.on('resume', () => {
      registerLazyListeners();
      paddle.x = this.input.activePointer.x;
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
    soundService.load(this, 'bounce', 'assets/audio/bounce.mp3');
    soundService.load(this, 'you-lose', 'assets/audio/you-lose.mp3');
    soundService.load(this, 'you-win', 'assets/audio/you-win.mp3');

    this.load.image('brick', 'assets/images/brick.svg');

    this.load.spritesheet('ball', 'assets/images/ball.sprite.svg', {frameWidth: 20});
  }

  update() {
    // Update paddle position.
    if (this.cursors.left.isDown) {
      this.paddle.setX(this.paddle.x - 5);
    } else if (this.cursors.right.isDown) {
      this.paddle.setX(this.paddle.x + 5);
    }
  }

  _createBricks(offsetX, offsetY) {
    const rowCount = 7
    const colCount = 10;
    const spacing = 5;

    const [brickWidth, brickHeight] = phaserUtils.getItemSize(this.physics, 'brick');

    const scaledBrickWidth = (this.width - (2 * offsetX) - ((colCount - 1) * spacing)) / colCount;
    const scaledBrickHeight = ((this.height / 2) - offsetY - ((rowCount - 1) * spacing)) / rowCount;

    const bricks = this.physics.add.staticGroup();

    for (let r = 0; r < rowCount; ++r) {
      const y = offsetY + (r * (scaledBrickHeight + spacing)) + (scaledBrickHeight / 2);

      for (let c = 0; c < colCount; ++c) {
        const x = offsetX + (c * (scaledBrickWidth + spacing)) + (scaledBrickWidth / 2);

        bricks.
          create(x, y, 'brick').
          setDisplaySize(scaledBrickWidth, scaledBrickHeight).
          refreshBody();
      }
    }

    return bricks;
  }

  _incrementHitBonus() {
    this.hitBonus += 10;
  }

  _onBallDropped() {
    soundService.play(this, 'you-lose');
    this._updateLives(this.lives - 1);

    if (this.lives > 0) {
      this._resetBallAndPaddle();
      this._waitToStart(StartScene.Mode.Auto);
    } else {
      window.navigator.vibrate([200, 50, 400]);
      this._onGameEnd(false);
    }
  }

  async _onGameEnd(won) {
    this.scene.pause();

    const message = won ? 'Συγχαρητήρια!<br />Κέρδισες.' : 'Έχασες!<br />Προσπάθησε ξανά.';
    await uiUtils.alertDialog(
        `<div style="font-style: italic; font-weight: bold; text-align: center;">${message}</div>`,
        'Νέο παιχνίδι');

    this.scene.restart();
  }

  _onHitBrick(brick) {
    brick.disableBody(true);

    this.tweens.add({
      targets: brick,
      scale: 0,
      duration: 200,
      onComplete: () => {
        brick.destroy();

        if (this.bricks.countActive() === 0) {
          soundService.play(this, 'you-win');
          this._onGameEnd(true);
        }
      },
    });

    this._incrementHitBonus();
    this._updateScore(this.score + this.hitBonus);
    window.navigator.vibrate(30);
  }

  _onHitPaddle(ball, paddle) {
    soundService.play(this, 'bounce');

    ball.anims.play('ball:wobble');
    ball.setVelocityX(this.width * (ball.x - paddle.x) / (paddle.displayWidth / 2));

    this._resetHitBonus();
  }

  _waitToStart(mode) {
    this.scene.pause();
    this.scene.launch('start', {mode});
  }

  _resetBallAndPaddle() {
    const {ball, height, paddle, width} = this;
    const offsetY = 10;

    const paddleX = width / 2;
    const paddleY = height - TOOLBAR_HEIGHT - (paddle.displayHeight / 2) - offsetY;
    const ballX = paddleX;
    const ballY = paddleY - (paddle.displayHeight / 2) - (ball.displayHeight / 2) - offsetY;

    ball.setPosition(ballX, ballY).setVelocity(150, -150);
    paddle.setPosition(paddleX, paddleY);

    this._resetHitBonus();
  }

  _resetHitBonus() {
    this.hitBonus = 0;
  }

  _takeScreenshot() {
    const {width, height} = this;

    // Hide some bricks.
    const bricksToHide = [
                                          39,
                      44,             48, 49,
      50,         53, 54, 55,         58, 59,
      60,     62, 63, 64, 65, 66, 67, 68, 69,
    ];

    this.bricks.getChildren().
      filter((brick, i) => bricksToHide.includes(i)).
      forEach(brick => brick.setVisible(false).refreshBody());

    // Position and "freeze" the ball.
    this.ball.
      setPosition(width * 0.55, height * 0.65).
      setVelocity(0, 0);

    console.log('Right-click on the game and choose "Save image as...".');
  }

  _updateLives(newLives) {
    this.lives = newLives;
    this.livesText.setText(`Ζωές: ${this.lives}`);
  }

  _updateScore(newScore) {
    this.score = newScore;
    this.scoreText.setText(`Βαθμολογία: ${this.score}`);
  }
}
GameScene.Mode = {
  Normal: 0,
  Screenshot: 1,
};
