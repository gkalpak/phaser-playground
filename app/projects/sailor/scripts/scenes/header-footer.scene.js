import {Phaser as p, phaserUtils} from '../../../_shared/scripts/index.js';
import {SOURCE_CODE_URL, TOOLBAR_HEIGHT} from '../constants.js';
import {soundService} from '../services/sound.service.js';


export class HeaderFooterScene extends p.Scene {
  constructor() {
    super('header-footer');
  }

  create() {
    const {width, height} = this.game.renderer;

    const header = this.add.
      rectangle(0, 0, width, TOOLBAR_HEIGHT, 0xcccccc).
      setOrigin(0, 0);

    const footer = this.add.
      rectangle(0, height, width, TOOLBAR_HEIGHT, 0xcccccc).
      setOrigin(0, 1);

    const soundToggleCallback = isOn => isOn ? soundService.unmute() : soundService.mute();
    const soundToggleButton = phaserUtils.createToggleButton(this, 'speaker', !soundService.isMuted, soundToggleCallback).
      setPosition(width / 2, TOOLBAR_HEIGHT / 2).
      updateHitArea(undefined, TOOLBAR_HEIGHT);

    const sourceCodeButtonLink = phaserUtils.createLink(this, 'Πηγαίος κώδικας', SOURCE_CODE_URL).
      setOrigin(0, 0.5).
      setPosition(10, height - (TOOLBAR_HEIGHT / 2)).
      updateHitArea(undefined, TOOLBAR_HEIGHT);
  }

  preload() {
    this.load.spritesheet('speaker', 'assets/images/speaker.sprite.svg', {frameWidth: 20});
  }
}
