import React, { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';

// Lazy load the actual MapComponent only when Leaflet is ready
const MapComponentWrapper = (props) => {
    const [isLeafletReady, setIsLeafletReady] = useState(false);
    const [MapComponent, setMapComponent] = useState(null);

    useEffect(() => {
        // Check if Leaflet is loaded
        const checkLeaflet = () => {
            if (typeof window !== 'undefined' && window.L) {
                setIsLeafletReady(true);
                // Dynamically import the actual MapComponent
                import('./MapComponentCore').then(module => {
                    setMapComponent(() => module.default);
                }).catch(err => {
                    console.error('Failed to load MapComponent:', err);
                });
            } else {
                // Retry after a short delay
                setTimeout(checkLeaflet, 100);
            }
        };

        checkLeaflet();
    }, []);

    if (!isLeafletReady || !MapComponent) {
        return (
            <div style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#F1F5F9',
                borderRadius: '16px',
                color: '#64748B',
                flexDirection: 'column',
                padding: '20px',
                textAlign: 'center'
            }}>
                <MapPin size={48} color="#94A3B8" style={{ marginBottom: '12px', animation: 'pulse 2s infinite' }} />
                <div style={{ fontWeight: '700', marginBottom: '4px' }}>Loading Map...</div>
                <div style={{ fontSize: '0.85rem' }}>Please wait</div>
            </div>
        );
    }

    return <MapComponent {...props} />;
};

export default MapComponentWrapper;
