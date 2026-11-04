resource "aws_security_group" "api" {
  name        = "study-planner-api"
  description = "HTTP access to the study planner API"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description = "API"
    from_port   = 8000
    to_port     = 8000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_instance" "api" {
  ami                         = data.aws_ami.amazon_linux.id
  instance_type               = var.instance_type
  subnet_id                   = data.aws_subnets.default.ids[0]
  vpc_security_group_ids      = [aws_security_group.api.id]
  iam_instance_profile        = "LabInstanceProfile"
  key_name                    = var.key_name
  associate_public_ip_address = true

  user_data = <<-EOT
    #!/bin/bash
    set -euo pipefail
    dnf install -y docker unzip curl xfsprogs
    systemctl enable --now docker
    mkdir -p /usr/local/lib/docker/cli-plugins
    curl -fsSL https://github.com/docker/compose/releases/download/v2.32.4/docker-compose-linux-x86_64 -o /usr/local/lib/docker/cli-plugins/docker-compose
    chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
    mkdir -p /mnt/pgdata /opt/planner
  EOT

  user_data_replace_on_change = true

  root_block_device {
    volume_type = "gp3"
    volume_size = 8
  }

  depends_on = [terraform_data.budget_ack]

  tags = {
    Name = "study-planner-api"
  }
}

resource "aws_ebs_volume" "postgres" {
  availability_zone = aws_instance.api.availability_zone
  size              = var.data_volume_gb
  type              = "gp3"

  tags = {
    Name = "study-planner-postgres"
  }
}

resource "aws_volume_attachment" "postgres" {
  device_name = "/dev/sdf"
  volume_id   = aws_ebs_volume.postgres.id
  instance_id = aws_instance.api.id
}

resource "aws_eip" "api" {
  domain = "vpc"

  tags = {
    Name = "study-planner-api"
  }
}

resource "aws_eip_association" "api" {
  instance_id   = aws_instance.api.id
  allocation_id = aws_eip.api.id
}
