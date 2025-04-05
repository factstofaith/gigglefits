/**
 * Development webpack configuration for TAP Integration Platform
 * Optimized for developer experience with hot reloading and fast builds
 */

const webpack = require('webpack');
const path = require('path');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const createCommonConfig = require('./webpack.common');
const paths = require('./paths');

// Create development configuration extending common configuration
module.exports = {
  ...createCommonConfig({ mode: 'development' }),
  
  // Set mode to development
  mode: 'development',
  
  // Use cheap-module-source-map for faster builds but still good debugging
  devtool: 'cheap-module-source-map',
  
  // Output configuration
  output: {
    // Use memory for faster builds
    path: paths.appBuild,
    
    // Add /* filename */ comments to generated require()s in the output
    pathinfo: true,
    
    // Bundle name without hashing for faster builds
    filename: 'static/js/bundle.js',
    
    // Chunk naming
    chunkFilename: 'static/js/[name].chunk.js',
    
    // Public URL
    publicPath: paths.publicUrlOrPath,
    
    // Point sourcemap entries to original disk location (format as URL on Windows)
    devtoolModuleFilenameTemplate: info =>
      path.resolve(info.absoluteResourcePath).replace(/\\/g, '/'),
  },
  
  // Optimization settings for development
  optimization: {
    // Keep runtime chunk separate to enable better caching
    runtimeChunk: {
      name: entrypoint => `runtime-${entrypoint.name}`,
    },
    
    // Fast development optimization
    splitChunks: {
      chunks: 'all',
      name: false,
    },
    
    // Don't minimize in development for faster builds
    minimize: false,
  },
  
  // Enable fast refresh for development
  plugins: [
    // React Refresh for fast refresh during development
    new ReactRefreshWebpackPlugin({
      overlay: {
        entry: require.resolve('react-dev-utils/webpackHotDevClient'),
        // The expected exports are slightly different from what the overlay exports,
        // so we need to use a wrapper
        sockIntegration: false,
      },
    }),
    
    // ESLint checking during development
    new ESLintPlugin({
      extensions: ['js', 'mjs', 'jsx', 'ts', 'tsx'],
      formatter: require.resolve('react-dev-utils/eslintFormatter'),
      eslintPath: require.resolve('eslint'),
      context: paths.appSrc,
      cache: true,
      cacheLocation: path.resolve(
        paths.appNodeModules,
        '.cache/.eslintcache'
      ),
      // ESLint class options
      cwd: paths.appPath,
      resolvePluginsRelativeTo: __dirname,
      baseConfig: {
        extends: [require.resolve('eslint-config-react-app/base')],
      },
    }),
    
    // TypeScript type checking in a separate process for better performance
    new ForkTsCheckerWebpackPlugin({
      async: true,
      typescript: {
        typescriptPath: require.resolve('typescript'),
        configOverwrite: {
          compilerOptions: {
            sourceMap: true,
            skipLibCheck: true,
            inlineSourceMap: false,
            declarationMap: false,
            noEmit: true,
            incremental: true,
            tsBuildInfoFile: paths.appTsBuildInfoFile,
          },
        },
        context: paths.appPath,
        diagnosticOptions: {
          syntactic: true,
        },
        mode: 'write-references',
      },
      issue: {
        // This one is specifically to match during CI tests
        include: [
          { file: '../**/src/**/*.{ts,tsx}' },
          { file: '**/src/**/*.{ts,tsx}' },
        ],
        exclude: [
          { file: '**/src/**/__tests__/**' },
          { file: '**/src/**/?(*.){spec|test}.*' },
          { file: '**/src/setupTests.*' },
        ],
      },
      logger: {
        infrastructure: 'silent',
      },
    }),
    
    // Detect circular dependencies
    new CircularDependencyPlugin({
      exclude: /node_modules/,
      failOnError: false,
      allowAsyncCycles: false,
      cwd: process.cwd(),
    }),
  ],
  
  // Development server configuration
  devServer: {
    // Open browser when server starts
    open: true,
    
    // Enable hot module replacement
    hot: true,
    
    // Serve from root
    static: {
      directory: paths.appPublic,
      publicPath: paths.publicUrlOrPath,
    },
    
    // Enable gzip compression for better performance
    compress: true,
    
    // Use localhost or specified host
    host: process.env.HOST || '0.0.0.0', // Allow connections from outside the container
    
    // Use specified port
    port: parseInt(process.env.PORT, 10) || 3000,
    
    // Path for history API fallback (SPA support)
    historyApiFallback: {
      disableDotRule: true,
      index: paths.publicUrlOrPath,
    },
    
    // Enable WebSocket for HMR
    webSocketServer: 'ws',
    
    // Use proper headers for cross-origin requests
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': '*',
      'Access-Control-Allow-Headers': '*',
    },
    
    // Setup dev middleware
    devMiddleware: {
      // Public path for serving assets
      publicPath: paths.publicUrlOrPath.slice(0, -1),
      
      // Enable Webpack Dev Middleware to watch files changes
      watch: {
        ignored: /node_modules/,
        poll: process.env.POLL_INTERVAL || false,
      },
      
      // Use a simpler progress report for cleaner output
      stats: 'minimal',
    },
    
    // Setup client
    client: {
      // Show overlay on errors
      overlay: {
        errors: true,
        warnings: false,
      },
      
      // Enable progress tracking
      progress: true,
      
      // Enable HMR for hot reloading
      webSocketTransport: 'ws',
    },
    
    // Allow requests from outside the container
    allowedHosts: 'all',
  },
  
  // Add additional performance settings
  performance: {
    hints: false,
  },
};