/**
 * NiaeDrinks Frontend (revisi)
 * - Produk diambil dari Google Apps Script (Google Sheets)
 * - Admin panel: klik logo 4x → password → CRUD
 * - Password & config sensitif TIDAK disimpan di sini (pakai Script Properties)
 */

// ============== CONFIG (hanya URL, aman) ==============
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxFoZsYmD5TKU2Un8s0Gl10aigZwr1au_YZGM0dHa0g00oBK8zkSncLdTvGuVKj6jVKrw/exec'; // Web App URL

// ============== STATE ==============
let products = [];
let cart = []; // {id, name, price}
let logoClickCount = 0;
let logoClickTimer = null;
let isAdmin = false;
let adminPassword = ''; // hanya di memory sesi

// ============== DOM ==============
const productGrid = document.getElementById('productGrid');
const cartCountEl = document.getElementById('cartCount');
const cartList = document.getElementById('cartList');
const cartPanel = document.getElementById('cartPanel');
const cartTotalEl = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');
const logoBtn = document.getElementById('logoBtn');
const statDrinks = document.getElementById('statDrinks');

// ============== API HELPER ==============
async function apiCall(action, data = {}) {
  if (!WEB_APP_URL || WEB_APP_URL === 'YOUR_WEB_APP_URL') {
    throw new Error('WEB_APP_URL belum di-set. Deploy Apps Script dulu & ganti di script.js');
  }

  const payload = { action, ...data };
  if (isAdmin && adminPassword) {
    payload.password = adminPassword;
  }

  const res = await fetch(WEB_APP_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify(payload)
  });

  const json = await res.json();
  if (!json.success) {
    throw new Error(json.error || 'Request gagal');
  }
  return json;
}

// ============== LOAD PRODUCTS (PUBLIC) ==============
async function loadProducts() {
  try {
    productGrid.innerHTML = '<div class="loading">Memuat menu...</div>';
    const res = await apiCall('list');
    products = res.data || [];
    renderProducts();
    if (statDrinks) {
      statDrinks.textContent = (products.length || 0) + '+';
    }
  } catch (err) {
    console.error(err);
    productGrid.innerHTML = `<div class="loading">Gagal memuat menu. Coba refresh.<br><small>${err.message}</small></div>`;
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

  productGrid.innerHTML = products.map(p => `
    <article class="card">
      <img src="${p.image || 'https://via.placeholder.com/400x300?text=No+Image'}" alt="${p.name}" loading="lazy">
      <div class="card-body">
        <div class="card-top">
          <h3>${p.name}</h3>
          <span>${formatPrice(p.price)}</span>
        </div>
        <p>${p.description || ''}</p>
        <button class="add-btn" data-id="${p.id}" data-name="${p.name}" data-price="${p.price}">
          Add to Cart
        </button>
      </div>
    </article>
  `).join('');

  document.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', () => {
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

// ============== CART ==============
function updateCartUI() {
  cartCountEl.textContent = cart.length;
  cartList.innerHTML = cart.map((item, i) =>
    `<li>${item.name} <small>(${formatPrice(item.price)})</small>
       <button class="remove-item" data-index="${i}" style="border:0;background:none;cursor:pointer;color:#c0392b;font-size:1.1rem">×</button>
     </li>`
  ).join('');

  const total = cart.reduce((s, i) => s + i.price, 0);
  cartTotalEl.textContent = cart.length ? `Total: ${formatPrice(total)}` : '';

  if (cart.length) {
    const itemsText = cart.map(i => `- ${i.name} (${formatPrice(i.price)})`).join('%0A');
    const msg = `Halo NiaeDrinks!%0AAku mau pesan:%0A${itemsText}%0A%0ATotal: ${formatPrice(total)}`;
    checkoutBtn.href = `https://wa.me/6285150902707?text=${msg}`;
  } else {
    checkoutBtn.href = 'https://wa.me/6285150902707?text=Halo%20NiaeDrinks%2C%20aku%20mau%20pesan...';
  }

  document.querySelectorAll('.remove-item').forEach(btn => {
    btn.addEventListener('click', () => {
      cart.splice(Number(btn.dataset.index), 1);
      updateCartUI();
    });
  });
}

document.getElementById('cartBtn').addEventListener('click', () => {
  cartPanel.classList.add('open');
});
document.getElementById('closeCart').addEventListener('click', () => {
  cartPanel.classList.remove('open');
});

// ============== LOGO 4x CLICK → ADMIN ==============
logoBtn.addEventListener('click', (e) => {
  e.preventDefault();
  logoClickCount++;

  if (logoClickTimer) clearTimeout(logoClickTimer);
  logoClickTimer = setTimeout(() => { logoClickCount = 0; }, 1500);

  if (logoClickCount >= 4) {
    logoClickCount = 0;
    showLoginModal();
  }
});

function showLoginModal() {
  document.getElementById('adminPassword').value = '';
  document.getElementById('loginError').textContent = '';
  document.getElementById('adminLoginModal').classList.add('show');
  setTimeout(() => document.getElementById('adminPassword').focus(), 100);
}

document.getElementById('cancelLogin').addEventListener('click', () => {
  document.getElementById('adminLoginModal').classList.remove('show');
});

document.getElementById('submitLogin').addEventListener('click', async () => {
  const pass = document.getElementById('adminPassword').value.trim();
  const errEl = document.getElementById('loginError');

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
    errEl.textContent = 'Password salah';
  }
});

document.getElementById('adminPassword').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') document.getElementById('submitLogin').click();
});

