/**
 * NiaeDrinks Backend
 * Spreadsheet: 1P5YPbWzCnhbWbwbi65r5dgwocJcwBjIHCjRM7QlK0Z0
 *
 * Products — menu (CRUD admin)
 * Orders   — pesanan: nama, WA, item, status (new / answered / served)
 */

var PREFERRED_SPREADSHEET_ID = '1P5YPbWzCnhbWbwbi65r5dgwocJcwBjIHCjRM7QlK0Z0';
var ORDER_HEADERS = ['id', 'created_at', 'customer_name', 'customer_wa', 'items', 'total', 'customer_note', 'status'];

function setSpreadsheetId() {
  var PROPS = PropertiesService.getScriptProperties();
  PROPS.setProperty('SPREADSHEET_ID', PREFERRED_SPREADSHEET_ID);
  PROPS.setProperty('ADMIN_PASSWORD', 'Bismillaah');
  var ss = SpreadsheetApp.openById(PREFERRED_SPREADSHEET_ID);
  Logger.log('OK: ' + ss.getUrl());
}

function whichSpreadsheet() {
  var ssId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  Logger.log('ID: ' + ssId);
  if (!ssId) return;
  var ss = SpreadsheetApp.openById(ssId);
  Logger.log('URL: ' + ss.getUrl());
  var p = ss.getSheetByName('Products');
  var o = ss.getSheetByName('Orders');
  Logger.log('Products: ' + (p ? p.getLastRow() : 'TIDAK ADA'));
  Logger.log('Orders: ' + (o ? o.getLastRow() : 'TIDAK ADA'));
}

function setupDatabase() {
  var PROPS = PropertiesService.getScriptProperties();
  PROPS.setProperty('SPREADSHEET_ID', PREFERRED_SPREADSHEET_ID);
  PROPS.setProperty('ADMIN_PASSWORD', 'Bismillaah');
  var ss = SpreadsheetApp.openById(PREFERRED_SPREADSHEET_ID);

  // Products
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

  ensureOrdersSheet_(ss);
  Logger.log('SETUP SELESAI — ' + ss.getUrl());
}

/** Pastikan sheet Orders ada + header lengkap (migrasi kolom nama/WA jika perlu) */
function ensureOrdersSheet_(ss) {
  var sheet = ss.getSheetByName('Orders');
  if (!sheet) sheet = ss.insertSheet('Orders');

  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, ORDER_HEADERS.length).setValues([ORDER_HEADERS])
      .setFontWeight('bold').setBackground('#f4b6c8').setFontColor('#17324d');
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(5, 280);
    return sheet;
  }

  // Cek apakah header sudah punya customer_name
  var row1 = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
  var joined = row1.join('|').toLowerCase();
  if (joined.indexOf('customer_name') === -1) {
    // Migrasi: sisipkan kolom nama & WA setelah created_at
    // Format lama: id, created_at, items, total, customer_note, status
    var data = sheet.getDataRange().getValues();
    sheet.clear();
    sheet.getRange(1, 1, 1, ORDER_HEADERS.length).setValues([ORDER_HEADERS])
      .setFontWeight('bold').setBackground('#f4b6c8').setFontColor('#17324d');
    sheet.setFrozenRows(1);
    if (data.length > 1) {
      var migrated = [];
      for (var i = 1; i < data.length; i++) {
        var r = data[i];
        // coba deteksi format lama
        if (row1[2] && String(row1[2]).toLowerCase() === 'items') {
          migrated.push([r[0], r[1], '', '', r[2], r[3], r[4] || '', r[5] || 'new']);
        } else {
          migrated.push([r[0], r[1], r[2] || '', r[3] || '', r[4] || '', r[5] || 0, r[6] || '', r[7] || 'new']);
        }
      }
      if (migrated.length) {
        sheet.getRange(2, 1, migrated.length, ORDER_HEADERS.length).setValues(migrated);
      }
    }
    Logger.log('Orders dimigrasi ke format baru (nama + WA)');
  }
  return sheet;
}

function getSpreadsheet_() {
  var ssId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID') || PREFERRED_SPREADSHEET_ID;
  return SpreadsheetApp.openById(ssId);
}

function getSheet() {
  var sheet = getSpreadsheet_().getSheetByName('Products');
  if (!sheet) throw new Error('Sheet Products tidak ada. Jalankan setupDatabase().');
  return sheet;
}

