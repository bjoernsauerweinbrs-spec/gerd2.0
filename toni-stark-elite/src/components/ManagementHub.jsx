import React, { useState } from 'react';
import Icon from './Icon';

// ============================================
// EXECUTIVE BOARD (MANAGER & ADMIN VIEW)
// ============================================
const ExecutiveBoard = ({ truthObject, setActiveTab }) => {
  const [isBriefingLoading, setIsBriefingLoading] = useState(false);
  const [morningCallBriefing, setMorningCallBriefing] = useState("");

  const players = truthObject?.players && truthObject.players.length > 0 
      ? truthObject.players.slice(0, 3) 
      : [
          { id: 99, name: "Lukas Berg (C)", readiness: 94 },
          { id: 1, name: "Muster-TW", readiness: 95 },
          { id: 2, name: "Muster-IV 1", readiness: 90 },
        ];
        
  const totalPlayersInt = truthObject?.players?.length || 16;
  const remainingPlayers = Math.max(0, totalPlayersInt - players.length);
  
  const avgReadiness = 83.6;
  const budgetVal = truthObject?.financials?.current_budget ? (truthObject.financials.current_budget / 1000000).toFixed(2) : "25.00";
  const lastTactic = "STANDARD-MODUS (ARCHIV LEER)";
  const targetOfDay = { name: "M. TARGETA" };
  const nlzHighlight = { name: "WUNDERKIND" };

  const handleMorningCall = async () => {
    setIsBriefingLoading(true);
    setTimeout(() => {
      setMorningCallBriefing("Neural link stabil. Team-Readiness bei 83.6%. Fokus heute auf taktische Disziplin und Regeneration. CFO Budget freigegeben.");
      setIsBriefingLoading(false);
    }, 1500);
  };

  return (
    <div className="space-y-10 animate-fade-in p-4 md:p-0">
      {/* ... [Existing Executive Board Layout] ... */}
      <div className="relative overflow-hidden rounded-3xl group">
        <div className="absolute inset-0 bg-gradient-to-r from-navy via-[#0a0a0a] to-navy opacity-90"></div>
        <div className="absolute inset-0 carbon-fiber opacity-30"></div>

        <div className="relative z-10 p-10 flex flex-col md:flex-row items-center justify-between gap-8 border border-white/10 shadow-2xl">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 text-neon">
              <Icon name="radio" size={18} className="animate-pulse" />
              <span className="font-mono text-[10px] uppercase tracking-[0.4em] font-black">
                AI Executive Morning Call
              </span>
            </div>
            <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter mb-4">
              Guten Morgen, <span className="text-neon">Commander</span>
            </h2>
            <div className="min-h-[60px] max-w-2xl text-white/60 font-mono text-xs leading-relaxed italic border-l-2 border-white/5 pl-6 py-2">
              {morningCallBriefing || "Starte den Morning Call für die strategische Tagesübersicht."}
            </div>
          </div>

          <button
            onClick={handleMorningCall}
            disabled={isBriefingLoading}
            className="group/btn relative px-8 py-5 bg-neon rounded-sm font-black uppercase text-[10px] tracking-[0.3em] text-navy transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(0,243,255,0.4)] disabled:opacity-50 flex items-center"
          >
            <Icon
              name={isBriefingLoading ? "loader" : "headphones"}
              size={20}
              className={isBriefingLoading ? "animate-spin" : ""}
            />
            <span className="ml-3">
              {isBriefingLoading ? "Computing..." : "Listen to Briefing"}
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass-panel p-8 rounded-2xl border-l-4 border-neon hover:translate-y-[-5px] transition-transform">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 bg-neon/10 rounded-xl flex items-center justify-center text-neon">
              <Icon name="shield" size={24} />
            </div>
            <div className="text-right">
              <div className="font-mono text-[9px] text-white/40 uppercase">Readiness</div>
              <div className="text-2xl font-black text-white italic">{avgReadiness}%</div>
            </div>
          </div>
          <h3 className="font-black text-xs text-white uppercase tracking-widest mb-1">Sporting Core</h3>
          <p className="text-[10px] text-white/40 font-mono mb-4 italic">Kollektive Belastungssteuerung</p>
          <div className="flex flex-col gap-2 bg-black/40 p-3 rounded-lg border border-white/5">
            {players.map(p => (
              <div key={p.id} className="flex items-center justify-between text-[10px]">
                <span className="font-bold text-white/80">{p.name}</span>
                <span className="text-neon">{p.readiness || Math.floor(Math.random() * 20 + 80)}%</span>
              </div>
            ))}
            <div className="text-[8px] text-center text-white/20 uppercase tracking-widest mt-1">+{remainingPlayers} weitere Spieler</div>
          </div>
        </div>

        <div className="glass-panel p-8 rounded-2xl border-l-4 border-gold hover:translate-y-[-5px] transition-transform">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center text-gold">
              <Icon name="pie-chart" size={24} />
            </div>
            <div className="text-right">
              <div className="font-mono text-[9px] text-white/40 uppercase">Liquidity</div>
              <div className="text-2xl font-black text-white italic">€ {budgetVal}M</div>
            </div>
          </div>
          <h3 className="font-black text-xs text-white uppercase tracking-widest mb-1">Financial Power</h3>
          <p className="text-[10px] text-white/40 font-mono mb-4 italic">Operatives Budget</p>
          <div className="bg-black/40 p-4 rounded-lg border border-white/5">
            <div className="text-[9px] text-white/30 uppercase mb-1">Last Deployment</div>
            <div className="text-xs font-bold text-neon uppercase truncate">{lastTactic}</div>
          </div>
        </div>

        <div className="glass-panel p-8 rounded-2xl border-l-4 border-redbull hover:translate-y-[-5px] transition-transform">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 bg-redbull/10 rounded-xl flex items-center justify-center text-redbull">
              <Icon name="target" size={24} />
            </div>
            <div className="text-right">
              <div className="font-mono text-[9px] text-white/40 uppercase">Targets</div>
              <div className="text-2xl font-black text-white italic">Active</div>
            </div>
          </div>
          <h3 className="font-black text-xs text-white uppercase tracking-widest mb-1">Strategy & Intel</h3>
          <p className="text-[10px] text-white/40 font-mono mb-4 italic">Markt- & Talent-Analyse</p>
          <div className="space-y-3">
            <div className="flex items-center gap-3 bg-white/5 p-2 rounded border border-white/5">
              <div className="w-2 h-2 rounded-full bg-redbull animate-pulse"></div>
              <div className="flex-1">
                <div className="text-[8px] text-white/30 uppercase">Target of the Day</div>
                <div className="text-[10px] font-bold text-white uppercase">{targetOfDay.name}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/5 p-2 rounded border border-white/5">
              <div className="w-2 h-2 rounded-full bg-neon"></div>
              <div className="flex-1">
                <div className="text-[8px] text-white/30 uppercase">NLZ Highlight</div>
                <div className="text-[10px] font-bold text-white uppercase">{nlzHighlight.name}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <button onClick={() => setActiveTab && setActiveTab("tactical")} className="group relative overflow-hidden p-8 rounded-2xl border border-white/10 glass-panel hover:border-neon transition-all text-left">
          <div className="absolute top-0 right-0 w-32 h-32 bg-neon/10 rounded-full blur-3xl -translate-y-16 translate-x-16 group-hover:bg-neon/20 transition-all"></div>
          <Icon name="shield" size={32} className="text-neon mb-4 group-hover:scale-110 transition-transform" />
          <div className="font-black text-xs text-white uppercase tracking-widest mb-2">Go to Match Prep</div>
          <div className="text-[10px] text-white/30 font-mono italic">Tactical Deployment & Squad Control</div>
        </button>

        <button onClick={() => setActiveTab && setActiveTab("cfo")} className="group relative overflow-hidden p-8 rounded-2xl border border-white/10 glass-panel hover:border-gold transition-all text-left">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full blur-3xl -translate-y-16 translate-x-16 group-hover:bg-gold/20 transition-all"></div>
          <Icon name="file-text" size={32} className="text-gold mb-4 group-hover:scale-110 transition-transform" />
          <div className="font-black text-xs text-white uppercase tracking-widest mb-2">Review Contracts</div>
          <div className="text-[10px] text-white/30 font-mono italic">Legal Audit & Financial Security</div>
        </button>

        <button onClick={() => setActiveTab && setActiveTab("nlz")} className="group relative overflow-hidden p-8 rounded-2xl border border-white/10 glass-panel hover:border-neon transition-all text-left">
          <div className="absolute top-0 right-0 w-32 h-32 bg-neon/10 rounded-full blur-3xl -translate-y-16 translate-x-16 group-hover:bg-neon/20 transition-all"></div>
          <Icon name="layout-grid" size={32} className="text-neon mb-4 group-hover:scale-110 transition-transform" />
          <div className="font-black text-xs text-white uppercase tracking-widest mb-2">NLZ Performance Hub</div>
          <div className="text-[10px] text-white/30 font-mono italic">Youth Academy DNA & Growth Tracking</div>
        </button>
      </div>
    </div>
  );
};

