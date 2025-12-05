// README: Manually increment the version when caches should not be re-used.
const SW_VERSION = '0.0.1';
const SW_UTILS_VERSION = '0.0.5';

self.importScripts(`../_shared/scripts/sw-utils@${SW_UTILS_VERSION}/index.js`);


self.createAndRegisterServiceWorker(`${SW_VERSION}-u${SW_UTILS_VERSION}`, {
  cacheFirst: {
    files: [
      'assets/audio/you-win.mp3',
      'assets/images/sailor-screenshot-maskable.png',
      'assets/images/favicon.ico',
      'assets/images/speaker.sprite.svg',
    ],
  },
  networkFirst: {
    files: [
      'scripts/constants.js',
      'scripts/scenes/game.scene.js',
      'scripts/scenes/header-footer.scene.js',
      'scripts/scenes/main.scene.js',
      'scripts/services/preferences.service.js',
      'scripts/services/sound.service.js',
    ],
  },
});
