import React, { useState } from 'react';
import { Save, Plus, Trash2, Edit3 } from 'lucide-react';

const Settings = () => {
  const [settings, setSettings] = useState({
    defaultLanguage: 'es',
    analysisDepth: 'normal',
    autoReanalyze: false,
    maxBatchSize: 50,
    confidenceThreshold: 0.7
  });

  const [categories, setCategories] = useState([
    { id: 'concepts', name: 'Conceptos Clave', description: 'Ideas fundamentales y definiciones' },
    { id: 'evidence', name: 'Evidencia', description: 'Datos, estadísticas y pruebas' },
    { id: 'communication', name: 'Comunicación', description: 'Estrategias de transmisión de mensaje' },
    { id: 'context', name: 'Contexto', description: 'Antecedentes y situación' }
  ]);

  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [editingCategory, setEditingCategory] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In a real app, save to database/API
    console.log('Settings saved:', settings);

    setIsSaving(false);
    // Show success message
  };

  const addCategory = () => {
    if (!newCategory.name.trim()) return;

    const category = {
      id: newCategory.name.toLowerCase().replace(/\s+/g, '_'),
      name: newCategory.name,
      description: newCategory.description
    };

    setCategories(prev => [...prev, category]);
    setNewCategory({ name: '', description: '' });
  };

  const updateCategory = (id, updates) => {
    setCategories(prev => prev.map(cat =>
      cat.id === id ? { ...cat, ...updates } : cat
    ));
    setEditingCategory(null);
  };

  const deleteCategory = (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
      setCategories(prev => prev.filter(cat => cat.id !== id));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-600 mt-1">
          Personaliza las preferencias de análisis y gestión de técnicas
        </p>
      </div>

      {/* General Settings */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Configuración General</h2>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Idioma por Defecto
              </label>
              <select
                value={settings.defaultLanguage}
                onChange={(e) => handleSettingChange('defaultLanguage', e.target.value)}
                className="input"
              >
                <option value="es">Español</option>
                <option value="en">Inglés</option>
                <option value="auto">Detectar automáticamente</option>
              </select>
              <p className="text-sm text-gray-500 mt-1">
                Idioma preferido para la extracción de transcripts
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profundidad del Análisis
              </label>
              <select
                value={settings.analysisDepth}
                onChange={(e) => handleSettingChange('analysisDepth', e.target.value)}
                className="input"
              >
                <option value="quick">Rápido</option>
                <option value="normal">Normal</option>
                <option value="deep">Profundo</option>
              </select>
              <p className="text-sm text-gray-500 mt-1">
                Nivel de detalle en el análisis de IA
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tamaño Máximo de Lote
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={settings.maxBatchSize}
                onChange={(e) => handleSettingChange('maxBatchSize', parseInt(e.target.value))}
                className="input"
              />
              <p className="text-sm text-gray-500 mt-1">
                Número máximo de videos por proyecto
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Umbral de Confianza
              </label>
              <input
                type="range"
                min="0.5"
                max="1"
                step="0.05"
                value={settings.confidenceThreshold}
                onChange={(e) => handleSettingChange('confidenceThreshold', parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>50%</span>
                <span className="font-medium">
                  {Math.round(settings.confidenceThreshold * 100)}%
                </span>
                <span>100%</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Confianza mínima para detectar técnicas
              </p>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.autoReanalyze}
                onChange={(e) => handleSettingChange('autoReanalyze', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Re-analizar automáticamente videos existentes
                </span>
                <p className="text-sm text-gray-500">
                  Cuando se mejore el modelo de análisis, re-procesar videos anteriores
                </p>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Categories Management */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Gestión de Categorías</h2>

        {/* Add New Category */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="font-medium text-gray-900 mb-3">Añadir Nueva Categoría</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <input
                type="text"
                value={newCategory.name}
                onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ej: Retención"
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <input
                type="text"
                value={newCategory.description}
                onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Ej: Técnicas para retener audiencia"
                className="input"
              />
            </div>
          </div>
          <button
            onClick={addCategory}
            disabled={!newCategory.name.trim()}
            className="btn btn-primary mt-3"
          >
            <Plus className="w-4 h-4" />
            Añadir Categoría
          </button>
        </div>

        {/* Categories List */}
        <div className="space-y-3">
          {categories.map(category => (
            <div key={category.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              {editingCategory === category.id ? (
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 mr-4">
                  <input
                    type="text"
                    value={category.name}
                    onChange={(e) => updateCategory(category.id, { name: e.target.value })}
                    className="input"
                  />
                  <input
                    type="text"
                    value={category.description}
                    onChange={(e) => updateCategory(category.id, { description: e.target.value })}
                    className="input"
                  />
                </div>
              ) : (
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{category.name}</h3>
                  <p className="text-sm text-gray-600">{category.description}</p>
                </div>
              )}

              <div className="flex items-center gap-2">
                {editingCategory === category.id ? (
                  <>
                    <button
                      onClick={() => setEditingCategory(null)}
                      className="btn btn-primary btn-sm"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingCategory(null)}
                      className="btn btn-secondary btn-sm"
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setEditingCategory(category.id)}
                      className="btn btn-secondary btn-sm"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteCategory(category.id)}
                      className="btn btn-danger btn-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* API Configuration */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Configuración de APIs</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              YouTube Data API Key
            </label>
            <input
              type="password"
              placeholder="Ingresa tu API key de YouTube"
              className="input"
            />
            <p className="text-sm text-gray-500 mt-1">
              Necesaria para obtener metadata de videos.
              <a href="https://developers.google.com/youtube/v3/getting-started" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                Obtener API key
              </a>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              OpenAI API Key
            </label>
            <input
              type="password"
              placeholder="Ingresa tu API key de OpenAI"
              className="input"
            />
            <p className="text-sm text-gray-500 mt-1">
              Necesaria para el análisis de IA de transcripts.
              <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                Obtener API key
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="btn btn-primary"
        >
          {isSaving ? (
            <>
              <div className="loading" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Guardar Configuración
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Settings;