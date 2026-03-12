# Azure AI Gateway Automation

Inspired by **AI Gateway Automation**, this workspace codifies a configuration-first approach to deploying the **Azure AI Foundry Model Gateway** pattern with both Terraform and Bicep. The goal is to let you compare two IaC toolchains while retaining a consistent set of parameters, guardrails, monitoring, and governance.

## Why this project exists

- **Automate the Model Gateway** — provision Azure AI Foundry, APIM (Model Gateway), monitoring, and policies so inference traffic flows through a centralized gateway.
- **Configuration-first** — every resource is controlled via variables/parameters so pipelines and environments (dev/test/prod) stay consistent.
- **Dual-stack enablement** — Terraform and Bicep live side-by-side as distinct projects, giving you flexibility to adopt the tool that matches your deployment workflow.
- **Continuous improvement mindset** — document changes, add modules, or extend policies each time this workspace evolves.

## Architectural context

The Model Gateway pattern routes Foundry Agent traffic through APIM before reaching Azure AI services and OpenAI deployments. The gateway adds enterprise features (security, rate limiting, caching) while telemetry streams to Application Insights + Log Analytics. For a picture of the flow, see `images/foundry-model-gateway.gif` and `docs/reference.md`.

## Quick links

- Terraform stack: `terraform/README.md`
- Bicep stack: `bicep/README.md`
- Reference lab narrative: `docs/reference.md`

## What you should have ready

1. Azure CLI signed in with a subscription that has Contributor/Owner privileges.
2. Python 3.12+ and VS Code (for optional notebooks referenced in the reference doc).
3. A storage account or backend for Terraform state if you plan to persist it.


## Getting started

1. Choose your stack (`terraform` or `bicep`).
2. Review that stack's README to see required inputs and commands.
3. Provide values for every parameter in `terraform/terraform.tfvars.example` or `bicep/parameters.json`.
4. Apply the stack and verify APIM + AI Foundry connectivity with monitoring policies.

For the Terraform and Bicep stacks, the following configuration surface remains consistent: subscription, resource group, location, environment tag, APIM SKU, gateway name, and OpenAI model/connection metadata. This keeps deployments predictable and easier to automate with CI/CD.
