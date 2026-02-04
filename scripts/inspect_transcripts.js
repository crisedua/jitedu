
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspect() {
    const { data, error } = await supabase
        .from('transcripts')
        .select('title, transcript_text')
        .limit(5)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log('--- Latest Transcripts ---');
    data.forEach(t => {
        console.log(`Title: ${t.title}`);
        console.log(`Preview: ${t.transcript_text.substring(0, 100)}...`);
        console.log('---');
    });
}

inspect();
