// Script to link all existing transcripts to DESPEGUE agent
// Run this in your browser console or as a Node.js script

import { supabase } from '../src/lib/supabase-simple.js';

async function linkAllTranscriptsToDespegue() {
  try {
    console.log('🚀 Starting to link transcripts to DESPEGUE...');

    // Step 1: Get DESPEGUE expert
    const { data: experts, error: expertError } = await supabase
      .from('experts')
      .select('id, name')
      .eq('slug', 'despegue')
      .single();

    if (expertError || !experts) {
      console.error('❌ DESPEGUE expert not found. Please run supabase-despegue-schema.sql first.');
      return;
    }

    console.log(`✅ Found expert: ${experts.name} (${experts.id})`);

    // Step 2: Get all transcripts
    const { data: transcripts, error: transcriptsError } = await supabase
      .from('transcripts')
      .select('id, title');

    if (transcriptsError) {
      console.error('❌ Error fetching transcripts:', transcriptsError);
      return;
    }

    console.log(`📝 Found ${transcripts.length} transcripts`);

    // Step 3: Link each transcript to DESPEGUE
    let linked = 0;
    let skipped = 0;

    for (const transcript of transcripts) {
      // Check if already linked
      const { data: existing } = await supabase
        .from('expert_transcripts')
        .select('id')
        .eq('expert_id', experts.id)
        .eq('transcript_id', transcript.id)
        .single();

      if (existing) {
        console.log(`⏭️  Skipping "${transcript.title}" - already linked`);
        skipped++;
        continue;
      }

      // Link transcript to DESPEGUE
      const { error: linkError } = await supabase
        .from('expert_transcripts')
        .insert({
          expert_id: experts.id,
          transcript_id: transcript.id,
          relevance_score: 1.0
        });

      if (linkError) {
        console.error(`❌ Error linking "${transcript.title}":`, linkError);
      } else {
        console.log(`✅ Linked "${transcript.title}"`);
        linked++;
      }
    }

    console.log('\n🎉 Done!');
    console.log(`✅ Linked: ${linked} transcripts`);
    console.log(`⏭️  Skipped: ${skipped} transcripts (already linked)`);
    console.log(`📊 Total: ${transcripts.length} transcripts`);

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
linkAllTranscriptsToDespegue();
