import {
  IoTabletPortraitOutline,
  IoSparkles,
  IoHomeOutline,
  IoChevronForward,
  IoFilterOutline,
  IoCloseOutline,
  IoPricetagOutline,
  IoHardwareChipOutline,
  IoSpeedometerOutline,
  IoGiftOutline,
  IoOptionsOutline,
  IoSearchOutline,
  IoChevronDown,
  IoChevronUp,
  IoCheckmarkCircleOutline,
  IoRefreshOutline,
  IoReloadOutline,
} from 'react-icons/io5';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useDrawer, useMediaQuery } from '../hooks/useDrawer';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchApi } from '../api/apiClient';
import ProductCard from '../components/ProductCard';
import {
  mapProduct,
  removeVietnameseTones,
  extractRoms,
  extractRams,
} from '../utils/utils';

// Các khoảng giá nhanh cho máy tính bảng
const PRICE_QUICK_CHIPS = [
  { id: 'under5', label: 'Dưới 5 triệu', min: 0, max: 5000000 },
  { id: '5to10', label: '5–10 triệu', min: 5000000, max: 10000000 },
  { id: '10to15', label: '10–15 triệu', min: 10000000, max: 15000000 },
  { id: 'over15', label: 'Trên 15 triệu', min: 15000000, max: Infinity },
];

const PAGE_SIZE = 18; // 6 hàng mỗi hàng 3 sản phẩm

// Helper phân loại hãng cho máy tính bảng
function getTabletBrand(name = '') {
  const n = name.toLowerCase();
  if (n.includes('ipad') || n.includes('apple')) return 'Apple (iPad)';
  if (n.includes('samsung') || n.includes('galaxy tab')) return 'Samsung Galaxy Tab';
  if (n.includes('xiaomi') || n.includes('poco') || n.includes('redmi')) return 'Xiaomi / Redmi Pad';
  if (n.includes('oppo')) return 'OPPO Pad';
  if (n.includes('vivo') || n.includes('iqoo')) return 'Vivo / iQOO Pad';
  if (n.includes('oneplus')) return 'OnePlus Pad';
  if (n.includes('realme')) return 'Realme Pad';
  if (n.includes('lenovo')) return 'Lenovo';
  return 'Khác';
}

