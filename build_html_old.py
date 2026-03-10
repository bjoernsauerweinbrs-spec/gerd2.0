import os

def generate_html():
    with open('office_360_v2_b64.txt', 'r') as f:
        skybox = f.read().strip()
    with open('logo_b64.txt', 'r') as f:
        logo = f.read().strip()

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TONI 2.0 | HYBRID COMMAND CENTER</title>
    <script src="https://aframe.io/releases/1.5.0/aframe.min.js"></script>
    <script src="https://cdn.jsdelivr.net/gh/c-frame/aframe-extras@7.2.0/dist/aframe-extras.min.js"></script>
    <script src="https://rawgit.com/fernandojsg/aframe-teleport-controls/master/dist/aframe-teleport-controls.min.js"></script>
    <script src="i18n.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <link rel="stylesheet" href="style.css">
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Inter:wght@400;700&display=swap" rel="stylesheet">
</head>
<body>
    <!-- 2D DASHBOARD LAYER -->
    <div id="ui-layer">
        <header class="top-nav">
            <div class="logo">
                <div style="display:flex;align-items:center;gap:10px;">
                    <div style="width:36px;height:36px;border-radius:50%;background:radial-gradient(circle,#cc0000,#880000);display:flex;align-items:center;justify-content:center;font-size:1.1rem;box-shadow:0 0 10px rgba(204,0,0,0.4);">🐂</div>
                    <div>
                        <div id="toni-logo-text" style="font-family:Orbitron,sans-serif;font-size:1rem;font-weight:900;color:#f0f2f5;letter-spacing:3px;line-height:1;cursor:pointer;">FC TONI 2.0</div>
                        <div style="font-family:JetBrains Mono,monospace;font-size:0.45rem;color:#cc0000;letter-spacing:4px;">STARK ELITE INTELLIGENCE</div>
                    </div>
                </div>
            </div>
            <div class="status-bar">
                <div class="mic-status" style="display: flex; align-items: center; gap: 8px;">
                    <div class="voice-waveform">
                        <div class="bar"></div>
                        <div class="bar delay-1"></div>
                        <div class="bar delay-2"></div>
                        <div class="bar delay-3"></div>
                        <div class="bar delay-4"></div>
                    </div>
                    <span data-i18n="mic-uplink">MIC UPLINK ACTIVE</span>
                </div>
                <div id="ai-persona-indicator" style="display: flex; align-items: center; gap: 8px; margin-left: 15px; color: var(--accent-cyan); font-family: var(--font-mono); font-size: 0.8rem; border: 1px solid var(--accent-cyan); padding: 4px 8px; border-radius: 4px; box-shadow: 0 0 10px rgba(0,255,255,0.2);">
                    <img id="ai-persona-avatar" src="assets/avatars/coach_avatar_1772480312772.png" style="width: 28px; height: 28px; border-radius: 50%; object-fit: cover; border: 1px solid var(--accent-cyan); display: none;">
                    <span id="ai-persona-icon">🎛️</span>
                    <span id="ai-persona-text" data-i18n="ai-standby">AI STATUS: STANDBY</span>
                </div>
                <button id="btn-settings" class="cyber-btn attr-btn" style="margin-left: 15px; color: var(--text-secondary);">SYSTEM EINSTELLUNGEN</button>

                <!-- V88: EN/DE Language Toggle -->
                <div class="lang-toggle" id="lang-toggle-wrapper" style="margin-left: 12px; margin-right: 12px;">
                    <span class="lang-label" id="lang-label-en">EN</span>
                    <button id="lang-toggle-btn" class="lang-toggle-track" aria-label="Toggle language" data-lang="en">
                        <span id="lang-toggle-pill"></span>
                    </button>
                    <span class="lang-label" id="lang-label-de">DE</span>
                </div>

                <button id="btn-enter-vr" class="cyber-btn" onclick="window.enterVR()" style="color: #00ffff; border-color: rgba(0,255,255,0.5);">🥽 VR BETRETEN</button>
            </div>
        </header>

        <main class="three-col-grid">
            <!-- LEFT: MANAGEMENT -->
            <section class="col-panel management-hub">
                <h2>MANAGEMENT</h2>
                
                <!-- V79: DEEP-DIVE LAUNCHERS -->
                <div style="display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem; height: 100%;">
                    <button class="cyber-btn launcher-btn" data-target="modal-medical" data-role="cmo" style="text-align: left; padding: 1rem; color: #b8c5d6; display: flex; align-items: center; justify-content: space-between;">
                        <span>🩺 PERFORMANCE & MEDIZIN LAB</span>
                        <span style="font-size: 0.7rem;">[ÖFFNEN]</span>
                    </button>
                    
                    <button class="cyber-btn launcher-btn" data-target="modal-tactics" data-role="academy" style="text-align: left; padding: 1rem; color: #b8c5d6; display: flex; align-items: center; justify-content: space-between;">
                        <span>🏫 NLZ ELITE ACADEMY HUB</span>
                        <span style="font-size: 0.7rem;">[ÖFFNEN]</span>
                    </button>
                    
                    <button class="cyber-btn launcher-btn" data-target="modal-academy" data-role="academy" style="text-align: left; padding: 1rem; color: #b8c5d6; display: flex; align-items: center; justify-content: space-between;">
                        <span>NLZ // ELITE DEVELOPMENT</span>
                        <span style="font-size: 0.7rem;">[ÖFFNEN]</span>
                    </button>
                    
                    <button class="cyber-btn launcher-btn" data-target="modal-management" data-role="cfo" style="text-align: left; padding: 1rem; color: #b8c5d6; display: flex; align-items: center; justify-content: space-between;">
                        <span>💰 CFO MANAGEMENT SUITE</span>
                        <span style="font-size: 0.7rem;">[ÖFFNEN]</span>
                    </button>

                    <button class="cyber-btn launcher-btn" data-target="modal-video" data-role="analysis" style="text-align: left; padding: 1rem; color: #b8c5d6; display: flex; align-items: center; justify-content: space-between;">
                        <span>🎥 VIDEO-ANALYSE HUB</span>
                        <span style="font-size: 0.7rem;">[ÖFFNEN]</span>
                    </button>

                    <button class="cyber-btn launcher-btn" data-target="modal-media" data-role="media" style="text-align: left; padding: 1rem; color: #b8c5d6; display: flex; align-items: center; justify-content: space-between;">
                        <span>🗞️ MEDIA &amp; COMMUNICATIONS HUB</span>
                        <span style="font-size: 0.7rem;">[ÖFFNEN]</span>
                    </button>

                    <button class="cyber-btn launcher-btn" data-target="modal-dossier" data-role="dossier" style="text-align: left; padding: 1rem; color: #b8c5d6; display: flex; align-items: center; justify-content: space-between;">
                        <span>🗂️ 360° SPIELER-DOSSIER</span>
                        <span style="font-size: 0.7rem;">[ÖFFNEN]</span>
                    </button>

                    <button class="cyber-btn launcher-btn" data-target="modal-shopping" data-role="shopping" style="text-align:left; padding:1rem; color: #b8c5d6; display:flex; align-items:center; justify-content:space-between;">
                        <span>🛒 SHOPPING ENGINE</span>
                        <span style="font-size:0.7rem;">[ÖFFNEN]</span>
                    </button>

                    <button class="cyber-btn" style="text-align: left; padding: 1rem; color: #f5c400; display: flex; align-items: center; justify-content: space-between; border-color: rgba(245,196,0,0.5); margin-top: auto;" onclick="triggerFeierabendReport()">
                        <span>🌙 FEIERABEND (EOD SYNC)</span>
                        <span style="font-size: 0.7rem;">[ZUSAMMENFASSUNG]</span>
                    </button>

                    <!-- V76 SYSTEM-LOG / VOICE-UPLINK (Kept visible for fast commands) -->
                    <div class="module-box outline-cyan" style="margin-top: auto; border: 1px solid var(--accent-cyan);">
                        <h3 class="module-title" style="color: var(--accent-cyan);">SYSTEM-LOG & UPLINK</h3>
                        
                        <div id="ui-live-training-plan" style="font-size: 0.7rem; color: #fff; background: rgba(0,0,0,0.5); padding: 5px; border-radius: 4px; margin-bottom: 5px;">
                            <span style="font-family: var(--font-mono); color: var(--accent-cyan);">> TRAINING: AKTIV</span>
                        </div>

                        <div id="log-transcription" style="background: rgba(0,0,0,0.8); border: 1px solid rgba(0,255,255,0.3); height: 80px; overflow-y: hidden; padding: 5px; font-family: var(--font-mono); font-size: 0.65rem; color: #aaa; border-radius: 4px; display: flex; flex-direction: column; justify-content: flex-end;">
                            <span style="color: var(--accent-cyan);">> SYSTEM ONLINE</span>
                            <span>> WARTE AUF SPRACHBEFEHL...</span>
                        </div>

                        <div class="module-row" style="margin-top: 10px;">
                            <input type="text" id="input-voice-cmd" class="module-input" placeholder="Simulate Uplink..." style="flex: 1; padding: 4px; border: 1px solid rgba(0,255,255,0.3); background: rgba(0,0,0,0.5); color: #00ffff; font-family: var(--font-mono); font-size: 0.75rem;">
                            <button id="btn-send-cmd" class="cyber-btn" style="padding: 4px 8px; font-size: 0.7rem;">SENDEN</button>
                        </div>
                    </div>
                </div>
            </section>
            <section class="col-panel tactic-hub">
                <h2>TAKTIKTAFEL</h2>
                <div class="tactic-controls">
                    <button id="btn-halfspace-toggle" onclick="toggleHalfSpaces()" style="font-size:0.55rem;border:1px solid #a78bfa;color:#a78bfa;background:transparent;border-radius:3px;padding:3px 8px;cursor:pointer;font-family:var(--font-heading);">🟣 HALBRÄUME</button>
                    <button id="btn-zone-toggle" onclick="toggleZoneOverlay()" style="font-size:0.55rem;border:1px solid #ffd700;color:#ffd700;background:transparent;border-radius:3px;padding:3px 8px;cursor:pointer;font-family:var(--font-heading);">📐 ZONEN</button>
                    <button onclick="clearPitchTokens()" style="font-size:0.55rem;border:1px solid #ff4b2b;color:#ff4b2b;background:transparent;border-radius:3px;padding:3px 8px;cursor:pointer;font-family:var(--font-heading);">🗑 LEEREN</button>
                    <button id="btn-2d-442" class="cyber-btn active">4-4-2 TONI</button>
                    <button id="btn-2d-343" class="cyber-btn">3-4-3 TRAINER</button>
                    <button id="btn-2d-funino" class="cyber-btn" style="color: var(--accent-magenta);">FUNINO (G-JUGEND)</button>
                </div>
                <div class="mode-controls" style="display: flex; justify-content: center; margin-bottom: 1rem;">
                    <button id="btn-mode-toggle" class="cyber-btn attr-btn" style="color: var(--accent-magenta); font-size: 0.8rem;">MODUS: SPIEL</button>
                </div>
                <!-- CSS Pitch -->
                <div class="pitch-wrap" style="flex: 1; display: flex; align-items: center; justify-content: center; min-height: 0; min-width: 0;">
                    <div class="pitch-container" id="pitch-2d">
                        <!-- V145: Halbraum-Dominanz Overlay (Hidden by Default) -->
                        <div id="halbraum-overlay" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; display: none; z-index: 2;">
                            <!-- Left Half-Space -->
                            <div style="position: absolute; left: 18%; width: 14%; height: 100%; background: rgba(0,255,136,0.25); border-left: 2px dashed #00ff88; border-right: 2px dashed #00ff88;">
                                <div style="color: #00ff88; text-align: center; margin-top: 50%; font-family: var(--font-heading); font-size: 0.8rem; text-shadow: 1px 1px 2px #000; transform: rotate(-90deg);">L. HALB.</div>
                            </div>
                            <!-- Right Half-Space -->
                            <div style="position: absolute; left: 68%; width: 14%; height: 100%; background: rgba(0,255,136,0.25); border-left: 2px dashed #00ff88; border-right: 2px dashed #00ff88;">
                                <div style="color: #00ff88; text-align: center; margin-top: 50%; font-family: var(--font-heading); font-size: 0.8rem; text-shadow: 1px 1px 2px #000; transform: rotate(-90deg);">R. HALB.</div>
                            </div>
                        </div>
                        <div class="pitch-lines">
                            <div class="center-circle"></div>
                            <div class="half-way-line"></div>
                            <div class="penalty-box top"></div>
                            <div class="six-yard-box top"></div>
                            <div class="goal top"></div>
                            <div class="penalty-box bottom"></div>
                            <div class="six-yard-box bottom"></div>
                            <div class="goal bottom"></div>
                        </div>
                        <!-- Player markers injected via JS -->
                    </div>
                </div>
            </section>

            <!-- RIGHT: SQUAD ROSTER -->
            <section class="col-panel squad-hub">
                <h2>KADERLISTE</h2>
                <div class="squad-grid" id="squad-grid-2d">
                    <!-- FIFA Cards injected via JS -->
                </div>
            </section>
        </main>

        <!-- V79 DEEP-DIVE MODALS -->
        <!-- MEDIZIN LAB -->
        <!-- PERFORMANCE & MEDIZIN LAB — V84 ELITE-AG ARCHITECTURE -->
        <div id="modal-medical" class="deep-dive-window hidden">
            <div class="modal-content outline-cyan" style="width: 820px; max-width: 96vw;">
                <button class="close-modal cyber-btn attr-btn">SCHLIESSEN</button>
                <h2 style="color: var(--accent-cyan); margin-top: 0; border-bottom: 1px solid rgba(0,255,255,0.3); padding-bottom: 5px; display: flex; align-items: center; gap: 10px; position: relative;">
                    🩺 <span>PERFORMANCE & MEDIZIN LAB</span>
                    <span id="cmo-alert-badge" style="font-size: 0.65rem; background: rgba(255,75,43,0.2); border: 1px solid #ff4b2b; color: #ff4b2b; padding: 2px 8px; border-radius: 12px; display: none;">⚠ NAGELSMANN ALERT</span>
                    <img id="avatar-medizin" src="assets/avatars/toni_arzt.jpg" style="position: absolute; right: 0; top: -10px; width: 60px; height: 60px; border-radius: 50%; border: 2px solid var(--accent-cyan); opacity: 0; transition: opacity 0.8s ease; object-fit: cover;">
                </h2>

                <div class="tabs">
                    <button class="tab-btn active" data-tab="med-biometrics">🫀 Biometrie</button>
                    <button class="tab-btn" data-tab="med-cardiac">📈 Kardiologie</button>
                    <button class="tab-btn" data-tab="med-forceplate">⚖ Kraftmessplatte</button>
                    <button class="tab-btn" data-tab="med-hormonal">🧬 Hormonell</button>
                    <button class="tab-btn" data-tab="med-cognitive">🧠 Kognitive Belastung</button>
                </div>

                <!-- TAB 0: BIOMETRICS -->
                <div id="med-biometrics" class="tab-content active">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
                        <div>
                            <h3 style="color: var(--accent-cyan); font-size: 0.85rem; margin-top: 0;">FETTANALYSE (KÖRPERZUSAMMENSETZUNG)</h3>
                            <div class="module-row">
                                <span style="width: 160px; font-size: 0.8rem;" data-i18n="label-bodyfat">Körperfettanteil %</span>
                                <input type="range" id="slider-bodyfat" class="cyber-range" min="5" max="25" step="0.1" value="9.5">
                                <span id="val-bodyfat" class="accent-text" style="width:55px;text-align:right;">9.5%</span>
                            </div>
                            <div id="bodyfat-warning" style="display: none; font-size: 0.7rem; color: #ff4b2b; margin-bottom: 8px; animation: fadeIn 0.3s;">⚠ THRESHOLD EXCEEDED — NAGELSMANN ALERT ACTIVE</div>
                            <div class="module-row"><span style="width: 160px; font-size: 0.8rem;">Muskelmasse (fettfrei)</span><div class="meter-wrapper"><div class="meter-fill" id="bar-muscle" style="width: 82%; background: var(--accent-cyan);"></div></div><span style="font-size: 0.75rem; color: #aaa;">82%</span></div>
                            <div class="module-row"><span style="width: 160px; font-size: 0.8rem;">Hydratationsniveau</span><div class="meter-wrapper"><div class="meter-fill" style="width: 95%; background: var(--accent-blue);"></div></div><span style="font-size: 0.75rem; color: #aaa;">95%</span></div>
                            <div class="module-row"><span style="width: 160px; font-size: 0.8rem;">Regenerationsindex</span><div class="meter-wrapper"><div class="meter-fill" id="bar-recovery" style="width: 78%; background: #00ff88;"></div></div><span id="val-recovery" style="font-size: 0.75rem; color: #00ff88;">78%</span></div>
                            <div class="module-row"><span style="width: 160px; font-size: 0.8rem;">Muskelermüdung L</span><div class="meter-wrapper"><div class="meter-fill" id="bar-fatigue-l" style="width: 32%; background: #ffd700;"></div></div><span id="val-fatigue-l" style="font-size: 0.75rem; color: #ffd700;">32%</span></div>
                            <div class="module-row"><span style="width: 160px; font-size: 0.8rem;">Muskelermüdung R</span><div class="meter-wrapper"><div class="meter-fill" id="bar-fatigue-r" style="width: 29%; background: #ffd700;"></div></div><span id="val-fatigue-r" style="font-size: 0.75rem; color: #ffd700;">29%</span></div>
                        </div>
                        <div>
                            <h3 style="color: var(--accent-magenta); font-size: 0.85rem; margin-top: 0;">HRV LIVE MONITOR</h3>
                            <div class="module-row">
                                <span style="width: 160px; font-size: 0.8rem;">HRV-Basis</span>
                                <input type="range" id="slider-hrv" class="cyber-range" min="20" max="100" value="75">
                                <span id="val-hrv" style="width:55px;text-align:right;color:var(--accent-magenta); font-family: var(--font-heading); font-weight: 900;">75ms</span>
                            </div>
                            <div id="hrv-warning" style="display: none; font-size: 0.7rem; color: #ff4b2b; margin-bottom: 8px;">⚠ HRV DROP >20% — OVERTRAINING RISK</div>
                            <div class="module-row"><span style="width: 160px; font-size: 0.8rem;">Ruhepuls</span><input type="range" id="slider-rhr" class="cyber-range" min="35" max="80" value="48"><span id="val-rhr" style="width:55px;text-align:right;color:var(--accent-magenta);">48 bpm</span></div>
                            <div class="module-row"><span style="width: 160px; font-size: 0.8rem;">Aktueller Puls</span><span id="live-pulse" style="color: #00ff00; font-family: var(--font-heading); font-size: 1.2rem;">135 bpm</span></div>
                            <div class="module-row"><span style="width: 160px; font-size: 0.8rem;">VO2Max</span><span style="color: #00ff00;">62 ml/kg/min</span></div>
                            <div class="module-row">
                                <span style="width: 160px; font-size: 0.8rem;">
                                    Schlafqualität 
                                    <span id="btn-sleep-info" style="cursor:pointer; color: var(--accent-cyan); margin-left:5px; font-weight: bold; font-family: var(--font-heading);" title="Wissenschaftliches Fachmagazin öffnen">ⓘ</span>
                                </span>
                                <input type="range" id="slider-sleep" class="cyber-range" min="30" max="100" value="88">
                                <span id="val-sleep" style="width:55px;text-align:right;color:#00ff00;">88%</span>
                            </div>
                            <div id="sleep-warning" style="display: none; font-size: 0.7rem; color: #ff4b2b; margin-bottom: 8px;">⚠ SCHLAFDEFIZIT ERKANNT — KOGNITIVE VERLANGSAMUNG DROHT</div>
                        </div>
                    </div>
                </div>

                <!-- TAB 1: CARDIAC HISTORY -->
                <div id="med-cardiac" class="tab-content hidden">
                    <h3 style="color: var(--accent-magenta); font-size: 0.85rem; margin-top: 0;">LIFELONG HEARTBEAT ARCHIVE — HRV Career Timeline</h3>
                    <!-- SVG Cardiac Graph -->
                    <svg id="cardiac-svg" viewBox="0 0 700 160" width="100%" height="160" style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,0,255,0.2); border-radius: 4px; display: block; margin-bottom: 12px;">
                        <!-- Grid lines -->
                        <line x1="0" y1="40" x2="700" y2="40" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
                        <line x1="0" y1="80" x2="700" y2="80" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
                        <line x1="0" y1="120" x2="700" y2="120" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
                        <!-- Y-axis labels -->
                        <text x="5" y="38" fill="#555" font-size="9">100ms</text>
                        <text x="5" y="78" fill="#555" font-size="9">75ms</text>
                        <text x="5" y="118" fill="#555" font-size="9">50ms</text>
                        <!-- The HRV career data path (JS-injectable via id) -->
                        <polyline id="cardiac-path" fill="none" stroke="#ff00ff" stroke-width="2"
                            points="35,90 95,55 155,70 215,45 275,80 335,60 395,95 455,50 515,75 575,65 635,85 695,70"/>
                        <!-- Area fill -->
                        <polygon id="cardiac-area" opacity="0.15" fill="#ff00ff"
                            points="35,160 35,90 95,55 155,70 215,45 275,80 335,60 395,95 455,50 515,75 575,65 635,85 695,70 695,160"/>
                        <!-- Hover dot (JS controlled) -->
                        <circle id="cardiac-dot" r="5" fill="#ff00ff" cx="335" cy="60" opacity="0"/>
                        <!-- Year labels -->
                        <text x="30"  y="155" fill="#555" font-size="8">2015</text>
                        <text x="90"  y="155" fill="#555" font-size="8">2016</text>
                        <text x="150" y="155" fill="#555" font-size="8">2017</text>
                        <text x="210" y="155" fill="#555" font-size="8">2018</text>
                        <text x="270" y="155" fill="#555" font-size="8">2019</text>
                        <text x="330" y="155" fill="#555" font-size="8">2020</text>
                        <text x="390" y="155" fill="#555" font-size="8">2021</text>
                        <text x="450" y="155" fill="#555" font-size="8">2022</text>
                        <text x="510" y="155" fill="#555" font-size="8">2023</text>
                        <text x="570" y="155" fill="#555" font-size="8">2024</text>
                        <text x="630" y="155" fill="#555" font-size="8">2025</text>
                        <!-- Annotations -->
                        <line x1="215" y1="45" x2="215" y2="15" stroke="#ff4b2b" stroke-width="1" stroke-dasharray="3,2"/>
                        <text x="218" y="12" fill="#ff4b2b" font-size="8">OVERTRAINING</text>
                    </svg>
                    <!-- Data table -->
                    <div style="overflow-x: auto; font-family: var(--font-mono);">
                        <table style="width: 100%; border-collapse: collapse; font-size: 0.72rem;">
                            <thead><tr style="color: var(--accent-magenta); border-bottom: 1px solid rgba(255,0,255,0.2);">
                                <th style="padding: 5px 8px; text-align: left;">YEAR</th>
                                <th style="padding: 5px 8px;">HRV avg</th>
                                <th style="padding: 5px 8px;">RHR avg</th>
                                <th style="padding: 5px 8px;">Peak Load</th>
                                <th style="padding: 5px 8px;">Injuries</th>
                                <th style="padding: 5px 8px;">Status</th>
                            </tr></thead>
                            <tbody style="color: #ccc;">
                                <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);"><td style="padding:4px 8px;">2015</td><td style="padding:4px 8px; color:var(--accent-magenta);">62ms</td><td style="padding:4px 8px;">52 bpm</td><td style="padding:4px 8px;">High</td><td style="padding:4px 8px; color:#ff4b2b;">2</td><td style="padding:4px 8px; color:#ffd700;">GROWING</td></tr>
                                <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);"><td style="padding:4px 8px;">2016</td><td style="padding:4px 8px; color:var(--accent-magenta);">80ms</td><td style="padding:4px 8px;">49 bpm</td><td style="padding:4px 8px;">Med</td><td style="padding:4px 8px; color:#00ff88;">0</td><td style="padding:4px 8px; color:#00ff88;">PRIME</td></tr>
                                <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);"><td style="padding:4px 8px;">2017</td><td style="padding:4px 8px; color:var(--accent-magenta);">74ms</td><td style="padding:4px 8px;">50 bpm</td><td style="padding:4px 8px;">High</td><td style="padding:4px 8px; color:#ffd700;">1</td><td style="padding:4px 8px; color:#00ff88;">STABLE</td></tr>
                                <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);"><td style="padding:4px 8px;">2018</td><td style="padding:4px 8px; color:#ff4b2b;">44ms</td><td style="padding:4px 8px;">58 bpm</td><td style="padding:4px 8px;">Very High</td><td style="padding:4px 8px; color:#ff4b2b;">3</td><td style="padding:4px 8px; color:#ff4b2b;">OVERLOAD</td></tr>
                                <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);"><td style="padding:4px 8px;">2019–25</td><td style="padding:4px 8px; color:var(--accent-magenta);">71ms</td><td style="padding:4px 8px;">48 bpm</td><td style="padding:4px 8px;">Optimal</td><td style="padding:4px 8px; color:#00ff88;">0–1/yr</td><td style="padding:4px 8px; color:#00ff88;">PRIME</td></tr>
                            </tbody>
                        </table>
                    </div>
                    <p style="font-size: 0.7rem; color: #555; margin-top: 8px;">* Graph syncs with VR Heartbeat Mountains terrain morphing</p>
                </div>

                <!-- TAB 2: FORCE PLATE -->
                <div id="med-forceplate" class="tab-content hidden">
                    <h3 style="color: #0088ff; font-size: 0.85rem; margin-top: 0;">FORCE PLATE DATA — Load Distribution Analysis</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                        <div>
                            <div style="text-align: center; margin-bottom: 1rem;">
                                <div style="font-size: 0.7rem; color: #aaa; margin-bottom: 4px;">LEFT LIMB</div>
                                <div id="val-force-left" style="font-size: 2.5rem; font-family: var(--font-heading); font-weight: 900; color: #0088ff;">847</div>
                                <div style="font-size: 0.65rem; color: #555;">Newtons (peak)</div>
                            </div>
                            <input type="range" id="slider-force-left" class="cyber-range" min="500" max="1200" value="847" style="width: 100%;">
                            <div class="pl-bar-wrapper" style="margin-top: 8px;">
                                <div class="pl-bar-fill" id="bar-force-left" style="width: 70.6%; background: linear-gradient(90deg, #0088ff, #00ffff);"></div>
                            </div>
                        </div>
                        <div>
                            <div style="text-align: center; margin-bottom: 1rem;">
                                <div style="font-size: 0.7rem; color: #aaa; margin-bottom: 4px;">RIGHT LIMB</div>
                                <div id="val-force-right" style="font-size: 2.5rem; font-family: var(--font-heading); font-weight: 900; color: #0088ff;">792</div>
                                <div style="font-size: 0.65rem; color: #555;">Newtons (peak)</div>
                            </div>
                            <input type="range" id="slider-force-right" class="cyber-range" min="500" max="1200" value="792" style="width: 100%;">
                            <div class="pl-bar-wrapper" style="margin-top: 8px;">
                                <div class="pl-bar-fill" id="bar-force-right" style="width: 66%; background: linear-gradient(90deg, #0088ff, #00ffff);"></div>
                            </div>
                        </div>
                    </div>
                    <!-- Asymmetrie Indicator -->
                    <div style="margin-top: 1.5rem; padding: 1rem; background: rgba(0,136,255,0.07); border: 1px solid rgba(0,136,255,0.25); border-radius: 6px; text-align: center;">
                        <div style="font-size: 0.7rem; color: #aaa; margin-bottom: 4px; font-family: var(--font-heading);">LIMB ASYMMETRY INDEX</div>
                        <div id="val-asymmetry" style="font-size: 2rem; font-family: var(--font-heading); font-weight: 900; color: #ffd700;">6.5%</div>
                        <div id="asymmetry-warning" style="font-size: 0.75rem; color: #ffd700; margin-top: 4px;">⚡ Within tolerance (target &lt;10%)</div>
                    </div>
                    <div style="margin-top: 1rem; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.5rem;">
                        <div style="padding: 0.6rem; background: rgba(0,0,0,0.3); border: 1px solid #222; border-radius: 4px; text-align: center;">
                            <div style="font-size: 0.6rem; color: #555;">JUMP HEIGHT</div>
                            <div style="font-family: var(--font-heading); color: #00ffff;">62 cm</div>
                        </div>
                        <div style="padding: 0.6rem; background: rgba(0,0,0,0.3); border: 1px solid #222; border-radius: 4px; text-align: center;">
                            <div style="font-size: 0.6rem; color: #555;">LAND TIME</div>
                            <div style="font-family: var(--font-heading); color: #00ffff;">220 ms</div>
                        </div>
                        <div style="padding: 0.6rem; background: rgba(0,0,0,0.3); border: 1px solid #222; border-radius: 4px; text-align: center;">
                            <div style="font-size: 0.6rem; color: #555;">RSI SCORE</div>
                            <div style="font-family: var(--font-heading); color: #00ffff;">2.82</div>
                        </div>
                    </div>
                </div>

                <!-- TAB 3: HORMONAL BALANCE -->
                <div id="med-hormonal" class="tab-content hidden">
                    <h3 style="color: #ff00ff; font-size: 0.85rem; margin-top: 0;">HORMONAL BALANCE — Endocrine Profile</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                        <div>
                            <div style="font-size: 0.7rem; color: #ff00ff; margin-bottom: 8px; font-family: var(--font-heading);">CORTISOL (STRESS MARKER)</div>
                            <div class="module-row">
                                <span style="font-size: 0.8rem;">Level (nmol/L)</span>
                                <input type="range" id="slider-cortisol" class="cyber-range" min="100" max="800" step="5" value="380" style="flex: 1; margin: 0 10px;">
                                <span id="val-cortisol" style="font-family: var(--font-heading); color: #ff00ff; min-width: 55px; text-align: right;">380</span>
                            </div>
                            <!-- Normal band indicator -->
                            <div style="position: relative; height: 20px; background: rgba(0,0,0,0.3); border: 1px solid #333; border-radius: 10px; margin-top: 4px; overflow: hidden;">
                                <div style="position: absolute; left: 14%; width: 42%; height: 100%; background: rgba(0,255,136,0.2); border-radius: 0;"></div>
                                <div id="cortisol-marker" style="position: absolute; left: 40%; top: 3px; width: 4px; height: 14px; background: #ff00ff; border-radius: 2px; transition: left 0.3s;"></div>
                                <span style="position: absolute; left: 14%; top: 3px; font-size: 0.55rem; color: #555;">100</span>
                                <span style="position: absolute; right: 2px; top: 3px; font-size: 0.55rem; color: #555;">800</span>
                            </div>
                            <div style="font-size: 0.65rem; color: #555; margin-top: 3px;">Normal: 138–690 nmol/L (morning)</div>
                            <div id="cortisol-warning" style="display:none; font-size: 0.7rem; color: #ff4b2b; margin-top: 4px;">⚠ ELEVATED — Stress overload detected</div>
                        </div>
                        <div>
                            <div style="font-size: 0.7rem; color: #00ff88; margin-bottom: 8px; font-family: var(--font-heading);">TESTOSTERONE (RECOVERY MARKER)</div>
                            <div class="module-row">
                                <span style="font-size: 0.8rem;">Level (nmol/L)</span>
                                <input type="range" id="slider-testosterone" class="cyber-range" min="5" max="35" step="0.5" value="18.5" style="flex: 1; margin: 0 10px;">
                                <span id="val-testosterone" style="font-family: var(--font-heading); color: #00ff88; min-width: 55px; text-align: right;">18.5</span>
                            </div>
                            <div style="position: relative; height: 20px; background: rgba(0,0,0,0.3); border: 1px solid #333; border-radius: 10px; margin-top: 4px; overflow: hidden;">
                                <div style="position: absolute; left: 25%; width: 40%; height: 100%; background: rgba(0,255,136,0.2);"></div>
                                <div id="testo-marker" style="position: absolute; left: 45%; top: 3px; width: 4px; height: 14px; background: #00ff88; border-radius: 2px; transition: left 0.3s;"></div>
                                <span style="position: absolute; left: 1px; top: 3px; font-size: 0.55rem; color: #555;">5</span>
                                <span style="position: absolute; right: 2px; top: 3px; font-size: 0.55rem; color: #555;">35</span>
                            </div>
                            <div style="font-size: 0.65rem; color: #555; margin-top: 3px;">Normal athlete: 10–30 nmol/L</div>
                            <div id="testo-low-warning" style="display:none; font-size: 0.7rem; color: #ffd700; margin-top: 4px;">⚡ LOW — Overtraining suppression likely</div>
                        </div>
                    </div>
                    <div style="margin-top: 1.5rem; padding: 0.75rem; background: rgba(255,0,255,0.05); border: 1px solid rgba(255,0,255,0.2); border-radius: 4px;">
                        <div style="font-size: 0.65rem; color: #ff00ff; font-family: var(--font-heading); margin-bottom: 6px;">CORTISOL : TESTOSTERONE RATIO</div>
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <div id="val-cort-testo-ratio" style="font-size: 1.8rem; font-family: var(--font-heading); font-weight: 900; color: #ffd700;">20.5x</div>
                            <div style="font-size: 0.7rem; color: #aaa;">Healthy ratio: &lt;40x<br>High values indicate overtraining</div>
                        </div>
                    </div>
                </div>

                <!-- TAB 4: COGNITIVE LOAD -->
                <div id="med-cognitive" class="tab-content hidden">
                    <h3 style="color: #00ffff; font-size: 0.85rem; margin-top: 0;">COGNITIVE LOAD ANALYSIS</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                        <div>
                            <div style="font-family: var(--font-heading); font-size: 0.7rem; color: var(--accent-cyan); margin-bottom: 8px;">REACTION TIME</div>
                            <div style="display: flex; align-items: baseline; gap: 8px; margin-bottom: 12px;">
                                <input id="input-reaction-time" type="number" class="module-input" value="185" style="font-size: 2.5rem; font-family: var(--font-heading); font-weight: 900; color: var(--accent-cyan); width: 100px; text-align: center;">
                                <span style="color: #aaa; font-size: 0.8rem;">ms</span>
                            </div>
                            <div style="font-size: 0.7rem; color: #555;">Elite: &lt;200ms / World-class: &lt;160ms</div>
                            <div id="reaction-status" style="font-size: 0.75rem; color: #00ff88; margin-top: 4px;">✓ ELITE LEVEL</div>

                            <div style="margin-top: 1.2rem;">
                                <div style="font-family: var(--font-heading); font-size: 0.7rem; color: var(--accent-cyan); margin-bottom: 6px;">DUAL-TASK PERFORMANCE</div>
                                <div class="module-row"><span style="font-size: 0.8rem;">Cognitive Stress</span><input type="range" id="slider-cog-stress" class="cyber-range" min="0" max="100" value="35"><span id="val-cog-stress" style="color: #00ff88; min-width: 40px; text-align: right;">35%</span></div>
                                <div class="module-row"><span style="font-size: 0.8rem;">Decision Accuracy</span><div class="meter-wrapper"><div class="meter-fill" style="width: 91%; background: var(--accent-cyan);"></div></div><span style="font-size: 0.75rem; color: #aaa;">91%</span></div>
                                <div class="module-row"><span style="font-size: 0.8rem;">Attention Span</span><div class="meter-wrapper"><div class="meter-fill" style="width: 87%; background: var(--accent-cyan);"></div></div><span style="font-size: 0.75rem; color: #aaa;">87%</span></div>
                            </div>
                        </div>
                        <div>
                            <div style="font-family: var(--font-heading); font-size: 0.7rem; color: var(--accent-cyan); margin-bottom: 8px;">SESSION LOAD TRACKING</div>
                            <div style="display: flex; flex-direction: column; gap: 8px;">
                                <div style="padding: 10px; background: rgba(0,255,255,0.05); border: 1px solid rgba(0,255,255,0.15); border-radius: 4px;">
                                    <div style="font-size: 0.65rem; color: #555;">SESSION RPE (Self-report)</div>
                                    <input type="range" id="slider-rpe" class="cyber-range" min="1" max="10" value="7" style="margin: 6px 0;">
                                    <div style="display: flex; justify-content: space-between; font-size: 0.6rem; color: #555;"><span>Easy (1)</span><span id="val-rpe" style="color: var(--accent-cyan); font-weight: bold;">7/10</span><span>Max (10)</span></div>
                                </div>
                                <div style="padding: 10px; background: rgba(0,255,255,0.05); border: 1px solid rgba(0,255,255,0.15); border-radius: 4px;">
                                    <div style="font-size: 0.65rem; color: #555;">GPS Distance Today</div>
                                    <div style="font-size: 1.5rem; font-family: var(--font-heading); color: var(--accent-cyan);">11.4 km</div>
                                </div>
                                <div style="padding: 10px; background: rgba(0,255,255,0.05); border: 1px solid rgba(0,255,255,0.15); border-radius: 4px;">
                                    <div style="font-size: 0.65rem; color: #555;">High-Intensity Runs</div>
                                    <div style="font-size: 1.5rem; font-family: var(--font-heading); color: #ffd700;">42</div>
                                </div>
                            </div>
                            
                            <!-- V109: RTC PROTOKOLL -->
                            <div style="font-family: var(--font-heading); font-size: 0.7rem; color: #ff4b2b; margin-top: 16px; margin-bottom: 8px;">RTC-PROTOKOLL (LOAD MANAGEMENT)</div>
                            <div style="display: flex; flex-direction: column; gap: 6px; padding: 10px; background: rgba(255,75,43,0.05); border: 1px solid rgba(255,75,43,0.2); border-radius: 4px;">
                                <div style="display: flex; justify-content: space-between; font-size: 0.65rem; color: #ccc;">
                                    <span>Player: S. Gnabry</span>
                                    <span style="color: #ff4b2b;">Phase 3 / 5</span>
                                </div>
                                <div class="meter-wrapper" style="height: 6px; margin: 4px 0;"><div class="meter-fill" style="width: 60%; background: #ff4b2b;"></div></div>
                                <div style="font-size: 0.6rem; color: #888;">Current phase focus: Linear sprints (70% max speed), non-contact drills.</div>
                                <button class="cyber-btn" id="btn-rtc-advance" style="margin-top: 4px; font-size: 0.6rem; padding: 3px 8px; color: #b8c5d6;">ADVANCE RTC PHASE</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- CMO AI Briefing Log -->
                <div style="margin-top: 1.5rem; padding: 0.75rem; background: rgba(0,255,255,0.04); border: 1px solid rgba(0,255,255,0.2); border-radius: 4px;">
                    <div style="font-size: 0.65rem; color: var(--accent-cyan); margin-bottom: 6px; font-family: var(--font-heading); display: flex; align-items: center; gap: 6px;">🩺 CMO AI BRIEFING LOG</div>
                    <div id="cmo-briefing-log" style="font-size: 0.7rem; font-family: var(--font-mono); color: #ccc; min-height: 40px; max-height: 70px; overflow-y: auto; background: rgba(0,0,0,0.4); padding: 6px; border-radius: 4px;">
                        <span style="color: var(--accent-cyan);">&#62; CMO ONLINE. Bio-Sensor-Netzwerk aktiv...</span>
                        <span style="color: #ff4b2b; display: block; margin-top: 4px;">&#62; [ALERT] Rote Zone erkannt! HRV dropped by 23%. Überbelastung imminent for Midfield Core.</span>
                    </div>
                    <button id="btn-cmo-brief-now" class="cyber-btn" style="margin-top: 8px; font-size: 0.7rem; padding: 4px 12px;">MEDIZINISCHES BRIEFING ANFORDERN</button>
                </div>
            </div>
        </div>

        <!-- TACTICS LAB — V85 NLZ ELITE ACADEMY HUB -->
        <div id="modal-tactics" class="deep-dive-window hidden">
            <div class="modal-content outline-blue" style="width: 860px; max-width: 96vw;">
                <button class="close-modal cyber-btn attr-btn">SCHLIESSEN</button>
                <h2 style="color: var(--accent-blue); margin-top: 0; border-bottom: 1px solid rgba(0,136,255,0.3); padding-bottom: 5px;">
                    🏫 NLZ ELITE ACADEMY HUB
                </h2>

                <div style="display: grid; grid-template-columns: 160px 1fr; gap: 1.5rem; min-height: 420px;">
                    <!-- LEFT: Alter Group Navigator -->
                    <div style="display: flex; flex-direction: column; gap: 6px;">
                        <div style="font-size: 0.65rem; color: #0088ff; font-family: var(--font-heading); margin-bottom: 4px; letter-spacing: 1px;">ALTERSGRUPPEN</div>
                        <button class="age-group-btn active" data-group="g" data-year-min="2020" data-year-max="2024">G-YOUTH (U6)</button>
                        <button class="age-group-btn" data-group="f" data-year-min="2018" data-year-max="2020">F-YOUTH (U8)</button>
                        <button class="age-group-btn" data-group="e" data-year-min="2016" data-year-max="2018">E-YOUTH (U10)</button>
                        <button class="age-group-btn" data-group="d" data-year-min="2014" data-year-max="2016">D-YOUTH (U12)</button>
                        <button class="age-group-btn" data-group="c" data-year-min="2012" data-year-max="2014">C-YOUTH (U14)</button>
                        <button class="age-group-btn" data-group="b" data-year-min="2010" data-year-max="2012">B-YOUTH (U16)</button>
                        <button class="age-group-btn" data-group="a" data-year-min="2007" data-year-max="2010">A-YOUTH (U19)</button>

                        <div style="margin-top: auto; padding-top: 10px; border-top: 1px solid rgba(0,136,255,0.2);">
                            <div style="font-size: 0.6rem; color: #555; margin-bottom: 6px;">SPIELER HINZUFÜGEN</div>
                            <input id="nlz-new-name" type="text" placeholder="Name..." class="module-input" style="width: 100%; margin-bottom: 4px; border-bottom: 1px solid #333; font-size: 0.8rem;">
                            <input id="nlz-new-year" type="number" placeholder="Geburtsjahr" class="module-input" style="width: 100%; margin-bottom: 6px; border-bottom: 1px solid #333; font-size: 0.8rem;" min="2005" max="2024">
                            <button id="btn-nlz-add" class="cyber-btn" style="width: 100%; font-size: 0.65rem; padding: 4px; color: #0088ff;">+ ADD</button>
                        </div>
                    </div>

                    <!-- RIGHT: Squad + OVR Card Grid -->
                    <div>
                        <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1rem;">
                            <div>
                                <div id="nlz-group-title" style="font-family: var(--font-heading); color: var(--accent-blue); font-size: 1.1rem; margin-bottom: 8px;">G-JUGEND — U6</div>
                                
                                <!-- V109: 4 Structured Development Pillars -->
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; width: 620px;">
                                    <!-- Pillar 1 -->
                                    <div style="background: rgba(0,136,255,0.05); border: 1px solid rgba(0,136,255,0.2); padding: 8px; border-radius: 4px;">
                                        <div style="font-size: 0.65rem; color: #0088ff; font-family: var(--font-heading); margin-bottom: 4px;">1. KOORDINATION</div>
                                        <div style="font-size: 0.55rem; color: #aaa; margin-bottom: 6px;">Kinetische Ketten · Rhythmisierung · Neuronale Reaktivität</div>
                                        <div class="meter-wrapper" style="height: 4px;"><div id="nlz-pillar-1" class="meter-fill" style="width: 85%; background: var(--accent-blue);"></div></div>
                                    </div>
                                    <!-- Pillar 2 -->
                                    <div style="background: rgba(0,136,255,0.05); border: 1px solid rgba(0,136,255,0.2); padding: 8px; border-radius: 4px;">
                                        <div style="font-size: 0.65rem; color: #0088ff; font-family: var(--font-heading); margin-bottom: 4px;">2. TECH. BASICS</div>
                                        <div style="font-size: 0.55rem; color: #aaa; margin-bottom: 6px;">First-Touch-Präzision · Passschärfe · Offene Körperstellung</div>
                                        <div class="meter-wrapper" style="height: 4px;"><div id="nlz-pillar-2" class="meter-fill" style="width: 65%; background: var(--accent-blue);"></div></div>
                                    </div>
                                    <!-- Pillar 3 -->
                                    <div style="background: rgba(0,136,255,0.05); border: 1px solid rgba(0,136,255,0.2); padding: 8px; border-radius: 4px;">
                                        <div style="font-size: 0.65rem; color: #0088ff; font-family: var(--font-heading); margin-bottom: 4px;">3. SPIELINTELLIGENZ</div>
                                        <div style="font-size: 0.55rem; color: #aaa; margin-bottom: 6px;">Raumorientierung · Umschaltlogik · Entscheidungsqualität</div>
                                        <div class="meter-wrapper" style="height: 4px;"><div id="nlz-pillar-3" class="meter-fill" style="width: 45%; background: var(--accent-blue);"></div></div>
                                    </div>
                                    <!-- Pillar 4 -->
                                    <div style="background: rgba(0,136,255,0.05); border: 1px solid rgba(0,136,255,0.2); padding: 8px; border-radius: 4px;">
                                        <div style="font-size: 0.65rem; color: #0088ff; font-family: var(--font-heading); margin-bottom: 4px;">4. MOTIVATION</div>
                                        <div style="font-size: 0.55rem; color: #aaa; margin-bottom: 6px;">Resilienz · Leadership-Skills · Growth-Mindset</div>
                                        <div class="meter-wrapper" style="height: 4px;"><div id="nlz-pillar-4" class="meter-fill" style="width: 90%; background: var(--accent-blue);"></div></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="nlz-squad-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px; overflow-y: auto; max-height: 340px;">
                            <!-- Injected by JS -->
                        </div>
                    </div>
                </div>

                <!-- Academy Director Briefing -->
                <div style="margin-top: 1.5rem; padding: 0.75rem; background: rgba(0,136,255,0.04); border: 1px solid rgba(0,136,255,0.2); border-radius: 4px;">
                    <div style="font-size: 0.65rem; color: #0088ff; margin-bottom: 6px; font-family: var(--font-heading);">🏫 ACADEMY DIRECTOR BRIEFING</div>
                    <div id="academy-briefing-log" style="font-size: 0.7rem; font-family: var(--font-mono); color: #ccc; min-height: 35px; background: rgba(0,0,0,0.4); padding: 6px; border-radius: 4px;">
                        <span style="color: #0088ff;">&#62; Academy Director online. Loading age group data...</span>
                    </div>
                    <button id="btn-academy-brief-now" class="cyber-btn" style="margin-top: 8px; font-size: 0.7rem; padding: 4px 12px; color: #0088ff;">REQUEST BRIEFING</button>
                </div>
            </div>
        </div>

        <!-- ACADEMY LAB -->
        <div id="modal-academy" class="deep-dive-window hidden">
            <div class="modal-content outline-green">
                <button class="close-modal cyber-btn attr-btn">SCHLIESSEN</button>
                <h2 style="color: var(--accent-green); margin-top: 0; border-bottom: 1px solid var(--accent-green); padding-bottom: 5px;">NLZ // ELITE DEVELOPMENT</h2>
                
                <div class="tabs">
                    <button class="tab-btn active" data-tab="aca-foundational">Foundational Hub</button>
                    <button class="tab-btn" data-tab="aca-psychology">Psychology & Motivation</button>
                    <button class="tab-btn" data-tab="aca-tactical">Tactical Modules (V145)</button>
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

                <!-- V145: Tactical Modules -->
                <div id="aca-tactical" class="tab-content hidden">
                    <h3 style="color: var(--accent-green); font-size: 0.9rem; margin-bottom: 10px;">ELITE TACTICAL DRILLS</h3>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <!-- DRILLS -->
                        <div style="display: flex; flex-direction: column; gap: 10px;">
                            <!-- Drill 1 -->
                            <div style="background: rgba(0, 255, 136, 0.05); border: 1px solid rgba(0, 255, 136, 0.3); padding: 10px; border-radius: 4px;">
                                <div style="font-family: var(--font-heading); font-size: 0.8rem; color: #00ff88; margin-bottom: 4px;">1. HALBRAUM-DOMINANZ</div>
                                <div style="font-size: 0.7rem; color: #ccc; margin-bottom: 8px;">Übung: 4-gegen-4 + 3 Wandspieler. Fokus auf Overloads und schnelle Spielverlagerung in den isolierten Halbräumen.</div>
                                <div style="display: flex; gap: 6px;">
                                    <button id="btn-halbraum" class="cyber-btn" style="flex: 1; font-size: 0.65rem; padding: 4px; color: #b8c5d6;">BOARD HIGHLIGHT</button>
                                    <button class="cyber-btn nlz-beam-vr" data-drill="halbraum" style="flex: 1; font-size: 0.65rem; padding: 4px; color: #ff00ff; border-color: #ff00ff;">BEAM TO VR</button>
                                </div>
                            </div>
                            
                            <!-- Drill 2 -->
                            <div style="background: rgba(0, 255, 136, 0.05); border: 1px solid rgba(0, 255, 136, 0.3); padding: 10px; border-radius: 4px;">
                                <div style="font-family: var(--font-heading); font-size: 0.8rem; color: #00ff88; margin-bottom: 4px;">2. 5M-BOX-SOUVERÄNITÄT</div>
                                <div style="font-size: 0.7rem; color: #ccc; margin-bottom: 8px;">Torwart-Sicherheitszone. Luftzweikämpfe und Strafraumbeherrschung unter Bedrängnis trainieren.</div>
                                <div style="display: flex; gap: 6px;">
                                    <button id="btn-5mbox" class="cyber-btn" style="flex: 1; font-size: 0.65rem; padding: 4px; color: #b8c5d6;">OVERLAY TOGGLE</button>
                                    <button class="cyber-btn nlz-beam-vr" data-drill="5mbox" style="flex: 1; font-size: 0.65rem; padding: 4px; color: #ff00ff; border-color: #ff00ff;">BEAM TO VR</button>
                                </div>
                            </div>
                            
                            <button id="btn-sync-nlz-cfo" class="cyber-btn mt-2" style="width: 100%; font-size: 0.75rem; padding: 8px; color: #ffd700; border-color: #ffd700;">📂 SYNC NLZ DOSSIER TO AKTENTASCHE</button>
                        </div>
                        
                        <!-- NEURAL MINIGAME -->
                        <div style="background: rgba(255, 75, 43, 0.05); border: 1px solid rgba(255, 75, 43, 0.3); padding: 10px; border-radius: 4px; display: flex; flex-direction: column;">
                            <div style="font-family: var(--font-heading); font-size: 0.8rem; color: #ff4b2b; margin-bottom: 4px;">3. NEURAL REACTIVITY (MINIGAME)</div>
                            <div style="font-size: 0.7rem; color: #ccc; margin-bottom: 8px;">Decision Making &lt; 250ms. Evaluate situational triggers instantly.</div>
                            
                            <div id="neural-game-screen" style="flex: 1; background: #000; border: 1px solid #333; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; overflow: hidden; min-height: 120px;">
                                <div id="neural-prompt" style="font-family: var(--font-heading); font-size: 1.5rem; color: #fff; display: none;">PRESS START</div>
                            </div>
                            
                            <div style="font-size: 0.65rem; color: #00ff88; text-align: center; margin-top: 5px; font-family: var(--font-mono);">LAST REACTION: <span id="val-neural-ms">---</span> ms</div>
                            
                            <div style="display: flex; gap: 5px; margin-top: 10px;">
                                <button id="btn-neural-pass" class="cyber-btn neural-action" disabled style="flex: 1; font-size: 0.6rem; padding: 4px; color: #00ffff; border-color: #00ffff;">PASS</button>
                                <button id="btn-neural-shoot" class="cyber-btn neural-action" disabled style="flex: 1; font-size: 0.6rem; padding: 4px; color: #ff4b2b; border-color: #ff4b2b;">SCHUSS</button>
                                <button id="btn-neural-dribble" class="cyber-btn neural-action" disabled style="flex: 1; font-size: 0.6rem; padding: 4px; color: #00ff88; border-color: #00ff88;">DRIBBLE</button>
                            </div>
                            <button id="btn-neural-start" class="cyber-btn mt-2" style="width: 100%; font-size: 0.7rem; padding: 6px;">START REACTION TEST</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- VIDEO ANALYTICAL HUB — V86 -->
        <div id="modal-video" class="deep-dive-window hidden">
            <div class="modal-content" style="width: 820px; max-width: 96vw; box-shadow: 0 0 25px rgba(255,75,43,0.12);">
                <button class="close-modal cyber-btn attr-btn" style="color: #b8c5d6;">SCHLIESSEN</button>
                <h2 style="color: #ff4b2b; margin-top: 0; border-bottom: 1px solid rgba(255,75,43,0.3); padding-bottom: 5px;">
                    🎥 VIDEO ANALYTICAL HUB
                </h2>

                <div style="display: grid; grid-template-columns: 1fr 240px; gap: 1.5rem;">
                    <!-- LEFT: Video Player -->
                    <div>
                        <!-- Drop Zone / Player -->
                        <div id="video-dropzone" class="video-dropzone">
                            <video id="video-player" controls style="width: 100%; height: 100%; display: none; border-radius: 4px;"></video>
                            <div id="video-drop-hint" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; gap: 10px;">
                                <div style="font-size: 2rem;">🎬</div>
                                <div style="font-family: var(--font-heading); color: #ff4b2b; font-size: 0.9rem;">DROP MP4 HERE</div>
                                <div style="font-size: 0.7rem; color: #555;">or click to browse</div>
                                <input id="video-file-input" type="file" accept="video/mp4,video/webm" style="display: none;">
                                <button class="cyber-btn" onclick="document.getElementById('video-file-input').click()" style="color: #b8c5d6; font-size: 0.75rem; padding: 6px 16px;">BROWSE FILE</button>
                            </div>
                        </div>

                        <!-- AI Overlay Controls -->
                        <div style="margin-top: 10px; display: flex; gap: 8px; flex-wrap: wrap;">
                            <button class="cyber-btn video-overlay-btn" id="overlay-heatmap" style="font-size: 0.65rem; padding: 4px 10px; color: #b8c5d6;">🔴 HEATMAP</button>
                            <button class="cyber-btn video-overlay-btn" id="overlay-space" style="font-size: 0.65rem; padding: 4px 10px; color: #b8c5d6;">🕸 SPACE CONTROL</button>
                            <button class="cyber-btn video-overlay-btn" id="overlay-passes" style="font-size: 0.65rem; padding: 4px 10px; color: #b8c5d6;">↗ PROG. PASSES</button>
                            <button class="cyber-btn video-overlay-btn" id="overlay-distance" style="font-size: 0.65rem; padding: 4px 10px; color: #b8c5d6;">📏 DISTANCE TRACKING</button>
                            <button class="cyber-btn video-overlay-btn" id="overlay-sprint" style="font-size: 0.65rem; padding: 4px 10px; color: #b8c5d6;">⚡ SPRINT ZONES</button>
                            <button id="btn-sync-board" class="cyber-btn" style="font-size: 0.65rem; padding: 4px 10px; color: #b8c5d6; margin-left: auto;">🔄 SYNC TO BOARD</button>
                        </div>

                        <!-- Simulated Heatmap Overlay (visible when toggled) -->
                        <div id="heatmap-overlay" style="display: none; position: relative; margin-top: 8px; height: 80px; border-radius: 4px; overflow: hidden; background: #111; border: 1px solid rgba(255,75,43,0.2);">
                            <div style="position: absolute; left: 30%; top: 10%; width: 60px; height: 60px; border-radius: 50%; background: radial-gradient(circle, rgba(255,0,0,0.8) 0%, rgba(255,100,0,0.4) 50%, transparent 80%);"></div>
                            <div style="position: absolute; left: 55%; top: 20%; width: 40px; height: 40px; border-radius: 50%; background: radial-gradient(circle, rgba(255,150,0,0.7) 0%, transparent 70%);"></div>
                            <div style="position: absolute; left: 70%; top: 5%; width: 50px; height: 50px; border-radius: 50%; background: radial-gradient(circle, rgba(255,50,0,0.6) 0%, transparent 70%);"></div>
                            <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 0.65rem; color: rgba(255,75,43,0.5); font-family: var(--font-heading);">AI HEATMAP OVERLAY — LIVE</div>
                        </div>

                        <!-- V109: Space Control Overlay -->
                        <div id="space-overlay" style="display: none; position: relative; margin-top: 8px; height: 80px; border-radius: 4px; overflow: hidden; background: #111; border: 1px solid rgba(0,255,136,0.3);">
                            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                                <polygon points="10,80 40,20 70,30 90,70" fill="rgba(0,255,136,0.2)" stroke="#00ff88" stroke-width="1" stroke-dasharray="2,2"/>
                                <polygon points="30,90 20,40 50,50 60,85" fill="rgba(0,136,255,0.2)" stroke="#0088ff" stroke-width="1" stroke-dasharray="2,2"/>
                            </svg>
                            <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 0.65rem; color: rgba(0,255,136,0.5); font-family: var(--font-heading);">VORONOI SPACE CONTROL</div>
                        </div>

                        <!-- V109: Progressive Passes Overlay -->
                        <div id="passes-overlay" style="display: none; position: relative; margin-top: 8px; height: 80px; border-radius: 4px; overflow: hidden; background: #111; border: 1px solid rgba(255,0,255,0.3);">
                            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                                <defs>
                                    <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#ff00ff" />
                                    </marker>
                                </defs>
                                <path d="M 20 80 Q 40 40 80 20" fill="none" stroke="#ff00ff" stroke-width="1.5" marker-end="url(#arrow)"/>
                                <path d="M 30 70 C 50 60, 60 50, 75 45" fill="none" stroke="#ff00ff" stroke-width="1.5" stroke-dasharray="2,2" marker-end="url(#arrow)"/>
                            </svg>
                            <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 0.65rem; color: rgba(255,0,255,0.5); font-family: var(--font-heading);">PROGRESSIVE PASS VECTORS</div>
                        </div>

                        <!-- V109: AI Tagging Timeline -->
                        <div style="margin-top: 12px; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 6px;">
                            <div style="font-size: 0.6rem; color: #aaa; margin-bottom: 4px; font-family: var(--font-heading);">AI TAGGING TIMELINE</div>
                            <div style="position: relative; height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px;">
                                <div style="position: absolute; left: 15%; top: -3px; width: 10px; height: 10px; border-radius: 50%; background: #00ff88; border: 1px solid #000;" title="Goal"></div>
                                <div style="position: absolute; left: 32%; top: -3px; width: 10px; height: 10px; border-radius: 50%; background: #ff4b2b; border: 1px solid #000;" title="Turnover (Gegenpressing trigger)"></div>
                                <div style="position: absolute; left: 55%; top: -3px; width: 10px; height: 10px; border-radius: 50%; background: #ffd700; border: 1px solid #000;" title="Transition"></div>
                                <div style="position: absolute; left: 82%; top: -3px; width: 10px; height: 10px; border-radius: 50%; background: #00ff88; border: 1px solid #000;" title="Goal"></div>
                            </div>
                            <div style="display: flex; justify-content: space-between; font-size: 0.55rem; color: #555; margin-top: 4px;">
                                <span>00:00</span>
                                <span>45:00</span>
                                <span>90:00</span>
                            </div>
                        </div>
                    </div>

                    <!-- RIGHT: Controls + Clips -->
                    <div style="display: flex; flex-direction: column; gap: 10px;">
                        <div style="font-family: var(--font-heading); font-size: 0.7rem; color: #ff4b2b; margin-bottom: 2px;">TONI DIALOGUE</div>
                        <div style="font-size: 0.65rem; color: #555; background: rgba(0,0,0,0.3); padding: 6px; border-radius: 4px; font-family: var(--font-mono);" id="toni-video-log">> Ready for tactical query...</div>
                        <div style="display: flex; gap: 6px;">
                            <button class="cyber-btn" id="btn-toni-343" style="font-size: 0.6rem; padding: 3px 7px;">SHOW 3-4-3</button>
                            <button class="cyber-btn" id="btn-toni-finish" style="font-size: 0.6rem; padding: 3px 7px;">FINISH ZONES</button>
                        </div>

                        <div style="border-top: 1px solid rgba(255,75,43,0.2); padding-top: 8px;">
                            <div style="font-family: var(--font-heading); font-size: 0.7rem; color: #ff4b2b; margin-bottom: 6px;">CLIP ANNOTATIONS</div>
                            <div id="clip-list" style="display: flex; flex-direction: column; gap: 5px; max-height: 180px; overflow-y: auto;">
                                <div class="clip-entry">
                                    <span style="color: #ff4b2b; font-family: var(--font-heading);">02:14</span>
                                    <span style="font-size: 0.7rem; color: #ccc;">Pressing trigger — high block</span>
                                </div>
                                <div class="clip-entry">
                                    <span style="color: #ff4b2b; font-family: var(--font-heading);">07:43</span>
                                    <span style="font-size: 0.7rem; color: #ccc;">Half-space penetration — LAM</span>
                                </div>
                                <div class="clip-entry">
                                    <span style="color: #ff4b2b; font-family: var(--font-heading);">15:02</span>
                                    <span style="font-size: 0.7rem; color: #ccc;">Set piece — near post run</span>
                                </div>
                            </div>
                            
                            <!-- V109: Individual Homework -->
                            <div style="margin-top: 10px; padding: 8px; background: rgba(0,255,136,0.05); border: 1px solid rgba(0,255,136,0.2); border-radius: 4px;">
                                <div style="font-size: 0.65rem; color: #00ff88; margin-bottom: 4px; font-family: var(--font-heading);">INDIVIDUAL HOMEWORK</div>
                                <select class="module-input" id="homework-player-select" style="width: 100%; font-size: 0.7rem; margin-bottom: 4px; background: rgba(0,0,0,0.5);">
                                    <option value="J. Musiala">J. Musiala (LAM)</option>
                                    <option value="S. Gnabry">S. Gnabry (RW)</option>
                                    <option value="A. Pavlovic">A. Pavlovic (CDM)</option>
                                </select>
                                <button id="btn-send-homework" class="cyber-btn" style="width: 100%; font-size: 0.65rem; padding: 4px; color: #00ff88; border-color: rgba(0,255,136,0.4);">📱 SEND CLIP TO PHONE</button>
                            </div>
                            
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- MANAGEMENT LAB — V83 CFO SUITE -->

        <div id="modal-management" class="deep-dive-window hidden">
            <div class="modal-content outline-gold" style="width: 800px; max-width: 95vw; box-shadow: 0 0 30px rgba(255,215,0,0.15);">
                <button class="close-modal cyber-btn attr-btn" style="color: #b8c5d6;">SCHLIESSEN</button>
                <h2 style="color: #ffd700; margin-top: 0; border-bottom: 1px solid rgba(255,215,0,0.3); padding-bottom: 5px; display: flex; align-items: center; gap: 10px; position: relative;">
                    💰 <span>CFO MANAGEMENT SUITE</span>
                    <span id="cfo-alert-badge" style="font-size: 0.65rem; background: rgba(255,75,43,0.2); border: 1px solid #ff4b2b; color: #ff4b2b; padding: 2px 8px; border-radius: 12px; display: none;">⚠ ALERTS ACTIVE</span>
                    <img id="avatar-management" src="assets/avatars/toni_manager.jpg" style="position: absolute; right: 0; top: -10px; width: 60px; height: 60px; border-radius: 4px; border: 2px solid #ffd700; opacity: 0; transition: opacity 0.8s ease; object-fit: cover;">
                </h2>

                <div class="tabs">
                    <button class="tab-btn active" data-tab="mgmt-finance" style="color: #ffd700;">📊 Finance & P&L</button>
                    <button class="tab-btn" data-tab="mgmt-infra">🏗 Infrastructure</button>
                    <button class="tab-btn" data-tab="mgmt-legal">📋 Legal & Contracts</button>
                    <button class="tab-btn" data-tab="mgmt-media">🎙️ Media & Editorial</button>
                    <button class="tab-btn" data-tab="mgmt-sponsoring" style="color: #d4af37; border-color: #d4af37; text-shadow: 0 0 5px rgba(212,175,55,0.5);">💎 VIP Sponsoring</button>
                    <button class="tab-btn" data-tab="mgmt-history">🗂 Briefing History</button>
                </div>

                <!-- TAB 1: FINANCE & STRATEGIC DASHBOARD (V180) -->
                <div id="mgmt-finance" class="tab-content active">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
                        
                        <!-- LEFT: Budget Visualization (Financial-Glassmorphism) -->
                        <div style="background: rgba(10, 15, 25, 0.6); backdrop-filter: blur(10px); border: 1px solid rgba(0,255,255,0.2); border-radius: 8px; padding: 1rem; position: relative; overflow: hidden;">
                            <h3 style="color: #00ffff; font-size: 0.85rem; margin-top: 0; font-family: var(--font-heading); display: flex; justify-content: space-between; align-items: center;">
                                BUDGET VISUALISIERUNG (FY 26/27)
                                <span id="budget-status-label" style="font-size: 0.65rem; background: rgba(0,255,136,0.2); color: #00ff88; padding: 2px 6px; border-radius: 4px;">OK</span>
                            </h3>

                            <!-- Donut charts -->
                            <div style="display: flex; justify-content: space-around; margin: 1.5rem 0;">
                                <!-- Kader -->
                                <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
                                    <div style="width: 60px; height: 60px; border-radius: 50%; background: conic-gradient(#ff4b2b 0% 85%, rgba(255,255,255,0.1) 85% 100%); display: flex; align-items: center; justify-content: center; position: relative;">
                                        <div style="width: 45px; height: 45px; border-radius: 50%; background: #0a0f19;"></div>
                                        <div style="position: absolute; font-size: 0.65rem; color: #fff; font-family: var(--font-heading);">85%</div>
                                    </div>
                                    <div style="font-size: 0.6rem; color: #aaa; font-family: var(--font-heading);">PERSONA (KADER)</div>
                                </div>
                                <!-- Infra -->
                                <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
                                    <div style="width: 60px; height: 60px; border-radius: 50%; background: conic-gradient(#ffd700 0% 25%, rgba(255,255,255,0.1) 25% 100%); display: flex; align-items: center; justify-content: center; position: relative;">
                                        <div style="width: 45px; height: 45px; border-radius: 50%; background: #0a0f19;"></div>
                                        <div style="position: absolute; font-size: 0.65rem; color: #fff; font-family: var(--font-heading);">25%</div>
                                    </div>
                                    <div style="font-size: 0.6rem; color: #aaa; font-family: var(--font-heading);">INFRASTRUKTUR</div>
                                </div>
                                <!-- Transfer -->
                                <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
                                    <div style="width: 60px; height: 60px; border-radius: 50%; background: conic-gradient(#00ffff 0% 40%, rgba(255,255,255,0.1) 40% 100%); display: flex; align-items: center; justify-content: center; position: relative;">
                                        <div style="width: 45px; height: 45px; border-radius: 50%; background: #0a0f19;"></div>
                                        <div style="position: absolute; font-size: 0.65rem; color: #fff; font-family: var(--font-heading);">40%</div>
                                    </div>
                                    <div style="font-size: 0.6rem; color: #aaa; font-family: var(--font-heading);">TRANSFER</div>
                                </div>
                            </div>

                            <div class="module-row" style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 10px;">
                                <span style="font-size: 0.75rem; color: #fff;">Simulated Net Profit:</span>
                                <input type="range" id="slider-net-profit" class="cyber-range" min="-10" max="40" step="0.5" value="24.5">
                                <span id="val-net-profit" style="color: #00ff88; font-family: var(--font-heading); font-size: 0.85rem; width: 60px; text-align: right;">+24.5 M</span>
                            </div>

                            <!-- Marktwert Live Curve SVG -->
                            <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px dashed rgba(0,255,255,0.3);">
                                <div style="font-size: 0.65rem; color: #00ffff; margin-bottom: 5px; font-family: var(--font-heading); display: flex; justify-content: space-between;">
                                    <span>SQUAD MARKTWERT LIVE-KURVE</span>
                                    <span style="color: #00ff88;">+1.2%</span>
                                </div>
                                <svg width="100%" height="60" viewBox="0 0 300 60">
                                    <polyline id="cfo-market-line" points="0,50 50,45 100,55 150,30 200,35 250,15 300,10" fill="none" stroke="#00ffff" stroke-width="2"/>
                                    <polygon id="cfo-market-area" points="0,60 0,50 50,45 100,55 150,30 200,35 250,15 300,10 300,60" fill="rgba(0, 255, 255, 0.1)"/>
                                    <!-- Sync marker dynamically moving -->
                                    <circle id="cfo-market-blip" cx="300" cy="10" r="3" fill="#00ffff">
                                        <animate attributeName="r" values="3;6;3" dur="1s" repeatCount="indefinite" />
                                    </circle>
                                </svg>
                                <div style="display: flex; justify-content: space-between; align-items: baseline; margin-top: 5px;">
                                    <span style="font-size: 0.65rem; color: #666;">YTD</span>
                                    <div>
                                        <span id="cfo-market-val-huge" style="font-size: 1.8rem; font-family: var(--font-heading); font-weight: bold; color: #fff;">845.5</span>
                                        <span style="font-size: 0.75rem; color: #00ffff;"> M€</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- RIGHT: Sponsoring Matrix -->
                        <div>
                            <h3 style="color: #ffd700; font-size: 0.85rem; margin-top: 0;">SPONSORING MATRIX</h3>
                            <div style="display: flex; flex-direction: column; gap: 8px;">
                                <div style="background: rgba(255,215,0,0.05); border: 1px solid rgba(255,215,0,0.2); border-radius: 4px; padding: 8px;">
                                    <div style="font-size: 0.65rem; color: #ffd700; margin-bottom: 4px; font-family: var(--font-heading);">JERSEY — MAIN SPONSOR</div>
                                    <div class="module-row" style="margin-bottom: 0;">
                                        <input type="text" id="input-sponsor-sleeve" class="module-input" value="Qatar Airways" style="font-size: 0.9rem; font-weight: bold; flex: 1;">
                                        <input type="number" class="module-input" value="18" style="width: 40px; text-align: right; color: #ffd700;">
                                        <span style="color: #aaa; font-size: 0.7rem;">M€/yr</span>
                                    </div>
                                </div>
                                <div style="background: rgba(255,215,0,0.05); border: 1px solid rgba(255,215,0,0.2); border-radius: 4px; padding: 8px;">
                                    <div style="font-size: 0.65rem; color: #ffd700; margin-bottom: 4px; font-family: var(--font-heading);">SLEEVE — CRYPTO PARTNER</div>
                                    <div class="module-row" style="margin-bottom: 0;">
                                        <input type="text" id="input-sponsor-crypto" class="module-input" value="Binance" style="font-size: 0.9rem; font-weight: bold; flex: 1;">
                                        <input type="number" class="module-input" value="6" style="width: 40px; text-align: right; color: #ffd700;">
                                        <span style="color: #aaa; font-size: 0.7rem;">M€/yr</span>
                                    </div>
                                </div>
                                <div style="background: rgba(0,255,255,0.04); border: 1px dashed rgba(0,255,255,0.2); border-radius: 4px; padding: 8px;">
                                    <div style="font-size: 0.65rem; color: #555; margin-bottom: 4px; font-family: var(--font-heading);">SLOT 3 — OPEN</div>
                                    <div class="module-row" style="margin-bottom: 0;">
                                        <input type="text" id="input-sponsor-slot3" class="module-input" placeholder="Sponsor Name..." style="font-size: 0.85rem; flex: 1; color: #555;">
                                        <input type="number" class="module-input" placeholder="0" style="width: 40px; text-align: right; color: #555;">
                                        <span style="color: #333; font-size: 0.7rem;">M€/yr</span>
                                    </div>
                                </div>
                                <div style="background: rgba(0,255,255,0.04); border: 1px dashed rgba(0,255,255,0.2); border-radius: 4px; padding: 8px;">
                                    <div style="font-size: 0.65rem; color: #555; margin-bottom: 4px; font-family: var(--font-heading);">SLOT 4 — OPEN</div>
                                    <div class="module-row" style="margin-bottom: 0;">
                                        <input type="text" id="input-sponsor-slot4" class="module-input" placeholder="Sponsor Name..." style="font-size: 0.85rem; flex: 1; color: #555;">
                                        <input type="number" class="module-input" placeholder="0" style="width: 40px; text-align: right; color: #555;">
                                        <span style="color: #333; font-size: 0.7rem;">M€/yr</span>
                                    </div>
                                </div>
                            </div>

                            <!-- V109: Sponsoring ROI KPIs -->
                            <div style="margin-top: 1.5rem; padding: 0.75rem; background: rgba(0,255,136,0.05); border: 1px solid rgba(0,255,136,0.2); border-radius: 4px;">
                                <div style="font-size: 0.65rem; color: #00ff88; margin-bottom: 8px; font-family: var(--font-heading);">SPONSORING ROI KPIs</div>
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                                    <div style="text-align: center; padding: 10px; background: rgba(0,0,0,0.3); border-radius: 4px;">
                                        <div style="font-size: 0.6rem; color: #aaa;">Est. Logo Impressions</div>
                                        <div style="font-size: 1.4rem; font-family: var(--font-heading); color: #00ff88; margin-top: 4px;">4.2B</div>
                                        <div style="font-size: 0.55rem; color: #555;">(TV + Social + Stadium)</div>
                                    </div>
                                    <div style="text-align: center; padding: 10px; background: rgba(0,0,0,0.3); border-radius: 4px;">
                                        <div style="font-size: 0.6rem; color: #aaa;">Media Equivalent Marktwert</div>
                                        <div style="font-size: 1.4rem; font-family: var(--font-heading); color: #00ff88; margin-top: 4px;">142M€</div>
                                        <div style="font-size: 0.55rem; color: #555;">+12% vs LY</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- TAB 2: INFRASTRUCTURE -->
                <div id="mgmt-infra" class="tab-content hidden">
                    <h3 style="color: #ffd700; font-size: 0.85rem; margin-top: 0;">FACILITY EXPANSION TRACKER</h3>
                    <div style="display: flex; flex-direction: column; gap: 1.2rem;">
                        <div style="padding: 1rem; background: rgba(0,136,255,0.07); border: 1px solid rgba(0,136,255,0.25); border-radius: 6px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                                <span style="font-family: var(--font-heading); color: #0088ff; font-size: 0.8rem;">ANALYSIS CENTER — PHASE 3</span>
                                <span id="val-infra-analysis" style="font-family: var(--font-heading); color: #ffd700; font-size: 0.9rem; font-weight: 900;">80%</span>
                            </div>
                            <div class="pl-bar-wrapper">
                                <div class="pl-bar-fill" id="bar-infra-analysis" style="width: 80%; background: linear-gradient(90deg, #0088ff, #00ffff);"></div>
                            </div>
                            <input type="range" id="input-infra-analysis" class="cyber-range" min="0" max="100" value="80" style="margin-top: 10px;">
                            <div style="font-size: 0.7rem; color: #aaa; margin-top: 6px;">🔹 VR Integration: Active — 3D Data Walls Unlocked</div>
                            <div style="font-size: 0.7rem; color: #aaa;">🔹 Pending: Biometric Lab Expansion (est. 3.2M€)</div>
                        </div>

                        <div style="padding: 1rem; background: rgba(0,255,136,0.07); border: 1px solid rgba(0,255,136,0.25); border-radius: 6px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                                <span style="font-family: var(--font-heading); color: #00ff88; font-size: 0.8rem;">NLZ ELITE ACADEMY — EXPANSION</span>
                                <span id="val-infra-nlz" style="font-family: var(--font-heading); color: #ffd700; font-size: 0.9rem; font-weight: 900;">65%</span>
                            </div>
                            <div class="pl-bar-wrapper">
                                <div class="pl-bar-fill" id="bar-infra-nlz" style="width: 65%; background: linear-gradient(90deg, #00ff88, #ffd700);"></div>
                            </div>
                            <input type="range" id="input-infra-nlz" class="cyber-range" min="0" max="100" value="65" style="margin-top: 10px;">
                            <div style="font-size: 0.7rem; color: #aaa; margin-top: 6px;">🔹 New U14/U16 Training Pitch: Approved</div>
                            <div style="font-size: 0.7rem; color: #aaa;">🔹 Holographic Studio (Phase 2): Pending Budget Release</div>
                        </div>

                        <div style="padding: 1rem; background: rgba(255,0,255,0.07); border: 1px solid rgba(255,0,255,0.25); border-radius: 6px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                                <span style="font-family: var(--font-heading); color: var(--accent-magenta); font-size: 0.8rem;">STADIUM MEDIA INFRASTRUCTURE</span>
                                <span style="font-family: var(--font-heading); color: #ffd700; font-size: 0.9rem; font-weight: 900;">92%</span>
                            </div>
                            <div class="pl-bar-wrapper">
                                <div class="pl-bar-fill" style="width: 92%; background: linear-gradient(90deg, #ff00ff, #ff4b2b);"></div>
                            </div>
                            <div style="font-size: 0.7rem; color: #aaa; margin-top: 10px;">🔹 LED Perimeter Boards: Fully Operational</div>
                            <div style="font-size: 0.7rem; color: #aaa;">🔹 Stadionzeitung Digital Suite: Live</div>
                        </div>
                    </div>
                </div>

                <!-- TAB 3: LEGAL / CONTRACTS -->
                <div id="mgmt-legal" class="tab-content hidden">
                    <h3 style="color: #ffd700; font-size: 0.85rem; margin-top: 0;">CONTRACT ARCHIVE <span style="color: #ff4b2b; font-size: 0.65rem;" id="legal-expiry-count"></span></h3>
                    <div style="overflow-x: auto;">
                        <table style="width: 100%; border-collapse: collapse; font-size: 0.75rem; font-family: var(--font-mono);">
                            <thead>
                                <tr style="color: #ffd700; border-bottom: 1px solid rgba(255,215,0,0.3); text-align: left;">
                                    <th style="padding: 6px 8px;">CONTRACT</th>
                                    <th style="padding: 6px 8px;">PARTNER</th>
                                    <th style="padding: 6px 8px;">VALUE</th>
                                    <th style="padding: 6px 8px;">EXPIRES</th>
                                    <th style="padding: 6px 8px;">STATUS</th>
                                    <th style="padding: 6px 8px;"></th>
                                </tr>
                            </thead>
                            <tbody id="contracts-table-body">
                                <!-- Injected by JS -->
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- V110 / V111: MEDIA & EDITORIAL HUB -->
                <div id="mgmt-media" class="tab-content hidden">
                    <h3 style="color: #0cf; font-size: 0.85rem; margin-top: 0; display:flex; justify-content:space-between;">
                        <span>STADIONZEITUNG & SOCIAL MEDIA HUB</span>
                        <span style="color:#00ff88; font-size:0.6rem; border:1px solid #00ff88; padding:2px 6px; border-radius:4px;">AI ENGINE ACTIVE</span>
                    </h3>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <!-- AI Quote Generator (V110) -->
                        <div style="background: rgba(10,20,35,0.8); border: 1px solid rgba(0,204,255,0.3); border-radius: 6px; padding: 12px; display:flex; flex-direction:column;">
                            <div style="color: #b8c5d6; font-size: 0.75rem; font-family: var(--font-heading); margin-bottom: 10px; border-bottom: 1px solid rgba(0,204,255,0.2); padding-bottom: 4px;">📰 MATCH REPORT & AI QUOTES</div>
                            
                            <div class="module-row" style="margin-bottom:8px;">
                                <span style="font-size: 0.75rem;">Mood-Profile (The Vox)</span>
                                <select id="media-mood-profile" class="cyber-btn" style="background:#050a0f; color:#fff; border:1px solid #1a2744; border-radius:4px; font-size:0.7rem; padding:4px;">
                                    <option value="analyst">The Analyst (Nagelsmann)</option>
                                    <option value="leader">The Leader (Klopp)</option>
                                    <option value="kritisch">Kritisch-Konstruktiv</option>
                                </select>
                            </div>
                            
                            <div class="module-row" style="margin-bottom:12px;">
                                <span style="font-size: 0.75rem;">Dein Puls heute? (1-3)</span>
                                <input type="range" id="media-pulse-input" class="cyber-range" min="1" max="3" value="2" style="width:80px;">
                            </div>

                            <button class="cyber-btn w-100" onclick="generateEditorialReport()" style="background: rgba(0,204,255,0.1); border-color:#0cf; color:#0cf; padding:8px; margin-bottom:8px;">
                                📄 STADIONZEITUNG GENERIEREN
                            </button>
                            
                            <!-- V110: 3-Fragen Interview Button -->
                            <button class="cyber-btn w-100" onclick="startPostMatchInterview()" style="background: rgba(204,0,0,0.1); border-color:#cc0000; color:#cc0000; padding:8px;">
                                🎙️ POST-MATCH INTERVIEW STARTEN
                            </button>
                        </div>

                        <!-- Neural TTS & Social Export (V111) -->
                        <div style="background: rgba(10,20,35,0.8); border: 1px solid rgba(204,0,0,0.3); border-radius: 6px; padding: 12px; display:flex; flex-direction:column;">
                            <div style="color: #b8c5d6; font-size: 0.75rem; font-family: var(--font-heading); margin-bottom: 10px; border-bottom: 1px solid rgba(204,0,0,0.2); padding-bottom: 4px;">📱 SOCIAL MEDIA AUDIO EXPORT</div>
                            
                            <div style="flex:1; display:flex; flex-direction:column; justify-content:center; align-items:center; background:rgba(0,0,0,0.4); border-radius:4px; padding:10px; margin-bottom:12px;">
                                <div style="font-size:0.65rem; color:#aaa; margin-bottom:8px; text-align:center;">Generiert ein 15-sekündiges Audio-Teaser-Snippet mit The Red Bulletin Soundscape.</div>
                                <div id="social-waveform-preview" style="display:none; width:100%; height:40px; background:rgba(204,0,0,0.1); border-radius:4px; align-items:center; justify-content:center; gap:2px; margin-bottom:8px;">
                                    <div class="vox-bar" style="width:3px; height:10px; background:#cc0000; border-radius:2px;"></div>
                                    <div class="vox-bar" style="width:3px; height:20px; background:#cc0000; border-radius:2px;"></div>
                                    <div class="vox-bar" style="width:3px; height:15px; background:#cc0000; border-radius:2px;"></div>
                                    <div class="vox-bar" style="width:3px; height:28px; background:#cc0000; border-radius:2px;"></div>
                                    <div class="vox-bar" style="width:3px; height:8px; background:#cc0000; border-radius:2px;"></div>
                                </div>
                            </div>
                            
                            <button class="cyber-btn mt-2 w-100" onclick="generateSocialClip()" style="background: rgba(204,0,0,0.2); border-color:#cc0000; color:#fff; padding:8px; font-weight:700;">
                                🎥 SOCIAL-CLIP GENERIEREN
                            </button>
                        </div>
                    </div>

                    <!-- V109: Editorial Live Ticker -->
                    <div id="editorial-live-ticker" style="display:none; margin-top: 12px; padding: 10px 12px; background: rgba(255,215,0,0.05); border: 1px solid rgba(255,215,0,0.25); border-left: 3px solid #ffd700; border-radius: 4px;">
                        <!-- Injected by JS after generateEditorialReport() -->
                    </div>

                    <!-- V109: Social KPI Strip -->
                    <div style="margin-top: 10px; padding: 8px 12px; background: rgba(0,255,136,0.04); border: 1px solid rgba(0,255,136,0.15); border-radius: 4px; display:flex; justify-content:space-between; align-items:center;">
                        <div style="font-size:0.6rem; color:#aaa; font-family:var(--font-heading);">SOCIAL REACH</div>
                        <div id="editorial-social-reach" style="font-size:0.65rem; color:#00ff88;">—</div>
                    </div>
                </div>

                <!-- TAB: BRIEFING HISTORY (V89) -->

                <div id="mgmt-history" class="tab-content hidden">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
                        <div style="font-family: var(--font-heading); color: #ffd700; font-size: 0.85rem;" data-i18n="briefing-history">🗂 Briefing History</div>
                        <button id="btn-clear-history" class="cyber-btn" style="font-size: 0.6rem; padding: 3px 8px; color: #b8c5d6;">CLEAR ALL</button>
                    </div>
                    <div id="briefing-history-list" style="display: flex; flex-direction: column; gap: 8px; max-height: 380px; overflow-y: auto;">
                        <!-- Injected by JS from localStorage -->
                        <div style="font-size: 0.7rem; color: #555; text-align: center; padding: 2rem;">No briefings stored yet.<br>Say "SESSION SPEICHERN" to trigger a daily briefing.</div>
                    </div>
                </div>

                <!-- CFO AI Briefing Log -->
                <div style="margin-top: 1.5rem; padding: 0.75rem; background: rgba(255,215,0,0.04); border: 1px solid rgba(255,215,0,0.2); border-radius: 4px;">
                    <div style="font-size: 0.65rem; color: #ffd700; margin-bottom: 6px; font-family: var(--font-heading); display: flex; align-items: center; gap: 6px;">💰 CFO AI BRIEFING LOG</div>
                    <div id="cfo-briefing-log" style="font-size: 0.7rem; font-family: var(--font-mono); color: #ccc; min-height: 50px; max-height: 80px; overflow-y: auto; background: rgba(0,0,0,0.4); padding: 6px; border-radius: 4px;">
                        <span style="color: #ffd700;">&gt; CFO SYSTEM ONLINE. Scanning financial data...</span>
                    </div>
                    <!-- EVENT P&L SUB-MODULE (V90) -->
                <div class="module-box" style="margin-top: 1rem; border: 1px solid rgba(255,215,0,0.3);">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem;">
                        <h3 class="module-title" style="color: #ffd700; margin: 0;" data-i18n="event-pl-title">⚽ EVENT P&amp;L — TURNIER-BUDGET</h3>
                        <select id="event-pl-type" class="cyber-btn" style="font-size: 0.65rem; padding: 3px 8px; color: #b8c5d6; background: transparent; cursor: pointer;">
                            <option value="senioren">Seniorenturnier</option>
                            <option value="jugend">Jugend-Cup</option>
                            <option value="funino">Funino-Event</option>
                            <option value="friendly">Freundschaftsspiel</option>
                        </select>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <!-- Income -->
                        <div>
                            <div style="font-family: var(--font-heading); font-size: 0.65rem; color: #00ff88; margin-bottom: 6px;" data-i18n="label-income">EINNAHMEN</div>
                            <div class="nlz-stat-row" style="margin-bottom: 4px;"><span data-i18n="event-sausage">Würstchenverkauf €</span><input id="ev-sausage" type="number" value="320" min="0" class="data-input" style="width: 70px; text-align: right;"></div>
                            <div class="nlz-stat-row" style="margin-bottom: 4px;"><span data-i18n="event-drinks">Getränke €</span><input id="ev-drinks" type="number" value="480" min="0" class="data-input" style="width: 70px; text-align: right;"></div>
                            <div class="nlz-stat-row" style="margin-bottom: 4px;"><span data-i18n="event-entry">Startgelder €</span><input id="ev-entry" type="number" value="600" min="0" class="data-input" style="width: 70px; text-align: right;"></div>
                            <div class="nlz-stat-row" style="margin-bottom: 4px;"><span data-i18n="event-sponsoring">Sponsoring €</span><input id="ev-sponsor" type="number" value="200" min="0" class="data-input" style="width: 70px; text-align: right;"></div>
                            <div class="nlz-stat-row" style="font-weight: 700; margin-top: 4px; border-top: 1px solid rgba(0,255,136,0.3); padding-top: 4px;">
                                <span data-i18n="label-total-income">Gesamt-Einnahmen</span>
                                <span id="ev-total-in" style="color: #00ff88;">€ 1.600</span>
                            </div>
                        </div>

                        <!-- Expenses -->
                        <div>
                            <div style="font-family: var(--font-heading); font-size: 0.65rem; color: #ff4b2b; margin-bottom: 6px;" data-i18n="label-expenses">AUSGABEN</div>
                            <div class="nlz-stat-row" style="margin-bottom: 4px;"><span data-i18n="event-pitch">Platzmiete €</span><input id="ev-pitch" type="number" value="150" min="0" class="data-input" style="width: 70px; text-align: right;"></div>
                            <div class="nlz-stat-row" style="margin-bottom: 4px;"><span data-i18n="event-referee">Schiedsrichter €</span><input id="ev-referee" type="number" value="80" min="0" class="data-input" style="width: 70px; text-align: right;"></div>
                            <div class="nlz-stat-row" style="margin-bottom: 4px;"><span data-i18n="event-trophies">Pokale/Medaillen €</span><input id="ev-trophies" type="number" value="120" min="0" class="data-input" style="width: 70px; text-align: right;"></div>
                            <div class="nlz-stat-row" style="margin-bottom: 4px;"><span data-i18n="event-misc">Sonstiges €</span><input id="ev-misc" type="number" value="50" min="0" class="data-input" style="width: 70px; text-align: right;"></div>
                            <div class="nlz-stat-row" style="font-weight: 700; margin-top: 4px; border-top: 1px solid rgba(255,75,43,0.3); padding-top: 4px;">
                                <span data-i18n="label-total-expenses">Gesamt-Ausgaben</span>
                                <span id="ev-total-out" style="color: #ff4b2b;">€ 400</span>
                            </div>
                        </div>
                    </div>

                    <!-- Profit Bar -->
                    <div style="margin-top: 12px; padding: 10px; background: rgba(0,0,0,0.3); border-radius: 4px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                            <div style="font-family: var(--font-heading); font-size: 0.8rem;" data-i18n="label-event-profit">EVENT-REINGEWINN</div>
                            <div id="ev-profit" style="font-family: var(--font-heading); font-size: 1.4rem; font-weight: 900; color: #00ff88;">€ 1.200</div>
                        </div>
                        <div style="height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden;">
                            <div id="ev-profit-bar" style="height: 100%; width: 75%; background: linear-gradient(90deg, #00ff88, #00cc66); border-radius: 3px; transition: width 0.4s ease, background 0.4s ease;"></div>
                        </div>
                        <div id="ev-invest-tip" style="margin-top: 8px; font-size: 0.7rem; color: #ffd700; display: none;"></div>
                        <button id="btn-procurement" class="procurement-btn" style="display: none; width: 100%; margin-top: 10px;">
                            🛍️ EINKAUFSLISTE GENERIEREN
                        </button>
                    </div>

                    <!-- Advisor Button: Spieler leistbar? -->
                    <div style="margin-top: 12px; padding: 10px; border: 1px solid rgba(0,136,255,0.25); border-radius: 4px; background: rgba(0,8,20,0.8);">
                        <div style="font-family: var(--font-heading); font-size: 0.65rem; color: var(--accent-blue); margin-bottom: 6px;" data-i18n="advisor-title">🤖 KI-ADVISOR — TRANSFER-CHECK</div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
                            <div>
                                <div style="font-size: 0.6rem; color: #555; margin-bottom: 2px;" data-i18n="label-handgeld">Handgeld</div>
                                <input id="advisor-fee" type="number" value="1000000" class="data-input" style="width: 100%; font-size: 0.7rem;">
                            </div>
                            <div>
                                <div style="font-size: 0.6rem; color: #555; margin-bottom: 2px;" data-i18n="label-salary">Jahresgehalt</div>
                                <input id="advisor-salary" type="number" value="36000" class="data-input" style="width: 100%; font-size: 0.7rem;">
                            </div>
                        </div>
                        <div style="display: flex; gap: 8px; align-items: center;">
                            <button id="btn-advisor-check" class="cyber-btn" style="flex: 1; color: #b8c5d6; font-size: 0.7rem;" data-i18n="btn-advisor-check">KANN ICH MIR DIESEN SPIELER LEISTEN?</button>
                            <div id="advisor-verdict" style="width: 32px; height: 32px; border-radius: 50%; border: 2px solid #555; display: flex; align-items: center; justify-content: center; font-size: 1rem; flex-shrink: 0;">—</div>
                        </div>
                        <div id="procurement-printout" class="procurement-list hidden">
                        <div class="proc-header">
                            <div class="proc-title">⚽ STARK ELITE — EINKAUFSLISTE</div>
                            <div class="proc-subtitle" id="proc-event-label">Seniorenturnier</div>
                            <div class="proc-date" id="proc-date"></div>
                        </div>
                        <table class="proc-table" id="proc-table">
                            <thead>
                                <tr><th>Artikel</th><th>Größe</th><th>Anzahl</th><th>Notiz</th></tr>
                            </thead>
                            <tbody id="proc-rows"></tbody>
                        </table>
                        <div style="margin-top: 12px; display: flex; gap: 8px; justify-content: flex-end;">
                            <button onclick="window.print()" class="cyber-btn" style="font-size: 0.65rem; color: #00ff88;">🖨️ DRUCKEN / EXPORTIEREN</button>
                            <button id="btn-proc-vr" class="cyber-btn" style="font-size: 0.65rem;">📡 AN VR SCREEN 3 SENDEN</button>
                        </div>
                    </div>

                    <div id="advisor-log" style="margin-top: 6px; font-size: 0.65rem; font-family: var(--font-mono); color: var(--text-secondary); min-height: 20px;"></div>
                    </div>
                </div>

                <!-- V180 THE VIRTUAL BRIEFCASE (AKTENTASCHE) -->
                <div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid rgba(255,215,0,0.3);">
                    <h3 style="color: #ffd700; font-size: 0.85rem; margin-top: 0; display: flex; align-items: center; gap: 8px;">
                        💼 VIRTUAL BRIEFCASE (SCHNELLZUGRIFF)
                    </h3>
                    <div style="display: flex; gap: 15px; margin-top: 15px;">
                        
                        <!-- Doc 1 -->
                        <div style="flex: 1; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 10px; display: flex; flex-direction: column; align-items: center; transition: 0.2s; cursor: pointer;" onmouseover="this.style.borderColor='#ffd700'; this.style.background='rgba(255,215,0,0.1)';" onmouseout="this.style.borderColor='rgba(255,255,255,0.1)'; this.style.background='rgba(0,0,0,0.4)';">
                            <div style="font-size: 2rem; margin-bottom: 5px;">📄</div>
                            <div style="font-family: var(--font-heading); font-size: 0.7rem; color: #fff; text-align: center;">Current P&L<br><span style="color:#aaa; font-size:0.55rem;">(Gewinn- und Verlustrechnung)</span></div>
                        </div>

                        <!-- Doc 2 -->
                        <div style="flex: 1; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 10px; display: flex; flex-direction: column; align-items: center; transition: 0.2s; cursor: pointer;" onmouseover="this.style.borderColor='#00ffff'; this.style.background='rgba(0,255,255,0.1)';" onmouseout="this.style.borderColor='rgba(255,255,255,0.1)'; this.style.background='rgba(0,0,0,0.4)';">
                            <div style="font-size: 2rem; margin-bottom: 5px;">📊</div>
                            <div style="font-family: var(--font-heading); font-size: 0.7rem; color: #fff; text-align: center;">Sponsoring-Exposé<br><span style="color:#aaa; font-size:0.55rem;">(PDF-Vorschau f. Partner)</span></div>
                        </div>

                        <!-- Doc 3 -->
                        <div style="flex: 1; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 10px; display: flex; flex-direction: column; align-items: center; transition: 0.2s; cursor: pointer;" onmouseover="this.style.borderColor='#00ff88'; this.style.background='rgba(0,255,136,0.1)';" onmouseout="this.style.borderColor='rgba(255,255,255,0.1)'; this.style.background='rgba(0,0,0,0.4)';">
                            <div style="font-size: 2rem; margin-bottom: 5px;">🏗️</div>
                            <div style="font-family: var(--font-heading); font-size: 0.7rem; color: #fff; text-align: center;">Stadion-Ausbauplan<br><span style="color:#aaa; font-size:0.55rem;">(Analysezentrum Erweiterung)</span></div>
                        </div>

                    </div>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px;">
                    <button id="btn-cfo-brief-now" class="cyber-btn" style="font-size: 0.7rem; padding: 4px 12px; color: #b8c5d6;">REQUEST VERBAL BRIEFING</button>
                    <button class="cyber-btn" style="font-size: 0.7rem; padding: 4px 12px; color: #ffd700; border-color: #ffd700;" onclick="document.querySelector('.tab-btn[data-tab=\'mgmt-sponsoring\']').click();">🤝 NEUEN PARTNER AKQUIRIEREN</button>
                </div>
                </div>

                <!-- TAB 5: VIP SPONSORING & PARTNER MANAGEMENT -->
                <div id="mgmt-sponsoring" class="tab-content hidden" style="background: linear-gradient(145deg, rgba(20,25,35,0.95), rgba(5,10,15,0.95)); border: 1px solid rgba(212,175,55,0.3); border-radius: 8px; padding: 20px; box-shadow: inset 0 0 20px rgba(212,175,55,0.05); position: relative; overflow: hidden;">
                    <!-- Subtle Gold Shimmer Background -->
                    <div style="position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(212,175,55,0.03) 0%, transparent 70%); pointer-events: none; animation: slow-spin 20s linear infinite;"></div>

                    <h3 style="color: #d4af37; font-size: 1.1rem; margin-top: 0; display: flex; align-items: center; gap: 10px; font-family: var(--font-heading); text-shadow: 0 0 10px rgba(212,175,55,0.3); border-bottom: 1px solid rgba(212,175,55,0.2); padding-bottom: 10px; margin-bottom: 20px;">
                        💎 STARK ELITE PARTNERSHIPS
                    </h3>

                    <div style="display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 20px;">
                        
                        <!-- LEFT COL: PITCH DECK -->
                        <div>
                            <div style="font-family: var(--font-heading); font-size: 0.7rem; color: #fff; margin-bottom: 10px; letter-spacing: 1px;">INTERACTIVE PITCH DECK</div>
                            <div id="sponsor-pitch-deck" style="background: rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; height: 220px; position: relative; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between;">
                                <!-- Slide Content Container -->
                                <div id="pitch-slides" style="padding: 20px; display: flex; transition: transform 0.5s cubic-bezier(0.25, 1, 0.5, 1); height: 100%;">
                                    <!-- Slide 1: VR -->
                                    <div class="pitch-slide" style="min-width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
                                        <div style="font-size: 3rem; margin-bottom: 10px; text-shadow: 0 0 20px rgba(0,255,255,0.5);">🥽</div>
                                        <h4 style="color: #0cf; margin: 0 0 5px 0; font-family: var(--font-heading);">IMMERSIVE BRANDING (VR)</h4>
                                        <p style="color: #aaa; font-size: 0.75rem; max-width: 80%;">Ihre Marke auf den holographischen LED-Banden im Meta Quest Stadion. 100% Sichtbarkeit bei taktischen Analysen.</p>
                                    </div>
                                    <!-- Slide 2: Journal -->
                                    <div class="pitch-slide" style="min-width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
                                        <div style="font-size: 3rem; margin-bottom: 10px; text-shadow: 0 0 20px rgba(212,175,55,0.5);">📰</div>
                                        <h4 style="color: #d4af37; margin: 0 0 5px 0; font-family: var(--font-heading);">STADIONZEITUNG INTEGRATION</h4>
                                        <p style="color: #aaa; font-size: 0.75rem; max-width: 80%;">Exklusives Branding im Scouting-Report und Medical-Corner. Native Einbettung in das Fachmagazin.</p>
                                    </div>
                                    <!-- Slide 3: AI Mention -->
                                    <div class="pitch-slide" style="min-width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
                                        <div style="font-size: 3rem; margin-bottom: 10px; text-shadow: 0 0 20px rgba(255,0,255,0.5);">🎙️</div>
                                        <h4 style="color: var(--accent-magenta); margin: 0 0 5px 0; font-family: var(--font-heading);">MANAGER-TONI BRIEFINGS</h4>
                                        <p style="color: #aaa; font-size: 0.75rem; max-width: 80%;">Ihre Marke wird von unserer KI im täglichen Briefing aktiv erwähnt. Höchste emotionale Bindung.</p>
                                    </div>
                                </div>
                                
                                <!-- Slider Controls -->
                                <div style="display: flex; justify-content: space-between; padding: 10px; background: rgba(0,0,0,0.4); border-top: 1px solid rgba(255,255,255,0.05);">
                                    <button class="cyber-btn" onclick="prevPitchSlide()" style="padding: 2px 10px; font-size: 0.7rem; color: #fff; background: transparent; border-color: rgba(255,255,255,0.2);">◀ ZURÜCK</button>
                                    <div id="pitch-dots" style="display: flex; gap: 5px; align-items: center;">
                                        <div class="pitch-dot active" style="width: 6px; height: 6px; border-radius: 50%; background: #0cf;"></div>
                                        <div class="pitch-dot" style="width: 6px; height: 6px; border-radius: 50%; background: #555;"></div>
                                        <div class="pitch-dot" style="width: 6px; height: 6px; border-radius: 50%; background: #555;"></div>
                                    </div>
                                    <button class="cyber-btn" onclick="nextPitchSlide()" style="padding: 2px 10px; font-size: 0.7rem; color: #fff; background: transparent; border-color: rgba(255,255,255,0.2);">WEITER ▶</button>
                                </div>
                            </div>
                        </div>

                        <!-- RIGHT COL: ROI CALCULATOR -->
                        <div>
                            <div style="font-family: var(--font-heading); font-size: 0.7rem; color: #fff; margin-bottom: 10px; letter-spacing: 1px;">ROI CALCULATOR</div>
                            <div style="background: rgba(212,175,55,0.05); border: 1px solid rgba(212,175,55,0.3); border-radius: 6px; padding: 15px;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                                    <span style="font-size: 0.7rem; color: #aaa;">INVESTMENT LEVEL (M€/yr)</span>
                                    <span id="roi-budget-val" style="font-family: var(--font-heading); font-size: 1.2rem; color: #d4af37; font-weight: bold;">5.0</span>
                                </div>
                                <input type="range" id="roi-budget-slider" class="cyber-range" min="0.5" max="25" step="0.5" value="5.0" style="margin-bottom: 15px;">
                                
                                <div style="font-size: 0.65rem; color: #555; margin-bottom: 5px; font-family: var(--font-heading);">UNLOCKED ASSETS</div>
                                <ul id="roi-asset-list" style="margin: 0; padding-left: 15px; font-size: 0.7rem; color: #ccc; line-height: 1.6;">
                                    <li><span style="color: #0cf;">🥽</span> VR Perimeter Board (Standard)</li>
                                    <li><span style="color: #d4af37;">📰</span> Logo in Data Grid</li>
                                </ul>

                                <button class="cyber-btn w-100" style="margin-top: 15px; background: rgba(212,175,55,0.1); border-color: #d4af37; color: #d4af37; font-family: var(--font-heading); text-shadow: 0 0 5px rgba(212,175,55,0.3);">
                                    VERTRAG GENERIEREN
                                </button>
                            </div>
                        </div>

                    </div>

                    <!-- BOTTOM ROW: Dashboard VIP Area -->
                    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
                        <div style="font-family: var(--font-heading); font-size: 0.7rem; color: #fff; margin-bottom: 10px; letter-spacing: 1px;">VIP PARTNER DASHBOARD</div>
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
                            
                            <!-- Tracking 1 -->
                            <div style="background: rgba(0,0,0,0.5); border-left: 3px solid #d4af37; padding: 10px; border-radius: 0 4px 4px 0;">
                                <div style="font-size: 0.6rem; color: #aaa; margin-bottom: 4px;">Est. Reach (Platform)</div>
                                <div style="font-family: var(--font-heading); font-size: 1.1rem; color: #fff;">2.4M</div>
                                <div style="font-size: 0.6rem; color: #00ff88;">+12% this month</div>
                            </div>
                            
                            <!-- Tracking 2 -->
                            <div style="background: rgba(0,0,0,0.5); border-left: 3px solid var(--accent-magenta); padding: 10px; border-radius: 0 4px 4px 0;">
                                <div style="font-size: 0.6rem; color: #aaa; margin-bottom: 4px;">AI Mentions (Audio)</div>
                                <div style="font-family: var(--font-heading); font-size: 1.1rem; color: #fff;">184</div>
                                <div style="font-size: 0.6rem; color: #aaa;">Last 30 days</div>
                            </div>

                            <!-- Aktentasche Link -->
                            <div style="background: rgba(0,0,0,0.5); border: 1px dashed rgba(255,255,255,0.2); padding: 10px; border-radius: 4px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; transition: 0.2s;" onmouseover="this.style.borderColor='#d4af37'; this.style.color='#d4af37';" onmouseout="this.style.borderColor='rgba(255,255,255,0.2)'; this.style.color='#fff';">
                                <div>
                                    <div style="font-size: 0.6rem; color: inherit; margin-bottom: 4px;">Document Hub</div>
                                    <div style="font-family: var(--font-heading); font-size: 0.8rem; color: inherit;">Sponsoring Exposé.pdf</div>
                                </div>
                                <div style="font-size: 1.5rem;">📥</div>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </div>

        
        <!-- SETTINGS MODAL OVERLAY -->
        <div id="settings-overlay" class="hidden" style="position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 999; display: flex; justify-content: center; align-items: center; backdrop-filter: blur(10px);">
            <div style="background: var(--bg-deep); border: 1px solid var(--accent-magenta); border-radius: 8px; width: 500px; padding: 2rem; position: relative;">
                <h2 style="font-family: var(--font-heading); color: var(--accent-magenta); margin-top: 0; border-bottom: 1px solid rgba(255,0,255,0.2); padding-bottom: 0.5rem;">SYSTEM EINSTELLUNGEN</h2>
                
                <div style="display: flex; flex-direction: column; gap: 1.5rem; margin-top: 1.5rem;">
                    <div>
                        <label style="color: var(--text-secondary); font-size: 0.8rem; font-weight: bold; display: block; margin-bottom: 5px;">HAPTIC FEEDBACK (VR)</label>
                        <select class="module-input" style="background: rgba(255,255,255,0.05); padding: 5px;">
                            <option>High Intensity</option>
                            <option>Medium</option>
                            <option>Off</option>
                        </select>
                    </div>
                    <div>
                        <label style="color: var(--text-secondary); font-size: 0.8rem; font-weight: bold; display: block; margin-bottom: 5px;">AI VOICE ASSISTANT</label>
                        <select class="module-input" style="background: rgba(255,255,255,0.05); padding: 5px;">
                            <option>TONI Tactical (Default)</option>
                            <option>Scouting Matrix</option>
                            <option>Medical AI</option>
                        </select>
                    </div>
                    <div>
                        <label style="color: var(--text-secondary); font-size: 0.8rem; font-weight: bold; display: block; margin-bottom: 5px;">DATA REFRESH RATE</label>
                        <select class="module-input" style="background: rgba(255,255,255,0.05); padding: 5px;">
                            <option>Real-Time (Low Latency)</option>
                            <option>10 Seconds</option>
                            <option>Manual Uplink</option>
                        </select>
                    </div>
                </div>
                
                <button id="btn-close-settings" class="cyber-btn" style="margin-top: 2rem; width: 100%;">APPLY & CLOSE</button>
            </div>
        </div>

        <!-- V75: DYNAMIC FIFA CARD CALCULATOR MODAL -->
        <div id="player-editor-overlay" class="hidden" style="position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 1000; display: flex; justify-content: center; align-items: center; backdrop-filter: blur(10px);">
            <div style="background: var(--bg-deep); border: 1px solid var(--accent-cyan); border-radius: 8px; width: 600px; padding: 2rem; position: relative;">
                <h2 style="font-family: var(--font-heading); color: var(--accent-cyan); margin-top: 0; border-bottom: 1px solid rgba(0,255,255,0.2); padding-bottom: 0.5rem; display: flex; justify-content: space-between;">
                    <span>PLAYER DEV MATRIX</span>
                    <span id="editor-player-name" style="color: #fff;">SELECT PLAYER</span>
                </h2>
                
                <div style="display: flex; gap: 2rem; margin-top: 1.5rem;">
                    <!-- Adjustments -->
                    <div style="flex: 1; display: flex; flex-direction: column; gap: 1rem;">
                        <select id="editor-age-context" class="cyber-select module-input" style="background: rgba(0,255,255,0.1); padding: 8px; color: var(--accent-cyan);">
                            <option value="youth">G-Youth to E-Youth (Funino Focus)</option>
                            <option value="transitional">D-Youth to U16 (Balanced)</option>
                            <option value="pro">Pro Context (Position specific)</option>
                        </select>

                        <!-- Sliders -->
                        <div id="editor-sliders">
                            <!-- Injected by JS -->
                        </div>
                    </div>

                    <!-- Live Preview -->
                    <div style="width: 200px; text-align: center; border-left: 1px solid rgba(255,255,255,0.1); padding-left: 2rem; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                        <span style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 10px;">DYNAMIC OVR</span>
                        <div id="editor-live-ovr" style="font-size: 4rem; font-family: var(--font-heading); font-weight: 900; color: var(--accent-cyan); text-shadow: 0 0 15px rgba(0,255,255,0.5);">--</div>
                        <span style="font-size: 0.7rem; color: #aaa; margin-top: 10px;">(Syncs to VR Hologram Scale)</span>
                    </div>
                </div>

                <div style="display: flex; gap: 1rem; margin-top: 2rem;">
                    <button id="btn-close-editor" class="cyber-btn" style="flex: 1; color: #888;">CANCEL</button>
                    <button id="btn-save-editor" class="cyber-btn" style="flex: 1;">INJECT ALGORITHM</button>
                </div>
            </div>
        </div>
    </div>

    <!-- VR LAYER -->
    <div id="vr-layer" class="hidden">
        <button id="btn-exit-vr" class="cyber-btn exit-vr-btn">VR VERLASSEN</button>
        <a-scene id="vr-scene-main" embedded renderer="antialias: true; colorManagement: true;" cursor="rayOrigin: mouse" raycaster="objects: .interactable">
            <a-assets timeout="5000">
                <!-- Skybox asset removed — using procedural gradient sky instead -->
            </a-assets>

            <!-- Player Rig for Locomotion (V120) -->
            <a-entity id="player-rig" position="0 0 0" movement-controls="controls: gamepad,keyboard">
                <a-camera id="vr-cam" position="0 1.6 0" look-controls="pointerLockEnabled: false">
                    <!-- Fallback cursor for Desktop Mode -->
                    <a-cursor color="#00ffff" raycaster="objects: .interactable" visible="false" id="desktop-cursor"></a-cursor>
                    
                    <!-- VR Gaze HUD -->
                    <a-entity id="vr-gaze-hud" position="0 0.6 -1" rotation="20 0 0">
                        <a-text value="CONNECTION SECURE" position="-0.4 0 0" color="#00ff00" scale="0.2 0.2 0.2" font="monoid"></a-text>
                        <a-text id="vr-hud-log-1" value="> SYSTEM INITIALISIERT" position="-0.4 -0.05 0" color="#00ffff" scale="0.15 0.15 0.15" font="monoid"></a-text>
                        <a-text id="vr-hud-log-2" value="> WAITING FOR CMDS" position="-0.4 -0.10 0" color="#aaa" scale="0.15 0.15 0.15" font="monoid"></a-text>
                        <a-text id="vr-hud-log-3" value="" position="-0.4 -0.15 0" color="#aaa" scale="0.15 0.15 0.15" font="monoid"></a-text>
                    </a-entity>
                </a-camera>

                <!-- Left Hand: Teleportation & UI Interaction -->
                <a-entity id="left-hand" 
                          oculus-touch-controls="hand: left" 
                          laser-controls="hand: left" 
                          raycaster="objects: .interactable; far: 10" 
                          teleport-controls="cameraRig: #player-rig; teleportOrigin: #vr-cam; button: thumbstick; curveSchussingSpeed: 8; collisionEntities: #floor; hitEntity: #teleport-marker">
                </a-entity>

                <!-- Right Hand: Grabbing & Snap Turn -->
                <a-entity id="right-hand" 
                          oculus-touch-controls="hand: right" 
                          laser-controls="hand: right" 
                          raycaster="objects: .interactable, .vr-card; far: 10"
                          custom-snap-turn
                          vr-grabber>
                </a-entity>
            </a-entity>
            
            <!-- Visuelles Feedback für Teleport -->
            <a-entity id="teleport-marker" geometry="primitive: cylinder; radius: 0.3; height: 0.05" material="color: #00ffff; opacity: 0.6; shader: flat" visible="false"></a-entity>

            <!-- TTS Welcome Trigger (Hidden) -->
            <a-entity id="tts-welcome-trigger" on-vr-enter="speak: Willkommen in der Zone, Coach. Die Taktiktafel ist bereit für Ihre Anweisungen."></a-entity>

            <!-- Environment -->
            <!-- VR Environment: Procedural dark stadium sky (no external asset needed) -->
            <a-sky color="#050a18"></a-sky>

            <!-- Stadium floor -->
            <a-plane rotation="-90 0 0" width="60" height="60"
                     material="color: #0a1a0a; roughness: 0.9; metalness: 0.0" shadow></a-plane>

            <!-- Subtle horizon glow ring -->
            <a-torus position="0 -0.5 0" radius="25" radius-tubular="0.8"
                     rotation="90 0 0"
                     material="color: #001a2e; emissive: #003366; emissiveIntensity: 0.3; transparent: true; opacity: 0.5">
            </a-torus>

            <!-- Stadium atmosphere: distant light pillars -->
            <a-cylinder position="-20 5 -20" radius="0.15" height="10"
                        material="color: #002244; emissive: #004488; emissiveIntensity: 0.4; transparent: true; opacity: 0.5">
            </a-cylinder>
            <a-cylinder position="20 5 -20" radius="0.15" height="10"
                        material="color: #002244; emissive: #004488; emissiveIntensity: 0.4; transparent: true; opacity: 0.5">
            </a-cylinder>
            
            <!-- V79: Infinite Data Horizon & Heartbeat Mountains -->
            <a-entity id="infinite-data-horizon" position="0 -50 -100"></a-entity>
            <a-plane id="heartbeat-terrain" width="200" height="100" segments-width="64" segments-height="32" rotation="-90 0 0" position="0 -5 -40" material="color: #050a0f; wireframe: true; emissive: #00ffff; emissiveIntensity: 0.2"></a-plane>

            <a-plane id="reflective-floor" class="interactable" rotation="-90 0 0" width="100" height="100" material="color: #080808; roughness: 0.1; metalness: 0.8"></a-plane>

            <!-- CENTER: Tactic Hub -->
            <a-entity id="tactic-hub" position="0 1.2 -3" rotation="0 0 0">
                <a-cylinder radius="1.6" height="0.9" color="#111" metalness="0.8" roughness="0.2" position="0 -0.5 0"></a-cylinder>
                <a-cylinder radius="1.5" height="0.91" color="#00ffff" material="wireframe: true" opacity="0.3" position="0 -0.5 0"></a-cylinder>
                
                <!-- VR Steuerungspanel (Control Panel) -->
                <a-entity id="vr-control-panel" position="0 1.5 -1.2" rotation="10 0 0">
                    <a-plane width="2.2" height="1.2" material="color: #050a0f; opacity: 0.9; transparent: true"></a-plane>
                    <!-- Frame outline --><a-plane width="2.22" height="1.22" material="color: #00ffff; wireframe: true" position="0 0 -0.01"></a-plane>
                    <a-text value="STEUERUNGSPANEL" align="center" position="0 0.45 0.02" width="2.5" color="#00ffff"></a-text>
                    
                    <!-- Mode Toggle VR Button -->
                    <a-entity id="btn-vr-mode" position="0 0.1 0.02" class="interactable">
                        <a-box width="1.6" height="0.3" depth="0.04" color="#111" material="metalness: 0.8; roughness: 0.2"></a-box>
                        <a-text id="txt-vr-mode" value="MODUS: SPIEL" align="center" position="0 0 0.03" width="2" color="#ff00ff"></a-text>
                    </a-entity>
                    
                    <!-- Save Lineup VR Button -->
                    <a-entity id="btn-vr-save" position="0 -0.3 0.02" class="interactable">
                        <a-box width="1.6" height="0.3" depth="0.04" color="#004444" material="metalness: 0.5"></a-box>
                        <a-text value="AUFSTELLUNG SPEICHERN" align="center" position="0 0 0.03" width="2" color="#ffffff"></a-text>
                    </a-entity>
                </a-entity>

                <!-- Floating Card Stock Container -->
                <a-entity id="floating-card-stock" position="-2.2 0.8 1.0" rotation="0 40 0">
                    <!-- Cards will be cloned/injected here via JS -->
                    <a-text value="KARTENVORRAT" align="center" position="0 0.8 0" width="3" color="#00ffff"></a-text>
                </a-entity>

                <!-- V145: Living Billboard Avatar (Trainer) -->
                <a-image id="avatar-vr-kabine" src="assets/avatars/toni_trainer.jpg" position="-3 1.8 -1.5" rotation="0 45 0" width="1.2" height="1.6" material="opacity: 0"
                         animation__fadein="property: material.opacity; from: 0; to: 1; dur: 800; startEvents: fadein"
                         animation__fadeout="property: material.opacity; from: 1; to: 0; dur: 800; startEvents: fadeout">
                </a-image>
                
                <!-- V120: Ergonomische Tischhöhe (1.10m) und leichter Winkel (-75°) für VR Controller Bedienung -->
                <a-entity id="vr-pitch-board" pitch-rotator rotation="-75 0 0" position="0 1.10 -0.5" class="interactable">
                    <!-- Base Board -->
                    <a-box width="3" height="2" depth="0.05" color="#030811" material="metalness: 0.9"></a-box>
                    
                    <!-- V79: High-Fidelity Pitch Lines & Goals -->
                    <a-entity position="0 0 0.03" id="vr-pitch-markings">
                        <!-- V145: 5-Meter Safety Box Overlay for NLZ Drill -->
                        <a-plane id="vr-5m-safety" width="0.5" height="0.15" color="#00ff88" material="opacity: 0; transparent: true" position="0 -0.825 0.03"
                                 animation__pulsate="property: material.opacity; from: 0.1; to: 0.4; dir: alternate; dur: 800; loop: true; enabled: false">
                            <a-text value="5M SAFETY ZONE" position="0 0 0.01" align="center" color="#000" scale="0.15 0.15 0.15" opacity="0"></a-text>
                        </a-plane>
                        <!-- Bounds -->
                        <a-plane width="2.8" height="1.8" color="#ffffff" material="wireframe: true; opacity: 0.5"></a-plane>
                        <!-- Center Line & Circle -->
                        <a-plane width="2.8" height="0.02" color="#ffffff" position="0 0 0.01"></a-plane>
                        <a-circle radius="0.3" color="#ffffff" material="wireframe: true" position="0 0 0.01"></a-circle>
                        
                        <!-- Penalty Areas (Top) -->
                        <a-plane width="1.2" height="0.4" color="#ffffff" material="wireframe: true" position="0 0.7 0.01"></a-plane>
                        <!-- 5-Meter Box (Top) -->
                        <a-plane width="0.5" height="0.15" color="#ffffff" material="wireframe: true" position="0 0.825 0.02"></a-plane>
                        <!-- Penalty Spot (Top) -->
                        <a-circle radius="0.02" color="#ffffff" position="0 0.65 0.02"></a-circle>
                        
                        <!-- Penalty Areas (Bottom) -->
                        <a-plane width="1.2" height="0.4" color="#ffffff" material="wireframe: true" position="0 -0.7 0.01"></a-plane>
                        <!-- 5-Meter Box (Bottom) -->
                        <a-plane width="0.5" height="0.15" color="#ffffff" material="wireframe: true" position="0 -0.825 0.02"></a-plane>
                        <!-- Penalty Spot (Bottom) -->
                        <a-circle radius="0.02" color="#ffffff" position="0 -0.65 0.02"></a-circle>

                        <!-- 3D Goals with Nets -->
                        <!-- Top Goal -->
                        <a-entity position="0 0.9 0" rotation="90 0 0">
                            <!-- Posts -->
                            <a-cylinder radius="0.02" height="0.2" color="#fff" position="-0.25 0.1 0"></a-cylinder>
                            <a-cylinder radius="0.02" height="0.2" color="#fff" position="0.25 0.1 0"></a-cylinder>
                            <!-- Crossbar -->
                            <a-cylinder radius="0.02" height="0.5" color="#fff" position="0 0.2 0" rotation="0 0 90"></a-cylinder>
                            <!-- Net (Wireframe Box) -->
                            <a-box width="0.5" height="0.2" depth="0.15" position="0 0.1 -0.075" color="#aaa" material="wireframe: true; opacity: 0.5"></a-box>
                        </a-entity>

                        <!-- Bottom Goal -->
                        <a-entity position="0 -0.9 0" rotation="-90 0 0">
                            <!-- Posts -->
                            <a-cylinder radius="0.02" height="0.2" color="#fff" position="-0.25 0.1 0"></a-cylinder>
                            <a-cylinder radius="0.02" height="0.2" color="#fff" position="0.25 0.1 0"></a-cylinder>
                            <!-- Crossbar -->
                            <a-cylinder radius="0.02" height="0.5" color="#fff" position="0 0.2 0" rotation="0 0 90"></a-cylinder>
                            <!-- Net (Wireframe Box) -->
                            <a-box width="0.5" height="0.2" depth="0.15" position="0 0.1 -0.075" color="#aaa" material="wireframe: true; opacity: 0.5"></a-box>
                        </a-entity>
                    </a-entity>

                    <!-- Pitch Container for Player Holograms -->
                    <a-entity id="pitch-container" position="0 0 0.05" rotation="0 0 0"></a-entity>

                    <!-- 6.5 Tech-Upgrades (Stage 3 Prediction Output) -->
                    <a-entity id="vr-tech-upgrades" position="0 0 0.06" visible="false">
                        <!-- Ghost Player ST Run (Cyan wireframe with trail) -->
                        <a-cylinder position="-0.4 0.5 0" radius="0.08" height="0.4" material="color: #00ffff; wireframe: true; opacity: 0.6; transparent: true"></a-cylinder>
                        <a-entity line="start: -0.4, 0.5, 0; end: -0.4, -0.6, 0; color: #00ffff"></a-entity>
                        <a-text value="PREDICTED RUN" position="-0.4 -0.65 0" align="center" color="#00ffff" scale="0.3 0.3 0.3"></a-text>

                        <!-- Ghost Player Winger Run (Magenta wireframe with trail) -->
                        <a-cylinder position="0.5 0 -0.5" radius="0.08" height="0.4" material="color: #ff00ff; wireframe: true; opacity: 0.6; transparent: true"></a-cylinder>
                        <a-entity line="start: 0.5, 0, -0.5; end: 0.8, -0.6, -0.6; color: #ff00ff"></a-entity>
                        <a-text value="SPACE EXPLOIT" position="0.8 -0.7 -0.6" align="center" color="#ff00ff" scale="0.3 0.3 0.3"></a-text>
                    </a-entity>
                </a-entity>

                <!-- NLZ High-Potential Holograms (Hidden by default) -->
                <a-entity id="nlz-holograms" position="2.2 0.05 -1.0" visible="false">
                    <a-text value="NLZ CALL-UPS (U19/U17)" align="center" position="0 0.8 0" color="#00ffff" width="2.5"></a-text>
                    
                    <a-entity position="-0.3 0 0" rotation="0 -30 0">
                        <!-- Glowing Blue Base -->
                        <a-cylinder radius="0.1" height="0.02" color="#00ffff" material="opacity: 1.0" position="0 0.01 0"></a-cylinder>
                        <!-- Blue Wireframe Hologram -->
                        <a-cylinder radius="0.04" height="0.4" color="#00ffff" material="opacity: 0.8; wireframe: true" position="0 0.25 0"></a-cylinder>
                        <a-text value="U19 ST" align="center" position="0 0.55 0" color="#fff" width="1.5"></a-text>
                    </a-entity>
                    
                    <a-entity position="0.3 0 0.2" rotation="0 30 0">
                        <a-cylinder radius="0.1" height="0.02" color="#00ffff" material="opacity: 1.0" position="0 0.01 0"></a-cylinder>
                        <a-cylinder radius="0.04" height="0.4" color="#00ffff" material="opacity: 0.8; wireframe: true" position="0 0.25 0"></a-cylinder>
                        <a-text value="U17 CM" align="center" position="0 0.55 0" color="#fff" width="1.5"></a-text>
                    </a-entity>
                </a-entity>
            </a-entity>

            <!-- Stadium Perimeter Boards (Phase 6.3 Sponsoring Sync) -->
            <a-entity id="vr-perimeter-boards">
                <!-- North-West Board (Left) -->
                <a-plane position="-20 1.5 -15" rotation="0 45 0" width="10" height="1.5" material="color: #000; shader: flat">
                    <a-text id="vr-sponsor-sleeve" value="Qatar Airways" align="center" position="0 0 0.1" color="#00ffff" width="18"></a-text>
                </a-plane>
                <!-- North-East Board (Right) -->
                <a-plane position="20 1.5 -15" rotation="0 -45 0" width="10" height="1.5" material="color: #000; shader: flat">
                    <a-text id="vr-sponsor-crypto" value="Binance" align="center" position="0 0 0.1" color="#ff00ff" width="18"></a-text>
                </a-plane>
            </a-entity>

            <!-- Phase 6.4 VR Media Slate -->
            <a-entity id="vr-media-slate" position="3.5 1.5 -2.5" rotation="0 -30 0">
                <!-- Floating Glass Panel -->
                <a-plane width="1.8" height="2.4" material="color: #0a0a0f; opacity: 0.9; transparent: true; metalness: 0.8; roughness: 0.2"></a-plane>
                <!-- Header / Logo Area -->
                <a-plane position="0 1.0 0.05" width="1.6" height="0.2" material="color: #ff00ff; shader: flat"></a-plane>
                <a-text value="STADIONZEITUNG" position="0 1.0 0.06" align="center" color="#000" width="2"></a-text>
                
                <!-- Dynamic Headline -->
                <a-text id="vr-media-headline" value="BAYERN DOMINATES IN LATEST CLASH" position="0 0.6 0.05" align="center" color="#fff" width="1.8" font="monoid" wrap-count="20"></a-text>
                
                <!-- Focus Player Image Placeholder -->
                <a-plane position="0 0 0.05" width="1.4" height="0.8" material="color: #111; shader: flat"></a-plane>
                <a-text id="vr-media-focus" value="Jamal Musiala" position="0 -0.25 0.06" align="center" color="#00ffff" width="3"></a-text>
                
                <!-- Status Tag -->
                <a-text id="vr-media-status" value="STATUS: Review" position="0 -0.8 0.05" align="center" color="#ff00ff" width="1.5"></a-text>
            </a-entity>

            <!-- NORTH: Management Desk — V83 CFO COMMAND STATION -->
            <a-entity id="management-desk" position="0 0 -6">
                <!-- Desk Base -->
                <a-box width="5" height="0.12" depth="2" position="0 1.0 0" color="#1a1008" material="roughness: 0.6; metalness: 0.4"></a-box>
                <!-- Desk Legs -->
                <a-box width="0.12" height="0.9" depth="0.12" position="-2.3 0.55 0.8" color="#111" material="metalness: 0.8"></a-box>
                <a-box width="0.12" height="0.9" depth="0.12" position="2.3 0.55 0.8" color="#111" material="metalness: 0.8"></a-box>
                <a-box width="0.12" height="0.9" depth="0.12" position="-2.3 0.55 -0.8" color="#111" material="metalness: 0.8"></a-box>
                <a-box width="0.12" height="0.9" depth="0.12" position="2.3 0.55 -0.8" color="#111" material="metalness: 0.8"></a-box>
                <!-- Desk Gold Edge Trim -->
                <a-box width="5.02" height="0.02" depth="0.02" position="0 1.062 1.0" color="#ffd700" material="emissive: #ffd700; emissiveIntensity: 0.3"></a-box>
                <!-- Manager Chair -->
                <a-box width="0.9" height="0.08" depth="0.9" position="0 0.75 1.8" color="#0a0a0a" material="roughness: 0.9"></a-box>
                <a-box width="0.9" height="1.5" depth="0.1" position="0 1.5 2.3" color="#0a0a0a" material="roughness: 0.9"></a-box>
                <!-- Chair arms -->
                <a-box width="0.1" height="0.4" depth="0.9" position="-0.5 1.0 1.8" color="#111"></a-box>
                <a-box width="0.1" height="0.4" depth="0.9" position="0.5 1.0 1.8" color="#111"></a-box>

                <!-- ══ SCREEN 1: FINANZEN TICKER (LEFT) ══ -->
                <a-entity position="-3.0 2.2 0" rotation="0 55 0">
                    <!-- Frame backing -->
                    <a-plane width="2.4" height="1.6" material="color: #030810; opacity: 0.95; transparent: true; metalness: 0.9; roughness: 0.1"></a-plane>
                    <!-- Gold border -->
                    <a-plane width="2.44" height="1.64" material="color: #ffd700; wireframe: true; opacity: 0.8" position="0 0 -0.01"></a-plane>
                    <!-- Glow edge -->
                    <a-plane width="2.5" height="1.7" material="color: #ffd700; opacity: 0.04; transparent: true" position="0 0 -0.02"></a-plane>
                    <!-- Header bar -->
                    <a-plane width="2.4" height="0.18" position="0 0.71 0.01" material="color: #ffd700; shader: flat; opacity: 0.9"></a-plane>
                    <a-text value="FINANZEN TICKER" align="center" position="0 0.71 0.02" color="#050a0f" width="3.5" scale="0.8 0.8 0.8"></a-text>
                    <!-- Data lines -->
                    <a-text id="vr-fin-budget" value="BUDGET:  24.5 M€" position="-1.1 0.42 0.02" color="#ffd700" width="2" align="left" scale="0.65 0.65 0.65"></a-text>
                    <a-text id="vr-fin-revenue" value="REVENUE: 42.0 M€" position="-1.1 0.22 0.02" color="#00ff88" width="2" align="left" scale="0.65 0.65 0.65"></a-text>
                    <a-text id="vr-fin-expenses" value="EXPNSES: 17.5 M€" position="-1.1 0.02 0.02" color="#ff4b2b" width="2" align="left" scale="0.65 0.65 0.65"></a-text>
                    <a-text id="vr-fin-profit" value="NET P/L: 24.5 M€" position="-1.1 -0.18 0.02" color="#00ffff" width="2" align="left" scale="0.65 0.65 0.65"></a-text>
                    <!-- Sponsor entries -->
                    <a-plane width="2.0" height="0.01" position="0 -0.28 0.02" material="color: #ffd700; opacity: 0.3"></a-plane>
                    <a-text id="vr-fin-sponsor1" value="SPONSOR: Qatar Airways  18M€/yr" position="-1.1 -0.40 0.02" color="#aaa" width="2" align="left" scale="0.55 0.55 0.55"></a-text>
                    <a-text id="vr-fin-sponsor2" value="CRYPTO:  Binance         6M€/yr" position="-1.1 -0.56 0.02" color="#aaa" width="2" align="left" scale="0.55 0.55 0.55"></a-text>
                    <!-- Pulsing ticker indicator -->
                    <a-circle id="vr-fin-ticker-dot" radius="0.05" position="1.05 0.71 0.03" material="color: #00ff88; emissive: #00ff88; emissiveIntensity: 1">
                        <a-animation attribute="material.emissiveIntensity" from="0.2" to="1.0" dur="800" direction="alternate" repeat="indefinite"></a-animation>
                    </a-circle>
                </a-entity>

                <!-- ══ SCREEN 2: GLOBAL REACH / MEDIA HUB (CENTER-TOP) ══ -->
                <a-entity position="0 3.0 -0.4" rotation="0 0 0">
                    <a-plane width="3.5" height="1.2" material="color: #030810; opacity: 0.95; transparent: true; metalness: 0.9"></a-plane>
                    <a-plane width="3.54" height="1.24" material="color: #ff00ff; wireframe: true; opacity: 0.7" position="0 0 -0.01"></a-plane>
                    <a-plane width="3.5" height="0.16" position="0 0.52 0.01" material="color: #ff00ff; shader: flat; opacity: 0.85"></a-plane>
                    <a-text value="GLOBAL REACH & MEDIA HUB" align="center" position="0 0.52 0.02" color="#050a0f" width="5" scale="0.7 0.7 0.7"></a-text>
                    <!-- Media data columns -->
                    <a-text id="vr-media-hub-headline" value="HEADLINE: Bayern dominates in latest clash" position="-1.65 0.28 0.02" color="#fff" width="2.8" align="left" scale="0.5 0.5 0.5"></a-text>
                    <a-text id="vr-media-hub-reach" value="GLOBAL REACH:  4.2M impressions" position="-1.65 0.08 0.02" color="#ff00ff" width="2.5" align="left" scale="0.55 0.55 0.55"></a-text>
                    <a-text id="vr-media-hub-focus" value="FOCUS PLAYER:  Jamal Musiala" position="-1.65 -0.12 0.02" color="#00ffff" width="2.5" align="left" scale="0.55 0.55 0.55"></a-text>
                    <a-text id="vr-media-hub-status" value="STATUS:        Review" position="-1.65 -0.32 0.02" color="#ffd700" width="2.5" align="left" scale="0.55 0.55 0.55"></a-text>
                </a-entity>

                <!-- ══ SCREEN 3: ACADEMY PIPELINE / STRATEGIC DNA (CENTER-BOTTOM) ══ -->
                <a-entity position="0 1.9 -0.2" rotation="-15 0 0">
                    <a-plane width="3.0" height="1.0" material="color: #030810; opacity: 0.95; transparent: true; metalness: 0.9"></a-plane>
                    <a-plane width="3.04" height="1.04" material="color: #00ff88; wireframe: true; opacity: 0.7" position="0 0 -0.01"></a-plane>
                    <a-plane width="3.0" height="0.14" position="0 0.43 0.01" material="color: #00ff88; shader: flat; opacity: 0.85"></a-plane>
                    <a-text value="NLZ ACADEMY PIPELINE" align="center" position="0 0.43 0.02" color="#050a0f" width="4.5" scale="0.65 0.65 0.65"></a-text>
                    <a-text id="vr-nlz-analysis" value="ANALYSIS CTR: 80% complete" position="-1.4 0.2 0.02" color="#0088ff" width="2.5" align="left" scale="0.5 0.5 0.5"></a-text>
                    <a-text id="vr-nlz-expansion" value="NLZ EXPANSION: 65% complete" position="-1.4 0.02 0.02" color="#00ff88" width="2.5" align="left" scale="0.5 0.5 0.5"></a-text>
                    <a-text value="ACTIVE SQUADS: U14 / U16 / U19" position="-1.4 -0.16 0.02" color="#aaa" width="2.5" align="left" scale="0.5 0.5 0.5"></a-text>
                    <a-text value="NEXT INTAKE:   March 2026" position="-1.4 -0.32 0.02" color="#aaa" width="2.5" align="left" scale="0.5 0.5 0.5"></a-text>
                </a-entity>

                <!-- ══ SCREEN 4: CONTRACT ARCHIVE / TRANSFER RADAR (RIGHT) ══ -->
                <a-entity position="3.0 2.2 0" rotation="0 -55 0">
                    <a-plane width="2.4" height="1.6" material="color: #030810; opacity: 0.95; transparent: true; metalness: 0.9"></a-plane>
                    <a-plane width="2.44" height="1.64" material="color: #00ffff; wireframe: true; opacity: 0.7" position="0 0 -0.01"></a-plane>
                    <a-plane width="2.4" height="0.18" position="0 0.71 0.01" material="color: #00ffff; shader: flat; opacity: 0.85"></a-plane>
                    <a-text value="CONTRACT ARCHIVE" align="center" position="0 0.71 0.02" color="#050a0f" width="3.5" scale="0.8 0.8 0.8"></a-text>
                    <!-- Contract entries (injected on sync) -->
                    <a-text id="vr-contract-1" value="► Qatar Airways    90d EXPIRES" position="-1.1 0.42 0.02" color="#ff4b2b" width="2" align="left" scale="0.5 0.5 0.5"></a-text>
                    <a-text id="vr-contract-2" value="► Binance          85d EXPIRES" position="-1.1 0.22 0.02" color="#ff4b2b" width="2" align="left" scale="0.5 0.5 0.5"></a-text>
                    <a-text id="vr-contract-3" value="► Stadium Naming   365d OK" position="-1.1 0.02 0.02" color="#00ff88" width="2" align="left" scale="0.5 0.5 0.5"></a-text>
                    <a-text id="vr-contract-4" value="► Transfer Alternt   200d OK" position="-1.1 -0.18 0.02" color="#00ff88" width="2" align="left" scale="0.5 0.5 0.5"></a-text>
                    <a-text id="vr-contract-5" value="► NLZ Head Coach   145d OK" position="-1.1 -0.38 0.02" color="#aaa" width="2" align="left" scale="0.5 0.5 0.5"></a-text>
                    <!-- Warning badge -->
                    <a-plane width="0.8" height="0.15" position="0.6 -0.58 0.02" material="color: #ff4b2b; shader: flat; opacity: 0.2"></a-plane>
                    <a-text id="vr-contract-alert" value="2 EXPIRING SOON" position="0.6 -0.58 0.03" align="center" color="#ff4b2b" width="1.2" scale="0.5 0.5 0.5"></a-text>
                </a-entity>

                <!-- ══ VR FLOATING KEYBOARD (interaction bridge) ══ -->
                <a-entity id="vr-keyboard" position="0 1.2 0.8" rotation="-30 0 0">
                    <!-- Keyboard base plate -->
                    <a-plane width="2.0" height="0.6" material="color: #0a0f18; opacity: 0.9; transparent: true; metalness: 0.8; roughness: 0.2"></a-plane>
                    <a-plane width="2.02" height="0.62" material="color: #ffd700; wireframe: true; opacity: 0.8" position="0 0 -0.01"></a-plane>
                    <a-text value="VIRTUAL INPUT" align="center" position="0 0.23 0.01" color="#ffd700" width="3" scale="0.5 0.5 0.5"></a-text>
                    <!-- Key rows (simplified visual) -->
                    <a-text value="[ Q ][ W ][ E ][ R ][ T ][ Y ][ U ][ I ][ O ][ P ]" align="center" position="0 0.05 0.01" color="#00ffff" width="2.5" scale="0.4 0.4 0.4"></a-text>
                    <a-text value="[ A ][ S ][ D ][ F ][ G ][ H ][ J ][ K ][ L ]" align="center" position="0 -0.08 0.01" color="#00ffff" width="2.5" scale="0.4 0.4 0.4"></a-text>
                    <a-text value="[ Z ][ X ][ C ][ V ][ B ][ N ][ M ]  [ENTER]" align="center" position="0 -0.18 0.01" color="#aaa" width="2.5" scale="0.4 0.4 0.4"></a-text>
                </a-entity>

                <!-- CFO Desk spotlight -->
                <a-light type="point" position="0 3.5 0" color="#ffd700" intensity="0.6" distance="8" decay="2"></a-light>
            </a-entity>

            <!-- SOUTH: Media Lounge (Sofa, Panini, Youth Academy) -->
            <a-entity id="media-lounge" position="0 0 6" rotation="0 180 0">
                <!-- Sofas -->
                <a-box width="2.5" height="0.8" depth="1" position="-2 0.4 0" color="#1a1a1a" material="roughness: 0.9"></a-box>
                <a-box width="2.5" height="0.8" depth="1" position="2 0.4 0" color="#1a1a1a" material="roughness: 0.9"></a-box>
                <!-- Coffee Table -->
                <a-box width="1.5" height="0.4" depth="1.5" position="0 0.2 0" color="#444" material="metalness: 0.5; roughness: 0.2"></a-box>
                <!-- Floating Media Screen -->
                <a-plane width="3" height="1.8" position="0 1.5 1.5" rotation="0 180 0" material="color: #050a0f; opacity: 0.8; transparent: true" class="interactable">
                    <a-text value="MEDIA & ACADEMY LOUNGE" align="center" position="0 0.7 0.01" width="3" color="#ff00ff"></a-text>
                    <a-text value="Pressegespraech: Scheduled\\nPanini Album: Updated\\nYouth Target: A-Jugend" align="center" position="0 0 0.01" width="2" color="white"></a-text>
                </a-plane>
            </a-entity>

            <!-- WEST: Trainer Planning Desk -->
            <a-entity id="trainer-station" position="-6 0 0" rotation="0 90 0">
                <!-- Desk -->
                <a-box width="3" height="0.9" depth="1" position="0 0.45 0" color="#2c3e50" material="roughness: 0.6"></a-box>
                <!-- Trainer Chairs -->
                <a-box width="0.6" height="1" depth="0.6" position="-0.8 0.5 -0.8" color="#151515"></a-box>
                <a-box width="0.6" height="1" depth="0.6" position="0.8 0.5 -0.8" color="#151515"></a-box>
                <a-plane width="2" height="1.5" position="0 1.4 0" material="color: #050a0f; opacity: 0.8" class="interactable">
                    <a-text value="TRAINER PLANNING" align="center" position="0 0.6 0.01" width="3" color="#ffaa00"></a-text>
                    <a-text value="Next Match: BVB\\nIntensity: High\\nFocus: Pressing" align="center" position="0 0 0.01" width="2" color="white"></a-text>
                </a-plane>
            </a-entity>

            <!-- EAST: Analysis / Medical Station -->
            <a-entity id="medical-station" position="6 0 0" rotation="0 -90 0">
                <!-- Glass Partition -->
                <a-plane width="4" height="3" position="0 1.5 1.5" material="color: #00ffff; opacity: 0.2; transparent: true" rotation="0 180 0"></a-plane>
                <!-- Desk -->
                <a-box width="3" height="0.9" depth="1" position="0 0.45 0" color="#e0e0e0" material="roughness: 0.2; metalness: 0.3"></a-box>
                <!-- Medical / Analysis Screens -->
                <a-plane width="2.5" height="1.5" position="0 1.4 0" material="color: #050a0f; opacity: 0.8" class="interactable">
                    <a-text value="ANALYSIS & MEDIZIN" align="center" position="0 0.6 0.01" width="3" color="#ff0044"></a-text>
                    <a-text value="Squad Fitness: 92%\\nInjuries: 1 (Sane - Minor)\\nData-Trackers: Synced" align="center" position="0 0 0.01" width="2" color="white"></a-text>
                </a-plane>
            </a-entity>

            <!-- Lighting -->
            <a-light type="ambient" color="#cce0ff" intensity="1.8"></a-light>
            <!-- Spotlights on desks -->
            <!-- Flood lights — white/warm for maximum scene visibility -->
            <a-light type="point" position="0 6 0"    color="#ffffff" intensity="2.5" distance="25" decay="1.5"></a-light>
            <a-light type="point" position="-8 5 -8"  color="#cce4ff" intensity="1.5" distance="20" decay="1.5"></a-light>
            <a-light type="point" position="8 5 -8"   color="#cce4ff" intensity="1.5" distance="20" decay="1.5"></a-light>
            <a-light type="point" position="0 5 6"    color="#ffe4cc" intensity="1.2" distance="18" decay="1.5"></a-light>
            <a-light type="directional" position="1 4 -3" color="#ffffff" intensity="1.0"></a-light>
        </a-scene>
    </div>

    <!-- MAIN LOGIC -->
    <script src="main.js"></script>

        <!-- MEDIA & COMMUNICATIONS HUB — V93 -->
        <div id="modal-media" class="deep-dive-window hidden">
            <div class="modal-content" style="width: 860px; max-width: 97vw; box-shadow: 0 0 28px rgba(224,64,251,0.1);">
                <button class="close-modal cyber-btn attr-btn" style="color: #b8c5d6;">SCHLIESSEN</button>
                <h2 style="color: #e040fb; margin-top: 0; border-bottom: 1px solid rgba(224,64,251,0.3); padding-bottom: 5px; display: flex; align-items: center; gap: 10px;">
                    🗞️ <span data-i18n="media-title">MEDIA &amp; COMMUNICATIONS HUB</span>
                    <span id="media-pr-badge" style="font-size: 0.65rem; background: rgba(224,64,251,0.15); border: 1px solid #e040fb; color: #e040fb; padding: 2px 8px; border-radius: 12px; margin-left: auto;">PR DIRECTOR ACTIVE</span>
                </h2>

                <div class="tabs">
                    <button class="tab-btn active" data-tab="media-sponsor" style="color: #e040fb;">📣 Sponsoring</button>
                    <button class="tab-btn" data-tab="media-content">✏️ Content Creator</button>
                    <button class="tab-btn" data-tab="media-social">📊 Social Analytics</button>
                    <button class="tab-btn" data-tab="media-branding">🎨 Branding Studio</button>
                </div>

                <!-- TAB 1: SPONSORSHIP SUITE -->
                <div id="media-sponsor" class="tab-content active">
                    <div style="margin-bottom: 10px; font-size: 0.7rem; color: #888;" data-i18n="sponsor-intro">Select a template, then generate a personalized sponsor deck:</div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                        <div class="media-hub-card" id="deck-tournament">
                            <div class="mhc-type">TOURNAMENT PARTNER</div>
                            <div class="mhc-label">Turnier-Erlöse</div>
                            <div class="mhc-value" id="deck-t-revenue">—</div>
                            <div class="mhc-label">Top Performer</div>
                            <div class="mhc-value" id="deck-t-player">—</div>
                            <div class="mhc-label">xG des Turniers</div>
                            <div class="mhc-value" id="deck-t-xg">—</div>
                            <button class="cyber-btn procurement-btn" id="btn-deck-tournament" style="margin-top: 10px; width: 100%; font-size: 0.65rem; background: rgba(224,64,251,0.1); color: #b8c5d6;">DECK GENERIEREN</button>
                        </div>
                        <div class="media-hub-card" id="deck-equipment">
                            <div class="mhc-type">EQUIPMENT SPONSOR</div>
                            <div class="mhc-label">Ausrüstungsbedarf</div>
                            <div class="mhc-value" id="deck-e-kits">50 Trainingsanzüge</div>
                            <div class="mhc-label">NLZ-Spieler gesamt</div>
                            <div class="mhc-value" id="deck-e-players">—</div>
                            <div class="mhc-label">Investment</div>
                            <div class="mhc-value" id="deck-e-invest">~€ 2.500</div>
                            <button class="cyber-btn" id="btn-deck-equipment" style="margin-top: 10px; width: 100%; font-size: 0.65rem; color: #b8c5d6;">DECK GENERIEREN</button>
                        </div>
                    </div>
                    <div id="sponsor-deck-output" style="display: none; background: rgba(0,0,0,0.5); border: 1px solid rgba(224,64,251,0.3); border-radius: 6px; padding: 14px; font-size: 0.75rem;">
                        <!-- Filled by JS -->
                    </div>
                </div>

                <!-- TAB 2: FACHMAGAZIN (V170) -->
                <div id="media-content" class="tab-content hidden">
                    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 12px; border-bottom: 2px solid rgba(224,64,251,0.5); padding-bottom: 8px;">
                        <div>
                            <div style="font-family: var(--font-heading); font-size: 1.8rem; letter-spacing: 2px; color: #fff;">STARK PERFORMANCE JOURNAL</div>
                            <div style="font-family: 'Inter', sans-serif; font-size: 0.7rem; color: #e040fb; letter-spacing: 1px;">THE SCIENCE OF ELITE FOOTBALL // VOL. 4</div>
                        </div>
                        <button id="btn-export-pdf" class="cyber-btn" style="font-size: 0.7rem; color: #00ff88; border-color: #00ff88; padding: 6px 12px;" onclick="window.print()">🖨️ EXPORT ALS PDF</button>
                    </div>

                    <div id="fachmagazin-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; background: #fff; color: #111; padding: 20px; border-radius: 4px; max-height: 550px; overflow-y: auto; font-family: 'Georgia', serif;">
                        
                        <!-- Col 1: Editorial & Medical Corner -->
                        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                            <!-- Editorial -->
                            <div>
                                <h3 style="font-family: 'Inter', sans-serif; font-size: 0.8rem; color: #d32f2f; border-bottom: 1px solid #ccc; padding-bottom: 4px; text-transform: uppercase; margin-top: 0;">Editorial</h3>
                                <div style="display: flex; gap: 10px; margin-bottom: 10px; align-items: center;">
                                    <img src="assets/avatars/toni_trainer.jpg" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">
                                    <div style="font-family: 'Inter', sans-serif; font-size: 0.7rem; font-weight: bold; color: #111;">Toni, Head Coach</div>
                                </div>
                                <h4 style="font-family: 'Inter', sans-serif; font-size: 1.1rem; margin-top: 0; margin-bottom: 8px; line-height: 1.2; color: #111;">Die Geometrie des Erfolgs: Wie wir den 5-Meter-Raum beherrschen.</h4>
                                <p style="font-size: 0.8rem; line-height: 1.5; color: #333; margin-top: 0;">Fußball ist im Kern eine Wissenschaft der Raumkontrolle. In der modernen Ära reicht es nicht mehr, auf intuitive Geniestreiche zu hoffen. Wir müssen die Vektoren verstehen, die Passdreiecke asymmetrisch überladen und den 5-Meter-Raum als eine absolute Festung definieren.</p>
                                <blockquote style="border-left: 3px solid #00e5ff; padding-left: 10px; margin: 15px 0; font-family: 'Inter', sans-serif; font-size: 0.9rem; color: #00e5ff; background: #111; padding: 10px;">
                                    "Wir überlassen nichts dem Zufall. Der Strafraum ist unser Wohnzimmer."
                                </blockquote>
                            </div>

                            <!-- Medical Corner -->
                            <div id="article-medical" style="scroll-margin-top: 20px;">
                                <h3 style="font-family: 'Inter', sans-serif; font-size: 0.8rem; color: #0088ff; border-bottom: 1px solid #ccc; padding-bottom: 4px; text-transform: uppercase;">Medical Corner</h3>
                                <div style="display: flex; gap: 10px; margin-bottom: 10px; align-items: center;">
                                    <img src="assets/avatars/toni_arzt.jpg" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">
                                    <div style="font-family: 'Inter', sans-serif; font-size: 0.7rem; font-weight: bold; color: #111;">Dr. Toni, Chief Medical Officer</div>
                                </div>
                                <h4 style="font-family: 'Inter', sans-serif; font-size: 1.1rem; margin-top: 0; margin-bottom: 8px; line-height: 1.2; color: #111;">Der unsichtbare Transfer – Schlaf als biomechanischer Gamechanger</h4>
                                <p style="font-size: 0.8rem; line-height: 1.5; color: #333; margin-top: 0;">Wenn ein Profi unter 60% Schlafqualität fällt, sinkt die kognitive Reaktionsgeschwindigkeit um bis zu 15%. Wir messen die <strong>REM</strong>-Schlafzyklen und die <strong>Zirkadiane Synchronisation</strong> kontinuierlich, um Verletzungen vorzubeugen.</p>
                                
                                <div style="margin: 10px 0; padding: 10px; background: #f5f7fa; border: 1px solid #e1e4e8; border-radius: 4px;">
                                    <div style="font-family: 'Inter', sans-serif; font-size: 0.65rem; color: #555; text-align: center; margin-bottom: 5px; text-transform: uppercase;">Schlafphasen-Verteilung (Team-Schnitt)</div>
                                    <div style="display: flex; height: 20px; border-radius: 10px; overflow: hidden;">
                                        <div style="width: 20%; background: #bbdefb; display: flex; align-items: center; justify-content: center; font-size: 0.5rem; color: #111;">Wach</div>
                                        <div style="width: 50%; background: #64b5f6; display: flex; align-items: center; justify-content: center; font-size: 0.5rem; color: #fff;">Leicht</div>
                                        <div style="width: 15%; background: #1e88e5; display: flex; align-items: center; justify-content: center; font-size: 0.5rem; color: #fff;">Tief</div>
                                        <div style="width: 15%; background: #0d47a1; display: flex; align-items: center; justify-content: center; font-size: 0.5rem; color: #fff;"><strong style="color: #00ffff; text-shadow: 0 0 2px #000;">REM</strong></div>
                                    </div>
                                </div>
                                <p style="font-size: 0.8rem; line-height: 1.5; color: #333;">Die nächtliche Ausschüttung von <strong>HGH <span style="color: #0088ff;">(Human Growth Hormone)</span></strong> ist essentiell für die Muskelelastizität. Ohne Schlaf, kein Titel.</p>
                            </div>
                        </div>

                        <!-- Col 2: Deep Dive Taktik -->
                        <div style="border-left: 1px solid #eee; padding-left: 1.5rem;">
                            <h3 style="font-family: 'Inter', sans-serif; font-size: 0.8rem; color: #388e3c; border-bottom: 1px solid #ccc; padding-bottom: 4px; text-transform: uppercase; margin-top: 0;">Deep Dive: Taktik</h3>
                            <div style="display: flex; gap: 10px; margin-bottom: 10px; align-items: center;">
                                <div style="width: 40px; height: 40px; border-radius: 50%; background: #388e3c; color: #fff; display: flex; align-items: center; justify-content: center; font-family: 'Inter', sans-serif; font-weight: bold;">TA</div>
                                <div style="font-family: 'Inter', sans-serif; font-size: 0.7rem; font-weight: bold; color: #111;">Taktik-Analyst Team</div>
                            </div>
                            <h4 style="font-family: 'Inter', sans-serif; font-size: 1.1rem; margin-top: 0; margin-bottom: 8px; line-height: 1.2; color: #111;">Halbraum-Dominanz: Die 4-gegen-4-Wandspieler-Matrix</h4>
                            <p style="font-size: 0.8rem; line-height: 1.5; color: #333; margin-top: 0;">Die Halbräume sind die sensibelsten Zonen des Spielfelds. Wer hier den Ball behauptet, zwingt die gegnerische Abwehrkette zu schwerwiegenden Entscheidungen: Herausrücken und den Raum dahinter preisgeben, oder absinken und den Fernschuss riskieren.</p>
                            
                            <div style="width: 100%; height: 120px; background: #e8f5e9; border: 1px solid #c8e6c9; display: flex; align-items: center; justify-content: center; margin: 15px 0;">
                                <div style="font-family: 'Inter', sans-serif; font-size: 0.7rem; color: #2e7d32;">[ Taktikboard Screenshot: Halbraum-Overload ]</div>
                            </div>

                            <p style="font-size: 0.8rem; line-height: 1.5; color: #333;">Durch regelmäßige "Overloads" mit 3 Wandspielern in unserer speziellen Trainingsform konditionieren wir die kognitiven Muster unserer zentralen Mittelfeldspieler. Die Passauswahl wird unterdrückt, die Lösung vorgegeben. Das Resultat ist eine erdrückende Felddominanz.</p>
                            <blockquote style="border-left: 3px solid #00e5ff; padding-left: 10px; margin: 15px 0; font-family: 'Inter', sans-serif; font-size: 0.9rem; color: #00e5ff; background: #111; padding: 10px;">
                                "Ein Pass in den Halbraum ist wie ein Skalpell-Schnitt durch die gegnerische Defensive."
                            </blockquote>
                        </div>

                        <!-- Col 3: Scouting Report -->
                        <div style="border-left: 1px solid #eee; padding-left: 1.5rem; display: flex; flex-direction: column;">
                            <h3 style="font-family: 'Inter', sans-serif; font-size: 0.8rem; color: #00ffff; border-bottom: 1px solid #ccc; padding-bottom: 4px; text-transform: uppercase; margin-top: 0;">Scouting Report</h3>
                            <div style="display: flex; gap: 10px; margin-bottom: 10px; align-items: center;">
                                <div style="width: 40px; height: 40px; border-radius: 50%; background: #00ffff; color: #111; display: flex; align-items: center; justify-content: center; font-family: 'Inter', sans-serif; font-weight: bold;">SC</div>
                                <div style="font-family: 'Inter', sans-serif; font-size: 0.7rem; font-weight: bold; color: #111;">Chief Scout</div>
                            </div>
                            <h4 style="font-family: 'Inter', sans-serif; font-size: 1.1rem; margin-top: 0; margin-bottom: 8px; line-height: 1.2; color: #111;">NLZ Pipeline: Der nächste Weltklasse-Spielmacher</h4>
                            <p style="font-size: 0.8rem; line-height: 1.5; color: #333; margin-top: 0;">Unsere Datenbank hat ein außergewöhnliches Muster bei einem 16-jährigen Talent im Reserveteam identifiziert. Seine "Expected Threat" (xT) Werte aus dem zentralen Mittelfeld übersteigen den Liga-Durchschnitt um 240%.</p>
                            
                            <!-- V180 Interactive Spider Web Chart -->
                            <div style="background: #0d1117; border: 1px solid #00ffff; padding: 15px; margin: 15px 0; border-radius: 6px; position: relative;">
                                <div style="font-family: 'Inter', sans-serif; font-size: 0.65rem; color: #00ffff; text-align: center; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px;">Development Profile (vs. Profi-Schnitt)</div>
                                <svg width="100%" height="160" viewBox="0 0 200 160">
                                    <!-- Axes: Technik, Physis, Kognition, Taktik, Mentalität -->
                                    <line x1="100" y1="80" x2="100" y2="10" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
                                    <line x1="100" y1="80" x2="166" y2="58" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
                                    <line x1="100" y1="80" x2="141" y2="136" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
                                    <line x1="100" y1="80" x2="59" y2="136" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
                                    <line x1="100" y1="80" x2="34" y2="58" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
                                    
                                    <!-- Web rings -->
                                    <polygon points="100,24 153,62 133,125 67,125 47,62" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
                                    <polygon points="100,52 126,71 116,96 84,96 74,71" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
                                    
                                    <!-- Talent Area Polygon (Technik, Physis, Kognition, Taktik, Mentalität) -->
                                    <polygon points="100,15 140,60 125,110 75,130 35,65" fill="rgba(0, 255, 255, 0.3)" stroke="#00ffff" stroke-width="2"/>
                                    
                                    <!-- Labels -->
                                    <text x="100" y="8" fill="#fff" font-size="8" text-anchor="middle" font-family="'Inter', sans-serif">Technik</text>
                                    <text x="170" y="60" fill="#fff" font-size="8" text-anchor="start" font-family="'Inter', sans-serif">Physis</text>
                                    <text x="145" y="145" fill="#fff" font-size="8" text-anchor="start" font-family="'Inter', sans-serif">Kognition</text>
                                    <text x="55" y="145" fill="#fff" font-size="8" text-anchor="end" font-family="'Inter', sans-serif">Taktik</text>
                                    <text x="30" y="60" fill="#fff" font-size="8" text-anchor="end" font-family="'Inter', sans-serif">Mentalität</text>
                                </svg>
                                <div style="display: flex; justify-content: space-between; font-family: 'Inter', sans-serif; font-size: 0.65rem; color: #fff; margin-top: 10px; border-top: 1px solid rgba(0,255,255,0.3); padding-top: 8px;">
                                    <span>Aktueller MW: <strong style="color: #00ffff;" id="mag-market-value">€ 4.5M</strong></span>
                                    <span>Potenzial: <strong>€ 65.0M+</strong></span>
                                </div>
                            </div>

                            <p style="font-size: 0.8rem; line-height: 1.5; color: #333;">Mit gezieltem <strong>Bio-Banding</strong>-Training integrieren wir ihn schrittweise in die Belastungsstruktur der ersten Mannschaft.</p>
                            
                            <!-- V180 Mentor Avatar Link -->
                            <div style="margin-top: auto; display: flex; flex-direction: column; align-items: center; gap: 8px;">
                                <img src="assets/avatars/toni_trainer.jpg" style="width: 50px; height: 50px; border-radius: 50%; border: 2px solid #00ffff; object-fit: cover;">
                                <div style="font-family: 'Inter', sans-serif; font-size: 0.65rem; color: #555; font-style: italic;">"Ein Juwel, das wir behutsam, aber konsequent formen werden."</div>
                                <button class="cyber-btn" id="btn-open-dossier" style="width: 100%; font-size: 0.7rem; font-weight: bold; margin-top: 5px; color: #000; background: #00ffff; border-color: #00ffff; cursor: pointer;">VOLLSTÄNDIGES NLZ-DOSSIER ÖFFNEN</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- TAB 3: SOCIAL ANALYTICS -->
                <div id="media-social" class="tab-content hidden">
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1rem;">
                        <div class="social-metric">
                            <div class="sm-label" data-i18n="social-followers">FOLLOWER</div>
                            <div class="sm-value" id="social-followers">12.847</div>
                            <div class="sm-delta" style="color: #00ff88;">↑ +3.2% diese Woche</div>
                        </div>
                        <div class="social-metric">
                            <div class="sm-label" data-i18n="social-reach">REICHWEITE</div>
                            <div class="sm-value" id="social-reach">48.3K</div>
                            <div class="sm-delta" style="color: #00ff88;">↑ nach Turniersieg</div>
                        </div>
                        <div class="social-metric">
                            <div class="sm-label" data-i18n="social-engagement">ENGAGEMENT</div>
                            <div class="sm-value" id="social-engagement">6.8%</div>
                            <div class="sm-delta" style="color: #ffd700;">⬤ Top-Quartil</div>
                        </div>
                    </div>

                    <!-- Trend Bars -->
                    <div style="border: 1px solid rgba(224,64,251,0.2); border-radius: 4px; padding: 12px; margin-bottom: 1rem;">
                        <div style="font-family: var(--font-heading); font-size: 0.65rem; color: #e040fb; margin-bottom: 8px;" data-i18n="social-trend">WOCHENTREND — INTERAKTIONEN</div>
                        <div style="display: flex; align-items: flex-end; gap: 4px; height: 60px;">
                            <div style="flex:1; background: rgba(224,64,251,0.7); height: 35%;"></div>
                            <div style="flex:1; background: rgba(224,64,251,0.7); height: 50%;"></div>
                            <div style="flex:1; background: rgba(224,64,251,0.7); height: 45%;"></div>
                            <div style="flex:1; background: rgba(224,64,251,0.7); height: 65%;"></div>
                            <div style="flex:1; background: rgba(224,64,251,0.7); height: 55%;"></div>
                            <div style="flex:1; background: #e040fb; height: 100%;"></div>
                            <div style="flex:1; background: rgba(224,64,251,0.4); height: 80%;"></div>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 0.55rem; color: #555; margin-top: 4px;">
                            <span>Mo</span><span>Di</span><span>Mi</span><span>Do</span><span>Fr</span><span>Sa</span><span>So</span>
                        </div>
                    </div>

                    <!-- AI Post Suggestion -->
                    <div style="border: 1px solid rgba(224,64,251,0.25); border-radius: 4px; padding: 12px; background: rgba(0,0,0,0.4);">
                        <div style="font-family: var(--font-heading); font-size: 0.65rem; color: #e040fb; margin-bottom: 8px;" data-i18n="social-ai-suggest">KI POST-EMPFEHLUNG</div>
                        <div id="ai-post-suggestion" style="font-size: 0.72rem; color: #ccc; font-style: italic; line-height: 1.5; min-height: 50px;"> — KI analysiert Turnier-Performance... — </div>
                        <div style="display: flex; gap: 8px; margin-top: 8px;">
                            <button id="btn-gen-post" class="cyber-btn" style="font-size: 0.65rem; color: #b8c5d6;" data-i18n="btn-gen-post">🤖 POST GENERIEREN</button>
                            <button id="btn-pr-brief" class="cyber-btn" style="font-size: 0.65rem; color: #b8c5d6;" data-i18n="btn-pr-brief">🎙️ PR BRIEFING (TONI)</button>
                        </div>
                    </div>
                </div>

                <!-- TAB 4: BRANDING STUDIO (V94) -->
                <div id="media-branding" class="tab-content hidden">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.2rem;">
                        <!-- LEFT: Upload + Controls -->
                        <div>
                            <div style="font-family: var(--font-heading); font-size: 0.7rem; color: #e040fb; margin-bottom: 8px;" data-i18n="branding-upload">LOGO HOCHLADEN</div>
                            <div id="logo-drop-area" class="logo-drop-area">
                                <div id="logo-drop-prompt">📂 PNG / SVG hier ablegen oder klicken</div>
                                <img id="logo-preview" src="" alt="" style="display:none; max-width: 100%; max-height: 100px; object-fit: contain; margin-top: 8px;">
                                <input id="logo-file-input" type="file" accept="image/png,image/svg+xml" style="display:none;">
                            </div>

                            <div style="font-family: var(--font-heading); font-size: 0.65rem; color: #808080; margin: 10px 0 5px;" data-i18n="branding-placement">PLATZIERUNG</div>
                            <div style="display: flex; flex-wrap: wrap; gap: 5px;">
                                <button class="placement-btn active" data-target="chest">🎽 Brust</button>
                                <button class="placement-btn" data-target="sleeve">💪 Ärmel</button>
                                <button class="placement-btn" data-target="back">👕 Rücken</button>
                                <button class="placement-btn" data-target="board">📋 Perimeter-Bande</button>
                                <button class="placement-btn" data-target="wall">🎬 Interview Wall</button>
                            </div>

                            <div style="margin-top: 10px; display: flex; gap: 6px; align-items: center;">
                                <label style="font-size: 0.6rem; color: #555;" data-i18n="branding-size">GRÖSSE</label>
                                <input id="logo-size-slider" type="range" min="10" max="80" value="30" style="flex: 1;">
                                <span id="logo-size-val" style="font-size: 0.65rem; color: var(--accent-cyan); width:30px;">30%</span>
                            </div>

                            <div style="margin-top: 8px; display: flex; gap: 5px;">
                                <button id="btn-led-toggle" class="cyber-btn" style="font-size: 0.6rem; color: #b8c5d6; flex: 1;" data-i18n="branding-led">💡 LED ANIMATION</button>
                                <button id="btn-roi-advisor" class="cyber-btn" style="font-size: 0.6rem; color: #b8c5d6; flex: 1;" data-i18n="branding-roi">📊 ROI ADVISOR</button>
                            </div>

                            <div id="branding-roi-log" style="margin-top: 8px; font-size: 0.65rem; font-family: var(--font-mono); color: #ffd700; background: rgba(0,0,0,0.4); padding: 6px; border-radius: 3px; min-height: 30px; display: none;"></div>
                        </div>

                        <!-- RIGHT: Canvas Preview -->
                        <div>
                            <div style="font-family: var(--font-heading); font-size: 0.65rem; color: #e040fb; margin-bottom: 6px;" data-i18n="branding-preview">VORSCHAU</div>
                            <div class="branding-canvas-wrap" id="branding-canvas-wrap">
                                <canvas id="branding-canvas" width="260" height="220"></canvas>
                                <div id="led-board-overlay" class="led-board hidden">
                                    <div class="led-ticker" id="led-ticker-text">STARK ELITE FC</div>
                                </div>
                            </div>
                            <div style="margin-top: 8px;">
                                <div class="sm-label" style="margin-bottom: 3px;" data-i18n="branding-score">VISUAL IMPACT SCORE</div>
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <div style="flex: 1; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden;">
                                        <div id="branding-impact-bar" style="height: 100%; width: 0%; background: linear-gradient(90deg, #e040fb, #00ffff); border-radius: 3px; transition: width 0.5s ease;"></div>
                                    </div>
                                    <span id="branding-impact-val" style="font-family: var(--font-heading); color: #e040fb; font-size: 0.8rem; font-weight: 900;">—</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- PR Director Briefing Log -->
                <div style="margin-top: 1rem; border-top: 1px solid rgba(224,64,251,0.2); padding-top: 8px;">
                    <div style="font-family: var(--font-heading); font-size: 0.65rem; color: #e040fb; margin-bottom: 6px;">📡 PR DIRECTOR LOG</div>
                    <div id="pr-briefing-log" style="font-size: 0.65rem; font-family: var(--font-mono); color: #777; background: rgba(0,0,0,0.3); padding: 8px; border-radius: 4px; max-height: 80px; overflow-y: auto;">
                        > PR Director online. Warte auf Turnierdaten...
                    </div>
                </div>
            </div>
        </div>


        <!-- 360° PLAYER DOSSIER — V95 -->
        <div id="modal-dossier" class="deep-dive-window hidden">
            <div class="modal-content" style="width: 980px; max-width: 98vw; box-shadow: 0 0 28px rgba(167,139,250,0.1);">
                <button class="close-modal cyber-btn attr-btn" style="color: #b8c5d6;">SCHLIESSEN</button>
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 1rem; border-bottom: 1px solid rgba(167,139,250,0.3); padding-bottom: 8px;">
                    <h2 style="color: #a78bfa; margin: 0; font-size: 1rem;">🗂️ <span data-i18n="dossier-title">360° PLAYER DOSSIER</span></h2>
                    <select id="dossier-player-select" class="cyber-btn" style="font-size: 0.65rem; color: #b8c5d6; background: transparent; margin-left: auto;">
                        <option value="0">Spieler 1</option>
                        <option value="1">Spieler 2</option>
                        <option value="2">Spieler 3</option>
                        <option value="3">Spieler 4</option>
                    </select>
                    <button id="btn-master-advice" class="cyber-btn" style="font-size: 0.65rem; color: #b8c5d6;" data-i18n="btn-master-advice">🧠 MASTER ADVICE</button>
                    <button id="btn-generate-expose" class="cyber-btn" style="font-size: 0.65rem; color: #00ff88; font-weight: 700; animation: procGlow 2s infinite;" data-i18n="btn-expose">📄 EXPOSÉ GENERIEREN</button>
                </div>

                <!-- 4-Quadrant Grid + Radar Center -->
                <div class="dossier-grid">

                    <!-- Q1: MEDIZIN -->
                    <div class="dossier-quadrant" id="dq-medical">
                        <div class="dq-header" style="color: var(--accent-cyan);">🩺 <span data-i18n="dq-medical">MEDIZIN</span></div>
                        <div class="dq-row"><span data-i18n="label-bodyfat">Körperfett</span><span id="dq-bodyfat" class="dq-val">—</span></div>
                        <div class="dq-row"><span data-i18n="label-hrv">HRV</span><span id="dq-hrv" class="dq-val">—</span></div>
                        <div class="dq-row"><span data-i18n="label-asymmetry">Asymmetrie</span><span id="dq-asym" class="dq-val">—</span></div>
                        <div class="dq-row"><span data-i18n="label-recovery">Regeneration</span><span id="dq-recovery" class="dq-val">—</span></div>
                        <div id="dq-alert-badge" style="display:none; font-size:0.6rem; color:#ff4b2b; margin-top:5px;">⚠ NAGELSMANN ALERT AKTIV</div>
                    </div>

                    <!-- CENTER: Radar Chart -->
                    <div class="dossier-radar-wrap">
                        <canvas id="dossier-radar-canvas" width="220" height="220"></canvas>
                        <div id="dossier-player-name" style="font-family: var(--font-heading); text-align: center; color: #a78bfa; margin-top: 4px; font-size: 0.8rem;">—</div>
                        <div id="dossier-ovr" style="font-family: var(--font-heading); text-align: center; font-size: 1.6rem; font-weight: 900; color: #fff; margin-top: -2px;">—</div>
                        <div style="font-size: 0.55rem; color: #555; text-align: center;" data-i18n="label-ovr">OVERALL</div>
                    </div>

                    <!-- Q2: TAKTIK -->
                    <div class="dossier-quadrant" id="dq-tactical">
                        <div class="dq-header" style="color: #00ff88;">⚽ <span data-i18n="dq-tactical">TAKTIK</span></div>
                        <div class="dq-row"><span data-i18n="label-expected-goals">Erwartete Tore (xG)</span><span id="dq-xg" class="dq-val">—</span></div>
                        <div class="dq-row"><span data-i18n="dq-formation">Rollenprofil</span><span id="dq-role" class="dq-val">—</span></div>
                        <div class="dq-row"><span data-i18n="dq-pressing">Pressing</span><span id="dq-press" class="dq-val">—</span></div>
                        <div class="dq-row"><span data-i18n="dq-last5">Ø xG letzte 5 Sp.</span><span id="dq-last5" class="dq-val">—</span></div>
                    </div>

                    <!-- Q3: FINANZEN -->
                    <div class="dossier-quadrant" id="dq-financial">
                        <div class="dq-header" style="color: #ffd700;">💰 <span data-i18n="dq-financial">FINANZEN</span></div>
                        <div class="dq-row"><span data-i18n="dq-contract">Vertragsende</span><span id="dq-contract" class="dq-val">—</span></div>
                        <div class="dq-row"><span data-i18n="dq-salary">Gehalt</span><span id="dq-salary" class="dq-val">—</span></div>
                        <div class="dq-row"><span data-i18n="dq-marketval">Market Marktwert</span><span id="dq-marketval" class="dq-val">—</span></div>
                        <div class="dq-row"><span data-i18n="dq-brand">Markenwert Effekt</span><span id="dq-brand" class="dq-val">—</span></div>
                    </div>

                    <!-- Q4: PSYCHOLOGIE -->
                    <div class="dossier-quadrant" id="dq-psychological">
                        <div class="dq-header" style="color: #ff4b2b;">🧠 <span data-i18n="dq-psych">PSYCHOLOGIE</span></div>
                        <div class="dq-row"><span data-i18n="label-reaction">Reaktion</span><span id="dq-reaction" class="dq-val">—</span></div>
                        <div class="dq-row"><span data-i18n="label-dual-task">Dual Task</span><span id="dq-dual" class="dq-val">—</span></div>
                        <div class="dq-row"><span data-i18n="label-cog-stress">Kognitiver Stress</span><span id="dq-cogstress" class="dq-val">—</span></div>
                        <div class="dq-row"><span data-i18n="dq-form">Form</span><span id="dq-form" class="dq-val">—</span></div>
                    </div>
                </div>

                <!-- Master Advice Log -->
                <div style="margin-top: 10px; border-top: 1px solid rgba(167,139,250,0.2); padding-top: 8px;">
                    <div style="font-family: var(--font-heading); font-size: 0.6rem; color: #a78bfa; margin-bottom: 5px;" data-i18n="dossier-advisor">🧠 CROSS-MODULE MASTER ADVISOR</div>
                    <div id="dossier-advice-log" style="font-size: 0.7rem; font-family: var(--font-mono); color: #ccc; background: rgba(0,0,0,0.4); padding: 10px; border-radius: 4px; min-height: 36px; line-height: 1.5;">
                        > Wähle einen Spieler und drücke MASTER ADVICE...
                    </div>
                </div>
            </div>
        </div>


        <!-- V100: TONI ONBOARDING OVERLAY -->
        <div id="toni-onboarding" style="display:none; position:fixed; inset:0; z-index:9999; background:rgba(5,8,16,0.97); backdrop-filter:blur(12px); justify-content:center; align-items:center; flex-direction:column;">
            <div style="text-align:center; max-width:480px; padding: 2rem;">
                <div style="font-family:Orbitron,sans-serif; font-size:2.5rem; font-weight:900; color:#cc0000; letter-spacing:4px; margin-bottom:4px;">TONI</div>
                <div style="font-size:0.7rem; color:#b8c5d6; letter-spacing:3px; margin-bottom:2rem;">STARK ELITE INTELLIGENCE SYSTEM</div>
                <div id="onboard-msg" style="font-family:JetBrains Mono,monospace; font-size:0.9rem; color:#fff; min-height:60px; line-height:1.6; margin-bottom:1.5rem; border-left:3px solid #cc0000; padding-left:1rem; text-align:left;"> </div>
                <div id="onboard-name-wrap" style="display:none; margin-bottom:1.2rem;">
                    <input id="onboard-name-input" type="text" placeholder="Dein Name..." autocomplete="off"
                        style="background:rgba(255,255,255,0.05); border:1px solid rgba(200,197,214,0.4); border-radius:4px; color:#fff; font-family:JetBrains Mono,monospace; font-size:1rem; padding:10px 16px; width:260px; outline:none; text-align:center; letter-spacing:1px;">
                    <button id="onboard-name-btn" style="display:block; margin:12px auto 0; background:#cc0000; border:none; color:#fff; font-family:Orbitron,sans-serif; font-size:0.75rem; padding:8px 24px; border-radius:3px; cursor:pointer; letter-spacing:1px;">BESTÄTIGEN</button>
                </div>
                <div id="onboard-skip" style="font-size:0.55rem; color:#333; cursor:pointer; margin-top:1rem; letter-spacing:1px;" onclick="skipOnboarding()">ÜBERSPRINGEN</div>
            </div>
        </div>

        <!-- V100: SHOPPING ENGINE PANEL -->
        <div id="modal-shopping" class="deep-dive-window hidden">
            <div class="modal-content" style="width:860px; max-width:97vw; box-shadow:0 0 28px rgba(204,0,0,0.12);">
                <button class="close-modal cyber-btn attr-btn" style="color: #b8c5d6;">SCHLIESSEN</button>
                <h2 style="color:#cc0000; margin-top:0; border-bottom:1px solid rgba(204,0,0,0.3); padding-bottom:6px; font-size:1rem;">
                    🛒 <span data-i18n="shopping-title">SHOPPING ENGINE — PREISVERGLEICH</span>
                    <span id="shopping-live-badge" style="font-size:0.55rem; background:rgba(204,0,0,0.1); border:1px solid #cc0000; color:#cc0000; padding:2px 8px; border-radius:12px; margin-left:auto; float:right;">LIVE SEARCH</span>
                </h2>
                <div style="display:flex; gap:10px; margin-bottom:1rem; flex-wrap:wrap;">
                    <select id="shop-item-type" class="cyber-btn" style="font-size:0.65rem; color: #b8c5d6; background:transparent;">
                        <option value="tracksuit">Trainingsanzug</option>
                        <option value="jersey">Trikot</option>
                        <option value="shorts">Shorts</option>
                        <option value="ball">Trainingsball</option>
                        <option value="gloves">Torwart-Handschuhe</option>
                    </select>
                    <input id="shop-qty" type="number" min="1" max="200" value="15" class="data-input" style="width:70px;" placeholder="Stk.">
                    <button id="btn-shop-search" class="cyber-btn" style="color: #b8c5d6; font-size:0.65rem;">🔍 PREISE VERGLEICHEN</button>
                </div>
                <div id="shopping-toni-log" style="font-size:0.65rem; font-family:JetBrains Mono,monospace; color:#b8c5d6; background:rgba(0,0,0,0.4); padding:8px; border-radius:4px; margin-bottom:10px; min-height:24px; border-left:2px solid #cc0000;"> > Wähle Artikel und starte den Preisvergleich...</div>
                <div id="shopping-grid" style="display:grid; grid-template-columns:repeat(3,1fr); gap:1rem;"></div>
                <div id="shopping-bestbuy" style="display:none; margin-top:1rem; padding:10px; border:1px solid #f5c400; border-radius:4px; background:rgba(245,196,0,0.05);">
                    <div style="font-family:Orbitron,sans-serif; font-size:0.65rem; color:#f5c400; margin-bottom:4px;">⭐ BESTE EMPFEHLUNG</div>
                    <div id="bestbuy-content" style="font-size:0.7rem; color:#fff;"></div>
                </div>
            </div>
        </div>

        <!-- V102: STARK BULL ACCESS GATE -->
        <div id="access-gate" style="position:fixed;inset:0;z-index:99999;background:#05080f;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:Orbitron,sans-serif;">
            <div style="text-align:center;max-width:440px;width:90vw;">
                <video id="gate-intro-video" src="intro.mp4" autoplay playsinline loop
    style="width:100%;max-width:420px;border-radius:6px;margin-bottom:0.5rem;display:block;">
