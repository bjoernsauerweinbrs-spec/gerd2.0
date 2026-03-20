import React, { useState, useEffect } from 'react';
import Icon from './Icon';

// Helpers - FIFA Pitch Exact Proportions (105m x 68m) scaled x10
const FIELD_W = 1050; // Length
const FIELD_H = 680;  // Width

const formations = {
  "4-4-2": [
    { pos: 'TW', x: 5, y: 50 },
    { pos: 'LV', x: 25, y: 15 },
    { pos: 'LIV', x: 20, y: 35 },
    { pos: 'RIV', x: 20, y: 65 },
    { pos: 'RV', x: 25, y: 85 },
    { pos: 'LM', x: 50, y: 15 },
    { pos: 'ZDM', x: 45, y: 35 },
    { pos: 'ZOM', x: 60, y: 65 },
    { pos: 'RM', x: 50, y: 85 },
    { pos: 'ST', x: 80, y: 35 },
    { pos: 'ST', x: 80, y: 65 },
  ],
  "3-4-3": [
    { pos: 'TW', x: 5, y: 50 },
    { pos: 'LIV', x: 20, y: 25 },
    { pos: 'ZIV', x: 15, y: 50 },
    { pos: 'RIV', x: 20, y: 75 },
    { pos: 'LM', x: 45, y: 15 },
    { pos: 'ZDM', x: 40, y: 35 },
    { pos: 'ZOM', x: 55, y: 65 },
    { pos: 'RM', x: 45, y: 85 },
    { pos: 'LF', x: 80, y: 25 },
    { pos: 'ST', x: 85, y: 50 },
    { pos: 'RF', x: 80, y: 75 },
  ],
  "4-3-3": [
    { pos: 'TW', x: 5, y: 50 },
    { pos: 'LV', x: 25, y: 15 },
    { pos: 'LIV', x: 20, y: 35 },
    { pos: 'RIV', x: 20, y: 65 },
    { pos: 'RV', x: 25, y: 85 },
    { pos: 'ZDM', x: 45, y: 50 },
    { pos: 'ZM', x: 60, y: 30 },
    { pos: 'ZM', x: 60, y: 70 },
    { pos: 'LF', x: 80, y: 20 },
    { pos: 'ST', x: 85, y: 50 },
    { pos: 'RF', x: 80, y: 80 },
  ],
};

