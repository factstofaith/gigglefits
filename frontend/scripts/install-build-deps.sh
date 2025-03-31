#!/bin/bash
# Script to install required dependencies for build configuration

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Installing build dependencies...${NC}"

# Install main build dependencies
echo -e "${YELLOW}Installing main build dependencies...${NC}"
npm install --save-dev cross-env customize-cra react-app-rewired webpack-bundle-analyzer terser-webpack-plugin stream-browserify buffer util dotenv dotenv-expand fs-extra chalk bfj

# Check installation
if [ $? -ne 0 ]; then
  echo -e "${RED}Error installing build dependencies. Please check npm logs.${NC}"
  exit 1
fi

# Install ESLint plugins for build configuration
echo -e "${YELLOW}Installing ESLint plugins...${NC}"
npm install --save-dev eslint-config-react-app eslint-plugin-jsx-a11y eslint-plugin-react eslint-plugin-react-hooks

# Check installation
if [ $? -ne 0 ]; then
  echo -e "${RED}Error installing ESLint plugins. Please check npm logs.${NC}"
  exit 1
fi

echo -e "${GREEN}All build dependencies installed successfully!${NC}"
echo -e "${YELLOW}You can now use the following build commands:${NC}"
echo -e "npm run build:production - Standard production build with all validations"
echo -e "npm run build:development - Development build with relaxed validation rules"
echo -e "npm run build:quick - Quick build with minimal validation"
echo -e "npm run build:analyze - Production build with bundle analyzer"