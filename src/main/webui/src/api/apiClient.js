export const API_BASE_URL = '/api';

/**
 * Hàm gọi API chung tự động đính kèm token (nếu có).
 */
export async function fetchApi(endpoint, options = {}) {
    const token = localStorage.getItem('pz_token');
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers,
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        
        // Nếu response là 204 No Content
        if (response.status === 204) return null;

        const data = await response.json().catch(() => null);

        if (response.status === 401) {
            localStorage.removeItem('pz_token');
            localStorage.removeItem('pz_user');
            window.location.href = '/?login=true';
            throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }

        if (!response.ok) {
            // Quarkus ConstraintViolation format: {"violations": [{field, message}]}
            if (data && data.violations && data.violations.length > 0) {
                const msgs = data.violations.map(v => v.message).join('; ');
                throw new Error(msgs);
            }
            throw new Error((data && data.error) || data?.message || data?.title || 'Có lỗi xảy ra khi gọi API');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}
