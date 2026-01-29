import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Send, Loader2, MessageSquare, Plus, FileText, Lightbulb } from 'lucide-react';
import { chatWithAllTranscripts, analyzeTranscriptWithAI } from '../lib/openrouter';
import { getRecentTranscripts, updateTranscriptAnalysis } from '../lib/supabase-simple';

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

    // Check for un-analyzed transcripts
    const pendingTranscripts = useMemo(() => {
        return transcripts.filter(t => !t.ai_analysis);
    }, [transcripts]);

    const [isAnalyzingPending, setIsAnalyzingPending] = useState(false);
    const [analysisProgress, setAnalysisProgress] = useState({ current: 0, total: 0 });

    const handleAnalyzePending = async () => {
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
                await updateTranscriptAnalysis(t.id, analysis);

                // Update local state to reflect change immediately
                setTranscripts(prev => prev.map(pt =>
                    pt.id === t.id ? { ...pt, ai_analysis: analysis } : pt
                ));
            }
        } catch (err) {
            console.error('Error analyzing pending:', err);
            alert('Error durante el análisis masivo. Revisa la consola.');
        } finally {
            setIsAnalyzingPending(false);
        }
    };

    // Generate dynamic suggestions based on transcripts
    const quickSuggestions = useMemo(() => {
        if (transcripts.length === 0) return [];

        const suggestions = [];
        const usedTitles = new Set();

        // 1. Extract techniques/findings from AI analysis
        transcripts.forEach(t => {
            if (t.ai_analysis) {
                // Check for techniques array
                const techniques = t.ai_analysis.techniques || [];
                // Check for summary.keyFindings
                const findings = t.ai_analysis.summary?.keyFindings || [];

                // Suggest explaining a technique
                if (techniques.length > 0 && !usedTitles.has(t.id + '_tech')) {
                    const tech = techniques[0]; // Take the first one found
                    suggestions.push({
                        icon: FileText,
                        text: `Explícame la técnica de "${tech.name}" en "${t.title}"`,
                        color: '#3B82F6'
                    });
                    usedTitles.add(t.id + '_tech');
                }

                // Suggest elaborating on a key finding
                else if (findings.length > 0 && !usedTitles.has(t.id + '_find')) {
                    // Truncate finding if too long
                    let findingText = findings[0];
                    if (findingText.length > 40) findingText = findingText.substring(0, 40) + '...';

                    suggestions.push({
                        icon: Lightbulb,
                        text: `Dime más sobre: "${findingText}" en "${t.title}"`,
                        color: '#F59E0B'
                    });
                    usedTitles.add(t.id + '_find');
                }
            }

            // Fallback to simple title question if no analysis or we haven't used this transcript yet
            if (t.title && !usedTitles.has(t.id + '_simple') && !usedTitles.has(t.id + '_tech') && !usedTitles.has(t.id + '_find')) {
                suggestions.push({
                    icon: FileText,
                    text: `¿Qué puedo aprender de "${t.title}"?`,
                    color: '#3B82F6'
                });
                usedTitles.add(t.id + '_simple');
            }
        });

        // 2. Add comparison if we have multiple transcripts
        if (transcripts.length > 1) {
            suggestions.push({
                icon: MessageSquare,
                text: `Compara las estrategias de persuasión entre los videos`,
                color: '#10B981'
            });
        }

        // 3. Add general marketing questions to fill gaps
        const generalQuestions = [
            { text: '¿Cuáles son los hooks más efectivos detectados?', color: '#8B5CF6' },
            { text: '¿Qué patrones de cierre de ventas se repiten?', color: '#EF4444' },
            { text: 'Analizar la estructura de los guiones', color: '#EC4899' },
            { text: '¿Qué técnicas de psicología se usan?', color: '#F59E0B' }
        ];

        // Shuffle and fill
        const finalSuggestions = suggestions.slice(0, 4);
        while (finalSuggestions.length < 4) {
            const nextGen = generalQuestions.shift();
            if (nextGen) {
                finalSuggestions.push({
                    icon: MessageSquare,
                    text: nextGen.text,
                    color: nextGen.color
                });
            } else {
                break;
            }
        }

        return finalSuggestions.slice(0, 4);
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

                    <p className="transcript-count">
                        {transcriptCount} transcript{transcriptCount !== 1 ? 's' : ''} en tu base de conocimiento
                    </p>
                </div>
            )}
        </div>
    );
};

export default GlobalChat;
