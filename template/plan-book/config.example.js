/*
 * 專案專屬設定範例（config.example.js）
 * ------------------------------------------------------------------
 * 用法：複製本檔為同目錄的 config.js，填入該專案的資訊。
 *   cp config.example.js config.js
 * 或直接使用 scripts/new-project.sh 自動產生。
 *
 * ⚠ 安全：config.js 內含真實 GAS 部署網址，已被 .gitignore 排除，
 *   不會被提交到這個「公開」repo。切勿把真實 /exec 網址寫進
 *   config.example.js 或 index.html。
 * ------------------------------------------------------------------
 */
window.PLAN_BOOK_CONFIG = {
  // 顯示於畫面標題的專案名稱（繁體中文）
  PROJECT_NAME: 'iCAP 職能導向課程計畫書（範例專案）',

  // 此專案專屬的 Google Apps Script Web App /exec 部署網址。
  // 請替換 REPLACE_WITH_YOUR_DEPLOYMENT_ID 為你自己的部署 ID。
  GAS_API_URL: 'https://script.google.com/macros/s/REPLACE_WITH_YOUR_DEPLOYMENT_ID/exec',
};
