// Adds custom DOM matchers (toBeInTheDocument, etc.) to every test file.
import '@testing-library/jest-dom/vitest';

/**
 * Install a no-op IntersectionObserver for jsdom (homepage reveal animations).
 * @returns {void}
 */
function installIntersectionObserverMock() {
  function IntersectionObserverMock() {
    this.observe = function observe() {};
    this.unobserve = function unobserve() {};
    this.disconnect = function disconnect() {};
  }

  if (typeof globalThis.IntersectionObserver === 'undefined') {
    globalThis.IntersectionObserver = IntersectionObserverMock;
  }
}

/**
 * Node's experimental localStorage is incomplete (no `clear`). Provide a
 * Memory Storage stand-in so FR-03 tests can persist listings.
 */
class MemoryStorage {
  /**
   * Create an empty in-memory store.
   */
  constructor() {
    this.store = new Map();
  }

  /**
   * Read a stored value.
   * @param {string} key Storage key.
   * @returns {(string|null)} Stored string, or null.
   */
  getItem(key) {
    return this.store.has(key) ? this.store.get(key) : null;
  }

  /**
   * Write a stored value.
   * @param {string} key Storage key.
   * @param {string} value Value to persist.
   * @returns {void}
   */
  setItem(key, value) {
    this.store.set(String(key), String(value));
  }

  /**
   * Delete a stored value.
   * @param {string} key Storage key.
   * @returns {void}
   */
  removeItem(key) {
    this.store.delete(String(key));
  }

  /**
   * Empty the store.
   * @returns {void}
   */
  clear() {
    this.store.clear();
  }
}

installIntersectionObserverMock();

if (typeof globalThis.localStorage === 'undefined'
  || typeof globalThis.localStorage.clear !== 'function') {
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: new MemoryStorage(),
  });
}
