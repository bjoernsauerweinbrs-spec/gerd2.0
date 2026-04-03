import React from 'react';

/**
 * LineupCanvas - Renders a football lineup on a professional pitch background.
 * @param {Object} lineup - { formation: string, players: [{ name: string, pos: string, x: number, y: number }] }
 */
const LineupCanvas = ({ lineup }) => {
    if (!lineup || !lineup.players) return null;

    // Use the localized background image
    const backgroundUrl = "/assets/stadium_pitch.png";

    return (
        <div style={styles.container}>
            <div style={{ ...styles.canvas, backgroundImage: `url(${backgroundUrl})` }}>
                {/* Formation Overlay */}
                <div style={styles.formationBadge}>
                    <div style={styles.badgeLabel}>Formation</div>
                    <div style={styles.badgeValue}>{lineup.formation}</div>
                </div>

                {/* Player Rendering */}
                {lineup.players.map((player, idx) => (
                    <div 
                        key={idx} 
                        style={{ 
                            ...styles.playerContainer, 
                            left: `${(player.x / 800) * 100}%`, 
                            top: `${(player.y / 600) * 100}%` 
                        }}
                    >
                        <div style={styles.playerWrapper}>
                            <div style={styles.playerIcon}>
                                <span style={styles.posText}>{player.pos}</span>
                            </div>
                            {/* Glassmorphism Name Tag */}
                            <div style={styles.playerNameTag}>
                                {player.name}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Legend / Info Bar */}
            <div style={styles.infoBar}>
                <div style={styles.infoBrand}>STARK ELITE — LINEUP ARCHITECT V1.0</div>
                <div style={styles.infoStatus}>LIVE TACTICAL GROUNDING ENABLED</div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        width: '100%',
        maxWidth: '800px',
        aspectRatio: '800 / 600',
        margin: '20px auto',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 30px 60px rgba(0,0,0,0.8), 0 0 40px rgba(0, 243, 255, 0.1)',
        border: '1px solid rgba(255,255,255,0.08)',
        background: '#050505',
        position: 'relative',
    },
    canvas: {
        width: '100%',
        height: 'calc(100% - 40px)',
        position: 'relative',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    },
    formationBadge: {
        position: 'absolute',
        top: '30px',
        left: '30px',
        background: 'rgba(5, 10, 20, 0.8)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(0, 243, 255, 0.4)',
        padding: '10px 20px',
        borderRadius: '16px',
        zIndex: 10,
        boxShadow: '0 10px 20px rgba(0,0,0,0.4)',
    },
    badgeLabel: {
        color: 'rgba(0, 243, 255, 0.6)',
        fontSize: '9px',
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: '0.2em',
        marginBottom: '2px',
    },
    badgeValue: {
        color: '#fff',
        fontSize: '1.4rem',
        fontWeight: '900',
        lineHeight: '1',
    },
    playerContainer: {
        position: 'absolute',
        transform: 'translate(-50%, -50%)',
        zIndex: 5,
        transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
    },
    playerWrapper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    playerIcon: {
        width: '44px',
        height: '44px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #00f3ff, #005f73)',
        border: '2px solid rgba(255,255,255,0.9)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '6px',
        boxShadow: '0 0 20px rgba(0, 243, 255, 0.5), 0 4px 10px rgba(0,0,0,0.5)',
        position: 'relative',
    },
    posText: {
        color: '#fff',
        fontSize: '0.9rem',
        fontWeight: '900',
        textShadow: '0 1px 2px rgba(0,0,0,0.5)',
    },
    playerNameTag: {
        color: '#fff',
        fontSize: '0.8rem',
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        background: 'rgba(5, 10, 20, 0.7)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.1)',
        padding: '3px 12px',
        borderRadius: '6px',
        whiteSpace: 'nowrap',
        boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
    },
    infoBar: {
        height: '40px',
        background: 'rgba(5, 10, 20, 0.9)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 25px',
        borderTop: '1px solid rgba(255,255,255,0.05)',
    },
    infoBrand: {
        color: 'rgba(255,255,255,0.2)',
        fontSize: '9px',
        fontWeight: '900',
        letterSpacing: '0.3em',
    },
    infoStatus: {
        color: '#00f3ff',
        fontSize: '8px',
        fontWeight: '900',
        letterSpacing: '0.1em',
        opacity: '0.6',
    },
};

export default LineupCanvas;
