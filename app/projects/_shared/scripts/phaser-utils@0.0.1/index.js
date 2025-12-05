import {uiUtils} from '../index.js';


export const countDown = (scene, seconds) => {
  const {width, height} = scene.game.renderer;
  const style = {
    fill: '#0008',
    fontFamily: '"roboto mono", monospace',
    fontSize: `${width / 5}px`,
    fontWeight: 'bold',
  };
  let counter = seconds;

  const countDownText = scene.add.
    text(width / 2, height / 2, counter, style).
    setOrigin(0.5, 0.5);

  return Object.assign(new Promise(resolve => {
    scene.time.addEvent({
      delay: 1000,
      repeat: seconds - 1,
      callback: () => {
        countDownText.setText(--counter);

        if (counter <= 0) {
          countDownText.destroy();
          resolve();
        }
      },
    });
  }), {countDownText});
};

export const createButton = (scene, text, [bgColor, fgColor = '#ffff', hoverColor = fgColor], callback) => {
  const button = scene.add.
    text(0, 0, text, {
      backgroundColor: bgColor,
      fill: fgColor,
      fontFamily: 'roboto, sans-serif',
      fontSize: '24px',
      padding: {x: 20, y: 10},
    }).
    setOrigin(0.5, 0.5);

  if (hoverColor !== fgColor) {
    button.
      on('pointerout', () => button.setColor(fgColor)).
      on('pointerover', () => button.setColor(hoverColor));
  }

  return withClickHandler(button, callback);
};

export const createLink = (scene, text, url) => {
  return createLinkButton(scene, text, () => uiUtils.openWindow(url));
};

export const createLinkButton = (scene, text, callback) => {
  const style = {fill: '#47ef', fontFamily: 'roboto, sans-serif', fontSize: '12px'};
  const linkButton = scene.add.
    text(0, 0, text, style).
    setOrigin(0.5, 0.5);

  return withHitAreaSetter(withClickHandler(linkButton, callback), scene);
};

export const createToggleButton = (scene, spriteKey, initiallyOn, callback) => {
  const toggleState = () => updateState(!toggleButton.getData('on'));
  const updateState = isOn => {
    toggleButton.setData('on', isOn);
    toggleButton.setFrame(isOn ? 1 : 0);

    callback(isOn);
  };

  const toggleButton = scene.physics.add.staticSprite(0, 0, spriteKey);
  updateState(initiallyOn);

  return Object.assign(withHitAreaSetter(withClickHandler(toggleButton, toggleState), scene), {toggle: toggleState});
};

export const getItemSize = (physics, key) => {
  const tempGroup = physics.add.staticGroup();
  const {width, height} = tempGroup.create(-1, -1, key);

  tempGroup.destroy(true);

  return [width, height];
};

// Helpers
function withClickHandler(gameObj, callback) {
  return gameObj.
    setInteractive({useHandCursor: true}).
    on('pointerdown', () => gameObj.setData('active', true)).
    on('pointerout', () => gameObj.setData('active', false)).
    on('pointerup', () => gameObj.getData('active') && callback());
}

function withHitAreaSetter(gameObj, scene) {
  gameObj.updateHitArea = (newWidth = gameObj.width, newHeight = gameObj.height) => {
    const hitArea = gameObj.input.hitArea;
    const {x: oldX, y: oldY, width: oldWidth, height: oldHeight} = hitArea;
    const newX = hitArea.x - ((newWidth - oldWidth) / 2);
    const newY = hitArea.y - ((newHeight - oldHeight) / 2);

    hitArea.setPosition(newX, newY);
    hitArea.setSize(newWidth, newHeight);

    return gameObj;
  };

  return gameObj;
}
