import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { MapPin, History, Car, LogOut, ShieldAlert, HeartHandshake, Settings } from 'lucide-react';
import AuthContext from '../context/AuthContext';
import { useDriver } from '../context/DriverContext';

const DriverNavbar = () => {
    const { logout, user } = useContext(AuthContext);
    const { requestStatus, hasNewMessage } = useDriver();

    return (
        <header className="navbar">
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', background: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                            <img src="/logo.png" style={{ width: '28px' }} alt="" />
                        </div>
                        <span style={{ fontWeight: '900', fontSize: '1.4rem', letterSpacing: '-1px' }}>RoadHero</span>
                    </div>

                    <nav style={{ display: 'flex', gap: '4px' }}>
                        <NavLink to="/driver/home" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                            <MapPin size={18} /> For Myself
                        </NavLink>
                        <NavLink to="/driver/friend" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                            <HeartHandshake size={18} /> For a Friend
                        </NavLink>
                        <NavLink to="/driver/activity" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                            <ShieldAlert size={18} />
                            <span>Activity</span>
                            {requestStatus && requestStatus !== 'COMPLETED' && (
                                <span className="status-dot"></span>
                            )}
                            {hasNewMessage && <span className="msg-dot"></span>}
                        </NavLink>
                        <NavLink to="/driver/garage" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                            <Car size={18} /> My Garage
                        </NavLink>
                        <NavLink to="/driver/history" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                            <History size={18} /> History
                        </NavLink>
                        <NavLink to="/driver/settings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                            <Settings size={18} /> Settings
                        </NavLink>
                    </nav>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ fontWeight: '800', fontSize: '0.9rem', margin: 0 }}>{user?.name}</p>
                        <span style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: '800', textTransform: 'uppercase' }}>Premium Member</span>
                    </div>
                    <button onClick={logout} className="btn-icon" title="Logout">
                        <LogOut size={18} />
                    </button>
                </div>
            </div>

            <style>{`
                .nav-link {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 20px;
                    border-radius: 14px;
                    text-decoration: none;
                    color: var(--text-secondary);
                    font-weight: 700;
                    font-size: 0.9rem;
                    transition: 0.3s;
                    position: relative;
                }
                .nav-link:hover {
                    background: rgba(99, 102, 241, 0.05);
                    color: var(--primary);
                }
                .nav-link.active {
                    background: var(--primary);
                    color: white;
                }
                .status-dot {
                    width: 8px;
                    height: 8px;
                    background: var(--secondary);
                    border-radius: 50%;
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    border: 2px solid white;
                    animation: pulse 2s infinite;
                }
                .msg-dot {
                    width: 8px;
                    height: 8px;
                    background: var(--accent);
                    border-radius: 50%;
                    position: absolute;
                    top: 8px;
                    right: 0px;
                    border: 2px solid white;
                }
                .btn-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 12px;
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

export default DriverNavbar;
