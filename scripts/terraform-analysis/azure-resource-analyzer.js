#!/usr/bin/env node

/**
 * Azure Resource Analyzer
 *
 * This script analyzes the codebase to find Azure resource references,
 * authenticates with Azure to audit existing resources, and creates
 * a comprehensive inventory of required Azure resources for the application.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

// Configuration
const config = {
  projectRoot: path.resolve(__dirname, '../../'),
  outputFile: path.resolve(__dirname, '../../TERRAFORM-AZURE-RESOURCES.md'),
  codebaseScanPaths: [
    'backend',
    'frontend/src',
    'terraform'
  ],
  azureResourcePatterns: [
    // Storage
    'BlobServiceClient', 'ContainerClient', 'BlobClient', 'StorageManagementClient',
    'AzureStorageBlob', 'AzureWebJobsStorage', 'DefaultEndpointsProtocol=https',
    'azure_blob_storage', 'blob_storage_adapter', 'azure_blob_connector',
    // App Service
    'AzureWebSites', 'azurewebsites.net', 'WebSiteManagementClient',
    // KeyVault
    'KeyVaultClient', 'VaultManagementClient', '@azure/keyvault', 'KeyVault',
    // CosmosDB
    'CosmosClient', 'CosmosDBManagementClient', 'DocumentClient', '@azure/cosmos',
    // SQL Database
    'SqlManagementClient', 'connectionString', 'Server=tcp',
    // Function Apps
    'AzureFunction', 'FunctionAppClient', 'AzureFunctionsManagementClient',
    // API Management
    'ApiManagementClient', 'ApiManagementServiceClient',
    // Service Bus
    'ServiceBusClient', 'ServiceBusManagementClient', '@azure/service-bus',
    // Event Grid
    'EventGridClient', 'EventGridManagementClient',
    // Event Hub
    'EventHubClient', 'EventHubManagementClient', '@azure/event-hubs',
    // Logic Apps
    'LogicAppsClient', 'LogicManagementClient', 'LogicApps',
    // App Configuration
    'AppConfigurationClient', 'AppConfigManagementClient',
    // Application Insights
    'ApplicationInsightsClient', 'ApplicationInsightsManagementClient', 'appInsights',
    // Other general patterns
    'azure', 'Azure', 'AZURE', 'Microsoft.', 'AzureAD'
  ],
  terraformResourceTypes: [
    'azurerm_resource_group',
    'azurerm_storage_account',
    'azurerm_storage_container',
    'azurerm_app_service',
    'azurerm_app_service_plan',
    'azurerm_function_app',
    'azurerm_key_vault',
    'azurerm_key_vault_secret',
    'azurerm_cosmosdb_account',
    'azurerm_sql_server',
    'azurerm_sql_database',
    'azurerm_api_management',
    'azurerm_service_bus_namespace',
    'azurerm_service_bus_queue',
    'azurerm_service_bus_topic',
    'azurerm_eventgrid_topic',
    'azurerm_eventhub_namespace',
    'azurerm_eventhub',
    'azurerm_logic_app_workflow',
    'azurerm_app_configuration',
    'azurerm_application_insights',
    'azurerm_virtual_network',
    'azurerm_subnet',
    'azurerm_network_security_group',
    'azurerm_public_ip',
    'azurerm_container_registry',
    'azurerm_kubernetes_cluster',
    'azurerm_cdn_profile',
    'azurerm_cdn_endpoint',
    'azurerm_redis_cache',
    'azurerm_traffic_manager_profile'
  ]
};

// Resource inventory structure
const resourceInventory = {
  codebaseResources: {},
  terraformResources: {},
  azureResources: {}, // Will be populated from Azure CLI
  requiredResourcesMap: {}, // Combined resources that should be in Terraform
  resourceRelationships: [] // Resource dependencies
};

/**
 * Find all Azure resource references in the codebase
 */
