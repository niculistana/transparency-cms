output "https_url" {
  description = "HTTPS URL to access the web server"
  value       = "https://${aws_instance.webserver.public_ip}"
}

output "access_instructions" {
  description = "Instructions to access the web server"
  value       = <<-EOT
    Environment: prod
    
    To test the web server, run:
    curl -k https://${aws_instance.webserver.public_ip}
    
    Note: The -k flag is needed because we're using a self-signed certificate.
    
    Database: Connected via AWS Secrets Manager secret at prod/TransparencyCMS/RDS_PSQL_CONNECTION_STRING
  EOT
}
