// Polyfills for browser compatibility

// Define global for packages that expect Node.js environment
if (typeof global === 'undefined') {
  window.global = window;
}

// Additional polyfills for older browsers
if (!window.globalThis) {
  window.globalThis = window;
}

// Polyfill for process.env if needed by dependencies
if (typeof process === 'undefined') {
  window.process = { env: {} };
}

// MathQuill specific polyfills
if (typeof Buffer === 'undefined') {
  window.Buffer = {};
}