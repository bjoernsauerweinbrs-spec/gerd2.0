import React, { useState } from 'react';
import Icon from './Icon';

const Header = ({ activeTab, activeRole, setActiveRole }) => {
  const [globalAiInput, setGlobalAiInput] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  const handleGlobalAiSubmit = async () => {
    if (!globalAiInput.trim()) return;
    setIsAiProcessing(true);
    
    // Simulate AI Processing delay
    setTimeout(() => {
      console.log(`Global AI commanded: ${globalAiInput} via ${activeRole}`);
      setIsAiProcessing(false);
      setGlobalAiInput('');
    }, 1500);
  };

  const roles = [
    { id: "Trainer", icon: "user-check", bg: "bg-neon/20", border: "border-neon/50", text: "text-neon" },
    { id: "Manager", icon: "briefcase", bg: "bg-gold/20", border: "border-gold/50", text: "text-gold" },
    { id: "Presse / Scouting", icon: "camera", bg: "bg-white/20", border: "border-white/50", text: "text-white" },
    { id: "Jugendtrainer (NLZ)", icon: "graduation-cap", bg: "bg-cyan-500/20", border: "border-cyan-500/50", text: "text-cyan-400" },
    { id: "Admin", icon: "shield", bg: "bg-redbull/20", border: "border-redbull/50", text: "text-redbull" }
  ];

  return (
    <header className="w-full flex flex-col md:flex-row justify-between items-stretch gap-4 p-4 md:p-8 bg-black/40 backdrop-blur-md border-b border-white/5 relative z-50">
      
      {/* LEFT: Branding & Role Switcher */}
      <div className="flex flex-col gap-2 relative z-10 w-full md:w-auto">
        <h1 className="text-xl md:text-2xl font-black text-white leading-none uppercase tracking-tighter italic flex items-center gap-2">
          <Icon name="activity" className="text-neon" size={24} /> GERD 2.0 <span className="text-[#e21b4d]">PRO</span>
        </h1>
        
        {/* Role Switcher */}
        <div className="flex flex-wrap items-center gap-2 mt-2">
          {roles.map((r) => (
            <button
              key={r.id}
              onClick={() => setActiveRole(r.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded border text-[9px] font-black uppercase tracking-widest transition-all ${
                activeRole === r.id 
                  ? `${r.bg} ${r.border} ${r.text} shadow-[0_0_15px_rgba(255,255,255,0.1)]` 
                  : "bg-black/40 border-white/10 text-white/40 hover:border-white/30"
              }`}
            >
              <Icon name={r.icon} size={12} />
              {r.id.split(" ")[0]} 
            </button>
          ))}
        </div>
      </div>

      {/* RIGHT: Global Intelligence Input */}
      <div className="flex-1 w-full md:max-w-xl flex items-center relative z-10">
        <div className={`w-full bg-black/60 border rounded-xl overflow-hidden flex transition-colors shadow-inner ${isAiProcessing ? 'border-neon shadow-[0_0_20px_rgba(0,243,255,0.2)]' : 'border-white/20 focus-within:border-white/50'}`}>
          <div className="pl-4 py-3 flex items-center justify-center border-r border-white/10 bg-black/40">
            <Icon name="zap" className={isAiProcessing ? "text-neon animate-pulse" : "text-white/40"} size={18} />
          </div>
          <input
            type="text"
            value={globalAiInput}
            onChange={(e) => setGlobalAiInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGlobalAiSubmit()}
            placeholder={`Befehl an GERD als ${activeRole}...`}
            className="flex-1 bg-transparent border-none text-white text-sm font-mono px-4 outline-none placeholder:text-white/30"
            disabled={isAiProcessing}
          />
          <button
            onClick={handleGlobalAiSubmit}
            disabled={!globalAiInput.trim() || isAiProcessing}
            className={`px-6 py-3 font-black text-[10px] uppercase tracking-widest transition-colors ${
              globalAiInput.trim() 
                ? 'bg-neon text-black hover:bg-white' 
                : 'bg-white/5 text-white/20'
            }`}
          >
            {isAiProcessing ? '...' : 'Execute'}
          </button>
        </div>
      </div>
      
    </header>
  );
};

export default Header;
