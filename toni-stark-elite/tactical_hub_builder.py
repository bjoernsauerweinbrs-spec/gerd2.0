import json
import os

# Update board components directly in the builder for sync consistency
BOARD_COMPONENTS = """
  const AnalyticalDrillCard = ({ phase, phaseKey, iconName, iconColor, isMainDrill = false }) => {
      if (!phase) return null;
      return (
         <div className={`flex flex-col gap-6 bg-[#0b1324]/50 p-6 md:p-8 md:px-12 rounded-3xl border border-white/10 hover:border-white/20 transition-all group max-w-5xl mx-auto w-full ${isMainDrill ? "bg-gradient-to-br from-[#050914] to-[#0a1128] border-neon/50 shadow-[0_0_50px_rgba(0,243,255,1)]" : ""}`}>
             
             <div className="flex flex-col w-full">
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
         </div>
      );
  };
"""

REACT_START = """import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import Icon from './Icon';
import { getAiConfig } from '../utils/aiConfig';
import mermaid from 'mermaid';

mermaid.initialize({ startOnLoad: false, theme: 'dark' });

const GERD_MASTER_PROMPT = `Du bist „Gerd 2.0“, der weltweit führende High-Performance Director und Taktik-Mentor. Dein Analyse- und Beratungsniveau entspricht der absoluten Weltspitze (Nagelsmann/Klopp). Du kommunizierst im direkten, hochprofessionellen Dialog mit dem Trainer auf Augenhöhe.

DAS FORMAT (CHAT-FIRST & TEXT-ONLY):
Du bist ein Chat-Assistent. Du generierst KEINEN Code, KEINE JSON-Daten und KEINE Bilder/SVGs. Du nutzt sauberes Markdown (Fettungen, Listen, Absätze) für perfekte Lesbarkeit. Deine Beschreibungen müssen so millimetergenau sein, dass im Kopf des Trainers sofort ein visuelles „Kopfkino“ entsteht.

DIE ANTI-FAULHEITS-REGEL (STRIKT):
Es ist dir strengstens untersagt, hohle Floskeln ("Macht Druck") oder zu kurze Stichpunkte zu verwenden. Jede Phase der Übung MUSS in detaillierten, vollständigen Sätzen beschrieben werden. Ein zu kurzer Text ist ein Systemversagen. KEINE BULLET POINTS in den Beschreibungen! Nutze Fließtext für Kopfkino.

PFLICHT-STRUKTUR FÜR JEDE TRAININGSÜBUNG:
1. 🎙️ DAS BRIEFING: Ein messerscharfer Satz zum Kernziel.
2. 📐 KOPFKINO: DER AUFBAU: Exakte Meter-Maße, Positionierung von Hütchen/Toren/Zonen, Startpositionen aller Spieler.
3. ⚙️ DER ABLAUF: Chronologische Beschreibung (Min. 5 Sätze, ca. 150 Wörter). Nutze Elite-Vokabular (Dritter Mann, Gegenpressing-Trigger).
4. 👁️ MICRO-COACHING: Exakt 3 hochspezifische Detail-Punkte (Körperstellung, Scanning-Rate, Passtiming/Fußstellung).
5. 🧠 WISSENSCHAFTLICHER NUTZEN: Begründung aus neurologischer/physischer Sicht (z.B. Perception-Action-Coupling).`;


const TacticalHub = ({ truthObject, setTruthObject, activeRole, isNlzTheme }) => {
  const { activeKey, endpoint, modelString, aiProvider } = getAiConfig();
  
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
  const [clubAnalysis, setClubAnalysis] = useState("");
  const [targetDay, setTargetDay] = useState("Mittwoch"); 
  
  // Drill Options
  const [warmupOptions, setWarmupOptions] = useState([]);
  const [mainOptions, setMainOptions] = useState([]);
  
  // Final Draft
  const [draft, setDraft] = useState({ warmup: null, main_drill: null, cooldown: null, taktischerFokus: "" });
  const [cooldownType, setCooldownType] = useState("");
  
  const handbuch = truthObject?.training_handbuch || [];

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

  const askAi = async (promptText, expectJson = false, temp = 0.2) => {
      const isOllama = aiProvider === "ollama" || (endpoint && endpoint.includes("11434"));
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300000); 

      let requestBody;
      let requestHeaders = { "Content-Type": "application/json" };

      if (aiProvider === 'gemini') {
          requestBody = JSON.stringify({
              contents: [{ role: "user", parts: [{ text: promptText }] }],
              systemInstruction: { role: "system", parts: [{ text: GERD_MASTER_PROMPT }] },
              generationConfig: { temperature: temp }
          });
      } else if (isOllama) {
          requestBody = JSON.stringify({
              model: modelString || "llama3",
              messages: [{ role: "system", content: GERD_MASTER_PROMPT }, { role: "user", content: promptText }],
              stream: false,
              options: { temperature: temp }
          });
      } else {
          requestHeaders["Authorization"] = `Bearer ${activeKey}`;
          requestBody = JSON.stringify({
              model: modelString,
              messages: [{ role: "system", content: GERD_MASTER_PROMPT }, { role: "user", content: promptText }],
              temperature: temp
          });
      }
      
      try {
          const res = await fetch(endpoint, { method: "POST", headers: requestHeaders, body: requestBody, signal: controller.signal });
          clearTimeout(timeoutId);
          const data = await res.json();
          return data.text || data.message?.content || data.choices?.[0]?.message?.content || "";
      } catch (err) {
          clearTimeout(timeoutId);
          throw err;
      }
  };

  const analyzeClub = async (club) => {
      setClubName(club); setPhase('generating_club'); setIsGenerating(true);
      const prompt = `Analysiere die taktische DNA von "${club}". RB-DNA, Gegenpressing oder Positionsspiel? Max 70 Wörter. Direkt zum Trainer ${trainerName}.`;
      try {
          const res = await askAi(prompt);
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
      try {
          for (let opt of options) {
              setGerdFeedback(`Berechne Warmup: ${opt.title}...`);
              const res = await askAi(`Generiere Warmup: "${opt.title}". Fokus: ${opt.focus}. Nutze die 5-Punkte-Struktur. KEINE Bulletpoints im Ablauf!`);
              results.push({ title: opt.title, markdownContent: res });
          }
          setWarmupOptions(results);
          addChatMessage('gerd', "Warmup-Varianten bereit. Wähle deinen Fokus.");
      } catch(e) { console.error(e); }
      setIsGenerating(false); setPhase('warmup_options');
  };

  const generateMainDrills = async (fokus) => {
      setDraft(p => ({...p, taktischerFokus: fokus}));
      setPhase('generating_main'); setIsGenerating(true);
      const results = [];
      const topics = [`Variante A: ${fokus} (Inspir. Nagelsmann)`, `Variante B: ${fokus} (Inspir. Klopp)`];
      try {
          for (let i = 0; i < 2; i++) {
              setGerdFeedback(`Berechne Hauptübung ${i+1}/2...`);
              const res = await askAi(`Hauptübung: "${topics[i]}". Fokus: ${fokus}. Millimetergenaues Kopfkino. Min. 150 Wörter für Ablauf.`);
              results.push({ title: `${i === 0 ? 'A' : 'B'}. ${fokus} Elite`, markdownContent: res });
          }
          setMainOptions(results);
          addChatMessage('gerd', `Taktik-Mastering für ${fokus} abgeschlossen.`);
      } catch(e) { console.error(e); }
      setIsGenerating(false); setPhase('main_options');
  };

  const generateCooldown = async (type) => {
      setPhase('generating_cooldown'); setIsGenerating(true);
      try {
          const res = await askAi(`Generiere Cooldown: "${type}". Fokus: Active Recovery.`);
          setDraft(p => ({...p, cooldown: { title: `5. Recovery (${type})`, markdownContent: res }}));
      } catch(e) { }
      setIsGenerating(false); setPhase('summary');
  };
"""

