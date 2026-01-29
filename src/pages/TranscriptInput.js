import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { analyzeTranscriptWithAI } from '../lib/openrouter';
import { saveTranscript, updateTranscriptAnalysis } from '../lib/supabase-simple';

const TranscriptInput = () => {
    const navigate = useNavigate();
    const [transcript, setTranscript] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);

    const wordCount = transcript.trim().split(/\s+/).filter(w => w).length;
    const isValidLength = wordCount >= 50 && wordCount <= 15000;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isValidLength) {
            setError('El transcript debe tener entre 50 y 15,000 palabras');
            return;
        }

        setIsProcessing(true);
        setError(null);

        try {
            // First save the transcript to get an ID
            const savedTranscript = await saveTranscript(null, transcript);

            // Then analyze with AI
            const analysis = await analyzeTranscriptWithAI(transcript, {
                title: 'Transcript',
                channel: 'Usuario'
            });

            // Update the transcript with the analysis
            await updateTranscriptAnalysis(savedTranscript.id, analysis);

            // Navigate to the chat interface
            navigate(`/chat/${savedTranscript.id}`);

        } catch (err) {
            console.error('Error processing transcript:', err);
            setError(err.message || 'Error al procesar el transcript');
            setIsProcessing(false);
        }
    };

    return (
        <div className="transcript-input-page">
            <div className="transcript-input-container">
                <div className="transcript-header">
                    <div className="transcript-icon">
                        <Sparkles size={32} />
                    </div>
                    <h1>Analizar Transcript</h1>
                    <p>Pega el transcript de tu video y la IA lo analizará.
                        Luego podrás hacer preguntas sobre el contenido.</p>
                </div>

                <form onSubmit={handleSubmit} className="transcript-form">
                    <div className="form-group">
                        <label htmlFor="transcript">
                            Transcript del Video
                            <span className={`word-count ${isValidLength ? 'valid' : wordCount > 0 ? 'invalid' : ''}`}>
                                {wordCount.toLocaleString()} palabras
                            </span>
                        </label>
                        <textarea
                            id="transcript"
                            value={transcript}
                            onChange={(e) => setTranscript(e.target.value)}
                            placeholder="Pega aquí el transcript completo del video... (mínimo 50 palabras)"
                            rows={18}
                            disabled={isProcessing}
                        />
                        <span className="form-hint">
                            El transcript debe tener entre 50 y 15,000 palabras para un análisis óptimo.
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
                        disabled={isProcessing || !transcript.trim()}
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 size={20} className="spinning" />
                                Analizando con IA...
                            </>
                        ) : (
                            <>
                                <Send size={20} />
                                Analizar Transcript
                            </>
                        )}
                    </button>

                    {isProcessing && (
                        <div className="processing-info">
                            <p>🤖 La IA está analizando el transcript...</p>
                            <p>Esto puede tomar entre 30 segundos y 2 minutos dependiendo de la longitud.</p>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default TranscriptInput;
