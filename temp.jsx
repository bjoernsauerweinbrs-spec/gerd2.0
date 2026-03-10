    <script type="text/babel">
      const { useState, useEffect, useRef } = React;

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
          id: 1,
          name: "Muster-TW",
          position: "TW",
          ovr: 85,
          readiness: 95,
          isInjured: false,
          rating: 8.5,
          pac: 80,
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

        const handleMagicFill = async () => {
          if (!clubName) return alert("Bitte zuerst Vereinsnamen eingeben.");
          setIsMagicFilling(true);
          addAiLog(
            `Magic Fill: Researching identity for ${clubName}...`,
            "process",
          );
          try {
            const response = await askAI(
              `Analysiere den Verein ${clubName}. Gib mir NUR ein JSON-Objekt zurück mit: { "league": "string", "primaryColor": "hex", "secondaryColor": "hex", "rivals": "string" }. Sei präzise.`,
              "strategy",
              true,
            );
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const data = JSON.parse(jsonMatch[0]);
              setLeague(data.league || "");
              setPrimaryColor(data.primaryColor || "#00f3ff");
              setSecondaryColor(data.secondaryColor || "#e21b4d");
              addAiLog(`Magic Fill success for ${clubName}`, "success");
              gerdSpeak(
                `Identität für ${clubName} wurde erfolgreich extrahiert.`,
                "System",
              );
            }
          } catch (e) {
            addAiLog(`Magic Fill failed.`, "error");
          } finally {
            setIsMagicFilling(false);
          }
        };

        const handleFinish = () => {
          if (!clubName || !league)
            return alert("Bitte Name und Liga angeben.");
          onComplete({
            name: clubName,
            league: league,
            primaryColor: primaryColor,
            secondaryColor: secondaryColor,
            researchData: "",
          });
        };

        return (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/95 backdrop-blur-2xl animate-fade-in p-6 overflow-y-auto">
            <div className="glass-panel w-full max-w-2xl p-10 border-neon/50 shadow-[0_0_100px_rgba(0,243,255,0.3)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon via-redbull to-gold animate-shimmer"></div>

              <div className="text-center mb-10">
                <div className="inline-block p-4 rounded-full bg-neon/10 text-neon mb-6 border border-neon/20">
                  <Icon name="layout-grid" size={48} />
                </div>
                <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase mb-2">
                  Gerd 2.0 Onboarding
                </h1>
                <p className="text-white/40 font-mono text-[10px] uppercase tracking-[0.3em]">
                  Initial Club Configuration Interface
                </p>
              </div>

              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] text-white/40 font-black uppercase tracking-widest block">
                    Vereinsname
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={clubName}
                      onChange={(e) => setClubName(e.target.value)}
                      placeholder="z.B. FC Schalke 04"
                      className="flex-1 bg-white/5 border border-white/10 rounded p-4 text-white font-black uppercase tracking-widest focus:border-neon outline-none transition-all placeholder:text-white/10"
                    />
                    <button
                      onClick={handleMagicFill}
                      disabled={isMagicFilling}
                      className="px-6 bg-gold text-navy font-black uppercase text-[10px] tracking-widest rounded hover:bg-white transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      <Icon
                        name="sparkles"
                        size={16}
                        className={isMagicFilling ? "animate-spin" : ""}
                      />
                      {isMagicFilling ? "Researching..." : "Magic Fill"}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] text-white/40 font-black uppercase tracking-widest block">
                      Wettbewerb / Liga
                    </label>
                    <input
                      type="text"
                      value={league}
                      onChange={(e) => setLeague(e.target.value)}
                      placeholder="z.B. 2. Bundesliga"
                      className="w-full bg-white/5 border border-white/10 rounded p-4 text-white font-black uppercase tracking-widest focus:border-neon outline-none transition-all placeholder:text-white/10"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] text-white/40 font-black uppercase tracking-widest block">
                        Primärfarbe
                      </label>
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-full h-14 bg-white/5 border border-white/10 rounded cursor-pointer"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] text-white/40 font-black uppercase tracking-widest block">
                        Sekundärfarbe
                      </label>
                      <input
                        type="color"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="w-full h-14 bg-white/5 border border-white/10 rounded cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleFinish}
                  className="w-full py-6 bg-neon text-navy font-black uppercase tracking-[0.4em] text-sm hover:bg-white transition-all shadow-[0_0_40px_rgba(0,243,255,0.4)] mt-4"
                >
                  Konfiguration Initialisieren
                </button>
              </div>
            </div>
          </div>
        );
      };

      const App = () => {
        const [view, setView] = useState("dashboard"); // 'dashboard' | 'vr'
        const [activeTab, setActiveTab] = useState("home");
        const [isShift, setIsShift] = useState(false);
        const [isSymbols, setIsSymbols] = useState(false);
        const [kbValue, setKbValue] = useState("");
        const [isSuitcaseOpen, setIsSuitcaseOpen] = useState(false);

        // --- VIDEO HUB STATE ---
        const [activeVideoTool, setActiveVideoTool] = useState("none");
        const [drawings, setDrawings] = useState([]);
        const [is3DFlight, setIs3DFlight] = useState(false);
        const [activeClipIndex, setActiveClipIndex] = useState(0);

        // CFO Board State
        const [cfoTab, setCfoTab] = useState("finance");
        const [scoutingPool, setScoutingPool] = useState([]);
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
        const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
        const [ytPlaylistId, setYtPlaylistId] = useState("");
        const [isSyncing, setIsSyncing] = useState(false);

        // Tactical Hub State
        const [playerPositions, setPlayerPositions] = useState(() => {
          try {
            return JSON.parse(
              localStorage.getItem("gerd_playerPositions") || "{}",
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
          return localStorage.getItem("gerd_hasOnboarded") === "true";
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
            title: "Pep Guardiola Masterclass",
            url: "_G9I2N_XG_Q",
            isYouTube: true,
            analysis:
              "Pep erklärt seine Raumaufteilung und das Positionsspiel.",
          },
          {
            title: "Oliver Glasner: System-Analyse",
            url: "q_G2bMvY89E",
            isYouTube: true,
            analysis: "Glasner über die Relevanz von Systemen vs. Prinzipien.",
          },
          {
            title: "Arsenal vs Bayern: Taktik-Feed",
            url: "rV_3pE2S_6w",
            isYouTube: true,
            analysis: "Detaillierte Analyse der Halbraumbesetzung.",
          },
          {
            title: "Jesse Marsch: Coaching Clinic",
            url: "27tWzN9d7Dk",
            isYouTube: true,
            analysis: "Umschaltspiel und Vertikalität im modernen Fußball.",
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
          const initPlayer = () => {
            const clip = playlist[activeClipIndex];
            if (window.YT && window.YT.Player && clip.isYouTube) {
              if (playerRef.current) {
                try {
                  playerRef.current.loadVideoById(clip.url);
                } catch (e) {
                  console.log("YT Reload needed");
                  createNewPlayer();
                }
              } else {
                createNewPlayer();
              }
            }
          };

          const createNewPlayer = () => {
            const clip = playlist[activeClipIndex];
            playerRef.current = new YT.Player("youtubepayer", {
              videoId: clip.url,
              playerVars: {
                autoplay: 1,
                controls: 0,
                mute: 1,
                loop: 1,
                modestbranding: 1,
                playlist: clip.url,
              },
              events: {
                onReady: (event) => event.target.playVideo(),
              },
            });
          };

          if (window.YT && window.YT.Player) {
            initPlayer();
          } else {
            window.onYouTubeIframeAPIReady = initPlayer;
          }
        }, [activeClipIndex, playlist]);

        const [isDrawing, setIsDrawing] = useState(false);
        const [startPos, setStartPos] = useState(null);

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

        // --- GERD VOICE SYSTEM ---
        const gerdSpeak = (text, persona = "Trainer-Gerd") => {
          addAiLog(`Persona [${persona}] generating voice output.`, "voice");
          if (!window.speechSynthesis) return;
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

          window.speechSynthesis.speak(msg);
          setGerdVoiceActive(true);
          msg.onend = () => setGerdVoiceActive(false);
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
        const askAI = async (
          prompt,
          persona = "Trainer-Gerd",
          isResearch = false,
        ) => {
          setGerdThinking(true);
          addAiLog(`Querying Neural Cortex via [${persona}]...`, "request");
          let response = "";

          let contextualPrompt = `Du bist Gerd 2.0, die ultimative KI-Zentrale für ${clubIdentity.name || "[Vereinsname]"}. Deine Analysen sind messerscharf, respektvoll und basieren auf absoluter Fachkompetenz.\n\n`;

          if (!isResearch && clubIdentity && clubIdentity.name) {
            contextualPrompt += `SYSTEM KONTEXT: Du arbeitest jetzt EXKLUSIV für ${clubIdentity.name} (${clubIdentity.league}). Aktuelle Daten: ${clubIdentity.researchData}\n\n`;
          }
          contextualPrompt += `USER PROMPT: ${prompt}`;

          // 1. Universal Server Proxy (/api/chat)
          try {
            const res = await fetch("http://localhost:3001/api/chat", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                messages: [{ role: "user", content: contextualPrompt }],
                persona: persona,
              }),
            });
            const data = await res.json();
            if (data.ok) {
              response = data.text;
              addAiLog(
                `Cortex response received (${response.length} chars).`,
                "resolved",
              );
            } else if (res.status === 429) {
              response = data.error; // "Butler ist gerade im Gespräch..."
              addAiLog(`Cortex Rate Limit triggered.`, "warning");
            }
          } catch (e) {
            addAiLog(`Server Proxy connectivity failure.`, "error");
            console.log("Server Proxy failed, trying Ollama...");
          }

          // 2. Ollama (Secondary)
          if (
            !response &&
            apiConfig.ollamaUrl &&
            apiConfig.ollamaUrl !== "http://localhost:11434/off"
          ) {
            try {
              const res = await fetch(`${apiConfig.ollamaUrl}/api/generate`, {
                method: "POST",
                body: JSON.stringify({
                  model: "llama3",
                  prompt: `Du bist ${persona}. ${prompt}`,
                  stream: false,
                }),
              });
              const data = await res.json();
              response = data.response;
            } catch (e) {
              console.log("Ollama failed, using Fallback.");
            }
          }

          // 3. Fallback: Stark Elite Static Intelligence
          if (!response) {
            const lower = prompt.toLowerCase();
            if (lower.includes("finanz") || lower.includes("geld"))
              response =
                "Wir müssen wirtschaftlich denken. Der ROI ist entscheidend!";
            else if (lower.includes("taktik") || lower.includes("pressing"))
              response =
                "Gegenpressing ist unsere DNA. Kompakt stehen, schnell umschalten!";
            else if (lower.includes("verletzt") || lower.includes("readiness"))
              response =
                "Die Belastung ist zu hoch. Wir brauchen Regeneration!";
            else response = "System online. Ich analysiere die Daten für dich.";
          }

          setGerdThinking(false);
          return response;
        };

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

            // Process with AI
            setGerdThinking(true);
            const onField = players.filter((p) => playerPositions[p.id]);
            const gameState = {
              userCommand: speechResult,
              ownPlayers: onField.map((p) => ({
                name: p.name,
                pos: playerPositions[p.id],
              })),
              opponents: opponentPositions,
            };

            const prompt = `Du bist Trainer-Gerd. Ein User gibt dir folgenden taktischen Sprachbefehl: "${speechResult}".
                              Aktueller Board-Status (JSON): ${JSON.stringify(gameState)}.
                              Analysiere die Anweisung im Kontext der Spielerpositionen und gib eine kurze, prägnante taktische Antwort (max 2 Sätze) im 'Stark Elite' Stil zurück.`;

            const response = await askAI(prompt, "Trainer-Gerd");
            setGerdFeedback(response);
            gerdSpeak(response, "Trainer-Gerd");
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

        const [ytAccessToken, setYtAccessToken] = useState(null);
        const [players, setPlayers] = useState(initialPlayers); // Reset for this test run
        const [editingPlayer, setEditingPlayer] = useState(null); // id of player currently being edited
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
            pas: 65,
            dri: 80,
            def: 30,
            phy: 50,
            image: "",
            hrv: 65,
            sleep: 8.0,
            psychHistory: [],
            videoTresor: [],
          },
        ];
        const [youthPlayers, setYouthPlayers] = useState(() => {
          const stored = localStorage.getItem("stark_elite_youth");
          return stored ? JSON.parse(stored) : initialYouthPlayers;
        });
        const [nlzTab, setNlzTab] = useState("basis");
        const [scoutModal, setScoutModal] = useState(null); // { player, loading, report }

        // --- PRESSE-GERD & JOURNAL STATE ---
        const [journal, setJournal] = useState(null); // { title, date, editorial, interview, tacticalPreview }
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
                          Antworte STRENG im JSON-Format: { "headline": "", "editorial": "", "interview": "", "tactics": "", "medical": "", "sponsor": "" }`;

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
          if (!window.confirm(`${yPlayer.name} in den Profi-Kader befördern?`))
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
          setPlayers(
            players.map((p) => {
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
                  <div>
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
                    Session Speichern
                  </button>
                </div>
              </div>
            </div>
          );
        };

        // --- RENDER MODULS ---

        // 1. Mannschaftskabine (FIFA Cards)
        const renderExecutiveZentrale = () => {
          const avgReadiness = (
            players.reduce((acc, p) => acc + (p.readiness || 0), 0) /
            players.length
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
            const prompt = `Du bist CEO/Manager-Gerd. Erstelle ein kurzes, prägnantes Executive-Briefing (Morning Call) basierend auf diesen Daten:
                              - Squad Readiness: ${avgReadiness}%
                              - Aktuelle Taktik: ${lastTactic}
                              - Budget Status: € ${budgetVal}M
                              - Scouting Focus: ${targetOfDay.name}
                              - NLZ Juwel: ${nlzHighlight.name}
                              Fasse die Top-Prio für heute zusammen. Maximal 3 Sätze. Sei professionell, visionär und elite-orientiert.`;

            try {
              const response = await askAI(prompt);
              setMorningCallBriefing(response);
              gerdSpeak(response, "Trainer-Gerd");
            } catch (e) {
              setMorningCallBriefing(
                "Neural link unstable. Manual review required.",
              );
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
                    Kollektive Einsatzbereitschaft
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
                      Sponsoring-Action
                    </div>
                    <div className="text-xs font-bold text-gold uppercase">
                      Active Pipeline
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

        const renderTactical = () => {
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

          const squadPlayers = players.filter((p) => p.inSquad);
          const FIELD_W = 420; // px interior coordinate system
          const FIELD_H = 640; // px interior coordinate system

          const getPlayerPos = (p, idx) => {
            if (!p || !p.id) return { x: 50, y: 300 };
            if (playerPositions[p.id]) return playerPositions[p.id];
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
              const fitPlayers = players.filter(
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

            setPlayerPositions(newPos);
            setOpponentPositions(opponentPos);
          };

          const handleFieldDrop = (e) => {
            e.preventDefault();
            if (!draggedPlayerId) return;

            const p = players.find((player) => player.id === draggedPlayerId);
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
            setPlayerPositions((prev) => ({
              ...prev,
              [draggedPlayerId]: { x, y },
            }));
            setDraggedPlayerId(null);
          };

          const generateGerdFeedback = async () => {
            const onField = players.filter((p) => playerPositions[p.id]);
            const playerJson = onField.map((p) => ({
              id: p.id,
              name: p.name,
              pos: p.position,
              coords: [
                Math.round(playerPositions[p.id].x),
                Math.round(playerPositions[p.id].y),
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

          const isActive = currentMode === "match";

          return (
            <div className="space-y-6 animate-fade-in pb-20">
              {renderPlayerEditor()}
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
                    <div className="flex bg-black/60 rounded border border-white/10 p-1">
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
                  <button
                    onClick={() =>
                      saveToArchive(
                        isMatchMode ? "proMatchbook" : "proTrainingbook",
                      )
                    }
                    className="px-6 py-3 rounded font-black uppercase tracking-tighter text-base bg-navy/60 border-2 border-neon/30 text-neon hover:bg-neon hover:text-navy transition-all flex items-center gap-2"
                  >
                    <Icon name="book" size={20} /> Taktik Mappe
                  </button>
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
                    onClick={activateGerd}
                    disabled={gerdThinking}
                    className={`px-5 py-3 rounded font-black uppercase text-xs flex items-center gap-2 border-2 transition-all ${gerdVoiceActive && !isRecording ? "bg-redbull border-redbull shadow-[0_0_20px_rgba(226,27,77,0.6)] animate-pulse" : gerdThinking ? "border-neon/40 text-neon/40 cursor-wait" : "border-neon/40 text-neon hover:bg-neon/10"}`}
                  >
                    <Icon
                      name={gerdThinking ? "loader" : "brain"}
                      size={16}
                      className={gerdThinking ? "animate-spin" : ""}
                    />
                    {gerdThinking ? "Analysiere..." : "Strategie-Check"}
                  </button>
                </div>
              </div>

              {/* ── AI Gerd Feedback ── */}
              {gerdFeedback && (
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
              )}

              <div className="flex flex-col xl:flex-row gap-8 items-start">
                {/* ══ TACTICAL FIELD (SVG) ══ */}
                <div
                  className="relative shrink-0 select-none group touch-none tactic-board-mobile overflow-hidden"
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
                  />

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
                    {drawingPaths.map((path, idx) => (
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
                        className={path.mode === "pass" ? "animate-pulse" : ""}
                      />
                    ))}

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
                    {Object.entries(playerPositions).map(([id, pos]) => {
                      const p = players.find((p) => p.id === parseInt(id));
                      if (!p) return null;
                      return (
                        <g
                          key={`player-${id}`}
                          transform={`translate(${pos.x}, ${pos.y})`}
                          className="cursor-move"
                        >
                          <circle
                            r="16"
                            fill="#navy"
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
                    {isActive &&
                      Object.entries(opponentPositions).map(([id, pos]) => (
                        <g key={id} transform={`translate(${pos.x}, ${pos.y})`}>
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
                  </svg>
                </div>

                {/* ══ SQUAD SIDEBAR ══ */}
                <div className="flex-1 w-full bg-black/40 rounded-xl border border-white/10 p-6 shadow-2xl backdrop-blur-md">
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
                          {/* FIFA CARD LAYOUT */}
                          <div className="flex flex-col h-full uppercase font-black tracking-tighter">
                            <div className="flex justify-between p-3 pb-0">
                              <div className="flex flex-col items-center">
                                <span
                                  className={`text-2xl leading-none ${isFit ? "text-white" : "text-redbull"}`}
                                >
                                  {p.ovr}
                                </span>
                                <span className="text-[10px] text-white/40">
                                  {p.position}
                                </span>
                              </div>
                              <div className="flex flex-col items-end">
                                <span
                                  className={`text-xs ${p.readiness > 80 ? "text-green-400" : p.readiness > 60 ? "text-yellow-400" : "text-red-400"}`}
                                >
                                  {p.readiness}%
                                </span>
                                <Icon
                                  name={isFit ? "zap" : "alert-circle"}
                                  size={12}
                                  className={
                                    isFit ? "text-neon" : "text-redbull"
                                  }
                                />
                              </div>
                            </div>

                            <div className="mt-2 px-3 py-1 bg-gradient-to-r from-black/80 to-transparent flex justify-between items-center group/name">
                              <div className="text-[10px] text-white truncate flex-1">
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

                            {/* Status Bar */}
                            <div
                              className={`h-1 w-full ${isNominated ? "bg-redbull" : isFit ? "bg-neon/40" : "bg-redbull/40"}`}
                            ></div>
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
                            <div>
                              <label className="text-[10px] text-white/40 uppercase font-black tracking-widest block mb-2">
                                Gesamtstärke (OVR)
                              </label>
                              <input
                                type="number"
                                min="1"
                                max="99"
                                value={editingPlayer.ovr}
                                onChange={(e) =>
                                  setEditingPlayer({
                                    ...editingPlayer,
                                    ovr: parseInt(e.target.value),
                                  })
                                }
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white font-black text-sm focus:border-redbull focus:outline-none transition-all"
                              />
                            </div>
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
          );
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
          addAiLog(`Generating squad for ${clubIdentity.name}...`, "process");
          try {
            const response = await askAI(
              `Generiere mir ein Array von 15 Spielern für den Verein ${clubIdentity.name}.
          Antworte NUR mit valider JSON (ohne Markdown-Tags, nur das '[' und ']').
          Format-Beispiel: [{"id": 1, "name": "M. Neuer", "position": "TW", "number": 1, "status": "fit", "sleep": 8.0, "hrv": 65, "stress": 30, "isInjured": false}]
          Bitte wähle die 15 bekanntesten/wichtigsten Spieler der aktuellen Ersten Mannschaft aus.`,
              "strategy",
              true,
            );

            try {
              let jsonStr = response.trim();
              if (jsonStr.startsWith("```json")) jsonStr = jsonStr.substring(7);
              if (jsonStr.startsWith("```")) jsonStr = jsonStr.substring(3);
              if (jsonStr.endsWith("```"))
                jsonStr = jsonStr.substring(0, jsonStr.length - 3);
              jsonStr = jsonStr.trim();

              const newPlayers = JSON.parse(jsonStr);
              // Ensure IDs are correct and exactly 15
              const mappedPlayers = newPlayers.slice(0, 15).map((p, i) => ({
                ...p,
                id: i + 1,
                status: p.status || "fit",
                sleep: p.sleep || 8.0,
                hrv: p.hrv || 60,
                stress: p.stress || 30,
                isInjured: p.isInjured || false,
                inTraining: true,
              }));
              setPlayers(mappedPlayers);
              gerdSpeak(
                `Kader für ${clubIdentity.name} erfolgreich geladen.`,
                "System",
              );
              addAiLog(
                `Squad populated: 15 players for ${clubIdentity.name}`,
                "success",
              );
            } catch (e) {
              console.error("AI JSON Error:", e, response);
              addAiLog(`Failed to parse AI Kader JSON.`, "error");
              gerdSpeak(
                `Konnte den Kader nicht parsen. Bitte erneut versuchen.`,
                "System",
              );
            }
          } catch (e) {
            addAiLog(`Kader Auto-Fill failed: ${e.message}`, "error");
          } finally {
            setIsAutoFilling(false);
          }
        };

        const renderMedical = () => (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-black italic tracking-tighter text-redbull flex items-center gap-3 uppercase">
                <Icon name="activity" size={28} /> Medical Performance Lab
              </h2>
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
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {players.map((p) => {
                const readiness = calculateReadiness(p.sleep, p.hrv);
                const isDanger = readiness < 65;
                const isInjured = p.status === "injured";

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
                        <span
                          className={`font-black ${isDanger ? "text-redbull text-glow-red" : "text-neon text-glow-neon"}`}
                        >
                          {readiness}%
                        </span>
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
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-black italic tracking-tighter flex items-center gap-3 text-white uppercase">
                <Icon name="monitor-play" size={28} /> TINI 2.0 | Video Hub
              </h2>
              <div className="flex gap-4 items-center">
                {!ytAccessToken ? (
                  <button
                    onClick={() => {
                      gerdSpeak(
                        "Initialisiere sichere Verbindung zum Google API Gateway.",
                        "Manager-Gerd",
                      );
                      addAiLog("Requesting OAuth Token via GIS...", "request");
                      setTimeout(() => {
                        setYtAccessToken("DEMO_TOKEN_" + Date.now());
                        addAiLog(
                          "OAuth Token granted. Syncing library...",
                          "success",
                        );
                        gerdSpeak(
                          "YouTube-Zugriff gewährt. Deine privaten Playlisten werden geladen.",
                          "Manager-Gerd",
                        );
                      }, 1500);
                    }}
                    className="bg-white text-navy px-6 py-2 rounded font-black text-xs uppercase hover:bg-neon transition-all flex items-center gap-2"
                  >
                    <Icon name="youtube" size={14} /> Login with YouTube
                  </button>
                ) : (
                  <div className="flex items-center gap-2 text-[10px] font-mono text-neon bg-neon/5 px-4 py-2 rounded border border-neon/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-neon animate-pulse"></div>
                    CONNECTED
                  </div>
                )}
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
                    <div
                      id="youtubepayer"
                      className="w-full h-full pointer-events-none"
                    ></div>
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
                    {videoFeedback.split("\n").map((line, i) => (
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
                <div className="flex gap-2">
                  <div className="bg-black/40 border border-gold/20 px-4 py-2 rounded-lg text-right">
                    <div className="text-[8px] text-gold/60 font-black uppercase tracking-widest">
                      Liquidität
                    </div>
                    <div className="text-xl font-mono font-black text-white">
                      € {(budget / 1000000).toFixed(2)}M
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
              {cfoTab === "finance" && (
                <div className="space-y-6">
                  {/* KPI Kacheln */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      {
                        label: "Finanzielle Kraft",
                        val: `€ ${(budget / 1000).toFixed(0)}k`,
                        trend: "+4.2%",
                        color: "gold",
                        icon: "dollar-sign",
                      },
                      {
                        label: "Sponsoring Pipeline",
                        val: "€ 850k",
                        trend: "+12.5%",
                        color: "cyan",
                        icon: "zap",
                      },
                      {
                        label: "Infrastruktur Status",
                        val: "Level 4",
                        trend: "STABIL",
                        color: "green",
                        icon: "home",
                      },
                    ].map((kpi, i) => (
                      <div
                        key={i}
                        className={`carbon-fiber border border-white/10 p-6 rounded-2xl relative overflow-hidden group hover:border-${kpi.color}/50 transition-all`}
                      >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                          <Icon name={kpi.icon} size={60} />
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">
                          {kpi.label}
                        </div>
                        <div className="text-3xl font-black text-white mb-2">
                          {kpi.val}
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded ${kpi.trend.includes("+") ? "bg-green-500/20 text-green-400" : "bg-gold/20 text-gold"}`}
                          >
                            {kpi.trend}
                          </span>
                          <span className="text-[9px] text-white/20 font-mono tracking-tighter uppercase">
                            vs. Vormonat
                          </span>
                        </div>
                        {/* Trendy SVG Graph Simulation */}
                        <div className="mt-4 h-12 w-full">
                          <svg
                            viewBox="0 0 100 30"
                            className="w-full h-full overflow-visible"
                          >
                            <path
                              d={`M0,25 Q10,${20 - i * 5} 20,22 T40,15 T60,20 T80,10 T100,18`}
                              fill="none"
                              stroke={
                                kpi.color === "gold"
                                  ? "#D4AF37"
                                  : kpi.color === "cyan"
                                    ? "#00f3ff"
                                    : "#22c55e"
                              }
                              strokeWidth="2"
                              className="drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]"
                            />
                          </svg>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Investment Rechner */}
                  <div className="bg-[#0f0f0f] border border-gold/20 p-8 rounded-3xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                      <Icon name="pie-chart" size={200} />
                    </div>
                    <h3 className="text-xl font-black text-gold uppercase tracking-widest mb-6 flex items-center gap-3">
                      <Icon name="cpu" size={24} /> KI-Investment-Rechner
                    </h3>

                    <div className="flex flex-col md:flex-row gap-8">
                      <div className="w-full md:w-1/3 space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block">
                          Geplantes Investment (€)
                        </label>
                        <input
                          type="number"
                          value={investmentSum}
                          onChange={(e) =>
                            setInvestmentSum(Number(e.target.value))
                          }
                          className="w-full bg-black/60 border border-gold/30 text-white font-mono text-3xl font-black p-4 rounded-xl focus:border-gold focus:outline-none"
                        />
                        <button
                          onClick={handleInvestmentCalc}
                          className="w-full bg-gold text-black font-black uppercase tracking-[0.2em] text-xs py-4 rounded-xl hover:bg-white transition-all shadow-xl"
                        >
                          Strategie Berechnen
                        </button>
                      </div>

                      <div className="flex-1 bg-black/40 border border-white/5 p-6 rounded-2xl">
                        {investmentAI ? (
                          <div className="prose prose-invert max-w-none">
                            <div className="text-[10px] font-black uppercase tracking-widest text-gold mb-4 flex items-center gap-2">
                              <Icon name="check-circle" size={14} />{" "}
                              Strategische Empfehlung
                            </div>
                            <div className="font-mono text-xs whitespace-pre-wrap leading-relaxed text-white/80">
                              {investmentAI}
                            </div>
                          </div>
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                            <Icon name="activity" size={48} className="mb-4" />
                            <div className="text-xs font-black uppercase tracking-widest">
                              Warte auf Input zur Kapitalallokation
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  )}

                  {/* === SCOUTING INTELLIGENCE HUB === */}
                  {cfoTab === "scouting" && (
                    <div className="space-y-6">
                      <div className="bg-[#111] border border-cyan-500/20 p-8 rounded-3xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                          <Icon name="search" size={200} />
                        </div>
                        <h3 className="text-xl font-black text-cyan-400 uppercase tracking-widest mb-8 flex items-center gap-3">
                          <Icon name="target" size={24} /> Shadow Scout Intelligence
                        </h3>

                        <div className="flex gap-3 mb-10">
                          <input
                            type="text"
                            value={shadowScoutQuery}
                            onChange={(e) => setShadowScoutQuery(e.target.value)}
                            onKeyDown={(e) =>
                              e.key === "Enter" && handleShadowScout()
                            }
                            placeholder="Profil suchen... z.B. 'Zerstörer auf der Sechs, vertragslos, Leader-Styp'"
                            className="flex-1 bg-black/60 border border-cyan-500/30 text-white font-mono px-5 py-4 rounded-xl focus:border-cyan-400 focus:outline-none placeholder-white/20"
                          />
                          <button
                            onClick={handleShadowScout}
                            disabled={isScoutingLoading}
                            className="bg-cyan-500 text-navy px-8 py-4 rounded-xl font-black uppercase text-xs flex items-center gap-3 hover:bg-white transition-all shadow-[0_0_20px_rgba(0,243,255,0.3)] disabled:opacity-50"
                          >
                            {isScoutingLoading ? (
                              <Icon
                                name="loader"
                                size={18}
                                className="animate-spin"
                              />
                            ) : (
                              <Icon name="zap" size={18} />
                            )}
                            Sondieren
                          </button>
                        </div>

                        {shadowScoutReport && (
                          <div className="bg-black/60 border border-cyan-500/50 p-8 rounded-2xl mb-10 animate-slide-up">
                            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400 mb-6 flex items-center gap-2">
                              <Icon name="file-text" size={14} /> Shadow Report:
                              Deep Market Analysis
                            </div>
                            <div className="font-mono text-xs whitespace-pre-wrap leading-relaxed text-white/90">
                              {shadowScoutReport}
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {/* Live Market Analysis */}
                          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                            <div className="flex justify-between items-center mb-6">
                              <h4 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
                                <Icon
                                  name="globe"
                                  size={14}
                                  className="text-neon"
                                />{" "}
                                Live-Market Radar
                              </h4>
                              <span className="text-[9px] font-black bg-neon/10 text-neon px-2 py-1 rounded border border-neon/20 animate-pulse">
                                LIVE
                              </span>
                            </div>
                            <div className="space-y-4">
                              {scoutingPool.map((p) => (
                                <div
                                  key={p.id}
                                  className="bg-black/40 border border-white/5 p-4 rounded-xl flex justify-between items-center group hover:border-neon transition-all"
                                >
                                  <div>
                                    <div className="font-black text-white text-sm flex items-center gap-2">
                                      {p.name}{" "}
                                      <span className="text-[9px] font-mono text-white/40">
                                        {p.age} J.
                                      </span>
                                    </div>
                                    <div className="text-[10px] text-white/40 uppercase tracking-widest">
                                      {p.pos} • {p.club}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-xs font-black text-gold">
                                      € {p.val === "0" ? "FREE" : p.val}
                                    </div>
                                    <button
                                      onClick={() => handlePrepareOffer(p)}
                                      className="text-[9px] font-black uppercase text-neon tracking-widest opacity-0 group-hover:opacity-100 transition-opacity mt-1"
                                    >
                                      Angebot →
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Free Agent Radar (VDV) */}
                          <div className="carbon-fiber border border-white/10 p-6 rounded-2xl">
                            <h4 className="text-xs font-black uppercase tracking-widest text-white mb-6 flex items-center gap-2">
                              <Icon
                                name="user-plus"
                                size={14}
                                className="text-gold"
                              />{" "}
                              VDV Free Agent Pool
                            </h4>
                            <div className="space-y-4">
                              {scoutingPool
                                .filter((p) => p.status === "Free Agent")
                                .map((p) => (
                                  <div
                                    key={p.id}
                                    className="bg-black/60 border border-gold/20 p-4 rounded-xl relative overflow-hidden group hover:border-gold transition-all"
                                  >
                                    <div className="absolute right-0 top-0 p-2 opacity-5">
                                      <Icon name="award" size={40} />
                                    </div>
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <div className="font-black text-gold text-sm">
                                          {p.name}
                                        </div>
                                        <div className="text-[10px] text-white/40 uppercase tracking-widest">
                                          {p.pos} • Erfahren
                                        </div>
                                      </div>
                                      <button
                                        onClick={() => handlePrepareOffer(p)}
                                        className="bg-gold text-black p-2 rounded-lg hover:bg-white transition-colors"
                                      >
                                        <Icon name="briefcase" size={14} />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                            </div>
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
          }) => {
            const [ageGroup, setAgeGroup] = useState("funino"); // 'funino' | 'kleinfeld' | 'grossfeld'
              const [trainingFocus, setTrainingFocus] = useState("dribbling");
              const [isGenerating, setIsGenerating] = useState(false);
              const [trainingPlan, setTrainingPlan] = useState(null);
              const [activeNlzView, setActiveNlzView] = useState("board"); // 'board' | 'dossier' | 'seasonbook'
              const [activeDossierPlayerId, setActiveDossierPlayerId] =
              useState(null);
              const [activeRatingPlayerId, setActiveRatingPlayerId] =
              useState(null);

            // Quick Rating Logic
            const handleQuickRating = (type) => {
              if (!activeRatingPlayerId) return;
              if (navigator.vibrate) navigator.vibrate(50);

              const player = youthPlayers.find(
                (p) => p.id === activeRatingPlayerId,
              );
              if (!player) return;

              let update = { };
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
              {id: "funino", label: "Funino U6-U9", icon: "smile" },
              {id: "kleinfeld", label: "Kleinfeld U10-U13", icon: "layout" },
              {id: "grossfeld", label: "Großfeld U14+", icon: "maximize" },
              ];

              const foci = [
              {id: "dribbling", label: "Dribbling & 1v1", icon: "zap" },
              {id: "passing", label: "Passspiel & Raum", icon: "repeat" },
              {id: "shooting", label: "Torschuss & Abschluss", icon: "target" },
              {
                id: "coordination",
              label: "Koordination & Speed",
              icon: "activity",
              },
              ];

            const generatePlan = async () => {
                setIsGenerating(true);
              setTrainingPlan(null);
              try {
                const prompt = `Du bist der NLZ-Direktor vom 'Fuchs Leistungszentrum'.
              Erstelle einen hochprofessionellen, aber für Laien leicht verständlichen Trainingsplan für die Altersklasse [${ageGroup}].
              Schwerpunkt: ${trainingFocus}.
              TEILE DEN PLAN IN 3 PHASEN:
              1. WARM-UP (Mobilisation & Koordination)
              2. HAUPTTEIL (Spielformen & Technik)
              3. ABSCHLUSS-SPIEL (Wettkampf unter Provokationsregeln)
              Antworte in einem sauberen Listenformat, motivierend und sportwissenschaftlich fundiert.`;

              const res = await askAI(prompt, "NLZ-Direktor");
              setTrainingPlan(res);
              gerdSpeak(
              "Trainingsplan für das Fuchs Leistungszentrum wurde erstellt. Bereit zur Umsetzung.",
              "NLZ-Direktor",
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
              scores: {...psychoScores},
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
              : {focus: 5, effort: 5, teamplay: 5, frustration: 5 },
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
                  {/* Header Section */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#111] p-8 rounded-2xl border-l-8 border-neon shadow-2xl carbon-fiber relative overflow-hidden">
                    <div className="absolute right-0 top-0 opacity-5 pointer-events-none">
                      <Icon name="framer" size={240} />
                    </div>
                    <div className="relative z-10">
                      <h2 className="text-5xl font-black italic tracking-tighter text-white flex items-center gap-4 uppercase mb-2">
                        <Icon name="award" size={42} className="text-neon" />{" "}
                        Fuchs Leistungszentrum
                      </h2>
                      <div className="text-[10px] font-mono text-neon tracking-[0.4em] uppercase font-black">
                        Elite Youth Academy System | Psycho & Performance Hub
                      </div>
                    </div>
                    <div className="mt-6 md:mt-0 flex gap-4">
                      <button
                        onClick={() => setActiveNlzView("board")}
                        className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border-2 flex items-center gap-3 ${activeNlzView === "board" ? "bg-neon text-navy border-neon shadow-[0_0_25px_rgba(0,243,255,0.4)]" : "bg-transparent text-white/40 border-white/10 hover:border-white/30"}`}
                      >
                        <Icon name="layout" size={16} /> Tactical Board
                      </button>
                      <button
                        onClick={() => setActiveNlzView("dossier")}
                        className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border-2 flex items-center gap-3 ${activeNlzView === "dossier" ? "bg-redbull text-white border-redbull shadow-[0_0_25px_rgba(226,27,77,0.4)]" : "bg-transparent text-white/40 border-white/10 hover:border-white/30"}`}
                      >
                        <Icon name="users" size={16} /> Player Dossiers
                      </button>
                      <button
                        onClick={() => setActiveNlzView("seasonbook")}
                        className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border-2 flex items-center gap-3 ${activeNlzView === "seasonbook" ? "bg-gold text-navy border-gold shadow-[0_0_25px_rgba(212,175,55,0.4)]" : "bg-transparent text-white/40 border-white/10 hover:border-white/30"}`}
                      >
                        <Icon name="book-open" size={16} /> Season Book
                      </button>
                    </div>
                  </div>

                  {activeNlzView === "board" && (
                    <div className="space-y-8 animate-fade-in">
                      <div className="flex gap-4">
                        {ageClasses.map((ac) => (
                          <button
                            key={ac.id}
                            onClick={() => setAgeGroup(ac.id)}
                            className={`px-4 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all border flex items-center gap-2 ${ageGroup === ac.id ? "bg-neon text-navy border-neon shadow-[0_0_15px_rgba(0,243,255,0.3)]" : "bg-black/40 text-white/40 border-white/10 hover:border-white/30"}`}
                          >
                            <Icon name={ac.icon} size={14} /> {ac.label}
                          </button>
                        ))}
                      </div>
                      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        {/* LEFT: Tactic Board & Planning */}
                        <div className="xl:col-span-2 space-y-8">
                          <div className="glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
                            <div className="flex items-center justify-between mb-8">
                              <h3 className="text-white font-black uppercase text-sm tracking-widest flex items-center gap-3">
                                <Icon
                                  name="map"
                                  className="text-neon"
                                  size={22}
                                />{" "}
                                Chamäleon-Spielfeld
                              </h3>
                              <div className="text-[8px] font-black text-neon/40 uppercase tracking-widest bg-neon/5 px-3 py-1 rounded-full border border-neon/10">
                                Dynamic Geometry Core
                              </div>
                            </div>

                            <div
                              className="relative group overflow-hidden"
                              style={{ touchAction: "none" }}
                            >
                              {renderPitch()}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>

                              {/* Quick Video Icon (Task 4) */}
                              <label
                                htmlFor="biomech-capture"
                                className="absolute top-4 right-4 bg-redbull p-3 rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform z-30 border-2 border-white/20"
                              >
                                <Icon
                                  name="camera"
                                  size={24}
                                  className="text-white"
                                />
                              </label>
                            </div>

                            {/* Mobile Player Horizontal List (Task 3) */}
                            <div className="md:hidden mt-4 pb-4 overflow-x-auto flex gap-3 custom-scrollbar">
                              {youthPlayers.slice(0, 15).map((p) => (
                                <button
                                  key={p.id}
                                  onClick={() => setActiveRatingPlayerId(p.id)}
                                  className={`shrink-0 p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${activeRatingPlayerId === p.id ? "bg-neon border-neon text-navy" : "bg-white/5 border-white/10 text-white/40"}`}
                                >
                                  <div className="text-[10px] font-black">
                                    {p.position}
                                  </div>
                                  <div className="text-[9px] truncate w-16 text-center">
                                    {p.name}
                                  </div>
                                </button>
                              ))}
                            </div>

                            {/* Quick Rating Bar (Task 2) */}
                            {activeRatingPlayerId && (
                              <div className="mt-6 p-4 bg-navy/40 rounded-2xl border border-white/5 animate-slide-up mobile-only">
                                <div className="flex justify-between items-center mb-4">
                                  <div className="text-[10px] font-black uppercase text-neon tracking-widest">
                                    Quick-Rating:{" "}
                                    {(() => {
                                      const p = youthPlayers.find(
                                        (p) => p.id === activeRatingPlayerId,
                                      );
                                      return p ? p.name : "";
                                    })()}
                                  </div>
                                  <button
                                    onClick={() => setActiveRatingPlayerId(null)}
                                    className="text-white/40 hover:text-white"
                                  >
                                    <Icon name="x" size={14} />
                                  </button>
                                </div>
                                <div className="flex gap-2 h-14">
                                  <button
                                    onClick={() => handleQuickRating("top")}
                                    className="flex-1 bg-green-500 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.4)] border border-white/20"
                                  >
                                    <Icon
                                      name="star"
                                      size={24}
                                      className="text-white"
                                    />
                                  </button>
                                  <button
                                    onClick={() => handleQuickRating("neutral")}
                                    className="flex-1 bg-yellow-500 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(234,179,8,0.4)] border border-white/20"
                                  >
                                    <Icon
                                      name="minus"
                                      size={24}
                                      className="text-white"
                                    />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleQuickRating("correction")
                                    }
                                    className="flex-1 bg-redbull rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(226,27,77,0.4)] border border-white/20"
                                  >
                                    <Icon
                                      name="alert-triangle"
                                      size={24}
                                      className="text-white"
                                    />
                                  </button>
                                </div>
                              </div>
                            )}

                            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-black/40 p-8 rounded-2xl border border-white/5 shadow-inner">
                              <div>
                                <label className="text-[10px] text-white/40 font-black uppercase tracking-widest mb-4 block">
                                  Ziele der Einheit festlegen
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                  {foci.map((f) => (
                                    <button
                                      key={f.id}
                                      onClick={() => setTrainingFocus(f.id)}
                                      className={`p-4 rounded-xl border text-[10px] font-black uppercase tracking-widest flex flex-col items-center gap-3 transition-all ${trainingFocus === f.id ? "bg-white text-navy border-white shadow-xl" : "bg-white/5 text-white/40 border-white/5 hover:bg-white/10 hover:border-white/20"}`}
                                    >
                                      <Icon name={f.icon} size={20} /> {f.label}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <div className="flex flex-col items-center justify-center text-center p-6 border-l border-white/10">
                                <Icon
                                  name="cpu"
                                  size={48}
                                  className={`text-neon mb-4 ${isGenerating ? "animate-spin" : ""}`}
                                />
                                <h4 className="text-white font-black uppercase text-xs tracking-widest mb-3">
                                  KI-Trainingsplaner
                                </h4>
                                <p className="text-white/40 text-[10px] leading-relaxed uppercase mb-6">
                                  Persona: NLZ-Direktor Fuchs. Erstellt
                                  altersgerechte Elite-Einheiten.
                                </p>
                                <button
                                  onClick={generatePlan}
                                  disabled={isGenerating}
                                  className="w-full bg-neon text-navy py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-white transition-all shadow-[0_0_20px_rgba(0,243,255,0.4)] disabled:opacity-50"
                                >
                                  {isGenerating
                                    ? "Generiere Blueprint..."
                                    : "Trainingseinheit generieren"}
                                </button>
                              </div>
                            </div>

                            {trainingPlan && (
                              <div className="mt-8 p-10 bg-[#0a0a0a] border border-neon/30 rounded-3xl animate-slide-up relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                  <Icon name="file-text" size={100} />
                                </div>
                                <div className="flex items-center gap-4 mb-8">
                                  <div className="w-12 h-12 rounded-full bg-neon flex items-center justify-center text-navy shadow-[0_0_15px_rgba(0,243,255,0.5)]">
                                    <Icon name="check" size={24} />
                                  </div>
                                  <div>
                                    <h4 className="text-neon font-black uppercase text-lg tracking-tighter">
                                      Plan Verifiziert
                                    </h4>
                                    <div className="text-[10px] text-white/40 uppercase font-mono tracking-widest">
                                      NLZ-Direktor Freigabe erteilt
                                    </div>
                                  </div>
                                </div>
                                <div className="prose prose-invert max-w-none font-mono text-sm leading-relaxed text-white/80 whitespace-pre-wrap">
                                  {trainingPlan}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* RIGHT: Biomechanics Scanner */}
                          <div className="space-y-8">
                            <div className="glass-panel p-8 rounded-3xl border border-redbull/20 shadow-2xl carbon-fiber">
                              <h3 className="text-redbull font-black uppercase text-sm tracking-widest mb-6 flex items-center gap-3">
                                <Icon name="scan" size={22} /> Biomechanik-Scanner
                              </h3>

                              <div className="relative w-full aspect-video bg-black/80 rounded-2xl border border-white/5 overflow-hidden group">
                                {videoSrc ? (
                                  <video
                                    src={videoSrc}
                                    className="w-full h-full object-cover"
                                    autoPlay
                                    loop
                                    muted
                                  />
                                ) : (
                                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                                    <Icon
                                      name="video"
                                      size={48}
                                      className="text-white/10"
                                    />
                                    <p className="text-white/20 text-[10px] uppercase font-black tracking-widest">
                                      Kein Video geladen
                                    </p>
                                  </div>
                                )}

                                {/* Scanner Grid Overlay */}
                                {isAnalyzing && (
                                  <div className="absolute inset-0 pointer-events-none">
                                    <div className="absolute inset-0 bg-redbull/5 animate-pulse"></div>
                                    <div className="absolute top-0 left-0 w-full h-[2px] bg-redbull shadow-[0_0_15px_#E21B4D] animate-scan"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <div className="grid grid-cols-4 grid-rows-4 gap-4 w-4/5 h-4/5">
                                        {[...Array(16)].map((_, i) => (
                                          <div
                                            key={i}
                                            className="border border-redbull/20 rounded-sm flex items-center justify-center"
                                          >
                                            <div
                                              className="w-1 h-1 bg-redbull/40 rounded-full animate-ping"
                                              style={{
                                                animationDelay: `${i * 0.1}s`,
                                              }}
                                            ></div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div className="mt-6">
                                <input
                                  type="file"
                                  id="biomech-upload"
                                  accept="video/*"
                                  className="hidden"
                                  onChange={handleVideoUpload}
                                />
                                <label
                                  htmlFor="biomech-upload"
                                  className="w-full bg-white/5 border border-white/10 hover:border-redbull hover:bg-white/10 text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 transition-all cursor-pointer"
                                >
                                  <Icon name="upload-cloud" size={18} /> Video zur
                                  Analyse hochladen
                                </label>
                                <input
                                  type="file"
                                  id="biomech-capture"
                                  accept="video/*"
                                  capture="environment"
                                  className="hidden"
                                  onChange={handleVideoUpload}
                                />
                                <label
                                  htmlFor="biomech-capture"
                                  className="md:hidden mt-3 w-full bg-redbull/20 border border-redbull hover:bg-redbull text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 transition-all cursor-pointer shadow-[0_0_15px_rgba(226,27,77,0.4)]"
                                >
                                  <Icon name="camera" size={18} /> Quick Scan
                                  (Kamera)
                                </label>
                              </div>

                              {isAnalyzing && (
                                <div className="mt-6 flex flex-col gap-4">
                                  <div className="flex justify-between items-center text-[10px] font-black uppercase text-redbull tracking-widest">
                                    <span>Extrahiere Skelett-Daten...</span>
                                    <span className="animate-pulse">Active</span>
                                  </div>
                                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-redbull animate-progress"></div>
                                  </div>
                                </div>
                              )}

                              {analysisReport && (
                                <div className="mt-8 p-6 bg-redbull/5 border border-redbull/30 rounded-2xl animate-scale-in">
                                  <h4 className="text-redbull font-black uppercase text-[10px] tracking-widest mb-4 flex items-center gap-2">
                                    <Icon name="activity" size={14} />{" "}
                                    KI-Analysebericht
                                  </h4>
                                  <div className="font-mono text-[11px] leading-relaxed text-white/70 whitespace-pre-wrap">
                                    {analysisReport}
                                  </div>
                                  <div className="mt-6 border-t border-redbull/20 pt-4 flex justify-between items-center">
                                    <button className="text-redbull text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:text-white transition-colors">
                                      <Icon name="youtube" size={14} /> Passendes
                                      Technik-Tutorial ansehen
                                    </button>
                                    {activeDossierPlayerId && videoSrc && (
                                      <button
                                        onClick={saveVideoToTresor}
                                        className="bg-redbull text-white px-3 py-1 rounded text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-redbull transition-all"
                                      >
                                        Tresor Speichern
                                      </button>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* === DOSSIER VIEW === */}
                  {activeNlzView === "dossier" && (
                    <div className="space-y-8 animate-fade-in">
                      <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                        {youthPlayers.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => setActiveDossierPlayerId(p.id)}
                            className={`shrink-0 flex items-center gap-3 p-4 rounded-xl border ${activeDossierPlayerId === p.id ? "bg-redbull border-redbull shadow-[0_0_15px_#E21B4D]" : "bg-black/40 border-white/10 text-white/40"}`}
                          >
                            <div className="w-10 h-10 rounded-full bg-navy flex items-center justify-center font-black text-neon">
                              {p.position}
                            </div>
                            <div className="text-left">
                              <div className="font-black text-white">
                                {p.name}
                              </div>
                              <div className="text-[10px] uppercase">
                                OVR:{" "}
                                {Math.round(
                                  (p.pac +
                                    p.sho +
                                    p.pas +
                                    p.dri +
                                    p.def +
                                    p.phy) /
                                  6,
                                )}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>

                      {activeDossierPlayerId &&
                        (() => {
                          const p = youthPlayers.find(
                            (x) => x.id === activeDossierPlayerId,
                          );
                          if (!p) return null;
                          return (
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                              <div className="space-y-8">
                                <div className="bg-[#111] p-6 rounded-2xl border border-white/10 carbon-fiber shadow-2xl">
                                  <h4 className="text-white font-black uppercase text-sm mb-6 flex items-center gap-3">
                                    <Icon name="activity" className="text-neon" />{" "}
                                    Formkurve / Psycho-Tracker
                                  </h4>

                                  <div className="bg-black/40 p-4 rounded-xl mb-8 border border-white/5 w-full overflow-hidden">
                                    <svg
                                      width="100%"
                                      height="80"
                                      viewBox="0 0 400 80"
                                      preserveAspectRatio="none"
                                    >
                                      <path
                                        d={`M 0 40 ${p.psychHistory &&
                                            p.psychHistory.length > 0
                                            ? p.psychHistory
                                              .map((entry, i) => {
                                                const focus =
                                                  entry.scores &&
                                                    entry.scores.focus
                                                    ? entry.scores.focus
                                                    : 5;
                                                const effort =
                                                  entry.scores &&
                                                    entry.scores.effort
                                                    ? entry.scores.effort
                                                    : 5;
                                                const teamplay =
                                                  entry.scores &&
                                                    entry.scores.teamplay
                                                    ? entry.scores.teamplay
                                                    : 5;
                                                const frustration =
                                                  entry.scores &&
                                                    entry.scores.frustration
                                                    ? entry.scores.frustration
                                                    : 5;
                                                return (
                                                  "L " +
                                                  (i + 1) *
                                                  (400 /
                                                    Math.max(
                                                      1,
                                                      p.psychHistory.length,
                                                    )) +
                                                  " " +
                                                  (80 -
                                                    ((focus +
                                                      effort +
                                                      teamplay +
                                                      (10 - frustration)) /
                                                      4) *
                                                    8)
                                                );
                                              })
                                              .join(" ")
                                            : "L 400 40"
                                          }`}
                                        fill="none"
                                        stroke="#00f3ff"
                                        strokeWidth="3"
                                      />
                                    </svg>
                                  </div>

                                  <div className="space-y-4">
                                    {Object.keys(psychoScores).map((key) => (
                                      <div key={key}>
                                        <div className="flex justify-between text-[10px] text-white/60 uppercase font-black mb-2">
                                          <span>{key}</span>
                                          <span>{psychoScores[key]}</span>
                                        </div>
                                        <input
                                          type="range"
                                          min="1"
                                          max="10"
                                          step="0.5"
                                          value={psychoScores[key]}
                                          onChange={(e) =>
                                            setPsychoScores({
                                              ...psychoScores,
                                              [key]: parseFloat(e.target.value),
                                            })
                                          }
                                          className="w-full accent-neon dossier-slider-mobile"
                                        />
                                      </div>
                                    ))}
                                    <button
                                      onClick={() => generatePsychReport(p.id)}
                                      disabled={isGeneratingPsychReport}
                                      className="w-full mt-4 bg-neon text-navy py-4 font-black uppercase text-[10px] rounded flex justify-center items-center gap-2"
                                    >
                                      {isGeneratingPsychReport ? (
                                        <Icon
                                          name="loader"
                                          className="animate-spin"
                                          size={16}
                                        />
                                      ) : (
                                        <Icon name="cpu" size={16} />
                                      )}
                                      {isGeneratingPsychReport
                                        ? "Diagnose läuft..."
                                        : "Psycho-Review Generieren"}
                                    </button>
                                  </div>
                                  {p.psychHistory &&
                                    p.psychHistory.length > 0 && (
                                      <div className="mt-6 p-4 bg-neon/10 border border-neon/20 rounded font-mono text-[10px] text-neon/80 whitespace-pre-wrap leading-relaxed">
                                        <div className="font-bold mb-1 text-white uppercase tracking-widest border-b border-neon/20 pb-1">
                                          {
                                            p.psychHistory[
                                              p.psychHistory.length - 1
                                            ].date
                                          }
                                        </div>
                                        {
                                          p.psychHistory[
                                            p.psychHistory.length - 1
                                          ].aiReport
                                        }
                                      </div>
                                    )}
                                </div>
                              </div>

                              <div className="bg-[#111] p-6 rounded-2xl border border-redbull/20 shadow-2xl carbon-fiber">
                                <h4 className="text-redbull font-black uppercase text-sm mb-6 flex items-center gap-3">
                                  <Icon name="film" /> Video-Tresor
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {p.videoTresor && p.videoTresor.length > 0 ? (
                                    p.videoTresor.map((vid, idx) => (
                                      <div
                                        key={idx}
                                        className="bg-black/60 rounded-xl overflow-hidden border border-white/10 group cursor-pointer hover:border-redbull transition-all"
                                      >
                                        <video
                                          src={vid.videoSrc}
                                          className="w-full h-32 object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                                        />
                                        <div className="p-3">
                                          <div className="text-[10px] text-white font-black uppercase truncate">
                                            {vid.title}
                                          </div>
                                          <div className="text-[8px] text-white/40 mb-2">
                                            {vid.date}
                                          </div>
                                          <div className="text-[9px] font-mono text-redbull/80 line-clamp-2">
                                            {vid.feedback}
                                          </div>
                                        </div>
                                      </div>
                                    ))
                                  ) : (
                                    <div className="col-span-full py-12 text-center text-white/20 text-[10px] font-black uppercase tracking-widest border-2 border-dashed border-white/10 rounded-xl">
                                      Keine Videos im Tresor
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                    </div>
                  )}

                  {/* === SEASON BOOK VIEW === */}
                  {activeNlzView === "seasonbook" && (
                    <div className="space-y-8 animate-fade-in">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gold/10 p-8 rounded-xl border border-gold/30">
                        <div>
                          <h3 className="text-gold font-black uppercase text-xl tracking-widest flex items-center gap-3 mb-2">
                            <Icon name="book-open" size={28} /> Saison-Fachbuch
                            Generator
                          </h3>
                          <p className="text-white/60 text-xs font-mono uppercase">
                            Automatische Erstellung von Jahresberichten via
                            KI-Synthese
                          </p>
                        </div>
                        <button
                          onClick={generateSeasonBook}
                          disabled={isGeneratingBook}
                          className="mt-6 md:mt-0 bg-gold text-navy px-8 py-4 rounded-xl font-black uppercase text-sm shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:bg-white transition-all transform hover:scale-105"
                        >
                          {isGeneratingBook
                            ? "KI Generiert..."
                            : "Fachbuch Erstellen"}
                        </button>
                      </div>

                      {seasonBookData && (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-8">
                          {seasonBookData.map((report, idx) => (
                            <div
                              key={idx}
                              className="bg-[#f0f0f0] text-navy p-8 rounded-sm shadow-2xl relative"
                            >
                              <div className="absolute top-0 right-0 bg-redbull text-white px-3 py-1 text-[8px] font-black uppercase tracking-widest">
                                CONFIDENTIAL
                              </div>
                              <div className="w-16 h-16 bg-navy/10 rounded-full mb-6 flex items-center justify-center">
                                <img
                                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${report.name}`}
                                  className="w-16 h-16 rounded-full opacity-60 grayscale"
                                  loading="lazy"
                                  alt="Avatar"
                                />
                              </div>
                              <h4 className="text-2xl font-black tracking-tighter uppercase mb-4">
                                {report.name}
                              </h4>
                              <div className="h-[3px] w-12 bg-redbull mb-6"></div>
                              <p className="font-serif text-sm leading-relaxed text-black/80">
                                {report.report}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
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

          // 6. Performance Journal
          const renderJournal = () => {
            return (
              <div className="space-y-8 animate-fade-in max-w-6xl mx-auto pb-20 text-white font-sans">
                {/* MAGAZINE HEADER */}
                <div className="flex flex-col md:flex-row justify-between items-end border-b-8 border-redbull pb-6 gap-6">
                  <div className="flex items-center gap-6">
                    <div className="bg-redbull p-4 text-white shadow-[0_0_30px_rgba(226,27,77,0.4)]">
                      <Icon name="newspaper" size={56} />
                    </div>
                    <div>
                      <h2
                        className={`text-7xl font-black italic tracking-tighter uppercase leading-none ${journal.magazineName === "HEENES-KURIER" ? "text-neon" : "text-white"}`}
                      >
                        {journal.magazineName === "HEENES-KURIER"
                          ? "HEENES"
                          : "STARK"}
                      </h2>
                      <h3 className="text-4xl font-light tracking-[0.2em] text-white/60 uppercase leading-none mt-1">
                        {journal.magazineName === "HEENES-KURIER"
                          ? "KURIER"
                          : "PERFORMANCE"}
                      </h3>
                      <div className="flex items-center gap-2 mt-3 p-1 px-3 bg-white/5 w-fit rounded border border-white/10">
                        <span className="font-mono text-redbull tracking-widest text-[10px] font-black uppercase">
                          EPISODE {new Date().toLocaleDateString("de-DE")}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-white/20"></span>
                        <span className="font-mono text-white/40 tracking-widest text-[10px] uppercase">
                          CONFIDENTIAL
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={generateJournalContent}
                      disabled={isJournalLoading}
                      className={`group bg-white text-navy px-8 py-4 rounded-sm font-black uppercase tracking-widest text-xs hover:bg-neon transition-all flex items-center gap-3 shadow-[0_10px_30px_rgba(0,0,0,0.5)] active:scale-95 ${isJournalLoading ? "opacity-50 cursor-wait" : ""}`}
                    >
                      <Icon
                        name="refresh-cw"
                        className={
                          isJournalLoading
                            ? "animate-spin"
                            : "group-hover:rotate-180 transition-all duration-700"
                        }
                        size={18}
                      />
                      JOURNAL GENERIEREN
                    </button>
                  </div>
                </div>

                {!journal ? (
                  <div
                    className="h-[60vh] flex flex-col items-center justify-center border-4 border-dashed border-white/5 rounded-3xl bg-white/2 cursor-pointer group hover:bg-white/5 transition-all"
                    onClick={generateJournalContent}
                  >
                    <div className="relative">
                      <Icon
                        name="newspaper"
                        size={120}
                        className="text-white/5 group-hover:text-redbull/20 transition-all duration-700"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Icon
                          name="plus"
                          size={40}
                          className="text-redbull animate-pulse"
                        />
                      </div>
                    </div>
                    <p className="text-white/40 font-black uppercase tracking-[0.3em] text-sm mt-8">
                      System wartet auf Redaktions-Input
                    </p>
                    <p className="text-white/20 text-xs mt-2 uppercase">
                      Initialisiere Presse-Gerd Kern für Erstausgabe
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-12">
                    {/* LEFT COLUMN: COVER & EDITORIAL (7 cols) */}
                    <div className="lg:col-span-8 space-y-12">
                      <div className="relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-2 h-20 bg-redbull"></div>
                        <h3 className="text-8xl font-black text-white italic tracking-tighter uppercase mb-2 leading-[0.85] transition-all duration-700 group-hover:text-redbull">
                          {journal.title}
                        </h3>
                        <div className="bg-white/10 h-[1px] w-full my-8"></div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                          <div className="space-y-6">
                            <div className="flex items-center gap-3 text-redbull font-black uppercase text-xs tracking-[0.2em]">
                              <span className="w-8 h-[2px] bg-redbull"></span>{" "}
                              EDITORIAL
                            </div>
                            <p className="text-2xl font-light text-white/90 leading-tight italic border-l-2 border-white/10 pl-6">
                              "{journal.editorial}"
                            </p>
                          </div>
                          <div className="bg-navy/40 p-8 border border-white/5 rounded-sm relative">
                            <Icon
                              name="quote"
                              className="absolute -top-4 -left-4 text-redbull opacity-40"
                              size={40}
                            />
                            <h4 className="text-neon font-black uppercase text-[10px] tracking-widest mb-4">
                              TRAINER-GERD INTERVIEW
                            </h4>
                            <blockquote className="text-lg font-serif italic text-white/80 leading-relaxed">
                              {journal.interview}
                            </blockquote>
                          </div>
                        </div>
                      </div>

                      <div className="p-10 bg-black/40 border-t border-b border-white/10">
                        <div className="flex items-center gap-4 mb-6">
                          <Icon name="zap" size={24} className="text-gold" />
                          <h4 className="text-gold font-black uppercase text-sm tracking-[0.3em]">
                            TAKTISCHES UPDATE
                          </h4>
                        </div>
                        <p className="text-xl font-mono text-white/60 leading-relaxed uppercase">
                          {journal.tactics}
                        </p>
                      </div>
                    </div>

                    {/* RIGHT COLUMN: SIDEBAR (4 cols) */}
                    <div className="lg:col-span-4 space-y-8">
                      {/* MEDICAL UPDATE BOX */}
                    </div>

                    {/* SPONSOR CORNER */}
                    {journal.sponsor && (
                      <div className="bg-navy p-8 border border-gold/30 shadow-[0_10px_40px_rgba(212,175,55,0.15)] relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                          <Icon name="award" size={80} className="text-gold" />
                        </div>
                        <div className="flex items-center gap-3 mb-6">
                          <div className="bg-gold p-2 rounded-full">
                            <Icon name="star" size={16} className="text-navy" />
                          </div>
                          <h4 className="text-gold font-black uppercase text-xs tracking-widest">
                            Sponsoren-Ecke
                          </h4>
                        </div>
                        <p className="text-white/80 font-serif italic text-lg leading-relaxed border-l-2 border-gold/20 pl-6">
                          {journal.sponsor}
                        </p>
                      </div>
                    )}

                    {/* SCAN QR / DIGITAL TWIN */}
                    <div className="glass-panel p-8 border border-white/5 flex flex-col items-center text-center gap-4">
                      <div className="w-32 h-32 bg-white p-2">
                        <img
                          src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=STARK-ELITE-JOURNAL"
                          alt="QR Code"
                          loading="lazy"
                        />
                      </div>
                      <div>
                        <h5 className="font-black text-[10px] uppercase tracking-widest text-white/40">
                          DIGITAL EDITION
                        </h5>
                        <p className="text-[9px] font-mono text-neon mt-1">
                          SCAN FOR MOBILE DEEP DIVE
                        </p>
                      </div>
                    </div>

                    {/* ADS / PARTNERS */}
                    <div className="p-6 border border-white/5 bg-white/2 flex justify-between items-center opacity-40 hover:opacity-100 transition-opacity">
                      <span className="text-[8px] font-black uppercase tracking-[0.5em]">
                        PARTNER: RED BULL ALPHA
                      </span>
                      <Icon name="shield-check" size={16} />
                    </div>
                  </div>
                )}
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
              const vrEditRef = React.useRef({field: "", value: "", playerId: -1 });
          useEffect(() => {
            const handlePlayerMoved = (e) => {
              const {id, vrX, vrZ} = e.detail;
              // Update vrX/vrZ on the player
              setPlayers((prev) =>
                prev.map((p) => (p.id === id ? {...p, vrX, vrZ} : p)),
              );
              // Also write back into playerPositions (3D table → 2D field coordinate mapping)
              // VR table: x [-2.2, 2.2], z [-1.5, 1.5] → field px: x [0,420], y [0,640]
              const fieldX = ((vrX + 2.2) / 4.4) * 420;
              const fieldY = ((vrZ + 1.5) / 3.0) * 640;
              setPlayerPositions((prev) => {
                const next = {
                ...prev,
                [id]: {x: Math.round(fieldX), y: Math.round(fieldY) },
                };
              localStorage.setItem(
              "gerd_playerPositions",
              JSON.stringify(next),
              );
              return next;
              });
            };
            const handleOpenTab = (e) => {
              const {tab} = e.detail;

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
              const {char} = e.detail;
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
              vrEditRef.current = {field: "", value: "", playerId: -1 };
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

                  {/* ========== CENTRAL TACTICAL PITCH (0 0 0) ========== */}
                  <a-entity position="0 0.8 0">
                    {/* Table Base & Glowing Rim */}
                    <a-cylinder
                      radius="2.3"
                      height="0.1"
                      color="#111"
                      metalness="0.5"
                      roughness="0.5"
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
              <div className="app-root w-full h-full relative">
                <div
                  className={`min-h-screen flex flex-col md:flex-row bg-[#000000] relative transition-all duration-700 ${gerdThinking ? "ai-pulse-active" : ""}`}
                >
                  <NeuralBackground />
                  {/* SetupWizard Overlay */}
                  {!hasOnboarded && (
                    <SetupWizard
                      onComplete={(data) => {
                        setClubIdentity(data);
                        setHasOnboarded(true);
                        setSimulationMode(false);
                        localStorage.setItem(
                          "gerd_clubIdentity",
                          JSON.stringify(data),
                        );
                        localStorage.setItem("gerd_hasOnboarded", "true");
                        localStorage.setItem("gerd_simulationMode", "false");
                        if (data.primaryColor)
                          document.documentElement.style.setProperty(
                            "--color-neon",
                            data.primaryColor,
                          );
                        if (data.secondaryColor)
                          document.documentElement.style.setProperty(
                            "--color-redbull",
                            data.secondaryColor,
                          );
                        gerdSpeak(
                          `System initialisiert für ${data.name}. Willkommen im Stark Elite Hub.`,
                          "System",
                        );
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
                      <h1 className="text-3xl font-black italic tracking-tighter flex flex-col uppercase">
                        GERD 2.0
                        <span className="text-redbull text-base tracking-widest font-sans mt-1 flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-redbull animate-pulse"></div>{" "}
                          STARK ELITE
                        </span>
                      </h1>
                    </div>

                    {/* Navigation */}
                    <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
                      {[
                        {
                          id: "home",
                          label: "Zentrale",
                          icon: "home",
                          color: "neon",
                        },
                        {
                          id: "tactical",
                          label: "Tactical Hub",
                          icon: "shield",
                          color: "neon",
                        },
                        {
                          id: "medical",
                          label: "Medical Lab",
                          icon: "activity",
                          color: "redbull",
                        },
                        {
                          id: "video",
                          label: "Video Hub",
                          icon: "monitor-play",
                          color: "white",
                        },
                        {
                          id: "cfo",
                          label: "CFO Board",
                          icon: "pie-chart",
                          color: "gold",
                        },
                        {
                          id: "nlz",
                          label: "NLZ Funino",
                          icon: "layout-grid",
                          color: "neon",
                        },
                        {
                          id: "journal",
                          label: "Performance Journal",
                          icon: "newspaper",
                          color: "white",
                        },
                      ].map((item) => {
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
                  <div className="flex-1 h-screen overflow-y-auto relative p-6 md:p-12 main-content-mobile">
                    {showBriefing && (
                      <IntelligenceBriefing
                        onClose={() => setShowBriefing(false)}
                      />
                    )}
                    {/* VR Launch Button (Top Right Absolute) */}
                    <div className="absolute top-8 right-8 z-50 flex gap-4">
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
                      {activeTab === "tactical" && renderTactical()}
                      {activeTab === "medical" && renderMedical()}
                      {activeTab === "video" && renderVideo()}
                      {activeTab === "cfo" && renderCFO()}
                      {activeTab === "nlz" && (
                        <div className="animate-fade-in min-h-screen bg-[#000000] relative z-20">
                          <FuchsNLZ
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
                          />
                        </div>
                      )}
                      {activeTab === "journal" && renderJournal()}
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
                            <div className="bg-navy/40 p-6 rounded-2xl border border-white/5">
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
                              <Icon
                                name="youtube"
                                size={24}
                                className="text-red-500"
                              />{" "}
                              YouTube Sync
                            </h2>
                            <button
                              onClick={() => setIsSyncModalOpen(false)}
                              className="text-white/40 hover:text-white transition-colors"
                            >
                              <Icon name="x" size={24} />
                            </button>
                          </div>

                          <div className="space-y-6">
                            <div className="bg-navy/40 p-4 rounded-xl border border-white/5 text-[11px] text-white/60 leading-relaxed">
                              Gib die **YouTube Playlist ID** ein, um Sequenzen
                              direkt in das System zu laden.
                            </div>

                            <div>
                              <label className="block text-[10px] uppercase font-black text-white/40 mb-2 tracking-widest">
                                Playlist ID
                              </label>
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
                              {isSyncing ? (
                                <Icon
                                  name="loader"
                                  size={18}
                                  className="animate-spin"
                                />
                              ) : (
                                <Icon name="refresh-cw" size={18} />
                              )}
                              {isSyncing ? "Synchronisiere..." : "Playlist Laden"}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    {/* MOBILE BOTTOM NAVIGATION */}
                    <div className="md:hidden mobile-bottom-nav">
                      {[
                        { id: "home", label: "Home", icon: "home", color: "neon" },
                        {
                          id: "tactical",
                          label: "Board",
                          icon: "shield",
                          color: "neon",
                        },
                        {
                          id: "medical",
                          label: "Kader",
                          icon: "activity",
                          color: "redbull",
                        },
                        {
                          id: "nlz",
                          label: "NLZ",
                          icon: "layout-grid",
                          color: "neon",
                        },
                        {
                          id: "cfo",
                          label: "Büro",
                          icon: "pie-chart",
                          color: "gold",
                        },
                        {
                          id: "settings",
                          label: "Core",
                          icon: "settings",
                          color: "white",
                          isSettings: true,
                        },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() =>
                            item.isSettings
                              ? setIsSettingsOpen(true)
                              : setActiveTab(item.id)
                          }
                          className={`flex flex-col items-center justify-center p-2 text-[9px] font-black uppercase tracking-widest ${item.isSettings && isSettingsOpen ? "text-white" : activeTab === item.id ? "text-white" : "text-white/40"}`}
                        >
                          <Icon
                            name={item.icon}
                            size={24}
                            className={
                              activeTab === item.id && !item.isSettings
                                ? `text-${item.color} drop-shadow-[0_0_8px_rgba(0,243,255,0.5)]`
                                : ""
                            }
                          />
                          <span className="mt-1">{item.label}</span>
                        </button>
                      ))}
                    </div>{" "}
                    {/* End main-content */}
                  </div>{" "}
                  {/* End flex-container */}
                </div>{" "}
                {/* End app-root */}
              </div>
              );
        };

              const root = ReactDOM.createRoot(document.getElementById("root"));
              root.render(<App />);
    </script>
  </body>
</html>
