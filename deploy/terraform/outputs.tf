output "instance_id" {
  description = "EC2 instance id"
  value       = aws_instance.gzctf.id
}

output "public_ip" {
  description = "Elastic IP of the platform host"
  value       = aws_eip.gzctf.public_ip
}

output "ssh_command" {
  description = "SSH command for the instance"
  value       = "ssh -i <path-to-key>.pem ubuntu@${aws_eip.gzctf.public_ip}"
}

output "url" {
  description = "Public URL of the platform"
  value       = var.domain == null ? "https://${aws_eip.gzctf.public_ip}.sslip.io" : "https://${var.domain}"
}
