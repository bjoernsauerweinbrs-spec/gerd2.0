import React, { useState } from 'react';
import Icon from './Icon';

const ROLES = [
  { id: 'Trainer', name: 'Trainer Senioren', icon: 'whistle', color: 'neon', description: 'Zugriff auf Taktik, Training & Kaderplanung.', pin: '1904' },
  { id: 'Manager', name: 'Manager', icon: 'briefcase', color: 'gold', description: 'Voller Einblick in Finanzen und alle Trainer-Aktivitäten.', pin: '2026' },
  { id: 'Presse', name: 'Presseabteilung', icon: 'mic', color: 'blue-500', description: 'Zugang zum Stadion-Kurier und internen Medien.', pin: '1111' },
  { id: 'Jugendtrainer', name: 'Jugendtrainer', icon: 'graduation-cap', color: 'redbull', description: 'Zugriff auf NLZ Academy und Talent-Pipeline.', pin: '1234' }
];

const Login = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [pinEntry, setPinEntry] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleRoleClick = (role) => {
    setSelectedRole(role);
    setPinEntry('');
    setErrorMsg('');
  };

  const handlePinInput = (num) => {
    if (pinEntry.length < 4) {
      const newPin = pinEntry + num;
      setPinEntry(newPin);
      setErrorMsg('');

      if (newPin.length === 4) {
        verifyPin(newPin);
      }
    }
  };

  const handleClearPin = () => {
    setPinEntry('');
    setErrorMsg('');
  };

  const verifyPin = (enteredPin) => {
    if (enteredPin === selectedRole.pin) {
      setTimeout(() => onLogin(selectedRole.id), 500); // Small delay for UX
    } else {
      setErrorMsg('PIN INKORREKT');
      setTimeout(() => setPinEntry(''), 800);
    }
  };

  return (
    <div className="min-h-screen bg-black font-sans text-white relative overflow-hidden flex items-center justify-center p-4">
      {/* Background Effects */}
      <div id="neural-canvas" className="absolute inset-0 z-0"></div>
      <div className="absolute inset-0 carbon-fiber opacity-30 z-0"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-neon/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-redbull/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-4xl glass-panel p-8 md:p-12 border border-white/5 shadow-2xl">
        <div className="text-center mb-12 border-b border-white/10 pb-8 relative">
           <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white drop-shadow-[0_0_15px_rgba(0,243,255,0.4)]">
             GERD 2.0 <span className="text-redbull">PRO</span>
           </h1>
           <div className="font-mono text-xs text-white/40 tracking-[0.3em] uppercase mt-2">
             Stark Elite Command Center
           </div>
        </div>

        {!selectedRole ? (
          <div>
            <h2 className="text-center text-sm font-black uppercase tracking-widest text-white/60 mb-8 flex items-center justify-center gap-3">
               <Icon name="lock" size={16} /> Identifikation erforderlich
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {ROLES.map((r) => (
                <button
                  key={r.id}
                  onClick={() => handleRoleClick(r)}
                  className={`group relative p-6 text-left border rounded-xl overflow-hidden transition-all duration-300 
                  bg-black/40 hover:bg-black/80
                  ${r.color === 'neon' ? 'border-[#00f3ff]/20 hover:border-[#00f3ff]' : 
                    r.color === 'gold' ? 'border-[#d4af37]/20 hover:border-[#d4af37]' : 
                    r.color === 'redbull' ? 'border-[#e21b4d]/20 hover:border-[#e21b4d]' : 
                    'border-[#3b82f6]/20 hover:border-[#3b82f6]'}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg bg-white/5 border border-white/10 group-hover:scale-110 transition-transform
                      ${r.color === 'neon' ? 'text-[#00f3ff]' : 
                        r.color === 'gold' ? 'text-[#d4af37]' : 
                        r.color === 'redbull' ? 'text-[#e21b4d]' : 
                        'text-[#3b82f6]'}`}
                    >
                      <Icon name={r.icon} size={28} />
                    </div>
                    <div>
                      <div className="font-black text-white uppercase tracking-wider text-xl mb-1 group-hover:text-white transition-colors">{r.name}</div>
                      <div className="text-xs text-white/40 font-mono">{r.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-sm mx-auto animate-fade-in flex flex-col items-center">
            <button 
              onClick={() => setSelectedRole(null)}
              className="self-start text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white mb-6 flex items-center gap-2"
            >
              <Icon name="arrow-left" size={12} /> Zurück zur Auswahl
            </button>

            <div className="text-center mb-8">
              <div className={`inline-flex p-4 rounded-full bg-white/5 border border-white/10 mb-4
                ${selectedRole.color === 'neon' ? 'text-[#00f3ff]' : 
                  selectedRole.color === 'gold' ? 'text-[#d4af37]' : 
                  selectedRole.color === 'redbull' ? 'text-[#e21b4d]' : 
                  'text-[#3b82f6]'}`}
              >
                <Icon name={selectedRole.icon} size={32} />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-widest text-white">{selectedRole.name}</h2>
              <div className="text-[10px] text-white/40 font-mono tracking-widest uppercase mt-1">Bitte 4-stellige PIN eingeben</div>
            </div>

            {/* PIN Code Dots */}
            <div className="flex justify-center gap-4 mb-8">
              {[0, 1, 2, 3].map((i) => (
                <div 
                  key={i} 
                  className={`w-6 h-6 rounded-full border-2 transition-all duration-300 
                  ${pinEntry.length > i ? 'bg-white border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.8)]' : 'bg-transparent border-white/20'}
                  ${errorMsg ? 'border-red-500 bg-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.8)]' : ''}`}
                />
              ))}
            </div>

            {errorMsg && (
              <div className="text-red-500 font-black text-xs uppercase tracking-[0.3em] font-mono text-center mb-4 animate-pulse">
                {errorMsg}
              </div>
            )}

            {/* Numpad */}
            <div className="grid grid-cols-3 gap-4 w-full">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  onClick={() => handlePinInput(num.toString())}
                  className="h-16 rounded-xl bg-[#0a1120] border border-white/10 text-white font-mono text-2xl font-black hover:bg-white/10 hover:border-white/30 transition-all active:scale-95"
                >
                  {num}
                </button>
              ))}
              <div className="h-16"></div>
              <button
                onClick={() => handlePinInput('0')}
                className="h-16 rounded-xl bg-[#0a1120] border border-white/10 text-white font-mono text-2xl font-black hover:bg-white/10 hover:border-white/30 transition-all active:scale-95"
              >
                0
              </button>
              <button
                onClick={handleClearPin}
                className="h-16 flex items-center justify-center rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition-all active:scale-95"
              >
                <Icon name="delete" size={24} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
