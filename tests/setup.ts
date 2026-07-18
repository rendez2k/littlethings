import '@testing-library/jest-dom/vitest';
// Provide a real IndexedDB implementation for repository/service tests.
import 'fake-indexeddb/auto';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Ensure the DOM is reset between tests.
afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

// jsdom does not implement matchMedia; provide a controllable stub so theme
// logic can be exercised in unit/component tests.
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
}
