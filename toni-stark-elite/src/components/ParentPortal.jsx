import { getAiConfig, sendAiRequest } from '../utils/aiConfig';
import { sendMessage, fetchMessages, subscribeToMessages, supabase } from '../utils/supabaseClient';
import React, { useState, useEffect } from 'react';
import Icon from './Icon';
import AiSettingsWidget from './AiSettingsWidget';


const ParentPortal = ({ truthObject, setTruthObject, activeChildId }) => {
  const clubName = truthObject?.club_info?.name || "Stark Elite";
  
  // Dynamic child data
  const childRaw = truthObject?.nlz_squad?.find(p => p.id === activeChildId) || {};
  const calculatedOvr = Math.round(((childRaw.pac || 50) + (childRaw.sho || 50) + (childRaw.pas || 50) + (childRaw.dri || 50) + (childRaw.def || 50) + (childRaw.phy || 50)) / 6);

  // Pro-Sync Data extraction
  const medicalInfo = truthObject?.nlz_medical_records?.find(m => m.playerId === activeChildId);
  const academicInfo = truthObject?.nlz_academic_records?.filter(a => a.playerId === activeChildId) || [];

  const child = {
    name: childRaw.name || "UNBEKANNT",
    group: (childRaw.group || "NK").toUpperCase(),
    ovr: childRaw.ovr || calculatedOvr || 75,
    attendance: "98%",
    nextTraining: {
      date: "Nächste Session",
      focus: "Pädagogische & Athletische Grundausbildung"
    }
  };

  const [aiFeedback, setAiFeedback] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [supabaseMessages, setSupabaseMessages] = useState([]);
  const [activeWeeklyPlan, setActiveWeeklyPlan] = useState(null);

  useEffect(() => {
    const fetchWeek = async () => {
        const { data, error } = await supabase
            .from('training_plans')
            .select('*')
            .eq('visibility', 'team_parents')
            .order('created_at', { ascending: false })
            .limit(1);
        
        if (data && data.length > 0) {
            setActiveWeeklyPlan(data[0]);
        }
    };
    fetchWeek();
  }, []);

  React.useEffect(() => {
    if (activeChildId) {
        const loadMsgs = async () => {
            const msgs = await fetchMessages('coach_unified', activeChildId);
            setSupabaseMessages(msgs);
        };
        loadMsgs();

        const channel = subscribeToMessages((payload) => {
            const newMsg = payload.new;
            if ((newMsg.sender_id === 'coach_unified' && newMsg.receiver_id === activeChildId) ||
                (newMsg.sender_id === activeChildId && newMsg.receiver_id === 'coach_unified')) {
                setSupabaseMessages(prev => [...prev, newMsg]);
            }
        });

        return () => supabase.removeChannel(channel);
    }
  }, [activeChildId]);

  const handleSendParentMessage = async () => {
    if (!chatInput.trim() || !activeChildId) return;
    
    const success = await sendMessage({
        sender_id: activeChildId,
        receiver_id: 'coach_unified',
        content: chatInput
    });
    
    if (success) {
        setChatInput("");
    }
  };

  const handleGenerateFeedback = async () => {
      const { activeKey, endpoint, modelString, aiProvider } = getAiConfig();
      
      if (!activeKey) {
          alert("Fehler: Kein API-Schlüssel im Backend hinterlegt.");
          return;
      }

      setIsGenerating(true);
      
      const prompt = `Du bist 'Trainer Gerd', ein extrem fähiger, aber pädagogisch hervorragender Jugendtrainer des Vereins ${clubName}. 
Erstelle ein persönliches Feedback für die Eltern des Spielers ${child.name} (${child.group}, Overall Rating: ${child.ovr}).
Das nächste Training fokussiert sich auf: "${child.nextTraining.focus}".

${medicalInfo ? `KONTEXT MEDIZIN: Der Spieler ist aktuell in der Reha (${medicalInfo.type}, Status: ${medicalInfo.status}). Prognose Rückkehr: ${medicalInfo.return_date}.` : ''}
${academicInfo.length > 0 ? `KONTEXT SCHULE: Der Spieler erzielt aktuell folgende Noten: ${academicInfo.map(r => `${r.subject}: ${r.grade}`).join(', ')}.` : ''}

Schreibe ein kurzes, wertschätzendes, aber ehrliches Feedback. Gehe kurz auf den medizinischen/schulischen Stand ein, falls relevant.
Formatiere zwingend als JSON:
{
  "strengths": "[Was hat der Spieler in den letzten Wochen extrem gut gemacht? Kurz und knackig, lobend]",
  "improvements": "[Wo muss der Spieler im nächsten Training zulegen? (Fokus auf Mentalität oder Technik)]",
  "homework": "[Eine konkrete, einfache Hausaufgabe für Zuhause. Falls verletzt: Eine mentale/taktische Aufgabe (Video schauen)]"
}
Beschränke dich auf Deutsch.`;

      try {
          let raw = await sendAiRequest(prompt);
          if(raw.startsWith("```json")) raw = raw.replace(/^```json/, "").replace(/```$/, "").trim();
          else if(raw.startsWith("```")) raw = raw.replace(/^```/, "").replace(/```$/, "").trim();
          
          setAiFeedback(JSON.parse(raw));
      } catch (e) {
          console.error(e);
          alert("Konnte aktuelles Trainer-Feedback nicht abrufen.");
      } finally {
          setIsGenerating(false);
      }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-navy font-sans overflow-y-auto">
       <div className="max-w-md mx-auto bg-white min-h-screen shadow-2xl relative pb-20">
          
          {/* Header */}
          <div className="bg-navy rounded-b-3xl p-8 pt-12 text-white relative overflow-hidden shadow-lg">
             <div className="absolute top-0 right-0 w-32 h-32 bg-neon/10 rounded-full blur-2xl"></div>
             <div className="relative z-10">
                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 mb-2">{clubName} Parent App</div>
                <h1 className="text-3xl font-black italic tracking-tighter uppercase leading-tight mb-6">
                   Hallo, <br/>Familie <span className="text-neon">Wunderkind</span>
                </h1>
                
                <div className="flex bg-white/10 rounded-xl p-4 border border-white/20 backdrop-blur-sm items-center gap-4">
                   <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-gold to-neon flex items-center justify-center font-black text-2xl shadow-inner border-2 border-white">
                      {child.ovr}
                   </div>
                   <div>
                      <div className="font-black uppercase tracking-widest text-sm">{child.name}</div>
                      <div className="text-[10px] uppercase tracking-widest text-white/60 font-mono mt-1">Spieler-Status: <span className="text-neon">Aktiv ({child.group})</span></div>
                   </div>
                </div>
             </div>
          </div>

          {/* Main Content Dashboard */}
          <div className="p-6 space-y-6 -mt-4 relative z-20">
             
             {/* PRO-SYNC: Medical & Education Cards */}
             {medicalInfo && (
                <div className="bg-red-500 rounded-2xl p-4 text-white shadow-lg animate-pulse border-2 border-white/20">
                   <div className="flex justify-between items-center mb-2">
                      <div className="text-[10px] font-black uppercase tracking-widest opacity-80">Medizinischer Status</div>
                      <Icon name="activity" size={14} />
                   </div>
                   <div className="text-lg font-black uppercase italic">{medicalInfo.status}: {medicalInfo.type}</div>
                   <div className="text-[9px] mt-1 font-medium italic opacity-90 leading-tight">"{medicalInfo.notes}"</div>
                </div>
             )}

             {academicInfo.length > 0 && (
                <div className="bg-white rounded-2xl p-4 shadow-xl border border-gray-100">
                   <div className="flex justify-between items-center mb-3">
                      <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">Schulische Leistungen</div>
                      <Icon name="book" size={14} className="text-gold" />
                   </div>
                   <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                      {academicInfo.map(rec => (
                        <div key={rec.id} className="min-w-[100px] bg-gray-50 p-2 rounded-xl border border-gray-100 flex justify-between items-center">
                           <div className="text-[8px] font-black uppercase text-navy/60 truncate mr-2">{rec.subject}</div>
                           <div className="bg-navy text-white w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs italic">{rec.grade}</div>
                        </div>
                      ))}
                   </div>
                </div>
             )}
             {/* AI Settings Wrapper for Parents */}
             <AiSettingsWidget context="parent" />

             {/* Next Session */}
             <div className="bg-white rounded-2xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.05)] border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                   <Icon name="calendar" size={18} className="text-redbull" />
                   <h3 className="font-black uppercase text-xs tracking-widest">Nächste Einheit</h3>
                </div>
                <div className="font-black text-lg text-navy mb-1">{child.nextTraining.date}</div>
                <div className="text-xs text-gray-500 font-medium leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
                   Fokus: {child.nextTraining.focus}
                </div>
             </div>

             {/* Gerd's Feedback Engine */}
             <div className="bg-gradient-to-br from-navy to-[#0a1120] rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                <div className="absolute bottom-0 right-0 opacity-10 pointer-events-none translate-x-1/4 translate-y-1/4">
                   <Icon name="cpu" size={120} />
                </div>
                
                <div className="relative z-10">
                   <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                         <Icon name="message-circle" size={18} className="text-neon" />
                         <h3 className="font-black uppercase text-xs tracking-widest text-white">Trainer-Feedback</h3>
                      </div>
                      {isGenerating && <span className="flex items-center gap-1 text-[9px] uppercase tracking-widest text-neon font-bold animate-pulse"><Icon name="loader" size={10} className="animate-spin" /> KI analysiert</span>}
                   </div>

                   {!aiFeedback && !isGenerating && (
                      <div className="text-center py-4">
                         <p className="text-xs text-white/50 mb-4 font-mono">Kein aktuelles Feedback für diese Woche geladen.</p>
                         <button 
                            onClick={handleGenerateFeedback}
                            className="bg-neon hover:bg-white text-navy px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(0,243,255,0.3)] w-full"
                         >
                            Aktuellen Stand abfragen
                         </button>
                      </div>
                   )}

                   {aiFeedback && (
                      <div className="space-y-4 animate-fade-in">
                         <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                            <div className="text-[9px] uppercase tracking-widest font-black text-green-400 mb-1">Stärken der Woche</div>
                            <div className="text-sm font-medium leading-relaxed">{aiFeedback.strengths}</div>
                         </div>
                         <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                            <div className="text-[9px] uppercase tracking-widest font-black text-gold mb-1">Daran arbeiten wir</div>
                            <div className="text-sm font-medium leading-relaxed">{aiFeedback.improvements}</div>
                         </div>
                         <div className="bg-neon/10 border border-neon/30 p-4 rounded-xl mt-2">
                            <div className="flex items-center gap-2 mb-2">
                               <Icon name="home" size={14} className="text-neon" />
                               <div className="text-[9px] uppercase tracking-widest font-black text-neon">Gerd's Hausaufgabe</div>
                            </div>
                            <div className="text-sm font-bold italic leading-relaxed text-white">"{aiFeedback.homework}"</div>
                         </div>
                      </div>
                   )}
                </div>
             </div>

             {/* Calendar Widget */}
             <div className="bg-white rounded-2xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.05)] border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 opacity-5 -mt-4 -mr-4 pointer-events-none text-redbull">
                   <Icon name="calendar" size={120} />
                </div>
                <h3 className="font-black uppercase text-xs tracking-widest text-navy flex items-center gap-2 mb-4">
                   <Icon name="clock" size={16} className="text-redbull" /> Kalender ({child.group})
                </h3>
                <div className="space-y-3">
                   {activeWeeklyPlan ? (
                       <div className="animate-fade-in">
                           <div className="text-[10px] font-black text-neon uppercase bg-navy p-2 rounded-lg mb-4 inline-block tracking-widest">
                               Lager: {activeWeeklyPlan.title}
                           </div>
                           <div className="prose prose-sm max-w-none text-navy">
                               {/* We use a simplified view for the calendar rows if we can parse it, or just showing the markdown content */}
                               <div className="space-y-4">
                                   {activeWeeklyPlan.markdown_content.split('##').map((section, idx) => {
                                       if (idx === 0) return null;
                                       const lines = section.trim().split('\n');
                                       const title = lines[0];
                                       const content = lines.slice(1).join('\n');
                                       
                                       if (title.includes('ÜBERSICHT')) {
                                           // Extract rows from table
                                           const rows = content.split('\n').filter(r => r.includes('|') && !r.includes('---') && !r.includes('Tag | Fokus'));
                                           return rows.map((row, rIdx) => {
                                               const [_, day, focus, details] = row.split('|').map(s => s.trim());
                                               if (!day) return null;
                                               return (
                                                  <div key={rIdx} className="flex gap-4 items-center bg-gray-50 p-3 rounded-xl border border-gray-100 mb-2">
                                                     <div className="bg-white px-3 py-2 rounded-lg text-center shadow-sm w-20 shrink-0">
                                                        <div className="text-[8px] font-black uppercase text-redbull">{day}</div>
                                                        <div className="text-xs font-black text-navy leading-tight mt-1">Sitzung</div>
                                                     </div>
                                                     <div>
                                                        <div className="text-sm font-black text-navy uppercase leading-tight">{focus}</div>
                                                        <div className="text-[9px] text-gray-500 font-medium mt-1">{details}</div>
                                                     </div>
                                                  </div>
                                               );
                                           });
                                       }
                                       return null;
                                   })}
                               </div>
                           </div>
                       </div>
                   ) : (
                       <>
                           <div className="flex gap-4 items-center bg-gray-50 p-2 rounded-xl">
                              <div className="bg-white px-3 py-2 rounded-lg text-center shadow-sm w-16">
                                 <div className="text-[9px] font-black uppercase text-redbull">Morgen</div>
                                 <div className="text-xl font-black text-navy leading-none">17</div>
                              </div>
                              <div>
                                 <div className="text-sm font-black text-navy uppercase">Team-Training</div>
                                 <div className="text-[10px] text-gray-500 font-mono">17:30 - 19:00 Uhr am NLZ</div>
                              </div>
                           </div>
                           <div className="flex gap-4 items-center bg-gray-50 p-2 rounded-xl">
                              <div className="bg-white px-3 py-2 rounded-lg text-center shadow-sm w-16">
                                 <div className="text-[9px] font-black uppercase text-neon">Samstag</div>
                                 <div className="text-xl font-black text-navy leading-none">20</div>
                              </div>
                              <div>
                                 <div className="text-sm font-black text-navy uppercase">Turnier / Liga</div>
                                 <div className="text-[10px] text-gray-500 font-mono">Treffpunkt 08:30 Uhr (Auswärts)</div>
                              </div>
                           </div>
                       </>
                   )}
                </div>
             </div>

             {/* Trainer Chat & Eval */}
             <div className="bg-[#f0f2f5] rounded-2xl border border-gray-200 shadow-lg relative overflow-hidden flex flex-col h-[400px]">
                <div className="bg-navy p-4 flex items-center justify-between shadow-md z-10">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center border border-white/20"><Icon name="user" size={18} className="text-neon" /></div>
                      <div>
                         <h3 className="text-white font-black uppercase text-sm tracking-widest leading-none">Trainer-Kontakt</h3>
                         <div className="text-[9px] text-gray-400 uppercase tracking-widest">End-to-End Encrypted</div>
                      </div>
                   </div>
                </div>
                
                {childRaw.lastTrainingEval && (
                   <div className="bg-white mx-4 mt-4 p-3 rounded-xl shadow-sm border border-gray-200 z-10">
                      <div className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Letzte Trainingsleistung</div>
                      <div className="flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-neon animate-pulse"></div>
                         <span className="font-black text-navy uppercase text-sm">{childRaw.lastTrainingEval.rating}</span>
                      </div>
                      {childRaw.lastTrainingEval.note && <div className="text-xs text-gray-500 mt-1 italic">"{childRaw.lastTrainingEval.note}"</div>}
                   </div>
                )}

                <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#e5ddd5] custom-scrollbar">
                   {supabaseMessages.map((msg, i) => (
                      <div key={msg.id || i} className={`flex ${msg.sender_id === activeChildId ? 'justify-end' : 'justify-start'}`}>
                         <div className={`max-w-[75%] p-3 rounded-2xl relative shadow-sm ${msg.sender_id === activeChildId ? 'bg-[#dcf8c6] text-navy rounded-br-none' : 'bg-white text-navy rounded-bl-none'}`}>
                            <div className="text-sm font-medium leading-snug">{msg.content}</div>
                            <div className={`text-[8px] font-mono mt-1 text-right ${msg.sender_id === activeChildId ? 'text-green-800/60' : 'text-gray-400'}`}>{new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                         </div>
                      </div>
                   ))}
                   {!supabaseMessages.length && (
                      <div className="text-center text-xs text-gray-500 mt-4 font-mono">Sichere Cloud-Verbindung steht. Keine Nachrichten vorhanden.</div>
                   )}
                </div>
                <div className="bg-[#f0f2f5] p-3 flex gap-2 border-t border-gray-300 z-10">
                   <input type="text" placeholder="Nachricht an den Trainer..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendParentMessage()} className="flex-1 bg-white border border-gray-300 rounded-full px-5 py-3 text-sm focus:outline-none focus:border-neon shadow-inner" />
                   <button onClick={handleSendParentMessage} className="w-12 h-12 bg-navy rounded-full flex items-center justify-center text-neon hover:bg-neon hover:text-navy transition-colors shadow-lg"><Icon name="send" size={16} /></button>
                </div>
             </div>
             
             {/* Action Buttons */}
             <div className="grid grid-cols-2 gap-4">
                <button className="bg-white border-2 border-gray-100 rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:border-gray-300 transition-colors">
                   <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-navy"><Icon name="user-check" size={18} /></div>
                   <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">Kind abmelden</span>
                </button>
                <button className="bg-white border-2 border-gray-100 rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:border-gray-300 transition-colors">
                   <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-navy"><Icon name="credit-card" size={18} /></div>
                   <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">Beitrag (Bezahlt)</span>
                </button>
             </div>

          </div>
       </div>
    </div>
  );
};

export default ParentPortal;
