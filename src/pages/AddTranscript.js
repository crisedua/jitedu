import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Loader2, AlertCircle, FileText, ArrowLeft } from 'lucide-react';
import { saveTranscript } from '../lib/supabase-simple';

const AddTranscript = () => {
    const navigate = useNavigate();
    const [transcript, setTranscript] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

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
            // Save the transcript to the knowledge base
            await saveTranscript(null, transcript, null);

            setSuccess(true);
            setTranscript('');

            // Redirect to chat after a moment
            setTimeout(() => {
                navigate('/');
            }, 1500);

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
                        <span>✅ Transcript guardado exitosamente!</span>
                        <p>Redirigiendo al chat...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="transcript-form">
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
                            disabled={isProcessing || !transcript.trim()}
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 size={20} className="spinning" />
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <Send size={20} />
                                    Guardar Transcript
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