const TacticalHub = ({ truthObject, setTruthObject, activeRole, targetPlayers, targetPositions, setTargetPositions, isNlzTheme, playbooks, setPlaybooks }) => {
  const [interactionMode, setInteractionMode] = useState("move"); // 'move' or 'draw'
  const [drawMode, setDrawMode] = useState("run"); // 'run', 'pass'
  const [drawingPaths, setDrawingPaths] = useState([]);
  const [isDrawingTactic, setIsDrawingTactic] = useState(false);
  
  // Tactical DB & AI Features
  const [playbookViewActive, setPlaybookViewActive] = useState(false);
  const [vectorAnalysisActive, setVectorAnalysisActive] = useState(false);
  const [liveBriefingActive, setLiveBriefingActive] = useState(false);
  
  const opponentName = truthObject?.tactical_setup?.upcoming_opponent || "TSG HOFFENHEIM";

  const getOpponentIntel = (oppName) => {
     const up = oppName.toUpperCase();
     if (up.includes("LEIPZIG")) {
         return {
            strengths: "Extreme Intensität im Gegenpressing und sehr hohe vertikale Geschwindigkeit im Umschaltspiel über die offensiven Halbpositionen (Openda/Sesko).",
            pattern: "Gibt oft die Spielfeldkontrolle im Aufbau ab, presst aber extrem hoch auf den gegnerischen Sechser. Wechselt bei Führung auf 5er Kette hinten.",
            tip: "\"Erste Pressing-Linie zwingend mit präzisen flachen Bällen überspielen. Wenn die erste Kette gebrochen ist, sind die Halbräume völlig offen.\"",
            chat_1: "Wir erwarten ein aggressives 4-4-2. Simons und Openda laufen den Spielaufbau extrem hoch an, um Fehler bei unseren Innenverteidigern zu provozieren.",
            star: "Openda"
         };
     } else if (up.includes("HOFFENHEIM") || up.includes("TSG")) {
         return {
            strengths: "Gefährlich durch extrem hohe vertikale Geschwindigkeit im Zentrum. Der offensive Spielmacher lässt sich oft tief fallen, um Überstand zu erzeugen.",
            pattern: "Doppelwechsel in der Offensive auffällig oft extrem früh durch (historischer Durchschnitt 60. Minute). Systemwechsel auf 4er-Kette bei Rückstand.",
            tip: "\"Lockt den Gegner in der ersten Halbzeit leicht heraus, überspielt die erste Pressinglinie schnell und präzise. Kontert ihre Standards eiskalt aus.\"",
            chat_1: "Wir erwarten ein 3-4-3 mit hochstehenden Schienenspielern. Kramaric lässt sich oft in den Zehnerraum fallen, um dort eine Überzahl zu generieren.",
            star: "Kramaric"
         };
     } else {
         return {
            strengths: "Physische Präsenz im Zentrum und extrem konterstark über die Außenbahnen. Anfällig in der Rückwärtsbewegung nach Ballverlusten im Angriffsdrittel.",
            pattern: "Tauscht in der Regel die Schienenspieler ab der 65. Minute aus, um das Tempo hochzuhalten. Wechselt bei späten Führungen oft auf eine enge 5er Kette.",
            tip: "\"Wir müssen geduldig spielen und in den Halbräumen Überzahl schaffen. Den Ball zirkulieren lassen und auf den entscheidenden Fehler in ihrer Restverteidigung lauern.\"",
            chat_1: "Wir erwarten ein defensiv extrem dichtes System. Der gegnerische Spielmacher zieht früh die Fäden, um pfeilschnelle Flügelwechsel zu orchestrieren.",
            star: "den gegnerischen Topstürmer"
         };
     }
  };

  const activeIntel = getOpponentIntel(opponentName);

  const [chatInput, setChatInput] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'gerd', 
      text: `Guten Abend Coach. Das taktische Vector-Scouting für ${opponentName} ist abgeschlossen.\n\n${activeIntel.chat_1}\n\nWie möchtest du heute taktisch dagegenhalten? Sollen wir sie im Aufbau früh unter Druck setzen oder tiefer im Block erwarten?`
    }
  ]);

  const [gerdFeedback, setGerdFeedback] = useState("");
  const [aiTacticsGlow, setAiTacticsGlow] = useState([]);
  const [activeDrill, setActiveDrill] = useState(null);
  
  // Default pro squad if not NLZ
  const defaultProPlayers = [
    { id: 1, name: "Neuer", position: "TW", ovr: 89, readiness: 95, pac: 40, sho: 20, pas: 70, dri: 40, def: 85, phy: 80 },
    { id: 2, name: "Davies", position: "LV", ovr: 84, readiness: 90, pac: 95, sho: 65, pas: 75, dri: 85, def: 78, phy: 75 },
    { id: 3, name: "De Ligt", position: "IV", ovr: 85, readiness: 88, pac: 68, sho: 55, pas: 70, dri: 65, def: 86, phy: 88 },
    { id: 4, name: "Upamecano", position: "IV", ovr: 84, readiness: 85, pac: 80, sho: 50, pas: 72, dri: 68, def: 85, phy: 89 },
    { id: 5, name: "Mazraoui", position: "RV", ovr: 82, readiness: 92, pac: 82, sho: 60, pas: 78, dri: 82, def: 77, phy: 70 },
    { id: 6, name: "Kimmich", position: "ZDM", ovr: 88, readiness: 95, pac: 70, sho: 75, pas: 90, dri: 82, def: 80, phy: 78 },
    { id: 7, name: "Goretzka", position: "ZM", ovr: 85, readiness: 80, pac: 78, sho: 80, pas: 82, dri: 80, def: 80, phy: 88 },
    { id: 8, name: "Musiala", position: "ZOM", ovr: 86, readiness: 90, pac: 85, sho: 80, pas: 85, dri: 92, def: 50, phy: 60 },
    { id: 9, name: "Sane", position: "RM", ovr: 84, readiness: 85, pac: 90, sho: 82, pas: 80, dri: 88, def: 45, phy: 65 },
    { id: 10, name: "Coman", position: "LM", ovr: 85, readiness: 88, pac: 92, sho: 78, pas: 80, dri: 89, def: 40, phy: 60 },
    { id: 11, name: "Kane", position: "ST", ovr: 90, readiness: 95, pac: 70, sho: 93, pas: 85, dri: 82, def: 45, phy: 85 }
  ];

  const players = targetPlayers || (truthObject?.players && truthObject.players.length > 0 ? truthObject.players : defaultProPlayers);
  
  const [internalPositions, setInternalPositions] = useState({});
  const [opponentPositions, setOpponentPositions] = useState({});
  
  // Drag handling
  const [draggedPlayerId, setDraggedPlayerId] = useState(null);

  useEffect(() => {
    // Only apply formation automatically if it's completely empty!
    // We don't want to reset user edits.
    if (!setTargetPositions && Object.keys(internalPositions).length === 0) {
       applyFormation();
    }
    if (setTargetPositions && targetPositions === null) {
       applyFormation();
    }
    if (currentMode !== "match") {
       setOpponentPositions({});
    } else {
       // Mock Opponents for visual padding if requested
    }
  }, [currentMode, truthObject]);

  const applyFormation = (overrideFormation = null) => {
    const formation = overrideFormation || (truthObject?.tactical_setup?.formation_home || "4-4-2");
    const layout = formations[formation];
    
    if (!layout) return;

    let pPos = {};
    let pools = { TW: [], DEF: [], MID: [], ATT: [] };
    
    players.forEach(p => {
       const pos = (p.position || "ZM").toUpperCase();
       if (pos.includes('TW')) pools.TW.push(p);
       else if (pos.includes('V')) pools.DEF.push(p);
       else if (pos.includes('M')) pools.MID.push(p);
       else pools.ATT.push(p);
    });

    const grabPlayer = (preferredPool) => {
       if (pools[preferredPool] && pools[preferredPool].length > 0) return pools[preferredPool].shift();
       if (pools.MID.length > 0) return pools.MID.shift();
       if (pools.DEF.length > 0) return pools.DEF.shift();
       if (pools.ATT.length > 0) return pools.ATT.shift();
       if (pools.TW.length > 0) return pools.TW.shift();
       return null;
    };

    layout.forEach((node) => {
       let poolMap = 'MID';
       if (node.pos === 'TW') poolMap = 'TW';
       else if (node.pos.includes('V')) poolMap = 'DEF';
       else if (node.pos.includes('M')) poolMap = 'MID';
       else if (node.pos.includes('ST') || node.pos.includes('F')) poolMap = 'ATT';

       const playerForNode = grabPlayer(poolMap);
       if(playerForNode) {
          pPos[playerForNode.id] = { x: (node.x / 100) * FIELD_W, y: (node.y / 100) * FIELD_H };
       }
    });

    if (setTargetPositions) {
        setTargetPositions(pPos);
    } else {
        setInternalPositions(pPos);
    }

    if (currentMode === "match") {
      let oPos = {};
      const awayForm = truthObject?.tactical_setup?.formation_away || "3-4-3";
      const awayLayout = formations[awayForm];
      if (awayLayout) {
        awayLayout.forEach((pos, i) => {
          oPos[`opp-${i}`] = { x: ((100 - pos.x) / 100) * FIELD_W, y: ((100 - pos.y) / 100) * FIELD_H };
        });
      }
      setOpponentPositions(oPos);
    } else {
      setOpponentPositions({});
    }
  };

  const currentPositions = setTargetPositions ? targetPositions : internalPositions;

  const handleFieldDrop = (e) => {
    e.preventDefault();
    if (!draggedPlayerId) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(10, Math.min(FIELD_W - 10, e.clientX - rect.left));
    const y = Math.max(10, Math.min(FIELD_H - 10, e.clientY - rect.top));

    const oldPos = currentPositions[draggedPlayerId];

    if (setTargetPositions) {
        setTargetPositions(prev => ({ ...prev, [draggedPlayerId]: { x, y } }));
    } else {
        setInternalPositions(prev => ({ ...prev, [draggedPlayerId]: { x, y } }));
    }
    
    if (oldPos) {
       setDrawingPaths(prev => [...prev, {
         mode: drawMode,
         points: [ { x: oldPos.x, y: oldPos.y }, { x, y } ]
       }]);
    }
    
    setDraggedPlayerId(null);
  };

  const runAiGlowAnalysis = () => {
      setAiTacticsGlow([{ x: FIELD_W / 1.5, y: FIELD_H / 2, radius: 100 }]);
      setGerdFeedback("TAKTIK-SCAN: Lücke im rechten Halbraum entdeckt. Umschaltgefahr hoch.");
      // Auto clear glow after 3 sec
      setTimeout(() => {
          setAiTacticsGlow([]);
          setGerdFeedback("");
      }, 4000);
  }

  const submitRoster = () => {
      if (!setTruthObject) return;
      
      const rosterArray = Object.entries(currentPositions || {})
        .map(([id, pos]) => {
            const p = players.find(x => String(x.id) === id);
            if (!p) return null;
            return { ...p, x: pos.x, y: pos.y };
        })
        .filter(Boolean);

      setTruthObject(prev => ({
          ...prev,
          matchday_roster: rosterArray,
          notifications: [
              { id: Date.now(), type: 'press_interview', message: 'Pressetermin: Statement zur Aufstellung benötigt!', read: false },
              ...(prev.notifications || [])
          ]
      }));
      setGerdFeedback("Aufstellung verifiziert und an Zentralserver übermittelt. Pressetermin in der Inbox hinterlegt.");
  };

  const handleSendMessage = () => {
    if (!chatInput.trim() || isAiTyping) return;
    
    // Dynamically find a star attacking player and a strong defender from the actual roster
    const attackingPlayers = players.filter(p => p.position && (p.position.includes('ST') || p.position.includes('OM') || p.position.includes('F')));
    const defendingPlayers = players.filter(p => p.position && p.position.includes('IV'));
    
    const starPlayer = attackingPlayers.length > 0 ? attackingPlayers[0].name : "unseren zentralen Spielmacher";
    const starDefender = defendingPlayers.length > 0 ? defendingPlayers[0].name : "unseren zweikampfstärksten Innenverteidiger";

    const userMsg = chatInput.trim();
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput("");
    setIsAiTyping(true);

    setTimeout(() => {
       setIsAiTyping(false);
       setChatMessages(prev => [...prev, {
         sender: 'gerd',
         text: `Verstanden. Wenn wir das System jetzt auf ein kompaktes 4-4-2 umbauen, können wir im Mittelfeldzentrum Überzahl herstellen und ${activeIntel.star} neutralisieren. \n\nMATCHUP-ANALYSE:\nIch setze direkt ${starDefender} als Manndecker auf ${activeIntel.star} an, da er unser kopfballstärkster Spieler ist. Vorne nutzen wir das Tempo von ${starPlayer} gegen ihre Restverteidigung.\n\nIch aktualisiere jetzt das Taktikboard auf 4-4-2.`
       }]);

       // Mute truthObject to new formation and trigger re-render of board
       if (setTruthObject) {
         setTruthObject(prev => ({
            ...prev,
            tactical_setup: { ...prev.tactical_setup, formation_home: "4-4-2" }
         }));
       }
       
       // Force a timeout to let state settle before applying new coordinates
       setTimeout(() => {
          applyFormation("4-4-2");
          setGerdFeedback(`Systemumstellung auf 4-4-2 und Matchup ${starDefender} vs ${activeIntel.star} verifiziert.`);
       }, 500);

    }, 2000);
  };

  const handleSaveBlueprint = () => {
      if (!setPlaybooks) return;
      const title = currentMode === "match" ? `Matchday: Stark Elite vs ${opponentName}` : "Training: Intensives Rondo & Spielaufbau";
      
      const newPlaybook = {
         id: Date.now(),
         type: currentMode,
         date: new Date().toLocaleString('de-DE', { weekday: 'short', hour: '2-digit', minute:'2-digit' }) + " Uhr",
         title: title,
         opponent: currentMode === "match" ? opponentName : "Taktik-Training",
         formation: truthObject?.tactical_setup?.formation_home || "4-3-3",
         notes: chatMessages.length > 1 ? chatMessages[chatMessages.length - 1].text.substring(0, 100) + "..." : "Keine speziellen KI-Notizen hinterlegt.",
         players: currentPositions ? Object.entries(currentPositions).map(([id, pos]) => {
             const p = players.find(x => String(x.id) === id);
             return p ? { ...p, x: pos.x, y: pos.y } : null;
         }).filter(Boolean) : []
      };

      setPlaybooks(prev => [newPlaybook, ...prev]);
      setGerdFeedback("Taktik als Blueprint gespeichert und in den Kalender geladen.");
  };

  return (
    <div className={`space-y-6 animate-fade-in pb-20 p-2 ${isNlzTheme ? "bg-navy/10 rounded-2xl border border-neon/10" : "bg-transparent"}`}>
      
      {/* LIVE KI-BRIEFING MODAL */}
      {liveBriefingActive && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 px-20">
          <div className="bg-[#02050c] border-2 border-redbull/50 shadow-[0_0_50px_rgba(226,27,77,0.3)] rounded-2xl w-full max-w-5xl h-[75vh] flex flex-col overflow-hidden animate-zoom-in">
            {/* Header */}
            <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-gradient-to-r from-redbull/20 to-transparent">
               <div className="flex items-center gap-3">
                 <div className="w-3 h-3 rounded-full bg-redbull animate-pulse shadow-[0_0_10px_#e21b4d]"></div>
                 <h2 className="text-white font-black uppercase tracking-widest text-lg">Live KI-Briefing: {truthObject?.tactical_setup?.upcoming_opponent || "TSG HOFFENHEIM"}</h2>
               </div>
               <button onClick={() => setLiveBriefingActive(false)} className="text-white/50 hover:text-white transition-colors bg-white/5 rounded-full p-2 hover:bg-white/10">
                 <Icon name="x" size={20} />
               </button>
            </div>
            
            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6 custom-scrollbar bg-[url('/grid-pattern.svg')] bg-repeat bg-[length:30px_30px] opacity-90">
               {chatMessages.map((msg, idx) => (
                 <div key={idx} className={`flex gap-4 max-w-[85%] ${msg.sender === 'user' ? 'self-end flex-row-reverse' : ''}`}>
                   <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(226,27,77,0.4)] ${msg.sender === 'user' ? 'bg-white/10 border border-white/20' : 'bg-redbull/20 border border-redbull'}`}>
                     {msg.sender === 'user' ? <Icon name="user" size={24} className="text-white" /> : <Icon name="cpu" size={24} className="text-redbull" />}
                   </div>
                   <div className={`border rounded-2xl p-5 text-[15px] leading-relaxed shadow-xl whitespace-pre-line ${msg.sender === 'user' ? 'bg-white/10 border-white/20 rounded-tr-none text-white' : 'bg-[#0f172a] border-white/10 rounded-tl-none text-white/90'}`}>
                     {msg.text}
                   </div>
                 </div>
               ))}
               
               {isAiTyping && (
                 <div className="flex gap-4 max-w-[85%]">
                   <div className="w-12 h-12 rounded-full bg-redbull/20 border border-redbull flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(226,27,77,0.4)]">
                     <Icon name="cpu" size={24} className="text-redbull animate-pulse" />
                   </div>
                   <div className="bg-[#0f172a] border border-white/10 rounded-2xl rounded-tl-none p-5 flex items-center gap-2 shadow-xl">
                     <div className="w-2 h-2 rounded-full bg-redbull animate-bounce"></div>
                     <div className="w-2 h-2 rounded-full bg-redbull animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                     <div className="w-2 h-2 rounded-full bg-redbull animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                   </div>
                 </div>
               )}
            </div>

            {/* Input Area */}
            <div className="p-5 border-t border-white/10 bg-black/60 backdrop-blur-md">
               <div className="relative flex items-center">
                 <input 
                   type="text" 
                   value={chatInput}
                   onChange={(e) => setChatInput(e.target.value)}
                   onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                   placeholder="Sprich mit Gerd über deine taktische Idee (z.B. 'Wir pressen früh und doppeln Kramaric')..." 
                   className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-6 pr-16 text-white text-[15px] focus:outline-none focus:border-redbull/50 focus:bg-white/10 transition-colors shadow-inner" 
                 />
                 <button 
                   onClick={handleSendMessage}
                   className={`absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-lg flex items-center justify-center text-white transition-all shadow-[0_0_15px_rgba(226,27,77,0.5)] ${chatInput.trim() ? "bg-redbull hover:bg-neon hover:text-navy hover:scale-105" : "bg-white/5 opacity-50 cursor-default"}`}
                 >
                    <Icon name={chatInput.trim() ? "send" : "mic"} size={20} className={chatInput.trim() ? "" : "animate-pulse"} />
                 </button>
               </div>
            </div>
          </div>
        </div>
      )}
      
      {/* HEADER BAR */}
      <div className={`flex flex-wrap gap-4 items-center justify-between p-5 rounded-xl border shadow-2xl ${isNlzTheme ? "bg-black/60 border-neon/20" : "bg-black/40 border-white/10"}`}>
        <div className="flex gap-3">
          <div className="px-6 py-3 rounded font-black uppercase tracking-tighter text-base flex items-center gap-2 border-2 bg-redbull border-transparent shadow-[0_0_25px_rgba(226,27,77,0.5)]">
            <Icon name="swords" size={20} className="animate-pulse" /> Taktikanalyse: GEGNER
          </div>
        </div>
        
        {activeRole !== 'Manager' && (
          <button 
            onClick={submitRoster}
            className="px-6 py-3 rounded font-black uppercase tracking-widest text-base transition-all flex items-center gap-2 bg-gold text-black hover:bg-white shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:shadow-[0_0_30px_rgba(255,255,255,0.8)]"
          >
            <Icon name="upload-cloud" size={20} /> Aufstellung übermitteln
          </button>
        )}
      </div>
      
      {/* DRAWING CONTROLS */}
      <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-2 bg-[#050914] p-1.5 rounded-xl border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
            <button
              onClick={() => setInteractionMode("move")}
              className={`p-2 rounded-lg flex items-center gap-2 text-xs font-black uppercase transition-all ${interactionMode === "move" ? "bg-white text-navy shadow-md" : "text-white/40 hover:text-white"}`}
            >
              <Icon name="move" size={18} /> Positionieren
            </button>
            <div className="w-[1px] bg-white/10 mx-2 self-stretch"></div>
            <button
              onClick={() => { setInteractionMode("draw"); setDrawMode("run"); }}
              className={`p-2 rounded-lg flex items-center gap-2 text-xs font-black uppercase transition-all ${interactionMode === "draw" && drawMode === "run" ? "bg-neon/20 text-neon border border-neon/50 shadow-[0_0_15px_rgba(0,243,255,0.3)]" : "text-white/40 hover:text-white"}`}
            >
              <Icon name="edit-2" size={18} /> Laufweg-Drawing
            </button>
            <button
              onClick={() => { setInteractionMode("draw"); setDrawMode("pass"); }}
              className={`p-2 rounded-lg flex items-center gap-2 text-xs font-black uppercase transition-all ${interactionMode === "draw" && drawMode === "pass" ? "bg-neon/20 text-neon border border-neon/50 shadow-[0_0_15px_rgba(0,243,255,0.3)]" : "text-white/40 hover:text-white"}`}
            >
              <Icon name="shuffle" size={18} /> Pass-Drawing
            </button>
            <div className="w-[1px] bg-white/10 mx-2 self-stretch"></div>
            <button
              onClick={() => setDrawingPaths([])}
              disabled={activeRole === 'Manager'}
              className={`p-2 transition-transform flex items-center gap-2 text-xs font-black uppercase ${activeRole === 'Manager' ? 'text-white/20 cursor-not-allowed' : 'text-redbull hover:text-redbull/80'}`}
            >
              <Icon name="trash-2" size={18} /> Tinte Löschen
            </button>
          </div>

          <button
            onClick={() => {
               setGerdFeedback("Analysiere Kader... Berechne optimale Positions-Symmetrie basierend auf Stark Elite Standards.");
               setAiTacticsGlow([{ x: FIELD_W / 2, y: FIELD_H / 2, radius: 250 }]);
               setTimeout(() => {
                   applyFormation();
                   setGerdFeedback("KI-Aufstellung nach taktischer Position erfolgreich generiert.");
                   setAiTacticsGlow([]);
               }, 900);
            }}
            className="px-6 py-3 rounded-lg flex items-center gap-3 text-xs font-black uppercase bg-transparent border-2 border-redbull text-redbull hover:bg-redbull hover:text-white shadow-[0_0_20px_rgba(226,27,77,0.3)] hover:shadow-[0_0_30px_rgba(226,27,77,0.8)] transition-all ml-auto"
          >
            <Icon name="cpu" size={20} className="animate-pulse" /> KI Aufstellung Generieren
          </button>
      </div>

      {/* AI ANALYSIS BAR */}
      <div className="flex gap-3">
          <button
            onClick={() => setVectorAnalysisActive(!vectorAnalysisActive)}
            className={`px-5 py-3 rounded font-black uppercase text-xs flex items-center gap-2 border-2 transition-all ${vectorAnalysisActive ? "bg-neon border-neon text-navy shadow-[0_0_20px_rgba(0,243,255,0.6)] animate-pulse" : "border-white/20 text-white/60 hover:border-white hover:text-white"}`}
          >
            <Icon name="git-commit" size={16} /> Vector-Distanzen
          </button>
          
          <button
            onClick={runAiGlowAnalysis}
            className="px-5 py-3 rounded font-black uppercase text-xs flex items-center gap-2 border-2 border-neon/40 text-neon hover:bg-neon/10 transition-all"
          >
            <Icon name="crosshair" size={16} /> KI-Lücken-Scan
          </button>
      </div>
      
      {/* GERD FEEDBACK */}
      {gerdFeedback && (
        <div className="bg-navy/80 border border-neon/30 rounded-lg p-5 flex gap-4 items-start shadow-[0_0_20px_rgba(0,243,255,0.15)] animate-slide-in">
          <div className="w-10 h-10 rounded-full bg-neon flex items-center justify-center shrink-0">
            <Icon name="brain" size={18} className="text-navy" />
          </div>
          <div className="flex-1">
            <div className="text-[10px] font-bold text-neon uppercase tracking-widest mb-1">KI-Analyse</div>
            <p className="font-mono text-sm text-green-300 leading-relaxed">{gerdFeedback}</p>
          </div>
          <button onClick={() => setGerdFeedback("")} className="text-white/30 hover:text-white">
            <Icon name="x" size={16} />
          </button>
        </div>
      )}

      {/* FIELD AND ROSTER LAYOUT */}
      <div className="flex flex-col lg:flex-row gap-6 items-start overflow-hidden">
        {/* FIELD SVG AREA */}
        <div className="flex flex-col gap-4 w-full flex-1 min-w-0">
          <div
            className={`relative select-none group touch-none overflow-hidden rounded-2xl border border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,1)] flex object-contain max-h-[60vh] bg-[#02050c] justify-center items-center w-full`}
            onMouseDown={(e) => {
              if (e.button !== 0 || activeRole === 'Manager') return;
              if (interactionMode === 'draw') {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const svgNode = e.currentTarget.querySelector('svg');
                  if(!svgNode) return;
                  const svgRect = svgNode.getBoundingClientRect();
                  const scaleX = FIELD_W / svgRect.width;
                  const scaleY = FIELD_H / svgRect.height;
                  const x = (e.clientX - svgRect.left) * scaleX;
                  const y = (e.clientY - svgRect.top) * scaleY;
                  setIsDrawingTactic(true);
                  setDrawingPaths((prev) => [...prev, { mode: drawMode, points: [{ x, y }] }]);
              }
            }}
            onMouseMove={(e) => {
              const svgNode = e.currentTarget.querySelector('svg');
              if(!svgNode) return;
              const svgRect = svgNode.getBoundingClientRect();
              const scaleX = FIELD_W / svgRect.width;
              const scaleY = FIELD_H / svgRect.height;
              const x = (e.clientX - svgRect.left) * scaleX;
              const y = (e.clientY - svgRect.top) * scaleY;

              if (interactionMode === 'draw' && isDrawingTactic) {
                  setDrawingPaths((prev) => {
                    const last = prev[prev.length - 1];
                    const rest = prev.slice(0, -1);
                    return [...rest, { ...last, points: [...last.points, { x, y }] }];
                  });
              }

              if (interactionMode === 'move' && draggedPlayerId) {
                  const cx = Math.max(10, Math.min(FIELD_W - 10, x));
                  const cy = Math.max(10, Math.min(FIELD_H - 10, y));
                  if (setTargetPositions) {
                      setTargetPositions(prev => ({ ...prev, [draggedPlayerId]: { x: cx, y: cy } }));
                  } else {
                      setInternalPositions(prev => ({ ...prev, [draggedPlayerId]: { x: cx, y: cy } }));
                  }
              }
            }}
            onMouseUp={() => {
               setIsDrawingTactic(false);
               setDraggedPlayerId(null);
            }}
            onMouseLeave={() => {
               setIsDrawingTactic(false);
               setDraggedPlayerId(null);
            }}
          >
            {/* OPPONENT INTELLIGENCE FILE MOVED BELOW SVG AESTHETIC */}

            <svg
              viewBox={`-50 -30 ${FIELD_W + 100} ${FIELD_H + 60}`}
              preserveAspectRatio="xMidYMid meet"
              className="w-full h-full max-h-[80vh] overflow-visible"
            >
              <rect width={FIELD_W} height={FIELD_H} fill="#050914" />

              {/* Radar Sweep Effect */}
              <defs>
                 <linearGradient id="radar-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#00f3ff" stopOpacity="0" />
                    <stop offset="85%" stopColor="#00f3ff" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#00f3ff" stopOpacity="0.4" />
                 </linearGradient>
                 <clipPath id="pitch-clip">
                    <rect x="0" y="0" width={FIELD_W} height={FIELD_H} />
                 </clipPath>
              </defs>

              <g clipPath="url(#pitch-clip)">
                  <g style={{ transformOrigin: `${FIELD_W / 2}px ${FIELD_H / 2}px`, animation: "spin 12s linear infinite" }}>
                     <path d={`M 525 340 L 525 -860 A 1200 1200 0 0 1 1725 340 Z`} fill="url(#radar-gradient)" style={{ pointerEvents: 'none' }} />
                  </g>

                  {/* Grid Hologram */}
                  {Array.from({ length: 22 }).map((_, i) => (
                    <line key={`v-${i}`} x1={i * (FIELD_W / 22)} y1="0" x2={i * (FIELD_W / 22)} y2={FIELD_H} stroke="#00f3ff" strokeOpacity="0.05" />
                  ))}
                  {Array.from({ length: 14 }).map((_, i) => (
                    <line key={`h-${i}`} x1="0" y1={i * (FIELD_H / 14)} x2={FIELD_W} y2={i * (FIELD_H / 14)} stroke="#00f3ff" strokeOpacity="0.05" />
                  ))}

                  {/* Pitch markings High-Tech (Exact FIFA Scale Data: 1050x680 Horizontal) */}
                  <line x1={FIELD_W / 2} y1="0" x2={FIELD_W / 2} y2={FIELD_H} stroke="#00f3ff" strokeOpacity="0.2" strokeWidth="2" style={{ pointerEvents: 'none' }} />
                  {/* Center Circle (r=91.5) */}
                  <circle cx={FIELD_W / 2} cy={FIELD_H / 2} r="91.5" fill="none" stroke="#00f3ff" strokeOpacity="0.2" strokeWidth="2" style={{ pointerEvents: 'none' }} />
                  {/* Center Dot (r=3) */}
                  <circle cx={FIELD_W / 2} cy={FIELD_H / 2} r="3" fill="#00f3ff" fillOpacity="0.8" className="animate-pulse" style={{ pointerEvents: 'none' }} />

                  {/* Left / Home 16m Box (165 x 403) */}
                  <rect x="0" y="138.5" width="165" height="403" fill="none" stroke="#00f3ff" strokeOpacity="0.2" strokeWidth="2" style={{ pointerEvents: 'none' }} />
                  {/* Left / Home 5m Box (55 x 183) */}
                  <rect x="0" y="248.5" width="55" height="183" fill="none" stroke="#00f3ff" strokeOpacity="0.2" strokeWidth="2" style={{ pointerEvents: 'none' }} />
                  {/* Left / Home 11m Penalty Mark */}
                  <circle cx="110" cy={FIELD_H / 2} r="2" fill="#00f3ff" fillOpacity="0.5" style={{ pointerEvents: 'none' }} />
                  {/* Left / Home Penalty Arc */}
                  <path d="M 165 266 A 91.5 91.5 0 0 1 165 414" fill="none" stroke="#00f3ff" strokeOpacity="0.2" strokeWidth="2" style={{ pointerEvents: 'none' }} />

                  {/* Right / Away 16m Box (165 x 403) */}
                  <rect x="885" y="138.5" width="165" height="403" fill="none" stroke="#00f3ff" strokeOpacity="0.2" strokeWidth="2" style={{ pointerEvents: 'none' }} />
                  {/* Right / Away 5m Box (55 x 183) */}
                  <rect x="995" y="248.5" width="55" height="183" fill="none" stroke="#00f3ff" strokeOpacity="0.2" strokeWidth="2" style={{ pointerEvents: 'none' }} />
                  {/* Right / Away 11m Penalty Mark */}
                  <circle cx="940" cy={FIELD_H / 2} r="2" fill="#00f3ff" fillOpacity="0.5" style={{ pointerEvents: 'none' }} />
                  {/* Right / Away Penalty Arc */}
                  <path d="M 885 266 A 91.5 91.5 0 0 0 885 414" fill="none" stroke="#00f3ff" strokeOpacity="0.2" strokeWidth="2" style={{ pointerEvents: 'none' }} />
              </g>

              {/* Outside Pitch Borders */}
              <rect x="0" y="0" width={FIELD_W} height={FIELD_H} fill="none" stroke="#00f3ff" strokeWidth="2" strokeOpacity="0.4" style={{ pointerEvents: 'none' }} />

              {/* Goals (Drawn exactly outside pitch on left and right) */}
              {/* Left Home Goal (15 x 73) */}
              <rect x="-15" y="303.5" width="15" height="73" fill="#00f3ff" fillOpacity="0.1" stroke="#00f3ff" strokeWidth="2" style={{ pointerEvents: 'none' }} />
              {/* Right Away Goal (15 x 73) */}
              <rect x="1050" y="303.5" width="15" height="73" fill="#00f3ff" fillOpacity="0.1" stroke="#00f3ff" strokeWidth="2" style={{ pointerEvents: 'none' }} />
              
              <text x="-25" y={303.5 + 36} fill="#00f3ff" opacity="0.3" fontSize="16" fontWeight="bold" transform={`rotate(-90, -25, ${303.5 + 36})`} textAnchor="middle" style={{ pointerEvents: 'none' }}>HOME</text>
              <text x="1075" y={303.5 + 36} fill="#00f3ff" opacity="0.3" fontSize="16" fontWeight="bold" transform={`rotate(90, 1075, ${303.5 + 36})`} textAnchor="middle" style={{ pointerEvents: 'none' }}>AWAY</text>

              {/* Play Drawings */}
              <defs>
                <marker id="arrowhead-white" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#ffffff" />
                </marker>
                <marker id="arrowhead-neon" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#00f3ff" />
                </marker>
              </defs>

              {drawingPaths.map((path, idx) => (
                <polyline
                  key={idx}
                  fill="none"
                  points={path.points.map((p) => `${p.x},${p.y}`).join(" ")}
                  stroke={path.mode === "run" ? "#ffffff" : "#00f3ff"}
                  strokeWidth="3"
                  strokeDasharray={path.mode === "pass" ? "8,6" : "none"}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  markerEnd={path.mode === "pass" ? "url(#arrowhead-neon)" : "url(#arrowhead-white)"}
                  className={path.mode === "pass" ? "animate-pulse" : ""}
                />
              ))}
              
              {/* AI TACTICS GLOW LAYER */}
              {aiTacticsGlow.map((glow, idx) => (
                <circle
                  key={`glow-${idx}`}
                  cx={glow.x}
                  cy={glow.y}
                  r={glow.radius}
                  fill="#e21b4d"
                  opacity="0.4"
                  className="animate-ping"
                />
              ))}

              {/* PLAYERS ON PITCH */}
              {Object.entries(currentPositions || {}).map(([id, pos]) => {
                let p = players.find(x => String(x.id) === id);
                if (!p) return null;
                const readinessColor = (p.readiness || 85) > 90 ? "#00f3ff" : (p.readiness || 85) < 70 ? "#e21b4d" : "#00f3ff";
                
                return (
                  <g
                    key={`player-${id}`}
                    transform={`translate(${pos.x}, ${pos.y})`}
                    className={interactionMode === 'move' ? "cursor-grab active:cursor-grabbing" : ""}
                    onMouseDown={(e) => {
                       if (activeRole === 'Manager' || interactionMode !== 'move') return;
                       e.stopPropagation(); // Prevent the SVG background click from catching this
                       setDraggedPlayerId(p.id);
                    }}
                  >
                    <circle r="16" fill={isNlzTheme ? "#00f3ff" : "#1a2542"} stroke="#00f3ff" strokeWidth="2" className="drop-shadow-[0_0_15px_rgba(0,243,255,0.7)]" />
                    
                    {/* Position Label Inside Ring */}
                    <text y="4" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="900" style={{ pointerEvents: "none" }}>
                      {p.position}
                    </text>
                    
                    {/* Name Tag */}
                    <text y="30" textAnchor="middle" fill="white" fontSize="9" fontWeight="900" className="uppercase tracking-widest bg-black px-2 shadow-sm rounded-sm" style={{ pointerEvents: "none" }}>
                      {p.name}
                    </text>

                    {/* Readiness Mini-Bar */}
                    <rect x="-15" y="19" width="30" height="2" fill="white" fillOpacity="0.2" style={{ pointerEvents: "none" }} />
                    <rect x="-15" y="19" width={30 * ((p.readiness || 85) / 100)} height="2" fill={readinessColor} style={{ pointerEvents: "none" }} />
                  </g>
                );
              })}

              {/* OPPONENT BLIPS */}
              {currentMode === "match" && Object.entries(opponentPositions).map(([id, pos]) => (
                <g key={id} transform={`translate(${pos.x}, ${pos.y})`} style={{ pointerEvents: "none" }}>
                  <circle r="12" fill="none" stroke="#E21B4D" strokeWidth="2" strokeOpacity="0.6" strokeDasharray="4 2" className="animate-[spin_4s_linear_infinite]" />
                  <circle r="4" fill="#E21B4D" opacity="0.8" />
                </g>
              ))}
            </svg>
          </div>

          {/* BOTTOM PANELS: OPPONENT FILE & TACTICAL CALENDAR */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
            
            {/* LEFT PANEL: GEGNER-AKTE (MATCH) / DRILL SETUP (TRAINING) */}
            <div className={`bg-[#02050c]/80 border rounded-2xl py-5 px-6 shadow-2xl backdrop-blur-md flex flex-col gap-4 max-h-[350px] overflow-y-auto custom-scrollbar ${currentMode === "match" ? "border-redbull/30" : "border-neon/30"}`}>
               {currentMode === "match" ? (
                  <>
                    <div className="flex items-center justify-between sticky top-0 bg-[#02050c]/90 z-10 pb-2">
                      <div className="flex items-center gap-2 text-redbull font-black uppercase tracking-widest text-sm">
                        <Icon name="shield" size={18} /> Gegner-Akte <span className="text-white/50 text-xs font-medium ml-2">Opponent Intel</span>
                      </div>
                      <div className="bg-redbull/20 text-redbull text-[10px] font-bold px-3 py-1 rounded-full animate-pulse border border-redbull/50">
                        LIVE INTEL
                      </div>
                    </div>
                    
                    <div className="text-white text-3xl font-black uppercase tracking-tight italic">
                      {truthObject?.tactical_setup?.upcoming_opponent || "TSG HOFFENHEIM"}
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className="text-white/50 text-[10px] uppercase font-bold">Ligateam Form-Kurve:</span>
                      <div className="flex gap-1.5">
                        <span className="bg-red-500/20 text-red-500 px-2 py-0.5 rounded text-sm font-black shadow-[0_0_10px_rgba(239,68,68,0.2)]">N</span>
                        <span className="bg-neon/20 text-neon px-2 py-0.5 rounded text-sm font-black">S</span>
                        <span className="bg-red-500/20 text-red-500 px-2 py-0.5 rounded text-sm font-black">N</span>
                        <span className="bg-neon/20 text-neon px-2 py-0.5 rounded text-sm font-black">S</span>
                        <span className="bg-red-500/20 text-red-500 px-2 py-0.5 rounded text-sm font-black">N</span>
                      </div>
                    </div>

                    <div className="bg-white/5 p-4 rounded-xl text-sm hover:bg-white/10 transition-colors border-l-4 border-neon/50 mt-2">
                      <div className="font-bold text-neon mb-2 uppercase tracking-wider text-xs flex items-center gap-2"><Icon name="cpu" size={14} /> KI Stärken-Profil Tiefenanalyse</div>
                      <div className="text-white/90 leading-relaxed font-medium">{activeIntel.strengths}</div>
                    </div>

                    <div className="bg-white/5 p-4 rounded-xl text-sm hover:bg-white/10 transition-colors border-l-4 border-red-500/50">
                      <div className="font-bold text-red-500 mb-2 uppercase tracking-wider text-xs flex items-center gap-2"><Icon name="clock" size={14} /> Algorithmus: Historische Wechsel-Muster</div>
                      <div className="text-white/90 leading-relaxed font-medium">{activeIntel.pattern}</div>
                    </div>
                    
                    <div className="bg-redbull/10 p-4 rounded-xl text-sm text-redbull/90 border border-redbull/30 mt-2">
                      <div className="font-black mb-2 uppercase tracking-wider text-xs flex items-center gap-2"><Icon name="lightbulb" size={14} /> Gerd's Setup Empfehlung</div>
                      <div className="font-medium leading-relaxed italic">{activeIntel.tip}</div>
                    </div>

                    {/* LIVE KI BUTTON */}
                    <button 
                      onClick={() => setLiveBriefingActive(true)}
                      className="mt-4 w-full relative group overflow-hidden bg-gradient-to-r from-redbull to-red-800 text-white font-black uppercase tracking-[0.2em] text-xs py-4 px-6 rounded-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3 border border-redbull shadow-[0_0_20px_rgba(226,27,77,0.4)]"
                    >
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                      <Icon name="mic" size={16} className="relative z-10" />
                      <span className="relative z-10">Live KI-Briefing Starten</span>
                      <Icon name="loader" size={16} className="relative z-10 animate-spin opacity-50" />
                    </button>
                  </>
               ) : (
                  <>
                    <div className="flex items-center gap-2 text-neon font-black uppercase tracking-widest text-sm mb-2">
                      <Icon name="dumbbell" size={18} /> Trainings-Setup <span className="text-white/50 text-xs font-medium ml-2">Drill Config</span>
                    </div>
                    <div className="text-white/60 text-sm italic">
                      Keine Gegner-Daten im Trainings-Modus geladen. Konfiguriere Trainingszonen, Hütchen und Minitore frei auf dem SVG-Feld.
                    </div>
                    <div className="flex flex-col gap-2 mt-4">
                       <button className="bg-white/5 border border-white/10 text-white font-bold p-4 rounded-xl flex items-center gap-3 hover:bg-white/10 transition-colors uppercase text-xs tracking-wider">
                          <Icon name="grid" size={16} className="text-neon" /> Zonen Split (Halbfeld) aktivieren
                       </button>
                       <button className="bg-white/5 border border-white/10 text-white font-bold p-4 rounded-xl flex items-center gap-3 hover:bg-white/10 transition-colors uppercase text-xs tracking-wider">
                          <Icon name="users" size={16} className="text-neon" /> NLZ Akademie Gastspieler laden
                       </button>
                    </div>
                  </>
               )}
            </div>

            {/* RIGHT PANEL: TACTICAL CALENDAR */}
            <div className="bg-[#02050c]/80 border border-white/10 rounded-2xl py-5 px-6 shadow-2xl backdrop-blur-md flex flex-col gap-4 max-h-[350px] overflow-y-auto custom-scrollbar relative">
               <div className="flex items-center justify-between sticky top-0 bg-[#02050c]/90 z-10 pb-2">
                 <div className="flex items-center gap-2 text-white font-black uppercase tracking-widest text-sm">
                   <Icon name="calendar" size={18} /> Tactical Calendar <span className="text-white/50 text-xs font-medium ml-2">Pro Playbook</span>
                 </div>
                 <div className="bg-white/10 text-white/70 text-[10px] font-bold px-3 py-1 rounded-full">
                   ARCHIVE
                 </div>
               </div>

               <div className="flex flex-col gap-3 mt-2">
                 <div className="bg-white/5 border-l-4 border-redbull p-4 rounded-xl relative group overflow-hidden hover:bg-white/10 transition-colors cursor-pointer">
                    <div className="text-[10px] text-white/40 uppercase font-black mb-1">Heute Abend, 20:30 Uhr</div>
                    <div className="text-white font-bold text-sm">Matchday: RB Leipzig vs TSG Hoffenheim</div>
                    <div className="text-white/60 text-xs mt-1">4-3-3 Formation • Gegenpressing Fokus</div>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-neon">
                       <Icon name="printer" size={16} />
                    </div>
                 </div>

                 <div className="bg-white/5 border-l-4 border-neon/50 p-4 rounded-xl relative group hover:bg-white/10 transition-colors cursor-pointer">
                    <div className="text-[10px] text-white/40 uppercase font-black mb-1">Gestern, 10:00 Uhr</div>
                    <div className="text-white font-bold text-sm">Drill: Rondo Umschaltspiel (5v2)</div>
                    <div className="text-white/60 text-xs mt-1">Hohe Intensität • Fokus auf Ballbesitzstabilität</div>
                 </div>

                 <div className="bg-white/5 border-l-4 border-white/20 p-4 rounded-xl relative group hover:bg-white/10 transition-colors cursor-pointer opacity-50">
                    <div className="text-[10px] text-white/40 uppercase font-black mb-1">Dienstag, 15:00 Uhr</div>
                    <div className="text-white font-bold text-sm">Drill: Standard-Situationen Defensiv</div>
                    <div className="text-white/60 text-xs mt-1">Fokus: Eckball-Klärung • Gegner-Simulation</div>
                 </div>
               </div>

               <button onClick={handleSaveBlueprint} className="mt-auto static bottom-0 w-full bg-white/5 text-white/70 border border-white/10 font-black uppercase tracking-wider text-xs py-3 px-6 rounded-xl hover:bg-white/10 hover:text-white hover:border-neon transition-all flex justify-center gap-2">
                 <Icon name="save" size={16} /> {currentMode === "match" ? "Als Blueprint speichern" : "Trainingsplan Exportieren"}
               </button>
            </div>
          </div>
        </div>

        {/* ROSTER SIDEBAR */}
        <div className={`w-[320px] shrink-0 flex flex-col gap-6 bg-black/40 rounded-xl border p-5 shadow-2xl backdrop-blur-md ${isNlzTheme ? "border-neon/20" : "border-white/10"}`}>
          <div className="flex justify-between items-end mb-6">
            <div>
              <h4 className="text-white/40 font-black uppercase text-[10px] tracking-[0.3em]">
                Active Squad
              </h4>
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">
                {isNlzTheme ? "NLZ Jugend" : "Stark Elite"} <span className="text-redbull">Kader</span>
              </h3>
            </div>
            <div className="bg-redbull/20 px-4 py-1 rounded-full border border-redbull/40 text-redbull font-black text-[10px] uppercase">
                {players.length} Spieler Aktiv
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {players.map((p) => {
              const onField = currentPositions && currentPositions[p.id];
              const ovrDisplay = p.ovr || Math.round((p.pac + p.sho + p.pas + p.dri + p.def + p.phy) / 6) || 60;
              
              return (
                <div
                  key={p.id}
                  draggable={activeRole !== 'Manager'}
                  onDragStart={(e) => {
                      if (activeRole !== 'Manager') {
                          setDraggedPlayerId(p.id);
                      }
                  }}
                  className={`group relative p-0 rounded-lg border-2 transition-all cursor-pointer overflow-hidden bg-[#0d1320] ${onField ? "border-neon/40 shadow-[0_0_10px_rgba(0,243,255,0.2)]" : "border-white/10 hover:border-white/30"}`}
                >
                  <div className="flex flex-col h-full uppercase font-black tracking-tighter p-3">
                    <div className="flex justify-between items-center mb-2">
                        <span className={`text-2xl leading-none text-white`}>{ovrDisplay}</span>
                        <span className="text-xs text-white/40 tracking-widest">{p.position}</span>
                    </div>
                    <div className="text-[12px] text-white truncate w-full font-black italic tracking-widest pb-1 border-b border-white/10">
                        {p.name}
                    </div>
                    <div className="grid grid-cols-3 gap-0 pt-2 opacity-50 text-white">
                        <div className="text-center border-r border-white/5">
                            <div className="text-[7px]">SPR</div>
                            <div className="text-[10px] text-white">{p.pac || 50}</div>
                        </div>
                        <div className="text-center border-r border-white/5">
                            <div className="text-[7px] text-redbull">PWR</div>
                            <div className="text-[10px] text-redbull">{p.phy || 50}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-[7px] text-gold">MNT</div>
                            <div className="text-[10px] text-gold">{p.focus ? p.focus * 10 : 50}</div>
                        </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TacticalHub;