async function scanCodebaseForAzureResources() {
  console.log('\n🔍 Scanning codebase for Azure resource references...');
  
  for (const scanPath of config.codebaseScanPaths) {
    const fullPath = path.join(config.projectRoot, scanPath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`  ⚠️ Path not found: ${fullPath}`);
      continue;
    }
    
    console.log(`  Scanning: ${scanPath}`);
    
    // Create grep pattern from resource patterns
    const grepPattern = config.azureResourcePatterns.join('|');
    
    try {
      // Use grep to find files with Azure references
      const cmd = `grep -r -l -E "${grepPattern}" ${fullPath} | grep -v "node_modules" | grep -v ".git"`;
      const filesWithReferences = execSync(cmd, { encoding: 'utf8' })
        .trim()
        .split('\n')
        .filter(Boolean);
      
      console.log(`  Found ${filesWithReferences.length} files with potential Azure references`);
      
      // Process each file
      for (const filePath of filesWithReferences) {
        const relativePath = path.relative(config.projectRoot, filePath);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        
        // Check for each resource pattern
        for (const pattern of config.azureResourcePatterns) {
          if (fileContent.includes(pattern)) {
            if (!resourceInventory.codebaseResources[pattern]) {
              resourceInventory.codebaseResources[pattern] = {
                count: 0,
                files: []
              };
            }
            
            resourceInventory.codebaseResources[pattern].count++;
            resourceInventory.codebaseResources[pattern].files.push(relativePath);
          }
        }
      }
    } catch (error) {
      console.error(`  Error scanning ${scanPath}:`, error.message);
    }
  }
  
  // Sort resources by frequency
  const sortedResources = Object.entries(resourceInventory.codebaseResources)
    .sort((a, b) => b[1].count - a[1].count);
  
  console.log('\n📊 Azure Resource References Summary:');
  for (const [pattern, data] of sortedResources.slice(0, 10)) {
    console.log(`  - ${pattern}: ${data.count} references in ${data.files.length} files`);
  }
  console.log(`  ... and ${sortedResources.length - 10} more resource types found`);
}

/**
 * Scan Terraform files for existing resource definitions
 */
async function scanTerraformFiles() {
  console.log('\n🔍 Scanning Terraform files for resource definitions...');
  
  const terraformDir = path.join(config.projectRoot, 'terraform');
  
  if (!fs.existsSync(terraformDir)) {
    console.log('  ⚠️ Terraform directory not found');
    return;
  }
  
  try {
    // Find all .tf files
    const tfFiles = execSync(`find ${terraformDir} -name "*.tf"`, { encoding: 'utf8' })
      .trim()
      .split('\n')
      .filter(Boolean);
    
    console.log(`  Found ${tfFiles.length} Terraform files`);
    
    // Process each Terraform file
    for (const filePath of tfFiles) {
      const relativePath = path.relative(config.projectRoot, filePath);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      
      // Check for each resource type
      for (const resourceType of config.terraformResourceTypes) {
        const resourceRegex = new RegExp(`resource\\s+"${resourceType}"\\s+"([^"]+)"`, 'g');
        let match;
        
        while ((match = resourceRegex.exec(fileContent)) !== null) {
          const resourceName = match[1];
          const resourceId = `${resourceType}.${resourceName}`;
          
          if (!resourceInventory.terraformResources[resourceId]) {
            resourceInventory.terraformResources[resourceId] = {
              type: resourceType,
              name: resourceName,
              file: relativePath,
              lineNumber: getLineNumber(fileContent, match.index)
            };
          }
        }
      }
    }
  } catch (error) {
    console.error('  Error scanning Terraform files:', error.message);
  }
  
  console.log(`  Found ${Object.keys(resourceInventory.terraformResources).length} Terraform resources defined`);
}

/**
 * Get line number for a match in a string
 * @param {string} content - The file content
 * @param {number} index - The index of the match
 * @returns {number} The line number (1-based)
 */
function getLineNumber(content, index) {
  return content.substring(0, index).split('\n').length;
}

/**
 * Check if Azure CLI is installed and we can connect to Azure
 */
async function checkAzureCliInstallation() {
  console.log('\n🔑 Checking Azure CLI installation...');
  
  try {
    const versionOutput = execSync('az --version', { encoding: 'utf8' });
    console.log('  Azure CLI is installed');
    
    // Check if we're logged in
    try {
      const accountInfo = execSync('az account show', { encoding: 'utf8' });
      const account = JSON.parse(accountInfo);
      console.log(`  Already logged in as: ${account.user.name}`);
      console.log(`  Subscription: ${account.name} (${account.id})`);
      return true;
    } catch (error) {
      console.log('  Not logged into Azure');
      return false;
    }
  } catch (error) {
    console.error('  Azure CLI is not installed or not in the PATH');
    return false;
  }
}

