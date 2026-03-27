import React, { useState, useEffect } from 'react';
import Icon from './Icon';
import AiSettingsWidget from './AiSettingsWidget';

const Header = ({ activeTab, activeRole, onLogout, truthObject, setTruthObject }) => {
  const [globalAiInput, setGlobalAiInput] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [showAiSettings, setShowAiSettings] = useState(false);
  
  const [isInboxOpen, setIsInboxOpen] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [interviewStep, setInterviewStep] = useState(0);
  const [interviewAnswer, setInterviewAnswer] = useState('');

  // AI Global Status Ping
  const [currentAi, setCurrentAi] = useState('openai');
  const [aiPingStatus, setAiPingStatus] = useState('yellow'); // green, red, yellow

  useEffect(() => {
    const checkAiStatus = async () => {
      const p = localStorage.getItem('stark_ai_provider') || 'openai';
      setCurrentAi(p);

      if (p === 'ollama') {
        try {
          // Rapid silent ping to local Ollama daemon
          await fetch('http://localhost:11434/', { method: 'GET', mode: 'no-cors' });
          setAiPingStatus('green');
        } catch (e) {
          setAiPingStatus('red');
        }
      } else {
        // Cloud APIs: Validate if a key exists
        const key = localStorage.getItem(`stark_${p}_key`);
        const fallback = localStorage.getItem('stark_groq_key');
        if (key || (p === 'gemini' && fallback)) {
          setAiPingStatus('green');
        } else {
          setAiPingStatus('red');
        }
      }
    };
    checkAiStatus();
    const interval = setInterval(checkAiStatus, 3000); // Check every 3 seconds
    return () => clearInterval(interval);
  }, []);

  const notifications = truthObject?.notifications || [];
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleGlobalAiSubmit = async () => {
    if (!globalAiInput.trim()) return;
    setIsAiProcessing(true);
    setTimeout(() => {
      console.log(`Global AI commanded: ${globalAiInput} via ${activeRole}`);
      setIsAiProcessing(false);
      setGlobalAiInput('');
    }, 1500);
  };

  const markAsRead = (id) => {
    if (!setTruthObject) return;
    setTruthObject(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => n.id === id ? { ...n, read: true } : n)
    }));
  };

  const handleNotificationClick = (notif) => {
    if (notif.type === 'press_interview') {
      setShowInterviewModal(true);
      setIsInboxOpen(false);
    }
    markAsRead(notif.id);
  };

  const submitInterview = () => {
    if (!setTruthObject) return;
    // Save answer to truthObject
    setTruthObject(prev => ({
      ...prev,
      latest_interview: `Trainer-Statement zur Aufstellung: "${interviewAnswer}"`
    }));
    setShowInterviewModal(false);
    setInterviewAnswer('');
    setInterviewStep(0);
  };

  return (
    <header className="w-full flex flex-col md:flex-row justify-between items-stretch gap-4 p-4 md:p-8 bg-black/40 backdrop-blur-md border-b border-white/5 relative z-[60]">
      
      {/* LEFT: Branding & Role Display */}
      <div className="flex flex-col gap-2 relative z-10 w-full md:w-auto">
        <h1 className="text-xl md:text-2xl font-black text-white leading-none uppercase tracking-tighter italic flex items-center gap-2">
          <Icon name="activity" className="text-neon" size={24} /> GERD 2.0 <span className="text-[#e21b4d]">PRO</span>
        </h1>
        
        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-white/20 bg-white/5 text-[10px] font-black uppercase tracking-widest text-white">
            <Icon name="user-check" size={12} className="text-neon" />
            Eingeloggt als: {activeRole} 
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-red-500/30 bg-red-500/10 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500 hover:text-white transition-colors"
          >
            <Icon name="log-out" size={12} />
            Logout
          </button>
        </div>
      </div>

      {/* RIGHT: Notifications & Global Intelligence */}
      <div className="flex-1 w-full md:max-w-2xl flex flex-col md:flex-row items-end md:items-center justify-end gap-4 relative z-10">
        
        {/* Inbox Bell */}
        <div className="relative">
          <button 
            onClick={() => setIsInboxOpen(!isInboxOpen)}
            className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors relative"
          >
            <Icon name="bell" size={20} className={unreadCount > 0 ? "text-neon" : "text-white/40"} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-redbull text-white text-[9px] font-black flex items-center justify-center shadow-[0_0_10px_#e21b4d] animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Inbox Dropdown */}
          {isInboxOpen && (
            <div className="absolute top-14 right-0 w-80 bg-navy/95 backdrop-blur-xl border border-neon/30 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden z-[100] animate-fade-in">
              <div className="p-3 bg-white/5 border-b border-white/10 text-xs font-black uppercase tracking-widest text-white flex justify-between items-center">
                System Inbox
                <button onClick={() => setIsInboxOpen(false)}><Icon name="x" size={14} className="text-white/40 hover:text-white" /></button>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-white/40 font-mono">Keine Nachrichten vorhanden.</div>
                ) : (
                  notifications.map(n => (
                    <button 
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`w-full text-left p-4 border-b border-white/5 hover:bg-white/5 transition-colors flex gap-3 items-start ${!n.read ? 'bg-neon/5' : ''}`}
                    >
                      <div className={`mt-0.5 ${n.type === 'press_interview' ? 'text-gold' : 'text-neon'}`}>
                        <Icon name={n.type === 'press_interview' ? "mic" : "info"} size={16} />
                      </div>
                      <div>
                        <div className={`text-xs font-bold leading-snug ${!n.read ? 'text-white' : 'text-white/60'}`}>{n.message}</div>
                        <div className="text-[9px] text-white/30 uppercase mt-1 font-mono tracking-widest">
                          {n.type === 'press_interview' ? 'Presseabteilung' : 'System'}
                        </div>
                      </div>
                      {!n.read && <div className="w-2 h-2 rounded-full bg-neon shrink-0 mt-1"></div>}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* AI Settings Widget */}
        <div className="relative">
          <button 
            onClick={() => setShowAiSettings(!showAiSettings)}
            className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-colors relative ${showAiSettings ? 'bg-white/10 border-neon text-neon' : 'bg-white/5 border-white/10 hover:bg-white/10 text-white/40 hover:text-white'}`}
          >
            <Icon name="settings" size={20} />
          </button>
          
          {showAiSettings && (
             <div className="absolute top-14 right-0 w-80 bg-[#0a1120]/95 backdrop-blur-xl border border-neon/30 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden z-[100] animate-fade-in text-left">
                <AiSettingsWidget context={activeRole === 'Manager' ? 'management' : 'trainer'} onClose={() => setShowAiSettings(false)} />
             </div>
          )}
        </div>

        {/* Global AI Traffic Light Indicator */}
        <div className="flex items-center gap-2 px-3 py-2 bg-black/40 border border-white/10 rounded-xl">
           <div className={`w-2.5 h-2.5 rounded-full shadow-[0_0_10px_currentColor] animate-pulse ${
               aiPingStatus === 'green' ? 'bg-green-500 text-green-500' : 
               aiPingStatus === 'red' ? 'bg-red-500 text-red-500' : 'bg-yellow-500 text-yellow-500'
           }`}></div>
           <div className="flex flex-col">
              <span className="text-[8px] font-black uppercase tracking-widest text-white/40 leading-none">Netzwerk</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-white leading-tight">
                 {currentAi === 'ollama' ? 'Lokal (Ollama)' : currentAi}
              </span>
           </div>
        </div>

        {/* Global Intelligence Input */}
        <div className={`w-full md:w-96 bg-black/60 border rounded-xl overflow-hidden flex transition-colors shadow-inner ${isAiProcessing ? 'border-neon shadow-[0_0_20px_rgba(0,243,255,0.2)]' : 'border-white/20 focus-within:border-white/50'}`}>
          <div className="pl-4 py-3 flex items-center justify-center border-r border-white/10 bg-black/40">
            <Icon name="zap" className={isAiProcessing ? "text-neon animate-pulse" : "text-white/40"} size={18} />
          </div>
          <input
            type="text"
            value={globalAiInput}
            onChange={(e) => setGlobalAiInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGlobalAiSubmit()}
            placeholder={`Befehl an GERD als ${activeRole}...`}
            className="flex-1 w-full bg-transparent border-none text-white text-sm font-mono px-4 outline-none placeholder:text-white/30"
            disabled={isAiProcessing}
          />
          <button
            onClick={handleGlobalAiSubmit}
            disabled={!globalAiInput.trim() || isAiProcessing}
            className={`px-4 py-3 font-black text-[10px] uppercase tracking-widest transition-colors ${
              globalAiInput.trim() 
                ? 'bg-neon text-black hover:bg-white' 
                : 'bg-white/5 text-white/20'
            }`}
          >
            {isAiProcessing ? '...' : 'Go'}
          </button>
        </div>
      </div>
      
      {/* AI INTERVIEW MODAL */}
      {showInterviewModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-navy border border-gold/40 rounded-2xl p-8 max-w-xl w-full shadow-[0_0_50px_rgba(212,175,55,0.15)] relative">
            <button onClick={() => setShowInterviewModal(false)} className="absolute top-4 right-4 text-white/40 hover:text-white">
              <Icon name="x" size={24} />
            </button>
            <div className="flex items-center gap-4 mb-6 border-b border-white/10 pb-4">
              <div className="w-12 h-12 bg-gold/20 rounded-full flex items-center justify-center border border-gold/50">
                <Icon name="mic" size={24} className="text-gold" />
              </div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-widest text-white">Pressetermin</h3>
                <p className="text-[10px] font-mono text-gold uppercase tracking-[0.2em]">GERD Journalist AI</p>
              </div>
            </div>
            
            <div className="bg-black/50 rounded-xl p-5 mb-6 border border-white/5">
              <p className="text-sm font-serif italic text-white/90 leading-relaxed">
                 "Hallo Coach! Die Aufstellung für das Wochenende ist übermittelt via Command Center. Wir sehen eine kompakte {truthObject?.tactical_setup?.formation_home || 'Formation'}, bei der voll auf Athletik gesetzt wird. Was erhoffen Sie sich von dieser Marschroute und wie lautet die finale Ansage an die Fans?"
              </p>
            </div>

            <textarea 
              className="w-full bg-white/5 border border-white/20 rounded-xl p-4 text-white font-mono text-sm leading-relaxed outline-none focus:border-gold transition-colors min-h-[120px] mb-6"
              placeholder="Ihre Antwort als Trainer eingeben..."
              value={interviewAnswer}
              onChange={(e) => setInterviewAnswer(e.target.value)}
            ></textarea>

            <button 
              onClick={submitInterview}
              disabled={!interviewAnswer.trim()}
              className="w-full py-4 bg-gold rounded-xl text-black font-black uppercase tracking-widest hover:bg-white transition-all disabled:opacity-50"
            >
              Antwort in Stadion-Kurier publizieren
            </button>
          </div>
        </div>
      )}

    </header>
  );
};

export default Header;
