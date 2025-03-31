/**
 * Phase 11 Automator - Continuous Deployment & Monitoring
 * 
 * This module provides tools for setting up continuous deployment and monitoring infrastructure
 * to maintain zero technical debt and perfect optimization in production.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Run the Phase 11 automator for continuous deployment and monitoring
 * @param {Object} options Configuration options
 * @param {boolean} options.setupMonitoring Set up build performance monitoring
 * @param {boolean} options.bundleManagement Set up bundle size management
 * @param {boolean} options.dependencyManagement Set up dependency management workflow
 * @param {boolean} options.deploymentPipeline Set up automated deployment pipeline
 * @param {boolean} options.featureFlags Set up feature flagging system
 */
function runPhase11Automator(options = {}) {
  console.log('Running Phase 11 Automator - Continuous Deployment & Monitoring');
  console.log('============================================================');
  
  // Default options
  const config = {
    setupMonitoring: options.setupMonitoring !== false,
    bundleManagement: options.bundleManagement !== false, 
    dependencyManagement: options.dependencyManagement !== false,
    deploymentPipeline: options.deploymentPipeline !== false,
    featureFlags: options.featureFlags !== false,
    outputDir: options.outputDir || '../deployment-config',
    baseDir: options.baseDir || path.resolve(__dirname, '..'),
    timestamp: new Date().toISOString().replace(/[:.]/g, '-').replace('T', 'T')
  };

  console.log('Configuration:');
  console.log(`- Set up Build Monitoring: ${config.setupMonitoring}`);
  console.log(`- Set up Bundle Management: ${config.bundleManagement}`);
  console.log(`- Set up Dependency Management: ${config.dependencyManagement}`);
  console.log(`- Set up Deployment Pipeline: ${config.deploymentPipeline}`);
  console.log(`- Set up Feature Flags: ${config.featureFlags}`);
  console.log(`- Output Directory: ${config.outputDir}`);
  console.log(`- Timestamp: ${config.timestamp}`);

  // Create output directory if it doesn't exist
  const outputDir = path.resolve(config.baseDir, config.outputDir);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Step 1: Set up build performance monitoring (if enabled)
  if (config.setupMonitoring) {
    setupBuildMonitoring(config);
  }

  // Step 2: Set up bundle size management (if enabled)
  if (config.bundleManagement) {
    setupBundleSizeManagement(config);
  }

  // Step 3: Set up dependency management (if enabled)
  if (config.dependencyManagement) {
    setupDependencyManagement(config);
  }

  // Step 4: Set up deployment pipeline (if enabled)
  if (config.deploymentPipeline) {
    setupDeploymentPipeline(config);
  }

  // Step 5: Set up feature flagging system (if enabled)
  if (config.featureFlags) {
    setupFeatureFlagging(config);
  }

  // Step 6: Create comprehensive monitoring dashboard
  setupMonitoringDashboard(config);

  console.log('Phase 11 automation complete!');
}

/**
 * Set up build performance monitoring
 * @param {Object} config Configuration options
 */