// ============== ADMIN PANEL ==============
function openAdminPanel() {
  document.getElementById('adminPanel').classList.add('show');
  loadAdminProducts();
}

document.getElementById('closeAdmin').addEventListener('click', () => {
  document.getElementById('adminPanel').classList.remove('show');
});

document.getElementById('btnRefresh').addEventListener('click', loadAdminProducts);
document.getElementById('btnAddProduct').addEventListener('click', () => openProductForm());

async function loadAdminProducts() {
  const tbody = document.getElementById('adminTableBody');
  tbody.innerHTML = '<tr><td colspan="7">Memuat...</td></tr>';

  try {
    const res = await apiCall('adminList');
    const list = res.data || [];

    if (!list.length) {
      tbody.innerHTML = '<tr><td colspan="7">Belum ada produk</td></tr>';
      return;
    }

    tbody.innerHTML = list.map(p => `
      <tr>
        <td>${p.id}</td>
        <td>${escapeHtml(p.name)}</td>
        <td>${formatPrice(p.price)}</td>
        <td style="max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${escapeHtml(p.description || '')}">${escapeHtml(p.description || '')}</td>
        <td>${p.image ? `<img src="${escapeHtml(p.image)}" alt="">` : '-'}</td>
        <td>${p.active ? '✅' : '❌'}</td>
        <td class="actions">
          <button class="btn primary btn-sm" data-edit="${p.id}">Edit</button>
          <button class="btn ghost btn-sm" data-del="${p.id}" data-name="${escapeHtml(p.name)}">Hapus</button>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('[data-edit]').forEach(btn => {
      btn.addEventListener('click', () => editProduct(Number(btn.dataset.edit)));
    });
    tbody.querySelectorAll('[data-del]').forEach(btn => {
      btn.addEventListener('click', () => deleteProduct(Number(btn.dataset.del), btn.dataset.name));
    });
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7">Error: ${escapeHtml(err.message)}</td></tr>`;
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ============== FORM ADD / EDIT ==============
function openProductForm(product = null) {
  document.getElementById('formTitle').textContent = product ? 'Edit Produk' : 'Tambah Produk';
  document.getElementById('formId').value = product ? product.id : '';
  document.getElementById('formName').value = product ? product.name : '';
  document.getElementById('formPrice').value = product ? product.price : '';
  document.getElementById('formDesc').value = product ? (product.description || '') : '';
  document.getElementById('formImage').value = product ? (product.image || '') : '';
  document.getElementById('formActive').checked = product ? !!product.active : true;
  document.getElementById('productFormModal').classList.add('show');
}

document.getElementById('cancelForm').addEventListener('click', () => {
  document.getElementById('productFormModal').classList.remove('show');
});

document.getElementById('productForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = document.getElementById('formId').value;
  const data = {
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
    const res = await apiCall('adminList');
    const product = (res.data || []).find(p => p.id === id);
    if (product) openProductForm(product);
  } catch (err) {
    alert(err.message);
  }
}

async function deleteProduct(id, name) {
  if (!confirm(`Yakin hapus produk "${name}"?`)) return;
  try {
    await apiCall('delete', { id });
    loadAdminProducts();
    loadProducts();
  } catch (err) {
    alert('Gagal hapus: ' + err.message);
  }
}

// ============== AUTO SCROLL (asli) ==============
const AUTO_SCROLL_DELAY = 2000;
const AUTO_SCROLL_SPEED = 0.7;
const TOP_RESET_DURATION = 180;

let autoScrollTimer = null;
let autoScrollFrame = null;
let userIsActive = true;
let resettingToTop = false;

function stopAutoScroll() {
  userIsActive = true;
  resettingToTop = false;
  if (autoScrollTimer) { clearTimeout(autoScrollTimer); autoScrollTimer = null; }
  if (autoScrollFrame) { cancelAnimationFrame(autoScrollFrame); autoScrollFrame = null; }
}

function scheduleAutoScroll() {
  if (autoScrollTimer) clearTimeout(autoScrollTimer);
  userIsActive = false;
  autoScrollTimer = setTimeout(() => {
    if (!userIsActive) startAutoScroll();
  }, AUTO_SCROLL_DELAY);
}

function startAutoScroll() {
  if (userIsActive || autoScrollFrame || resettingToTop) return;
  function step() {
    if (userIsActive) { autoScrollFrame = null; return; }
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
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
  const startY = window.scrollY;
  const startTime = performance.now();
  function animateTop(currentTime) {
    if (userIsActive) { resettingToTop = false; return; }
    const progress = Math.min((currentTime - startTime) / TOP_RESET_DURATION, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    window.scrollTo(0, startY * (1 - eased));
    if (progress < 1) {
      requestAnimationFrame(animateTop);
    } else {
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

["mousemove", "mousedown", "keydown", "touchstart", "touchmove", "wheel", "click"].forEach(ev => {
  window.addEventListener(ev, registerUserActivity, { passive: true });
});
scheduleAutoScroll();

// ============== INIT ==============
loadProducts();
updateCartUI();
