/**
 * Simple build script for TAP Integration Platform
 */

'use strict';

process.env.NODE_ENV = 'production';

// Makes the script crash on unhandled rejections
process.on('unhandledRejection', err => {
  throw err;
});

const webpack = require('webpack');
const config = require('./webpack.config.js')('production');

console.log('Creating production build...');

const compiler = webpack(config);
compiler.run((err, stats) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  console.log(stats.toString({
    colors: true,
    modules: false,
    children: false,
    chunks: false,
    chunkModules: false
  }));

  if (stats.hasErrors()) {
    console.log('Build failed with errors.');
    process.exit(1);
  }

  console.log('Build complete!');
});