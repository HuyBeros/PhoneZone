import { createContext, useContext, useState, useEffect } from 'react';
import { fetchApi } from '../api/apiClient';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('pz_token') || null);
    const [loading, setLoading] = useState(true);

    // Fetch user profile if token exists
    useEffect(() => {
        const fetchUser = async () => {
            if (token) {
                try {
                    const userData = await fetchApi('/users/me');
                    setUser(userData);
                } catch (error) {
                    console.error("Token hết hạn hoặc lỗi xác thực:", error);
                    logout();
                }
            }
            setLoading(false);
        };
        fetchUser();
    }, [token]);

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

    const logout = () => {
        localStorage.removeItem('pz_token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout, setUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
