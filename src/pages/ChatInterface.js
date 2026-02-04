import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    Send, Loader2, ArrowLeft, MessageSquare, FileText,
    ChevronDown, ChevronUp, Trash2, Clock, CheckCircle
} from 'lucide-react';
import { chatWithTranscript } from '../lib/openrouter';
import {
    getTranscript,
    getChatMessages,
    saveChatMessage,
    getRecentTranscripts,
    deleteTranscript,
    getSuggestedQuestions
} from '../lib/supabase-simple';

const ChatInterface = () => {
    const { transcriptId } = useParams();
    const navigate = useNavigate();
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const [transcript, setTranscript] = useState(null);
    const [messages, setMessages] = useState([]);
    const [recentTranscripts, setRecentTranscripts] = useState([]);
    const [suggestedQuestions, setSuggestedQuestions] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [showAnalysis, setShowAnalysis] = useState(true);
    const [error, setError] = useState(null);

    // Load transcript and messages
    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const [transcriptData, messagesData, recentData, questionsData] = await Promise.all([
                    getTranscript(transcriptId),
                    getChatMessages(transcriptId),
                    getRecentTranscripts(10),
                    getSuggestedQuestions()
                ]);

                setTranscript(transcriptData);
                setMessages(messagesData);
                setRecentTranscripts(recentData);
                setSuggestedQuestions(questionsData);

            } catch (err) {
                console.error('Error loading data:', err);
                setError('Error al cargar el transcript');
            } finally {
                setIsLoading(false);
            }
        };

        if (transcriptId) {
            loadData();
        }
    }, [transcriptId]);

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

        try {
            // Add user message to UI immediately
            const userMessage = { role: 'user', content: question, id: Date.now() };
            setMessages(prev => [...prev, userMessage]);

            // Save user message to DB
            await saveChatMessage(transcriptId, 'user', question);

            // Get AI response
            const response = await chatWithTranscript(
                transcript.transcript_text,
                transcript.ai_analysis,
                messages,
                question
            );

            // Add AI message to UI
            const aiMessage = { role: 'assistant', content: response, id: Date.now() + 1 };
            setMessages(prev => [...prev, aiMessage]);

            // Save AI message to DB
            await saveChatMessage(transcriptId, 'assistant', response);

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

    const handleDeleteTranscript = async () => {
        if (!window.confirm('¿Estás seguro de eliminar este transcript y su conversación?')) {
            return;
        }

        try {
            await deleteTranscript(transcriptId);
            navigate('/');
        } catch (err) {
            console.error('Error deleting transcript:', err);
        }
    };

    if (isLoading) {
        return (
            <div className="chat-loading">
                <Loader2 size={40} className="spinning" />
                <p>Cargando transcript...</p>
            </div>
        );
    }

    if (error || !transcript) {
        return (
            <div className="chat-error">
                <p>{error || 'Transcript no encontrado'}</p>
                <Link to="/" className="back-link">
                    <ArrowLeft size={16} /> Volver al inicio
                </Link>
            </div>
        );
    }

    const analysis = transcript.ai_analysis;

    return (
        <div className="chat-page">
            {/* Sidebar with recent transcripts */}
            <aside className="chat-sidebar">
                <Link to="/" className="new-analysis-btn">
                    <FileText size={18} />
                    Nuevo Análisis
                </Link>

                <div className="recent-transcripts">
                    <h3>Recientes</h3>
                    {recentTranscripts.map(t => (
                        <Link
                            key={t.id}
                            to={`/chat/${t.id}`}
                            className={`recent-item ${t.id === transcriptId ? 'active' : ''}`}
                        >
                            <span className="recent-title">{t.title || 'Sin título'}</span>
                            <span className="recent-date">
                                {new Date(t.created_at).toLocaleDateString()}
                            </span>
                        </Link>
                    ))}
                </div>
            </aside>

            {/* Main chat area */}
            <main className="chat-main">
                {/* Header */}
                <header className="chat-header">
                    <div className="chat-header-info">
                        <h1>{transcript.title || 'Sin título'}</h1>
                        <span className="chat-meta">
                            <Clock size={14} />
                            {new Date(transcript.created_at).toLocaleString()}
                        </span>
                    </div>
                    <button className="delete-btn" onClick={handleDeleteTranscript} title="Eliminar">
                        <Trash2 size={18} />
                    </button>
                </header>

                {/* Analysis Summary (collapsible) */}
                {analysis && (
                    <div className={`analysis-summary ${showAnalysis ? 'expanded' : 'collapsed'}`}>
                        <button
                            className="analysis-toggle"
                            onClick={() => setShowAnalysis(!showAnalysis)}
                        >
                            <CheckCircle size={18} />
                            <span>Resumen del Análisis</span>
                            {showAnalysis ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>

                        {showAnalysis && (
                            <div className="analysis-content">
                                <p className="analysis-overview">{analysis.summary?.overview}</p>

                                {analysis.summary?.keyFindings?.length > 0 && (
                                    <div className="analysis-section">
                                        <h4>Hallazgos Clave:</h4>
                                        <ul>
                                            {analysis.summary.keyFindings.map((finding, i) => (
                                                <li key={i}>{finding}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <div className="analysis-stats">
                                    <span className="stat">
                                        <strong>{analysis.techniques?.length || 0}</strong> técnicas detectadas
                                    </span>
                                    <span className="stat">
                                        <strong>{analysis.analysisMetadata?.transcriptLength?.toLocaleString() || 0}</strong> caracteres
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Messages */}
                <div className="chat-messages">
                    {messages.length === 0 && (
                        <div className="chat-empty">
                            <MessageSquare size={48} />
                            <h3>Haz preguntas sobre el transcript</h3>
                            <p>La IA puede ayudarte a profundizar en las técnicas detectadas,
                                encontrar citas específicas, o analizar aspectos particulares del contenido.</p>
                            <div className="suggested-questions">
                                {suggestedQuestions.map(q => (
                                    <button
                                        key={q.id}
                                        onClick={() => setInputValue(q.question_text)}
                                        title={q.question_text}
                                    >
                                        {q.label || q.question_text}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {messages.map((msg) => (
                        <div
                            key={msg.id || msg.created_at}
                            className={`chat-message ${msg.role} ${msg.isError ? 'error' : ''}`}
                        >
                            <div className="message-content">
                                {msg.content}
                            </div>
                        </div>
                    ))}

                    {isSending && (
                        <div className="chat-message assistant loading">
                            <Loader2 size={20} className="spinning" />
                            <span>Pensando...</span>
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
                        placeholder="Pregunta algo sobre el transcript..."
                        disabled={isSending}
                    />
                    <button type="submit" disabled={isSending || !inputValue.trim()}>
                        {isSending ? <Loader2 size={20} className="spinning" /> : <Send size={20} />}
                    </button>
                </form>
            </main>
        </div>
    );
};

export default ChatInterface;
