import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Play, 
  Clock, 
  User, 
  Calendar,
  Search,
  Copy,
  Star,
  Tag,
  ExternalLink
} from 'lucide-react';

const VideoDetail = () => {
  const { videoId } = useParams();
  const [video, setVideo] = useState(null);
  const [transcript, setTranscript] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTechnique, setSelectedTechnique] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadVideoData = async () => {
      setIsLoading(true);
      
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setVideo({
        id: videoId,
        youtubeId: 'dQw4w9WgXcQ',
        title: '10 Estrategias de Marketing que Funcionan en 2024',
        channel: 'Marketing Pro',
        publishedAt: '2024-01-15T10:00:00Z',
        duration: 720,
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg'
      });
      
      setTranscript([
        {
          id: 1,
          text: "Bienvenidos a este video donde vamos a hablar de las 10 estrategias de marketing más efectivas para 2024.",
          start: 0,
          duration: 5.2
        },
        {
          id: 2,
          text: "Primero, hablemos de la importancia de crear urgencia en tus ofertas. Solo tienes hasta medianoche para aprovechar esta oportunidad.",
          start: 5.2,
          duration: 6.8
        },
        {
          id: 3,
          text: "Segundo, el social proof es fundamental. Tenemos más de 10,000 clientes satisfechos que han transformado sus negocios.",
          start: 12.0,
          duration: 7.1
        },
        {
          id: 4,
          text: "La tercera estrategia es la escasez. Solo quedan 5 plazas disponibles en nuestro programa exclusivo.",
          start: 19.1,
          duration: 5.5
        },
        {
          id: 5,
          text: "No olvides suscribirte y activar la campanita para no perderte ningún contenido de valor.",
          start: 24.6,
          duration: 4.8
        }
      ]);
      
      setAnalysis({
        summary: {
          overview: "Este video presenta estrategias de marketing con un enfoque en técnicas de conversión y engagement.",
          keyFindings: [
            "Uso intensivo de técnicas de urgencia y escasez",
            "Incorporación efectiva de social proof",
            "Llamadas a la acción claras y directas"
          ],
          recommendations: [
            "Implementar técnicas de urgencia similares",
            "Desarrollar testimonios de clientes",
            "Optimizar CTAs para mayor conversión"
          ]
        },
        techniques: [
          {
            id: 'urgency_1',
            name: 'Creación de Urgencia',
            category: 'conversion',
            description: 'Uso de límites temporales para generar acción inmediata',
            objective: 'Incrementar conversiones',
            funnelStage: 'conversion',
            confidence: 0.92,
            evidence: [
              {
                text: "Solo tienes hasta medianoche para aprovechar esta oportunidad.",
                timestamp: 8.5,
                duration: 3.2
              }
            ]
          },
          {
            id: 'social_proof_1',
            name: 'Social Proof',
            category: 'credibility',
            description: 'Uso de testimonios y números de clientes para generar confianza',
            objective: 'Construir credibilidad',
            funnelStage: 'consideration',
            confidence: 0.88,
            evidence: [
              {
                text: "Tenemos más de 10,000 clientes satisfechos que han transformado sus negocios.",
                timestamp: 15.3,
                duration: 4.2
              }
            ]
          },
          {
            id: 'scarcity_1',
            name: 'Escasez',
            category: 'conversion',
            description: 'Limitación de disponibilidad para aumentar el valor percibido',
            objective: 'Aumentar valor percibido',
            funnelStage: 'conversion',
            confidence: 0.85,
            evidence: [
              {
                text: "Solo quedan 5 plazas disponibles en nuestro programa exclusivo.",
                timestamp: 21.8,
                duration: 3.1
              }
            ]
          },
          {
            id: 'cta_1',
            name: 'Call to Action',
            category: 'engagement',
            description: 'Instrucciones directas para acciones específicas del usuario',
            objective: 'Incrementar engagement',
            funnelStage: 'engagement',
            confidence: 0.95,
            evidence: [
              {
                text: "No olvides suscribirte y activar la campanita para no perderte ningún contenido de valor.",
                timestamp: 24.6,
                duration: 4.8
              }
            ]
          }
        ]
      });
      
      setIsLoading(false);
    };
    
    loadVideoData();
  }, [videoId]);
  
  const formatTimestamp = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };
  
  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };
  
  const highlightText = (text, searchTerm) => {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
  };
  
  const filteredTranscript = transcript.filter(segment =>
    !searchTerm || segment.text.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // In a real app, show a toast notification
  };
  
  const getCategoryColor = (category) => {
    const colors = {
      conversion: 'bg-red-100 text-red-800',
      credibility: 'bg-blue-100 text-blue-800',
      engagement: 'bg-green-100 text-green-800',
      awareness: 'bg-purple-100 text-purple-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading" />
        <span className="ml-2">Cargando análisis del video...</span>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex gap-6">
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-48 h-36 object-cover rounded-lg flex-shrink-0"
          />
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{video.title}</h1>
            
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {video.channel}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(video.publishedAt).toLocaleDateString('es-ES')}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatDuration(video.duration)}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <a
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                <Play className="w-4 h-4" />
                Ver en YouTube
              </a>
              
              <button className="btn btn-secondary">
                <Star className="w-4 h-4" />
                Marcar Favorito
              </button>
              
              <button className="btn btn-secondary">
                <Tag className="w-4 h-4" />
                Añadir Tags
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transcript */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Transcript</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar en transcript..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredTranscript.map((segment) => (
              <div key={segment.id} className="flex gap-3 p-3 hover:bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500 font-mono flex-shrink-0 w-12">
                  {formatTimestamp(segment.start)}
                </div>
                <div className="flex-1">
                  <p 
                    className="text-sm text-gray-900"
                    dangerouslySetInnerHTML={{ 
                      __html: highlightText(segment.text, searchTerm) 
                    }}
                  />
                </div>
                <button
                  onClick={() => copyToClipboard(`${formatTimestamp(segment.start)}: ${segment.text}`)}
                  className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
        
        {/* Analysis */}
        <div className="space-y-6">
          {/* Executive Summary */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumen Ejecutivo</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Resumen</h3>
                <p className="text-sm text-gray-700">{analysis.summary.overview}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Hallazgos Clave</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  {analysis.summary.keyFindings.map((finding, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      {finding}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Recomendaciones</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  {analysis.summary.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          
          {/* Techniques */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Técnicas Detectadas ({analysis.techniques.length})
            </h2>
            
            <div className="space-y-3">
              {analysis.techniques.map((technique) => (
                <div
                  key={technique.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedTechnique?.id === technique.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedTechnique(
                    selectedTechnique?.id === technique.id ? null : technique
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{technique.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`badge ${getCategoryColor(technique.category)}`}>
                        {technique.category}
                      </span>
                      <span className="text-sm text-gray-500">
                        {Math.round(technique.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">{technique.description}</p>
                  
                  <div className="text-xs text-gray-500">
                    <span className="font-medium">Objetivo:</span> {technique.objective} • 
                    <span className="font-medium ml-1">Etapa:</span> {technique.funnelStage}
                  </div>
                  
                  {selectedTechnique?.id === technique.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-2">Evidencia:</h4>
                      <div className="space-y-2">
                        {technique.evidence.map((evidence, index) => (
                          <div key={index} className="bg-white p-3 rounded border">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-mono text-gray-500">
                                {formatTimestamp(evidence.timestamp)}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyToClipboard(`${formatTimestamp(evidence.timestamp)}: ${evidence.text}`);
                                }}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                            </div>
                            <p className="text-sm text-gray-900">"{evidence.text}"</p>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-3 flex gap-2">
                        <Link
                          to={`/technique/${technique.id}`}
                          className="btn btn-secondary btn-sm"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Ver Técnica Completa
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoDetail;