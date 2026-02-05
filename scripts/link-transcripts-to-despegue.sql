-- Link all existing transcripts to DESPEGUE agent
-- Run this in Supabase SQL Editor after creating the DESPEGUE expert

-- First, get the DESPEGUE expert ID
DO $$
DECLARE
  despegue_id UUID;
BEGIN
  -- Get DESPEGUE expert ID
  SELECT id INTO despegue_id FROM experts WHERE slug = 'despegue' LIMIT 1;
  
  IF despegue_id IS NULL THEN
    RAISE EXCEPTION 'DESPEGUE expert not found. Please run supabase-despegue-schema.sql first.';
  END IF;
  
  -- Link all transcripts to DESPEGUE with relevance score 1.0
  INSERT INTO expert_transcripts (expert_id, transcript_id, relevance_score)
  SELECT 
    despegue_id,
    t.id,
    1.0
  FROM transcripts t
  WHERE NOT EXISTS (
    SELECT 1 FROM expert_transcripts et 
    WHERE et.expert_id = despegue_id 
    AND et.transcript_id = t.id
  );
  
  RAISE NOTICE 'Successfully linked all transcripts to DESPEGUE';
END $$;

-- Verify the links
SELECT 
  e.name as expert_name,
  COUNT(et.transcript_id) as linked_transcripts
FROM experts e
LEFT JOIN expert_transcripts et ON e.id = et.expert_id
WHERE e.slug = 'despegue'
GROUP BY e.name;
