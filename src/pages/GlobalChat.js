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
                <h3 style={{
                    color: '#6B7280',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    marginBottom: '10px'
                }}>
                    Sugerencias de preguntas:
                </h3>
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
                                cursor: 'default' // Since this is voice, maybe they can't "click" to fill input? Or maybe they just read it?
                                // If clicking should do something, tell me. For now, just display.
                            }}
                        >
                            {q.question_text}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default GlobalChat;
