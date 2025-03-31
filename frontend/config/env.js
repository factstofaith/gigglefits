'use strict';

const fs = require('fs');
const path = require('path');

const NODE_ENV = process.env.NODE_ENV;
if (!NODE_ENV) {
  throw new Error(
    'The NODE_ENV environment variable is required but was not specified.'
  );
}

// Make sure that including paths.js after env.js will read .env variables.
delete require.cache[require.resolve('./paths')];

const dotenvFiles = [
  `${path.resolve(__dirname, '../.env')}.${NODE_ENV}.local`,
  `${path.resolve(__dirname, '../.env')}.${NODE_ENV}`,
  // Don't include `.env.local` for `test` environment
  // since normally you expect tests to produce the same
  // results for everyone
  NODE_ENV !== 'test' && `${path.resolve(__dirname, '../.env')}.local`,
  path.resolve(__dirname, '../.env'),
].filter(Boolean);

// Load environment variables from .env* files. Suppress warnings using silent
// if this file is missing. dotenv will never modify any environment variables
// that have already been set.  Variable expansion is supported in .env files.
// https://github.com/motdotla/dotenv
// https://github.com/motdotla/dotenv-expand
dotenvFiles.forEach(dotenvFile => {
  if (fs.existsSync(dotenvFile)) {
    require('dotenv-expand')(
      require('dotenv').config({
        path: dotenvFile,
      })
    );
  }
});

// We support resolving modules according to `NODE_PATH`.
// This lets you use absolute paths in imports inside large monorepos:
// https://github.com/facebook/create-react-app/issues/253.
// It works similar to `NODE_PATH` in Node itself:
// https://nodejs.org/api/modules.html#modules_loading_from_the_global_folders
// Note that unlike in Node, only *relative* paths from `NODE_PATH` are honored.
// Otherwise, we risk importing Node.js core modules into an app instead of webpack shims.
// https://github.com/facebook/create-react-app/issues/1023#issuecomment-265344421
// We also resolve them to make sure all tools using them work consistently.
const appDirectory = fs.realpathSync(process.cwd());
process.env.NODE_PATH = (process.env.NODE_PATH || '')
  .split(path.delimiter)
  .filter(folder => folder && !path.isAbsolute(folder))
  .map(folder => path.resolve(appDirectory, folder))
  .join(path.delimiter);

// Get the build type from environment or default to 'standard'
process.env.BUILD_TYPE = process.env.BUILD_TYPE || 'standard';

/**
 * Get client environment variables for webpack configuration
 * @param {string} publicUrl The public URL to use in the app
 * @returns {Object} Environment variables object for webpack
 */
function getClientEnvironment(publicUrl) {
  // Collect raw environment variables for InterpolateHtmlPlugin
  const raw = Object.keys(process.env)
    .filter(key => /^(NODE_ENV|TAP_|REACT_APP_|PUBLIC_URL)/.test(key))
    .reduce(
      (env, key) => {
        env[key] = process.env[key];
        return env;
      },
      {
        // Set defaults for TAP-specific environment variables
        NODE_ENV: process.env.NODE_ENV || 'development',
        PUBLIC_URL: publicUrl || '',
        TAP_VERSION: require('../package.json').version,
        TAP_BUILD_TIMESTAMP: new Date().toISOString(),
        TAP_BUILD_TYPE: process.env.BUILD_TYPE || 'standard',
      }
    );
    
  // Stringify all values for DefinePlugin
  const stringified = {
    'process.env': Object.keys(raw).reduce((env, key) => {
      env[key] = JSON.stringify(raw[key]);
      return env;
    }, {})
  };

  return {
    raw,
    stringified
  };
}

module.exports = getClientEnvironment;