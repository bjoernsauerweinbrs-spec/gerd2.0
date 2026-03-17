3054:     <div className="space-y-6">
3055:       <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-4">
3056:         <div className="hidden md:block w-1 h-12 bg-gradient-to-b from-red-500 to-red-800 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.4)]"></div>
3057:         <div>
3058:           <h2 className="text-xl md:text-3xl font-black uppercase italic tracking-tighter shadow-sm text-white drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]">
3059:             Global Admin Dashboard
3060:           </h2>
3061:           <p className="text-red-500 font-mono text-[10px] md:text-sm tracking-widest mt-1 uppercase">
3062:             Gerd 2.0 | THE MASTER VIEW
3063:           </p>
3064:         </div>
3065:       </div>
3066: 
3067:       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
3068:         
3069:         {/* Left: Silo Synergy Monitor */}
3070:         <div className="glass-panel p-6 border-t-2 border-red-500/50 flex flex-col relative overflow-hidden">
3071:           <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-red-500/5 to-transparent pointer-events-none"></div>
3072:           <h3 className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-4 flex items-center gap-2 border-b border-white/10 pb-3"><Icon name="cpu" size={14}/> Silo-Synergy Monitor</h3>
3073:           
3074:           <div className="space-y-4 mb-6">
3075:             {alerts.map((alert, idx) => (
3076:               <div key={idx} className={`p-4 rounded border flex items-start gap-3 ${
3077:                 alert.type === 'mismatch' ? 'bg-orange-500/10 border-orange-500/30' : 
3078:                 alert.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-green-500/10 border-green-500/30'
3079:               }`}>
3080:                 <Icon name={alert.type === 'ok' ? "check-circle" : "alert-triangle"} size={16} className={`mt-0.5 ${
3081:                   alert.type === 'mismatch' ? 'text-orange-500' : 
3082:                   alert.type === 'warning' ? 'text-yellow-500' : 'text-green-500'
3083:                 }`} />
3084:                 <p className="text-xs font-mono text-white/80 leading-relaxed shadow-sm">{alert.text}</p>
3085:               </div>
3086:             ))}
3087:           </div>
3088: 
3089:           <div className="grid grid-cols-2 gap-4 mt-auto">
3090:             <div className="bg-black/50 p-3 rounded border border-white/5">
3091:                <div className="text-[9px] uppercase tracking-widest text-white/40 mb-1">Global Budget</div>
3092:                <div className="text-lg font-black text-white">{(globalBudget / 1000000).toFixed(1)}M €</div>
3093:             </div>
3094:             <div className="bg-black/50 p-3 rounded border border-white/5">
3095:                <div className="text-[9px] uppercase tracking-widest text-white/40 mb-1">Total Squad Size</div>
3096:                <div className="text-lg font-black text-white">{totalPlayers} <span className="text-xs font-normal text-white/40 ml-1">Spieler</span></div>
3097:             </div>
3098:           </div>
3099:         </div>
3100: 
3101:         {/* Right: Gerd-DNA Score & Export */}
3102:         <div className="space-y-6 flex flex-col">
3103:            <div className="glass-panel p-6 border-t-2 border-gold/50 flex flex-col items-center justify-center relative overflow-hidden group min-h-[220px]">
3104:               <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(212,175,55,0.1)_0%,_transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
3105:               
3106:               <h3 className="text-[10px] font-black uppercase tracking-widest text-gold mb-2 self-start absolute top-4 left-6">Overall Gerd-DNA Score</h3>
3107:               
3108:               <div className="relative mt-8">
3109:                 {/* Outer Ring */}
3110:                 <svg width="120" height="120" viewBox="0 0 120 120" className="rotate-[-90deg]">
3111:                   <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
3112:                   <circle 
3113:                     cx="60" cy="60" r="54" fill="none" stroke="#d4af37" strokeWidth="6" 
3114:                     strokeDasharray="339.29" 
3115:                     strokeDashoffset={339.29 - (339.29 * targetDNA) / 100}
3116:                     className="transition-all duration-1000 ease-out"
3117:                     strokeLinecap="round"
3118:                     filter="drop-shadow(0 0 4px rgba(212,175,55,0.6))"
3119:                   />
3120:                 </svg>
3121:                 <div className="absolute inset-0 flex flex-col items-center justify-center">
3122:                    <div className="text-3xl font-black italic text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">{targetDNA}%</div>
3123:                 </div>
3124:               </div>
3125:               
3126:               <p className="text-[10px] text-white/40 font-mono mt-6 text-center max-w-[80%] uppercase tracking-widest">
3127:                 Grad der Übereinstimmung operativer Entscheidungen mit dem Wertegerüst.
3128:               </p>
3129:            </div>
3130: 
3131:            <div className="glass-panel p-5 border border-white/5 flex flex-col justify-center flex-1">
3132:               <h3 className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-3 block">Reporting & Export</h3>
3133:               <p className="text-xs text-white/60 mb-4 font-mono leading-relaxed">
3134:                 Generiert einen komprimierten PDF-Bericht (Executive Summary) aus allen 4 Silos für den Vorstand.
3135:               </p>
3136:               <button 
3137:                 onClick={handleExport}
3138:                 disabled={exportStatus !== "idle"}
3139:                 className={`w-full py-4 mb-3 rounded text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
3140:                   exportStatus === "idle" ? "bg-white text-black hover:bg-gray-200 shadow-[0_0_20px_rgba(255,255,255,0.2)]" :
3141:                   exportStatus === "loading" ? "bg-white/20 text-white cursor-wait" :
3142:                   "bg-green-500/20 text-green-400 border border-green-500/50"
3143:                 }`}
3144:               >
3145:                 {exportStatus === "idle" && (
3146:                   <React.Fragment>
3147:                     <Icon name="file-text" size={16}/> Executive Summary (PDF)
3148:                   </React.Fragment>
3149:                 )}
3150:                 {exportStatus === "loading" && (
3151:                   <React.Fragment>
3152:                     <Icon name="loader" size={16} className="animate-spin"/> Generiere Berichte...
3153:                   </React.Fragment>
3154:                 )}
3155:                 {exportStatus === "success" && (
3156:                   <React.Fragment>
3157:                     <Icon name="check" size={16}/> PDF Erstellt
3158:                   </React.Fragment>
3159:                 )}
3160:               </button>
3161:               <div className="flex gap-2 w-full mt-2">
3162:                  <ShareModule />
3163:                  <button onClick={onResetSystem} className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 px-3 py-1.5 rounded text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center shadow-sm">
3164:                    <Icon name="refresh-cw" size={12} className="mr-1"/> Handover Reset
3165:                  </button>
3166:               </div>
3167:            </div>
3168:         </div>
3169: 
3170:       </div>
3171:       
3172:       {/* Bottom: Zukunft des Vereins (Academy Talents) */}
3173:       <div className="glass-panel p-6 border-t-2 border-green-500/50 relative overflow-hidden">
3174:          <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-green-500/5 to-transparent pointer-events-none"></div>
3175:          <h3 className="text-[10px] font-black uppercase tracking-widest text-green-500 mb-4 flex items-center gap-2 border-b border-white/10 pb-3 relative z-10"><Icon name="star" size={14}/> Zukunft des Vereins (NLZ High-Potentials)</h3>
3176:          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 relative z-10">
3177:            {squad.filter(p => p.age <= 19).slice(0, 4).map(talent => {
3178:               const profiProb = talent.dna ? Math.round(((talent.dna.resilience || 50) * 0.4) + ((talent.dna.malocher || 50) * 0.4) + ((talent.dna.anticipation || 50) * 0.2)) : 50;
3179:               return (
3180:               <div key={talent.id} className="bg-black/50 p-4 rounded border border-white/5 flex flex-col relative overflow-hidden hover:border-green-500/30 transition-colors">
3181:                  <div className="absolute top-0 right-0 w-16 h-full bg-gradient-to-l from-green-500/10 to-transparent pointer-events-none"></div>
3182:                  <div className="flex justify-between items-start mb-3">
3183:                    <div>
3184:                      <div className="text-white font-black uppercase tracking-widest truncate max-w-[120px]">{talent.name}</div>
3185:                      <div className="text-[9px] text-green-400 font-mono">U{talent.age} | {talent.position}</div>
3186:                    </div>
3187:                    <div className="bg-green-500/20 text-green-400 font-black text-xs px-2 py-1 rounded border border-green-500/30">{talent.marketValue}</div>
3188:                  </div>
3189:                  {talent.dna && (
3190:                    <div className="mt-auto space-y-2">
3191:                      <div>
3192:                        <div className="flex justify-between text-[8px] uppercase tracking-widest text-white/50 mb-0.5 font-bold">
3193:                          <span>Profi-Wahrscheinlichkeit</span><span className={profiProb > 80 ? "text-green-400" : "text-white"}>{profiProb}%</span>
3194:                        </div>
3195:                        <div className="w-full h-1 bg-white/10 rounded overflow-hidden">
3196:                          <div className={`h-full ${profiProb > 80 ? 'bg-green-400 shadow-[0_0_5px_#4ade80]' : 'bg-white/40'}`} style={{ width: `${profiProb}%` }}></div>
3197:                        </div>
3198:                      </div>
3199:                    </div>
3200:                  )}
3201:               </div>
3202:            )})}
3203:            {squad.filter(p => p.age <= 19).length === 0 && (
3204:               <div className="col-span-full text-center p-6 text-[10px] text-white/40 font-mono uppercase tracking-widest border border-dashed border-white/10 rounded bg-black/20">
3205:                 <Icon name="users" size={24} className="mx-auto text-white/20 mb-2"/>
3206:                 Noch keine Talente im Academy Hub gescoutet.
3207:               </div>
3208:            )}
3209:       </div>
3210: 
3211:       {/* Executive Summary Overlay */}
3212:       
3213:         {showSummary && (
3214:           <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-md">
3215:               <motion.div initial={{y:50, scale:0.95}} animate={{y:0, scale:1}} transition={{type:"spring", stiffness:300, damping:25}} className="w-full max-w-3xl h-[85vh] bg-white rounded-xl overflow-hidden flex flex-col shadow-[0_0_50px_rgba(255,255,255,0.15)] ring-1 ring-white/20 relative text-black">
3216:                  <div className="bg-[#050a14] text-white p-5 flex justify-between items-center shrink-0 border-b border-white/10">
3217:                      <h3 className="font-black uppercase tracking-widest text-sm flex items-center gap-3"><Icon name="file-text" size={18} className="text-white"/> EXECUTIVE SUMMARY <span className="text-[9px] text-white/40 bg-white/10 px-2 py-0.5 rounded-full ml-2">PRINT-READY</span></h3>
3218:                      <div className="flex gap-3">
3219:                         <button onClick={() => window.print()} className="text-white hover:text-gray-300 transition-colors bg-white/10 px-3 py-1 rounded text-xs uppercase font-bold tracking-widest flex items-center gap-2"><Icon name="printer" size={14}/> Print</button>
3220:                         <button onClick={() => setShowSummary(false)} className="text-white/50 hover:text-white transition-colors"><Icon name="x" size={24}/></button>
3221:                      </div>
3222:                  </div>
3223:                  <div className="flex-1 overflow-y-auto p-8 bg-white hide-scrollbar print-mode-a4 relative">
3224:                    <div className="max-w-[595px] mx-auto">
3225:                      <div className="border-b-4 border-black pb-4 mb-8 flex justify-between items-end">
3226:                        <div>
3227:                          <h1 className="text-3xl font-black uppercase tracking-tighter text-black">GERD 2.0 | EXECUTIVE SUMMARY</h1>
3228:                          <p className="text-xs font-mono tracking-widest text-gray-500 mt-1 uppercase">Saison-Reporting & Status</p>
3229:                        </div>
3230:                        <Icon name="shield" size={40} className="text-black" />
3231:                      </div>
3232:                      
3233:                      <div className="grid grid-cols-2 gap-8 mb-8">
3234:                        <div className="border border-gray-300 p-4 rounded">
3235:                          <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Finanz-Status</h4>
3236:                          <p className="text-2xl font-black">{(globalBudget / 1000000).toFixed(1)}M €</p>
3237:                        </div>
3238:                        <div className="border border-gray-300 p-4 rounded bg-gray-50">
3239:                          <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Taktik-Prognose</h4>
3240:                          <p className="text-lg font-bold uppercase">{activeTactic}</p>
3241:                        </div>
3242:                      </div>
3243: 
3244:                      <div className="border border-gray-300 p-6 rounded mb-8 relative overflow-hidden">
3245:                        <div className="absolute right-[-20px] top-[-20px] opacity-5"><Icon name="activity" size={100}/></div>
3246:                        <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">DNA-Score & Squad</h4>
3247:                        <div className="flex items-center gap-6">
3248:                          <div className="text-5xl font-black font-mono tracking-tighter">{targetDNA}%</div>
3249:                          <div>
3250:                            <p className="text-sm font-bold">{highDnaPlayers} Elite-Mentalitätsspieler</p>
3251:                            <p className="text-xs text-gray-500">{squad.length} Spieler gesamt im Kader</p>
3252:                          </div>
3253:                        </div>
3254:                      </div>
3255:                      
3256:                      <div className="mb-8">
3257:                        <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4 border-b border-gray-200 pb-2">Top Jugendtalente (Watchlist)</h4>
3258:                        <div className="space-y-3">
3259:                          {squad.filter(p => p.age <= 21).slice(0, 3).map((p, i) => (
3260:                            <div key={i} className="flex justify-between items-center border-b border-gray-100 pb-2">
3261:                              <div>
3262:                                <span className="font-bold text-sm uppercase">{p.name}</span>
3263:                                <span className="text-[10px] text-gray-500 ml-2">{p.position} | {p.age} J.</span>
3264:                              </div>
3265:                              <span className="text-xs font-mono">{p.marketValue}</span>
3266:                            </div>
3267:                          ))}
3268:                          {squad.filter(p => p.age <= 21).length === 0 && (
3269:                            <p className="text-xs text-gray-400 italic">Keine Nachwuchsspieler im Fokus.</p>
3270:                          )}
3271:                        </div>
3272:                      </div>
3273:                      
3274:                      <div className="mt-12 pt-4 border-t-2 border-dashed border-gray-300 text-center">
3275:                        <p className="text-[8px] font-mono text-gray-400 uppercase tracking-widest">Generiert von Gerd 2.0 IDS • Streng Vertraulich</p>
3276:                      </div>
3277:                    </div>
3278:                  </div>
3279:               </motion.div>
3280:           </motion.div>
3281:         )}
3282:       
3283:     </div>
3284:   );
3285: };
