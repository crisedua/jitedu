import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle, Sparkles } from 'lucide-react';
import { useCreateVideo } from '../hooks/useSupabase';
import { analyzeTranscript } from '../lib/ai-analysis';
import { supabase } from '../lib/supabase';

const NewProject = () => {
  const navigate = useNavigate();
  const createVideo = useCreateVideo();
  
  const [formData, setFormData] = useState({
    transcript: '',
    videoTitle: '',
    videoUrl: '',
    channelName: '',
    preferredLanguage: 'es'
  });
  const [validation, setValidation] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear validation when transcript changes
    if (name === 'transcript') {
      setValidation(null);
    }
  };
  
  const validateTranscript = () => {
    if (!formData.transcript.trim()) {
      setValidation({ isValid: false, message: 'El transcript no puede estar vacío' });
      return false;
    }
    
    const wordCount = formData.transcript.trim().split(/\s+/).length;
    
    if (wordCount < 50) {
      setValidation({ 
        isValid: false, 
        message: `El transcript es muy corto (${wordCount} palabras). Mínimo 50 palabras para un análisis efectivo.` 
      });
      return false;
    }
    
    if (wordCount > 10000) {
      setValidation({ 
        isValid: false, 
        message: `El transcript es muy largo (${wordCount} palabras). Máximo 10,000 palabras.` 
      });
      return false;
    }
    
    setValidation({ 
      isValid: true, 
      message: `Transcript válido (${wordCount} palabras). Listo para análisis.`,
      wordCount
    });
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.videoTitle.trim()) {
      alert('Por favor, ingresa el título del video');
      return;
    }
    
    if (!validateTranscript()) {
      alert('Por favor, ingresa un transcript válido');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Convert transcript string to array format expected by AI analysis
      const transcriptArray = formData.transcript
        .split(/[.!?]+/)
        .filter(sentence => sentence.trim().length > 0)
        .map((sentence, index) => ({
          id: index + 1,
          text: sentence.trim(),
          start: index * 5,
          duration: 5
        }));
      
      // Analyze directly with AI
      const analysis = await analyzeTranscript(transcriptArray, {
        title: formData.videoTitle,
        channel: formData.channelName
      });
      
      // Create video with analysis results (no project needed)
      const videoData = {
        project_id: null, // No project
        title: formData.videoTitle,
        channel: formData.channelName || 'Canal Desconocido',
        url: formData.videoUrl || null,
        transcript: formData.transcript,
        status: 'completed',
        summary: JSON.stringify(analysis.summary)
      };
      
      const video = await createVideo.mutateAsync(videoData);
      
      // Save techniques to database
      for (const technique of analysis.techniques) {
        try {
          // Check if technique already exists
          const { data: existingTechniques } = await supabase
            .from('techniques')
            .select('id')
            .eq('name', technique.name)
            .eq('category', technique.category)
            .limit(1);
          
          let techniqueId;
          
          if (existingTechniques && existingTechniques.length > 0) {
            techniqueId = existingTechniques[0].id;
          } else {
            // Create new technique
            const { data: newTechnique } = await supabase
              .from('techniques')
              .insert([{
                name: technique.name,
                category: technique.category,
                description: technique.description,
                objective: technique.objective,
                funnel_stage: technique.funnelStage,
                confidence_score: technique.confidence
              }])
              .select()
              .single();
            
            techniqueId = newTechnique.id;
          }
          
          // Link technique to video
          await supabase
            .from('video_techniques')
            .insert([{
              video_id: video.id,
              technique_id: techniqueId,
              evidence: JSON.stringify(technique.evidence),
              confidence_score: technique.confidence
            }]);
          
        } catch (error) {
          console.error('Error saving technique:', error);
        }
      }
      
      // Navigate to video detail to show results
      navigate(`/video/${video.id}`);
      
    } catch (error) {
      console.error('Error creating analysis:', error);
      alert(`Error: ${error.message || 'No se pudo completar el análisis'}`);
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="card">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Analizar Transcript</h2>
          <p className="text-gray-600">Pega el transcript de tu video y obtén un análisis completo de técnicas de marketing</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Video Information */}
          <div className="space-y-6">
            <div>
              <label htmlFor="videoTitle" className="block text-sm font-semibold text-gray-700 mb-2">
                Título del Video *
              </label>
              <input
                type="text"
                id="videoTitle"
                name="videoTitle"
                value={formData.videoTitle}
                onChange={handleInputChange}
                placeholder="Ej: 10 Estrategias de Marketing que Funcionan en 2024"
                className="input input-lg"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="channelName" className="block text-sm font-semibold text-gray-700 mb-2">
                  Canal/Creador
                </label>
                <input
                  type="text"
                  id="channelName"
                  name="channelName"
                  value={formData.channelName}
                  onChange={handleInputChange}
                  placeholder="Ej: Marketing Pro"
                  className="input"
                />
              </div>
              
              <div>
                <label htmlFor="videoUrl" className="block text-sm font-semibold text-gray-700 mb-2">
                  URL del Video (Opcional)
                </label>
                <input
                  type="url"
                  id="videoUrl"
                  name="videoUrl"
                  value={formData.videoUrl}
                  onChange={handleInputChange}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="input"
                />
              </div>
            </div>
          </div>
          
          {/* Transcript */}
          <div>
            <label htmlFor="transcript" className="block text-sm font-semibold text-gray-700 mb-2">
              Transcript del Video *
            </label>
            <textarea
              id="transcript"
              name="transcript"
              value={formData.transcript}
              onChange={handleInputChange}
              onBlur={validateTranscript}
              placeholder={`Pega aquí el transcript completo del video...

Ejemplo:
Bienvenidos a este video donde vamos a hablar de las 10 estrategias de marketing más efectivas para 2024. Primero, hablemos de la importancia de crear urgencia en tus ofertas. Solo tienes hasta medianoche para aprovechar esta oportunidad única...`}
              className="textarea"
              rows={16}
              required
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-sm text-gray-500">
                Mínimo 50 palabras, máximo 10,000 palabras
              </p>
              {formData.transcript && (
                <p className="text-sm text-gray-600 font-medium">
                  {formData.transcript.trim().split(/\s+/).length} palabras
                </p>
              )}
            </div>
          </div>
          
          {/* Validation Results */}
          {validation && (
            <div className={`flex items-start gap-3 p-4 rounded-xl border ${
              validation.isValid 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              {validation.isValid ? (
                <CheckCircle className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
              )}
              <div>
                <p className={`font-semibold ${
                  validation.isValid ? 'text-green-800' : 'text-red-800'
                }`}>
                  {validation.isValid ? '✨ Transcript Válido' : '⚠️ Transcript Inválido'}
                </p>
                <p className={`text-sm mt-1 ${
                  validation.isValid ? 'text-green-700' : 'text-red-700'
                }`}>
                  {validation.message}
                </p>
              </div>
            </div>
          )}
          
          {/* Language Selection */}
          <div>
            <label htmlFor="preferredLanguage" className="block text-sm font-semibold text-gray-700 mb-2">
              Idioma del Transcript
            </label>
            <select
              id="preferredLanguage"
              name="preferredLanguage"
              value={formData.preferredLanguage}
              onChange={handleInputChange}
              className="input"
            >
              <option value="es">Español</option>
              <option value="en">Inglés</option>
              <option value="auto">Detectar automáticamente</option>
            </select>
            <p className="text-sm text-gray-500 mt-1">
              Esto ayuda a la IA a entender mejor el contexto cultural
            </p>
          </div>
          
          {/* Submit Button */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="btn btn-ghost"
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              disabled={isProcessing}
              className="btn btn-primary btn-lg"
            >
              {isProcessing ? (
                <>
                  <div className="loading" />
                  Analizando con IA...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Analizar Transcript
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewProject;