# Terraform & Azure Infrastructure Analysis Tools

This directory contains tools for analyzing the codebase for Azure resource requirements, auditing existing Azure resources, and enhancing the Terraform configuration.

## Overview

The TAP Integration Platform uses Azure infrastructure managed by Terraform. These tools help:

1. Analyze the codebase to identify required Azure resources
2. Audit existing Azure resources in your subscription
3. Generate comprehensive documentation of all Azure resources
4. Enhance the Terraform configuration with best practices
5. Organize resources into logical modules

## Tools Included

### Azure Resource Analyzer (`azure-resource-analyzer.js`)

This tool analyzes the codebase for Azure resource references, audits existing Azure resources, and creates a comprehensive inventory in the `TERRAFORM-AZURE-RESOURCES.md` file.

Features:
- Scans codebase for Azure resource references
- Examines Terraform files for existing resource definitions
- Connects to Azure to audit existing resources (optional)
- Maps codebase references to required Azure resources
- Generates comprehensive documentation

### Terraform Enhancement Script (`enhance-terraform.sh`)

This script helps organize and enhance the existing Terraform configuration based on best practices.

Features:
- Creates a backup of the current Terraform configuration
- Organizes resources into logical modules (storage, compute, data, networking, security)
- Creates root configuration files with proper module references
- Sets up environment-specific configurations
- Initializes the Terraform configuration

### Run Azure Analysis (`run-azure-analysis.sh`)

A convenience script that runs the Azure Resource Analyzer with proper setup.

## Prerequisites

- Node.js (for the Azure Resource Analyzer)
- Azure CLI (for Azure resource auditing)
- Terraform (optional, for enhancement script)

## Usage

### Step 1: Run the Azure Resource Analysis

```bash
cd scripts/terraform-analysis
./run-azure-analysis.sh
```

This will:
1. Check for Azure CLI installation
2. Prompt for Azure login (if needed)
3. Run the Azure Resource Analyzer
4. Generate the `TERRAFORM-AZURE-RESOURCES.md` file

### Step 2: Enhance the Terraform Configuration

```bash
cd scripts/terraform-analysis
./enhance-terraform.sh
```

This will:
1. Back up your current Terraform configuration
2. Create module directories and structure
3. Create or update root configuration files
4. Initialize Terraform

### Step 3: Review and Update

1. Review the generated `TERRAFORM-AZURE-RESOURCES.md` file
2. Update the Terraform modules based on the resource analysis
3. Validate the Terraform configuration
4. Plan the infrastructure changes

## Authentication Requirements

- Azure resource auditing requires authentication with Azure CLI
- The tools will prompt you to login if needed
- You can skip Azure authentication and still use the codebase analysis features

## Output Files

- `TERRAFORM-AZURE-RESOURCES.md` - Comprehensive documentation of required Azure resources
- `TERRAFORM-AZURE-RESOURCES-TEMPLATE.md` - Template for resource documentation
- Enhanced Terraform configuration in the `/terraform` directory

## Best Practices

1. Always review the generated documentation and Terraform changes
2. Keep the TERRAFORM-AZURE-RESOURCES.md file up to date as the application evolves
3. Use Terraform modules for logical grouping of resources
4. Implement variable-driven configuration for environment differences
5. Secure sensitive information with Key Vault references