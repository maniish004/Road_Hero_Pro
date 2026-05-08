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
const MechanicContext = createContext();

export const MechanicProvider = ({ children }) => {
    const { user, updateUser } = useContext(AuthContext);
    const [requests, setRequests] = useState([]);
    const [activeJobs, setActiveJobs] = useState([]);
    const [completedJobs, setCompletedJobs] = useState([]);
    const [location, setLocation] = useState({ lat: 51.505, lng: -0.09 });
    const [radius, setRadius] = useState(50);
    const [address, setAddress] = useState('Fetching address...');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [chats, setChats] = useState([]);
    const [hasNewMessage, setHasNewMessage] = useState(false);
    const [activeChatRequestId, setActiveChatRequestId] = useState(null);
    const [mechanicInfo, setMechanicInfo] = useState(user || {});
    const [isAvailable, setIsAvailable] = useState(user?.isAvailable ?? true);
    const [toasts, setToasts] = useState([]);
    const [isPickingLocation, setIsPickingLocation] = useState(false);
    const [manualLat, setManualLat] = useState('');
    const [manualLng, setManualLng] = useState('');
    const [manualLocation, setManualLocation] = useState(false);
    const [newMessagesPerJob, setNewMessagesPerJob] = useState({});

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

    const saveLocationPermanently = async (lat, lng) => {
        console.log("saveLocationPermanently called with:", lat, lng);
        try {
            if (isNaN(lat) || isNaN(lng)) {
                console.error("Invalid coordinates:", lat, lng);
                addToast("Invalid coordinates", "error");
                return;
            }
            console.log("Sending location update to API...");
            const response = await api.patch(`/mechanics/${user?._id}/location`, {
                latitude: lat, longitude: lng
            });
            console.log("Location update response:", response.data);

            // Update AuthContext user state so it persists
            updateUser({
                location: response.data.data.location
            });

            setLocation({ lat, lng });
            fetchAddress(lat, lng);
            addToast("Location saved!");
        } catch (error) {
            console.error("Location save error:", error);
            addToast("Failed to save location", "error");
        }
    };

    const acceptRequest = async (id) => {
        try {
            await api.patch(`/requests/${id}/accept`, { mechanicId: user?._id });
            fetchRequestsData();
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

    const updateProfile = async (profileData) => {
        try {
            const response = await api.patch(`/mechanics/${user?._id}/profile`, profileData);
            if (response.data.success) {
                setMechanicInfo(response.data.data);
                updateUser(response.data.data);
                addToast("Profile updated successfully!");
                return true;
            }
        } catch (error) {
            addToast(error.response?.data?.error || "Error updating profile", "error");
            return false;
        }
    };

    const openChat = async (reqId) => {
        setActiveChatRequestId(reqId);

        // Join the socket room for this request
        if (socket) {
            socket.emit('join_room', reqId);
        }

        setNewMessagesPerJob(prev => {
            const next = { ...prev };
            delete next[reqId];
            return next;
        });
        setHasNewMessage(false);
        try {
            const res = await api.get(`/chats/${reqId}`);
            setChats(res.data.data || []);
        } catch (err) { console.error("Chat fetch error", err); }
    };

    // Also join rooms for all active jobs on load
    useEffect(() => {
        if (activeJobs.length > 0 && socket) {
            activeJobs.forEach(job => {
                socket.emit('join_room', job._id);
            });
        }
    }, [activeJobs]);

    useEffect(() => {
        if (user?.location?.coordinates && Array.isArray(user.location.coordinates) && user.location.coordinates.length >= 2) {
            const [lng, lat] = user.location.coordinates;
            if (lat !== undefined && lng !== undefined && lat !== 0) {
                setLocation({ lat, lng });
                setManualLat(lat.toString());
                setManualLng(lng.toString());
                setManualLocation(true);
                fetchAddress(lat, lng);
            }
        } else if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setLocation({ lat: latitude, lng: longitude });
                    fetchAddress(latitude, longitude);
                    console.log("Mechanic location obtained:", latitude, longitude);
                },
                (err) => {
                    console.warn("Geolocation error:", err.message);
                    // Fallback to a default location
                    setLocation({ lat: 40.7128, lng: -74.0060 });
                    setAddress("Default Location (NYC)");
                    addToast("Location access denied. Please set your location manually.", "error");
                }
            );
        } else {
            console.warn("Geolocation not supported");
            setLocation({ lat: 40.7128, lng: -74.0060 });
            setAddress("Default Location");
        }
    }, [user]);

    useEffect(() => {
        if (!user?._id) return;
        fetchRequestsData();
        const interval = setInterval(() => fetchRequestsData(false), 5000);
        return () => clearInterval(interval);
    }, [location.lat, location.lng, radius, user?._id, isAvailable]);

    useEffect(() => {
        const handleNewMessage = (data) => {
            console.log("New message received:", data);

            // If the chat is open for this request, add message
            if (activeChatRequestId === data.requestId) {
                setChats(prev => {
                    const isDuplicate = prev.some(msg =>
                        msg.message === data.message &&
                        msg.senderId === data.senderId &&
                        msg.createdAt === data.createdAt
                    );
                    if (isDuplicate) return prev;
                    return [...prev, data];
                });
            } else {
                // Determine if this message belongs to one of my active jobs
                // We need to check if the message is relevant to the mechanic
                const isMyJob = activeJobs.some(j => j._id === data.requestId);
                if (isMyJob && data.senderRole === 'driver') {
                    setNewMessagesPerJob(prev => ({ ...prev, [data.requestId]: true }));
                    setHasNewMessage(true);
                    addToast(`New message from driver!`);
                }
            }
        };

        socket.on('receive_message', handleNewMessage);
        return () => {
            socket.off('receive_message', handleNewMessage);
        };
    }, [activeChatRequestId, activeJobs]);

    const value = {
        requests,
        activeJobs,
        completedJobs,
        location,
        setLocation,
        radius,
        setRadius,
        address,
        isRefreshing,
        chats,
        hasNewMessage,
        setHasNewMessage,
        activeChatRequestId,
        setActiveChatRequestId,
        mechanicInfo,
        isAvailable,
        toggleAvailability,
        saveLocationPermanently,
        acceptRequest,
        finishJob,
        openChat,
        toasts,
        addToast,
        isPickingLocation,
        setIsPickingLocation,
        manualLat,
        setManualLat,
        manualLng,
        setManualLng,
        manualLocation,
        setManualLocation,
        newMessagesPerJob,
        socket,
        updateProfile
    };

    return (
        <MechanicContext.Provider value={value}>
            {children}
        </MechanicContext.Provider>
    );
};

export const useMechanic = () => useContext(MechanicContext);
