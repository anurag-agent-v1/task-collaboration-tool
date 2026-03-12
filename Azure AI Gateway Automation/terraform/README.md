# Terraform | Azure AI Gateway Automation

This Terraform stack provisions the Azure AI Foundry Model Gateway. It builds a single resource group that contains:

- Azure API Management (Model Gateway) fronting AI workloads
- Application Insights + Log Analytics for telemetry
- An AI Foundry hub + model deployment (via azapi)
- An API definition that models the gateway contract

Every value is parameterized so you can reuse the stack for dev/test/prod and pull values from your CI/CD secrets store.

## Quickstart

```bash
cd "Azure AI Gateway Automation/terraform"
terraform init
terraform plan \
  -var "subscription_id=<SUBSCRIPTION_ID>" \
  -var "resource_group_name=<RG_NAME>" \
  -var "location=<REGION>" \
  -var "gateway_name=<APIM_NAME>" \
  -var "openai_swagger_url=<SWAGGER_JSON_URL>" \
  -var "environment=dev"
terraform apply ...
```

Prefer to keep values in `terraform.tfvars` and reference the example file included in the folder.

## Inputs (variables)

| Name | Description |
| --- | --- |
| `subscription_id` | Subscription the deployment targets |
| `resource_group_name` | Resource group used for all components |
| `location` | Azure region |
| `environment` | Environment tag used for governance |
| `gateway_name` | APIM service name |
| `apim_sku` | APIM SKU (Developer_1/Standard, etc.) |
| `apim_publisher_*` | Contact metadata for APIM |
| `openai_swagger_url` | OpenAPI description for the gateway API |
| `openai_model` | Model name deployed via Foundry |
| `openai_model_uri` | URI for the model deployment (e.g., GPT-4o-mini) |
| `foundry_sku` | SKU for the Foundry hub |
| `foundry_private_endpoint` | Toggle to enable private endpoints |
| `monitoring_retention_days` | Log Analytics retention policy |
| `extra_tags` | Map of tags merged into every resource |

## Outputs

- `apim_gateway_url`: Gateway endpoint.
- `apim_model_api_id`: Resource ID for the API.
- `foundry_hub_id`: Resource ID for the Foundry hub.
- `model_deployment_id`: Resource ID for the model.
- `monitoring_workspace_id`: Log Analytics workspace ID.
- `application_insights_instrumentation_key`: Telemetry key for dashboards.

## Configuration-driven deployment strategy

This stack keeps everything parameterized so that each stage (dev/test/prod) can share the same pipeline:

1. Control input values via environment-specific `terraform.tfvars` files.
2. Connect to secrets (OpenAI keys, APIM certificates) via your preferred secret backend and feed them as variables.
3. Validate the OpenAPI definition with automated tests before calling `terraform apply`.
4. Use remote state backends for team visibility and safe rollbacks.
