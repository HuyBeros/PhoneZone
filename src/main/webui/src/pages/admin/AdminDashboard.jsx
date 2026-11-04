import { fetchAllAdminProducts } from '../../api/adminProducts';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchApi } from '../../api/apiClient';
import { fmt } from '../../utils/utils';
import {
  Chart as ChartJS,
  registerables
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  IoTrendingUpOutline,
  IoPhonePortraitOutline,
  IoTimeOutline,
  IoCheckmarkCircleOutline,
  IoBagHandleOutline,
  IoReceiptOutline,
  IoArrowForwardOutline,
  IoAlertCircleOutline,
  IoLockClosedOutline,
  IoRefreshOutline,
  IoBarChartOutline,
  IoStatsChartOutline,
  IoPieChartOutline,
  IoWalletOutline
} from 'react-icons/io5';

// Đăng ký toàn bộ registerables (controllers, scales, elements, plugins) để tránh lỗi thiếu controller
ChartJS.register(...registerables);

const STATUS_CONFIG = {
  'Đang xử lý': { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)', label: 'Đang xử lý' },
  'Admin xác nhận & giao': { color: '#1d6ef5', bg: 'rgba(29, 110, 245, 0.12)', label: 'Xác nhận & Giao' },
  'Hoàn thành': { color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)', label: 'Hoàn thành' },
  'Đã hủy': { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)', label: 'Đã hủy' },
};

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [noAuth, setNoAuth] = useState(false);

  // Chart configuration state
  const [chartType, setChartType] = useState('line'); // 'line' | 'bar'
  const [timeRange, setTimeRange] = useState(7); // 7 | 14 | 30 days

  const loadData = async () => {
    const token = localStorage.getItem('pz_token');
    if (!token) {
      setNoAuth(true);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [ordersData, productsData] = await Promise.all([
        fetchApi('/admin/orders'),
        fetchAllAdminProducts(),
      ]);

      if (!ordersData && !productsData) {
        setNoAuth(true);
      } else {
        setOrders(Array.isArray(ordersData) ? ordersData : []);
        const prods = productsData?.data || (Array.isArray(productsData) ? productsData : []);
        setProducts(prods);
        setNoAuth(false);
      }
    } catch (err) {
      console.error(err);
      setNoAuth(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="dash-loading-screen">
        <div className="dash-spinner"></div>
        <span>Đang khởi tạo biểu đồ và dữ liệu quản trị PhoneZone...</span>
      </div>
    );
  }

  if (noAuth) {
    return (
      <div className="dash-empty-state">
        <IoLockClosedOutline className="dash-empty-icon lock" />
        <h3>Yêu cầu quyền Quản trị viên</h3>
        <p>Vui lòng đăng nhập bằng tài khoản Quản trị để truy cập dữ liệu Dashboard.</p>
        <Link to="/login" className="admin-btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          Đến trang đăng nhập
        </Link>
      </div>
    );
  }

  // --- STATS CALCULATION ---
  const completedOrders = orders.filter(o => o.status === 'Hoàn thành');
  const totalRevenue    = completedOrders.reduce((s, o) => s + (o.finalAmount || 0), 0);
  const pendingCount    = orders.filter(o => o.status === 'Đang xử lý').length;
  const deliveringCount = orders.filter(o => o.status === 'Admin xác nhận & giao').length;
  const completedCount  = completedOrders.length;
  const cancelledCount  = orders.filter(o => o.status === 'Đã hủy').length;
  const activeProducts  = products.filter(p => p.isActive !== false).length;

  const recentOrders     = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6);
  const lowStockProducts = products.filter(p => (p.stockQuantity || 0) < 15).slice(0, 5);

  const statCards = [
    {
      icon: <IoTrendingUpOutline />,
      colorClass: 'sc-blue',
      label: 'Doanh Thu (Hoàn Tất)',
      sub: `${completedCount} đơn giao thành công`,
      value: fmt(totalRevenue),
      isCurrency: true
    },
    {
      icon: <IoPhonePortraitOutline />,
      colorClass: 'sc-purple',
      label: 'Sản Phẩm Đang Bán',
      sub: `${activeProducts} / ${products.length} đang hiển thị`,
      value: products.length
    },
    {
      icon: <IoTimeOutline />,
      colorClass: 'sc-amber',
      label: 'Chờ Xử Lý',
      sub: 'Cần xác nhận ngay',
      value: pendingCount
    },
    {
      icon: <IoCheckmarkCircleOutline />,
      colorClass: 'sc-emerald',
      label: 'Đơn Hoàn Thành',
      sub: `${deliveringCount} đơn đang giao`,
      value: completedCount
    },
    {
      icon: <IoBagHandleOutline />,
      colorClass: 'sc-cyan',
      label: 'Tổng Đơn Hàng',
      sub: `${cancelledCount} đơn đã hủy`,
      value: orders.length
    },
  ];

  // --- CHARTJS 1: DOANH THU THEO KHOẢNG THỜI GIAN (LINE / BAR) ---
  const getDateKey = (dateStr) => {
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
  };

  const timeRangeDays = Array.from({ length: timeRange }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (timeRange - 1 - i));
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  const revenueByDay = Array(timeRange).fill(0);
  const ordersCountByDay = Array(timeRange).fill(0);

  orders.forEach(o => {
    if (o.status === 'Hoàn thành' && o.createdAt) {
      const dayKey = getDateKey(o.createdAt);
      const index = timeRangeDays.indexOf(dayKey);
      if (index !== -1) {
        revenueByDay[index] += o.finalAmount || 0;
        ordersCountByDay[index] += 1;
      }
    }
  });

  const rangeTotalRevenue = revenueByDay.reduce((a, b) => a + b, 0);
  const maxDayRevenue = Math.max(...revenueByDay, 0);

  // Dữ liệu biểu đồ Doanh thu (Chart.js)
  const revenueChartData = {
    labels: timeRangeDays,
    datasets: [{
      label: 'Doanh thu (VND)',
      data: revenueByDay,
      // Bar styling
      backgroundColor: chartType === 'bar' ? '#1d6ef5' : 'rgba(29, 110, 245, 0.12)',
      hoverBackgroundColor: '#1558c7',
      borderRadius: chartType === 'bar' ? 8 : 0,
      borderSkipped: false,
      barThickness: timeRange > 14 ? 12 : 24,
      // Line styling
      borderColor: '#1d6ef5',
      borderWidth: 3,
      fill: chartType === 'line',
      tension: 0.38,
      pointBackgroundColor: '#ffffff',
      pointBorderColor: '#1d6ef5',
      pointBorderWidth: 2.5,
      pointRadius: timeRange > 14 ? 3 : 5,
      pointHoverRadius: 8,
      pointHoverBackgroundColor: '#1d6ef5',
      pointHoverBorderColor: '#ffffff',
      pointHoverBorderWidth: 3,
    }]
  };

  const revenueChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        titleFont: { family: 'Inter', size: 13, weight: 700 },
        bodyFont: { family: 'Inter', size: 12 },
        padding: 12,
        cornerRadius: 10,
        callbacks: {
          title: (items) => `Ngày ${items[0].label}`,
          label: (item) => ` Doanh thu: ${fmt(item.raw)}`,
          afterLabel: (item) => ` Số đơn: ${ordersCountByDay[item.dataIndex]} đơn giao thành công`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { family: 'Inter', size: 11, weight: 600 }, color: '#64748b' }
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(226, 232, 240, 0.7)' },
        ticks: {
          font: { family: 'Inter', size: 11 },
          color: '#94a3b8',
          callback: (val) => {
            if (val >= 1000000) return (val / 1000000).toFixed(0) + ' Tr';
            if (val > 0) return (val / 1000).toFixed(0) + 'k';
            return '0';
          }
        }
      }
    }
  };

  // --- CHARTJS 2: CƠ CẤU TRẠNG THÁI ĐƠN HÀNG (DOUGHNUT) ---
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
    labels: ['Đang xử lý', 'Xác nhận & Giao', 'Hoàn thành', 'Đã hủy'],
    datasets: [{
      data: [
        statusCounts['Đang xử lý'],
        statusCounts['Admin xác nhận & giao'],
        statusCounts['Hoàn thành'],
        statusCounts['Đã hủy']
      ],
      backgroundColor: ['#f59e0b', '#1d6ef5', '#10b981', '#ef4444'],
      hoverBackgroundColor: ['#d97706', '#1558c7', '#059669', '#dc2626'],
      borderWidth: 2,
      borderColor: '#ffffff',
      hoverOffset: 6
    }]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 14,
          font: { family: 'Inter', size: 12, weight: 600 }
        }
      },
      tooltip: {
        backgroundColor: '#0f172a',
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (context) => {
            const val = context.raw || 0;
            const pct = orders.length > 0 ? ((val / orders.length) * 100).toFixed(1) : 0;
            return ` ${context.label}: ${val} đơn (${pct}%)`;
          }
        }
      }
    }
  };

  // --- CHARTJS 3: PHÂN BỔ SẢN PHẨM THEO THƯƠNG HIỆU (BAR CHART) ---
  const brandCounts = {};
  if (Array.isArray(products)) {
    products.forEach(p => {
      const brand = p?.danhMuc || 'Khác';
      // Rút gọn tên danh mục cho gọn gàng
      const cleanName = brand.replace(' Chính hãng', '').replace(' VN/A', '');
      brandCounts[cleanName] = (brandCounts[cleanName] || 0) + 1;
    });
  }

  const sortedBrands = Object.entries(brandCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8); // Top 8 thương hiệu hàng đầu

  const brandDistribution = {
    labels: sortedBrands.map(item => item[0]),
    data: sortedBrands.map(item => item[1])
  };

  const brandChartData = {
    labels: brandDistribution.labels,
    datasets: [{
      label: 'Số lượng sản phẩm',
      data: brandDistribution.data,
      backgroundColor: [
        '#1d6ef5',
        '#3b82f6',
        '#60a5fa',
        '#8b5cf6',
        '#a855f7',
        '#06b6d4',
        '#10b981',
        '#f59e0b'
      ],
      borderRadius: 6,
      borderSkipped: false
    }]
  };

  const brandChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y', // Biểu đồ cột ngang dễ đọc thương hiệu
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (context) => ` ${context.raw} mẫu sản phẩm trong kho`
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: 'rgba(226, 232, 240, 0.7)' },
        ticks: { font: { family: 'Inter', size: 11 }, precision: 0 }
      },
      y: {
        grid: { display: false },
        ticks: { font: { family: 'Inter', size: 12, weight: 600 }, color: '#334155' }
      }
    }
  };

  // --- CHARTJS 4: PHƯƠNG THỨC THANH TOÁN (DOUGHNUT) ---
  const pmCounts = { COD: 0, VNPAY: 0, MOMO: 0, BANK: 0 };
  if (Array.isArray(orders)) {
    orders.forEach(o => {
      const pm = (o?.paymentMethod || 'COD').toUpperCase();
      if (pmCounts[pm] !== undefined) pmCounts[pm]++;
      else pmCounts['COD']++;
    });
  }

  const paymentDistribution = {
    labels: ['COD (Khi nhận)', 'VNPAY QR', 'Ví MoMo', 'Chuyển khoản'],
    data: [pmCounts.COD, pmCounts.VNPAY, pmCounts.MOMO, pmCounts.BANK]
  };

  const paymentChartData = {
    labels: paymentDistribution.labels,
    datasets: [{
      data: paymentDistribution.data,
      backgroundColor: ['#64748b', '#0ea5e9', '#ec4899', '#10b981'],
      borderWidth: 2,
      borderColor: '#ffffff',
      hoverOffset: 6
    }]
  };

  const paymentChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 12,
          font: { family: 'Inter', size: 11, weight: 600 }
        }
      },
      tooltip: {
        backgroundColor: '#0f172a',
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (context) => ` ${context.label}: ${context.raw} đơn hàng`
        }
      }
    }
  };

  return (
    <div className="admin-dashboard-view">
      {/* ── PAGE HEADER ── */}
      <div className="dash-page-header">
        <div>
          <h1 className="dash-title">Dashboard Tổng Quan</h1>
          <p className="dash-subtitle">Theo dõi hoạt động kinh doanh, doanh thu và dữ liệu biểu đồ ChartJS PhoneZone</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="admin-btn-secondary"
            onClick={loadData}
            title="Làm mới dữ liệu"
          >
            <IoRefreshOutline style={{ fontSize: '1.1rem' }} />
            <span>Làm mới</span>
          </button>
          <Link to="/admin/orders" className="dash-view-all-btn">
            <IoReceiptOutline style={{ fontSize: '1.1rem' }} />
            <span>Quản lý đơn hàng</span>
          </Link>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="stat-cards-wrapper">
        {statCards.map((card, idx) => (
          <div key={idx} className="stat-card">
            <div className={`stat-icon-wrapper ${card.colorClass}`}>
              {card.icon}
            </div>
            <div className="stat-meta">
              <span className="stat-label">{card.label}</span>
              <span className="stat-sub">{card.sub}</span>
            </div>
            <div className={`stat-value ${card.isCurrency ? 'stat-value-currency' : ''}`}>
              {card.value}
            </div>
          </div>
        ))}
      </div>

      {/* ── ROW 1: DOANH THU CHARTJS & CƠ CẤU TRẠNG THÁI ── */}
      <div className="dashboard-charts-grid">
        {/* DOANH THU THEO KHOẢNG THỜI GIAN (CHARTJS LINE/BAR) */}
        <div className="admin-card chart-card">
          <div className="card-header-clean" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IoStatsChartOutline style={{ color: 'var(--admin-primary)', fontSize: '1.25rem' }} />
                <h3 className="chart-heading">Biểu Đồ Doanh Thu ({timeRange} Ngày Qua)</h3>
              </div>
              <p className="chart-subheading">
                Tổng doanh thu: <strong style={{ color: 'var(--admin-primary)' }}>{fmt(rangeTotalRevenue)}</strong>
                {maxDayRevenue > 0 && (
                  <span style={{ marginLeft: '10px', color: '#10b981' }}>
                    · Cao nhất: {fmt(maxDayRevenue)}
                  </span>
                )}
              </p>
            </div>

            {/* Bộ điều khiển biểu đồ ChartJS: Đổi kiểu Line/Bar & Đổi ngày */}
            <div className="chart-controls-group">
              <div className="chart-type-toggle">
                <button
                  type="button"
                  className={`chart-toggle-btn ${chartType === 'line' ? 'active' : ''}`}
                  onClick={() => setChartType('line')}
                  title="Biểu đồ đường cong ChartJS"
                >
                  <IoStatsChartOutline />
                  <span>Đường</span>
                </button>
                <button
                  type="button"
                  className={`chart-toggle-btn ${chartType === 'bar' ? 'active' : ''}`}
                  onClick={() => setChartType('bar')}
                  title="Biểu đồ cột ChartJS"
                >
                  <IoBarChartOutline />
                  <span>Cột</span>
                </button>
              </div>

              <div className="chart-period-selector">
                <button
                  type="button"
                  className={`chart-period-btn ${timeRange === 7 ? 'active' : ''}`}
                  onClick={() => setTimeRange(7)}
                >
                  7 ngày
                </button>
                <button
                  type="button"
                  className={`chart-period-btn ${timeRange === 14 ? 'active' : ''}`}
                  onClick={() => setTimeRange(14)}
                >
                  14 ngày
                </button>
                <button
                  type="button"
                  className={`chart-period-btn ${timeRange === 30 ? 'active' : ''}`}
                  onClick={() => setTimeRange(30)}
                >
                  30 ngày
                </button>
              </div>
            </div>
          </div>

          <div className="chart-canvas-container" style={{ height: '300px', width: '100%' }}>
            {chartType === 'line' ? (
              <Line data={revenueChartData} options={revenueChartOptions} />
            ) : (
              <Bar data={revenueChartData} options={revenueChartOptions} />
            )}
          </div>
        </div>

        {/* TỶ LỆ TRẠNG THÁI ĐƠN HÀNG (CHARTJS DOUGHNUT) */}
        <div className="admin-card chart-card donut-card">
          <div className="card-header-clean">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IoPieChartOutline style={{ color: 'var(--admin-primary)', fontSize: '1.25rem' }} />
              <h3 className="chart-heading">Tỷ Lệ Trạng Thái Đơn</h3>
            </div>
            <p className="chart-subheading">Phân bổ {orders.length} đơn hàng trong hệ thống</p>
          </div>
          <div className="chart-canvas-container" style={{ height: '270px', position: 'relative' }}>
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* ── ROW 2: BIỂU ĐỒ PHÂN BỔ THƯƠNG HIỆU & PHƯƠNG THỨC THANH TOÁN ── */}
      <div className="dashboard-charts-grid" style={{ marginBottom: '24px' }}>
        {/* PHÂN BỔ SẢN PHẨM THEO HÃNG (CHARTJS HORIZONTAL BAR) */}
        <div className="admin-card chart-card">
          <div className="card-header-clean">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IoPhonePortraitOutline style={{ color: 'var(--admin-primary)', fontSize: '1.25rem' }} />
              <h3 className="chart-heading">Cơ Cấu Sản Phẩm Theo Thương Hiệu</h3>
            </div>
            <p className="chart-subheading">Top thương hiệu có số lượng mẫu mã nhiều nhất tại PhoneZone</p>
          </div>
          <div className="chart-canvas-container" style={{ height: '260px', width: '100%' }}>
            <Bar data={brandChartData} options={brandChartOptions} />
          </div>
        </div>

        {/* PHƯƠNG THỨC THANH TOÁN (CHARTJS DOUGHNUT) */}
        <div className="admin-card chart-card donut-card">
          <div className="card-header-clean">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IoWalletOutline style={{ color: 'var(--admin-primary)', fontSize: '1.25rem' }} />
              <h3 className="chart-heading">Phương Thức Thanh Toán</h3>
            </div>
            <p className="chart-subheading">Tỷ lệ thanh toán COD, VNPAY, MoMo, Bank</p>
          </div>
          <div className="chart-canvas-container" style={{ height: '260px', position: 'relative' }}>
            <Doughnut data={paymentChartData} options={paymentChartOptions} />
          </div>
        </div>
      </div>

      {/* ── ROW 3: BẢNG ĐƠN HÀNG GẦN ĐÂY & CẢNH BÁO TỒN KHO ── */}
      <div className="dashboard-tables-grid">
        {/* RECENT ORDERS */}
        <div className="admin-card">
          <div className="card-header-clean" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IoReceiptOutline style={{ color: 'var(--admin-primary)', fontSize: '1.25rem' }} />
              <h3 className="chart-heading">Đơn Hàng Gần Đây</h3>
            </div>
            <Link to="/admin/orders" className="card-action-link">
              Xem tất cả <IoArrowForwardOutline style={{ marginLeft: '4px' }} />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="dash-empty-table">Chưa có đơn hàng nào</div>
          ) : (
            <div className="admin-table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Mã Đơn</th>
                    <th>Khách Hàng</th>
                    <th>Tổng Tiền</th>
                    <th>Thanh Toán</th>
                    <th>Trạng Thái</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(order => {
                    const st = STATUS_CONFIG[order.status] || { color: '#64748b', bg: '#f1f5f9', label: order.status };
                    return (
                      <tr key={order.id}>
                        <td>
                          <span className="order-id-badge">#{order.id}</span>
                          <div className="order-time-text">
                            {new Date(order.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                          </div>
                        </td>
                        <td>
                          <div className="customer-cell-name">{order.customerName}</div>
                          <div className="customer-cell-phone">{order.customerPhone}</div>
                        </td>
                        <td>
                          <span className="order-amount-text">{fmt(order.finalAmount)}</span>
                        </td>
                        <td>
                          <span className="payment-method-pill">{order.paymentMethod || 'COD'}</span>
                        </td>
                        <td>
                          <span
                            className="status-pill"
                            style={{ color: st.color, backgroundColor: st.bg }}
                          >
                            {st.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* LOW STOCK ALERT */}
        <div className="admin-card">
          <div className="card-header-clean" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IoAlertCircleOutline style={{ color: '#f59e0b', fontSize: '1.25rem' }} />
              <h3 className="chart-heading">Cảnh Báo Tồn Kho (&lt; 15)</h3>
            </div>
            <Link to="/admin/products" className="card-action-link">
              Quản lý kho <IoArrowForwardOutline style={{ marginLeft: '4px' }} />
            </Link>
          </div>

          {lowStockProducts.length === 0 ? (
            <div className="dash-empty-table">Tồn kho các mặt hàng đều ổn định</div>
          ) : (
            <div className="admin-table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Sản Phẩm</th>
                    <th>Giá Bán</th>
                    <th>Kho</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockProducts.map(p => (
                    <tr key={p.id}>
                      <td>
                        <div className="product-compact-cell">
                          <img
                            src={p.hinhAnh}
                            alt={p.tenSanPham}
                            onError={(e) => { e.target.src = 'https://placehold.co/40x40?text=Phone'; }}
                          />
                          <div>
                            <div className="p-title" title={p.tenSanPham}>{p.tenSanPham}</div>
                            <div className="p-sub">{p.danhMuc}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="order-amount-text" style={{ fontSize: '0.85rem' }}>{fmt(p.giaBanSo)}</span>
                      </td>
                      <td>
                        <span className="stock-warning-badge">
                          {p.stockQuantity} máy
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