/**
 * Prompt the user to log in to Azure if not already logged in
 */
async function promptAzureLogin() {
  console.log('\n🔑 Azure authentication required');
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    rl.question('  Would you like to log in to Azure now? (y/n): ', (answer) => {
      rl.close();
      
      if (answer.toLowerCase() === 'y') {
        try {
          console.log('  Opening Azure login...');
          execSync('az login', { stdio: 'inherit' });
          console.log('  Successfully logged in to Azure');
          resolve(true);
        } catch (error) {
          console.error('  Error logging in to Azure:', error.message);
          resolve(false);
        }
      } else {
        console.log('  Azure login skipped. Will not audit existing Azure resources.');
        resolve(false);
      }
    });
  });
}

/**
 * Audit existing Azure resources
 */
async function auditAzureResources() {
  console.log('\n🔍 Auditing existing Azure resources...');
  
  // Check if Azure CLI is available and we're logged in
  const cliAvailable = await checkAzureCliInstallation();
  
  if (!cliAvailable) {
    const loggedIn = await promptAzureLogin();
    if (!loggedIn) {
      console.log('  Skipping Azure resource audit');
      return;
    }
  }
  
  // Get resource groups
  try {
    console.log('  Listing resource groups...');
    const resourceGroups = JSON.parse(
      execSync('az group list', { encoding: 'utf8' })
    );
    
    console.log(`  Found ${resourceGroups.length} resource groups`);
    
    // Collect resources for each resource group
    for (const group of resourceGroups) {
      console.log(`  Listing resources in group: ${group.name}`);
      
      const resources = JSON.parse(
        execSync(`az resource list --resource-group ${group.name}`, { encoding: 'utf8' })
      );
      
      console.log(`    Found ${resources.length} resources`);
      
      // Add to our inventory
      for (const resource of resources) {
        const resourceId = resource.id;
        resourceInventory.azureResources[resourceId] = {
          name: resource.name,
          type: resource.type,
          resourceGroup: group.name,
          location: resource.location,
          tags: resource.tags || {}
        };
      }
    }
  } catch (error) {
    console.error('  Error auditing Azure resources:', error.message);
  }
  
  console.log(`  Total Azure resources found: ${Object.keys(resourceInventory.azureResources).length}`);
}

/**
 * Map codebase references to required Azure resources
 */
