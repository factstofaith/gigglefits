/**
 * Shared Webpack Configuration
 */
const path = require('path');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

// Root directory
const rootDir = path.resolve(__dirname, '..');
// Source directory
const srcDir = path.resolve(rootDir, 'src');
// Build directory
const buildDir = path.resolve(rootDir, 'build');
// Distribution directory
const distDir = path.resolve(rootDir, 'dist');
// Public directory
const publicDir = path.resolve(rootDir, 'public');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  const isDevelopment = argv.mode === 'development';
  const shouldUseSourceMap = !isProduction || process.env.GENERATE_SOURCEMAP !== 'false';

  // Common function to get style loaders
  const getStyleLoaders = (cssOptions) => {
    return [
      isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
      {
        loader: 'css-loader',
        options: cssOptions,
      },
      {
        loader: 'postcss-loader',
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
              'postcss-normalize',
            ],
          },
          sourceMap: shouldUseSourceMap,
        },
      },
    ];
  };

  return {
    target: ['browserslist'],
    stats: {
      children: false, // Hide children information
      modules: false, // Hide modules information
      entrypoints: false, // Hide entrypoints information
    },
    resolve: {
      extensions: ['.js', '.jsx', '.json', '.mjs'],
      alias: {
        '@': srcDir,
        '@components': path.resolve(srcDir, 'components'),
        '@hooks': path.resolve(srcDir, 'hooks'),
        '@utils': path.resolve(srcDir, 'utils'),
        '@contexts': path.resolve(srcDir, 'contexts'),
        '@services': path.resolve(srcDir, 'services'),
        '@assets': path.resolve(srcDir, 'assets'),
      },
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
    },
    module: {
      rules: [
        // Process JS with Babel
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', {
                  useBuiltIns: 'usage',
                  corejs: 3,
                }],
                ['@babel/preset-react', {
                  runtime: 'automatic',
                }]
              ],
              plugins: [
                '@babel/plugin-proposal-class-properties',
                '@babel/plugin-transform-runtime',
              ],
              cacheDirectory: true,
              cacheCompression: false,
            },
          },
        },
        // CSS processing
        {
          test: /\.css$/,
          use: getStyleLoaders({
            importLoaders: 1,
            sourceMap: shouldUseSourceMap,
            modules: {
              mode: 'icss',
            },
          }),
          sideEffects: true,
        },
        // Images and other files
        {
          test: /\.(png|jpe?g|gif|svg|webp)$/i,
          type: 'asset',
          parser: {
            dataUrlCondition: {
              maxSize: 10 * 1024, // 10kb
            },
          },
          generator: {
            filename: 'assets/images/[name].[hash:8][ext]',
          },
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'assets/fonts/[name].[hash:8][ext]',
          },
        },
      ],
    },
    plugins: [
      new CleanWebpackPlugin(),
      new webpack.ProgressPlugin(),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
        'process.env.REACT_APP_ENV': JSON.stringify(process.env.REACT_APP_ENV || 'development'),
      }),
    ],
    optimization: {
      minimize: isProduction,
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
              drop_console: isProduction,
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
        new CssMinimizerPlugin(),
      ],
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 20,
          },
          // Material UI chunking
          mui: {
            test: /[\\/]node_modules[\\/]@mui[\\/]/,
            name: 'mui-vendors',
            chunks: 'all',
            priority: 30,
          },
          // React chunking
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom)[\\/]/,
            name: 'react-vendors',
            chunks: 'all',
            priority: 40,
          },
        },
      },
      runtimeChunk: 'single',
    },
  };
};