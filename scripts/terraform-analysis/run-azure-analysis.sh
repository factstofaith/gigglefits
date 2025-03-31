#!/bin/bash

# Run Azure Resource Analysis
# This script runs the Azure resource analyzer to inventory required Azure resources
# and update the Terraform configuration.

# Make sure the script is executable
chmod +x ./azure-resource-analyzer.js

# Display welcome message
echo "========================================"
echo "📊 TAP Integration Platform Azure Analysis"
echo "========================================"
echo "This tool will analyze the codebase for Azure resources,"
echo "audit existing Azure infrastructure, and create a"
echo "comprehensive inventory in TERRAFORM-AZURE-RESOURCES.md"
echo ""

# Check for Azure CLI installation
if ! command -v az &> /dev/null; then
    echo "⚠️ Azure CLI is not installed or not in PATH"
    echo "Would you like to install Azure CLI? (y/n)"
    read -r answer
    if [[ "$answer" == "y" ]]; then
        echo "Installing Azure CLI..."
        curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
    else
        echo "Proceeding without Azure CLI. Some features will be limited."
    fi
fi

# Check for Node.js installation
if ! command -v node &> /dev/null; then
    echo "⚠️ Node.js is not installed or not in PATH"
    echo "This script requires Node.js to run the analyzer."
    exit 1
fi

# Check if user is logged into Azure
if command -v az &> /dev/null; then
    echo "Checking Azure login status..."
    if ! az account show &> /dev/null; then
        echo "You are not logged into Azure. You can log in now or continue with limited functionality."
        echo "Would you like to log in to Azure now? (y/n)"
        read -r answer
        if [[ "$answer" == "y" ]]; then
            echo "Opening Azure login..."
            az login
        else
            echo "Proceeding without Azure login. Azure resource audit will be skipped."
        fi
    else
        echo "✅ Already logged into Azure"
        az account show --query "{name:name, subscriptionId:id, user:user.name}" --output table
    fi
fi

# Run the analyzer
echo ""
echo "Running Azure Resource Analyzer..."
node ./azure-resource-analyzer.js

# Check if the analysis was successful
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Analysis complete!"
    echo "Review the generated TERRAFORM-AZURE-RESOURCES.md file for details."
    
    # Open the file if a GUI is available
    if [[ "$OSTYPE" == "darwin"* ]]; then
        open ../../TERRAFORM-AZURE-RESOURCES.md
    elif [[ "$OSTYPE" == "linux-gnu"* ]] && command -v xdg-open &> /dev/null; then
        xdg-open ../../TERRAFORM-AZURE-RESOURCES.md
    elif [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
        start ../../TERRAFORM-AZURE-RESOURCES.md
    else
        echo "You can open the file at: $(pwd)/../../TERRAFORM-AZURE-RESOURCES.md"
    fi
else
    echo ""
    echo "❌ Analysis failed!"
    echo "Check the error messages above for details."
fi