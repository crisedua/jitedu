# Marketing Transcript Analyzer

Una aplicación web para analistas de marketing y creadores de contenido que permite analizar transcripts de videos con IA para identificar estrategias y tácticas de marketing, crecimiento y ventas.

## 🚀 Características Principales

### Análisis Directo de Transcripts
- **Entrada simple**: Pega el transcript completo de cualquier video
- **Validación inteligente**: Verifica longitud (50-10,000 palabras) y formato
- **Análisis inmediato**: Resultados en segundos con IA avanzada
- **Sin complejidad**: No necesitas gestionar proyectos, solo analiza y obtén resultados

### Análisis con IA (Claude 3.5 Sonnet)
Detecta automáticamente técnicas de marketing en 4 categorías principales:
- **Conversión**: Urgencia, escasez, CTAs, manejo de objeciones, garantías
- **Credibilidad**: Social proof, autoridad, testimonios, datos y evidencia
- **Engagement**: Hooks, storytelling, pattern interrupts, preguntas retóricas
- **Awareness**: Posicionamiento, propuesta de valor, diferenciación

### Base de Datos Interna
- **Videos**: Metadata, transcripts, análisis y técnicas detectadas
- **Técnicas**: Fichas reutilizables con evidencia, timestamps y ejemplos
- **Proyectos**: Colecciones organizadas de videos para análisis específicos
- **Tags**: Sistema de etiquetado para organización avanzada

### Búsqueda y Filtros
- **Búsqueda full-text**: En transcripts, análisis y técnicas
- **Filtros avanzados**: Por categoría, etapa del funnel, confianza, fecha
- **Ordenamiento**: Por relevancia, frecuencia, confianza o fecha

### Exportación
- **CSV/JSON**: Técnicas seleccionadas con toda su metadata
- **Reportes**: Resúmenes ejecutivos de proyectos completos

## 🛠️ Stack Tecnológico

- **Frontend**: React 18 + React Router + TanStack Query
- **Backend**: Supabase (PostgreSQL + Real-time)
- **IA**: OpenRouter API con Claude 3.5 Sonnet
- **UI**: CSS personalizado con sistema de diseño moderno
- **Iconos**: Lucide React

## 📦 Instalación

1. **Clona el repositorio**
```bash
git clone <repository-url>
cd youtube-marketing-analyzer
```

2. **Instala dependencias**
```bash
npm install
```

3. **Configura variables de entorno**
```bash
cp .env.example .env
```

Edita `.env` con tus credenciales:
- **Supabase**: URL del proyecto y clave anónima (obtén en https://supabase.com)
- **OpenRouter**: Clave de API para análisis con Claude (obtén en https://openrouter.ai)

4. **Configura Supabase**

Sigue las instrucciones en `SUPABASE_SETUP.md` o ejecuta el script SQL en `supabase-schema.sql` en tu proyecto de Supabase.

5. **Inicia la aplicación**
```bash
npm start
```

La aplicación estará disponible en `http://localhost:3000`

## 🎯 Uso

### Flujo Simplificado

1. **Añade un Transcript**
   - Haz clic en "Nuevo Análisis"
   - Completa la información básica (nombre del proyecto, título del video)
   - Pega el transcript completo (50-10,000 palabras)
   - Configura el idioma si es necesario

2. **Análisis Automático**
   - La IA analiza el transcript inmediatamente
   - Detecta técnicas de marketing en las 4 categorías
   - Extrae evidencia textual con contexto
   - Genera resumen ejecutivo y recomendaciones

3. **Explora Resultados**
   - **Resumen Ejecutivo**: Hallazgos clave y recomendaciones
   - **Técnicas Detectadas**: Lista completa con evidencia
   - **Biblioteca de Técnicas**: Todas las técnicas guardadas
   - **Búsqueda y Filtros**: Encuentra técnicas específicas

4. **Reutiliza el Conocimiento**
   - Todas las técnicas se guardan en tu biblioteca
   - Busca por categoría, etapa del funnel, o palabra clave
   - Compara técnicas entre diferentes videos
   - Exporta técnicas seleccionadas

## 🔧 Configuración

### Modelos de IA Disponibles

La aplicación usa OpenRouter para acceder a múltiples modelos de IA:

- **Claude 3.5 Sonnet** (Recomendado): Mejor balance entre calidad y costo
- **Claude 3 Opus**: Más capaz para análisis complejos
- **GPT-4 Turbo**: Excelente para salida estructurada
- **GPT-4o**: Rápido y económico
- **Gemini Pro 1.5**: Ideal para transcripts muy largos

Cambia el modelo en `.env`:
```bash
REACT_APP_AI_MODEL=anthropic/claude-3.5-sonnet
```

## 📊 Estructura de Datos

### Video
```javascript
{
  id: "uuid",
  youtubeId: "video_id",
  title: "Título del video",
  channel: "Nombre del canal",
  transcript: [
    {
      text: "Texto del segmento",
      start: 0,
      duration: 4.5
    }
  ],
  techniques: ["technique_id_1", "technique_id_2"]
}
```

### Técnica
```javascript
{
  id: "uuid",
  name: "Creación de Urgencia",
  category: "conversion",
  description: "Técnicas para crear presión temporal",
  objective: "Incrementar conversiones",
  funnelStage: "conversion",
  confidence: 0.92,
  evidence: [
    {
      text: "Solo tienes hasta medianoche...",
      timestamp: 125,
      videoId: "video_uuid"
    }
  ]
}
```

## 🚧 Roadmap

- [ ] **Extracción automática de YouTube**: Obtener transcripts directamente de URLs
- [ ] **Análisis por lotes**: Procesar múltiples transcripts simultáneamente
- [ ] **Comparación de videos**: Benchmarking entre diferentes contenidos
- [ ] **Exportación avanzada**: PDF con reportes visuales
- [ ] **Integración con más plataformas**: TikTok, Instagram, LinkedIn
- [ ] **Análisis de audio**: Detección de tono, velocidad, pausas
- [ ] **Colaboración en equipo**: Compartir análisis y técnicas
- [ ] **API pública**: Endpoints para integraciones externas

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🆘 Soporte

- **Documentación**: Ver `SUPABASE_SETUP.md` para configuración de base de datos
- **Issues**: Reporta problemas en GitHub Issues
- **Email**: Contacto para soporte técnico

---

Desarrollado con ❤️ para analistas de marketing y creadores de contenido.