function mapCodebaseToRequiredResources() {
  console.log('\n🔄 Mapping codebase references to required Azure resources...');
  
  // Define mapping rules from codebase patterns to Azure resource types
  const mappingRules = [
    { pattern: 'BlobServiceClient', resourceType: 'Storage Account' },
    { pattern: 'azure_blob_storage', resourceType: 'Storage Account' },
    { pattern: 'azure_blob_connector', resourceType: 'Storage Account' },
    { pattern: 'blob_storage_adapter', resourceType: 'Storage Account' },
    { pattern: 'AzureStorageBlob', resourceType: 'Storage Account' },
    { pattern: 'DefaultEndpointsProtocol=https', resourceType: 'Storage Account' },
    { pattern: 'azurewebsites.net', resourceType: 'App Service' },
    { pattern: 'AzureWebSites', resourceType: 'App Service' },
    { pattern: 'KeyVaultClient', resourceType: 'Key Vault' },
    { pattern: 'CosmosClient', resourceType: 'Cosmos DB' },
    { pattern: '@azure/cosmos', resourceType: 'Cosmos DB' },
    { pattern: 'SqlManagementClient', resourceType: 'SQL Database' },
    { pattern: 'Server=tcp', resourceType: 'SQL Database' },
    { pattern: 'AzureFunction', resourceType: 'Function App' },
    { pattern: 'ServiceBusClient', resourceType: 'Service Bus' },
    { pattern: '@azure/service-bus', resourceType: 'Service Bus' },
    { pattern: 'EventGridClient', resourceType: 'Event Grid' },
    { pattern: 'EventHubClient', resourceType: 'Event Hub' },
    { pattern: '@azure/event-hubs', resourceType: 'Event Hub' },
    { pattern: 'LogicAppsClient', resourceType: 'Logic App' },
    { pattern: 'LogicApps', resourceType: 'Logic App' },
    { pattern: 'AppConfigurationClient', resourceType: 'App Configuration' },
    { pattern: 'ApplicationInsightsClient', resourceType: 'Application Insights' },
    { pattern: 'appInsights', resourceType: 'Application Insights' }
  ];
  
  // Apply mapping rules to codebase resources
  for (const [pattern, data] of Object.entries(resourceInventory.codebaseResources)) {
    const matchingRules = mappingRules.filter(rule => pattern.includes(rule.pattern));
    
    if (matchingRules.length > 0) {
      for (const rule of matchingRules) {
        const resourceType = rule.resourceType;
        
        if (!resourceInventory.requiredResourcesMap[resourceType]) {
          resourceInventory.requiredResourcesMap[resourceType] = {
            count: 0,
            patterns: [],
            files: []
          };
        }
        
        resourceInventory.requiredResourcesMap[resourceType].count += data.count;
        
        if (!resourceInventory.requiredResourcesMap[resourceType].patterns.includes(pattern)) {
          resourceInventory.requiredResourcesMap[resourceType].patterns.push(pattern);
        }
        
        for (const file of data.files) {
          if (!resourceInventory.requiredResourcesMap[resourceType].files.includes(file)) {
            resourceInventory.requiredResourcesMap[resourceType].files.push(file);
          }
        }
      }
    }
  }
  
  console.log('\n📊 Required Azure Resources Summary:');
  for (const [resourceType, data] of Object.entries(resourceInventory.requiredResourcesMap)) {
    console.log(`  - ${resourceType}: ${data.count} references, ${data.patterns.length} patterns, ${data.files.length} files`);
  }
}

/**
 * Map Azure resources to Terraform resources
 */
function mapAzureToTerraformResources() {
  console.log('\n🔄 Mapping Azure resources to Terraform resources...');
  
  // Define mapping from Azure resource types to Terraform resource types
  const typeMappings = {
    'Microsoft.Storage/storageAccounts': 'azurerm_storage_account',
    'Microsoft.Web/sites': 'azurerm_app_service',
    'Microsoft.Web/serverfarms': 'azurerm_app_service_plan',
    'Microsoft.KeyVault/vaults': 'azurerm_key_vault',
    'Microsoft.DocumentDB/databaseAccounts': 'azurerm_cosmosdb_account',
    'Microsoft.Sql/servers': 'azurerm_sql_server',
    'Microsoft.Sql/servers/databases': 'azurerm_sql_database',
    'Microsoft.ApiManagement/service': 'azurerm_api_management',
    'Microsoft.ServiceBus/namespaces': 'azurerm_service_bus_namespace',
    'Microsoft.EventGrid/topics': 'azurerm_eventgrid_topic',
    'Microsoft.EventHub/namespaces': 'azurerm_eventhub_namespace',
    'Microsoft.Logic/workflows': 'azurerm_logic_app_workflow',
    'Microsoft.AppConfiguration/configurationStores': 'azurerm_app_configuration',
    'Microsoft.Insights/components': 'azurerm_application_insights',
    'Microsoft.Network/virtualNetworks': 'azurerm_virtual_network',
    'Microsoft.Network/networkSecurityGroups': 'azurerm_network_security_group',
    'Microsoft.Network/publicIPAddresses': 'azurerm_public_ip',
    'Microsoft.ContainerRegistry/registries': 'azurerm_container_registry',
    'Microsoft.ContainerService/managedClusters': 'azurerm_kubernetes_cluster',
    'Microsoft.Cdn/profiles': 'azurerm_cdn_profile',
    'Microsoft.Cdn/profiles/endpoints': 'azurerm_cdn_endpoint',
    'Microsoft.Cache/Redis': 'azurerm_redis_cache',
    'Microsoft.Network/trafficManagerProfiles': 'azurerm_traffic_manager_profile'
  };
  
  // Count resources that exist in Azure but are not in Terraform
  let missingFromTerraform = 0;
  
  for (const [resourceId, resourceData] of Object.entries(resourceInventory.azureResources)) {
    const azureType = resourceData.type;
    const terraformType = typeMappings[azureType];
    
    if (terraformType) {
      // Check if this resource is defined in Terraform
      const terraformResourceId = Object.keys(resourceInventory.terraformResources)
        .find(id => resourceInventory.terraformResources[id].name === resourceData.name && 
                   resourceInventory.terraformResources[id].type === terraformType);
      
      if (!terraformResourceId) {
        missingFromTerraform++;
        
        // Add to resource relationships
        resourceInventory.resourceRelationships.push({
          resourceId,
          name: resourceData.name,
          type: resourceData.type,
          status: 'Missing from Terraform',
          terraformType
        });
      }
    }
  }
  
  console.log(`  Resources in Azure but missing from Terraform: ${missingFromTerraform}`);
}

