import React, { useState } from 'react';
import Icon from './Icon';

const CfoBoard = ({ truthObject }) => {
  const [activeTab, setActiveTab] = useState('search'); // search, free_agents, expiring, clauses
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for transfer market
  const mockPlayers = [
    { id: 101, name: "Florian Wirtz", position: "ZOM", age: 21, ovr: 89, pot: 94, type: "clauses", fee: "€ 120M", salary: "€ 15M", club: "Bayer 04" },
    { id: 102, name: "Jeremie Frimpong", position: "RV", age: 23, ovr: 86, pot: 89, type: "clauses", fee: "€ 40M", salary: "€ 6M", club: "Bayer 04" },
    { id: 103, name: "Kylian Mbappé", position: "ST", age: 25, ovr: 92, pot: 93, type: "free_agents", fee: "Free", salary: "€ 35M", club: "Vereinslos" },
    { id: 104, name: "Adrien Rabiot", position: "ZM", age: 28, ovr: 84, pot: 84, type: "free_agents", fee: "Free", salary: "€ 8M", club: "Vereinslos" },
    { id: 105, name: "Joshua Kimmich", position: "ZDM", age: 29, ovr: 88, pot: 88, type: "expiring", fee: "€ 40M", salary: "€ 18M", club: "FC Bayern" },
    { id: 106, name: "Leroy Sané", position: "RM", age: 28, ovr: 86, pot: 86, type: "expiring", fee: "€ 35M", salary: "€ 15M", club: "FC Bayern" },
    { id: 107, name: "Xavi Simons", position: "ZOM", age: 21, ovr: 85, pot: 92, type: "search", fee: "€ 80M", salary: "€ 8M", club: "Paris SG" },
    { id: 108, name: "Jonathan Tah", position: "IV", age: 28, ovr: 86, pot: 86, type: "expiring", fee: "€ 20M", salary: "€ 10M", club: "Bayer 04" },
  ];

  const filteredPlayers = mockPlayers.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.position.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'search') return matchesSearch;
    return p.type === activeTab && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex items-center gap-3 mb-2">
        <Icon name="globe" size={28} className="text-gold" />
        <h2 className="text-3xl font-black uppercase tracking-tighter text-white italic">Transfermarkt</h2>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('search')}
          className={`px-5 py-2.5 rounded font-black text-[10px] uppercase tracking-widest transition-all border ${activeTab === 'search' ? "bg-white text-black border-white" : "bg-black/40 text-white/40 border-white/10 hover:border-white/30"}`}
        >
          <Icon name="search" size={14} className="inline mr-2" /> Spielersuche
        </button>
        <button
          onClick={() => setActiveTab('free_agents')}
          className={`px-5 py-2.5 rounded font-black text-[10px] uppercase tracking-widest transition-all border ${activeTab === 'free_agents' ? "bg-neon text-black border-neon" : "bg-black/40 text-white/40 border-white/10 hover:border-white/30"}`}
        >
          <Icon name="user-x" size={14} className="inline mr-2" /> Vereinslose Spieler
        </button>
        <button
          onClick={() => setActiveTab('expiring')}
          className={`px-5 py-2.5 rounded font-black text-[10px] uppercase tracking-widest transition-all border ${activeTab === 'expiring' ? "bg-redbull text-white border-redbull" : "bg-black/40 text-white/40 border-white/10 hover:border-white/30"}`}
        >
          <Icon name="clock" size={14} className="inline mr-2" /> Vertragsende
        </button>
        <button
          onClick={() => setActiveTab('clauses')}
          className={`px-5 py-2.5 rounded font-black text-[10px] uppercase tracking-widest transition-all border ${activeTab === 'clauses' ? "bg-gold text-black border-gold" : "bg-black/40 text-white/40 border-white/10 hover:border-white/30"}`}
        >
          <Icon name="unlock" size={14} className="inline mr-2" /> Ausstiegsklauseln
        </button>
      </div>

      {/* Search Input */}
      {activeTab === 'search' && (
        <div className="relative w-full md:w-1/2">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Icon name="search" size={18} className="text-white/40" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Spieler oder Position suchen..."
            className="w-full bg-black/60 border border-white/20 rounded-xl py-3 pl-12 pr-4 text-white font-mono placeholder-white/30 focus:outline-none focus:border-neon focus:shadow-[0_0_15px_rgba(0,243,255,0.3)] transition-all"
          />
        </div>
      )}

      {/* Player List */}
      <div className="bg-black/40 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-widest text-white/40">
          <div className="col-span-4">Spieler</div>
          <div className="col-span-1 text-center">Alter</div>
          <div className="col-span-1 text-center">OVR</div>
          <div className="col-span-2 text-center">Verein</div>
          <div className="col-span-2 text-right">Gehalt</div>
          <div className="col-span-2 text-right">Ablöse</div>
        </div>
        
        <div className="divide-y divide-white/5">
          {filteredPlayers.length > 0 ? filteredPlayers.map(p => (
            <div key={p.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/5 transition-colors cursor-pointer group">
              <div className="col-span-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center shrink-0 group-hover:border-neon group-hover:shadow-[0_0_10px_rgba(0,243,255,0.5)] transition-all">
                  <span className="text-[10px] font-black text-white">{p.position}</span>
                </div>
                <div>
                  <div className="font-black text-white uppercase tracking-tighter text-sm">{p.name}</div>
                  <div className="text-[9px] text-white/40 uppercase tracking-widest font-bold">Pos: {p.position}</div>
                </div>
              </div>
              <div className="col-span-1 text-center text-white/80 font-mono">{p.age}</div>
              <div className="col-span-1 text-center">
                <span className="px-2 py-1 bg-white/10 rounded text-neon font-black font-mono">{p.ovr}</span>
              </div>
              <div className="col-span-2 text-center text-white/60 font-black uppercase text-[10px] tracking-widest">
                {p.club}
              </div>
              <div className="col-span-2 text-right text-gray-300 font-mono text-xs">{p.salary}</div>
              <div className="col-span-2 text-right text-gold font-black tracking-tighter text-sm">{p.fee}</div>
            </div>
          )) : (
            <div className="p-12 text-center text-white/40 font-mono text-sm border-t border-white/5">
              Keine Spieler gefunden.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CfoBoard;
