import { useState, useEffect } from 'react';
import { fetchApi } from '../../api/apiClient';
import { fmt } from '../../utils/utils';

export default function AdminRepairs() {
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadRepairs = async () => {
    setLoading(true);
    try {
      const data = await fetchApi('/repairs/admin/all?size=100');
      if (data && data.repairs) {
        setRepairs(data.repairs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRepairs();
  }, []);

  const updateStatus = async (id, newStatus) => {
    if (!window.confirm(`Chuyển trạng thái sang ${newStatus}?`)) return;
    try {
      await fetchApi(`/repairs/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      loadRepairs();
    } catch (e) {
      alert(e.message);
    }
  };

  const deleteRepair = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa yêu cầu này?')) return;
    try {
      await fetchApi(`/repairs/${id}`, { method: 'DELETE' });
      loadRepairs();
    } catch (e) {
      alert(e.message);
    }
  };

  const filtered = repairs.filter(r =>
    r.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.customerPhone?.includes(searchTerm)
  );

  return (
    <div>
      <div className="dash-page-header">
        <div>
          <h1 className="dash-title">Quản Lý Lịch Sửa Chữa</h1>
          <p className="dash-subtitle">Xác nhận, theo dõi và hủy lịch hẹn sửa chữa thiết bị</p>
        </div>
      </div>

      <div className="admin-card">
        <div style={{padding: '16px', borderBottom: '1px solid var(--admin-border)'}}>
          <input
            type="text"
            placeholder="Tìm tên khách hàng, số điện thoại..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{padding: '10px', width: '300px', borderRadius: '8px', border: '1px solid var(--admin-border)'}}
          />
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Khách Hàng</th>
              <th>Thiết Bị</th>
              <th>Dịch Vụ</th>
              <th>Chi Phí (Dự kiến)</th>
              <th>Trạng Thái</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id}>
                <td>#{r.id}</td>
                <td>
                  <div style={{fontWeight: 'bold'}}>{r.customerName}</div>
                  <div style={{fontSize: '0.85rem', color: '#666'}}>{r.customerPhone}</div>
                </td>
                <td>
                  <div>{r.deviceType} - {r.deviceModel}</div>
                  <div style={{fontSize: '0.85rem', color: '#eab308'}}>{r.issueDescription}</div>
                </td>
                <td>{r.repairService}</td>
                <td style={{color: 'red', fontWeight: 'bold'}}>{r.estimatedCost ? fmt(r.estimatedCost) : 'Chưa báo giá'}</td>
                <td>
                  <span className={`status-badge ${r.status}`}>
                    {r.status === 'PENDING' ? 'Chờ xác nhận' :
                     r.status === 'CONFIRMED' ? 'Đã xác nhận' :
                     r.status === 'IN_PROGRESS' ? 'Đang sửa' :
                     r.status === 'COMPLETED' ? 'Hoàn thành' : 'Đã hủy'}
                  </span>
                </td>
                <td>
                  <div style={{display: 'flex', gap: '5px', alignItems: 'center'}}>
                    {r.status === 'PENDING' && (
                      <button onClick={() => updateStatus(r.id, 'CONFIRMED')} style={{padding: '5px 10px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem'}}>
                        <i className="fas fa-check"></i> Xác nhận
                      </button>
                    )}
                    {(r.status === 'CONFIRMED' || r.status === 'IN_PROGRESS') && (
                      <button onClick={() => updateStatus(r.id, 'COMPLETED')} style={{padding: '5px 10px', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem'}}>
                        <i className="fas fa-check-circle"></i> Hoàn thành
                      </button>
                    )}
                    {(r.status !== 'CANCELLED' && r.status !== 'COMPLETED') && (
                      <button onClick={() => updateStatus(r.id, 'CANCELLED')} style={{padding: '5px 10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem'}}>
                        Hủy
                      </button>
                    )}
                    <button onClick={() => deleteRepair(r.id)} style={{color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', padding: '5px', marginLeft: '5px'}} title="Xóa">
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan="7" style={{textAlign: 'center', padding: '20px'}}>Không có lịch sửa chữa nào</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
