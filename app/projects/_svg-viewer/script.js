(() => {
  console.clear();

  // Variables
  const w = window;
  const d = w.document;
  const vm = {
    imagePath: null,
    scalePercentage: 100,
    watchInterval: 2,
  };
  const im = {
    image: w.fullImage,
    imageContents: null,
    imageNextCheckTimeoutId: null,
    isSpritesheet: false,
    spriteImage: w.spritePreviewImage,
    thumbnailCount: 0,
    thumbnailActiveIdx: 0,
    animationRafId: null,
  };

  const debouncedFetchAndWatchImage = debounce(fetchAndWatchImage, 1000);

  // Run
  _main();

  // Exports
  w.activateTab = activateTab;
  w.onImageLoad = onImageLoad;
  w.onImagePathChange = onImagePathChange;
  w.onScalePercentageChange = onScalePercentageChange;
  w.onWatchIntervalChange = onWatchIntervalChange;
  w.startSpriteAnimation = startSpriteAnimation;
  w.stopSpriteAnimation = stopSpriteAnimation;

  // Helpers
  function _main() {
    const params = new URLSearchParams(w.location.search);

    w.imagePathInput.value = params.has('path') ? params.get('path') : vm.imagePath;
    w.scalePercentageInput.value = vm.scalePercentage;
    w.watchIntervalInput.value = vm.watchInterval;

    onWatchIntervalChange(w.watchIntervalInput.value);
    onScalePercentageChange(w.scalePercentageInput.value);
    onImagePathChange(w.imagePathInput.value);

    w.addEventListener('resize', debounce(updateImageSizeOutputs, 1000));
    w.spriteThumbnailContainer.addEventListener('keydown', onKeydown);
  }

  function activateElement(elem) {
    [...elem.parentNode.children].forEach(x => x.classList.remove('active'));
    elem.classList.add('active');
  }

  function activateTab(tabLinkElem, tabContentElem) {
    activateElement(tabLinkElem);
    activateElement(tabContentElem);

    tabContentElem.querySelector('[autofocus]')?.focus();
  }

  function activateThumbnail(idx, thumbnailElem = w.spriteThumbnailContainer.children[idx]) {
    im.thumbnailActiveIdx = idx;

    updateSpriteImage();
    activateElement(thumbnailElem);
  }

  function debounce(fn, delay) {
    let tId = null;

    return (...args) => {
      clearTimeout(tId);
      tId = setTimeout(fn, delay, ...args);
    };
  }

  function enableSpritesheetFeatures(newIsSpritesheet) {
    im.isSpritesheet = newIsSpritesheet;
    d.body.classList.toggle('with-spritesheet-features', im.isSpritesheet);
  }

  function fetchAndWatchImage() {
    clearInterval(im.imageNextCheckTimeoutId);
    im.imageNextCheckTimeoutId = null;

    if (vm.imagePath === null) {
      return;
    }

    const url = vm.imagePath;
    w.fetch(url, {cache: 'no-cache'}).
      then(res => res.text().
        then(text => {
          if (vm.imagePath !== url) {
            return;
          }

          if (!res.ok) {
            throw new Error(`Request failed. (URL: ${url} | Status: ${res.status} ${res.statusText || 'Unknown'})`);
          }

          if (vm.watchInterval) {
            im.imageNextCheckTimeoutId = setTimeout(fetchAndWatchImage, 1000 * vm.watchInterval);
          }

          if (im.imageContents !== text) {
            onImageContentsChange(text);
          }
        })).
      catch(err => onError(err));
  }

  function generateSpriteThumbnails() {
    stopSpriteAnimation();

    w.spriteThumbnailContainer.innerHTML = '';

    for (let i = 0, ii = im.thumbnailCount; i < ii; ++i) {
      const idx = i;
      w.spriteThumbnailContainer.appendChild(Object.assign(d.createElement('img'), {
        className: `svg-image sprite-thumbnail${(idx !== im.thumbnailActiveIdx) ? '' : ' active'}`,
        onclick: evt => activateThumbnail(idx, evt.target),
        src: im.image.src,
        style: `object-position: calc(-${idx} * var(--sprite-thumbnail-size));`,
      }));
    }
  }

  function onError(err) {
    console.error(err);
    w.alert(`ERROR: ${err.message || err}`);
  }

  function onImageContentsChange(newImageContents) {
    im.imageContents = newImageContents;
    d.querySelectorAll('.svg-image').forEach(img => {
      img.src = null;
      img.src = vm.imagePath;
    });
  }

  function onImageLoad() {
    updateImageSizeOutputs();
    updateSpritesheetFeatures();
  }

  function onImagePathChange(newImagePath) {
    newImagePath = newImagePath || null;

    if (vm.imagePath === newImagePath) {
      return;
    }

    vm.imagePath = newImagePath;

    enableSpritesheetFeatures(!!vm.imagePath && vm.imagePath.endsWith('.sprite.svg'));
    onImageContentsChange(null);
    fetchAndWatchImage();
  }

  function onKeydown(evt) {
    switch (evt.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        evt.preventDefault();
        activateThumbnail((im.thumbnailActiveIdx + 1) % im.thumbnailCount);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        evt.preventDefault();
        activateThumbnail((im.thumbnailActiveIdx - 1 + im.thumbnailCount) % im.thumbnailCount);
        break;
      default:
        break;
    }
  }

  function onScalePercentageChange(newScalePercentage) {
    vm.scalePercentage = newScalePercentage;

    w.scalePercentageOutput.textContent = `${vm.scalePercentage}%`.padStart(4);
    d.body.style.setProperty('--image-scale', vm.scalePercentage / 100);

    updateImageSizeOutputs();
  }

  function onWatchIntervalChange(newWatchInterval) {
    vm.watchInterval = newWatchInterval;
    debouncedFetchAndWatchImage();
  }

  function setElementVisible(elem, isVisible) {
    elem.classList.toggle('hidden', !isVisible);
  }

  function setSpriteImage(activeIdx) {
    w.spritePreviewImage.style.objectPosition = `calc(-${activeIdx} * var(--sprite-preview-size))`;
  }

  function startSpriteAnimation(duration, loop) {
    w.animDurationInput.disabled = true;
    w.animLoopCheckbox.disabled = true;
    setElementVisible(w.animStartButton, false);
    setElementVisible(w.animStopButton, true);

    const interFrameDelay = 1000 * duration / im.thumbnailCount;
    const startTime = w.performance.now();
    let lastFrameTime = startTime - interFrameDelay;
    let activeIdx = -1;

    animate(startTime);

    // Helpers
    function animate(now) {
      const elapsedTime = now - lastFrameTime;

      if (elapsedTime >= interFrameDelay) {
        const elapsedFrameCount = Math.floor(elapsedTime / interFrameDelay);
        lastFrameTime = now - (elapsedTime % interFrameDelay);
        activeIdx += elapsedFrameCount;

        if (activeIdx >= im.thumbnailCount) {
          if (!loop) {
            stopSpriteAnimation();
            return;
          }

          activeIdx %= im.thumbnailCount;
        }

        setSpriteImage(activeIdx);
      }

      im.animationRafId = w.requestAnimationFrame(animate);
    }
  }

  function stopSpriteAnimation() {
    w.cancelAnimationFrame(im.animationRafId);
    im.animationRafId = null;

    w.animDurationInput.disabled = false;
    w.animLoopCheckbox.disabled = false;
    setElementVisible(w.animStartButton, true);
    setElementVisible(w.animStopButton, false);

    updateSpriteImage();
  }

  function updateImageSizeOutputs() {
    w.imageOriginalSizeOutput.textContent = `${im.image.naturalWidth} x ${im.image.naturalHeight}`;
    w.imageDisplaySizeOutput.textContent = `${im.image.width} x ${im.image.height}`;

    w.spriteOriginalSizeOutput.textContent = `${im.image.naturalHeight} x ${im.image.naturalHeight}`;
    w.spriteDisplaySizeOutput.textContent = `${im.spriteImage.width} x ${im.spriteImage.height}`;
  }

  function updateSpriteImage() {
    return setSpriteImage(im.thumbnailActiveIdx);
  }

  function updateSpritesheetFeatures() {
    if (!im.isSpritesheet) {
      return;
    }

    const newThumbnailCount = Math.round(im.image.naturalWidth / im.image.naturalHeight);

    if (im.thumbnailCount === newThumbnailCount) {
      return;
    }

    im.thumbnailCount = newThumbnailCount;
    im.thumbnailActiveIdx = Math.min(im.thumbnailCount - 1, im.thumbnailActiveIdx);

    updateSpriteImage();
    generateSpriteThumbnails();
    setElementVisible(w.spriteAnimationForm, im.thumbnailCount > 1);
  }
})();
