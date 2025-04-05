/**
 * Production webpack configuration for TAP Integration Platform
 * Optimized for performance, size, and loading speed
 */

const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const WorkboxWebpackPlugin = require('workbox-webpack-plugin');
const createCommonConfig = require('./webpack.common');
const paths = require('./paths');

// Create production configuration extending common configuration
module.exports = {
  ...createCommonConfig({ mode: 'production' }),
  
  // Set mode to production
  mode: 'production',
  
  // Source map settings for production
  devtool: 'source-map',
  
  // Output configuration
  output: {
    // Build directory
    path: paths.appBuild,
    
    // Output filenames with content hash for long-term caching
    filename: 'static/js/[name].[contenthash:8].js',
    
    // Output chunk filenames
    chunkFilename: 'static/js/[name].[contenthash:8].chunk.js',
    
    // Asset module filenames
    assetModuleFilename: 'static/media/[name].[hash:8][ext]',
    
    // Public URL
    publicPath: paths.publicUrlOrPath,
    
    // Clean output directory before build
    clean: true,
  },
  
  // Production optimization settings
  optimization: {
    // Enable minimization in production
    minimize: true,
    
    // Configure minimizer plugins
    minimizer: [
      // Minify JavaScript
      new TerserPlugin({
        terserOptions: {
          parse: {
            ecma: 8,
          },
          compress: {
            ecma: 5,
            warnings: false,
            comparisons: false,
            inline: 2,
            drop_console: process.env.KEEP_CONSOLE !== 'true',
          },
          mangle: {
            safari10: true,
          },
          output: {
            ecma: 5,
            comments: false,
            ascii_only: true,
          },
        },
        parallel: true,
        extractComments: false,
      }),
      
      // Minify CSS
      new CssMinimizerPlugin({
        minimizerOptions: {
          preset: [
            'default',
            {
              discardComments: { removeAll: true },
              mergeLonghand: true,
              mergeRules: true,
              discardEmpty: true,
              minifyFontValues: true,
            },
          ],
        },
        parallel: true,
      }),
    ],
    
    // Split chunks configuration
    splitChunks: {
      chunks: 'all',
      // Use deterministic names for better caching
      name: false,
      // Caching groups for specific module types
      cacheGroups: {
        // Separate vendor chunks
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 20,
        },
        // For Material UI, create a separate chunk
        mui: {
          test: /[\\/]node_modules[\\/]@mui[\\/]/,
          name: 'mui-vendors',
          chunks: 'all',
          priority: 30,
        },
        // Separate React and related packages
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom)[\\/]/,
          name: 'react-vendors',
          chunks: 'all',
          priority: 40, 
        },
        // Separate utility libraries
        utils: {
          test: /[\\/]node_modules[\\/](lodash|moment|axios)[\\/]/,
          name: 'util-vendors',
          chunks: 'all',
          priority: 25,
        },
        // Style chunks
        styles: {
          name: 'styles',
          type: 'css/mini-extract',
          chunks: 'all',
          enforce: true,
        },
        default: {
          minChunks: 2,
          priority: 10,
          reuseExistingChunk: true,
        },
      },
    },
    
    // Keep runtime chunk separate for better caching
    runtimeChunk: {
      name: entrypoint => `runtime-${entrypoint.name}`,
    },
    
    // Use deterministic module and chunk IDs for better caching
    moduleIds: 'deterministic',
    chunkIds: 'deterministic',
  },
  
  // Production plugins
  plugins: [
    // Extract CSS into separate files
    new MiniCssExtractPlugin({
      filename: 'static/css/[name].[contenthash:8].css',
      chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
    }),
    
    // Generate a manifest file with all asset filenames
    new WebpackManifestPlugin({
      fileName: 'asset-manifest.json',
      publicPath: paths.publicUrlOrPath,
      generate: (seed, files, entrypoints) => {
        const manifestFiles = files.reduce((manifest, file) => {
          manifest[file.name] = file.path;
          return manifest;
        }, seed);
        
        const entrypointFiles = entrypoints.main.filter(
          fileName => !fileName.endsWith('.map')
        );
        
        return {
          files: manifestFiles,
          entrypoints: entrypointFiles,
        };
      },
    }),
    
    // Generate a service worker for offline caching
    new WorkboxWebpackPlugin.GenerateSW({
      clientsClaim: true,
      exclude: [/\.map$/, /asset-manifest\.json$/],
      navigateFallback: `${paths.publicUrlOrPath}index.html`,
      navigateFallbackDenylist: [
        // Exclude files that should not be served as HTML
        new RegExp('^/_'),
        new RegExp('/[^/?]+\\.[^/]+$'),
      ],
      maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
      // Avoid caching large files to save bandwidth
      dontCacheBustURLsMatching: /\.\w{8}\./,
      // Only run in production mode
      mode: 'production',
    }),
    
    // Create gzipped version of assets
    new CompressionPlugin({
      algorithm: 'gzip',
      test: /\.(js|css|html|svg)$/,
      threshold: 10240, // Only compress files larger than 10KB
      minRatio: 0.8, // Only compress files that reduce in size by at least 20%
    }),
    
    // Use IgnorePlugin to ignore certain modules
    new webpack.IgnorePlugin({
      resourceRegExp: /^\.\/locale$/,
      contextRegExp: /moment$/,
    }),
  ],
  
  // Production performance settings
  performance: {
    maxAssetSize: 250000, // 250KB
    maxEntrypointSize: 500000, // 500KB
    hints: 'warning',
  },
};