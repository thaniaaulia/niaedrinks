const cart = [];
const count = document.getElementById("cartCount");
const list = document.getElementById("cartList");
const panel = document.getElementById("cartPanel");

document.querySelectorAll(".add-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    cart.push(btn.dataset.name);
    count.textContent = cart.length;
    list.innerHTML = cart.map((i) => `<li>${i}</li>`).join("");
    panel.classList.add("open");
  });
});

document.getElementById("cartBtn").addEventListener("click", () => {
  panel.classList.add("open");
});

document.getElementById("closeCart").addEventListener("click", () => {
  panel.classList.remove("open");
});

/* ==============================
   AUTO SCROLL
   - Mulai setelah 2 detik tanpa aktivitas
   - Berhenti saat user beraktivitas
   - Scroll perlahan ke bawah
   - Saat mencapai bawah, kembali cepat ke atas
   - Setelah itu lanjut scroll perlahan lagi
   ============================== */

const AUTO_SCROLL_DELAY = 2000; // 2 detik
const AUTO_SCROLL_SPEED = 0.7;  // pixel per frame, makin besar = makin cepat
const TOP_RESET_DURATION = 180; // durasi kembali ke atas dalam ms

let autoScrollTimer = null;
let autoScrollFrame = null;
let userIsActive = true;
let resettingToTop = false;

function stopAutoScroll() {
  userIsActive = true;
  resettingToTop = false;

  if (autoScrollTimer) {
    clearTimeout(autoScrollTimer);
    autoScrollTimer = null;
  }

  if (autoScrollFrame) {
    cancelAnimationFrame(autoScrollFrame);
    autoScrollFrame = null;
  }
}

function scheduleAutoScroll() {
  if (autoScrollTimer) {
    clearTimeout(autoScrollTimer);
  }

  userIsActive = false;

  autoScrollTimer = setTimeout(() => {
    if (!userIsActive) {
      startAutoScroll();
    }
  }, AUTO_SCROLL_DELAY);
}

function startAutoScroll() {
  if (userIsActive || autoScrollFrame || resettingToTop) return;

  function step() {
    if (userIsActive) {
      autoScrollFrame = null;
      return;
    }

    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

    // Jika halaman tidak cukup panjang untuk di-scroll, tunggu aktivitas berikutnya.
    if (maxScroll <= 0) {
      autoScrollFrame = null;
      return;
    }

    // Sudah mencapai bagian paling bawah.
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
    if (userIsActive) {
      resettingToTop = false;
      return;
    }

    const progress = Math.min(
      (currentTime - startTime) / TOP_RESET_DURATION,
      1
    );

    // Ease-out supaya perpindahannya terasa cepat tapi tetap halus.
    const eased = 1 - Math.pow(1 - progress, 3);
    window.scrollTo(0, startY * (1 - eased));

    if (progress < 1) {
      requestAnimationFrame(animateTop);
    } else {
      window.scrollTo(0, 0);
      resettingToTop = false;

      // Lanjut auto-scroll dari atas tanpa menunggu 2 detik lagi.
      if (!userIsActive) {
        startAutoScroll();
      }
    }
  }

  requestAnimationFrame(animateTop);
}

function registerUserActivity() {
  stopAutoScroll();
  scheduleAutoScroll();
}

// Aktivitas yang dianggap sebagai aktivitas user.
["mousemove", "mousedown", "keydown", "touchstart", "touchmove", "wheel", "click"].forEach((eventName) => {
  window.addEventListener(eventName, registerUserActivity, { passive: true });
});

// Mulai timer ketika halaman pertama kali dibuka.
scheduleAutoScroll();
