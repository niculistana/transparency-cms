# Terraform does not manage database resources - all environments use external managed databases
# Database connection strings are stored in AWS Secrets Manager per environment

variable "aws_region" {
  description = "AWS region to deploy resources (environment-specific)"
  type        = string
  default     = "ap-southeast-1"
}