/**
 * Generate TERRAFORM-AZURE-RESOURCES documentation
 */
function generateResourceDocumentation() {
  console.log('\n📝 Generating TERRAFORM-AZURE-RESOURCES documentation...');
  
  const timestamp = new Date().toISOString();
  
  let markdown = `# Azure Resources for TAP Integration Platform

## Overview
This document provides a comprehensive inventory of Azure resources required for the TAP Integration Platform, based on codebase analysis and existing infrastructure audit.

Generated: ${timestamp}

## Required Azure Resources Summary

| Resource Type | References | File Count | In Terraform | In Azure | Status |
|---------------|------------|------------|--------------|----------|--------|
`;

  // Add resource summary rows
  for (const [resourceType, data] of Object.entries(resourceInventory.requiredResourcesMap)) {
    // Count how many of this type exist in Terraform
    const terraformTypeMapping = {
      'Storage Account': 'azurerm_storage_account',
      'App Service': 'azurerm_app_service',
      'Key Vault': 'azurerm_key_vault',
      'Cosmos DB': 'azurerm_cosmosdb_account',
      'SQL Database': 'azurerm_sql_database',
      'Function App': 'azurerm_function_app',
      'Service Bus': 'azurerm_service_bus_namespace',
      'Event Grid': 'azurerm_eventgrid_topic',
      'Event Hub': 'azurerm_eventhub_namespace',
      'Logic App': 'azurerm_logic_app_workflow',
      'App Configuration': 'azurerm_app_configuration',
      'Application Insights': 'azurerm_application_insights'
    };
    
    const terraformType = terraformTypeMapping[resourceType];
    const inTerraform = terraformType ? Object.values(resourceInventory.terraformResources)
      .filter(r => r.type === terraformType).length : 0;
    
    // Count how many of this type exist in Azure
    const azureTypeMapping = {
      'Storage Account': 'Microsoft.Storage/storageAccounts',
      'App Service': 'Microsoft.Web/sites',
      'Key Vault': 'Microsoft.KeyVault/vaults',
      'Cosmos DB': 'Microsoft.DocumentDB/databaseAccounts',
      'SQL Database': 'Microsoft.Sql/servers/databases',
      'Function App': 'Microsoft.Web/sites',
      'Service Bus': 'Microsoft.ServiceBus/namespaces',
      'Event Grid': 'Microsoft.EventGrid/topics',
      'Event Hub': 'Microsoft.EventHub/namespaces',
      'Logic App': 'Microsoft.Logic/workflows',
      'App Configuration': 'Microsoft.AppConfiguration/configurationStores',
      'Application Insights': 'Microsoft.Insights/components'
    };
    
    const azureType = azureTypeMapping[resourceType];
    const inAzure = azureType ? Object.values(resourceInventory.azureResources)
      .filter(r => r.type === azureType).length : 0;
    
    // Determine status
    let status = '';
    if (inTerraform > 0 && inAzure > 0) {
      status = '✅ Configured';
    } else if (inTerraform === 0 && inAzure > 0) {
      status = '⚠️ Missing from Terraform';
    } else if (inTerraform > 0 && inAzure === 0) {
      status = '🔄 Not deployed';
    } else {
      status = '❌ Not configured';
    }
    
    markdown += `| ${resourceType} | ${data.count} | ${data.files.length} | ${inTerraform} | ${inAzure} | ${status} |\n`;
  }
  
  markdown += `
## Detailed Resource Analysis

### Resources by Type
`;

  // Add detailed resource sections
  for (const [resourceType, data] of Object.entries(resourceInventory.requiredResourcesMap)) {
    markdown += `
#### ${resourceType}

**References**: ${data.count}  
**Patterns**: ${data.patterns.join(', ')}  
**Files**: ${data.files.length}

Key files with references:
${data.files.slice(0, 5).map(file => `- ${file}`).join('\n')}
${data.files.length > 5 ? `...and ${data.files.length - 5} more files` : ''}
`;
  }
  
  markdown += `
### Terraform Resources

| Resource Type | Name | File | Line |
|---------------|------|------|------|
`;

  // Add Terraform resources
  for (const [resourceId, data] of Object.entries(resourceInventory.terraformResources)) {
    markdown += `| ${data.type} | ${data.name} | ${data.file} | ${data.lineNumber} |\n`;
  }
  
  markdown += `
### Azure Resources

| Resource Name | Type | Resource Group | Location | In Terraform |
|---------------|------|---------------|----------|--------------|
`;

  // Add Azure resources
  for (const [resourceId, data] of Object.entries(resourceInventory.azureResources)) {
    // Check if resource is in Terraform
    const typeMappings = {
      'Microsoft.Storage/storageAccounts': 'azurerm_storage_account',
      'Microsoft.Web/sites': 'azurerm_app_service',
      'Microsoft.Web/serverfarms': 'azurerm_app_service_plan',
      'Microsoft.KeyVault/vaults': 'azurerm_key_vault',
      'Microsoft.DocumentDB/databaseAccounts': 'azurerm_cosmosdb_account',
      'Microsoft.Sql/servers': 'azurerm_sql_server',
      'Microsoft.Sql/servers/databases': 'azurerm_sql_database',
      'Microsoft.ApiManagement/service': 'azurerm_api_management',
      'Microsoft.ServiceBus/namespaces': 'azurerm_service_bus_namespace',
      'Microsoft.EventGrid/topics': 'azurerm_eventgrid_topic',
      'Microsoft.EventHub/namespaces': 'azurerm_eventhub_namespace',
      'Microsoft.Logic/workflows': 'azurerm_logic_app_workflow',
      'Microsoft.AppConfiguration/configurationStores': 'azurerm_app_configuration',
      'Microsoft.Insights/components': 'azurerm_application_insights'
    };
    
    const terraformType = typeMappings[data.type];
    let inTerraform = 'No';
    
    if (terraformType) {
      const found = Object.values(resourceInventory.terraformResources)
        .some(r => r.type === terraformType && r.name === data.name);
      
      if (found) {
        inTerraform = 'Yes';
      }
    }
    
    markdown += `| ${data.name} | ${data.type} | ${data.resourceGroup} | ${data.location} | ${inTerraform} |\n`;
  }
  
  markdown += `
## Recommendations

Based on the analysis, here are the recommended actions:

1. **Missing Terraform Configurations**: The following resources exist in Azure but are not managed in Terraform:
${Object.entries(resourceInventory.azureResources)
  .filter(([resourceId, data]) => {
    const typeMappings = {
      'Microsoft.Storage/storageAccounts': 'azurerm_storage_account',
      'Microsoft.Web/sites': 'azurerm_app_service',
      'Microsoft.Web/serverfarms': 'azurerm_app_service_plan',
      'Microsoft.KeyVault/vaults': 'azurerm_key_vault',
      'Microsoft.DocumentDB/databaseAccounts': 'azurerm_cosmosdb_account',
      'Microsoft.Sql/servers': 'azurerm_sql_server',
      'Microsoft.Sql/servers/databases': 'azurerm_sql_database',
      'Microsoft.ApiManagement/service': 'azurerm_api_management',
      'Microsoft.ServiceBus/namespaces': 'azurerm_service_bus_namespace',
      'Microsoft.EventGrid/topics': 'azurerm_eventgrid_topic',
      'Microsoft.EventHub/namespaces': 'azurerm_eventhub_namespace',
      'Microsoft.Logic/workflows': 'azurerm_logic_app_workflow',
      'Microsoft.AppConfiguration/configurationStores': 'azurerm_app_configuration',
      'Microsoft.Insights/components': 'azurerm_application_insights'
    };
    
    const terraformType = typeMappings[data.type];
    if (!terraformType) return false;
    
    return !Object.values(resourceInventory.terraformResources)
      .some(r => r.type === terraformType && r.name === data.name);
  })
  .slice(0, 5)
  .map(([resourceId, data]) => `   - ${data.name} (${data.type})`)
  .join('\n')}
   
2. **Required Resources Not Configured**: These resources are referenced in code but not configured:
${Object.entries(resourceInventory.requiredResourcesMap)
  .filter(([resourceType, data]) => {
    const terraformTypeMapping = {
      'Storage Account': 'azurerm_storage_account',
      'App Service': 'azurerm_app_service',
      'Key Vault': 'azurerm_key_vault',
      'Cosmos DB': 'azurerm_cosmosdb_account',
      'SQL Database': 'azurerm_sql_database',
      'Function App': 'azurerm_function_app',
      'Service Bus': 'azurerm_service_bus_namespace',
      'Event Grid': 'azurerm_eventgrid_topic',
      'Event Hub': 'azurerm_eventhub_namespace',
      'Logic App': 'azurerm_logic_app_workflow',
      'App Configuration': 'azurerm_app_configuration',
      'Application Insights': 'azurerm_application_insights'
    };
    
    const terraformType = terraformTypeMapping[resourceType];
    const inTerraform = terraformType ? Object.values(resourceInventory.terraformResources)
      .filter(r => r.type === terraformType).length : 0;
    
    return inTerraform === 0;
  })
  .map(([resourceType, data]) => `   - ${resourceType} (referenced in ${data.files.length} files)`)
  .join('\n')}

3. **Terraform Module Structure**: Organize resources into logical modules:
   - Storage module for all storage accounts and containers
   - Compute module for App Services, Functions, and Kubernetes
   - Data module for Cosmos DB, SQL, and other data services
   - Networking module for VNets, NSGs, and other network resources
   - Security module for Key Vault and IAM resources

4. **Documentation Updates**: Implement inline documentation and variables for all Terraform resources

## Next Steps

1. Import existing Azure resources into Terraform state
2. Organize Terraform configuration using modules
3. Implement variables for environment-specific settings
4. Add outputs for key resource identifiers
5. Implement secure state management with backend storage
6. Set up CI/CD pipeline for Terraform validation and deployment

For detailed implementation steps and best practices, refer to the project's infrastructure documentation.
`;

  // Write the documentation file
  fs.writeFileSync(config.outputFile, markdown);
  console.log(`  Documentation generated: ${config.outputFile}`);
}

/**
 * Main execution function
 */
async function main() {
  console.log('🔍 Azure Resource Analyzer');
  console.log('=========================');
  console.log(`Project Root: ${config.projectRoot}`);
  console.log(`Output File: ${config.outputFile}`);
  
  // Check if project directory exists
  if (!fs.existsSync(config.projectRoot)) {
    console.error(`Error: Project directory not found: ${config.projectRoot}`);
    process.exit(1);
  }
  
  try {
    // Step 1: Scan codebase for Azure resource references
    await scanCodebaseForAzureResources();
    
    // Step 2: Scan Terraform files
    await scanTerraformFiles();
    
    // Step 3: Audit existing Azure resources
    await auditAzureResources();
    
    // Step 4: Map codebase references to required resources
    mapCodebaseToRequiredResources();
    
    // Step 5: Map Azure resources to Terraform resources
    mapAzureToTerraformResources();
    
    // Step 6: Generate resource documentation
    generateResourceDocumentation();
    
    console.log('\n✅ Azure Resource Analysis Complete!');
    console.log(`  Documentation generated: ${config.outputFile}`);
  } catch (error) {
    console.error('Error executing Azure Resource Analyzer:', error);
    process.exit(1);
  }
}

// Execute the main function
main();