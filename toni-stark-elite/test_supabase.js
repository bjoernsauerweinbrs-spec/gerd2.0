import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zdqfqmylltghlzlnpclw.supabase.co';
const supabaseKey = 'sb_publishable_gYn-tPV0giYuAP__Q301FQ_tNTaNAmL';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    console.log("Checking Supabase Tables...");
    
    const { data: plans, error: plansErr } = await supabase.from('training_plans').select('*').limit(1);
    console.log("training_plans:", plansErr ? plansErr.message : "OK (" + (plans ? plans.length : 0) + " samples)");

    const { data: logistics, error: logisticsErr } = await supabase.from('logistics_ledger').select('*').limit(1);
    console.log("logistics_ledger:", logisticsErr ? logisticsErr.message : "OK (" + (logistics ? logistics.length : 0) + " samples)");

    const { data: messages, error: messagesErr } = await supabase.from('messages').select('*').limit(1);
    console.log("messages:", messagesErr ? messagesErr.message : "OK (" + (messages ? messages.length : 0) + " samples)");
    
    if (messagesErr) {
        console.log("Detailed Messages Error:", messagesErr);
    }
}

testConnection();
