const LegacyHub = ({ targetDNA = 85 }) => {
  const [inputValue, setInputValue] = useState("");
  const [translation, setTranslation] = useState(null);

  const handleTranslate = () => {
    if (!inputValue.trim()) return;
    const v = inputValue.toLowerCase();
    let result = "KI empfiehlt Fokus auf taktische Disziplin & Grundtugenden.";
    if (v.includes("malochen") || v.includes("kämpfen")) result = "Erwartungs-KPI: Laufleistung > 118km, Intensive Runs > 700, Counter-Pressing Success > 65%.";
    if (v.includes("gras fressen") || v.includes("einsatz")) result = "Gerd-DNA Metrik: Maximale Aggressivität gegen den Ball & High-Intensity Runs > 15km/h im letzten Drittel.";
    if (v.includes("charakter") || v.includes("rückgrat")) result = "Mentalitätsscore > 85. Leader-Qualitäten erfordern 10% weniger Fehlerquote unter hohem Gegnerdruck.";
    if (v.includes("kameradschaft") || v.includes("teamgeist")) result = "Synergie-KPI: Durchschnittliche Verbleibdauer im Kader verlängern. Assist-Network-Dichte > 0.8.";
    
    setTranslation(result);
  };

  return (
    <div className="space-y-8 animate-fade-in relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon/10 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 relative z-10">
        <div className="hidden md:block w-1 h-12 bg-gradient-to-b from-neon to-[#00f3ff]/50 rounded-full shadow-[0_0_10px_rgba(0,243,255,0.5)]"></div>
        <div>
          <h2 className="text-xl md:text-3xl font-black uppercase italic tracking-tighter shadow-sm text-neon drop-shadow-[0_0_8px_rgba(0,243,255,0.4)]">
            Legacy Archive
          </h2>
          <p className="text-white/40 font-mono text-[10px] md:text-sm tracking-widest mt-1">
            WISSENSZENTRUM & GERD SAUERWEIN MEMORIAL
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
        {/* Memorial Section */}
        <div className="glass-panel p-8 border border-neon/20 shadow-[0_8px_32px_rgba(0,243,255,0.1)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-neon/10 rounded-bl-full pointer-events-none transiton-transform group-hover:scale-110"></div>
          <Icon name="quote" size={48} className="text-neon/30 absolute top-6 right-6" />
          
          <h3 className="text-xl font-black text-white uppercase tracking-widest mb-6 border-b border-neon/30 pb-4">Das Vermächtnis</h3>
          
          <div className="space-y-6">
            <div className="flex gap-4 items-center bg-black/40 p-5 border border-neon/30 rounded-lg mb-6 shadow-inner relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-white/5 to-transparent pointer-events-none"></div>
               <div className="flex-1 relative z-10">
                  <div className="mb-3">
                     <VoiceVisualizer targetDNA={targetDNA} colorClass="text-neon" />
                  </div>
                  <blockquote className="text-lg md:text-xl font-serif italic text-white/90 leading-relaxed pl-3 border-l-2 border-neon/50">
                    "Gerd Sauerwein (1961–2026) – Charakter vor Quote. Ehrlichkeit vor Erfolg. Ein Leben für den Fußball, ein Vermächtnis für die Ewigkeit."
                  </blockquote>
               </div>
            </div>
            <p className="text-sm font-mono text-white/50 pl-6">Erfolg ist kein Zufall. Es ist ehrliche Arbeit und der absolute Wille.</p>
            <div className="flex items-center gap-4 pl-6 mt-4">
              <div className="w-12 h-12 rounded-full border border-neon/50 flex items-center justify-center bg-black/50 overflow-hidden shadow-[0_0_10px_rgba(0,243,255,0.3)]">
                 <Icon name="award" size={20} className="text-neon" />
              </div>
              <div>
                <div className="font-black text-neon uppercase tracking-widest drop-shadow-[0_0_5px_rgba(0,243,255,0.4)]">Gerd Sauerwein</div>
                <div className="text-[10px] text-white/50 font-mono tracking-widest">1961 – 2026 | HEAD OF INTELLIGENCE</div>
              </div>
            </div>
          </div>
        </div>

        {/* Legacy Translator */}
        <div className="glass-panel p-8 border border-white/5 flex flex-col relative z-20">
          <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
            <h3 className="text-lg font-black text-white/80 uppercase tracking-widest">Legacy Translator</h3>
            <Icon name="languages" size={24} className="text-neon drop-shadow-[0_0_5px_rgba(0,243,255,0.4)]" />
          </div>
          
          <p className="text-xs text-white/50 mb-6 font-mono leading-relaxed">
            Übersetzt traditionelle Fußballweisheiten in moderne Architektur-Metriken.
          </p>

          <div className="space-y-4 flex-1 flex flex-col">
            <div className="relative">
              <Icon name="message-square" size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
              <input 
                type="text" 
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleTranslate()}
                placeholder="Z.B. 'Malochen', 'Gras fressen'..."
                className="w-full bg-[#0a1120] border border-white/10 rounded-lg pl-12 pr-4 py-4 text-sm font-bold text-white outline-none focus:border-gold/50 transition-colors shadow-inner"
              />
            </div>
            
            <button 
              onClick={handleTranslate}
              className="w-full bg-gold/10 hover:bg-gold hover:text-black text-gold border border-gold/30 transition-all duration-300 py-3 rounded-lg font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2"
            >
              <Icon name="cpu" size={16} /> Decodieren
            </button>

            <AnimatePresence>
              {translation && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="mt-auto pt-6"
                >
                  <div className="bg-[#050a14] border-l-2 border-neon p-4 rounded-r-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-neon/10 rounded-bl-full pointer-events-none"></div>
                    <div className="text-[10px] text-neon font-black tracking-widest uppercase mb-2 flex items-center gap-2">
                      <Icon name="check-circle" size={12} /> System Output
                    </div>
                    <div className="text-sm font-mono text-white/90 leading-relaxed">
                      {translation}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
