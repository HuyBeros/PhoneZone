export const API_BASE_URL = '/api';
export const UNAUTHORIZED_EVENT = 'phonezone:unauthorized';

export class ApiError extends Error {
    constructor(message, status = 0) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

function errorMessage(status, isAuthRequest) {
    if (status === 401) return isAuthRequest
        ? 'Sai tên đăng nhập hoặc mật khẩu.'
        : 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
    if (status === 403) return 'Bạn không có quyền thực hiện thao tác này.';
    if (status === 404) return 'Không tìm thấy API (HTTP 404). Vui lòng kiểm tra địa chỉ máy chủ.';
    if (status === 409) return 'Tên đăng nhập hoặc email đã được sử dụng.';
    if (status >= 500) return `Máy chủ đang gặp lỗi (HTTP ${status}). Vui lòng thử lại sau.`;
    return `Không thể thực hiện yêu cầu (HTTP ${status}). Vui lòng kiểm tra thông tin.`;
}

export async function fetchApi(endpoint, options = {}) {
    const path = endpoint.split('?')[0];
    const isAuthRequest = path === '/auth/login' || path === '/auth/register';
    const token = isAuthRequest ? null : localStorage.getItem('pz_token');
    const headers = new Headers(options.headers);
    if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
    if (!headers.has('Accept')) headers.set('Accept', 'application/json');

    // Login/register must work even when the browser still has an expired JWT.
    if (isAuthRequest) headers.delete('Authorization');
    else if (token) headers.set('Authorization', `Bearer ${token}`);

    let response;
    try {
        response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
    } catch (error) {
        if (error.name === 'AbortError') throw error;
        throw new ApiError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối và thử lại.');
    }

    // A late response for an old token must not log out a newly created session.
    if (response.status === 401 && token && localStorage.getItem('pz_token') === token) {
        localStorage.removeItem('pz_token');
        localStorage.removeItem('pz_user');
        window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }

    if (response.status === 204) return null;

    const isJson = (response.headers.get('Content-Type') || '').toLowerCase().includes('json');
    const data = isJson ? await response.json().catch(() => null) : null;

    if (!response.ok) {
        const violations = Array.isArray(data?.violations)
            ? data.violations.map(v => v.message).filter(Boolean).join('; ')
            : '';
        // Avoid exposing server internals from 5xx responses to shoppers.
        const message = response.status >= 500
            ? errorMessage(response.status, isAuthRequest)
            : violations || data?.error || data?.message || errorMessage(response.status, isAuthRequest);
        throw new ApiError(message, response.status);
    }

    if (!isJson || data === null) {
        throw new ApiError('API không trả về dữ liệu JSON hợp lệ. Vui lòng kiểm tra cấu hình đường dẫn /api.', response.status);
    }

    return data;
}
