import sys

with open('/Users/bjoernsauerwein/Toni2.0 Antigravity/build_html.py', 'r') as f:
    text = f.read()

# 1. Header Persona Indicator
old_header = """                    <span>MIC UPLINK ACTIVE</span>
                </div>
                <button id="btn-settings" class="cyber-btn attr-btn" style="margin-right: 15px; border-color: var(--text-secondary); color: var(--text-secondary);">SYSTEM SETTINGS</button>"""

new_header = """                    <span>MIC UPLINK ACTIVE</span>
                </div>
                <div id="ai-persona-indicator" style="display: flex; align-items: center; gap: 8px; margin-left: 15px; color: var(--accent-cyan); font-family: var(--font-mono); font-size: 0.8rem; border: 1px solid var(--accent-cyan); padding: 4px 8px; border-radius: 4px; box-shadow: 0 0 10px rgba(0,255,255,0.2);">
                    <span id="ai-persona-icon">🎛️</span>
                    <span id="ai-persona-text">AI STATUS: STANDBY</span>
                </div>
                <button id="btn-settings" class="cyber-btn attr-btn" style="margin-left: 15px; margin-right: 15px; border-color: var(--text-secondary); color: var(--text-secondary);">SYSTEM SETTINGS</button>"""
text = text.replace(old_header, new_header)


