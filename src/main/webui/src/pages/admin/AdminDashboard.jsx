import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchApi } from '../../api/apiClient';
import { fmt } from '../../utils/utils';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const STATUS_COLORS = {
  'Đang xử lý': '#f59e0b',
  'Admin xác nhận & giao': '#3b82f6',
  'Hoàn thành': '#10b981',
  'Đã hủy': '#ef4444',
};

// ... (keep safeFetch or just use fetchApi since we fixed the issue)
export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [noAuth, setNoAuth] = useState(false);

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem('pz_token');
      if (!token) {
        setNoAuth(true);
        setLoading(false);
        return;
      }

      try {
        const [ordersData, productsData] = await Promise.all([
          fetchApi('/admin/orders'),
          fetchApi('/products?page=0&size=2000&sort=default'),
        ]);

        if (!ordersData && !productsData) {
          setNoAuth(true);
        } else {
          setOrders(Array.isArray(ordersData) ? ordersData : []);
          // API trả về { data: [...], totalPages, ... } — không phải .content
          const prods = productsData?.data || (Array.isArray(productsData) ? productsData : []);
          setProducts(prods);
        }
      } catch (err) {
        setNoAuth(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="dash-loading" style={{minHeight: '400px', justifyContent: 'center'}}>
        <i className="fas fa-spinner fa-spin" style={{fontSize: '2.5rem', color: 'var(--admin-orange)'}}></i>
        <span style={{fontSize: '1rem', marginTop: '10px'}}>Đang tải dữ liệu...</span>
      </div>
    );
  }

  if (noAuth) {
    return (
      <div className="dash-empty" style={{minHeight: '400px', justifyContent: 'center'}}>
        <i className="fas fa-lock" style={{color: 'var(--admin-orange)', opacity: 1}}></i>
        <h3 style={{color: 'var(--admin-text-main)', marginTop: '8px'}}>Cần đăng nhập</h3>
        <p>Bạn cần đăng nhập bằng tài khoản Quản trị để xem dữ liệu.</p>
      </div>
    );
  }

  // --- STATS ---
  const completedOrders = orders.filter(o => o.status === 'Hoàn thành');
  const totalRevenue    = completedOrders.reduce((s, o) => s + (o.finalAmount || 0), 0);
  const pendingCount    = orders.filter(o => o.status === 'Đang xử lý').length;
  const completedCount  = completedOrders.length;
  const cancelledCount  = orders.filter(o => o.status === 'Đã hủy').length;
  const activeProducts  = products.filter(p => p.isActive !== false).length;

  const recentOrders    = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6);
  const lowStockProducts = products.filter(p => (p.stockQuantity || 0) < 10).slice(0, 5);

  const statCards = [
    { icon: 'fa-chart-line',   color: 'sc-orange', label: 'Doanh Thu (Hoàn Thành)', sub: `${completedCount} đơn hoàn thành`, value: fmt(totalRevenue), small: true },
    { icon: 'fa-box',          color: 'sc-purple',  label: 'Sản Phẩm',              sub: `${activeProducts}/${products.length} đang bán`,  value: products.length },
    { icon: 'fa-clock',        color: 'sc-yellow',  label: 'Chờ Xử Lý',             sub: 'Cần xác nhận',                                   value: pendingCount },
    { icon: 'fa-check-circle', color: 'sc-green',   label: 'Đơn Hoàn Thành',        sub: 'Giao thành công',                                value: completedCount },
    { icon: 'fa-shopping-bag', color: 'sc-blue',    label: 'Tổng Đơn Hàng',         sub: `${cancelledCount} đã hủy`,                       value: orders.length },
  ];

  // --- CHART DATA ---
  
  // 1. Doughnut Chart (Order Status)
  const statusCounts = {
    'Đang xử lý': 0,
    'Admin xác nhận & giao': 0,
    'Hoàn thành': 0,
    'Đã hủy': 0
  };
  orders.forEach(o => {
    if (statusCounts[o.status] !== undefined) statusCounts[o.status]++;
  });

  const doughnutData = {
    labels: Object.keys(statusCounts),
    datasets: [{
      data: Object.values(statusCounts),
      backgroundColor: ['#f59e0b', '#3b82f6', '#10b981', '#ef4444'],
      borderWidth: 0,
      hoverOffset: 4
    }]
  };

  const doughnutOptions = {
    cutout: '70%',
    plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } } }
  };

  // 2. Bar Chart (Revenue by last 7 days)
  // Dùng ISO date string (YYYY-MM-DD) để tránh lỗi locale format mismatch
  const getDateKey = (dateStr) => {
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}`;
  };

  const last7Days = Array.from({length: 7}, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}`;
  });

  const revenueByDay = Array(7).fill(0);
  const ordersByDay = Array(7).fill(0);
  orders.forEach(o => {
    if (o.status === 'Hoàn thành' && o.createdAt) {
      const dayKey = getDateKey(o.createdAt);
      const index = last7Days.indexOf(dayKey);
      if (index !== -1) {
        revenueByDay[index] += o.finalAmount || 0;
        ordersByDay[index] += 1;
      }
    }
  });

  const barData = {
    labels: last7Days,
    datasets: [{
      label: 'Doanh thu (VND)',
      data: revenueByDay,
      backgroundColor: 'rgba(249, 115, 22, 0.8)',
      borderRadius: 4
    }]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: { beginAtZero: true, ticks: { callback: (val) => val.toLocaleString('vi-VN') } }
    }
  };

  return (
    <div>
      {/* PAGE HEADER */}
      <div className="dash-page-header">
        <div>
          <h1 className="dash-title">Dashboard</h1>
          <p className="dash-subtitle">Tổng quan hoạt động kinh doanh PhoneZone</p>
        </div>
        <Link to="/admin/orders" className="dash-view-all-btn">
          <i className="fas fa-list"></i> Xem tất cả đơn hàng
        </Link>
      </div>

      {/* STAT CARDS */}
      <div className="stat-cards-wrapper">
        {statCards.map((card, i) => (
          <div key={i} className="stat-card">
            <div className={`stat-icon ${card.color}`}><i className={`fas ${card.icon}`}></i></div>
            <div className="stat-title">{card.label}</div>
            <div className="stat-subtitle">{card.sub}</div>
            <div className="stat-value" style={card.small ? {fontSize: '1.1rem'} : {}}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* CHARTS GRID */}
      <div className="dashboard-grid" style={{marginBottom: '20px'}}>
        <div className="admin-card" style={{padding: '20px'}}>
          <h3 style={{marginBottom: '20px', color: 'var(--admin-text-main)'}}>Biểu Đồ Doanh Thu (7 Ngày Qua)</h3>
          <div style={{height: '300px'}}>
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
        
        <div className="admin-card" style={{padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <h3 style={{marginBottom: '20px', color: 'var(--admin-text-main)', width: '100%', textAlign: 'left'}}>Tỷ Lệ Trạng Thái Đơn Hàng</h3>
          <div style={{height: '250px', width: '250px'}}>
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="dashboard-grid">
        {/* LEFT */}
        <div className="dashboard-left">

          {/* Recent Orders Table */}
          <div className="admin-card">
            <div className="card-header">
              <div className="card-title">
                <i className="fas fa-receipt" style={{color: 'var(--admin-orange)', marginRight: '8px'}}></i>
                Đơn Hàng Gần Đây
              </div>
              <Link to="/admin/orders" className="card-action">Xem tất cả →</Link>
            </div>
            {recentOrders.length === 0 ? (
              <div className="dash-empty"><i className="fas fa-inbox"></i> Chưa có đơn hàng nào</div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Mã đơn</th>
                    <th>Ngày đặt</th>
                    <th>Tổng tiền</th>
                    <th>Thanh toán</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(order => (
                    <tr key={order.id}>
                      <td style={{fontWeight: '700', color: 'var(--admin-orange)'}}>#{order.id}</td>
                      <td>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                      <td style={{fontWeight: '700'}}>{fmt(order.finalAmount)}</td>
                      <td>
                        <span className={`pm-tag ${order.paymentMethod === 'VNPAY' ? 'pm-vnpay' : 'pm-cod'}`}>
                          {order.paymentMethod}
                        </span>
                      </td>
                      <td>
                        <span className="status-badge" style={{
                          background: `${STATUS_COLORS[order.status] || '#64748b'}22`,
                          color: STATUS_COLORS[order.status] || '#64748b',
                        }}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className="dashboard-right">
          {/* Low Stock Warning */}
          {lowStockProducts.length > 0 && (
            <div className="admin-card">
              <div className="card-header">
                <div className="card-title">
                  <i className="fas fa-exclamation-triangle" style={{color: '#f59e0b', marginRight: '8px'}}></i>
                  Sản Phẩm Sắp Hết Hàng
                </div>
                <Link to="/admin/products" className="card-action">Quản lý →</Link>
              </div>
              <div className="stock-list">
                {lowStockProducts.map(p => (
                  <div key={p.id} className="stock-item">
                    <img src={p.hinhAnh || p.img || 'https://via.placeholder.com/44'} alt={p.tenSanPham || p.name} />
                    <div className="stock-info">
                      <div className="stock-name">{p.tenSanPham || p.name}</div>
                      <div className="stock-price">{fmt(p.giaBanSo || p.price)}</div>
                    </div>
                    <div className="stock-qty" style={{
                      color: (p.stockQuantity || 0) === 0 ? '#ef4444' : '#f59e0b',
                      background: (p.stockQuantity || 0) === 0 ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                    }}>
                      {(p.stockQuantity || 0) === 0 ? 'Hết hàng' : `Còn ${p.stockQuantity}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="admin-card">
            <div className="card-header">
              <div className="card-title">Thao Tác Nhanh</div>
            </div>
            <div className="quick-actions">
              <Link to="/admin/products" className="quick-action-btn qa-blue">
                <i className="fas fa-plus-circle"></i> Thêm Sản Phẩm
              </Link>
              <Link to="/admin/orders" className="quick-action-btn qa-orange">
                <i className="fas fa-boxes"></i> Quản Lý Đơn
              </Link>
              <Link to="/admin/users" className="quick-action-btn qa-green">
                <i className="fas fa-users"></i> Khách Hàng
              </Link>
              <Link to="/" className="quick-action-btn qa-purple">
                <i className="fas fa-store"></i> Về Cửa Hàng
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
