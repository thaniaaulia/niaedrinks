/**
 * NiaeDrinks Backend - Google Apps Script
 *
 * PENTING: Script ini akan MENULIS ke spreadsheet yang ID-nya
 * tersimpan di Script Properties (SPREADSHEET_ID).
 *
 * Spreadsheet yang direkomendasikan (yang kamu sebut dipakai Apps Script):
 * https://docs.google.com/spreadsheets/d/1P5YPbWzCnhbWbwbi65r5dgwocJcwBjIHCjRM7QlK0Z0/edit
 *
 * Cara pakai:
 * 1. Jalankan setSpreadsheetId() dulu (sekali) — ini mengunci ID spreadsheet
 * 2. Jalankan setupDatabase()
 * 3. Deploy Web App (New deployment setiap ubah kode)
 */

// ====== ID SPREADSHEET YANG MAU DIPAKAI ======
// Ganti kalau mau pakai spreadsheet lain
var PREFERRED_SPREADSHEET_ID = '1P5YPbWzCnhbWbwbi65r5dgwocJcwBjIHCjRM7QlK0Z0';

/**
 * LANGKAH 1: Kunci spreadsheet yang dipakai.
 * Jalankan fungsi ini SEKALI.
 */
function setSpreadsheetId() {
  var PROPS = PropertiesService.getScriptProperties();
  PROPS.setProperty('SPREADSHEET_ID', PREFERRED_SPREADSHEET_ID);
  PROPS.setProperty('ADMIN_PASSWORD', 'Bismillaah');

  var ss = SpreadsheetApp.openById(PREFERRED_SPREADSHEET_ID);
  Logger.log('✅ SPREADSHEET_ID dikunci ke:');
  Logger.log(PREFERRED_SPREADSHEET_ID);
  Logger.log('URL: ' + ss.getUrl());
  Logger.log('Nama: ' + ss.getName());
  Logger.log('Password admin: Bismillaah');
}

/**
 * Cek spreadsheet mana yang sedang dipakai script.
 */
function whichSpreadsheet() {
  var PROPS = PropertiesService.getScriptProperties();
  var ssId = PROPS.getProperty('SPREADSHEET_ID');
  Logger.log('SPREADSHEET_ID di Properties: ' + (ssId || '(kosong)'));
  Logger.log('PREFERRED di kode: ' + PREFERRED_SPREADSHEET_ID);

  if (!ssId) {
    Logger.log('❌ Belum di-set. Jalankan setSpreadsheetId() dulu.');
    return;
  }

  try {
    var ss = SpreadsheetApp.openById(ssId);
    Logger.log('✅ Bisa dibuka');
    Logger.log('Nama: ' + ss.getName());
    Logger.log('URL : ' + ss.getUrl());
    var sheet = ss.getSheetByName('Products');
    if (sheet) {
      Logger.log('Sheet Products: ada, baris = ' + sheet.getLastRow());
    } else {
      Logger.log('Sheet Products: BELUM ADA — jalankan setupDatabase()');
    }
  } catch (e) {
    Logger.log('❌ Gagal buka: ' + e.message);
  }
}

/**
 * LANGKAH 2: Buat sheet Products + header + data awal.
 */
