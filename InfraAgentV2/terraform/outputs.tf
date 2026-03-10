output "resource_group_name" {
  description = "Name of the resource group where everything is deployed."
  value       = azurerm_resource_group.main.name
}

output "apim_gateway_url" {
  description = "Gateway endpoint that Foundry Agents will talk to."
  value       = azurerm_api_management.gateway.gateway_url
}

output "log_analytics_workspace_id" {
  description = "Workspace that receives diagnostic logs for APIM."
  value       = azurerm_log_analytics_workspace.monitoring.id
}

output "application_insights_instrumentation_key" {
  description = "Instrumentation key for the Application Insights instance."
  value       = azurerm_application_insights.observability.instrumentation_key
}
