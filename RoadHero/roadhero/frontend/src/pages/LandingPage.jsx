import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Clock, MapPin, Wrench, Phone, CheckCircle, Star, Send } from 'lucide-react';

const LandingPage = () => {
    return (
        <div style={{ background: 'var(--light-bg)', minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>
            {/* Large Background Logo Watermark */}
            <div style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                opacity: 0.05,
                zIndex: 0,
                pointerEvents: 'none'
            }}>
                <img src="/logo.png" alt="" style={{ width: '800px', height: '800px', objectFit: 'contain' }} />
            </div>

            {/* Navigation */}
            <nav className="navbar">
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '44px', height: '44px', background: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(0,0,0,0.1)', overflow: 'hidden', padding: '6px' }}>
                            <img src="/logo.png" alt="RoadHero Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
                        <span style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-1px', color: 'var(--text-primary)' }}>RoadHero</span>
                    </div>
                    <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
                        <a href="#about" style={{ color: 'var(--text-secondary)', fontWeight: '600', textDecoration: 'none' }}>About</a>
                        <a href="#contact" style={{ color: 'var(--text-secondary)', fontWeight: '600', textDecoration: 'none' }}>Contact</a>
                        <Link to="/login" style={{ color: 'var(--text-secondary)', fontWeight: '600', textDecoration: 'none' }}>Login</Link>
                        <Link to="/register" className="btn btn-primary" style={{ padding: '0.6rem 1.5rem', borderRadius: '100px' }}>Join Now</Link>
                    </div>

                </div>
            </nav>

            {/* Hero Section */}
            <header style={{ position: 'relative', overflow: 'hidden', paddingTop: '80px', paddingBottom: '120px' }}>
                {/* Decorative Blobs */}
                <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%', filter: 'blur(60px)', zIndex: -1 }} />
                <div style={{ position: 'absolute', bottom: '10%', left: '-5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%', filter: 'blur(60px)', zIndex: -1 }} />

                <div className="container" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) 1fr', gap: '60px', alignItems: 'center' }}>
                    <div className="slide-up">
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '100px', color: 'var(--primary)', fontWeight: '700', fontSize: '0.85rem', marginBottom: '32px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                            <span style={{ display: 'flex', width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%', position: 'relative' }}>
                                <span style={{ position: 'absolute', width: '100%', height: '100%', background: 'var(--primary)', borderRadius: '50%', animation: 'pulse-ring 1.25s cubic-bezier(0.215, 0.61, 0.355, 1) infinite' }}></span>
                            </span>
                            TRUSTED BY 10,000+ DRIVERS
                        </div>
                        <h1 style={{ fontSize: 'clamp(3rem, 8vw, 4.5rem)', lineHeight: '1', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '24px', letterSpacing: '-0.04em' }}>
                            Roadside Help,<br />
                            <span style={{ background: 'linear-gradient(to right, var(--primary), #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Redefined.</span>
                        </h1>
                        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '40px', maxWidth: '540px' }}>
                            Stuck? Don't wait hours for a tow. Connect instantly with local verified mechanics. Real-time tracking, transparent pricing, and peace of mind.
                        </p>
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                            <Link to="/register?role=driver" className="btn btn-primary" style={{ height: '60px', padding: '0 36px', fontSize: '1.1rem', borderRadius: '100px' }}>
                                Find a Mechanic <ArrowRight size={20} />
                            </Link>
                            <Link to="/register?role=mechanic" className="btn btn-secondary" style={{ height: '60px', padding: '0 36px', fontSize: '1.1rem', borderRadius: '100px' }}>
                                Join as Service Provider
                            </Link>
                        </div>

                        <div style={{ marginTop: '48px', display: 'flex', alignItems: 'center', gap: '24px' }}>
                            <div style={{ display: 'flex', gap: '-8px' }}>
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid var(--light-bg)', background: '#cbd5e1', overflow: 'hidden', marginLeft: i > 1 ? '-12px' : 0 }}>
                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=user${i}`} alt="user" />
                                    </div>
                                ))}
                            </div>
                            <div>
                                <div style={{ display: 'flex', gap: '4px', color: '#fbbf24' }}>
                                    {[1, 2, 3, 4, 5].map(i => <Star key={i} size={16} fill="currentColor" />)}
                                </div>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>4.9/5 from 2k+ reviews</p>
                            </div>
                        </div>
                    </div>

                    <div className="fade-in float" style={{ position: 'relative' }}>
                        {/* Mock App UI */}
                        <div className="premium-card" style={{ padding: '0', overflow: 'hidden', boxShadow: '0 50px 100px -20px rgba(0,0,0,0.25)', border: '8px solid var(--dark-surface)', borderRadius: '40px' }}>
                            <div style={{ background: '#1e293b', height: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '40px', height: '4px', background: '#334155', borderRadius: '10px' }}></div>
                            </div>
                            <img src="https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?auto=format&fit=crop&q=80&w=800" alt="Map View" style={{ width: '100%', height: '400px', objectFit: 'cover' }} />
                            <div style={{ padding: '24px', background: 'var(--dark-surface)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <div>
                                        <p style={{ color: 'white', fontWeight: '700', fontSize: '1.1rem' }}>Mechanic En Route</p>
                                        <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Arriving in 8 mins</p>
                                    </div>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Phone color="white" size={20} />
                                    </div>
                                </div>
                                <div style={{ height: '4px', background: '#334155', borderRadius: '10px', overflow: 'hidden' }}>
                                    <div style={{ width: '65%', height: '100%', background: 'var(--primary)', borderRadius: '100px' }}></div>
                                </div>
                            </div>
                        </div>

                        {/* Floating Badge */}
                        <div className="glass" style={{ position: 'absolute', top: '20%', left: '-10%', padding: '16px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '12px', zIndex: 10 }}>
                            <div style={{ width: '40px', height: '40px', background: '#10b981', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <CheckCircle color="white" size={20} />
                            </div>
                            <div>
                                <p style={{ fontWeight: '800', fontSize: '0.9rem', color: 'var(--text-primary)', margin: 0 }}>Verified Help</p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>100% Secure</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Features Section */}
            <section style={{ padding: '100px 0', background: 'var(--light-bg)' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                        <h2 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '16px', letterSpacing: '-0.02em' }}>Everything you need in one app</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>Fast, reliable, and transparent roadside assistance for the modern driver.</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
                        {[
                            { icon: <MapPin />, title: "Precision Location", desc: "Our advanced GPS tracking pins your exact location so help knows exactly where to find you." },
                            { icon: <Clock />, title: "Real-time Tracking", desc: "Watch your mechanic's progress on the map. Know exactly when they'll arrive." },
                            { icon: <Shield />, title: "Verified Pros", desc: "Every mechanic on our platform is vetted and rated by drivers like you." }
                        ].map((feature, idx) => (
                            <div key={idx} className="premium-card">
                                <div style={{ width: '60px', height: '60px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                                    {React.cloneElement(feature.icon, { size: 28 })}
                                </div>
                                <h3 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>{feature.title}</h3>
                                <p style={{ color: 'var(--text-secondary)' }}>{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* About Us Section */}
            <section id="about" style={{ padding: '100px 0', position: 'relative', background: 'white' }}>
                <div className="container">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
                        <div className="premium-card" style={{ padding: '0', height: '500px', overflow: 'hidden' }}>
                            <img src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=1000" alt="About Us" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div>
                            <span className="premium-badge" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', marginBottom: '24px' }}>OUR STORY</span>
                            <h2 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '24px', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>Revolutionizing Roadside Support</h2>
                            <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.8' }}>
                                RoadHero was born out of a simple observation: roadside assistance shouldn't take hours or cost a fortune in hidden fees. We built a platform that puts the power back in the hands of drivers and local mechanics.
                            </p>
                            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '32px' }}>
                                Our mission is to create a safer, more connected road network where help is always just a few taps away. With over 10,000 verified providers, we're building the future of vehicle maintenance.
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                <div>
                                    <h4 style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--primary)' }}>98%</h4>
                                    <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Customer Satisfaction</p>
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--primary)' }}>15min</h4>
                                    <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Average Response Time</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            {/* CTA Section */}
            <section style={{ padding: '100px 0' }}>
                <div className="container">
                    <div className="premium-card" style={{ background: 'var(--primary)', color: 'white', textAlign: 'center', padding: '80px 40px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '300px', height: '300px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(50px)' }} />
                        <h2 style={{ fontSize: '3.5rem', fontWeight: '800', color: 'white', marginBottom: '24px', position: 'relative', zIndex: 1 }}>Ready to hit the road with confidence?</h2>
                        <p style={{ fontSize: '1.25rem', opacity: 0.9, marginBottom: '40px', maxWidth: '700px', margin: '0 auto 40px', position: 'relative', zIndex: 1 }}>
                            Join thousands of drivers who trust RoadHero for their roadside emergencies.
                        </p>
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <Link to="/register" className="btn btn-secondary" style={{ height: '60px', padding: '0 48px', fontSize: '1.1rem', background: 'white', color: 'var(--primary)', fontWeight: '800', borderRadius: '100px' }}>
                                Get Started for Free
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Us Section */}
            <section id="contact" style={{ padding: '100px 0', background: 'var(--light-bg)' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                        <h2 style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '16px' }}>Get in Touch</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>Have questions? Our team is here to help 24/7.</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '40px' }}>
                        <div className="premium-card">
                            <form style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div style={{ textAlign: 'left' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem' }}>Full Name</label>
                                        <input type="text" placeholder="John Doe" />
                                    </div>
                                    <div style={{ textAlign: 'left' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem' }}>Email Address</label>
                                        <input type="email" placeholder="john@example.com" />
                                    </div>
                                </div>
                                <div style={{ textAlign: 'left' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem' }}>Subject</label>
                                    <input type="text" placeholder="How can we help?" />
                                </div>
                                <div style={{ textAlign: 'left' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem' }}>Message</label>
                                    <textarea placeholder="Describe your inquiry..." style={{ minHeight: '150px' }}></textarea>
                                </div>
                                <button className="btn btn-primary" style={{ height: '56px', fontSize: '1.1rem' }}>Send Message</button>
                            </form>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div className="premium-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <div style={{ width: '56px', height: '56px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Phone size={24} />
                                </div>
                                <div style={{ textAlign: 'left' }}>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>Call us at</p>
                                    <p style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>+1 (888) ROAD-PRO</p>
                                </div>
                            </div>

                            <div className="premium-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <div style={{ width: '56px', height: '56px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--secondary)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Send size={24} />
                                </div>
                                <div style={{ textAlign: 'left' }}>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>Email us</p>
                                    <p style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>support@roadhero.ai</p>
                                </div>
                            </div>

                            <div className="premium-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <div style={{ width: '56px', height: '56px', background: 'rgba(244, 63, 94, 0.1)', color: 'var(--accent)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <MapPin size={24} />
                                </div>
                                <div style={{ textAlign: 'left' }}>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>Headquarters</p>
                                    <p style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>Silicon Valley, California</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            {/* Footer */}
            <footer style={{ padding: '60px 0', borderTop: '1px solid var(--glass-border)', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Wrench size={20} color="var(--primary)" />
                        <span style={{ fontWeight: '800', color: 'var(--text-primary)', fontSize: '1.1rem' }}>RoadHero</span>
                    </div>
                    <div style={{ display: 'flex', gap: '32px' }}>
                        <span>© 2026 RoadHero Inc. All rights reserved.</span>
                        <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy Policy</a>
                        <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Terms of Service</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
