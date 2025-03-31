/**
 * This is a simplified webpack configuration for TAP Integration Platform
 */

const paths = require('./paths');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = function (webpackEnv) {
  const isEnvDevelopment = webpackEnv === 'development';
  const isEnvProduction = webpackEnv === 'production';

  return {
    mode: isEnvProduction ? 'production' : isEnvDevelopment && 'development',
    resolve: {
      modules: ['node_modules'],
      extensions: ['.web.js', '.mjs', '.js', '.json', '.web.jsx', '.jsx', '.ts', '.tsx', '.d.ts'],
      alias: {
        'src': paths.appSrc,
        'components': paths.appSrc + '/components',
        'contexts': paths.appSrc + '/contexts',
        'hooks': paths.appSrc + '/hooks',
        'utils': paths.appSrc + '/utils',
        'services': paths.appSrc + '/services',
        'assets': paths.appSrc + '/assets',
        'design-system': paths.appSrc + '/design-system',
      }
    },
    module: {
      rules: [
        // TypeScript files
        {
          test: /\.(ts|tsx)$/,
          include: paths.appSrc,
          use: [
            {
              loader: require.resolve('ts-loader'),
              options: {
                transpileOnly: true, // Speed up compilation in development
                compilerOptions: {
                  module: 'esnext',
                  moduleResolution: 'node',
                  resolveJsonModule: true,
                  isolatedModules: true,
                  noEmit: false, // Need to emit for webpack
                  jsx: 'react-jsx',
                }
              }
            }
          ]
        },
        // Default rule for JS/JSX files
        {
          test: /\.(js|jsx)$/,
          include: paths.appSrc,
          loader: require.resolve('babel-loader'),
          options: {
            presets: [
              [require.resolve('@babel/preset-env'), {
                targets: {
                  browsers: ['last 2 versions', 'not dead'],
                },
              }],
              require.resolve('@babel/preset-react'),
            ],
            plugins: [
              require.resolve('@babel/plugin-transform-runtime'),
              require.resolve('@babel/plugin-proposal-class-properties'),
            ],
            cacheDirectory: true,
          },
        },
        // CSS rule
        {
          test: /\.css$/,
          use: [
            require.resolve('style-loader'),
            require.resolve('css-loader'),
          ],
        },
        // Image rule
        {
          test: /\.(png|jpe?g|gif|svg)$/i,
          use: [
            {
              loader: require.resolve('url-loader'),
              options: {
                limit: 10000,
                name: 'static/media/[name].[hash:8].[ext]',
              },
            },
          ],
        },
      ],
    },
    plugins: [],
    optimization: {
      minimize: isEnvProduction,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: isEnvProduction,
            },
            output: {
              comments: false,
            },
          },
          extractComments: false,
        }),
      ],
    },
  };
};