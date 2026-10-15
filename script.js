/**
 * NiaeDrinks Frontend
 * CRUD pakai GET ke Apps Script (POST bermasalah karena redirect Google)
 */

// ============== CONFIG ==============
// GANTI dengan URL Web App deployment TERBARU setelah deploy ulang Code.gs
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxFoZsYmD5TKU2Un8s0Gl10aigZwr1au_YZGM0dHa0g00oBK8zkSncLdTvGuVKj6jVKrw/exec';

// ============== STATE ==============
let products = [];
let cart = [];
let logoClickCount = 0;
let logoClickTimer = null;
let isAdmin = false;
let adminPassword = '';

// ============== DOM ==============
const productGrid = document.getElementById('productGrid');
const cartCountEl = document.getElementById('cartCount');
const cartList = document.getElementById('cartList');
const cartPanel = document.getElementById('cartPanel');
const cartTotalEl = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');
const logoBtn = document.getElementById('logoBtn');
const statDrinks = document.getElementById('statDrinks');

// ============== API (GET — andal untuk Apps Script) ==============
async function apiCall(action, data = {}) {
  if (!WEB_APP_URL || WEB_APP_URL.includes('YOUR_WEB_APP')) {
    throw new Error('WEB_APP_URL belum di-set');
  }

  const params = new URLSearchParams();
  params.set('action', action);

  if (isAdmin && adminPassword) {
    params.set('password', adminPassword);
  }

  // Semua field data jadi query param
  Object.keys(data).forEach(function(key) {
    if (data[key] === undefined || data[key] === null) return;
    if (key === 'action' || key === 'password') return;
    params.set(key, String(data[key]));
  });

  const url = WEB_APP_URL + (WEB_APP_URL.indexOf('?') >= 0 ? '&' : '?') + params.toString();

  const res = await fetch(url, {
    method: 'GET',
    redirect: 'follow',
    cache: 'no-store'
  });

  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch (e) {
    console.error('Response bukan JSON:', text.slice(0, 200));
    throw new Error('Server tidak mengembalikan JSON. Cek deploy Web App (Anyone + New deployment).');
  }

  if (!json.success) {
    throw new Error(json.error || 'Request gagal');
  }
  return json;
}

// ============== LOAD PRODUCTS ==============
async function loadProducts() {
  try {
    productGrid.innerHTML = '<div class="loading">Memuat menu...</div>';
    const res = await apiCall('list');
    products = res.data || [];
    renderProducts();
    if (statDrinks) statDrinks.textContent = (products.length || 0) + '+';
  } catch (err) {
    console.error(err);
    productGrid.innerHTML = '<div class="loading">Gagal memuat menu.<br><small>' + err.message + '</small></div>';
  }
}

function formatPrice(num) {
  if (num >= 1000) return 'Rp' + Math.round(num / 1000) + 'k';
  return 'Rp' + num;
}

function renderProducts() {
  if (!products.length) {
    productGrid.innerHTML = '<div class="loading">Belum ada produk aktif.</div>';
    return;
  }

  productGrid.innerHTML = products.map(function(p) {
    return (
      '<article class="card">' +
        '<img src="' + (p.image || 'https://via.placeholder.com/400x300?text=No+Image') + '" alt="' + escapeHtml(p.name) + '" loading="lazy">' +
        '<div class="card-body">' +
          '<div class="card-top"><h3>' + escapeHtml(p.name) + '</h3><span>' + formatPrice(p.price) + '</span></div>' +
          '<p>' + escapeHtml(p.description || '') + '</p>' +
          '<button class="add-btn" data-id="' + p.id + '" data-name="' + escapeHtml(p.name) + '" data-price="' + p.price + '">Add to Cart</button>' +
        '</div>' +
      '</article>'
    );
  }).join('');

  document.querySelectorAll('.add-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      cart.push({
        id: Number(btn.dataset.id),
        name: btn.dataset.name,
        price: Number(btn.dataset.price)
      });
      updateCartUI();
      cartPanel.classList.add('open');
    });
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ============== CART ==============
function updateCartUI() {
  cartCountEl.textContent = cart.length;
  cartList.innerHTML = cart.map(function(item, i) {
    return '<li>' + escapeHtml(item.name) + ' <small>(' + formatPrice(item.price) + ')</small>' +
      ' <button class="remove-item" data-index="' + i + '" style="border:0;background:none;cursor:pointer;color:#c0392b">×</button></li>';
  }).join('');

  var total = cart.reduce(function(s, i) { return s + i.price; }, 0);
  cartTotalEl.textContent = cart.length ? 'Total: ' + formatPrice(total) : '';

  document.querySelectorAll('.remove-item').forEach(function(btn) {
    btn.addEventListener('click', function() {
      cart.splice(Number(btn.dataset.index), 1);
      updateCartUI();
    });
  });
}

