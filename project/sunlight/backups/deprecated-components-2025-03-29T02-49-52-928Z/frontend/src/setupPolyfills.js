// This file must be required before any other imports
// It polyfills TextEncoder/TextDecoder for MSW in the test environment

if (typeof global.TextEncoder === 'undefined') {
  class CustomTextEncoder {
    encode(string) {
      const codeUnits = new Uint16Array(string.length);
      for (let i = 0; i < string.length; i++) {
        codeUnits[i] = string.charCodeAt(i);
      }
      return codeUnits;
    }
  }
  global.TextEncoder = CustomTextEncoder;
}

if (typeof global.TextDecoder === 'undefined') {
  class CustomTextDecoder {
    decode(bytes) {
      let string = '';
      for (let i = 0; i < bytes.length; i++) {
        string += String.fromCharCode(bytes[i]);
      }
      return string;
    }
  }
  global.TextDecoder = CustomTextDecoder;
}
