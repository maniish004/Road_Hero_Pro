import React, { useState, useContext, useEffect } from 'react';
import AuthContext from '../context/AuthContext';
import api from '../api';
import { Link } from 'react-router-dom';
import { Mail, Lock, Phone, User, Wrench, ArrowRight } from 'lucide-react';

const Register = () => {
    const { login } = useContext(AuthContext);
    const [role, setRole] = useState('driver');
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', phone: '', serviceType: 'General'
    });
    const [location, setLocation] = useState({ lat: 0, lng: 0 });
    const [error, setError] = useState('');

    // Support role pre-selection from URL
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const urlRole = params.get('role');
        if (urlRole === 'mechanic' || urlRole === 'driver') {
            setRole(urlRole);
        }
    }, []);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            (err) => console.error(err)
        );
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Basic Validations
        if (formData.name.trim().length < 2) {
            return setError('Full name must be at least 2 characters');
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            return setError('Please enter a valid email address');
        }

        if (formData.password.length < 6) {
            return setError('Password must be at least 6 characters');
        }

        const phoneRegex = /^\+?[\d\s-]{10,}$/;
        if (!phoneRegex.test(formData.phone)) {
            return setError('Please enter a valid phone number (min 10 digits)');
        }

        if (role === 'mechanic' && (location.lat === 0 && location.lng === 0)) {
            return setError('Unable to detect location. Please enable GPS and try again.');
        }

        try {
            const payload = { ...formData, latitude: location.lat, longitude: location.lng };
            const res = await api.post(`/auth/${role}/register`, payload);
            if (res.data.success) {
                login(res.data.data);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-bg-logo" style={{ opacity: 0.05 }}>
                <img src="/logo.png" alt="" style={{ width: '800px', height: '800px', objectFit: 'contain' }} />
            </div>

            <div className="premium-card fade-in" style={{ width: '100%', maxWidth: '480px', padding: '40px', position: 'relative', zIndex: 1 }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ width: '80px', height: '80px', background: 'white', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 15px 30px rgba(0,0,0,0.1)', overflow: 'hidden', padding: '10px' }}>
                        <img src="/logo.png" alt="RoadHero" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--text-primary)' }}>Create Account</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Join the RoadHero network</p>
                </div>

                {/* Role Switcher */}
                <div style={{
                    background: '#F1F5F9',
                    padding: '4px',
                    borderRadius: '12px',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    marginBottom: '24px'
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

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ position: 'relative' }}>
                        <User size={20} style={{ position: 'absolute', top: '16px', left: '16px', color: '#94A3B8' }} />
                        <input
                            type="text" placeholder="Full Name" required
                            style={{ paddingLeft: '48px' }}
                            value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Mail size={20} style={{ position: 'absolute', top: '16px', left: '16px', color: '#94A3B8' }} />
                        <input
                            type="email" placeholder="Email Address" required
                            style={{ paddingLeft: '48px' }}
                            value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Lock size={20} style={{ position: 'absolute', top: '16px', left: '16px', color: '#94A3B8' }} />
                        <input
                            type="password" placeholder="Create Password" required
                            style={{ paddingLeft: '48px' }}
                            value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Phone size={20} style={{ position: 'absolute', top: '16px', left: '16px', color: '#94A3B8' }} />
                        <input
                            type="tel" placeholder="Phone Number" required
                            style={{ paddingLeft: '48px' }}
                            value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>

                    {role === 'mechanic' && (
                        <div style={{ animation: 'slideUp 0.3s ease-out' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Specialization</label>
                            <select
                                value={formData.serviceType}
                                onChange={e => setFormData({ ...formData, serviceType: e.target.value })}
                                style={{ background: 'white' }}
                            >
                                <option value="General">General Mechanic</option>
                                <option value="Towing">Towing Service</option>
                                <option value="Tire">Tire Change</option>
                                <option value="Fuel">Fuel Delivery</option>
                            </select>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                                📍 Make sure your browser's location access is enabled.
                            </p>
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '56px', marginTop: '8px' }}>
                        Create Account <ArrowRight size={18} />
                    </button>
                </form>

                <p style={{ marginTop: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '700', textDecoration: 'none' }}>Log In</Link>
                </p>
            </div>
        </div>
    );

};

export default Register;
