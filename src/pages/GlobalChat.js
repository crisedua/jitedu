import React from 'react';

const GlobalChat = () => {
    // Voice Agent Only Mode
    return (
        <div className="chat-welcome-view" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.7 }}>
            {/* Minimal centered content - mostly empty to let the Voice Widget shine */}
            <div className="welcome-content" style={{ textAlign: 'center' }}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 24px auto',
                    boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.5)'
                }}>
                    <div style={{ fontSize: '32px' }}>🎙️</div>
                </div>
                <h2 style={{ fontSize: '1.5rem', color: '#1F2937', marginBottom: '8px' }}>Voice Agent Active</h2>
                <p style={{ color: '#6B7280' }}>Click the widget in the bottom right to start talking.</p>
            </div>
        </div>
    );
};

export default GlobalChat;
