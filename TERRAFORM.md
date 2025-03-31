# TAP Integration Platform Terraform Configuration Guide

This document provides detailed information about the Terraform configuration used to deploy the TAP Integration Platform infrastructure on Azure.

## Directory Structure

The Terraform configuration is organized as follows:

```
terraform/
├── main.tf           # Main configuration file
├── variables.tf      # Variable definitions
├── outputs.tf        # Output definitions
├── backend.tf        # Backend configuration (optional)
├── modules/          # Custom modules (if any)
│   ├── app-service/  # App Service module
│   ├── database/     # Database module
│   └── monitoring/   # Monitoring module
└── environments/     # Environment-specific configurations
    ├── dev/          # Development environment
    ├── staging/      # Staging environment
    └── prod/         # Production environment
```

## Prerequisites

- Terraform v1.3.0 or higher
- Azure CLI installed and configured
- Active Azure subscription
- Service principal with Contributor role

## Azure Provider Configuration

The Azure provider is configured in `main.tf`:

```hcl
provider "azurerm" {
  features {}
  
  subscription_id = var.subscription_id
  client_id       = var.terraform_sp_client_id
  client_secret   = var.terraform_sp_client_secret
  tenant_id       = var.terraform_sp_tenant_id
}
```

## Core Resources

This section describes the core infrastructure resources required for deploying the TAP Integration Platform.

### Resource Group

The main resource group is defined as:

```hcl
resource "azurerm_resource_group" "main" {
  name     = "${var.app_name}-${var.environment}-rg"
  location = var.location
  
  tags = {
    environment = var.environment
    application = var.app_name
  }
}
```

### PostgreSQL Flexible Server

```hcl
resource "azurerm_postgresql_flexible_server" "main" {
  name                   = "${var.app_name}-${var.environment}-pg"
  resource_group_name    = azurerm_resource_group.main.name
  location               = azurerm_resource_group.main.location
  administrator_login    = var.admin_username
  administrator_password = var.admin_password
  sku_name               = var.environment == "prod" ? "B_Standard_B2s" : "B_Standard_B1ms"
  storage_mb             = var.environment == "prod" ? 65536 : 32768
  version                = "13"
  backup_retention_days  = var.environment == "prod" ? 14 : 7
  geo_redundant_backup_enabled = var.environment == "prod" ? true : false
  auto_grow_enabled      = true
  
  tags = {
    environment = var.environment
    application = var.app_name
  }
}

resource "azurerm_postgresql_flexible_server_database" "main" {
  name      = "tapdb"
  server_id = azurerm_postgresql_flexible_server.main.id
  charset   = "UTF8"
  collation = "en_US.utf8"
}

resource "azurerm_postgresql_flexible_server_configuration" "ssl_enforcement" {
  name      = "require_secure_transport"
  server_id = azurerm_postgresql_flexible_server.main.id
  value     = "ON"
}
```

### App Service Plan

```hcl
resource "azurerm_service_plan" "main" {
  name                = "${var.app_name}-${var.environment}-asp"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  os_type             = "Linux"
  sku_name            = var.environment == "prod" ? "S1" : "B1"
  
  tags = {
    environment = var.environment
    application = var.app_name
  }
}
```

### Backend App Service

