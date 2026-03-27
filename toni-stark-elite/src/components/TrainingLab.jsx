import React, { useState } from 'react';
import Icon from './Icon';
import DrillSimulator from './DrillSimulator';

const TrainingLab = ({ truthObject, setTruthObject, activeRole }) => {
  const [activeView, setActiveView] = useState("schedule"); // schedule, drills, load
  const [aiFeedback, setAiFeedback] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [promptInput, setPromptInput] = useState("");
  const [activeDrillSim, setActiveDrillSim] = useState(null);
  
  // Abfragen-Katalog State
  const [configDay, setConfigDay] = useState("Mittwoch");
  const [configFocus, setConfigFocus] = useState("Passspiel & Rondo");
  const [customFocus, setCustomFocus] = useState("");
  const [configWarmup, setConfigWarmup] = useState(true);
  const [configCooldown, setConfigCooldown] = useState(false);

  // Dynamic state for training Schedule - Now synced with truthObject
  const schedule = truthObject?.training_lab?.schedule || [];

  // Mock data for Drills
  const drills = [
    { id: 1, name: "Rondo (5v2)", focus: "Passspiel & Pressingresistenz", duration: "15 Min", color: "neon" },
    { id: 2, name: "Torabschluss unter Druck", focus: "Shooting & Entscheidungsfindung", duration: "25 Min", color: "redbull" },
    { id: 3, name: "Verschieben in der Kette", focus: "Defensivtaktik", duration: "30 Min", color: "gold" },
    { id: 4, name: "Sprint-Intervalle", focus: "Physis & Ausdauer", duration: "20 Min", color: "white" },
  ];

  const generateDailyPlan = () => {
     // Check if user chose custom focus
     const activeFocus = configFocus === "custom" ? customFocus : configFocus;

     // Build prompt from configurator if text input is empty
     const finalPrompt = promptInput.trim() ? promptInput : `Am ${configDay} machen wir ${activeFocus}${configWarmup ? ' inkl. Aufwärmspiel' : ''}${configCooldown ? ' und Auslaufen' : ''}`;
     
     setIsAnalyzing(true);
     setAiFeedback("Vektor-Scouting: Analysiere Trainings-Config durch NLP-Algorithmus...");
     
     setTimeout(() => {        const pInput = finalPrompt.toLowerCase();
        const focusQuery = activeFocus.toLowerCase();
        
        // Find target day in prompt or default to configDay
        const days = ["montag", "dienstag", "mittwoch", "donnerstag", "freitag", "samstag", "sonntag"];
        const targetDay = days.find(d => pInput.includes(d)) || configDay.toLowerCase();
        const formattedDay = targetDay.charAt(0).toUpperCase() + targetDay.slice(1);
        
        // Extract basic intent & title from user's words (prioritize tactical complex actions)
        let newTitle = "Spezifisches KI-Training";
        let dType = "rondo"; // default
        
        if (focusQuery.includes("flanke") || focusQuery.includes("torschuss") || focusQuery.includes("abschluss") || focusQuery.includes("hinterläuf") || focusQuery.includes("steil")) {
            newTitle = configFocus === "custom" ? "Flanken & Torabschluss (Cust)" : "Flanken & Torabschluss";
            dType = "shooting";
        } else if (focusQuery.includes("pass") || focusQuery.includes("rondo") || focusQuery.includes("spielform") || focusQuery.includes("umschalt")) {
            newTitle = configFocus === "custom" ? "Passspiel & Rondo (Cust)" : "Passspiel & Rondo";
            dType = "rondo";
        } else if (focusQuery.includes("aufwärm") || focusQuery.includes("koordination") || focusQuery.includes("sprint")) {
            newTitle = configFocus === "custom" ? "Koordination & Aufwärmen (Cust)" : "Koordination & Aufwärmen";
            dType = "warmup";
        } else {
            // Unrecognized custom prompt, default to Rondo to show *something* tactical
            newTitle = configFocus === "custom" ? "Taktik (Generiert)" : configFocus;
            dType = "rondo";
        }

        // Keep intensity rules
        const intent = (pInput.includes("auslauf") || pInput.includes("regeneration")) ? 30 : 80;80;

        // Map over existing schedule to update the specific requested day
        setTruthObject(prev => {
            const currentSchedule = prev.training_lab.schedule;
            const index = currentSchedule.findIndex(item => item.day.toLowerCase() === targetDay);
            let updatedSchedule;

            if (index !== -1) {
                // Update existing row
                updatedSchedule = [...currentSchedule];
                updatedSchedule[index] = {
                   ...updatedSchedule[index],
                   type: newTitle,
                   intensity: intent,
                   completed: false,
                   hasSim: true,
                   simData: {
                       name: newTitle,
                       type: dType,
                       focus: finalPrompt.substring(0, 45) + (finalPrompt.length > 45 ? "..." : "")
                   }
                };
            } else {
                // Day not in default 5-day view, so we append a new row for them
                updatedSchedule = [...currentSchedule, {
                    id: Date.now(),
                    day: formattedDay,
                    type: newTitle,
                    intensity: intent,
                    time: "10:00 - 12:00",
                    completed: false,
                    hasSim: true,
                    simData: {
                        name: newTitle,
                        type: dType,
                        focus: finalPrompt.substring(0, 45) + (finalPrompt.length > 45 ? "..." : "")
                    }
                }];
            }

            return {
                ...prev,
                training_lab: {
                    ...prev.training_lab,
                    schedule: updatedSchedule
                }
            };
        });

        setAiFeedback(`GERD AI REPORT: Trainingsplan Update für ${formattedDay}! Übung: "${newTitle}" wurde eingeloggt. Vector-Simulation als Vorschau verfügbar.`);
        setPromptInput("");
        setIsAnalyzing(false);
     }, 1500);
  };

  const generateAiFeedback = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setAiFeedback(`GERD AI REPORT: Team-Fitness liegt bei 88%. Die Belastungssteuerung für die laufende Woche ist im grünen Bereich.`);
      setIsAnalyzing(false);
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex items-center justify-between gap-3 mb-2 bg-black/40 p-6 rounded-2xl border border-white/10 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-redbull/20 border border-redbull flex items-center justify-center">
            <Icon name="activity" size={32} className="text-redbull" />
          </div>
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter text-white italic">Trainingszentrum</h2>
            <p className="text-[10px] text-white/50 uppercase tracking-[0.2em] font-mono">Belastungssteuerung & Drills</p>
          </div>
        </div>
        <div className="text-right flex flex-col items-end">
            <span className="text-[10px] uppercase font-black tracking-widest text-white/40">Team-Fitness</span>
            <span className="text-4xl font-black text-neon font-mono">88%</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setActiveView("schedule")} className={`px-4 py-2 rounded text-[10px] font-black uppercase tracking-widest border transition-all ${activeView === "schedule" ? "bg-white text-black border-white" : "bg-black/40 text-white/50 border-white/10 hover:border-white/30"}`}>Trainingsplan</button>
        <button onClick={() => setActiveView("drills")} className={`px-4 py-2 rounded text-[10px] font-black uppercase tracking-widest border transition-all ${activeView === "drills" ? "bg-neon text-black border-neon" : "bg-black/40 text-white/50 border-white/10 hover:border-white/30"}`}>Trainingsübungen (Drills)</button>
        <button onClick={() => setActiveView("load")} className={`px-4 py-2 rounded text-[10px] font-black uppercase tracking-widest border transition-all ${activeView === "load" ? "bg-redbull text-white border-redbull" : "bg-black/40 text-white/50 border-white/10 hover:border-white/30"}`}>Belastungs-Matrix</button>
      </div>

      {/* View: Schedule */}
      {activeView === "schedule" && (
        <div className="flex flex-col gap-6 animate-fade-in">
          
          {/* AI Configurator Card (Abfragen-Katalog) */}
          <div className="bg-[#02050c]/80 border border-neon/30 p-6 rounded-2xl shadow-[0_0_30px_rgba(0,243,255,0.05)] backdrop-blur-md">
             <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                <div>
                   <h3 className="text-neon font-black uppercase tracking-widest text-sm flex items-center gap-2">
                     <Icon name="cpu" size={16} /> KI Session-Configurator
                   </h3>
                   <p className="text-white/50 text-[10px] uppercase font-bold tracking-widest mt-1">Abfragen-Katalog zur dynamischen Erstellung</p>
                </div>
                <button 
                  onClick={generateDailyPlan}
                  disabled={isAnalyzing}
                  className="bg-neon/20 hover:bg-neon hover:text-black border border-neon text-neon px-6 rounded-xl font-black uppercase text-xs tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center h-[36px] min-w-[140px] shadow-[0_0_15px_rgba(0,243,255,0.3)]"
                >
                  {isAnalyzing ? <Icon name="loader" className="animate-spin" size={16} /> : "Generieren"}
                </button>
             </div>
             
             {aiFeedback && (
                <div className="bg-neon/10 border border-neon/30 text-white/90 p-4 rounded-xl text-sm font-medium leading-relaxed mb-6 animate-fade-in shadow-inner">
                   {aiFeedback}
                </div>
             )}

             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Wochentag */}
                <div className="flex flex-col gap-2">
                   <label className="text-white/40 text-[10px] uppercase font-black tracking-widest">Plan-Tag</label>
                   <select 
                     value={configDay} 
                     onChange={(e) => setConfigDay(e.target.value)}
                     className="bg-black/50 border border-white/20 text-white text-sm font-bold p-3 rounded-xl focus:border-neon focus:outline-none appearance-none cursor-pointer hover:border-white/40 transition-colors"
                   >
                     <option value="Montag">Montag</option>
                     <option value="Dienstag">Dienstag</option>
                     <option value="Mittwoch">Mittwoch</option>
                     <option value="Donnerstag">Donnerstag</option>
                     <option value="Freitag">Freitag</option>
                     <option value="Samstag">Samstag</option>
                     <option value="Sonntag">Sonntag</option>
                   </select>
                </div>
                
                {/* Schwerpunkt */}
                <div className="flex flex-col gap-2 md:col-span-2">
                   <label className="text-white/40 text-[10px] uppercase font-black tracking-widest">Hauptteil / Schwerpunkt</label>
                   <div className="flex gap-2">
                       <select 
                         value={configFocus} 
                         onChange={(e) => setConfigFocus(e.target.value)}
                         className="flex-1 bg-black/50 border border-white/20 text-white text-sm font-bold p-3 rounded-xl focus:border-neon focus:outline-none appearance-none cursor-pointer hover:border-white/40 transition-colors"
                       >
                         <option value="Passspiel & Rondo">Passspiel & Umschalten (Rondo)</option>
                         <option value="Flanken & Torabschluss">Flanken & Torabschluss (Klatsch-Steil)</option>
                         <option value="Koordination & Aufwärmen">Sprint, Leiter & Koordination</option>
                         <option value="Taktik (Defensive)">Defensive Ketten-Kompaktheit</option>
                         <option value="custom">Individueller Fokus (KI Chat)</option>
                       </select>
                       
                       {configFocus === "custom" && (
                         <input 
                            type="text" 
                            value={customFocus}
                            onChange={(e) => setCustomFocus(e.target.value)}
                            placeholder="Z.B: 8v8 auf 4 Minitore..."
                            className="flex-1 bg-black/50 border border-neon/50 rounded-xl px-4 py-3 text-neon focus:outline-none focus:border-neon transition-colors font-medium text-sm animate-fade-in placeholder-neon/30"
                         />
                       )}
                   </div>
                </div>

                {/* Phasing Toggles */}
                <div className="flex flex-col gap-3 justify-center">
                   <label className="text-white/40 text-[10px] uppercase font-black tracking-widest mb-1">Dynamische Phasen</label>
                   
                   <label className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${configWarmup ? 'bg-neon border-neon text-black' : 'bg-black/50 border-white/20 text-transparent group-hover:border-white/50'}`}>
                         <Icon name="check" size={14} />
                      </div>
                      <input type="checkbox" className="hidden" checked={configWarmup} onChange={(e) => setConfigWarmup(e.target.checked)} />
                      <span className="text-xs font-bold text-white/80 group-hover:text-white transition-colors uppercase tracking-wider">Aufwärm-Programm</span>
                   </label>

                   <label className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${configCooldown ? 'bg-neon border-neon text-black' : 'bg-black/50 border-white/20 text-transparent group-hover:border-white/50'}`}>
                         <Icon name="check" size={14} />
                      </div>
                      <input type="checkbox" className="hidden" checked={configCooldown} onChange={(e) => setConfigCooldown(e.target.checked)} />
                      <span className="text-xs font-bold text-white/80 group-hover:text-white transition-colors uppercase tracking-wider">Auslaufen (Cool-Down)</span>
                   </label>
                </div>
             </div>
             
             {/* Legacy Text Prompt Toggle */}
             <div className="mt-4 pt-4 border-t border-white/10">
               <input 
                  type="text" 
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  placeholder="Optional: Manuelle Chat-Eingabe als Fallback..."
                  className="w-full bg-transparent border border-white/10 rounded-lg px-4 py-2 text-white/60 focus:outline-none focus:border-white/30 transition-colors font-medium text-[11px]"
                  onKeyDown={(e) => e.key === 'Enter' && generateDailyPlan()}
               />
             </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div className="hidden md:flex bg-white/5 border border-white/10 p-4 rounded-xl items-center justify-between text-[10px] uppercase tracking-widest text-white/40 font-black">
              <div className="w-32">Wochentag</div>
              <div className="flex-1">Schwerpunkt</div>
              <div className="w-32 text-center">Zeitraum</div>
              <div className="w-16 text-center">Sim</div>
            </div>
            {schedule.map((s) => (
              <div key={s.id} className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${s.isMatchday ? "bg-redbull/10 border-redbull/30 hover:border-redbull/50 shadow-[0_0_15px_rgba(226,27,77,0.1)]" : s.completed ? "bg-black/60 border-white/5 opacity-60" : "bg-black/40 border-white/20 hover:border-white/40 shadow-lg"}`}>
                  <div className="w-32 font-black text-white text-sm uppercase tracking-tighter shrink-0 flex items-center gap-2">
                     {s.completed && !s.isMatchday && <Icon name="check-circle" className="text-neon" size={14} />}
                     {s.isMatchday && <Icon name="swords" className="text-redbull animate-pulse" size={16} />}
                     <span className={s.isMatchday ? "text-redbull" : ""}>{s.day}</span>
                  </div>
                  <div className={`flex-1 font-bold ${s.isMatchday ? 'text-redbull shadow-md uppercase tracking-widest text-lg' : 'text-white/80'}`}>{s.type}</div>
                  <div className={`w-32 text-left md:text-center font-mono text-xs shrink-0 ${s.isMatchday ? 'text-redbull/70 font-black' : 'text-white/60'}`}>{s.time}</div>
                  
                  <div className="w-16 flex justify-center items-center shrink-0 border-l border-white/10 md:border-none md:pl-0 h-full">
                      {s.hasSim && !s.isMatchday ? (
                         <button 
                           onClick={() => setActiveDrillSim(s.simData)}
                           className="bg-neon/20 border border-neon text-neon hover:bg-neon hover:text-black rounded-full w-10 h-10 flex items-center justify-center transition-all drop-shadow-[0_0_8px_rgba(0,243,255,0.6)] group-hover:scale-110"
                         >
                            <Icon name="play" size={20} className="ml-1" />
                         </button>
                      ) : s.isMatchday ? (
                         <span className="text-redbull/60 text-[10px] uppercase font-black tracking-widest leading-tight text-center border border-redbull/30 px-2 py-1 rounded bg-black/50">Match</span>
                      ) : (
                         <span className="text-white/20 text-[10px] uppercase font-black uppercase tracking-widest leading-tight text-center">Keine<br/>Sim.</span>
                      )}
                  </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SVG DRILL SIMULATOR MODAL */}
      {activeDrillSim && (
          <DrillSimulator drill={activeDrillSim} onClose={() => setActiveDrillSim(null)} />
      )}

      {/* View: Drills */}
      {activeView === "drills" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {drills.map(d => (
                <div key={d.id} className="bg-black/40 border border-white/10 rounded-2xl p-6 hover:border-white/30 transition-all group flex flex-col justify-between min-h-[160px]">
                    <div>
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-xl font-black text-white uppercase tracking-tighter">{d.name}</h3>
                            <span className="text-xs font-mono bg-white/10 px-2 py-1 rounded text-white/80">{d.duration}</span>
                        </div>
                        <p className={`text-xs uppercase tracking-widest font-black ${d.color === 'neon' ? 'text-neon' : d.color === 'redbull' ? 'text-redbull' : d.color === 'gold' ? 'text-gold' : 'text-white/60'}`}>
                            Fokus: {d.focus}
                        </p>
                    </div>
                    <button 
                        disabled={activeRole === 'Manager'}
                        className={`mt-4 w-full py-2 border rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors ${activeRole === 'Manager' ? 'bg-black/80 border-white/5 text-white/20 cursor-not-allowed' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}
                    >
                        {activeRole === 'Manager' ? 'Read-Only (Seniorentrainer)' : 'Zum Trainingsplan hinzufügen'}
                    </button>
                </div>
            ))}
        </div>
      )}

      {/* View: Load Management & AI */}
      {activeView === "load" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart Placeholder */}
            <div className="bg-black/40 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden">
                <Icon name="bar-chart-2" size={120} className="text-white/5 absolute opacity-50" />
                <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 relative z-10 text-center">Belastungssteuerung <br/><span className="text-neon text-[10px]">Wochenzyklus</span></h3>
                <div className="w-full flex items-end justify-between h-32 px-4 relative z-10 gap-2">
                    {schedule.map((s, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                            <div className="w-full bg-white/5 rounded-t-sm relative transition-all group-hover:bg-white/10" style={{ height: '100px' }}>
                                <div className={`absolute bottom-0 left-0 w-full rounded-t-sm transition-all ${s.intensity > 75 ? "bg-redbull" : s.intensity > 40 ? "bg-gold" : "bg-neon"}`} style={{ height: `${s.intensity}%` }}></div>
                            </div>
                            <span className="text-[8px] font-black uppercase text-white/50">{s.day.substring(0,2)}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* AI Coaching */}
            <div className="bg-navy border border-neon/30 rounded-2xl p-6 shadow-[0_0_30px_rgba(0,243,255,0.05)] flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 opacity-10 pointer-events-none">
                    <Icon name="cpu" size={120} className="text-neon" />
                </div>
                <h3 className="text-neon font-black uppercase text-sm tracking-widest mb-2 flex items-center gap-3 relative z-10">
                    <Icon name="brain" size={20} /> GERD AI-Coach
                </h3>
                <p className="text-[10px] font-mono text-white/40 uppercase mb-6 relative z-10">Automatische Belastungsanalyse</p>
                
                <div className="flex-1 flex flex-col relative z-10">
                    {aiFeedback ? (
                        <div className="bg-black/30 border border-neon/20 p-4 rounded-xl animate-fade-in flex-1">
                            <p className="font-mono text-neon/80 text-xs leading-relaxed">{aiFeedback}</p>
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center p-6 text-center w-full h-full">
                                <div>
                                    <Icon name="zap" size={24} className="text-white/20 mb-2 mx-auto" />
                                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Warte auf Analyse-Start...</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <button 
                    onClick={generateAiFeedback}
                    disabled={isAnalyzing || activeRole === 'Manager'}
                    className={`mt-6 w-full font-black text-[10px] uppercase tracking-widest py-3 rounded-xl transition-all flex items-center justify-center gap-2 relative z-10 ${activeRole === 'Manager' ? 'bg-black/60 text-white/20 border border-white/5 cursor-not-allowed' : 'bg-neon text-navy hover:bg-white shadow-[0_0_15px_rgba(0,243,255,0.3)]'}`}
                >
                    {isAnalyzing ? <Icon name="loader" size={16} className="animate-spin" /> : <Icon name="activity" size={16} />}
                    {activeRole === 'Manager' ? "Read-Only: Trainer Feature" : isAnalyzing ? "Analysiere Daten..." : "Belastungs-Report generieren"}
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default TrainingLab;
