// ── DATA ──────────────────────────────────────────────

const BRANDS = [
  { id:'iphone',  name:'iPhone',        emoji:'🍎', color:'#555' },
  { id:'samsung', name:'Samsung',       emoji:'🔵', color:'#1428a0' },
  { id:'xiaomi',  name:'Xiaomi',        emoji:'🟠', color:'#ff6900' },
  { id:'redmi',   name:'Redmi',         emoji:'🔴', color:'#e63946' },
  { id:'oppo',    name:'OPPO',          emoji:'🟢', color:'#1d6339' },
  { id:'realme',  name:'Realme',        emoji:'🟡', color:'#f5a623' },
  { id:'vivo',    name:'Vivo',          emoji:'🔷', color:'#415fff' },
  { id:'oneplus', name:'OnePlus',       emoji:'🔴', color:'#eb0029' },
  { id:'honor',   name:'Honor',         emoji:'🩵', color:'#007aff' },
  { id:'nubia',   name:'Nubia Red Magic', emoji:'🎮', color:'#e63946' },
  { id:'meizu',   name:'Meizu',         emoji:'⚫', color:'#333' },
];

const PHONES = [
  // iPhone
  { id:101, brand:'iphone',  name:'iPhone 16 Pro Max 256GB',   price:34990000, oldPrice:37990000, rating:4.9, reviews:8234, img:'/quinoa/product_phone.png', badge:'hot',  isNew:false },
  { id:102, brand:'iphone',  name:'iPhone 16 Pro 128GB',       price:28990000, oldPrice:31990000, rating:4.8, reviews:5421, img:'/quinoa/product_phone.png', badge:'sale', isNew:false },
  { id:103, brand:'iphone',  name:'iPhone 16 Plus 128GB',      price:24990000, oldPrice:26990000, rating:4.7, reviews:3102, img:'/quinoa/product_phone.png', badge:'',     isNew:false },
  { id:104, brand:'iphone',  name:'iPhone 15 Pro Max 256GB',   price:27990000, oldPrice:32990000, rating:4.8, reviews:9876, img:'/quinoa/product_phone.png', badge:'sale', isNew:false },
  // Samsung
  { id:201, brand:'samsung', name:'Samsung Galaxy S25 Ultra',  price:29990000, oldPrice:32990000, rating:4.8, reviews:6543, img:'/quinoa/product_phone.png', badge:'hot',  isNew:true  },
  { id:202, brand:'samsung', name:'Samsung Galaxy S25+',       price:22990000, oldPrice:25990000, rating:4.7, reviews:3210, img:'/quinoa/product_phone.png', badge:'new',  isNew:true  },
  { id:203, brand:'samsung', name:'Samsung Galaxy Z Fold 6',   price:41990000, oldPrice:45990000, rating:4.7, reviews:1234, img:'/quinoa/product_phone.png', badge:'',     isNew:false },
  { id:204, brand:'samsung', name:'Samsung Galaxy A56 5G',     price:9990000,  oldPrice:11990000, rating:4.5, reviews:4321, img:'/quinoa/product_phone.png', badge:'sale', isNew:true  },
  // Xiaomi
  { id:301, brand:'xiaomi',  name:'Xiaomi 15 Ultra',           price:23990000, oldPrice:26990000, rating:4.8, reviews:2345, img:'/quinoa/product_phone.png', badge:'hot',  isNew:true  },
  { id:302, brand:'xiaomi',  name:'Xiaomi 15 Pro',             price:18990000, oldPrice:21990000, rating:4.7, reviews:1876, img:'/quinoa/product_phone.png', badge:'new',  isNew:true  },
  { id:303, brand:'xiaomi',  name:'Xiaomi 14T Pro',            price:15990000, oldPrice:18990000, rating:4.6, reviews:3421, img:'/quinoa/product_phone.png', badge:'sale', isNew:false },
  // Redmi
  { id:401, brand:'redmi',   name:'Redmi Note 14 Pro+ 5G',     price:8990000,  oldPrice:10990000, rating:4.6, reviews:5678, img:'/quinoa/product_phone.png', badge:'sale', isNew:false },
  { id:402, brand:'redmi',   name:'Redmi Note 14 5G',          price:6490000,  oldPrice:7490000,  rating:4.5, reviews:4532, img:'/quinoa/product_phone.png', badge:'',     isNew:false },
  // OPPO
  { id:501, brand:'oppo',    name:'OPPO Find X8 Pro',          price:24990000, oldPrice:27990000, rating:4.7, reviews:1234, img:'/quinoa/product_phone.png', badge:'hot',  isNew:true  },
  { id:502, brand:'oppo',    name:'OPPO Reno 13 Pro',          price:12990000, oldPrice:14990000, rating:4.6, reviews:2109, img:'/quinoa/product_phone.png', badge:'new',  isNew:true  },
  { id:503, brand:'oppo',    name:'OPPO A3 Pro 5G',            price:6490000,  oldPrice:7490000,  rating:4.4, reviews:1890, img:'/quinoa/product_phone.png', badge:'sale', isNew:false },
  // Realme
  { id:601, brand:'realme',  name:'Realme GT 7 Pro',           price:13990000, oldPrice:15990000, rating:4.6, reviews:876,  img:'/quinoa/product_phone.png', badge:'new',  isNew:true  },
  { id:602, brand:'realme',  name:'Realme 13 Pro+ 5G',         price:8490000,  oldPrice:9990000,  rating:4.5, reviews:1543, img:'/quinoa/product_phone.png', badge:'sale', isNew:false },
  // Vivo
  { id:701, brand:'vivo',    name:'Vivo X200 Pro',             price:20990000, oldPrice:23990000, rating:4.7, reviews:543,  img:'/quinoa/product_phone.png', badge:'hot',  isNew:true  },
  { id:702, brand:'vivo',    name:'Vivo V40 5G',               price:9990000,  oldPrice:11490000, rating:4.5, reviews:876,  img:'/quinoa/product_phone.png', badge:'sale', isNew:false },
  // OnePlus
  { id:801, brand:'oneplus', name:'OnePlus 13 5G',             price:19990000, oldPrice:22990000, rating:4.7, reviews:654,  img:'/quinoa/product_phone.png', badge:'hot',  isNew:true  },
  { id:802, brand:'oneplus', name:'OnePlus Nord 4 5G',         price:8990000,  oldPrice:10490000, rating:4.5, reviews:432,  img:'/quinoa/product_phone.png', badge:'sale', isNew:false },
  // Honor
  { id:901, brand:'honor',   name:'Honor Magic 7 Pro',         price:18990000, oldPrice:21990000, rating:4.6, reviews:321,  img:'/quinoa/product_phone.png', badge:'new',  isNew:true  },
  { id:902, brand:'honor',   name:'Honor 200 Pro',             price:11990000, oldPrice:13990000, rating:4.5, reviews:543,  img:'/quinoa/product_phone.png', badge:'sale', isNew:false },
  // Nubia
  { id:1001, brand:'nubia',  name:'Nubia Red Magic 10 Pro',    price:22990000, oldPrice:25990000, rating:4.7, reviews:234,  img:'/quinoa/product_phone.png', badge:'hot',  isNew:true  },
  // Meizu
  { id:1101, brand:'meizu',  name:'Meizu 21 Note',             price:12990000, oldPrice:14990000, rating:4.4, reviews:123,  img:'/quinoa/product_phone.png', badge:'new',  isNew:true  },
];

