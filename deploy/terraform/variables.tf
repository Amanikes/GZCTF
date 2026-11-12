variable "aws_region" {
  description = "AWS region to deploy into"
  type        = string
  default     = "us-east-1"
}

variable "project" {
  description = "Name prefix for created resources"
  type        = string
  default     = "gzctf"
}

variable "instance_type" {
  description = "EC2 instance type; t3.large (2 vCPU / 8 GB) handles about 10 teams"
  type        = string
  default     = "t3.large"
}

variable "key_name" {
  description = "Name of an existing EC2 key pair used for SSH"
  type        = string
}

variable "allowed_ssh_cidr" {
  description = "CIDR allowed to reach port 22; restrict this to your own address"
  type        = string
  default     = "0.0.0.0/0"
}

variable "root_volume_gb" {
  description = "Root EBS volume size in GB"
  type        = number
  default     = 48
}

variable "challenge_port_min" {
  description = "First host port Docker uses for challenge containers"
  type        = number
  default     = 32768
}

variable "challenge_port_max" {
  description = "Last host port Docker uses for challenge containers"
  type        = number
  default     = 60999
}

variable "domain" {
  description = "Public hostname for the platform, when DNS is managed elsewhere"
  type        = string
  default     = null
}

variable "route53_zone_id" {
  description = "Optional Route53 zone in which to create an A record; requires var.domain"
  type        = string
  default     = null
}

variable "tags" {
  description = "Extra tags applied to every resource"
  type        = map(string)
  default     = {}
}
