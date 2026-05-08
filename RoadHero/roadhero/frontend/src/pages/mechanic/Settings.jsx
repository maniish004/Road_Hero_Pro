import React, { useState } from 'react';
import { MapPin, User, Bell, Shield, Sliders } from 'lucide-react';
import { useMechanic } from '../../context/MechanicContext';
import MapComponent from '../../components/MapComponent';

const Settings = () => {
    const {
        radius,
        setRadius,
        location,
        address,
        manualLat,
        setManualLat,
        manualLng,
        setManualLng,
        setManualLocation,
        saveLocationPermanently,
        mechanicInfo,
        isPickingLocation,
        setIsPickingLocation,
        updateProfile
    } = useMechanic();

    const [activeTab, setActiveTab] = useState('service');
    const [isUpdating, setIsUpdating] = useState(false);
    const [formData, setFormData] = useState({
        name: mechanicInfo?.name || '',
        email: mechanicInfo?.email || '',
        phone: mechanicInfo?.phone || '',
        photoUrl: mechanicInfo?.photoUrl || ''
    });

    const handleProfileUpdate = async () => {
        setIsUpdating(true);
        const success = await updateProfile(formData);
        setIsUpdating(false);
    };

    React.useEffect(() => {
        if (mechanicInfo) {
            setFormData({
                name: mechanicInfo.name || '',
                email: mechanicInfo.email || '',
                phone: mechanicInfo.phone || '',
                photoUrl: mechanicInfo.photoUrl || ''
            });
        }
    }, [mechanicInfo]);

    const handleMapClick = (latlng) => {
        const [lat, lng] = latlng;
        setManualLat(lat.toFixed(6));
        setManualLng(lng.toFixed(6));
        setManualLocation(true);
    };

    return (
        <div className="slide-up">
            <h2 style={{ fontSize: '1.5rem', fontWeight: '900', marginBottom: '32px', letterSpacing: '-0.5px' }}>Pro <span style={{ color: 'var(--primary)' }}>Settings</span></h2>

            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '40px' }}>
                <aside style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button onClick={() => setActiveTab('service')} className={`settings-nav-btn ${activeTab === 'service' ? 'active' : ''}`}>
                        <Sliders size={20} /> Service Area
                    </button>
                    <button onClick={() => setActiveTab('profile')} className={`settings-nav-btn ${activeTab === 'profile' ? 'active' : ''}`}>
                        <User size={20} /> Professional Profile
                    </button>
                    <button onClick={() => setActiveTab('notifications')} className={`settings-nav-btn ${activeTab === 'notifications' ? 'active' : ''}`}>
                        <Bell size={20} /> Notifications
                    </button>
                    <button onClick={() => setActiveTab('security')} className={`settings-nav-btn ${activeTab === 'security' ? 'active' : ''}`}>
                        <Shield size={20} /> Security
                    </button>
                </aside>

                <div className="premium-card" style={{ padding: '40px' }}>
                    {activeTab === 'service' && (
                        <div className="slide-up">
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '900', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <MapPin size={24} color="var(--primary)" /> Service Radius & Location
                            </h3>

                            <div style={{ marginBottom: '40px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                    <span style={{ fontSize: '1rem', fontWeight: '800' }}>Search Radius</span>
                                    <span style={{ fontSize: '1.2rem', color: 'var(--primary)', fontWeight: '900' }}>{radius} km</span>
                                </div>
                                <input
                                    type="range"
                                    min="5"
                                    max="500"
                                    value={radius}
                                    onChange={(e) => setRadius(parseInt(e.target.value))}
                                    style={{ width: '100%', height: '8px', background: '#E2E8F0', borderRadius: '100px', appearance: 'none', cursor: 'pointer' }}
                                />
                                <p style={{ marginTop: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    Jobs within this radius will be visible on your dashboard.
                                </p>
                            </div>

                            <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '40px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                    <h4 style={{ fontSize: '0.9rem', fontWeight: '900', color: 'var(--text-muted)', margin: 0, textTransform: 'uppercase' }}>Workshop Location</h4>
                                    <button
                                        onClick={() => setIsPickingLocation(!isPickingLocation)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            background: isPickingLocation ? 'var(--primary-light)' : 'transparent',
                                            color: isPickingLocation ? 'var(--primary)' : 'var(--text-secondary)',
                                            border: `1px solid ${isPickingLocation ? 'var(--primary)' : '#E2E8F0'}`,
                                            padding: '8px 16px',
                                            borderRadius: '100px',
                                            fontSize: '0.85rem',
                                            fontWeight: '700',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <MapPin size={16} /> {isPickingLocation ? 'Close Map' : 'Pick on Map'}
                                    </button>
                                </div>

                                {isPickingLocation && (
                                    <div style={{ height: '300px', marginBottom: '24px', position: 'relative' }}>
                                        <MapComponent
                                            center={[
                                                parseFloat(manualLat) || (location?.lat || 51.505),
                                                parseFloat(manualLng) || (location?.lng || -0.09)
                                            ]}
                                            zoom={15}
                                            onMapClick={handleMapClick}
                                            markers={parseFloat(manualLat) && parseFloat(manualLng) ? [{
                                                position: [parseFloat(manualLat), parseFloat(manualLng)],
                                                type: 'mechanic',
                                                content: 'Workshop Location'
                                            }] : []}
                                        />
                                        <div style={{ position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.7)', color: 'white', padding: '10px 20px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: '600', pointerEvents: 'none', zIndex: 1000 }}>
                                            Click anywhere on the map to set location
                                        </div>
                                    </div>
                                )}

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-secondary)', marginBottom: '8px' }}>LATITUDE</label>
                                        <input
                                            value={manualLat}
                                            onChange={e => { setManualLat(e.target.value); setManualLocation(true); }}
                                            style={{ padding: '12px 20px', fontSize: '0.9rem' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-secondary)', marginBottom: '8px' }}>LONGITUDE</label>
                                        <input
                                            value={manualLng}
                                            onChange={e => { setManualLng(e.target.value); setManualLocation(true); }}
                                            style={{ padding: '12px 20px', fontSize: '0.9rem' }}
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={() => saveLocationPermanently(parseFloat(manualLat), parseFloat(manualLng))}
                                    className="btn btn-primary"
                                    style={{ width: '100%', padding: '16px', fontSize: '1rem' }}
                                >
                                    Update Location
                                </button>

                                <div style={{ marginTop: '24px', padding: '20px', background: 'var(--light-bg)', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)' }}>VERIFIED ADDRESS</span>
                                    <p style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--primary)', marginTop: '8px', lineHeight: '1.5' }}>{address}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <div className="slide-up">
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '900', marginBottom: '32px' }}>Professional Profile</h3>
                            <div style={{ display: 'flex', gap: '32px', marginBottom: '40px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
                                    <div style={{
                                        width: '120px',
                                        height: '120px',
                                        borderRadius: '30px',
                                        background: '#F1F5F9',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        overflow: 'hidden',
                                        border: '4px solid white',
                                        boxShadow: '0 12px 24px rgba(0,0,0,0.1)'
                                    }}>
                                        {mechanicInfo?.photoUrl ? (
                                            <img src={mechanicInfo.photoUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <span style={{ fontSize: '3rem' }}>👨‍🔧</span>
                                        )}
                                    </div>
                                    <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Profile Photo</span>
                                </div>

                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-secondary)', marginBottom: '8px' }}>FULL NAME</label>
                                            <input
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="Enter your full name"
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-secondary)', marginBottom: '8px' }}>PHONE NUMBER</label>
                                            <input
                                                value={formData.phone}
                                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                placeholder="Enter phone number"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-secondary)', marginBottom: '8px' }}>EMAIL ADDRESS</label>
                                        <input
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="Enter email address"
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-secondary)', marginBottom: '8px' }}>PROFILE IMAGE URL</label>
                                        <input
                                            value={formData.photoUrl}
                                            onChange={e => setFormData({ ...formData, photoUrl: e.target.value })}
                                            placeholder="https://example.com/photo.jpg"
                                        />
                                        <p style={{ marginTop: '8px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>Paste a direct link to your professional photo.</p>
                                    </div>

                                    <button
                                        onClick={handleProfileUpdate}
                                        disabled={isUpdating}
                                        className="btn btn-primary"
                                        style={{ width: '100%', marginTop: '12px', padding: '16px', fontSize: '1rem', background: 'var(--primary)' }}
                                    >
                                        {isUpdating ? 'Saving Changes...' : 'Save Profile Changes'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="slide-up">
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '900', marginBottom: '24px' }}>Notifications</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>Configuring real-time alerts for new jobs...</p>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="slide-up">
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '900', marginBottom: '24px' }}>Security</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>Account security and privacy settings...</p>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .settings-nav-btn {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 14px 20px;
                    border-radius: 12px;
                    border: none;
                    background: transparent;
                    color: var(--text-secondary);
                    font-weight: 700;
                    cursor: pointer;
                    transition: 0.3s;
                    text-align: left;
                    font-size: 0.95rem;
                }
                .settings-nav-btn:hover {
                    background: white;
                    color: var(--primary);
                }
                .settings-nav-btn.active {
                    background: var(--primary);
                    color: white;
                    box-shadow: 0 4px 12px var(--primary-glow);
                }
                input[type=range]::-webkit-slider-thumb {
                    appearance: none;
                    width: 20px;
                    height: 20px;
                    background: var(--primary);
                    border: 4px solid white;
                    border-radius: 50%;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                    cursor: pointer;
                    transition: 0.2s;
                }
                input[type=range]::-webkit-slider-thumb:hover {
                    transform: scale(1.1);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                }
            `}</style>
        </div>
    );
};

export default Settings;
