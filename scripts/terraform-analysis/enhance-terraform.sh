#!/bin/bash

# Terraform Enhancement Script
# This script helps organize and enhance the existing Terraform configuration
# based on the analysis results from azure-resource-analyzer.js

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TERRAFORM_DIR="${PROJECT_ROOT}/terraform"
BACKUP_DIR="${PROJECT_ROOT}/terraform/backups/$(date +%Y%m%d_%H%M%S)"

# Display banner
echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}🛠️  Terraform Enhancement Tool${NC}"
echo -e "${BLUE}=======================================${NC}"
echo "This script will help organize and enhance your Terraform configuration."
echo "Project root: ${PROJECT_ROOT}"
echo "Terraform directory: ${TERRAFORM_DIR}"

# Check for terraform
if ! command -v terraform &> /dev/null; then
    echo -e "${RED}❌ Terraform is not installed or not in PATH${NC}"
    echo "Would you like to install Terraform? (y/n)"
    read -r answer
    if [[ "$answer" == "y" ]]; then
        echo "Installing Terraform..."
        
        # Check OS and install accordingly
        if [[ "$OSTYPE" == "linux-gnu"* ]]; then
            sudo apt-get update && sudo apt-get install -y gnupg software-properties-common curl
            curl -fsSL https://apt.releases.hashicorp.com/gpg | sudo apt-key add -
            sudo apt-add-repository "deb [arch=amd64] https://apt.releases.hashicorp.com $(lsb_release -cs) main"
            sudo apt-get update && sudo apt-get install terraform
        elif [[ "$OSTYPE" == "darwin"* ]]; then
            brew tap hashicorp/tap
            brew install hashicorp/tap/terraform
        else
            echo -e "${RED}Automatic installation not supported for your OS.${NC}"
            echo "Please install Terraform manually: https://learn.hashicorp.com/tutorials/terraform/install-cli"
            exit 1
        fi
    else
        echo -e "${YELLOW}Proceeding without Terraform. Some features will be limited.${NC}"
    fi
fi

# Check for Azure CLI (needed for importing resources)
if ! command -v az &> /dev/null; then
    echo -e "${YELLOW}⚠️ Azure CLI is not installed or not in PATH${NC}"
    echo "Azure CLI is recommended for importing existing resources."
    echo "Would you like to install Azure CLI? (y/n)"
    read -r answer
    if [[ "$answer" == "y" ]]; then
        echo "Installing Azure CLI..."
        curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
    else
        echo -e "${YELLOW}Proceeding without Azure CLI. Resource import features will be limited.${NC}"
    fi
fi

# Check if user is logged into Azure
if command -v az &> /dev/null; then
    echo "Checking Azure login status..."
    if ! az account show &> /dev/null; then
        echo -e "${YELLOW}You are not logged into Azure.${NC}"
        echo "Would you like to log in to Azure now? (y/n)"
        read -r answer
        if [[ "$answer" == "y" ]]; then
            echo "Opening Azure login..."
            az login
        else
            echo -e "${YELLOW}Proceeding without Azure login. Resource import will be skipped.${NC}"
        fi
    else
        echo -e "${GREEN}✅ Already logged into Azure${NC}"
        az account show --query "{name:name, subscriptionId:id, user:user.name}" --output table
    fi
fi

# Backup current Terraform files
backup_terraform() {
    echo -e "${BLUE}Creating backup of current Terraform configuration...${NC}"
    
    # Create backup directory
    mkdir -p "${BACKUP_DIR}"
    
    # Copy all Terraform files to backup
    find "${TERRAFORM_DIR}" -name "*.tf" -o -name "*.tfvars" -o -name "*.tfstate" | while read -r file; do
        rel_path=$(realpath --relative-to="${TERRAFORM_DIR}" "${file}")
        target_dir=$(dirname "${BACKUP_DIR}/${rel_path}")
        mkdir -p "${target_dir}"
        cp "${file}" "${target_dir}/"
    done
    
    echo -e "${GREEN}✅ Backup created at: ${BACKUP_DIR}${NC}"
}

