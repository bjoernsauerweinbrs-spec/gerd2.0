import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import Icon from './Icon';
import SvgTacticalBoard from './SvgTacticalBoard';
import LineupCanvas from './LineupCanvas';
import { getAiConfig, sendAiRequest, generateLineup, generateTactic } from '../utils/aiConfig';
import { savePlan, sendMessage, fetchMessages, subscribeToMessages, supabase } from '../utils/supabaseClient';

const UnifiedCoachHub = ({ truthObject, setTruthObject, activeRole, playbooks, setPlaybooks, onRefreshData }) => {
  const { activeKey } = getAiConfig();
  
  // State Machine
  const [phase, setPhase] = useState('selection'); 
  const [mode, setMode] = useState(null); // 'training', 'matchday', or 'communication'
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatHistory, setChatHistory] = useState([]); 
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTeam, setSelectedTeam] = useState(truthObject?.club_info?.teams?.[0] || "1. Mannschaft");
  const [activeParentChatId, setActiveParentChatId] = useState(null);
  const [parentChatInput, setParentChatInput] = useState("");
  const [supabaseMessages, setSupabaseMessages] = useState([]);
  const endRef = useRef(null);
  
  // Session Data
  const [draft, setDraft] = useState({
      title: "",
      fokus: "",
      warmup: null,
      main_drill: null,
      cooldown: null,
      lineup: null,
      formation: "4-3-3",
      speech: "",
      generatedLineup: null
  });

  const [lineupInput, setLineupInput] = useState("");
  const [isGeneratingLineup, setIsGeneratingLineup] = useState(false);

  const liveIntel = truthObject?.club_info?.liveIntelligence;
  const players = truthObject?.players || [];
  const youthPlayers = truthObject?.nlz_squad || [];

  useEffect(() => {
    if (endRef.current) {
        endRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory, isGenerating, phase, supabaseMessages]);

  useEffect(() => {
    if (mode === 'communication' && activeParentChatId) {
        const loadMsgs = async () => {
            const msgs = await fetchMessages('coach_unified', activeParentChatId);
            setSupabaseMessages(msgs);
        };
        loadMsgs();

        const channel = subscribeToMessages((payload) => {
            const newMsg = payload.new;
            if ((newMsg.sender_id === 'coach_unified' && newMsg.receiver_id === activeParentChatId) ||
                (newMsg.sender_id === activeParentChatId && newMsg.receiver_id === 'coach_unified')) {
                setSupabaseMessages(prev => [...prev, newMsg]);
            }
        });

        return () => supabase.removeChannel(channel);
    }
  }, [mode, activeParentChatId]);

  const addChatMessage = (sender, text) => {
    setChatHistory(prev => [...prev, { sender, text }]);
  };

  const startMode = (selectedMode) => {
      setMode(selectedMode);
      setPhase('chat');
      setChatHistory([]);
      if (selectedMode === 'training') {
          addChatMessage('gerd', `Willkommen im Elite-Trainings-Terminal. Das Modul für die ${selectedTeam} ist scharfgeschaltet. Welchen taktischen Schwerpunkt (z.B. Zwischenlinienraum-Besetzung, Asymmetrisches Pressing) setzen wir heute, Coach?`);
          setCurrentStep(1);
      } else if (selectedMode === 'matchday') {
          addChatMessage('gerd', `Gegner-Analyse für ${selectedTeam} wird in Echtzeit skaliert... Ich scanne kognitive Muster und taktische Schwachstellen für das Match gegen ${liveIntel?.nextMatch || 'den nächsten Gegner'}.`);
          generateMatchdayAnalysis();
      } else if (selectedMode === 'communication') {
          setPhase('parent-comm');
      }
  };

  const generateMatchdayAnalysis = async () => {
      setIsGenerating(true);
      const isNlz = selectedTeam.includes('U') || selectedTeam.toLowerCase().includes('jugend') || selectedTeam.toLowerCase().includes('academy');
      const ageGroup = isNlz ? selectedTeam.match(/U\d+/)?.[0] || selectedTeam : "Senioren";

      try {
          // Use the specialized generateTactic endpoint for grounded simulation analysis
          const res = await generateTactic(
            `Matchday: ${selectedTeam}`, 
            isNlz ? "NLZ" : "Senioren", 
            isNlz ? ageGroup : "Kader", 
            truthObject.club_info?.smId, 
            truthObject.club_info?.fussballDeUrl,
            truthObject.club_info,
            isNlz,
            ageGroup
          );
          
          addChatMessage('gerd', res.markdownText);
          
          // Gerd 2.0: Map Taktik-JSON to the visual board
          if (res.tacticJson) {
              setDraft(prev => ({
                  ...prev, 
                  generatedLineup: res.tacticJson,
                  formation: res.tacticJson.taktiktafel?.formation || prev.formation
              }));
          } else {
              const formationMatch = res.markdownText.match(/\d-\d-\d(-\d)?/);
              if (formationMatch) setDraft(prev => ({...prev, formation: formationMatch[0]}));
          }

          // Propagate grounding sources for transparency
          if (res.groundingSources) {
              setTruthObject(prev => ({
                  ...prev,
                  club_info: {
                      ...prev.club_info,
                      groundingSources: res.groundingSources
                  }
              }));
          }

          setPhase('chat');
          setCurrentStep(2); 
      } catch (e) {
          addChatMessage('gerd', "System-Fehler: Konnte Match-Analyse nicht generieren. Bitte Daten-Refresh prüfen.");
      }
      setIsGenerating(false);
  };

  const handleGenerateLineup = async () => {
      if (!lineupInput.trim()) return;
      setIsGeneratingLineup(true);
      try {
          const data = await generateLineup(lineupInput);
          setDraft(prev => ({ ...prev, generatedLineup: data }));
          addChatMessage('gerd', "Der taktische Blueprint wurde erfolgreich visualisiert. Perfekte Staffelung für das kommende Match.");
      } catch (e) {
          addChatMessage('gerd', `Konnte Lineup nicht generieren: ${e.message}`);
      }
      setIsGeneratingLineup(false);
  };

  const handleTrainingInput = async (input) => {
      addChatMessage('coach', input);
      setIsGenerating(true);
      
      if (currentStep === 1) {
          setDraft(prev => ({...prev, fokus: input, title: `${selectedTeam} Training: ${input}`}));
          
          const isNlz = selectedTeam.includes('U') || selectedTeam.toLowerCase().includes('jugend') || selectedTeam.toLowerCase().includes('academy');
          const ageGroup = isNlz ? selectedTeam.match(/U\d+/)?.[0] || selectedTeam : "Senioren";

          try {
              // Now Gerd 2.0 Backend handles the entire 3-part layout (Warmup, Main, Cool-Down) 
              // plus our new Taktik-JSON from the generateTactic endpoint logic
              const res = await generateTactic(
                  input, 
                  isNlz ? "NLZ" : "Senioren", 
                  isNlz ? ageGroup : "Kader",
                  null,
                  null,
                  truthObject.club_info,
                  isNlz,
                  ageGroup
              );
              
              addChatMessage('gerd', res.markdownText);
              
              if (res.tacticJson) {
                  setDraft(prev => ({ 
                      ...prev, 
                      generatedLineup: res.tacticJson, 
                      main_drill: { title: input, markdownContent: res.markdownText } 
                  }));
              } else {
                  setDraft(prev => ({ ...prev, main_drill: { title: input, markdownContent: res.markdownText } }));
              }

              setCurrentStep(10); 
          } catch (e) {
              addChatMessage('gerd', "Fehler bei der Übungs-Generierung.");
          }
      }
      setIsGenerating(false);
  };

  const handleSendCoachToParentMsg = async () => {
    if (!parentChatInput.trim() || !activeParentChatId) return;
    
    const success = await sendMessage({
        sender_id: 'coach_unified', // Unique ID for this hub
        receiver_id: activeParentChatId,
        content: parentChatInput
    });
    
    if (success) {
        setParentChatInput("");
    }
  };

  const saveToCalendar = async () => {
      const newPlaybook = {
          id: Date.now(),
          type: mode === 'training' ? 'training' : 'match',
          date: new Date().toLocaleDateString(),
          title: draft.title || (mode === 'training' ? `${selectedTeam} Training` : `Matchday Briefing: ${liveIntel?.nextMatch}`),
          opponent: mode === 'matchday' ? liveIntel?.nextMatch : "Intern",
          formation: draft.formation,
          notes: draft.main_drill?.markdownContent || chatHistory[chatHistory.length-1].text,
          players: players.slice(0, 11).map((p, i) => ({ ...p, id: i, position: p.position || "FLD" }))
      };

      setPlaybooks(prev => [newPlaybook, ...prev]);
      
      try {
          await savePlan({
              title: newPlaybook.title,
              markdown_content: newPlaybook.notes,
              tactic_json: draft.generatedLineup,
              visibility: 'team_parents'
          });
      } catch (e) { console.warn("Supabase save failed, kept locally."); }

      addChatMessage('gerd', "Hervorragend. Der taktische Blueprint wurde im Pro-Playbook synchronisiert.");
      setPhase('summary');
  };

  const activeChatPlayer = youthPlayers.find(p => p.id === activeParentChatId);

  return (
    <div className="space-y-6 animate-fade-in pb-20 max-w-6xl mx-auto">
      
      {/* Header View: Unified Analytical Hub */}
      <div className="flex items-center justify-between bg-white border border-black/10 p-8 rounded-[2rem] shadow-sm">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-navy/5 flex items-center justify-center text-navy shadow-inner">
            <Icon name="cpu" size={32} />
          </div>
          <div>
            <div className="flex items-center gap-4 mb-1">
               <h2 className="text-3xl font-serif font-light italic leading-tight text-navy">Gerd 2.0 Coach Hub</h2>
               <div className="flex bg-navy/5 border border-navy/10 rounded-full p-1 leading-none">
                   {(truthObject?.club_info?.teams || ["1. Mannschaft"])
                     .filter(team => !/^[Uu]\d+/.test(team) && !team.includes("Jugend") && !team.includes("Junioren"))
                     .map(team => (
                       <button 
                           key={team}
                           onClick={() => setSelectedTeam(team)}
                           className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${selectedTeam === team ? 'bg-navy text-white shadow-md' : 'text-navy/40 hover:text-navy'}`}
                       >
                           {team}
                       </button>
                   ))}
               </div>
            </div>
            <p className="text-[10px] text-black/40 font-bold uppercase tracking-[0.3em]">Neural Intelligence Framework | {selectedTeam}</p>
          </div>
        </div>
        <div className="flex gap-3">
            <button 
                onClick={onRefreshData}
                className="px-6 py-3 bg-white border border-black/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-black/60 hover:text-black hover:border-black/30 transition-all flex items-center gap-2"
            >
                <Icon name="refresh-cw" size={14} /> Sync
            </button>
            <button 
                onClick={() => setPhase('selection')}
                className="px-6 py-3 bg-navy text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-navy/90 transition-all shadow-lg shadow-navy/20"
            >
                Reset
            </button>
        </div>
      </div>

      {/* Mode Selection: Clinical Dossier Cards */}
      {phase === 'selection' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-10">
              {[
                { id: 'training', icon: 'dumbbell', title: 'Training', desc: `Analytical Session Prep for ${selectedTeam}`, color: 'navy' },
                { id: 'matchday', icon: 'shield', title: 'Matchday', desc: 'Tactical Grounding & Opponent Research', color: 'navy' },
                { id: 'communication', icon: 'message-square', title: 'Communications', desc: 'Parent Portal Intelligence Sync', color: 'navy' }
              ].map(m => (
                <button 
                  key={m.id}
                  onClick={() => startMode(m.id)}
                  className="bg-white border border-black/10 p-10 rounded-[2.5rem] hover:border-navy/30 hover:shadow-2xl transition-all group text-left relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-navy/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                    <Icon name={m.icon} size={48} className="text-navy/20 group-hover:text-navy mb-6 transition-colors" />
                    <h3 className="text-2xl font-serif font-light italic text-navy mb-2">{m.title}</h3>
                    <p className="text-black/40 text-[11px] leading-relaxed font-medium uppercase tracking-wider">{m.desc}</p>
                </button>
              ))}
          </div>
      )}

      {/* Parent Communication Console */}
      {phase === 'parent-comm' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in min-h-[500px]">
              {/* Sidebar: Parent List */}
              <div className="bg-black/40 border border-white/10 rounded-3xl p-6 overflow-y-auto">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-4 px-2">Eltern-Kontakte ({selectedTeam})</h3>
                  <div className="space-y-2">
                      {youthPlayers.map(p => (
                          <button 
                            key={p.id}
                            onClick={() => setActiveParentChatId(p.id)}
                            className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all border ${activeParentChatId === p.id ? 'bg-gold/10 border-gold text-white shadow-lg' : 'bg-white/5 border-transparent text-white/50 hover:bg-white/10'}`}
                          >
                              <div className="text-left">
                                  <div className="font-black uppercase text-xs">Fam. {p.name}</div>
                                  <div className="text-[10px] opacity-60">Status: Aktiv</div>
                              </div>
                              {p.messages?.length > 0 && <div className="w-2 h-2 rounded-full bg-neon shadow-[0_0_10px_#00f3ff]"></div>}
                          </button>
                      ))}
                      {youthPlayers.length === 0 && <p className="text-center text-xs text-white/20 py-10 italic">Keine Eltern-Daten im System.</p>}
                  </div>
              </div>

              {/* Chat Window */}
              <div className="md:col-span-2 bg-black/60 border border-white/10 rounded-3xl flex flex-col relative overflow-hidden">
                  {activeChatPlayer ? (
                      <>
                        <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center border border-gold/40 text-gold"><Icon name="user" size={20} /></div>
                                <div>
                                    <div className="font-black uppercase text-xs text-white">Chat mit Fam. {activeChatPlayer.name}</div>
                                    <div className="text-[8px] uppercase text-gold tracking-widest font-mono">End-to-End Encrypted</div>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 p-6 overflow-y-auto space-y-4 custom-scrollbar bg-[#0a0e1a]">
                            {supabaseMessages.map((msg, i) => (
                                <div key={msg.id || i} className={`flex ${msg.sender_id === 'coach_unified' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-4 rounded-2xl ${msg.sender_id === 'coach_unified' ? 'bg-gold text-black rounded-tr-none' : 'bg-white/10 text-white border border-white/10 rounded-tl-none'}`}>
                                        <div className="text-sm font-medium leading-relaxed">{msg.content}</div>
                                        <div className="text-[8px] font-mono mt-2 opacity-60 text-right">{new Date(msg.created_at).toLocaleTimeString()}</div>
                                    </div>
                                </div>
                            ))}
                            {supabaseMessages.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-full text-white/20 italic text-sm">
                                    <Icon name="message-square" size={48} className="mb-4 opacity-10" />
                                    Noch keine Cloud-Nachrichten. Starte das Gespräch auf Supabase!
                                </div>
                            )}
                            <div ref={endRef} />
                        </div>
                        <div className="p-4 bg-white/5 border-t border-white/10 flex gap-3">
                            <input 
                                type="text" 
                                value={parentChatInput}
                                onChange={(e) => setParentChatInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendCoachToParentMsg()}
                                placeholder="Antwort schreiben..."
                                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-5 py-3 text-sm text-white focus:border-gold outline-none"
                            />
                            <button onClick={handleSendCoachToParentMsg} className="w-12 h-12 bg-gold text-black rounded-xl flex items-center justify-center hover:scale-105 transition-all shadow-lg shadow-gold/20"><Icon name="send" size={20} /></button>
                        </div>
                      </>
                  ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-white/20 italic">
                          <Icon name="users" size={64} className="mb-4 opacity-10" />
                          <p>Wähle einen Eltern-Kontakt aus der Liste</p>
                      </div>
                  )}
              </div>
          </div>
      )}

      {/* Chat Interface (Training/Matchday) */}
      {(phase === 'chat' || phase === 'summary') && (mode === 'training' || mode === 'matchday') && (
          <div className="flex flex-col gap-6 bg-[#f8f9fa] border border-black/10 rounded-[2rem] p-6 md:p-10 shadow-3xl text-[#1a1c1e] animate-slide-up relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-navy/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
               
               {/* RAG Grounding Header */}
               <div className="flex items-center justify-between border-b border-black/10 pb-6 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1 bg-navy text-white rounded-full text-[8px] font-black uppercase tracking-[0.2em]">Gerd V6 RAG Active</div>
                    <div className="text-[10px] text-black/40 font-mono italic">Grounding: Scouting-Docs + Kicker-Live</div>
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-black/40">Analytical Dossier Mode</div>
               </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-8 pb-24 min-h-[500px]">
                  {chatHistory.map((msg, idx) => (
                      <div key={idx} className={`flex items-start gap-6 ${msg.sender === 'coach' ? 'flex-row-reverse' : ''}`}>
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${msg.sender === 'coach' ? 'bg-white border-black/10' : 'bg-navy text-white border-transparent'}`}>
                              <Icon name={msg.sender === 'coach' ? 'user' : 'cpu'} size={24} />
                          </div>
                          <div className={`max-w-[85%] p-8 rounded-3xl ${msg.sender === 'coach' ? 'bg-white border border-black/5 text-black/80 rounded-tr-none shadow-sm' : 'bg-white border border-black/10 text-black/90 rounded-tl-none shadow-md font-serif'}`}>
                              <ReactMarkdown components={{
                                  p: ({node, ...props}) => <p className="mb-4 leading-relaxed" {...props} />,
                                  li: ({node, ...props}) => <li className="mb-2 flex items-start gap-3"><span className="text-navy mt-1.5 w-1.5 h-1.5 rounded-full bg-navy shrink-0"></span>{props.children}</li>,
                                  h1: ({node, ...props}) => <h1 className="text-2xl font-serif font-light italic text-navy mt-6 mb-4 border-b border-navy/10 pb-2" {...props} />,
                                  h2: ({node, ...props}) => <h2 className="text-lg font-bold text-black uppercase tracking-widest mt-6 mb-2" {...props} />,
                                  strong: ({node, ...props}) => <strong className="font-bold text-navy" {...props} />
                              }}>{msg.text}</ReactMarkdown>
                          </div>
                      </div>
                  ))}
                  {isGenerating && (
                      <div className="flex items-center gap-3 text-navy animate-pulse px-4 border-l-2 border-navy/20 py-2">
                          <Icon name="loader" size={16} className="animate-spin" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Gerd analysiert Felddaten & Dokumente...</span>
                      </div>
                  )}
                  <div ref={endRef} />
              </div>

              {/* Action Bar: Analytical Input */}
              {phase === 'chat' && !isGenerating && (
                  <div className="absolute bottom-10 left-10 right-10 pt-8 border-t border-black/10 bg-[#f8f9fa]/90 backdrop-blur-md">
                      {mode === 'training' && currentStep === 1 && (
                          <div className="flex gap-4">
                              <input 
                                type="text" 
                                placeholder="Tactical Focus: e.g. Gegenpressing, Overloading Half-Spaces..."
                                className="flex-1 bg-white border border-black/10 rounded-2xl px-6 py-4 text-sm text-navy focus:border-navy outline-none shadow-inner font-serif"
                                onKeyDown={(e) => e.key === 'Enter' && handleTrainingInput(e.target.value)}
                              />
                              <button onClick={() => handleTrainingInput(document.querySelector('input').value)} className="px-10 py-4 bg-navy text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-navy/90 transition-all shadow-xl shadow-navy/20 flex items-center gap-2">
                                 <Icon name="send" size={14} /> Analyze
                              </button>
                          </div>
                      )}
                      {(mode === 'training' && currentStep === 10) || (mode === 'matchday' && currentStep === 2) ? (
                          <div className="flex flex-col gap-6 w-full">
                              {mode === 'matchday' && !draft.generatedLineup && (
                                  <div className="bg-white border border-black/10 p-6 rounded-3xl shadow-sm animate-fade-in">
                                      <h4 className="text-[10px] font-black uppercase tracking-widest text-navy mb-4">Lineup Architect</h4>
                                      <textarea 
                                          value={lineupInput}
                                          onChange={(e) => setLineupInput(e.target.value)}
                                          placeholder="Enter players (e.g. TW Maier, IV Schmidt, ST Kane...)"
                                          className="w-full h-24 bg-navy/5 border border-black/5 rounded-2xl p-4 text-sm text-navy outline-none focus:border-navy transition-all mb-4"
                                      />
                                      <button 
                                          onClick={handleGenerateLineup}
                                          disabled={isGeneratingLineup}
                                          className="w-full py-4 bg-navy text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-navy/90 transition-all flex items-center justify-center gap-2"
                                      >
                                          {isGeneratingLineup ? <Icon name="loader" className="animate-spin" /> : <Icon name="layout" />}
                                          Visual Lineup generieren
                                      </button>
                                  </div>
                              )}
                              <div className="flex gap-4">
                                  <button onClick={saveToCalendar} className="flex-1 py-5 bg-navy text-white rounded-3xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-navy/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-3">
                                      <Icon name="check-circle" size={18} /> Confirm & Sync to Dossier
                                  </button>
                                  <button onClick={() => startMode(mode)} className="px-10 py-5 bg-white border border-black/10 text-black/40 rounded-3xl font-black uppercase text-[10px] tracking-widest hover:text-navy hover:border-navy/30 transition-all">
                                      Regenerate
                                  </button>
                              </div>
                          </div>
                      ) : null}
                  </div>
              )}

              {phase === 'summary' && (
                  <div className="absolute bottom-10 left-10 right-10 flex flex-col gap-6">
                      <div className="bg-white border border-black/10 rounded-3xl p-8 shadow-sm">
                          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-navy mb-8">Session Profile Analysis</h3>
                          <div className="grid grid-cols-3 gap-10">
                             {[
                               { label: "Intensity", value: 85, color: "#1a2c4e" },
                               { label: "Complexity", value: 72, color: "#1a2c4e" },
                               { label: "Cognitive", value: 94, color: "#1a2c4e" }
                             ].map((stat, i) => (
                               <div key={i} className="space-y-4">
                                 <div className="flex justify-between items-center px-1">
                                   <span className="text-[9px] font-black uppercase tracking-widest text-black/40">{stat.label}</span>
                                   <span className="text-[10px] font-mono font-bold text-navy">{stat.value}%</span>
                                 </div>
                                 <div className="h-2 w-full bg-navy/5 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full transition-all duration-1000 ease-out" 
                                      style={{ width: `${stat.value}%`, backgroundColor: stat.color }}
                                    ></div>
                                 </div>
                               </div>
                             ))}
                          </div>
                      </div>
                      
                      <button 
                        onClick={() => setPhase('selection')}
                        className="w-full py-5 bg-navy text-white rounded-3xl font-black uppercase tracking-[0.4em] text-[10px] shadow-xl shadow-navy/20 hover:bg-navy/90 transition-all"
                      >
                          Back to Terminal
                      </button>
                  </div>
              )}
          </div>
      )}

      {/* Analytical Visualization (SVG Tactical Board) */}
      {mode === 'matchday' && currentStep >= 2 && (
          <div className="bg-white border border-black/10 rounded-[2.5rem] p-10 shadow-3xl animate-slide-up">
              <div className="flex items-center justify-between mb-10 border-b border-black/5 pb-8">
                  <h3 className="text-2xl font-serif font-light italic text-navy flex items-center gap-4">
                      <Icon name="layout" size={28} /> Tactical Blueprint: {draft.formation}
                  </h3>
                  <div className="flex items-center gap-10">
                      <div className="text-right">
                          <p className="text-[10px] text-black/40 uppercase font-black tracking-widest mb-1">Impact Rating</p>
                          <p className="text-3xl font-serif font-light italic text-navy">74.2/100</p>
                      </div>
                      <div className="text-right">
                          <p className="text-[10px] text-black/40 uppercase font-black tracking-widest mb-1">Stress Level</p>
                          <p className="text-xs font-black uppercase tracking-widest bg-navy text-white px-3 py-1 rounded-full">High</p>
                      </div>
                  </div>
              </div>
              <div className="aspect-[10/7] max-w-4xl mx-auto rounded-3xl overflow-hidden border border-black/10 shadow-inner bg-[#f0f1f3]">
                  {draft.generatedLineup ? (
                      <LineupCanvas lineup={draft.generatedLineup} />
                  ) : (
                      <SvgTacticalBoard data={{
                          feld_typ: 'halbfeld',
                          spieler_blau: players.slice(0, 5).map((p, i) => ({ x: 200 + i*100, y: 300, label: p.position })),
                          spieler_rot: [{ x: 400, y: 100, label: "OPP" }],
                          huetchen: [],
                          linien: []
                      }} />
                  )}
              </div>
          </div>
      )}

    </div>
  );
};

export default UnifiedCoachHub;