```hcl
resource "azurerm_linux_web_app" "backend" {
  name                = "${var.app_name}-${var.environment}-backend"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  service_plan_id     = azurerm_service_plan.main.id
  
  site_config {
    application_stack {
      python_version = "3.10"
    }
    always_on        = true
    http2_enabled    = true
    minimum_tls_version = "1.2"
  }
  
  app_settings = {
    "SCM_DO_BUILD_DURING_DEPLOYMENT" = "true"
    "WEBSITES_PORT"                  = "8000"
    "ENVIRONMENT"                    = var.environment
    "ENABLE_SCHEDULER"               = "true"
    "CORS_ORIGINS"                   = "https://${var.app_name}-${var.environment}-frontend.azurewebsites.net"
    "DEMO_MODE"                      = var.environment == "prod" ? "false" : "true"
    "ACCESS_TOKEN_EXPIRE_MINUTES"    = "10080"
    "LOG_LEVEL"                      = var.environment == "prod" ? "WARNING" : "INFO"
    "ENABLE_PERFORMANCE_LOGGING"     = var.environment == "prod" ? "false" : "true"
    "ENABLE_SQL_LOGGING"             = var.environment == "prod" ? "false" : "true"
    "UPLOAD_FOLDER"                  = "/home/site/wwwroot/uploads"
    "DB_POOL_SIZE"                   = "5"
    "DB_MAX_OVERFLOW"                = "10"
    "AZURE_MONITOR_ENABLED"          = "true"
    "ENCRYPTION_KEY"                 = "@Microsoft.KeyVault(SecretUri=https://${var.app_name}-${var.environment}-kv.vault.azure.net/secrets/encryption-key/)"
    "ENCRYPTION_SALT"                = "@Microsoft.KeyVault(SecretUri=https://${var.app_name}-${var.environment}-kv.vault.azure.net/secrets/encryption-salt/)"
    "ENCRYPTION_KEY_ROTATION"        = "@Microsoft.KeyVault(SecretUri=https://${var.app_name}-${var.environment}-kv.vault.azure.net/secrets/encryption-key-rotation/)"
    "DATABASE_URL"                   = "@Microsoft.KeyVault(SecretUri=https://${var.app_name}-${var.environment}-kv.vault.azure.net/secrets/postgres-connection-string/)"
    "SECRET_KEY"                     = "@Microsoft.KeyVault(SecretUri=https://${var.app_name}-${var.environment}-kv.vault.azure.net/secrets/jwt-secret-key/)"
    "STORAGE_CONNECTION"             = "@Microsoft.KeyVault(SecretUri=https://${var.app_name}-${var.environment}-kv.vault.azure.net/secrets/storage-connection-string/)"
    "AZURE_MONITOR_CLIENT_ID"        = "@Microsoft.KeyVault(SecretUri=https://${var.app_name}-${var.environment}-kv.vault.azure.net/secrets/azure-monitor-client-id/)"
    "AZURE_MONITOR_CLIENT_SECRET"    = "@Microsoft.KeyVault(SecretUri=https://${var.app_name}-${var.environment}-kv.vault.azure.net/secrets/azure-monitor-client-secret/)"
    "AZURE_MONITOR_TENANT_ID"        = "@Microsoft.KeyVault(SecretUri=https://${var.app_name}-${var.environment}-kv.vault.azure.net/secrets/azure-monitor-tenant-id/)"
    "AZURE_MONITOR_SUBSCRIPTION_ID"  = "@Microsoft.KeyVault(SecretUri=https://${var.app_name}-${var.environment}-kv.vault.azure.net/secrets/azure-monitor-subscription-id/)"
    "DISABLE_MFA_FOR_TESTING"        = var.environment == "prod" ? "false" : "false"
  }
  
  identity {
    type = "SystemAssigned"
  }
  
  tags = {
    environment = var.environment
    application = var.app_name
  }
}
```

### Frontend App Service

```hcl
resource "azurerm_linux_web_app" "frontend" {
  name                = "${var.app_name}-${var.environment}-frontend"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  service_plan_id     = azurerm_service_plan.main.id
  
  site_config {
    application_stack {
      node_version = "16-lts"
    }
    always_on        = true
    http2_enabled    = true
    minimum_tls_version = "1.2"
    app_command_line = "npm install -g serve && serve -s /home/site/wwwroot -l 8080 --single"
  }
  
  app_settings = {
    "SCM_DO_BUILD_DURING_DEPLOYMENT"  = "false"
    "WEBSITE_NODE_DEFAULT_VERSION"    = "16-lts"
    "WEBSITES_PORT"                   = "8080"
    "REACT_APP_API_URL"               = "https://${var.app_name}-${var.environment}-backend.azurewebsites.net/api"
    "REACT_APP_ENVIRONMENT"           = var.environment
    "REACT_APP_DEMO_MODE"             = var.environment == "prod" ? "false" : "true"
    "REACT_APP_AZURE_MONITOR_ENABLED" = "true"
    "REACT_APP_VERSION"               = "1.0.0"
  }
  
  tags = {
    environment = var.environment
    application = var.app_name
  }
}
```

### Key Vault

