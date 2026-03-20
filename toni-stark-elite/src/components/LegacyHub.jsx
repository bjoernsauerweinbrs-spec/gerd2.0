import React, { useState, useRef } from 'react';
import Icon from './Icon';

// Mock Identity Data migrated from monolith
const MOCK_IDENTITY = {
  dedication: {
    text: "Einer, der die Magie des Fußballs nicht nur verstanden, sondern gelebt hat. Sein Blick für das Besondere und sein unerschütterlicher Wille leben in jeder Zeile dieses Codes weiter.",
    date_of_death: "24.11.2024"
  },
  project: {
    name: "GERD 2.0",
    vision: "Die Verschmelzung von menschlicher Intuition und künstlicher Intelligenz. Ein System, das nicht nur analysiert, sondern die Seele des Spiels begreift."
  },
  modules: [
    { id: "mod_tac", name: "Tactical Hub", description: "Live OVR Berechnung & KI Playbook", icon: "activity" },
    { id: "mod_med", name: "Medical Lab", description: "Telemetry & Player Resilience", icon: "heart-pulse" },
    { id: "mod_cfo", name: "CFO Cockpit", description: "Zero-Base-Budgeting & Sourcing", icon: "briefcase" },
    { id: "mod_nlz", name: "NLZ Academy", description: "Talent Scouting & Matchbook", icon: "graduation-cap" }
  ]
};

