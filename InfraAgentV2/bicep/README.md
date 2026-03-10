# Bicep stack for InfraAgentV2

This Bicep template mirrors the Terraform stack to deploy the Azure AI Foundry Model Gateway architecture. It defines a resource group, APIM gateway, monitoring resources, and a cognitive service that represents the Azure AI services behind the Model Gateway.

## Configuration inputs

Every resource is driven by parameters defined in `main.bicep` and the example parameter file (`parameters.json`). Key settings include:

- `environment`, `location`, and `gatewayPrefix` for naming and tagging.
- `apimSku`, `publisherName`, and `publisherEmail` for the gateway configuration.
- `monitoringRetention` to keep logs for the desired period.

## Deployment steps

```bash
cd InfraAgentV2/bicep
az deployment group create \
  --resource-group <your-rg> \
  --template-file main.bicep \
  --parameters @parameters.json \
  --parameters subscriptionId=<your-subscription-id>
```

Make sure you create or reuse the resource group ahead of time (or switch to `az deployment sub create` if you prefer to create it inline).
