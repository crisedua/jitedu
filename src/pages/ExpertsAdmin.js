import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getExperts } from '../lib/experts';
import { supabase } from '../lib/supabase-simple';
import { Plus, Edit2, Trash2, Save, X, ArrowLeft } from 'lucide-react';

const ExpertsAdmin = () => {
    const navigate = useNavigate();
    const [experts, setExperts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingExpert, setEditingExpert] = useState(null);
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        loadExperts();
    }, []);

    const loadExperts = async () => {
        try {
            const data = await getExperts();
            setExperts(data);
        } catch (error) {
            console.error('Error loading experts:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = () => {
        setIsCreating(true);
        setEditingExpert({
            name: '',
            slug: '',
            title: '',
            specialty: '',
            description: '',
            system_prompt: '',
            color_theme: '#3B82F6',
            is_active: true,
            sort_order: experts.length + 1
        });
    };

    const handleEdit = (expert) => {
        setEditingExpert({ ...expert });
        setIsCreating(false);
    };

    const handleSave = async () => {
        try {
            if (!supabase) {
                alert('Database not configured');
                return;
            }

            if (isCreating) {
                const { error } = await supabase
                    .from('experts')
                    .insert([editingExpert]);
                
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('experts')
                    .update(editingExpert)
                    .eq('id', editingExpert.id);
                
                if (error) throw error;
            }

            setEditingExpert(null);
            setIsCreating(false);
            loadExperts();
        } catch (error) {
            console.error('Error saving expert:', error);
            alert('Error saving expert: ' + error.message);
        }
    };

    const handleDelete = async (expertId) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar este experto?')) {
            return;
        }

        try {
            if (!supabase) {
                alert('Database not configured');
                return;
            }

            const { error } = await supabase
                .from('experts')
                .delete()
                .eq('id', expertId);
            
            if (error) throw error;
            loadExperts();
        } catch (error) {
            console.error('Error deleting expert:', error);
            alert('Error deleting expert: ' + error.message);
        }
    };

    const handleCancel = () => {
        setEditingExpert(null);
        setIsCreating(false);
    };

    if (isLoading) {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <div className="loading-spinner"></div>
                <p>Cargando expertos...</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button
                        onClick={() => navigate('/')}
                        style={{
                            padding: '8px 12px',
                            background: 'white',
                            border: '1px solid #E5E7EB',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <ArrowLeft size={16} />
                        Volver
                    </button>
                    <h1 style={{ margin: 0 }}>Gestión de Expertos</h1>
                </div>
                <button
                    onClick={handleCreate}
                    style={{
                        padding: '10px 16px',
                        background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontWeight: 600
                    }}
                >
                    <Plus size={18} />
                    Nuevo Experto
                </button>
            </div>

            {editingExpert && (
                <div style={{
                    background: 'white',
                    border: '2px solid #3B82F6',
                    borderRadius: '12px',
                    padding: '24px',
                    marginBottom: '24px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                    <h3 style={{ marginTop: 0 }}>{isCreating ? 'Crear Nuevo Experto' : 'Editar Experto'}</h3>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Nombre</label>
                            <input
                                type="text"
                                value={editingExpert.name}
                                onChange={(e) => setEditingExpert({ ...editingExpert, name: e.target.value })}
                                style={{ width: '100%', padding: '8px', border: '1px solid #E5E7EB', borderRadius: '6px' }}
                            />
                        </div>
                        
                        <div>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Slug</label>
                            <input
                                type="text"
                                value={editingExpert.slug}
                                onChange={(e) => setEditingExpert({ ...editingExpert, slug: e.target.value })}
                                style={{ width: '100%', padding: '8px', border: '1px solid #E5E7EB', borderRadius: '6px' }}
                            />
                        </div>
                        
                        <div>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Título</label>
                            <input
                                type="text"
                                value={editingExpert.title}
                                onChange={(e) => setEditingExpert({ ...editingExpert, title: e.target.value })}
                                style={{ width: '100%', padding: '8px', border: '1px solid #E5E7EB', borderRadius: '6px' }}
                            />
                        </div>
                        
                        <div>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Especialidad</label>
                            <input
                                type="text"
                                value={editingExpert.specialty}
                                onChange={(e) => setEditingExpert({ ...editingExpert, specialty: e.target.value })}
                                style={{ width: '100%', padding: '8px', border: '1px solid #E5E7EB', borderRadius: '6px' }}
                            />
                        </div>
                        
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Descripción</label>
                            <textarea
                                value={editingExpert.description}
                                onChange={(e) => setEditingExpert({ ...editingExpert, description: e.target.value })}
                                rows={2}
                                style={{ width: '100%', padding: '8px', border: '1px solid #E5E7EB', borderRadius: '6px' }}
                            />
                        </div>
                        
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>System Prompt</label>
                            <textarea
                                value={editingExpert.system_prompt}
                                onChange={(e) => setEditingExpert({ ...editingExpert, system_prompt: e.target.value })}
                                rows={6}
                                style={{ width: '100%', padding: '8px', border: '1px solid #E5E7EB', borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.875rem' }}
                            />
                        </div>
                        
                        <div>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Color</label>
                            <input
                                type="color"
                                value={editingExpert.color_theme}
                                onChange={(e) => setEditingExpert({ ...editingExpert, color_theme: e.target.value })}
                                style={{ width: '100%', height: '40px', border: '1px solid #E5E7EB', borderRadius: '6px' }}
                            />
                        </div>
                        
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '28px' }}>
                                <input
                                    type="checkbox"
                                    checked={editingExpert.is_active}
                                    onChange={(e) => setEditingExpert({ ...editingExpert, is_active: e.target.checked })}
                                />
                                <span style={{ fontWeight: 500 }}>Activo</span>
                            </label>
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                        <button
                            onClick={handleSave}
                            style={{
                                padding: '10px 20px',
                                background: '#10B981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontWeight: 600
                            }}
                        >
                            <Save size={18} />
                            Guardar
                        </button>
                        <button
                            onClick={handleCancel}
                            style={{
                                padding: '10px 20px',
                                background: '#6B7280',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontWeight: 600
                            }}
                        >
                            <X size={18} />
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                {experts.map(expert => (
                    <div
                        key={expert.id}
                        style={{
                            background: 'white',
                            border: `2px solid ${expert.color_theme}30`,
                            borderRadius: '12px',
                            padding: '20px',
                            position: 'relative'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '50%',
                                background: `linear-gradient(135deg, ${expert.color_theme}, ${expert.color_theme}dd)`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '16px'
                            }}>
                                {expert.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ margin: '0 0 4px 0' }}>{expert.name}</h3>
                                <p style={{ margin: '0 0 4px 0', fontSize: '0.875rem', color: '#6B7280' }}>{expert.title}</p>
                                <span style={{
                                    display: 'inline-block',
                                    padding: '2px 8px',
                                    background: `${expert.color_theme}20`,
                                    color: expert.color_theme,
                                    borderRadius: '4px',
                                    fontSize: '0.75rem',
                                    fontWeight: 600
                                }}>
                                    {expert.specialty}
                                </span>
                            </div>
                        </div>
                        
                        <p style={{ fontSize: '0.875rem', color: '#4B5563', marginBottom: '16px' }}>
                            {expert.description}
                        </p>
                        
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                onClick={() => handleEdit(expert)}
                                style={{
                                    flex: 1,
                                    padding: '8px',
                                    background: '#F3F4F6',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    fontWeight: 500
                                }}
                            >
                                <Edit2 size={14} />
                                Editar
                            </button>
                            <button
                                onClick={() => handleDelete(expert.id)}
                                style={{
                                    flex: 1,
                                    padding: '8px',
                                    background: '#FEE2E2',
                                    color: '#DC2626',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    fontWeight: 500
                                }}
                            >
                                <Trash2 size={14} />
                                Eliminar
                            </button>
                        </div>
                        
                        {!expert.is_active && (
                            <div style={{
                                position: 'absolute',
                                top: '12px',
                                right: '12px',
                                padding: '4px 8px',
                                background: '#FEE2E2',
                                color: '#DC2626',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: 600
                            }}>
                                Inactivo
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ExpertsAdmin;
