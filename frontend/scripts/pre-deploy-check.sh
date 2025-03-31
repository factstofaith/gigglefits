#!/bin/bash
# pre-deploy-check.sh
# Runs a series of checks before deployment to ensure code quality and prevent issues

set -e  # Exit immediately if a command exits with a non-zero status

echo "🔍 Running pre-deployment checks..."

# Change to project root directory
cd "$(dirname "$0")/.."

# Check for missing dependencies
echo "📦 Checking dependencies..."
npm ls uuid date-fns

# Run linting
echo "🧹 Running linter..."
npm run lint

# Run tests
echo "🧪 Running tests..."
npm run test -- --watchAll=false

# Run type checking if using TypeScript
if [ -f tsconfig.json ]; then
  echo "📝 Running type checking..."
  npm run typecheck
fi

# Build the project to ensure it compiles
echo "🔨 Building project..."
npm run build

# Check bundle size
echo "📊 Checking bundle size..."
du -h build/static/js/*.js

# Check for console.log statements (might want to remove in production)
echo "👀 Checking for console.log statements..."
grep -r "console.log" --include="*.js" --include="*.jsx" src/ || echo "✅ No console.log statements found."

# Check for missing alt attributes in images
echo "♿ Checking for accessibility issues..."
grep -r "<img" --include="*.js" --include="*.jsx" src/ | grep -v "alt=" && echo "⚠️ Images without alt attributes found." || echo "✅ All images have alt attributes."

# Create deploy info file with timestamp and git info
echo "📝 Creating deploy info..."
mkdir -p build
cat > build/deploy-info.json << EOF
{
  "version": "$(node -p "require('./package.json').version")",
  "buildTime": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "gitCommit": "$(git rev-parse HEAD)",
  "gitBranch": "$(git rev-parse --abbrev-ref HEAD)"
}
EOF

echo "✅ Pre-deployment checks completed successfully!"