```hcl
resource "azurerm_key_vault" "main" {
  name                = "${var.app_name}-${var.environment}-kv"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  tenant_id           = var.terraform_sp_tenant_id
  sku_name            = "standard"
  soft_delete_retention_days = 7
  purge_protection_enabled   = var.environment == "prod" ? true : false
  
  access_policy {
    tenant_id = var.terraform_sp_tenant_id
    object_id = var.terraform_sp_object_id
    
    key_permissions = [
      "Get", "List", "Create", "Delete", "Update"
    ]
    
    secret_permissions = [
      "Get", "List", "Set", "Delete"
    ]
  }
  
  tags = {
    environment = var.environment
    application = var.app_name
  }
}

# Add access policy for backend app's managed identity
resource "azurerm_key_vault_access_policy" "backend" {
  key_vault_id = azurerm_key_vault.main.id
  tenant_id    = var.terraform_sp_tenant_id
  object_id    = azurerm_linux_web_app.backend.identity[0].principal_id
  
  secret_permissions = [
    "Get", "List"
  ]
}
```

### Storage Account

```hcl
resource "azurerm_storage_account" "main" {
  name                     = "${replace(var.app_name, "-", "")}${var.environment}sa"
  resource_group_name      = azurerm_resource_group.main.name
  location                 = azurerm_resource_group.main.location
  account_tier             = "Standard"
  account_replication_type = var.environment == "prod" ? "GRS" : "LRS"
  min_tls_version          = "TLS1_2"
  
  blob_properties {
    cors_rule {
      allowed_origins    = ["https://${var.app_name}-${var.environment}-frontend.azurewebsites.net"]
      allowed_methods    = ["GET", "PUT", "POST"]
      allowed_headers    = ["*"]
      exposed_headers    = ["*"]
      max_age_in_seconds = 3600
    }
  }
  
  tags = {
    environment = var.environment
    application = var.app_name
  }
}

resource "azurerm_storage_container" "integration_data" {
  name                  = "integration-data"
  storage_account_name  = azurerm_storage_account.main.name
  container_access_type = "private"
}

resource "azurerm_storage_container" "samples" {
  name                  = "samples"
  storage_account_name  = azurerm_storage_account.main.name
  container_access_type = "blob"
}

resource "azurerm_storage_container" "templates" {
  name                  = "templates"
  storage_account_name  = azurerm_storage_account.main.name
  container_access_type = "private"
}
```

## Monitoring Resources

These resources are required for the Azure Admin Monitoring Dashboard.

### Log Analytics Workspace

```hcl
resource "azurerm_log_analytics_workspace" "main" {
  name                = "${var.app_name}-${var.environment}-log"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  sku                 = "PerGB2018"
  retention_in_days   = var.environment == "prod" ? 90 : 30
  
  tags = {
    environment = var.environment
    application = var.app_name
  }
}
```

### Application Insights

```hcl
resource "azurerm_application_insights" "main" {
  name                = "${var.app_name}-${var.environment}-ai"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  application_type    = "web"
  workspace_id        = azurerm_log_analytics_workspace.main.id
  
  tags = {
    environment = var.environment
    application = var.app_name
  }
}
```

### Diagnostic Settings

```hcl
resource "azurerm_monitor_diagnostic_setting" "backend" {
  name                       = "${var.app_name}-${var.environment}-backend-diag"
  target_resource_id         = azurerm_linux_web_app.backend.id
  log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id
  
  log {
    category = "AppServiceHTTPLogs"
    enabled  = true
    
    retention_policy {
      enabled = true
      days    = var.environment == "prod" ? 30 : 7
    }
  }
  
  log {
    category = "AppServiceConsoleLogs"
    enabled  = true
    
    retention_policy {
      enabled = true
      days    = var.environment == "prod" ? 30 : 7
    }
  }
  
  log {
    category = "AppServiceAppLogs"
    enabled  = true
    
    retention_policy {
      enabled = true
      days    = var.environment == "prod" ? 30 : 7
    }
  }
  
  metric {
    category = "AllMetrics"
    enabled  = true
    
    retention_policy {
      enabled = true
      days    = var.environment == "prod" ? 30 : 7
    }
  }
}

resource "azurerm_monitor_diagnostic_setting" "postgres" {
  name                       = "${var.app_name}-${var.environment}-postgres-diag"
  target_resource_id         = azurerm_postgresql_flexible_server.main.id
  log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id
  
  log {
    category = "PostgreSQLLogs"
    enabled  = true
    
    retention_policy {
      enabled = true
      days    = var.environment == "prod" ? 30 : 7
    }
  }
  
  metric {
    category = "AllMetrics"
    enabled  = true
    
    retention_policy {
      enabled = true
      days    = var.environment == "prod" ? 30 : 7
    }
  }
}
```

