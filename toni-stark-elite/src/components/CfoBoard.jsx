import React, { useState, useEffect, useRef, useCallback } from 'react';
import Icon from './Icon';
import { sendAiRequest } from '../utils/aiConfig';

// ============================================================
// TRANSFERMARKT 2.5 — AI CORE & CLUB IDENTITY ENGINE
// Built for GERD 2.0 | Stark Elite | Toni 2.0
// ============================================================

const POSITION_GROUPS = {
  TW: { label: 'Torwart', color: '#f59e0b' },
  IV: { label: 'Innenverteidiger', color: '#3b82f6' },
  LV: { label: 'Linker Verteidiger', color: '#3b82f6' },
  RV: { label: 'Rechter Verteidiger', color: '#3b82f6' },
  ZDM: { label: 'Defensives Mittelfeld', color: '#8b5cf6' },
  ZM: { label: 'Zentrales Mittelfeld', color: '#8b5cf6' },
  ZOM: { label: 'Offensives Mittelfeld', color: '#ec4899' },
  LM: { label: 'Linkes Mittelfeld', color: '#06b6d4' },
  RM: { label: 'Rechtes Mittelfeld', color: '#06b6d4' },
  LF: { label: 'Linksaußen', color: '#00f3ff' },
  RF: { label: 'Rechtsaußen', color: '#00f3ff' },
  ST: { label: 'Mittelstürmer', color: '#e21b4d' },
};

