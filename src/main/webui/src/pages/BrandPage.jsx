import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BRANDS, PHONES } from '../data/data';
import { fmt, discount } from '../utils/utils';
import ProductCard from '../components/ProductCard';

export default function BrandPage() {
  const { brandId } = useParams();           // e.g. "iphone" | "all"
  const [sort, setSort]     = useState('default');
  const [current, setCurrent] = useState(brandId || 'all');

  // Sync khi URL thay đổi
  useEffect(() => {
    setCurrent(brandId || 'all');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [brandId]);

  const brandObj = BRANDS.find(b => b.id === current) || null;

  const getList = () => {
    let list = current === 'all' ? PHONES : PHONES.filter(p => p.brand === current);
    switch (sort) {
      case 'price-asc':  return [...list].sort((a, b) => a.price - b.price);
      case 'price-desc': return [...list].sort((a, b) => b.price - a.price);
      case 'rating':     return [...list].sort((a, b) => b.rating - a.rating);
      case 'reviews':    return [...list].sort((a, b) => b.reviews - a.reviews);
      default:           return list;
    }
  };
  const list = getList();

  return (
    <>
      {/* ── Hero ── */}
      <section className="brand-page-hero">
        <div className="container">
          <div className="brand-hero-inner">
            <div className="brand-hero-emoji">{brandObj ? brandObj.emoji : '📱'}</div>
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
                <span className="sw-emoji">{b.emoji}</span>
                <span className="sw-name">{b.name}</span>
              </Link>
            ))}
          </div>

          {/* ── Filters ── */}
          <div className="filters-bar">
            <span className="filter-label">Sắp xếp:</span>
            <select className="sort-select" value={sort} onChange={e => setSort(e.target.value)}>
              <option value="default">Mặc định</option>
              <option value="price-asc">Giá tăng dần</option>
              <option value="price-desc">Giá giảm dần</option>
              <option value="rating">Đánh giá cao nhất</option>
              <option value="reviews">Nhiều đánh giá nhất</option>
            </select>
            <span className="result-count">Tìm thấy <strong>{list.length}</strong> sản phẩm</span>
          </div>

          {/* ── Product Grid ── */}
          {list.length > 0 ? (
            <div className="products-grid">
              {list.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
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
