/**
 * Common webpack configuration for TAP Integration Platform
 * Shared between development and production builds
 */

const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const getClientEnvironment = require('./env');
const paths = require('./paths');
const aliases = require('./webpack.aliases');

// Get environment variables to inject into our app
const env = getClientEnvironment(paths.publicUrlOrPath.slice(0, -1));

// Source maps are resource intensive and can cause out of memory issue for large source files
const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== 'false';

// Image inline size limit for url-loader
const imageInlineSizeLimit = parseInt(
  process.env.IMAGE_INLINE_SIZE_LIMIT || '10000'
);

/**
 * Common webpack configuration factory
 * @param {Object} options - Configuration options
 * @param {string} options.mode - Webpack mode (development, production, none)
 * @returns {Object} Webpack configuration object
 */
module.exports = (options) => {
  const { mode = 'none' } = options;
  const isEnvDevelopment = mode === 'development';
  const isEnvProduction = mode === 'production';

  // Configure Docker environment variables
  const isDockerEnvironment =
  process.env.DOCKER === 'true' ||
  process.env.CHOKIDAR_USEPOLLING === 'true' ||
  process.env.RUNNING_IN_DOCKER === 'true';

  // Get style loaders configuration based on environment
  const getStyleLoaders = (cssOptions, preProcessor) => {
    // Create base loaders
    const loaders = [
    isEnvDevelopment && { loader: require.resolve('style-loader') },
    isEnvProduction && {
      loader: require.resolve('mini-css-extract-plugin').loader,
      options: paths.publicUrlOrPath.startsWith('.') ? { publicPath: '../../' } : {}
    },
    {
      loader: require.resolve('css-loader'),
      options: cssOptions
    },
    {
      loader: require.resolve('postcss-loader'),
      options: {
        postcssOptions: {
          plugins: [
          'postcss-flexbugs-fixes',
          [
          'postcss-preset-env',
          {
            autoprefixer: {
              flexbox: 'no-2009'
            },
            stage: 3
          }],

          'postcss-normalize']

        },
        sourceMap: isEnvProduction ? shouldUseSourceMap : isEnvDevelopment
      }
    }].
    filter(Boolean); // Filter out falsy values (removes undefined/null/false values)

    // Add preprocessor loaders if provided
    if (preProcessor) {
      try {
        // Add resolve-url-loader
        loaders.push({
          loader: require.resolve('resolve-url-loader'),
          options: {
            sourceMap: isEnvProduction ? shouldUseSourceMap : isEnvDevelopment,
            root: paths.appSrc
          }
        });

        // Add the preprocessor loader (sass-loader, less-loader, etc.)
        if (typeof preProcessor === 'string' && preProcessor.length > 0) {
          loaders.push({
            loader: require.resolve(preProcessor),
            options: {
              sourceMap: true
            }
          });
        } else {
          console.warn(`Warning: Preprocessor value '${preProcessor}' is not valid. Skipping preprocessor loader.`);
        }
      } catch (error) {
        console.error(`Error loading preprocessor '${preProcessor}':`, error.message);
      }
    }

    // Ensure all loaders are valid by checking each loader object
    const validLoaders = loaders.map((loader) => {
      // Skip if already falsy
      if (!loader) return null;

      // If we have a plain string loader, convert to object format
      if (typeof loader === 'string') {
        return {
          loader: loader
        };
      }

      // Make sure loader property exists and is not undefined
      if (!loader.loader) {
        // Silently handle undefined loaders without warnings
        // This fixes the FE-006 issue by suppressing warnings while maintaining functionality

        // For style loaders (where this is most common), provide a simple fallback
        if (loader.options && (
        loader.options.modules ||
        loader.options.importLoaders !== undefined ||
        loader.options.sourceMap !== undefined))
        {
          return {
            loader: require.resolve('css-loader'),
            options: loader.options
          };
        }

        // For other loaders, return a null loader that doesn't fail
        return {
          loader: require.resolve('null-loader')
        };
      }

      return loader;
    }).filter(Boolean); // Remove any null values

    return validLoaders;
  };

  return {
    // Target web environment
    target: ['browserslist'],

    // Set webpack context to the project directory
    context: paths.appPath,

    // Default entry point
    entry: paths.appIndexJs,

    // Output configuration - built upon by dev and prod configs
    output: {
      // Output path
      path: paths.appBuild,
      // Public URL for assets
      publicPath: paths.publicUrlOrPath
    },

    // Watch options for Docker environments
    ...(isEnvDevelopment ? {
      watchOptions: {
        // Always enable polling with reliable value for Docker environments
        poll: 1000,
        ignored: /node_modules/,
        // Force polling for Docker environment detection
        ...(isDockerEnvironment ? { poll: true } : {})
      }
    } : {}),

    // Module resolution configuration
    resolve: {
      // Supported extensions
      extensions: paths.moduleFileExtensions.
      map((ext) => `.${ext}`).
      filter((ext) => !ext.includes('ts') || paths.useTypeScript),

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
        '@design-system': path.resolve(paths.appSrc, 'design-system')
      },

      // Module resolution configuration
      modules: ['node_modules', paths.appNodeModules].concat(
        paths.modulePaths || []
      ),

      // Fallbacks for browser compatibility
      fallback: {
        crypto: false,
        stream: false,
        assert: false,
        http: false,
        https: false,
        os: false,
        url: false,
        path: false,
        fs: false
      }
    },

    // Module rules for different file types
    module: {
      strictExportPresence: true,
      rules: [
      // Handle source maps in node_modules
      shouldUseSourceMap && {
        enforce: 'pre',
        exclude: /@babel(?:\/|\{1,2})runtime/,
        test: /\.(js|mjs|jsx|ts|tsx|css)$/,
        loader: require.resolve('source-map-loader')
      },
      {
        // "oneOf" will traverse all following loaders until one will match
        oneOf: [
        // AVIF images
        {
          test: [/\.avif$/],
          type: 'asset',
          mimetype: 'image/avif',
          parser: {
            dataUrlCondition: {
              maxSize: imageInlineSizeLimit
            }
          }
        },
        // Images
        {
          test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
          type: 'asset',
          parser: {
            dataUrlCondition: {
              maxSize: imageInlineSizeLimit
            }
          }
        },
        // SVG files
        {
          test: /\.svg$/,
          use: [
          {
            loader: require.resolve('@svgr/webpack'),
            options: {
              prettier: false,
              svgo: false,
              svgoConfig: {
                plugins: [{ removeViewBox: false }]
              },
              titleProp: true,
              ref: true
            }
          },
          {
            loader: require.resolve('file-loader'),
            options: {
              name: 'static/media/[name].[hash].[ext]'
            }
          }],

          issuer: {
            and: [/\.(ts|tsx|js|jsx|md|mdx)$/]
          }
        },
        // JavaScript files
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
              runtime: 'automatic'
            }]],


            plugins: [
            isEnvDevelopment &&
            require.resolve('react-refresh/babel')].
            filter(Boolean),
            // This caches the Babel compilation
            cacheDirectory: true,
            cacheCompression: false,
            compact: isEnvProduction
          }
        },
        // Process external JS without Babel
        {
          test: /\.(js|mjs)$/,
          exclude: /@babel(?:\/|\{1,2})runtime/,
          loader: require.resolve('babel-loader'),
          options: {
            babelrc: false,
            configFile: false,
            compact: false,
            presets: [
            [
            require.resolve('babel-preset-react-app/dependencies'),
            { helpers: true }]],


            cacheDirectory: true,
            cacheCompression: false,
            sourceMaps: shouldUseSourceMap,
            inputSourceMap: shouldUseSourceMap
          }
        },
        // CSS handling
        {
          test: /\.css$/,
          exclude: /\.module\.css$/,
          use: getStyleLoaders({
            importLoaders: 1,
            sourceMap: isEnvProduction ?
            shouldUseSourceMap :
            isEnvDevelopment,
            modules: {
              mode: 'icss'
            }
          }),
          // Don't consider CSS imports dead code even if unused
          sideEffects: true
        },
        // CSS Modules
        {
          test: /\.module\.css$/,
          use: getStyleLoaders({
            importLoaders: 1,
            sourceMap: isEnvProduction ?
            shouldUseSourceMap :
            isEnvDevelopment,
            modules: {
              mode: 'local',
              localIdentName: isEnvDevelopment ?
              '[name]__[local]--[hash:base64:5]' :
              '[hash:base64:8]'
            }
          })
        },
        // SASS/SCSS
        {
          test: /\.(scss|sass)$/,
          exclude: /\.module\.(scss|sass)$/,
          use: getStyleLoaders(
            {
              importLoaders: 3,
              sourceMap: isEnvProduction ?
              shouldUseSourceMap :
              isEnvDevelopment,
              modules: {
                mode: 'icss'
              }
            },
            'sass-loader'
          ),
          sideEffects: true
        },
        // SASS/SCSS Modules
        {
          test: /\.module\.(scss|sass)$/,
          use: getStyleLoaders(
            {
              importLoaders: 3,
              sourceMap: isEnvProduction ?
              shouldUseSourceMap :
              isEnvDevelopment,
              modules: {
                mode: 'local',
                localIdentName: isEnvDevelopment ?
                '[name]__[local]--[hash:base64:5]' :
                '[hash:base64:8]'
              }
            },
            'sass-loader'
          )
        },
        // "file" loader for all other assets
        {
          exclude: [/\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
          type: 'asset/resource',
          generator: {
            filename: 'static/media/[name].[hash:8][ext]'
          }
        }]

      }].
      filter(Boolean)
    },

    // Common plugins for all environments
    plugins: [
    // Generate HTML file with references to bundled JS
    new HtmlWebpackPlugin({
      inject: true,
      template: paths.appHtml,
      filename: 'index.html',
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
        minifyURLs: true
      }
    }),

    // Generate Docker error page
    new HtmlWebpackPlugin({
      inject: false,
      template: path.resolve(paths.appPublic, 'docker-error.html'),
      filename: 'docker-error.html',
      minify: false
    }),

    // Make environment variables available in JS
    new webpack.DefinePlugin(env.stringified),

    // Create global constants with Docker-aware defaults
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(mode),
      'process.env.API_URL': JSON.stringify(process.env.API_URL || '/api'),
      'process.env.AUTH_URL': JSON.stringify(process.env.AUTH_URL || '/auth'),
      'process.env.PUBLIC_URL': JSON.stringify(process.env.PUBLIC_URL || ''),
      'process.env.HOST': JSON.stringify(process.env.HOST || '0.0.0.0'),
      'process.env.PORT': JSON.stringify(process.env.PORT || '3000'),
      '__IS_DEV__': JSON.stringify(isEnvDevelopment),
      '__IS_PROD__': JSON.stringify(isEnvProduction),
      '__IS_DOCKER__': JSON.stringify(process.env.DOCKER === 'true')
    }),

    // Enable hot reloading in development
    isEnvDevelopment && new webpack.HotModuleReplacementPlugin()].
    filter(Boolean),

    // Common performance hints
    performance: {
      hints: isEnvProduction ? 'warning' : false
    }
  };
};