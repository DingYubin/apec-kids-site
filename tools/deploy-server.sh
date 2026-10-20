#!/usr/bin/env bash
# 把 web/ 同步部署到腾讯云轻量服务器（主站）http://119.91.33.40/
# 用法：bash tools/deploy-server.sh
# 说明：服务器 SSH 别名 apec 定义在 ~/.ssh/config（免密登录）
set -euo pipefail

cd "$(dirname "$0")/.."

HOST="apec"                         # ~/.ssh/config 里的 Host 别名
REMOTE_TMP="/tmp/apec-web"          # 先传到中转目录，再上 sudo 覆盖站点目录
REMOTE_ROOT="/var/www/apec"         # Nginx 站点目录
REMOTE_NGINX="/tmp/apec-nginx.conf" # Nginx 配置中转文件

echo "→ 同步 web/ 到服务器中转目录…"
rsync -av --delete "web/" "$HOST:$REMOTE_TMP/"

echo "→ 上传 Nginx 配置…"
rsync -av "tools/nginx-apec.conf" "$HOST:$REMOTE_NGINX"

echo "→ 覆盖站点目录并修正权限…"
ssh "$HOST" "sudo rsync -a --delete '$REMOTE_TMP/' '$REMOTE_ROOT/' && sudo chown -R www-data:www-data '$REMOTE_ROOT'"

echo "→ 安装 Nginx 配置并重载服务…"
ssh "$HOST" "sudo install -m 0644 '$REMOTE_NGINX' /etc/nginx/sites-available/apec && sudo ln -sfn /etc/nginx/sites-available/apec /etc/nginx/sites-enabled/apec && sudo nginx -t && sudo systemctl reload nginx"

echo "→ 检查首页、分享图与自定义 404…"
ROOT_CODE=$(curl -sS -o /dev/null -w '%{http_code}' --max-time 10 http://119.91.33.40/)
MISSING_CODE=$(curl -sS -o /dev/null -w '%{http_code}' --max-time 10 http://119.91.33.40/__apec_missing_page__)
OG_CODE=$(curl -sS -o /dev/null -w '%{http_code}' --max-time 10 http://119.91.33.40/assets/share/og-cover.jpg)
MISSING_BODY=$(curl -sS --max-time 10 http://119.91.33.40/__apec_missing_page__)
if [ "$ROOT_CODE" != "200" ]; then
  echo "❌ 首页返回 HTTP $ROOT_CODE" >&2
  exit 1
fi
if [ "$MISSING_CODE" != "404" ]; then
  echo "❌ 不存在路径返回 HTTP $MISSING_CODE（应为 404）" >&2
  exit 1
fi
if ! printf '%s' "$MISSING_BODY" | grep -q '这只小鹏友迷路了'; then
  echo "❌ 404 页面没有返回站点自定义内容" >&2
  exit 1
fi
if [ "$OG_CODE" != "200" ]; then
  echo "❌ 分享预览图返回 HTTP $OG_CODE" >&2
  exit 1
fi

echo
echo "✅ 部署完成。刷新查看：http://119.91.33.40/"
echo "✅ 自定义 404 检查通过：http://119.91.33.40/__apec_missing_page__"
echo "✅ 分享预览图检查通过：http://119.91.33.40/assets/share/og-cover.jpg"
