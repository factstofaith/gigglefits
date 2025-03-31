/**
 * Comprehensive polyfills for browser compatibility
 * This file provides polyfills for various browser APIs and ensures compatibility
 * with older browsers and testing environments
 */

// TextEncoder/TextDecoder polyfills for MSW and older browsers
const textEncoding = require('text-encoding');

if (typeof TextEncoder === 'undefined') {
  global.TextEncoder = textEncoding.TextEncoder;
}

if (typeof TextDecoder === 'undefined') {
  global.TextDecoder = textEncoding.TextDecoder;
}

// Object.fromEntries polyfill for IE and older browsers
if (!Object.fromEntries) {
  Object.fromEntries = function (entries) {
    if (!entries || !entries[Symbol.iterator]) { 
      throw new Error('Object.fromEntries requires a single iterable argument');
    }
    const obj = {};
    for (const [key, value] of entries) {
      obj[key] = value;
    }
    return obj;
  };
}

// String.prototype.replaceAll polyfill for IE and older browsers
if (!String.prototype.replaceAll) {
  String.prototype.replaceAll = function(search, replacement) {
    return this.split(search).join(replacement);
  };
}

// Array.prototype.at() polyfill
if (!Array.prototype.at) {
  Array.prototype.at = function(index) {
    // Convert to integer
    index = Math.trunc(index) || 0;
    // Allow negative indexing from the end
    if (index < 0) index += this.length;
    // Bounds check
    if (index < 0 || index >= this.length) return undefined;
    // Get value
    return this[index];
  };
}

// Make sure necessary Node.js globals are available in the browser environment
if (typeof global === 'undefined') {
  window.global = window;
}
if (typeof process === 'undefined') {
  window.process = { env: {} };
}

