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

// ---- MAGIC FILL INITIAL DATA ----
const INITIAL_TRUTH = {
  club_identity: { name: "Stark Elite", league: "Regionalliga", philosophy: "Ballbesitz & Pressing", identity_score: 85 },
  financials: { current_budget: 25000000, active_targets: 3 },
  tactical_setup: { formation_home: "4-4-2", formation_away: "3-4-3" },
  training_lab: { schedule: [], intensity: 80 },
  match_day_manifesto: { strategy: "Offensive Power", intensity_level: 95 },
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
  setup_complete: false
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeRole, setActiveRole] = useState(null);
  const [activeTab, setActiveTab] = useState("home"); // Will auto-route if needed

  // Global Truth Object (Magic Fill Data integration)
  const [truthObject, setTruthObject] = useState(() => {
    localStorage.removeItem("gerd_truthObject"); // Force purge for testing
    return INITIAL_TRUTH;
  });

  const [playbooks, setPlaybooks] = useState([
    {
      id: 1,
      type: "match",
      date: "Heute Abend, 20:30 Uhr",
      title: "Matchday: RB Leipzig vs TSG Hoffenheim",
      opponent: "TSG HOFFENHEIM",
      formation: "4-3-3",
      notes: "Hohes Gegenpressing. Willi Orban als direkter Manndecker gegen Kramaric angesetzt.",
      players: []
    }
  ]);

  useEffect(() => {
    localStorage.setItem("gerd_truthObject", JSON.stringify(truthObject));
  }, [truthObject]);

  const handleLogin = (role) => {
    setActiveRole(role);
    setIsAuthenticated(true);
    
    // Auto-route based on role
    if (role === 'Jugendtrainer') setActiveTab("nlz");
    else if (role === 'Presse') setActiveTab("stadion-kurier");
    else setActiveTab("home"); // Manager and Trainer default to home/management
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setActiveRole(null);
    localStorage.removeItem("gerd_truthObject");
    setTruthObject(INITIAL_TRUTH);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  // INTERCEPT ROUTE: Trainer Setup Wizard
  if (isAuthenticated && activeRole === 'Trainer' && !truthObject.setup_complete) {
    return <TrainerSetupWizard setTruthObject={setTruthObject} onLogout={handleLogout} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <ManagementHub truthObject={truthObject} setActiveTab={setActiveTab} />;
      case "tactical":
        return <TacticalHub truthObject={truthObject} activeRole={activeRole} />;
      case "training_lab":
        return <TrainingLab truthObject={truthObject} activeRole={activeRole} />;
      case "roster":
        return <RosterHub truthObject={truthObject} setTruthObject={setTruthObject} activeRole={activeRole} />;
      case "stadion-kurier":
        return <StadionKurier truthObject={truthObject} activeRole={activeRole} />;
      case "medical":
        return <MedicalLab truthObject={truthObject} activeRole={activeRole} />;
      case "cfo":
        return <CfoBoard truthObject={truthObject} activeRole={activeRole} />;
      case "nlz":
        return <NlzAcademy truthObject={truthObject} activeRole={activeRole} />;
      case "legacy":
        return <LegacyHub />;
      default:
        return <ManagementHub truthObject={truthObject} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden relative font-sans">
      <div id="neural-canvas"></div>
      
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        activeRole={activeRole} 
      />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden relative z-10 w-full ml-0 md:ml-64 transition-all duration-300">
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
              default: return <ManagementHub truthObject={truthObject} setTruthObject={setTruthObject} setActiveTab={setActiveTab} activeRole={activeRole} />;
            }
          })()}
        </div>
      </main>
    </div>
  );
};

export default App;
