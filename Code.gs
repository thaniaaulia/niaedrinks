/**
 * NiaeDrinks Backend
 * Spreadsheet: 1P5YPbWzCnhbWbwbi65r5dgwocJcwBjIHCjRM7QlK0Z0
 *
 * Sheet:
 * - Products  → menu (CRUD admin)
 * - Orders    → pesanan saat customer checkout
 *
 * Urutan setup:
 * 1. setSpreadsheetId()
 * 2. setupDatabase()
 * 3. Deploy → New deployment → Anyone
 */

var PREFERRED_SPREADSHEET_ID = '1P5YPbWzCnhbWbwbi65r5dgwocJcwBjIHCjRM7QlK0Z0';

function setSpreadsheetId() {
  var PROPS = PropertiesService.getScriptProperties();
  PROPS.setProperty('SPREADSHEET_ID', PREFERRED_SPREADSHEET_ID);
  PROPS.setProperty('ADMIN_PASSWORD', 'Bismillaah');
  var ss = SpreadsheetApp.openById(PREFERRED_SPREADSHEET_ID);
  Logger.log('OK: ' + ss.getUrl());
  Logger.log('Password: Bismillaah');
}

function whichSpreadsheet() {
  var ssId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  Logger.log('ID: ' + ssId);
  if (!ssId) { Logger.log('Jalankan setSpreadsheetId() dulu'); return; }
  var ss = SpreadsheetApp.openById(ssId);
  Logger.log('URL: ' + ss.getUrl());
  Logger.log('Products rows: ' + (ss.getSheetByName('Products') ? ss.getSheetByName('Products').getLastRow() : 'TIDAK ADA'));
  Logger.log('Orders rows: ' + (ss.getSheetByName('Orders') ? ss.getSheetByName('Orders').getLastRow() : 'TIDAK ADA'));
}

function setupDatabase() {
  var PROPS = PropertiesService.getScriptProperties();
  PROPS.setProperty('SPREADSHEET_ID', PREFERRED_SPREADSHEET_ID);
  PROPS.setProperty('ADMIN_PASSWORD', 'Bismillaah');
  var ss = SpreadsheetApp.openById(PREFERRED_SPREADSHEET_ID);
  Logger.log('Setup di: ' + ss.getUrl());

  // ===== Products =====
  var sheet = ss.getSheetByName('Products');
  if (sheet) sheet.clear();
  else sheet = ss.insertSheet('Products');

  var headers = ['id', 'name', 'price', 'description', 'image', 'active', 'created_at', 'updated_at'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers])
    .setFontWeight('bold').setBackground('#8ec5e6').setFontColor('#17324d');
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
  Logger.log('Products OK: ' + seed.length + ' item');

  // ===== Orders =====
  ensureOrdersSheet_(ss);
  Logger.log('Orders sheet siap');
  Logger.log('SETUP SELESAI');
}

function ensureOrdersSheet_(ss) {
  var sheet = ss.getSheetByName('Orders');
  if (!sheet) {
    sheet = ss.insertSheet('Orders');
  }
  // Jika kosong / belum ada header, tulis header
  if (sheet.getLastRow() === 0) {
    var headers = ['id', 'created_at', 'items', 'total', 'customer_note', 'status'];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers])
      .setFontWeight('bold').setBackground('#f4b6c8').setFontColor('#17324d');
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(3, 360); // items
  } else {
    // Pastikan baris 1 adalah header
    var h = sheet.getRange(1, 1).getValue();
    if (String(h).toLowerCase() !== 'id') {
      sheet.insertRowBefore(1);
      var headers = ['id', 'created_at', 'items', 'total', 'customer_note', 'status'];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers])
        .setFontWeight('bold').setBackground('#f4b6c8').setFontColor('#17324d');
      sheet.setFrozenRows(1);
    }
  }
  return sheet;
}

function getSpreadsheet_() {
  var ssId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID') || PREFERRED_SPREADSHEET_ID;
  return SpreadsheetApp.openById(ssId);
}

