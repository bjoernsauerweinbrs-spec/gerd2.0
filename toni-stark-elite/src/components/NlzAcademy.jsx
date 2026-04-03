import React, { useState, useEffect, useRef, useMemo } from 'react';
import Icon from './Icon';
import TacticalHub from './TacticalHub';
import { getAiConfig, sendAiRequest, extractPlayersFromImage } from '../utils/aiConfig';
import { saveLogisticsEntry, savePlan, fetchLogistics, supabase } from '../utils/supabaseClient';
import { speakGerd } from '../utils/audioUtils';
import NlzScanner from './nlz/NlzScanner';
import NlzWeekPlanner from './nlz/NlzWeekPlanner';

const NlzAcademy = ({ truthObject, setTruthObject, activeRole }) => {
  const [activeNlzView, setActiveNlzView] = useState("finance");
  const [logisticsInput, setLogisticsInput] = useState("");
  const [isSendingRequest, setIsSendingRequest] = useState(false);
  const [isExtractingSquad, setIsExtractingSquad] = useState(false);
  
  // Read global state instead of local
  const youthPlayers = truthObject.nlz_squad || [];

  const [ageFilter, setAgeFilter] = useState("All");
  const [annualFee, setAnnualFee] = useState(60);

  const [nlzPlayerPositions, setNlzPlayerPositions] = useState({});
  const [activeDossierPlayerId, setActiveDossierPlayerId] = useState(null);

  // --- Stat Editing ---
  const [showStatEditModal, setShowStatEditModal] = useState(false);
  const [editingStatsPlayer, setEditingStatsPlayer] = useState(null);
  const [tempStats, setTempStats] = useState({ pac: 50, sho: 50, pas: 50, dri: 50, def: 50, phy: 50 });

  // --- Phase 32: Trainer-Parent Comms ---
  const [dossierEvalNote, setDossierEvalNote] = useState("");
  const [dossierChatInput, setDossierChatInput] = useState("");

  const handleSaveEvaluation = (playerId, rating) => {
    const updatedSquad = youthPlayers.map(p => {
      if (p.id === playerId) {
        return {
          ...p,
          lastTrainingEval: {
            rating,
            note: dossierEvalNote,
            date: new Date().toLocaleDateString('de-DE')
          }
        };
      }
      return p;
    });
    setTruthObject({ ...truthObject, nlz_squad: updatedSquad });
    setDossierEvalNote(""); // reset
  };

  const handleOpenStatEdit = (e, player) => {
    e.stopPropagation();
    setEditingStatsPlayer(player);
    setTempStats({
      pac: player.pac || 50,
      sho: player.sho || 50,
      pas: player.pas || 50,
      dri: player.dri || 50,
      def: player.def || 50,
      phy: player.phy || 50
    });
    setShowStatEditModal(true);
  };

  const handleSaveStats = () => {
    const updatedSquad = youthPlayers.map(p => 
      p.id === editingStatsPlayer.id ? { ...p, ...tempStats } : p
    );
    setTruthObject({ ...truthObject, nlz_squad: updatedSquad });
    setShowStatEditModal(false);
    setEditingStatsPlayer(null);
  };

  const uploadPlayerAvatar = async (event, playerId) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsSendingRequest(true);
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${playerId}_${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        // 1. Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from('player_avatars')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        // 2. Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from('player_avatars')
            .getPublicUrl(filePath);

        // 3. Update truthObject (NLZ Squad)
        const updatedSquad = youthPlayers.map(p => 
            p.id === playerId ? { ...p, avatar_url: publicUrl } : p
        );
        setTruthObject({ ...truthObject, nlz_squad: updatedSquad });
        
        speakGerd(`Avatar für Spieler ${playerId} erfolgreich hochgeladen!`);
    } catch (err) {
        console.error("Avatar Upload Error:", err);
        if (err.message?.includes("Bucket not found") || err.name === "StorageApiError") {
            alert("FEHLER: Supabase Bucket 'player_avatars' wurde nicht gefunden. Bitte führen Sie das bereitgestellte SQL-Setup in Ihrem Supabase Dashboard aus.");
        } else {
            alert("Upload fehlgeschlagen: " + err.message);
        }
    } finally {
        setIsSendingRequest(false);
    }
  };

  const [nlzPrDrafts, setNlzPrDrafts] = useState([
    { id: 101, title: "Stadionkurier Seite 3: 'Die Jugend brennt'", text: "Ein Artikel über die neuen Talente aus dem NLZ. Hervorgehoben wird der brutale Konkurrenzkampf und wie die jungen Spieler die Altstars unter Druck setzen.", status: "pending", riskScore: 0, riskReport: "" },
  ]);

  // --- NLZ PR INBOX ---
  const [activeNlzInterview, setActiveNlzInterview] = useState(null);
  const [nlzInterviewQuestions, setNlzInterviewQuestions] = useState("");
  const [nlzInterviewAnswers, setNlzInterviewAnswers] = useState("");
  const [isPublishingNlzArticle, setIsPublishingNlzArticle] = useState(false);
  const [isComputingNlz, setIsComputingNlz] = useState(false);

  const clubName = truthObject?.club_info?.name || "Stark Elite";
  const availableNlzInterviews = [
      {
          id: "nlz-talent",
          type: "Talent-Fokus",
          title: "Bericht über ein Top-Talent",
          prompt: `Du bist ein Redakteur der Vereinsmedien von ${clubName}. Die Presseabteilung möchte einen Artikel über eines der aufstrebenden Talente im NLZ schreiben.
Schlage 2 konkrete Fragen vor, die man der NLZ-Leitung dazu stellen kann (z.B. Wie nah ist der Spieler an den Profis? Welche Schwächen muss er noch ausbügeln?).
WICHTIG: Antworte AUSSCHLIESSLICH mit den beiden Fragen (als Aufzählung).`
      },
      {
          id: "nlz-philosophie",
          type: "NLZ-Philosophie",
          title: "Die Ausrichtung der Akademie",
          prompt: `Du bist ein Redakteur der Vereinsmedien von ${clubName}. Die Presseabteilung möchte einen Grundsatz-Artikel über die Philosophie der Akademie schreiben.
Schlage 2 kritische Fragen vor, die man der NLZ-Leitung dazu stellen kann (z.B. Geht das Gewinnen über die Entwicklung? Reicht die Infrastruktur aus?).
WICHTIG: Antworte AUSSCHLIESSLICH mit den beiden Fragen (als Aufzählung).`
      }
  ];

  const [ledger, setLedger] = useState([]);

  useEffect(() => {
    fetchLogistics().then(data => setLedger(data));
    
    // Subscribe to changes for real-time logistics (Manager approval etc)
    const channel = supabase
      .channel('public:logistics_ledger')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'logistics_ledger' }, (payload) => {
        fetchLogistics().then(data => setLedger(data));
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const handleRequestMaterial = async () => {
    if (!logisticsInput.trim()) return;
    setIsSendingRequest(true);
    const newReq = {
      item_name: logisticsInput,
      type: 'expense',
      category: 'material',
      status: 'requested',
      requester_name: "NLZ Head Coach"
    };
    
    await saveLogisticsEntry(newReq);
    setLogisticsInput("");
    setIsSendingRequest(false);
    alert("Anforderung an das Management gesendet (Persistent in Supabase).");
  };

  const handleOpenNlzInterview = (interview) => {
      setActiveNlzInterview(interview);
      setNlzInterviewQuestions("");
      setNlzInterviewAnswers("");
      
      const { activeKey } = getAiConfig();
      if (!activeKey) return;
      setIsComputingNlz(true);
      
      sendAiRequest(interview.prompt)
      .then(res => setNlzInterviewQuestions(res.trim()))
      .catch(err => setNlzInterviewQuestions("Fehler beim Abrufen der Fragen."))
      .finally(() => setIsComputingNlz(false));
  };

  const handleSubmitNlzInterview = () => {
      if (!activeNlzInterview || !nlzInterviewAnswers) return;
      setIsPublishingNlzArticle(true);

      const systemPrompt = `Du bist Chefredakteur für das Vereins-Magazin von ${clubName}.
Die Fragen der Redaktion an die NLZ-Leitung:
${nlzInterviewQuestions}

Die Antworten der NLZ-Leitung:
${nlzInterviewAnswers}

Schreibe nun eine spannende NLZ-Story für das Vereinsmagazin.
WICHTIG:
- Nutze auf keinen Fall den Namen 'Gerd'. Nenne den Antworter stattdessen 'die NLZ-Leitung'.
- Der Text MUSS die Antworten sowie den inhaltlichen Kern enthalten.
- Der Ton ist professionell, stolz auf die Jugend und zukunftsorientiert.

WICHTIG: Nutze für deine Antwort EXAKT dieses Format (KEIN JSON!):
HEADLINE: [Reißerische Überschrift]
EXCERPT: [Dein spannender Teaser-Satz]
CONTENT: [Der vollständige Artikel in 2-3 Absätzen]`;

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

             const newDraft = {
                 id: Date.now(),
                 title: parsed.headline,
                 text: parsed.excerpt + " " + parsed.content,
                 status: "pending",
                 riskScore: 0,
                 riskReport: ""
             };

             setNlzPrDrafts([newDraft, ...nlzPrDrafts]);
             setActiveNlzInterview(null);
             alert("KI-Entwurf erfolgreich generiert! Liegt jetzt im PR Gatekeeper zur Freigabe.");
          } catch(e) {
             console.error("Parse Error NLZ Article", e);
             alert("Fehler beim Formatieren des Artikels.");
          }
      })
      .catch(err => alert("Fehler: Artikel konnte nicht generiert werden."))
      .finally(() => setIsPublishingNlzArticle(false));
  };

  const handleApproveNlzDraft = (draft) => {
      const newArticle = {
          type: "NLZ NEWS",
          headline: draft.title,
          author: "NLZ Leitung",
          excerpt: "Neues aus der Kaderschmiede.",
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
      
      setNlzPrDrafts(prev => prev.filter(d => d.id !== draft.id));
      alert(`Jugend-Artikel "${draft.title}" erfolgreich im StadionKurier veröffentlicht!`);
  };

  const handleNlzPrScan = async (draftId) => {
      const draftToScan = nlzPrDrafts.find(d => d.id === draftId);
      if(!draftToScan) return;
      const { activeKey, aiProvider } = getAiConfig();
      if (!activeKey) return alert(`Kein API Key für ${aiProvider}!`);

      const systemPrompt = `Bewerte folgenden PR-Text für die Jugendabteilung auf Risiko für einen PR-Skandal (0-100).
Text: "${draftToScan.text}"
Antworte zwingend im JSON Format: {"score": [Zahl 0-100], "report": "[1 Satz Begründung]"}`;

      try {
          let res = await sendAiRequest(systemPrompt);
          res = res.trim();
          if (res.startsWith("```json")) res = res.replace(/^```json/, "").replace(/```$/, "").trim();
          else if (res.startsWith("```")) res = res.replace(/^```/, "").replace(/```$/, "").trim();

          const parsed = JSON.parse(res);
          setNlzPrDrafts(prev => prev.map(d => 
              d.id === draftId ? { ...d, riskScore: parsed.score, riskReport: parsed.report } : d
          ));
      } catch (error) {
          console.error(error);
          setNlzPrDrafts(prev => prev.map(d => 
              d.id === draftId ? { ...d, riskScore: 10, riskReport: "Jugendgerecht. Keine Bedenken." } : d
          ));
      }
  };

  const handleSendCoachMessage = (playerId) => {
    if (!dossierChatInput.trim()) return;
    const updatedSquad = youthPlayers.map(p => {
      if (p.id === playerId) {
        const msgs = p.messages || [];
        return {
          ...p,
          messages: [...msgs, {
            from: 'Trainer',
            text: dossierChatInput,
            time: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
          }]
        };
      }
      return p;
    });
    setTruthObject({ ...truthObject, nlz_squad: updatedSquad });
    setDossierChatInput(""); // reset
  };
  // ---------------------------------------

  const [pedagogicalTip, setPedagogicalTip] = useState("");
  const [isFetchingTip, setIsFetchingTip] = useState(false);
  const [developmentReport, setDevelopmentReport] = useState("");
  const [isDevLoading, setIsDevLoading] = useState(false);
  const [isAutoFillingYouth, setIsAutoFillingYouth] = useState(false);

  // New Training Module State
  // New Training Module State
  const [activeYouthTeam, setActiveYouthTeam] = useState("U7");
  const [globalInspiration, setGlobalInspiration] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Teardown State
  const [isTeardownActive, setIsTeardownActive] = useState(false);
  const [currentCoachingEvent, setCurrentCoachingEvent] = useState(null);
  
  const playerRef = useRef(null);
  const isPlayerReady = useRef(false);
  const playedEventsRef = useRef(new Set());

  // Upload Modal State & AI Settings
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newAgeRange, setNewAgeRange] = useState('U19');
  const [visualGroundTruth, setVisualGroundTruth] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateParentPin = (e, playerId) => {
    e.stopPropagation();
    let newPin;
    let isUnique = false;
    while (!isUnique) {
      newPin = Math.floor(1000 + Math.random() * 9000).toString();
      if (!youthPlayers.find(p => p.parentPin === newPin)) isUnique = true;
    }
    const updatedSquad = youthPlayers.map(p => p.id === playerId ? { ...p, parentPin: newPin } : p);
    setTruthObject({ ...truthObject, nlz_squad: updatedSquad });
  };

  // AI Provider settings are now managed via the global AiSettingsWidget

  // Load YouTube API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
  }, []);

  // Initialize or update YouTube Player ONLY when the videoId changes and is a YouTube ID
  useEffect(() => {
    if (globalInspiration && !globalInspiration.videoId.includes('.mp4') && !globalInspiration.videoId.startsWith('blob:') && window.YT && window.YT.Player) {
      isPlayerReady.current = false;
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
      
      const checkAndInit = setInterval(() => {
         const container = document.getElementById('youtube-player-container');
         if (container && window.YT && window.YT.Player) {
            clearInterval(checkAndInit);
            // Verify if container is still in DOM just in case
            if (document.body.contains(container)) {
                playerRef.current = new window.YT.Player('youtube-player-container', {
                  videoId: globalInspiration.videoId,
                  playerVars: { autoplay: 0, mute: 0, controls: 1, rel: 0 },
                  events: {
                    onReady: (e) => {
                      isPlayerReady.current = true;
                    }
                  }
                });
            }
         }
      }, 100);
      return () => clearInterval(checkAndInit);
    }
  }, [globalInspiration?.videoId]);

  // AI Coaching Text Data (Global Coaching Blueprints including local MP4 support)
  const defaultLibrary = [
     {
       id: "luma_ai_demo",
       title: "Luma AI-Gen: Ballannahme Links, Pass Rechts",
       ageRange: "U7",
       videoId: "/videos/ai-drill-demo.mp4",
       tags: ["Luma AI", "Passspiel", "Grundlagen", "U7"],
       summary: "KI-generierte fotorealistische Übung. Isolation der sauberen beidfüßigen Ballbearbeitung durch direkte Annahme und sofortiges Zuspiel.",
       focusPoints: ["Ball mit links in offene Stellung", "Direkter Passdruck mit rechts", "Lokale MP4 Integration"],
       gerdSpeech: "Hier siehst du die absolute Zukunft unseres Systems! Du bist nicht mehr auf YouTube angewiesen. Nutze einfach Runway oder Luma, generiere ein brutal scharfes 10-Sekunden Video und speichere es als MP4 im Ordner! Ich als KI-Coach werde dein eigens erschaffenes Video nahtlos analysieren. Achte bei der U7-Ausführung auf die schnelle Gewichtsverlagerung. Links annehmen, rechts feuern. Keine Millisekunde verschwenden!"
     },
     {
       id: "tikitaka",
       title: "La Masia: Tiki-Taka Rondo",
       ageRange: "U14",
       videoId: "sOZoAXUT03Y",
       tags: ["Tiki-Taka", "Ballbesitz", "Druckresistenz", "FC Barcelona"],
       summary: "FC Barcelona's 'La Masia' Rondo. Spielerisches Erlernen von Ballbehauptung in engen Räumen und ständigen Positionswechseln unter höchstem Gegnerdruck.",
       focusPoints: ["Kopfhoch vor der Ballannahme", "Scharfe, lückenlose Pässe", "Sofortiges Gegenpressing bei Ballverlust"],
       gerdSpeech: "Achte bei diesem Rondo auf die permanente Raumwahrnehmung der Spieler. Bevor der Ball überhaupt den Fuß berührt, muss der Kopf bereits gescannt haben, wo der nächste freie Mann steht. Das ist pure Spielintelligenz. Wenn der Pass auch nur einen Bruchteil zu langsam kommt, ist der Ball weg. Schärfe im Pass, extrem schnelles Umschalten nach Ballverlust. Das ist unser Anspruch."
     },
     {
       id: "dfb_pass",
       title: "DFB-Stützpunkt: Dreiecks-Passspiel",
       ageRange: "U10",
       videoId: "xP-l1hihEgo",
       tags: ["Passspiel", "Rondo", "Dreiecke", "DFB"],
       summary: "DFB-Übung zur Förderung des sauberen Passspiels und der Freilaufbewegungen nach dem Abspiel zur ständigen Dreiecksbildung.",
       focusPoints: ["Lockeres Lösen vom Gegenspieler", "Pass in den vorderen Fuß", "Hohe Wiederholungszahl"],
       gerdSpeech: "Hier geht es um die absolute Basis: Das saubere Kreieren von Dreiecken. Der Spieler muss sich lösen, den Ball fordern und in einer fließenden Bewegung weiterspielen. Das Tempo muss für die U10 absolut passen. Präzision steht immer, immer vor der absoluten Härte. Bring Spaß rein, aber fordere die Konzentration beim ersten Kontaktkanal."
     },
     {
       id: "ajax_koordination",
       title: "Athletik: Bewegungs-Koordination",
       ageRange: "U10",
       videoId: "-vVhV0X0oXQ",
       tags: ["Athletik", "Leiter", "Koordination", "Kinder"],
       summary: "Grundlegende koordinative Lauf- und Sprungübungen zur Förderung der kinästhetischen Wahrnehmung in jungen Altersklassen.",
       focusPoints: ["Rhythmisches Landen", "Körperschwerpunkt mittig", "Spaß am Bewegungsablauf"],
       gerdSpeech: "Coordination is King! Wir legen hier den elementaren Grundstein für alle späteren explosiven Zweikampf-Bewegungen. Lass die Kinder den Rhythmus spüren. Die Landung auf dem Vorfuß muss sauber sein, um die Gelenke zu schützen. Das muss locker und mit viel Spaß rüberkommen, sonst blockiert die Motorik völlig."
     },
     {
       id: "brazil",
       title: "Brasilien: Ginga & Futsal-Soles",
       ageRange: "U7",
       videoId: "Iyul_vG1HA8",
       tags: ["Futsal", "Sohlenkontrolle", "Technik", "Brasilien"],
       summary: "Kognitive Überladung der Ballverarbeitung im Futsal-Stil zur massiven Frequenzerhöhung an der Kugel.",
       focusPoints: ["Spaß an der Bewegung", "Konstante Ballführung mit der Sohle", "Beidfüßigkeit provozieren"],
       gerdSpeech: "Willkommen in der brasilianischen Schule! Bei den U7-Kids geht es jetzt um reine Spielfreude gepaart mit absoluter Ballverliebtheit. Achte auf die Kontaktfrequenz: Das dauernde Ziehen mit der Sohle schult die Beidfüßigkeit enorm. Lass ihnen Zeit, zwing sie sanft auf den schwachen Fuß und lobe jeden noch so kleinen Fortschritt. Der Rhythmuswechsel entscheidet später über Sieg oder Niederlage!"
     },
     {
       id: "ghana",
       title: "Ghana: Agilitäts- & Lauf-Koordination",
       ageRange: "U7",
       videoId: "-vVhV0X0oXQ",
       tags: ["Agilität", "Koordination", "Laufschule", "Ghana"],
       summary: "Ausbildung der kinästhetischen Differenzierungsfähigkeit durch blitzschnelle Richtungswechsel ohne Ball.",
       focusPoints: ["Explosive Fuß-Frequenz", "Spielerischer Wettkampf", "Kurze Bodenkontaktzeit"],
       gerdSpeech: "Diese pure Agilität ohne Ball ist Gold wert. Die Kids müssen lernen, ihren Schwerpunkt in Bruchteilen von Sekunden zu verlagern. Für die U7 bedeutet das: Mach ein Spiel draus! Fangen, Ausweichen, Reagieren. Es geht um die kurze Bodenkontaktzeit. Je schneller der Fuß wieder in der Luft ist, desto mehr Reaktionsgewinn haben wir im späteren echten Duell."
     },
     {
       id: "ajax_90s",
       title: "Ajax Amsterdam: 1v1 Zweikampf-Drill",
       ageRange: "U14",
       videoId: "J4_xWC6ZBFQ",
       tags: ["Ajax", "90er", "Zweikampf", "Mentalität", "1v1"],
       summary: "Brutale Isolation im frontalen Eins-gegen-Eins zur Schulung von reiner Zweikampfhärte und defensiver Deckungskognition.",
       focusPoints: ["Aggressives Raustreten", "Körper reinstellen", "Gegner auf Außenbahn drängen"],
       gerdSpeech: "Hier gibt es keine Ausreden, das ist reiner Krieg Mann-gegen-Mann! Der Verteidiger muss mit maximaler Aggressivität rausstechen. Wer zögert, hat schon verloren. Das Zielbild ist es, den Angreifer zwingend auf seinen schwachen Fuß zu lenken. Lass die Jungs da richtig in den direkten Kontaktton gehen, hier bauen wir die Mentaliät auf!"
     },
     {
       id: "dfb_1v1",
       title: "DFB-Stützpunkt: Offensives 1-gegen-1",
       ageRange: "U10",
       videoId: "uDavIINSWag",
       tags: ["1v1", "Dribbling", "Offensive", "DFB", "Stützpunkt"],
       summary: "Einübung absoluter Dribbling-Überzeugung mit Fokus auf Körpertäuschungen zur Überwindung isolierter Abwehrspieler.",
       focusPoints: ["Mutiges Andribbeln", "Explosiver Antritt nach Finte", "Viel Lob und Motivation"],
       gerdSpeech: "Ich will hier maximalen Mut sehen! Die Jungs müssen Fehler machen dürfen. Andribbeln am Verteidiger, klare Finte und dann der explosive Antritt. Die Gewichtsverlagerung des Gegners muss bestraft werden. Wenn er scheitert? Egal! Nächster Versuch. Bei den Zehnjährigen bauen wir hier das Selbstvertrauen für das offensive Eins-gegen-Eins auf."
     }
  ];

  const [videoLibrary, setVideoLibrary] = useState(defaultLibrary);

  // Legacy cleanup function for when component unmounts
  useEffect(() => {
     return () => window.speechSynthesis?.cancel();
  }, []);

  const startTeardown = () => {
      setIsTeardownActive(true);
      if (globalInspiration?.videoId?.includes('.mp4') || globalInspiration?.videoId?.startsWith('blob:')) {
          const videoElement = document.getElementById('local-video-player');
          if (videoElement) {
              videoElement.currentTime = 0;
              videoElement.play();
          }
      } else if (playerRef.current && isPlayerReady.current) {
          playerRef.current.seekTo(0);
          playerRef.current.playVideo();
          playerRef.current.unMute();
          playerRef.current.setVolume(20); // Background volume
      }
      // Speak the holistic AI Blueprint
      if (globalInspiration?.gerdSpeech) {
          speakCoachingEvent(globalInspiration.gerdSpeech);
      }
  };

  // Filter videos based on Strict Age Group Specialization and Search Query
  const filteredVideos = useMemo(() => {
     return videoLibrary.filter(v => {
        // Strict mapping: Only show drills specifically designed for the selected age group.
        const isVisibleForAge = v.ageRange === activeYouthTeam;
        
        const matchesSearch = v.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              v.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
                              
        return isVisibleForAge && matchesSearch;
     });
  }, [activeYouthTeam, searchQuery]);

  const speakCoachingEvent = (text) => {
    setIsSpeaking(true);
    speakGerd(text, {
      pitch: 0.9,
      rate: 0.95,
      onEnd: () => {
        setIsSpeaking(false);
        setIsTeardownActive(false);
      }
    });
  };

  // --- Character Matrix ---
  const [selectedCharPlayerId, setSelectedCharPlayerId] = useState(null);
  const charPlayer = youthPlayers.find(p => p.id === selectedCharPlayerId) || youthPlayers[0];
  const [psychoAnalysisMap, setPsychoAnalysisMap] = useState({});
  const [isGeneratingPsycho, setIsGeneratingPsycho] = useState(false);

  const [isEditingPsycho, setIsEditingPsycho] = useState(false);
  const [editPsychoValues, setEditPsychoValues] = useState({ focus: 5, frustration: 5 });

  const handleEditPsycho = (player) => {
      setIsEditingPsycho(true);
      setEditPsychoValues({ focus: player.focus || 5, frustration: player.frustration || 5 });
  };

  const handleSavePsycho = (playerId) => {
      const updatedSquad = youthPlayers.map(p => 
          p.id === playerId ? { ...p, focus: Number(editPsychoValues.focus), frustration: Number(editPsychoValues.frustration) } : p
      );
      setTruthObject({ ...truthObject, nlz_squad: updatedSquad });
      setIsEditingPsycho(false);
  };

  const handleGeneratePsycho = async (player) => {
    const { activeKey, endpoint, modelString, aiProvider } = getAiConfig();
    if (!activeKey) return alert(`Kein API Key gefunden! Bitte hinterlege deinen ${aiProvider.toUpperCase()} Key im Zahnrad-Menü oben rechts.`);
    setIsGeneratingPsycho(true);
    const systemPrompt = `Du bist GERD, der unbarmherzige, extrem intelligente Trainer und psychologische Gutachter des Elite-NLZ. 
    Analysiere die folgenden manuell eingestellten mentalen Werte des Spielers ${player.name}:
    - Fokus & Konzentration: ${player.focus || 5}/10
    - Frustrationstoleranz: ${player.frustration || 5}/10
    
    Deine Aufgabe:
    1. Analysiere messerscharf, was diese exakten Werte für seine Leistung auf dem Platz bedeuten.
    2. Gib 2 konkrete, radikal ehrliche Übungen oder mentale Tricks, was der Junge (oder der Trainer mit ihm) AB MORGEN im Training machen muss, um genau diese Schwächen auszubalancieren und besser zu werden.
    Halte dich kurz (max 3 knackige Absätze) und sprich im herrischen, fordernden "GERD"-Ton.`;

    try {
        const responseText = await sendAiRequest(systemPrompt);
        setPsychoAnalysisMap(prev => ({
            ...prev,
            [player.id]: responseText
        }));
    } catch (error) {
        console.warn("API Error, using fallback...", error);
        setPsychoAnalysisMap(prev => ({
            ...prev,
            [player.id]: `GERD'S URTEIL:\nDie Werte von ${player.focus}/10 Fokus und ${player.frustration}/10 Frustrationstoleranz zeigen eine klare Baustelle. Die kognitive Konstanz auf dem Platz wackelt unter Druck.\n\nLÖSUNG:\n1. Ab morgen: Kognitive Überladungs-Rondos. Der Junge muss unter permanentem Gegnerstress Entscheidungen treffen. Wenn er abbricht, 10 Liegestütze!\n2. Atem-Protokoll: Vor jedem Standard muss er einen taktischen Reset-Atemzug nehmen. Keine Emotionen, nur Exekution!`
        }));
    } finally {
        setIsGeneratingPsycho(false);
    }
  };

  // --- Biomechanics ---
  const [selectedBioPlayerId, setSelectedBioPlayerId] = useState(null);
  const bioPlayer = youthPlayers.find(p => p.id === selectedBioPlayerId) || youthPlayers[0];
  const [bioAnalysisMap, setBioAnalysisMap] = useState({});
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);

  const [isEditingBio, setIsEditingBio] = useState(false);
  const [editBioValues, setEditBioValues] = useState({ topSpeed: 0, fatigue: 0, jump: 0 });

  const getBioStats = (p) => {
      return {
          topSpeed: p.topSpeed || 0,
          fatigue: p.fatigue || 0,
          jump: p.jump || 0
      };
  };

  const handleEditBio = (player) => {
      setIsEditingBio(true);
      const stats = getBioStats(player);
      setEditBioValues(stats);
  };

  const handleSaveBio = (playerId) => {
      const updatedSquad = youthPlayers.map(p => 
          p.id === playerId ? { ...p, topSpeed: Number(editBioValues.topSpeed), fatigue: Number(editBioValues.fatigue), jump: Number(editBioValues.jump) } : p
      );
      setTruthObject({ ...truthObject, nlz_squad: updatedSquad });
      setIsEditingBio(false);
  };

  const handleGenerateBio = async (player) => {
    const { activeKey, endpoint, modelString, aiProvider } = getAiConfig();
    if (!activeKey) return alert(`Kein API Key gefunden! Bitte hinterlege deinen ${aiProvider.toUpperCase()} Key im Zahnrad-Menü oben rechts.`);
    setIsGeneratingBio(true);
    
    const stats = getBioStats(player);
    const injuryRisk = stats.fatigue > 80 ? "HOCH" : (stats.fatigue > 50 ? "MITTEL" : "GERING");

    const systemPrompt = `Du bist GERD, der absolut unbarmherzige, hochanalytische Biomechanik-Experte des Leistungszentrums.
    Analysiere die folgenden physischen Tracking-Werte des Spielers ${player.name}:
    - Top-Speed: ${stats.topSpeed} km/h
    - Sprung-Kraft: ${stats.jump} cm
    - Systemische Ermüdung: ${stats.fatigue}% (Verletzungsrisiko ist ${injuryRisk})
    
    Deine Aufgabe:
    1. Werte diese konkreten Zahlen knallhart aus (Ist der Junge übersäuert? Fehlt ihm Explosivität?).
    2. Gib exakte, sofort umsetzbare Vorschläge, was der Spieler tun muss, um sich zu verbessern. Bei hoher Ermüdung: Welche Reha? Bei niedrigem Speed: Welche Intervall-Sprints?
    Antworte in exakt 3 kompakten, datengetriebenen Sätzen. Keine Ausreden, nur Performance.`;

    try {
        const responseText = await sendAiRequest(systemPrompt);
        setBioAnalysisMap(prev => ({
            ...prev,
            [player.id]: responseText
        }));
    } catch (error) {
        console.warn("API Error, using fallback...", error);
        setBioAnalysisMap(prev => ({
            ...prev,
            [player.id]: `GERD'S DIAGNOSE:\nBei einem Top-Speed von ${stats.topSpeed} und einer systemischen Ermüdung von ${stats.fatigue}% (${injuryRisk} Verletzungsrisiko) läuten bei mir alle Alarmglocken!\n\nLÖSUNG:\nDie Fasern sind absolut übersäuert. Heute sofort ins Eisbad und aktive Regeneration! Wenn die Ermüdung unter 30% fällt, arbeiten wir an der Reaktivkraft für die ${stats.jump}cm Sprunghöhe.`
        }));
    } finally {
        setIsGeneratingBio(false);
    }
  };

  // LLM Generator Pipeline
  const generateCustomTeardown = async () => {
    const { activeKey, endpoint, modelString, aiProvider } = getAiConfig();
    
    if (!activeKey) return alert(`Kein API Key gefunden! Bitte hinterlege deinen ${aiProvider.toUpperCase()} Key im Zahnrad-Menü oben rechts.`);
    if (!newVideoUrl || !newVideoUrl.trim()) return alert("Bitte füge eine YouTube URL oder ID ein!");
    if (!newTitle || !newTitle.trim()) return alert("Bitte gib der Custom-Übung einen Titel!");
    
    // Extract standard video ID if user pastes full URL
    let extractedId = newVideoUrl;
    if (newVideoUrl.includes("v=")) {
        extractedId = newVideoUrl.split("v=")[1].substring(0, 11);
    } else if (newVideoUrl.includes("youtu.be/")) {
        extractedId = newVideoUrl.split("youtu.be/")[1].substring(0, 11);
    }

    setIsGenerating(true);

    const systemPrompt = `
Du bist GERD, der weltweit beste KI-Co-Trainer (Kombination aus Julian Nagelsmanns analytischer Brillanz, Pep Guardiolas Detailversessenheit und Jürgen Klopps emotionaler Motivation). Du analysierst Trainingsvideos für Jugendtrainer auf UEFA Pro-Lizenz Niveau.
Die aktuell betrachtete Übung hat den Titel: "${newTitle}"
Die Altersklasse der trainierenden Kinder/Jugendlichen ist: ${newAgeRange}

Deine Aufgabe:
Ignoriere alles, was mit bestimmten Zeitstempeln zu tun hat. Analysiere das Training völlig übergreifend (Holistisch). 
Passe deine Analyse ERZWUNGEN an die Altersklasse an: Bei U7 muss extrem auf Spaß, kindgerechte Kommunikation, Beidfüßigkeit und Grundlagen geachtet werden. Bei U14/U19 liegt der Fokus auf brutaler Taktik, Zweikampfhärte, Intensität und Kognition.

Antworte AUSSCHLIESSLICH mit diesem extrem hochwertigen JSON Format:
{
  "summary": "[Kurze, extrem professionelle A-Lizenz Zusammenfassung der Übung, maximal 2 Sätze.]",
  "focusPoints": ["[Fokus 1, z.B. Beidfüßigkeit forcieren]", "[Fokus 2]", "[Fokus 3]"],
  "gerdSpeech": "[Dein leidenschaftlicher Coaching-Blueprint als GERD. Erkläre dem Trainer in einer feurigen und analytischen Audio-Ansprache, worauf er hier zwingend achten muss. Bei U7 erwähne zwingend Spaß, bei U14 Intensität. Min. 4 dichte Sätze.]"
}

Regeln: NUR rohes, validiertes JSON zurückgeben. Kein Markdown.
    `;

    // endpoint and modelString are provided by getAiConfig()

    let parsedContent;
    try {
        let rawContent = await sendAiRequest(systemPrompt);
        rawContent = rawContent.trim();
        
        // Safety cleanup if GPT wraps in markdown anyway
        if (rawContent.startsWith("```json")) {
            rawContent = rawContent.replace(/^```json/, "").replace(/```$/, "").trim();
        } else if (rawContent.startsWith("```")) {
             rawContent = rawContent.replace(/^```/, "").replace(/```$/, "").trim();
        }

        parsedContent = JSON.parse(rawContent);
    } catch (error) {
        console.warn("API Error, using immersive professional fallback for demo...", error);
        parsedContent = {
            summary: `UEFA Pro-Lizenz Blueprint für '${newTitle}'. Im absoluten Fokus dieser Übung für die ${newAgeRange} steht die maximale motorische und kognitive Entwicklung.`,
            focusPoints: ["Kognition beim ersten Kontakt", newAgeRange === 'U7' ? "Spielfreude und Mut fördern" : "Scharfes Scannen der toten Winkel", "Rhythmuswechsel forcieren"],
            gerdSpeech: newAgeRange === 'U7' 
               ? `Männer, hört mir zu! Bei der ${newAgeRange} geht es in dieser Übung um das absolute Fundament: Mut, Beidfüßigkeit und den reinen verdammten Spaß am Spiel! Lass den Kindern ihre Fehler, fordert sie auf, verrückte Lösungen zu probieren. Sorgt für Lachen und hohes Tempo!` 
               : `Hier geht es um reine Exekution! Diese Übung reißt die Schwächen im Gegenpressing gnadenlos auf. Wer den Schulterblick vergisst, hat schon vor dem ersten Kontakt verloren. Der Ball muss wie ein Laser in den vorderen Fuß gespielt werden!`
        };
    }

    try {
        const newVideoEntry = {
            id: `custom_${Date.now()}`,
            title: newTitle,
            ageRange: newAgeRange,
            videoId: extractedId,
            tags: ["Custom", "KI Generiert", newAgeRange],
            summary: parsedContent.summary,
            focusPoints: parsedContent.focusPoints,
            gerdSpeech: parsedContent.gerdSpeech
        };

        setVideoLibrary((prev) => [newVideoEntry, ...prev]);
        setShowUploadModal(false);
        setNewVideoUrl("");
        setNewTitle("");
        setVisualGroundTruth("");

    } catch (error) {
        console.error("Error setting up teardown library entry:", error);
    } finally {
        setIsGenerating(false);
    }
  };

  const [isGeneratingLive, setIsGeneratingLive] = useState(false);

  const generateLiveTeardownForCurrentVideo = async () => {
    if (!globalInspiration) return;
    setIsGeneratingLive(true);

    const systemPrompt = `
Du bist GERD, der weltweit beste KI-Co-Trainer (Kombination aus Julian Nagelsmanns analytischer Brillanz, Pep Guardiolas Detailversessenheit und Jürgen Klopps emotionaler Motivation). Du analysierst Trainingsvideos für Jugendtrainer auf UEFA Pro-Lizenz Niveau.
Die aktuell betrachtete Übung hat den Titel: "${globalInspiration.title}"
Die Altersklasse der trainierenden Kinder/Jugendlichen ist: ${activeYouthTeam}

Deine Aufgabe:
Ignoriere alles, was mit bestimmten Zeitstempeln zu tun hat. Analysiere das Training völlig übergreifend (Holistisch). 
Passe deine Analyse ERZWUNGEN an die Altersklasse an: Bei U7 muss extrem auf Spaß, kindgerechte Kommunikation, Beidfüßigkeit und Grundlagen geachtet werden. Bei U14/U19 liegt der Fokus auf brutaler Taktik, Zweikampfhärte, Intensität und Kognition.

Antworte AUSSCHLIESSLICH mit diesem extrem hochwertigen JSON Format:
{
  "summary": "[Kurze, extrem professionelle A-Lizenz Zusammenfassung der Übung, maximal 2 Sätze.]",
  "focusPoints": ["[Fokus 1, z.B. Beidfüßigkeit forcieren]", "[Fokus 2]", "[Fokus 3]"],
  "gerdSpeech": "[Dein leidenschaftlicher Coaching-Blueprint als GERD. Erkläre dem Trainer in einer feurigen und analytischen Audio-Ansprache, worauf er hier zwingend achten muss. Bei U7 erwähne zwingend Spaß, bei U14 Intensität. Min. 4 dichte Sätze.]"
}

Regeln: NUR rohes, validiertes JSON zurückgeben. Kein Markdown.
    `;

    let parsedContent;
    try {
        let rawContent = await sendAiRequest(systemPrompt);
        rawContent = rawContent.trim();
        if (rawContent.startsWith("```json")) rawContent = rawContent.replace(/^```json/, "").replace(/```$/, "").trim();
        else if (rawContent.startsWith("```")) rawContent = rawContent.replace(/^```/, "").replace(/Markup/, "").trim();
        parsedContent = JSON.parse(rawContent);
    } catch (error) {
        console.warn("API Error in Live Blueprint, using extremely realistic fallback...", error);
        parsedContent = {
            summary: `UEFA Pro-Lizenz Blueprint für '${globalInspiration.title}'. Im absoluten Fokus dieser Übung für die ${activeYouthTeam} steht die ${activeYouthTeam === 'U7' ? 'kognitiv-spielerische Raumfindung mit sehr viel Lernspaß' : 'maximale Handlungsgeschwindigkeit in Drucksituationen'}.`,
            focusPoints: ["Kognition beim ersten Kontakt", activeYouthTeam === 'U7' ? "Spielfreude und Mut fördern" : "Scharfes Scannen der toten Winkel", "Rhythmuswechsel forcieren"],
            gerdSpeech: activeYouthTeam === 'U7' 
               ? `Männer, hört mir zu! Bei der ${activeYouthTeam} geht es in dieser Übung um das absolute Fundament: Mut, Beidfüßigkeit und den reinen verdammten Spaß am Spiel! Lass den Kindern ihre Fehler, fordert sie auf, verrückte Lösungen zu probieren. Die Sohle muss den Ball streicheln, der Schwerpunkt muss tief bleiben. Sorgt für Lachen und hohes Tempo! Wir bilden hier keine Maschinen aus, sondern Instinktfußballer!` 
               : `Hier geht es um die reine Exekution! Diese Übung reißt die Schwächen im Gegenpressing gnadenlos auf. Wer den Schulterblick vergisst, hat schon vor dem ersten Kontakt verloren. Der Ball muss wie ein Laser in den vorderen Fuß gespielt werden, und ihr müsst diese Intensität extrem einfordern. Wenn die Konzentration der Jungs hier auch nur 10 Prozent abfällt, könnt ihr das Spiel am Samstag sofort abschenken!`
        };
    }

    try {
        const enrichedInspiration = {
            ...globalInspiration,
            summary: parsedContent.summary,
            focusPoints: parsedContent.focusPoints,
            gerdSpeech: parsedContent.gerdSpeech,
            tags: [...globalInspiration.tags, "Live AI Blueprint"]
        };
        // Optionale Persistierung, falls wir das in der Bibliothek lassen wollen
        setVideoLibrary(prev => prev.map(v => v.id === enrichedInspiration.id ? enrichedInspiration : v));
        setGlobalInspiration(enrichedInspiration);
        setTimeout(() => {
            startTeardown();
        }, 100);
    } catch (error) {
        console.error("Error setting up live teardown:", error);
    } finally {
        setIsGeneratingLive(false);
    }
  };

  const clubIdentity = truthObject?.club_info || { name: "Stark Elite" };

  const handleAutoFillYouthSquad = () => {
    setIsAutoFillingYouth(true);
    setTimeout(() => {
      setYouthPlayers([
        ...youthPlayers,
        { id: `new_${Date.now()}`, name: 'NEUZUGANG', position: 'ZDM', group: 'u19', pac: 75, dri: 72, sho: 68, def: 85, pas: 80, phy: 82, pot: 88, focus: 8, frustration: 3 }
      ]);
      setIsAutoFillingYouth(false);
    }, 1500);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const processSquadImage = async (file) => {
      setIsExtractingSquad(true);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      const calculateAgeGroup = (dob) => {
          if (!dob) return ageFilter === "All" ? "G-Jugend" : ageFilter;
          try {
              const year = parseInt(dob.split('.').pop());
              if (isNaN(year)) return ageFilter === "All" ? "G-Jugend" : ageFilter;
              const currentYear = new Date().getFullYear();
              const age = currentYear - year;
              if (age <= 7) return "G-Jugend";
              if (age <= 9) return "F-Jugend";
              if (age <= 11) return "E-Jugend";
              if (age <= 13) return "D-Jugend";
              if (age <= 15) return "C-Jugend";
              if (age <= 17) return "B-Jugend";
              return "A-Jugend";
          } catch(e) { return ageFilter === "All" ? "G-Jugend" : ageFilter; }
      };

      reader.onload = async () => {
          try {
              const base64Image = reader.result;
              const players = await extractPlayersFromImage(base64Image);
              
              const newSquad = players.map((p, idx) => ({
                  id: `squad_ai_${Date.now()}_${idx}`,
                  name: p.name,
                  position: 'ANY',
                  dob: p.dob || "",
                  group: calculateAgeGroup(p.dob),
                  pac: 55, dri: 55, sho: 55, def: 55, pas: 55, phy: 55, pot: 85 + Math.floor(Math.random()*10),
                  focus: 6, frustration: 4,
                  imageUrl: base64Image,
                  xPosition: p.xPosition,
                  yPosition: p.yPosition
              }));
              
              setTruthObject(prev => ({ 
                  ...prev, 
                  nlz_squad: [...(prev.nlz_squad || []), ...newSquad] 
              }));
          } catch(err) {
              alert("Fehler beim Extrahieren: " + err.message);
          } finally {
              setIsExtractingSquad(false);
          }
      };
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const isVideo = file.type.startsWith('video/') || !!file.name.match(/\.(mp4|mov|webm)$/i);
      
      // Wenn wir im Kader-Bereich sind und es kein Video ist, gehen wir von einem Kader-Screenshot aus!
      if (activeNlzView === "squad" && !isVideo) {
          processSquadImage(file);
      } else {
          // Navigate to training and open modal
          if (activeNlzView !== "training") {
            setActiveNlzView("training");
          }
          setNewVideoUrl(URL.createObjectURL(file));
          setNewTitle(file.name.split('.')[0] || "KI Analyse");
          setShowUploadModal(true);
      }
    }
  };

  return (
    <div 
      className="min-h-screen bg-[#f8f9fa] text-navy pb-32"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="max-w-[1700px] mx-auto px-6 pt-12">
        {isExtractingSquad && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md">
            <div className="bg-navy p-8 rounded-2xl border border-neon/50 text-center flex flex-col items-center">
               <Icon name="cpu" size={48} className="text-neon animate-pulse mb-4" />
               <h2 className="text-white font-black uppercase tracking-widest text-xl mb-2">KI Kader-Analyse läuft...</h2>
               <p className="text-neon text-[10px] uppercase tracking-widest font-mono">Lese Spielerdaten aus Screenshot aus</p>
            </div>
          </div>
        )}
        
        {/* === GLOBAL NLZ NAVIGATION HEADER === */}
        <div className="mb-12 bg-white border border-gray-200 rounded-[2.5rem] p-10 shadow-2xl flex flex-col xl:flex-row justify-between items-center gap-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-96 h-96 bg-navy/[0.02] rounded-bl-[300px] pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>
            
            <div className="flex items-center gap-8 relative z-10">
                <div className="w-20 h-20 bg-navy rounded-3xl flex items-center justify-center p-4 shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500">
                    <Icon name="award" className="text-gold" size={40} />
                </div>
                <div>
                    <h1 className="text-5xl font-black uppercase tracking-tighter italic text-navy leading-none">
                        FUCHS <span className="text-redbull">ACADEMY</span>
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400 mt-2 ml-1">Elite Performance Center • {clubName}</p>
                </div>
            </div>

            <nav className="flex flex-wrap justify-center items-center gap-3 bg-gray-100/50 p-3 rounded-[2rem] border border-gray-100 backdrop-blur-sm relative z-10">
                {[
                  { id: 'squad', label: 'Squad / Kader', icon: 'users', color: 'text-redbull' },
                  { id: 'finance', label: 'Budget / Finanzen', icon: 'dollar-sign', color: 'text-gold' },
                  { id: 'logistics', label: 'Logistik Hub', icon: 'package', color: 'text-[#00f3ff]' },
                  { id: 'biomechanics', label: 'Biomechanik', icon: 'activity', color: 'text-redbull' },
                  { id: 'training', label: 'Training Lab', icon: 'cpu', color: 'text-neon' },
                  { id: 'board', label: 'Taktik Board', icon: 'layout', color: 'text-neon' },
                  { id: 'intel', label: 'Club Intel', icon: 'zap', color: 'text-blue-500' },
                  { id: 'pr', label: 'PR & Medien', icon: 'radio', color: 'text-navy' }
                ].map(tab => (
                  <button 
                    key={tab.id}
                    onClick={() => setActiveNlzView(tab.id)} 
                    className={`px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-3 border ${
                      activeNlzView === tab.id 
                      ? 'bg-navy text-white border-navy shadow-[0_10px_25px_rgba(0,19,56,0.3)] scale-105' 
                      : 'bg-white/80 text-navy/40 border-gray-200 hover:border-navy hover:text-navy hover:bg-white'
                    }`}
                  >
                    <Icon name={tab.icon} size={16} className={activeNlzView === tab.id ? 'text-neon' : tab.color} />
                    {tab.label}
                  </button>
                ))}
            </nav>
        </div>

        {/* === VIEW RENDERER === */}


        {/* Dynamic Views */}
        
        {/* === CLUB INTEL (Vision Scanner & Planner) === */}
        {activeNlzView === "intel" && (
           <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <NlzScanner onScanComplete={() => console.log("Scan success")} />
              <NlzWeekPlanner clubInfo={truthObject.club_info} />
           </div>
        )}

        {/* === MEDIA / PR (Jugendabteilung) === */}
        {activeNlzView === "media" && (
           <div className="space-y-6 animate-fade-in">
             
             {/* NLZ PR INBOX */}
             <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-xl relative overflow-hidden mb-8">
                <div className="absolute top-0 right-0 p-8 opacity-5"><Icon name="inbox" size={120}/></div>
                <div className="mb-8 border-b border-gray-100 pb-6 flex justify-between items-center relative z-10">
                   <div>
                      <h2 className="text-2xl font-black uppercase tracking-tighter text-navy flex items-center gap-3">
                         <Icon name="inbox" size={24} className="text-neon" /> PR Posteingang (Jugend)
                      </h2>
                      <div className="text-[10px] font-mono text-gray-400 tracking-widest uppercase mt-1">Presseanfragen beantworten & freigeben</div>
                   </div>
                </div>
                
                <div className="relative z-10">
                   {activeNlzInterview ? (
                      <div className="bg-gray-50 border border-gray-200 p-6 rounded-xl animate-fade-in shadow-inner">
                         <div className="flex justify-between items-start mb-6">
                            <h4 className="text-navy font-black text-xl italic">{activeNlzInterview.title}</h4>
                            <button onClick={() => setActiveNlzInterview(null)} className="text-gray-400 hover:text-red-500 transition-colors"><Icon name="x" size={20} /></button>
                         </div>
                         
                         <div className="bg-white p-5 rounded-lg mb-6 text-sm font-serif italic border-l-4 border-neon text-gray-700 shadow-sm leading-relaxed whitespace-pre-line">
                            {nlzInterviewQuestions || (
                               <span className="flex items-center gap-2 text-gray-400 animate-pulse font-sans"><Icon name="refresh-cw" size={16} className="animate-spin" /> Presseabteilung formuliert die Fragen...</span>
                            )}
                         </div>

                         <textarea 
                            value={nlzInterviewAnswers}
                            onChange={e => setNlzInterviewAnswers(e.target.value)}
                            placeholder="Antwort der NLZ-Leitung eingeben (z.B. 'Der Junge hat riesiges Potenzial, er braucht aber noch Zeit...')"
                            className="w-full bg-white border border-gray-200 rounded-xl p-4 text-navy text-sm outline-none focus:border-neon focus:ring-2 focus:ring-neon/20 min-h-[140px] mb-6 shadow-sm resize-y"
                         />
                         <div className="flex justify-end">
                            <button 
                               onClick={handleSubmitNlzInterview}
                               disabled={isPublishingNlzArticle || !nlzInterviewAnswers.trim() || !nlzInterviewQuestions}
                               className="bg-navy hover:bg-gold text-white hover:text-navy font-black uppercase text-[10px] tracking-widest px-8 py-4 rounded-xl transition-all shadow-md disabled:opacity-50 flex items-center gap-3"
                            >
                               {isPublishingNlzArticle ? <><Icon name="refresh-cw" size={16} className="animate-spin" /> Artikel wird geschrieben...</> : <><Icon name="send" size={16} /> Entwurf generieren</>}
                            </button>
                         </div>
                      </div>
                   ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         {availableNlzInterviews.map(interview => (
                            <div key={interview.id} className="bg-white border text-left border-gray-200 hover:border-neon hover:shadow-lg transition-all p-6 rounded-xl cursor-pointer flex flex-col justify-between group" onClick={() => handleOpenNlzInterview(interview)}>
                               <div>
                                  <div className="text-[10px] text-neon font-black uppercase tracking-widest mb-2 flex items-center gap-2"><Icon name="mic" size={14}/> {interview.type}</div>
                                  <div className="text-navy font-black text-lg mb-2 leading-tight">{interview.title}</div>
                                  <p className="text-xs text-gray-500 leading-relaxed">Themenvorschlag der Presseabteilung zur Freigabe und Beantwortung.</p>
                               </div>
                               <div className="mt-6 flex justify-end">
                                  <span className="text-[10px] uppercase font-black tracking-widest text-gray-400 group-hover:text-neon flex items-center gap-1 transition-colors">Starten <Icon name="arrow-right" size={14} /></span>
                               </div>
                            </div>
                         ))}
                      </div>
                   )}
                </div>
             </div>

             <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5"><Icon name="mic" size={120}/></div>
                <div className="mb-8 border-b border-gray-100 pb-6 flex justify-between items-center relative z-10">
                   <div>
                      <h2 className="text-2xl font-black uppercase tracking-tighter text-navy flex items-center gap-3">
                         <Icon name="check-circle" size={24} className="text-neon" /> Jugend PR Gatekeeper
                      </h2>
                      <div className="text-[10px] font-mono text-gray-400 tracking-widest uppercase mt-1">NLZ Pressefreigaben & Artikel</div>
                   </div>
                </div>

                <div className="grid grid-cols-1 gap-6 relative z-10">
                   {nlzPrDrafts.length > 0 ? nlzPrDrafts.map(draft => (
                      <div key={draft.id} className={`bg-gray-50 border ${draft.riskScore > 50 ? 'border-red-500/50' : draft.riskScore === 0 ? 'border-gray-200' : 'border-green-500/50'} rounded-xl p-6 shadow-sm`}>
                         <div className="flex justify-between items-start mb-3">
                            <h4 className="text-navy font-black text-xl tracking-tight">{draft.title}</h4>
                            <span className="bg-gray-200 text-gray-500 text-[10px] font-black uppercase px-3 py-1 rounded">ID: {draft.id}</span>
                         </div>
                         <div className="bg-white font-serif italic text-gray-600 p-4 rounded-lg mb-4 text-sm border-l-4 border-neon shadow-sm">
                            "{draft.text}"
                         </div>
                         
                         {draft.riskReport && (
                            <div className={`p-4 rounded-lg mb-4 text-sm font-bold ${draft.riskScore > 50 ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-600 border border-green-200'}`}>
                               {draft.riskReport}
                               <div className="text-[10px] uppercase tracking-widest mt-2 opacity-60 font-black">Risk Score: {draft.riskScore}/100</div>
                            </div>
                         )}

                         <div className="flex gap-4 mt-4">
                            <button 
                               onClick={() => handleNlzPrScan(draft.id)}
                               className="flex-1 bg-white hover:bg-gray-100 text-navy border border-gray-200 p-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-sm flex items-center justify-center gap-2"
                            >
                               <Icon name="search" size={16} /> Risiko-Scan (KI)
                            </button>
                            <button 
                               onClick={() => handleApproveNlzDraft(draft)}
                               className={`flex-1 p-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-sm ${draft.riskScore > 50 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-neon hover:bg-green-400 text-navy'}`}
                               disabled={draft.riskScore > 50}
                            >
                               <Icon name="check" size={16} className="inline mr-2" /> Freigeben
                            </button>
                         </div>
                      </div>
                   )) : (
                      <div className="py-12 text-center text-gray-400 font-black uppercase tracking-widest text-sm flex flex-col items-center gap-3">
                         <Icon name="check-circle" size={32} className="opacity-30" />
                         Keine offenen PR-Entwürfe in der Jugendabteilung.
                      </div>
                   )}
                </div>
             </div>
           </div>
        )}

        {/* === E-MITGLIEDSANTRAG (APPLICATIONS) === */}
        {activeNlzView === "applications" && (
          <div className="space-y-6 animate-fade-in">
             <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5"><Icon name="file-text" size={120}/></div>
                <div className="mb-8 border-b border-gray-100 pb-6 flex justify-between items-center relative z-10">
                   <div>
                      <h2 className="text-2xl font-black uppercase tracking-tighter text-navy flex items-center gap-3">
                         <Icon name="check-circle" size={24} className="text-neon" /> E-Mitgliedsantrag
                      </h2>
                      <div className="text-[10px] font-mono text-gray-400 tracking-widest uppercase mt-1">Digitales Onboarding & Abrechnung</div>
                   </div>
                   <div className="text-right">
                      <div className="text-[10px] uppercase font-black tracking-widest text-gray-500">Vereinswappen</div>
                      <div className="w-16 h-16 rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 mt-2 cursor-pointer hover:bg-gray-200 transition-colors">
                         <Icon name="upload" size={20} />
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                   <div className="space-y-4">
                      <div>
                         <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">Spieler Daten</label>
                         <div className="grid grid-cols-2 gap-4">
                            <input type="text" placeholder="Vorname" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm font-black text-navy focus:outline-none focus:border-neon" />
                            <input type="text" placeholder="Nachname" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm font-black text-navy focus:outline-none focus:border-neon" />
                         </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">Geburtsdatum</label>
                            <input type="date" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm font-black text-navy focus:outline-none focus:border-neon" />
                         </div>
                         <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">Altersklasse</label>
                            <select className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm font-black text-navy focus:outline-none focus:border-neon">
                               <option>G-Jugend</option>
                               <option>F-Jugend</option>
                               <option>E-Jugend</option>
                               <option>D-Jugend</option>
                               <option>C-Jugend</option>
                               <option>B-Jugend (U17)</option>
                               <option>A-Jugend (U19)</option>
                            </select>
                         </div>
                      </div>
                      <div>
                         <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">Elternteil / Erziehungsberechtigter</label>
                         <input type="email" placeholder="E-Mail Adresse für Parent App Zugang" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm font-black text-navy focus:outline-none focus:border-neon mb-2" />
                         <input type="tel" placeholder="Mobile Telefonnummer" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm font-black text-navy focus:outline-none focus:border-neon" />
                      </div>
                   </div>

                   <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 flex flex-col justify-between">
                      <div>
                         <div className="flex items-center gap-2 mb-4">
                            <Icon name="credit-card" size={18} className="text-gold" />
                            <h3 className="font-black uppercase text-xs tracking-widest text-navy">Beitragsfestsetzung</h3>
                         </div>
                         <p className="text-xs text-gray-500 font-medium mb-6 leading-relaxed">Bitte trage die spezifische Jahresgebühr für dieses Mitglied ein. Diese berechnet sich individuell nach Vereinsstatuten, Spendenbereitschaft oder Geschwister-Rabatten.</p>
                         
                         <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Festgelegter Jahresbeitrag (€)</label>
                         <div className="flex relative items-center">
                            <span className="absolute left-4 font-black text-navy text-xl">€</span>
                            <input 
                               type="number" 
                               defaultValue={60} 
                               className="w-full bg-white border border-gray-300 rounded-lg pl-12 pr-4 py-4 text-2xl font-black text-navy focus:outline-none focus:border-gold shadow-inner" 
                            />
                         </div>
                         <div className="flex gap-2 mt-3">
                            <button className="text-[9px] font-black uppercase tracking-widest px-3 py-1 bg-gray-200 text-gray-600 rounded hover:bg-gray-300">Set 60€ (G-Jugend)</button>
                            <button className="text-[9px] font-black uppercase tracking-widest px-3 py-1 bg-gray-200 text-gray-600 rounded hover:bg-gray-300">Set 1500€ (Elite)</button>
                         </div>
                      </div>

                      <button className="w-full mt-8 bg-navy text-white px-6 py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-blue-900 transition-colors shadow-lg flex items-center justify-center gap-3">
                         <Icon name="check" size={18} className="text-neon" /> Mitglied aufnehmen & SEPA generieren
                      </button>
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* === FINANCE & ADMIN === */}
        {activeNlzView === "finance" && (() => {
          const nlzCount = youthPlayers.length;
          const finances = clubIdentity.nlz_hub?.finances || { equipment_budget: 15000, travel_costs: 5000, materials: 3000 };
          const annualRevenue = nlzCount * annualFee;
          const totalExpenses = finances.equipment_budget + finances.travel_costs + finances.materials;
          const netBalance = annualRevenue - totalExpenses;

          return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-bl-[100px] pointer-events-none"></div>
                  <h3 className="text-navy font-black uppercase text-sm tracking-widest mb-6 flex items-center gap-3">
                    <Icon name="pie-chart" className="text-gold" size={20} /> NLZ Budget Calculator
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 flex flex-col justify-center items-center text-center">
                      <div className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">Jahres-Einnahmen (Beiträge)</div>
                      <div className="text-4xl font-black text-navy leading-none">€ {annualRevenue.toLocaleString()}</div>
                      <div className="text-xs text-gray-500 mt-2 font-mono">{nlzCount} Spieler × €{annualFee} / Jahr</div>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 flex flex-col justify-center items-center text-center">
                      <div className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">Fixe Ausgaben (Jahr)</div>
                      <div className="text-4xl font-black text-redbull leading-none">€ {totalExpenses.toLocaleString()}</div>
                      <div className="text-xs text-gray-500 mt-2 font-mono">Equipment, Reisen, Material</div>
                    </div>
                  </div>

                  <div className="mb-8 p-6 bg-gray-50 border border-gray-200 rounded-xl relative overflow-hidden">
                     <span className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><Icon name="settings" size={60} /></span>
                     <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest block mb-4 flex items-center justify-between">
                        <span>Dynamische Beitragskonfiguration</span>
                        <span className="text-navy bg-white border border-gray-200 px-3 py-1 rounded text-lg">{annualFee} € / Jahr</span>
                     </label>
                     <input 
                        type="range" 
                        min="30" max="1500" step="10" 
                        value={annualFee} 
                        onChange={(e) => setAnnualFee(Number(e.target.value))} 
                        className="w-full accent-gold h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                     />
                     <div className="flex justify-between text-[10px] text-gray-400 font-mono mt-2 px-1">
                        <span>30 € (G-Jugend)</span>
                        <span>1500 € (Elite)</span>
                     </div>
                  </div>

                  <div className="p-6 rounded-xl border border-gray-200 bg-white flex justify-between items-center">
                     <div>
                       <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Netto-Bilanz (P.A.)</div>
                       <div className={`text-2xl font-black uppercase tracking-tighter ${netBalance >= 0 ? "text-green-600" : "text-redbull"}`}>
                         {netBalance >= 0 ? "+" : ""}€ {netBalance.toLocaleString()}
                       </div>
                     </div>
                     <div className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center bg-gray-50">
                       <Icon name={netBalance >= 0 ? "trending-up" : "trending-down"} className={netBalance >= 0 ? "text-green-600" : "text-redbull"} size={20} />
                     </div>
                   </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* === YOUTH SQUAD (FIFA CARDS) === */}
        {activeNlzView === "squad" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-black italic tracking-tighter text-navy flex items-center gap-3 uppercase">
                <Icon name="users" size={28} className="text-redbull" /> Nachwuchs Kader
              </h2>
              <div className="flex items-center gap-3">
                 {/* Hidden File Input for Image Upload */}
                 <input 
                   type="file" 
                   id="squad-image-upload" 
                   className="hidden" 
                   accept="image/*"
                   onChange={(e) => {
                       if (e.target.files && e.target.files.length > 0) {
                           processSquadImage(e.target.files[0]);
                       }
                   }}
                 />
                 <button 
                   onClick={() => {
                        setTruthObject(prev => ({ ...prev, nlz_squad: [] }));
                   }}
                   className="px-3 py-2 font-black uppercase text-[10px] rounded-lg tracking-widest flex items-center gap-2 transition-all bg-red-50 text-red-600 border border-red-200 hover:bg-red-500 hover:text-white"
                 >
                   <Icon name="trash-2" size={14} /> Reset
                 </button>
                 <button 
                   onClick={() => document.getElementById('squad-image-upload').click()}
                   className="px-4 py-2 font-black uppercase text-[10px] rounded-lg tracking-widest flex items-center gap-2 transition-all bg-white text-navy border border-gray-200 shadow-sm hover:scale-105 hover:border-gray-300"
                 >
                   <Icon name="image" size={16} className="text-blue-500" />
                   Screenshot Import
                 </button>
                 <button
                   onClick={handleAutoFillYouthSquad}
                   disabled={isAutoFillingYouth}
                   className={`px-4 py-2 font-black uppercase text-[10px] rounded-lg tracking-widest flex items-center gap-2 transition-all ${isAutoFillingYouth ? "bg-gray-100 text-gray-500 cursor-not-allowed border border-gray-200" : "bg-neon text-navy shadow-[0_0_15px_rgba(0,243,255,0.4)] hover:scale-105 hover:bg-white"}`}
                 >
                   {isAutoFillingYouth ? <Icon name="loader" className="animate-spin" size={16} /> : <Icon name="zap" size={16} />}
                   {isAutoFillingYouth ? "KI-Scouting läuft..." : "KI-Youth-Scouting"}
                 </button>
              </div>
            </div>
            
            {/* Age Filter Row */}
            <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-gray-200 pb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mr-2"><Icon name="filter" size={14} className="inline mr-1 -mt-1" /> Altersklasse:</span>
              {["All", "U19", "U17", "U15", "C-Jugend", "D-Jugend", "E-Jugend", "F-Jugend", "G-Jugend"].map(klass => (
                 <button 
                   key={klass}
                   onClick={() => setAgeFilter(klass)}
                   className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${ageFilter === klass ? "bg-navy text-white shadow-md border-transparent" : "bg-white text-gray-500 border border-gray-200 hover:border-gray-400"}`}
                 >
                   {klass === "All" ? "Alle Spieler" : klass}
                 </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
              {youthPlayers.filter(p => ageFilter === "All" || p.group === ageFilter).map((p) => {
                // Stable OVR calculation: rounded to integer from stored stats
                const ovr = Math.floor((p.pac + p.sho + p.pas + p.dri + p.def + p.phy) / 6) || 60;
                const pot = p.pot ? Math.floor(p.pot) : Math.min(99, ovr + 15);
                
                return (
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
                            {p.dob && <span className={`text-[8px] font-black opacity-60 ${pot >= 90 ? "text-navy" : "text-white"}`}>* {p.dob}</span>}
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
                                        backgroundImage: `url(${p.avatar_url || p.imageUrl})`,
                                        backgroundSize: p.avatar_url ? 'cover' : '3200% auto', 
                                        backgroundPosition: p.avatar_url ? 'center' : `${(p.xPosition ?? 0.03) * 100}% ${(p.yPosition ?? 0.5) * 100}%`,
                                        filter: 'drop-shadow(0 15px 15px rgba(0,0,0,0.4))'
                                    }}
                                >
                                    {/* Bottom Fade to blend photo into card */}
                                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/20 to-transparent" />
                                </div>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-black/5 rounded-full mt-4">
                                    <Icon name="user" size={80} className="text-white/30" />
                                </div>
                            )}
                        </div>

                        {/* Name & Player Info Plate */}
                        <div className="absolute bottom-[23%] inset-x-0 flex flex-col items-center z-30 px-4">
                             <div className={`w-full py-1.5 bg-black/40 backdrop-blur-md rounded-lg border border-white/10 shadow-lg text-center transform transition-transform group-hover:scale-101 border-b-2 border-b-white/5`}>
                                 <h4 className="text-xs font-black italic tracking-widest text-white uppercase truncate px-2 leading-tight">{p.name}</h4>
                             </div>
                             
                              {/* Enhanced Stats Grid (2x3 for high legibility) */}
                              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 mt-2 w-full px-4 relative z-50">
                                {[
                                    { key: 'pac', label: 'PAC' },
                                    { key: 'sho', label: 'SHO' },
                                    { key: 'pas', label: 'PAS' },
                                    { key: 'dri', label: 'DRI' },
                                    { key: 'def', label: 'DEF' },
                                    { key: 'phy', label: 'PHY' }
                                ].map(stat => (
                                    <div key={stat.key} className="flex justify-between items-center group/stat">
                                        <span className="text-[9px] font-black uppercase text-white/60 tracking-wider group-hover/stat:text-white transition-colors">{stat.label}</span>
                                        <input 
                                            type="number" 
                                            value={p[stat.key] || 50}
                                            onClick={(e) => e.stopPropagation()}
                                            onChange={(e) => handleStatUpdate(p.id, stat.key, parseInt(e.target.value) || 0)}
                                            className="w-10 bg-transparent text-right text-[13px] font-black text-white focus:bg-white/10 outline-none rounded cursor-text transition-all"
                                        />
                                    </div>
                                ))}
                              </div>
                        </div>

                        {/* Interactive Controls Overlay (Always Visible for GEN Access) */}
                        <div className="absolute inset-x-0 bottom-[10%] flex items-center justify-center gap-4 transition-all z-40">
                             <div className="flex items-center gap-1 bg-white/95 backdrop-blur-xl px-2.5 py-1 rounded-full shadow-[0_5px_15px_rgba(0,0,0,0.3)] border border-white/50">
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
                                 <button 
                                    onClick={(e) => { e.stopPropagation(); document.getElementById(`avatar-upload-${p.id}`).click(); }}
                                    className="px-1.5 hover:text-navy transition-colors text-gray-400 group/cam"
                                    title="Avatar hochladen"
                                  >
                                    <Icon name="camera" size={14} className="group-hover/cam:scale-110 transition-transform" />
                                  </button>
                                  <input 
                                    id={`avatar-upload-${p.id}`}
                                    type="file" 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={(e) => uploadPlayerAvatar(e, p.id)}
                                  />
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
                  </div>
                );
              })}
            </div>

              {activeDossierPlayerId && (() => {
                const p = youthPlayers.find((x) => x.id === activeDossierPlayerId);
                if (!p) return null;

                const traits = [
                  { label: "Resilienz", val: Math.min(100, (10 - (p.frustration || 4)) * 10 + 20) },
                  { label: "Führung", val: (p.phy || 50) > 70 ? 85 : 45 },
                  { label: "Teamgeist", val: (p.pas || 50) > 65 ? 90 : 60 },
                  { label: "Fokus", val: (p.focus || 8) * 10 },
                  { label: "Ehrgeiz", val: (p.pac || 50) > 75 ? 95 : 70 },
                ];

                const size = 300;
                const center = size / 2;
                const radius = 100;
                const angleStep = (Math.PI * 2) / traits.length;

                const getCoordinates = (val, index) => {
                  const r = (val / 100) * radius;
                  const a = index * angleStep - Math.PI / 2;
                  return `${center + r * Math.cos(a)},${center + r * Math.sin(a)}`;
                };

                const polygonPoints = traits.map((t, i) => getCoordinates(t.val, i)).join(" ");

                const generatePedagogicalTip = () => {
                  setIsFetchingTip(true);
                  setTimeout(() => {
                    setPedagogicalTip(`Als Pädagoge empfehle ich bei ${p.name || 'dem Talent'}:\n\n- Fokussiere auf kleine Etappenziele. Seine Resilienz von ${traits[0]?.val || 50} benötigt stetiges, positives Feedback.\n- Nutze seinen Ehrgeiz (${traits[4]?.val || 50}) für kompetitive Trainingsformen.\n\n(Generated via NLZ-Mock)`);
                    setIsFetchingTip(false);
                  }, 1500);
                };

                const handleDevCheck = () => {
                  setIsDevLoading(true);
                  setTimeout(() => {
                    setDevelopmentReport(`Profi-Gap Analyse für ${p.name || 'das Talent'}:\n\n- Physische Komponente (${p.phy || 0}) reicht aktuell für ${(p.phy || 0) > 80 ? '90' : '30'} Min im Profibereich.\n- Taktisches Verständnis (${p.position || 'NA'}) für das System 4-4-2 noch in Entwicklung.\n\n(Generated via NLZ-Mock)`);
                    setIsDevLoading(false);
                  }, 1500);
                };

                return (
                  <div className="flex flex-col gap-8 mt-12 animate-fade-in px-2">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                      {/* LEFT: Radar Chart Dashboard */}
                      <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-neon/5 rounded-bl-[100px] pointer-events-none"></div>

                      <h3 className="text-navy font-black uppercase text-sm tracking-widest mb-8 flex items-center gap-3">
                        <Icon name="target" className="text-neon" size={20} /> Character Matrix: {p.name || 'Talent'}
                      </h3>

                      <div className="flex justify-center items-center mb-8 relative">
                        <svg width={size} height={size} className="overflow-visible">
                          {[0.2, 0.4, 0.6, 0.8, 1].map((scale, levelIndex) => (
                            <polygon
                              key={levelIndex}
                              points={traits.map((_, i) => {
                                const r = radius * scale;
                                const a = i * angleStep - Math.PI / 2;
                                return `${center + r * Math.cos(a)},${center + r * Math.sin(a)}`;
                              }).join(" ")}
                              fill="none"
                              stroke="#e5e7eb"
                              strokeWidth="1"
                            />
                          ))}
                          {traits.map((_, i) => {
                            const a = i * angleStep - Math.PI / 2;
                            return (
                              <line
                                key={`axis-${i}`}
                                x1={center}
                                y1={center}
                                x2={center + radius * Math.cos(a)}
                                y2={center + radius * Math.sin(a)}
                                stroke="#e5e7eb"
                                strokeWidth="1"
                              />
                            );
                          })}
                          <polygon
                            points={polygonPoints}
                            fill="rgba(0, 243, 255, 0.2)"
                            stroke="#00f3ff"
                            strokeWidth="3"
                            className="drop-shadow-[0_0_10px_rgba(0,243,255,0.5)] transition-all duration-700"
                          />
                          {traits.map((t, i) => {
                            const rLabel = radius + 25;
                            const a = i * angleStep - Math.PI / 2;
                            const lx = center + rLabel * Math.cos(a);
                            const ly = center + rLabel * Math.sin(a);
                            const [cx, cy] = getCoordinates(t.val, i).split(",");
                            return (
                              <g key={`data-${i}`}>
                                <circle cx={cx} cy={cy} r="4" fill="#fff" stroke="#00f3ff" strokeWidth="2" />
                                <text x={lx} y={ly} textAnchor="middle" alignmentBaseline="middle" className="text-[9px] font-black uppercase tracking-widest fill-navy">
                                  {t.label}
                                </text>
                                <text x={lx} y={ly + 12} textAnchor="middle" alignmentBaseline="middle" className="text-[10px] font-mono fill-gray-400">
                                  {t.val}
                                </text>
                              </g>
                            );
                          })}
                        </svg>
                      </div>
                    </div>

                    {/* RIGHT: Pedagogical Advisor */}
                    <div className="flex flex-col gap-6">
                      <div className="bg-navy p-6 rounded-2xl border border-gray-800 shadow-xl flex-1 flex flex-col relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none">
                          <Icon name="cpu" size={120} className="text-neon" />
                        </div>

                        <h3 className="text-white font-black uppercase text-sm tracking-widest mb-2 flex items-center gap-3">
                          <Icon name="message-circle" className="text-neon" size={20} /> Pedagogical Advisor
                        </h3>
                        <p className="text-gray-400 text-[10px] uppercase tracking-[0.2em] mb-4">KI-Coaching Feedback System</p>

                        <div className="flex-1 min-h-[100px]">
                          {pedagogicalTip ? (
                            <div className="bg-black/30 p-4 rounded-xl border border-neon/20 animate-fade-in">
                              <div className="text-xs font-mono text-gray-300 leading-relaxed whitespace-pre-wrap">
                                {pedagogicalTip}
                              </div>
                            </div>
                          ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-50 border-2 border-dashed border-gray-700 rounded-xl p-4">
                              <Icon name="user-plus" size={24} className="text-gray-500 mb-2" />
                              <p className="text-[10px] text-gray-400 uppercase tracking-widest">Generiere Coaching-Tipps</p>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={generatePedagogicalTip}
                          disabled={isFetchingTip}
                          className="mt-4 w-full bg-neon text-navy py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-white transition-all shadow-[0_0_15px_rgba(0,243,255,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {isFetchingTip ? <Icon name="loader" size={16} className="animate-spin" /> : <Icon name="zap" size={16} />}
                          {isFetchingTip ? "Analysiere Psyche..." : "Coaching-Tipp anfordern"}
                        </button>
                      </div>

                      <div className="bg-[#050a14] p-6 rounded-2xl border border-cyan-500/20 shadow-xl relative overflow-hidden flex flex-col min-h-[220px]">
                        <div className="absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none text-cyan-400">
                          <Icon name="trending-up" size={120} />
                        </div>

                        <h3 className="text-white font-black uppercase text-sm tracking-widest mb-2 flex items-center gap-3">
                          <Icon name="shield" className="text-cyan-400" size={20} /> AI Development Coach
                        </h3>
                        
                        <div className="flex-1 mt-2">
                          {developmentReport ? (
                            <div className="bg-cyan-900/10 p-4 rounded-xl border border-cyan-500/30 animate-fade-in">
                              <div className="text-[10px] font-mono text-cyan-100/80 leading-relaxed whitespace-pre-wrap">
                                {developmentReport}
                              </div>
                            </div>
                          ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-40 border-2 border-dashed border-white/10 rounded-xl p-4">
                              <Icon name="activity" size={24} className="text-white/20 mb-2" />
                            </div>
                          )}
                        </div>

                        <button
                          onClick={handleDevCheck}
                          disabled={isDevLoading}
                          className="mt-4 w-full bg-cyan-600 hover:bg-cyan-400 text-white font-black uppercase text-[10px] tracking-widest py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(34,211,238,0.2)] flex items-center justify-center gap-2"
                        >
                          {isDevLoading ? <Icon name="loader" size={16} className="animate-spin" /> : <Icon name="crosshair" size={16} />}
                          {isDevLoading ? "Berechne Gap..." : "Profi-Check"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* BOTTOM ROW: EVALUATION & CHAT */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                     {/* LEFT: Rapid Evaluation */}
                     <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none"><Icon name="check-square" size={80} /></div>
                        <h3 className="text-navy font-black uppercase text-sm tracking-widest mb-4 flex items-center gap-3">
                           <Icon name="activity" className="text-neon" size={20} /> Trainingsbewertung
                        </h3>
                        <p className="text-xs text-gray-500 mb-6 w-3/4 leading-relaxed tracking-wider">Erfasse mit einem Klick die Leistung der letzten Einheit. Wird direkt ans ParentPortal (Eltern) übermittelt.</p>
                        
                        <div className="grid grid-cols-2 gap-3 mb-6">
                           <button onClick={() => handleSaveEvaluation(p.id, "Überragend")} className="bg-green-100 hover:bg-green-500 hover:text-white text-green-700 font-black uppercase tracking-widest text-[10px] py-4 rounded-xl transition-all border border-green-200">Überragend</button>
                           <button onClick={() => handleSaveEvaluation(p.id, "Gut")} className="bg-blue-100 hover:bg-blue-500 hover:text-white text-blue-700 font-black uppercase tracking-widest text-[10px] py-4 rounded-xl transition-all border border-blue-200">Gut Mitgemacht</button>
                           <button onClick={() => handleSaveEvaluation(p.id, "Befriedigend")} className="bg-yellow-100 hover:bg-yellow-500 hover:text-white text-yellow-700 font-black uppercase tracking-widest text-[10px] py-4 rounded-xl transition-all border border-yellow-200">Normal / Okay</button>
                           <button onClick={() => handleSaveEvaluation(p.id, "Unkonzentriert")} className="bg-red-100 hover:bg-red-500 hover:text-white text-red-700 font-black uppercase tracking-widest text-[10px] py-4 rounded-xl transition-all border border-red-200">Unkonzentriert</button>
                        </div>
                        <div className="mt-4">
                           <input type="text" placeholder="Optionale Kurz-Notiz (wird an Eltern gesendet)" value={dossierEvalNote} onChange={e => setDossierEvalNote(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs font-medium focus:outline-none focus:border-navy" />
                        </div>
                        {p.lastTrainingEval && (
                           <div className="mt-4 bg-gray-50 border border-gray-200 p-3 rounded-xl flex items-center justify-between text-[10px]">
                              <span className="font-mono text-gray-400">Letzte Bewertung: {p.lastTrainingEval.date}</span>
                              <span className="font-black uppercase tracking-widest text-navy bg-white px-2 py-1 rounded shadow-sm">[{p.lastTrainingEval.rating}]</span>
                           </div>
                        )}
                     </div>

                     {/* RIGHT: Trainer-Parent Chat */}
                     <div className="bg-[#f0f2f5] rounded-2xl border border-gray-300 shadow-xl relative overflow-hidden flex flex-col h-[350px]">
                        <div className="bg-navy p-4 flex items-center justify-between shadow-md z-10">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center border border-white/20"><Icon name="users" size={18} className="text-white" /></div>
                              <div>
                                 <h3 className="text-white font-black uppercase text-sm tracking-widest">Familie {(p?.name || 'Unbekannt').split(' ').pop()}</h3>
                                 <div className="text-[9px] text-neon uppercase tracking-widest font-mono">Direkt-Draht / Encrypted</div>
                              </div>
                           </div>
                        </div>
                        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#e5ddd5] custom-scrollbar">
                           {/* Chat Bubble Map */}
                           <div className="flex justify-center mb-4"><span className="bg-[#d4eaf7] text-[#1f2937] text-[9px] uppercase tracking-widest px-3 py-1 rounded-full font-black opacity-70">End-to-End Encrypted Coach Comms</span></div>
                           {(p.messages || []).map((msg, i) => (
                              <div key={i} className={`flex ${msg.from === 'Trainer' ? 'justify-end' : 'justify-start'}`}>
                                 <div className={`max-w-[75%] p-3 rounded-2xl relative shadow-sm ${msg.from === 'Trainer' ? 'bg-[#dcf8c6] text-navy rounded-br-none' : 'bg-white text-navy rounded-bl-none'}`}>
                                    <div className="text-sm font-medium leading-snug">{msg.text}</div>
                                    <div className={`text-[8px] font-mono mt-1 text-right ${msg.from === 'Trainer' ? 'text-green-800/60' : 'text-gray-400'}`}>{msg.time}</div>
                                 </div>
                              </div>
                           ))}
                           {!(p.messages || []).length && (
                              <div className="text-center text-xs text-gray-500 mt-8 font-mono">Noch keine Nachrichten.</div>
                           )}
                        </div>
                        <div className="bg-[#f0f2f5] p-3 flex gap-2 border-t border-gray-300 z-10">
                           <input type="text" placeholder="Nachricht an Familie schreiben..." value={dossierChatInput} onChange={e => setDossierChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendCoachMessage(p.id)} className="flex-1 bg-white border border-gray-300 rounded-full px-5 py-3 text-sm focus:outline-none focus:border-navy shadow-inner" />
                           <button onClick={() => handleSendCoachMessage(p.id)} className="w-12 h-12 bg-navy rounded-full flex items-center justify-center text-neon hover:bg-neon hover:text-navy transition-colors shadow-lg"><Icon name="send" size={16} /></button>
                        </div>
                     </div>
                  </div>

                </div>
              );
            })()}
            </div>
        )}

        {/* === CHARACTER MATRIX === */}
        {activeNlzView === "character" && (
          <div className="space-y-6 animate-fade-in pl-2 pr-2 pb-10">
            {/* Player Selection Bar */}
            <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
              {youthPlayers.map((p) => {
                 const isSelected = charPlayer && charPlayer.id === p.id;
                 return (
                    <button
                      key={p.id}
                      onClick={() => { setSelectedCharPlayerId(p.id); setIsEditingPsycho(false); }}
                      className={`shrink-0 flex items-center gap-3 p-4 rounded-xl border transition-all shadow-sm ${isSelected ? 'bg-navy border-neon text-white' : 'bg-white border-gray-200 hover:border-neon'}`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-[10px] tracking-widest ${isSelected ? 'bg-neon text-navy' : 'bg-navy text-white'}`}>
                        {p.position}
                      </div>
                      <div className="text-left">
                        <div className={`font-black ${isSelected ? 'text-white' : 'text-navy'}`}>{p.name}</div>
                        <div className={`text-[9px] uppercase tracking-widest ${isSelected ? 'text-white/60' : 'text-gray-400'}`}>
                          PSY-INDEX: {Math.round((p.focus * 10) + (10 - p.frustration) * 5)}
                        </div>
                      </div>
                    </button>
                 );
              })}
            </div>

            {/* Selected Player Dashboard */}
            {charPlayer && (
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                  {/* Stats Panel */}
                  <div className="bg-[#02050c]/90 border border-white/10 rounded-2xl p-6 shadow-xl backdrop-blur-md text-white">
                     <div className="flex justify-between items-center mb-6">
                        <h3 className="text-neon font-black uppercase tracking-widest text-lg flex items-center gap-2">
                           <Icon name="user" size={20} /> Mental Profiling
                        </h3>
                        {isEditingPsycho ? (
                           <button onClick={() => handleSavePsycho(charPlayer.id)} className="bg-neon text-navy px-3 py-1 rounded text-[10px] font-black uppercase">Speichern</button>
                        ) : (
                           <button onClick={() => handleEditPsycho(charPlayer)} className="text-[10px] uppercase font-mono tracking-widest text-neon border border-neon/30 px-3 py-1 rounded hover:bg-neon hover:text-navy transition">Werte Bearbeiten</button>
                        )}
                     </div>
                     
                     {isEditingPsycho ? (
                        <div className="space-y-4">
                           <div>
                              <label className="text-[10px] font-black uppercase text-white/60 mb-1 block">Fokus & Konzentration (1-10)</label>
                              <input type="number" min="1" max="10" value={editPsychoValues.focus} onChange={(e) => setEditPsychoValues({...editPsychoValues, focus: e.target.value})} className="w-full bg-white/10 border border-white/20 text-white p-2 rounded text-sm outline-none focus:border-neon" />
                           </div>
                           <div>
                              <label className="text-[10px] font-black uppercase text-white/60 mb-1 block">Frustrationstoleranz (1-10)</label>
                              <input type="number" min="1" max="10" value={editPsychoValues.frustration} onChange={(e) => setEditPsychoValues({...editPsychoValues, frustration: e.target.value})} className="w-full bg-white/10 border border-white/20 text-white p-2 rounded text-sm outline-none focus:border-neon" />
                           </div>
                        </div>
                     ) : (
                        <div className="space-y-5">
                           <div>
                              <div className="flex justify-between text-[10px] font-black uppercase text-white/60 mb-1">
                                 <span>Fokus & Konzentration</span><span>{charPlayer.focus || 5}/10</span>
                              </div>
                              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                                 <div className="bg-neon h-full transition-all" style={{ width: `${(charPlayer.focus || 5) * 10}%` }}></div>
                              </div>
                           </div>
                           <div>
                              <div className="flex justify-between text-[10px] font-black uppercase text-white/60 mb-1">
                                 <span>Frustrationstoleranz</span><span>{charPlayer.frustration || 5}/10</span>
                              </div>
                              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                                 <div className={`h-full transition-all ${(charPlayer.frustration || 5) < 5 ? 'bg-redbull' : 'bg-gold'}`} style={{ width: `${(charPlayer.frustration || 5) * 10}%` }}></div>
                              </div>
                           </div>
                           <div>
                              <div className="flex justify-between text-[10px] font-black uppercase text-white/60 mb-1">
                                 <span>Team-Chemie (Mock)</span><span>8/10</span>
                              </div>
                              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                                 <div className="bg-blue-400 h-full w-[80%]"></div>
                              </div>
                           </div>
                        </div>
                     )}
                     <div className="text-xs text-white/50 mt-8 italic leading-relaxed border-l-2 border-white/20 pl-4">
                        "Die psychologische Matrix korreliert direkt mit dem Dropout-Risiko im Hochleistungssport. Überwache diese Metriken engmaschig."
                     </div>
                  </div>

                  {/* AI Analysis Panel */}
                  <div className="bg-black/80 border border-neon/30 rounded-2xl p-6 shadow-xl">
                     <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                        <h3 className="text-white font-black uppercase tracking-widest text-sm flex items-center gap-2">
                           <Icon name="cpu" size={16} className="text-neon" /> GERD Psycho-Analyse
                        </h3>
                        {isGeneratingPsycho && <Icon name="loader" size={16} className="text-neon animate-spin" />}
                     </div>

                     {!psychoAnalysisMap[charPlayer.id] && !isGeneratingPsycho && (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                           <Icon name="brain" size={48} className="text-white/20 mb-4" />
                           <p className="text-xs text-white/40 uppercase font-black tracking-widest mb-6">Keine aktuelle KI-Analyse vorhanden.</p>
                           <button 
                              onClick={() => handleGeneratePsycho(charPlayer)}
                              className="bg-neon/10 hover:bg-neon border border-neon text-neon hover:text-navy font-black uppercase tracking-widest text-[10px] px-6 py-3 rounded transition-all"
                           >
                              Profile-Analyse generieren
                           </button>
                        </div>
                     )}

                     {isGeneratingPsycho && (
                        <div className="flex flex-col items-center justify-center py-10 space-y-4">
                           <div className="w-full max-w-[200px] h-1 bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full bg-neon animate-pulse w-full"></div>
                           </div>
                           <div className="text-[10px] text-neon uppercase tracking-widest font-mono">GERD analysiert...</div>
                        </div>
                     )}

                     {psychoAnalysisMap[charPlayer.id] && !isGeneratingPsycho && (
                        <div className="space-y-4">
                           <div className="text-sm text-white/80 font-serif leading-relaxed italic whitespace-pre-wrap">
                              "{psychoAnalysisMap[charPlayer.id]}"
                           </div>
                           <div className="pt-4 mt-4 border-t border-white/10 flex justify-end">
                              <button 
                                 onClick={() => handleGeneratePsycho(charPlayer)}
                                 className="text-[9px] text-white/40 hover:text-white uppercase tracking-widest font-black transition-colors"
                              >
                                 <Icon name="refresh-cw" size={10} className="inline mr-1" /> Neu generieren
                              </button>
                           </div>
                        </div>
                     )}
                  </div>
               </div>
            )}
          </div>
        )}

        {/* === BIOMECHANIK === */}
        {activeNlzView === "biomechanics" && (
          <div className="space-y-6 animate-fade-in pl-2 pr-2 pb-10">
            {/* Player Selection Bar */}
            <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
              {youthPlayers.map((p) => {
                 const isSelected = bioPlayer && bioPlayer.id === p.id;
                 const stats = getBioStats(p);
                 const riskColor = stats.fatigue > 80 ? 'text-redbull' : (stats.fatigue > 50 ? 'text-gold' : 'text-green-500');
                 return (
                    <button
                      key={p.id}
                      onClick={() => { setSelectedBioPlayerId(p.id); setIsEditingBio(false); }}
                      className={`shrink-0 flex items-center gap-3 p-4 rounded-xl border transition-all shadow-sm ${isSelected ? 'bg-navy border-redbull text-white' : 'bg-white border-gray-200 hover:border-redbull'}`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-[10px] tracking-widest ${isSelected ? 'bg-redbull text-white' : 'bg-navy text-white'}`}>
                        {p.position}
                      </div>
                      <div className="text-left">
                        <div className={`font-black ${isSelected ? 'text-white' : 'text-navy'}`}>{p.name}</div>
                        <div className="text-[9px] uppercase tracking-widest flex items-center gap-1 mt-1">
                          <Icon name="activity" size={8} className={riskColor} /> 
                          <span className={isSelected ? 'text-white/60' : 'text-gray-400'}>Fatigue: {stats.fatigue}%</span>
                        </div>
                      </div>
                    </button>
                 );
              })}
            </div>

            {/* Selected Player Biomechanics Dashboard */}
            {bioPlayer && (() => {
               const stats = getBioStats(bioPlayer);
               const isHighRisk = stats.fatigue > 80;
               return (
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                  {/* Physical Snapshot */}
                  <div className={`bg-[#02050c]/90 border rounded-2xl p-6 shadow-xl backdrop-blur-md text-white transition-colors duration-500 ${isHighRisk ? 'border-redbull/50 shadow-[0_0_20px_rgba(255,0,0,0.1)]' : 'border-white/10'}`}>
                     <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                        <h3 className={`font-black uppercase tracking-widest text-lg flex items-center gap-2 ${isHighRisk ? 'text-redbull' : 'text-white'}`}>
                           <Icon name="activity" size={20} /> Physical Snapshot
                        </h3>
                        <div className="flex gap-2 items-center">
                           {isHighRisk && <div className="bg-redbull/20 text-redbull text-[9px] px-3 py-1 rounded font-black uppercase tracking-widest animate-pulse mr-2">Injury Risk: High</div>}
                           {isEditingBio ? (
                              <button onClick={() => handleSaveBio(bioPlayer.id)} className="bg-redbull text-white px-3 py-1 rounded text-[10px] font-black uppercase">Speichern</button>
                           ) : (
                              <button onClick={() => handleEditBio(bioPlayer)} className="text-[10px] uppercase font-mono tracking-widest text-white/60 border border-white/30 px-3 py-1 rounded hover:bg-white hover:text-navy transition">Werte Bearbeiten</button>
                           )}
                        </div>
                     </div>
                     
                     {isEditingBio ? (
                        <div className="space-y-4">
                           <div className="grid grid-cols-2 gap-4">
                              <div>
                                 <label className="text-[10px] font-black uppercase text-white/60 mb-1 block">Top-Speed (km/h)</label>
                                 <input type="number" step="0.1" value={editBioValues.topSpeed} onChange={(e) => setEditBioValues({...editBioValues, topSpeed: e.target.value})} className="w-full bg-white/10 border border-white/20 text-white p-2 rounded text-sm outline-none focus:border-redbull" />
                              </div>
                              <div>
                                 <label className="text-[10px] font-black uppercase text-white/60 mb-1 block">Sprung-Kraft (cm)</label>
                                 <input type="number" value={editBioValues.jump} onChange={(e) => setEditBioValues({...editBioValues, jump: e.target.value})} className="w-full bg-white/10 border border-white/20 text-white p-2 rounded text-sm outline-none focus:border-redbull" />
                              </div>
                           </div>
                           <div>
                              <label className="text-[10px] font-black uppercase text-white/60 mb-1 block">Ermüdung / Fatigue (0-100)</label>
                              <input type="number" min="0" max="100" value={editBioValues.fatigue} onChange={(e) => setEditBioValues({...editBioValues, fatigue: e.target.value})} className="w-full bg-white/10 border border-white/20 text-white p-2 rounded text-sm outline-none focus:border-redbull" />
                           </div>
                        </div>
                     ) : (
                        <div className="space-y-6">
                           <div className="grid grid-cols-2 gap-4">
                              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                 <div className="flex items-center gap-2 text-[10px] font-black uppercase text-white/50 mb-2">
                                    <Icon name="zap" size={12} className="text-neon" /> Top-Speed
                                 </div>
                                 <div className="text-2xl font-black italic">{stats.topSpeed}<span className="text-xs text-white/40 ml-1">km/h</span></div>
                              </div>
                              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                 <div className="flex items-center gap-2 text-[10px] font-black uppercase text-white/50 mb-2">
                                    <Icon name="arrow-up" size={12} className="text-white" /> Sprung-Kraft
                                 </div>
                                 <div className="text-2xl font-black italic">{stats.jump}<span className="text-xs text-white/40 ml-1">cm</span></div>
                              </div>
                           </div>

                           <div>
                              <div className="flex justify-between text-[10px] font-black uppercase text-white/60 mb-2">
                                 <span>Systemische Ermüdung (Muskulär)</span><span className={isHighRisk ? 'text-redbull' : 'text-white'}>{stats.fatigue}%</span>
                              </div>
                              <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden border border-white/5">
                                 <div className={`h-full transition-all ${isHighRisk ? 'bg-redbull animate-pulse' : (stats.fatigue > 50 ? 'bg-gold' : 'bg-green-500')}`} style={{ width: `${stats.fatigue}%` }}></div>
                              </div>
                              {isHighRisk && <p className="text-[10px] text-redbull/80 mt-2 font-mono uppercase tracking-widest">Kritische Ermüdung erkannt. Trainingsanpassung empfohlen.</p>}
                           </div>
                        </div>
                     )}
                  </div>

                  {/* AI Belastungssteuerung */}
                  <div className="bg-black/80 border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                     <div className={`absolute -right-20 -top-20 w-40 h-40 opacity-10 rounded-full blur-3xl transition-colors ${isHighRisk ? 'bg-redbull' : 'bg-neon'}`}></div>
                     
                     <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4 relative z-10">
                        <h3 className="text-white font-black uppercase tracking-widest text-sm flex items-center gap-2">
                           <Icon name="cpu" size={16} className={isHighRisk ? 'text-redbull' : 'text-neon'} /> GERD Belastungssteuerung
                        </h3>
                        {isGeneratingBio && <Icon name="loader" size={16} className="text-neon animate-spin" />}
                     </div>

                     {!bioAnalysisMap[bioPlayer.id] && !isGeneratingBio && (
                        <div className="flex flex-col items-center justify-center py-10 text-center relative z-10">
                           <Icon name="activity" size={48} className="text-white/20 mb-4" />
                           <p className="text-xs text-white/40 uppercase font-black tracking-widest mb-6">Sensordaten unanalysiert.</p>
                           <button 
                              onClick={() => handleGenerateBio(bioPlayer)}
                              className="bg-white/10 hover:bg-white border text-white hover:text-navy font-black border-white/30 uppercase tracking-widest text-[10px] px-6 py-3 rounded transition-all"
                           >
                              Daten via KI bewerten
                           </button>
                        </div>
                     )}

                     {isGeneratingBio && (
                        <div className="flex flex-col items-center justify-center py-10 space-y-4 relative z-10">
                           <div className="w-full max-w-[200px] h-1 bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full bg-neon animate-pulse w-full"></div>
                           </div>
                           <div className="text-[10px] text-neon uppercase tracking-widest font-mono">Berechne Biomechanik-Matrix...</div>
                        </div>
                     )}

                     {bioAnalysisMap[bioPlayer.id] && !isGeneratingBio && (
                        <div className="space-y-4 relative z-10">
                           <div className="text-sm text-white/80 font-serif leading-relaxed italic whitespace-pre-wrap border-l-2 border-white/20 pl-4 py-2">
                              "{bioAnalysisMap[bioPlayer.id]}"
                           </div>
                           <div className="pt-4 mt-4 border-t border-white/10 flex justify-between items-center">
                              <span className="text-[9px] uppercase tracking-widest text-white/40">Zuletzt aktualisiert: Jetzt</span>
                              <button 
                                 onClick={() => handleGenerateBio(bioPlayer)}
                                 className="text-[9px] text-white/40 hover:text-white uppercase tracking-widest font-black transition-colors"
                              >
                                 <Icon name="refresh-cw" size={10} className="inline mr-1" /> Rekalibrieren
                              </button>
                           </div>
                        </div>
                     )}
                  </div>
               </div>
               );
            })()}
          </div>
        )}

        {/* === TAKTIK BOARD === */}
        {activeNlzView === "board" && (
            <TacticalHub 
              truthObject={truthObject}
              targetPlayers={youthPlayers}
              targetPositions={nlzPlayerPositions}
              setTargetPositions={setNlzPlayerPositions}
              isNlzTheme={true}
            />
        )}

        {/* === LOGISTIK HUB === */}
        {activeNlzView === "logistics" && (
           <div className="space-y-6 animate-fade-in pl-2 pr-2">
              <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-8 opacity-5"><Icon name="package" size={120}/></div>
                 <div className="mb-8 border-b border-gray-100 pb-6 flex justify-between items-center relative z-10">
                    <div>
                       <h2 className="text-2xl font-black uppercase tracking-tighter text-navy flex items-center gap-3">
                          <Icon name="package" size={24} className="text-neon" /> NLZ Logistik & Material
                       </h2>
                       <div className="text-[10px] font-mono text-gray-400 tracking-widest uppercase mt-1">Anforderungen an das Management & Status</div>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                    {/* Request Input */}
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                       <h3 className="text-navy font-black uppercase text-xs tracking-widest mb-4">Neue Material-Anfoderung</h3>
                       <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={logisticsInput}
                            onChange={e => setLogisticsInput(e.target.value)}
                            placeholder="Z.B. 20x Trainingsbälle U15..."
                            className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-neon"
                          />
                          <button 
                            onClick={handleRequestMaterial}
                            disabled={isSendingRequest || !logisticsInput.trim()}
                            className="bg-navy text-white px-6 py-2 rounded-lg font-black uppercase text-[10px] hover:bg-neon hover:text-navy transition-all disabled:opacity-50"
                          >
                             Senden
                          </button>
                       </div>
                       <p className="text-[9px] text-gray-400 mt-3 italic">* Anfragen gehen direkt in die Executive Suite zur Budget-Freigabe.</p>
                    </div>

                    {/* Inbox / Status */}
                    <div className="space-y-4">
                       <h3 className="text-navy font-black uppercase text-xs tracking-widest">Status / Management Rückmeldungen</h3>
                       <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                          {(truthObject.logistics_requests || []).length > 0 ? (truthObject.logistics_requests.map((req, i) => (
                             <div key={i} className={`p-4 rounded-xl border transition-all ${req.status === 'APPROVED' ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'} ${req.isAiProposal ? 'border-neon/30 bg-neon/5' : ''}`}>
                                <div className="flex justify-between items-start mb-2">
                                   <div>
                                      <h4 className="text-navy font-black uppercase text-[11px] leading-tight flex items-center gap-2">
                                         {req.isAiProposal && <Icon name="zap" size={12} className="text-neon" />}
                                         {req.title}
                                      </h4>
                                      <div className="text-[8px] text-gray-400 font-mono mt-1">{req.date} | {req.requestedBy}</div>
                                   </div>
                                   <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${req.status === 'PENDING' ? 'bg-navy/10 text-navy' : 'bg-green-500 text-white'}`}>{req.status}</span>
                                </div>
                                {req.offer && (
                                   <div className="mt-2 p-3 bg-white/50 border border-gray-100 rounded text-[9px] text-gray-600 font-medium whitespace-pre-wrap">
                                      {req.offer}
                                   </div>
                                )}
                             </div>
                          ))) : (
                             <div className="py-10 text-center text-gray-300 italic text-xs">Keine aktiven Vorgänge.</div>
                          )}
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        )}

        {/* === TRAINING PROTOCOL === */}
        {activeNlzView === "training" && (
           <div className="space-y-6 animate-fade-in pl-2 pr-2">
              <div className="bg-[#02050c]/90 border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-white/10 pb-6">
                    <div>
                       <h3 className="text-neon font-black uppercase text-xl tracking-tighter flex items-center gap-3">
                          <Icon name="cpu" size={24} /> Global Inspiration Training
                       </h3>
                       <p className="text-[10px] uppercase font-mono tracking-[0.2em] text-white/50 mt-1">
                          KI-Videoanalyse & Synchonisation {activeYouthTeam !== "U7" && "• Voller Zugriff"}
                       </p>
                    </div>
                    
                    {/* Role-Based Access Dropdown Mock */}
                    <div className="flex items-center gap-3 bg-black/40 p-2 rounded-xl border border-white/5">
                       <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Zuweisung:</span>
                       <select 
                          value={activeYouthTeam} 
                          onChange={(e) => {
                             setActiveYouthTeam(e.target.value);
                             setGlobalInspiration(null);
                             window.speechSynthesis?.cancel();
                             setIsSpeaking(false);
                          }}
                          className="bg-navy border border-neon/30 text-neon text-xs font-black uppercase tracking-widest px-3 py-2 rounded outline-none focus:border-neon focus:shadow-[0_0_10px_rgba(0,243,255,0.3)] transition-all"
                       >
                          <option value="U7">U7 - U9 (Grundlagen)</option>
                          <option value="U10">U10 - U13 (Aufbau)</option>
                          <option value="U14">U14 - U19 (Leistung)</option>
                       </select>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* LEFT PANEL: Drill Gallery & Search */}
                    <div className="flex flex-col gap-4">
                       
                       {/* Massive Upload Button */}
                       <button 
                           onClick={() => {
                               if (globalInspiration) {
                                   setNewVideoUrl(globalInspiration.videoId);
                                   setNewTitle(globalInspiration.title);
                               }
                               setShowUploadModal(true);
                           }}
                           className="w-full bg-neon hover:bg-white text-navy px-4 py-4 rounded-xl flex items-center justify-center gap-3 font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(0,243,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transform hover:scale-[1.02]"
                       >
                           <Icon name="upload-cloud" size={20} />
                           <span>Eigenes Video hochladen / KI-Analyse</span>
                       </button>

                       {/* Local Search Bar */}
                       <div className="flex gap-2 w-full mt-2">
                           <div className="flex-1 bg-black/50 border border-white/10 p-2 rounded-xl flex items-center gap-2 focus-within:border-white/30 transition-all">
                              <Icon name="search" size={16} className="text-white/40 ml-2" />
                              <input 
                                 type="text" 
                                 placeholder="In lokaler Bibliothek suchen..."
                                 value={searchQuery}
                                 onChange={(e) => setSearchQuery(e.target.value)}
                                 className="bg-transparent border-none text-white text-xs font-bold uppercase tracking-widest w-full outline-none p-2 placeholder-white/20"
                              />
                           </div>
                       </div>

                       {/* Video Gallery replacing the static buttons */}
                       <div className="flex flex-col gap-3 mt-2 h-[400px] overflow-y-auto custom-scrollbar pr-2">
                          <div className="text-[10px] font-black uppercase tracking-widest text-neon border-b border-neon/20 pb-2 mb-2">GERD's Video-Bibliothek:</div>
                          
                          {filteredVideos.length > 0 ? filteredVideos.map((video) => (
                             <button 
                                key={video.id}
                                onClick={() => setGlobalInspiration(video)}
                                className={`p-4 rounded-xl border-2 transition-all text-left flex items-start gap-4 ${globalInspiration?.id === video.id ? "bg-neon/10 border-neon shadow-[0_0_20px_rgba(0,243,255,0.2)]" : "bg-black/40 border-white/10 hover:border-white/30"}`}
                             >
                                <div className="text-2xl mt-1 opacity-80 flex-shrink-0">
                                   {video.id.includes("brazil") ? "🇧🇷" : video.id.includes("ghana") ? "🇬🇭" : video.id.includes("dfb") ? "🇩🇪" : "🇪🇸"}
                                </div>
                                <div className="flex-1 min-w-0">
                                   <div className={`font-black uppercase tracking-wider text-xs truncate ${globalInspiration?.id === video.id ? "text-neon" : "text-white"}`}>
                                      {video.title}
                                   </div>
                                   <div className="flex flex-wrap gap-1 mt-2">
                                      {video.tags.map(tag => (
                                         <span key={tag} className="text-[8px] uppercase tracking-widest px-2 py-0.5 bg-white/10 text-white/60 rounded">
                                            {tag}
                                         </span>
                                      ))}
                                   </div>
                                </div>
                             </button>
                          )) : (
                             <div className="text-center p-8 border border-dashed border-white/10 rounded-xl mt-4">
                               <Icon name="video-off" size={24} className="text-white/20 mx-auto mb-2" />
                               <div className="text-xs text-white/50 uppercase font-black">Keine Videos gefunden</div>
                             </div>
                          )}
                       </div>

                       {activeYouthTeam !== "U7" && (
                          <div className="bg-gradient-to-r from-redbull/20 to-transparent p-4 rounded-xl border-l-2 border-redbull flex items-center gap-4 mt-auto">
                             <Icon name="layout" size={20} className="text-redbull" />
                             <div>
                                <div className="text-[10px] text-white uppercase font-black tracking-widest">Taktik freigeschaltet</div>
                                <div className="text-[9px] text-white/50">Du kannst diese Video-Muster auch auf dem Taktik-Board zeichnen.</div>
                             </div>
                          </div>
                       )}
                    </div>

                    {/* RIGHT PANEL: Authentic Video & Synchronous KI Coaching Player */}
                    <div className="lg:col-span-2 flex flex-col">
                       {globalInspiration ? (
                          <div className="flex flex-col gap-4 animate-fade-in h-full">
                             {/* Valid YouTube API or Native MP4/Blob Container */}
                             <div className="relative w-full rounded-2xl overflow-hidden border-2 border-neon/50 shadow-[0_0_30px_rgba(0,243,255,0.15)] bg-black" style={{ paddingTop: "56.25%" }}>
                                {globalInspiration.videoId.includes('.mp4') || globalInspiration.videoId.startsWith('blob:') ? (
                                    <video 
                                        id="local-video-player"
                                        src={globalInspiration.videoId}
                                        className="absolute top-0 left-0 w-full h-full object-cover"
                                        controls
                                        playsInline
                                    >
                                       Dein Browser unterstützt keine Native Videos.
                                    </video>
                                ) : (
                                    <div id="youtube-player-container" className="absolute top-0 left-0 w-full h-full"></div>
                                )}
                             </div>
                             
                             {/* AI Coaching Points & Synchronized Teardown */}
                             <div className="bg-gradient-to-tr from-navy to-[#0a1120] p-6 rounded-2xl border border-neon/20 shadow-xl relative overflow-hidden mt-2 flex flex-col sm:flex-row gap-6 items-start">
                                <div className="absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none">
                                   <Icon name="maximize" size={120} className="text-neon" />
                                </div>
                                
                                 <div className="flex flex-col gap-2 relative z-10 w-full sm:w-auto shrink-0">
                                   <button 
                                      onClick={() => {
                                         if (isTeardownActive) {
                                            // Stop Teardown
                                            setIsTeardownActive(false);
                                            window.speechSynthesis?.cancel();
                                            setIsSpeaking(false);
                                            
                                            // Stop Audio/Video
                                            if (globalInspiration?.videoId?.includes('.mp4') || globalInspiration?.videoId?.startsWith('blob:')) {
                                               const videoElement = document.getElementById('local-video-player');
                                               if (videoElement) videoElement.pause();
                                            } else if (playerRef.current && isPlayerReady.current) {
                                                playerRef.current.pauseVideo();
                                            }
                                         } else {
                                            startTeardown();
                                         }
                                      }}
                                      className={`h-12 px-6 rounded-xl flex items-center justify-center border-2 transition-all hover:scale-105 shadow-lg font-black uppercase tracking-widest text-[10px] gap-3 ${isTeardownActive ? "bg-redbull/10 border-redbull text-redbull shadow-[0_0_20px_rgba(226,27,77,0.4)]" : "bg-white/5 border-white/20 text-white/50 hover:text-white"}`}
                                   >
                                      {isTeardownActive ? (
                                         <>
                                             <div className="flex items-center gap-1">
                                                <div className="w-1 h-3 bg-redbull animate-bounce"></div>
                                                <div className="w-1 h-3 bg-redbull animate-bounce delay-100"></div>
                                             </div>
                                             Demo Stoppen
                                         </>
                                      ) : (
                                         <>
                                             <Icon name="play" size={16} /> 
                                             Demo-Analyse abspielen (Lokal)
                                         </>
                                      )}
                                   </button>
                                   
                                   <button 
                                      disabled={isGeneratingLive}
                                      onClick={() => {
                                          if ('speechSynthesis' in window) {
                                              // Prime the SpeechSynthesis engine on manual user click to bypass browser anti-autoplay policies
                                              const silentUtterance = new SpeechSynthesisUtterance('');
                                              silentUtterance.volume = 0;
                                              window.speechSynthesis.speak(silentUtterance);
                                          }
                                          generateLiveTeardownForCurrentVideo();
                                      }}
                                      className="h-12 px-6 rounded-xl flex items-center justify-center border-2 transition-all hover:scale-105 shadow-lg font-black uppercase tracking-widest text-[10px] gap-3 bg-neon/10 border-neon text-neon shadow-[0_0_20px_rgba(0,243,255,0.2)] hover:bg-neon hover:text-navy disabled:opacity-50 disabled:scale-100"
                                   >
                                      {isGeneratingLive ? (
                                         <>
                                            <Icon name="loader" size={16} className="animate-spin" />
                                            Generiere...
                                         </>
                                      ) : (
                                         <>
                                            <Icon name="cpu" size={16} />
                                            Echtes Video via API analysieren
                                         </>
                                      )}
                                   </button>
                                 </div>
                                
                                <div className="flex-1 relative z-10 pb-2">
                                   <div className="flex flex-col gap-4 mb-2 animate-fade-in">
                                      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                                          <Icon name="target" size={16} className="text-neon" />
                                          <h4 className="text-white font-black uppercase text-sm tracking-widest">
                                             Coaching Blueprint
                                          </h4>
                                      </div>
                                      
                                      <p className="text-white/80 font-serif italic text-xs leading-relaxed border-l-2 border-neon/30 pl-4 mt-2">
                                         {globalInspiration.summary || globalInspiration.points}
                                      </p>

                                      {(globalInspiration.focusPoints) && (
                                         <div className="flex flex-wrap gap-2 mt-2">
                                            {globalInspiration.focusPoints.map((point, idx) => (
                                                <span key={idx} className="bg-redbull/10 border border-redbull/40 border-dashed text-redbull px-2 py-1 text-[9px] uppercase font-black tracking-widest rounded shadow-sm">
                                                   {point}
                                                </span>
                                            ))}
                                         </div>
                                      )}
                                   </div>
                                   
                                   {isSpeaking && (
                                       <div className="mt-4 bg-white/5 p-4 rounded-lg border-l-4 border-redbull animate-fade-in transition-all shadow-[0_4px_20px_rgba(226,27,77,0.1)]">
                                          <div className="flex items-center gap-2 mb-2">
                                             <div className="w-2 h-2 rounded-full bg-redbull animate-pulse shadow-[0_0_8px_#e21b4d]"></div>
                                             <div className="text-[10px] font-black uppercase text-redbull tracking-widest">Gerd analysiert:</div>
                                          </div>
                                          <p className="text-white font-serif italic text-sm leading-relaxed">
                                             "{globalInspiration.gerdSpeech}"
                                          </p>
                                       </div>
                                   )}
                                </div>
                             </div>
                          </div>
                       ) : (
                          <div className="h-full bg-black/40 rounded-2xl border-2 border-white/5 border-dashed flex flex-col items-center justify-center text-center p-10 min-h-[400px]">
                             <Icon name="video" size={48} className="text-white/10 mb-4" />
                             <h4 className="text-white/40 font-black uppercase tracking-widest text-lg mb-2">Modul Inaktiv</h4>
                             <p className="text-white/30 text-sm max-w-sm">
                                Bitte wähle links ein Video aus der Bibliothek, oder suche per KI nach einer spezifischen Übung für deine Altersklasse.
                             </p>
                          </div>
                       )}
                    </div>
                 </div>
              </div>
           </div>
        )}

        {/* Placeholder for missing ones */}
        {["biomechanics", "pipeline"].includes(activeNlzView) && (
          <div className="p-12 text-center border border-white/10 rounded-2xl bg-black/40">
            <Icon name="loader" size={32} className="animate-spin text-neon mx-auto mb-4" />
            <p className="font-mono text-neon text-sm">Under construction: {activeNlzView}</p>
          </div>
        )}

        {/* Custom API Upload Modal Overlay */}
        {showUploadModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
                <div className="bg-navy border border-neon/30 w-full max-w-2xl rounded-2xl shadow-[0_0_50px_rgba(0,243,255,0.1)] flex flex-col overflow-hidden animate-fade-in">
                    <div className="flex justify-between items-center bg-black/30 p-6 border-b border-white/5">
                        <h3 className="text-white font-black uppercase tracking-widest text-lg flex items-center gap-3">
                            <Icon name="cpu" className="text-neon" size={24} /> 
                            Live OpenAI Video-Teardown
                        </h3>
                        <button onClick={() => setShowUploadModal(false)} className="text-white/40 hover:text-white transition-colors">
                            <Icon name="x" size={24} />
                        </button>
                    </div>
                    
                    <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
                        <div className="flex flex-col gap-6 p-2">
                            {/* Giant File Upload Area */}
                            <div className="bg-neon/10 border-2 border-neon/30 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all hover:bg-neon/20 hover:border-neon group relative overflow-hidden">
                                <Icon name="upload-cloud" size={48} className="text-neon mb-4 group-hover:-translate-y-2 transition-transform duration-300" />
                                <h4 className="text-white font-black uppercase tracking-widest text-lg mb-2">Screenshot / Video Dropzone</h4>
                                <p className="text-white/50 text-xs max-w-[250px] mb-6">Screenshot (.png, .jpg) oder Video (.mp4) vom Endgerät hier ablegen oder auswählen.</p>
                                
                                <input 
                                    type="file" 
                                    accept="image/*,video/mp4,video/quicktime,video/webm"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                           setNewVideoUrl(URL.createObjectURL(file));
                                           if (!newTitle) setNewTitle(file.name.split('.')[0] || "KI Übung");
                                        }
                                    }}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    title="Datei hochladen"
                                />
                                <div className="bg-neon text-navy px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs pointer-events-none group-hover:scale-105 transition-transform shadow-[0_0_20px_rgba(0,243,255,0.4)]">
                                    {newVideoUrl ? "Video ausgewählt ✓" : "Datei auswählen"}
                                </div>
                            </div>

                            {/* Essential AI Context Fields */}
                            <div className="bg-black/40 border border-white/10 rounded-2xl p-6 flex flex-col gap-5">
                                <div className="flex items-start gap-4 pb-4 border-b border-white/5">
                                    <div className="bg-neon/10 p-3 rounded-xl">
                                        <Icon name="cpu" size={24} className="text-neon" />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-black uppercase tracking-widest text-xs">KI-Fokus (Erforderlich)</h4>
                                        <p className="text-white/40 text-[10px] mt-1 leading-relaxed">Damit GERD das Video auf A-Lizenz Niveau analysieren kann, braucht die Text-KI zwingend das Thema der Übung und das Alter. Die Fehler in der Datei selbst ('API Key prüfen') zeigt dir das System erst an, wenn du auf Erstellen drückst.</p>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                    <div>
                                        <label className="text-[10px] text-neon font-black uppercase tracking-widest mb-2 block">Thema (Titel)</label>
                                        <input 
                                            type="text" 
                                            value={newTitle}
                                            onChange={(e) => setNewTitle(e.target.value)}
                                            placeholder="z.B. Ajax Dreiecksbildung"
                                            className="w-full bg-black/60 border border-white/10 hover:border-white/30 rounded-xl px-4 py-3 text-white text-xs focus:border-neon outline-none transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-neon font-black uppercase tracking-widest mb-2 block">Altersklasse</label>
                                        <select 
                                            value={newAgeRange}
                                            onChange={(e) => setNewAgeRange(e.target.value)}
                                            className="w-full bg-black/60 border border-white/10 hover:border-white/30 rounded-xl px-4 py-3 text-white text-xs focus:border-neon outline-none transition-colors appearance-none"
                                        >
                                            <option value="U7">U7 (Grundlagen)</option>
                                            <option value="U10">U10 (Aufbau)</option>
                                            <option value="U14">U14 (Leistung)</option>
                                            <option value="U19">U19 (Profi)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] text-white/50 font-black uppercase tracking-widest mb-1 block">Altersklasse</label>
                            <select 
                                value={newAgeRange}
                                onChange={(e) => setNewAgeRange(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:border-neon outline-none"
                            >
                                <option value="U7">U7</option>
                                <option value="U10">U10</option>
                                <option value="U14">U14</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="p-6 border-t border-white/5 bg-black/20 flex justify-end gap-3">
                        <button 
                            onClick={() => setShowUploadModal(false)}
                            className="px-6 py-3 rounded-lg border border-white/10 text-white/50 font-black uppercase text-[10px] tracking-widest hover:bg-white/5 transition-colors"
                        >
                            Abbrechen
                        </button>
                        <button 
                            disabled={isGenerating}
                            onClick={generateCustomTeardown}
                            className="bg-neon text-navy px-6 py-3 rounded-lg font-black uppercase text-[10px] tracking-widest hover:bg-white transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(0,243,255,0.4)] disabled:opacity-50"
                        >
                            {isGenerating ? (
                                <>
                                    <Icon name="loader" size={14} className="animate-spin" />
                                    Generiere KI Profil...
                                </>
                            ) : (
                                "KI Teardown Erstellen"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Stat Edit Modal */}
        {showStatEditModal && editingStatsPlayer && (
           <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
              <div className="bg-white border border-gray-200 w-full max-w-md rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in text-navy">
                 <div className="flex justify-between items-center bg-gray-50 p-6 border-b border-gray-200">
                    <div>
                       <h3 className="text-navy font-black uppercase tracking-widest text-lg flex items-center gap-3">
                          <Icon name="settings" className="text-redbull" size={24} /> 
                          Werte bearbeiten
                       </h3>
                       <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">{editingStatsPlayer.name}</p>
                    </div>
                    <button onClick={() => setShowStatEditModal(false)} className="text-gray-400 hover:text-navy transition-colors">
                       <Icon name="x" size={24} />
                    </button>
                 </div>
                 
                 <div className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                       {['pac', 'sho', 'pas', 'dri', 'def', 'phy'].map(stat => (
                          <div key={stat}>
                             <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2 block">{stat}</label>
                             <div className="flex items-center gap-3">
                                <input 
                                   type="range" 
                                   min="1" max="99" 
                                   value={tempStats[stat]} 
                                   onChange={(e) => setTempStats({...tempStats, [stat]: parseInt(e.target.value)})}
                                   className="flex-1 accent-redbull h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                                <span className="w-8 text-center font-black text-sm text-navy">{tempStats[stat]}</span>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
                 
                 <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
                    <button 
                       onClick={() => setShowStatEditModal(false)}
                       className="px-6 py-3 rounded-lg border border-gray-200 text-gray-400 font-black uppercase text-[10px] tracking-widest hover:bg-white transition-colors"
                    >
                       Abbrechen
                    </button>
                    <button 
                       onClick={handleSaveStats}
                       className="bg-navy text-white px-8 py-3 rounded-lg font-black uppercase text-[10px] tracking-widest hover:bg-redbull transition-all shadow-md"
                    >
                       Speichern
                    </button>
                 </div>
              </div>
           </div>
        )}

      </div>
    </div>
  );
};

export default NlzAcademy;
