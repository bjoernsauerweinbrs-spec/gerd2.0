import sys

def build_setup_wizard():
    return """const SetupWizard = ({ onComplete }) => {
  const [clubName, setClubName] = useState("");
  const [epicKey, setEpicKey] = useState(localStorage.getItem("gerd_epicKey") || "");
  const [ollamaUrl, setOllamaUrl] = useState(localStorage.getItem("gerd_ollamaUrl") || "http://localhost:11434");
  
  const [geminiStatus, setGeminiStatus] = useState("checking");
  const [ollamaStatus, setOllamaStatus] = useState("checking");
  
  useEffect(() => {
    if (!epicKey) setGeminiStatus("empty");
    else if (epicKey.length > 20) setGeminiStatus("online");
    else setGeminiStatus("error");

    const checkOllama = async () => {
      if (!ollamaUrl) {
         setOllamaStatus("empty");
         return;
      }
      try {
        const res = await fetch(`${ollamaUrl}/api/version`);
        if (res.ok) setOllamaStatus("online");
        else setOllamaStatus("error");
      } catch (e) {
        setOllamaStatus("error");
      }
    };
    checkOllama();
  }, [epicKey, ollamaUrl]);

  const handleStart = () => {
    if (clubName.length < 3) return;
    if (epicKey) localStorage.setItem("gerd_epicKey", epicKey);
    if (ollamaUrl) localStorage.setItem("gerd_ollamaUrl", ollamaUrl);
    onComplete(clubName);
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-[#050a14] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#0a1120] via-[#050a14] to-black overflow-y-auto p-6">
      <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="glass-panel p-8 md:p-12 max-w-2xl w-full relative overflow-hidden group border-neon/30 shadow-[0_0_40px_rgba(0,243,255,0.1)]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-neon/10 rounded-bl-full pointer-events-none"></div>
        
        <div className="text-center mb-10 relative z-10">
          <div className="inline-block p-4 rounded-full bg-neon/10 text-neon mb-4 border border-neon/20 shadow-[0_0_15px_rgba(0,243,255,0.2)]">
            <Icon name="cpu" size={40} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white mb-2 text-shadow-glow">Gerd <span className="text-neon">2.0</span></h1>
          <div className="text-[10px] text-white/50 font-mono tracking-widest uppercase mb-4">Integrated Department System • Initialization</div>
        </div>
        
        <div className="space-y-8 relative z-10">
          <div className="space-y-2">
            <label className="text-xs font-bold text-white/70 uppercase tracking-widest flex items-center gap-2">
               <Icon name="shield" size={12} className="text-neon" /> Vereinsidentifikation
            </label>
            <input 
              type="text" 
              value={clubName}
              onChange={e => setClubName(e.target.value)}
              placeholder="z.B. FC Bayern München oder Link zu Fussball.de"
              className="w-full bg-black/60 border border-white/10 rounded-lg p-4 text-sm font-bold text-white outline-none focus:border-neon focus:shadow-[0_0_15px_rgba(0,243,255,0.2)] transition-all placeholder:text-white/20 placeholder:font-normal placeholder:font-mono"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/5 p-5 rounded-xl border border-white/10 relative overflow-hidden">
               <div className="flex justify-between items-start mb-4">
                  <label className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                    <Icon name="key" size={14} className="text-gold" /> Gemini KI <span className="text-[9px] text-white/40 normal-case tracking-normal">(Cloud)</span>
                  </label>
                  <div className={`w-3 h-3 rounded-full ${geminiStatus === 'online' ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : geminiStatus === 'error' ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : 'bg-white/20'}`}></div>
               </div>
               <input 
                 type="password" 
                 value={epicKey}
                 onChange={e => setEpicKey(e.target.value)}
                 placeholder="API Key eingeben..."
                 className="w-full bg-black/40 border border-white/10 rounded p-3 text-xs text-white font-mono outline-none focus:border-gold transition-all mb-3"
               />
               <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-[10px] text-gold/70 hover:text-gold flex items-center gap-1 transition-colors">
                  <Icon name="external-link" size={10} /> Hier kostenlosen Key erstellen
               </a>
            </div>

            <div className="bg-white/5 p-5 rounded-xl border border-white/10 relative overflow-hidden">
               <div className="flex justify-between items-start mb-4">
                  <label className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                    <Icon name="server" size={14} className="text-[#00f3ff]" /> Ollama <span className="text-[9px] text-white/40 normal-case tracking-normal">(Local)</span>
                  </label>
                  <div className={`w-3 h-3 rounded-full ${ollamaStatus === 'online' ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : ollamaStatus === 'error' ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : 'bg-white/20'}`}></div>
               </div>
               <input 
                 type="text" 
                 value={ollamaUrl}
                 onChange={e => setOllamaUrl(e.target.value)}
                 placeholder="http://localhost:11434"
                 className="w-full bg-black/40 border border-white/10 rounded p-3 text-xs text-white font-mono outline-none focus:border-neon transition-all mb-3"
               />
               <a href="https://ollama.com/" target="_blank" rel="noopener noreferrer" className="text-[10px] text-neon/70 hover:text-neon flex items-center gap-1 transition-colors">
                  <Icon name="external-link" size={10} /> Ollama für lokale KI herunterladen
               </a>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10">
            <button 
              onClick={handleStart}
              disabled={clubName.length < 3}
              className={`w-full py-5 rounded-xl font-black uppercase tracking-[0.2em] text-sm transition-all flex items-center justify-center gap-3 ${clubName.length > 2 ? 'bg-neon text-black shadow-[0_0_25px_rgba(0,243,255,0.4)] hover:scale-[1.02]' : 'bg-white/5 text-white/30 cursor-not-allowed'}`}
            >
              <Icon name="power" size={18} /> System Hochfahren
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
"""

with open("react-code-v2.jsx", "r") as f:
    lines = f.readlines()

new_lines = []
skip = False
for line in lines:
    if line.startswith("const EntryShell ="):
        skip = True
        new_lines.append(build_setup_wizard())
        continue
        
    if skip and line.startswith("const DataIngestionTool"):
        skip = False
        
    if not skip:
        # Also replace EntryShell usage inside App
        if "return <EntryShell onComplete=" in line:
            new_lines.append(line.replace("EntryShell", "SetupWizard"))
        else:
            new_lines.append(line)

with open("react-code-v2.jsx", "w") as f:
    f.writelines(new_lines)

print("Setup components injected.")