# 2. Modals injection right below </main>
# We'll create the HTML mapping for the newly requested Modals.
modals_html = """
        <!-- V79 DEEP-DIVE MODALS -->
        <!-- MEDICAL LAB -->
        <div id="modal-medical" class="deep-dive-window hidden">
            <div class="modal-content outline-cyan">
                <button class="close-modal cyber-btn attr-btn">CLOSE</button>
                <h2 style="color: var(--accent-cyan); margin-top: 0; border-bottom: 1px solid var(--accent-cyan); padding-bottom: 5px;">PERFORMANCE & MEDICAL LAB</h2>
                
                <div class="tabs">
                    <button class="tab-btn active" data-tab="med-biometrics">Biometrics & Body Comp</button>
                    <button class="tab-btn" data-tab="med-cardiac">Cardiac History</button>
                    <button class="tab-btn" data-tab="med-fitness">Live Fitness-Watch</button>
                </div>
                
                <div id="med-biometrics" class="tab-content active">
                    <h3 style="color: var(--accent-cyan); font-size: 0.9rem;">FETTANALYSE (BODY COMPOSITION)</h3>
                    <div class="module-row"><span style="width: 150px;">Target Body Fat %</span><input type="range" id="slider-bodyfat" class="cyber-range" min="5" max="25" step="0.1" value="9.5"><span id="val-bodyfat" class="accent-text" style="width:50px;text-align:right;">9.5%</span></div>
                    <div class="module-row"><span style="width: 150px;">Lean Muscle Mass</span><div class="meter-wrapper"><div class="meter-fill" style="width: 82%; background: var(--accent-cyan);"></div></div></div>
                    <div class="module-row"><span style="width: 150px;">Hydration Levels</span><div class="meter-wrapper"><div class="meter-fill" style="width: 95%; background: var(--accent-blue);"></div></div></div>
                </div>
                
                <div id="med-cardiac" class="tab-content hidden">
                    <h3 style="color: var(--accent-magenta); font-size: 0.9rem;">LIFELONG HEARTBEAT</h3>
                    <div class="module-row"><span style="width: 150px;">HRV (Heart Rate Variability)</span><input type="range" id="slider-hrv" class="cyber-range" min="20" max="100" value="75"><span id="val-hrv" class="accent-text" style="width:50px;text-align:right;color:var(--accent-magenta);">75ms</span></div>
                    <div class="module-row"><span style="width: 150px;">Resting Heart Rate</span><input type="range" id="slider-rhr" class="cyber-range" min="35" max="80" value="48"><span id="val-rhr" class="accent-text" style="width:50px;text-align:right;color:var(--accent-magenta);">48 bpm</span></div>
                    <p style="font-size: 0.7rem; color: #aaa; margin-top: 15px;">* Syncs with VR Heartbeat Mountains</p>
                </div>
                
                <div id="med-fitness" class="tab-content hidden">
                    <h3 style="color: #00ff00; font-size: 0.9rem;">LIVE FITNESS-WATCH FEED</h3>
                    <div class="module-row"><span>Current Pulse</span><span style="color: #00ff00; font-family: var(--font-mono); font-size: 1.2rem;" id="live-pulse">135 bpm</span></div>
                    <div class="module-row"><span>Estimated VO2Max</span><span style="color: #00ff00;">62 ml/kg/min</span></div>
                    <div class="module-row"><span>Sleep Quality (Last Night)</span><span style="color: #00ff00;">88% (Optimal)</span></div>
                </div>
            </div>
        </div>

        <!-- TACTICS LAB -->
        <div id="modal-tactics" class="deep-dive-window hidden">
            <div class="modal-content outline-blue">
                <button class="close-modal cyber-btn attr-btn">CLOSE</button>
                <h2 style="color: var(--accent-blue); margin-top: 0; border-bottom: 1px solid var(--accent-blue); padding-bottom: 5px;">TACTICBOARD & FUNINO</h2>
                <!-- Pulled from previous build_html -->
                <div class="module-row"><span>Verticality Baseline</span><input type="range" class="cyber-range" min="0" max="100" value="60"></div>
                <div class="module-row"><span>Pressing Intensity</span><input type="range" class="cyber-range" min="0" max="100" value="80"></div>
            </div>
        </div>

        <!-- ACADEMY LAB -->
        <div id="modal-academy" class="deep-dive-window hidden">
            <div class="modal-content outline-green">
                <button class="close-modal cyber-btn attr-btn">CLOSE</button>
                <h2 style="color: var(--accent-green); margin-top: 0; border-bottom: 1px solid var(--accent-green); padding-bottom: 5px;">NLZ // ELITE DEVELOPMENT</h2>
                
                <div class="tabs">
                    <button class="tab-btn active" data-tab="aca-foundational">Foundational Hub (Youth)</button>
                    <button class="tab-btn" data-tab="aca-psychology">Psychology & Motivation</button>
                </div>
                
                <div id="aca-foundational" class="tab-content active">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px; margin-bottom: 10px;">
                        <div style="background: rgba(0, 136, 255, 0.1); border: 1px solid rgba(0, 136, 255, 0.3); padding: 5px; text-align: center;">COORDINATION</div>
                        <div style="background: rgba(0, 136, 255, 0.1); border: 1px solid rgba(0, 136, 255, 0.3); padding: 5px; text-align: center;">TECH. BASICS</div>
                        <div style="background: rgba(0, 136, 255, 0.1); border: 1px solid rgba(0, 136, 255, 0.3); padding: 5px; text-align: center;">GAME INTELL.</div>
                        <div style="background: rgba(0, 136, 255, 0.1); border: 1px solid rgba(0, 136, 255, 0.3); padding: 5px; text-align: center;">MOTIVATION</div>
                    </div>
                </div>
                
                <div id="aca-psychology" class="tab-content hidden">
                    <h3 style="color: var(--accent-green); font-size: 0.9rem;">COACH-ADVISOR FEED</h3>
                    <div id="coach-advisor-log" style="background: rgba(0, 255, 0, 0.05); border-left: 3px solid var(--accent-green); padding: 8px;">
                        <span style="display: block; font-size: 0.65rem; color: var(--accent-green);">PEDAGOGICAL CUE</span>
                        <span style="font-size: 0.75rem; color: #fff;">"Focus on positive reinforcement for Player X – struggling with first touch."</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- MANAGEMENT LAB -->
        <div id="modal-management" class="deep-dive-window hidden">
            <div class="modal-content outline-magenta">
                <button class="close-modal cyber-btn attr-btn">CLOSE</button>
                <h2 style="color: var(--accent-magenta); margin-top: 0; border-bottom: 1px solid var(--accent-magenta); padding-bottom: 5px;">MANAGEMENT & SPONSORING</h2>
                
                <h3 style="color: var(--accent-magenta); font-size: 0.9rem; margin-top: 15px;">Live Bidding Inputs</h3>
                <div class="module-row"><span style="width: 80px;">Sleeve:</span><input type="text" value="Qatar Airways" class="module-input" style="flex: 1;"></div>
                <div class="module-row"><span style="width: 80px;">Crypto:</span><input type="text" value="Binance" class="module-input" style="flex: 1;"></div>
            </div>
        </div>
"""

