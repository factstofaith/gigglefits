/**
 * CommonJS Module Build
 */
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
const TerserPlugin = require('terser-webpack-plugin');

// Root directory
const rootDir = path.resolve(__dirname, '..');
// Source directory
const srcDir = path.resolve(rootDir, 'src');
// Distribution directory
const distDir = path.resolve(rootDir, 'dist');

module.exports = {
  mode: 'production',
  entry: path.resolve(srcDir, 'index.js'),
  output: {
    path: path.resolve(distDir, 'cjs'),
    filename: 'index.js',
    libraryTarget: 'commonjs2',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                targets: { node: '14' },
                modules: 'commonjs'
              }],
              ['@babel/preset-react', {
                runtime: 'automatic',
              }]
            ],
            plugins: [
              '@babel/plugin-proposal-class-properties',
              '@babel/plugin-transform-runtime'
            ]
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 8192,
            name: 'assets/[name].[hash:8].[ext]'
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
    alias: {
      '@': srcDir,
      '@components': path.resolve(srcDir, 'components'),
      '@hooks': path.resolve(srcDir, 'hooks'),
      '@utils': path.resolve(srcDir, 'utils'),
      '@contexts': path.resolve(srcDir, 'contexts'),
    }
  },
  externals: [
    nodeExternals({
      allowlist: [/\.css$/, /\.(png|jpg|gif|svg)$/]
    })
  ],
  plugins: [
    new CleanWebpackPlugin(),
  ],
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          parse: { ecma: 8 },
          compress: {
            ecma: 5,
            warnings: false,
            comparisons: false,
            inline: 2,
          },
          mangle: { safari10: true },
          output: {
            ecma: 5,
            comments: false,
            ascii_only: true,
          },
        },
        parallel: true,
      }),
    ],
  },
};