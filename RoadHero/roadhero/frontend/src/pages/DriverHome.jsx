import React, { useState, useEffect, useContext, useRef } from 'react';
import { LogOut, MapPin, Phone, AlertCircle, Menu, MessageSquare, Send, X, Clock, HelpCircle, ChevronDown, ChevronUp, CheckCircle, Wrench, Star, Fuel, Truck, LifeBuoy, Car, User } from 'lucide-react';
import api from '../api';
import AuthContext from '../context/AuthContext';
import MapComponent from '../components/MapComponent';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

const DriverHome = () => {
    const { user, logout, updateUser } = useContext(AuthContext);
    const [issue, setIssue] = useState('');
    const [serviceType, setServiceType] = useState('General');
    const [friendName, setFriendName] = useState('');
    const [friendPhone, setFriendPhone] = useState('');
    const [bookingForFriend, setBookingForFriend] = useState(false);
    const [friendAddress, setFriendAddress] = useState('');
    const [friendLat, setFriendLat] = useState('');
    const [friendLng, setFriendLng] = useState('');
    const [location, setLocation] = useState({ lat: 51.505, lng: -0.09 });
    const [loading, setLoading] = useState(false);
    const [requestStatus, setRequestStatus] = useState(null);
    const [requestId, setRequestId] = useState(null);
    const [mechanicData, setMechanicData] = useState(null);
    const [towDestLat, setTowDestLat] = useState('');
    const [towDestLng, setTowDestLng] = useState('');
    const [towDestAddress, setTowDestAddress] = useState('');
    const [estimatedPrice, setEstimatedPrice] = useState(50);
    const [towDistance, setTowDistance] = useState(0);
    const [requestLocation, setRequestLocation] = useState(null);
    const [pickingMode, setPickingMode] = useState('none');
    const [chats, setChats] = useState([]);
    const [hasNewMessage, setHasNewMessage] = useState(false);
    const [chatMessage, setChatMessage] = useState('');
    const [showChat, setShowChat] = useState(false);
    const [eta, setEta] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('Card');
    const [history, setHistory] = useState([]);
    const [activeTab, setActiveTab] = useState('request');
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewComment, setReviewComment] = useState('');
    const [isReviewed, setIsReviewed] = useState(false);
    const [toasts, setToasts] = useState([]);
    const [vehicles, setVehicles] = useState(user?.vehicles || []);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [showVehicleManager, setShowVehicleManager] = useState(false);
    const [newVehicle, setNewVehicle] = useState({ make: '', model: '', color: '', licensePlate: '' });
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

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                (err) => console.error(err)
            );
        }
        checkActiveSession();
        fetchHistory();
    }, []);

    const checkActiveSession = async () => {
        try {
            const res = await api.get(`/requests/driver/${user._id}`);
            const recent = res.data.data.find(r => r.status !== 'COMPLETED' && r.status !== 'CANCELLED');
            if (recent) {
                setRequestId(recent._id);
                setRequestStatus(recent.status);
                setIssue(recent.issue);
                setServiceType(recent.serviceType);
                if (recent.price) setEstimatedPrice(recent.price);
                if (recent.location && recent.location.coordinates) {
                    setRequestLocation({ lat: recent.location.coordinates[1], lng: recent.location.coordinates[0] });
                }
                if (recent.assignedMechanic) setMechanicData(recent.assignedMechanic);
            }
        } catch (err) { console.error("Session check error", err); }
    };

    const fetchHistory = async () => {
        try {
            const res = await api.get(`/requests/driver/${user._id}?status=COMPLETED`);
            setHistory(res.data.data);
        } catch (err) { console.error("History fetch error", err); }
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

    useEffect(() => {
        let interval;
        if (requestId && requestStatus !== 'COMPLETED') {
            interval = setInterval(async () => {
                try {
                    const reqRes = await api.get(`/requests/${requestId}`);
                    const requestData = reqRes.data.data;
                    const newStatus = requestData.status;

                    if (newStatus !== requestStatus) {
                        setRequestStatus(newStatus);
                    }

                    if (requestData.price) {
                        setEstimatedPrice(requestData.price);
                    }

                    if ((newStatus === 'ACCEPTED' || newStatus === 'PAYMENT_PENDING') && requestData.assignedMechanic) {
                        setMechanicData(requestData.assignedMechanic);
                        if (newStatus === 'ACCEPTED' && requestData.assignedMechanic.location) {
                            const mechLoc = requestData.assignedMechanic.location.coordinates;
                            const dLoc = requestLocation || location;
                            const distance = calculateDist(dLoc.lat, dLoc.lng, mechLoc[1], mechLoc[0]);
                            const travelTime = Math.round((distance / 30) * 60 + 2);
                            setEta(travelTime > 0 ? travelTime : 1);
                        }
                    }
                } catch (err) { console.error("Polling error", err); }
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [requestId, requestStatus, location, requestLocation]);

    useEffect(() => {
        if (showChat) setHasNewMessage(false);
    }, [showChat]);

    useEffect(() => {
        if (requestId) {
            const fetchChatHistory = async () => {
                try {
                    const res = await api.get(`/chats/${requestId}`);
                    setChats(res.data.data);
                } catch (err) { console.error("Chat history fetch error", err); }
            };
            fetchChatHistory();
        } else {
            setChats([]);
        }
    }, [requestId]);

    useEffect(() => {
        if (requestId) {
            socket.emit('join_room', requestId);
        }

        const handleNewMessage = (data) => {
            if (data.requestId === requestId) {
                setChats(prev => {
                    const isDuplicate = prev.length > 0 &&
                        prev[prev.length - 1].message === data.message &&
                        prev[prev.length - 1].senderId === data.senderId;
                    return isDuplicate ? prev : [...prev, data];
                });

                if (!showChat) {
                    setHasNewMessage(true);
                    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');
                    audio.volume = 0.2;
                    audio.play().catch(e => { });
                    addToast(`New message from mechanic!`, 'success');
                }
            }
        };

        socket.on('receive_message', handleNewMessage);
        return () => socket.off('receive_message', handleNewMessage);
    }, [requestId, showChat]);

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
            socket.emit('send_message', chatData);
            setChatMessage('');
        } catch (err) { addToast("Failed to send message", "error"); }
    };

    const handlePayment = async () => {
        if (!requestId) return;
        setLoading(true);
        try {
            const res = await api.patch(`/requests/${requestId}/pay`, { paymentMethod, driverId: user._id });
            if (res.data.success) {
                setRequestStatus('COMPLETED');
                addToast('Payment successful!');
            }
        } catch (err) {
            addToast(`Payment failed`, "error");
        } finally {
            setLoading(false);
        }
    };

    const handleMapClick = (coords) => {
        if (pickingMode === 'friend') {
            setFriendLat(coords[0].toFixed(6));
            setFriendLng(coords[1].toFixed(6));
        } else if (pickingMode === 'tow') {
            setTowDestLat(coords[0].toFixed(6));
            setTowDestLng(coords[1].toFixed(6));
        }
        setPickingMode('none');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (issue.trim().length < 5) return addToast('Please describe the issue (min 5 chars)', 'error');
        if (bookingForFriend && (!friendName.trim() || !friendPhone.trim() || !friendLat)) return addToast('Please complete friend details', 'error');

        setLoading(true);
        try {
            const res = await api.post('/requests', {
                driverName: bookingForFriend ? friendName : user.name,
                driverPhone: bookingForFriend ? friendPhone : user.phone,
                driverId: user._id,
                issue,
                serviceType,
                latitude: bookingForFriend ? parseFloat(friendLat) : location.lat,
                longitude: bookingForFriend ? parseFloat(friendLng) : location.lng,
                towDestLat: serviceType === 'Towing' ? parseFloat(towDestLat) : undefined,
                towDestLng: serviceType === 'Towing' ? parseFloat(towDestLng) : undefined,
                towDestAddress: serviceType === 'Towing' ? towDestAddress : undefined,
                price: estimatedPrice,
                vehicle: selectedVehicle
            });
            setRequestId(res.data.data._id);
            setRequestStatus('PENDING');
            setRequestLocation({
                lat: bookingForFriend ? parseFloat(friendLat) : location.lat,
                lng: bookingForFriend ? parseFloat(friendLng) : location.lng
            });
            addToast('Request sent! Finding mechanics...');
        } catch (error) {
            addToast('Error sending request', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const basePrices = { 'General': 50, 'Towing': 80, 'Tire': 40, 'Fuel': 35 };
        if (serviceType === 'Towing' && towDestLat && towDestLng) {
            const startLat = bookingForFriend ? parseFloat(friendLat) : location.lat;
            const startLng = bookingForFriend ? parseFloat(friendLng) : location.lng;
            const d = calculateDist(startLat, startLng, parseFloat(towDestLat), parseFloat(towDestLng));
            setTowDistance(d);
            setEstimatedPrice(Math.round(basePrices['Towing'] + (d * 5)));
        } else {
            setEstimatedPrice(basePrices[serviceType] || 50);
            setTowDistance(0);
        }
    }, [serviceType, towDestLat, towDestLng, location, bookingForFriend, friendLat, friendLng]);

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

    const resetRequest = () => {
        setRequestStatus(null);
        setRequestId(null);
        setMechanicData(null);
        setIssue('');
        setServiceType('General');
        setBookingForFriend(false);
        setPickingMode('none');
        setChats([]);
        setShowChat(false);
        setActiveTab('request');
        fetchHistory();
    };

    const addVehicle = async () => {
        if (!newVehicle.make || !newVehicle.model || !newVehicle.licensePlate || !newVehicle.color) {
            return addToast('Please fill all vehicle details', 'error');
        }
        setLoading(true);
        try {
            const res = await api.post(`/auth/driver/${user._id}/vehicles`, newVehicle);
            if (res.data.success) {
                setVehicles(res.data.data);
                updateUser({ vehicles: res.data.data });
                setNewVehicle({ make: '', model: '', color: '', licensePlate: '' });
                addToast('Vehicle added to garage!');
            }
        } catch (err) {
            addToast('Failed to add vehicle', 'error');
        } finally {
            setLoading(false);
        }
    };

    const removeVehicle = async (vehicleId) => {
        setLoading(true);
        try {
            const res = await api.delete(`/auth/driver/${user._id}/vehicles/${vehicleId}`);
            if (res.data.success) {
                setVehicles(res.data.data);
                updateUser({ vehicles: res.data.data });
                addToast('Vehicle removed');
                if (selectedVehicle?._id === vehicleId) setSelectedVehicle(null);
            }
        } catch (err) {
            addToast('Failed to remove vehicle', 'error');
        } finally {
            setLoading(false);
        }
    };

    const services = [
        { id: 'General', name: 'Repair', icon: <Wrench size={24} />, color: '#6366f1', desc: 'Mechanical issues' },
        { id: 'Tire', name: 'Flat Tire', icon: <LifeBuoy size={24} />, color: '#10b981', desc: 'Puncture or flat' },
        { id: 'Fuel', name: 'Fuel', icon: <Fuel size={24} />, color: '#f59e0b', desc: 'Ran out of gas' },
        { id: 'Towing', name: 'Towing', icon: <Truck size={24} />, color: '#f43f5e', desc: 'Professional tow' }
    ];

    return (
        <div style={{ minHeight: '100vh', background: 'var(--light-bg)', color: 'var(--text-primary)' }}>
            {/* Navigation */}
            <header className="navbar" style={{ padding: '0.75rem 0', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--glass-border)', position: 'sticky', top: 0, zIndex: 1000 }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '60px', height: '60px', background: 'white', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', overflow: 'hidden', padding: '8px' }}>
                            <img src="/logo.png" alt="RoadHero Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
                        <span style={{ fontWeight: '900', fontSize: '1.8rem', letterSpacing: '-1.5px', color: 'var(--text-primary)' }}>RoadHero</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: '800', fontSize: '0.9rem' }}>{user.name}</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: '800', textTransform: 'uppercase' }}>Premium Driver</span>
                        </div>
                        <button onClick={logout} className="btn btn-secondary" style={{ width: '40px', height: '40px', padding: 0, borderRadius: '12px' }}>
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </header>

            <main className="container" style={{ paddingTop: '32px', paddingBottom: '32px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 400px', gap: '32px' }} className="fade-in">

                    {/* Main Content Area */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                        {/* Tab Selector */}
                        <div style={{ display: 'flex', gap: '8px', padding: '6px', background: 'rgba(255,255,255,0.5)', borderRadius: '16px', border: '1px solid var(--glass-border)', width: 'fit-content' }}>
                            {['request', 'history'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    style={{
                                        padding: '10px 24px',
                                        borderRadius: '12px',
                                        border: 'none',
                                        background: activeTab === tab ? 'var(--primary)' : 'transparent',
                                        color: activeTab === tab ? 'white' : 'var(--text-secondary)',
                                        fontWeight: '800',
                                        cursor: 'pointer',
                                        transition: '0.3s',
                                        textTransform: 'capitalize'
                                    }}
                                >
                                    {tab === 'request' ? 'Emergency Help' : 'My Trips'}
                                </button>
                            ))}
                        </div>

                        {activeTab === 'request' ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                                {requestStatus ? (
                                    /* Status Dashboard */
                                    <div className="premium-card slide-up" style={{ padding: '32px', borderLeft: '6px solid var(--primary)' }}>
                                        <div style={{ marginBottom: '32px' }}>
                                            <div style={{ width: '100%', height: '240px', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 12px 32px rgba(0,0,0,0.15)', marginBottom: '24px', position: 'relative' }}>
                                                <img src={serviceType === 'Towing' ? '/towing.png' : '/repair.png'} alt={serviceType} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                <div style={{ position: 'absolute', top: '20px', right: '20px', background: 'white', padding: '12px 24px', borderRadius: '100px', fontWeight: '900', color: 'var(--secondary)', fontSize: '1.5rem', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}>
                                                    ${estimatedPrice}
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div>
                                                    <span className="premium-badge" style={{ background: '#EEF2FF', color: 'var(--primary)', marginBottom: '12px', padding: '6px 16px', fontSize: '0.8rem' }}>
                                                        {requestStatus === 'PENDING' ? '🔍 Searching' : requestStatus === 'ACCEPTED' ? '🚗 En Route' : '🛠️ Work in Progress'}
                                                    </span>
                                                    <h2 style={{ fontSize: '2.2rem', fontWeight: '900', letterSpacing: '-1px' }}>
                                                        {requestStatus === 'PENDING' ? 'Finding your mechanic...' :
                                                            requestStatus === 'ACCEPTED' ? `Partner arrival in ${eta} mins` :
                                                                'Repairing your vehicle'}
                                                    </h2>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '800', letterSpacing: '1px' }}>FIXED PRICE</div>
                                                </div>
                                            </div>
                                        </div>

                                        {mechanicData && (
                                            <div style={{ display: 'flex', gap: '20px', background: 'white', padding: '24px', borderRadius: '24px', border: '1px solid var(--glass-border)', marginBottom: '32px' }}>
                                                <div style={{ width: '64px', height: '64px', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}>
                                                    <img src={mechanicData.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${mechanicData.name}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900' }}>{mechanicData.name}</h4>
                                                    <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                                                        {[...Array(5)].map((_, i) => <Star key={i} size={14} color="#F59E0B" fill="#F59E0B" />)}
                                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700', marginLeft: '4px' }}>5.0 Rating</span>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <a href={`tel:${mechanicData.phone}`} className="btn btn-secondary" style={{ width: '48px', height: '48px', padding: 0, borderRadius: '16px' }}><Phone size={20} /></a>
                                                    <button onClick={() => setShowChat(!showChat)} className="btn btn-primary" style={{ height: '48px', padding: '0 20px', borderRadius: '16px', position: 'relative' }}>
                                                        <MessageSquare size={20} /> {showChat ? 'Hide Chat' : 'Chat'}
                                                        {hasNewMessage && <span style={{ position: 'absolute', top: -5, right: -5, width: '14px', height: '14px', background: 'var(--accent)', border: '2px solid white', borderRadius: '50%' }} />}
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {requestStatus === 'PAYMENT_PENDING' && (
                                            <div style={{ padding: '24px', background: '#F0FDF4', borderRadius: '24px', border: '1px solid #BBF7D0', textAlign: 'center' }}>
                                                <h3 style={{ fontWeight: '900' }}>Checkout</h3>
                                                <p style={{ color: '#166534', margin: '4px 0 20px' }}>Service complete. Please settle the amount.</p>
                                                <button onClick={handlePayment} className="btn btn-primary" style={{ width: '100%', padding: '16px', borderRadius: '16px' }}>{loading ? 'Paying...' : `Confirm & Pay $${estimatedPrice}`}</button>
                                            </div>
                                        )}

                                        {requestStatus === 'COMPLETED' && !isReviewed && (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                                <div style={{ textAlign: 'center' }}>
                                                    <h3 style={{ fontWeight: '900' }}>Rate your experience</h3>
                                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', margin: '16px 0' }}>
                                                        {[1, 2, 3, 4, 5].map(s => <Star key={s} size={32} onClick={() => setReviewRating(s)} style={{ cursor: 'pointer', fill: reviewRating >= s ? '#F59E0B' : 'none', color: reviewRating >= s ? '#F59E0B' : '#CBD5E1' }} />)}
                                                    </div>
                                                </div>
                                                <textarea value={reviewComment} onChange={e => setReviewComment(e.target.value)} placeholder="Write a compliment..." style={{ height: '100px', borderRadius: '16px' }} />
                                                <button onClick={submitReview} className="btn btn-primary" style={{ height: '56px', borderRadius: '16px' }}>Submit Feedback</button>
                                            </div>
                                        )}

                                        {requestStatus !== 'COMPLETED' && requestStatus !== 'PAYMENT_PENDING' && (
                                            <button onClick={resetRequest} className="btn btn-secondary" style={{ width: '100%', marginTop: '16px' }}>Cancel Request</button>
                                        )}
                                    </div>
                                ) : (
                                    /* Request Form */
                                    <div className="premium-card slide-up" style={{ padding: '40px' }}>
                                        <div style={{ marginBottom: '32px' }}>
                                            <h2 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '8px' }}>Roadside Help</h2>
                                            <p style={{ color: 'var(--text-secondary)' }}>Choose who needs assistance and select a service.</p>
                                        </div>

                                        {/* Booking Type Cards */}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
                                            <div
                                                onClick={() => setBookingForFriend(false)}
                                                style={{
                                                    padding: '20px',
                                                    borderRadius: '24px',
                                                    background: !bookingForFriend ? 'var(--primary)' : 'white',
                                                    color: !bookingForFriend ? 'white' : 'var(--text-primary)',
                                                    border: `2px solid ${!bookingForFriend ? 'var(--primary)' : 'var(--glass-border)'}`,
                                                    cursor: 'pointer',
                                                    textAlign: 'center',
                                                    transition: '0.3s'
                                                }}
                                            >
                                                <User size={24} style={{ marginBottom: '8px', color: !bookingForFriend ? 'white' : 'var(--primary)' }} />
                                                <div style={{ fontWeight: '900', fontSize: '1rem' }}>For Myself</div>
                                                <div style={{ fontSize: '0.7rem', opacity: !bookingForFriend ? 0.8 : 0.6 }}>Assistance for your profile</div>
                                            </div>
                                            <div
                                                onClick={() => setBookingForFriend(true)}
                                                style={{
                                                    padding: '20px',
                                                    borderRadius: '24px',
                                                    background: bookingForFriend ? 'var(--primary)' : 'white',
                                                    color: bookingForFriend ? 'white' : 'var(--text-primary)',
                                                    border: `2px solid ${bookingForFriend ? 'var(--primary)' : 'var(--glass-border)'}`,
                                                    cursor: 'pointer',
                                                    textAlign: 'center',
                                                    transition: '0.3s'
                                                }}
                                            >
                                                <HelpCircle size={24} style={{ marginBottom: '8px', color: bookingForFriend ? 'white' : 'var(--primary)' }} />
                                                <div style={{ fontWeight: '900', fontSize: '1rem' }}>For a Friend</div>
                                                <div style={{ fontSize: '0.7rem', opacity: bookingForFriend ? 0.8 : 0.6 }}>Request help for someone else</div>
                                            </div>
                                        </div>

                                        {/* Friend Details Section */}
                                        {bookingForFriend && (
                                            <div className="fade-in" style={{ padding: '24px', background: '#F8FAFC', borderRadius: '24px', marginBottom: '32px', border: '1px solid var(--glass-border)' }}>
                                                <p style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '16px' }}>📍 FRIEND'S CONTACT & LOCATION</p>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                                    <input value={friendName} onChange={e => setFriendName(e.target.value)} placeholder="Friend's Name" style={{ background: 'white', borderRadius: '12px' }} />
                                                    <input value={friendPhone} onChange={e => setFriendPhone(e.target.value)} placeholder="Friend's Phone" style={{ background: 'white', borderRadius: '12px' }} />
                                                </div>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <input value={friendAddress} onChange={e => setFriendAddress(e.target.value)} placeholder="Friend's Pickup Address" style={{ flex: 1, background: 'white', borderRadius: '12px' }} />
                                                    <button type="button" onClick={() => setPickingMode('friend')} className="btn btn-secondary" style={{ borderRadius: '12px', background: pickingMode === 'friend' ? 'var(--accent)' : 'white', color: pickingMode === 'friend' ? 'white' : 'inherit' }}>
                                                        <MapPin size={18} /> {friendLat ? 'Pinned' : 'Pick on Map'}
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Vehicle Selection Section */}
                                        <div style={{ marginBottom: '32px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                                <label style={{ fontSize: '0.8rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}><Car size={16} /> YOUR VEHICLE</label>
                                                <button type="button" onClick={() => setShowVehicleManager(!showVehicleManager)} style={{ fontSize: '0.75rem', color: 'white', background: 'var(--primary)', padding: '4px 12px', borderRadius: '100px', fontWeight: '800', border: 'none', cursor: 'pointer' }}>
                                                    {showVehicleManager ? 'Close Manager' : '+ Manage Garage'}
                                                </button>
                                            </div>

                                            {showVehicleManager ? (
                                                <div className="fade-in" style={{ padding: '20px', background: '#F8FAFC', borderRadius: '24px', marginBottom: '16px', border: '2px dashed var(--glass-border)' }}>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
                                                        {vehicles && vehicles.length > 0 ? vehicles.map(v => (
                                                            <div key={v._id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', background: 'white', borderRadius: '14px', border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                                                <span style={{ fontSize: '0.85rem', fontWeight: '800' }}>{v.make} {v.model}</span>
                                                                <X size={16} style={{ cursor: 'pointer', color: '#EF4444' }} onClick={() => removeVehicle(v._id)} />
                                                            </div>
                                                        )) : <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No vehicles added yet.</span>}
                                                    </div>
                                                    <p style={{ fontSize: '0.7rem', fontWeight: '800', marginBottom: '10px' }}>ADD NEW VEHICLE</p>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                                                        <input value={newVehicle.make} onChange={e => setNewVehicle({ ...newVehicle, make: e.target.value })} placeholder="Company (e.g. Tesla)" style={{ background: 'white', padding: '10px' }} />
                                                        <input value={newVehicle.model} onChange={e => setNewVehicle({ ...newVehicle, model: e.target.value })} placeholder="Model (e.g. Model 3)" style={{ background: 'white', padding: '10px' }} />
                                                    </div>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                                                        <input value={newVehicle.licensePlate} onChange={e => setNewVehicle({ ...newVehicle, licensePlate: e.target.value })} placeholder="License Plate Number" style={{ background: 'white', padding: '10px' }} />
                                                        <input value={newVehicle.color} onChange={e => setNewVehicle({ ...newVehicle, color: e.target.value })} placeholder="Vehicle Color" style={{ background: 'white', padding: '10px' }} />
                                                    </div>
                                                    <button type="button" onClick={addVehicle} className="btn btn-primary" style={{ width: '100%', borderRadius: '12px' }}>Add Vehicle</button>
                                                </div>
                                            ) : (
                                                <div style={{ position: 'relative' }}>
                                                    <select
                                                        value={selectedVehicle?._id || ''}
                                                        onChange={e => setSelectedVehicle(vehicles.find(v => v._id === e.target.value))}
                                                        style={{ borderRadius: '16px', background: 'white', padding: '14px 20px', fontWeight: '700', appearance: 'none' }}
                                                    >
                                                        <option value="">-- Choose from your Garage --</option>
                                                        {vehicles && vehicles.map(v => (
                                                            <option key={v._id} value={v._id}>{v.make} {v.model} ({v.licensePlate || 'N/A'})</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}
                                        </div>

                                        {/* Service Grid */}
                                        <div style={{ marginBottom: '12px' }}>
                                            <label style={{ fontSize: '0.8rem', fontWeight: '800' }}>WHAT SERVICE DO YOU NEED?</label>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
                                            {services.map(s => (
                                                <div
                                                    key={s.id}
                                                    onClick={() => setServiceType(s.id)}
                                                    style={{
                                                        padding: '24px 16px',
                                                        borderRadius: '24px',
                                                        background: serviceType === s.id ? `${s.color}10` : 'white',
                                                        border: `2px solid ${serviceType === s.id ? s.color : 'var(--glass-border)'}`,
                                                        cursor: 'pointer',
                                                        transition: '0.3s',
                                                        textAlign: 'center',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        gap: '12px'
                                                    }}
                                                >
                                                    <div style={{
                                                        width: '48px', height: '48px',
                                                        borderRadius: '16px',
                                                        background: serviceType === s.id ? s.color : '#f1f5f9',
                                                        color: serviceType === s.id ? 'white' : 'var(--text-secondary)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        transition: '0.3s'
                                                    }}>
                                                        {s.icon}
                                                    </div>
                                                    <span style={{ fontWeight: '800', fontSize: '0.9rem', color: serviceType === s.id ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{s.name}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', marginBottom: '10px' }}>REPAIR DETAILS</label>
                                                <textarea value={issue} onChange={e => setIssue(e.target.value)} placeholder="Wait, what happened to your car? Describe it here..." style={{ height: '120px', padding: '16px', borderRadius: '16px' }} />
                                            </div>

                                            {serviceType === 'Towing' && (
                                                <div style={{ padding: '24px', background: '#F0FDF4', borderRadius: '24px', border: '1px solid #BBF7D0' }}>
                                                    <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: '800', color: '#166534', marginBottom: '12px' }}>TOWING DESTINATION</p>
                                                    <div style={{ display: 'flex', gap: '10px' }}>
                                                        <input value={towDestAddress} onChange={e => setTowDestAddress(e.target.value)} placeholder="Workshop full address..." style={{ flex: 1, borderRadius: '12px', background: 'white' }} />
                                                        <button type="button" onClick={() => setPickingMode('tow')} className="btn btn-secondary" style={{ borderRadius: '12px', background: pickingMode === 'tow' ? 'var(--accent)' : 'white', color: pickingMode === 'tow' ? 'white' : 'inherit' }}>
                                                            <MapPin size={18} /> Map
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            <div style={{ background: 'var(--primary)', color: 'white', padding: '24px', borderRadius: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 15px 30px var(--primary-glow)' }}>
                                                <div>
                                                    <span style={{ fontSize: '0.8rem', opacity: 0.8, fontWeight: '700' }}>TOTAL ESTIMATE</span>
                                                    <div style={{ fontSize: '2.5rem', fontWeight: '900' }}>${estimatedPrice}</div>
                                                </div>
                                                <button type="submit" className="btn" style={{ background: 'white', color: 'var(--primary)', padding: '18px 36px', borderRadius: '100px', fontWeight: '900', fontSize: '1.1rem' }}>{loading ? 'Processing...' : 'Request Help'}</button>
                                            </div>
                                        </form>
                                    </div>


                                )}
                            </div>
                        ) : (
                            /* History Tab */
                            <div className="premium-card slide-up" style={{ padding: '32px' }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '900', marginBottom: '24px' }}>Service History</h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {history.map(item => (
                                        <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: 'white', borderRadius: '20px', border: '1px solid var(--glass-border)' }}>
                                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                                <div style={{
                                                    width: '48px', height: '48px',
                                                    background: 'var(--light-bg)', borderRadius: '14px',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                }}>
                                                    {services.find(s => s.id === item.serviceType)?.icon || <Clock size={24} />}
                                                </div>
                                                <div>
                                                    <p style={{ margin: 0, fontWeight: '800' }}>{item.serviceType}</p>
                                                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(item.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontWeight: '900', color: 'var(--secondary)' }}>${item.price}</div>
                                                <div style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--primary)' }}>PAID</div>
                                            </div>
                                        </div>
                                    ))}
                                    {history.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No completed jobs yet.</p>}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Side Map Sticky */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div className="map-container" style={{ height: '400px', borderRadius: '32px', position: 'sticky', top: '100px' }}>
                            <MapComponent
                                center={[location.lat, location.lng]}
                                markers={[{ position: [location.lat, location.lng], type: 'user' }]}
                                zoom={15}
                                onMapClick={pickingMode !== 'none' ? handleMapClick : null}
                            />
                        </div>

                        {showChat && requestId && (
                            <div className="premium-card slide-up" style={{ height: '400px', padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--glass-border)', background: 'var(--primary)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h4 style={{ margin: 0, fontWeight: '900' }}>Chat with Partner</h4>
                                    <button onClick={() => setShowChat(false)} style={{ background: 'none', border: 'none', color: 'white' }}><X size={20} /></button>
                                </div>
                                <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', background: '#F8FAFC' }}>
                                    {chats.map((c, i) => (
                                        <div key={i} style={{ alignSelf: c.senderRole === 'driver' ? 'flex-end' : 'flex-start', background: c.senderRole === 'driver' ? 'var(--primary)' : 'white', color: c.senderRole === 'driver' ? 'white' : 'var(--text-primary)', padding: '10px 14px', borderRadius: '18px', fontSize: '0.85rem', maxWidth: '85%', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>{c.message}</div>
                                    ))}
                                    <div ref={chatEndRef} />
                                </div>
                                <form onSubmit={sendMessage} style={{ padding: '12px', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '8px' }}>
                                    <input value={chatMessage} onChange={e => setChatMessage(e.target.value)} placeholder="Type message..." style={{ flex: 1, padding: '10px 16px', borderRadius: '100px' }} />
                                    <button type="submit" className="btn btn-primary" style={{ height: '42px', width: '42px', padding: 0, borderRadius: '50%' }}><Send size={18} /></button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <div className="toast-container">{toasts.map(t => (<div key={t.id} className={`toast ${t.type}`} style={{ background: t.type === 'success' ? '#10B981' : '#EF4444', color: 'white', padding: '16px 24px', borderRadius: '12px', fontWeight: '800' }}>{t.message}</div>))}</div>
        </div>
    );
};

export default DriverHome;
