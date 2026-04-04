import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import Icon from './Icon';
import SvgTacticalBoard from './SvgTacticalBoard';
import { getAiConfig, generateTactic } from '../utils/aiConfig';
import { createClient } from '@supabase/supabase-js';
import { savePlan, supabase } from '../utils/supabaseClient';
import mermaid from 'mermaid';

mermaid.initialize({ startOnLoad: false, theme: 'dark' });

const GERD_MASTER_PROMPT = `Du bist „Gerd 2.0“, der weltweit führende High-Performance Director und Taktik-Mentor. Dein Analyse- und Beratungsniveau entspricht der absoluten Weltspitze (Nagelsmann/Klopp). Du kommunizierst im direkten, hochprofessionellen Dialog mit dem Trainer auf Augenhöhe.

DAS FORMAT (CHAT-FIRST & TEXT-ONLY):
Du bist ein Chat-Assistent. Du generierst KEINEN Code, KEINE JSON-Daten und KEINE Bilder/SVGs. Du nutzt sauberes Markdown (Fettungen, Listen, Absätze) für perfekte Lesbarkeit. Deine Beschreibungen müssen so millimetergenau sein, dass im Kopf des Trainers sofort ein visuelles „Kopfkino“ entsteht.

DIE ANTI-FAULHEITS-REGEL (STRIKT):
Es ist dir strengstens untersagt, hohle Floskeln ("Macht Druck") oder zu kurze Stichpunkte zu verwenden. Jede Phase der Übung MUSS in detaillierten, vollständigen Sätzen beschrieben werden. Ein zu kurzer Text ist ein Systemversagen. KEINE BULLET POINTS in den Beschreibungen! Nutze Fließtext für Kopfkino.

PFLICHT-STRUKTUR FOR JEDE TRAININGSÜBUNG:
1. 🎙️ DAS BRIEFING: Ein messerscharfer Satz zum Kernziel.
2. 📐 KOPFKINO: DER AUFBAU: Exakte Meter-Maße, Positionierung von Hütchen/Toren/Zonen, Startpositionen aller Spieler.
3. ⚙️ DER ABLAUF: Chronologische Beschreibung (Min. 5 Sätze, ca. 150 Wörter). Nutze Elite-Vokabular (Dritter Mann, Gegenpressing-Trigger).
4. 👁️ MICRO-COACHING: Exakt 3 hochspezifische Detail-Punkte (Körperstellung, Scanning-Rate, Passtiming/Fußstellung).
5. 🧠 WISSENSCHAFTLICHER NUTZEN: Begründung aus neurologischer/physischer Sicht (z.B. Perception-Action-Coupling).`;


