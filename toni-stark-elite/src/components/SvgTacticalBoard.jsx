import React from 'react';

/**
 * SvgTacticalBoard - A premium, data-driven tactical rendering engine.
 * 
 * @param {Object} data - The tactical data object containing:
 *   @param {string} feld_typ - "halbfeld" or "ganzfeld"
 *   @param {Array} spieler_blau - [{x, y, label}]
 *   @param {Array} spieler_rot - [{x, y, label}]
 *   @param {Array} spieler_gruen - [{x, y, label}] (Neutrals/Jokers)
 *   @param {Array} huetchen - [{x, y}]
 *   @param {Array} linien - [{start: [x,y], ende: [x,y], typ: "pass"|"lauf", farbe: "weiß"|"gelb"}]
 */
const SvgTacticalBoard = ({ data }) => {
    if (!data) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-navy/50 border border-white/10 rounded-xl p-8 text-center">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-4 text-white/20">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
                </div>
                <p className="text-[10px] text-white/40 uppercase font-black tracking-widest leading-none">Keine Taktik-Daten verfügbar</p>
            </div>
        );
    }

    const isHalf = data.feld_typ === "halbfeld";
    const blau = data.spieler_blau || [];
    const rot = data.spieler_rot || [];
    const gruen = data.spieler_gruen || [];
    const huetchen = data.huetchen || [];
    const linien = data.linien || [];

    // Base pitch dimensions (800x600 for consistency with AI prompt)
    const width = 800;
    const height = 600;

    return (
        <div className="w-full h-full relative group">
            {/* Field Glow Effect */}
            <div className="absolute inset-0 bg-green-500/5 blur-xl pointer-events-none group-hover:bg-green-500/10 transition-colors"></div>
            
            <svg 
                viewBox={`0 0 ${width} ${height}`} 
                className="w-full h-full font-mono select-none drop-shadow-2xl relative z-10" 
                preserveAspectRatio="xMidYMid meet"
            >
                <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="white" />
                    </marker>
                    <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    <linearGradient id="pitch-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#1a5d2a" />
                        <stop offset="100%" stopColor="#144d22" />
                    </linearGradient>
                </defs>

                {/* Pitch Background */}
                <rect width={width} height={height} fill="url(#pitch-grad)" rx="12" />
                
                {/* Grass Patterns (Subtle Stripes) */}
                {[...Array(10)].map((_, i) => (
                    <rect key={i} x={0} y={(height/10)*i} width={width} height={height/20} fill="white" opacity="0.03" />
                ))}

                {/* Field Markings */}
                <rect x="20" y="20" width={width-40} height={height-40} fill="none" stroke="white" strokeWidth="2" opacity="0.4"/>
                
                {isHalf ? (
                    <>
                        {/* Half-field Markings */}
                        <line x1="20" y1={height-20} x2={width-20} y2={height-20} stroke="white" strokeWidth="2" opacity="0.4"/>
                        <path d={`M${width/2 - 100} ${height-20} A 100 100 0 0 1 ${width/2 + 100} ${height-20}`} fill="none" stroke="white" strokeWidth="2" opacity="0.4" />
                        {/* Penalty Box (Half-field top) */}
                        <rect x={width/2 - 200} y="20" width="400" height="150" fill="none" stroke="white" strokeWidth="2" opacity="0.4" />
                        <rect x={width/2 - 80} y="20" width="160" height="50" fill="none" stroke="white" strokeWidth="2" opacity="0.4" />
                    </>
                ) : (
                    <>
                        {/* Full-field Center Line */}
                        <line x1="20" y1={height/2} x2={width-20} y2={height/2} stroke="white" strokeWidth="2" opacity="0.4"/>
                        <circle cx={width/2} cy={height/2} r="80" fill="none" stroke="white" strokeWidth="2" opacity="0.4" />
                        {/* Penalty Boxes */}
                        <rect x={width/2 - 150} y="20" width="300" height="100" fill="none" stroke="white" strokeWidth="2" opacity="0.4" />
                        <rect x={width/2 - 150} y={height-120} width="300" height="100" fill="none" stroke="white" strokeWidth="2" opacity="0.4" />
                    </>
                )}

                {/* Tactical Lines (Passes & Runs) */}
                {linien.map((l, i) => (
                    <line 
                        key={`l-${i}`} 
                        x1={l.start[0]} y1={l.start[1]} 
                        x2={l.ende[0]} y2={l.ende[1]} 
                        stroke={l.farbe === "gelb" ? "#facc15" : "white"} 
                        strokeWidth="3" 
                        strokeDasharray={l.typ === "lauf" ? "8,5" : "none"}
                        markerEnd={l.typ === "pass" || l.typ === "lauf" ? "url(#arrowhead)" : ""}
                        opacity="0.9"
                        filter="url(#neon-glow)"
                    />
                ))}

                {/* Training Gear (Cones) */}
                {huetchen.map((h, i) => (
                    <g key={`h-${i}`}>
                        <polygon points={`${h.x-8},${h.y+8} ${h.x+8},${h.y+8} ${h.x},${h.y-8}`} fill="#facc15" filter="url(#neon-glow)" />
                        <circle cx={h.x} cy={h.y+4} r="2" fill="black" opacity="0.2" />
                    </g>
                ))}
                
                {/* Players - Blue (Team A) */}
                {blau.map((p, i) => (
                    <g key={`b-${i}`} className="cursor-pointer group/player transition-transform hover:scale-110">
                        <circle cx={p.x} cy={p.y} r="16" fill="#3b82f6" stroke="white" strokeWidth="2" filter="url(#neon-glow)" className="drop-shadow-lg" />
                        <text x={p.x} y={p.y + 4} textAnchor="middle" fill="white" fontSize="10" fontWeight="900" style={{ pointerEvents: 'none' }}>{p.label || 'B'}</text>
                    </g>
                ))}

                {/* Players - Red (Team B) */}
                {rot.map((p, i) => (
                    <g key={`r-${i}`} className="cursor-pointer group/player transition-transform hover:scale-110">
                        <circle cx={p.x} cy={p.y} r="16" fill="#ef4444" stroke="white" strokeWidth="2" filter="url(#neon-glow)" className="drop-shadow-lg" />
                        <text x={p.x} y={p.y + 4} textAnchor="middle" fill="white" fontSize="10" fontWeight="900" style={{ pointerEvents: 'none' }}>{p.label || 'R'}</text>
                    </g>
                ))}

                {/* Players - Green (Neutrals/Jokers) */}
                {gruen.map((p, i) => (
                    <g key={`g-${i}`} className="cursor-pointer group/player transition-transform hover:scale-110">
                        <circle cx={p.x} cy={p.y} r="16" fill="#22c55e" stroke="white" strokeWidth="2" filter="url(#neon-glow)" className="drop-shadow-lg" />
                        <text x={p.x} y={p.y + 4} textAnchor="middle" fill="white" fontSize="10" fontWeight="900" style={{ pointerEvents: 'none' }}>{p.label || 'J'}</text>
                    </g>
                ))}
            </svg>
            
            {/* Watermark */}
            <div className="absolute bottom-4 right-6 text-[8px] font-black uppercase text-white/20 tracking-[0.3em] font-mono pointer-events-none">
                Gerd 2.0 • Tactical Engine
            </div>
        </div>
    );
};

export default SvgTacticalBoard;
