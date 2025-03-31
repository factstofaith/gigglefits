######################################################
# Azure Infrastructure for TAP Integration Platform
######################################################

# Configure the Azure provider
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
  
  # Using local backend for simplicity in development
  # To use an Azure backend, this section would need to be configured:
  # backend "azurerm" {
  #   resource_group_name  = "terraform-state"
  #   storage_account_name = "tapinfratfstate"
  #   container_name       = "tfstate"
  #   key                  = "tap.terraform.tfstate"
  # }
}

provider "azurerm" {
  # Explicitly set the subscription ID (requires az login first)
  subscription_id = var.subscription_id
  
  # Skip provider registration to avoid requiring Owner permissions
  skip_provider_registration = true
  
  features {
    resource_group {
      prevent_deletion_if_contains_resources = false
    }
    key_vault {
      purge_soft_delete_on_destroy = true
    }
  }
}

# Variables
variable "environment" {
  description = "Environment name (dev, test, prod)"
  default     = "dev"
}

variable "location" {
  description = "Azure region for resources"
  default     = "eastus"
}

variable "app_name" {
  description = "Application name used for naming resources"
  default     = "tapint"
}

variable "admin_username" {
  description = "Admin username for services"
  default     = "tapadmin"
}

variable "admin_password" {
  description = "Admin password for services"
  sensitive   = true
}

variable "subscription_id" {
  description = "Azure subscription ID to deploy resources to"
  type        = string
}

# Local variables for naming and tagging
locals {
  resource_prefix = "${var.app_name}-${var.environment}"
  common_tags = {
    Environment = var.environment
    Project     = "TAP Integration Platform"
    ManagedBy   = "Terraform"
  }
}

######################################################
# Resource Group
######################################################

resource "azurerm_resource_group" "main" {
  name     = "${local.resource_prefix}-rg"
  location = var.location
  tags     = local.common_tags
}

######################################################
# Virtual Network
######################################################

resource "azurerm_virtual_network" "main" {
  name                = "${local.resource_prefix}-vnet"
  address_space       = ["10.0.0.0/16"]
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  tags                = local.common_tags
}

resource "azurerm_subnet" "frontend" {
  name                 = "frontend-subnet"
  resource_group_name  = azurerm_resource_group.main.name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = ["10.0.1.0/24"]
  service_endpoints    = ["Microsoft.Storage", "Microsoft.KeyVault", "Microsoft.Sql"]
}

resource "azurerm_subnet" "backend" {
  name                 = "backend-subnet"
  resource_group_name  = azurerm_resource_group.main.name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = ["10.0.2.0/24"]
  service_endpoints    = ["Microsoft.Storage", "Microsoft.KeyVault", "Microsoft.Sql"]
}

resource "azurerm_subnet" "database" {
  name                 = "database-subnet"
  resource_group_name  = azurerm_resource_group.main.name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = ["10.0.3.0/24"]
  service_endpoints    = ["Microsoft.Sql"]
  delegation {
    name = "fs"
    service_delegation {
      name = "Microsoft.DBforPostgreSQL/flexibleServers"
      actions = [
        "Microsoft.Network/virtualNetworks/subnets/join/action",
      ]
    }
  }
}

######################################################
# Network Security Groups
######################################################

resource "azurerm_network_security_group" "frontend" {
  name                = "${local.resource_prefix}-frontend-nsg"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  tags                = local.common_tags

  security_rule {
    name                       = "allow-http"
    priority                   = 100
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "80"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }

  security_rule {
    name                       = "allow-https"
    priority                   = 110
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "443"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }
}

resource "azurerm_network_security_group" "backend" {
  name                = "${local.resource_prefix}-backend-nsg"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  tags                = local.common_tags

  security_rule {
    name                       = "allow-api"
    priority                   = 100
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "8000"
    source_address_prefix      = "10.0.1.0/24" # Only from frontend subnet
    destination_address_prefix = "*"
  }
}

