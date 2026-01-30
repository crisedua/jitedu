import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Loader2, AlertCircle, FileText, ArrowLeft, Brain } from 'lucide-react';
import { saveTranscript, updateTranscriptFields } from '../lib/supabase-simple';
import { analyzeTranscriptWithAI } from '../lib/openrouter';

const AddTranscript = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [transcript, setTranscript] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [analysisComplete, setAnalysisComplete] = useState(false);

    const wordCount = transcript.trim().split(/\s+/).filter(w => w).length;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (wordCount < 20) {
            setError('El transcript debe tener al menos 20 palabras');
            return;
        }

        setIsProcessing(true);
        setError(null);

        try {
            // Step 1: Save the transcript to the knowledge base
            const savedTranscript = await saveTranscript(title || 'Sin título', transcript, null);
            
            setSuccess(true);
            setIsProcessing(false);
            setIsAnalyzing(true);

            // Step 2: Automatically analyze the transcript
            try {
                const analysis = await analyzeTranscriptWithAI(transcript, { 
                    title: title || 'Sin título' 
                });

                // Step 3: Update the transcript with analysis
                const updates = {
                    ai_analysis: analysis,
                    status: 'completed'
                };

                // Update title if we have a suggestion and current is generic
                if (analysis.suggestedTitle && (!title || title === 'Sin título')) {
                    updates.title = analysis.suggestedTitle;
                }

                await updateTranscriptFields(savedTranscript.id, updates);
                
                setAnalysisComplete(true);
                setIsAnalyzing(false);

                // Redirect to chat after analysis is complete
                setTimeout(() => {
                    navigate('/');
                }, 2000);

            } catch (analysisError) {
                console.error('Error analyzing transcript:', analysisError);
                setIsAnalyzing(false);
                
                // Still redirect to chat even if analysis fails
                setTimeout(() => {
                    navigate('/');
                }, 1500);
            }

            // Clear form
            setTranscript('');
            setTitle('');

        } catch (err) {
            console.error('Error saving transcript:', err);
            setError(err.message || 'Error al guardar el transcript');
            setIsProcessing(false);
        }
    };

    return (
        <div className="add-transcript-page">
            <div className="add-transcript-container">
                <div className="add-header">
                    <button onClick={() => navigate('/')} className="back-button">
                        <ArrowLeft size={20} />
                        Volver al Chat
                    </button>
                </div>

                <div className="transcript-header">
                    <div className="transcript-icon">
                        <FileText size={32} />
                    </div>
                    <h1>Agregar Transcript</h1>
                    <p>Agrega un transcript a tu base de conocimiento.
                        Luego podrás hacer preguntas sobre todos tus transcripts.</p>
                </div>

                {success ? (
                    <div className="success-message">
                        {!isAnalyzing && !analysisComplete ? (
                            <>
                                <span>✅ Transcript guardado exitosamente!</span>
                                <p>Redirigiendo al chat...</p>
                            </>
                        ) : isAnalyzing ? (
                            <>
                                <span>🧠 Analizando con IA...</span>
                                <div className="analysis-progress">
                                    <Loader2 size={24} className="spinning" />
                                    <p>Detectando técnicas de marketing y persuasión...</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <span>✨ Análisis completado!</span>
                                <p>Transcript guardado y analizado. Redirigiendo al chat...</p>
                            </>
                        )}
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="transcript-form">
                        <div className="form-group">
                            <label htmlFor="title">Título (Opcional)</label>
                            <input
                                id="title"
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Ej: Video de Ventas 2024"
                                disabled={isProcessing}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="transcript">
                                Transcript
                                <span className={`word-count ${wordCount >= 20 ? 'valid' : wordCount > 0 ? 'invalid' : ''}`}>
                                    {wordCount.toLocaleString()} palabras
                                </span>
                            </label>
                            <textarea
                                id="transcript"
                                value={transcript}
                                onChange={(e) => setTranscript(e.target.value)}
                                placeholder="Pega aquí el transcript del video..."
                                rows={16}
                                disabled={isProcessing}
                            />
                            <span className="form-hint">
                                Mínimo 20 palabras. Puedes agregar múltiples transcripts.
                            </span>
                        </div>

                        {error && (
                            <div className="error-message">
                                <AlertCircle size={18} />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="submit-button"
                            disabled={isProcessing || isAnalyzing || !transcript.trim()}
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 size={20} className="spinning" />
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <Send size={20} />
                                    Guardar y Analizar
                                </>
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default AddTranscript;
