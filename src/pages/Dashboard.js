import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Clock, TrendingUp, Database, Sparkles, Target, Brain, Zap } from 'lucide-react';
import { useProjects, useAnalytics, useTopTechniques } from '../hooks/useSupabase';

const Dashboard = () => {
  const { data: projects = [], isLoading: projectsLoading } = useProjects();
  const { data: analytics = {}, isLoading: analyticsLoading } = useAnalytics();
  const { data: topTechniques = [], isLoading: techniquesLoading } = useTopTechniques(4);
  
  // Get recent projects (last 3)
  const recentProjects = projects.slice(0, 3);
  
  const stats = {
    totalProjects: analytics.totalProjects || 0,
    totalAnalysis: analytics.totalVideos || 0,
    totalTechniques: analytics.totalTechniques || 0,
    avgConfidence: 0.89 // This would come from analytics in real implementation
  };
  
  if (projectsLoading || analyticsLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">Cargando datos...</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="stat-card animate-pulse">
              <div className="h-16 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Bienvenido de vuelta. Aquí tienes un resumen de tus análisis de marketing.
          </p>
        </div>
        <Link
          to="/new-project"
          className="btn btn-primary btn-lg"
        >
          <Plus className="w-5 h-5" />
          Nuevo Análisis
        </Link>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-primary-100 rounded-xl">
              <Database className="w-6 h-6 text-primary-600" />
            </div>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              Total
            </span>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 mb-1">{stats.totalProjects}</p>
            <p className="text-sm text-gray-600">Proyectos Creados</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <Brain className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
              +23%
            </span>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 mb-1">{stats.totalAnalysis}</p>
            <p className="text-sm text-gray-600">Análisis Completados</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
              +18%
            </span>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 mb-1">{stats.totalTechniques}</p>
            <p className="text-sm text-gray-600">Técnicas Detectadas</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-xl">
              <Zap className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
              {Math.round(stats.avgConfidence * 100)}%
            </span>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              {Math.round(stats.avgConfidence * 100)}%
            </p>
            <p className="text-sm text-gray-600">Confianza Promedio</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Projects */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary-600" />
                Análisis Recientes
              </h2>
              <Link
                to="/projects"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Ver todos →
              </Link>
            </div>
            
            <div className="space-y-4">
              {recentProjects.map((project) => {
                const techniquesFound = project.videos?.reduce((sum, video) => 
                  sum + (video.techniques_count?.[0]?.count || 0), 0) || 0;
                
                return (
                  <div
                    key={project.id}
                    className="technique-card"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{project.name}</h3>
                          <span className="badge badge-success">
                            Completado
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                          <span className="flex items-center gap-1">
                            <Database className="w-4 h-4" />
                            {techniquesFound} técnicas
                          </span>
                          <span className="flex items-center gap-1">
                            <TrendingUp className="w-4 h-4" />
                            92% confianza
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date(project.created_at).toLocaleDateString('es-ES')}
                          </span>
                        </div>
                      </div>
                      
                      <Link
                        to={`/project/${project.id}`}
                        className="btn btn-secondary btn-sm ml-4"
                      >
                        Ver Análisis
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {recentProjects.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <Database />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No hay análisis aún
                </h3>
                <p className="text-gray-600 mb-6">
                  Crea tu primer análisis para comenzar a identificar técnicas de marketing
                </p>
                <Link
                  to="/new-project"
                  className="btn btn-primary"
                >
                  <Plus className="w-4 h-4" />
                  Crear Primer Análisis
                </Link>
              </div>
            )}
          </div>
        </div>
        
        {/* Top Techniques */}
        <div>
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary-600" />
              Técnicas Populares
            </h2>
            
            <div className="space-y-4">
              {techniquesLoading ? (
                // Loading skeleton
                [1, 2, 3, 4].map((i) => (
                  <div key={i} className="animate-pulse p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-20"></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : topTechniques.length > 0 ? (
                topTechniques.map((technique, index) => {
                  const usageCount = technique.video_techniques?.length || 0;
                  return (
                    <div key={technique.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 font-semibold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{technique.name}</p>
                          <p className="text-xs text-gray-500">{usageCount} detecciones</p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                        +{Math.floor(Math.random() * 20) + 5}%
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">No hay técnicas aún</p>
                </div>
              )}
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <Link
                to="/techniques"
                className="btn btn-secondary w-full"
              >
                Ver Biblioteca Completa
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;