### Key Vault Secrets for Monitoring

```hcl
resource "azurerm_key_vault_secret" "azure_monitor_client_id" {
  name         = "azure-monitor-client-id"
  value        = var.azure_monitor_sp_client_id
  key_vault_id = azurerm_key_vault.main.id
}

resource "azurerm_key_vault_secret" "azure_monitor_client_secret" {
  name         = "azure-monitor-client-secret"
  value        = var.azure_monitor_sp_client_secret
  key_vault_id = azurerm_key_vault.main.id
}

resource "azurerm_key_vault_secret" "azure_monitor_tenant_id" {
  name         = "azure-monitor-tenant-id"
  value        = var.azure_monitor_sp_tenant_id
  key_vault_id = azurerm_key_vault.main.id
}

resource "azurerm_key_vault_secret" "azure_monitor_subscription_id" {
  name         = "azure-monitor-subscription-id"
  value        = var.subscription_id
  key_vault_id = azurerm_key_vault.main.id
}
```

## Configuration Secrets

These key vault secrets are required for the application.

```hcl
resource "azurerm_key_vault_secret" "jwt_secret_key" {
  name         = "jwt-secret-key"
  value        = var.jwt_secret_key != "" ? var.jwt_secret_key : base64encode(random_password.jwt_secret[0].result)
  key_vault_id = azurerm_key_vault.main.id
}

resource "random_password" "jwt_secret" {
  count   = var.jwt_secret_key != "" ? 0 : 1
  length  = 32
  special = true
}

resource "azurerm_key_vault_secret" "postgres_connection_string" {
  name         = "postgres-connection-string"
  value        = "postgresql://${var.admin_username}:${var.admin_password}@${azurerm_postgresql_flexible_server.main.fqdn}:5432/tapdb"
  key_vault_id = azurerm_key_vault.main.id
}

resource "azurerm_key_vault_secret" "storage_connection_string" {
  name         = "storage-connection-string"
  value        = azurerm_storage_account.main.primary_connection_string
  key_vault_id = azurerm_key_vault.main.id
}

resource "azurerm_key_vault_secret" "encryption_key" {
  name         = "encryption-key"
  value        = var.encryption_key != "" ? var.encryption_key : base64encode(random_password.encryption_key[0].result)
  key_vault_id = azurerm_key_vault.main.id
}

resource "random_password" "encryption_key" {
  count   = var.encryption_key != "" ? 0 : 1
  length  = 32
  special = true
}

resource "azurerm_key_vault_secret" "encryption_salt" {
  name         = "encryption-salt"
  value        = var.encryption_salt != "" ? var.encryption_salt : base64encode(random_password.encryption_salt[0].result)
  key_vault_id = azurerm_key_vault.main.id
}

resource "random_password" "encryption_salt" {
  count   = var.encryption_salt != "" ? 0 : 1
  length  = 16
  special = true
}

resource "azurerm_key_vault_secret" "encryption_key_rotation" {
  name         = "encryption-key-rotation"
  value        = var.encryption_key_rotation != "" ? var.encryption_key_rotation : "{\"current\": \"v1\", \"versions\": {\"v1\": \"${base64encode(random_password.encryption_key[0].result)}\"}}"
  key_vault_id = azurerm_key_vault.main.id
  depends_on   = [azurerm_key_vault_secret.encryption_key]
}
```

## Variables

The main variables defined in `variables.tf`:

```hcl
variable "subscription_id" {
  description = "The Azure subscription ID"
  type        = string
}

variable "terraform_sp_client_id" {
  description = "Service principal client ID for Terraform"
  type        = string
}

variable "terraform_sp_client_secret" {
  description = "Service principal client secret for Terraform"
  type        = string
  sensitive   = true
}

variable "terraform_sp_tenant_id" {
  description = "Service principal tenant ID for Terraform"
  type        = string
}

variable "terraform_sp_object_id" {
  description = "Service principal object ID for Terraform"
  type        = string
}

variable "environment" {
  description = "Deployment environment (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "location" {
  description = "Azure region for resources"
  type        = string
  default     = "westus"
}

variable "app_name" {
  description = "Base name for the application"
  type        = string
  default     = "tapmwui"
}

variable "admin_username" {
  description = "Admin username for database"
  type        = string
  default     = "tapadmin"
}

variable "admin_password" {
  description = "Admin password for database"
  type        = string
  sensitive   = true
}

variable "jwt_secret_key" {
  description = "JWT secret key for authentication"
  type        = string
  default     = ""
  sensitive   = true
}

variable "encryption_key" {
  description = "Encryption key for database"
  type        = string
  default     = ""
  sensitive   = true
}

variable "encryption_salt" {
  description = "Encryption salt for database"
  type        = string
  default     = ""
  sensitive   = true
}

variable "encryption_key_rotation" {
  description = "JSON configuration for encryption key rotation"
  type        = string
  default     = ""
  sensitive   = true
}

variable "azure_monitor_sp_client_id" {
  description = "Service principal client ID for Azure Monitor"
  type        = string
  default     = ""
}

variable "azure_monitor_sp_client_secret" {
  description = "Service principal client secret for Azure Monitor"
  type        = string
  default     = ""
  sensitive   = true
}

variable "azure_monitor_sp_tenant_id" {
  description = "Service principal tenant ID for Azure Monitor"
  type        = string
  default     = ""
}
```