const MOCK_TM_DATABASE = [
  { id: 'm1', name: 'Florian Wirtz', pos: 'ZOM', age: 22, ovr: 90, pot: 95, club: 'Bayer Leverkusen', nation: '🇩🇪', fee: 145, salary: 18, contract_end: '2027', foot: 'Links', height: '176cm', tags: ['Weltklasse', 'Ausstiegsklausel', 'Hot'], marketValue: '€ 145M', pac: 88, sho: 86, pas: 91, dri: 94, def: 42, phy: 65, form: 'AAA+', agent: 'ICM Stellar' },
  { id: 'm2', name: 'Xavi Simons', pos: 'ZOM', age: 22, ovr: 87, pot: 93, club: 'Paris Saint-Germain', nation: '🇳🇱', fee: 90, salary: 12, contract_end: '2027', foot: 'Rechts', height: '174cm', tags: ['Top-Talent', 'Leihkand.'], marketValue: '€ 90M', pac: 90, sho: 84, pas: 88, dri: 92, def: 38, phy: 62, form: 'A+', agent: 'Rogon' },
  { id: 'm3', name: 'Jamal Musiala', pos: 'ZOM', age: 22, ovr: 91, pot: 96, club: 'FC Bayern München', nation: '🇩🇪', fee: 180, salary: 22, contract_end: '2026', foot: 'Rechts', height: '183cm', tags: ['Generation X', 'Ausstiegsklausel', '🔥 Hot'], marketValue: '€ 180M', pac: 89, sho: 87, pas: 85, dri: 95, def: 40, phy: 72, form: 'AA', agent: 'Lian Sports' },
  { id: 'm4', name: 'Kylian Mbappé', pos: 'ST', age: 26, ovr: 93, pot: 94, club: 'Real Madrid', nation: '🇫🇷', fee: 200, salary: 45, contract_end: '2029', foot: 'Rechts', height: '178cm', tags: ['Weltklasse', 'Ausstieg €200M'], marketValue: '€ 180M', pac: 97, sho: 92, pas: 80, dri: 93, def: 36, phy: 80, form: 'A', agent: 'Fayza Lamari' },
  { id: 'm5', name: 'Joshua Kimmich', pos: 'ZDM', age: 30, ovr: 88, pot: 88, club: 'FC Bayern München', nation: '🇩🇪', fee: 45, salary: 20, contract_end: '2025', foot: 'Rechts', height: '177cm', tags: ['Vertragsende ⚠️', 'Freier Transfer mögl.'], marketValue: '€ 45M', pac: 78, sho: 72, pas: 90, dri: 82, def: 78, phy: 79, form: 'A', agent: 'Roof Entertainment' },
  { id: 'm6', name: 'Bukayo Saka', pos: 'RF', age: 23, ovr: 90, pot: 94, club: 'Arsenal FC', nation: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', fee: 150, salary: 16, contract_end: '2027', foot: 'Links', height: '178cm', tags: ['Weltklasse', 'PL-Kandidat'], marketValue: '€ 150M', pac: 91, sho: 87, pas: 86, dri: 91, def: 64, phy: 70, form: 'A+', agent: 'Thomas Walsh' },
  { id: 'm7', name: 'Pedri', pos: 'ZM', age: 23, ovr: 89, pot: 95, club: 'FC Barcelona', nation: '🇪🇸', fee: 130, salary: 15, contract_end: '2026', foot: 'Rechts', height: '174cm', tags: ['La Masia Produkt', 'Verletzungsrisiko'], marketValue: '€ 130M', pac: 82, sho: 78, pas: 93, dri: 92, def: 68, phy: 65, form: 'B+', agent: 'Ivan de la Peña' },
  { id: 'm8', name: 'Vinicius Jr.', pos: 'LF', age: 24, ovr: 92, pot: 95, club: 'Real Madrid', nation: '🇧🇷', fee: 200, salary: 30, contract_end: '2027', foot: 'Rechts', height: '176cm', tags: ['Weltklasse', 'Ballon d\'Or-Kandidat'], marketValue: '€ 200M', pac: 96, sho: 87, pas: 81, dri: 95, def: 30, phy: 68, form: 'AA+', agent: 'Frederico Pena' },
  { id: 'm9', name: 'Erling Haaland', pos: 'ST', age: 24, ovr: 93, pot: 95, club: 'Manchester City', nation: '🇳🇴', fee: 180, salary: 40, contract_end: '2034', foot: 'Links', height: '194cm', tags: ['Stürmer des Jahrzehnts', 'Langfristiger Deal'], marketValue: '€ 200M', pac: 89, sho: 97, pas: 68, dri: 82, def: 45, phy: 95, form: 'AA+', agent: 'Alfie Haaland Sr.' },
  { id: 'm10', name: 'Jonathan Tah', pos: 'IV', age: 29, ovr: 86, pot: 87, club: 'Bayer Leverkusen', nation: '🇩🇪', fee: 0, salary: 10, contract_end: '2025', foot: 'Rechts', height: '192cm', tags: ['Freier Transfer ✅', 'Top-Abwehrspieler'], marketValue: '€ 30M', pac: 79, sho: 42, pas: 72, dri: 68, def: 88, phy: 90, form: 'A', agent: 'Volker Struth' },
  { id: 'm11', name: 'Lamine Yamal', pos: 'RF', age: 17, ovr: 86, pot: 98, club: 'FC Barcelona', nation: '🇪🇸', fee: 180, salary: 8, contract_end: '2031', foot: 'Links', height: '180cm', tags: ['Wunderkind 🌟', 'Generationstalent', 'Zukunft'], marketValue: '€ 180M', pac: 90, sho: 80, pas: 84, dri: 93, def: 35, phy: 55, form: 'AA', agent: 'Jorge Mendes' },
  { id: 'm12', name: 'Adrien Rabiot', pos: 'ZM', age: 29, ovr: 83, pot: 83, club: 'Vereinslos', nation: '🇫🇷', fee: 0, salary: 8, contract_end: 'Frei', foot: 'Links', height: '188cm', tags: ['Freier Transfer ✅', 'Sofort verfügbar'], marketValue: '€ 15M', pac: 78, sho: 68, pas: 82, dri: 78, def: 76, phy: 85, form: 'B', agent: 'Veronique Rabiot' },
  { id: 'm13', name: 'Gavi', pos: 'ZM', age: 20, ovr: 87, pot: 94, club: 'FC Barcelona', nation: '🇪🇸', fee: 120, salary: 13, contract_end: '2026', foot: 'Links', height: '173cm', tags: ['La Masia Legende', 'Verletzungsrisiko'], marketValue: '€ 120M', pac: 81, sho: 74, pas: 90, dri: 91, def: 72, phy: 68, form: 'A-', agent: 'Ivan de la Peña' },
  { id: 'm14', name: 'Marc-André ter Stegen', pos: 'TW', age: 33, ovr: 88, pot: 88, club: 'FC Barcelona', nation: '🇩🇪', fee: 20, salary: 18, contract_end: '2025', foot: 'Rechts', height: '187cm', tags: ['Vertragsende ⚠️', 'Welttorwart'], marketValue: '€ 20M', pac: 55, sho: 22, pas: 84, dri: 72, def: 90, phy: 84, form: 'B', agent: 'Inaki Lukambio' },
  { id: 'm15', name: 'Nico Schlotterbeck', pos: 'IV', age: 25, ovr: 84, pot: 90, club: 'Borussia Dortmund', nation: '🇩🇪', fee: 55, salary: 9, contract_end: '2028', foot: 'Links', height: '192cm', tags: ['BVB-Stamm', 'Aufstrebend'], marketValue: '€ 55M', pac: 80, sho: 48, pas: 74, dri: 72, def: 85, phy: 88, form: 'A', agent: 'Volker Struth' },
];

// Club Identity presets
const CLUB_IDENTITIES = {
  champions_league: { label: 'Champions League', color: '#1a3a6b', accent: '#d4af37' },
  bundesliga: { label: 'Bundesliga', color: '#d4213d', accent: '#ffffff' },
  amateur: { label: 'Amateurklasse', color: '#2d6a4f', accent: '#74c69d' },
  jugend: { label: 'Jugend/NLZ', color: '#7b2d8b', accent: '#e040fb' },
};

// ---- STAT BAR COMPONENT ----
const StatBar = ({ value, color = '#00f3ff', label }) => (
  <div className="flex items-center gap-2 text-xs">
    <span className="text-white/40 w-10 text-right font-mono text-[10px]">{label}</span>
    <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${value}%`, background: color }}
      />
    </div>
    <span className="text-white/70 font-black font-mono text-[11px] w-6">{value}</span>
  </div>
);

// ---- PLAYER CARD (MODAL) ----
const PlayerDetailModal = ({ player, onClose, onAddToWatchlist, onAiScout, isScoutLoading, scoutReport }) => {
  if (!player) return null;
  const posColor = POSITION_GROUPS[player.pos]?.color || '#00f3ff';
  const overallColor = player.ovr >= 90 ? '#d4af37' : player.ovr >= 85 ? '#00f3ff' : '#a0a0a0';

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4" onClick={onClose}>
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10"
        style={{ background: 'rgba(5, 10, 25, 0.98)', boxShadow: `0 0 80px ${posColor}30` }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 border-b border-white/10" style={{ background: `linear-gradient(135deg, ${posColor}20, transparent)` }}>
          <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors">
            <Icon name="x" size={20} />
          </button>
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div
                className="w-24 h-24 rounded-xl flex items-center justify-center text-3xl font-black border-2"
                style={{ background: `${posColor}20`, borderColor: `${posColor}60` }}
              >
                {player.nation}
              </div>
              <div
                className="absolute -bottom-2 -right-2 px-2 py-1 rounded-lg text-xs font-black"
                style={{ background: posColor, color: '#000' }}
              >
                {player.pos}
              </div>
            </div>
            {/* Info */}
            <div className="flex-1">
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{player.name}</h2>
              <p className="text-white/50 text-sm font-mono mt-1">{player.club} · {player.age} Jahre · {player.foot}fuß · {player.height}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {player.tags?.map(tag => (
                  <span key={tag} className="px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest bg-white/10 text-white/60">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            {/* OVR */}
            <div className="text-center shrink-0">
              <div className="text-5xl font-black" style={{ color: overallColor }}>{player.ovr}</div>
              <div className="text-[10px] text-white/40 uppercase tracking-widest font-black">OVR</div>
              <div className="text-[11px] font-black mt-1" style={{ color: '#a855f7' }}>POT {player.pot}</div>
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Stats */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3">Attribute</h3>
            <StatBar value={player.pac} color="#00f3ff" label="PAC" />
            <StatBar value={player.sho} color="#e21b4d" label="SHO" />
            <StatBar value={player.pas} color="#3b82f6" label="PAS" />
            <StatBar value={player.dri} color="#a855f7" label="DRI" />
            <StatBar value={player.def} color="#22c55e" label="DEF" />
            <StatBar value={player.phy} color="#f59e0b" label="PHY" />
          </div>

          {/* Transfer Info */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3">Transfer-Daten</h3>
            <div className="space-y-2">
              {[
                { label: 'Marktwert', value: player.marketValue, color: '#d4af37' },
                { label: 'Ablöse', value: player.fee === 0 ? '✅ Frei' : `€ ${player.fee}M`, color: player.fee === 0 ? '#22c55e' : '#e21b4d' },
                { label: 'Gehalt p.a.', value: `€ ${player.salary}M`, color: '#00f3ff' },
                { label: 'Vertragsende', value: player.contract_end, color: '#f59e0b' },
                { label: 'Berater', value: player.agent || 'N/A', color: '#a0a0a0' },
                { label: 'Formkurve', value: player.form, color: '#22c55e' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-white/40 text-xs font-mono uppercase tracking-widest">{item.label}</span>
                  <span className="font-black text-sm" style={{ color: item.color }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Scout Report */}
        <div className="px-6 pb-4">
          {scoutReport ? (
            <div className="p-4 rounded-xl border border-[#00f3ff]/20 bg-[#00f3ff]/5">
              <div className="flex items-center gap-2 mb-3">
                <Icon name="cpu" size={16} className="text-[#00f3ff]" />
                <span className="text-[11px] font-black uppercase tracking-widest text-[#00f3ff]">GERD 2.0 — AI Scout Report</span>
              </div>
              <div className="text-white/80 text-sm font-mono leading-relaxed whitespace-pre-line">{scoutReport}</div>
            </div>
          ) : (
            <button
              onClick={() => onAiScout(player)}
              disabled={isScoutLoading}
              className="w-full py-3 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all border border-[#00f3ff]/30 hover:border-[#00f3ff] hover:bg-[#00f3ff]/10 text-[#00f3ff] flex items-center justify-center gap-2"
            >
              {isScoutLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#00f3ff]/30 border-t-[#00f3ff] rounded-full animate-spin" />
                  GERD 2.0 analysiert...
                </>
              ) : (
                <>
                  <Icon name="cpu" size={14} />
                  KI-Scouting starten (GERD 2.0)
                </>
              )}
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-6 pt-2 flex gap-3">
          <button
            onClick={() => onAddToWatchlist(player)}
            className="flex-1 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all bg-[#d4af37]/10 border border-[#d4af37]/30 hover:bg-[#d4af37]/20 text-[#d4af37] flex items-center justify-center gap-2"
          >
            <Icon name="star" size={14} />
            Watchlist
          </button>
          <button
            onClick={() => alert(`Transfer-Anfrage für ${player.name} eingeleitet.\nAblöse: ${player.fee === 0 ? 'Frei' : '€ ' + player.fee + 'M'}`)}
            className="flex-1 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all bg-[#e21b4d]/10 border border-[#e21b4d]/30 hover:bg-[#e21b4d]/20 text-[#e21b4d] flex items-center justify-center gap-2"
          >
            <Icon name="send" size={14} />
            Anfrage stellen
          </button>
        </div>
      </div>
    </div>
  );
};

// ---- MAIN COMPONENT ----
const CfoBoard = ({ truthObject, setTruthObject, activeRole }) => {
  const [activeTab, setActiveTab] = useState('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPos, setSelectedPos] = useState('ALL');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [watchlist, setWatchlist] = useState(() => {
    try { return JSON.parse(localStorage.getItem('gerd_watchlist') || '[]'); }
    catch { return []; }
  });
  const [aiScoutLoading, setAiScoutLoading] = useState(false);
  const [scoutReports, setScoutReports] = useState({});
  const [aiSearchQuery, setAiSearchQuery] = useState('');
  const [aiSearchLoading, setAiSearchLoading] = useState(false);
  const [aiSearchResult, setAiSearchResult] = useState(null);
  const [budgetInfo, setBudgetInfo] = useState(null);
  const [sortBy, setSortBy] = useState('ovr');
  const [clubIdScore, setClubIdScore] = useState(null);
  const [identityLoading, setIdentityLoading] = useState(false);

  // Save watchlist to localStorage
  useEffect(() => {
    localStorage.setItem('gerd_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  // Calculate budget
  useEffect(() => {
    const budget = truthObject?.financials?.current_budget || 25000000;
    setBudgetInfo({
      total: budget,
      spent: watchlist.reduce((acc, p) => acc + (p.fee * 1000000 || 0), 0),
    });
  }, [truthObject, watchlist]);

  // Filter logic
  const filteredPlayers = MOCK_TM_DATABASE
    .filter(p => {
      const matchesSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.pos.toLowerCase().includes(searchQuery.toLowerCase()) || p.club.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPos = selectedPos === 'ALL' || p.pos === selectedPos;

      if (activeTab === 'search') return matchesSearch && matchesPos;
      if (activeTab === 'free_agents') return (p.fee === 0 || p.contract_end === 'Frei') && matchesSearch && matchesPos;
      if (activeTab === 'expiring') return ['2025', '2026'].includes(p.contract_end) && matchesSearch && matchesPos;
      if (activeTab === 'clauses') return p.tags?.some(t => t.includes('Ausstieg')) && matchesSearch && matchesPos;
      if (activeTab === 'watchlist') return watchlist.some(w => w.id === p.id) && matchesSearch && matchesPos;
      return matchesSearch && matchesPos;
    })
    .sort((a, b) => {
      if (sortBy === 'ovr') return b.ovr - a.ovr;
      if (sortBy === 'pot') return b.pot - a.pot;
      if (sortBy === 'fee') return a.fee - b.fee;
      if (sortBy === 'age') return a.age - b.age;
      return 0;
    });

  const handleAddToWatchlist = (player) => {
    setWatchlist(prev => {
      const exists = prev.some(p => p.id === player.id);
      return exists ? prev.filter(p => p.id !== player.id) : [...prev, player];
    });
  };

  const handleAiScout = async (player) => {
    setAiScoutLoading(true);
    try {
      const budget = truthObject?.financials?.current_budget || 25000000;
      const clubName = truthObject?.club_info?.name || 'Stark Elite';
      const prompt = `Du bist GERD 2.0, der weltweit führende KI-Fußball-Scout auf Niveau Julian Nagelsmann.
Erstelle ein VERTRAULICHES Scouting-Dossier für den Vereinsvorstand von "${clubName}" über folgenden Spieler:

SPIELER-PROFIL:
- Name: ${player.name}
- Position: ${player.pos} (${POSITION_GROUPS[player.pos]?.label || player.pos})
- Alter: ${player.age} | Nationalität: ${player.nation}
- Aktueller Verein: ${player.club}
- OVR: ${player.ovr}/100 | Potenzial: ${player.pot}/100
- Attribute: PAC ${player.pac} | SHO ${player.sho} | PAS ${player.pas} | DRI ${player.dri} | DEF ${player.def} | PHY ${player.phy}
- Ablösesumme: ${player.fee === 0 ? 'Freier Transfer' : '€ ' + player.fee + 'M'}
- Jahresgehalt: € ${player.salary}M
- Vertragsende: ${player.contract_end}
- Formkurve: ${player.form}
- Tags: ${player.tags?.join(', ')}

Unser Budget: € ${(budget / 1000000).toFixed(1)}M

Gib eine präzise Analyse (max 200 Wörter) mit:
1. 💎 PROFIL-URTEIL: Passt er zu uns? Warum?
2. ⚠️ RISIKO-ANALYSE: Was sind die Stolpersteine?
3. 💰 TRANSFER-EMPFEHLUNG: Konkrete Strategie (Ablöse, Gehalt, Verhandlungsposition)
4. 🧬 TAKTISCHER FIT: Wie integriert er sich in unser System?

Tonfall: Direkt, analytisch, keine Floskeln. Wie ein Elite-Sportdirektor.`;

      const result = await sendAiRequest(prompt);
      setScoutReports(prev => ({ ...prev, [player.id]: result }));
    } catch (err) {
      setScoutReports(prev => ({ ...prev, [player.id]: `❌ GERD 2.0 Fehler: ${err.message}` }));
    } finally {
      setAiScoutLoading(false);
    }
  };

  const handleAiSearch = async () => {
    if (!aiSearchQuery.trim()) return;
    setAiSearchLoading(true);
    setAiSearchResult(null);
    try {
      const clubName = truthObject?.club_info?.name || 'Stark Elite';
      const budget = truthObject?.financials?.current_budget || 25000000;
      const prompt = `Du bist GERD 2.0 — weltbester KI-Transfer-Analyst. 

Der Verein "${clubName}" mit einem Budget von €${(budget/1000000).toFixed(0)}M stellt folgende Transferanfrage:
"${aiSearchQuery}"

Analysiere diese Anfrage und gib eine professionelle Antwort mit:
- 3 konkreten Spieler-Empfehlungen (mit realistischen Namen aus dem Weltfußball)
- Für jeden Spieler: Alter, Verein, geschätzte Ablöse, taktischer Nutzen
- Eine abschließende Transferstrategie-Empfehlung

Format: Markdown mit Emojis. Präzise, keine Floskeln. Auf Deutsch.`;

      const result = await sendAiRequest(prompt);
      setAiSearchResult(result);
    } catch (err) {
      setAiSearchResult(`❌ GERD 2.0 Fehler: ${err.message}\n\nBitte prüfen Sie den Proxy (Port 3001) oder Ihren Gemini API-Schlüssel.`);
    } finally {
      setAiSearchLoading(false);
    }
  };

  const handleClubIdentityAnalysis = async () => {
    setIdentityLoading(true);
    try {
      const club = truthObject?.club_info;
      const prompt = `Du bist ein Elite-Sportdirektor und Club-Identitäts-Experte.

Analysiere die Club-Identität von "${club?.name || 'Stark Elite'}":
- Liga: ${club?.league || 'Unbekannt'}
- Philosophie: ${club?.philosophy || 'Nicht definiert'}
- Aktuelle Spielerzahl: ${truthObject?.players?.length || 0}
- NLZ-Spieler: ${truthObject?.nlz_squad?.length || 0}
- Formation Heim: ${truthObject?.tactical_setup?.formation_home || '4-4-2'}

Bewerte die Club-Identität in diesen Kategorien (0-100 Punkte):
1. Spielphilosophie-Konsistenz
2. Kader-Passgenauigkeit  
3. NLZ-Ausrichtung
4. Taktische Identität
5. Langfristige Planung

Antworte als JSON:
{
  "gesamtscore": 85,
  "kategorien": [
    {"name": "Spielphilosophie", "score": 90, "feedback": "..."},
    {"name": "Kader-Passung", "score": 82, "feedback": "..."},
    {"name": "NLZ-Ausrichtung", "score": 88, "feedback": "..."},
    {"name": "Taktik", "score": 84, "feedback": "..."},
    {"name": "Langfristplanung", "score": 81, "feedback": "..."}
  ],
  "hauptempfehlung": "...",
  "sofortmaßnahmen": ["...", "...", "..."]
}`;

      const result = await sendAiRequest(prompt);
      let parsed;
      try {
        const clean = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        parsed = JSON.parse(clean);
      } catch {
        parsed = { gesamtscore: 75, kategorien: [], hauptempfehlung: result, sofortmaßnahmen: [] };
      }
      setClubIdScore(parsed);
    } catch (err) {
      setClubIdScore({ gesamtscore: 0, error: err.message });
    } finally {
      setIdentityLoading(false);
    }
  };

  const budget = budgetInfo?.total || 25000000;
  const spent = watchlist.reduce((acc, p) => acc + (p.fee * 1000000 || 0), 0);
  const remaining = budget - spent;
  const budgetPct = Math.min(100, (spent / budget) * 100);

  const TABS = [
    { id: 'search', label: 'Spielersuche', icon: 'search', color: 'white' },
    { id: 'free_agents', label: 'Vereinslose', icon: 'user-x', color: 'neon' },
    { id: 'expiring', label: 'Vertragsende', icon: 'clock', color: 'redbull' },
    { id: 'clauses', label: 'Ausstieg', icon: 'unlock', color: 'gold' },
    { id: 'watchlist', label: `Watchlist (${watchlist.length})`, icon: 'star', color: 'gold' },
    { id: 'ai_search', label: 'KI-Suche', icon: 'cpu', color: 'neon' },
    { id: 'club_identity', label: 'Club DNA', icon: 'fingerprint', color: 'gold' },
  ];

  const colorMap = {
    white: { active: 'bg-white text-black border-white', text: 'text-white', glow: '#ffffff' },
    neon: { active: 'bg-[#00f3ff] text-black border-[#00f3ff]', text: 'text-[#00f3ff]', glow: '#00f3ff' },
    redbull: { active: 'bg-[#e21b4d] text-white border-[#e21b4d]', text: 'text-[#e21b4d]', glow: '#e21b4d' },
    gold: { active: 'bg-[#d4af37] text-black border-[#d4af37]', text: 'text-[#d4af37]', glow: '#d4af37' },
  };

  return (
    <div className="space-y-6 animate-fade-in pb-24">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center">
            <Icon name="globe" size={22} className="text-[#d4af37]" />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter text-white">
              Transfermarkt <span className="text-[#00f3ff]">2.5</span>
            </h1>
            <p className="text-[10px] text-white/40 font-mono uppercase tracking-widest">
              AI CORE ACTIVE · CLUB IDENTITY ENGINE · GERD 2.0
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#00f3ff]/10 border border-[#00f3ff]/20">
            <div className="w-2 h-2 rounded-full bg-[#00f3ff] animate-pulse" />
            <span className="text-[10px] font-black text-[#00f3ff] uppercase tracking-widest">LIVE</span>
          </div>
        </div>
      </div>

      {/* Budget Overview */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Gesamtbudget', value: `€ ${(budget / 1000000).toFixed(0)}M`, color: '#d4af37', icon: 'wallet' },
          { label: 'Watchlist-Total', value: `€ ${(spent / 1000000).toFixed(0)}M`, color: '#e21b4d', icon: 'shopping-cart' },
          { label: 'Verfügbar', value: `€ ${(remaining / 1000000).toFixed(0)}M`, color: '#22c55e', icon: 'trending-up' },
        ].map(item => (
          <div key={item.label} className="glass-panel p-4">
            <div className="flex items-center gap-2 mb-1">
              <Icon name={item.icon} size={14} style={{ color: item.color }} />
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-black">{item.label}</span>
            </div>
            <div className="text-xl font-black" style={{ color: item.color }}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* Budget Bar */}
      <div className="glass-panel p-4">
        <div className="flex justify-between text-[10px] text-white/40 font-mono mb-2">
          <span>TRANSFERBUDGET AUSLASTUNG</span>
          <span>{budgetPct.toFixed(1)}%</span>
        </div>
        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${budgetPct}%`,
              background: budgetPct > 80 ? '#e21b4d' : budgetPct > 50 ? '#f59e0b' : '#22c55e',
            }}
          />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2">
        {TABS.map(tab => {
          const colors = colorMap[tab.color];
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all border ${
                isActive ? colors.active : `bg-black/40 border-white/10 hover:border-white/30 ${colors.text}`
              }`}
              style={isActive ? { boxShadow: `0 0 20px ${colors.glow}40` } : {}}
            >
              <Icon name={tab.icon} size={13} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* AI Search Tab */}
      {activeTab === 'ai_search' && (
        <div className="space-y-4 animate-fade-in">
          <div className="glass-panel-neon p-6">
            <div className="flex items-center gap-3 mb-4">
              <Icon name="cpu" size={20} className="text-[#00f3ff]" />
              <div>
                <h3 className="font-black text-white uppercase tracking-tighter">GERD 2.0 — KI-Transfersuche</h3>
                <p className="text-[10px] text-white/40 font-mono">Beschreibe, was du suchst — GERD analysiert den Weltmarkt</p>
              </div>
            </div>
            <div className="flex gap-3">
              <input
                type="text"
                value={aiSearchQuery}
                onChange={e => setAiSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAiSearch()}
                placeholder="z.B. 'Schneller Linksaußen unter 25, max €40M Ablöse' oder 'Freier Innenverteidiger mit Führungsstärke'"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm placeholder-white/20 focus:outline-none focus:border-[#00f3ff] transition-all"
              />
              <button
                onClick={handleAiSearch}
                disabled={aiSearchLoading}
                className="px-6 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all bg-[#00f3ff]/20 border border-[#00f3ff]/40 hover:bg-[#00f3ff]/30 text-[#00f3ff] flex items-center gap-2 disabled:opacity-50"
              >
                {aiSearchLoading ? <div className="w-4 h-4 border-2 border-[#00f3ff]/30 border-t-[#00f3ff] rounded-full animate-spin" /> : <Icon name="search" size={14} />}
                {aiSearchLoading ? 'Suche...' : 'Suchen'}
              </button>
            </div>

            {/* Quick prompts */}
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                'Vereinsloser Torwart Weltklasse',
                'Günstige Bundesliga-Innenverteidiger',
                'Bestes Talent unter 21 Jahren',
                'Freier Transfer ZDM mit Erfahrung',
              ].map(prompt => (
                <button
                  key={prompt}
                  onClick={() => { setAiSearchQuery(prompt); }}
                  className="px-3 py-1.5 rounded-lg text-[10px] font-black text-white/50 border border-white/10 hover:border-[#00f3ff]/40 hover:text-[#00f3ff] transition-all"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {aiSearchResult && (
            <div className="glass-panel p-6 border-[#00f3ff]/20">
              <div className="flex items-center gap-2 mb-4">
                <Icon name="cpu" size={16} className="text-[#00f3ff]" />
                <span className="text-[11px] font-black uppercase tracking-widest text-[#00f3ff]">GERD 2.0 ANALYSE</span>
              </div>
              <div className="text-white/80 text-sm font-mono leading-relaxed whitespace-pre-line">{aiSearchResult}</div>
            </div>
          )}
        </div>
      )}

      {/* Club Identity Tab */}
      {activeTab === 'club_identity' && (
        <div className="space-y-4 animate-fade-in">
          <div className="glass-panel-gold p-6">
            <div className="flex items-center gap-3 mb-4">
              <Icon name="fingerprint" size={22} className="text-[#d4af37]" />
              <div>
                <h3 className="font-black text-white uppercase tracking-tighter">Club DNA & Identity Score V2.5</h3>
                <p className="text-[10px] text-white/40 font-mono">KI-basierte Vereinsidentitäts-Analyse · GERD 2.0 Engine</p>
              </div>
            </div>

            {/* Club Info Preview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              {[
                { label: 'Verein', value: truthObject?.club_info?.name || 'N/A' },
                { label: 'Liga', value: truthObject?.club_info?.league || 'N/A' },
                { label: 'Formation', value: truthObject?.tactical_setup?.formation_home || '4-4-2' },
                { label: 'NLZ-Spieler', value: truthObject?.nlz_squad?.length || 0 },
              ].map(item => (
                <div key={item.label} className="bg-white/5 rounded-xl p-3 border border-white/10">
                  <div className="text-[10px] text-white/30 uppercase tracking-widest font-black">{item.label}</div>
                  <div className="text-white font-black mt-1">{item.value}</div>
                </div>
              ))}
            </div>

            <button
              onClick={handleClubIdentityAnalysis}
              disabled={identityLoading}
              className="w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all bg-[#d4af37]/20 border border-[#d4af37]/40 hover:bg-[#d4af37]/30 text-[#d4af37] flex items-center justify-center gap-3"
            >
              {identityLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-[#d4af37]/30 border-t-[#d4af37] rounded-full animate-spin" />
                  GERD 2.0 analysiert Club-DNA...
                </>
              ) : (
                <>
                  <Icon name="cpu" size={16} />
                  Club-DNA Analyse starten
                </>
              )}
            </button>
          </div>

          {/* Results */}
          {clubIdScore && !clubIdScore.error && (
            <div className="animate-fade-in space-y-4">
              {/* Overall Score */}
              <div className="glass-panel p-6 text-center border-[#d4af37]/20">
                <div className="text-6xl font-black text-[#d4af37] mb-2">{clubIdScore.gesamtscore}</div>
                <div className="text-[11px] text-white/40 uppercase tracking-widest font-black">Club Identity Score</div>
                <div className="mt-3 text-white/70 text-sm font-mono leading-relaxed">{clubIdScore.hauptempfehlung}</div>
              </div>

              {/* Category breakdown */}
              {clubIdScore.kategorien?.length > 0 && (
                <div className="glass-panel p-5 border-[#d4af37]/20">
                  <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4">Kategorien-Analyse</h4>
                  <div className="space-y-4">
                    {clubIdScore.kategorien.map(kat => (
                      <div key={kat.name}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-black text-white/70 uppercase tracking-widest">{kat.name}</span>
                          <span className="text-sm font-black text-[#d4af37]">{kat.score}/100</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/10 overflow-hidden mb-1">
                          <div
                            className="h-full rounded-full transition-all duration-1000"
                            style={{
                              width: `${kat.score}%`,
                              background: kat.score >= 85 ? '#22c55e' : kat.score >= 70 ? '#d4af37' : '#e21b4d'
                            }}
                          />
                        </div>
                        <p className="text-[10px] text-white/40 font-mono">{kat.feedback}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sofortmaßnahmen */}
              {clubIdScore.sofortmaßnahmen?.length > 0 && (
                <div className="glass-panel-redbull p-5">
                  <h4 className="text-[10px] font-black text-[#e21b4d] uppercase tracking-widest mb-3">⚡ Sofortmaßnahmen</h4>
                  <div className="space-y-2">
                    {clubIdScore.sofortmaßnahmen.map((m, i) => (
                      <div key={i} className="flex items-start gap-3 text-sm text-white/70 font-mono">
                        <span className="text-[#e21b4d] font-black">{i + 1}.</span>
                        {m}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {clubIdScore?.error && (
            <div className="glass-panel-redbull p-4 text-[#e21b4d] text-sm font-mono">
              ❌ Analyse fehlgeschlagen: {clubIdScore.error}
            </div>
          )}
        </div>
      )}

      {/* Player List Tabs */}
      {!['ai_search', 'club_identity'].includes(activeTab) && (
        <>
          {/* Search & Filter Bar */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Icon name="search" size={16} className="text-white/30" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Spieler, Position, Verein..."
                className="w-full bg-black/60 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white font-mono text-sm placeholder-white/20 focus:outline-none focus:border-[#00f3ff]/50 transition-all"
              />
            </div>
            <select
              value={selectedPos}
              onChange={e => setSelectedPos(e.target.value)}
              className="bg-black/60 border border-white/10 rounded-xl py-3 px-4 text-white font-mono text-sm focus:outline-none focus:border-[#00f3ff]/50 transition-all"
            >
              <option value="ALL">Alle Positionen</option>
              {Object.entries(POSITION_GROUPS).map(([k, v]) => (
                <option key={k} value={k}>{k} — {v.label}</option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="bg-black/60 border border-white/10 rounded-xl py-3 px-4 text-white font-mono text-sm focus:outline-none focus:border-[#00f3ff]/50 transition-all"
            >
              <option value="ovr">Sortiert: OVR</option>
              <option value="pot">Sortiert: Potenzial</option>
              <option value="fee">Sortiert: Ablöse (↑)</option>
              <option value="age">Sortiert: Alter (↑)</option>
            </select>
          </div>

          {/* Results Count */}
          <div className="text-[11px] text-white/30 font-mono">
            {filteredPlayers.length} Spieler gefunden · Datenbank: {MOCK_TM_DATABASE.length} Weltklasse-Spieler
          </div>

          {/* Player Grid */}
          <div className="grid grid-cols-1 gap-3">
            {filteredPlayers.length === 0 ? (
              <div className="glass-panel p-16 text-center">
                <Icon name="search" size={40} className="text-white/20 mx-auto mb-3" />
                <p className="text-white/30 font-mono text-sm">Keine Spieler gefunden</p>
              </div>
            ) : (
              filteredPlayers.map(player => {
                const posColor = POSITION_GROUPS[player.pos]?.color || '#00f3ff';
                const isWatchlisted = watchlist.some(w => w.id === player.id);
                const overallColor = player.ovr >= 90 ? '#d4af37' : player.ovr >= 85 ? '#00f3ff' : '#a0a0a0';

                return (
                  <div
                    key={player.id}
                    className="glass-panel p-4 cursor-pointer hover:border-white/20 transition-all group"
                    onClick={() => setSelectedPlayer(player)}
                    style={{ '--pos-color': posColor }}
                  >
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black shrink-0 border transition-all group-hover:scale-110"
                        style={{ background: `${posColor}15`, borderColor: `${posColor}40` }}
                      >
                        {player.nation}
                      </div>

                      {/* Main Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black text-white text-base uppercase tracking-tight">{player.name}</span>
                          <span
                            className="px-2 py-0.5 rounded text-[9px] font-black uppercase"
                            style={{ background: `${posColor}25`, color: posColor }}
                          >
                            {player.pos}
                          </span>
                          {player.fee === 0 && (
                            <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-[#22c55e]/20 text-[#22c55e]">FREE</span>
                          )}
                          {['2025', '2026', 'Frei'].includes(player.contract_end) && (
                            <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-[#f59e0b]/20 text-[#f59e0b]">⚠️ {player.contract_end}</span>
                          )}
                        </div>
                        <div className="text-xs text-white/40 font-mono mt-0.5">
                          {player.club} · {player.age}J. · {player.foot}fuß · {player.height}
                        </div>
                        {/* Mini stats */}
                        <div className="flex gap-3 mt-2">
                          {['pac', 'sho', 'pas', 'dri', 'def', 'phy'].map(stat => (
                            <div key={stat} className="text-center">
                              <div className="text-[10px] text-white/30 font-mono uppercase">{stat}</div>
                              <div className="text-xs font-black text-white/70">{player[stat]}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* OVR + Price */}
                      <div className="text-right shrink-0 space-y-1">
                        <div className="text-3xl font-black" style={{ color: overallColor }}>{player.ovr}</div>
                        <div className="text-[10px] text-white/30 font-mono">POT {player.pot}</div>
                        <div className="text-sm font-black text-[#d4af37]">{player.fee === 0 ? 'Frei' : `€${player.fee}M`}</div>
                      </div>

                      {/* Watchlist btn */}
                      <button
                        onClick={e => { e.stopPropagation(); handleAddToWatchlist(player); }}
                        className={`ml-2 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                          isWatchlisted
                            ? 'bg-[#d4af37]/20 border border-[#d4af37]/60 text-[#d4af37]'
                            : 'bg-white/5 border border-white/10 text-white/30 hover:border-[#d4af37]/40 hover:text-[#d4af37]'
                        }`}
                      >
                        <Icon name="star" size={14} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {/* Player Detail Modal */}
      {selectedPlayer && (
        <PlayerDetailModal
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
          onAddToWatchlist={handleAddToWatchlist}
          onAiScout={handleAiScout}
          isScoutLoading={aiScoutLoading}
          scoutReport={scoutReports[selectedPlayer?.id]}
        />
      )}
    </div>
  );
};

export default CfoBoard;
