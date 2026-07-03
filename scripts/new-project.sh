#!/usr/bin/env bash
#
# new-project.sh — 由模板複製出一個新的課程開發專案
# ------------------------------------------------------------------
# 用法：
#   bash scripts/new-project.sh                       # 互動式輸入
#   bash scripts/new-project.sh <slug> ["專案名稱"] [GAS_API_URL]
#
# 範例：
#   bash scripts/new-project.sh elderly-care-mandarin "外籍看護華語溝通實務班" \
#        "https://script.google.com/macros/s/XXXXXXXX/exec"
#
# 產出：projects/<slug>/index.html + config.js（含 PROJECT_NAME / GAS_API_URL）
# 規則：slug 一律英文 kebab-case（小寫、數字、連字號）。
# ------------------------------------------------------------------
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TEMPLATE_DIR="$REPO_ROOT/template/plan-book"
PROJECTS_DIR="$REPO_ROOT/projects"
PLACEHOLDER_URL="https://script.google.com/macros/s/REPLACE_WITH_YOUR_DEPLOYMENT_ID/exec"

SLUG="${1:-}"
PROJECT_NAME="${2:-}"
GAS_API_URL="${3:-}"

if [ -z "$SLUG" ]; then
  read -r -p "專案 slug（英文 kebab-case，如 elderly-care-mandarin）: " SLUG
fi
if [ -z "$PROJECT_NAME" ]; then
  read -r -p "專案顯示名稱（繁體中文）: " PROJECT_NAME
fi
if [ -z "$GAS_API_URL" ]; then
  read -r -p "GAS /exec 部署網址（可留空，稍後於畫面輸入）: " GAS_API_URL
fi

# 驗證 slug 為 kebab-case 英文
if ! printf '%s' "$SLUG" | grep -Eq '^[a-z0-9]+(-[a-z0-9]+)*$'; then
  echo "✗ slug 不合法：只能用小寫英文、數字與連字號（kebab-case）。收到：$SLUG" >&2
  exit 1
fi

[ -z "$PROJECT_NAME" ] && PROJECT_NAME="iCAP 職能導向課程計畫書（$SLUG）"
[ -z "$GAS_API_URL" ] && GAS_API_URL="$PLACEHOLDER_URL"

DEST="$PROJECTS_DIR/$SLUG"
if [ -e "$DEST" ]; then
  echo "✗ 目標已存在：$DEST（請換 slug 或先移除）" >&2
  exit 1
fi

mkdir -p "$DEST"
cp "$TEMPLATE_DIR/index.html" "$DEST/index.html"

# 產生此專案專屬 config.js
cat > "$DEST/config.js" <<CONFIG
/* 自動產生於 $(date '+%Y-%m-%d %H:%M') by scripts/new-project.sh */
window.PLAN_BOOK_CONFIG = {
  PROJECT_NAME: "$PROJECT_NAME",
  GAS_API_URL: "$GAS_API_URL",
};
CONFIG

echo "✓ 已建立專案：$DEST"
echo "  - index.html（複製自模板）"
echo "  - config.js  → PROJECT_NAME=\"$PROJECT_NAME\""
echo "                 GAS_API_URL=$GAS_API_URL"
if [ "$GAS_API_URL" = "$PLACEHOLDER_URL" ]; then
  echo "  ⚠ 目前為佔位網址；請部署 template/gas/Code.gs 後，把真實 /exec 網址填入 config.js"
fi
echo ""
echo "下一步："
echo "  1. 依 template/gas/Code.gs 為本專案部署 GAS + Google Sheet"
echo "  2. 用瀏覽器開啟 $DEST/index.html"
echo "  3. （可選）把此專案加入 docs/index.html 的清單以便 GitHub Pages 展示"
