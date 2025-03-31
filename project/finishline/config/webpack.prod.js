/**
 * Production Webpack Configuration
 */
const path = require('path');
const { merge } = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const commonConfig = require('./webpack.common.js');

// Root directory
const rootDir = path.resolve(__dirname, '..');
// Source directory
const srcDir = path.resolve(rootDir, 'src');
// Build directory
const buildDir = path.resolve(rootDir, 'build');
// Public directory
const publicDir = path.resolve(rootDir, 'public');

module.exports = (env, argv) => {
  const shouldAnalyze = process.env.ANALYZE === 'true';

  return merge(commonConfig(env, { mode: 'production' }), {
    mode: 'production',
    bail: true,
    entry: path.resolve(srcDir, 'index.js'),
    output: {
      path: buildDir,
      filename: 'static/js/[name].[contenthash:8].js',
      chunkFilename: 'static/js/[name].[contenthash:8].chunk.js',
      publicPath: '/',
      clean: true,
    },
    devtool: 'source-map',
    plugins: [
      new HtmlWebpackPlugin({
        template: path.resolve(publicDir, 'index.html'),
        favicon: path.resolve(publicDir, 'favicon.ico'),
        inject: true,
        minify: {
          removeComments: true,
          collapseWhitespace: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeStyleLinkTypeAttributes: true,
          keepClosingSlash: true,
          minifyJS: true,
          minifyCSS: true,
          minifyURLs: true,
        },
      }),
      new MiniCssExtractPlugin({
        filename: 'static/css/[name].[contenthash:8].css',
        chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
      }),
      new CompressionPlugin({
        algorithm: 'gzip',
        test: /\.(js|css|html|svg)$/,
        threshold: 10240,
        minRatio: 0.8,
      }),
      shouldAnalyze && new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        reportFilename: path.resolve(rootDir, 'reports/bundle-analysis.html'),
        openAnalyzer: false,
      }),
    ].filter(Boolean),
    optimization: {
      moduleIds: 'deterministic',
      chunkIds: 'deterministic',
      splitChunks: {
        chunks: 'all',
        maxInitialRequests: 25,
        minSize: 20000,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              // Get the name of the npm package
              const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
              // Don't include some large packages that deserve their own chunk
              if (['@mui', 'react', 'react-dom'].some(name => packageName.startsWith(name))) {
                return null;
              }
              // Replace @ symbol and special characters
              return `vendor.${packageName.replace('@', '')}`;
            },
            priority: 20,
          },
          mui: {
            test: /[\\/]node_modules[\\/]@mui[\\/]/,
            name: 'vendor.mui',
            chunks: 'all',
            priority: 30,
          },
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'vendor.react',
            chunks: 'all',
            priority: 40,
          },
          commons: {
            test: /[\\/]src[\\/]components[\\/]/,
            name: 'commons',
            chunks: 'all',
            minChunks: 2,
            priority: 10,
          },
        },
      },
      runtimeChunk: 'single',
    },
    performance: {
      hints: 'warning',
      maxAssetSize: 500000,
      maxEntrypointSize: 800000,
    },
  });
};