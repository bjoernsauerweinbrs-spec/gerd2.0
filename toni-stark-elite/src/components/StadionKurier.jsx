import React, { useState } from 'react';
import Icon from './Icon';
import { getAiConfig, sendAiRequest } from '../utils/aiConfig';
import { speakGerd } from '../utils/audioUtils';

const StadionKurier = ({ truthObject, activeRole }) => {
  const [activeIssue] = useState("Saison-Vorschau 2026/27");
  const roster = truthObject?.matchday_roster;

  // PR Machine States
  const [pressInput, setPressInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingSocial, setIsGeneratingSocial] = useState(false);
  const [socialCampaign, setSocialCampaign] = useState(null);
  
  // Podcast States
  const [podcastComment, setPodcastComment] = useState("");
  const [isGeneratingPodcast, setIsGeneratingPodcast] = useState(false);
  const [podcastScript, setPodcastScript] = useState(null);
  const [isPlayingPodcast, setIsPlayingPodcast] = useState(false);
  const [podcastProgress, setPodcastProgress] = useState(0);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  
  
  const [localArticles, setLocalArticles] = useState([
    {
      type: "EDITORIAL",
      headline: "Die Rückkehr der Identität: Taktik trifft Charakter",
      author: `Redaktion ${truthObject?.club_info?.name || "Stark Elite"}`,
      excerpt: "In einer Welt von Daten und Algorithmen erinnert uns das neue System daran, dass Fußball mehr ist als nur Zahlen auf einem Screen.",
      content: "Das Erbe von Gerd Sauerwein lebt in jedem Vektor dieses Systems weiter. Während andere auf reine Effizienz setzen, integriert Stark Elite die menschliche Komponente.",
      image: "/image_0.png",
      featured: true
    },
    {
      type: "TACTICAL ANALYSIS",
      headline: "Der 4-4-2 Hybrid-Ansatz im Detail",
      author: "Neural-Gerd",
      excerpt: `Warum das vertikale Pressing in der ${truthObject?.club_info?.league || 'unserer Liga'} den Unterschied macht.`,
      content: "Durch die Kapselung der defensiven Dreierkette bei Ballbesitz erreichen wir eine Asymmetrie, die gegnerische Pressing-Lines kollabieren lässt.",
      featured: false
    }
  ]);

  const { activeKey, endpoint, modelString, aiProvider } = getAiConfig();

  const copyToFuPa = (art) => {
      const text = `${art.headline.toUpperCase()}\n\n${art.excerpt}\n\n${art.content}\n\nBericht von: ${art.author} | Powered by Stark Elite Gerd 2.0`;
      navigator.clipboard.writeText(text);
      alert("Erfolgreich für FuPa/fussball.de kopiert!");
  };

  const isAmateur = truthObject?.club_info?.isAmateurMode;

  // Combine newly generated articles from ManagementHub PR Inbox with local fallback articles
  const allArticles = [...(truthObject?.magazine_articles || []), ...localArticles];

  const handleGenerateStory = async () => {
      if (!pressInput.trim()) return;
      if (!activeKey) {
          alert("Globaler API Key fehlt! Bitte im NLZ Academy Modul hinterlegen.");
          return;
      }

      setIsGenerating(true);
      
      const systemPrompt = `Du bist "Neural-Gerd", der fiktive, reißerische KI-Chefredakteur und Head of PR eines Elite-Fußballvereins.
Der Manager hat folgendes Zitat oder Statement an die Presse geliefert:
"${pressInput}"

Aufgabe: Schreibe daraus sofort die absolute Titelstory (Frontpage) für das Stadion-Magazin. Der Ton ist aggressiv, arrogant, hyper-loyal zum Verein und extrem polarisierend (wie Boulevard).
Verpacke das Zitat rhetorisch brillant.
WICHTIG: Antworte absolut zwingend auf Deutsch.

Formatiere deine Antwort ZWINGEND in folgendem JSON-Format (Ohne Markdown Code-Blöcke!):
{
  "headline": "[Eine BILD-Zeitungs ähnliche, schreiende Überschrift z.B. ACKER-SKANDAL!]",
  "excerpt": "[Knackiger 2-Zeiler Teaser]",
  "content": "[Der vollständige Text in 2-3 wuchtigen Absätzen.]",
  "author": "Neural-Gerd"
}`;

      try {
          const content = await sendAiRequest(systemPrompt);
          
          let raw = content.trim();
          if(raw.startsWith("```json")) raw = raw.replace(/^```json/, "").replace(/```$/, "").trim();
          else if(raw.startsWith("```")) raw = raw.replace(/^```/, "").replace(/```$/, "").trim();
          
          const parsed = JSON.parse(raw);
          
          const newArticle = {
              type: "EXKLUSIV",
              headline: parsed.headline,
              author: parsed.author,
              excerpt: parsed.excerpt,
              content: parsed.content,
              image: "/image_0.png",
              featured: true
          };

          // Demote old featured articles
          setLocalArticles(prev => [newArticle, ...prev.map(a => ({...a, featured: false}))]);
          setPressInput("");
      } catch (err) {
          console.error(err);
          alert("Fehler bei der Artikel-Generierung. JSON Parse Error oder API Issue.");
      } finally {
          setIsGenerating(false);
      }
  };

  const handleGenerateSocial = async () => {
      if (!pressInput.trim()) return;
      if (!activeKey) {
          alert("Globaler API Key fehlt! Bitte im NLZ Academy Modul hinterlegen.");
          return;
      }

      setIsGeneratingSocial(true);
      
      const systemPrompt = `Du bist der hyper-kreative Social-Media-Manager des Fußballvereins (Persona: Neural-Gerd).
Der Trainer hat folgendes Zitat oder Statement geliefert:
"${pressInput}"

Aufgabe: Generiere eine virale Multi-Plattform Social-Media-Kampagne basierend auf diesem Zitat.
Der Tonfall ist auf junge Fans zugeschnitten: extrem loyal, leicht arrogant, voller Energie.
WICHTIG: Antworte absolut zwingend auf Deutsch.

Formatiere deine Antwort ZWINGEND in folgendem JSON-Format (Ohne Markdown Code-Blöcke!):
{
  "twitter": "[Max. 280 Zeichen, kurz, hitzig, inkl. 3 Hashtags]",
  "instagram": "[Ausholendere Caption, emotional, extrem viele Emojis, starke Fan-Bindung, Call-to-Action]",
  "tiktok_script": "[Exakte Regieanweisung für ein 15-Sekunden Hochformat-Video: Audio, Visuals/Hook, und der Text auf dem Screen]"
}`;

      try {
          const content = await sendAiRequest(systemPrompt);
          
          let raw = content.trim();
          if(raw.startsWith("```json")) raw = raw.replace(/^```json/, "").replace(/```$/, "").trim();
          else if(raw.startsWith("```")) raw = raw.replace(/^```/, "").replace(/```$/, "").trim();
          
          const parsed = JSON.parse(raw);
          setSocialCampaign(parsed);
      } catch (err) {
          console.error(err);
          alert("Fehler bei der Social-Kampagnen-Generierung. JSON Parse Error oder API Issue.");
      } finally {
          setIsGeneratingSocial(false);
      }
  };

  const handleGeneratePodcast = async () => {
      if (!activeKey) {
          alert("Globaler API Key fehlt! Bitte im NLZ Academy Modul hinterlegen.");
          return;
      }

      setIsGeneratingPodcast(true);
      setPodcastScript(null);
      setPodcastProgress(0);
      setCurrentLineIndex(0);
      
      const clubContext = truthObject?.club_info?.name || "unseren Verein";
      const nextMatchContext = truthObject?.club_info?.liveIntelligence?.nextMatch || "das nächste Spiel";
      const lastMatchContext = truthObject?.club_info?.liveIntelligence?.lastMatch || "das letzte Spiel";
      const lastResultContext = truthObject?.club_info?.liveIntelligence?.lastResult || "unbekannt";
      
      const systemPrompt = `Du bist ein Podcast-Script-Generator für den "Stark Elite - Stammtisch".
Aufgabe: Erstelle ein unterhaltsames, witziges und fachlich tiefes Podcast-Script (NotebookLM-Style).
Verein: "${clubContext}"
Kontext: Analyse des letzten Spiels (${lastMatchContext}, Ergebnis: ${lastResultContext}) und heißer Ausblick auf das kommende Spiel (${nextMatchContext}).
Coach-Insight: "${podcastComment}"

Charaktere (MÜSSEN witzig und gegensätzlich sein):
1. Gerd: Der "Professor". Er liebt Wörter wie "reproduzierbare Abläufe" und "Pack-Maße". Er ist ein Nerd, der zum Lachen in den Taktikraum geht. Er nimmt alles extrem ernst.
2. Kalle: Die "Legende". Er hat früher selbst gespielt (behauptet er), liebt die Bratwurst und hasst modernes "Laptoptrainer-Gequatsche", obwohl er Gerd heimlich bewundert. Er ist schlagfertig und emotional.

Tonalität: 
- Humorvolle Sticheleien zwischen beiden.
- Fachliche Tiefe (Gerd) trifft auf Stammtisch-Parolen (Kalle).
- Erwähne ZWINGEND das nächste Spiel gegen "${nextMatchContext}".
- Das Script soll LANG sein (ca. 15-20 Dialogzeilen).

Formatiere deine Antwort ZWINGEND in folgendem JSON-Format (Ohne Markdown Code-Blöcke!):
{
  "title": "Elite Talk: ${clubContext} Inside",
  "dialogue": [
    {"speaker": "Gerd", "text": "..."},
    {"speaker": "Kalle", "text": "..."}
  ]
}`;

      try {
          const content = await sendAiRequest(systemPrompt);
          let raw = content.trim();
          if(raw.startsWith("```json")) raw = raw.replace(/^```json/, "").replace(/```$/, "").trim();
          else if(raw.startsWith("```")) raw = raw.replace(/^```/, "").replace(/```$/, "").trim();
          
          const parsed = JSON.parse(raw);
          setPodcastScript(parsed);
      } catch (err) {
          console.error(err);
          alert("Fehler bei der Podcast-Generierung.");
      } finally {
          setIsGeneratingPodcast(false);
      }
  };

  // Audio System (Web Speech API)
  const speakLine = (index) => {
    if (!podcastScript) return;
    
    const line = podcastScript.dialogue[index];
    if (!line) return;
    
    // Use standardized Gerd voice for all speakers to ensure male profile
    speakGerd(line.text, {
        pitch: line.speaker === 'Gerd' ? 0.7 : 1.0, 
        rate: line.speaker === 'Gerd' ? 0.9 : 1.1,
        onEnd: () => {
           if (isPlayingPodcast && index < podcastScript.dialogue.length - 1) {
              setTimeout(() => {
                  if (!isPlayingPodcast) return;
                  const nextIdx = index + 1;
                  setCurrentLineIndex(nextIdx);
                  setPodcastProgress(((nextIdx + 1) / podcastScript.dialogue.length) * 100);
                  speakLine(nextIdx);
              }, 1500);
           } else if (index === podcastScript.dialogue.length - 1) {
              setIsPlayingPodcast(false);
              setPodcastProgress(100);
           }
        }
    });
  };

  React.useEffect(() => {
     if (isPlayingPodcast) {
        speakLine(currentLineIndex);
     } else {
        window.speechSynthesis?.cancel();
     }
     return () => window.speechSynthesis?.cancel();
  }, [isPlayingPodcast]);

  const showPressRoom = activeRole === 'Manager' || activeRole === 'Presse' || !activeRole;

  const clubName = truthObject?.club_info?.name || "Stark Elite";
  const nextMatch = truthObject?.club_info?.liveIntelligence?.nextMatch || "Das nächste Topspiel";
  
  // Categorize
  const editorials = allArticles.filter(a => a.type === "EDITORIAL");
  const prArticles = allArticles.filter(a => a.type === "EXKLUSIV INTERVIEW" || a.type === "OFFIZIELLE MITTEILUNG" || a.type === "EXKLUSIV" || a.type === "EXKLUSIV STORY");
  const nlzArticles = allArticles.filter(a => a.type === "NLZ NEWS");
  const tacticalArticles = allArticles.filter(a => a.type === "TACTICAL ANALYSIS");

  return (
    <div className="animate-fade-in min-h-screen bg-[#e5e5e5] text-navy font-serif p-4 md:p-8 overflow-y-auto">
      
      {/* PRESS ROOM INPUT */}
      {showPressRoom && (
         <div className="max-w-6xl mx-auto mb-12 bg-white border-2 border-red-600 shadow-xl p-6 relative">
             <div className="absolute top-0 left-0 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 -translate-y-1/2">
                 Live Press Room
             </div>
             <h3 className="text-xl font-black uppercase italic mb-2">Statement eingeben</h3>
             <textarea 
                 value={pressInput}
                 onChange={(e) => setPressInput(e.target.value)}
                 placeholder="Sag der Presse, warum wir den Schiedsrichter hassen, oder warum unser Neuzugang der Beste der Liga ist..."
                 className="w-full bg-gray-100 border border-gray-300 p-4 text-navy font-serif text-sm outline-none focus:border-red-600 focus:bg-white transition-colors mb-4 custom-scrollbar"
                 rows={3}
             />
             <div className="flex justify-end items-center gap-4 flex-wrap mt-4">
                 {(isGenerating || isGeneratingSocial) && <span className="text-red-600 text-[10px] font-black uppercase flex items-center gap-2 animate-pulse"><Icon name="cpu" size={12} className="animate-spin" /> KI arbeitet...</span>}
                 
                 <button 
                    onClick={handleGenerateSocial}
                    disabled={isGeneratingSocial || !pressInput.trim()}
                    className="bg-black hover:bg-[#00f3ff] border border-[#00f3ff]/50 hover:border-[#00f3ff] text-[#00f3ff] hover:text-black px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                    <Icon name="share-2" size={14} /> Social Kampagne <span className="hidden md:inline">Generieren</span>
                 </button>

                 <button 
                    onClick={handleGenerateStory}
                    disabled={isGenerating || !pressInput.trim()}
                    className="bg-navy hover:bg-gold text-white hover:text-navy px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                    <Icon name="file-text" size={14} /> EXKLUSIV-Story <span className="hidden md:inline">Generieren</span>
                 </button>
             </div>
         </div>
      )}

      {/* SQUAD SOCIAL STUDIO */}
      {showPressRoom && socialCampaign && (
         <div className="max-w-6xl mx-auto mb-12 bg-[#02050c]/90 border border-white/10 p-6 rounded-xl animate-fade-in shadow-2xl">
             <h3 className="text-white text-lg font-black uppercase tracking-widest mb-6 flex items-center gap-2"><Icon name="radio" size={18} className="text-[#00f3ff]" /> Live Social Media Kampagne</h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Twitter */}
                <div className="bg-[#1DA1F2]/10 border border-[#1DA1F2]/30 rounded-lg p-5 flex flex-col relative overflow-hidden group">
                   <div className="flex items-center gap-2 text-[#1DA1F2] font-black text-[10px] uppercase tracking-widest mb-4"><Icon name="twitter" size={14} /> X / Twitter Drop</div>
                   <p className="text-white/80 font-sans text-sm leading-relaxed whitespace-pre-wrap flex-1">{socialCampaign.twitter}</p>
                   <button className="mt-4 w-full border border-[#1DA1F2] text-[#1DA1F2] hover:bg-[#1DA1F2] hover:text-white text-[10px] font-black uppercase py-2 rounded transition-colors group" onClick={() => navigator.clipboard.writeText(socialCampaign.twitter)}>Copy to Clipboard</button>
                </div>

                {/* Instagram */}
                <div className="bg-gradient-to-tr from-[#f9ce34]/10 via-[#ee2a7b]/10 to-[#6228d7]/10 border border-[#ee2a7b]/30 rounded-lg p-5 flex flex-col relative overflow-hidden">
                   <div className="flex items-center gap-2 text-[#ee2a7b] font-black text-[10px] uppercase tracking-widest mb-4"><Icon name="instagram" size={14} /> Instagram Caption</div>
                   <p className="text-white/80 font-sans text-xs leading-relaxed whitespace-pre-wrap flex-1 max-h-[200px] overflow-y-auto custom-scrollbar">{socialCampaign.instagram}</p>
                   <button className="mt-4 w-full bg-gradient-to-r from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] hover:opacity-80 text-white text-[10px] font-black uppercase py-2 rounded transition-all" onClick={() => navigator.clipboard.writeText(socialCampaign.instagram)}>Copy Caption</button>
                </div>

                {/* TikTok */}
                <div className="bg-[#00f2fe]/10 border border-[#fe0979]/30 rounded-lg p-5 flex flex-col justify-between relative overflow-hidden">
                   <div>
                     <div className="flex items-center gap-2 text-[#fe0979] font-black text-[10px] uppercase tracking-widest mb-4"><Icon name="video" size={14} className="text-[#00f2fe]" /> TikTok / Reel Script</div>
                     <p className="text-white/80 font-mono text-[11px] leading-relaxed whitespace-pre-wrap max-h-[200px] overflow-y-auto custom-scrollbar">{socialCampaign.tiktok_script}</p>
                   </div>
                   <button className="mt-4 w-full border border-[#00f2fe] text-[#00f2fe] hover:bg-[#00f2fe] hover:text-black hover:border-transparent text-[10px] font-black uppercase py-2 rounded transition-colors" onClick={() => navigator.clipboard.writeText(socialCampaign.tiktok_script)}>Copy Script</button>
                </div>
             </div>
         </div>
      )}

      {/* NEURAL PODCAST HUB */}
      {showPressRoom && (
          <div className="max-w-6xl mx-auto mb-12 bg-gradient-to-br from-[#0a0a0f] to-[#1a1a2e] border border-[#00f3ff]/20 rounded-3xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                  <Icon name="mic" size={180} className="text-[#00f3ff]" />
              </div>
              
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                  <div className="shrink-0">
                      <div className={`w-32 h-32 rounded-2xl bg-black border-2 border-[#00f3ff]/50 flex items-center justify-center shadow-[0_0_30px_rgba(0,243,255,0.2)] ${isGeneratingPodcast ? 'animate-pulse' : ''}`}>
                          <Icon name="headphones" size={60} className="text-[#00f3ff]" />
                      </div>
                  </div>
                  
                  <div className="flex-1 text-center md:text-left">
                      <div className="text-[#00f3ff] text-[10px] font-black uppercase tracking-[0.4em] mb-2">NotebookLM Integration</div>
                      <h3 className="text-white text-3xl font-black uppercase italic tracking-tighter mb-4">Neural <span className="text-[#00f3ff]">Podcast</span> Lab</h3>
                      <p className="text-white/60 text-sm font-serif italic max-w-xl mb-6">
                          Lass Gerd und Kalle die aktuelle Lage deines Vereins in einem KI-generierten Deep-Dive analysieren. Taktik trifft auf Emotion.
                      </p>
                      
                      {!podcastScript ? (
                        <div className="w-full max-w-xl space-y-4">
                            <textarea 
                                value={podcastComment}
                                onChange={(e) => setPodcastComment(e.target.value)}
                                placeholder="Coach Insight (z.B. 'Kritik an der Chancenverwertung' oder 'Lob für den Nachwuchs')..."
                                className="w-full bg-black/40 border border-[#00f3ff]/20 p-4 text-white font-serif text-sm outline-none focus:border-[#00f3ff] rounded-xl custom-scrollbar"
                                rows={2}
                            />
                            <button 
                                onClick={handleGeneratePodcast}
                                disabled={isGeneratingPodcast}
                                className="bg-[#00f3ff] hover:bg-white text-black px-8 py-4 rounded-xl font-black uppercase text-xs tracking-widest transition-all flex items-center gap-3 shadow-[0_0_20px_rgba(0,243,255,0.4)] disabled:opacity-50"
                            >
                                {isGeneratingPodcast ? <><Icon name="cpu" className="animate-spin" /> Generiere Deep-Dive...</> : <><Icon name="zap" /> KI-Podcast erstellen</>}
                            </button>
                        </div>
                      ) : (
                        <div className="w-full max-w-2xl bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
                            <div className="flex items-center justify-between mb-4">
                                <div className="text-white font-bold text-lg uppercase tracking-tight">{podcastScript.title}</div>
                                <button 
                                    onClick={() => { setIsPlayingPodcast(!isPlayingPodcast); if (podcastProgress >= 100) setPodcastProgress(0); }} 
                                    className="w-12 h-12 bg-[#00f3ff] text-black rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-[0_0_15px_rgba(0,243,255,0.5)]"
                                >
                                    <Icon name={isPlayingPodcast ? "pause" : "play"} size={20} />
                                </button>
                            </div>
                            
                            {/* PROGRESS BAR */}
                            <div className="w-full h-1 bg-white/10 rounded-full mb-6 overflow-hidden relative">
                                <div className="h-full bg-[#00f3ff] transition-all duration-300" style={{ width: `${podcastProgress}%` }}></div>
                                {isPlayingPodcast && (
                                    <div className="absolute inset-0 flex items-center justify-around px-2 pointer-events-none opacity-50">
                                        {[1,2,3,4,5,6,7,8].map(i => (
                                            <div key={i} className={`w-0.5 bg-[#00f3ff] animate-pulse`} style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 0.1}s` }}></div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            
                            {/* DIALOGUE DISPLAY */}
                            <div className="min-h-[80px] flex items-center justify-start gap-4">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${podcastScript.dialogue[currentLineIndex].speaker === 'Gerd' ? 'bg-[#00f3ff]/10 border-[#00f3ff]/30 text-[#00f3ff]' : 'bg-red-600/10 border-red-600/30 text-red-600'}`}>
                                    <Icon name={podcastScript.dialogue[currentLineIndex].speaker === 'Gerd' ? 'cpu' : 'user'} size={18} />
                                </div>
                                <div>
                                    <div className="text-[9px] font-black uppercase tracking-widest opacity-50 mb-1">{podcastScript.dialogue[currentLineIndex].speaker}</div>
                                    <p className="text-white text-sm font-serif italic leading-relaxed animate-fade-in" key={currentLineIndex}>
                                        "{podcastScript.dialogue[currentLineIndex].text}"
                                    </p>
                                </div>
                            </div>
                        </div>
                      )}
                  </div>
              </div>
          </div>
      )}
               {/* MAG-WRAPPER */}
      <div className="max-w-[1400px] mx-auto bg-white shadow-2xl">
         
         {/* COVER PAGE */}
         <div className="min-h-[80vh] bg-navy text-white relative flex flex-col justify-between overflow-hidden p-8 md:p-16">
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "repeating-linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), repeating-linear-gradient(45deg, #000 25%, #ffffff 25%, #ffffff 75%, #000 75%, #000)", backgroundPosition: "0 0, 10px 10px", backgroundSize: "20px 20px" }}></div>
            <div className="relative z-10 flex justify-between items-start">
               <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.4em] mb-2 text-gold">Offizielles {isAmateur ? "Vereins-Heim" : "Stadion-Magazin"}</div>
                  <h1 className="text-6xl md:text-9xl font-black italic tracking-tighter uppercase leading-none">
                     {isAmateur ? "Vereins" : "Stadion"}<br/><span className="text-gold">{isAmateur ? "Heim" : "Kurier"}</span>
                  </h1>
               </div>
               <div className="text-right">
                  <div className="text-xl font-black italic">{activeIssue}</div>
                  <div className="text-sm font-bold uppercase tracking-widest mt-2">{clubName}</div>
               </div>
            </div>

            <div className="relative z-10 mt-auto pt-24 text-center md:text-left">
               <div className="bg-red-600 inline-block px-4 py-1 text-white text-xs uppercase font-black tracking-widest mb-4 shadow-lg">MATCHDAY</div>
               <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] mb-6">{nextMatch.replace('Kommendes Auswärtsspiel:', '').replace('Kommendes Heimspiel:', '').trim()}</h2>
               <p className="text-xl md:text-3xl font-serif italic text-white/80 max-w-3xl">
                  {editorials[0]?.excerpt || "Alle exklusiven Interviews, die Start-11 und die neuesten Taktik-Analysen direkt aus der Kommandozentrale."}
               </p>
            </div>
         </div>

         {/* PAGE: EDITORIAL */}
         {editorials.length > 0 && (
            <div className="border-b-[12px] border-navy flex flex-col md:flex-row">
               <div className="w-full md:w-1/3 bg-gray-100 p-12 flex flex-col justify-center items-center text-center border-r border-gray-200">
                  <div className="w-48 h-48 rounded-full bg-gray-300 mb-6 overflow-hidden border-4 border-white shadow-xl flex items-center justify-center">
                     <Icon name="user" size={80} className="text-white" />
                  </div>
                  <div className="text-xs font-black uppercase tracking-widest text-gold mb-1">Editorial</div>
                  <h3 className="text-2xl font-black italic uppercase leading-tight text-navy">{editorials[0].author}</h3>
               </div>
               <div className="w-full md:w-2/3 p-12 md:p-20 bg-white">
                  <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-8 leading-none text-navy">
                     {editorials[0].headline}
                  </h2>
                  <p className="text-xl font-bold italic mb-8 border-l-4 border-gold pl-6 leading-relaxed text-gray-700">
                     {editorials[0].excerpt}
                  </p>
                  <div className="text-base leading-loose hyphens-auto font-medium columns-1 md:columns-2 gap-12 text-justify text-gray-800">
                     <span className="float-left text-7xl font-black leading-none mr-3 mt-2 text-gold">
                        {editorials[0].content.charAt(0)}
                     </span>
                     {editorials[0].content.substring(1)}
                  </div>
               </div>
            </div>
         )}

         {/* PAGE: PR NEWS / EXKLUSIV (MULTI-COLUMN NEWSPAPER) */}
         {prArticles.length > 0 && (
            <div className="p-12 md:p-24 bg-white">
               <div className="flex items-end justify-between mb-16 border-b-4 border-navy pb-4">
                  <h2 className="text-6xl font-black uppercase tracking-tighter italic text-navy">Stimmen & <span className="text-red-600">Insides</span></h2>
                  <div className="text-sm font-black uppercase tracking-widest text-gray-400 hidden md:block">Exklusivberichte</div>
               </div>
               
               <div className="space-y-24">
                  {prArticles.map((art, i) => (
                     <div key={i} className="animate-fade-in relative shadow-sm p-4 rounded-xl border border-gray-50">
                        {art.type.includes('EXKLUSIV') && (
                           <div className="absolute -top-6 -left-6 hidden md:block opacity-5">
                              <Icon name="radio" size={150} />
                           </div>
                        )}
                        <div className="relative z-10">
                           <div className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                              {art.type.includes('EXKLUSIV') ? <span className="flex items-center gap-2 animate-pulse"><Icon name="radio" size={14} /> LIVE EXKLUSIV</span> : <><Icon name="file-text" size={14} /> PRESSEMITTEILUNG</>}
                           </div>
                           <h3 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-8 leading-[0.9] text-navy">{art.headline}</h3>
                           <p className="text-2xl font-bold italic mb-12 leading-snug max-w-4xl text-gray-800 border-l-4 border-red-600 pl-6 bg-gray-50 p-4">
                              {art.excerpt}
                           </p>
                           
                           <div className="text-base md:text-lg leading-relaxed hyphens-auto font-medium columns-1 md:columns-3 gap-12 text-justify text-gray-800">
                              {art.content.split('\n\n').map((para, pIdx) => {
                                 const isStatsTable = para.includes('---') || para.toLowerCase().includes('tabelle') || para.toLowerCase().includes('startelf');
                                 if (isStatsTable) {
                                    return (
                                       <div key={pIdx} className="break-inside-avoid bg-gray-100 p-6 mt-6 border-t-4 border-gold shadow-sm">
                                          <div className="text-xs font-black uppercase tracking-widest text-navy mb-4"><Icon name="bar-chart" size={14} className="inline mr-2"/> MATCH FACTS</div>
                                          <div className="text-sm font-mono whitespace-pre-wrap leading-loose">
                                             {para.replace(/---/g, '').trim()}
                                          </div>
                                       </div>
                                    );
                                 }
                                 return (
                                    <p key={pIdx} className="mb-6 break-inside-avoid">
                                       {pIdx === 0 && <span className="float-left text-6xl font-black leading-none mr-2 mt-1 text-navy">{para.charAt(0)}</span>}
                                       {pIdx === 0 ? para.substring(1) : para}
                                    </p>
                                 );
                              })}
                           </div>
                           <div className="mt-8 pt-4 border-t border-gray-200 flex justify-between items-center">
                               <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                   Reportage von: {art.author}
                               </div>
                               <button 
                                 onClick={() => copyToFuPa(art)}
                                 className="px-4 py-2 bg-navy text-white text-[10px] font-black uppercase tracking-widest rounded hover:bg-gold hover:text-navy transition-all flex items-center gap-2"
                               >
                                 <Icon name="copy" size={12} /> Für FuPa kopieren
                               </button>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         )}

         {/* PAGE: MATCHDAY ROSTER & FACTS */}
         {roster && roster.length > 0 && (
            <div className="bg-[#02050c] text-white p-12 md:p-24 relative overflow-hidden">
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] pointer-events-none">
                  <Icon name="shield" size={800} />
               </div>
               <div className="relative z-10 flex flex-col lg:flex-row gap-20">
                  <div className="flex-1">
                     <div className="text-[12px] font-black text-gold uppercase tracking-[0.3em] mb-4">Das Personal</div>
                     <h2 className="text-6xl font-black uppercase tracking-tighter italic mb-16 text-white">Start-11</h2>
                     
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-16 gap-y-6">
                        {roster.map(player => (
                           <div key={player.id} className="flex items-center gap-6 border-b border-white/10 pb-4 group hover:border-gold transition-colors">
                               <span className="text-gold font-black w-8 text-xl leading-none">{player.position}</span>
                               <span className="font-bold uppercase tracking-widest text-lg group-hover:text-gold transition-colors">{player.name}</span>
                           </div>
                        ))}
                     </div>
                  </div>
                  
                  <div className="w-full lg:w-1/3 flex flex-col justify-center">
                     <div className="bg-white/5 border border-white/10 p-10 rounded-2xl backdrop-blur-md">
                        <h3 className="text-gold font-black uppercase tracking-widest text-sm mb-8 flex items-center gap-3"><Icon name="bar-chart-2" size={20}/> Fakten zum Spiel</h3>
                        <div className="space-y-8">
                           <div>
                              <div className="text-[10px] text-white/50 uppercase font-black tracking-widest mb-1">Aktueller Tabellenplatz</div>
                              <div className="text-4xl font-black italic">{truthObject?.club_info?.table_position || 4}. Platz</div>
                           </div>
                           <div className="w-full h-px bg-white/10"></div>
                           <div>
                              <div className="text-[10px] text-white/50 uppercase font-black tracking-widest mb-1">Wettbewerb</div>
                              <div className="text-2xl font-bold uppercase tracking-wider">{truthObject?.club_info?.league || "Bundesliga"}</div>
                           </div>
                           <div className="w-full h-px bg-white/10"></div>
                           <div>
                              <div className="text-[10px] text-white/50 uppercase font-black tracking-widest mb-1">Zuschauererwartung</div>
                              <div className="text-2xl font-bold uppercase tracking-wider text-green-400">Ausverkauft</div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         )}

         {/* PAGE: NLZ NEWS */}
         {nlzArticles.length > 0 && (
            <div className="p-12 md:p-24 bg-gray-50 border-t-8 border-gold relative overflow-hidden">
               <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                  <Icon name="star" size={300} />
               </div>
               <div className="flex items-center justify-between mb-16 border-b-2 border-gray-300 pb-6 relative z-10">
                  <h2 className="text-6xl font-black uppercase tracking-tighter italic text-navy">{isAmateur ? "Jugend" : "Talentschmiede"} <span className="text-gold">NLZ</span></h2>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-16 relative z-10">
                  {nlzArticles.map((art, i) => (
                     <div key={i} className="bg-white p-12 shadow-2xl border-t-4 border-red-600 hover:-translate-y-2 transition-transform h-fit">
                        <div className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-6 flex items-center gap-2"><Icon name="zap" size={14}/> Jugendabteilung</div>
                        <h3 className="text-4xl font-black uppercase tracking-tighter mb-6 leading-[1.1] text-navy">{art.headline}</h3>
                        <p className="text-xl font-bold italic mb-8 text-gray-600 leading-relaxed border-l-4 border-gold pl-6 bg-gray-50 py-4">
                           {art.excerpt}
                         </p>
                         <div className="text-base leading-relaxed hyphens-auto font-medium text-gray-800 text-justify mb-8">
                           {art.content}
                         </div>
                         <button 
                            onClick={() => copyToFuPa(art)}
                            className="w-full py-3 border-2 border-navy text-navy text-[10px] font-black uppercase tracking-widest hover:bg-navy hover:text-white transition-all flex items-center justify-center gap-2"
                         >
                            <Icon name="copy" size={12} /> Text für FuPa / Lokalsport kopieren
                         </button>
                     </div>
                  ))}
               </div>
            </div>
         )}

         {/* PAGE: TACTICAL OR MORE */}
         {tacticalArticles.length > 0 && (
            <div className="p-12 md:p-24 bg-navy text-white text-center">
               <h2 className="text-3xl font-black uppercase tracking-[0.3em] mb-16 opacity-50">Taktik & Analysen</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto gap-12">
                  {tacticalArticles.map((art, i) => (
                     <div key={i} className="group cursor-pointer bg-white/5 border border-white/10 p-8 rounded-xl hover:bg-gold hover:text-navy transition-all h-fit">
                        <div className="text-[10px] font-black uppercase tracking-widest mb-4 opacity-50 group-hover:opacity-100">{art.type}</div>
                        <h4 className="text-2xl font-black uppercase leading-tight mb-4">{art.headline}</h4>
                        <p className="text-sm leading-relaxed opacity-70 mb-6">{art.excerpt}</p>
                        <div className="text-[10px] font-bold uppercase tracking-widest border-b border-white/20 inline-block pb-1 group-hover:border-navy group-hover:text-navy">Weiterlesen →</div>
                        <button 
                            onClick={(e) => { e.stopPropagation(); copyToFuPa(art); }}
                            className="mt-4 w-full py-2 bg-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-navy transition-all"
                        >
                            Copy for Media
                        </button>
                     </div>
                  ))}
               </div>
            </div>
         )}

      </div>
    </div>
  );
};

export default StadionKurier;