function showToast(message, type) {
  var el = document.getElementById('toast');
  if (!el) {
    alert(message);
    return;
  }
  el.hidden = false;
  el.textContent = message;
  el.className = 'toast show ' + (type || '');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(function() {
    el.classList.remove('show');
  }, 3200);
}

function buildWaUrl(orderId) {
  var total = cart.reduce(function(s, i) { return s + i.price; }, 0);
  var lines = cart.map(function(i) { return '- ' + i.name + ' (' + formatPrice(i.price) + ')'; });
  var msg = 'Halo NiaeDrinks!\nAku mau pesan:';
  if (orderId) msg += '\n(No. pesanan: #' + orderId + ')';
  msg += '\n' + lines.join('\n') + '\n\nTotal: ' + formatPrice(total);
  return 'https://wa.me/6285150902707?text=' + encodeURIComponent(msg);
}

async function checkoutAndSave() {
  if (!cart.length) {
    showToast('Keranjang masih kosong', 'err');
    return;
  }

  var total = cart.reduce(function(s, i) { return s + i.price; }, 0);
  // ringkas item: "Berry Cloud x1; Blue Lagoon x2"
  var counts = {};
  cart.forEach(function(i) {
    counts[i.name] = (counts[i.name] || 0) + 1;
  });
  var itemsStr = Object.keys(counts).map(function(name) {
    return name + ' x' + counts[name];
  }).join('; ');

  checkoutBtn.disabled = true;
  checkoutBtn.classList.add('checkout-btn-loading');
  var oldText = checkoutBtn.textContent;
  checkoutBtn.textContent = 'Menyimpan...';

  try {
    var res = await apiCall('createOrder', {
      items: itemsStr,
      total: total,
      customer_note: ''
    });
    var orderId = res.data && res.data.id;
    showToast('Pesanan #' + orderId + ' tersimpan di database ✓', 'ok');

    // Buka WhatsApp setelah sukses simpan
    var wa = buildWaUrl(orderId);
    window.open(wa, '_blank');

    // kosongkan cart
    cart = [];
    updateCartUI();
  } catch (err) {
    console.error(err);
    showToast('Gagal simpan: ' + err.message, 'err');
  } finally {
    checkoutBtn.disabled = false;
    checkoutBtn.classList.remove('checkout-btn-loading');
    checkoutBtn.textContent = oldText;
  }
}

document.getElementById('cartBtn').addEventListener('click', function() {
  cartPanel.classList.add('open');
});
document.getElementById('closeCart').addEventListener('click', function() {
  cartPanel.classList.remove('open');
});

document.getElementById('checkoutBtn').addEventListener('click', function() {
  checkoutAndSave();
});

// ============== LOGO 4x → ADMIN ==============
logoBtn.addEventListener('click', function(e) {
  e.preventDefault();
  logoClickCount++;
  if (logoClickTimer) clearTimeout(logoClickTimer);
  logoClickTimer = setTimeout(function() { logoClickCount = 0; }, 1500);
  if (logoClickCount >= 4) {
    logoClickCount = 0;
    showLoginModal();
  }
});

