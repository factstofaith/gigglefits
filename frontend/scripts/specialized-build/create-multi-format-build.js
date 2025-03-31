#!/usr/bin/env node
/**
 * Multi-Format Build Generator
 * 
 * This script creates specialized build configurations for outputting
 * the package in multiple module formats (CommonJS, ESM) with proper
 * tree shaking support.
 * 
 * Usage:
 *   node create-multi-format-build.js [options]
 * 
 * Options:
 *   --dry-run             Preview changes without writing files
 *   --verbose             Show detailed information during execution
 *   --output=<dir>        Specify output directory for configs (default: config/specialized)
 *   --formats=<formats>   Comma-separated list of formats to support (default: cjs,esm)
 * 
 * Example:
 *   node create-multi-format-build.js --formats=cjs,esm,umd
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Parse command line arguments
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const VERBOSE = args.includes('--verbose');
const OUTPUT_DIR = args.find(arg => arg.startsWith('--output='))?.split('=')[1] || 'config/specialized';
const FORMATS = args.find(arg => arg.startsWith('--formats='))?.split('=')[1]?.split(',') || ['cjs', 'esm'];

// Utility functions
function log(message, type = 'info') {
  const prefix = type === 'error' ? '❌ ' : 
                 type === 'success' ? '✅ ' : 
                 type === 'warning' ? '⚠️ ' : 
                 type === 'info' ? 'ℹ️ ' : '';
  console.log(`${prefix}${message}`);
}

function logVerbose(message) {
  if (VERBOSE) {
    console.log(`   ${message}`);
  }
}

// Create output directory if it doesn't exist
if (!DRY_RUN) {
  try {
    fs.mkdirSync(path.resolve(process.cwd(), OUTPUT_DIR), { recursive: true });
  } catch (error) {
    log(`Error creating output directory: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Templates for different module formats
const configTemplates = {
  // CommonJS configuration
  cjs: `const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, '../../dist/cjs'),
    filename: 'index.js',
    libraryTarget: 'commonjs2',
    libraryExport: 'default',
  },
  module: {
    rules: [
      {
        test: /\\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-react'
            ],
            plugins: [
              '@babel/plugin-proposal-class-properties',
              '@babel/plugin-transform-runtime'
            ]
          }
        }
      },
      {
        test: /\\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\\.(png|jpg|gif|svg)$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 8192,
            name: 'static/media/[name].[hash:8].[ext]'
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      // Add any aliases from your webpack config here
    }
  },
  externals: [
    nodeExternals({
      // Allow bundling CSS and image files
      allowlist: [/\\.css$/, /\\.(png|jpg|gif|svg)$/]
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
    ],
  },
};`,

  // ES modules configuration
  esm: `const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, '../../dist/esm'),
    filename: 'index.js',
    libraryTarget: 'module',
    chunkFormat: 'module',
    module: true,
    environment: { module: true }
  },
  experiments: {
    outputModule: true,
  },
  module: {
    rules: [
      {
        test: /\\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                modules: false,
                targets: {
                  esmodules: true
                }
              }],
              '@babel/preset-react'
            ],
            plugins: [
              '@babel/plugin-proposal-class-properties',
              '@babel/plugin-transform-runtime'
            ]
          }
        }
      },
      {
        test: /\\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\\.(png|jpg|gif|svg)$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 8192,
            name: 'static/media/[name].[hash:8].[ext]'
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      // Add any aliases from your webpack config here
    }
  },
  externals: [
    nodeExternals({
      // Allow bundling CSS and image files
      allowlist: [/\\.css$/, /\\.(png|jpg|gif|svg)$/]
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
          parse: {
            ecma: 8,
          },
          compress: {
            ecma: 2020,
            warnings: false,
            comparisons: false,
            inline: 2,
          },
          mangle: {
            safari10: true,
          },
          output: {
            ecma: 2020,
            comments: false,
            ascii_only: true,
          },
        },
        parallel: true,
      }),
    ],
    usedExports: true,
    sideEffects: true,
  },
};`,

  // UMD configuration
  umd: `const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, '../../dist/umd'),
    filename: 'index.js',
    library: 'TAPComponents',
    libraryTarget: 'umd',
    globalObject: 'this',
    umdNamedDefine: true,
  },
  module: {
    rules: [
      {
        test: /\\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-react'
            ],
            plugins: [
              '@babel/plugin-proposal-class-properties',
              '@babel/plugin-transform-runtime'
            ]
          }
        }
      },
      {
        test: /\\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\\.(png|jpg|gif|svg)$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 8192,
            name: 'static/media/[name].[hash:8].[ext]'
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      // Add any aliases from your webpack config here
    }
  },
  externals: {
    react: {
      commonjs: 'react',
      commonjs2: 'react',
      amd: 'React',
      root: 'React'
    },
    'react-dom': {
      commonjs: 'react-dom',
      commonjs2: 'react-dom',
      amd: 'ReactDOM',
      root: 'ReactDOM'
    }
  },
  plugins: [
    new CleanWebpackPlugin(),
  ],
  optimization: {
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
    ],
  },
};`
};

// Template for package.json updates
const packageJsonTemplate = {
  main: "dist/cjs/index.js",
  module: "dist/esm/index.js",
  unpkg: "dist/umd/index.js",
  types: "dist/types/index.d.ts",
  exports: {
    ".": {
      require: "./dist/cjs/index.js",
      import: "./dist/esm/index.js",
      types: "./dist/types/index.d.ts"
    }
  },
  files: [
    "dist"
  ],
  scripts: {
    "build:cjs": "webpack --config config/specialized/webpack.config.cjs.js",
    "build:esm": "webpack --config config/specialized/webpack.config.esm.js",
    "build:umd": "webpack --config config/specialized/webpack.config.umd.js",
    "build:types": "tsc --emitDeclarationOnly --outDir dist/types",
    "build:all": "npm run build:cjs && npm run build:esm && npm run build:types"
  }
};

// Template for the build script
const buildScriptTemplate = `#!/usr/bin/env node
/**
 * Multi-Format Build Script
 * 
 * This script builds the package in multiple formats for optimal compatibility.
 * 
 * Usage:
 *   node build-multi-format.js [options]
 * 
 * Options:
 *   --formats=<formats>   Comma-separated list of formats to build (default: cjs,esm,types)
 *   --clean              Clean the dist directory before building
 *   --verbose            Show detailed information during build
 * 
 * Example:
 *   node build-multi-format.js --formats=cjs,esm,umd,types --clean
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Parse command line arguments
const args = process.argv.slice(2);
const VERBOSE = args.includes('--verbose');
const CLEAN = args.includes('--clean');
const FORMATS = args.find(arg => arg.startsWith('--formats='))?.split('=')[1]?.split(',') || ['cjs', 'esm', 'types'];

// Utility functions
function log(message, type = 'info') {
  const prefix = type === 'error' ? '❌ ' : 
                 type === 'success' ? '✅ ' : 
                 type === 'warning' ? '⚠️ ' : 
                 type === 'info' ? 'ℹ️ ' : '';
  console.log(\`\${prefix}\${message}\`);
}

function logVerbose(message) {
  if (VERBOSE) {
    console.log(\`   \${message}\`);
  }
}

function runCommand(command) {
  log(\`Running: \${command}\`, 'info');
  try {
    execSync(command, { stdio: VERBOSE ? 'inherit' : 'pipe' });
    return true;
  } catch (error) {
    log(\`Error running command: \${command}\`, 'error');
    if (VERBOSE) {
      console.error(error.message);
    }
    return false;
  }
}

// Clean dist directory if requested
if (CLEAN) {
  log('Cleaning dist directory...', 'info');
  try {
    fs.rmSync(path.resolve(process.cwd(), 'dist'), { recursive: true, force: true });
    log('Cleaned dist directory', 'success');
  } catch (error) {
    log(\`Error cleaning dist directory: \${error.message}\`, 'warning');
  }
}

// Build each requested format
let successCount = 0;
let failCount = 0;

for (const format of FORMATS) {
  log(\`Building \${format} format...\`, 'info');
  
  const scriptName = \`build:\${format}\`;
  const success = runCommand(\`npm run \${scriptName}\`);
  
  if (success) {
    log(\`Successfully built \${format} format\`, 'success');
    successCount++;
  } else {
    log(\`Failed to build \${format} format\`, 'error');
    failCount++;
  }
}

// Summary
log('\nBuild Summary:', 'info');
log(\`Formats requested: \${FORMATS.length}\`, 'info');
log(\`Successful builds: \${successCount}\`, 'success');
if (failCount > 0) {
  log(\`Failed builds: \${failCount}\`, 'error');
}

// Exit with appropriate code
process.exit(failCount > 0 ? 1 : 0);
`;

// Create webpack config files for each format
function createConfigFiles() {
  log(`Creating webpack config files for formats: ${FORMATS.join(', ')}`, 'info');
  
  for (const format of FORMATS) {
    if (!configTemplates[format]) {
      log(`No template available for format: ${format}`, 'warning');
      continue;
    }
    
    const fileName = `webpack.config.${format}.js`;
    const filePath = path.resolve(process.cwd(), OUTPUT_DIR, fileName);
    const content = configTemplates[format];
    
    if (DRY_RUN) {
      log(`Would create config for ${format} format`, 'info');
      logVerbose(`Would write to: ${filePath}`);
      continue;
    }
    
    try {
      fs.writeFileSync(filePath, content, 'utf8');
      log(`Created config for ${format} format`, 'success');
      logVerbose(`Written to: ${filePath}`);
    } catch (error) {
      log(`Error creating config for ${format} format: ${error.message}`, 'error');
    }
  }
}

// Create the build script
function createBuildScript() {
  log('Creating build script...', 'info');
  
  const filePath = path.resolve(process.cwd(), 'scripts/specialized-build/build-multi-format.js');
  
  if (DRY_RUN) {
    log('Would create build script', 'info');
    logVerbose(`Would write to: ${filePath}`);
    return;
  }
  
  try {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, buildScriptTemplate, 'utf8');
    fs.chmodSync(filePath, '755'); // Make executable
    log('Created build script', 'success');
    logVerbose(`Written to: ${filePath}`);
  } catch (error) {
    log(`Error creating build script: ${error.message}`, 'error');
  }
}

// Generate package.json updates
function generatePackageJsonUpdates() {
  log('Generating package.json updates...', 'info');
  
  // Filter to only include scripts for the requested formats
  const scripts = {};
  for (const format of FORMATS) {
    if (packageJsonTemplate.scripts[`build:${format}`]) {
      scripts[`build:${format}`] = packageJsonTemplate.scripts[`build:${format}`];
    }
  }
  
  // Always include the build:all script
  scripts['build:all'] = FORMATS.map(format => 
    packageJsonTemplate.scripts[`build:${format}`] ? `npm run build:${format}` : ''
  ).filter(Boolean).join(' && ');
  
  // Create the exports object based on formats
  const exports = { ".": {} };
  if (FORMATS.includes('cjs')) {
    exports["."].require = "./dist/cjs/index.js";
  }
  if (FORMATS.includes('esm')) {
    exports["."].import = "./dist/esm/index.js";
  }
  if (FORMATS.includes('types')) {
    exports["."].types = "./dist/types/index.d.ts";
  }
  
  const updates = {
    ...FORMATS.includes('cjs') && { main: packageJsonTemplate.main },
    ...FORMATS.includes('esm') && { module: packageJsonTemplate.module },
    ...FORMATS.includes('umd') && { unpkg: packageJsonTemplate.unpkg },
    ...FORMATS.includes('types') && { types: packageJsonTemplate.types },
    exports,
    files: packageJsonTemplate.files,
    scripts
  };
  
  log('Package.json updates:', 'info');
  console.log(JSON.stringify(updates, null, 2));
  
  return updates;
}

// Main execution
async function main() {
  log(`Starting multi-format build configuration ${DRY_RUN ? '(DRY RUN)' : ''}`, 'info');
  
  // Create webpack config files
  createConfigFiles();
  
  // Create build script
  createBuildScript();
  
  // Generate package.json updates
  const packageJsonUpdates = generatePackageJsonUpdates();
  
  // Summary
  log('\nSetup Complete!', 'success');
  log(`Created configs for formats: ${FORMATS.join(', ')}`, 'info');
  log(`Created build script in scripts/specialized-build/`, 'info');
  
  if (!DRY_RUN) {
    log(`\nNext steps:`, 'info');
    log(`1. Update your package.json with the changes shown above`, 'info');
    log(`2. Install required dependencies:`, 'info');
    log(`   npm install --save-dev webpack-node-externals clean-webpack-plugin`, 'info');
    log(`3. Run the build:`, 'info');
    log(`   node scripts/specialized-build/build-multi-format.js`, 'info');
  }
}

main().catch(error => {
  log(`Unhandled error: ${error.message}`, 'error');
  process.exit(1);
});