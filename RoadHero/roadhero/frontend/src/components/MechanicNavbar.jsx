import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Wrench, Clock, Settings, LogOut, Shield } from 'lucide-react';
import AuthContext from '../context/AuthContext';
import { useMechanic } from '../context/MechanicContext';

const MechanicNavbar = () => {
    const { logout, user } = useContext(AuthContext);
    const { isAvailable, toggleAvailability } = useMechanic();

    return (
        <header className="navbar">
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '36px', height: '36px', background: 'white', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                            <img src="/logo.png" style={{ width: '24px' }} alt="" />
                        </div>
                        <span style={{ fontWeight: '900', fontSize: '1.2rem', letterSpacing: '-0.5px' }}>RoadHero <span style={{ color: 'var(--primary)' }}>Pro</span></span>
                    </div>

                    <nav style={{ display: 'flex', gap: '8px' }}>
                        <NavLink to="/mechanic/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                            <LayoutDashboard size={18} /> Dashboard
                        </NavLink>
                        <NavLink to="/mechanic/jobs" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                            <Wrench size={18} /> Near You
                        </NavLink>
                        <NavLink to="/mechanic/active" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                            <Shield size={18} /> Active Jobs
                        </NavLink>
                        <NavLink to="/mechanic/history" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                            <Clock size={18} /> History
                        </NavLink>
                        <NavLink to="/mechanic/settings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                            <Settings size={18} /> Settings
                        </NavLink>
                    </nav>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px 12px', background: 'white', borderRadius: '100px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid var(--glass-border)' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: '800', color: isAvailable ? 'var(--secondary)' : 'var(--text-muted)' }}>
                            {isAvailable ? 'ONLINE' : 'OFFLINE'}
                        </span>
                        <div
                            onClick={toggleAvailability}
                            style={{
                                width: '38px',
                                height: '20px',
                                background: isAvailable ? 'var(--secondary)' : '#CBD5E1',
                                borderRadius: '100px',
                                position: 'relative',
                                cursor: 'pointer',
                                transition: '0.3s'
                            }}
                        >
                            <div style={{
                                width: '14px',
                                height: '14px',
                                background: 'white',
                                borderRadius: '50%',
                                position: 'absolute',
                                top: '3px',
                                left: isAvailable ? '21px' : '3px',
                                transition: '0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                            }} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ fontWeight: '800', fontSize: '0.85rem', margin: 0 }}>{user?.name}</p>
                            <span style={{ fontSize: '0.65rem', color: isAvailable ? 'var(--secondary)' : 'var(--text-muted)', fontWeight: '800' }}>
                                {isAvailable ? 'Receiving Jobs' : 'Unavailable'}
                            </span>
                        </div>
                        <button onClick={logout} className="btn-icon" title="Logout">
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                .nav-link {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 16px;
                    border-radius: 12px;
                    text-decoration: none;
                    color: var(--text-secondary);
                    font-weight: 700;
                    font-size: 0.85rem;
                    transition: 0.3s;
                }
                .nav-link:hover {
                    background: rgba(99, 102, 241, 0.05);
                    color: var(--primary);
                }
                .nav-link.active {
                    background: var(--primary);
                    color: white;
                }
                .btn-icon {
                    width: 36px;
                    height: 36px;
                    border-radius: 10px;
                    border: 1px solid var(--glass-border);
                    background: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: 0.3s;
                    color: var(--text-secondary);
                }
                .btn-icon:hover {
                    background: #FEF2F2;
                    color: var(--accent);
                    border-color: #FEE2E2;
                }
            `}</style>
        </header>
    );
};

export default MechanicNavbar;
