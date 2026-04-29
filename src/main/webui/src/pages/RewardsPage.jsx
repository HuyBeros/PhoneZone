import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePoints, COUPON_TIERS } from '../store/PointsContext';
import { fmt } from '../utils/utils';

// Mốc điểm tiếp theo
function getNextTier(points) {
  return COUPON_TIERS.find(t => t.points > points) || null;
}

export default function RewardsPage() {
  const { points, coupons, redeemPoints, addPoints } = usePoints();
  const [simAmount, setSimAmount] = useState('');
  const nextTier = getNextTier(points);
  const progress = nextTier
    ? Math.min(100, Math.round((points / nextTier.points) * 100))
    : 100;

  const unusedCoupons = coupons.filter(c => !c.used);
  const usedCoupons   = coupons.filter(c => c.used);

  const handleSimulate = () => {
    const val = parseInt(simAmount);
    if (!val || val <= 0) return;
    addPoints(val * 10000); // Nhập "số điểm" muốn thêm để test
    setSimAmount('');
  };

  return (
    <div className="rewards-page">
      {/* ── Hero ── */}
      <section className="rewards-hero">
        <div className="container">
          <div className="rewards-hero-inner">
            <div className="rewards-hero-text">
              <span className="section-tag">Chương trình thành viên</span>
              <h1>PhoneZone <span className="highlight">Rewards</span></h1>
              <p>Tích điểm mỗi khi mua hàng. Đổi điểm lấy coupon ưu đãi hấp dẫn!</p>
              <div className="rewards-rule">
                <i className="fa fa-info-circle"></i>
                Mỗi <strong>10.000đ</strong> mua hàng = <strong>1 điểm</strong> thưởng
              </div>
            </div>
            <div className="rewards-points-card">
              <div className="rpc-label">Điểm hiện có</div>
              <div className="rpc-score">
                <i className="fa fa-star"></i>
                <span>{points.toLocaleString()}</span>
              </div>
              <div className="rpc-sub">điểm thưởng</div>
              {nextTier && (
                <div className="rpc-progress-wrap">
                  <div className="rpc-progress-bar">
                    <div className="rpc-progress-fill" style={{ width: `${progress}%` }}></div>
                  </div>
                  <div className="rpc-progress-label">
                    Cần thêm <strong>{(nextTier.points - points).toLocaleString()}</strong> điểm để đổi {nextTier.label}
                  </div>
                </div>
              )}
              {!nextTier && (
                <div className="rpc-max">🏆 Bạn đã đạt mốc cao nhất!</div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="container">

        {/* ── Demo: Thêm điểm test ── */}
        <div className="rewards-demo-bar">
          <i className="fa fa-flask"></i>
          <span>Demo: Mô phỏng mua hàng để nhận điểm</span>
          <input
            type="number"
            min="1"
            placeholder="Nhập số điểm muốn thêm..."
            value={simAmount}
            onChange={e => setSimAmount(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSimulate()}
          />
          <button className="btn btn-primary" onClick={handleSimulate}>
            <i className="fa fa-plus"></i> Thêm điểm
          </button>
        </div>

        {/* ── Đổi điểm lấy coupon ── */}
        <div className="rewards-section">
          <h2 className="rewards-section-title">
            <i className="fa fa-gift"></i> Đổi điểm lấy coupon
          </h2>
          <div className="coupon-tiers-grid">
            {COUPON_TIERS.map(tier => {
              const canRedeem = points >= tier.points;
              return (
                <div
                  key={tier.id}
                  className={`coupon-tier-card${canRedeem ? ' can-redeem' : ''}`}
                  style={{ '--tier-color': tier.color }}
                >
                  <div className="ctc-badge" style={{ background: tier.color }}>
                    {tier.freeShip ? '👑' : '🎟️'}
                  </div>
                  <div className="ctc-points">
                    <i className="fa fa-star"></i> {tier.points.toLocaleString()} điểm
                  </div>
                  <div className="ctc-label">{tier.label}</div>
                  <div className="ctc-code">Mã: <code>{tier.code}</code></div>
                  {tier.freeShip && (
                    <div className="ctc-freeship">
                      <i className="fa fa-truck"></i> Miễn phí vận chuyển
                    </div>
                  )}
                  <div className="ctc-have">
                    Bạn có: <strong style={{ color: canRedeem ? tier.color : 'var(--text2)' }}>
                      {points.toLocaleString()}
                    </strong> / {tier.points.toLocaleString()} điểm
                  </div>
                  <button
                    className="btn ctc-btn"
                    style={canRedeem ? { background: tier.color, color: '#fff' } : {}}
                    disabled={!canRedeem}
                    onClick={() => redeemPoints(tier.id)}
                  >
                    {canRedeem ? '🎁 Đổi ngay' : `Cần thêm ${(tier.points - points).toLocaleString()} điểm`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Ví coupon của tôi ── */}
        <div className="rewards-section">
          <h2 className="rewards-section-title">
            <i className="fa fa-wallet"></i> Ví coupon của tôi
            {unusedCoupons.length > 0 && (
              <span className="wallet-badge">{unusedCoupons.length}</span>
            )}
          </h2>

          {coupons.length === 0 ? (
            <div className="rewards-empty">
              <i className="fa fa-ticket-alt"></i>
              <p>Bạn chưa có coupon nào. Hãy đổi điểm để nhận ưu đãi!</p>
            </div>
          ) : (
            <>
              {unusedCoupons.length > 0 && (
                <div className="wallet-group">
                  <div className="wallet-group-title">✅ Có thể sử dụng ({unusedCoupons.length})</div>
                  <div className="wallet-coupons">
                    {unusedCoupons.map(c => (
                      <WalletCouponCard key={c.uid} coupon={c} />
                    ))}
                  </div>
                </div>
              )}
              {usedCoupons.length > 0 && (
                <div className="wallet-group">
                  <div className="wallet-group-title">🗃️ Đã sử dụng ({usedCoupons.length})</div>
                  <div className="wallet-coupons">
                    {usedCoupons.map(c => (
                      <WalletCouponCard key={c.uid} coupon={c} used />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Cách tích điểm ── */}
        <div className="rewards-section rewards-how">
          <h2 className="rewards-section-title">
            <i className="fa fa-question-circle"></i> Cách tích điểm
          </h2>
          <div className="how-grid">
            {[
              { icon: 'fa-shopping-bag', title: 'Mua hàng', desc: '1 điểm cho mỗi 10.000đ thanh toán thành công' },
              { icon: 'fa-star', title: 'Đánh giá SP', desc: '5 điểm cho mỗi đánh giá sản phẩm đã mua' },
              { icon: 'fa-user-plus', title: 'Giới thiệu bạn bè', desc: '50 điểm khi bạn bè đăng ký và mua hàng đầu tiên' },
              { icon: 'fa-birthday-cake', title: 'Sinh nhật', desc: '100 điểm tặng vào ngày sinh nhật hàng năm' },
            ].map(item => (
              <div key={item.title} className="how-card">
                <div className="how-icon"><i className={`fa ${item.icon}`}></i></div>
                <h4>{item.title}</h4>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rewards-back">
          <Link to="/" className="btn btn-outline">
            <i className="fa fa-arrow-left"></i> Tiếp tục mua sắm
          </Link>
        </div>

      </div>
    </div>
  );
}

function WalletCouponCard({ coupon, used = false }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(coupon.code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`wallet-coupon${used ? ' used' : ''}`}
      style={{ '--c': used ? '#444' : coupon.color }}>
      <div className="wc-left">
        <div className="wc-icon" style={{ background: used ? '#333' : coupon.color }}>
          {coupon.freeShip ? '👑' : '🎟️'}
        </div>
        <div>
          <div className="wc-label">{coupon.label}</div>
          {coupon.freeShip && (
            <div className="wc-ship"><i className="fa fa-truck"></i> Miễn ship</div>
          )}
          <div className="wc-date">Nhận ngày {coupon.earnedAt}</div>
        </div>
      </div>
      <div className="wc-right">
        <code className="wc-code">{coupon.code}</code>
        {!used && (
          <button className="wc-copy" onClick={handleCopy}>
            {copied ? <i className="fa fa-check"></i> : <i className="fa fa-copy"></i>}
            {copied ? 'Đã copy' : 'Copy'}
          </button>
        )}
        {used && <span className="wc-used-tag">Đã dùng</span>}
      </div>
    </div>
  );
}
