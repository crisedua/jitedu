import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Send, Loader2, MessageSquare, Plus } from 'lucide-react';
import { chatWithAllTranscripts, analyzeTranscriptWithAI } from '../lib/openrouter';
import { getRecentTranscripts, updateTranscriptFields, deleteTranscript } from '../lib/supabase-simple';
import { useAuth } from '../context/AuthContext';

const GlobalChat = () => {
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);
    const navigate = useNavigate();
    const { user } = useAuth();

    const [transcripts, setTranscripts] = useState([]);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [showTranscriptList, setShowTranscriptList] = useState(false);

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

    const handleDeleteTranscript = async (id, e) => {
        e.stopPropagation();
        if (window.confirm('¿Estás seguro de que quieres eliminar este transcript?')) {
            await deleteTranscript(id);
            setTranscripts(prev => prev.filter(t => t.id !== id));
        }
    };

    // Check for un-analyzed transcripts
    const pendingTranscripts = useMemo(() => {
        return transcripts.filter(t => !t.ai_analysis);
    }, [transcripts]);

    const [isAnalyzingPending, setIsAnalyzingPending] = useState(false);
    const [analysisProgress, setAnalysisProgress] = useState({ current: 0, total: 0 });

    const handleAnalyzePending = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        if (pendingTranscripts.length === 0) return;

        setIsAnalyzingPending(true);
        setAnalysisProgress({ current: 0, total: pendingTranscripts.length });

        try {
            for (let i = 0; i < pendingTranscripts.length; i++) {
                const t = pendingTranscripts[i];
                setAnalysisProgress({ current: i + 1, total: pendingTranscripts.length });

                // Analyze
                const analysis = await analyzeTranscriptWithAI(t.transcript_text, { title: t.title });

                // Save
                const updates = {
                    ai_analysis: analysis,
                    status: 'completed'
                };

                // Update title if we have a suggestion and current is generic
                if (analysis.suggestedTitle && (!t.title || t.title === 'Sin título' || t.title.startsWith('Transcript '))) {
                    updates.title = analysis.suggestedTitle;
                }

                await updateTranscriptFields(t.id, updates);

                // Update local state to reflect change immediately
                setTranscripts(prev => prev.map(pt =>
                    pt.id === t.id ? {
                        ...pt,
                        ai_analysis: analysis,
                        title: updates.title || pt.title
                    } : pt
                ));
            }
        } catch (err) {
            console.error('Error analyzing pending:', err);
            alert(`Error: ${err.message}. \n\nRevisa que la API Key esté configurada en Vercel.`);
        } finally {
            setIsAnalyzingPending(false);
        }
    };

    // Generate dynamic suggestions based on transcripts
    const quickSuggestions = useMemo(() => {
        if (transcripts.length === 0) return [];

        const suggestions = [];

        // 1. Add comparison if we have multiple transcripts
        if (transcripts.length > 1) {
            suggestions.push({
                icon: MessageSquare,
                text: `Compara las estrategias de persuasión entre los videos`,
                color: '#10B981'
            });
        }

        // 2. Add general questions
        const generalQuestions = [
            { text: '¿Cuáles son los puntos clave de este conocimiento?', color: '#8B5CF6' },
            { text: 'Resume las ideas principales de los contenidos', color: '#EF4444' },
            { text: 'Extrae una lista de acciones recomendadas', color: '#EC4899' },
            { text: '¿Qué conceptos fundamentales se explican aquí?', color: '#F59E0B' },
            { text: 'Identifica las mejores prácticas mencionadas', color: '#3B82F6' },
            { text: 'Encuentra patrones comunes entre los documentos', color: '#10B981' },
            { text: 'Analiza la estructura de la información presentada', color: '#F59E0B' },
            { text: 'Detectar elementos de autoridad y credibilidad', color: '#8B5CF6' }
        ];

        // Shuffle the questions to provide variety
        const shuffledQuestions = [...generalQuestions].sort(() => Math.random() - 0.5);

        // Add questions to fill up to 4 suggestions
        for (let i = 0; i < Math.min(4, shuffledQuestions.length); i++) {
            if (suggestions.length < 4) {
                suggestions.push({
                    icon: MessageSquare,
                    text: shuffledQuestions[i].text,
                    color: shuffledQuestions[i].color
                });
            }
        }

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

        // Must be logged in to send
        if (!user) {
            if (window.confirm('Debes iniciar sesión para chatear. ¿Ir al login?')) {
                navigate('/login');
            }
            return;
        }

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
        if (!user) {
            if (window.confirm('Debes iniciar sesión para usar esta acción. ¿Ir al login?')) {
                navigate('/login');
            }
            return;
        }
        setInputValue(text);
        textareaRef.current?.focus();
    };

    const transcriptCount = transcripts.length;
    const hasTranscripts = transcriptCount > 0;

    // Function to remove markdown formatting
    const stripMarkdown = (text) => {
        if (!text) return text;
        return text
            .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold **text**
            .replace(/\*(.*?)\*/g, '$1')     // Remove italic *text*
            .replace(/`(.*?)`/g, '$1')       // Remove code `text`
            .replace(/#{1,6}\s/g, '')        // Remove headers # ## ###
            .replace(/\[(.*?)\]\(.*?\)/g, '$1'); // Remove links [text](url)
    };

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
                                <div className="message-text">{stripMarkdown(msg.content)}</div>
                            </div>
                        </div>
                    ))}

                    {isSending && (
                        <div className="conversation-message assistant">
                            <div className="message-avatar">🤖</div>
                            <div className="message-body">
                                <div className="message-text typing-indicator">
                                    <Loader2 size={16} className="spinning" />
                                    Analizando contenido...
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
                            placeholder={user ? "Quiero comenzar con..." : "Inicia sesión para preguntar..."}
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

                    {/* Pending Analysis Banner */}
                    {pendingTranscripts.length > 0 && (
                        <div className="pending-analysis-banner" style={{
                            background: 'rgba(245, 158, 11, 0.1)',
                            border: '1px solid rgba(245, 158, 11, 0.3)',
                            borderRadius: '12px',
                            padding: '16px',
                            margin: '24px 0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            color: '#D97706'
                        }}>
                            <div className="banner-text">
                                <strong>⚠️ Inteligencia Incompleta</strong>
                                <p style={{ fontSize: '0.9rem', margin: '4px 0 0 0', opacity: 0.9 }}>
                                    Hay {pendingTranscripts.length} transcripts sin analizar.
                                    {isAnalyzingPending ? ` Procesando ${analysisProgress.current}/${analysisProgress.total}...` : ' Procesa ahora para mejorar el chat.'}
                                </p>
                            </div>
                            <button
                                onClick={handleAnalyzePending}
                                disabled={isAnalyzingPending}
                                style={{
                                    background: '#D97706',
                                    color: 'white',
                                    border: 'none',
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    cursor: isAnalyzingPending ? 'wait' : 'pointer',
                                    opacity: isAnalyzingPending ? 0.7 : 1,
                                    fontWeight: 500
                                }}
                            >
                                {isAnalyzingPending ? (<Loader2 size={16} className="spinning" />) : '⚡ Analizar Todo'}
                            </button>
                        </div>
                    )}

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

                    <div className="transcript-management" style={{ textAlign: 'center', marginTop: '20px' }}>
                        <button
                            onClick={() => setShowTranscriptList(!showTranscriptList)}
                            style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.85rem' }}
                        >
                            {showTranscriptList ? 'Ocultar Transcripts' : 'Gestionar Transcripts'}
                        </button>

                        {showTranscriptList && (
                            <div className="transcript-list" style={{ marginTop: '10px', maxHeight: '200px', overflowY: 'auto', textAlign: 'left', background: 'white', padding: '10px', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                                {transcripts.map(t => (
                                    <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', borderBottom: '1px solid #F3F4F6' }}>
                                        <span style={{ fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                                            {t.title || 'Sin título'}
                                        </span>
                                        <button
                                            onClick={(e) => handleDeleteTranscript(t.id, e)}
                                            style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default GlobalChat;