</video>
                <div style="font-size:0.55rem;color:#cc0000;letter-spacing:5px;margin-bottom:0.3rem;">STARK ELITE</div>
                <div style="font-size:1.8rem;font-weight:900;color:#f0f2f5;letter-spacing:2px;margin-bottom:0.3rem;">TONI 2.0</div>
                <div style="font-size:0.5rem;color:#555;letter-spacing:3px;margin-bottom:2rem;">INTELLIGENCE SYSTEM — ZUGANG GESICHERT</div>
                <div style="margin-bottom:1.2rem; position:relative;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                        <div style="font-size:0.55rem;color:#b8c5d6;letter-spacing:2px;text-align:left;">OLLAMA ENDPOINT</div>
                        <div onclick="document.getElementById('ollama-help-modal').style.display='flex'" style="cursor:pointer; background:rgba(204,0,0,0.1); border:1px solid #cc0000; color:#cc0000; border-radius:50%; width:16px; height:16px; display:flex; align-items:center; justify-content:center; font-size:10px; font-style:italic; font-weight:bold; transition:all 0.2s;" onmouseover="this.style.background='#cc0000'; this.style.color='#fff';" onmouseout="this.style.background='rgba(204,0,0,0.1)'; this.style.color='#cc0000';">i</div>
                    </div>
                    <input id="gate-endpoint" type="text" value="http://localhost:11434" autocomplete="off"
                        style="width:100%;box-sizing:border-box;background:rgba(255,255,255,0.04);border:1px solid rgba(204,0,0,0.3);border-radius:4px;color:#f0f2f5;font-family:JetBrains Mono,monospace;font-size:0.75rem;padding:10px 14px;outline:none;letter-spacing:1px;">
                    
                    <!-- OLLAMA HELP MODAL -->
                    <div id="ollama-help-modal" style="display:none;position:absolute;inset:0;background:rgba(5,8,15,0.98);z-index:10;flex-direction:column;justify-content:center;align-items:flex-start;text-align:left;padding:20px;border-radius:4px;border:1px solid rgba(204,0,0,0.5);box-shadow:0 10px 30px rgba(0,0,0,0.8);">
                        <div style="font-family:Orbitron,sans-serif;font-size:1rem;font-weight:900;color:#cc0000;letter-spacing:2px;margin-bottom:1rem;text-align:center;width:100%;">COACH ONBOARDING</div>
                        <ol style="color:#b8c5d6;font-family:JetBrains Mono,monospace;font-size:0.65rem;line-height:1.6;margin-bottom:1.5rem;padding-left:1.5rem;text-align:left;">
                            <li>Lade <strong>Ollama</strong> für Mac/PC.</li>
                            <li>Öffne das Terminal und gib ein:<br><code style="background:rgba(255,255,255,0.08);padding:3px 6px;border-radius:3px;color:#00ffff;display:inline-block;margin-top:6px;border:1px solid rgba(0,255,255,0.2);">OLLAMA_ORIGINS="*" ollama serve</code></li>
                            <li>Gib deine lokale IP (oder localhost) in das Endpoint-Feld ein.</li>
                        </ol>
                        <button onclick="document.getElementById('ollama-help-modal').style.display='none'" style="background:transparent;border:1px solid #cc0000;color:#cc0000;font-family:Orbitron,sans-serif;font-size:0.6rem;font-weight:bold;padding:8px 16px;border-radius:4px;cursor:pointer;letter-spacing:2px;width:100%;transition:background 0.2s;" onmouseover="this.style.background='#cc0000'; this.style.color='#fff';" onmouseout="this.style.background='transparent'; this.style.color='#cc0000';">VERSTANDEN</button>
                    </div>
                </div>
                <div style="margin-bottom:1.2rem;">
                    <div id="gate-password-label" style="font-size:0.55rem;color:#b8c5d6;letter-spacing:2px;text-align:left;margin-bottom:4px;">MASTER-PASSWORT / API-KEY</div>
                    <input id="gate-key" type="password" placeholder="Passwort hier eingeben" autocomplete="off"
                        style="width:100%;box-sizing:border-box;background:rgba(255,255,255,0.04);border:1px solid rgba(204,0,0,0.3);border-radius:4px;color:#f0f2f5;font-family:JetBrains Mono,monospace;font-size:0.75rem;padding:10px 14px;outline:none;letter-spacing:2px;">
                </div>
                <button id="gate-submit" onclick="submitAccessGate()"
                    style="width:100%;background:#cc0000;border:none;color:#fff;font-family:Orbitron,sans-serif;font-size:0.8rem;font-weight:700;padding:12px;border-radius:4px;cursor:pointer;letter-spacing:2px;transition:background 0.2s;"
                    onmouseover="this.style.background='#aa0000'" onmouseout="this.style.background='#cc0000'">
                    ZUGANG VALIDIEREN
                </button>
                <div id="gate-error" style="margin-top:10px;font-size:0.6rem;color:#cc0000;min-height:16px;letter-spacing:1px;"></div>
                <div id="demo-modus-btn" onclick="bypassGate()" style="margin-top:1.5rem;font-size:0.6rem;color:#888;cursor:pointer;letter-spacing:2px;padding:10px;z-index:99999;position:relative;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#888'">DEMO-MODUS (OHNE API)</div>
            </div>
        </div>

        <!-- V102: BULL JUMP ANIMATION LAYER -->
        <div id="bull-animation" style="display:none;position:fixed;inset:0;z-index:99998;background:#05080f;overflow:hidden;pointer-events:none;">
            <video id="bull-video" src="intro.mp4" autoplay playsinline
    style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
    max-width:60vw;max-height:60vh;border-radius:8px;z-index:2;">
