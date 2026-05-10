import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fmt, discount, mapProduct } from '../utils/utils';
import { useCart } from '../store/CartContext';
import { fetchApi } from '../api/apiClient';

// Danh sách các key thông số CƠ BẢN hiển thị mặc định
const BASIC_SPEC_KEYS = [
  'Màn hình rộng',
  'Loại màn hình',
  'Chuẩn màn hình',
  'Hệ điều hành',
  'Camera sau',
  'Camera trước',
  'Chipset',
  'RAM',
  'Bộ nhớ trong (ROM)',
  'Loại Sim',
  'Khe gắn Sim',
  'Dung lượng pin',
  'Kiểu dáng',
];

function formatSpecValue(value) {
  if (Array.isArray(value)) {
    return value.join('\n');
  }
  return value;
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFullSpecs, setShowFullSpecs] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setLoading(true);
    fetchApi(`/products/${id}`)
      .then(res => setProduct(mapProduct(res)))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '100px 0', textAlign: 'center' }}>
        <h2>Đang tải thông tin sản phẩm...</h2>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: '100px 0', textAlign: 'center' }}>
        <h2>Không tìm thấy sản phẩm!</h2>
        <button className="btn btn-primary" onClick={() => navigate(-1)} style={{ marginTop: '20px' }}>
          Quay lại
        </button>
      </div>
    );
  }

  const disc = product.oldPrice ? discount(product.price, product.oldPrice) : '';

  // Lọc thông số cơ bản (chỉ lấy key nằm trong BASIC_SPEC_KEYS và tồn tại trong product.specs)
  const allEntries = product.specs ? Object.entries(product.specs) : [];
  const basicEntries = allEntries.filter(([key]) => BASIC_SPEC_KEYS.includes(key));
  const displayedEntries = showFullSpecs ? allEntries : basicEntries;

  return (
    <div className="product-detail-page">
      <div className="container">
        <div className="breadcrumb">
          <Link to="/"><i className="fas fa-house"></i> Trang chủ</Link>
          <span className="sep"><i className="fas fa-chevron-right"></i></span>
          <Link to={`/brand/${product.brand || 'all'}`}>{product.brand || 'Phụ kiện'}</Link>
          <span className="sep"><i className="fas fa-chevron-right"></i></span>
          <span>{product.name}</span>
        </div>

        <div className="pd-main">
          {/* Cột trái: Hình ảnh */}
          <div className="pd-left">
            <div className="pd-img-main">
              <img src={product.img} alt={product.name} />
              <div className="pd-badges">
                {product.isNew && <span className="badge-tag badge-new">Mới</span>}
                {product.badge === 'sale' && <span className="badge-tag badge-sale">Sale</span>}
                {product.badge === 'hot' && <span className="badge-tag badge-hot">Hot</span>}
              </div>
            </div>
            <div className="pd-img-thumbs">
              <div className="pd-thumb active"><img src={product.img} alt="thumb" /></div>
            </div>
          </div>

          {/* Cột phải: Thông tin */}
          <div className="pd-right">
            <h1 className="pd-title">{product.name}</h1>
            <div className="pd-rating">
              <span className="stars-small">
                {'★'.repeat(Math.floor(product.rating))}{'☆'.repeat(5 - Math.floor(product.rating))}
              </span>
              <span className="rating-text">{product.rating} ({product.reviews.toLocaleString()} đánh giá)</span>
            </div>

            <div className="pd-price-box">
              <div className="pd-price-current">{fmt(product.price)}</div>
              {product.oldPrice && <div className="pd-price-old">{fmt(product.oldPrice)}</div>}
              {disc && <div className="pd-price-disc">{disc}</div>}
            </div>

            <div className="pd-promotions">
              <div className="pd-promo-title"><i className="fas fa-gift"></i> Khuyến mãi & Ưu đãi</div>
              <ul>
                <li>Giảm thêm tới 500.000đ khi thanh toán qua VNPay.</li>
                <li>Tặng ốp lưng chính hãng & miếng dán màn hình.</li>
                <li>Hỗ trợ thu cũ đổi mới trợ giá 2 triệu.</li>
                <li>Miễn phí giao hàng toàn quốc trong 2 giờ.</li>
              </ul>
            </div>

            <div className="pd-actions">
              <button className="btn-buy-now" onClick={() => { addToCart(product.id); navigate('/checkout'); }}>
                <strong>MUA NGAY</strong>
                <span>Giao tận nơi hoặc nhận tại cửa hàng</span>
              </button>
              <div className="pd-btn-group">
                <button className="btn-add-cart" onClick={() => addToCart(product.id)}>
                  <i className="fas fa-cart-plus"></i> Thêm vào giỏ
                </button>
                <button className="btn-add-cart btn-installment">
                  <strong>MUA TRẢ GÓP 0%</strong>
                  <span>Duyệt hồ sơ 5 phút</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Thông số kỹ thuật */}
        <div className="pd-specs">
          <div className="pd-section-title">Thông số kỹ thuật</div>
          <table className="specs-table">
            <tbody>
              {displayedEntries.map(([key, value]) => (
                <tr key={key}>
                  <td className="spec-name">{key}</td>
                  <td className="spec-value" style={{ whiteSpace: 'pre-line' }}>
                    {formatSpecValue(value)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Nút toggle xem thêm / thu gọn */}
          {allEntries.length > basicEntries.length && (
            <button
              className={`specs-toggle-btn${showFullSpecs ? ' expanded' : ''}`}
              onClick={() => setShowFullSpecs(prev => !prev)}
            >
              {showFullSpecs ? (
                <>
                  <i className="fas fa-chevron-up"></i>
                  Thu gọn thông số
                  <span style={{ fontSize: '0.78rem', fontWeight: 400, opacity: 0.75 }}>
                    ({allEntries.length - basicEntries.length} thông số ẩn đi)
                  </span>
                </>
              ) : (
                <>
                  <i className="fas fa-chevron-down"></i>
                  Xem thêm cấu hình chi tiết
                  <span style={{ fontSize: '0.78rem', fontWeight: 400, opacity: 0.75 }}>
                    (+{allEntries.length - basicEntries.length} thông số)
                  </span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
