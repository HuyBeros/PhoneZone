import { useState, useEffect, useMemo, useCallback } from 'react';
import { useDrawer, useMediaQuery } from '../hooks/useDrawer';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchApi } from '../api/apiClient';
import {
  IoConstructOutline,
  IoSparkles,
  IoHomeOutline,
  IoChevronForward,
  IoFilterOutline,
  IoCloseOutline,
  IoPhonePortraitOutline,
  IoPricetagOutline,
  IoOptionsOutline,
  IoSearchOutline,
  IoChevronDown,
  IoChevronUp,
  IoCheckmarkCircleOutline,
  IoRefreshOutline,
  IoShieldCheckmarkOutline,
  IoTimeOutline,
  IoCashOutline,
  IoRibbonOutline,
} from 'react-icons/io5';
import RepairServiceCard from '../components/RepairServiceCard';
import { removeVietnameseTones } from '../utils/utils';

const PAGE_SIZE = 18; // 6 hàng mỗi hàng 3 dịch vụ

const REPAIR_PRICE_CHIPS = [
  { id: 'under200', label: 'Dưới 200K', min: 0, max: 200000 },
  { id: '200to500', label: '200K – 500K', min: 200000, max: 500000 },
  { id: '500to1m', label: '500K – 1 triệu', min: 500000, max: 1000000 },
  { id: 'over1m', label: 'Trên 1 triệu', min: 1000000, max: Infinity },
];

function getRepairDevice(name = '') {
  const n = name.toLowerCase();
  if (n.includes('iphone') || n.includes('apple') || n.includes('ipad')) return 'iPhone / Apple';
  if (n.includes('samsung')) return 'Samsung';
  if (n.includes('xiaomi') || n.includes('redmi')) return 'Xiaomi / Redmi';
  if (n.includes('asus')) return 'Asus';
  return 'Khác';
}

function getRepairType(name = '') {
  const n = name.toLowerCase();
  if (n.includes('camera')) return 'Camera';
  if (n.includes('màn hình')) return 'Màn hình';
  if (n.includes('mặt kính') || n.includes('kính lưng') || n.includes('nắp lưng')) return 'Mặt kính / Nắp lưng';
  if (n.includes('true tone')) return 'Sửa True Tone';
  if (n.includes('pin')) return 'Thay pin';
  return 'Phần cứng khác';
}