const ACCESSORIES = [
  { id:2001, type:'earbuds',    name:'AirPods Pro 2nd Gen', brand:'Apple',  price:6990000, oldPrice:7990000, rating:4.8, reviews:4321, img:'/quinoa/product_earbuds.png',     badge:'hot'  },
  { id:2002, type:'earbuds',    name:'Samsung Galaxy Buds 3 Pro', brand:'Samsung', price:3990000, oldPrice:4990000, rating:4.7, reviews:2134, img:'/quinoa/product_earbuds.png', badge:'sale' },
  { id:2003, type:'speaker',    name:'JBL Charge 5',        brand:'JBL',    price:3490000, oldPrice:4290000, rating:4.6, reviews:3421, img:'/quinoa/product_speaker.png',     badge:'sale' },
  { id:2004, type:'watch',      name:'Apple Watch Series 10', brand:'Apple', price:11990000, oldPrice:13990000, rating:4.8, reviews:2345, img:'/quinoa/product_smartwatch.png', badge:'hot' },
  { id:2005, type:'watch',      name:'Samsung Galaxy Watch 7', brand:'Samsung', price:7990000, oldPrice:9990000, rating:4.6, reviews:1234, img:'/quinoa/product_smartwatch.png', badge:'sale' },
  { id:2006, type:'headphones', name:'Sony WH-1000XM5',     brand:'Sony',   price:8490000, oldPrice:9990000, rating:4.9, reviews:5678, img:'/quinoa/product_headphones.png',  badge:'hot'  },
  { id:2007, type:'headphones', name:'AKG N700NC M2',       brand:'AKG',    price:4490000, oldPrice:5490000, rating:4.5, reviews:876,  img:'/quinoa/product_headphones.png',  badge:'sale' },
  { id:2008, type:'speaker',    name:'JBL Flip 6',          brand:'JBL',    price:2190000, oldPrice:2790000, rating:4.5, reviews:2876, img:'/quinoa/product_speaker.png',     badge:'sale' },
];