# Organize Terraform files into modules
organize_terraform_modules() {
    echo -e "${BLUE}Organizing Terraform files into modules...${NC}"
    
    # Create module directories if they don't exist
    mkdir -p "${TERRAFORM_DIR}/modules/storage"
    mkdir -p "${TERRAFORM_DIR}/modules/compute"
    mkdir -p "${TERRAFORM_DIR}/modules/data"
    mkdir -p "${TERRAFORM_DIR}/modules/networking"
    mkdir -p "${TERRAFORM_DIR}/modules/security"
    
    # Create module structure in each module directory
    for module in storage compute data networking security; do
        echo "Creating structure for ${module} module..."
        
        # Create standard files if they don't exist
        if [ ! -f "${TERRAFORM_DIR}/modules/${module}/main.tf" ]; then
            cat > "${TERRAFORM_DIR}/modules/${module}/main.tf" << EOF
# ${module^} Module
# 
# This module manages ${module} resources for the TAP Integration Platform

# Resource definitions go here
EOF
        fi
        
        if [ ! -f "${TERRAFORM_DIR}/modules/${module}/variables.tf" ]; then
            cat > "${TERRAFORM_DIR}/modules/${module}/variables.tf" << EOF
# Variables for ${module^} Module

variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
}

variable "location" {
  description = "Azure region for the resources"
  type        = string
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default     = {}
}

# Add more variables as needed
EOF
        fi
        
        if [ ! -f "${TERRAFORM_DIR}/modules/${module}/outputs.tf" ]; then
            cat > "${TERRAFORM_DIR}/modules/${module}/outputs.tf" << EOF
# Outputs for ${module^} Module

# Define outputs for resources created in this module
EOF
        fi
        
        if [ ! -f "${TERRAFORM_DIR}/modules/${module}/README.md" ]; then
            cat > "${TERRAFORM_DIR}/modules/${module}/README.md" << EOF
# ${module^} Module

This module manages ${module} resources for the TAP Integration Platform.

## Resources Created

* List of resources created by this module

## Usage

