import { Link } from 'react-router-dom';
import { useCompare } from '../store/CompareContext';
import { fmt } from '../utils/utils';

export default function CompareBar() {
  const { compareItems, removeCompare, clearCompare } = useCompare();

  if (compareItems.length === 0) return null;

  return (
    <div className="compare-bar">
      <div className="container compare-bar-inner">
        <div className="compare-items-wrap">
          {compareItems.map(item => (
            <div key={item.id} className="compare-item">
              <img src={item.img} alt={item.name} />
              <div className="ci-info">
                <div className="ci-name">{item.name}</div>
                <div className="ci-price">{fmt(item.price)}</div>
              </div>
              <button className="ci-remove" onClick={() => removeCompare(item.id)}>
                <i className="fa fa-times"></i>
              </button>
            </div>
          ))}
          {/* Vùng trống nếu chưa đủ 3 */}
          {Array.from({ length: 3 - compareItems.length }).map((_, i) => (
            <div key={`empty-${i}`} className="compare-item empty">
              <div className="ci-empty-icon"><i className="fa fa-plus"></i></div>
              <div className="ci-info">Thêm sản phẩm</div>
            </div>
          ))}
        </div>
        
        <div className="compare-actions">
          <button className="btn btn-outline" onClick={clearCompare}>Xóa tất cả</button>
          <Link 
            to="/compare" 
            className={`btn btn-primary ${compareItems.length < 2 ? 'disabled' : ''}`}
            onClick={e => compareItems.length < 2 && e.preventDefault()}
          >
            So sánh ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
