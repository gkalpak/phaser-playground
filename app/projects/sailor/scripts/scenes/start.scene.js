import {Phaser as p, phaserUtils} from '../../../_shared/scripts/index.js';


export class StartScene extends p.Scene {
  constructor() {
    super('start');
  }

  create() {
    const startGame = async () => {
      await phaserUtils.countDown(this, 3);

      this.scene.stop('start');
      this.scene.run('game');
    };

    if (this.mode === StartScene.Mode.Auto) {
      return startGame();
    }

    const width = this.width = this.game.renderer.width;
    const height = this.height = this.game.renderer.height;

    // Define and configure objects.
    const {background, text} = this._getButtonConfig(this.mode);
    const startCallback = () => {
      startButton.destroy();
      startGame();
    };
    const startButton = phaserUtils.createButton(this, text, [background, '#ffff', 'black'], startCallback).
      setPosition(width / 2, height * 2 / 3);

    // Configure controls and event listeners.
    this.input.keyboard.on('keydown-ENTER', startCallback);
    this.input.keyboard.on('keydown-SPACE', startCallback);
  }

  init({mode}) {
    this.mode = mode;
  }

  _getButtonConfig(mode) {
    switch (mode) {
      case StartScene.Mode.Start:
        return {background: '#480f', text: 'Κάνε παιχνίδι'};
      case StartScene.Mode.Resume:
        return {background: '#47ef', text: 'Συνέχεια'};
      default:
        throw new Error(`No button configuration available for mode '${mode}'.`);
    }
  }
}
StartScene.Mode = {
  Start: 0,
  Resume: 1,
  Auto: 2,
};
