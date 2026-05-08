import React from 'react';
import { MapPin, AlertCircle, HelpCircle } from 'lucide-react';
import MapComponent from '../../components/MapComponent';
import { useMechanic } from '../../context/MechanicContext';

const AvailableJobs = () => {
    const {
        requests,
        activeJobs,
        location,
        isAvailable,
        toggleAvailability,
        acceptRequest,
        isPickingLocation,
        setIsPickingLocation,
        setManualLat,
        setManualLng,
        setManualLocation,
        addToast
    } = useMechanic();

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

    const handleMapClick = (coords) => {
        if (isPickingLocation) {
            setManualLat(coords[0].toFixed(6));
            setManualLng(coords[1].toFixed(6));
            setManualLocation(true);
            setIsPickingLocation(false);
            addToast("Pinned!");
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

    return (
        <div className="slide-up">
            <div style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: '900', letterSpacing: '-1px' }}>Jobs <span style={{ color: 'var(--primary)' }}>Near You</span></h2>
                <p style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>Accept requests from drivers in your area.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '32px' }}>
                {!isAvailable && (
                    <div className="premium-card" style={{ padding: '60px', textAlign: 'center', gridColumn: '1 / -1', maxWidth: '500px', margin: '40px auto' }}>
                        <AlertCircle size={64} color="var(--accent)" style={{ margin: '0 auto 20px', display: 'block' }} />
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '800' }}>You are Offline</h3>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '12px' }}>Go online to see drivers waiting for help near you.</p>
                        <button onClick={toggleAvailability} className="btn btn-primary" style={{ marginTop: '32px', width: '100%', height: '56px', fontSize: '1.1rem' }}>Go Online Now</button>
                    </div>
                )}

                {isAvailable && requests.length === 0 && (
                    <div className="premium-card" style={{ padding: '60px', textAlign: 'center', gridColumn: '1 / -1', opacity: 0.8, maxWidth: '500px', margin: '40px auto' }}>
                        <HelpCircle size={64} color="var(--text-muted)" style={{ margin: '0 auto 20px', display: 'block' }} />
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Searching for jobs...</h3>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '12px' }}>No active requests found. Try increasing your search radius in settings.</p>
                    </div>
                )}

                {isAvailable && requests.map(req => {
                    if (!req?.location?.coordinates) return null;
                    const d = calculateDist(location.lat, location.lng, req.location.coordinates[1], req.location.coordinates[0]);
                    const serviceImage = req.serviceType === 'Towing' ? '/towing.png' : '/repair.png';

                    return (
                        <div key={req._id} className="premium-card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: '400px', background: 'white', border: '1px solid var(--glass-border)' }}>
                            <div style={{ height: '160px', width: '100%', position: 'relative', flexShrink: 0 }}>
                                <img src={serviceImage} alt={req.serviceType} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <div style={{ position: 'absolute', top: '16px', right: '16px', background: 'var(--primary)', color: 'white', padding: '10px 20px', borderRadius: '100px', fontWeight: '900', fontSize: '1.4rem', boxShadow: '0 8px 20px var(--primary-glow)', zIndex: 10 }}>
                                    ${req.price || 0}
                                </div>
                                <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', background: 'linear-gradient(transparent, rgba(0,0,0,0.9))', padding: '20px', color: 'white' }}>
                                    <div style={{ fontSize: '0.8rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px', color: 'rgba(255,255,255,0.8)' }}>{req.serviceType}</div>
                                    <h4 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '900' }}>{req.driverName || 'Nearby Customer'}</h4>
                                </div>
                            </div>

                            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1, gap: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)', fontWeight: '700', fontSize: '1rem' }}>
                                    <MapPin size={20} color="var(--primary)" />
                                    {d.toFixed(1)} km away from you
                                </div>

                                <div style={{ background: 'var(--light-bg)', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', flex: 1 }}>
                                    <p style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)', fontStyle: 'italic', lineHeight: '1.4' }}>
                                        "{req.issue || 'Emergency help needed'}"
                                    </p>
                                </div>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        acceptRequest(req._id);
                                    }}
                                    className="btn"
                                    style={{
                                        width: '100%',
                                        fontWeight: '900',
                                        padding: '20px',
                                        fontSize: '1.2rem',
                                        background: 'var(--secondary)',
                                        color: 'white',
                                        borderRadius: '16px',
                                        boxShadow: '0 8px 20px var(--secondary-glow)',
                                        transition: '0.3s'
                                    }}
                                >
                                    Accept Job Now
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AvailableJobs;
