# AI Gateway Automation

A dual-stack automation workspace for deploying the **Azure AI Foundry Model Gateway** pattern. The goal is to configure Azure API Management (APIM) as a secure, enterprise-grade gateway for Azure AI Foundry agents and OpenAI model deployments, using both Terraform and Bicep so you can choose the toolset that fits your pipeline.

## Architecture in brief

- **Azure AI Foundry** (AI services + model deployments) powers the intelligence layer.
- **Azure API Management (APIM)** sits in front as the Model Gateway, exposing secure endpoints and enforcing policies (security, caching, rate limits).
- **APIM → AI Services** connection uses service-to-service routing; the gateway name and environment tags are parameterized so deployments stay consistent across stages.
- **Observability** is forwarded to Application Insights + Log Analytics so you can monitor, detect anomalies, and audit traffic.

## Project layout

```
AI Gateway Automation/
├── terraform/
│   ├── main.tf
│   ├── variables.tf
│   ├── outputs.tf
│   └── README.md
└── bicep/
    ├── main.bicep
    ├── parameters.json
    └── README.md
```

Each folder keeps configuration-driven inputs for Subscription ID, Resource Group, Region, SKU preferences, Gateway Name, and Environment. Review the README inside the desired stack to see specific commands for initialization, planning, and applying the deployment.
