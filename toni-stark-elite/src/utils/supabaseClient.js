import { createClient } from '@supabase/supabase-js';

// SETUP: Replace these with your actual Supabase project credentials
const supabaseUrl = 'https://zdqfqmylltghlzlnpclw.supabase.co';
const supabaseKey = 'sb_publishable_gYn-tPV0giYuAP__Q301FQ_tNTaNAmL';

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * TRAINER: Speichert einen generierten Trainingsplan in Supabase.
 */
export const savePlan = async (planData) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Nicht authentifiziert." };

    const { data, error } = await supabase
        .from('training_plans')
        .insert([
            {
                author_id: user.id,
                title: planData.title,
                markdown_content: planData.markdownContent || planData.markdown_content,
                tactic_json: planData.tactic_json || planData.tacticJson,
                visibility: planData.visibility || 'private'
            }
        ])
        .select();

    if (error) return { error: error.message };
    return { success: true, data };
};

/**
 * LOGISTICS: Speichert/Update Einträge im Logistics Ledger.
 */
export const saveLogisticsEntry = async (entry) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    // For local testing without full auth, we might bypass user.id if needed
    // but sticking to standard flow here.
    const { data, error } = await supabase
        .from('logistics_ledger')
        .upsert([
            {
                id: entry.id, // for updates
                requester_id: user?.id,
                item_name: entry.itemName || entry.item_name,
                amount: entry.amount || 0,
                type: entry.type || 'expense',
                category: entry.category || 'material',
                status: entry.status || 'requested',
                ai_offer_json: entry.aiOfferJson || entry.ai_offer_json,
                sponsor_inquiry_text: entry.sponsorInquiryText || entry.sponsor_inquiry_text
            }
        ])
        .select();

    if (error) return { error: error.message };
    return { success: true, data };
};

/**
 * LOGISTICS: Lädt alle Einträge.
 */
export const fetchLogistics = async () => {
    const { data, error } = await supabase
        .from('logistics_ledger')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) return [];
    return data;
};

/**
 * MESSAGES: Send a new message.
 */
export const sendMessage = async (message) => {
    const { data, error } = await supabase
        .from('messages')
        .insert([
            {
                sender_id: message.sender_id,
                plan_id: message.plan_id,
                message_text: message.messageText || message.content || message.message_text
            }
        ])
        .select();

    if (error) {
        console.error("Supabase sendMessage error:", error);
        return false;
    }
    return true;
};

/**
 * MESSAGES: Fetch message history between two parties.
 */
export const fetchMessages = async (planId) => {
    const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('plan_id', planId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error("Supabase fetchMessages error:", error);
        return [];
    }
    return data;
};

/**
 * MESSAGES: Real-time Message Subscription.
 */
export const subscribeToMessages = (callback) => {
    return supabase
        .channel('public:messages')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, callback)
        .subscribe();
};