resource "azurerm_subnet_network_security_group_association" "frontend" {
  subnet_id                 = azurerm_subnet.frontend.id
  network_security_group_id = azurerm_network_security_group.frontend.id
}

resource "azurerm_subnet_network_security_group_association" "backend" {
  subnet_id                 = azurerm_subnet.backend.id
  network_security_group_id = azurerm_network_security_group.backend.id
}

######################################################
# PostgreSQL Database
######################################################

resource "azurerm_private_dns_zone" "postgres" {
  name                = "tapint.postgres.database.azure.com"
  resource_group_name = azurerm_resource_group.main.name
  tags                = local.common_tags
}

resource "azurerm_private_dns_zone_virtual_network_link" "postgres" {
  name                  = "postgres-vnet-link"
  private_dns_zone_name = azurerm_private_dns_zone.postgres.name
  virtual_network_id    = azurerm_virtual_network.main.id
  resource_group_name   = azurerm_resource_group.main.name
  tags                  = local.common_tags
}

resource "azurerm_postgresql_flexible_server" "main" {
  name                   = "${local.resource_prefix}-pg"
  resource_group_name    = azurerm_resource_group.main.name
  location               = azurerm_resource_group.main.location
  version                = "14"
  administrator_login    = var.admin_username
  administrator_password = var.admin_password
  storage_mb             = 32768
  sku_name               = "B_Standard_B1ms"
  backup_retention_days  = 7
  
  # Use public network access for simplicity in development
  public_network_access_enabled = true
  
  tags                   = local.common_tags
}

resource "azurerm_postgresql_flexible_server_database" "tap" {
  name      = "tapdb"
  server_id = azurerm_postgresql_flexible_server.main.id
  charset   = "UTF8"
  collation = "en_US.utf8"
}

resource "azurerm_postgresql_flexible_server_configuration" "main" {
  name      = "azure.extensions"
  server_id = azurerm_postgresql_flexible_server.main.id
  value     = "UUID-OSSP"
}

######################################################
# Storage Account for Blob Storage
######################################################