text = text.replace('        </main>', '        </main>\n' + modals_html)

# 3. Replace the left column contents
# We use regex to find the section and replace it
import re
pattern = r'(<section class="col-panel management-hub">\s*<h2>MANAGEMENT</h2>).*?(</section>\s*<section class="col-panel tactic-hub">)'

new_launchers = r"""\1
                
                <!-- V79: DEEP-DIVE LAUNCHERS -->
                <div style="display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem; height: 100%;">
                    <button class="cyber-btn launcher-btn" data-target="modal-medical" data-role="cmo" style="text-align: left; padding: 1rem; border-color: var(--accent-cyan); color: var(--accent-cyan); display: flex; align-items: center; justify-content: space-between;">
                        <span>PERFORMANCE & MEDICAL LAB</span>
                        <span style="font-size: 0.7rem;">[OPEN]</span>
                    </button>
                    
                    <button class="cyber-btn launcher-btn" data-target="modal-tactics" data-role="tactics" style="text-align: left; padding: 1rem; border-color: var(--accent-blue); color: var(--accent-blue); display: flex; align-items: center; justify-content: space-between;">
                        <span>TACTICBOARD & FUNINO (NLZ)</span>
                        <span style="font-size: 0.7rem;">[OPEN]</span>
                    </button>
                    
                    <button class="cyber-btn launcher-btn" data-target="modal-academy" data-role="academy" style="text-align: left; padding: 1rem; border-color: var(--accent-green); color: var(--accent-green); display: flex; align-items: center; justify-content: space-between;">
                        <span>NLZ // ELITE DEVELOPMENT</span>
                        <span style="font-size: 0.7rem;">[OPEN]</span>
                    </button>
                    
                    <button class="cyber-btn launcher-btn" data-target="modal-management" data-role="management" style="text-align: left; padding: 1rem; border-color: var(--accent-magenta); color: var(--accent-magenta); display: flex; align-items: center; justify-content: space-between;">
                        <span>MANAGEMENT & SPONSORING</span>
                        <span style="font-size: 0.7rem;">[OPEN]</span>
                    </button>

                    <!-- V76 SYSTEM-LOG / VOICE-UPLINK (Kept visible for fast commands) -->
                    <div class="module-box outline-cyan" style="margin-top: auto; border: 1px solid var(--accent-cyan);">
                        <h3 class="module-title" style="color: var(--accent-cyan);">SYSTEM-LOG & UPLINK</h3>
                        
                        <div id="ui-live-training-plan" style="font-size: 0.7rem; color: #fff; background: rgba(0,0,0,0.5); padding: 5px; border-radius: 4px; margin-bottom: 5px;">
                            <span style="font-family: var(--font-mono); color: var(--accent-cyan);">> TRAINING: ACTIVE</span>
                        </div>

                        <div id="log-transcription" style="background: rgba(0,0,0,0.8); border: 1px solid rgba(0,255,255,0.3); height: 80px; overflow-y: hidden; padding: 5px; font-family: var(--font-mono); font-size: 0.65rem; color: #aaa; border-radius: 4px; display: flex; flex-direction: column; justify-content: flex-end;">
                            <span style="color: var(--accent-cyan);">> SYSTEM ONLINE</span>
                            <span>> WAITING FOR VOICE COMMAND...</span>
                        </div>

                        <div class="module-row" style="margin-top: 10px;">
                            <input type="text" id="input-voice-cmd" class="module-input" placeholder="Simulate Uplink..." style="flex: 1; padding: 4px; border: 1px solid rgba(0,255,255,0.3); background: rgba(0,0,0,0.5); color: #00ffff; font-family: var(--font-mono); font-size: 0.75rem;">
                            <button id="btn-send-cmd" class="cyber-btn" style="padding: 4px 8px; font-size: 0.7rem;">SEND</button>
                        </div>
                    </div>
                </div>
            \2"""

text = re.sub(pattern, new_launchers, text, flags=re.DOTALL)

with open('/Users/bjoernsauerwein/Toni2.0 Antigravity/build_html.py', 'w') as f:
    f.write(text)

print("build_html.py updated successfully.")