function getSheet() {
  var ss = getSpreadsheet_();
  var sheet = ss.getSheetByName('Products');
  if (!sheet) throw new Error('Sheet Products tidak ada. Jalankan setupDatabase().');
  return sheet;
}

function getOrdersSheet() {
  var ss = getSpreadsheet_();
  return ensureOrdersSheet_(ss);
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

function getNextOrderId() {
  var sheet = getOrdersSheet();
  var last = sheet.getLastRow();
  if (last < 2) return 1;
  var ids = sheet.getRange(2, 1, last - 1, 1).getValues().map(function(r) { return Number(r[0]) || 0; });
  return Math.max.apply(null, ids.concat([0])) + 1;
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function checkAuth(password) {
  var stored = PropertiesService.getScriptProperties().getProperty('ADMIN_PASSWORD') || 'Bismillaah';
  return password && String(password) === String(stored);
}

function doGet(e) { return handleRequest(e); }
function doPost(e) { return handleRequest(e); }

function handleRequest(e) {
  try {
    var action = 'list';
    var payload = {};

    if (e && e.parameter) {
      payload = e.parameter;
      action = payload.action || 'list';
    }
    if (e && e.postData && e.postData.contents) {
      try {
        var body = JSON.parse(e.postData.contents);
        for (var k in body) {
          if (body.hasOwnProperty(k)) payload[k] = body[k];
        }
        action = payload.action || action;
      } catch (err) {}
    }

    if (payload.active !== undefined) {
      payload.active = (payload.active === true || payload.active === 'true' || payload.active === 'TRUE' || payload.active === '1' || payload.active === 1);
    }

    // ===== PUBLIC =====
    if (action === 'list') {
      var products = getAllProducts().filter(function(p) { return p.active; });
      return jsonResponse({ success: true, data: products });
    }

    // Simpan pesanan (PUBLIC — customer checkout)
    if (action === 'createOrder') {
      var items = payload.items || '';
      var total = Number(payload.total) || 0;
      var note = payload.customer_note || payload.note || '';
      if (!items) {
        return jsonResponse({ success: false, error: 'Keranjang kosong' });
      }
      var sheet = getOrdersSheet();
      var id = getNextOrderId();
      var now = new Date().toISOString();
      sheet.appendRow([id, now, items, total, note, 'new']);
      return jsonResponse({
        success: true,
        data: { id: id, message: 'Pesanan #' + id + ' tersimpan' }
      });
    }

    // ===== ADMIN =====
    if (!checkAuth(payload.password)) {
      return jsonResponse({ success: false, error: 'Unauthorized' });
    }

    if (action === 'login') {
      return jsonResponse({ success: true, message: 'Login OK' });
    }
    if (action === 'adminList') {
      return jsonResponse({ success: true, data: getAllProducts() });
    }
    if (action === 'listOrders') {
      var os = getOrdersSheet();
      var data = os.getDataRange().getValues();
      if (data.length < 2) return jsonResponse({ success: true, data: [] });
      var headers = data[0];
      var rows = data.slice(1).map(function(row) {
        var obj = {};
        headers.forEach(function(h, i) { obj[h] = row[i]; });
        obj.id = Number(obj.id);
        obj.total = Number(obj.total);
        return obj;
      });
      return jsonResponse({ success: true, data: rows.reverse() }); // terbaru dulu
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
  sheet.appendRow([id, 'Test dari Editor', 9999, 'testWrite', '', true, now, now]);
  Logger.log('Products test OK id=' + id);
}

function testOrder() {
  var sheet = getOrdersSheet();
  var id = getNextOrderId();
  var now = new Date().toISOString();
  sheet.appendRow([id, now, 'Berry Cloud x1; Ivory Milk x2', 52000, 'testOrder', 'new']);
  Logger.log('Orders test OK id=' + id + ' rows=' + sheet.getLastRow());
}
