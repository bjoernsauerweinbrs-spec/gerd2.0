import React, { useState } from 'react';
import { supabase } from '../../utils/supabaseClient';
import Icon from '../Icon';

const NlzScanner = ({ onScanComplete }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);
  const [scanResult, setScanResult] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(selectedFile);
      setError(null);
      setScanResult(null);
    }
  };

  const handleScan = async () => {
    if (!preview) return;
    setIsScanning(true);
    setError(null);

    try {
      const geminiKey = localStorage.getItem('stark_gemini_key');
      const response = await fetch('/api/nlz/scan-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          base64Image: preview,
          apiKey: geminiKey 
        })
      });

      if (!response.ok) throw new Error('Scan fehlgeschlagen. Bitte Bildqualität prüfen.');
      
      const data = await response.json();
      setScanResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsScanning(false);
    }
  };

  const saveToSupabase = async () => {
    if (!scanResult) return;
    
    try {
      const { error: dbError } = await supabase
        .from('nlz_schedule')
        .insert([{
          opponent: scanResult.opponent,
          match_date: scanResult.match_date,
          time: scanResult.time,
          location: scanResult.location,
          team_id: 'NLZ_GENERAL' // Placeholder, could be dynamic
        }]);

      if (dbError) throw dbError;
      
      if (onScanComplete) onScanComplete(scanResult);
      setScanResult(null);
      setFile(null);
      setPreview(null);
    } catch (err) {
      setError('Fehler beim Speichern in der Datenbank: ' + err.message);
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-md">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-redbull/20 rounded-lg">
          <Icon name="camera" className="text-redbull" size={20} />
        </div>
        <h3 className="text-lg font-bold text-white uppercase tracking-wider">NLZ Vision Scanner</h3>
      </div>

      {!preview ? (
        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:bg-white/5 transition-colors">
          <Icon name="upload" className="text-white/40 mb-3" size={32} />
          <span className="text-sm text-white/60">Spielplan-Screenshot hochladen</span>
          <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
        </label>
      ) : (
        <div className="space-y-4">
          <div className="relative rounded-lg overflow-hidden border border-white/20 h-48">
            <img src={preview} alt="Schedule Preview" className="w-full h-full object-cover" />
            <button 
              onClick={() => { setPreview(null); setFile(null); }}
              className="absolute top-2 right-2 p-1 bg-black/60 rounded-full text-white hover:bg-red-600"
            >
              <Icon name="x" size={16} />
            </button>
          </div>

          {!scanResult ? (
            <button
              onClick={handleScan}
              disabled={isScanning}
              className="w-full py-3 bg-redbull text-white font-bold rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
            >
              {isScanning ? (
                <>
                  <Icon name="loader" className="animate-spin" size={18} />
                  Analysiere Daten...
                </>
              ) : (
                <>
                  <Icon name="zap" size={18} />
                  Scan Starten (Gemini 1.5 Pro)
                </>
              )}
            </button>
          ) : (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between text-green-400 font-bold text-sm uppercase">
                <span>Daten Extrahiert</span>
                <Icon name="check-circle" size={16} />
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-white/40 mb-1">Gegner</p>
                  <p className="text-white font-medium">{scanResult.opponent}</p>
                </div>
                <div>
                  <p className="text-white/40 mb-1">Datum</p>
                  <p className="text-white font-medium">{scanResult.match_date} um {scanResult.time}</p>
                </div>
              </div>
              <button
                onClick={saveToSupabase}
                className="w-full py-2 bg-green-600 text-white text-sm font-bold rounded hover:bg-green-700 transition-colors"
              >
                In Spielplan übernehmen
              </button>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-500/20 border border-red-500/40 rounded text-red-400 text-xs flex items-center gap-2">
          <Icon name="alert-circle" size={14} />
          {error}
        </div>
      )}
    </div>
  );
};

export default NlzScanner;