function showLoginModal() {
  document.getElementById('adminPassword').value = '';
  document.getElementById('loginError').textContent = '';
  document.getElementById('adminLoginModal').classList.add('show');
  setTimeout(function() { document.getElementById('adminPassword').focus(); }, 100);
}

document.getElementById('cancelLogin').addEventListener('click', function() {
  document.getElementById('adminLoginModal').classList.remove('show');
});

document.getElementById('submitLogin').addEventListener('click', async function() {
  var pass = document.getElementById('adminPassword').value.trim();
  var errEl = document.getElementById('loginError');
  if (!pass) {
    errEl.textContent = 'Password wajib diisi';
    return;
  }
  try {
    adminPassword = pass;
    isAdmin = true;
    await apiCall('login');
    document.getElementById('adminLoginModal').classList.remove('show');
    openAdminPanel();
  } catch (err) {
    isAdmin = false;
    adminPassword = '';
    errEl.textContent = 'Password salah / ' + err.message;
  }
});

document.getElementById('adminPassword').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') document.getElementById('submitLogin').click();
});

// ============== ADMIN PANEL ==============
function openAdminPanel() {
  document.getElementById('adminPanel').classList.add('show');
  loadAdminProducts();
}

document.getElementById('closeAdmin').addEventListener('click', function() {
  document.getElementById('adminPanel').classList.remove('show');
});
document.getElementById('btnRefresh').addEventListener('click', loadAdminProducts);
document.getElementById('btnAddProduct').addEventListener('click', function() { openProductForm(); });

async function loadAdminProducts() {
  var tbody = document.getElementById('adminTableBody');
  tbody.innerHTML = '<tr><td colspan="7">Memuat...</td></tr>';
  try {
    var res = await apiCall('adminList');
    var list = res.data || [];
    if (!list.length) {
      tbody.innerHTML = '<tr><td colspan="7">Belum ada produk</td></tr>';
      return;
    }
    tbody.innerHTML = list.map(function(p) {
      return '<tr>' +
        '<td>' + p.id + '</td>' +
        '<td>' + escapeHtml(p.name) + '</td>' +
        '<td>' + formatPrice(p.price) + '</td>' +
        '<td style="max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + escapeHtml(p.description || '') + '</td>' +
        '<td>' + (p.image ? '<img src="' + escapeHtml(p.image) + '" alt="">' : '-') + '</td>' +
        '<td>' + (p.active ? '✅' : '❌') + '</td>' +
        '<td class="actions">' +
          '<button class="btn primary btn-sm" data-edit="' + p.id + '">Edit</button> ' +
          '<button class="btn ghost btn-sm" data-del="' + p.id + '" data-name="' + escapeHtml(p.name) + '">Hapus</button>' +
        '</td></tr>';
    }).join('');

    tbody.querySelectorAll('[data-edit]').forEach(function(btn) {
      btn.addEventListener('click', function() { editProduct(Number(btn.dataset.edit)); });
    });
    tbody.querySelectorAll('[data-del]').forEach(function(btn) {
      btn.addEventListener('click', function() { deleteProduct(Number(btn.dataset.del), btn.dataset.name); });
    });
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="7">Error: ' + escapeHtml(err.message) + '</td></tr>';
  }
}

function openProductForm(product) {
  document.getElementById('formTitle').textContent = product ? 'Edit Produk' : 'Tambah Produk';
  document.getElementById('formId').value = product ? product.id : '';
  document.getElementById('formName').value = product ? product.name : '';
  document.getElementById('formPrice').value = product ? product.price : '';
  document.getElementById('formDesc').value = product ? (product.description || '') : '';
  document.getElementById('formImage').value = product ? (product.image || '') : '';
  document.getElementById('formActive').checked = product ? !!product.active : true;
  document.getElementById('productFormModal').classList.add('show');
}

