import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import TacticalHub from './components/TacticalHub';
import TrainingLab from './components/TrainingLab';
import StadionKurier from './components/StadionKurier';
import MedicalLab from './components/MedicalLab';
import CfoBoard from './components/CfoBoard';
import NlzAcademy from './components/NlzAcademy';
import LegacyHub from './components/LegacyHub';

const App = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [activeRole, setActiveRole] = useState("Trainer");

  // Global Truth Object (Mock implementation to get the skeleton running)
  const [truthObject, setTruthObject] = useState(() => {
    const saved = localStorage.getItem("gerd_truthObject");
    if (saved) return JSON.parse(saved);
    return {
      club_identity: { name: "Stark Elite", league: "Regionalliga", philosophy: "Ballbesitz & Pressing" },
      financials: { current_budget: 15000000 },
      tactical_setup: { formation_home: "4-4-2", formation_away: "3-4-3" },
      training_lab: { schedule: [], intensity: 80 },
      match_day_manifesto: { strategy: "Offensive Power", intensity_level: 95 }
    };
  });

  useEffect(() => {
    localStorage.setItem("gerd_truthObject", JSON.stringify(truthObject));
  }, [truthObject]);

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <TacticalHub truthObject={truthObject} />;
      case "training_lab":
        return <TrainingLab truthObject={truthObject} />;
      case "stadion-kurier":
        return <StadionKurier truthObject={truthObject} />;
      case "medical":
        return <MedicalLab truthObject={truthObject} />;
      case "cfo":
        return <CfoBoard truthObject={truthObject} />;
      case "nlz":
        return <NlzAcademy truthObject={truthObject} />;
      case "legacy":
        return <LegacyHub />;
      default:
        return <TacticalHub truthObject={truthObject} />;
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
      
      <main className="flex-1 flex flex-col h-full overflow-hidden relative z-10 w-full ml-0 md:ml-20 transition-all duration-300">
        <Header 
          activeTab={activeTab} 
          activeRole={activeRole} 
          setActiveRole={setActiveRole}
        />
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth pb-24 md:pb-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
