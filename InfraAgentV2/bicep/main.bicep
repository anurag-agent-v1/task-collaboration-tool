targetScope = 'resourceGroup'

param subscriptionId string
param location string = 'eastus'
param environment string = 'dev'
param gatewayPrefix string = 'infraagent'
param apimSku string = 'Developer'
param apimPublisherName string = 'InfraAgentV2 Team'
param apimPublisherEmail string = 'infraagent@example.com'
param monitoringRetention int = 30
param tags object = {}

var computedTags = union(tags, {
  project     : 'InfraAgentV2'
  environment : environment
})

var apimName = '${gatewayPrefix}-apim'
var lawName = '${gatewayPrefix}-law'
var aiName = '${gatewayPrefix}-ai'
var cognitiveName = '${gatewayPrefix}-cog'

resource logWorkspace 'Microsoft.OperationalInsights/workspaces@2020-08-01' = {
  name: lawName
  location: location
  properties: {
    retentionInDays: monitoringRetention
  }
  tags: computedTags
}

resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: aiName
  location: location
  properties: {
    application_Type: 'web'
  }
  tags: computedTags
}

resource apim 'Microsoft.ApiManagement/service@2022-08-01' = {
  name: apimName
  location: location
  sku: {
    name: apimSku
    capacity: 1
  }
  properties: {
    publisherName: apimPublisherName
    publisherEmail: apimPublisherEmail
  }
  tags: computedTags
}

resource modelGatewayApi 'Microsoft.ApiManagement/service/apis@2022-08-01' = {
  parent: apim
  name: 'model-gateway'
  properties: {
    displayName: 'Model Gateway API'
    path: 'model-gateway'
    protocols: [
      'https'
    ]
    apiRevision: '1'
    subscriptionRequired: false
    value: '{ "swagger": "2.0" }'
  }
}

resource cognitiveAccount 'Microsoft.CognitiveServices/accounts@2022-02-01' = {
  name: cognitiveName
  location: location
  sku: {
    name: 'S0'
  }
  kind: 'CognitiveServices'
  properties: {}
  tags: computedTags
}

resource apimDiag 'Microsoft.Insights/diagnosticSettings@2021-05-01-preview' = {
  name: 'apim-diagnostics'
  scope: apim
  properties: {
    workspaceId: logWorkspace.id
    metrics: [
      {
        category: 'AllMetrics'
        enabled: true
      }
    ]
    logs: [
      {
        category: 'GatewayLogs'
        enabled: true
      }
      {
        category: 'GatewayRequests'
        enabled: true
      }
    ]
  }
}

output apimGatewayUrl string = apim.gatewayUrl
output logAnalyticsId string = logWorkspace.id
output applicationInsightsKey string = appInsights.instrumentationKey
