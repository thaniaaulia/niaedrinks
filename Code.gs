/**
 * NiaeDrinks Backend - Google Apps Script
 * Spreadsheet & headers digenerate otomatis.
 * Password admin disimpan di Script Properties.
 *
 * CARA PAKAI:
 * 1. Jalankan setupDatabase() sekali
 * 2. Cek log (View → Executions) — harus ada "SETUP SELESAI"
 * 3. Deploy sebagai Web App
 */

// ==================== SETUP (jalankan sekali) ====================
function setupDatabase() {
  const PROPS = PropertiesService.getScriptProperties();

  try {
    // 1. Password
    PROPS.setProperty('ADMIN_PASSWORD', 'Bismillaah');
    Logger.log('1/5 Password admin diset: Bismillaah');

    // 2. Spreadsheet
    let ssId = PROPS.getProperty('SPREADSHEET_ID');
    let ss;

    if (ssId) {
      try {
        ss = SpreadsheetApp.openById(ssId);
        Logger.log('2/5 Membuka spreadsheet yang sudah ada');
      } catch (e) {
        Logger.log('Spreadsheet lama tidak bisa dibuka, buat baru...');
        ssId = null;
      }
    }

    if (!ssId) {
      ss = SpreadsheetApp.create('NiaeDrinks Database');
      ssId = ss.getId();
      PROPS.setProperty('SPREADSHEET_ID', ssId);
      Logger.log('2/5 Spreadsheet BARU dibuat');
    }

    Logger.log('   URL: ' + ss.getUrl());
    Logger.log('   ID : ' + ssId);

    // 3. Sheet Products
    let sheet = ss.getSheetByName('Products');
    if (sheet) {
      sheet.clear();
      Logger.log('3/5 Sheet Products di-clear');
    } else {
      sheet = ss.insertSheet('Products');
      Logger.log('3/5 Sheet Products dibuat');
    }

    // 4. Header
    const headers = ['id', 'name', 'price', 'description', 'image', 'active', 'created_at', 'updated_at'];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length)
      .setFontWeight('bold')
      .setBackground('#8ec5e6')
      .setFontColor('#17324d');
    sheet.setFrozenRows(1);
    Logger.log('4/5 Header ditulis');

    // 5. Seed data
    const now = new Date().toISOString();
    const seed = [
      [1, 'Berry Cloud', 18000, 'Strawberry creamy dengan foam lembut.', 'berry-cloud.webp', true, now, now],
      [2, 'Blue Lagoon', 20000, 'Blue citrus yang segar dan ringan.', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=85', true, now, now],
      [3, 'Pink Matcha', 22000, 'Matcha creamy dengan sentuhan berry.', 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?auto=format&fit=crop&w=800&q=85', true, now, now],
      [4, 'Ivory Milk', 17000, 'Milky vanilla yang smooth banget.', 'ivory-milk.jpg', true, now, now]
    ];

    sheet.getRange(2, 1, seed.length, headers.length).setValues(seed);
    sheet.autoResizeColumns(1, headers.length);
    Logger.log('5/5 Seed data dimasukkan: ' + seed.length + ' produk');

    // Hapus Sheet1 default
    try {
      const sh1 = ss.getSheetByName('Sheet1');
      if (sh1 && ss.getSheets().length > 1) {
        ss.deleteSheet(sh1);
      }
    } catch (e) {}

    // Verifikasi
    const lastRow = sheet.getLastRow();
    Logger.log('==============================');
    Logger.log('🎉 SETUP SELESAI!');
    Logger.log('Jumlah baris di sheet: ' + lastRow + ' (1 header + ' + (lastRow - 1) + ' data)');
    Logger.log('Spreadsheet URL: ' + ss.getUrl());
    Logger.log('==============================');

  } catch (err) {
    Logger.log('❌ ERROR di setupDatabase: ' + err.message);
    Logger.log(err.stack);
    throw err;
  }
}

/**
 * Kalau data masih kosong, jalankan fungsi ini saja
 * (tidak perlu setup ulang)
 */
function forceSeedData() {
  const sheet = getSheet();
  const now = new Date().toISOString();
  const seed = [
    [1, 'Berry Cloud', 18000, 'Strawberry creamy dengan foam lembut.', 'berry-cloud.webp', true, now, now],
    [2, 'Blue Lagoon', 20000, 'Blue citrus yang segar dan ringan.', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=85', true, now, now],
    [3, 'Pink Matcha', 22000, 'Matcha creamy dengan sentuhan berry.', 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?auto=format&fit=crop&w=800&q=85', true, now, now],
    [4, 'Ivory Milk', 17000, 'Milky vanilla yang smooth banget.', 'ivory-milk.jpg', true, now, now]
  ];

  // Clear isi (biarkan header)
  const last = sheet.getLastRow();
  if (last > 1) {
    sheet.getRange(2, 1, last - 1, 8).clearContent();
  }

  sheet.getRange(2, 1, seed.length, 8).setValues(seed);
  Logger.log('Force seed selesai. Baris data: ' + seed.length);
}

// ==================== HELPERS ====================
function getSheet() {
  const PROPS = PropertiesService.getScriptProperties();
  const ssId = PROPS.getProperty('SPREADSHEET_ID');
  if (!ssId) {
    throw new Error('SPREADSHEET_ID belum ada. Jalankan setupDatabase() dulu.');
  }
  const ss = SpreadsheetApp.openById(ssId);
  const sheet = ss.getSheetByName('Products');
  if (!sheet) {
    throw new Error('Sheet "Products" tidak ditemukan. Jalankan setupDatabase() lagi.');
  }
  return sheet;
}

function getAllProducts() {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];

  const headers = data[0];
  return data.slice(1).map(function(row) {
    const obj = {};
    headers.forEach(function(h, i) {
      obj[h] = row[i];
    });
    obj.id = Number(obj.id);
    obj.price = Number(obj.price);
    obj.active = (obj.active === true || obj.active === 'TRUE' || obj.active === 1 || obj.active === 'true');
    return obj;
  });
}

function getNextId() {
  const products = getAllProducts();
  if (products.length === 0) return 1;
  return Math.max.apply(null, products.map(function(p) { return p.id; })) + 1;
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function checkAuth(password) {
  const stored = PropertiesService.getScriptProperties().getProperty('ADMIN_PASSWORD');
  return password && stored && String(password) === String(stored);
}

// ==================== API ====================
function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  try {
    var action = 'list';
    var payload = {};

    if (e && e.parameter && e.parameter.action) {
      action = e.parameter.action;
      payload = e.parameter;
    }

    if (e && e.postData && e.postData.contents) {
      try {
        payload = JSON.parse(e.postData.contents);
        action = payload.action || action;
      } catch (parseErr) {}
    }

    // PUBLIC
    if (action === 'list') {
      var products = getAllProducts().filter(function(p) { return p.active; });
      return jsonResponse({ success: true, data: products });
    }

    // ADMIN
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
      sheet.appendRow([
        id,
        payload.name || '',
        Number(payload.price) || 0,
        payload.description || '',
        payload.image || '',
        payload.active !== false && payload.active !== 'false',
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
          if (payload.active !== undefined) {
            var activeVal = payload.active === true || payload.active === 'true' || payload.active === 1;
            sheet.getRange(i + 1, 6).setValue(activeVal);
          }
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

// Testing
function testList() {
  Logger.log(JSON.stringify(getAllProducts(), null, 2));
}

function showSpreadsheetUrl() {
  var ssId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!ssId) {
    Logger.log('Belum ada SPREADSHEET_ID. Jalankan setupDatabase dulu.');
    return;
  }
  var ss = SpreadsheetApp.openById(ssId);
  Logger.log('Spreadsheet URL: ' + ss.getUrl());
}
