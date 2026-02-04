import React, { useState, useEffect, useRef } from 'react';
import { getSuggestedQuestions } from '../lib/supabase-simple';

const GlobalChat = () => {
    const [suggestedQuestions, setSuggestedQuestions] = useState([]);
    const [messages, setMessages] = useState([]);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const loadQuestions = async () => {
            const questions = await getSuggestedQuestions();
            setSuggestedQuestions(questions);
        };
        loadQuestions();

        // Listen for transcription messages from the ElevenLabs widget
        const handleMessage = (event) => {
            console.log('ElevenLabs message received:', event.detail);
            const { source, message } = event.detail;

            if (message && source) {
                setMessages(prev => [...prev, {
                    id: Date.now() + Math.random(),
                    text: message,
                    sender: source === 'user' ? 'user' : 'agent',
                    timestamp: new Date()
                }]);
            }
        };

        window.addEventListener('elevenlabs-convai:message', handleMessage);

        return () => {
            window.removeEventListener('elevenlabs-convai:message', handleMessage);
        };
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div className="chat-container-layout" style={{ display: 'flex', height: '100vh', width: '100%' }}>
            <div className="chat-welcome-view" style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                background: 'radial-gradient(circle at center, #F9FAFB 0%, #F3F4F6 100%)',
                position: 'relative'
            }}>
                {/* Admin Links */}
                <div style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    display: 'flex',
                    gap: '10px',
                    zIndex: 20
                }}>
                    <a href="/add" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 12px',
                        background: 'white',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        color: '#4B5563',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}>
                        <span>+</span> Agregar Contenido
                    </a>
                    <a href="/knowledge" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 12px',
                        background: 'white',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        color: '#4B5563',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}>
                        <span>⚡</span> Sync Knowledge
                    </a>
                </div>

                <div style={{
                    position: 'absolute',
                    bottom: '100px',
                    width: '100%',
                    maxWidth: '600px',
                    padding: '0 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '15px',
                    zIndex: 10
                }}>
                    <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                        <h3 style={{
                            color: '#374151',
                            fontSize: '1rem',
                            fontWeight: 600,
                            marginBottom: '4px'
                        }}>
                            ¿No sabes qué preguntar?
                        </h3>
                        <p style={{
                            color: '#6B7280',
                            fontSize: '0.875rem'
                        }}>
                            Prueba diciéndole a la IA:
                        </p>
                    </div>
                    <div className="suggested-questions" style={{ justifyContent: 'center' }}>
                        {suggestedQuestions.map(q => (
                            <button
                                key={q.id}
                                className="suggestion-btn"
                                style={{
                                    background: 'white',
                                    border: '1px solid #E5E7EB',
                                    borderRadius: '9999px',
                                    padding: '8px 16px',
                                    fontSize: '0.875rem',
                                    color: '#374151',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                    cursor: 'default'
                                }}
                            >
                                {q.question_text}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Transcription Sidebar */}
            <aside className="transcription-sidebar">
                <div className="transcription-header">
                    <h2>Transcripción en Tiempo Real</h2>
                    <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                        {messages.length} mensajes
                    </div>
                </div>
                <div className="transcription-messages">
                    {messages.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            marginTop: '40px',
                            color: '#9CA3AF',
                            fontSize: '0.875rem'
                        }}>
                            Inicia una llamada para ver la transcripción aquí
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <div key={msg.id} className={`transcription-message ${msg.sender}`}>
                                <span className="sender-name">
                                    {msg.sender === 'user' ? 'Tú' : 'IA'}
                                </span>
                                {msg.text}
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </aside>
        </div>
    );
};

export default GlobalChat;
