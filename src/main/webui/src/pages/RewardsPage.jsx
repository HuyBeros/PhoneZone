import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePoints } from '../store/PointsContext';
import { fmt } from '../utils/utils';
import {
  IoGiftOutline,
  IoSparkles,
  IoStar,
  IoStarOutline,
  IoHomeOutline,
  IoChevronForward,
  IoTicketOutline,
  IoCarOutline,
  IoWalletOutline,
  IoCheckmarkCircleOutline,
  IoArchiveOutline,
  IoCopyOutline,
  IoCheckmark,
  IoBagHandleOutline,
  IoPersonAddOutline,
  IoInformationCircleOutline,
  IoRibbonOutline,
  IoArrowBack,
  IoHelpCircleOutline,
} from 'react-icons/io5';

export default function RewardsPage() {
  const { points, coupons, availableCoupons, redeemPoints } = usePoints();
  
  // Mốc điểm tiếp theo
  const getNextTier = (pts) => {
    return availableCoupons.find(t => t.points > pts) || null;
  };

  const nextTier = getNextTier(points);
  const progress = nextTier
    ? Math.min(100, Math.round((points / nextTier.points) * 100))
    : 100;

  const unusedCoupons = coupons.filter(c => !c.used);
  const usedCoupons   = coupons.filter(c => c.used);

  return (
    <div className="rewards-page">
      {/* ── Banner PhoneZone Rewards (Đồng bộ với hệ thống banner mới) ── */}
      <section className="brand-page-hero rewards-page-hero">
        <div className="container">
          <div className="brand-hero-inner">
            <div className="brand-hero-icon-wrap">
              <IoGiftOutline />
            </div>

            <div className="brand-hero-text">
              <span className="brand-hero-badge">
                <IoSparkles style={{ color: '#38bdf8', marginRight: 5, verticalAlign: 'middle' }} />
                Chương trình thành viên
              </span>
              <h1>PhoneZone Rewards</h1>
              <p>
                Tích điểm tự động mỗi khi mua sắm, nhận ưu đãi sinh nhật và đổi điểm lấy coupon giảm giá trực tiếp!
              </p>
              <div className="rewards-rule-pill">
                <IoInformationCircleOutline style={{ fontSize: '1rem', color: '#38bdf8', flexShrink: 0 }} />
                <span>Mỗi <strong>10.000đ</strong> mua hàng = <strong>1 điểm</strong> thưởng</span>
              </div>
            </div>

            {/* Thẻ điểm thành viên nhỏ gọn & sang trọng */}
            <div className="rewards-hero-points-card">
              <div className="rhp-top">
                <span className="rhp-label">Điểm tích lũy</span>
                <span className="rhp-tag">Thành viên PhoneZone</span>
              </div>
              <div className="rhp-score-row">
                <IoStar style={{ color: '#fbbf24', fontSize: '1.75rem' }} />
                <span className="rhp-number">{(points || 0).toLocaleString()}</span>
                <span className="rhp-unit">điểm</span>
              </div>
              {nextTier ? (
                <div className="rhp-progress-wrap">
                  <div className="rhp-bar">
                    <div className="rhp-fill" style={{ width: `${progress}%` }}></div>
                  </div>
                  <div className="rhp-hint">
                    Cần thêm <strong>{(nextTier.points - (points || 0)).toLocaleString()}</strong> điểm để đổi {nextTier.label}
                  </div>
                </div>
              ) : (
                <div className="rhp-max-pill">
                  <IoRibbonOutline style={{ marginRight: 4, verticalAlign: '-1px' }} /> Đã đạt mốc cao nhất
                </div>
              )}
            </div>

            <div className="brand-hero-watermark">
              <IoGiftOutline />
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Content ── */}
      <section className="brand-page-section rewards-main-section">
        <div className="container">

          {/* Breadcrumb */}
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link to="/"><IoHomeOutline style={{ marginRight: 4, verticalAlign: '-2px' }} /> Trang chủ</Link>
            <span className="sep"><IoChevronForward style={{ fontSize: '0.8rem', opacity: 0.6, verticalAlign: '-1px' }} /></span>
            <span>PhoneZone Rewards</span>
          </nav>

          {/* ── Section 1: Đổi điểm lấy coupon ── */}
          <div className="rewards-section">
            <div className="rewards-section-header">
              <div className="rewards-section-title">
                <IoGiftOutline className="rst-icon" />
                <h2>Đổi điểm lấy coupon ưu đãi</h2>
              </div>
              <span className="rewards-section-desc">Chọn voucher phù hợp với số điểm hiện có của bạn</span>
            </div>

            {availableCoupons.length === 0 ? (
              <div className="filter-empty-state">
                <div className="empty-icon-wrap">
                  <IoTicketOutline style={{ fontSize: '2.5rem', color: '#94a3b8' }} />
                </div>
                <h3>Chưa có mã giảm giá nào</h3>
                <p>Hiện tại hệ thống chưa có mã giảm giá khả dụng. Vui lòng quay lại sau!</p>
              </div>
            ) : (
              <div className="coupon-tiers-grid">
                {availableCoupons.map(tier => {
                  const canRedeem = points >= tier.points;
                  const tierColor = tier.color || '#1d6ef5';
                  return (
                    <div
                      key={tier.id}
                      className={`coupon-tier-card${canRedeem ? ' can-redeem' : ''}`}
                      style={{ '--tier-color': tierColor }}
                    >
                      <div className="ctc-header">
                        <div className="ctc-icon-badge" style={{ background: `${tierColor}15`, color: tierColor }}>
                          {tier.freeShip ? <IoCarOutline /> : <IoTicketOutline />}
                        </div>
                        <div className="ctc-points-badge">
                          <IoStar style={{ color: '#f59e0b', fontSize: '0.9rem' }} />
                          <span>{tier.points.toLocaleString()} điểm</span>
                        </div>
                      </div>

                      <div className="ctc-body">
                        <h3 className="ctc-label">{tier.label}</h3>
                        <div className="ctc-code-row">
                          <span className="ctc-code-lbl">Mã áp dụng:</span>
                          <code className="ctc-code">{tier.code}</code>
                        </div>
                        {tier.freeShip && (
                          <div className="ctc-freeship">
                            <IoCarOutline style={{ fontSize: '0.95rem' }} /> Miễn phí vận chuyển
                          </div>
                        )}
                      </div>

                      <div className="ctc-footer">
                        <div className="ctc-progress-meta">
                          <span>Số điểm của bạn:</span>
                          <strong style={{ color: canRedeem ? '#16a34a' : 'var(--text2)' }}>
                            {(points || 0).toLocaleString()} / {tier.points.toLocaleString()}
                          </strong>
                        </div>
                        <button
                          type="button"
                          className={`btn ctc-btn${canRedeem ? ' active' : ''}`}
                          style={canRedeem ? { background: tierColor, borderColor: tierColor } : {}}
                          disabled={!canRedeem}
                          onClick={() => redeemPoints(tier.id)}
                        >
                          {canRedeem ? (
                            <>
                              <IoGiftOutline style={{ fontSize: '1.05rem', verticalAlign: '-2px', marginRight: 4 }} />
                              Đổi ngay
                            </>
                          ) : (
                            `Cần thêm ${(tier.points - (points || 0)).toLocaleString()} điểm`
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Section 2: Ví coupon của tôi ── */}
          <div className="rewards-section">
            <div className="rewards-section-header">
              <div className="rewards-section-title">
                <IoWalletOutline className="rst-icon" />
                <h2>Ví coupon của tôi</h2>
                {unusedCoupons.length > 0 && (
                  <span className="wallet-badge">{unusedCoupons.length}</span>
                )}
              </div>
              <span className="rewards-section-desc">Mã ưu đãi đã đổi sẵn sàng sử dụng khi thanh toán đơn hàng</span>
            </div>

            {coupons.length === 0 ? (
              <div className="wallet-empty-card">
                <IoTicketOutline className="we-icon" />
                <h4>Bạn chưa có coupon nào trong ví</h4>
                <p>Hãy tích lũy điểm khi mua hàng để đổi lấy các ưu đãi hấp dẫn ở phía trên nhé!</p>
              </div>
            ) : (
              <div className="wallet-groups-wrap">
                {unusedCoupons.length > 0 && (
                  <div className="wallet-group">
                    <div className="wallet-group-title">
                      <IoCheckmarkCircleOutline style={{ color: '#16a34a', fontSize: '1.1rem' }} />
                      <span>Có thể sử dụng ({unusedCoupons.length})</span>
                    </div>
                    <div className="wallet-coupons-grid">
                      {unusedCoupons.map(c => (
                        <WalletCouponCard key={c.uid} coupon={c} />
                      ))}
                    </div>
                  </div>
                )}
                {usedCoupons.length > 0 && (
                  <div className="wallet-group used-group">
                    <div className="wallet-group-title">
                      <IoArchiveOutline style={{ color: '#94a3b8', fontSize: '1.1rem' }} />
                      <span>Đã sử dụng ({usedCoupons.length})</span>
                    </div>
                    <div className="wallet-coupons-grid">
                      {usedCoupons.map(c => (
                        <WalletCouponCard key={c.uid} coupon={c} used />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Section 3: Cách tích điểm ── */}
          <div className="rewards-section rewards-how-section">
            <div className="rewards-section-header">
              <div className="rewards-section-title">
                <IoHelpCircleOutline className="rst-icon" />
                <h2>Cách tích điểm thành viên</h2>
              </div>
              <span className="rewards-section-desc">Nhiều cơ hội nhận điểm thưởng để đổi lấy voucher giảm giá</span>
            </div>

            <div className="how-grid">
              {[
                { icon: <IoBagHandleOutline />, title: 'Mua sắm', desc: '1 điểm cho mỗi 10.000đ thanh toán đơn hàng thành công' },
                { icon: <IoStarOutline />, title: 'Đánh giá sản phẩm', desc: '5 điểm thưởng cho mỗi lượt đánh giá sản phẩm đã mua' },
                { icon: <IoPersonAddOutline />, title: 'Giới thiệu bạn bè', desc: '50 điểm khi bạn bè đăng ký và hoàn tất đơn hàng đầu tiên' },
                { icon: <IoGiftOutline />, title: 'Quà sinh nhật', desc: 'Tặng 100 điểm chúc mừng vào ngày sinh nhật mỗi năm' },
              ].map(item => (
                <div key={item.title} className="how-card">
                  <div className="how-icon-box">{item.icon}</div>
                  <h4>{item.title}</h4>
                  <p>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Nút tiếp tục mua sắm */}
          <div className="rewards-back">
            <Link to="/" className="btn btn-catalog-load-more" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', textDecoration: 'none' }}>
              <IoArrowBack style={{ fontSize: '1.1rem' }} />
              <span>Tiếp tục mua sắm tại PhoneZone</span>
            </Link>
          </div>

        </div>
      </section>
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

  const cColor = coupon.color || '#16a34a';

  return (
    <div className={`wallet-coupon-card${used ? ' is-used' : ''}`} style={{ '--card-accent': used ? '#94a3b8' : cColor }}>
      <div className="wcc-left">
        <div className="wcc-icon" style={{ background: used ? '#f1f5f9' : `${cColor}18`, color: used ? '#94a3b8' : cColor }}>
          {coupon.freeShip ? <IoCarOutline /> : <IoTicketOutline />}
        </div>
        <div className="wcc-details">
          <h4 className="wcc-label">{coupon.label}</h4>
          {coupon.freeShip && (
            <span className="wcc-ship-badge"><IoCarOutline style={{ marginRight: 3 }} /> Miễn ship</span>
          )}
          <span className="wcc-date">
            Nhận ngày {new Date(coupon.acquiredAt || new Date()).toLocaleDateString('vi-VN')}
          </span>
        </div>
      </div>

      <div className="wcc-right">
        <code className="wcc-code">{coupon.code}</code>
        {!used && (
          <button type="button" className={`wcc-copy-btn${copied ? ' copied' : ''}`} onClick={handleCopy}>
            {copied ? (
              <>
                <IoCheckmark style={{ fontSize: '1rem', color: '#16a34a' }} />
                <span>Đã sao chép</span>
              </>
            ) : (
              <>
                <IoCopyOutline style={{ fontSize: '0.95rem' }} />
                <span>Sao chép</span>
              </>
            )}
          </button>
        )}
        {used && <span className="wcc-used-badge">Đã sử dụng</span>}
      </div>
    </div>
  );
}
