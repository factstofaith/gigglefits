/**
 * Optimized Webpack Configuration
 * 
 * Enhanced for performance, bundle size, and modern features
 * Created by Project Sunlight optimization
 */

const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CompressionPlugin = require('compression-webpack-plugin');
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
const getClientEnvironment = require('./env');
const paths = require('./paths');
const aliases = require('./webpack.aliases');

// Source maps are resource intensive and can cause out of memory issue for large source files.
const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== 'false';

const imageInlineSizeLimit = parseInt(
  process.env.IMAGE_INLINE_SIZE_LIMIT || '10000'
);

// Get environment variables to inject into our app.
const env = getClientEnvironment(paths.publicUrlOrPath.slice(0, -1));

module.exports = function(webpackEnv) {
  const isEnvDevelopment = webpackEnv === 'development';
  const isEnvProduction = webpackEnv === 'production';
  
  // Enable profiling in production to analyze bottlenecks
  const enableProfiling = isEnvProduction && process.env.PROFILE === 'true';
  
  // Output benchmark information in production
  const enableBenchmark = isEnvProduction && process.env.BENCHMARK === 'true';
  
  // Common function to get style loaders
  const getStyleLoaders = (cssOptions, preProcessor) => {
    const loaders = [
      isEnvDevelopment && require.resolve('style-loader'),
      isEnvProduction && {
        loader: MiniCssExtractPlugin.loader,
        options: paths.publicUrlOrPath.startsWith('.') ? { publicPath: '../../' } : {},
      },
      {
        loader: require.resolve('css-loader'),
        options: cssOptions,
      },
      {
        // Options for PostCSS as we reference these options twice
        // Adds vendor prefixing based on your specified browser support
        loader: require.resolve('postcss-loader'),
        options: {
          postcssOptions: {
            plugins: [
              'postcss-flexbugs-fixes',
              [
                'postcss-preset-env',
                {
                  autoprefixer: {
                    flexbox: 'no-2009',
                  },
                  stage: 3,
                },
              ],
              // Adds PostCSS Normalize for browser compatibility
              'postcss-normalize',
            ],
          },
          sourceMap: isEnvProduction ? shouldUseSourceMap : isEnvDevelopment,
        },
      },
    ].filter(Boolean);
    
    if (preProcessor) {
      loaders.push(
        {
          loader: require.resolve('resolve-url-loader'),
          options: {
            sourceMap: isEnvProduction ? shouldUseSourceMap : isEnvDevelopment,
            root: paths.appSrc,
          },
        },
        {
          loader: require.resolve(preProcessor),
          options: {
            sourceMap: true,
          },
        }
      );
    }
    
    return loaders;
  };

  return {
    target: ['browserslist'],
    // Set mode based on environment
    mode: isEnvProduction ? 'production' : isEnvDevelopment && 'development',
    // Stop compilation early in production
    bail: isEnvProduction,
    devtool: isEnvProduction
      ? shouldUseSourceMap
        ? 'source-map'
        : false
      : isEnvDevelopment && 'cheap-module-source-map',
    // These are the entry points to our application
    entry: {
      main: paths.appIndexJs,
      // Add modern and legacy entries for differential loading
      modern: paths.appIndexJs,
    },
    output: {
      // The build folder
      path: paths.appBuild,
      // Add content hash for better caching
      filename: isEnvProduction
        ? 'static/js/[name].[contenthash:8].js'
        : 'static/js/[name].bundle.js',
      // Chunk naming
      chunkFilename: isEnvProduction
        ? 'static/js/[name].[contenthash:8].chunk.js'
        : 'static/js/[name].chunk.js',
      // Expose as AMD, CommonJS, or global based on environment
      library: isEnvProduction ? { type: 'module' } : undefined,
      // Output path
      publicPath: paths.publicUrlOrPath,
      // This helps debugging in development mode
      devtoolModuleFilenameTemplate: isEnvProduction
        ? (info => path.relative(paths.appSrc, info.absoluteResourcePath).replace(/\\/g, '/'))
        : (info => path.resolve(info.absoluteResourcePath).replace(/\\/g, '/')),
      // Enable the export field for better optimization
      chunkLoadingGlobal: `webpackJsonp${paths.appPackageJson.name}`,
      // Module determinism for better caching
      hashFunction: 'xxhash64',
      // Use global variable for loading chunks (backward compatibility)
      enabledChunkLoadingTypes: ['jsonp', 'import'],
    },
    // Enable experimental features in development
    experiments: {
      outputModule: isEnvProduction,
      asyncWebAssembly: true,
      topLevelAwait: true,
      lazyCompilation: isEnvDevelopment,
    },
    // Cache configuration for faster rebuilds
    cache: {
      type: 'filesystem',
      version: Date.now().toString(),
      cacheDirectory: paths.appWebpackCache,
      store: 'pack',
      buildDependencies: {
        defaultWebpack: ['webpack/lib/'],
        config: [__filename],
        // Include package.json to detect dependency changes
        tsconfig: [paths.appTsConfig, paths.appJsConfig].filter(f =>
          fs.existsSync(f)
        ),
      },
      // Cache invalidation strategy
      idleTimeout: 60000,
      idleTimeoutForInitialStore: 0,
      // Optimize for larger projects
      maxMemoryGenerations: 5,
    },
    // Bundle optimization
    optimization: {
      minimize: isEnvProduction,
      minimizer: [
        // Minify JavaScript with TerserPlugin
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
              drop_console: isEnvProduction && !process.env.KEEP_CONSOLE,
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
          // Enable parallel processing
          parallel: true,
          extractComments: false,
        }),
        // Minify CSS with CssMinimizerPlugin
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
          // Enable parallel processing
          parallel: true,
        }),
      ],
      // Enable deterministic chunk and module IDs for better caching
      chunkIds: isEnvProduction ? 'deterministic' : 'named',
      moduleIds: isEnvProduction ? 'deterministic' : 'named',
      // Chunk splitting configuration for better caching and code loading
      splitChunks: {
        chunks: 'all',
        // Cache groups for specific vendors
        cacheGroups: {
          // Separate vendor chunks for better caching
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
          // Style chunks for better loading performance
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
      // Keep the runtime chunk separated to enable long term caching
      runtimeChunk: {
        name: entrypoint => `runtime-${entrypoint.name}`,
      },
    },
    // Resolve configuration for imports
    resolve: {
      // Supported extensions
      extensions: paths.moduleFileExtensions
        .map(ext => `.${ext}`)
        .filter(ext => !ext.includes('ts') || !paths.useTypeScript),
      // Customize module resolution
      modules: ['node_modules', paths.appNodeModules].concat(
        paths.modulePaths || []
      ),
      // Aliases for cleaner imports
      alias: {
        ...aliases,
        // Support React Native Web
        'react-native': 'react-native-web',
        // Support path aliasing for exact imports
        '@': paths.appSrc,
        '@components': path.resolve(paths.appSrc, 'components'),
        '@utils': path.resolve(paths.appSrc, 'utils'),
        '@hooks': path.resolve(paths.appSrc, 'hooks'),
        '@contexts': path.resolve(paths.appSrc, 'contexts'),
        '@services': path.resolve(paths.appSrc, 'services'),
        '@pages': path.resolve(paths.appSrc, 'pages'),
        '@assets': path.resolve(paths.appSrc, 'assets'),
        '@design-system': path.resolve(paths.appSrc, 'design-system'),
      },
      // Handled fallbacks for common issues
      fallback: {
        crypto: false,
        stream: false,
        assert: false,
        http: false,
        https: false,
        os: false,
        url: false,
        path: false,
        fs: false,
      },
      plugins: [
        // Prevents importing files from outside src/
        new ModuleScopePlugin(paths.appSrc, [
          paths.appPackageJson,
          require.resolve('react-dev-utils/refreshOverlayInterop'),
        ]),
      ],
    },
    // Configure module loading
    module: {
      strictExportPresence: true,
      rules: [
        // Handle node_modules packages that contain sourcemaps
        shouldUseSourceMap && {
          enforce: 'pre',
          exclude: /@babel(?:\/|\\{1,2})runtime/,
          test: /\.(js|mjs|jsx|ts|tsx|css)$/,
          loader: require.resolve('source-map-loader'),
        },
        {
          // "oneOf" will traverse all following loaders until one will match
          oneOf: [
            // Static assets handling
            {
              test: [/\.avif$/],
              type: 'asset',
              mimetype: 'image/avif',
              parser: {
                dataUrlCondition: {
                  maxSize: imageInlineSizeLimit,
                },
              },
            },
            {
              test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
              type: 'asset',
              parser: {
                dataUrlCondition: {
                  maxSize: imageInlineSizeLimit,
                },
              },
            },
            {
              test: /\.svg$/,
              use: [
                {
                  loader: require.resolve('@svgr/webpack'),
                  options: {
                    prettier: false,
                    svgo: false,
                    svgoConfig: {
                      plugins: [{ removeViewBox: false }],
                    },
                    titleProp: true,
                    ref: true,
                  },
                },
                {
                  loader: require.resolve('file-loader'),
                  options: {
                    name: 'static/media/[name].[hash].[ext]',
                  },
                },
              ],
              issuer: {
                and: [/\.(ts|tsx|js|jsx|md|mdx)$/],
              },
            },
            // Process application JS with Babel
            {
              test: /\.(js|mjs|jsx|ts|tsx)$/,
              include: paths.appSrc,
              loader: require.resolve('babel-loader'),
              options: {
                customize: require.resolve(
                  'babel-preset-react-app/webpack-overrides'
                ),
                presets: [
                  [
                    require.resolve('babel-preset-react-app'),
                    {
                      runtime: 'automatic',
                    },
                  ],
                ],
                plugins: [
                  isEnvDevelopment &&
                    require.resolve('react-refresh/babel'),
                ].filter(Boolean),
                // This caches the Babel compilation
                cacheDirectory: true,
                cacheCompression: false,
                compact: isEnvProduction,
              },
            },
            // Process any JS outside of the app with Babel.
            // Unlike the application JS, we only compile the standard ES features.
            {
              test: /\.(js|mjs)$/,
              exclude: /@babel(?:\/|\\{1,2})runtime/,
              loader: require.resolve('babel-loader'),
              options: {
                babelrc: false,
                configFile: false,
                compact: false,
                presets: [
                  [
                    require.resolve('babel-preset-react-app/dependencies'),
                    { helpers: true },
                  ],
                ],
                cacheDirectory: true,
                cacheCompression: false,
                // Since babel-preset-react-app@7 all ECMAScript features are compiled down
                sourceMaps: shouldUseSourceMap,
                inputSourceMap: shouldUseSourceMap,
              },
            },
            // CSS handling with loaders
            {
              test: /\.css$/,
              exclude: /\.module\.css$/,
              use: getStyleLoaders({
                importLoaders: 1,
                sourceMap: isEnvProduction
                  ? shouldUseSourceMap
                  : isEnvDevelopment,
                modules: {
                  mode: 'icss',
                },
              }),
              // Don't consider CSS imports dead code even if the module is unused
              sideEffects: true,
            },
            // Support CSS Modules
            {
              test: /\.module\.css$/,
              use: getStyleLoaders({
                importLoaders: 1,
                sourceMap: isEnvProduction
                  ? shouldUseSourceMap
                  : isEnvDevelopment,
                modules: {
                  mode: 'local',
                  getLocalIdent: getCSSModuleLocalIdent,
                },
              }),
            },
            // SASS/SCSS handling with loaders
            {
              test: /\.(scss|sass)$/,
              exclude: /\.module\.(scss|sass)$/,
              use: getStyleLoaders(
                {
                  importLoaders: 3,
                  sourceMap: isEnvProduction
                    ? shouldUseSourceMap
                    : isEnvDevelopment,
                  modules: {
                    mode: 'icss',
                  },
                },
                'sass-loader'
              ),
              // Don't consider CSS imports dead code even if the module is unused
              sideEffects: true,
            },
            // Support SASS/SCSS Modules
            {
              test: /\.module\.(scss|sass)$/,
              use: getStyleLoaders(
                {
                  importLoaders: 3,
                  sourceMap: isEnvProduction
                    ? shouldUseSourceMap
                    : isEnvDevelopment,
                  modules: {
                    mode: 'local',
                    getLocalIdent: getCSSModuleLocalIdent,
                  },
                },
                'sass-loader'
              ),
            },
            // "file" loader for all other assets
            {
              exclude: [/\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
              type: 'asset/resource',
              generator: {
                filename: 'static/media/[name].[hash][ext]',
              },
            },
          ],
        },
      ].filter(Boolean),
    },
    plugins: [
      // Generate HTML file that includes references to bundled JS
      new HtmlWebpackPlugin(
        Object.assign(
          {},
          {
            inject: true,
            template: paths.appHtml,
            filename: 'index.html',
          },
          isEnvProduction
            ? {
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
              }
            : undefined
        )
      ),
      // Makes environment variables available in the HTML
      new InterpolateHtmlPlugin(HtmlWebpackPlugin, env.raw),
      // Makes environment variables available in JS
      new webpack.DefinePlugin(env.stringified),
      // Enable hot reloading in development
      isEnvDevelopment && new webpack.HotModuleReplacementPlugin(),
      // Extract CSS into separate files in production
      isEnvProduction &&
        new MiniCssExtractPlugin({
          filename: 'static/css/[name].[contenthash:8].css',
          chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
        }),
      // Create gzipped version of assets in production
      isEnvProduction &&
        new CompressionPlugin({
          algorithm: 'gzip',
          test: /\.(js|css|html|svg)$/,
          threshold: 10240,
          minRatio: 0.8,
        }),
      // Generate a bundle analyzer report in production if enabled
      isEnvProduction && process.env.ANALYZE === 'true' &&
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: 'bundle-report.html',
          openAnalyzer: false,
        }),
      // Enable profiling in production if enabled
      enableProfiling && new webpack.debug.ProfilingPlugin(),
      // Speed up builds in development with esbuild
      isEnvDevelopment && 
        new EsbuildPlugin({
          target: 'es2015',
          loader: { '.js': 'jsx' },
          legalComments: 'none',
        }),
    ].filter(Boolean),
    // Performance limits and hints
    performance: {
      maxAssetSize: 250000, // 250kb
      maxEntrypointSize: 500000, // 500kb
      hints: isEnvProduction ? 'warning' : false,
    },
  };
};

// Helper function to get CSS Module local identifier
function getCSSModuleLocalIdent(context, localIdentName, localName, options) {
  // Skip dev and node_modules assets
  if (
    context.resourcePath.includes('node_modules') ||
    context.resourcePath.includes('assets')
  ) {
    return localName;
  }
  
  // Generate reasonably named classes
  const hash = require('crypto')
    .createHash('md5')
    .update(context.resourcePath + localName)
    .digest('hex')
    .substring(0, 5);
    
  // Get relative path and folder structure for naming
  const relativePath = path
    .relative(context.rootContext, context.resourcePath)
    .replace(/\\+/g, '/')
    .replace(/\.[^./]+$/, '');
    
  const fileNameElements = relativePath
    .split('/')
    .filter(Boolean)
    .slice(-2);
    
  const componentName = fileNameElements.pop();
  
  return `${componentName}__${localName}_${hash}`;
}
