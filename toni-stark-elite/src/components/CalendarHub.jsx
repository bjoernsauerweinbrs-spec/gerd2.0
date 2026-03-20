import React, { useState } from 'react';
import Icon from './Icon';

const CalendarHub = ({ playbooks }) => {
  const [selectedPlaybook, setSelectedPlaybook] = useState(null);

  // Default mock playbooks if empty
  const defaultPlaybooks = [
    {
      id: 999,
      type: "match",
      date: "Heute Abend, 20:30 Uhr",
      title: "Matchday: RB Leipzig vs TSG Hoffenheim",
      opponent: "TSG HOFFENHEIM",
      formation: "4-3-3",
      notes: "Hohes Gegenpressing. Willi Orban als direkter Manndecker gegen Kramaric angesetzt. Xavi Simons zieht extrem weit rein.",
      players: []
    },
    {
      id: 998,
      type: "training",
      date: "Gestern, 10:00 Uhr",
      title: "Drill: Rondo Umschaltspiel (5v2)",
      opponent: "Taktik-Training",
      formation: "N/A",
      notes: "Fokus auf Ballbesitzstabilität unter Druck. NLZ-Spieler integriert.",
      players: []
    }
  ];

  const displayPlaybooks = playbooks && playbooks.length > 0 ? playbooks : defaultPlaybooks;

  const handlePrint = () => {
     window.print();
  };

  return (
    <div className="flex gap-6 h-full animate-fade-in relative">
      
      {/* Left List: The Calendar / Archive */}
      <div className="w-1/3 bg-black/60 border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-md flex flex-col gap-4 overflow-y-auto custom-scrollbar">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-2">
           <div className="p-3 bg-neon/20 rounded-xl border border-neon/50 shadow-[0_0_15px_rgba(0,243,255,0.4)]">
             <Icon name="calendar" size={24} className="text-neon" />
           </div>
           <div>
             <h2 className="text-white text-xl font-black uppercase tracking-widest">Pro Playbook</h2>
             <p className="text-white/50 text-xs font-medium uppercase tracking-wider">Tactical Calendar Archive</p>
           </div>
        </div>

        <div className="flex flex-col gap-3">
          {displayPlaybooks.map((pb) => (
             <button
               key={pb.id}
               onClick={() => setSelectedPlaybook(pb)}
               className={`w-full flex flex-col text-left p-4 rounded-xl border-l-4 transition-all hover:translate-x-1 ${selectedPlaybook?.id === pb.id ? "bg-white/10 border-neon shadow-[0_0_20px_rgba(0,243,255,0.2)]" : "bg-white/5 border-white/20 hover:bg-white/10"}`}
             >
               <div className="text-[10px] text-neon uppercase font-black tracking-widest mb-1 flex items-center justify-between w-full">
                 <span>{pb.date}</span>
                 {pb.type === "match" ? <Icon name="shield" size={12} className="text-redbull" /> : <Icon name="dumbbell" size={12} className="text-neon" />}
               </div>
               <div className="text-white font-bold text-sm tracking-tight">{pb.title}</div>
               <div className="text-white/50 text-xs mt-2 line-clamp-1">{pb.notes}</div>
             </button>
          ))}
        </div>
      </div>

      {/* Right Detail: Playbook Print View */}
      <div className="w-2/3 bg-[#0f172a]/90 border border-white/10 rounded-2xl p-8 shadow-2xl backdrop-blur-md flex flex-col overflow-y-auto custom-scrollbar relative">
         {!selectedPlaybook ? (
           <div className="flex-1 flex flex-col items-center justify-center text-white/30 gap-4">
             <Icon name="book-open" size={64} className="opacity-50" />
             <p className="font-bold text-lg uppercase tracking-widest">Kein Playbook ausgewählt</p>
           </div>
         ) : (
           <div className="flex flex-col gap-8 print-content">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-white/10 pb-6">
                <div>
                   <div className="text-neon font-black tracking-[0.3em] uppercase text-xs mb-2">Stark Elite • Official Match Plan</div>
                   <h1 className="text-white text-3xl font-black uppercase tracking-tighter">{selectedPlaybook.title}</h1>
                   <div className="text-white/60 font-medium mt-2 flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-2"><Icon name="calendar" size={14} /> {selectedPlaybook.date}</span>
                      <span className="flex items-center gap-2"><Icon name="cpu" size={14} /> KI-Verifiziert</span>
                   </div>
                </div>
                {/* Print Button */}
                <button onClick={handlePrint} className="bg-redbull/20 border border-redbull text-redbull hover:bg-redbull hover:text-white p-4 rounded-xl transition-all flex items-center gap-3 focus:outline-none shadow-[0_0_20px_rgba(226,27,77,0.3)] hover:shadow-[0_0_30px_rgba(226,27,77,0.6)]">
                  <Icon name="printer" size={20} />
                  <span className="uppercase font-black text-xs tracking-widest">Drucken</span>
                </button>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-2 gap-6">
                 <div className="bg-black/40 border border-white/5 p-6 rounded-2xl">
                    <div className="text-white/40 uppercase font-black text-[10px] tracking-widest mb-1">Gegner / Thema</div>
                    <div className="text-white text-xl font-bold uppercase">{selectedPlaybook.opponent}</div>
                 </div>
                 <div className="bg-black/40 border border-white/5 p-6 rounded-2xl">
                    <div className="text-white/40 uppercase font-black text-[10px] tracking-widest mb-1">KI Formation Suggestion</div>
                    <div className="text-neon text-xl font-bold tracking-widest">{selectedPlaybook.formation}</div>
                 </div>
              </div>

              {/* Tactical Notes / Chat Summary */}
              <div className="bg-white/5 border-l-4 border-redbull p-6 rounded-2xl flex flex-col gap-3">
                 <div className="flex items-center gap-2 text-redbull font-black uppercase tracking-widest text-xs mb-2">
                    <Icon name="shield-alert" size={16} /> KI Matchup & Taktik-Briefing
                 </div>
                 <p className="text-white/90 leading-relaxed font-medium">
                   {selectedPlaybook.notes}
                 </p>
              </div>

              {/* Tactical Graphic (Print SVG) */}
              <div className="mt-4 bg-[#050914] border-2 border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                 <div className="text-neon font-black uppercase tracking-widest text-xs mb-6 flex items-center gap-2">
                    <Icon name="map" size={16} /> Taktisches Positions-Board
                 </div>
                 
                 <div className="relative w-full aspect-[1050/680] max-h-[400px] mx-auto bg-[#02040a] border-4 border-white/20 rounded-lg overflow-hidden">
                    <svg viewBox="-50 -30 1150 740" className="w-full h-full opacity-90 drop-shadow-xl" preserveAspectRatio="xMidYMid meet">
                      {/* Grid Pattern */}
                      <defs>
                        <pattern id="grid" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
                          <rect width="50" height="50" fill="none" stroke="#ffffff" strokeOpacity="0.05" strokeWidth="1" />
                        </pattern>
                      </defs>
                      <rect x="-50" y="-30" width="1150" height="740" fill="url(#grid)" />
                      
                      {/* Pitch Outline */}
                      <rect x="0" y="0" width="1050" height="680" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="4" />
                      
                      {/* Halfway Line */}
                      <line x1="525" y1="0" x2="525" y2="680" stroke="rgba(255,255,255,0.3)" strokeWidth="4" />
                      
                      {/* Center Circle */}
                      <circle cx="525" cy="340" r="91.5" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="4" />
                      <circle cx="525" cy="340" r="4" fill="rgba(255,255,255,0.5)" />
                      
                      {/* Penalty Boxes */}
                      <rect x="0" y="138.5" width="165" height="403" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="4" />
                      <rect x="885" y="138.5" width="165" height="403" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="4" />
                      
                      {/* Goal Areas */}
                      <rect x="0" y="248.5" width="55" height="183" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="4" />
                      <rect x="995" y="248.5" width="55" height="183" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="4" />

                      {/* Render Saved Players */}
                      {selectedPlaybook.players && selectedPlaybook.players.map(p => {
                         if (!p.x || !p.y) return null;
                         return (
                           <g key={p.id} transform={`translate(${p.x}, ${p.y})`}>
                              <circle r="16" fill="#1a2542" stroke="#00f3ff" strokeWidth="2" className="drop-shadow-[0_0_10px_rgba(0,243,255,0.5)]" />
                              <text y="4" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="900" style={{ pointerEvents: "none" }}>{p.position}</text>
                              <text y="28" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="900" className="uppercase tracking-widest bg-black/50 px-1 rounded-sm" style={{ pointerEvents: "none" }}>{p.name.split(" ").pop()}</text>
                           </g>
                         );
                      })}
                    </svg>
                 </div>
              </div>

              {/* Roster / Setup list */}
              <div className="mt-2">
                 <div className="text-white font-black uppercase tracking-widest text-sm mb-4 flex items-center gap-2 bg-white/5 p-3 rounded-lg border border-white/10">
                    <Icon name="users" size={16} className="text-neon" /> Abgespeicherter Player-Pool
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                   {selectedPlaybook.players && selectedPlaybook.players.length > 0 ? (
                     selectedPlaybook.players.map(p => (
                       <div key={p.id} className="bg-[#02040a] border border-white/5 p-3 rounded-lg flex justify-between items-center shadow-md">
                          <span className="text-white/90 font-bold text-xs truncate">{p.name}</span>
                          <span className="text-neon font-black bg-neon/10 px-2 py-1 rounded text-[10px] uppercase border border-neon/20">{p.position}</span>
                       </div>
                     ))
                   ) : (
                     <div className="col-span-3 text-white/40 italic p-4 bg-black/20 rounded-xl text-center border border-white/5">
                       Keine Positionskoordinaten für dieses Playbook gespeichert (Legacy Blueprint).
                     </div>
                   )}
                 </div>
              </div>

           </div>
         )}
      </div>

    </div>
  );
};

export default CalendarHub;