\`\`\`hcl
module "${module}" {
  source = "./modules/${module}"
  
  resource_group_name = "example-rg"
  location            = "eastus"
  tags                = {
    environment = "dev"
  }
}
\`\`\`

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| resource_group_name | Name of the resource group | \`string\` | n/a | yes |
| location | Azure region for the resources | \`string\` | n/a | yes |
| tags | Tags to apply to all resources | \`map(string)\` | \`{}\` | no |

## Outputs

| Name | Description |
|------|-------------|
| *No outputs defined yet* | |
EOF
        fi
    done
    
    echo -e "${GREEN}✅ Module structure created${NC}"
}

# Create root configuration files
create_root_configuration() {
    echo -e "${BLUE}Creating root configuration files...${NC}"
    
    # Create main.tf if it doesn't exist
    if [ ! -f "${TERRAFORM_DIR}/main.tf" ] || [ "$(wc -l < "${TERRAFORM_DIR}/main.tf")" -lt 5 ]; then
        cat > "${TERRAFORM_DIR}/main.tf" << 'EOF'
# Main Terraform configuration for TAP Integration Platform
# 
# This configuration orchestrates all resources for the application

terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
  
  # Uncomment this block to configure backend storage for state
  # backend "azurerm" {
  #   resource_group_name  = "terraform-state-rg"
  #   storage_account_name = "terraformstateXXXXX"
  #   container_name       = "tfstate"
  #   key                  = "terraform.tfstate"
  # }
}

provider "azurerm" {
  features {}
}

# Resource group
resource "azurerm_resource_group" "main" {
  name     = var.resource_group_name
  location = var.location
  tags     = var.tags
}

# Storage module
module "storage" {
  source = "./modules/storage"
  
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  tags                = var.tags
}

# Compute module
module "compute" {
  source = "./modules/compute"
  
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  tags                = var.tags
}

# Data module
module "data" {
  source = "./modules/data"
  
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  tags                = var.tags
}

# Networking module
module "networking" {
  source = "./modules/networking"
  
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  tags                = var.tags
}

# Security module
module "security" {
  source = "./modules/security"
  
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  tags                = var.tags
}
EOF
    else
        echo "main.tf already exists and has content. Not overwriting."
    fi
    
    # Create variables.tf if it doesn't exist
    if [ ! -f "${TERRAFORM_DIR}/variables.tf" ]; then
        cat > "${TERRAFORM_DIR}/variables.tf" << 'EOF'
# Variables for TAP Integration Platform infrastructure

variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
  default     = "tap-integration-platform-rg"
}

variable "location" {
  description = "Azure region for the resources"
  type        = string
  default     = "eastus"
}

variable "environment" {
  description = "Environment (dev, test, prod)"
  type        = string
  default     = "dev"
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default     = {
    environment = "dev"
    application = "tap-integration-platform"
    managed_by  = "terraform"
  }
}
EOF
    else
        echo "variables.tf already exists. Not overwriting."
    fi
    
    # Create outputs.tf if it doesn't exist
    if [ ! -f "${TERRAFORM_DIR}/outputs.tf" ]; then
        cat > "${TERRAFORM_DIR}/outputs.tf" << 'EOF'
# Outputs for TAP Integration Platform infrastructure

output "resource_group_name" {
  description = "Name of the resource group"
  value       = azurerm_resource_group.main.name
}

output "resource_group_location" {
  description = "Location of the resource group"
  value       = azurerm_resource_group.main.location
}

# Add module outputs as needed
# Example:
# output "storage_account_name" {
#   description = "Primary storage account name"
#   value       = module.storage.primary_storage_account_name
# }
EOF
    else
        echo "outputs.tf already exists. Not overwriting."
    fi
    
    # Create terraform.tfvars if it doesn't exist
    if [ ! -f "${TERRAFORM_DIR}/terraform.tfvars" ]; then
        cat > "${TERRAFORM_DIR}/terraform.tfvars" << 'EOF'
# Terraform variables for TAP Integration Platform

resource_group_name = "tap-integration-platform-rg"
location            = "eastus"
environment         = "dev"

tags = {
  environment = "dev"
  application = "tap-integration-platform"
  managed_by  = "terraform"
  created_by  = "terraform-enhancement-tool"
}
EOF
    else
        echo "terraform.tfvars already exists. Not overwriting."
    fi
    
    # Create README.md if it doesn't exist
    if [ ! -f "${TERRAFORM_DIR}/README.md" ]; then
        cat > "${TERRAFORM_DIR}/README.md" << 'EOF'
# Terraform Configuration for TAP Integration Platform

This directory contains the Terraform configuration for provisioning and managing all infrastructure resources for the TAP Integration Platform.

## Structure

```
terraform/
├── main.tf              # Main configuration and module references
├── variables.tf         # Input variables
├── outputs.tf           # Output values
├── terraform.tfvars     # Variable values
├── modules/             # Reusable modules
│   ├── storage/         # Storage resources (blob storage, etc.)
│   ├── compute/         # Compute resources (app services, functions, etc.)
│   ├── data/            # Data resources (databases, etc.)
│   ├── networking/      # Networking resources (vnets, etc.)
│   └── security/        # Security resources (key vault, etc.)
└── environments/        # Environment-specific configurations
    ├── dev/             # Development environment
    ├── test/            # Test environment
    └── prod/            # Production environment
