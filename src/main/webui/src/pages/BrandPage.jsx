import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useDrawer, useMediaQuery } from '../hooks/useDrawer';
import {
  IoGridOutline,
  IoSparkles,
  IoPhonePortraitOutline,
  IoHomeOutline,
  IoChevronForward,
  IoChevronDown,
  IoChevronUp,
  IoFilterOutline,
  IoSearchOutline,
  IoCloseOutline,
  IoOptionsOutline,
  IoPricetagOutline,
  IoHardwareChipOutline,
  IoSpeedometerOutline,
  IoColorPaletteOutline,
  IoGiftOutline,
  IoCheckmarkCircleOutline,
  IoCheckmark,
  IoRefreshOutline,
  IoReloadOutline,
} from 'react-icons/io5';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { BRANDS, PHONES } from '../data/data';
import { fetchApi } from '../api/apiClient';
import ProductCard from '../components/ProductCard';
import {
  mapProduct,
  removeVietnameseTones,
  extractRoms,
  extractRams,
  extractColors,
  COLOR_PALETTE,
} from '../utils/utils';

// Thứ tự hãng ưu tiên: 8 chip chính trên desktop, các hãng còn lại gom vào menu "Khác ▾"
const DEFAULT_PRIMARY_BRAND_IDS = ['iphone', 'samsung', 'xiaomi', 'oppo', 'vivo', 'realme', 'honor'];
const DEFAULT_SECONDARY_BRAND_IDS = ['redmi', 'oneplus', 'nubia', 'meizu'];

// Helper xác định hiển thị logo và nhãn cho từng hãng
function getBrandDisplay(b) {
  if (b.id === 'iphone') return { isIconOnly: true, label: 'Apple', logoClass: 'logo-icon' };
  if (b.id === 'xiaomi') return { isIconOnly: true, label: 'Xiaomi', logoClass: 'logo-icon' };
  if (b.id === 'oneplus') return { isIconOnly: true, label: 'OnePlus', logoClass: 'logo-icon' };
  if (b.id === 'meizu') return { isIconOnly: true, label: 'Meizu', logoClass: 'logo-icon' };
  if (b.id === 'samsung' || b.id === 'redmi' || b.id === 'honor') {
    return { isIconOnly: false, label: b.name, logoClass: 'logo-wide' };
  }
  return { isIconOnly: false, label: b.name, logoClass: '' };
}

// Các khoảng giá chọn nhanh
const PRICE_QUICK_CHIPS = [
  { id: 'under10', label: 'Dưới 10 triệu', min: 0, max: 10000000 },
  { id: '10to20', label: '10–20 triệu', min: 10000000, max: 20000000 },
  { id: '20to35', label: '20–35 triệu', min: 20000000, max: 35000000 },
  { id: 'over35', label: 'Trên 35 triệu', min: 35000000, max: Infinity },
];

const PAGE_SIZE = 18; // 6 hàng mỗi hàng 3 sản phẩm

