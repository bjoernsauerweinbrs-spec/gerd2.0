import React, { useState, useEffect, useRef } from 'react';
import Icon from './Icon';
import { sendAiRequest } from '../utils/aiConfig';
import { speakGerd, ensureVoicesLoaded } from '../utils/audioUtils';

/**
 * GerdLiveAssistant: The interactive voice assistant for Stark Elite.
 * Replaces the static command input with a live, voice-first interaction model.
 */
const GerdLiveAssistant = ({ activeRole, activeTab, truthObject }) => {
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [lastResponse, setLastResponse] = useState("");

    const recognitionRef = useRef(null);

    useEffect(() => {
        // Initialize Speech Recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'de-DE';

            recognitionRef.current.onresult = (event) => {
                const text = event.results[0][0].transcript;
                setTranscript(text);
                handleVoiceCommand(text);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current.onerror = (event) => {
                console.error("Speech Recognition Error:", event.error);
                setIsListening(false);
            };
        }

        // Pre-load voices
        ensureVoicesLoaded(() => {
            console.log("Gerd Voice Module Ready.");
        });

        return () => {
            if (recognitionRef.current) recognitionRef.current.stop();
        };
    }, []);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            setTranscript("");
            setLastResponse("");
            setIsListening(true);
            recognitionRef.current?.start();
        }
    };

    const handleVoiceCommand = async (command) => {
        setIsProcessing(true);
        
        const systemPrompt = `Du bist "Gerd" (Nagelsmann + Klopp Hybrid), der künstliche Co-Trainer und Assistent für ${activeRole}.
Du bist in einem Live-Modus auf dem Stark Elite Dashboard.
Aktuelle Seite: ${activeTab}
Vereins-Kontext: ${truthObject?.club_info?.name || "Stark Elite"}
Letztes Spiel: ${truthObject?.club_info?.liveIntelligence?.lastMatch || "N/A"}
Kader-Status: ${truthObject?.matchday_roster?.length || 0} Spieler einsatzbereit.

Deine Aufgabe:
1. Reagiere auf die Sprachnachricht des Users: "${command}"
2. Antworte in deinem typischen "Gerd-Sprech": Taktisch brillant, leidenschaftlich, direkt.
3. Wenn der User eine Aktion möchte (z.B. "Zeig mir den Kader", "Gehe zum Kalender"), kannst du navigieren.

WICHTIG: Antworte ZWINGEND in folgendem JSON-Format:
{
  "speak": "[Dein kurzer, prägnanter Antwort-Satz für die TTS]",
  "action": "[OPTIONAL: navigation:ROSTER, navigation:CALENDAR, navigation:DASHBOARD, navigation:NLZ, navigation:MEDICAL, navigation:LEGACY, refresh:ROSTER]",
  "advice": "[Zusätzlicher taktischer Rat]"
}

Antworte absolut zwingend auf Deutsch.`;

        try {
            let response = await sendAiRequest(systemPrompt);
            
            // Clean up JSON if necessary
            let raw = response.trim();
            if (raw.startsWith("```json")) raw = raw.replace(/^```json/, "").replace(/```$/, "").trim();
            else if (raw.startsWith("```")) raw = raw.replace(/^```/, "").replace(/```$/, "").trim();
            
            const parsed = JSON.parse(raw);
            setLastResponse(parsed.speak);
            
            // Execute Action if any
            if (parsed.action) {
                handleAssistantAction(parsed.action);
            }

            // Speak the response
            setIsSpeaking(true);
            speakGerd(parsed.speak, {
                onEnd: () => setIsSpeaking(false)
            });

        } catch (error) {
            console.error("Gerd Live AI Error:", error);
            speakGerd("Entschuldige Coach, da gab es eine Funkstörung im Taktikraum.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleAssistantAction = (action) => {
        console.log("Gerd Action Triggered:", action);
        // Dispatch custom event for navigation/refresh
        const [type, value] = action.split(':');
        if (type === 'navigation') {
            const event = new CustomEvent('gerd-navigate', { detail: value });
            window.dispatchEvent(event);
        } else if (type === 'refresh') {
            const event = new CustomEvent('gerd-refresh', { detail: value });
            window.dispatchEvent(event);
        }
    };

    return (
        <div className="flex items-center gap-4">
            {/* Live Visualization */}
            {(isListening || isProcessing || isSpeaking) && (
                <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-black/40 border border-neon/30 rounded-lg animate-fade-in">
                    <div className="flex gap-1 h-3 items-center">
                        {[1, 2, 3, 4].map(i => (
                            <div 
                                key={i} 
                                className={`w-1 bg-neon rounded-full ${isListening ? 'animate-bounce' : 'animate-pulse'}`} 
                                style={{ 
                                    height: isListening ? `${40 + Math.random() * 60}%` : '40%',
                                    animationDelay: `${i * 0.1}s` 
                                }}
                            />
                        ))}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-neon animate-pulse">
                        {isListening ? 'Zuhören...' : isProcessing ? 'Denken...' : 'Sprechen...'}
                    </span>
                </div>
            )}

            {/* Transcript/Info Display */}
            {transcript && (
                <div className="hidden lg:block max-w-[200px] text-[10px] font-mono text-white/40 truncate italic">
                    "{transcript}"
                </div>
            )}

            {/* MAIN LIVE BUTTON */}
            <button
                onClick={toggleListening}
                disabled={isProcessing}
                className={`group relative flex items-center gap-3 px-6 py-3 rounded-xl font-black uppercase text-xs tracking-[0.2em] transition-all duration-500 overflow-hidden ${
                    isListening 
                        ? 'bg-redbull text-white shadow-[0_0_30px_rgba(226,27,77,0.5)]' 
                        : isSpeaking 
                            ? 'bg-neon text-black shadow-[0_0_30px_rgba(0,243,255,0.4)]' 
                            : 'bg-white/5 border border-white/10 text-white/40 hover:bg-white/10 hover:text-white'
                }`}
            >
                {/* Glow Effect */}
                <div className={`absolute inset-0 bg-white/20 transition-opacity duration-500 ${isListening ? 'opacity-20 animate-pulse' : 'opacity-0'}`} />
                
                <div className="relative flex items-center gap-2">
                    {isProcessing ? (
                        <Icon name="cpu" size={16} className="animate-spin text-neon" />
                    ) : (
                        <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-white animate-pulse' : isSpeaking ? 'bg-black' : 'bg-neon/40'} group-hover:bg-neon`} />
                    )}
                    <span>Gerd <span className={isListening ? 'text-white' : 'text-neon'}>LIVE</span></span>
                </div>

                {isSpeaking && <Icon name="volume-2" size={14} className="animate-pulse" />}
            </button>
        </div>
    );
};

export default GerdLiveAssistant;
