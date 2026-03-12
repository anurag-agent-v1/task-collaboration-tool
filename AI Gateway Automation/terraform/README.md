# Terraform | AI Gateway Automation

This Terraform project provisions the Azure API Management model gateway that fronts Azure AI Foundry. It leans on configuration driven variables so you can reuse the deployment across subscriptions, resource groups, regions, and environments.

## Quickstart

```bash
cd "AI Gateway Automation/terraform"
terraform init
terraform plan \
  -var "subscription_id=<SUBSCRIPTION_ID>" \
  -var "resource_group_name=<RG_NAME>" \
  -var "location=<REGION>" \
  -var "gateway_name=<APIM_NAME>" \
  -var "environment=dev" \
  -var "openai_swagger_url=<SWAGGER_JSON_URL>"
terraform apply ...
```

## Inputs (variables)

- `subscription_id`: Azure subscription.
- `resource_group_name`: The resource group for APIM and dependencies.
- `location`: Region for all resources.
- `gateway_name`: The APIM name.
- `apim_sku`: SKU for APIM (defaults to `Developer_1`).
- `environment`: Tag used for filtering.
- `openai_swagger_url`: Swagger endpoint describing the gateway API contract.

## Outputs

- `apim_endpoint`: The generated APIM gateway URL.