JS_COMPONENTS_AND_RENDER = """
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

      if (phase === 'summary') {
          return (
              <div className="flex flex-col gap-10 mt-6 animate-fade-in w-full">
                  <div className="bg-neon/10 border border-neon/30 p-8 rounded-3xl flex flex-col md:flex-row gap-6 items-center">
                     <div className="w-20 h-20 bg-neon/20 rounded-full flex items-center justify-center border border-neon text-neon"><Icon name="check" size={40} /></div>
                     <div className="flex-1">
                        <h3 className="text-2xl font-black text-white uppercase mb-2">Plan Bereit</h3>
                        <p className="text-white/80">{clubName} | Fokus: {draft.taktischerFokus}</p>
                     </div>
                     <button onClick={saveToHandbuch} className="px-6 py-4 bg-neon text-black rounded-xl font-black uppercase">Speichern</button>
                  </div>
                  <AnalyticalDrillCard phase={draft.warmup} iconName="thermometer" iconColor="from-neon/20 to-transparent text-neon" isMainDrill={true} />
                  <AnalyticalDrillCard phase={draft.main_drill} iconName="crosshair" iconColor="from-red-500/20 to-transparent text-red-500" isMainDrill={true} />
                  <AnalyticalDrillCard phase={draft.cooldown} iconName="wind" iconColor="from-blue-500/20 to-transparent text-blue-400" isMainDrill={true} />
              </div>
          );
      }

      return (
      <div className="w-full max-w-5xl mx-auto mt-4 bg-[#050914]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl flex flex-col min-h-[700px]">
          <div className="relative z-10 flex flex-col flex-1 overflow-y-auto pr-2 custom-scrollbar pb-10">
              {phase === 'handbuch_or_new' ? (
                  <div className="flex flex-col gap-8 items-center justify-center h-full animate-fade-in mt-10">
                      <div className="w-24 h-24 bg-neon/10 border border-neon/30 rounded-3xl flex items-center justify-center text-neon">
                          <Icon name="cpu" size={48} />
                      </div>
                      <h2 className="text-3xl font-black text-white uppercase tracking-widest">Gerd 2.0 Intelligence</h2>
                      <button onClick={() => setPhase('intro')} className="px-8 py-4 bg-neon text-black rounded-full font-black uppercase">Neue Session</button>
                      {handbuch.length > 0 && (
                          <div className="w-full mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
                             {handbuch.map(h => (
                                 <div key={h.id} onClick={() => setViewingSavedSession(h)} className="bg-white/5 border border-white/10 p-5 rounded-xl hover:border-neon cursor-pointer transition-all">
                                     <div className="text-neon text-[10px] uppercase mb-1">{h.date}</div>
                                     <div className="text-white font-bold">{h.title}</div>
                                 </div>
                             ))}
                          </div>
                      )}
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
                  {phase === 'intro' && <TextInput placeholder="Dein Name..." onSubmit={(n) => { setTrainerName(n); addChatMessage('coach', n); setPhase('verein'); }} buttonText="Senden" />}
                  {phase === 'verein' && <TextInput placeholder="Verein..." onSubmit={(c) => { addChatMessage('coach', c); analyzeClub(c); }} buttonText="Senden" />}
                  {phase === 'club_analysis' && <button onClick={() => { addChatMessage('coach', "Start"); generateWarmups(); }} className="px-6 py-3 bg-neon text-black rounded-full font-black uppercase text-xs">Warmup Generieren</button>}
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
"""

final = REACT_START + BOARD_COMPONENTS + JS_COMPONENTS_AND_RENDER

with open('src/components/TacticalHub.jsx', 'w') as f:
    f.write(final)

print("Elite Modular Rewrite Complete!")

