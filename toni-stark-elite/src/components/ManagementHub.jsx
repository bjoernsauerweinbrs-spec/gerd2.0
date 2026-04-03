import React, { useState, useEffect, useMemo } from 'react';
import Icon from './Icon';
import AiSettingsWidget from './AiSettingsWidget';
import { getAiConfig, sendAiRequest, searchLogistics, generateSponsorInquiry, uploadScoutingReport } from '../utils/aiConfig';
import { supabase, saveLogisticsEntry, fetchLogistics } from '../utils/supabaseClient';

const ManagementHub = ({ truthObject, setTruthObject, activeRole, onRefreshData }) => {
   // State for Amateur Mode
   const isAmateurMode = truthObject?.club_info?.isAmateurMode || false;
   
   // --- PR & Media Logic ---
   const [activePrView, setActivePrView] = useState("inbox");
   const [activeInterview, setActiveInterview] = useState(null);
   const [interviewQuestions, setInterviewQuestions] = useState("");
   const [interviewAnswers, setInterviewAnswers] = useState("");
   const [isPublishing, setIsPublishing] = useState(false);
   const [isComputing, setIsComputing] = useState(false);

   // --- Logistics Logic ---
   const [activeLogisticsId, setActiveLogisticsId] = useState(null);
   const [isOffering, setIsOffering] = useState(false);

   // --- Pro-Procurement Logic ---
   const [procurementQuery, setProcurementQuery] = useState("");
   const [isSearchingProcurement, setIsSearchingProcurement] = useState(false);
   const [procurementResults, setProcurementResults] = useState([]);
   const [activeInquiry, setActiveInquiry] = useState(null);
   const [isGeneratingInquiry, setIsGeneratingInquiry] = useState(false);
   const [generatedEmail, setGeneratedEmail] = useState("");

   // --- Supabase Sync: Logistics & Ledger ---
   const [ledger, setLedger] = useState([]);

   useEffect(() => {
       const loadLogistics = () => {
           fetchLogistics().then(data => {
               if (data.length > 0) {
                   setLedger(data);
                   // Also sync to global truthObject for components that don't use Supabase yet
                   setTruthObject(prev => ({ 
                       ...prev, 
                       finance_ledger: data.filter(e => e.type === 'income' || e.type === 'expense'),
                       logistics_requests: data.filter(e => e.status === 'requested' || e.status === 'approved')
                   }));
               }
           });
       };

       loadLogistics();

       // Real-time subscription for logistics
       const channel = supabase
           .channel('public:logistics_ledger_mgmt')
           .on('postgres_changes', { event: '*', schema: 'public', table: 'logistics_ledger' }, (payload) => {
               loadLogistics();
           })
           .subscribe();

       return () => supabase.removeChannel(channel);
   }, []);

   const handleProcurementSearch = () => {
       if (!procurementQuery) return;
       setIsSearchingProcurement(true);
       
       searchLogistics(procurementQuery, truthObject?.club_info)
       .then(data => {
           if (Array.isArray(data)) setProcurementResults(data);
           else setProcurementResults([]);
       })
       .catch(err => console.error(err))
       .finally(() => setIsSearchingProcurement(false));
   };

    const handleSendProposal = async (item) => {
        const isManager = activeRole === 'Manager';
        const newReq = {
            id: Date.now(),
            item_name: isManager ? `ORDER: ${item.title}` : `VORSCHLAG: ${item.title}`,
            amount: parseFloat(item.price.replace(/[^0-9.]/g, '')),
            type: 'expense',
            category: 'material',
            status: isManager ? "approved" : "requested",
            requester_name: activeRole,
            ai_offer_json: item
        };
        await saveLogisticsEntry(newReq);
        const updated = await fetchLogistics();
        setLedger(updated);
        
        if (isManager) {
            alert("Bestellung direkt freigegeben & im Ledger verbucht!");
        } else {
            alert("Vorschlag an den Manager gesendet!");
        }
    };

   const handleGenerateInquiry = (item) => {
       setActiveInquiry(item);
       setIsGeneratingInquiry(true);
       setGeneratedEmail("");

       generateSponsorInquiry("Potenzieller Sponsor", item.title, truthObject?.club_info)
       .then(data => {
           setGeneratedEmail(data.email || "Kein Text generiert.");
       })
       .catch(err => {
           console.error(err);
           setGeneratedEmail(`FEHLER: ${err.message}. Bitte API-Key oder Quota prüfen.`);
       })
       .finally(() => setIsGeneratingInquiry(false));
   };

   const clubName = truthObject?.club_info?.name || "Stark Elite";
   
   // --- Financial Ledger Logic ---
   const [newEntry, setNewEntry] = useState({ type: "expense", category: "", amount: 0, note: "" });

   const handleAddLedgerEntry = async () => {
       if (!newEntry.category || newEntry.amount <= 0) return;
       const entry = { ...newEntry, item_name: newEntry.category };
       await saveLogisticsEntry(entry);
       const updated = await fetchLogistics();
       setLedger(updated);
       setNewEntry({ type: "expense", category: "", amount: 0, note: "" });
   };

   const handleDeleteLedgerEntry = async (id) => {
       await supabase.from('logistics_ledger').delete().eq('id', id);
       const updated = await fetchLogistics();
       setLedger(updated);
   };

   const totalIncome = useMemo(() => ledger.filter(e => e.type === "income").reduce((sum, e) => sum + parseFloat(e.amount), 0), [ledger]);
   const totalExpense = useMemo(() => ledger.filter(e => e.type === "expense").reduce((sum, e) => sum + parseFloat(e.amount), 0), [ledger]);

   // Genuinely Genius AI Prompts for PR Interviews
   const prInterviews = [
       {
           id: "match-recap",
           type: "Elite Match Analysis",
           title: isAmateurMode ? "Derby-Nachlese (Exklusiv)" : "Champions-Level Tactical Recap",
           prompt: `Du bist ein preisgekrönter Sport-Investigativ-Journalist. Die Vereinsmedien von ${clubName} verlangen maximale Tiefe.
Der Manager ist nach dem letzten Spiel im Studio. 
Aufgabe: Formuliere 2 extrem scharfe, fachlich fundierte Fragen (Themen: Asymmetrisches Pressing, Belastungssteuerung oder psychologische Barrieren der Startelf).
WICHTIG: Antworte AUSSCHLIESSLICH mit den beiden Fragen als Aufzählung. Kein Vorgeplänkel.`
       },
       {
           id: "transfer-talk",
           type: "Market Intelligence",
           title: isAmateurMode ? "Lokale Helden & Neuzugänge" : "Global Scouter Insights",
           prompt: `Du bist Chef-Analytiker der Vereinsmedien. Die Transferperiode ist heiß.
Stelle dem Manager 2 Fragen zur Kader-Symmetrie und den ökonomischen Grenzkosten neuer Star-Einkäufe. (Bei Amateur-Fokus: Frage nach regionaler Identität und Budget-Disziplin).
WICHTIG: Antworte AUSSCHLIESSLICH mit den beiden Fragen als Aufzählung.`
       }
   ];

   const handleOpenInterview = (interview) => {
       setActiveInterview(interview);
       setInterviewQuestions("");
       setInterviewAnswers("");
       
       const { activeKey } = getAiConfig();
       if (!activeKey) return;
       setIsComputing(true);
       
       sendAiRequest(interview.prompt)
       .then(res => setInterviewQuestions(res.trim()))
       .catch(err => setInterviewQuestions("Fehler beim Abrufen der Fragen."))
       .finally(() => setIsComputing(false));
   };

   const handleSubmitInterview = () => {
       if (!activeInterview || !interviewAnswers) return;
       setIsPublishing(true);

       const systemPrompt = `Du bist Chefredakteur für das High-End Vereins-Magazin von ${clubName} (Persona: Neural-Gerd).
Fragen & Antworten: ${interviewQuestions} | ${interviewAnswers}
Schreibe eine absolute Frontpage-Story. Aggressiv, elitär, kompetent. 
HEADLINE: [Text] | EXCERPT: [Text] | CONTENT: [Text]`;

       sendAiRequest(systemPrompt)
       .then(res => {
           try {
              const headlineMatch = res.match(/HEADLINE:\s*(.*)/i);
              const excerptMatch = res.match(/EXCERPT:\s*(.*)/i);
              const contentMatch = res.match(/CONTENT:\s*([\s\S]*)/i);
              const newArticle = { type: "EXKLUSIV", headline: headlineMatch[1].trim(), author: "Neural-Gerd", excerpt: excerptMatch[1].trim(), content: contentMatch[1].trim(), id: Date.now() };
              setTruthObject(prev => ({ ...prev, magazine_articles: [newArticle, ...(prev.magazine_articles || [])] }));
              setActiveInterview(null);
           } catch(e) { alert("Format-Fehler."); }
       })
       .catch(err => alert("AI Error."))
       .finally(() => setIsPublishing(false));
   };

   const handleApproveLogistics = async (req) => {
        setIsOffering(true);
        const offerPrompt = `Erstelle ein professionelles Angebot für 20 Trainingsbälle zum Bestpreis (Günstigstes Ergebnis z.B. bei Amazon/Sarango ca. 349€).
        Empfänger: NLZ Coach
        Absender: Management ${clubName}
        Betreff: Freigabe Ihrer Material-Anforderung
        Schreibe einen kurzen, verbindlichen Text inkl. Preisbestätigung.`;

        try {
            const res = await sendAiRequest(offerPrompt);
            
            // 1. Update the original request status and add AI offer
            const approvedReq = {
                ...req,
                status: "approved",
                ai_offer_json: { offer_text: res, price: 349 }
            };
            await saveLogisticsEntry(approvedReq);

            // 2. Create an actual expense entry in the ledger
            const ballExpense = { 
                id: Date.now(), 
                type: "expense", 
                category: "material", 
                item_name: `ORDER: 20x Trainingsbälle (${req.item_name})`,
                amount: 349, 
                status: "approved",
                note: `Approved for ${req.requester_name || 'NLZ'}` 
            };
            await saveLogisticsEntry(ballExpense);

            // Real-time subscription will handle the UI update via loadLogistics()
            alert("Angebot an NLZ gesendet, Budget belastet & in Cloud gespeichert.");
            setActiveLogisticsId(null);
        } catch (error) {
            console.error("Error approving logistics:", error);
            alert("Fehler bei der Genehmigung.");
        } finally {
            setIsOffering(false);
        }
    };

   const kpiData = useMemo(() => {
       const balance = totalIncome - totalExpense;
       if (isAmateurMode) {
           return [
               { label: "Cash-Bestand", value: `${balance.toLocaleString()} €`, trend: balance > 0 ? "up" : "down" },
               { label: "Mitgliedsbeiträge", value: `${totalIncome.toLocaleString()} €`, trend: "up" },
               { label: "Gesamt-Ausgaben", value: `${totalExpense.toLocaleString()} €`, trend: "down" },
               { label: "Sponsoren", value: "14", trend: "up" },
           ];
       }
       return [
            { label: "Liquidität", value: `${(balance/1000).toFixed(1)}k €`, trend: "up" },
            { label: "Sponsoring Leads", value: "89", trend: "up" },
            { label: "Budget-Disziplin", value: "98%", trend: "up" },
            { label: "OVR Squad Value", value: "245M €", trend: "up" },
       ];
   }, [isAmateurMode, totalIncome, totalExpense]);

   return (
    <div className="space-y-10 animate-fade-in pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl shadow-2xl">
        <div>
          <h2 className="text-4xl font-black uppercase tracking-tighter text-white italic mb-2">Executive Suite</h2>
          <p className="text-[10px] text-neon uppercase tracking-[0.4em] font-mono">
            {isAmateurMode ? "Amateur Club Management | Vereinsheim-Modus" : "High-Performance Football Ops | Pro-Modus"}
          </p>
        </div>
        <div className="mt-6 md:mt-0 flex gap-4">
            <div className="flex p-1 bg-black/40 rounded-xl border border-white/10">
                <button 
                  onClick={() => setTruthObject(p => ({...p, club_info: {...p.club_info, isAmateurMode: false}}))}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${!isAmateurMode ? 'bg-neon text-black shadow-[0_0_20px_rgba(0,243,255,0.4)]' : 'text-white/40 hover:text-white'}`}
                >
                    Pro
                </button>
                <button 
                  onClick={() => setTruthObject(p => ({...p, club_info: {...p.club_info, isAmateurMode: true}}))}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${isAmateurMode ? 'bg-gold text-black shadow-[0_0_20px_rgba(255,215,0,0.4)]' : 'text-white/40 hover:text-white'}`}
                >
                    Amateur
                </button>
            </div>
            <button onClick={onRefreshData} className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase text-white hover:bg-white/10 transition-all flex items-center gap-2">
                <Icon name="refresh-cw" size={14} /> Reset
            </button>
            <AiSettingsWidget />
        </div>
      </div>

      {/* === TACTICAL RESEARCH DOSSIER (Gerd V5 / NotebookLM Style) === */}
      {activeRole === 'Trainer' && (
        <div className="space-y-6 mb-10">
          {/* RAG Uploader: Tactical Research Desk */}
          <div className="bg-white border border-black/10 rounded-3xl p-6 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-navy/5 flex items-center justify-center text-navy">
                <Icon name="file-text" size={24} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-navy uppercase tracking-wider">Tactical Research Desk</h4>
                <p className="text-[10px] text-black/40 font-medium">Upload PDF Scouting-Reports (Gerd V6 RAG-Grounding)</p>
              </div>
            </div>
            <label className="px-6 py-3 bg-navy text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-navy/90 transition-all cursor-pointer flex items-center gap-2">
              <Icon name="upload-cloud" size={14} /> Dokument hochladen
              <input 
                type="file" 
                className="hidden" 
                accept=".pdf"
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  const formData = new FormData();
                  formData.append('file', file);
                  try {
                    const data = await uploadScoutingReport(formData);
                    if (data.success) {
                      alert(`NotebookLM Sync: ${data.chars} Zeichen extrahiert. Gerd V6 ist jetzt auf das Dokument fokussiert.`);
                      onRefreshData(); // Trigger re-hydration with new context
                    }
                  } catch (err) {
                    console.error("RAG Upload failed:", err);
                  }
                }}
              />
            </label>
          </div>

          <div className="bg-[#f8f9fa] border border-black/10 rounded-[2rem] p-4 md:p-10 shadow-3xl text-[#1a1c1e] animate-slide-up relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-navy/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
               
               {/* Dossier Header */}
               <div className="flex flex-col md:flex-row justify-between items-start border-b border-black/10 pb-8 mb-10 gap-6">
                   <div className="flex-1">
                       <div className="flex items-center gap-3 mb-4">
                           <div className="px-3 py-1 bg-navy text-white rounded-full text-[8px] font-black uppercase tracking-[0.2em]">Source Grounded</div>
                           <div className="text-[10px] text-black/40 font-mono italic">Document ID: STARK-TAC-{Date.now().toString().slice(-6)}</div>
                       </div>
                       <h1 className="text-4xl font-serif font-light italic leading-tight mb-2">Tactical Intelligence Dossier</h1>
                       <p className="text-xl font-medium text-black/60 uppercase tracking-widest">{truthObject?.club_info?.name || "Global Scouting"}</p>
                   </div>
                   <div className="flex flex-col items-end gap-2 text-right">
                       <div className="text-[10px] font-bold uppercase tracking-widest text-black/40">Gerd V5 Research Engine</div>
                       <div className="text-sm font-mono font-medium">Synced: {new Date().toLocaleTimeString()}</div>
                   </div>
               </div>

               {/* Dossier Main Grid */}
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                   
                   {/* Left Column: Research Notes & Analysis */}
                   <div className="lg:col-span-7 space-y-10">
                       <section>
                           <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-navy mb-6 flex items-center gap-3">
                               <div className="w-4 h-[2px] bg-navy"></div> Executive Summary
                           </h3>
                           <div className="bg-white border border-black/5 rounded-2xl p-8 shadow-sm">
                               <div className="text-sm leading-relaxed text-black/80 font-serif whitespace-pre-wrap">
                                   {truthObject?.club_info?.liveIntelligence?.analyticalSummary || "Deep Match Research wird für das System skaliert..."}
                               </div>
                           </div>
                       </section>

                       <section>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-4 h-[2px] bg-navy"></div>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-navy">
                                    Tactical Grounding & Sources
                                </h3>
                                {truthObject?.club_info?.groundingSources?.length > 0 && (
                                    <div className="px-2 py-0.5 rounded-full bg-navy/10 border border-navy/20 flex items-center gap-1.5 ml-2">
                                        <div className="w-1 h-1 rounded-full bg-navy animate-pulse" />
                                        <span className="text-[9px] font-bold text-navy uppercase tracking-tighter">Live Neural Research</span>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {/* NEW: Automated Google Grounding Sources (with Globe Icons) */}
                                {(truthObject?.club_info?.groundingSources || []).map((src, i) => (
                                    <a 
                                        key={`gs-${i}`} 
                                        href={src} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-4 bg-navy/5 border border-navy/10 rounded-xl hover:border-navy/40 transition-all group"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-navy/10 flex items-center justify-center text-navy group-hover:bg-navy group-hover:text-white transition-colors">
                                             <Icon name="globe" size={14} />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[10px] font-black uppercase tracking-tight text-navy/80 group-hover:text-navy truncate">
                                                {src.replace('https://', '').replace('www.', '').split('/')[0]}
                                            </span>
                                            <span className="text-[8px] font-bold text-navy/40 uppercase tracking-widest truncate">Verified Web Source</span>
                                        </div>
                                    </a>
                                ))}

                                {/* LEGACY: Pre-defined Simulation Sources */}
                                {(truthObject?.liveIntelligence?.sources || []).map((src, i) => (
                                    <div key={i} className="flex items-center gap-3 p-4 bg-navy/5 border border-navy/10 rounded-xl">
                                        <div className="w-8 h-8 rounded-lg bg-navy/10 flex items-center justify-center text-navy">
                                            <Icon name="link" size={14} />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-tight text-navy/60">
                                            {src}
                                        </span>
                                    </div>
                                ))}
                            </div>
                       </section>
                   </div>

                   {/* Right Column: Analytics & Graphics */}
                   <div className="lg:col-span-5 space-y-8">
                       <div className="bg-navy text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
                           <div className="relative z-10">
                               <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-8">Performance Indices</h3>
                               
                               {/* Custom SVG Performance Chart */}
                               <div className="flex items-end justify-between h-40 gap-4 mb-4">
                                   {(truthObject?.club_info?.liveIntelligence?.dataPoints || [
                                       {label: "S", value: 35}, {label: "R", value: 20}, {label: "N", value: 45}, {label: "T", value: 60}
                                   ]).map((dp, i) => (
                                       <div key={i} className="flex-1 flex flex-col items-center gap-3">
                                           <div className="relative w-full flex flex-col items-center">
                                                <div 
                                                    className="w-full bg-white/10 rounded-t-lg transition-all duration-1000" 
                                                    style={{ height: `${dp.value}%` }}
                                                ></div>
                                                <div className="absolute bottom-2 text-[10px] font-black">{dp.value}</div>
                                           </div>
                                           <span className="text-[9px] font-black uppercase tracking-widest text-white/40">{dp.label}</span>
                                       </div>
                                   ))}
                               </div>
                               <p className="text-[10px] italic text-white/20 border-t border-white/10 pt-4">Daten basieren auf Kicker-Tabelle {new Date().getFullYear()}.</p>
                           </div>
                       </div>

                       <div className="bg-white border border-black/5 rounded-3xl p-8 shadow-sm">
                           <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-black/30 mb-6">Upcoming Schedule</h3>
                            <div className="flex flex-col gap-6 mb-4">
                                <div className="flex items-center gap-6">
                                    <div className="flex-1">
                                        <div className="text-[9px] text-black/40 uppercase font-black mb-1">Last Match</div>
                                        <div className="text-sm font-serif italic text-navy">{truthObject?.club_info?.liveIntelligence?.lastMatch || "Refining..."}</div>
                                    </div>
                                    <div className="w-[2px] h-10 bg-black/5"></div>
                                    <div className="flex-1">
                                        <div className="text-[9px] text-black/40 uppercase font-black mb-1">Next Match</div>
                                        <div className="text-sm font-serif italic text-navy">{truthObject?.club_info?.liveIntelligence?.nextMatch || "Analyzing..."}</div>
                                    </div>
                                </div>
                                
                                {truthObject?.club_info?.liveIntelligence?.matchDetails && (
                                    <div className="p-6 bg-navy/5 rounded-2xl border border-black/5 space-y-4">
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-navy/40 border-b border-black/5 pb-2">
                                            <span>Match Details</span>
                                            <Icon name="activity" size={12} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <div className="text-[8px] text-black/40 uppercase font-bold mb-1">Torschützen</div>
                                                <div className="text-[11px] font-medium text-navy">
                                                    {truthObject.club_info.liveIntelligence.matchDetails.scorers.join(", ")}
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <div className="text-[8px] text-black/40 uppercase font-bold mb-1">Ballbesitz</div>
                                                    <div className="text-[11px] font-bold text-navy">{truthObject.club_info.liveIntelligence.matchDetails.possession}</div>
                                                </div>
                                                <div>
                                                    <div className="text-[8px] text-black/40 uppercase font-bold mb-1">Laufstrecke</div>
                                                    <div className="text-[11px] font-bold text-navy">{truthObject.club_info.liveIntelligence.matchDetails.runningDistance}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="p-4 bg-[#f8f9fa] rounded-2xl border border-black/5 text-[11px] leading-relaxed italic text-black/60">
                               {truthObject?.club_info?.liveIntelligence?.tacticalNotes || "Strategischer Fokus: Daten-Präzision für das Dossier."}
                           </div>
                       </div>
                   </div>
               </div>
          </div>
        </div>
      )}

      {/* KPI Dynamic Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {kpiData.map((kpi, i) => (
            <div key={i} className="bg-black/40 border border-white/10 p-6 rounded-3xl hover:border-white/20 transition-all group relative overflow-hidden">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">{kpi.label}</p>
                <h3 className="text-3xl font-black text-white mb-1">{kpi.value}</h3>
            </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* PR & Media Central */}
          <div className="bg-black/40 border border-white/10 rounded-3xl p-8">
              <h3 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3 mb-8">
                  <Icon name="mic" className="text-neon" /> Media Central
              </h3>
              <div className="space-y-4">
                  {prInterviews.map((item, i) => (
                      <div key={i} className="bg-white/5 border border-white/10 p-5 rounded-2xl flex items-center justify-between hover:bg-white/10 transition-all cursor-pointer group" onClick={() => handleOpenInterview(item)}>
                          <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-neon/10 border border-neon/20 flex items-center justify-center text-neon group-hover:bg-neon group-hover:text-black">
                                  <Icon name="message-circle" />
                              </div>
                              <h4 className="text-white font-black uppercase text-sm">{item.title}</h4>
                          </div>
                          <Icon name="chevron-right" className="text-white/20 group-hover:text-white" />
                      </div>
                  ))}
              </div>
          </div>

          {/* Logistics Logistics */}
          <div className="bg-black/40 border border-white/10 rounded-3xl p-8">
              <h3 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3 mb-8">
                  <Icon name="package" className="text-gold" /> Logistics Inbox
              </h3>
              <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                  {ledger.filter(r => r.status === 'requested').map((req, i) => (
                      <div key={i} className="p-5 rounded-2xl border bg-white/5 border-gold/30 transition-all">
                          <div className="flex justify-between items-start mb-4">
                              <div>
                                  <h4 className="text-white font-black uppercase text-sm">{req.item_name}</h4>
                                  <p className="text-[10px] text-white/30">{new Date(req.created_at).toLocaleDateString()} | von: {req.requester_name || "NLZ Coach"}</p>
                              </div>
                              <span className="px-2 py-1 rounded text-[8px] font-black uppercase bg-gold text-black">{req.status}</span>
                          </div>
                          <button 
                            onClick={() => handleApproveLogistics(req)}
                            disabled={isOffering}
                            className="w-full py-3 bg-gold text-black rounded-lg font-black uppercase text-[10px] hover:scale-[1.02] transition-all disabled:opacity-50"
                          >
                              {isOffering ? 'Prüfe Amazon/Sarango Preise...' : 'Freigabe & Bestellung'}
                          </button>
                      </div>
                  ))}
                  {ledger.filter(r => r.status === 'requested').length === 0 && (
                      <p className="text-center text-white/20 py-10 italic">Keine neuen Material-Anfragen.</p>
                  )}
              </div>
          </div>

          {/* === NEW: PRO-PROCUREMENT SEARCH RAIDER === */}
          <div className="bg-black/40 border border-white/10 rounded-3xl p-8 lg:col-span-2">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                  <div>
                      <h3 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
                          <Icon name="search" className="text-neon" /> Pro-Procurement Search (Raider Mode)
                      </h3>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">KI-gestützte Preissuche & Sponsor-Potential Analyse</p>
                  </div>
                  <div className="flex w-full md:w-auto gap-2">
                      <input 
                        type="text" 
                        value={procurementQuery}
                        onChange={e => setProcurementQuery(e.target.value)}
                        placeholder="Z.B. Trainingsanzüge Navy..."
                        className="flex-1 md:w-64 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white text-xs outline-none focus:border-neon"
                      />
                      <button 
                        onClick={handleProcurementSearch}
                        disabled={isSearchingProcurement}
                        className="px-6 py-2 bg-neon text-black rounded-xl font-black uppercase text-[10px] hover:scale-105 transition-all disabled:opacity-50"
                      >
                         {isSearchingProcurement ? 'Scanne...' : 'Suchen'}
                      </button>
                  </div>
              </div>

              {procurementResults.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-scale-in">
                      {procurementResults.map((item, i) => (
                          <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:border-white/20 transition-all flex flex-col h-full">
                              <div className="flex justify-between items-start mb-4">
                                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-white/40"><Icon name="package" size={20}/></div>
                                  <div className="text-right">
                                      <div className="text-lg font-black text-white">{item.price}</div>
                                      <div className="text-[8px] text-white/40 uppercase font-bold">{item.source}</div>
                                  </div>
                              </div>
                              <h4 className="text-sm font-black text-white uppercase mb-4 leading-tight flex-1">{item.title}</h4>
                              
                              <div className="space-y-2 mb-6">
                                  <div className="flex justify-between text-[8px] uppercase font-black">
                                      <span className="text-white/40">Sponsor Potential:</span>
                                      <span className={item.sponsorPotential === 'High' ? 'text-green-400' : 'text-gold'}>{item.sponsorPotential}</span>
                                  </div>
                                  <div className="flex justify-between text-[8px] uppercase font-black">
                                      <span className="text-white/40">Color Match:</span>
                                      <span className="text-neon">{item.colorMatch}</span>
                                  </div>
                              </div>

                              <div className="grid grid-cols-1 gap-2 mt-auto">
                                  {item.link && (
                                    <a 
                                      href={item.link} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="w-full py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-[8px] font-black uppercase text-white transition-all flex items-center justify-center gap-2"
                                    >
                                      <Icon name="external-link" size={10} /> Artikel ansehen
                                    </a>
                                  )}
                                  <button 
                                    onClick={() => handleSendProposal(item)} 
                                    className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[8px] font-black uppercase text-white transition-all"
                                  >
                                    {activeRole === 'Manager' ? 'Direkt freigeben' : 'An Manager senden'}
                                  </button>
                                  
                                  {activeRole === 'Manager' && (
                                    <button 
                                      onClick={() => handleGenerateInquiry(item)} 
                                      className="w-full py-2 bg-neon/10 hover:bg-neon text-neon hover:text-navy border border-neon/20 rounded-lg text-[8px] font-black uppercase transition-all"
                                    >
                                      Sponsor-Inquiry
                                    </button>
                                  )}
                              </div>
                          </div>
                      ))}
                  </div>
              )}
          </div>
      </div>

      {/* Financial Ledger (Edit Zone) - Restricted to Manager */}
      {activeRole === 'Manager' && (
        <div className="bg-black/40 border border-white/10 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
                    <Icon name="credit-card" className="text-redbull" /> Financial Ledger (Einnahmen & Ausgaben)
                </h3>
                <div className="flex gap-4">
                    <input 
                        type="text" 
                        placeholder="Kategorie" 
                        value={newEntry.category} 
                        onChange={e => setNewEntry({...newEntry, category: e.target.value})}
                        className="bg-black/40 border border-white/10 rounded-lg px-3 py-1 text-xs text-white outline-none focus:border-neon"
                    />
                    <input 
                        type="number" 
                        placeholder="Betrag" 
                        value={newEntry.amount} 
                        onChange={e => setNewEntry({...newEntry, amount: parseFloat(e.target.value)})}
                        className="bg-black/40 border border-white/10 rounded-lg px-3 py-1 text-xs text-white outline-none focus:border-neon w-24"
                    />
                    <select 
                        value={newEntry.type}
                        onChange={e => setNewEntry({...newEntry, type: e.target.value})}
                        className="bg-black/40 border border-white/10 rounded-lg px-3 py-1 text-xs text-white outline-none"
                    >
                        <option value="INCOME">Einnahme</option>
                        <option value="EXPENSE">Ausgabe</option>
                    </select>
                    <button onClick={handleAddLedgerEntry} className="px-4 py-1 bg-neon text-black rounded-lg font-black uppercase text-[10px] hover:scale-105 transition-all">Hinzufügen</button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-white/60">
                    <thead className="border-b border-white/10 text-[10px] font-black uppercase tracking-widest text-white/40">
                        <tr>
                            <th className="pb-4 px-4">Datum</th>
                            <th className="pb-4 px-4">Kategorie</th>
                            <th className="pb-4 px-4">Notiz</th>
                            <th className="pb-4 px-4 text-right">Betrag</th>
                            <th className="pb-4 px-4 text-center">Aktion</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ledger.map(entry => (
                            <tr key={entry.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                <td className="py-4 px-4">{new Date(entry.created_at).toLocaleDateString()}</td>
                                <td className="py-4 px-4 font-black text-white">{entry.item_name}</td>
                                <td className="py-4 px-4 italic opacity-40">{entry.note || ""}</td>
                                <td className={`py-4 px-4 text-right font-black ${entry.type === 'income' ? 'text-neon' : 'text-redbull'}`}>
                                    {entry.type === 'income' ? '+' : '-'}{parseFloat(entry.amount).toLocaleString()} €
                                </td>
                                <td className="py-4 px-4 text-center">
                                    <span className={`px-2 py-1 rounded text-[8px] font-bold uppercase tracking-widest ${entry.status === 'approved' ? 'bg-green-500/20 text-green-400' : 'bg-gold/20 text-gold'}`}>
                                        {entry.status}
                                    </span>
                                </td>
                                <td className="py-4 px-4 text-center">
                                    <button onClick={() => handleDeleteLedgerEntry(entry.id)} className="text-white/20 hover:text-redbull transition-colors"><Icon name="trash-2" size={14} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      )}

      {/* Modal logic omitted for brevity, keeping existing interview flow... */}
      {activeInterview && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-black/60">
              <div className="bg-[#0a0e1a] border border-white/20 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
                  <div className="p-8 border-b border-white/10 flex items-center justify-between">
                      <h3 className="text-2xl font-black text-white uppercase italic">{activeInterview.title}</h3>
                      <button onClick={() => setActiveInterview(null)} className="text-white/40 hover:text-white"><Icon name="x" size={24} /></button>
                  </div>
                  <div className="p-8 space-y-6">
                      <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                          <p className="text-[10px] text-white/40 uppercase font-black mb-4">Fragen:</p>
                          <p className="text-white text-sm font-medium leading-relaxed whitespace-pre-wrap">{interviewQuestions}</p>
                      </div>
                      <textarea value={interviewAnswers} onChange={e => setInterviewAnswers(e.target.value)} className="w-full h-32 bg-black/40 border border-white/10 rounded-2xl p-4 text-white text-sm outline-none" placeholder="Statement eingeben..." />
                      <button onClick={handleSubmitInterview} disabled={isPublishing || !interviewAnswers} className="w-full py-5 bg-neon text-black rounded-2xl font-black uppercase text-xs disabled:opacity-50">Artikel Veröffentlichen</button>
                  </div>
              </div>
          </div>
      )}

      {/* Sponsoring Inquiry Modal */}
      {activeInquiry && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 backdrop-blur-xl bg-black/80">
              <div className="bg-[#0f172a] border border-white/20 w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-scale-in">
                  <div className="p-10 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-neon/10 to-transparent">
                      <div>
                        <h3 className="text-2xl font-black text-white uppercase italic">Sponsoren-Anfrage</h3>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Material: {activeInquiry.title}</p>
                      </div>
                      <button onClick={() => setActiveInquiry(null)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-all"><Icon name="x" size={24} /></button>
                  </div>
                  <div className="p-10 space-y-8">
                      <div className="bg-black/40 border border-white/10 p-8 rounded-3xl min-h-[300px]">
                          {isGeneratingInquiry ? (
                            <div className="flex flex-col items-center justify-center h-full gap-4 text-neon py-20">
                                <Icon name="refresh-cw" className="animate-spin" size={40} />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Neural-Gerd formuliert Inquiry...</span>
                            </div>
                          ) : (
                            <div className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap font-serif italic">
                                {generatedEmail}
                            </div>
                          )}
                      </div>
                      
                      <div className="flex gap-4">
                        <button onClick={() => { navigator.clipboard.writeText(generatedEmail); alert("Kopiert!"); }} className="flex-1 py-4 bg-white/5 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest border border-white/10 hover:bg-white/10">Text Kopieren</button>
                        <button onClick={() => alert("Email-Client wird geöffnet...")} className="flex-1 py-4 bg-neon text-black rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-[0_0_30px_rgba(0,243,255,0.4)]">Direkt Senden</button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
   );
};

export default ManagementHub;
