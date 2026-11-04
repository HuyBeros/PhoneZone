import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchApi, UNAUTHORIZED_EVENT } from '../api/apiClient';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('pz_token') || null);
    const [loading, setLoading] = useState(true);

    const logout = useCallback(() => {
        localStorage.removeItem('pz_token');
        localStorage.removeItem('pz_user');
        setToken(null);
        setUser(null);
    }, []);

    // Keep account-specific UI in sync when another tab signs out or switches accounts.
    useEffect(() => {
        const syncSession = event => {
            if (event.key !== 'pz_token' && event.key !== null) return;
            const nextToken = localStorage.getItem('pz_token');
            if (nextToken === token) return;
            setUser(null);
            setToken(nextToken);
            setLoading(Boolean(nextToken));
        };
        window.addEventListener('storage', syncSession);
        return () => window.removeEventListener('storage', syncSession);
    }, [token]);

    useEffect(() => {
        const onUnauthorized = () => {
            logout();
            if (location.pathname !== '/login') {
                navigate('/login', {
                    replace: true,
                    state: { from: location.pathname + location.search, sessionExpired: true },
                });
            }
        };
        window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
        return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    }, [logout, navigate, location.pathname, location.search]);

    // Fetch user profile if token exists
    useEffect(() => {
        let active = true;
        const fetchUser = async () => {
            if (token) {
                try {
                    const userData = await fetchApi('/users/me');
                    if (active && localStorage.getItem('pz_token') === token) setUser(userData);
                } catch (error) {
                    // A temporary server/network error does not invalidate the JWT.
                    // 401 is handled by onUnauthorized; 404 means the account is gone.
                    if (active && error.status === 404 && localStorage.getItem('pz_token') === token) logout();
                }
            }
            if (active) setLoading(false);
        };
        fetchUser();
        return () => { active = false; };
    }, [token, logout]);

    const login = async (username, password) => {
        const data = await fetchApi('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        
        localStorage.setItem('pz_token', data.token);
        setToken(data.token);
        setUser(data.user);
        return data.user;
    };

    const register = async (userData) => {
        return await fetchApi('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout, setUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
