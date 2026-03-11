terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Get the default VPC
data "aws_vpc" "default" {
  default = true
}

# Security group that only allows HTTPS inbound and all outbound HTTPS
resource "aws_security_group" "webserver_sg" {
  name        = "prod-webserver-https-only-sg"
  description = "Allow HTTPS inbound traffic only"
  vpc_id      = data.aws_vpc.default.id

  # Allow HTTPS inbound
  ingress {
    description = "HTTPS from anywhere"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Allow only HTTPS outbound
  egress {
    description = "HTTPS outbound only"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Allow HTTP outbound for package downloads during setup
  egress {
    description = "HTTP outbound for setup"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "prod-webserver-https-only"
  }
}

# Get the latest Amazon Linux 2023 AMI
data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# Get secret from secret manager
# Database is NOT managed by Terraform - connection string stored in Secrets Manager
# Expects format: {"RDS_PSQL_CONNECTION_STRING": "postgresql://..."}
data "aws_secretsmanager_secret_version" "credentials" {
  secret_id = "prod/TransparencyCMS/RDS_PSQL_CONNECTION_STRING"
}

locals {
  db_creds = jsondecode(data.aws_secretsmanager_secret_version.credentials.secret_string)
}

# IAM role for EC2 instance
resource "aws_iam_role" "webserver_role" {
  name = "prod-transparency-cms-webserver-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "prod-transparency-cms-webserver-role"
  }
}

# IAM policy for S3 access
resource "aws_iam_role_policy" "s3_access" {
  name = "prod-s3-deployment-access"
  role = aws_iam_role.webserver_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:ListBucket"
        ]
        Resource = [
          "arn:aws:s3:::bettergov",
          "arn:aws:s3:::bettergov/*"
        ]
      }
    ]
  })
}

# Attach SSM managed policy for Systems Manager access
resource "aws_iam_role_policy_attachment" "ssm_access" {
  role       = aws_iam_role.webserver_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

# IAM instance profile
resource "aws_iam_instance_profile" "webserver_profile" {
  name = "prod-transparency-cms-webserver-profile"
  role = aws_iam_role.webserver_role.name

  tags = {
    Name = "prod-transparency-cms-webserver-profile"
  }
}

# EC2 instance for web server
resource "aws_instance" "webserver" {
  ami           = data.aws_ami.amazon_linux.id
  instance_type = "t3.micro"

  vpc_security_group_ids = [aws_security_group.webserver_sg.id]
  iam_instance_profile   = aws_iam_instance_profile.webserver_profile.name

  user_data = templatefile("${path.module}/scripts/setup-webserver.sh", {
    aws_region   = var.aws_region
    RDS_PSQL_CONNECTION_STRING = local.db_creds.RDS_PSQL_CONNECTION_STRING
  })

  tags = {
    Name = "production-transparency-cms"
  }
}
