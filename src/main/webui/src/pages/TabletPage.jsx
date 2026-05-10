import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { mapProduct } from '../utils/utils';
import ProductCard from '../components/ProductCard';
import { fetchApi } from '../api/apiClient';

const PAGE_SIZE = 15;

export default function TabletPage() {
  const [sort, setSort] = useState('default');
  const [priceFilter, setPriceFilter] = useState('all');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setLoading(true);
    fetchApi('/products?brand=Máy tính bảng&size=200')
      .then(res => {
        if (res && res.data) {
          setProducts(res.data.map(mapProduct));
        } else if (Array.isArray(res)) {
          setProducts(res.map(mapProduct));
        } else {
          setProducts([]);
        }
      })
      .catch(err => {
        console.error('Error loading tablets:', err);
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [priceFilter, sort]);

  const list = useMemo(() => {
    let filtered = [...products];

    if (priceFilter === 'under10') filtered = filtered.filter(p => p.price < 10000000);
    else if (priceFilter === '10to20') filtered = filtered.filter(p => p.price >= 10000000 && p.price <= 20000000);
    else if (priceFilter === 'over20') filtered = filtered.filter(p => p.price > 20000000);

    switch (sort) {
      case 'price-asc':  return filtered.sort((a, b) => a.price - b.price);
      case 'price-desc': return filtered.sort((a, b) => b.price - a.price);
      case 'rating':     return filtered.sort((a, b) => b.rating - a.rating);
      case 'reviews':    return filtered.sort((a, b) => b.reviews - a.reviews);
      default:           return filtered;
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
            {/* Icon */}
            <div className="brand-hero-icon-wrap">
              <i className="fas fa-tablet-screen-button"></i>
            </div>

            <div className="brand-hero-text">
              <h1>Máy Tính Bảng</h1>
              <p>Khám phá {list.length} mẫu máy tính bảng chính hãng mới nhất</p>
              <div className="brand-hero-tags">
                <span className="brand-hero-tag">
                  <i className="fas fa-shield-halved"></i> Chính hãng 100%
                </span>
                <span className="brand-hero-tag">
                  <i className="fas fa-truck-fast"></i> Giao hàng nhanh
                </span>
                <span className="brand-hero-tag">
                  <i className="fas fa-rotate-left"></i> Đổi trả 30 ngày
                </span>
              </div>
            </div>

            <div className="brand-hero-count">
              <div className="brand-hero-count-label">Sản phẩm</div>
              <strong>{list.length}</strong>
              <span>đang có hàng</span>
            </div>
          </div>
        </div>
      </section>

      <section className="brand-page-section">
        <div className="container">

          {/* ── Breadcrumb ── */}
          <div className="breadcrumb">
            <Link to="/"><i className="fas fa-house"></i> Trang chủ</Link>
            <span className="sep"><i className="fas fa-chevron-right"></i></span>
            <span>Máy tính bảng</span>
          </div>

          {/* ── Filters ── */}
          <div className="filters-bar">
            <div className="filter-group">
              <span className="filter-label"><i className="fas fa-tag"></i> Mức giá:</span>
              <select className="sort-select" value={priceFilter} onChange={e => setPriceFilter(e.target.value)}>
                <option value="all">Tất cả các mức giá</option>
                <option value="under10">Dưới 10 triệu</option>
                <option value="10to20">Từ 10 - 20 triệu</option>
                <option value="over20">Trên 20 triệu</option>
              </select>
            </div>
            <div className="filter-group">
              <span className="filter-label"><i className="fas fa-arrow-up-wide-short"></i> Sắp xếp:</span>
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
              <i className="fas fa-spinner fa-spin"></i>
              <h3>Đang tải sản phẩm...</h3>
            </div>
          ) : list.length > 0 ? (
            <>
              <div className="products-grid">
                {visibleList.map(p => <ProductCard key={p.id} product={p} />)}
              </div>

              {hasMore && (
                <div className="load-more-wrap">
                  <button
                    className="btn-load-more"
                    onClick={() => setVisibleCount(v => v + PAGE_SIZE)}
                  >
                    <i className="fas fa-chevron-down"></i>
                    Xem thêm {Math.min(remaining, PAGE_SIZE)} sản phẩm
                    <span className="load-more-sub">({remaining} sản phẩm còn lại)</span>
                  </button>
                </div>
              )}

              {!hasMore && list.length > PAGE_SIZE && (
                <div className="load-more-wrap">
                  <p className="all-loaded-text">
                    <i className="fas fa-circle-check"></i> Đã hiển thị tất cả {list.length} sản phẩm
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <i className="fas fa-tablet-screen-button"></i>
              <h3>Chưa có sản phẩm máy tính bảng</h3>
              <p>Danh mục này đang được cập nhật, vui lòng quay lại sau.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
