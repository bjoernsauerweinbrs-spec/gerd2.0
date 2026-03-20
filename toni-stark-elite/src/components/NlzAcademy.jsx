import React, { useState } from 'react';
import Icon from './Icon';
import TacticalHub from './TacticalHub';

const NlzAcademy = ({ truthObject }) => {
  const [activeNlzView, setActiveNlzView] = useState("finance");
  
  // Mock data for initial Vite porting
  const [youthPlayers, setYouthPlayers] = useState([
    { id: '1', name: 'WUNDERKIND', position: 'ZOM', group: 'u19', pac: 85, dri: 92, sho: 78, def: 40, pas: 88, phy: 65, pot: 95, focus: 8, frustration: 2 },
    { id: '2', name: 'TORMINATOR', position: 'ST', group: 'u17', pac: 90, dri: 80, sho: 85, def: 30, pas: 70, phy: 80, pot: 89, focus: 6, frustration: 4 },
    { id: '3', name: 'FELS', position: 'IV', group: 'u19', pac: 70, dri: 50, sho: 40, def: 88, pas: 65, phy: 90, pot: 86, focus: 9, frustration: 1 }
  ]);

  const [nlzPlayerPositions, setNlzPlayerPositions] = useState({});
  const [activeDossierPlayerId, setActiveDossierPlayerId] = useState(null);
  const [pedagogicalTip, setPedagogicalTip] = useState("");
  const [isFetchingTip, setIsFetchingTip] = useState(false);
  const [developmentReport, setDevelopmentReport] = useState("");
  const [isDevLoading, setIsDevLoading] = useState(false);
  const [isAutoFillingYouth, setIsAutoFillingYouth] = useState(false);

  const clubIdentity = truthObject?.club_identity || { name: "Stark Elite" };

  const handleAutoFillYouthSquad = () => {
    setIsAutoFillingYouth(true);
    setTimeout(() => {
      setYouthPlayers([
        ...youthPlayers,
        { id: `new_${Date.now()}`, name: 'NEUZUGANG', position: 'ZDM', group: 'u19', pac: 75, dri: 72, sho: 68, def: 85, pas: 80, phy: 82, pot: 88, focus: 8, frustration: 3 }
      ]);
      setIsAutoFillingYouth(false);
    }, 1500);
  };

  return (
    <div className="w-full">
      <div className="space-y-8 animate-fade-in pb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-8 rounded-2xl border border-gray-200 shadow-[0_10px_40px_rgba(0,0,0,0.1)] relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-[0.03] pointer-events-none">
            <Icon name="activity" size={240} className="text-navy" />
          </div>
          <div className="relative z-10">
            <h2 className="text-4xl font-black tracking-tighter text-navy flex items-center gap-4 uppercase mb-2">
              <Icon name="plus-square" size={32} className="text-neon" />{" "}
              Fuchs NLZ Hub
            </h2>
            <div className="text-[10px] font-mono text-gray-500 tracking-[0.4em] uppercase font-black">
              Elite Youth Academy | Psycho & Biomechanics Center
            </div>
          </div>
          <div className="mt-6 md:mt-0 flex flex-wrap gap-4 bg-gray-100 p-2 rounded-xl border border-gray-200">
            <button
              onClick={() => setActiveNlzView("finance")}
              className={`px-4 py-3 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 ${activeNlzView === "finance" ? "bg-white text-navy border-gray-200 shadow-md" : "bg-transparent text-gray-400 hover:text-navy"}`}
            >
              <Icon name="pie-chart" size={16} className={activeNlzView === "finance" ? "text-gold" : ""} /> Finance & Admin
            </button>
            <button
              onClick={() => setActiveNlzView("character")}
              className={`px-4 py-3 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 ${activeNlzView === "character" ? "bg-white text-navy border-gray-200 shadow-md" : "bg-transparent text-gray-400 hover:text-navy"}`}
            >
              <Icon name="user" size={16} className={activeNlzView === "character" ? "text-neon" : ""} /> Character Matrix
            </button>
            <button
              onClick={() => setActiveNlzView("biomechanics")}
              className={`px-4 py-3 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 ${activeNlzView === "biomechanics" ? "bg-white text-navy border-gray-200 shadow-md" : "bg-transparent text-gray-400 hover:text-navy"}`}
            >
              <Icon name="activity" size={16} className={activeNlzView === "biomechanics" ? "text-redbull" : ""} /> Biomechanik
            </button>
            <button
              onClick={() => setActiveNlzView("squad")}
              className={`px-4 py-3 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 ${activeNlzView === "squad" ? "bg-white text-navy border-gray-200 shadow-md" : "bg-transparent text-gray-400 hover:text-navy"}`}
            >
              <Icon name="users" size={16} className={activeNlzView === "squad" ? "text-redbull" : ""} /> Youth Squad
            </button>
            <button
              onClick={() => setActiveNlzView("training")}
              className={`px-4 py-3 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 ${activeNlzView === "training" ? "bg-white text-navy border-gray-200 shadow-md" : "bg-transparent text-gray-400 hover:text-navy"}`}
            >
              <Icon name="cpu" size={16} className={activeNlzView === "training" ? "text-neon" : ""} /> Training Protocol
            </button>
            <button
              onClick={() => setActiveNlzView("board")}
              className={`px-4 py-3 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 ${activeNlzView === "board" ? "bg-white text-navy border-gray-200 shadow-md" : "bg-transparent text-gray-400 hover:text-navy"}`}
            >
              <Icon name="layout" size={16} className={activeNlzView === "board" ? "text-neon" : ""} /> Taktik Board
            </button>
          </div>
        </div>

        {/* Dynamic Views */}
        
        {/* === FINANCE & ADMIN === */}
        {activeNlzView === "finance" && (() => {
          const nlzCount = youthPlayers.length;
          const finances = clubIdentity.nlz_hub?.finances || { monthly_fee_per_player: 150, equipment_budget: 15000, travel_costs: 5000, materials: 3000 };
          const monthlyRevenue = nlzCount * finances.monthly_fee_per_player;
          const annualRevenue = monthlyRevenue * 12;
          const totalExpenses = finances.equipment_budget + finances.travel_costs + finances.materials;
          const netBalance = annualRevenue - totalExpenses;

          return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-bl-[100px] pointer-events-none"></div>
                  <h3 className="text-navy font-black uppercase text-sm tracking-widest mb-6 flex items-center gap-3">
                    <Icon name="pie-chart" className="text-gold" size={20} /> NLZ Budget Calculator
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 flex flex-col justify-center items-center text-center">
                      <div className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">Jahres-Einnahmen (Beiträge)</div>
                      <div className="text-4xl font-black text-navy leading-none">€ {annualRevenue.toLocaleString()}</div>
                      <div className="text-xs text-gray-500 mt-2 font-mono">{nlzCount} Spieler × €{finances.monthly_fee_per_player} / Monat</div>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 flex flex-col justify-center items-center text-center">
                      <div className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">Fixe Ausgaben (Jahr)</div>
                      <div className="text-4xl font-black text-redbull leading-none">€ {totalExpenses.toLocaleString()}</div>
                      <div className="text-xs text-gray-500 mt-2 font-mono">Equipment, Reisen, Material</div>
                    </div>
                  </div>

                  <div className="p-6 rounded-xl border border-gray-200 bg-white flex justify-between items-center">
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Netto-Bilanz (P.A.)</div>
                      <div className={`text-2xl font-black uppercase tracking-tighter ${netBalance >= 0 ? "text-green-600" : "text-redbull"}`}>
                        {netBalance >= 0 ? "+" : ""}€ {netBalance.toLocaleString()}
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center bg-gray-50">
                      <Icon name={netBalance >= 0 ? "trending-up" : "trending-down"} className={netBalance >= 0 ? "text-green-600" : "text-redbull"} size={20} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* === YOUTH SQUAD (FIFA CARDS) === */}
        {activeNlzView === "squad" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-black italic tracking-tighter text-navy flex items-center gap-3 uppercase">
                <Icon name="users" size={28} className="text-redbull" /> Nachwuchs Kader
              </h2>
              <button
                onClick={handleAutoFillYouthSquad}
                disabled={isAutoFillingYouth}
                className={`px-4 py-2 font-black uppercase text-[10px] rounded-lg tracking-widest flex items-center gap-2 transition-all ${isAutoFillingYouth ? "bg-gray-100 text-gray-500 cursor-not-allowed border border-gray-200" : "bg-neon text-navy shadow-[0_0_15px_rgba(0,243,255,0.4)] hover:scale-105 hover:bg-white"}`}
              >
                {isAutoFillingYouth ? <Icon name="loader" className="animate-spin" size={16} /> : <Icon name="zap" size={16} />}
                {isAutoFillingYouth ? "KI-Scouting läuft..." : "KI-Youth-Scouting"}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {youthPlayers.map((p) => {
                const ovr = Math.round((p.pac + p.sho + p.pas + p.dri + p.def + p.phy) / 6) || 60;
                const pot = p.pot || Math.min(99, ovr + 15);
                
                return (
                  <div
                    key={p.id}
                    onClick={() => setActiveDossierPlayerId(p.id)}
                    className={`group relative p-0 rounded-xl border-2 transition-all cursor-pointer overflow-hidden bg-white ${activeDossierPlayerId === p.id ? "border-gold shadow-[0_0_25px_rgba(255,215,0,0.5)] -translate-y-2" : "border-gray-200 hover:border-gold hover:shadow-[0_0_25px_rgba(255,215,0,0.3)] hover:-translate-y-1"}`}
                  >
                    <div className="flex flex-col h-[280px] uppercase font-black tracking-tighter justify-between relative z-10 p-1">
                      <div>
                        <div className="flex justify-between p-3 pb-0">
                          <div className="flex flex-col items-center">
                            <span className="text-3xl leading-none text-navy">{ovr}</span>
                            <span className="text-[10px] text-gray-500 tracking-widest mt-1">OVR</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-3xl leading-none text-gold">{pot}</span>
                            <span className="text-[10px] text-gray-500 tracking-widest mt-1">POT</span>
                          </div>
                        </div>
                        <div className="text-center mt-2">
                          <span className="px-3 py-1 bg-navy/10 text-navy rounded-full text-[9px] font-black uppercase tracking-widest">
                            {p.group.toUpperCase()} • {p.position}
                          </span>
                        </div>
                      </div>
                      
                      <div className="px-4 text-center mt-auto bg-white/50 backdrop-blur-sm mx-2 mb-2 rounded-xl border border-gray-200 pb-3 pt-2">
                          <div className="text-sm text-navy truncate font-black italic tracking-widest leading-none mb-2">
                            {p.name}
                          </div>
                          <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-2"></div>
                          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[9px] text-gray-600 font-mono">
                              <div className="flex justify-between"><span>PAC</span><span className="text-navy">{p.pac || 50}</span></div>
                              <div className="flex justify-between"><span>DRI</span><span className="text-navy">{p.dri || 50}</span></div>
                              <div className="flex justify-between"><span>SHO</span><span className="text-navy">{p.sho || 50}</span></div>
                              <div className="flex justify-between"><span>DEF</span><span className="text-navy">{p.def || 50}</span></div>
                              <div className="flex justify-between"><span>PAS</span><span className="text-navy">{p.pas || 50}</span></div>
                              <div className="flex justify-between"><span>PHY</span><span className="text-navy">{p.phy || 50}</span></div>
                          </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

              {activeDossierPlayerId && (() => {
                const p = youthPlayers.find((x) => x.id === activeDossierPlayerId);
                if (!p) return null;

                const traits = [
                  { label: "Resilienz", val: Math.min(100, (10 - p.frustration) * 10 + 20) },
                  { label: "Führung", val: p.phy > 70 ? 85 : 45 },
                  { label: "Teamgeist", val: p.pas > 65 ? 90 : 60 },
                  { label: "Fokus", val: p.focus * 10 },
                  { label: "Ehrgeiz", val: p.pac > 75 ? 95 : 70 },
                ];

                const size = 300;
                const center = size / 2;
                const radius = 100;
                const angleStep = (Math.PI * 2) / traits.length;

                const getCoordinates = (val, index) => {
                  const r = (val / 100) * radius;
                  const a = index * angleStep - Math.PI / 2;
                  return `${center + r * Math.cos(a)},${center + r * Math.sin(a)}`;
                };

                const polygonPoints = traits.map((t, i) => getCoordinates(t.val, i)).join(" ");

                const generatePedagogicalTip = () => {
                  setIsFetchingTip(true);
                  setTimeout(() => {
                    setPedagogicalTip(`Als Pädagoge empfehle ich bei ${p.name}:\n\n- Fokussiere auf kleine Etappenziele. Seine Resilienz von ${traits[0].val} benötigt stetiges, positives Feedback.\n- Nutze seinen Ehrgeiz (${traits[4].val}) für kompetitive Trainingsformen.\n\n(Generated via NLZ-Mock)`);
                    setIsFetchingTip(false);
                  }, 1500);
                };

                const handleDevCheck = () => {
                  setIsDevLoading(true);
                  setTimeout(() => {
                    setDevelopmentReport(`Profi-Gap Analyse für ${p.name}:\n\n- Physische Komponente (${p.phy}) reicht aktuell für ${p.phy > 80 ? '90' : '30'} Min im Profibereich.\n- Taktisches Verständnis (${p.position}) für das System 4-4-2 noch in Entwicklung.\n\n(Generated via NLZ-Mock)`);
                    setIsDevLoading(false);
                  }, 1500);
                };

                return (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-12 animate-fade-in pl-2 pr-2">
                    {/* LEFT: Radar Chart Dashboard */}
                    <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-neon/5 rounded-bl-[100px] pointer-events-none"></div>

                      <h3 className="text-navy font-black uppercase text-sm tracking-widest mb-8 flex items-center gap-3">
                        <Icon name="target" className="text-neon" size={20} /> Character Matrix: {p.name}
                      </h3>

                      <div className="flex justify-center items-center mb-8 relative">
                        <svg width={size} height={size} className="overflow-visible">
                          {[0.2, 0.4, 0.6, 0.8, 1].map((scale, levelIndex) => (
                            <polygon
                              key={levelIndex}
                              points={traits.map((_, i) => {
                                const r = radius * scale;
                                const a = i * angleStep - Math.PI / 2;
                                return `${center + r * Math.cos(a)},${center + r * Math.sin(a)}`;
                              }).join(" ")}
                              fill="none"
                              stroke="#e5e7eb"
                              strokeWidth="1"
                            />
                          ))}
                          {traits.map((_, i) => {
                            const a = i * angleStep - Math.PI / 2;
                            return (
                              <line
                                key={`axis-${i}`}
                                x1={center}
                                y1={center}
                                x2={center + radius * Math.cos(a)}
                                y2={center + radius * Math.sin(a)}
                                stroke="#e5e7eb"
                                strokeWidth="1"
                              />
                            );
                          })}
                          <polygon
                            points={polygonPoints}
                            fill="rgba(0, 243, 255, 0.2)"
                            stroke="#00f3ff"
                            strokeWidth="3"
                            className="drop-shadow-[0_0_10px_rgba(0,243,255,0.5)] transition-all duration-700"
                          />
                          {traits.map((t, i) => {
                            const rLabel = radius + 25;
                            const a = i * angleStep - Math.PI / 2;
                            const lx = center + rLabel * Math.cos(a);
                            const ly = center + rLabel * Math.sin(a);
                            const [cx, cy] = getCoordinates(t.val, i).split(",");
                            return (
                              <g key={`data-${i}`}>
                                <circle cx={cx} cy={cy} r="4" fill="#fff" stroke="#00f3ff" strokeWidth="2" />
                                <text x={lx} y={ly} textAnchor="middle" alignmentBaseline="middle" className="text-[9px] font-black uppercase tracking-widest fill-navy">
                                  {t.label}
                                </text>
                                <text x={lx} y={ly + 12} textAnchor="middle" alignmentBaseline="middle" className="text-[10px] font-mono fill-gray-400">
                                  {t.val}
                                </text>
                              </g>
                            );
                          })}
                        </svg>
                      </div>
                    </div>

                    {/* RIGHT: Pedagogical Advisor */}
                    <div className="flex flex-col gap-6">
                      <div className="bg-navy p-6 rounded-2xl border border-gray-800 shadow-xl flex-1 flex flex-col relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none">
                          <Icon name="cpu" size={120} className="text-neon" />
                        </div>

                        <h3 className="text-white font-black uppercase text-sm tracking-widest mb-2 flex items-center gap-3">
                          <Icon name="message-circle" className="text-neon" size={20} /> Pedagogical Advisor
                        </h3>
                        <p className="text-gray-400 text-[10px] uppercase tracking-[0.2em] mb-4">KI-Coaching Feedback System</p>

                        <div className="flex-1 min-h-[100px]">
                          {pedagogicalTip ? (
                            <div className="bg-black/30 p-4 rounded-xl border border-neon/20 animate-fade-in">
                              <div className="text-xs font-mono text-gray-300 leading-relaxed whitespace-pre-wrap">
                                {pedagogicalTip}
                              </div>
                            </div>
                          ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-50 border-2 border-dashed border-gray-700 rounded-xl p-4">
                              <Icon name="user-plus" size={24} className="text-gray-500 mb-2" />
                              <p className="text-[10px] text-gray-400 uppercase tracking-widest">Generiere Coaching-Tipps</p>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={generatePedagogicalTip}
                          disabled={isFetchingTip}
                          className="mt-4 w-full bg-neon text-navy py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-white transition-all shadow-[0_0_15px_rgba(0,243,255,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {isFetchingTip ? <Icon name="loader" size={16} className="animate-spin" /> : <Icon name="zap" size={16} />}
                          {isFetchingTip ? "Analysiere Psyche..." : "Coaching-Tipp anfordern"}
                        </button>
                      </div>

                      <div className="bg-[#050a14] p-6 rounded-2xl border border-cyan-500/20 shadow-xl relative overflow-hidden flex flex-col min-h-[220px]">
                        <div className="absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none text-cyan-400">
                          <Icon name="trending-up" size={120} />
                        </div>

                        <h3 className="text-white font-black uppercase text-sm tracking-widest mb-2 flex items-center gap-3">
                          <Icon name="shield" className="text-cyan-400" size={20} /> AI Development Coach
                        </h3>
                        
                        <div className="flex-1 mt-2">
                          {developmentReport ? (
                            <div className="bg-cyan-900/10 p-4 rounded-xl border border-cyan-500/30 animate-fade-in">
                              <div className="text-[10px] font-mono text-cyan-100/80 leading-relaxed whitespace-pre-wrap">
                                {developmentReport}
                              </div>
                            </div>
                          ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-40 border-2 border-dashed border-white/10 rounded-xl p-4">
                              <Icon name="activity" size={24} className="text-white/20 mb-2" />
                            </div>
                          )}
                        </div>

                        <button
                          onClick={handleDevCheck}
                          disabled={isDevLoading}
                          className="mt-4 w-full bg-cyan-600 hover:bg-cyan-400 text-white font-black uppercase text-[10px] tracking-widest py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(34,211,238,0.2)] flex items-center justify-center gap-2"
                        >
                          {isDevLoading ? <Icon name="loader" size={16} className="animate-spin" /> : <Icon name="crosshair" size={16} />}
                          {isDevLoading ? "Berechne Gap..." : "Profi-Check"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
        )}

        {/* === CHARACTER MATRIX === */}
        {activeNlzView === "character" && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
              {youthPlayers.map((p) => (
                <button
                  key={p.id}
                  className="shrink-0 flex items-center gap-3 p-4 rounded-xl border transition-all bg-white border-gray-200 hover:border-neon shadow-sm"
                >
                  <div className="w-10 h-10 rounded-full bg-navy flex items-center justify-center font-black text-white text-[10px] tracking-widest">
                    {p.position}
                  </div>
                  <div className="text-left">
                    <div className="font-black text-navy">{p.name}</div>
                    <div className="text-[9px] uppercase tracking-widest text-gray-400">
                      PSY-INDEX: {Math.round((p.focus * 10) + (10 - p.frustration) * 5)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* === TAKTIK BOARD === */}
        {activeNlzView === "board" && (
            <TacticalHub 
              truthObject={truthObject}
              targetPlayers={youthPlayers}
              targetPositions={nlzPlayerPositions}
              setTargetPositions={setNlzPlayerPositions}
              isNlzTheme={true}
            />
        )}

        {/* Placeholder for missing ones */}
        {["biomechanics", "pipeline", "training"].includes(activeNlzView) && (
          <div className="p-12 text-center border border-white/10 rounded-2xl bg-black/40">
            <Icon name="loader" size={32} className="animate-spin text-neon mx-auto mb-4" />
            <p className="font-mono text-neon text-sm">Under construction: {activeNlzView}</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default NlzAcademy;