## Outputs

The main outputs defined in `outputs.tf`:

```hcl
output "resource_group_name" {
  description = "The name of the resource group"
  value       = azurerm_resource_group.main.name
}

output "backend_url" {
  description = "The URL of the backend API"
  value       = "https://${azurerm_linux_web_app.backend.default_site_hostname}"
}

output "frontend_url" {
  description = "The URL of the frontend application"
  value       = "https://${azurerm_linux_web_app.frontend.default_site_hostname}"
}

output "database_fqdn" {
  description = "The FQDN of the PostgreSQL server"
  value       = azurerm_postgresql_flexible_server.main.fqdn
}

output "key_vault_uri" {
  description = "The URI of the Key Vault"
  value       = azurerm_key_vault.main.vault_uri
}

output "storage_account_name" {
  description = "The name of the storage account"
  value       = azurerm_storage_account.main.name
}

output "application_insights_instrumentation_key" {
  description = "Application Insights instrumentation key"
  value       = azurerm_application_insights.main.instrumentation_key
  sensitive   = true
}

output "log_analytics_workspace_id" {
  description = "Log Analytics workspace ID"
  value       = azurerm_log_analytics_workspace.main.id
}
```

## Remote State Management

For production environments, configure remote state storage:

```hcl
# File: backend.tf
terraform {
  backend "azurerm" {
    resource_group_name  = "terraform-state-rg"
    storage_account_name = "terraformstate12345"
    container_name       = "tfstate"
    key                  = "tapmwui-prod.tfstate"
  }
}
```

## Environment-Specific Configurations

Create separate `.tfvars` files for each environment:

### Development Environment

```hcl
# environments/dev/terraform.tfvars
environment = "dev"
location    = "westus"
app_name    = "tapmwui"
admin_username = "tapadmin"
admin_password = "Tap-Integration2025!"
subscription_id = "c663cd89-987a-4be8-b262-ab8343f5e054"
terraform_sp_client_id = "YOUR_SP_CLIENT_ID"
terraform_sp_client_secret = "YOUR_SP_CLIENT_SECRET"
terraform_sp_tenant_id = "YOUR_SP_TENANT_ID"
terraform_sp_object_id = "YOUR_SP_OBJECT_ID"
azure_monitor_sp_client_id = "YOUR_MONITOR_SP_CLIENT_ID"
azure_monitor_sp_client_secret = "YOUR_MONITOR_SP_CLIENT_SECRET"
azure_monitor_sp_tenant_id = "YOUR_MONITOR_SP_TENANT_ID"
```

### Production Environment

```hcl
# environments/prod/terraform.tfvars
environment = "prod"
location    = "eastus2"
app_name    = "tapmwui"
admin_username = "tapadmin"
admin_password = "UNIQUE_PROD_PASSWORD"
subscription_id = "c663cd89-987a-4be8-b262-ab8343f5e054"
terraform_sp_client_id = "YOUR_PROD_SP_CLIENT_ID"
terraform_sp_client_secret = "YOUR_PROD_SP_CLIENT_SECRET"
terraform_sp_tenant_id = "YOUR_PROD_SP_TENANT_ID"
terraform_sp_object_id = "YOUR_PROD_SP_OBJECT_ID"
azure_monitor_sp_client_id = "YOUR_PROD_MONITOR_SP_CLIENT_ID"
azure_monitor_sp_client_secret = "YOUR_PROD_MONITOR_SP_CLIENT_SECRET"
azure_monitor_sp_tenant_id = "YOUR_PROD_MONITOR_SP_TENANT_ID"
```

