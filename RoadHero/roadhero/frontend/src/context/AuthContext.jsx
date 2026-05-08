import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Check if user is logged in
    // Check if user is logged in
    useEffect(() => {
        const verifySession = async () => {
            const userInfo = localStorage.getItem('userInfo');
            if (userInfo) {
                try {
                    const parsedUser = JSON.parse(userInfo);
                    if (parsedUser && parsedUser.token) {
                        try {
                            const config = {
                                headers: {
                                    Authorization: `Bearer ${parsedUser.token}`,
                                },
                            };
                            // Use raw axios or api instance. Since api instance doesn't have token interceptor yet, pass header manually.
                            // I need to import api at top if not already there, but api is default export so I can import it.
                            // For now I'll just use fetch to keep it simple or assume api is available.
                            // Since I don't see `api` import, I will use fetch.
                            const res = await fetch(`${import.meta.env.PROD ? '/api' : 'http://localhost:5000/api'}/auth/me`, {
                                headers: config.headers
                            });

                            if (res.ok) {
                                setUser(parsedUser);
                            } else {
                                throw new Error('Session invalid');
                            }
                        } catch (err) {
                            console.error('Session expired:', err);
                            localStorage.removeItem('userInfo');
                            setUser(null);
                        }
                    }
                } catch (e) {
                    console.error("Critical session error:", e);
                    localStorage.removeItem('userInfo');
                }
            }
            setLoading(false);
        };

        verifySession();
    }, []);

    const login = (userData) => {
        localStorage.setItem('userInfo', JSON.stringify(userData));
        setUser(userData);
        if (userData.role === 'driver') navigate('/driver');
        else if (userData.role === 'mechanic') navigate('/mechanic');
    };

    const logout = () => {
        localStorage.removeItem('userInfo');
        localStorage.removeItem('mechanicId'); // Clear legacy keys
        setUser(null);
        navigate('/login');
    };

    const updateUser = (userData) => {
        setUser(prevUser => {
            const newUser = { ...(prevUser || {}), ...userData };
            localStorage.setItem('userInfo', JSON.stringify(newUser));
            return newUser;
        });
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, updateUser }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
