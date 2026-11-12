#!/usr/bin/env bash
#
# Install and start GZ::CTF on a single Ubuntu/Debian host.
#
#   sudo DOMAIN=ctf.example.com \
#        ADMIN_PASSWORD='<strong password>' \
#        EMAIL=you@example.com \
#        bash setup.sh
#
# Idempotent: re-running keeps the existing .env (secrets stay stable)
# and only refreshes the compose files.
#
set -euo pipefail

if [[ ${EUID} -ne 0 ]]; then
  echo "Run this script as root (sudo)." >&2
  exit 1
fi

: "${DOMAIN:?Set DOMAIN, for example DOMAIN=ctf.example.com}"
: "${ADMIN_PASSWORD:?Set ADMIN_PASSWORD (at least 8 chars, with upper, lower, digit)}"

EMAIL=${EMAIL:-}
TZ=${TZ:-UTC}
GZCTF_IMAGE=${GZCTF_IMAGE:-gzctf:axumsec}
PUBLIC_HOST=${PUBLIC_HOST:-$DOMAIN}
DEPLOY_DIR=/opt/gzctf
SRC_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)

if ! command -v openssl >/dev/null; then
  apt-get update && apt-get install -y openssl
fi

if ! command -v docker >/dev/null; then
  echo "Installing Docker..."
  curl -fsSL https://get.docker.com | sh
fi
systemctl enable --now docker

install -d -m 0755 "$DEPLOY_DIR"
install -m 0644 "$SRC_DIR/compose.yaml" "$DEPLOY_DIR/compose.yaml"
install -m 0644 "$SRC_DIR/Caddyfile" "$DEPLOY_DIR/Caddyfile"

# the container runs as uid/gid 1654 and must own its data directory
install -d -o 1654 -g 1654 -m 0755 "$DEPLOY_DIR/files"

DOCKER_GID=$(stat -c '%g' /var/run/docker.sock)

if [[ ! -f "$DEPLOY_DIR/.env" ]]; then
  POSTGRES_PASSWORD=$(openssl rand -hex 24)
  XOR_KEY=$(openssl rand -hex 16)
  cat > "$DEPLOY_DIR/.env" <<EOF
DOMAIN=$DOMAIN
ACME_EMAIL=$EMAIL
PUBLIC_HOST=$PUBLIC_HOST
TZ=$TZ
GZCTF_IMAGE=$GZCTF_IMAGE
POSTGRES_PASSWORD=$POSTGRES_PASSWORD
XOR_KEY=$XOR_KEY
ADMIN_PASSWORD=$ADMIN_PASSWORD
DOCKER_GID=$DOCKER_GID
EOF
  chmod 0600 "$DEPLOY_DIR/.env"
  echo "Generated $DEPLOY_DIR/.env"
else
  sed -i "s/^DOCKER_GID=.*/DOCKER_GID=$DOCKER_GID/" "$DEPLOY_DIR/.env"
  echo "Reusing existing $DEPLOY_DIR/.env"
fi

if ! docker image inspect "$GZCTF_IMAGE" >/dev/null 2>&1; then
  echo "WARNING: image '$GZCTF_IMAGE' is not loaded on this host." >&2
  echo "Load it first: docker save ... | gzip | ssh ... 'gunzip | sudo docker load'" >&2
fi

cd "$DEPLOY_DIR"
docker compose pull postgres redis caddy
docker compose up -d
docker compose ps

cat <<EOF

GZ::CTF is starting.
  URL:      https://$DOMAIN
  Data:     $DEPLOY_DIR/files
  Compose:  $DEPLOY_DIR/compose.yaml
  Secrets:  $DEPLOY_DIR/.env  (chmod 600)

Make sure the EC2 security group allows:
  22/tcp    from your admin IP only
  80/tcp    from 0.0.0.0/0   (ACME HTTP challenge)
  443/tcp   from 0.0.0.0/0
  32768-60999/tcp from 0.0.0.0/0  (dynamic challenge containers)

Logs:  docker compose -f $DEPLOY_DIR/compose.yaml logs -f gzctf
EOF
