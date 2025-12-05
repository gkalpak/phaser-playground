self.createAndRegisterServiceWorker = (swVersion, {
  cacheFirst: {files: cacheFirstFiles = [], patterns: cacheFirstPatterns = []} = {},
  networkFirst: {files: networkFirstFiles = [], patterns: networkFirstPatterns = [], timeout: networkFirstTimeout = 10000} = {},
}) => {
  // Constants
  const CACHE_NAME_PREFIX = 'gk-phaser-playground-';
  const LOG_PREFIX = `[ServiceWorker@${swVersion}]`;
  const RESPONSE_404 = new Response(null, {status: 404, statusText: 'Not found'});

  const CACHE_NAMES = {
    cacheFirst: `${CACHE_NAME_PREFIX}${swVersion}:cache-first`,
    networkFirst: `${CACHE_NAME_PREFIX}${swVersion}:network-first`,
  };
  const FILES_TO_CACHE = {
    cacheFirst: {
      files: [
        '../_shared/scripts/phaser-utils@0.0.1/index.js',
        '../_shared/scripts/preferences-utils@0.0.1/index.js',
        '../_shared/scripts/storage-utils@0.0.1/index.js',
        '../_shared/scripts/ui-utils@0.0.1/index.js',
        '../_shared/vendor/phaser@3.24.1/index.min.js',
        'manifest.webmanifest',
        ...cacheFirstFiles,
      ],
      patterns: [
        new RegExp('^https?://fonts\\.(?:googleapis|gstatic)\\.com/.+', 'i'),
        ...cacheFirstPatterns,
      ],
    },
    networkFirst: {
      files: [
        '../_shared/scripts/index.js',
        'scripts/index.js',
        'index.html',
        'styles.css',
        ...networkFirstFiles,
      ],
      patterns: [
        ...networkFirstPatterns,
      ],
      timeout: networkFirstTimeout,
    },
  };

  // Variables
  let scheduledUpdate = null;

  // Register ServiceWorker event listeners.
  self.addEventListener('activate', evt => {
    logInfo('Activating...');

    // Clean up caches and claim all clients.
    evt.waitUntil(cleanUpObsoleteCaches().
      then(() => self.clients.claim()).
      then(() => logInfo('Activated successfully.')).
      catch(err => logWarn('Failed to activate:', err)));
  });

  self.addEventListener('install', evt => {
    logInfo('Installing...');

    // Cache files and skip waiting (i.e. activate asap).
    const cachingPromises = Object.
      entries(CACHE_NAMES).
      map(([strategy, cacheName]) => self.caches.open(cacheName).then(cache => cache.addAll(FILES_TO_CACHE[strategy].files)));

    evt.waitUntil(Promise.all(cachingPromises).
      then(() => self.skipWaiting()).
      then(() => logInfo('Installed successfully.')).
      catch(err => logWarn('Failed to install:', err)));
  });

  self.addEventListener('fetch', evt => {
    evt.respondWith((async () => {
      const req = evt.request;
      let res;

      if (req.mode === 'navigate') scheduleUpdate();

      try {
        const cacheFirstCache = await self.caches.open(CACHE_NAMES.cacheFirst);
        res = await getFromCache(cacheFirstCache, req);

        if (!res) {
          const networkRequest = self.fetch(req);
          const timeoutRequest = new Promise(resolve => setTimeout(async () => {
            const networkFirstCache = await self.caches.open(CACHE_NAMES.networkFirst);
            resolve(await getFromCache(networkFirstCache, req) || await networkRequest);
          }, FILES_TO_CACHE.networkFirst.timeout));

          res = await Promise.race([networkRequest, timeoutRequest]);
          ensureSuccessfulResponse(req, res);

          evt.waitUntil((async () => {
            const networkRes = await networkRequest;
            ensureSuccessfulResponse(req, networkRes);

            const isCacheFirst = FILES_TO_CACHE.cacheFirst.patterns.some(re => re.test(req.url));
            const cache = await self.caches.open(CACHE_NAMES[isCacheFirst ? 'cacheFirst' : 'networkFirst']);
            await cache.put(req, networkRes);
          })());
        }
      } catch {
        res = await getFromCache(self.caches, req);
      }

      return (res || RESPONSE_404).clone();
    })());
  });

  // Helpers
  async function addToCache(cache, urlOrReq) {
    const req = (typeof urlOrReq === 'string') ? new Request(urlOrReq) : urlOrReq;
    const res = await self.fetch(req);

    ensureSuccessfulResponse(req, res);

    cache.put(urlOrReq, res);
  }

  async function cleanUpObsoleteCaches() {
    const allCacheNames = await self.caches.keys();
    const ownCacheNames = Object.values(CACHE_NAMES);

    const obsoleteCacheNames = allCacheNames.
      filter(name => name.startsWith(CACHE_NAME_PREFIX)).
      filter(name => !ownCacheNames.includes(name));

    await Promise.all(obsoleteCacheNames.map(name => self.caches.delete(name)));
  }

  function ensureSuccessfulResponse(req, res) {
    // Fonts seem to be requested with `no-cors`, which results in an opaque response. Cache them anyway.
    // (See also https://github.com/GoogleChrome/workbox/issues/1563#issuecomment-401880864.)
    const success = res.ok || ((req.mode === 'no-cors') && (res.status === 0));
    if (!success) throw new Error(`Request for '${req.url}' failed: ${res.status}`);
  }

  function getFromCache(cacheOrCaches, req) {
    return cacheOrCaches.match(req, {ignoreSearch: true, ignoreVary: true});
  }

  function logInfo(...args) {
    console.info(LOG_PREFIX, ...args);
  }

  function logWarn(...args) {
    console.warn(LOG_PREFIX, ...args);
  }

  function scheduleUpdate() {
    if (scheduledUpdate !== null) return;

    scheduledUpdate = setTimeout(async () => {
      try {
        scheduledUpdate = null;

        logInfo('Checking for updates...');

        const cacheFirstCache = await self.caches.open(CACHE_NAMES.cacheFirst);
        const reqs = await cacheFirstCache.keys();

        await Promise.all(reqs.map(req =>
          addToCache(cacheFirstCache, req).catch(err => logWarn(err))));
      } catch (err) {
        logWarn('Failed to update cached resources:', err);
      }
    }, 10000);
  }
};
