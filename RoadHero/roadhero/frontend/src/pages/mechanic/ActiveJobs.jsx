import React, { useState, useEffect, useRef } from 'react';
import { Phone, MessageSquare, Send, MapPin } from 'lucide-react';
import { useMechanic } from '../../context/MechanicContext';
import api from '../../api';
import EmptyState from '../../components/EmptyState';
import { Link } from 'react-router-dom';

const ActiveJobs = () => {
    const {
        activeJobs,
        location,
        openChat,
        chats,
        activeChatRequestId,
        setActiveChatRequestId,
        newMessagesPerJob,
        setHasNewMessage,
        finishJob,
        socket,
        mechanicInfo
    } = useMechanic();

    const [chatMessage, setChatMessage] = useState('');
    const [showChat, setShowChat] = useState(false);
    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (showChat) scrollToBottom();
    }, [chats, showChat]);

    const calculateDist = (lat1, lon1, lat2, lon2) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!chatMessage.trim() || !activeChatRequestId) return;

        const chatData = {
            requestId: activeChatRequestId,
            senderId: mechanicInfo?._id,
            senderRole: 'mechanic',
            message: chatMessage
        };

        try {
            // Ensure we are in the room
            socket.emit('join_room', activeChatRequestId);

            await api.post('/chats', chatData);
            socket.emit('send_message', chatData);
            setChatMessage('');
        } catch (err) { }
    };

    const toggleChat = (jobId) => {
        if (activeChatRequestId === jobId) {
            setShowChat(!showChat);
        } else {
            openChat(jobId);
            setShowChat(true);
        }
    };

    return (
        <div className="slide-up">
            <h2 className="section-title">Active <span style={{ color: 'var(--secondary)' }}>Jobs</span></h2>

            {activeJobs.length === 0 && (
                <EmptyState
                    icon="🛠️"
                    title="No missions active"
                    description="You are currently available for new jobs. Check the marketplace to find drivers in need of assistance."
                    action={
                        <Link to="/mechanic/jobs" className="btn btn-primary" style={{ padding: '12px 32px' }}>
                            View Nearby Jobs
                        </Link>
                    }
                />
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '24px' }}>
                {activeJobs.map(job => {
                    if (!job?.location?.coordinates) return null;
                    const d = calculateDist(location.lat, location.lng, job.location.coordinates[1], job.location.coordinates[0]);
                    const isChatOpen = showChat && activeChatRequestId === job._id;

                    return (
                        <div key={job._id} className="premium-card" style={{ padding: '0', overflow: 'hidden', borderLeft: '6px solid var(--secondary)' }}>
                            <div style={{ height: '140px', width: '100%', position: 'relative' }}>
                                <img src={job.serviceType === 'Towing' ? '/towing.png' : '/repair.png'} alt={job.serviceType} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <div style={{ position: 'absolute', top: '12px', right: '12px', background: '#DCFCE7', color: '#166534', padding: '4px 12px', borderRadius: '100px', fontWeight: '900', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <div style={{ width: '6px', height: '6px', background: '#166534', borderRadius: '50%', animation: 'pulse 2s infinite' }}></div> ONGOING
                                </div>
                                <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', background: 'linear-gradient(transparent, rgba(0,0,0,0.7))', padding: '16px 24px', color: 'white' }}>
                                    <h4 style={{ margin: 0, fontWeight: '900', fontSize: '1.3rem' }}>{job.driverName}</h4>
                                    <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.9 }}>{job.serviceType} • {d.toFixed(1)} km away</p>
                                </div>
                            </div>

                            <div style={{ padding: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--secondary)' }}>${job.price || 0}</div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <a href={`tel:${job.driverPhone}`} className="btn-icon" style={{ background: '#F8FAFC' }}>
                                            <Phone size={18} />
                                        </a>
                                        <button
                                            onClick={() => toggleChat(job._id)}
                                            className="btn-icon"
                                            style={{ background: isChatOpen ? 'var(--primary)' : '#F8FAFC', color: isChatOpen ? 'white' : 'inherit', position: 'relative' }}
                                        >
                                            <MessageSquare size={18} />
                                            {newMessagesPerJob[job._id] && (
                                                <span style={{ position: 'absolute', top: -4, right: -4, background: 'var(--accent)', width: '12px', height: '12px', borderRadius: '50%', border: '2px solid white' }}></span>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {isChatOpen && (
                                    <div style={{ height: '300px', display: 'flex', flexDirection: 'column', background: '#F8FAFC', borderRadius: '16px', border: '1px solid var(--glass-border)', overflow: 'hidden', marginBottom: '20px' }}>
                                        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {chats.map((c, i) => (
                                                <div key={i} style={{
                                                    alignSelf: c.senderRole === 'mechanic' ? 'flex-end' : 'flex-start',
                                                    background: c.senderRole === 'mechanic' ? 'var(--primary)' : 'white',
                                                    color: c.senderRole === 'mechanic' ? 'white' : 'var(--text-primary)',
                                                    padding: '8px 14px',
                                                    borderRadius: '14px',
                                                    fontSize: '0.85rem',
                                                    maxWidth: '85%',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
                                                }}>
                                                    {c.message}
                                                </div>
                                            ))}
                                            <div ref={chatEndRef} />
                                        </div>
                                        <form onSubmit={handleSendMessage} style={{ padding: '10px', display: 'flex', gap: '8px', background: 'white', borderTop: '1px solid #eee' }}>
                                            <input
                                                value={chatMessage}
                                                onChange={e => setChatMessage(e.target.value)}
                                                placeholder="Type a message..."
                                                style={{ flex: 1, padding: '8px 16px', borderRadius: '100px', border: '1px solid #eee', fontSize: '0.85rem' }}
                                            />
                                            <button type="submit" className="btn btn-primary" style={{ width: '38px', height: '38px', padding: 0, borderRadius: '50%' }}>
                                                <Send size={16} />
                                            </button>
                                        </form>
                                    </div>
                                )}

                                <button onClick={() => finishJob(job._id)} className="btn btn-primary" style={{ width: '100%', padding: '14px', fontWeight: '900' }}>
                                    Complete Job & Bill Customer
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
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
                }
                .btn-icon:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                }
            `}</style>
        </div>
    );
};

export default ActiveJobs;
