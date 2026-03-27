import React, { useState } from 'react';
import Icon from './Icon';
import { getAiConfig } from '../utils/aiConfig';

const MedicalLab = ({ truthObject }) => {
  const [isComputing, setIsComputing] = useState(false);
  const [medicalDiagnoses, setMedicalDiagnoses] = useState({});
  const [gerdMessage, setGerdMessage] = useState("Chief Medical Officer GERD auf Standby. Lade Spieler-Biometrie...");

  // BYOK API Settings
  const { activeKey, endpoint, modelString, aiProvider } = getAiConfig();

  const defaultPlayers = [
     { id: 99, name: "Lukas Berg", position: "IV", readiness: 94 },
     { id: 6, name: "Muster-ZM", position: "CM", readiness: 65 },  // needs rotation!
     { id: 10, name: "Muster-ST", position: "ST", readiness: 88 }
  ];

  const players = truthObject?.players?.length > 0 ? truthObject.players : defaultPlayers;
  
  // Sort by readiness ascending (who needs most attention)
  const sortedPlayers = [...players].sort((a,b) => (a.readiness||100) - (b.readiness||100));

  const handlePredictiveScan = async () => {
    if (!activeKey) {
        alert("Globale KI-Verbindung fehlt! Bitte API Key in NLZ Academy hinterlegen.");
        return;
    }
    
    setIsComputing(true);
    setGerdMessage("Sensoren aktiv. Analysiere Belastungsdaten, Laktatwerte und chronische Erschöpfung des gesamten Kaders...");
    setMedicalDiagnoses({}); // reset
    
    // Prepare the patient list for the LLM
    const patientData = sortedPlayers.map(p => `ID: ${p.id}, Name: ${p.name}, Position: ${p.position}, Readiness: ${p.readiness}%`).join("\\n");
    
    const systemPrompt = `Du bist GERD in der Rolle des unbarmherzigen, analytisch brillanten Chief Medical Officer (Arzt) eines Profi-Fußballvereins.
Die Readiness-Zahlen spiegeln die körperliche Verfassung wider (100 = perfekt, unter 75 = erhöhtes Verletzungsrisiko, unter 60 = akute Gefahr).

Hier sind die aktuellen Daten der Mannschaft:
${patientData}

Aufgabe: Analysiere den Kader. Suche dir mindestens 2 bis 3 Spieler aus, deren Wert am schlechtesten ist oder die aufgrund ihrer Position und Erschöpfung stark verletzungsgefährdet sind.
Schreibe zu diesen Spielern eine brutale, ärztliche Warnung. Was wird reißen? Welcher Muskel steht kurz vor dem Riss?

DU MUSST EXAKT IN DIESEM JSON-ARRAY FORMAT ANTWORTEN (Kein Markdown, NUR JSON!):
[
  {
     "playerId": [ID als Integer],
     "riskLevel": "CRITICAL",
     "bodyPart": "[z.B. hintere Oberschenkelmuskulatur]",
     "medicalAdvice": "[Dein harter Rat an den Trainer, z.B. 'Sofort aus dem Training nehmen, wir riskieren 6 Wochen Ausfall.']"
  }
]`;

     try {
         const res = await fetch(endpoint, {
             method: "POST",
             headers: { "Content-Type": "application/json", "Authorization": `Bearer ${activeKey}` },
             body: JSON.stringify({ model: modelString, messages: [{ role: "user", content: systemPrompt }], temperature: 0.3 })
         });
         const data = await res.json();
         if(data.error) throw new Error(data.error.message);
         
         let raw = data.choices[0].message.content.trim();
         if(raw.startsWith("\`\`\`json")) raw = raw.replace(/^\`\`\`json/, "").replace(/\`\`\`$/, "").trim();
         else if(raw.startsWith("\`\`\`")) raw = raw.replace(/^\`\`\`/, "").replace(/\`\`\`$/, "").trim();
         
         const parsed = JSON.parse(raw);
         
         const newDiagnoses = {};
         parsed.forEach(diag => {
             newDiagnoses[diag.playerId] = diag;
         });
         setMedicalDiagnoses(newDiagnoses);
         setGerdMessage("Scan abgeschlossen. Klinischer Befund für gefährdete Spieler liegt vor.");
     } catch(err) {
         console.error(err);
         setGerdMessage("Fehler beim Medizin-Scan. KI-Verbindung abgebrochen.");
     } finally {
         setIsComputing(false);
     }
  };

  return (
    <div className="animate-fade-in space-y-6 pb-20">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-2 bg-[#02050c]/80 p-6 rounded-2xl border border-redbull/20 shadow-[0_0_30px_rgba(226,27,77,0.05)] backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-redbull/10 border border-redbull flex items-center justify-center">
            <Icon name="heart-pulse" size={28} className="text-redbull" />
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tighter text-white italic">Medical Lab</h2>
            <p className="text-[10px] text-white/50 uppercase tracking-[0.2em] font-mono">Load Management & Performance</p>
          </div>
        </div>
        <button 
           onClick={handlePredictiveScan}
           disabled={isComputing || !activeKey}
           className={`px-6 py-3 rounded text-[10px] font-black uppercase tracking-widest border transition-all flex items-center gap-3 ${isComputing ? "bg-redbull/20 text-redbull border-redbull animate-pulse" : "bg-redbull hover:bg-white text-white hover:text-black border-redbull"}`}
        >
           {isComputing ? <Icon name="cpu" size={16} className="animate-spin" /> : <Icon name="activity" size={16} />}
           {isComputing ? "Scanning..." : "Run Predictive Scan"}
        </button>
      </div>

      {/* Ticker */}
      <div className="bg-black/60 border border-white/10 rounded-xl p-4 flex gap-4 items-center shadow-inner">
         <div className="bg-redbull/20 text-redbull p-2 rounded-lg">
            <Icon name="message-square" size={20} />
         </div>
         <p className="font-mono text-xs text-white/80 leading-relaxed italic border-l-2 border-redbull/50 pl-4 py-1">
           {gerdMessage}
         </p>
      </div>

      {/* SQUAD GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
         {sortedPlayers.map(p => {
             const r = p.readiness || 100;
             const danger = r < 75;
             const diagnosis = medicalDiagnoses[p.id];

             return (
                 <div key={p.id} className={`bg-[#02050c]/80 border ${diagnosis ? 'border-redbull shadow-[0_0_15px_rgba(226,27,77,0.2)]' : (danger ? 'border-redbull/40' : 'border-white/10')} rounded-2xl p-6 transition-all relative overflow-hidden flex flex-col`}>
                     {/* Background Warning Mesh */}
                     {diagnosis && <div className="absolute inset-0 bg-redbull/5 pattern-diagonal-lines pattern-redbull/10 pattern-bg-transparent pattern-size-4 opacity-50 pointer-events-none"></div>}
                     
                     <div className="flex justify-between items-start mb-4 relative z-10 flex-shrink-0">
                        <div>
                           <div className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-1">ID: #{p.id} | {p.position}</div>
                           <h3 className="text-xl font-black text-white">{p.name}</h3>
                        </div>
                        <div className="text-right">
                           <div className={`text-3xl font-black italic ${danger ? 'text-redbull' : 'text-neon'}`}>{r}%</div>
                           <div className="text-[8px] uppercase tracking-widest text-white/50">Readiness</div>
                        </div>
                     </div>

                     <div className="w-full bg-black/50 h-2 flex-shrink-0 rounded-full mb-4 overflow-hidden relative z-10 border border-white/10">
                         <div className={`h-full ${danger ? 'bg-redbull' : 'bg-neon'}`} style={{width: `${r}%`}}></div>
                     </div>

                     <div className="flex-1">
                       {diagnosis ? (
                           <div className="mt-2 bg-redbull/10 border border-redbull/30 rounded-lg p-4 relative z-10 h-full flex flex-col">
                               <div className="flex items-center gap-2 text-redbull font-black text-xs uppercase tracking-widest mb-3 border-b border-redbull/20 pb-2">
                                  <Icon name="alert-triangle" size={14} /> KI Warnung: {diagnosis.riskLevel}
                               </div>
                               <div className="space-y-3 font-mono text-xs text-white/80 flex-1">
                                  <div><span className="text-redbull/70">Risk Area:</span> {diagnosis.bodyPart}</div>
                                  <div><span className="text-redbull/70">Action:</span> {diagnosis.medicalAdvice}</div>
                               </div>
                               <button className="mt-4 w-full bg-redbull hover:bg-white text-white hover:text-black py-2 rounded text-[10px] font-black uppercase tracking-widest transition-colors flex-shrink-0">
                                  Reha starten
                               </button>
                           </div>
                       ) : (
                           <div className="mt-2 flex items-center gap-2 text-white/30 text-xs font-mono relative z-10">
                               <Icon name="check-circle" size={14} className={danger ? "" : "text-neon/50"} /> {danger ? "Erhöhtes Risiko, aber kein akuter Befund." : "Spieler ist voll belastbar."}
                           </div>
                       )}
                     </div>
                 </div>
             )
         })}
      </div>
    </div>
  );
};

export default MedicalLab;
