variable "subscription_id" {
  description = "Azure subscription used for all resources"
  type        = string
}

variable "resource_group_name" {
  description = "Name of the shared resource group for Gateway components"
  type        = string
}

variable "location" {
  description = "Primary Azure region for the deployment"
  type        = string
}

variable "environment" {
  description = "Environment tag (dev/test/prod)"
  type        = string
  default     = "dev"
}

variable "extra_tags" {
  description = "Additional tags merged into every resource"
  type        = map(string)
  default     = {}
}

variable "gateway_name" {
  description = "Name used for the APIM gateway instance"
  type        = string
}

variable "apim_sku" {
  description = "APIM SKU, keeps traffic and performance in check"
  type        = string
  default     = "Developer_1"
}

variable "apim_publisher_name" {
  description = "Publisher name shown in APIM"
  type        = string
  default     = "AI Gateway Team"
}

variable "apim_publisher_email" {
  description = "Publisher email for monitoring and notifications"
  type        = string
  default     = "apimgateway@microsoft.com"
}

variable "apim_notification_email" {
  description = "Sender email that APIM uses for notifications"
  type        = string
  default     = "apimgateway@microsoft.com"
}

variable "openai_swagger_url" {
  description = "Swagger/OpenAPI definition describing the gateway contract"
  type        = string
}

variable "openai_model" {
  description = "Name of the OpenAI model deployed behind Foundry"
  type        = string
  default     = "GPT-4o-mini"
}

variable "openai_model_uri" {
  description = "URI pointing to the OpenAI model deployment"
  type        = string
  default     = "https://api.openai.com/v1/models/gpt-4o-mini"
}

variable "foundry_sku" {
  description = "SKU for the AI Foundry hub"
  type        = string
  default     = "Standard"
}

variable "foundry_private_endpoint" {
  description = "Whether to enable private endpoints for Foundry components"
  type        = bool
  default     = false
}

variable "monitoring_retention_days" {
  description = "Retention period for the Log Analytics workspace"
  type        = number
  default     = 30
}
