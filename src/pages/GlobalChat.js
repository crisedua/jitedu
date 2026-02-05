import React, { useState, useEffect, useRef } from 'react';
import { getSuggestedQuestions } from '../lib/supabase-simple';
import ExpertSelector from '../components/ExpertSelector';
import { chatWithExpert } from '../lib/expert-chat';
import { getRecentTranscripts } from '../lib/supabase-simple';
import { Send, Loader2 } from 'lucide-react';

const GlobalChat = () => {
    const [suggestedQuestions, setSuggestedQuestions] = useState([]);
    const [messages, setMessages] = useState([]);
    const [selectedExpert, setSelectedExpert] = useState(null);
    const [transcripts, setTranscripts] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const loadQuestions = async () => {
            const questions = await getSuggestedQuestions();
            setSuggestedQuestions(questions);
        };
        loadQuestions();

        const loadTranscripts = async () => {
            const data = await getRecentTranscripts(100);
            setTranscripts(data);
        };
        loadTranscripts();

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

    const handleExpertChange = (expert) => {
        setSelectedExpert(expert);
        console.log('Expert selected:', expert);
    };

    const handleSendMessage = async (e) => {
        e?.preventDefault();

        if (!inputValue.trim() || isSending || !selectedExpert) return;

        const question = inputValue.trim();
        setInputValue('');
        setIsSending(true);

        const userMessage = { 
            id: Date.now(), 
            text: question, 
            sender: 'user', 
            timestamp: new Date() 
        };
        setMessages(prev => [...prev, userMessage]);

        try {
            const response = await chatWithExpert(
                selectedExpert,
                transcripts,
                messages.map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text })),
                question
            );
            
            const aiMessage = { 
                id: Date.now() + 1, 
                text: response, 
                sender: 'agent', 
                timestamp: new Date() 
            };
            setMessages(prev => [...prev, aiMessage]);
        } catch (err) {
            console.error('Error sending message:', err);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: `❌ Error: ${err.message}`,
                sender: 'agent',
                timestamp: new Date(),
                isError: true
            }]);
        } finally {
            setIsSending(false);
            textareaRef.current?.focus();
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleQuickQuestion = (questionText) => {
        setInputValue(questionText);
        textareaRef.current?.focus();
    };

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
                    {/* Expert Selector */}
                    <ExpertSelector onExpertChange={handleExpertChange} />
                    
                    <a href="/add" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 16px',
                        background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                        border: 'none',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        color: 'white',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        boxShadow: '0 4px 6px rgba(59, 130, 246, 0.3)',
                        transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 12px rgba(59, 130, 246, 0.4)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 6px rgba(59, 130, 246, 0.3)';
                    }}>
                        <span style={{ fontSize: '1.2rem' }}>+</span> Agregar Contenido
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
                                onClick={() => handleQuickQuestion(q.question_text)}
                                style={{
                                    background: 'white',
                                    border: '1px solid #E5E7EB',
                                    borderRadius: '9999px',
                                    padding: '8px 16px',
                                    fontSize: '0.875rem',
                                    color: '#374151',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.background = '#F9FAFB';
                                    e.currentTarget.style.borderColor = selectedExpert?.color_theme || '#3B82F6';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.background = 'white';
                                    e.currentTarget.style.borderColor = '#E5E7EB';
                                }}
                            >
                                {q.question_text}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Chat Input */}
                {selectedExpert && (
                    <div style={{
                        position: 'absolute',
                        bottom: '20px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '90%',
                        maxWidth: '700px',
                        zIndex: 10
                    }}>
                        <div style={{
                            background: 'white',
                            borderRadius: '16px',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                            border: `2px solid ${selectedExpert.color_theme}`,
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                padding: '12px 16px',
                                background: `linear-gradient(135deg, ${selectedExpert.color_theme}15, ${selectedExpert.color_theme}05)`,
                                borderBottom: `1px solid ${selectedExpert.color_theme}30`,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <div style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    background: `linear-gradient(135deg, ${selectedExpert.color_theme}, ${selectedExpert.color_theme}dd)`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontSize: '10px',
                                    fontWeight: 600
                                }}>
                                    {selectedExpert.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <span style={{ fontSize: '0.875rem', color: '#6B7280', fontWeight: 500 }}>
                                    Pregúntale a {selectedExpert.name}
                                </span>
                            </div>
                            <form onSubmit={handleSendMessage} style={{ display: 'flex', alignItems: 'flex-end' }}>
                                <textarea
                                    ref={textareaRef}
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder={`Pregunta sobre ${selectedExpert.specialty.toLowerCase()}...`}
                                    disabled={isSending}
                                    rows={1}
                                    style={{
                                        flex: 1,
                                        padding: '16px',
                                        border: 'none',
                                        outline: 'none',
                                        fontSize: '0.9375rem',
                                        resize: 'none',
                                        maxHeight: '120px',
                                        fontFamily: 'inherit'
                                    }}
                                />
                                <button
                                    type="submit"
                                    disabled={isSending || !inputValue.trim()}
                                    style={{
                                        padding: '12px 16px',
                                        background: isSending || !inputValue.trim() ? '#E5E7EB' : selectedExpert.color_theme,
                                        color: 'white',
                                        border: 'none',
                                        cursor: isSending || !inputValue.trim() ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.2s',
                                        marginRight: '8px',
                                        marginBottom: '8px',
                                        borderRadius: '8px'
                                    }}
                                >
                                    {isSending ? <Loader2 size={20} className="spinning" /> : <Send size={20} />}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
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
