# 範例課程（example-course）

這是 `scripts/new-project.sh` 會產生之專案結構的示範樣本。

- `index.html`：由 `template/plan-book/index.html` 複製而來的計畫書生成器。
- `config.js`：本專案專屬設定（`PROJECT_NAME`、`GAS_API_URL`）。此範例使用**佔位**網址。

## 啟用步驟
1. 依 `template/gas/Code.gs` 說明，為本專案部署專屬的 Google Apps Script + Google Sheet。
2. 將 `config.js` 的 `GAS_API_URL` 換成你的 `/exec` 網址（或在畫面右上「變更連線網址」輸入）。
3. 用瀏覽器開啟 `index.html` 即可。
