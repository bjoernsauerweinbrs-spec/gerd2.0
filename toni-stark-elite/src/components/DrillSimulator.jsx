import React, { useState, useEffect } from 'react';
import Icon from './Icon';

const DrillSimulator = ({ drill, onClose, isNlzTheme }) => {
  const [progress, setProgress] = useState(0);

  // Animation Loop (4 second repeating video loop)
  useEffect(() => {
    let animationFrameId;
    let startTime = Date.now();
    const duration = 4000;

    const animate = () => {
      let elapsed = Date.now() - startTime;
      if (elapsed >= duration) {
        startTime = Date.now(); // Reset loop //
        elapsed = 0;
      }
      setProgress(elapsed / duration);
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const dType = drill?.type || 'rondo';

  // --- DRILL 1: RONDO (5v2) ---
  const renderRondo = () => {
    const players = [
      { id: 1, base: { x: 400, y: 200 } },
      { id: 2, base: { x: 650, y: 200 } },
      { id: 3, base: { x: 750, y: 340 } },
      { id: 4, base: { x: 650, y: 480 } },
      { id: 5, base: { x: 400, y: 480 } },
      { id: 6, base: { x: 300, y: 340 } },
    ];
    const defenders = [
      { id: 7, base: { x: 480, y: 300 }, target: { x: 430, y: 250 } },
      { id: 8, base: { x: 570, y: 380 }, target: { x: 500, y: 340 } },
    ];
    const phases = [
      { start: { x: 400, y: 200 }, end: { x: 650, y: 200 } },
      { start: { x: 650, y: 200 }, end: { x: 750, y: 340 } },
      { start: { x: 750, y: 340 }, end: { x: 650, y: 480 } },
      { start: { x: 650, y: 480 }, end: { x: 400, y: 480 } },
      { start: { x: 400, y: 480 }, end: { x: 400, y: 200 } },
    ];
    const currentPhaseIndex = Math.min(Math.floor(progress * 5), 4);
    const phaseProgress = (progress - (currentPhaseIndex * 0.2)) * 5;
    const activePhase = phases[currentPhaseIndex];
    const ballX = activePhase.start.x + (activePhase.end.x - activePhase.start.x) * phaseProgress;
    const ballY = activePhase.start.y + (activePhase.end.y - activePhase.start.y) * phaseProgress;
    const d1_x = defenders[0].base.x + (defenders[0].target.x - defenders[0].base.x) * (Math.sin(progress * Math.PI * 2) * 0.5 + 0.5);
    const d1_y = defenders[0].base.y + (defenders[0].target.y - defenders[0].base.y) * (Math.sin(progress * Math.PI * 2) * 0.5 + 0.5);
    const d2_x = defenders[1].base.x + (defenders[1].target.x - defenders[1].base.x) * (Math.cos(progress * Math.PI * 2) * 0.5 + 0.5);
    const d2_y = defenders[1].base.y + (defenders[1].target.y - defenders[1].base.y) * (Math.cos(progress * Math.PI * 2) * 0.5 + 0.5);

    return (
      <g>
         <rect x="250" y="150" width="550" height="380" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="4" strokeDasharray="15 10" rx="20" />
         <text x="525" y="560" fill="rgba(255,255,255,0.2)" fontSize="20" fontWeight="900" textAnchor="middle" className="uppercase tracking-[0.5em] font-mono">Trainingskorridor A</text>
         {phases.map((ph, idx) => <line key={idx} x1={ph.start.x} y1={ph.start.y} x2={ph.end.x} y2={ph.end.y} stroke="rgba(0, 243, 255, 0.15)" strokeWidth="4" strokeDasharray="8 6" strokeLinecap="round" />)}
         {players.map(p => (
           <g key={p.id} transform={`translate(${p.base.x}, ${p.base.y})`}><circle r="18" fill="#1a2542" stroke={isNlzTheme ? "#00f3ff" : "#ffffff"} strokeWidth="3" /><text y="4" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="900" style={{ pointerEvents: "none" }}>{p.id}</text></g>
         ))}
         <g transform={`translate(${d1_x}, ${d1_y})`}><circle r="18" fill="none" stroke="#e21b4d" strokeWidth="3" strokeDasharray="4 2" className="animate-[spin_3s_linear_infinite]" /><circle r="6" fill="#e21b4d" /></g>
         <g transform={`translate(${d2_x}, ${d2_y})`}><circle r="18" fill="none" stroke="#e21b4d" strokeWidth="3" strokeDasharray="4 2" className="animate-[spin_3s_linear_infinite]" /><circle r="6" fill="#e21b4d" /></g>
         <g transform={`translate(${ballX}, ${ballY})`}><circle r="8" fill="#ffffff" /><circle r="14" fill="none" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.5" className="animate-ping" /></g>
      </g>
    );
  };

  // --- DRILL 2: SHOOTING (Elite: Y-Pass "Klatsch & Steil" mit Flanke) ---
  const renderShooting = () => {
     let ballX, ballY, st1Y, cm2X, cm2Y, rwY, st2X, st2Y, gkX, gkY;
     
     // Base positions
     const cm1Pos = { x: 525, y: 600 };
     st1Y = 450; // Sinks from 450 to 500
     cm2X = 650;
     cm2Y = 550; // Advances to 480
     rwY = 400;  // Sprints to 150
     st2X = 420;
     st2Y = 300; // Overlaps to 520, 180
     gkX = 525;
     gkY = 90;

     // Dummy Defenders (Red Mannequins)
     const dummies = [
       { x: 380, y: 250 },
       { x: 480, y: 250 },
       { x: 580, y: 250 },
       { x: 680, y: 250 }
     ];

     if (progress < 0.2) {
         // Phase 1: CM1 to dropping ST1 (False 9)
         const p = progress / 0.2;
         st1Y = 450 + (50 * p); // drops to 500
         ballX = cm1Pos.x;
         ballY = cm1Pos.y + (st1Y - cm1Pos.y) * p;
     } else if (progress < 0.4) {
         // Phase 2: ST1 lays off (Klatsch) to advancing CM2
         st1Y = 500;
         const p = (progress - 0.2) / 0.2;
         cm2Y = 550 - (70 * p); // advances to 480
         ballX = 525 + (650 - 525) * p;
         ballY = 500 + (cm2Y - 500) * p;
         rwY = 400 - (100 * p); // RW starts sprinting
     } else if (progress < 0.6) {
         // Phase 3: CM2 through-ball (Steil) to RW sprinting behind defense
         st1Y = 500;
         cm2Y = 480;
         rwY = 300 - (150 * ((progress - 0.4)/0.2)); // sprints 300 -> 150
         st2X = 420 + (50 * ((progress - 0.4)/0.2)); // ST2 starts box run
         st2Y = 300 - (60 * ((progress - 0.4)/0.2)); 
         const p = (progress - 0.4) / 0.2;
         ballX = 650 + (850 - 650) * p; // CM2 to RW
         ballY = 480 + (rwY - 480) * p;
     } else if (progress < 0.8) {
         // Phase 4: RW crosses to overlapping ST2
         st1Y = 500;
         cm2Y = 480;
         rwY = 150;
         const p = (progress - 0.6) / 0.2;
         st2X = 470 + (50 * p); // ST2 finishes overlapping run into crossing zone
         st2Y = 240 - (60 * p); // ends up at (520, 180)
         ballX = 850 + (st2X - 850) * p; // Cross
         ballY = 150 + (st2Y - 150) * p;
     } else if (progress < 0.9) {
         // Phase 5: ST2 Shoots
         st1Y = 500; cm2Y = 480; rwY = 150; st2X = 520; st2Y = 180;
         const p = (progress - 0.8) / 0.1;
         ballX = 520 + (490 - 520) * p; // shoots lower-left
         ballY = 180 - (90 * p);
         gkX = 525 - (35 * p); // GK dives left
         gkY = 90;
     } else {
         // Reset
         st1Y = 500; cm2Y = 480; rwY = 150; st2X = 520; st2Y = 180;
         ballX = 490; ballY = 90; gkX = 490;
     }

     return (
       <g>
         <text x="525" y="40" fill="rgba(255,255,255,0.2)" fontSize="20" fontWeight="900" textAnchor="middle" className="uppercase tracking-[0.5em] font-mono">Klatsch & Steil (Flanken & Torschuss)</text>

         {/* Penalty Box Context */}
         <rect x="360" y="-30" width="330" height="195" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="4" />
         <rect x="430" y="-30" width="190" height="90" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="4" />
         <path d="M 430 165 A 91 91 0 0 0 620 165" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="4" />

         {/* Crossing Action Zone */}
         <rect x="500" y="150" width="50" height="40" fill="rgba(0, 243, 255, 0.1)" stroke="rgba(0, 243, 255, 0.5)" strokeDasharray="4 2" rx="4" />
         <rect x="800" y="100" width="100" height="150" fill="rgba(226, 27, 77, 0.05)" stroke="rgba(226, 27, 77, 0.3)" strokeDasharray="4 2" rx="4" />

         {/* Static Passing Vector Lines */}
         <line x1="525" y1="600" x2="525" y2="500" stroke="rgba(0, 243, 255, 0.15)" strokeWidth="4" strokeDasharray="8 6" />
         <line x1="525" y1="500" x2="650" y2="480" stroke="rgba(0, 243, 255, 0.15)" strokeWidth="4" strokeDasharray="8 6" />
         <line x1="650" y1="480" x2="850" y2="150" stroke="rgba(0, 243, 255, 0.15)" strokeWidth="4" strokeDasharray="8 6" />
         <line x1="850" y1="150" x2="520" y2="180" stroke="rgba(0, 243, 255, 0.15)" strokeWidth="4" strokeDasharray="8 6" />
         <line x1="520" y1="180" x2="490" y2="90" stroke="rgba(0, 243, 255, 0.5)" strokeWidth="3" strokeDasharray="8 6" />

         {/* Defensive Dummies (Mannequins) */}
         {dummies.map((d, i) => (
            <g key={`d-${i}`} transform={`translate(${d.x}, ${d.y})`}>
               <path d="M -10 -15 L 10 -15 L 15 5 L 10 20 L -10 20 L -15 5 Z" fill="rgba(226, 27, 77, 0.2)" stroke="#e21b4d" strokeWidth="2" />
               <circle cx="0" cy="-25" r="8" fill="rgba(226, 27, 77, 0.2)" stroke="#e21b4d" strokeWidth="2" />
            </g>
         ))}

         {/* Players */}
         <g transform={`translate(${cm1Pos.x}, ${cm1Pos.y})`}><circle r="18" fill="#1a2542" stroke={isNlzTheme ? "#00f3ff" : "#ffffff"} strokeWidth="3" className="drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]" /><text y="4" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="900" style={{pointerEvents:"none"}}>6</text></g>
         <g transform={`translate(525, ${st1Y})`}><circle r="18" fill="#1a2542" stroke={isNlzTheme ? "#00f3ff" : "#ffffff"} strokeWidth="3" /><text y="4" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="900" style={{pointerEvents:"none"}}>10</text></g>
         <g transform={`translate(${cm2X}, ${cm2Y})`}><circle r="18" fill="#1a2542" stroke={isNlzTheme ? "#00f3ff" : "#ffffff"} strokeWidth="3" /><text y="4" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="900" style={{pointerEvents:"none"}}>8</text></g>
         <g transform={`translate(850, ${rwY})`}><circle r="18" fill="#1a2542" stroke={isNlzTheme ? "#00f3ff" : "#ffffff"} strokeWidth="3" /><text y="4" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="900" style={{pointerEvents:"none"}}>W</text></g>
         <g transform={`translate(${st2X}, ${st2Y})`}><circle r="18" fill="#1a2542" stroke="#e21b4d" strokeWidth="3" className="drop-shadow-[0_0_10px_rgba(226,27,77,0.4)]" /><text y="4" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="900" style={{pointerEvents:"none"}}>9</text></g>
         <g transform={`translate(${gkX}, ${gkY})`}><circle r="18" fill="none" stroke="#fff" strokeWidth="3" strokeDasharray="4 2" className="animate-[spin_3s_linear_infinite]" /><circle r="6" fill="#fff" /></g>

         {/* The Ball */}
         <g transform={`translate(${ballX}, ${ballY})`}><circle r="8" fill="#ffffff" /><circle r="14" fill="none" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.5" className="animate-ping" /></g>
       </g>
     );
  };

  // --- DRILL 3: WARMUP (Koordination & Pässe) ---
  const renderWarmup = () => {
     // 3 players running through a slalom 
     // Cones are horizontally placed at x=300, 450, 600, 750, y=340
     const cones = [300, 450, 600, 750, 900];
     
     const p1_x = 100 + (progress * 900); // 100 to 1000
     const p1_y = 340 + (Math.sin(p1_x * 0.04) * 50);

     const p2_x = 100 + (((progress + 0.8) % 1) * 900);
     const p2_y = 340 + (Math.sin(p2_x * 0.04) * 50);

     const p3_x = 100 + (((progress + 0.6) % 1) * 900);
     const p3_y = 340 + (Math.sin(p3_x * 0.04) * 50);

     // Passes between groups
     const ballX = 525 + (Math.cos(progress * 20) * 100);
     const ballY = 550;

     return (
       <g>
         <text x="525" y="100" fill="rgba(255,255,255,0.2)" fontSize="20" fontWeight="900" textAnchor="middle" className="uppercase tracking-[0.5em] font-mono">Sprint & Slalom Parcours</text>
         
         {/* Cones */}
         {cones.map((cx, i) => (
            <path key={i} d={`M ${cx - 10} 350 L ${cx + 10} 350 L ${cx} 320 Z`} fill="#f59e0b" />
         ))}

         {/* Runners */}
         <g transform={`translate(${p1_x}, ${p1_y})`}><circle r="18" fill="#1a2542" stroke={isNlzTheme ? "#00f3ff" : "#ffffff"} strokeWidth="3" /><text y="4" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="900" style={{ pointerEvents: "none" }}>1</text></g>
         <g transform={`translate(${p2_x}, ${p2_y})`}><circle r="18" fill="#1a2542" stroke={isNlzTheme ? "#00f3ff" : "#ffffff"} strokeWidth="3" /><text y="4" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="900" style={{ pointerEvents: "none" }}>2</text></g>
         <g transform={`translate(${p3_x}, ${p3_y})`}><circle r="18" fill="#1a2542" stroke={isNlzTheme ? "#00f3ff" : "#ffffff"} strokeWidth="3" /><text y="4" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="900" style={{ pointerEvents: "none" }}>3</text></g>

         {/* Static Passing Group */}
         <g transform="translate(400, 550)"><circle r="18" fill="#1a2542" stroke="#e21b4d" strokeWidth="3" /></g>
         <g transform="translate(650, 550)"><circle r="18" fill="#1a2542" stroke="#e21b4d" strokeWidth="3" /></g>
         <line x1="400" y1="550" x2="650" y2="550" stroke="rgba(0, 243, 255, 0.15)" strokeWidth="4" strokeDasharray="8 6" />
         
         {/* The Ball down bottom */}
         <g transform={`translate(${ballX}, ${ballY})`}><circle r="8" fill="#ffffff" /><circle r="14" fill="none" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.5" className="animate-ping" /></g>
       </g>
     )
  }

  return (
    <div className="fixed inset-0 z-[200] flex justify-center items-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
      <div className="w-full max-w-6xl aspect-[1050/680] bg-[#02040a] border-2 border-white/20 rounded-3xl overflow-hidden relative shadow-[0_0_80px_rgba(0,0,0,0.8)]">
        
        {/* UI Overlay */}
        <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start pointer-events-none z-10">
           <div>
             <div className="flex items-center gap-3">
               <div className="flex gap-1 justify-center items-center px-3 py-1 bg-red-600 rounded text-white font-black uppercase text-[10px] tracking-widest drop-shadow-[0_0_10px_rgba(220,38,38,0.8)]">
                  <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div> Live Sim
               </div>
               <h3 className="text-white font-black text-2xl uppercase tracking-tighter drop-shadow-md">{drill?.name || "Drill"}</h3>
             </div>
             <p className="text-white/60 font-bold uppercase tracking-widest text-xs mt-1 drop-shadow-md bg-black/50 px-2 py-0.5 rounded inline-block">
               {drill?.focus || ""}
             </p>
           </div>
           <button onClick={onClose} className="pointer-events-auto bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition-colors backdrop-blur-md border border-white/20"><Icon name="x" size={24} /></button>
        </div>

        {/* Video Scrubber */}
        <div className="absolute bottom-6 left-10 right-10 z-10 bg-black/50 backdrop-blur-md border border-white/20 p-4 rounded-xl flex items-center gap-4">
           <button className="text-white hover:text-neon transition-colors pointer-events-auto"><Icon name="pause" size={20} /></button>
           <div className="text-white font-mono text-xs w-10">0:{String(Math.floor(progress * 4)).padStart(2, '0')}</div>
           <div className="flex-1 h-2 bg-white/10 rounded-full relative overflow-hidden pointer-events-auto">
              <div className="absolute top-0 left-0 h-full bg-neon transition-all duration-[50ms]" style={{ width: `${progress * 100}%` }}></div>
           </div>
           <div className="text-white font-mono text-xs w-10">0:04</div>
        </div>

        {/* SVG Pitch Canvas */}
        <svg viewBox="0 0 1050 680" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
           {/* Grid Pattern */}
           <defs>
              <pattern id="training-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <rect width="40" height="40" fill="none" stroke="#ffffff" strokeOpacity="0.04" strokeWidth="1" />
              </pattern>
           </defs>
           <rect x="0" y="0" width="1050" height="680" fill="url(#training-grid)" />
           
           {/* Dynamic Drill Render */}
           {dType === 'rondo' && renderRondo()}
           {dType === 'shooting' && renderShooting()}
           {dType === 'warmup' && renderWarmup()}
        </svg>

      </div>
    </div>
  );
};

export default DrillSimulator;