export default function RepairPage() {
  const [searchParams] = useSearchParams();

  // ── States ──
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const mobileFilters = useMediaQuery('(max-width: 992px)');
  const filterRef = useDrawer(mobileFilterOpen && mobileFilters, () => setMobileFilterOpen(false));
  useEffect(() => { setMobileFilterOpen(false); }, [mobileFilters]);

  // Accordion mở/đóng
  const [openAccordions, setOpenAccordions] = useState({
    device: true,
    type: true,
    price: true,
  });

  // ── Tiêu chí lọc ──
  const [searchKeyword, setSearchKeyword] = useState(searchParams.get('q') || '');
  const [selectedDevices, setSelectedDevices] = useState(new Set());
  const [selectedTypes, setSelectedTypes] = useState(new Set());
  const [priceQuick, setPriceQuick] = useState(null);
  const [inputMin, setInputMin] = useState('');
  const [inputMax, setInputMax] = useState('');
  const [appliedPriceRange, setAppliedPriceRange] = useState({ min: null, max: null, label: null });
  const [sort, setSort] = useState('default');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (searchParams.get('q')) {
      setSearchKeyword(searchParams.get('q'));
    }
  }, [searchParams]);

  // ── Tải danh sách dịch vụ sửa chữa ──
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');

    async function loadRepairServices() {
      try {
        const res = await fetchApi('/repairs/services');
        if (isMounted) {
          setServices(res || []);
        }
      } catch (err) {
        console.error('Error loading repair services:', err);
        if (isMounted) setError('Không thể tải danh sách dịch vụ sửa chữa. Vui lòng thử lại sau.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadRepairServices();
    return () => { isMounted = false; };
  }, []);

  // ── Tiền xử lý dữ liệu dịch vụ ──
  const parsedServices = useMemo(() => {
    return services.map(s => {
      const price = Number(s.giaSo) || 0;
      const device = getRepairDevice(s.tenDichVu);
      const serviceType = getRepairType(s.tenDichVu);
      const cleanName = removeVietnameseTones(s.tenDichVu || '');

      return {
        ...s,
        _price: price,
        _device: device,
        _type: serviceType,
        _cleanName: cleanName,
      };
    });
  }, [services]);

  // Danh sách dòng máy thực tế
  const availableDevices = useMemo(() => {
    const devs = new Set();
    parsedServices.forEach(s => devs.add(s._device));
    return Array.from(devs).sort();
  }, [parsedServices]);

  // Danh sách loại dịch vụ thực tế
  const availableTypes = useMemo(() => {
    const types = new Set();
    parsedServices.forEach(s => types.add(s._type));
    return Array.from(types).sort();
  }, [parsedServices]);

  // ── Helper so khớp ──
  const matchesKeyword = useCallback((s, kw) => {
    if (!kw || !kw.trim()) return true;
    const cleanKw = removeVietnameseTones(kw);
    return s._cleanName.includes(cleanKw);
  }, []);

  const matchesDevice = useCallback((s, deviceSet) => {
    if (deviceSet.size === 0) return true;
    return deviceSet.has(s._device);
  }, []);

  const matchesType = useCallback((s, typeSet) => {
    if (typeSet.size === 0) return true;
    return typeSet.has(s._type);
  }, []);

  const matchesPrice = useCallback((s, range) => {
    if (range.min != null && s._price < range.min) return false;
    if (range.max != null && s._price > range.max) return false;
    return true;
  }, []);

  // ── Faceted counts ──
  const facetCounts = useMemo(() => {
    const counts = {
      device: {},
      type: {},
      priceQuick: {},
    };

    // Device counts
    availableDevices.forEach(d => {
      let c = 0;
      parsedServices.forEach(s => {
        if (
          matchesKeyword(s, searchKeyword) &&
          matchesType(s, selectedTypes) &&
          matchesPrice(s, appliedPriceRange) &&
          s._device === d
        ) {
          c++;
        }
      });
      counts.device[d] = c;
    });

    // Type counts
    availableTypes.forEach(t => {
      let c = 0;
      parsedServices.forEach(s => {
        if (
          matchesKeyword(s, searchKeyword) &&
          matchesDevice(s, selectedDevices) &&
          matchesPrice(s, appliedPriceRange) &&
          s._type === t
        ) {
          c++;
        }
      });
      counts.type[t] = c;
    });

    // Quick price counts
    REPAIR_PRICE_CHIPS.forEach(chip => {
      let c = 0;
      parsedServices.forEach(s => {
        if (
          matchesKeyword(s, searchKeyword) &&
          matchesDevice(s, selectedDevices) &&
          matchesType(s, selectedTypes) &&
          s._price >= chip.min && (chip.max === Infinity || s._price <= chip.max)
        ) {
          c++;
        }
      });
      counts.priceQuick[chip.id] = c;
    });

    return counts;
  }, [
    parsedServices,
    searchKeyword,
    selectedDevices,
    selectedTypes,
    appliedPriceRange,
    availableDevices,
    availableTypes,
    matchesKeyword,
    matchesDevice,
    matchesType,
    matchesPrice,
  ]);

  // ── Lọc danh sách dịch vụ ──
  const filteredServices = useMemo(() => {
    return parsedServices.filter(s =>
      matchesKeyword(s, searchKeyword) &&
      matchesDevice(s, selectedDevices) &&
      matchesType(s, selectedTypes) &&
      matchesPrice(s, appliedPriceRange)
    );
  }, [
    parsedServices,
    searchKeyword,
    selectedDevices,
    selectedTypes,
    appliedPriceRange,
    matchesKeyword,
    matchesDevice,
    matchesType,
    matchesPrice,
  ]);

  // ── Sắp xếp ──
  const sortedServices = useMemo(() => {
    const list = [...filteredServices];
    switch (sort) {
      case 'price-asc':
        return list.sort((a, b) => a._price - b._price);
      case 'price-desc':
        return list.sort((a, b) => b._price - a._price);
      case 'name-asc':
        return list.sort((a, b) => (a.tenDichVu || '').localeCompare(b.tenDichVu || ''));
      default:
        return list;
    }
  }, [filteredServices, sort]);

  const visibleServices = useMemo(() => {
    return sortedServices.slice(0, visibleCount);
  }, [sortedServices, visibleCount]);

  const hasMore = visibleCount < sortedServices.length;

  // ── Thao tác ──
  const toggleAccordion = (key) => {
    setOpenAccordions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleDevice = (dev) => {
    setSelectedDevices(prev => {
      const next = new Set(prev);
      if (next.has(dev)) next.delete(dev);
      else next.add(dev);
      return next;
    });
  };

  const toggleType = (t) => {
    setSelectedTypes(prev => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
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
      setInputMin(chip.min === 0 ? '' : String(chip.min / 1000));
      setInputMax(chip.max === Infinity ? '' : String(chip.max / 1000));
    }
  };

  const handleApplyCustomPrice = (e) => {
    e?.preventDefault();
    const minVal = inputMin.trim() ? Number(inputMin) * 1000 : null;
    const maxVal = inputMax.trim() ? Number(inputMax) * 1000 : null;

    if (minVal != null && maxVal != null && minVal > maxVal) {
      alert('Giá "Từ" không được lớn hơn giá "Đến"');
      return;
    }

    let label = '';
    if (minVal != null && maxVal != null) label = `${inputMin}K – ${inputMax}K`;
    else if (minVal != null) label = `Từ ${inputMin}K`;
    else if (maxVal != null) label = `Đến ${inputMax}K`;

    setPriceQuick(null);
    setAppliedPriceRange({ min: minVal, max: maxVal, label: label || null });
  };

  const clearAllFilters = () => {
    setSearchKeyword('');
    setSelectedDevices(new Set());
    setSelectedTypes(new Set());
    setPriceQuick(null);
    setInputMin('');
    setInputMax('');
    setAppliedPriceRange({ min: null, max: null, label: null });
    setSort('default');
  };

  const hasActiveFilters = Boolean(
    searchKeyword.trim() ||
    selectedDevices.size > 0 ||
    selectedTypes.size > 0 ||
    appliedPriceRange.label
  );

  return (
    <>
      {/* ── Banner sửa chữa (Thiết kế đẹp mắt, KHÔNG hiển thị số lượng) ── */}
      <section className="brand-page-hero">
        <div className="container">
          <div className="brand-hero-inner">
            <div className="brand-hero-icon-wrap">
              <IoConstructOutline />
            </div>

            <div className="brand-hero-text">
              <span className="brand-hero-badge">
                <IoSparkles style={{ color: '#38bdf8', marginRight: 5, verticalAlign: 'middle' }} />
                Dịch vụ sửa chữa uy tín
              </span>
              <h1>Dịch Vụ Sửa Chữa Điện Thoại</h1>
              <p>
                Khám phá các dịch vụ sửa chữa chuyên nghiệp, linh kiện chính hãng, lấy ngay và bảo hành dài hạn tại PhoneZone.
              </p>
            </div>

            <div className="brand-hero-watermark">
              <IoConstructOutline />
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
            <span>Dịch vụ sửa chữa</span>
          </nav>

          {/* ── BỐ CỤC 2 CỘT: SIDEBAR LỌC + LƯỚI DỊCH VỤ ── */}
          <div className="brand-catalog-layout">

            {mobileFilterOpen && (
              <div
                className="mobile-filter-backdrop"
                onClick={() => setMobileFilterOpen(false)}
              ></div>
            )}

            {/* ── SIDEBAR LỌC ── */}
            <aside ref={filterRef} id="catalogFilters" className={`brand-filter-sidebar${mobileFilterOpen ? ' open' : ''}`} role={mobileFilters ? 'dialog' : undefined} aria-modal={mobileFilters && mobileFilterOpen ? true : undefined} aria-label="Bộ lọc dịch vụ sửa chữa" aria-hidden={mobileFilters && !mobileFilterOpen ? true : undefined} inert={mobileFilters && !mobileFilterOpen ? '' : undefined} tabIndex={-1}>
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

              {/* Nhóm 1: Dòng máy / Thiết bị */}
              {availableDevices.length > 0 && (
                <div className="filter-accordion">
                  <button
                    type="button"
                    className="filter-accordion-header"
                    onClick={() => toggleAccordion('device')}
                    aria-expanded={openAccordions.device}
                  >
                    <span className="filter-accordion-title">
                      <i className="fas fa-mobile-screen"></i> Dòng máy / Thiết bị
                    </span>
                    <i className={`fas fa-chevron-${openAccordions.device ? 'up' : 'down'} accordion-arrow`}></i>
                  </button>

                  {openAccordions.device && (
                    <div className="filter-accordion-body">
                      <div className="filter-checkbox-list">
                        {availableDevices.map(dev => {
                          const count = facetCounts.device[dev] || 0;
                          const isSelected = selectedDevices.has(dev);
                          const isDisabled = count === 0 && !isSelected;
                          return (
                            <label key={dev} className={`filter-checkbox-item${isDisabled ? ' disabled' : ''}`}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                disabled={isDisabled}
                                onChange={() => toggleDevice(dev)}
                              />
                              <span className="custom-check-box"></span>
                              <span className="filter-item-label">{dev}</span>
                              <span className="filter-item-count">({count})</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Nhóm 2: Loại dịch vụ */}
              {availableTypes.length > 0 && (
                <div className="filter-accordion">
                  <button
                    type="button"
                    className="filter-accordion-header"
                    onClick={() => toggleAccordion('type')}
                    aria-expanded={openAccordions.type}
                  >
                    <span className="filter-accordion-title">
                      <i className="fas fa-wrench"></i> Loại dịch vụ
                    </span>
                    <i className={`fas fa-chevron-${openAccordions.type ? 'up' : 'down'} accordion-arrow`}></i>
                  </button>

                  {openAccordions.type && (
                    <div className="filter-accordion-body">
                      <div className="filter-checkbox-list">
                        {availableTypes.map(t => {
                          const count = facetCounts.type[t] || 0;
                          const isSelected = selectedTypes.has(t);
                          const isDisabled = count === 0 && !isSelected;
                          return (
                            <label key={t} className={`filter-checkbox-item${isDisabled ? ' disabled' : ''}`}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                disabled={isDisabled}
                                onChange={() => toggleType(t)}
                              />
                              <span className="custom-check-box"></span>
                              <span className="filter-item-label">{t}</span>
                              <span className="filter-item-count">({count})</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Nhóm 3: Khoảng giá */}
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
                      {REPAIR_PRICE_CHIPS.map(chip => {
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
                          <label htmlFor="repPriceFrom">Từ</label>
                          <input
                            id="repPriceFrom"
                            type="number"
                            placeholder="0"
                            min="0"
                            step="50"
                            value={inputMin}
                            onChange={e => setInputMin(e.target.value)}
                          />
                          <span className="unit">K</span>
                        </div>
                        <span className="dash">–</span>
                        <div className="price-input-wrap">
                          <label htmlFor="repPriceTo">Đến</label>
                          <input
                            id="repPriceTo"
                            type="number"
                            placeholder="1000"
                            min="0"
                            step="50"
                            value={inputMax}
                            onChange={e => setInputMax(e.target.value)}
                          />
                          <span className="unit">K</span>
                        </div>
                      </div>
                      <button type="submit" className="btn-apply-price">
                        Áp dụng
                      </button>
                    </form>
                  </div>
                )}
              </div>
              <button type="button" className="mobile-filter-apply" onClick={() => setMobileFilterOpen(false)}>Xem {filteredServices.length} dịch vụ</button>
            </aside>

            {/* ── CỘT PHẢI: LƯỚI DỊCH VỤ SỬA CHỮA ── */}
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
                    placeholder="Tìm dịch vụ sửa chữa..."
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
                    <option value="name-asc">Tên A–Z</option>
                    <option value="price-asc">Giá thấp đến cao</option>
                    <option value="price-desc">Giá cao đến thấp</option>
                  </select>
                </div>

                <div className="catalog-counter">
                  Hiển thị <strong>{filteredServices.length}</strong> / <strong>{services.length}</strong> dịch vụ
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

                  {Array.from(selectedDevices).map(dev => (
                    <span key={dev} className="active-filter-chip">
                      Thiết bị: {dev}
                      <button type="button" onClick={() => toggleDevice(dev)}>
                        <IoCloseOutline style={{ fontSize: '1.05rem', verticalAlign: '-2px' }} />
                      </button>
                    </span>
                  ))}

                  {Array.from(selectedTypes).map(t => (
                    <span key={t} className="active-filter-chip">
                      Loại: {t}
                      <button type="button" onClick={() => toggleType(t)}>
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
                  <p>Đang tải danh sách dịch vụ sửa chữa...</p>
                </div>
              ) : visibleServices.length > 0 ? (
                <>
                  <div className="products-grid">
                    {visibleServices.map(service => (
                      <RepairServiceCard key={service.id} service={service} />
                    ))}
                  </div>

                  {hasMore && (
                    <div className="catalog-load-more-wrap">
                      <button
                        type="button"
                        className="btn-catalog-load-more"
                        onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
                      >
                        <span>Xem thêm dịch vụ</span>
                        <IoChevronDown style={{ fontSize: '0.95rem' }} />
                      </button>
                    </div>
                  )}

                  {!hasMore && sortedServices.length > PAGE_SIZE && (
                    <div className="catalog-all-loaded">
                      <IoCheckmarkCircleOutline style={{ fontSize: '1.15rem', color: '#16a34a', verticalAlign: '-2px' }} />
                      <span>Đã hiển thị tất cả {sortedServices.length} dịch vụ</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="filter-empty-state">
                  <div className="empty-icon-wrap">
                    <IoConstructOutline />
                  </div>
                  <h3>Không tìm thấy dịch vụ phù hợp</h3>
                  <p>
                    {hasActiveFilters
                      ? 'Không có dịch vụ sửa chữa nào khớp với tiêu chí lọc đã chọn. Hãy thử điều chỉnh hoặc xóa bớt bộ lọc.'
                      : 'Chưa có dịch vụ sửa chữa nào trong danh mục.'}
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

          {/* ── Cam Kết Của PhoneZone ── */}
          <div className="repair-commitments" style={{ marginTop: '50px' }}>
            <h2>Cam Kết Dịch Vụ Của PhoneZone</h2>
            <div className="commitments-grid">
              <div className="commitment-item">
                <IoRibbonOutline style={{ fontSize: '1.6rem', color: 'var(--primary)' }} />
                <h3>Linh kiện chính hãng</h3>
                <p>100% linh kiện zin, chất lượng cao đã qua kiểm định</p>
              </div>
              <div className="commitment-item">
                <IoShieldCheckmarkOutline style={{ fontSize: '1.6rem', color: 'var(--primary)' }} />
                <h3>Bảo hành dài hạn</h3>
                <p>Bảo hành từ 6 đến 12 tháng rõ ràng, uy tín</p>
              </div>
              <div className="commitment-item">
                <IoTimeOutline style={{ fontSize: '1.6rem', color: 'var(--primary)' }} />
                <h3>Sửa chữa nhanh chóng</h3>
                <p>Lấy ngay trong ngày, khách hàng theo dõi trực tiếp</p>
              </div>
              <div className="commitment-item">
                <i className="fas fa-hand-holding-dollar"></i>
                <h3>Giá cả minh bạch</h3>
                <p>Báo giá trọn gói, tuyệt đối không phát sinh chi phí</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
