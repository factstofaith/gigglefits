/**
 * Development Webpack Configuration
 */
const path = require('path');
const { merge } = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// Removing dependency on ReactRefreshWebpackPlugin to avoid dependency conflicts
const commonConfig = require('./webpack.common.js');

// Root directory
const rootDir = path.resolve(__dirname, '..');
// Source directory
const srcDir = path.resolve(rootDir, 'src');
// Public directory
const publicDir = path.resolve(rootDir, 'public');

module.exports = (env, argv) => {
  return merge(commonConfig(env, { mode: 'development' }), {
    mode: 'development',
    entry: [
      // Include polyfills if needed
      path.resolve(srcDir, 'index.js'),
    ],
    output: {
      path: path.resolve(rootDir, 'build'),
      filename: 'static/js/[name].bundle.js',
      chunkFilename: 'static/js/[name].chunk.js',
      publicPath: '/',
    },
    devtool: 'cheap-module-source-map',
    devServer: {
      host: 'localhost',
      port: 3000,
      hot: true,
      historyApiFallback: true,
      compress: true,
      static: {
        directory: publicDir,
      },
      client: {
        overlay: {
          errors: true,
          warnings: false,
        },
      },
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.resolve(publicDir, 'index.html'),
        favicon: path.resolve(publicDir, 'favicon.ico'),
        inject: true,
      }),
      // ReactRefreshWebpackPlugin removed to avoid dependency conflicts
    ],
    optimization: {
      runtimeChunk: 'single',
      splitChunks: {
        chunks: 'all',
      },
    },
    cache: {
      type: 'filesystem',
      cacheDirectory: path.resolve(rootDir, '.webpack-cache'),
      buildDependencies: {
        config: [__filename],
      },
    },
  });
};