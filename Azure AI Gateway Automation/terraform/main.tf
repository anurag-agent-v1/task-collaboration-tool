terraform {
  required_version = ">= 1.5.0"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = ">= 3.90"
    }
    azapi = {
      source  = "azure/azapi"
      version = ">= 1.6"
    }
  }
}

provider "azurerm" {
  features {}
}

provider "azapi" {}

locals {
  common_tags = merge({
    Environment = var.environment
    Project     = "AI Gateway"
  }, var.extra_tags)
}

resource "azurerm_resource_group" "rg" {
  name     = var.resource_group_name
  location = var.location
  tags     = local.common_tags
}

resource "azurerm_log_analytics_workspace" "monitor" {
  name                = "${var.environment}-ai-gateway-law"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  sku                 = "PerGB2018"
  retention_in_days   = var.monitoring_retention_days
  tags                = local.common_tags
}

resource "azurerm_application_insights" "ai" {
  name                = "${var.environment}-ai-gateway-ai"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  application_type    = "web"
  tags                = local.common_tags
}

resource "azurerm_api_management" "gateway" {
  name                = var.gateway_name
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  publisher_name      = var.apim_publisher_name
  publisher_email     = var.apim_publisher_email
  sku_name            = var.apim_sku
  tags                = local.common_tags
  notification_sender_email = var.apim_notification_email
}

resource "azurerm_api_management_api" "model_gateway" {
  name                = "${var.gateway_name}-foundry-gateway"
  resource_group_name = azurerm_resource_group.rg.name
  api_management_name = azurerm_api_management.gateway.name
  revision            = "1"
  display_name        = "AI Foundry Model Gateway"
  path                = "models"
  protocols           = ["https"]
  import {
    content_format = "swagger-link-json"
    content_value  = var.openai_swagger_url
  }
  tags = local.common_tags
}

resource "azapi_resource" "foundry_hub" {
  type      = "Microsoft.AIFoundry/hubs"
  name      = "${var.environment}-foundry-hub"
  parent_id = azurerm_resource_group.rg.id
  location  = azurerm_resource_group.rg.location
  api_version = "2024-08-01-preview"
  body = jsonencode({
    sku = {
      name = var.foundry_sku
    }
    properties = {
      projectName = "${var.environment}-project"
      environment = var.environment
      network = {
        enablePrivateEndpoint = var.foundry_private_endpoint
      }
    }
    tags = local.common_tags
  })
}

resource "azapi_resource" "model_deployment" {
  type      = "Microsoft.AIFoundry/hubs/projects/models"
  name      = "${var.environment}-model"
  parent_id = azapi_resource.foundry_hub.id
  api_version = "2024-08-01-preview"
  body = jsonencode({
    modelName = var.openai_model
    description = "Managed deployment for ${var.environment}"
    properties = {
      modelUri = var.openai_model_uri
    }
  })
}
