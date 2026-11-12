data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  filter {
    name   = "architecture"
    values = ["x86_64"]
  }
}

data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

resource "aws_security_group" "gzctf" {
  name        = "${var.project}-sg"
  description = "GZ::CTF platform ingress and egress"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.allowed_ssh_cidr]
  }

  ingress {
    description = "HTTP for redirect and ACME"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTP/3"
    from_port   = 443
    to_port     = 443
    protocol    = "udp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Challenge container host ports"
    from_port   = var.challenge_port_min
    to_port     = var.challenge_port_max
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "All outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_instance" "gzctf" {
  ami                         = data.aws_ami.ubuntu.id
  instance_type               = var.instance_type
  key_name                    = var.key_name
  subnet_id                   = data.aws_subnets.default.ids[0]
  vpc_security_group_ids      = [aws_security_group.gzctf.id]
  associate_public_ip_address = true

  root_block_device {
    volume_size = var.root_volume_gb
    volume_type = "gp3"
    encrypted   = true
  }

  user_data = <<-EOT
    #!/bin/bash
    set -euo pipefail
    if ! command -v docker >/dev/null 2>&1; then
      curl -fsSL https://get.docker.com | sh
    fi
    systemctl enable --now docker
    install -d -m 0755 /opt/gzctf
  EOT

  tags = merge(var.tags, { Name = "${var.project}-host" })
}

resource "aws_eip" "gzctf" {
  domain = "vpc"

  tags = merge(var.tags, { Name = "${var.project}-eip" })
}

resource "aws_eip_association" "gzctf" {
  instance_id   = aws_instance.gzctf.id
  allocation_id = aws_eip.gzctf.id
}

resource "aws_route53_record" "gzctf" {
  count = var.route53_zone_id == null ? 0 : 1

  zone_id = var.route53_zone_id
  name    = var.domain
  type    = "A"
  ttl     = 60
  records = [aws_eip.gzctf.public_ip]
}
