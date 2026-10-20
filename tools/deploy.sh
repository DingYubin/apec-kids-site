#!/usr/bin/env bash
# 把 web/ 目录发布到 GitHub Pages（gh-pages 分支，备用站点）
# 用法：先 commit 改动，再执行  bash tools/deploy.sh
set -euo pipefail

cd "$(dirname "$0")/.."

if [ -n "$(git status --porcelain -- web)" ]; then
  echo "⚠️  web/ 有未提交或未跟踪的改动：先 git add + git commit，再跑本脚本" >&2
  exit 1
fi

SHA=$(git subtree split --prefix web HEAD)
git push -f origin "$SHA:refs/heads/gh-pages"

echo
echo "✅ 已推送。等 1-2 分钟刷新："
echo "   https://dingyubin.github.io/apec-kids-site/"
