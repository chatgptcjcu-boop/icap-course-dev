/**
 * iCAP 計畫書生成器 — Google Apps Script 後端「模板」
 * ==================================================================
 * 每個課程開發專案各自部署「一份」本檔 + 一個 Google Sheet，
 * 前端（template/plan-book/index.html）以 fetch() 直連本 Web App，
 * 由本程式讀寫 Google Sheet 作為計畫書版本的儲存後端。
 *
 * ------------------------------------------------------------------
 * 一、部署步驟（每個專案做一次）
 * ------------------------------------------------------------------
 * 1. 建立一個新的 Google 試算表（Google Sheet），命名如「icap-<專案slug>-db」。
 * 2. 於該試算表：擴充功能 → Apps Script，貼上本檔全部內容。
 * 3. （可選）將下方 SHEET_ID 留空即使用「容器綁定」的當前試算表；
 *    若要指定其他試算表，填入其 ID。
 * 4. 執行一次 setup() 授權並自動建立分頁與表頭。
 * 5. 部署 → 新增部署 → 類型「網頁應用程式」：
 *      - 執行身分：我
 *      - 具有存取權的使用者：任何人
 * 6. 複製產生的 /exec 網址，貼到該專案 config.js 的 GAS_API_URL，
 *    或於前端畫面右上「變更連線網址」輸入。
 *
 * ------------------------------------------------------------------
 * 二、doPost 契約（前端 callGas 使用；統一 text/plain 降低 CORS 預檢）
 * ------------------------------------------------------------------
 * 請求 body 為 JSON 字串，依 action 分派：
 *
 *   { action: "load" }
 *      → { versions: [ { id, name, date, data }, ... ] }
 *
 *   { action: "save", name: "版本名稱", data: {...計畫書內容...} }
 *      → { versions: [...更新後全部版本...] }   // 依 date 新到舊
 *
 *   { action: "delete", id: "版本id" }
 *      → { versions: [...刪除後剩餘版本...] }
 *
 * 任何錯誤：
 *      → { status: "error", message: "錯誤說明" }
 *
 * 其中 data 形狀（前端定義）：
 *   { basicInfo, proposalDetails, addie, syllabus, budgetItems }
 * ==================================================================
 */

// 若留空字串，使用「容器綁定」的當前試算表；否則以此 ID 開啟指定試算表。
var SHEET_ID = '';
// 儲存版本的分頁名稱。
var SHEET_NAME = 'versions';
// 表頭欄位（固定順序）。
var HEADERS = ['id', 'name', 'date', 'data'];

/** 取得（必要時建立）versions 分頁，並確保表頭存在。 */
function getSheet_() {
  var ss = SHEET_ID ? SpreadsheetApp.openById(SHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('找不到試算表：請設定 SHEET_ID 或使用容器綁定專案。');
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
  } else if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
  }
  return sheet;
}

/** 一次性初始化：授權 + 建立分頁與表頭。部署前手動執行一次。 */
function setup() {
  getSheet_();
  return 'OK：versions 分頁與表頭已就緒。';
}

/** 讀取全部版本（依日期新到舊）。 */
function listVersions_() {
  var sheet = getSheet_();
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  var values = sheet.getRange(2, 1, lastRow - 1, HEADERS.length).getValues();
  var versions = values.map(function (row) {
    var data = {};
    try { data = row[3] ? JSON.parse(row[3]) : {}; } catch (e) { data = {}; }
    return { id: String(row[0]), name: String(row[1]), date: String(row[2]), data: data };
  });
  versions.sort(function (a, b) { return a.date < b.date ? 1 : (a.date > b.date ? -1 : 0); });
  return versions;
}

/** 儲存一個新版本。 */
function saveVersion_(name, data) {
  if (!name) throw new Error('缺少版本名稱 name');
  var sheet = getSheet_();
  var id = 'v' + Date.now();
  var tz = Session.getScriptTimeZone() || 'Asia/Taipei';
  var date = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd HH:mm');
  sheet.appendRow([id, name, date, JSON.stringify(data || {})]);
  return listVersions_();
}

/** 依 id 刪除版本。 */
function deleteVersion_(id) {
  if (!id) throw new Error('缺少版本 id');
  var sheet = getSheet_();
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(id)) {
      sheet.deleteRow(i + 2);
      break;
    }
  }
  return listVersions_();
}

/** 統一輸出 JSON（GAS Web App 不支援自訂 CORS 標頭，前端以 text/plain 送出避免預檢）。 */
function jsonOutput_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/** 健康檢查（瀏覽器直接開 /exec 會走這裡）。 */
function doGet() {
  return jsonOutput_({ status: 'ok', service: 'icap-plan-book', versions: listVersions_().length });
}

/** 主要入口：處理 load / save / delete。 */
function doPost(e) {
  try {
    var body = (e && e.postData && e.postData.contents) ? JSON.parse(e.postData.contents) : {};
    var action = body.action;
    if (action === 'load') {
      return jsonOutput_({ versions: listVersions_() });
    } else if (action === 'save') {
      return jsonOutput_({ versions: saveVersion_(body.name, body.data) });
    } else if (action === 'delete') {
      return jsonOutput_({ versions: deleteVersion_(body.id) });
    }
    return jsonOutput_({ status: 'error', message: '未知的 action：' + action });
  } catch (err) {
    return jsonOutput_({ status: 'error', message: String(err && err.message ? err.message : err) });
  }
}