const LegacyHub = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const identityData = MOCK_IDENTITY;

  return (
    <div className={`animate-fade-in min-h-[100vh] relative font-sans text-white overflow-hidden pb-40 transition-all duration-1000 ${isPlaying ? 'bg-black/90' : 'bg-black'}`}>
      
      {/* Golden Hour Overlay */}
      <div className={`absolute inset-0 z-0 pointer-events-none transition-opacity duration-1000 ${isPlaying ? 'opacity-100 backdrop-blur-md' : 'opacity-0'}`}>
         <div className="absolute inset-0 bg-gradient-to-t from-gold/30 via-gold/5 to-transparent mix-blend-overlay"></div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto pt-16 px-6 lg:px-12 flex flex-col items-center">
        <header className="w-full text-center border-b border-[#004B91]/50 pb-8 mb-16 relative">
          <div className="absolute left-1/2 -top-4 -translate-x-1/2 w-48 h-1 bg-[#004B91] shadow-[0_0_20px_#004B91]"></div>
          <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase text-white drop-shadow-[0_0_15px_rgba(0,243,255,0.6)]">
            {identityData.project.name} <span className="text-[#004B91] block md:inline md:ml-4 text-2xl md:text-5xl border-l-0 md:border-l-2 border-[#004B91]/50 pl-0 md:pl-4 mt-2 md:mt-0 font-mono tracking-widest">- The Legacy AI Command Center</span>
          </h1>
        </header>

        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-navy/40 backdrop-blur-md border border-[#004B91]/30 p-6 rounded-xl shadow-[0_0_30px_rgba(0,18,64,0.8)] relative overflow-hidden group hover:border-neon transition-colors">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#004B91]"></div>
              <h2 className="flex items-center gap-3 text-gold text-xl font-black uppercase tracking-widest mb-4">
                <Icon name="dove" size={20} className="text-gold" /> Widmung
              </h2>
              <div className="w-8 h-px bg-gold/50 mb-4"></div>
              <p className="text-white/80 font-serif leading-relaxed italic text-sm md:text-base">
                {identityData.dedication.text}
              </p>
              <div className="mt-4 text-[10px] text-white/40 font-mono uppercase tracking-widest">
                Status: Foundation Active | {identityData.dedication.date_of_death}
              </div>
            </div>

            <div className="bg-navy/40 backdrop-blur-md border border-[#004B91]/30 p-6 rounded-xl shadow-[0_0_30px_rgba(0,18,64,0.8)] relative overflow-hidden group hover:border-neon transition-colors">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#004B91]"></div>
              <h2 className="flex items-center gap-3 text-neon text-xl font-black uppercase tracking-widest mb-4">
                <Icon name="rocket" size={20} className="text-neon" /> Vision
              </h2>
              <div className="w-8 h-px bg-neon/50 mb-4"></div>
              <p className="text-white/80 font-serif leading-relaxed italic text-sm md:text-base">
                {identityData.project.vision}
              </p>
            </div>
          </div>

          <div className="lg:col-span-4 flex justify-center relative">
            <div className="relative w-72 h-96 sm:w-80 sm:h-[420px] rounded-2xl p-1 bg-gradient-to-b from-[#004B91] via-navy to-black shadow-[0_0_80px_rgba(0,75,145,0.4)] animate-pulse">
              <div className="absolute inset-0 bg-[#004B91]/20 blur-xl rounded-2xl"></div>
              <div className="w-full h-full bg-black/50 rounded-2xl overflow-hidden relative border border-white/10 backdrop-blur-3xl flex items-center justify-center">
                <img src="/image_0.png" alt="Gerd Sauerwein" onError={(e) => { e.target.onerror = null; }} className="w-full h-full object-cover object-center opacity-90 transition-all duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent mix-blend-overlay"></div>
                
                <div className="absolute bottom-4 left-0 w-full text-center z-20">
                  <span className="bg-black/80 text-[#004B91] font-mono text-[10px] uppercase tracking-[0.4em] px-4 py-1 border border-[#004B91]/30 rounded-full">Foundation Node Active</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <div className="bg-navy/40 backdrop-blur-md border border-white/10 p-6 rounded-xl shadow-[0_0_30px_rgba(0,18,64,0.8)] relative overflow-hidden group hover:border-[#004B91] transition-colors">
              <div className="absolute top-0 right-0 w-1 h-full bg-[#004B91]"></div>
              <h2 className="flex items-center gap-3 text-[#004B91] text-xl font-black uppercase tracking-widest mb-4">
                <Icon name="grid" size={20} className="text-[#004B91]" /> Modul-Matrix
              </h2>
              <div className="w-8 h-px bg-[#004B91]/50 mb-4"></div>
              <div className="grid grid-cols-2 gap-3">
                {identityData.modules.map(mod => (
                  <div key={mod.id} className="p-3 bg-black/40 border border-white/5 rounded-lg hover:border-[#004B91]/50 transition-all group/mod">
                    <Icon name={mod.icon} size={18} className="text-[#004B91] mb-2 group-hover/mod:scale-110 transition-transform" />
                    <div className="text-[10px] font-black uppercase tracking-tighter text-white mb-1">{mod.name}</div>
                    <div className="text-[8px] text-white/40 leading-tight line-clamp-2">{mod.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Personal Message */}
        <div className="w-full max-w-4xl mx-auto mt-24 mb-12">
           <div className={`bg-navy/40 backdrop-blur-md border p-8 md:p-12 rounded-xl relative overflow-hidden transition-all duration-1000 ${isPlaying ? 'shadow-[0_0_60px_rgba(212,175,55,0.4)] border-gold animate-pulse' : 'shadow-[0_0_50px_rgba(212,175,55,0.15)] border-gold/30'}`}>
              <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
                 <Icon name="heart" size={120} className="text-gold -mt-10 -mr-10" />
              </div>
              <div className="flex items-center gap-3 mb-6">
                 <Icon name="heart" size={24} className="text-gold" />
                 <h3 className="text-xl md:text-2xl font-black uppercase text-gold tracking-widest">Ein persönliches Danke</h3>
              </div>
              <div className="space-y-6 text-white/80 font-serif text-lg md:text-xl leading-relaxed relative z-10">
                 <p>„Gerd, du warst für mich weit mehr als nur ein Vater. Du warst mein Zuhause, mein Kompass und mein bester Freund. Wir sind zusammen durch alle Höhen und Tiefen des Lebens gegangen – Wand an Wand, im selben Haus, ein Leben lang vereint.</p>
                 <p>Als Vater und Sohn, als Nachbarn und als Freunde haben wir eine Einheit gebildet, die durch nichts zu erschüttern war. Du hast mir gezeigt, was es heißt, für eine Sache zu brennen und für die Menschen einzustehen, die man liebt.</p>
                 <p>Ich danke dir von ganzem Herzen für alles, was du für mich und für unseren gemeinsamen Traum getan hast. Es vergeht kein Tag, an dem ich dich nicht vermisse. Dieses System, Gerd 2.0, ist mein Versprechen an dich, dass dein Geist und deine Werte niemals in Vergessenheit geraten.“</p>
              </div>
              <div className="mt-8 pt-6 border-t border-gold/20 text-right relative z-10">
                 <p className="text-gold font-black uppercase tracking-widest text-sm mb-2">In ewiger Dankbarkeit,</p>
                 <p className="text-white font-serif italic text-2xl lg:text-3xl">Dein Sohn Björn</p>
              </div>

               {/* High-End Gold Audio Player */}
               <div className="mt-12 bg-black/60 border border-gold/40 rounded-2xl p-6 shadow-[0_0_30px_rgba(212,175,55,0.2)] flex flex-col md:flex-row items-center gap-6 relative z-10 backdrop-blur-xl group hover:border-gold transition-colors">
                 <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/50 flex items-center justify-center shrink-0 cursor-pointer hover:scale-105 transition-transform shadow-[0_0_15px_rgba(212,175,55,0.4)]" onClick={togglePlay}>
                   <Icon name={isPlaying ? "pause" : "play"} size={28} className="text-gold ml-1" />
                 </div>
                 <div className="flex-1 w-full">
                   <div className="flex justify-between items-end mb-2">
                     <div>
                       <div className="text-[10px] font-black uppercase tracking-[0.3em] text-gold/80 mb-1">Gerd Sauerwein Memorial</div>
                       <div className="text-lg text-white font-serif italic">The Orchestral Tribute</div>
                     </div>
                     <div className="text-xs font-mono text-gold/60">{isPlaying ? "PLAYING" : "PAUSED"}</div>
                   </div>
                   
                   {/* Waveform Animation */}
                   <div className="h-10 flex items-end gap-1 w-full overflow-hidden opacity-80">
                      {[...Array(40)].map((_, i) => (
                        <div 
                          key={i} 
                          className={`w-full bg-gold/70 rounded-t-sm transition-all duration-150 ${isPlaying ? 'animate-pulse' : ''}`}
                          style={{
                            height: isPlaying ? `${Math.floor(Math.random() * 80 + 20)}%` : '20%',
                            animationDelay: `${Math.random() * 0.5}s`
                          }}
                        ></div>
                      ))}
                   </div>
                 </div>
                 {/* Local audio file from the user's directory */}
                 <audio ref={audioRef} src="/Papa.mp3.mp3" onEnded={() => setIsPlaying(false)} className="hidden" />
               </div>

           </div>
        </div>

      </div>
    </div>
  );
};

export default LegacyHub;
