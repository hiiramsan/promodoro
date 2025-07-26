import { createContext, useEffect, useState, useContext } from "react";
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    
    useEffect(() => {
        const checkAuth = async () => {
            try {                
                const token = localStorage.getItem('token');

                if (token) {
                    const res = await axios.get(`${apiBase}/api/auth/me`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    setUser(res.data);
                }
            } catch (error) {
                localStorage.removeItem('token')
            } finally {
                setLoading(false);
            }
        }
        
        checkAuth();
    }, []);

    const register = async (email, username, password) => {
        const res = await axios.post(`${apiBase}/api/auth/register`, { email, username, password });
        localStorage.setItem('token', res.data.token);       
        setUser(res.data);
    };

    const login = async (email, password) => {
        const res = await axios.post(`${apiBase}/api/auth/login`, { email, password });
        localStorage.setItem('token', res.data.token);
        setUser(res.data);
    };

    const googleLogin = async (credentialResponse) => {
        const res = await axios.post(`${apiBase}/api/auth/google`, { 
            token: credentialResponse.credential 
        });
        localStorage.setItem('token', res.data.token);
        setUser(res.data);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ user, loading, register, login, googleLogin, logout }}>
            {children}
        </AuthContext.Provider>
    );

}

export function useAuth() {
    return useContext(AuthContext);
}