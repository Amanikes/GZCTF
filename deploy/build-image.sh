#!/usr/bin/env bash
#
# Build the GZ::CTF application image from this checkout.
# Run on the machine that has the repository, not on the server.
#
set -euo pipefail

REPO_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
IMAGE=${GZCTF_IMAGE:-gzctf:axumsec}

cd "$REPO_ROOT/src/GZCTF/ClientApp"
pnpm install --frozen-lockfile

cd "$REPO_ROOT/src/GZCTF"
rm -rf publish
dotnet publish GZCTF.csproj -c Release -o publish/linux/amd64 -r linux-x64 --no-self-contained \
  /p:PublishReadyToRun=true

docker build -t "$IMAGE" .

echo
echo "Built image: $IMAGE"
echo "Next: copy it to the server with"
echo "  docker save $IMAGE | gzip | ssh <user>@<host> 'gunzip | sudo docker load'"
