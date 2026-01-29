import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Copy, 
  Star, 
  Tag, 
  Clock,
  User,
  ExternalLink,
  Edit3
} from 'lucide-react';

const TechniqueDetail = () => {
  const { techniqueId } = useParams();
  const [technique, setTechnique] = useState(null);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [notes, setNotes] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadTechniqueData = async () => {
      setIsLoading(true);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTechnique({
        id: techniqueId,
        name: 'Creación de Urgencia',
        category: 'conversion',
        description: 'Técnicas para crear presión temporal que impulse la acción inmediata del usuario mediante el uso de límites de tiempo, ofertas por tiempo limitado, y lenguaje que enfatiza la necesidad de actuar ahora.',
        objective: 'Incrementar conversiones',
        funnelStage: 'conversion',
        confidence: 0.92,
        frequency: 45,
        videosCount: 23,
        firstDetected: '2024-01-01',
        lastSeen: '2024-01-15',
        tags: ['urgency', 'scarcity', 'time-limited', 'conversion', 'cta'],
        variations: [
          'Límites temporales específicos (hasta medianoche, 24 horas)',
          'Ofertas por tiempo limitado',
          'Lenguaje de urgencia (ahora, inmediatamente, no esperes)',
          'Contadores regresivos',
          'Fechas de vencimiento'
        ],
        bestPractices: [
          'Usar límites temporales específicos y creíbles',
          'Combinar con beneficios claros del producto/servicio',
          'Evitar crear urgencia falsa repetidamente',
          'Incluir razones válidas para la limitación temporal',
          'Usar elementos visuales como contadores cuando sea posible'
        ],
        evidence: [
          {
            id: 1,
            videoId: 'video_1',
            videoTitle: '10 Estrategias de Marketing que Funcionan en 2024',
            channel: 'Marketing Pro',
            text: 'Solo tienes hasta medianoche para aprovechar esta oportunidad única.',
            timestamp: 125,
            duration: 4.2,
            context: 'Promoción de curso de marketing',
            confidence: 0.95
          },
          {
            id: 2,
            videoId: 'video_2',
            videoTitle: 'Cómo Vender Más con Urgencia Real',
            channel: 'Ventas Pro',
            text: 'Esta oferta especial termina en exactamente 48 horas, no la dejes pasar.',
            timestamp: 89,
            duration: 5.1,
            context: 'Lanzamiento de producto',
            confidence: 0.91
          },
          {
            id: 3,
            videoId: 'video_3',
            videoTitle: 'Técnicas de Conversión Avanzadas',
            channel: 'Growth Hacker',
            text: 'Actúa ahora porque mañana el precio sube un 50%.',
            timestamp: 234,
            duration: 3.8,
            context: 'Promoción de software',
            confidence: 0.88
          }
        ]
      });
      
      setRelatedVideos([
        {
          id: 'video_1',
          youtubeId: 'dQw4w9WgXcQ',
          title: '10 Estrategias de Marketing que Funcionan en 2024',
          channel: 'Marketing Pro',
          thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
          duration: 720,
          publishedAt: '2024-01-15',
          techniquesCount: 12,
          confidence: 0.95
        },
        {
          id: 'video_2',
          youtubeId: 'abc123def',
          title: 'Cómo Vender Más con Urgencia Real',
          channel: 'Ventas Pro',
          thumbnail: 'https://img.youtube.com/vi/abc123def/mqdefault.jpg',
          duration: 480,
          publishedAt: '2024-01-12',
          techniquesCount: 8,
          confidence: 0.91
        },
        {
          id: 'video_3',
          youtubeId: 'xyz789ghi',
          title: 'Técnicas de Conversión Avanzadas',
          channel: 'Growth Hacker',
          thumbnail: 'https://img.youtube.com/vi/xyz789ghi/mqdefault.jpg',
          duration: 600,
          publishedAt: '2024-01-10',
          techniquesCount: 15,
          confidence: 0.88
        }
      ]);
      
      setNotes('Esta técnica es especialmente efectiva cuando se combina con beneficios claros y ofertas genuinas. Importante no abusar para mantener credibilidad.');
      
      setIsLoading(false);
    };
    
    loadTechniqueData();
  }, [techniqueId]);
  
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
  
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // In a real app, show toast notification
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
  
  const saveNotes = () => {
    // In a real app, save to database
    setIsEditingNotes(false);
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading" />
        <span className="ml-2">Cargando detalle de técnica...</span>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/techniques"
          className="btn btn-secondary"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Link>
        
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-900">{technique.name}</h1>
            <span className={`badge ${getCategoryColor(technique.category)}`}>
              {technique.category}
            </span>
            <span className="badge badge-info">
              {technique.funnelStage}
            </span>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Confianza: {Math.round(technique.confidence * 100)}%</span>
            <span>Frecuencia: {technique.frequency}</span>
            <span>Videos: {technique.videosCount}</span>
            <span>Última vez: {new Date(technique.lastSeen).toLocaleDateString('es-ES')}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="btn btn-secondary">
            <Star className="w-4 h-4" />
            Favorito
          </button>
          
          <button className="btn btn-secondary">
            <Tag className="w-4 h-4" />
            Editar Tags
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Descripción</h2>
            <p className="text-gray-700 leading-relaxed">{technique.description}</p>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Objetivo</h3>
                <p className="text-sm text-gray-600">{technique.objective}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Etapa del Funnel</h3>
                <p className="text-sm text-gray-600 capitalize">{technique.funnelStage}</p>
              </div>
            </div>
          </div>
          
          {/* Variations */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Variaciones Detectadas</h2>
            <ul className="space-y-2">
              {technique.variations.map((variation, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span className="text-sm text-gray-700">{variation}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Best Practices */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Mejores Prácticas</h2>
            <ul className="space-y-2">
              {technique.bestPractices.map((practice, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-sm text-gray-700">{practice}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Evidence */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Evidencia ({technique.evidence.length} ejemplos)
            </h2>
            
            <div className="space-y-4">
              {technique.evidence.map((evidence) => (
                <div key={evidence.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">
                        {evidence.videoTitle}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {evidence.channel}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatTimestamp(evidence.timestamp)}
                        </span>
                        <span className="badge badge-success">
                          {Math.round(evidence.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyToClipboard(`${formatTimestamp(evidence.timestamp)}: "${evidence.text}"`)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      
                      <Link
                        to={`/video/${evidence.videoId}`}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                  
                  <blockquote className="bg-gray-50 border-l-4 border-blue-500 p-3 mb-2">
                    <p className="text-sm text-gray-900 italic">"{evidence.text}"</p>
                  </blockquote>
                  
                  <p className="text-xs text-gray-500">
                    <span className="font-medium">Contexto:</span> {evidence.context}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Confianza Promedio</span>
                <span className="font-semibold text-gray-900">
                  {Math.round(technique.confidence * 100)}%
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Frecuencia Total</span>
                <span className="font-semibold text-gray-900">{technique.frequency}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Videos Relacionados</span>
                <span className="font-semibold text-gray-900">{technique.videosCount}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Primera Detección</span>
                <span className="font-semibold text-gray-900">
                  {new Date(technique.firstDetected).toLocaleDateString('es-ES')}
                </span>
              </div>
            </div>
          </div>
          
          {/* Tags */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {technique.tags.map(tag => (
                <span key={tag} className="badge bg-gray-100 text-gray-700">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          
          {/* Notes */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Notas Internas</h2>
              <button
                onClick={() => setIsEditingNotes(!isEditingNotes)}
                className="text-gray-400 hover:text-gray-600"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
            
            {isEditingNotes ? (
              <div className="space-y-3">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="textarea"
                  rows={4}
                  placeholder="Añade tus notas sobre esta técnica..."
                />
                <div className="flex gap-2">
                  <button
                    onClick={saveNotes}
                    className="btn btn-primary btn-sm"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => setIsEditingNotes(false)}
                    className="btn btn-secondary btn-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-700">
                {notes || 'No hay notas aún. Haz clic en el ícono de edición para añadir.'}
              </p>
            )}
          </div>
          
          {/* Related Videos */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Videos Relacionados</h2>
            
            <div className="space-y-3">
              {relatedVideos.slice(0, 3).map(video => (
                <div key={video.id} className="flex gap-3 p-2 hover:bg-gray-50 rounded-lg">
                  <img
                    src={video.thumbnail}
                    alt=""
                    className="w-16 h-12 object-cover rounded flex-shrink-0"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {video.title}
                    </h3>
                    <p className="text-xs text-gray-600">{video.channel}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">
                        {formatDuration(video.duration)}
                      </span>
                      <span className="badge badge-success text-xs">
                        {Math.round(video.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                  
                  <Link
                    to={`/video/${video.id}`}
                    className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
            
            {relatedVideos.length > 3 && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <Link
                  to={`/techniques?related=${technique.id}`}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Ver todos los {relatedVideos.length} videos →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechniqueDetail;