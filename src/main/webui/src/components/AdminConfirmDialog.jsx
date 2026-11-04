import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { IoAlertCircleOutline, IoCloseOutline, IoRefreshOutline, IoTrashOutline } from 'react-icons/io5';
import './AdminConfirmDialog.css';

export default function AdminConfirmDialog({ request, busy, error, onCancel, onConfirm }) {
  const dialogRef = useRef(null);
  const cancelRef = useRef(null);
  const titleId = useId();
  const descriptionId = useId();
  const opener = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (request) {
      opener.current = document.activeElement;
      dialog.showModal();
      cancelRef.current?.focus();
      const previous = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = previous;
        if (dialog.open) dialog.close();
        if (opener.current?.isConnected) opener.current.focus({ preventScroll: true });
      };
    }
  }, [request]);

  return createPortal(
    <dialog
      ref={dialogRef}
      className="admin-confirm-dialog"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      aria-modal="true"
      aria-busy={busy || undefined}
      onCancel={event => { event.preventDefault(); onCancel(); }}
      onClick={event => {
        if (event.target !== event.currentTarget) return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onCancel();
      }}
    >
      {request && (
        <>
          <div className="admin-confirm-content">
            <button type="button" className="admin-confirm-close" aria-label="Đóng xác nhận" disabled={busy} onClick={onCancel}>
              <IoCloseOutline aria-hidden="true" />
            </button>
            <div className="admin-confirm-icon" aria-hidden="true"><IoTrashOutline /></div>
            <p className="admin-confirm-eyebrow">Xác nhận thao tác</p>
            <h2 id={titleId}>{request.title}</h2>
            <p id={descriptionId} className="admin-confirm-description">{request.description}</p>
            {request.resource && <div className="admin-confirm-resource">{request.resource}</div>}
            {request.note && <p className="admin-confirm-note"><IoAlertCircleOutline aria-hidden="true" />{request.note}</p>}
            {error && <div className="admin-confirm-error" role="alert"><IoAlertCircleOutline aria-hidden="true" /><span>{error}</span></div>}
          </div>
          <div className="admin-confirm-actions">
            <button ref={cancelRef} type="button" className="admin-confirm-cancel" disabled={busy} onClick={onCancel}>Giữ lại</button>
            <button type="button" className="admin-confirm-submit" disabled={busy} onClick={onConfirm}>
              {busy ? <IoRefreshOutline className="admin-action-spinner" aria-hidden="true" /> : <IoTrashOutline aria-hidden="true" />}
              {busy ? (request.pendingLabel || 'Đang xóa…') : (request.confirmLabel || 'Xóa')}
            </button>
            <span className="admin-confirm-status" role="status">{busy ? 'Đang xử lý, vui lòng chờ.' : ''}</span>
          </div>
        </>
      )}
    </dialog>, document.body,
  );
}
