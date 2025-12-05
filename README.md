# Phaser Playground


## Description

A playground to experiment with game development using the [Phaser][phaser] game framework.


## Usage

The app is available at https://gk-phaser-playground.web.app/.

Each game is a [PWA][mdn-pwa], meaning it can be installed on the home screen of supporting devices for
easier access and native-like feeling.
The game apps use [ServiceWorkers][mdn-sw], so they can work offline (on supporting browsers).


## Contributing


For simplicity, the application (and sub-applications) are designed as static HTML/JS web apps (i.e. no framework, no build step).


### Local development

The following npm scripts are available and can help during local development:

- `start`: Start a local server to serve the app.
  Also, automatically reload the page whenever a file changes.<br />
  _(Useful during development.)_
- `scaffold-game`: Scaffold a new game under `app/projects/`.
  Expects 3 arguments: `gameName`, `splashScreenColor` and `themeColor`.


### Releasing/Deploying

The following npm scripts are available and can help with releasing/deploying a new version of the app:

- `deploy`: Deploy the app to Firebase.<br />
  _(You shouldn't need to run this manually. It is run as part of the `release` script.)_
- `release`: Cut a new version of the app and deploy it to Firebase.


## TODO

Things I want to (but won't necessarily) do:

- Finish the `sailor` project.
- Move commonly used assets to `app/projects/_shared/` (possibly without caching in `sw-utils`).


### Game ideas

- Build Tic-tac-toe.
- Build multi-player capabilities (using WebRTC?).
  - Multi-player `tic-tac-toe`.
  - Multi-player `sailor`.
- Build [Catan with dice](https://www.catan.com/board-games/catan-go/catan-dice-game#).
- Build [Farm with animals](https://www.kaissa-ioannina.com/shop/epitrapezia-paixnidia/epitrapezia-kaissa/oikogeneiaka/%CE%B7-%CF%86%CE%AC%CF%81%CE%BC%CE%B1-%CE%BC%CE%B5-%CF%84%CE%B1-%CE%B6%CF%8E%CE%B1/).
- Port [Bees game](https://stackblitz.com/edit/ngjs-bees-game?file=TODO.md) to Phaser.


[mdn-pwa]: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps
[mdn-sw]: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
[phaser]: https://phaser.io/
