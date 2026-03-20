import React, { useState, useEffect } from 'react';
import Icon from './Icon';

const TrainerSetupWizard = ({ setTruthObject, onLogout }) => {
  const [step, setStep] = useState(0); // 0: Club, 1: League, 2: Scraping, 3: Validation
  const [clubName, setClubName] = useState("");
  const [leagueName, setLeagueName] = useState("");
  
  // Scraping logic
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [scrapedData, setScrapedData] = useState(null);

  const handleNext = () => {
    if (step === 0 && clubName.trim()) setStep(1);
    else if (step === 1 && leagueName.trim()) startScraping();
  };

  const startScraping = async () => {
    setStep(2);
    setProgress(20);
    setStatusMessage(`Verbinde mit Transfermarkt.de API für '${clubName}'...`);
    
    try {
        const response = await fetch(`http://localhost:3001/api/scrape?team=${encodeURIComponent(clubName)}`);
        const data = await response.json();
        
        if (data.success && data.players && data.players.length > 0) {
            setProgress(60);
            setStatusMessage(`Scraping erfolgreich. ${data.players.length} Spieler extrahiert. Warte auf Bestätigung...`);
            
            setTimeout(() => {
                setProgress(100);
                setStatusMessage(`Datensatz komplett. Gehe zur Validierung...`);
                setTimeout(() => {
                    setScrapedData(data);
                    setStep(3); // Go to Validation step
                }, 1000);
            }, 1000);
        } else {
            throw new Error(data.error || "Keine Spieler gefunden.");
        }
    } catch (err) {
        setProgress(100);
        setStatusMessage(`Fehler beim Scraping: ${err.message}. Verwende internes Backup-System...`);
        setTimeout(() => {
            setScrapedData({
               officialClubName: clubName,
               players: []
            });
            setStep(3);
        }, 2000);
    }
  };

  const confirmSetup = () => {
    setTruthObject(prev => ({
        ...prev,
        setup_complete: true,
        players: scrapedData.players.length > 0 ? scrapedData.players : prev.players,
        club_info: {
          name: scrapedData.officialClubName || clubName,
          league: leagueName,
          found_players: scrapedData.players.length,
          table_position: 4
        }
    }));
  };

  const retrySetup = () => {
    setStep(0);
    setClubName("");
    setLeagueName("");
    setScrapedData(null);
  };

  return (
    <div className="flex-1 min-h-screen bg-[#070b14] flex flex-col items-center justify-center relative p-4 animate-fade-in overflow-hidden">
      
      <button onClick={onLogout} className="absolute top-6 right-6 text-white/30 hover:text-white flex items-center gap-2">
         <Icon name="x" size={20} /> Abbruch
      </button>

      {/* Background Graphic */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
             <Icon name="globe" size={800} />
         </div>
      </div>

      <div className="max-w-xl w-full relative z-10">
        <div className="flex items-center gap-4 mb-12 border-b border-white/10 pb-6">
          <Icon name="cpu" size={40} className="text-neon animate-pulse" />
          <div>
            <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">GERD <span className="text-neon">Scraper</span></h1>
            <p className="text-[10px] uppercase font-mono tracking-[0.3em] text-white/40">Initial Context Engine</p>
          </div>
        </div>

        {step === 0 && (
          <div className="animate-fade-in">
             <h2 className="text-xl font-bold text-white mb-2">Willkommen, Coach.</h2>
             <p className="text-white/60 text-sm mb-8 font-serif leading-relaxed">
                Bevor wir Trainingspläne zeichnen, werfen wir einen Blick auf die Realität. Von welcher Mannschaft sprechen wir?
             </p>
             <input
               type="text"
               autoFocus
               value={clubName}
               onChange={e => setClubName(e.target.value)}
               onKeyDown={e => e.key === 'Enter' && handleNext()}
               placeholder="Vereinsname (z.B. FC Stark Elite)"
               className="w-full bg-black/50 border border-white/20 focus:border-neon focus:shadow-[0_0_20px_rgba(0,243,255,0.2)] rounded-xl py-4 px-6 text-white font-black text-lg outline-none transition-all mb-6"
             />
             <div className="flex justify-end">
                <button 
                  onClick={handleNext} 
                  disabled={!clubName.trim()}
                  className="bg-neon text-black font-black uppercase text-sm px-8 py-3 rounded-lg shadow-[0_0_20px_rgba(0,243,255,0.4)] disabled:opacity-50 disabled:shadow-none transition-all"
                >
                  Weiter <Icon name="arrow-right" size={16} className="inline ml-2" />
                </button>
             </div>
          </div>
        )}

        {step === 1 && (
          <div className="animate-fade-in">
             <h2 className="text-xl font-bold text-white mb-2">Der Wettbewerb.</h2>
             <p className="text-white/60 text-sm mb-8 font-serif leading-relaxed">
                Wo in der Pyramide befindet sich der '{clubName}' heute?
             </p>
             <input
               type="text"
               autoFocus
               value={leagueName}
               onChange={e => setLeagueName(e.target.value)}
               onKeyDown={e => e.key === 'Enter' && handleNext()}
               placeholder="Liga (z.B. Bezirksliga Staffel 3)"
               className="w-full bg-black/50 border border-white/20 focus:border-neon focus:shadow-[0_0_20px_rgba(0,243,255,0.2)] rounded-xl py-4 px-6 text-white font-black text-lg outline-none transition-all mb-6"
             />
             <div className="flex justify-between items-center">
                <button onClick={() => setStep(0)} className="text-white/40 hover:text-white text-sm font-bold uppercase">Zurück</button>
                <button 
                  onClick={handleNext} 
                  disabled={!leagueName.trim()}
                  className="bg-neon text-black font-black uppercase text-sm px-8 py-3 rounded-lg shadow-[0_0_20px_rgba(0,243,255,0.4)] disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  <Icon name="search" size={16} /> Data-Scraping Starten
                </button>
             </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in text-center p-8 bg-black/40 border border-neon/20 rounded-2xl shadow-[0_0_40px_rgba(0,243,255,0.05)] relative overflow-hidden">
             
             {/* Progress Bar Background */}
             <div className="absolute bottom-0 left-0 h-1 bg-neon transition-all duration-1000 ease-in-out" style={{ width: `${progress}%` }}></div>
             
             <Icon name="cpu" size={64} className="text-neon animate-pulse mx-auto mb-6" />
             
             <h2 className="text-neon font-black text-3xl mb-2 font-mono">{progress}%</h2>
             <p className="font-mono text-sm text-white/80 h-6">
                {statusMessage}
             </p>

             {progress === 100 && (
                <div className="mt-8 flex justify-center animate-bounce">
                    <Icon name="check-circle" size={32} className="text-green-400" />
                </div>
             )}
          </div>
        )}

        {step === 3 && scrapedData && (
          <div className="animate-fade-in text-center p-8 bg-black/40 border border-white/20 rounded-2xl relative overflow-hidden">
             <div className="flex justify-center mb-6">
                <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center border-4 border-white/20 shadow-2xl">
                    <Icon name="shield" size={40} className="text-white" />
                </div>
             </div>
             
             <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Kader-Check</h2>
             <p className="text-white/60 text-sm mb-6 leading-relaxed">
                Ich habe die Datenbanken gescannt und diesen Verein extrahiert:
             </p>
             
             <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8 inline-block text-left w-full max-w-sm">
                <div className="text-[10px] uppercase tracking-widest text-gold mb-1 font-black">Offizieller Name</div>
                <div className="text-xl font-bold text-white mb-4">{scrapedData.officialClubName}</div>
                
                <div className="text-[10px] uppercase tracking-widest text-neon mb-1 font-black">Entdeckte Profile</div>
                <div className="text-lg font-mono text-white/80 mb-4">{scrapedData.players.length} aktive Spieler</div>

                <div className="text-[10px] uppercase tracking-widest text-white/40 mb-2 border-b border-white/10 pb-1">Identifizierte Spieler (Vorschau)</div>
                <div className="max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                    {scrapedData.players.map(p => (
                        <div key={p.id} className="text-xs font-mono text-white/70 py-1 flex justify-between">
                            <span className="truncate max-w-[180px] block">{p.name}</span>
                            <span className="text-neon">{p.position}</span>
                        </div>
                    ))}
                </div>
             </div>

             <h3 className="text-lg font-bold text-white mb-6">Ist das dein Verein?</h3>
             
             <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={retrySetup}
                  className="px-6 py-3 rounded-lg border border-red-500/50 text-red-400 font-bold uppercase text-xs hover:bg-red-500/10 transition-colors"
                >
                  <Icon name="x" size={14} className="inline mr-2" /> Nein, neu suchen
                </button>
                <button 
                  onClick={confirmSetup}
                  className="px-6 py-3 rounded-lg bg-neon text-black font-black uppercase text-sm hover:shadow-[0_0_20px_rgba(0,243,255,0.4)] transition-all"
                >
                  <Icon name="check" size={16} className="inline mr-2" /> Ja, Kader importieren
                </button>
             </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default TrainerSetupWizard;
