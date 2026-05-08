import React from 'react';
import { Clock, Search, ChevronRight, CheckCircle } from 'lucide-react';
import { useDriver } from '../../context/DriverContext';

const History = () => {
    const { history } = useDriver();

    const services = [
        { id: 'General', name: 'Repair', icon: '🔧' },
        { id: 'Tire', name: 'Flat Tire', icon: '🛞' },
        { id: 'Fuel', name: 'Fuel', icon: '⛽' },
        { id: 'Towing', name: 'Towing', icon: '🛻' }
    ];

    return (
        <div className="slide-up">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-1.5px', marginBottom: '8px' }}>
                        Your <span style={{ color: 'var(--text-secondary)' }}>Trips</span>
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Review your past service requests and payments.</p>
                </div>
                <div style={{ position: 'relative', width: '320px' }}>
                    <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search service history..."
                        style={{ padding: '14px 16px 14px 52px', fontSize: '0.95rem', borderRadius: '100px', background: 'white' }}
                    />
                </div>
            </div>

            {history.length === 0 ? (
                <div className="premium-card" style={{ padding: '80px', textAlign: 'center', opacity: 0.6 }}>
                    <Clock size={64} color="var(--text-muted)" style={{ margin: '0 auto 24px', display: 'block' }} />
                    <h3 style={{ fontWeight: '800' }}>No trips yet</h3>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>When you complete your first service, it will appear here.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {history.map(item => (
                        <div key={item._id} className="premium-card" style={{ padding: '0', overflow: 'hidden' }}>
                            <div style={{ display: 'flex', alignItems: 'center', padding: '24px 32px' }}>
                                <div style={{ width: '64px', height: '64px', background: 'var(--light-bg)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>
                                    {services.find(s => s.id === item.serviceType)?.icon || '🔧'}
                                </div>

                                <div style={{ marginLeft: '24px', flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <h4 style={{ margin: 0, fontWeight: '900', fontSize: '1.2rem' }}>{item.serviceType}</h4>
                                        <span style={{ fontSize: '0.7rem', fontWeight: '900', color: 'var(--secondary)', background: '#F0FDF4', padding: '4px 12px', borderRadius: '100px', textTransform: 'uppercase' }}>Completed</span>
                                    </div>
                                    <p style={{ margin: '6px 0 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                        {new Date(item.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>

                                {item.assignedMechanic && (
                                    <div style={{ marginRight: '40px', textAlign: 'right' }}>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>Mechanic</p>
                                        <p style={{ fontWeight: '800', fontSize: '0.95rem' }}>{item.assignedMechanic.name}</p>
                                    </div>
                                )}

                                <div style={{ textAlign: 'right', marginRight: '40px' }}>
                                    <div style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--text-primary)' }}>${item.price || 0}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end', color: 'var(--secondary)', fontWeight: '800', fontSize: '0.75rem' }}>
                                        <CheckCircle size={14} /> PAID
                                    </div>
                                </div>

                                <button className="btn-icon">
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <style>{`
                .btn-icon {
                    width: 44px;
                    height: 44px;
                    border-radius: 12px;
                    border: 1px solid var(--glass-border);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: 0.2s;
                    background: white;
                    color: var(--text-muted);
                }
                .btn-icon:hover {
                    color: var(--primary);
                    background: var(--light-bg);
                    border-color: var(--primary-light);
                }
            `}</style>
        </div>
    );
};

export default History;
