import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BRANDS } from '../data/data';
import { mapProduct } from '../utils/utils';
import ProductCard from '../components/ProductCard';
import { fetchApi } from '../api/apiClient';

const PAGE_SIZE = 15;

export default function BrandPage() {
  const { brandId } = useParams();
  const [sort, setSort] = useState('default');
  const [priceFilter, setPriceFilter] = useState('all');
  const [current, setCurrent] = useState(brandId || 'all');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sync khi URL thay đổi
  useEffect(() => {
    setCurrent(brandId || 'all');
    setVisibleCount(PAGE_SIZE); // reset về 15 khi đổi hãng
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [brandId]);

  // Fetch products when current brand changes
  useEffect(() => {
    setLoading(true);
    const url = current === 'all' ? '/products?size=100' : `/products?brand=${current}&size=100`;
    fetchApi(url)
      .then(res => {
        if (res && res.data) {
           setProducts(res.data.map(mapProduct));
        } else if (Array.isArray(res)) {
           setProducts(res.map(mapProduct));
        } else {
           setProducts([]);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [current]);

  // Reset visible count khi filter/sort thay đổi
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [priceFilter, sort]);

  const brandObj = BRANDS.find(b => b.id === current) || null;

  const list = useMemo(() => {
    let list = [...products];
    
    // Apply price filter
    if (priceFilter === 'under10') list = list.filter(p => p.price < 10000000);
    else if (priceFilter === '10to20') list = list.filter(p => p.price >= 10000000 && p.price <= 20000000);
    else if (priceFilter === 'over20') list = list.filter(p => p.price > 20000000);

    // Apply sort
    switch (sort) {
      case 'price-asc':  return list.sort((a, b) => a.price - b.price);
      case 'price-desc': return list.sort((a, b) => b.price - a.price);
      case 'rating':     return list.sort((a, b) => b.rating - a.rating);
      case 'reviews':    return list.sort((a, b) => b.reviews - a.reviews);
      default:           return list;
    }
  }, [products, priceFilter, sort]);

  const visibleList = list.slice(0, visibleCount);
  const hasMore = visibleCount < list.length;
  const remaining = list.length - visibleCount;

  return (
    <>
      {/* ── Hero ── */}
      <section className="brand-page-hero">
        <div className="container">
          <div className="brand-hero-inner">
            {brandObj && brandObj.logo ? (
              <img src={brandObj.logo} alt={brandObj.name} className="brand-hero-logo" />
            ) : (
              <div className="brand-hero-emoji">{brandObj ? brandObj.emoji : '📱'}</div>
            )}
            <div className="brand-hero-text">
              <h1>Điện thoại {brandObj ? brandObj.name : 'Tất cả hãng'}</h1>
              <p>Khám phá {list.length} mẫu {brandObj ? brandObj.name : ''} chính hãng mới nhất</p>
            </div>
            <div className="brand-hero-count">
              <strong>{list.length}</strong>
              <span>sản phẩm</span>
            </div>
          </div>
        </div>
      </section>

      <section className="brand-page-section">
        <div className="container">

          {/* ── Breadcrumb ── */}
          <div className="breadcrumb">
            <Link to="/"><i className="fa fa-home"></i> Trang chủ</Link>
            <span className="sep"><i className="fa fa-chevron-right"></i></span>
            <Link to="/brand/all">Điện thoại</Link>
            {brandObj && (
              <>
                <span className="sep"><i className="fa fa-chevron-right"></i></span>
                <span>{brandObj.name}</span>
              </>
            )}
          </div>

          {/* ── Brand Switcher ── */}
          <div className="brand-switcher">
            <Link
              to="/brand/all"
              className={`brand-switch-btn${current === 'all' ? ' active' : ''}`}
            >
              <span className="sw-emoji">📱</span>
              <span className="sw-name">Tất cả</span>
            </Link>
            {BRANDS.map(b => (
              <Link
                key={b.id}
                to={`/brand/${b.id}`}
                className={`brand-switch-btn${current === b.id ? ' active' : ''}`}
              >
                {b.logo ? (
                  <img src={b.logo} alt={b.name} className="sw-logo" />
                ) : (
                  <span className="sw-emoji">{b.emoji}</span>
                )}
                <span className="sw-name">{b.name}</span>
              </Link>
            ))}
          </div>

          {/* ── Filters ── */}
          <div className="filters-bar">
            <div className="filter-group">
              <span className="filter-label">Mức giá:</span>
              <select className="sort-select" value={priceFilter} onChange={e => setPriceFilter(e.target.value)}>
                <option value="all">Tất cả các mức giá</option>
                <option value="under10">Dưới 10 triệu</option>
                <option value="10to20">Từ 10 - 20 triệu</option>
                <option value="over20">Trên 20 triệu</option>
              </select>
            </div>
            <div className="filter-group">
              <span className="filter-label">Sắp xếp:</span>
              <select className="sort-select" value={sort} onChange={e => setSort(e.target.value)}>
                <option value="default">Mặc định</option>
                <option value="price-asc">Giá tăng dần</option>
                <option value="price-desc">Giá giảm dần</option>
                <option value="rating">Đánh giá cao nhất</option>
                <option value="reviews">Nhiều đánh giá nhất</option>
              </select>
            </div>
            <span className="result-count">
              Hiển thị <strong>{visibleList.length}</strong> / <strong>{list.length}</strong> sản phẩm
            </span>
          </div>

          {/* ── Product Grid ── */}
          {loading ? (
            <div className="empty-state">
              <i className="fa fa-spinner fa-spin"></i>
              <h3>Đang tải sản phẩm...</h3>
            </div>
          ) : list.length > 0 ? (
            <>
              <div className="products-grid">
                {visibleList.map(p => <ProductCard key={p.id} product={p} />)}
              </div>

              {/* ── Load More ── */}
              {hasMore && (
                <div className="load-more-wrap">
                  <button
                    className="btn-load-more"
                    onClick={() => setVisibleCount(v => v + PAGE_SIZE)}
                  >
                    <i className="fa fa-chevron-down"></i>
                    Xem thêm {Math.min(remaining, PAGE_SIZE)} sản phẩm
                    <span className="load-more-sub">({remaining} sản phẩm còn lại)</span>
                  </button>
                </div>
              )}

              {!hasMore && list.length > PAGE_SIZE && (
                <div className="load-more-wrap">
                  <p className="all-loaded-text">
                    <i className="fa fa-check-circle"></i> Đã hiển thị tất cả {list.length} sản phẩm
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <i className="fa fa-search"></i>
              <h3>Không tìm thấy sản phẩm</h3>
              <p>Hãng này chưa có sản phẩm hoặc đang được cập nhật.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
