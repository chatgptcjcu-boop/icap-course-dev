# 範例課程（example-course）

這是 `scripts/new-project.sh` 會產生之專案結構的示範樣本。

- `index.html`：由 `template/plan-book/index.html` 複製而來的計畫書生成器。
- `config.js`：本專案專屬設定（`PROJECT_NAME`、`GAS_API_URL`）。此範例使用**佔位**網址。

## 啟用步驟
1. 依 `template/gas/Code.gs` 說明，為本專案部署專屬的 Google Apps Script + Google Sheet。
2. 將 `config.js` 的 `GAS_API_URL` 換成你的 `/exec` 網址（或在畫面右上「變更連線網址」輸入）。
3. 開啟方式（擇一）：
   - 建議：於 repo 根目錄執行 `bash scripts/serve.sh`，再開 `http://localhost:8000/projects/example-course/index.html`（避免 file:// 的跨來源問題）。
   - 或直接用瀏覽器開啟 `index.html`。

## 連線失敗（Failed to fetch）怎麼辦

點畫面右上「**測試連線**」判斷根因，或見 repo 根目錄 `README.md` 的「疑難排解」章節。
最常見為：GAS 部署權限未設「任何人」，或部署版本過舊不含 `doPost`（需重新部署最新 `Code.gs`）。
