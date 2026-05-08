import React, { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import api from '../api';
import { Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Wrench } from 'lucide-react';

const Login = () => {
    const { login } = useContext(AuthContext);
    const [role, setRole] = useState('driver');
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Support role pre-selection from URL
    React.useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const urlRole = params.get('role');
        if (urlRole === 'mechanic' || urlRole === 'driver') {
            setRole(urlRole);
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post(`/auth/${role}/login`, formData);
            if (res.data.success) {
                login(res.data.data);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-bg-logo" style={{ opacity: 0.05 }}>
                <img src="/logo.png" alt="" style={{ width: '800px', height: '800px', objectFit: 'contain' }} />
            </div>

            <div className="premium-card fade-in" style={{ width: '100%', maxWidth: '440px', padding: '40px', position: 'relative', zIndex: 1, background: 'var(--glass-bg)' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ width: '110px', height: '110px', background: 'white', borderRadius: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', overflow: 'hidden', padding: '15px' }}>
                        <img src="/logo.png" alt="RoadHero" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <h2 style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '8px' }}>RoadHero</h2>
                    <p style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Premium Roadside Assistance</p>
                </div>

                {/* Role Switcher */}
                <div style={{
                    background: '#F1F5F9',
                    padding: '4px',
                    borderRadius: '12px',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    marginBottom: '32px'
                }}>
                    <button
                        onClick={() => { setRole('driver'); setError(''); }}
                        style={{
                            padding: '10px',
                            borderRadius: '8px',
                            border: 'none',
                            background: role === 'driver' ? 'white' : 'transparent',
                            color: role === 'driver' ? 'var(--primary)' : 'var(--text-muted)',
                            fontWeight: '600',
                            boxShadow: role === 'driver' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        Driver
                    </button>
                    <button
                        onClick={() => { setRole('mechanic'); setError(''); }}
                        style={{
                            padding: '10px',
                            borderRadius: '8px',
                            border: 'none',
                            background: role === 'mechanic' ? 'white' : 'transparent',
                            color: role === 'mechanic' ? 'var(--primary)' : 'var(--text-muted)',
                            fontWeight: '600',
                            boxShadow: role === 'mechanic' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        Mechanic
                    </button>
                </div>

                {error && (
                    <div style={{
                        background: '#FEF2F2',
                        color: '#DC2626',
                        padding: '12px',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        marginBottom: '20px',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ position: 'relative', marginBottom: '16px' }}>
                        <Mail size={20} style={{ position: 'absolute', top: '16px', left: '16px', color: '#94A3B8' }} />
                        <input
                            type="email"
                            placeholder="Email Address"
                            style={{ paddingLeft: '48px' }}
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>

                    <div style={{ position: 'relative', marginBottom: '24px' }}>
                        <Lock size={20} style={{ position: 'absolute', top: '16px', left: '16px', color: '#94A3B8' }} />
                        <input
                            type="password"
                            placeholder="Password"
                            style={{ paddingLeft: '48px' }}
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'} <ArrowRight size={18} />
                    </button>
                </form>

                <p style={{ marginTop: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>Create Account</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