</video>
<div id="bull-sprite" style="display:none" style="position:absolute;top:50%;left:-10%;transform:translateY(-50%);font-size:8rem;animation:bullJump 1.5s cubic-bezier(0.25,0.46,0.45,0.94) forwards;">🐂</div>
            <div id="particles-wrap" style="position:absolute;inset:0;pointer-events:none;"></div>
            <div id="logo-reveal" style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;animation:logoReveal 0.8s ease 1.2s forwards;">
                <div style="font-family:Orbitron,sans-serif;font-size:5rem;font-weight:900;color:#cc0000;letter-spacing:4px;text-shadow:0 0 30px rgba(204,0,0,0.6);">TONI</div>
                <div style="font-family:Orbitron,sans-serif;font-size:1.2rem;color:#f5c400;letter-spacing:8px;margin-top:-8px;">2 . 0</div>
                <div style="font-family:JetBrains Mono,monospace;font-size:0.65rem;color:#b8c5d6;letter-spacing:4px;margin-top:1rem;">STARK ELITE INTELLIGENCE SYSTEM</div>
            </div>
        </div>

        <!-- V113: HIDDEN ADMIN CONSOLE (CONTROL TOWER) -->
        <div id="admin-console" style="display:none;position:fixed;inset:0;z-index:100000;background:rgba(5,8,15,0.95);backdrop-filter:blur(10px);flex-direction:column;align-items:center;justify-content:center;font-family:Orbitron,sans-serif;">
            <div style="width:400px;max-width:90vw;background:#05080f;border:1px solid #cc0000;border-radius:8px;padding:2rem;box-shadow:0 0 30px rgba(204,0,0,0.3);">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;border-bottom:1px solid rgba(204,0,0,0.3);padding-bottom:0.5rem;">
                    <div style="font-size:1.2rem;font-weight:900;color:#cc0000;letter-spacing:2px;">CONTROL TOWER</div>
                    <button onclick="document.getElementById('admin-console').style.display='none'" style="background:transparent;border:none;color:#555;font-size:1.2rem;cursor:pointer;">×</button>
                </div>
                
                <div style="margin-bottom:1.5rem;">
                    <div style="font-size:0.55rem;color:#b8c5d6;letter-spacing:2px;margin-bottom:4px;">MASTER PASSWORD OVERRIDE</div>
                    <input id="admin-password" type="password" placeholder="New Password" style="width:100%;box-sizing:border-box;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:#fff;padding:8px;font-family:JetBrains Mono,monospace;font-size:0.75rem;margin-bottom:8px;outline:none;">
                    <button onclick="updateMasterPassword()" style="background:rgba(204,0,0,0.1);border:1px solid #cc0000;color:#cc0000;padding:6px 12px;font-size:0.6rem;cursor:pointer;letter-spacing:1px;border-radius:3px;">UPDATE PASSWORD</button>
                    <span id="admin-pwd-msg" style="font-size:0.5rem;color:#00ff88;margin-left:10px;"></span>
                </div>

                <div style="margin-bottom:1.5rem;">
                    <div style="font-size:0.55rem;color:#b8c5d6;letter-spacing:2px;margin-bottom:4px;">OLLAMA ENDPOINT MANAGEMENT</div>
                    <input id="admin-endpoint" type="text" placeholder="http://localhost:11434" style="width:100%;box-sizing:border-box;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:#fff;padding:8px;font-family:JetBrains Mono,monospace;font-size:0.75rem;margin-bottom:8px;outline:none;">
                    <button onclick="updateOllamaEndpoint()" style="background:rgba(204,0,0,0.1);border:1px solid #cc0000;color:#cc0000;padding:6px 12px;font-size:0.6rem;cursor:pointer;letter-spacing:1px;border-radius:3px;">UPDATE ENDPOINT</button>
                    <span id="admin-ep-msg" style="font-size:0.5rem;color:#00ff88;margin-left:10px;"></span>
                </div>

                <div>
                    <div style="font-size:0.55rem;color:#ff4b2b;letter-spacing:2px;margin-bottom:4px;">DANGER ZONE</div>
                    <button onclick="wipeSessionData()" style="width:100%;background:transparent;border:1px solid #ff4b2b;color:#ff4b2b;padding:10px;font-size:0.7rem;font-weight:700;cursor:pointer;letter-spacing:2px;border-radius:3px;transition:0.2s;" onmouseover="this.style.background='#ff4b2b'; this.style.color='#fff';" onmouseout="this.style.background='transparent'; this.style.color='#ff4b2b';">SESSION-RESET (Delete LocalStorage)</button>
                </div>
            </div>
        </div>

        <!-- V113: FEIERABEND-REPORT OVERLAY -->
        <div id="feierabend-overlay" style="display:none;position:fixed;inset:0;z-index:99995;background:rgba(5,8,15,0.95);flex-direction:column;align-items:center;justify-content:center;font-family:Orbitron,sans-serif;backdrop-filter:blur(8px);transition:all 2s ease;">
            <div id="feierabend-content" style="width:500px;max-width:90vw;background:linear-gradient(135deg, rgba(5,8,15,0.9), rgba(10,16,29,0.9));border:1px solid #f5c400;border-radius:12px;padding:3rem;box-shadow:0 0 40px rgba(245,196,0,0.15);text-align:center;transition:opacity 1s ease;">
                <div style="font-size:3rem;margin-bottom:1rem;">🌙</div>
                <div style="font-size:1.5rem;font-weight:900;color:#f5c400;letter-spacing:3px;margin-bottom:0.5rem;">EOD SYNC COMPLETE</div>
                <div style="font-family:JetBrains Mono,monospace;font-size:0.7rem;color:#b8c5d6;letter-spacing:2px;margin-bottom:2rem;">SYSTEMS SECURED. DATA LOGGED.</div>
                
                <div style="text-align:left;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.1);border-radius:6px;padding:1.5rem;font-family:JetBrains Mono,monospace;font-size:0.75rem;color:#f0f2f5;line-height:1.8;">
                    <div style="display:flex;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:0.8rem;margin-bottom:0.8rem;">
                        <span style="color:#b8c5d6;">Anwesende Spieler:</span>
                        <span style="color:#00ff88;font-weight:700;">24/25</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:0.8rem;margin-bottom:0.8rem;">
                        <span style="color:#b8c5d6;">Medical-Status:</span>
                        <span style="color:#ff4b2b;font-weight:700;">1 VERLETZUNG (Müller)</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;">
                        <span style="color:#b8c5d6;">Trainings-Intensität:</span>
                        <span style="color:#f5c400;font-weight:700;">VERIFIZIERT (85%)</span>
                    </div>
                </div>
            </div>
            <div id="feierabend-shutdown" style="margin-top:2rem;font-family:JetBrains Mono,monospace;font-size:0.6rem;color:#555;letter-spacing:4px;transition:opacity 1s ease;">SHUTTING DOWN...</div>
        </div>

        <!-- V101: STT SUBTITLE BAR -->
        <div id="stt-subtitles" style="display:none;position:fixed;bottom:0;left:0;right:0;z-index:9990;background:rgba(5,8,16,0.88);backdrop-filter:blur(12px);border-top:1px solid rgba(0,255,255,0.2);padding:8px 2rem;font-family:JetBrains Mono,monospace;font-size:0.75rem;color:#00ffff;text-align:center;letter-spacing:1px;transition:opacity 0.3s;">
            <span id="stt-subtitle-text"> </span>
        </div>

        <!-- V104: CSS VR FALLBACK (shown when WebGL unavailable) -->
        <div id="vr-css-fallback" style="display:none;position:absolute;inset:0;background:radial-gradient(ellipse at center, #0a1a3a 0%, #050a18 60%, #030508 100%);overflow:hidden;">
            <!-- Stadium floor grid -->
            <div style="position:absolute;bottom:0;left:0;right:0;height:50%;background:linear-gradient(to bottom, transparent, #0a2010 100%);"></div>
            <!-- Grid lines perspective simulation -->
            <svg style="position:absolute;bottom:0;left:0;right:0;width:100%;height:50%;opacity:0.4;" viewBox="0 0 1000 500" preserveAspectRatio="none">
                <defs><linearGradient id="gfade" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#00ff88" stop-opacity="0.8"/><stop offset="100%" stop-color="#00ff88" stop-opacity="0"/></linearGradient></defs>
                <!-- Horizontal lines -->
                <line x1="0" y1="100" x2="1000" y2="100" stroke="url(#gfade)" stroke-width="1"/>
                <line x1="0" y1="200" x2="1000" y2="200" stroke="url(#gfade)" stroke-width="1"/>
                <line x1="0" y1="300" x2="1000" y2="300" stroke="url(#gfade)" stroke-width="1.5"/>
                <line x1="0" y1="400" x2="1000" y2="400" stroke="url(#gfade)" stroke-width="2"/>
                <!-- Converging vertical lines (perspective) -->
                <line x1="500" y1="0" x2="0" y2="500"   stroke="rgba(0,255,136,0.3)" stroke-width="1"/>
                <line x1="500" y1="0" x2="200" y2="500" stroke="rgba(0,255,136,0.3)" stroke-width="1"/>
                <line x1="500" y1="0" x2="400" y2="500" stroke="rgba(0,255,136,0.3)" stroke-width="1"/>
                <line x1="500" y1="0" x2="600" y2="500" stroke="rgba(0,255,136,0.3)" stroke-width="1"/>
                <line x1="500" y1="0" x2="800" y2="500" stroke="rgba(0,255,136,0.3)" stroke-width="1"/>
                <line x1="500" y1="0" x2="1000" y2="500" stroke="rgba(0,255,136,0.3)" stroke-width="1"/>
            </svg>
            <!-- VR Info Panels (CSS-only simulation) -->
            <div style="position:absolute;top:15%;left:5%;width:20%;background:rgba(5,20,40,0.9);border:1px solid rgba(0,255,255,0.4);border-radius:4px;padding:12px;font-family:JetBrains Mono,monospace;font-size:0.65rem;color:#00ffff;">
                <div style="color:#ffd700;font-weight:700;margin-bottom:8px;font-size:0.55rem;letter-spacing:2px;">📊 FINANCE</div>
                <div style="color:#00ff88;">BUDGET: <span id="vr2d-budget">24.5 M€</span></div>
                <div style="color:#ff4b2b;">EXPENSES: <span id="vr2d-exp">17.5 M€</span></div>
                <div style="color:#f5c400;">NET: <span id="vr2d-net">7.0 M€</span></div>
            </div>
            <div style="position:absolute;top:15%;right:5%;width:20%;background:rgba(5,20,40,0.9);border:1px solid rgba(204,0,0,0.4);border-radius:4px;padding:12px;font-family:JetBrains Mono,monospace;font-size:0.65rem;color:#ff4444;">
                <div style="color:#b8c5d6;font-weight:700;margin-bottom:8px;font-size:0.55rem;letter-spacing:2px;">🩺 MEDIZIN</div>
                <div id="vr2d-hrv" style="color:#00ff88;">HRV: 72 ms</div>
                <div id="vr2d-fat" style="color:#ffd700;">BF: 11.2%</div>
                <div id="vr2d-load" style="color:#00ffff;">LOAD: MED</div>
            </div>
            <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-120%);text-align:center;">
                <div style="font-family:Orbitron,sans-serif;font-size:3rem;font-weight:900;color:rgba(255,255,255,0.12);letter-spacing:6px;">STARK ELITE</div>
                <div style="font-family:Orbitron,sans-serif;font-size:0.7rem;color:#cc0000;letter-spacing:4px;margin-top:-8px;">VR COMMAND CENTER</div>
            </div>
            <div style="position:absolute;bottom:10%;left:50%;transform:translateX(-50%);font-family:JetBrains Mono,monospace;font-size:0.55rem;color:rgba(0,255,255,0.4);letter-spacing:2px;text-align:center;">
                ⚠ WebGL nicht verfügbar — CSS-Fallback aktiv<br>
                <span style="font-size:0.45rem;color:#333;">Chrome: chrome://flags → WebGL aktivieren oder über lokalen Server öffnen</span>
            </div>
        </div>
        <!-- V112: THE BULLETIN PHONE SIMULATOR -->
        <div id="bulletin-phone" class="phone-hidden" style="position:fixed; bottom:20px; right:20px; width:320px; height:650px; background:#050a0f; border-radius:36px; border:8px solid #1a2744; box-shadow: 0 0 30px rgba(0,0,0,0.8), inset 0 0 15px rgba(204,0,0,0.1); z-index:9000; overflow:hidden; font-family:'Titillium Web',sans-serif; display:flex; flex-direction:column; transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
            <!-- Phone Header / Notch -->
            <div style="height:25px; background:#050a0f; text-align:center; padding-top:4px; font-size:0.6rem; color:#b8c5d6; display:flex; justify-content:space-between; padding:4px 15px 0;">
                <span id="phone-time">09:41</span>
                <div style="width:60px; height:18px; background:#000; border-radius:10px; margin:0 auto; transform:translateY(-2px);"></div>
                <span>5G 🔋</span>
            </div>
            
            <!-- Lockscreen / Wallpaper -->
            <div id="phone-home" style="flex:1; background:url('https://images.unsplash.com/photo-1518605368461-1ee7c5101689?auto=format&fit=crop&w=400&q=80') center/cover; position:relative; padding:15px; display:flex; flex-direction:column;">
                <div style="position:absolute; inset:0; background:linear-gradient(to bottom, rgba(5,10,15,0.4), rgba(5,10,15,0.9));"></div>
                
                <!-- V114: Daily Briefing Card (Lockscreen) -->
                <div id="phone-daily-card" style="position:relative; z-index:2; background:rgba(26,39,68,0.75); backdrop-filter:blur(10px); border:1px solid rgba(0,204,255,0.3); border-radius:16px; padding:15px; margin-top:20px; transform:translateY(20px); opacity:0; transition:all 0.5s ease; cursor:pointer;" onclick="playMorningBriefing()">
                    <div style="font-size:0.65rem; color:#0cf; letter-spacing:2px; margin-bottom:10px;">🔴 DAILY BRIEFING</div>
                    <div id="briefing-tasks" style="font-size:0.8rem; color:#fff; display:flex; flex-direction:column; gap:8px;">
                        <div class="briefing-item"><span style="color:#f5c400;">1.</span> Taktik-Fokus: Setup prüfen</div>
                        <div class="briefing-item"><span style="color:#0cf;">2.</span> CFO: Ausrüstung prüfen</div>
                        <div class="briefing-item"><span style="color:#cc0000;">3.</span> NLZ: Leistungswerte</div>
                    </div>
                    <button class="cyber-btn mt-2 w-100" style="font-size:0.7rem; padding:6px; background:rgba(204,0,0,0.8); color:#fff; border:none; border-radius:4px; margin-top:10px;">▶ BRIEFING HÖREN</button>
                </div>
                
                <!-- Push Notifications Area -->
                <div id="phone-push-notifications" style="position:relative; z-index:2; flex:1; display:flex; flex-direction:column; justify-content:flex-end; gap:8px; padding-bottom:15px;"></div>

                <!-- Apps Grid -->
                <div style="position:relative; z-index:2; margin-top:auto; display:grid; grid-template-columns:repeat(4, 1fr); gap:12px; margin-bottom:10px;">
                    <div class="phone-app" onclick="openPhoneApp('messenger')" title="Toni Messenger">
                        <div style="width:48px; height:48px; background:linear-gradient(135deg, #cc0000, #ff6600); border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:1.5rem; margin:0 auto;">💬</div>
                        <div style="text-align:center; font-size:0.55rem; color:#fff; margin-top:4px;">Messenger</div>
                    </div>
                    <div class="phone-app" onclick="openPhoneApp('vox')" title="Vox Player">
                        <div style="width:48px; height:48px; background:linear-gradient(135deg, #0cf, #0088ff); border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:1.5rem; margin:0 auto;">🎙️</div>
                        <div style="text-align:center; font-size:0.55rem; color:#fff; margin-top:4px;">Vox Player</div>
                    </div>
                    <div class="phone-app" onclick="openPhoneApp('tactics')" title="Tactics Pocket">
                        <div style="width:48px; height:48px; background:linear-gradient(135deg, #1a2744, #050a0f); border:1px solid #b8c5d6; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:1.5rem; margin:0 auto;">📋</div>
                        <div style="text-align:center; font-size:0.55rem; color:#fff; margin-top:4px;">Tactics</div>
                    </div>
                    <div class="phone-app" onclick="togglePhone()" title="Schließen">
                        <div style="width:48px; height:48px; background:transparent; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:1.5rem; margin:0 auto;">🔽</div>
                        <div style="text-align:center; font-size:0.55rem; color:#fff; margin-top:4px;">Schließen</div>
                    </div>
                </div>
            </div>
            
            <!-- App Views -->
            <!-- Messenger App -->
            <div id="app-messenger" class="phone-app-view" style="display:none; flex:1; background:#050810; padding:15px; position:absolute; inset:25px 0 0 0; z-index:3; flex-direction:column;">
                <div style="font-size:0.8rem; color:#cc0000; font-weight:700; border-bottom:1px solid #1a2744; padding-bottom:10px; margin-bottom:15px; display:flex; justify-content:space-between;">
                    <span>Toni Messenger</span>
                    <button onclick="closePhoneApp()" style="background:none; border:none; color:#b8c5d6; cursor:pointer;">✖</button>
                </div>
                <div id="phone-chat-history" style="flex:1; overflow-y:auto; display:flex; flex-direction:column; gap:10px; padding-bottom:10px;">
                    <div class="chat-bubble chat-toni">System initialisiert. Bereit für Ihre Anweisungen, Coach.</div>
                </div>
                <div style="margin-top:auto; padding-top:10px; border-top:1px solid #1a2744; display:flex; gap:8px;">
                    <input type="text" id="phone-chat-input" placeholder="Nachricht an Toni..." style="flex:1; background:#1a2744; border:1px solid #334; border-radius:16px; padding:8px 12px; color:#fff; font-size:0.75rem;">
                    <button onclick="sendPhoneMessage()" style="background:#cc0000; color:#fff; border:none; border-radius:50%; width:32px; height:32px; cursor:pointer; display:flex; align-items:center; justify-content:center;">➤</button>
                </div>
            </div>
            
            <!-- Vox Player App -->
            <div id="app-vox" class="phone-app-view" style="display:none; flex:1; background:#050a0f; padding:15px; position:absolute; inset:25px 0 0 0; z-index:3; flex-direction:column;">
                <div style="font-size:0.8rem; color:#0cf; font-weight:700; border-bottom:1px solid #1a2744; padding-bottom:10px; margin-bottom:15px; display:flex; justify-content:space-between;">
                    <span>Vox Player</span>
                    <button onclick="closePhoneApp()" style="background:none; border:none; color:#b8c5d6; cursor:pointer;">✖</button>
                </div>
                <div style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center;">
                    <div id="vox-waveform" style="width:100%; height:80px; background:rgba(0,204,255,0.05); border-radius:8px; display:flex; align-items:center; justify-content:center; gap:4px; margin-bottom:20px;">
                        <!-- Animated waveform bars injected by javascript -->
                        <div class="vox-bar" style="width:4px; height:10px; background:#0cf; border-radius:2px;"></div>
                        <div class="vox-bar" style="width:4px; height:20px; background:#0cf; border-radius:2px;"></div>
                        <div class="vox-bar" style="width:4px; height:35px; background:#0cf; border-radius:2px;"></div>
                        <div class="vox-bar" style="width:4px; height:15px; background:#0cf; border-radius:2px;"></div>
                        <div class="vox-bar" style="width:4px; height:8px; background:#0cf; border-radius:2px;"></div>
                    </div>
                    <div id="vox-now-playing" style="color:#fff; font-size:0.85rem; font-weight:600; text-align:center;">Podcast: Taktik-Fokus</div>
                    <div style="color:#b8c5d6; font-size:0.65rem; margin-top:4px;">Stark Elite Audio Engine</div>
                </div>
                <button class="cyber-btn mt-2 w-100" style="padding:10px; background:rgba(0,204,255,0.1); border:1px solid #0cf; border-radius:4px; color:#0cf;" onclick="playLockerRoomBroadcast()">▶ LOCKER ROOM BROADCAST</button>
            </div>
            
            <!-- Tactics Pocket App -->
            <div id="app-tactics" class="phone-app-view" style="display:none; flex:1; background:#050a0f; padding:15px; position:absolute; inset:25px 0 0 0; z-index:3; flex-direction:column;">
                <div style="font-size:0.8rem; color:#fff; font-weight:700; border-bottom:1px solid #1a2744; padding-bottom:10px; margin-bottom:15px; display:flex; justify-content:space-between;">
                    <span>Tactics Pocket</span>
                    <button onclick="closePhoneApp()" style="background:none; border:none; color:#b8c5d6; cursor:pointer;">✖</button>
                </div>
                <div style="flex:1; display:flex; flex-direction:column; gap:10px;">
                    <div style="background:#1a2744; padding:10px; border-radius:8px;">
                        <div style="color:#0cf; font-size:0.65rem; margin-bottom:4px;">Zuletzt gesendet</div>
                        <div style="color:#fff; font-size:0.8rem; font-weight:600;">5-Meter Raum Laufwege</div>
                        <button onclick="speakAlert('Taktik-Update an den Kader versendet.', 'analyst')" style="background:rgba(204,0,0,0.2); border:1px solid #cc0000; color:#cc0000; padding:4px 8px; border-radius:4px; font-size:0.6rem; cursor:pointer; margin-top:8px;">KADER BENACHRICHTIGEN</button>
                    </div>
                </div>
            </div>
        </div>

</body>
</html>
"""

    with open('index.html', 'w') as f:
        f.write(html)

if __name__ == '__main__':
    generate_html()
