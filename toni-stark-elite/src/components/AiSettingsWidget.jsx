import React, { useState, useEffect } from 'react';
import Icon from './Icon';

const AiSettingsWidget = ({ context, onClose }) => {
  const [provider, setProvider] = useState(localStorage.getItem('stark_ai_provider') || 'openai');
  const [openAiKey, setOpenAiKey] = useState(localStorage.getItem('stark_openai_key') || '');
  const [groqKey, setGroqKey] = useState(localStorage.getItem('stark_groq_key') || '');
  const [geminiKey, setGeminiKey] = useState(localStorage.getItem('stark_gemini_key') || '');
  const [isSaved, setIsSaved] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    localStorage.setItem('stark_ai_provider', provider);
    localStorage.setItem('stark_openai_key', openAiKey);
    localStorage.setItem('stark_groq_key', groqKey);
    localStorage.setItem('stark_gemini_key', geminiKey);
  }, [provider, openAiKey, groqKey, geminiKey]);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => {
       setIsSaved(false);
       if(onClose) onClose();
    }, 800);
  };

  const isParent = context === 'parent';

  return (
    <div className={`w-full rounded-xl border p-4 ${isParent ? 'bg-white shadow border-gray-200 text-navy' : 'bg-navy border-white/10 text-white'}`}>
       <div className="flex items-center justify-between mb-3">
           <div className="flex items-center gap-2">
              <Icon name="cpu" size={20} className={isParent ? "text-redbull" : "text-neon"} />
              <h3 className={`font-black uppercase tracking-widest text-sm ${isParent ? "text-navy" : "text-white"}`}>
                 AI-System {isParent ? "Aktivieren" : "Konfiguration"}
              </h3>
           </div>
           <button onClick={() => setShowInfo(!showInfo)} className={`p-1.5 rounded-full transition-colors flex items-center justify-center ${isParent ? (showInfo ? "bg-navy text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200") : (showInfo ? "bg-white text-navy" : "bg-white/10 text-white/50 hover:bg-white/20 hover:text-white")}`} title="Info & Links anzeigen">
              <Icon name="info" size={14} />
           </button>
       </div>

       {isParent && (
         <p className="text-xs text-gray-500 mb-4 leading-relaxed font-medium">
            Um das KI-gestützte Trainer-Feedback für dein Kind abzurufen, wird ein API-Key benötigt.
            Du kannst dir bei <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="text-redbull underline font-bold">Groq (Llama-3)</a> einen Key generieren und hier hinterlegen. Keine Abokosten, 100% kostenfrei für Eltern!
         </p>
       )}

       {!isParent && (
          <div className="mb-4">
             <label className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-1 block">KI Provider wechseln</label>
             <div className="grid grid-cols-2 gap-1 bg-black/50 border border-white/10 rounded-lg p-1">
                <button onClick={() => setProvider('openai')} className={`py-1.5 text-[10px] font-bold rounded uppercase transition-colors ${provider === 'openai' ? 'bg-neon text-black' : 'text-white/60 hover:text-white'}`}>
                  OpenAI
                </button>
                <button onClick={() => setProvider('groq')} className={`py-1.5 text-[10px] font-bold rounded uppercase transition-colors ${provider === 'groq' ? 'bg-redbull text-white' : 'text-white/60 hover:text-white'}`}>
                  Groq (Cloud)
                </button>
                <button onClick={() => setProvider('gemini')} className={`py-1.5 text-[10px] font-bold rounded uppercase transition-colors ${provider === 'gemini' ? 'bg-blue-500 text-white' : 'text-white/60 hover:text-white'}`}>
                  Gemini
                </button>
                <button onClick={() => setProvider('ollama')} className={`py-1.5 text-[10px] font-bold rounded uppercase transition-colors flex items-center justify-center gap-1 ${provider === 'ollama' ? 'bg-white text-black' : 'text-white/60 hover:text-white'}`}>
                  Ollama (Lokal) <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                </button>
             </div>
          </div>
       )}

       <div className="space-y-3">
          {(provider === 'openai' && !isParent) && (
            <div>
               <label className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-1 flex justify-between">
                   <span>OpenAI API Key</span>
                   {openAiKey.length > 5 && <span className="text-neon">✓ Gespeichert</span>}
               </label>
               <input
                 type="password"
                 value={openAiKey}
                 onChange={(e) => setOpenAiKey(e.target.value)}
                 className="w-full bg-black/40 border border-white/20 rounded-lg px-3 py-2 text-sm text-white font-mono placeholder:text-white/20 focus:border-neon outline-none transition-colors"
                 placeholder="sk-..."
               />
            </div>
          )}

          {(provider === 'groq' || isParent) && (
            <div>
               <label className={`text-[10px] font-black uppercase tracking-widest mb-1 flex justify-between ${isParent ? "text-gray-400" : "text-white/50"}`}>
                 <span>Groq API Key (Llama 3)</span>
                 {groqKey.length > 5 && <span className={isParent ? "text-green-600" : "text-redbull"}>✓ Gespeichert</span>}
               </label>
               <input
                 type="password"
                 value={groqKey}
                 onChange={(e) => {
                    setGroqKey(e.target.value);
                    if(isParent) setProvider('groq'); 
                 }}
                 className={`w-full border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none transition-colors ${isParent ? "bg-gray-50 border-gray-300 text-navy focus:border-redbull placeholder:text-gray-400" : "bg-black/40 border-white/20 text-white focus:border-redbull placeholder:text-white/20"}`}
                 placeholder="gsk_..."
               />
            </div>
          )}

          {(provider === 'gemini' && !isParent) && (
            <div>
               <label className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-1 flex justify-between">
                   <span>Google Gemini API Key</span>
                   {geminiKey.length > 5 && <span className="text-blue-400">✓ Gespeichert</span>}
               </label>
               <input
                 type="password"
                 value={geminiKey}
                 onChange={(e) => setGeminiKey(e.target.value)}
                 className="w-full bg-black/40 border border-white/20 rounded-lg px-3 py-2 text-sm text-white font-mono placeholder:text-white/20 focus:border-blue-500 outline-none transition-colors"
                 placeholder="AIza..."
               />
            </div>
          )}
       </div>

       {showInfo && (
          <div className={`mt-2 mb-4 p-3 rounded-lg text-[10px] leading-relaxed border animate-fade-in ${isParent ? "bg-blue-50 border-blue-200 text-blue-900" : "bg-blue-900/20 border-blue-500/30 text-blue-100"}`}>
             {provider === 'openai' && !isParent && (
                <>
                   <strong className="uppercase tracking-widest text-[9px] opacity-70">Kosten:</strong> Prepaid (Zahlungsmittel in Cloud Console nötig)<br/>
                   <strong className="uppercase tracking-widest text-[9px] opacity-70 mt-1 inline-block">Modell:</strong> OpenAI GPT-4o (Premium Intelligenz)<br/>
                   <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className={`mt-2 font-bold flex items-center gap-1 ${isParent ? "text-blue-600 hover:underline" : "text-blue-300 hover:text-blue-100"}`}>
                      <Icon name="external-link" size={10} /> Hier API Key erstellen
                   </a>
                </>
             )}
             {(provider === 'groq' || isParent) && (
                <>
                   <strong className="uppercase tracking-widest text-[9px] opacity-70">Kosten:</strong> 100% Kostenlos (Free Tier ohne Kontodaten)<br/>
                   <strong className="uppercase tracking-widest text-[9px] opacity-70 mt-1 inline-block">Modell:</strong> Llama 3 70B über Groq (Sehr Klug & Schnell)<br/>
                   <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className={`mt-2 font-bold flex items-center gap-1 ${isParent ? "text-blue-600 hover:underline" : "text-blue-300 hover:text-blue-100"}`}>
                      <Icon name="external-link" size={10} /> Hier gratis API Key holen
                   </a>
                   {isParent && <p className="mt-2 text-[9px] opacity-80 italic border-t border-blue-200 pt-2">Tipp: Erstelle den Key über den Link, kopiere ihn und füge ihn hier oben ein.</p>}
                </>
             )}
             {provider === 'gemini' && !isParent && (
                <>
                   <strong className="uppercase tracking-widest text-[9px] opacity-70">Kosten:</strong> 100% kostenlose Stufe (Google Entwickler)<br/>
                   <strong className="uppercase tracking-widest text-[9px] opacity-70 mt-1 inline-block">Modell:</strong> Google Gemini 1.5 Flash (Schnell & Zuverlässig)<br/>
                   <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className={`mt-2 font-bold flex items-center gap-1 ${isParent ? "text-blue-600 hover:underline" : "text-blue-300 hover:text-blue-100"}`}>
                      <Icon name="external-link" size={10} /> Hier gratis API Key holen
                   </a>
                </>
             )}
             {provider === 'ollama' && !isParent && (
                <>
                   <strong className="uppercase tracking-widest text-[9px] opacity-70">Privatsphäre & Kosten:</strong> 100% Lokal, 100% Kostenlos, Offline-Fähig<br/>
                   <strong className="uppercase tracking-widest text-[9px] opacity-70 mt-1 inline-block">Modell:</strong> Llama 3 (Lokal über dein MacBook Terminal)<br/>
                   <div className="mt-2 font-bold text-[10px] text-white/80 flex items-center gap-1 border-t border-white/10 pt-2">
                      <Icon name="terminal" size={10} /> Keine API Keys nötig! Stelle nur sicher, dass die Ollama-App auf deinem Mac läuft.
                   </div>
                </>
             )}
          </div>
       )}

       <button
         onClick={handleSave}
         className={`mt-4 w-full py-3 rounded-lg font-black uppercase text-xs tracking-widest transition-all ${
            isSaved 
              ? (isParent ? 'bg-green-500 text-white' : 'bg-green-500 text-black')
              : (isParent ? 'bg-navy text-white hover:bg-black' : 'bg-neon/10 border border-neon/30 text-neon hover:bg-neon hover:text-navy')
         }`}
       >
         {isSaved ? "Fenster wird geschlossen..." : "Einstellungen Schließen"}
       </button>
    </div>
  );
};

export default AiSettingsWidget;
