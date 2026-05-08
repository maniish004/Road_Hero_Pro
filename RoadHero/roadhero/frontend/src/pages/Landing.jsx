import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Zap, Wrench, Clock, ArrowRight, Star, HeartHandshake } from 'lucide-react';

const Landing = () => {
    return (
        <div style={{ background: 'var(--light-bg)', minHeight: '100vh' }}>
            {/* Professional Navigation */}
            <nav className="glass" style={{ position: 'fixed', top: 0, width: '100%', zIndex: 1000, padding: '1.5rem 0' }}>
                <div className="container flex-between">
                    <div className="flex-center" style={{ gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', background: 'var(--primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img src="/logo.png" alt="Hero" style={{ width: '24px', height: '24px' }} />
                        </div>
                        <span style={{ fontSize: '1.5rem', fontWeight: '900', letterSpacing: '-1px' }}>RoadHero</span>
                    </div>
                    <div className="flex-center" style={{ gap: '24px' }}>
                        <Link to="/login" style={{ textDecoration: 'none', color: 'var(--text-secondary)', fontWeight: '700' }}>Login</Link>
                        <Link to="/register" className="btn btn-primary" style={{ padding: '10px 24px' }}>Get Started</Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section style={{ paddingTop: '160px', paddingBottom: '100px', textAlign: 'center', background: 'radial-gradient(circle at top right, #fef2f2, transparent 400px), radial-gradient(circle at bottom left, #eff6ff, transparent 400px)' }}>
                <div className="container">
                    <div className="premium-badge" style={{ background: '#EEF2FF', color: '#4F46E5', marginBottom: '24px' }}>🚀 Trusted by 10,000+ drivers</div>
                    <h1 style={{ fontSize: '4.5rem', fontWeight: '900', lineHeight: 1.1, marginBottom: '24px', letterSpacing: '-2px' }}>
                        Vehicle Breakdown? <br />
                        <span style={{ color: 'var(--primary)' }}>Help is 12 Minutes Away.</span>
                    </h1>
                    <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '700px', margin: '0 auto 40px', lineHeight: 1.6 }}>
                        The premium roadside assistance network connecting you with Elite mechanics in real-time. Transparent pricing, live tracking, and total peace of mind.
                    </p>
                    <div className="flex-center" style={{ gap: '16px' }}>
                        <Link to="/register?role=driver" className="btn btn-primary" style={{ padding: '16px 40px', fontSize: '1.1rem' }}>
                            Request Help Now <ArrowRight size={20} />
                        </Link>
                        <Link to="/register?role=mechanic" className="btn btn-secondary" style={{ padding: '16px 40px', fontSize: '1.1rem' }}>
                            Become a Partner <Wrench size={20} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Feature Stats */}
            <section style={{ padding: '80px 0' }}>
                <div className="container">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '32px' }}>
                        {[
                            { label: 'Avg. Response Time', value: '12m', icon: <Clock color="var(--primary)" /> },
                            { label: 'Elite Mechanics', value: '450+', icon: <Wrench color="#10B981" /> },
                            { label: 'Avg. Rating', value: '4.9/5', icon: <Star color="#F59E0B" /> },
                            { label: 'Cities Covered', value: '24', icon: <Zap color="#8B5CF6" /> }
                        ].map((stat, i) => (
                            <div key={i} className="premium-card flex-center" style={{ flexDirection: 'column', padding: '32px' }}>
                                {stat.icon}
                                <div style={{ fontSize: '2.5rem', fontWeight: '900', margin: '12px 0 4px' }}>{stat.value}</div>
                                <div style={{ color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', fontSize: '0.75rem' }}>{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Services Grid */}
            <section style={{ padding: '100px 0', background: 'white' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '64px' }}>
                        <h2 className="section-title" style={{ fontSize: '3rem' }}>Complete Roadside Ecosystem</h2>
                        <p className="section-subtitle">Premium solutions for every vehicular emergency.</p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px' }}>
                        {[
                            { title: 'Premium Towing', desc: 'Flatbed towing with white-glove service for your luxury or daily vehicle.', icon: '🚛' },
                            { title: 'Tire Specialists', desc: 'On-site repair or replacement. We come to you with the right equipment.', icon: '🛞' },
                            { title: 'Battery & Fuel', desc: 'Rapid response for jump-starts or emergency fuel delivery anywhere.', icon: '🔋' },
                            { title: 'Live Live Tracking', desc: 'Watch your mechanic arrival in real-time on our high-precision maps.', icon: '📍' },
                            { title: 'Fixed Pricing', desc: 'No haggling. Transparent, pre-calculated rates based on your distance.', icon: '💎' },
                            { title: 'Mechanic Marketplace', desc: 'Certified professionals only. Every partner is thoroughly vetted.', icon: '🤝' }
                        ].map((service, i) => (
                            <div key={i} className="premium-card" style={{ textAlign: 'left', border: 'none', background: '#F8FAFC' }}>
                                <div style={{ fontSize: '2.5rem', marginBottom: '24px' }}>{service.icon}</div>
                                <h3 style={{ fontWeight: '900', marginBottom: '12px' }}>{service.title}</h3>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{service.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Business/Mechanic Section */}
            <section style={{ padding: '100px 0', background: 'var(--dark-bg)', color: 'white' }}>
                <div className="container">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
                        <div className="premium-card" style={{ padding: '60px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div className="premium-badge" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', marginBottom: '24px' }}>PARTNER PORTAL</div>
                            <h2 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '24px' }}>Are You a Skilled Mechanic?</h2>
                            <p style={{ fontSize: '1.2rem', opacity: 0.8, marginBottom: '40px', lineHeight: 1.6 }}>
                                Join our network of elite service providers. Manage multiple jobs, set your own schedule, and grow your business with RoadHero Pro.
                            </p>
                            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '40px' }}>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}><Zap size={20} color="var(--secondary)" /> Flexible working hours</li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}><Zap size={20} color="var(--secondary)" /> Guaranteed weekly payouts</li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}><Zap size={20} color="var(--secondary)" /> Intelligent job dispatching</li>
                            </ul>
                            <Link to="/register?role=mechanic" className="btn btn-primary" style={{ background: 'white', color: 'var(--dark-bg)', padding: '16px 40px' }}>Apply to Join</Link>
                        </div>
                        <div className="flex-center">
                            <img src="/repair.png" alt="Mechanic" style={{ width: '100%', borderRadius: '40px', boxShadow: '0 40px 100px rgba(0,0,0,0.5)' }} />
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ padding: '60px 0', borderTop: '1px solid var(--glass-border)' }}>
                <div className="container flex-between">
                    <div className="flex-center" style={{ gap: '12px' }}>
                        <span style={{ fontSize: '1.2rem', fontWeight: '900' }}>RoadHero</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>© 2026 Premium Assistance. All rights reserved.</span>
                    </div>
                    <div style={{ display: 'flex', gap: '32px' }}>
                        <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>Privacy Policy</a>
                        <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>Terms of Service</a>
                        <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>Contact Support</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
