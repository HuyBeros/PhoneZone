import { useToast } from '../store/ToastContext';

const ICONS = {
  success: 'fa-circle-check',
  error:   'fa-circle-xmark',
  warning: 'fa-triangle-exclamation',
  info:    'fa-circle-info',
};

const TYPE_CLASS = {
  success: 'toast-success',
  error:   'toast-error',
  warning: 'toast-warning',
  info:    'toast-info',
};

export default function Toast() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`toast-item ${TYPE_CLASS[t.type] || 'toast-success'} ${t.leaving ? 'toast-leaving' : 'toast-entering'}`}
        >
          <span className="toast-icon">
            <i className={`fas ${ICONS[t.type] || ICONS.success}`}></i>
          </span>
          <span className="toast-msg">{t.msg}</span>
          <button className="toast-close" onClick={() => removeToast(t.id)} aria-label="Đóng">
            <i className="fas fa-xmark"></i>
          </button>
        </div>
      ))}
    </div>
  );
}