export default function BrandPage() {
  const { brandId } = useParams();
  const [searchParams] = useSearchParams();
  const currentBrandId = brandId || 'all';

  // ── States ──
  const [rawProducts, setRawProducts] = useState([]);
  const [brandCounts, setBrandCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Điều khiển dropdown "Khác ▾" và auto-scroll mobile
  const [showOtherDropdown, setShowOtherDropdown] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);
  const switcherRef = useRef(null);
  const activeChipRef = useRef(null);

  // Mở / đóng dropdown Khác với vị trí tính theo button
  const toggleOtherDropdown = (e) => {
    e.stopPropagation();
    if (!showOtherDropdown && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const rightPos = Math.max(12, window.innerWidth - rect.right);
      setDropdownPos({
        top: rect.bottom + 8,
        right: rightPos,
      });
      setShowOtherDropdown(true);
    } else {
      setShowOtherDropdown(false);
    }
  };

  // Tự động hoán đổi: nếu brand đang chọn nằm trong nhóm Khác, hoán lên hàng chính để luôn thấy chip đang chọn
  const { primaryBrands, otherBrands } = useMemo(() => {
    let prim = [...DEFAULT_PRIMARY_BRAND_IDS];
    let sec = [...DEFAULT_SECONDARY_BRAND_IDS];

    if (currentBrandId && currentBrandId !== 'all' && sec.includes(currentBrandId)) {
      const swappedOut = prim[prim.length - 1]; // e.g. 'honor'
      prim = [...prim.slice(0, prim.length - 1), currentBrandId];
      sec = sec.filter(id => id !== currentBrandId);
      sec.unshift(swappedOut);
    }

    const primaryList = prim.map(id => BRANDS.find(b => b.id === id)).filter(Boolean);
    const otherList = sec.map(id => BRANDS.find(b => b.id === id)).filter(Boolean);

    return { primaryBrands: primaryList, otherBrands: otherList };
  }, [currentBrandId]);

  // Đóng dropdown khi click ngoài, cuộn trang hoặc đổi kích thước màn hình
  useEffect(() => {
    if (!showOtherDropdown) return;

    function handleClickOutside(event) {
      if (
        dropdownRef.current && !dropdownRef.current.contains(event.target) &&
        buttonRef.current && !buttonRef.current.contains(event.target)
      ) {
        setShowOtherDropdown(false);
      }
    }

    function handleScrollOrResize() {
      setShowOtherDropdown(false);
    }

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScrollOrResize, { passive: true });
    window.addEventListener('resize', handleScrollOrResize, { passive: true });

    const switcherEl = switcherRef.current;
    if (switcherEl) {
      switcherEl.addEventListener('scroll', handleScrollOrResize, { passive: true });
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScrollOrResize);
      window.removeEventListener('resize', handleScrollOrResize);
      if (switcherEl) {
        switcherEl.removeEventListener('scroll', handleScrollOrResize);
      }
    };
  }, [showOtherDropdown]);

  // Mobile: tự động cuộn đến chip đang chọn
  useEffect(() => {
    if (activeChipRef.current) {
      activeChipRef.current.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
    }
  }, [currentBrandId]);

  // Điều khiển drawer lọc trên mobile
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const mobileFilters = useMediaQuery('(max-width: 992px)');
  const filterRef = useDrawer(mobileFilterOpen && mobileFilters, () => setMobileFilterOpen(false));
  useEffect(() => { setMobileFilterOpen(false); }, [mobileFilters]);

  // Accordion mở/đóng từng nhóm lọc (aria-expanded)
  const [openAccordions, setOpenAccordions] = useState({
    price: true,
    rom: true,
    ram: true,
    color: true,
    promo: true,
  });

  // ── Tiêu chí lọc ──
  const [searchKeyword, setSearchKeyword] = useState(searchParams.get('q') || '');
  const [priceQuick, setPriceQuick] = useState(null);
  const [inputMin, setInputMin] = useState('');
  const [inputMax, setInputMax] = useState('');
  const [appliedPriceRange, setAppliedPriceRange] = useState({ min: null, max: null, label: null });
  const [selectedRoms, setSelectedRoms] = useState(new Set());
  const [selectedRams, setSelectedRams] = useState(new Set());
  const [selectedColors, setSelectedColors] = useState(new Set());
  const [selectedPromos, setSelectedPromos] = useState(new Set()); // 'sale', 'inStock'
  const [sort, setSort] = useState('default');

  // Cập nhật keyword nếu URL có tham số q
  useEffect(() => {
    if (searchParams.get('q')) {
      setSearchKeyword(searchParams.get('q'));
    }
  }, [searchParams]);

  // ── Tải dữ liệu sản phẩm từ API hoặc Fallback ──
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');
    setVisibleCount(PAGE_SIZE);

    async function loadData() {
      try {
        // Tải danh sách sản phẩm (tối đa 200)
        let endpoint = '/products?size=200';
        if (currentBrandId && currentBrandId !== 'all') {
          const brandObj = BRANDS.find(b => b.id === currentBrandId);
          const brandQuery = brandObj ? brandObj.name : currentBrandId;
          endpoint += `&brand=${encodeURIComponent(brandQuery)}`;
        }

        const res = await fetchApi(endpoint);
        if (isMounted && res && res.data) {
          const mapped = res.data.map(mapProduct).filter(Boolean);
          setRawProducts(mapped);
        }
      } catch (err) {
        console.warn('API error, falling back to local PHONES dataset:', err);
        if (isMounted) {
          // Fallback sang PHONES
          let fallback = PHONES.map(mapProduct);
          if (currentBrandId && currentBrandId !== 'all') {
            fallback = fallback.filter(p => (p.brand || '').toLowerCase().includes(currentBrandId.toLowerCase()));
          }
          setRawProducts(fallback);
          if (!fallback || fallback.length === 0) {
            setError('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => { isMounted = false; };
  }, [currentBrandId]);

  // Tải thống kê số lượng sản phẩm của từng hãng một lần
  useEffect(() => {
    let isMounted = true;
    async function loadBrandCounts() {
      try {
        const res = await fetchApi('/products?size=200');
        if (isMounted && res && res.data) {
          const counts = {};
          res.data.forEach(p => {
            const dm = (p.danhMuc || '').toLowerCase();
            BRANDS.forEach(b => {
              if (dm.includes(b.id.toLowerCase()) || dm.includes(b.name.toLowerCase())) {
                counts[b.id] = (counts[b.id] || 0) + 1;
              }
            });
          });
          setBrandCounts(counts);
        }
      } catch (e) {
        // Fallback đếm từ PHONES
        const counts = {};
        PHONES.forEach(p => {
          const b = (p.brand || '').toLowerCase();
          counts[b] = (counts[b] || 0) + 1;
        });
        if (isMounted) setBrandCounts(counts);
      }
    }
    loadBrandCounts();
    return () => { isMounted = false; };
  }, []);

  const brandObj = BRANDS.find(b => b.id === currentBrandId) || null;

  // ── Tiền xử lý thông số cho toàn bộ sản phẩm của danh mục ──
  const parsedProducts = useMemo(() => {
    return rawProducts.map(p => {
      const roms = extractRoms(p);
      const rams = extractRams(p);
      const colors = extractColors(p);
      const price = p.price || 0;
      const isOnSale = (p.oldPrice && p.oldPrice > price) || p.badge === 'sale';
      const isInStock = p.stockQuantity == null || p.stockQuantity > 0;
      const cleanName = removeVietnameseTones(p.name || '');

      return {
        ...p,
        _roms: roms,
        _rams: rams,
        _colors: colors,
        _price: price,
        _isOnSale: isOnSale,
        _isInStock: isInStock,
        _cleanName: cleanName,
      };
    });
  }, [rawProducts]);

  // ── Lấy các giá trị lọc THỰC TẾ xuất hiện trong danh mục (không hardcode) ──
  const availableRoms = useMemo(() => {
    const romOrder = ['32GB', '64GB', '128GB', '256GB', '512GB', '1TB'];
    const found = new Set();
    parsedProducts.forEach(p => p._roms.forEach(r => found.add(r)));
    return romOrder.filter(r => found.has(r));
  }, [parsedProducts]);

  const availableRams = useMemo(() => {
    const ramOrder = ['3GB', '4GB', '6GB', '8GB', '12GB', '16GB', '24GB'];
    const found = new Set();
    parsedProducts.forEach(p => p._rams.forEach(r => found.add(r)));
    return ramOrder.filter(r => found.has(r));
  }, [parsedProducts]);

  const availableColors = useMemo(() => {
    const found = new Set();
    parsedProducts.forEach(p => p._colors.forEach(c => found.add(c)));
    return COLOR_PALETTE.filter(c => found.has(c.id));
  }, [parsedProducts]);

  // ── Helper kiểm tra khớp điều kiện lọc ──
  const matchesKeyword = useCallback((p, kw) => {
    if (!kw || !kw.trim()) return true;
    const cleanKw = removeVietnameseTones(kw);
    return p._cleanName.includes(cleanKw);
  }, []);

  const matchesPrice = useCallback((p, range) => {
    if (range.min != null && p._price < range.min) return false;
    if (range.max != null && p._price > range.max) return false;
    return true;
  }, []);

  const matchesRom = useCallback((p, romSet) => {
    if (romSet.size === 0) return true;
    // Chọn nhiều giá trị trong cùng nhóm = OR
    return p._roms.some(r => romSet.has(r));
  }, []);

  const matchesRam = useCallback((p, ramSet) => {
    if (ramSet.size === 0) return true;
    // Chọn nhiều giá trị trong cùng nhóm = OR
    return p._rams.some(r => ramSet.has(r));
  }, []);

  const matchesColor = useCallback((p, colorSet) => {
    if (colorSet.size === 0) return true;
    // Chọn nhiều giá trị trong cùng nhóm = OR
    return p._colors.some(c => colorSet.has(c));
  }, []);

  const matchesPromo = useCallback((p, promoSet) => {
    if (promoSet.size === 0) return true;
    if (promoSet.has('sale') && !p._isOnSale) return false;
    if (promoSet.has('inStock') && !p._isInStock) return false;
    return true;
  }, []);

  // ── Tính số kết quả tương ứng cho từng tùy chọn lọc (Faceted Search) ──
  // Số kết quả của tùy chọn O trong nhóm G được tính dựa trên tất cả các bộ lọc khác đang bật!
  const facetCounts = useMemo(() => {
    const counts = {
      priceQuick: {},
      rom: {},
      ram: {},
      color: {},
      promo: { sale: 0, inStock: 0 },
    };

    // 1. Khoảng giá nhanh
    PRICE_QUICK_CHIPS.forEach(chip => {
      let c = 0;
      parsedProducts.forEach(p => {
        if (
          matchesKeyword(p, searchKeyword) &&
          matchesRom(p, selectedRoms) &&
          matchesRam(p, selectedRams) &&
          matchesColor(p, selectedColors) &&
          matchesPromo(p, selectedPromos) &&
          p._price >= chip.min && (chip.max === Infinity || p._price <= chip.max)
        ) {
          c++;
        }
      });
      counts.priceQuick[chip.id] = c;
    });

    // 2. ROM
    availableRoms.forEach(rom => {
      let c = 0;
      parsedProducts.forEach(p => {
        if (
          matchesKeyword(p, searchKeyword) &&
          matchesPrice(p, appliedPriceRange) &&
          matchesRam(p, selectedRams) &&
          matchesColor(p, selectedColors) &&
          matchesPromo(p, selectedPromos) &&
          p._roms.includes(rom)
        ) {
          c++;
        }
      });
      counts.rom[rom] = c;
    });

    // 3. RAM
    availableRams.forEach(ram => {
      let c = 0;
      parsedProducts.forEach(p => {
        if (
          matchesKeyword(p, searchKeyword) &&
          matchesPrice(p, appliedPriceRange) &&
          matchesRom(p, selectedRoms) &&
          matchesColor(p, selectedColors) &&
          matchesPromo(p, selectedPromos) &&
          p._rams.includes(ram)
        ) {
          c++;
        }
      });
      counts.ram[ram] = c;
    });

    // 4. Màu sắc
    availableColors.forEach(color => {
      let c = 0;
      parsedProducts.forEach(p => {
        if (
          matchesKeyword(p, searchKeyword) &&
          matchesPrice(p, appliedPriceRange) &&
          matchesRom(p, selectedRoms) &&
          matchesRam(p, selectedRams) &&
          matchesPromo(p, selectedPromos) &&
          p._colors.includes(color.id)
        ) {
          c++;
        }
      });
      counts.color[color.id] = c;
    });

    // 5. Ưu đãi
    ['sale', 'inStock'].forEach(promoId => {
      let c = 0;
      parsedProducts.forEach(p => {
        if (
          matchesKeyword(p, searchKeyword) &&
          matchesPrice(p, appliedPriceRange) &&
          matchesRom(p, selectedRoms) &&
          matchesRam(p, selectedRams) &&
          matchesColor(p, selectedColors)
        ) {
          if (promoId === 'sale' && p._isOnSale) c++;
          if (promoId === 'inStock' && p._isInStock) c++;
        }
      });
      counts.promo[promoId] = c;
    });

    return counts;
  }, [
    parsedProducts,
    searchKeyword,
    appliedPriceRange,
    selectedRoms,
    selectedRams,
    selectedColors,
    selectedPromos,
    availableRoms,
    availableRams,
    availableColors,
    matchesKeyword,
    matchesPrice,
    matchesRom,
    matchesRam,
    matchesColor,
    matchesPromo,
  ]);

  // ── Danh sách sản phẩm thỏa mãn tất cả tiêu chí lọc (AND giữa các nhóm) ──
  const filteredProducts = useMemo(() => {
    return parsedProducts.filter(p =>
      matchesKeyword(p, searchKeyword) &&
      matchesPrice(p, appliedPriceRange) &&
      matchesRom(p, selectedRoms) &&
      matchesRam(p, selectedRams) &&
      matchesColor(p, selectedColors) &&
      matchesPromo(p, selectedPromos)
    );
  }, [
    parsedProducts,
    searchKeyword,
    appliedPriceRange,
    selectedRoms,
    selectedRams,
    selectedColors,
    selectedPromos,
    matchesKeyword,
    matchesPrice,
    matchesRom,
    matchesRam,
    matchesColor,
    matchesPromo,
  ]);

  // ── Sắp xếp sản phẩm ──
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    switch (sort) {
      case 'price-asc':
        return list.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return list.sort((a, b) => b.price - a.price);
      case 'newest':
        return list.sort((a, b) => (b.id || 0) - (a.id || 0));
      case 'discount-deep':
        return list.sort((a, b) => {
          const discA = a.oldPrice ? (a.oldPrice - a.price) / a.oldPrice : 0;
          const discB = b.oldPrice ? (b.oldPrice - b.price) / b.oldPrice : 0;
          return discB - discA;
        });
      default:
        return list;
    }
  }, [filteredProducts, sort]);

  const visibleProducts = useMemo(() => {
    return sortedProducts.slice(0, visibleCount);
  }, [sortedProducts, visibleCount]);

  const hasMore = visibleCount < sortedProducts.length;

  // ── Thao tác điều khiển bộ lọc ──
  const toggleAccordion = (key) => {
    setOpenAccordions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleQuickPriceClick = (chip) => {
    if (priceQuick === chip.id) {
      // Bỏ chọn chip giá hiện tại
      setPriceQuick(null);
      setAppliedPriceRange({ min: null, max: null, label: null });
      setInputMin('');
      setInputMax('');
    } else {
      setPriceQuick(chip.id);
      setAppliedPriceRange({ min: chip.min, max: chip.max, label: chip.label });
      setInputMin(chip.min === 0 ? '' : String(chip.min / 1000000));
      setInputMax(chip.max === Infinity ? '' : String(chip.max / 1000000));
    }
  };

  const handleApplyCustomPrice = (e) => {
    e?.preventDefault();
    const minVal = inputMin.trim() ? Number(inputMin) * 1000000 : null;
    const maxVal = inputMax.trim() ? Number(inputMax) * 1000000 : null;

    if (minVal != null && maxVal != null && minVal > maxVal) {
      alert('Giá "Từ" không được lớn hơn giá "Đến"');
      return;
    }

    let label = '';
    if (minVal != null && maxVal != null) {
      label = `${inputMin}tr – ${inputMax}tr`;
    } else if (minVal != null) {
      label = `Từ ${inputMin} triệu`;
    } else if (maxVal != null) {
      label = `Đến ${inputMax} triệu`;
    }

    setPriceQuick(null);
    setAppliedPriceRange({ min: minVal, max: maxVal, label: label || null });
  };

  const toggleRom = (rom) => {
    setSelectedRoms(prev => {
      const next = new Set(prev);
      if (next.has(rom)) next.delete(rom);
      else next.add(rom);
      return next;
    });
  };

  const toggleRam = (ram) => {
    setSelectedRams(prev => {
      const next = new Set(prev);
      if (next.has(ram)) next.delete(ram);
      else next.add(ram);
      return next;
    });
  };

  const toggleColor = (colorId) => {
    setSelectedColors(prev => {
      const next = new Set(prev);
      if (next.has(colorId)) next.delete(colorId);
      else next.add(colorId);
      return next;
    });
  };

  const togglePromo = (promoId) => {
    setSelectedPromos(prev => {
      const next = new Set(prev);
      if (next.has(promoId)) next.delete(promoId);
      else next.add(promoId);
      return next;
    });
  };

  const clearAllFilters = () => {
    setSearchKeyword('');
    setPriceQuick(null);
    setInputMin('');
    setInputMax('');
    setAppliedPriceRange({ min: null, max: null, label: null });
    setSelectedRoms(new Set());
    setSelectedRams(new Set());
    setSelectedColors(new Set());
    setSelectedPromos(new Set());
    setSort('default');
  };

  // Kiểm tra có đang áp dụng bộ lọc nào không
  const hasActiveFilters = Boolean(
    searchKeyword.trim() ||
    appliedPriceRange.label ||
    selectedRoms.size > 0 ||
    selectedRams.size > 0 ||
    selectedColors.size > 0 ||
    selectedPromos.size > 0
  );

  const totalCatalogCount = rawProducts.length;

  return (
    <>
      {/* ── 4.1 Banner danh mục (Category Banner) ── */}
      <section className="brand-page-hero">
        <div className="container">
          <div className="brand-hero-inner">
            <div className="brand-hero-icon-wrap">
              {brandObj && brandObj.logo ? (
                <img src={brandObj.logo} alt={brandObj.name} className="brand-hero-logo" />
              ) : (
                <IoPhonePortraitOutline />
              )}
            </div>

            <div className="brand-hero-text">
              <span className="brand-hero-badge">
                <IoSparkles style={{ color: '#38bdf8', marginRight: 5, verticalAlign: 'middle' }} />
                {brandObj ? `Thương hiệu ${brandObj.name}` : 'Danh mục điện thoại'}
              </span>
              <h1>Điện thoại {brandObj ? brandObj.name : 'Tất cả các hãng'}</h1>
              <p>
                Khám phá các mẫu điện thoại {brandObj ? brandObj.name : ''} chính hãng chất lượng cao, đa dạng phân khúc giá tốt và bảo hành uy tín tại PhoneZone.
              </p>
            </div>

            <div className="brand-hero-watermark">
              <IoPhonePortraitOutline />
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Section ── */}
      <section className="brand-page-section">
        <div className="container">

          {/* ── Breadcrumb ── */}
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link to="/"><IoHomeOutline style={{ marginRight: 4, verticalAlign: '-2px' }} /> Trang chủ</Link>
            <span className="sep"><IoChevronForward style={{ fontSize: '0.8rem', opacity: 0.6, verticalAlign: '-1px' }} /></span>
            <Link to="/brand/all">Điện thoại</Link>
            {brandObj && (
              <>
                <span className="sep"><IoChevronForward style={{ fontSize: '0.8rem', opacity: 0.6, verticalAlign: '-1px' }} /></span>
                <span>{brandObj.name}</span>
              </>
            )}
          </nav>

          {/* ── 4.2 Điều hướng thương hiệu (Brand Navigation Switcher) ── */}
          <nav className="brand-nav-switcher-wrapper" aria-label="Thương hiệu">
            <div className="brand-nav-switcher" ref={switcherRef}>
              {/* Chip Tất cả */}
              <Link
                to="/brand/all"
                className={`brand-chip${currentBrandId === 'all' ? ' active' : ''}`}
                aria-current={currentBrandId === 'all' ? 'page' : undefined}
                ref={currentBrandId === 'all' ? activeChipRef : null}
              >
                <IoGridOutline style={{ fontSize: '1.1rem' }} />
                <span>Tất cả</span>
              </Link>

              {/* 7 hãng chính trên thanh điều hướng (hoán đổi hãng đang chọn lên nếu ở nhóm Khác) */}
              {primaryBrands.map(b => {
                const { isIconOnly, label, logoClass } = getBrandDisplay(b);
                const isActive = currentBrandId === b.id;
                return (
                  <Link
                    key={b.id}
                    to={`/brand/${b.id}`}
                    className={`brand-chip${isActive ? ' active' : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                    ref={isActive ? activeChipRef : null}
                    aria-label={b.name}
                    title={b.name}
                  >
                    <div className="brand-chip-logo-box">
                      {b.logo ? (
                        <img
                          src={b.logo}
                          alt={b.name}
                          className={logoClass}
                          width="72"
                          height="22"
                          loading="eager"
                        />
                      ) : (
                        <span className="brand-chip-emoji">{b.emoji}</span>
                      )}
                    </div>
                    {isIconOnly && <span className="brand-chip-label">{label}</span>}
                  </Link>
                );
              })}

              {/* Nút dropdown "Khác ▾" */}
              {otherBrands.length > 0 && (
                <div className="brand-more-wrap">
                  <button
                    ref={buttonRef}
                    type="button"
                    className={`brand-more-btn${showOtherDropdown ? ' open' : ''}`}
                    onClick={toggleOtherDropdown}
                    aria-haspopup="true"
                    aria-expanded={showOtherDropdown}
                    aria-label="Xem thêm các hãng khác"
                  >
                    <span>Khác</span>
                    {showOtherDropdown ? <IoChevronUp style={{ fontSize: '0.85rem' }} /> : <IoChevronDown style={{ fontSize: '0.85rem' }} />}
                  </button>
                </div>
              )}
            </div>
          </nav>

          {/* Menu con "Khác ▾" dùng Portal gắn vào document.body để tuyệt đối không bị overflow/container cắt xén */}
          {showOtherDropdown && otherBrands.length > 0 && createPortal(
            <div
              ref={dropdownRef}
              className="brand-more-dropdown-menu"
              role="menu"
              style={{
                position: 'fixed',
                top: `${dropdownPos.top}px`,
                right: `${dropdownPos.right}px`,
                zIndex: 99999,
              }}
            >
              <div className="brand-more-dropdown-header">
                <span>Thương hiệu khác</span>
                <span className="brand-more-dropdown-count">{otherBrands.length}</span>
              </div>
              <div className="brand-more-dropdown-list">
                {otherBrands.map(b => {
                  const isActive = currentBrandId === b.id;
                  return (
                    <Link
                      key={b.id}
                      to={`/brand/${b.id}`}
                      className={`brand-dropdown-item${isActive ? ' active' : ''}`}
                      role="menuitem"
                      aria-current={isActive ? 'page' : undefined}
                      onClick={() => setShowOtherDropdown(false)}
                    >
                      <span className="brand-dropdown-logo-box">
                        {b.logo ? (
                          <img src={b.logo} alt={b.name} className="brand-dropdown-logo" width="26" height="16" />
                        ) : (
                          <span style={{ fontSize: '0.9rem' }}>{b.emoji}</span>
                        )}
                      </span>
                      <span className="brand-dropdown-name">{b.name}</span>
                      {isActive && (
                        <IoCheckmark className="brand-dropdown-check" style={{ fontSize: '1.1rem' }} />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>,
            document.body
          )}

          {/* ── 4.3 BỐ CỤC 2 CỘT: SIDEBAR LỌC + LƯỚI SẢN PHẨM ── */}
          <div className="brand-catalog-layout">

            {/* Backdrop đóng modal lọc trên mobile */}
            {mobileFilterOpen && (
              <div
                className="mobile-filter-backdrop"
                onClick={() => setMobileFilterOpen(false)}
              ></div>
            )}

            {/* ── SIDEBAR LỌC (Sticky + Accordion) ── */}
            <aside ref={filterRef} id="catalogFilters" className={`brand-filter-sidebar${mobileFilterOpen ? ' open' : ''}`} role={mobileFilters ? 'dialog' : undefined} aria-modal={mobileFilters && mobileFilterOpen ? true : undefined} aria-label="Bộ lọc sản phẩm" aria-hidden={mobileFilters && !mobileFilterOpen ? true : undefined} inert={mobileFilters && !mobileFilterOpen ? '' : undefined} tabIndex={-1}>
              <div className="filter-sidebar-header">
                <div className="filter-sidebar-title">
                  <IoFilterOutline style={{ fontSize: '1.1rem', marginRight: 6, verticalAlign: '-2px' }} />
                  <span>Bộ lọc</span>
                </div>
                {hasActiveFilters && (
                  <button
                    type="button"
                    className="filter-sidebar-clear-btn"
                    onClick={clearAllFilters}
                    title="Xóa tất cả bộ lọc"
                  >
                    Xóa tất cả
                  </button>
                )}
                {/* Nút đóng trên mobile */}
                <button
                  type="button"
                  className="mobile-filter-close-btn"
                  onClick={() => setMobileFilterOpen(false)}
                  aria-label="Đóng bộ lọc"
                >
                  <IoCloseOutline style={{ fontSize: '1.3rem' }} />
                </button>
              </div>

              {/* Nhóm 1: Khoảng giá */}
              <div className="filter-accordion">
                <button
                  type="button"
                  className="filter-accordion-header"
                  onClick={() => toggleAccordion('price')}
                  aria-expanded={openAccordions.price}
                >
                  <span className="filter-accordion-title">
                    <i className="fas fa-tag"></i> Khoảng giá
                  </span>
                  <i className={`fas fa-chevron-${openAccordions.price ? 'up' : 'down'} accordion-arrow`}></i>
                </button>

                {openAccordions.price && (
                  <div className="filter-accordion-body">
                    {/* Chip chọn nhanh */}
                    <div className="filter-quick-chips">
                      {PRICE_QUICK_CHIPS.map(chip => {
                        const count = facetCounts.priceQuick[chip.id] || 0;
                        const isSelected = priceQuick === chip.id;
                        const isDisabled = count === 0 && !isSelected;
                        return (
                          <button
                            key={chip.id}
                            type="button"
                            className={`filter-quick-chip${isSelected ? ' active' : ''}${isDisabled ? ' disabled' : ''}`}
                            onClick={() => handleQuickPriceClick(chip)}
                            disabled={isDisabled}
                          >
                            <span>{chip.label}</span>
                            <span className="chip-count">({count})</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Hai ô nhập Từ/Đến + nút Áp dụng */}
                    <form className="filter-price-form" onSubmit={handleApplyCustomPrice}>
                      <div className="filter-price-inputs">
                        <div className="price-input-wrap">
                          <label htmlFor="priceFrom">Từ</label>
                          <input
                            id="priceFrom"
                            type="number"
                            placeholder="0"
                            min="0"
                            step="0.5"
                            value={inputMin}
                            onChange={e => setInputMin(e.target.value)}
                          />
                          <span className="unit">tr</span>
                        </div>
                        <span className="dash">–</span>
                        <div className="price-input-wrap">
                          <label htmlFor="priceTo">Đến</label>
                          <input
                            id="priceTo"
                            type="number"
                            placeholder="50"
                            min="0"
                            step="0.5"
                            value={inputMax}
                            onChange={e => setInputMax(e.target.value)}
                          />
                          <span className="unit">tr</span>
                        </div>
                      </div>
                      <button type="submit" className="btn-apply-price">
                        Áp dụng
                      </button>
                    </form>
                  </div>
                )}
              </div>

              {/* Nhóm 2: Dung lượng (ROM) */}
              {availableRoms.length > 0 && (
                <div className="filter-accordion">
                  <button
                    type="button"
                    className="filter-accordion-header"
                    onClick={() => toggleAccordion('rom')}
                    aria-expanded={openAccordions.rom}
                  >
                    <span className="filter-accordion-title">
                      <i className="fas fa-hard-drive"></i> Dung lượng (ROM)
                    </span>
                    <i className={`fas fa-chevron-${openAccordions.rom ? 'up' : 'down'} accordion-arrow`}></i>
                  </button>

                  {openAccordions.rom && (
                    <div className="filter-accordion-body">
                      <div className="filter-checkbox-list">
                        {availableRoms.map(rom => {
                          const count = facetCounts.rom[rom] || 0;
                          const isSelected = selectedRoms.has(rom);
                          const isDisabled = count === 0 && !isSelected;
                          return (
                            <label
                              key={rom}
                              className={`filter-checkbox-item${isDisabled ? ' disabled' : ''}`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                disabled={isDisabled}
                                onChange={() => toggleRom(rom)}
                              />
                              <span className="custom-check-box"></span>
                              <span className="filter-item-label">{rom}</span>
                              <span className="filter-item-count">({count})</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Nhóm 3: RAM */}
              {availableRams.length > 0 && (
                <div className="filter-accordion">
                  <button
                    type="button"
                    className="filter-accordion-header"
                    onClick={() => toggleAccordion('ram')}
                    aria-expanded={openAccordions.ram}
                  >
                    <span className="filter-accordion-title">
                      <i className="fas fa-memory"></i> RAM
                    </span>
                    <i className={`fas fa-chevron-${openAccordions.ram ? 'up' : 'down'} accordion-arrow`}></i>
                  </button>

                  {openAccordions.ram && (
                    <div className="filter-accordion-body">
                      <div className="filter-checkbox-list">
                        {availableRams.map(ram => {
                          const count = facetCounts.ram[ram] || 0;
                          const isSelected = selectedRams.has(ram);
                          const isDisabled = count === 0 && !isSelected;
                          return (
                            <label
                              key={ram}
                              className={`filter-checkbox-item${isDisabled ? ' disabled' : ''}`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                disabled={isDisabled}
                                onChange={() => toggleRam(ram)}
                              />
                              <span className="custom-check-box"></span>
                              <span className="filter-item-label">{ram}</span>
                              <span className="filter-item-count">({count})</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Nhóm 4: Màu sắc */}
              {availableColors.length > 0 && (
                <div className="filter-accordion">
                  <button
                    type="button"
                    className="filter-accordion-header"
                    onClick={() => toggleAccordion('color')}
                    aria-expanded={openAccordions.color}
                  >
                    <span className="filter-accordion-title">
                      <i className="fas fa-palette"></i> Màu sắc
                    </span>
                    <i className={`fas fa-chevron-${openAccordions.color ? 'up' : 'down'} accordion-arrow`}></i>
                  </button>

                  {openAccordions.color && (
                    <div className="filter-accordion-body">
                      <div className="filter-checkbox-list">
                        {availableColors.map(color => {
                          const count = facetCounts.color[color.id] || 0;
                          const isSelected = selectedColors.has(color.id);
                          const isDisabled = count === 0 && !isSelected;
                          return (
                            <label
                              key={color.id}
                              className={`filter-checkbox-item${isDisabled ? ' disabled' : ''}`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                disabled={isDisabled}
                                onChange={() => toggleColor(color.id)}
                              />
                              <span className="custom-check-box"></span>
                              <span
                                className="color-swatch-dot"
                                style={{ backgroundColor: color.hex }}
                              ></span>
                              <span className="filter-item-label">{color.label}</span>
                              <span className="filter-item-count">({count})</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Nhóm 5: Ưu đãi */}
              <div className="filter-accordion">
                <button
                  type="button"
                  className="filter-accordion-header"
                  onClick={() => toggleAccordion('promo')}
                  aria-expanded={openAccordions.promo}
                >
                  <span className="filter-accordion-title">
                    <i className="fas fa-badge-percent"></i> Ưu đãi & Tình trạng
                  </span>
                  <i className={`fas fa-chevron-${openAccordions.promo ? 'up' : 'down'} accordion-arrow`}></i>
                </button>

                {openAccordions.promo && (
                  <div className="filter-accordion-body">
                    <div className="filter-checkbox-list">
                      {/* Đang giảm giá */}
                      {(() => {
                        const count = facetCounts.promo.sale || 0;
                        const isSelected = selectedPromos.has('sale');
                        const isDisabled = count === 0 && !isSelected;
                        return (
                          <label className={`filter-checkbox-item${isDisabled ? ' disabled' : ''}`}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              disabled={isDisabled}
                              onChange={() => togglePromo('sale')}
                            />
                            <span className="custom-check-box"></span>
                            <span className="filter-item-label">
                              <i className="fas fa-fire-flame-curved" style={{ color: '#ef4444', marginRight: 6 }}></i>
                              Đang giảm giá
                            </span>
                            <span className="filter-item-count">({count})</span>
                          </label>
                        );
                      })()}

                      {/* Còn hàng */}
                      {(() => {
                        const count = facetCounts.promo.inStock || 0;
                        const isSelected = selectedPromos.has('inStock');
                        const isDisabled = count === 0 && !isSelected;
                        return (
                          <label className={`filter-checkbox-item${isDisabled ? ' disabled' : ''}`}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              disabled={isDisabled}
                              onChange={() => togglePromo('inStock')}
                            />
                            <span className="custom-check-box"></span>
                            <span className="filter-item-label">
                              <i className="fas fa-circle-check" style={{ color: '#10b981', marginRight: 6 }}></i>
                              Còn hàng
                            </span>
                            <span className="filter-item-count">({count})</span>
                          </label>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </div>
              <button type="button" className="mobile-filter-apply" onClick={() => setMobileFilterOpen(false)}>Xem {filteredProducts.length} sản phẩm</button>
            </aside>

            {/* ── CỘT PHẢI: THANH TÌM KIẾM/SẮP XẾP + LƯỚI SẢN PHẨM ── */}
            <main className="brand-products-area">

              {/* Thanh phía trên lưới sản phẩm */}
              <div className="catalog-top-bar">
                {/* Nút mở bộ lọc trên mobile */}
                <button
                  type="button"
                  className="btn-mobile-filter-trigger"
                  aria-expanded={mobileFilterOpen}
                  aria-controls="catalogFilters"
                  onClick={() => setMobileFilterOpen(true)}
                >
                  <IoOptionsOutline style={{ marginRight: 6, fontSize: '1.1rem', verticalAlign: '-2px' }} />
                  <span>Bộ lọc</span>
                  {hasActiveFilters && <span className="active-dot"></span>}
                </button>

                {/* Ô tìm kiếm trong danh mục (không phân biệt dấu tiếng Việt) */}
                <div className="catalog-search-wrap">
                  <IoSearchOutline className="search-icon" style={{ fontSize: '1.1rem' }} />
                  <input
                    type="text"
                    placeholder="Tìm trong danh mục này..."
                    value={searchKeyword}
                    onChange={e => setSearchKeyword(e.target.value)}
                    className="catalog-search-input"
                  />
                  {searchKeyword && (
                    <button
                      type="button"
                      className="search-clear-btn"
                      onClick={() => setSearchKeyword('')}
                      title="Xóa tìm kiếm"
                    >
                      <IoCloseOutline style={{ fontSize: '1.2rem' }} />
                    </button>
                  )}
                </div>

                {/* Ô sắp xếp */}
                <div className="catalog-sort-wrap">
                  <span className="sort-label">Sắp xếp:</span>
                  <select
                    className="catalog-sort-select"
                    value={sort}
                    onChange={e => setSort(e.target.value)}
                  >
                    <option value="default">Mặc định</option>
                    <option value="newest">Mới nhất</option>
                    <option value="price-asc">Giá thấp đến cao</option>
                    <option value="price-desc">Giá cao đến thấp</option>
                    <option value="discount-deep">Giảm sâu nhất</option>
                  </select>
                </div>

                {/* Bộ đếm kết quả */}
                <div className="catalog-counter">
                  Hiển thị <strong>{filteredProducts.length}</strong> / <strong>{totalCatalogCount}</strong> sản phẩm
                </div>
              </div>

              {/* Hàng chip các bộ lọc đang bật */}
              {hasActiveFilters && (
                <div className="active-filters-row">
                  <span className="active-filters-label">Đang lọc:</span>

                  {searchKeyword.trim() && (
                    <span className="active-filter-chip">
                      Từ khóa: "{searchKeyword}"
                      <button type="button" onClick={() => setSearchKeyword('')}>
                        <IoCloseOutline style={{ fontSize: '1.05rem', verticalAlign: '-2px' }} />
                      </button>
                    </span>
                  )}

                  {appliedPriceRange.label && (
                    <span className="active-filter-chip">
                      Giá: {appliedPriceRange.label}
                      <button
                        type="button"
                        onClick={() => {
                          setPriceQuick(null);
                          setAppliedPriceRange({ min: null, max: null, label: null });
                          setInputMin('');
                          setInputMax('');
                        }}
                      >
                        <IoCloseOutline style={{ fontSize: '1.05rem', verticalAlign: '-2px' }} />
                      </button>
                    </span>
                  )}

                  {Array.from(selectedRoms).map(r => (
                    <span key={r} className="active-filter-chip">
                      ROM: {r}
                      <button type="button" onClick={() => toggleRom(r)}>
                        <IoCloseOutline style={{ fontSize: '1.05rem', verticalAlign: '-2px' }} />
                      </button>
                    </span>
                  ))}

                  {Array.from(selectedRams).map(r => (
                    <span key={r} className="active-filter-chip">
                      RAM: {r}
                      <button type="button" onClick={() => toggleRam(r)}>
                        <IoCloseOutline style={{ fontSize: '1.05rem', verticalAlign: '-2px' }} />
                      </button>
                    </span>
                  ))}

                  {Array.from(selectedColors).map(colorId => {
                    const col = COLOR_PALETTE.find(c => c.id === colorId);
                    return (
                      <span key={colorId} className="active-filter-chip">
                        Màu: {col ? col.label : colorId}
                        <button type="button" onClick={() => toggleColor(colorId)}>
                          <IoCloseOutline style={{ fontSize: '1.05rem', verticalAlign: '-2px' }} />
                        </button>
                      </span>
                    );
                  })}

                  {selectedPromos.has('sale') && (
                    <span className="active-filter-chip">
                      Đang giảm giá
                      <button type="button" onClick={() => togglePromo('sale')}>
                        <IoCloseOutline style={{ fontSize: '1.05rem', verticalAlign: '-2px' }} />
                      </button>
                    </span>
                  )}

                  {selectedPromos.has('inStock') && (
                    <span className="active-filter-chip">
                      Còn hàng
                      <button type="button" onClick={() => togglePromo('inStock')}>
                        <IoCloseOutline style={{ fontSize: '1.05rem', verticalAlign: '-2px' }} />
                      </button>
                    </span>
                  )}

                  <button
                    type="button"
                    className="active-filters-clear-all"
                    onClick={clearAllFilters}
                  >
                    Xóa tất cả
                  </button>
                </div>
              )}

              {/* Lỗi nếu có */}
              {error && (
                <div className="catalog-error" role="alert">
                  {error}
                </div>
              )}

              {/* Trạng thái tải dữ liệu */}
              {loading ? (
                <div className="catalog-loading-state">
                  <i className="fas fa-spinner fa-spin"></i>
                  <p>Đang tải danh sách sản phẩm...</p>
                </div>
              ) : visibleProducts.length > 0 ? (
                <>
                  {/* Lưới sản phẩm */}
                  <div className="products-grid">
                    {visibleProducts.map(p => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>

                  {/* Nút Xem thêm */}
                  {hasMore && (
                    <div className="catalog-load-more-wrap">
                      <button
                        type="button"
                        className="btn-catalog-load-more"
                        onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
                      >
                        <span>Xem thêm sản phẩm</span>
                        <IoChevronDown style={{ fontSize: '0.95rem' }} />
                      </button>
                    </div>
                  )}

                  {!hasMore && sortedProducts.length > PAGE_SIZE && (
                    <div className="catalog-all-loaded">
                      <IoCheckmarkCircleOutline style={{ fontSize: '1.15rem', color: '#16a34a', verticalAlign: '-2px' }} />
                      <span>Đã hiển thị tất cả {sortedProducts.length} sản phẩm</span>
                    </div>
                  )}
                </>
              ) : (
                /* Trạng thái rỗng khi không có kết quả lọc */
                <div className="filter-empty-state">
                  <div className="empty-icon-wrap">
                    <IoFilterOutline style={{ fontSize: '2.5rem', color: '#94a3b8' }} />
                  </div>
                  <h3>Không tìm thấy sản phẩm phù hợp</h3>
                  <p>
                    {hasActiveFilters
                      ? 'Không có sản phẩm nào khớp với tiêu chí lọc đã chọn. Hãy thử điều chỉnh hoặc xóa bớt bộ lọc.'
                      : 'Hãng này hiện chưa có sản phẩm hoặc đang được cập nhật.'}
                  </p>
                  {hasActiveFilters && (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={clearAllFilters}
                    >
                      <IoRefreshOutline style={{ marginRight: 6, fontSize: '1.1rem', verticalAlign: '-2px' }} /> Xóa bộ lọc
                    </button>
                  )}
                </div>
              )}
            </main>
          </div>
        </div>
      </section>
    </>
  );
}
