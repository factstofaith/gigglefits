#!/bin/bash
# Project Sunlight Starter Script
# This script helps users get started with the Project Sunlight optimization.

echo "============================================"
echo "🌞 Welcome to Project Sunlight 🌞"
echo "============================================"
echo "This script will help you get started with the frontend code optimization."
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Display menu options
echo "What would you like to do?"
echo "1) Run Technical Debt Audit"
echo "2) Execute Phase 1: Initial Setup & Direct Fixes"
echo "3) Execute Phase 2: Component Standardization"
echo "4) Execute Phase 3: Hook & Context Standardization"
echo "5) Execute Phase 4: Service Standardization"
echo "6) View project documentation"
echo "7) Exit"
echo ""
read -p "Enter your choice (1-7): " choice

case $choice in
    1)
        echo "📋 Running Technical Debt Audit..."
        npm run audit
        ;;
    2)
        echo "📋 Executing Phase 1: Initial Setup & Direct Fixes..."
        npm run run:phase1
        ;;
    3)
        echo "📋 Executing Phase 2: Component Standardization..."
        npm run run:phase2
        ;;
    4)
        echo "📋 Executing Phase 3: Hook & Context Standardization..."
        npm run run:phase3
        ;;
    5)
        echo "📋 Executing Phase 4: Service Standardization..."
        npm run run:phase4
        ;;
    6)
        echo "📚 Project Documentation"
        echo "============================================"
        cat README.md
        echo ""
        echo "Would you like to view the design system migration guide? (y/n)"
        read -p "> " viewMigration
        
        if [[ $viewMigration == "y" || $viewMigration == "Y" ]]; then
            cat src/design-system/MIGRATION_GUIDE.md
        fi
        
        echo ""
        echo "Would you like to view the current project status? (y/n)"
        read -p "> " viewStatus
        
        if [[ $viewStatus == "y" || $viewStatus == "Y" ]]; then
            npm run update:context
        fi
        ;;
    7)
        echo "Exiting Project Sunlight. Have a great day! 🌞"
        exit 0
        ;;
    *)
        echo "Invalid choice. Please try again."
        ./start.sh
        ;;
esac

echo ""
echo "Would you like to return to the main menu? (y/n)"
read -p "> " returnChoice

if [[ $returnChoice == "y" || $returnChoice == "Y" ]]; then
    ./start.sh
else
    echo "Thank you for using Project Sunlight! 🌞"
fi