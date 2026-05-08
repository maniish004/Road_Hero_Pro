import React, { useState, useEffect, useContext, useRef } from 'react';
import api from '../api';
import AuthContext from '../context/AuthContext';
import MapComponent from '../components/MapComponent';
import { Wrench, LogOut, MapPin, Phone, CheckCircle, MessageSquare, Send, X, Clock, HelpCircle, User, Image, AlertCircle, Star } from 'lucide-react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

// Mechanic Dashboard v1.1 - Stability and Features
const MechanicDashboard = () => {
    const { user, logout, updateUser } = useContext(AuthContext);
    const [requests, setRequests] = useState([]);
    const [activeJobs, setActiveJobs] = useState([]);
    const [completedJobs, setCompletedJobs] = useState([]);
    const [location, setLocation] = useState({ lat: 51.505, lng: -0.09 });
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [manualLocation, setManualLocation] = useState(false);
    const [manualLat, setManualLat] = useState('');
    const [manualLng, setManualLng] = useState('');
    const [activeTab, setActiveTab] = useState('available');
    const [radius, setRadius] = useState(50);
    const [address, setAddress] = useState('Fetching address...');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [chats, setChats] = useState([]);
    const [hasNewMessage, setHasNewMessage] = useState(false);
    const [chatMessage, setChatMessage] = useState('');
    const [showChat, setShowChat] = useState(false);
    const [activeChatRequestId, setActiveChatRequestId] = useState(null);
    const [photoUrl, setPhotoUrl] = useState(user?.photoUrl || '');
    const [isPickingLocation, setIsPickingLocation] = useState(false);
    const [mechanicInfo, setMechanicInfo] = useState(user || {});
    const [isAvailable, setIsAvailable] = useState(user?.isAvailable ?? true);
    const [toasts, setToasts] = useState([]);
    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (showChat) scrollToBottom();
    }, [chats, showChat]);

    const addToast = (message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    };

    const fetchAddress = async (lat, lng) => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await response.json();
            setAddress(data.display_name || "Address not found");
        } catch (error) {
            console.error("Geocoding error:", error);
            setAddress("Address error");
        }
    };

    useEffect(() => {
        if (user?.location?.coordinates && user.location.coordinates[0] !== 0) {
            const [lng, lat] = user.location.coordinates;
            setLocation({ lat, lng });
            setManualLat(lat.toString());
            setManualLng(lng.toString());
            setManualLocation(true);
            fetchAddress(lat, lng);
        } else if (navigator.geolocation && !location.lat) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                setLocation({ lat: latitude, lng: longitude });
                fetchAddress(latitude, longitude);
            });
        }
    }, [user]);

    useEffect(() => {
        if (activeJobs?.length > 0) {
            activeJobs.forEach(job => {
                if (job?._id) socket.emit('join_room', job._id);
            });
        }
    }, [activeJobs]);

    useEffect(() => {
        const handleNewMessage = (data) => {
            if (data.requestId === activeChatRequestId) {
                setChats(prev => {
                    const isDuplicate = prev.length > 0 &&
                        prev[prev.length - 1].message === data.message &&
                        prev[prev.length - 1].senderId === data.senderId;
                    return isDuplicate ? prev : [...prev, data];
                });
            }

            if (!showChat || (data.requestId !== activeChatRequestId)) {
                const isMyJob = activeJobs.some(j => j._id === data.requestId);
                if (isMyJob && data.senderRole === 'driver') {
                    setHasNewMessage(true);
                    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');
                    audio.volume = 0.2;
                    audio.play().catch(e => { });
                    addToast(`New message from a driver!`);
                }
            }
        };

        socket.on('receive_message', handleNewMessage);
        return () => socket.off('receive_message', handleNewMessage);
    }, [activeChatRequestId, showChat, activeJobs]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!chatMessage.trim() || !activeChatRequestId) return;

        const chatData = {
            requestId: activeChatRequestId,
            senderId: user?._id,
            senderRole: 'mechanic',
            message: chatMessage
        };

        try {
            await api.post('/chats', chatData);
            socket.emit('send_message', chatData);
            setChatMessage('');
        } catch (err) { addToast("Failed to send message", "error"); }
    };

    const fetchRequestsData = async (isManual = false) => {
        if (!user?._id) return;
        if (isManual) setIsRefreshing(true);
        try {
            const [nearbyRes, activeRes, completedRes, profileRes] = await Promise.all([
                isAvailable ? api.get('/requests/nearby', { params: { latitude: location.lat, longitude: location.lng, distanceInKm: radius } }) : Promise.resolve({ data: { data: [] } }),
                api.get(`/requests/mechanic/${user?._id}`),
                api.get(`/requests/mechanic/${user?._id}?status=COMPLETED`),
                api.get(`/mechanics/${user?._id}`)
            ]);
            setRequests(nearbyRes.data.data || []);
            setActiveJobs(activeRes.data.data || []);
            setCompletedJobs(completedRes.data.data || []);
            if (profileRes.data.success) {
                setMechanicInfo(profileRes.data.data);
                setIsAvailable(profileRes.data.data.isAvailable);
            }
        } catch (error) {
            console.error("Fetch requests error:", error);
        } finally {
            if (isManual) {
                setTimeout(() => setIsRefreshing(false), 800);
            }
        }
    };

    const toggleAvailability = async () => {
        try {
            const newStatus = !isAvailable;
            setIsAvailable(newStatus);
            await api.patch(`/mechanics/${user?._id}/availability`, { isAvailable: newStatus });
            addToast(newStatus ? "You are now ONLINE" : "You are now OFFLINE", newStatus ? "success" : "error");
            if (newStatus) fetchRequestsData();
            else setRequests([]);
        } catch (error) {
            setIsAvailable(isAvailable);
            addToast("Failed to update status", "error");
        }
    };

    useEffect(() => {
        if (!user?._id) return;
        fetchRequestsData();
        const interval = setInterval(() => fetchRequestsData(false), 5000);
        return () => clearInterval(interval);
    }, [location.lat, location.lng, radius, user?._id, isAvailable]);

    const saveLocationPermanently = async () => {
        try {
            const lat = manualLocation ? parseFloat(manualLat) : location.lat;
            const lng = manualLocation ? parseFloat(manualLng) : location.lng;

            if (isNaN(lat) || isNaN(lng)) {
                addToast("Invalid coordinates", "error");
                return;
            }

            await api.patch(`/mechanics/${user?._id}/location`, {
                latitude: lat, longitude: lng
            });
            setLocation({ lat, lng });
            fetchAddress(lat, lng);
            addToast("Location saved!");
        } catch (error) {
            addToast("Failed to save location", "error");
        }
    };

    const handleMapClick = (coords) => {
        if (isPickingLocation) {
            setManualLat(coords[0].toFixed(6));
            setManualLng(coords[1].toFixed(6));
            setManualLocation(true);
            setIsPickingLocation(false);
            addToast("Pinned!");
        }
    };

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

    const openChat = async (reqId) => {
        setActiveChatRequestId(reqId);
        setShowChat(true);
        setHasNewMessage(false);
        try {
            const res = await api.get(`/chats/${reqId}`);
            setChats(res.data.data || []);
        } catch (err) { console.error("Chat fetch error", err); }
    };

    const acceptRequest = async (id) => {
        try {
            await api.patch(`/requests/${id}/accept`, { mechanicId: user?._id });
            fetchRequestsData();
            setActiveTab('active');
            addToast("Job accepted!");
        } catch (error) {
            addToast(error.response?.data?.error || "Failed to accept job", "error");
        }
    };

    const finishJob = async (id) => {
        try {
            await api.patch(`/requests/${id}/finish`, { mechanicId: user?._id });
            addToast("Work completed!");
            fetchRequestsData(false);
        } catch (error) {
            addToast("Error finishing job", "error");
        }
    };

    const allMarkers = [];
    if (isAvailable) {
        [...requests, ...activeJobs].forEach(req => {
            if (!req?.location?.coordinates) return;
            const isJobPending = req.status === 'PENDING';
            const d = calculateDist(location.lat, location.lng, req.location.coordinates[1], req.location.coordinates[0]);

            allMarkers.push({
                position: [req.location.coordinates[1], req.location.coordinates[0]],
                type: isJobPending ? 'pending' : 'active',
                content: (
                    <div style={{ minWidth: '160px', fontFamily: 'var(--font-main)' }}>
                        <div style={{ fontWeight: '800', marginBottom: '4px' }}>{req.driverName || 'Customer'}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748B' }}>{req.serviceType} • {d.toFixed(1)}km away</div>
                        <div style={{ fontWeight: '900', color: 'var(--secondary)', fontSize: '1.1rem', marginTop: '4px' }}>${req.price || 0}</div>
                        {isJobPending && (
                            <button onClick={() => acceptRequest(req._id)} className="btn btn-primary" style={{ width: '100%', padding: '6px', marginTop: '8px' }}>Accept</button>
                        )}
                    </div>
                )
            });
        });
    }

    if (location?.lat && location?.lng) {
        allMarkers.push({ position: [location.lat, location.lng], type: 'mechanic', content: <div style={{ fontWeight: '800' }}>Your Workshop</div> });
    }

    if (!user) return <div className="loading-container">Syncing Dashboard...</div>;

    return (
        <div style={{ minHeight: '100vh', background: 'var(--light-bg)', color: 'var(--text-primary)' }}>
            <header className="navbar">
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '40px', height: '40px', background: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}>
                            <img src="/logo.png" style={{ width: '28px' }} alt="" />
                        </div>
                        <span style={{ fontWeight: '900', fontSize: '1.4rem', letterSpacing: '-1px' }}>RoadHero <span style={{ color: 'var(--primary)' }}>Pro</span></span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        {/* Status Toggle */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px 12px', background: 'white', borderRadius: '100px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid var(--glass-border)' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: isAvailable ? 'var(--secondary)' : 'var(--text-muted)' }}>
                                {isAvailable ? 'ONLINE' : 'OFFLINE'}
                            </span>
                            <div
                                onClick={toggleAvailability}
                                style={{
                                    width: '44px',
                                    height: '24px',
                                    background: isAvailable ? 'var(--secondary)' : '#CBD5E1',
                                    borderRadius: '100px',
                                    position: 'relative',
                                    cursor: 'pointer',
                                    transition: '0.3s'
                                }}
                            >
                                <div style={{
                                    width: '18px',
                                    height: '18px',
                                    background: 'white',
                                    borderRadius: '50%',
                                    position: 'absolute',
                                    top: '3px',
                                    left: isAvailable ? '23px' : '3px',
                                    transition: '0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }} />
                            </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                            <p style={{ fontWeight: '800', fontSize: '0.95rem', margin: 0 }}>{user.name}</p>
                            <span style={{ fontSize: '0.7rem', color: isAvailable ? 'var(--secondary)' : 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase' }}>
                                {isAvailable ? 'Receiving Jobs' : 'Unavailable'}
                            </span>
                        </div>
                        <button onClick={logout} className="btn btn-secondary" style={{ padding: '10px' }}>
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </header>

            <main className="container" style={{ paddingTop: '32px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
                    <div className="stat-card">
                        <span className="stat-label">Total Earnings</span>
                        <div className="stat-value" style={{ color: 'var(--secondary)' }}>${completedJobs.reduce((acc, j) => acc + (j.price || 0), 0)}</div>
                    </div>
                    <div className="stat-card">
                        <span className="stat-label">Active Jobs</span>
                        <div className="stat-value" style={{ color: 'var(--primary)' }}>{activeJobs.length}</div>
                    </div>
                    <div className="stat-card">
                        <span className="stat-label">History</span>
                        <div className="stat-value">{completedJobs.length}</div>
                    </div>
                    <div className="stat-card">
                        <span className="stat-label">Rating</span>
                        <div className="stat-value">{mechanicInfo?.rating || 5.0} <Star size={20} style={{ color: '#F59E0B', fill: '#F59E0B' }} /></div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '32px', marginBottom: '32px' }}>
                    <div className="premium-card" style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Clock size={20} color="var(--primary)" /> 7-Day Performance
                            </h3>
                            <span style={{ fontSize: '0.75rem', fontWeight: '800', background: 'var(--light-bg)', padding: '4px 12px', borderRadius: '100px' }}>Last 7 Days</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '160px', padding: '0 10px' }}>
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
                                    <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--secondary)' }}>${data.total}</div>
                                        <div style={{
                                            width: '100%',
                                            height: `${(data.total / maxEarnings) * 100}%`,
                                            minHeight: '4px',
                                            background: 'linear-gradient(to top, var(--secondary), #4ADE80)',
                                            borderRadius: '6px 6px 0 0',
                                            transition: '0.5s ease-out'
                                        }} />
                                        <div style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)' }}>{data.dayName}</div>
                                    </div>
                                ));
                            })()}
                        </div>
                    </div>

                    <div className="premium-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <h4 style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Weekly Total</h4>
                        <div style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '20px' }}>
                            ${completedJobs.filter(j => {
                                const weekAgo = new Date();
                                weekAgo.setDate(weekAgo.getDate() - 7);
                                return new Date(j.createdAt) > weekAgo;
                            }).reduce((acc, j) => acc + (j.price || 0), 0)}
                        </div>
                        <div style={{ padding: '12px', background: '#DCFCE7', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Star size={16} color="#166534" fill="#166534" />
                            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#166534' }}>Top Earning Week!</span>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '32px', height: 'calc(100vh - 480px)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', overflowY: 'auto', paddingRight: '8px' }}>
                        <div style={{ display: 'flex', gap: '6px', padding: '6px', background: 'rgba(255,255,255,0.5)', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                            {['available', 'active', 'history', 'settings'].map(tab => (
                                <button key={tab} onClick={() => setActiveTab(tab)} style={{ flex: 1, padding: '10px', borderRadius: '12px', border: 'none', background: activeTab === tab ? 'var(--primary)' : 'transparent', color: activeTab === tab ? 'white' : 'var(--text-secondary)', fontWeight: '800', cursor: 'pointer', transition: '0.3s', textTransform: 'capitalize', fontSize: '0.75rem' }}>
                                    {tab === 'available' ? 'Near You' : tab}
                                </button>
                            ))}
                        </div>

                        {activeTab === 'settings' && (
                            <div className="premium-card slide-up" style={{ padding: '24px' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: '900', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <MapPin size={18} color="var(--primary)" /> Service Settings
                                </h3>

                                <div style={{ marginBottom: '24px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <span style={{ fontSize: '0.8rem', fontWeight: '800' }}>Search Radius</span>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '900' }}>{radius} km</span>
                                    </div>
                                    <input type="range" min="5" max="500" value={radius} onChange={(e) => setRadius(parseInt(e.target.value))} style={{ width: '100%', cursor: 'pointer' }} />
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-secondary)', marginBottom: '12px' }}>Workshop Location</label>
                                    <button onClick={() => setIsPickingLocation(!isPickingLocation)} className="btn btn-secondary" style={{ width: '100%', marginBottom: '12px', background: isPickingLocation ? 'var(--accent)' : 'var(--light-bg)', color: isPickingLocation ? 'white' : 'var(--text-primary)', border: '1px solid var(--glass-border)', fontSize: '0.8rem' }}>
                                        {isPickingLocation ? '🛑 Select on Map Now' : '📍 Pick from Map'}
                                    </button>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                                        <div>
                                            <span style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-muted)' }}>LATITUDE</span>
                                            <input value={manualLat} onChange={e => { setManualLat(e.target.value); setManualLocation(true); }} style={{ padding: '8px', fontSize: '0.8rem' }} />
                                        </div>
                                        <div>
                                            <span style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-muted)' }}>LONGITUDE</span>
                                            <input value={manualLng} onChange={e => { setManualLng(e.target.value); setManualLocation(true); }} style={{ padding: '8px', fontSize: '0.8rem' }} />
                                        </div>
                                    </div>
                                    <button onClick={saveLocationPermanently} className="btn btn-primary" style={{ width: '100%', fontSize: '0.85rem' }}>Save Location</button>
                                </div>
                                <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '16px' }}>
                                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Current Address:</p>
                                    <p style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)', marginTop: '4px' }}>{address}</p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'available' && (
                            <>
                                {!isAvailable && (
                                    <div className="premium-card" style={{ padding: '40px', textAlign: 'center', opacity: 0.8 }}>
                                        <AlertCircle size={40} color="var(--accent)" style={{ margin: '0 auto 16px', display: 'block' }} />
                                        <p style={{ fontWeight: '800' }}>You are currently Offline</p>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px' }}>Go online to start receiving job requests from drivers near you.</p>
                                        <button onClick={toggleAvailability} className="btn btn-primary" style={{ marginTop: '20px', width: '100%' }}>Go Online Now</button>
                                    </div>
                                )}
                                {isAvailable && requests.length === 0 && (
                                    <div className="premium-card" style={{ padding: '40px', textAlign: 'center', opacity: 0.6 }}>
                                        <HelpCircle size={40} style={{ margin: '0 auto 16px', display: 'block' }} />
                                        <p style={{ fontWeight: '700' }}>Searching for jobs...</p>
                                        <p style={{ fontSize: '0.75rem' }}>Try increasing your search radius in Settings.</p>
                                    </div>
                                )}
                                {isAvailable && requests.map(req => {
                                    if (!req?.location?.coordinates) return null;
                                    const d = calculateDist(location.lat, location.lng, req.location.coordinates[1], req.location.coordinates[0]);
                                    const serviceImage = req.serviceType === 'Towing' ? '/towing.png' : '/repair.png';

                                    return (
                                        <div key={req._id} className="premium-card slide-up" style={{ padding: '0', overflow: 'hidden' }}>
                                            <div style={{ height: '180px', width: '100%', position: 'relative' }}>
                                                <img src={serviceImage} alt={req.serviceType} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'white', padding: '8px 16px', borderRadius: '100px', fontWeight: '900', color: 'var(--secondary)', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', fontSize: '1.2rem' }}>
                                                    ${req.price || 0}
                                                </div>
                                                <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', background: 'linear-gradient(transparent, rgba(0,0,0,0.7))', padding: '20px 24px', color: 'white' }}>
                                                    <span style={{ fontSize: '0.7rem', fontWeight: '900', color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase', letterSpacing: '1px' }}>{req.serviceType}</span>
                                                    <h4 style={{ margin: '4px 0 0', fontSize: '1.4rem', fontWeight: '900' }}>{req.driverName || 'Nearby Customer'}</h4>
                                                </div>
                                            </div>

                                            <div style={{ padding: '24px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>
                                                    <MapPin size={16} color="var(--primary)" /> {d.toFixed(1)} km away from you
                                                </div>
                                                <div style={{ background: 'var(--light-bg)', padding: '16px', borderRadius: '16px', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
                                                    <p style={{ margin: 0, fontSize: '0.95rem', fontStyle: 'italic', color: 'var(--text-primary)', lineHeight: '1.5' }}>"{req.issue}"</p>
                                                </div>
                                                <button onClick={() => acceptRequest(req._id)} className="btn btn-primary" style={{ width: '100%', padding: '16px', fontSize: '1rem', fontWeight: '900' }}>Accept Job Now</button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </>
                        )}

                        {activeTab === 'active' && activeJobs.map(job => {
                            if (!job?.location?.coordinates) return null;
                            const d = calculateDist(location.lat, location.lng, job.location.coordinates[1], job.location.coordinates[0]);
                            return (
                                <div key={job._id} className="premium-card slide-up" style={{ padding: '0', overflow: 'hidden', borderLeft: '6px solid var(--secondary)' }}>
                                    <div style={{ height: '140px', width: '100%', position: 'relative' }}>
                                        <img src={job.serviceType === 'Towing' ? '/towing.png' : '/repair.png'} alt={job.serviceType} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <div style={{ position: 'absolute', top: '12px', right: '12px', background: '#DCFCE7', color: '#166534', padding: '4px 12px', borderRadius: '100px', fontWeight: '900', fontSize: '0.7rem' }}>ONGOING</div>
                                        <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', background: 'linear-gradient(transparent, rgba(0,0,0,0.6))', padding: '12px 20px', color: 'white' }}>
                                            <h4 style={{ margin: 0, fontWeight: '900', fontSize: '1.2rem' }}>{job.driverName}</h4>
                                            <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.9 }}>{job.serviceType} • {d.toFixed(1)} km away</p>
                                        </div>
                                    </div>
                                    <div style={{ padding: '20px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                            <div style={{ fontSize: '1.3rem', fontWeight: '900', color: 'var(--secondary)' }}>${job.price || 0}</div>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <a href={`tel:${job.driverPhone}`} className="btn btn-secondary" style={{ width: '40px', height: '40px', padding: 0 }}><Phone size={18} /></a>
                                                <button onClick={() => activeChatRequestId === job._id ? setShowChat(!showChat) : openChat(job._id)} className="btn btn-secondary" style={{ width: '40px', height: '40px', padding: 0, position: 'relative' }}>
                                                    <MessageSquare size={18} />{hasNewMessage && activeChatRequestId === job._id && <span style={{ position: 'absolute', top: 4, right: 4, background: 'var(--accent)', width: '8px', height: '8px', borderRadius: '50%' }}></span>}
                                                </button>
                                            </div>
                                        </div>
                                        <button onClick={() => finishJob(job._id)} className="btn btn-primary" style={{ width: '100%', padding: '14px', fontWeight: '900' }}>Complete Job</button>
                                    </div>
                                    {showChat && activeChatRequestId === job._id && (
                                        <div style={{ height: '300px', display: 'flex', flexDirection: 'column', background: 'white', borderRadius: '16px', border: '1px solid var(--glass-border)', overflow: 'hidden', marginBottom: '16px' }}>
                                            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', background: '#f8fafc' }}>
                                                {chats.map((c, i) => (
                                                    <div key={i} style={{ alignSelf: c.senderRole === 'mechanic' ? 'flex-end' : 'flex-start', background: c.senderRole === 'mechanic' ? 'var(--primary)' : 'white', color: c.senderRole === 'mechanic' ? 'white' : 'var(--text-primary)', padding: '10px 14px', borderRadius: '14px', fontSize: '0.85rem', maxWidth: '85%', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>{c.message}</div>
                                                ))}
                                                <div ref={chatEndRef} />
                                            </div>
                                            <form onSubmit={sendMessage} style={{ padding: '12px', display: 'flex', gap: '8px', borderTop: '1px solid #eee' }}><input value={chatMessage} onChange={e => setChatMessage(e.target.value)} placeholder="Type..." style={{ flex: 1, padding: '10px 16px', borderRadius: '100px', border: '1px solid #eee' }} /><button type="submit" className="btn btn-primary" style={{ width: '40px', padding: 0 }}><Send size={18} /></button></form>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {activeTab === 'history' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {completedJobs.length === 0 && <div className="premium-card" style={{ padding: '40px', textAlign: 'center', opacity: 0.6 }}><Clock size={40} style={{ margin: '0 auto 16px', display: 'block' }} /><p style={{ fontWeight: '700' }}>No history yet</p></div>}
                                {completedJobs.map(job => (
                                    <div key={job._id} className="premium-card slide-up" style={{ padding: '20px', background: 'rgba(255,255,255,0.4)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div><h4 style={{ margin: 0, fontWeight: '900', fontSize: '1rem' }}>{job.driverName}</h4><p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{new Date(job.createdAt).toLocaleDateString()} • {job.serviceType}</p></div>
                                            <div style={{ textAlign: 'right' }}><div style={{ fontSize: '1.1rem', fontWeight: '900', color: 'var(--secondary)' }}>+${job.price || 0}</div><span style={{ fontSize: '0.65rem', fontWeight: '800', color: job.status === 'PAYMENT_PENDING' ? 'var(--accent)' : 'var(--secondary)', textTransform: 'uppercase' }}>{job.status === 'PAYMENT_PENDING' ? 'Pending Payment' : 'Paid'}</span></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="map-container" style={{ position: 'relative', borderRadius: '24px', overflow: 'hidden' }}>
                        <MapComponent center={[location.lat, location.lng]} markers={allMarkers} zoom={13} onMapClick={isPickingLocation ? handleMapClick : null} />
                    </div>
                </div>
            </main>
            <div className="toast-container">{toasts.map(t => (<div key={t.id} className={`toast ${t.type}`} style={{ background: t.type === 'success' ? '#10B981' : '#EF4444', color: 'white', padding: '16px 24px', borderRadius: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '12px' }}>{t.message}</div>))}</div>
        </div>
    );
};

export default MechanicDashboard;
