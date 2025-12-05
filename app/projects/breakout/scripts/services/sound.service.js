import {preferencesService} from './preferences.service.js';


class SoundService {
  get isMuted() { return !preferencesService.soundOn; }

  load(scene, key, url) {
    return scene.load.audio(key, url);
  }

  mute() {
    preferencesService.soundOn = false;
  }

  play(scene, key) {
    return this.isMuted ? false : scene.sound.play(key);
  }

  unmute() {
    preferencesService.soundOn = true;
  }
}

export const soundService = new SoundService();
