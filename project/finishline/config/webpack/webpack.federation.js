/**
 * federation Webpack Config
 * 
 * Webpack Module Federation configuration for micro frontends.
 */

const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

/**
 * federation implementation
 * 
 * @param {Object} baseConfig - Base webpack configuration
 * @param {Object} options - Configuration options
 * @returns {Object} Enhanced webpack configuration
 */
module.exports = function federation(baseConfig, options = {}) {
  // Create a new configuration object
  const config = {
    ...baseConfig,
    // Enhanced configuration
    optimization: {
      ...baseConfig.optimization,
      minimize: true,
      minimizer: [
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
        }),
        new CssMinimizerPlugin(),
      ],
      splitChunks: {
        chunks: 'all',
        name: false,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              // Get the name. E.g. node_modules/packageName/...
              const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
              
              // npm package names are URL-safe, but some servers don't like @ symbols
              return `vendor.${packageName.replace('@', '')}`;
            },
          },
        },
      },
      runtimeChunk: {
        name: entrypoint => `runtime-${entrypoint.name}`,
      },
    },
    performance: {
      hints: 'warning',
      maxAssetSize: 250000,
      maxEntrypointSize: 400000,
    },
  };
  
  // Add plugins based on options
  if (options.analyzeBundle) {
    config.plugins.push(
      new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        reportFilename: 'bundle-report.html',
      })
    );
  }
  
  if (options.generateManifest) {
    config.plugins.push(
      new WebpackManifestPlugin({
        fileName: 'asset-manifest.json',
        publicPath: baseConfig.output.publicPath,
        generate: (seed, files, entrypoints) => {
          const manifestFiles = files.reduce((manifest, file) => {
            manifest[file.name] = file.path;
            return manifest;
          }, seed);
          
          const entrypointFiles = Object.keys(entrypoints).reduce(
            (acc, entry) => {
              acc[entry] = entrypoints[entry].filter(fileName => !fileName.endsWith('.map'));
              return acc;
            }, {});
          
          return {
            files: manifestFiles,
            entrypoints: entrypointFiles,
          };
        },
      })
    );
  }
  
  return config;
};