## Usage

To apply environment-specific configurations:

```bash
# Initialize Terraform
terraform init

# Development environment
terraform plan -var-file=environments/dev/terraform.tfvars
terraform apply -var-file=environments/dev/terraform.tfvars

# Production environment
terraform plan -var-file=environments/prod/terraform.tfvars
terraform apply -var-file=environments/prod/terraform.tfvars
```

## Service Principal Setup

For Terraform to authenticate with Azure, follow these steps:

1. Create a service principal:
   ```bash
   az ad sp create-for-rbac --name "tapmwui-terraform" --role Contributor --scopes /subscriptions/{subscription-id}/resourceGroups/tapmwui-dev-rg
   ```

2. Create a service principal for Azure Monitor:
   ```bash
   az ad sp create-for-rbac --name "tapmwui-monitoring" --role Reader --scopes /subscriptions/{subscription-id}
   ```

3. Save the credentials in terraform.tfvars files.

## Deployment Process

1. **Initialize Terraform**:
   ```bash
   cd terraform
   terraform init
   ```

2. **Validate Terraform configuration**:
   ```bash
   terraform validate
   ```

3. **Plan the deployment**:
   ```bash
   terraform plan -var-file=environments/dev/terraform.tfvars
   ```

4. **Apply the changes**:
   ```bash
   terraform apply -var-file=environments/dev/terraform.tfvars
   ```

5. **Verify the deployment**:
   ```bash
   terraform output
   ```

## Terraform Modules

For more complex deployments, consider organizing your Terraform code into modules:

### App Service Module

```hcl
# modules/app-service/main.tf
resource "azurerm_service_plan" "main" {
  name                = "${var.app_name}-${var.environment}-asp"
  resource_group_name = var.resource_group_name
  location            = var.location
  os_type             = "Linux"
  sku_name            = var.sku_name
  
  tags = var.tags
}

resource "azurerm_linux_web_app" "app" {
  name                = "${var.app_name}-${var.environment}-${var.app_type}"
  resource_group_name = var.resource_group_name
  location            = var.location
  service_plan_id     = azurerm_service_plan.main.id
  
  site_config {
    application_stack {
      dynamic "python" {
        for_each = var.app_type == "backend" ? [1] : []
        content {
          python_version = "3.10"
        }
      }
      
      dynamic "node" {
        for_each = var.app_type == "frontend" ? [1] : []
        content {
          node_version = "16-lts"
        }
      }
    }
    always_on          = true
    http2_enabled      = true
    minimum_tls_version = "1.2"
    app_command_line   = var.app_command_line
  }
  
  app_settings = var.app_settings
  
  identity {
    type = "SystemAssigned"
  }
  
  tags = var.tags
}
```

## Best Practices

1. **Use Variables**: Avoid hardcoding values directly in resource definitions
2. **Use Tags**: Apply consistent tags to all resources for better management
3. **Use Modules**: Refactor common patterns into reusable modules
4. **Secure Secrets**: Use Key Vault for sensitive information
5. **Version Control**: Store Terraform code in version control
6. **Remote State**: Use remote state storage for team collaboration
7. **Lock State**: Enable state locking to prevent concurrent modifications
8. **Validate**: Always run `terraform validate` and `terraform plan` before applying

## Security Considerations

1. **Service Principals**: Use separate service principals for different environments
2. **RBAC**: Apply the principle of least privilege to service principals
3. **Key Rotation**: Rotate service principal credentials regularly
4. **State Encryption**: Encrypt the Terraform state file
5. **Audit Logging**: Enable audit logging for all resources
6. **Network Security**:
   - Configure IP restrictions for App Services
   - Enable Azure Private Link for database access
   - Use VNet integration for internal services

## Troubleshooting

1. **Authentication Issues**:
   - Verify service principal credentials
   - Check that the service principal has appropriate permissions
   - Ensure that the tenant ID is correct

2. **Resource Provider Issues**:
   - Ensure that the required resource providers are registered
   - Run `az provider register --namespace Microsoft.Web`
   - Run `az provider register --namespace Microsoft.DBforPostgreSQL`

3. **State Issues**:
   - If state is corrupted, use `terraform state list` to view resources
   - Use `terraform state rm` to remove problematic resources
   - Use `terraform import` to re-import resources