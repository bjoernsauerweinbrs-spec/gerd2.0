import React, { useState } from 'react';
import Icon from './Icon';

const StadionKurier = ({ truthObject }) => {
  const [activeIssue] = useState("Saison-Vorschau 2026/27");

  const latestInterview = truthObject?.latest_interview;
  const roster = truthObject?.matchday_roster;

  const defaultArticles = [
    {
      type: "EDITORIAL",
      headline: "Die Rückkehr der Identität: Taktik trifft Charakter",
      author: "Redaktion Stark Elite",
      excerpt: "In einer Welt von Daten und Algorithmen erinnert uns das neue System daran, dass Fußball mehr ist als nur Zahlen auf einem Screen.",
      content: "Das Erbe von Gerd Sauerwein lebt in jedem Vektor dieses Systems weiter. Während andere auf reine Effizienz setzen, integriert Stark Elite die menschliche Komponente.",
      image: "/image_0.png",
      featured: !latestInterview
    },
    {
      type: "TACTICAL ANALYSIS",
      headline: "Der 4-4-2 Hybrid-Ansatz im Detail",
      author: "Neural-Gerd",
      excerpt: "Warum das vertikale Pressing in der Regionalliga den Unterschied macht.",
      content: "Durch die Kapselung der defensiven Dreierkette bei Ballbesitz erreichen wir eine Asymmetrie, die gegnerische Pressing-Lines kollabieren lässt.",
      featured: false
    }
  ];

  // If there's a new interview, prepend it as the main featured article.
  const articles = latestInterview 
    ? [
        {
          type: "EXKLUSIV",
          headline: "Der Chef-Trainer bricht sein Schweigen",
          author: "KI Presseabteilung",
          excerpt: "Eine klare Ansage für den kommenden Spieltag. Wir haben die Antworten direkt aus der Zentrale.",
          content: latestInterview,
          image: "/image_0.png",
          featured: true
        },
        ...defaultArticles.map(a => ({ ...a, featured: false }))
      ]
    : defaultArticles;

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
            <div className="text-[9px] uppercase tracking-widest opacity-60">Live-Feed aktiviert</div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* MAIN ARTICLE */}
        <div className="lg:col-span-8">
          {articles.filter(a => a.featured).map((art, i) => (
            <div key={i} className="mb-12">
              <div className="text-xs font-black text-gold uppercase tracking-widest mb-4 border-b border-navy/10 pb-2 flex justify-between">
                 <span>{art.type}</span>
                 {art.type === 'EXKLUSIV' && <span className="text-red-600 animate-pulse flex items-center gap-2"><Icon name="zap" size={12} /> Live-Übertragung</span>}
              </div>
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-6 leading-tight">
                {art.headline}
              </h2>
              <div className="flex flex-col md:flex-row gap-8 mb-8">
                <div className="flex-1">
                  <p className="text-xl font-bold italic mb-6 leading-relaxed">
                    {art.excerpt}
                  </p>
                  <div className="text-sm leading-relaxed text-justify hyphens-auto">
                    <span className="float-left text-6xl font-black leading-none mr-3 mt-1 text-gold">D</span>
                    {art.content}
                  </div>
                  <div className="mt-8 pt-4 border-t border-navy/10 flex items-center justify-between italic text-xs">
                    <span>Von {art.author}</span>
                    <button className="text-navy font-black uppercase tracking-widest hover:text-gold transition-colors">Weiterlesen →</button>
                  </div>
                </div>
                {art.image && (
                  <div className="hidden md:block w-1/3">
                    <div className="aspect-[3/4] bg-navy relative overflow-hidden transition-all duration-700 shadow-2xl">
                      <img src={art.image} className="w-full h-full object-cover opacity-90" alt="Title" />
                      <div className="absolute inset-0 border-[12px] border-black/10"></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* SIDEBAR: Matchday Roster & Secondary Articles */}
        <div className="lg:col-span-4 lg:border-l border-navy/10 lg:pl-12">
          
          {roster && roster.length > 0 && (
            <div className="mb-12 p-6 bg-navy text-white shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                 <Icon name="shield" size={80} />
               </div>
               <h3 className="text-gold font-black uppercase tracking-widest text-xs mb-1">Offiziell bestätigt</h3>
               <h4 className="text-2xl font-black uppercase tracking-tighter italic mb-4">Start-11</h4>
               <div className="space-y-2 relative z-10 border-t border-white/20 pt-4">
                 {roster.map(player => (
                   <div key={player.id} className="flex justify-between text-xs font-mono border-b border-white/10 pb-1">
                     <span className="font-bold opacity-80 w-8">{player.position}</span>
                     <span className="flex-1 text-right">{player.name}</span>
                   </div>
                 ))}
               </div>
            </div>
          )}

          <h3 className="text-sm font-black uppercase tracking-widest mb-8 border-b-2 border-navy pb-2">Weitere Stories</h3>
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

          <div className="mt-16 p-8 bg-navy text-white rounded-sm shadow-xl">
            <Icon name="zap" size={24} className="text-gold mb-4" />
            <h4 className="text-lg font-black uppercase tracking-tight mb-2 italic">Abo & Insights</h4>
            <p className="text-[10px] leading-relaxed opacity-60 italic mb-6">Erhalten Sie den Stadion-Kurier direkt in Ihre Executive Zentrale. Jeden Spieltag neu.</p>
            <button className="w-full py-4 border border-white/20 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-navy transition-all">Jetzt abonnieren</button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StadionKurier;
