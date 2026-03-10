// ═══════════════════════════════════════════════════════════════════════
// TONI 2.0 — i18n LOCALIZATION MODULE  (V88)
// ═══════════════════════════════════════════════════════════════════════

window.currentLang = 'de';

const i18nStrings = {
    en: {
        // Header
        'mic-uplink': 'MIC UPLINK ACTIVE',
        'ai-standby': 'AI STATUS: STANDBY',

        // Launcher buttons
        'launcher-medical': '🩺 PERFORMANCE & MEDICAL LAB',
        'launcher-tactics': '🏫 NLZ ELITE ACADEMY HUB',
        'launcher-academy': 'NLZ // ELITE DEVELOPMENT',
        'launcher-management': '💰 CFO MANAGEMENT SUITE',
        'launcher-video': '🎥 VIDEO ANALYTICAL HUB',

        // Medical Lab
        'med-tab-bio': '🫀 Biometrics',
        'med-tab-cardiac': '📈 Cardiac History',
        'med-tab-force': '⚖ Force Plate',
        'med-tab-hormonal': '🧬 Hormonal',
        'med-tab-cognitive': '🧠 Cognitive Load',
        'label-bodyfat': 'Body Fat %',
        'label-hrv': 'HRV Baseline',
        'label-recovery': 'Recovery Index',
        'label-cardiac-title': 'LIFELONG HEARTBEAT ARCHIVE — HRV Career Timeline',
        'label-cmo': 'Chief Medical Officer',
        'label-cmo-briefing': '🩺 CMO AI BRIEFING LOG',
        'btn-cmo-brief': 'REQUEST CMO BRIEFING',

        // Force Plate
        'label-force-left': 'LEFT LIMB',
        'label-force-right': 'RIGHT LIMB',
        'label-asymmetry': 'LIMB ASYMMETRY INDEX',

        // Hormonal
        'label-cortisol': 'CORTISOL (STRESS MARKER)',
        'label-testosterone': 'TESTOSTERONE (RECOVERY MARKER)',
        'label-ratio': 'CORTISOL : TESTOSTERONE RATIO',

        // Cognitive
        'label-reaction': 'REACTION TIME',
        'label-dual-task': 'DUAL-TASK PERFORMANCE',
        'label-cog-stress': 'Cognitive Stress',

        // NLZ
        'nlz-title': 'NLZ ELITE ACADEMY HUB',
        'nlz-age-groups': 'AGE GROUPS',
        'nlz-add-player': 'ADD PLAYER',
        'btn-nlz-add': '+ ADD',
        'nlz-academy-director': '🏫 ACADEMY DIRECTOR BRIEFING',
        'btn-academy-brief': 'REQUEST BRIEFING',
        'label-birth-year': 'Birth Year',
        'label-pro-pathway': 'Pro-Pathway',

        // FIFA card stats
        'stat-pac': 'PAC',
        'stat-sho': 'SHO',
        'stat-pas': 'PAS',
        'stat-dri': 'DRI',
        'stat-def': 'DEF',
        'stat-phy': 'PHY',

        // Management / CFO
        'label-revenue': 'Revenue',
        'label-expenses': 'Expenses',
        'label-budget': 'Budget',
        'label-net-profit': 'Net Profit',
        'label-sponsor': 'Sponsoring Matrix',
        'label-infra': 'Infrastructure',
        'label-legal': 'Legal / Contracts',
        'btn-cfo-brief': 'REQUEST VERBAL BRIEFING',

        // Video Hub
        'video-title': '🎥 VIDEO ANALYTICAL HUB',
        'video-drop': 'DROP MP4 HERE',
        'video-browse': 'BROWSE FILE',
        'video-passlines': '↔ PASSING LANES',
        'video-pressure': '🔴 PRESSURE ZONES',
        'video-distance': '📏 DISTANCE LINES',
        'video-sync': '🔄 SYNC TO BOARD',
        'video-toni': 'TONI DIALOGUE',
        'video-show343': 'SHOW 3-4-3',
        'video-finish': 'FINISH ZONES',
        'video-clips': 'CLIP ANNOTATIONS',
        'btn-add-clip': '+ MARK TIMESTAMP',

        // xG
        'label-xg': 'xG',
        'label-expected-goals': 'Expected Goals (xG)',

        // Daily Briefing
        'briefing-title': 'DAILY BRIEFING',
        'briefing-top3': 'Top 3 Players (xG)',
        'briefing-alerts': 'Medical Alerts',
        'briefing-grade': 'Tactical Execution Grade',
        'briefing-history': '📋 Briefing History',

        // VR Screens
        'vr-screen1': 'VIDEO HUB',
        'vr-screen2': 'MEDICAL / BIOMETRICS',
        'vr-screen3': 'NLZ DATABASE',
        'vr-screen4': 'FINANCIALS',
        'vr-cardiac-mountains': 'CARDIAC MOUNTAINS',
        'vr-peak-performance': 'Peak Performance',

        // Voice / AI briefing templates
        'tts-daily-intro': 'Daily briefing initiated.',
        'tts-top-player': 'Top performing player by expected goals:',
        'tts-medical-alert': 'Medical alert active for:',
        'tts-tactical-grade': 'Tactical execution grade:',
        'tts-session-saved': 'Training session saved. Initiating daily briefing.',
        'tts-defensive-gap': 'Defensive gap identified. Two high-risk zones highlighted on the board.',
        'tts-pressing-zones': 'Pressing zones active. High-intensity areas marked in red.',
        'tts-passing-lanes': 'Passing lanes overlay active. Key connection lines rendered.',

        // Event P&L
        'event-pl-title': '⚽ EVENT P&L — TOURNAMENT BUDGET',
        'label-income': 'INCOME',
        'label-expenses': 'EXPENSES',
        'label-total-income': 'Total Income',
        'label-total-expenses': 'Total Expenses',
        'label-event-profit': 'EVENT NET PROFIT',
        'event-sausage': 'Sausage Stand €',
        'event-drinks': 'Beverages €',
        'event-entry': 'Entry Fees €',
        'event-sponsoring': 'Sponsoring €',
        'event-pitch': 'Pitch Rental €',
        'event-referee': 'Referees €',
        'event-trophies': 'Trophies/Medals €',
        'event-misc': 'Miscellaneous €',
        'advisor-title': '🤖 AI ADVISOR — TRANSFER CHECK',
        'label-handgeld': 'Signing Fee',
        'label-salary': 'Annual Salary',
        'btn-advisor-check': 'CAN I AFFORD THIS PLAYER?',
        'advisor-yes': 'APPROVED — Cash flow covers this transfer.',
        'advisor-no': 'DECLINED — Transfer exceeds current cash flow.',
        'invest-tip': '💡 Profit threshold reached! Recommend: New training kits (~€ 800).',
        // Medical
        'label-heartrate': 'Heart Rate',
        // Tactic
        'label-verticality': 'Verticality',
        'label-pitch': 'Pitch',

    },
    de: {
        // Header
        'mic-uplink': 'MIC-VERBINDUNG AKTIV',
        'ai-standby': 'KI-STATUS: BEREIT',

        // Launcher buttons
        'launcher-medical': '🩺 PERFORMANCE & MEDIZIN-LABOR',
        'launcher-tactics': '🏫 NLZ ELITE AKADEMIE-HUB',
        'launcher-academy': 'NLZ // ELITE ENTWICKLUNG',
        'launcher-management': '💰 CFO MANAGEMENT SUITE',
        'launcher-video': '🎥 VIDEO ANALYSE-HUB',

        // Medical Lab
        'med-tab-bio': '🫀 Biometrik',
        'med-tab-cardiac': '📈 Herzgeschichte',
        'med-tab-force': '⚖ Kraftmessplatte',
        'med-tab-hormonal': '🧬 Hormonal',
        'med-tab-cognitive': '🧠 Kognitive Last',
        'label-bodyfat': 'Körperfettanteil %',
        'label-hrv': 'HRV-Basiswert',
        'label-recovery': 'Erholungsindex',
        'label-cardiac-title': 'LEBENSLANGER HERZSCHLAG — HRV-Karriere-Verlauf',
        'label-cmo': 'Leitender Mediziner',
        'label-cmo-briefing': '🩺 MEDIZINER KI-PROTOKOLL',
        'btn-cmo-brief': 'MEDIZINISCHES BRIEFING ANFORDERN',

        // Force Plate
        'label-force-left': 'LINKES BEIN',
        'label-force-right': 'RECHTES BEIN',
        'label-asymmetry': 'ASYMMETRIE-INDEX',

        // Hormonal
        'label-cortisol': 'CORTISOL (STRESSMARKER)',
        'label-testosterone': 'TESTOSTERON (ERHOLUNGSMARKER)',
        'label-ratio': 'CORTISOL : TESTOSTERON VERHÄLTNIS',

        // Cognitive
        'label-reaction': 'REAKTIONSZEIT',
        'label-dual-task': 'DUAL-AUFGABEN-LEISTUNG',
        'label-cog-stress': 'Kognitive Belastung',

        // NLZ
        'nlz-title': 'NLZ ELITE AKADEMIE-HUB',
        'nlz-age-groups': 'ALTERSGRUPPEN',
        'nlz-add-player': 'SPIELER HINZUFÜGEN',
        'btn-nlz-add': '+ HINZUFÜGEN',
        'nlz-academy-director': '🏫 AKADEMIEDIREKTOR BRIEFING',
        'btn-academy-brief': 'BRIEFING ANFORDERN',
        'label-birth-year': 'Geburtsjahrgang',
        'label-pro-pathway': 'Profi-Entwicklungspfad',

        // FIFA card stats
        'stat-pac': 'ANT',
        'stat-sho': 'SCH',
        'stat-pas': 'PAS',
        'stat-dri': 'DRI',
        'stat-def': 'DEF',
        'stat-phy': 'PHY',

        // Management / CFO
        'label-revenue': 'Einnahmen',
        'label-expenses': 'Ausgaben',
        'label-budget': 'Budget',
        'label-net-profit': 'Netto-Ergebnis',
        'label-sponsor': 'Sponsoring-Matrix',
        'label-infra': 'Infrastruktur',
        'label-legal': 'Recht / Verträge',
        'btn-cfo-brief': 'MÜNDLICHES BRIEFING ANFORDERN',

        // Video Hub
        'video-title': '🎥 VIDEO ANALYSE-HUB',
        'video-drop': 'MP4 HIER ABLEGEN',
        'video-browse': 'DATEI AUSWÄHLEN',
        'video-passlines': '↔ PASSWEGE',
        'video-pressure': '🔴 DRUCKZONEN',
        'video-distance': '📏 DISTANZLINIEN',
        'video-sync': '🔄 AUF TAKTIKBOARD SYNC',
        'video-toni': 'TONI DIALOG',
        'video-show343': '3-4-3 ANZEIGEN',
        'video-finish': 'ABSCHLUSSZONEN',
        'video-clips': 'CLIP ANMERKUNGEN',
        'btn-add-clip': '+ ZEITMARKE SETZEN',

        // xG
        'label-xg': 'xT',
        'label-expected-goals': 'Erwartete Tore (xT)',

        // Daily Briefing
        'briefing-title': 'TAGESBRIEFING',
        'briefing-top3': 'Top 3 Spieler (xT)',
        'briefing-alerts': 'Medizinische Warnmeldungen',
        'briefing-grade': 'Taktische Ausführungsqualität',
        'briefing-history': '📋 Briefing-Verlauf',

        // VR Screens
        'vr-screen1': 'VIDEO-HUB',
        'vr-screen2': 'MEDIZIN / BIOMETRIK',
        'vr-screen3': 'NLZ DATENBANK',
        'vr-screen4': 'FINANZEN',
        'vr-cardiac-mountains': 'HERZberg-TERRAIN',
        'vr-peak-performance': 'Höchstleistung',

        // Voice / AI briefing templates
        'tts-daily-intro': 'Tagesbriefing wird gestartet.',
        'tts-top-player': 'Leistungsstärkster Spieler nach erwarteten Toren:',
        'tts-medical-alert': 'Medizinische Warnung aktiv für:',
        'tts-tactical-grade': 'Taktische Ausführungsqualität:',
        'tts-session-saved': 'Trainingseinheit gespeichert. Tagesbriefing wird eingeleitet.',
        'tts-defensive-gap': 'Defensive Lücke identifiziert. Zwei Risikozonen auf dem Taktikboard markiert.',
        'tts-pressing-zones': 'Gegenpressing-Zonen aktiv. Hochintensive Bereiche in Rot markiert.',
        'tts-passing-lanes': 'Passwege-Overlay aktiv. Schlüsselverbindungslinien eingeblendet.',

        // Event P&L
        'event-pl-title': '⚽ EVENT P&L — TURNIER-BUDGET',
        'label-income': 'EINNAHMEN',
        'label-expenses': 'AUSGABEN',
        'label-total-income': 'Gesamt-Einnahmen',
        'label-total-expenses': 'Gesamt-Ausgaben',
        'label-event-profit': 'EVENT-REINGEWINN',
        'event-sausage': 'Würstchenverkauf €',
        'event-drinks': 'Getränke €',
        'event-entry': 'Startgelder €',
        'event-sponsoring': 'Sponsoring €',
        'event-pitch': 'Platzmiete €',
        'event-referee': 'Schiedsrichter €',
        'event-trophies': 'Pokale/Medaillen €',
        'event-misc': 'Sonstiges €',
        'advisor-title': '🤖 KI-ADVISOR — TRANSFER-CHECK',
        'label-handgeld': 'Handgeld',
        'label-salary': 'Jahresgehalt',
        'btn-advisor-check': 'KANN ICH MIR DIESEN SPIELER LEISTEN?',
        'advisor-yes': 'FREIGABE — Cash-Flow deckt diesen Transfer.',
        'advisor-no': 'ABGELEHNT — Transfer übersteigt den aktuellen Cash-Flow.',
        'invest-tip': '💡 Gewinnschwelle erreicht! Empfehlung: Neue Trainingsanzüge (~€ 800).',
        // Medical
        'label-heartrate': 'Herzfrequenz',
        // Tactic
        'label-verticality': 'Vertikalität',
        'label-pitch': 'Spielfeld',

    }
};

