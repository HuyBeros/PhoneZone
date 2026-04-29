// ── SHARED DATA (copy từ main.js) ──────────────────────
const BRANDS = [
  { id:'iphone',  name:'iPhone',          emoji:'🍎', color:'#555' },
  { id:'samsung', name:'Samsung',         emoji:'🔵', color:'#1428a0' },
  { id:'xiaomi',  name:'Xiaomi',          emoji:'🟠', color:'#ff6900' },
  { id:'redmi',   name:'Redmi',           emoji:'🔴', color:'#e63946' },
  { id:'oppo',    name:'OPPO',            emoji:'🟢', color:'#1d6339' },
  { id:'realme',  name:'Realme',          emoji:'🟡', color:'#f5a623' },
  { id:'vivo',    name:'Vivo',            emoji:'🔷', color:'#415fff' },
  { id:'oneplus', name:'OnePlus',         emoji:'🔴', color:'#eb0029' },
  { id:'honor',   name:'Honor',           emoji:'🩵', color:'#007aff' },
  { id:'nubia',   name:'Nubia Red Magic', emoji:'🎮', color:'#e63946' },
  { id:'meizu',   name:'Meizu',           emoji:'⚫', color:'#333' },
];

const PHONES = [
  { id:101, brand:'iphone',  name:'iPhone 16 Pro Max 256GB',   price:34990000, oldPrice:37990000, rating:4.9, reviews:8234, img:'/quinoa/product_phone.png', badge:'hot',  isNew:false },
  { id:102, brand:'iphone',  name:'iPhone 16 Pro 128GB',       price:28990000, oldPrice:31990000, rating:4.8, reviews:5421, img:'/quinoa/product_phone.png', badge:'sale', isNew:false },
  { id:103, brand:'iphone',  name:'iPhone 16 Plus 128GB',      price:24990000, oldPrice:26990000, rating:4.7, reviews:3102, img:'/quinoa/product_phone.png', badge:'',     isNew:false },
  { id:104, brand:'iphone',  name:'iPhone 15 Pro Max 256GB',   price:27990000, oldPrice:32990000, rating:4.8, reviews:9876, img:'/quinoa/product_phone.png', badge:'sale', isNew:false },
  { id:201, brand:'samsung', name:'Samsung Galaxy S25 Ultra',  price:29990000, oldPrice:32990000, rating:4.8, reviews:6543, img:'/quinoa/product_phone.png', badge:'hot',  isNew:true  },
  { id:202, brand:'samsung', name:'Samsung Galaxy S25+',       price:22990000, oldPrice:25990000, rating:4.7, reviews:3210, img:'/quinoa/product_phone.png', badge:'new',  isNew:true  },
  { id:203, brand:'samsung', name:'Samsung Galaxy Z Fold 6',   price:41990000, oldPrice:45990000, rating:4.7, reviews:1234, img:'/quinoa/product_phone.png', badge:'',     isNew:false },
  { id:204, brand:'samsung', name:'Samsung Galaxy A56 5G',     price:9990000,  oldPrice:11990000, rating:4.5, reviews:4321, img:'/quinoa/product_phone.png', badge:'sale', isNew:true  },
  { id:301, brand:'xiaomi',  name:'Xiaomi 15 Ultra',           price:23990000, oldPrice:26990000, rating:4.8, reviews:2345, img:'/quinoa/product_phone.png', badge:'hot',  isNew:true  },
  { id:302, brand:'xiaomi',  name:'Xiaomi 15 Pro',             price:18990000, oldPrice:21990000, rating:4.7, reviews:1876, img:'/quinoa/product_phone.png', badge:'new',  isNew:true  },
  { id:303, brand:'xiaomi',  name:'Xiaomi 14T Pro',            price:15990000, oldPrice:18990000, rating:4.6, reviews:3421, img:'/quinoa/product_phone.png', badge:'sale', isNew:false },
  { id:401, brand:'redmi',   name:'Redmi Note 14 Pro+ 5G',     price:8990000,  oldPrice:10990000, rating:4.6, reviews:5678, img:'/quinoa/product_phone.png', badge:'sale', isNew:false },
  { id:402, brand:'redmi',   name:'Redmi Note 14 5G',          price:6490000,  oldPrice:7490000,  rating:4.5, reviews:4532, img:'/quinoa/product_phone.png', badge:'',     isNew:false },
  { id:501, brand:'oppo',    name:'OPPO Find X8 Pro',          price:24990000, oldPrice:27990000, rating:4.7, reviews:1234, img:'/quinoa/product_phone.png', badge:'hot',  isNew:true  },
  { id:502, brand:'oppo',    name:'OPPO Reno 13 Pro',          price:12990000, oldPrice:14990000, rating:4.6, reviews:2109, img:'/quinoa/product_phone.png', badge:'new',  isNew:true  },
  { id:503, brand:'oppo',    name:'OPPO A3 Pro 5G',            price:6490000,  oldPrice:7490000,  rating:4.4, reviews:1890, img:'/quinoa/product_phone.png', badge:'sale', isNew:false },
  { id:601, brand:'realme',  name:'Realme GT 7 Pro',           price:13990000, oldPrice:15990000, rating:4.6, reviews:876,  img:'/quinoa/product_phone.png', badge:'new',  isNew:true  },
  { id:602, brand:'realme',  name:'Realme 13 Pro+ 5G',         price:8490000,  oldPrice:9990000,  rating:4.5, reviews:1543, img:'/quinoa/product_phone.png', badge:'sale', isNew:false },
  { id:701, brand:'vivo',    name:'Vivo X200 Pro',             price:20990000, oldPrice:23990000, rating:4.7, reviews:543,  img:'/quinoa/product_phone.png', badge:'hot',  isNew:true  },
  { id:702, brand:'vivo',    name:'Vivo V40 5G',               price:9990000,  oldPrice:11490000, rating:4.5, reviews:876,  img:'/quinoa/product_phone.png', badge:'sale', isNew:false },
  { id:801, brand:'oneplus', name:'OnePlus 13 5G',             price:19990000, oldPrice:22990000, rating:4.7, reviews:654,  img:'/quinoa/product_phone.png', badge:'hot',  isNew:true  },
  { id:802, brand:'oneplus', name:'OnePlus Nord 4 5G',         price:8990000,  oldPrice:10490000, rating:4.5, reviews:432,  img:'/quinoa/product_phone.png', badge:'sale', isNew:false },
  { id:901, brand:'honor',   name:'Honor Magic 7 Pro',         price:18990000, oldPrice:21990000, rating:4.6, reviews:321,  img:'/quinoa/product_phone.png', badge:'new',  isNew:true  },
  { id:902, brand:'honor',   name:'Honor 200 Pro',             price:11990000, oldPrice:13990000, rating:4.5, reviews:543,  img:'/quinoa/product_phone.png', badge:'sale', isNew:false },
  { id:1001, brand:'nubia',  name:'Nubia Red Magic 10 Pro',    price:22990000, oldPrice:25990000, rating:4.7, reviews:234,  img:'/quinoa/product_phone.png', badge:'hot',  isNew:true  },
  { id:1101, brand:'meizu',  name:'Meizu 21 Note',             price:12990000, oldPrice:14990000, rating:4.4, reviews:123,  img:'/quinoa/product_phone.png', badge:'new',  isNew:true  },
];

