import React, { useState, useContext } from 'react';
import { Car, Plus, X, ShieldCheck, Info } from 'lucide-react';
import { useDriver } from '../../context/DriverContext';
import AuthContext from '../../context/AuthContext';
import api from '../../api';

const Garage = () => {
    const { user, updateUser } = useContext(AuthContext);
    const { vehicles, setVehicles, addToast, loading, setLoading } = useDriver();
    const [showAddForm, setShowAddForm] = useState(false);
    const [newVehicle, setNewVehicle] = useState({ make: '', model: '', color: '', licensePlate: '' });

    // Re-writing the addVehicle to be more robust
    const handleAddVehicle = async (e) => {
        e.preventDefault();
        if (!user?._id) return addToast('User session error', 'error');

        setLoading(true);
        try {
            const res = await api.post(`/auth/driver/${user._id}/vehicles`, newVehicle);
            if (res.data.success) {
                setVehicles(res.data.data);
                updateUser({ vehicles: res.data.data });
                setNewVehicle({ make: '', model: '', color: '', licensePlate: '' });
                addToast('Vehicle added to your garage!');
                setShowAddForm(false);
            }
        } catch (err) {
            addToast('Failed to add vehicle', 'error');
        } finally {
            setLoading(false);
        }
    };

    const removeVehicle = async (vehicleId) => {
        if (!user?._id) return;
        setLoading(true);
        try {
            const res = await api.delete(`/auth/driver/${user._id}/vehicles/${vehicleId}`);
            if (res.data.success) {
                setVehicles(res.data.data);
                updateUser({ vehicles: res.data.data });
                addToast('Vehicle removed');
            }
        } catch (err) {
            addToast('Failed to remove vehicle', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="slide-up">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-1.5px', marginBottom: '8px' }}>
                        Your <span style={{ color: 'var(--primary)' }}>Garage</span>
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Manage your fleet for faster help requests.</p>
                </div>
                {!showAddForm && (
                    <button onClick={() => setShowAddForm(true)} className="btn btn-primary" style={{ padding: '16px 32px', borderRadius: '100px' }}>
                        <Plus size={20} /> Add Vehicle
                    </button>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
                {showAddForm && (
                    <div className="premium-card slide-up" style={{ padding: '32px', border: '2px dashed var(--primary)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ fontWeight: '900' }}>New Vehicle</h3>
                            <button onClick={() => setShowAddForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleAddVehicle} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <input value={newVehicle.make} onChange={e => setNewVehicle({ ...newVehicle, make: e.target.value })} placeholder="Make (e.g. BMW)" required />
                                <input value={newVehicle.model} onChange={e => setNewVehicle({ ...newVehicle, model: e.target.value })} placeholder="Model (e.g. X5)" required />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <input value={newVehicle.licensePlate} onChange={e => setNewVehicle({ ...newVehicle, licensePlate: e.target.value })} placeholder="Plate #" required />
                                <input value={newVehicle.color} onChange={e => setNewVehicle({ ...newVehicle, color: e.target.value })} placeholder="Color" required />
                            </div>
                            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
                                {loading ? 'Saving...' : 'Save to Garage'}
                            </button>
                        </form>
                    </div>
                )}

                {vehicles.map(v => (
                    <div key={v._id} className="premium-card" style={{ padding: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ width: '64px', height: '64px', background: 'var(--light-bg)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', marginBottom: '24px' }}>
                                <Car size={32} />
                            </div>
                            <button onClick={() => removeVehicle(v._id)} className="btn-icon" style={{ borderColor: 'transparent' }}>
                                <X size={18} color="#EF4444" />
                            </button>
                        </div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '900', marginBottom: '8px' }}>{v.make} {v.model}</h3>
                        <div style={{ display: 'flex', gap: '20px', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '12px', height: '12px', borderRadius: '50%', background: v.color.toLowerCase() }}></div> {v.color}</span>
                            <span style={{ fontWeight: '700' }}>{v.licensePlate}</span>
                        </div>
                        <div style={{ pt: '24px', borderTop: '1px solid #F1F5F9', marginTop: '24px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--secondary)', fontSize: '0.85rem', fontWeight: '800' }}>
                            <ShieldCheck size={16} /> Verified for RoadHero Service
                        </div>
                    </div>
                ))}

                {vehicles.length === 0 && !showAddForm && (
                    <div className="premium-card" style={{ gridColumn: '1 / -1', padding: '60px', textAlign: 'center', border: '2px dashed var(--glass-border)', background: 'transparent' }}>
                        <Info size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px', display: 'block' }} />
                        <h3 style={{ fontWeight: '700' }}>Your garage is empty</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Add your vehicles here to quickly select them when you need help.</p>
                        <button onClick={() => setShowAddForm(true)} className="btn btn-secondary">Add Your First Vehicle</button>
                    </div>
                )}
            </div>
            <style>{`
                 .btn-icon {
                    width: 36px;
                    height: 36px;
                    border-radius: 10px;
                    border: 1px solid var(--glass-border);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: 0.2s;
                    background: white;
                }
                .btn-icon:hover {
                    background: #FEF2F2;
                }
            `}</style>
        </div>
    );
};

export default Garage;
