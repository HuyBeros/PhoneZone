import { useState, useEffect, useCallback } from 'react';
import { fetchApi } from '../../api/apiClient';
import { fmt } from '../../utils/utils';

export default function AdminProducts() {
  const [allProducts, setAllProducts] = useState([]); // Tất cả sản phẩm
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Filter & Search states
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Pagination
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;

  const [formData, setFormData] = useState({
    id: null,
    tenSanPham: '',
    giaBanSo: 0,
    giaGocSo: 0,
    hinhAnh: '',
    danhMuc: '',
    stockQuantity: 100,
    isActive: true
  });

  // Load TẤT CẢ sản phẩm một lần (admin không cần pagination phía server)
  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchApi('/products?page=0&size=2000&sort=default');
      if (res && res.data) {
        setAllProducts(res.data);
      } else if (Array.isArray(res)) {
        setAllProducts(res);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Reset về trang 0 mỗi khi filter thay đổi
  useEffect(() => {
    setPage(0);
  }, [keyword, statusFilter, categoryFilter]);

  // Lấy danh sách categories từ TẤT CẢ sản phẩm
  const categories = Array.from(new Set(allProducts.map(p => p.danhMuc).filter(Boolean))).sort();

  // Lọc sản phẩm theo keyword + status + category
  const filteredProducts = allProducts.filter(p => {
    const kw = keyword.trim().toLowerCase();
    const matchKeyword = kw === '' ||
      (p.tenSanPham && p.tenSanPham.toLowerCase().includes(kw)) ||
      (p.danhMuc && p.danhMuc.toLowerCase().includes(kw)) ||
      (p.id && p.id.toString().includes(kw));

    const matchStatus = statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && p.isActive !== false) ||
      (statusFilter === 'INACTIVE' && p.isActive === false);

    const matchCategory = categoryFilter === 'ALL' || p.danhMuc === categoryFilter;

    return matchKeyword && matchStatus && matchCategory;
  });

  // Pagination trên kết quả đã lọc
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const paginatedProducts = filteredProducts.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const openAddModal = () => {
    setFormData({
      id: null, tenSanPham: '', giaBanSo: 0, giaGocSo: 0, hinhAnh: '', danhMuc: '', stockQuantity: 100, isActive: true
    });
    setErrorMsg('');
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const openEditModal = (p) => {
    setFormData({
      id: p.id,
      tenSanPham: p.tenSanPham || '',
      giaBanSo: p.giaBanSo || 0,
      giaGocSo: p.giaGocSo || 0,
      hinhAnh: p.hinhAnh || '',
      danhMuc: p.danhMuc || '',
      stockQuantity: p.stockQuantity || 0,
      isActive: p.isActive !== false
    });
    setErrorMsg('');
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      if (isEditMode) {
        await fetchApi(`/admin/products/${formData.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
      } else {
        await fetchApi('/admin/products', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
      }
      setIsModalOpen(false);
      loadProducts();
    } catch (err) {
      setErrorMsg(err.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      try {
        await fetchApi(`/admin/products/${id}`, { method: 'DELETE' });
        loadProducts();
      } catch (err) {
        alert(err.message || 'Xóa thất bại');
      }
    }
  };

  const handleResetFilters = () => {
    setKeyword('');
    setStatusFilter('ALL');
    setCategoryFilter('ALL');
    setPage(0);
  };

  const hasActiveFilter = keyword || statusFilter !== 'ALL' || categoryFilter !== 'ALL';

  return (
    <div>
      <div className="dash-page-header">
        <div>
          <h1 className="dash-title">Quản Lý Sản Phẩm</h1>
          <p className="dash-subtitle">Xem, thêm, sửa, xóa sản phẩm điện thoại &amp; máy tính bảng</p>
        </div>
        <button className="dash-view-all-btn" onClick={openAddModal}>
          <i className="fas fa-plus"></i> Thêm Sản Phẩm
        </button>
      </div>

      <div className="admin-card">
        {/* Filter Bar */}
        <div style={{padding: '16px', borderBottom: '1px solid var(--admin-border)', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center'}}>
          <input
            type="text"
            placeholder="Tìm kiếm tên, danh mục, ID..."
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            style={{padding: '10px 14px', flex: '1', minWidth: '220px', borderRadius: '8px', border: '1px solid var(--admin-border)', outline: 'none', background: 'var(--admin-bg)', color: 'var(--admin-text-main)'}}
          />

          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            style={{padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--admin-border)', outline: 'none', minWidth: '160px', background: 'var(--admin-bg)', color: 'var(--admin-text-main)'}}
          >
            <option value="ALL">Tất cả danh mục</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--admin-border)', outline: 'none', background: 'var(--admin-bg)', color: 'var(--admin-text-main)'}}
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="INACTIVE">Đã ẩn</option>
          </select>

          {hasActiveFilter && (
            <button
              onClick={handleResetFilters}
              style={{padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--admin-border)', background: 'rgba(239,68,68,0.1)', color: '#ef4444', cursor: 'pointer', whiteSpace: 'nowrap'}}
              title="Xóa bộ lọc"
            >
              <i className="fas fa-times" style={{marginRight: '6px'}}></i>Xóa lọc
            </button>
          )}

          <span style={{fontSize: '0.85rem', color: 'var(--admin-text-muted)', whiteSpace: 'nowrap', marginLeft: 'auto'}}>
            {filteredProducts.length} / {allProducts.length} sản phẩm
          </span>
        </div>

        {loading ? (
          <div className="dash-loading"><i className="fas fa-spinner fa-spin"></i><span> Đang tải...</span></div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Sản Phẩm</th>
                <th>Giá Bán</th>
                <th>Kho</th>
                <th>Trạng Thái</th>
                <th>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map(p => (
                <tr key={p.id}>
                  <td>#{p.id}</td>
                  <td>
                    <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                      <img src={p.hinhAnh} alt="" style={{width: '40px', height: '40px', objectFit: 'contain', background: '#f8fafc', borderRadius: '8px'}} />
                      <div>
                        <div style={{fontWeight: 600, fontSize: '0.85rem'}}>{p.tenSanPham}</div>
                        <div style={{fontSize: '0.75rem', color: 'var(--admin-text-muted)'}}>{p.danhMuc}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{fontWeight: 700, color: 'var(--admin-orange)'}}>{fmt(p.giaBanSo)}</td>
                  <td>{p.stockQuantity}</td>
                  <td>
                    <span className="status-badge" style={{background: p.isActive !== false ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: p.isActive !== false ? '#10b981' : '#ef4444'}}>
                      {p.isActive !== false ? 'Hoạt động' : 'Đã ẩn'}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => openEditModal(p)} style={{background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '5px', fontSize: '1rem'}} title="Sửa">
                      <i className="fas fa-edit"></i>
                    </button>
                    <button onClick={() => handleDelete(p.id)} style={{background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '5px', fontSize: '1rem'}} title="Xóa">
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </td>
                </tr>
              ))}
              {paginatedProducts.length === 0 && (
                <tr>
                  <td colSpan="6" style={{textAlign: 'center', padding: '30px', color: 'var(--admin-text-muted)'}}>
                    {hasActiveFilter ? 'Không tìm thấy sản phẩm nào phù hợp với bộ lọc.' : 'Chưa có sản phẩm nào.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* Phân trang */}
        {!loading && totalPages > 1 && (
          <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', padding: '20px'}}>
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="admin-btn-secondary">Trước</button>
            <span style={{padding: '10px', fontWeight: 600}}>Trang {page + 1} / {totalPages}</span>
            <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="admin-btn-secondary">Sau</button>
          </div>
        )}
      </div>

      {/* Modal Thêm/Sửa */}
      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h2>{isEditMode ? 'Sửa Sản Phẩm' : 'Thêm Sản Phẩm'}</h2>
              <button className="admin-modal-close" onClick={() => setIsModalOpen(false)}><i className="fas fa-times"></i></button>
            </div>
            <form onSubmit={handleSave} className="admin-modal-body">
              {errorMsg && <div className="admin-alert error">{errorMsg}</div>}

              <div className="form-group">
                <label>Tên Sản Phẩm *</label>
                <input type="text" name="tenSanPham" value={formData.tenSanPham} onChange={handleInputChange} required />
              </div>

              <div className="form-group-grid">
                <div className="form-group">
                  <label>Giá Bán (VND) *</label>
                  <input type="number" name="giaBanSo" value={formData.giaBanSo} onChange={handleInputChange} required min="0" />
                </div>
                <div className="form-group">
                  <label>Giá Gốc (VND)</label>
                  <input type="number" name="giaGocSo" value={formData.giaGocSo} onChange={handleInputChange} min="0" />
                </div>
              </div>

              <div className="form-group">
                <label>URL Hình Ảnh *</label>
                <input type="text" name="hinhAnh" value={formData.hinhAnh} onChange={handleInputChange} required />
              </div>

              <div className="form-group-grid">
                <div className="form-group">
                  <label>Thương Hiệu / Danh Mục</label>
                  <input type="text" name="danhMuc" value={formData.danhMuc} onChange={handleInputChange} placeholder="VD: Apple, Samsung..." />
                </div>
                <div className="form-group">
                  <label>Số lượng kho</label>
                  <input type="number" name="stockQuantity" value={formData.stockQuantity} onChange={handleInputChange} min="0" />
                </div>
              </div>

              <div className="form-group" style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange} id="isActive" style={{width: 'auto'}} />
                <label htmlFor="isActive" style={{marginBottom: 0, textTransform: 'none', fontSize: '0.9rem', color: 'var(--admin-text-main)'}}>Sản phẩm đang hoạt động (Hiển thị cho khách)</label>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="admin-btn-secondary" onClick={() => setIsModalOpen(false)}>Hủy</button>
                <button type="submit" className="admin-btn-primary">Lưu Sản Phẩm</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