// ── STATE ──────────────────────────────────────────────
let cart     = JSON.parse(localStorage.getItem('pz_cart') || '[]');
let wishlist = JSON.parse(localStorage.getItem('pz_wish') || '[]');
let currentBrand = 'all';
let currentSort  = 'default';

// ── UTILS ──────────────────────────────────────────────
const fmt = n => new Intl.NumberFormat('vi-VN').format(n) + 'đ';
const discount = (p, o) => o ? `-${Math.round((1 - p/o) * 100)}%` : '';

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2400);
}

// ── CART ───────────────────────────────────────────────
function updateCartUI() {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  document.getElementById('cartCount').textContent     = count;
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
  const p  = PHONES.find(x => x.id === id);
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

// ── PRODUCT CARD ───────────────────────────────────────
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
  container.querySelectorAll('.btn-cart').forEach(b  => b.onclick  = e => { e.stopPropagation(); addToCart(+b.dataset.cid); });
  container.querySelectorAll('.product-wish').forEach(b => b.onclick = e => { e.stopPropagation(); toggleWish(+b.dataset.wid); });
}

// ── SORT HELPER ────────────────────────────────────────
function sortPhones(list) {
  const copy = [...list];
  switch (currentSort) {
    case 'price-asc':  return copy.sort((a,b) => a.price - b.price);
    case 'price-desc': return copy.sort((a,b) => b.price - a.price);
    case 'rating':     return copy.sort((a,b) => b.rating - a.rating);
    case 'reviews':    return copy.sort((a,b) => b.reviews - a.reviews);
    default:           return copy;
  }
}

