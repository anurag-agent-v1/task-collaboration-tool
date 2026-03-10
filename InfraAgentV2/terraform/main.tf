terraform {
  required_version = ">= 1.4"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = ">= 3.0"
    }
  }
}

provider "azurerm" {
  features        = {}
  subscription_id = var.subscription_id
}

locals {
  tags = merge({
    project     = "InfraAgentV2"
    environment = var.environment
  }, var.tags)

  apim_name                 = "${var.gateway_prefix}-apim"
  cognitive_name            = "${var.gateway_prefix}-cog"
  log_workspace             = "${var.gateway_prefix}-law"
  application_insights_name = "${var.gateway_prefix}-ai"
}

resource "azurerm_resource_group" "main" {
  name     = var.resource_group_name
  location = var.location
  tags     = local.tags
}

resource "azurerm_log_analytics_workspace" "monitoring" {
  name                = local.log_workspace
  location            = var.location
  resource_group_name = azurerm_resource_group.main.name
  sku                 = "PerGB2018"
  retention_in_days   = var.monitoring_retention_days
  tags                = local.tags
}

resource "azurerm_application_insights" "observability" {
  name                = local.application_insights_name
  location            = var.location
  resource_group_name = azurerm_resource_group.main.name
  application_type    = "web"
  tags                = local.tags
}

resource "azurerm_api_management" "gateway" {
  name                = local.apim_name
  location            = var.location
  resource_group_name = azurerm_resource_group.main.name
  publisher_name      = var.apim_publisher_name
  publisher_email     = var.apim_publisher_email
  sku_name            = var.apim_sku
  tags                = local.tags
}

resource "azurerm_api_management_api" "model_gateway" {
  name                = "foundry-model-gateway"
  resource_group_name = azurerm_resource_group.main.name
  api_management_name = azurerm_api_management.gateway.name
  display_name        = "Model Gateway API"
  path                = "model-gateway"
  protocols           = ["https"]
  revision            = "1"

  import {
    content_format = "swagger-json"
    content_value  = jsonencode({
      openapi = "3.0.1"
      info = {
        title   = "Model Gateway"
        version = "1.0.0"
      }
      paths = {}
    })
  }
}

resource "azurerm_cognitive_account" "ai_services" {
  name                = local.cognitive_name
  resource_group_name = azurerm_resource_group.main.name
  location            = var.location
  kind                = "CognitiveServices"
  sku_name            = "S0"
  tags                = local.tags
}

resource "azurerm_monitor_diagnostic_setting" "apim" {
  name                       = "apim-monitor"
  target_resource_id         = azurerm_api_management.gateway.id
  log_analytics_workspace_id = azurerm_log_analytics_workspace.monitoring.id

  log {
    category = "GatewayLogs"
    enabled  = true
  }

  log {
    category = "GatewayRequests"
    enabled  = true
  }

  metric {
    category = "AllMetrics"
    enabled  = true
  }
}
