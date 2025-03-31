/**
 * Optimize images in the build
 * 
 * Reduces image file sizes using imagemin
 * Created by Project Sunlight optimization
 */

const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');
const imageminSvgo = require('imagemin-svgo');
const imageminGifsicle = require('imagemin-gifsicle');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');

// Build directory path
const buildDir = path.resolve(__dirname, '../build');

// Image directories to process
const imageDirectories = [
  path.join(buildDir, 'static/media'),
  path.join(buildDir, 'static/images'),
  path.join(buildDir, 'assets'),
];

// Make sure each directory exists before processing
const existingDirectories = imageDirectories.filter(dir => fs.existsSync(dir));

if (existingDirectories.length === 0) {
  console.log(chalk.yellow('No image directories found in the build.'));
  process.exit(0);
}

// Process each directory
async function optimizeImages() {
  console.log(chalk.bold('Optimizing images in build...'));
  let totalSaved = 0;
  let totalFiles = 0;
  
  for (const dir of existingDirectories) {
    console.log(chalk.cyan(`Processing directory: ${path.relative(buildDir, dir)}`));
    
    try {
      // Get original file sizes
      const files = fs.readdirSync(dir)
        .filter(file => /\.(jpe?g|png|gif|svg)$/i.test(file))
        .map(file => ({
          name: file,
          path: path.join(dir, file),
          originalSize: fs.statSync(path.join(dir, file)).size
        }));
      
      if (files.length === 0) {
        console.log('  No images found.');
        continue;
      }
      
      totalFiles += files.length;
      
      // Run imagemin
      await imagemin([path.join(dir, '*.{jpg,jpeg,png,gif,svg}')], {
        destination: dir,
        plugins: [
          imageminMozjpeg({ quality: 80 }),
          imageminPngquant({ quality: [0.65, 0.8] }),
          imageminSvgo({
            plugins: [
              { name: 'removeViewBox', active: false },
              { name: 'cleanupIDs', active: false },
            ],
          }),
          imageminGifsicle({ optimizationLevel: 3 }),
        ],
      });
      
      // Calculate saved sizes
      let directorySaved = 0;
      
      for (const file of files) {
        const newSize = fs.statSync(file.path).size;
        const saved = file.originalSize - newSize;
        directorySaved += saved;
        
        if (saved > 1024) {
          console.log(`  ${file.name}: ${formatBytes(file.originalSize)} → ${formatBytes(newSize)} (saved ${formatBytes(saved)})`);
        }
      }
      
      totalSaved += directorySaved;
      
      console.log(chalk.green(`  Saved ${formatBytes(directorySaved)} in this directory.`));
    } catch (error) {
      console.error(chalk.red(`  Error processing directory: ${error.message}`));
    }
  }
  
  console.log(chalk.bold(`\nTotal images processed: ${totalFiles}`));
  console.log(chalk.bold.green(`Total space saved: ${formatBytes(totalSaved)}`));
}

// Helper function to format bytes
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Run the optimization
optimizeImages().catch(error => {
  console.error(chalk.red(`Error optimizing images: ${error.message}`));
  process.exit(1);
});
