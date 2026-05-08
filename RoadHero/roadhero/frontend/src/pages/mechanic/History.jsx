import React from 'react';
import { Clock, Search, ChevronRight } from 'lucide-react';
import { useMechanic } from '../../context/MechanicContext';

const History = () => {
    const { completedJobs } = useMechanic();

    return (
        <div className="slide-up">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '900', letterSpacing: '-0.5px' }}>Job <span style={{ color: 'var(--text-secondary)' }}>History</span></h2>
                <div style={{ position: 'relative', width: '300px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search jobs..."
                        style={{ padding: '10px 16px 10px 48px', fontSize: '0.85rem', borderRadius: '100px' }}
                    />
                </div>
            </div>

            {completedJobs.length === 0 ? (
                <div className="premium-card" style={{ padding: '80px', textAlign: 'center', opacity: 0.6 }}>
                    <Clock size={64} color="var(--text-muted)" style={{ margin: '0 auto 20px', display: 'block' }} />
                    <h3 style={{ fontWeight: '700' }}>No history yet</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '8px' }}>Once you complete your first job, it will appear here.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {completedJobs.map(job => (
                        <div key={job._id} className="premium-card" style={{ padding: '0', overflow: 'hidden' }}>
                            <div style={{ display: 'flex', alignItems: 'center', padding: '20px 32px' }}>
                                <div style={{ width: '56px', height: '56px', background: '#F1F5F9', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                                    {job.serviceType === 'Towing' ? '🛻' : '🔧'}
                                </div>

                                <div style={{ marginLeft: '24px', flex: 1 }}>
                                    <h4 style={{ margin: 0, fontWeight: '900', fontSize: '1.1rem' }}>{job.driverName}</h4>
                                    <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                        {new Date(job.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })} • {job.serviceType}
                                    </p>
                                </div>

                                <div style={{ textAlign: 'right', marginRight: '40px' }}>
                                    <div style={{ fontSize: '1.3rem', fontWeight: '900', color: 'var(--secondary)' }}>+${job.price || 0}</div>
                                    <span style={{
                                        fontSize: '0.65rem',
                                        fontWeight: '800',
                                        color: job.status === 'PAYMENT_PENDING' ? 'var(--accent)' : 'var(--secondary)',
                                        textTransform: 'uppercase',
                                        background: job.status === 'PAYMENT_PENDING' ? '#FFF1F2' : '#F0FDF4',
                                        padding: '4px 10px',
                                        borderRadius: '100px'
                                    }}>
                                        {job.status === 'PAYMENT_PENDING' ? 'Pending Payment' : 'Paid'}
                                    </span>
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
                    width: 42px;
                    height: 42px;
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
                }
            `}</style>
        </div>
    );
};

export default History;
