import { useToast } from '../store/ToastContext';

const ICONS = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
};

const TYPE_CLASS = {
  success: 'toast-success',
  error: 'toast-error',
  warning: 'toast-warning',
  info: 'toast-info',
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
          <span className="toast-icon">{ICONS[t.type] || ICONS.success}</span>
          <span className="toast-msg">{t.msg}</span>
          <button className="toast-close" onClick={() => removeToast(t.id)}>✕</button>
        </div>
      ))}
    </div>
  );
}
