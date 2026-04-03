import sys

file_path = "/Users/bjoernsauerwein/Toni2.0 Antigravity/toni-stark-elite/src/components/NlzAcademy.jsx"

with open(file_path, 'r') as f:
    lines = f.readlines()

new_card_jsx = """                return (
                  <div
                    key={p.id}
                    onClick={() => setActiveDossierPlayerId(p.id)}
                    className={`group relative p-0 transition-all cursor-pointer hover:-translate-y-2 ${activeDossierPlayerId === p.id ? "scale-101 z-20" : "z-10"}`}
                  >
                    {/* FIFA Shield Shape Container */}
                    <div className={`relative w-full h-[340px] transition-all duration-500 pb-8 ${pot >= 90 ? "drop-shadow-[0_0_15px_rgba(234,179,8,0.4)]" : "drop-shadow-xl"}`}
                         style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 88%, 50% 100%, 0% 88%)' }}>
                        
                        {/* Dynamic Background Gradient */}
                        <div className={`absolute inset-0 transition-colors duration-500 ${
                          pot >= 90 ? "bg-gradient-to-b from-yellow-100 via-yellow-400 to-amber-600" :
                          pot >= 80 ? "bg-gradient-to-b from-slate-100 via-gray-300 to-slate-500" :
                          "bg-gradient-to-b from-orange-100 via-orange-300 to-orange-600"
                        }`} />

                        {/* Texture / Shine Effect */}
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.3)_50%,transparent_75%)] bg-[length:250%_250%] animate-shine pointer-events-none" />

                        {/* Top Section: Stats & Quality */}
                        <div className="relative pt-6 px-4 flex flex-col items-start gap-0.5 z-20">
                            <span className={`text-4xl font-black italic tracking-tighter leading-none ${pot >= 90 ? "text-navy" : "text-white shadow-sm"}`}>{ovr}</span>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${pot >= 90 ? "text-navy/60" : "text-white/80"}`}>OVR</span>
                            <div className={`w-8 h-px my-1 ${pot >= 90 ? "bg-navy/10" : "bg-white/20"}`} />
                            <span className={`text-sm font-black italic ${pot >= 90 ? "text-navy/80" : "text-white"}`}>{p.position}</span>
                            <div className="mt-1">
                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${pot >= 90 ? "bg-navy text-white text-[7px]" : "bg-white/20 text-white text-[7px]"}`}>{p.group}</span>
                            </div>
                        </div>

                        {/* POT Badge */}
                        <div className="absolute top-6 right-4 flex flex-col items-end z-20">
                            <span className={`text-2xl font-black italic tracking-tighter leading-none ${pot >= 90 ? "text-amber-900" : "text-white text-stroke-sm"}`}>{pot}</span>
                            <span className={`text-[8px] font-black uppercase tracking-widest ${pot >= 90 ? "text-amber-900/60" : "text-white/80"}`}>POT</span>
                        </div>

                        {/* Photo Area: LARGE and Prominent Center */}
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-48 h-48 pointer-events-none z-10 overflow-hidden">
                            {p.imageUrl ? (
                                <div 
                                    className="w-full h-full relative"
                                    style={{
                                        backgroundImage: `url(${p.imageUrl})`,
                                        backgroundSize: '1400% auto', 
                                        backgroundPosition: `2.8% ${(p.yPosition || 0.5) * 100}%`,
                                        filter: 'drop-shadow(0 15px 15px rgba(0,0,0,0.4))'
                                    }}
                                >
                                    {/* Bottom Fade to blend photo into card */}
                                    <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/20 to-transparent" />
                                </div>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-black/5 rounded-full mt-4">
                                    <Icon name="user" size={80} className="text-white/30" />
                                </div>
                            )}
                        </div>

                        {/* Name & Player Info Plate */}
                        <div className="absolute bottom-[20%] inset-x-0 flex flex-col items-center z-30 px-2">
                             <div className={`w-full py-2 bg-black/5 backdrop-blur-md rounded-lg border border-white/5 shadow-lg text-center transform transition-transform group-hover:scale-105`}>
                                 <h4 className="text-lg font-black italic tracking-wider text-white uppercase truncate px-2 leading-tight">{p.name}</h4>
                             </div>
                             
                             {/* Mini Stats Bar */}
                             <div className="grid grid-cols-6 gap-2 mt-3 w-full px-2 text-[8px] font-black tracking-tight text-white/95">
                                <div className="flex flex-col items-center"><span>{p.pac || 50}</span><span className="opacity-60 text-[6px] uppercase">PAC</span></div>
                                <div className="flex flex-col items-center"><span>{p.sho || 50}</span><span className="opacity-60 text-[6px] uppercase">SHO</span></div>
                                <div className="flex flex-col items-center"><span>{p.pas || 50}</span><span className="opacity-60 text-[6px] uppercase">PAS</span></div>
                                <div className="flex flex-col items-center"><span>{p.dri || 50}</span><span className="opacity-60 text-[6px] uppercase">DRI</span></div>
                                <div className="flex flex-col items-center"><span>{p.def || 50}</span><span className="opacity-60 text-[6px] uppercase">DEF</span></div>
                                <div className="flex flex-col items-center"><span>{p.phy || 50}</span><span className="opacity-60 text-[6px] uppercase">PHY</span></div>
                             </div>
                        </div>

                        {/* Interactive Controls Overlay (visible on hover) */}
                        <div className="absolute inset-x-0 bottom-[12%] flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-all z-40 translate-y-4 group-hover:translate-y-0">
                             <div className="flex items-center gap-1 bg-white/95 backdrop-blur-xl px-3 py-1.5 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.4)] border border-white">
                                {p.parentPin && (
                                  <span className="text-[9px] bg-navy text-neon px-2 py-0.5 rounded-full font-mono font-black">
                                    {p.parentPin}
                                  </span>
                                )}
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleGenerateParentPin(e, p.id); }}
                                  className="text-[9px] font-black uppercase text-gray-500 hover:text-navy px-1.5 transition-colors"
                                >
                                  GEN
                                </button>
                                <div className="w-px h-3 bg-gray-200 mx-1" />
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleOpenStatEdit(e, p); }}
                                  className="text-gray-500 hover:text-navy transition-colors px-1"
                                >
                                  <Icon name="settings" size={14} />
                                </button>
                             </div>
                        </div>
                    </div>
                  </div>"""

start_idx = -1
end_idx = -1

for i, line in enumerate(lines):
    if "onClick={() => setActiveDossierPlayerId(p.id)}" in line:
        # Found the onClick, now look up for the nearest return (
        for j in range(i, i-10, -1):
            if "return (" in lines[j]:
                start_idx = j
                break
        if start_idx != -1:
            # Find closing ); of the return
            depth = 0
            for j in range(start_idx, len(lines)):
                depth += lines[j].count("(")
                depth -= lines[j].count(")")
                if depth == 0 and ");" in lines[j]:
                    end_idx = j
                    break
        if start_idx != -1 and end_idx != -1:
            break

if start_idx != -1 and end_idx != -1:
    new_lines = lines[:start_idx] + [new_card_jsx + "\n"] + lines[end_idx+1:]
    with open(file_path, 'w') as f:
        f.writelines(new_lines)
    print(f"Successfully replaced card logic at lines {start_idx+1}-{end_idx+1}")
else:
    print(f"Could not find card return statement. start_idx={start_idx}, end_idx={end_idx}")
    sys.exit(1)
