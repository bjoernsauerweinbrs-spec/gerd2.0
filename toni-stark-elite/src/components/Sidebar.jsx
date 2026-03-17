import React from 'react';
import Icon from './Icon';

const Sidebar = ({ activeTab, setActiveTab, activeRole }) => {
  const navItems = [
    { id: "home", label: "Executive", icon: "home", color: "neon", roles: ["Trainer", "Admin"] },
    { id: "tactical", label: "Board", icon: "shield", color: "neon", roles: ["Trainer", "Admin"] },
    { id: "training_lab", label: "Lab", icon: "activity", color: "redbull", roles: ["Trainer", "Admin"] },
    { id: "cfo", label: "CFO Büro", icon: "pie-chart", color: "gold", roles: ["Manager", "Admin"] },
    { id: "nlz", label: "NLZ Hub", icon: "layout-grid", color: "neon", roles: ["Jugendtrainer (NLZ)", "Admin"] },
    { id: "medical", label: "Medical", icon: "heart-pulse", color: "redbull", roles: ["Trainer", "Admin"] },
    { id: "stadion-kurier", label: "Kurier", icon: "newspaper", color: "gold", roles: ["Presse / Scouting", "Admin"] },
    { id: "legacy", label: "Legacy", icon: "heart", color: "gold", roles: ["Trainer", "Manager", "Admin"] }
  ];

  const visibleNav = navItems.filter(item => item.roles.includes(activeRole));

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-20 fixed left-0 top-0 h-full border-r border-white/5 bg-black/80 backdrop-blur-xl z-[100] transition-all pt-24 pb-8 shadow-[0_0_30px_rgba(0,0,0,0.8)]">
        <nav className="flex-1 flex flex-col items-center gap-6">
          {visibleNav.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all group ${activeTab === item.id ? "bg-white/10" : "hover:bg-white/5"}`}
            >
              <Icon 
                name={item.icon} 
                size={22} 
                className={`transition-colors duration-300 ${activeTab === item.id ? (item.color === 'neon' ? 'text-[#00f3ff]' : item.color === 'redbull' ? 'text-[#e21b4d]' : 'text-[#d4af37]') : "text-white/40 group-hover:text-white"}`} 
              />
              <span className={`text-[8px] mt-1 font-black uppercase tracking-widest transition-colors duration-300 ${activeTab === item.id ? 'text-white' : 'text-transparent group-hover:text-white/50'}`}>
                {item.label}
              </span>
              
              {/* Active Indicator Line */}
              {activeTab === item.id && (
                <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full shadow-[0_0_10px_currentColor] ${item.color === 'neon' ? 'bg-[#00f3ff]' : item.color === 'redbull' ? 'bg-[#e21b4d]' : 'bg-[#d4af37]'}`}></div>
              )}
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