// ============================================
// TRAINER OFFICE (TRAINER VIEW)
// ============================================
const TrainerOffice = ({ truthObject, setActiveTab }) => {
  const clubName = truthObject?.club_info?.name || "Unbekannter Verein";
  const players = truthObject?.players && truthObject.players.length > 0 ? truthObject.players.slice(0, 3) : [];
  const totalPlayersInt = truthObject?.players?.length || 0;
  const remainingPlayers = Math.max(0, totalPlayersInt - players.length);
  const avgReadiness = 89.2;

  // Build the dynamic Infobox activity log
  const systemLogs = [
    { time: "08:15", type: "system", text: "GERD System hochgefahren. Module aktiv." },
    { time: "08:18", type: "action", text: `Internet-Scraping abgeschlossen: ${clubName} synchronisiert.` },
    { time: "08:18", type: "success", text: `${totalPlayersInt} Spieler in den Mannschaftskader importiert.` },
  ];

  if (truthObject?.matchday_roster) {
    systemLogs.push({ time: "09:30", type: "action", text: `Spieltags-Kader (Startelf & Bank) offiziell benannt.` });
  }

  // Incoming Requests logic
  const matchdayRosterMissing = !truthObject?.matchday_roster;
  const interviewMissing = !truthObject?.latest_interview && truthObject?.matchday_roster;

  return (
    <div className="space-y-6 animate-fade-in p-4 md:p-0 pb-24">
      
      {/* HEADER BANNER */}
      <div className="flex items-center justify-between gap-3 bg-black/40 p-8 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-neon/10 to-transparent"></div>
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-neon/10 border border-neon/30 flex items-center justify-center">
            <Icon name="briefcase" size={32} className="text-neon" />
          </div>
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Trainer-Büro</h2>
            <p className="text-xs text-neon uppercase tracking-[0.2em] font-mono">Operationszentrum & Posteingang</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* KOLUMNE 1: INFOBOX / SYSTEM LOG */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/10">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
            <Icon name="terminal" size={20} className="text-white/60" />
            <h3 className="font-black text-sm text-white uppercase tracking-widest">Aktivitäten & System-Log (Infobox)</h3>
          </div>
          
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {systemLogs.map((log, idx) => (
              <div key={idx} className="flex items-start gap-4 p-4 rounded-xl bg-black/40 border border-white/5">
                <div className="mt-0.5 text-[10px] text-white/40 font-mono shrink-0 select-none">
                  [{log.time}]
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${
                    log.type === 'success' ? 'text-green-400' : 
                    log.type === 'system' ? 'text-white/60' : 'text-neon'
                  }`}>
                    {log.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* KOLUMNE 2: ANFRAGEN & SPORTING CORE */}
        <div className="space-y-6">
            {/* ZULAUFENDE ANFRAGEN */}
            <div className="glass-panel p-6 rounded-2xl border-l-4 border-redbull shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <Icon name="inbox" size={20} className="text-redbull" />
                <h3 className="font-black text-sm text-white uppercase tracking-widest">Inbox & Pendenzen</h3>
              </div>

              <div className="space-y-3">
                 {matchdayRosterMissing && (
                   <div className="p-3 bg-redbull/10 border border-redbull/20 rounded-lg flex items-start gap-3">
                      <Icon name="alert-circle" size={16} className="text-redbull mt-0.5" />
                      <div>
                        <div className="text-[10px] font-black text-redbull uppercase tracking-widest mb-1">Spielbetrieb</div>
                        <div className="text-xs text-white/80">Kader für den nächsten Spieltag muss noch nominiert werden.</div>
                      </div>
                   </div>
                 )}
                 {interviewMissing && (
                   <div className="p-3 bg-gold/10 border border-gold/20 rounded-lg flex items-start gap-3">
                      <Icon name="mic" size={16} className="text-gold mt-0.5" />
                      <div>
                        <div className="text-[10px] font-black text-gold uppercase tracking-widest mb-1">Presseabteilung</div>
                        <div className="text-xs text-white/80">Die Presse fordert ein Interview zu deiner Kadernominierung an.</div>
                      </div>
                   </div>
                 )}
                 {!matchdayRosterMissing && !interviewMissing && (
                   <div className="text-center p-6 text-white/40 text-xs font-mono border border-dashed border-white/10 rounded-lg">
                     Aktuell keine offenen Systemanfragen.
                   </div>
                 )}
              </div>
            </div>

            {/* SPORTING CORE (MINI) */}
            <div className="glass-panel p-6 rounded-2xl border-l-4 border-neon shadow-xl">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-black text-sm text-white uppercase tracking-widest">Tagesform</h3>
                <div className="text-xl font-black text-white italic">{avgReadiness}%</div>
              </div>
              <div className="flex flex-col gap-2 bg-black/40 p-3 rounded-lg border border-white/5">
                {players.map(p => (
                  <div key={p.id} className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-white/80 truncate max-w-[120px]">{p.name}</span>
                    <span className="text-neon">{p.readiness || Math.floor(Math.random() * 20 + 80)}%</span>
                  </div>
                ))}
                {remainingPlayers > 0 && (
                  <div className="text-[8px] text-center text-white/20 uppercase tracking-widest mt-1">+{remainingPlayers} weitere Spieler</div>
                )}
              </div>
            </div>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 pt-4">
        <button onClick={() => setActiveTab && setActiveTab("roster")} className="p-6 rounded-2xl bg-black/40 border border-white/10 hover:border-gold hover:bg-gold/5 transition-all text-center group">
          <Icon name="users" size={24} className="text-gold mx-auto mb-3 group-hover:scale-110 transition-transform" />
          <div className="font-black text-xs text-white uppercase tracking-widest">Kader Ansehen</div>
        </button>
        <button onClick={() => setActiveTab && setActiveTab("tactical")} className="p-6 rounded-2xl bg-black/40 border border-white/10 hover:border-neon hover:bg-neon/5 transition-all text-center group">
          <Icon name="shield" size={24} className="text-neon mx-auto mb-3 group-hover:scale-110 transition-transform" />
          <div className="font-black text-xs text-white uppercase tracking-widest">Zur Taktiktafel</div>
        </button>
        <button onClick={() => setActiveTab && setActiveTab("training_lab")} className="p-6 rounded-2xl bg-black/40 border border-white/10 hover:border-redbull hover:bg-redbull/5 transition-all text-center group">
          <Icon name="activity" size={24} className="text-redbull mx-auto mb-3 group-hover:scale-110 transition-transform" />
          <div className="font-black text-xs text-white uppercase tracking-widest">Trainingsplan</div>
        </button>
      </div>

    </div>
  );
};

// ============================================
// MAIN HUB SWITCHER
// ============================================
const ManagementHub = ({ truthObject, setActiveTab, activeRole }) => {
  if (activeRole === 'Trainer') {
    return <TrainerOffice truthObject={truthObject} setActiveTab={setActiveTab} />;
  }
  return <ExecutiveBoard truthObject={truthObject} setActiveTab={setActiveTab} />;
};

export default ManagementHub;
