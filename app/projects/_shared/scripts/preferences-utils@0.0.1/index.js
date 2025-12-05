import {storageUtils} from '../index.js';


export const createWithOptions = options => new PreferencesService(options);

// Helpers
class PreferencesService {
  constructor(options) {
    this._storage = storageUtils.createFor('preferences');

    Object.
      entries(options).
      forEach(([name, defValue]) => this._defineOption(name, defValue));
  }

  _defineOption(name, defValue) {
    Object.defineProperty(this, name, {
      get: () => this._storage.has(name) ? this._storage.get(name) : defValue,
      set: newValue => this._storage.set(name, newValue),
    });
  }
}
