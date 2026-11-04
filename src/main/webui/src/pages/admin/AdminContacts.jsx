import { useState, useEffect } from 'react';
import { fetchApi } from '../../api/apiClient';
import {
  IoMailOutline,
  IoSearchOutline,
  IoCloseOutline,
  IoRefreshOutline,
  IoTrashOutline,
  IoChatbubbleEllipsesOutline,
  IoPersonOutline,
  IoCallOutline
} from 'react-icons/io5';

const CONTACT_STATUS_MAP = {
  NEW: { label: 'Mới gửi', color: '#1d6ef5', bg: 'rgba(29, 110, 245, 0.12)' },
  READ: { label: 'Đã xem', color: '#64748b', bg: 'rgba(100, 116, 139, 0.12)' },
  RESOLVED: { label: 'Đã giải quyết', color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)' },
};

export default function AdminContacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const loadContacts = async () => {
    setLoading(true);
    try {
      const data = await fetchApi('/admin/contacts');
      setContacts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      await fetchApi(`/admin/contacts/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      loadContacts();
    } catch (e) {
      alert(e.message || 'Cập nhật trạng thái thất bại');
    }
  };

  const deleteContact = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tin nhắn này?')) return;
    try {
      await fetchApi(`/admin/contacts/${id}`, { method: 'DELETE' });
      loadContacts();
    } catch (e) {
      alert(e.message || 'Xóa tin nhắn thất bại');
    }
  };

  const filtered = contacts.filter(c => {
    const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const term = searchTerm.toLowerCase().trim();
    const matchSearch = term === '' ||
      (c.name && c.name.toLowerCase().includes(term)) ||
      (c.email && c.email.toLowerCase().includes(term)) ||
      (c.phone && c.phone.includes(term)) ||
      (c.message && c.message.toLowerCase().includes(term));
    return matchStatus && matchSearch;
  });

  return (
    <div className="admin-contacts-page">
      {/* ── HEADER ── */}
      <div className="dash-page-header">
        <div>
          <h1 className="dash-title">Tin Nhắn Khách Hàng</h1>
          <p className="dash-subtitle">Tiếp nhận yêu cầu tư vấn, giải đáp thắc mắc và liên hệ báo giá từ khách</p>
        </div>
        <button
          type="button"
          className="admin-btn-secondary"
          onClick={loadContacts}
          title="Làm mới"
        >
          <IoRefreshOutline style={{ fontSize: '1.1rem' }} />
          <span>Làm mới</span>
        </button>
      </div>

      <div className="admin-card">
        {/* Filter bar */}
        <div className="admin-table-filter-bar">
          <div className="admin-filter-search-box">
            <IoSearchOutline className="filter-search-icon" />
            <input
              type="text"
              placeholder="Tìm theo Tên khách, Email, SĐT, Nội dung..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                className="filter-clear-btn"
                onClick={() => setSearchTerm('')}
              >
                <IoCloseOutline />
              </button>
            )}
          </div>

          <div className="admin-filter-select-box">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="ALL">Tất cả trạng thái tin nhắn</option>
              <option value="NEW">Mới gửi (Chưa xử lý)</option>
              <option value="READ">Đã xem</option>
              <option value="RESOLVED">Đã giải quyết</option>
            </select>
          </div>

          {(searchTerm || statusFilter !== 'ALL') && (
            <button
              type="button"
              onClick={() => { setSearchTerm(''); setStatusFilter('ALL'); }}
              className="admin-filter-reset-pill"
            >
              <IoCloseOutline style={{ fontSize: '1.1rem' }} />
              <span>Xóa lọc</span>
            </button>
          )}

          <div className="admin-table-count">
            Hiển thị <strong>{filtered.length}</strong> / {contacts.length} tin nhắn
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="dash-loading-screen">
            <div className="dash-spinner"></div>
            <span>Đang tải tin nhắn...</span>
          </div>
        ) : (
          <div className="admin-table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Khách Hàng</th>
                  <th>Thông Tin Liên Hệ</th>
                  <th>Dịch Vụ / Ngân Sách</th>
                  <th>Nội Dung Tin Nhắn</th>
                  <th>Thời Gian</th>
                  <th>Trạng Thái</th>
                  <th style={{ textAlign: 'center' }}>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => {
                  const st = CONTACT_STATUS_MAP[c.status] || { label: c.status, color: '#64748b', bg: '#f1f5f9' };
                  return (
                    <tr key={c.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--admin-text-main)' }}>
                          {c.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>
                          ID: #{c.id}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem' }}>{c.email}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>{c.phone || '-'}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--admin-primary)', fontSize: '0.85rem' }}>
                          {c.service || 'Tư vấn chung'}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>
                          {c.budget ? `Ngân sách: ${c.budget}` : '-'}
                        </div>
                      </td>
                      <td>
                        <div style={{ maxWidth: '320px', fontSize: '0.85rem', color: 'var(--admin-text-main)', lineHeight: '1.4' }}>
                          {c.message}
                        </div>
                      </td>
                      <td>
                        <div className="order-time-text">
                          {new Date(c.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>
                          {new Date(c.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td>
                        <select
                          value={c.status}
                          onChange={(e) => updateStatus(c.id, e.target.value)}
                          className="admin-status-select"
                          style={{ color: st.color, backgroundColor: st.bg, borderColor: st.color }}
                        >
                          <option value="NEW">Mới gửi</option>
                          <option value="READ">Đã xem</option>
                          <option value="RESOLVED">Đã giải quyết</option>
                        </select>
                      </td>
                      <td>
                        <div className="admin-actions-cell" style={{ justifyContent: 'center' }}>
                          <button
                            type="button"
                            className="admin-action-btn danger"
                            onClick={() => deleteContact(c.id)}
                            title="Xóa tin nhắn"
                          >
                            <IoTrashOutline />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--admin-text-muted)' }}>
                      Không tìm thấy tin nhắn liên hệ nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