document.getElementById('cancelForm').addEventListener('click', function() {
  document.getElementById('productFormModal').classList.remove('show');
});

document.getElementById('productForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  var id = document.getElementById('formId').value;
  var data = {
    name: document.getElementById('formName').value.trim(),
    price: Number(document.getElementById('formPrice').value),
    description: document.getElementById('formDesc').value.trim(),
    image: document.getElementById('formImage').value.trim(),
    active: document.getElementById('formActive').checked
  };
  try {
    if (id) {
      data.id = Number(id);
      await apiCall('update', data);
    } else {
      await apiCall('create', data);
    }
    document.getElementById('productFormModal').classList.remove('show');
    loadAdminProducts();
    loadProducts();
  } catch (err) {
    alert('Gagal simpan: ' + err.message);
  }
});

async function editProduct(id) {
  try {
    var res = await apiCall('adminList');
    var product = (res.data || []).find(function(p) { return p.id === id; });
    if (product) openProductForm(product);
  } catch (err) {
    alert(err.message);
  }
}

async function deleteProduct(id, name) {
  if (!confirm('Yakin hapus produk "' + name + '"?')) return;
  try {
    await apiCall('delete', { id: id });
    loadAdminProducts();
    loadProducts();
  } catch (err) {
    alert('Gagal hapus: ' + err.message);
  }
}

// ============== AUTO SCROLL ==============
var AUTO_SCROLL_DELAY = 2000;
var AUTO_SCROLL_SPEED = 0.7;
var TOP_RESET_DURATION = 180;
var autoScrollTimer = null;
var autoScrollFrame = null;
var userIsActive = true;
var resettingToTop = false;

function stopAutoScroll() {
  userIsActive = true;
  resettingToTop = false;
  if (autoScrollTimer) { clearTimeout(autoScrollTimer); autoScrollTimer = null; }
  if (autoScrollFrame) { cancelAnimationFrame(autoScrollFrame); autoScrollFrame = null; }
}
function scheduleAutoScroll() {
  if (autoScrollTimer) clearTimeout(autoScrollTimer);
  userIsActive = false;
  autoScrollTimer = setTimeout(function() {
    if (!userIsActive) startAutoScroll();
  }, AUTO_SCROLL_DELAY);
}
function startAutoScroll() {
  if (userIsActive || autoScrollFrame || resettingToTop) return;
  function step() {
    if (userIsActive) { autoScrollFrame = null; return; }
    var maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (maxScroll <= 0) { autoScrollFrame = null; return; }
    if (window.scrollY >= maxScroll - 1) {
      autoScrollFrame = null;
      resetToTop();
      return;
    }
    window.scrollBy(0, AUTO_SCROLL_SPEED);
    autoScrollFrame = requestAnimationFrame(step);
  }
  autoScrollFrame = requestAnimationFrame(step);
}
function resetToTop() {
  if (userIsActive || resettingToTop) return;
  resettingToTop = true;
  var startY = window.scrollY;
  var startTime = performance.now();
  function animateTop(currentTime) {
    if (userIsActive) { resettingToTop = false; return; }
    var progress = Math.min((currentTime - startTime) / TOP_RESET_DURATION, 1);
    var eased = 1 - Math.pow(1 - progress, 3);
    window.scrollTo(0, startY * (1 - eased));
    if (progress < 1) requestAnimationFrame(animateTop);
    else {
      window.scrollTo(0, 0);
      resettingToTop = false;
      if (!userIsActive) startAutoScroll();
    }
  }
  requestAnimationFrame(animateTop);
}
function registerUserActivity() {
  stopAutoScroll();
  scheduleAutoScroll();
}
['mousemove', 'mousedown', 'keydown', 'touchstart', 'touchmove', 'wheel', 'click'].forEach(function(ev) {
  window.addEventListener(ev, registerUserActivity, { passive: true });
});
scheduleAutoScroll();

// ============== INIT ==============
loadProducts();
updateCartUI();