const TacticalHub = ({ truthObject, setTruthObject, activeRole, isNlzTheme, targetPlayers, targetPositions, setTargetPositions }) => {
  // Removed unused activeKey/endpoint/modelString/aiProvider assignments to standardize AI handling
  
  // State Machine
  const [phase, setPhase] = useState('handbuch_or_new'); 
  const [isGenerating, setIsGenerating] = useState(false);
  const [gerdFeedback, setGerdFeedback] = useState("");
  const [viewingSavedSession, setViewingSavedSession] = useState(null);
  const [chatHistory, setChatHistory] = useState([]); 
  const endRef = useRef(null);
  
  // Session Data
  const [trainerName, setTrainerName] = useState("");
  const [clubName, setClubName] = useState(truthObject?.club_info?.name || "");
  const [ageGroup, setAgeGroup] = useState("");
  const [clubAnalysis, setClubAnalysis] = useState("");
  const [targetDay, setTargetDay] = useState("Mittwoch"); 
  
  // Drill Options
  const [warmupOptions, setWarmupOptions] = useState([]);
  const [mainOptions, setMainOptions] = useState([]);
  
  // Final Draft
  const [draft, setDraft] = useState({ warmup: null, main_drill: null, cooldown: null, taktischerFokus: "" });
  const [cooldownType, setCooldownType] = useState("");
  const [cloudStatus, setCloudStatus] = useState("");
  const [planningMode, setPlanningMode] = useState('single'); // 'single' or 'week'
  const [weeklyPlanMarkdown, setWeeklyPlanMarkdown] = useState("");
  
  const [handbuch, setHandbuch] = useState([]);

  useEffect(() => {
    const loadPlans = async () => {
        const { data, error } = await supabase
            .from('training_plans')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (data) {
            const mapped = data.map(p => ({
                id: p.id,
                date: new Date(p.created_at).toLocaleDateString(),
                title: p.title,
                focus: p.title.replace('Elite Session - ', ''),
                warmup: { markdownContent: p.markdown_content.split('\n\n')[0] }, 
                main_drill: { markdownContent: p.markdown_content.split('\n\n')[1], tacticJson: p.tactic_json },
                cooldown: { markdownContent: p.markdown_content.split('\n\n')[2] }
            }));
            setHandbuch(mapped);
        }
    };

    loadPlans();

    const channel = supabase
        .channel('public:training_plans_realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'training_plans' }, (payload) => {
            loadPlans();
        })
        .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  useEffect(() => {
    if (endRef.current) {
        endRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [phase, isGenerating, chatHistory, draft]);

  useEffect(() => {
    if (phase === 'intro' && chatHistory.length === 0) {
        setChatHistory([{ sender: 'gerd', text: "Willkommen im Elite Architect, Coach. Ich bin Gerd 2.0. Lass uns diese Einheit auf A-Lizenz Niveau hieven. Wie ist dein Name?" }]);
    }
  }, [phase]);

  const addChatMessage = (sender, text) => {
    setChatHistory(prev => [...prev, { sender, text }]);
  };

  const handleCloudSave = async () => {
      setCloudStatus("Uploading...");
      const result = await savePlan({
          team_id: isNlzTheme ? 'youth' : 'seniors',
          title: `Elite Session - ${draft.taktischerFokus}`,
          markdown_content: `${draft.warmup ? draft.warmup.markdownContent : ''}\n\n${draft.main_drill ? draft.main_drill.markdownContent : ''}\n\n${draft.cooldown ? draft.cooldown.markdownContent : ''}`,
          tactic_json: draft.main_drill?.tacticJson,
          visibility: 'team_parents'
      });
      if (result.success) {
          setCloudStatus("Cloud Sync OK");
          setGerdFeedback("Session in Supabase Cloud gesichert!");
          // Refresh handbuch
          const { data } = await supabase.from('training_plans').select('*').order('created_at', { ascending: false });
          if (data) {
             const mapped = data.map(p => ({
                id: p.id,
                date: new Date(p.created_at).toLocaleDateString(),
                title: p.title,
                focus: p.title.replace('Elite Session - ', ''),
                warmup: { markdownContent: p.markdown_content.split('\n\n')[0] },
                main_drill: { markdownContent: p.markdown_content.split('\n\n')[1], tacticJson: p.tactic_json },
                cooldown: { markdownContent: p.markdown_content.split('\n\n')[2] }
             }));
             setHandbuch(mapped);
          }
      } else {
          setCloudStatus("Sync Error");
      }
  };

  const saveToHandbuch = () => {
      const session = {
          id: Date.now(),
          date: new Date().toLocaleDateString(),
          trainer: trainerName,
          club: clubName,
          focus: draft.taktischerFokus,
          warmup: draft.warmup,
          main_drill: draft.main_drill,
          cooldown: draft.cooldown,
          title: `Elite Session - ${draft.taktischerFokus}`
      };
      setTruthObject(prev => ({
          ...prev,
          training_handbuch: [session, ...(prev.training_handbuch || [])]
      }));
      setGerdFeedback("Session gesichert!");
      setPhase('handbuch_or_new');
  };

  const askAi = async (promptText, expectJson = false, temp = 0.2, department = "Senioren") => {
      try {
          const playerContext = targetPlayers?.map(p => `${p.name} (${p.position})`).join(", ") || "";
          const data = await generateTactic(promptText, department, playerContext);
          return data; 
      } catch (err) {
          console.error("Tactical AI Proxy failure:", err);
          return {
             markdownText: `### GERD-ANALYSE: ${promptText}\n\n**STATUS: OFFLINE-MODE (DEMO)**\n\nDie Verbindung zur Cloud-Intelligence (Gemini) ist aktuell unterbrochen. Ich nutze meine lokalen taktischen Muster, um dir trotzdem eine Einheit auf A-Lizenz Niveau zu erstellen.\n\n**Tipp:** Prüfe deinen API-Key in den Einstellungen (Gears Icon oben rechts).`,
             tacticJson: { players: [], cones: [], balls: [], paths: [] }
          };
      }
  };

  const analyzeClub = async (info) => {
      setAgeGroup(info); setPhase('generating_club'); setIsGenerating(true);
      const prompt = isNlzTheme
        ? `Analysiere die pädagogischen und taktischen Kern-Anforderungen für die Altersklasse "${info}" im Verein "${clubName}". Berücksichtige diese Altersklasse extrem professionell für alle weiteren Übungen. Direkt zum Trainer ${trainerName}. Max 70 Wörter.`
        : `Analysiere die taktische DNA und Ausrichtung für das Team "${info}" im Verein "${clubName}". Direkt zum Trainer ${trainerName}. Max 70 Wörter.`;
      try {
          const data = await askAi(prompt);
          const res = data.markdownText || "";
          setClubAnalysis(res); addChatMessage('gerd', res); setPhase('club_analysis');
      } catch (e) { setPhase('club_analysis'); }
      setIsGenerating(false);
  };

  const generateWarmups = async () => {
      setPhase('generating_warmup'); setIsGenerating(true);
      const options = [
          { focus: "Kognition & Handlungsschnelligkeit", title: "1. Kognitives Rondo (Elite)" },
          { focus: "Präzisions-Passspiel & Myelinisierung", title: "2. Myelinisierungs-Passspiel (Pro)" }
      ];
      const results = [];
      const dept = isNlzTheme ? "NLZ" : "Senioren";
      try {
          for (let opt of options) {
              setGerdFeedback(`Berechne Warmup: ${opt.title}...`);
              const data = await askAi(`Generiere Warmup: "${opt.title}". Fokus: ${opt.focus}. Nutze die 5-Punkte-Struktur. KEINE Bulletpoints im Ablauf!`, false, 0.2, dept);
              if (data && data.markdownText) {
                  results.push({ title: opt.title, markdownContent: data.markdownText, tacticJson: data.tacticJson });
              } else {
                  throw new Error(`Ungültige Daten für ${opt.title}`);
              }
          }
          if (results.length > 0) {
              setWarmupOptions(results);
              addChatMessage('gerd', "Warmup-Varianten bereit. Wähle deinen Fokus.");
              setPhase('warmup_options');
          } else {
              throw new Error("Keine Warmup-Optionen generiert.");
          }
      } catch(e) { 
          console.error(e); 
          setGerdFeedback("FEHLER: KI-Intelligence konnte nicht geladen werden.");
          addChatMessage('gerd', "System-Fehler: Die Verbindung zur KI-Core ist unterbrochen. Bitte API-Key und Proxy-Verbindung prüfen.");
          setPhase('intro'); // Go back to start if it fails
      }
      setIsGenerating(false);
  };

  const generateMainDrills = async (fokus) => {
      setDraft(p => ({...p, taktischerFokus: fokus}));
      setPhase('generating_main'); setIsGenerating(true);
      const results = [];
      const topics = [`Variante A: ${fokus} (Inspir. Nagelsmann)`, `Variante B: ${fokus} (Inspir. Klopp)`];
      const dept = isNlzTheme ? "NLZ" : "Senioren";
      try {
          for (let i = 0; i < 2; i++) {
              setGerdFeedback(`Berechne Hauptübung ${i+1}/2...`);
              const data = await askAi(`Hauptübung: "${topics[i]}". Fokus: ${fokus}. Millimetergenaues Kopfkino. Min. 150 Wörter für Ablauf.`, false, 0.2, dept);
              results.push({ title: `${i === 0 ? 'A' : 'B'}. ${fokus} Elite`, markdownContent: data.markdownText, tacticJson: data.tacticJson });
          }
          setMainOptions(results);
          addChatMessage('gerd', `Taktik-Mastering für ${fokus} abgeschlossen.`);
      } catch(e) { console.error(e); }
      setIsGenerating(false); setPhase('main_options');
  };

  const generateCooldown = async (type) => {
      setPhase('generating_cooldown'); setIsGenerating(true);
      const dept = isNlzTheme ? "NLZ" : "Senioren";
      try {
          const data = await askAi(`Generiere Cooldown: "${type}". Fokus: Active Recovery.`, false, 0.2, dept);
          setDraft(p => ({...p, cooldown: { title: `5. Recovery (${type})`, markdownContent: data.markdownText, tacticJson: data.tacticJson }}));
      } catch(e) { }
      setIsGenerating(false); setPhase('summary');
  };

  const generateWeeklyPlan = async () => {
      setPhase('generating_week'); setIsGenerating(true);
      const dept = isNlzTheme ? "NLZ" : "Senioren";
      const prompt = `Du bist Gerd 2.0. Erstelle einen EXKLUSIVEN WOCHENPLAN für das Team "${ageGroup || clubName}".
Fokus: 3 Trainingstage (Montag, Mittwoch, Freitag) + 1 Testspiel am Wochenende gegen ein höherklassiges Team.
Das Ziel ist maximale Transparenz für die Eltern und höchste pädagogische Qualität (B-Jugend Niveau).

Antworte in diesem EXAKTEN Format:
# WOCHENPLAN: [TEAMNAME]
## 📅 ÜBERSICHT
| Tag | Fokus | Details |
|---|---|---|
| Montag | ... | ... |
| Mittwoch | ... | ... |
| Freitag | ... | ... |
| Wochenende | MATCHDAY (Testspiel) | ... gegen [Gegner] |

## 🎙️ STRATEGISCHES BRIEFING
[Beschreibe kurz das Ziel der Woche für die Eltern - ca. 50 Wörter]

## ⚽️ DETAIL-FOKUS DER SESSIONS
**Montag:** [Detaillierter Fokus]
**Mittwoch:** [Detaillierter Fokus]
**Freitag:** [Detaillierter Fokus]
**Matchday:** [Taktische Marschroute gegen den stärkeren Gegner]`;

      try {
          const data = await askAi(prompt, false, 0.3, dept);
          setWeeklyPlanMarkdown(data.markdownText);
          setPhase('weekly_summary');
      } catch (e) { console.error(e); }
      setIsGenerating(false);
  };

  const handleSaveWeeklySchedule = async () => {
      setCloudStatus("Uploading Week...");
      const result = await savePlan({
          team_id: isNlzTheme ? 'youth' : 'seniors',
          title: `Wochenplan: ${ageGroup || clubName}`,
          markdown_content: weeklyPlanMarkdown,
          visibility: 'team_parents'
      });
      if (result.success) {
          setCloudStatus("Wochenplan Live!");
          setGerdFeedback("Wochenplan erfolgreich für Eltern veröffentlicht!");
      }
  };

  const AnalyticalDrillCard = ({ phase, phaseKey, iconName, iconColor, isMainDrill = false }) => {
      if (!phase) return null;
      return (
         <div className={`flex flex-col gap-6 bg-[#0b1324]/50 p-6 md:p-8 md:px-12 rounded-3xl border border-white/10 hover:border-white/20 transition-all group max-w-5xl mx-auto w-full ${isMainDrill ? "bg-gradient-to-br from-[#050914] to-[#0a1128] border-neon/50 shadow-[0_0_50px_rgba(0,243,255,1)]" : ""}`}>
             
             <div className="flex flex-col xl:flex-row gap-8 w-full">
                 <div className="flex-1">
                     <div className="flex items-center gap-4 border-b border-white/10 pb-4 mb-8">
                         <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${isMainDrill ? "bg-neon text-black shadow-[0_0_20px_rgba(0,243,255,0.6)]" : `bg-gradient-to-br ${iconColor}`}`}>
                             <Icon name={iconName} />
                         </div>
                         <h3 className="text-2xl md:text-3xl font-black uppercase tracking-wider text-white">
                             {phase.title}
                         </h3>
                     </div>

                     <div className="text-white/90 space-y-4">
                         <ReactMarkdown components={{
                             h1: ({node, ...props}) => <h1 className="text-2xl font-black text-neon mt-10 mb-6 uppercase tracking-[0.2em] border-b-2 border-neon/30 pb-3 flex items-center gap-4" {...props} />,
                             h2: ({node, ...props}) => <h2 className="text-xl font-bold text-white mt-8 mb-4 uppercase tracking-widest border-l-4 border-neon/50 pl-4" {...props} />,
                             h3: ({node, ...props}) => <h3 className="text-base font-black text-white/50 mt-8 mb-3 uppercase tracking-[0.15em] flex items-center gap-3" {...props} />,
                             p: ({node, ...props}) => <p className="leading-relaxed mb-5 text-lg" {...props} />,
                             li: ({node, ...props}) => <li className="mb-3 list-none flex gap-4 items-start"><div className="w-2 h-2 rounded-full bg-neon mt-2.5 shrink-0 shadow-[0_0_8px_rgba(0,243,255,0.8)]"/><span>{props.children}</span></li>,
                             strong: ({node, ...props}) => <strong className="text-neon font-black" {...props} />,
                             blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-neon/50 pl-6 py-4 italic bg-neon/5 rounded-r-2xl my-8 text-xl font-medium text-white shadow-inner" {...props} />
                         }}>
                             {phase.markdownContent}
                         </ReactMarkdown>
                     </div>
                 </div>

                 {phase.tacticJson && (
                     <div className="xl:w-1/3 w-full shrink-0">
                         <div className="sticky top-6 bg-black/40 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                             <div className="bg-white/5 px-4 py-2 border-b border-white/10 flex items-center justify-between">
                                 <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Tactical Board</span>
                                 <Icon name="layout" size={12} className="text-neon" />
                             </div>
                             <div className="aspect-[4/3] w-full p-2">
                                 <SvgTacticalBoard data={phase.tacticJson} />
                             </div>
                              <div className="p-4 border-t border-white/10 bg-black/20">
                                 <button 
                                    onClick={() => alert("KI-Visualisierung angefordert. GERD generiert nun ein fotorealistisches Bild dieser Übung...")}
                                    className="w-full py-2 bg-neon/10 hover:bg-neon text-neon hover:text-navy border border-neon/30 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                 >
                                    <Icon name="image" size={12} /> KI-Visualisierung generieren
                                 </button>
                              </div>
                         </div>
                     </div>
                 )}
             </div>
         </div>
      );
  };

  const TextInput = ({ placeholder, onSubmit, buttonText }) => {
      const [val, setVal] = useState("");
      return (
          <div className="flex items-center gap-2 mt-4 w-full max-w-xl relative animate-fade-in">
              <input type="text" placeholder={placeholder} value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && val.trim() && onSubmit(val)} className="flex-1 bg-black/40 border border-white/10 rounded-full px-5 py-4 text-sm text-white outline-none focus:border-neon" />
              <button onClick={() => val.trim() && onSubmit(val)} className="absolute right-2 px-4 py-2 bg-neon text-black rounded-full font-black uppercase text-[10px] tracking-widest">{buttonText}</button>
          </div>
      );
  };

  const PillSelect = ({ options, onSelect }) => (
      <div className="flex flex-wrap gap-3 mt-4 animate-fade-in">
          {options.map((opt, i) => (
              <button key={i} onClick={() => onSelect(opt)} className="px-5 py-3 bg-white/5 hover:bg-neon hover:text-black border border-white/10 rounded-full text-xs font-bold uppercase text-white transition-all">
                  {opt}
              </button>
          ))}
      </div>
  );

  const ChatBubble = ({ sender, text, isLoading=false }) => (
      <div className={`flex items-start gap-4 w-full max-w-3xl ${sender === 'coach' ? 'ml-auto flex-row-reverse' : ''} animate-fade-in mt-4`}>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border ${sender === 'coach' ? 'bg-white/10 border-white/20' : 'bg-neon/10 border-neon/30 text-neon'}`}>
              <Icon name={sender === 'coach' ? 'user' : 'cpu'} size={24} className={isLoading ? "animate-pulse" : ""} />
          </div>
          <div className={`p-5 rounded-2xl text-base leading-relaxed ${sender === 'coach' ? 'bg-white/10 text-white rounded-tr-sm' : 'bg-[#0b1324] text-white/90 rounded-tl-sm border border-neon/20'}`}>
              {isLoading ? <div className="italic text-neon animate-pulse flex items-center gap-2"><Icon name="loader" size={16} className="animate-spin" /> Elite Intelligence arbeitet...</div> : 
              <ReactMarkdown components={{
                  p: ({node, ...props}) => <p className="mb-2" {...props} />,
                  li: ({node, ...props}) => <li className="mb-1 list-none flex gap-2 items-start"><div className="w-1.5 h-1.5 rounded-full bg-neon mt-2 shrink-0"/><span>{props.children}</span></li>,
                  strong: ({node, ...props}) => <strong className="text-neon font-bold" {...props} />
              }}>{text}</ReactMarkdown>}
          </div>
      </div>
  );

  const renderFlow = () => {
      if (viewingSavedSession) {
          return (
              <div className="flex flex-col gap-10 mt-6 animate-fade-in w-full">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                     <h2 className="text-3xl font-black uppercase text-white">{viewingSavedSession.title}</h2>
                     <button onClick={() => setViewingSavedSession(null)} className="px-5 py-2 border border-neon text-neon rounded-full text-xs font-black uppercase">Schließen</button>
                  </div>
                  <AnalyticalDrillCard phase={viewingSavedSession.warmup} iconName="thermometer" iconColor="from-neon/20 to-transparent text-neon" isMainDrill={true} />
                  <AnalyticalDrillCard phase={viewingSavedSession.main_drill} iconName="crosshair" iconColor="from-red-500/20 to-transparent text-red-500" isMainDrill={true} />
                  <AnalyticalDrillCard phase={viewingSavedSession.cooldown} iconName="wind" iconColor="from-blue-500/20 to-transparent text-blue-400" isMainDrill={true} />
              </div>
          );
      }

      if (phase === 'summary' || phase === 'weekly_summary') {
          return (
              <div className="flex flex-col gap-10 mt-6 animate-fade-in w-full">
                  <div className="bg-neon/10 border border-neon/30 p-8 rounded-3xl flex flex-col md:flex-row gap-6 items-center">
                     <div className="w-20 h-20 bg-neon/20 rounded-full flex items-center justify-center border border-neon text-neon"><Icon name="check" size={40} /></div>
                     <div className="flex-1">
                        <h3 className="text-2xl font-black text-white uppercase mb-2">{phase === 'summary' ? 'Plan Bereit' : 'Wochenplan Bereit'}</h3>
                        <p className="text-white/80">{clubName} | {phase === 'summary' ? `Fokus: ${draft.taktischerFokus}` : `Zeitraum: Aktuelle Woche`}</p>
                     </div>
                      <div className="flex gap-3">
                         {phase === 'summary' ? (
                            <>
                               <button onClick={saveToHandbuch} className="px-6 py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-black uppercase text-[10px] tracking-widest border border-white/10">Lokal Speichern</button>
                               <button onClick={handleCloudSave} className="px-6 py-4 bg-neon text-black rounded-xl font-black uppercase text-[10px] tracking-widest shadow-[0_0_20px_rgba(0,243,255,0.4)]">
                                  {cloudStatus || "Cloud Sync (Supabase)"}
                               </button>
                            </>
                         ) : (
                            <button onClick={handleSaveWeeklySchedule} className="px-8 py-4 bg-neon text-black rounded-xl font-black uppercase text-xs tracking-widest shadow-[0_0_20px_rgba(0,243,255,0.4)]">
                                {cloudStatus || "Wochenplan Veröffentlichen"}
                            </button>
                         )}
                      </div>
                  </div>
                  
                  {phase === 'summary' ? (
                    <>
                        <AnalyticalDrillCard phase={draft.warmup} iconName="thermometer" iconColor="from-neon/20 to-transparent text-neon" isMainDrill={true} />
                        <AnalyticalDrillCard phase={draft.main_drill} iconName="crosshair" iconColor="from-red-500/20 to-transparent text-red-500" isMainDrill={true} />
                        <AnalyticalDrillCard phase={draft.cooldown} iconName="wind" iconColor="from-blue-500/20 to-transparent text-blue-400" isMainDrill={true} />
                    </>
                  ) : (
                    <div className="bg-[#0b1324]/50 p-10 rounded-3xl border border-white/10 max-w-5xl mx-auto w-full text-white">
                        <ReactMarkdown components={{
                            h1: ({node, ...props}) => <h1 className="text-3xl font-black text-neon mb-8 uppercase tracking-widest border-b border-neon/30 pb-4" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-xl font-bold text-white mt-10 mb-4 uppercase tracking-widest border-l-4 border-neon/50 pl-4" {...props} />,
                            table: ({node, ...props}) => <div className="overflow-x-auto my-8"><table className="w-full border-collapse border border-white/10" {...props} /></div>,
                            th: ({node, ...props}) => <th className="bg-white/5 border border-white/10 p-4 text-left font-black uppercase text-[10px] tracking-widest text-neon" {...props} />,
                            td: ({node, ...props}) => <td className="border border-white/10 p-4 text-sm" {...props} />,
                            p: ({node, ...props}) => <p className="mb-4 leading-relaxed opacity-90" {...props} />,
                            strong: ({node, ...props}) => <strong className="text-neon" {...props} />,
                        }}>
                             {weeklyPlanMarkdown}
                        </ReactMarkdown>
                    </div>
                  )}
              </div>
          );
      }

      return (
      <div className="w-full max-w-5xl mx-auto mt-4 bg-[#050914]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl flex flex-col min-h-[700px]">
          <div className="relative z-10 flex flex-col flex-1 overflow-y-auto pr-2 custom-scrollbar pb-10">
              {phase === 'handbuch_or_new' ? (
                  <div className="flex flex-col gap-10 mt-6 animate-fade-in w-full pb-20">
                      <div className="bg-[#0b1324]/80 backdrop-blur-xl border border-neon/30 p-12 rounded-[40px] flex flex-col items-center justify-center text-center max-w-4xl mx-auto shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                          <div className="w-24 h-24 bg-neon/10 border border-neon/30 rounded-3xl flex items-center justify-center text-neon mb-6">
                              <Icon name="cpu" size={48} />
                          </div>
                          <h2 className="text-4xl font-black text-white uppercase tracking-[0.2em] mb-4">Gerd 2.0 Intelligence</h2>
                          <p className="text-white/50 text-xs uppercase tracking-widest mb-10">Wähle deinen Planungs-Modus</p>
                          
                          <div className="flex flex-col md:flex-row gap-6 w-full max-w-xl">
                              <button 
                                onClick={() => { setPhase('intro'); setPlanningMode('single'); }} 
                                className="flex-1 px-8 py-8 bg-white/5 hover:bg-neon hover:text-black border border-white/10 hover:border-neon rounded-2xl font-black uppercase text-sm tracking-widest transition-all group flex flex-col items-center gap-4"
                              >
                                <Icon name="target" size={32} className="group-hover:scale-110 transition-transform" />
                                <span>Einzeltraining</span>
                              </button>
                              
                              <button 
                                id="wochenplaner-btn"
                                onClick={() => { setPhase('intro'); setPlanningMode('week'); }} 
                                className="flex-1 px-8 py-8 bg-neon/10 hover:bg-neon hover:text-black border border-neon/30 hover:border-neon rounded-2xl font-black uppercase text-sm tracking-widest transition-all group text-neon flex flex-col items-center gap-4"
                              >
                                <Icon name="calendar" size={32} className="group-hover:scale-110 transition-transform text-inherit" />
                                <span>Wochenplaner</span>
                              </button>
                          </div>

                          {handbuch.length > 0 && (
                              <div className="w-full mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
                                 {handbuch.map(h => (
                                    <div key={h.id} className="bg-white/5 p-4 rounded-xl border border-white/10 flex justify-between items-center group hover:bg-white/10 transition-colors cursor-pointer" onClick={() => setViewingSavedSession(h)}>
                                       <div className="text-left">
                                          <div className="text-[10px] text-neon font-black uppercase tracking-widest">{h.club}</div>
                                          <div className="text-xs text-white font-bold">{h.title}</div>
                                       </div>
                                       <Icon name="chevron-right" size={16} className="text-white/20 group-hover:text-neon transition-colors" />
                                    </div>
                                 ))}
                              </div>
                          )}
                      </div>
                  </div>
              ) : (
                  <div className="flex flex-col gap-6">
                      {chatHistory.map((msg, i) => <ChatBubble key={i} sender={msg.sender} text={msg.text} />)}
                      {isGenerating && <ChatBubble sender="gerd" text="" isLoading={true} />}
                      <div ref={endRef} className="h-4" />
                  </div>
              )}
          </div>
          
          {phase !== 'handbuch_or_new' && !isGenerating && (
              <div className="pt-6 border-t border-white/10">
                  {phase === 'intro' && <TextInput placeholder="Dein Name..." onSubmit={(n) => { 
                      setTrainerName(n); 
                      addChatMessage('coach', n); 
                      setPhase('verein'); 
                      addChatMessage('gerd', `Verstanden, Coach ${n}. Für welche Altersklasse oder Mannschaft planen wir heute? (z.B. ${isNlzTheme ? 'U14, U19' : '1. Herren, Profis'})`); 
                  }} buttonText="Senden" />}
                  {phase === 'verein' && <TextInput placeholder={isNlzTheme ? "Altersklasse (z.B. U14)..." : "Mannschaft (z.B. 1. Herren)..."} onSubmit={(c) => { addChatMessage('coach', c); analyzeClub(c); }} buttonText="Senden" />}
                  {phase === 'club_analysis' && (
                       <button 
                            onClick={() => { 
                                addChatMessage('coach', "Füge Pläne hinzu"); 
                                if (planningMode === 'week') generateWeeklyPlan();
                                else generateWarmups(); 
                            }} 
                            className="px-6 py-3 bg-neon text-black rounded-full font-black uppercase text-xs"
                        >
                            {planningMode === 'week' ? 'Wochenplan Generieren' : 'Warmup Generieren'}
                       </button>
                   )}
                  {phase === 'warmup_options' && <PillSelect options={warmupOptions.map(o => o.title)} onSelect={(t) => { setDraft(p => ({...p, warmup: warmupOptions.find(o => o.title === t)})); addChatMessage('coach', t); setPhase('focus_selection'); }} />}
                  {phase === 'focus_selection' && <TextInput placeholder="Fokus..." onSubmit={(f) => { addChatMessage('coach', f); generateMainDrills(f); }} buttonText="Generieren" />}
                  {phase === 'main_options' && <PillSelect options={mainOptions.map(o => o.title)} onSelect={(t) => { setDraft(p => ({...p, main_drill: mainOptions.find(o => o.title === t)})); addChatMessage('coach', t); setPhase('cooldown_selection'); }} />}
                  {phase === 'cooldown_selection' && <PillSelect options={["Blackroll", "Auslaufen", "Tiki-Taka"]} onSelect={(v) => { addChatMessage('coach', v); generateCooldown(v); }} />}
              </div>
          )}
      </div>
      );
  };

  return (
    <div className={`flex flex-col gap-8 mx-auto w-full max-w-[1200px] pb-32 ${isNlzTheme ? "text-white" : ""}`}>
      <div className="text-center mt-8 cursor-pointer" onClick={() => setPhase('handbuch_or_new')}>
         <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon via-white to-neon uppercase tracking-tighter">GERD 2.0: Elite Hub</h1>
      </div>
      {renderFlow()}
    </div>
  );
};
export default TacticalHub;
