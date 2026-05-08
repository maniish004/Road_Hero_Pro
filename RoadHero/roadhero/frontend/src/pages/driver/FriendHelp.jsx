import React, { useState, useEffect, useContext } from 'react';
import { MapPin, Wrench, Fuel, Truck, LifeBuoy, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import AuthContext from '../../context/AuthContext';
import { useDriver } from '../../context/DriverContext';
import MapComponent from '../../components/MapComponent';

const FriendHelp = () => {
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
        requestStatus
    } = useDriver();

    const navigate = useNavigate();

    const [serviceType, setServiceType] = useState('General');
    const [friendName, setFriendName] = useState('');
    const [friendPhone, setFriendPhone] = useState('');
    const [friendAddress, setFriendAddress] = useState('');
    const [friendLat, setFriendLat] = useState('');
    const [friendLng, setFriendLng] = useState('');
    const [towDestLat, setTowDestLat] = useState('');
    const [towDestLng, setTowDestLng] = useState('');
    const [towDestAddress, setTowDestAddress] = useState('');
    const [estimatedPrice, setEstimatedPrice] = useState(50);
    const [pickingMode, setPickingMode] = useState('none');

    useEffect(() => {
        if (requestStatus && requestStatus !== 'COMPLETED' && requestStatus !== 'CANCELLED') {
            navigate('/driver/activity');
        }
    }, [requestStatus, navigate]);

    useEffect(() => {
        const basePrices = { 'General': 50, 'Towing': 80, 'Tire': 40, 'Fuel': 35 };
        if (serviceType === 'Towing' && towDestLat && towDestLng) {
            const startLat = parseFloat(friendLat) || location.lat;
            const startLng = parseFloat(friendLng) || location.lng;
            const d = calculateDist(startLat, startLng, parseFloat(towDestLat), parseFloat(towDestLng));
            setEstimatedPrice(Math.round(basePrices['Towing'] + (d * 5)));
        } else {
            setEstimatedPrice(basePrices[serviceType] || 50);
        }
    }, [serviceType, towDestLat, towDestLng, location, friendLat, friendLng]);

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
        if (!friendName.trim() || !friendPhone.trim() || !friendLat) return addToast("Please complete your friend's details", 'error');

        setLoading(true);
        try {
            const res = await api.post('/requests', {
                driverName: friendName,
                driverPhone: friendPhone,
                driverId: user._id,
                issue: `Friend needs emergency ${serviceType} assistance`,
                serviceType,
                latitude: parseFloat(friendLat),
                longitude: parseFloat(friendLng),
                towDestLat: serviceType === 'Towing' ? parseFloat(towDestLat) : undefined,
                towDestLng: serviceType === 'Towing' ? parseFloat(towDestLng) : undefined,
                towDestAddress: serviceType === 'Towing' ? towDestAddress : undefined,
                price: estimatedPrice
            });
            setRequestId(res.data.data._id);
            setRequestStatus('PENDING');
            setRequestLocation({
                lat: parseFloat(friendLat),
                lng: parseFloat(friendLng)
            });
            addToast('Request sent for your friend!');
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
                            Help a <span style={{ color: 'var(--primary)' }}>Friend</span>
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Request roadside assistance for someone else.</p>
                    </div>

                    <div className="premium-card" style={{ padding: '40px' }}>
                        <div style={{ padding: '24px', background: '#F8FAFC', borderRadius: '32px', marginBottom: '32px', border: '1px solid var(--glass-border)' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '16px', textTransform: 'uppercase' }}>📍 Friend's Information</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                                <input value={friendName} onChange={e => setFriendName(e.target.value)} placeholder="Friend's Name" required />
                                <input value={friendPhone} onChange={e => setFriendPhone(e.target.value)} placeholder="Friend's Phone" required />
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <div style={{ flex: 1, position: 'relative' }}>
                                    <input
                                        value={friendAddress}
                                        onChange={e => setFriendAddress(e.target.value)}
                                        placeholder="Where is your friend? (Street, Area)"
                                        style={{ width: '100%', paddingRight: '40px' }}
                                    />
                                    {friendLat && <MapPin size={18} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setPickingMode('friend')}
                                    className={`btn ${pickingMode === 'friend' ? 'btn-primary' : 'btn-secondary'}`}
                                    style={{
                                        whiteSpace: 'nowrap',
                                        minWidth: '140px',
                                        background: pickingMode === 'friend' ? 'var(--accent)' : (friendLat ? '#F0FDF4' : ''),
                                        borderColor: pickingMode === 'friend' ? 'var(--accent)' : (friendLat ? '#BBF7D0' : ''),
                                        color: pickingMode === 'friend' ? 'white' : (friendLat ? '#166534' : 'inherit')
                                    }}
                                >
                                    {pickingMode === 'friend' ? (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <div className="dot-pulse"></div> Picking...
                                        </span>
                                    ) : friendLat ? (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <MapPin size={18} /> Location Set
                                        </span>
                                    ) : (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <MapPin size={18} /> Pick on Map
                                        </span>
                                    )}
                                </button>
                            </div>
                            {!friendLat && pickingMode !== 'friend' && (
                                <p style={{ fontSize: '0.7rem', color: 'var(--accent)', marginTop: '8px', fontWeight: '800' }}>
                                    ⚠️ Please tap 'Pick on Map' and select the location on the map.
                                </p>
                            )}
                        </div>
                        <style>{`
                            .dot-pulse {
                                width: 8px;
                                height: 8px;
                                background: white;
                                border-radius: 50%;
                                animation: pulse 1s infinite alternate;
                            }
                            @keyframes pulse {
                                from { opacity: 1; transform: scale(1); }
                                to { opacity: 0.5; transform: scale(1.5); }
                            }
                        `}</style>

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
                                    <div style={{ display: 'flex', gap: '10px' }}>
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
                            center={friendLat ? [parseFloat(friendLat), parseFloat(friendLng)] : [location.lat, location.lng]}
                            markers={[
                                (location?.lat && location?.lng) ? { position: [location.lat, location.lng], type: 'user', content: 'You' } : null,
                                (friendLat && friendLng) ? { position: [parseFloat(friendLat), parseFloat(friendLng)], type: 'active', content: "Friend's Location" } : null,
                                (towDestLat && towDestLng) ? { position: [parseFloat(towDestLat), parseFloat(towDestLng)], type: 'mechanic', content: "Towing Destination" } : null
                            ].filter(Boolean)}
                            zoom={15}
                            onMapClick={pickingMode !== 'none' ? handleMapClick : null}
                        />
                        {pickingMode !== 'none' && (
                            <div style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px', background: 'var(--accent)', color: 'white', padding: '16px', borderRadius: '16px', textAlign: 'center', fontWeight: '900', zIndex: 1000, boxShadow: '0 8px 32px rgba(0,0,0,0.3)', border: '2px solid white' }}>
                                <div style={{ marginBottom: '4px' }}>📍 SELECT {pickingMode.toUpperCase()} LOCATION</div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.9, fontWeight: '700' }}>Tap anywhere on the map to set location</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FriendHelp;
