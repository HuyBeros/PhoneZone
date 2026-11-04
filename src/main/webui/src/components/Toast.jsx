import { useToast } from '../store/ToastContext';
import { IoCheckmarkCircleOutline, IoCloseCircleOutline, IoWarningOutline, IoInformationCircleOutline, IoCloseOutline } from 'react-icons/io5';

const ICONS = {
  success: IoCheckmarkCircleOutline,
  error: IoCloseCircleOutline,
  warning: IoWarningOutline,
  info: IoInformationCircleOutline,
};

const TITLES = { success: 'Đã hoàn tất', error: 'Thao tác chưa hoàn tất', warning: 'Lưu ý', info: 'Thông tin' };

const TYPE_CLASS = {
  success: 'toast-success',
  error:   'toast-error',
  warning: 'toast-warning',
  info:    'toast-info',
};

export default function Toast() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="toast-container" aria-label="Thông báo hệ thống">
      {toasts.map(t => {
        const Icon = ICONS[t.type] || ICONS.info;
        return (
        <div
          key={t.id}
          className={`toast-item ${TYPE_CLASS[t.type] || 'toast-success'} ${t.leaving ? 'toast-leaving' : 'toast-entering'}`}
          role={t.type === 'error' ? 'alert' : 'status'}
          aria-atomic="true"
          aria-hidden={t.leaving || undefined}
          style={{ '--toast-duration': `${t.duration}ms` }}
        >
          <span className="toast-icon" aria-hidden="true"><Icon /></span>
          <span className="toast-content">
            <span className="toast-title">{TITLES[t.type] || TITLES.info}</span>
            <span className="toast-msg">{t.msg}</span>
          </span>
          <button type="button" className="toast-close" onClick={() => removeToast(t.id)} aria-label="Đóng thông báo">
            <IoCloseOutline aria-hidden="true" />
          </button>
          <span className="toast-progress" aria-hidden="true" />
        </div>
      );})}
    </div>
  );
}
