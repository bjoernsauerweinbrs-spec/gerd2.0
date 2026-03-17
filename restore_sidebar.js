// Sidebar
const Sidebar = ({ activeTab, setActiveTab, activeRole }) => {
  const allNavItems = [
    { id: "executive", label: "Executive Center", icon: "briefcase", roles: ["trainer", "manager", "jugend", "admin"] },
    { id: "tactical", label: "Tactical Board", icon: "layout", roles: ["trainer", "admin"] },
    { id: "scouting", label: "Manager & Finanzen", icon: "pie-chart", roles: ["manager", "admin"] },
    { id: "media", label: "Media Hub", icon: "globe", roles: ["presse", "admin"] },
    { id: "academy", label: "Academy (Youth)", icon: "target", roles: ["jugend", "admin"] },
    { id: "legacy", label: "Legacy Archive", icon: "archive", roles: ["manager", "presse", "admin"] }
  ];

  const navItems = allNavItems.filter(item => item.roles.includes(activeRole));

  const getRoleColor = () => {
    switch(activeRole) {
      case "trainer": return "neon";
      case "manager": return "gold";
      case "jugend":  return "green-400";
      case "presse":  return "blue-400";
      case "admin":   return "red-500";
      default: return "neon";
    }
  };
  const roleColor = getRoleColor();

  return (
    <div className="hidden md:flex w-72 bg-[#02050a] border-r border-white/5 flex-col h-screen shrink-0 relative overflow-hidden z-20">
      <div className="p-8 border-b border-white/5 relative">
         <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-redbull to-transparent opacity-50"></div>
        <div className="w-12 h-1 bg-redbull mb-4 shadow-[0_0_10px_rgba(226,27,77,0.5)]"></div>
        <h1 className="text-2xl font-black italic tracking-tighter uppercase text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          GERD 2.0
          <span className="block text-redbull text-[10px] tracking-[0.3em] font-sans mt-1">
            INTEGRATED DEPT.
          </span>
        </h1>
      </div>

      <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
        <div className={`text-[10px] uppercase font-black tracking-widest pl-2 mb-4 text-${roleColor}`}>
          Modul-Silo ({activeRole})
        </div>
        {navItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-xs uppercase tracking-wider transition-all relative overflow-hidden group ${isActive ? "bg-white/10 text-white" : "text-white/40 hover:text-white/80 hover:bg-white/5"}`}
            >
              <Icon name={item.icon} size={18} className={isActive ? `text-${roleColor} drop-shadow-[0_0_8px_currentColor]` : `group-hover:text-${roleColor} transition-colors`} />
              <span className="relative z-10">{item.label}</span>
              {isActive && (
                <div 
                  className={`absolute inset-0 border border-${roleColor}/30 bg-${roleColor}/10 rounded-lg z-0 transition-opacity duration-300`}
                />
              )}
            </button>
          )
        })}
      </div>

      <div className="p-6 border-t border-white/5 mt-auto bg-[#050a14]">
        <div className="text-[10px] text-white/30 font-mono text-center flex items-center justify-center gap-2">
           <Icon name="shield" size={12}/> IDS Secured Silo
        </div>
      </div>
    </div>
  );
};

// MobileTabBar
const MobileTabBar = ({ activeTab, setActiveTab, activeRole }) => {
  const allNavItems = [
    { id: "executive", label: "Exec", icon: "briefcase", roles: ["trainer", "manager", "jugend", "admin"] },
    { id: "tactical", label: "Tactics", icon: "layout", roles: ["trainer", "admin"] },
    { id: "scouting", label: "Finance", icon: "pie-chart", roles: ["manager", "admin"] },
    { id: "media", label: "Media", icon: "globe", roles: ["presse", "admin"] },
    { id: "academy", label: "Academy", icon: "target", roles: ["jugend", "admin"] },
    { id: "legacy", label: "Legacy", icon: "archive", roles: ["manager", "presse", "admin"] }
  ];

  const navItems = allNavItems.filter(item => item.roles.includes(activeRole));
  
  const getRoleColor = () => {
    switch(activeRole) {
      case "trainer": return "text-neon";
      case "manager": return "text-gold";
      case "jugend":  return "text-green-400";
      case "presse":  return "text-blue-400";
      case "admin":   return "text-red-500";
      default: return "text-neon";
    }
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-[72px] bg-[#02050a] border-t border-white/10 z-[100] flex justify-around items-center px-1 pb-safe shadow-[0_-5px_20px_rgba(0,0,0,0.8)]">
       {navItems.map(item => (
          <button 
             key={item.id}
             onClick={() => setActiveTab(item.id)}
             className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors relative ${activeTab === item.id ? getRoleColor() : 'text-white/40 hover:text-white/70'}`}
          >
             {activeTab === item.id && (
               <div className={`absolute top-0 w-8 h-0.5 rounded-full ${getRoleColor().replace('text-', 'bg-')} shadow-[0_0_8px_currentColor]`}></div>
             )}
             <Icon name={item.icon} size={20} className={activeTab === item.id ? 'animate-bounce mt-1' : 'mt-1'} />
             <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
          </button>
       ))}
       <button 
         onClick={() => { const input = document.querySelector('input[placeholder="Frag Gerd..."]'); if(input){ input.focus(); input.scrollIntoView({behavior:'smooth'}); } else { alert("AI-Heartbeat (Mentor) derzeit nicht im DOM sichtbar."); } }}
         className="flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors relative text-neon group"
       >
         <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center border border-neon shadow-[0_0_10px_rgba(0,243,255,0.4)] group-hover:bg-neon/20 transition-all">
           <Icon name="cpu" size={16} className="text-neon" />
         </div>
         <span className="text-[8px] font-black uppercase tracking-widest text-[#00f3ff]">Mentor</span>
       </button>
    </div>
  );
};
