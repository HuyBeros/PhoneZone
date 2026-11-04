import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import AdminConfirmDialog from '../components/AdminConfirmDialog';
import { useToast } from './ToastContext';

const AdminFeedbackContext = createContext(null);

export function AdminFeedbackProvider({ children }) {
  const { showToast } = useToast();
  const { pathname } = useLocation();
  const [request, setRequest] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const active = useRef(null);
  const running = useRef(false);

  const finish = useCallback((confirmed) => {
    const pending = active.current;
    active.current = null;
    running.current = false;
    setRequest(null);
    setBusy(false);
    setError('');
    pending?.resolve(confirmed);
  }, []);

  const dismiss = useCallback(() => {
    if (!running.current) finish(false);
  }, [finish]);

  const confirmAction = useCallback((options) => {
    // Ignore repeated clicks while a confirmation or its request is active.
    if (active.current) return Promise.resolve(false);
    return new Promise(resolve => {
      const pending = { ...options, resolve };
      active.current = pending;
      setError('');
      setRequest(pending);
    });
  }, []);

  const submit = useCallback(async () => {
    const pending = active.current;
    if (!pending || running.current) return;
    running.current = true;
    setBusy(true);
    setError('');
    try {
      await pending.onConfirm();
      if (active.current !== pending) return;
      finish(true);
      if (pending.successMessage) showToast(pending.successMessage, 'success');
    } catch (failure) {
      if (active.current !== pending) return;
      running.current = false;
      setBusy(false);
      setError(failure?.message || 'Thao tác chưa hoàn tất. Vui lòng thử lại.');
    }
  }, [finish, showToast]);

  useEffect(() => () => {
    // A navigation/logout must never leave a pending confirmation behind.
    const pending = active.current;
    active.current = null;
    running.current = false;
    pending?.resolve(false);
  }, []);

  useEffect(() => {
    finish(false);
  }, [pathname, finish]);

  return (
    <AdminFeedbackContext.Provider value={{ confirmAction }}>
      {children}
      <AdminConfirmDialog request={request} busy={busy} error={error} onCancel={dismiss} onConfirm={submit} />
    </AdminFeedbackContext.Provider>
  );
}

export function useAdminFeedback() {
  const value = useContext(AdminFeedbackContext);
  if (!value) throw new Error('useAdminFeedback requires AdminFeedbackProvider');
  return value;
}