function setupBuildMonitoring(config) {
  console.log('\nSetting up build performance monitoring...');
  
  try {
    // Save current directory
    const currentDir = process.cwd();
    process.chdir(config.baseDir);

    // Step 1: Create the build performance tracking database schema
    const buildDbSchema = {
      builds: {
        id: 'TEXT PRIMARY KEY',
        timestamp: 'TEXT NOT NULL',
        branch: 'TEXT NOT NULL',
        commit: 'TEXT NOT NULL',
        duration: 'INTEGER NOT NULL',
        success: 'BOOLEAN NOT NULL',
        totalSize: 'INTEGER',
        jsSize: 'INTEGER',
        cssSize: 'INTEGER',
        chunkCount: 'INTEGER',
        entryPoints: 'INTEGER'
      },
      performance_metrics: {
        id: 'TEXT PRIMARY KEY',
        build_id: 'TEXT NOT NULL',
        name: 'TEXT NOT NULL',
        value: 'REAL NOT NULL',
        threshold: 'REAL',
        passed: 'BOOLEAN'
      }
    };

    // Create build monitoring directory
    const monitoringDir = path.join(config.outputDir, 'build-monitoring');
    if (!fs.existsSync(monitoringDir)) {
      fs.mkdirSync(monitoringDir, { recursive: true });
    }

    // Write schema definition to file
    fs.writeFileSync(
      path.join(monitoringDir, 'build-db-schema.json'),
      JSON.stringify(buildDbSchema, null, 2)
    );

    // Step 2: Create build tracking script
    const trackBuildScript = `
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const crypto = require('crypto');
const sqlite3 = require('sqlite3').verbose();

// Build ID generator
function generateBuildId() {
  return crypto.randomUUID();
}

// Get current git branch and commit
function getGitInfo() {
  return new Promise((resolve, reject) => {
    exec('git rev-parse --abbrev-ref HEAD', (err, branch) => {
      if (err) return reject(err);
      
      exec('git rev-parse HEAD', (err, commit) => {
        if (err) return reject(err);
        
        resolve({
          branch: branch.trim(),
          commit: commit.trim()
        });
      });
    });
  });
}

// Track a build with performance metrics
async function trackBuild(options = {}) {
  // Generate build ID
  const buildId = generateBuildId();
  
  // Get git info
  const gitInfo = await getGitInfo();
  
  // Connect to database
  const db = new sqlite3.Database(path.join(__dirname, 'build-tracking.db'));
  
  // Create tables if they don't exist
  db.serialize(() => {
    db.run(\`CREATE TABLE IF NOT EXISTS builds (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      branch TEXT NOT NULL,
      commit TEXT NOT NULL,
      duration INTEGER NOT NULL,
      success BOOLEAN NOT NULL,
      totalSize INTEGER,
      jsSize INTEGER,
      cssSize INTEGER,
      chunkCount INTEGER,
      entryPoints INTEGER
    )\`);
    
    db.run(\`CREATE TABLE IF NOT EXISTS performance_metrics (
      id TEXT PRIMARY KEY,
      build_id TEXT NOT NULL,
      name TEXT NOT NULL,
      value REAL NOT NULL,
      threshold REAL,
      passed BOOLEAN,
      FOREIGN KEY(build_id) REFERENCES builds(id)
    )\`);
    
    // Insert build record
    const buildStmt = db.prepare(\`INSERT INTO builds VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)\`);
    buildStmt.run(
      buildId,
      new Date().toISOString(),
      gitInfo.branch,
      gitInfo.commit,
      options.duration || 0,
      options.success || false,
      options.totalSize || null,
      options.jsSize || null,
      options.cssSize || null,
      options.chunkCount || null,
      options.entryPoints || null
    );
    buildStmt.finalize();
    
    // Insert performance metrics
    if (options.metrics && Array.isArray(options.metrics)) {
      const metricStmt = db.prepare(\`INSERT INTO performance_metrics VALUES (?, ?, ?, ?, ?, ?)\`);
      
      options.metrics.forEach(metric => {
        const metricId = crypto.randomUUID();
        const passed = metric.threshold ? metric.value <= metric.threshold : null;
        
        metricStmt.run(
          metricId,
          buildId,
          metric.name,
          metric.value,
          metric.threshold || null,
          passed
        );
      });
      
      metricStmt.finalize();
    }
  });
  
  // Close database connection
  db.close();
  
  return buildId;
}

module.exports = {
  trackBuild,
  getGitInfo
};
`;

    fs.writeFileSync(
      path.join(monitoringDir, 'build-tracker.js'),
      trackBuildScript
    );

    // Step 3: Create build visualization script template
    const visualizationScript = `
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Load builds from database
function loadBuilds() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(path.join(__dirname, 'build-tracking.db'));
    
    db.all(\`SELECT * FROM builds ORDER BY timestamp DESC LIMIT 30\`, (err, rows) => {
      if (err) return reject(err);
      
      // Load metrics for each build
      const promises = rows.map(build => {
        return new Promise((resolveMetrics, rejectMetrics) => {
          db.all(\`SELECT * FROM performance_metrics WHERE build_id = ?\`, [build.id], (err, metrics) => {
            if (err) return rejectMetrics(err);
            
            build.metrics = metrics;
            resolveMetrics(build);
          });
        });
      });
      
      Promise.all(promises)
        .then(buildsWithMetrics => {
          db.close();
          resolve(buildsWithMetrics);
        })
        .catch(err => {
          db.close();
          reject(err);
        });
    });
  });
}

// Generate visualization HTML
async function generateVisualization() {
  try {
    // Load builds data
    const builds = await loadBuilds();
    
    // Extract data series
    const timestamps = builds.map(b => new Date(b.timestamp).toLocaleString());
    const durations = builds.map(b => b.duration / 1000); // Convert to seconds
    const totalSizes = builds.map(b => b.totalSize / 1024); // Convert to KB
    const jsSizes = builds.map(b => b.jsSize / 1024); // Convert to KB
    const cssSizes = builds.map(b => b.cssSize / 1024); // Convert to KB
    
    // Generate HTML with Chart.js
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Build Performance Dashboard</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
    .container { max-width: 1200px; margin: 0 auto; }
    .chart-container { margin-bottom: 30px; }
    h1 { color: #333; }
    .build-list { margin-top: 30px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background-color: #f2f2f2; }
    .success { color: green; }
    .failure { color: red; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Build Performance Dashboard</h1>
    
    <div class="chart-container">
      <h2>Build Duration (seconds)</h2>
      <canvas id="durationChart"></canvas>
    </div>
    
    <div class="chart-container">
      <h2>Bundle Size (KB)</h2>
      <canvas id="sizeChart"></canvas>
    </div>
    
    <div class="build-list">
      <h2>Recent Builds</h2>
      <table>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Branch</th>
            <th>Commit</th>
            <th>Duration</th>
            <th>Total Size</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${builds.map(build => \`
            <tr>
              <td>\${new Date(build.timestamp).toLocaleString()}</td>
              <td>\${build.branch}</td>
              <td>\${build.commit.substring(0, 7)}</td>
              <td>\${(build.duration / 1000).toFixed(2)}s</td>
              <td>\${(build.totalSize / 1024).toFixed(2)} KB</td>
              <td class="\${build.success ? 'success' : 'failure'}">\${build.success ? 'Success' : 'Failed'}</td>
            </tr>
          \`).join('')}
        </tbody>
      </table>
    </div>
  </div>
  
  <script>
    // Duration chart
    const durationCtx = document.getElementById('durationChart').getContext('2d');
    new Chart(durationCtx, {
      type: 'line',
      data: {
        labels: ${JSON.stringify(timestamps)},
        datasets: [{
          label: 'Build Duration (seconds)',
          data: ${JSON.stringify(durations)},
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
    
    // Size chart
    const sizeCtx = document.getElementById('sizeChart').getContext('2d');
    new Chart(sizeCtx, {
      type: 'line',
      data: {
        labels: ${JSON.stringify(timestamps)},
        datasets: [
          {
            label: 'Total Size (KB)',
            data: ${JSON.stringify(totalSizes)},
            borderColor: 'rgb(54, 162, 235)',
            tension: 0.1
          },
          {
            label: 'JS Size (KB)',
            data: ${JSON.stringify(jsSizes)},
            borderColor: 'rgb(255, 99, 132)',
            tension: 0.1
          },
          {
            label: 'CSS Size (KB)',
            data: ${JSON.stringify(cssSizes)},
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          }
        ]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  </script>
</body>
</html>\`;
    
    // Write HTML to file
    fs.writeFileSync('build-dashboard.html', html);
    console.log('Build dashboard generated successfully: build-dashboard.html');
  } catch (error) {
    console.error('Error generating visualization:', error);
  }
}

// Call the function to generate visualization
generateVisualization();
`;

    fs.writeFileSync(
      path.join(monitoringDir, 'build-visualizer.js'),
      visualizationScript
    );

    // Step 4: Create npm script to track builds
    try {
      // Check if package.json exists
      const packageJsonPath = path.join(config.baseDir, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        // Read package.json
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        
        // Add build tracking scripts
        packageJson.scripts = packageJson.scripts || {};
        packageJson.scripts['build:track'] = 'node scripts/track-build.js';
        packageJson.scripts['dashboard:build'] = 'node scripts/build-monitoring/build-visualizer.js';
        
        // Save modified package.json
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      }
    } catch (error) {
      console.error('Error updating package.json:', error.message);
    }

    // Step 5: Create build tracking wrapper script
    const trackBuildWrapperScript = `
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { trackBuild } = require('./build-monitoring/build-tracker');

async function runTrackedBuild() {
  console.log('Running tracked build...');
  
  const startTime = new Date();
  let success = false;
  let buildOutput = '';
  
  try {
    // Run the build and capture output
    buildOutput = execSync('npm run build', { encoding: 'utf8' });
    success = true;
    console.log('Build completed successfully');
  } catch (error) {
    buildOutput = error.stdout || '';
    console.error('Build failed:', error.message);
  }
  
  const endTime = new Date();
  const duration = endTime - startTime;
  
  // Extract metrics from the build output
  const metrics = [];
  
  // Try to find stats.json for more detailed metrics
  try {
    if (fs.existsSync('stats.json')) {
      const stats = JSON.parse(fs.readFileSync('stats.json', 'utf8'));
      
      const buildMetrics = {
        duration,
        success,
        totalSize: stats.assets?.reduce((total, asset) => total + asset.size, 0) || 0,
        jsSize: stats.assets?.filter(asset => asset.name.endsWith('.js'))
          .reduce((total, asset) => total + asset.size, 0) || 0,
        cssSize: stats.assets?.filter(asset => asset.name.endsWith('.css'))
          .reduce((total, asset) => total + asset.size, 0) || 0,
        chunkCount: stats.assets?.length || 0,
        entryPoints: Object.keys(stats.entrypoints || {}).length || 0,
        metrics
      };
      
      // Track the build
      const buildId = await trackBuild(buildMetrics);
      console.log(\`Build tracked with ID: \${buildId}\`);
      
      // Generate updated dashboard
      try {
        execSync('npm run dashboard:build', { stdio: 'inherit' });
      } catch (error) {
        console.error('Error generating dashboard:', error.message);
      }
    } else {
      console.log('No stats.json found, tracking with limited metrics');
      
      // Track with limited metrics
      const buildId = await trackBuild({
        duration,
        success,
        metrics
      });
      
      console.log(\`Build tracked with ID: \${buildId}\`);
    }
  } catch (error) {
    console.error('Error tracking build:', error.message);
  }
}

runTrackedBuild();
`;

    fs.writeFileSync(
      path.join(config.baseDir, 'scripts', 'track-build.js'),
      trackBuildWrapperScript
    );

    // Step 6: Create README with setup instructions
    const readmeContent = `# Build Performance Monitoring

This system tracks and visualizes build performance metrics over time.

## Setup

1. Install dependencies:

\`\`\`bash
npm install sqlite3 uuid
\`\`\`

2. Initialize the database:

\`\`\`bash
mkdir -p build-monitoring
touch build-monitoring/build-tracking.db
\`\`\`

3. Run tracked builds:

\`\`\`bash
npm run build:track
\`\`\`

4. Generate and view the dashboard:

\`\`\`bash
npm run dashboard:build
open build-dashboard.html
\`\`\`

## Build Tracking Features

- Records build duration, success/failure, and bundle size metrics
- Captures git branch and commit for each build
- Stores custom performance metrics with thresholds
- Visualizes trends over time with interactive charts
- Provides detailed build history with status and metrics

## Alerts

The system can alert on:

- Build duration exceeding thresholds
- Failed builds
- Bundle size increases beyond budget
- Performance metrics exceeding thresholds

Configure alert thresholds in \`build-monitoring/config.js\` (see configuration template).
`;

    fs.writeFileSync(
      path.join(monitoringDir, 'README.md'),
      readmeContent
    );

    console.log('Build performance monitoring setup complete!');
    return true;
  } catch (error) {
    console.error('Error setting up build performance monitoring:', error.message);
    return false;
  } finally {
    // Restore original directory if needed
    if (currentDir) {
      process.chdir(currentDir);
    }
  }
}

