variable "aws_region" {
  type        = string
  description = "Learner Lab region. Keep this as us-east-1."
  default     = "us-east-1"
}

variable "instance_type" {
  type        = string
  description = "EC2 size. Learner Lab allows nano through large."
  default     = "t3.micro"
}

variable "key_name" {
  type        = string
  description = "Existing key pair in us-east-1. The lab provides vockey."
  default     = "vockey"
}

variable "data_volume_gb" {
  type        = number
  description = "Postgres disk size. The lab cap is 100 GB and gp3 is required."
  default     = 20
}

variable "confirm_budget" {
  type        = bool
  description = "Must be true before Terraform creates billable EC2 and Elastic IP resources."
  default     = false
}