// ── RENDER PHONES ──────────────────────────────────────
function renderPhones() {
  let list = currentBrand === 'all' ? PHONES : PHONES.filter(p => p.brand === currentBrand);
  list = sortPhones(list);

  const grid  = document.getElementById('productsGrid');
  const empty = document.getElementById('emptyState');
  const count = document.getElementById('resultCount');

  count.textContent = list.length;

  if (!list.length) {
    grid.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';
  grid.innerHTML = list.map(makeCard).join('');
  bindCardEvents(grid);
}

// ── UPDATE HERO / BREADCRUMB ───────────────────────────
function updateHero(brandObj) {
  const name = brandObj ? brandObj.name : 'Tất cả điện thoại';
  const emoji = brandObj ? brandObj.emoji : '📱';
  const count = brandObj
    ? PHONES.filter(p => p.brand === brandObj.id).length
    : PHONES.length;

  document.title        = `PhoneZone – Điện thoại ${name}`;
  document.getElementById('heroEmoji').textContent   = emoji;
  document.getElementById('heroTitle').textContent   = `Điện thoại ${name}`;
  document.getElementById('heroSub').textContent     = `Khám phá ${count} mẫu ${name} chính hãng mới nhất`;
  document.getElementById('heroCount').textContent   = count;
  document.getElementById('breadcrumbBrand').textContent = name;
}

// ── BRAND SWITCHER ─────────────────────────────────────
function buildBrandSwitcher() {
  const wrap = document.getElementById('brandSwitcher');
  wrap.innerHTML =
    `<button class="brand-switch-btn ${currentBrand==='all'?'active':''}" data-b="all">
       <span class="sw-emoji">📱</span><span class="sw-name">Tất cả</span>
     </button>` +
    BRANDS.map(b => `
      <button class="brand-switch-btn ${currentBrand===b.id?'active':''}" data-b="${b.id}">
        <span class="sw-emoji">${b.emoji}</span><span class="sw-name">${b.name}</span>
      </button>`).join('');

  wrap.querySelectorAll('.brand-switch-btn').forEach(btn => {
    btn.onclick = () => {
      currentBrand = btn.dataset.b;
      // Update URL param without reload
      const url = new URL(window.location.href);
      url.searchParams.set('brand', currentBrand);
      history.pushState({}, '', url);

      wrap.querySelectorAll('.brand-switch-btn').forEach(x => x.classList.remove('active'));
      btn.classList.add('active');

      const brandObj = BRANDS.find(b => b.id === currentBrand) || null;
      updateHero(brandObj);
      renderPhones();

      // sync nav dropdown active
      document.querySelectorAll('.nav-dd-item').forEach(el => {
        el.classList.toggle('active-dd', el.dataset.b === currentBrand);
      });
    };
  });
}

// ── NAV DROPDOWN ───────────────────────────────────────
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

// ── MEGA MENU ──────────────────────────────────────────
function buildBrandDropdown() {
  const grid = document.getElementById('brandDropdownGrid');
  if (!grid) return;
  grid.innerHTML = BRANDS.map(b => `
    <a class="brand-dd-item" href="./brand.html?brand=${b.id}">
      <span class="brand-logo-text">${b.emoji}</span> ${b.name}
    </a>`).join('');
}

function initMegaMenu() {
  const btn = document.getElementById('brandMenuBtn');
  const dd  = document.getElementById('brandDropdown');
  if (!btn || !dd) return;
  btn.onclick = e => { e.stopPropagation(); dd.classList.toggle('open'); btn.classList.toggle('open'); };
  document.addEventListener('click', e => {
    if (!dd.contains(e.target) && e.target !== btn) {
      dd.classList.remove('open');
      btn.classList.remove('open');
    }
  });
}

// ── FOOTER LINKS ───────────────────────────────────────
function buildFooterLinks() {
  const ul = document.getElementById('footerBrandLinks');
  if (!ul) return;
  ul.innerHTML = BRANDS.map(b =>
    `<li><a href="./brand.html?brand=${b.id}">${b.emoji} ${b.name}</a></li>`
  ).join('');
}

// ── CART SIDEBAR ───────────────────────────────────────
function initCart() {
  const open  = () => { document.getElementById('cartSidebar').classList.add('active');    document.getElementById('cartOverlay').classList.add('active'); };
  const close = () => { document.getElementById('cartSidebar').classList.remove('active'); document.getElementById('cartOverlay').classList.remove('active'); };
  document.getElementById('cartBtn').onclick     = open;
  document.getElementById('closeCart').onclick   = close;
  document.getElementById('cartOverlay').onclick = close;
}

// ── NAVBAR ─────────────────────────────────────────────
function initNavbar() {
  window.addEventListener('scroll', () => {
    document.getElementById('backToTop').classList.toggle('visible', window.scrollY > 300);
  });
  document.getElementById('hamburger').onclick = () => {
    document.getElementById('navLinks').classList.toggle('open');
  };
  document.getElementById('backToTop').onclick = () => window.scrollTo({ top:0, behavior:'smooth' });
}

// ── INIT ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Read brand from URL ?brand=iphone
  const params = new URLSearchParams(window.location.search);
  currentBrand = params.get('brand') || 'all';

  const brandObj = BRANDS.find(b => b.id === currentBrand) || null;

  updateHero(brandObj);
  buildBrandSwitcher();
  buildNavDropdown();
  buildBrandDropdown();
  buildFooterLinks();
  renderPhones();
  updateCartUI();
  updateWishlistUI();
  initCart();
  initNavbar();
  initMegaMenu();

  // Sort
  document.getElementById('sortSelect').onchange = e => {
    currentSort = e.target.value;
    renderPhones();
  };
});
