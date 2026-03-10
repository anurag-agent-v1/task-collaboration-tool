# Terraform stack for InfraAgentV2

This Terraform workspace provisions the resources required to run the Azure AI Foundry Model Gateway pattern. Everything that changes between environments is surfaced as variables and centralized in `variables.tf` so pipelines can inject the right values.

## Key configuration points

- `terraform.tfvars` should define `subscription_id`, `resource_group_name`, `location`, `environment`, and Gateway metadata.
- `apim_sku`, `openai_model`, and monitoring flags are all parameterized for reuse across stages.
- Outputs provide the gateway hostname, resource group name, and monitoring workspace so downstream automation can reference them.

## Workflow

```bash
cd InfraAgentV2/terraform
tfenv install # optional utility if using tfenv
typeset -a output
terraform init
terraform plan -var-file=terraform.tfvars
terraform apply -var-file=terraform.tfvars
```

> Tip: Store your `terraform.tfvars` under a secure environment-specific path or pipeline variable group. The example file shows the expected keys.
