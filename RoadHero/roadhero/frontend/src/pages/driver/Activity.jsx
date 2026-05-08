import React, { useState, useEffect, useRef, useContext } from 'react';
import { MessageSquare, Phone, X, Star, Send, ShieldCheck, Clock, MapPin } from 'lucide-react';
import { useDriver } from '../../context/DriverContext';
import AuthContext from '../../context/AuthContext';
import api from '../../api';
import EmptyState from '../../components/EmptyState';
import { Link } from 'react-router-dom';
import MapComponent from '../../components/MapComponent';

const Activity = () => {
    const { user } = useContext(AuthContext);
    const {
        requestId,
        requestStatus,
        mechanicData,
        requestLocation,
        eta,
        chats,
        hasNewMessage,
        setHasNewMessage,
        socket,
        resetRequest,
        addToast,
        loading,
        setLoading
    } = useDriver() || {};

    const [showChat, setShowChat] = useState(false);
    const [chatMessage, setChatMessage] = useState('');
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewComment, setReviewComment] = useState('');
    const [isReviewed, setIsReviewed] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('Card');

    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (showChat) {
            scrollToBottom();
            setHasNewMessage(false);
        }
    }, [chats, showChat, setHasNewMessage]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!chatMessage.trim()) return;
        const chatData = {
            requestId,
            senderId: user._id,
            senderRole: 'driver',
            message: chatMessage
        };
        try {
            await api.post('/chats', chatData);
            if (socket) {
                socket.emit('send_message', chatData);
            }
            setChatMessage('');
        } catch (err) { addToast("Failed to send message", "error"); }
    };

    const handlePayment = async () => {
        if (!requestId) return;
        setLoading(true);
        try {
            const res = await api.patch(`/requests/${requestId}/pay`, { paymentMethod, driverId: user._id });
            if (res.data.success) {
                addToast('Payment successful!');
            }
        } catch (err) {
            addToast(`Payment failed`, "error");
        } finally {
            setLoading(false);
        }
    };

    const submitReview = async () => {
        if (reviewRating === 0) return addToast('Please select a rating', 'error');
        setLoading(true);
        try {
            await api.patch(`/requests/${requestId}/review`, { rating: reviewRating, comment: reviewComment, driverId: user._id });
            setIsReviewed(true);
            addToast('Review submitted!');
            setTimeout(() => resetRequest(), 2000);
        } catch (err) {
            addToast('Failed to submit review', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!requestId || requestStatus === 'CANCELLED') {
        return (
            <div className="slide-up">
                <h2 className="section-title">Active <span style={{ color: 'var(--primary)' }}>Activity</span></h2>
                <EmptyState
                    icon="🛰️"
                    title="No active missions"
                    description="You don't have any ongoing breakdown requests. If you need help, head back to home and request assistance."
                    action={
                        <Link to="/driver/home" className="btn btn-primary" style={{ padding: '12px 32px' }}>
                            Request Assistance
                        </Link>
                    }
                />
            </div>
        );
    }

    return (
        <div className="slide-up">
            <h2 className="section-title">Mission <span style={{ color: 'var(--primary)' }}>Control</span></h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 400px', gap: '40px' }}>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    <div className="premium-card" style={{ padding: '40px', borderLeft: '8px solid var(--primary)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                            <div>
                                <span className="premium-badge" style={{ background: '#EEF2FF', color: 'var(--primary)', marginBottom: '16px', padding: '8px 20px' }}>
                                    {requestStatus === 'PENDING' ? '🔍 Searching' :
                                        requestStatus === 'ACCEPTED' ? '🚗 En Route' :
                                            requestStatus === 'ARRIVED' ? '📍 Arrived' :
                                                requestStatus === 'IN_PROGRESS' ? '🛠️ Work in Progress' :
                                                    requestStatus === 'PAYMENT_PENDING' ? '💳 Payment Required' : '✅ Completed'}
                                </span>
                                <h3 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-1.5px', marginTop: '8px', lineHeight: 1.1 }}>
                                    {requestStatus === 'PENDING' ? 'Finding your mechanic...' :
                                        requestStatus === 'ACCEPTED' ? `Arrival in ${eta} mins` :
                                            requestStatus === 'ARRIVED' ? 'Mechanic is here!' :
                                                requestStatus === 'IN_PROGRESS' ? 'Almost ready!' :
                                                    requestStatus === 'PAYMENT_PENDING' ? 'Secure Checkout' : 'Job Finished!'}
                                </h3>
                            </div>
                            <div style={{ padding: '16px 24px', background: 'var(--light-bg)', borderRadius: '20px', border: '1px solid var(--glass-border)', textAlign: 'right' }}>
                                <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Fixed Quote</span>
                                <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--secondary)' }}>$50</div>
                            </div>
                        </div>

                        {mechanicData && (
                            <div style={{ display: 'flex', gap: '24px', background: '#F8FAFC', padding: '32px', borderRadius: '32px', border: '1px solid var(--glass-border)', marginBottom: '40px' }}>
                                <div style={{ width: '80px', height: '80px', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}>
                                    <img src={mechanicData.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${mechanicData.name}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '900' }}>{mechanicData.name || 'Your Mechanic'}</h4>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                                        <Star size={18} color="#F59E0B" fill="#F59E0B" />
                                        <span style={{ fontWeight: '800', fontSize: '1rem' }}>{mechanicData.rating || '5.0'}</span>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>• RoadHero Pro Partner</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                                        {mechanicData.phone && (
                                            <a href={`tel:${mechanicData.phone}`} className="btn-icon">
                                                <Phone size={20} />
                                            </a>
                                        )}
                                        <button onClick={() => setShowChat(!showChat)} className="btn btn-primary" style={{ padding: '0 24px', borderRadius: '16px', position: 'relative' }}>
                                            <MessageSquare size={20} /> {showChat ? 'Hide Chat' : 'Chat with Mechanic'}
                                            {hasNewMessage && !showChat && <span style={{ position: 'absolute', top: -4, right: -4, width: '12px', height: '12px', background: 'var(--accent)', borderRadius: '50%', border: '2px solid white' }}></span>}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {requestStatus === 'PAYMENT_PENDING' && (
                            <div className="fade-in" style={{ padding: '40px', background: '#F0FDF4', borderRadius: '32px', border: '1px solid #BBF7D0', textAlign: 'center' }}>
                                <h2 style={{ fontWeight: '900', marginBottom: '12px' }}>Ready for Checkout?</h2>
                                <p style={{ color: '#166534', marginBottom: '32px', fontSize: '1.1rem' }}>The mechanic has finished the service. Please confirm the payment below.</p>
                                <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                                    <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} style={{ padding: '16px', borderRadius: '16px', background: 'white' }}>
                                        <option value="Card">Visa •••• 4242</option>
                                        <option value="Cash">Pay by Cash</option>
                                    </select>
                                    <button onClick={handlePayment} disabled={loading} className="btn btn-primary" style={{ flex: 1, height: '60px', borderRadius: '16px', fontSize: '1.1rem' }}>
                                        {loading ? 'Processing...' : `Confirm & Pay $50`}
                                    </button>
                                </div>
                            </div>
                        )}

                        {requestStatus === 'COMPLETED' && !isReviewed && (
                            <div className="fade-in" style={{ textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
                                <h2 style={{ fontWeight: '900', marginBottom: '8px' }}>How was the service?</h2>
                                <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Your feedback helps us maintain high standards.</p>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '32px' }}>
                                    {[1, 2, 3, 4, 5].map(s => (
                                        <Star
                                            key={s}
                                            size={48}
                                            onClick={() => setReviewRating(s)}
                                            style={{ cursor: 'pointer', fill: reviewRating >= s ? '#F59E0B' : 'none', color: reviewRating >= s ? '#F59E0B' : '#E2E8F0', transition: '0.2s' }}
                                        />
                                    ))}
                                </div>
                                <textarea
                                    value={reviewComment}
                                    onChange={e => setReviewComment(e.target.value)}
                                    placeholder="Tell us more about your experience..."
                                    style={{ height: '120px', borderRadius: '20px', padding: '20px', marginBottom: '24px' }}
                                />
                                <button onClick={submitReview} disabled={loading} className="btn btn-primary" style={{ width: '100%', height: '60px', borderRadius: '18px' }}>
                                    {loading ? 'Submitting...' : 'Submit Review'}
                                </button>
                            </div>
                        )}

                        {(requestStatus === 'PENDING' || requestStatus === 'ACCEPTED') && (
                            <button onClick={resetRequest} className="btn-text" style={{ width: '100%', marginTop: '32px', color: 'var(--accent)', fontWeight: '800', background: 'none', border: 'none', cursor: 'pointer' }}>Cancel Request</button>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {showChat && (
                        <div className="premium-card slide-up" style={{ height: '540px', padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'sticky', top: '100px' }}>
                            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--glass-border)', background: 'var(--primary)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h4 style={{ margin: 0, fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <MessageSquare size={18} /> Chat with Mechanic
                                </h4>
                                <button onClick={() => setShowChat(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={20} /></button>
                            </div>
                            <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', background: '#F8FAFC' }}>
                                {chats.map((c, i) => (
                                    <div key={i} style={{
                                        alignSelf: c.senderRole === 'driver' ? 'flex-end' : 'flex-start',
                                        background: c.senderRole === 'driver' ? 'var(--primary)' : 'white',
                                        color: c.senderRole === 'driver' ? 'white' : 'var(--text-primary)',
                                        padding: '12px 18px',
                                        borderRadius: '20px',
                                        fontSize: '0.9rem',
                                        maxWidth: '85%',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                                    }}>
                                        {c.message}
                                    </div>
                                ))}
                                <div ref={chatEndRef} />
                            </div>
                            <form onSubmit={sendMessage} style={{ padding: '16px', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '10px' }}>
                                <input
                                    value={chatMessage}
                                    onChange={e => setChatMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    style={{ flex: 1, padding: '12px 20px', borderRadius: '100px', fontSize: '0.9rem' }}
                                />
                                <button type="submit" className="btn btn-primary" style={{ height: '48px', width: '48px', padding: 0, borderRadius: '50%' }}>
                                    <Send size={20} />
                                </button>
                            </form>
                        </div>
                    )}

                    {!showChat && (
                        <div className="premium-card" style={{ padding: '0', overflow: 'hidden', height: '400px', position: 'relative' }}>
                            <MapComponent
                                center={(requestLocation?.lat && requestLocation?.lng) ? [requestLocation.lat, requestLocation.lng] : undefined}
                                markers={[
                                    (requestLocation?.lat && requestLocation?.lng) ? { position: [requestLocation.lat, requestLocation.lng], type: 'user', content: 'Your Location' } : null,
                                    (mechanicData?.location?.coordinates?.length >= 2) ? {
                                        position: [mechanicData.location.coordinates[1], mechanicData.location.coordinates[0]],
                                        type: 'mechanic',
                                        content: 'Mechanic'
                                    } : null
                                ].filter(Boolean)}
                                zoom={14}
                                showRoute={true}
                                routeStart={(mechanicData?.location?.coordinates?.length >= 2) ? [mechanicData.location.coordinates[1], mechanicData.location.coordinates[0]] : null}
                                routeEnd={(requestLocation?.lat && requestLocation?.lng) ? [requestLocation.lat, requestLocation.lng] : null}
                            />
                        </div>
                    )}
                </div>
            </div>
            <style>{`
                .btn-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 16px;
                    border: 1px solid var(--glass-border);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: 0.2s;
                    background: white;
                }
                .btn-icon:hover {
                    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                    transform: translateY(-2px);
                }
            `}</style>
        </div>
    );
};

export default Activity;