// QWERTY / QWERTZ keyboard layouts for VR floating keyboard
const vrKeyboardLayouts = {
    en: [
        ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
        ['Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫'],
        ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ],
    de: [
        ['Q', 'W', 'E', 'R', 'T', 'Z', 'U', 'I', 'O', 'P'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ö'],
        ['Y', 'X', 'C', 'V', 'B', 'N', 'M', 'Ü', 'Ä', '⌫'],
        ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ]
};

/**
 * t(key) — Translate a string key to the current language.
 * Falls back to EN if key not found in current lang.
 */
function t(key) {
    return (i18nStrings[window.currentLang] || i18nStrings.en)[key]
        || i18nStrings.en[key]
        || key;
}

/**
 * applyLocale(lang) — Apply all translations to the DOM.
 * Elements with data-i18n="key" get their textContent updated.
 * Elements with data-i18n-placeholder="key" get their placeholder updated.
 * Also syncs VR text elements and rebuilds VR keyboard.
 */
function applyLocale(lang) {
    window.currentLang = lang;

    // Update <html lang="">
    document.documentElement.lang = lang;

    // Update toggle button visual
    const toggle = document.getElementById('lang-toggle-btn');
    if (toggle) {
        toggle.textContent = lang === 'en' ? 'EN | DE' : 'EN | DE';
        toggle.setAttribute('data-lang', lang);
        const pill = document.getElementById('lang-toggle-pill');
        if (pill) pill.style.transform = lang === 'de' ? 'translateX(28px)' : 'translateX(0)';
    }

    // Apply text translations
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = t(key);
    });

    // Apply placeholder translations
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        el.placeholder = t(key);
    });

    // Sync VR screen headings
    syncLocaleToVR(lang);

    // Rebuild VR keyboard
    if (typeof rebuildVRKeyboard === 'function') rebuildVRKeyboard(lang);

    console.log(`[i18n] Locale applied: ${lang}`);
}

/**
 * syncLocaleToVR(lang) — Update all VR text entity values for language.
 */
function syncLocaleToVR(lang) {
    const setVR = (id, key) => {
        const el = document.getElementById(id);
        if (el) el.setAttribute('value', t(key));
    };
    setVR('vr-screen1-label', 'vr-screen1');
    setVR('vr-screen2-label', 'vr-screen2');
    setVR('vr-screen3-label', 'vr-screen3');
    setVR('vr-screen4-label', 'vr-screen4');
    setVR('vr-cardiac-label', 'vr-cardiac-mountains');
    setVR('vr-peak-label', 'vr-peak-performance');
}

// DOMContentLoaded — wire toggle button
document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('lang-toggle-btn');
    if (btn) {
        btn.addEventListener('click', () => {
            const next = window.currentLang === 'en' ? 'de' : 'en';
            applyLocale(next);
        });
    }
    // Apply default locale on load
    applyLocale(window.currentLang);
});
