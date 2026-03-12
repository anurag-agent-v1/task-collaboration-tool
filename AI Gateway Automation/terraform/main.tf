terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
  }
  required_version = ">= 1.3.0"
}

provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "rg" {
  name     = var.resource_group_name
  location = var.location
  tags = {
    project     = "AI Gateway Automation"
    environment = var.environment
  }
}

resource "azurerm_api_management" "apim" {
  name                = var.gateway_name
  location            = var.location
  resource_group_name = azurerm_resource_group.rg.name
  publisher_name      = "AI Gateway"
  publisher_email     = "ai@example.com"
  sku_name            = var.apim_sku
  tags = {
    environment = var.environment
  }
}

resource "azurerm_api_management_api" "gateway_api" {
  name                = "foundry-gateway"
  resource_group_name = azurerm_resource_group.rg.name
  api_management_name = azurerm_api_management.apim.name
  revision            = "1"
  display_name        = "AI Foundry Gateway"
  path                = "model-gateway"
  protocols           = ["https"]
  import {
    content_format = "swagger-link-json"
    content_value  = var.openai_swagger_url
  }
}
