/**
 * NiaeDrinks Backend - Google Apps Script
 * Spreadsheet & headers digenerate otomatis.
 * Password admin disimpan di Script Properties (tidak pernah di frontend).
 */

const PROPS = PropertiesService.getScriptProperties();

// ==================== SETUP (jalankan sekali) ====================
function setupDatabase() {
  // 1. Set password admin
  PROPS.setProperty('ADMIN_PASSWORD', 'Bismillaah');

  // 2. Buat Spreadsheet baru jika belum ada
  let ssId = PROPS.getProperty('SPREADSHEET_ID');
  let ss;

  if (!ssId) {
    ss = SpreadsheetApp.create('NiaeDrinks Database');
    ssId = ss.getId();
    PROPS.setProperty('SPREADSHEET_ID', ssId);
    Logger.log('Spreadsheet baru dibuat: ' + ss.getUrl());
  } else {
    ss = SpreadsheetApp.openById(ssId);
  }

  // 3. Buat / reset sheet Products
  let sheet = ss.getSheetByName('Products');
  if (sheet) {
    sheet.clear();
  } else {
    sheet = ss.insertSheet('Products');
  }

  // Header
  const headers = [
    'id', 'name', 'price', 'description', 'image', 'active', 'created_at', 'updated_at'
  ];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length)
    .setFontWeight('bold')
    .setBackground('#8ec5e6')
    .setFontColor('#17324d');
  sheet.setFrozenRows(1);

  // Seed data awal (4 produk yang sudah ada)
  const now = new Date().toISOString();
  const seed = [
    [1, 'Berry Cloud', 18000, 'Strawberry creamy dengan foam lembut.', 'berry-cloud.webp', true, now, now],
    [2, 'Blue Lagoon', 20000, 'Blue citrus yang segar dan ringan.', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=85', true, now, now],
    [3, 'Pink Matcha', 22000, 'Matcha creamy dengan sentuhan berry.', 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?auto=format&fit=crop&w=800&q=85', true, now, now],
    [4, 'Ivory Milk', 17000, 'Milky vanilla yang smooth banget.', 'ivory-milk.jpg', true, now, now]
  ];

  if (seed.length > 0) {
    sheet.getRange(2, 1, seed.length, headers.length).setValues(seed);
  }

  // Auto-resize
  sheet.autoResizeColumns(1, headers.length);

  // Hapus sheet default jika ada
  const defaultSheet = ss.getSheetByName('Sheet1');
  if (defaultSheet && ss.getSheets().length > 1) {
    ss.deleteSheet(defaultSheet);
  }

  Logger.log('Setup selesai!');
  Logger.log('Spreadsheet URL: ' + ss.getUrl());
  Logger.log('Script Properties sudah diisi (ADMIN_PASSWORD + SPREADSHEET_ID)');
}

// ==================== HELPERS ====================
function getSheet() {
  const ssId = PROPS.getProperty('SPREADSHEET_ID');
  if (!ssId) throw new Error('SPREADSHEET_ID belum di-set. Jalankan setupDatabase() dulu.');
  return SpreadsheetApp.openById(ssId).getSheetByName('Products');
}

function getAllProducts() {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];

  const headers = data[0];
  return data.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = row[i];
    });
    // Normalisasi
    obj.id = Number(obj.id);
    obj.price = Number(obj.price);
    obj.active = obj.active === true || obj.active === 'TRUE' || obj.active === 1;
    return obj;
  });
}

function getNextId() {
  const products = getAllProducts();
  if (products.length === 0) return 1;
  return Math.max(...products.map(p => p.id)) + 1;
}

function jsonResponse(data, statusCode = 200) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function checkAuth(password) {
  const stored = PROPS.getProperty('ADMIN_PASSWORD');
  return password && stored && password === stored;
}

// ==================== API ====================
function doGet(e) {
  return handleRequest(e, 'GET');
}

function doPost(e) {
  return handleRequest(e, 'POST');
}

function handleRequest(e, method) {
  // CORS preflight
  if (method === 'OPTIONS' || (e && e.parameter && e.parameter.method === 'OPTIONS')) {
    return ContentService.createTextOutput('')
      .setMimeType(ContentService.MimeType.TEXT);
  }

  try {
    let action, payload = {};

    if (method === 'GET') {
      action = (e.parameter && e.parameter.action) || 'list';
      payload = e.parameter || {};
    } else {
      // POST
      const raw = e.postData ? e.postData.contents : '{}';
      payload = JSON.parse(raw || '{}');
      action = payload.action || 'list';
    }

    // ========== PUBLIC ==========
    if (action === 'list') {
      const products = getAllProducts().filter(p => p.active);
      return jsonResponse({ success: true, data: products });
    }

    // ========== ADMIN ONLY ==========
    if (!checkAuth(payload.password)) {
      return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
    }

    if (action === 'adminList') {
      // Semua produk (termasuk non-aktif)
      return jsonResponse({ success: true, data: getAllProducts() });
    }

    if (action === 'create') {
      const sheet = getSheet();
      const id = getNextId();
      const now = new Date().toISOString();
      const row = [
        id,
        payload.name || '',
        Number(payload.price) || 0,
        payload.description || '',
        payload.image || '',
        payload.active !== false,
        now,
        now
      ];
      sheet.appendRow(row);
      return jsonResponse({ success: true, data: { id } });
    }

    if (action === 'update') {
      const sheet = getSheet();
      const data = sheet.getDataRange().getValues();
      const id = Number(payload.id);
      let found = false;

      for (let i = 1; i < data.length; i++) {
        if (Number(data[i][0]) === id) {
          const now = new Date().toISOString();
          sheet.getRange(i + 1, 2).setValue(payload.name || data[i][1]);
          sheet.getRange(i + 1, 3).setValue(Number(payload.price) || data[i][2]);
          sheet.getRange(i + 1, 4).setValue(payload.description || data[i][3]);
          sheet.getRange(i + 1, 5).setValue(payload.image || data[i][4]);
          sheet.getRange(i + 1, 6).setValue(payload.active !== undefined ? payload.active : data[i][5]);
          sheet.getRange(i + 1, 8).setValue(now); // updated_at
          found = true;
          break;
        }
      }

      if (!found) return jsonResponse({ success: false, error: 'Product not found' });
      return jsonResponse({ success: true });
    }

    if (action === 'delete') {
      const sheet = getSheet();
      const data = sheet.getDataRange().getValues();
      const id = Number(payload.id);

      for (let i = 1; i < data.length; i++) {
        if (Number(data[i][0]) === id) {
          sheet.deleteRow(i + 1);
          return jsonResponse({ success: true });
        }
      }
      return jsonResponse({ success: false, error: 'Product not found' });
    }

    if (action === 'login') {
      // Hanya cek password (sudah dicek di atas)
      return jsonResponse({ success: true, message: 'Login OK' });
    }

    return jsonResponse({ success: false, error: 'Unknown action' });

  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

// Untuk testing di editor
function testList() {
  Logger.log(JSON.stringify(getAllProducts(), null, 2));
}
