#!/bin/sh
# Docker-aware build script for TAP Integration Platform Frontend
# This script handles common permission issues and ensures clean build output

# Configuration
BUILD_DIR="build"
WEBPACK_CONFIG="config/webpack.unified.js"
NODE_ENV="production"
REACT_APP_ENV="production"

# Output formatting
BOLD=""
GREEN=""
YELLOW=""
RED=""
NC=""

echo "Starting Docker-aware build process"

# 1. Create build directories with proper permissions
echo "Preparing build directories..."

# Remove existing build directory if it exists 
if [ -d "$BUILD_DIR" ]; then
  echo "Cleaning existing build directory..."
  
  # Try to remove it normally first
  rm -rf $BUILD_DIR 2>/dev/null || true
  
  # If that fails, create the directories with appropriate permissions
  if [ -d "$BUILD_DIR" ]; then
    echo "Standard cleanup failed, forcing directory creation..."
    mkdir -p $BUILD_DIR
    chmod 777 $BUILD_DIR
  fi
else
  mkdir -p $BUILD_DIR
  chmod 777 $BUILD_DIR
fi

# Create static subdirectories with proper permissions
mkdir -p "$BUILD_DIR/static/js"
chmod 777 "$BUILD_DIR/static/js"
echo "Created directory: $BUILD_DIR/static/js"

mkdir -p "$BUILD_DIR/static/css"
chmod 777 "$BUILD_DIR/static/css"
echo "Created directory: $BUILD_DIR/static/css"

mkdir -p "$BUILD_DIR/static/media"
chmod 777 "$BUILD_DIR/static/media"
echo "Created directory: $BUILD_DIR/static/media"

# 2. Verify webpack configuration is standardized
echo "Verifying webpack configuration..."
if [ -f "$WEBPACK_CONFIG" ]; then
  echo "Found webpack configuration at $WEBPACK_CONFIG"
else
  echo "Error: Webpack configuration not found at $WEBPACK_CONFIG"
  exit 1
fi

# 3. Run the build process with proper environment variables
echo "Running webpack build..."
NODE_ENV=$NODE_ENV REACT_APP_ENV=$REACT_APP_ENV DOCKER=true webpack --config $WEBPACK_CONFIG --env production

# Check if build was successful
if [ $? -eq 0 ]; then
  echo "Build completed successfully!"
else
  echo "Build failed!"
  exit 1
fi

# 4. Run the environment injection
echo "Injecting runtime environment..."
node scripts/inject-env.js

# 5. Verify build outputs
echo "Verifying build outputs..."

# Check for index.html
if [ -f "$BUILD_DIR/index.html" ]; then
  echo "Found index.html"
else
  echo "Error: index.html not found in build directory"
  exit 1
fi

# Check for JS bundles
JS_FILES=$(find "$BUILD_DIR/static/js" -name "*.js" | wc -l)
if [ $JS_FILES -gt 0 ]; then
  echo "Found $JS_FILES JavaScript bundles"
else
  echo "Error: No JavaScript bundles found"
  exit 1
fi

# Check for CSS bundles (not always present, so warn if missing)
CSS_FILES=$(find "$BUILD_DIR/static/css" -name "*.css" 2>/dev/null | wc -l)
if [ $CSS_FILES -gt 0 ]; then
  echo "Found $CSS_FILES CSS bundles"
else
  echo "Warning: No CSS bundles found. This may be expected if CSS is included in JS."
fi

echo "Build verification complete!"
echo "Build artifacts are available in the $BUILD_DIR directory"
exit 0