import React from 'react';

const EmptyState = ({ icon, title, description, action = null }) => {
    return (
        <div style={{
            padding: '80px 40px',
            textAlign: 'center',
            background: 'var(--glass-bg)',
            borderRadius: '32px',
            border: '2px dashed var(--glass-border)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            marginTop: '20px'
        }} className="fade-in">
            <div style={{
                fontSize: '4rem',
                marginBottom: '8px',
                filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.1))'
            }}>
                {icon}
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '900' }}>{title}</h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', lineHeight: 1.6, fontWeight: '500' }}>
                {description}
            </p>
            {action && (
                <div style={{ marginTop: '24px' }}>
                    {action}
                </div>
            )}
        </div>
    );
};

export default EmptyState;
