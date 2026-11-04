output "frontend_bucket" {
  value = aws_s3_bucket.frontend.bucket
}

output "artifacts_bucket" {
  value = aws_s3_bucket.artifacts.bucket
}

output "website_url" {
  value = "http://${aws_s3_bucket_website_configuration.frontend.website_endpoint}"
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
