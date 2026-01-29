import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Send, Loader2, MessageSquare, Plus, FileText } from 'lucide-react';
import { chatWithAllTranscripts } from '../lib/openrouter';
import { getRecentTranscripts } from '../lib/supabase-simple';

const GlobalChat = () => {
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);

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

    // Generate dynamic suggestions based on transcripts
    const quickSuggestions = useMemo(() => {
        if (transcripts.length === 0) return [];

        const suggestions = [];

        // Add suggestions based on transcript titles
        transcripts.slice(0, 3).forEach(t => {
            if (t.title) {
                suggestions.push({
                    icon: FileText,
                    text: `¿Qué puedo aprender de "${t.title}"?`,
                    color: '#3B82F6'
                });
            }
        });

        // Add a general comparison question if there are multiple transcripts
        if (transcripts.length > 1) {
            suggestions.push({
                icon: MessageSquare,
                text: `Compara las técnicas en los ${transcripts.length} transcripts`,
                color: '#10B981'
            });
        }

        // Add general marketing questions
        const generalQuestions = [
            { text: '¿Cuáles son los hooks más efectivos?', color: '#F59E0B' },
            { text: '¿Qué técnicas de persuasión se usan?', color: '#EC4899' },
            { text: '¿Cómo manejan las objeciones?', color: '#8B5CF6' },
            { text: '¿Qué CTAs funcionan mejor?', color: '#EF4444' },
        ];

        // Fill remaining slots with general questions
        const remaining = 4 - suggestions.length;
        generalQuestions.slice(0, remaining).forEach(q => {
            suggestions.push({
                icon: MessageSquare,
                text: q.text,
                color: q.color
            });
        });

        return suggestions.slice(0, 4);
    }, [transcripts]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [inputValue]);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e?.preventDefault();

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
            textareaRef.current?.focus();
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleQuickAction = (text) => {
        setInputValue(text);
        textareaRef.current?.focus();
    };

    const transcriptCount = transcripts.length;
    const hasTranscripts = transcriptCount > 0;

    // Show conversation view when there are messages
    if (messages.length > 0) {
        return (
            <div className="chat-conversation-view">
                <div className="conversation-messages">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`conversation-message ${msg.role}`}>
                            <div className="message-avatar">
                                {msg.role === 'user' ? '👤' : '🤖'}
                            </div>
                            <div className="message-body">
                                <div className="message-sender">
                                    {msg.role === 'user' ? 'Tú' : 'Asistente'}
                                </div>
                                <div className="message-text">{msg.content}</div>
                            </div>
                        </div>
                    ))}

                    {isSending && (
                        <div className="conversation-message assistant">
                            <div className="message-avatar">🤖</div>
                            <div className="message-body">
                                <div className="message-sender">Asistente</div>
                                <div className="message-text typing-indicator">
                                    <Loader2 size={16} className="spinning" />
                                    Buscando en {transcriptCount} transcripts...
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Fixed input at bottom during conversation */}
                <div className="conversation-input-wrapper">
                    <form className="conversation-input-form" onSubmit={handleSendMessage}>
                        <textarea
                            ref={textareaRef}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Escribe tu mensaje..."
                            disabled={isSending}
                            rows={1}
                        />
                        <button type="submit" disabled={isSending || !inputValue.trim()}>
                            {isSending ? <Loader2 size={20} className="spinning" /> : <Send size={20} />}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // Welcome screen with input at top
    return (
        <div className="chat-welcome-view">
            {isLoading ? (
                <div className="welcome-loading">
                    <Loader2 size={40} className="spinning" />
                    <p>Cargando base de conocimiento...</p>
                </div>
            ) : !hasTranscripts ? (
                <div className="welcome-empty">
                    <h2>Sin transcripts aún</h2>
                    <p>Agrega transcripts para comenzar a hacer preguntas</p>
                    <Link to="/add" className="add-transcript-btn">
                        <Plus size={20} />
                        Agregar Transcript
                    </Link>
                </div>
            ) : (
                <div className="welcome-content">
                    {/* Large Input Area */}
                    <div className="welcome-input-container">
                        <textarea
                            ref={textareaRef}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Quiero comenzar con..."
                            rows={3}
                        />
                        <button
                            className="welcome-send-btn"
                            onClick={handleSendMessage}
                            disabled={isSending || !inputValue.trim()}
                        >
                            <Send size={20} />
                        </button>
                    </div>

                    {/* Quick Actions - Based on transcripts */}
                    <div className="quick-actions">
                        {quickSuggestions.map((action, index) => {
                            const Icon = action.icon;
                            return (
                                <button
                                    key={index}
                                    className="quick-action-btn"
                                    onClick={() => handleQuickAction(action.text)}
                                >
                                    <Icon size={18} style={{ color: action.color }} />
                                    <span>{action.text}</span>
                                </button>
                            );
                        })}
                    </div>

                    <p className="transcript-count">
                        {transcriptCount} transcript{transcriptCount !== 1 ? 's' : ''} en tu base de conocimiento
                    </p>
                </div>
            )}
        </div>
    );
};

export default GlobalChat;
