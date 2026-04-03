import React, { useState } from 'react';
import Icon from './Icon';
import { scrapeClubData } from '../utils/aiConfig';

const ROLES = [
  { id: 'Trainer', name: 'Trainer Senioren', icon: 'whistle', color: 'neon', description: 'Zugriff auf Taktik, Training & Kaderplanung.', pin: '1904' },
  { id: 'Manager', name: 'Manager', icon: 'briefcase', color: 'gold', description: 'Voller Einblick in Finanzen und alle Trainer-Aktivitäten.', pin: '2026' },
  { id: 'Presse', name: 'Presseabteilung', icon: 'mic', color: 'blue-500', description: 'Zugang zum Stadion-Kurier und internen Medien.', pin: '1111' },
  { id: 'Jugendtrainer', name: 'Jugendtrainer', icon: 'graduation-cap', color: 'redbull', description: 'Zugriff auf NLZ Academy und Talent-Pipeline.', pin: '1234' },
  { id: 'Eltern', name: 'Eltern-Portal', icon: 'users', color: 'neon', description: 'Trainingsstände, KI-Feedback & Hausaufgaben.', pin: 'INDIVIDUAL' }
];

const Login = ({ onLogin, truthObject }) => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [pinEntry, setPinEntry] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [parentFirstNameInput, setParentFirstNameInput] = useState('');
  const [geminiKeyInput, setGeminiKeyInput] = useState(localStorage.getItem('stark_gemini_key') || '');
  const [clubNameInput, setClubNameInput] = useState(truthObject?.club_info?.name || '');
  const [isAiConnected, setIsAiConnected] = useState(!!localStorage.getItem('stark_gemini_key'));
  const [isScraping, setIsScraping] = useState(false);
  const [scrapingResult, setScrapingResult] = useState(null);
  const [initMessage, setInitMessage] = useState('');

  const handleRoleClick = (role) => {
    setSelectedRole(role);
    setPinEntry('');
    setErrorMsg('');
    setParentFirstNameInput('');
  };

  const handlePinInput = (num) => {
    if (pinEntry.length < 4) {
      const newPin = pinEntry + num;
      setPinEntry(newPin);
      setErrorMsg('');

      if (newPin.length === 4) {
        verifyPin(newPin);
      }
    }
  };

  const handleClearPin = () => {
    setPinEntry('');
    setErrorMsg('');
  };

  const handleSystemInit = async (isDirect = false) => {
    if (!geminiKeyInput.trim() || !clubNameInput.trim()) {
       setInitMessage("API KEY & VEREINSNAME ERFORDERLICH");
       return;
    }

    setIsScraping(true);
    setInitMessage(isDirect ? "NEURAL-RESEARCH GESTARTET..." : "ERSTELLE VERBINDUNG ZUM PROXY...");

    try {
       localStorage.setItem('stark_gemini_key', geminiKeyInput.trim());
       localStorage.setItem('stark_ai_provider', 'gemini');
       
       let stillScraping = true;
       const aiMsgTimer = setTimeout(() => {
          if (stillScraping && !isDirect) setInitMessage("TM BLOCKIERT. STARTE AI-RE-SEARCH (GEMINI 1.5)...");
       }, 1500);

       const response = await scrapeClubData(clubNameInput, geminiKeyInput, isDirect);
       const data = response; // response is already JSON from scrapeClubData
       
       stillScraping = false;
       clearTimeout(aiMsgTimer);

       if (data.success) {
          setScrapingResult(data);
          setInitMessage(data.source === "AI_HYDRATION" ? "NEURAL-SYNC ERFOLGREICH: REALE DATEN GELADEN." : "LIVE-SYNC ERFOLGREICH: transfermarkt.de");
          localStorage.setItem('gerd_init_scraping', JSON.stringify(data));
          setIsAiConnected(true);
       } else {
          let initError = data.message || data.error || "DATEN-LÜCKE: Hydration fehlgeschlagen.";
          if (data.details?.includes("API_KEY_INVALID")) initError = "AI-FEHLER: GEMINI API KEY UNGÜLTIG";
          if (data.details?.includes("429") || data.message?.includes("quota")) initError = "AI-FEHLER: QUOTA ÜBERSCHRITTEN (429). Bitte kurz warten.";
          
          setInitMessage(initError);
          setIsAiConnected(false);
       }
    } catch (err) {
       console.error("Init Error:", err);
       setInitMessage("CONNECTION ERROR: Proxy nicht erreichbar oder AI-Timeout.");
       setIsAiConnected(false);
    } finally {
       setIsScraping(false);
    }
  };

  const verifyPin = (enteredPin) => {
    if (selectedRole.id === 'Eltern') {
      if (!parentFirstNameInput.trim()) {
         setErrorMsg('BITTE VORNAME ODER NACHNAME EINGEBEN');
         setTimeout(() => setPinEntry(''), 1500);
         return;
      }

      const childByPin = truthObject?.nlz_squad?.find(p => String(p.parentPin) === String(enteredPin));
      if (!childByPin) {
         setErrorMsg('PIN FALSCH ODER NICHT AKTIV');
         setTimeout(() => setPinEntry(''), 1500);
         return;
      }

      const pName = (childByPin.name || '').toLowerCase();
      const inputName = parentFirstNameInput.trim().toLowerCase();
      
      const levenshtein = (a, b) => {
        if(a.length === 0) return b.length;
        if(b.length === 0) return a.length;
        const matrix = [];
        for(let i=0; i<=b.length; i++) matrix[i] = [i];
        for(let j=0; j<=a.length; j++) matrix[0][j] = j;
        for(let i=1; i<=b.length; i++) {
          for(let j=1; j<=a.length; j++) {
            if(b.charAt(i-1) === a.charAt(j-1)) matrix[i][j] = matrix[i-1][j-1];
            else matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, Math.min(matrix[i][j-1] + 1, matrix[i-1][j] + 1));
          }
        }
        return matrix[b.length][a.length];
      };

      const nameMatched = pName.includes(inputName) || levenshtein(pName, inputName) <= 2;

      if (nameMatched) {
         setTimeout(() => onLogin('Eltern', childByPin.id), 500);
      } else {
         setErrorMsg(`NAME FALSCH! SPIELER HEISST: ${childByPin.name}`);
         setTimeout(() => setPinEntry(''), 2000);
      }
    } else {
      if (enteredPin === selectedRole.pin) {
        setTimeout(() => onLogin(selectedRole.id), 500);
      } else {
        setErrorMsg('PIN INKORREKT');
        setTimeout(() => setPinEntry(''), 800);
      }
    }
  };

  return (
    <div className="min-h-screen bg-black font-sans text-white relative overflow-hidden flex items-center justify-center p-4">
      <div id="neural-canvas" className="absolute inset-0 z-0"></div>
      <div className="absolute inset-0 carbon-fiber opacity-30 z-0"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-neon/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-redbull/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-4xl glass-panel p-8 md:p-12 border border-white/5 shadow-2xl">
        {!selectedRole ? (
          <div className="animate-fade-in">
            <div className={`mb-12 p-8 rounded-3xl border transition-all duration-700 ${scrapingResult ? 'bg-neon/10 border-neon/50 shadow-[0_0_50px_rgba(0,243,255,0.1)]' : 'bg-white/5 border-white/10'}`}>
               <div className="flex flex-col gap-8">
                  <div className="flex items-center gap-6">
                     <div className={`p-5 rounded-2xl border transition-all ${isAiConnected ? 'text-neon border-neon/50 bg-neon/10 shadow-[0_0_20px_rgba(0,243,255,0.2)]' : 'text-white/20 border-white/10'}`}>
                        <Icon name={isScraping ? "refresh-cw" : (isAiConnected ? "cpu" : "shield-alert")} size={40} className={isScraping ? "animate-spin" : ""} />
                     </div>
                     <div className="flex-1">
                        <h3 className={`text-lg font-black uppercase tracking-[0.2em] ${isAiConnected ? 'text-neon' : 'text-white/60'}`}>
                          {scrapingResult ? 'SYSTEM VOLL HYDRIERT' : (isScraping ? 'INITIALISIERE CORE...' : 'AI CORE & CLUB IDENT')}
                        </h3>
                        <p className="text-[11px] text-white/40 font-mono mt-1 uppercase tracking-widest leading-relaxed">
                          {initMessage || "Geben Sie den API Key und Ihren Verein ein, um die Live-Match-Intelligence zu aktivieren."}
                        </p>
                     </div>
                  </div>

                  {!scrapingResult && (
                    <div className="flex flex-col gap-6 animate-slide-up">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="relative group">
                             <Icon name="key" size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-neon" />
                             <input 
                               type="password"
                               placeholder="GEMINI API KEY (AIza...)"
                               value={geminiKeyInput}
                               onChange={(e) => setGeminiKeyInput(e.target.value)}
                               className="w-full bg-black/60 border border-white/10 rounded-xl pl-10 pr-10 py-4 text-xs font-mono focus:border-neon focus:outline-none transition-all shadow-inner"
                             />
                             {geminiKeyInput && (
                                <button onClick={() => setGeminiKeyInput('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-neon transition-colors">
                                   <Icon name="x-circle" size={16} />
                                </button>
                             )}
                          </div>
                          <div className="relative group">
                             <Icon name="globe" size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-neon" />
                             <input 
                               type="text"
                               placeholder="VEREIN (Z.B. FC SCHALKE 04)"
                               value={clubNameInput}
                               onChange={(e) => setClubNameInput(e.target.value)}
                               className="w-full bg-black/60 border border-white/10 rounded-xl pl-10 pr-4 py-4 text-xs font-black uppercase tracking-widest focus:border-neon focus:outline-none transition-all shadow-inner"
                             />
                          </div>
                       </div>

                       <div className="flex items-center justify-between px-2">
                          <label className="flex items-center gap-3 cursor-pointer group">
                             <input 
                               type="checkbox" 
                               id="direct-ai-check"
                               className="w-5 h-5 bg-black/60 border border-white/10 rounded focus:ring-neon accent-neon cursor-pointer"
                             />
                             <span className="text-[10px] text-white/40 group-hover:text-white transition-colors uppercase font-black tracking-widest">
                                Direkt-AI Modus (Transfermarkt überspringen)
                             </span>
                          </label>
                       </div>
                    </div>
                  )}

                  {scrapingResult && (
                    <div className="bg-black/40 border border-neon/20 rounded-2xl p-6 grid grid-cols-3 gap-6 animate-fade-in">
                       <div className="text-center border-r border-white/10">
                          <div className="text-[10px] text-white/40 uppercase mb-1">Spieler</div>
                          <div className="text-xl font-black text-neon">{scrapingResult.players?.length || 0}</div>
                       </div>
                       <div className="text-center border-r border-white/10">
                          <div className="text-[10px] text-white/40 uppercase mb-1">Status</div>
                          <div className="text-xl font-black text-white">{scrapingResult.liveIntelligence ? 'LIVE' : 'OFFLINE'}</div>
                       </div>
                       <div className="text-center">
                          <div className="text-[10px] text-white/40 uppercase mb-1">Matchday</div>
                          <div className="text-[10px] font-black text-white truncate px-2">
                             {scrapingResult.liveIntelligence?.matchAnalysis || scrapingResult.liveIntelligence?.lastMatch || 'Strategische Analyse bereit.'}
                          </div>
                       </div>
                    </div>
                  )}

                  {!scrapingResult && (
                    <button 
                       onClick={() => {
                          const isDirect = document.getElementById('direct-ai-check')?.checked;
                          handleSystemInit(isDirect);
                       }}
                       disabled={isScraping}
                       className="w-full py-4 bg-neon/10 hover:bg-neon text-neon hover:text-black border border-neon/50 rounded-xl text-xs font-black uppercase tracking-[0.3em] transition-all active:scale-[0.98] shadow-[0_0_30px_rgba(0,243,255,0.1)] flex items-center justify-center gap-3"
                    >
                       {isScraping ? <Icon name="refresh-cw" size={16} className="animate-spin" /> : <Icon name="zap" size={16} />}
                       {isScraping ? "Initialisiere..." : "System-Initialisierung starten"}
                    </button>
                  )}

                  {scrapingResult && (
                     <button 
                        onClick={() => { setScrapingResult(null); setInitMessage(''); }}
                        className="self-center text-[10px] text-white/30 hover:text-white uppercase font-black tracking-widest transition-colors"
                     >
                        Identität korrigieren / Reset
                     </button>
                  )}
               </div>
            </div>

            <h2 className="text-center text-[10px] font-black uppercase tracking-widest text-white/40 mb-6 flex items-center justify-center gap-3">
               <Icon name="lock" size={12} /> Identifikation erforderlich
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ROLES.map((r) => (
                <button
                  key={r.id}
                  onClick={() => handleRoleClick(r)}
                  className={`group relative p-4 text-left border rounded-xl overflow-hidden transition-all duration-300 bg-black/40 hover:bg-black/80 ${
                    r.color === 'neon' ? 'border-[#00f3ff]/10 hover:border-[#00f3ff]' : 
                    r.color === 'gold' ? 'border-[#d4af37]/10 hover:border-[#d4af37]' : 
                    r.color === 'redbull' ? 'border-[#e21b4d]/10 hover:border-[#e21b4d]' : 
                    'border-[#3b82f6]/10 hover:border-[#3b82f6]'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-lg bg-white/5 border border-white/10 group-hover:scale-110 transition-transform ${
                      r.color === 'neon' ? 'text-[#00f3ff]' : 
                      r.color === 'gold' ? 'text-[#d4af37]' : 
                      r.color === 'redbull' ? 'text-[#e21b4d]' : 
                      'text-[#3b82f6]'
                    }`}>
                      <Icon name={r.icon} size={22} />
                    </div>
                    <div>
                      <div className="font-black text-white uppercase tracking-wider text-lg mb-0.5 group-hover:text-white transition-colors">{r.name}</div>
                      <div className="text-[10px] text-white/40 font-mono line-clamp-1">{r.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-12 flex justify-center">
                <button 
                  onClick={() => {
                     if(window.confirm("Achtung: Dies löscht die gesamte lokale Datenbank (Spieler, PINs, Scraper-Daten). Fortfahren?")) {
                         localStorage.removeItem("gerd_truthObject");
                         window.location.reload();
                     }
                  }}
                  className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 hover:border-red-500/50 rounded-full font-mono text-[10px] uppercase tracking-widest transition-all flex items-center gap-2"
                >
                  <Icon name="trash-2" size={14} /> System-Cache leeren (Reset)
                </button>
            </div>
          </div>
        ) : (
          <div className="max-w-sm mx-auto animate-fade-in flex flex-col items-center">
            <button 
              onClick={() => setSelectedRole(null)}
              className="self-start text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white mb-4 flex items-center gap-2"
            >
              <Icon name="arrow-left" size={10} /> Zurück zur Auswahl
            </button>
            <div className="text-center mb-6">
              <div className={`inline-flex p-3 rounded-full bg-white/5 border border-white/10 mb-3 ${
                selectedRole.color === 'neon' ? 'text-[#00f3ff]' : 
                selectedRole.color === 'gold' ? 'text-[#d4af37]' : 
                selectedRole.color === 'redbull' ? 'text-[#e21b4d]' : 
                'text-[#3b82f6]'
              }`}>
                <Icon name={selectedRole.icon} size={24} />
              </div>
              <h2 className="text-xl font-black uppercase tracking-widest text-white">{selectedRole.name}</h2>
              <div className="text-[9px] text-white/40 font-mono tracking-widest uppercase mt-1">Bitte 4-stellige PIN eingeben</div>
            </div>

            {selectedRole.id === 'Eltern' && (
              <div className="mb-6 w-full animate-fade-in">
                <input 
                  type="text" 
                  placeholder="VORNAMEN DES KINDES"
                  value={parentFirstNameInput}
                  onChange={(e) => setParentFirstNameInput(e.target.value)}
                  className="w-full bg-[#0a1120] border border-white/20 text-white font-black text-center uppercase tracking-widest px-4 py-4 rounded-xl focus:border-neon focus:outline-none shadow-inner"
                />
              </div>
            )}

            <div className="flex justify-center gap-4 mb-8">
              {[0, 1, 2, 3].map((i) => (
                <div 
                  key={i} 
                  className={`w-6 h-6 rounded-full border-2 transition-all duration-300 ${
                    pinEntry.length > i ? 'bg-white border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.8)]' : 'bg-transparent border-white/20'
                  } ${errorMsg ? 'border-red-500 bg-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.8)]' : ''}`}
                />
              ))}
            </div>

            {errorMsg && (
              <div className="text-red-500 font-black text-xs uppercase tracking-[0.3em] font-mono text-center mb-4 animate-pulse">
                {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-3 gap-4 w-full">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  onClick={() => handlePinInput(num.toString())}
                  className="h-16 rounded-xl bg-[#0a1120] border border-white/10 text-white font-mono text-2xl font-black hover:bg-white/10 hover:border-white/30 transition-all active:scale-95"
                >
                  {num}
                </button>
              ))}
              <div className="h-16"></div>
              <button
                onClick={() => handlePinInput('0')}
                className="h-16 rounded-xl bg-[#0a1120] border border-white/10 text-white font-mono text-2xl font-black hover:bg-white/10 hover:border-white/30 transition-all active:scale-95"
              >
                0
              </button>
              <button
                onClick={handleClearPin}
                className="h-16 flex items-center justify-center rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition-all active:scale-95"
              >
                <Icon name="delete" size={24} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
