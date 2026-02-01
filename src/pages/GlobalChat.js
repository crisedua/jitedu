import React from 'react';

const GlobalChat = () => {
    // Voice Agent Only Mode - Center the widget is handled by CSS
    return (
        <div className="chat-welcome-view" style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            background: 'radial-gradient(circle at center, #F9FAFB 0%, #F3F4F6 100%)'
        }}>
            {/* Widget is positioned centered by index.css */}
        </div>
    );
};

export default GlobalChat;
