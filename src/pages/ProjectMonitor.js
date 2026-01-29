import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RefreshCw,
  Eye,
  Trash2,
  Download
} from 'lucide-react';

const ProjectMonitor = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  // Mock data - in real app, this would come from API
  useEffect(() => {
    const loadProject = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProject({
        id: projectId,
        name: 'Análisis: 10 Estrategias de Marketing que Funcionan en 2024',
        description: 'Análisis de técnicas de marketing detectadas en transcript',
        createdAt: new Date().toISOString(),
        status: 'processing'
      });
      
      setVideos([
        {
          id: '1',
          youtubeId: 'manual_input',
          url: 'https://www.youtube.com/watch?v=ejemplo',
          title: '10 Estrategias de Marketing que Funcionan en 2024',
          channel: 'Marketing Pro',
          duration: 720,
          status: 'analyzing',
          progress: 65,
          techniquesFound: 0,
          error: null
        }
      ]);
      
      setIsLoading(false);
    };
    
    loadProject();
  }, [projectId]);
  
  // Auto-refresh logic
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      // In real app, this would refetch data from API
      setVideos(prev => prev.map(video => {
        if (video.status === 'analyzing' && Math.random() > 0.3) {
          return { ...video, status: 'completed', progress: 100, techniquesFound: Math.floor(Math.random() * 15) + 8 };
        }
        if (video.status === 'analyzing' && video.progress < 90) {
          return { ...video, progress: Math.min(video.progress + 10, 90) };
        }
        return video;
      }));
    }, 2000);
    
    return () => clearInterval(interval);
  }, [autoRefresh]);
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'no_transcript':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'analyzing':
      case 'extracting_transcript':
        return <div className="loading" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };
  
  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'extracting_transcript':
        return 'Extrayendo transcript';
      case 'no_transcript':
        return 'Sin transcript';
      case 'analyzing':
        return 'Analizando con IA';
      case 'completed':
        return 'Completado';
      case 'error':
        return 'Error';
      default:
        return 'Desconocido';
    }
  };
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return 'badge-success';
      case 'error':
        return 'badge-error';
      case 'no_transcript':
        return 'badge-warning';
      case 'analyzing':
      case 'extracting_transcript':
        return 'badge-info';
      default:
        return 'badge-info';
    }
  };
  
  const handleRetry = (videoId) => {
    setVideos(prev => prev.map(video => 
      video.id === videoId 
        ? { ...video, status: 'pending', progress: 0, error: null }
        : video
    ));
  };
  
  const handleExclude = (videoId) => {
    if (window.confirm('¿Estás seguro de que quieres excluir este video del proyecto?')) {
      setVideos(prev => prev.filter(video => video.id !== videoId));
    }
  };
  
  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };
  
  const stats = {
    total: videos.length,
    completed: videos.filter(v => v.status === 'completed').length,
    processing: videos.filter(v => ['analyzing', 'extracting_transcript', 'pending'].includes(v.status)).length,
    errors: videos.filter(v => v.status === 'error').length,
    noTranscript: videos.filter(v => v.status === 'no_transcript').length,
    totalTechniques: videos.reduce((sum, v) => sum + v.techniquesFound, 0)
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading" />
        <span className="ml-2">Cargando proyecto...</span>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{project?.name}</h1>
          <p className="text-gray-600 mt-1">{project?.description}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            Auto-actualizar
          </label>
          
          <button className="btn btn-secondary">
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="card text-center">
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-sm text-gray-600">Total</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          <p className="text-sm text-gray-600">Completados</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-blue-600">{stats.processing}</p>
          <p className="text-sm text-gray-600">Procesando</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-red-600">{stats.errors}</p>
          <p className="text-sm text-gray-600">Errores</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-yellow-600">{stats.noTranscript}</p>
          <p className="text-sm text-gray-600">Sin Transcript</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-purple-600">{stats.totalTechniques}</p>
          <p className="text-sm text-gray-600">Técnicas</p>
        </div>
      </div>
      
      {/* Videos Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Estado del Procesamiento</h2>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-secondary"
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Video</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Estado</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Progreso</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Técnicas</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {videos.map((video) => (
                <tr key={video.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-start gap-3">
                      <img
                        src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                        alt=""
                        className="w-16 h-12 object-cover rounded flex-shrink-0"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNDgiIGZpbGw9IiNlNWU3ZWIiIHZpZXdCb3g9IjAgMCA2NCA0OCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjQiIGhlaWdodD0iNDgiIHJ4PSI0Ii8+PC9zdmc+';
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-gray-900 truncate">{video.title}</h3>
                        <p className="text-sm text-gray-600">{video.channel}</p>
                        <p className="text-sm text-gray-500">
                          {video.duration > 0 ? formatDuration(video.duration) : 'Duración desconocida'}
                        </p>
                      </div>
                    </div>
                  </td>
                  
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(video.status)}
                      <span className={`badge ${getStatusBadge(video.status)}`}>
                        {getStatusText(video.status)}
                      </span>
                    </div>
                    {video.error && (
                      <p className="text-sm text-red-600 mt-1">{video.error}</p>
                    )}
                  </td>
                  
                  <td className="py-4 px-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          video.status === 'completed' ? 'bg-green-600' :
                          video.status === 'error' ? 'bg-red-600' :
                          'bg-blue-600'
                        }`}
                        style={{ width: `${video.progress}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{video.progress}%</p>
                  </td>
                  
                  <td className="py-4 px-4">
                    <span className="text-lg font-semibold text-gray-900">
                      {video.techniquesFound}
                    </span>
                  </td>
                  
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      {video.status === 'completed' && (
                        <Link
                          to={`/video/${video.id}`}
                          className="btn btn-secondary btn-sm"
                        >
                          <Eye className="w-4 h-4" />
                          Ver
                        </Link>
                      )}
                      
                      {(video.status === 'error' || video.status === 'no_transcript') && (
                        <button
                          onClick={() => handleRetry(video.id)}
                          className="btn btn-secondary btn-sm"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Reintentar
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleExclude(video.id)}
                        className="btn btn-danger btn-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProjectMonitor;