import sys

with open('/Users/bjoernsauerwein/Toni2.0 Antigravity/main.js', 'r') as f:
    text = f.read()

# 1. Add initDeepDiveModals() to DOMContentLoaded
old_init = """document.addEventListener('DOMContentLoaded', () => {
    init2D();
    initManagementSync();
    initAICoachAdvisor(); // V75 call"""
new_init = """document.addEventListener('DOMContentLoaded', () => {
    init2D();
    initManagementSync();
    initAICoachAdvisor(); // V75 call
    initDeepDiveModals(); // V79 call"""
text = text.replace(old_init, new_init)

# 2. Append Logic for System Personas, Modals, and Voice Synthesis
v79_logic = """

// --- V79 DEEP-DIVE MODALS & ROLE INJECTION ENGINE ---

function initDeepDiveModals() {
    const launchers = document.querySelectorAll('.launcher-btn');
    const closeBtns = document.querySelectorAll('.close-modal');
    const tabBtns = document.querySelectorAll('.tab-btn');

    // Open Modals & Inject Persona
    launchers.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const role = btn.getAttribute('data-role');
            const targetModal = document.getElementById(targetId);
            
            if (targetModal) {
                targetModal.classList.remove('hidden');
            }
            if (role) {
                switchPersona(role);
            }
        });
    });

    // Close Modals
    closeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.deep-dive-window');
            if (modal) modal.classList.add('hidden');
        });
    });

    // Close on click outside modal-content
    document.querySelectorAll('.deep-dive-window').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    });

    // Tab Switching Logic
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Find parent modal
            const modal = btn.closest('.deep-dive-window');
            if (!modal) return;

            // Remove active from all tabs inside this modal
            modal.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            modal.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active', 'hidden'));
            
            // Add active to clicked tab
            btn.classList.add('active');
            
            // Hide all tab content
            modal.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
            
            // Show target
            const tabId = btn.getAttribute('data-tab');
            const targetContent = document.getElementById(tabId);
            if (targetContent) {
                targetContent.classList.remove('hidden');
                targetContent.classList.add('active');
            }
        });
    });
}

function switchPersona(role) {
    const iconEl = document.getElementById('ai-persona-icon');
    const textEl = document.getElementById('ai-persona-text');
    const vrAmbient = document.querySelector('a-light[type="ambient"]');
    const sky = document.querySelector('a-sky');

    let personaConfig = {
        icon: '👨‍💼',
        name: 'AI STATUS: GENERAL',
        color: '#00ffff',
        greeting: 'System standby.'
    };

    switch(role) {
        case 'cmo':
            personaConfig = {
                icon: '🩺',
                name: 'AI STATUS: CHIEF MEDICAL ANALYST',
                color: '#0088ff', // Deep Blue
                greeting: "Coach, CMO here. I'm monitoring the biometrics. Player Fettanalyse and Heart Rates look stable."
            };
            break;
        case 'tactics':
            personaConfig = {
                icon: '📋',
                name: 'AI STATUS: TACTICAL ANALYST',
                color: '#00ff00', // Pitch Green
                greeting: "Tactical Analyst online. Analyzing spacing and expected goals for the next drill."
            };
            break;
        case 'academy':
            personaConfig = {
                icon: '🎓',
                name: 'AI STATUS: ACADEMY DIRECTOR',
                color: '#00ff88', // Green-Cyan
                greeting: "Academy Director syncing. We are prioritizing pedagogical development and Funino metrics today."
            };
            break;
        case 'management':
            personaConfig = {
                icon: '💼',
                name: 'AI STATUS: DIRECTOR OF FOOTBALL',
                color: '#ff00ff', // Executive Gold/Cyan (using Magenta for existing scheme match)
                greeting: "Director of Football active. Sponsoring reach is currently up 14%."
            };
            break;
    }

    // Apply UI Updates
    if (iconEl) iconEl.innerText = personaConfig.icon;
    if (textEl) textEl.innerText = personaConfig.name;
    
    const indicator = document.getElementById('ai-persona-indicator');
    if (indicator) {
        indicator.style.color = personaConfig.color;
        indicator.style.borderColor = personaConfig.color;
        indicator.style.boxShadow = `0 0 10px ${personaConfig.color}40`;
    }

    // VR Atmosphere Shift
    if (vrAmbient && window.vrReady) {
        // Shift light slightly towards persona color
        vrAmbient.setAttribute('color', personaConfig.color);
    }
    
    // Trigger TTS
    speakAlert(personaConfig.greeting, role);
}

// --- V79 TEXT-TO-SPEECH (TTS) ENGINE ---
let synth = null;
if ('speechSynthesis' in window) {
    synth = window.speechSynthesis;
}

function speakAlert(text, role) {
    if (!synth) return;
    
    if (synth.speaking) {
        synth.cancel(); // Interrupt previous
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Try to find a good voice
    const voices = synth.getVoices();
    let selectedVoice = voices.find(v => v.lang.includes('en-US')) || voices[0];
    
    // Tonal adjustments based on role
    utterance.voice = selectedVoice;
    
    if (role === 'cmo') {
        utterance.rate = 1.0;
        utterance.pitch = 0.9; // Clinical, precise
    } else if (role === 'academy') {
        utterance.rate = 1.05;
        utterance.pitch = 1.1; // Encouraging
    } else {
        utterance.rate = 1.0;
        utterance.pitch = 1.0; 
    }

    synth.speak(utterance);
}
"""

if "function initDeepDiveModals()" not in text:
    text += v79_logic

with open('/Users/bjoernsauerwein/Toni2.0 Antigravity/main.js', 'w') as f:
    f.write(text)

print("main.js updated with Modals, Persona logic, and TTS.")
