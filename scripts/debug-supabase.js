
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('Testing Supabase Connection...');
console.log('URL:', supabaseUrl);
console.log('Key length:', supabaseKey ? supabaseKey.length : 0);

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    try {
        const { data, error } = await supabase.from('transcripts').select('count', { count: 'exact', head: true });
        if (error) {
            console.error('❌ Supabase error:', error);
        } else {
            console.log('✅ Connection successful! Transcripts count:', data);
        }
    } catch (err) {
        console.error('❌ Unexpected error:', err);
    }
}

testConnection();
