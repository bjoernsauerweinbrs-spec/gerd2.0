import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ManagementHub from './components/ManagementHub';
import TacticalHub from './components/TacticalHub';
import TrainingLab from './components/TrainingLab';
import StadionKurier from './components/StadionKurier';
import MedicalLab from './components/MedicalLab';
import CfoBoard from './components/CfoBoard';
import NlzAcademy from './components/NlzAcademy';
import LegacyHub from './components/LegacyHub';
import Login from './components/Login';
import TrainerSetupWizard from './components/TrainerSetupWizard';
import RosterHub from './components/RosterHub';
import CalendarHub from './components/CalendarHub';
import ParentPortal from './components/ParentPortal';

// ---- MAGIC FILL INITIAL DATA ----
const INITIAL_TRUTH = {
  club_identity: { name: "Stark Elite", league: "Regionalliga", philosophy: "Ballbesitz & Pressing", identity_score: 85 },
  financials: { current_budget: 25000000, active_targets: 3 },
  tactical_setup: { formation_home: "4-4-2", formation_away: "3-4-3" },
  training_lab: { 
    schedule: [
      { id: 1, day: "Montag", type: "Regeneration", intensity: 30, time: "10:00 - 11:30", completed: true, hasSim: false },
      { id: 2, day: "Dienstag", type: "Athletik & Kraft", intensity: 85, time: "10:00 - 12:00", completed: true, hasSim: false },
      { id: 3, day: "Mittwoch", type: "Taktik (Defensive)", intensity: 60, time: "14:00 - 16:00", completed: false, hasSim: false },
      { id: 4, day: "Donnerstag", type: "Rondo (5v2)", intensity: 75, time: "10:00 - 12:00", completed: false, hasSim: true, simData: { name: "Rondo (5v2)", type: "rondo", focus: "Passspiel & Pressingresistenz" } },
      { id: 5, day: "Freitag", type: "Abschlusstraining", intensity: 50, time: "15:00 - 16:30", completed: false, hasSim: false },
      { id: 6, day: "Samstag", type: "MATCHDAY (Bundesliga)", intensity: 100, time: "15:30 Anpfiff", completed: false, hasSim: false, isMatchday: true },
      { id: 7, day: "Sonntag", type: "Spielersatz-Training & REHA", intensity: 40, time: "10:00 - 11:30", completed: false, hasSim: false }
    ], 
    intensity: 80 
  },
  match_day_manifesto: { strategy: "Offensive Power", intensity_level: 95 },
  nlz_squad: [
    { id: '1', name: 'WUNDERKIND', position: 'ZOM', group: 'u19', dob: '14.05.2008', pac: 85, dri: 92, sho: 78, def: 40, pas: 88, phy: 65, pot: 95, focus: 8, frustration: 2 },
    { id: '2', name: 'TORMINATOR', position: 'ST', group: 'u17', dob: '03.11.2009', pac: 90, dri: 80, sho: 85, def: 30, pas: 70, phy: 80, pot: 89, focus: 6, frustration: 4 },
    { id: '3', name: 'FELS', position: 'IV', group: 'u19', dob: '22.01.2008', pac: 70, dri: 50, sho: 40, def: 88, pas: 65, phy: 90, pot: 86, focus: 9, frustration: 1 }
  ],
  players: [
    { id: 99, name: "Lukas Berg (C)", position: "IV", ovr: 89, readiness: 94, isInjured: false, pac: 84, sho: 60, pas: 85, dri: 75, def: 92, phy: 90, inSquad: true },
    { id: 1, name: "Muster-TW", position: "GK", ovr: 85, readiness: 95, isInjured: false, pac: 80, sho: 40, pas: 75, dri: 60, def: 85, phy: 80, inSquad: true },
    { id: 2, name: "Muster-IV 1", position: "IV", ovr: 82, readiness: 90, isInjured: false, pac: 75, sho: 50, pas: 70, dri: 65, def: 84, phy: 88, inSquad: true },
    { id: 3, name: "Muster-IV 2", position: "IV", ovr: 84, readiness: 88, isInjured: false, inSquad: true },
    { id: 4, name: "Muster-AV L", position: "LB", ovr: 80, readiness: 92, isInjured: false, inSquad: true },
    { id: 6, name: "Muster-ZM 1", position: "CM", ovr: 86, readiness: 85, isInjured: false, inSquad: true },
    { id: 8, name: "Muster-LM", position: "LM", ovr: 83, readiness: 80, isInjured: false, inSquad: true },
    { id: 10, name: "Muster-ST 1", position: "ST", ovr: 87, readiness: 88, isInjured: false, inSquad: true }
  ],
  youthPlayers: [
    { id: 201, name: "Wunderkind 1", position: "ZOM", status: "Hot Prospect", potential: "A+", inSquad: true, isInjured: false, readiness: 99 },
    { id: 202, name: "Top-Talent 2", position: "ST", status: "Beobachtung", potential: "B+", inSquad: true, isInjured: false, readiness: 80 }
  ],
  playerPositions: { // Default coordinates for Tactical Hub
    "99": { x: 147, y: 460.8 },
    "1": { x: 210, y: 576 },
    "2": { x: 273, y: 460.8 },
    "6": { x: 159.6, y: 320 }
  },
  notifications: [
    { id: 1, type: "system", message: "GERD System hochgefahren. Alle Module aktiv.", read: false }
  ],
  matchday_roster: null,
  latest_interview: null,
  training_handbuch: [],
  setup_complete: false
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeRole, setActiveRole] = useState(null);
  const [activeTab, setActiveTab] = useState("home"); // Will auto-route if needed

  const [truthObject, setTruthObject] = useState(() => {
    const stored = localStorage.getItem("gerd_truthObject");
    return stored ? JSON.parse(stored) : INITIAL_TRUTH;
  });

  const [playbooks, setPlaybooks] = useState([]);

  const [activeChildId, setActiveChildId] = useState(null);

  useEffect(() => {
    localStorage.setItem("gerd_truthObject", JSON.stringify(truthObject));
  }, [truthObject]);

  // Force upgrade legacy names in local storage for a better 2FA mock experience
  useEffect(() => {
    let hasUpdates = false;
    const patchedSquad = truthObject.nlz_squad?.map(p => {
      let newName = p.name;
      if (p.name === 'WUNDERKIND') { newName = 'Lennox WUNDERKIND'; hasUpdates = true; }
      else if (p.name === 'TORMINATOR') { newName = 'Milan TORMINATOR'; hasUpdates = true; }
      else if (p.name === 'FELS') { newName = 'Lukas FELS'; hasUpdates = true; }
      return { ...p, name: newName };
    }) || [];
    
    if (hasUpdates) {
      setTruthObject(prev => ({ ...prev, nlz_squad: patchedSquad }));
    }
  }, []);

  const handleLogin = (role, childId = null) => {
    setActiveRole(role);
    setIsAuthenticated(true);
    if(childId) setActiveChildId(childId);
    
    // HYDRATION: Check for pre-scraped data from Login screen
    const initScraping = localStorage.getItem('gerd_init_scraping');
    if (initScraping) {
       try {
          const data = JSON.parse(initScraping);
          const sanitizedLiveIntel = data.liveIntelligence ? {
             ...data.liveIntelligence,
             lastMatch: data.liveIntelligence.lastMatch?.includes("Suche") ? "Wird aktualisiert..." : data.liveIntelligence.lastMatch,
             nextMatch: data.liveIntelligence.nextMatch?.includes("Suche") ? "Wird ermittelt..." : data.liveIntelligence.nextMatch,
             tacticalNotes: data.liveIntelligence.tacticalNotes?.includes("Suche") ? "KI-Analyse läuft..." : data.liveIntelligence.tacticalNotes,
          } : prev.club_info?.liveIntelligence;

          setTruthObject(prev => ({
             ...prev,
             setup_complete: true, 
             players: data.players && data.players.length > 0 ? data.players : prev.players,
             club_info: {
                ...prev.club_info,
                name: data.officialClubName,
                found_players: data.players?.length || 0,
                liveIntelligence: sanitizedLiveIntel
             },
             manualSetupAdvice: data.manualSetupAdvice
          }));
          localStorage.removeItem('gerd_init_scraping'); // Clean up
       } catch (e) { console.error("Hydration failed", e); }
    }

    // Auto-route based on role
    if (role === 'Jugendtrainer') setActiveTab("nlz");
    else if (role === 'Presse') setActiveTab("stadion-kurier");
    else if (role === 'Eltern') setActiveTab("parent_app");
    else setActiveTab("home"); // Manager and Trainer default to home/management
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setActiveRole(null);
    setActiveChildId(null);
    // Removed truthObject purging to allow persistent PINs and simulation state
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} truthObject={truthObject} />;
  }

  // INTERCEPT ROUTE: Trainer Setup Wizard
  if (isAuthenticated && activeRole === 'Trainer' && !truthObject.setup_complete) {
    return <TrainerSetupWizard setTruthObject={setTruthObject} onLogout={handleLogout} />;
  }

  // Unified renderContent is handled inside the main return block now
  // but keeping it for potential future structural needs if preferred, 
  // however App currently uses the inline switch below.
  // We'll clean this up to avoid confusion.

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden relative font-sans">
      <div id="neural-canvas"></div>
      
      {activeRole !== 'Eltern' && (
         <Sidebar 
           activeTab={activeTab} 
           setActiveTab={setActiveTab} 
           activeRole={activeRole} 
         />
      )}
      
      <main className={`flex-1 flex flex-col h-full overflow-hidden relative z-10 w-full transition-all duration-300 ${activeRole !== 'Eltern' ? 'ml-0 md:ml-64' : 'ml-0'}`}>
          {/* Header will get the logout function so users can switch roles */}
        <Header 
          activeTab={activeTab} 
          activeRole={activeRole} 
          onLogout={handleLogout}
          truthObject={truthObject}
          setTruthObject={setTruthObject}
        />
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth pb-24 md:pb-8">
          {(() => {
            switch (activeTab) {
              case "home": return <ManagementHub truthObject={truthObject} setTruthObject={setTruthObject} setActiveTab={setActiveTab} activeRole={activeRole} />;
              case "tactical": return <TacticalHub truthObject={truthObject} setTruthObject={setTruthObject} activeRole={activeRole} playbooks={playbooks} setPlaybooks={setPlaybooks} />;
              case "roster": return <RosterHub truthObject={truthObject} setTruthObject={setTruthObject} activeRole={activeRole} />;
              case "training_lab": return <TrainingLab truthObject={truthObject} setTruthObject={setTruthObject} activeRole={activeRole} />;
              case "stadion-kurier": return <StadionKurier truthObject={truthObject} setTruthObject={setTruthObject} activeRole={activeRole} />;
              case "medical": return <MedicalLab truthObject={truthObject} setTruthObject={setTruthObject} activeRole={activeRole} />;
              case "cfo": return <CfoBoard truthObject={truthObject} setTruthObject={setTruthObject} activeRole={activeRole} />;
              case "nlz": return <NlzAcademy truthObject={truthObject} setTruthObject={setTruthObject} activeRole={activeRole} />;
              case "legacy": return <LegacyHub />;
              case "calendar": return <CalendarHub playbooks={playbooks} activeRole={activeRole} />;
              case "parent_app": return <ParentPortal truthObject={truthObject} setTruthObject={setTruthObject} activeChildId={activeChildId} />;
              default: return <ManagementHub truthObject={truthObject} setTruthObject={setTruthObject} setActiveTab={setActiveTab} activeRole={activeRole} />;
            }
          })()}
        </div>
      </main>
    </div>
  );
};

export default App;
