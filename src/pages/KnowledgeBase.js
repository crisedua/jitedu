import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRecentTranscripts, deleteTranscript, updateTranscriptFields } from '../lib/supabase-simple';
import { Trash2, Edit2, Save, X, Plus, Search, Calendar, FileText } from 'lucide-react';

const KnowledgeBase = () => {
    const navigate = useNavigate();
    const [transcripts, setTranscripts] = useState([]);
    const [filteredTranscripts, setFilteredTranscripts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ title: '', content: '' });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadTranscripts();
    }, []);

    useEffect(() => {
        filterTranscripts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery, transcripts]);

    const loadTranscripts = async () => {
        setIsLoading(true);
        try {
            const data = await getRecentTranscripts(1000);
            setTranscripts(data);
        } catch (error) {
            console.error('Error loading transcripts:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filterTranscripts = () => {
        if (!searchQuery.trim()) {
            setFilteredTranscripts(transcripts);
            return;
        }

        const query = searchQuery.toLowerCase();
        const filtered = transcripts.filter(t => 
            t.title?.toLowerCase().includes(query) ||
            t.content?.toLowerCase().includes(query)
        );
        setFilteredTranscripts(filtered);
    };

    const handleEdit = (transcript) => {
        setEditingId(transcript.id);
        setEditForm({
            title: transcript.title || '',
            content: transcript.content || ''
        });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditForm({ title: '', content: '' });
    };

    const handleSaveEdit = async (id) => {
        setIsSaving(true);
        try {
            await updateTranscriptFields(id, {
                title: editForm.title,
                content: editForm.content
            });

            // Update local state
            setTranscripts(prev => prev.map(t => 
                t.id === id 
                    ? { ...t, title: editForm.title, content: editForm.content }
                    : t
            ));

            setEditingId(null);
            setEditForm({ title: '', content: '' });
        } catch (error) {
            console.error('Error saving transcript:', error);
            alert('Error al guardar. Intenta de nuevo.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id, title) => {
        if (!window.confirm(`¿Estás seguro de eliminar "${title}"?`)) {
            return;
        }

        try {
            await deleteTranscript(id);
            setTranscripts(prev => prev.filter(t => t.id !== id));
        } catch (error) {
            console.error('Error deleting transcript:', error);
            alert('Error al eliminar. Intenta de nuevo.');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Sin fecha';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    };

    const wordCount = (text) => {
        if (!text) return 0;
        return text.trim().split(/\s+/).filter(w => w).length;
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            {/* Top Navigation Menu */}
            <nav className="top-nav-menu">
                <div className="nav-left">
                    <div className="nav-logo">
                        <span style={{ fontSize: '1.5rem' }}>🚀</span>
                        <span className="nav-brand">DESPEGUE</span>
                    </div>
                </div>
                <div className="nav-center">
                    <a href="/" className="nav-link">
                        💬 Chat
                    </a>
                    <a href="/knowledge-base" className="nav-link active">
                        📚 Base de Conocimiento
                    </a>
                    <a href="/add" className="nav-link">
                        ➕ Agregar Contenido
                    </a>
                </div>
                <div className="nav-right">
                    {/* Could add user menu or settings here */}
                </div>
            </nav>

            <div className="knowledge-base-page" style={{ flex: 1, overflow: 'auto' }}>
            <div className="kb-header">
                <div className="kb-header-content">
                    <div className="kb-title-section">
                        <FileText size={32} />
                        <div>
                            <h1>Base de Conocimiento</h1>
                            <p>Gestiona todos tus transcripts y contenido</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => navigate('/add')}
                        className="kb-add-button"
                    >
                        <Plus size={20} />
                        Agregar Transcript
                    </button>
                </div>

                <div className="kb-search-bar">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Buscar en transcripts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="kb-stats">
                    <div className="kb-stat">
                        <span className="stat-value">{transcripts.length}</span>
                        <span className="stat-label">Total Transcripts</span>
                    </div>
                    <div className="kb-stat">
                        <span className="stat-value">
                            {transcripts.reduce((sum, t) => sum + wordCount(t.content), 0).toLocaleString()}
                        </span>
                        <span className="stat-label">Total Palabras</span>
                    </div>
                    <div className="kb-stat">
                        <span className="stat-value">{filteredTranscripts.length}</span>
                        <span className="stat-label">Mostrando</span>
                    </div>
                </div>
            </div>

            <div className="kb-content">
                {isLoading ? (
                    <div className="kb-loading">
                        <div className="loading-spinner"></div>
                        <p>Cargando transcripts...</p>
                    </div>
                ) : filteredTranscripts.length === 0 ? (
                    <div className="kb-empty">
                        <FileText size={64} />
                        <h3>No se encontraron transcripts</h3>
                        <p>
                            {searchQuery 
                                ? 'Intenta con otra búsqueda'
                                : 'Agrega tu primer transcript para comenzar'
                            }
                        </p>
                        {!searchQuery && (
                            <button 
                                onClick={() => navigate('/add')}
                                className="kb-add-button"
                            >
                                <Plus size={20} />
                                Agregar Transcript
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="kb-list">
                        {filteredTranscripts.map(transcript => (
                            <div key={transcript.id} className="kb-item">
                                {editingId === transcript.id ? (
                                    // Edit Mode
                                    <div className="kb-edit-form">
                                        <input
                                            type="text"
                                            value={editForm.title}
                                            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                            placeholder="Título del transcript"
                                            className="kb-edit-title"
                                        />
                                        <textarea
                                            value={editForm.content}
                                            onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                                            placeholder="Contenido del transcript"
                                            className="kb-edit-content"
                                            rows={10}
                                        />
                                        <div className="kb-edit-actions">
                                            <button
                                                onClick={() => handleSaveEdit(transcript.id)}
                                                disabled={isSaving}
                                                className="kb-save-button"
                                            >
                                                <Save size={18} />
                                                {isSaving ? 'Guardando...' : 'Guardar'}
                                            </button>
                                            <button
                                                onClick={handleCancelEdit}
                                                disabled={isSaving}
                                                className="kb-cancel-button"
                                            >
                                                <X size={18} />
                                                Cancelar
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    // View Mode
                                    <>
                                        <div className="kb-item-header">
                                            <h3>{transcript.title || 'Sin título'}</h3>
                                            <div className="kb-item-actions">
                                                <button
                                                    onClick={() => handleEdit(transcript)}
                                                    className="kb-action-button edit"
                                                    title="Editar"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(transcript.id, transcript.title)}
                                                    className="kb-action-button delete"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="kb-item-meta">
                                            <span className="kb-meta-item">
                                                <Calendar size={14} />
                                                {formatDate(transcript.created_at)}
                                            </span>
                                            <span className="kb-meta-item">
                                                {wordCount(transcript.content)} palabras
                                            </span>
                                        </div>
                                        <div className="kb-item-content">
                                            {transcript.content?.substring(0, 300)}
                                            {transcript.content?.length > 300 && '...'}
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
        </div>
    );
};

export default KnowledgeBase;