```

## Prerequisites

- [Terraform](https://www.terraform.io/downloads.html) >= 1.0.0
- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli) >= 2.30.0
- Azure subscription
- Proper access permissions to create resources in Azure

## Usage

1. **Initialize Terraform:**

```bash
terraform init
```

2. **Plan the changes:**

```bash
terraform plan -out=tfplan
```

3. **Apply the changes:**

```bash
terraform apply tfplan
```

4. **Destroy resources when no longer needed:**

```bash
terraform destroy
```

## Environment-Specific Deployments

To deploy to a specific environment, use the appropriate directory in the `environments` folder:

```bash
cd environments/dev
terraform init
terraform apply
```

## State Management

The Terraform state is stored in Azure Blob Storage to enable team collaboration. The backend configuration is in `main.tf`.

## Contributing

1. Always run `terraform fmt` before committing changes
2. Run `terraform validate` to check for configuration errors
3. Use modules for reusable components
4. Document all variables and outputs
5. Keep sensitive information in Azure Key Vault or environment variables

## Security Notes

- Access keys and secrets are not stored in this repository
- Use managed identities where possible
- All resources should be properly secured with network rules and access controls
EOF
    else
        echo "README.md already exists. Not overwriting."
    fi
    
    # Create environments directory structure
    mkdir -p "${TERRAFORM_DIR}/environments/dev"
    mkdir -p "${TERRAFORM_DIR}/environments/test"
    mkdir -p "${TERRAFORM_DIR}/environments/prod"
    
    # Create basic environment files
    for env in dev test prod; do
        if [ ! -f "${TERRAFORM_DIR}/environments/${env}/main.tf" ]; then
            cat > "${TERRAFORM_DIR}/environments/${env}/main.tf" << EOF
# ${env^} environment configuration for TAP Integration Platform

module "tap_platform" {
  source = "../../"
  
  resource_group_name = "tap-integration-platform-${env}-rg"
  location            = "eastus"
  environment         = "${env}"
  
  tags = {
    environment = "${env}"
    application = "tap-integration-platform"
    managed_by  = "terraform"
  }
}

output "resource_group_name" {
  value = module.tap_platform.resource_group_name
}
EOF
        fi
    done
    
    echo -e "${GREEN}✅ Root configuration files created${NC}"
}

# Initialize Terraform
initialize_terraform() {
    echo -e "${BLUE}Initializing Terraform...${NC}"
    
    if command -v terraform &> /dev/null; then
        cd "${TERRAFORM_DIR}" || exit
        terraform init
        echo -e "${GREEN}✅ Terraform initialized${NC}"
    else
        echo -e "${YELLOW}Skipping Terraform initialization (terraform not installed)${NC}"
    fi
}

# Create Azure resources template file
create_azure_resources_template() {
    echo -e "${BLUE}Creating Azure resources template file...${NC}"
    
    if [ ! -f "${PROJECT_ROOT}/TERRAFORM-AZURE-RESOURCES-TEMPLATE.md" ]; then
        cat > "${PROJECT_ROOT}/TERRAFORM-AZURE-RESOURCES-TEMPLATE.md" << 'EOF'
# Azure Resources for TAP Integration Platform

This document provides a comprehensive inventory of Azure resources required for the application.

## Resource Types

### Storage Resources

| Resource Name | Type | Purpose | Configuration |
|---------------|------|---------|--------------|
| `tap{env}storage` | Storage Account | Application data storage | SKU: Standard_LRS<br>Access tier: Hot<br>Replication: LRS |
| `tap{env}container` | Storage Container | Blob storage container | Access level: private |

### Compute Resources

| Resource Name | Type | Purpose | Configuration |
|---------------|------|---------|--------------|
| `tap-{env}-app-plan` | App Service Plan | Hosting plan for web applications | SKU: B1<br>OS: Linux |
| `tap-{env}-api` | App Service | API application | Always on: true<br>HTTPS only: true |
| `tap-{env}-web` | App Service | Web application | Always on: true<br>HTTPS only: true |
| `tap-{env}-function` | Function App | Backend processing | Runtime: Node.js 14<br>Storage: `tap{env}storage` |

### Data Resources

| Resource Name | Type | Purpose | Configuration |
|---------------|------|---------|--------------|
| `tap-{env}-sql` | SQL Server | Relational database | Version: 12.0<br>Min TLS: 1.2 |
| `tap-{env}-db` | SQL Database | Application database | SKU: Basic<br>Max size: 2GB |
| `tap-{env}-cosmos` | Cosmos DB | Document database | API: SQL<br>Consistency: Session |

### Networking Resources

| Resource Name | Type | Purpose | Configuration |
|---------------|------|---------|--------------|
| `tap-{env}-vnet` | Virtual Network | Network isolation | Address space: 10.0.0.0/16 |
| `tap-{env}-subnet` | Subnet | App service subnet | Address range: 10.0.1.0/24 |
| `tap-{env}-nsg` | Network Security Group | Network security | Default rules |

### Security Resources

| Resource Name | Type | Purpose | Configuration |
|---------------|------|---------|--------------|
| `tap-{env}-kv` | Key Vault | Secret management | SKU: Standard<br>Soft delete: enabled |
| `tap-{env}-insights` | Application Insights | Application monitoring | Retention: 90 days |

## Environment Variables

| Name | Purpose | Source | Secret? |
|------|---------|--------|---------|
| `AZURE_STORAGE_CONNECTION_STRING` | Storage access | Key Vault | Yes |
| `COSMOS_DB_CONNECTION_STRING` | Database access | Key Vault | Yes |
| `SQL_CONNECTION_STRING` | SQL database access | Key Vault | Yes |
| `API_KEY` | API authentication | Key Vault | Yes |
| `APPINSIGHTS_INSTRUMENTATIONKEY` | Application monitoring | Output | Yes |

## Resource Relationships

```
┌─────────────────┐
│                 │
│  App Services   │──────┐
│                 │      │
└────────┬────────┘      │      ┌─────────────┐
         │               │      │             │
         │               └─────►│  Key Vault  │
         │                      │             │
         │                      └─────────────┘
         │
         │               ┌─────────────┐
         │               │             │
         └──────────────►│  Storage    │
                         │             │
         ┌──────────────►└─────────────┘
         │
