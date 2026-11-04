#!/bin/bash
set -euo pipefail

if ! command -v docker >/dev/null 2>&1; then
  dnf install -y docker
  systemctl enable --now docker
fi

if ! docker compose version >/dev/null 2>&1; then
  mkdir -p /usr/local/lib/docker/cli-plugins
  curl -fsSL "https://github.com/docker/compose/releases/download/v2.32.4/docker-compose-linux-x86_64" \
    -o /usr/local/lib/docker/cli-plugins/docker-compose
  chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
fi

if ! command -v mkfs.xfs >/dev/null 2>&1; then
  dnf install -y xfsprogs
fi

mkdir -p /mnt/pgdata
device=""
for candidate in /dev/nvme1n1 /dev/sdf /dev/xvdf; do
  if [ -b "$candidate" ]; then
    device="$candidate"
    break
  fi
done

if [ -n "$device" ]; then
  if ! blkid "$device" >/dev/null 2>&1; then
    mkfs.xfs "$device"
  fi
  if ! grep -q "/mnt/pgdata" /etc/fstab; then
    echo "$device /mnt/pgdata xfs defaults,nofail 0 2" >> /etc/fstab
  fi
  if ! mountpoint -q /mnt/pgdata; then
    mount /mnt/pgdata
  fi
fi

cd /opt/planner
export PGDATA_DIR="${PGDATA_DIR:-/mnt/pgdata}"
docker compose up -d --build

for _ in $(seq 1 30); do
  if curl -fsS http://127.0.0.1:8000/health >/dev/null; then
    exit 0
  fi
  sleep 5
done

docker compose logs
exit 1
