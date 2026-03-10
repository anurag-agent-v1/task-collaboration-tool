variable "subscription_id" {
  description = "Azure subscription that will own the gateway resources."
  type        = string
}

variable "resource_group_name" {
  description = "Name for the resource group that will host the gateway stack."
  type        = string
  default     = "infraagent-rg"
}

variable "location" {
  description = "Azure region for all resources."
  type        = string
  default     = "eastus"
}

variable "environment" {
  description = "Deployment environment (dev/test/prod)."
  type        = string
  default     = "dev"
}

variable "gateway_prefix" {
  description = "Prefix used to name the gateway resources."
  type        = string
  default     = "infraagent"
}

variable "apim_sku" {
  description = "APIM SKU that defines the gateway capabilities."
  type        = string
  default     = "Developer"
}

variable "apim_publisher_name" {
  description = "Name shown in APIM as the publisher."
  type        = string
  default     = "InfraAgentV2 Team"
}

variable "apim_publisher_email" {
  description = "Contact email for the APIM publisher."
  type        = string
  default     = "infraagent@example.com"
}

variable "monitoring_retention_days" {
  description = "Log Analytics retention setting for monitoring data."
  type        = number
  default     = 30
}

variable "tags" {
  description = "Additional tags that can be merged with the default tag set."
  type        = map(string)
  default     = {}
}
