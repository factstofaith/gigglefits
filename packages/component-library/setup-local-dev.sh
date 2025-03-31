#!/bin/bash
# Script to set up local development for the component library

set -e

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "npm could not be found. Please install npm and try again."
    exit 1
fi

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
FRONTEND_DIR="$(dirname "$(dirname "$SCRIPT_DIR")")/frontend"

echo "Setting up local development for component library..."
echo "Component library: $SCRIPT_DIR"
echo "Frontend directory: $FRONTEND_DIR"

# Install dependencies
echo ""
echo "=== Installing dependencies ==="
echo ""
npm install

# Build the component library
echo ""
echo "=== Building component library ==="
echo ""
npm run build

# Create a local link
echo ""
echo "=== Creating npm link ==="
echo ""
npm link

# Link to frontend project if it exists
if [ -d "$FRONTEND_DIR" ]; then
    echo ""
    echo "=== Linking to frontend project ==="
    echo ""
    
    cd "$FRONTEND_DIR"
    
    # Install peer dependencies if needed
    echo "Checking for peer dependencies..."
    npm list @emotion/react || npm install --save @emotion/react
    npm list @emotion/styled || npm install --save @emotion/styled
    npm list @mui/material || npm install --save @mui/material
    
    # Link the component library
    npm link @tap-platform/component-library
    
    echo ""
    echo "Component library linked to frontend project!"
    echo ""
else
    echo ""
    echo "Frontend project not found at $FRONTEND_DIR"
    echo "You can manually link the library to your project with:"
    echo "  cd your-project"
    echo "  npm link @tap-platform/component-library"
    echo ""
fi

echo "Setup complete!"
echo ""
echo "To use the component library:"
echo "  import { Button, Typography } from '@tap-platform/component-library';"
echo ""
echo "To start Storybook:"
echo "  cd $SCRIPT_DIR"
echo "  npm run storybook"
echo ""