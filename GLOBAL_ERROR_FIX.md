# Fix for "Uncaught ReferenceError: global is not defined" Error

This document explains the solution implemented to fix the "global is not defined" error that occurs when using Node.js packages like `react-mathquill` in a browser environment.

## Problem Description

The error "Uncaught ReferenceError: global is not defined" occurs because:

1. **Node.js vs Browser Environment**: Some packages (like `react-mathquill`) expect Node.js global variables that don't exist in browsers
2. **Missing Polyfills**: The browser doesn't have the `global` variable that Node.js provides
3. **Vite Configuration**: Default Vite configuration doesn't handle these Node.js-specific globals

## Solution Implemented

### 1. **Updated Vite Configuration** (`vite.config.js`)

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',  // Maps 'global' to 'globalThis' (browser equivalent)
  },
  optimizeDeps: {
    include: ['react-mathquill']  // Pre-bundle react-mathquill for better compatibility
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true  // Handle mixed ES/CommonJS modules
    }
  }
})
```

**Key Changes:**
- `define: { global: 'globalThis' }`: Maps Node.js `global` to browser `globalThis`
- `optimizeDeps.include`: Ensures react-mathquill is properly pre-bundled
- `transformMixedEsModules`: Handles mixed module formats

### 2. **Added Browser Polyfills** (`public/polyfills.js`)

```javascript
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
```

**Key Features:**
- **Global Mapping**: Maps `global` to `window` for browser compatibility
- **GlobalThis Polyfill**: Provides `globalThis` for older browsers
- **Process Environment**: Adds `process.env` for packages that expect it
- **Buffer Polyfill**: Adds empty Buffer object if needed

### 3. **Updated HTML Template** (`index.html`)

```html
<body>
  <script src="/polyfills.js"></script>  <!-- Load polyfills first -->
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
```

**Key Change:**
- **Early Loading**: Polyfills are loaded before any React code runs

## Technical Details

### Why This Works

1. **Global Mapping**: 
   - Node.js uses `global` as the global object
   - Browsers use `window` as the global object
   - `globalThis` is the standard way to access the global object in both environments

2. **Load Order**:
   - Polyfills load first (non-module script)
   - React application loads after polyfills are in place
   - Ensures `global` is defined before any imports happen

3. **Vite Integration**:
   - `define` option replaces `global` with `globalThis` at build time
   - `optimizeDeps` ensures better handling of react-mathquill
   - Build options handle mixed module formats

### Browser Compatibility

The fix supports:
- ✅ Modern browsers (Chrome, Firefox, Safari, Edge)
- ✅ Older browsers (with globalThis polyfill)
- ✅ Mobile browsers (iOS Safari, Chrome Android)
- ✅ Development and production builds

### Performance Impact

- **Minimal**: Polyfills are lightweight and load quickly
- **One-time**: Global definitions happen once at startup
- **Optimized**: Vite pre-bundles dependencies for better performance

## Verification

To verify the fix is working:

1. **No Console Errors**: Check browser console for "global is not defined" errors
2. **MathQuill Loading**: Verify react-mathquill components render correctly
3. **Symbol Palette**: Test the math symbol insertion functionality
4. **Production Build**: Test `npm run build` and preview

## Alternative Solutions Considered

### Option 1: Webpack DefinePlugin (Not Used)
```javascript
// Would work but Vite's define is simpler
new webpack.DefinePlugin({
  global: 'globalThis',
})
```

### Option 2: Import Polyfills in Main.jsx (Not Used)
```javascript
// Would work but HTML polyfills are loaded earlier
import './polyfills.js';
```

### Option 3: Different Math Library (Not Used)
- Could use KaTeX directly, but react-mathquill provides better editing experience

## Troubleshooting

### If Error Persists:

1. **Clear Browser Cache**: Hard refresh (Ctrl+Shift+R)
2. **Clear Vite Cache**: `npm run dev -- --force`
3. **Reinstall Dependencies**: `rm -rf node_modules && npm install`
4. **Check Console**: Look for other related errors

### Common Issues:

- **Module Loading Order**: Ensure polyfills load before main.jsx
- **Vite Config Syntax**: Verify vite.config.js syntax is correct
- **File Paths**: Ensure polyfills.js is in the public folder

## Future Considerations

- **React-MathQuill Updates**: Monitor for updates that might change requirements
- **Vite Updates**: Keep Vite configuration updated with new versions
- **Alternative Libraries**: Consider migrating to native ES modules if available

This fix ensures compatibility between Node.js packages and browser environments while maintaining optimal performance and browser support.
