import { useToast } from '../store/ToastContext';

export default function Toast() {
  const { toast } = useToast();
  return (
    <div className={`toast${toast.show ? ' show' : ''}`}>
      {toast.msg}
    </div>
  );
}
