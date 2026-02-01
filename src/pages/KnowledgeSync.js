import React, { useState, useEffect } from 'react';
import { RefreshCw, Trash2, Database } from 'lucide-react';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { supabase } from '../lib/supabase-simple';

const KnowledgeSync = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [status, setStatus] = useState('');
    const [agentId] = useState(process.env.REACT_APP_ELEVENLABS_AGENT_ID);

    // Initialize client
    // Note: explicitly using the key from env. In production, this should be proxied.
    const elevenlabs = new ElevenLabsClient({
        apiKey: process.env.REACT_APP_ELEVENLABS_API_KEY
    });

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const response = await elevenlabs.conversationalAi.knowledgeBase.documents.list();
            setDocuments(response.documents || []);
        } catch (error) {
            console.error('Error fetching documents:', error);
            setStatus(`Error loading documents: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (docId, name) => {
        if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

        try {
            setLoading(true);
            await elevenlabs.conversationalAi.knowledgeBase.documents.delete(docId);
            await fetchDocuments();
            setStatus(`Deleted "${name}"`);
        } catch (error) {
            console.error('Error deleting document:', error);
            setStatus(`Error deleting: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const runSync = async () => {
        try {
            setSyncing(true);
            setStatus('Starting sync...');

            // 1. Fetch completed transcripts from Supabase
            const { data: transcripts, error } = await supabase
                .from('transcripts')
                .select('*')
                .eq('status', 'completed')
                .not('ai_analysis', 'is', null)
                .order('created_at', { ascending: false });

            if (error) throw error;

            setStatus(`Found ${transcripts.length} transcripts. Checking duplicates...`);

            // 2. Prepare for upload
            let addedCount = 0;
            let skippedCount = 0;

            for (const transcript of transcripts) {
                // Simple duplicate check by name (optional)
                const docName = transcript.title || `Transcript ${transcript.id.substring(0, 8)}`;
                const exists = documents.some(d => d.name === docName);

                if (exists) {
                    skippedCount++;
                    continue;
                }

                // Format content
                const content = formatTranscript(transcript);

                setStatus(`Uploading: ${docName}...`);

                // Upload to ElevenLabs
                const doc = await elevenlabs.conversationalAi.knowledgeBase.documents.createFromText({
                    name: docName,
                    text: content
                });

                addedCount++;
                // Small delay to be nice to the API
                await new Promise(r => setTimeout(r, 500));
            }

            // 3. Re-fetch documents to get new IDs
            const updatedDocsResponse = await elevenlabs.conversationalAi.knowledgeBase.documents.list();
            const allDocs = updatedDocsResponse.documents || [];

            // 4. Attach ALL documents to the agent
            if (addedCount > 0) {
                setStatus('Updating agent configuration...');
                const knowledgeBaseConfig = allDocs.map(d => ({
                    id: d.id,
                    name: d.name,
                    type: 'text' // Assuming text for now
                }));

                await elevenlabs.conversationalAi.agents.update(agentId, {
                    conversationConfig: {
                        agent: {
                            prompt: {
                                knowledgeBase: knowledgeBaseConfig
                            }
                        }
                    }
                });
            }

            await fetchDocuments();
            setStatus(`Sync complete! Added ${addedCount} new documents (${skippedCount} skipped).`);

        } catch (error) {
            console.error('Sync failed:', error);
            setStatus(`Sync failed: ${error.message}`);
        } finally {
            setSyncing(false);
        }
    };

    const formatTranscript = (transcript) => {
        let analysis = transcript.ai_analysis;
        if (typeof analysis === 'string') {
            try { analysis = JSON.parse(analysis); } catch (e) { }
        }

        let text = `# ${transcript.title || 'Transcript'}\n\n`;
        if (analysis?.summary) text += `## Summary\n${analysis.summary}\n\n`;
        if (analysis?.keyInsights) text += `## Key Insights\n${(analysis.keyInsights || []).join('\n- ')}\n\n`;

        // Truncate original text if needed (limit ~20k chars usually safe for API)
        const excerpt = transcript.transcript_text?.substring(0, 15000) || '';
        text += `## Content\n${excerpt}`;

        return text;
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Database className="w-6 h-6 text-blue-600" />
                    ElevenLabs Knowledge Base
                </h1>
                <p className="text-gray-600 mt-1">
                    Manage the knowledge base for your voice agent (Agent ID: {agentId})
                </p>
            </div>

            {/* Sync Actions */}
            <div className="card bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Sync with Database</h2>
                        <p className="text-sm text-gray-500">
                            Upload completed transcripts from Supabase to your agent
                        </p>
                    </div>
                    <button
                        onClick={runSync}
                        disabled={syncing || loading}
                        className={`btn ${syncing ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white px-4 py-2 rounded-lg flex items-center gap-2`}
                    >
                        <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                        {syncing ? 'Syncing...' : 'Sync Transcripts'}
                    </button>
                </div>
                {status && (
                    <div className="mt-4 p-3 bg-gray-50 text-sm text-gray-700 rounded border border-gray-200">
                        {status}
                    </div>
                )}
            </div>

            {/* Documents List */}
            <div className="card bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Documents ({documents.length})
                    </h2>
                    <button
                        onClick={fetchDocuments}
                        disabled={loading}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>

                {loading && documents.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">Loading documents...</div>
                ) : documents.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No documents found in Knowledge Base.
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {documents.map((doc) => (
                            <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded">
                                        <Database className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900">{doc.name}</h3>
                                        <p className="text-xs text-gray-500 font-mono">{doc.id}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDelete(doc.id, doc.name)}
                                    className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"
                                    title="Delete document"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default KnowledgeSync;