function setupDatabase() {
  var PROPS = PropertiesService.getScriptProperties();

  // Pastikan ID sudah di-set
  var ssId = PROPS.getProperty('SPREADSHEET_ID');
  if (!ssId) {
    PROPS.setProperty('SPREADSHEET_ID', PREFERRED_SPREADSHEET_ID);
    ssId = PREFERRED_SPREADSHEET_ID;
    Logger.log('SPREADSHEET_ID otomatis di-set ke preferred');
  }
  PROPS.setProperty('ADMIN_PASSWORD', 'Bismillaah');

  var ss = SpreadsheetApp.openById(ssId);
  Logger.log('Menulis ke: ' + ss.getUrl());

  // Sheet Products
  var sheet = ss.getSheetByName('Products');
  if (sheet) {
    sheet.clear();
    Logger.log('Sheet Products di-clear');
  } else {
    sheet = ss.insertSheet('Products');
    Logger.log('Sheet Products dibuat');
  }

  var headers = ['id', 'name', 'price', 'description', 'image', 'active', 'created_at', 'updated_at'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length)
    .setFontWeight('bold')
    .setBackground('#8ec5e6')
    .setFontColor('#17324d');
  sheet.setFrozenRows(1);

  var now = new Date().toISOString();
  var seed = [
    [1, 'Berry Cloud', 18000, 'Strawberry creamy dengan foam lembut.', 'berry-cloud.webp', true, now, now],
    [2, 'Blue Lagoon', 20000, 'Blue citrus yang segar dan ringan.', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=85', true, now, now],
    [3, 'Pink Matcha', 22000, 'Matcha creamy dengan sentuhan berry.', 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?auto=format&fit=crop&w=800&q=85', true, now, now],
    [4, 'Ivory Milk', 17000, 'Milky vanilla yang smooth banget.', 'ivory-milk.jpg', true, now, now]
  ];
  sheet.getRange(2, 1, seed.length, headers.length).setValues(seed);
  sheet.autoResizeColumns(1, headers.length);

  Logger.log('==============================');
  Logger.log('🎉 SETUP SELESAI');
  Logger.log('Spreadsheet: ' + ss.getUrl());
  Logger.log('Baris data: ' + (sheet.getLastRow() - 1));
  Logger.log('==============================');
}

/**
 * Isi ulang data kalau kosong (tanpa hapus header).
 */
function forceSeedData() {
  var sheet = getSheet();
  var now = new Date().toISOString();
  var seed = [
    [1, 'Berry Cloud', 18000, 'Strawberry creamy dengan foam lembut.', 'berry-cloud.webp', true, now, now],
    [2, 'Blue Lagoon', 20000, 'Blue citrus yang segar dan ringan.', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=85', true, now, now],
    [3, 'Pink Matcha', 22000, 'Matcha creamy dengan sentuhan berry.', 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?auto=format&fit=crop&w=800&q=85', true, now, now],
    [4, 'Ivory Milk', 17000, 'Milky vanilla yang smooth banget.', 'ivory-milk.jpg', true, now, now]
  ];
  var last = sheet.getLastRow();
  if (last > 1) {
    sheet.getRange(2, 1, last - 1, 8).clearContent();
  }
  sheet.getRange(2, 1, seed.length, 8).setValues(seed);
  Logger.log('Force seed OK. Data: ' + seed.length + ' baris');
}

// ==================== HELPERS ====================
function getSheet() {
  var PROPS = PropertiesService.getScriptProperties();
  var ssId = PROPS.getProperty('SPREADSHEET_ID');
  if (!ssId) {
    throw new Error('SPREADSHEET_ID belum di-set. Jalankan setSpreadsheetId() dulu.');
  }
  var ss = SpreadsheetApp.openById(ssId);
  var sheet = ss.getSheetByName('Products');
  if (!sheet) {
    throw new Error('Sheet "Products" tidak ada. Jalankan setupDatabase().');
  }
  return sheet;
}

function getAllProducts() {
  var sheet = getSheet();
  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  var headers = data[0];
  return data.slice(1).map(function(row) {
    var obj = {};
    headers.forEach(function(h, i) { obj[h] = row[i]; });
    obj.id = Number(obj.id);
    obj.price = Number(obj.price);
    obj.active = (obj.active === true || obj.active === 'TRUE' || obj.active === 1 || obj.active === 'true');
    return obj;
  });
}

function getNextId() {
  var products = getAllProducts();
  if (products.length === 0) return 1;
  return Math.max.apply(null, products.map(function(p) { return p.id; })) + 1;
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function checkAuth(password) {
  var stored = PropertiesService.getScriptProperties().getProperty('ADMIN_PASSWORD');
  return password && stored && String(password) === String(stored);
}

// ==================== API ====================
function doGet(e) { return handleRequest(e); }
function doPost(e) { return handleRequest(e); }

function handleRequest(e) {
  try {
    var action = 'list';
    var payload = {};

    // GET query params (cara utama — andal)
    if (e && e.parameter) {
      payload = e.parameter;
      action = payload.action || 'list';
    }

    // POST body (cadangan)
    if (e && e.postData && e.postData.contents) {
      try {
        var body = JSON.parse(e.postData.contents);
        for (var k in body) {
          if (body.hasOwnProperty(k)) payload[k] = body[k];
        }
        action = payload.action || action;
      } catch (err) {}
    }

    // Normalisasi boolean active dari string query
    if (payload.active !== undefined) {
      payload.active = (payload.active === true || payload.active === 'true' || payload.active === 'TRUE' || payload.active === '1' || payload.active === 1);
    }

    if (action === 'list') {
      var products = getAllProducts().filter(function(p) { return p.active; });
      return jsonResponse({ success: true, data: products });
    }

    if (!checkAuth(payload.password)) {
      return jsonResponse({ success: false, error: 'Unauthorized' });
    }

    if (action === 'login') {
      return jsonResponse({ success: true, message: 'Login OK' });
    }
    if (action === 'adminList') {
      return jsonResponse({ success: true, data: getAllProducts() });
    }
    if (action === 'create') {
      var sheet = getSheet();
      var id = getNextId();
      var now = new Date().toISOString();
      var activeVal = payload.active !== false && payload.active !== 'false';
      sheet.appendRow([
        id,
        payload.name || '',
        Number(payload.price) || 0,
        payload.description || '',
        payload.image || '',
        activeVal,
        now,
        now
      ]);
      return jsonResponse({ success: true, data: { id: id } });
    }
    if (action === 'update') {
      var sheet = getSheet();
      var data = sheet.getDataRange().getValues();
      var id = Number(payload.id);
      var found = false;
      for (var i = 1; i < data.length; i++) {
        if (Number(data[i][0]) === id) {
          var now = new Date().toISOString();
          if (payload.name !== undefined) sheet.getRange(i + 1, 2).setValue(payload.name);
          if (payload.price !== undefined) sheet.getRange(i + 1, 3).setValue(Number(payload.price));
          if (payload.description !== undefined) sheet.getRange(i + 1, 4).setValue(payload.description);
          if (payload.image !== undefined) sheet.getRange(i + 1, 5).setValue(payload.image);
          if (payload.active !== undefined) sheet.getRange(i + 1, 6).setValue(!!payload.active);
          sheet.getRange(i + 1, 8).setValue(now);
          found = true;
          break;
        }
      }
      if (!found) return jsonResponse({ success: false, error: 'Product not found' });
      return jsonResponse({ success: true });
    }
    if (action === 'delete') {
      var sheet = getSheet();
      var data = sheet.getDataRange().getValues();
      var id = Number(payload.id);
      for (var i = 1; i < data.length; i++) {
        if (Number(data[i][0]) === id) {
          sheet.deleteRow(i + 1);
          return jsonResponse({ success: true });
        }
      }
      return jsonResponse({ success: false, error: 'Product not found' });
    }

    return jsonResponse({ success: false, error: 'Unknown action: ' + action });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

function testWrite() {
  var sheet = getSheet();
  var now = new Date().toISOString();
  var id = getNextId();
  sheet.appendRow([id, 'Test dari Editor', 9999, 'Ditulis lewat testWrite()', '', true, now, now]);
  Logger.log('testWrite OK, id=' + id + ', baris sekarang=' + sheet.getLastRow());
}

function testList() {
  Logger.log(JSON.stringify(getAllProducts(), null, 2));
}
