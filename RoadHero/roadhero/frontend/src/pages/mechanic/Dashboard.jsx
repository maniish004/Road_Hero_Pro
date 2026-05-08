import React from 'react';
import { Star, Clock, TrendingUp, CheckCircle, Activity } from 'lucide-react';
import { useMechanic } from '../../context/MechanicContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const { completedJobs, activeJobs, mechanicInfo } = useMechanic();

    const recentJobs = [...completedJobs].slice(0, 3);
    const totalEarnings = completedJobs.reduce((acc, j) => acc + (j.price || 0), 0);
    const weeklyEarnings = completedJobs.filter(j => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return new Date(j.createdAt) > weekAgo;
    }).reduce((acc, j) => acc + (j.price || 0), 0);

    return (
        <div className="slide-up">
            <div className="flex-between" style={{ marginBottom: '32px' }}>
                <div>
                    <h1 className="section-title" style={{ marginBottom: '8px' }}>
                        Welcome back, <span style={{ color: 'var(--primary)' }}>{mechanicInfo?.name}</span>
                    </h1>
                    <p className="section-subtitle">You have {activeJobs.length} active missions today.</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div className="premium-badge" style={{ background: '#DCFCE7', color: '#166534' }}>
                        <Activity size={14} /> System Online
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '40px' }}>
                <div className="stat-card">
                    <span className="stat-label">Total Earnings</span>
                    <div className="stat-value" style={{ color: 'var(--secondary)' }}>${totalEarnings}</div>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Active Jobs</span>
                    <div className="stat-value" style={{ color: 'var(--primary)' }}>{activeJobs.length}</div>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Rating</span>
                    <div className="stat-value flex-center" style={{ gap: '8px' }}>
                        {mechanicInfo?.rating || 5.0}
                        <Star size={20} style={{ color: '#F59E0B', fill: '#F59E0B' }} />
                    </div>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Efficiency</span>
                    <div className="stat-value">98%</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '32px' }}>
                <div className="premium-card" style={{ padding: '32px' }}>
                    <div className="flex-between" style={{ marginBottom: '32px' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <TrendingUp size={22} color="var(--primary)" /> 7-Day Performance
                        </h3>
                        <div style={{ fontSize: '0.75rem', fontWeight: '800', background: 'var(--light-bg)', padding: '6px 16px', borderRadius: '100px', color: 'var(--text-secondary)' }}>
                            Revenue Analysis
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', height: '260px', padding: '0 20px', marginBottom: '12px' }}>
                        {(() => {
                            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                            const last7Days = [...Array(7)].map((_, i) => {
                                const d = new Date();
                                d.setDate(d.getDate() - i);
                                return d;
                            }).reverse();

                            const earningsByDay = last7Days.map(date => {
                                const dayName = days[date.getDay()];
                                const total = completedJobs
                                    .filter(job => new Date(job.createdAt).toDateString() === date.toDateString())
                                    .reduce((acc, job) => acc + (job.price || 0), 0);
                                return { dayName, total };
                            });

                            const maxEarnings = Math.max(...earningsByDay.map(d => d.total), 100);

                            return earningsByDay.map((data, idx) => (
                                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', position: 'relative' }}>
                                    <div className="flex-center" style={{
                                        position: 'absolute',
                                        top: '-30px',
                                        fontSize: '0.7rem',
                                        fontWeight: '900',
                                        color: data.total > 0 ? 'var(--secondary)' : 'var(--text-muted)',
                                        background: data.total > 0 ? '#F0FDF4' : 'transparent',
                                        padding: '2px 6px',
                                        borderRadius: '6px'
                                    }}>
                                        ${data.total}
                                    </div>
                                    <div style={{
                                        width: '100%',
                                        height: `${(data.total / maxEarnings) * 100}%`,
                                        minHeight: '8px',
                                        background: data.total > 0 ? 'linear-gradient(to top, var(--primary), var(--primary-light))' : '#F1F5F9',
                                        borderRadius: '8px',
                                        transition: 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                        boxShadow: data.total > 0 ? '0 4px 12px var(--primary-glow)' : 'none'
                                    }} />
                                    <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-secondary)' }}>{data.dayName}</div>
                                </div>
                            ));
                        })()}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    <div className="premium-card" style={{ padding: '32px', borderLeft: '8px solid var(--secondary)' }}>
                        <div className="flex-between" style={{ marginBottom: '12px' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Weekly Revenue</span>
                            <TrendingUp size={16} color="var(--secondary)" />
                        </div>
                        <div style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '12px' }}>
                            ${weeklyEarnings}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#166534', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle size={14} /> +12% from last week
                        </div>
                    </div>

                    <div className="premium-card" style={{ padding: '32px' }}>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: '900', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Recent Work</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {recentJobs.length > 0 ? recentJobs.map((job, i) => (
                                <div key={i} className="flex-between" style={{ paddingBottom: '16px', borderBottom: i !== recentJobs.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                                    <div>
                                        <div style={{ fontWeight: '800', fontSize: '0.9rem' }}>{job.driverName || 'Elite Customer'}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{job.serviceType} • {new Date(job.createdAt).toLocaleDateString()}</div>
                                    </div>
                                    <div style={{ fontWeight: '900', color: 'var(--secondary)' }}>+${job.price}</div>
                                </div>
                            )) : (
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>No recent history found.</p>
                            )}
                            <Link to="/mechanic/history" style={{ textAlign: 'center', fontSize: '0.8rem', fontWeight: '800', color: 'var(--primary)', textDecoration: 'none', marginTop: '8px' }}>View Full History</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
