# icap-course-dev — 職能導向課程開發總部

本 repo 是 **職能導向課程開發（competency-based course development）** 的home base，
以「**模板複製**」機制承載 **iCAP 計畫書生成器**：每個課程主題各自複製一份 HTML 工具，
並連到自己專屬的 **Google Apps Script（GAS）+ Google Sheet** 後端。

> 路徑／URL 一律英文 kebab-case；使用者可見內文一律繁體中文（`lang="zh-Hant"`）。

## 這個 repo 是什麼

- `iCAP 計畫書生成器` 是一支單一 HTML 的 React 應用，可編輯課程基本資料、ADDIE 發展、課綱指標、
  經費編列、核銷稽核，並產生可列印的計畫書；計畫書「版本」直接存取 Google Sheet。
- 架構為「**雲端直連**」：前端以 `fetch()` 直接連 GAS Web App，無離線單機模式。
- 一個主題 = 一個 `projects/<slug>/`，各自設定 `PROJECT_NAME` 與 `GAS_API_URL`。

## 目錄結構

```
icap-course-dev/
├─ template/
│  ├─ plan-book/
│  │  ├─ index.html          # 可重複使用的計畫書模板（GAS 直連版）
│  │  └─ config.example.js   # 專案設定範例（PROJECT_NAME、GAS_API_URL）
│  └─ gas/
│     └─ Code.gs             # Google Apps Script 後端「模板」（doPost 契約 + 部署說明）
├─ projects/
│  └─ example-course/        # 可運作的示範專案（使用佔位 GAS 網址）
│     ├─ index.html
│     └─ config.js
├─ scripts/
│  └─ new-project.sh         # 由模板複製出新專案
├─ docs/                     # GitHub Pages 著陸頁（繁體中文，列出可用專案）
│  ├─ index.html
│  └─ .nojekyll
├─ .gitignore
└─ README.md
```

## 專案複製工作流程

在 repo 根目錄執行：

```bash
bash scripts/new-project.sh <slug> "專案名稱" "GAS /exec 網址"
```

範例：

```bash
bash scripts/new-project.sh elderly-care-mandarin "外籍看護華語溝通實務班" \
  "https://script.google.com/macros/s/XXXXXXXX/exec"
```

- `slug` 必須是英文 kebab-case（小寫英文、數字、連字號）。
- 未提供參數時會以互動方式逐項詢問。
- 產出 `projects/<slug>/index.html`（複製自模板）與 `projects/<slug>/config.js`。
- 之後可（選擇性）在 `docs/index.html` 的「現有專案」區塊複製一張卡片，指向新專案。

## 部署 GAS 後端（每個專案各做一次）

詳細步驟見 `template/gas/Code.gs` 檔頭註解，摘要：

1. 建立一個新的 Google Sheet（例如 `icap-<slug>-db`）。
2. 該表：擴充功能 → Apps Script，貼上 `template/gas/Code.gs` 全部內容。
3. 執行一次 `setup()` 授權並建立 `versions` 分頁與表頭。
4. 部署為「網頁應用程式」：執行身分＝我，存取權＝任何人。
5. 複製 `/exec` 網址，填入該專案 `config.js` 的 `GAS_API_URL`（或於畫面右上「變更連線網址」輸入）。

### doPost 契約摘要

前端以 `text/plain` 送出 JSON（降低 CORS 預檢），依 `action` 分派：

| 請求 | 回應 |
|------|------|
| `{ action: "load" }` | `{ versions: [ { id, name, date, data }, ... ] }` |
| `{ action: "save", name, data }` | `{ versions: [...更新後全部版本...] }` |
| `{ action: "delete", id }` | `{ versions: [...刪除後剩餘版本...] }` |
| 任何錯誤 | `{ status: "error", message }` |

其中 `data` 形狀：`{ basicInfo, proposalDetails, addie, syllabus, budgetItems }`。
每個專案對應「自己的一個 Google Sheet」的 `versions` 分頁。

## 本機開啟（建議用 localhost）

計畫書生成器會以 `fetch()` 直連 GAS。若用 `file://` 直接開啟 `index.html`，
瀏覽器送出的來源為 `Origin: null`，部分情況會被跨來源(CORS)政策擋下而出現
「Failed to fetch」。建議改用本機伺服器開啟：

```bash
bash scripts/serve.sh            # 預設埠 8000
# 然後開啟：
# http://localhost:8000/projects/example-course/index.html
```

## 疑難排解：雲端連線失敗（Failed to fetch）

畫面右上有「**測試連線**」按鈕（對 `/exec` 做一次 GET），可快速判斷根因：

| 現象 | 根因 | 解法 |
|------|------|------|
| GET 被導向 `accounts.google.com` / 顯示需要授權 | 部署權限不是「任何人」 | Apps Script → 部署 → 編輯 →「誰可以存取」改為「**任何人**」→ 重新部署 |
| GET/POST 回應含「找不到指令碼函式：doPost」 | 部署版本過舊或不含 `doPost` | 將最新 `template/gas/Code.gs` 貼到 Apps Script → **重新部署 → 新版本** → 換用新的 `/exec` 網址 |
| 直接 `file://` 開啟才失敗、localhost 正常 | `file://` 跨來源(CORS) | 改用 `bash scripts/serve.sh` 以 `http://localhost` 開啟 |
| 回應為 JSON `{status:"ok",...}` 或 `{versions:[...]}` | 後端正常 | 連線 OK；若仍失敗檢查網址是否填錯專案 |

> 註：正常的後端 `doGet` 應回傳 JSON 健康檢查（`{status:"ok",service:"icap-plan-book",...}`）。
> 若 GET 回傳的是一整頁 HTML 網頁應用，代表該 `/exec` 指向的是「別的」Apps Script 部署，
> 需重新部署本專案的 `template/gas/Code.gs` 並改用其 `/exec` 網址。

## 安全（公開 repo）

- **本 repo 為公開**：所有進版控的檔案一律使用**佔位**網址
  `https://script.google.com/macros/s/REPLACE_WITH_YOUR_DEPLOYMENT_ID/exec`，
  **不得**寫死任何真實 `/exec` 部署網址。
- 真實網址於「執行期」注入，三種方式（優先序高到低）：
  1. 網址參數 `?api=<你的 /exec 網址>`
  2. 畫面右上「變更連線網址」（存於瀏覽器 localStorage）
  3. 專案目錄的 `config.local.js`（已被 `.gitignore` 排除，不會上傳）
- `config.js` 建議保留佔位值；要在本機持久化真實網址時，改用 `config.local.js`。

## GitHub Pages

Pages 來源設為 `main` 分支的 `/docs` 資料夾，著陸頁列出可用專案並提供複製指令。