export default function TabletPage() {
  const [searchParams] = useSearchParams();

  // ── States ──
  const [rawProducts, setRawProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const mobileFilters = useMediaQuery('(max-width: 992px)');
  const filterRef = useDrawer(mobileFilterOpen && mobileFilters, () => setMobileFilterOpen(false));
  useEffect(() => { setMobileFilterOpen(false); }, [mobileFilters]);

  // Accordion mở/đóng
  const [openAccordions, setOpenAccordions] = useState({
    brand: true,
    price: true,
    rom: true,
    ram: true,
    promo: true,
  });

  // ── Tiêu chí lọc ──
  const [searchKeyword, setSearchKeyword] = useState(searchParams.get('q') || '');
  const [selectedBrands, setSelectedBrands] = useState(new Set());
  const [priceQuick, setPriceQuick] = useState(null);
  const [inputMin, setInputMin] = useState('');
  const [inputMax, setInputMax] = useState('');
  const [appliedPriceRange, setAppliedPriceRange] = useState({ min: null, max: null, label: null });
  const [selectedRoms, setSelectedRoms] = useState(new Set());
  const [selectedRams, setSelectedRams] = useState(new Set());
  const [selectedPromos, setSelectedPromos] = useState(new Set());
  const [sort, setSort] = useState('default');

  useEffect(() => {
    if (searchParams.get('q')) {
      setSearchKeyword(searchParams.get('q'));
    }
  }, [searchParams]);

  // ── Tải danh sách máy tính bảng ──
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');

    async function loadTablets() {
      try {
        const res = await fetchApi('/products?size=200&brand=' + encodeURIComponent('Máy tính bảng'));
        if (isMounted && res && res.data) {
          const mapped = res.data.map(mapProduct).filter(Boolean);
          setRawProducts(mapped);
        }
      } catch (err) {
        console.error('Error fetching tablets:', err);
        if (isMounted) setError('Không thể tải danh sách máy tính bảng. Vui lòng thử lại sau.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadTablets();
    return () => { isMounted = false; };
  }, []);

  // ── Tiền xử lý thông số ──
  const parsedProducts = useMemo(() => {
    return rawProducts.map(p => {
      const roms = extractRoms(p);
      const rams = extractRams(p);
      const price = p.price || 0;
      const tabletBrand = getTabletBrand(p.name);
      const isOnSale = (p.oldPrice && p.oldPrice > price) || p.badge === 'sale';
      const isInStock = p.stockQuantity == null || p.stockQuantity > 0;
      const cleanName = removeVietnameseTones(p.name || '');

      return {
        ...p,
        _tabletBrand: tabletBrand,
        _roms: roms,
        _rams: rams,
        _price: price,
        _isOnSale: isOnSale,
        _isInStock: isInStock,
        _cleanName: cleanName,
      };
    });
  }, [rawProducts]);

  // Danh sách hãng có thực tế
  const availableBrands = useMemo(() => {
    const brands = new Set();
    parsedProducts.forEach(p => brands.add(p._tabletBrand));
    return Array.from(brands).sort();
  }, [parsedProducts]);

  // ROM có thực tế
  const availableRoms = useMemo(() => {
    const romOrder = ['32GB', '64GB', '128GB', '256GB', '512GB', '1TB'];
    const found = new Set();
    parsedProducts.forEach(p => p._roms.forEach(r => found.add(r)));
    return romOrder.filter(r => found.has(r));
  }, [parsedProducts]);

  // RAM có thực tế
  const availableRams = useMemo(() => {
    const ramOrder = ['3GB', '4GB', '6GB', '8GB', '12GB', '16GB'];
    const found = new Set();
    parsedProducts.forEach(p => p._rams.forEach(r => found.add(r)));
    return ramOrder.filter(r => found.has(r));
  }, [parsedProducts]);

  // ── Helper so khớp ──
  const matchesKeyword = useCallback((p, kw) => {
    if (!kw || !kw.trim()) return true;
    const cleanKw = removeVietnameseTones(kw);
    return p._cleanName.includes(cleanKw);
  }, []);

  const matchesBrand = useCallback((p, brandSet) => {
    if (brandSet.size === 0) return true;
    return brandSet.has(p._tabletBrand);
  }, []);

  const matchesPrice = useCallback((p, range) => {
    if (range.min != null && p._price < range.min) return false;
    if (range.max != null && p._price > range.max) return false;
    return true;
  }, []);

  const matchesRom = useCallback((p, romSet) => {
    if (romSet.size === 0) return true;
    return p._roms.some(r => romSet.has(r));
  }, []);

  const matchesRam = useCallback((p, ramSet) => {
    if (ramSet.size === 0) return true;
    return p._rams.some(r => ramSet.has(r));
  }, []);

  const matchesPromo = useCallback((p, promoSet) => {
    if (promoSet.size === 0) return true;
    if (promoSet.has('sale') && !p._isOnSale) return false;
    if (promoSet.has('inStock') && !p._isInStock) return false;
    return true;
  }, []);

  // ── Faceted Counts ──
  const facetCounts = useMemo(() => {
    const counts = {
      brand: {},
      priceQuick: {},
      rom: {},
      ram: {},
      promo: { sale: 0, inStock: 0 },
    };

    // Brand counts
    availableBrands.forEach(b => {
      let c = 0;
      parsedProducts.forEach(p => {
        if (
          matchesKeyword(p, searchKeyword) &&
          matchesPrice(p, appliedPriceRange) &&
          matchesRom(p, selectedRoms) &&
          matchesRam(p, selectedRams) &&
          matchesPromo(p, selectedPromos) &&
          p._tabletBrand === b
        ) {
          c++;
        }
      });
      counts.brand[b] = c;
    });

    // Quick price counts
    PRICE_QUICK_CHIPS.forEach(chip => {
      let c = 0;
      parsedProducts.forEach(p => {
        if (
          matchesKeyword(p, searchKeyword) &&
          matchesBrand(p, selectedBrands) &&
          matchesRom(p, selectedRoms) &&
          matchesRam(p, selectedRams) &&
          matchesPromo(p, selectedPromos) &&
          p._price >= chip.min && (chip.max === Infinity || p._price <= chip.max)
        ) {
          c++;
        }
      });
      counts.priceQuick[chip.id] = c;
    });

    // ROM counts
    availableRoms.forEach(rom => {
      let c = 0;
      parsedProducts.forEach(p => {
        if (
          matchesKeyword(p, searchKeyword) &&
          matchesBrand(p, selectedBrands) &&
          matchesPrice(p, appliedPriceRange) &&
          matchesRam(p, selectedRams) &&
          matchesPromo(p, selectedPromos) &&
          p._roms.includes(rom)
        ) {
          c++;
        }
      });
      counts.rom[rom] = c;
    });

    // RAM counts
    availableRams.forEach(ram => {
      let c = 0;
      parsedProducts.forEach(p => {
        if (
          matchesKeyword(p, searchKeyword) &&
          matchesBrand(p, selectedBrands) &&
          matchesPrice(p, appliedPriceRange) &&
          matchesRom(p, selectedRoms) &&
          matchesPromo(p, selectedPromos) &&
          p._rams.includes(ram)
        ) {
          c++;
        }
      });
      counts.ram[ram] = c;
    });

    // Promo counts
    ['sale', 'inStock'].forEach(promoId => {
      let c = 0;
      parsedProducts.forEach(p => {
        if (
          matchesKeyword(p, searchKeyword) &&
          matchesBrand(p, selectedBrands) &&
          matchesPrice(p, appliedPriceRange) &&
          matchesRom(p, selectedRoms) &&
          matchesRam(p, selectedRams)
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
    selectedBrands,
    appliedPriceRange,
    selectedRoms,
    selectedRams,
    selectedPromos,
    availableBrands,
    availableRoms,
    availableRams,
    matchesKeyword,
    matchesBrand,
    matchesPrice,
    matchesRom,
    matchesRam,
    matchesPromo,
  ]);

  // ── Lọc danh sách ──
  const filteredProducts = useMemo(() => {
    return parsedProducts.filter(p =>
      matchesKeyword(p, searchKeyword) &&
      matchesBrand(p, selectedBrands) &&
      matchesPrice(p, appliedPriceRange) &&
      matchesRom(p, selectedRoms) &&
      matchesRam(p, selectedRams) &&
      matchesPromo(p, selectedPromos)
    );
  }, [
    parsedProducts,
    searchKeyword,
    selectedBrands,
    appliedPriceRange,
    selectedRoms,
    selectedRams,
    selectedPromos,
    matchesKeyword,
    matchesBrand,
    matchesPrice,
    matchesRom,
    matchesRam,
    matchesPromo,
  ]);

  // ── Sắp xếp ──
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

  // ── Thao tác ──
  const toggleAccordion = (key) => {
    setOpenAccordions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleBrand = (b) => {
    setSelectedBrands(prev => {
      const next = new Set(prev);
      if (next.has(b)) next.delete(b);
      else next.add(b);
      return next;
    });
  };

  const handleQuickPriceClick = (chip) => {
    if (priceQuick === chip.id) {
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
    if (minVal != null && maxVal != null) label = `${inputMin}tr – ${inputMax}tr`;
    else if (minVal != null) label = `Từ ${inputMin} triệu`;
    else if (maxVal != null) label = `Đến ${inputMax} triệu`;

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
    setSelectedBrands(new Set());
    setPriceQuick(null);
    setInputMin('');
    setInputMax('');
    setAppliedPriceRange({ min: null, max: null, label: null });
    setSelectedRoms(new Set());
    setSelectedRams(new Set());
    setSelectedPromos(new Set());
    setSort('default');
  };

  const hasActiveFilters = Boolean(
    searchKeyword.trim() ||
    selectedBrands.size > 0 ||
    appliedPriceRange.label ||
    selectedRoms.size > 0 ||
    selectedRams.size > 0 ||
    selectedPromos.size > 0
  );

  return (
    <>
      {/* ── Banner máy tính bảng (Thiết kế đẹp mắt, KHÔNG hiển thị số lượng) ── */}
      <section className="brand-page-hero">
        <div className="container">
          <div className="brand-hero-inner">
            <div className="brand-hero-icon-wrap">
              <IoTabletPortraitOutline />
            </div>

            <div className="brand-hero-text">
              <span className="brand-hero-badge">
                <IoSparkles style={{ color: '#38bdf8', marginRight: 5, verticalAlign: 'middle' }} />
                Máy tính bảng chính hãng
              </span>
              <h1>Máy Tính Bảng (Tablet)</h1>
              <p>
                Khám phá các mẫu máy tính bảng chính hãng hiệu năng vượt trội, màn hình sắc nét và bảo hành toàn quốc tại PhoneZone.
              </p>
            </div>

            <div className="brand-hero-watermark">
              <IoTabletPortraitOutline />
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
            <span>Máy tính bảng</span>
          </nav>

          {/* ── BỐ CỤC 2 CỘT: SIDEBAR LỌC + LƯỚI SẢN PHẨM ── */}
          <div className="brand-catalog-layout">

            {mobileFilterOpen && (
              <div
                className="mobile-filter-backdrop"
                onClick={() => setMobileFilterOpen(false)}
              ></div>
            )}

            {/* ── SIDEBAR LỌC ── */}
            <aside ref={filterRef} id="catalogFilters" className={`brand-filter-sidebar${mobileFilterOpen ? ' open' : ''}`} role={mobileFilters ? 'dialog' : undefined} aria-modal={mobileFilters && mobileFilterOpen ? true : undefined} aria-label="Bộ lọc máy tính bảng" aria-hidden={mobileFilters && !mobileFilterOpen ? true : undefined} inert={mobileFilters && !mobileFilterOpen ? '' : undefined} tabIndex={-1}>
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
                <button
                  type="button"
                  className="mobile-filter-close-btn"
                  onClick={() => setMobileFilterOpen(false)}
                  aria-label="Đóng bộ lọc"
                >
                  <IoCloseOutline style={{ fontSize: '1.3rem' }} />
                </button>
              </div>

              {/* Nhóm 1: Thương hiệu */}
              {availableBrands.length > 0 && (
                <div className="filter-accordion">
                  <button
                    type="button"
                    className="filter-accordion-header"
                    onClick={() => toggleAccordion('brand')}
                    aria-expanded={openAccordions.brand}
                  >
                    <span className="filter-accordion-title">
                      <i className="fas fa-copyright"></i> Thương hiệu
                    </span>
                    <i className={`fas fa-chevron-${openAccordions.brand ? 'up' : 'down'} accordion-arrow`}></i>
                  </button>

                  {openAccordions.brand && (
                    <div className="filter-accordion-body">
                      <div className="filter-checkbox-list">
                        {availableBrands.map(b => {
                          const count = facetCounts.brand[b] || 0;
                          const isSelected = selectedBrands.has(b);
                          const isDisabled = count === 0 && !isSelected;
                          return (
                            <label key={b} className={`filter-checkbox-item${isDisabled ? ' disabled' : ''}`}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                disabled={isDisabled}
                                onChange={() => toggleBrand(b)}
                              />
                              <span className="custom-check-box"></span>
                              <span className="filter-item-label">{b}</span>
                              <span className="filter-item-count">({count})</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Nhóm 2: Khoảng giá */}
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

                    <form className="filter-price-form" onSubmit={handleApplyCustomPrice}>
                      <div className="filter-price-inputs">
                        <div className="price-input-wrap">
                          <label htmlFor="tabPriceFrom">Từ</label>
                          <input
                            id="tabPriceFrom"
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
                          <label htmlFor="tabPriceTo">Đến</label>
                          <input
                            id="tabPriceTo"
                            type="number"
                            placeholder="30"
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

              {/* Nhóm 3: ROM */}
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
                            <label key={rom} className={`filter-checkbox-item${isDisabled ? ' disabled' : ''}`}>
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

              {/* Nhóm 4: RAM */}
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
                            <label key={ram} className={`filter-checkbox-item${isDisabled ? ' disabled' : ''}`}>
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
                      <label className={`filter-checkbox-item${facetCounts.promo.sale === 0 && !selectedPromos.has('sale') ? ' disabled' : ''}`}>
                        <input
                          type="checkbox"
                          checked={selectedPromos.has('sale')}
                          disabled={facetCounts.promo.sale === 0 && !selectedPromos.has('sale')}
                          onChange={() => togglePromo('sale')}
                        />
                        <span className="custom-check-box"></span>
                        <span className="filter-item-label">
                          <i className="fas fa-fire-flame-curved" style={{ color: '#ef4444', marginRight: 6 }}></i>
                          Đang giảm giá
                        </span>
                        <span className="filter-item-count">({facetCounts.promo.sale})</span>
                      </label>

                      <label className={`filter-checkbox-item${facetCounts.promo.inStock === 0 && !selectedPromos.has('inStock') ? ' disabled' : ''}`}>
                        <input
                          type="checkbox"
                          checked={selectedPromos.has('inStock')}
                          disabled={facetCounts.promo.inStock === 0 && !selectedPromos.has('inStock')}
                          onChange={() => togglePromo('inStock')}
                        />
                        <span className="custom-check-box"></span>
                        <span className="filter-item-label">
                          <i className="fas fa-circle-check" style={{ color: '#10b981', marginRight: 6 }}></i>
                          Còn hàng
                        </span>
                        <span className="filter-item-count">({facetCounts.promo.inStock})</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
              <button type="button" className="mobile-filter-apply" onClick={() => setMobileFilterOpen(false)}>Xem {filteredProducts.length} sản phẩm</button>
            </aside>

            {/* ── CỘT PHẢI: LƯỚI SẢN PHẨM ── */}
            <main className="brand-products-area">
              <div className="catalog-top-bar">
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

                <div className="catalog-search-wrap">
                  <IoSearchOutline className="search-icon" style={{ fontSize: '1.1rem' }} />
                  <input
                    type="text"
                    placeholder="Tìm máy tính bảng..."
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
                      <IoCloseOutline style={{ fontSize: '1.05rem', verticalAlign: '-2px' }} />
                    </button>
                  )}
                </div>

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

                <div className="catalog-counter">
                  Hiển thị <strong>{filteredProducts.length}</strong> / <strong>{rawProducts.length}</strong> sản phẩm
                </div>
              </div>

              {/* Hàng chip bộ lọc đang bật */}
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

                  {Array.from(selectedBrands).map(b => (
                    <span key={b} className="active-filter-chip">
                      Hãng: {b}
                      <button type="button" onClick={() => toggleBrand(b)}>
                        <IoCloseOutline style={{ fontSize: '1.05rem', verticalAlign: '-2px' }} />
                      </button>
                    </span>
                  ))}

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

              {error && (
                <div className="catalog-error" role="alert">
                  {error}
                </div>
              )}

              {loading ? (
                <div className="catalog-loading-state">
                  <i className="fas fa-spinner fa-spin"></i>
                  <p>Đang tải danh sách máy tính bảng...</p>
                </div>
              ) : visibleProducts.length > 0 ? (
                <>
                  <div className="products-grid">
                    {visibleProducts.map(p => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>

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
                <div className="filter-empty-state">
                  <div className="empty-icon-wrap">
                    <IoTabletPortraitOutline />
                  </div>
                  <h3>Không tìm thấy máy tính bảng phù hợp</h3>
                  <p>
                    {hasActiveFilters
                      ? 'Không có sản phẩm nào khớp với tiêu chí lọc đã chọn. Hãy thử điều chỉnh hoặc xóa bớt bộ lọc.'
                      : 'Chưa có sản phẩm máy tính bảng nào trong danh mục.'}
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
