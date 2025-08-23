import '@testing-library/jest-dom';

// Polyfill for jsdom
Object.defineProperty(HTMLElement.prototype, 'hasPointerCapture', {
  value: function() {
    return false;
  },
  writable: true,
});

Object.defineProperty(HTMLElement.prototype, 'setPointerCapture', {
  value: function() {},
  writable: true,
});

Object.defineProperty(HTMLElement.prototype, 'releasePointerCapture', {
  value: function() {},
  writable: true,
});

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock scrollIntoView
Element.prototype.scrollIntoView = function() {};
