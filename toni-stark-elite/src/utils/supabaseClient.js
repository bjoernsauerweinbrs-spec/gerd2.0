import { createClient } from '@supabase/supabase-js/dist/index.mjs';

// SETUP: Replace these with your actual Supabase project credentials
const supabaseUrl = 'https://zdqfqmylltghlzlnpclw.supabase.co';
const supabaseKey = 'sb_publishable_gYn-tPV0giYuAP__Q301FQ_tNTaNAmL';

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * TRAINER: Speichert einen generierten Trainingsplan in Supabase.
 * @param {Object} planData - { title, markdown_content, tactic_json, visibility }
 */
export const savePlan = async (planData) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        console.error("No authenticated user found.");
        return { error: "Nicht authentifiziert." };
    }

    const { data, error } = await supabase
        .from('training_plans')
        .insert([
            {
                author_id: user.id,
                title: planData.title,
                markdown_content: planData.markdownContent || planData.markdown_content,
                tactic_json: planData.tacticJson || planData.tactic_json,
                visibility: planData.visibility || 'private'
            }
        ])
        .select();

    if (error) {
        console.error("Error saving plan:", error.message);
        return { error: error.message };
    }

    return { success: true, data };
};

/**
 * ELTERN: Lädt alle freigegebenen Pläne für das Team.
 * @returns {Array} - Liste der Training-Plans
 */
export const fetchTeamPlans = async () => {
    const { data, error } = await supabase
        .from('training_plans')
        .select('*')
        .in('visibility', ['team_parents', 'public'])
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching plans:", error.message);
        return [];
    }

    return data;
};

/**
 * MESSAGES: Sendet eine Nachricht zu einem spezifischen Plan.
 */
export const sendMessage = async (planId, messageText) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Nicht authentifiziert" };

    const { data, error } = await supabase
        .from('messages')
        .insert([
            {
                plan_id: planId,
                sender_id: user.id,
                message_text: messageText
            }
        ]);

    if (error) return { error: error.message };
    return { success: true, data };
};
