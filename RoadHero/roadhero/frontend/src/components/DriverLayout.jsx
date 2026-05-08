import React from 'react';
import { Outlet } from 'react-router-dom';
import DriverNavbar from './DriverNavbar';
import { DriverProvider, useDriver } from '../context/DriverContext';

const DriverLayoutContent = () => {
    const { toasts } = useDriver();

    return (
        <div style={{ minHeight: '100vh', background: 'var(--light-bg)', color: 'var(--text-primary)' }}>
            <DriverNavbar />
            <main className="container" style={{ paddingTop: '32px', paddingBottom: '60px' }}>
                <Outlet />
            </main>
            <div className="toast-container">
                {toasts.map(t => (
                    <div key={t.id} className={`toast ${t.type}`} style={{ background: t.type === 'success' ? '#10B981' : '#EF4444', color: 'white' }}>
                        {t.message}
                    </div>
                ))}
            </div>
        </div>
    );
};

const DriverLayout = () => {
    return (
        <DriverProvider>
            <DriverLayoutContent />
        </DriverProvider>
    );
};

export default DriverLayout;
