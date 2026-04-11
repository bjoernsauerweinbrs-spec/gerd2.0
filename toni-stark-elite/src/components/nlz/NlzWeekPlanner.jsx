import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';
import Icon from '../Icon';
import ReactMarkdown from 'react-markdown';

const NlzWeekPlanner = ({ clubInfo }) => {
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activePlan, setActivePlan] = useState(null);
  const [activePress, setActivePress] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('nlz_schedule')
      .select('*')
      .order('match_date', { ascending: true });
    
    if (!error) setMatches(data);
    setIsLoading(false);
  };

  const generateWeekPlan = async (match) => {
    setSelectedMatch(match);
    setIsGenerating(true);
    setActivePress(null);
    try {
      const geminiKey = localStorage.getItem('stark_gemini_key');
      const response = await fetch('http://localhost:3001/api/nlz/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          opponent: match.opponent,
          matchDate: match.match_date,
          apiKey: geminiKey 
        })
      });
      const data = await response.json();
      setActivePlan(data.plan);
      setIsOfflineMode(data.isOffline || false);
    } catch (err) {
      console.error(err);
      setIsOfflineMode(true);
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePressReport = async (match) => {
    setIsGenerating(true);
    try {
      const geminiKey = localStorage.getItem('stark_gemini_key');
      const response = await fetch('http://localhost:3001/api/nlz/generate-press', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          opponent: match.opponent,
          matchDate: match.match_date,
          trainingFocus: "Kreatives Passspiel & Umschalt-Reaktion", // Mock or from plan
          apiKey: geminiKey 
        })
      });
      const data = await response.json();
      setActivePress(data.report);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black text-white uppercase tracking-tighter">Nächste Spiele</h3>
            <button onClick={fetchMatches} className="text-white/40 hover:text-white transition-colors">
              <Icon name="refresh-cw" size={14} />
            </button>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              <div className="animate-pulse space-y-2">
                {[1,2,3].map(i => <div key={i} className="h-12 bg-white/5 rounded-lg" />)}
              </div>
            ) : matches.length === 0 ? (
              <p className="text-xs text-white/40 italic">Keine Spiele gefunden. Scanne einen Spielplan.</p>
            ) : (
              matches.map((m) => (
                <div 
                  key={m.id} 
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedMatch?.id === m.id ? 'bg-redbull/20 border-redbull' : 'bg-white/5 border-white/10 hover:border-white/30'
                  }`}
                  onClick={() => setSelectedMatch(m)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] text-redbull font-black uppercase tracking-widest">{m.location}</span>
                    <span className="text-[10px] text-white/40 font-mono">{m.match_date}</span>
                  </div>
                  <p className="text-sm font-bold text-white leading-tight">{m.opponent}</p>
                </div>
              ))
            )}
          </div>

          {selectedMatch && (
            <div className="mt-6 pt-6 border-t border-white/10 flex flex-col gap-2">
               <button 
                disabled={isGenerating}
                onClick={() => generateWeekPlan(selectedMatch)}
                className="w-full py-2 px-4 bg-white text-black text-xs font-black uppercase rounded hover:bg-redbull hover:text-white transition-all flex items-center justify-center gap-2"
              >
                {isGenerating ? <Icon name="loader" size={14} className="animate-spin" /> : <Icon name="calendar" size={14} />}
                Trainingswoche planen
              </button>
              <button 
                disabled={isGenerating}
                onClick={() => generatePressReport(selectedMatch)}
                className="w-full py-2 px-4 bg-zinc-800 text-white text-xs font-black uppercase rounded hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
              >
                {isGenerating ? <Icon name="loader" size={14} className="animate-spin" /> : <Icon name="mic" size={14} />}
                Eltern-Info / Press
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-2">
        {(activePlan || activePress || isGenerating) ? (
          <div className="bg-white/5 border border-white/10 rounded-xl p-8 backdrop-blur-md min-h-[400px] relative overflow-hidden">
             {isGenerating && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-10">
                   <div className="text-center">
                      <Icon name="cpu" className="mx-auto text-redbull animate-spin mb-3" size={40} />
                      <p className="text-redbull font-black uppercase tracking-widest animate-pulse">Gerd AI rechnet...</p>
                   </div>
                </div>
             )}
             
             {activePlan && !activePress && (
               <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className="text-2xl font-black text-white uppercase mb-6 flex items-center gap-2">
                    <Icon name="clipboard-list" className="text-redbull" />
                    Taktischer Wochenplan
                    {isOfflineMode && (
                       <span className="ml-auto text-[8px] bg-redbull/20 text-redbull px-2 py-0.5 rounded border border-redbull/30 animate-pulse">
                          LOCAL NEURAL CACHE SYNC
                       </span>
                    )}
                  </h2>
                  <div className="prose prose-invert prose-sm max-w-none prose-p:text-white/70 prose-headings:text-white prose-strong:text-redbull">
                    <ReactMarkdown>{activePlan}</ReactMarkdown>
                  </div>
               </div>
             )}

             {activePress && (
               <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className="text-2xl font-black text-white uppercase mb-6 flex items-center gap-2">
                    <Icon name="megaphone" className="text-blue-400" />
                    Vorbericht & Eltern-Info
                  </h2>
                  <div className="bg-white/5 p-6 rounded-lg border border-white/10 relative group">
                    <button 
                      onClick={() => navigator.clipboard.writeText(activePress)}
                      className="absolute top-4 right-4 p-2 bg-white/10 rounded hover:bg-white/20 transition-all opacity-0 group-hover:opacity-100"
                      title="Kopieren"
                    >
                      <Icon name="copy" size={16} />
                    </button>
                    <div className="prose prose-invert prose-sm max-w-none text-white/80">
                      <ReactMarkdown>{activePress}</ReactMarkdown>
                    </div>
                  </div>
               </div>
             )}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center border border-dashed border-white/10 rounded-xl bg-white/[0.02]">
            <div className="text-center max-w-xs">
              <Icon name="calendar-days" className="mx-auto text-white/10 mb-4" size={48} />
              <p className="text-white/40 text-sm italic">Wähle ein Spiel aus der Liste, um die KI-gestützte Wochenplanung zu starten.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NlzWeekPlanner;