resource "azurerm_storage_account" "main" {
  name                     = "${var.app_name}${var.environment}storage"
  resource_group_name      = azurerm_resource_group.main.name
  location                 = azurerm_resource_group.main.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
  account_kind             = "StorageV2"
  is_hns_enabled           = false
  min_tls_version          = "TLS1_2"
  
  blob_properties {
    cors_rule {
      allowed_headers    = ["*"]
      allowed_methods    = ["GET", "POST", "PUT", "DELETE", "HEAD"]
      allowed_origins    = ["*"]
      exposed_headers    = ["*"]
      max_age_in_seconds = 3600
    }
    
    versioning_enabled = true
    
    delete_retention_policy {
      days = 7
    }
  }
  
  tags = local.common_tags
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

resource "azurerm_storage_container" "documentation" {
  name                  = "documentation"
  storage_account_name  = azurerm_storage_account.main.name
  container_access_type = "blob"
}

######################################################
# Key Vault for secrets management
######################################################

data "azurerm_client_config" "current" {}

resource "azurerm_key_vault" "main" {
  name                       = "${local.resource_prefix}-kv"
  location                   = azurerm_resource_group.main.location
  resource_group_name        = azurerm_resource_group.main.name
  tenant_id                  = data.azurerm_client_config.current.tenant_id
  soft_delete_retention_days = 7
  purge_protection_enabled   = false
  sku_name                   = "standard"
  
  access_policy {
    tenant_id = data.azurerm_client_config.current.tenant_id
    object_id = data.azurerm_client_config.current.object_id
    
    secret_permissions = [
      "Get", "List", "Set", "Delete", "Purge", "Recover"
    ]
  }
  
  network_acls {
    default_action = "Allow"
    bypass         = "AzureServices"
  }
  
  tags = local.common_tags
}

# Store storage connection string as a secret
resource "azurerm_key_vault_secret" "storage_connection" {
  name         = "storage-connection-string"
  value        = azurerm_storage_account.main.primary_connection_string
  key_vault_id = azurerm_key_vault.main.id
}

# Store database connection string as a secret
resource "azurerm_key_vault_secret" "postgres_connection" {
  name         = "postgres-connection-string"
  value        = "postgresql://${var.admin_username}:${var.admin_password}@${azurerm_postgresql_flexible_server.main.fqdn}:5432/${azurerm_postgresql_flexible_server_database.tap.name}"
  key_vault_id = azurerm_key_vault.main.id
}

# Store JWT secret for authentication
resource "random_password" "jwt_secret" {
  length           = 32
  special          = true
  override_special = "_%@"
}

resource "azurerm_key_vault_secret" "jwt_secret" {
  name         = "jwt-secret-key"
  value        = random_password.jwt_secret.result
  key_vault_id = azurerm_key_vault.main.id
}

######################################################
# App Service for Backend API
######################################################

resource "azurerm_service_plan" "backend" {
  name                = "${local.resource_prefix}-backend-plan"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  os_type             = "Linux"
  sku_name            = "F1"
  tags                = local.common_tags
}

resource "azurerm_linux_web_app" "backend" {
  name                = "${local.resource_prefix}-backend"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  service_plan_id     = azurerm_service_plan.backend.id
  
  site_config {
    application_stack {
      python_version = "3.10"
    }
    
    always_on = true
    
    cors {
      allowed_origins = ["https://${local.resource_prefix}-frontend.azurewebsites.net"]
    }
    
    minimum_tls_version = "1.2"
    ftps_state = "Disabled"
    
    # Security headers through web.config
    app_command_line = "startup.sh"
  }
  
  app_settings = {
    "SCM_DO_BUILD_DURING_DEPLOYMENT" = "true"
    "WEBSITES_PORT"                  = "8000"
    "DATABASE_URL"                   = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.postgres_connection.versionless_id})"
    "STORAGE_CONNECTION"             = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.storage_connection.versionless_id})"
    "ENVIRONMENT"                    = var.environment
    "ENABLE_SCHEDULER"               = "true"
    "CORS_ORIGINS"                   = "https://${local.resource_prefix}-frontend.azurewebsites.net"
    "DEMO_MODE"                      = "true"  # Enable demo mode for development
    "SECRET_KEY"                     = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.jwt_secret.versionless_id})"
    "ACCESS_TOKEN_EXPIRE_MINUTES"    = "10080"  # 7 days
    "LOG_LEVEL"                      = "INFO"
    "ENABLE_PERFORMANCE_LOGGING"     = "true"
    "ENABLE_SQL_LOGGING"             = "true"  # Useful for development debugging
    "UPLOAD_FOLDER"                  = "/home/site/wwwroot/uploads"
    "DB_POOL_SIZE"                   = "5"
    "DB_MAX_OVERFLOW"                = "10"
  }
  
  identity {
    type = "SystemAssigned"
  }
  
  tags = local.common_tags
}

# Grant the backend app access to Key Vault secrets
resource "azurerm_key_vault_access_policy" "backend" {
  key_vault_id = azurerm_key_vault.main.id
  tenant_id    = azurerm_linux_web_app.backend.identity[0].tenant_id
  object_id    = azurerm_linux_web_app.backend.identity[0].principal_id
  
  secret_permissions = [
    "Get", "List"
  ]
}

######################################################
# App Service for Frontend
######################################################

resource "azurerm_service_plan" "frontend" {
  name                = "${local.resource_prefix}-frontend-plan"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  os_type             = "Linux"
  sku_name            = "F1"
  tags                = local.common_tags
}

