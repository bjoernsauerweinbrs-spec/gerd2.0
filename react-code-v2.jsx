const { useState, useEffect, useRef, Component } = React;

class GlobalErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("GerdOS Global Crash:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8 text-center font-mono">
          <div className="text-red-500 mb-6">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          </div>
          <h1 className="text-4xl font-black uppercase tracking-widest text-red-500 mb-4">SYSTEM CRASH DETECTED</h1>
          <p className="text-white/60 mb-8 max-w-lg">
            Ein kritischer Render-Fehler ist aufgetreten (vermutlich defektes JSON oder zu gro&szlig;e Bild-URL im LocalStorage). Das System musste angehalten werden.
          </p>
          <button 
            onClick={() => {
              localStorage.removeItem("gerd_truthObject");
              window.location.reload();
            }}
            className="px-8 py-4 bg-neon text-black font-black uppercase tracking-widest text-sm hover:scale-105 transition-transform"
          >
            Force Reboot & Reset Data
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- HILFSKOMPONENTEN ---
// Sicherer Wrapper für Lucide Icons in React ohne DOM-Konflikte
const Icon = ({ name, size = 20, className = "" }) => {
  const iconRef = useRef(null);

  useEffect(() => {
    if (iconRef.current && window.lucide) {
      iconRef.current.innerHTML = `<i data-lucide="${name}" class="${className}" style="width:${size}px; height:${size}px"></i>`;
      window.lucide.createIcons({ root: iconRef.current });
    }
  }, [name, size, className]);

  return (
    <span
      ref={iconRef}
      className="inline-flex items-center justify-center"
    ></span>
  );
};

const NeuralBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    let particles = [];
    const particleCount = 60;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    class Particle {
      constructor() {
        this.init();
      }
      init() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 1.5 + 0.5;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0, 243, 255, 0.3)";
        ctx.fill();
      }
    }

    const setup = () => {
      resize();
      particles = Array.from(
        { length: particleCount },
        () => new Particle(),
      );
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, i) => {
        p.update();
        p.draw();
        // Connections
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(0, 243, 255, ${0.1 * (1 - dist / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    setup();
    animate();
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} id="neural-canvas" />;
};

// --- SOUL RADAR COMPONENT (PHASE 11) ---
// --- AI AD GENERATOR & SPONSORING COMPONENTS (PHASE 12) ---
const AIAdGenerator = ({ logo, claim, sponsorName, type = "FULL_PAGE" }) => {
  // Simulates a "Red Bulletin" style filter and layout for sponsor content
  return (
    <div className={`relative overflow-hidden group ${type === "FULL_PAGE" ? "h-full w-full bg-black" : "h-32 bg-white border-y border-black/10"}`}>
      {/* Dynamic Background Filter */}
      <div className="absolute inset-0 z-0 opacity-40 mix-blend-overlay">
        <div className="absolute inset-0 bg-gradient-to-tr from-redbull via-transparent to-black"></div>
      </div>

      <div className="relative z-10 h-full flex flex-col items-center justify-center p-8 text-center">
        {logo ? (
          <img src={logo} alt={sponsorName} className="max-w-[200px] max-h-[100px] object-contain mb-6 grayscale hover:grayscale-0 transition-all duration-700 brightness-150" />
        ) : (
          <div className="text-4xl font-black italic text-white/20 mb-6 tracking-tighter uppercase">{sponsorName}</div>
        )}

        <h3 className={`font-black uppercase italic tracking-tighter text-white ${type === "FULL_PAGE" ? "text-5xl" : "text-xl"}`}>
          {claim || "Präzision & Power für das Team."}
        </h3>

        {type === "FULL_PAGE" && (
          <div className="mt-8 pt-8 border-t border-white/20">
            <p className="text-[10px] font-serif italic text-white/60 max-w-md mx-auto">
              Exklusiver Premium-Partner von Gerd 2.0. Wir unterstützen die Resilienz und den Charakter der nächsten Champion-Generation.
            </p>
          </div>
        )}
      </div>

      {/* Corporate Identity Accents */}
      <div className="absolute bottom-4 right-4 text-[8px] font-black uppercase tracking-[0.3em] text-white/20">
        Authentic Partnership // Gerd 2.0 Refinanced
      </div>
    </div>
  );
};

const PerformanceBanderole = ({ sponsor }) => {
  if (!sponsor) return null;
  return (
    <div className="w-full bg-black text-white h-12 flex items-center justify-between px-6 border-y border-redbull/30 overflow-hidden relative">
      <div className="absolute inset-y-0 left-0 w-1 bg-redbull"></div>
      <div className="text-[9px] font-black uppercase tracking-widest flex items-center gap-4">
        <Icon name="zap" size={14} className="text-redbull animate-pulse" />
        {sponsor.claim}
      </div>
      <div className="flex items-center gap-4">
        <span className="text-[8px] font-mono text-white/40">Official Tech Partner:</span>
        <span className="text-[10px] font-black italic text-gold">{sponsor.name}</span>
      </div>
    </div>
  );
};

const PremiumPartnerAd = ({ sponsor, oppositeContent }) => {
  if (!sponsor) return null;
  return (
    <div className="h-screen bg-black flex flex-col border-r-[20px] border-black">
      <AIAdGenerator
        logo={sponsor.logo}
        claim={sponsor.claim}
        sponsorName={sponsor.name}
        type="FULL_PAGE"
      />
      <div className="bg-redbull text-white p-6">
        <p className="text-[9px] font-black uppercase tracking-widest leading-normal">
          Kontextuelle Synergie: {oppositeContent} wird unterstützt durch die Zuverlässigkeit von {sponsor.name}. Gemeinsam definieren wir die Grenzen des Möglichen neu.
        </p>
      </div>
    </div>
  );
};

const SocialCard = ({ slideIndex, title, subline, icon = "zap", color = "#e21b4d" }) => {
  return (
    <div className="aspect-square bg-black p-4 flex flex-col justify-between relative overflow-hidden group border border-white/5">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-black to-redbull/20 opacity-40"></div>
      <div className="relative z-10 flex justify-between items-start">
        <div className="text-[8px] font-black uppercase tracking-widest text-white/40">Gerd 2.0 // Issue 01</div>
        <div className="bg-white/10 p-1 rounded">
          <Icon name={icon} size={10} className="text-white" />
        </div>
      </div>

      <div className="relative z-10">
        <h4 className="text-[12px] font-black uppercase italic tracking-tighter text-white leading-tight mb-1">{title}</h4>
        <p className="text-[7px] font-mono text-white/50 uppercase tracking-widest">{subline}</p>
      </div>

      <div className="relative z-10 flex items-center justify-between mt-auto">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className={`w-1 h-1 rounded-full ${i === slideIndex ? "bg-redbull" : "bg-white/20"}`}></div>
          ))}
        </div>
        <div className="text-[6px] font-black text-white/20 uppercase">stark elite</div>
      </div>

      {/* Decorative pulse */}
      <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-redbull/10 rounded-full blur-xl group-hover:bg-redbull/30 transition-all"></div>
    </div>
  );
};

const SoulRadar = ({ stats, size = 200, color = "#E21B4D" }) => {
  const categories = ["Resilience", "Sacrifice", "Coolness", "Aggression", "Leadership"];
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = (size / 2) * 0.8;

  const getPoint = (i, value) => {
    const angle = (Math.PI * 2 * i) / categories.length - Math.PI / 2;
    const x = centerX + radius * (value / 100) * Math.cos(angle);
    const y = centerY + radius * (value / 100) * Math.sin(angle);
    return `${x},${y}`;
  };

  const points = categories.map((cat, i) => getPoint(i, stats[cat.toLowerCase()] || 70)).join(" ");

  return (
    <div className="relative flex flex-col items-center">
      <svg width={size} height={size} className="drop-shadow-[0_0_15px_rgba(226,27,77,0.4)]">
        {/* Background Pentagons */}
        {[20, 40, 60, 80, 100].map((v) => (
          <polygon
            key={v}
            points={categories.map((_, i) => getPoint(i, v)).join(" ")}
            fill="none"
            stroke="rgba(0,0,0,0.1)"
            strokeWidth="1"
          />
        ))}
        {/* Axis */}
        {categories.map((_, i) => (
          <line
            key={i}
            x1={centerX}
            y1={centerY}
            x2={getPoint(i, 100).split(",")[0]}
            y2={getPoint(i, 100).split(",")[1]}
            stroke="rgba(0,0,0,0.05)"
            strokeWidth="1"
          />
        ))}
        {/* Data Polygon */}
        <polygon
          points={points}
          fill={`${color}33`}
          stroke={color}
          strokeWidth="3"
          className="animate-pulse"
        />
        {/* Points */}
        {categories.map((cat, i) => {
          const [px, py] = getPoint(i, stats[cat.toLowerCase()] || 70).split(",");
          return <circle key={i} cx={px} cy={py} r="4" fill={color} />;
        })}
      </svg>
      {/* Labels */}
      <div className="absolute inset-0 pointer-events-none">
        {categories.map((cat, i) => {
          const [px, py] = getPoint(i, 115).split(",");
          return (
            <div
              key={cat}
              className="absolute text-[8px] font-black uppercase tracking-tighter text-black/50"
              style={{ left: `${px}px`, top: `${py}px`, transform: 'translate(-50%, -50%)' }}
            >
              {cat}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const QuotaWidget = () => {
  const [quota, setQuota] = useState({
    rpm_current: 0,
    rpm_limit: 15,
    percentage: 0,
    status: "stable",
  });
  const colorClass =
    quota.percentage > 80
      ? "bg-redbull shadow-[0_0_10px_rgba(226,27,77,0.5)]"
      : quota.percentage > 50
        ? "bg-gold"
        : "bg-neon shadow-[0_0_10px_rgba(0,243,255,0.5)]";

  useEffect(() => {
    const fetchQuota = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/quota");
        const data = await res.json();
        if (data.ok) setQuota(data);
      } catch (e) {
        console.error("Quota fetch failed");
      }
    };
    fetchQuota();
    const interval = setInterval(fetchQuota, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-[10px] font-mono text-white/60">
        <span>
          LOAD: {quota.rpm_current} / {quota.rpm_limit} RPM
        </span>
        <span
          className={
            quota.status === "warning" ? "text-red-500" : "text-neon"
          }
        >
          {quota.percentage}%
        </span>
      </div>
      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/10">
        <div
          className={`h-full transition-all duration-500 ${colorClass}`}
          style={{ width: `${quota.percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

const NeuralInsightFeed = ({ logs }) => {
  return (
    <div className="mt-6 flex-1 flex flex-col min-h-0 border-t border-white/5 pt-4">
      <div className="flex items-center justify-between mb-4">
        <div className="text-[10px] font-black uppercase tracking-widest text-[#00f3ff] flex items-center gap-2">
          <Icon name="brain-circuit" size={12} /> Neural Insight Feed
        </div>
        <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></div>
      </div>
      <div className="flex-1 overflow-y-auto space-y-3 font-mono text-[9px] leading-tight pr-2 scrollbar-hide">
        {logs.map((log) => (
          <div
            key={log.id}
            className="group border-l border-white/10 pl-3 hover:border-[#00f3ff] transition-colors"
          >
            <div className="flex justify-between text-white/40 mb-1 group-hover:text-[#00f3ff]/60 transition-colors">
              <span className="uppercase">{log.type}</span>
              <span>{log.time}</span>
            </div>
            <div className="text-white/80 group-hover:text-white transition-colors">
              {log.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- DATEN & LOGIK (MOCK) ---
const initialPlayers = [
  {
    id: 99,
    name: "Lukas Berg (C)",
    position: "IV",
    photo: null,
    ovr: 89,
    readiness: 94,
    isInjured: false,
    rating: 9.1,
    pac: 84,
    intensity: 94,
    sprint_speed: 88,
    mental_resilience: 95, // Legacy support
    resilience: 95,
    sacrifice: 92,
    coolness: 88,
    aggression: 84,
    leadership: 90,
    sho: 60,
    pas: 85,
    dri: 75,
    def: 92,
    phy: 90,
  },
  {
    id: 1,
    name: "Muster-TW",
    photo: null,
    ovr: 85,
    readiness: 95,
    isInjured: false,
    rating: 8.5,
    pac: 80,
    intensity: 75,
    sprint_speed: 78,
    mental_resilience: 92,
    resilience: 92,
    sacrifice: 80,
    coolness: 90,
    aggression: 40,
    leadership: 85,
    sho: 40,
    pas: 75,
    dri: 60,
    def: 85,
    phy: 80,
  },
  {
    id: 2,
    name: "Muster-IV 1",
    position: "IV",
    ovr: 82,
    readiness: 90,
    isInjured: false,
    rating: 7.2,
    pac: 75,
    intensity: 85,
    sprint_speed: 82,
    mental_resilience: 88,
    sho: 50,
    pas: 70,
    dri: 65,
    def: 84,
    phy: 88,
  },
  {
    id: 3,
    name: "Muster-IV 2",
    position: "IV",
    ovr: 84,
    readiness: 88,
    isInjured: false,
    rating: 7.5,
    pac: 72,
    intensity: 88,
    sprint_speed: 78,
    mental_resilience: 94,
    sho: 55,
    pas: 82,
    dri: 70,
    def: 90,
    phy: 85,
  },
  {
    id: 4,
    name: "Muster-AV L",
    position: "LB",
    ovr: 80,
    readiness: 92,
    isInjured: false,
    rating: 7.8,
    pac: 92,
    intensity: 94,
    sprint_speed: 96,
    mental_resilience: 85,
    sho: 60,
    pas: 78,
    dri: 80,
    def: 75,
    phy: 72,
  },
  {
    id: 5,
    name: "Muster-AV R",
    position: "RB",
    ovr: 80,
    readiness: 95,
    isInjured: false,
    rating: 7.9,
    pac: 90,
    intensity: 92,
    sprint_speed: 94,
    mental_resilience: 80,
    sho: 62,
    pas: 80,
    dri: 78,
    def: 72,
    phy: 70,
  },
  {
    id: 6,
    name: "Muster-ZM 1",
    position: "CM",
    ovr: 86,
    readiness: 85,
    isInjured: false,
    rating: 8.8,
    pac: 70,
    intensity: 85,
    sprint_speed: 72,
    mental_resilience: 95,
    sho: 75,
    pas: 92,
    dri: 85,
    def: 80,
    phy: 78,
  },
  {
    id: 7,
    name: "Muster-ZM 2",
    position: "CM",
    ovr: 84,
    readiness: 82,
    isInjured: false,
    rating: 8.2,
    pac: 75,
    intensity: 90,
    sprint_speed: 75,
    mental_resilience: 88,
    sho: 80,
    pas: 85,
    dri: 78,
    def: 78,
    phy: 88,
  },
  {
    id: 8,
    name: "Muster-LM",
    position: "LM",
    ovr: 83,
    readiness: 80,
    isInjured: false,
    rating: 8.0,
    pac: 95,
    intensity: 96,
    sprint_speed: 98,
    mental_resilience: 78,
    sho: 78,
    pas: 82,
    dri: 88,
    def: 40,
    phy: 65,
  },
  {
    id: 9,
    name: "Muster-RM",
    position: "RM",
    ovr: 81,
    readiness: 90,
    isInjured: false,
    rating: 7.6,
    pac: 85,
    intensity: 90,
    sprint_speed: 92,
    mental_resilience: 82,
    sho: 72,
    pas: 80,
    dri: 92,
    def: 30,
    phy: 55,
  },
  {
    id: 10,
    name: "Muster-ST 1",
    position: "ST",
    ovr: 87,
    readiness: 88,
    isInjured: false,
    rating: 9.2,
    pac: 82,
    intensity: 95,
    sprint_speed: 90,
    mental_resilience: 96,
    sho: 94,
    pas: 75,
    dri: 80,
    def: 35,
    phy: 78,
  },
  {
    id: 11,
    name: "Muster-ST 2",
    position: "ST",
    ovr: 82,
    readiness: 85,
    isInjured: false,
    rating: 7.9,
    pac: 80,
    sho: 88,
    pas: 65,
    dri: 75,
    def: 30,
    phy: 82,
  },
  {
    id: 12,
    name: "Muster-IV 3",
    position: "IV",
    ovr: 79,
    readiness: 82,
    isInjured: false,
    rating: 7.4,
    pac: 68,
    sho: 40,
    pas: 65,
    dri: 60,
    def: 82,
    phy: 90,
  },
  {
    id: 13,
    name: "Muster-ZM 3",
    position: "CM",
    ovr: 77,
    readiness: 92,
    isInjured: false,
    rating: 7.0,
    pac: 72,
    sho: 68,
    pas: 85,
    dri: 82,
    def: 60,
    phy: 62,
  },
  {
    id: 14,
    name: "Muster-ST 3",
    position: "ST",
    ovr: 72,
    readiness: 50,
    isInjured: false,
    rating: 6.2,
    pac: 85,
    sho: 75,
    pas: 60,
    dri: 72,
    def: 25,
    phy: 60,
  },
  {
    id: 15,
    name: "Muster-ZM 4",
    position: "CM",
    ovr: 75,
    readiness: 50,
    isInjured: false,
    rating: 6.5,
    pac: 70,
    sho: 30,
    pas: 70,
    dri: 55,
    def: 80,
    phy: 75,
  },
];

const calculateOvr = (p) =>
  Math.round((p.pac + p.sho + p.pas + p.dri + p.def + p.phy) / 6);
const calculateReadiness = (sleep, hrv) =>
  Math.min(100, Math.round((sleep / 8) * 40 + (hrv / 80) * 60));

const IntelligenceBriefing = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/90 backdrop-blur-xl animate-fade-in p-6">
      <div className="glass-panel w-full max-w-4xl p-10 border-neon/50 shadow-[0_0_100px_rgba(0,243,255,0.2)] overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon via-redbull to-gold"></div>
        <div className="flex justify-between items-start mb-10">
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase mb-2">
              Daily Intelligence Briefing
            </h1>
            <div className="text-[10px] font-mono text-neon tracking-[0.3em] uppercase">
              Security Level: Stark Elite Alpha
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/20 hover:text-white transition-colors"
          >
            <Icon name="x" size={32} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-6">
            <h3 className="text-neon font-black uppercase text-xs tracking-widest flex items-center gap-2 border-b border-white/10 pb-2">
              <Icon name="shield" size={14} /> Tactical Status
            </h3>
            <div className="space-y-1">
              <div className="text-[10px] text-white/40 uppercase">
                Formation Synergy
              </div>
              <div className="text-2xl font-black text-white">
                84%{" "}
                <span className="text-xs text-green-400 font-normal">
                  OPTIMIZED
                </span>
              </div>
            </div>
            <div className="p-3 bg-neon/10 border border-neon/20 rounded text-[11px] text-neon italic">
              "High verticality detected in wing segments. Pressing traps
              set at Zone 14."
            </div>
          </div>
          <div className="space-y-6">
            <h3 className="text-redbull font-black uppercase text-xs tracking-widest flex items-center gap-2 border-b border-white/10 pb-2">
              <Icon name="activity" size={14} /> Medical Vitals
            </h3>
            <div className="space-y-1">
              <div className="text-[10px] text-white/40 uppercase">
                Squad Readiness
              </div>
              <div className="text-2xl font-black text-white">
                76%{" "}
                <span className="text-xs text-yellow-400 font-normal">
                  BALANCED
                </span>
              </div>
            </div>
            <div className="p-3 bg-redbull/10 border border-redbull/20 rounded text-[11px] text-redbull italic">
              "Warning: Musiala showing signs of over-exertion. 48h
              recovery recommended."
            </div>
          </div>
          <div className="space-y-6">
            <h3 className="text-gold font-black uppercase text-xs tracking-widest flex items-center gap-2 border-b border-white/10 pb-2">
              <Icon name="briefcase" size={14} /> Market Intelligence
            </h3>
            <div className="space-y-1">
              <div className="text-[10px] text-white/40 uppercase">
                Budget Status
              </div>
              <div className="text-2xl font-black text-white">
                €88.4m{" "}
                <span className="text-xs text-gold font-normal">
                  LIQUID
                </span>
              </div>
            </div>
            <div className="p-3 bg-gold/10 border border-gold/20 rounded text-[11px] text-gold italic">
              "Red Bull Partnership ROI project for 2026: +12.4% expected
              growth."
            </div>
          </div>
        </div>

        <div className="mt-12 flex justify-center">
          <button
            onClick={onClose}
            className="px-10 py-4 bg-neon text-navy font-black uppercase tracking-widest text-xs hover:bg-white transition-all shadow-[0_0_30px_rgba(0,243,255,0.4)]"
          >
            Briefing bestätigen & Exit
          </button>
        </div>
      </div>
    </div>
  );
};

const SetupWizard = ({ onComplete, askAI, addAiLog, gerdSpeak }) => {
  const [clubName, setClubName] = useState("");
  const [league, setLeague] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#00f3ff");
  const [secondaryColor, setSecondaryColor] = useState("#e21b4d");
  const [isMagicFilling, setIsMagicFilling] = useState(false);
  const [epicKey, setEpicKey] = useState(localStorage.getItem("gerd_epicKey") || "");
  const [ollamaUrl, setOllamaUrl] = useState(localStorage.getItem("gerd_ollamaUrl") || "http://localhost:11434");
  const [fussballDeUrl, setFussballDeUrl] = useState("");

  const [hydrationResult, setHydrationResult] = useState(null);
  const [hydrationError, setHydrationError] = useState(null);
  const [trainerName, setTrainerName] = useState("");
  const [clubLogo, setClubLogo] = useState(null);
  const [manualBudget, setManualBudget] = useState("1000000"); // Standard fallback budget
  const [proxyStatus, setProxyStatus] = useState("checking"); // checking, online, offline
  const [geminiStatus, setGeminiStatus] = useState("checking"); // checking, online, offline
  const [ollamaStatus, setOllamaStatus] = useState("checking"); // checking, online, offline

  useEffect(() => {
    const checkConnections = async () => {
      // 1. Check Proxy Server
      let isProxyUp = false;
      try {
        const res = await fetch("http://localhost:3001/health");
        const data = await res.json();
        isProxyUp = data.status === "ok";
        setProxyStatus(isProxyUp ? "online" : "offline");
      } catch (e) {
        setProxyStatus("offline");
      }

      // 2. Check Gemini Key
      if (epicKey && epicKey.length > 20) { // basic length check
        try {
          // Minimal lightweight test via proxy
          const keyRes = await fetch("http://localhost:3001/api/verify-gemini", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key: epicKey })
          });
          if (keyRes.ok) setGeminiStatus("online");
          else setGeminiStatus("offline");
        } catch {
          setGeminiStatus(isProxyUp ? "offline" : "checking"); // if proxy down, we don't know
        }
      } else {
        setGeminiStatus("offline");
      }

      // 3. Check Ollama
      if (ollamaUrl) {
        try {
          const ollamaRes = await fetch(`${ollamaUrl}/api/tags`);
          if (ollamaRes.ok) setOllamaStatus("online");
          else setOllamaStatus("offline");
        } catch {
          setOllamaStatus("offline");
        }
      } else {
        setOllamaStatus("offline");
      }
    };

    checkConnections();
    const interval = setInterval(checkConnections, 5000);
    return () => clearInterval(interval);
  }, [epicKey, ollamaUrl]);

  const handleMagicFill = async () => {
    // Phase 16: Universal 3-Way Input
    const input = fussballDeUrl || clubName;
    if (!input) return alert("Bitte Vereinsnamen oder einen Link eingeben.");
    
    setIsMagicFilling(true);
    setHydrationResult(null);
    setHydrationError(null);
    
    try {
      let isProNameOnly = false;
      let isUnknownLink = false;
      let isFussballDe = false;
      
      const cleanInput = input.trim();
      
      if (cleanInput.includes("fussball.de")) {
          isFussballDe = true;
          addAiLog(`Klassischer Amateur-Scraper (Fussball.de) aktiviert.`, "process");
      } else if (cleanInput.startsWith("http")) {
          isUnknownLink = true;
          addAiLog(`Universeller KI-Scraper aktiviert für: ${cleanInput}`, "process");
      } else {
          isProNameOnly = true;
          addAiLog(`Direkte KI-Suche (Weltwissen) aktiviert für: ${cleanInput}`, "process");
      }

      const finalKey = epicKey || localStorage.getItem("gerd_epicKey");
      if (!finalKey) throw new Error("API Key fehlt für diese Operation.");

      let payload = null;

      if (isFussballDe) {
          // A. Classic Scraper via Proxy (for complex amateur DOM)
          const res = await fetch("http://localhost:3001/api/hydrate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ clubName: clubName || cleanInput, epicKey: finalKey, fussballDeUrl: cleanInput }),
          });
          payload = await res.json();
      } else if (isUnknownLink) {
          // B. Universal Text Scraper + Gemini AI extraction (e.g. Transfermarkt)
          const textRes = await fetch("http://localhost:3001/api/fetch-text", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: cleanInput })
          });
          const textData = await textRes.json();
          if (!textData.ok || !textData.text) throw new Error("Konnte Text der Webseite nicht laden.");
          
          addAiLog(`Webseite geladen (${textData.text.length} Zeichen). Analysiere mit KI...`, "process");
          
          const prompt = `Extrahiere aus dem folgenden Webseiten-Text alle Fußballspieler und ihre Positionen.
          WICHTIG: Antworte AUSSCHLIESSLICH mit einem einzigen validen JSON-Objekt. Keine Einleitung, keine Markdown-Formatierung.
          Struktur:
          {
            "clubName": "${clubName || 'Unknown'}",
            "league": "Liga",
            "primaryColor": "#00f3ff",
            "secondaryColor": "#e21b4d",
            "players": [
              { "name": "Spieler Name", "position": "Torwart|Abwehr|Mittelfeld|Sturm", "marketValue": 1000000, "age": 25, "nationality": "GER" }
            ]
          }
          WEBTEXT START:
          ${textData.text.substring(0, 30000)}
          WEBTEXT ENDE`;
          
          const aiRes = await fetch("http://localhost:3001/api/chat", {
             method: "POST",
             headers: { "Content-Type": "application/json" },
             body: JSON.stringify({
                messages: [{ role: "user", content: prompt }],
                apiKey: finalKey,
                persona: "Data-Analyst"
             })
          });
          
          const aiData = await aiRes.json();
          if (!aiData.ok) throw new Error("KI-Analyse fehlgeschlagen.");
          
          let parsed = { players: [] };
          try {
             let rawText = aiData.text.replace(/```json/gi, "").replace(/```/g, "").trim();
             const jsonMatch = rawText.match(/\{[\s\S]*\}/);
             parsed = JSON.parse(jsonMatch ? jsonMatch[0] : rawText);
          } catch(e) { console.error("JSON parse error from KI", aiData.text); throw new Error("KI lieferte ungültiges JSON."); }
          
         let finalPlayers = parsed.players || [];
         if (finalPlayers.length === 0) {
             console.log("Fallback: Adding 11 generic template players due to empty AI result.");
             finalPlayers = [
                 { name: "Max Mustermann", position: "TW", age: 26, marketValue: 500000, nationality: "GER" },
                 { name: "Leon Schmidt", position: "CB", age: 24, marketValue: 1200000, nationality: "GER" },
                 { name: "Julian Weber", position: "CB", age: 28, marketValue: 800000, nationality: "GER" },
                 { name: "Paul Wagner", position: "RB", age: 23, marketValue: 1500000, nationality: "GER" },
                 { name: "Lukas Berg", position: "LB", age: 22, marketValue: 1100000, nationality: "GER" },
                 { name: "Tim Hoffmann", position: "CDM", age: 30, marketValue: 400000, nationality: "GER" },
                 { name: "Felix Becker", position: "CM", age: 25, marketValue: 2000000, nationality: "GER" },
                 { name: "Jonas Bauer", position: "CAM", age: 21, marketValue: 3500000, nationality: "GER" },
                 { name: "Niklas Wolf", position: "RM", age: 27, marketValue: 900000, nationality: "GER" },
                 { name: "Simon Koch", position: "LM", age: 24, marketValue: 1800000, nationality: "GER" },
                 { name: "Tom Richter", position: "ST", age: 29, marketValue: 600000, nationality: "GER" }
             ];
         }
         
         payload = {
             ok: true,
             clubName: parsed.clubName || clubName || "Scraped Club",
             league: parsed.league || "",
             primaryColor: parsed.primaryColor || "#00f3ff",
             secondaryColor: parsed.secondaryColor || "#e21b4d",
             players: finalPlayers.map((p,i) => ({
                 id: Date.now() + i,
                 name: p.name,
                 position: p.position || "CM",
                 age: p.age || 0,
                 marketValue: p.marketValue || 0,
                 nationality: p.nationality || "??",
                 status: 'fit',
                 stats: { pac: 50, sho: 50, pas: 50, dri: 50, def: 50, phy: 50 }
             })),
             source: "Universal AI Scraper (With Fallbacks)"
         };
      } else {
          // C. Direct Knowledge Retrieval (Pro Clubs e.g. "RB Leipzig")
          const prompt = `Erstelle einen aktuellen (oder aus der letzten bekannten Saison) Kader für den Profi-Fußballverein "${cleanInput}".
          WICHTIG: Antworte AUSSCHLIESSLICH mit einem einzigen validen JSON-Objekt. Keine Einleitung, keine Markdown-Formatierung.
          Struktur:
          {
            "clubName": "${cleanInput}",
            "league": "Liga",
            "primaryColor": "#00f3ff",
            "secondaryColor": "#e21b4d",
            "players": [
              { "name": "Spieler Name", "position": "Torwart|Abwehr|Mittelfeld|Sturm", "marketValue": 1000000, "age": 25, "nationality": "GER" }
            ]
          }`;
          
          const aiRes = await fetch("http://localhost:3001/api/chat", {
             method: "POST",
             headers: { "Content-Type": "application/json" },
             body: JSON.stringify({
                messages: [{ role: "user", content: prompt }],
                apiKey: finalKey,
                persona: "Data-Analyst"
             })
          });
          
          const aiData = await aiRes.json();
          if (!aiData.ok) throw new Error(aiData.text || "KI-Analyse fehlgeschlagen.");
          
          let parsed = { players: [] };
          try {
             let rawText = aiData.text.replace(/```json/gi, "").replace(/```/g, "").trim();
             const jsonMatch = rawText.match(/\{[\s\S]*\}/);
             parsed = JSON.parse(jsonMatch ? jsonMatch[0] : rawText);
          } catch(e) {
             console.error("JSON parse error from KI", aiData.text);
             throw new Error("KI lieferte ungültiges Format: " + aiData.text.substring(0, 150) + "...");
          }
          
         let finalPlayers = parsed.players || [];
         if (finalPlayers.length === 0) {
             console.log("Fallback: Adding 11 generic template players due to empty AI result.");
             finalPlayers = [
                 { name: "Max Mustermann", position: "TW", age: 26, marketValue: 500000, nationality: "GER" },
                 { name: "Leon Schmidt", position: "CB", age: 24, marketValue: 1200000, nationality: "GER" },
                 { name: "Julian Weber", position: "CB", age: 28, marketValue: 800000, nationality: "GER" },
                 { name: "Paul Wagner", position: "RB", age: 23, marketValue: 1500000, nationality: "GER" },
                 { name: "Lukas Berg", position: "LB", age: 22, marketValue: 1100000, nationality: "GER" },
                 { name: "Tim Hoffmann", position: "CDM", age: 30, marketValue: 400000, nationality: "GER" },
                 { name: "Felix Becker", position: "CM", age: 25, marketValue: 2000000, nationality: "GER" },
                 { name: "Jonas Bauer", position: "CAM", age: 21, marketValue: 3500000, nationality: "GER" },
                 { name: "Niklas Wolf", position: "RM", age: 27, marketValue: 900000, nationality: "GER" },
                 { name: "Simon Koch", position: "LM", age: 24, marketValue: 1800000, nationality: "GER" },
                 { name: "Tom Richter", position: "ST", age: 29, marketValue: 600000, nationality: "GER" }
             ];
         }
         
         payload = {
             ok: true,
             clubName: parsed.clubName || cleanInput,
             league: parsed.league || "",
             primaryColor: parsed.primaryColor || "#00f3ff",
             secondaryColor: parsed.secondaryColor || "#e21b4d",
             players: finalPlayers.map((p,i) => ({
                 id: Date.now() + i,
                 name: p.name,
                 position: p.position || "CM",
                 age: p.age || 0,
                 marketValue: p.marketValue || 0,
                 nationality: p.nationality || "??",
                 status: 'fit',
                 stats: { pac: 50, sho: 50, pas: 50, dri: 50, def: 50, phy: 50 }
             })),
             source: "Gemini World Knowledge (With Fallbacks)"
         };
      }

      if (payload && payload.ok) {
        setLeague(payload.league || "");
        setPrimaryColor(payload.primaryColor || "#00f3ff");
        setSecondaryColor(payload.secondaryColor || "#e21b4d");
        if (payload.logoUrl) setClubLogo(payload.logoUrl);
        
        // Ensure we always have a clubName in the main setup
        if (!clubName && payload.clubName) setClubName(payload.clubName);
        
        setHydrationResult(payload);

        if (payload.players.length === 0) {
          gerdSpeak(`System-Hinweis für Trainer ${trainerName}: Der Spielerkader konnte nicht automatisch identifiziert werden.`, "System");
          addAiLog("Hydration: Kader-Daten fehlen. Manuelle Erfassung erforderlich.", "warning");
        } else {
          addAiLog(`Hydration complete: ${payload.players.length} Spieler geladen via ${payload.source}.`, "success");
          gerdSpeak(`Willkommen, Trainer ${trainerName}. Die Daten wurden erfolgreich geladen. ${payload.players.length} Spieler stehen zur Analyse bereit.`, "System");
        }
      } else {
        throw new Error(payload?.error || "Unbekannter Fehler beim Laden");
      }
    } catch (e) {
      setHydrationError(`${e.message}`);
      addAiLog(`Hydration failure: ${e.message}`, "error");
    } finally {
      setIsMagicFilling(false);
    }
  };

  const handleFinish = () => {
    if (!clubName || !league)
      return alert("Bitte Name und Liga angeben.");
    if (epicKey) localStorage.setItem("gerd_epicKey", epicKey);
    onComplete({
      name: clubName,
      league: league,
      primaryColor: primaryColor,
      secondaryColor: secondaryColor,
      researchData: "",
      epicKey: epicKey,
      logoUrl: clubLogo,
      hydrationPayload: hydrationResult,
      manualBudget: parseInt(manualBudget) || 0,
    });
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-transparent backdrop-blur-2xl animate-fade-in overflow-y-auto before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/10 before:to-black/60 before:-z-10">
      <div className="min-h-full flex flex-col p-4 sm:p-6">
        <div className="glass-panel w-full max-w-2xl p-8 sm:p-10 relative overflow-hidden bg-white/10 backdrop-blur-3xl border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.37)] rounded-3xl mx-auto my-auto" style={{WebkitBackdropFilter: "blur(30px)"}}>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon via-white to-gold opacity-80"></div>

        <div className="text-center mb-10">
          <div className="inline-block p-4 rounded-2xl bg-white/20 text-white mb-6 border border-white/40 shadow-sm backdrop-blur-md">
            <Icon name="cpu" size={48} />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2 drop-shadow-md">
            Gerd 2.0 Initialization
          </h1>
          <p className="text-white/80 font-medium text-sm tracking-wider mb-4">
            System Core Activation & Settings
          </p>
          <div className="flex justify-center">
            <div className={`group flex items-center gap-3 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border transition-all duration-300 ${proxyStatus === 'online' ? 'bg-green-500/20 border-green-500/50 text-green-300 shadow-[0_0_15px_rgba(34,197,94,0.3)]' : proxyStatus === 'checking' ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300' : 'bg-red-500/20 border-red-500/50 text-red-300'}`}>
              <div className={`w-2 h-2 rounded-full ${proxyStatus === 'online' ? 'bg-green-400 shadow-[0_0_8px_#4ade80]' : proxyStatus === 'checking' ? 'bg-yellow-400 animate-pulse' : 'bg-red-400'}`}></div>
              <span className="opacity-90">Proxy Server:</span> {proxyStatus}
            </div>
          </div>
        </div>

        <div className="space-y-6 text-left">

          {/* === SYSTEM-AKTIVIERUNG === */}
          <div className="space-y-4 bg-black/20 border border-white/10 p-5 rounded-2xl backdrop-blur-md">
            
            {/* GEMINI */}
            <div className="space-y-2 group">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 drop-shadow-sm">
                  <Icon name="key" size={12} className="text-gold" /> Gemini API Key <span className="text-white/60 normal-case font-normal">(Cloud Engine)</span>
                </label>
                <div className={`flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded border ${geminiStatus === "online" ? "bg-green-500/10 text-green-400 border-green-500/30" : geminiStatus === "checking" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/30" : "bg-red-500/10 text-red-400 border-red-500/30"}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${geminiStatus === "online" ? "bg-green-400 shadow-[0_0_5px_#4ade80]" : geminiStatus === "checking" ? "bg-yellow-400 animate-pulse" : "bg-red-400"}`}></div>
                  {geminiStatus}
                </div>
              </div>
              <input
                type="password"
                value={epicKey}
                onChange={(e) => setEpicKey(e.target.value)}
                placeholder="Geben Sie Ihren AI Studio Key ein..."
                className={`w-full bg-white/10 border rounded-xl p-4 text-white font-mono text-sm shadow-inner outline-none transition-all font-medium placeholder:text-white/50 ${geminiStatus === 'online' ? 'border-green-500/50 focus:ring-1 focus:ring-green-500/50' : geminiStatus === 'offline' && epicKey ? 'border-red-500/50' : 'border-white/20 focus:border-white focus:ring-1 focus:ring-white/50'}`}
              />
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors mt-1"
              >
                <Icon name="external-link" size={10} /> Hier kostenlosen Key erstellen
              </a>
            </div>

            {/* OLLAMA */}
            <div className="space-y-2 group">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 drop-shadow-sm">
                  <Icon name="server" size={12} className="text-neon" /> Ollama Link <span className="text-white/60 normal-case font-normal">(Local Engine)</span>
                </label>
                <div className={`flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded border ${ollamaStatus === "online" ? "bg-green-500/10 text-green-400 border-green-500/30" : ollamaStatus === "checking" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/30" : "bg-red-500/10 text-red-400 border-red-500/30"}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${ollamaStatus === "online" ? "bg-green-400 shadow-[0_0_5px_#4ade80]" : ollamaStatus === "checking" ? "bg-yellow-400 animate-pulse" : "bg-red-400"}`}></div>
                  {ollamaStatus}
                </div>
              </div>
              <input
                type="text"
                value={ollamaUrl}
                onChange={(e) => setOllamaUrl(e.target.value)}
                placeholder="http://localhost:11434"
                className={`w-full bg-white/10 border rounded-xl p-4 text-white font-mono text-sm shadow-inner outline-none transition-all font-medium placeholder:text-white/50 ${ollamaStatus === 'online' ? 'border-green-500/50 focus:ring-1 focus:ring-green-500/50' : ollamaStatus === 'offline' && ollamaUrl ? 'border-red-500/50' : 'border-white/20 focus:border-white focus:ring-1 focus:ring-white/50'}`}
              />
               <p className="text-[11px] text-white/50 mt-1">Für komplett private Kaderanalysen auf dem eigenen Rechner.</p>
            </div>

          </div>

          {/* === CORE IDENTITY & MAGIC FILL === */}
          <div className="space-y-4 bg-black/20 border border-white/10 p-5 rounded-2xl backdrop-blur-md">
            
            {/* Trainer Name & Club Name Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 drop-shadow-sm">
                  <Icon name="user" size={12} className="text-neon" /> Trainer Name
                </label>
                <input
                  type="text"
                  value={trainerName}
                  onChange={(e) => setTrainerName(e.target.value)}
                  placeholder="z.B. Gerd S."
                  className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-white font-bold shadow-inner outline-none focus:bg-white/20 focus:border-neon focus:ring-1 focus:ring-neon/50 transition-all placeholder:text-white/40"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 drop-shadow-sm">
                  <Icon name="shield" size={12} className="text-gold" /> Vereinsname
                </label>
                <input
                  type="text"
                  value={clubName}
                  onChange={(e) => setClubName(e.target.value)}
                  placeholder="z.B. FC Schalke 04"
                  className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-white font-bold shadow-inner outline-none focus:bg-white/20 focus:border-gold focus:ring-1 focus:ring-gold/50 transition-all placeholder:text-white/40"
                />
              </div>
            </div>

            {/* Magic Fill Integration */}
            <div className="space-y-2 pt-2 border-t border-white/10">
               <label className="text-xs font-bold text-white/80 uppercase tracking-wider flex items-center justify-between drop-shadow-sm">
                <span className="flex items-center gap-2">
                  <Icon name="sparkles" size={12} className="text-neon" /> KI Magic Fill <span className="text-white/40 normal-case italic font-normal">(Daten automatisch laden)</span>
                </span>
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={fussballDeUrl}
                  onChange={(e) => setFussballDeUrl(e.target.value)}
                  placeholder="z.B. Link von fussball.de oder transfermarkt.de"
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-white font-mono text-xs shadow-inner outline-none focus:bg-white/10 focus:border-white/30 transition-all placeholder:text-white/30"
                />
                <button
                  onClick={handleMagicFill}
                  disabled={isMagicFilling || !epicKey}
                  title={!epicKey ? "Bitte zuerst Ihren Epic Key (Gemini) eingeben" : ""}
                  className={`px-6 py-3 font-bold uppercase text-[11px] tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all shadow-md whitespace-nowrap ${!epicKey
                    ? 'bg-white/5 text-white/30 border border-white/5 cursor-not-allowed'
                    : 'bg-white/20 text-white border border-white/30 hover:bg-white/30 hover:shadow-[0_0_15px_rgba(0,243,255,0.3)] hover:scale-105 active:scale-95 disabled:opacity-50'
                    }`}
                >
                  <Icon
                    name="sparkles"
                    size={14}
                    className={isMagicFilling ? "animate-spin text-neon" : "text-neon"}
                  />
                  {isMagicFilling ? "Lädt..." : "Magic Fill Starten"}
                </button>
              </div>
              <p className="text-[10px] text-white/50 italic">
                *Nutzt den Gemini-Key, um Live-Daten für den eingegebenen Link (oder Vereinsnamen) zu scrapen.
              </p>
            </div>
          </div>

          {/* === DESIGN & LIGA SETTINGS === */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-black/10 border border-white/5 p-5 rounded-2xl">
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/80 uppercase tracking-wider block drop-shadow-sm">
                Wettbewerb / Liga
              </label>
              <input
                type="text"
                value={league}
                onChange={(e) => setLeague(e.target.value)}
                placeholder="z.B. 2. Bundesliga"
                className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-white font-bold text-sm shadow-inner outline-none focus:bg-white/20 focus:border-white/50 transition-all placeholder:text-white/40"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white uppercase tracking-wider block drop-shadow-sm flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-white shadow-[0_0_5px_white]"></div> Primärfarbe</label>
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-full h-10 bg-white/5 p-1 border border-white/20 rounded-lg cursor-pointer shadow-inner hover:scale-105 transition-transform"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white uppercase tracking-wider block drop-shadow-sm flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-white/50"></div> Sekundärfarbe</label>
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-full h-10 bg-white/5 p-1 border border-white/20 rounded-lg cursor-pointer shadow-inner hover:scale-105 transition-transform"
                />
              </div>
            </div>
          </div>

          {/* === MANUAL OVERDRIVE: BUDGET === */}
          <div className="space-y-3 bg-red-900/10 border border-red-500/30 p-5 rounded-2xl backdrop-blur-md">
            <label className="text-xs text-red-300 font-bold uppercase tracking-wider flex items-center gap-2 drop-shadow-[0_0_4px_rgba(239,68,68,0.5)]">
              <Icon name="banknote" size={12} /> Manueller Financial Overdrive (Budget)
            </label>
            <input
              type="number"
              value={manualBudget}
              onChange={(e) => setManualBudget(e.target.value)}
              placeholder="z.B. 1000000"
              className="w-full bg-black/40 border border-red-500/40 rounded-xl p-4 text-white font-mono text-lg shadow-inner focus:border-red-400 focus:ring-2 focus:ring-red-500/50 outline-none transition-all"
            />
            <p className="text-[11px] text-white/60 italic font-medium">Falls keine automatischen Daten vorliegen, wird dieser Wert als Startkapital verwendet.</p>
          </div>

          {hydrationResult && (
            <div className="border border-green-500/40 rounded-2xl p-6 bg-green-500/10 backdrop-blur-md animate-fade-in shadow-[0_0_30px_rgba(34,197,94,0.15)] space-y-4">
              <div className="flex items-center justify-between border-b border-green-500/20 pb-3">
                <span className="flex items-center gap-2 text-green-400 font-bold uppercase tracking-wider drop-shadow-sm">
                  <Icon name="check-circle" size={16} /> System Hydration Complete
                </span>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full border shadow-sm ${hydrationResult.clubLevel === 'PRO' ? 'text-green-300 border-green-400/50 bg-green-900/30' :
                    hydrationResult.clubLevel === 'SEMI_PRO' ? 'text-yellow-300 border-yellow-400/50 bg-yellow-900/30' :
                      'text-orange-300 border-orange-400/50 bg-orange-900/30'
                    }`}>
                    {hydrationResult.clubLevel || 'PRO'}
                  </span>
                  <span className="text-[10px] font-mono text-white/70 uppercase bg-black/40 px-3 py-1 rounded-full border border-white/20 shadow-inner">{hydrationResult.source}</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[{ l: "Spieler im Kader", v: hydrationResult.players.length, i: "users" }, { l: "Lineup Wert", v: `€${(hydrationResult.totalSquadValue / 1e6).toFixed(1)}M`, i: "trending-up" }, { l: "Formation", v: hydrationResult.lastFormation, i: "grid" }].map((item, idx) => (
                  <div key={idx} className="bg-white/10 rounded-xl p-4 text-center border border-white/20 shadow-sm backdrop-blur-sm">
                    <Icon name={item.i} size={16} className="text-white/80 mx-auto mb-2 drop-shadow-md" />
                    <div className="text-white font-extrabold text-xl mb-1">{item.v}</div>
                    <div className="text-white/60 text-[10px] font-bold uppercase tracking-wider">{item.l}</div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 flex-wrap pt-2">
                <div className="w-6 h-6 rounded-full border border-white/50 shadow-md" style={{ backgroundColor: hydrationResult.primaryColor }}></div>
                <div className="w-6 h-6 rounded-full border border-white/50 shadow-md" style={{ backgroundColor: hydrationResult.secondaryColor }}></div>
                <span className="text-white/80 text-[11px] font-mono font-medium">{hydrationResult.primaryColor} • {hydrationResult.secondaryColor}</span>
                {hydrationResult.league && <span className="ml-auto text-[11px] font-bold text-white/70 uppercase tracking-widest bg-white/10 px-3 py-1 rounded-lg">{hydrationResult.league}</span>}
              </div>
            </div>
          )}
          {hydrationError && (
            <div className="border border-red-500/50 rounded-2xl p-6 bg-red-900/20 backdrop-blur-md animate-fade-in shadow-[0_0_30px_rgba(239,68,68,0.15)] space-y-3">
              <span className="flex items-center gap-2 text-red-400 font-bold uppercase tracking-wider drop-shadow-sm"><Icon name="alert-triangle" size={16} /> Daten-Upload fehlgeschlagen</span>
              <p className="text-white/80 text-sm font-medium">{hydrationError}</p>
              <label className="flex items-center gap-2 px-5 py-2.5 mt-2 bg-white/10 border border-red-400/50 rounded-xl text-white hover:bg-red-500/30 hover:shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all cursor-pointer text-sm font-bold w-fit">
                <Icon name="upload" size={14} /> Manuelle CSV Ausweichdatei
                <input type="file" accept=".csv,.pdf" className="hidden" onChange={() => addAiLog("Upload selected.", "warning")} />
              </label>
            </div>
          )}
          <div className="mt-12 flex flex-col items-center gap-6">
            <button
              onClick={handleFinish}
              className={`w-full font-extrabold uppercase tracking-[0.2em] py-5 text-lg rounded-2xl transition-all duration-300 transform active:scale-95 ${clubName && league ? 'bg-white text-black hover:bg-gray-100 hover:shadow-[0_0_40px_rgba(255,255,255,0.6)]' : 'bg-white/10 text-white/40 cursor-not-allowed border border-white/20'}`}
            >
              System Hochfahren
            </button>
            <p className="text-white/50 font-serif italic text-sm text-center">„Jeder Sieg beginnt im Kopf. Jede Niederlage auch.“</p>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

// ============================================================
// LEGACY & FOUNDATION — Dedicated memorial component for Gerd
// ============================================================
// ============================================================
// LEGACY & FOUNDATION 2.0 — Gerd Sauerwein Memorial Command Center
// ============================================================
// ============================================================
// LEGACY & FOUNDATION 2.0 — Gerd Sauerwein Memorial Command Center
// ============================================================
const LegacyView = ({ identityData }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  if (!identityData) return <div className="text-neon p-20 text-center animate-pulse">Loading Foundation Data...</div>;

  const { dedication, project, modules } = identityData;

  return (
    <div className={`animate-fade-in min-h-[100vh] relative font-sans text-white overflow-hidden pb-40 transition-all duration-1000 ${isPlaying ? 'bg-black/90' : 'bg-black'}`}>
      
      {/* BACKGROUND AUDIO: Dedicated Legacy Anthem */}
      <audio ref={audioRef} src="./Papa.mp3.mp3" preload="auto" loop />

      {/* PHASE 18: GOLDEN HOUR OVERLAY & BACKGROUND BLUR */}
      <div className={`absolute inset-0 z-0 pointer-events-none transition-opacity duration-1000 ${isPlaying ? 'opacity-100 backdrop-blur-md' : 'opacity-0'}`}>
         <div className="absolute inset-0 bg-gradient-to-t from-gold/30 via-gold/5 to-transparent mix-blend-overlay"></div>
      </div>

      {/* CYBERPUNK TACTICAL BACKGROUND: 4-4-2 vs 3-4-3 */}
      <div className={`absolute inset-0 z-0 opacity-20 pointer-events-none transition-all duration-1000 ${isPlaying ? 'blur-sm opacity-10' : ''}`}>
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hexagons" width="50" height="43.4" patternUnits="userSpaceOnUse" patternTransform="scale(0.5)">
              <path d="M25 0 L50 14.4 L50 43.3 L25 57.7 L0 43.3 L0 14.4 Z" fill="none" stroke="#00f3ff" strokeWidth="0.5" strokeOpacity="0.3"></path>
            </pattern>
            <linearGradient id="glow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#00f3ff" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#001240" stopOpacity="0" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#hexagons)" />
          <g stroke="#00f3ff" strokeWidth="1" strokeOpacity="0.4" fill="none">
            <path d="M 0,200 Q 400,300 800,200 T 1600,200" className="animate-pulse" />
            <path d="M 0,500 Q 500,600 1000,500 T 2000,500" strokeDasharray="10 10" />
            <path d="M 0,800 Q 600,900 1200,800 T 2400,800" />
            <circle cx="20%" cy="30%" r="4" fill="#00f3ff" />
            <circle cx="40%" cy="35%" r="4" fill="#00f3ff" />
            <circle cx="60%" cy="35%" r="4" fill="#00f3ff" />
            <circle cx="80%" cy="30%" r="4" fill="#00f3ff" />
            <circle cx="30%" cy="60%" r="6" fill="#e21b4d" />
            <circle cx="50%" cy="65%" r="6" fill="#e21b4d" />
            <circle cx="70%" cy="60%" r="6" fill="#e21b4d" />
          </g>
        </svg>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black"></div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto pt-16 px-6 lg:px-12 flex flex-col items-center">
        <header className="w-full text-center border-b border-schalke-blau/50 pb-8 mb-16 relative">
          <div className="absolute left-1/2 -top-4 -translate-x-1/2 w-48 h-1 bg-schalke-blau shadow-[0_0_20px_#004B91]"></div>
          <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase text-white drop-shadow-[0_0_15px_rgba(0,243,255,0.6)]">
            {project.name} <span className="text-schalke-blau block md:inline md:ml-4 text-2xl md:text-5xl border-l-0 md:border-l-2 border-schalke-blau/50 pl-0 md:pl-4 mt-2 md:mt-0 font-mono tracking-widest">- The Legacy AI Command Center</span>
          </h1>
        </header>

        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-navy/40 backdrop-blur-md border border-schalke-blau/30 p-6 rounded-xl shadow-[0_0_30px_rgba(0,18,64,0.8)] relative overflow-hidden group hover:border-neon transition-colors">
              <div className="absolute top-0 left-0 w-1 h-full bg-schalke-blau"></div>
              <h2 className="flex items-center gap-3 text-gold text-xl font-black uppercase tracking-widest mb-4">
                <Icon name="dove" size={20} className="text-gold" /> Widmung
              </h2>
              <div className="w-8 h-px bg-gold/50 mb-4"></div>
              <p className="text-white/80 font-serif leading-relaxed italic text-sm md:text-base">
                {dedication.text}
              </p>
              <div className="mt-4 text-[10px] text-white/40 font-mono uppercase tracking-widest">
                Status: Foundation Active | {dedication.date_of_death}
              </div>
            </div>

            <div className="bg-navy/40 backdrop-blur-md border border-schalke-blau/30 p-6 rounded-xl shadow-[0_0_30px_rgba(0,18,64,0.8)] relative overflow-hidden group hover:border-neon transition-colors">
              <div className="absolute top-0 left-0 w-1 h-full bg-schalke-blau"></div>
              <h2 className="flex items-center gap-3 text-neon text-xl font-black uppercase tracking-widest mb-4">
                <Icon name="rocket" size={20} className="text-neon" /> Vision
              </h2>
              <div className="w-8 h-px bg-neon/50 mb-4"></div>
              <p className="text-white/80 font-serif leading-relaxed italic text-sm md:text-base">
                {project.vision}
              </p>
            </div>
          </div>

          <div className="lg:col-span-4 flex justify-center relative">
            <div className="relative w-72 h-96 sm:w-80 sm:h-[420px] rounded-2xl p-1 bg-gradient-to-b from-schalke-blau via-navy to-black shadow-[0_0_80px_rgba(0,75,145,0.4)] animate-pulse">
              <div className="absolute inset-0 bg-schalke-blau/20 blur-xl rounded-2xl"></div>
              <div className="w-full h-full bg-black/50 rounded-2xl overflow-hidden relative border border-white/10 backdrop-blur-3xl flex items-center justify-center">
                <img src="./image_0.png" alt="Gerd Sauerwein" onError={(e) => { e.target.src = "image_0.png"; e.target.onerror = null; }} className="w-full h-full object-cover object-center opacity-90 transition-all duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent mix-blend-overlay"></div>
                <div className="absolute bottom-4 left-0 w-full text-center z-20">
                  <span className="bg-black/80 text-schalke-blau font-mono text-[10px] uppercase tracking-[0.4em] px-4 py-1 border border-schalke-blau/30 rounded-full">Foundation Node Active</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <div className="bg-navy/40 backdrop-blur-md border border-white/10 p-6 rounded-xl shadow-[0_0_30px_rgba(0,18,64,0.8)] relative overflow-hidden group hover:border-schalke-blau transition-colors">
              <div className="absolute top-0 right-0 w-1 h-full bg-schalke-blau"></div>
              <h2 className="flex items-center gap-3 text-schalke-blau text-xl font-black uppercase tracking-widest mb-4">
                <Icon name="grid" size={20} className="text-schalke-blau" /> Modul-Matrix
              </h2>
              <div className="w-8 h-px bg-schalke-blau/50 mb-4"></div>
              <div className="grid grid-cols-2 gap-3">
                {modules.map(mod => (
                  <div key={mod.id} className="p-3 bg-black/40 border border-white/5 rounded-lg hover:border-schalke-blau/50 transition-all group/mod">
                    <Icon name={mod.icon} size={18} className="text-schalke-blau mb-2 group-hover/mod:scale-110 transition-transform" />
                    <div className="text-[10px] font-black uppercase tracking-tighter text-white mb-1">{mod.name}</div>
                    <div className="text-[8px] text-white/40 leading-tight line-clamp-2">{mod.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Personal Message */}
        <div className="w-full max-w-4xl mx-auto mt-24 mb-12">
           <div className={`bg-navy/40 backdrop-blur-md border p-8 md:p-12 rounded-xl relative overflow-hidden transition-all duration-1000 ${isPlaying ? 'shadow-[0_0_60px_rgba(212,175,55,0.4)] border-gold animate-pulse' : 'shadow-[0_0_50px_rgba(212,175,55,0.15)] border-gold/30'}`}>
              <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
                 <Icon name="heart" size={120} className="text-gold -mt-10 -mr-10" />
              </div>
              <div className="flex items-center gap-3 mb-6">
                 <Icon name="heart" size={24} className="text-gold" />
                 <h3 className="text-xl md:text-2xl font-black uppercase text-gold tracking-widest">Ein persönliches Danke</h3>
              </div>
              <div className="space-y-6 text-white/80 font-serif text-lg md:text-xl leading-relaxed relative z-10">
                 <p>„Gerd, du warst für mich weit mehr als nur ein Vater. Du warst mein Zuhause, mein Kompass und mein bester Freund. Wir sind zusammen durch alle Höhen und Tiefen des Lebens gegangen – Wand an Wand, im selben Haus, ein Leben lang vereint.</p>
                 <p>Als Vater und Sohn, als Nachbarn und als Freunde haben wir eine Einheit gebildet, die durch nichts zu erschüttern war. Du hast mir gezeigt, was es heißt, für eine Sache zu brennen und für die Menschen einzustehen, die man liebt.</p>
                 <p>Ich danke dir von ganzem Herzen für alles, was du für mich und für unseren gemeinsamen Traum getan hast. Es vergeht kein Tag, an dem ich dich nicht vermisse. Dieses System, Gerd 2.0, ist mein Versprechen an dich, dass dein Geist und deine Werte niemals in Vergessenheit geraten.“</p>
              </div>
              <div className="mt-8 pt-6 border-t border-gold/20 text-right relative z-10">
                 <p className="text-gold font-black uppercase tracking-widest text-sm mb-2">In ewiger Dankbarkeit,</p>
                 <p className="text-white font-serif italic text-2xl lg:text-3xl">Dein Sohn Björn</p>
              </div>

               {/* High-End Gold Audio Player (Phase 15) */}
               <div className="mt-12 bg-black/60 border border-gold/40 rounded-2xl p-6 shadow-[0_0_30px_rgba(212,175,55,0.2)] flex flex-col md:flex-row items-center gap-6 relative z-10 backdrop-blur-xl group hover:border-gold transition-colors">
                 <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/50 flex items-center justify-center shrink-0 cursor-pointer hover:scale-105 transition-transform shadow-[0_0_15px_rgba(212,175,55,0.4)]" onClick={togglePlay}>
                   <Icon name={isPlaying ? "pause" : "play"} size={28} className="text-gold ml-1" />
                 </div>
                 <div className="flex-1 w-full">
                   <div className="flex justify-between items-end mb-2">
                     <div>
                       <div className="text-[10px] font-black uppercase tracking-[0.3em] text-gold/80 mb-1">Gerd Sauerwein Memorial</div>
                       <div className="text-lg text-white font-serif italic">The Orchestral Tribute</div>
                     </div>
                     <div className="text-xs font-mono text-gold/60">{isPlaying ? "PLAYING" : "PAUSED"}</div>
                   </div>
                   
                   {/* Waveform Animation */}
                   <div className="h-10 flex items-end gap-1 w-full overflow-hidden opacity-80">
                      {[...Array(40)].map((_, i) => (
                        <div 
                          key={i} 
                          className={`w-full bg-gold/70 rounded-t-sm transition-all duration-150 ${isPlaying ? 'animate-pulse' : ''}`}
                          style={{
                            height: isPlaying ? `${Math.random() * 80 + 20}%` : '20%',
                            animationDelay: `${Math.random() * 0.5}s`
                          }}
                        ></div>
                      ))}
                   </div>
                 </div>
                 {/* Local audio file from the user's directory */}
                 <audio ref={audioRef} src="Papa.mp3.mp3" onEnded={() => setIsPlaying(false)} className="hidden" />
               </div>

           </div>
        </div>

        <footer className="w-full mt-24 text-center pb-8">
          <div className="w-24 h-px bg-gold/40 mx-auto mb-8 shadow-[0_0_10px_rgba(212,175,55,0.3)]"></div>
          <div className="inline-block relative">
            <Icon name="heart" size={24} className="text-gold/50 absolute -top-8 left-1/2 -translate-x-1/2" />
            <blockquote className="text-2xl md:text-3xl font-serif italic text-gold drop-shadow-[0_0_15px_rgba(212,175,55,0.6)] animate-pulse-slow">
              „{dedication.motto}“
            </blockquote>
          </div>
        </footer>
      </div>
    </div>
  );
};

// ============================================================
// STADION-KURIER — Professional Trade Magazine Component
// ============================================================
const StadionKurierView = ({ isRecording, toggleVoiceAI, activeTab }) => {
  const [activeIssue, setActiveIssue] = useState("Saison-Vorschau 2026/27");

  const articles = [
    {
      type: "EDITORIAL",
      headline: "Die Rückkehr der Identität: Taktik trifft Charakter",
      author: "Redaktion Stark Elite",
      excerpt: "In einer Welt von Daten und Algorithmen erinnert uns das neue System daran, dass Fußball mehr ist als nur Zahlen auf einem Screen.",
      content: "Das Erbe von Gerd Sauerwein lebt in jedem Vektor dieses Systems weiter. Während andere auf reine Effizienz setzen, integriert Stark Elite die menschliche Komponente. Ein Trainer lehrt Taktik, ein Vater lehrt Charakter - dieses Leitbild zieht sich durch jede Zeile Code.",
      image: "image_0.png",
      featured: true
    },
    {
      type: "TACTICAL ANALYSIS",
      headline: "Der 4-4-2 Hybrid-Ansatz im Detail",
      author: "Neural-Gerd",
      excerpt: "Warum das vertikale Pressing in der Regionalliga den Unterschied macht.",
      content: "Durch die Kapselung der defensiven Dreierkette bei Ballbesitz erreichen wir eine Asymmetrie, die gegnerische Pressing-Lines kollabieren lässt. Die Daten der Hydration Engine belegen eine Steigerung der Raumkontrolle um 14% bei korrekter Positionierung.",
      featured: false
    },
    {
      type: "FINANCE WATCH",
      headline: "Liquidität als strategischer Vorteil",
      author: "CFO-Gerd",
      excerpt: "Wie das Zero-Base-Budgeting den Kaderwert stabilisiert.",
      content: "Die Analyse zeigt, dass eine Investition in das NLZ langfristig kosteneffizienter ist als Panikkäufe am Transfermarkt. Das Budgetmanagement wurde für 2026 vollständig auf Transparenz getrimmt, um dem Trainer maximale Sicherheit zu geben.",
      featured: false
    }
  ];

  return (
    <div className="animate-fade-in min-h-screen bg-[#f5f5f5] text-navy font-serif p-4 md:p-12 overflow-y-auto">
      {/* MAG-HEADER */}
      <div className="max-w-6xl mx-auto border-b-4 border-navy pb-6 mb-12">
        <div className="flex justify-between items-end">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.4em] mb-2">Offizielles Fachmagazin</div>
            <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase leading-none">
              Stadion<span className="text-gold">Kurier</span>
            </h1>
          </div>
          <div className="text-right hidden md:block">
            <div className="text-sm font-black italic">{activeIssue}</div>
            <div className="text-[9px] uppercase tracking-widest opacity-60">Ausgabe #001 / Legacy Edition</div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* MAIN ARTICLE */}
        <div className="lg:col-span-8">
          {articles.filter(a => a.featured).map((art, i) => (
            <div key={i} className="mb-12">
              <div className="text-xs font-black text-gold uppercase tracking-widest mb-4 border-b border-navy/10 pb-2">{art.type}</div>
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-6 leading-tight">
                {art.headline}
              </h2>
              <div className="flex flex-col md:flex-row gap-8 mb-8">
                <div className="flex-1">
                  <p className="text-xl font-bold italic mb-6 leading-relaxed">
                    {art.excerpt}
                  </p>
                  <div className="columns-1 md:columns-2 gap-8 text-sm leading-relaxed text-justify hyphens-auto">
                    <span className="float-left text-6xl font-black leading-none mr-3 mt-1 text-gold">D</span>
                    {art.content}
                    <p className="mt-4">Die Integration der Neural-Engine erlaubt es uns, Szenarien vorherzusehen, bevor sie auf dem Platz Form annehmen. Es ist nicht nur ein Tool, es ist eine Vision.</p>
                  </div>
                  <div className="mt-8 pt-4 border-t border-navy/10 flex items-center justify-between italic text-xs">
                    <span>Von {art.author}</span>
                    <button className="text-navy font-black uppercase tracking-widest hover:text-gold transition-colors">Weiterlesen →</button>
                  </div>
                </div>
                <div className="hidden md:block w-1/3">
                  <div className="aspect-[3/4] bg-navy relative overflow-hidden grayscale hover:grayscale-0 transition-all duration-700 shadow-2xl">
                    <img src={art.image} className="w-full h-full object-cover opacity-80" />
                    <div className="absolute inset-0 border-[12px] border-black/10"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* SIDEBAR / SECONDARY ARTICLES */}
        <div className="lg:col-span-4 lg:border-l border-navy/10 lg:pl-12">
          <h3 className="text-sm font-black uppercase tracking-widest mb-8 border-b-2 border-navy pb-2">Top Stories</h3>
          <div className="space-y-10">
            {articles.filter(a => !a.featured).map((art, i) => (
              <div key={i} className="group cursor-pointer">
                <div className="text-[10px] font-black text-gold uppercase tracking-widest mb-2">{art.type}</div>
                <h4 className="text-xl font-black uppercase leading-tight group-hover:text-gold transition-colors mb-3">{art.headline}</h4>
                <p className="text-xs leading-relaxed opacity-70 mb-4">{art.excerpt}</p>
                <div className="text-[10px] font-bold uppercase tracking-widest border-b border-navy/20 inline-block pb-1">Zum Artikel</div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-8 bg-navy/5 text-navy border border-navy/10 rounded-sm">
            <h4 className="text-xl font-black uppercase tracking-tight mb-4 flex items-center gap-2">
              <Icon name="mic" className={isRecording && activeTab === "stadion-kurier" ? "text-red-500 animate-pulse" : "text-navy"} /> KI Pressebetreuung
            </h4>
            <div className="text-xs space-y-4">
              <p className="opacity-80">Sprich mit Presse-Gerd über Artikel-Ideen oder Krisen-PR.</p>
              <button
                onClick={toggleVoiceAI}
                className={`w-full py-4 border text-[10px] font-black uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 ${
                  isRecording && activeTab === "stadion-kurier" 
                  ? "bg-red-500/10 border-red-500 text-red-600 animate-pulse shadow-red-500/20" 
                  : "border-navy/20 bg-white hover:bg-navy hover:text-white"
                }`}
              >
                <Icon name={isRecording && activeTab === "stadion-kurier" ? "square" : "mic"} size={14} />
                {isRecording && activeTab === "stadion-kurier" ? "Zuhören..." : "Presse-Gerd aktivieren"}
              </button>
            </div>
          </div>

          <div className="mt-16 p-8 bg-navy text-white rounded-sm shadow-xl">
            <Icon name="zap" size={24} className="text-gold mb-4" />
            <h4 className="text-lg font-black uppercase tracking-tight mb-2 italic">Abo & Insights</h4>
            <p className="text-[10px] leading-relaxed opacity-60 italic mb-6">Erhalten Sie den Stadion-Kurier direkt in Ihre Executive Zentrale. Jeden Spieltag neu.</p>
            <button className="w-full py-4 border border-white/20 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-navy transition-all">Jetzt abonnieren</button>
          </div>
        </div>
      </div>

      {/* MAG-FOOTER */}
      <div className="max-w-6xl mx-auto mt-20 pt-8 border-t border-navy/20 flex justify-between text-[9px] font-black uppercase tracking-widest opacity-40">
        <div>© 2026 Stark Elite Publishing Haus</div>
        <div>Anzeige | Partnerschaften: manager@stark-elite.com</div>
      </div>
    </div>
  );
};

const GlobalFooter = ({ identityData }) => {
  if (!identityData) return null;
  return (
    <div className="fixed bottom-0 left-0 w-full z-[100] py-4 px-6 bg-black/80 backdrop-blur-xl border-t border-gold/20 flex justify-between items-center shadow-[0_-10px_40px_rgba(0,0,0,0.8)]">
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
          <Icon name="heart" size={14} className="text-gold animate-pulse" />
        </div>
        <div>
          <div className="text-[9px] font-black uppercase tracking-[0.2em] text-gold/80">
            Legacy Mode Active
          </div>
          <div className="text-[11px] font-serif italic text-gold drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]">
            {identityData.dedication.footer_text}
          </div>
        </div>
      </div>
      <div className="hidden md:block text-[9px] font-mono text-gold/60 uppercase tracking-widest pl-10 border-l border-white/10 drop-shadow-[0_0_5px_rgba(212,175,55,0.3)]">
        Foundation Node: <span className="text-gold font-black">{identityData.dedication.name}</span> | <span className="opacity-80">{identityData.dedication.date_of_death}</span>
      </div>
    </div>
  );
};
const TrainingLabView = ({ truthObject, dispatchAction, askAI, gerdSpeak, addAiLog, setActiveTab, setPlayerPositions, isRecording, toggleVoiceAI, activeTab }) => {
  const [sessionDay, setSessionDay] = useState("Montag");
  const [selectedPreset, setSelectedPreset] = useState("ginga_1");
  const [intensity, setIntensity] = useState(85);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const saveSession = () => {
    const preset = truthObject.training_lab.presets.find(p => p.id === selectedPreset);
    const newSession = {
      day: sessionDay,
      name: preset.name,
      focus: preset.focus,
      intensity: intensity,
      timestamp: new Date().toISOString(),
      drills: []
    };
    dispatchAction('SAVE_TRAINING_SESSION', newSession);
    gerdSpeak(`Einheit für ${sessionDay} im Schlachtplan gespeichert. BOOM!`, "Klopp AI");
  };

  const handleAiGeneration = async () => {
    if (!aiPrompt) return;
    setIsGenerating(true);
    const prompt = `[STRICT JSON PROTOCOL]
    Erstelle eine komplette Trainingseinheit für ${sessionDay}.
    Anfrage des Trainers: "${aiPrompt}"
    
    DU MUSST NUR EIN REINES JSON-ARRAY ZURÜCKGEBEN. KEIN TEXT DAVOR ODER DANACH.
    Jeder Drill braucht:
    id (string), name (string), description (string), duration (string), technicalData (object: positions für 4-5 Spieler im 450x680 Feld).
    Beispiel Format: [{"id":"1", "name":"...", "description":"...", "duration":"...", "technicalData": {"positions": {"1":{"x":100,"y":200}}}}]`;

    try {
      const response = await askAI(prompt, "Klopp AI");
      // Robust JSON detection
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error("No JSON array found in response");

      const drills = JSON.parse(jsonMatch[0]);
      dispatchAction('SET_DRILLS_FOR_DAY', { day: sessionDay, drills });
      gerdSpeak(`Muster-Einheit für ${sessionDay} steht! Schau dir die Drills an. Wahnsinn!`, "Klopp AI");
      setAiPrompt("");
    } catch (e) {
      console.error("AI Generation failed", e);
      addAiLog("Konnte Trainingsplan nicht generieren. Bitte versuch es noch einmal.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSwapDrill = async (drillId) => {
    gerdSpeak("Ich suche eine Alternative im Netz... Moment!", "Klopp AI");
    const drillToSwap = currentSession?.drills?.find(d => d.id === drillId);
    const prompt = `[STRICT JSON PROTOCOL]
    Ersetze diese Übung: "${drillToSwap?.name}" (${drillToSwap?.description}).
    Grund: Trainer möchte mehr Torschuss oder Abwechslung.
    Gib mir NUR EIN EINZELNES JSON OBJEKT zurück. KEIN TEXT.
    Format: {"id":"${drillId}", "name":"...", "description":"...", "duration":"...", "technicalData": {"positions": {...}}}`;

    try {
      const response = await askAI(prompt, "Klopp AI");
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON object found in response");

      const newDrill = JSON.parse(jsonMatch[0]);
      dispatchAction('SWAP_DRILL', { day: sessionDay, oldId: drillId, newDrill });
      gerdSpeak("Übung getauscht. Das ist die neue Qualität!", "Klopp AI");
    } catch (e) {
      addAiLog("Tausch fehlgeschlagen. Bitte erneut versuchen.", "error");
    }
  };

  const currentSession = truthObject.training_lab.schedule.find(s => s.day === sessionDay);
  const currentPreset = truthObject.training_lab.presets.find(p => p.id === selectedPreset);

  return (
    <div className="p-8 space-y-8 animate-luxury-in">
      <div className="flex justify-between items-center bg-navy/20 p-8 rounded-3xl border border-white/5 backdrop-blur-xl">
        <div>
          <h2 className="text-4xl font-black italic tracking-tighter text-white uppercase mb-2">Training Lab</h2>
          <p className="text-white/40 text-xs font-mono uppercase tracking-[0.2em]">Klopp Elite Intelligence Hub</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Active Focus</p>
            <p className="text-neon font-black uppercase text-xl">{truthObject.training_lab.active_focus}</p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-neon/10 border border-neon/20 flex items-center justify-center">
            <Icon name="zap" className="text-neon animate-pulse" size={32} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          {/* AI Session Buddy (NEW) */}
          <div className="bg-navy/40 p-8 rounded-3xl border border-neon/30 shadow-[0_0_30px_rgba(0,243,255,0.05)]">
            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-6 flex items-center gap-3">
              <Icon name="brain" className="text-neon" /> AI Training Buddy
            </h3>
            <div className="space-y-4">
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Was planen wir heute? Z.B. Lockeres Training nach dem Spiel..."
                className="w-full h-32 bg-black/60 border border-white/10 rounded-xl p-4 text-white text-sm focus:border-neon outline-none custom-scrollbar"
              />
              <div className="flex gap-2 w-full">
                <button
                  onClick={handleAiGeneration}
                  disabled={isGenerating || !aiPrompt}
                  className="flex-1 bg-neon text-black font-black py-4 rounded-xl uppercase tracking-widest text-xs hover:bg-white transition-all flex items-center justify-center gap-2"
                >
                  {isGenerating ? <Icon name="loader" className="animate-spin" /> : <Icon name="wand-2" />}
                  Plan generieren
                </button>
                <button
                  onClick={toggleVoiceAI}
                  className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all ${isRecording && activeTab === "training_lab" ? "bg-red-500/20 text-red-500 border border-red-500 animate-pulse" : "bg-white/5 border border-white/10 text-white/50 hover:bg-white/10 hover:text-white"}`}
                >
                  <Icon name={isRecording && activeTab === "training_lab" ? "square" : "mic"} size={20} />
                </button>
              </div>
            </div>
          </div>

          <div className="glass-panel-heavy p-8 border border-white/10 rounded-3xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 text-white/5 pointer-events-none">
              <Icon name="activity" size={200} />
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-8 flex items-center gap-3">
              <Icon name="calendar-days" className="text-neon" /> Manueller Sessions-Planer
            </h3>

            <div className="space-y-6 relative z-10">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Tag wählen</label>
                  <select
                    value={sessionDay}
                    onChange={(e) => setSessionDay(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl p-4 text-white font-black uppercase text-xs outline-none focus:border-neon"
                  >
                    {["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"].map(d => (
                      <option key={d} value={d} className="bg-navy">{d}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Technik-Preset</label>
                  <select
                    value={selectedPreset}
                    onChange={(e) => setSelectedPreset(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl p-4 text-white font-black uppercase text-xs outline-none focus:border-neon"
                  >
                    {truthObject.training_lab.presets.map(p => (
                      <option key={p.id} value={p.id} className="bg-navy">{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Intensity Vector Control</label>
                  <span className="text-neon font-mono text-xl">{intensity}%</span>
                </div>
                <input
                  type="range" min="0" max="100"
                  value={intensity}
                  onChange={(e) => setIntensity(parseInt(e.target.value))}
                  className="w-full accent-neon cursor-pointer"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={saveSession}
                  className="flex-1 bg-neon text-black font-black py-5 rounded-2xl uppercase tracking-widest text-sm hover:bg-white hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all flex items-center justify-center gap-3"
                >
                  <Icon name="plus-circle" size={18} />
                  Einheit speichern
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-panel-heavy p-8 border border-white/10 rounded-3xl h-full flex flex-col shadow-2xl">
            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-8 flex items-center gap-3">
              <Icon name="list" className="text-neon" /> Einheiten & Drills: {sessionDay}
            </h3>
            <div className="flex-1 space-y-4 overflow-y-auto max-h-[1200px] pr-4 custom-scrollbar">
              {currentSession?.drills?.map((d, idx) => (
                <div key={d.id} className="p-6 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all group space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-neon/10 border border-neon/30 flex items-center justify-center text-neon font-mono text-xs">
                        {idx + 1}
                      </div>
                      <h4 className="text-sm font-black text-white uppercase tracking-wider">{d.name}</h4>
                    </div>
                    <span className="text-[10px] bg-white/10 px-2 py-1 rounded text-white/60">{d.duration}</span>
                  </div>
                  <p className="text-xs text-white/40 leading-relaxed italic">"{d.description}"</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setPlayerPositions(d.technicalData.positions);
                        setActiveTab("tactical");
                        gerdSpeak(`Visualisiere ${d.name} auf dem Tactic Board.`, "System");
                      }}
                      className="flex-1 bg-white/5 hover:bg-neon hover:text-black py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border border-white/10 transition-all flex items-center justify-center gap-2"
                    >
                      <Icon name="layout-dashboard" size={12} /> Board
                    </button>
                    <button
                      onClick={() => handleSwapDrill(d.id)}
                      className="flex-1 bg-white/5 hover:border-redbull hover:text-redbull py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border border-white/10 transition-all flex items-center justify-center gap-2"
                    >
                      <Icon name="refresh-cw" size={12} /> Tauschen
                    </button>
                  </div>
                </div>
              ))}

              {!currentSession?.drills?.length && (
                <div className="flex-1 space-y-4">
                  {truthObject.training_lab.schedule.map((s, idx) => (
                    <div key={idx}
                      onClick={() => setSessionDay(s.day)}
                      className={`flex items-center justify-between p-6 border rounded-2xl cursor-pointer transition-all ${sessionDay === s.day ? 'bg-neon/10 border-neon' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                      <div className="flex items-center gap-5">
                        <div className="w-10 h-10 rounded-xl bg-neon/10 border border-neon/30 flex items-center justify-center text-neon font-mono text-xs">
                          {s.day.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-white uppercase tracking-wider">{s.name}</h4>
                          <p className="text-[10px] text-white/40 uppercase tracking-widest">{s.focus} | {s.drills?.length || 0} Drills</p>
                        </div>
                      </div>
                      <Icon name="chevron-right" size={18} className="text-white/20" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MatchDayManifestoView = ({ truthObject, dispatchAction, gerdSpeak }) => {
  const [strategy, setStrategy] = useState(truthObject.match_day_manifesto.strategy);
  const [notes, setNotes] = useState(truthObject.match_day_manifesto.notes || "");
  const [intensity, setIntensity] = useState(truthObject.match_day_manifesto.intensity_level);

  const saveManifesto = () => {
    dispatchAction('UPDATE_MATCH_MANIFESTO', { strategy, notes, intensity_level: intensity });
    gerdSpeak("Taktische Ausrichtung für Spieltag fixiert. BOOM!", "Klopp AI");
  };

  return (
    <div className="p-8 space-y-8 animate-luxury-in">
      <div className="flex justify-between items-center bg-redbull/10 p-8 rounded-3xl border border-redbull/20 backdrop-blur-xl">
        <div>
          <h2 className="text-4xl font-black italic tracking-tighter text-white uppercase mb-2">Match Manifesto</h2>
          <p className="text-redbull text-xs font-mono uppercase tracking-[0.2em] font-black">Elite Strategy Dashboard</p>
        </div>
        <div className="w-16 h-16 rounded-2xl bg-redbull/10 border border-redbull/20 flex items-center justify-center shadow-[0_0_20px_rgba(226,27,77,0.2)]">
          <Icon name="shield" className="text-redbull" size={32} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel-heavy p-8 border border-white/10 rounded-3xl shadow-2xl">
            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-8">Strategische Ausrichtung</h3>
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Main Strategy Vector</label>
                <div className="grid grid-cols-2 gap-4">
                  {["Offensive Power", "Defensive Stability", "Gegenpressing Flow", "Samba Technical"].map(s => (
                    <button
                      key={s}
                      onClick={() => setStrategy(s)}
                      className={`p-6 rounded-2xl border transition-all uppercase font-black text-xs tracking-widest ${strategy === s ? "bg-neon text-black border-neon shadow-[0_0_20px_rgba(0,243,255,0.3)]" : "bg-black/40 text-white/40 border-white/5 hover:border-white/20"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Starting XI Intelligence Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Z.B. Fokus auf die Halbräume, schnelles Umschaltspiel über die Flügel..."
                  className="w-full h-40 bg-black/40 border border-white/10 rounded-2xl p-6 text-white text-sm focus:border-neon outline-none custom-scrollbar"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={saveManifesto}
                  className="flex-1 bg-redbull text-white font-black py-5 rounded-2xl uppercase tracking-widest text-sm hover:bg-white hover:text-black transition-all shadow-[0_10px_30px_rgba(226,27,77,0.2)]"
                >
                  Manifest speichern
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-panel-heavy p-8 border border-white/10 rounded-3xl shadow-2xl flex flex-col gap-8 h-full">
            <h3 className="text-xl font-black text-white uppercase tracking-tight">Match Core Stats</h3>

            <div className="bg-white/5 p-6 rounded-2xl border border-white/5 space-y-4">
              <div className="flex justify-between items-center text-[10px] font-black uppercase text-white/40 tracking-widest">
                <span>Intensität</span>
                <span className="text-redbull">{intensity}%</span>
              </div>
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-redbull shadow-[0_0_10px_#e21b4d]" style={{ width: `${intensity}%` }}></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center">
                <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Squad Readiness</p>
                <p className="text-xl font-black text-neon">83.6%</p>
              </div>
              <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center">
                <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Tactical Sync</p>
                <p className="text-xl font-black text-gold">High</p>
              </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center opacity-10">
              <Icon name="shield-check" size={120} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- STARK ELITE TACTICAL PRESETS (PHASE 23) ---
const STARK_ELITE_PRESETS = [
  {
    id: "preset-gegenpressing",
    name: "Gegenpressing (High Line)",
    focus: "Raumverknappung, 6-Sekunden Regel",
    difficulty: "Elite",
    duration: "Live",
    aiAnalysis: "Dominantes Umschaltspiel. Bei Ballverlust zieht sich das Netz massiv zusammen. Die Abwehrkette rückt extrem hoch (High Line), was das Spielfeld komprimiert. Schwäche: Anfällig für weite Bälle in die Tiefe.",
    frames: [
      { // Frame 1: Spread standard shape (Ball Loss)
        playerPositions: { "1": {x: 210, y: 500}, "2": {x: 60, y: 400}, "3": {x: 360, y: 400}, "4": {x: 160, y: 400}, "5": {x: 260, y: 400}, "6": {x: 160, y: 250}, "7": {x: 260, y: 250}, "8": {x: 60, y: 250}, "9": {x: 360, y: 250}, "10": {x: 160, y: 150}, "11": {x: 260, y: 150} },
        opponentPositions: { "opp1": {x: 210, y: 200, type: "opponent"} },
        drawings: []
      },
      { // Frame 2: Aggressive Collapse & High Line
        playerPositions: { "1": {x: 210, y: 400}, "2": {x: 120, y: 300}, "3": {x: 300, y: 300}, "4": {x: 180, y: 300}, "5": {x: 240, y: 300}, "6": {x: 180, y: 210}, "7": {x: 240, y: 210}, "8": {x: 120, y: 210}, "9": {x: 300, y: 210}, "10": {x: 190, y: 180}, "11": {x: 230, y: 180} },
        opponentPositions: { "opp1": {x: 210, y: 200, type: "opponent"} },
        drawings: [ { mode: "run", points: [{x: 160, y: 400}, {x: 180, y: 300}] }, { mode: "run", points: [{x: 260, y: 400}, {x: 240, y: 300}] } ]
      }
    ]
  },
  {
    id: "preset-overload",
    name: "Asymmetric Overload (3-2-5)",
    focus: "Sechser kippt ab, Flügelfokus",
    difficulty: "Advanced",
    duration: "Live",
    aiAnalysis: "Ballbesitz-Struktur: Aus einem 4-3-3 wird im Aufbau ein 3-2-5. Der rechte Flügelverteidiger schiebt extrem hoch, während der Linksverteidiger einrückt und die Dreierkette bildet. Der defensive Sechser holt sich die Bälle zwischen den Innenverteidigern ab.",
    frames: [
      { // Frame 1: Standard 4-3-3 shape
        playerPositions: { "1": {x: 210, y: 550}, "LB": {x: 60, y: 450}, "CB1": {x: 160, y: 450}, "CB2": {x: 260, y: 450}, "RB": {x: 360, y: 450}, "CDM": {x: 210, y: 350}, "CM1": {x: 140, y: 280}, "CM2": {x: 280, y: 280}, "LW": {x: 60, y: 150}, "ST": {x: 210, y: 120}, "RW": {x: 360, y: 150} },
        opponentPositions: {},
        drawings: []
      },
      { // Frame 2: Asymmetric Shift
        playerPositions: { "1": {x: 210, y: 550}, "LB": {x: 120, y: 450}, "CB1": {x: 180, y: 450}, "CB2": {x: 300, y: 450}, "RB": {x: 360, y: 200}, "CDM": {x: 210, y: 450}, "CM1": {x: 140, y: 280}, "CM2": {x: 250, y: 280}, "LW": {x: 80, y: 150}, "ST": {x: 210, y: 120}, "RW": {x: 320, y: 130} },
        opponentPositions: {},
        drawings: [ { mode: "run", points: [{x: 360, y: 450}, {x: 360, y: 200}] }, { mode: "run", points: [{x: 210, y: 350}, {x: 210, y: 450}] }, { mode: "run", points: [{x: 60, y: 450}, {x: 120, y: 450}] } ]
      }
    ]
  }
];

  const FuchsNLZ = ({
    youthPlayers,
    setYouthPlayers,
    nlzTab,
    setNlzTab,
    scoutModal,
    setScoutModal,
    dnaModules,
    setDnaModules,
    askAI,
    gerdSpeak,
    updateYouthPlayer,
    addYouthPlayer,
    deleteYouthPlayer,
    promoteToProSquad,
    openScoutModal,
    truthObject,
    dispatchAction,
    addAiLog,
    isRecording,
    toggleVoiceAI
  }) => {
    const [ageGroup, setAgeGroup] = useState("funino"); // 'funino' | 'kleinfeld' | 'grossfeld'
    const [trainingFocus, setTrainingFocus] = useState("dribbling");
    const [isGenerating, setIsGenerating] = useState(false);
    const [trainingPlan, setTrainingPlan] = useState(null);

    // --- NEW NLZ MED-TECH STATE ---
    const [activeNlzView, setActiveNlzView] = useState("finance"); // 'character' | 'biomechanics' | 'pipeline' | 'finance'
    const [activeDossierPlayerId, setActiveDossierPlayerId] = useState(null);
    const [activeRatingPlayerId, setActiveRatingPlayerId] = useState(null);
    const [draggedTalentId, setDraggedTalentId] = useState(null);
    const [pedagogicalTip, setPedagogicalTip] = useState("");
    const [isFetchingTip, setIsFetchingTip] = useState(false);
    const [developmentReport, setDevelopmentReport] = useState("");
    const [isDevLoading, setIsDevLoading] = useState(false);

    const handleDevCheck = async (player) => {
      setIsDevLoading(true);
      gerdSpeak(`Abgleich von ${player.name} mit Profi-DNA gestartet...`, "System");

      const prompt = `Du bist 'NLZ-Entwicklungs-Coach Gerd'. Analysiere das Potential von ${player.name} (Position: ${player.pos}).
          AKTUELLE STATS: ${JSON.stringify(player.stats)}.
          PROFI-VORGABE: ${truthObject.tactical_setup.formation_home}, Fokus auf ${truthObject.club_identity.philosophy}.

          Erstelle einen 'Predictive Development Report' (Quelle: NLZ-Datenbank):
          1. 'System-Kompatibilität': Passt er ins 4-4-2 / 3-4-3?
          2. 'Physischer Gap': Was fehlt zur Profi-Reife?
          3. 'Vorschlag': Spezielle Trainings-Provokationsregel für diesen Spieler.

          Stil: Analytisch, fordernd, visionär.`;

      try {
        const res = await askAI(prompt, "Trainer-Gerd");
        setDevelopmentReport(res);
      } catch (e) {
        setDevelopmentReport("Analyse im Neural-Link fehlgeschlagen.");
      }
      setIsDevLoading(false);
    };

    // Quick Rating Logic
    const handleQuickRating = (type) => {
      if (!activeRatingPlayerId) return;
      if (navigator.vibrate) navigator.vibrate(50);

      const player = youthPlayers.find(
        (p) => p.id === activeRatingPlayerId,
      );
      if (!player) return;

      let update = {};
      if (type === "top") {
        update = {
          focus: Math.min(10, (player.focus || 5) + 1),
          pac: Math.min(99, (player.pac || 60) + 1),
        };
        gerdSpeak(
          `${player.name}: Top Aktion registriert! +1 Fokus.`,
          "Trainer-Gerd",
        );
      } else if (type === "neutral") {
        gerdSpeak(
          `${player.name}: Aktion neutral bewertet.`,
          "Trainer-Gerd",
        );
      } else if (type === "correction") {
        update = {
          frustration: Math.min(10, (player.frustration || 5) + 1),
        };
        gerdSpeak(
          `${player.name}: Korrektur-Bedarf notiert.`,
          "Trainer-Gerd",
        );
      }

      if (Object.keys(update).length > 0) {
        Object.entries(update).forEach(([key, val]) => {
          updateYouthPlayer(activeRatingPlayerId, key, val);
        });
      }
    };

    // Psycho Tracking State
    const [psychoScores, setPsychoScores] = useState({
      focus: 5,
      effort: 5,
      teamplay: 5,
      frustration: 5,
    });
    const [isGeneratingPsychReport, setIsGeneratingPsychReport] =
      useState(false);

    // Season Book State
    const [seasonBookData, setSeasonBookData] = useState(null);
    const [isGeneratingBook, setIsGeneratingBook] = useState(false);

    // Video Analysis State
    const [videoFile, setVideoFile] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisReport, setAnalysisReport] = useState(null);
    const [videoSrc, setVideoSrc] = useState(null);

    const ageClasses = [
      { id: "funino", label: "Funino U6-U9", icon: "smile" },
      { id: "kleinfeld", label: "Kleinfeld U10-U13", icon: "layout" },
      { id: "grossfeld", label: "Großfeld U14+", icon: "maximize" },
    ];

    const foci = [
      { id: "dribbling", label: "Dribbling & 1v1", icon: "zap" },
      { id: "passing", label: "Passspiel & Raum", icon: "repeat" },
      { id: "shooting", label: "Torschuss & Abschluss", icon: "target" },
      {
        id: "coordination",
        label: "Koordination & Speed",
        icon: "activity",
      },
    ];

    const [isAutoFillingYouth, setIsAutoFillingYouth] = useState(false);
    
    const handleAutoFillYouthSquad = async () => {
      if (!clubIdentity || !clubIdentity.name) {
        gerdSpeak("Bitte zuerst Vereinsdaten in den Einstellungen hinterlegen.", "Trainer-Gerd");
        return;
      }
      setIsAutoFillingYouth(true);
      try {
        const response = await askAI(
          `Generiere ein Array von 15 Jugendspielern (U19/U17) für das NLZ von ${clubIdentity.name}.
          Erfinde realistische Namen und vergebe Potential (POT) Werte zwischen 75 und 95 und realistische Jugend-Attribute.
          Antworte NUR mit valider JSON (ohne Markdown-Tags).
          Format-Beispiel: [{"id": 1, "name": "Talent A", "position": "ZOM", "group": "u19", "pac": 80, "sho": 75, "pas": 80, "dri": 82, "def": 40, "phy": 65, "pot": 90, "image": ""}]`,
          "NLZ-Direktor",
          true
        );

        let jsonStr = response.trim();
        if (jsonStr.startsWith("```json")) jsonStr = jsonStr.substring(7);
        if (jsonStr.startsWith("```")) jsonStr = jsonStr.substring(3);
        if (jsonStr.endsWith("```")) jsonStr = jsonStr.substring(0, jsonStr.length - 3);
        jsonStr = jsonStr.trim();

        const newYouthPlayers = JSON.parse(jsonStr).map((p, i) => ({
            ...p,
            id: `auto_y_${Date.now()}_${i}`,
            image: p.image || "",
            group: p.group || (i < 5 ? "u19" : i < 10 ? "u17" : "u15"),
            focus: 70,
            frustration: 2,
            hrv: 75,
            sleep: 8.0,
            psychHistory: [],
            videoTresor: []
        }));
        setYouthPlayers(newYouthPlayers);
        gerdSpeak(`Youth Squad für ${clubIdentity.name} erfolgreich über KI-Scouting generiert.`, "System");
      } catch (e) {
        console.error("Youth Hydration Error:", e);
        gerdSpeak("Fehler beim Ingest der NLZ Scouting-Daten.", "error");
      } finally {
        setIsAutoFillingYouth(false);
      }
    };

    const generatePlan = async () => {
      setIsGenerating(true);
      setTrainingPlan(null);
      try {
          const prompt = `[STRICT JSON PROTOCOL]
          Du bist der NLZ-Direktor und Entwicklungs-Coach vom 'Stark Elite' NLZ.
          Erstelle einen detaillierten Trainingsplan für die Altersklasse [${ageGroup}], basierend auf der Red Bull Entwicklungs-DNA:
          - Starkes, ballorientiertes Gegenpressing
          - Vertikales, blitzschnelles Umschaltspiel
          - Hohe Intensität und Resilienz-Aufbau
          
          Schwerpunkt: ${trainingFocus}.
          Pädagogischer Fokus: Passe Komplexität an ${ageGroup} an (z.B. U15 mehr Technik/Funino, U19 Taktik).
          
          DU MUSST NUR EIN REINES JSON-ARRAY ZURÜCKGEBEN. KEIN TEXT DAVOR ODER DANACH.
          Jeder Drill braucht: id (string), name (string), phase ("Warm-Up", "Hauptteil", "Abschluss"), description (string), duration (string), technicalData (object: positions für 4-6 Spieler im 420x640 Feld, keys als strings 1-6 mit x, y 0-100).
          Format: [{"id":"1", "name":"...", "phase": "...", "description":"...", "duration":"...", "technicalData": {"positions": {"1":{"x":20,"y":30}}}}]`;

        const res = await askAI(prompt, "NLZ-Direktor", true);
        const jsonMatch = res.match(/\[[\s\S]*\]/);
        if (!jsonMatch) throw new Error("No JSON array found");
        
        const drills = JSON.parse(jsonMatch[0]);
        setTrainingPlan(drills);
        setActiveDrillId(drills[0]?.id || null);
        
        gerdSpeak(
          "Altersgerechter Plan wurde nach RB-DNA generiert und visualisiert.",
          "NLZ-Direktor"
        );
      } catch (e) {
        setTrainingPlan("Fehler beim Abruf des Trainingsplans.");
      } finally {
        setIsGenerating(false);
      }
    };

    const handleVideoUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
        setVideoFile(file);
        setVideoSrc(URL.createObjectURL(file));
        startAnalysis();
      }
    };

    const startAnalysis = async () => {
      setIsAnalyzing(true);
      setAnalysisReport(null);

      // Simulate scanning animation time
      setTimeout(async () => {
        const prompt = `Du bist Biomechanik-Experte im Fuchs Leistungszentrum.
          Analysiere eine fiktive Videoaufnahme eines Nachwuchsspielers beim ${trainingFocus}.
          Gib Feedback zu:
          1. Standfuß-Positionierung
          2. Körperhaltung/Schwerpunkt
          3. Armeinsatz zur Balance
          4. Eindeutiger Korrektur-Tipp für den Amateur-Trainer.
          Antworte prägnant im 'Stark Elite' Stil.`;

        const res = await askAI(prompt, "Biomechanik-Expert");
        setAnalysisReport(res);
        setIsAnalyzing(false);
        gerdSpeak(
          "Biomechanik-Analyse abgeschlossen. Haltungskorrekturen liegen vor.",
          "Trainer-Gerd",
        );
      }, 4000);
    };

    const saveVideoToTresor = () => {
      if (!activeDossierPlayerId || !videoSrc || !analysisReport) {
        alert(
          "Bitte zuerst einen Spieler auswählen und ein Video analysieren.",
        );
        return;
      }
      const newVideo = {
        date: new Date().toLocaleDateString("de-DE"),
        title: `${trainingFocus.toUpperCase()} Analyse`,
        feedback: analysisReport,
        videoSrc: videoSrc,
      };
      const p = youthPlayers.find((p) => p.id === activeDossierPlayerId);
      const currentVideos = p && p.videoTresor ? p.videoTresor : [];
      updateYouthPlayer(activeDossierPlayerId, "videoTresor", [
        ...currentVideos,
        newVideo,
      ]);
      gerdSpeak(
        "Video erfolgreich in den Tresor des Spielers verschoben.",
        "Trainer-Gerd",
      );
      setVideoSrc(null);
      setAnalysisReport(null);
    };

    const generatePsychReport = async (playerId) => {
      setIsGeneratingPsychReport(true);
      try {
        const prompt = `Du bist 'NLZ-Sportpsychologe' für das Fuchs Leistungszentrum.
          Erstelle einen kurzen diagnostischen Bericht (max 3 Sätze) basierend auf folgenden Trainer-Bewertungen (1-10):
          Fokus: ${psychoScores.focus}, Einsatz: ${psychoScores.effort}, Teamplay: ${psychoScores.teamplay}, Frustrationstoleranz: ${psychoScores.frustration}.
          Stil: Professionell, entwicklungsorientiert.`;

        const report = await askAI(prompt, "NLZ-Sportpsychologe");

        const newEntry = {
          date: new Date().toLocaleDateString("de-DE"),
          scores: { ...psychoScores },
          aiReport: report,
        };

        const player = youthPlayers.find((p) => p.id === playerId);
        updateYouthPlayer(playerId, "psychHistory", [
          ...(player.psychHistory || []),
          newEntry,
        ]);
        gerdSpeak(
          "Psychologisches Profil aktualisiert.",
          "NLZ-Sportpsychologe",
        );
      } catch (e) {
        console.error("Fehler bei Psycho-Report:", e);
      } finally {
        setIsGeneratingPsychReport(false);
      }
    };

    const generateSeasonBook = async () => {
      setIsGeneratingBook(true);
      setSeasonBookData(null);
      try {
        const squadData = youthPlayers.map((p) => ({
          name: p.name,
          pos: p.position,
          ovr: Math.round(
            (p.pac + p.sho + p.pas + p.dri + p.def + p.phy) / 6,
          ),
          psych:
            p.psychHistory && p.psychHistory.length > 0
              ? p.psychHistory[p.psychHistory.length - 1].scores
              : { focus: 5, effort: 5, teamplay: 5, frustration: 5 },
        }));

        const prompt = `Erstelle Inhalte für das 'Saison-Fachbuch' der Akademie.
          Hier sind die Daten der Top-Talente: ${JSON.stringify(squadData)}.
          Schreibe für jeden Spieler eine prägnante 'Scouting-Zusammenfassung' (ca. 40 Wörter), die Leistung und Psychologie verbindet.
          Antworte als JSON-Array: [{"name": "...", "report": "..." }, ...]`;

        const res = await askAI(prompt, "NLZ-Direktor");
        const jsonMatch = res.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          setSeasonBookData(JSON.parse(jsonMatch[0]));
          gerdSpeak(
            "Das Saison-Fachbuch wurde erfolgreich generiert.",
            "NLZ-Direktor",
          );
        } else {
          setSeasonBookData([
            {
              name: "System",
              report: "Fehler beim Parsen der Buchdaten.",
            },
          ]);
        }
      } catch (e) {
        setSeasonBookData([
          { name: "System", report: "Netzwerkfehler beim Abruf." },
        ]);
      } finally {
        setIsGeneratingBook(false);
      }
    };

    const renderPitch = () => {
      if (ageGroup === "funino") {
        return (
          <svg
            viewBox="0 0 420 300"
            className="w-full h-auto rounded-lg bg-[#0d2b1d] border border-white/10 shadow-2xl"
          >
            {/* Funino Pitch */}
            <rect
              x="10"
              y="10"
              width="400"
              height="280"
              fill="none"
              stroke="white"
              strokeWidth="2"
              opacity="0.5"
            />
            <line
              x1="210"
              y1="10"
              x2="210"
              y2="290"
              stroke="white"
              strokeWidth="1"
              strokeDasharray="5,5"
              opacity="0.3"
            />

            {/* 6m Shooting Zones */}
            <line
              x1="70"
              y1="10"
              x2="70"
              y2="290"
              stroke="#00f3ff"
              strokeWidth="2"
              strokeDasharray="4,4"
              opacity="0.6"
            />
            <line
              x1="350"
              y1="10"
              x2="350"
              y2="290"
              stroke="#00f3ff"
              strokeWidth="2"
              strokeDasharray="4,4"
              opacity="0.6"
            />
            <text
              x="40"
              y="150"
              fill="#00f3ff"
              fontSize="10"
              transform="rotate(-90, 40, 150)"
              opacity="0.5"
            >
              SCHUSSZONE
            </text>
            <text
              x="380"
              y="150"
              fill="#00f3ff"
              fontSize="10"
              transform="rotate(90, 380, 150)"
              opacity="0.5"
            >
              SCHUSSZONE
            </text>

            {/* 4 Mini Goals */}
            <g opacity="0.8">
              <rect
                x="5"
                y="40"
                width="10"
                height="40"
                fill="#ff4444"
                rx="2"
              />
              <rect
                x="5"
                y="220"
                width="10"
                height="40"
                fill="#ff4444"
                rx="2"
              />
              <rect
                x="405"
                y="40"
                width="10"
                height="40"
                fill="#ff4444"
                rx="2"
              />
              <rect
                x="405"
                y="220"
                width="10"
                height="40"
                fill="#ff4444"
                rx="2"
              />
            </g>
          </svg>
        );
      }
      if (ageGroup === "kleinfeld") {
        return (
          <svg
            viewBox="0 0 420 300"
            className="w-full h-auto rounded-lg bg-[#0d2b1d] border border-white/10 shadow-2xl"
          >
            <rect
              x="10"
              y="10"
              width="400"
              height="280"
              fill="none"
              stroke="white"
              strokeWidth="2"
              opacity="0.5"
            />
            <line
              x1="210"
              y1="10"
              x2="210"
              y2="290"
              stroke="white"
              strokeWidth="1"
              opacity="0.5"
            />
            <circle
              cx="210"
              cy="150"
              r="40"
              fill="none"
              stroke="white"
              strokeWidth="1"
              opacity="0.5"
            />
            {/* Penalty Areas */}
            <rect
              x="10"
              y="75"
              width="60"
              height="150"
              fill="none"
              stroke="white"
              strokeWidth="1"
              opacity="0.5"
            />
            <rect
              x="350"
              y="75"
              width="60"
              height="150"
              fill="none"
              stroke="white"
              strokeWidth="1"
              opacity="0.5"
            />
          </svg>
        );
      }
      return (
        <svg
          viewBox="0 0 420 300"
          className="w-full h-auto rounded-lg bg-[#0d2b1d] border border-white/10 shadow-2xl"
        >
          <rect
            x="10"
            y="10"
            width="400"
            height="280"
            fill="none"
            stroke="white"
            strokeWidth="2"
            opacity="0.8"
          />
          <line
            x1="210"
            y1="10"
            x2="210"
            y2="290"
            stroke="white"
            strokeWidth="2"
            opacity="0.8"
          />
          <circle
            cx="210"
            cy="150"
            r="50"
            fill="none"
            stroke="white"
            strokeWidth="2"
            opacity="0.8"
          />
          {/* Penalty Areas Full */}
          <rect
            x="10"
            y="50"
            width="80"
            height="200"
            fill="none"
            stroke="white"
            strokeWidth="2"
            opacity="0.8"
          />
          <rect
            x="330"
            y="50"
            width="80"
            height="200"
            fill="none"
            stroke="white"
            strokeWidth="2"
            opacity="0.8"
          />
        </svg>
      );
    };

    return (
      <div className="w-full">
        <div className="space-y-8 animate-fade-in pb-20">
          {/* Header Section - Med-Tech Aesthetic */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-8 rounded-2xl border border-gray-200 shadow-[0_10px_40px_rgba(0,0,0,0.1)] relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-[0.03] pointer-events-none">
              <Icon name="activity" size={240} className="text-navy" />
            </div>
            <div className="relative z-10">
              <h2 className="text-4xl font-black tracking-tighter text-navy flex items-center gap-4 uppercase mb-2">
                <Icon name="plus-square" size={32} className="text-neon" />{" "}
                Fuchs NLZ Hub
              </h2>
              <div className="text-[10px] font-mono text-gray-500 tracking-[0.4em] uppercase font-black">
                Elite Youth Academy | Psycho & Biomechanics Center
              </div>
            </div>
            <div className="mt-6 md:mt-0 flex flex-wrap gap-4 bg-gray-100 p-2 rounded-xl border border-gray-200">
              <button
                onClick={() => setActiveNlzView("finance")}
                className={`px-4 py-3 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 ${activeNlzView === "finance" ? "bg-white text-navy border-gray-200 shadow-md" : "bg-transparent text-gray-400 hover:text-navy"}`}
              >
                <Icon name="pie-chart" size={16} className={activeNlzView === "finance" ? "text-gold" : ""} /> Finance & Admin
              </button>
              <button
                onClick={() => setActiveNlzView("character")}
                className={`px-4 py-3 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 ${activeNlzView === "character" ? "bg-white text-navy border-gray-200 shadow-md" : "bg-transparent text-gray-400 hover:text-navy"}`}
              >
                <Icon name="user" size={16} className={activeNlzView === "character" ? "text-neon" : ""} /> Character Matrix
              </button>
              <button
                onClick={() => setActiveNlzView("biomechanics")}
                className={`px-4 py-3 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 ${activeNlzView === "biomechanics" ? "bg-white text-navy border-gray-200 shadow-md" : "bg-transparent text-gray-400 hover:text-navy"}`}
              >
                <Icon name="activity" size={16} className={activeNlzView === "biomechanics" ? "text-redbull" : ""} /> Biomechanik
              </button>
              <button
                onClick={() => setActiveNlzView("squad")}
                className={`px-4 py-3 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 ${activeNlzView === "squad" ? "bg-white text-navy border-gray-200 shadow-md" : "bg-transparent text-gray-400 hover:text-navy"}`}
              >
                <Icon name="users" size={16} className={activeNlzView === "squad" ? "text-redbull" : ""} /> Youth Squad
              </button>
              <button
                onClick={() => setActiveNlzView("training")}
                className={`px-4 py-3 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 ${activeNlzView === "training" ? "bg-white text-navy border-gray-200 shadow-md" : "bg-transparent text-gray-400 hover:text-navy"}`}
              >
                <Icon name="cpu" size={16} className={activeNlzView === "training" ? "text-neon" : ""} /> Training Protocol
              </button>
              <button
                onClick={() => setActiveNlzView("board")}
                className={`px-4 py-3 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 ${activeNlzView === "board" ? "bg-white text-navy border-gray-200 shadow-md" : "bg-transparent text-gray-400 hover:text-navy"}`}
              >
                <Icon name="layout" size={16} className={activeNlzView === "board" ? "text-neon" : ""} /> Taktik Board
              </button>
              <button
                onClick={() => setActiveNlzView("pipeline")}
                className={`px-4 py-3 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 ${activeNlzView === "pipeline" ? "bg-white text-navy border-gray-200 shadow-md" : "bg-transparent text-gray-400 hover:text-navy"}`}
              >
                <Icon name="git-pull-request" size={16} className={activeNlzView === "pipeline" ? "text-neon" : ""} /> Pipeline
              </button>
            </div>
          </div>

          {/* === NLZ TAKTIK BOARD === */}
          {activeNlzView === "board" && (
            <div className="space-y-6 animate-fade-in -mx-6 -my-6">
              {renderTactical({ targetPlayers: youthPlayers, targetPositions: nlzPlayerPositions, setTargetPositions: setNlzPlayerPositions, isNlzTheme: true })}
            </div>
          )}

          {/* === TRAINING PROTOCOL === */}
          {activeNlzView === "training" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-black italic tracking-tighter text-navy flex items-center gap-3 uppercase">
                  <Icon name="layout" size={28} className="text-neon" /> NLZ Training Generator
                </h2>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Board Configuration */}
                <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-neon/5 rounded-bl-[100px] pointer-events-none"></div>
                  <h3 className="text-navy font-black uppercase text-sm tracking-widest mb-6 flex items-center gap-3">
                    <Icon name="sliders" className="text-neon" size={20} /> Age & Tactic Selection
                  </h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-3">1. Altersklasse wählen</label>
                      <div className="grid grid-cols-3 gap-3">
                        {ageClasses.map(ac => (
                          <button
                            key={ac.id}
                            onClick={() => setAgeGroup(ac.id)}
                            className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${ageGroup === ac.id ? "bg-white border-neon shadow-[0_0_15px_rgba(0,243,255,0.3)] text-navy" : "bg-gray-50 border-gray-200 text-gray-400 hover:bg-white hover:border-neon/50"}`}
                          >
                            <Icon name={ac.icon} size={24} className={ageGroup === ac.id ? "text-neon" : "text-gray-300"} />
                            <span className="text-[9px] font-black uppercase mt-3">{ac.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-3">2. Taktischer Fokus</label>
                      <div className="grid grid-cols-2 gap-3">
                        {foci.map(f => (
                          <button
                            key={f.id}
                            onClick={() => setTrainingFocus(f.id)}
                            className={`p-3 rounded-lg border text-left transition-all ${trainingFocus === f.id ? "bg-neon/10 border-neon text-navy font-black" : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-white"}`}
                          >
                            <span className="text-xs uppercase tracking-widest">{f.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 w-full mt-4">
                      <button
                        onClick={generatePlan}
                        disabled={isGenerating}
                        className="flex-1 bg-navy text-white font-black uppercase text-xs tracking-widest py-4 rounded-xl hover:bg-redbull transition-all shadow-lg shadow-navy/20 flex justify-center items-center gap-2"
                      >
                        {isGenerating ? <Icon name="loader" size={20} className="animate-spin" /> : <Icon name="cpu" size={20} />}
                        {isGenerating ? "Erstelle DNA-Plan..." : "Gerd: Altersgerechten Plan erstellen"}
                      </button>
                      <button
                        onClick={toggleVoiceAI}
                        className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all shadow-lg ${isRecording ? "bg-redbull/20 text-redbull border border-redbull animate-pulse" : "bg-white/5 border border-gray-200 text-gray-400 hover:bg-white/10 hover:text-navy hover:border-neon"}`}
                        title="Voice AI für NLZ-Spezifische Fragen"
                      >
                        <Icon name={isRecording ? "square" : "mic"} size={20} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* AI Plan Renderer / Pitch Mock */}
                <div className="bg-[#050a14] p-8 rounded-2xl border border-neon/20 shadow-2xl relative overflow-hidden flex flex-col min-h-[500px]">
                  <h3 className="text-white font-black uppercase text-sm tracking-widest mb-6 flex items-center gap-3 relative z-10 shrink-0">
                    <Icon name="file-text" className="text-neon" size={20} /> NLZ Training Protocol
                  </h3>

                  <div className="flex-1 overflow-hidden relative z-10 flex flex-col">
                    {trainingPlan && Array.isArray(trainingPlan) ? (
                      <div className="flex flex-col h-full gap-4">
                        <div className="flex gap-2 pb-2 overflow-x-auto custom-scrollbar shrink-0">
                          {trainingPlan.map((d, i) => (
                            <button
                              key={d.id}
                              onClick={() => setActiveDrillId(d.id)}
                              className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all flex items-center gap-2 ${activeDrillId === d.id ? "bg-neon text-navy shadow-[0_0_15px_rgba(0,243,255,0.4)]" : "bg-white/5 text-white/40 hover:text-white border border-white/10"}`}
                            >
                              Phase {i + 1}
                            </button>
                          ))}
                        </div>
                        
                        {/* Rendering the active drill */}
                        {(() => {
                          const activeDrill = trainingPlan.find(d => d.id === activeDrillId) || trainingPlan[0];
                          if (!activeDrill) return null;
                          return (
                            <div className="flex-1 bg-black/60 rounded-xl border border-neon/30 flex flex-col overflow-hidden animate-fade-in">
                               <div className="p-4 border-b border-white/10 flex justify-between items-start bg-navy/20">
                                  <div>
                                     <div className="text-[10px] text-neon font-mono uppercase mb-1">{activeDrill.phase || "Drill"} • {activeDrill.duration || "15 Min"}</div>
                                     <h4 className="text-white font-black uppercase text-sm">{activeDrill.name}</h4>
                                  </div>
                               </div>
                               <div className="p-4 flex-1 overflow-y-auto custom-scrollbar flex flex-col md:flex-row gap-6">
                                  <div className="flex-1">
                                    <p className="text-xs text-white/70 leading-relaxed font-mono whitespace-pre-wrap">{activeDrill.description}</p>
                                  </div>
                                  
                                  {/* THE PITCH VISUALIZATION */}
                                  <div className="w-full md:w-48 xl:w-64 shrink-0 relative flex justify-center">
                                      <div className="relative w-full aspect-[420/640] border-2 border-white/10 rounded-lg bg-green-900/10 overflow-hidden">
                                        <div className="absolute top-1/2 left-0 right-0 border-t-2 border-white/10 pointer-events-none"></div>
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-2 border-white/10 rounded-full pointer-events-none"></div>
                                        
                                        {/* Player Dots */}
                                        {activeDrill.technicalData && activeDrill.technicalData.positions && Object.entries(activeDrill.technicalData.positions).map(([pId, pos]) => (
                                          <div key={pId} className="absolute w-3 h-3 bg-neon rounded-full shadow-[0_0_8px_rgba(0,243,255,0.8)] flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500" style={{ left: `${pos.x}%`, top: `${pos.y}%` }}>
                                             <div className="w-1 h-1 bg-black rounded-full" />
                                          </div>
                                        ))}
                                      </div>
                                  </div>
                               </div>
                            </div>
                          );
                        })()}
                      </div>
                    ) : (
                      <>
                        <div className="absolute inset-x-8 inset-y-8 border-2 border-white/10 rounded-lg pointer-events-none"></div>
                        <div className="absolute top-1/2 left-8 right-8 border-t-2 border-white/10 pointer-events-none"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-2 border-white/10 rounded-full pointer-events-none"></div>
                        <div className="h-full flex flex-col items-center justify-center opacity-40 text-center px-8 relative z-10">
                            <Icon name="layout" size={48} className="text-neon mb-4" />
                            <p className="text-xs uppercase tracking-widest font-black text-white leading-relaxed">
                            Wähle Altersklasse und Fokus.<br/>
                            Gerd 2.0 kontextualisiert die Übungen basierend auf der Red Bull DNA und der kognitiven Aufnahmefähigkeit der Spieler.
                            </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* === YOUTH SQUAD (FIFA CARDS) === */}
          {activeNlzView === "squad" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-black italic tracking-tighter text-navy flex items-center gap-3 uppercase">
                  <Icon name="users" size={28} className="text-redbull" /> Nachwuchs Kader
                </h2>
                <button
                  onClick={handleAutoFillYouthSquad}
                  disabled={isAutoFillingYouth || !clubIdentity.name}
                  className={`px-4 py-2 font-black uppercase text-[10px] rounded-lg tracking-widest flex items-center gap-2 transition-all ${isAutoFillingYouth ? "bg-white/10 text-gray-500 cursor-not-allowed border border-gray-200" : clubIdentity.name ? "bg-neon text-navy shadow-[0_0_15px_rgba(0,243,255,0.4)] hover:scale-105 hover:bg-white" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
                  title={clubIdentity.name ? "Jugend-Kader via KI importieren" : "Bitte zuerst Club in Settings eintragen"}
                >
                  {isAutoFillingYouth ? <Icon name="loader" className="animate-spin" size={16} /> : <Icon name="zap" size={16} />}
                  {isAutoFillingYouth ? "KI-Scouting läuft..." : "KI-Youth-Scouting (Auto-Fill)"}
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {youthPlayers.map((p) => {
                  const ovr = Math.round((p.pac + p.sho + p.pas + p.dri + p.def + p.phy) / 6) || 60;
                  const pot = p.pot || Math.min(99, ovr + 15);
                  
                  return (
                    <div
                      key={p.id}
                      onClick={() => setActiveDossierPlayerId(p.id)}
                      className="group relative p-0 rounded-xl border-2 transition-all cursor-pointer overflow-hidden bg-white border-gray-200 hover:border-gold hover:shadow-[0_0_25px_rgba(255,215,0,0.3)] hover:-translate-y-1"
                    >
                      {/* NLZ FIFA CARD LAYOUT */}
                      {p.image && (
                        <div className="absolute inset-0 z-0">
                           <img src={p.image} alt={p.name} className="w-full h-full object-cover mix-blend-luminosity opacity-20 transition-opacity group-hover:opacity-40" />
                           <div className="absolute inset-0 bg-gradient-to-t from-white via-white/90 to-transparent"></div>
                        </div>
                      )}
                      {!p.image && (
                        <div className="absolute inset-0 z-0 bg-gradient-to-br from-gray-50 to-gray-200"></div>
                      )}
                      
                      <div className="flex flex-col h-[280px] uppercase font-black tracking-tighter justify-between relative z-10 p-1">
                        <div>
                          <div className="flex justify-between p-3 pb-0">
                            <div className="flex flex-col items-center">
                              <span className="text-3xl leading-none text-navy">
                                {ovr}
                              </span>
                              <span className="text-[10px] text-gray-500 tracking-widest mt-1">
                                OVR
                              </span>
                            </div>
                            <div className="flex flex-col items-center">
                              <span className="text-3xl leading-none text-gold">
                                {pot}
                              </span>
                              <span className="text-[10px] text-gray-500 tracking-widest mt-1">
                                POT
                              </span>
                            </div>
                          </div>
                          <div className="text-center mt-2">
                            <span className="px-3 py-1 bg-navy/10 text-navy rounded-full text-[9px] font-black uppercase tracking-widest">
                              {p.group.toUpperCase()} • {p.position}
                            </span>
                          </div>
                        </div>
                        
                        <div className="px-4 text-center mt-auto bg-white/50 backdrop-blur-sm mx-2 mb-2 rounded-xl border border-white/50 pb-3 pt-2">
                           <div className="text-sm text-navy truncate font-black italic tracking-widest leading-none mb-2">
                             {p.name}
                           </div>
                           <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-2"></div>
                           <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[9px] text-gray-600 font-mono">
                               <div className="flex justify-between"><span>PAC</span><span className="text-navy">{p.pac || 50}</span></div>
                               <div className="flex justify-between"><span>DRI</span><span className="text-navy">{p.dri || 50}</span></div>
                               <div className="flex justify-between"><span>SHO</span><span className="text-navy">{p.sho || 50}</span></div>
                               <div className="flex justify-between"><span>DEF</span><span className="text-navy">{p.def || 50}</span></div>
                               <div className="flex justify-between"><span>PAS</span><span className="text-navy">{p.pas || 50}</span></div>
                               <div className="flex justify-between"><span>PHY</span><span className="text-navy">{p.phy || 50}</span></div>
                           </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* === FINANCE & ADMIN (Phase 30) === */}
          {activeNlzView === "finance" && (() => {
            const nlzCount = youthPlayers.length;
            const finances = truthObject.nlz_hub?.finances || { monthly_fee_per_player: 150, equipment_budget: 15000, travel_costs: 5000, materials: 3000 };
            const monthlyRevenue = nlzCount * finances.monthly_fee_per_player;
            const annualRevenue = monthlyRevenue * 12;
            const totalExpenses = finances.equipment_budget + finances.travel_costs + finances.materials;
            const netBalance = annualRevenue - totalExpenses;

            return (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
                {/* Finance Overview Panel */}
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
                        <div className="text-xs text-gray-500 mt-2 font-mono">{nlzCount} Spieler × €{finances.monthly_fee_per_player} / Monat</div>
                      </div>
                      <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 flex flex-col justify-center items-center text-center">
                        <div className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">Fixe Ausgaben (Jahr)</div>
                        <div className="text-4xl font-black text-redbull leading-none">€ {totalExpenses.toLocaleString()}</div>
                        <div className="text-xs text-gray-500 mt-2 font-mono">Equipment, Reisen, Material</div>
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

                {/* Expense Settings Panel */}
                <div className="space-y-6">
                  <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-xl h-full">
                    <h3 className="text-navy font-black uppercase text-sm tracking-widest mb-6 flex items-center gap-3">
                      <Icon name="settings" className="text-gray-400" size={20} /> Kosten-Kalkulator
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">Spielerbeitrag / Monat (€)</label>
                        <input
                          type="number"
                          value={finances.monthly_fee_per_player}
                          onChange={(e) => dispatchAction('UPDATE_NLZ_FINANCE', { key: 'monthly_fee_per_player', value: parseInt(e.target.value) || 0 })}
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-navy font-mono font-black focus:border-gold outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">Trikotsätze & Equipment (€)</label>
                        <input
                          type="number"
                          value={finances.equipment_budget}
                          onChange={(e) => dispatchAction('UPDATE_NLZ_FINANCE', { key: 'equipment_budget', value: parseInt(e.target.value) || 0 })}
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-navy font-mono font-black focus:border-gold outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">Fahrtkosten / Turniere (€)</label>
                        <input
                          type="number"
                          value={finances.travel_costs}
                          onChange={(e) => dispatchAction('UPDATE_NLZ_FINANCE', { key: 'travel_costs', value: parseInt(e.target.value) || 0 })}
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-navy font-mono font-black focus:border-gold outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">Trainingsmaterialien (€)</label>
                        <input
                          type="number"
                          value={finances.materials}
                          onChange={(e) => dispatchAction('UPDATE_NLZ_FINANCE', { key: 'materials', value: parseInt(e.target.value) || 0 })}
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-navy font-mono font-black focus:border-gold outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* === CHARACTER MATRIX (Psycho Profiling) === */}
          {activeNlzView === "character" && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                {youthPlayers.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setActiveDossierPlayerId(p.id)}
                    className={`shrink-0 flex items-center gap-3 p-4 rounded-xl border transition-all ${activeDossierPlayerId === p.id ? "bg-white border-neon shadow-[0_5px_15px_rgba(0,243,255,0.2)]" : "bg-white/50 border-gray-200 text-gray-400 hover:bg-white"}`}
                  >
                    <div className="w-10 h-10 rounded-full bg-navy flex items-center justify-center font-black text-white text-[10px] tracking-widest">
                      {p.position}
                    </div>
                    <div className="text-left">
                      <div className={`font-black ${activeDossierPlayerId === p.id ? "text-navy" : "text-gray-500"}`}>
                        {p.name}
                      </div>
                      <div className="text-[9px] uppercase tracking-widest text-gray-400">
                        PSY-INDEX: {Math.round((p.focus * 10) + (10 - p.frustration) * 5)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {activeDossierPlayerId && (() => {
                const p = youthPlayers.find((x) => x.id === activeDossierPlayerId);
                if (!p) return null;

                // Mock Psycho Data based on player stats
                const traits = [
                  { label: "Resilienz", val: Math.min(100, (10 - p.frustration) * 10 + 20) },
                  { label: "Führung", val: p.phy > 70 ? 85 : 45 },
                  { label: "Teamgeist", val: p.pas > 65 ? 90 : 60 },
                  { label: "Fokus", val: p.focus * 10 },
                  { label: "Ehrgeiz", val: p.pac > 75 ? 95 : 70 },
                ];

                // SVG Radar Math
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

                const generatePedagogicalTip = async () => {
                  setIsFetchingTip(true);
                  setPedagogicalTip("");
                  try {
                    const prompt = `Du bist 'Pedagogical Advisor' im Fuchs NLZ.
                        Ein Trainer fragt nach Umgangstipps für den Spieler ${p.name}.
                        Sein Profil: Resilienz ${traits[0].val}/100, Führung ${traits[1].val}/100, Fokus ${traits[3].val}/100.
                        Gib dem Trainer 2 konkrete, psychologisch fundierte Kommunikations-Tipps im 'Med-Tech' Stil.`;

                    const res = await askAI(prompt, "System");
                    setPedagogicalTip(res);
                    gerdSpeak("Pädagogische Empfehlung geladen.", "System");
                  } catch (e) {
                    setPedagogicalTip("Fehler beim Abruf der Empfehlung.");
                  } finally {
                    setIsFetchingTip(false);
                  }
                };

                return (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* LEFT: Radar Chart Dashboard */}
                    <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-neon/5 rounded-bl-[100px] pointer-events-none"></div>

                      <h3 className="text-navy font-black uppercase text-sm tracking-widest mb-8 flex items-center gap-3">
                        <Icon name="target" className="text-neon" size={20} /> Character Matrix: {p.name}
                      </h3>

                      <div className="flex justify-center items-center mb-8 relative">
                        <svg width={size} height={size} className="overflow-visible">
                          {/* Background Web */}
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
                          {/* Axes */}
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
                          {/* Data Polygon */}
                          <polygon
                            points={polygonPoints}
                            fill="rgba(0, 243, 255, 0.2)"
                            stroke="#00f3ff"
                            strokeWidth="3"
                            className="drop-shadow-[0_0_10px_rgba(0,243,255,0.5)] transition-all duration-700"
                          />
                          {/* Data Points & Labels */}
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

                      {/* Professional Contract Input (Truth Object Feed) */}
                      <div className="mt-8 pt-8 border-t border-gray-100">
                        <h4 className="text-[10px] text-navy font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                          <Icon name="file-text" size={14} className="text-gold" /> Vertrags-Daten (CFO Bridge)
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[9px] text-gray-400 uppercase font-black">Monatl. Fahrtkosten (€)</label>
                            <input
                              type="number"
                              className="w-full bg-gray-50 border border-gray-200 rounded px-3 py-2 text-xs font-mono"
                              placeholder="0"
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                setTruthObject(prev => ({
                                  ...prev,
                                  financials: {
                                    ...prev.financials,
                                    fixed_costs: {
                                      ...prev.financials.fixed_costs,
                                      nlz_parent_payments: val + (prev.financials.fixed_costs.nlz_parent_payments || 0) // Simplified additive simulation
                                    }
                                  }
                                }));
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] text-gray-400 uppercase font-black">Teilnahme-Gebühr (€)</label>
                            <input
                              type="number"
                              className="w-full bg-gray-50 border border-gray-200 rounded px-3 py-2 text-xs font-mono"
                              placeholder="0"
                            />
                          </div>
                        </div>
                        <p className="text-[8px] text-gray-400 font-mono mt-2 italic">* Diese Daten fließen direkt in das CFO 2.0 Dashboard ein.</p>
                      </div>
                    </div>

                    {/* RIGHT: Pedagogical Advisor */}
                    <div className="flex flex-col gap-8">
                      <div className="bg-navy p-8 rounded-2xl border border-gray-800 shadow-2xl flex-1 flex flex-col relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 opacity-5 pointer-events-none">
                          <Icon name="cpu" size={160} className="text-neon" />
                        </div>

                        <h3 className="text-white font-black uppercase text-sm tracking-widest mb-2 flex items-center gap-3">
                          <Icon name="message-circle" className="text-neon" size={20} /> Pedagogical Advisor
                        </h3>
                        <p className="text-gray-400 text-[10px] uppercase tracking-[0.2em] mb-8">KI-Coaching Feedback System</p>

                        <div className="flex-1">
                          {pedagogicalTip ? (
                            <div className="bg-black/30 p-6 rounded-xl border border-neon/20 animate-scale-in">
                              <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-full bg-neon flex items-center justify-center text-navy shadow-[0_0_15px_rgba(0,243,255,0.4)]">
                                  <Icon name="check" size={16} />
                                </div>
                                <span className="text-[10px] font-black text-neon uppercase tracking-widest">Empfehlung Bereit</span>
                              </div>
                              <div className="text-sm font-mono text-gray-300 leading-relaxed whitespace-pre-wrap">
                                {pedagogicalTip}
                              </div>
                            </div>
                          ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-50 border-2 border-dashed border-gray-700 rounded-xl p-8">
                              <Icon name="user-plus" size={32} className="text-gray-500 mb-4" />
                              <p className="text-[10px] text-gray-400 uppercase tracking-widest">Generiere spezifische Umgangstipps basierend auf dem Psyche-Profil.</p>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={generatePedagogicalTip}
                          disabled={isFetchingTip}
                          className="mt-6 w-full bg-neon text-navy py-4 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-white transition-all shadow-[0_0_20px_rgba(0,243,255,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {isFetchingTip ? <Icon name="loader" size={16} className="animate-spin" /> : <Icon name="zap" size={16} />}
                          {isFetchingTip ? "Analysiere Psyche..." : "Coaching-Tipp anfordern"}
                        </button>
                      </div>

                      {/* AI DEVELOPMENT COACH (NEW) */}
                      <div className="bg-[#050a14] p-8 rounded-2xl border border-cyan-500/20 shadow-2xl relative overflow-hidden flex flex-col">
                        <div className="absolute top-0 right-0 w-40 h-40 opacity-5 pointer-events-none text-cyan-400">
                          <Icon name="trending-up" size={160} />
                        </div>

                        <h3 className="text-white font-black uppercase text-sm tracking-widest mb-2 flex items-center gap-3">
                          <Icon name="shield" className="text-cyan-400" size={20} /> AI Development Coach
                        </h3>
                        <p className="text-white/40 text-[10px] uppercase tracking-[0.2em] mb-8">Profi-DNA Gap-Analysator</p>

                        <div className="flex-1">
                          {developmentReport ? (
                            <div className="bg-cyan-900/10 p-6 rounded-xl border border-cyan-500/30 animate-slide-up">
                              <div className="text-[11px] font-mono text-cyan-100/80 leading-relaxed whitespace-pre-wrap">
                                {developmentReport}
                              </div>
                            </div>
                          ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-40 border-2 border-dashed border-white/10 rounded-xl p-8">
                              <Icon name="activity" size={32} className="text-white/20 mb-4" />
                              <p className="text-[9px] text-white/40 uppercase tracking-widest leading-relaxed">Abgleich mit der Taktik-DNA der 1. Mannschaft (Global Context Core): {truthObject.tactical_setup.formation_home}</p>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => handleDevCheck(p)}
                          disabled={isDevLoading}
                          className="mt-6 w-full bg-cyan-600 hover:bg-cyan-400 text-white font-black uppercase text-[10px] tracking-widest py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(34,211,238,0.2)] flex items-center justify-center gap-2"
                        >
                          {isDevLoading ? <Icon name="loader" size={16} className="animate-spin" /> : <Icon name="crosshair" size={16} />}
                          {isDevLoading ? "Berechne Gap..." : "Profi-Check starten"}
                        </button>
                      </div>

                      {/* Quick Stats overview */}
                      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-lg grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-xl font-black text-navy">{p.focus * 10}%</div>
                          <div className="text-[8px] uppercase tracking-widest text-gray-400 font-black mt-1">Trainingsfokus</div>
                        </div>
                        <div className="border-x border-gray-100">
                          <div className="text-xl font-black text-redbull">{p.frustration * 10}%</div>
                          <div className="text-[8px] uppercase tracking-widest text-gray-400 font-black mt-1">Frust-Level</div>
                        </div>
                        <div>
                          <div className="text-xl font-black text-gold">{p.phy || 60}</div>
                          <div className="text-[8px] uppercase tracking-widest text-gray-400 font-black mt-1">Physis</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* === BIOMECHANICS DASHBOARD === */}
          {activeNlzView === "biomechanics" && (
            <div className="space-y-8 animate-fade-in">
              <div className="bg-white p-1 rounded-2xl border border-gray-200 shadow-xl overflow-hidden flex flex-col xl:flex-row">

                {/* LEFT: Player Selection & Alerts */}
                <div className="w-full xl:w-1/3 bg-gray-50 p-8 border-r border-gray-200 flex flex-col">
                  <h3 className="text-navy font-black uppercase text-sm tracking-widest mb-8 flex items-center gap-3">
                    <Icon name="activity" className="text-redbull" size={20} /> Medical Watchlist
                  </h3>

                  {/* Growth Spurt Alert Mock */}
                  <div className="bg-red-50 border border-red-200 rounded-xl p-5 mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-redbull opacity-10 rounded-bl-[100px]"></div>
                    <div className="flex items-start gap-3">
                      <Icon name="alert-triangle" className="text-redbull mt-1" size={18} />
                      <div>
                        <h4 className="text-[10px] font-black text-redbull uppercase tracking-widest mb-1">Growth Spurt Alert</h4>
                        <p className="text-xs text-red-900 font-mono">3 Spieler in kritischer Wachstumsphase. Osgood-Schlatter Risiko erhöht. Trainingslast reduzieren.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar">
                    {youthPlayers.slice(0, 5).map((p, idx) => (
                      <button
                        key={p.id}
                        onClick={() => setActiveDossierPlayerId(p.id)}
                        className={`w-full text-left p-4 rounded-xl border flex items-center justify-between transition-all ${activeDossierPlayerId === p.id ? "bg-white border-redbull shadow-md" : "bg-transparent border-gray-200 hover:bg-white"}`}
                      >
                        <div>
                          <div className="font-black text-navy text-sm">{p.name}</div>
                          <div className="text-[9px] uppercase tracking-widest text-gray-400 font-black">{p.position} | Alter: {14 + (idx % 4)}</div>
                        </div>
                        {idx % 3 === 0 && <div className="w-2 h-2 rounded-full bg-redbull animate-pulse"></div>}
                        {idx % 3 === 1 && <div className="w-2 h-2 rounded-full bg-gold"></div>}
                        {idx % 3 === 2 && <div className="w-2 h-2 rounded-full bg-green-500"></div>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* RIGHT: Wireframe Body Heatmap */}
                <div className="flex-1 p-8 bg-white relative flex items-center justify-center min-h-[500px]">
                  <div className="absolute top-8 left-8">
                    <h4 className="font-black uppercase text-xl text-navy tracking-tighter">
                      {activeDossierPlayerId ? youthPlayers.find(p => p.id === activeDossierPlayerId)?.name : "Bitte Spieler wählen"}
                    </h4>
                    <p className="text-[10px] font-mono uppercase text-gray-400 tracking-[0.2em] mt-1">Live Biomechanik-Scan</p>
                  </div>

                  <div className="absolute top-8 right-8 flex gap-4 text-[9px] font-black uppercase tracking-widest text-gray-400">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-redbull"></div> High Stress</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-gold"></div> Mod. Stress</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-neon"></div> Optimal</div>
                  </div>

                  {activeDossierPlayerId ? (
                    <div className="relative w-64 h-96">
                      {/* Minimalist SVG Body Wireframe Mock */}
                      <svg viewBox="0 0 100 200" className="w-full h-full drop-shadow-2xl">
                        {/* Head */}
                        <circle cx="50" cy="20" r="12" fill="none" stroke="#e5e7eb" strokeWidth="2" />
                        {/* Torso */}
                        <path d="M 35 40 L 65 40 L 60 100 L 40 100 Z" fill="none" stroke="#e5e7eb" strokeWidth="2" />
                        {/* Arms */}
                        <path d="M 35 40 L 15 70 L 10 100" fill="none" stroke="#e5e7eb" strokeWidth="2" />
                        <path d="M 65 40 L 85 70 L 90 100" fill="none" stroke="#e5e7eb" strokeWidth="2" />
                        {/* Legs */}
                        <path d="M 40 100 L 30 150 L 30 190" fill="none" stroke="#e5e7eb" strokeWidth="2" />
                        <path d="M 60 100 L 70 150 L 70 190" fill="none" stroke="#e5e7eb" strokeWidth="2" />

                        {/* Joint Indicators (Heatmap) */}
                        {/* Shoulders */}
                        <circle cx="35" cy="40" r="4" fill="#00f3ff" className="animate-pulse" />
                        <circle cx="65" cy="40" r="4" fill="#00f3ff" className="animate-pulse" />
                        {/* Knees - High Risk Zone Mock */}
                        <circle cx="30" cy="150" r="6" fill="#E21B4D" className="animate-ping opacity-75" />
                        <circle cx="30" cy="150" r="4" fill="#E21B4D" />

                        <circle cx="70" cy="150" r="4" fill="#E21B4D" />

                        {/* Ankles */}
                        <circle cx="30" cy="190" r="4" fill="#D4AF37" />
                        <circle cx="70" cy="190" r="4" fill="#D4AF37" />
                      </svg>

                      {/* Data Tooltips */}
                      <div className="absolute top-[70%] -left-16 bg-black text-white p-3 rounded-lg border border-redbull shadow-[0_0_20px_rgba(226,27,77,0.3)] w-40 animate-fade-in">
                        <div className="text-[10px] font-black uppercase tracking-widest text-redbull mb-1">Patellasehne L</div>
                        <div className="text-xs font-mono">Belastung: 89%</div>
                        <div className="text-[8px] text-gray-400 mt-1">Intervention empfohlen</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-300 text-center">
                      <Icon name="user" size={64} className="mx-auto mb-4 opacity-20" />
                      <p className="text-xs font-black uppercase tracking-widest opacity-50">Select Player to view Biomechanics</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* === TALENT PIPELINE === */}
          {activeNlzView === "pipeline" && (
            <div className="space-y-8 animate-fade-in">
              <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 font-black text-9xl italic tracking-tighter text-navy pointer-events-none">
                  PRO
                </div>

                <div className="mb-12">
                  <h3 className="text-navy font-black uppercase text-xl tracking-widest flex items-center gap-3 mb-2">
                    <Icon name="git-pull-request" size={28} className="text-gold" /> Vertical Talent-Pipeline
                  </h3>
                  <p className="text-gray-400 text-[10px] font-mono uppercase tracking-[0.2em]">Drag & Drop Promotion to Shadow-Scouting Pool</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                  {/* Pipeline Connectors */}
                  <div className="hidden md:block absolute top-[50%] left-[20%] right-[20%] h-1 bg-gradient-to-r from-gray-200 via-neon to-redbull -z-10 transform -translate-y-1/2"></div>

                  {/* Stage 1: U15 / U17 (Mock data) */}
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 shadow-sm relative">
                    <div className="absolute -top-3 left-6 bg-navy text-white px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest">
                      Phase 1: U15-U17
                    </div>
                    <div className="mt-4 space-y-3 min-h-[200px]">
                      {youthPlayers.slice(0, 3).map(p => (
                        <div
                          key={p.id}
                          className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm flex justify-between items-center"
                        >
                          <div>
                            <div className="text-xs font-black text-navy">{p.name}</div>
                            <div className="text-[9px] uppercase tracking-widest text-gray-400">{p.position}</div>
                          </div>
                          <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-400">
                            {Math.round((p.pac + p.sho + p.pas) / 3)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Stage 2: U19 Elite */}
                  <div className="bg-neon/5 border border-neon/30 rounded-xl p-6 shadow-sm relative shadow-[0_0_30px_rgba(0,243,255,0.1)]">
                    <div className="absolute -top-3 left-6 bg-neon text-navy px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest">
                      Phase 2: U19 Elite
                    </div>
                    <div className="mt-4 space-y-3 min-h-[200px]">
                      {youthPlayers.slice(3, 5).map(p => (
                        <div
                          key={p.id}
                          draggable
                          onDragStart={(e) => {
                            setDraggedTalentId(p.id);
                            e.dataTransfer.setData('text/plain', p.id);
                          }}
                          className="bg-white p-3 border border-neon/50 rounded-lg shadow-md cursor-grab active:cursor-grabbing flex justify-between items-center transform hover:-translate-y-1 transition-transform relative group"
                        >
                          <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-6 bg-neon rounded-r opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <div>
                            <div className="text-xs font-black text-navy">{p.name}</div>
                            <div className="text-[9px] uppercase tracking-widest text-neon font-black drop-shadow-sm">{p.position}</div>
                          </div>
                          <div className="w-6 h-6 rounded-full bg-neon flex items-center justify-center text-[10px] font-black text-navy">
                            {Math.round((p.pac + p.sho + p.pas + 10) / 3)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Stage 3: Pro Shadow Pool (Dropzone) */}
                  <div
                    className="bg-black border-2 border-dashed border-redbull/50 rounded-xl p-6 shadow-2xl relative transition-all"
                    onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('bg-redbull/10', 'border-redbull'); }}
                    onDragLeave={(e) => { e.currentTarget.classList.remove('bg-redbull/10', 'border-redbull'); }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove('bg-redbull/10', 'border-redbull');
                      if (draggedTalentId) {
                        const player = youthPlayers.find(p => p.id === draggedTalentId);
                        if (player && window.confirm(`${player.name} in den Shadow-Scouting Pool der Profis übernehmen?`)) {
                          promoteToProSquad(draggedTalentId);
                          setDraggedTalentId(null);
                          setActiveNlzView("character"); // Redirect to reset view
                        }
                      }
                    }}
                  >
                    <div className="absolute -top-3 left-6 bg-redbull text-white px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(226,27,77,0.5)]">
                      Phase 3: Shadow-Scouting Pool
                    </div>
                    <div className="mt-4 h-full min-h-[200px] flex flex-col items-center justify-center text-center opacity-70">
                      <Icon name="arrow-down-circle" size={48} className="text-redbull mb-4 animate-bounce" />
                      <p className="text-white text-xs font-black uppercase tracking-widest">Drop Talent Here</p>
                      <p className="text-[9px] text-gray-400 font-mono mt-2">Export to CFO/Scouting System</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Academy Showcase */}
          <div className="glass-panel p-8 rounded-3xl border border-gold/20 bg-gold/5">
            <h3 className="text-gold font-black uppercase text-sm tracking-widest mb-4 flex items-center gap-3">
              <Icon name="star" size={20} /> Stark Elite Tutorials
            </h3>
            <p className="text-white/40 text-[10px] uppercase font-black mb-6">
              Offizielle Referenz-Videos der Akademie
            </p>
            <div className="space-y-4">
              {[
                "Dribbling Masterclass",
                "Ballkontrolle U12",
                "Funino Prinzipien",
              ].map((t, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 bg-black/40 p-4 rounded-xl border border-white/5 hover:border-gold/50 cursor-pointer transition-all"
                >
                  <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center">
                    <Icon name="play" size={20} className="text-gold" />
                  </div>
                  <div className="text-[10px] font-black text-white uppercase tracking-widest">
                    {t}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

const App = () => {
  const [view, setView] = useState("dashboard"); // 'dashboard' | 'vr'
  const [activeTab, setActiveTab] = useState("home");
  const [nlzAgeGroup, setNlzAgeGroup] = useState("funino");
  const [isShift, setIsShift] = useState(false);
  const [isSymbols, setIsSymbols] = useState(false);
  const [kbValue, setKbValue] = useState("");
  const [isSuitcaseOpen, setIsSuitcaseOpen] = useState(false);
  const [aiEngine, setAiEngine] = useState("cloud");

  // PHASE 24 & 25: Multi-Domain Conversational Co-Trainer History
  const conversationHistory = useRef(
    JSON.parse(localStorage.getItem("gerd_conversationHistory")) || {
      tactical: [],
      training_lab: [],
      "stadion-kurier": [],
      medical: [],
      cfo: []
    }
  );
  const [activeRole, setActiveRole] = useState("Trainer"); // Phase 17: Role Switcher State
  const [truthObject, setTruthObject] = useState(() => {
    const defaultTruth = {
      club_identity: {
        name: "Stark Elite",
        league: "Regionalliga",
        philosophy: "Ballbesitz & Pressing"
      },
      financials: {
        current_budget: 0,
        fixed_costs: {
          nlz_parent_payments: 0,
          staff_salaries: 0,
          facility_maintenance: 0
        },
        variable_costs: {
          scouting_travel: 0,
          transfer_installments: []
        },
        revenue: {
          sponsoring: 0,
          merchandising: 0
        }
      },
      tactical_setup: {
        formation_home: "4-4-2",
        formation_away: "3-4-3",
        active_players_on_field: [],
        saved_plays: []
      },
      training_lab: {
        schedule: [
          {
            day: "Montag",
            name: "Ginga & Gegenpressing Foundation",
            focus: "Technik/Taktik",
            intensity: 90,
            timestamp: new Date().toISOString(),
            drills: [
              { id: "d1", name: "Ginga Circle", description: "Close control in tight spaces", duration: "15m", technicalData: { positions: { 1: { x: 200, y: 300 }, 2: { x: 250, y: 350 } }, paths: [] } },
              { id: "d2", name: "Heavy Pressing 4v4", description: "High intensity ball recovery", duration: "20m", technicalData: { positions: { 3: { x: 100, y: 100 }, 4: { x: 150, y: 150 } }, paths: [] } }
            ]
          }
        ],
        presets: [
          { id: "ginga_1", name: "Ginga Skill Circle (Brasilien-Style)", focus: "Technik", intensity: 75 },
          { id: "samba_rondo", name: "Samba Rondo 5v2", focus: "Ballkontrolle", intensity: 80 },
          { id: "gegn_1", name: "Heavy Metal Pressing (Vollgas)", focus: "Taktik", intensity: 100 }
        ],
        active_focus: "Gegenpressing"
      },
      match_day_manifesto: {
        strategy: "Offensive Power",
        starting_xi_notes: "",
        intensity_level: 95
      },
      scouting_pool: {
        shadow_roster: [],
        shortlisted_players: []
      },
      medical: [],
      cfo: []
    };

    const saved = localStorage.getItem("gerd_truthObject");
    if (saved) {
       try {
           const parsed = JSON.parse(saved);
           // Deep merge to ensure deeply nested defaults (like financials.fixed_costs) are always present
           return {
               ...defaultTruth,
               ...parsed,
               financials: {
                   ...defaultTruth.financials,
                   ...(parsed.financials || {}),
                   fixed_costs: {
                       ...defaultTruth.financials.fixed_costs,
                       ...(parsed.financials?.fixed_costs || {})
                   },
                   variable_costs: {
                       ...defaultTruth.financials.variable_costs,
                       ...(parsed.financials?.variable_costs || {})
                   },
                   revenue: {
                       ...defaultTruth.financials.revenue,
                       ...(parsed.financials?.revenue || {})
                   }
               }
           };
       } catch (e) {
           return defaultTruth;
       }
    }
    return defaultTruth;
  });

  useEffect(() => {
    localStorage.setItem("gerd_truthObject", JSON.stringify(truthObject));
  }, [truthObject]);

  const dispatchAction = (action, payload) => {
    console.log(`[Unified Event System] Dispatching: ${action}`, payload);
    setTruthObject(prev => {
      const next = { ...prev };
      switch (action) {
        case 'UPDATE_BUDGET':
          next.financials.current_budget = payload;
          break;
        case 'HYDRATE_SQUAD':
          next.club_identity = { ...next.club_identity, ...payload.identity };
          next.financials = { ...next.financials, ...payload.financials };
          next.tactical_setup = { ...next.tactical_setup, ...payload.tactical };
          break;
        case 'ADD_SCOUT_TARGET':
          next.scouting_pool.shadow_roster = [...next.scouting_pool.shadow_roster, payload];
          break;
        case 'SIGN_PLAYER':
          next.scouting_pool.shadow_roster = next.scouting_pool.shadow_roster.filter(p => p.id !== payload.id);
          next.financials.current_budget -= (payload.marketValue || 0);
          break;
        case 'ADD_PLAYER':
          next.scouting_pool.shadow_roster = next.scouting_pool.shadow_roster.filter(p => true); // dummy
          break;
        case 'REGISTER_PLAYER':
          // Handled via setPlayers but sync with truthObject
          break;
        case 'PROMOTE_YOUTH':
          // Move from youth pool to pro squad
          break;
        case 'MEDICAL_UPDATE':
          // logic for medical reports
          break;
        case 'SAVE_TRAINING_SESSION':
          next.training_lab.schedule = [...next.training_lab.schedule, { ...payload, drills: payload.drills || [] }];
          break;
        case 'SWAP_DRILL':
          next.training_lab.schedule = next.training_lab.schedule.map(s => {
            if (s.day === payload.day) {
              return {
                ...s,
                drills: s.drills.map(d => d.id === payload.oldId ? payload.newDrill : d)
              };
            }
            return s;
          });
          break;
        case 'SET_DRILLS_FOR_DAY':
          next.training_lab.schedule = next.training_lab.schedule.map(s =>
            s.day === payload.day ? { ...s, drills: payload.drills } : s
          );
          if (!next.training_lab.schedule.find(s => s.day === payload.day)) {
            next.training_lab.schedule.push({ day: payload.day, name: `AI Session: ${payload.day}`, focus: "AI Balanced", intensity: 80, drills: payload.drills });
          }
          break;
        case 'UPDATE_MATCH_MANIFESTO':
          next.match_day_manifesto = { ...next.match_day_manifesto, ...payload };
          break;
        case 'SET_TRAINING_FOCUS':
          next.training_lab.active_focus = payload;
          break;
        case 'TRAINING_UPDATE':
          // logic for training
          break;
        case 'UPDATE_FINANCIALS':
          if (payload.path === 'current_budget') {
            next.financials.current_budget = payload.value;
            setBudget(payload.value);
            localStorage.setItem("gerd_userBudget", payload.value.toString());
          } else if (payload.path.startsWith('revenue.')) {
            const key = payload.path.split('.')[1];
            next.financials.revenue[key] = payload.value;
          } else if (payload.path.startsWith('fixed_costs.')) {
            const key = payload.path.split('.')[1];
            next.financials.fixed_costs[key] = payload.value;
          }
          break;
        case 'UPDATE_AD_SPACE':
          next.media_suite.ad_spaces = next.media_suite.ad_spaces.map(ad =>
            ad.id === payload.id ? { ...ad, ...payload.data } : ad
          );
          if (payload.data.booked && payload.data.price) {
            next.financials.revenue.sponsoring += payload.data.price;
            next.financials.current_budget += payload.data.price;
            setBudget(prevB => prevB + payload.data.price);
          }
          break;
        case 'UPDATE_NLZ_FINANCE':
          next.nlz_hub.finances[payload.key] = payload.value;
          break;
        case 'SAVE_TRAINING_SESSION':
          next.training_lab.schedule = [...next.training_lab.schedule, payload];
          break;
        case 'UPDATE_MATCH_MANIFESTO':
          next.match_day_manifesto = { ...next.match_day_manifesto, ...payload };
          break;
        case 'SET_TRAINING_FOCUS':
          next.training_lab.active_focus = payload;
          break;
        case 'ADD_EDITORIAL':
          next.media_suite.editorial_history = [payload, ...next.media_suite.editorial_history];
          break;
        case 'UPDATE_BRANDING':
          next.media_suite.branding = { ...next.media_suite.branding, ...payload };
          break;
        default:
          console.warn(`Unknown action: ${action}`);
      }
      return next;
    });
  };

  // --- DATABASE PERSISTENCE ADAPTER (TRD 1.0) ---
  const dbManager = {
    save: async (key, data) => {
      // Simulation of a Cloud DB (Supabase/Firebase) call
      return new Promise((resolve) => {
        setTimeout(() => {
          localStorage.setItem(`gerd_${key}`, JSON.stringify(data));
          resolve({ success: true, timestamp: Date.now() });
        }, 500);
      });
    },
    fetch: async (key) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          const val = localStorage.getItem(`gerd_${key}`);
          resolve(val ? JSON.parse(val) : null);
        }, 300);
      });
    }
  };

  // --- VIDEO HUB STATE ---
  const [activeVideoTool, setActiveVideoTool] = useState("none");
  const [drawings, setDrawings] = useState([]);
  const [is3DFlight, setIs3DFlight] = useState(false);
  const [activeClipIndex, setActiveClipIndex] = useState(0);

  // CFO Board State
  const [cfoTab, setCfoTab] = useState("finance");
  const [cfoScenario, setCfoScenario] = useState("Klassenerhalt"); // 'Aufstieg', 'Klassenerhalt', 'Abstieg'
  const [cfoAiWarning, setCfoAiWarning] = useState("");
  const [scoutingPool, setScoutingPool] = useState([
    { id: 'scout_1', name: "M. TargetA", club: "Stade Rennais", age: 21, marketValue: 12500000, position: "CM", stats: { pac: 78, sho: 72, pas: 88, dri: 80, def: 82, phy: 75 }, nationality: "FR", match: 94 },
    { id: 'scout_2', name: "J. TargetB", club: "FC Brügge", age: 24, marketValue: 8000000, position: "CDM", stats: { pac: 72, sho: 65, pas: 78, dri: 74, def: 89, phy: 85 }, nationality: "BE", match: 82 }
  ]);
  const [activeScoutPlayer, setActiveScoutPlayer] = useState(null);
  const [shadowScoutQuery, setShadowScoutQuery] = useState("");
  const [shadowScoutReport, setShadowScoutReport] = useState("");
  const [sourcingQuery, setSourcingQuery] = useState("");
  const [sourcingReport, setSourcingReport] = useState(null);
  const [contractText, setContractText] = useState("");
  const [auditReport, setAuditReport] = useState("");
  const [investmentSum, setInvestmentSum] = useState(1000000);
  const [investmentAI, setInvestmentAI] = useState("");
  const [isScoutingLoading, setIsScoutingLoading] = useState(false);

  // --- SHADOW SCOUTING STATE ---
  const [scoutView, setScoutView] = useState("dashboard"); // dashboard, import, negotiation
  const [selectedScoutTarget, setSelectedScoutTarget] = useState(null);
  const [draggedPlayer, setDraggedPlayer] = useState(null);
  const [negotiationScenario, setNegotiationScenario] = useState("fee"); // fee, free
  const [scoutAdvisorOutput, setScoutAdvisorOutput] = useState("");
  const [isScoutAdvisorLoading, setIsScoutAdvisorLoading] = useState(false);
  const [scoutSearchQuery, setScoutSearchQuery] = useState("");
  const [scoutSearchResults, setScoutSearchResults] = useState([]);

  const handleScoutSearch = async () => {
    if (!scoutSearchQuery) return;
    setIsScoutingLoading(true);
    addAiLog(`Shadow Scout Search: Initiating deep web crawl for "${scoutSearchQuery}"...`, "process");
    try {
      const epicKey = localStorage.getItem("gerd_epicKey");
      const res = await fetch("http://localhost:3001/api/scout-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: scoutSearchQuery, epicKey }),
      });
      const data = await res.json();
      if (data.ok) {
        setScoutSearchResults(data.matches || []);
        addAiLog(`Scout Search: ${data.matches?.length || 0} potential matches found.`, "success");
      } else {
        addAiLog(`Scout Search failed: ${data.error}`, "error");
      }
    } catch (e) {
      addAiLog(`Scout Search network failure: ${e.message}`, "error");
    } finally {
      setIsScoutingLoading(false);
    }
  };

  const handleScoutAdvisor = async (playerData) => {
    setIsScoutAdvisorLoading(true);
    gerdSpeak("Sports-Director Modus aktiv. Analysiere Taktik-Fit und Finanz-Risiko...", "System");

    const prompt = `Führe eine 'Red Bull DNA Sports Director Analyse' für den Spieler ${playerData.name} durch.
        Daten: ${playerData.stats}. 
        Berücksichtige unseren Globalen Kontext: Taktik ${truthObject.tactical_setup.formation_home}, Budget € ${truthObject.financials.current_budget}.
        
        WACHSTUMS-KRITERIEN (PRIORITÄT):
        1. 'Intensität & Power-Stats': Erreicht er die geforderten Sprint- und Intensitätswerte für unser Pressing-System?
        2. 'Mentale Resilienz': Ist er ein 'Warrior-Type' für Champions-Situationen?
        3. 'Wirtschaftliche Aggression': Inwiefern hebelt dieser Transfer unseren Marktwert bei aggressivem Wiederverkauf?
        
        Stil: Hochprofessionell, kompromisslos, visionär.`;

    try {
      const res = await askAI(prompt, "CFO-Gerd");
      setScoutAdvisorOutput(res);
    } catch (e) {
      setScoutAdvisorOutput("Analyse-Fehler im Neural-Link.");
    }
    setIsScoutAdvisorLoading(false);
  };

  // --- MEDIA SUITE STATE ---
  const [mediaSuiteTool, setMediaSuiteTool] = useState("ai-writer"); // ai-writer, brand-kit, export
  const [mediaTimbre, setMediaTimbre] = useState("Analytisch"); // Analytisch, Emotional, Provokant
  const [mediaCanvasBlocks, setMediaCanvasBlocks] = useState([]);
  const [isExporting, setIsExporting] = useState(false);
  const [suggestedLayoutBlocks, setSuggestedLayoutBlocks] = useState([]);
  const [isMediaAdvisorLoading, setIsMediaAdvisorLoading] = useState(false);
  const [showExportCenter, setShowExportCenter] = useState(false);
  const [exportTarget, setExportTarget] = useState("print"); // print, post, story



  const [tacticalFilter, setTacticalFilter] = useState("all");

  const handleMediaAdvisor = async () => {
    setIsMediaAdvisorLoading(true);
    const epicKey = localStorage.getItem("gerd_epicKey");
    gerdSpeak("Chef-Redakteur Modus aktiv. Analysiere Markt-Trends und Liga-Entwicklung...", "Chief-Editor");

    try {
      // Phase 1: Fetch League Trends
      const trendRes = await fetch(`http://localhost:3001/api/league/trends?key=${epicKey}`);
      const trendData = await trendRes.json();

      // Phase 2: Generate Editorial Ideas based on Trends & Club State
      const prompt = `Du bist der Chief Editor von 'The Red Bulletin'. Wir erstellen eine 'Gerd 2.0 Soul-Edition'.
        
        KONTEXT:
        - Club State: ${JSON.stringify(truthObject.club_state)}
        - Fokus: Porträts von unbändigem Willen.
        - Spieler-Daten (Soul-Stats): ${JSON.stringify(players.slice(0, 5).map(p => ({ name: p.name, traits: { res: p.resilience, sac: p.sacrifice, led: p.leadership } })))}
        
        MISSION:
        Generiere 3 radikale, hoch-expressive Artikel-Themen, die 'Intensity' und 'Soul-Stats' ausstrahlen. 
        Nutze 'Trait-to-Text' Mapping: Nimm die Top-Werte eines Spielers und plane daraus fiktive 'Soul Interviews' oder Psychogramme.
        
        DATEN-STRUKTUR:
        Antworte NUR mit einem JSON Array von 3 Objekten: 
        { "type": "HERO_FEATURE" | "DATA_REVOLUTION" | "POWER_PROFILE", "headline": "string", "description": "string" }`;

      const aiResp = await askAI(prompt, "Chief-Editor");
      const cleaned = aiResp.replace(/```json|```/g, "").trim();
      const blocks = JSON.parse(cleaned);
      setSuggestedLayoutBlocks(blocks);

      addAiLog("Editorial Engine: Neue Investigativ-Themen generiert.", "success");
    } catch (e) {
      console.error("Media Advisor failed", e);
      addAiLog("Editorial Engine: Fehler beim Abruf der Liga-Trends.", "error");
    }
    setIsMediaAdvisorLoading(false);
  };

  const handleInvestigativeReport = async (block) => {
    setIsMediaAdvisorLoading(true);
    gerdSpeak(`Investigativer Reporter startet Recherche zu '${block.headline}'...`, "Reporter-Gerd");

    const prompt = `Schreibe eine 'Red Bulletin' Feature Story (ca. 300 Wörter).
      THEMA: ${block.headline}
      FOKUS: ${block.description}
      STIL: Arrogant, cool, investigativ, hochglanz-magazin-artig. Nutze starke Adjektive.
      FORMAT: Nur der Text, beginnend mit einem starken Aufhänger.`;

    try {
      const story = await askAI(prompt, "Reporter-Gerd");
      const newBlock = {
        id: Date.now(),
        type: "feature",
        headline: block.headline,
        description: story,
        timbre: "Analytisch"
      };
      setMediaCanvasBlocks([...mediaCanvasBlocks, newBlock]);
      dispatchAction('ADD_EDITORIAL', newBlock);
      gerdSpeak("Feature-Story fertiggestellt und ins Layout integriert.", "System");
    } catch (e) {
      addAiLog("Investigative Report failed", "error");
    }
    setIsMediaAdvisorLoading(false);
  };

  // --- TACTICAL HUB & VR SUITE STATE ---
  const [vectorAnalysisActive, setVectorAnalysisActive] = useState(false);
  const [playbookViewActive, setPlaybookViewActive] = useState(false);
  const [aiTacticsGlow, setAiTacticsGlow] = useState([]); // Stores coordinates for glowing SVG gaps
  const [vrPerspective, setVrPerspective] = useState("commander"); // 'commander' or 'ego'

  // Gerd 2.0 Playbook Schema Implementation
  // --- TACTICAL SHADOW SCOUTING ---
  const [shadowTargetOnPitch, setShadowTargetOnPitch] = useState(null);
  const [shadowTargetPos, setShadowTargetPos] = useState({ x: 210, y: 320 });

  const [isNewDrillModalOpen, setIsNewDrillModalOpen] = useState(false);
  const [drillInputParams, setDrillInputParams] = useState({
    target: "Spielaufbau", // Spielaufbau, Defensiv-Stabilität, Umschaltmoment
    zone: "Mittelfeld", // Abwehrdrittel, Mittelfeld, Angriffsdrittel
    opponent: "Passiv-lauernd", // Passiv-lauernd, Hoch-pressend
    players: "11v11",
    rules: ""
  });
  const [activeDrill, setActiveDrill] = useState(null);
  const [drillMetrics, setDrillMetrics] = useState({ name: "", focus: "", difficulty: "Medium", duration: "15 Min" });
  const [isPlayingDrill, setIsPlayingDrill] = useState(false);

  // --- LEGACY IDENTITY STATE ---
  const [identityData, setIdentityData] = useState(null);

  useEffect(() => {
    const fetchIdentity = async () => {
      try {
        const response = await fetch("identity.json");
        if (!response.ok) throw new Error("File not found");
        const data = await response.json();
        setIdentityData(data);
      } catch (error) {
        console.warn("Using fallback identity data:", error);
        setIdentityData({
          project: { name: "GERD 2.0", version: "4.0", vision: "Memorial Hub" },
          dedication: {
            name: "Gerd Sauerwein",
            text: "Legacy Memorial",
            date_of_death: "20.02.2026",
            motto: "Character above all."
          },
          modules: []
        });
      }
    };
    fetchIdentity();
  }, []);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isGeneratingDrill, setIsGeneratingDrill] = useState(false);
  const [playbookDb, setPlaybookDb] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("gerd_playbookDb") || "[]");
    } catch (e) {
      return [];
    }
  });

  // Sync active drill frames
  useEffect(() => {
    if (!activeDrill || activeDrill.frames.length === 0) return;
    const frame = activeDrill.frames[currentFrameIndex];
    if (frame) {
      if (frame.playerPositions) setPlayerPositions(frame.playerPositions);
      if (frame.opponentPositions) setOpponentPositions(frame.opponentPositions);
      if (frame.drawings) setDrawingPaths(frame.drawings);
    }
  }, [activeDrill, currentFrameIndex]);

  // Playback Loop
  useEffect(() => {
    let interval;
    if (isPlayingDrill && activeDrill && activeDrill.frames.length > 1) {
      interval = setInterval(() => {
        setCurrentFrameIndex(prev => {
          const next = prev + 1;
          if (next >= activeDrill.frames.length) {
            setIsPlayingDrill(false); // Stop at end
            return prev;
          }
          return next;
        });
      }, 2000); // 2 seconds per frame
    }
    return () => clearInterval(interval);
  }, [isPlayingDrill, activeDrill]);
  const handleSignPlayer = (player) => {
    const cost = player.marketValue || 0;
    if (truthObject.financials.current_budget < cost) {
      gerdSpeak(`Transfer von ${player.name} gescheitert. Liquiditätsengpass: Defizit von € ${((cost - truthObject.financials.current_budget) / 1e6).toFixed(1)}M identifiziert.`, "Manager-Gerd");
      addAiLog(`Transfer blocked: Insufficient budget for ${player.name}`, "error");
      return;
    }

    // Unified Event System Update
    dispatchAction('SIGN_PLAYER', player);

    const newPlayer = {
      id: Date.now(),
      name: player.name,
      position: player.position,
      age: player.age,
      nationality: player.nationality,
      marketValue: player.marketValue,
      form: 85,
      fitness: 100,
      sharpness: 80,
      stats: { ...player.stats },
      status: 'Fit',
      isNewSign: true
    };

    setPlayers(prev => [newPlayer, ...prev]);
    setScoutingPool(prev => prev.filter(p => p.id !== player.id));

    gerdSpeak(`Transfer abgeschlossen. ${player.name} ist im Locker Room eingetroffen. Budget-Impact: -€ ${(cost / 1e6).toFixed(1)}M.`, "Manager-Gerd");
    addAiLog(`Transfer executed: ${player.name} signed for € ${(cost / 1e6).toFixed(1)}M`, "success");

    // Trigger article suggestion
    setSuggestedLayoutBlocks(prev => [{
      type: "Breaking News",
      headline: `Transfer-Hammer: ${player.name} unterschreibt!`,
      description: `Der ${player.age}-jährige ${player.position} wechselt für eine Rekordsumme ins Team. Die sportliche Leitung verspricht sich sofortigen Impact.`,
    }, ...prev]);
  };

  // Save drill to LocalStorage whenever Playbook DB updates
  useEffect(() => {
    localStorage.setItem("gerd_playbookDb", JSON.stringify(playbookDb));
  }, [playbookDb]);

  // Calculate distances between team lines (Defense, Midfield, Attack)
  const calculateTacticalDistances = () => {
    if (!playerPositions || Object.keys(playerPositions).length === 0) return null;

    const teamNodes = Object.entries(playerPositions).filter(([id]) => id.toString().length < 5); // Rough filter for own team
    if (teamNodes.length === 0) return null;

    // Sort by Y coordinate (assuming attacking top to bottom or vice versa, based on starting formation y values)
    // In earlier formations: GK at y: 90/10, Attackers at y: 22/82. Let's group by typical y bands.
    const sorted = [...teamNodes].sort((a, b) => a[1].y - b[1].y);

    if (sorted.length < 10) return null; // Need mostly full team

    // Extremely simplified logic: top 3 are attack/defense, mid 4 are mid, bottom are defense/attack
    const block1 = sorted.slice(0, 3);
    const block2 = sorted.slice(3, 7);
    const block3 = sorted.slice(7, 10);

    const avgY = (nodes) => nodes.reduce((sum, n) => sum + n[1].y, 0) / nodes.length;
    const avgX = (nodes) => nodes.reduce((sum, n) => sum + n[1].x, 0) / nodes.length;

    const y1 = avgY(block1); const x1 = avgX(block1);
    const y2 = avgY(block2); const x2 = avgX(block2);
    const y3 = avgY(block3); const x3 = avgX(block3);

    // Distance in pixels. 640px height approx 100m. 1px = ~0.15m
    const dist1_2 = Math.round(Math.abs(y1 - y2) * 0.15);
    const dist2_3 = Math.round(Math.abs(y2 - y3) * 0.15);

    return {
      lines: [
        { x: x1, y: y1 },
        { x: x2, y: y2 },
        { x: x3, y: y3 }
      ],
      distances: [dist1_2, dist2_3]
    };
  };

  const [apiConfig, setApiConfig] = useState(() => {
    try {
      const saved = localStorage.getItem("gerd_apiConfig");
      return saved
        ? JSON.parse(saved)
        : { youtubeKey: "", ollamaUrl: "http://localhost:11434" };
    } catch (e) {
      return { youtubeKey: "", ollamaUrl: "http://localhost:11434" };
    }
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [championsMode, setChampionsMode] = useState(true);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [ytPlaylistId, setYtPlaylistId] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);

  // Mock Google OAuth removed

  // NEW: Playbook Feature State

  // Tactical Hub State
  const [playerPositions, setPlayerPositions] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("gerd_playerPositions") || "{ }",
      );
    } catch (e) {
      return {};
    }
  });
  const [gerdFeedback, setGerdFeedback] = useState("");
  const [gerdThinking, setGerdThinking] = useState(false);
  const [gerdVoiceActive, setGerdVoiceActive] = useState(false);
  const [draggedPlayerId, setDraggedPlayerId] = useState(null);

  const [simulationMode, setSimulationMode] = useState(() => {
    return localStorage.getItem("gerd_simulationMode") === "true";
  });
  const [hasOnboarded, setHasOnboarded] = useState(() => {
    // FORCE ONBOARDING TO SHOW ON RELOAD: Ignoring localStorage for now to test feature.
    // return localStorage.getItem("gerd_hasOnboarded") === "true";
    return false;
  });

  const [clubIdentity, setClubIdentity] = useState(() => {
    try {
      const saved = localStorage.getItem("gerd_clubIdentity");
      if (saved) return JSON.parse(saved);
      // Legacy Fallback (optional, for existing users)
      return {
        name: "",
        league: "",
        researchData: "",
        primaryColor: "#00f3ff",
        secondaryColor: "#e21b4d",
      };
    } catch (e) {
      return {
        name: "",
        league: "",
        researchData: "",
        primaryColor: "#00f3ff",
        secondaryColor: "#e21b4d",
      };
    }
  });

  const [userPlayers, setUserPlayers] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("gerd_userPlayers") || "null",
      );
    } catch (e) {
      return null;
    }
  });
  const [userBudget, setUserBudget] = useState(() => {
    const b = localStorage.getItem("gerd_userBudget");
    return b ? parseFloat(b) : null;
  });

  const [clubArchive, setClubArchive] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("gerd_clubArchive") ||
        '{"proMatchbook": [], "proTrainingbook": [], "nlzMatchbook": [], "nlzTrainingbook": []}',
      );
    } catch (e) {
      return {
        proMatchbook: [],
        proTrainingbook: [],
        nlzMatchbook: [],
        nlzTrainingbook: [],
      };
    }
  });
  const [isSyncingClub, setIsSyncingClub] = useState(false);
  const [isAutoFilling, setIsAutoFilling] = useState(false);

  const [aiLogs, setAiLogs] = useState([
    {
      id: 1,
      type: "init",
      text: "Neural Cortex Initialized.",
      time: "0.0ms",
    },
    {
      id: 2,
      type: "status",
      text: "AI Flagship Evolution Active.",
      time: "0.1ms",
    },
  ]);
  const [showBriefing, setShowBriefing] = useState(false);
  const [morningCallBriefing, setMorningCallBriefing] = useState("");
  const [isBriefingLoading, setIsBriefingLoading] = useState(false);
  const [showNewPlayerForm, setShowNewPlayerForm] = useState(false);
  const [newPlayerData, setNewPlayerData] = useState({
    name: "",
    position: "MF",
    age: 24,
    marketValue: 1000000,
    character: "Warrior",
    intensity_metrics: { sprint: 85, intensity: 80, resilience: 90 }
  });

  const addAiLog = (text, type = "process") => {
    setAiLogs((prev) =>
      [
        {
          id: Date.now(),
          type,
          text,
          time: `${(Math.random() * 2).toFixed(1)}ms`,
        },
        ...prev,
      ].slice(0, 50),
    );
  };

  // Tactical Playlist (Stark Elite Tactical Selection)
  const [playlist, setPlaylist] = useState([
    {
      title: "Man City vs Chelsea | Final VIP Tactical",
      url: "JA0p0Bg9N1w",
      isYouTube: true,
      analysis: "Champions League Halbfinale: Analyse des tiefen Aufbauspiels unter Druck.",
    },
    {
      title: "Man City v Tottenham | Tactical Camera",
      url: "9x02ovOrZmM",
      isYouTube: true,
      analysis: "Positionsspiel in der gegnerischen Hälfte und Gegenpressing-Struktur.",
    },
    {
      title: "PSG vs Inter Milan | Tactical Cam",
      url: "gzNLfgbxsLk",
      isYouTube: true,
      analysis: "Taktische Analyse der Flügelüberladungen und Umschaltmomente.",
    },
    {
      title: "Croatia 1-1 Czechia | EURO 2020 Tactical",
      url: "KgQquW68E-Q",
      isYouTube: true,
      analysis: "Kompakte Defensivreihen und tief stehende Blöcke analysieren.",
    },
  ]);

  const loadTemplate = (templateName) => {
    if (templateName === "Schalke 04") {
      const schalkeData = {
        name: "FC Schalke 04",
        league: "2. Bundesliga",
        primaryColor: "#004d9d",
        secondaryColor: "#ffffff",
        researchData:
          "Mitten im Abstiegskampf der 2. Bundesliga, auf der Suche nach defensiver Stabilität und offensiver Durchschlagskraft. Kenan Karaman ist der unumstrittene Anführer.",
      };
      const schalkePlayers = [
        {
          id: 1,
          name: "Heekeren",
          position: "TW",
          ovr: 72,
          readiness: 100,
          isInjured: false,
          rating: 6.8,
          pac: 40,
          sho: 30,
          pas: 65,
          dri: 50,
          def: 20,
          phy: 70,
        },
        {
          id: 2,
          name: "Bulasic",
          position: "CB",
          ovr: 68,
          readiness: 95,
          isInjured: false,
          rating: 6.5,
          pac: 65,
          sho: 40,
          pas: 55,
          dri: 55,
          def: 68,
          phy: 72,
        },
        {
          id: 3,
          name: "Kalas",
          position: "CB",
          ovr: 74,
          readiness: 80,
          isInjured: false,
          rating: 7.0,
          pac: 68,
          sho: 45,
          pas: 60,
          dri: 60,
          def: 75,
          phy: 78,
        },
        {
          id: 4,
          name: "Wasinski",
          position: "CB",
          ovr: 65,
          readiness: 100,
          isInjured: false,
          rating: 6.2,
          pac: 62,
          sho: 35,
          pas: 50,
          dri: 50,
          def: 64,
          phy: 68,
        },
        {
          id: 5,
          name: "Murkin",
          position: "LB",
          ovr: 73,
          readiness: 85,
          isInjured: false,
          rating: 6.9,
          pac: 80,
          sho: 55,
          pas: 68,
          dri: 72,
          def: 68,
          phy: 70,
        },
        {
          id: 6,
          name: "Aydin",
          position: "RB",
          ovr: 69,
          readiness: 90,
          isInjured: false,
          rating: 6.4,
          pac: 78,
          sho: 50,
          pas: 65,
          dri: 70,
          def: 62,
          phy: 65,
        },
        {
          id: 7,
          name: "Seguin",
          position: "CM",
          ovr: 75,
          readiness: 75,
          isInjured: false,
          rating: 7.2,
          pac: 68,
          sho: 70,
          pas: 78,
          dri: 75,
          def: 70,
          phy: 72,
        },
        {
          id: 8,
          name: "Schallenberg",
          position: "CDM",
          ovr: 74,
          readiness: 88,
          isInjured: false,
          rating: 6.8,
          pac: 60,
          sho: 55,
          pas: 72,
          dri: 65,
          def: 74,
          phy: 76,
        },
        {
          id: 9,
          name: "Younes",
          position: "CAM",
          ovr: 72,
          readiness: 82,
          isInjured: false,
          rating: 7.0,
          pac: 75,
          sho: 68,
          pas: 74,
          dri: 82,
          def: 40,
          phy: 50,
        },
        {
          id: 10,
          name: "Sylla",
          position: "ST",
          ovr: 76,
          readiness: 90,
          isInjured: false,
          rating: 7.5,
          pac: 85,
          sho: 78,
          pas: 60,
          dri: 78,
          def: 35,
          phy: 74,
        },
        {
          id: 11,
          name: "Karaman",
          position: "ST",
          ovr: 78,
          readiness: 85,
          isInjured: false,
          rating: 8.0,
          pac: 75,
          sho: 79,
          pas: 72,
          dri: 76,
          def: 45,
          phy: 80,
        },
        {
          id: 12,
          name: "Lasme",
          position: "RW",
          ovr: 70,
          readiness: 100,
          isInjured: false,
          rating: 6.1,
          pac: 88,
          sho: 65,
          pas: 55,
          dri: 70,
          def: 30,
          phy: 75,
        },
        {
          id: 13,
          name: "Antwi-Adjei",
          position: "LW",
          ovr: 71,
          readiness: 95,
          isInjured: false,
          rating: 6.3,
          pac: 90,
          sho: 62,
          pas: 60,
          dri: 72,
          def: 35,
          phy: 60,
        },
      ];

      setClubIdentity(schalkeData);
      setUserPlayers(schalkePlayers);
      setUserBudget(15000000);
      setSimulationMode(false);
      setHasOnboarded(true);

      localStorage.setItem(
        "gerd_clubIdentity",
        JSON.stringify(schalkeData),
      );
      localStorage.setItem(
        "gerd_userPlayers",
        JSON.stringify(schalkePlayers),
      );
      localStorage.setItem("gerd_userBudget", "15000000");
      localStorage.setItem("gerd_simulationMode", "false");
      localStorage.setItem("gerd_hasOnboarded", "true");

      // Set CSS variables for colors
      document.documentElement.style.setProperty(
        "--color-neon",
        schalkeData.primaryColor,
      );
      document.documentElement.style.setProperty(
        "--color-redbull",
        schalkeData.secondaryColor,
      );

      gerdSpeak(
        "Pro-Muster FC Schalke 04 geladen. Daten überschrieben.",
        "System",
      );
      addAiLog("Template injected: FC Schalke 04", "success");
    }
  };

  const toggleSimulationMode = () => {
    const newMode = !simulationMode;
    setSimulationMode(newMode);
    localStorage.setItem("gerd_simulationMode", newMode.toString());
    if (newMode) {
      gerdSpeak(
        "Wechsel zu Legacy-Simulationsebene (SG Heenes/Kalkobes).",
        "System",
      );
      addAiLog("Switched to Simulation Mode (Legacy Heenes)", "process");
    } else {
      gerdSpeak("Wechsel zu produktiven Nutzerdaten.", "System");
      addAiLog("Switched to Active Data Mode", "process");
    }
  };

  const playerRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null); // Keep for local uploads

  useEffect(() => {
    // Wenn wir nicht auf dem Video Tab sind, Player zerstören und Referenz leeren
    if (activeTab !== "video") {
       if (playerRef.current && typeof playerRef.current.destroy === 'function') {
           try { playerRef.current.destroy(); } catch(e) {}
           playerRef.current = null;
       }
       return;
    }

    const initPlayer = () => {
      // Wenn das DOM Element von React noch nicht gerendert wurde, abbrechen
      const playerContainer = document.getElementById("youtubepayer-container");
      if (!playerContainer) return;

      const clip = playlist[activeClipIndex];
      // Wir haben bereits eine gültige Player-Instanz und laden nur das Video neu
      if (playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
          // Falls das DOM-Element des Players nicht mehr da ist (React Re-Mount), müssen wir neu bauen
          if (playerRef.current.getIframe && !document.body.contains(playerRef.current.getIframe())) {
              try { playerRef.current.destroy(); } catch(e) {}
              playerRef.current = null;
              createNewPlayer(clip);
          } else {
              playerRef.current.loadVideoById(clip.url);
          }
      } else {
          createNewPlayer(clip);
      }
    };

    const createNewPlayer = (clip) => {
      // Create fresh div for YT to replace to avoid React VDOM clashes
      const container = document.getElementById("youtubepayer-container");
      if (container) {
          container.innerHTML = '<div id="youtubepayer" class="w-full h-full pointer-events-none"></div>';
      }

      playerRef.current = new window.YT.Player("youtubepayer", {
        videoId: clip.url,
        width: '100%',
        height: '100%',
        playerVars: {
          autoplay: 1,
          controls: 0,
          mute: 1,
          loop: 1,
          modestbranding: 1,
          playlist: clip.url,
          enablejsapi: 1,
          origin: window.location.origin
        },
        events: {
          onReady: (event) => event.target.playVideo(),
        },
      });
    };

    if (!window.YT) {
       const tag = document.createElement('script');
       tag.src = "https://www.youtube.com/iframe_api";
       const firstScriptTag = document.getElementsByTagName('script')[0];
       firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
       window.onYouTubeIframeAPIReady = initPlayer;
    } else if (window.YT && window.YT.Player) {
       // Try catching when the API is done loading
       setTimeout(initPlayer, 100);
    }
  }, [activeClipIndex, playlist, activeTab]);

  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState(null);

  // --- AUTO ANALYSIS ENGINE ---
  const [autoAnalyzeEnabled, setAutoAnalyzeEnabled] = useState(false);
  const autoAnalyzeRef = useRef(null);

  useEffect(() => {
    if (!autoAnalyzeEnabled || activeTab !== "video") {
      if (autoAnalyzeRef.current) clearInterval(autoAnalyzeRef.current);
      return;
    }

    autoAnalyzeRef.current = setInterval(() => {
      try {
        // For YouTube:
        if (playlist[activeClipIndex]?.isYouTube && playerRef.current && typeof playerRef.current.getPlayerState === 'function') {
          if (playerRef.current.getPlayerState() === window.YT.PlayerState.PLAYING) {
             const currentTime = playerRef.current.getCurrentTime();
             if (!window.lastAutoAnalyzeTime) window.lastAutoAnalyzeTime = 0;
             if (currentTime - window.lastAutoAnalyzeTime >= 15) {
               window.lastAutoAnalyzeTime = currentTime;
               triggerAiTelestrator();
             }
          }
        }
        // For Local HTML5 Video:
        else if (!playlist[activeClipIndex]?.isYouTube && videoRef.current && !videoRef.current.paused) {
           const currentTime = videoRef.current.currentTime;
           if (!window.lastAutoAnalyzeTime) window.lastAutoAnalyzeTime = 0;
           if (currentTime - window.lastAutoAnalyzeTime >= 15) {
             window.lastAutoAnalyzeTime = currentTime;
             triggerAiTelestrator();
           }
        }
      } catch (e) {
        // Player not fully ready
      }
    }, 1000);

    return () => {
      if (autoAnalyzeRef.current) clearInterval(autoAnalyzeRef.current);
    };
  }, [autoAnalyzeEnabled, activeTab, activeClipIndex, playlist]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const newClip = {
        title: `Upload: ${file.name}`,
        url: url,
        isLocal: true,
        isYouTube: false,
      };
      setPlaylist([newClip, ...playlist]);
      setActiveClipIndex(0);
      clearDrawings();
      triggerAiAnalysis();
    }
  };

  // --- ERIK MEIJER AI TELESTRATOR ---
  const triggerAiTelestrator = async () => {
    if (isDrawing) return; // Prevent overlapping triggers
    
    gerdSpeak("Bildanalyse läuft. Kenne Ballbesitz und analysiere tiefgreifend...", "System");
    setIsDrawing(true);
    addAiLog("AI Telestrator (Auto/Manual): Interpreting visual frame for tactical overlays...", "process");
    
    // Pause video if we can
    if (playerRef.current && typeof playerRef.current.pauseVideo === 'function') {
        playerRef.current.pauseVideo();
    }
    if (videoRef.current) {
       videoRef.current.pause();
    }

    try {
      const currentVideoTitle = playlist[activeClipIndex]?.title || "Unbekanntes Match";
      
      const prompt = `[STRICT JSON PROTOCOL]
Du bist der ultimative taktische TV-Experte (eine Mischung aus Julian Nagelsmanns taktischer Präzision und Jürgen Klopps grenzenloser Energie und Leidenschaft wie Erik Meijer am Touchscreen).
Das aktuelle Spiel ist: "${currentVideoTitle}"
Analysiere die aktuelle Spielszene und generiere taktische Vektoren, die direkt auf den Bildschirm gezeichnet werden sollen (Canvas 1280x720).
Erzeuge ein JSON Objekt mit folgender Struktur:
{
  "possession": "Wer hat den Ball (z.B. Blaues Team - Offensive)",
  "explanation": "Eine sehr leidenschaftliche, energiegeladene und hoch-taktische 2-3 Satz Erklärung auf Deutsch. Nutze Wörter wie 'Wahnsinn!', 'Brutal!', 'Schau mal hier auf den Halbraum!'.",
  "vectors": [
    { "mode": "pass", "points": [{"x": 400, "y": 600}, {"x": 800, "y": 300}] },
    { "mode": "run", "points": [{"x": 300, "y": 550}, {"x": 350, "y": 250}] }
  ]
}
Gib nur das reine JSON zurück. Nichts anderes.`;

      const res = await askAI(prompt, "System", true);
      const jsonMatch = res.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (jsonMatch) {
         let parsedData = JSON.parse(jsonMatch[0]);
         let vectors = [];
         let explanation = "Der Raum ist offen. Der Lauf in die Tiefe muss jetzt kommen.";
         let possession = "Offensive am Zug";

         if (Array.isArray(parsedData)) {
             vectors = parsedData;
         } else {
             vectors = parsedData.vectors || [];
             explanation = parsedData.explanation || explanation;
             possession = parsedData.possession || possession;
         }

         const canvas = canvasRef.current;
         if (!canvas) return;
         const ctx = canvas.getContext("2d");
         ctx.clearRect(0, 0, canvas.width, canvas.height);
         
         addAiLog(`Team in Possession: ${possession}`, "process");
         setVideoFeedback(`Ballbesitz: ${possession}\nAnalyse: ${explanation}`);

         // Draw vectors sequentially
         for (let index = 0; index < vectors.length; index++) {
             const v = vectors[index];
             await new Promise(r => setTimeout(r, 800)); // Delay between drawing lines
             ctx.beginPath();
             ctx.strokeStyle = v.mode === "pass" ? "#00f3ff" : "#e21b4d";
             ctx.lineWidth = 4;
             ctx.lineCap = "round";
             ctx.setLineDash(v.mode === "run" ? [15, 15] : []);
               
             const pts = v.points;
             if (pts.length >= 2) {
                 ctx.moveTo(pts[0].x, pts[0].y);
                 ctx.lineTo(pts[1].x, pts[1].y);
                 ctx.stroke();
                 
                 // Draw Arrowhead
                 const angle = Math.atan2(pts[1].y - pts[0].y, pts[1].x - pts[0].x);
                 ctx.beginPath();
                 ctx.moveTo(pts[1].x, pts[1].y);
                 ctx.lineTo(pts[1].x - 20 * Math.cos(angle - Math.PI / 6), pts[1].y - 20 * Math.sin(angle - Math.PI / 6));
                 ctx.lineTo(pts[1].x - 20 * Math.cos(angle + Math.PI / 6), pts[1].y - 20 * Math.sin(angle + Math.PI / 6));
                 ctx.lineTo(pts[1].x, pts[1].y);
                 ctx.fillStyle = v.mode === "pass" ? "#00f3ff" : "#e21b4d";
                 ctx.fill();
             }
         }
         
         setIsDrawing(false);
         addAiLog("AI Telestrator vectors rendered", "success");
         
         // Speak the explanation and wait until finished
         await gerdSpeak(explanation, "Trainer-Gerd");
         
         // Automatically clear and resume playback
         ctx.clearRect(0, 0, canvas.width, canvas.height);
         setVideoFeedback("");
         if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
             playerRef.current.playVideo();
         }
         if (videoRef.current) {
            videoRef.current.play();
         }
         addAiLog("Analyse beendet. Video wird fortgesetzt.", "process");
      }
    } catch (e) {
       console.error(e);
       setIsDrawing(false);
       gerdSpeak("Verbindungsfehler zum Neural-Link des Telestrators.", "System");
    }
  };

  // --- GERD VOICE SYSTEM ---
  const gerdSpeak = (text, persona = "Trainer-Gerd") => {
    return new Promise((resolve) => {
      addAiLog(`Persona [${persona}] generating voice output.`, "voice");
      if (!window.speechSynthesis) {
        resolve();
        return;
      }
      window.speechSynthesis.cancel();

      const msg = new SpeechSynthesisUtterance(text);
      msg.lang = "de-DE";

      // --- STARK ELITE VOICE SELECTION ---
      const voices = window.speechSynthesis.getVoices();
      const maleGermanVoice = voices.find(
        (v) =>
          v.lang.startsWith("de") &&
          !["Hedda", "Anna", "Katja", "Helena"].some((name) =>
            v.name.includes(name),
          ) &&
          (v.name.includes("Male") ||
            v.name.includes("Deutsch") ||
            v.name.includes("Google")),
      );

      if (maleGermanVoice) msg.voice = maleGermanVoice;

      msg.pitch = 0.8;
      msg.rate = 1.1;

      msg.onend = () => {
        setGerdVoiceActive(false);
        resolve();
      };
      
      msg.onerror = () => {
        setGerdVoiceActive(false);
        resolve();
      };

      setGerdVoiceActive(true);
      window.speechSynthesis.speak(msg);
      
      // Safety timeout to resolve promise if SpeechSynthesis API hangs (common browser bug)
      setTimeout(() => {
         // Only resolve if it hasn't fired onend natively
         setGerdVoiceActive(false);
         resolve();
      }, text.length * 150 + 2000); // rough estimate: 150ms per character + 2s base
    });
  };
  window.gerdSpeak = gerdSpeak; // Expose for VR

  // --- OFFLINE MONITORING ---
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // --- HYBRID BRAIN ENGINE ---
  // ============================================================
  // GROUNDED INTELLIGENCE ENGINE — v4.0
  // Zero-Hallucination | Data-Sourced | Expert Manager Tone
  // ============================================================

  // --- Guard Functions ---
  const validateTacticsData = () => {
    const fieldPlayerCount = Object.keys(playerPositions).length;
    if (fieldPlayerCount < 11) {
      return {
        valid: false,
        error: `Analyse abgebrochen: Das Spielfeld ist unvollständig (${fieldPlayerCount}/11 Spieler). Bitte positionieren Sie mindestens 11 Spieler für eine taktische Analyse.`
      };
    }
    return { valid: true };
  };

  const validateCFOData = (prompt) => {
    const lower = (prompt || "").toLowerCase();
    const isTransferQuery = ["transfer", "verpflichtung", "einkauf", "neuzugang", "kauf", "ablöse", "signing"].some(k => lower.includes(k));
    if (isTransferQuery && truthObject.financials.current_budget === 0) {
      return {
        blocked: true,
        response: `CFO-Protokoll: Keine Budgetdaten vorhanden. Quelle: financials.current_budget = 0. — Bitte hinterlegen Sie Sponsoring-Einnahmen im CFO-Board, um eine Transfer-Simulation zu starten.`
      };
    }
    return { blocked: false };
  };

  // --- Environment Check Builder ---
  const buildEnvironmentCheck = () => {
    const fieldCount = Object.keys(playerPositions).length;
    const budgetOk = truthObject.financials.current_budget > 0;
    const nlzCount = typeof youthPlayers !== 'undefined' ? youthPlayers.length : (truthObject.nlz_hub?.registered_talents?.length ?? 0);
    const scoutCount = scoutingPool?.length ?? 0;

    return `[ENVIRONMENT CHECK — ${new Date().toLocaleTimeString('de-DE')}]
AKTIVES MODUL: ${activeTab?.toUpperCase() ?? "UNBEKANNT"}
SPIELER AUF DEM FELD: ${fieldCount} / 11 (${fieldCount >= 11 ? "✓ VOLLSTÄNDIG" : "✗ UNVOLLSTÄNDIG"})
BUDGET-STATUS: ${budgetOk ? `€ ${truthObject.financials.current_budget.toLocaleString()} vorhanden` : "✗ KEINE DATEN (0)"}
NLZ-TALENTE: ${nlzCount > 0 ? nlzCount + " registriert" : "✗ KEINE DATEN"}
SCOUTING POOL: ${scoutCount > 0 ? scoutCount + " Spieler" : "✗ LEER"}
FORMATION HEIM: ${truthObject.tactical_setup.formation_home || "nicht gesetzt"}
VEREIN: ${truthObject.club_identity.name || "nicht konfiguriert"}`;
  };

  const askAI = async (
    prompt,
    persona = "Trainer-Gerd",
    isResearch = false,
  ) => {
    setGerdThinking(true);
    let currentEngine = "cloud";
    let response = "";

    // --- CFO BUDGET GUARD ---
    const cfoCheck = validateCFOData(prompt);
    if (cfoCheck.blocked) {
      addAiLog(`CFO Guard triggered: Transfer request with zero budget.`, "warning");
      setGerdThinking(false);
      return cfoCheck.response;
    }

    const envCheck = buildEnvironmentCheck();
    
    // --- SENSITIVE DATA GATING (Phase 15) ---
    const lowerPrompt = prompt.toLowerCase();
    const isSensitive = lowerPrompt.includes("fettanalyse") || 
                        lowerPrompt.includes("waage") || 
                        lowerPrompt.includes("sportuhr") || 
                        lowerPrompt.includes("telemetrie") || 
                        lowerPrompt.includes("herzfrequenz");

    if (isSensitive) {
      addAiLog(`Highly sensitive data detected. Routing exclusively via Local Engine (Ollama) to ensure privacy.`, "shield");
      currentEngine = "local";
      setAiEngine("local");
    } else {
      currentEngine = "cloud";
    }

    let contextualPrompt = `[ELITE MANAGER PROTOCOL — STARK ELITE v4.0]
Du bist kein Assistent. Du bist der SPORTING DIRECTOR von ${truthObject.club_identity.name}.
Persona: ${persona}

[KOMMUNIKATIONSDIREKTIVE]
• Stil: ${persona === 'Klopp AI' ? 'Jürgen Klopp. Emotional, intensiv, "BOOM!", "Heavy Metal Football", "Ginga". Nutze Klopp-typische Ausdrücke.' : 'Klopp-direkt, Nagelsmann-analytisch. Keine Füllwörter.'}
• REGEL 1: Jede Kernaussage beginnt mit "Quelle: [Feldname im Truth Object]" ODER "Keine Daten: [fehlender Feldname]".
• REGEL 2: Wenn ein Wert 0, [] oder null ist = fehlende Daten, NICHT "keine Aktivität". Melde: "Modul [Name]: keine Daten hinterlegt."
• REGEL 3: Wenn gefragt was als nächstes zu tun ist, scanne das Truth Object systematisch: Budget → Kader → Taktik → NLZ. Priorisiere das schwächste Glied.
• REGEL 4: Halluziniere niemals. Wenn du es nicht aus dem Truth Object ableiten kannst, sag es explizit.

${envCheck}

[DAS TRUTH OBJECT — DEINE EINZIGE DATENQUELLE]
${JSON.stringify(truthObject, null, 2)}

[ANFRAGE VON ${persona.toUpperCase()}]
${prompt}`;

    // 1. Universal Server Proxy (/api/chat) - Only if not sensitive
    if (currentEngine === "cloud") {
      addAiLog(`Querying Cloud Neural Cortex via [${persona}]...`, "request");
      try {
        const res = await fetch("http://localhost:3001/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [{ role: "user", content: contextualPrompt }],
            persona: persona,
            apiKey: localStorage.getItem("gerd_epicKey") || ""
          }),
        });
        const data = await res.json();
        if (data.ok) {
          response = data.text;
          setAiEngine("cloud");
          addAiLog(
            `Cloud Cortex response received (${response.length} chars).`,
            "resolved",
          );
        } else if (res.status === 401 || res.status === 429) {
          addAiLog(`Cloud API Key invalid or Rate Limit (Status ${res.status}). Triggering Failover...`, "warning");
          currentEngine = "local";
        } else {
          addAiLog(`Cloud Cortex returned error. Triggering Failover...`, "warning");
          currentEngine = "local";
        }
      } catch (e) {
        addAiLog(`Server Proxy connectivity failure. Triggering Failover...`, "error");
        currentEngine = "local";
      }
    }

    // 2. Ollama (Local Secondary/Failover/Sensitive)
    if (
      !response &&
      currentEngine === "local" &&
      apiConfig.ollamaUrl &&
      apiConfig.ollamaUrl !== "http://localhost:11434/off"
    ) {
      addAiLog(`Querying Local Neural Cortex (Ollama) via [${persona}]...`, "request");
      setAiEngine("local");
      try {
        const res = await fetch(`${apiConfig.ollamaUrl}/api/generate`, {
          method: "POST",
          body: JSON.stringify({
            model: "llama3",
            prompt: `[ELITE MANAGER PROTOCOL]\nDu bist ${persona}, Sporting Director von ${truthObject.club_identity.name}.\n${envCheck}\n\nANFRAGE: ${prompt}`,
            stream: false,
          }),
        });
        const data = await res.json();
        response = data.response;
        addAiLog(
            `Local Cortex (Ollama) response received (${response.length} chars).`,
            "resolved",
          );
      } catch (e) {
        addAiLog(`Local Ollama Engine failed. Trying static fallback.`, "error");
      }
    }

    // 3. Fallback: Grounded Static Intelligence (data-sourced)
    if (!response) {
      const lower = prompt.toLowerCase();
      const budget = truthObject.financials.current_budget;
      const formation = truthObject.tactical_setup.formation_home;
      const fieldCount = Object.keys(playerPositions).length;

      if (lower.includes("finanz") || lower.includes("geld") || lower.includes("budget")) {
        response = budget > 0
          ? `Quelle: financials.current_budget — Budget: € ${budget.toLocaleString()}. Wirtschaftliche Priorität: ROI maximieren, Ausgaben durch Einnahmen decken.`
          : `Keine Daten: financials.current_budget = 0. Hinterlege Sponsoring-Einnahmen im CFO-Board, bevor du Finanzentscheidungen triffst.`;
      } else if (lower.includes("taktik") || lower.includes("pressing") || lower.includes("formation")) {
        response = `Quelle: tactical_setup.formation_home — Wir spielen ${formation}. ${fieldCount >= 11 ? `${fieldCount} Spieler positioniert.` : `Spielfeld unvollständig: ${fieldCount}/11 Spieler. Taktische Analyse nicht möglich.`}`;
      } else if (lower.includes("nlz") || lower.includes("talent") || lower.includes("jugend")) {
        const nlzCount = truthObject.nlz_hub?.registered_talents?.length ?? 0;
        response = nlzCount > 0
          ? `Quelle: nlz_hub.registered_talents — ${nlzCount} Talente registriert. Fokus auf Biomechanik-Profiling.`
          : `Keine Daten: nlz_hub.registered_talents ist leer. Registriere zuerst Talente im NLZ Hub.`;
      } else if (lower.includes("nächste") || lower.includes("was soll") || lower.includes("empfehlung")) {
        // Proactive recommendation — scan truthObject for weakest link
        if (budget === 0) response = `Priorität 1: Keine Daten: financials.current_budget = 0. Hinterlege Sponsoring-Daten im CFO-Board. Ohne Budget ist keine Kaderplanung möglich.`;
        else if (fieldCount < 11) response = `Priorität 1: Spielfeld unvollständig (${fieldCount}/11). Positioniere alle Spieler im Tactical Hub für eine vollständige Analyse.`;
        else response = `System-Check: Alle kritischen Felder befüllt. Nächster Schritt: Taktische Drillanalyse oder Shadow-Scouting starten.`;
      } else {
        response = `System online. Keine spezifischen Daten für diese Anfrage im Truth Object gefunden. Präzisiere deine Frage mit einem Modul-Bezug (Finanzen, Taktik, NLZ, Scouting).`;
      }
    }

    setGerdThinking(false);
    return response;
  };


  // ============================================================
  // LIVE DATA FLOWS — Module Cross-Wiring
  // ============================================================

  // FLOW 1: Tactical Board → truthObject.tactical_setup.active_players_on_field
  useEffect(() => {
    const onField = players
      .filter(p => playerPositions[p.id])
      .map(p => ({ id: p.id, name: p.name, position: p.position, pos: playerPositions[p.id] }));
    setTruthObject(prev => ({
      ...prev,
      tactical_setup: {
        ...prev.tactical_setup,
        active_players_on_field: onField
      }
    }));
  }, [playerPositions]);

  // FLOW 2: NLZ Hub → truthObject.nlz_hub.registered_talents
  useEffect(() => {
    if (typeof youthPlayers === 'undefined') return;
    const talentList = youthPlayers.map(y => ({ id: y.id, name: y.name, age: y.age, position: y.position }));
    const nlzCost = youthPlayers.length * 150; // Simplified per-player cost estimate
    setTruthObject(prev => ({
      ...prev,
      nlz_hub: {
        ...prev.nlz_hub,
        registered_talents: talentList
      },
      financials: {
        ...prev.financials,
        fixed_costs: {
          ...prev.financials.fixed_costs,
          nlz_parent_payments: nlzCost
        }
      }
    }));
  }, [typeof youthPlayers !== 'undefined' ? youthPlayers : null]);

  // FLOW 3: Scouting Pool → truthObject.scouting_pool + auto-generate Stadion-Kurier draft
  useEffect(() => {
    if (!scoutingPool || scoutingPool.length === 0) return;
    // Sync pool into truthObject
    setTruthObject(prev => ({
      ...prev,
      scouting_pool: {
        ...prev.scouting_pool,
        shadow_roster: scoutingPool.map(p => ({ id: p.id, name: p.name, position: p.pos, status: p.status }))
      }
    }));
    // Auto-generate Stadion-Kurier Transfer Alert draft
    const latestTarget = scoutingPool[0];
    if (latestTarget) {
      const transferDraft = {
        type: "Transfer Alert",
        headline: `⚡ Scout-Radar: ${latestTarget.name} (${latestTarget.pos}) im Fokus`,
        description: `Shadow-Scouting Report: ${latestTarget.name}, ${latestTarget.age} Jahre, ${latestTarget.club}. Status: ${latestTarget.status}. Marktwert: ${latestTarget.val}€. Analyse läuft.`
      };
      setSuggestedLayoutBlocks(prev => {
        const alreadyExists = prev.some(b => b.headline === transferDraft.headline);
        return alreadyExists ? prev : [transferDraft, ...prev];
      });
      addAiLog(`Stadion-Kurier: Transfer-Draft für ${latestTarget.name} automatisch generiert.`, "success");
    }
  }, [scoutingPool]);

  const triggerAiAnalysis = async (customPrompt = "") => {

    setVideoFeedback(
      "> Gerd Analyst: Verknüpfe KI-Kerne... Analyse gestartet.",
    );
    const prompt =
      customPrompt ||
      `Analysiere kurz das Video '${playlist[activeClipIndex].title}'. Fokus auf Fussball-Taktik. Antworte kurz und knackig auf Deutsch im 'Stark Elite' Stil.`;
    const report = await askAI(prompt, "Gerd Analyst");

    // Simulated Typing Effect for the UI
    let currentText = "";
    let index = 0;
    const interval = setInterval(() => {
      currentText += report[index];
      setVideoFeedback(currentText);
      index++;
      if (index >= report.length) clearInterval(interval);
    }, 12);
  };

  const saveToArchive = async (type = "proMatchbook") => {
    const sessionName = window.prompt(
      "Name der Taktikmappe/Einheit:",
      `Taktik ${(clubArchive[type] ? clubArchive[type].length : 0) + 1 || 1}`,
    );
    if (!sessionName) return;

    setIsOptimizing(true);
    gerdSpeak("Generiere KI-Snapshot für das Archiv...", "Trainer-Gerd");

    let summary = "Standard-Manöver.";
    try {
      const res = await askAI(
        `Analysiere diese taktische Anordnung: ${Object.keys(playerPositions).length} Spieler. Erstelle einen extrem kurzen KI-Kommentar (max 2 Sätze) für das Archiv.`,
        "Trainer-Gerd",
        true,
      );
      if (res) summary = res;
    } catch (e) { }

    const newEntry = {
      id: Date.now(),
      name: sessionName,
      timestamp: new Date().toISOString(),
      mode: currentMode,
      phase: currentMode === "training" ? trainingPhase : undefined,
      summary: summary,
      playerPositions: { ...playerPositions },
      opponentPositions: { ...opponentPositions },
      drawingPaths: [...drawingPaths],
      assessmentRatings: { ...assessmentRatings },
    };

    const updatedArchive = {
      ...clubArchive,
      [type]: [...(clubArchive[type] || []), newEntry],
    };
    setClubArchive(updatedArchive);
    localStorage.setItem(
      "gerd_clubArchive",
      JSON.stringify(updatedArchive),
    );
    setIsOptimizing(false);
    gerdSpeak(
      `Taktik '${sessionName}' wurde im Stark Elite Archiv gesichert.`,
      "Trainer-Gerd",
    );
  };

  const loadFromArchive = async (entry) => {
    setIsOptimizing(true);
    gerdSpeak(
      "Lade Mappe aus dem Archiv... Starte Closed-Loop Optimierung.",
      "Trainer-Gerd",
    );

    const currentFitness = players.map((p) => ({
      id: p.id,
      name: p.name,
      position: p.position,
      ovr: p.ovr,
      readiness: p.readiness,
      isFit: !p.isInjured && p.readiness >= 65,
    }));

    const positionsToLoad = entry.playerPositions;
    const activePlayerIds = Object.keys(positionsToLoad).map((id) =>
      parseInt(id),
    );

    const prompt = `Du bist Trainer-Gerd. Ein User lädt eine Taktik ('${entry.name}').
          Ursprüngliche Spieler-IDs auf dem Feld: ${JSON.stringify(activePlayerIds)}.
          Aktueller Kader-Status: ${JSON.stringify(currentFitness)}.

          AUFGABE:
          1. Prüfe, ob Spieler auf dem Feld aktuell 'isFit: false' sind.
          2. Falls ja, schlage für JEDEN unfitten Spieler einen fitten Ersatz aus dem Kader vor (gleiche Position oder passender OVR).
          3. Antworte EXAKT im JSON-Format: {"replacements": {"oldId": "newId", ...}, "report": "Kurze Begründung der Wechsel"}.
          4. Falls keine Wechsel nötig sind, gib ein leeres replacements-Objekt zurück.`;

    try {
      const aiResponse = await askAI(prompt, "Trainer-Gerd");
      const cleanJson = aiResponse.replace(/```json|```/g, "").trim();
      const result = JSON.parse(cleanJson);

      let updatedPositions = { ...positionsToLoad };

      if (result.replacements) {
        Object.entries(result.replacements).forEach(([oldId, newId]) => {
          if (updatedPositions[oldId]) {
            const pos = updatedPositions[oldId];
            delete updatedPositions[oldId];
            updatedPositions[newId] = pos;
          }
        });
      }

      setPlayerPositions(updatedPositions);
      setOpponentPositions(entry.opponentPositions);
      setDrawingPaths(entry.drawingPaths);
      setAssessmentRatings(entry.assessmentRatings || {});

      setTimeout(() => {
        setIsOptimizing(false);
        gerdSpeak(
          result.report ||
          "Mappe geladen und an aktuelle Fitness angepasst.",
          "Trainer-Gerd",
        );
      }, 2000);
    } catch (err) {
      console.error("Closed-Loop Load Error:", err);
      // Fallback to direct load
      setPlayerPositions(entry.playerPositions);
      setOpponentPositions(entry.opponentPositions);
      setDrawingPaths(entry.drawingPaths);
      setIsOptimizing(false);
      gerdSpeak(
        "Ups, da lief was schief beim Optimieren. Ich habe die Mappe im Original-Zustand geladen.",
        "Trainer-Gerd",
      );
    }
  };

  const calculateOpponentReactions = (path) => {
    if (!path || path.mode !== "pass") return;

    // Only trigger if pass ends in the "offensive zone" (e.g., y < 320)
    const lastPoint = path.points[path.points.length - 1];
    if (lastPoint.y > 320) return;

    // Sort all opponents by distance and take the 3 closest
    const sortedOpponents = Object.entries(opponentPositions)
      .map(([id, pos]) => ({
        id,
        pos,
        dist: Math.sqrt(
          Math.pow(lastPoint.x - pos.x, 2) +
          Math.pow(lastPoint.y - pos.y, 2),
        ),
      }))
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 3);

    const reactions = sortedOpponents.map(({ pos }) => {
      const dx = lastPoint.x - pos.x;
      const dy = lastPoint.y - pos.y;
      const mag = Math.sqrt(dx * dx + dy * dy) || 1;
      const shiftDist = 20; // Slightly more pronounced shift
      return {
        from: { x: pos.x, y: pos.y },
        to: {
          x: pos.x + (dx / mag) * shiftDist,
          y: pos.y + (dy / mag) * shiftDist,
        },
      };
    });

    setOpponentReactions(reactions);
    setTimeout(() => setOpponentReactions([]), 2500);
  };

  const toggleStartingXI = (playerId) => {
    setStartingXI((prev) => {
      if (prev.includes(playerId))
        return prev.filter((id) => id !== playerId);
      if (prev.length >= 11) {
        gerdSpeak(
          "Kader-Limit erreicht. Nur 11 Spieler für die Startbereitschaft zulässig.",
          "Trainer-Gerd",
        );
        return prev;
      }
      return [...prev, playerId];
    });
  };

  const applyMatchPrepFormation = () => {
    let activeXI = [...startingXI];

    if (activeXI.length < 11) {
      // Auto-select the 11 best fit players if selection is incomplete
      const fitPlayers = players
        .filter((p) => !p.isInjured && p.readiness >= 65)
        .sort((a, b) => b.ovr - a.ovr);

      if (fitPlayers.length < 11) {
        gerdSpeak(
          "Kritischer Kaderengpass. Wir haben nicht genug fitte Spieler für eine volle Startelf.",
          "Trainer-Gerd",
        );
        return;
      }

      activeXI = fitPlayers.slice(0, 11).map((p) => p.id);
      setStartingXI(activeXI);
      gerdSpeak(
        "Kader automatisch optimiert. Die 11 fittesten Elite-Spieler wurden für das 4-4-2 nominiert.",
        "Trainer-Gerd",
      );
    }

    const newPos = {};
    const formation442 = FORMATIONS["4-4-2"];
    const positions = Object.keys(formation442);

    activeXI.forEach((id, index) => {
      if (index < positions.length) {
        newPos[id] = { ...formation442[positions[index]] };
      }
    });

    const oppPos = {};
    const formation343 = FORMATIONS["3-4-3"];
    Object.entries(formation343).forEach(([key, pos], index) => {
      oppPos[`opp-${index}`] = { ...pos };
    });

    setPlayerPositions(newPos);
    setOpponentPositions(oppPos);
    setCurrentMode("match");
    gerdSpeak(
      "Formationen auf dem Board fixiert. 4-4-2 vs 3-4-3. Tactical Hub bereit.",
      "Trainer-Gerd",
    );
  };

  const handleVoiceCommand = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      gerdSpeak(
        "Spracherkennung wird von diesem Browser nicht unterstützt.",
        "Trainer-Gerd",
      );
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "de-DE";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsRecording(true);
      setGerdVoiceActive(true);
      gerdSpeak("Ich höre zu, Trainer.", "Trainer-Gerd");
    };

    recognition.onresult = async (event) => {
      const speechResult = event.results[0][0].transcript;
      setTranscript(speechResult);
      setIsRecording(false);
      setGerdVoiceActive(false);

      // Initialize tab history if missing
      if (!conversationHistory.current[activeTab]) {
        conversationHistory.current[activeTab] = [];
      }
      conversationHistory.current[activeTab].push({ role: "USER", content: speechResult });
      localStorage.setItem("gerd_conversationHistory", JSON.stringify(conversationHistory.current));

      setGerdThinking(true);
      const historyContext = conversationHistory.current[activeTab]
          .map(h => `${h.role}: ${h.content}`)
          .slice(-6) // Keep last 6 turns for context
          .join("\n");

      let prompt = "";
      
      // ==========================================
      // ROUTING BY ACTIVE TAB
      // ==========================================
      if (activeTab === "tactical") {
        const onField = players.filter((p) => playerPositions[p.id]);
        const currentOwn = {};
        const currentOpp = {};
        onField.forEach(p => { currentOwn[p.id] = { x: playerPositions[p.id]?.x || 0, y: playerPositions[p.id]?.y || 0, name: p.name, pos: p.position }; });
        Object.keys(opponentPositions).forEach(k => { currentOpp[k] = { x: opponentPositions[k]?.x || 0, y: opponentPositions[k]?.y || 0 }; });

        prompt = `Du bist Trainer-Gerd, Co-Trainer im Tactical Hub. 
Spielfeld Koordinaten: x (0 bis 420), y (0 bis 640).
Eigene: ${JSON.stringify(currentOwn)}
Gegner: ${JSON.stringify(currentOpp)}

[VERLAUF]
${historyContext}

Entscheide AKTION (JSON):
1. "ASK": Der User fragt etwas. -> { "action": "ASK", "analysis": "Deine Antwort..." }
2. "SIMULATE": User gibt eine Taktik vor (z.B. "Flanke"). -> { 
    "action": "SIMULATE", "analysis": "...", "drillName": "...", 
    "frames": [ 
      { 
        "desc": "...", 
        "playerPositions": {...}, "opponentPositions": {...}, 
        "drawings": [ 
           { "mode": "pass", "points": [{"x": 200, "y": 300}, {"x": 250, "y": 150}] }, 
           { "mode": "run", "points": [{"x": 100, "y": 400}, {"x": 100, "y": 200}] } 
        ] 
      } 
    ] 
  }
3. "SAVE_MATCHPREP": Strategie soll gesichert werden. -> { "action": "SAVE_MATCHPREP", "analysis": "..." }

WICHTIG für SIMULATE: Nutze "drawings" aktiv, um Passwege (mode: "pass") und Laufwege (mode: "run") in das Bild zu malen! Sende NUR das JSON Objekt!`;
      } 
      else if (activeTab === "training_lab") {
        prompt = `Du bist Klopp AI, Head of Training Lab.
Fokus aktuell: ${truthObject.training_lab.active_focus}.

[VERLAUF]
${historyContext}

Entscheide AKTION (JSON):
1. "ASK": Allgemeine Frage zum Training. -> { "action": "ASK", "analysis": "Deine Antwort im Klopp-Style..." }
2. "GENERATE_DRILLS": User will neue Übungen/Sessions. -> { "action": "GENERATE_DRILLS", "analysis": "Klopp-Style Erklärung...", "drills": [ {"id":"d1", "name":"...", "description":"...", "duration":"15m"} ] }

Sende NUR das JSON Objekt!`;
      }
      else if (activeTab === "stadion-kurier") {
        prompt = `Du bist Presse-Gerd, Head of Media & PR.
Verein: ${truthObject.club_identity.name}.

[VERLAUF]
${historyContext}

Entscheide AKTION (JSON):
1. "ASK_PR": Interview-Coaching, Beratung. -> { "action": "ASK_PR", "analysis": "Professioneller PR-Rat..." }
2. "GENERATE_ARTICLE": User will einen Artikel/Beitrag für das Magazin. -> { "action": "GENERATE_ARTICLE", "analysis": "Artikel angelegt.", "article": { "headline": "...", "excerpt": "...", "content": "..." } }

Sende NUR das JSON Objekt!`;
      }
      else if (activeTab === "medical") {
        prompt = `Du bist Doc-Gerd, Head of Medical & Athletics (Stark Elite).
[VERLAUF]
${historyContext}
Entscheide AKTION (JSON):
1. "ASK_MED": Der User fragt nach Verletzungen, Fitness oder Belastungssteuerung. -> { "action": "ASK_MED", "analysis": "Medizinische/Athletische Analyse im harten Doc-Stil..." }
Sende NUR das JSON Objekt!`;
      }
      else if (activeTab === "cfo") {
        prompt = `Du bist Finance-Gerd, Chief Financial Officer (Stark Elite).
Aktuelles Budget (Ist): ${truthObject.financials.current_budget}€
[VERLAUF]
${historyContext}
Entscheide AKTION (JSON):
1. "ASK_FINANCE": Der User fragt nach Budget, ROI, Sponsoren oder Kostensenkung (Zero-Base). -> { "action": "ASK_FINANCE", "analysis": "Finanzstrategische Analyse im sachlichen CFO-Stil..." }
Sende NUR das JSON Objekt!`;
      }
      else if (activeTab === "nlz") {
        prompt = `Du bist Nachwuchs-Gerd, Direktor der Stark Elite Jugend-Akademie.
Aktuelle Altersklasse: ${nlzAgeGroup}.
[VERLAUF]
${historyContext}
PHILOSOPHIE:
- U9 (Funino): Spaß, Dribbling, keine Taktik.
- U13 (Kleinfeld): Beidfüßigkeit (wie in der Ajax-Schule).
- U19 (Großfeld): Red Bull Intensität & Taktik.
Entscheide AKTION (JSON):
1. "ASK_YOUTH": User fragt nach Trainingstipps, Ajax-Philosophie oder Entwicklung. -> { "action": "ASK_YOUTH", "analysis": "Deine proaktive Antwort..." }
Sende NUR das JSON Objekt!`;
      } else {
         setGerdFeedback("Das Sprach-Modul (Multi-Turn) ist in diesem Bereich (noch) nicht verfügbar.");
         gerdSpeak("Das Sprach-Modul ist hier offline.", "Trainer-Gerd");
         setGerdThinking(false);
         return;
      }

      // ==========================================
      // EXECUTE AI
      // ==========================================
      try {
        const response = await askAI(prompt, "System");
        const cleanJson = response.replace(/```json|```/g, "").trim();
        const data = JSON.parse(cleanJson);
        
        setGerdFeedback(data.analysis);
        gerdSpeak(data.analysis, activeTab === "training_lab" ? "Klopp AI" : activeTab === "stadion-kurier" ? "Presse-Gerd" : activeTab === "medical" ? "Doc-Gerd" : activeTab === "cfo" ? "Finance-Gerd" : "Trainer-Gerd");
        conversationHistory.current[activeTab].push({ role: "GERD", content: data.analysis });
        localStorage.setItem("gerd_conversationHistory", JSON.stringify(conversationHistory.current));
        
        // --- TACTICAL ACTIONS ---
        if (data.action === "SIMULATE" && data.frames) {
           const liveDrill = { id: `live_ai_${Date.now()}`, name: data.drillName || "KI Voice-Drill", focus: "Live AI Generierung", aiAnalysis: data.analysis, frames: data.frames };
           setActiveDrill(liveDrill);
           setCurrentFrameIndex(0);
           setPlaybookViewActive(false);
           setTimeout(() => setIsPlayingDrill(true), 2000);
        } else if (data.action === "SAVE_MATCHPREP") {
            const prepFrames = activeDrill ? activeDrill.frames : [{ playerPositions, opponentPositions, drawings: drawingPaths }];
            setClubArchive(prev => ({ ...prev, proMatchbook: [...(prev.proMatchbook || []), { id: `prep_${Date.now()}`, title: activeDrill?.name || "Voice-Match Prep", aiAnalysis: data.analysis, frames: prepFrames }] }));
            setUploadComplete(true);
            setTimeout(() => setUploadComplete(false), 3000);
        }
        
        // --- TRAINING LAB ACTIONS ---
        else if (data.action === "GENERATE_DRILLS" && data.drills) {
           dispatchAction('SET_DRILLS_FOR_DAY', { day: "Montag", drills: data.drills }); 
        }
        
        // --- STADION-KURIER ACTIONS ---
        else if (data.action === "GENERATE_ARTICLE" && data.article) {
           addAiLog(`Gerd hat einen neuen Artikel verfasst: ${data.article.headline}`, "success");
           dispatchAction('PUBLISH_ARTICLE', data.article); 
        }
        
        // --- YOUTH (NLZ) ACTIONS ---
        else if (data.action === "ASK_YOUTH") {
           addAiLog("NLZ Voice AI: Proaktives Audio-Feedback zur Altersklasse geliefert.", "process");
        }

      } catch (err) {
         console.error("AI Multi-Turn Failed:", err);
         setGerdFeedback("SYSTEM FEHLER: Konversation konnte nicht verarbeitet werden.");
         gerdSpeak("Da habe ich den Faden verloren. Wiederhol das nochmal.", "Trainer-Gerd");
      }
      setGerdThinking(false);
    };

    recognition.onerror = (event) => {
      console.error("Speech Recognition Error", event.error);
      setIsRecording(false);
      setGerdVoiceActive(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
      setGerdVoiceActive(false);
    };

    recognition.start();
  };

  const analyzeDrawing = async (drawing) => {
    setVideoFeedback(
      `> Gerd Analyst: Berechne Vektor für ${drawing.type}...`,
    );
    const prompt = `Der User hat eine ${drawing.type}-Markierung auf dem Taktikboard gezeichnet (Start: ${Math.round(drawing.start.x)}, ${Math.round(drawing.start.y)} -> Ende: ${Math.round(drawing.end.x)}, ${Math.round(drawing.end.y)}).
          Analysiere kurz das Risiko und den taktischen Nutzen dieser Aktion im 'Stark Elite' Stil. Antworte in einem kurzen Satz.`;

    const response = await askAI(prompt, "Gerd Analyst");
    setVideoFeedback(`> Analyst: ${response}`);
    if (activeTab === "video") gerdSpeak(response, "Gerd Analyst");
  };

  const [ytAccessToken, setYtAccessToken] = useState("active_session");
  const [players, setPlayers] = useState(initialPlayers.map(p => ({
    ...p,
    resilience: p.resilience || p.mental_resilience || 70,
    sacrifice: p.sacrifice || Math.floor(Math.random() * 30) + 60,
    coolness: p.coolness || Math.floor(Math.random() * 30) + 60,
    aggression: p.aggression || Math.floor(Math.random() * 30) + 60,
    leadership: p.leadership || Math.floor(Math.random() * 40) + 50,
  })));
  const [clubLogo, setClubLogo] = useState(null);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [budget, setBudget] = useState(() => {
    return Number(localStorage.getItem("stark_elite_budget")) || 25000000;
  });
  const [chatMessages, setChatMessages] = useState([
    {
      sender: "System",
      text: "Stark Elite Command Center hochgefahren. Alle Module online.",
    },
  ]);
  const [aiInput, setAiInput] = useState("");
  const [videoFeedback, setVideoFeedback] = useState(
    "> Bereit für Telemetrie-Analyse...",
  );
  const [currentMode, setCurrentMode] = useState(() => {
    return localStorage.getItem("stark_elite_mode") || "training"; // 'match' | 'training'
  });
  const [opponentPositions, setOpponentPositions] = useState({});
  const [trainingPhase, setTrainingPhase] = useState("Taktik"); // 'Warm-up' | 'Taktik' | 'Torschuss'
  const [drawingPaths, setDrawingPaths] = useState([]);
  const [drawMode, setDrawMode] = useState("run"); // 'run' | 'pass'
  const [isDrawingTactic, setIsDrawingTactic] = useState(false);
  const [playerEditorId, setPlayerEditorId] = useState(null);
  const [sessionAssessmentOpen, setSessionAssessmentOpen] =
    useState(false);
  const [assessmentRatings, setAssessmentRatings] = useState({});
  const [opponentReactions, setOpponentReactions] = useState([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [startingXI, setStartingXI] = useState([]); // Array of player IDs (max 11)
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");

  const FORMATIONS = {
    "4-4-2": {
      GK: { x: 210, y: 600 },
      RB: { x: 350, y: 480 },
      CB1: { x: 260, y: 500 },
      CB2: { x: 160, y: 500 },
      LB: { x: 70, y: 480 },
      RM: { x: 370, y: 320 },
      CM1: { x: 260, y: 340 },
      CM2: { x: 160, y: 340 },
      LM: { x: 50, y: 320 },
      ST1: { x: 260, y: 150 },
      ST2: { x: 160, y: 150 },
    },
    "3-4-3": {
      GK: { x: 210, y: 40 },
      CB1: { x: 310, y: 120 },
      CB2: { x: 210, y: 110 },
      CB3: { x: 110, y: 120 },
      RM: { x: 380, y: 240 },
      CM1: { x: 260, y: 250 },
      CM2: { x: 160, y: 250 },
      LM: { x: 40, y: 240 },
      RW: { x: 350, y: 380 },
      ST: { x: 210, y: 400 },
      LW: { x: 70, y: 380 },
    },
  };

  useEffect(() => {
    if (!scoutingPool.length) {
      setScoutingPool([
        {
          id: "s1",
          name: "Marco Reus",
          age: 34,
          pos: "CAM",
          val: "0",
          status: "Free Agent",
          club: "VDV Pool",
          stats: { pac: 72, sho: 84, pas: 86, dri: 85, def: 45, phy: 62 },
        },
        {
          id: "s2",
          name: "Mats Hummels",
          age: 35,
          pos: "CB",
          val: "0",
          status: "Free Agent",
          club: "VDV Pool",
          stats: { pac: 52, sho: 58, pas: 78, dri: 72, def: 88, phy: 76 },
        },
        {
          id: "s3",
          name: "Davy Klaassen",
          age: 31,
          pos: "CM",
          val: "4.0m",
          status: "Active",
          club: "Ajax",
          stats: { pac: 68, sho: 75, pas: 78, dri: 76, def: 65, phy: 72 },
        },
        {
          id: "s4",
          name: "Choupo-Moting",
          age: 35,
          pos: "ST",
          val: "0",
          status: "Free Agent",
          club: "VDV Pool",
          stats: { pac: 70, sho: 78, pas: 72, dri: 74, def: 35, phy: 78 },
        },
        {
          id: "s5",
          name: "Yusuf Kabadayi",
          age: 20,
          pos: "LW",
          val: "1.5m",
          status: "Active",
          club: "FC Schalke 04",
          stats: { pac: 88, sho: 72, pas: 65, dri: 82, def: 30, phy: 68 },
        },
      ]);
    }
  }, []);

  const handleSmartSourcing = async () => {
    if (!sourcingQuery) return;
    setGerdThinking(true);
    setSourcingReport(null);
    const prompt = `Du bist 'Manager-Gerd'. Analysiere den Markt für folgende Anfrage: ${sourcingQuery}.
          Erstelle eine strukturierte Analyse mit 3 Preis-Optionen:
          1. LOW-BUDGET (Fokus auf Preis)
          2. VALUE (Preis-Leistung)
          3. PREMIUM (Höchste Qualität)
          Erstelle am Ende einen kurzen Entwurf für ein Anschreiben an den günstigsten Anbieter im 'Stark Elite' Stil.
          Antworte in einem sauberen Bericht-Layout (JSON-ähnlich strukturiert, aber Text).`;
    const res = await askAI(prompt, "Manager-Gerd");
    setSourcingReport(res);
    setGerdThinking(false);
    gerdSpeak(
      "Die Marktanalyse und Angebotsentwürfe sind bereit zur Prüfung.",
      "Manager-Gerd",
    );
  };

  const handleContractAudit = async () => {
    if (!contractText) return;
    setGerdThinking(true);
    setAuditReport("");
    const prompt = `Du bist 'Manager-Gerd' und spezialisiert auf Sportrecht und Finanzen.
          Analysiere diesen Text/Vertrag auf finanzielle oder rechtliche Lücken:
          ---
          ${contractText}
          ---
          Gib ein kritisches Audit-Feedback und erstelle eine 'Optimierte Version' im professionellen Vereins-Briefkopf-Stil.`;
    const res = await askAI(prompt, "Manager-Gerd");
    setAuditReport(res);
    setGerdThinking(false);
    gerdSpeak(
      "Vertrags-Audit abgeschlossen. Kritische Punkte wurden für dich markiert.",
      "Manager-Gerd",
    );
  };

  const handleInvestmentCalc = async () => {
    setGerdThinking(true);
    const prompt = `Du bist 'Manager-Gerd'. Ein Budget von €${investmentSum.toLocaleString()} soll investiert werden.
          Schlage basierend auf moderner Vereinsführung eine Verteilung vor (z.B. Kader, NLZ, Rücklagen).
          Begründe die Entscheidung mit strategischer Weitsicht.`;
    const res = await askAI(prompt, "Manager-Gerd");
    setInvestmentAI(res);
    setGerdThinking(false);
    gerdSpeak(
      "Investitionsstrategie basierend auf aktuellem Vereinsstatus berechnet.",
      "Manager-Gerd",
    );
  };

  const handleShadowScout = async () => {
    if (!shadowScoutQuery) return;
    setIsScoutingLoading(true);
    setShadowScoutReport("");
    const prompt = `Du bist 'Shadow Scout'. Suche nach Spielern für folgendes Anforderungsprofil: ${shadowScoutQuery}.
          Nenne 3-5 reale passende Spieler (ggf. auch vertragslose aus dem VDV/Duisburg Pool).
          Gib für jeden Spieler eine kurze Pro/Contra Analyse im Kontext von 'Stark Elite'.`;
    const res = await askAI(prompt, "Shadow Scout");
    setShadowScoutReport(res);
    setIsScoutingLoading(false);
    gerdSpeak(
      "Der Shadow Scout hat den Markt sondiert. Ergebnisse liegen vor.",
      "Shadow Scout",
    );
  };

  const handlePrepareOffer = async (player) => {
    setGerdThinking(true);
    const prompt = `Erstelle ein formelles, professionelles Vertragsangebot (PDF-Layout-Stil) für den Spieler ${player.name}.
          Position: ${player.pos}, Marktwert: ${player.val}.
          Das Angebot soll im Namen von 'Stark Elite' verfasst sein.`;
    const res = await askAI(prompt, "Manager-Gerd");
    setAuditReport(res); // Temporary view in report area
    setGerdThinking(false);
    setCfoTab("communication"); // Jump to comm to show the letter
    gerdSpeak(
      `Vertragsangebot für ${player.name} wurde als Entwurf erstellt.`,
      "Manager-Gerd",
    );
  };

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash === "#nlz") setActiveTab("nlz");
      else if (hash === "#vr") setView("vr");
      else if (hash === "#training_lab") setActiveTab("training_lab");
      else if (hash === "#match_manifesto") setActiveTab("match_manifesto");
      else if (hash === "#tactical") setActiveTab("tactical");
      else if (hash === "#medical") setActiveTab("medical");
      else if (hash === "#video") setActiveTab("video");
      else if (hash === "#cfo") setActiveTab("cfo");
      else if (hash === "#journal") setActiveTab("journal");
      else if (hash === "#home" || !hash) setActiveTab("home");
    };
    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  useEffect(() => {
    // Auto-apply 4-4-2 if board is empty and we have players
    if (Object.keys(playerPositions || {}).length === 0 && players.length >= 11) {
      console.log("Tactical Board: Empty state detected. Applying default 4-4-2 formation.");
      const newPos = {};
      const formation442 = FORMATIONS["4-4-2"];
      const posKeys = Object.keys(formation442);
      players.slice(0, 11).forEach((p, i) => {
        if (posKeys[i]) {
          newPos[p.id] = { ...formation442[posKeys[i]] };
        }
      });
      setPlayerPositions(newPos);
      localStorage.setItem("gerd_playerPositions", JSON.stringify(newPos));
    }
  }, [players]); // Re-run if players load/change

  useEffect(() => {
    localStorage.setItem("stark_elite_players", JSON.stringify(players));
  }, [players]);
  useEffect(() => {
    localStorage.setItem("stark_elite_budget", budget.toString());
  }, [budget]);
  useEffect(() => {
    localStorage.setItem("stark_elite_mode", currentMode);
  }, [currentMode]);

  // --- NLZ / YOUTH ACADEMY GLOBAL STATE ---
  const initialYouthPlayers = [
    {
      id: "y1",
      name: "WUNDERKIND",
      position: "CAM",
      group: "u19",
      pac: 78,
      sho: 72,
      pas: 80,
      dri: 85,
      def: 40,
      phy: 65,
      pot: 92,
      image: "",
      hrv: 72,
      sleep: 7.5,
      psychHistory: [],
      videoTresor: [],
    },
    {
      id: "y2",
      name: "TORMINATOR",
      position: "ST",
      group: "u19",
      pac: 88,
      sho: 82,
      pas: 62,
      dri: 76,
      def: 35,
      phy: 78,
      pot: 88,
      image: "",
      hrv: 68,
      sleep: 8.0,
      psychHistory: [],
      videoTresor: [],
    },
    {
      id: "y3",
      name: "KLEINER KLOPP",
      position: "CM",
      group: "u16",
      pac: 65,
      sho: 58,
      pas: 74,
      dri: 68,
      def: 60,
      phy: 62,
      pot: 85,
      image: "",
      hrv: 75,
      sleep: 8.5,
      psychHistory: [],
      videoTresor: [],
    },
    {
      id: "y4",
      name: "SCHNELLER MAX",
      position: "RB",
      group: "u15",
      pac: 82,
      sho: 45,
      pas: 60,
      dri: 70,
      def: 65,
      phy: 72,
      pot: 86,
      image: "",
      hrv: 80,
      sleep: 7.0,
      psychHistory: [],
      videoTresor: [],
    },
    {
      id: "y5",
      name: "TECHNIK KING",
      position: "LW",
      group: "basis",
      pac: 70,
      sho: 55,
      pas: 68,
      dri: 82,
      def: 30,
      phy: 50,
      pot: 89,
      image: "",
      hrv: 70,
      sleep: 8.2,
      psychHistory: [],
      videoTresor: [],
    },
  ];
  const [youthPlayers, setYouthPlayers] = useState(() => {
    const stored = localStorage.getItem("stark_elite_youth");
    return stored ? JSON.parse(stored) : initialYouthPlayers;
  });
  const [nlzTab, setNlzTab] = useState("basis");
  const [scoutModal, setScoutModal] = useState(null); // {player, loading, report}

  // --- PRESSE-GERD & JOURNAL STATE ---
  const [journal, setJournal] = useState(null); // {title, date, editorial, interview, tacticalPreview}
  const [isJournalLoading, setIsJournalLoading] = useState(false);

  const generateJournalContent = async () => {
    setIsJournalLoading(true);
    setGerdThinking(true);
    addAiLog("Initiating Performance Journal Generation...", "request");

    const topPlayer = players.sort(
      (a, b) =>
        b.pac + b.sho + b.pas + b.dri - (a.pac + a.sho + a.pas + a.dri),
    )[0];
    const injuredPlayers = players
      .filter((p) => p.status === "injured")
      .map((p) => p.name)
      .join(", ");
    const teamHealth = Math.round(
      players.reduce(
        (acc, p) => acc + calculateReadiness(p.sleep, p.hrv),
        0,
      ) / players.length,
    );

    const isHeenes = clubIdentity.name === "SG Heenes/Kalkobes";
    const magazineName = isHeenes
      ? "HEENES-KURIER"
      : "STARK PERFORMANCE JOURNAL";

    const prompt = `Du bist Presse-Gerd. Erstelle die heutige Ausgabe des '${magazineName}'.
          Verein: ${clubIdentity.name || "Stark Elite"}.
          Kader-Zustand: Top-Performer ist ${topPlayer.name}, verletzte Spieler: ${injuredPlayers || "keine"}, Team-Fitness: ${teamHealth}%.
          Aufgaben:
          1. Schreibe eine reißerische Headline (Red Bulletin Stil).
          2. Ein kurzes Editorial über den aktuellen Spirit im Verein ${clubIdentity.name || ""}.
          3. Ein fiktives Interview mit Trainer-Gerd über die Taktik (4-4-2 Fokus bei Heenes) und den Fitness-Zustand.
          4. Ein Tactical Update.
          5. Ein 'Sponsor-Corner': Ein kurzer Dank an einen fiktiven lokalen Sponsor (z.B. Autohaus Müller oder Sport-Hansen).
          Antworte STRENG im JSON-Format: {"headline": "", "editorial": "", "interview": "", "tactics": "", "medical": "", "sponsor": "" }`;

    try {
      const raw = await askAI(prompt, "Presse-Gerd");
      let data;
      try {
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        data = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
      } catch (e) {
        console.error("JSON Parse Error in Journal Content", e);
      }

      if (data && data.headline) {
        setJournal({
          title: data.headline,
          magazineName: magazineName,
          date: new Date().toLocaleDateString("de-DE"),
          editorial: data.editorial,
          interview: data.interview,
          tactics: data.tactics,
          medical:
            data.medical ||
            (injuredPlayers
              ? `Update: ${injuredPlayers} im Aufbautraining.`
              : "Kader voll einsatzfähig."),
          sponsor:
            data.sponsor || "Unterstützt durch unsere lokalen Partner.",
        });
        gerdSpeak(
          `Generation abgeschlossen. Headline: ${data.headline}`,
          "Presse-Gerd",
        );
      } else {
        throw new Error("Invalid AI Response");
      }
    } catch (e) {
      addAiLog(
        "Cortex Connection Failure - Loading Static Elite Fallback.",
        "warning",
      );
      // PRO-FALLBACK DATA
      setJournal({
        title: "BEYOND LIMITS: DIE STARK ELITE REVOLUTION",
        magazineName: magazineName,
        date: new Date().toLocaleDateString("de-DE"),
        editorial:
          "In einer world voller Daten ist Instinkt der wahre Gamechanger. Presse-Gerd blickt heute tief in das Herz des Command Centers.",
        interview: `Trainer-Gerd: "Wir haben eine klare Vision. ${topPlayer.name} verkörpert das perfekt auf dem Platz. Die physischen Parameter im Medical Lab zeigen, dass wir bereit für absolute Hochintensität sind."`,
        tactics: `Die Hybrid-Deckung und das aggressive Umschaltspiel über ${topPlayer.name} sind unsere schärfsten Waffen. Wir erzwingen Fehler im Halbraum.`,
        medical: injuredPlayers
          ? `KRANKENSTATION: ${injuredPlayers} werden intensiv betreut. Fokus auf Belastungssteuerung.`
          : "MEDICAL UPDATE: Grünes Licht vom Doc. Der gesamte Kader ist bei 100% Readiness.",
      });
      gerdSpeak(
        "Fallback-Journal geladen. System bereit.",
        "Presse-Gerd",
      );
    } finally {
      setIsJournalLoading(false);
      setGerdThinking(false);
    }
  };
  const [dnaModules, setDnaModules] = useState({
    raumdeckung: { basis: false, aufbau: true, leistung: true },
    gegenpressing: { basis: false, aufbau: false, leistung: true },
    halbraum: { basis: false, aufbau: true, leistung: true },
    ballbesitz: { basis: true, aufbau: true, leistung: true },
    umschaltspiel: { basis: false, aufbau: false, leistung: true },
    standardsituation: { basis: false, aufbau: true, leistung: true },
  });

  useEffect(() => {
    localStorage.setItem(
      "stark_elite_youth",
      JSON.stringify(youthPlayers),
    );
  }, [youthPlayers]);

  const updateYouthPlayer = (id, field, value) => {
    setYouthPlayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    );
  };

  const addYouthPlayer = (group) => {
    const newP = {
      id: `y${Date.now()}`,
      name: "TALENT",
      position: "CM",
      group,
      pac: 65,
      sho: 60,
      pas: 65,
      dri: 65,
      def: 55,
      phy: 60,
      image: "",
      hrv: 70,
      sleep: 8.0,
    };
    setYouthPlayers((prev) => [...prev, newP]);
  };

  const deleteYouthPlayer = (id) => {
    if (window.confirm("Spieler aus dem NLZ entfernen?"))
      setYouthPlayers((prev) => prev.filter((p) => p.id !== id));
  };

  const promoteToProSquad = (yPlayer) => {
    if (!window.confirm(`${yPlayer.name} in den Profi-Kader befördern? (Kosten: 15.000€ Ausbildungsvergütung)`))
      return;
    const proPlayer = {
      ...yPlayer,
      id: Date.now(),
      status: "fit",
      inSquad: false,
      inTraining: true,
      weight: 72,
      fat: 9.5,
      muscle: 42.0,
      rhr: 55,
      load: 60,
    };
    setPlayers((prev) => [...prev, proPlayer]);
    setYouthPlayers((prev) => prev.filter((p) => p.id !== yPlayer.id));
    dispatchAction('UPDATE_FINANCIALS', { path: 'current_budget', value: truthObject.financials.current_budget - 15000 });
    gerdSpeak(`${yPlayer.name} ist jetzt bei den Profis. 15.000 Euro Ausbildungsentschädigung wurden vom Budget abgebucht.`, "Finance-Gerd");
  };

  const openScoutModal = (player) => {
    setScoutModal({ player, loading: true, report: "" });
    setTimeout(() => {
      const ovr = Math.round(
        (player.pac +
          player.sho +
          player.pas +
          player.dri +
          player.def +
          player.phy) /
        6,
      );
      const topStat = [
        ["PAC", player.pac],
        ["SHO", player.sho],
        ["PAS", player.pas],
        ["DRI", player.dri],
      ].sort((a, b) => b[1] - a[1])[0];
      const tier =
        ovr >= 78
          ? "ELITE"
          : ovr >= 70
            ? "HOFFNUNGSTRÄGER"
            : "ENTWICKELBARES TALENT";
      const report = `SCOUT-GERD REPORT: ${player.name} [${player.position}]
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          Gesamtbewertung: ${ovr} OVR — ${tier}

          Herausragendes Attribut: ${topStat[0]} (${topStat[1]}/99)
          ${topStat[0] === "PAC" ? "⚡ Der Antritt ist auf nationalem Top-Niveau. Wenn dieser Spieler Raumgewinn erzeugt, bricht er Linien auf." : ""}
          ${topStat[0] === "DRI" ? "🎩 Das Dribbling ist außergewöhnlich. Enge Ballführung und Körpertäuschungen auf Elite-Niveau." : ""}
          ${topStat[0] === "PAS" ? "🧠 Spielintelligenz: Der Passrhythmus und die Übersicht sind für das Alter sensationell." : ""}
          ${topStat[0] === "SHO" ? "🎯 Torabschluss: Ruhige Coolness vor dem Tor. Wird Trainer-Gerd s Torjäger." : ""}

          Physisches Profil:
          • HRV: ${player.hrv} ms — ${player.hrv > 72 ? "STARK ✅" : "Ausbaufähig ⚠️"}
          • Schlaf: ${player.sleep}h — ${player.sleep >= 8 ? "Optimal ✅" : "Optimierungspotenzial ⚠️"}

          Empfehlung:
          ${ovr >= 78 ? "🚀 SOFORTIGE PRÜFUNG FÜR PROFI-KADER. Der Spieler übertrifft Erwartungen." : ovr >= 70 ? "📈 In 6-12 Monaten profifertig. Weiterführen im Leistungsbereich." : "🔧 Gezielteres Individualprogramm. Technisch stark, physisch noch zu entwickeln."}

          [SYSTEM]: Analyse abgeschlossen. Scout-KI v3.1 aktiv.`;
      let i = 0;
      let txt = "";
      const iv = setInterval(() => {
        txt += report[i];
        i++;
        setScoutModal((s) =>
          s ? { ...s, loading: false, report: txt } : null,
        );
        if (i >= report.length) clearInterval(iv);
      }, 12);
    }, 1500);
  };

  const updatePlayer = (id, field, value) => {
    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updated = { ...p, [field]: value };
          // Automation: If status is 'injured', remove from squad and training
          if (field === "status" && value === "injured") {
            updated.inSquad = false;
            updated.inTraining = false;
          }
          return updated;
        }
        return p;
      }),
    );
  };

  const addPlayer = () => {
    const newPlayer = {
      id: Date.now(),
      name: "NEUZUGANG",
      position: "CM",
      pac: 70,
      sho: 70,
      pas: 70,
      dri: 70,
      def: 70,
      phy: 70,
      sleep: 8,
      hrv: 70,
      weight: 75,
      image: "",
      status: "fit",
      inSquad: false,
      inTraining: true,
      fat: 10.0,
      muscle: 40.0,
      rhr: 60,
      load: 50,
    };
    setPlayers([...players, newPlayer]);
  };

  const deletePlayer = (id) => {
    if (window.confirm("Spieler wirklich entfernen?")) {
      setPlayers(players.filter((p) => p.id !== id));
    }
  };

  const updateImage = (id) => {
    const url = window.prompt("Bitte Bild-URL eingeben:");
    if (url !== null) {
      updatePlayer(id, "image", url);
    }
  };

  const getTierStyle = (ovr) => {
    if (ovr < 65)
      return "bg-gradient-to-br from-[#8c5a30] via-[#cda27a] to-[#4a2e15] text-[#1a0f05]";
    if (ovr < 75)
      return "bg-gradient-to-br from-[#9ca3af] via-[#f3f4f6] to-[#4b5563] text-[#111827]";
    if (ovr < 85)
      return "bg-gradient-to-br from-[#b8860b] via-[#f9d976] to-[#8b6508] text-[#332500]";
    return "bg-gradient-to-br from-[#001240] via-[#0044cc] to-[#E21B4D] text-white border-2 border-neon";
  };

  const handleVideoAction = (action) => {
    setVideoFeedback(
      `> Gerd Analyst: ${action} erkannt. xG-Wahrscheinlichkeit steigt. Schnittstellen-Risiko hoch.`,
    );
  };

  const clearDrawings = () => {
    setDrawings([]);
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height,
    );
  };

  const getMousePos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handleMouseDown = (e) => {
    if (activeVideoTool === "none") return;
    setIsDrawing(true);
    setStartPos(getMousePos(e));
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || activeVideoTool === "none") return;
    const currentPos = getMousePos(e);
    drawPreview(startPos, currentPos);
  };

  const handleMouseUp = (e) => {
    if (!isDrawing || activeVideoTool === "none") return;
    const endPos = getMousePos(e);
    const newDrawing = {
      type: activeVideoTool,
      start: startPos,
      end: endPos,
    };
    setDrawings([...drawings, newDrawing]);
    setIsDrawing(false);
    analyzeDrawing(newDrawing);
  };

  const drawPreview = (start, end) => {
    const ctx = canvasRef.current.getContext("2d");
    renderAllDrawings(ctx);
    drawShape(ctx, activeVideoTool, start, end, true);
  };

  const renderAllDrawings = (ctx) => {
    ctx.clearRect(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height,
    );
    drawings.forEach((d) => drawShape(ctx, d.type, d.start, d.end));
  };

  const drawShape = (ctx, type, start, end, isPreview = false) => {
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.shadowBlur = 10;

    if (type === "arrow") {
      ctx.strokeStyle = "#00f3ff";
      ctx.shadowColor = "#00f3ff";
      const headlen = 15;
      const angle = Math.atan2(end.y - start.y, end.x - start.x);
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.lineTo(
        end.x - headlen * Math.cos(angle - Math.PI / 6),
        end.y - headlen * Math.sin(angle - Math.PI / 6),
      );
      ctx.moveTo(end.x, end.y);
      ctx.lineTo(
        end.x - headlen * Math.cos(angle + Math.PI / 6),
        end.y - headlen * Math.sin(angle + Math.PI / 6),
      );
      ctx.stroke();
    } else if (type === "chain") {
      ctx.strokeStyle = "#E21B4D";
      ctx.shadowColor = "#E21B4D";
      ctx.beginPath();
      ctx.setLineDash([5, 5]);
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
      ctx.setLineDash([]);
      // Label
      ctx.fillStyle = "#E21B4D";
      ctx.font = "bold 12px JetBrains Mono";
      const dist = Math.round(
        Math.sqrt(
          Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2),
        ) / 5,
      );
      ctx.fillText(
        `Abstand: ${dist}m`,
        (start.x + end.x) / 2,
        (start.y + end.y) / 2 - 10,
      );
    } else if (type === "spotlight") {
      ctx.strokeStyle = "#00f3ff";
      ctx.shadowColor = "#00f3ff";
      const radius = Math.sqrt(
        Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2),
      );
      ctx.beginPath();
      ctx.arc(start.x, start.y, radius, 0, 2 * Math.PI);
      ctx.stroke();
      // Info
      ctx.fillStyle = "#00f3ff";
      ctx.font = "bold 12px JetBrains Mono";
      ctx.fillText(
        `SPEED: ${Math.floor(Math.random() * 5 + 28)} km/h`,
        start.x + radius + 5,
        start.y,
      );
    }
  };

  useEffect(() => {
    if (activeTab === "video" && canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      renderAllDrawings(ctx);
    }
  }, [drawings, activeTab]);

  useEffect(() => {
    if (drawings.length >= 0 && activeTab === "video") {
      const sceneCanvas = document.getElementById("telestrator-texture");
      if (sceneCanvas && canvasRef.current) {
        const ctx = sceneCanvas.getContext("2d");
        ctx.clearRect(0, 0, sceneCanvas.width, sceneCanvas.height);
        ctx.drawImage(canvasRef.current, 0, 0);

        // Force A-Frame to update texture
        const plane = document.querySelector("[video-telestrator]");
        if (plane && plane.getObject3D("mesh")) {
          const material = plane.getObject3D("mesh").material;
          if (material.map) material.map.needsUpdate = true;
        }
      }
    }
  }, [drawings, activeTab]);

  const resetTacticBoard = () => {
    setPlayerPositions({});
    setOpponentPositions({});
    setDrawingPaths([]);
    setGerdFeedback("");
  };

  const handleAIRequest = async (e) => {
    e.preventDefault();
    if (!aiInput.trim()) return;

    const userMsg = aiInput;
    setChatMessages((prev) => [
      ...prev,
      { sender: "User", text: userMsg },
    ]);
    setAiInput("");

    const response = await askAI(userMsg, "Trainer-Gerd");
    setChatMessages((prev) => [
      ...prev,
      { sender: "Trainer-Gerd", text: response },
    ]);
    if (activeTab === "video") gerdSpeak(response);
  };

  const renderPlayerEditor = () => {
    const p = players.find((player) => player.id === playerEditorId);
    if (!p) return null;

    return (
      <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/80 backdrop-blur-md p-6">
        <div className="bg-[#111] border border-white/20 p-8 rounded-2xl w-full max-w-md shadow-2xl relative">
          <button
            onClick={() => setPlayerEditorId(null)}
            className="absolute top-4 right-4 text-white/40 hover:text-white"
          >
            <Icon name="x" size={24} />
          </button>
          <h3 className="text-xl font-black text-white uppercase mb-6 tracking-widest border-b border-white/10 pb-4">
            Spieler Akte: {p.name}
          </h3>

          <div className="space-y-4">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="text-[10px] text-white/40 uppercase font-bold mb-1 block">
                  Name
                </label>
                <input
                  type="text"
                  value={p.name}
                  onChange={(e) =>
                    updatePlayer(p.id, "name", e.target.value)
                  }
                  className="w-full bg-white/5 border border-white/10 rounded px-4 py-2 text-white font-mono"
                />
              </div>
              <div className="flex-shrink-0">
                <label className="text-[10px] text-white/40 uppercase font-bold mb-1 block">
                  Portrait Bild
                </label>
                <button
                  onClick={() => {
                    const url = prompt("Bitte gib die URL des neuen Spielerbildes ein (z.B. von Transfermarkt):", p.photo || "");
                    if (url) updatePlayer(p.id, "photo", url);
                  }}
                  className="w-16 h-10 bg-white/5 border border-white/10 rounded flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 transition-all cursor-pointer"
                  title="Bild-URL einfügen"
                >
                  <Icon name="camera" size={16} />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-white/40 uppercase font-bold mb-1 block">
                  Position
                </label>
                <select
                  value={p.position}
                  onChange={(e) =>
                    updatePlayer(p.id, "position", e.target.value)
                  }
                  className="w-full bg-white/5 border border-white/10 rounded px-4 py-2 text-white font-mono"
                >
                  {["TW", "IV", "AV", "ZM", "Flügel", "ST"].map((pos) => (
                    <option key={pos} value={pos}>
                      {pos}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-white/40 uppercase font-bold mb-1 block">
                  OVR
                </label>
                <input
                  type="number"
                  value={p.ovr}
                  onChange={(e) =>
                    updatePlayer(p.id, "ovr", parseInt(e.target.value))
                  }
                  className="w-full bg-white/5 border border-white/10 rounded px-4 py-2 text-white font-mono"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-white/40 uppercase font-bold mb-1 block">
                  Readiness (%)
                </label>
                <input
                  type="number"
                  value={p.readiness}
                  onChange={(e) =>
                    updatePlayer(
                      p.id,
                      "readiness",
                      parseInt(e.target.value),
                    )
                  }
                  className="w-full bg-white/5 border border-white/10 rounded px-4 py-2 text-white font-mono"
                />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  checked={p.isInjured}
                  onChange={(e) =>
                    updatePlayer(p.id, "isInjured", e.target.checked)
                  }
                  className="w-5 h-5 accent-redbull"
                />
                <label className="text-xs text-white/60 font-bold uppercase">
                  Verletzt
                </label>
              </div>
            </div>
            
            {/* FIFA Attributes Editor */}
            <div className="pt-4 border-t border-white/10 mt-4">
              <label className="text-[10px] text-white/40 uppercase font-black mb-3 block tracking-widest text-center">
                 Stark Elite Core Attributes
              </label>
              <div className="grid grid-cols-6 gap-2">
                 {[
                   { id: "pac", label: "PAC" },
                   { id: "sho", label: "SHO" },
                   { id: "pas", label: "PAS" },
                   { id: "dri", label: "DRI" },
                   { id: "def", label: "DEF" },
                   { id: "phy", label: "PHY" }
                 ].map(stat => (
                   <div key={stat.id}>
                     <label className="text-[9px] text-neon uppercase font-bold mb-1 block text-center">
                       {stat.label}
                     </label>
                     <input
                       type="number"
                       value={p.stats?.[stat.id] || 50}
                       onChange={(e) => {
                          const newStats = { ...(p.stats || {pac:50,sho:50,pas:50,dri:50,def:50,phy:50}) };
                          newStats[stat.id] = parseInt(e.target.value) || 0;
                          updatePlayer(p.id, "stats", newStats);
                          
                          // Authentic Position-Weighted OVR
                          let newOvr = 50;
                          const pos = p.position?.toUpperCase() || "";
                          
                          // Helper mappings for weights (PAC, SHO, PAS, DRI, DEF, PHY)
                          if (pos === "ST" || pos === "FS") {
                             newOvr = (newStats.sho * 0.40) + (newStats.pac * 0.20) + (newStats.dri * 0.20) + (newStats.phy * 0.10) + (newStats.pas * 0.10);
                          } else if (pos.includes("W") || ["LM", "RM", "LF", "RF", "FLÜGEL"].includes(pos)) {
                             newOvr = (newStats.pac * 0.35) + (newStats.dri * 0.35) + (newStats.pas * 0.15) + (newStats.sho * 0.10) + (newStats.phy * 0.05);
                          } else if (["ZOM", "CAM", "ZM", "CM", "ZDM", "CDM", "MF"].includes(pos)) {
                             newOvr = (newStats.pas * 0.35) + (newStats.dri * 0.25) + (newStats.def * 0.15) + (newStats.phy * 0.15) + (newStats.pac * 0.05) + (newStats.sho * 0.05);
                          } else if (["LV", "RV", "LAV", "RAV", "LB", "RB", "AV"].includes(pos)) {
                             newOvr = (newStats.pac * 0.30) + (newStats.def * 0.30) + (newStats.phy * 0.15) + (newStats.dri * 0.15) + (newStats.pas * 0.10);
                          } else if (pos === "IV" || pos === "CB") {
                             newOvr = (newStats.def * 0.40) + (newStats.phy * 0.30) + (newStats.pac * 0.10) + (newStats.pas * 0.10) + (newStats.dri * 0.10);
                          } else if (pos === "TW" || pos === "GK") {
                             // GKs use different traits in real FIFA, but we map to standard 6 here as a fallback
                             newOvr = (newStats.def * 0.40) + (newStats.phy * 0.20) + (newStats.pas * 0.20) + (newStats.dri * 0.20);
                          } else {
                             // Fallback to average if position is unknown
                             newOvr = (newStats.pac + newStats.sho + newStats.pas + newStats.dri + newStats.def + newStats.phy) / 6;
                          }
                          
                          updatePlayer(p.id, "ovr", Math.round(newOvr));
                       }}
                       className="w-full bg-white/5 border border-white/10 rounded px-1 py-1.5 text-white font-mono text-center text-[10px] focus:border-neon outline-none"
                     />
                   </div>
                 ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => setPlayerEditorId(null)}
            className="w-full bg-redbull text-white font-black uppercase text-xs py-4 rounded mt-8 hover:bg-white hover:text-redbull transition-all"
          >
            Änderungen Sichern
          </button>
        </div>
      </div>
    );
  };

  const renderAssessmentModal = () => {
    const playersOnPitch = players.filter((p) => playerPositions[p.id]);
    if (!playersOnPitch.length) return null;

    const saveAssessment = () => {
      setPlayers((prev) =>
        prev.map((p) =>
          assessmentRatings[p.id]
            ? { ...p, rating: assessmentRatings[p.id] }
            : p,
        ),
      );
      setSessionAssessmentOpen(false);
      resetTacticBoard();
      gerdSpeak(
        "Einheit abgeschlossen. Leistungsbewertungen wurden synchronisiert.",
        "Trainer-Gerd",
      );
    };

    return (
      <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-6">
        <div className="bg-[#111] border border-neon/30 p-10 rounded-2xl w-full max-w-2xl shadow-[0_0_50px_rgba(0,243,255,0.2)]">
          <h3 className="text-2xl font-black text-white uppercase mb-2 tracking-tighter">
            Einheit Abschließen
          </h3>
          <p className="text-white/40 text-[10px] uppercase tracking-widest mb-8 border-b border-white/10 pb-4">
            Post-Session Leistungsbewertung
          </p>

          <div className="max-h-[50vh] overflow-y-auto space-y-6 pr-4 custom-scrollbar">
            {playersOnPitch.map((p) => (
              <div
                key={p.id}
                className="bg-white/5 p-4 rounded-xl border border-white/10 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-navy border border-neon/40 flex items-center justify-center font-black text-xs text-neon">
                    {p.position}
                  </div>
                  <div className="font-black text-white">{p.name}</div>
                </div>
                <div className="flex items-center gap-4 w-1/2">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="0.5"
                    value={assessmentRatings[p.id] || p.rating}
                    onChange={(e) =>
                      setAssessmentRatings((prev) => ({
                        ...prev,
                        [p.id]: parseFloat(e.target.value),
                      }))
                    }
                    className="w-full accent-neon"
                  />
                  <div className="w-12 text-center font-black text-neon text-lg">
                    {assessmentRatings[p.id] || p.rating}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-4 mt-10">
            <button
              onClick={() => setSessionAssessmentOpen(false)}
              className="flex-1 bg-white/5 text-white/40 font-black uppercase text-xs py-4 rounded hover:bg-white/10 hover:text-white transition-all"
            >
              Abbrechen
            </button>
            <button
              onClick={saveAssessment}
              className="flex-1 bg-neon text-navy font-black uppercase text-xs py-4 rounded hover:bg-white transition-all shadow-[0_0_20px_rgba(0,243,255,0.4)]"
            >
            </button>
          </div>
        </div>
      </div>
    );
  };

  // --- RENDER MODULS ---

  // 1. Mannschaftskabine (FIFA Cards)
  // 1. Mannschaftskabine (FIFA Cards)
  const renderExecutiveZentrale = () => {
    const avgReadiness = (
      players.reduce((acc, p) => acc + (p.readiness || 0), 0) /
      (players.length || 1)
    ).toFixed(1);
    const budgetVal = (budget / 1000000).toFixed(2);
    const allTactics = [
      ...(clubArchive.proMatchbook || []),
      ...(clubArchive.proTrainingbook || []),
    ].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    const lastTactic =
      allTactics.length > 0
        ? allTactics[0].name
        : "Standard-Modus (Archiv leer)";

    // Get a target of the day from scouting pool
    const targetOfDay =
      scoutingPool.length > 0
        ? scoutingPool[Math.floor(Math.random() * scoutingPool.length)]
        : { name: "Analyzing Market...", marketValue: "---" };

    // Get an NLZ highlight
    const nlzHighlight =
      youthPlayers.length > 0
        ? [...youthPlayers].sort(
          (a, b) =>
            ((b.stats && b.stats.technik) || 0) -
            ((a.stats && a.stats.technik) || 0),
        )[0]
        : { name: "Observing Academy..." };

    const handleMorningCall = async () => {
      setIsBriefingLoading(true);
      gerdSpeak("Initiiere systemweiten Deep-Scan aller Module. Analysiere Korrelationen...", "System");

      try {
        const res = await fetch(`${proxyUrl}/api/ai/morning-call`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ truthObject })
        });
        const data = await res.json();

        if (data.ok) {
          setMorningCallBriefing(data.briefing);
          gerdSpeak(data.briefing, "Trainer-Gerd");
        } else {
          throw new Error(data.error);
        }
      } catch (e) {
        setMorningCallBriefing("Neural link unstable. Cross-module data corrupted.");
      }
      setIsBriefingLoading(false);
    };

    return (
      <div className="space-y-10 animate-fade-in p-4 md:p-0">
        {/* --- BRIEFING HEADER --- */}
        <div className="relative overflow-hidden rounded-3xl group">
          <div className="absolute inset-0 bg-gradient-to-r from-navy via-[#0a0a0a] to-navy opacity-90"></div>
          <div className="absolute inset-0 carbon-fiber opacity-30"></div>

          <div className="relative z-10 p-10 flex flex-col md:flex-row items-center justify-between gap-8 border border-white/10 shadow-2xl">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2 text-neon">
                <Icon name="radio" size={18} className="animate-pulse" />
                <span className="font-mono text-[10px] uppercase tracking-[0.4em] font-black">
                  AI Executive Morning Call
                </span>
              </div>
              <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter mb-4">
                Guten Morgen, <span className="text-neon">Commander</span>
              </h2>
              <div className="min-h-[60px] max-w-2xl text-white/60 font-mono text-xs leading-relaxed italic border-l-2 border-white/5 pl-6 py-2">
                {morningCallBriefing ||
                  (isBriefingLoading
                    ? "Aggregiere Modul-Daten..."
                    : "Starte den Morning Call für die strategische Tagesübersicht.")}
              </div>
            </div>

            <button
              onClick={handleMorningCall}
              disabled={isBriefingLoading}
              className="group/btn relative px-8 py-5 bg-neon rounded-sm font-black uppercase text-[10px] tracking-[0.3em] text-navy transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(0,243,255,0.4)] disabled:opacity-50"
            >
              <Icon
                name={isBriefingLoading ? "loader" : "headphones"}
                size={20}
                className={isBriefingLoading ? "animate-spin" : ""}
              />
              <span className="ml-3">
                {isBriefingLoading
                  ? "Computing..."
                  : "Listen to Briefing"}
              </span>
            </button>
          </div>
        </div>

        {/* --- DAILY PULSE GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* SPORT */}
          <div className="glass-panel p-8 rounded-2xl border-l-4 border-neon hover:translate-y-[-5px] transition-transform">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-neon/10 rounded-xl flex items-center justify-center text-neon">
                <Icon name="shield" size={24} />
              </div>
              <div className="text-right">
                <div className="font-mono text-[9px] text-white/40 uppercase">
                  Readiness
                </div>
                <div className="text-2xl font-black text-white italic">
                  {avgReadiness}%
                </div>
              </div>
            </div>
            <h3 className="font-black text-xs text-white uppercase tracking-widest mb-1">
              Sporting Core
            </h3>
            <p className="text-[10px] text-white/40 font-mono mb-4 italic">
              Kollektive Belastungssteuerung
            </p>
            <div className="flex flex-col gap-2 bg-black/40 p-3 rounded-lg border border-white/5">
              {players.length > 0 ? (
                players.slice(0, 3).map(p => (
                  <div key={p.id} className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-white/80">{p.name || 'Unbekannt'}</span>
                    <span className={(p.readiness || 0) < 70 ? "text-red-500" : "text-neon"}>{p.readiness || 0}%</span>
                  </div>
                ))
              ) : (
                <div className="text-[9px] text-white/20 italic text-center">Keine Spieler im Kader identifiziert.</div>
              )}
              {players.length > 3 && <div className="text-[8px] text-center text-white/20 uppercase tracking-widest mt-1">+{players.length - 3} weitere Spieler</div>}
            </div>
          </div>

          {/* FINANCE */}
          <div className="glass-panel p-8 rounded-2xl border-l-4 border-gold hover:translate-y-[-5px] transition-transform">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center text-gold">
                <Icon name="pie-chart" size={24} />
              </div>
              <div className="text-right">
                <div className="font-mono text-[9px] text-white/40 uppercase">
                  Liquidity
                </div>
                <div className="text-2xl font-black text-white italic">
                  € {budgetVal}M
                </div>
              </div>
            </div>
            <h3 className="font-black text-xs text-white uppercase tracking-widest mb-1">
              Financial Power
            </h3>
            <p className="text-[10px] text-white/40 font-mono mb-4 italic">
              Operatives Budget
            </p>
            <div className="bg-black/40 p-4 rounded-lg border border-white/5">
              <div className="text-[9px] text-white/30 uppercase mb-1">
                Last Deployment
              </div>
              <div className="text-xs font-bold text-neon uppercase truncate">
                {lastTactic}
              </div>
            </div>
          </div>

          {/* STRATEGY */}
          <div className="glass-panel p-8 rounded-2xl border-l-4 border-redbull hover:translate-y-[-5px] transition-transform">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-redbull/10 rounded-xl flex items-center justify-center text-redbull">
                <Icon name="target" size={24} />
              </div>
              <div className="text-right">
                <div className="font-mono text-[9px] text-white/40 uppercase">
                  Targets
                </div>
                <div className="text-2xl font-black text-white italic">
                  Active
                </div>
              </div>
            </div>
            <h3 className="font-black text-xs text-white uppercase tracking-widest mb-1">
              Strategy & Intel
            </h3>
            <p className="text-[10px] text-white/40 font-mono mb-4 italic">
              Markt- & Talent-Analyse
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-white/5 p-2 rounded border border-white/5">
                <div className="w-2 h-2 rounded-full bg-redbull animate-pulse"></div>
                <div className="flex-1">
                  <div className="text-[8px] text-white/30 uppercase">
                    Target of the Day
                  </div>
                  <div className="text-[10px] font-bold text-white uppercase">
                    {targetOfDay.name}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/5 p-2 rounded border border-white/5">
                <div className="w-2 h-2 rounded-full bg-neon"></div>
                <div className="flex-1">
                  <div className="text-[8px] text-white/30 uppercase">
                    NLZ Highlight
                  </div>
                  <div className="text-[10px] font-bold text-white uppercase">
                    {nlzHighlight.name}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- QUICK ACTIONS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <button
            onClick={() => setActiveTab("tactical")}
            className="group relative overflow-hidden p-8 rounded-2xl border border-white/10 glass-panel hover:border-neon transition-all text-left"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-neon/10 rounded-full blur-3xl -translate-y-16 translate-x-16 group-hover:bg-neon/20 transition-all"></div>
            <Icon
              name="shield"
              size={32}
              className="text-neon mb-4 group-hover:scale-110 transition-transform"
            />
            <div className="font-black text-xs text-white uppercase tracking-widest mb-2">
              Go to Match Prep
            </div>
            <div className="text-[10px] text-white/30 font-mono italic">
              Tactical Deployment & Squad Control
            </div>
          </button>

          <button
            onClick={() => {
              setActiveTab("cfo");
              setCfoTab("legal");
            }}
            className="group relative overflow-hidden p-8 rounded-2xl border border-white/10 glass-panel hover:border-gold transition-all text-left"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full blur-3xl -translate-y-16 translate-x-16 group-hover:bg-gold/20 transition-all"></div>
            <Icon
              name="file-text"
              size={32}
              className="text-gold mb-4 group-hover:scale-110 transition-transform"
            />
            <div className="font-black text-xs text-white uppercase tracking-widest mb-2">
              Review Contracts
            </div>
            <div className="text-[10px] text-white/30 font-mono italic">
              Legal Audit & Financial Security
            </div>
          </button>

          <button
            onClick={() => setActiveTab("nlz")}
            className="group relative overflow-hidden p-8 rounded-2xl border border-white/10 glass-panel hover:border-neon transition-all text-left"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-neon/10 rounded-full blur-3xl -translate-y-16 translate-x-16 group-hover:bg-neon/20 transition-all"></div>
            <Icon
              name="layout-grid"
              size={32}
              className="text-neon mb-4 group-hover:scale-110 transition-transform"
            />
            <div className="font-black text-xs text-white uppercase tracking-widest mb-2">
              NLZ Performance Hub
            </div>
            <div className="text-[10px] text-white/30 font-mono italic">
              Youth Academy DNA & Growth Tracking
            </div>
          </button>
        </div>
      </div>
    );
  };

  // Add state for NLZ Tactical Board
  const [nlzPlayerPositions, setNlzPlayerPositions] = useState({});

  const renderTactical = ({ targetPlayers = players, targetPositions = playerPositions, setTargetPositions = setPlayerPositions, isNlzTheme = false } = {}) => {
    const isMatchMode = currentMode === "match";

    // 4-4-2 and 3-4-3 default formation positions (% of field width/height)
    const formations = {
      "4-4-2": [
        { pos: "GK", x: 50, y: 90 },
        { pos: "LB", x: 15, y: 72 },
        { pos: "CB", x: 35, y: 72 },
        { pos: "CB", x: 65, y: 72 },
        { pos: "RB", x: 85, y: 72 },
        { pos: "LM", x: 15, y: 50 },
        { pos: "CM", x: 38, y: 50 },
        { pos: "CM", x: 62, y: 50 },
        { pos: "RM", x: 85, y: 50 },
        { pos: "ST", x: 35, y: 22 },
        { pos: "ST", x: 65, y: 22 },
      ],
      "3-4-3": [
        { pos: "GK", x: 50, y: 10 },
        { pos: "CB", x: 25, y: 28 },
        { pos: "CB", x: 50, y: 28 },
        { pos: "CB", x: 75, y: 28 },
        { pos: "LM", x: 15, y: 48 },
        { pos: "CM", x: 38, y: 48 },
        { pos: "CM", x: 62, y: 48 },
        { pos: "RM", x: 85, y: 48 },
        { pos: "LW", x: 20, y: 78 },
        { pos: "ST", x: 50, y: 82 },
        { pos: "RW", x: 80, y: 78 },
      ],
    };

    const squadPlayers = targetPlayers.filter((p) => p.inSquad || isNlzTheme);
    const FIELD_W = 420; // px interior coordinate system
    const FIELD_H = 640; // px interior coordinate system

    const getPlayerPos = (p, idx) => {
      if (!p || !p.id) return { x: 50, y: 300 };
      if (targetPositions[p.id]) return targetPositions[p.id];
      const fPos = formations["4-4-2"][idx % 11];
      return fPos
        ? { x: (fPos.x / 100) * FIELD_W, y: (fPos.y / 100) * FIELD_H }
        : { x: 50, y: 300 };
    };

    const applyFormation = () => {
      const newPos = {};
      const opponentPos = {};

      if (currentMode === "match") {
        // Own Team 4-4-2 (Only fit players)
        const fitPlayers = targetPlayers.filter(
          (p) => !p.isInjured && p.readiness >= 65,
        );
        fitPlayers.slice(0, 11).forEach((p, i) => {
          const f = formations["4-4-2"][i];
          if (f)
            newPos[p.id] = {
              x: (f.x / 100) * FIELD_W,
              y: (f.y / 100) * FIELD_H,
            };
        });

        // Opponent Team 3-4-3 (Red Tokens)
        formations["3-4-3"].forEach((f, i) => {
          opponentPos[`opp-${i}`] = {
            x: (f.x / 100) * FIELD_W,
            y: (f.y / 100) * FIELD_H,
            type: "opponent",
          };
        });

        gerdSpeak(
          "Gefechtsstationen besetzt. Wir spielen 4-4-2 gegen ein feindliches 3-4-3 System.",
          "Trainer-Gerd",
        );
      } else {
        // Training: Clear
        gerdSpeak(
          "Trainingsmodus aktiviert. Freie Platzwahl für alle fitten Spieler.",
          "Trainer-Gerd",
        );
      }

      setTargetPositions(newPos);
      setOpponentPositions(opponentPos);
    };

    const handleFieldDrop = (e) => {
      e.preventDefault();
      if (!draggedPlayerId) return;

      const p = targetPlayers.find((player) => player.id === draggedPlayerId);
      if (p && (p.isInjured || p.readiness < 65)) {
        gerdSpeak(
          `Einsatz verweigert. ${p.name} ist nicht spielfit (Medical Lock).`,
          "Trainer-Gerd",
        );
        setDraggedPlayerId(null);
        return;
      }

      const rect = e.currentTarget.getBoundingClientRect();
      const x = Math.max(
        10,
        Math.min(FIELD_W - 10, e.clientX - rect.left),
      );
      const y = Math.max(
        10,
        Math.min(FIELD_H - 10, e.clientY - rect.top),
      );

      setTargetPositions((prev) => {
        const newPos = { ...prev, [draggedPlayerId]: { x, y } };

        // "The Coach's Touch" Real-time Spatial Alert
        // Very simple mock logic: If moved into extreme wings or isolated, trigger a warning.
        // Check nearest neighbor
        let minDistance = Infinity;
        Object.entries(newPos).forEach(([id, pos]) => {
          if (id !== draggedPlayerId.toString() && id.length < 5) { // Ensure it's own team
            const dist = Math.sqrt(Math.pow(pos.x - x, 2) + Math.pow(pos.y - y, 2));
            if (dist < minDistance) minDistance = dist;
          }
        });

        if (minDistance > 120) { // ~ 18 meters abstract isolation
          gerdSpeak("Achtung Coach: Spieler isoliert sich. Schnittstelle zum Mitspieler wird zu groß.", "The Brain");
        } else if (minDistance < 20) {
          gerdSpeak("Abstände zu eng. Wir nehmen uns selbst den Raum.", "The Brain");
        }

        return newPos;
      });

      setDraggedPlayerId(null);
    };

    const generateGerdFeedback = async () => {
      const onField = targetPlayers.filter((p) => targetPositions[p.id]);
      const playerJson = onField.map((p) => ({
        id: p.id,
        name: p.name,
        pos: p.position,
        coords: [
          Math.round(targetPositions[p.id].x),
          Math.round(targetPositions[p.id].y),
        ],
      }));

      const prompt = `Analysiere folgende taktische Formation (JSON-DUMP): ${JSON.stringify(playerJson)}.
          Modus: ${currentMode.toUpperCase()}.
          Gib ein kurzes, analytisches Feedback zur Positionierung (Abstände, Halbräume, Pressing-Fallen).
          Stil: Hochprofessionell, analytisch, Red Bull Elite. Max 2 Sätze.`;

      const response = await askAI(prompt, "Trainer-Gerd");
      return response;
    };

    const activateGerd = async () => {
      if (gerdThinking) return;
      setGerdThinking(true);
      setGerdVoiceActive(true);
      setGerdFeedback("");

      try {
        const feedback = await generateGerdFeedback();
        setGerdFeedback(feedback);
        gerdSpeak(feedback, "Trainer-Gerd");
      } catch (e) {
        setGerdFeedback(
          "Cortex Connection Failure. Analyse fehlgeschlagen.",
        );
      } finally {
        setGerdThinking(false);
        setGerdVoiceActive(false);
      }
    };

    const renderNewDrillModal = () => {
      if (!isNewDrillModalOpen) return null;
      return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="carbon-fiber w-full max-w-2xl p-8 rounded-2xl border border-neon/30 shadow-[0_0_50px_rgba(0,243,255,0.2)] relative">
            <button
              onClick={() => setIsNewDrillModalOpen(false)}
              className="absolute top-4 right-4 text-white/40 hover:text-neon transition-colors"
            >
              <Icon name="x" size={24} />
            </button>

            <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-4">
              <div className="w-12 h-12 rounded bg-neon/20 flex items-center justify-center border border-neon/50">
                <Icon name="cpu" size={24} className="text-neon" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
                  Strategic Input Mask
                </h2>
                <p className="text-[10px] text-neon font-mono uppercase tracking-widest">
                      // AI-Training-Generator Parameter
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black uppercase text-white/50 tracking-wider mb-2">Taktisches Ziel</label>
                  <select
                    value={drillInputParams.target}
                    onChange={(e) => setDrillInputParams({ ...drillInputParams, target: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white font-bold text-sm focus:border-neon focus:outline-none transition-all"
                  >
                    <option>Spielaufbau</option>
                    <option>Defensiv-Stabilität</option>
                    <option>Umschaltmoment (Gegenpressing)</option>
                    <option>Standardsituationen</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-white/50 tracking-wider mb-2">Raum-Priorität</label>
                  <select
                    value={drillInputParams.zone}
                    onChange={(e) => setDrillInputParams({ ...drillInputParams, zone: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white font-bold text-sm focus:border-neon focus:outline-none transition-all"
                  >
                    <option>Abwehrdrittel</option>
                    <option>Mittelfeldzentrum</option>
                    <option>Flügelzone</option>
                    <option>Angriffsdrittel (Box)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-white/50 tracking-wider mb-2">Gegner-Verhalten</label>
                  <select
                    value={drillInputParams.opponent}
                    onChange={(e) => setDrillInputParams({ ...drillInputParams, opponent: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white font-bold text-sm focus:border-neon focus:outline-none transition-all"
                  >
                    <option>Passiv-lauernd (Tiefer Block)</option>
                    <option>Hoch-pressend (Mann-orientiert)</option>
                    <option>Mittelfeld-Pressing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-white/50 tracking-wider mb-2">Spieler-Anzahl</label>
                  <select
                    value={drillInputParams.players}
                    onChange={(e) => setDrillInputParams({ ...drillInputParams, players: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white font-bold text-sm focus:border-neon focus:outline-none transition-all"
                  >
                    <option>11 v 11 (Vollfeld)</option>
                    <option>8 v 8 (Halbfeld)</option>
                    <option>4 v 4 + 2 (Rondo)</option>
                    <option>6 v 4 (Überzahl)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-white/50 tracking-wider mb-2">Provokationsregeln & Constraints</label>
                <input
                  type="text"
                  placeholder="z.B. 'Max 2 Kontakte, Abschluss innerhalb von 5 Sekunden'"
                  value={drillInputParams.rules}
                  onChange={(e) => setDrillInputParams({ ...drillInputParams, rules: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white font-bold text-sm focus:border-neon focus:outline-none transition-all placeholder:text-white/20"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setIsNewDrillModalOpen(false)}
                className="flex-1 bg-white/5 text-white/40 hover:text-white py-4 rounded-lg font-black uppercase text-xs transition-all border border-white/5 hover:bg-white/10"
              >
                Abbrechen
              </button>
              <button
                onClick={async () => {
                  setIsNewDrillModalOpen(false);
                  if (isGeneratingDrill) return;
                  setIsGeneratingDrill(true);
                  gerdSpeak("Berechne Vektor-Sequenz basierend auf strategischen Parametern.", "The Brain");

                  try {
                    const prompt = `Du bist 'The Brain' (Vektor-Simulations-Engine). Wir spielen 4-4-2 vs 3-4-3.
                        SZENARIO: ${drillInputParams.target} in der Zone ${drillInputParams.zone}.
                        GEGNER-VERHALTEN: ${drillInputParams.opponent}.
                        PROVOKATIONS-REGEL: ${drillInputParams.rules || "Keine"}.
                        
                        Berechne 3 Schlüssel-Phasen (Vektor-Frames). 
                        FÜR JEDEN FRAME: Gib mir die x,y-Koordinaten (0-1000) für Schlüsselspieler (z.B. ST, LM, RM, IV).
                        
                        ANTWORT-FORMAT (NUR JSON):
                        {
                          "name": "Titel",
                          "focus": "Ziel-Analyse",
                          "frames": [
                            { 
                              "desc": "Phase 1: Beschreibung",
                              "vectors": { "player_ids": { "p1": {"x": 500, "y": 800}, "p2": {"x": 400, "y": 750} }, "opp_ids": { "o1": {"x": 500, "y": 700} } }
                            }
                          ]
                        }`;

                    const res = await askAI(prompt, "System");
                    const cleanJson = res.replace(/```json|```/g, "").trim();
                    const drillData = JSON.parse(cleanJson);

                    // Base positions (cached from current view or formation)
                    const homeBase = formations["4-4-2"];
                    const awayBase = formations["3-4-3"];

                    const frames = drillData.frames.map((f, fIdx) => {
                      const pPos = {};
                      const oPos = {};

                      // Initialize with base formation
                      homeBase.forEach((pos, i) => {
                        const pId = targetPlayers[i]?.id || `p-${i}`;
                        pPos[pId] = { x: (pos.x / 100) * FIELD_W, y: (pos.y / 100) * FIELD_H };
                      });
                      awayBase.forEach((pos, i) => {
                        oPos[`opp-${i}`] = { x: (pos.x / 100) * FIELD_W, y: (pos.y / 100) * FIELD_H, type: "opponent" };
                      });

                      // Inject AI vectors if available
                      if (f.vectors?.player_ids) {
                        Object.entries(f.vectors.player_ids).forEach(([pIdx, vec]) => {
                          const pId = targetPlayers[parseInt(pIdx.replace("p", ""))]?.id;
                          if (pId && pPos[pId]) {
                            pPos[pId].x = (vec.x / 1000) * FIELD_W;
                            pPos[pId].y = (vec.y / 1000) * FIELD_H;
                          }
                        });
                      }

                      return {
                        desc: f.desc,
                        playerPositions: pPos,
                        opponentPositions: oPos,
                        drawings: []
                      };
                    });

                    const newDrill = {
                      id: crypto.randomUUID(),
                      aiLogicPrompt: prompt,
                      formationHome: "4-4-2",
                      formationAway: "3-4-3",
                      category: "Taktik",
                      ...drillData,
                      frames
                    };

                    setActiveDrill(newDrill);
                    setDrillMetrics({ name: drillData.name, focus: drillData.focus, difficulty: "Elite", duration: "10-15 Min" });
                    setCurrentFrameIndex(0);
                    gerdSpeak(`Vektor-Sequenz '${drillData.name}' erfolgreich geladen.`, "Trainer-Gerd");

                  } catch (e) {
                    console.error(e);
                    gerdSpeak("Datenstruktur konnte nicht entziffert werden (JSON Error).", "System");
                  } finally {
                    setIsGeneratingDrill(false);
                  }
                }}
                className="flex-1 bg-neon text-navy shadow-[0_0_30px_rgba(0,243,255,0.4)] hover:shadow-[0_0_50px_rgba(0,243,255,0.6)] py-4 rounded-lg font-black uppercase tracking-widest text-xs transition-all flex justify-center items-center gap-2"
              >
                <Icon name="zap" size={16} /> Generate Simulation
              </button>
            </div>
          </div>
        </div>
      );
    };


    const isActive = currentMode === "match";

    // --- OVERRIDE LOGIC FOR LIVE PLAYBOOK SIMULATIONS ---
    const activeFrame = isPlayingDrill && activeDrill ? activeDrill.frames[currentFrameIndex] : null;
    const currentPlayerPositions = activeFrame?.playerPositions || targetPositions;
    const currentOpponentPositions = activeFrame?.opponentPositions || opponentPositions;
    const currentDrawings = activeFrame?.drawings || drawingPaths;

    return (
      <div className="space-y-6 animate-fade-in pb-20">
        {sessionAssessmentOpen && renderAssessmentModal()}

        {/* ── TOP BAR ── */}
        <div className="flex flex-wrap gap-4 items-center justify-between bg-black/40 p-5 rounded-xl border border-white/10 shadow-2xl">
          <div className="flex gap-3">
            <button
              onClick={() => {
                setCurrentMode("match");
                applyFormation();
              }}
              className={`px-6 py-3 rounded font-black uppercase tracking-tighter text-base transition-all flex items-center gap-2 border-2 ${isMatchMode ? "bg-redbull border-transparent shadow-[0_0_25px_rgba(226,27,77,0.5)] scale-105" : "bg-transparent border-white/10 text-white/40 hover:text-white hover:border-white/30"}`}
            >
              <Icon name="play" size={20} /> Spiel Starten
            </button>
            <button
              onClick={() => {
                setCurrentMode("training");
                applyFormation();
              }}
              className={`px-6 py-3 rounded font-black uppercase tracking-tighter text-base transition-all flex items-center gap-2 border-2 ${!isMatchMode ? "bg-neon border-transparent text-navy shadow-[0_0_25px_rgba(0,243,255,0.5)] scale-105" : "bg-transparent border-white/10 text-white/40 hover:text-white hover:border-white/30"}`}
            >
              <Icon name="dumbbell" size={20} /> Training Starten
            </button>
            <button
              onClick={() => setSessionAssessmentOpen(true)}
              className="px-6 py-3 rounded font-black uppercase tracking-tighter text-base bg-white/5 border-2 border-white/10 text-white hover:bg-white hover:text-navy transition-all flex items-center gap-2"
            >
              <Icon name="check-circle" size={20} /> Einheit Abschließen
            </button>
            <button
              onClick={applyMatchPrepFormation}
              className={`px-6 py-3 rounded font-black uppercase tracking-tighter text-base bg-redbull border-2 border-transparent text-white hover:shadow-[0_0_20px_rgba(226,27,77,0.5)] transition-all flex items-center gap-2 ${startingXI.length === 11 ? "animate-pulse" : "opacity-60 cursor-not-allowed"}`}
            >
              <Icon name="layout" size={20} /> Spielvorbereitung
            </button>
            {!isMatchMode && (
              <div className="flex bg-black/60 rounded border border-white/10 p-1 relative">
                {["Warm-up", "Taktik", "Torschuss"].map((phase) => (
                  <button
                    key={phase}
                    onClick={() => setTrainingPhase(phase)}
                    className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all ${trainingPhase === phase ? "bg-neon/20 text-neon" : "text-white/40 hover:text-white"}`}
                  >
                    {phase}
                  </button>
                ))}
              </div>
            )}

            {/* AI Drill Generator Button */}
            {!isMatchMode && (
              <button
                onClick={() => setIsNewDrillModalOpen(true)}
                disabled={isGeneratingDrill}
                className="px-6 py-3 rounded font-black uppercase tracking-tighter text-base bg-neon/10 border border-neon/50 text-neon hover:bg-neon hover:text-navy transition-all shadow-[0_0_15px_rgba(0,243,255,0.2)] flex items-center gap-2"
              >
                {isGeneratingDrill ? <Icon name="loader" size={20} className="animate-spin" /> : <Icon name="cpu" size={20} />}
                {isGeneratingDrill ? "Generiert..." : "KI-Drill Generieren"}
              </button>
            )}

            <button
              onClick={() => setPlaybookViewActive(true)}
              className="px-6 py-3 rounded font-black uppercase tracking-tighter text-base bg-navy/60 border-2 border-neon/30 text-neon hover:bg-neon hover:text-navy transition-all flex items-center gap-2"
            >
              <Icon name="book" size={20} /> Playbook DB
            </button>
          </div>
        </div>

        <div className="flex gap-2 bg-black/60 p-1 rounded-lg border border-white/10">
          <button
            onClick={() => setDrawMode("run")}
            className={`p-2 rounded ${drawMode === "run" ? "bg-white text-navy" : "text-white/40 hover:text-white"}`}
          >
            <Icon name="edit-2" size={18} />
          </button>
          <button
            onClick={() => setDrawMode("pass")}
            className={`p-2 rounded ${drawMode === "pass" ? "bg-neon text-navy" : "text-white/40 hover:text-white"}`}
          >
            <Icon name="shuffle" size={18} />
          </button>
          <div className="w-[1px] bg-white/10 mx-1"></div>
          <button
            onClick={() => setDrawingPaths([])}
            className="p-2 text-redbull hover:scale-110 transition-transform"
          >
            <Icon name="trash-2" size={18} />
          </button>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setVectorAnalysisActive(!vectorAnalysisActive)}
            className={`px-5 py-3 rounded font-black uppercase text-xs flex items-center gap-2 border-2 transition-all ${vectorAnalysisActive ? "bg-neon border-neon text-navy shadow-[0_0_20px_rgba(0,243,255,0.6)] animate-pulse" : "border-white/20 text-white/60 hover:border-white hover:text-white"}`}
          >
            <Icon name="git-commit" size={16} /> Vector-Scan
          </button>

          <button
            onClick={() => setPlaybookViewActive(!playbookViewActive)}
            className={`px-5 py-3 rounded font-black uppercase text-xs flex items-center gap-2 border-2 transition-all ${playbookViewActive ? "bg-gold border-gold text-navy shadow-[0_0_20px_rgba(212,175,55,0.6)]" : "border-white/20 text-white/60 hover:border-white hover:text-white"}`}
          >
            <Icon name="database" size={16} /> Playbook
          </button>

          <button
            onClick={handleVoiceCommand}
            className={`px-5 py-3 rounded font-black uppercase text-xs flex items-center gap-2 border-2 transition-all ${isRecording ? "bg-redbull border-redbull shadow-[0_0_20px_rgba(226,27,77,0.6)] animate-pulse" : "border-white/20 text-white/60 hover:border-white hover:text-white"}`}
          >
            <Icon
              name={isRecording ? "stop-circle" : "mic"}
              size={16}
            />
            {isRecording ? "Höre zu..." : "Live-Taktik (Mikro)"}
          </button>

          <button
            onClick={async () => {
              if (gerdThinking) return;
              setGerdThinking(true);
              setAiTacticsGlow([]);

              // Zero-Hallucination Gate — validateTacticsData()
              const tacticsCheck = validateTacticsData();
              if (!tacticsCheck.valid) {
                setTimeout(() => {
                  setGerdFeedback(`⛔ ${tacticsCheck.error}`);
                  gerdSpeak(tacticsCheck.error, "Trainer-Gerd");
                  setGerdThinking(false);
                }, 500);
                return;
              }

              try {
                const fieldCount = Object.keys(playerPositions).length;
                const oppCount = Object.keys(opponentPositions).length;
                let shadowData = "";
                if (shadowTargetOnPitch) {
                  shadowData = `SHADOW TARGET AKTIV: ${shadowTargetOnPitch.name} (${shadowTargetOnPitch.position}). `;
                }

                const prompt = `TAKTIK-SCAN (Grounded Intelligence): ${shadowData}Analysiere Lücken.\nQuelle: tactical_setup.active_players_on_field = ${fieldCount} Spieler, ${oppCount} Gegner.\nFormation: ${truthObject.tactical_setup.formation_home}.\n\nAntworte in 1 klaren Satz. Markiere 1-2 kritische Zonen.\nANTWORT-FORMAT (NUR JSON):\n{ "feedback": "Direkte taktische Analyse", "glowPoints": [ {"x": 200, "y": 400, "radius": 50} ] }`;

                const res = await askAI(prompt, "System");
                const cleanJson = res.replace(/```json|```/g, "").trim();
                const data = JSON.parse(cleanJson);

                setAiTacticsGlow(data.glowPoints || []);
                setGerdFeedback(`TAKTIK-SCAN: ${data.feedback}`);
                gerdSpeak(data.feedback, "Trainer-Gerd");
              } catch (e) {
                setAiTacticsGlow([{ x: FIELD_W / 2, y: FIELD_H / 2, radius: 100 }]);
                setGerdFeedback("SYSTEM SCAN: Verbindung zum Taktik-Kern instabil.");
              } finally {
                setGerdThinking(false);
              }
            }}
            disabled={gerdThinking}
            className={`px-5 py-3 rounded font-black uppercase text-xs flex items-center gap-2 border-2 transition-all ${aiTacticsGlow.length > 0 ? "bg-redbull/20 border-redbull text-redbull shadow-[0_0_20px_rgba(226,27,77,0.3)] animate-pulse" : gerdThinking ? "border-neon/40 text-neon/40 cursor-wait" : "border-neon/40 text-neon hover:bg-neon/10"}`}
          >
            <Icon
              name={gerdThinking ? "loader" : "crosshair"}
              size={16}
              className={gerdThinking ? "animate-spin" : ""}
            />
            {shadowTargetOnPitch ? "Shadow-Fit Analyse" : "KI-Lücken-Scan"}
          </button>
        </div>


        {/* ── AI Gerd Feedback ── */}
        {
          gerdFeedback && (
            <div className="bg-navy/80 border border-neon/30 rounded-lg p-5 flex gap-4 items-start shadow-[0_0_20px_rgba(0,243,255,0.15)] animate-slide-in">
              <div className="w-10 h-10 rounded-full bg-neon flex items-center justify-center shrink-0">
                <Icon name="brain" size={18} className="text-navy" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-neon uppercase tracking-widest mb-1">
                  Trainer-Gerd KI-Analyse
                </div>
                <p className="font-mono text-sm text-green-300 leading-relaxed">
                  {gerdFeedback}
                </p>
              </div>
              <button
                onClick={() => setGerdFeedback("")}
                className="ml-auto text-white/30 hover:text-white"
              >
                <Icon name="x" size={16} />
              </button>
            </div>
          )
        }

        {/* ── Playbook Repository View (CRUD) ── */}
        {
          playbookViewActive && (
            <div className="bg-[#050a1b] border border-gold/30 rounded-xl p-6 mb-6 shadow-[0_0_30px_rgba(212,175,55,0.15)] animate-slide-in relative overflow-hidden z-50">
              <div className="absolute top-0 right-0 p-8 opacity-5"><Icon name="database" size={100} /></div>

              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-gold uppercase tracking-widest flex items-center gap-3">
                  <Icon name="archive" size={24} /> Playbook-Database (CRUD)
                </h3>
                <button onClick={() => setPlaybookViewActive(false)} className="text-white/50 hover:text-white">
                  <Icon name="x" size={24} />
                </button>
              </div>

              {activeDrill && (
                <div className="mb-8 p-4 bg-neon/5 border border-neon/20 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="text-[10px] uppercase font-black tracking-widest text-neon mb-1">Aktiver Draft</div>
                    <div className="text-white font-bold">{drillMetrics.name || "Ungespeicherter Drill"}</div>
                  </div>
                  <button
                    onClick={async () => {
                      const drillToSave = activeDrill.id ? activeDrill : { id: Date.now(), ...drillMetrics, frames: [{ playerPositions, opponentPositions, drawings: drawingPaths }] };
                      const newDb = [drillToSave, ...playbookDb.filter(d => d.id !== drillToSave.id)];
                      setPlaybookDb(newDb);
                      await dbManager.save("playbookDb", newDb);
                      gerdSpeak("Drill erfolgreich in der Cloud gesichert.", "System");
                    }}
                    className="bg-neon text-navy px-4 py-2 rounded text-xs font-black uppercase tracking-widest hover:bg-white transition-all shadow-[0_0_15px_rgba(0,243,255,0.4)]"
                  >
                    Aktuellen Draft Speichern
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                {/* STARK ELITE PRESETS */}
                {STARK_ELITE_PRESETS.map((preset) => (
                  <div key={preset.id} className="bg-navy border border-neon/50 p-5 rounded-xl shadow-[0_0_20px_rgba(0,243,255,0.15)] group relative flex flex-col">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><Icon name="cpu" size={40} className="text-neon" /></div>
                    <div className="flex justify-between items-start mb-3 relative z-10">
                      <div className="text-[10px] text-neon font-black uppercase tracking-widest bg-neon/10 px-2 py-1 rounded border border-neon/30 flex items-center gap-1">
                        <Icon name="zap" size={10} /> Live-Simulation
                      </div>
                    </div>
                    <h4 className="text-lg font-black text-white leading-tight mb-2 relative z-10">{preset.name}</h4>
                    <div className="text-xs text-white/60 mb-4 flex-1 relative z-10">Fokus: {preset.focus}</div>
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-white/40 mb-4 relative z-10">
                      <div className="bg-white/5 p-1.5 rounded text-neon animate-pulse flex items-center gap-1"><Icon name="cpu" size={10}/> KI-Powered</div>
                      <div className="bg-white/5 p-1.5 rounded">{preset.frames.length} Keys</div>
                    </div>
                    <button
                      onClick={() => {
                        setActiveDrill(preset);
                        setDrillMetrics({ name: preset.name, focus: preset.focus, difficulty: "Elite", duration: "∞" });
                        setCurrentFrameIndex(0);
                        setIsPlayingDrill(true); // Auto-start playback
                        setPlaybookViewActive(false);
                        gerdSpeak(`Lade ${preset.name}. KI-Schatten-Analyse aktiv.`, "System");
                      }}
                      className="w-full bg-neon/20 border border-neon text-neon py-3 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest rounded hover:bg-neon hover:text-navy transition-all shadow-[0_0_15px_rgba(0,243,255,0.3)] mt-auto relative z-10"
                    >
                      <Icon name="play" size={12} /> Simulation Starten
                    </button>
                  </div>
                ))}
                
                {/* USER SAVED DRILLS */}
                {playbookDb.length === 0 ? (
                  <div className="col-span-1 md:col-span-2 text-center text-white/40 font-mono py-12 border-2 border-dashed border-white/10 rounded-xl">
                    Keine eigenen Trainings-Drills im Archiv gefunden.
                  </div>
                ) : (
                  playbookDb.map((drill) => (
                    <div key={drill.id} className="bg-black/60 border border-white/10 p-5 rounded-xl hover:border-gold/50 transition-colors group relative flex flex-col">
                      <div className="flex justify-between items-start mb-3">
                        <div className="text-[10px] text-gold font-black uppercase tracking-widest bg-gold/10 px-2 py-1 rounded border border-gold/20">Saved Drill</div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm("Drill wirklich löschen?")) {
                              const newDb = playbookDb.filter(d => d.id !== drill.id);
                              setPlaybookDb(newDb);
                              dbManager.save("playbookDb", newDb);
                              if (activeDrill?.id === drill.id) setActiveDrill(null);
                            }
                          }}
                          className="text-redbull/50 hover:text-redbull"
                        >
                          <Icon name="trash-2" size={14} />
                        </button>
                      </div>

                      <h4 className="text-lg font-black text-white leading-tight mb-2">{drill.name}</h4>
                      <div className="text-xs text-white/60 mb-4 flex-1">Fokus: {drill.focus}</div>

                      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-white/40 mb-4">
                        <div className="bg-white/5 p-1.5 rounded"> Diff: {drill.difficulty}</div>
                        <div className="bg-white/5 p-1.5 rounded"> Dur: {drill.duration}</div>
                      </div>

                      <div className="flex flex-col gap-2 mt-auto">
                        <button
                          onClick={() => {
                            setActiveDrill(drill);
                            setDrillMetrics({ name: drill.name, focus: drill.focus, difficulty: drill.difficulty || "Medium", duration: drill.duration || "15 Min" });
                            setCurrentFrameIndex(0);
                            setPlaybookViewActive(false);
                            gerdSpeak(`${drill.name} in den Tactical Hub geladen.`, "System");
                          }}
                          className="w-full bg-white/10 text-white py-2 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest rounded hover:bg-white/20 transition-all"
                        >
                          <Icon name="download" size={10} /> Load &
                          Optimize
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {isOptimizing && (
                <div className="pt-2 flex items-center justify-center gap-2 text-[10px] text-neon animate-pulse bg-neon/5 py-2 rounded border border-neon/20">
                  <Icon
                    name="loader"
                    size={12}
                    className="animate-spin"
                  />
                  KI-OPTIMIERUNG LÄUFT...
                </div>
              )}
            </div>
          )
        }

        {/* AI Drill HUD (NEW for Session Visualization) */}
        {Object.keys(playerPositions).length > 0 && activeTab === "tactical" && (
          <div className="absolute top-4 left-4 z-20 bg-black/80 border border-neon/50 p-4 rounded-xl backdrop-blur-md shadow-[0_0_20px_rgba(0,243,255,0.2)] animate-slide-in max-w-[280px]">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="target" className="text-neon animate-pulse" size={14} />
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Live Drill Tracker</span>
            </div>
            <h4 className="text-sm font-black text-neon uppercase tracking-tight truncate">Drill Visualisierung Aktiv</h4>
            <p className="text-[10px] text-white/60 font-mono mt-1 italic">"Spielerpositionen aus dem Training Lab geladen."</p>
          </div>
        )}

        <div className="flex flex-col xl:flex-row gap-8 items-start">
          {/* ══ LEFT COLUMN = PITCH + TIMELINE + ANALYSIS ══ */}
          <div className="flex flex-col gap-4 shrink-0">
            {/* ══ TACTICAL FIELD (SVG) ══ */}
            <div
              className="relative select-none group touch-none tactic-board-mobile overflow-hidden"
            style={{
              width: window.innerWidth < 768 ? "100%" : FIELD_W,
              aspectRatio: `${FIELD_W}/${FIELD_H}`,
              height: "auto",
            }}
            onMouseDown={(e) => {
              if (e.button !== 0) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              setIsDrawingTactic(true);
              setDrawingPaths((prev) => [
                ...prev,
                { mode: drawMode, points: [{ x, y }] },
              ]);
            }}
            onMouseMove={(e) => {
              if (!isDrawingTactic) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              setDrawingPaths((prev) => {
                const last = prev[prev.length - 1];
                const rest = prev.slice(0, -1);
                return [
                  ...rest,
                  { ...last, points: [...last.points, { x, y }] },
                ];
              });
            }}
            onMouseUp={() => {
              if (isDrawingTactic && drawingPaths.length > 0) {
                calculateOpponentReactions(
                  drawingPaths[drawingPaths.length - 1],
                );
              }
              setIsDrawingTactic(false);
            }}
            onTouchStart={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const touch = e.touches[0];
              const x =
                ((touch.clientX - rect.left) / rect.width) * FIELD_W;
              const y =
                ((touch.clientY - rect.top) / rect.height) * FIELD_H;
              setIsDrawingTactic(true);
              setDrawingPaths((prev) => [
                ...prev,
                { mode: drawMode, points: [{ x, y }] },
              ]);
            }}
            onTouchMove={(e) => {
              if (!isDrawingTactic) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const touch = e.touches[0];
              const x =
                ((touch.clientX - rect.left) / rect.width) * FIELD_W;
              const y =
                ((touch.clientY - rect.top) / rect.height) * FIELD_H;
              setDrawingPaths((prev) => {
                const last = prev[prev.length - 1];
                const rest = prev.slice(0, -1);
                return [
                  ...rest,
                  { ...last, points: [...last.points, { x, y }] },
                ];
              });
            }}
            onTouchEnd={() => {
              if (isDrawingTactic && drawingPaths.length > 0) {
                calculateOpponentReactions(
                  drawingPaths[drawingPaths.length - 1],
                );
              }
              setIsDrawingTactic(false);
            }}
          >
            <div
              className="absolute inset-0 z-10"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFieldDrop}
            ></div>

            <svg
              width="100%"
              height="100%"
              viewBox={`0 0 ${FIELD_W} ${FIELD_H}`}
              className="absolute inset-0 rounded-xl overflow-hidden shadow-2xl border border-white/10"
            >
              <rect width={FIELD_W} height={FIELD_H} fill="#0d2b1d" />

              {/* GRID */}
              {Array.from({ length: 15 }).map((_, i) => (
                <line
                  key={`v-${i}`}
                  x1={i * (FIELD_W / 14)}
                  y1="0"
                  x2={i * (FIELD_W / 14)}
                  y2={FIELD_H}
                  stroke="white"
                  strokeOpacity="0.05"
                />
              ))}
              {Array.from({ length: 20 }).map((_, i) => (
                <line
                  key={`h-${i}`}
                  x1="0"
                  y1={i * (FIELD_H / 19)}
                  x2={FIELD_W}
                  y2={i * (FIELD_H / 19)}
                  stroke="white"
                  strokeOpacity="0.05"
                />
              ))}

              {/* PITCH MARKINGS */}
              <line
                x1="0"
                y1={FIELD_H / 2}
                x2={FIELD_W}
                y2={FIELD_H / 2}
                stroke="white"
                strokeOpacity="0.3"
                strokeWidth="2"
              />
              <circle
                cx={FIELD_W / 2}
                cy={FIELD_H / 2}
                r="50"
                fill="none"
                stroke="white"
                strokeOpacity="0.3"
                strokeWidth="2"
              />
              <circle
                cx={FIELD_W / 2}
                cy={FIELD_H / 2}
                r="2"
                fill="white"
                fillOpacity="0.5"
              />

              {/* Penalty Areas (Strafraum) */}
              <rect
                x="50"
                y="0"
                width={FIELD_W - 100}
                height="80"
                fill="none"
                stroke="white"
                strokeOpacity="0.3"
                strokeWidth="2"
              />
              <rect
                x="50"
                y={FIELD_H - 80}
                width={FIELD_W - 100}
                height="80"
                fill="none"
                stroke="white"
                strokeOpacity="0.3"
                strokeWidth="2"
              />

              {/* 5m Boxes (Torraum) */}
              <rect
                x="130"
                y="0"
                width={FIELD_W - 260}
                height="30"
                fill="none"
                stroke="white"
                strokeOpacity="0.3"
                strokeWidth="2"
              />
              <rect
                x="130"
                y={FIELD_H - 30}
                width={FIELD_W - 260}
                height="30"
                fill="none"
                stroke="white"
                strokeOpacity="0.3"
                strokeWidth="2"
              />

              {/* Penalty Spots */}
              <circle
                cx={FIELD_W / 2}
                cy="60"
                r="2"
                fill="white"
                fillOpacity="0.5"
              />
              <circle
                cx={FIELD_W / 2}
                cy={FIELD_H - 60}
                r="2"
                fill="white"
                fillOpacity="0.5"
              />

              {/* Goals (Tore) */}
              <path
                d={`M 175 0 L 175 12 L 245 12 L 245 0`}
                fill="url(#net-pattern)"
                stroke="white"
                strokeWidth="3"
                strokeOpacity="0.8"
              />
              <path
                d={`M 175 ${FIELD_H} L 175 ${FIELD_H - 12} L 245 ${FIELD_H - 12} L 245 ${FIELD_H}`}
                fill="url(#net-pattern)"
                stroke="white"
                strokeWidth="3"
                strokeOpacity="0.8"
              />

              {/* DRAWINGS LAYER */}
              {currentDrawings.map((path, idx) => (
                <polyline
                  key={idx}
                  fill="none"
                  points={path.points
                    .map((p) => `${p.x},${p.y}`)
                    .join(" ")}
                  stroke={path.mode === "run" ? "#ffffff" : "#00f3ff"}
                  strokeWidth="3"
                  strokeDasharray={path.mode === "pass" ? "8,6" : "none"}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  markerEnd={path.mode === "pass" ? "url(#arrowhead-neon)" : path.mode === "run" ? "url(#arrowhead-white)" : "none"}
                  className={path.mode === "pass" ? "animate-pulse" : ""}
                />
              ))}

              {/* VECTOR ANALYSIS LAYER (Line-Spacing Distances) */}
              {vectorAnalysisActive && (() => {
                const distData = calculateTacticalDistances();
                if (!distData) return null;
                return (
                  <g className="vector-analysis-layer">
                    {/* Lines connecting the horizontal blocks */}
                    <line x1={distData.lines[0].x} y1={distData.lines[0].y} x2={distData.lines[1].x} y2={distData.lines[1].y} stroke="#00f3ff" strokeWidth="2" strokeDasharray="5,5" />
                    <line x1={distData.lines[1].x} y1={distData.lines[1].y} x2={distData.lines[2].x} y2={distData.lines[2].y} stroke="#00f3ff" strokeWidth="2" strokeDasharray="5,5" />

                    {/* Distance Texts */}
                    <g transform={`translate(${distData.lines[0].x + 20}, ${(distData.lines[0].y + distData.lines[1].y) / 2})`}>
                      <rect x="-5" y="-12" width="40" height="20" fill="black" stroke="#00f3ff" rx="4" opacity="0.8" />
                      <text x="15" y="2" fill="#00f3ff" fontSize="12" fontWeight="bold" textAnchor="middle">{distData.distances[0]}m</text>
                    </g>

                    <g transform={`translate(${distData.lines[1].x + 20}, ${(distData.lines[1].y + distData.lines[2].y) / 2})`}>
                      <rect x="-5" y="-12" width="40" height="20" fill="black" stroke="#00f3ff" rx="4" opacity="0.8" />
                      <text x="15" y="2" fill="#00f3ff" fontSize="12" fontWeight="bold" textAnchor="middle">{distData.distances[1]}m</text>
                    </g>
                  </g>
                );
              })()}

              {/* AI TACTICS GLOW LAYER (Schnittstellen-Lücken) */}
              {aiTacticsGlow.map((glow, idx) => (
                <circle
                  key={`glow-${idx}`}
                  cx={glow.x}
                  cy={glow.y}
                  r={glow.radius}
                  fill="url(#glow-rad)"
                  className="animate-pulse"
                />
              ))}

              {/* SVG Defs for AI Glow */}
              <defs>
                <radialGradient id="glow-rad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#e21b4d" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#e21b4d" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* PREDICTIVE OPPONENT REACTIONS & CUSTOM PATTERNS */}
              <defs>
                <pattern
                  id="net-pattern"
                  x="0"
                  y="0"
                  width="4"
                  height="4"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 0 0 L 4 4 M 4 0 L 0 4"
                    stroke="white"
                    strokeOpacity="0.4"
                    strokeWidth="0.5"
                  />
                </pattern>
                <marker
                  id="arrowhead-red"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3.5, 0 7" fill="#E21B4D" />
                </marker>
                <marker
                  id="arrowhead-white"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3.5, 0 7" fill="#ffffff" />
                </marker>
                <marker
                  id="arrowhead-neon"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3.5, 0 7" fill="#00f3ff" />
                </marker>
              </defs>
              {opponentReactions.map((r, i) => (
                <line
                  key={`react-${i}`}
                  x1={r.from.x}
                  y1={r.from.y}
                  x2={r.to.x}
                  y2={r.to.y}
                  stroke="#E21B4D"
                  strokeWidth="2"
                  strokeDasharray="4,2"
                  markerEnd="url(#arrowhead-red)"
                  className="animate-pulse"
                />
              ))}

              {/* OWN PLAYERS */}
              {Object.entries(currentPlayerPositions).map(([id, pos]) => {
                let p = players.find((p) => p.id === parseInt(id) || String(p.id) === id);
                if (!p && activeFrame) {
                   p = { id, name: pos.name || id, position: pos.pos || 'X', photo: null };
                }
                if (!p) return null;
                return (
                  <g
                    key={`player-${id}`}
                    transform={`translate(${pos.x}, ${pos.y})`}
                    className={`cursor-move ${isPlayingDrill ? 'transition-all duration-[2000ms] ease-in-out' : ''}`}
                  >
                    {p.photo && (
                      <defs>
                        <pattern id={`photo-tactical-${p.id}`} x="-16" y="-16" width="32" height="32" patternUnits="userSpaceOnUse">
                          <image href={p.photo} x="0" y="0" width="32" height="32" preserveAspectRatio="xMidYMid slice" />
                        </pattern>
                      </defs>
                    )}
                    <circle
                      r="16"
                      fill={p.photo ? `url(#photo-tactical-${p.id})` : "#navy"}
                      stroke="#00f3ff"
                      strokeWidth="2"
                      className="shadow-lg"
                    />
                    <text
                      y="5"
                      textAnchor="middle"
                      fill="white"
                      fontSize="10"
                      fontWeight="900"
                      style={{ pointerEvents: "none" }}
                    >
                      {p.position}
                    </text>
                    <text
                      y="30"
                      textAnchor="middle"
                      fill="white"
                      fontSize="9"
                      fontWeight="bold"
                      className="uppercase tracking-widest"
                    >
                      {p.name}
                    </text>
                  </g>
                );
              })}

              {/* OPPONENTS */}
              {(isActive || activeFrame) &&
                Object.entries(currentOpponentPositions).map(([id, pos]) => (
                  <g key={id} transform={`translate(${pos.x}, ${pos.y})`} className={`${isPlayingDrill ? 'transition-all duration-[2000ms] ease-in-out' : ''}`}>
                    <circle
                      r="14"
                      fill="#600"
                      stroke="#E21B4D"
                      strokeWidth="2"
                      strokeOpacity="0.5"
                    />
                    <text
                      y="5"
                      textAnchor="middle"
                      fill="#E21B4D"
                      fontSize="10"
                      fontWeight="900"
                    >
                      X
                    </text>
                  </g>
                ))}
              {/* SHADOW TARGET SCOUTING PLAYER */}
              {shadowTargetOnPitch && (
                <g
                  transform={`translate(${shadowTargetPos.x}, ${shadowTargetPos.y})`}
                  className="cursor-move"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    const startX = e.clientX;
                    const startY = e.clientY;
                    const initialPos = { ...shadowTargetPos };

                    const handleMove = (moveEvent) => {
                      const dx = moveEvent.clientX - startX;
                      const dy = moveEvent.clientY - startY;
                      setShadowTargetPos({
                        x: Math.max(10, Math.min(FIELD_W - 10, initialPos.x + dx)),
                        y: Math.max(10, Math.min(FIELD_H - 10, initialPos.y + dy))
                      });
                    };

                    const handleUp = () => {
                      window.removeEventListener('mousemove', handleMove);
                      window.removeEventListener('mouseup', handleUp);
                    };

                    window.addEventListener('mousemove', handleMove);
                    window.addEventListener('mouseup', handleUp);
                  }}
                >
                  <circle r="22" fill="none" stroke="#D4AF37" strokeWidth="2" strokeDasharray="5,3" className="animate-spin-slow" />
                  <circle r="16" fill="rgba(212,175,55,0.1)" stroke="#D4AF37" strokeWidth="2" />
                  <text y="5" textAnchor="middle" fill="#D4AF37" fontSize="9" fontWeight="900" style={{ pointerEvents: "none" }}>{shadowTargetOnPitch.position}</text>
                  <text y="-25" textAnchor="middle" fill="#D4AF37" fontSize="8" fontWeight="black" className="uppercase tracking-widest">Shadow Target</text>
                  <text y="35" textAnchor="middle" fill="white" fontSize="10" fontWeight="black" className="uppercase tracking-tighter">{shadowTargetOnPitch.name}</text>
                </g>
              )}
            </svg>
          </div>

          {/* ── TIMELINE CONTROLLER ── */}
          {activeDrill && (
            <div className="w-full mt-4 bg-black/60 border border-white/10 rounded-xl p-4 flex flex-col gap-3 shadow-2xl backdrop-blur-md">
              <div className="flex justify-between items-center px-2">
                <div className="text-xs font-black uppercase text-neon tracking-widest">{activeDrill.name}</div>
                <div className="text-[10px] text-white/50 font-mono">FRAME {currentFrameIndex + 1} / {activeDrill.frames.length}</div>
              </div>

              <div className="relative w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-neon transition-all duration-300 ease-out"
                  style={{ width: `${((currentFrameIndex + 1) / activeDrill.frames.length) * 100}%` }}
                ></div>
              </div>

              <div className="flex justify-center items-center gap-4 mt-2">
                <button
                  onClick={() => {
                    setIsPlayingDrill(false);
                    setCurrentFrameIndex(Math.max(0, currentFrameIndex - 1));
                  }}
                  className="p-2 bg-white/5 hover:bg-white/20 rounded-full text-white transition-all disabled:opacity-30"
                  disabled={currentFrameIndex === 0}
                >
                  <Icon name="skip-back" size={16} />
                </button>

                <button
                  onClick={() => {
                    if (currentFrameIndex >= activeDrill.frames.length - 1 && !isPlayingDrill) {
                      setCurrentFrameIndex(0);
                    }
                    setIsPlayingDrill(!isPlayingDrill);
                  }}
                  className="p-4 bg-neon hover:bg-white rounded-full text-navy shadow-[0_0_20px_rgba(0,243,255,0.4)] transition-all transform hover:scale-110"
                >
                  <Icon name={isPlayingDrill ? "pause" : "play"} size={24} className={isPlayingDrill ? "animate-pulse" : ""} />
                </button>

                <button
                  onClick={() => {
                    setIsPlayingDrill(false);
                    setCurrentFrameIndex(Math.min(activeDrill.frames.length - 1, currentFrameIndex + 1));
                  }}
                  className="p-2 bg-white/5 hover:bg-white/20 rounded-full text-white transition-all disabled:opacity-30"
                  disabled={currentFrameIndex >= activeDrill.frames.length - 1}
                >
                  <Icon name="skip-forward" size={16} />
                </button>
              </div>
              <div className="text-center text-[10px] text-white/70 italic mt-1">
                {activeDrill.frames[currentFrameIndex]?.desc || "Drill Sequenz"}
              </div>
            </div>
          )}

          {/* ── STARK ELITE AI TACTICAL ANALYSIS PANEL ── */}
          {activeDrill?.aiAnalysis && (
            <div className="w-full bg-navy/80 border border-neon/30 p-6 rounded-xl shadow-[0_0_20px_rgba(0,243,255,0.15)] animate-slide-in relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                 <Icon name="cpu" size={80} className="text-neon" />
              </div>
              <h4 className="text-neon font-black uppercase text-[12px] tracking-[0.3em] mb-4 flex items-center gap-2 relative z-10">
                <Icon name="brain" size={16} /> KI-Tiefenanalyse
              </h4>
              <p className="font-mono text-xs text-white/80 leading-relaxed max-w-xl relative z-10">
                {activeDrill.aiAnalysis}
              </p>
            </div>
          )}
          </div> {/* END LEFT COLUMN */}

        {/* ══ SQUAD SIDEBAR ══ */}
        <div className="flex-1 w-full flex flex-col gap-6">
          {/* Shadow Scouting Integration Panel */}
          <div className="bg-gold/10 border border-gold/30 rounded-xl p-6 shadow-2xl backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-gold"><Icon name="search" size={60} /></div>
            <h4 className="text-gold font-black uppercase text-[10px] tracking-[0.3em] mb-2 flex items-center gap-2">
              <Icon name="star" size={12} /> Shadow Sourcing Hub
            </h4>
            <p className="text-white/40 text-[10px] uppercase font-mono leading-tight mb-4 tracking-tighter">
              Analysiere potenzielle Neuzugänge direkt auf dem Whiteboard.
            </p>

            <div className="space-y-3">
              {scoutingPool.map((candidate) => (
                <div
                  key={candidate.id}
                  onClick={() => {
                    setShadowTargetOnPitch(shadowTargetOnPitch?.id === candidate.id ? null : candidate);
                    gerdSpeak(shadowTargetOnPitch?.id === candidate.id ? "Shadow Target entfernt." : `Analysiere Taktik-Fit für ${candidate.name}.`, "System");
                  }}
                  className={`p-3 rounded-lg border transition-all cursor-pointer flex justify-between items-center ${shadowTargetOnPitch?.id === candidate.id ? 'bg-gold/20 border-gold shadow-[0_0_15px_rgba(212,175,55,0.3)]' : 'bg-black/40 border-white/10 hover:border-gold/30'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-gold/20 flex items-center justify-center border border-gold/40 text-gold font-black text-xs">
                      {candidate.position}
                    </div>
                    <div>
                      <div className="text-xs font-black text-white uppercase">{candidate.name}</div>
                      <div className="text-[9px] text-white/40 font-mono">Market: €{(candidate.marketValue / 1000000).toFixed(1)}M</div>
                    </div>
                  </div>
                  {shadowTargetOnPitch?.id === candidate.id && <Icon name="check-circle" size={16} className="text-gold" />}
                </div>
              ))}
              {scoutingPool.length === 0 && (
                <div className="text-center py-4 border border-dashed border-white/10 rounded-lg text-white/20 text-[10px] uppercase font-black uppercase">
                  Keine Kandidaten im Pool.
                </div>
              )}
            </div>
          </div>

          <div className="bg-black/40 rounded-xl border border-white/10 p-6 shadow-2xl backdrop-blur-md">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h4 className="text-white/40 font-black uppercase text-[10px] tracking-[0.3em]">
                  Squad Readiness
                </h4>
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">
                  Stark Elite <span className="text-redbull">Kader</span>
                </h3>
              </div>
              <div className="bg-redbull/20 px-4 py-1 rounded-full border border-redbull/40 text-redbull font-black text-[10px] uppercase">
                Medical Lock Active
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar kader-leiste-mobile">
              {players.map((p) => {
                const isFit = !p.isInjured && p.readiness >= 65;
                const onField = playerPositions[p.id];
                const isNominated = startingXI.includes(p.id);
                const accentColor = isFit ? "neon" : "redbull";

                return (
                  <div
                    key={p.id}
                    draggable={isFit}
                    onDragStart={() => setDraggedPlayerId(p.id)}
                    onClick={() => toggleStartingXI(p.id)}
                    className={`group relative p-0 rounded-lg border-2 transition-all cursor-pointer overflow-hidden carbon-fiber kader-item-mobile ${isNominated ? "border-redbull shadow-[0_0_15px_rgba(226,27,77,0.4)]" : onField ? "border-neon/40 shadow-[0_0_10px_rgba(0,243,255,0.2)]" : "border-white/10 hover:border-white/30"}`}
                  >
                    {/* RED BULL FIFA CARD LAYOUT */}
                    <div className="flex flex-col h-full uppercase font-black tracking-tighter">
                      <div className="flex justify-between p-3 pb-0">
                        <div className="flex flex-col items-center">
                          <span className={`text-2xl leading-none ${isFit ? "text-white" : "text-redbull"}`}>
                            {p.ovr}
                          </span>
                          <span className="text-[9px] text-white/40 tracking-widest">
                            {p.position}
                          </span>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="flex items-center gap-1">
                            <span className={`text-[10px] ${p.readiness > 80 ? "text-neon" : "text-yellow-400"}`}>
                              {p.readiness}%
                            </span>
                            <Icon name="zap" size={10} className="text-neon" />
                          </div>
                          <div className="text-[8px] text-white/20 font-mono mt-1">INTENSITY: {p.intensity || 50}</div>
                        </div>
                      </div>

                      <div className="mt-3 px-3 py-1 bg-black/60 border-y border-white/10 flex justify-between items-center group/name">
                        <div className="text-[10px] text-white truncate flex-1 font-black italic tracking-widest">
                          {p.name}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingPlayer(p);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-white/40 hover:text-white transition-opacity"
                        >
                          <Icon name="edit-2" size={10} />
                        </button>
                      </div>

                      {/* POWER STATS (NEW: Red Bull Style) */}
                      <div className="grid grid-cols-3 gap-0 px-3 py-2 bg-black/40">
                        <div className="text-center border-r border-white/5">
                          <div className="text-[7px] text-white/30 mb-0.5">SPRINT</div>
                          <div className="text-[10px] text-white">{p.sprint_speed || 50}</div>
                        </div>
                        <div className="text-center border-r border-white/5">
                          <div className="text-[7px] text-redbull mb-0.5">POWER</div>
                          <div className="text-[10px] text-redbull">{p.intensity || 50}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-[7px] text-gold mb-0.5">MNTL</div>
                          <div className="text-[10px] text-gold">{p.mental_resilience || 50}</div>
                        </div>
                      </div>

                      {/* Power Flow Bar */}
                      <div className={`h-1 w-full bg-navy/40 relative overflow-hidden`}>
                        <div className={`h-full bg-redbull transition-all duration-1000 ${isNominated ? "w-full animate-pulse" : "w-[40%]"}`}></div>
                      </div>
                    </div>

                    {isNominated && (
                      <div className="absolute top-1 right-1 bg-redbull text-white rounded-full p-0.5 shadow-lg">
                        <Icon name="check" size={8} />
                      </div>
                    )}

                    {!isFit && (
                      <div className="absolute inset-0 bg-redbull/10 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
                        <div className="bg-redbull text-white text-[8px] px-2 py-0.5 rounded font-black">
                          MEDICAL LOCK
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* PLAYER EDITOR MODAL */}
            {editingPlayer && (
              <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
                <div className="carbon-fiber w-full max-w-md p-8 rounded-2xl border border-white/20 shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-slide-up">
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-6 flex items-center gap-3">
                    <Icon
                      name="user"
                      size={20}
                      className="text-redbull"
                    />{" "}
                    Profil Bearbeiten
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] text-white/40 uppercase font-black tracking-widest block mb-2">
                        Spieler-Name
                      </label>
                      <input
                        type="text"
                        value={editingPlayer.name}
                        onChange={(e) =>
                          setEditingPlayer({
                            ...editingPlayer,
                            name: e.target.value,
                          })
                        }
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white font-black uppercase text-sm focus:border-redbull focus:outline-none transition-all"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] text-white/40 uppercase font-black tracking-widest block mb-2">
                          Position
                        </label>
                        <select
                          value={editingPlayer.position}
                          onChange={(e) =>
                            setEditingPlayer({
                              ...editingPlayer,
                              position: e.target.value,
                            })
                          }
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white font-black uppercase text-xs focus:border-redbull focus:outline-none transition-all appearance-none"
                        >
                          {[
                            "TW",
                            "IV",
                            "LB",
                            "RB",
                            "CM",
                            "LM",
                            "RM",
                            "CAM",
                            "ST",
                          ].map((pos) => (
                            <option key={pos} value={pos}>
                              {pos}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] text-white/40 uppercase font-black tracking-widest block mb-2">
                            Alter
                          </label>
                          <input
                            type="number"
                            value={editingPlayer.age}
                            onChange={(e) =>
                              setEditingPlayer({
                                ...editingPlayer,
                                age: parseInt(e.target.value),
                              })
                            }
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white font-black text-sm focus:border-redbull focus:outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-white/40 uppercase font-black tracking-widest block mb-2">
                            Nationalität (ISO)
                          </label>
                          <input
                            type="text"
                            value={editingPlayer.nationality}
                            onChange={(e) =>
                              setEditingPlayer({
                                ...editingPlayer,
                                nationality: e.target.value,
                              })
                            }
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white font-black uppercase text-sm focus:border-redbull focus:outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] text-white/40 uppercase font-black tracking-widest block mb-2">
                            Marktwert (€)
                          </label>
                          <input
                            type="number"
                            value={editingPlayer.marketValue}
                            onChange={(e) =>
                              setEditingPlayer({
                                ...editingPlayer,
                                marketValue: parseInt(e.target.value),
                              })
                            }
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white font-black text-sm focus:border-redbull focus:outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-white/40 uppercase font-black tracking-widest block mb-2">
                            Wochengehalt (€)
                          </label>
                          <input
                            type="number"
                            value={editingPlayer.weeklyWage}
                            onChange={(e) =>
                              setEditingPlayer({
                                ...editingPlayer,
                                weeklyWage: parseInt(e.target.value),
                              })
                            }
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white font-black text-sm focus:border-redbull focus:outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] text-white/40 uppercase font-black tracking-widest block mb-2">
                          Vertragslaufzeit (Monate)
                        </label>
                        <input
                          type="number"
                          value={editingPlayer.contractMonths}
                          onChange={(e) =>
                            setEditingPlayer({
                              ...editingPlayer,
                              contractMonths: parseInt(e.target.value),
                            })
                          }
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white font-black text-sm focus:border-redbull focus:outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="flex gap-4 mt-8">
                      <button
                        onClick={() => setEditingPlayer(null)}
                        className="flex-1 bg-white/5 text-white/40 hover:text-white py-3 rounded-lg font-black uppercase text-xs transition-all border border-white/5 hover:bg-white/10"
                      >
                        Abbrechen
                      </button>
                      <button
                        onClick={() => {
                          setPlayers((prev) =>
                            prev.map((p) =>
                              p.id === editingPlayer.id
                                ? { ...editingPlayer }
                                : p,
                            ),
                          );
                          setEditingPlayer(null);
                          gerdSpeak(
                            `Profil von ${editingPlayer.name} erfolgreich aktualisiert.`,
                            "Trainer-Gerd",
                          );
                        }}
                        className="flex-1 bg-redbull text-white py-3 rounded-lg font-black uppercase text-xs transition-all shadow-[0_0_20px_rgba(226,27,77,0.3)] hover:shadow-[0_0_30px_rgba(226,27,77,0.5)]"
                      >
                        Speichern
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ══ STARK ELITE ARCHIVE (MAPPEN-SYSTEM) ══ */}
            <div className="glass-panel p-5 space-y-4 bg-navy/20 border-neon/10 mt-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Icon name="folder" size={80} />
              </div>
              <div className="flex justify-between items-center mb-2 relative z-10">
                <h4 className="font-black uppercase text-xs text-neon tracking-widest flex items-center gap-2">
                  <Icon name="archive" size={14} /> Stark Elite Archive
                </h4>
                <span className="text-[9px] bg-neon/10 text-neon px-2 py-0.5 rounded font-mono border border-neon/20">
                  SYNCED
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar relative z-10">
                {(!clubArchive.proMatchbook ||
                  clubArchive.proMatchbook.length === 0) &&
                  (!clubArchive.proTrainingbook ||
                    clubArchive.proTrainingbook.length === 0) ? (
                  <div className="text-[10px] text-white/20 italic p-6 text-center border border-dashed border-white/10 rounded-xl bg-black/40">
                    Das Archiv ist derzeit leer. Speichere Taktiken über
                    das Board.
                  </div>
                ) : (
                  [
                    ...(clubArchive.proMatchbook || []),
                    ...(clubArchive.proTrainingbook || []),
                  ]
                    .sort((a, b) =>
                      b.timestamp.localeCompare(a.timestamp),
                    )
                    .map((entry) => (
                      <div
                        key={entry.id}
                        className="group flex flex-col p-3 rounded-xl bg-gradient-to-br from-[#0a0f1a] to-navy border border-white/5 hover:border-neon/40 cursor-pointer transition-all shadow-[0_4px_20px_rgba(0,0,0,0.5)] overflow-hidden relative"
                      >
                        {/* Carbon Fiber Texture Overlay */}
                        <div
                          className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
                          style={{
                            backgroundImage:
                              "repeating-linear-gradient(45deg, #fff 25%, transparent 25%, transparent 75%, #fff 75%, #fff)",
                            backgroundPosition: "0 0, 4px 4px",
                            backgroundSize: "8px 8px",
                          }}
                        ></div>

                        <div className="flex justify-between items-start relative z-10">
                          <div className="flex flex-col min-w-0 pr-2">
                            <span className="text-[12px] font-black text-white uppercase tracking-tight truncate flex items-center gap-2">
                              <Icon
                                name="file-text"
                                size={12}
                                className="text-neon"
                              />{" "}
                              {entry.name}
                            </span>
                            <span className="text-[9px] text-white/40 font-mono mt-1">
                              {new Date(
                                entry.timestamp,
                              ).toLocaleDateString()}{" "}
                              •{" "}
                              {new Date(
                                entry.timestamp,
                              ).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span
                              className={`text-[8px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider whitespace-nowrap ${entry.mode === "match" ? "bg-redbull/20 text-redbull border border-redbull/30" : "bg-neon/20 text-neon border border-neon/30"}`}
                            >
                              {entry.mode === "match"
                                ? "MATCH"
                                : entry.phase
                                  ? `TRN: ${entry.phase}`
                                  : "TRAINING"}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const type =
                                  entry.mode === "match"
                                    ? "proMatchbook"
                                    : "proTrainingbook";
                                setClubArchive((prev) => ({
                                  ...prev,
                                  [type]: prev[type].filter(
                                    (p) => p.id !== entry.id,
                                  ),
                                }));
                              }}
                              className="text-white/20 hover:text-red-400 group-hover:opacity-100 opacity-0 transition-opacity p-1 ml-1"
                            >
                              <Icon name="trash-2" size={12} />
                            </button>
                          </div>
                        </div>

                        {entry.summary && (
                          <div className="mt-3 py-2 border-t border-white/5 relative z-10">
                            <p className="text-[9px] text-white/60 leading-relaxed font-mono italic flex items-start gap-2">
                              <Icon
                                name="bot"
                                size={10}
                                className="text-gold mt-0.5 shrink-0"
                              />
                              <span className="line-clamp-2">
                                {entry.summary}
                              </span>
                            </p>
                          </div>
                        )}

                        <div className="mt-3 flex gap-2 relative z-10">
                          <button
                            onClick={() => loadFromArchive(entry)}
                            className="flex-1 py-1.5 bg-neon/10 border border-neon/20 text-neon hover:bg-neon hover:text-navy rounded text-[9px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                          >
                            <Icon name="download" size={10} /> Load &
                            Optimize
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.print();
                            }}
                            className="px-3 py-1.5 bg-white/5 border border-white/10 text-white/70 hover:bg-white/20 hover:text-white rounded text-[9px] font-black uppercase transition-colors flex items-center justify-center"
                            title="Download/Print PDF"
                          >
                            <Icon name="printer" size={12} />
                          </button>
                        </div>
                      </div>
                    ))
                )}
              </div>
              {isOptimizing && (
                <div className="pt-2 flex items-center justify-center gap-2 text-[10px] text-neon animate-pulse bg-neon/5 py-2 rounded border border-neon/20">
                  <Icon
                    name="loader"
                    size={12}
                    className="animate-spin"
                  />
                  KI-OPTIMIERUNG LÄUFT...
                </div>
              )}
            </div>
          </div>
        </div>
        </div>
      </div>
    );
  };

  const handleRegisterManualPlayer = () => {
    if (!newPlayerData.name) return alert("Bitte Namen eingeben.");
    const newPlayer = {
      id: `m_${Date.now()}`,
      ...newPlayerData,
      photo: null,
      status: "fit",
      inSquad: true,
      inTraining: true,
      readiness: 90,
      sleep: 8.0,
      hrv: 70,
      weight: 78,
      fat: 10,
      muscle: 40,
      rhr: 55,
      load: 0,
      form: 80,
      fitness: 90,
      sharpness: 70,
      stats: { pac: 75, sho: 70, pas: 72, dri: 74, def: 60, phy: 75 },
      weeklyWage: Math.round(newPlayerData.marketValue / 1000),
      contractMonths: 36,
    };

    setPlayers(prev => [...prev, newPlayer]);
    dispatchAction('REGISTER_PLAYER', newPlayer);
    addAiLog(`Manuelle Registrierung: ${newPlayer.name} (${newPlayer.position}) dem Kader hinzugefügt.`, "success");
    gerdSpeak(`Spieler ${newPlayer.name} wurde manuell in das System integriert. Charakter-Profil: ${newPlayer.character}.`, "System");
    setShowNewPlayerForm(false);
    setNewPlayerData({
      name: "",
      position: "MF",
      age: 24,
      marketValue: 1000000,
      character: "Warrior",
      intensity_metrics: { sprint: 85, intensity: 80, resilience: 90 }
    });
  };

  const handleAutoFillSquad = async () => {
    if (!clubIdentity || !clubIdentity.name) {
      gerdSpeak(
        "Bitte zuerst Vereinsdaten in den Einstellungen hinterlegen.",
        "Trainer-Gerd",
      );
      return;
    }
    setIsAutoFilling(true);
    addAiLog(`Hydration Engine: Starte Daten-Ingest für ${clubIdentity.name}...`, "process");

    try {
      // 1. Attempt Proxy Hydration (Real World Data)
      try {
        const proxyRes = await fetch("http://localhost:3001/api/hydrate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clubName: clubIdentity.name,
            apiKey: localStorage.getItem("gerd_epicKey") || "",
            fussballDeUrl: "" // Optional: could be stored in clubIdentity
          }),
        });
        const payload = await proxyRes.json();

        if (payload.ok && payload.players.length > 0) {
          setPlayers(payload.players);
          gerdSpeak(`Daten von ${clubIdentity.name} erfolgreich über die Live-Bridge geladen. ${payload.players.length} reale Spieler identifiziert.`, "System");
          addAiLog(`Hydration success: ${payload.players.length} players from ${payload.source}`, "success");
          setIsAutoFilling(false);
          return;
        }
      } catch (proxyErr) {
        console.warn("Proxy hydration failed, falling back to pure AI generation:", proxyErr);
      }

      // 2. Fallback: Pure AI Generation
      const response = await askAI(
        `Generiere mir ein Array von 15 Spielern für den Verein ${clubIdentity.name}.
          Antworte NUR mit valider JSON (ohne Markdown-Tags, nur das '[' und ']').
          Format-Beispiel: [{"id": 1, "name": "M. Neuer", "position": "TW", "number": 1, "status": "fit", "sleep": 8.0, "hrv": 65, "photo": "https://example.com/photo.jpg", "isInjured": false}]`,
        "strategy",
        true,
      );

      let jsonStr = response.trim();
      if (jsonStr.startsWith("```json")) jsonStr = jsonStr.substring(7);
      if (jsonStr.startsWith("```")) jsonStr = jsonStr.substring(3);
      if (jsonStr.endsWith("```")) jsonStr = jsonStr.substring(0, jsonStr.length - 3);
      jsonStr = jsonStr.trim();

      const newPlayers = JSON.parse(jsonStr);
      const mappedPlayers = newPlayers.slice(0, 15).map((p, i) => ({
        ...p,
        id: i + 1,
        photo: p.photo || null,
        status: p.status || "fit",
        sleep: p.sleep || 8.0,
        hrv: p.hrv || 60,
        stress: p.stress || 30,
        isInjured: p.isInjured || false,
        inTraining: true,
      }));
      setPlayers(mappedPlayers);
      gerdSpeak(`Kader für ${clubIdentity.name} über KI-Simulation generiert.`, "System");
    } catch (e) {
      console.error("Hydration Error:", e);
      addAiLog(`Failed to populate squad.`, "error");
    } finally {
      setIsAutoFilling(false);
    }
  };

  const renderKaderLab = () => {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-black italic tracking-tighter text-neon flex items-center gap-3 uppercase">
            <Icon name="users" size={28} /> Kader Übersicht (Stark Elite)
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {players.map((p) => {
            const isFit = !p.isInjured && p.readiness >= 65;
            return (
              <div
                key={p.id}
                onClick={() => setPlayerEditorId(p.id)}
                className={`group relative p-0 rounded-xl border-2 transition-all cursor-pointer overflow-hidden carbon-fiber hover:scale-105 hover:z-10 ${isFit ? "border-neon/40 shadow-[0_0_15px_rgba(0,243,255,0.2)] hover:border-neon hover:shadow-[0_0_25px_rgba(0,243,255,0.5)]" : "border-redbull/40 shadow-[0_0_15px_rgba(226,27,77,0.2)]"}`}
              >
                {/* RED BULL FIFA CARD LAYOUT */}
                {p.photo && (
                  <div className="absolute inset-0 z-0">
                     <img src={p.photo} alt={p.name} className="w-full h-full object-cover mix-blend-luminosity opacity-40 transition-opacity group-hover:opacity-70" />
                     <div className="absolute inset-0 bg-gradient-to-t from-[#050510] via-[#050510]/80 to-transparent"></div>
                  </div>
                )}
                <div className="flex flex-col h-[280px] uppercase font-black tracking-tighter justify-between relative z-10">
                  <div>
                    <div className="flex justify-between p-3 pb-0">
                      <div className="flex flex-col items-center">
                        <span className={`text-3xl leading-none ${isFit ? "text-white" : "text-redbull"}`}>
                          {p.ovr || 75}
                        </span>
                        <span className="text-[10px] text-white/40 tracking-widest mt-1">
                          {p.position}
                        </span>
                      </div>
                      <div className="flex flex-col items-end">
                         {/* Removed tiny circle photo, image is now the entire background */}
                      </div>
                    </div>
                  </div>
                  
                  <div className="px-4 text-center mt-auto">
                     <div className="text-sm text-white truncate font-black italic tracking-widest leading-none mb-2">
                       {p.name}
                     </div>
                     <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-2"></div>
                     <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[9px] text-white/60 font-mono pb-3">
                         <div className="flex justify-between"><span>PAC</span><span className="text-white">{p.stats?.pac || 50}</span></div>
                         <div className="flex justify-between"><span>DRI</span><span className="text-white">{p.stats?.dri || 50}</span></div>
                         <div className="flex justify-between"><span>SHO</span><span className="text-white">{p.stats?.sho || 50}</span></div>
                         <div className="flex justify-between"><span>DEF</span><span className="text-white">{p.stats?.def || 50}</span></div>
                         <div className="flex justify-between"><span>PAS</span><span className="text-white">{p.stats?.pas || 50}</span></div>
                         <div className="flex justify-between"><span>PHY</span><span className="text-white">{p.stats?.phy || 50}</span></div>
                     </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMedical = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-black italic tracking-tighter text-redbull flex items-center gap-3 uppercase">
          <Icon name="activity" size={28} /> Medical Performance Lab
        </h2>
        <div className="flex gap-4">
          <button
            onClick={() => setShowNewPlayerForm(true)}
            className="px-4 py-2 font-black uppercase text-xs rounded tracking-widest flex items-center gap-2 bg-neon text-navy transition-all hover:bg-white shadow-[0_0_15px_rgba(0,243,255,0.4)]"
          >
            <Icon name="user-plus" size={16} /> Manueller Kader-Editor
          </button>
          <button
            onClick={handleAutoFillSquad}
            disabled={isAutoFilling || !clubIdentity.name}
            className={`px-4 py-2 font-black uppercase text-xs rounded tracking-widest flex items-center gap-2 transition-all ${isAutoFilling ? "bg-white/10 text-white/50 cursor-not-allowed" : clubIdentity.name ? "bg-redbull text-white hover:bg-white hover:text-redbull shadow-[0_0_15px_rgba(226,27,77,0.4)]" : "bg-black text-white/20 border border-white/5 cursor-not-allowed"}`}
            title={
              clubIdentity.name
                ? "Kader via KI importieren"
                : "Bitte zuerst Club in Settings eintragen"
            }
          >
            {isAutoFilling ? (
              <Icon name="loader" className="animate-spin" size={16} />
            ) : (
              <Icon name="users" size={16} />
            )}
            {isAutoFilling ? "Importing..." : "AI Squad Auto-Fill"}
          </button>
          <button
            onClick={handleVoiceCommand}
            className={`px-4 py-2 font-black uppercase text-xs rounded tracking-widest flex items-center gap-2 transition-all shadow-lg ${isRecording && activeTab === "medical" ? "bg-redbull text-white animate-pulse shadow-redbull/50" : "bg-black text-redbull border border-redbull hover:bg-redbull hover:text-white"}`}
          >
            <Icon name={isRecording && activeTab === "medical" ? "square" : "mic"} size={16} />
            {isRecording && activeTab === "medical" ? "Doc hört zu..." : "Doc-Gerd"}
          </button>
        </div>
      </div>

      {showNewPlayerForm && (
        <div className="glass-panel p-8 mb-10 border-neon animate-fade-in relative">
          <button
            onClick={() => setShowNewPlayerForm(false)}
            className="absolute top-4 right-4 text-white/40 hover:text-white"
          >
            <Icon name="x" size={20} />
          </button>
          <h3 className="text-xl font-black italic uppercase text-white mb-6 flex items-center gap-2">
            <Icon name="user-plus" size={18} className="text-neon" /> Neuer Spieler - Manuelles Interface
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-white/40 font-black uppercase tracking-widest block mb-1">Voller Name</label>
                <input
                  type="text"
                  value={newPlayerData.name}
                  onChange={e => setNewPlayerData({ ...newPlayerData, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded p-3 text-white font-black uppercase tracking-widest focus:border-neon outline-none transition-all"
                  placeholder="Z.B. LUKAS BERG"
                />
              </div>
              <div>
                <label className="text-[10px] text-white/40 font-black uppercase tracking-widest block mb-1">Position</label>
                <select
                  value={newPlayerData.position}
                  onChange={e => setNewPlayerData({ ...newPlayerData, position: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded p-3 text-white font-black uppercase tracking-widest focus:border-neon outline-none transition-all"
                >
                  <option value="TW">TW</option>
                  <option value="CB">CB</option>
                  <option value="LB">LB</option>
                  <option value="RB">RB</option>
                  <option value="CDM">CDM</option>
                  <option value="CM">CM</option>
                  <option value="CAM">CAM</option>
                  <option value="LM">LM</option>
                  <option value="RM">RM</option>
                  <option value="LW">LW</option>
                  <option value="RW">RW</option>
                  <option value="ST">ST</option>
                </select>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-white/40 font-black uppercase tracking-widest block mb-1">Alter</label>
                <input
                  type="number"
                  value={newPlayerData.age}
                  onChange={e => setNewPlayerData({ ...newPlayerData, age: parseInt(e.target.value) })}
                  className="w-full bg-white/5 border border-white/10 rounded p-3 text-white font-mono focus:border-neon outline-none transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] text-white/40 font-black uppercase tracking-widest block mb-1">Marktwert (€)</label>
                <input
                  type="number"
                  value={newPlayerData.marketValue}
                  onChange={e => setNewPlayerData({ ...newPlayerData, marketValue: parseInt(e.target.value) })}
                  className="w-full bg-white/5 border border-white/10 rounded p-3 text-white font-mono focus:border-neon outline-none transition-all"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-white/40 font-black uppercase tracking-widest block mb-1">Charakter-Matrix</label>
                <select
                  value={newPlayerData.character}
                  onChange={e => setNewPlayerData({ ...newPlayerData, character: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded p-3 text-white font-black uppercase tracking-widest focus:border-neon outline-none transition-all"
                >
                  <option value="Warrior">Warrior</option>
                  <option value="Technician">Technician</option>
                  <option value="Leader">Leader</option>
                  <option value="Speedster">Speedster</option>
                  <option value="Tank">Tank</option>
                  <option value="Genius">Genius</option>
                </select>
              </div>
              <div className="pt-2">
                <button
                  onClick={handleRegisterManualPlayer}
                  className="w-full py-3 bg-neon text-navy font-black uppercase tracking-widest rounded transition-all hover:-translate-y-1 shadow-[0_0_20px_rgba(0,243,255,0.4)]"
                >
                  Spieler Registrieren
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {players.map((p) => {
          const readiness = calculateReadiness(p.sleep, p.hrv);
          const isDanger = readiness < 65;
          const isInjured = p.status === "injured";
          
          const todayString = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"][new Date().getDay()];
          const trainingLoad = truthObject.training_lab.schedule.find(s => s.day === todayString)?.intensity || 50; 
          const ageFactor = Math.max(0, (p.age || 25) - 28) * 1.5;
          const injuryRisk = Math.min(99, Math.round(((100 - readiness) * 0.4) + (trainingLoad * 0.4) + ageFactor));

          // Calculate pulse speed based on readiness (faster if readiness is low/stress is high)
          // Readiness 100 -> 1.5s, Readiness 0 -> 0.4s
          const pulseSpeed = 0.4 + (readiness / 100) * 1.1;

          return (
            <div
              key={p.id}
              className={`glass-panel p-6 relative overflow-hidden flex flex-col ${isDanger ? "border-redbull/50" : "border-white/10"}`}
            >
              {/* EKG Background Line */}
              <div className="absolute inset-0 z-0 pointer-events-none opacity-20 flex items-center">
                <svg className="w-full h-32" viewBox="0 0 100 20">
                  <path
                    className="ekg-line"
                    d="M0,10 L10,10 L12,2 L15,18 L18,10 L30,10 L32,5 L35,15 L38,10 L50,10 L52,0 L55,20 L58,10 L100,10"
                    fill="none"
                    stroke={isDanger ? "#E21B4D" : "#00f3ff"}
                    strokeWidth="0.5"
                  />
                </svg>
              </div>

              <div className="relative z-10 flex justify-between items-start mb-4">
                <div className="flex gap-4 items-center">
                  <div className="w-16 h-16 rounded-lg bg-white/5 border border-white/10 overflow-hidden flex-shrink-0">
                    {p.photo ? (
                      <img src={p.photo} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/20">
                        <Icon name="user" size={24} />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-black text-xl font-mono uppercase tracking-tighter">
                      {p.name}
                    </h3>
                    <div className="flex gap-1 mt-1">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${p.status === "fit" ? "bg-green-500/20 text-green-400" : p.status === "hit" ? "bg-yellow-500/20 text-yellow-400" : "bg-red-500/20 text-red-400"}`}
                      >
                        {p.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div
                  className="heart-pulsing"
                  style={{ "--pulse-speed": `${pulseSpeed}s` }}
                >
                  <Icon
                    name="heart"
                    size={32}
                    className={isDanger ? "text-red-600" : "text-neon"}
                  />
                </div>
              </div>

              {/* Readiness Bar */}
              <div className="mb-6 relative z-10">
                <div className="flex justify-between text-xs mb-1 font-mono uppercase tracking-widest">
                  <span className="text-white/50">Readiness Score</span>
                  <div className="flex gap-4">
                    <span className="text-white/30 text-[9px] flex items-center gap-1 border border-white/10 px-1 rounded" title="Injury Risk">
                      <Icon name="alert-triangle" size={10} className={injuryRisk > 60 ? "text-redbull" : "text-neon"} /> {injuryRisk}% Risk
                    </span>
                    <span
                      className={`font-black ${isDanger ? "text-redbull text-glow-red" : "text-neon text-glow-neon"}`}
                    >
                      {readiness}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-black/60 h-2 rounded-full overflow-hidden border border-white/10">
                  <div
                    className={`h-full transition-all duration-1000 ${isDanger ? "bg-redbull" : "bg-neon"}`}
                    style={{ width: `${readiness}%` }}
                  ></div>
                </div>
              </div>

              {/* 7-Params Grid */}
              <div className="grid grid-cols-2 gap-3 mb-6 relative z-10 bg-black/40 p-3 rounded-lg border border-white/5">
                {[
                  { label: "Schlaf (h)", key: "sleep", step: 0.5 },
                  { label: "HRV (ms)", key: "hrv", step: 1 },
                  { label: "Gewicht (kg)", key: "weight", step: 0.1 },
                  { label: "Körperfett %", key: "fat", step: 0.1 },
                  { label: "Muskelmasse kg", key: "muscle", step: 0.1 },
                  { label: "Ruhepuls bpm", key: "rhr", step: 1 },
                  { label: "Physical Load", key: "load", step: 1 },
                ].map((param) => (
                  <div key={param.key} className="flex flex-col">
                    <label className="text-[10px] text-white/40 uppercase font-mono">
                      {param.label}
                    </label>
                    <input
                      type="number"
                      step={param.step}
                      className="bg-transparent border-b border-white/10 text-white font-mono text-sm focus:border-neon outline-none py-0.5"
                      value={p[param.key]}
                      onChange={(e) =>
                        updatePlayer(
                          p.id,
                          param.key,
                          Number(e.target.value),
                        )
                      }
                    />
                  </div>
                ))}
              </div>

              {/* Status & Squad Controls */}
              <div className="mt-auto space-y-4 relative z-10 pt-4 border-t border-white/10">
                {/* Readiness Prognosis (AI) */}
                <div className="bg-black/40 p-3 rounded border border-neon/20">
                  <div className="text-[8px] font-black text-neon uppercase mb-2 flex items-center justify-between">
                    <span>7-Day Prognosis</span>
                    <span className="text-white/40">AI Engine</span>
                  </div>
                  <div className="flex items-end gap-1 h-8">
                    {[65, 72, 68, 80, 85, 82, 90].map((v, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-neon/20 rounded-t-sm relative group"
                        style={{ height: `${v}%` }}
                      >
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 bg-navy text-neon text-[7px] px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity mb-1 border border-neon/30">
                          {v}%
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between text-[6px] text-white/20 mt-1 uppercase font-mono">
                    <span>MO</span>
                    <span>DI</span>
                    <span>MI</span>
                    <span>DO</span>
                    <span>FR</span>
                    <span>SA</span>
                    <span>SO</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {["fit", "hit", "injured"].map((st) => (
                    <button
                      key={st}
                      onClick={() => updatePlayer(p.id, "status", st)}
                      className={`flex-1 py-1 rounded text-[10px] font-black uppercase transition-all ${p.status === st ? (st === "fit" ? "bg-green-600" : st === "hit" ? "bg-yellow-600 text-black" : "bg-redbull") : "bg-white/5 text-white/40 hover:bg-white/10"}`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between items-center px-1">
                  <label
                    className={`flex items-center gap-2 cursor-pointer text-[10px] font-black uppercase ${isInjured ? "opacity-30" : "text-white"}`}
                  >
                    <input
                      type="checkbox"
                      disabled={isInjured}
                      checked={p.inSquad}
                      onChange={(e) =>
                        updatePlayer(p.id, "inSquad", e.target.checked)
                      }
                      className="w-3 h-3 accent-neon"
                    />
                    Im Kader
                  </label>
                  <label
                    className={`flex items-center gap-2 cursor-pointer text-[10px] font-black uppercase ${isInjured ? "opacity-30" : "text-white"}`}
                  >
                    <input
                      type="checkbox"
                      disabled={isInjured}
                      checked={p.inTraining}
                      onChange={(e) =>
                        updatePlayer(p.id, "inTraining", e.target.checked)
                      }
                      className="w-3 h-3 accent-neon"
                    />
                    Im Training
                  </label>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // 3. Video Analyse
  const renderVideo = () => (
    <div className="space-y-6 animate-fade-in relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-black italic tracking-tighter flex items-center gap-3 text-white uppercase">
          <Icon name="monitor-play" size={28} /> TINI 2.0 | Video Hub
        </h2>
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2 text-[10px] font-mono text-neon bg-neon/5 px-4 py-2 rounded border border-neon/20">
            <div className="w-1.5 h-1.5 rounded-full bg-neon animate-pulse"></div>
            YT API Connected
          </div>
          <input
            type="text"
            placeholder="Paste YouTube Link..."
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.target.value) {
                try {
                  const urlObj = new URL(e.target.value);
                  let v = urlObj.searchParams.get("v");
                  if (!v && urlObj.hostname === "youtu.be") {
                    v = urlObj.pathname.slice(1);
                  }
                  if (v) {
                    setPlaylist((prev) => [{ id: Date.now(), title: "Gerd Custom Video", isYouTube: true, url: v, analysis: "Custom Video Analysis" }, ...prev]);
                    setActiveClipIndex(0);
                    e.target.value = "";
                  }
                } catch (error) {
                  console.error("Invalid URL");
                }
              }
            }}
            className="bg-black/50 border border-white/20 text-white px-3 py-2 rounded text-xs font-mono w-48 placeholder-white/30 focus:border-neon focus:outline-none focus:ring-1 focus:ring-neon transition-all"
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept="video/*"
          />
          <button
            onClick={() => fileInputRef.current.click()}
            className="bg-white/10 text-white px-4 py-2 rounded font-black text-xs uppercase hover:bg-white/20 transition-all flex items-center gap-2"
          >
            <Icon name="upload" size={14} /> UPLOAD
          </button>
          <button
            onClick={() => setIs3DFlight(!is3DFlight)}
            className={`px-4 py-2 rounded font-black text-xs uppercase transition-all border ${is3DFlight ? "bg-neon text-navy border-neon shadow-[0_0_15px_rgba(0,243,255,0.5)]" : "bg-transparent text-neon border-neon/30 hover:bg-neon/10"}`}
          >
            <Icon name="Zap" size={14} className="mr-2" /> 3D Flight
          </button>
          <button
            onClick={triggerAiTelestrator}
            className="bg-navy text-neon border border-neon px-4 py-2 rounded font-black text-xs uppercase hover:bg-neon hover:text-navy transition-all shadow-[0_0_15px_rgba(0,243,255,0.4)]"
          >
            <Icon name="pen-tool" size={14} className="mr-2" /> AI Telestrator
          </button>
          <button
            onClick={() => {
              setAutoAnalyzeEnabled(!autoAnalyzeEnabled);
              if (!autoAnalyzeEnabled) {
                window.lastAutoAnalyzeTime = playerRef.current ? playerRef.current.getCurrentTime() : 0;
              }
            }}
            className={`px-4 py-2 rounded font-black text-xs uppercase transition-all border ${autoAnalyzeEnabled ? "bg-redbull text-white border-redbull shadow-[0_0_15px_rgba(226,27,77,0.5)]" : "bg-transparent text-redbull border-redbull/30 hover:bg-redbull/10"}`}
          >
            <Icon name="activity" size={14} className="mr-2" /> Auto-Analyse
          </button>
          <button
            onClick={clearDrawings}
            className="bg-redbull/20 text-redbull border border-redbull/50 px-4 py-2 rounded font-black text-xs uppercase hover:bg-redbull hover:text-white transition-all"
          >
            <Icon name="trash-2" size={14} className="mr-2" /> Clear
          </button>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        <div className="flex-[2] space-y-4">
          {/* VIDEO & CANVAS CONTAINER */}
          <div
            className={`relative w-full aspect-video bg-[#050505] rounded-xl border border-white/10 overflow-hidden shadow-2xl video-container-3d ${is3DFlight ? "active-3d" : ""}`}
          >
            {playlist[activeClipIndex].isYouTube ? (
              <div id="youtubepayer-container" className="w-full h-full absolute inset-0 z-0"></div>
            ) : (
              <video
                key={playlist[activeClipIndex].url}
                ref={videoRef}
                src={playlist[activeClipIndex].url}
                className="w-full h-full object-cover"
                loop
                muted
                autoPlay
              />
            )}
            {/* Telestrator Canvas */}
            <canvas
              ref={canvasRef}
              width={1280}
              height={720}
              className="absolute inset-0 w-full h-full z-20 telestrator-canvas"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            />

            {/* Overlay UI */}
            <div className="absolute top-4 left-4 z-30 flex flex-col gap-2">
              {[
                {
                  id: "arrow",
                  icon: "mouse-pointer-2",
                  label: "Passweg",
                },
                { id: "chain", icon: "link", label: "Abstand" },
                { id: "spotlight", icon: "target", label: "Tracking" },
              ].map((tool) => (
                <button
                  key={tool.id}
                  onClick={() =>
                    setActiveVideoTool(
                      activeVideoTool === tool.id ? "none" : tool.id,
                    )
                  }
                  className={`p-3 rounded-lg flex items-center gap-3 font-black text-[10px] uppercase transition-all border ${activeVideoTool === tool.id ? "tool-btn-active border-white" : "bg-black/60 text-white border-white/10 hover:bg-black/80"}`}
                >
                  <Icon name={tool.icon} size={18} /> {tool.label}
                </button>
              ))}
            </div>

            {/* HUD Info */}
            <div className="absolute bottom-4 right-4 z-30 bg-black/60 backdrop-blur px-4 py-2 rounded border border-white/10 font-mono text-[10px] text-neon uppercase tracking-widest">
              TINI 2.0 Telestrator v2.0 |{" "}
              {playlist[activeClipIndex].title}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Playlist & Analysis Feed */}
        <div className="w-full xl:w-96 flex flex-col gap-6 flex-1 xl:flex-none">
          {/* Playlist */}
          <div className="flex flex-col gap-3">
            <h3 className="font-mono text-white/50 uppercase tracking-widest text-[10px] border-b border-white/10 pb-2 mb-2">
              Videomaterial / Sequenzen
            </h3>
            {playlist.map((clip, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setActiveClipIndex(idx);
                  clearDrawings();
                }}
                className={`p-4 rounded border transition-all text-left flex items-center gap-4 ${activeClipIndex === idx ? "bg-navy border-neon shadow-[inset_0_0_15px_rgba(0,243,255,0.2)]" : "glass-panel border-white/5 opacity-60 hover:opacity-100"}`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${activeClipIndex === idx ? "bg-neon text-navy" : "bg-white/10 text-white"}`}
                >
                  <Icon
                    name={
                      activeClipIndex === idx
                        ? clip.isLocal
                          ? "upload"
                          : "pause"
                        : "play"
                    }
                    size={20}
                  />
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-center">
                    <div className="text-[10px] uppercase text-white/40 font-bold">
                      Sequenz 0{idx + 1}
                    </div>
                    {clip.isLocal && (
                      <span className="text-[8px] bg-redbull text-white px-1 rounded">
                        LOCAL
                      </span>
                    )}
                  </div>
                  <div className="font-black text-sm uppercase tracking-tighter truncate">
                    {clip.title}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Analysis Feed */}
          <div className="flex flex-col flex-1 animate-slide-up bg-[#050505] rounded-xl border border-white/10 overflow-hidden shadow-2xl">
            <div className="bg-neon text-navy font-black italic tracking-tighter uppercase px-4 py-3 flex items-center justify-between">
              KI-Analyse Feed{" "}
              <span className="animate-pulse flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-600"></div>{" "}
                LIVE SCAN
              </span>
            </div>
            <div className="p-6 font-mono text-sm text-green-400 flex-1 min-h-[300px]">
              <div className="opacity-40 mb-4 tracking-tighter italic">
                Initializing analysis engine...
              </div>
              {(videoFeedback || "").split("\n").map((line, i) => (
                <div
                  key={i}
                  className="mb-2 leading-relaxed whitespace-pre-wrap"
                >
                  &gt; {line}
                </div>
              ))}
              <div className="mt-4 border-t border-white/5 pt-4 text-[10px] text-white/20 uppercase tracking-widest">
                [System]: Deep Learning Pitch Model v4.1 active
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* DEFAULT TACTICAL MASTERCLASSES */}
      <div className="mt-8 border-t border-white/5 pt-8">
        <h3 className="text-xl font-black italic uppercase tracking-tighter mb-6 flex items-center gap-3">
          <Icon name="award" className="text-yellow-500" /> Tactical
          Masterclasses
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              id: "m1",
              title: "High-Intensity Pressing Dynamics",
              author: "Stark Coaching",
              time: "12:45",
            },
            {
              id: "m2",
              title: "Positional Fluidity in 4-3-3",
              author: "Elite Analysis",
              time: "09:30",
            },
            {
              id: "m3",
              title: "Transition Speed: Defense to Attack",
              author: "Pro Scout Intel",
              time: "15:20",
            },
          ].map((m) => (
            <div
              key={m.id}
              className="glass-panel p-4 border border-white/5 hover:border-neon/30 transition-all cursor-pointer group bg-black/20"
            >
              <div className="aspect-video bg-navy/40 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                <Icon
                  name="play-circle"
                  size={40}
                  className="text-white/20 group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-neon/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-[8px] font-mono text-white/60">
                  {m.time}
                </div>
              </div>
              <h4 className="font-bold text-xs uppercase mb-1 group-hover:text-neon transition-colors truncate">
                {m.title}
              </h4>
              <p className="text-[9px] text-white/40 uppercase font-mono">
                {m.author}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // --- CFO BOARD STATES ---
  const [spectators, setSpectators] = useState(200);
  const [catering, setCatering] = useState([
    { name: "Bratwurst", icon: "🌭", ek: 1.2, vk: 3.5, ratio: 0.4 },
    { name: "Bier (0.5L)", icon: "🍺", ek: 0.9, vk: 3.0, ratio: 0.6 },
    { name: "Softdrinks", icon: "🥤", ek: 0.5, vk: 2.0, ratio: 0.35 },
    { name: "Kaffee", icon: "☕", ek: 0.3, vk: 1.5, ratio: 0.25 },
  ]);
  const [equipPlayers, setEquipPlayers] = useState(18);
  const [equipPrice, setEquipPrice] = useState(35);
  const [equipPrint, setEquipPrint] = useState(12);
  const [equipSearch, setEquipSearch] = useState("");
  const [equipSearchTerm, setEquipSearchTerm] = useState("");
  const [equipLoading, setEquipLoading] = useState(false);
  const [equipResults, setEquipResults] = useState(null);
  const [commScenario, setCommScenario] = useState("sponsor");
  const [commExtra, setCommExtra] = useState("");
  const [commEmail, setCommEmail] = useState("");
  const [commLoading, setCommLoading] = useState(false);

  const cateringProfit = catering.reduce((sum, item) => {
    const qty = Math.round(spectators * item.ratio);
    return sum + qty * (item.vk - item.ek);
  }, 0);

  const handleEquipSearch = () => {
    if (!equipSearch.trim()) return;
    setEquipSearchTerm(equipSearch);
    setEquipLoading(true);
    setEquipResults(null);
    setTimeout(() => {
      setEquipLoading(false);
      setEquipResults([
        {
          shop: "11teamsports",
          tag: "Bester Preis",
          price: (equipPlayers * equipPrice * 0.88).toFixed(2),
          badge: "text-neon border-neon",
        },
        {
          shop: "Geomix",
          tag: "Schnellste Lieferung",
          price: (equipPlayers * equipPrice * 0.93).toFixed(2),
          badge: "text-yellow-400 border-yellow-400",
        },
        {
          shop: "Teamsportbedarf",
          tag: "Premium Flock/Druck",
          price: (
            equipPlayers *
            (equipPrice + equipPrint) *
            0.97
          ).toFixed(2),
          badge: "text-gold border-gold",
        },
      ]);
    }, 1600);
  };

  const emailTemplates = {
    sponsor: (extra) =>
      `Betreff: Partnerschaftsanfrage – ${extra || "Unser Verein"} & [Vereinsname]\n\nSehr geehrte Damen und Herren,\n\nmein Name ist Manager Gerd, Vereinsvorsitzender und Trainer beim [Vereinsname]. Wir sind ein aufstrebender Amateurverein mit über [X] aktiven Mitgliedern und einer starken Verwurzelung in der Gemeinschaft.\n\nWir suchen engagierte lokale Partner, die gemeinsam mit uns wachsen möchten. Als Gegenleistung für Ihre Unterstützung bieten wir Ihnen prominente Logoplacierungen auf unseren Trikots, Bannerwerbung am Spielfeld sowie Erwähnungen in unseren Social-Media-Kanälen.\n\nIch würde mich über ein kurzes Gespräch freuen, um die Möglichkeiten einer Zusammenarbeit zu besprechen.\n\nMit sportlichen Grüßen,\nManager Gerd\n[Vereinsname], Vorsitzender`,
    cancel: (extra) =>
      `Betreff: Spielabsage – [Liga/Pokal], [Datum], [Heimverein] vs. [Gastverein]\n\nSehr geehrte Damen und Herren,\n\nhiermit müssen wir Ihnen leider mitteilen, dass das für [Datum] angesetzte Spiel zwischen [Heimverein] und [Gastverein] aufgrund von ${extra || "Platzsperrung durch unzureichende Witterungsverhältnisse"} abgesagt werden muss.\n\nWir bedauern diese Entscheidung außerordentlich und haben alle zuständigen Stellen bereits informiert. Einen neuen Termin werden wir in Abstimmung mit dem Verband schnellstmöglich kommunizieren.\n\nFür Rückfragen stehe ich Ihnen jederzeit zur Verfügung.\n\nMit freundlichen Grüßen,\nManager Gerd\n[Vereinsname]`,
    tournament: (extra) =>
      `Betreff: Einladung zum [Vereinsname]-Turnier ${new Date().getFullYear()}\n\nLiebe Sportfreundinnen und Sportfreunde,\n\nwir freuen uns, Sie herzlich zu unserem diesjährigen Turnier einzuladen!\n\n📅 Datum: ${extra || "[Datum einsetzen]"}\n📍 Ort: [Sportanlage, Adresse]\n⚽ Modus: [K.O.-Runde / Gruppenphase + K.O.]\n👥 Teilnehmer: max. [X] Mannschaften\n\nFür die teilnehmenden Teams übernehmen wir Verpflegung sowie kleine Preise für die Platzierten. Die Anmeldung ist bis zum [Anmeldeschluss] möglich.\n\nWir würden uns über Ihre Zusage sehr freuen!\n\nIn sportlicher Verbundenheit,\nManager Gerd\n[Vereinsname]`,
  };

  const handleGenerateEmail = async () => {
    setCommLoading(true);
    setCommEmail("");
    const scenarioText =
      commScenario === "sponsor"
        ? "Sponsoren-Anfrage (lokales Gewerbe)"
        : commScenario === "cancel"
          ? "Spielabsage (Wetter/Platz)"
          : "Turniereinladung";

    const prompt = `Du bist Manager Gerd, der erfahrene und rhetorisch gewandte Sportdirektor des Vereins 'Stark Elite'.
          Erstelle eine hochprofessionelle, formelle E-Mail zum Thema: ${scenarioText}.
          Zusätzlicher Kontext: ${commExtra}.

          Anforderungen:
          - Ton: Geschäftlich, respektvoll, souverän, aber modern.
          - Struktur: Betreffzeile, förmliche Anrede, strukturierter Hauptteil, überzeugender Schluss, professionelle Grußformel.
          - Ziel: Maximale Überzeugungskraft und Professionalität.

          Antworte NUR mit dem fertigen E-Mail-Text, ohne weitere Einleitung.`;

    const response = await askAI(prompt, "Manager-Gerd");
    setCommEmail(response);
    setCommLoading(false);
    gerdSpeak(
      "Der KI-Entwurf für die Korrespondenz ist fertiggestellt und kann nun in die Zwischenablage kopiert werden.",
      "Manager-Gerd",
    );
  };

  // 4. CFO
  const renderCFO = () => {
    const cfoTabs = [
      { id: "finance", label: "Executive Board", icon: "trending-up" },
      { id: "scouting", label: "Scouting Intelligence", icon: "target" },
      { id: "sourcing", label: "Smart Sourcing", icon: "shopping-bag" },
      { id: "commercial", label: "Commercial & Ads", icon: "award" },
      { id: "communication", label: "Legal & Audit", icon: "shield" },
    ];

    return (
      <div className="space-y-6 animate-fade-in pb-20">
        {/* Header Area */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div>
            <h2 className="text-4xl font-black italic tracking-tighter text-white flex items-center gap-3 uppercase">
              <span className="text-gold">CFO 2.0</span> / ELITE
              INTELLIGENCE
            </h2>
            <p className="text-white/40 font-mono text-[10px] uppercase tracking-[0.3em] mt-1">
              Strategic Corporate & Financial Control — Stark Elite v4.0
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <button
               onClick={handleVoiceCommand}
               className={`h-full px-4 py-2 font-black uppercase text-xs rounded-lg tracking-widest flex items-center gap-2 transition-all shadow-lg ${isRecording && activeTab === "cfo" ? "bg-gold text-navy animate-pulse shadow-gold/50" : "bg-black text-gold border border-gold hover:bg-gold hover:text-navy"}`}
               >
               <Icon name={isRecording && activeTab === "cfo" ? "square" : "mic"} size={16} />
               {isRecording && activeTab === "cfo" ? "CFO hört zu..." : "Finance-Gerd"}
            </button>
            <div className="bg-black/40 border border-gold/20 px-4 py-2 rounded-lg text-right">
              <div className="text-[8px] text-gold/60 font-black uppercase tracking-widest">
                Liquidität (Edit)
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white text-xs font-mono">€</span>
                <input
                  type="number"
                  value={truthObject.financials.current_budget}
                  onChange={(e) => dispatchAction('UPDATE_FINANCIALS', { path: 'current_budget', value: Number(e.target.value) })}
                  className="bg-transparent text-xl font-mono font-black text-white w-32 outline-none focus:text-gold transition-colors text-right"
                />
                <span className="text-white/40 text-[10px]">IST</span>
              </div>
            </div>
          </div>
        </div>

        {/* High-Tech Tab Nav */}
        <div className="flex gap-2 p-1 bg-black/40 border border-white/10 rounded-xl w-fit overflow-x-auto max-w-full no-scrollbar">
          {cfoTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCfoTab(tab.id)}
              className={`px-6 py-3 rounded-lg font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all shrink-0 ${cfoTab === tab.id ? "bg-gold text-black shadow-[0_0_20px_rgba(212,175,55,0.4)]" : "text-white/40 hover:text-white hover:bg-white/5"}`}
            >
              <Icon name={tab.icon} size={14} /> {tab.label}
            </button>
          ))}
        </div>

        {/* === EXECUTIVE DASHBOARD === */}
        {/* === EXECUTIVE CFO COCKPIT (REDESIGN) === */}
        {cfoTab === "finance" && (
          <div className="space-y-8">

            {/* 1. SZENARIO SIMULATOR & GROWTH PROJECTION (PRO) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-navy/30 backdrop-blur-2xl border border-white/10 p-8 rounded-3xl relative overflow-hidden shadow-[0_0_50px_rgba(0,18,64,0.8)] group hover:border-redbull/30 transition-all energy-glow-red">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
                  <div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-widest flex items-center gap-3">
                      <Icon name="activity" size={24} className="text-redbull" /> Markt-Dominanz Simulator
                    </h3>
                    <p className="text-white/40 font-mono text-[10px] mt-2 uppercase tracking-[0.2em]">
                      Aggressive Budget-Projektion & ROI Szenarien
                    </p>
                  </div>
                  <div className="flex gap-2 bg-black/50 p-1.5 rounded-lg border border-white/5">
                    {["Aggressiv", "Power-Growth", "Stabil"].map((scen) => (
                      <button
                        key={scen}
                        onClick={() => setCfoScenario(scen)}
                        className={`px-4 py-2 rounded-md font-black uppercase text-[10px] tracking-widest transition-all ${cfoScenario === scen
                          ? "bg-redbull/20 text-redbull shadow-[0_0_15px_rgba(226,27,77,0.3)] border border-redbull/50"
                          : "text-white/30 hover:text-white"
                          }`}
                      >
                        {scen}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-64 w-full relative border-b border-l border-white/10 pl-2 pb-2">
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 py-2">
                    <div className="w-full h-px bg-white/20"></div>
                    <div className="w-full h-px bg-white/20"></div>
                    <div className="w-full h-px bg-white/20"></div>
                  </div>
                  <svg viewBox="0 0 1000 300" className="w-full h-full overflow-visible drop-shadow-[0_0_15px_rgba(226,27,77,0.4)] transition-all duration-700">
                    <path
                      d={
                        cfoScenario === "Aggressiv"
                          ? "M0,280 C100,250 250,150 500,80 C750,20 900,-50 1000,-100 L1000,300 L0,300 Z"
                          : cfoScenario === "Power-Growth"
                            ? "M0,280 C200,260 400,200 600,100 C800,20 900,10 1000,0 L1000,300 L0,300 Z"
                            : "M0,280 C200,270 400,250 600,230 C850,210 950,200 1000,195 L1000,300 L0,300 Z"
                      }
                      fill="url(#redbull-gradient)"
                      opacity="0.6"
                    />
                    <path
                      d={
                        cfoScenario === "Aggressiv"
                          ? "M0,280 C100,250 250,150 500,80 C750,20 900,-50 1000,-100"
                          : cfoScenario === "Power-Growth"
                            ? "M0,280 C200,260 400,200 600,100 C800,20 900,10 1000,0"
                            : "M0,280 C200,270 400,250 600,230 C850,210 950,200 1000,195"
                      }
                      fill="none"
                      stroke="#e21b4d"
                      strokeWidth="4"
                      className="animate-pulse"
                    />
                    <defs>
                      <linearGradient id="redbull-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#e21b4d" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute -bottom-6 left-0 w-full flex justify-between px-2 text-[9px] font-mono text-white/40 uppercase">
                    <span>Year 1</span><span>Year 2</span><span>Year 3</span><span>Year 4</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
                  <div className="bg-black/40 p-4 border border-white/5 rounded-xl">
                    <div className="text-[9px] uppercase tracking-widest text-white/40 font-black">Liquidität (€)</div>
                    <input
                      type="number"
                      value={truthObject.financials.current_budget}
                      onChange={(e) => dispatchAction('UPDATE_FINANCIALS', { path: 'current_budget', value: Number(e.target.value) })}
                      className="bg-transparent text-xl font-black mt-1 text-redbull w-full outline-none"
                    />
                  </div>
                  <div className="bg-black/40 p-4 border border-white/5 rounded-xl">
                    <div className="text-[9px] uppercase tracking-widest text-white/40 font-black">Growth ROI</div>
                    <div className="text-xl font-black mt-1 text-white">
                      +{cfoScenario === "Aggressiv" ? "450" : cfoScenario === "Power-Growth" ? "220" : "85"} %
                    </div>
                  </div>
                  <div className="bg-black/40 p-4 border border-white/5 rounded-xl">
                    <div className="text-[9px] uppercase tracking-widest text-white/40 font-black">Sponsoring-Revenue</div>
                    <div className="flex items-center gap-2">
                      <span className="text-white/40 font-mono text-xs">€</span>
                      <input
                        type="number"
                        value={truthObject.financials.revenue.sponsoring}
                        onChange={(e) => dispatchAction('UPDATE_FINANCIALS', { path: 'revenue.sponsoring', value: Number(e.target.value) })}
                        className="bg-transparent text-xl text-white font-black mt-1 w-full outline-none"
                      />
                    </div>
                  </div>
                  <div className="bg-black/40 p-4 border border-white/5 rounded-xl">
                    <div className="text-[9px] uppercase tracking-widest text-white/40 font-black">Net-Expansion</div>
                    <div className="text-xl text-white font-black mt-1">
                      € {(truthObject.financials.current_budget * (cfoScenario === "Aggressiv" ? 5 : 2) / 1000000).toFixed(1)}M
                    </div>
                  </div>
                </div>
              </div>

              {/* GROWTH ADVISOR (RED BULL DNA) */}
              <div className="bg-black/60 border border-white/10 p-8 rounded-3xl relative overflow-hidden group hover:border-gold transition-all">
                <div className="absolute -top-10 -right-10 opacity-5 rotate-12"><Icon name="rocket" size={200} /></div>
                <h4 className="text-xs font-black text-gold uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <Icon name="zap" size={14} /> Neural-Growth Advisor
                </h4>
                <div className="space-y-6">
                  <div className="p-4 bg-white/5 rounded-xl border-l-4 border-redbull">
                    <div className="text-[9px] font-black uppercase text-redbull mb-1">Strategic Move:</div>
                    <p className="text-[11px] font-mono text-white/80 leading-relaxed italic">
                      "Das aktuelle Budget ist zu passiv. Empfehlung: Investition in High-Performance NLZ um Sponsoring-ROI um 30% zu hebeln."
                    </p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl border-l-4 border-gold">
                    <div className="text-[9px] font-black uppercase text-gold mb-1">Risk Assessment:</div>
                    <p className="text-[11px] font-mono text-white/80 leading-relaxed">
                      Das {cfoScenario}-Szenario korreliert mit einer 85%igen Erfolgswahrscheinlichkeit bei aggressiver Talent-Akquise.
                    </p>
                  </div>
                  <button
                    onClick={() => gerdSpeak("Strategisches Investment eingeleitet. Liquidität wird in Performance-Assets gewandelt.", "CFO")}
                    className="w-full py-3 bg-redbull text-white rounded-lg font-black uppercase text-[10px] tracking-widest shadow-[0_0_20px_rgba(226,27,77,0.4)] hover:bg-white hover:text-black transition-all"
                  >
                    Scenario ausführen
                  </button>
                </div>
              </div>
            </div>

            {/* BOTTOM HALF GRID: Gehalts-Pyramide & KI-Berater */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

              {/* 2. GEHALTS-PYRAMIDE */}
              <div className="bg-navy/30 backdrop-blur-md border border-white/10 p-8 rounded-3xl relative overflow-hidden shadow-[0_0_30px_rgba(0,18,64,0.8)]">
                <h3 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3 mb-6">
                  <Icon name="bar-chart-2" size={20} className="text-cyan-400" /> Gehalts-Pyramide (Projektion)
                </h3>

                {/* Visual Pyramid (Dynamic Bars) */}
                <div className="space-y-4 mb-8">
                  {(() => {
                    const totalValue = players.reduce((acc, p) => acc + (p.marketValue || 0), 0) || 1;
                    const sorted = [...players].sort((a, b) => (b.marketValue || 0) - (a.marketValue || 0));
                    const top3 = sorted.slice(0, 3).reduce((acc, p) => acc + (p.marketValue || 0), 0);
                    const starters = sorted.slice(3, 14).reduce((acc, p) => acc + (p.marketValue || 0), 0);
                    const rest = sorted.slice(14).reduce((acc, p) => acc + (p.marketValue || 0), 0);

                    return (
                      <>
                        {/* Top Verdiener */}
                        <div>
                          <div className="flex justify-between text-[10px] font-black uppercase text-white/60 mb-1">
                            <span>Top-Verdiener (3 Spieler)</span>
                            <span className="text-cyan-400">{((top3 / totalValue) * 100).toFixed(0)}%</span>
                          </div>
                          <div className="w-full h-8 bg-black border border-white/10 rounded-full overflow-hidden relative">
                            <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.5)] transition-all duration-1000" style={{ width: `${(top3 / totalValue) * 100}%` }}></div>
                          </div>
                        </div>

                        {/* Stamm */}
                        <div>
                          <div className="flex justify-between text-[10px] font-black uppercase text-white/60 mb-1">
                            <span>Stammspieler ({players.length > 14 ? 11 : Math.max(0, players.length - 3)} Spieler)</span>
                            <span className="text-gold">{((starters / totalValue) * 100).toFixed(0)}%</span>
                          </div>
                          <div className="w-full h-8 bg-black border border-white/10 rounded-full overflow-hidden relative">
                            <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-600 to-gold rounded-full transition-all duration-1000" style={{ width: `${(starters / totalValue) * 100}%` }}></div>
                          </div>
                        </div>

                        {/* Talente */}
                        <div>
                          <div className="flex justify-between text-[10px] font-black uppercase text-white/60 mb-1">
                            <span>Talente / Squad ({Math.max(0, players.length - 14)} Spieler)</span>
                            <span className="text-green-400">{((rest / totalValue) * 100).toFixed(0)}%</span>
                          </div>
                          <div className="w-full h-8 bg-black border border-white/10 rounded-full overflow-hidden relative">
                            <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full transition-all duration-1000" style={{ width: `${(rest / totalValue) * 100}%` }}></div>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* AI Risk Rating Panel */}
                <div className="bg-black/60 border border-white/5 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="text-[10px] uppercase font-black tracking-widest text-white/40">Finanz-Risk-Rating</div>
                    <div className="text-xs font-mono text-white/80 mt-1">Stabile Belastung. Top-Tier Quote {players.length > 20 ? 'balanciert' : 'erhöht'}.</div>
                  </div>
                  <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center bg-green-500/10 shadow-[0_0_15px_rgba(34,197,94,0.3)] ${players.length > 20 ? 'border-green-500 text-green-500' : 'border-gold text-gold'}`}>
                    <span className="font-black">{players.length > 20 ? 'A-' : 'B+'}</span>
                  </div>
                </div>
              </div>

              {/* 3. KI-FINANZ-BERATER */}
              <div className="bg-navy/30 backdrop-blur-md border border-white/10 p-8 rounded-3xl relative flex flex-col shadow-[0_0_30px_rgba(0,18,64,0.8)]">
                <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                  <Icon name="cpu" size={100} />
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3 mb-6">
                  <Icon name="message-square" size={20} className="text-neon" /> KI-Finanz-Berater
                </h3>

                {/* Readout Area */}
                <div className="flex-1 bg-black/60 border border-white/5 rounded-2xl p-6 mb-4 overflow-y-auto custom-scrollbar font-mono text-xs text-white/80 leading-relaxed shadow-inner">
                  {cfoAiWarning ? (
                    <div className="animate-fade-in whitespace-pre-wrap">
                      <span className="text-neon block mb-2">{">"} System-Response:</span>
                      {cfoAiWarning}
                    </div>
                  ) : (
                    <div className="opacity-40 animate-pulse flex flex-col items-center justify-center h-full">
                      <Icon name="shield-alert" size={32} className="mb-2" />
                      <span>Berater aktiv. Warte auf Parameter-Analyse...</span>
                      <span className="block mt-4 text-[9px] text-red-400 border border-red-400/30 bg-red-400/10 px-2 py-1 rounded">
                        Proaktive Warnung: Liquiditätsengpass in Q3 möglich, falls Szenario 'Abstieg' eintritt.
                      </span>
                    </div>
                  )}
                </div>

                {/* Input Area */}
                <div className="flex gap-2 relative z-10">
                  <input
                    type="text"
                    placeholder="Z.B. 'Simuliere Gehaltskosten bei Abgang Spieler X'"
                    className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-xs focus:outline-none focus:border-neon transition-colors placeholder:text-white/20"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.target.value) {
                        setCfoAiWarning("Analyziere Portfolio... \n\nEin Abgang von Spieler X würde €2.4M Budget freimachen, senkt aber die offensive Expected Goals (xG) Projektion um 12%. Re-Investition in Talent Sektor A empfohlen.");
                        e.target.value = "";
                      }
                    }}
                  />
                  <button
                    className="bg-neon text-black px-4 rounded-xl hover:bg-white transition-colors"
                    onClick={(e) => {
                      const input = e.target.previousElementSibling;
                      if (input.value) {
                        setCfoAiWarning("Analyziere Portfolio... \n\nEin Abgang von Spieler X würde €2.4M Budget freimachen, senkt aber die offensive Expected Goals (xG) Projektion um 12%. Re-Investition in Talent Sektor A empfohlen.");
                        input.value = "";
                      }
                    }}
                  >
                    <Icon name="send" size={16} />
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* === SHADOW-SCOUTING ENGINE (REDESIGN) === */}
        {cfoTab === "scouting" && (
          <div className="space-y-6 animate-fade-in">
            {/* 1. Sub-Navigation */}
            <div className="flex gap-4 border-b border-white/10 pb-4">
              {[
                { id: "dashboard", label: "Shadow-Roster & Simulator", icon: "crosshair" },
                { id: "import", label: "VDV / Profile Import", icon: "download-cloud" },
                { id: "negotiation", label: "Decision-Room", icon: "briefcase" }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setScoutView(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 font-black uppercase text-[10px] tracking-widest transition-all rounded-md ${scoutView === tab.id ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.3)]" : "text-white/40 hover:text-white hover:bg-white/5"}`}
                >
                  <Icon name={tab.icon} size={14} /> {tab.label}
                </button>
              ))}
            </div>

            {/* VIEW 1: DASHBOARD / SHADOW ROSTER */}
            {scoutView === "dashboard" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* LEFT: ROSTER LIST */}
                <div className="lg:col-span-8 bg-black/60 border border-cyan-500/20 p-6 rounded-3xl relative overflow-hidden group hover:border-cyan-500/50 transition-colors shadow-[0_0_30px_rgba(0,0,0,0.8)]">
                  <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none"><Icon name="users" size={120} /></div>
                  <h3 className="text-lg font-black text-cyan-400 uppercase tracking-widest mb-6 flex items-center gap-3">
                    <Icon name="crosshair" size={18} /> Position: Zentrales Mittelfeld (6er/8er)
                  </h3>

                  <div className="space-y-4 relative z-10">
                    {scoutingPool.map((candidate) => (
                      <div
                        key={candidate.id}
                        draggable
                        onDragStart={(e) => { setDraggedPlayer(candidate); }}
                        onClick={() => {
                          setSelectedScoutTarget(candidate.id);
                          handleScoutAdvisor({ name: candidate.name, stats: `${candidate.position} • ${candidate.age} J. • €${(candidate.marketValue / 1e6).toFixed(1)}M` });
                        }}
                        className={`bg-navy/40 border p-4 rounded-xl flex justify-between items-center cursor-move transition-all ${selectedScoutTarget === candidate.id ? "border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)] bg-cyan-900/40" : "border-white/10 hover:border-white/30"}`}
                      >
                        <div className="flex gap-6 items-center w-full">
                          {/* Mini Radar Chart */}
                          <div className="w-16 h-16 relative">
                            <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                              <polygon points="50,10 90,30 90,70 50,90 10,70 10,30" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                              <polygon points="50,20 80,40 80,60 50,80 20,60 20,40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                              <polygon points="50,30 70,45 70,55 50,70 30,55 30,45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

                              <polygon points="50,15 75,35 85,65 50,85 35,55 25,35" fill="rgba(34,211,238,0.4)" stroke="#22d3ee" strokeWidth="2" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-black text-white text-base">{candidate.name}</div>
                                <div className="text-[10px] text-white/50 uppercase font-mono mt-1">{candidate.club} • {candidate.age} J. • €{(candidate.marketValue / 1e6).toFixed(1)}M</div>
                              </div>
                              <div className="bg-cyan-500/10 text-cyan-400 font-black tracking-widest text-[9px] uppercase px-2 py-1 rounded border border-cyan-500/30">
                                Match {candidate.match}%
                              </div>
                            </div>
                            <div className="flex gap-3 mt-3">
                              {Object.entries(candidate.stats).slice(0, 3).map(([key, val]) => (
                                <span key={key} className="text-[9px] bg-black border border-white/10 px-2 py-1 rounded text-white/60 uppercase">{key} {val}</span>
                              ))}
                              <span className="text-[9px] bg-black border border-white/10 px-2 py-1 rounded text-gold/80 flex items-center gap-1"><Icon name="star" size={8} /> POTENTIAL</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {scoutingPool.length === 0 && (
                      <div className="py-20 text-center opacity-20 font-mono text-xs uppercase tracking-widest">
                        Keine Schatten-Kandidaten aktuell verfügbar.
                      </div>
                    )}
                  </div>

                  {/* AI ADVISOR SUMMARY (NEW) */}
                  {selectedScoutTarget && (
                    <div className="mt-6 bg-[#0a0f1d] border border-cyan-500/30 rounded-2xl p-6 animate-slide-up">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center text-navy">
                            <Icon name="brain" size={16} />
                          </div>
                          <h4 className="text-xs font-black text-cyan-400 uppercase tracking-widest">AI Sports Director Analyse</h4>
                        </div>
                        {/* Sign Button in Dashboard Quick View */}
                        <button
                          onClick={() => {
                            const p = scoutingPool.find(x => x.id === selectedScoutTarget);
                            if (p) handleSignPlayer(p);
                          }}
                          className="bg-gold text-black px-4 py-1.5 rounded-lg font-black text-[9px] uppercase tracking-widest hover:scale-105 transition-transform shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                        >
                          Sofort Verpflichten
                        </button>
                      </div>

                      {isScoutAdvisorLoading ? (
                        <div className="flex items-center gap-3 text-white/40 font-mono text-[10px] py-4">
                          <Icon name="loader" size={14} className="animate-spin text-cyan-400" />
                          Aggregiere CFO & Taktik-Daten für Executive Summary...
                        </div>
                      ) : (
                        <div className="text-[11px] text-white/80 font-mono leading-relaxed bg-black/40 p-4 rounded border border-white/5 whitespace-pre-wrap">
                          {scoutAdvisorOutput}
                        </div>
                      )}

                      <div className="grid grid-cols-3 gap-3 mt-6">
                        {[
                          { label: "Risiko-Investment", color: "redbull" },
                          { label: "Organische Lösung", color: "neon" },
                          { label: "Shadow-Transfer", color: "gold" }
                        ].map((opt, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              gerdSpeak(`Berechne Szenario ${opt.label}...`, "System");
                              handleScoutAdvisor({ name: selectedScoutTarget === 1 ? "M. TargetA" : "J. TargetB", stats: `Szenario: ${opt.label}` });
                            }}
                            className={`bg-${opt.color}/10 border border-${opt.color}/30 text-${opt.color} py-2 rounded text-[9px] font-black uppercase tracking-widest hover:bg-${opt.color}/20 transition-all`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* RIGHT: AI TRANSFER SIMULATOR (DROP ZONE) */}
                <div className="lg:col-span-4 bg-[#0a0f1d] border border-gold/20 p-6 rounded-3xl relative flex flex-col items-center justify-center shadow-[0_0_40px_rgba(212,175,55,0.1)]">
                  <div className="w-full h-full border-2 border-dashed border-gold/30 rounded-2xl p-6 flex flex-col items-center text-center justify-center group"
                    onDragOver={(e) => { e.preventDefault(); }}
                    onDrop={(e) => {
                      e.preventDefault();
                      gerdSpeak("Transfer-Simulation aktiviert. xG-Potential steigt um 12 Prozent, Gehaltsbudget sinkt signifikant.", "System");
                      setDraggedPlayer("simulated");
                    }}
                  >
                    {draggedPlayer === "simulated" ? (
                      <div className="animate-fade-in w-full text-left">
                        <h4 className="font-black text-gold uppercase tracking-widest text-xs mb-4 flex items-center justify-center gap-2"><Icon name="check-circle" size={14} /> Simulation Erfolgreich</h4>

                        <div className="space-y-4 font-mono text-[10px] text-white/80">
                          <div className="bg-black/60 p-3 rounded border border-white/5">
                            <span className="uppercase text-white/40 block mb-1">CFO Impact (Gehaltsgefüge)</span>
                            <span className="text-red-400 font-black">+ €1.4M / Jahr</span> (Einstufung: Top-Verdiener)
                          </div>
                          <div className="bg-black/60 p-3 rounded border border-white/5">
                            <span className="uppercase text-white/40 block mb-1">Taktischer Impact (Team-xG)</span>
                            <span className="text-neon font-black">+ 15% Projektion</span> (Verbesserte Ballprogression)
                          </div>
                          <div className="bg-black/60 p-3 rounded border border-white/5">
                            <span className="uppercase text-white/40 block mb-1">Kader-Struktur</span>
                            Durchschnittsalter sinkt um <span className="text-cyan-400 font-black">0.4 Jahre</span>.
                          </div>
                        </div>

                        <button onClick={() => setDraggedPlayer(null)} className="w-full mt-6 bg-gold/10 hover:bg-gold/20 border border-gold/30 text-gold text-[9px] uppercase font-black py-2 rounded transition-colors">Simulation Reset</button>
                      </div>
                    ) : (
                      <>
                        <div className="w-20 h-20 rounded-full bg-gold/10 border-2 border-gold/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(212,175,55,0.2)]">
                          <Icon name="download" size={32} className="text-gold" />
                        </div>
                        <h4 className="font-black text-white text-sm uppercase tracking-widest mb-1">AI-Transfer Simulator</h4>
                        <p className="text-[10px] text-white/40 uppercase font-mono tracking-widest leading-relaxed">Spielerprofil hierher ziehen, um Kader-Auswirkungen zu berechnen</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 2: VDV IMPORT */}
            {scoutView === "import" && (
              <div className="bg-[#050a14] border border-cyan-500/20 p-8 rounded-3xl min-h-[500px] flex flex-col gap-8">
                {/* Search Header */}
                <div className="w-full bg-black/60 border border-white/10 p-8 rounded-2xl relative shadow-2xl overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10"><Icon name="search" size={64} /></div>
                  <h3 className="font-black text-xl uppercase tracking-widest text-cyan-400 mb-2">Shadow-Scouting: Globaler Markt-Crawl</h3>
                  <p className="text-[10px] text-white/40 font-mono uppercase tracking-[0.2em] mb-8">Deep Search via Stark Intelligence Bridge (Transfermarkt & Google Search Logic)</p>

                  <div className="flex gap-4">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={scoutSearchQuery}
                        onChange={(e) => setScoutSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleScoutSearch()}
                        placeholder="Spielername, Position oder Verein eingeben..."
                        className="w-full bg-navy/60 border border-white/10 rounded-xl px-6 py-4 text-white font-black uppercase tracking-widest placeholder:text-white/20 outline-none focus:border-cyan-500 transition-all shadow-inner"
                      />
                      {isScoutingLoading && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                          <Icon name="loader" size={20} className="animate-spin text-cyan-500" />
                        </div>
                      )}
                    </div>
                    <button
                      onClick={handleScoutSearch}
                      disabled={isScoutingLoading || !scoutSearchQuery}
                      className="bg-cyan-500 text-navy px-8 py-4 rounded-xl font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] disabled:opacity-50 disabled:scale-100"
                    >
                      CRAWL START
                    </button>
                  </div>
                </div>

                {/* Import Results */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {scoutSearchResults.map((match, idx) => (
                    <div
                      key={idx}
                      className="bg-navy/40 border border-white/10 p-6 rounded-2xl hover:border-cyan-500/50 transition-all group relative overflow-hidden flex flex-col justify-between"
                    >
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Icon name="user-plus" size={48} /></div>

                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <div className="bg-cyan-500/10 text-cyan-400 text-[10px] font-black px-2 py-0.5 rounded border border-cyan-500/30">MATCH DETECTED</div>
                          <div className="text-[10px] text-white/40 font-mono">{match.nationality}</div>
                        </div>

                        <h4 className="text-xl font-black text-white uppercase tracking-tighter mb-1">{match.name}</h4>
                        <div className="text-[10px] text-cyan-400/60 font-mono uppercase mb-4">{match.club} • {match.age} Jahre</div>

                        <div className="grid grid-cols-3 gap-2 mb-6">
                          {Object.entries(match.stats || {}).slice(0, 3).map(([key, val]) => (
                            <div key={key} className="bg-black/40 p-2 rounded border border-white/5 text-center">
                              <div className="text-white font-black text-sm">{val}</div>
                              <div className="text-[8px] text-white/30 uppercase">{key}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          const newPlayer = { ...match, id: `scout_${Date.now()}_${idx}`, match: 85 + Math.floor(Math.random() * 10) };
                          setScoutingPool(prev => [...prev, newPlayer]);
                          dispatchAction('ADD_SCOUT_TARGET', newPlayer);
                          gerdSpeak(`${match.name} wurde in den Shadow-Scouting Pool aufgenommen.`, "System");
                          // Filter out the one just added for UI feedback
                          setScoutSearchResults(prev => prev.filter((_, i) => i !== idx));
                        }}
                        className="w-full bg-white/5 border border-white/10 hover:bg-cyan-500 hover:text-navy hover:border-cyan-500 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all"
                      >
                        In Schatten-Kader übernehmen
                      </button>
                    </div>
                  ))}

                  {scoutSearchResults.length === 0 && !isScoutingLoading && (
                    <div className="col-span-full py-20 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center opacity-30">
                      <Icon name="layout-grid" size={48} className="mb-4" />
                      <div className="font-black uppercase text-sm tracking-widest">Keine Suchergebnisse</div>
                      <p className="text-[10px] font-mono mt-2">Starte einen Crawl, um Profile zu importieren</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* VIEW 3: NEGOTIATION (Decision Room) */}
            {scoutView === "negotiation" && (
              <div className="flex flex-col gap-6">
                <div className="bg-navy/80 backdrop-blur-md p-6 border border-white/10 rounded-2xl flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black text-white flex items-center gap-3 uppercase tracking-widest">
                      <Icon name="briefcase" size={20} className="text-gold" /> Decision Room
                    </h3>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-mono mt-1">Verhandlungssimulation & Total-Cost-of-Ownership (TCO)</p>
                  </div>
                  <div className="flex bg-black p-1 rounded-lg border border-white/10">
                    <button onClick={() => setNegotiationScenario("fee")} className={`px-4 py-2 text-[10px] uppercase font-black tracking-widest rounded ${negotiationScenario === "fee" ? "bg-gold/20 text-gold shadow-[0_0_10px_rgba(212,175,55,0.3)]" : "text-white/40 hover:text-white hover:bg-white/5"}`}>Ablöse-Szenario</button>
                    <button onClick={() => setNegotiationScenario("free")} className={`px-4 py-2 text-[10px] uppercase font-black tracking-widest rounded ${negotiationScenario === "free" ? "bg-neon/20 text-neon shadow-[0_0_10px_rgba(0,243,255,0.3)]" : "text-white/40 hover:text-white hover:bg-white/5"}`}>Free-Agent Szenario</button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                  {!selectedScoutTarget ? (
                    <div className="md:col-span-2 py-20 bg-black/40 border border-white/5 rounded-3xl text-center">
                      <Icon name="user-plus" size={48} className="mx-auto text-white/10 mb-4" />
                      <div className="text-white/40 font-mono text-xs uppercase tracking-widest">Wähle einen Schatten-Kandidaten im Dashboard, um die Verhandlung zu starten.</div>
                    </div>
                  ) : (() => {
                    const candidate = scoutingPool.find(x => x.id === selectedScoutTarget);
                    if (!candidate) return null;

                    const fee = negotiationScenario === "fee" ? candidate.marketValue : 0;
                    const signOn = negotiationScenario === "free" ? candidate.marketValue * 0.4 : 0;
                    const annualSalary = negotiationScenario === "fee" ? candidate.marketValue * 0.15 : candidate.marketValue * 0.22;
                    const duration = 3;
                    const tfc = fee + signOn + (annualSalary * duration);

                    return (
                      <div className="md:col-span-2 space-y-6">
                        <div className={`bg-black/40 border ${negotiationScenario === "fee" ? "border-gold/20" : "border-neon/20"} p-8 rounded-3xl animate-fade-in text-center`}>
                          <Icon name={negotiationScenario === "fee" ? "pie-chart" : "bar-chart"} size={48} className={`mx-auto ${negotiationScenario === "fee" ? "text-gold" : "text-neon"} opacity-50 mb-4`} />
                          <h4 className={`text-xl font-black ${negotiationScenario === "fee" ? "text-gold" : "text-neon"} uppercase tracking-widest mb-6`}>
                            {negotiationScenario === "fee" ? "Regulärer Transfer" : "Free Agent (Handgeld)"} — {candidate.name}
                          </h4>
                          <div className="flex flex-col md:flex-row justify-center gap-12">
                            <div className="text-center">
                              <div className="text-[10px] text-white/40 font-mono uppercase mb-2">{negotiationScenario === "fee" ? "Ablösesumme" : "Sign-On Fee"}</div>
                              <div className="text-2xl font-black text-white">€{(negotiationScenario === "fee" ? fee : signOn).toLocaleString()}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-[10px] text-white/40 font-mono uppercase mb-2">Jahresgehalt ({duration}J)</div>
                              <div className="text-2xl font-black text-white">€{annualSalary.toLocaleString()}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-[10px] text-white/40 font-mono uppercase mb-2">Total Financial Commitment (TFC)</div>
                              <div className={`text-2xl font-black ${tfc > truthObject.financials.current_budget ? "text-redbull" : "text-green-400"}`}>€{tfc.toLocaleString()}</div>
                            </div>
                          </div>
                          <div className="mt-8 p-4 bg-white/5 border border-white/10 rounded-xl text-xs font-mono text-white/60 text-left">
                            <span className="text-neon block mb-1 uppercase font-black text-[9px] tracking-widest">Gerd-Analyst Report:</span>
                            {tfc > truthObject.financials.current_budget
                              ? `"Das Liquiditätslimit wird durch dieses TFC gesprengt. Empfehlung: Gehalts-Verzicht oder Ratenzahlung erzwingen."`
                              : `"Finanziell tragbar. Das TFC entspricht ${(tfc / truthObject.financials.current_budget * 100).toFixed(1)}% des verbleibenden Cashflows."`}
                          </div>
                        </div>

                        <div className="flex justify-center">
                          <button
                            onClick={() => handleSignPlayer({ ...candidate, marketValue: (negotiationScenario === "fee" ? fee : signOn) })}
                            className="group relative px-12 py-5 bg-gold rounded-xl font-black uppercase text-xs tracking-widest text-black transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(212,175,55,0.4)]"
                          >
                            <Icon name="check-circle" size={18} className="inline mr-3" />
                            Verpflichtung abschließen
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        )}

        {/* === COMMERCIAL & ADS TAB (PRO) === */}
        {cfoTab === "commercial" && (
          <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* LEFT: Available Sponsors (from Identity) */}
              <div className="lg:col-span-1 bg-navy/30 backdrop-blur-md border border-white/10 p-6 rounded-3xl">
                <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Icon name="users" size={16} className="text-gold" /> Partner-Pool
                </h3>
                <div className="space-y-4">
                  {identityData?.sponsors?.map(sponsor => (
                    <div key={sponsor.id} className="bg-black/40 border border-white/5 p-4 rounded-xl flex items-center gap-4 group hover:border-gold/50 transition-all">
                      <div className="w-12 h-12 bg-white p-1 rounded-lg shrink-0">
                        <img src={sponsor.logo} alt={sponsor.name} className="w-full h-full object-contain" />
                      </div>
                      <div className="flex-1">
                        <div className="text-[10px] font-black text-white uppercase">{sponsor.name}</div>
                        <div className="text-[8px] text-white/40 font-mono italic">"{sponsor.slogan}"</div>
                      </div>
                      <div className="text-[10px] font-black text-gold/60 uppercase tracking-tighter">{sponsor.type.replace('_', ' ')}</div>
                    </div>
                  ))}
                  <div className="border-2 border-dashed border-white/10 rounded-xl p-4 flex flex-col items-center justify-center text-white/20 hover:text-white/40 cursor-pointer transition-all">
                    <Icon name="plus" size={20} className="mb-2" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Neuer Partner</span>
                  </div>
                </div>
              </div>

              {/* RIGHT: Ad Slot Management */}
              <div className="lg:col-span-2 bg-black/60 border border-gold/20 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5"><Icon name="award" size={150} /></div>
                <h3 className="text-xl font-black text-gold uppercase tracking-widest mb-8 flex items-center gap-3">
                  <Icon name="layout" size={24} /> Magazin-Anzeigenplätze (Monetarisierung)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {truthObject.media_suite.ad_spaces.map(slot => {
                    const config = identityData?.ad_slots?.find(s => s.id === slot.id);
                    return (
                      <div key={slot.id} className={`p-6 rounded-2xl border transition-all ${slot.booked ? "bg-gold/10 border-gold shadow-[0_0_20px_rgba(212,175,55,0.2)]" : "bg-white/5 border-white/10 hover:border-white/20"}`}>
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <div className="text-[10px] font-black uppercase text-gold mb-1">{slot.id.replace(/_/g, ' ')}</div>
                            <div className="text-[11px] text-white/60 font-mono">{config?.description || "Anzeigenplatz"}</div>
                          </div>
                          <div className="text-sm font-black text-white">€ {config?.price?.toLocaleString() || "0"}</div>
                        </div>

                        {slot.booked ? (
                          <div className="flex items-center justify-between bg-black/40 p-3 rounded-lg border border-gold/30">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-white p-1 rounded shrink-0">
                                <img src={slot.sponsor?.logo} alt="" className="w-full h-full object-contain" />
                              </div>
                              <div className="text-[9px] font-bold text-white uppercase">{slot.sponsor?.name}</div>
                            </div>
                            <button
                              onClick={() => dispatchAction('UPDATE_AD_SPACE', { id: slot.id, data: { booked: false, sponsor: null } })}
                              className="text-[9px] font-black text-red-500 uppercase hover:text-white transition-colors"
                            >
                              Stornieren
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <label className="text-[9px] text-white/30 uppercase font-bold tracking-widest block">Partner zuweisen</label>
                            <div className="flex gap-2">
                              <select
                                className="flex-1 bg-black border border-white/10 rounded-lg px-2 py-2 text-[10px] text-white font-mono focus:border-gold outline-none"
                                onChange={(e) => {
                                  if (!e.target.value) return;
                                  const sponsor = identityData.sponsors.find(s => s.id === e.target.value);
                                  dispatchAction('UPDATE_AD_SPACE', { id: slot.id, data: { booked: true, sponsor, price: config?.price } });
                                  gerdSpeak(`Anzeige für ${sponsor.name} gebucht. Einnahme: €${config.price.toLocaleString()}`, "System");
                                }}
                              >
                                <option value="">Partner wählen...</option>
                                {identityData?.sponsors?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                              </select>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="p-6 bg-gold text-black rounded-2xl flex items-center justify-between shadow-[0_0_30px_rgba(212,175,55,0.4)]">
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Total Ad-Revenue</div>
                      <div className="text-4xl font-black tracking-tighter">€ {truthObject.financials.revenue.sponsoring.toLocaleString()}</div>
                    </div>
                    <div className="w-16 h-16 rounded-full bg-black/10 flex items-center justify-center opacity-40">
                      <Icon name="trending-up" size={32} />
                    </div>
                  </div>

                  <div className="bg-black/40 border border-white/10 p-6 rounded-2xl">
                    <h4 className="text-[10px] font-black uppercase text-white tracking-widest mb-4 flex items-center gap-2">
                      <Icon name="zap" size={14} className="text-redbull" /> AI-Ad-Generator Status
                    </h4>
                    <p className="text-[10px] text-white/40 font-mono leading-relaxed">
                      Die Editorial-Engine optimiert gebuchte Anzeigen automatisch für den Red Bulletin Style.
                      <span className="text-neon block mt-2 tracking-tight">Vorteil: 0,00 € Agenturkosten für Sponsoren.</span>
                    </p>
                  </div>
                </div>

                {/* REFINANZIERUNGSTABELLE (PHASE 12) */}
                <div className="mt-12 border-t border-white/10 pt-8">
                  <h4 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Icon name="table" size={18} className="text-gold" /> Gerd 2.0 Refinanzierungs-Modell
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[10px] font-mono border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 text-white/40 font-black uppercase tracking-widest">
                          <th className="pb-4 pr-4">Werbeplatz</th>
                          <th className="pb-4 pr-4">Format</th>
                          <th className="pb-4 pr-4">Zielgruppe</th>
                          <th className="pb-4 text-right">Empfohlener Preis</th>
                        </tr>
                      </thead>
                      <tbody className="text-white/80">
                        <tr className="border-b border-white/5">
                          <td className="py-4 font-black">Main Partner</td>
                          <td className="py-4 opacity-60">Rückseite + Cover-Branding</td>
                          <td className="py-4 italic">Großsponsoren</td>
                          <td className="py-4 text-right text-gold font-black">5.000 € - 10.000 €</td>
                        </tr>
                        <tr className="border-b border-white/5">
                          <td className="py-4 font-black">Player-Patron</td>
                          <td className="py-4 opacity-60">Anzeige neben Spieler-Profil</td>
                          <td className="py-4 italic">Mittelstand</td>
                          <td className="py-4 text-right text-gold font-black">1.500 € - 2.500 €</td>
                        </tr>
                        <tr>
                          <td className="py-4 font-black">Tactical Sponsor</td>
                          <td className="py-4 opacity-60">Logo im Tactical Hub Export</td>
                          <td className="py-4 italic">Technik-Firmen</td>
                          <td className="py-4 text-right text-gold font-black">1.000 €</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-6 text-[9px] text-white/30 italic text-center uppercase tracking-widest">
                    Durch Kontextuelle Platzierung erreichen wir höchste Klickraten und maximale Sichtbarkeit.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* === SMART SOURCING TAB === */}
        {cfoTab === "sourcing" && (
          <div className="space-y-6">
            <div className="bg-[#111] p-10 rounded-3xl border border-white/10 relative overflow-hidden">
              <div className="absolute -right-10 -top-10 opacity-5 rotate-12">
                <Icon name="shopping-bag" size={300} />
              </div>
              <div className="max-w-3xl mx-auto">
                <h3 className="text-2xl font-black text-white uppercase tracking-[0.2em] mb-4 text-center">
                  Elite Sourcing Agent
                </h3>
                <p className="text-white/40 text-[10px] font-mono uppercase tracking-widest mb-10 text-center">
                  AI-Driven Supply Chain & Procurement Intelligence
                </p>

                <div className="flex gap-2 p-2 bg-black/60 border border-white/10 rounded-2xl mb-12 shadow-2xl focus-within:border-gold transition-colors">
                  <input
                    type="text"
                    value={sourcingQuery}
                    onChange={(e) => setSourcingQuery(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleSmartSourcing()
                    }
                    placeholder="Was benötigst du? z.B. 'Trainingslager Alanya 10 Tage für 25 Personen'"
                    className="flex-1 bg-transparent border-none text-white font-mono px-4 py-3 focus:outline-none"
                  />
                  <button
                    onClick={handleSmartSourcing}
                    className="bg-gold text-black font-black uppercase text-[10px] tracking-widest px-8 py-3 rounded-xl hover:bg-white transition-all flex items-center gap-2"
                  >
                    <Icon name="search" size={14} /> Analyse
                  </button>
                </div>

                {sourcingReport && (
                  <div className="animate-scale-in">
                    <div className="bg-black/60 border-l-4 border-gold p-10 rounded-r-2xl shadow-inner font-mono text-xs leading-relaxed text-white/80 whitespace-pre-wrap">
                      <div className="text-[10px] font-black uppercase tracking-widest text-gold mb-6 border-b border-gold/20 pb-2">
                        Bericht-Format: PRO-SOURCING v2.4
                      </div>
                      {sourcingReport}
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(sourcingReport);
                        gerdSpeak(
                          "Analyse und Anschreiben kopiert.",
                          "Manager-Gerd",
                        );
                      }}
                      className="mt-6 ml-auto block text-[10px] font-black text-gold/60 uppercase hover:text-gold transition-colors"
                    >
                      In die Zwischenablage kopieren →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* === AUDIT & LEGAL TAB === */}
        {cfoTab === "communication" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-[#0f0f0f] border border-redbull/20 p-8 rounded-3xl relative overflow-hidden">
                <div className="absolute right-0 top-0 p-8 opacity-5">
                  <Icon name="shield-check" size={150} />
                </div>
                <h3 className="text-lg font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Icon
                    name="shield"
                    size={20}
                    className="text-redbull"
                  />{" "}
                  Document Audit
                </h3>
                <div className="bg-black/60 border border-white/10 rounded-2xl p-6 mb-6">
                  <textarea
                    value={contractText}
                    onChange={(e) => setContractText(e.target.value)}
                    placeholder="Vertragstext oder Brief hier einfügen für KI-Check..."
                    rows={15}
                    className="w-full bg-transparent border-none text-white font-mono text-xs focus:outline-none resize-none leading-relaxed"
                  />
                </div>
                <button
                  onClick={handleContractAudit}
                  className="w-full bg-redbull text-white font-black uppercase text-xs py-5 rounded-xl hover:bg-white hover:text-redbull transition-all shadow-[0_10px_30px_rgba(226,27,77,0.2)]"
                >
                  Audit-Protokoll anfordern
                </button>
              </div>

              <div className="bg-white/5 border border-white/5 p-8 rounded-3xl min-h-[400px]">
                {auditReport ? (
                  <div className="animate-slide-up">
                    <div className="text-[10px] font-black uppercase tracking-widest text-redbull mb-6 flex items-center gap-2">
                      <Icon name="alert-circle" size={14} />{" "}
                      Analyse-Ergebnis & Optimierung
                    </div>
                    <div className="font-mono text-[11px] leading-relaxed text-white/70 whitespace-pre-wrap carbon-fiber border border-white/10 p-8 rounded-xl min-h-full">
                      <div className="text-center mb-8 border-b border-white/20 pb-8">
                        <div className="font-black text-lg tracking-widest text-white uppercase italic">
                          STARK ELITE
                        </div>
                        <div className="text-[8px] tracking-[0.4em] opacity-40 mt-1 uppercase">
                          Management & Sport Litigation Dept.
                        </div>
                      </div>
                      {auditReport}
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center opacity-10 text-center">
                    <Icon name="file-search" size={60} className="mb-4" />
                    <div className="font-black text-xs uppercase tracking-[0.3em]">
                      Ready for Audit Injection
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // --- NLZ / YOUTH ACADEMY COMPONENT ---

  // 6. Professional Media Suite
  const renderJournal = () => {
    return (
      <div className="h-full flex flex-col bg-[#050a14] text-white font-sans animate-fade-in relative overflow-hidden">
        {/* TOP BAR: Header & Export Buttons */}
        <div className="h-16 border-b border-white/10 bg-navy/80 backdrop-blur-md flex items-center justify-between px-6 z-20 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-neon flex items-center justify-center rounded-sm">
              <Icon name="layout" size={16} className="text-black" />
            </div>
            <div>
              <h2 className="font-black italic tracking-widest uppercase text-sm">Gerd 2.0 <span className="text-redbull font-sans">Editorial Engine</span></h2>
              <p className="text-[9px] font-mono text-white/40 uppercase tracking-[0.2em]">Red Bulletin Edition v5.0</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => { setShowExportCenter(true); setExportTarget("story"); }}
              className="bg-black/40 border border-white/20 hover:border-white text-xs font-black uppercase tracking-widest px-4 py-2 rounded-md transition-all flex items-center gap-2"
            >
              <Icon name="monitor" size={14} />
              Flip-Book
            </button>
            <button
              onClick={() => { setShowExportCenter(true); setExportTarget("print"); }}
              className="bg-redbull text-white text-xs font-black uppercase tracking-widest px-4 py-2 rounded-md hover:bg-white hover:text-black transition-all shadow-[0_0_15px_rgba(226,27,77,0.3)] flex items-center gap-2"
            >
              <Icon name="printer" size={14} />
              Export Center
            </button>
          </div>
        </div>

        {/* MAIN WORKSPACE */}
        <div className="flex-1 flex overflow-hidden">

          {/* LEFT: Toolbar (Icon Strip) */}
          <div className="w-16 border-r border-white/10 bg-black/60 flex flex-col items-center py-6 gap-6 shrink-0 z-20">
            {[
              { id: "ai-writer", icon: "pen-tool", label: "Investigative Reporter" },
              { id: "nlz-writer", icon: "shield", label: "NLZ Reporter" },
              { id: "brand-kit", icon: "droplet", label: "Art Director" },
              { id: "components", icon: "grid", label: "Magazin-Raster" },
              { id: "assets", icon: "image", label: "Hero Shots" }
            ].map(tool => (
              <button
                key={tool.id}
                onClick={() => setMediaSuiteTool(tool.id)}
                className={`relative p-3 rounded-xl transition-all group ${mediaSuiteTool === tool.id ? "bg-neon/10 text-neon" : "text-white/40 hover:text-white"}`}
              >
                <Icon name={tool.icon} size={20} />
                {mediaSuiteTool === tool.id && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-neon rounded-r-md"></div>}

                {/* Tooltip */}
                <span className="absolute left-full ml-4 top-1/2 -translate-y-1/2 bg-black border border-white/10 text-[9px] uppercase tracking-widest px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                  {tool.label}
                </span>
              </button>
            ))}
          </div>

          {/* LEFT: Context Panel */}
          <div className="w-80 border-r border-white/10 bg-navy/40 backdrop-blur-md flex flex-col shrink-0 z-10 transition-all duration-300">

            {/* AI Writer Panel */}
            {mediaSuiteTool === "ai-writer" && (
              <div className="p-6 h-full flex flex-col animate-fade-in">
                <h3 className="font-black uppercase tracking-widest text-xs mb-6 flex items-center gap-2"><Icon name="cpu" size={14} className="text-neon" /> KI-Journalist</h3>

                <div className="space-y-8 flex-1 overflow-y-auto custom-scrollbar pr-2">
                  <div>
                    <label className="text-[10px] text-redbull font-black uppercase tracking-widest mb-3 block">Editorial Timbre</label>
                    <div className="grid grid-cols-1 gap-2">
                      {["Power", "Warrior", "Data-Grit"].map(timbre => (
                        <button
                          key={timbre}
                          onClick={() => setMediaTimbre(timbre)}
                          className={`p-3 border rounded-lg text-left text-xs font-black uppercase tracking-widest transition-all ${mediaTimbre === timbre ? "border-redbull bg-redbull/10 text-redbull shadow-[0_0_15px_rgba(226,27,77,0.3)]" : "border-white/10 bg-black/40 text-white/40 hover:border-white/30"}`}
                        >
                          {timbre}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-white/50 uppercase tracking-widest mb-3 block">Visual Assets</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button className="bg-white/5 border border-white/10 p-2 rounded hover:border-redbull transition-all">
                        <div className="h-16 bg-black flex items-center justify-center rounded"><Icon name="video" className="text-redbull" /></div>
                        <div className="text-[8px] mt-1 font-black uppercase">Rain Practice</div>
                      </button>
                      <button className="bg-white/5 border border-white/10 p-2 rounded hover:border-redbull transition-all">
                        <div className="h-16 bg-black flex items-center justify-center rounded"><Icon name="camera" className="text-white/40" /></div>
                        <div className="text-[8px] mt-1 font-black uppercase">Stadium Wide</div>
                      </button>
                    </div>
                  </div>

                  {/* AI CHIEF EDITOR PROPOSALS (NEW) */}
                  <div className="pt-6 border-t border-white/10">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-[10px] font-black text-redbull uppercase tracking-widest flex items-center gap-2">
                        <Icon name="zap" size={12} /> Red Bull Intelligence
                      </h4>
                      <button
                        onClick={handleMediaAdvisor}
                        disabled={isMediaAdvisorLoading}
                        className="text-[9px] uppercase font-bold text-white/40 hover:text-white transition-colors"
                      >
                        {isMediaAdvisorLoading ? "Syncing DNA..." : "Briefing anfordern"}
                      </button>
                    </div>

                    {suggestedLayoutBlocks.length > 0 ? (
                      <div className="space-y-3">
                        {suggestedLayoutBlocks.map((block, idx) => (
                          <div
                            key={idx}
                            className="bg-black/60 border border-cyan-500/20 p-3 rounded-lg hover:border-cyan-500/50 cursor-pointer transition-all group"
                            onClick={() => handleInvestigativeReport(block)}
                          >
                            <div className="text-[8px] text-cyan-500/60 uppercase font-mono mb-1">{block.type}</div>
                            <div className="text-[10px] text-white font-bold mb-1 group-hover:text-cyan-400 transition-colors uppercase tracking-tight">{block.headline}</div>
                            <div className="text-[9px] text-white/40 font-mono leading-tight line-clamp-2">{block.description}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-white/5 border border-dashed border-white/10 p-4 rounded-lg text-center">
                        <p className="text-[9px] text-white/30 font-mono uppercase">Keine Entwürfe vorhanden. Starte Briefing für KI-Vorschläge.</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/10">
                  <button
                    onClick={() => {
                      setMediaCanvasBlocks([...mediaCanvasBlocks, { id: Date.now(), type: "text", timbre: mediaTimbre }]);
                      gerdSpeak(`Textbaustein (${mediaTimbre}) generiert und ins Layout eingefügt.`, "System");
                    }}
                    className="w-full bg-neon text-black font-black uppercase text-[10px] tracking-widest py-3 rounded-lg hover:bg-white transition-colors shadow-[0_0_10px_rgba(0,243,255,0.3)]"
                  >
                    Absatz Generieren & Einfügen
                  </button>
                </div>
              </div>
            )}

            {/* NLZ Writer Panel (Phase 30) */}
            {mediaSuiteTool === "nlz-writer" && (
              <div className="p-6 h-full flex flex-col animate-fade-in">
                <h3 className="font-black uppercase tracking-widest text-xs mb-6 flex items-center gap-2">
                  <Icon name="shield" size={14} className="text-redbull" /> NLZ Reporter
                </h3>
                <div className="space-y-8 flex-1 overflow-y-auto custom-scrollbar pr-2">
                  <div>
                    <label className="text-[10px] text-white/50 uppercase tracking-widest mb-3 block">Reporting Fokus</label>
                    <div className="grid grid-cols-1 gap-2">
                      {["U19 Match Report", "Top Talent Spotlight", "NLZ Saison-Update"].map(f => (
                        <button
                          key={f}
                          className="p-3 border border-redbull/30 bg-redbull/5 text-left text-[10px] font-black uppercase tracking-widest hover:bg-redbull/20 transition-all text-white/80"
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="pt-4 border-t border-white/10">
                    <label className="text-[10px] font-black text-neon uppercase tracking-widest flex items-center gap-2 mb-3">
                      <Icon name="zap" size={12} /> Auto-Generate Draft
                    </label>
                    <p className="text-[9px] text-white/40 mb-6 uppercase tracking-widest leading-relaxed">
                       Gerd analysiert die neuesten NLZ-Scouting-Daten und generiert einen 'Red Bulletin'-würdigen Report über die Nachwuchsarbeit.
                    </p>
                    <button
                      onClick={() => {
                        setMediaCanvasBlocks([...mediaCanvasBlocks, { id: Date.now(), type: "text", content: "[NLZ Report Draft] Starke Leistung der U19 im Gegenpressing. Das Talent " + (youthPlayers.length > 0 ? youthPlayers[0].name : "MAX") + " brillierte mit herausragenden Werten in PAC und DRI." }]);
                        gerdSpeak("NLZ Entwicklungsbericht und Spieltags-Insights wurden in den Magazin-Draft geladen.", "System");
                      }}
                      className="w-full bg-redbull text-white font-black uppercase text-[10px] tracking-widest py-3 rounded-xl hover:bg-white hover:text-redbull transition-colors shadow-[0_0_15px_rgba(226,27,77,0.3)] flex items-center justify-center gap-2"
                    >
                      <Icon name="pen-tool" size={14} /> KI-Draft Generieren
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Art Director Panel (NEW) */}
            {mediaSuiteTool === "brand-kit" && (
              <div className="p-6 h-full flex flex-col animate-fade-in overflow-y-auto">
                <h3 className="font-black uppercase tracking-widest text-xs mb-6 flex items-center gap-2">
                  <Icon name="palette" size={14} className="text-redbull" /> Art Direction
                </h3>
                <div className="space-y-8">
                  <div>
                    <label className="text-[10px] text-white/50 uppercase tracking-widest mb-3 block">Corporate Identity</label>
                    <div className="flex gap-4">
                      {["#e21b4d", "#00f3ff", "#ffffff"].map(color => (
                        <button
                          key={color}
                          onClick={() => dispatchAction('UPDATE_BRANDING', { primary_color: color })}
                          className={`w-10 h-10 rounded-full border-2 transition-transform hover:scale-110 ${truthObject.media_suite.branding.primary_color === color ? "border-white" : "border-white/10"}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/10">
                    <label className="text-[10px] text-white/50 uppercase tracking-widest mb-3 block">Ad-Space Preview</label>
                    <div className="space-y-3">
                      {truthObject.media_suite.ad_spaces.map(ad => (
                        <div key={ad.id} className="flex items-center justify-between bg-black/40 p-3 rounded-lg border border-white/5">
                          <span className="text-[9px] uppercase font-mono text-white/60">{ad.id.split('_')[0]} Ad</span>
                          <div className={`w-3 h-3 rounded-full ${ad.booked ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-redbull/50"}`}></div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/10">
                    <button
                      onClick={() => gerdSpeak("Automatisches Layouting basierend auf Goldenem Schnitt aktiv.", "Art-Director")}
                      className="w-full bg-white text-black py-3 rounded font-black uppercase text-[10px] tracking-widest hover:bg-gold transition-colors"
                    >
                      Auto-Grid Optimierung
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Fallback Panels */}
            {(mediaSuiteTool === "components" || mediaSuiteTool === "assets") && (
              <div className="h-full flex flex-col items-center justify-center p-6 text-center opacity-40 animate-fade-in">
                <Icon name={mediaSuiteTool === "components" ? "grid" : "image"} size={48} className="mb-4" />
                <div className="text-xs font-black uppercase tracking-widest mb-2 border-b border-white/20 pb-2">Archiv wird geladen</div>
                <p className="text-[10px] font-mono leading-relaxed mt-2">Verbindung zur Vereinsdatenbank (Cloud) wird hergestellt. Raster und Visuals in Vorbereitung.</p>
              </div>
            )}
          </div>

          {/* CENTER: The Canvas / Editor area (RED BULLETIN STYLE) */}
          <div className="flex-1 bg-[#0a0a0a] relative overflow-auto custom-scrollbar flex justify-center py-12 px-6">
            <div className="absolute inset-0 pointer-events-none opacity-5" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '100px 100px' }}></div>

            <div className="w-full max-w-5xl bg-white min-h-[1400px] shadow-[0_40px_100px_rgba(0,0,0,0.5)] relative flex flex-col z-10 overflow-hidden">

              {/* PAGE 1: COVER STYLE (RED BULL DNA) */}
              <div className="p-12 h-screen flex flex-col border-b-[20px] border-black relative overflow-hidden group">
                {/* HERO VIDEO/IMAGE BACKGROUND */}
                <div className="absolute inset-0 z-0 bg-black">
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all duration-1000"
                  >
                    <source src="https://assets.mixkit.co/videos/preview/mixkit-professional-football-player-practicing-at-night-42646-large.mp4" type="video/mp4" />
                  </video>
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40"></div>
                </div>

                <div className="absolute top-12 right-12 flex flex-col items-end z-10">
                  <div className="bg-redbull text-white px-6 py-2 font-black italic text-4xl uppercase tracking-tighter shadow-[0_10px_30px_rgba(226,27,77,0.5)]">RED BULLETIN</div>
                  <div className="text-white font-black text-[12px] uppercase mt-2 mr-2 tracking-[0.3em]">Issue 01 // 2026</div>
                </div>

                <div className="mt-20 z-10">
                  <h1 className="text-[14rem] leading-[0.8] font-black italic uppercase tracking-tighter text-white mix-blend-overlay opacity-90 outline-none" contentEditable spellCheck="false">
                    THE POWER<br />OF THE SOUL
                  </h1>
                  <h2 className="text-6xl font-black italic text-redbull absolute top-[28rem] left-24 tracking-tighter animate-pulse uppercase">Intensity Revolution</h2>
                </div>

                <div className="mt-auto grid grid-cols-12 gap-6 items-end z-10">
                  <div className="col-span-8">
                    <div className="w-32 h-3 bg-redbull mb-8"></div>
                    <p className="text-5xl font-black uppercase text-white italic max-w-2xl leading-tight shadow-black drop-shadow-2xl" contentEditable spellCheck="false">
                      WARUM GERD 2.0 NICHT NUR TAKTIK MISST, SONDERN DEN CHARAKTER EINES CHAMPIONS FORMT.
                    </p>
                  </div>
                  <div className="col-span-4 border-l border-white/20 pl-8 pb-8">
                    <span className="text-[12px] font-black uppercase text-white/40 block mb-2 tracking-widest">Mastermind</span>
                    <span className="text-2xl font-black uppercase text-white italic tracking-tighter">GERD SAUERWEIN</span>
                  </div>
                </div>
              </div>

              {/* PAGE 2: FEATURE GRID */}
              <div className="p-12 flex-1 grid grid-cols-12 gap-8 bg-white text-black bg-white">

                {/* Left Column: Investigative Content */}
                <div className="col-span-8 space-y-12">
                  {/* SECTION 1: TACTICAL LAB (BLUEPRINT) */}
                  <div className="border-t-4 border-black pt-6">
                    {truthObject.media_suite.ad_spaces.find(ad => ad.id === "full_page_premium")?.booked && (
                      <div className="mb-12 border-b-[10px] border-black">
                        <PremiumPartnerAd
                          sponsor={truthObject.media_suite.ad_spaces.find(ad => ad.id === "full_page_premium").sponsor}
                          oppositeContent="Taktische Dominanz-Analyse"
                        />
                      </div>
                    )}
                    <div className="flex justify-between items-center mb-4">
                      <span className="bg-black text-white px-3 py-1 text-[10px] font-black uppercase tracking-widest">Tactical Lab</span>
                      <span className="text-[10px] font-mono text-black/40">ANALYSE // 3-4-3 SIEGE</span>
                    </div>
                    <h2 className="text-6xl font-black uppercase italic mb-6 leading-none tracking-tighter">THE 3-4-3 SIEGE: ANATOMIE EINER DOMINANZ.</h2>
                    <div className="grid grid-cols-2 gap-8">
                      <div className="text-sm leading-relaxed text-justify">
                        <span className="float-left text-7xl font-black leading-none mr-3 mt-1 text-redbull">T</span>
                        Die Analyse unserer Vektor-Patterns zeigt: Das 3-4-3 ist nicht nur eine Formation, es ist ein Belagerungszustand. Durch die Überladung der Halbräume zwingen wir den Gegner in eine passive Tiefenverteidigung. Gerd 2.0 misst hierbei nicht nur die Position, sondern den kinetischen Druck.
                      </div>
                      <div className="bg-black/5 p-4 border border-black/10 rounded-xl relative overflow-hidden h-48 flex items-center justify-center">
                        <Icon name="shield" size={100} className="text-black/5 absolute -bottom-10 -right-10" />
                        <div className="text-[10px] font-black uppercase text-black/20 text-center tracking-[0.4em]">Tactical Hub // Live-Feed</div>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 2: THE MONEY MAKER (BLUEPRINT) */}
                  <div className="border-t-4 border-black pt-6 bg-black text-white p-8 -mx-12">
                    <div className="flex justify-between items-center mb-6">
                      <span className="bg-gold text-black px-3 py-1 text-[10px] font-black uppercase tracking-widest italic animate-pulse">Investment Alert</span>
                      <span className="text-[10px] font-mono text-white/40">STATUS // AGGERSSIVE EXPANSION</span>
                    </div>
                    <h2 className="text-6xl font-black uppercase italic mb-8 leading-none tracking-tighter text-gold">MARKTWERT-EXPLOSION: DAS 2,5 MIO. € PROJEKT.</h2>
                    <div className="grid grid-cols-3 gap-6">
                      <div className="col-span-1 space-y-4">
                        <div className="p-4 border border-white/20 rounded-lg">
                          <div className="text-[8px] uppercase font-black text-white/40">ROI Kalkuliert</div>
                          <div className="text-2xl font-black text-neon">+450%</div>
                        </div>
                        <div className="p-4 border border-white/20 rounded-lg">
                          <div className="text-[8px] uppercase font-black text-white/40">Risiko-Score</div>
                          <div className="text-2xl font-black text-redbull">Low</div>
                        </div>
                      </div>
                      <div className="col-span-2 text-sm leading-relaxed text-white/80">
                        Unser CFO-Board zeigt: Liquidität ist nur ein Werkzeug. Durch aggressive Reinvestition in unsere 'Warrior-Talente' hebeln wir den Kaderwert innerhalb von 18 Monaten um das Dreifache. Gerd 2.0 ist der Algorithmus hinter diesem Wohlstand.
                      </div>
                    </div>
                  </div>

                  {/* SECTION 3: CHARACTER STUDY (BLUEPRINT) */}
                  <div className="border-t-4 border-black pt-6">
                    <div className="flex justify-between items-center mb-4">
                      <span className="bg-redbull text-white px-3 py-1 text-[10px] font-black uppercase tracking-widest">Character Study</span>
                      <span className="text-[10px] font-mono text-black/40">SEELE DER KRIEGER // PSYCHE-CHECK</span>
                    </div>
                    <h2 className="text-6xl font-black uppercase italic mb-8 leading-none tracking-tighter">HINTER DER STATISTIK: DIE SEELE DER KRIEGER.</h2>

                    <div className="flex gap-12 items-center mb-12">
                      <SoulRadar stats={players.find(p => p.id === 99) || players[0]} size={280} />
                      <div className="flex-1 border-l-4 border-black pl-8">
                        <h4 className="font-serif italic text-3xl mb-4 text-black">"Druck ist nur eine Information."</h4>
                        <p className="text-sm font-serif leading-relaxed text-justify text-black/80">
                          Unsere Charakter-Matrix zeigt bei Lukas Berg ein Phänomen, das wir 'Hyper-Resilienz' nennen. Während die physische Kapazität bei 85% der Ligaspieler ab der 75. Minute sinkt, stabilisiert Berg seine mentalen Vektoren. Es ist dieser unbändige Wille, der ihn zum Porträt eines Champions macht.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {players.filter(p => p.id !== 99).slice(0, 2).map(p => (
                        <div key={p.id} className="flex gap-8 items-start border-l-[10px] border-black pl-8 py-4 bg-black/5">
                          <div className="shrink-0 w-20 h-20 bg-black text-white rounded-full flex items-center justify-center text-3xl font-black italic">{p.ovr}</div>
                          <div>
                            <div className="text-[10px] font-black text-redbull uppercase mb-1">{p.name} // Resilienz: {p.resilience}%</div>
                            <blockquote className="text-xl font-serif italic text-black/90 leading-tight">
                              "Echtes Charisma lässt sich nicht programmieren, aber Gerd 2.0 macht es sichtbar. Dieser Spieler ist das psychologische Rückgrat unseres Pressings."
                            </blockquote>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* SPONSOR INFOBOX LUKAS BERG (PHASE 12) */}
                    {truthObject.media_suite.ad_spaces.find(ad => ad.id === "player_patron_berg")?.booked && (
                      <div className="mt-8 p-6 bg-black text-white flex items-center gap-6 border-l-[10px] border-redbull">
                        <img
                          src={truthObject.media_suite.ad_spaces.find(ad => ad.id === "player_patron_berg").sponsor.logo}
                          className="w-16 h-16 object-contain grayscale invert"
                        />
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-redbull mb-1">Character Patron</p>
                          <p className="text-sm font-serif italic opacity-80">
                            "Lukas Bergs Resilienz wird unterstützt durch die Zuverlässigkeit von {truthObject.media_suite.ad_spaces.find(ad => ad.id === "player_patron_berg").sponsor.name}. Gemeinsam für den Erfolg."
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* SECTION 5: THE SOUL INTERVIEW (PHASE 11 SPECIAL) */}
                  <div className="bg-[#f0f0f0] -mx-12 p-12 border-y-[20px] border-black">
                    <div className="max-w-3xl mx-auto">
                      <span className="text-[10px] font-black uppercase tracking-[0.5em] text-redbull mb-4 block text-center">Special Feature // The Soul Interview</span>
                      <h2 className="text-7xl font-black uppercase italic tracking-tighter mb-12 border-b-8 border-black pb-4 text-center">DER ANKER IM STURM</h2>

                      <div className="font-serif text-lg leading-relaxed space-y-10 text-black">
                        <div className="space-y-4">
                          <p className="text-2xl font-black uppercase italic tracking-tight font-sans text-redbull">Reporter-KI: Lukas, deine Sprintintensität steigt in der 80. Minute um 15%. Woher nimmst du diese Kraft?</p>
                          <p className="pl-12 border-l-4 border-black/10 italic text-xl">
                            "Es ist kein physisches Ding, es ist eine Entscheidung. Unsere Charakter-Matrix zeigt mir nach jedem Spiel: In der Crunch-Time entscheidet sich, wer wir wirklich sind. Wenn die Beine brennen, fängt der Kopf an zu führen."
                          </p>
                        </div>

                        <div className="space-y-4">
                          <p className="text-2xl font-black uppercase italic tracking-tight font-sans text-redbull">Reporter-KI: Die Daten zeigen den Liga-Bestwert beim Umschalten. Spürst du dabei den Druck?</p>
                          <p className="pl-12 border-l-4 border-black/10 italic text-xl">
                            "Druck ist nur eine Information. Mein 'Team-Opferbereitschaft-Wert' im Dashboard erinnert mich daran: Ich sprinte nicht für mich, sondern um das System stabil zu halten. Ein Loch in der Kette ist wie ein Riss im Fundament."
                          </p>
                        </div>
                      </div>

                      <div className="mt-16 pt-12 border-t border-black/10 flex justify-between items-end">
                        <div className="flex gap-4">
                          <div className="w-12 h-1 bg-redbull"></div>
                          <div className="w-12 h-1 bg-black"></div>
                          <div className="w-12 h-1 bg-black/20"></div>
                        </div>
                        <span className="text-[10px] font-black uppercase italic text-black/40">The Red Bulletin // Issue 01 // Soul Editorial</span>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 4: FUTURE SCOUTING (BLUEPRINT) */}
                  <div className="border-t-4 border-black pt-6 bg-redbull text-white p-8 -mx-12 mb-12">
                    <h2 className="text-6xl font-black uppercase italic mb-8 leading-none tracking-tighter">THE NEXT ALPHA:<br />WER EROBERT DIE LIGA?</h2>
                    <div className="grid grid-cols-4 gap-4">
                      {scoutingPool.map((s, i) => (
                        <div key={i} className="bg-black/20 p-4 border border-white/10 rounded-lg">
                          <div className="text-[12px] font-black italic mb-1">{s.name}</div>
                          <div className="text-[8px] uppercase text-white/60 mb-3">{s.club}</div>
                          <div className="text-lg font-black text-gold">{s.match}%</div>
                          <div className="text-[7px] uppercase font-black text-white/40 tracking-widest">DNA-MATCH</div>
                        </div>
                      ))}
                    </div>
                    {/* BANDERLOE SCOUTING */}
                    {truthObject.media_suite.ad_spaces.find(ad => ad.id === "banner_footer")?.booked && (
                      <div className="mt-8">
                        <PerformanceBanderole sponsor={truthObject.media_suite.ad_spaces.find(ad => ad.id === "banner_footer").sponsor} />
                      </div>
                    )}
                  </div>

                  {mediaCanvasBlocks.filter(b => b.type !== 'ad').map(block => (
                    <div key={block.id} className="relative group border-t-2 border-black/5 pt-8">
                      {block.headline && <h2 className="text-5xl font-black uppercase italic mb-6 leading-tight border-b-8 border-black pb-2">{block.headline}</h2>}
                      <div className="columns-2 gap-8 text-sm leading-relaxed text-justify font-medium">
                        <span className="float-left text-7xl font-black leading-none mr-3 mt-1 text-redbull">
                          {block.description?.charAt(0) || "D"}
                        </span>
                        {block.description || "Die Analyse zeigt eine klare Tendenz..."}
                      </div>

                      <div className="mt-8 grid grid-cols-3 gap-4">
                        <div className="h-32 bg-black/5 rounded"></div>
                        <div className="h-32 bg-black/5 rounded"></div>
                        <div className="h-32 bg-black/5 rounded"></div>
                      </div>
                    </div>
                  ))}

                  {/* Fallback if empty */}
                  {mediaCanvasBlocks.length === 0 && (
                    <div className="h-96 border-4 border-dashed border-black/10 flex flex-col items-center justify-center text-black/20">
                      <Icon name="plus" size={48} />
                      <span className="font-black uppercase tracking-widest mt-4">Feature Story hinzufügen</span>
                    </div>
                  )}
                </div>

                {/* Right Column: Data & Ads */}
                <div className="col-span-4 border-l-2 border-black pl-8 space-y-12">
                  {/* NATIVE AD ZONE 1 */}
                  <div className="bg-redbull/5 border-2 border-redbull p-6 relative group overflow-hidden">
                    <div className="absolute top-0 right-0 p-1 bg-redbull text-white text-[8px] font-black uppercase">Featured</div>
                    <div className="absolute -bottom-10 -left-10 opacity-5 rotate-12 transition-transform group-hover:rotate-0 duration-700">
                      <Icon name="zap" size={150} />
                    </div>
                    <h4 className="font-black italic uppercase text-lg mb-2 relative z-10">THE POWER FUEL</h4>
                    <p className="text-[10px] text-black/60 mb-4 font-black uppercase relative z-10">Präsentiert von Red Bull – Die Power für unser Team.</p>
                    <button className="w-full bg-black text-white py-2 text-[9px] font-black uppercase tracking-widest relative z-10">Explore DNA</button>
                  </div>

                  <div className="bg-black text-white p-6 skew-x-[-5deg] shadow-[10px_10px_0_rgba(226,27,77,1)]">
                    <h4 className="font-black italic uppercase text-lg mb-4">LIGA TRENDS</h4>
                    <div className="space-y-4 opacity-80">
                      {suggestedLayoutBlocks.slice(0, 3).map((trend, i) => (
                        <div key={i} className="border-b border-white/20 pb-2">
                          <div className="text-[10px] font-black text-gold mb-1 uppercase tracking-widest">{trend.headline}</div>
                          <p className="text-[10px] leading-tight font-mono">{trend.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AD SPACE INJECTION */}
                  {truthObject.media_suite.ad_spaces.filter(ad => ad.booked).map(ad => (
                    <div key={ad.id} className="border-2 border-black p-4 relative hover:shadow-[5px_5px_0_black] transition-all">
                      <div className="absolute -top-3 left-4 bg-white px-2 text-[8px] font-black uppercase">Anzeige</div>
                      <img src={ad.sponsor.logo} alt={ad.sponsor.name} className="w-full h-auto grayscale hover:grayscale-0 transition-grayscale mb-2" />
                      <div className="text-[10px] font-black uppercase text-center">{ad.sponsor.slogan}</div>
                    </div>
                  ))}

                  {/* SOCIAL MEDIA PREVIEW ZONE (PHASE 12) */}
                  <div className="bg-black/5 border-2 border-dashed border-black/10 p-6 rounded-xl">
                    <div className="flex items-center gap-2 mb-4 text-[10px] font-black uppercase text-black/40">
                      <Icon name="instagram" size={14} /> Viral-Engine aktive // Preview Slides
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      <SocialCard slideIndex={1} title="The Power of Soul" subline="Issue 1 Cover Story" icon="chrome" />
                      <SocialCard slideIndex={2} title="3-4-3 Siege" subline="Tactical Lab Analysis" icon="target" />
                      <SocialCard slideIndex={3} title="Der Anker im Sturm" subline="Lukas Berg Portrait" icon="user" />
                      <SocialCard slideIndex={4} title="Next Alpha" subline="Global Scouting Data" icon="search" />
                      <SocialCard slideIndex={5} title="Partner Synergy" subline="Brand Integration" icon="award" />
                    </div>
                    <p className="text-[9px] mt-4 font-mono text-black/40 italic text-center">Auto-generierte Social-Assets für Issue 01.</p>
                  </div>
                </div>
              </div>

              {/* STICKY BRAND BAR */}
              <div className="h-16 bg-black flex items-center justify-between px-12 text-white font-black uppercase tracking-widest text-[10px]">
                <div>Stark Elite Magazine // Issue 01</div>
                <div className="flex gap-8">
                  <span>#DigitalElite</span>
                  <span>#GerdSauerweinLegacy</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- A-FRAME VR INTEGRATION ---
  useEffect(() => {
    if (typeof AFRAME === "undefined") return;

    // Register component only once
    if (!AFRAME.components["video-telestrator"]) {
      AFRAME.registerComponent("video-telestrator", {
        init: function () {
          this.el.addEventListener("mousedown", (e) => {
            if (activeVideoTool === "none") return;
            const intersect = e.detail.intersection.uv;
            const canvasPos = {
              clientX:
                intersect.x * canvasRef.current.offsetWidth +
                canvasRef.current.getBoundingClientRect().left,
              clientY:
                (1 - intersect.y) * canvasRef.current.offsetHeight +
                canvasRef.current.getBoundingClientRect().top,
            };
            handleMouseDown(canvasPos);
          });
          this.el.addEventListener("mousemove", (e) => {
            if (!isDrawing || activeVideoTool === "none") return;
            const intersect = e.detail.intersection.uv;
            const canvasPos = {
              clientX:
                intersect.x * canvasRef.current.offsetWidth +
                canvasRef.current.getBoundingClientRect().left,
              clientY:
                (1 - intersect.y) * canvasRef.current.offsetHeight +
                canvasRef.current.getBoundingClientRect().top,
            };
            handleMouseMove(canvasPos);
          });
          this.el.addEventListener("mouseup", (e) => {
            if (!isDrawing || activeVideoTool === "none") return;
            const intersect = e.detail.intersection.uv;
            const canvasPos = {
              clientX:
                intersect.x * canvasRef.current.offsetWidth +
                canvasRef.current.getBoundingClientRect().left,
              clientY:
                (1 - intersect.y) * canvasRef.current.offsetHeight +
                canvasRef.current.getBoundingClientRect().top,
            };
            handleMouseUp(canvasPos);
          });
        },
      });
    }
  }, [activeVideoTool, isDrawing]);

  // VR ↔ React State Bridge
  const vrEditRef = React.useRef({ field: "", value: "", playerId: -1 });
  useEffect(() => {
    const handlePlayerMoved = (e) => {
      const { id, vrX, vrZ } = e.detail;
      // Update vrX/vrZ on the player
      setPlayers((prev) =>
        prev.map((p) => (p.id === id ? { ...p, vrX, vrZ } : p)),
      );
      // Also write back into playerPositions (3D table → 2D field coordinate mapping)
      // VR table: x [-2.2, 2.2], z [-1.5, 1.5] → field px: x [0,420], y [0,640]
      const fieldX = ((vrX + 2.2) / 4.4) * 420;
      const fieldY = ((vrZ + 1.5) / 3.0) * 640;
      setPlayerPositions((prev) => {
        const next = {
          ...prev,
          [id]: { x: Math.round(fieldX), y: Math.round(fieldY) },
        };
        localStorage.setItem(
          "gerd_playerPositions",
          JSON.stringify(next),
        );
        return next;
      });
    };
    const handleOpenTab = (e) => {
      const { tab } = e.detail;

      // If in VR, don't exit! Just teleport to the relevant panel area
      if (view === "vr") {
        const rig = document.getElementById("vr-rig");
        if (!rig) return;

        // Define teleport targets based on panel positions
        const targets = {
          video: "-6 0 6",
          medical: "-3.5 0 -7",
          cfo: "0 0 -8",
          nlz: "7 0 0",
          tactical: "4 0 4",
        };

        if (targets[tab]) {
          rig.setAttribute("position", targets[tab]);

          // Vocal Triggers for VR Proximity
          if (tab === "medical")
            gerdSpeak(
              "Medizinisches Labor aktiv. Scanne Spieler-Vitalwerte...",
              "Arzt-Gerd",
            );
          else if (tab === "video")
            gerdSpeak(
              "Video-Analyse-Hub bereit. Lade taktisches Material.",
              "Gerd Analyst",
            );
          else if (tab === "cfo")
            gerdSpeak(
              "Finanz-Dashboard geladen. Wir müssen wirtschaftlich effizient bleiben.",
              "Manager-Gerd",
            );
          else if (tab === "nlz")
            gerdSpeak(
              "NLZ Bereich betreten. Fokus auf die Talent-Schmiede.",
              "Trainer-Gerd",
            );
        }
        return;
      }

      // Otherwise, switch to dashboard
      setView("dashboard");
      setActiveTab(tab); // Direct switch is cleaner
    };
    // VR keyboard: which field is currently being edited
    const handleEditField = (e) => {
      vrEditRef.current = e.detail;
      vrEditRef.current.value = e.detail.value || "";
      setKbValue(e.detail.value || "");
    };
    // VR key press → build string, commit on CLOSE
    const handleKeyPress = (e) => {
      const { char } = e.detail;
      const ref = vrEditRef.current;
      if (char === "CLOSE") {
        // Hide keyboard
        const kb = document.getElementById("vr-keyboard");
        if (kb) kb.setAttribute("visible", "false");
        // Commit value to React state
        const val = ref.value;
        if (ref.field === "budget") {
          const num = parseFloat(val);
          if (!isNaN(num)) setBudget(num * 1000000);
        } else if (ref.field === "name" && ref.playerId >= 0) {
          setPlayers((prev) =>
            prev.map((p) =>
              p.id === ref.playerId ? { ...p, name: val } : p,
            ),
          );
        }
        vrEditRef.current = { field: "", value: "", playerId: -1 };
        setKbValue("");
      } else if (char === "BACKSPACE") {
        ref.value = ref.value.slice(0, -1);
        setKbValue(ref.value);
      } else if (char === "SPACE") {
        ref.value += " ";
        setKbValue(ref.value);
      } else {
        ref.value += char;
        setKbValue(ref.value);
      }
    };
    const handleKeyShift = () => {
      setIsShift((prev) => !prev);
    };
    const handleKeySym = () => {
      setIsSymbols((prev) => !prev);
    };
    window.addEventListener("vr-player-moved", handlePlayerMoved);
    window.addEventListener("vr-open-tab", handleOpenTab);
    window.addEventListener("vr-edit-field", handleEditField);
    window.addEventListener("vr-key-press", handleKeyPress);
    window.addEventListener("vr-key-shift", handleKeyShift);
    window.addEventListener("vr-key-sym", handleKeySym);
    return () => {
      window.removeEventListener("vr-player-moved", handlePlayerMoved);
      window.removeEventListener("vr-open-tab", handleOpenTab);
      window.removeEventListener("vr-edit-field", handleEditField);
      window.removeEventListener("vr-key-press", handleKeyPress);
      window.removeEventListener("vr-key-shift", handleKeyShift);
      window.removeEventListener("vr-key-sym", handleKeySym);
    };
  }, []);

  if (view === "vr") {
    // Register A-Frame custom components (idempotent)
    if (typeof AFRAME !== "undefined") {
      // --- STARK GRABBABLE: grab & move any element with laser ---
      if (!AFRAME.components["stark-grabbable"]) {
        AFRAME.registerComponent("stark-grabbable", {
          init() {
            this.grabbed = false;
            this.grabOffset = new THREE.Vector3();
            this.el.classList.add("grabbable");
            this.el.addEventListener("mousedown", (e) => {
              this.grabbed = true;
              this.el.setAttribute("material", "emissive", "#00f3ff");
              this.el.setAttribute(
                "material",
                "emissiveIntensity",
                "0.3",
              );
              this.lastIntersect = e.detail.intersection;
            });
            window.addEventListener("mouseup", () => {
              if (this.grabbed) {
                this.grabbed = false;
                this.el.setAttribute("material", "emissive", "#000000");
                this.el.setAttribute(
                  "material",
                  "emissiveIntensity",
                  "0",
                );
              }
            });
            this.el.addEventListener("mousemove", (e) => {
              if (!this.grabbed || !e.detail.intersection) return;
              const pos = e.detail.intersection.point;
              this.el.setAttribute(
                "position",
                `${pos.x.toFixed(2)} ${(parseFloat(this.el.getAttribute("position").y) || 1.5).toFixed(2)} ${pos.z.toFixed(2)}`,
              );
            });
          },
        });
      }
      // --- PLAYER TOKEN DRAG: move players on the tactic table & sync to React ---
      if (!AFRAME.components["player-drag"]) {
        AFRAME.registerComponent("player-drag", {
          schema: { playerId: { type: "number", default: 0 } },
          init() {
            this.grabbed = false;
            this.el.classList.add("draggable");
            this.el.addEventListener("mousedown", () => {
              this.grabbed = true;
            });
            window.addEventListener("mouseup", () => {
              this.grabbed = false;
            });
            this.el.addEventListener("mousemove", (e) => {
              if (!this.grabbed || !e.detail.intersection) return;
              const pt = e.detail.intersection.point;
              // Clamp to table bounds
              const x = Math.max(-2.2, Math.min(2.2, pt.x));
              const z = Math.max(-1.5, Math.min(1.5, pt.z));
              this.el.setAttribute(
                "position",
                `${x.toFixed(2)} 0.82 ${z.toFixed(2)}`,
              );
              // Sync back to React via custom event
              window.dispatchEvent(
                new CustomEvent("vr-player-moved", {
                  detail: {
                    id: this.data.playerId,
                    vrX: parseFloat(x.toFixed(2)),
                    vrZ: parseFloat(z.toFixed(2)),
                  },
                }),
              );
            });
          },
        });
      }
      // --- VR TELEPORT: click floor to move ---
      if (!AFRAME.components["vr-teleport"]) {
        AFRAME.registerComponent("vr-teleport", {
          init() {
            this.el.addEventListener("click", (e) => {
              if (!e.detail.intersection) return;
              const pt = e.detail.intersection.point;
              const rig = document.getElementById("vr-rig");
              if (rig)
                rig.setAttribute(
                  "position",
                  `${pt.x.toFixed(2)} 0 ${pt.z.toFixed(2)}`,
                );
            });
          },
        });
      }
      // --- VR PANEL CLICK → open 2D Dashboard tab ---
      if (!AFRAME.components["panel-link"]) {
        AFRAME.registerComponent("panel-link", {
          schema: { tab: { type: "string", default: "" } },
          init() {
            this.el.addEventListener("click", () => {
              window.dispatchEvent(
                new CustomEvent("vr-open-tab", {
                  detail: { tab: this.data.tab },
                }),
              );
            });
          },
        });
      }
      // --- VR EDITABLE FIELD: click to open keyboard and edit a value ---
      if (!AFRAME.components["vr-editable"]) {
        AFRAME.registerComponent("vr-editable", {
          schema: {
            field: { type: "string", default: "" },
            value: { type: "string", default: "" },
            playerId: { type: "number", default: -1 },
          },
          init() {
            this.el.classList.add("clickable");
            this.el.addEventListener("click", (e) => {
              // Stop propagation so parent panel-link doesn't fire!
              if (e.detail && e.detail.cursorEl) {
                // Common in A-Frame to stop bubbling on custom events
              }
              e.stopPropagation();

              const kb = document.getElementById("vr-keyboard");
              const rig = document.getElementById("vr-rig");
              const camera = document.querySelector("a-camera");

              if (kb && rig && camera) {
                // Get camera's world position and direction
                const worldPos = new THREE.Vector3();
                camera.object3D.getWorldPosition(worldPos);

                const direction = new THREE.Vector3(0, 0, -1);
                direction.applyQuaternion(
                  camera.object3D.getWorldQuaternion(
                    new THREE.Quaternion(),
                  ),
                );

                // Position keyboard 1.2m in front of camera
                const kbPos = worldPos
                  .clone()
                  .add(direction.multiplyScalar(1.2));

                kb.setAttribute(
                  "position",
                  `${kbPos.x} ${kbPos.y} ${kbPos.z}`,
                );

                // Rotate keyboard to face camera (y-axis only)
                const camRot = camera.getAttribute("rotation") || {
                  y: 0,
                };
                kb.setAttribute("rotation", `0 ${camRot.y} 0`);
                kb.setAttribute("visible", "true");
              }

              window.dispatchEvent(
                new CustomEvent("vr-edit-field", {
                  detail: {
                    field: this.data.field,
                    value: this.data.value,
                    playerId: this.data.playerId,
                  },
                }),
              );
            });
          },
        });
      }
      // --- VR KEYBOARD CONTROLLER: distribute key clicks to edit state ---
      if (!AFRAME.components["vr-key-handler"]) {
        AFRAME.registerComponent("vr-key-handler", {
          schema: { char: { type: "string", default: "" } },
          init() {
            this.el.classList.add("clickable");
            this.el.addEventListener("click", () => {
              if (this.data.char === "SHIFT") {
                window.dispatchEvent(new CustomEvent("vr-key-shift"));
              } else if (this.data.char === "SYM") {
                window.dispatchEvent(new CustomEvent("vr-key-sym"));
              } else {
                window.dispatchEvent(
                  new CustomEvent("vr-key-press", {
                    detail: { char: this.data.char },
                  }),
                );
              }
            });
          },
        });
      }

      // --- BOUNDARY CHECK: Keep user within a specific radius ---
      if (!AFRAME.components["boundary-check"]) {
        AFRAME.registerComponent("boundary-check", {
          schema: { radius: { type: "number", default: 15 } },
          tick() {
            const rig = this.el.parentNode; // The vr-rig
            if (!rig) return;
            const pos = rig.getAttribute("position");
            if (!pos) return;

            const dist = Math.sqrt(pos.x * pos.x + pos.z * pos.z);
            if (dist > this.data.radius) {
              // Calculate direction vector to center
              const factor = this.data.radius / dist;
              rig.setAttribute("position", {
                x: pos.x * factor,
                y: pos.y,
                z: pos.z * factor,
              });
            }
          },
        });
      }
    }

    return (
      <div className="w-screen h-screen relative bg-black">
        <button
          onClick={() => setView("dashboard")}
          className="absolute top-6 left-6 z-[100] bg-redbull border-2 border-transparent hover:border-white px-8 py-3 rounded font-black uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(226,27,77,0.7)] transition-all flex items-center gap-2 cursor-pointer"
        >
          <Icon name="log-out" /> Dash-Log
        </button>

        <a-scene
          xr-mode-ui="enabled: true"
          renderer="antialias: true; colorManagement: true"
          shadow="type: pcfsoft"
        >
          <a-assets>
            <canvas
              id="telestrator-texture"
              width="1280"
              height="720"
            ></canvas>
          </a-assets>

          {/* ========== STADIUM ATMOSPHERE: EXTREME HIGH-TECH STADIUM ========== */}
          <a-sky color="#050a1b"></a-sky>

          {/* Stadium Floodlights (4 corners) */}
          <a-entity position="-15 15 -15">
            <a-light
              type="spot"
              color="#fff"
              intensity="1.5"
              angle="45"
              target="#vr-pitch"
            ></a-light>
            <a-cylinder
              radius="0.2"
              height="15"
              color="#333"
            ></a-cylinder>
            <a-box
              width="2"
              height="1"
              depth="0.5"
              position="0 7.5 0"
              color="#111"
            >
              <a-sphere
                radius="0.1"
                position="-0.5 0 0.3"
                color="#fff"
                material="emissive: #fff; emissiveIntensity: 2"
              ></a-sphere>
              <a-sphere
                radius="0.1"
                position="0 0 0.3"
                color="#fff"
                material="emissive: #fff; emissiveIntensity: 2"
              ></a-sphere>
              <a-sphere
                radius="0.1"
                position="0.5 0 0.3"
                color="#fff"
                material="emissive: #fff; emissiveIntensity: 2"
              ></a-sphere>
            </a-box>
          </a-entity>
          <a-entity position="15 15 -15">
            <a-light
              type="spot"
              color="#fff"
              intensity="1.5"
              angle="45"
              target="#vr-pitch"
            ></a-light>
            <a-cylinder
              radius="0.2"
              height="15"
              color="#333"
            ></a-cylinder>
            <a-box
              width="2"
              height="1"
              depth="0.5"
              position="0 7.5 0"
              color="#111"
            >
              <a-sphere
                radius="0.1"
                position="-0.5 0 0.3"
                color="#fff"
                material="emissive: #fff; emissiveIntensity: 2"
              ></a-sphere>
              <a-sphere
                radius="0.1"
                position="0 0 0.3"
                color="#fff"
                material="emissive: #fff; emissiveIntensity: 2"
              ></a-sphere>
              <a-sphere
                radius="0.1"
                position="0.5 0 0.3"
                color="#fff"
                material="emissive: #fff; emissiveIntensity: 2"
              ></a-sphere>
            </a-box>
          </a-entity>

          {/* Distant Stadium Stands (Silhouettes) */}
          <a-entity position="0 0 -20">
            <a-box
              width="40"
              height="10"
              depth="1"
              color="#111"
              opacity="0.8"
            ></a-box>
            <a-text
              value="STARK ELITE ARENA"
              align="center"
              position="0 6 0.6"
              color="#00f3ff"
              width="30"
              font="exo2bold"
              opacity="0.3"
            ></a-text>
          </a-entity>

          {/* ========== NEON-CYAN FLOOR GRID ========== */}
          <a-entity position="0 0 0" rotation="-90 0 0">
            <a-grid
              width="100"
              height="100"
              color="#00f3ff"
              opacity="0.05"
              cell-size="2"
            ></a-grid>
          </a-entity>
          <a-plane
            position="0 0.01 0"
            rotation="-90 0 0"
            width="100"
            height="100"
            opacity="0.01"
            class="teleport-floor"
            vr-teleport
          ></a-plane>

          {/* ========== AMBIENT + ACCENT LIGHTING ========== */}
          <a-light
            type="ambient"
            color="#1a202c"
            intensity="1.2"
          ></a-light>
          <a-light
            type="point"
            position="0 8 0"
            color="#00f3ff"
            intensity="1.2"
            distance="30"
          ></a-light>

          {/* ========== CAMERA RIG ========== */}
          <a-entity
            id="vr-rig"
            position={vrPerspective === "commander" ? "0 4 0" : "0 0 2"}
            rotation={vrPerspective === "commander" ? "-45 0 0" : "0 0 0"}
            movement-controls="controls: gamepad,keyboard,touch; constrainToNavMesh: true; speed: 0.15"
            boundary-check="radius: 18"
          >
            <a-camera
              position="0 1.6 0"
              look-controls="pointerLockEnabled: false"
            >
              <a-entity
                cursor="rayOrigin: mouse;"
                raycaster="objects: .clickable, .draggable, .teleport-floor"
              ></a-entity>
              <a-entity
                id="vr-cursor"
                cursor="fuse: false"
                raycaster="objects: .clickable, .draggable, .teleport-floor"
                position="0 0 -1"
                geometry="primitive: ring; radiusInner: 0.02; radiusOuter: 0.03"
                material="color: #00f3ff; shader: flat; opacity: 0.8"
                animation__click="property: scale; startEvents: click; easing: easeInCubic; dur: 150; from: 0.1 0.1 0.1; to: 1 1 1"
              ></a-entity>
            </a-camera>

            <a-entity
              hand-controls="hand: left"
              laser-controls="hand: left"
              raycaster="objects: .clickable, .draggable, .teleport-floor"
              line="color: #00f3ff; opacity: 0.5"
            ></a-entity>
            <a-entity
              hand-controls="hand: right"
              laser-controls="hand: right"
              raycaster="objects: .clickable, .draggable, .teleport-floor"
              line="color: #00f3ff; opacity: 0.5"
            ></a-entity>
          </a-entity>

          {/* ========== VR UI OVERLAYS ========== */}
          {/* Perspective Toggle Button (Floating in front of rig) */}
          <a-entity position="0 1 -3">
            <a-plane
              width="1.8"
              height="0.4"
              color="#111"
              opacity="0.8"
              class="clickable"
              onClick={() => setVrPerspective(p => p === "commander" ? "ego" : "commander")}
            >
              <a-text
                value={`SWITCH TO ${vrPerspective === "commander" ? "EGO" : "COMMANDER"} VIEW`}
                align="center"
                position="0 0 0.01"
                color="#00f3ff"
                font="exo2bold"
              ></a-text>
            </a-plane>
          </a-entity>

          {/* ========== CENTRAL TACTICAL PITCH (0 0 0) ========== */}
          <a-entity
            id="vr-pitch"
            position="0 0.8 0"
            scale={vrPerspective === "ego" ? "5 5 5" : "1 1 1"}
            animation={vrPerspective === "ego" ? "property: position; to: 0 0.01 0; dur: 1000; easing: easeOutQuad" : "property: position; to: 0 0.8 0; dur: 1000; easing: easeOutQuad"}
          >
            {/* Table Base & Glowing Rim (Hide base in ego mode so we just have pitch lines) */}
            <a-cylinder
              radius="2.3"
              height="0.1"
              color="#111"
              metalness="0.5"
              roughness="0.5"
              visible={vrPerspective === "commander"}
            >
              <a-ring
                radius-inner="2.2"
                radius-outer="2.25"
                position="0 0.051 0"
                rotation="-90 0 0"
                color="#00f3ff"
                material="emissive: #00f3ff; emissiveIntensity: 2; opacity: 0.5"
              ></a-ring>
            </a-cylinder>
            {isOptimizing && (
              <a-text
                value="KI-OPTIMIERUNG LÄUFT..."
                align="center"
                position="0 1.2 0"
                color="#00f3ff"
                font="exo2bold"
                width="3"
                animation="property: opacity; from: 0.3; to: 1; dur: 500; loop: true"
              ></a-text>
            )}
            {isOptimizing && (
              <a-ring
                radius-inner="2.3"
                radius-outer="2.4"
                rotation="-90 0 0"
                position="0 0.06 0"
                color="#00f3ff"
                animation="property: opacity; from: 0.1; to: 0.8; dur: 500; loop: true"
              ></a-ring>
            )}

            {/* The High-Fidelity Pitch */}
            <a-plane
              width="4"
              height="2.8"
              rotation="-90 0 0"
              position="0 0.051 0"
              color="#0d2b1d"
            >
              {/* Boundary White Lines */}
              <a-plane
                width="3.8"
                height="0.02"
                position="0 1.35 0.01"
                color="#fff"
                opacity="0.8"
              ></a-plane>{" "}
              {/* Top */}
              <a-plane
                width="3.8"
                height="0.02"
                position="0 -1.35 0.01"
                color="#fff"
                opacity="0.8"
              ></a-plane>{" "}
              {/* Bottom */}
              <a-plane
                width="0.02"
                height="2.72"
                position="1.9 0 0.01"
                color="#fff"
                opacity="0.8"
              ></a-plane>{" "}
              {/* Right Goal Line */}
              <a-plane
                width="0.02"
                height="2.72"
                position="-1.9 0 0.01"
                color="#fff"
                opacity="0.8"
              ></a-plane>{" "}
              {/* Left Goal Line */}
              {/* Midfield & Center Circle */}
              <a-plane
                width="0.02"
                height="2.72"
                position="0 0 0.01"
                color="#fff"
                opacity="0.6"
              ></a-plane>
              <a-ring
                radius-inner="0.39"
                radius-outer="0.41"
                position="0 0 0.01"
                color="#fff"
                opacity="0.6"
              ></a-ring>
              <a-circle
                radius="0.03"
                position="0 0 0.02"
                color="#fff"
              ></a-circle>
              {/* Penalty Area (Left) - 16m Box */}
              <a-plane
                width="0.6"
                height="0.02"
                position="-1.6 0.7 0.01"
                color="#fff"
              ></a-plane>
              <a-plane
                width="0.6"
                height="0.02"
                position="-1.6 -0.7 0.01"
                color="#fff"
              ></a-plane>
              <a-plane
                width="0.02"
                height="1.42"
                position="-1.3 0 0.01"
                color="#fff"
              ></a-plane>
              {/* Goal Area (Left) - 5m Box */}
              <a-plane
                width="0.2"
                height="0.02"
                position="-1.8 0.35 0.01"
                color="#fff"
              ></a-plane>
              <a-plane
                width="0.2"
                height="0.02"
                position="-1.8 -0.35 0.01"
                color="#fff"
              ></a-plane>
              <a-plane
                width="0.02"
                height="0.72"
                position="-1.7 0 0.01"
                color="#fff"
              ></a-plane>
              {/* Penalty Area (Right) - 16m Box */}
              <a-plane
                width="0.6"
                height="0.02"
                position="1.6 0.7 0.01"
                color="#fff"
              ></a-plane>
              <a-plane
                width="0.6"
                height="0.02"
                position="1.6 -0.7 0.01"
                color="#fff"
              ></a-plane>
              <a-plane
                width="0.02"
                height="1.42"
                position="1.3 0 0.01"
                color="#fff"
              ></a-plane>
              {/* Goal Area (Right) - 5m Box */}
              <a-plane
                width="0.2"
                height="0.02"
                position="1.8 0.35 0.01"
                color="#fff"
              ></a-plane>
              <a-plane
                width="0.2"
                height="0.02"
                position="1.8 -0.35 0.01"
                color="#fff"
              ></a-plane>
              <a-plane
                width="0.02"
                height="0.72"
                position="1.7 0 0.01"
                color="#fff"
              ></a-plane>
              {/* Penalty Arcs */}
              <a-ring
                radius-inner="0.39"
                radius-outer="0.41"
                theta-start="-70"
                theta-length="140"
                position="-1.3 0 0.01"
                color="#fff"
                opacity="0.4"
              ></a-ring>
              <a-ring
                radius-inner="0.39"
                radius-outer="0.41"
                theta-start="110"
                theta-length="140"
                position="1.3 0 0.01"
                color="#fff"
                opacity="0.4"
              ></a-ring>
            </a-plane>

            {/* Miniature 3D Goals */}
            <a-entity position="-1.9 0.06 0">
              <a-box
                width="0.02"
                height="0.15"
                depth="0.5"
                position="0 0.075 0"
                color="#fff"
                material="wireframe: true; opacity: 0.5"
              ></a-box>
              <a-plane
                width="0.5"
                height="0.15"
                position="0.01 0.075 0"
                rotation="0 90 0"
                color="#fff"
                material="wireframe: true; opacity: 0.3"
              ></a-plane>
            </a-entity>
            <a-entity position="1.9 0.06 0">
              <a-box
                width="0.02"
                height="0.15"
                depth="0.5"
                position="0 0.075 0"
                color="#fff"
                material="wireframe: true; opacity: 0.5"
              ></a-box>
              <a-plane
                width="0.5"
                height="0.15"
                position="-0.01 0.075 0"
                rotation="0 -90 0"
                color="#fff"
                material="wireframe: true; opacity: 0.3"
              ></a-plane>
            </a-entity>

            {Object.entries(playerPositions).map(([id, pos]) => {
              const p = players.find(
                (player) => player.id === parseInt(id),
              );
              if (!p) return null;
              // Mapping: 2dX (0..420) -> vrX (-2..2), 2dY (0..640) -> vrZ (-1.4..1.4)
              const vrX = (pos.x / 420) * 4 - 2;
              const vrZ = (pos.y / 640) * 2.8 - 1.4;
              const isInjured = p.isInjured;
              const color = isInjured ? "#E21B4D" : "#00f3ff";
              return (
                <a-entity
                  key={`token-${p.id}`}
                  position={`${vrX} 0.05 ${vrZ}`}
                  player-drag={`playerId: ${p.id}`}
                  class="draggable"
                >
                  <a-cylinder
                    radius="0.08"
                    height="0.02"
                    color={color}
                    material={`emissive: ${color}; emissiveIntensity: 0.5`}
                  ></a-cylinder>
                  <a-text
                    value={p.name ? p.name.substring(0, 10) : "?"}
                    align="center"
                    position="0 0.1 0"
                    rotation="-45 0 0"
                    color="#ffffff"
                    font="exo2bold"
                    width="1.2"
                  ></a-text>
                  <a-text
                    value={p.position}
                    align="center"
                    position="0 0.04 0"
                    rotation="-90 0 0"
                    color="#000"
                    font="exo2bold"
                    width="0.8"
                  ></a-text>
                </a-entity>
              );
            })}

            {/* Opponents in VR */}
            {isActive &&
              Object.entries(opponentPositions).map(([id, pos]) => {
                const vrX = (pos.x / 420) * 4 - 2;
                const vrZ = (pos.y / 640) * 2.8 - 1.4;
                return (
                  <a-entity key={id} position={`${vrX} 0.05 ${vrZ}`}>
                    <a-cylinder
                      radius="0.07"
                      height="0.02"
                      color="#600"
                      material="emissive: #E21B4D; emissiveIntensity: 0.3"
                    ></a-cylinder>
                    <a-text
                      value="X"
                      align="center"
                      position="0 0.04 0"
                      rotation="-90 0 0"
                      color="#E21B4D"
                      font="exo2bold"
                      width="1"
                    ></a-text>
                  </a-entity>
                );
              })}

            {/* Predictive Reactions in VR */}
            {opponentReactions.map((r, i) => {
              const v1 = {
                x: (r.from.x / 420) * 4 - 2,
                z: (r.from.y / 640) * 2.8 - 1.4,
              };
              const v2 = {
                x: (r.to.x / 420) * 4 - 2,
                z: (r.to.y / 640) * 2.8 - 1.4,
              };
              return (
                <a-entity
                  key={`vr-react-${i}`}
                  line={`start: ${v1.x} 0.051 ${v1.z}; end: ${v2.x} 0.051 ${v2.z}; color: #E21B4D; opacity: 1`}
                ></a-entity>
              );
            })}

            {/* Drawings in VR (Vektorgrafik) */}
            {drawingPaths.map((path, idx) => (
              <a-entity key={`vr-path-${idx}`}>
                {path.points.map((p, i) => {
                  if (i === 0) return null;
                  const p1 = path.points[i - 1];
                  const p2 = p;
                  const v1 = {
                    x: (p1.x / 420) * 4 - 2,
                    z: (p1.y / 640) * 2.8 - 1.4,
                  };
                  const v2 = {
                    x: (p2.x / 420) * 4 - 2,
                    z: (p2.y / 640) * 2.8 - 1.4,
                  };
                  const color =
                    path.mode === "run" ? "#ffffff" : "#00f3ff";
                  return (
                    <a-entity
                      key={`seg-${i}`}
                      line={`start: ${v1.x} 0.01 ${v1.z}; end: ${v2.x} 0.01 ${v2.z}; color: ${color}; opacity: 0.8`}
                    ></a-entity>
                  );
                })}
              </a-entity>
            ))}
          </a-entity>

          {/* ========== VIRTUAL GERD (AVATAR) ========== */}
          <a-entity
            id="gerd-avatar"
            position="-3 0 -2"
            rotation="0 45 0"
            class="clickable"
            onClick={() => {
              const readiness = players.reduce(
                (sum, p) => sum + (p.status === "injured" ? 0 : 1),
                0,
              );
              gerdSpeak(
                `Hallo in der VR Umgebung! Der Kader hat eine Bereitschaft von ${Math.round((readiness / players.length) * 100)} Prozent. Wir sind bereit für ${clubIdentity.name || "den Audit"}.`,
                "Trainer-Gerd",
              );
            }}
          >
            {/* Body */}
            <a-cylinder
              radius="0.25"
              height="1.6"
              color="#001a33"
              position="0 0.8 0"
            ></a-cylinder>
            {/* Head */}
            <a-sphere
              radius="0.2"
              position="0 1.8 0"
              color="#ffdbac"
            ></a-sphere>
            {/* Glow Ring */}
            <a-ring
              radius-inner="0.3"
              radius-outer="0.4"
              rotation="-90 0 0"
              position="0 0.01 0"
              color="#00f3ff"
              animation="property: scale; from: 1 1 1; to: 1.2 1.2 1.2; dur: 2000; loop: true; dir: alternate"
            ></a-ring>
            <a-text
              value="TRAINER GERD"
              align="center"
              position="0 2.2 0"
              color="#00f3ff"
              font="exo2bold"
              width="4"
            ></a-text>
            <a-text
              value="CLICK FOR BRIEFING"
              align="center"
              position="0 2.0 0"
              color="#fff"
              width="2"
              opacity="0.6"
            ></a-text>
          </a-entity>

          {/* ========== FRONT (0 2 -8): VIDEO HUB & TELESTRATOR ========== */}
          <a-entity
            position="0 2 -8"
            rotation="0 0 0"
            scale="2.2 2.2 2.2"
          >
            <a-plane
              width="6"
              height="3.5"
              color="#000"
              opacity="0.2"
              material="transparent: true; metalness: 0.8; roughness: 0.1"
            >
              <a-plane
                width="6.1"
                height="3.6"
                position="0 0 -0.01"
                color="#00f3ff"
                opacity="0.3"
              ></a-plane>
              <a-text
                value="◈ VIDEO HUB & TELESTRATOR"
                align="center"
                position="0 1.9 0.01"
                color="#00f3ff"
                font="exo2bold"
                width="8"
              ></a-text>
              <a-plane
                width="5.5"
                height="2.8"
                position="0 0 0.01"
                src="#telestrator-texture"
                material="shader: flat; transparent: true"
              ></a-plane>
              <a-plane
                width="2.5"
                height="0.4"
                position="0 -2.1 0.01"
                color="#00f3ff"
                opacity="0.6"
                class="clickable"
                panel-link="tab: video"
              >
                <a-text
                  value="OPEN 2D ANALYSIS"
                  align="center"
                  position="0 0 0.01"
                  color="#000"
                  font="exo2bold"
                  width="4"
                ></a-text>
              </a-plane>
            </a-plane>
          </a-entity>

          {/* ========== HALBRECHTS (6 2 -6): GERD AI STATUS ========== */}
          <a-entity position="6 2 -6" rotation="0 -45 0" scale="2 2 2">
            <a-plane
              width="4"
              height="2.5"
              color="#000"
              opacity="0.3"
              material="transparent: true"
            >
              <a-plane
                width="4.1"
                height="2.6"
                position="0 0 -0.01"
                color="#00f3ff"
                opacity="0.2"
              ></a-plane>
              <a-text
                value="◈ GERD AI STATUS FEED"
                align="center"
                position="0 1.4 0.01"
                color="#00f3ff"
                font="exo2bold"
                width="6"
              ></a-text>
              <a-entity position="0 0.2 0.02">
                {aiLogs.slice(0, 5).map((log, i) => (
                  <a-text
                    key={`vr-log-${log.id}`}
                    value={`> ${log.text.substring(0, 45)}`}
                    position={`-1.8 ${0.6 - i * 0.3} 0`}
                    color="#fff"
                    width="4"
                    font="monoid"
                  ></a-text>
                ))}
              </a-entity>
              <a-text
                value="STATUS: OPTIMIZING NEURAL PATHS..."
                align="center"
                position="0 -1.0 0.01"
                color="#00f3ff"
                width="4"
                opacity="0.6"
              ></a-text>
            </a-plane>
          </a-entity>

          {/* ========== HALBLINKS (-6 2 -6): MEDICAL LAB & SQUAD ========== */}
          <a-entity position="-6 2 -6" rotation="0 45 0" scale="2 2 2">
            <a-plane
              width="5"
              height="3.5"
              color="#000"
              opacity="0.2"
              material="transparent: true"
            >
              <a-plane
                width="5.1"
                height="3.6"
                position="0 0 -0.01"
                color="#E21B4D"
                opacity="0.3"
              ></a-plane>
              <a-text
                value="◈ MEDICAL LAB OVERVIEW"
                align="center"
                position="0 1.9 0.01"
                color="#E21B4D"
                font="exo2bold"
                width="8"
              ></a-text>
              <a-entity
                position="0 0 0.02"
                layout="type: column; margin: 0.3"
              >
                <a-text
                  value={`INJURED PLAYERS: ${players.filter((p) => p.status === "injured").length}`}
                  align="center"
                  position="0 0.5 0"
                  color="#E21B4D"
                  width="6"
                ></a-text>
                <a-text
                  value="BIOMETRIC FEED: ACTIVE"
                  align="center"
                  position="0 0"
                  color="#00ff88"
                  width="5"
                ></a-text>
              </a-entity>
              <a-plane
                width="2.5"
                height="0.4"
                position="0 -2.1 0.01"
                color="#E21B4D"
                opacity="0.6"
                class="clickable"
                panel-link="tab: medical"
              >
                <a-text
                  value="VITAL CORE"
                  align="center"
                  position="0 0 0.01"
                  color="#fff"
                  font="exo2bold"
                  width="4"
                ></a-text>
              </a-plane>
            </a-plane>
          </a-entity>

          {/* ========== RECHTS AUSSEN (8 2 0): CFO BOARD & SUITCASE ========== */}
          <a-entity position="8 2 0" rotation="0 -90 0" scale="2 2 2">
            <a-plane
              width="5"
              height="4.5"
              color="#000"
              opacity="0.2"
              material="transparent: true"
            >
              <a-plane
                width="5.1"
                height="4.6"
                position="0 0 -0.01"
                color="#d4af37"
                opacity="0.3"
              ></a-plane>
              <a-text
                value="◈ CFO MANAGEMENT DASHBOARD"
                align="center"
                position="0 2.4 0.01"
                color="#d4af37"
                font="exo2bold"
                width="8"
              ></a-text>

              <a-entity position="0 1.2 0.02">
                <a-text
                  value={`BUDGET: € ${(budget / 1000000).toFixed(2)}M`}
                  align="center"
                  position="0 0.5 0"
                  color="#d4af37"
                  font="exo2bold"
                  width="7"
                ></a-text>
                <a-plane
                  width="3"
                  height="0.4"
                  position="0 -0.2 0"
                  color="#d4af3720"
                  opacity="0.8"
                  class="clickable"
                  vr-editable={`field: budget; value: ${(budget / 1000000).toFixed(2)}`}
                >
                  <a-text
                    value="✎ EDIT BUDGET"
                    align="center"
                    position="0 0 0.01"
                    color="#d4af37"
                    width="4"
                  ></a-text>
                </a-plane>
              </a-entity>

              {/* AI COMMUNICATION STATUS IN VR */}
              <a-entity position="0 -0.5 0.02">
                <a-plane
                  width="4.5"
                  height="1.8"
                  color="#111"
                  opacity="0.8"
                  material="transparent: true"
                >
                  <a-text
                    value="◈ KI COMMUNICATION HUB"
                    align="center"
                    position="0 0.7 0.01"
                    color="#redbull"
                    font="exo2bold"
                    width="5"
                  ></a-text>

                  {commLoading ? (
                    <a-text
                      value="GERD IS FORMULATING..."
                      align="center"
                      position="0 0.1 0.01"
                      color="#fff"
                      width="4"
                      font="monoid"
                      opacity="0.8"
                    >
                      <a-animation
                        attribute="opacity"
                        from="0.3"
                        to="1"
                        dur="1000"
                        repeat="indefinite"
                      ></a-animation>
                    </a-text>
                  ) : (
                    <a-entity>
                      <a-text
                        value={`SCENARIO: ${commScenario.toUpperCase()}`}
                        align="center"
                        position="0 0.2 0.01"
                        color="#fff"
                        width="3.5"
                        font="monoid"
                        opacity="0.6"
                      ></a-text>
                      <a-text
                        value={
                          commEmail ? "BLUEPRINT READY" : "SYSTEM IDLE"
                        }
                        align="center"
                        position="0 -0.2 0.01"
                        color={commEmail ? "#00ff88" : "#fff"}
                        width="4"
                        font="exo2bold"
                      ></a-text>
                    </a-entity>
                  )}
                </a-plane>
              </a-entity>

              <a-plane
                width="2.5"
                height="0.4"
                position="0 -2.6 0.01"
                color="#d4af37"
                opacity="0.6"
                class="clickable"
                panel-link="tab: cfo"
              >
                <a-text
                  value="FINANCIAL HUB"
                  align="center"
                  position="0 0 0.01"
                  color="#000"
                  font="exo2bold"
                  width="4"
                ></a-text>
              </a-plane>
            </a-plane>
          </a-entity>

          {/* ========== BACK (0 2 8): PERFORMANCE JOURNAL & NLZ ========== */}
          <a-entity
            position="0 2 8"
            rotation="0 180 0"
            scale="2.2 2.2 2.2"
          >
            <a-plane
              width="6"
              height="4"
              color="#000"
              opacity="0.2"
              material="transparent: true"
            >
              <a-plane
                width="6.1"
                height="4.1"
                position="0 0 -0.01"
                color="#fff"
                opacity="0.3"
              ></a-plane>
              <a-text
                value="◈ PERFORMANCE JOURNAL & NLZ"
                align="center"
                position="0 2.2 0.01"
                color="#fff"
                font="exo2bold"
                width="8"
              ></a-text>
              <a-entity position="0 0.2 0.02">
                <a-text
                  value={journal ? journal.title : "NO ACTIVE JOURNAL"}
                  align="center"
                  position="0 0.5 0"
                  color="#redbull"
                  font="exo2bold"
                  width="5"
                ></a-text>
                {youthPlayers.slice(0, 5).map((yp, i) => (
                  <a-text
                    key={`nlz-vr-${yp.id}`}
                    value={`TALENT: ${yp.name ? yp.name.substring(0, 12) : ""} | OVR:${Math.round(((yp.pac || 60) + (yp.sho || 60)) / 2)}`}
                    align="center"
                    position={`0 ${-0.1 - i * 0.3} 0`}
                    color="#ffffff"
                    width="4"
                    opacity="0.8"
                  ></a-text>
                ))}
              </a-entity>
              <a-plane
                width="2.5"
                height="0.4"
                position="0 -2.3 0.01"
                color="#fff"
                opacity="0.6"
                class="clickable"
                panel-link="tab: journal"
              >
                <a-text
                  value="OPEN MAGAZINE"
                  align="center"
                  position="0 0 0.01"
                  color="#000"
                  font="exo2bold"
                  width="4"
                ></a-text>
              </a-plane>
            </a-plane>
          </a-entity>

          {/* ========== NAVIGATION RIG ========== */}
          <a-entity
            id="vr-rig"
            position="0 0 2"
            movement-controls="controls: keyboard, gamepad; speed: 0.2; fly: false; acceleration: 20"
          >
            <a-entity
              camera
              position="0 1.6 0"
              look-controls="pointerLockEnabled: false"
            >
              <a-cursor
                color="#00f3ff"
                fuse="false"
                raycaster="objects: .clickable, .draggable, .teleport-floor"
              ></a-cursor>
            </a-entity>

            <a-entity
              laser-controls="hand: left"
              raycaster="objects: .clickable, .draggable, .teleport-floor; far: 20"
              line="color: #00f3ff; opacity: 0.7"
            ></a-entity>
            <a-entity
              laser-controls="hand: right"
              raycaster="objects: .clickable, .draggable, .teleport-floor; far: 20"
              line="color: #E21B4D; opacity: 0.7"
            ></a-entity>
          </a-entity>

          {/* VIRTUAL KEYBOARD */}
          <a-entity
            id="vr-keyboard"
            position="0 1.5 -1.5"
            rotation="-15 0 0"
            visible="false"
          >
            {/* Glass Backboard with Glowing Border */}
            <a-plane
              width="2.4"
              height="1.6"
              color="#000d1a"
              opacity="0.85"
              material="transparent: true; metalness: 0.6; roughness: 0.1"
            >
              <a-entity line="start: -1.2 0.8 0.01; end: 1.2 0.8 0.01; color: #00f3ff; opacity: 0.5"></a-entity>
              <a-entity line="start: -1.2 -0.8 0.01; end: 1.2 -0.8 0.01; color: #00f3ff; opacity: 0.5"></a-entity>
              <a-entity line="start: -1.2 0.8 0.01; end: -1.2 -0.8 0.01; color: #00f3ff; opacity: 0.5"></a-entity>
              <a-entity line="start: 1.2 0.8 0.01; end: 1.2 -0.8 0.01; color: #00f3ff; opacity: 0.5"></a-entity>

              <a-text
                value="◈ NEURAL INTERFACE | STARK INPUT"
                align="center"
                position="0 0.72 0.02"
                color="#00f3ff"
                width="3.5"
                font="exo2bold"
              ></a-text>

              {/* DISPLAY BAR: Shows current typed text */}
              <a-plane
                width="2.0"
                height="0.22"
                position="0 0.52 0.01"
                color="#000"
                opacity="0.6"
                material="transparent: true"
              >
                <a-text
                  value={kbValue || "TYPE SOMETHING..."}
                  align="left"
                  position="-0.95 0 0.02"
                  color={kbValue ? "#ffffff" : "#00f3ff40"}
                  width="2.8"
                  font="monoid"
                ></a-text>
                <a-plane
                  width="0.01"
                  height="0.14"
                  position={kbValue.length * 0.045 - 0.92 || -0.92}
                  color="#00f3ff"
                  animation="property: opacity; from: 1; to: 0; dur: 500; loop: true"
                ></a-plane>
              </a-plane>
            </a-plane>

            {/* KEY DEFINITIONS */}
            {(() => {
              let rows = [];
              if (isSymbols) {
                rows = [
                  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
                  ["!", "@", "#", "$", "%", "^", "&", "*", "(", ")"],
                  ["-", "_", "=", "+", "[", "]", "{", "}", ";", ":"],
                  ['"', "'", ",", ".", "/", "?", "|", "\\", "<", ">"],
                  ["SYM", "SPACE", "BACK", "CLOSE"],
                ];
              } else {
                rows = isShift
                  ? [
                    "1234567890".split(""),
                    "QWERTYUIOP".split(""),
                    "ASDFGHJKL".split(""),
                    "ZXCVBNM".split(""),
                    ["SHIFT", "SYM", "SPACE", "BACK", "CLOSE"],
                  ]
                  : [
                    "1234567890".split(""),
                    "qwertyuiop".split(""),
                    "asdfghjkl".split(""),
                    "zxcvbnm".split(""),
                    ["SHIFT", "SYM", "SPACE", "BACK", "CLOSE"],
                  ];
              }

              return rows.map((row, rowIdx) => {
                const yPos = 0.25 - rowIdx * 0.22;
                return row.map((char, charIdx) => {
                  const totalChars = row.length;
                  const xPos = (charIdx - (totalChars - 1) / 2) * 0.22;

                  // Special handling for width of control keys
                  let width = 0.2;
                  let actualChar = char;
                  let displayChar = char;
                  let color = "#1a2a4a";
                  let textColor = "#00f3ff";

                  if (char === "SPACE") {
                    width = 0.6;
                    actualChar = "SPACE";
                    displayChar = "[ SPACE ]";
                  }
                  if (char === "BACK") {
                    width = 0.3;
                    actualChar = "BACKSPACE";
                    displayChar = "DEL";
                    color = "#3c1a1a";
                  }
                  if (char === "SHIFT") {
                    width = 0.3;
                    actualChar = "SHIFT";
                    displayChar = isShift ? "abc" : "ABC";
                    color = isShift ? "#00f3ff" : "#1a2a4a";
                    textColor = isShift ? "#000" : "#00f3ff";
                  }
                  if (char === "SYM") {
                    width = 0.3;
                    actualChar = "SYM";
                    displayChar = isSymbols ? "abc" : "SYM";
                    color = isSymbols ? "#00f3ff" : "#1a2a4a";
                    textColor = isSymbols ? "#000" : "#00f3ff";
                  }
                  if (char === "CLOSE") {
                    width = 0.3;
                    actualChar = "CLOSE";
                    displayChar = "DONE";
                    color = "#103c10";
                    textColor = "#00ff88";
                  }

                  return (
                    <a-entity
                      key={`row-${rowIdx}-char-${charIdx}`}
                      position={`${xPos} ${yPos} 0.05`}
                    >
                      <a-box
                        width={width}
                        height="0.18"
                        depth="0.04"
                        color={color}
                        class="clickable"
                        vr-key-handler={`char: ${actualChar}`}
                        animation__mousedown="property: position; to: 0 0 -0.02; dur: 50; startEvents: mousedown"
                        animation__mouseup="property: position; to: 0 0 0; dur: 50; startEvents: mouseup"
                        animation__mouseenter="property: scale; to: 1.05 1.05 1.05; dur: 100"
                        animation__mouseleave="property: scale; to: 1 1 1; dur: 100"
                        material="emissive: #00f3ff; emissiveIntensity: 0.1"
                      >
                        <a-text
                          value={displayChar}
                          align="center"
                          position="0 0 0.03"
                          color={textColor}
                          width={width * 7}
                          font="monoid"
                        ></a-text>
                      </a-box>
                    </a-entity>
                  );
                });
              });
            })()}
          </a-entity>
        </a-scene>
      </div>
    );
  }

  const syncYouTube = async () => {
    if (!ytPlaylistId.trim()) return;
    setIsSyncing(true);
    try {
      const res = await fetch(
        `http://localhost:3001/api/youtube/playlist?playlistId=${ytPlaylistId}`,
      );
      const data = await res.json();
      if (data.ok) {
        const newPlaylist = data.items.map((item) => ({
          title: item.title,
          url: item.url,
          isYouTube: true,
          isLocal: false,
          analysis: item.analysis,
        }));
        setPlaylist((prev) =>
          [...newPlaylist, ...prev.filter((c) => !c.isYouTube)].slice(
            0,
            15,
          ),
        );
        setIsSyncModalOpen(false);
        gerdSpeak(
          "YouTube-Playliste erfolgreich synchronisiert. Die Analysen liegen bereit.",
          "Manager-Gerd",
        );
      } else {
        alert("Fehler: " + data.error);
      }
    } catch (e) {
      alert("Verbindung zum Proxy fehlgeschlagen.");
    } finally {
      setIsSyncing(false);
    }
  };

  // 2D DASHBOARD RENDER
  return (
    <div className={`app-root w-full h-full relative ${championsMode ? "champions-mode-active" : ""}`}>
      <div
        className={`h-screen flex flex-col md:flex-row bg-[#000000] relative overflow-hidden transition-all duration-700 ${gerdThinking ? "ai-pulse-active" : ""} ${championsMode ? "border-t-[4px] border-redbull" : ""}`}
      >
        <NeuralBackground />
        {/* SetupWizard Overlay */}
        {!hasOnboarded && (
          <SetupWizard
            onComplete={(data) => {
              // ── 1. Formation coordinate mapper ────────────────────
              const getFormationPositions = (formation, fw, fh) => {
                const f = (formation || '4-4-2').replace(/\s/g, '');
                const maps = {
                  '4-4-2': [
                    { pos: 'GK', x: fw * .50, y: fh * .05 },
                    { pos: 'LB', x: fw * .10, y: fh * .25 }, { pos: 'CB', x: fw * .33, y: fh * .22 }, { pos: 'CB', x: fw * .67, y: fh * .22 }, { pos: 'RB', x: fw * .90, y: fh * .25 },
                    { pos: 'LM', x: fw * .10, y: fh * .48 }, { pos: 'CM', x: fw * .33, y: fh * .46 }, { pos: 'CM', x: fw * .67, y: fh * .46 }, { pos: 'RM', x: fw * .90, y: fh * .48 },
                    { pos: 'ST', x: fw * .38, y: fh * .75 }, { pos: 'ST', x: fw * .62, y: fh * .75 },
                  ],
                  '4-3-3': [
                    { pos: 'GK', x: fw * .50, y: fh * .05 },
                    { pos: 'LB', x: fw * .10, y: fh * .25 }, { pos: 'CB', x: fw * .33, y: fh * .22 }, { pos: 'CB', x: fw * .67, y: fh * .22 }, { pos: 'RB', x: fw * .90, y: fh * .25 },
                    { pos: 'CM', x: fw * .25, y: fh * .50 }, { pos: 'CM', x: fw * .50, y: fh * .47 }, { pos: 'CM', x: fw * .75, y: fh * .50 },
                    { pos: 'LW', x: fw * .10, y: fh * .78 }, { pos: 'ST', x: fw * .50, y: fh * .80 }, { pos: 'RW', x: fw * .90, y: fh * .78 },
                  ],
                  '4-2-3-1': [
                    { pos: 'GK', x: fw * .50, y: fh * .05 },
                    { pos: 'LB', x: fw * .10, y: fh * .22 }, { pos: 'CB', x: fw * .33, y: fh * .20 }, { pos: 'CB', x: fw * .67, y: fh * .20 }, { pos: 'RB', x: fw * .90, y: fh * .22 },
                    { pos: 'CDM', x: fw * .37, y: fh * .40 }, { pos: 'CDM', x: fw * .63, y: fh * .40 },
                    { pos: 'LW', x: fw * .12, y: fh * .60 }, { pos: 'CAM', x: fw * .50, y: fh * .58 }, { pos: 'RW', x: fw * .88, y: fh * .60 },
                    { pos: 'ST', x: fw * .50, y: fh * .78 },
                  ],
                  '3-4-3': [
                    { pos: 'GK', x: fw * .50, y: fh * .05 },
                    { pos: 'CB', x: fw * .22, y: fh * .22 }, { pos: 'CB', x: fw * .50, y: fh * .20 }, { pos: 'CB', x: fw * .78, y: fh * .22 },
                    { pos: 'LM', x: fw * .08, y: fh * .48 }, { pos: 'CM', x: fw * .33, y: fh * .46 }, { pos: 'CM', x: fw * .67, y: fh * .46 }, { pos: 'RM', x: fw * .92, y: fh * .48 },
                    { pos: 'LW', x: fw * .12, y: fh * .76 }, { pos: 'ST', x: fw * .50, y: fh * .80 }, { pos: 'RW', x: fw * .88, y: fh * .76 },
                  ],
                  '3-5-2': [
                    { pos: 'GK', x: fw * .50, y: fh * .05 },
                    { pos: 'CB', x: fw * .22, y: fh * .22 }, { pos: 'CB', x: fw * .50, y: fh * .20 }, { pos: 'CB', x: fw * .78, y: fh * .22 },
                    { pos: 'LM', x: fw * .05, y: fh * .50 }, { pos: 'CM', x: fw * .30, y: fh * .47 }, { pos: 'CM', x: fw * .50, y: fh * .45 }, { pos: 'CM', x: fw * .70, y: fh * .47 }, { pos: 'RM', x: fw * .95, y: fh * .50 },
                    { pos: 'ST', x: fw * .35, y: fh * .78 }, { pos: 'ST', x: fw * .65, y: fh * .78 },
                  ],
                };
                return maps[f] || maps['4-4-2'];
              };

              setClubIdentity(data);
              if (data.logoUrl) {
                setClubLogo(data.logoUrl);
                localStorage.setItem("gerd_clubLogo", data.logoUrl);
              }
              setHasOnboarded(true);
              setSimulationMode(false);
              localStorage.setItem("gerd_clubIdentity", JSON.stringify(data));
              localStorage.setItem("gerd_hasOnboarded", "true");
              localStorage.setItem("gerd_simulationMode", "false");

              // ── 2. CSS branding injection ─────────────────────────
              if (data.primaryColor) document.documentElement.style.setProperty("--color-neon", data.primaryColor);
              if (data.secondaryColor) document.documentElement.style.setProperty("--color-redbull", data.secondaryColor);

              // ── 3. Hydration payload dispatch ─────────────────────
              const payload = data.hydrationPayload;
              if (payload && payload.ok) {
                // 3a. Players → Locker Room
                if (payload.players?.length > 0) {
                  setPlayers(payload.players.map((p, i) => ({
                    id: p.id || `h_${i}`,
                    name: p.name,
                    photo: p.photo || null,
                    position: p.position || 'MF',
                    age: p.age || 24,
                    nationality: p.nationality || '—',
                    marketValue: p.marketValue || 0,
                    form: p.form || 80,
                    fitness: p.fitness || 85,
                    sharpness: p.sharpness || 75,
                    stats: p.stats || { pac: 75, sho: 72, pas: 74, dri: 73, def: 65, phy: 72 },
                    status: p.status || 'Fit',
                    weeklyWage: Math.round((p.marketValue || 5000000) / 1000),
                    contractMonths: 24,
                  })));
                }

                // 3b. truthObject updates via Unified Event System
                dispatchAction('HYDRATE_SQUAD', {
                  identity: {
                    name: payload.clubName || data.name,
                    league: payload.league || data.league,
                    logo_url: payload.logoUrl || '',
                    primary_color: payload.primaryColor,
                    secondary_color: payload.secondaryColor,
                  },
                  tactical: {
                    formation_home: payload.lastFormation || '4-4-2',
                  },
                  financials: {
                    current_budget: payload.transferBudget || data.manualBudget || 0,
                  },
                });
                setUserBudget(payload.transferBudget || data.manualBudget || 0);

                // 3c. Auto-position first 11 players in formation on Tactical Hub
                const FIELD_W_APPROX = 450;
                const FIELD_H_APPROX = 680;
                const positions = getFormationPositions(payload.lastFormation, FIELD_W_APPROX, FIELD_H_APPROX);
                const starters = (payload.players || []).slice(0, 11);
                const newPos = {};
                starters.forEach((p, i) => {
                  if (positions[i]) newPos[p.id || `h_${i}`] = { x: positions[i].x, y: positions[i].y };
                });
                setPlayerPositions(newPos);
                localStorage.setItem("gerd_playerPositions", JSON.stringify(newPos));

                // 3d. Stadion-Kurier Saison-Vorschau draft
                setSuggestedLayoutBlocks(prev => [{
                  type: "Saison-Vorschau",
                  headline: `Saisonauftakt ${payload.clubName}: Kader ready`,
                  description: `${payload.players?.length || 0} Spieler im Kader. Gesamtmarktwert: \u20ac${((payload.totalSquadValue || 0) / 1e6).toFixed(1)}M. Formation: ${payload.lastFormation}. Quelle: ${payload.source}.`,
                }, ...prev]);

                addAiLog(`Hydration applied: ${payload.players?.length} Spieler, Formation ${payload.lastFormation}, Budget \u20ac${(payload.transferBudget / 1e6).toFixed(1)}M`, "success");
              } else {
                // MANUAL FALLBACK (Phase 14)
                dispatchAction('UPDATE_BUDGET', data.manualBudget || 0);
                setUserBudget(data.manualBudget || 0);
                addAiLog(`Manuelle Initialisierung: Budget auf \u20ac${(data.manualBudget / 1e6).toFixed(1)}M gesetzt.`, "process");
              }

              gerdSpeak(`System initialisiert f\u00fcr ${data.name}. Willkommen im Stark Elite Hub.`, "System");
            }}
            askAI={askAI}
            addAiLog={addAiLog}
            gerdSpeak={gerdSpeak}
          />
        )}
        {/* OFFLINE BANNER */}
        {isOffline && (
          <div className="fixed top-0 left-0 w-full bg-redbull text-white text-[10px] font-black uppercase tracking-[0.2em] py-2 z-[500] text-center animate-pulse border-b border-white/20">
            ⚠ System-Warnung: Prüfe Internetverbindung... (Offline-Modus
            aktiv)
          </div>
        )}
        {/* SIDEBAR (Desktop Only) */}
        <div className="hidden md:flex md:w-80 border-r border-white/5 flex-col h-screen overflow-hidden shrink-0 bg-[#050a14] shadow-[10px_0_30px_rgba(0,0,0,0.8)] z-20">
          {/* Logo / Header */}
          <div className="p-8 border-b border-white/5 relative">
            <div className="w-16 h-1 bg-redbull mb-4"></div>
            <div className="flex items-center gap-4">
              {clubLogo && (
                <div className="w-12 h-12 bg-white/5 rounded border border-white/10 overflow-hidden shrink-0">
                  <img src={clubLogo} alt="Club Logo" className="w-full h-full object-contain" />
                </div>
              )}
              <h1 className="text-3xl font-black italic tracking-tighter flex flex-col uppercase">
                GERD 2.0
                <span className={`text-redbull text-base tracking-widest font-sans mt-1 flex items-center gap-2 ${championsMode ? "animate-pulse" : ""}`}>
                  <div className={`w-2 h-2 rounded-full ${championsMode ? "bg-redbull shadow-[0_0_10px_#e21b4d]" : "bg-white/20"}`}></div>{" "}
                  STARK ELITE
                </span>
                
                {/* AI Engine Indicator (Phase 15) */}
                <div className="mt-3 flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-black tracking-widest uppercase border flex items-center gap-1.5 transition-colors ${aiEngine === "cloud" ? "bg-neon/10 border-neon/30 text-neon" : "bg-gold/10 border-gold/30 text-gold"}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${aiEngine === "cloud" ? "bg-neon" : "bg-gold"} animate-pulse`}></div>
                    {aiEngine === "cloud" ? "Cloud Engine" : "Local Engine"}
                  </span>
                </div>
              </h1>
            </div>
            {/* Champions Mode Toggle (Phase 13) */}
            <div className="absolute top-8 right-6">
              <button
                onClick={() => {
                  setChampionsMode(!championsMode);
                  gerdSpeak(championsMode ? "System deeskaliert. Champions Mode deaktiviert." : "Maximale Intensität gewählt. Champions Mode aktiv.", "System");
                }}
                className={`p-2 rounded-full border transition-all ${championsMode ? "bg-redbull/20 border-redbull text-redbull shadow-[0_0_15px_rgba(226,27,77,0.4)]" : "bg-white/5 border-white/10 text-white/30 hover:text-white"}`}
                title="Champions Mode Toggle"
              >
                <Icon name="zap" size={14} className={championsMode ? "animate-bounce" : ""} />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
            {[
              { id: "home", label: "Zentrale", icon: "home", color: "neon", roles: ["Trainer", "Admin"] },
              { id: "kader", label: "Kader (FIFA)", icon: "users", color: "neon", roles: ["Trainer", "Admin", "Manager"] },
              { id: "tactical", label: "Tactical Hub", icon: "shield", color: "neon", roles: ["Trainer", "Admin"] },
              { id: "medical", label: "Medical Lab", icon: "activity", color: "redbull", roles: ["Trainer", "Admin"] },
              { id: "video", label: "Video Hub", icon: "monitor-play", color: "white", roles: ["Trainer", "Presse / Scouting", "Admin"] },
              { id: "cfo", label: "CFO Board", icon: "pie-chart", color: "gold", roles: ["Manager", "Admin"] },
              { id: "nlz", label: "Fuchs NLZ Hub", icon: "layout-grid", color: "neon", roles: ["Jugendtrainer (NLZ)", "Admin"] },
              { id: "journal", label: "Performance Journal", icon: "newspaper", color: "white", roles: ["Manager", "Admin"] },
              { id: "morning-call", label: "Morning Call", icon: "mic", color: "neon", roles: ["Trainer", "Admin"] },
              { id: "training_lab", label: "Training Lab", icon: "zap", color: "neon", roles: ["Trainer", "Admin"] },
              { id: "match_manifesto", label: "Match Manifesto", icon: "shield", color: "redbull", roles: ["Trainer", "Admin"] },
              { id: "stadion-kurier", label: "Stadion-Kurier", icon: "newspaper", color: "gold", roles: ["Presse / Scouting", "Admin"] },
              { id: "legacy", label: "Legacy Hub", icon: "heart", color: "gold", roles: ["Manager", "Admin"] },
            ].filter(item => item.roles.includes(activeRole)).map((item) => {
              const isActive = activeTab === item.id;
              let bgClass = "hover:bg-white/5";
              let textClass = "text-white/50";
              if (isActive) {
                if (item.color === "neon") {
                  bgClass =
                    "bg-navy border-l-4 border-neon shadow-[intset_0_0_10px_rgba(0,243,255,0.2)]";
                  textClass = "text-white";
                }
                if (item.color === "redbull") {
                  bgClass = "bg-redbull/10 border-l-4 border-redbull";
                  textClass = "text-white";
                }
                if (item.color === "gold") {
                  bgClass = "bg-[#d4af3710] border-l-4 border-gold";
                  textClass = "text-white";
                }
                if (item.color === "white") {
                  bgClass = "bg-white/10 border-l-4 border-white";
                  textClass = "text-white";
                }
              }

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-4 px-5 py-4 font-bold uppercase tracking-widest text-xs transition-all text-left ${bgClass} ${textClass}`}
                >
                  <Icon
                    name={item.icon}
                    size={20}
                    className={isActive ? `text-${item.color}` : ""}
                  />{" "}
                  {item.label}
                </button>
              );
            })}

            {/* VR HUB — separate launcher button */}
            <div className="pt-2 pb-1 px-2 border-b border-white/5 mb-2">
              <button
                onClick={() => setView("vr")}
                className="w-full flex items-center gap-4 px-5 py-4 font-black uppercase tracking-widest text-xs transition-all text-left rounded border border-neon/30 bg-neon/5 text-neon hover:bg-neon hover:text-navy shadow-[0_0_12px_rgba(0,243,255,0.2)] hover:shadow-[0_0_20px_rgba(0,243,255,0.5)]"
              >
                <Icon name="glasses" size={20} className="text-neon" />
                <span className="flex-1">VR Hub</span>
                <span className="text-[9px] border border-neon/40 px-1.5 py-0.5 rounded font-mono">
                  LAUNCH
                </span>
              </button>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="w-full flex items-center gap-4 px-5 py-4 mt-2 font-black uppercase tracking-widest text-xs transition-all text-left rounded bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
              >
                <Icon
                  name="settings"
                  size={20}
                  className="text-white/50"
                />
                <span className="flex-1">System Settings</span>
              </button>
            </div>

            {/* Neural Insight Feed */}
            <NeuralInsightFeed logs={aiLogs} />

            {/* System Status / Quota */}
            <div className="mt-auto p-4 border-t border-white/5">
              <div className="p-4 bg-black/40 border border-white/5 rounded-xl">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3 flex items-center gap-2">
                  <Icon name="activity" size={12} /> System Status
                </h4>
                <QuotaWidget />
                <p className="text-[9px] text-white/30 mt-4 italic">
                  Automatische Limitierung auf 15 RPM zum Schutz des
                  Freikontingents.
                </p>
              </div>
            </div>

            {/* SETTINGS BUTTON (Bottom of nav) */}
            <div className="p-4 border-t border-white/5 mt-auto">
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="w-full flex items-center gap-4 px-5 py-3 font-bold uppercase tracking-widest text-[10px] text-white/30 hover:text-white hover:bg-white/5 rounded transition-all transition-all"
              >
                <Icon name="settings" size={16} /> System-Einstellungen
              </button>
            </div>
          </nav>

          {/* AI Personas Chat */}
          <div className="h-64 flex flex-col border-t border-white/10 bg-[#000]">
            <div className="px-4 py-2 font-mono text-xs font-bold text-neon border-b border-white/5 flex items-center justify-between">
              AI PERSONAS LINK{" "}
              <Icon name="radio" size={14} className="animate-pulse" />
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-4 font-mono text-[11px] leading-relaxed">
              {chatMessages.map((msg, i) => {
                const isUser = msg.sender === "User";
                let color = "text-white/80";
                let labelColor = "text-white/40";
                if (msg.sender === "Trainer-Gerd")
                  labelColor = "text-neon";
                if (msg.sender === "Arzt-Gerd")
                  labelColor = "text-redbull";
                if (msg.sender === "Manager-Gerd")
                  labelColor = "text-gold";
                if (msg.sender === "Presse-Gerd")
                  labelColor = "text-gray-400";

                return (
                  <div
                    key={i}
                    className={`flex flex-col ${isUser ? "items-end" : "items-start"} animate-fade-in`}
                  >
                    <span
                      className={`${labelColor} uppercase font-bold mb-1 tracking-widest`}
                    >
                      {msg.sender}
                    </span>
                    <div
                      className={`p-2 rounded max-w-[90%] border ${isUser ? "bg-white/5 border-white/10" : "bg-navy/30 border-neon/30 text-neon"}`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })}
            </div>
            <form
              onSubmit={handleAIRequest}
              className="p-3 bg-[#0a0f1a] flex gap-2 border-t border-white/5"
            >
              <input
                type="text"
                placeholder="Frage an Gerd..."
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                className="flex-1 bg-black border border-white/20 rounded p-2 text-xs text-white font-mono focus:outline-none focus:border-neon transition-colors"
              />
              <button
                type="submit"
                className="bg-neon/20 text-neon p-2 rounded hover:bg-neon hover:text-black transition-colors cursor-pointer"
              >
                <Icon name="send" size={16} />
              </button>
            </form>
          </div>
        </div>
        {/* MAIN CONTENT AREA */}
        <div className="flex-1 overflow-y-auto relative p-6 md:p-12 main-content-mobile md:pt-24">
          {renderPlayerEditor()}
          
          {/* ROLE SWITCHER TAB BAR (PHASE 17) */}
          <div className="absolute top-0 left-0 w-full z-40 bg-black/80 backdrop-blur-md border-b border-white/10 px-8 py-4 flex items-center justify-between">
            <div className="flex gap-4 overflow-x-auto pb-2 md:pb-0 scrollbar-hide w-full max-w-5xl mx-auto">
              {["Trainer", "Manager", "Presse / Scouting", "Jugendtrainer (NLZ)", "Admin"].map(role => (
                <button
                  key={role}
                  onClick={() => {
                    setActiveRole(role);
                    if(role === "Trainer") setActiveTab("home");
                    if(role === "Manager") setActiveTab("cfo");
                    if(role === "Presse / Scouting") setActiveTab("stadion-kurier");
                    if(role === "Jugendtrainer (NLZ)") setActiveTab("nlz");
                    if(role === "Admin") setActiveTab("home");
                  }}
                  className={`px-6 py-2 rounded-full font-black uppercase tracking-widest text-[10px] sm:text-xs whitespace-nowrap transition-all ${
                    activeRole === role 
                    ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.4)]" 
                    : "bg-white/5 text-white/40 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {showBriefing && (
            <IntelligenceBriefing
              onClose={() => setShowBriefing(false)}
            />
          )}
          {/* VR Launch Button (Top Right Absolute) */}
          <div className="absolute top-24 right-8 z-50 flex gap-4">
            <button
              onClick={() => setShowBriefing(true)}
              className="bg-black/60 border-2 border-white/20 text-white hover:border-white transition-all px-6 py-2 pb-1.5 rounded-sm font-black uppercase tracking-widest text-xs flex items-center gap-3 cursor-pointer"
            >
              <Icon name="file-text" size={18} className="mb-0.5" />{" "}
              Intelligence Briefing
            </button>
            <button
              onClick={() => setView("vr")}
              className="bg-transparent border-2 border-neon text-neon hover:bg-neon hover:text-black transition-all px-6 py-2 pb-1.5 rounded-sm font-black uppercase tracking-widest text-xs flex items-center gap-3 cursor-pointer shadow-[0_0_15px_rgba(0,243,255,0.4)]"
            >
              <Icon name="headset" size={18} className="mb-0.5" /> Launch
              VR Hub
            </button>
          </div>
          {/* Content Container */}
          <div className="max-w-7xl mx-auto pt-6 pb-20 relative z-10 min-h-[80vh]">
            {/* Header confirm for NLZ if active */}
            {activeTab === "nlz" && (
              <div className="mb-8 mobile-only">
                <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter border-l-4 border-neon pl-4">
                  FUCHS NLZ - PERFORMANCE HUB
                </h2>
              </div>
            )}

            {activeTab === "home" && renderExecutiveZentrale()}
            {activeTab === "kader" && renderKaderLab()}
            {activeTab === "tactical" && renderTactical({ 
              targetPlayers: activeRole === "Jugendtrainer (NLZ)" ? youthPlayers : players,
              targetPositions: activeRole === "Jugendtrainer (NLZ)" ? nlzPlayerPositions : playerPositions,
              setTargetPositions: activeRole === "Jugendtrainer (NLZ)" ? setNlzPlayerPositions : setPlayerPositions,
              isNlzTheme: activeRole === "Jugendtrainer (NLZ)"
            })}
            {activeTab === "training_lab" && (
              <TrainingLabView
                truthObject={truthObject}
                dispatchAction={dispatchAction}
                askAI={askAI}
                gerdSpeak={gerdSpeak}
                addAiLog={addAiLog}
                setActiveTab={setActiveTab}
                setPlayerPositions={setPlayerPositions}
                isRecording={isRecording}
                toggleVoiceAI={handleVoiceCommand}
                activeTab={activeTab}
              />
            )}
            {activeTab === "match_manifesto" && (
              <MatchDayManifestoView
                truthObject={truthObject}
                dispatchAction={dispatchAction}
                gerdSpeak={gerdSpeak}
              />
            )}
            {activeTab === "medical" && renderMedical()}
            {activeTab === "video" && renderVideo()}
            {activeTab === "cfo" && renderCFO()}
            {activeTab === "nlz" && (
              <div className="animate-fade-in min-h-screen bg-[#000000] relative z-20">
                <FuchsNLZ clubIdentity={clubIdentity} truthObject={truthObject} dispatchAction={dispatchAction} addAiLog={addAiLog}
                  youthPlayers={youthPlayers}
                  setYouthPlayers={setYouthPlayers}
                  nlzTab={nlzTab}
                  setNlzTab={setNlzTab}
                  scoutModal={scoutModal}
                  setScoutModal={setScoutModal}
                  dnaModules={dnaModules}
                  setDnaModules={setDnaModules}
                  askAI={askAI}
                  gerdSpeak={gerdSpeak}
                  updateYouthPlayer={updateYouthPlayer}
                  addYouthPlayer={addYouthPlayer}
                  deleteYouthPlayer={deleteYouthPlayer}
                  promoteToProSquad={promoteToProSquad}
                  openScoutModal={openScoutModal}
                  ageGroup={nlzAgeGroup}
                  setAgeGroup={setNlzAgeGroup}
                  isRecording={isRecording}
                  toggleVoiceAI={handleVoiceCommand}
                />
              </div>
            )}
            {activeTab === "legacy" && <LegacyView identityData={identityData} />}
            {activeTab === "stadion-kurier" && <StadionKurierView isRecording={isRecording} toggleVoiceAI={toggleVoiceAI} activeTab={activeTab} />}
            <GlobalFooter identityData={identityData} />
            {activeTab === "morning-call" && (() => {
              const isMorningCall = true;
              return (
                <div className="animate-fade-in w-full max-w-4xl mx-auto px-6 py-10 flex flex-col gap-8">
                  {/* Status Ring / Header */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center bg-black/80 shadow-[0_0_40px_rgba(0,243,255,0.2)] ${isMorningCall ? 'border-neon/50' : 'border-gold/50'}`}>
                        <Icon name={isMorningCall ? "mic" : "newspaper"} size={24} className={isMorningCall ? "text-neon" : "text-gold"} />
                      </div>
                      <div>
                        <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase leading-none">
                          {isMorningCall ? "Morning Call" : "Stadion-Kurier"}
                        </h2>
                        <p className={`font-mono text-[9px] uppercase tracking-[0.3em] mt-1 ${isMorningCall ? 'text-neon/60' : 'text-gold/60'}`}>
                          {isMorningCall ? "AI Executive Briefing System" : "Automated Media Generation Suite"}
                        </p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${isMorningCall ? 'bg-neon/10 border-neon/30 text-neon' : 'bg-gold/10 border-gold/30 text-gold'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full animate-ping ${isMorningCall ? 'bg-neon' : 'bg-gold'}`}></span>
                      Online
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className="space-y-6">

                    <div className="bg-navy/30 border border-neon/20 p-8 rounded-3xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none text-neon"><Icon name="cpu" size={120} /></div>
                      <h4 className="text-xs font-black text-neon uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Icon name="radio" size={14} /> Aktuelles Briefing
                      </h4>
                      <div className="text-white/80 font-mono text-sm leading-relaxed whitespace-pre-wrap italic">
                        {morningCallBriefing || "Keine Nachricht vorhanden. Starte den Morning Call in der Executive Zentrale."}
                      </div>
                      {morningCallBriefing && (
                        <div className="mt-8 grid grid-cols-2 gap-4">
                          <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                            <div className="text-[9px] uppercase text-white/40 font-black mb-1">Status</div>
                            <div className="text-neon font-black text-xs uppercase">Analysiert & Gekapselt</div>
                          </div>
                          <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                            <div className="text-[9px] uppercase text-white/40 font-black mb-1">Sicherheit</div>
                            <div className="text-gold font-black text-xs uppercase">Executive Only</div>
                          </div>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Global Navigation */}
                  <div className="text-center space-y-2 mt-8 border-t border-white/10 pt-8">
                    <p className="text-white/30 font-mono text-[9px] uppercase tracking-[0.3em]">
                      {isMorningCall
                        ? "Strategische Ebene: Executive Zentrale Node"
                        : "Mediale Ebene: Content Generation Node"}
                    </p>
                    <button
                      onClick={() => setActiveTab("home")}
                      className={`px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] border transition-all flex items-center gap-2 mx-auto ${isMorningCall ? 'border-neon/30 text-neon/60 hover:border-neon hover:text-neon shadow-[0_0_15px_rgba(0,243,255,0.1)]' : 'border-gold/30 text-gold/60 hover:border-gold hover:text-gold shadow-[0_0_15px_rgba(212,175,55,0.1)]'}`}
                    >
                      <Icon name="home" size={12} /> Zur Executive Zentrale
                    </button>
                  </div>
                </div>
              );
            })()}

          </div>

          {/* ── GLOBAL FOOTER ── */}
          <div className="border-t border-white/5 py-8 px-12 flex justify-center bg-black/20">
            <button
              onClick={() => setActiveTab("legacy")}
              className="flex items-center gap-3 text-white/10 hover:text-gold transition-all group"
            >
              <span className="font-mono text-[9px] uppercase tracking-[0.5em]">
                Built on Legacy. Inspired by Gerd. © 2026.
              </span>
              <Icon name="heart" size={10} className="group-hover:scale-125 transition-transform" />
            </button>
          </div>
          {/* === GLOBAL SETTINGS MODAL === */}
          {isSettingsOpen && (
            <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-navy/90 backdrop-blur-xl">
              <div className="glass-panel p-10 rounded-3xl max-w-lg w-full border border-white/20 animate-scale-in">
                <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                  <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase flex items-center gap-3">
                    <Icon name="settings" className="text-neon" /> System
                    Core Settings
                  </h2>
                  <button
                    onClick={() => setIsSettingsOpen(false)}
                    className="text-white/40 hover:text-white"
                  >
                    <Icon name="x" />
                  </button>
                </div>

                <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                  {/* Club Identity Section */}
                  <div className="bg-navy/40 p-6 rounded-2xl border border-neon/50 shadow-[0_0_15px_rgba(0,243,255,0.1)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                      <Icon name="shield" size={100} />
                    </div>
                    <h3 className="text-neon font-black uppercase text-xs tracking-widest mb-4 flex items-center gap-2">
                      <Icon
                        name="building"
                        size={14}
                        className="text-neon"
                      />{" "}
                      Club Identity & Research
                    </h3>
                    <div className="grid grid-cols-2 gap-4 mb-4 relative z-10">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-white/40 mb-2">
                          Vereinsname
                        </label>
                        <input
                          type="text"
                          className="w-full bg-black/60 border border-white/10 rounded-lg p-3 text-white font-black uppercase text-xs outline-none focus:border-neon transition-all"
                          placeholder="z.B. Bayern München"
                          value={clubIdentity.name}
                          onChange={(e) =>
                            setClubIdentity({
                              ...clubIdentity,
                              name: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-white/40 mb-2">
                          Liga / Klasse
                        </label>
                        <input
                          type="text"
                          className="w-full bg-black/60 border border-white/10 rounded-lg p-3 text-white font-black uppercase text-xs outline-none focus:border-neon transition-all"
                          placeholder="z.B. Bundesliga"
                          value={clubIdentity.league}
                          onChange={(e) =>
                            setClubIdentity({
                              ...clubIdentity,
                              league: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    {clubIdentity.researchData && (
                      <div className="mb-4 bg-black/60 p-3 rounded-lg border border-white/5 text-[10px] font-mono leading-relaxed text-white/70 h-24 overflow-y-auto custom-scrollbar relative z-10">
                        <div className="text-neon font-bold mb-1 border-b border-white/10 pb-1 flex justify-between">
                          <span>Scouting Report: Active</span>
                          <Icon name="check-circle" size={12} />
                        </div>
                        {clubIdentity.researchData}
                      </div>
                    )}

                    <button
                      onClick={async () => {
                        if (!clubIdentity.name || !clubIdentity.league) {
                          gerdSpeak(
                            "Bitte Vereinsname und Liga eingeben.",
                            "System",
                          );
                          return;
                        }
                        setIsSyncingClub(true);
                        addAiLog(
                          `Initiating deep web research for ${clubIdentity.name}...`,
                          "process",
                        );
                        try {
                          const response = await askAI(
                            `Analysiere den Verein ${clubIdentity.name} in der Liga ${clubIdentity.league}. Gib mir in 3 kurzen Stichpunkten: 1. Aktuellen sportlichen Stand. 2. Die letzten 3 bekannten Ergebnisse oder Formkurve. 3. 3-4 absolute Schlüsselspieler. Sei präzise und knapp. Das Ergebnis wird als Global Context für Manager und Trainer genutzt.`,
                            "strategy",
                            true,
                          );
                          const nextClub = {
                            ...clubIdentity,
                            researchData: response,
                          };
                          setClubIdentity(nextClub);
                          localStorage.setItem(
                            "gerd_clubIdentity",
                            JSON.stringify(nextClub),
                          );
                          gerdSpeak(
                            `Vereinsdaten für ${clubIdentity.name} erfolgreich synchronisiert.`,
                            "System",
                          );
                          addAiLog(
                            `Club Identity established: ${clubIdentity.name} (${clubIdentity.league})`,
                            "success",
                          );
                        } catch (e) {
                          addAiLog(
                            `Research failed: ${e.message}`,
                            "error",
                          );
                        } finally {
                          setIsSyncingClub(false);
                        }
                      }}
                      disabled={isSyncingClub}
                      className="w-full bg-white/5 text-white font-black py-3 rounded-xl uppercase tracking-widest text-xs border border-white/10 hover:border-neon hover:text-neon transition-all flex items-center justify-center gap-2 relative z-10"
                    >
                      {isSyncingClub ? (
                        <Icon
                          name="loader"
                          size={14}
                          className="animate-spin"
                        />
                      ) : (
                        <Icon name="globe" size={14} />
                      )}
                      {isSyncingClub
                        ? "Syncing Data..."
                        : "Vereinsdaten synchronisieren"}
                    </button>

                    {/* AUDIT & SIMULATION ACTIONS */}
                    <div className="flex gap-2 mt-4 relative z-10">
                      <button
                        onClick={() => {
                          const heenes = {
                            name: "SG Heenes/Kalkobes",
                            league: "Kreisoberliga Nordhessen",
                            researchData:
                              "Die SG Heenes/Kalkobes spielt in der Kreisoberliga Nordhessen. Aktueller Fokus liegt auf kompaktem Defensivverhalten und schnellem Umschaltspiel. Schlüsselspieler sind oft im zentralen Mittelfeld und Angriff zu finden. Das nächste Heimspiel/Derby steht an.",
                          };
                          setClubIdentity(heenes);
                          localStorage.setItem(
                            "gerd_clubIdentity",
                            JSON.stringify(heenes),
                          );
                          gerdSpeak(
                            "System Audit: SG Heenes Kalkobes geladen.",
                            "System",
                          );
                        }}
                        className="flex-1 bg-redbull/20 text-redbull font-black py-2 rounded-lg uppercase tracking-widest text-[10px] border border-redbull/50 hover:bg-redbull hover:text-white transition-all flex items-center justify-center gap-1"
                      >
                        <Icon name="zap" size={12} /> Audit: Heenes
                      </button>
                      <button
                        onClick={() => {
                          setClubIdentity({
                            name: "",
                            league: "",
                            researchData: "",
                          });
                          localStorage.removeItem("gerd_clubIdentity");
                          gerdSpeak(
                            "System Reset. Neutrale Daten.",
                            "System",
                          );
                        }}
                        className="flex-1 bg-white/5 text-white/50 font-black py-2 rounded-lg uppercase tracking-widest text-[10px] border border-white/10 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-1"
                      >
                        <Icon name="refresh-cw" size={12} /> Reset
                      </button>
                    </div>
                    <div className="mt-2 relative z-10">
                      <button
                        onClick={async () => {
                          gerdSpeak(
                            "Generiere Match-Vorschau für SG Heenes/Kalkobes...",
                            "Trainer-Gerd",
                          );
                          const previewText = await askAI(
                            "Erstelle eine extrem kurze taktische Analyse des nächsten Gegners der SG Heenes/Kalkobes (Kreisoberliga Nordhessen). Empfehle ein 4-4-2 System und gib ein kurzes Trainer-Briefing für das Derby. Max 3 Sätze.",
                            "Trainer-Gerd",
                            true,
                          );
                          const matchPreviewEntry = {
                            id: Date.now(),
                            name: "Match Preview: Derby",
                            timestamp: new Date().toISOString(),
                            mode: "match",
                            summary:
                              previewText ||
                              "4-4-2 Derby Fokus. Kompakte Defensive gegen den Ball, schnelles Umschalten über die Flügel.",
                            playerPositions: {
                              1: { x: 210, y: 550 }, // TW
                              2: { x: 100, y: 450 },
                              3: { x: 170, y: 480 },
                              4: { x: 250, y: 480 },
                              5: { x: 320, y: 450 }, // ABW
                              6: { x: 100, y: 350 },
                              7: { x: 170, y: 380 },
                              8: { x: 250, y: 380 },
                              9: { x: 320, y: 350 }, // MIT
                              10: { x: 170, y: 250 },
                              11: { x: 250, y: 250 }, // ANG
                            },
                            opponentPositions: {},
                            drawingPaths: [],
                            assessmentRatings: {},
                          };
                          const nextArchive = {
                            ...clubArchive,
                            proMatchbook: [
                              matchPreviewEntry,
                              ...(clubArchive.proMatchbook || []),
                            ],
                          };
                          setClubArchive(nextArchive);
                          localStorage.setItem(
                            "gerd_clubArchive",
                            JSON.stringify(nextArchive),
                          );
                          gerdSpeak(
                            "Match-Vorschau im Archiv gespeichert.",
                            "System",
                          );
                        }}
                        className="w-full bg-neon/10 text-neon font-black py-2 rounded-lg uppercase tracking-widest text-[10px] border border-neon/30 hover:bg-neon hover:text-black transition-all flex items-center justify-center gap-2"
                      >
                        <Icon name="file-text" size={12} /> Generate Match
                        Preview
                      </button>
                    </div>
                    <div className="flex gap-2 mt-2 relative z-10">
                      <button
                        onClick={() => {
                          const newVal = budget + 5000;
                          setBudget(newVal);
                          localStorage.setItem(
                            "stark_elite_budget",
                            newVal,
                          );
                          gerdSpeak(
                            "Sponsoring Eingang registriert: 5000 Euro.",
                            "Manager-Gerd",
                          );
                        }}
                        className="flex-1 bg-gold/10 text-gold font-black py-2 rounded-lg uppercase tracking-widest text-[9px] border border-gold/30 hover:bg-gold hover:text-black transition-all flex items-center justify-center gap-1"
                      >
                        <Icon name="dollar-sign" size={12} /> CFO Audit
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab("video");
                          setYtPlaylistId("jNQXAC9IVRw");
                          setIsSettingsOpen(false);
                          gerdSpeak(
                            "Video Validierung gestartet. Wechsle ins Video Hub.",
                            "System",
                          );
                        }}
                        className="flex-1 bg-white/5 text-white font-black py-2 rounded-lg uppercase tracking-widest text-[9px] border border-white/20 hover:bg-white hover:text-black transition-all flex items-center justify-center gap-1"
                      >
                        <Icon name="video" size={12} /> Vid Audit
                      </button>
                      <button
                        onClick={async () => {
                          gerdSpeak(
                            "Generiere NLZ Wochenplan...",
                            "Trainer-Gerd",
                          );
                          await new Promise((r) => setTimeout(r, 2000));
                          gerdSpeak(
                            "Psycho-Tracking für 15 Talente generiert.",
                            "System",
                          );
                        }}
                        className="flex-1 bg-neon/10 text-cyan-400 font-black py-2 rounded-lg uppercase tracking-widest text-[9px] border border-cyan-400/30 hover:bg-cyan-400 hover:text-black transition-all flex items-center justify-center gap-1"
                      >
                        <Icon name="users" size={12} /> NLZ Audit
                      </button>
                    </div>
                  </div>
                  {/* Quota Monitoring Widget */}
                  <div className="bg-navy/40 p-6 rounded-2xl border border-neon/30">
                    <h3 className="text-white font-black uppercase text-xs tracking-widest mb-4 flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Icon
                          name="gauge"
                          size={14}
                          className="text-neon"
                        />{" "}
                        Gemini Quota (Free Tier)
                      </span>
                      <span className="text-[10px] bg-neon/10 text-neon px-2 py-0.5 rounded border border-neon/20">
                        LIVE
                      </span>
                    </h3>
                    <QuotaWidget />
                    <p className="text-[9px] text-white/30 mt-4 italic">
                      Automatische Limitierung auf 15 RPM zum Schutz des
                      Freikontingents.
                    </p>
                  </div>

                  {/* YouTube API Section */}
                  <div className="bg-navy/40 p-6 roued-der border-white/5">
                    <h3 className="text-white font-black uppercase text-xs tracking-widest mb-4 flex items-center gap-2">
                      <Icon
                        name="youtube"
                        size={14}
                        className="text-red-500"
                      />{" "}
                      YouTube Data API
                    </h3>
                    <label className="block text-[10px] uppercase font-bold text-white/40 mb-2">
                      API Key (v3)
                    </label>
                    <input
                      type="password"
                      className="w-full bg-black/60 border border-white/10 rounded-lg p-3 text-white font-mono text-sm outline-none focus:border-neon transition-all"
                      placeholder="AIzaSy..."
                      value={apiConfig.youtubeKey}
                      onChange={(e) =>
                        setApiConfig({
                          ...apiConfig,
                          youtubeKey: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* Ollama / Local AI Section */}
                  <div className="bg-navy/40 p-6 rounded-2xl border border-white/5">
                    <h3 className="text-white font-black uppercase text-xs tracking-widest mb-4 flex items-center gap-2">
                      <Icon name="zap" size={14} className="text-gold" />{" "}
                      Ollama (Local Node)
                    </h3>
                    <label className="block text-[10px] uppercase font-bold text-white/40 mb-2">
                      Local URL
                    </label>
                    <input
                      type="text"
                      className="w-full bg-black/60 border border-white/10 rounded-lg p-3 text-white font-mono text-sm outline-none focus:border-gold transition-all"
                      placeholder="http://localhost:11434"
                      value={apiConfig.ollamaUrl}
                      onChange={(e) =>
                        setApiConfig({
                          ...apiConfig,
                          ollamaUrl: e.target.value,
                        })
                      }
                    />
                  </div>

                  <button
                    onClick={() => {
                      localStorage.setItem(
                        "gerd_apiConfig",
                        JSON.stringify(apiConfig),
                      );
                      localStorage.setItem(
                        "gerd_clubIdentity",
                        JSON.stringify(clubIdentity),
                      );
                      setIsSettingsOpen(false);
                      gerdSpeak(
                        "Systemkonfiguration und Club Identity aktualisiert.",
                        "System",
                      );
                    }}
                    className="w-full bg-neon text-navy font-black py-4 rounded-xl uppercase tracking-widest shadow-[0_0_20px_rgba(0,243,255,0.4)] hover:bg-white transition-all transform hover:scale-[1.02]"
                  ></button>
                </div>
              </div>
            </div>
          )}
          {/* === YOUTUBE SYNC MODAL === */}
          {isSyncModalOpen && (
            <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-navy/90 backdrop-blur-xl animate-fade-in">
              <div className="w-full max-w-md bg-[#0a0f1d] border border-neon/30 rounded-3xl p-8 shadow-[0_0_50px_rgba(0,243,255,0.2)]">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-black italic tracking-tighter text-white uppercase flex items-center gap-3">
                    <Icon name="youtube" size={24} className="text-red-500" /> YouTube Sync
                  </h2>
                  <button onClick={() => setIsSyncModalOpen(false)} className="text-white/40 hover:text-white transition-colors">
                    <Icon name="x" size={24} />
                  </button>
                </div>
                <div className="space-y-6">
                  <div className="bg-navy/40 p-4 rounded-xl border border-white/5 text-[11px] text-white/60 leading-relaxed">
                    Gib die **YouTube Playlist ID** ein, um Sequenzen direkt in das System zu laden.
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-black text-white/40 mb-2 tracking-widest">Playlist ID</label>
                    <input
                      type="text"
                      className="w-full bg-black/60 border border-white/10 rounded-xl p-4 text-white font-mono text-sm outline-none focus:border-neon transition-all"
                      placeholder="PL..."
                      value={ytPlaylistId}
                      onChange={(e) => setYtPlaylistId(e.target.value)}
                    />
                  </div>
                  <button
                    onClick={syncYouTube}
                    disabled={isSyncing || !ytPlaylistId}
                    className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all ${isSyncing || !ytPlaylistId ? "bg-white/5 text-white/20 cursor-not-allowed" : "bg-red-600 text-white hover:bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]"}`}
                  >
                    {isSyncing ? <Icon name="loader" size={18} className="animate-spin" /> : <Icon name="refresh-cw" size={18} />}
                    {isSyncing ? "Synchronisiere..." : "Playlist Laden"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showExportCenter && renderExportCenter()}
      {/* MOBILE BOTTOM NAVIGATION */}
      <div className="md:hidden mobile-bottom-nav">
        {[
          { id: "home", label: "Home", icon: "home", color: "neon", roles: ["Trainer", "Admin"] },
          { id: "tactical", label: "Board", icon: "shield", color: "neon", roles: ["Trainer", "Admin"] },
          { id: "medical", label: "Kader", icon: "activity", color: "redbull", roles: ["Trainer", "Admin"] },
          { id: "nlz", label: "NLZ", icon: "layout-grid", color: "neon", roles: ["Jugendtrainer (NLZ)", "Admin"] },
          { id: "cfo", label: "Büro", icon: "pie-chart", color: "gold", roles: ["Manager", "Admin"] },
          { id: "legacy", label: "Legacy", icon: "heart", color: "gold", roles: ["Manager", "Admin"] },
          { id: "settings", label: "Core", icon: "settings", color: "white", isSettings: true, roles: ["Trainer", "Manager", "Presse / Scouting", "Jugendtrainer (NLZ)", "Admin"] },
        ].filter(item => item.roles.includes(activeRole)).map((item) => (
          <button
            key={item.id}
            onClick={() => item.isSettings ? setIsSettingsOpen(true) : setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center p-2 text-[9px] font-black uppercase tracking-widest ${item.isSettings && isSettingsOpen ? "text-white" : activeTab === item.id ? "text-white" : "text-white/40"}`}
          >
            <Icon
              name={item.icon}
              size={24}
              className={activeTab === item.id && !item.isSettings ? `text-${item.color} drop-shadow-[0_0_8px_rgba(0,243,255,0.5)]` : ""}
            />
            <span className="mt-1">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <GlobalErrorBoundary>
    <App />
  </GlobalErrorBoundary>
);
