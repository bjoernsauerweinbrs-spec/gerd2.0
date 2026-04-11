import React, { useState, useEffect, useRef } from 'react';
import { Pose, POSE_CONNECTIONS } from '@mediapipe/pose';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { sendAiRequest } from '../../utils/aiConfig';
import Icon from '../Icon';
import ReactMarkdown from 'react-markdown';

const calculateAngle = (a, b, c) => {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs((radians * 180.0) / Math.PI);
    if (angle > 180.0) angle = 360 - angle;
    return Math.round(angle);
};

const BiometricDiagnostics = ({ onClose }) => {
    const [videoUrl, setVideoUrl] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [capturedData, setCapturedData] = useState(null);
    const [aiFeedback, setAiFeedback] = useState("");
    const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
    const [activityType, setActivityType] = useState('Torschuss');

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const poseRef = useRef(null);
    const currentLandmarksRef = useRef(null);
    const animationRef = useRef(null);

    useEffect(() => {
        // Initialize MediaPipe Pose
        const pose = new Pose({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
            }
        });

        pose.setOptions({
            modelComplexity: 1,
            smoothLandmarks: true,
            enableSegmentation: false,
            smoothSegmentation: false,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        pose.onResults((results) => {
            currentLandmarksRef.current = results.poseLandmarks || null;
            
            if (canvasRef.current && videoRef.current) {
                const canvasCtx = canvasRef.current.getContext('2d');
                canvasCtx.save();
                canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                
                if (results.poseLandmarks) {
                    drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, { color: '#00FF00', lineWidth: 4 });
                    drawLandmarks(canvasCtx, results.poseLandmarks, { color: '#FF0000', lineWidth: 2, radius: 4 });
                }
                canvasCtx.restore();
            }
        });

        poseRef.current = pose;

        return () => {
            if (poseRef.current) poseRef.current.close();
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, []);

    const processVideoFrame = async () => {
        if (videoRef.current && !videoRef.current.paused && !videoRef.current.ended) {
            if (poseRef.current) {
                await poseRef.current.send({ image: videoRef.current });
            }
            animationRef.current = requestAnimationFrame(processVideoFrame);
        }
    };

    const handleVideoPlay = () => {
        processVideoFrame();
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setVideoUrl(URL.createObjectURL(file));
            setCapturedData(null);
            setAiFeedback("");
        }
    };

    const captureMoment = () => {
        if (!currentLandmarksRef.current) {
            alert("Noch kein Skelett erkannt. Bitte Video abspielen.");
            return;
        }

        if (videoRef.current) videoRef.current.pause();

        const marks = currentLandmarksRef.current;
        
        // Landmark Indices:
        // 11/12 Shoulder, 23/24 Hip, 25/26 Knee, 27/28 Ankle
        const leftHip = marks[23];
        const leftKnee = marks[25];
        const leftAnkle = marks[27];
        
        const rightHip = marks[24];
        const rightKnee = marks[26];
        const rightAnkle = marks[28];

        const leftShoulder = marks[11];
        const rightShoulder = marks[12];

        // Determine which leg is likely the standing leg (usually the more extended one or lower one, but we'll approximate)
        const leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
        const rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);
        
        // Determine trunk lean (average shoulder to average hip relative to vertical)
        // A simple angle of the torso line vs the vertical line.
        const midShoulder = { x: (leftShoulder.x + rightShoulder.x) / 2, y: (leftShoulder.x + rightShoulder.x) / 2 };
        const midHip = { x: (leftHip.x + rightHip.x) / 2, y: (leftHip.y + rightHip.y) / 2 };
        // We can just look at dx and dy
        const trunkDx = midShoulder.x - midHip.x;
        const trunkDy = midShoulder.y - midHip.y; // Negative since y increases downwards
        // Angle to vertical:
        const trunkAngleRadians = Math.atan2(Math.abs(trunkDx), Math.abs(trunkDy));
        const trunkLeanDegrees = Math.round((trunkAngleRadians * 180) / Math.PI);

        const data = {
            leftKneeAngle,
            rightKneeAngle,
            trunkLeanDegrees,
            action: activityType,
            timestamp: videoRef.current ? Math.round(videoRef.current.currentTime * 100)/100 : 0
        };

        setCapturedData(data);
    };

    const analyzeWithAi = async () => {
        if (!capturedData) return;
        
        setIsGeneratingFeedback(true);

        const mathPayload = `
AKTION: ${capturedData.action}
FRAME-TIMECODE: ${capturedData.timestamp}s

EXTRAHIERTE MEDIA-PIPE DIAGNOSTIK (Impact-Frame):
- Linker Kniewinkel: ${capturedData.leftKneeAngle} Grad
- Rechter Kniewinkel: ${capturedData.rightKneeAngle} Grad
- Körpervorlage (Trunk Lean): ${capturedData.trunkLeanDegrees} Grad
        `;

        const systemPrompt = `Du bist 'Gerd 2.0', der Head of Performance in einem Elite-Nachwuchsleistungszentrum (Niveau: Norbert Elgert / Julian Nagelsmann). 
Du erhältst hier harte biomechanische Tracking-Daten eines Jugendspielers aus einer KI-Videoanalyse. 

Daten-Payload:
${mathPayload}

DEINE AUFGABE:
1. Bewerte diese harten Daten fachlich. Sind die Winkel für diese Aktion (z.B. Torschuss oder Pass) optimal für eine maximale Kraftübertragung und Präzision? 
Hinweis: Ein Standbein sollte beim Schuss oft leicht gebeugt (ca 160-170 Grad) sein für Stabilität. Körpervorlage über dem Ball ist wichtig für Flachschüsse (ca 10-20 Grad).
2. Nenne exakt 2 konkrete, praxisnahe Fehlerkorrekturen, die der Jugendtrainer dem Spieler sofort auf den Platz mit auf den Weg geben kann. 

Antworte hochprofessionell, messerscharf und in präzisem Markdown. Keine langen Intros.`;

        try {
            const result = await sendAiRequest(systemPrompt);
            setAiFeedback(result);
        } catch (error) {
            setAiFeedback("Fehler bei der KI-Analyse: " + error.message);
        } finally {
            setIsGeneratingFeedback(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
            <div className="bg-[#0b1324] border border-neon/30 w-full max-w-6xl h-[90vh] rounded-3xl shadow-[0_0_50px_rgba(0,243,255,0.15)] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center bg-black/40 p-6 border-b border-white/10">
                    <div>
                        <h3 className="text-white font-black uppercase tracking-widest text-xl flex items-center gap-3">
                            <Icon name="activity" className="text-neon" size={28} /> 
                            Smart-Vision Diagnostik
                        </h3>
                        <p className="text-white/40 text-[10px] mt-1 font-mono uppercase tracking-widest">Client-Side MediaPipe Engine + Gemini Analytics</p>
                    </div>
                    <button onClick={onClose} className="text-white/40 hover:text-white transition-colors bg-white/5 p-2 rounded-lg">
                        <Icon name="x" size={24} />
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Left Panel: Video & Computer Vision */}
                    <div className="w-1/2 p-6 flex flex-col gap-4 border-r border-white/10 overflow-y-auto">
                        {!videoUrl ? (
                            <div className="flex-1 bg-white/5 border-2 border-white/10 border-dashed rounded-2xl flex flex-col items-center justify-center p-8 text-center">
                                <Icon name="video" size={48} className="text-white/20 mb-4" />
                                <h4 className="text-white font-black uppercase tracking-widest mb-2">Technik-Video hochladen</h4>
                                <p className="text-white/50 text-xs mb-6">Wähle ein kurzes Video eines Spielers (Schuss, Pass, etc).</p>
                                <label className="cursor-pointer bg-neon text-black px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-transform shadow-[0_0_15px_rgba(0,243,255,0.4)]">
                                    Video auswählen
                                    <input type="file" accept="video/mp4,video/quicktime" onChange={handleFileUpload} className="hidden" />
                                </label>
                            </div>
                        ) : (
                            <div className="flex flex-col h-full gap-4">
                                <div className="relative rounded-2xl overflow-hidden bg-black aspect-video border border-white/10 shadow-lg">
                                    <video 
                                        ref={videoRef}
                                        src={videoUrl}
                                        className="w-full h-full object-contain"
                                        controls
                                        onPlay={handleVideoPlay}
                                        crossOrigin="anonymous"
                                    />
                                    {/* The Canvas that overlays the MediaPipe Skeleton */}
                                    <canvas 
                                        ref={canvasRef} 
                                        className="absolute top-0 left-0 w-full h-full pointer-events-none"
                                        width={640} // Default internal res, will scale via CSS
                                        height={360}
                                    />
                                </div>
                                
                                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                    <label className="text-[10px] text-neon font-black uppercase tracking-widest mb-2 block">Analysierte Aktion</label>
                                    <select 
                                        value={activityType}
                                        onChange={(e) => setActivityType(e.target.value)}
                                        className="w-full bg-black/60 border border-white/10 rounded-lg px-4 py-2 text-white text-xs focus:border-neon outline-none"
                                    >
                                        <option value="Torschuss">Torschuss</option>
                                        <option value="Eckball">Eckball</option>
                                        <option value="Flanke">Flanke</option>
                                        <option value="Lauftechnik">Lauftechnik (Sprint)</option>
                                    </select>
                                </div>

                                <div className="mt-auto">
                                    <button 
                                        onClick={captureMoment}
                                        className="w-full py-4 bg-white hover:bg-neon hover:text-black hover:border-transparent text-navy font-black uppercase tracking-widest text-xs rounded-xl flex items-center justify-center gap-2 transition-all border border-transparent shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(0,243,255,0.6)]"
                                    >
                                        <Icon name="camera" size={16} /> Impact Frame Einfrieren & Messen
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Panel: Data Math and Gemini Analysis */}
                    <div className="w-1/2 p-6 flex flex-col gap-6 overflow-y-auto bg-black/20">
                        {/* Math Extraction Box */}
                        <div className="bg-black/60 border border-white/10 p-6 rounded-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5"><Icon name="database" size={100} /></div>
                            <h4 className="text-white font-black uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
                                <Icon name="bar-chart-2" size={16} className="text-neon" /> Live Biometrie (Rohdaten)
                            </h4>
                            
                            {capturedData ? (
                                <div className="grid grid-cols-2 gap-4 relative z-10">
                                    <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                                        <div className="text-[10px] text-white/40 uppercase font-black">Linkes Knie</div>
                                        <div className="text-xl font-bold text-white mt-1">{capturedData.leftKneeAngle}°</div>
                                    </div>
                                    <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                                        <div className="text-[10px] text-white/40 uppercase font-black">Rechtes Knie</div>
                                        <div className="text-xl font-bold text-white mt-1">{capturedData.rightKneeAngle}°</div>
                                    </div>
                                    <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                                        <div className="text-[10px] text-white/40 uppercase font-black">Körpervorlage</div>
                                        <div className="text-xl font-bold text-neon mt-1">{capturedData.trunkLeanDegrees}°</div>
                                    </div>
                                    <div className="bg-white/5 p-3 rounded-lg border border-white/10 flex items-center justify-center">
                                        <button 
                                            onClick={analyzeWithAi}
                                            disabled={isGeneratingFeedback}
                                            className="w-full h-full bg-neon/10 hover:bg-neon text-neon hover:text-navy border border-neon/30 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all gap-2 flex items-center justify-center disabled:opacity-50"
                                        >
                                            {isGeneratingFeedback ? <Icon name="loader" className="animate-spin" /> : "KI Analyse Starten"}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-24 flex items-center justify-center border border-dashed border-white/10 rounded-xl relative z-10">
                                    <span className="text-xs text-white/30 uppercase tracking-widest">Warte auf Impact Frame...</span>
                                </div>
                            )}
                        </div>

                        {/* AI Feedback Box */}
                        <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl flex flex-col overflow-hidden">
                            <div className="bg-black/40 px-6 py-4 border-b border-white/10 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-neon/20 border border-neon flex items-center justify-center">
                                    <Icon name="cpu" size={14} className="text-neon" />
                                </div>
                                <div>
                                    <div className="text-white font-black uppercase tracking-widest text-xs">NLZ Head of Performance</div>
                                    <div className="text-neon text-[9px] uppercase tracking-widest font-mono">Gerd 2.0 Neuro-Analyse</div>
                                </div>
                            </div>
                            
                            <div className="p-6 overflow-y-auto flex-1">
                                {isGeneratingFeedback ? (
                                    <div className="flex flex-col items-center justify-center h-full gap-4 text-white/30">
                                        <Icon name="loader" size={32} className="animate-spin text-neon" />
                                        <span className="text-[10px] font-black uppercase tracking-widest animate-pulse">Winkel werden bewertet...</span>
                                    </div>
                                ) : aiFeedback ? (
                                    <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-headings:text-white prose-a:text-neon prose-strong:text-neon">
                                        <ReactMarkdown components={{
                                            h1: ({node, ...props}) => <h1 className="text-xl font-black uppercase mb-4 text-white pb-2 border-b border-white/10" {...props} />,
                                            h2: ({node, ...props}) => <h2 className="text-lg font-bold uppercase mb-3 mt-6 border-l-2 border-neon pl-3" {...props} />,
                                            h3: ({node, ...props}) => <h3 className="text-sm font-bold uppercase mb-2 mt-4 text-white/70" {...props} />,
                                            ul: ({node, ...props}) => <ul className="space-y-2 mb-4" {...props} />,
                                            li: ({node, ...props}) => <li className="flex items-start gap-3"><span className="text-neon mt-1">▹</span><span {...props} /></li>,
                                        }}>
                                            {aiFeedback}
                                        </ReactMarkdown>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-center opacity-40">
                                        <Icon name="message-square" size={48} className="mb-4 text-white/20" />
                                        <p className="text-[10px] uppercase font-black tracking-widest">Bereit für biomechanische Daten</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BiometricDiagnostics;
