# InfraAgentV2: Dual-stack Deployment for Azure AI Gateway

This workspace is dedicated to automating the **Azure AI Foundry Model Gateway** pattern with two independent infrastructure-as-code toolchains. The goal is to keep Terraform and Bicep projects parallel, configuration-driven, and aligned with the reference architecture that routes Foundry Agent traffic through APIM before it touches Azure AI Services or OpenAI model deployments.

## What's inside

- `terraform/` – a configuration-first Terraform stack that provisions the AI Foundry resources, APIM gateway, monitoring, and diagnostics.
- `bicep/` – a matching Bicep stack that mirrors the same intent, variables, and tagging model so teams can pick their preferred deployment tool.
- `docs/reference.md` – the reference lab narrative (from the provided specification) describing the Model Gateway flow, prerequisites, and cleanup guidance.
- `images/foundry-model-gateway.gif` – placeholder for the referenced architecture diagram so documentation stays complete.

## Deployment strategy

Every stack is parameterized via variables/parameters so environments (dev/test/prod) simply supply overrides rather than editing templates. Tags, naming prefixes, SKU choices, and OpenAI model metadata are surfaced at the surface level so pipelines can consume them. Each stack also emits clear outputs (resource group, APIM hostname, gateway ID) that other automation stages can consume.

## Getting started

1. Inspect the stack you want to deploy (`terraform` vs `bicep`).
2. Supply configuration through `terraform.tfvars` or `parameters.json`.
3. Initialize and apply the stack with your Azure identity.
4. Validate that APIM appears in Azure Portal, logging is routed to Application Insights + Log Analytics, and the Model Gateway connection references the AI Foundry services.

## Continuous improvement

Treat every change as an opportunity to extend policies, enrich monitoring, and keep the configuration surface as the single source of truth. Commit history should reflect those improvements so future collaborators can trace why choices were made.
