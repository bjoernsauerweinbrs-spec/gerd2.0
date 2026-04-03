import React, { useState } from 'react';
import Icon from './Icon';
import { supabase } from '../utils/supabaseClient';

const RosterHub = ({ truthObject, setTruthObject, activeRole }) => {
  const players = truthObject?.players || [];
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  
  // Calculate dynamic OVR based on base stats, assuming 50 for undefined
  const calculateOvr = (p) => {
      const g = (val) => parseInt(val) || 50;
      const avg = (g(p.pac) + g(p.sho) + g(p.pas) + g(p.dri) + g(p.def) + g(p.phy)) / 6;
      return Math.min(99, Math.round(avg * 1.05)); // Slight boost for realism
  };

  const handleStatChange = (id, statName, value) => {
      if (activeRole === 'Manager') return; // Read only for manager
      const numVal = Math.max(1, Math.min(99, parseInt(value) || 1));
      
      setTruthObject(prev => {
          const newPlayers = prev.players.map(p => {
              if (p.id === id) {
                  const updatedPlayer = { ...p, [statName]: numVal };
                  updatedPlayer.ovr = calculateOvr(updatedPlayer);
                  return updatedPlayer;
              }
              return p;
          });
          return { ...prev, players: newPlayers };
      });
  };

  const uploadPlayerAvatar = async (event, player) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${player.id}_${Date.now()}.${fileExt}`;
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

        // 3. Update truthObject
        setTruthObject(prev => {
            const newPlayers = prev.players.map(p => 
                p.id === player.id ? { ...p, avatar_url: publicUrl } : p
            );
            return { ...prev, players: newPlayers };
        });
        
    } catch (err) {
        console.error("Senior Avatar Upload Error:", err);
        if (err.message?.includes("Bucket not found") || err.name === "StorageApiError") {
            alert("FEHLER: Supabase Bucket 'player_avatars' wurde nicht gefunden. Bitte führen Sie das bereitgestellte SQL-Setup (siehe Walkthrough) in Ihrem Supabase Dashboard aus.");
        } else {
            alert("Upload fehlgeschlagen: " + err.message);
        }
    } finally { }
  };

  const saveMedicalData = (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const medicalData = {
          body_fat: formData.get('body_fat'),
          muscle_mass: formData.get('muscle_mass'),
          weight: formData.get('weight'),
          resting_hr: formData.get('resting_hr'),
          sleep_score: formData.get('sleep_score'),
          vo2_max: formData.get('vo2_max'),
          dob: formData.get('dob')
      };
      
      const newImageUrl = formData.get('imageUrl') || selectedPlayer.imageUrl;

      setTruthObject(prev => {
          const newPlayers = prev.players.map(p => {
              if (p.id === selectedPlayer.id) {
                  return { ...p, medicalMetrics: medicalData, imageUrl: newImageUrl };
              }
              return p;
          });
          return { ...prev, players: newPlayers };
      });
      setSelectedPlayer(null);
  };

  return (
    <div className="animate-fade-in space-y-6 pb-20">
      <div className="flex items-center justify-between gap-3 mb-2 bg-black/40 p-6 rounded-2xl border border-white/10 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gold/20 border border-gold flex items-center justify-center">
            <Icon name="users" size={32} className="text-gold" />
          </div>
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter text-white italic">Mannschaftskader</h2>
            <p className="text-[10px] text-white/50 uppercase tracking-[0.2em] font-mono">Dynamische FIFA-Karten & Athletikprofil</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
            <button 
                onClick={() => window.dispatchEvent(new CustomEvent('trigger-gerd-sync'))}
                className="bg-neon/10 hover:bg-neon border border-neon/50 text-neon hover:text-black px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
            >
                <Icon name="refresh-cw" size={14} /> Live-Sync 2026
            </button>
            <div className="text-right hidden sm:block">
                <span className="text-[10px] uppercase font-black tracking-widest text-white/40">Kadergröße</span>
                <span className="text-4xl font-black text-white font-mono block">{players.length}</span>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {players.map(player => {
            const isBirthday = (() => {
              if (!player.medicalMetrics?.dob) return false;
              const today = new Date();
              const [d, m] = player.medicalMetrics.dob.split('.');
              return today.getDate() === parseInt(d) && (today.getMonth() + 1) === parseInt(m);
            })();

            return (
              <div key={player.id} className="relative group cursor-pointer transition-transform hover:-translate-y-2">
                {isBirthday && (
                  <div className="absolute -top-4 -right-4 z-30 animate-bounce">
                    <div className="bg-gold text-navy text-[10px] font-black px-3 py-1 rounded-full shadow-[0_0_15px_rgba(255,215,0,0.6)] flex items-center gap-1 border border-white">
                      <Icon name="cake" size={12} /> HAPPY BIRTHDAY!
                    </div>
                  </div>
                )}
                {/* FIFA Card Base */}
                <div className="bg-gradient-to-br from-[#1a1c29] to-[#0a0a0f] border-2 border-gold/30 rounded-t-3xl rounded-b-xl p-4 shadow-2xl relative overflow-hidden">
                    
                    {/* Clickable Card Top for Analytics Center */}
                    <div onClick={() => setSelectedPlayer(player)} className="group/top">
                        <div className="flex justify-between items-start mb-2 pointer-events-none">
                            <div className="text-center">
                                <span className="text-4xl font-black text-white block leading-none">{player.ovr}</span>
                                <span className="text-xs font-black text-gold uppercase">{player.position}</span>
                            </div>
                            <Icon name="shield" size={32} className="text-white/10" />
                        </div>

                        {/* Portrait Placeholder / Real Image */}
                        <div className="w-full h-32 flex items-end justify-center mb-2 mt-4 relative pointer-events-none">
                            <div className="absolute bottom-0 w-32 h-32 bg-white/5 rounded-full blur-xl group-hover/top:bg-neon/10 transition-colors"></div>
                            {player.avatar_url || player.imageUrl ? (
                                <img 
                                    src={player.avatar_url || player.imageUrl} 
                                    alt={player.name} 
                                    className={`h-32 ${player.avatar_url ? 'object-cover w-32 rounded-lg' : 'object-contain'} relative z-10 drop-shadow-2xl`} 
                                />
                            ) : (
                                <Icon name="user" size={80} className="text-white/80 relative z-10" />
                            )}
                        </div>

                        {/* Name */}
                        <div className="text-center border-b border-white/10 pb-2 mb-2 group-hover/top:text-neon transition-colors">
                            <h3 className="font-black text-white uppercase tracking-tighter truncate text-lg" title={player.name}>
                                {player.name}
                            </h3>
                        </div>
                    </div>

                    {/* Camera Upload Button Overlay */}
                    <div className="absolute top-2 right-2 z-40 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                            onClick={(e) => { e.stopPropagation(); document.getElementById(`avatar-upload-senior-${player.id}`).click(); }}
                            className="bg-white/95 backdrop-blur-xl p-2 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all text-navy border border-white/50"
                            title="Avatar hochladen"
                        >
                            <Icon name="camera" size={14} />
                        </button>
                        <input 
                            id={`avatar-upload-senior-${player.id}`}
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={(e) => uploadPlayerAvatar(e, player)}
                        />
                    </div>

                    {/* Editable Stats */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                        {[
                            { key: 'pac', label: 'PAC' },
                            { key: 'sho', label: 'SHO' },
                            { key: 'pas', label: 'PAS' },
                            { key: 'dri', label: 'DRI' },
                            { key: 'def', label: 'DEF' },
                            { key: 'phy', label: 'PHY' }
                        ].map(stat => (
                            <div key={stat.key} className="flex justify-between items-center group/stat">
                                <span className="font-bold text-[10px] text-white/50 uppercase tracking-wider group-hover/stat:text-white transition-colors">{stat.label}</span>
                                <input 
                                    type="number" 
                                    min="1" max="99" 
                                    disabled={activeRole === 'Manager'}
                                    value={player[stat.key] || 50} 
                                    onChange={(e) => handleStatChange(player.id, stat.key, e.target.value)}
                                    className={`w-10 bg-transparent text-right text-[14px] font-black ${player[stat.key] >= 80 ? 'text-green-400' : player[stat.key] <= 60 ? 'text-red-400' : 'text-white'} outline-none focus:bg-white/10 rounded transition-all`}
                                />
                            </div>
                        ))}
                    </div>

                </div>
              </div>
            );
        })}
      </div>

      {/* MEDICAL ANALYTICS MODAL */}
      {selectedPlayer && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in">
              <div className="bg-[#0a0f18] border border-white/20 rounded-2xl w-full max-w-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] relative">
                  
                  <button onClick={() => setSelectedPlayer(null)} className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors">
                      <Icon name="x" size={24} />
                  </button>

                  <div className="p-8 border-b border-white/10 flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-redbull/20 border border-redbull flex items-center justify-center">
                          <Icon name="heart-pulse" size={32} className="text-redbull" />
                      </div>
                      <div>
                          <h2 className="text-2xl font-black uppercase tracking-tighter text-white">Analysezentrum</h2>
                          <p className="text-redbull text-xs font-mono uppercase tracking-widest">{selectedPlayer.name} | OVR {selectedPlayer.ovr}</p>
                      </div>
                  </div>

                  <form onSubmit={saveMedicalData} className="p-8 space-y-8">
                      {/* Section 0: Media Customization */}
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="text-[10px] font-mono text-white/40 uppercase mb-1 flex items-center gap-2">
                               <Icon name="image" size={14} /> Medien (Portrait URL)
                            </label>
                            <input name="imageUrl" type="url" placeholder="https://beispiel.de/p123.jpg..." defaultValue={selectedPlayer.imageUrl || ''} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white font-bold outline-none focus:border-neon text-sm" />
                        </div>
                        <div>
                            <label className="text-[10px] font-mono text-white/40 uppercase mb-1 flex items-center gap-2">
                               <Icon name="calendar" size={14} /> Geburtsdatum
                            </label>
                            <input name="dob" type="text" placeholder="DD.MM.YYYY" defaultValue={selectedPlayer.medicalMetrics?.dob || ''} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white font-bold outline-none focus:border-neon text-sm" />
                        </div>
                      </div>

                      {/* Section 1: Fettanalysewaage */}
                      <div>
                          <h3 className="text-sm font-black text-white/60 uppercase tracking-widest mb-4 border-b border-white/10 pb-2 flex items-center gap-2">
                             <Icon name="server" size={16} /> Fettanalysewaage
                          </h3>
                          <div className="grid grid-cols-3 gap-4">
                              <div>
                                  <label className="text-[10px] font-mono text-white/40 uppercase">Körperfett (%)</label>
                                  <input name="body_fat" type="number" step="0.1" defaultValue={selectedPlayer.medicalMetrics?.body_fat || ''} required className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white font-bold outline-none focus:border-neon mt-1" />
                              </div>
                              <div>
                                  <label className="text-[10px] font-mono text-white/40 uppercase">Muskelmasse (kg)</label>
                                  <input name="muscle_mass" type="number" step="0.1" defaultValue={selectedPlayer.medicalMetrics?.muscle_mass || ''} required className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white font-bold outline-none focus:border-neon mt-1" />
                              </div>
                              <div>
                                  <label className="text-[10px] font-mono text-white/40 uppercase">Gewicht (kg)</label>
                                  <input name="weight" type="number" step="0.1" defaultValue={selectedPlayer.medicalMetrics?.weight || ''} required className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white font-bold outline-none focus:border-neon mt-1" />
                              </div>
                          </div>
                      </div>

                      {/* Section 2: Fitness Watch */}
                      <div>
                          <h3 className="text-sm font-black text-white/60 uppercase tracking-widest mb-4 border-b border-white/10 pb-2 flex items-center gap-2">
                             <Icon name="watch" size={16} /> Smartwatch Daten
                          </h3>
                          <div className="grid grid-cols-3 gap-4">
                              <div>
                                  <label className="text-[10px] font-mono text-white/40 uppercase">Ruhepuls (bpm)</label>
                                  <input name="resting_hr" type="number" defaultValue={selectedPlayer.medicalMetrics?.resting_hr || ''} required className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white font-bold outline-none focus:border-neon mt-1" />
                              </div>
                              <div>
                                  <label className="text-[10px] font-mono text-white/40 uppercase">Schlaf-Score (0-100)</label>
                                  <input name="sleep_score" type="number" defaultValue={selectedPlayer.medicalMetrics?.sleep_score || ''} required className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white font-bold outline-none focus:border-neon mt-1" />
                              </div>
                              <div>
                                  <label className="text-[10px] font-mono text-white/40 uppercase">VO2 Max</label>
                                  <input name="vo2_max" type="number" step="0.1" defaultValue={selectedPlayer.medicalMetrics?.vo2_max || ''} required className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white font-bold outline-none focus:border-neon mt-1" />
                              </div>
                          </div>
                      </div>

                      <div className="flex gap-4 pt-4">
                          <button 
                              type="button" 
                              onClick={() => setSelectedPlayer(null)} 
                              className="w-1/3 py-4 bg-transparent border border-white/20 text-white/50 font-black uppercase text-sm tracking-widest rounded-xl hover:bg-white/5 hover:text-white transition-all"
                          >
                              Abbrechen
                          </button>
                          <button 
                              type="submit" 
                              disabled={activeRole === 'Manager'} 
                              className="w-2/3 py-4 bg-neon text-black font-black uppercase text-sm tracking-widest rounded-xl hover:shadow-[0_0_20px_rgba(0,243,255,0.3)] transition-all disabled:opacity-50 disabled:shadow-none"
                          >
                              {activeRole === 'Manager' ? 'Read Only' : 'Vitaldaten sichern'}
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}

    </div>
  );
};

export default RosterHub;
