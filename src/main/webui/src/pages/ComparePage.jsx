import { Link } from 'react-router-dom';
import { useCompare } from '../store/CompareContext';
import { useCart } from '../store/CartContext';
import { fmt } from '../utils/utils';

export default function ComparePage() {
  const { compareItems, removeCompare } = useCompare();
  const { addToCart } = useCart();

  if (compareItems.length < 2) {
    return (
      <div className="container" style={{ padding: '100px 0', textAlign: 'center' }}>
        <h2>Bạn cần chọn ít nhất 2 sản phẩm để so sánh.</h2>
        <Link to="/brand/all" className="btn btn-primary" style={{ marginTop: '20px' }}>
          Quay lại mua sắm
        </Link>
      </div>
    );
  }

  // Thu thập tất cả các key thông số kỹ thuật (specs) từ các sản phẩm được chọn
  const allSpecKeys = new Set();
  compareItems.forEach(item => {
    if (item.specs) {
      Object.keys(item.specs).forEach(key => allSpecKeys.add(key));
    }
  });

  return (
    <div className="compare-page">
      <div className="container">
        <div className="breadcrumb">
          <Link to="/"><i className="fa fa-home"></i> Trang chủ</Link>
          <span className="sep"><i className="fa fa-chevron-right"></i></span>
          <span>So sánh sản phẩm</span>
        </div>

        <h1 className="page-title">So sánh chi tiết</h1>

        <div className="compare-table-wrapper">
          <table className="compare-table">
            <thead>
              <tr>
                <th className="spec-label-col">Tổng quan</th>
                {compareItems.map(item => (
                  <th key={item.id} className="compare-item-col">
                    <div className="ct-item-header">
                      <button className="ct-remove" onClick={() => removeCompare(item.id)}>
                        <i className="fa fa-times"></i> Xóa
                      </button>
                      <img src={item.img} alt={item.name} />
                      <div className="ct-name">{item.name}</div>
                      <div className="ct-price">{fmt(item.price)}</div>
                      <button className="btn btn-primary btn-sm" onClick={() => addToCart(item.id)}>
                        <i className="fa fa-cart-plus"></i> Thêm vào giỏ
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from(allSpecKeys).map(key => (
                <tr key={key}>
                  <td className="spec-label">{key}</td>
                  {compareItems.map(item => (
                    <td key={item.id} className="spec-val">
                      {item.specs && item.specs[key] ? item.specs[key] : '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