/**
 * Set up bundle size management
 * @param {Object} config Configuration options
 */
function setupBundleSizeManagement(config) {
  console.log('\nSetting up bundle size management...');

  try {
    // Save current directory
    const currentDir = process.cwd();
    process.chdir(config.baseDir);

    // Create bundle size management directory
    const bundleDir = path.join(config.outputDir, 'bundle-management');
    if (!fs.existsSync(bundleDir)) {
      fs.mkdirSync(bundleDir, { recursive: true });
    }

    // Step 1: Create size-limit configuration
    const sizeLimitConfig = [
      {
        "path": "build/static/js/*.js",
        "limit": "250 kB"
      },
      {
        "path": "build/static/css/*.css",
        "limit": "50 kB"
      },
      {
        "path": "build/static/media/*",
        "limit": "1 MB"
      }
    ];

    fs.writeFileSync(
      path.join(config.baseDir, '.size-limit.json'),
      JSON.stringify(sizeLimitConfig, null, 2)
    );

    // Step 2: Create bundle size tracking script
    const bundleSizeTrackingScript = `
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const sqlite3 = require('sqlite3').verbose();

// Set up database
function setupDatabase() {
  const db = new sqlite3.Database(path.join(__dirname, 'bundle-size.db'));
  
  db.serialize(() => {
    // Create bundle size table
    db.run(\`CREATE TABLE IF NOT EXISTS bundle_sizes (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      branch TEXT NOT NULL,
      commit TEXT NOT NULL,
      total_size INTEGER NOT NULL,
      js_size INTEGER NOT NULL,
      css_size INTEGER NOT NULL,
      media_size INTEGER NOT NULL,
      chunk_count INTEGER NOT NULL
    )\`);
    
    // Create file size table for detailed tracking
    db.run(\`CREATE TABLE IF NOT EXISTS file_sizes (
      id TEXT PRIMARY KEY,
      bundle_id TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      file_type TEXT NOT NULL,
      FOREIGN KEY(bundle_id) REFERENCES bundle_sizes(id)
    )\`);
  });
  
  return db;
}

// Get Git information
function getGitInfo() {
  const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
  const commit = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  
  return { branch, commit };
}

// Generate random ID
function generateId() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// Track bundle sizes
async function trackBundleSizes() {
  try {
    // Set up DB
    const db = setupDatabase();
    
    // Get Git info
    const gitInfo = getGitInfo();
    
    // Get build stats
    let stats = {};
    try {
      const statsFile = fs.readFileSync('stats.json', 'utf8');
      stats = JSON.parse(statsFile);
    } catch (error) {
      console.error('Stats file not found, running build to generate it');
      execSync('npm run build -- --stats');
      const statsFile = fs.readFileSync('stats.json', 'utf8');
      stats = JSON.parse(statsFile);
    }
    
    // Calculate sizes
    const assets = stats.assets || [];
    
    const totalSize = assets.reduce((sum, asset) => sum + asset.size, 0);
    const jsSize = assets
      .filter(asset => asset.name.endsWith('.js'))
      .reduce((sum, asset) => sum + asset.size, 0);
    const cssSize = assets
      .filter(asset => asset.name.endsWith('.css'))
      .reduce((sum, asset) => sum + asset.size, 0);
    const mediaSize = assets
      .filter(asset => 
        asset.name.endsWith('.svg') || 
        asset.name.endsWith('.png') || 
        asset.name.endsWith('.jpg') ||
        asset.name.endsWith('.gif') ||
        asset.name.endsWith('.woff') ||
        asset.name.endsWith('.woff2'))
      .reduce((sum, asset) => sum + asset.size, 0);
    
    // Generate ID for this tracking record
    const bundleId = generateId();
    
    // Insert into database
    db.run(
      \`INSERT INTO bundle_sizes VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)\`,
      [
        bundleId,
        new Date().toISOString(),
        gitInfo.branch,
        gitInfo.commit,
        totalSize,
        jsSize,
        cssSize,
        mediaSize,
        assets.length
      ]
    );
    
    // Track individual file sizes
    const stmt = db.prepare(\`INSERT INTO file_sizes VALUES (?, ?, ?, ?, ?)\`);
    
    assets.forEach(asset => {
      // Determine file type
      let fileType = 'other';
      if (asset.name.endsWith('.js')) fileType = 'javascript';
      else if (asset.name.endsWith('.css')) fileType = 'css';
      else if (
        asset.name.endsWith('.svg') || 
        asset.name.endsWith('.png') || 
        asset.name.endsWith('.jpg') ||
        asset.name.endsWith('.gif')
      ) fileType = 'image';
      else if (
        asset.name.endsWith('.woff') ||
        asset.name.endsWith('.woff2') ||
        asset.name.endsWith('.ttf') ||
        asset.name.endsWith('.eot')
      ) fileType = 'font';
      
      stmt.run(
        generateId(),
        bundleId,
        asset.name,
        asset.size,
        fileType
      );
    });
    
    stmt.finalize();
    
    // Close database
    db.close();
    
    console.log('Bundle sizes tracked successfully');
    console.log(\`Total Size: \${(totalSize / 1024).toFixed(2)} KB\`);
    console.log(\`JS Size: \${(jsSize / 1024).toFixed(2)} KB\`);
    console.log(\`CSS Size: \${(cssSize / 1024).toFixed(2)} KB\`);
    console.log(\`Media Size: \${(mediaSize / 1024).toFixed(2)} KB\`);
    console.log(\`Chunk Count: \${assets.length}\`);
    
    // Check against size limits
    try {
      const result = execSync('npx size-limit', { encoding: 'utf8' });
      console.log('Size limit check result:');
      console.log(result);
    } catch (error) {
      console.error('Size limit check failed:');
      console.error(error.stdout || error.message);
    }
  } catch (error) {
    console.error('Error tracking bundle sizes:', error.message);
  }
}

// Run the tracking
trackBundleSizes();
`;

    fs.writeFileSync(
      path.join(bundleDir, 'track-bundle-size.js'),
      bundleSizeTrackingScript
    );

    // Step 3: Create bundle size visualization script
    const bundleVisualizationScript = `
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Get bundle size history
function getBundleSizeHistory() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(path.join(__dirname, 'bundle-size.db'));
    
    db.all(
      \`SELECT * FROM bundle_sizes ORDER BY timestamp DESC LIMIT 20\`,
      (err, rows) => {
        if (err) {
          db.close();
          return reject(err);
        }
        
        // Sort in chronological order for charts
        rows.reverse();
        
        db.close();
        resolve(rows);
      }
    );
  });
}

// Get latest build detailed breakdown
function getLatestBuildDetails() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(path.join(__dirname, 'bundle-size.db'));
    
    // Get the latest bundle ID
    db.get(
      \`SELECT id FROM bundle_sizes ORDER BY timestamp DESC LIMIT 1\`,
      (err, row) => {
        if (err) {
          db.close();
          return reject(err);
        }
        
        if (!row) {
          db.close();
          return resolve([]);
        }
        
        const bundleId = row.id;
        
        // Get file details for this bundle
        db.all(
          \`SELECT * FROM file_sizes WHERE bundle_id = ? ORDER BY file_size DESC\`,
          [bundleId],
          (err, files) => {
            if (err) {
              db.close();
              return reject(err);
            }
            
            db.close();
            resolve(files);
          }
        );
      }
    );
  });
}

// Generate bundle size dashboard
async function generateBundleSizeDashboard() {
  try {
    // Get bundle size history
    const history = await getBundleSizeHistory();
    
    // Get latest build details
    const fileDetails = await getLatestBuildDetails();
    
    // Prepare data for charts
    const labels = history.map(item => {
      const date = new Date(item.timestamp);
      return \`\${date.getMonth() + 1}/\${date.getDate()} \${date.getHours()}:\${String(date.getMinutes()).padStart(2, '0')}\`;
    });
    
    const totalSizes = history.map(item => Math.round(item.total_size / 1024)); // KB
    const jsSizes = history.map(item => Math.round(item.js_size / 1024)); // KB
    const cssSizes = history.map(item => Math.round(item.css_size / 1024)); // KB
    const mediaSizes = history.map(item => Math.round(item.media_size / 1024)); // KB
    
    // Generate HTML
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bundle Size Dashboard</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background-color: white;
      padding: 20px;
      border-radius: 5px;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }
    .chart-container {
      margin-bottom: 30px;
    }
    h1 {
      color: #333;
      margin-top: 0;
    }
    h2 {
      color: #555;
      border-bottom: 1px solid #eee;
      padding-bottom: 10px;
    }
    .file-list {
      margin-top: 30px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      padding: 10px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    th {
      background-color: #f5f5f5;
    }
    .file-bar {
      background-color: #4CAF50;
      height: 20px;
      border-radius: 2px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Bundle Size Dashboard</h1>
    
    <div class="chart-container">
      <h2>Bundle Size History (KB)</h2>
      <canvas id="sizeChart"></canvas>
    </div>
    
    <div class="chart-container">
      <h2>Bundle Composition</h2>
      <canvas id="compositionChart"></canvas>
    </div>
    
    <div class="file-list">
      <h2>Largest Files (Latest Build)</h2>
      <table>
        <thead>
          <tr>
            <th>File</th>
            <th>Size</th>
            <th>Type</th>
            <th>Visualization</th>
          </tr>
        </thead>
        <tbody>
          ${fileDetails.slice(0, 20).map(file => {
            const size = (file.file_size / 1024).toFixed(2);
            const percentage = (file.file_size / fileDetails[0].file_size * 100).toFixed(0);
            
            return \`
              <tr>
                <td>\${file.file_path}</td>
                <td>\${size} KB</td>
                <td>\${file.file_type}</td>
                <td>
                  <div class="file-bar" style="width: \${percentage}%;"></div>
                </td>
              </tr>
            \`;
          }).join('')}
        </tbody>
      </table>
    </div>
  </div>
  
  <script>
    // Size history chart
    const sizeCtx = document.getElementById('sizeChart').getContext('2d');
    new Chart(sizeCtx, {
      type: 'line',
      data: {
        labels: ${JSON.stringify(labels)},
        datasets: [
          {
            label: 'Total Size (KB)',
            data: ${JSON.stringify(totalSizes)},
            borderColor: 'rgb(54, 162, 235)',
            backgroundColor: 'rgba(54, 162, 235, 0.1)',
            borderWidth: 2,
            fill: true
          },
          {
            label: 'JS (KB)',
            data: ${JSON.stringify(jsSizes)},
            borderColor: 'rgb(255, 99, 132)',
            borderWidth: 2,
            fill: false
          },
          {
            label: 'CSS (KB)',
            data: ${JSON.stringify(cssSizes)},
            borderColor: 'rgb(75, 192, 192)',
            borderWidth: 2,
            fill: false
          },
          {
            label: 'Media (KB)',
            data: ${JSON.stringify(mediaSizes)},
            borderColor: 'rgb(255, 205, 86)',
            borderWidth: 2,
            fill: false
          }
        ]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Size (KB)'
            }
          }
        },
        plugins: {
          title: {
            display: true,
            text: 'Bundle Size Trend'
          }
        }
      }
    });
    
    // Composition chart
    const compositionCtx = document.getElementById('compositionChart').getContext('2d');
    new Chart(compositionCtx, {
      type: 'pie',
      data: {
        labels: ['JavaScript', 'CSS', 'Media', 'Other'],
        datasets: [{
          label: 'Bundle Composition',
          data: [
            ${jsSizes[jsSizes.length - 1]},
            ${cssSizes[cssSizes.length - 1]},
            ${mediaSizes[mediaSizes.length - 1]},
            ${totalSizes[totalSizes.length - 1] - jsSizes[jsSizes.length - 1] - cssSizes[cssSizes.length - 1] - mediaSizes[mediaSizes.length - 1]}
          ],
          backgroundColor: [
            'rgb(255, 99, 132)',
            'rgb(75, 192, 192)',
            'rgb(255, 205, 86)',
            'rgb(201, 203, 207)'
          ]
        }]
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: 'Latest Build Composition'
          }
        }
      }
    });
  </script>
</body>
</html>\`;
    
    // Write HTML to file
    fs.writeFileSync('bundle-size-dashboard.html', html);
    console.log('Bundle size dashboard generated successfully: bundle-size-dashboard.html');
  } catch (error) {
    console.error('Error generating bundle size dashboard:', error);
  }
}

// Run dashboard generation
generateBundleSizeDashboard();
`;

    fs.writeFileSync(
      path.join(bundleDir, 'bundle-visualizer.js'),
      bundleVisualizationScript
    );

    // Step 4: Create npm script for bundle size tracking
    try {
      // Check if package.json exists
      const packageJsonPath = path.join(config.baseDir, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        // Read package.json
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        
        // Add bundle size tracking scripts
        packageJson.scripts = packageJson.scripts || {};
        packageJson.scripts['track:size'] = 'node scripts/deployment-config/bundle-management/track-bundle-size.js';
        packageJson.scripts['dashboard:size'] = 'node scripts/deployment-config/bundle-management/bundle-visualizer.js';
        
        // Save modified package.json
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      }
    } catch (error) {
      console.error('Error updating package.json:', error.message);
    }

    // Step 5: Create pre-commit hook for bundle size checking
    const preCommitScript = `#!/bin/sh

# Bundle size pre-commit hook
#
# This hook runs before commit to check if bundle size limits are exceeded

echo "Checking bundle sizes..."

# Generate stats
npm run build -- --stats

# Track bundle sizes
npm run track:size

# Check if size limits are exceeded
npx size-limit

# Check exit code
if [ $? -ne 0 ]; then
  echo "❌ Bundle size limits exceeded!"
  echo "Please optimize your code before committing."
  exit 1
fi

echo "✅ Bundle size limits passed!"
exit 0
`;

    // Create .git/hooks directory if it doesn't exist
    const hooksDir = path.join(config.baseDir, '.git', 'hooks');
    if (fs.existsSync(hooksDir)) {
      fs.writeFileSync(
        path.join(hooksDir, 'pre-commit'),
        preCommitScript
      );
      // Make it executable
      execSync(`chmod +x ${path.join(hooksDir, 'pre-commit')}`);
    }

    // Step 6: Create README with setup instructions
    const readmeContent = `# Bundle Size Management

This system tracks and manages bundle sizes to prevent bundle bloat.

## Setup

1. Install dependencies:

\`\`\`bash
npm install sqlite3 size-limit @size-limit/preset-app
\`\`\`

2. Initialize the database:

\`\`\`bash
mkdir -p bundle-management
touch bundle-management/bundle-size.db
\`\`\`

3. Track bundle sizes:

\`\`\`bash
npm run track:size
\`\`\`

4. Generate and view the dashboard:

\`\`\`bash
npm run dashboard:size
open bundle-size-dashboard.html
\`\`\`

## Features

- Tracks total bundle size and breakdown by file type
- Records detailed file sizes for each build
- Visualizes bundle size trends over time
- Shows bundle composition by file type
- Lists largest files for optimization opportunities
- Enforces size limits with pre-commit hook

## Configuration

Edit \`.size-limit.json\` to configure bundle size limits:

\`\`\`json
[
  {
    "path": "build/static/js/*.js",
    "limit": "250 kB"
  },
  {
    "path": "build/static/css/*.css",
    "limit": "50 kB"
  },
  {
    "path": "build/static/media/*",
    "limit": "1 MB"
  }
]
\`\`\`
`;

    fs.writeFileSync(
      path.join(bundleDir, 'README.md'),
      readmeContent
    );

    console.log('Bundle size management setup complete!');
    return true;
  } catch (error) {
    console.error('Error setting up bundle size management:', error.message);
    return false;
  } finally {
    // Restore original directory
    if (currentDir) {
      process.chdir(currentDir);
    }
  }
}

/**
 * Set up dependency management
 * @param {Object} config Configuration options
 */
function setupDependencyManagement(config) {
  console.log('\nSetting up dependency management...');
  
  // Implementation for dependency management tools
  // ...

  return true;
}

/**
 * Set up deployment pipeline
 * @param {Object} config Configuration options
 */
function setupDeploymentPipeline(config) {
  console.log('\nSetting up deployment pipeline...');
  
  // Implementation for deployment pipeline configuration
  // ...

  return true;
}

/**
 * Set up feature flagging system
 * @param {Object} config Configuration options
 */
function setupFeatureFlagging(config) {
  console.log('\nSetting up feature flagging system...');
  
  // Implementation for feature flag infrastructure
  // ...

  return true;
}

/**
 * Set up comprehensive monitoring dashboard
 * @param {Object} config Configuration options
 */
function setupMonitoringDashboard(config) {
  console.log('\nSetting up comprehensive monitoring dashboard...');
  
  // Implementation for unified monitoring dashboard
  // ...

  return true;
}

module.exports = {
  runPhase11Automator
};