import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import api from '../api';
import AuthContext from './AuthContext';
import { io } from 'socket.io-client';

let socket;
try {
    socket = io(import.meta.env.PROD ? window.location.origin : 'http://localhost:5000');
} catch (error) {
    console.error("Socket initialization error:", error);
    socket = null;
}
const DriverContext = createContext();

export const DriverProvider = ({ children }) => {
    const { user, updateUser } = useContext(AuthContext);

    // Core State
    const [requestId, setRequestId] = useState(null);
    const [requestStatus, setRequestStatus] = useState(null);
    const [mechanicData, setMechanicData] = useState(null);
    const [requestLocation, setRequestLocation] = useState(null);
    const [history, setHistory] = useState([]);
    const [vehicles, setVehicles] = useState([]);

    // Sync vehicles with user
    useEffect(() => {
        if (user?.vehicles) {
            setVehicles(user.vehicles);
        }
    }, [user?.vehicles]);
    const [location, setLocation] = useState({ lat: 51.505, lng: -0.09 });

    // UI State
    const [toasts, setToasts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [chats, setChats] = useState([]);
    const [hasNewMessage, setHasNewMessage] = useState(false);
    const [eta, setEta] = useState(0);

    const addToast = (message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    };

    const fetchHistory = async () => {
        try {
            const res = await api.get(`/requests/driver/${user?._id}?status=COMPLETED`);
            if (res.data && Array.isArray(res.data.data)) {
                setHistory(res.data.data);
            }
        } catch (err) { console.error("History fetch error", err); }
    };

    const checkActiveSession = async () => {
        if (!user?._id) return;
        try {
            const res = await api.get(`/requests/driver/${user._id}`);
            if (res.data && Array.isArray(res.data.data)) {
                const recent = res.data.data.find(r => r.status && r.status !== 'COMPLETED' && r.status !== 'CANCELLED');
                if (recent) {
                    setRequestId(recent._id);
                    setRequestStatus(recent.status);
                    if (recent.location?.coordinates?.length >= 2) {
                        setRequestLocation({ lat: recent.location.coordinates[1], lng: recent.location.coordinates[0] });
                    }
                    if (recent.assignedMechanic) setMechanicData(recent.assignedMechanic);
                }
            }
        } catch (err) { console.error("Session check error", err); }
    };

    const resetRequest = () => {
        setRequestStatus(null);
        setRequestId(null);
        setMechanicData(null);
        setRequestLocation(null);
        setChats([]);
        setHasNewMessage(false);
        fetchHistory();
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
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                    console.log("Driver location obtained:", pos.coords.latitude, pos.coords.longitude);
                },
                (err) => {
                    console.warn("Geolocation error:", err.message);
                    // Fallback to a default location (e.g., New York City)
                    setLocation({ lat: 40.7128, lng: -74.0060 });
                    addToast("Location access denied. Using default location.", "error");
                }
            );
        } else {
            console.warn("Geolocation not supported");
            setLocation({ lat: 40.7128, lng: -74.0060 });
        }
        checkActiveSession();
        fetchHistory();
    }, [user?._id]);

    useEffect(() => {
        let interval;
        if (requestId && requestStatus !== 'COMPLETED' && requestStatus !== 'CANCELLED') {
            interval = setInterval(async () => {
                try {
                    const reqRes = await api.get(`/requests/${requestId}`);
                    const requestData = reqRes.data?.data;
                    if (!requestData) return;

                    const newStatus = requestData.status;

                    if (newStatus && newStatus !== requestStatus) {
                        setRequestStatus(newStatus);
                    }

                    if (requestData && (newStatus === 'ACCEPTED' || newStatus === 'PAYMENT_PENDING' || newStatus === 'ARRIVED' || newStatus === 'IN_PROGRESS') && requestData.assignedMechanic) {
                        setMechanicData(requestData.assignedMechanic);
                        if (newStatus === 'ACCEPTED' && requestData.assignedMechanic.location?.coordinates?.length >= 2) {
                            const mechLoc = requestData.assignedMechanic.location.coordinates;
                            const dLoc = requestLocation || location;
                            if (dLoc && mechLoc && mechLoc.length >= 2) {
                                const distance = calculateDist(dLoc.lat, dLoc.lng, mechLoc[1], mechLoc[0]);
                                const travelTime = Math.round((distance / 30) * 60 + 2);
                                setEta(travelTime > 0 ? travelTime : 1);
                            }
                        }
                    }
                } catch (err) { console.error("Polling error", err); }
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [requestId, requestStatus, location, requestLocation]);

    useEffect(() => {
        if (requestId && socket) {
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

                if (data.senderRole === 'mechanic') {
                    setHasNewMessage(true);
                    try {
                        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');
                        audio.volume = 0.2;
                        audio.play().catch(e => { });
                    } catch (e) {
                        console.warn("Audio play failed", e);
                    }
                    addToast(`New message from mechanic!`);
                }
            }
        };

        if (socket) {
            socket.on('receive_message', handleNewMessage);
        }
        return () => {
            if (socket) {
                socket.off('receive_message', handleNewMessage);
            }
        };
    }, [requestId]);

    const value = {
        requestId, setRequestId,
        requestStatus, setRequestStatus,
        mechanicData, setMechanicData,
        requestLocation, setRequestLocation,
        history, fetchHistory,
        vehicles, setVehicles,
        location, setLocation,
        toasts, addToast,
        loading, setLoading,
        chats, setChats,
        hasNewMessage, setHasNewMessage,
        eta, socket,
        resetRequest,
        calculateDist
    };

    return (
        <DriverContext.Provider value={value}>
            {children}
        </DriverContext.Provider>
    );
};

export const useDriver = () => useContext(DriverContext);
