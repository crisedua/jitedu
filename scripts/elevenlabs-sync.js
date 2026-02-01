/**
 * ElevenLabs Knowledge Base Sync Script
 * 
 * Syncs completed transcripts from Supabase to ElevenLabs Knowledge Base
 * Run with: npm run sync:knowledge
 */

const { ElevenLabsClient } = require('@elevenlabs/elevenlabs-js');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuration
const config = {
    elevenlabs: {
        apiKey: process.env.ELEVENLABS_API_KEY,
        agentId: process.env.ELEVENLABS_AGENT_ID,
    },
    supabase: {
        url: process.env.REACT_APP_SUPABASE_URL,
        anonKey: process.env.REACT_APP_SUPABASE_ANON_KEY,
    }
};

// Validate configuration
function validateConfig() {
    const missing = [];
    if (!config.elevenlabs.apiKey) missing.push('ELEVENLABS_API_KEY');
    if (!config.elevenlabs.agentId) missing.push('ELEVENLABS_AGENT_ID');
    if (!config.supabase.url) missing.push('REACT_APP_SUPABASE_URL');
    if (!config.supabase.anonKey) missing.push('REACT_APP_SUPABASE_ANON_KEY');

    if (missing.length > 0) {
        console.error('❌ Missing environment variables:', missing.join(', '));
        console.error('Please add them to your .env file');
        process.exit(1);
    }
}

// Initialize clients
validateConfig();
const elevenlabs = new ElevenLabsClient({ apiKey: config.elevenlabs.apiKey });
const supabase = createClient(config.supabase.url, config.supabase.anonKey);

/**
 * Fetch all completed transcripts with AI analysis from Supabase
 */
async function fetchCompletedTranscripts() {
    console.log('📥 Fetching transcripts from Supabase...');

    const { data, error } = await supabase
        .from('transcripts')
        .select('id, title, transcript_text, ai_analysis, created_at')
        .eq('status', 'completed')
        .not('ai_analysis', 'is', null)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('❌ Error fetching transcripts:', error.message);
        return [];
    }

    console.log(`✅ Found ${data.length} completed transcripts`);
    return data;
}

/**
 * Format a transcript into a knowledge document
 */
function formatTranscriptAsDocument(transcript) {
    const { title, transcript_text, ai_analysis, created_at } = transcript;

    // Parse AI analysis if it's a string
    let analysis = ai_analysis;
    if (typeof ai_analysis === 'string') {
        try {
            analysis = JSON.parse(ai_analysis);
        } catch (e) {
            analysis = { summary: ai_analysis };
        }
    }

    // Build document content
    let content = `# ${title || 'Untitled Transcript'}\n`;
    content += `Date: ${new Date(created_at).toLocaleDateString()}\n\n`;

    // Add AI analysis sections
    if (analysis) {
        if (analysis.summary) {
            content += `## Summary\n${analysis.summary}\n\n`;
        }
        if (analysis.keyInsights && Array.isArray(analysis.keyInsights)) {
            content += `## Key Insights\n${analysis.keyInsights.map(i => `- ${i}`).join('\n')}\n\n`;
        }
        if (analysis.painPoints && Array.isArray(analysis.painPoints)) {
            content += `## Pain Points\n${analysis.painPoints.map(p => `- ${p}`).join('\n')}\n\n`;
        }
        if (analysis.recommendations && Array.isArray(analysis.recommendations)) {
            content += `## Recommendations\n${analysis.recommendations.map(r => `- ${r}`).join('\n')}\n\n`;
        }
    }

    // Add transcript excerpt (limit to avoid exceeding size limits)
    const maxExcerpt = 3000;
    const excerpt = transcript_text.length > maxExcerpt
        ? transcript_text.substring(0, maxExcerpt) + '...'
        : transcript_text;
    content += `## Original Transcript\n${excerpt}\n`;

    return content;
}

/**
 * Upload a document to ElevenLabs Knowledge Base
 */
async function uploadDocument(name, content) {
    try {
        console.log(`  📤 Uploading: ${name}`);

        const doc = await elevenlabs.conversationalAi.knowledgeBase.documents.createFromText({
            text: content,
            name: name
        });

        console.log(`  ✅ Uploaded: ${doc.id}`);
        return doc;
    } catch (error) {
        console.error(`  ❌ Error uploading ${name}:`, error.message);
        return null;
    }
}

/**
 * Attach documents to the ElevenLabs agent
 */
async function attachDocumentsToAgent(documents) {
    console.log(`\n🔗 Attaching ${documents.length} documents to agent...`);

    try {
        const knowledgeBase = documents.map(doc => ({
            type: 'text',
            name: doc.name,
            id: doc.id
        }));

        await elevenlabs.conversationalAi.agents.update(config.elevenlabs.agentId, {
            conversationConfig: {
                agent: {
                    prompt: {
                        knowledgeBase: knowledgeBase
                    }
                }
            }
        });

        console.log('✅ Documents attached to agent successfully!');
    } catch (error) {
        console.error('❌ Error attaching documents:', error.message);
    }
}

/**
 * Add a URL to the knowledge base
 */
async function addUrlToKnowledgeBase(url, name) {
    console.log(`📥 Adding URL: ${url}`);

    try {
        const doc = await elevenlabs.conversationalAi.knowledgeBase.documents.createFromUrl({
            url: url,
            name: name || `Website: ${url}`
        });

        console.log(`✅ URL added: ${doc.id}`);
        return doc;
    } catch (error) {
        console.error(`❌ Error adding URL:`, error.message);
        return null;
    }
}

/**
 * Main sync function
 */
async function syncKnowledgeBase() {
    console.log('🚀 Starting ElevenLabs Knowledge Base Sync\n');
    console.log(`Agent ID: ${config.elevenlabs.agentId}\n`);

    // Fetch transcripts
    const transcripts = await fetchCompletedTranscripts();

    if (transcripts.length === 0) {
        console.log('ℹ️  No transcripts to sync');
        return;
    }

    // Upload each transcript
    console.log('\n📤 Uploading documents to ElevenLabs...');
    const uploadedDocs = [];

    for (const transcript of transcripts) {
        const name = transcript.title || `Transcript ${transcript.id.substring(0, 8)}`;
        const content = formatTranscriptAsDocument(transcript);
        const doc = await uploadDocument(name, content);

        if (doc) {
            uploadedDocs.push(doc);
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Attach to agent
    if (uploadedDocs.length > 0) {
        await attachDocumentsToAgent(uploadedDocs);
    }

    console.log('\n✨ Sync complete!');
    console.log(`   Uploaded: ${uploadedDocs.length} documents`);
    console.log(`   Failed: ${transcripts.length - uploadedDocs.length} documents`);
}

// Export for use as module
module.exports = { syncKnowledgeBase, addUrlToKnowledgeBase };

// Run if called directly
if (require.main === module) {
    syncKnowledgeBase().catch(console.error);
}
