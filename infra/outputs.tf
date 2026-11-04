output "frontend_bucket" {
  value = local.frontend_bucket
}

output "artifacts_bucket" {
  value = local.artifacts_bucket
}

output "website_url" {
  value = "http://${local.frontend_bucket}.s3-website-${var.aws_region}.amazonaws.com"
}

output "api_url" {
  value = "http://${aws_eip.api.public_ip}:8000"
}

output "instance_id" {
  value = aws_instance.api.id
}

output "postgres_password" {
  value     = random_password.db.result
  sensitive = true
}
