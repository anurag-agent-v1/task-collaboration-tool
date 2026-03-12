# Bicep | Azure AI Gateway Automation

This Bicep deployment mirrors the Terraform stack but targets a subscription-scope deployment to create the resource group, APIM gateway, monitoring stack, and AI Foundry hub. It demonstrates how to keep configuration-driven parameters consistent across tooling.

## Quickstart

```bash
cd "Azure AI Gateway Automation/bicep"
az deployment sub create \
  --location eastus2 \
  --template-file main.bicep \
  --parameters @parameters.json
```

You can override defaults directly on the CLI with `--parameters resourceGroupName=ai-gateway-rg environment=prod` or maintain per-environment JSON files.

## Parameters

| Parameter | Description |
| --- | --- |
| `location` | Region for the resource group and services |
| `resourceGroupName` | Name of the resource group to host the gateway |
| `environment` | Tag for governance and naming |
| `gatewayName` | APIM service name |
| `apimPublisherName`, `apimPublisherEmail` | Publisher metadata for APIM |
| `apimSkuName` | APIM SKU (Developer, Standard, Premium) |
| `openApiDefinitionUrl` | OpenAPI URL describing the model gateway contract |
| `openAIModel` | The OpenAI model served via Foundry |
| `openAIModelUri` | Endpoint URI for the model deployment |
| `monitoringRetentionDays` | Retention for Log Analytics |
| `extraTags` | Additional governance tags |

## Outputs

- `apimGatewayUrl`: Gateway endpoint created in APIM.
- `apiManagementId`: APIM resource ID.
- `foundryHubId`: AI Foundry hub resource ID.
- `monitoringWorkspaceId`: Log Analytics workspace ID.
- `applicationInsightsKey`: Instrumentation key for dashboards.

## Configuration-driven strategy

- Keep the OpenAPI definition in a shared repo and version it alongside policy changes.
- Store parameters (resource names, tags) in environment-specific `parameters.{env}.json`.
- Use GitHub Actions or Azure Pipelines to run `az deployment sub create` with validation steps.
- Evolve the Bicep file with modules if the stack grows beyond a single file.
