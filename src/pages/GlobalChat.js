import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    Send, Loader2, MessageSquare, Plus, Database, Trash2
} from 'lucide-react';
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
                const data = await getRecentTranscripts(100); // Get up to 100 transcripts
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

        // Add user message to UI immediately
        const userMessage = { role: 'user', content: question, id: Date.now() };
        setMessages(prev => [...prev, userMessage]);

        try {
            // Get AI response searching all transcripts
            const response = await chatWithAllTranscripts(transcripts, messages, question);

            // Add AI message to UI
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

    const clearChat = () => {
        setMessages([]);
    };

    const transcriptCount = transcripts.length;
    const hasTranscripts = transcriptCount > 0;

    return (
        <div className="global-chat-page">
            {/* Sidebar */}
            <aside className="chat-sidebar">
                <Link to="/add" className="new-analysis-btn">
                    <Plus size={18} />
                    Agregar Transcript
                </Link>

                <div className="sidebar-info">
                    <div className="info-card">
                        <Database size={20} />
                        <div>
                            <strong>{transcriptCount}</strong>
                            <span>transcripts en la base</span>
                        </div>
                    </div>
                </div>

                {messages.length > 0 && (
                    <button className="clear-chat-btn" onClick={clearChat}>
                        <Trash2 size={16} />
                        Limpiar Chat
                    </button>
                )}

                <div className="sidebar-help">
                    <h4>💡 Ejemplos de preguntas:</h4>
                    <ul>
                        <li>"¿Qué técnicas de urgencia se usan?"</li>
                        <li>"¿Cómo manejan las objeciones?"</li>
                        <li>"Dame ejemplos de hooks efectivos"</li>
                        <li>"¿Qué patrones de storytelling hay?"</li>
                    </ul>
                </div>
            </aside>

            {/* Main Chat Area */}
            <main className="chat-main">
                {/* Header */}
                <header className="chat-header">
                    <div className="chat-header-info">
                        <h1>🤖 Asistente de Marketing</h1>
                        <span className="chat-meta">
                            Pregunta lo que quieras sobre tus transcripts
                        </span>
                    </div>
                </header>

                {/* Messages */}
                <div className="chat-messages">
                    {isLoading ? (
                        <div className="chat-loading-inline">
                            <Loader2 size={24} className="spinning" />
                            <span>Cargando transcripts...</span>
                        </div>
                    ) : !hasTranscripts ? (
                        <div className="chat-empty">
                            <Database size={48} />
                            <h3>No hay transcripts aún</h3>
                            <p>Agrega transcripts a tu base de conocimiento para poder hacer preguntas sobre ellos.</p>
                            <Link to="/add" className="add-first-btn">
                                <Plus size={18} />
                                Agregar primer transcript
                            </Link>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="chat-empty">
                            <MessageSquare size={48} />
                            <h3>¿Qué quieres saber?</h3>
                            <p>
                                Tienes <strong>{transcriptCount} transcripts</strong> en tu base de conocimiento.
                                Pregúntame lo que quieras y buscaré en todos ellos.
                            </p>
                            <div className="suggested-questions">
                                <button onClick={() => setInputValue('¿Cuáles son las técnicas de persuasión más usadas?')}>
                                    Técnicas de persuasión más usadas
                                </button>
                                <button onClick={() => setInputValue('¿Cómo crear urgencia efectiva?')}>
                                    Cómo crear urgencia efectiva
                                </button>
                                <button onClick={() => setInputValue('Dame ejemplos de CTAs poderosos')}>
                                    Ejemplos de CTAs poderosos
                                </button>
                                <button onClick={() => setInputValue('¿Qué técnicas de credibilidad se usan?')}>
                                    Técnicas de credibilidad
                                </button>
                            </div>
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`chat-message ${msg.role} ${msg.isError ? 'error' : ''}`}
                            >
                                <div className="message-content">
                                    {msg.content}
                                </div>
                            </div>
                        ))
                    )}

                    {isSending && (
                        <div className="chat-message assistant loading">
                            <Loader2 size={20} className="spinning" />
                            <span>Buscando en {transcriptCount} transcripts...</span>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form className="chat-input-form" onSubmit={handleSendMessage}>
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder={hasTranscripts ? "Pregunta algo sobre tus transcripts..." : "Agrega transcripts primero..."}
                        disabled={isSending || !hasTranscripts}
                    />
                    <button type="submit" disabled={isSending || !inputValue.trim() || !hasTranscripts}>
                        {isSending ? <Loader2 size={20} className="spinning" /> : <Send size={20} />}
                    </button>
                </form>
            </main>
        </div>
    );
};

export default GlobalChat;
