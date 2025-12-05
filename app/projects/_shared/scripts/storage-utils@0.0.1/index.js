const instances = new Map();

export const clearAll = () => {
  for (const instance of instances.values()) {
    instance.clear();
  }
};

export const createFor = prefix => {
  if (instances.has(prefix)) {
    throw new Error(`Trying to create duplicate storage instance for prefix '${prefix}'.`);
  }

  const instance = new StorageImpl(prefix);
  instances.set(prefix, instance);

  return instance;
};

// Helpers
class StorageImpl {
  constructor(prefix) {
    this._prefix = `${prefix}:`;
    this._store = window.localStorage;
  }

  clear() {
    // Only clear items that this instance manages
    // (i.e. whose keys have the appropriate prefix).
    this.keys().forEach(key => this.delete(key));
  }

  delete(key) {
    this._store.removeItem(this._keyFor(key));
  }

  get(key) {
    const value = this._store.getItem(this._keyFor(key));
    return ((value === null) || (value === 'undefined')) ? undefined : JSON.parse(value);
  }

  has(key) {
    return this._store.getItem(this._keyFor(key)) !== null;
  }

  keys() {
    // Only return keys that this instance manages
    // (i.e. that have the appropriate prefix).
    return Array.
      from(new Array(this._store.length), (_, i) => this._store.key(i)).
      filter(key => key.startsWith(this._prefix));
  }

  set(key, value) {
    this._store.setItem(this._keyFor(key), JSON.stringify(value));
  }

  _keyFor(key) {
    return `${this._prefix}${key}`;
  }
}
