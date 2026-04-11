import React, { useState } from 'react';
import Icon from './Icon';
import ReactMarkdown from 'react-markdown';

const MediaHub = ({ truthObject }) => {
    const [selectedType, setSelectedType] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedContent, setGeneratedContent] = useState("");
    const [previewMode, setPreviewMode] = useState(true);

    const clubName = truthObject?.club_info?.name || "Stark Elite";
    const nextMatch = truthObject?.club_info?.liveIntelligence?.nextMatch || "Unbekannter Gegner";
    const lastMatch = truthObject?.club_info?.liveIntelligence?.lastMatch || "Unbekannt";
    const squadInfo = truthObject?.matchday_roster?.map(p => p.name).join(", ") || "Keine Kaderdaten verfügbar";
    const tacticalNotes = truthObject?.club_info?.liveIntelligence?.tacticalNotes || "Fokus auf kompakte Defensive und schnelles Umschaltspiel.";

    const contentTypes = [
        { id: 'vorbericht', title: 'Der Vorbericht', icon: 'file-text', desc: 'Analytischer, fesselnder Artikel für das Stadionmagazin.', color: 'gold' },
        { id: 'social', title: 'Social Media Teaser', icon: 'smartphone', desc: 'Plattform-optimierte 3-Phasen Kampagne (X, Insta, TikTok).', color: 'neon' },
        { id: 'stimme', title: 'Trainer-Stimme', icon: 'mic', desc: 'Fiktive O-Töne des Headcoaches zur strategischen Lage.', color: 'red-600' },
        { id: 'eltern', title: 'Eltern-Ecke (NLZ)', icon: 'users', desc: 'Pädagogischer Statusbericht für die Vereinswebsite.', color: 'green-500' }
    ];

    const handleGenerate = async (typeId) => {
        setIsGenerating(true);
        setSelectedType(typeId);
        setGeneratedContent("");

        const apiKey = localStorage.getItem('stark_gemini_key');
        
        try {
            const contextPayload = `Nächstes Spiel: ${nextMatch}. Letztes Ergebnis: ${lastMatch}. Taktik-Fokus: ${tacticalNotes}`;

            const response = await fetch('/api/generate-media', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: typeId,
                    context: contextPayload,
                    squadStatus: squadInfo,
                    apiKey
                })
            });

            const data = await response.json();
            
            if (data.error) {
                setGeneratedContent(`Fehler: ${data.error}`);
            } else {
                setGeneratedContent(data.content);
            }
        } catch (error) {
            setGeneratedContent(`Netzwerkfehler: ${error.message}`);
        } finally {
            setIsGenerating(false);
            setPreviewMode(true);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedContent);
        alert("Text erfolgreich in die Zwischenablage kopiert!");
    };

    return (
        <div className="absolute inset-0 bg-[#e5e5e5] text-navy font-serif overflow-y-auto">
            {/* Header Area */}
            <div className="bg-navy text-white p-12 border-b-8 border-red-600 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    <Icon name="radio" size={300} />
                </div>
                <div className="relative z-10 max-w-6xl mx-auto flex justify-between items-end">
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-gold mb-2">Media & Press Intelligence</div>
                        <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none">PR <span className="text-red-600">Hub</span></h1>
                        <p className="mt-4 max-w-xl text-white/70 italic">
                            Das exklusive Redaktions-Dashboard. Steuern Sie die öffentliche Wahrnehmung von {clubName} mit datengetriebenen Narrativen und taktischen Deep-Dives.
                        </p>
                    </div>
                    <div className="hidden md:block text-right">
                        <div className="text-xs uppercase font-black tracking-widest text-white/40 mb-1">Status</div>
                        <div className="flex items-center gap-2 text-neon text-sm font-bold"><div className="w-2 h-2 bg-neon rounded-full animate-pulse"></div> KI-Redaktion Aktiv</div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto p-6 md:p-12 pb-32">
                
                {/* Data Context HUD (Read-Only) */}
                <div className="bg-white border text-sm border-gray-200 p-6 rounded-xl shadow-lg mb-12 relative">
                    <div className="absolute top-0 left-6 -translate-y-1/2 bg-black text-white text-[10px] uppercase font-black tracking-widest px-3 py-1 flex items-center gap-2">
                        <Icon name="database" size={12} /> Read-Only Data Source
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                        <div>
                            <div className="text-[10px] uppercase font-black text-gray-400 mb-1 tracking-widest">Nächstes Event</div>
                            <div className="font-bold text-navy text-lg">{nextMatch}</div>
                        </div>
                        <div className="border-l border-gray-200 pl-6">
                            <div className="text-[10px] uppercase font-black text-gray-400 mb-1 tracking-widest">Top Taktik-Metrik</div>
                            <div className="font-medium italic text-gray-700 clamp-lines-2">{tacticalNotes}</div>
                        </div>
                        <div className="border-l border-gray-200 pl-6">
                            <div className="text-[10px] uppercase font-black text-gray-400 mb-1 tracking-widest">Status / Freigabe</div>
                            <div className="font-bold text-green-600 flex items-center gap-2"><Icon name="check-circle" size={16} /> Publikation erlaubt</div>
                        </div>
                    </div>
                </div>

                {/* Generator Cards */}
                <div className="mb-8 flex items-center justify-between">
                    <h2 className="text-3xl font-black uppercase tracking-tighter italic text-navy">Content Studio</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {contentTypes.map((type) => (
                        <button
                            key={type.id}
                            onClick={() => handleGenerate(type.id)}
                            disabled={isGenerating}
                            className={`group bg-white border-2 text-left p-6 rounded-xl transition-all shadow-md hover:shadow-xl hover:-translate-y-1 block 
                                ${selectedType === type.id ? 'border-navy bg-gray-50' : 'border-gray-100 hover:border-gray-300'} 
                                disabled:opacity-50 disabled:cursor-wait`}
                        >
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-gray-100 text-${type.color} group-hover:scale-110 transition-transform`}>
                                <Icon name={type.icon} size={24} />
                            </div>
                            <h3 className="font-black uppercase tracking-tighter text-lg mb-2 text-navy">{type.title}</h3>
                            <p className="text-xs text-gray-500 font-medium leading-relaxed">{type.desc}</p>
                            
                            {isGenerating && selectedType === type.id && (
                                <div className="mt-4 text-[10px] font-black uppercase text-red-600 animate-pulse flex items-center gap-2">
                                    <Icon name="loader" size={12} className="animate-spin" /> Verfasse Text...
                                </div>
                            )}
                        </button>
                    ))}
                </div>

                {/* The Output Terminal */}
                {(generatedContent || isGenerating) && (
                    <div className="bg-white border-t-8 border-navy shadow-2xl rounded-xl overflow-hidden animate-fade-in relative">
                        <div className="bg-gray-100 border-b border-gray-200 p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-navy text-white rounded flex items-center justify-center">
                                   <Icon name="edit-3" size={16} />
                                </div>
                                <div>
                                   <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">Neural-Redakteur</div>
                                   <div className="font-bold text-navy text-sm uppercase">Entwurf bereit</div>
                                </div>
                            </div>
                            <div className="flex bg-gray-200 rounded-lg p-1">
                                <button 
                                    onClick={() => setPreviewMode(true)}
                                    className={`px-4 py-1.5 text-xs font-black uppercase tracking-widest rounded transition-colors ${previewMode ? 'bg-white shadow text-navy' : 'text-gray-500 hover:text-navy'}`}
                                >
                                    Vorschau
                                </button>
                                <button 
                                    onClick={() => setPreviewMode(false)}
                                    className={`px-4 py-1.5 text-xs font-black uppercase tracking-widest rounded transition-colors ${!previewMode ? 'bg-white shadow text-navy' : 'text-gray-500 hover:text-navy'}`}
                                >
                                    Edit RAW
                                </button>
                            </div>
                        </div>

                        <div className="p-8 min-h-[400px]">
                            {isGenerating ? (
                                <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-4">
                                    <Icon name="cpu" size={48} className="animate-spin text-navy" />
                                    <span className="text-xs font-black uppercase tracking-widest animate-pulse">Generiere Inhalte aus Taktik-Daten...</span>
                                </div>
                            ) : (
                                previewMode ? (
                                    <div className="prose prose-lg max-w-none prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter prose-headings:text-navy prose-p:leading-relaxed prose-a:text-red-600 prose-strong:text-red-600">
                                        <ReactMarkdown>
                                            {selectedType === 'social' ? '```json\n' + generatedContent + '\n```' : generatedContent}
                                        </ReactMarkdown>
                                    </div>
                                ) : (
                                    <textarea 
                                        className="w-full h-[500px] bg-gray-50 border border-gray-200 rounded-lg p-6 font-mono text-sm focus:outline-none focus:border-navy focus:bg-white transition-colors"
                                        value={generatedContent}
                                        onChange={(e) => setGeneratedContent(e.target.value)}
                                    />
                                )
                            )}
                        </div>

                        <div className="bg-gray-50 border-t border-gray-200 p-6 flex justify-between items-center">
                            <div className="text-[10px] uppercase font-black tracking-widest text-gray-500">
                                Freigegeben durch: Stark Elite KI-System
                            </div>
                            <button 
                                onClick={copyToClipboard}
                                className="bg-navy hover:bg-gold text-white hover:text-navy px-8 py-3 rounded text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-2 shadow-lg hover:-translate-y-1"
                            >
                                <Icon name="copy" size={14} /> In Zwischenablage Kopieren
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MediaHub;