function getOrdersSheet() {
  return ensureOrdersSheet_(getSpreadsheet_());
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
  if (!products.length) return 1;
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
      payload.active = (payload.active === true || payload.active === 'true' || payload.active === '1' || payload.active === 1);
    }

    // PUBLIC
    if (action === 'list') {
      return jsonResponse({ success: true, data: getAllProducts().filter(function(p) { return p.active; }) });
    }

    if (action === 'createOrder') {
      var items = payload.items || '';
      var total = Number(payload.total) || 0;
      var name = payload.customer_name || payload.name || '';
      var wa = payload.customer_wa || payload.wa || '';
      var note = payload.customer_note || payload.note || '';
      if (!items) return jsonResponse({ success: false, error: 'Keranjang kosong' });
      if (!name || !wa) return jsonResponse({ success: false, error: 'Nama dan nomor WA wajib diisi' });
      var sheet = getOrdersSheet();
      var id = getNextOrderId();
      var now = new Date().toISOString();
      // id, created_at, customer_name, customer_wa, items, total, customer_note, status
      sheet.appendRow([id, now, name, wa, items, total, note, 'new']);
      return jsonResponse({ success: true, data: { id: id, message: 'Pesanan #' + id + ' tersimpan' } });
    }

    // ADMIN
    if (!checkAuth(payload.password)) {
      return jsonResponse({ success: false, error: 'Unauthorized' });
    }

    if (action === 'login') return jsonResponse({ success: true, message: 'Login OK' });

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
        obj.status = obj.status || 'new';
        return obj;
      });
      // filter status opsional
      if (payload.status && payload.status !== 'all') {
        var st = String(payload.status);
        rows = rows.filter(function(r) { return String(r.status) === st; });
      }
      return jsonResponse({ success: true, data: rows.reverse() });
    }

    if (action === 'updateOrderStatus') {
      var sheet = getOrdersSheet();
      var data = sheet.getDataRange().getValues();
      var id = Number(payload.id);
      var newStatus = payload.status || 'new';
      if (['new', 'answered', 'served'].indexOf(newStatus) === -1) {
        return jsonResponse({ success: false, error: 'Status tidak valid' });
      }
      var headers = data[0];
      var statusCol = -1;
      for (var c = 0; c < headers.length; c++) {
        if (String(headers[c]).toLowerCase() === 'status') { statusCol = c; break; }
      }
      if (statusCol < 0) return jsonResponse({ success: false, error: 'Kolom status tidak ada' });
      for (var i = 1; i < data.length; i++) {
        if (Number(data[i][0]) === id) {
          sheet.getRange(i + 1, statusCol + 1).setValue(newStatus);
          return jsonResponse({ success: true });
        }
      }
      return jsonResponse({ success: false, error: 'Order not found' });
    }

    if (action === 'create') {
      var sheet = getSheet();
      var id = getNextId();
      var now = new Date().toISOString();
      sheet.appendRow([
        id, payload.name || '', Number(payload.price) || 0,
        payload.description || '', payload.image || '',
        payload.active !== false && payload.active !== 'false', now, now
      ]);
      return jsonResponse({ success: true, data: { id: id } });
    }

    if (action === 'update') {
      var sheet = getSheet();
      var data = sheet.getDataRange().getValues();
      var id = Number(payload.id);
      for (var i = 1; i < data.length; i++) {
        if (Number(data[i][0]) === id) {
          var now = new Date().toISOString();
          if (payload.name !== undefined) sheet.getRange(i + 1, 2).setValue(payload.name);
          if (payload.price !== undefined) sheet.getRange(i + 1, 3).setValue(Number(payload.price));
          if (payload.description !== undefined) sheet.getRange(i + 1, 4).setValue(payload.description);
          if (payload.image !== undefined) sheet.getRange(i + 1, 5).setValue(payload.image);
          if (payload.active !== undefined) sheet.getRange(i + 1, 6).setValue(!!payload.active);
          sheet.getRange(i + 1, 8).setValue(now);
          return jsonResponse({ success: true });
        }
      }
      return jsonResponse({ success: false, error: 'Product not found' });
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

function testOrder() {
  var sheet = getOrdersSheet();
  var id = getNextOrderId();
  var now = new Date().toISOString();
  sheet.appendRow([id, now, 'Tes Customer', '08123456789', 'Berry Cloud x1', 18000, '', 'new']);
  Logger.log('Order test id=' + id);
}
