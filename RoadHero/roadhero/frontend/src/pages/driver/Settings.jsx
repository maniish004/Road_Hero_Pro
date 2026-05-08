import React, { useState, useContext } from 'react';
import { User, Bell, Shield, LogOut, Car, History } from 'lucide-react';
import AuthContext from '../../context/AuthContext';
import { useDriver } from '../../context/DriverContext';

const Settings = () => {
    const { user, logout } = useContext(AuthContext);
    const { addToast } = useDriver();
    const [activeTab, setActiveTab] = useState('profile');

    return (
        <div className="slide-up">
            <h2 className="section-title">My <span style={{ color: 'var(--primary)' }}>Settings</span></h2>
            <p className="section-subtitle">Manage your account preferences and security.</p>

            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '40px' }}>
                <aside style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button onClick={() => setActiveTab('profile')} className={`settings-nav-btn ${activeTab === 'profile' ? 'active' : ''}`}>
                        <User size={20} /> Profile Settings
                    </button>
                    <button onClick={() => setActiveTab('notifications')} className={`settings-nav-btn ${activeTab === 'notifications' ? 'active' : ''}`}>
                        <Bell size={20} /> Notifications
                    </button>
                    <button onClick={() => setActiveTab('security')} className={`settings-nav-btn ${activeTab === 'security' ? 'active' : ''}`}>
                        <Shield size={20} /> Security & Privacy
                    </button>
                    <div style={{ margin: '12px 0', height: '1px', background: 'var(--glass-border)' }}></div>
                    <button onClick={logout} className="settings-nav-btn" style={{ color: 'var(--accent)' }}>
                        <LogOut size={20} /> Logout Session
                    </button>
                </aside>

                <div className="premium-card" style={{ padding: '40px' }}>
                    {activeTab === 'profile' && (
                        <div className="fade-in">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '32px', marginBottom: '40px' }}>
                                <div style={{
                                    width: '100px',
                                    height: '100px',
                                    borderRadius: '32px',
                                    background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '3rem',
                                    color: 'white',
                                    boxShadow: '0 12px 24px var(--primary-glow)'
                                }}>
                                    {user?.name?.charAt(0) || 'D'}
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: '900', marginBottom: '4px' }}>{user?.name}</h3>
                                    <p style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>Driver Member since 2026</p>
                                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                                        <div className="premium-badge" style={{ background: '#E0F2FE', color: '#0369A1' }}>VERIFIED</div>
                                        <div className="premium-badge" style={{ background: '#F0F9FF', color: '#0EA5E9' }}>PRO USER</div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid-2">
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase' }}>Full Name</label>
                                    <input defaultValue={user?.name} readOnly style={{ background: '#F8FAFC' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase' }}>Phone Number</label>
                                    <input defaultValue={user?.phone} readOnly style={{ background: '#F8FAFC' }} />
                                </div>
                            </div>

                            <div style={{ marginTop: '24px' }}>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase' }}>Email Address</label>
                                <input defaultValue={user?.email} readOnly style={{ background: '#F8FAFC' }} />
                            </div>

                            <div style={{ marginTop: '40px', padding: '24px', background: '#F8FAFC', borderRadius: '24px', border: '1px solid var(--glass-border)' }}>
                                <h4 style={{ fontSize: '0.9rem', fontWeight: '800', marginBottom: '16px' }}>Account Status</h4>
                                <div style={{ display: 'flex', gap: '24px' }}>
                                    <div style={{ flex: 1, textAlign: 'center' }}>
                                        <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--primary)' }}>12</div>
                                        <div style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-secondary)' }}>JOBS DONE</div>
                                    </div>
                                    <div style={{ width: '1px', background: '#E2E8F0' }}></div>
                                    <div style={{ flex: 1, textAlign: 'center' }}>
                                        <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--secondary)' }}>4.9</div>
                                        <div style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-secondary)' }}>USER RATING</div>
                                    </div>
                                    <div style={{ width: '1px', background: '#E2E8F0' }}></div>
                                    <div style={{ flex: 1, textAlign: 'center' }}>
                                        <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#F59E0B' }}>Gold</div>
                                        <div style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-secondary)' }}>TIER</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="fade-in">
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '900', marginBottom: '24px' }}>Push Notifications</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div className="flex-between" style={{ padding: '4px 0' }}>
                                    <div>
                                        <div style={{ fontWeight: '800' }}>Active Job Updates</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Get notified when a mechanic accepts or arrives.</div>
                                    </div>
                                    <div className="toggle-mock active"></div>
                                </div>
                                <div className="flex-between" style={{ padding: '4px 0' }}>
                                    <div>
                                        <div style={{ fontWeight: '800' }}>Chat Messages</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Real-time alerts for incoming mechanic chats.</div>
                                    </div>
                                    <div className="toggle-mock active"></div>
                                </div>
                                <div className="flex-between" style={{ padding: '4px 0' }}>
                                    <div>
                                        <div style={{ fontWeight: '800' }}>Promotions & Offers</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Occasional discounts for roadside services.</div>
                                    </div>
                                    <div className="toggle-mock"></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="fade-in">
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '900', marginBottom: '32px' }}>Security Settings</h3>
                            <button className="btn btn-secondary" style={{ width: '100%', marginBottom: '16px', justifyContent: 'flex-start' }}>Change Account Password</button>
                            <button className="btn btn-secondary" style={{ width: '100%', marginBottom: '16px', justifyContent: 'flex-start' }}>Two-Factor Authentication</button>
                            <button className="btn btn-secondary" style={{ width: '100%', marginBottom: '16px', justifyContent: 'flex-start', color: 'var(--accent)' }}>Deactivate Account</button>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .settings-nav-btn {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 14px 20px;
                    border-radius: 12px;
                    border: none;
                    background: transparent;
                    color: var(--text-secondary);
                    font-weight: 700;
                    cursor: pointer;
                    transition: 0.3s;
                    text-align: left;
                    font-size: 0.95rem;
                }
                .settings-nav-btn:hover {
                    background: white;
                    color: var(--primary);
                }
                .settings-nav-btn.active {
                    background: var(--primary);
                    color: white;
                    box-shadow: 0 4px 12px var(--primary-glow);
                }
                .toggle-mock {
                    width: 48px;
                    height: 24px;
                    background: #E2E8F0;
                    border-radius: 100px;
                    position: relative;
                    cursor: pointer;
                    transition: 0.3s;
                }
                .toggle-mock::after {
                    content: '';
                    position: absolute;
                    width: 18px;
                    height: 18px;
                    background: white;
                    border-radius: 50%;
                    top: 3px;
                    left: 3px;
                    transition: 0.3s;
                }
                .toggle-mock.active {
                    background: var(--secondary);
                }
                .toggle-mock.active::after {
                    transform: translateX(24px);
                }
            `}</style>
        </div >
    );
};

export default Settings;
