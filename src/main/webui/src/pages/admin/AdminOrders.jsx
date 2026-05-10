import { useState, useEffect } from 'react';
import { fetchApi } from '../../api/apiClient';
import { fmt } from '../../utils/utils';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    loadOrders();
  }, []);

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
  };

  const hasActiveFilter = searchTerm || statusFilter !== 'ALL';

  const loadOrders = async () => {
    try {
      const data = await fetchApi('/admin/orders');
      setOrders(data || []);
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      await fetchApi(`/admin/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      loadOrders(); // reload
    } catch (err) {
      alert('Cập nhật trạng thái thất bại: ' + err.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Đang xử lý': return { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', label: 'Đang xử lý' };
      case 'Admin xác nhận & giao': return { bg: 'rgba(59,130,246,0.1)', color: '#3b82f6', label: 'Xác nhận & Giao' };
      case 'Hoàn thành': return { bg: 'rgba(16,185,129,0.1)', color: '#10b981', label: 'Hoàn thành' };
      case 'Đã hủy': return { bg: 'rgba(239,68,68,0.1)', color: '#ef4444', label: 'Đã hủy' };
      default: return { bg: '#f1f5f9', color: '#64748b', label: status || 'Không rõ' };
    }
  };

  if (loading) {
    return (
      <div className="dash-loading">
        <i className="fas fa-spinner fa-spin"></i>
        <span>Đang tải đơn hàng...</span>
      </div>
    );
  }

  // Lọc dữ liệu
  const filteredOrders = orders.filter(o => {
    const matchStatus = statusFilter === 'ALL' || o.status === statusFilter;
    const term = searchTerm.toLowerCase().trim();
    const matchSearch = term === '' ||
      o.id.toString().includes(term) ||
      (o.customerName && o.customerName.toLowerCase().includes(term)) ||
      (o.customerPhone && o.customerPhone.includes(term)) ||
      (o.customerAddress && o.customerAddress.toLowerCase().includes(term));
    return matchStatus && matchSearch;
  });

  return (
    <div>
      <div className="dash-page-header">
        <div>
          <h1 className="dash-title">Quản Lý Đơn Hàng</h1>
          <p className="dash-subtitle">Duyệt và cập nhật trạng thái đơn hàng của khách</p>
        </div>
      </div>
      
      <div className="admin-card">
        <div style={{padding: '16px', borderBottom: '1px solid var(--admin-border)', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center'}}>
          <input
            type="text"
            placeholder="Tìm theo Mã đơn, Tên, SĐT, Địa chỉ..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{padding: '10px 14px', flex: '1', minWidth: '220px', borderRadius: '8px', border: '1px solid var(--admin-border)', outline: 'none', background: 'var(--admin-bg)', color: 'var(--admin-text-main)'}}
          />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--admin-border)', outline: 'none', background: 'var(--admin-bg)', color: 'var(--admin-text-main)'}}
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="Đang xử lý">Đang xử lý</option>
            <option value="Admin xác nhận & giao">Xác nhận & Giao</option>
            <option value="Hoàn thành">Hoàn thành</option>
            <option value="Đã hủy">Đã hủy</option>
          </select>
          {hasActiveFilter && (
            <button
              onClick={handleResetFilters}
              style={{padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--admin-border)', background: 'rgba(239,68,68,0.1)', color: '#ef4444', cursor: 'pointer', whiteSpace: 'nowrap'}}
            >
              <i className="fas fa-times" style={{marginRight: '6px'}}></i>Xóa lọc
            </button>
          )}
          <span style={{fontSize: '0.85rem', color: 'var(--admin-text-muted)', whiteSpace: 'nowrap', marginLeft: 'auto'}}>
            {filteredOrders.length} / {orders.length} đơn hàng
          </span>
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>Mã Đơn</th>
              <th>Khách Hàng</th>
              <th>Tổng Tiền</th>
              <th>Thanh Toán</th>
              <th>Trạng Thái</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(o => {
              const st = getStatusColor(o.status);
              return (
                <tr key={o.id}>
                  <td><strong>#{o.id}</strong><div style={{fontSize:'0.75rem',color:'var(--admin-text-muted)'}}>{new Date(o.createdAt).toLocaleDateString('vi-VN')}</div></td>
                  <td>
                    <div style={{fontWeight: 600}}>{o.customerName}</div>
                    <div style={{fontSize: '0.8rem', color: 'var(--admin-text-muted)'}}>{o.customerPhone}</div>
                  </td>
                  <td style={{fontWeight: 700, color: 'var(--admin-orange)'}}>{fmt(o.finalAmount)}</td>
                  <td>{o.paymentMethod || 'COD'}</td>
                  <td>
                    <span className="status-badge" style={{background: st.bg, color: st.color}}>
                      {st.label}
                    </span>
                  </td>
                  <td>
                    <div style={{display: 'flex', gap: '8px'}}>
                      {o.status === 'Đang xử lý' && (
                        <>
                          <button 
                            className="btn btn-sm btn-primary" 
                            style={{padding: '4px 8px', fontSize: '0.8rem'}}
                            onClick={() => updateStatus(o.id, 'Admin xác nhận & giao')}
                          >
                            <i className="fas fa-check" style={{marginRight: '4px'}}></i>Xác nhận
                          </button>
                          <button 
                            className="btn btn-sm btn-danger" 
                            style={{padding: '4px 8px', fontSize: '0.8rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px'}}
                            onClick={() => updateStatus(o.id, 'Đã hủy')}
                          >
                            <i className="fas fa-times" style={{marginRight: '4px'}}></i>Hủy
                          </button>
                        </>
                      )}
                      
                      {o.status === 'Admin xác nhận & giao' && (
                        <>
                          <button 
                            className="btn btn-sm" 
                            style={{padding: '4px 8px', fontSize: '0.8rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px'}}
                            onClick={() => updateStatus(o.id, 'Hoàn thành')}
                          >
                            <i className="fas fa-box-check" style={{marginRight: '4px'}}></i>Đã giao
                          </button>
                          <button 
                            className="btn btn-sm btn-danger" 
                            style={{padding: '4px 8px', fontSize: '0.8rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px'}}
                            onClick={() => updateStatus(o.id, 'Đã hủy')}
                          >
                            <i className="fas fa-times" style={{marginRight: '4px'}}></i>Hủy
                          </button>
                        </>
                      )}

                      {(o.status === 'Hoàn thành' || o.status === 'Đã hủy') && (
                        <span style={{fontSize: '0.8rem', color: 'var(--admin-text-muted)'}}>
                          -
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan="6" style={{textAlign: 'center', padding: '30px', color: 'var(--admin-text-muted)'}}>
                  Không tìm thấy đơn hàng nào phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
