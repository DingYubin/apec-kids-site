#!/usr/bin/env bash
# 把 web/ 同步部署到腾讯云轻量服务器（主站）http://119.91.33.40/
# 用法：bash tools/deploy-server.sh
# 说明：服务器 SSH 别名 apec 定义在 ~/.ssh/config（免密登录）
set -euo pipefail

cd "$(dirname "$0")/.."

HOST="apec"                 # ~/.ssh/config 里的 Host 别名
REMOTE_TMP="/tmp/apec-web"  # 先传到中转目录，再上 sudo 覆盖站点目录
REMOTE_ROOT="/var/www/apec" # Nginx 站点目录

echo "→ 同步 web/ 到服务器中转目录…"
rsync -av --delete "web/" "$HOST:$REMOTE_TMP/"

echo "→ 覆盖站点目录并修正权限…"
ssh "$HOST" "sudo rsync -a --delete '$REMOTE_TMP/' '$REMOTE_ROOT/' && sudo chown -R www-data:www-data '$REMOTE_ROOT'"

echo
echo "✅ 部署完成。刷新查看：http://119.91.33.40/"
