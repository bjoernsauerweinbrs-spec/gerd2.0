import React from 'react';
import Icon from './Icon';

const Sidebar = ({ activeTab, setActiveTab, activeRole }) => {
  const navItems = [
    { id: "home", label: activeRole === 'Trainer' ? 'Trainer-Büro' : 'Executive Board', icon: "home", color: "neon", roles: ["Trainer", "Admin", "Manager"] },
    { id: "tactical", label: "Taktik", icon: "shield", color: "neon", roles: ["Trainer", "Admin"] },
    { id: "roster", label: "Mannschaftskader", icon: "users", color: "gold", roles: ["Trainer", "Admin"] },
    { id: "training_lab", label: "Training", icon: "activity", color: "redbull", roles: ["Trainer", "Admin"] },
    { id: "cfo", label: "Transfermarkt", icon: "pie-chart", color: "gold", roles: ["Manager", "Admin"] },
    { id: "nlz", label: "NLZ Hub", icon: "layout-grid", color: "neon", roles: ["Jugendtrainer (NLZ)", "Admin"] },
    { id: "medical", label: "Medizin", icon: "heart-pulse", color: "redbull", roles: ["Trainer", "Admin"] },
    { id: "calendar", label: "Kalender", icon: "calendar", color: "neon", roles: ["Trainer", "Manager", "Admin", "Jugendtrainer (NLZ)"] },
    { id: "stadion-kurier", label: "Kurier", icon: "newspaper", color: "gold", roles: ["Presse / Scouting", "Admin"] },
    { id: "legacy", label: "Legacy", icon: "heart", color: "gold", roles: ["Trainer", "Manager", "Admin"] }
  ];

  const visibleNav = navItems.filter(item => item.roles.includes(activeRole));

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 fixed left-0 top-0 h-full border-r border-[#e21b4d]/20 bg-[#060a12] z-[100] transition-all pt-28 pb-8 shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-y-auto">
        <nav className="flex-1 flex flex-col items-stretch gap-2 px-4">
          {visibleNav.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex items-center gap-4 px-4 py-4 rounded-lg transition-all group overflow-hidden ${activeTab === item.id ? "bg-[#0a1120] border border-[#00f3ff]/20" : "hover:bg-white/5 border border-transparent"}`}
            >
              {/* Active Indicator Line */}
              {activeTab === item.id && (
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${item.color === 'neon' ? 'bg-[#00f3ff]' : item.color === 'redbull' ? 'bg-[#e21b4d]' : 'bg-[#d4af37]'}`}></div>
              )}
            
              <Icon 
                name={item.icon} 
                size={20} 
                className={`transition-colors duration-300 ${activeTab === item.id ? (item.color === 'neon' ? 'text-[#00f3ff]' : item.color === 'redbull' ? 'text-[#e21b4d]' : 'text-[#d4af37]') : "text-white/40 group-hover:text-white/80"}`} 
              />
              <span className={`text-xs font-black uppercase tracking-widest transition-colors duration-300 text-left ${activeTab === item.id ? 'text-white' : 'text-white/60 group-hover:text-white'}`}>
                {item.label}
              </span>
            </button>
          ))}
        </nav>
      </aside>

      {/* MOBILE BOTTOM NAVIGATION */}
      <div className="md:hidden flex fixed bottom-0 left-0 w-full bg-[rgba(5,10,20,0.98)] border-t border-[#00f3ff]/30 z-[500] py-3 justify-around backdrop-blur-xl shadow-[0_-10px_40px_rgba(0,0,0,0.9)]">
        {visibleNav.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center p-2 text-[9px] font-black uppercase tracking-widest ${activeTab === item.id ? "text-white" : "text-white/40"}`}
          >
            <Icon
              name={item.icon}
              size={24}
              className={activeTab === item.id ? (item.color === 'neon' ? 'text-[#00f3ff] drop-shadow-[0_0_8px_rgba(0,243,255,0.5)]' : item.color === 'redbull' ? 'text-[#e21b4d] drop-shadow-[0_0_8px_rgba(226,27,77,0.5)]' : 'text-[#d4af37] drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]') : ""}
            />
            <span className="mt-1">{item.label}</span>
          </button>
        ))}
      </div>
    </>
  );
};

export default Sidebar;
