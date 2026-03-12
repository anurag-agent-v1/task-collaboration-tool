output "apim_gateway_url" {
  description = "HTTPS endpoint exposed by the APIM gateway"
  value       = azurerm_api_management.gateway.gateway_url
}

output "apim_model_api_id" {
  description = "API ID for the models proxy"
  value       = azurerm_api_management_api.model_gateway.id
}

output "foundry_hub_id" {
  description = "Resource ID of the Foundry hub"
  value       = azapi_resource.foundry_hub.id
}

output "model_deployment_id" {
  description = "Resource ID for the managed model deployment"
  value       = azapi_resource.model_deployment.id
}

output "monitoring_workspace_id" {
  description = "Log Analytics workspace used for telemetry"
  value       = azurerm_log_analytics_workspace.monitor.id
}

output "application_insights_instrumentation_key" {
  description = "Instrumentation key exposed by Application Insights"
  value       = azurerm_application_insights.ai.instrumentation_key
}
