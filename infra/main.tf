data "aws_caller_identity" "current" {}

data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }

  filter {
    name   = "default-for-az"
    values = ["true"]
  }
}

data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-2023*-x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

resource "random_password" "db" {
  length  = 24
  special = false
}

resource "terraform_data" "budget_ack" {
  lifecycle {
    precondition {
      condition     = var.confirm_budget
      error_message = "Set confirm_budget=true only when a Learner Lab session is running and you mean to spend budget."
    }
  }
}

check "region_is_lab_region" {
  assert {
    condition     = var.aws_region == "us-east-1" || var.aws_region == "us-west-2"
    error_message = "The Learner Lab only allows us-east-1 and us-west-2. This project uses us-east-1."
  }
}
