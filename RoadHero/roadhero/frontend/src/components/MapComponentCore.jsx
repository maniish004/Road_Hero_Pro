import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';

// Use global L from CDN - wait for it to load
const getL = () => {
    if (typeof window !== 'undefined' && window.L) {
        return window.L;
    }
    console.warn('Leaflet not loaded yet');
    return null;
};

// Fix for default marker icon in React Leaflet
if (typeof window !== 'undefined' && window.L) {
    const L = window.L;
    if (L.Icon && L.Icon.Default && L.Icon.Default.prototype._getIconUrl) {
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });
    }
}

function ChangeView({ center, zoom }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);
    return null;
}

function LocationPicker({ onLocationPicked }) {
    useMapEvents({
        click(e) {
            onLocationPicked([e.latlng.lat, e.latlng.lng]);
        },
    });
    return null;
}

function RoutingMachine({ start, end }) {
    const map = useMap();

    useEffect(() => {
        if (!map || !start || !end) return;

        const L = getL();
        if (!L) {
            console.warn("Leaflet not available for routing");
            return;
        }

        // Ensure coordinates are numbers
        const startLat = parseFloat(start[0]);
        const startLng = parseFloat(start[1]);
        const endLat = parseFloat(end[0]);
        const endLng = parseFloat(end[1]);

        if (isNaN(startLat) || isNaN(startLng) || isNaN(endLat) || isNaN(endLng)) {
            console.error("Invalid coordinates for routing", { start, end });
            return;
        }

        if (!L.Routing) {
            console.warn("Leaflet Routing Machine not loaded");
            return;
        }

        let routingControl;
        try {
            routingControl = L.Routing.control({
                waypoints: [
                    L.latLng(startLat, startLng),
                    L.latLng(endLat, endLng)
                ],
                routeWhileDragging: false,
                addWaypoints: false,
                draggableWaypoints: false,
                fitSelectedRoutes: true,
                showAlternatives: false,
                lineOptions: {
                    styles: [{ color: '#6366F1', weight: 8, opacity: 0.9 }]
                },
                createMarker: () => null,
                show: false
            }).addTo(map);
        } catch (err) {
            console.error("Failed to create routing control:", err);
        }

        return () => {
            if (map && routingControl) {
                try {
                    map.removeControl(routingControl);
                } catch (e) {
                    console.error("Error removing routing control:", e);
                }
            }
        };
    }, [map, start ? start[0] : null, start ? start[1] : null, end ? end[0] : null, end ? end[1] : null]);

    return null;
}

const createCustomIcon = (type) => {
    const L = getL();
    if (!L) return null;

    let color = '#4F46E5'; // Default blue
    if (type === 'pending') color = '#F59E0B'; // Amber
    if (type === 'active') color = '#10B981'; // Green
    if (type === 'mechanic') color = '#6366F1'; // Indigo

    return L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
                <div style="width: 8px; height: 8px; background: white; border-radius: 50%; transform: rotate(45deg);"></div>
               </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    });
};

const MapComponent = ({ center, markers = [], zoom = 13, showRoute = false, routeStart = null, routeEnd = null, onMapClick = null }) => {
    // Safety guard for center
    const safeCenter = Array.isArray(center) && center.length === 2 && !isNaN(center[0]) && !isNaN(center[1])
        ? center
        : [40.7128, -74.0060]; // Default to NYC

    // Validate markers
    const safeMarkers = markers.filter(m =>
        m &&
        Array.isArray(m.position) &&
        m.position.length === 2 &&
        !isNaN(m.position[0]) &&
        !isNaN(m.position[1])
    );

    // Check if Leaflet is available
    const L = getL();
    const isLeafletReady = !!L;

    try {
        return (
            <MapContainer
                center={safeCenter}
                zoom={zoom}
                style={{ height: '100%', width: '100%', borderRadius: '16px' }}
                key={`${safeCenter[0]}-${safeCenter[1]}`}
            >
                <ChangeView center={safeCenter} zoom={zoom} />
                {onMapClick && <LocationPicker onLocationPicked={onMapClick} />}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {isLeafletReady && safeMarkers.map((marker, idx) => {
                    const icon = createCustomIcon(marker.type);
                    if (!icon) return null;
                    return (
                        <Marker key={idx} position={marker.position} icon={icon}>
                            <Popup>
                                <div style={{ padding: '4px' }}>
                                    {marker.content}
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
                {isLeafletReady && showRoute && routeStart && routeEnd && (
                    <RoutingMachine start={routeStart} end={routeEnd} />
                )}
            </MapContainer>
        );
    } catch (error) {
        console.error("MapComponent render error:", error);
        return <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F1F5F9', borderRadius: '16px', color: '#64748B', flexDirection: 'column', padding: '20px', textAlign: 'center' }}>
            <MapPin size={48} color="#94A3B8" style={{ marginBottom: '12px' }} />
            <div style={{ fontWeight: '700', marginBottom: '4px' }}>Map Unavailable</div>
            <div style={{ fontSize: '0.85rem' }}>Unable to load map. Please refresh the page.</div>
        </div>;
    }
};

export default MapComponent;