resource "azurerm_linux_web_app" "frontend" {
  name                = "${local.resource_prefix}-frontend"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  service_plan_id     = azurerm_service_plan.frontend.id
  
  site_config {
    application_stack {
      node_version = "18-lts"
    }
    
    always_on = true
    minimum_tls_version = "1.2"
    ftps_state = "Disabled"
    
    # Security headers
    health_check_path = "/health"
  }
  
  app_settings = {
    "SCM_DO_BUILD_DURING_DEPLOYMENT" = "true"
    "WEBSITES_PORT"                  = "3000"
    "REACT_APP_API_URL"              = "https://${azurerm_linux_web_app.backend.name}.azurewebsites.net/api"
    "REACT_APP_ENVIRONMENT"          = var.environment
    "REACT_APP_DEMO_MODE"            = "true"
    "GENERATE_SOURCEMAP"             = "true"  # Helpful for development debugging
    "REACT_APP_DOCUMENTATION_URL"    = "https://${azurerm_storage_account.main.name}.blob.core.windows.net/documentation/index.html"
  }
  
  tags = local.common_tags
}

######################################################
# Container Registry for Docker images
######################################################

resource "azurerm_container_registry" "main" {
  name                = "${var.app_name}${var.environment}acr"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  sku                 = "Basic"
  admin_enabled       = true
  tags                = local.common_tags
}

######################################################
# Monitoring Resources
######################################################

# Log Analytics Workspace for centralized logging
resource "azurerm_log_analytics_workspace" "main" {
  name                = "${local.resource_prefix}-law"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  sku                 = "PerGB2018"
  retention_in_days   = 30
  tags                = local.common_tags
}

# Application Insights for application monitoring
resource "azurerm_application_insights" "main" {
  name                = "${local.resource_prefix}-appinsights"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  application_type    = "web"
  workspace_id        = azurerm_log_analytics_workspace.main.id
  tags                = local.common_tags
}

# Diagnostic settings for App Service (Backend)
resource "azurerm_monitor_diagnostic_setting" "backend_app" {
  name                       = "backend-diagnostics"
  target_resource_id         = azurerm_linux_web_app.backend.id
  log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id

  log {
    category = "AppServiceHTTPLogs"
    enabled  = true
    retention_policy {
      enabled = true
      days    = 30
    }
  }

  log {
    category = "AppServiceConsoleLogs"
    enabled  = true
    retention_policy {
      enabled = true
      days    = 30
    }
  }

  log {
    category = "AppServiceAppLogs"
    enabled  = true
    retention_policy {
      enabled = true
      days    = 30
    }
  }

  metric {
    category = "AllMetrics"
    enabled  = true
    retention_policy {
      enabled = true
      days    = 30
    }
  }
}

# Diagnostic settings for App Service (Frontend)
resource "azurerm_monitor_diagnostic_setting" "frontend_app" {
  name                       = "frontend-diagnostics"
  target_resource_id         = azurerm_linux_web_app.frontend.id
  log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id

  log {
    category = "AppServiceHTTPLogs"
    enabled  = true
    retention_policy {
      enabled = true
      days    = 30
    }
  }

  log {
    category = "AppServiceConsoleLogs"
    enabled  = true
    retention_policy {
      enabled = true
      days    = 30
    }
  }

  log {
    category = "AppServiceAppLogs"
    enabled  = true
    retention_policy {
      enabled = true
      days    = 30
    }
  }

  metric {
    category = "AllMetrics"
    enabled  = true
    retention_policy {
      enabled = true
      days    = 30
    }
  }
}

# Diagnostic settings for PostgreSQL
resource "azurerm_monitor_diagnostic_setting" "postgres" {
  name                       = "postgres-diagnostics"
  target_resource_id         = azurerm_postgresql_flexible_server.main.id
  log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id

  log {
    category = "PostgreSQLLogs"
    enabled  = true
    retention_policy {
      enabled = true
      days    = 30
    }
  }

  metric {
    category = "AllMetrics"
    enabled  = true
    retention_policy {
      enabled = true
      days    = 30
    }
  }
}

# Diagnostic settings for Storage Account
resource "azurerm_monitor_diagnostic_setting" "storage" {
  name                       = "storage-diagnostics"
  target_resource_id         = azurerm_storage_account.main.id
  log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id

  metric {
    category = "Transaction"
    enabled  = true
    retention_policy {
      enabled = true
      days    = 30
    }
  }

  metric {
    category = "Capacity"
    enabled  = true
    retention_policy {
      enabled = true
      days    = 30
    }
  }
}

