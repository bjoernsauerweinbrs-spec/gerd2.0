import sys

with open('/Users/bjoernsauerwein/Toni2.0 Antigravity/main.js', 'r') as f:
    text = f.read()

v75_code = """            // V75 Module 5: Voice Back-End Interpretation
            // If the coach mentions weak-foot or Funino, auto-generate the pitch
            if (cmdText.includes('WEAK-FOOT') || cmdText.includes('FUNINO') || cmdText.includes('WEAK FOOT')) {
                const btnFunino = document.getElementById('btn-2d-funino');
                if (btnFunino) btnFunino.click(); // Trigger the 2D/VR Funino layout swap

                // Add contextual AI response to log
                setTimeout(() => {
                    const aiSpan = document.createElement('span');
                    aiSpan.textContent = `> AI: GENERATING FUNINO LAYOUT FOR WEAK-FOOT FOCUS...`;
                    aiSpan.style.color = 'var(--accent-cyan)';
                    logTranscription.appendChild(aiSpan);
                    logTranscription.scrollTop = logTranscription.scrollHeight;
                }, 800);
            }

            // Clear input
            inputVoiceCmd.value = '';"""

v76_code = """            // V75 Module 5: Voice Back-End Interpretation
            if (cmdText.includes('WEAK-FOOT') || cmdText.includes('FUNINO') || cmdText.includes('WEAK FOOT')) {
                const btnFunino = document.getElementById('btn-2d-funino');
                if (btnFunino) btnFunino.click(); // Trigger the 2D/VR Funino layout swap

                setTimeout(() => {
                    const aiSpan = document.createElement('span');
                    aiSpan.textContent = `> AI: GENERATING FUNINO LAYOUT FOR WEAK-FOOT FOCUS...`;
                    aiSpan.style.color = 'var(--accent-cyan)';
                    logTranscription.appendChild(aiSpan);
                    logTranscription.scrollTop = logTranscription.scrollHeight;
                    if(typeof updateLiveTrainingPlan === 'function') updateLiveTrainingPlan('FUNINO: W-FOOT FOCUS', 'Setup: 4 Mini-Goals. Rule: Left foot goals x2.');
                }, 800);
            }

            // V76: LIVE AI FLEXIBILITY (THE DIALOGUE)
            if (cmdText.includes('UNRUHIG') || cmdText.includes('FANGSPIEL')) {
                setTimeout(() => {
                    const aiSpan = document.createElement('span');
                    aiSpan.textContent = `> AI: SWITCHING TO HIGH-ENERGY WARMUP: TAG GAME.`;
                    aiSpan.style.color = 'var(--accent-cyan)';
                    logTranscription.appendChild(aiSpan);
                    logTranscription.scrollTop = logTranscription.scrollHeight;
                    if(typeof updateLiveTrainingPlan === 'function') updateLiveTrainingPlan('WARMUP: FANGSPIEL', 'Focus: Burn energy, scattered movement.');
                    if(typeof scatterPlayersVR === 'function') scatterPlayersVR(); 
                }, 800);
            }

            if (cmdText.includes('2-GEGEN-2') || cmdText.includes('2V2')) {
                setTimeout(() => {
                    const aiSpan = document.createElement('span');
                    aiSpan.textContent = `> AI: ADJUSTING FUNINO FIELD TO 2V2 WITH PROVOCATION RULES.`;
                    aiSpan.style.color = 'var(--accent-cyan)';
                    logTranscription.appendChild(aiSpan);
                    logTranscription.scrollTop = logTranscription.scrollHeight;
                    if(typeof updateLiveTrainingPlan === 'function') updateLiveTrainingPlan('FUNINO: 2v2 LIMIT', 'Focus: Decision making under extreme pressure.');
                    if(typeof renderTacticsVR === 'function') renderTacticsVR('funino_2v2'); 
                }, 800);
            }

            if (cmdText.includes('ANNEHMEN') || cmdText.includes('MITNEHMEN')) {
                setTimeout(() => {
                    const aiSpan = document.createElement('span');
                    aiSpan.textContent = `> AI: UPDATING SESSION: INTENSIVE FIRST TOUCH SQUARES.`;
                    aiSpan.style.color = 'var(--accent-cyan)';
                    logTranscription.appendChild(aiSpan);
                    logTranscription.scrollTop = logTranscription.scrollHeight;
                    if(typeof updateLiveTrainingPlan === 'function') updateLiveTrainingPlan('TECH: FIRST TOUCH', 'Focus: Body orientation, scanning before receive.');
                }, 800);
            }

            if (cmdText.includes('ABWEHRLINIE') && (cmdText.includes('VOR') || cmdText.includes('VERSCHIEBE'))) {
                setTimeout(() => {
                    const aiSpan = document.createElement('span');
                    aiSpan.textContent = `> AI: SHIFTING DEFENSIVE LINE +2 METERS IN VR.`;
                    aiSpan.style.color = 'var(--accent-cyan)';
                    logTranscription.appendChild(aiSpan);
                    logTranscription.scrollTop = logTranscription.scrollHeight;
                    if(typeof shiftDefensiveLineVR === 'function') shiftDefensiveLineVR(-0.2); 
                }, 800);
            }

            // Clear input
            inputVoiceCmd.value = '';"""


text = text.replace(v75_code, v76_code)

with open('/Users/bjoernsauerwein/Toni2.0 Antigravity/main.js', 'w') as f:
    f.write(text)

print("Replacement Complete")
