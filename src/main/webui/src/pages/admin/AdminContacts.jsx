import { useState, useEffect } from 'react';
import { fetchApi } from '../../api/apiClient';

export default function AdminContacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadContacts = async () => {
    setLoading(true);
    try {
      const data = await fetchApi('/admin/contacts');
      setContacts(data || []);
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
      alert(e.message);
    }
  };

  const deleteContact = async (id) => {
    if (!window.confirm('Xóa tin nhắn này?')) return;
    try {
      await fetchApi(`/admin/contacts/${id}`, { method: 'DELETE' });
      loadContacts();
    } catch (e) {
      alert(e.message);
    }
  };

  const filtered = contacts.filter(c =>
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="dash-page-header">
        <div>
          <h1 className="dash-title">Tin nhắn liên hệ</h1>
          <p className="dash-subtitle">Phản hồi và quản lý tin nhắn từ khách hàng</p>
        </div>
      </div>

      <div className="admin-card">
        <div style={{padding: '16px', borderBottom: '1px solid var(--admin-border)'}}>
          <input
            type="text"
            placeholder="Tìm theo tên hoặc email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{padding: '10px', width: '300px', borderRadius: '8px', border: '1px solid var(--admin-border)'}}
          />
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>Khách Hàng</th>
              <th>Liên Hệ</th>
              <th>Dịch vụ / Ngân sách</th>
              <th>Nội Dung</th>
              <th>Ngày Gửi</th>
              <th>Trạng Thái</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id}>
                <td style={{fontWeight: 'bold'}}>{c.name}</td>
                <td>
                  <div>{c.email}</div>
                  <div style={{fontSize: '0.85rem', color: '#666'}}>{c.phone}</div>
                </td>
                <td>
                  <div><span style={{fontWeight: 600, color: 'var(--primary)'}}>{c.service || 'Chưa chọn'}</span></div>
                  <div style={{fontSize: '0.85rem', color: '#666'}}>{c.budget || 'Không rõ'}</div>
                </td>
                <td style={{maxWidth: '300px', whiteSpace: 'normal'}}>{c.message}</td>
                <td>{new Date(c.createdAt).toLocaleDateString('vi-VN')}</td>
                <td>
                  <select 
                    value={c.status} 
                    onChange={(e) => updateStatus(c.id, e.target.value)}
                    style={{
                      padding: '5px', borderRadius: '5px', 
                      background: c.status === 'NEW' ? '#fee2e2' : c.status === 'READ' ? '#fef3c7' : '#d1fae5'
                    }}
                  >
                    <option value="NEW">Mới</option>
                    <option value="READ">Đã đọc</option>
                    <option value="RESOLVED">Đã xử lý</option>
                  </select>
                </td>
                <td>
                  <button onClick={() => deleteContact(c.id)} style={{color: 'red', background: 'none', border: 'none', cursor: 'pointer'}}><i className="fas fa-trash"></i></button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan="6" style={{textAlign: 'center', padding: '20px'}}>Không có tin nhắn nào</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
