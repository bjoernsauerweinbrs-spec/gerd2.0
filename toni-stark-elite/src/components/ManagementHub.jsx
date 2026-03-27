import React, { useState, useEffect } from 'react';
import Icon from './Icon';
import { getAiConfig, sendAiRequest } from '../utils/aiConfig';

// ============================================
// EXECUTIVE BOARD (MANAGER & CFO HUB)
// ============================================
const ExecutiveBoard = ({ truthObject, setTruthObject, setActiveTab }) => {
  const [activeView, setActiveView] = useState("overview"); // overview, finance, sponsoring, media
  const [isComputing, setIsComputing] = useState(false);
  const [gerdMessage, setGerdMessage] = useState("Guten Morgen, Commander. Die Management-Suite ist hochgefahren.");

  // --- AI ENGINE STATES ---
  // --- FINANCES MOCK DATA ---
  const [clProbability, setClProbability] = useState(82);

  // --- SPONSORING DATA ---
  const [sponsors, setSponsors] = useState([
    { id: 1, name: "GlobalTech Logistics", industry: "Logistik", matchScore: 94, status: "Lead", value: "1.2M", desc: "Regionales Logistik-Hub sucht nationale PR." },
    { id: 2, name: "Neon Energy Drinks", industry: "Getränke", matchScore: 88, status: "Verhandlung", value: "3.5M", desc: "Aggressive Zielgruppe, passt zur jungen Kader-DNA." },
    { id: 3, name: "AeroSpace Tech", industry: "Aviation", matchScore: 55, status: "Kalt", value: "800k", desc: "Kein regionaler Bezug, hohes Sponsoring-Risiko." }
  ]);
  const [pitchDeck, setPitchDeck] = useState(null);
  const [customPitchInputs, setCustomPitchInputs] = useState({});

  // --- MEDIA / PR DATA ---
  const [prDrafts, setPrDrafts] = useState([
    { id: 102, title: "Pressemitteilung: Trainer-Aussagen nach Derbysieg", text: "Der Trainer nannte die gegnerische Defensive im Interview 'einen absoluten Hühnerhaufen'. Wir veröffentlichen das als Statement für unsere offensive Identität.", status: "pending", riskScore: 0, riskReport: "" }
  ]);
  const [newPrTitle, setNewPrTitle] = useState("");
  const [newPrText, setNewPrText] = useState("");

  const { activeKey, endpoint, modelString, aiProvider } = getAiConfig();

  // --- PR INBOX STATES ---
  const [activeInterview, setActiveInterview] = useState(null);
  const [interviewQuestions, setInterviewQuestions] = useState("");
  const [interviewAnswers, setInterviewAnswers] = useState("");
  const [isPublishingArticle, setIsPublishingArticle] = useState(false);

  // --- LIVE MATCH INTELLIGENCE STATE ---
  const [liveBriefing, setLiveBriefing] = useState(null);
  const [isGeneratingBriefing, setIsGeneratingBriefing] = useState(false);

  useEffect(() => {
     if (truthObject?.club_info?.liveIntelligence) {
         if (truthObject.club_info.liveIntelligence.aiBriefing) {
             if (!liveBriefing) setLiveBriefing(truthObject.club_info.liveIntelligence.aiBriefing);
             return;
         }

         if (!liveBriefing && !isGeneratingBriefing && activeKey) {
            setIsGeneratingBriefing(true);
            const liveData = truthObject.club_info.liveIntelligence;
            const systemPrompt = `Du bist GERD, der analytische Cheftrainer / Manager von ${truthObject.club_info.name}.
Hier ist der Live-Daten-Feed vom Wochenende:
- Letztes Spiel: ${liveData.lastMatch}
- Nächstes Spiel: ${liveData.nextMatch}
- Aktuelle Form: ${liveData.form}
- Scraper-Notizen: ${liveData.tacticalNotes}

AUFGABE:
Schreibe eine extrem beeindruckende, präzise Taktik-Analyse. 
1. Gehe detailliert auf das letzte Ergebnis ein.
2. Erwähne den Abgleich der GPS-Laufwege/Spieldaten mit TV/Scouting-Daten (Bild/Kicker/Transfermarkt).
3. Leite brutal fokussiert auf das anstehende Spiel gegen ${liveData.nextMatch} über. Analysiere kurz, warum wir gegen diesen Gegner dominieren werden.

Tonfall: Mix aus Klopp (Motivation) und Nagelsmann (Taktik-Nerd). 
Direkte Ansprache "Coach/Commander", keine Emojis.
WICHTIGE REGELN:
- Antworte absolut zwingend auf Deutsch.
- Beziehe dich IMMER auf eine Herrenmannschaft (nutze ausschließlich "Spieler", NIEMALS "Spielerinnen").
- Fasse dich extrem kurz (MAXIMAL 3 bis 4 Sätze, unter 50 Wörter total!). Keine langen Romane, um die Ladezeit zu minimieren.`;

            sendAiRequest(systemPrompt)
            .then(content => {
                const text = content.trim();
                setLiveBriefing(text);
                if (setTruthObject) {
                    setTruthObject(prev => ({
                        ...prev,
                        club_info: {
                            ...prev.club_info,
                            liveIntelligence: {
                                ...prev.club_info.liveIntelligence,
                                aiBriefing: text
                            }
                        }
                    }));
                }
            })
            .catch(err => {
                console.error(err);
                setLiveBriefing("⚠️ API CRASH: " + err.message);
            })
            .finally(() => setIsGeneratingBriefing(false));
         }
     }
  }, [truthObject, liveBriefing, isGeneratingBriefing, activeKey, endpoint, modelString, setTruthObject]);

  const runAiSimulation = (callback, computeMsg = "Berechne Szenario...") => {
     setIsComputing(true);
     setGerdMessage(computeMsg);
     callback().finally(() => setIsComputing(false));
  };

  // --- ACTIONS ---
  const handlePitchDeckGen = async (sponsor) => {
      if (!activeKey) {
          alert(`Globaler API Key fehlt! Bitte im NLZ Academy Modul hinterlegen.`);
          return;
      }

      const customInstructions = customPitchInputs[sponsor.id] || "Keine besonderen Zusätze.";

      runAiSimulation(async () => {
          const systemPrompt = `Du bist GERD, der unbarmherzige, hochanalytische Manager und CFO eines Elite Champions-League Clubs.
Deine Sprache ist von ultimativer Dominanz, Intelligenz and Selbstbewusstsein geprägt (ähnlich einem hyper-kompetitiven CEO).
Du formulierst ein Sponsor-Pitch-Deck / PR-Anschreiben für [Name: ${sponsor.name}, Industrie: ${sponsor.industry}].
DNA-Match mit unserem Club: ${sponsor.matchScore}%.
Zusätzliche Instruktion des Benutzers: "${customInstructions}".

Aufgabe:
Schreibe 3 extrem scharfe, präzise Absätze:
1. Den "Shark-Hook" (Warum der Sponsor uns dringender braucht als wir den Sponsor).
2. Die Vision (Die Synergie aus der Branche des Sponsors und unserer offensiven DNA).
3. Den harten Call-to-Action (Forderungen im Kontext der Zusatzinstruktion).

Antworte DIREKT mit dem Pitch, ohne Höflichkeitsfloskeln.`;

          try {
              const content = await sendAiRequest(systemPrompt);
              setPitchDeck({
                  sponsorName: sponsor.name,
                  content: content.trim()
              });
              setGerdMessage(`Live-Pitch für ${sponsor.name} generiert. Bereit zum Export.`);
          } catch (error) {
              setGerdMessage("Fehler bei der Pitch-Generierung.");
              console.error(error);
          }
      }, "Greife auf Globales KI-Netz zu. Generiere Pitch-Deck...");
  };

  const handlePrScan = async (draftId) => {
      if (!activeKey) {
          alert(`Globaler API Key fehlt! Bitte im NLZ Academy Modul hinterlegen.`);
          return;
      }

      const draftToScan = prDrafts.find(d => d.id === draftId);
      if(!draftToScan) return;

      runAiSimulation(async () => {
          const systemPrompt = `Du bist GERD, der extrem strenge PR & Media Gatekeeper des Clubs.
Evaluiere folgenden internen Presse-Entwurf auf "Shitstorm-Potenzial", Angriffsfläche für Rivalen, oder DFB-Strafen:
ENTWURF: "${draftToScan.text}"

Antworte AUSSCHLIESSLICH im JSON Format:
{
  "riskScore": [Integer 0-100, wobei 100 maximaler PR-Schaden ist],
  "riskReport": "[Kurze, brutale Analyse, warum der Score so ist und was zu tun ist. Maximal 2 Sätze.]"
}
WICHTIG: Kein Markdown, nur reines JSON.`;

          try {
              const content = await sendAiRequest(systemPrompt);
              
              let raw = content.trim();
              if(raw.startsWith("```json")) raw = raw.replace(/^```json/, "").replace(/```$/, "").trim();
              else if(raw.startsWith("```")) raw = raw.replace(/^```/, "").replace(/```$/, "").trim();

              const parsed = JSON.parse(raw);
              
              setPrDrafts(prev => prev.map(d => 
                  d.id === draftId ? { ...d, riskScore: parsed.riskScore, riskReport: parsed.riskReport } : d
              ));
              setGerdMessage(`PR Risiko-Scan für Entwurf #${draftId} beendet. Score: ${parsed.riskScore}.`);
          } catch (error) {
              setGerdMessage("Fehler beim PR-Scan.");
              console.error(error);
          }
      }, "Analysiere PR-Entwurf live über globale KI. Berechne Shitstorm-Faktor...");
  };

  const handleCreateDraft = () => {
      if(!newPrTitle || !newPrText) return;
      const newDraft = {
          id: Date.now(),
          title: newPrTitle,
          text: newPrText,
          status: "pending",
          riskScore: 0,
          riskReport: ""
      };
      setPrDrafts([newDraft, ...prDrafts]);
      setNewPrTitle("");
      setNewPrText("");
  };

  const handleApproveDraft = (draft) => {
      const newArticle = {
          type: "OFFIZIELLE MITTEILUNG",
          headline: draft.title,
          author: "Presseabteilung",
          excerpt: "Offizielles Statement vom Verein freigegeben.",
          content: draft.text,
          image: null,
          featured: false,
          id: Date.now()
      };

      if (setTruthObject) {
          setTruthObject(prev => ({
              ...prev,
              magazine_articles: [newArticle, ...(prev.magazine_articles || [])]
          }));
      }
      
      setPrDrafts(prev => prev.filter(d => d.id !== draft.id));
      setGerdMessage(`PR-Entwurf "${draft.title}" erfolgreich im StadionKurier veröffentlicht!`);
  };

  // --- PR INBOX LOGIC ---
  const availableInterviews = [];
  const completedInterviews = truthObject?.completed_interviews || [];

  if (truthObject?.club_info?.liveIntelligence) {
     if (!completedInterviews.includes("post-match")) {
         availableInterviews.push({
             id: "post-match",
             type: "Post-Match Interview",
             title: `Nachbericht: ${truthObject.club_info.liveIntelligence.lastMatch}`,
             prompt: `Du bist ein emotionaler DAZN/Sky-Reporter direkt nach Abpfiff. Letztes Spiel: ${truthObject.club_info.liveIntelligence.lastMatch}. Taktik: ${truthObject.club_info.liveIntelligence.tacticalNotes}.
Stelle dem Trainer 2 direkte, authentische Fragen im echten Fußball-Jargon (KEINE akademischen Begriffe wie 'Elemente des Pressingsystems'!).
Beispiele für gute Fragen: 'Das war eine sensationelle zweite Halbzeit, wie stolz macht Sie das Team heute?' oder 'Die Aggressivität auf dem Platz war brutal. Was haben Sie den Jungs vor dem Spiel gesagt?'.
WICHTIG: Antworte AUSSCHLIESSLICH mit den beiden Fragen (als Aufzählung). Absolut nichts anderes!`
         });
     }
     if (!completedInterviews.includes("pre-match")) {
         availableInterviews.push({
             id: "pre-match",
             type: "Pre-Match Pressekonferenz",
             title: `Vorschau: ${truthObject.club_info.liveIntelligence.nextMatch}`,
             prompt: `Du bist ein echter Sportjournalist auf der Pressekonferenz vorm Spiel (${truthObject.club_info.liveIntelligence.nextMatch}). Form: ${truthObject.club_info.liveIntelligence.form}.
Stelle dem Trainer 2 kurze, knackige echte Reporter-Fragen (aus dem Fußball-Jargon).
Beispiele: 'Das nächste Spiel wird extrem hitzig, wie schwören Sie die Mannschaft darauf ein?' oder 'Nach den intensiven Wochen: Müssen Sie in der Startelf rotieren?'. Keine komplizierten, akademischen Schachtelsätze.
WICHTIG: Antworte AUSSCHLIESSLICH mit den beiden Fragen (als Aufzählung). Absolut nichts anderes!`
         });
     }
  }

  const handleOpenInterview = (interview) => {
      setActiveInterview(interview);
      setInterviewQuestions("");
      setInterviewAnswers("");
      
      if (!activeKey) return;
      setIsComputing(true);
      setGerdMessage("Presseabteilung kontaktiert Redaktion für offizielle Fragen...");
      
      sendAiRequest(interview.prompt)
      .then(res => setInterviewQuestions(res.trim()))
      .catch(err => setInterviewQuestions("Fehler beim Abrufen der Fragen."))
      .finally(() => setIsComputing(false));
  };

  const handleSubmitInterview = () => {
      if (!activeInterview || !interviewAnswers) return;
      setIsPublishingArticle(true);
      setGerdMessage("Neural-Gerd schreibt den Artikel für den StadionKurier...");

      const clubName = truthObject?.club_info?.name || "RB Leipzig";
      const nextMatch = truthObject?.club_info?.liveIntelligence?.nextMatch || "das kommende Ligaspiel";
      const rosterNames = truthObject?.matchday_roster?.map(p => p.name).join(", ") || "A-Kader";

      const systemPrompt = `Du bist Chefredakteur für das Vereins-Magazin von ${clubName}.
Der Reporter hat folgende Fragen gestellt:
${interviewQuestions}

Der aktuelle Cheftrainer des Vereins hat geantwortet:
${interviewAnswers}

Schreibe nun eine sensationelle Frontpage-Story (EXKLUSIV). BILD-Zeitungs Stil, reißerisch und mit Daten aus der Redaktion aufgemotzt.
Füge deiner Story realistische Fußball-Daten hinzu (Ballbesitz, xG-Werte, Heatmaps).
WICHTIG:
- Der Verein heißt zwingend ${clubName}.
- Nutze auf keinen Fall den Namen 'Gerd' für den Trainer. Nenne ihn stattdessen 'den Cheftrainer'.
- Denke dir keine falschen Stadion-Namen aus, sondern nimm das echte Stadion von ${clubName}.
- Erfinde keine Wettbewerbe (wie Champions League, Europa League, DFB-Pokal). Der einzige Fokus für die Zukunft ist: ${nextMatch}.
- Der Text MUSS zwingend die Antwort des Trainers sowie die Statistik-Daten enthalten.
- NEUE ANFORDERUNG DER PRESSEABTEILUNG: Deine Headline und dein Text formen den Hauptartikel. Unten an den Text zwingend "___" (als Trennstrich) setzen und dann eine kleine 'Top 5 Tabelle' (denk dir 5 Vereine mit Punkten aus, ${clubName} steht auf Platz ${truthObject?.club_info?.table_position || 4} der ${truthObject?.club_info?.league || 'Liga'}) sowie die 'Startelf: ${rosterNames}' als Info-Block abdrucken.

WICHTIG: Nutze für deine Antwort EXAKT dieses Format (KEIN JSON, sondern diese genauen Tags untereinander!):

HEADLINE: [Eine Sensationelle BILD-Überschrift]
EXCERPT: [Dein spannender Teaser-Satz]
CONTENT: [Der vollständige Artikel in 2-4 Absätzen, gespickt mit Zahlen und Zitaten, und DRUNTER getrennt mit --- die Tabelle und die Startelf]`;

      sendAiRequest(systemPrompt)
      .then(res => {
          try {
             const headlineMatch = res.match(/HEADLINE:\s*(.*)/i);
             const excerptMatch = res.match(/EXCERPT:\s*(.*)/i);
             const contentMatch = res.match(/CONTENT:\s*([\s\S]*)/i);

             if (!headlineMatch || !excerptMatch || !contentMatch) {
                 throw new Error("Fehlende Tags im AI-Output.");
             }
             
             const parsed = {
                 headline: headlineMatch[1].trim(),
                 excerpt: excerptMatch[1].trim(),
                 content: contentMatch[1].replace(/\`\`\`/g, '').trim()
             };

             const newArticle = {
                 type: "EXKLUSIV INTERVIEW",
                 headline: parsed.headline,
                 author: "Sportredaktion Elite",
                 excerpt: parsed.excerpt,
                 content: parsed.content,
                 image: null, // Verhindert die Anzeige des Trauerbildes von Gerd Sauerwein
                 featured: true,
                 id: Date.now()
             };

             if (setTruthObject) {
                 setTruthObject(prev => ({
                     ...prev,
                     magazine_articles: [newArticle, ...(prev.magazine_articles || [])],
                     completed_interviews: [...(prev.completed_interviews || []), activeInterview.id]
                 }));
             }
             setGerdMessage(`Interview-Artikel generiert und im StadionKurier veröffentlicht!`);
             setActiveInterview(null);
          } catch(e) {
             console.error("Parse Error Article", e);
             setGerdMessage("Fehler beim Formatieren des Artikels.");
          }
      })
      .catch(err => setGerdMessage("Fehler: Artikel konnte nicht generiert werden."))
      .finally(() => setIsPublishingArticle(false));
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-2 bg-[#02050c]/80 p-6 rounded-2xl border border-gold/20 shadow-[0_0_30px_rgba(212,175,55,0.05)] backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gold/10 border border-gold flex items-center justify-center">
            <Icon name="briefcase" size={28} className="text-gold" />
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tighter text-white italic">Executive Office</h2>
            <p className="text-[10px] text-white/50 uppercase tracking-[0.2em] font-mono">Operations, Finance & Commercials</p>
          </div>
        </div>
        <div className="flex gap-4 items-center">
           <button 
               onClick={() => {
                   const confirmed = window.confirm('Möchtest du das gesamte System auf Werkseinstellungen (jungfräulich) zurücksetzen? Alle aktuellen Vereinsdaten gehen verloren.');
                   if(confirmed) {
                       localStorage.removeItem('gerd_truthObject');
                       window.location.reload();
                   }
               }}
               className="px-4 py-2 border border-redbull/30 bg-redbull/10 hover:bg-redbull/20 rounded-full text-[10px] font-black uppercase tracking-widest text-redbull transition-all cursor-pointer flex items-center gap-2"
               title="System komplett (Hard-Reset) zurücksetzen"
           >
               <Icon name="refresh-cw" size={14} /> System Hard-Reset
           </button>
           <div className={`text-[10px] uppercase font-black tracking-widest px-4 py-2 border rounded-full flex items-center gap-2 ${isComputing ? 'text-neon border-neon bg-neon/10 animate-pulse' : 'text-white/60 border-white/20'}`}>
              <Icon name="cpu" size={14} className={isComputing ? "animate-spin" : ""} />
              {isComputing ? 'Computing...' : 'AI Standby'}
           </div>
        </div>
      </div>



      {/* AI MESSAGE TICKER */}
      <div className="bg-black/60 border border-white/10 rounded-xl p-4 flex gap-4 items-center shadow-inner">
         <div className="bg-gold/20 text-gold p-2 rounded-lg">
            <Icon name="message-square" size={20} />
         </div>
         <p className="font-mono text-xs text-white/80 leading-relaxed italic border-l-2 border-gold/50 pl-4 py-1">
           {gerdMessage}
         </p>
      </div>

      {/* TABS */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setActiveView("overview")} className={`px-4 py-2 rounded text-[10px] font-black uppercase tracking-widest border transition-all ${activeView === "overview" ? "bg-white text-black border-white" : "bg-black/40 text-white/50 border-white/10 hover:border-white/30"}`}>Übersicht</button>
        <button onClick={() => setActiveView("finance")} className={`px-4 py-2 rounded text-[10px] font-black uppercase tracking-widest border transition-all ${activeView === "finance" ? "bg-gold text-black border-gold" : "bg-black/40 text-white/50 border-white/10 hover:border-white/30"}`}>Predictive Finance</button>
        <button onClick={() => setActiveView("sponsoring")} className={`px-4 py-2 rounded text-[10px] font-black uppercase tracking-widest border transition-all ${activeView === "sponsoring" ? "bg-neon text-black border-neon" : "bg-black/40 text-white/50 border-white/10 hover:border-white/30"}`}>Sponsoring & Akquise</button>
        <button onClick={() => setActiveView("media")} className={`px-4 py-2 rounded text-[10px] font-black uppercase tracking-widest border transition-all ${activeView === "media" ? "bg-redbull text-white border-redbull" : "bg-black/40 text-white/50 border-white/10 hover:border-white/30"}`}>PR & Stadionkurier</button>
      </div>

      {/* VIEW: OVERVIEW */}
      {activeView === "overview" && (
          <div className="flex flex-col gap-6 animate-fade-in">
             
             {/* LIVE INTELLIGENCE AI BRIEFING FRONT AND CENTER */}
             {(truthObject?.club_info?.liveIntelligence || isGeneratingBriefing) && (
                 <div className="bg-black/40 border border-neon/30 p-8 rounded-2xl relative overflow-hidden group shadow-[0_0_40px_rgba(0,243,255,0.05)]">
                     <div className="absolute top-0 right-0 w-64 h-64 bg-neon/10 rounded-full blur-[80px] -mr-10 -mt-20"></div>
                     <div className="flex items-center justify-between gap-3 mb-6 border-b border-neon/20 pb-4 relative z-10 w-full">
                         <div className="flex items-center gap-3">
                             <div className="p-2 bg-neon/10 rounded-lg">
                                <Icon name="cpu" size={24} className="text-neon" />
                             </div>
                             <div>
                                <h3 className="text-white font-black uppercase tracking-widest text-sm flex items-center gap-2">
                                   Live Match Intelligence <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                                </h3>
                                <p className="text-[10px] text-neon uppercase font-mono tracking-widest mt-1">
                                    {truthObject?.club_info?.liveIntelligence?.dataSource || "Gescrapter Spieltag-Abgleich aktiv"}
                                 </p>
                             </div>
                         </div>
                         <div className="flex gap-6 items-center">
                            <div className="text-right border-r border-white/10 pr-6">
                               <div className="text-[8px] text-white/40 uppercase tracking-widest mb-1">DATA CONFIDENCE</div>
                               <div className={`text-xs font-black font-mono ${truthObject?.club_info?.liveIntelligence?.confidence > 80 ? 'text-green-400' : 'text-orange-400'}`}>
                                  {truthObject?.club_info?.liveIntelligence?.confidence || 10}%
                                </div>
                            </div>
                            <div className="text-right">
                               <div className="text-[8px] text-white/40 uppercase tracking-widest mb-1">TEAM FORM</div>
                               <div className="text-xs font-black font-mono text-white">
                                  {truthObject?.club_info?.liveIntelligence?.form || 'N/A'}
                               </div>
                            </div>
                         </div>
                     </div>

                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
                        {/* LEFT: RESULTS & SCAN */}
                        <div className="space-y-6">
                           <div className="grid grid-cols-2 gap-4">
                              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                 <div className="text-[9px] text-white/40 uppercase font-black mb-2">Letztes Spiel</div>
                                 <div className="text-xs font-bold text-white leading-relaxed">
                                    {truthObject?.club_info?.liveIntelligence?.lastMatch || 'Suche Ergebnisse...'}
                                 </div>
                              </div>
                              <div className="p-4 rounded-xl bg-neon/5 border border-neon/20">
                                 <div className="text-[9px] text-neon uppercase font-black mb-2">Nächstes Spiel</div>
                                 <div className="text-xs font-bold text-white leading-relaxed">
                                    {truthObject?.club_info?.liveIntelligence?.nextMatch || 'Identifiziere Gegner...'}
                                 </div>
                              </div>
                           </div>

                           <div className="font-sans text-sm leading-relaxed text-white bg-black/40 p-6 rounded-xl border border-white/10 shadow-inner">
                              {isGeneratingBriefing ? (
                                  <div className="flex items-center gap-3 text-white/50 animate-pulse">
                                      <Icon name="refresh-cw" size={16} className="animate-spin" /> 
                                      <span className="font-mono text-xs uppercase tracking-widest">GERD analysiert Scraper-Daten...</span>
                                  </div>
                              ) : (
                                  <div className="space-y-4">
                                     <div className="flex items-center gap-2 mb-2">
                                        <Icon name="zap" size={14} className="text-gold" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gold italic">Gerd's Taktik-Quick-Check</span>
                                     </div>
                                     <p className="leading-relaxed">{liveBriefing || truthObject?.club_info?.liveIntelligence?.tacticalNotes}</p>
                                     {truthObject?.manualSetupAdvice && (
                                       <div className="mt-4 p-4 rounded-xl bg-orange-500/10 border border-orange-500/30">
                                          <div className="flex items-center gap-2 mb-2">
                                             <Icon name="info" size={14} className="text-orange-400" />
                                             <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">Setup-Empfehlung (Datenlücke)</span>
                                          </div>
                                          <p className="text-xs italic text-white/70 leading-relaxed font-sans">{truthObject.manualSetupAdvice}</p>
                                       </div>
                                     )}
                                  </div>
                              )}
                           </div>
                        </div>

                        {/* RIGHT: OPPONENT ANALYSIS */}
                        <div className="space-y-4">
                           <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-4 flex items-center gap-2">
                              <Icon name="shield" size={14} /> Detaillierte Gegner-Analyse
                           </h4>
                           
                           <div className="grid grid-cols-1 gap-3">
                              <div className="p-4 rounded-xl bg-redbull/5 border border-redbull/20">
                                 <div className="text-[9px] text-redbull uppercase font-black mb-2">Stärken des Gegners</div>
                                 <ul className="space-y-2">
                                    {(truthObject?.club_info?.liveIntelligence?.opponentStrengths || []).map((s, idx) => (
                                       <li key={idx} className="text-[10px] text-white/80 flex items-start gap-2">
                                          <span className="text-redbull text-[8px] mt-0.5">▶</span> {s}
                                       </li>
                                    ))}
                                    {(!truthObject?.club_info?.liveIntelligence?.opponentStrengths) && <li className="text-[10px] text-white/20 italic">Warte auf KI-Scouting...</li>}
                                 </ul>
                              </div>

                              <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20">
                                 <div className="text-[9px] text-green-400 uppercase font-black mb-2">Schwächen (Unsere Chance)</div>
                                 <ul className="space-y-2">
                                    {(truthObject?.club_info?.liveIntelligence?.opponentWeaknesses || []).map((w, idx) => (
                                       <li key={idx} className="text-[10px] text-white/80 flex items-start gap-2">
                                          <span className="text-green-400 text-[8px] mt-0.5">▶</span> {w}
                                       </li>
                                    ))}
                                    {(!truthObject?.club_info?.liveIntelligence?.opponentWeaknesses) && <li className="text-[10px] text-white/20 italic">Warte auf KI-Scouting...</li>}
                                 </ul>
                              </div>
                           </div>

                           <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                              <div className="text-[9px] text-white/40 uppercase font-black uppercase tracking-widest">Gerd empfiehlt:</div>
                              <div className="text-[10px] font-black text-neon uppercase tracking-widest">Tiefes Gegenpressing</div>
                           </div>
                        </div>
                     </div>
                 </div>
             )}

             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
                 <div className="glass-panel p-8 rounded-2xl border-l-4 border-gold shadow-lg">
                    <Icon name="trending-up" size={32} className="text-gold mb-4" />
                    <h3 className="text-white font-black uppercase tracking-widest text-sm mb-1">Liquidität</h3>
                    <p className="text-2xl font-black italic text-white mb-4">€ 25.40M</p>
                    <div className="text-[10px] text-white/50 uppercase font-mono">Zero-Base Forecast: Stable</div>
                 </div>
                 <div className="glass-panel p-8 rounded-2xl border-l-4 border-neon shadow-lg">
                    <Icon name="briefcase" size={32} className="text-neon mb-4" />
                    <h3 className="text-white font-black uppercase tracking-widest text-sm mb-1">Sponsoring Leads</h3>
                    <p className="text-2xl font-black italic text-white mb-4">{sponsors.filter(s => s.status !== "Kalt").length} Aktiv</p>
                    <div className="text-[10px] text-white/50 uppercase font-mono">Deal Value Pipeline: € 4.7M</div>
                 </div>
                 <div className="glass-panel p-8 rounded-2xl border-l-4 border-redbull shadow-lg">
                    <Icon name="alert-triangle" size={32} className="text-redbull mb-4" />
                    <h3 className="text-white font-black uppercase tracking-widest text-sm mb-1">PR Approvals</h3>
                    <p className="text-2xl font-black italic text-white mb-4">{prDrafts.filter(p => p.status === "pending").length} Pending</p>
                    <div className="text-[10px] text-white/50 uppercase font-mono text-red-400">Risk Scan Required</div>
                 </div>
             </div>
          </div>
      )}

      {/* VIEW: FINANCE */}
      {activeView === "finance" && (
         <div className="space-y-6 animate-fade-in">
            <div className="bg-[#02050c]/80 border border-gold/30 p-6 rounded-2xl">
               <h3 className="text-gold font-black uppercase tracking-widest text-sm mb-4 flex items-center gap-2"><Icon name="pie-chart" size={16} /> Zero-Base Budgeting (Live)</h3>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex flex-col gap-4">
                     <div>
                        <div className="flex justify-between text-[10px] font-black uppercase text-white/60 mb-1"><span>Transfer Budget</span><span>€ 12.0M / 15.0M</span></div>
                        <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden"><div className="bg-neon h-full w-[80%]"></div></div>
                     </div>
                     <div>
                        <div className="flex justify-between text-[10px] font-black uppercase text-white/60 mb-1"><span>Gehalts-Budget (p.a.)</span><span>€ 42.5M / 45.0M</span></div>
                        <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden"><div className="bg-gold h-full w-[95%]"></div></div>
                     </div>
                     <div>
                        <div className="flex justify-between text-[10px] font-black uppercase text-white/60 mb-1"><span>Infrastruktur & NLZ</span><span>€ 5.2M / 8.0M</span></div>
                        <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden"><div className="bg-white h-full w-[65%]"></div></div>
                     </div>
                  </div>
                  
                  <div className="bg-black/50 border border-white/10 p-6 rounded-xl relative overflow-hidden group">
                     <div className="absolute inset-0 bg-gold/5 group-hover:bg-gold/10 transition-colors"></div>
                     <div className="relative z-10">
                        <div className="text-[10px] uppercase font-black tracking-widest text-gold mb-2">KI Revenue Forecast</div>
                        <div className="flex items-end gap-4">
                           <div className="text-4xl font-black italic text-white">{clProbability}%</div>
                           <div className="text-xs text-white/60 font-medium mb-1">Wahrscheinlichkeit CL-Qualifikation</div>
                        </div>
                        <p className="text-[11px] text-white/50 mt-4 leading-relaxed">
                           Sollte die Qualifikation erreicht werden, steigen die potenziellen TV-Geld-Erlöse um projizierte +€18.5M. Das KI-Modell rät dazu, Vertragsverlängerungen von Schlüsselspielern (z.B. Müller, Anton) mit CL-Klauseln aufzuschieben, bis mathematische Sicherheit besteht.
                        </p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      )}

      {/* VIEW: SPONSORING */}
      {activeView === "sponsoring" && (
         <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 animate-fade-in">
            <div className="lg:col-span-3 space-y-4">
               <h3 className="text-neon font-black uppercase tracking-widest text-sm mb-4">Sponsoren Radar (KI Matchmaking)</h3>
               {sponsors.map(s => (
                  <div key={s.id} className="bg-black/40 border border-white/10 p-5 rounded-xl hover:bg-white/5 transition-all relative overflow-hidden">
                     <div className="flex justify-between items-start mb-2">
                        <div>
                           <div className="text-lg font-black text-white">{s.name}</div>
                           <div className="text-[10px] uppercase font-bold text-neon">{s.industry} | Wert: {s.value}</div>
                        </div>
                        <div className="text-right">
                           <div className="text-3xl font-black italic text-white/90">{s.matchScore}%</div>
                           <div className="text-[8px] uppercase tracking-widest text-white/40">DNA Match</div>
                        </div>
                     </div>
                     <p className="text-xs text-white/60 mb-4">{s.desc}</p>
                     
                     {/* KI Anweisungen Input */}
                     <div className="mb-4">
                        <textarea
                            value={customPitchInputs[s.id] || ""}
                            onChange={(e) => setCustomPitchInputs({...customPitchInputs, [s.id]: e.target.value})}
                            placeholder="Optionale KI Vorgabe (z.B. 'Fokus auf TV-Reichweite' oder 'Wir fordern radikal 5 Mio+')"
                            className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-white font-mono text-[9px] uppercase tracking-wide focus:border-neon outline-none"
                            rows={2}
                        />
                     </div>

                     <div className="flex justify-between items-center border-t border-white/5 pt-4">
                        <span className={`text-[10px] uppercase font-black tracking-wider px-3 py-1 rounded ${s.status === 'Lead' ? 'bg-blue-500/20 text-blue-400' : s.status === 'Verhandlung' ? 'bg-gold/20 text-gold' : 'bg-white/10 text-white/40'}`}>
                           {s.status}
                        </span>
                        <button 
                           onClick={() => handlePitchDeckGen(s)}
                           disabled={isComputing || !activeKey}
                           className="bg-neon/20 hover:bg-neon hover:text-black text-neon border border-neon text-[10px] font-black uppercase px-4 py-2 rounded transition-all disabled:opacity-50"
                        >
                           Custom Pitch <Icon name="zap" size={12} className="inline ml-1" />
                        </button>
                     </div>
                  </div>
               ))}
            </div>

            <div className="lg:col-span-2">
               <div className="bg-neon/5 border border-neon/30 rounded-2xl p-6 h-full flex flex-col">
                  <h3 className="text-neon font-black uppercase tracking-widest text-xs mb-4 flex items-center gap-2"><Icon name="file-text" size={16} /> KI Pitch-Deck Entwurf</h3>
                  
                  {pitchDeck ? (
                     <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        <div className="text-white text-sm whitespace-pre-line leading-relaxed font-mono">
                           {pitchDeck.content}
                        </div>
                        <button className="mt-6 w-full bg-neon text-black font-black uppercase text-xs py-3 rounded hover:bg-white transition-colors">
                           PDF Exportieren & Senden
                        </button>
                     </div>
                  ) : (
                     <div className="flex-1 flex flex-col items-center justify-center text-white/20 text-center">
                        <Icon name="folder" size={48} className="mb-4 opacity-50" />
                        <p className="text-xs uppercase font-bold tracking-widest leading-relaxed">Wähle einen Sponsor aus dem Radar,<br/>um ein Pitch-Deck zu generieren.</p>
                     </div>
                  )}
               </div>
            </div>
         </div>
      )}

      {/* VIEW: MEDIA */}
      {activeView === "media" && (
         <div className="space-y-6 animate-fade-in">
             
            {/* PR INBOX SECTION */}
            <div className="bg-[#02050c]/80 border border-neon/50 p-6 rounded-2xl shadow-[0_0_20px_rgba(0,243,255,0.1)]">
               <h3 className="text-neon font-black uppercase tracking-widest text-sm mb-4 flex items-center gap-2"><Icon name="inbox" size={16} /> PR Posteingang (Interviews)</h3>
               
               {activeInterview ? (
                  <div className="bg-black/60 border border-neon/30 p-5 rounded-xl animate-fade-in">
                     <div className="flex justify-between items-start mb-4">
                        <h4 className="text-white font-bold text-lg italic">{activeInterview.title}</h4>
                        <button onClick={() => setActiveInterview(null)} className="text-white/50 hover:text-white"><Icon name="x" size={18} /></button>
                     </div>
                     
                     <div className="bg-white/5 p-4 rounded-lg mb-4 text-sm font-serif italic border-l-2 border-neon text-white/90">
                        {interviewQuestions || (
                           <span className="flex items-center gap-2 text-white/50 animate-pulse"><Icon name="refresh-cw" size={14} className="animate-spin" /> Reporter formuliert die Fragen...</span>
                        )}
                     </div>

                     <textarea 
                        value={interviewAnswers}
                        onChange={e => setInterviewAnswers(e.target.value)}
                        placeholder="Deine Antwort als Trainer (z.B. 'Wir haben sie zerstört, morgen trainieren wir noch härter...')"
                        className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white text-sm outline-none focus:border-neon min-h-[120px] mb-4"
                     />
                     <div className="flex justify-end">
                        <button 
                           onClick={handleSubmitInterview}
                           disabled={isPublishingArticle || !interviewAnswers.trim() || !interviewQuestions}
                           className="bg-neon/20 hover:bg-neon border border-neon text-neon hover:text-black font-black uppercase text-[10px] tracking-widest px-6 py-3 rounded transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                           {isPublishingArticle ? <><Icon name="refresh-cw" size={14} className="animate-spin" /> Veröffentlichen...</> : <><Icon name="send" size={14} /> Freigeben</>}
                        </button>
                     </div>
                  </div>
               ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {availableInterviews.length > 0 ? availableInterviews.map(interview => (
                        <div key={interview.id} className="bg-black/40 border border-white/10 hover:border-neon hover:bg-neon/5 transition-all p-5 rounded-xl cursor-pointer flex flex-col justify-between group" onClick={() => handleOpenInterview(interview)}>
                           <div>
                              <div className="text-[10px] text-neon font-black uppercase tracking-widest mb-1">{interview.type}</div>
                               <div className="text-white font-bold text-base mb-2">{interview.title}</div>
                              <p className="text-xs text-white/50">Neue Presseanfrage eingegangen. Warten auf Stellungnahme des Trainers.</p>
                           </div>
                           <div className="mt-4 flex justify-end">
                              <span className="text-[10px] uppercase font-black tracking-widest text-white/30 group-hover:text-neon flex items-center gap-1 transition-colors">Starten <Icon name="arrow-right" size={12} /></span>
                           </div>
                        </div>
                     )) : (
                        <div className="col-span-full py-8 text-center text-white/30 text-xs font-black uppercase tracking-widest flex flex-col items-center gap-2">
                           <Icon name="check-circle" size={24} className="opacity-50" />
                           Aktuell keine unaufgeforderten Presseanfragen.
                        </div>
                     )}
                  </div>
               )}
            </div>

            {/* PR Draft Editor */}
            <div className="bg-[#02050c]/80 border border-white/10 p-6 rounded-2xl">
               <h3 className="text-white font-black uppercase tracking-widest text-sm mb-4">Neuen PR-Entwurf einreichen</h3>
               <div className="space-y-3">
                   <input 
                       type="text" 
                       value={newPrTitle}
                       onChange={e => setNewPrTitle(e.target.value)}
                       placeholder="Überschrift / Thematik"
                       className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white text-xs font-bold uppercase tracking-wider outline-none focus:border-redbull"
                   />
                   <textarea
                       value={newPrText}
                       onChange={e => setNewPrText(e.target.value)}
                       placeholder="Trainer / Spieler Statement, Text Entwurf, Gerüchteküche..."
                       className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white text-sm font-serif italic outline-none focus:border-redbull min-h-[100px]"
                   />
                   <div className="flex justify-end">
                       <button 
                           onClick={handleCreateDraft}
                           disabled={!newPrTitle || !newPrText}
                           className="bg-white/10 hover:bg-white text-white/50 hover:text-black font-black uppercase tracking-widest text-[10px] px-6 py-3 rounded-lg transition-colors disabled:opacity-30"
                       >
                           Einreichen für Freigabe
                       </button>
                   </div>
               </div>
            </div>

            <div className="bg-[#02050c]/80 border border-redbull/30 p-6 rounded-2xl">
               <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
                  <h3 className="text-redbull font-black uppercase tracking-widest text-sm flex items-center gap-2"><Icon name="edit-3" size={16} /> PR Gatekeeper & Live-Scan</h3>
                  <div className="text-[10px] text-white/40 uppercase font-black tracking-widest">Powered by {aiProvider.toUpperCase()}</div>
               </div>

               <div className="grid grid-cols-1 gap-6">
                  {prDrafts.map(draft => (
                     <div key={draft.id} className={`bg-black/50 border ${draft.riskScore > 50 ? 'border-red-500/50' : draft.riskScore === 0 ? 'border-white/10' : 'border-green-500/50'} rounded-xl p-5 hover:border-white/30 transition-colors`}>
                        <div className="flex justify-between items-start mb-3">
                           <h4 className="text-white font-bold text-lg">{draft.title}</h4>
                           <span className="bg-white/10 text-white/50 text-[10px] font-black uppercase px-3 py-1 rounded">ID: {draft.id}</span>
                        </div>
                        <div className="bg-white/5 font-serif italic text-white/70 p-4 rounded-lg mb-4 text-sm border-l-2 border-white/20">
                           "{draft.text}"
                        </div>
                        
                        {draft.riskReport && (
                           <div className={`p-4 rounded-lg mb-4 border text-sm font-medium ${draft.riskScore > 50 ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-green-500/10 border-green-500/30 text-green-400'}`}>
                              {draft.riskReport}
                              <div className="text-xs uppercase tracking-widest mt-2 opacity-60">Risk Score: {draft.riskScore}/100</div>
                           </div>
                        )}

                        <div className="flex gap-3 mt-2">
                           <button 
                               onClick={() => handlePrScan(draft.id)}
                               disabled={isComputing || !activeKey}
                               className="flex-1 bg-redbull/10 hover:bg-redbull/20 text-redbull border border-redbull/50 p-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                           >
                               <Icon name="search" size={14} /> Live Risiko-Scan
                           </button>
                           <button 
                               onClick={() => handleApproveDraft(draft)}
                               className={`flex-1 p-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors border ${draft.riskScore > 50 ? 'bg-black text-white/20 border-white/10 cursor-not-allowed' : 'bg-white hover:bg-gray-200 text-black border-white'}`}
                               disabled={draft.riskScore > 50}
                           >
                               <Icon name="check" size={14} className="inline mr-1" /> Freigeben
                           </button>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default ExecutiveBoard;