┌────────┴────────┐      ┌─────────────┐
│                 │      │             │
│  Function App   │─────►│  Cosmos DB  │
│                 │      │             │
└────────┬────────┘      └─────────────┘
         │
         │               ┌─────────────┐
         │               │             │
         └──────────────►│  SQL DB     │
                         │             │
                         └─────────────┘
```

## Deployment Instructions

1. Create resource group
2. Deploy Key Vault first to store secrets
3. Deploy networking components
4. Deploy storage and databases
5. Deploy compute resources
6. Configure application settings and connection strings

## Security Considerations

- All services use Azure AD authentication where possible
- Web applications enforce HTTPS only
- Storage uses private endpoints for secure access
- SQL Server has firewall rules to restrict access
- Key Vault access policies limit secret access
EOF
    else
        echo "TERRAFORM-AZURE-RESOURCES-TEMPLATE.md already exists. Not overwriting."
    fi
    
    echo -e "${GREEN}✅ Azure resources template created at: ${PROJECT_ROOT}/TERRAFORM-AZURE-RESOURCES-TEMPLATE.md${NC}"
}

# Main execution
main() {
    echo -e "${BLUE}Starting Terraform enhancement process...${NC}"
    
    # Step 1: Backup current Terraform files
    backup_terraform
    
    # Step 2: Organize Terraform files into modules
    organize_terraform_modules
    
    # Step 3: Create root configuration files
    create_root_configuration
    
    # Step 4: Create Azure resources template
    create_azure_resources_template
    
    # Step 5: Initialize Terraform
    initialize_terraform
    
    echo -e "${GREEN}✅ Terraform enhancement process complete!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Run the Azure resource analyzer: ./azure-resource-analyzer.js"
    echo "2. Review and update the module configurations based on the analysis"
    echo "3. Run 'terraform validate' to check configuration"
    echo "4. Run 'terraform plan' to see the changes"
    echo "5. Fill in the TERRAFORM-AZURE-RESOURCES.md file with detailed documentation"
}

# Execute the main function
main