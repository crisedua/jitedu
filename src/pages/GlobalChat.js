import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Send, Loader2, MessageSquare, Plus, Sparkles } from 'lucide-react';
import { chatWithAllTranscripts } from '../lib/openrouter';
import { getRecentTranscripts } from '../lib/supabase-simple';

const GlobalChat = () => {
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const [transcripts, setTranscripts] = useState([]);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);

    // Load all transcripts on mount
    useEffect(() => {
        const loadTranscripts = async () => {
            try {
                const data = await getRecentTranscripts(100);
                setTranscripts(data);
            } catch (err) {
                console.error('Error loading transcripts:', err);
            } finally {
                setIsLoading(false);
            }
        };
        loadTranscripts();
    }, []);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (!inputValue.trim() || isSending) return;

        const question = inputValue.trim();
        setInputValue('');
        setIsSending(true);

        const userMessage = { role: 'user', content: question, id: Date.now() };
        setMessages(prev => [...prev, userMessage]);

        try {
            const response = await chatWithAllTranscripts(transcripts, messages, question);
            const aiMessage = { role: 'assistant', content: response, id: Date.now() + 1 };
            setMessages(prev => [...prev, aiMessage]);
        } catch (err) {
            console.error('Error sending message:', err);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `❌ Error: ${err.message}`,
                id: Date.now() + 1,
                isError: true
            }]);
        } finally {
            setIsSending(false);
            inputRef.current?.focus();
        }
    };

    const transcriptCount = transcripts.length;
    const hasTranscripts = transcriptCount > 0;

    // ChatGPT-style interface
    return (
        <div className="chatgpt-container">
            {/* Main Chat Area */}
            <div className="chatgpt-main">
                {/* Messages Area */}
                <div className="chatgpt-messages">
                    {isLoading ? (
                        <div className="chatgpt-welcome">
                            <Loader2 size={40} className="spinning" />
                            <p>Cargando base de conocimiento...</p>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="chatgpt-welcome">
                            <div className="welcome-icon">
                                <Sparkles size={48} />
                            </div>
                            <h1>Asistente de Marketing</h1>
                            <p className="welcome-subtitle">
                                {hasTranscripts
                                    ? `Pregunta lo que quieras. Buscaré en ${transcriptCount} transcripts.`
                                    : 'Agrega transcripts para comenzar'}
                            </p>

                            {hasTranscripts ? (
                                <div className="welcome-suggestions">
                                    <button onClick={() => setInputValue('¿Cuáles son las técnicas de persuasión más usadas?')}>
                                        <MessageSquare size={16} />
                                        Técnicas de persuasión
                                    </button>
                                    <button onClick={() => setInputValue('¿Cómo crear urgencia efectiva en ventas?')}>
                                        <MessageSquare size={16} />
                                        Crear urgencia
                                    </button>
                                    <button onClick={() => setInputValue('Dame ejemplos de CTAs poderosos')}>
                                        <MessageSquare size={16} />
                                        CTAs poderosos
                                    </button>
                                    <button onClick={() => setInputValue('¿Qué técnicas de credibilidad se usan?')}>
                                        <MessageSquare size={16} />
                                        Técnicas de credibilidad
                                    </button>
                                </div>
                            ) : (
                                <Link to="/add" className="welcome-add-btn">
                                    <Plus size={20} />
                                    Agregar primer transcript
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="chatgpt-conversation">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`chatgpt-message ${msg.role}`}>
                                    <div className="message-avatar">
                                        {msg.role === 'user' ? '👤' : '🤖'}
                                    </div>
                                    <div className="message-content">
                                        <div className="message-role">
                                            {msg.role === 'user' ? 'Tú' : 'Asistente'}
                                        </div>
                                        <div className="message-text">{msg.content}</div>
                                    </div>
                                </div>
                            ))}

                            {isSending && (
                                <div className="chatgpt-message assistant">
                                    <div className="message-avatar">🤖</div>
                                    <div className="message-content">
                                        <div className="message-role">Asistente</div>
                                        <div className="message-text typing">
                                            <Loader2 size={16} className="spinning" />
                                            Buscando en {transcriptCount} transcripts...
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                {/* Input Area - Always at bottom */}
                <div className="chatgpt-input-area">
                    <form className="chatgpt-input-form" onSubmit={handleSendMessage}>
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder={hasTranscripts ? "Pregunta sobre marketing..." : "Agrega transcripts para comenzar..."}
                            disabled={isSending || !hasTranscripts}
                        />
                        <button type="submit" disabled={isSending || !inputValue.trim() || !hasTranscripts}>
                            {isSending ? <Loader2 size={20} className="spinning" /> : <Send size={20} />}
                        </button>
                    </form>
                    <p className="input-hint">
                        {hasTranscripts
                            ? `Base de conocimiento: ${transcriptCount} transcript${transcriptCount !== 1 ? 's' : ''}`
                            : ''}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default GlobalChat;
