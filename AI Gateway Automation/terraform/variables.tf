variable "subscription_id" {
  description = "Subscription id to deploy into"
  type        = string
}

variable "resource_group_name" {
  description = "Resource group name for the gateway"
  type        = string
}

variable "location" {
  description = "Azure region"
  type        = string
}

variable "apim_sku" {
  description = "APIM SKU"
  type        = string
  default     = "Developer_1"
}

variable "gateway_name" {
  description = "APIM gateway name"
  type        = string
}

variable "environment" {
  description = "Environment tag"
  type        = string
  default     = "dev"
}

variable "openai_swagger_url" {
  description = "Swagger URL for model gateway import"
  type        = string
}
