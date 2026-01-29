import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Star, 
  TrendingUp, 
  Eye,
  Download,
  X
} from 'lucide-react';

const TechniqueLibrary = () => {
  const [techniques, setTechniques] = useState([]);
  const [filteredTechniques, setFilteredTechniques] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedFunnelStages, setSelectedFunnelStages] = useState([]);
  const [sortBy, setSortBy] = useState('relevance');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTechniques, setSelectedTechniques] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Mock data
  useEffect(() => {
    const loadTechniques = async () => {
      setIsLoading(true);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockTechniques = [
        {
          id: 'urgency_creation',
          name: 'Creación de Urgencia',
          category: 'conversion',
          description: 'Técnicas para crear presión temporal que impulse la acción inmediata del usuario',
          objective: 'Incrementar conversiones',
          funnelStage: 'conversion',
          confidence: 0.92,
          frequency: 45,
          videosCount: 23,
          lastSeen: '2024-01-15',
          tags: ['urgency', 'scarcity', 'time-limited']
        },
        {
          id: 'social_proof',
          name: 'Social Proof',
          category: 'credibility',
          description: 'Uso de testimonios, reseñas y números de clientes para generar confianza',
          objective: 'Construir credibilidad',
          funnelStage: 'consideration',
          confidence: 0.88,
          frequency: 67,
          videosCount: 34,
          lastSeen: '2024-01-14',
          tags: ['testimonials', 'reviews', 'trust']
        },
        {
          id: 'attention_hooks',
          name: 'Hooks de Atención',
          category: 'engagement',
          description: 'Técnicas para capturar la atención del viewer en los primeros segundos',
          objective: 'Aumentar retención',
          funnelStage: 'awareness',
          confidence: 0.95,
          frequency: 89,
          videosCount: 56,
          lastSeen: '2024-01-16',
          tags: ['hooks', 'attention', 'opening']
        },
        {
          id: 'scarcity_marketing',
          name: 'Marketing de Escasez',
          category: 'conversion',
          description: 'Limitación de disponibilidad para aumentar el valor percibido',
          objective: 'Aumentar valor percibido',
          funnelStage: 'conversion',
          confidence: 0.85,
          frequency: 32,
          videosCount: 18,
          lastSeen: '2024-01-13',
          tags: ['scarcity', 'limited', 'exclusive']
        },
        {
          id: 'storytelling',
          name: 'Storytelling',
          category: 'engagement',
          description: 'Uso de narrativas para conectar emocionalmente con la audiencia',
          objective: 'Aumentar engagement',
          funnelStage: 'consideration',
          confidence: 0.91,
          frequency: 78,
          videosCount: 42,
          lastSeen: '2024-01-15',
          tags: ['story', 'narrative', 'emotional']
        },
        {
          id: 'objection_handling',
          name: 'Manejo de Objeciones',
          category: 'conversion',
          description: 'Técnicas para abordar y superar las dudas comunes de los clientes',
          objective: 'Remover barreras',
          funnelStage: 'consideration',
          confidence: 0.87,
          frequency: 41,
          videosCount: 25,
          lastSeen: '2024-01-12',
          tags: ['objections', 'concerns', 'barriers']
        }
      ];
      
      setTechniques(mockTechniques);
      setFilteredTechniques(mockTechniques);
      setIsLoading(false);
    };
    
    loadTechniques();
  }, []);
  
  // Filter and search logic
  useEffect(() => {
    let filtered = techniques;
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(technique =>
        technique.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        technique.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        technique.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(technique =>
        selectedCategories.includes(technique.category)
      );
    }
    
    // Funnel stage filter
    if (selectedFunnelStages.length > 0) {
      filtered = filtered.filter(technique =>
        selectedFunnelStages.includes(technique.funnelStage)
      );
    }
    
    // Sort
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'frequency':
          return b.frequency - a.frequency;
        case 'confidence':
          return b.confidence - a.confidence;
        case 'recent':
          return new Date(b.lastSeen) - new Date(a.lastSeen);
        case 'name':
          return a.name.localeCompare(b.name);
        default: // relevance
          return b.frequency * b.confidence - a.frequency * a.confidence;
      }
    });
    
    setFilteredTechniques(filtered);
  }, [techniques, searchTerm, selectedCategories, selectedFunnelStages, sortBy]);
  
  const categories = [
    { id: 'conversion', name: 'Conversión', color: 'bg-red-100 text-red-800' },
    { id: 'credibility', name: 'Credibilidad', color: 'bg-blue-100 text-blue-800' },
    { id: 'engagement', name: 'Engagement', color: 'bg-green-100 text-green-800' },
    { id: 'awareness', name: 'Awareness', color: 'bg-purple-100 text-purple-800' }
  ];
  
  const funnelStages = [
    { id: 'awareness', name: 'Awareness' },
    { id: 'consideration', name: 'Consideration' },
    { id: 'conversion', name: 'Conversion' },
    { id: 'retention', name: 'Retention' }
  ];
  
  const toggleCategory = (categoryId) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };
  
  const toggleFunnelStage = (stageId) => {
    setSelectedFunnelStages(prev =>
      prev.includes(stageId)
        ? prev.filter(id => id !== stageId)
        : [...prev, stageId]
    );
  };
  
  const toggleTechniqueSelection = (techniqueId) => {
    setSelectedTechniques(prev =>
      prev.includes(techniqueId)
        ? prev.filter(id => id !== techniqueId)
        : [...prev, techniqueId]
    );
  };
  
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setSelectedFunnelStages([]);
    setSortBy('relevance');
  };
  
  const getCategoryColor = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.color : 'bg-gray-100 text-gray-800';
  };
  
  const exportSelected = () => {
    const selected = techniques.filter(t => selectedTechniques.includes(t.id));
    const csvContent = [
      ['Nombre', 'Categoría', 'Descripción', 'Objetivo', 'Etapa Funnel', 'Confianza', 'Frecuencia', 'Videos'],
      ...selected.map(t => [
        t.name,
        t.category,
        t.description,
        t.objective,
        t.funnelStage,
        t.confidence,
        t.frequency,
        t.videosCount
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tecnicas-marketing.csv';
    a.click();
    URL.revokeObjectURL(url);
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading" />
        <span className="ml-2">Cargando biblioteca de técnicas...</span>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Biblioteca de Técnicas</h1>
          <p className="text-gray-600 mt-1">
            Explora y analiza técnicas de marketing detectadas en videos
          </p>
        </div>
        
        {selectedTechniques.length > 0 && (
          <button
            onClick={exportSelected}
            className="btn btn-primary"
          >
            <Download className="w-4 h-4" />
            Exportar Seleccionadas ({selectedTechniques.length})
          </button>
        )}
      </div>
      
      {/* Search and Filters */}
      <div className="card">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar técnicas, descripciones, tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn ${showFilters ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Filter className="w-4 h-4" />
            Filtros
          </button>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input w-48"
          >
            <option value="relevance">Relevancia</option>
            <option value="frequency">Frecuencia</option>
            <option value="confidence">Confianza</option>
            <option value="recent">Más Reciente</option>
            <option value="name">Nombre A-Z</option>
          </select>
        </div>
        
        {showFilters && (
          <div className="border-t pt-4 space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Categorías</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => toggleCategory(category.id)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedCategories.includes(category.id)
                        ? category.color
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Etapa del Funnel</h3>
              <div className="flex flex-wrap gap-2">
                {funnelStages.map(stage => (
                  <button
                    key={stage.id}
                    onClick={() => toggleFunnelStage(stage.id)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedFunnelStages.includes(stage.id)
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {stage.name}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {filteredTechniques.length} de {techniques.length} técnicas
              </div>
              
              {(selectedCategories.length > 0 || selectedFunnelStages.length > 0 || searchTerm) && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  <X className="w-4 h-4 inline mr-1" />
                  Limpiar Filtros
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Techniques Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTechniques.map(technique => (
          <div key={technique.id} className="card hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedTechniques.includes(technique.id)}
                  onChange={() => toggleTechniqueSelection(technique.id)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <h3 className="font-semibold text-gray-900">{technique.name}</h3>
              </div>
              
              <button className="text-gray-400 hover:text-yellow-500">
                <Star className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex items-center gap-2 mb-3">
              <span className={`badge ${getCategoryColor(technique.category)}`}>
                {categories.find(c => c.id === technique.category)?.name}
              </span>
              <span className="badge badge-info">
                {technique.funnelStage}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 mb-4 line-clamp-3">
              {technique.description}
            </p>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Confianza:</span>
                <span className="font-medium">{Math.round(technique.confidence * 100)}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Frecuencia:</span>
                <span className="font-medium">{technique.frequency}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Videos:</span>
                <span className="font-medium">{technique.videosCount}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Link
                to={`/technique/${technique.id}`}
                className="btn btn-primary flex-1"
              >
                <Eye className="w-4 h-4" />
                Ver Detalle
              </Link>
              
              <button className="btn btn-secondary">
                <TrendingUp className="w-4 h-4" />
              </button>
            </div>
            
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex flex-wrap gap-1">
                {technique.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    {tag}
                  </span>
                ))}
                {technique.tags.length > 3 && (
                  <span className="text-xs text-gray-500">
                    +{technique.tags.length - 3} más
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredTechniques.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron técnicas
          </h3>
          <p className="text-gray-600 mb-4">
            Intenta ajustar tus filtros o términos de búsqueda
          </p>
          <button
            onClick={clearFilters}
            className="btn btn-primary"
          >
            Limpiar Filtros
          </button>
        </div>
      )}
    </div>
  );
};

export default TechniqueLibrary;