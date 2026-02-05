# Guía: Vincular Transcripts Existentes a DESPEGUE

Después de crear el agente DESPEGUE, necesitas vincular todos tus transcripts existentes para que el agente pueda acceder a ellos.

## Opción 1: SQL Directo (Más Rápido) ⚡

Copia y pega esto en tu **Supabase SQL Editor**:

```sql
-- Vincular todos los transcripts a DESPEGUE
INSERT INTO expert_transcripts (expert_id, transcript_id, relevance_score)
SELECT 
  (SELECT id FROM experts WHERE slug = 'despegue' LIMIT 1) as expert_id,
  t.id as transcript_id,
  1.0 as relevance_score
FROM transcripts t
WHERE NOT EXISTS (
  SELECT 1 FROM expert_transcripts et 
  WHERE et.expert_id = (SELECT id FROM experts WHERE slug = 'despegue' LIMIT 1)
  AND et.transcript_id = t.id
);

-- Verificar cuántos transcripts están vinculados
SELECT 
  e.name as expert_name,
  e.slug,
  COUNT(et.transcript_id) as total_transcripts
FROM experts e
LEFT JOIN expert_transcripts et ON e.id = et.expert_id
WHERE e.slug = 'despegue'
GROUP BY e.name, e.slug;
```

**Resultado esperado:**
```
expert_name | slug      | total_transcripts
------------|-----------|------------------
DESPEGUE    | despegue  | 25
```

---

## Opción 2: Desde la Consola del Navegador 🌐

1. Abre tu app en el navegador
2. Abre la consola de desarrollador (F12)
3. Copia y pega este código:

```javascript
// Vincular todos los transcripts a DESPEGUE
async function linkAllToDespegue() {
  const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
  
  const supabase = createClient(
    'TU_SUPABASE_URL',  // Reemplaza con tu URL
    'TU_SUPABASE_ANON_KEY'  // Reemplaza con tu key
  );

  // Obtener DESPEGUE
  const { data: expert } = await supabase
    .from('experts')
    .select('id')
    .eq('slug', 'despegue')
    .single();

  if (!expert) {
    console.error('❌ DESPEGUE no encontrado');
    return;
  }

  // Obtener todos los transcripts
  const { data: transcripts } = await supabase
    .from('transcripts')
    .select('id, title');

  console.log(`📝 Encontrados ${transcripts.length} transcripts`);

  // Vincular cada uno
  for (const t of transcripts) {
    await supabase
      .from('expert_transcripts')
      .upsert({
        expert_id: expert.id,
        transcript_id: t.id,
        relevance_score: 1.0
      });
    console.log(`✅ Vinculado: ${t.title}`);
  }

  console.log('🎉 ¡Completado!');
}

linkAllToDespegue();
```

---

## Opción 3: Automático para Nuevos Transcripts ✨

Los nuevos transcripts se vincularán automáticamente cuando los agregues desde la interfaz. El código ya está configurado en `AddTranscript.js`:

```javascript
// Esto ya está en tu código
await autoAssignTranscriptToExperts(savedTranscript.id, transcript, analysis);
```

---

## Verificar que Funciona

Después de vincular los transcripts, verifica en tu app:

1. Selecciona DESPEGUE en el selector de expertos
2. Haz una pregunta relacionada con tus transcripts
3. DESPEGUE debería responder usando información de tus transcripts

**Ejemplo:**
- Pregunta: "¿Qué técnicas de validación mencionan los transcripts?"
- DESPEGUE debería responder con información específica de tus transcripts

---

## Troubleshooting

### ❌ "No transcripts found"
- Verifica que corriste el SQL correctamente
- Revisa que la tabla `expert_transcripts` existe
- Confirma que DESPEGUE existe en la tabla `experts`

### ❌ "DESPEGUE no responde con información de transcripts"
- Verifica la vinculación con el SQL de verificación
- Revisa que `relevance_score` sea mayor a 0
- Confirma que los transcripts tienen contenido

### ❌ Error de permisos
- Verifica que las políticas RLS estén configuradas
- Confirma que tienes acceso a las tablas en Supabase

---

## Resumen

**Pasos rápidos:**
1. ✅ Crear DESPEGUE en Supabase (`supabase-despegue-schema.sql`)
2. ✅ Vincular transcripts existentes (SQL de arriba)
3. ✅ Configurar Agent ID de ElevenLabs
4. ✅ Probar en la app

¡Listo! 🚀
