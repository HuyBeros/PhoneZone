import { useAdminFeedback } from '../../store/AdminFeedbackContext';
import { useToast } from '../../store/ToastContext';
import { fetchAllAdminProducts } from '../../api/adminProducts';
import { useState, useEffect, useCallback } from 'react';
import { fetchApi } from '../../api/apiClient';
import { fmt } from '../../utils/utils';
import {
  IoAddOutline,
  IoSearchOutline,
  IoCloseOutline,
  IoCreateOutline,
  IoTrashOutline,
  IoRefreshOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoPhonePortraitOutline,
  IoCheckmarkCircleOutline
} from 'react-icons/io5';

export default function AdminProducts() {
  const { confirmAction } = useAdminFeedback();
  const { showToast } = useToast();
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [saving, setSaving] = useState(false);

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

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchAllAdminProducts();
      if (res && res.data) {
        setAllProducts(res.data);
      } else if (Array.isArray(res)) {
        setAllProducts(res);
      }
    } catch (err) {
      showToast(err.message || 'Không thể tải danh sách sản phẩm.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    setPage(0);
  }, [keyword, statusFilter, categoryFilter]);

  const categories = Array.from(new Set(allProducts.map(p => p.danhMuc).filter(Boolean))).sort();

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

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const paginatedProducts = filteredProducts.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  useEffect(() => { setPage(current => Math.min(current, totalPages - 1)); }, [totalPages]);

  const openAddModal = () => {
    setFormData({
      id: null,
      tenSanPham: '',
      giaBanSo: 0,
      giaGocSo: 0,
      hinhAnh: '',
      danhMuc: '',
      stockQuantity: 100,
      isActive: true
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
      stockQuantity: p.stockQuantity ?? 100,
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
    if (saving) return;
    setSaving(true);
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
      showToast(isEditMode ? 'Đã cập nhật sản phẩm.' : 'Đã thêm sản phẩm.', 'success');
    } catch (err) {
      setErrorMsg(err.message || 'Có lỗi xảy ra khi lưu sản phẩm');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id) => {
    const item = allProducts.find(entry => entry.id === id);
    return confirmAction({
      title: 'Xóa sản phẩm này?',
      description: 'Kiểm tra thông tin bên dưới trước khi xác nhận xóa.',
      resource: item?.tenSanPham || `#${id}`,
      note: 'Thao tác xóa không thể hoàn tác.',
      confirmLabel: 'Xóa sản phẩm',
      successMessage: 'Đã xóa sản phẩm.',
      onConfirm: async () => {
        await fetchApi(`/admin/products/${id}`, { method: 'DELETE' });
        setAllProducts(previous => previous.filter(entry => entry.id !== id));
      },
    });
  };

  const handleResetFilters = () => {
    setKeyword('');
    setStatusFilter('ALL');
    setCategoryFilter('ALL');
    setPage(0);
  };

  const hasActiveFilter = keyword || statusFilter !== 'ALL' || categoryFilter !== 'ALL';

  return (
    <div className="admin-products-page">
      {/* ── HEADER ── */}
      <div className="dash-page-header">
        <div>
          <h1 className="dash-title">Quản Lý Sản Phẩm</h1>
          <p className="dash-subtitle">Xem, thêm mới, điều chỉnh giá và cập nhật tồn kho sản phẩm PhoneZone</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="admin-btn-secondary"
            onClick={loadProducts}
            title="Làm mới"
          >
            <IoRefreshOutline style={{ fontSize: '1.1rem' }} />
            <span>Làm mới</span>
          </button>
          <button className="dash-view-all-btn" onClick={openAddModal}>
            <IoAddOutline style={{ fontSize: '1.25rem' }} />
            <span>Thêm Sản Phẩm Mới</span>
          </button>
        </div>
      </div>

      <div className="admin-card">
        {/* Filter Bar */}
        <div className="admin-table-filter-bar">
          <div className="admin-filter-search-box">
            <IoSearchOutline className="filter-search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên sản phẩm, danh mục, ID..."
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
            />
            {keyword && (
              <button
                type="button"
                className="filter-clear-btn"
                onClick={() => setKeyword('')}
              >
                <IoCloseOutline />
              </button>
            )}
          </div>

          <div className="admin-filter-select-box">
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
            >
              <option value="ALL">Tất cả thương hiệu/danh mục</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="admin-filter-select-box">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="ACTIVE">Đang hiển thị</option>
              <option value="INACTIVE">Đã ẩn</option>
            </select>
          </div>

          {hasActiveFilter && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="admin-filter-reset-pill"
            >
              <IoCloseOutline style={{ fontSize: '1.1rem' }} />
              <span>Xóa lọc</span>
            </button>
          )}

          <div className="admin-table-count">
            Hiển thị <strong>{filteredProducts.length}</strong> / {allProducts.length} sản phẩm
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="dash-loading-screen">
            <div className="dash-spinner"></div>
            <span>Đang tải danh sách sản phẩm...</span>
          </div>
        ) : (
          <div className="admin-table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>ID</th>
                  <th>Sản Phẩm</th>
                  <th>Giá Bán</th>
                  <th>Giá Gốc</th>
                  <th>Tồn Kho</th>
                  <th>Trạng Thái</th>
                  <th style={{ textAlign: 'center', width: '100px' }}>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.map(p => (
                  <tr key={p.id}>
                    <td>
                      <span className="order-id-badge">#{p.id}</span>
                    </td>
                    <td>
                      <div className="product-table-cell">
                        <img
                          src={p.hinhAnh}
                          alt=""
                          className="product-table-thumb"
                          onError={(e) => { e.target.src = 'https://placehold.co/48x48?text=Phone'; }}
                        />
                        <div>
                          <div className="product-table-name" title={p.tenSanPham}>{p.tenSanPham}</div>
                          <span className="product-table-cat">{p.danhMuc || 'Chưa phân loại'}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="order-amount-text">{fmt(p.giaBanSo)}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: 'var(--admin-text-muted)', textDecoration: p.giaGocSo > p.giaBanSo ? 'line-through' : 'none' }}>
                        {p.giaGocSo ? fmt(p.giaGocSo) : '-'}
                      </span>
                    </td>
                    <td>
                      <span className={p.stockQuantity < 15 ? 'stock-warning-badge' : 'stock-normal-badge'}>
                        {p.stockQuantity ?? 100} máy
                      </span>
                    </td>
                    <td>
                      <span className={`status-pill ${p.isActive !== false ? 'active' : 'inactive'}`}>
                        {p.isActive !== false ? 'Hiển thị' : 'Đã ẩn'}
                      </span>
                    </td>
                    <td>
                      <div className="admin-actions-cell" style={{ justifyContent: 'center' }}>
                        <button
                          type="button"
                          className="admin-action-btn edit"
                          onClick={() => openEditModal(p)}
                          title="Sửa sản phẩm"
                        >
                          <IoCreateOutline />
                        </button>
                        <button
                          type="button"
                          className="admin-action-btn danger"
                          onClick={() => handleDelete(p.id)}
                          title="Xóa sản phẩm"
                        >
                          <IoTrashOutline />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginatedProducts.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--admin-text-muted)' }}>
                      {hasActiveFilter ? 'Không tìm thấy sản phẩm nào phù hợp với bộ lọc.' : 'Chưa có sản phẩm nào.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Phân trang */}
        {!loading && totalPages > 1 && (
          <div className="admin-pagination">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
              className="admin-pagination-btn"
            >
              <IoChevronBackOutline />
              <span>Trước</span>
            </button>
            <span className="admin-pagination-info">
              Trang <strong>{page + 1}</strong> / {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages - 1}
              onClick={() => setPage(p => p + 1)}
              className="admin-pagination-btn"
            >
              <span>Sau</span>
              <IoChevronForwardOutline />
            </button>
          </div>
        )}
      </div>

      {/* Modal Thêm/Sửa */}
      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={() => { if (!saving) setIsModalOpen(false); }}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <IoPhonePortraitOutline style={{ color: 'var(--admin-primary)', fontSize: '1.4rem' }} />
                <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{isEditMode ? 'Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}</h2>
              </div>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => { if (!saving) setIsModalOpen(false); }}
              >
                <IoCloseOutline />
              </button>
            </div>

            <form onSubmit={handleSave} className="admin-modal-body">
              {errorMsg && <div className="admin-alert error">{errorMsg}</div>}

              <div className="form-group">
                <label>Tên Sản Phẩm *</label>
                <input
                  type="text"
                  name="tenSanPham"
                  value={formData.tenSanPham}
                  onChange={handleInputChange}
                  placeholder="VD: Điện thoại iPhone 16 Pro Max 256GB"
                  required
                />
              </div>

              <div className="form-group-grid">
                <div className="form-group">
                  <label>Giá Bán Khuyến Mãi (VND) *</label>
                  <input
                    type="number"
                    name="giaBanSo"
                    value={formData.giaBanSo}
                    onChange={handleInputChange}
                    required
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Giá Gốc Niêm Yết (VND)</label>
                  <input
                    type="number"
                    name="giaGocSo"
                    value={formData.giaGocSo}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>URL Hình Ảnh Sản Phẩm *</label>
                <input
                  type="text"
                  name="hinhAnh"
                  value={formData.hinhAnh}
                  onChange={handleInputChange}
                  placeholder="https://..."
                  required
                />
              </div>

              <div className="form-group-grid">
                <div className="form-group">
                  <label>Thương Hiệu / Danh Mục</label>
                  <input
                    type="text"
                    name="danhMuc"
                    value={formData.danhMuc}
                    onChange={handleInputChange}
                    placeholder="VD: Apple, Samsung, Xiaomi..."
                  />
                </div>
                <div className="form-group">
                  <label>Số Lượng Tồn Kho</label>
                  <input
                    type="number"
                    name="stockQuantity"
                    value={formData.stockQuantity}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>
              </div>

              <div className="form-checkbox-row">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  id="prodIsActive"
                />
                <label htmlFor="prodIsActive">
                  Sản phẩm đang kinh doanh (Hiển thị cho khách hàng đặt mua)
                </label>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="admin-btn-secondary" onClick={() => { if (!saving) setIsModalOpen(false); }}>
                  Hủy
                </button>
                <button type="submit" className="admin-btn-primary" disabled={saving} aria-busy={saving}>
                  {saving ? <><IoRefreshOutline className="admin-action-spinner" /> Đang lưu…</> : <>
                  <IoCheckmarkCircleOutline style={{ fontSize: '1.1rem' }} />
                  {isEditMode ? 'Lưu Thay Đổi' : 'Thêm Sản Phẩm'}
                </>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
