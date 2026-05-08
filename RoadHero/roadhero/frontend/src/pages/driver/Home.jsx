import React, { useState, useEffect, useContext } from 'react';
import { MapPin, Wrench, Fuel, Truck, LifeBuoy, Car, User, HelpCircle, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import AuthContext from '../../context/AuthContext';
import { useDriver } from '../../context/DriverContext';
import MapComponent from '../../components/MapComponent';

const Home = () => {
    const { user } = useContext(AuthContext);
    const {
        location,
        addToast,
        setLoading,
        loading,
        setRequestId,
        setRequestStatus,
        setRequestLocation,
        calculateDist,
        vehicles,
        requestStatus
    } = useDriver();

    const navigate = useNavigate();

    const [issue, setIssue] = useState('');
    const [serviceType, setServiceType] = useState('General');
    const [bookingForFriend, setBookingForFriend] = useState(false);
    const [friendName, setFriendName] = useState('');
    const [friendPhone, setFriendPhone] = useState('');
    const [friendAddress, setFriendAddress] = useState('');
    const [friendLat, setFriendLat] = useState('');
    const [friendLng, setFriendLng] = useState('');
    const [towDestLat, setTowDestLat] = useState('');
    const [towDestLng, setTowDestLng] = useState('');
    const [towDestAddress, setTowDestAddress] = useState('');
    const [estimatedPrice, setEstimatedPrice] = useState(50);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [pickingMode, setPickingMode] = useState('none');

    // If there is an active request, redirect to Activity page
    useEffect(() => {
        if (requestStatus && requestStatus !== 'COMPLETED' && requestStatus !== 'CANCELLED') {
            navigate('/driver/activity');
        }
    }, [requestStatus, navigate]);

    useEffect(() => {
        const basePrices = { 'General': 50, 'Towing': 80, 'Tire': 40, 'Fuel': 35 };
        if (serviceType === 'Towing' && towDestLat && towDestLng) {
            const startLat = bookingForFriend ? parseFloat(friendLat) : location.lat;
            const startLng = bookingForFriend ? parseFloat(friendLng) : location.lng;
            const d = calculateDist(startLat, startLng, parseFloat(towDestLat), parseFloat(towDestLng));
            setEstimatedPrice(Math.round(basePrices['Towing'] + (d * 5)));
        } else {
            setEstimatedPrice(basePrices[serviceType] || 50);
        }
    }, [serviceType, towDestLat, towDestLng, location, bookingForFriend, friendLat, friendLng]);

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

        setLoading(true);
        try {
            const res = await api.post('/requests', {
                driverName: user.name,
                driverPhone: user.phone,
                driverId: user._id,
                issue: `Emergency ${serviceType} assistance needed`,
                serviceType,
                latitude: location.lat,
                longitude: location.lng,
                towDestLat: serviceType === 'Towing' ? parseFloat(towDestLat) : undefined,
                towDestLng: serviceType === 'Towing' ? parseFloat(towDestLng) : undefined,
                towDestAddress: serviceType === 'Towing' ? towDestAddress : undefined,
                price: estimatedPrice,
                vehicle: selectedVehicle
            });
            setRequestId(res.data.data._id);
            setRequestStatus('PENDING');
            setRequestLocation({
                lat: location.lat,
                lng: location.lng
            });
            addToast('Request sent! Finding mechanics...');
            navigate('/driver/activity');
        } catch (error) {
            addToast('Error sending request', 'error');
        } finally {
            setLoading(false);
        }
    };

    const services = [
        { id: 'General', name: 'Repair', icon: <Wrench size={24} />, color: '#6366f1' },
        { id: 'Tire', name: 'Flat Tire', icon: <LifeBuoy size={24} />, color: '#10b981' },
        { id: 'Fuel', name: 'Fuel', icon: <Fuel size={24} />, color: '#f59e0b' },
        { id: 'Towing', name: 'Towing', icon: <Truck size={24} />, color: '#f43f5e' }
    ];

    return (
        <div className="slide-up">
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 400px', gap: '40px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    <div style={{ marginBottom: '8px' }}>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-1.5px', marginBottom: '8px' }}>
                            Need <span style={{ color: 'var(--primary)' }}>Assistance?</span>
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Get help on the road in minutes from verified professionals.</p>
                    </div>

                    <div className="premium-card" style={{ padding: '40px' }}>
                        <div style={{ marginBottom: '32px' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase' }}>Which Vehicle?</label>
                            <select
                                value={selectedVehicle?._id || ''}
                                onChange={e => setSelectedVehicle(vehicles.find(v => v._id === e.target.value))}
                                style={{ borderRadius: '16px', background: '#F8FAFC' }}
                            >
                                <option value="">-- Choose from your Garage --</option>
                                {Array.isArray(vehicles) && vehicles.map(v => (
                                    <option key={v._id} value={v._id}>{v.make} {v.model} ({v.licensePlate})</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ marginBottom: '40px' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-secondary)', marginBottom: '16px', textTransform: 'uppercase' }}>Choose Service</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                                {services.map(s => (
                                    <div
                                        key={s.id}
                                        onClick={() => setServiceType(s.id)}
                                        style={{
                                            padding: '20px 12px',
                                            borderRadius: '20px',
                                            background: serviceType === s.id ? `${s.color}10` : 'white',
                                            border: `2px solid ${serviceType === s.id ? s.color : 'var(--glass-border)'}`,
                                            cursor: 'pointer',
                                            transition: '0.3s',
                                            textAlign: 'center',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}
                                    >
                                        <div style={{ padding: '12px', borderRadius: '14px', background: serviceType === s.id ? s.color : '#F1F5F9', color: serviceType === s.id ? 'white' : 'var(--text-secondary)' }}>
                                            {s.icon}
                                        </div>
                                        <span style={{ fontWeight: '800', fontSize: '0.85rem' }}>{s.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {serviceType === 'Towing' && (
                                <div className="fade-in" style={{ padding: '24px', background: '#F0FDF4', borderRadius: '24px', border: '1px solid #BBF7D0' }}>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#166534', marginBottom: '12px' }}>TOWING DESTINATION</label>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <input value={towDestAddress} onChange={e => setTowDestAddress(e.target.value)} placeholder="Workshop full address..." style={{ flex: 1 }} />
                                        <button type="button" onClick={() => setPickingMode('tow')} className="btn btn-secondary">
                                            <MapPin size={18} /> Map
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div style={{ background: 'var(--primary)', color: 'white', padding: '24px', borderRadius: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 12px 32px var(--primary-glow)' }}>
                                <div>
                                    <span style={{ fontSize: '0.8rem', opacity: 0.8, fontWeight: '700', textTransform: 'uppercase' }}>Estimated Price</span>
                                    <div style={{ fontSize: '2.5rem', fontWeight: '900' }}>${estimatedPrice}</div>
                                </div>
                                <button type="submit" disabled={loading} className="btn" style={{ background: 'white', color: 'var(--primary)', padding: '16px 32px', borderRadius: '100px', fontWeight: '900', fontSize: '1.1rem' }}>
                                    {loading ? 'Processing...' : 'Request Help'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="map-container" style={{ height: '500px', borderRadius: '32px', position: 'sticky', top: '100px' }}>
                        <MapComponent
                            center={[location.lat, location.lng]}
                            markers={[
                                (location?.lat && location?.lng) ? { position: [location.lat, location.lng], type: 'user', content: 'You' } : null,
                                (towDestLat && towDestLng) ? { position: [parseFloat(towDestLat), parseFloat(towDestLng)], type: 'mechanic', content: "Towing Destination" } : null
                            ].filter(Boolean)}
                            zoom={15}
                            onMapClick={pickingMode !== 'none' ? handleMapClick : null}
                        />
                        {pickingMode !== 'none' && (
                            <div style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px', background: 'var(--accent)', color: 'white', padding: '16px', borderRadius: '16px', textAlign: 'center', fontWeight: '900', zIndex: 1000, boxShadow: '0 8px 32px rgba(0,0,0,0.3)', border: '2px solid white' }}>
                                <div style={{ marginBottom: '4px' }}>📍 SELECT TOWING DESTINATION</div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.9, fontWeight: '700' }}>Tap anywhere on the map to set location</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