// ── STATE ─────────────────────────────────────────────
let cart     = JSON.parse(localStorage.getItem('pz_cart') || '[]');
let wishlist = JSON.parse(localStorage.getItem('pz_wish') || '[]');
let activeBrand = 'all';
let currentSlide = 0;
let sliderTimer;

// ── UTILS ─────────────────────────────────────────────
const fmt = n => new Intl.NumberFormat('vi-VN').format(n) + 'đ';
const discount = (p, o) => o ? `-${Math.round((1 - p/o) * 100)}%` : '';

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2400);
}

// ── CART ──────────────────────────────────────────────
function updateCartUI() {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  document.getElementById('cartCount').textContent = count;
  document.getElementById('cartItemCount').textContent = count;
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  document.getElementById('cartTotal').textContent = fmt(total);
  const wrap = document.getElementById('cartItems');
  if (!cart.length) {
    wrap.innerHTML = '<div class="cart-empty"><i class="fa fa-shopping-cart"></i><p>Giỏ hàng đang trống</p></div>';
    return;
  }
  wrap.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.img}" alt="${item.name}"/>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${fmt(item.price)} × ${item.qty}</div>
      </div>
      <button class="cart-item-remove" data-id="${item.id}"><i class="fa fa-trash"></i></button>
    </div>
  `).join('');
  wrap.querySelectorAll('.cart-item-remove').forEach(btn => {
    btn.onclick = () => {
      cart = cart.filter(i => i.id != btn.dataset.id);
      localStorage.setItem('pz_cart', JSON.stringify(cart));
      updateCartUI();
    };
  });
}

function addToCart(id) {
  const p = [...PHONES, ...ACCESSORIES].find(x => x.id === id);
  const ex = cart.find(x => x.id === id);
  if (ex) ex.qty++; else cart.push({ ...p, qty: 1 });
  localStorage.setItem('pz_cart', JSON.stringify(cart));
  updateCartUI();
  showToast(`🛒 Đã thêm "${p.name}" vào giỏ hàng!`);
}

function updateWishlistUI() {
  document.getElementById('wishlistCount').textContent = wishlist.length;
}

function toggleWish(id) {
  const idx = wishlist.indexOf(id);
  if (idx >= 0) { wishlist.splice(idx, 1); showToast('💔 Đã xoá khỏi yêu thích'); }
  else           { wishlist.push(id);       showToast('❤️ Đã thêm vào yêu thích!'); }
  localStorage.setItem('pz_wish', JSON.stringify(wishlist));
  updateWishlistUI();
  renderPhones();
}

// ── PRODUCT CARD ──────────────────────────────────────
function makeCard(p) {
  const disc = p.oldPrice ? discount(p.price, p.oldPrice) : '';
  return `
  <div class="product-card">
    <div class="product-badges">
      ${p.isNew  ? '<span class="badge-tag badge-new">Mới</span>' : ''}
      ${p.badge === 'sale' ? '<span class="badge-tag badge-sale">Sale</span>' : ''}
      ${p.badge === 'hot'  ? '<span class="badge-tag badge-hot">Hot</span>' : ''}
    </div>
    <button class="product-wish ${wishlist.includes(p.id)?'active':''}" data-wid="${p.id}">
      <i class="${wishlist.includes(p.id)?'fas':'far'} fa-heart"></i>
    </button>
    <div class="product-img"><img src="${p.img}" alt="${p.name}" loading="lazy"/></div>
    <div class="product-info">
      <div class="product-brand-tag">${p.brand}</div>
      <div class="product-name">${p.name}</div>
      <div class="product-rating">
        <span class="stars-small">${'★'.repeat(Math.floor(p.rating))}${'☆'.repeat(5-Math.floor(p.rating))}</span>
        <span class="rating-count">(${p.reviews.toLocaleString()})</span>
      </div>
      <div class="product-price">
        <span class="price-current">${fmt(p.price)}</span>
        ${p.oldPrice ? `<span class="price-old">${fmt(p.oldPrice)}</span>` : ''}
        ${disc ? `<span class="price-discount">${disc}</span>` : ''}
      </div>
      <div class="product-installment">Trả góp 0% từ <span>${fmt(Math.round(p.price/12))}/tháng</span></div>
      <div class="product-actions">
        <button class="btn-cart" data-cid="${p.id}"><i class="fa fa-cart-plus"></i> Mua ngay</button>
        <button class="btn-view" title="Xem nhanh"><i class="fa fa-eye"></i></button>
      </div>
    </div>
  </div>`;
}

function bindCardEvents(container) {
  container.querySelectorAll('.btn-cart').forEach(b => b.onclick = e => { e.stopPropagation(); addToCart(+b.dataset.cid); });
  container.querySelectorAll('.product-wish').forEach(b => b.onclick = e => { e.stopPropagation(); toggleWish(+b.dataset.wid); });
}

// ── RENDER PHONES ─────────────────────────────────────
function renderPhones() {
  const list = activeBrand === 'all' ? PHONES : PHONES.filter(p => p.brand === activeBrand);
  const grid = document.getElementById('productsGrid');
  grid.innerHTML = list.map(makeCard).join('');
  bindCardEvents(grid);
}

// ── RENDER FLASH ──────────────────────────────────────
function renderFlash() {
  const deals = PHONES.filter(p => p.badge === 'sale' || p.badge === 'hot').slice(0, 5);
  const grid = document.getElementById('flashGrid');
  grid.innerHTML = deals.map(makeCard).join('');
  bindCardEvents(grid);
}

// ── RENDER ACCESSORIES ────────────────────────────────
function renderAccessories() {
  const grid = document.getElementById('accGrid');
  grid.innerHTML = ACCESSORIES.map(makeCard).join('');
  bindCardEvents(grid);
}

// ── BRAND BAR & TABS ──────────────────────────────────
function buildBrandBar() {
  const bar = document.getElementById('brandBar');
  bar.innerHTML =
    `<button class="brand-pill active" data-brand="all">Tất cả</button>` +
    BRANDS.map(b => `<button class="brand-pill" data-brand="${b.id}">${b.emoji} ${b.name}</button>`).join('');
  bar.querySelectorAll('.brand-pill').forEach(btn => {
    btn.onclick = () => {
      bar.querySelectorAll('.brand-pill').forEach(x => x.classList.remove('active'));
      btn.classList.add('active');
      activeBrand = btn.dataset.brand;
      // sync brand tabs
      document.querySelectorAll('.brand-tab').forEach(t => {
        t.classList.toggle('active', t.dataset.brand === activeBrand);
      });
      renderPhones();
      document.getElementById('phones').scrollIntoView({ behavior:'smooth' });
    };
  });
}

function buildBrandTabs() {
  const wrap = document.getElementById('brandTabs');
  wrap.innerHTML =
    `<button class="brand-tab active" data-brand="all">Tất cả</button>` +
    BRANDS.map(b => `<button class="brand-tab" data-brand="${b.id}">${b.emoji} ${b.name}</button>`).join('');
  wrap.querySelectorAll('.brand-tab').forEach(btn => {
    btn.onclick = () => {
      wrap.querySelectorAll('.brand-tab').forEach(x => x.classList.remove('active'));
      btn.classList.add('active');
      activeBrand = btn.dataset.brand;
      document.querySelectorAll('#brandBar .brand-pill').forEach(x => {
        x.classList.toggle('active', x.dataset.brand === activeBrand);
      });
      renderPhones();
    };
  });
}

// ── BRAND DROPDOWN (MEGA MENU) ────────────────────────
function buildBrandDropdown() {
  const grid = document.getElementById('brandDropdownGrid');
  grid.innerHTML = BRANDS.map(b => `
    <a class="brand-dd-item" href="./brand.html?brand=${b.id}">
      <span class="brand-logo-text">${b.emoji}</span> ${b.name}
    </a>`).join('');
}

// ── FOOTER BRAND LINKS ────────────────────────────────
function buildFooterLinks() {
  const ul = document.getElementById('footerBrandLinks');
  if (!ul) return;
  ul.innerHTML = BRANDS.map(b => `<li><a href="./brand.html?brand=${b.id}">${b.emoji} ${b.name}</a></li>`).join('');
}

// ── NAV PHONE DROPDOWN ────────────────────────────────
function buildNavDropdown() {
  const dd = document.getElementById('phoneNavDropdown');
  if (!dd) return;
  dd.innerHTML =
    BRANDS.map(b => `
      <a class="nav-dd-item" href="./brand.html?brand=${b.id}" data-b="${b.id}">
        <span class="dd-emoji">${b.emoji}</span> ${b.name}
      </a>`).join('') +
    `<div class="nav-dd-divider"></div>
     <a class="nav-dd-all" href="./brand.html?brand=all">
       <i class="fa fa-th-large"></i> Xem tất cả hãng
     </a>`;
}

// ── MEGA MENU TOGGLE ──────────────────────────────────
function closeMegaMenu() {
  document.getElementById('brandDropdown').classList.remove('open');
  document.getElementById('brandMenuBtn').classList.remove('open');
}

function initMegaMenu() {
  const btn = document.getElementById('brandMenuBtn');
  const dd  = document.getElementById('brandDropdown');
  btn.onclick = e => {
    e.stopPropagation();
    dd.classList.toggle('open');
    btn.classList.toggle('open');
  };
  document.addEventListener('click', e => {
    if (!dd.contains(e.target) && e.target !== btn) closeMegaMenu();
  });
}

// ── SLIDER ────────────────────────────────────────────
function goToSlide(n) {
  const slides = document.querySelectorAll('.hero-slide');
  const dots   = document.querySelectorAll('.dot');
  slides[currentSlide].classList.remove('active');
  dots[currentSlide].classList.remove('active');
  currentSlide = (n + slides.length) % slides.length;
  slides[currentSlide].classList.add('active');
  dots[currentSlide].classList.add('active');
}

function startSlider() {
  sliderTimer = setInterval(() => goToSlide(currentSlide + 1), 5000);
}

// ── COUNTDOWN ─────────────────────────────────────────
function initCountdown() {
  const end = Date.now() + 8 * 3600000 + 23 * 60000;
  const tick = () => {
    const diff = Math.max(0, end - Date.now());
    const h = String(Math.floor(diff / 3600000)).padStart(2,'0');
    const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2,'0');
    const s = String(Math.floor((diff % 60000) / 1000)).padStart(2,'0');
    document.getElementById('hours').textContent   = h;
    document.getElementById('minutes').textContent = m;
    document.getElementById('seconds').textContent = s;
  };
  tick(); setInterval(tick, 1000);
}

// ── NAVBAR ────────────────────────────────────────────
function initNavbar() {
  window.addEventListener('scroll', () => {
    document.getElementById('backToTop').classList.toggle('visible', window.scrollY > 300);
  });
  document.getElementById('hamburger').onclick = () => {
    document.getElementById('navLinks').classList.toggle('open');
  };
  document.querySelectorAll('.nav-link').forEach(l => {
    l.onclick = () => document.getElementById('navLinks').classList.remove('open');
  });
}

// ── CART SIDEBAR ──────────────────────────────────────
function initCart() {
  const open  = () => { document.getElementById('cartSidebar').classList.add('active'); document.getElementById('cartOverlay').classList.add('active'); };
  const close = () => { document.getElementById('cartSidebar').classList.remove('active'); document.getElementById('cartOverlay').classList.remove('active'); };
  document.getElementById('cartBtn').onclick     = open;
  document.getElementById('closeCart').onclick   = close;
  document.getElementById('cartOverlay').onclick = close;
}

// ── INIT ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  buildBrandBar();
  buildBrandTabs();
  buildBrandDropdown();
  buildNavDropdown();
  buildFooterLinks();
  renderPhones();
  renderFlash();
  renderAccessories();
  updateCartUI();
  updateWishlistUI();
  initCountdown();
  initNavbar();
  initCart();
  initMegaMenu();
  startSlider();

  document.getElementById('prevSlide').onclick = () => { clearInterval(sliderTimer); goToSlide(currentSlide - 1); startSlider(); };
  document.getElementById('nextSlide').onclick = () => { clearInterval(sliderTimer); goToSlide(currentSlide + 1); startSlider(); };
  document.querySelectorAll('.dot').forEach(d => {
    d.onclick = () => { clearInterval(sliderTimer); goToSlide(+d.dataset.slide); startSlider(); };
  });

  document.getElementById('backToTop').onclick = () => window.scrollTo({ top:0, behavior:'smooth' });

  document.getElementById('newsletterForm').onsubmit = e => {
    e.preventDefault();
    showToast('🎉 Đăng ký thành công! Mã 500K đã gửi về email.');
    document.getElementById('emailInput').value = '';
  };

  document.getElementById('loadMoreBtn').onclick = () => showToast('📦 Đã hiển thị toàn bộ sản phẩm!');
});
