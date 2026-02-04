import React, { useState, useEffect } from 'react';
import { getSuggestedQuestions } from '../lib/supabase-simple';

const GlobalChat = () => {
    const [suggestedQuestions, setSuggestedQuestions] = useState([]);

    useEffect(() => {
        const loadQuestions = async () => {
            const questions = await getSuggestedQuestions();
            setSuggestedQuestions(questions);
        };
        loadQuestions();
    }, []);

    // Voice Agent Only Mode - Center the widget is handled by CSS
    return (
        <div className="chat-welcome-view" style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            background: 'radial-gradient(circle at center, #F9FAFB 0%, #F3F4F6 100%)',
            position: 'relative'
        }}>
            {/* Widget is positioned centered by index.css, we'll put suggestions around it */}

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
        </div>
    );
};

export default GlobalChat;
