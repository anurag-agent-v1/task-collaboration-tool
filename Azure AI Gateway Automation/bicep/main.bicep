targetScope = 'subscription'

@description('Azure location for the resource group and services.')
param location string = 'eastus2'

@description('Name of the resource group that will host the gateway workload.')
param resourceGroupName string

@description('Environment tag (dev/test/prod). Helps with governance.')
param environment string = 'dev'

@description('Name of the APIM gateway service instance.')
param gatewayName string

@description('APIM publisher name and email for identity metadata.')
param apimPublisherName string = 'AI Gateway Team'
param apimPublisherEmail string = 'ai-foundry-ops@contoso.com'

@description('APIM SKU, e.g. Developer_1, Standard_2, Premium_1.')
param apimSkuName string = 'Developer_1'

@description('URL for the OpenAPI definition that describes the gateway contract.')
param openApiDefinitionUrl string

@description('Name of the OpenAI model that Foundry will deploy behind the gateway.')
param openAIModel string = 'GPT-4o-mini'

@description('Optional URI for the model endpoint (OpenAI or custom).')
param openAIModelUri string = 'https://api.openai.com/v1/models/gpt-4o-mini'

@description('Number of days to retain monitoring data in Log Analytics.')
param monitoringRetentionDays int = 30

@description('Add custom tags to complement the shared governance tags object.')
param extraTags object = {}

var commonTags = union({
  Environment: environment
  Project: 'AI Gateway'
}, extraTags)

resource rg 'Microsoft.Resources/resourceGroups@2021-04-01' = {
  name: resourceGroupName
  location: location
  tags: commonTags
}

resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2020-08-01' = {
  name: '${environment}-ai-gateway-law'
  parent: rg
  location: location
  properties: {
    retentionInDays: monitoringRetentionDays
  }
  sku: {
    name: 'PerGB2018'
  }
  tags: commonTags
}

resource applicationInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: '${environment}-ai-gateway-ai'
  parent: rg
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    Flow_Type: 'Redfield'
  }
  tags: commonTags
}

resource apiManagement 'Microsoft.ApiManagement/service@2024-01-01-preview' = {
  name: gatewayName
  parent: rg
  location: location
  sku: {
    name: apimSkuName
    capacity: 1
  }
  properties: {
    publisherEmail: apimPublisherEmail
    publisherName: apimPublisherName
    notificationSenderEmail: apimPublisherEmail
  }
  tags: commonTags
}

resource modelGatewayApi 'Microsoft.ApiManagement/service/apis@2024-01-01-preview' = {
  name: '${gatewayName}/foundry-model-gateway'
  parent: apiManagement
  properties: {
    displayName: 'AI Foundry Gateway'
    path: 'models'
    protocols: [
      'https'
    ]
    value: openApiDefinitionUrl
    format: 'openapi-link-json'
  }
}

resource aiFoundryHub 'Microsoft.AIFoundry/hubs@2024-08-01-preview' = {
  name: '${environment}-foundry-hub'
  parent: rg
  location: location
  properties: {
    environment: environment
    projectName: '${environment}-project'
    network: {
      enablePrivateEndpoint: false
    }
  }
  sku: {
    name: 'Standard'
  }
  tags: commonTags
}

output apimGatewayUrl string = apiManagement.properties.gatewayUrl
output apiManagementId string = apiManagement.id
output foundryHubId string = aiFoundryHub.id
output monitoringWorkspaceId string = logAnalytics.id
output applicationInsightsKey string = applicationInsights.properties.InstrumentationKey
