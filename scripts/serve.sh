#!/usr/bin/env bash
# 本機開發伺服器：以 http://localhost 開啟計畫書生成器，
# 避免用 file:// 直接開檔造成的跨來源(CORS)問題（Origin: null）。
#
# 用法：
#   bash scripts/serve.sh          # 預設埠 8000
#   bash scripts/serve.sh 8080     # 指定埠
#
# 啟動後於瀏覽器開啟（範例專案）：
#   http://localhost:8000/projects/example-course/index.html
set -euo pipefail
PORT="${1:-8000}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
echo "iCAP 計畫書生成器 — 本機伺服器"
echo "根目錄：$ROOT"
echo "請於瀏覽器開啟： http://localhost:${PORT}/projects/example-course/index.html"
echo "（按 Ctrl+C 停止）"
exec python3 -m http.server "$PORT"
