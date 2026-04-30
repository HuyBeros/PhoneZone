const fs = require('fs');

const rawData = fs.readFileSync('../../../mobilecity_20260427_120149.json', 'utf-8');
const items = JSON.parse(rawData);

const BRANDS = [
  { id: 'iphone',  name: 'iPhone',         emoji: '🍎', color: '#555'    },
  { id: 'samsung', name: 'Samsung',        emoji: '🔵', color: '#1428a0' },
  { id: 'xiaomi',  name: 'Xiaomi',         emoji: '🟠', color: '#ff6900' },
  { id: 'redmi',   name: 'Redmi',          emoji: '🔴', color: '#e63946' },
  { id: 'oppo',    name: 'OPPO',           emoji: '🟢', color: '#1d6339' },
  { id: 'realme',  name: 'Realme',         emoji: '🟡', color: '#f5a623' },
  { id: 'vivo',    name: 'Vivo',           emoji: '🔷', color: '#415fff' },
  { id: 'oneplus', name: 'OnePlus',        emoji: '🔴', color: '#eb0029' },
  { id: 'honor',   name: 'Honor',          emoji: '🩵', color: '#007aff' },
  { id: 'nubia',   name: 'Nubia Red Magic',emoji: '🎮', color: '#e63946' },
  { id: 'meizu',   name: 'Meizu',          emoji: '⚫', color: '#333'    },
];

function determineBrand(name, category) {
  const s = (name + ' ' + category).toLowerCase();
  for (const b of BRANDS) {
    if (s.includes(b.name.toLowerCase())) return b.id;
    if (b.id === 'nubia' && (s.includes('nubia') || s.includes('red magic'))) return 'nubia';
  }
  return 'other';
}

const PHONES = [];
let idCounter = 1;

for (const item of items) {
  const brand = determineBrand(item.ten_san_pham, item.danh_muc || '');
  if (brand === 'other') continue; // only keep known brands to match our tabs
  
  const price = item.gia_ban_so || 0;
  const oldPrice = item.gia_goc_so || 0;
  if (price === 0) continue;

  const rating = 4.0 + Math.random() * 1.0;
  const reviews = Math.floor(Math.random() * 5000) + 50;
  
  let badge = '';
  if (oldPrice > price) {
    if ((oldPrice - price) / oldPrice > 0.15) badge = 'hot';
    else badge = 'sale';
  }

  PHONES.push({
    id: idCounter++,
    brand: brand,
    name: item.ten_san_pham,
    price: price,
    oldPrice: oldPrice,
    rating: parseFloat(rating.toFixed(1)),
    reviews: reviews,
    img: item.hinh_anh,
    badge: badge,
    isNew: Math.random() > 0.8,
    specs: item.thong_so || {}
  });
}

// ACCESSORIES mock
const ACCESSORIES = [
  { id:2001, type:'earbuds',    name:'AirPods Pro 2nd Gen',      brand:'Apple',  price:6990000,  oldPrice:7990000,  rating:4.8, reviews:4321, img:'/quinoa/product_earbuds.png',    badge:'hot'  },
  { id:2002, type:'earbuds',    name:'Samsung Galaxy Buds 3 Pro',brand:'Samsung',price:3990000,  oldPrice:4990000,  rating:4.7, reviews:2134, img:'/quinoa/product_earbuds.png',    badge:'sale' },
  { id:2003, type:'speaker',    name:'JBL Charge 5',             brand:'JBL',    price:3490000,  oldPrice:4290000,  rating:4.6, reviews:3421, img:'/quinoa/product_speaker.png',    badge:'sale' },
  { id:2004, type:'watch',      name:'Apple Watch Series 10',    brand:'Apple',  price:11990000, oldPrice:13990000, rating:4.8, reviews:2345, img:'/quinoa/product_smartwatch.png', badge:'hot'  },
  { id:2005, type:'watch',      name:'Samsung Galaxy Watch 7',   brand:'Samsung',price:7990000,  oldPrice:9990000,  rating:4.6, reviews:1234, img:'/quinoa/product_smartwatch.png', badge:'sale' },
  { id:2006, type:'headphones', name:'Sony WH-1000XM5',          brand:'Sony',   price:8490000,  oldPrice:9990000,  rating:4.9, reviews:5678, img:'/quinoa/product_headphones.png', badge:'hot'  },
  { id:2007, type:'headphones', name:'AKG N700NC M2',            brand:'AKG',    price:4490000,  oldPrice:5490000,  rating:4.5, reviews:876,  img:'/quinoa/product_headphones.png', badge:'sale' },
  { id:2008, type:'speaker',    name:'JBL Flip 6',               brand:'JBL',    price:2190000,  oldPrice:2790000,  rating:4.5, reviews:2876, img:'/quinoa/product_speaker.png',    badge:'sale' }
];

let out = `export const BRANDS = ${JSON.stringify(BRANDS, null, 2)};\n\n`;
out += `export const PHONES = ${JSON.stringify(PHONES, null, 2)};\n\n`;
out += `export const ACCESSORIES = ${JSON.stringify(ACCESSORIES, null, 2)};\n`;

fs.writeFileSync('src/data/data.js', out, 'utf-8');
console.log('Converted', PHONES.length, 'phones!');