# Diagnostic settings for Key Vault
resource "azurerm_monitor_diagnostic_setting" "keyvault" {
  name                       = "keyvault-diagnostics"
  target_resource_id         = azurerm_key_vault.main.id
  log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id

  log {
    category = "AuditEvent"
    enabled  = true
    retention_policy {
      enabled = true
      days    = 30
    }
  }

  metric {
    category = "AllMetrics"
    enabled  = true
    retention_policy {
      enabled = true
      days    = 30
    }
  }
}

# Create a service principal for monitoring (used by the dashboard)
resource "azuread_application" "monitoring" {
  display_name = "${local.resource_prefix}-monitoring-app"
  
  web {
    homepage_url  = "https://${azurerm_linux_web_app.frontend.name}.azurewebsites.net"
    redirect_uris = ["https://${azurerm_linux_web_app.frontend.name}.azurewebsites.net/auth/callback"]
  }
}

resource "azuread_service_principal" "monitoring" {
  client_id                    = azuread_application.monitoring.client_id
  app_role_assignment_required = false
}

resource "azuread_application_password" "monitoring_secret" {
  application_id = azuread_application.monitoring.id
  display_name   = "Monitoring Secret"
  end_date_relative = "8760h" # 1 year
}

# Store monitoring service principal credentials in Key Vault
resource "azurerm_key_vault_secret" "monitoring_client_id" {
  name         = "monitoring-client-id"
  value        = azuread_application.monitoring.client_id
  key_vault_id = azurerm_key_vault.main.id
}

resource "azurerm_key_vault_secret" "monitoring_client_secret" {
  name         = "monitoring-client-secret"
  value        = azuread_application_password.monitoring_secret.value
  key_vault_id = azurerm_key_vault.main.id
}

resource "azurerm_key_vault_secret" "monitoring_tenant_id" {
  name         = "monitoring-tenant-id"
  value        = data.azurerm_client_config.current.tenant_id
  key_vault_id = azurerm_key_vault.main.id
}

# Grant the monitoring service principal required roles
resource "azurerm_role_assignment" "monitoring_reader" {
  scope                = azurerm_resource_group.main.id
  role_definition_name = "Reader"
  principal_id         = azuread_service_principal.monitoring.object_id
}

resource "azurerm_role_assignment" "monitoring_monitor_reader" {
  scope                = azurerm_resource_group.main.id
  role_definition_name = "Monitoring Reader"
  principal_id         = azuread_service_principal.monitoring.object_id
}

######################################################
# Output Values
######################################################

output "resource_group_name" {
  value = azurerm_resource_group.main.name
}

output "postgres_server_name" {
  value = azurerm_postgresql_flexible_server.main.name
}

output "postgres_database_name" {
  value = azurerm_postgresql_flexible_server_database.tap.name
}

output "storage_account_name" {
  value = azurerm_storage_account.main.name
}

output "key_vault_name" {
  value = azurerm_key_vault.main.name
}

output "backend_app_url" {
  value = "https://${azurerm_linux_web_app.backend.name}.azurewebsites.net"
}

output "frontend_app_url" {
  value = "https://${azurerm_linux_web_app.frontend.name}.azurewebsites.net"
}

output "container_registry_login_server" {
  value = azurerm_container_registry.main.login_server
}

output "documentation_url" {
  value = "https://${azurerm_storage_account.main.name}.blob.core.windows.net/documentation/index.html"
}

output "app_insights_connection_string" {
  value     = azurerm_application_insights.main.connection_string
  sensitive = true
}

output "monitoring_service_principal_id" {
  value = azuread_service_principal.monitoring.id
}

output "monitoring_service_principal_app_id" {
  value = azuread_application.monitoring.client_id
}

output "log_analytics_workspace_id" {
  value = azurerm_log_analytics_workspace.main.id
}