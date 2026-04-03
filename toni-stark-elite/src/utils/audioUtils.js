/**
 * Centralized Audio Utilities for Gerd 2.0
 * Focus: High-fidelity male voice selection across all platforms.
 */

/**
 * Finds the best available male German voice.
 * @returns {SpeechSynthesisVoice | null}
 */
export const getGerdVoice = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return null;
    
    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) return null;

    const germanVoices = voices.filter(v => v.lang.startsWith('de'));
    
    // Priority 1: Specifically known high-quality male voices
    const malePriorityNames = [
        "markus", "stefan", "klaus", "daniel", "yannick", 
        "google deutsch", "microsoft stefan", "microsoft lutz",
        "male", "mann"
    ];

    for (const name of malePriorityNames) {
        const found = germanVoices.find(v => v.name.toLowerCase().includes(name));
        if (found) return found;
    }

    // Priority 2: Any German voice as fallback
    return germanVoices[0] || voices[0];
};

/**
 * Standardized speak function for Gerd.
 * @param {string} text 
 * @param {object} options { pitch, rate, onEnd }
 */
export const speakGerd = (text, options = {}) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    // Cancel current speech to avoid overlap
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "de-DE";
    
    const voice = getGerdVoice();
    if (voice) {
        utterance.voice = voice;
    }

    utterance.pitch = options.pitch || 0.85; // Default slightly deeper for authority
    utterance.rate = options.rate || 0.95;   // Default slightly slower for clarity
    
    if (options.onEnd) {
        utterance.onend = options.onEnd;
    }

    window.speechSynthesis.speak(utterance);
};

/**
 * Helper to ensure voices are loaded (some browsers load them async)
 */
export const ensureVoicesLoaded = (callback) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    
    if (window.speechSynthesis.getVoices().length > 0) {
        callback();
    } else {
        window.speechSynthesis.onvoiceschanged = () => {
            callback();
        };
    }
};
