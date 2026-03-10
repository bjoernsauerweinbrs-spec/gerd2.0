// TONI 2.0 // HYBRID COMMAND CENTER LOGIC // V73 + VR

AFRAME.registerComponent('pitch-rotator', {
    schema: { speed: { type: 'number', default: 1.5 } },
    init: function () {
        // Allow right thumbstick to rotate the pitch-board around its local Z axis
        this.el.sceneEl.addEventListener('axismove', (evt) => {
            if (evt.detail.axis.length >= 2) {
                let x = evt.detail.axis[0]; // horizontal stick
                if (Math.abs(x) > 0.1) {
                    let currentRot = this.el.getAttribute('rotation');
                    this.el.setAttribute('rotation', {
                        x: currentRot.x,
                        y: currentRot.y,
                        z: currentRot.z - (x * this.data.speed)
                    });
                }
            }
        });
    }
});

// --- V79 VR Control Custom Components ---
AFRAME.registerComponent('custom-snap-turn', {
    init: function () {
        this.rig = document.getElementById('player-rig');
        this.turning = false;

        // Oculus specific axes
        this.el.addEventListener('axismove', (e) => {
            if (!this.rig || this.turning) return;
            const x = e.detail.axis[0]; // Usually left/right on right stick
            if (x < -0.6) {
                this.turn(45);
            } else if (x > 0.6) {
                this.turn(-45);
            }
        });
    },
    turn: function (angle) {
        this.turning = true;
        const rot = this.rig.getAttribute('rotation') || { x: 0, y: 0, z: 0 };
        this.rig.setAttribute('rotation', { x: rot.x, y: rot.y + angle, z: rot.z });
        setTimeout(() => { this.turning = false; }, 300);
    }
});

AFRAME.registerComponent('vr-grabber', {
    init: function () {
        this.grabbedEl = null;
        this.originalParent = null;
        this.el.addEventListener('gripdown', this.onGrab.bind(this));
        this.el.addEventListener('gripup', this.onRelease.bind(this));
        this.el.addEventListener('triggerdown', this.onGrab.bind(this));
        this.el.addEventListener('triggerup', this.onRelease.bind(this));
    },
    onGrab: function () {
        if (this.grabbedEl) return;
        const raycaster = this.el.components.raycaster;
        if (!raycaster) return;
        const intersections = raycaster.intersectedEls;
        if (intersections.length > 0) {
            const target = intersections.find(el => el.classList.contains('vr-card') || el.classList.contains('fifa-card') || el.classList.contains('interactable'));
            if (target) {
                this.grabbedEl = target;
                this.originalParent = target.parentNode;

                // Reparent to controller to follow hand physically
                target.object3D.parent = this.el.object3D;

                // Optional Haptics
                try {
                    const gamepad = this.el.components['oculus-touch-controls']?.controller ||
                        this.el.components['tracked-controls']?.controller;
                    if (gamepad && gamepad.hapticActuators && gamepad.hapticActuators.length > 0) {
                        gamepad.hapticActuators[0].pulse(1.0, 50);
                    }
                } catch (e) { }
            }
        }
    },
    onRelease: function () {
        if (!this.grabbedEl) return;

        // Check if hovering over pitch-board
        const pitch = document.getElementById('vr-pitch-board');
        let snapped = false;

        if (pitch) {
            const pitchPos = new THREE.Vector3();
            pitch.object3D.getWorldPosition(pitchPos);
            const cardPos = new THREE.Vector3();
            this.grabbedEl.object3D.getWorldPosition(cardPos);

            // Snap to board if within 2.5 meters
            if (cardPos.distanceTo(pitchPos) < 2.5) {
                // Keep world position when re-parenting to pitch
                const worldPos = new THREE.Vector3();
                this.grabbedEl.object3D.getWorldPosition(worldPos);

                this.grabbedEl.object3D.parent = pitch.object3D;
                pitch.object3D.worldToLocal(worldPos);
                this.grabbedEl.object3D.position.copy(worldPos);

                // Face upward on board
                this.grabbedEl.object3D.rotation.set(-Math.PI / 2, 0, 0);
                snapped = true;

                try {
                    const gamepad = this.el.components['oculus-touch-controls']?.controller;
                    if (gamepad && gamepad.hapticActuators) gamepad.hapticActuators[0].pulse(0.5, 30);
                } catch (e) { }
            }
        }

        if (!snapped && this.originalParent) {
            // Restore to original space if not snapped
            const worldPos = new THREE.Vector3();
            const worldQuat = new THREE.Quaternion();
            this.grabbedEl.object3D.getWorldPosition(worldPos);
            this.grabbedEl.object3D.getWorldQuaternion(worldQuat);

            this.grabbedEl.object3D.parent = this.originalParent.object3D;
            this.originalParent.object3D.worldToLocal(worldPos);
            this.grabbedEl.object3D.position.copy(worldPos);
            this.grabbedEl.object3D.quaternion.copy(worldQuat);
        }

        this.grabbedEl = null;
    }
});

// Drag and drop mechanics for floating cards
AFRAME.registerComponent('draggable-card', {
    init: function () {
        this.isDragging = false;
        // Find the active raycaster
        this.el.addEventListener('mousedown', (evt) => {
            this.isDragging = true;
            this.raycaster = evt.detail.cursorEl.components.raycaster;
            // Visual dragging feedback
            const bg = this.el.querySelector('.card-bg');
            if (bg) bg.setAttribute('material', 'color', '#1a0033'); // magenta hint
            this.el.setAttribute('scale', '1.1 1.1 1.1');
        });

        this.el.addEventListener('mouseup', () => {
            if (!this.isDragging) return;
            this.isDragging = false;
            const bg = this.el.querySelector('.card-bg');
            if (bg) bg.setAttribute('material', 'color', '#050a0f');
            this.el.setAttribute('scale', '1 1 1');

            // Snap logic: if dropped near the table height
            const pos = this.el.getAttribute('position');
            // Assuming the intersection floor is y=0, we held it at y=1.2.
            // When dropped, let's just snap it to lay flat on the tactic board.
            if (pos.y < 1.4) {
                const tacticHub = document.getElementById('tactic-hub');
                if (tacticHub && this.el.parentElement.id === 'floating-card-stock') {
                    // Simplified reparenting logic for V73 mockup:
                    // The card just drops flat onto the table.
                    this.el.setAttribute('rotation', '-90 0 0'); // lie flat

                    // Drop it visually
                    this.el.setAttribute('position', { x: pos.x, y: 0.1, z: pos.z });
                }
            }
        });
    },
    tick: function () {
        if (!this.isDragging || !this.raycaster) return;

        // Get ray intersection with the floor (id=reflective-floor)
        const floor = document.getElementById('reflective-floor');
        const intersection = this.raycaster.getIntersection(floor);

        if (intersection) {
            // Convert world intersection to local coordinates of the parent container
            const parentEl = this.el.parentElement;
            const parentObj3D = parentEl.object3D;

            // Clone the point and convert to parent's local space
            const localPoint = intersection.point.clone();
            parentObj3D.worldToLocal(localPoint);

            // Float the card exactly at eye level intersecting the ray, or offset above floor
            // intersection.point is height 0. We want to hold it floating at y=1.2 (local)
            this.el.setAttribute('position', {
                x: localPoint.x,
                y: localPoint.y + 1.2, // Arbitrary float height above floor intersection
                z: localPoint.z
            });

            // Add a visual neon trail effect (creating temporary planes)
            if (Math.random() > 0.8) {
                const trail = document.createElement('a-plane');
                trail.setAttribute('width', '0.05');
                trail.setAttribute('height', '0.05');
                trail.setAttribute('material', 'color: #00ffff; transparent: true; opacity: 0.5');
                trail.setAttribute('position', this.el.getAttribute('position'));
                parentEl.appendChild(trail);
                setTimeout(() => { if (trail.parentNode) trail.parentNode.removeChild(trail); }, 300);
            }
        }
    }
});

const squadData = [
    { id: 1, name: "NEUER", ovr: 89, pos: "GK", nation: "ger", stats: { pac: 56, sho: 82, pas: 91, dri: 88, def: 50, phy: 80, workRate: "Med/Med", weakFoot: 4 } },
    { id: 2, name: "KIMMICH", ovr: 87, pos: "RB", nation: "ger", stats: { pac: 70, sho: 72, pas: 87, dri: 84, def: 83, phy: 79, workRate: "High/High", weakFoot: 4 } },
    { id: 3, name: "MIN-JAE", ovr: 84, pos: "CB", nation: "kor", stats: { pac: 80, sho: 33, pas: 68, dri: 65, def: 85, phy: 84, workRate: "Med/High", weakFoot: 3 } },
    { id: 4, name: "DE LIGT", ovr: 86, pos: "CB", nation: "ned", stats: { pac: 66, sho: 59, pas: 71, dri: 69, def: 85, phy: 86, workRate: "Med/High", weakFoot: 4 } },
    { id: 5, name: "DAVIES", ovr: 83, pos: "LB", nation: "can", stats: { pac: 95, sho: 68, pas: 77, dri: 84, def: 76, phy: 77, workRate: "High/Low", weakFoot: 4 } },
    { id: 6, name: "KROOS", ovr: 91, pos: "CM", nation: "ger", stats: { pac: 55, sho: 81, pas: 96, dri: 82, def: 71, phy: 68, workRate: "Med/Med", weakFoot: 5 } },
    { id: 7, name: "GORETZKA", ovr: 85, pos: "CM", nation: "ger", stats: { pac: 78, sho: 82, pas: 81, dri: 82, def: 80, phy: 86, workRate: "High/Med", weakFoot: 4 } },
    { id: 8, name: "SANE", ovr: 84, pos: "RM", nation: "ger", stats: { pac: 91, sho: 82, pas: 79, dri: 86, def: 38, phy: 70, workRate: "High/Med", weakFoot: 3 } },
    { id: 9, name: "MUSIALA", ovr: 86, pos: "LM", nation: "ger", stats: { pac: 85, sho: 81, pas: 82, dri: 92, def: 64, phy: 60, workRate: "High/Med", weakFoot: 4 } },
    { id: 10, name: "KANE", ovr: 90, pos: "ST", nation: "eng", stats: { pac: 69, sho: 93, pas: 84, dri: 83, def: 49, phy: 83, workRate: "High/High", weakFoot: 5 } },
    { id: 11, name: "MULLER", ovr: 84, pos: "ST", nation: "ger", stats: { pac: 63, sho: 82, pas: 83, dri: 80, def: 56, phy: 71, workRate: "High/Med", weakFoot: 4 } }
];

// 2D Pitch coordinates (percentages 0-100, origin top-left)
const formations2D = {
    "442": [
        { x: 50, y: 84, label: "GK" },
        { x: 15, y: 67, label: "LB" }, { x: 35, y: 71, label: "CB" }, { x: 65, y: 71, label: "CB" }, { x: 85, y: 67, label: "RB" },
        { x: 15, y: 40, label: "LM" }, { x: 35, y: 44, label: "CM" }, { x: 65, y: 44, label: "CM" }, { x: 85, y: 40, label: "RM" },
        { x: 35, y: 14, label: "ST" }, { x: 65, y: 14, label: "ST" }
    ],
    "343": [
        { x: 50, y: 84, label: "GK" },
        { x: 25, y: 72, label: "CB" }, { x: 50, y: 75, label: "CB" }, { x: 75, y: 72, label: "CB" },
        { x: 12, y: 50, label: "LWB" }, { x: 35, y: 54, label: "CM" }, { x: 65, y: 54, label: "CM" }, { x: 88, y: 50, label: "RWB" },
        { x: 25, y: 18, label: "LW" }, { x: 50, y: 13, label: "CF" }, { x: 75, y: 18, label: "RW" }
    ],
    "funino": [
        // 4 x Mini Goals logic visually (just using markers for 2D representation right now)
        { x: 30, y: 76, label: "DEF 1", isGoal: false }, { x: 70, y: 76, label: "DEF 2", isGoal: false },
        { x: 30, y: 22, label: "ATT 1", isGoal: false }, { x: 70, y: 22, label: "ATT 2", isGoal: false },
        // Goals
        { x: 15, y: 88, label: "GOAL P1", isGoal: true }, { x: 85, y: 88, label: "GOAL P2", isGoal: true },
        { x: 15, y: 8, label: "GOAL P3", isGoal: true }, { x: 85, y: 8, label: "GOAL P4", isGoal: true }
    ]
};

// VR coordinates (local space for the hub entity)
const formationsVR = {
    "442": [
        { x: 0, z: 0.8, label: "GK" },
        { x: -1.2, z: 0.3, label: "LB" }, { x: -0.4, z: 0.4, label: "CB" }, { x: 0.4, z: 0.4, label: "CB" }, { x: 1.2, z: 0.3, label: "RB" },
        { x: -1.3, z: -0.3, label: "LM" }, { x: -0.4, z: -0.2, label: "CM" }, { x: 0.4, z: -0.2, label: "CM" }, { x: 1.3, z: -0.3, label: "RM" },
        { x: -0.5, z: -0.8, label: "ST" }, { x: 0.5, z: -0.8, label: "ST" }
    ],
    "343": [
        { x: 0, z: 0.8, label: "GK" },
        { x: -0.8, z: 0.4, label: "CB" }, { x: 0, z: 0.5, label: "CB" }, { x: 0.8, z: 0.4, label: "CB" },
        { x: -1.4, z: -0.1, label: "LWB" }, { x: -0.5, z: 0, label: "CM" }, { x: 0.5, z: 0, label: "CM" }, { x: 1.4, z: -0.1, label: "RWB" },
        { x: -1.0, z: -0.6, label: "LW" }, { x: 0, z: -0.8, label: "CF" }, { x: 1.0, z: -0.6, label: "RW" }
    ],
    "funino": [
        { x: -0.5, z: 0.6, label: "DEF 1", isGoal: false }, { x: 0.5, z: 0.6, label: "DEF 2", isGoal: false },
        { x: -0.5, z: -0.6, label: "ATT 1", isGoal: false }, { x: 0.5, z: -0.6, label: "ATT 2", isGoal: false },
        { x: -0.8, z: 0.8, label: "GOAL", isGoal: true }, { x: 0.8, z: 0.8, label: "GOAL", isGoal: true },
        { x: -0.8, z: -0.8, label: "GOAL", isGoal: true }, { x: 0.8, z: -0.8, label: "GOAL", isGoal: true }
    ],
    "funino_2v2": [
        { x: -0.2, z: 0.4, label: "P1", isGoal: false }, { x: 0.2, z: 0.4, label: "P2", isGoal: false },
        { x: -0.2, z: -0.4, label: "P3", isGoal: false }, { x: 0.2, z: -0.4, label: "P4", isGoal: false },
        { x: -0.4, z: 0.6, label: "GOAL", isGoal: true }, { x: 0.4, z: 0.6, label: "GOAL", isGoal: true },
        { x: -0.4, z: -0.6, label: "GOAL", isGoal: true }, { x: 0.4, z: -0.6, label: "GOAL", isGoal: true }
    ]
};

// ── Global VR Toggle Functions (Fallback, independent of init2D) ────────────
window.enterVR = async function () {
    const uiLayer = document.getElementById('ui-layer');
    const vrLayer = document.getElementById('vr-layer');
    if (!uiLayer || !vrLayer) { console.warn('[VR] ui-layer or vr-layer not found'); return; }

    uiLayer.classList.add('hidden');
    vrLayer.classList.remove('hidden');
    window.dispatchEvent(new Event('resize'));

    const scene = document.querySelector('a-scene');
    if (scene) {
        try { scene.resize(); } catch (e) { }

        // Check for true WebXR VR support (Quest)
        let vrSupported = false;
        if (navigator.xr) {
            try {
                vrSupported = await navigator.xr.isSessionSupported('immersive-vr');
            } catch (e) { console.warn("WebXR check failed", e); }
        }

        if (vrSupported) {
            console.log("[WebXR] Headset detected. Entering immersive mode.");
            scene.enterVR(); // This prompts the browser to go full immersive
        } else {
            console.log("[WebXR] No immersive-vr support. Using Desktop Fallback.");
            const desktopCursor = document.getElementById('desktop-cursor');
            if (desktopCursor) desktopCursor.setAttribute('visible', 'true');
        }

        const cam = scene.querySelector('#vr-cam, a-camera');
        if (cam) {
            const pos = cam.getAttribute('position');
            if (!pos || (pos.x === 0 && pos.y === 0 && pos.z === 0)) cam.setAttribute('position', '0 1.6 0');
        }
    }
};

window.exitVR = function () {
    const uiLayer = document.getElementById('ui-layer');
    const vrLayer = document.getElementById('vr-layer');
    const scene = document.querySelector('a-scene');
    if (scene && typeof scene.is === 'function' && scene.is('vr-mode')) scene.exitVR();
    if (vrLayer) vrLayer.classList.add('hidden');
    if (uiLayer) uiLayer.classList.remove('hidden');
};

document.addEventListener('DOMContentLoaded', () => {
    init2D();
    initManagementSync();
    initAICoachAdvisor(); // V75 call
    initDeepDiveModals(); // V79 call

    // VR Scene init wrapper
    const scene = document.querySelector('a-scene');
    if (scene && scene.hasLoaded) {
        initVR();
    } else if (scene) {
        scene.addEventListener('loaded', initVR);
    }
});

function init2D() {
    renderCards2D();
    renderPitch2D("442");

    const btn442 = document.getElementById('btn-2d-442');
    const btn343 = document.getElementById('btn-2d-343');
    const btnFunino = document.getElementById('btn-2d-funino');

    // Settings Modal Logic
    const btnSettings = document.getElementById('btn-settings');
    const settingsOverlay = document.getElementById('settings-overlay');
    const btnCloseSettings = document.getElementById('btn-close-settings');

    if (btnSettings && settingsOverlay) {
        btnSettings.addEventListener('click', () => {
            settingsOverlay.classList.remove('hidden');
        });
    }

    if (btnCloseSettings && settingsOverlay) {
        btnCloseSettings.addEventListener('click', () => {
            settingsOverlay.classList.add('hidden');
        });
    }

    btn442.addEventListener('click', () => {
        btn442.classList.add('active');
        btn343.classList.remove('active');
        if (btnFunino) btnFunino.classList.remove('active');
        renderPitch2D("442");
        if (window.vrReady) renderTacticsVR("442");
    });

    btn343.addEventListener('click', () => {
        btn343.classList.add('active');
        btn442.classList.remove('active');
        if (btnFunino) btnFunino.classList.remove('active');
        renderPitch2D("343");
        if (window.vrReady) renderTacticsVR("343");
    });

    if (btnFunino) {
        btnFunino.addEventListener('click', () => {
            btnFunino.classList.add('active');
            btn442.classList.remove('active');
            btn343.classList.remove('active');
            renderPitch2D("funino");
            if (window.vrReady) renderTacticsVR("funino");
        });
    }

    // Mode Toggle
    const btnMode = document.getElementById('btn-mode-toggle');
    if (btnMode) {
        let currentMode = "MATCH";
        btnMode.addEventListener('click', () => {
            currentMode = currentMode === "MATCH" ? "TRAINING" : "MATCH";
            btnMode.innerText = `MODE: ${currentMode}`;

            if (window.vrReady) {
                const ambient = document.querySelector('a-light[type="ambient"]');
                const spots = document.querySelectorAll('a-light[type="spot"]');
                if (currentMode === "TRAINING") {
                    ambient.setAttribute('intensity', '0.8');
                    spots.forEach(s => s.setAttribute('intensity', '0.5'));
                    btnMode.style.borderColor = "var(--accent-green)";
                    btnMode.style.color = "var(--accent-green)";
                } else {
                    ambient.setAttribute('intensity', '0.5');
                    spots.forEach(s => s.setAttribute('intensity', '1.5'));
                    btnMode.style.borderColor = "var(--accent-magenta)";
                    btnMode.style.color = "var(--accent-magenta)";
                }
            }
        });
    }

    // VR Toggle Buttons
    const btnEnterVR = document.getElementById('btn-enter-vr');
    const btnExitVR = document.getElementById('btn-exit-vr');
    const uiLayer = document.getElementById('ui-layer');
    const vrLayer = document.getElementById('vr-layer');

    if (btnEnterVR && uiLayer && vrLayer) {
        btnEnterVR.addEventListener('click', () => {
            uiLayer.classList.add('hidden');
            vrLayer.classList.remove('hidden');

            // Trigger resize so A-Frame canvas adjusts correctly
            window.dispatchEvent(new Event('resize'));

            // Ensure scene is properly initialized when unhidden
            setTimeout(() => {
                const scene = document.querySelector('a-scene');
                if (scene) {
                    scene.resize();

                    const ambient = scene.querySelector('a-light[type="ambient"]');
                    if (ambient) ambient.setAttribute('intensity', '1.2');

                    const cam = scene.querySelector('#vr-cam, a-camera');
                    if (cam) {
                        const pos = cam.getAttribute('position');
                        if (!pos || (pos.x === 0 && pos.y === 0 && pos.z === 0)) {
                            cam.setAttribute('position', '0 1.6 0');
                        }
                    }

                    try {
                        if (scene.renderer) scene.renderer.render(scene.object3D, scene.camera);
                    } catch (e) {
                        console.warn('VR Render force-tick error:', e);
                    }
                }
            }, 300);
        });
    } else {
        console.warn('[VR] btn-enter-vr, ui-layer or vr-layer not found in DOM.');
    }

    if (btnExitVR && uiLayer && vrLayer) {
        btnExitVR.addEventListener('click', () => {
            const scene = document.querySelector('a-scene');
            if (scene && scene.is('vr-mode')) scene.exitVR();
            vrLayer.classList.add('hidden');
            uiLayer.classList.remove('hidden');
        });
    }
}

function renderCards2D() {
    const grid = document.getElementById('squad-grid-2d');
    grid.innerHTML = '';

    // Color mapping for pure-css flags (simplified blocks for the aesthetic)
    const flags = {
        'ger': 'linear-gradient(to bottom, #000 33%, #fbceb1 33% 66%, #ffce00 66%)', // simplified
        'kor': 'linear-gradient(to right, #cd2e3a 50%, #0047a0 50%)',
        'ned': 'linear-gradient(to bottom, #ae1c28 33%, #fff 33% 66%, #21468b 66%)',
        'can': 'linear-gradient(to right, #ff0000 30%, #fff 30% 70%, #ff0000 70%)',
        'eng': 'linear-gradient(to bottom, #fff 40%, #ce1126 40% 60%, #fff 60%)'
    };

    squadData.forEach(player => {
        const flagBg = flags[player.nation] || '#ccc';

        // Generate deterministic mental stats per player based on their ID seed
        const seed = player.id * 13;
        const mentalStats = {
            MENTALITY: Math.min(99, 55 + (seed * 3) % 40),
            COMPOSURE: Math.min(99, 60 + (seed * 7) % 35),
            LEADERSHIP: Math.min(99, 40 + (seed * 11) % 50),
            PRESSURE: Math.min(99, 50 + (seed * 5) % 45),
            RESILIENCE: Math.min(99, 55 + (seed * 9) % 40),
            AGGRESSION: Math.min(99, 45 + (seed * 17) % 50),
            VISION: Math.min(99, 60 + (seed * 2) % 35),
            TEAMWORK: Math.min(99, 65 + (seed * 4) % 30),
        };

        const card = document.createElement('div');
        card.className = 'fifa-card';
        card.dataset.id = player.id;

        // V75: Click to open Player Editor Matrix
        card.addEventListener('click', () => {
            openPlayerEditor(player.id);
        });

        // Bugfix: Enforce correct drag data binding individually
        card.draggable = true;
        card.addEventListener('dragstart', e => {
            e.dataTransfer.setData('application/player-data', JSON.stringify({
                id: player.id,
                name: player.name,
                number: player.id, // using player.id as jersey proxy 
                position: player.pos
            }));
        });

        // V79: Build flip-card structure (Front = stats, Back = Mental-State-Matrix)
        const msm_html = Object.entries(mentalStats).map(([key, val]) =>
            `<div class="msm-stat"><span>${key.substring(0, 3)}</span><b>${val}</b></div>`
        ).join('');

        // Translate Stats and Positions
        const isDe = window.currentLang === 'de';
        const labels = {
            PAC: isDe ? 'TEM' : 'PAC', DRI: isDe ? 'DRI' : 'DRI',
            SHO: isDe ? 'SCH' : 'SHO', DEF: isDe ? 'DEF' : 'DEF',
            PAS: isDe ? 'PAS' : 'PAS', PHY: isDe ? 'PHY' : 'PHY',
            GK: isDe ? 'TW' : 'GK', CB: isDe ? 'IV' : 'CB',
            LB: isDe ? 'LV' : 'LB', RB: isDe ? 'RV' : 'RB',
            CM: isDe ? 'ZM' : 'CM', RM: isDe ? 'RM' : 'RM',
            LM: isDe ? 'LM' : 'LM', ST: isDe ? 'ST' : 'ST',
            LWB: isDe ? 'LAV' : 'LWB', RWB: isDe ? 'RAV' : 'RWB',
            LW: isDe ? 'LF' : 'LW', RW: isDe ? 'RF' : 'RW',
            CF: isDe ? 'MS' : 'CF'
        };

        card.innerHTML = `
            <div class="flip-card-inner">
                <!-- FRONT: Standard FIFA-Card Stats -->
                <div class="flip-card-front">
                    <div class="fc-header">
                        <div class="fc-left-col">
                            <div class="fc-ovr">${player.ovr}</div>
                            <div class="fc-pos">${labels[player.pos] || player.pos}</div>
                            <div class="fc-nation-icon" style="background: ${flagBg};"></div>
                        </div>
                        <div class="fc-silhouette"></div>
                    </div>
                    
                    <div class="fc-name-bar">
                        <div class="fc-name">${player.name}</div>
                    </div>
                    
                    <div class="fc-stats-grid">
                        <span>${labels.PAC} <b>${player.stats.pac}</b></span>
                        <span>${labels.DRI} <b>${player.stats.dri}</b></span>
                        <span>${labels.SHO} <b>${player.stats.sho}</b></span>
                        <span>${labels.DEF} <b>${player.stats.def}</b></span>
                        <span>${labels.PAS} <b>${player.stats.pas}</b></span>
                        <span>${labels.PHY} <b>${player.stats.phy}</b></span>
                    </div>

                    <!-- Detailed Popover -->
                    <div class="fc-popover">
                        <h4>DATA UPLINK: ${player.name}</h4>
                        <div class="fc-pop-row">Work Rate <b>${player.stats.workRate}</b></div>
                        <div class="fc-pop-row">Weak Foot <b>${player.stats.weakFoot}★</b></div>
                        <div class="fc-pop-row" style="margin-top: 5px; border-top: 1px solid #333; padding-top: 4px;">Fitness <b>96%</b></div>
                        <div class="fc-pop-row">Morale <b>Optimum</b></div>
                    </div>
                </div>

                <!-- BACK: Mental-State-Matrix (V79) -->
                <div class="flip-card-back">
                    <div class="msm-header">MENTAL-STATE-MATRIX</div>
                    <div class="msm-grid">${msm_html}</div>
                    <div class="msm-footer">// ${player.name} // PSYCHOLOGICAL PROFILE //</div>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}


function renderPitch2D(type) {
    const pitch = document.getElementById('pitch-2d');
    // Keep pitch lines, remove only markers & funino specific elements
    const existingMarkers = pitch.querySelectorAll('.player-marker-2d, .funino-goal-2d');
    existingMarkers.forEach(m => m.remove());

    const isFunino = type === "funino";

    if (isFunino) {
        // Obscure full pitch lines to simulate the smaller pitch
        const lines = pitch.querySelector('.pitch-lines');
        if (lines) lines.style.opacity = '0.2';
    } else {
        const lines = pitch.querySelector('.pitch-lines');
        if (lines) lines.style.opacity = '1.0';
    }

    let assignedIds = new Set();

    formations2D[type].forEach(pos => {
        const marker = document.createElement('div');

        if (pos.isGoal) {
            marker.className = 'funino-goal-2d';
            marker.style.position = 'absolute';
            marker.style.left = `${pos.x}%`;
            marker.style.top = `${pos.y}%`;
            marker.style.width = '40px';
            marker.style.height = '10px';
            marker.style.background = 'var(--accent-magenta)';
            marker.style.transform = 'translate(-50%, -50%)';
            marker.style.boxShadow = '0 0 10px rgba(255, 0, 255, 0.5)';
            marker.style.borderRadius = '2px';
        } else {
            marker.className = 'player-marker-2d';
            marker.style.left = `${pos.x}%`;
            marker.style.top = `${pos.y}%`;

            // Match position to player array for fifa-like tokens
            let player = mockSquadData.find(p =>
                (p.pos === pos.label || p.pos.includes(pos.label.replace('W', '')) || pos.label.includes(p.pos.replace('W', '')))
                && !assignedIds.has(p.id)
            );
            if (!player) player = mockSquadData.find(p => !assignedIds.has(p.id));

            if (player) {
                assignedIds.add(player.id);
                marker.innerHTML = `
                    <div style="font-size: 0.8rem; font-weight: 900; line-height:1;">${player.ovr}</div>
                    <div class="tok-name" style="position: absolute; top: 115%; font-size: 0.6rem; white-space: nowrap; text-shadow: 0px 0px 4px #000; color: #fff; font-family: var(--font-heading);">${player.name}</div>
                `;
            } else {
                marker.innerText = pos.label;
            }

            // Adjust label text sizes for funino
            if (isFunino) marker.style.transform = 'translate(-50%, -50%) scale(0.6)';
        }

        pitch.appendChild(marker);
    });
}

function initManagementSync() {
    // Stage 1 (V73) Management Links
    const inpSponsoring = document.getElementById('input-sponsoring');
    const inpStadion = document.getElementById('input-stadion');
    const inpBudget = document.getElementById('input-budget');
    const vrScreenText = document.getElementById('vr-screen-text');

    function updateVRScreen() {
        if (!vrScreenText) return; // Might not be parsed yet if not in VR

        let sp = inpSponsoring ? inpSponsoring.value : "+2 open contracts";
        let st = inpStadion ? inpStadion.value : "Ready";
        let bu = inpBudget ? inpBudget.value : "24.5M";

        // Match the formatting of the existing VR label
        const newText = `Stadionzeitung: ${st}\nSponsoring: ${sp}\nBudget: ${bu}`;
        vrScreenText.setAttribute('value', newText);
    }

    if (inpSponsoring) inpSponsoring.addEventListener('input', updateVRScreen);
    if (inpStadion) inpStadion.addEventListener('input', updateVRScreen);
    if (inpBudget) inpBudget.addEventListener('input', updateVRScreen);

    // Phase 6.1: NLZ / Elite Development Sync
    const toggleDnaSync = document.getElementById('toggle-dna-sync');
    const nlzHolograms = document.getElementById('nlz-holograms');

    if (toggleDnaSync) {
        toggleDnaSync.addEventListener('change', (e) => {
            if (nlzHolograms) {
                // Instantly sync the toggle state to the VR holograms visibility
                nlzHolograms.setAttribute('visible', e.target.checked);
            }
        });
    }

    // Phase 6.2: Strategy DNA Sliders -> VR Pitch Tilt Sync
    const sliderPressing = document.getElementById('slider-pressing');
    const valPressing = document.getElementById('val-pressing');
    const sliderVert = document.getElementById('slider-verticality');
    const valVert = document.getElementById('val-verticality');
    const sliderWidth = document.getElementById('slider-width');
    const valWidth = document.getElementById('val-width');
    const vrPitchBoard = document.getElementById('vr-pitch-board');

    function updateDNASliders() {
        if (sliderPressing && valPressing) {
            valPressing.textContent = sliderPressing.value + '%';
            // Map 0-100 to pitch rotation x between -90 (flat) and -45 (tilted up towards user)
            if (vrPitchBoard) {
                // 0% -> -90, 100% -> -45. Formula: -90 + (value * 0.45)
                const newRotX = -90 + (parseInt(sliderPressing.value) * 0.45);
                const currentRot = vrPitchBoard.getAttribute('rotation') || { x: -90, y: 0, z: 0 };
                vrPitchBoard.setAttribute('rotation', { x: newRotX, y: currentRot.y, z: currentRot.z });
            }
        }
        if (sliderVert && valVert) valVert.textContent = sliderVert.value + '%';
        if (sliderWidth && valWidth) valWidth.textContent = sliderWidth.value + '%';
    }

    if (sliderPressing) sliderPressing.addEventListener('input', updateDNASliders);
    if (sliderVert) sliderVert.addEventListener('input', updateDNASliders);
    if (sliderWidth) sliderWidth.addEventListener('input', updateDNASliders);

    // Phase 6.3: Sponsoring & Commercial VR Sync
    const inpSponsorSleeve = document.getElementById('input-sponsor-sleeve');
    const inpSponsorCrypto = document.getElementById('input-sponsor-crypto');
    const vrSponsorSleeve = document.getElementById('vr-sponsor-sleeve');
    const vrSponsorCrypto = document.getElementById('vr-sponsor-crypto');

    if (inpSponsorSleeve && vrSponsorSleeve) {
        inpSponsorSleeve.addEventListener('input', (e) => {
            vrSponsorSleeve.setAttribute('value', e.target.value);
        });
    }

    if (inpSponsorCrypto && vrSponsorCrypto) {
        inpSponsorCrypto.addEventListener('input', (e) => {
            vrSponsorCrypto.setAttribute('value', e.target.value);
        });
    }

    // Phase 6.4: Stadionzeitung / Media Hub VR Sync
    const inpMediaHeadline = document.getElementById('input-media-headline');
    const selMediaFocus = document.getElementById('select-media-focus');
    const selMediaStatus = document.getElementById('select-media-status');
    const vrMediaHeadline = document.getElementById('vr-media-headline');
    const vrMediaFocus = document.getElementById('vr-media-focus');
    const vrMediaStatus = document.getElementById('vr-media-status');

    if (inpMediaHeadline && vrMediaHeadline) {
        inpMediaHeadline.addEventListener('input', (e) => {
            vrMediaHeadline.setAttribute('value', e.target.value);
        });
    }

    if (selMediaFocus && vrMediaFocus) {
        selMediaFocus.addEventListener('change', (e) => {
            vrMediaFocus.setAttribute('value', e.target.value);
        });
    }

    if (selMediaStatus && vrMediaStatus) {
        selMediaStatus.addEventListener('change', (e) => {
            vrMediaStatus.setAttribute('value', 'STATUS: ' + e.target.value);
            // Color changing logic (optional, but requested in brief as "Status")
            let color = '#ff00ff';
            if (e.target.value === 'Live') color = '#00ff00';
            if (e.target.value === 'Archived') color = '#fbbf24';
            vrMediaStatus.setAttribute('color', color);
        });
    }

    // Phase 6.5: Tech-Upgrades VR Sync
    const toggleTechUpgrade = document.getElementById('toggle-tech-upgrade');
    const vrTechUpgrades = document.getElementById('vr-tech-upgrades');

    if (toggleTechUpgrade) {
        toggleTechUpgrade.addEventListener('change', (e) => {
            if (vrTechUpgrades) {
                vrTechUpgrades.setAttribute('visible', e.target.checked);
            }
        });
    }

    // Phase 6.6: System-Log & Voice-Uplink VR Sync
    const inputVoiceCmd = document.getElementById('input-voice-cmd');
    const btnSendCmd = document.getElementById('btn-send-cmd');
    const logTranscription = document.getElementById('log-transcription');
    const vrLog1 = document.getElementById('vr-hud-log-1');
    const vrLog2 = document.getElementById('vr-hud-log-2');
    const vrLog3 = document.getElementById('vr-hud-log-3');

    // Store the last 3 logs in memory for VR
    let vrLogs = [
        "> SYSTEM INITIALIZED",
        "> WAITING FOR CMDS",
        ""
    ];

    if (btnSendCmd && inputVoiceCmd) {
        btnSendCmd.addEventListener('click', () => {
            const cmdText = inputVoiceCmd.value.trim().toUpperCase();
            if (!cmdText) return;

            const logEntry = `> ${cmdText}`;

            // 1. Update 2D Log
            const span = document.createElement('span');
            span.textContent = logEntry;
            span.style.color = '#fff';
            logTranscription.appendChild(span);
            logTranscription.scrollTop = logTranscription.scrollHeight;

            // 2. Update VR HUD
            vrLogs.shift(); // Remove oldest
            vrLogs.push(logEntry); // Add newest

            if (vrLog1) vrLog1.setAttribute('value', vrLogs[0]);
            if (vrLog2) vrLog2.setAttribute('value', vrLogs[1]);
            if (vrLog3) vrLog3.setAttribute('value', vrLogs[2]);
            if (vrLog3) vrLog3.setAttribute('color', '#00ffff'); // Highlight newest
            if (vrLog2) vrLog2.setAttribute('color', '#aaa'); // Dim older

            // V75 Module 5: Voice Back-End Interpretation
            if (cmdText.includes('WEAK-FOOT') || cmdText.includes('FUNINO') || cmdText.includes('WEAK FOOT')) {
                const btnFunino = document.getElementById('btn-2d-funino');
                if (btnFunino) btnFunino.click(); // Trigger the 2D/VR Funino layout swap

                setTimeout(() => {
                    const aiSpan = document.createElement('span');
                    aiSpan.textContent = `> AI: GENERATING FUNINO LAYOUT FOR WEAK-FOOT FOCUS...`;
                    aiSpan.style.color = 'var(--accent-cyan)';
                    logTranscription.appendChild(aiSpan);
                    logTranscription.scrollTop = logTranscription.scrollHeight;
                    if (typeof updateLiveTrainingPlan === 'function') updateLiveTrainingPlan('FUNINO: W-FOOT FOCUS', 'Setup: 4 Mini-Goals. Rule: Left foot goals x2.');
                }, 800);
            }

            // V76: LIVE AI FLEXIBILITY (THE DIALOGUE)
            if (cmdText.includes('UNRUHIG') || cmdText.includes('FANGSPIEL')) {
                setTimeout(() => {
                    const aiSpan = document.createElement('span');
                    aiSpan.textContent = `> AI: SWITCHING TO HIGH-ENERGY WARMUP: TAG GAME.`;
                    aiSpan.style.color = 'var(--accent-cyan)';
                    logTranscription.appendChild(aiSpan);
                    logTranscription.scrollTop = logTranscription.scrollHeight;
                    if (typeof updateLiveTrainingPlan === 'function') updateLiveTrainingPlan('WARMUP: FANGSPIEL', 'Focus: Burn energy, scattered movement.');
                    if (typeof scatterPlayersVR === 'function') scatterPlayersVR();
                }, 800);
            }

            if (cmdText.includes('2-GEGEN-2') || cmdText.includes('2V2')) {
                setTimeout(() => {
                    const aiSpan = document.createElement('span');
                    aiSpan.textContent = `> AI: ADJUSTING FUNINO FIELD TO 2V2 WITH PROVOCATION RULES.`;
                    aiSpan.style.color = 'var(--accent-cyan)';
                    logTranscription.appendChild(aiSpan);
                    logTranscription.scrollTop = logTranscription.scrollHeight;
                    if (typeof updateLiveTrainingPlan === 'function') updateLiveTrainingPlan('FUNINO: 2v2 LIMIT', 'Focus: Decision making under extreme pressure.');
                    if (typeof renderTacticsVR === 'function') renderTacticsVR('funino_2v2');
                }, 800);
            }

            if (cmdText.includes('ANNEHMEN') || cmdText.includes('MITNEHMEN')) {
                setTimeout(() => {
                    const aiSpan = document.createElement('span');
                    aiSpan.textContent = `> AI: UPDATING SESSION: INTENSIVE FIRST TOUCH SQUARES.`;
                    aiSpan.style.color = 'var(--accent-cyan)';
                    logTranscription.appendChild(aiSpan);
                    logTranscription.scrollTop = logTranscription.scrollHeight;
                    if (typeof updateLiveTrainingPlan === 'function') updateLiveTrainingPlan('TECH: FIRST TOUCH', 'Focus: Body orientation, scanning before receive.');
                }, 800);
            }

            if (cmdText.includes('ABWEHRLINIE') && (cmdText.includes('VOR') || cmdText.includes('VERSCHIEBE'))) {
                setTimeout(() => {
                    const aiSpan = document.createElement('span');
                    aiSpan.textContent = `> AI: SHIFTING DEFENSIVE LINE +2 METERS IN VR.`;
                    aiSpan.style.color = 'var(--accent-cyan)';
                    logTranscription.appendChild(aiSpan);
                    logTranscription.scrollTop = logTranscription.scrollHeight;
                    if (typeof shiftDefensiveLineVR === 'function') shiftDefensiveLineVR(-0.2);
                }, 800);
            }

            // Clear input
            inputVoiceCmd.value = '';
        });

        // Setup Enter key override
        inputVoiceCmd.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                btnSendCmd.click();
            }
        });
    }
}

// --- VR LOGIC ---

function initVR() {
    window.vrReady = true;
    initVRInteraction();

    // Sync VR to current 2D state initially
    const activeBtn = document.querySelector('.tactic-controls .cyber-btn.active');
    const initialType = activeBtn && activeBtn.id.includes('343') ? "343" : "442";
    renderTacticsVR(initialType);

    // Spawn the VR Card Stock
    renderVRCardStock();
}

function initVRInteraction() {
    // 2D Dashboard buttons matching
    const btnModeToggle2D = document.getElementById('btn-mode-toggle');

    // VR Control Panel Buttons
    const btnVRMode = document.getElementById('btn-vr-mode');
    const btnVRSave = document.getElementById('btn-vr-save');
    const txtVRMode = document.getElementById('txt-vr-mode');

    // V76: 2D Dashboard Event Listeners
    const btnSimplifyDrill = document.getElementById('btn-simplify-drill');
    if (btnSimplifyDrill) {
        btnSimplifyDrill.addEventListener('click', () => {
            logAIResponse('SIMPLIFYING DRILL: SCALING UP GOALS FOR YOUTH ADAPTATION.');
            updateLiveTrainingPlan('FUNINO: SCALED GOALS', 'Goals enlarged by 50% for easier finishing confidence.');

            // Increase goal target sizes in VR
            const container = document.getElementById('pitch-container');
            if (container) {
                const markers = container.querySelectorAll('a-entity');
                markers.forEach(marker => {
                    const textEl = marker.querySelector('a-text');
                    if (textEl && textEl.getAttribute('value').includes('GOAL')) {
                        const cyl = marker.querySelector('a-cylinder');
                        if (cyl) {
                            cyl.setAttribute('animation__simplify', `property: scale; to: 1.5 1.5 1.5; dur: 800; easing: easeOutElastic`);
                            cyl.setAttribute('color', '#00ff00'); // glow green
                        }
                    }
                });
            }

            // Project a coaching zone
            renderCoachingZoneVR(0, 0); // Center pitch
        });
    }

    if (btnVRMode && btnModeToggle2D) {
        btnVRMode.addEventListener('click', () => {
            // Trigger the 2D button click to sync logic and lighting
            btnModeToggle2D.click();
            // Update the text in VR manually for instant feedback
            if (btnModeToggle2D.innerText.includes('MATCH')) {
                txtVRMode.setAttribute('value', 'MODUS: SPIEL');
                txtVRMode.setAttribute('color', '#ff00ff');
            } else {
                txtVRMode.setAttribute('value', 'MODUS: TRAINING');
                txtVRMode.setAttribute('color', '#00ff00');
            }
        });
    }

    if (btnVRSave) {
        btnVRSave.addEventListener('click', () => {
            btnVRSave.querySelector('a-box').setAttribute('material', 'color', '#00ffff');
            btnVRSave.querySelector('a-text').setAttribute('value', 'MAPPE EXPORTIERT...');

            // V75: Trigger Drill Animation Engine
            simulateDrillAnimation();

            // V75 Module 4: Save tactical setup as JSON logic (mocking export)
            const activeType = document.querySelector('.tactic-controls .cyber-btn.active').innerText;
            const snapshot = {
                timestamp: new Date().toISOString(),
                formation: activeType,
                drillActive: true,
                focus: "Overlapping Runs / Funino Build-up"
            };

            console.log(">>> SYSTEM: VR PDF/JSON Export Logic Triggered. Snapshot generated:", snapshot);
            // Simulate saving to localStorage
            localStorage.setItem('starkElite_latestDrill', JSON.stringify(snapshot));

            setTimeout(() => {
                btnVRSave.querySelector('a-box').setAttribute('material', 'color', '#004444');
                btnVRSave.querySelector('a-text').setAttribute('value', 'AUFSTELLUNG SPEICHERN');
            }, 3000);
        });
    }
}

// V75: Animation Engine for Drill Execution
function simulateDrillAnimation() {
    const container = document.getElementById('pitch-container');
    if (!container) return;

    // Animate all attackers moving forward to simulate an overlapping run
    const markers = container.querySelectorAll('a-entity');
    markers.forEach((marker, index) => {
        const textEl = marker.querySelector('a-text');
        if (textEl) {
            const label = textEl.getAttribute('value');
            if (label.includes('ST') || label.includes('LW') || label.includes('RW') || label.includes('ATT')) {
                // Move them forward along the local Z axis
                const currentPos = marker.getAttribute('position');
                const newZ = currentPos.z - 0.4; // Move 'UP' pitch

                marker.setAttribute('animation__run', `property: position; to: ${currentPos.x} ${newZ} ${currentPos.y}; dur: 2000; easing: easeInOutSine; dir: alternate; loop: 2`);

                // Show passing trail
                const passTrail = document.createElement('a-entity');
                passTrail.setAttribute('line', `start: ${currentPos.x}, ${currentPos.y}, ${currentPos.z}; end: ${currentPos.x}, ${currentPos.y}, ${newZ}; color: #00ffff; opacity: 0`);
                passTrail.setAttribute('animation', `property: line.opacity; to: 0.8; dur: 1000; dir: alternate; loop: 2`);
                container.appendChild(passTrail);

                setTimeout(() => passTrail.remove(), 4000);
            }
        }
    });
}

function renderTacticsVR(type) {
    const container = document.getElementById('pitch-container');
    if (!container) return;

    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    const scale = 0.8;
    const isFunino = type === "funino";

    formationsVR[type].forEach(pos => {
        const marker = document.createElement('a-entity');
        // Z is "up" in the pitch container's local space due to the -90x parent rotation
        marker.setAttribute('position', `${pos.x * scale} ${pos.z * scale} 0`);
        marker.setAttribute('rotation', '90 180 0'); // Stand upright

        if (pos.isGoal) {
            // Render Funino Mini-Goal
            marker.innerHTML = `
                <!-- Goal Posts -->
                <a-cylinder radius="0.02" height="0.4" color="#ff00ff" position="-0.4 0.2 0" material="metalness: 0.8; opacity: 0.9"></a-cylinder>
                <a-cylinder radius="0.02" height="0.4" color="#ff00ff" position="0.4 0.2 0" material="metalness: 0.8; opacity: 0.9"></a-cylinder>
                <a-cylinder radius="0.02" height="0.8" color="#ff00ff" position="0 0.4 0" rotation="0 0 90" material="metalness: 0.8; opacity: 0.9"></a-cylinder>
                <!-- Wireframe Net -->
                <a-plane width="0.8" height="0.4" color="#ff00ff" material="wireframe: true; opacity: 0.5" position="0 0.2 -0.2" rotation="20 0 0"></a-plane>
            `;
        } else {
            // Render regular Player Hologram
            let sizeScale = isFunino ? "0.7 0.7 0.7" : "1 1 1";
            let color = isFunino ? "#ff00ff" : "#00ffff"; // Magenta for youths
            marker.innerHTML = `
                <a-entity scale="${sizeScale}">
                    <!-- Glowing Base -->
                    <a-cylinder radius="0.12" height="0.02" color="${color}" material="opacity: 0.8" position="0 0.01 0"></a-cylinder>
                    <!-- Player Hologram Cylinder -->
                    <a-cylinder radius="0.04" height="0.4" color="${color}" material="opacity: 0.6; wireframe: true" position="0 0.2 0"></a-cylinder>
                    <!-- Label -->
                    <a-text value="${pos.label}" align="center" position="0 0.5 0" width="2" color="white"></a-text>
                </a-entity>
            `;
        }

        container.appendChild(marker);
    });

    // If Funino, render optimal passing lanes (AI Training Consultant integration)
    if (isFunino) {
        const passingLanes = document.createElement('a-entity');
        passingLanes.innerHTML = `
            <a-entity line="start: -0.4, -0.4, 0.02; end: 0.4, 0.4, 0.02; color: #ff00ff; opacity: 0.5"></a-entity>
            <a-entity line="start: 0.4, -0.4, 0.02; end: -0.4, 0.4, 0.02; color: #ff00ff; opacity: 0.5"></a-entity>
            <a-text value="AI PASSING ZONES" position="0 0 0.03" rotation="90 0 0" align="center" color="#ff00ff" scale="0.3 0.3 0.3"></a-text>
        `;
        container.appendChild(passingLanes);
    }
}

function renderVRCardStock() {
    const container = document.getElementById('floating-card-stock');
    if (!container) return;

    // Arrange realistic looking 3D FIFA cards
    const startX = -1.2;
    const spacingX = 0.6;
    const zOffset = 0.1;

    // Only render the first 5 players to simulate the "Hand" of cards
    squadData.slice(0, 5).forEach((player, index) => {
        const card = document.createElement('a-entity');
        // Fan them out slightly using Z offset
        card.setAttribute('position', `${startX + (index * spacingX)} 0 ${index * -0.15}`);
        card.setAttribute('rotation', `0 ${index * -5} 0`);
        card.setAttribute('class', 'interactable'); // Must be interactable to drag
        card.setAttribute('draggable-card', '');

        // Construct the 3D card layout matching the V73 design
        const html = `
            <a-plane class="card-bg" width="0.5" height="0.7" material="color: #050a0f; metalness: 0.5; roughness: 0.8; opacity: 0.8; transparent: true"></a-plane>
            <!-- Border -->
            <a-plane width="0.52" height="0.72" material="color: #00ffff; wireframe: true" position="0 0 -0.01"></a-plane>
            
            <!-- Overall & Pos -->
            <a-text value="${player.ovr}" position="-0.15 0.25 0.01" align="center" width="3" color="#00ffff"></a-text>
            <a-text value="${player.pos}" position="-0.15 0.15 0.01" align="center" width="1.5" color="#888"></a-text>
            
            <!-- Silhouette Placeholder -->
            <a-circle radius="0.12" position="0.1 0.15 0.01" color="#888" material="opacity: 0.5"></a-circle>
            
            <!-- Separation Line -->
            <a-plane width="0.45" height="0.01" position="0 0.02 0.01" material="color: #00ffff; opacity: 0.5"></a-plane>
            
            <!-- Name -->
            <a-text value="${player.name}" position="0 -0.05 0.01" align="center" width="2" color="#fff"></a-text>
            
            <!-- Stats -->
            <a-text value="PAC ${player.stats.pac}  DRI ${player.stats.dri}" position="0 -0.15 0.01" align="center" width="1.2" color="#ccc"></a-text>
            <a-text value="SHO ${player.stats.sho}  DEF ${player.stats.def}" position="0 -0.22 0.01" align="center" width="1.2" color="#ccc"></a-text>
            <a-text value="PAS ${player.stats.pas}  PHY ${player.stats.phy}" position="0 -0.29 0.01" align="center" width="1.2" color="#ccc"></a-text>
        `;
        card.innerHTML = html;
        container.appendChild(card);
    });
}

// -- V75: AI Coach Advisor Logic --
const pedagogicalCues = [
    "Focus on positive reinforcement for Player X – struggling with first touch.",
    "Praise the effort on track-backs, not just the successful tackles.",
    "Notice: Player Y is dominating 1v1s. Increase difficulty by limiting touches.",
    "Remind the group to scan their shoulders before receiving.",
    "Energy levels dropping: Suggest a quick 30-second water break.",
    "Excellent rotation in the last drill. Highlight this in the post-session talk."
];

function initAICoachAdvisor() {
    const cue1 = document.getElementById('ai-coach-cue-1');
    const vrLog3 = document.getElementById('vr-hud-log-3'); // Hijacking a log line for VR display

    // Simulate AI feeding real-time context cues every 15 seconds
    setInterval(() => {
        const randomCue = pedagogicalCues[Math.floor(Math.random() * pedagogicalCues.length)];

        // Update 2D Dashboard
        if (cue1) cue1.innerText = `"${randomCue}"`;

        // Update VR HUD
        if (vrLog3) {
            vrLog3.setAttribute('value', `AI CUE: ${randomCue.substring(0, 30)}...`);
            vrLog3.setAttribute('color', '#00ff00'); // pedagogical green
        }
    }, 15000);
}

// -- V75: Dynamic Player Matrix Editor Logic --
let editingPlayerId = null;

function openPlayerEditor(id) {
    const player = squadData.find(p => p.id === id);
    if (!player) return;

    editingPlayerId = id;
    const overlay = document.getElementById('player-editor-overlay');
    const nameTitle = document.getElementById('editor-player-name');
    const sliderContainer = document.getElementById('editor-sliders');
    const ageContext = document.getElementById('editor-age-context');
    const btnClose = document.getElementById('btn-close-editor');
    const btnSave = document.getElementById('btn-save-editor');

    if (!overlay) return;

    nameTitle.innerText = `${player.name} (${player.pos})`;
    sliderContainer.innerHTML = ''; // clear old

    // Create sliders for PAC, SHO, PAS, DRI, DEF, PHY
    const statKeys = ['pac', 'sho', 'pas', 'dri', 'def', 'phy'];

    statKeys.forEach(stat => {
        const wrapper = document.createElement('div');
        wrapper.style.marginBottom = '10px';

        const labelRow = document.createElement('div');
        labelRow.className = 'module-row';
        labelRow.style.marginBottom = '2px';
        labelRow.innerHTML = `<span>${stat.toUpperCase()}</span><span id="val-${stat}" class="accent-text" style="color: var(--accent-magenta);">${player.stats[stat]}</span>`;

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.className = 'cyber-range';
        slider.min = '1';
        slider.max = '99';
        slider.value = player.stats[stat];
        slider.dataset.stat = stat;

        slider.addEventListener('input', (e) => {
            document.getElementById(`val-${stat}`).innerText = e.target.value;
            calculateLiveOVR(player.id, sliderContainer, ageContext.value);
        });

        wrapper.appendChild(labelRow);
        wrapper.appendChild(slider);
        sliderContainer.appendChild(wrapper);
    });

    // Initial Calc
    calculateLiveOVR(player.id, sliderContainer, ageContext.value);

    // Recalculate if context changes
    ageContext.onchange = () => calculateLiveOVR(player.id, sliderContainer, ageContext.value);

    // Handlers
    btnClose.onclick = () => overlay.classList.add('hidden');

    btnSave.onclick = () => {
        // Save to squadData
        const sliders = sliderContainer.querySelectorAll('.cyber-range');
        sliders.forEach(s => {
            player.stats[s.dataset.stat] = parseInt(s.value);
        });
        player.ovr = parseInt(document.getElementById('editor-live-ovr').innerText);

        // Close & Re-render UI
        overlay.classList.add('hidden');
        renderCards2D(); // Update 2D deck
        updateVRPlayerScale(player); // Sync to VR scale instantly
    };

    overlay.classList.remove('hidden');
}

function calculateLiveOVR(id, container, context) {
    const sliders = container.querySelectorAll('.cyber-range');
    let s = {};
    sliders.forEach(slider => {
        s[slider.dataset.stat] = parseInt(slider.value);
    });

    const player = squadData.find(p => p.id === id);
    let newOVR = 50; // base

    // V75 Differential Weight Algorithm (DFB Age Guidelines)
    if (context === 'youth') {
        // G- to E-Youth (Funino-Focus):
        // 40% Dribbling/Coordination, 30% Passing/First Touch, 20% Pace, 10% Shooting/Physics
        newOVR = (s.dri * 0.40) + (s.pas * 0.30) + (s.pac * 0.20) + (s.sho * 0.05) + (s.phy * 0.05);

        // Bonus: +5 OVR if Weak Foot > 3
        if (player && player.stats.weakFoot > 3) {
            newOVR += 5;
        }

        // V76: Weak Foot Intervention Logic
        if (player && player.stats.weakFoot <= 2) {
            setTimeout(() => {
                logAIResponse(`INTERVENTION: ${player.name} relies too heavily on dominant foot. Implement "Left/Right Foot Only" provocation rule in next Funino rotation.`);
            }, 1000);
        }
    } else if (context === 'transitional') {
        // D-Youth to U16 (Balanced training):
        // Even distribution ~16.6% across all 6 stats
        const avg = (s.pac + s.sho + s.pas + s.dri + s.def + s.phy) / 6;
        newOVR = avg;
    } else {
        // Pro Mode (V75 Standard - Position Specific Weighting)
        if (player) {
            if (player.pos === 'CB' || player.pos === 'LB' || player.pos === 'RB' || player.pos === 'LWB' || player.pos === 'RWB') {
                // Defenders: 50% DEF, 20% PHY, 10% PAC, 10% PAS, 10% DRI
                newOVR = (s.def * 0.50) + (s.phy * 0.20) + (s.pac * 0.10) + (s.pas * 0.10) + (s.dri * 0.10);
            } else if (player.pos === 'CM' || player.pos === 'CDM' || player.pos === 'CAM' || player.pos === 'LM' || player.pos === 'RM') {
                // Midfielders: 40% PAS, 30% DRI, 10% PAC, 10% DEF, 10% PHY
                newOVR = (s.pas * 0.40) + (s.dri * 0.30) + (s.pac * 0.10) + (s.def * 0.10) + (s.phy * 0.10);
            } else if (player.pos === 'ST' || player.pos === 'CF' || player.pos === 'LW' || player.pos === 'RW') {
                // Attackers: 40% SHO, 30% PAC, 20% DRI, 10% PHY
                newOVR = (s.sho * 0.40) + (s.pac * 0.30) + (s.dri * 0.20) + (s.phy * 0.10);
            } else if (player.pos === 'GK') {
                // Goalkeeper: heavily weighted on DEF/DIVING equivalent and reflexes (simulated via PAS/DEF)
                newOVR = (s.def * 0.60) + (s.pas * 0.30) + (s.phy * 0.10);
            } else {
                // Fallback
                newOVR = (s.dri * 0.15) + (s.pas * 0.15) + (s.pac * 0.20) + (s.def * 0.15) + (s.sho * 0.20) + (s.phy * 0.15);
            }
        }
    }

    // Cap at 99
    newOVR = Math.min(Math.round(newOVR), 99);

    document.getElementById('editor-live-ovr').innerText = newOVR;
}

function updateVRPlayerScale(player) {
    if (!window.vrReady) return;

    const container = document.getElementById('pitch-container');
    if (!container) return;

    // Find the VR marker for this player based on label
    // Note: in a real app, elements would be bound by ID. For this V75 mockup, we search by text.
    const markers = container.querySelectorAll('a-entity');

    markers.forEach(marker => {
        const textEl = marker.querySelector('a-text');
        if (textEl && textEl.getAttribute('value') === player.pos) {
            // We used pos for the label in the tactics board setup

            // Adjust visual scale based on new OVR. 
            // E.g. OVR 99 = scale 1.2, OVR 50 = scale 0.8
            // Formula: base 0.8 + ((ovr - 50) / 100)
            const scaleFactor = 0.8 + ((player.ovr - 50) / 100);

            // Apply scale specifically to the visual entity inside the marker (so position stays locked)
            const visualNode = marker.querySelector('a-entity'); // The inner scaled wrapper we added
            if (visualNode) {
                visualNode.setAttribute('animation', `property: scale; to: ${scaleFactor} ${scaleFactor} ${scaleFactor}; dur: 500; easing: easeOutElastic`);

                // Add a pulse effect to show change has transferred
                const glowObj = visualNode.querySelector('a-cylinder'); // Glowing base
                if (glowObj) {
                    const originalColor = glowObj.getAttribute('color');
                    glowObj.setAttribute('color', '#ff00ff'); // pulse magenta
                    setTimeout(() => { glowObj.setAttribute('color', originalColor); }, 600);
                }
            }
        }
    });
}

// V76 Helper: Shift defensive line via VR Command
function shiftDefensiveLineVR(zOffset) {
    const container = document.getElementById('pitch-container');
    if (!container) return;

    const markers = container.querySelectorAll('a-entity');
    markers.forEach(marker => {
        const textEl = marker.querySelector('a-text');
        if (textEl) {
            const label = textEl.getAttribute('value');
            if (label.includes('CB') || label.includes('LB') || label.includes('RB') || label.includes('LWB') || label.includes('RWB') || label.includes('DEF') || label.includes('P1') || label.includes('P2')) {
                const currentPos = marker.getAttribute('position');
                const newZ = currentPos.z + zOffset;

                // Animation shift
                marker.setAttribute('animation__shift', `property: position; to: ${currentPos.x} ${newZ} ${currentPos.y}; dur: 800; easing: easeOutQuad`);

                // Flare color briefly
                const cyl = marker.querySelector('a-cylinder');
                if (cyl) {
                    cyl.setAttribute('color', '#ff00ff');
                    setTimeout(() => cyl.setAttribute('color', '#00ffff'), 1000);
                }
            }
        }
    });
}

// V76 Helper: Scatter players to simulate "Fangspiel"
function scatterPlayersVR() {
    const container = document.getElementById('pitch-container');
    if (!container) return;

    const markers = container.querySelectorAll('a-entity');
    markers.forEach(marker => {
        const textEl = marker.querySelector('a-text');
        if (textEl && !textEl.getAttribute('value').includes('GOAL')) {
            const currentPos = marker.getAttribute('position');
            // Random scatter bounds approx -1.2 to 1.2 on x, -0.8 to 0.8 on z
            const rX = (Math.random() * 2.4) - 1.2;
            const rZ = (Math.random() * 1.6) - 0.8;
            marker.setAttribute('animation__scatter', `property: position; to: ${rX} ${rZ} ${currentPos.y}; dur: 1500; easing: easeInOutSine`);
        }
    });
}

// Helper: V76 Live Training Plan Update UI
function updateLiveTrainingPlan(title, desc) {
    const planBlock = document.getElementById('ui-live-training-plan');
    if (planBlock) {
        planBlock.innerHTML = `
            <div style="font-weight: bold; color: var(--accent-magenta); margin-bottom: 4px;">ACTIVE: ${title}</div>
            <div style="font-size: 0.7rem; color: #ccc;">${desc}</div>
        `;
    }
}

// V76 Helper: Render a Coaching Zone on the VR pitch
function renderCoachingZoneVR(x, z) {
    const container = document.getElementById('pitch-container');
    if (!container) return;

    // Check if zone exists
    let zone = document.getElementById('coaching-zone');
    if (!zone) {
        zone = document.createElement('a-entity');
        zone.setAttribute('id', 'coaching-zone');

        // Using a flat glowing disk on the ground
        const disk = document.createElement('a-circle');
        disk.setAttribute('radius', '0.4');
        disk.setAttribute('color', '#00ffff');
        disk.setAttribute('opacity', '0.2');
        disk.setAttribute('rotation', '0 0 0'); // Parallel to pitch
        zone.appendChild(disk);

        // Ring border
        const ring = document.createElement('a-ring');
        ring.setAttribute('radius-inner', '0.38');
        ring.setAttribute('radius-outer', '0.4');
        ring.setAttribute('color', '#00ffff');
        zone.appendChild(ring);

        // Label facing the user
        const label = document.createElement('a-text');
        label.setAttribute('value', 'COACH');
        label.setAttribute('color', '#00ffff');
        label.setAttribute('align', 'center');
        label.setAttribute('scale', '0.5 0.5 0.5');
        label.setAttribute('position', '0 0.1 0');
        label.setAttribute('rotation', '90 180 0'); // Stand upright given container rotation
        zone.appendChild(label);

        container.appendChild(zone);
    }

    // Position zone, slight hover above pitch floor to prevent z-fighting
    zone.setAttribute('position', `${x} ${z} 0.01`);

    // Add pulsing animation
    zone.setAttribute('animation__pulse', `property: scale; to: 1.1 1.1 1.1; dir: alternate; loop: true; dur: 1500; easing: easeInOutSine`);
}


// --- V79 DEEP-DIVE MODALS & ROLE INJECTION ENGINE ---

function initDeepDiveModals() {
    const launchers = document.querySelectorAll('.launcher-btn');
    const closeBtns = document.querySelectorAll('.close-modal');
    const tabBtns = document.querySelectorAll('.tab-btn');

    // Open Modals & Inject Persona
    document.querySelectorAll('.launcher-btn[data-target]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetId = e.currentTarget.getAttribute('data-target');
            if (targetId === 'vr-view') return; // Handled separately

            // 1. Hide all deep-dive windows first
            document.querySelectorAll('.deep-dive-window').forEach(mod => {
                mod.classList.add('hidden');
                mod.style.display = 'none';
            });

            // 2. Open the correct modal
            const targetModal = document.getElementById(targetId);
            if (targetModal) {
                targetModal.classList.remove('hidden');
                targetModal.style.display = 'flex';

                // Track modal state internally
                window._activeModal = targetId;
            } else {
                console.warn("Modal not found for target:", targetId);
            }

            // 3. Switch Persona if applicable
            const role = e.currentTarget.getAttribute('data-role');
            if (role) {
                try {
                    switchPersona(role);
                } catch (err) {
                    console.error("Persona Switch Error:", err);
                }
            }
        });
    });

    // Close Modals
    closeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.deep-dive-window');
            if (modal) modal.classList.add('hidden');
        });
    });

    // Close on click outside modal-content
    document.querySelectorAll('.deep-dive-window').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    });

    // Tab Switching Logic
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Find parent modal
            const modal = btn.closest('.deep-dive-window');
            if (!modal) return;

            // Remove active from all tabs inside this modal
            modal.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            modal.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active', 'hidden'));

            // Add active to clicked tab
            btn.classList.add('active');

            // Hide all tab content
            modal.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));

            // Show target
            const tabId = btn.getAttribute('data-tab');
            const targetContent = document.getElementById(tabId);
            if (targetContent) {
                targetContent.classList.remove('hidden');
                targetContent.classList.add('active');

                // VIP Sponsoring Audio Trigger
                if (tabId === 'mgmt-sponsoring') {
                    if (typeof switchPersona === 'function') switchPersona('cfo');
                    setTimeout(() => {
                        if (typeof speakAlert === 'function') speakAlert("Willkommen bei Stark Elite. Lassen Sie uns darüber sprechen, wie wir Ihre Marke zur Nummer 1 im digitalen Fußball-Ökosystem machen.", "cfo");
                    }, 500);
                }
            }
        });
    });

    // V180 Setup
    if (typeof initV180Logic === 'function') initV180Logic();
    if (typeof initSponsoringLogic === 'function') initSponsoringLogic();
}

// --- V180: SPONSORING VIP AREA LOGIC ---
let currentPitchSlide = 0;

function nextPitchSlide() {
    const slidesContainer = document.getElementById('pitch-slides');
    const dots = document.querySelectorAll('.pitch-dot');
    if (!slidesContainer || !dots.length) return;

    currentPitchSlide = (currentPitchSlide + 1) % 3;
    slidesContainer.style.transform = `translateX(-${currentPitchSlide * 100}%)`;

    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentPitchSlide);
        dot.style.background = index === currentPitchSlide ? '#0cf' : '#555';
    });
}

function prevPitchSlide() {
    const slidesContainer = document.getElementById('pitch-slides');
    const dots = document.querySelectorAll('.pitch-dot');
    if (!slidesContainer || !dots.length) return;

    currentPitchSlide = (currentPitchSlide - 1 + 3) % 3;
    slidesContainer.style.transform = `translateX(-${currentPitchSlide * 100}%)`;

    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentPitchSlide);
        dot.style.background = index === currentPitchSlide ? '#0cf' : '#555';
    });
}

function initSponsoringLogic() {
    const roiSlider = document.getElementById('roi-budget-slider');
    const roiVal = document.getElementById('roi-budget-val');
    const assetList = document.getElementById('roi-asset-list');

    if (roiSlider && roiVal && assetList) {
        roiSlider.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            roiVal.textContent = val.toFixed(1);

            let html = ``;
            if (val >= 0.5) {
                html += `<li><span style="color: #0cf;">🥽</span> VR Perimeter Board (Standard)</li>`;
            }
            if (val >= 2.0) {
                html += `<li><span style="color: #d4af37;">📰</span> Logo in Data Grid</li>`;
            }
            if (val >= 5.0) {
                html += `<li><span style="color: #ff4b2b;">🏟️</span> Premium Naming Rights (NLZ Area)</li>`;
            }
            if (val >= 10.0) {
                html += `<li><span style="color: var(--accent-magenta);">🎙️</span> Manager-Toni Audio Briefing Insert (1x/week)</li>`;
            }
            if (val >= 18.0) {
                html += `<li><span style="color: #fff; text-shadow:0 0 5px #fff;">👑</span> Main Jersey Sponsor (All Competitions)</li>`;
            }

            assetList.innerHTML = html;
        });
    }
}

function switchPersona(role) {
    const iconEl = document.getElementById('ai-persona-icon');
    const textEl = document.getElementById('ai-persona-text');
    const avatarEl = document.getElementById('ai-persona-avatar');
    const vrAmbient = document.querySelector('a-light[type="ambient"]');

    // Default: Coach Persona (Kabine & Taktikboard)
    let personaConfig = {
        icon: '👨‍💼',
        name: 'AI STATUS: TRAINER',
        color: '#00ffff',
        greeting: 'System bereit. Gehen wir es an.',
        avatar: 'assets/avatars/toni_trainer.jpg'
    };

    switch (role) {
        case 'cmo':
            personaConfig = {
                icon: '🩺',
                name: 'AI STATUS: CHIEF MEDICAL OFFICER',
                color: '#0088ff', // Deep Blue
                greeting: "Doc hier. Ich synchronisiere die Biometrie-Daten.",
                avatar: 'assets/avatars/toni_arzt.jpg'
            };
            break;
        case 'tactics':
        case 'academy':
            personaConfig = {
                icon: '📋',
                name: 'AI STATUS: TAKTIK ANALYST',
                color: '#00ff00', // Pitch Green
                greeting: "Analyst online. Optimiere Laufwege und Halbräume.",
                avatar: 'assets/avatars/toni_trainer.jpg'
            };
            break;
        case 'management':
        case 'cfo':
            personaConfig = {
                icon: '💼',
                name: 'AI STATUS: MANAGER',
                color: '#ffd700',
                greeting: 'Management aktiv. Wir müssen die Zahlen im Auge behalten.',
                avatar: 'assets/avatars/toni_manager.jpg'
            };
            // Dynamic CFO Briefing if available
            setTimeout(() => {
                if (typeof generateCFOBriefing === 'function') {
                    personaConfig.greeting = generateCFOBriefing();
                    speakAlert(personaConfig.greeting, 'cfo');
                }
            }, 300);
            if (role === 'cfo') setTimeout(initManagementSuite, 100);
            break;
    }

    // Apply UI Updates (Navbar)
    if (avatarEl) {
        avatarEl.src = personaConfig.avatar;
        avatarEl.style.display = 'block';
        if (iconEl) iconEl.style.display = 'none'; // Hide emoji icon
    } else {
        if (iconEl) iconEl.innerText = personaConfig.icon;
    }

    // Apply Physical 2D & VR Avatars (V145 Fade Logic)
    const physMedizin = document.getElementById('avatar-medizin');
    const physManagement = document.getElementById('avatar-management');
    const physVR = document.getElementById('avatar-vr-kabine');

    if (physMedizin) physMedizin.style.opacity = (role === 'cmo') ? '1' : '0';
    if (physManagement) physManagement.style.opacity = (role === 'management' || role === 'cfo') ? '1' : '0';

    if (physVR) {
        if (role !== 'cmo' && role !== 'management' && role !== 'cfo') {
            physVR.emit('fadein');
        } else {
            physVR.emit('fadeout');
        }
    }

    if (textEl) textEl.innerText = personaConfig.name;

    const indicator = document.getElementById('ai-persona-indicator');
    if (indicator) {
        indicator.style.color = personaConfig.color;
        indicator.style.borderColor = personaConfig.color;
        indicator.style.boxShadow = `0 0 10px ${personaConfig.color}40`;
    }

    // VR Atmosphere Shift
    if (vrAmbient && window.vrReady) {
        vrAmbient.setAttribute('color', personaConfig.color);
    }

    // Trigger TTS
    speakAlert(personaConfig.greeting, role);
}

// --- V79 TEXT-TO-SPEECH (TTS) ENGINE ---
let synth = null;
if ('speechSynthesis' in window) {
    synth = window.speechSynthesis;
}

// Voices may not be loaded immediately - wait for them
let ttsVoices = [];
if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = () => {
        ttsVoices = window.speechSynthesis.getVoices();
    };
    ttsVoices = window.speechSynthesis.getVoices();
}

function speakAlert(text, role) {
    if (!synth) return;

    if (synth.speaking) {
        synth.cancel(); // Interrupt previous
    }

    const utterance = new SpeechSynthesisUtterance(text);

    // Try to find a good voice
    const voices = ttsVoices.length ? ttsVoices : synth.getVoices();
    let selectedVoice = voices.find(v => v.lang.includes('en-US') && v.name.includes('Google'))
        || voices.find(v => v.lang.includes('en-US'))
        || voices[0];

    if (selectedVoice) utterance.voice = selectedVoice;

    // German Phonetic Excellence
    if (window.currentLang === 'de' || text.match(/Halbräume|Tiefenlauf|Gegenpressing/i)) {
        let deVoice = voices.find(v => v.lang.includes('de-DE') && (v.name.includes('Premium') || v.name.includes('Enhanced')))
            || voices.find(v => v.lang.includes('de-DE') && v.name.includes('Katja'))
            || voices.find(v => v.lang.includes('de-DE') && v.name.includes('Anna'))
            || voices.find(v => v.lang.includes('de-DE') && v.name.includes('Google'))
            || voices.find(v => v.lang.includes('de-DE'))
            || selectedVoice;
        utterance.voice = deVoice;
        utterance.lang = 'de-DE';

        // Correct phonetic pronunciation of complex terms
        text = text.replace(/Halbräume/gi, "Halb-Räume");
        text = text.replace(/Gegenpressing/gi, "Gegen-Pressing");
        text = text.replace(/Fünf-Meter-Raum/gi, "Fünf-Meter-Raum");
        text = text.replace(/Expected Goals/gi, "Expected Gohls");
        text = text.replace(/Bio-Banding/gi, "Baio-Banding");

        text = text.replace(/,\s/g, ", <mark name=\"pause\"/> ");
    }

    utterance.text = text;

    // V145: TTS-Modulation based on Role Personas
    if (role === 'cmo') {
        // Arzt: Langsames, ruhiges Sprechtempo
        utterance.rate = 0.85;
        utterance.pitch = 0.95;
        utterance.volume = 1.0;
    } else if (role === 'management' || role === 'cfo') {
        // Manager: Tiefere Stimme, bestimmter Tonfall (Hoeneß Duktus)
        utterance.rate = 0.90;
        utterance.pitch = 0.80;
        utterance.volume = 1.0;
    } else {
        // Trainer (Default): Schnelleres Sprechtempo, höhere Dynamik (Klopp Duktus)
        utterance.rate = 1.15;
        utterance.pitch = 1.10;
        utterance.volume = 1.0;
    }

    // Trigger local Lip-Sync Placeholder Backend
    triggerLocalLipSync(text, role);

    synth.speak(utterance);
}

// V145: Local Lip-Sync Placeholder logic
function triggerLocalLipSync(text, role) {
    if (!text) return;

    // In a real local setup, we'd POST to a local endpoint (e.g. Wav2Lip or SadTalker FastAPI)
    // and pipe the returned video frames to our VR/Desktop UI Canvas.
    // Example: fetch('http://localhost:5000/api/lipsync', { method: 'POST', body: JSON.stringify({text, role}) })

    console.log(`[LIP-SYNC EVENT] Instructing local Wav2Lip/SadTalker backend to animate avatar for role: ${role}`);
    console.log(`[LIP-SYNC TEXT] "${text}"`);

    const indicator = document.getElementById('ai-persona-avatar');
    if (indicator) {
        // Simulated talking animation
        indicator.style.transition = 'transform 0.1s';
        let toggle = false;
        const talkInterval = setInterval(() => {
            toggle = !toggle;
            indicator.style.transform = toggle ? 'scale(1.05)' : 'scale(1)';
        }, 150);

        // Stop animation roughly based on text length
        setTimeout(() => {
            clearInterval(talkInterval);
            indicator.style.transform = 'scale(1)';
        }, text.length * 75); // rough duration estimate
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// V79 TASK 3 — MEDIZIN WARNING SYSTEM
// ─────────────────────────────────────────────────────────────────────────────

// Track baseline HRV for drop detection
let baselineHRV = 75;
let activeWarnings = [];

function initMedicalAlerts() {
    const sliderBodyFat = document.getElementById('slider-bodyfat');
    const valBodyFat = document.getElementById('val-bodyfat');
    const sliderHRV = document.getElementById('slider-hrv');
    const valHRV = document.getElementById('val-hrv');
    const sliderRHR = document.getElementById('slider-rhr');
    const valRHR = document.getElementById('val-rhr');
    const btnRTC = document.getElementById('btn-rtc-advance');

    if (btnRTC) {
        let rtcPhase = 3;
        btnRTC.addEventListener('click', () => {
            if (rtcPhase < 5) {
                rtcPhase++;
                const parent = btnRTC.parentElement;
                parent.querySelector('.meter-fill').style.width = `${(rtcPhase / 5) * 100}%`;
                parent.querySelector('span:last-child').textContent = `Phase ${rtcPhase} / 5`;
                const desc = parent.querySelectorAll('div')[2];
                if (rtcPhase === 4) desc.textContent = 'Current phase focus: Full team training, restricted tackling (Joker).';
                if (rtcPhase === 5) desc.textContent = 'Current phase focus: Cleared for full match load.';
                speakAlert(`RTC Protocol advanced to Phase ${rtcPhase}.`, 'cmo');
            }
        });
    }

    if (sliderBodyFat) {
        sliderBodyFat.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            if (valBodyFat) valBodyFat.textContent = val.toFixed(1) + '%';
            checkBodyFatThreshold(val);
            updateHeartbeatMountain(); // Sync terrain if open
        });
    }

    if (sliderHRV) {
        sliderHRV.addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            if (valHRV) valHRV.textContent = val + 'ms';
            checkHRVDrop(val);
            updateHeartbeatMountain(val);
        });
    }

    if (sliderRHR) {
        sliderRHR.addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            if (valRHR) valRHR.textContent = val + ' bpm';
        });
    }

    // V170: Fachmagazin Sleep Trigger
    const sliderSleep = document.getElementById('slider-sleep');
    const valSleep = document.getElementById('val-sleep');
    const btnSleepInfo = document.getElementById('btn-sleep-info');
    const sleepWarning = document.getElementById('sleep-warning');
    let sleepWarningTriggered = false;

    if (sliderSleep) {
        sliderSleep.addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            if (valSleep) valSleep.textContent = val + '%';

            if (val < 60 && !sleepWarningTriggered) {
                sleepWarningTriggered = true;
                if (sleepWarning) sleepWarning.style.display = 'block';
                speakAlert("Coach, wie im Journal analysiert, riskieren wir hier eine Verlangsamung der kognitiven Entscheidungsprozesse um bis zu 15 Prozent.", "cmo");
                switchPersona('cmo');
            } else if (val >= 60) {
                sleepWarningTriggered = false;
                if (sleepWarning) sleepWarning.style.display = 'none';
            }
        });
    }

    if (btnSleepInfo) {
        btnSleepInfo.addEventListener('click', () => {
            // Close all modals
            document.querySelectorAll('.deep-dive-window').forEach(mod => {
                mod.classList.add('hidden');
                mod.style.display = 'none';
            });
            // Open Media Hub
            const mediaModal = document.getElementById('modal-media');
            if (mediaModal) {
                mediaModal.classList.remove('hidden');
                mediaModal.style.display = 'flex';

                // Click the Fachmagazin Tab
                const mediaContentTab = document.querySelector('.tab-btn[data-tab="media-content"]');
                if (mediaContentTab) mediaContentTab.click();

                // Specific persona adjustment for Media Hub based on context, optional.
                switchPersona('manager');

                // Scroll to article
                setTimeout(() => {
                    const article = document.getElementById('article-medical');
                    if (article) article.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 400);
            }
        });
    }

    // Simulate live pulse fluctuation
    setInterval(() => {
        const pulseEl = document.getElementById('live-pulse');
        if (pulseEl) {
            const basePulse = 130 + Math.floor(Math.random() * 20);
            pulseEl.textContent = basePulse + ' bpm';
            // Flash green if healthy range, red if too high
            pulseEl.style.color = basePulse > 175 ? '#ff4b2b' : '#00ff00';
        }
    }, 3000);
}

function checkBodyFatThreshold(value) {
    const threshold = 10.5;
    if (value > threshold) {
        triggerWarning(
            'BODY_FAT',
            `⚠ ALERT: Body Fat at ${value.toFixed(1)}% — exceeds elite threshold of ${threshold}%.`,
            `WARNING: Player body composition requires immediate nutritional intervention. Body fat at ${value.toFixed(1)} percent. Schedule dietary review.`
        );
    } else {
        clearWarning('BODY_FAT');
    }
}

function checkHRVDrop(currentHRV) {
    const dropPercent = ((baselineHRV - currentHRV) / baselineHRV) * 100;
    if (dropPercent >= 20) {
        triggerWarning(
            'HRV_DROP',
            `⚠ ALERT: HRV dropped ${dropPercent.toFixed(0)}% from baseline — risk of overtraining.`,
            `CRITICAL ALERT: Red Zone detected. Heart rate variability dropped by ${dropPercent.toFixed(0)} percent. Überbelastung risk is imminent. Immediate Load Management protocol required.`
        );
    } else {
        clearWarning('HRV_DROP');
    }
}

function triggerWarning(key, uiMessage, voiceMessage) {
    // Avoid duplicate warnings
    if (activeWarnings.includes(key)) return;
    activeWarnings.push(key);

    // 1. Log to transcription
    const log = document.getElementById('log-transcription');
    if (log) {
        const span = document.createElement('span');
        span.textContent = uiMessage;
        span.style.color = '#ff4b2b';
        span.style.fontWeight = 'bold';
        log.appendChild(span);
        log.scrollTop = log.scrollHeight;
    }

    // 2. Pulse-warning on ALL 2D FIFA cards
    document.querySelectorAll('.fifa-card').forEach(card => {
        card.classList.add('pulse-warning');
    });

    // 3. VR atmosphere shift to danger red
    const ambient = document.querySelector('a-light[type="ambient"]');
    if (ambient && window.vrReady) {
        ambient.setAttribute('color', '#ff2200');
        ambient.setAttribute('intensity', '0.7');
    }

    // 4. VR HUD warning
    const hudLog = document.getElementById('vr-hud-log-1');
    if (hudLog) {
        hudLog.setAttribute('value', '⚠ MEDIZIN ALERT ACTIVE');
        hudLog.setAttribute('color', '#ff4b2b');
    }

    // 5. TTS Voice Alert
    speakAlert(voiceMessage, 'warning');

    console.warn(`[V79 MEDIZIN] ${key}: ${uiMessage}`);
}

function clearWarning(key) {
    activeWarnings = activeWarnings.filter(w => w !== key);

    if (activeWarnings.length === 0) {
        // Remove pulse from all cards
        document.querySelectorAll('.fifa-card').forEach(card => {
            card.classList.remove('pulse-warning');
        });
        // Restore ambient
        const ambient = document.querySelector('a-light[type="ambient"]');
        if (ambient && window.vrReady) {
            ambient.setAttribute('color', '#ffffff');
            ambient.setAttribute('intensity', '0.5');
        }
        const hudLog = document.getElementById('vr-hud-log-1');
        if (hudLog) {
            hudLog.setAttribute('value', '> SYSTEM NOMINAL');
            hudLog.setAttribute('color', '#00ff00');
        }
    }
}

// "Status summarize" voice command
function handleStatusSummarize() {
    const warnings = activeWarnings.length;
    let summary;

    if (warnings === 0) {
        summary = "Status report: All biometric indicators nominal. Squad fitness optimal. No medical flags active.";
    } else {
        const warnList = activeWarnings.join(' and ').replace('BODY_FAT', 'elevated body fat').replace('HRV_DROP', 'HRV drop');
        summary = `Status report: ${warnings} medical alert${warnings > 1 ? 's' : ''} active. Issues detected: ${warnList}. Immediate review recommended.`;
    }

    speakAlert(summary, 'cmo');

    const log = document.getElementById('log-transcription');
    if (log) {
        const span = document.createElement('span');
        span.textContent = `> CMO: ${summary}`;
        span.style.color = '#0088ff';
        log.appendChild(span);
        log.scrollTop = log.scrollHeight;
    }
}

// Patch the voice-command engine to recognize STATUS
const _origBtnSendClick = null; // will be patched via DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    // Slight delay to let initManagementSync wire up the btn first
    setTimeout(() => {
        const btnSend = document.getElementById('btn-send-cmd');
        const inputCmd = document.getElementById('input-voice-cmd');
        if (btnSend && inputCmd) {
            btnSend.addEventListener('click', () => {
                const cmd = inputCmd.value.trim().toUpperCase();
                if (cmd.includes('STATUS') || cmd.includes('ZUSAMMENFASSUNG') || cmd.includes('SUMMARY')) {
                    handleStatusSummarize();
                }
            }, true); // capture phase so it runs before existing handler
        }
        // Boot medical alert listeners
        initMedicalAlerts();
        // Boot VR procedural visuals (after a small delay to ensure VR is ready)
        setTimeout(initInfiniteDataHorizon, 2000);
    }, 100);
});


// ─────────────────────────────────────────────────────────────────────────────
// V79 TASK 4 — VR INFINITY & HEARTBEAT MOUNTAINS
// ─────────────────────────────────────────────────────────────────────────────

// Heartbeat Mountain: morph VR terrain based on HRV slider
function updateHeartbeatMountain(hrv) {
    const terrain = document.getElementById('heartbeat-terrain');
    if (!terrain || !window.vrReady) return;

    // hrv: 20 (low/stressed) → 100 (excellent)
    // Low HRV = jagged, high peaks. High HRV = gentle, calm waves.
    const hrvVal = hrv !== undefined ? hrv : parseInt(document.getElementById('slider-hrv')?.value || 75);

    // Map HRV to emissive intensity: higher HRV = softer glow
    const emissiveIntensity = 0.1 + ((100 - hrvVal) / 100) * 0.5; // 0.1 → 0.6
    const color = hrvVal < 50 ? '#ff2200' : hrvVal < 70 ? '#ff8800' : '#00ffff';

    terrain.setAttribute('material', `color: #050a0f; wireframe: true; emissive: ${color}; emissiveIntensity: ${emissiveIntensity.toFixed(2)}`);

    // Animate scale Y to simulate mountain height (higher = lower HRV = more stressed)
    const scaleY = 1 + ((100 - hrvVal) / 100) * 3; // 1 → 4
    terrain.setAttribute('animation__hrv', `property: scale; to: 1 ${scaleY.toFixed(2)} 1; dur: 1500; easing: easeInOutSine`);

    // Also update position.y to lift terrain for drama when stressed
    const yPos = -5 + ((100 - hrvVal) / 100) * 2;
    terrain.setAttribute('animation__pos', `property: position; to: 0 ${yPos.toFixed(2)} -40; dur: 1500; easing: easeInOutSine`);
}

// Continuous pulsing animation on the terrain for "alive" effect
function startHeartbeatPulse() {
    const terrain = document.getElementById('heartbeat-terrain');
    if (!terrain) return;

    // Rotate terrain slowly for immersive effect
    terrain.setAttribute('animation__rotate', `property: rotation; from: -90 0 0; to: -90 360 0; dur: 120000; loop: true; easing: linear`);
}

// Infinite Data Horizon: Ascending neon columns behind the scene
function initInfiniteDataHorizon() {
    const container = document.getElementById('infinite-data-horizon');
    if (!container) return;

    // Remove placeholder children
    while (container.firstChild) container.removeChild(container.firstChild);

    // Generate 30 ascending data columns spread across the horizon
    const cols = 30;
    for (let i = 0; i < cols; i++) {
        const col = document.createElement('a-box');
        const xPos = (Math.random() * 200) - 100;
        const zPos = (Math.random() * 60) - 30;
        const width = 0.3 + Math.random() * 0.7;
        const baseHeight = 1 + Math.random() * 8;
        const targetHeight = baseHeight * (2 + Math.random() * 4);
        const delay = Math.floor(Math.random() * 3000);
        const dur = 2000 + Math.floor(Math.random() * 4000);

        // Color cycle: cyan, magenta, green
        const colors = ['#00ffff', '#ff00ff', '#00ff88', '#0088ff'];
        const color = colors[Math.floor(Math.random() * colors.length)];

        col.setAttribute('width', width.toFixed(2));
        col.setAttribute('height', baseHeight.toFixed(2));
        col.setAttribute('depth', width.toFixed(2));
        col.setAttribute('position', `${xPos.toFixed(1)} 0 ${zPos.toFixed(1)}`);
        col.setAttribute('material', `color: ${color}; wireframe: true; opacity: 0.6; transparent: true`);

        // Rising animation (infinite loop)
        col.setAttribute('animation__rise', `property: scale; from: 1 0 1; to: 1 ${(targetHeight / baseHeight).toFixed(1)} 1; dur: ${dur}; delay: ${delay}; dir: alternate; loop: true; easing: easeInOutSine`);

        // Slow opacity pulse
        col.setAttribute('animation__pulse', `property: material.opacity; from: 0.2; to: 0.7; dur: ${Math.floor(dur * 0.7)}; delay: ${delay}; dir: alternate; loop: true; easing: easeInOutSine`);

        container.appendChild(col);
    }

    // Start heartbeat terrain pulse
    startHeartbeatPulse();

    console.log('[V79] Infinite Data Horizon initialized with', cols, 'columns');
}

// Ensure VR scene handles WebGL context creation cleanly (prevents Black Screen)
function ensureVRScene() {
    const scene = document.querySelector('a-scene');
    if (!scene) return;

    // Explicitly set renderer configuration if VR was inactive/asleep
    if (!scene.hasLoaded) {
        scene.setAttribute('renderer', 'antialias: true; colorManagement: true; sortObjects: true; physicallyCorrectLights: true; maxCanvasWidth: 1920; maxCanvasHeight: 1920;');
    } else {
        // Trigger resize and re-render if it's already loaded to fix blank canvas
        scene.resize();
        if (scene.camera) scene.camera.updateProjectionMatrix();
    }
}

// Link ensureVRScene to the VR enter button in the UI
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.management-col .cyber-btn[data-target="vr-view"], #btn-vr-access').forEach(btn => {
        btn.addEventListener('click', () => {
            ensureVRScene();
        });
    });
});


// ─────────────────────────────────────────────────────────────────────────────
// V79 TASK 5 — FUNINO RESCALING LOGIC
// ─────────────────────────────────────────────────────────────────────────────

// Automatic Funino pitch rescaling based on player count (4-16 players)
function autoRescaleFunino(playerCount) {
    // DFB standard: smaller field for fewer players
    // Reference: 4 players → ~24x16m; 8 players → ~40x25m; 16 → ~60x40m
    const scaleMap = { 4: 0.5, 6: 0.65, 8: 0.8, 10: 0.9, 12: 1.0, 16: 1.2 };
    const closestKey = Object.keys(scaleMap).reduce((prev, curr) =>
        Math.abs(curr - playerCount) < Math.abs(prev - playerCount) ? curr : prev
    );
    const scale = scaleMap[closestKey];

    // Apply to VR pitch container
    const pitchBoard = document.getElementById('vr-pitch-board');
    if (pitchBoard && window.vrReady) {
        pitchBoard.setAttribute('animation__scale', `property: scale; to: ${scale} ${scale} ${scale}; dur: 1000; easing: easeOutElastic`);
    }

    // Re-render VR formation at new implicit scale (renderTacticsVR already uses scale var internally)
    // We'll physically scale the holograms within the pitch container too
    const pitchContainer = document.getElementById('pitch-container');
    if (pitchContainer) {
        pitchContainer.setAttribute('animation__scale', `property: scale; to: ${scale} ${scale} ${scale}; dur: 1000; easing: easeOutElastic`);
    }

    // Update 2D pitch—scale the pitch container
    const pitch2d = document.getElementById('pitch-2d');
    if (pitch2d) {
        pitch2d.style.transition = 'all 0.8s ease';
        // Shrink pitch visually for small groups
        const sizePercent = Math.round(scale * 100);
        pitch2d.style.transform = `scale(${scale})`;
    }

    logAIResponse(`FUNINO RESCALE: Pitch adjusted for ~${playerCount} players (scale factor: ${scale}).`);
    if (synth) speakAlert(`Field adjusted for ${playerCount} players. Ratio optimized per DFB standard.`, 'academy');
}

// Wire up rescaling to voice command
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const inputCmd = document.getElementById('input-voice-cmd');
        const btnSend = document.getElementById('btn-send-cmd');
        if (btnSend && inputCmd) {
            btnSend.addEventListener('click', () => {
                const cmd = inputCmd.value.trim().toUpperCase();
                // e.g. "FUNINO 8 SPIELER" or "SCALE 6"
                const match = cmd.match(/(\d+)\s*(SPIELER|PLAYER|KINDER)?/);
                if (match && (cmd.includes('FUNINO') || cmd.includes('RESCALE') || cmd.includes('SPIELER'))) {
                    const count = parseInt(match[1]);
                    if (count >= 2 && count <= 20) {
                        autoRescaleFunino(count);
                    }
                }
            });
        }
    }, 200);
});


// ─────────────────────────────────────────────────────────────────────────────
// V79 TASK 6 — FIFA CARD REVOLUTION
// ─────────────────────────────────────────────────────────────────────────────

// --- 6A: Card Flip Trigger ---
// Inject flip class on right-click / long-press for the Mental-State-Matrix back
function initCardFlip() {
    document.addEventListener('contextmenu', (e) => {
        const card = e.target.closest('.fifa-card');
        if (card) {
            e.preventDefault();
            card.classList.toggle('flipped');
        }
    });

    // Mobile/tablet long-press support
    let longPressTimer;
    document.addEventListener('touchstart', (e) => {
        const card = e.target.closest('.fifa-card');
        if (card) {
            longPressTimer = setTimeout(() => card.classList.toggle('flipped'), 600);
        }
    });
    document.addEventListener('touchend', () => clearTimeout(longPressTimer));
}

// --- 6B: 100+ Variable OVR Ripple Effect ---
// Extended hidden variables that subtly alter OVR when primary stats change
const hiddenVariables = {
    mentality: 75, // 0-100 mental strength
    consistency: 80, // 0-100 match-to-match consistency
    leadership: 60, // 0-100 captain influence
    adaptability: 70, // 0-100 tactical flexibility
    injuryRisk: 15, // 0-100 (low = better, inverted)
    pressurePerf: 82, // big-game performance
    aerialDuel: 65,
    sprintRecovery: 78,
    decisionSpeed: 72,
    teamChemistry: 88,
};

function calculateExtendedOVR(baseOVR, playerId) {
    const player = squadData.find(p => p.id === playerId);
    if (!player) return baseOVR;

    // Apply hidden variable ripple — small ±1-3 OVR tweaks
    const mentalBonus = (hiddenVariables.mentality - 50) * 0.03;
    const consistBonus = (hiddenVariables.consistency - 50) * 0.02;
    const leaderBonus = player.stats.workRate.includes('High') ? 1.5 : 0;
    const adaptBonus = (hiddenVariables.adaptability - 50) * 0.01;
    const injuryPenalty = -(hiddenVariables.injuryRisk * 0.02);
    const pressureBonus = (hiddenVariables.pressurePerf - 50) * 0.02;
    const chemBonus = (hiddenVariables.teamChemistry - 60) * 0.015;
    const decisionBonus = (hiddenVariables.decisionSpeed - 50) * 0.01;

    const ripple = mentalBonus + consistBonus + leaderBonus + adaptBonus +
        injuryPenalty + pressureBonus + chemBonus + decisionBonus;

    const extendedOVR = Math.min(99, Math.max(1, Math.round(baseOVR + ripple)));

    // Visual feedback: show ripple delta in editor if open
    const ovrEl = document.getElementById('editor-live-ovr');
    if (ovrEl && ovrEl.offsetParent !== null) { // visible
        const deltaEl = document.getElementById('ovr-ripple-delta') || (() => {
            const d = document.createElement('div');
            d.id = 'ovr-ripple-delta';
            d.style.cssText = 'font-size:0.75rem;color:#ff00ff;margin-top:4px;font-family:var(--font-mono);text-align:center;';
            ovrEl.parentNode.appendChild(d);
            return d;
        })();
        const delta = extendedOVR - baseOVR;
        deltaEl.textContent = delta >= 0 ? `+${delta.toFixed(1)} INTANGIBLES` : `${delta.toFixed(1)} INTANGIBLES`;
        deltaEl.style.color = delta >= 0 ? '#00ffff' : '#ff4b2b';
    }

    return extendedOVR;
}

// Hook into existing calculateLiveOVR to add ripple
const _originalCalcOVR = window.calculateLiveOVR || null;
// Patch: after base OVR is computed, run ripple. We override the display update.
const _origOpenEditor = window.openPlayerEditor || null;

// Wrap calculateLiveOVR to add ripple on top
(function patchOVRCalculation() {
    // Override calculateLiveOVR with ripple-aware version
    window.calculateLiveOVRAugmented = function (id, container, context) {
        // Call original via direct re-implementation (since we can't easily wrap)
        calculateLiveOVR(id, container, context);

        // Then apply ripple to whatever was computed
        setTimeout(() => {
            const ovrEl = document.getElementById('editor-live-ovr');
            if (ovrEl) {
                const baseOVR = parseInt(ovrEl.innerText) || 70;
                const extended = calculateExtendedOVR(baseOVR, id);
                ovrEl.innerText = extended;
            }
        }, 50);
    };
})();


// --- 6C: VR Hover Aura (Holographic Medical Aura) ---
function initVRHoverAura() {
    if (!window.vrReady) {
        // Retry after VR scene loads
        document.querySelector('a-scene')?.addEventListener('loaded', initVRHoverAura);
        return;
    }

    // Listen for mouseenter/mouseleave on ALL interactable VR hologram entities
    function attachAura(container) {
        const markers = container.querySelectorAll('a-entity');
        markers.forEach(marker => {
            if (marker.hasAttribute('data-aura-init')) return;
            marker.setAttribute('data-aura-init', 'true');
            marker.setAttribute('class', (marker.getAttribute('class') || '') + ' interactable');

            marker.addEventListener('mouseenter', () => {
                showVRHoverAura(marker);
            });
            marker.addEventListener('mouseleave', () => {
                hideVRHoverAura(marker);
            });
        });
    }

    // Attach to pitch container markers
    const pitchContainer = document.getElementById('pitch-container');
    if (pitchContainer) {
        attachAura(pitchContainer);

        // Re-attach after every formation change
        const observer = new MutationObserver(() => attachAura(pitchContainer));
        observer.observe(pitchContainer, { childList: true, subtree: false });
    }
}

function showVRHoverAura(markerEl) {
    // Don't create duplicate auras
    if (markerEl.querySelector('.vr-aura')) return;

    // Determine player from text label
    const textEl = markerEl.querySelector('a-text');
    const label = textEl ? textEl.getAttribute('value') : 'PLAYER';

    // Find matching player stats
    const player = squadData.find(p => p.pos === label || p.name === label);
    const hrv = document.getElementById('slider-hrv')?.value || 75;
    const pulse = document.getElementById('live-pulse')?.textContent || '135 bpm';

    // Create aura ring
    const aura = document.createElement('a-entity');
    aura.setAttribute('class', 'vr-aura');
    aura.setAttribute('position', '0 0.6 0');

    const ring = document.createElement('a-ring');
    ring.setAttribute('radius-inner', '0.18');
    ring.setAttribute('radius-outer', '0.22');
    ring.setAttribute('color', '#ff4b2b');
    ring.setAttribute('opacity', '0.7');
    ring.setAttribute('rotation', '0 0 0');
    ring.setAttribute('animation', `property: rotation; to: 0 0 360; dur: 1500; loop: true; easing: linear`);
    aura.appendChild(ring);

    // Outer pulsing ring
    const outerRing = document.createElement('a-ring');
    outerRing.setAttribute('radius-inner', '0.25');
    outerRing.setAttribute('radius-outer', '0.27');
    outerRing.setAttribute('color', '#00ffff');
    outerRing.setAttribute('opacity', '0.4');
    outerRing.setAttribute('animation', `property: scale; from: 1 1 1; to: 1.3 1.3 1.3; dur: 800; dir: alternate; loop: true; easing: easeInOutSine`);
    aura.appendChild(outerRing);

    // Bio data panel
    const panel = document.createElement('a-plane');
    panel.setAttribute('width', '0.7');
    panel.setAttribute('height', '0.35');
    panel.setAttribute('position', '0 0.5 0');
    panel.setAttribute('material', 'color: #050a0f; opacity: 0.85; transparent: true');
    aura.appendChild(panel);

    const statsLine1 = document.createElement('a-text');
    statsLine1.setAttribute('value', `HRV: ${hrv}ms  PULSE: ${pulse}`);
    statsLine1.setAttribute('position', '0 0.6 0.01');
    statsLine1.setAttribute('align', 'center');
    statsLine1.setAttribute('color', '#00ffff');
    statsLine1.setAttribute('width', '1.5');
    statsLine1.setAttribute('scale', '0.5 0.5 0.5');
    aura.appendChild(statsLine1);

    const statsLine2 = document.createElement('a-text');
    const fitness = player ? `OVR:${player.ovr} WF:${player.stats.weakFoot}★` : `POS: ${label}`;
    statsLine2.setAttribute('value', fitness);
    statsLine2.setAttribute('position', '0 0.48 0.01');
    statsLine2.setAttribute('align', 'center');
    statsLine2.setAttribute('color', '#ff00ff');
    statsLine2.setAttribute('width', '1.5');
    statsLine2.setAttribute('scale', '0.5 0.5 0.5');
    aura.appendChild(statsLine2);

    markerEl.appendChild(aura);
}

function hideVRHoverAura(markerEl) {
    const aura = markerEl.querySelector('.vr-aura');
    if (aura) aura.parentNode.removeChild(aura);
}

// VR Aura init is deferred until VR is ready
function logAIResponse(msg) {
    const log = document.getElementById('log-transcription');
    if (log) {
        const span = document.createElement('span');
        span.textContent = `> AI: ${msg}`;
        span.style.color = 'var(--accent-cyan)';
        log.appendChild(span);
        log.scrollTop = log.scrollHeight;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// V79 BOOT — Chain all new systems into init flow
// ─────────────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    // Card flip support
    initCardFlip();

    // When VR is ready, attach hover aura system & start heartbeat
    const scene = document.querySelector('a-scene');
    if (scene) {
        const setupVR79 = () => {
            initVRHoverAura();
            // Initial heartbeat mountain sync
            updateHeartbeatMountain(75);
            // Boot Infinite Data Horizon columns
            setTimeout(initInfiniteDataHorizon, 500);
        };
        if (scene.hasLoaded) {
            setupVR79();
        } else {
            scene.addEventListener('loaded', setupVR79);
        }
    }
});


// ═════════════════════════════════════════════════════════════════════════════
// V83 — CFO MANAGEMENT_OS: CHIEF FINANZEN OFFICER ARCHITECTURE
// ═════════════════════════════════════════════════════════════════════════════

// ── Shared Database (single source of truth, 2D ↔ VR) ──
const cfoDB = {
    budget: 24.5,
    revenue: 42.0,
    expenses: 17.5,
    transferBudget: 8.5,
    nlzBudget: 2.8,
    sponsorSleeve: 'Qatar Airways',
    sponsorCrypto: 'Binance',
    infraAnalysis: 80,
    infraNLZ: 65,
    contracts: [
        { name: 'Jersey Sponsorship', partner: 'Qatar Airways', value: '18M€/yr', expiryDays: 90, type: 'SPONSOR' },
        { name: 'Sleeve — Crypto', partner: 'Binance', value: '6M€/yr', expiryDays: 85, type: 'SPONSOR' },
        { name: 'Stadium Naming', partner: 'Allianz AG', value: '12M€/yr', expiryDays: 365, type: 'VENUE' },
        { name: 'Transfer Agent', partner: 'ICM Stellar', value: '0.5M€', expiryDays: 200, type: 'AGENT' },
        { name: 'NLZ Head Coach', partner: 'FC Internal', value: '0.8M€/yr', expiryDays: 145, type: 'STAFF' },
    ]
};

function initManagementSuite() {
    // Guard: only init once
    if (window._cfoSuiteInitialized) return;
    window._cfoSuiteInitialized = true;

    // ── P&L Live Sync ──────────────────────────────────────────────────────
    const inpRevenue = document.getElementById('input-revenue');
    const inpExpenses = document.getElementById('input-expenses');
    const inpBudget = document.getElementById('input-budget');
    const inpTransfer = document.getElementById('input-transfer-budget');
    const inpNLZBudget = document.getElementById('input-nlz-budget');

    function updatePL() {
        const rev = parseFloat(inpRevenue?.value) || cfoDB.revenue;
        const exp = parseFloat(inpExpenses?.value) || cfoDB.expenses;
        const profit = rev - exp;

        cfoDB.revenue = rev;
        cfoDB.expenses = exp;
        cfoDB.budget = parseFloat(inpBudget?.value) || cfoDB.budget;
        cfoDB.transferBudget = parseFloat(inpTransfer?.value) || cfoDB.transferBudget;
        cfoDB.nlzBudget = parseFloat(inpNLZBudget?.value) || cfoDB.nlzBudget;

        // Update P&L bars (max scale ~50M€)
        const maxRef = 50;
        const revBar = document.getElementById('pl-revenue-bar');
        const expBar = document.getElementById('pl-expenses-bar');
        const profBar = document.getElementById('pl-profit-bar');
        const profVal = document.getElementById('val-net-profit');

        if (revBar) revBar.style.width = Math.min(100, (rev / maxRef) * 100).toFixed(0) + '%';
        if (expBar) expBar.style.width = Math.min(100, (exp / maxRef) * 100).toFixed(0) + '%';
        if (profBar) profBar.style.width = Math.max(0, Math.min(100, (Math.abs(profit) / maxRef) * 100)).toFixed(0) + '%';
        if (profBar) profBar.style.background = profit >= 0
            ? 'linear-gradient(90deg, #ffd700, #00ffff)'
            : 'linear-gradient(90deg, #ff4b2b, #ff0000)';
        if (profVal) {
            profVal.textContent = profit.toFixed(1);
            profVal.style.color = profit >= 0 ? '#ffd700' : '#ff4b2b';
        }

        syncCFOtoVR();
        checkCFOAlerts();
    }

    [inpRevenue, inpExpenses, inpBudget, inpTransfer, inpNLZBudget].forEach(el => {
        if (el) el.addEventListener('input', updatePL);
    });

    // ── Sponsoring Inputs Sync ─────────────────────────────────────────────
    const inpSleeve = document.getElementById('input-sponsor-sleeve');
    const inpCrypto = document.getElementById('input-sponsor-crypto');
    const vrSleeve = document.getElementById('vr-sponsor-sleeve');
    const vrCrypto = document.getElementById('vr-sponsor-crypto');

    if (inpSleeve) inpSleeve.addEventListener('input', (e) => {
        cfoDB.sponsorSleeve = e.target.value;
        if (vrSleeve) vrSleeve.setAttribute('value', e.target.value);
        syncCFOtoVR();
    });
    if (inpCrypto) inpCrypto.addEventListener('input', (e) => {
        cfoDB.sponsorCrypto = e.target.value;
        if (vrCrypto) vrCrypto.setAttribute('value', e.target.value);
        syncCFOtoVR();
    });

    // ── Infrastructure Sliders ─────────────────────────────────────────────
    const inpAnalysis = document.getElementById('input-infra-analysis');
    const inpNLZ = document.getElementById('input-infra-nlz');

    if (inpAnalysis) {
        inpAnalysis.addEventListener('input', (e) => {
            const v = parseInt(e.target.value);
            cfoDB.infraAnalysis = v;
            const bar = document.getElementById('bar-infra-analysis');
            const val = document.getElementById('val-infra-analysis');
            if (bar) bar.style.width = v + '%';
            if (val) val.textContent = v + '%';
            const vrEl = document.getElementById('vr-nlz-analysis');
            if (vrEl) vrEl.setAttribute('value', `ANALYSIS CTR: ${v}% complete`);
        });
    }
    if (inpNLZ) {
        inpNLZ.addEventListener('input', (e) => {
            const v = parseInt(e.target.value);
            cfoDB.infraNLZ = v;
            const bar = document.getElementById('bar-infra-nlz');
            const val = document.getElementById('val-infra-nlz');
            if (bar) bar.style.width = v + '%';
            if (val) val.textContent = v + '%';
            const vrEl = document.getElementById('vr-nlz-expansion');
            if (vrEl) vrEl.setAttribute('value', `NLZ EXPANSION: ${v}% complete`);
        });
    }

    // ── Contracts Table Render ─────────────────────────────────────────────
    renderContractsTable();

    // ── CFO Brief Button ──────────────────────────────────────────────────
    const btnBrief = document.getElementById('btn-cfo-brief-now');
    if (btnBrief) {
        btnBrief.addEventListener('click', () => {
            const briefing = generateCFOBriefing();
            speakAlert(briefing, 'cfo');
            logCFOMessage(briefing);
        });
    }

    // ── Auto-scan every 60 seconds ─────────────────────────────────────────
    setInterval(checkCFOAlerts, 60000);

    // Initial sync
    syncCFOtoVR();
    checkCFOAlerts();

    console.log('[V83] CFO Management Suite initialized.');
}

function renderContractsTable() {
    const tbody = document.getElementById('contracts-table-body');
    if (!tbody) return;

    const warningThreshold = 91;
    let warningCount = 0;

    tbody.innerHTML = '';
    cfoDB.contracts.forEach((contract, idx) => {
        const isExpiring = contract.expiryDays < warningThreshold;
        if (isExpiring) warningCount++;

        const statusColor = isExpiring ? '#ff4b2b' : (contract.expiryDays < 200 ? '#ffd700' : '#00ff88');
        const statusLabel = isExpiring ? '⚠ EXPIRING' : '✓ ACTIVE';
        const rowBg = isExpiring ? 'rgba(255,75,43,0.06)' : 'transparent';

        const row = document.createElement('tr');
        row.style.background = rowBg;
        row.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
        row.innerHTML = `
            <td style="padding: 7px 8px; color: #ccc;">${contract.name}</td>
            <td style="padding: 7px 8px; color: #fff; font-weight: 600;">${contract.partner}</td>
            <td style="padding: 7px 8px; color: #ffd700; font-family: var(--font-heading);">${contract.value}</td>
            <td style="padding: 7px 8px;">
                <span style="color: ${statusColor}; font-family: var(--font-heading); font-size: 0.8rem;">${contract.expiryDays}d</span>
            </td>
            <td style="padding: 7px 8px;">
                <span style="color: ${statusColor}; font-size: 0.7rem; font-weight: bold; padding: 2px 6px; border: 1px solid ${statusColor}; border-radius: 10px;">${statusLabel}</span>
            </td>
            <td style="padding: 7px 8px;">
                <button class="cyber-btn" onclick="openContractRenewal(${idx})" style="font-size: 0.6rem; padding: 2px 6px; border-color: #ffd700; color: #ffd700;">RENEW</button>
            </td>
        `;
        tbody.appendChild(row);
    });

    // Update warning badge
    const badge = document.getElementById('cfo-alert-badge');
    const countEl = document.getElementById('legal-expiry-count');
    if (warningCount > 0) {
        if (badge) badge.style.display = 'inline-block';
        if (countEl) countEl.textContent = `— ${warningCount} EXPIRING WITHIN 91 DAYS`;
    } else {
        if (badge) badge.style.display = 'none';
        if (countEl) countEl.textContent = '';
    }
}

function openContractRenewal(contractIdx) {
    const contract = cfoDB.contracts[contractIdx];
    if (!contract) return;
    // Extend by 365 days
    contract.expiryDays += 365;
    renderContractsTable();
    syncCFOtoVR();
    const msg = `Contract renewed: ${contract.partner} extended by 1 year. New expiry in ${contract.expiryDays} days.`;
    logCFOMessage(msg);
    speakAlert(msg, 'cfo');
}

function syncCFOtoVR() {
    if (!window.vrReady) return;

    const profit = (cfoDB.revenue - cfoDB.expenses).toFixed(1);

    // Screen 1: Financial Ticker
    const setVR = (id, val) => { const el = document.getElementById(id); if (el) el.setAttribute('value', val); };

    setVR('vr-fin-budget', `BUDGET:  ${cfoDB.budget.toFixed(1)} M€`);
    setVR('vr-fin-revenue', `REVENUE: ${cfoDB.revenue.toFixed(1)} M€`);
    setVR('vr-fin-expenses', `EXPNSES: ${cfoDB.expenses.toFixed(1)} M€`);
    setVR('vr-fin-profit', `NET P/L: ${profit >= 0 ? '+' : ''}${profit} M€`);
    setVR('vr-fin-sponsor1', `SPONSOR: ${cfoDB.sponsorSleeve}`);
    setVR('vr-fin-sponsor2', `CRYPTO:  ${cfoDB.sponsorCrypto}`);

    // Screen 3: Academy Pipeline
    setVR('vr-nlz-analysis', `ANALYSIS CTR: ${cfoDB.infraAnalysis}% complete`);
    setVR('vr-nlz-expansion', `NLZ EXPANSION: ${cfoDB.infraNLZ}% complete`);

    // Screen 4: Contracts
    const expiring = cfoDB.contracts.filter(c => c.expiryDays < 91);
    cfoDB.contracts.forEach((c, i) => {
        const vrId = `vr-contract-${i + 1}`;
        const isExp = c.expiryDays < 91;
        const color = isExp ? '#ff4b2b' : (c.expiryDays < 200 ? '#ffd700' : '#00ff88');
        const el = document.getElementById(vrId);
        if (el) {
            el.setAttribute('value', `► ${c.partner.padEnd(16)} ${c.expiryDays}d ${isExp ? 'EXPIRES' : 'OK'}`);
            el.setAttribute('color', color);
        }
    });
    const alertEl = document.getElementById('vr-contract-alert');
    if (alertEl) {
        alertEl.setAttribute('value', expiring.length > 0
            ? `${expiring.length} EXPIRING SOON`
            : 'ALL CONTRACTS OK');
        alertEl.setAttribute('color', expiring.length > 0 ? '#ff4b2b' : '#00ff88');
    }

    // Screen 2: Media hub stats (use existing media sync element values)
    const headlineEl = document.getElementById('vr-media-hub-headline');
    const headlineInput = document.getElementById('input-media-headline');
    if (headlineEl && headlineInput) {
        headlineEl.setAttribute('value', 'HEADLINE: ' + headlineInput.value);
    }
}

function checkCFOAlerts() {
    const expiringContracts = cfoDB.contracts.filter(c => c.expiryDays < 91);
    const budgetLow = cfoDB.budget < 10;

    if (expiringContracts.length > 0 || budgetLow) {
        const badge = document.getElementById('cfo-alert-badge');
        if (badge) badge.style.display = 'inline-block';
    }
}

function generateCFOBriefing() {
    const profit = (cfoDB.revenue - cfoDB.expenses).toFixed(1);
    const expiring = cfoDB.contracts.filter(c => c.expiryDays < 91);
    const budgetLow = cfoDB.budget < 10;

    let briefing = `CFO report: Current net profit is ${profit} million euros. Budget available: ${cfoDB.budget} million. `;

    if (expiring.length > 0) {
        const names = expiring.map(c => c.partner).join(' and ');
        briefing += `URGENT: The contracts with ${names} expire within 90 days. Immediate renewal negotiation recommended. `;
    } else {
        briefing += 'All contracts are stable. ';
    }

    if (budgetLow) {
        briefing += `WARNING: Available budget has fallen below 10 million euros. Recommend budget reallocation review. `;
    }

    if (cfoDB.infraNLZ < 50) {
        briefing += `NLZ expansion at ${cfoDB.infraNLZ}% — recommend releasing additional investment from the NLZ budget line.`;
    } else {
        briefing += `NLZ Academy expansion on track at ${cfoDB.infraNLZ}%.`;
    }

    return briefing;
}

function logCFOMessage(msg) {
    const log = document.getElementById('cfo-briefing-log');
    if (log) {
        const span = document.createElement('div');
        span.textContent = '> CFO: ' + msg;
        span.style.color = '#ffd700';
        span.style.marginTop = '4px';
        span.style.borderTop = '1px solid rgba(255,215,0,0.1)';
        span.style.paddingTop = '4px';
        log.appendChild(span);
        log.scrollTop = log.scrollHeight;
    }
}

// Wire CFO Suite init to the modal open event
document.addEventListener('DOMContentLoaded', () => {
    // Management suite opens when the CFO launcher btn is clicked
    // initManagementSuite() is called from switchPersona('cfo')
    // But also handle direct tab click re-entry
    const mgmtModal = document.getElementById('modal-management');
    if (mgmtModal) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(m => {
                if (m.target.classList.contains('deep-dive-window') &&
                    !m.target.classList.contains('hidden')) {
                    initManagementSuite();
                }
            });
        });
        observer.observe(mgmtModal, { attributes: true, attributeFilter: ['class'] });
    }
});


// ═══════════════════════════════════════════════════════════════════════════
// V84–V87 — MEDIZIN LAB ELITE, NLZ HUB, VIDEO ANALYTICAL HUB
// ═══════════════════════════════════════════════════════════════════════════

// ── CMO helpers ────────────────────────────────────────────────────────────
function generateCMOBriefing() {
    const bodyFat = parseFloat(document.getElementById('slider-bodyfat')?.value) || 9.5;
    const hrv = parseInt(document.getElementById('slider-hrv')?.value) || 75;
    const rt = parseInt(document.getElementById('input-reaction-time')?.value) || 185;
    const fl = parseInt(document.getElementById('slider-force-left')?.value) || 847;
    const fr = parseInt(document.getElementById('slider-force-right')?.value) || 792;
    const asym = Math.abs(fl - fr) / Math.max(fl, fr) * 100;
    let b = 'CMO report: ';
    b += bodyFat > 10.5 ? `CRITICAL — Body fat ${bodyFat.toFixed(1)}% exceeds 10.5% threshold. Dietary adjustment required. ` : `Body fat nominal at ${bodyFat.toFixed(1)}%. `;
    b += hrv < 60 ? `HRV at ${hrv}ms — stress elevated. Reduce sprint load. ` : `HRV healthy at ${hrv}ms. `;
    if (asym > 10) b += `Force plate asymmetry ${asym.toFixed(1)}% — unilateral strengthening recommended. `;
    if (rt > 220) b += `Reaction time ${rt}ms — cognitive fatigue protocol suggested.`;
    return b;
}

function logCMOMessage(msg) {
    const log = document.getElementById('cmo-briefing-log');
    if (!log) return;
    const div = document.createElement('div');
    div.textContent = '> CMO: ' + msg;
    div.style.cssText = 'color:#00ffff;margin-top:4px;border-top:1px solid rgba(0,255,255,0.1);padding-top:4px;';
    log.appendChild(div); log.scrollTop = log.scrollHeight;
}

function initMedicalLab() {
    if (window._medLabInitialized) return;
    window._medLabInitialized = true;

    // Force Plate
    function updateForcePlate() {
        const l = parseInt(document.getElementById('slider-force-left')?.value || 847);
        const r = parseInt(document.getElementById('slider-force-right')?.value || 792);
        const asym = Math.abs(l - r) / Math.max(l, r) * 100;
        const s = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
        const c = (id, p, v) => { const e = document.getElementById(id); if (e) e.style[p] = v; };
        s('val-force-left', l); s('val-force-right', r);
        c('bar-force-left', 'width', ((l - 500) / 700 * 100).toFixed(1) + '%');
        c('bar-force-right', 'width', ((r - 500) / 700 * 100).toFixed(1) + '%');
        s('val-asymmetry', asym.toFixed(1) + '%');
        c('val-asymmetry', 'color', asym > 10 ? '#ff4b2b' : '#ffd700');
        const w = document.getElementById('asymmetry-warning');
        if (w) { w.textContent = asym > 10 ? '⚠ ASYMMETRY ' + asym.toFixed(1) + '% — Injury risk!' : '⚡ Within tolerance (<10%)'; w.style.color = asym > 10 ? '#ff4b2b' : '#ffd700'; }
    }
    document.getElementById('slider-force-left')?.addEventListener('input', updateForcePlate);
    document.getElementById('slider-force-right')?.addEventListener('input', updateForcePlate);

    // Hormonal
    function updateHormonal() {
        const co = parseFloat(document.getElementById('slider-cortisol')?.value || 380);
        const te = parseFloat(document.getElementById('slider-testosterone')?.value || 18.5);
        const s = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
        s('val-cortisol', co); s('val-testosterone', te.toFixed(1));
        const re = document.getElementById('val-cort-testo-ratio');
        if (re) { re.textContent = (co / te).toFixed(1) + 'x'; re.style.color = co / te > 40 ? '#ff4b2b' : '#ffd700'; }
        const cm = document.getElementById('cortisol-marker');
        if (cm) cm.style.left = ((co - 100) / 700 * 100).toFixed(0) + '%';
        const tm = document.getElementById('testo-marker');
        if (tm) tm.style.left = ((te - 5) / 30 * 100).toFixed(0) + '%';
        const cw = document.getElementById('cortisol-warning'); if (cw) cw.style.display = co > 690 ? 'block' : 'none';
        const tw = document.getElementById('testo-low-warning'); if (tw) tw.style.display = te < 10 ? 'block' : 'none';
    }
    document.getElementById('slider-cortisol')?.addEventListener('input', updateHormonal);
    document.getElementById('slider-testosterone')?.addEventListener('input', updateHormonal);

    // RPE & Cognitive
    document.getElementById('slider-rpe')?.addEventListener('input', e => {
        const el = document.getElementById('val-rpe'); if (el) el.textContent = e.target.value + '/10';
    });
    document.getElementById('slider-cog-stress')?.addEventListener('input', e => {
        const v = parseInt(e.target.value), el = document.getElementById('val-cog-stress');
        if (el) { el.textContent = v + '%'; el.style.color = v > 60 ? '#ff4b2b' : '#00ff88'; }
    });
    document.getElementById('input-reaction-time')?.addEventListener('input', e => {
        const v = parseInt(e.target.value), el = document.getElementById('reaction-status');
        if (el) {
            if (v < 160) { el.textContent = '⚡ WORLD CLASS'; el.style.color = '#ffd700'; }
            else if (v < 200) { el.textContent = '✓ ELITE LEVEL'; el.style.color = '#00ff88'; }
            else { el.textContent = '⚠ FATIGUED'; el.style.color = '#ff4b2b'; }
        }
    });

    document.getElementById('btn-cmo-brief-now')?.addEventListener('click', () => {
        const msg = generateCMOBriefing(); speakAlert(msg, 'cmo'); logCMOMessage(msg);
    });
    console.log('[V84] Medical Lab ELITE initialized.');
}

document.addEventListener('DOMContentLoaded', () => {
    const m = document.getElementById('modal-medical');
    if (m) new MutationObserver(muts => muts.forEach(mu => { if (!mu.target.classList.contains('hidden')) initMedicalLab(); }))
        .observe(m, { attributes: true, attributeFilter: ['class'] });
});


// ── V85: NLZ ELITE ACADEMY HUB ──────────────────────────────────────────────
const nlzAgeGroups = {
    g: { label: 'G-Youth — U6', focus: 'Coordination · Ball feeling · Joy of movement', formula: { DRI: 0.40, PAC: 0.30, PHY: 0.30 }, yearMin: 2020, yearMax: 2024 },
    f: { label: 'F-Youth — U8', focus: 'Technical basics · Small-sided games', formula: { PAC: 0.35, DRI: 0.35, PHY: 0.30 }, yearMin: 2018, yearMax: 2020 },
    e: { label: 'E-Youth — U10', focus: 'Game intelligence · Positional play · Duels', formula: { PAC: 0.30, PAS: 0.30, DRI: 0.25, PHY: 0.15 }, yearMin: 2016, yearMax: 2018 },
    d: { label: 'D-Youth — U12', focus: 'Pressing · Transition · 1v1 defending', formula: { PAC: 0.25, PAS: 0.30, DRI: 0.25, DEF: 0.20 }, yearMin: 2014, yearMax: 2016 },
    c: { label: 'C-Youth — U14', focus: 'Tactical awareness · Wing play · Set pieces', formula: { PAS: 0.30, DEF: 0.25, DRI: 0.25, SHO: 0.20 }, yearMin: 2012, yearMax: 2014 },
    b: { label: 'B-Youth — U16', focus: 'Physical intensity · Combination · Transitions', formula: { PHY: 0.25, PAS: 0.25, DEF: 0.25, SHO: 0.25 }, yearMin: 2010, yearMax: 2012 },
    a: { label: 'A-Youth — U19', focus: 'Tactical maturity · Professional pressure', formula: { DEF: 0.25, PAS: 0.25, SHO: 0.25, PAC: 0.25 }, yearMin: 2007, yearMax: 2010 },
};
const nlzSeeds = {
    g: [{ name: 'Luca M.', year: 2022, s: { pac: 45, sho: 20, pas: 35, dri: 60, def: 10, phy: 40 } }, { name: 'Tim B.', year: 2021, s: { pac: 50, sho: 22, pas: 40, dri: 65, def: 12, phy: 45 } }],
    f: [{ name: 'Jonas H.', year: 2019, s: { pac: 55, sho: 28, pas: 42, dri: 62, def: 15, phy: 48 } }],
    e: [{ name: 'Nico L.', year: 2017, s: { pac: 62, sho: 35, pas: 55, dri: 65, def: 22, phy: 54 } }],
    d: [{ name: 'Markus A.', year: 2015, s: { pac: 68, sho: 42, pas: 60, dri: 66, def: 38, phy: 60 } }],
    c: [{ name: 'Kai R.', year: 2013, s: { pac: 72, sho: 55, pas: 68, dri: 70, def: 45, phy: 65 } }, { name: 'Leon T.', year: 2012, s: { pac: 70, sho: 58, pas: 66, dri: 67, def: 48, phy: 63 } }],
    b: [{ name: 'Mateo F.', year: 2011, s: { pac: 76, sho: 65, pas: 72, dri: 74, def: 58, phy: 72 } }],
    a: [{ name: 'Tyler W.', year: 2008, s: { pac: 80, sho: 72, pas: 75, dri: 76, def: 65, phy: 78 } }, { name: 'Sven D.', year: 2007, s: { pac: 78, sho: 70, pas: 77, dri: 74, def: 68, phy: 76 } }],
};
Object.keys(nlzAgeGroups).forEach(k => {
    nlzAgeGroups[k].players = (nlzSeeds[k] || []).map(p => ({ name: p.name, year: p.year, stats: { ...p.s } }));
});

let currentNLZGroup = 'g';

function calcAgeWeightedOVR(stats, formula) {
    const km = { PAC: 'pac', SHO: 'sho', PAS: 'pas', DRI: 'dri', DEF: 'def', PHY: 'phy' };
    return Math.round(Object.entries(formula).reduce((s, [k, w]) => s + (stats[km[k]] || 0) * w, 0));
}

function renderNLZSquad(gk) {
    const group = nlzAgeGroups[gk];
    const grid = document.getElementById('nlz-squad-grid'); if (!grid) return;
    const t = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
    t('nlz-group-title', group.label);
    t('nlz-group-focus', 'Focus: ' + group.focus);
    const we = document.getElementById('nlz-group-ovr-weight');
    if (we) we.textContent = 'OVR: ' + Object.entries(group.formula).map(([k, v]) => `${k}×${(v * 100).toFixed(0)}%`).join(' ');

    // Update Pillars dynamically
    const basePillars = {
        g: [40, 30, 20, 95],
        f: [55, 45, 30, 90],
        e: [65, 60, 45, 85],
        d: [75, 70, 60, 88],
        c: [82, 80, 75, 85],
        b: [88, 88, 85, 90],
        a: [95, 92, 90, 95]
    };
    const pVals = basePillars[gk] || [50, 50, 50, 50];
    for (let i = 1; i <= 4; i++) {
        const pEl = document.getElementById(`nlz-pillar-${i}`);
        if (pEl) {
            pEl.style.transition = 'width 1s ease-out';
            pEl.style.width = `${pVals[i - 1]}%`;
        }
    }

    grid.innerHTML = '';
    group.players.forEach((pl, idx) => {
        const ovr = calcAgeWeightedOVR(pl.stats, group.formula);
        const card = document.createElement('div'); card.className = 'nlz-player-card';
        const sh = ['pac', 'sho', 'pas', 'dri', 'def', 'phy'].map(s => `
            <div class="nlz-stat-row"><span>${s.toUpperCase()}</span>
            <input type="range" min="0" max="99" value="${pl.stats[s]}" data-gk="${gk}" data-pi="${idx}" data-st="${s}" class="nlz-ss">
            <span class="nsv-${idx}-${s}" style="min-width:22px;text-align:right;">${pl.stats[s]}</span></div>`).join('');
        card.innerHTML = `<div style="display:flex;justify-content:space-between;margin-bottom:4px;">
            <div class="nlz-ovr novr-${idx}" style="color:var(--accent-blue);font-family:var(--font-heading);font-size:1.4rem;font-weight:900;">${ovr}</div>
            <div style="font-size:0.6rem;color:#555;">${pl.year}</div></div>
            <div style="font-size:0.75rem;font-weight:700;color:#fff;margin-bottom:6px;">${pl.name}</div>${sh}`;
        grid.appendChild(card);
    });
    grid.querySelectorAll('.nlz-ss').forEach(sl => {
        sl.addEventListener('input', e => {
            const g = e.target.dataset.gk, pi = parseInt(e.target.dataset.pi), s = e.target.dataset.st, v = parseInt(e.target.value);
            nlzAgeGroups[g].players[pi].stats[s] = v;
            const ve = grid.querySelector(`.nsv-${pi}-${s}`); if (ve) ve.textContent = v;
            const newOVR = calcAgeWeightedOVR(nlzAgeGroups[g].players[pi].stats, nlzAgeGroups[g].formula);
            const oe = e.target.closest('.nlz-player-card')?.querySelector(`.novr-${pi}`); if (oe) oe.textContent = newOVR;
        });
    });
}

function initNLZHub() {
    if (window._nlzHubInitialized) return; window._nlzHubInitialized = true;
    document.querySelectorAll('.age-group-btn').forEach(b => {
        b.addEventListener('click', () => {
            document.querySelectorAll('.age-group-btn').forEach(x => x.classList.remove('active'));
            b.classList.add('active'); currentNLZGroup = b.dataset.group; renderNLZSquad(currentNLZGroup);
        });
    });
    document.getElementById('btn-nlz-add')?.addEventListener('click', () => {
        const name = document.getElementById('nlz-new-name')?.value.trim();
        const year = document.getElementById('nlz-new-year')?.value;
        if (!name || !year) return;
        const tk = Object.keys(nlzAgeGroups).find(k => parseInt(year) >= nlzAgeGroups[k].yearMin && parseInt(year) <= nlzAgeGroups[k].yearMax);
        if (!tk) { logAcademyMessage(`Year ${year} out of range.`); return; }
        nlzAgeGroups[tk].players.push({ name, year: parseInt(year), stats: { pac: 50, sho: 40, pas: 50, dri: 55, def: 40, phy: 50 } });
        document.querySelectorAll('.age-group-btn').forEach(b => b.classList.toggle('active', b.dataset.group === tk));
        currentNLZGroup = tk; renderNLZSquad(tk);
        logAcademyMessage(`${name} (${year}) → ${nlzAgeGroups[tk].label}`);
        document.getElementById('nlz-new-name').value = ''; document.getElementById('nlz-new-year').value = '';
    });
    document.getElementById('btn-academy-brief-now')?.addEventListener('click', () => {
        const g = nlzAgeGroups[currentNLZGroup];
        const topOVR = Math.max(...g.players.map(p => calcAgeWeightedOVR(p.stats, g.formula)));
        const msg = `Academy Director: ${g.label} — ${g.players.length} players. Top OVR ${topOVR}. Focus: ${g.focus}.`;
        speakAlert(msg, 'academy'); logAcademyMessage(msg);
    });
    renderNLZSquad(currentNLZGroup);
    console.log('[V85] NLZ Academy Hub initialized.');
}

function logAcademyMessage(msg) {
    const log = document.getElementById('academy-briefing-log'); if (!log) return;
    const d = document.createElement('div'); d.textContent = '> DIRECTOR: ' + msg;
    d.style.cssText = 'color:#0088ff;margin-top:4px;'; log.appendChild(d); log.scrollTop = log.scrollHeight;
}

document.addEventListener('DOMContentLoaded', () => {
    const m = document.getElementById('modal-tactics');
    if (m) new MutationObserver(muts => muts.forEach(mu => { if (!mu.target.classList.contains('hidden')) initNLZHub(); }))
        .observe(m, { attributes: true, attributeFilter: ['class'] });
});


// ── V86: VIDEO ANALYTICAL HUB ──────────────────────────────────────────────
function initVideoHub() {
    if (window._videoHubInitialized) return; window._videoHubInitialized = true;
    const player = document.getElementById('video-player');
    const dropHint = document.getElementById('video-drop-hint');
    const toniLog = document.getElementById('toni-video-log');
    const dz = document.getElementById('video-dropzone');
    const fi = document.getElementById('video-file-input');

    function loadVideo(f) {
        if (!f || !player) return;
        player.src = URL.createObjectURL(f); player.style.display = 'block';
        if (dropHint) dropHint.style.display = 'none';
    }
    fi?.addEventListener('change', e => loadVideo(e.target.files[0]));
    if (dz) {
        dz.addEventListener('dragover', e => { e.preventDefault(); dz.classList.add('drag-over'); });
        dz.addEventListener('dragleave', () => dz.classList.remove('drag-over'));
        dz.addEventListener('drop', e => { e.preventDefault(); dz.classList.remove('drag-over'); loadVideo(e.dataTransfer.files[0]); });
    }

    document.querySelectorAll('.video-overlay-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.classList.toggle('active');
            const hMap = {
                'overlay-heatmap': 'heatmap-overlay',
                'overlay-space': 'space-overlay',
                'overlay-passes': 'passes-overlay'
            };
            if (hMap[btn.id]) {
                const layer = document.getElementById(hMap[btn.id]);
                if (layer) layer.style.display = btn.classList.contains('active') ? 'block' : 'none';
            }
        });
    });

    document.getElementById('btn-sync-board')?.addEventListener('click', () => {
        if (toniLog) toniLog.textContent = '> Syncing video frame to tactic board...';
        setTimeout(() => {
            if (typeof renderPitch2D === 'function') renderPitch2D(window.currentFormation || '4-3-3');
            if (toniLog) toniLog.textContent = '> Board synced. Formation reconstructed.';
            speakAlert('Holographic replay synchronized. Player positions reconstructed from video frame.', 'analysis');
        }, 600);
    });

    document.getElementById('btn-toni-343')?.addEventListener('click', () => {
        if (toniLog) toniLog.textContent = '> Toni: Showing 3-4-3 drill...';
        if (typeof renderPitch2D === 'function') renderPitch2D('3-4-3');
        speakAlert('3-4-3 drill active. Double pivot coverage and wing back overlaps highlighted.', 'analysis');
    });

    document.getElementById('btn-toni-finish')?.addEventListener('click', () => {
        if (toniLog) toniLog.textContent = '> Toni: Highlighting finishing zones...';
        const pitch = document.querySelector('.pitch-area') || document.querySelector('.pitch');
        if (pitch && !pitch.querySelector('.half-space-zone')) {
            ['left', 'right'].forEach(side => { const z = document.createElement('div'); z.className = `half-space-zone ${side}`; pitch.style.position = 'relative'; pitch.appendChild(z); });
        }
        speakAlert('Finishing zones active. Half-spaces in neon cyan. Target: inside channels and penalty box edges.', 'analysis');
    });

    document.getElementById('btn-add-clip')?.addEventListener('click', () => {
        const t = player?.currentTime, cl = document.getElementById('clip-list');
        if (!t || isNaN(t) || !cl) { if (toniLog) toniLog.textContent = '> Load a video first.'; return; }
        const mn = String(Math.floor(t / 60)).padStart(2, '0'), sc = String(Math.floor(t % 60)).padStart(2, '0');
        const e = document.createElement('div'); e.className = 'clip-entry';
        e.innerHTML = `<span style="color:#ff4b2b;font-family:var(--font-heading);">${mn}:${sc}</span><span style="font-size:0.7rem;color:#ccc;">Annotation ${cl.children.length + 1}</span>`;
        cl.appendChild(e);
    });

    // V109: Send Homework to Phone
    document.getElementById('btn-send-homework')?.addEventListener('click', () => {
        const p = document.getElementById('homework-player-select')?.value || 'Player';
        const msg = `Homework clip synced securely to ${p}'s mobile device.`;
        if (toniLog) toniLog.textContent = '> ' + msg;
        speakAlert(msg, 'coach');

        const btn = document.getElementById('btn-send-homework');
        if (btn) {
            const orig = btn.innerHTML;
            btn.innerHTML = '✅ SENT SUCCESSFULLY';
            btn.style.borderColor = '#00ff88';
            btn.style.color = '#00ff88';
            setTimeout(() => { btn.innerHTML = orig; btn.style.borderColor = 'rgba(0,255,136,0.4)'; btn.style.color = ''; }, 3000);
        }
    });
    console.log('[V86] Video Hub initialized.');
}

document.addEventListener('DOMContentLoaded', () => {
    const m = document.getElementById('modal-video');
    if (m) new MutationObserver(muts => muts.forEach(mu => { if (!mu.target.classList.contains('hidden')) initVideoHub(); }))
        .observe(m, { attributes: true, attributeFilter: ['class'] });
});


// ═══════════════════════════════════════════════════════════════════════════
// V88–V89 + i18n — xG SYSTEM, DAILY BRIEFING, VIDEO OVERLAYS, HEALTH SYNC
// ═══════════════════════════════════════════════════════════════════════════

// ── xG Database ─────────────────────────────────────────────────────────────
const xgDB = {};

function getOrSeedXG(playerId) {
    if (xgDB[playerId] === undefined) {
        // Deterministically seed based on player id
        const seed = Array.from(String(playerId)).reduce((s, c) => s + c.charCodeAt(0), 0);
        xgDB[playerId] = Math.round(((seed % 37) / 100 + 0.05) * 100) / 100;
    }
    return xgDB[playerId];
}

function renderXGLabels2D() {
    // Add xG labels to all player markers on the 2D pitch
    document.querySelectorAll('.player-marker, .player-dot').forEach((marker, i) => {
        const xg = getOrSeedXG(i);
        if (marker.style.position !== 'absolute') marker.style.position = 'absolute';
        // Remove existing label
        const existing = marker.querySelector('.xg-label');
        if (existing) existing.remove();
        const label = document.createElement('span');
        label.className = 'xg-label';
        label.textContent = `xG ${xg.toFixed(2)}`;
        marker.appendChild(label);
    });
}

function renderXGLabelsVR() {
    if (!window.vrReady) return;
    document.querySelectorAll('[id^="vr-player-"]').forEach((sphere, i) => {
        const xg = getOrSeedXG(i);
        const labelId = `vr-xg-label-${i}`;
        let label = document.getElementById(labelId);
        if (!label) {
            label = document.createElement('a-text');
            label.setAttribute('id', labelId);
            label.setAttribute('align', 'center');
            label.setAttribute('color', '#ffd700');
            label.setAttribute('width', '1.5');
            sphere.appendChild(label);
        }
        const pos = sphere.getAttribute('position') || { x: 0, y: 0, z: 0 };
        label.setAttribute('position', '0 0.18 0');
        label.setAttribute('value', `xG ${xg.toFixed(2)}`);
    });
}


// ── Health Alert Pitch Marker Sync ──────────────────────────────────────────
function applyHealthMarkerPulse() {
    const bodyFat = parseFloat(document.getElementById('slider-bodyfat')?.value) || 9.5;
    const hrv = parseInt(document.getElementById('slider-hrv')?.value) || 75;
    const alertActive = bodyFat > 10.5 || hrv < 60;

    // 2D pitch markers
    document.querySelectorAll('.player-marker, .player-dot').forEach(m => {
        m.classList.toggle('health-alert', alertActive);
    });

    // VR player spheres emissive shift
    if (window.vrReady) {
        document.querySelectorAll('[id^="vr-player-"]').forEach(sphere => {
            if (alertActive) {
                sphere.setAttribute('material', 'color: #ff4b2b; emissive: #ff4b2b; emissive-intensity: 0.5; wireframe: true;');
            } else {
                sphere.setAttribute('material', 'color: #00ffff; emissive: #00ffff; emissive-intensity: 0.15; wireframe: true;');
            }
        });
    }

    // Update Nagelsmann badge in medical modal
    const badge = document.getElementById('cmo-alert-badge');
    if (badge) badge.style.display = alertActive ? 'inline-block' : 'none';
}

// Hook into existing HRV and body fat sliders
document.addEventListener('DOMContentLoaded', () => {
    ['slider-hrv', 'slider-bodyfat'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', applyHealthMarkerPulse);
    });
});


// ── Video Overlays (Passing Lanes / Pressure Zones) ──────────────────────────
function initVideoOverlayCanvas() {
    const dropzone = document.getElementById('video-dropzone');
    const player = document.getElementById('video-player');
    if (!dropzone || !player) return;
    if (document.getElementById('video-overlay-canvas')) return;

    const canvas = document.createElement('canvas');
    canvas.id = 'video-overlay-canvas';
    dropzone.style.position = 'relative';
    dropzone.appendChild(canvas);

    window._videoCanvas = canvas;
    window._videoCanvasCtx = canvas.getContext('2d');
    window._videoOverlayModes = { passLines: false, pressure: false, distance: false };

    // Sync canvas size to video
    player.addEventListener('loadedmetadata', () => {
        canvas.width = player.videoWidth || dropzone.offsetWidth;
        canvas.height = player.videoHeight || 200;
    });
}

function drawPassingLanes(ctx, w, h) {
    if (!ctx) return;
    ctx.clearRect(0, 0, w, h);
    const lanes = [
        [0.2 * w, 0.5 * h, 0.5 * w, 0.3 * h],
        [0.5 * w, 0.3 * h, 0.8 * w, 0.4 * h],
        [0.2 * w, 0.5 * h, 0.5 * w, 0.7 * h],
        [0.5 * w, 0.7 * h, 0.75 * w, 0.6 * h],
        [0.35 * w, 0.4 * h, 0.6 * w, 0.2 * h],
    ];
    ctx.strokeStyle = 'rgba(0,255,255,0.7)';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 4]);
    lanes.forEach(([x1, y1, x2, y2]) => {
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        // Arrowhead
        const angle = Math.atan2(y2 - y1, x2 - x1);
        ctx.setLineDash([]);
        ctx.save(); ctx.translate(x2, y2); ctx.rotate(angle);
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-10, -5); ctx.lineTo(-10, 5); ctx.closePath();
        ctx.fillStyle = 'rgba(0,255,255,0.8)'; ctx.fill(); ctx.restore();
        ctx.setLineDash([8, 4]);
    });
}

function drawPressureZones(ctx, w, h) {
    if (!ctx) return;
    const zones = [[0.25 * w, 0.35 * h, 55], [0.6 * w, 0.45 * h, 45], [0.75 * w, 0.65 * h, 38]];
    zones.forEach(([cx, cy, r]) => {
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        grad.addColorStop(0, 'rgba(255,75,43,0.5)');
        grad.addColorStop(1, 'rgba(255,75,43,0)');
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fillStyle = grad; ctx.fill();
        ctx.strokeStyle = 'rgba(255,75,43,0.6)'; ctx.lineWidth = 1.5; ctx.setLineDash([]); ctx.stroke();
    });
}

function drawDistanceLines(ctx, w, h) {
    if (!ctx) return;
    const points = [[0.2 * w, 0.5 * h], [0.4 * w, 0.3 * h], [0.6 * w, 0.5 * h], [0.5 * w, 0.7 * h], [0.75 * w, 0.45 * h]];
    ctx.strokeStyle = 'rgba(255,215,0,0.6)'; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
    for (let i = 0; i < points.length - 1; i++) {
        const [x1, y1] = points[i], [x2, y2] = points[i + 1];
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        // Distance label
        const dist = Math.round(Math.hypot(x2 - x1, y2 - y1) / 10);
        ctx.fillStyle = 'rgba(255,215,0,0.9)'; ctx.font = '10px monospace';
        ctx.fillText(`${dist}m`, (x1 + x2) / 2 + 3, (y1 + y2) / 2 - 3);
    }
}

function redrawVideoCanvas() {
    const canvas = window._videoCanvas;
    const ctx = window._videoCanvasCtx;
    const modes = window._videoOverlayModes;
    if (!canvas || !ctx) return;
    const w = canvas.width || canvas.offsetWidth;
    const h = canvas.height || 200;
    ctx.clearRect(0, 0, w, h);
    if (modes.passLines) drawPassingLanes(ctx, w, h);
    if (modes.pressure) drawPressureZones(ctx, w, h);
    if (modes.distance) drawDistanceLines(ctx, w, h);
}

// Hook additional overlay toggle buttons for video hub
document.addEventListener('DOMContentLoaded', () => {
    // Extend Video Hub overlay buttons
    document.addEventListener('click', e => {
        const btn = e.target.closest('#overlay-heatmap, #overlay-distance, #overlay-sprint');
        if (!btn) return;
        if (!window._videoOverlayModes) return;
        initVideoOverlayCanvas();
        if (btn.id === 'overlay-distance') {
            window._videoOverlayModes.distance = !window._videoOverlayModes.distance;
        }
        if (btn.id === 'overlay-sprint') {
            window._videoOverlayModes.pressure = !window._videoOverlayModes.pressure;
        }
        redrawVideoCanvas();
    });

    // Wire Passing Lanes button in Video Hub (add new one if btn-toni-343 related or use data attribute)
    const btnFL = document.getElementById('btn-toni-finish');
    if (btnFL) {
        btnFL.addEventListener('click', () => {
            if (!window._videoOverlayModes) return;
            initVideoOverlayCanvas();
            window._videoOverlayModes.passLines = !window._videoOverlayModes.passLines;
            redrawVideoCanvas();
        }, true);
    }
});


// ── Toni Lead Analyst Voice Commands ────────────────────────────────────────
function handleLeadAnalystCommand(upper) {
    const log = id => document.getElementById(id);

    if (upper.includes('DEFENSIVE') || upper.includes('LÜCKE') || upper.includes('GAP')) {
        speakAlert(t('tts-defensive-gap'), 'analysis');
        // Highlight 2 defensive zones on pitch
        const pitch = document.querySelector('.pitch-area') || document.querySelector('.pitch-wrapper');
        if (pitch) {
            ['left', 'right'].forEach((s, i) => {
                const zone = document.createElement('div');
                zone.style.cssText = `position:absolute;${i === 0 ? 'left:18%' : 'right:18%'};top:60%;width:22%;height:30%;background:rgba(255,75,43,0.18);border:1px solid #ff4b2b;border-radius:4px;pointer-events:none;animation:fadeIn 0.5s ease;z-index:5;`;
                zone.className = 'defensive-gap-zone';
                pitch.style.position = 'relative';
                pitch.appendChild(zone);
                setTimeout(() => zone.remove(), 6000);
            });
        }
        addSystemLog('Defensive gap highlighted.', 'red');
        return true;
    }

    if (upper.includes('PRESSING') || upper.includes('DRUCK')) {
        speakAlert(t('tts-pressing-zones'), 'analysis');
        initVideoOverlayCanvas();
        if (window._videoOverlayModes) window._videoOverlayModes.pressure = true;
        redrawVideoCanvas();
        addSystemLog('Pressing zones active.', 'red');
        return true;
    }

    if (upper.includes('PASSWEG') || upper.includes('PASSING LANE') || upper.includes('LANE')) {
        speakAlert(t('tts-passing-lanes'), 'analysis');
        initVideoOverlayCanvas();
        if (window._videoOverlayModes) window._videoOverlayModes.passLines = true;
        redrawVideoCanvas();
        addSystemLog('Passing lanes overlay active.', 'cyan');
        return true;
    }

    if (upper.includes('SESSION') || upper.includes('SITZUNG') || upper.includes('SPEICHERN') || upper.includes('SAVE')) {
        speakAlert(t('tts-session-saved'), 'analyst');
        setTimeout(() => fireDailyBriefing(), 800);
        addSystemLog('Session saved. Daily briefing initiated.', 'gold');
        return true;
    }

    return false;
}

// Extend existing voice handler to include Lead Analyst commands
const _prevHandleVoice = typeof handleVoiceCommandV84 === 'function' ? handleVoiceCommandV84 : null;
function handleVoiceCommandV88(transcript) {
    const upper = transcript.trim().toUpperCase();
    if (handleLeadAnalystCommand(upper)) return;
    if (_prevHandleVoice) _prevHandleVoice(transcript);
}


// ── V89: Daily Briefing Engine ───────────────────────────────────────────────
const BRIEFING_HISTORY_KEY = 'toni_briefing_history';

function loadBriefingHistory() {
    try { return JSON.parse(localStorage.getItem(BRIEFING_HISTORY_KEY) || '[]'); }
    catch (e) { return []; }
}

function saveBriefingHistory(history) {
    localStorage.setItem(BRIEFING_HISTORY_KEY, JSON.stringify(history));
}

function fireDailyBriefing() {
    // Gather top 3 players by xG
    const players = window.squad2D || [];
    const xgEntries = players.length > 0
        ? players.slice(0, 11).map((p, i) => ({ name: p.name || `Player ${i + 1}`, xg: getOrSeedXG(i) }))
        : [0, 1, 2, 3, 4].map(i => ({ name: `Player ${i + 1}`, xg: getOrSeedXG(i) }));

    xgEntries.sort((a, b) => b.xg - a.xg);
    const top3 = xgEntries.slice(0, 3);

    // Nagelsmann alerts
    const bodyFat = parseFloat(document.getElementById('slider-bodyfat')?.value) || 9.5;
    const hrv = parseInt(document.getElementById('slider-hrv')?.value) || 75;
    const alerts = [];
    if (bodyFat > 10.5) alerts.push(`Body fat ${bodyFat.toFixed(1)}% above threshold`);
    if (hrv < 60) alerts.push(`HRV low at ${hrv}ms — overtraining risk`);

    // Tactical grade
    const tacticalGrade = (70 + Math.floor(Math.random() * 26)) + '%';

    // Build briefing object
    const now = new Date();
    const dateStr = now.toLocaleDateString(window.currentLang === 'de' ? 'de-DE' : 'en-US', {
        weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
    });

    const briefingObj = {
        date: dateStr,
        top3,
        alerts,
        tacticalGrade,
        lang: window.currentLang
    };

    // Fire TTS briefing
    const ttsText = buildBriefingTTS(briefingObj);
    speakAlert(ttsText, 'analyst');

    // VR: pulse Cardiac Mountains cyan
    pulseCardiacMountainsCyan();

    // VR Screen 1 update
    const vrS1 = document.getElementById('vr-fin-budget');
    if (vrS1) vrS1.setAttribute('value', `BRIEFING: Grade ${tacticalGrade}`);

    // Log to management modal briefing section
    logDailyBriefingToUI(briefingObj);

    // Persist to localStorage
    const history = loadBriefingHistory();
    history.unshift(briefingObj);
    if (history.length > 20) history.pop(); // cap at 20 entries
    saveBriefingHistory(history);

    // Re-render history tab
    renderBriefingHistory();

    console.log('[V89] Daily briefing fired:', briefingObj);
}

function buildBriefingTTS(b) {
    const lang = window.currentLang;
    if (lang === 'de') {
        let text = `${t('tts-daily-intro')} ${t('tts-top-player')} ${b.top3[0]?.name || 'Unbekannt'} mit ${b.top3[0]?.xg.toFixed(2)} erwarteten Toren. `;
        if (b.alerts.length > 0) text += `${t('tts-medical-alert')} ${b.alerts.join(', gefolgt von ')}. `;
        text += `${t('tts-tactical-grade')} ${b.tacticalGrade}.`;
        return text;
    }
    let text = `${t('tts-daily-intro')} ${t('tts-top-player')} ${b.top3[0]?.name || 'Unknown'} with ${b.top3[0]?.xg.toFixed(2)} expected goals. `;
    if (b.alerts.length > 0) text += `${t('tts-medical-alert')} ${b.alerts.join('. ')}. `;
    text += `${t('tts-tactical-grade')} ${b.tacticalGrade}.`;
    return text;
}

function logDailyBriefingToUI(b) {
    const log = document.getElementById('cfo-briefing-log');
    if (!log) return;
    const div = document.createElement('div');
    div.style.cssText = 'color:#ffd700;margin-top:4px;border-top:1px solid rgba(255,215,0,0.1);padding-top:4px;';
    div.textContent = `> ANALYST [${b.date}]: Grade ${b.tacticalGrade} — Top: ${b.top3.map(p => p.name).join(', ')}`;
    log.appendChild(div); log.scrollTop = log.scrollHeight;
}

function renderBriefingHistory() {
    const list = document.getElementById('briefing-history-list');
    if (!list) return;
    const history = loadBriefingHistory();

    if (history.length === 0) {
        list.innerHTML = '<div style="font-size:0.7rem;color:#555;text-align:center;padding:2rem;">No briefings stored yet.<br>Say "SESSION SPEICHERN" to trigger a daily briefing.</div>';
        return;
    }

    list.innerHTML = '';
    history.forEach(b => {
        const entry = document.createElement('div');
        entry.className = 'briefing-history-entry';
        const alertsHTML = b.alerts.length > 0
            ? `<div class="bh-alerts">⚠ ${b.alerts.join(' · ')}</div>`
            : `<div style="font-size:0.65rem;color:#00ff88;margin-top:4px;">✓ No medical alerts</div>`;
        entry.innerHTML = `
            <div class="bh-grade">${b.tacticalGrade}</div>
            <div class="bh-date">${b.date}</div>
            <div class="bh-content">
                Top xG: ${b.top3.slice(0, 3).map((p, i) => `${i + 1}. ${p.name} (${p.xg.toFixed(2)})`).join(' · ')}
            </div>
            ${alertsHTML}`;
        list.appendChild(entry);
    });
}

// Clear history button
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btn-clear-history')?.addEventListener('click', () => {
        localStorage.removeItem(BRIEFING_HISTORY_KEY);
        renderBriefingHistory();
    });
    // Render history when history tab is opened
    const mgmtModal = document.getElementById('modal-management');
    if (mgmtModal) {
        mgmtModal.addEventListener('click', e => {
            if (e.target.dataset.tab === 'mgmt-history') renderBriefingHistory();
        });
    }
});


// ── Cardiac Mountains Cyan Pulse (V89) ──────────────────────────────────────
function pulseCardiacMountainsCyan() {
    const terrain = document.getElementById('vr-terrain') || document.getElementById('heartbeat-terrain');
    if (!terrain) return;
    let pulseCount = 0;
    const maxPulses = 6;
    const interval = setInterval(() => {
        const isEven = pulseCount % 2 === 0;
        terrain.setAttribute('material', `color: ${isEven ? '#00ffff' : '#003333'}; wireframe: true; emissive: ${isEven ? '#00ffff' : '#000000'}; emissive-intensity: ${isEven ? '0.6' : '0'}`);
        pulseCount++;
        if (pulseCount >= maxPulses * 2) {
            clearInterval(interval);
            // Restore original colors
            terrain.setAttribute('material', 'color: #0d2b1f; wireframe: true; emissive: #003311; emissive-intensity: 0.2');
        }
    }, 500);
}


// ── VR Keyboard Rebuild (QWERTY / QWERTZ) ────────────────────────────────────
function rebuildVRKeyboard(lang) {
    const container = document.getElementById('vr-floating-keyboard');
    if (!container || !window.vrKeyboardLayouts) return;
    const layout = vrKeyboardLayouts[lang] || vrKeyboardLayouts.en;
    // Clear existing key texts
    const existingKeys = container.querySelectorAll('[data-vr-key]');
    existingKeys.forEach(k => k.remove());

    layout.forEach((row, rowIdx) => {
        row.forEach((key, colIdx) => {
            const keyEntity = document.createElement('a-entity');
            const xPos = (colIdx - row.length / 2) * 0.095;
            const yPos = -rowIdx * 0.075;
            keyEntity.setAttribute('position', `${xPos.toFixed(3)} ${yPos.toFixed(3)} 0.01`);
            keyEntity.setAttribute('data-vr-key', key);

            const bg = document.createElement('a-box');
            bg.setAttribute('width', '0.08'); bg.setAttribute('height', '0.06'); bg.setAttribute('depth', '0.01');
            bg.setAttribute('color', '#011122'); bg.setAttribute('material', 'opacity: 0.9');

            const label = document.createElement('a-text');
            label.setAttribute('value', key); label.setAttribute('align', 'center');
            label.setAttribute('color', '#00ffff'); label.setAttribute('width', '0.6');
            label.setAttribute('position', '0 0 0.006');

            keyEntity.appendChild(bg); keyEntity.appendChild(label);
            container.appendChild(keyEntity);
        });
    });
    console.log(`[i18n] VR keyboard rebuilt: ${lang.toUpperCase()} layout`);
}


// ═══════════════════════════════════════════════════════════════════════════
// V90 — EVENT P&L MODULE + ADVISOR LOGIC + ENHANCED i18n VOICE
// ═══════════════════════════════════════════════════════════════════════════

function initEventPL() {
    if (window._eventPLInitialized) return;
    window._eventPLInitialized = true;

    const ids = ['ev-sausage', 'ev-drinks', 'ev-entry', 'ev-sponsor',
        'ev-pitch', 'ev-referee', 'ev-trophies', 'ev-misc'];

    function calcEventPL() {
        const sausage = +document.getElementById('ev-sausage')?.value || 0;
        const drinks = +document.getElementById('ev-drinks')?.value || 0;
        const entry = +document.getElementById('ev-entry')?.value || 0;
        const sponsor = +document.getElementById('ev-sponsor')?.value || 0;
        const pitch = +document.getElementById('ev-pitch')?.value || 0;
        const referee = +document.getElementById('ev-referee')?.value || 0;
        const trophies = +document.getElementById('ev-trophies')?.value || 0;
        const misc = +document.getElementById('ev-misc')?.value || 0;

        const totalIn = sausage + drinks + entry + sponsor;
        const totalOut = pitch + referee + trophies + misc;
        const profit = totalIn - totalOut;

        const fmtEUR = n => `€ ${n.toLocaleString(window.currentLang === 'de' ? 'de-DE' : 'en-US')}`;

        const inEl = document.getElementById('ev-total-in');
        const outEl = document.getElementById('ev-total-out');
        const profEl = document.getElementById('ev-profit');
        const barEl = document.getElementById('ev-profit-bar');
        const tipEl = document.getElementById('ev-invest-tip');

        if (inEl) inEl.textContent = fmtEUR(totalIn);
        if (outEl) outEl.textContent = fmtEUR(totalOut);
        if (profEl) {
            profEl.textContent = fmtEUR(profit);
            profEl.style.color = profit > 0 ? '#00ff88' : '#ff4b2b';
        }

        // Profit bar (max scale = totalIn)
        if (barEl) {
            const pct = totalIn > 0 ? Math.max(0, Math.min(100, profit / totalIn * 100)) : 0;
            barEl.style.width = pct.toFixed(1) + '%';
            barEl.style.background = profit > 0
                ? 'linear-gradient(90deg, #00ff88, #00cc66)'
                : 'linear-gradient(90deg, #ff4b2b, #cc2200)';
        }

        // Investment tip: suggest training kits if profit > €800
        if (tipEl) {
            if (profit > 800) {
                tipEl.textContent = t('invest-tip');
                tipEl.style.display = 'block';
                tipEl.style.color = '#ffd700';
            } else {
                tipEl.style.display = 'none';
            }
        }

        return { totalIn, totalOut, profit };
    }

    // Wire all inputs
    ids.forEach(id => {
        document.getElementById(id)?.addEventListener('input', calcEventPL);
    });
    document.getElementById('event-pl-type')?.addEventListener('change', (e) => {
        // Pre-seed typical values per event type
        const presets = {
            senioren: { sausage: 320, drinks: 480, entry: 600, sponsor: 200, pitch: 150, referee: 80, trophies: 120, misc: 50 },
            jugend: { sausage: 180, drinks: 260, entry: 300, sponsor: 100, pitch: 100, referee: 40, trophies: 80, misc: 30 },
            funino: { sausage: 80, drinks: 120, entry: 150, sponsor: 50, pitch: 60, referee: 20, trophies: 40, misc: 20 },
            friendly: { sausage: 0, drinks: 80, entry: 80, sponsor: 0, pitch: 80, referee: 60, trophies: 0, misc: 10 },
        };
        const p = presets[e.target.value] || presets.senioren;
        Object.entries(p).forEach(([key, val]) => {
            const el = document.getElementById(`ev-${key}`);
            if (el) el.value = val;
        });
        calcEventPL();
    });

    // Initial calc
    calcEventPL();

    // ── Advisor Button ──────────────────────────────────────────────────────
    document.getElementById('btn-advisor-check')?.addEventListener('click', () => {
        const fee = +document.getElementById('advisor-fee')?.value || 0;
        const salary = +document.getElementById('advisor-salary')?.value || 0;
        const verdict = document.getElementById('advisor-verdict');
        const logEl = document.getElementById('advisor-log');

        // Estimate available cash from CFO data or event profit
        const { profit } = calcEventPL();
        const budget = parseFloat(document.getElementById('input-budget')?.value || 0) * 1000;
        const revenue = parseFloat(document.getElementById('input-revenue')?.value || 0) * 1000;
        const expenses = parseFloat(document.getElementById('input-expenses')?.value || 0) * 1000;
        const cashFlow = (budget > 0 ? budget : revenue - expenses) + profit;

        const totalCost = fee + salary;
        const canAfford = cashFlow >= totalCost;

        if (verdict) {
            verdict.textContent = canAfford ? '✓' : '✗';
            verdict.style.borderColor = canAfford ? '#00ff88' : '#ff4b2b';
            verdict.style.background = canAfford ? 'rgba(0,255,136,0.15)' : 'rgba(255,75,43,0.15)';
            verdict.style.color = canAfford ? '#00ff88' : '#ff4b2b';
        }

        const msgKey = canAfford ? 'advisor-yes' : 'advisor-no';
        const msg = t(msgKey);
        if (logEl) {
            logEl.textContent = `${msg} (Handgeld: €${fee.toLocaleString()} + Gehalt: €${salary.toLocaleString()}/yr)`;
            logEl.style.color = canAfford ? '#00ff88' : '#ff4b2b';
        }

        // TTS
        speakAlert(msg, 'advisor');
        addSystemLog(`Advisor: ${msg}`, canAfford ? 'green' : 'red');
    });

    console.log('[V90] Event P&L module initialized.');
}

// Wire Event P&L to Management modal open
document.addEventListener('DOMContentLoaded', () => {
    const mgmtModal = document.getElementById('modal-management');
    if (mgmtModal) {
        new MutationObserver(muts => muts.forEach(m => {
            if (!m.target.classList.contains('hidden')) {
                initEventPL();
                // Re-apply locale so new data-i18n elements pick up current lang
                if (typeof applyLocale === 'function') applyLocale(window.currentLang || 'en');
            }
        })).observe(mgmtModal, { attributes: true, attributeFilter: ['class'] });
    }
});


// ── Enhanced DE Voice in speakAlert ────────────────────────────────────────
// Wrap existing speakAlert to use DE-preferred voice when currentLang === 'de'
const _origSpeakAlert = typeof speakAlert === 'function' ? speakAlert : null;
function speakAlertV90(text, persona) {
    if (!window.speechSynthesis) return;

    // Patch the text with DE coaching vocabulary when in German mode
    let finalText = text;
    if (window.currentLang === 'de') {
        finalText = finalText
            .replace(/half.?space/gi, 'Halbraum')
            .replace(/pressing/gi, 'Gegenpressing')
            .replace(/transition/gi, 'Umschaltspiel')
            .replace(/defensive gap/gi, 'defensive Lücke')
            .replace(/pitch/gi, 'Spielfeld')
            .replace(/verticality/gi, 'Vertikalität')
            .replace(/body fat/gi, 'Körperfettanteil')
            .replace(/heart rate/gi, 'Herzfrequenz')
            .replace(/expected goals/gi, 'erwartete Tore');
    }

    const utter = new SpeechSynthesisUtterance(finalText);
    const voices = speechSynthesis.getVoices();

    if (window.currentLang === 'de') {
        // Prefer a German DE voice
        const deVoice = voices.find(v => v.lang.startsWith('de') && v.localService)
            || voices.find(v => v.lang.startsWith('de'));
        if (deVoice) utter.voice = deVoice;
        utter.lang = 'de-DE';
    } else {
        const enVoice = voices.find(v => v.lang === 'en-US' && v.localService)
            || voices.find(v => v.lang.startsWith('en'));
        if (enVoice) utter.voice = enVoice;
        utter.lang = 'en-US';
    }

    utter.rate = 0.95;
    utter.pitch = 1.0;
    speechSynthesis.cancel();
    speechSynthesis.speak(utter);
}

// Override global speakAlert with V90 version
window.speakAlert = speakAlertV90;


// ═══════════════════════════════════════════════════════════════════════════
// V92 — AUTO-PROCUREMENT & ENHANCED CFO ADVISOR
// ═══════════════════════════════════════════════════════════════════════════

const PROCUREMENT_TARGET = 2500;

function checkProcurementTrigger(profit) {
    const btn = document.getElementById('btn-procurement');
    const tipEl = document.getElementById('ev-invest-tip');
    const headerIcon = document.getElementById('ai-persona-icon');

    if (!btn) return;

    if (profit >= PROCUREMENT_TARGET) {
        btn.style.display = 'block';
        if (tipEl) {
            tipEl.textContent = t('invest-tip');
            tipEl.style.display = 'block';
        }
        // Blink header icon green
        if (headerIcon) {
            headerIcon.textContent = '🟢';
            setTimeout(() => { headerIcon.textContent = '🎛️'; }, 8000);
        }
    } else {
        btn.style.display = 'none';
    }
}

function generateShoppingList() {
    const printout = document.getElementById('procurement-printout');
    const rows = document.getElementById('proc-rows');
    const label = document.getElementById('proc-event-label');
    const dateEl = document.getElementById('proc-date');
    if (!printout || !rows) return;

    // Set header meta
    const eventType = document.getElementById('event-pl-type')?.value || 'senioren';
    if (label) label.textContent = {
        senioren: 'Seniorenturnier', jugend: 'Jugend-Cup',
        funino: 'Funino-Event', friendly: 'Freundschaftsspiel'
    }[eventType] || eventType;
    if (dateEl) dateEl.textContent = new Date().toLocaleDateString(
        window.currentLang === 'de' ? 'de-DE' : 'en-US',
        { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
    );

    // Build size distribution from NLZ data
    const sizeMap = { g: 'XS', f: 'XS', e: 'S', d: 'S', c: 'M', b: 'L', a: 'L' };
    const kitItems = {};
    if (window.nlzAgeGroups) {
        Object.entries(window.nlzAgeGroups).forEach(([key, group]) => {
            const sz = sizeMap[key] || 'M';
            const count = group.players?.length || 0;
            kitItems[sz] = (kitItems[sz] || 0) + count;
        });
    }
    // Fallback distribution if NLZ empty
    if (Object.keys(kitItems).length === 0) {
        Object.assign(kitItems, { XS: 6, S: 8, M: 18, L: 14, XL: 4 });
    }

    rows.innerHTML = '';
    const articles = [
        { name: window.currentLang === 'de' ? 'Trainingsanzug (Stark Elite Cyan)' : 'Training Kit (Stark Elite Cyan)', type: 'kit' },
        { name: window.currentLang === 'de' ? 'Trainings-T-Shirt' : 'Training Shirt', type: 'shirt' },
        { name: window.currentLang === 'de' ? 'Shorts (Schwarz/Cyan)' : 'Shorts (Black/Cyan)', type: 'short' },
    ];

    articles.forEach(article => {
        Object.entries(kitItems).sort().forEach(([size, count]) => {
            if (count === 0) return;
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${article.name}</td><td style="color:#00ff88;font-weight:700;">${size}</td><td style="text-align:center;">${count}</td><td>Stark Elite Design</td>`;
            rows.appendChild(tr);
        });
    });

    // Show printout
    printout.classList.remove('hidden');
    printout.scrollIntoView({ behavior: 'smooth' });

    // Toni voice
    const msg = window.currentLang === 'de'
        ? `Glückwunsch, Coach. Das Turnier ist refinanziert. Die Einkaufsliste für die Trainingsanzüge liegt bereit. Gesamtbedarf: ${Object.values(kitItems).reduce((a, b) => a + b, 0)} Einheiten.`
        : `Congratulations, Coach. The tournament has been refinanced. The kit shopping list is ready. Total: ${Object.values(kitItems).reduce((a, b) => a + b, 0)} units.`;
    speakAlert(msg, 'analyst');
    addSystemLog('Shopping list generated from NLZ data.', 'green');
}

// Wire procurement button on first Event P&L open
const _origInitEventPL = typeof initEventPL === 'function' ? initEventPL : null;
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btn-procurement')?.addEventListener('click', generateShoppingList);
    document.getElementById('btn-proc-vr')?.addEventListener('click', () => {
        const vr4 = document.getElementById('vr-contract-archive') || document.getElementById('vr-s4-label');
        if (vr4) vr4.setAttribute('value', 'EINKAUFSLISTE: Generiert ✓');
        speakAlert(window.currentLang === 'de'
            ? 'Einkaufsliste wurde an VR-Screen 3 gesendet.'
            : 'Shopping list sent to VR Screen 3.', 'analyst');
    });
});

// Hook into calcEventPL to check procurement trigger
// We override the existing checkProcurementTrigger call within calcEventPL
// by observing the ev-profit element changes via MutationObserver
document.addEventListener('DOMContentLoaded', () => {
    const profEl = document.getElementById('ev-profit');
    if (profEl) {
        new MutationObserver(() => {
            const text = profEl.textContent.replace(/[^0-9,.-]/g, '').replace(',', '.');
            const profit = parseFloat(text) || 0;
            checkProcurementTrigger(profit);
        }).observe(profEl, { characterData: true, childList: true, subtree: true });
    }
});

// Enhanced CFO Advisor voice
const _advisorCheckOrig = document.getElementById('btn-advisor-check');
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btn-advisor-check')?.addEventListener('click', () => {
        const fee = +document.getElementById('advisor-fee')?.value || 0;
        const salary = +document.getElementById('advisor-salary')?.value || 0;
        const defaultCF = 24500000; // 24.5M default
        const budget = parseFloat(document.getElementById('input-budget')?.value || 0) * 1000 || defaultCF;
        const canAfford = budget >= (fee + salary);

        const msg = canAfford
            ? (window.currentLang === 'de'
                ? `Coach, der Deal ist sicher. Das NLZ-Budget bleibt unangetastet. Verfügbarer Cashflow nach Transfer: ${((budget - fee - salary) / 1e6).toFixed(1)} Millionen Euro.`
                : `Coach, this transfer is viable. NLZ budget remains untouched. Remaining cash flow: ${((budget - fee - salary) / 1e6).toFixed(1)} million Euro.`)
            : (window.currentLang === 'de'
                ? `Coach, dieser Transfer übersteigt den verfügbaren Cashflow. Handgeld und Gehalt ergeben ${((fee + salary) / 1e3).toFixed(0)} Tausend Euro Gesamtkosten.`
                : `Coach, this transfer exceeds available cash flow. Total cost of ${((fee + salary) / 1e3).toFixed(0)} thousand Euro is not covered.`);

        speakAlert(msg, 'cfo');
        const logEl = document.getElementById('advisor-log');
        if (logEl) { logEl.textContent = msg; logEl.style.color = canAfford ? '#00ff88' : '#ff4b2b'; }
        const verdict = document.getElementById('advisor-verdict');
        if (verdict) {
            verdict.textContent = canAfford ? '✓' : '✗';
            verdict.style.borderColor = canAfford ? '#00ff88' : '#ff4b2b';
            verdict.style.background = canAfford ? 'rgba(0,255,136,0.15)' : 'rgba(255,75,43,0.15)';
            verdict.style.color = canAfford ? '#00ff88' : '#ff4b2b';
        }
    }, true); // capture = true to run before V90 listener
});


// ═══════════════════════════════════════════════════════════════════════════
// V93 — MEDIA & COMMUNICATIONS HUB
// ═══════════════════════════════════════════════════════════════════════════

function initMediaHub() {
    if (window._mediaHubInitialized) return;
    window._mediaHubInitialized = true;

    // Auto-fill sponsor deck values from xG + Event P&L
    function fillSponsorDecks() {
        // Top performer from xG
        let topName = 'Spieler'; let topXG = 0;
        if (window.nlzAgeGroups) {
            let all = [];
            Object.values(window.nlzAgeGroups).forEach(g => {
                (g.players || []).forEach((p, i) => all.push({ name: p.name, xg: getOrSeedXG ? getOrSeedXG(i) : Math.random() }));
            });
            if (all.length > 0) {
                all.sort((a, b) => b.xg - a.xg);
                topName = all[0].name; topXG = all[0].xg;
            }
        }

        const revenue = (() => {
            const s = +document.getElementById('ev-sausage')?.value || 0;
            const d = +document.getElementById('ev-drinks')?.value || 0;
            const e = +document.getElementById('ev-entry')?.value || 0;
            const sp = +document.getElementById('ev-sponsor')?.value || 0;
            return s + d + e + sp;
        })();

        // Tournament deck
        const setT = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
        setT('deck-t-revenue', `€ ${revenue.toLocaleString(window.currentLang === 'de' ? 'de-DE' : 'en-US')}`);
        setT('deck-t-player', topName);
        setT('deck-t-xg', topXG.toFixed(2));

        // Equipment deck
        let totalPlayers = 0;
        if (window.nlzAgeGroups) Object.values(window.nlzAgeGroups).forEach(g => totalPlayers += (g.players || []).length);
        setT('deck-e-players', totalPlayers || '—');

        // Total NLZ players for VR Screen 4
        syncMediaToVRScreen4(`${window.currentLang === 'de' ? 'MEDIA HUB' : 'MEDIA HUB'} ✓ | ${topName}: xG ${topXG.toFixed(2)}`);
    }
    fillSponsorDecks();

    // Sponsor deck generator
    function generateDeck(type) {
        const out = document.getElementById('sponsor-deck-output');
        if (!out) return;
        const revenue = document.getElementById('deck-t-revenue')?.textContent || '—';
        const player = document.getElementById('deck-t-player')?.textContent || '—';
        const xg = document.getElementById('deck-t-xg')?.textContent || '—';
        const kits = document.getElementById('deck-e-kits')?.textContent || '50 Trainingsanzüge';
        const nlzNum = document.getElementById('deck-e-players')?.textContent || '—';

        const deckTemplates = {
            tournament: window.currentLang === 'de'
                ? `📣 SPONSORING-DECK: TURNIERPARTNER\n\n✦ Veranstaltung: Seniorenturnier – Stark Elite FC\n✦ Turnier-Einnahmen: ${revenue}\n✦ Top Performer: ${player} (xG: ${xg})\n✦ Reichweite: ~48.000 (Social), 200+ Vor-Ort-Zuschauer\n✦ Präsenzflächen: Trikot-Branding, Bandenwerbung, Stadionzeitung\n\n„Werden Sie Teil unseres Erfolgs – als offizieller Turnierpartner."`
                : `📣 SPONSORSHIP DECK: TOURNAMENT PARTNER\n\n✦ Event: Senior Tournament – Stark Elite FC\n✦ Tournament Revenue: ${revenue}\n✦ Top Performer: ${player} (xG: ${xg})\n✦ Reach: ~48,000 (Social), 200+ on-site\n✦ Visibility: Jersey branding, pitch boards, match programme\n\n"Become part of our success – as official Tournament Partner."`,
            equipment: window.currentLang === 'de'
                ? `🎽 SPONSORING-DECK: AUSRÜSTUNGSPARTNER\n\n✦ Bedarf: ${kits}\n✦ NLZ-Spieler: ${nlzNum} Talente in 7 Altersgruppen\n✦ Sichtbarkeit: Training, Turnier, Medien\n✦ Gegenwert: Logo auf allen Anzügen, NLZ-Bericht, Social-Media-Feature\n\n„Ausrüsten Sie die nächste Generation – Ihr Brand auf jedem Trikot."`
                : `🎽 SPONSORSHIP DECK: EQUIPMENT PARTNER\n\n✦ Required: ${kits}\n✦ NLZ Players: ${nlzNum} talents across 7 age groups\n✦ Visibility: Training, tournaments, media\n✦ In Return: Logo on all kits, NLZ report, social media feature\n\n"Equip the next generation – your brand on every kit."`,
        };

        out.style.display = 'block';
        out.style.whiteSpace = 'pre-wrap';
        out.style.color = '#e0c0f0';
        out.style.fontFamily = 'var(--font-mono)';
        out.textContent = deckTemplates[type] || deckTemplates.tournament;

        logPR(window.currentLang === 'de'
            ? `Sponsoring-Deck "${type}" wurde generiert.`
            : `Sponsorship deck "${type}" generated.`);
    }

    document.getElementById('btn-deck-tournament')?.addEventListener('click', () => generateDeck('tournament'));
    document.getElementById('btn-deck-equipment')?.addEventListener('click', () => generateDeck('equipment'));

    // Content Creator
    const templates = {
        match: (lang) => lang === 'de'
            ? `⚽ SPIELBERICHT — Stark Elite FC\n\nEin starker Auftritt unserer Mannschaft! Mit einer Taktischen Ausführungsqualität von über 85% dominierten wir das Geschehen von der ersten Minute.\n\nBeste Leistung: ${document.getElementById('deck-t-player')?.textContent || 'Spieler'} mit einem xG-Wert von ${document.getElementById('deck-t-xg')?.textContent || '—'}.\n\n#StarkElite #Nachwuchs #NLZ`
            : `⚽ MATCH REPORT — Stark Elite FC\n\nAnother powerful performance! With a tactical execution grade above 85%, we dominated from minute one.\n\nTop performer: ${document.getElementById('deck-t-player')?.textContent || 'Player'} with an xG of ${document.getElementById('deck-t-xg')?.textContent || '—'}.\n\n#StarkElite #Academy #YouthFootball`,
        squad: (lang) => lang === 'de'
            ? `📋 KADERBEKANNTGABE\n\nDer Kader für das kommende Wochenende steht fest. Das NLZ-Team freut sich auf den Einsatz mit ${window.nlzAgeGroups ? Object.values(window.nlzAgeGroups).reduce((s, g) => s + (g.players?.length || 0), 0) : '—'} registrierten Talenten.\n\nDetails folgen auf unseren Kanälen. #StarkElite`
            : `📋 SQUAD ANNOUNCEMENT\n\nThe squad for the upcoming weekend is confirmed. Our NLZ program features ${window.nlzAgeGroups ? Object.values(window.nlzAgeGroups).reduce((s, g) => s + (g.players?.length || 0), 0) : '—'} registered talents.\n\nFollow our channels for updates. #StarkElite`,
        sponsor: (lang) => lang === 'de'
            ? `🤝 SPONSOREN-ANKÜNDIGUNG\n\nWir begrüßen unsere neuen Partner! Ihre Unterstützung ermöglicht die Ausrüstung unserer 7 NLZ-Altersgruppen. Gemeinsam investieren wir in die Zukunft des Fußballs.\n\n#StarkElite #Sponsoring #NLZ`
            : `🤝 SPONSOR ANNOUNCEMENT\n\nWelcome to our new partners! Their support makes possible the equipment of our 7 NLZ age groups. Together we invest in the future of football.\n\n#StarkElite #Sponsor #YouthAcademy`,
        kit: (lang) => lang === 'de'
            ? `🎽 NEUE AUSRÜSTUNG!\n\nDas Turnier hat es möglich gemacht – alle NLZ-Teams erhalten neue Trainingsanzüge in Stark Elite Cyan/Schwarz! Ein großes Dankeschön an alle Beteiligten.\n\n#NeueAusrüstung #StarkElite #NLZ`
            : `🎽 NEW KIT DROP!\n\nThe tournament made it possible – all NLZ teams receive new training kits in Stark Elite Cyan/Black! A huge thank you to everyone involved.\n\n#NewKit #StarkElite #Academy`,
    };

    document.getElementById('btn-content-generate')?.addEventListener('click', () => {
        const type = document.getElementById('content-template-type')?.value || 'match';
        const text = templates[type] ? templates[type](window.currentLang) : '';
        const editor = document.getElementById('content-editor');
        const preview = document.getElementById('content-preview');
        if (editor) editor.value = text;
        if (preview) preview.textContent = text;
        logPR(window.currentLang === 'de' ? `KI-Entwurf "${type}" erstellt.` : `AI draft "${type}" created.`);
    });

    document.getElementById('content-editor')?.addEventListener('input', (e) => {
        const preview = document.getElementById('content-preview');
        if (preview) preview.textContent = e.target.value;
    });

    document.getElementById('btn-content-sync-vr')?.addEventListener('click', () => {
        const text = document.getElementById('content-editor')?.value?.slice(0, 80) || '';
        syncMediaToVRScreen4(text);
        logPR(window.currentLang === 'de' ? 'Inhalt an VR Screen 4 gesendet.' : 'Content synced to VR Screen 4.');
        speakAlert(window.currentLang === 'de'
            ? 'Media-Inhalt wurde an den VR-Management-Desk übertragen.'
            : 'Media content synced to VR Management Desk.', 'media');
    });

    document.getElementById('btn-content-print')?.addEventListener('click', () => window.print());

    // Social Analytics — AI Post Suggestion
    document.getElementById('btn-gen-post')?.addEventListener('click', () => {
        const player = document.getElementById('deck-t-player')?.textContent || 'Spieler';
        const xg = document.getElementById('deck-t-xg')?.textContent || '—';
        const post = window.currentLang === 'de'
            ? `🔥 ${player} war heute nicht zu stoppen! Mit einem xG-Wert von ${xg} hat er/sie gezeigt, warum Stark Elite die Talente der Zukunft formt. 🏆⚽\n\nFolge uns für mehr Einblicke! #StarkElite #xG #NLZ #Nachwuchs`
            : `🔥 ${player} was unstoppable today! With an xG of ${xg}, they showed why Stark Elite shapes the talents of tomorrow. 🏆⚽\n\nFollow us for more insights! #StarkElite #xG #Academy #YouthFootball`;
        const el = document.getElementById('ai-post-suggestion');
        if (el) el.textContent = post;
        logPR(window.currentLang === 'de' ? `Post-Empfehlung für ${player} generiert.` : `Post suggestion generated for ${player}.`);
    });

    // PR Briefing button
    document.getElementById('btn-pr-brief')?.addEventListener('click', () => {
        const player = document.getElementById('deck-t-player')?.textContent || 'Spieler';
        const revenue = document.getElementById('deck-t-revenue')?.textContent || '—';
        const msg = window.currentLang === 'de'
            ? `Coach, durch den Turniersieg ist die Markenpräsenz gestiegen. Top-Performer ${player} eignet sich ideal für die nächste Sponsoring-Kampagne. Turnier-Einnahmen: ${revenue}. Ich empfehle, jetzt das Sponsoring-Deck an die Partner zu senden.`
            : `Coach, the tournament success has boosted brand presence. Top performer ${player} is ideal for the next sponsorship campaign. Tournament revenue: ${revenue}. I recommend sending the sponsorship deck to partners now.`;
        speakAlert(msg, 'media');
        logPR(msg);
    });

    console.log('[V93] Media Hub initialized.');
}

function syncMediaToVRScreen4(text) {
    // Try multiple possible VR Screen 4 element IDs
    const ids = ['vr-screen4-text', 'vr-s4-content', 'vr-contract-future', 'vr-media-screen'];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.setAttribute('value', text.slice(0, 120));
    });
    // Also update the generic VR right screen if accessible
    const rightScreen = document.querySelector('[id*="screen4"], [id*="right-screen"]');
    if (rightScreen) {
        const textEl = rightScreen.querySelector('a-text');
        if (textEl) textEl.setAttribute('value', text.slice(0, 120));
    }
    console.log('[VR Screen 4] Update:', text.slice(0, 60));
}

function logPR(msg) {
    const log = document.getElementById('pr-briefing-log');
    if (!log) return;
    const div = document.createElement('div');
    div.textContent = '> PR: ' + msg;
    div.style.cssText = 'color:#e040fb;margin-top:3px;';
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
}

// Wire Media Hub to modal open
document.addEventListener('DOMContentLoaded', () => {
    const mediaModal = document.getElementById('modal-media');
    if (mediaModal) {
        new MutationObserver(muts => muts.forEach(m => {
            if (!m.target.classList.contains('hidden')) {
                initMediaHub();
                if (typeof applyLocale === 'function') applyLocale(window.currentLang || 'en');
            }
        })).observe(mediaModal, { attributes: true, attributeFilter: ['class'] });
    }
});


// ═══════════════════════════════════════════════════════════════════════════
// V94 — BRANDING STUDIO
// ═══════════════════════════════════════════════════════════════════════════

window.logoDataURL = null;
window.currentPlacement = 'chest';

function initBrandingStudio() {
    if (window._brandingInitialized) return;
    window._brandingInitialized = true;

    const dropArea = document.getElementById('logo-drop-area');
    const fileInput = document.getElementById('logo-file-input');
    const preview = document.getElementById('logo-preview');
    const prompt = document.getElementById('logo-drop-prompt');
    const canvas = document.getElementById('branding-canvas');
    const sizeSlider = document.getElementById('logo-size-slider');
    const sizeVal = document.getElementById('logo-size-val');
    const impactBar = document.getElementById('branding-impact-bar');
    const impactVal = document.getElementById('branding-impact-val');

    if (!dropArea || !canvas) return;

    // Drag-drop
    dropArea.addEventListener('click', () => fileInput?.click());
    dropArea.addEventListener('dragover', e => { e.preventDefault(); dropArea.classList.add('drag-over'); });
    dropArea.addEventListener('dragleave', () => dropArea.classList.remove('drag-over'));
    dropArea.addEventListener('drop', e => {
        e.preventDefault();
        dropArea.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file) loadLogoFile(file);
    });
    fileInput?.addEventListener('change', e => { if (e.target.files[0]) loadLogoFile(e.target.files[0]); });

    function loadLogoFile(file) {
        const reader = new FileReader();
        reader.onload = ev => {
            window.logoDataURL = ev.target.result;
            if (preview) { preview.src = ev.target.result; preview.style.display = 'block'; }
            if (prompt) prompt.style.display = 'none';
            drawBrandingPreview();
        };
        reader.readAsDataURL(file);
    }

    // Placement buttons
    document.querySelectorAll('.placement-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.placement-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            window.currentPlacement = btn.dataset.target;
            const ledOverlay = document.getElementById('led-board-overlay');
            if (window.currentPlacement === 'board') {
                ledOverlay?.classList.remove('hidden');
            } else {
                ledOverlay?.classList.add('hidden');
            }
            drawBrandingPreview();
            updateImpactScore();
        });
    });

    // Size slider
    sizeSlider?.addEventListener('input', () => {
        if (sizeVal) sizeVal.textContent = sizeSlider.value + '%';
        drawBrandingPreview();
        updateImpactScore();
    });

    // LED toggle
    document.getElementById('btn-led-toggle')?.addEventListener('click', () => {
        const ledOverlay = document.getElementById('led-board-overlay');
        const ticker = document.getElementById('led-ticker-text');
        if (ledOverlay) ledOverlay.classList.toggle('hidden');
        if (ticker && window.logoDataURL) ticker.textContent = 'STARK ELITE FC — POWERED BY SPONSOR';
    });

    // ROI Advisor
    document.getElementById('btn-roi-advisor')?.addEventListener('click', () => {
        const score = updateImpactScore();
        const placement = window.currentPlacement;
        const placements = { chest: 18, sleeve: 25, back: 12, board: 35, wall: 28 };
        const bonus = placements[placement] || 15;
        const annualValue = Math.round(score * 300);
        const msg = window.currentLang === 'de'
            ? `Coach, die Platzierung "${placement}" erreicht einen Visual Impact Score von ${score}. Das entspricht einer Sichtbarkeit von +${bonus}% in der TV-Kameraperspektive und einem Sponsorenwert von ca. ${annualValue.toLocaleString('de-DE')} € pro Saison.`
            : `Coach, the "${placement}" placement achieves a Visual Impact Score of ${score}. That represents +${bonus}% TV camera visibility and an estimated sponsor value of €${annualValue.toLocaleString()} per season.`;
        speakAlert(msg, 'media');
        const roiLog = document.getElementById('branding-roi-log');
        if (roiLog) { roiLog.style.display = 'block'; roiLog.textContent = '> ' + msg; }
        if (typeof logPR === 'function') logPR(msg);
    });

    drawBrandingPreview();
    console.log('[V94] Branding Studio initialized.');
}

function drawBrandingPreview() {
    const canvas = document.getElementById('branding-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    const placement = window.currentPlacement;
    const sizePct = parseInt(document.getElementById('logo-size-slider')?.value || 30) / 100;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#050a0f';
    ctx.fillRect(0, 0, w, h);

    // Draw schematic based on placement
    ctx.strokeStyle = 'rgba(167,139,250,0.5)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([]);

    if (placement === 'chest' || placement === 'sleeve' || placement === 'back') {
        // Kit silhouette
        ctx.beginPath();
        ctx.moveTo(w * 0.35, h * 0.08); ctx.lineTo(w * 0.18, h * 0.25);
        ctx.lineTo(w * 0.05, h * 0.22); ctx.lineTo(w * 0.08, h * 0.45);
        ctx.lineTo(w * 0.2, h * 0.45); ctx.lineTo(w * 0.2, h * 0.92);
        ctx.lineTo(w * 0.8, h * 0.92); ctx.lineTo(w * 0.8, h * 0.45);
        ctx.lineTo(w * 0.92, h * 0.45); ctx.lineTo(w * 0.95, h * 0.22);
        ctx.lineTo(w * 0.82, h * 0.25); ctx.lineTo(w * 0.65, h * 0.08);
        ctx.closePath();
        ctx.stroke();
        ctx.fillStyle = 'rgba(0,255,255,0.04)';
        ctx.fill();
        // Stars Elite stripes
        ctx.strokeStyle = 'rgba(0,255,255,0.15)';
        ctx.lineWidth = 6;
        ctx.beginPath(); ctx.moveTo(w * 0.3, h * 0.1); ctx.lineTo(w * 0.25, h * 0.9); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(w * 0.7, h * 0.1); ctx.lineTo(w * 0.75, h * 0.9); ctx.stroke();
    } else if (placement === 'board') {
        // Perimeter board rectangle
        ctx.strokeStyle = 'rgba(255,215,0,0.6)';
        ctx.lineWidth = 3;
        ctx.strokeRect(w * 0.05, h * 0.35, w * 0.9, h * 0.3);
        ctx.fillStyle = '#000';
        ctx.fillRect(w * 0.05, h * 0.35, w * 0.9, h * 0.3);
        ctx.fillStyle = '#111';
        ctx.fillRect(w * 0.06, h * 0.36, w * 0.88, h * 0.28);
    } else if (placement === 'wall') {
        // Interview wall chessboard
        const cols = 4, rows = 4;
        const cw = w / cols, ch = h / rows;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                ctx.fillStyle = (r + c) % 2 === 0 ? '#050a0f' : 'rgba(167,139,250,0.12)';
                ctx.fillRect(c * cw, r * ch, cw, ch);
            }
        }
        ctx.strokeStyle = 'rgba(167,139,250,0.3)';
        ctx.lineWidth = 0.5;
        for (let r = 0; r <= rows; r++) { ctx.beginPath(); ctx.moveTo(0, r * ch); ctx.lineTo(w, r * ch); ctx.stroke(); }
        for (let c = 0; c <= cols; c++) { ctx.beginPath(); ctx.moveTo(c * cw, 0); ctx.lineTo(c * cw, h); ctx.stroke(); }
    }

    // Draw logo if loaded
    if (window.logoDataURL) {
        const img = new Image();
        img.onload = () => {
            const logoW = w * sizePct;
            const logoH = logoW * (img.height / img.width);
            let lx, ly;
            if (placement === 'chest') { lx = w * 0.5 - logoW / 2; ly = h * 0.3; }
            else if (placement === 'sleeve') { lx = w * 0.12; ly = h * 0.25; }
            else if (placement === 'back') { lx = w * 0.5 - logoW / 2; ly = h * 0.2; }
            else if (placement === 'board') { lx = w * 0.5 - logoW / 2; ly = h * 0.5 - logoH / 2; }
            else if (placement === 'wall') { lx = w * 0.25 - logoW / 2; ly = h * 0.25 - logoH / 2; }
            else { lx = w * 0.5 - logoW / 2; ly = h * 0.4; }
            ctx.drawImage(img, lx, ly, logoW, logoH);
        };
        img.src = window.logoDataURL;
    } else {
        // Placeholder text
        ctx.fillStyle = 'rgba(167,139,250,0.3)';
        ctx.font = '11px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('← Logo hochladen', w / 2, h / 2);
    }
}

function updateImpactScore() {
    const placements = { chest: 72, sleeve: 85, back: 68, board: 90, wall: 78 };
    const sizePct = parseInt(document.getElementById('logo-size-slider')?.value || 30);
    const base = placements[window.currentPlacement] || 70;
    const score = Math.min(99, Math.round(base + sizePct * 0.15));
    const impactBar = document.getElementById('branding-impact-bar');
    const impactVal = document.getElementById('branding-impact-val');
    if (impactBar) impactBar.style.width = score + '%';
    if (impactVal) impactVal.textContent = score;
    return score;
}

// Wire Branding Studio to Media Hub tab click
document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('click', e => {
        if (e.target.dataset?.tab === 'media-branding') {
            setTimeout(initBrandingStudio, 50);
        }
    });
});


// ═══════════════════════════════════════════════════════════════════════════
// V95 — 360° PLAYER DOSSIER
// ═══════════════════════════════════════════════════════════════════════════

function initPlayerDossier() {
    if (window._dossierInitialized) return;
    window._dossierInitialized = true;

    document.getElementById('dossier-player-select')?.addEventListener('change', loadDossierData);
    document.getElementById('btn-master-advice')?.addEventListener('click', generateMasterAdvice);
    document.getElementById('btn-generate-expose')?.addEventListener('click', generatePlayerDossierPDF);
    loadDossierData();
    console.log('[V95] 360° Player Dossier initialized.');
}

function loadDossierData() {
    const idx = parseInt(document.getElementById('dossier-player-select')?.value || 0);

    // Pull data from live modules
    const bodyFat = parseFloat(document.getElementById('slider-bodyfat')?.value) || 9.2 + idx * 0.3;
    const hrv = parseInt(document.getElementById('slider-hrv')?.value) || 75 - idx * 3;
    const recovery = parseInt(document.getElementById('slider-recovery')?.value) || 82 - idx * 2;
    const reaction = parseInt(document.getElementById('input-reaction')?.value) || 148 + idx * 5;
    const xg = (getOrSeedXG ? getOrSeedXG(idx) : (0.3 + idx * 0.07)).toFixed(2);
    const forceLeft = parseInt(document.getElementById('slider-force-left')?.value) || 520 - idx * 20;
    const forceRight = parseInt(document.getElementById('slider-force-right')?.value) || 500 - idx * 15;
    const asym = forceLeft > 0 ? Math.abs(((forceLeft - forceRight) / forceLeft) * 100).toFixed(1) : '—';

    // Player names from NLZ or defaults
    const names = ['Musiala', 'Sané', 'Kimmich', 'Gnabry', 'Müller', 'Goretzka'];
    const playerName = names[idx] || `Spieler ${idx + 1}`;

    // Contract + financial mock data
    const months = [6, 12, 18, 24, 36];
    const salaries = [85000, 120000, 95000, 75000, 110000];
    const markets = [25, 38, 42, 18, 31];
    const contractExpiry = months[idx % months.length];
    const salary = (salaries[idx % salaries.length]).toLocaleString(window.currentLang === 'de' ? 'de-DE' : 'en-US');
    const marketVal = markets[idx % markets.length];

    // Formation roles
    const roles = ['FW / 9', 'AM / 10', 'CM / 8', 'WM / LW', 'SS / 10', 'CM / 6'];
    const role = roles[idx % roles.length];

    // Update DOM
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('dossier-player-name', playerName);
    set('dq-bodyfat', bodyFat.toFixed(1) + '%');
    set('dq-hrv', hrv + ' ms');
    set('dq-asym', asym + '%');
    set('dq-recovery', recovery + '%');
    set('dq-xg', xg);
    set('dq-role', role);
    set('dq-press', (65 + idx * 4) + '%');
    set('dq-last5', ((parseFloat(xg) * 0.85) + Math.random() * 0.05).toFixed(2));
    set('dq-contract', contractExpiry + (window.currentLang === 'de' ? ' Mon.' : ' mo.'));
    set('dq-salary', '€ ' + salary);
    set('dq-marketval', '€ ' + marketVal + 'M');
    set('dq-brand', updateImpactScore ? updateImpactScore() : '—');
    set('dq-reaction', reaction + ' ms');
    set('dq-dual', (74 + idx * 3) + '%');
    set('dq-cogstress', (4 + idx * 0.5).toFixed(1) + '/10');
    set('dq-form', ['⭐⭐⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐⭐⭐', '⭐⭐⭐', '⭐⭐⭐⭐'][idx % 5]);

    // Nagelsmann alert
    const alertActive = bodyFat > 10.5 || hrv < 60;
    const alertBadge = document.getElementById('dq-alert-badge');
    if (alertBadge) alertBadge.style.display = alertActive ? 'block' : 'none';

    // OVR
    const attrs = [
        parseInt(document.getElementById('slider-pac')?.value) || (70 + idx * 2),
        parseInt(document.getElementById('slider-sho')?.value) || (72 + idx * 2),
        parseInt(document.getElementById('slider-pas')?.value) || (75 + idx),
        parseInt(document.getElementById('slider-dri')?.value) || (80 - idx),
        parseInt(document.getElementById('slider-def')?.value) || (50 + idx * 3),
        parseInt(document.getElementById('slider-phy')?.value) || (68 + idx)
    ];
    const ovr = Math.round(attrs.reduce((a, b) => a + b, 0) / attrs.length);
    set('dossier-ovr', ovr);

    // Draw radar
    drawDossierRadar(attrs);

    // Store for PDF
    window._currentDossierData = { playerName, bodyFat, hrv, asym, recovery, xg, role, contractExpiry, salary, marketVal, ovr, reaction, idx };
}

function drawDossierRadar(attrs) {
    const canvas = document.getElementById('dossier-radar-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    const cx = w / 2, cy = h / 2, r = Math.min(w, h) * 0.38;
    const labels = ['PAC', 'SHO', 'PAS', 'DRI', 'DEF', 'PHY'];
    const n = labels.length;

    ctx.clearRect(0, 0, w, h);

    // Grid rings
    [0.25, 0.5, 0.75, 1.0].forEach(ring => {
        ctx.beginPath();
        for (let i = 0; i < n; i++) {
            const angle = (Math.PI * 2 * i / n) - Math.PI / 2;
            const x = cx + Math.cos(angle) * r * ring;
            const y = cy + Math.sin(angle) * r * ring;
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = 'rgba(167,139,250,0.15)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
    });

    // Axes + labels
    labels.forEach((label, i) => {
        const angle = (Math.PI * 2 * i / n) - Math.PI / 2;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y);
        ctx.strokeStyle = 'rgba(167,139,250,0.2)'; ctx.lineWidth = 0.5; ctx.stroke();
        ctx.fillStyle = '#888'; ctx.font = '9px monospace'; ctx.textAlign = 'center';
        ctx.fillText(label, cx + Math.cos(angle) * (r + 14), cy + Math.sin(angle) * (r + 14) + 3);
    });

    // Data polygon
    ctx.beginPath();
    attrs.forEach((v, i) => {
        const angle = (Math.PI * 2 * i / n) - Math.PI / 2;
        const rv = Math.max(0, Math.min(99, v)) / 99;
        const x = cx + Math.cos(angle) * r * rv;
        const y = cy + Math.sin(angle) * r * rv;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = 'rgba(167,139,250,0.25)';
    ctx.strokeStyle = '#a78bfa';
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();

    // Dots
    attrs.forEach((v, i) => {
        const angle = (Math.PI * 2 * i / n) - Math.PI / 2;
        const rv = Math.max(0, Math.min(99, v)) / 99;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(angle) * r * rv, cy + Math.sin(angle) * r * rv, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#a78bfa'; ctx.fill();
    });
}

function generateMasterAdvice() {
    const d = window._currentDossierData;
    if (!d) return;
    const alertFlag = d.bodyFat > 10.5 || d.hrv < 60;
    const xgEff = Math.round(parseFloat(d.xg) * 100);
    const brandScore = updateImpactScore ? updateImpactScore() : 75;
    const contractUrgency = d.contractExpiry <= 12 ? (window.currentLang === 'de' ? 'DRINGEND' : 'URGENT') : (window.currentLang === 'de' ? 'stabil' : 'stable');

    const msg = window.currentLang === 'de'
        ? `Coach, ${d.playerName} zeigt eine xG-Effizienz von ${xgEff}%.${alertFlag ? ' Achtung: Belastungswarnung im kardialen Bereich aktiv.' : ' Medizinische Freigabe: OK.'} Sein Marktwert ist durch das Branding-Placement um ${Math.round(brandScore * 0.03)}% gestiegen. Vertragslage: ${contractUrgency} (noch ${d.contractExpiry} Monate). Empfehlung: ${d.contractExpiry <= 12 ? 'Jetzt verlängern.' : 'Scouting-Position halten.'}`
        : `Coach, ${d.playerName} shows an xG efficiency of ${xgEff}%.${alertFlag ? ' WARNING: Active cardiac load alert.' : ' Medical clearance: OK.'} Market value increased by ${Math.round(brandScore * 0.03)}% via branding placement. Contract status: ${contractUrgency} (${d.contractExpiry} months remaining). Recommendation: ${d.contractExpiry <= 12 ? 'Renew now.' : 'Hold scouting position.'}`;

    speakAlert(msg, 'analyst');
    const log = document.getElementById('dossier-advice-log');
    if (log) { log.textContent = '> ' + msg; log.style.color = '#a78bfa'; }
}


// ═══════════════════════════════════════════════════════════════════════════
// V96 — PDF EXPORT ENGINE (jsPDF)
// ═══════════════════════════════════════════════════════════════════════════

function generatePlayerDossierPDF() {
    if (typeof window.jspdf === 'undefined' && typeof jspdf === 'undefined') {
        console.warn('[PDF] jsPDF not loaded');
        // Fallback: print CSS
        window.print();
        return;
    }

    const { jsPDF } = window.jspdf || jspdf;
    const d = window._currentDossierData || { playerName: 'Player', ovr: '—', xg: '—' };
    const lang = window.currentLang || 'en';
    const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    const W = pdf.internal.pageSize.getWidth();
    const H = pdf.internal.pageSize.getHeight();

    // ── PAGE 1: Executive Cover ───────────────────────────────────────────
    pdf.setFillColor(5, 10, 15);       // #050a0f
    pdf.rect(0, 0, W, H, 'F');

    // Cyan accent bar
    pdf.setFillColor(0, 255, 255);
    pdf.rect(0, 0, 4, H, 'F');

    // Header
    pdf.setTextColor(0, 255, 255);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.text('STARK ELITE OS', 12, 14);
    pdf.setTextColor(80, 80, 80);
    pdf.setFontSize(7);
    pdf.text(`${lang === 'de' ? 'ERSTELLT' : 'GENERATED'}: ${new Date().toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-US')}`, 12, 19);

    // Player name
    pdf.setTextColor(167, 139, 250);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text(d.playerName || 'Player', 12, 40);

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(11);
    pdf.text(`OVR: ${d.ovr}`, 12, 50);

    // Radar chart embed
    const radarCanvas = document.getElementById('dossier-radar-canvas');
    if (radarCanvas) {
        try {
            const imgData = radarCanvas.toDataURL('image/png');
            pdf.addImage(imgData, 'PNG', W - 80, 25, 68, 68);
        } catch (e) { console.warn('Radar canvas cross-origin:', e); }
    }

    // Rule
    pdf.setDrawColor(0, 255, 255);
    pdf.setLineWidth(0.3);
    pdf.line(12, 58, W - 12, 58);

    // ── DATA SECTION ────────────────────────────────────────────────────
    const sections = lang === 'de' ? [
        {
            title: '🩺 MEDIZIN', color: [0, 255, 255], data: [
                ['Körperfettanteil', (d.bodyFat?.toFixed?.(1) || '—') + '%'],
                ['HRV-Basiswert', (d.hrv || '—') + ' ms'],
                ['Erholungsindex', (d.recovery || '—') + '%'],
                ['Asymmetrie-Index', (d.asym || '—') + '%'],
            ]
        },
        {
            title: '⚽ TAKTIK', color: [0, 255, 136], data: [
                ['Erwartete Tore (xT)', d.xg || '—'],
                ['Formations-Rolle', d.role || '—'],
                ['Reaktionszeit', (d.reaction || '—') + ' ms'],
            ]
        },
        {
            title: '💰 FINANZEN', color: [255, 215, 0], data: [
                ['Restvertrag', (d.contractExpiry || '—') + ' Monate'],
                ['Gehalt', '€ ' + (d.salary || '—')],
                ['Marktwert', '€ ' + (d.marketVal || '—') + 'M'],
            ]
        },
        {
            title: '📡 BRANDING', color: [224, 64, 251], data: [
                ['Visual Impact Score', (window._brandingImpactScore || updateImpactScore?.() || '—')],
                ['Platzierung', window.currentPlacement || 'chest'],
            ]
        },
    ] : [
        {
            title: '🩺 MEDIZIN', color: [0, 255, 255], data: [
                ['Body Fat', (d.bodyFat?.toFixed?.(1) || '—') + '%'],
                ['HRV-Basis', (d.hrv || '—') + ' ms'],
                ['Recovery Index', (d.recovery || '—') + '%'],
                ['Asymmetry', (d.asym || '—') + '%'],
            ]
        },
        {
            title: '⚽ TAKTIK', color: [0, 255, 136], data: [
                ['Expected Goals (xG)', d.xg || '—'],
                ['Formation Role', d.role || '—'],
                ['Reaction Time', (d.reaction || '—') + ' ms'],
            ]
        },
        {
            title: '💰 FINANZEN', color: [255, 215, 0], data: [
                ['Contract Remaining', (d.contractExpiry || '—') + ' months'],
                ['Salary', '€ ' + (d.salary || '—')],
                ['Market Value', '€ ' + (d.marketVal || '—') + 'M'],
            ]
        },
        {
            title: '📡 BRANDING', color: [224, 64, 251], data: [
                ['Visual Impact Score', (updateImpactScore?.() || '—')],
                ['Placement', window.currentPlacement || 'chest'],
            ]
        },
    ];

    let y = 68;
    sections.forEach((sec, si) => {
        pdf.setFillColor(...sec.color.map(c => Math.round(c * 0.15)));
        pdf.rect(12, y, W - 24, 6, 'F');
        pdf.setTextColor(...sec.color);
        pdf.setFontSize(8); pdf.setFont('helvetica', 'bold');
        pdf.text(sec.title, 14, y + 4.5);
        y += 8;
        sec.data.forEach(([label, val]) => {
            pdf.setTextColor(140, 140, 140); pdf.setFontSize(7); pdf.setFont('helvetica', 'normal');
            pdf.text(label, 14, y);
            pdf.setTextColor(255, 255, 255); pdf.setFont('helvetica', 'bold');
            pdf.text(String(val), W - 14, y, { align: 'right' });
            y += 5.5;
        });
        y += 3;
    });

    // ── AI CHIEF ANALYST SUMMARY ─────────────────────────────────────────
    if (y < H - 50) {
        pdf.setDrawColor(167, 139, 250);
        pdf.line(12, y, W - 12, y); y += 6;
        pdf.setTextColor(167, 139, 250); pdf.setFontSize(8); pdf.setFont('helvetica', 'bold');
        pdf.text(lang === 'de' ? 'KI-CHEFANALYST — BERICHT FÜR VORSTAND' : 'AI CHIEF ANALYST — BOARD REPORT', 12, y); y += 5;

        const alertFlag = (d.bodyFat || 0) > 10.5;
        const summary = lang === 'de'
            ? `${d.playerName} zeigt eine xG-Steigerung mit einem aktuellen Wert von ${d.xg}. ${alertFlag ? 'Leichte Belastungswarnung im kardialen Bereich.' : 'Medizinische Freigabe: OK.'} Marktwert: € ${d.marketVal}M. Vertrag läuft in ${d.contractExpiry} Monaten aus. Empfehlung: ${(d.contractExpiry || 12) <= 12 ? 'Verlängern' : 'Halten/Beobachten'}.`
            : `${d.playerName} shows an xG of ${d.xg}. ${alertFlag ? 'Slight cardiac load warning active.' : 'Medical clearance: OK.'} Market value: €${d.marketVal}M. Contract expires in ${d.contractExpiry} months. Recommendation: ${(d.contractExpiry || 12) <= 12 ? 'Renew' : 'Hold/Monitor'}.`;

        pdf.setTextColor(200, 200, 200); pdf.setFontSize(7); pdf.setFont('helvetica', 'normal');
        const lines = pdf.splitTextToSize(summary, W - 24);
        pdf.text(lines, 12, y); y += lines.length * 4;
    }

    // Footer
    pdf.setTextColor(40, 40, 40); pdf.setFontSize(6);
    pdf.text('STARK ELITE OS — CONFIDENTIAL', W / 2, H - 6, { align: 'center' });
    pdf.setDrawColor(40, 40, 40);
    pdf.line(12, H - 9, W - 12, H - 9);

    // Save PDF
    const filename = `StarkElite_Dossier_${(d.playerName || 'Player').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
    pdf.save(filename);

    // VR floating doc simulation
    const vrDoc = document.getElementById('vr-pdf-preview');
    if (!vrDoc) {
        const scene = document.querySelector('a-scene');
        if (scene) {
            const plane = document.createElement('a-plane');
            plane.setAttribute('id', 'vr-pdf-preview');
            plane.setAttribute('position', '0 1.8 -2.5');
            plane.setAttribute('width', '1.2'); plane.setAttribute('height', '1.5');
            plane.setAttribute('color', '#050a0f');
            plane.setAttribute('opacity', '0.95');
            const txt = document.createElement('a-text');
            txt.setAttribute('value', `EXPOSÉ: ${d.playerName}\nOVR: ${d.ovr}\nxG: ${d.xg}\n${new Date().toLocaleDateString()}`);
            txt.setAttribute('align', 'center'); txt.setAttribute('color', '#a78bfa');
            txt.setAttribute('position', '0 0.2 0.01'); txt.setAttribute('width', '1.4');
            plane.appendChild(txt);
            const closeBtn = document.createElement('a-text');
            closeBtn.setAttribute('value', '[ CLOSE ]'); closeBtn.setAttribute('color', '#ff4b2b');
            closeBtn.setAttribute('position', '0 -0.6 0.01'); closeBtn.setAttribute('align', 'center');
            closeBtn.setAttribute('width', '1');
            closeBtn.addEventListener('click', () => plane.parentNode?.removeChild(plane));
            plane.appendChild(closeBtn);
            scene.appendChild(plane);
            setTimeout(() => plane.parentNode?.removeChild(plane), 15000);
        }
    }

    addSystemLog(`PDF generated: ${filename}`, 'green');
    speakAlert(lang === 'de'
        ? `Das Exposé für ${d.playerName} wurde erstellt und steht zum Download bereit.`
        : `The dossier for ${d.playerName} has been generated and is ready for download.`, 'analyst');
}

// Wire Dossier to modal open
document.addEventListener('DOMContentLoaded', () => {
    const dossierModal = document.getElementById('modal-dossier');
    if (dossierModal) {
        new MutationObserver(muts => muts.forEach(m => {
            if (!m.target.classList.contains('hidden')) {
                initPlayerDossier();
                if (typeof applyLocale === 'function') applyLocale(window.currentLang || 'en');
            }
        })).observe(dossierModal, { attributes: true, attributeFilter: ['class'] });
    }
});


// ═══════════════════════════════════════════════════════════════════════════
// V97 — ELITE TTS ENGINE + GERMAN COACHING VOCABULARY
// ═══════════════════════════════════════════════════════════════════════════

// ── German genitive declension for player names ───────────────────────────
function germanGenitive(name) {
    if (!name) return name;
    // Names ending in s/x/z: just apostrophe (Musiala's → Musialas)
    if (/[sxzß]$/i.test(name)) return name + '\u2019';
    return name + 's';
}

// Elite DE vocabulary substitution map
const eliteVocabDE = {
    //'Body Fat':          'Körperfettanteil (Fettanalyse)',  // handled by i18n
    'Ruhepuls': 'Ruheherzfrequenz',
    'Heart Rate': 'Herzfrequenz',
    'Body Composition': 'Körperzusammensetzung',
    'Half-Space': 'Halbraum',
    'Half Space': 'Halbraum',
    'half-space': 'Halbraum',
    'Pressing': 'Gegenpressing',
    'Verticality': 'Tiefengang',
    'Vertical Play': 'Vertikalspiel',
    'Transition': 'Umschaltspiel',
    'Expected Goals': 'xG-Effizienz',
    'xG': 'xG-Wert',
    'Executive Briefing': 'Management-Zusammenfassung',
    'Market Value': 'Marktwert',
    'Recovery Index': 'Erholungsrate',
    'Cognitive Load': 'kognitive Belastung',
    'Dual Task': 'Doppelaufgaben-Performance',
    'Formation': 'Ordnung',
    'Pitch': 'Spielfeld',
    'Build-Up': 'Spielaufbau',
    'High Press': 'Hochpressing',
    'Set Piece': 'Standardsituation',
    'Sprint': 'Antrieb',
};

function applyEliteVocab(text) {
    let result = text;
    Object.entries(eliteVocabDE).forEach(([en, de]) => {
        result = result.replace(new RegExp(en, 'gi'), de);
    });
    return result;
}

// ── Elite TTS briefing templates ──────────────────────────────────────────
const eliteBriefings = {
    // CMO briefings
    cmoHighBodyFat: (name, val) => window.currentLang === 'de'
        ? `Coach, die Fettanalyse bei ${name} liegt bei ${val.toFixed(1)} Prozent – das überschreitet unseren Schwellenwert. Wir müssen die Belastungsnorm für die nächsten 72 Stunden reduzieren und die Ernährungsplanung anpassen.`
        : `Coach, body composition analysis for ${name} shows ${val.toFixed(1)}% body fat – threshold exceeded. We need to reduce training load for 72 hours and adjust the nutrition plan.`,

    cmoLowHRV: (name, val) => window.currentLang === 'de'
        ? `Coach, die kardiale Last bei ${germanGenitive(name)} HRV-Wert ist auf ${val} Millisekunden gesunken. Klar roter Bereich. Intensität drosseln, aktive Regeneration priorisieren.`
        : `Coach, ${name}'s HRV has dropped to ${val}ms – clearly critical range. Throttle intensity, prioritize active recovery.`,

    cmoOK: (name) => window.currentLang === 'de'
        ? `Coach, alle Vitalwerte bei ${name} im grünen Bereich. Medizinische Freigabe erteilt. Vollbelastung möglich.`
        : `Coach, all vitals for ${name} are in the green zone. Medical clearance granted. Full training load approved.`,

    // Tactical briefings
    tacXGExcellent: (name, xg, beat) => window.currentLang === 'de'
        ? `Die xG-Effizienz bei ${name} ist exzellent – ${xg} Wert schlägt das Modell um ${beat} Prozent. Weiter so, diese Form in den Halbräumen ausnutzen.`
        : `${name}'s xG efficiency is excellent – value of ${xg} beats the model by ${beat}%. Keep leveraging this form in the half-spaces.`,

    tacXGLow: (name, xg) => window.currentLang === 'de'
        ? `Coach, ${germanGenitive(name)} xG-Wert ist rückläufig – aktuell ${xg}. Wir sehen zu wenig Tiefengang und zu viele Abschlüsse aus dem Rückraum. Positionstraining empfohlen.`
        : `Coach, ${name}'s xG is declining – currently ${xg}. We see too little vertical play and too many shots from deep. Positional training recommended.`,

    // Analyst daily briefing
    analystDailyDE: (top, grade, alerts) =>
        `Management-Zusammenfassung: Beste xG-Effizienz heute bei ${top}. Taktische Ausführungsqualität: ${grade} Prozent – das Umschaltspiel funktioniert. ${alerts.length > 0 ? 'Achtung: Medizinische Warnmeldungen für ' + alerts.join(' und ') + '.' : 'Keine medizinischen Warnmeldungen.'}`,

    analystDailyEN: (top, grade, alerts) =>
        `Daily summary: Top xG efficiency from ${top}. Tactical execution grade: ${grade}% – transitions working well. ${alerts.length > 0 ? 'Warning: Medical alerts for ' + alerts.join(' and ') + '.' : 'No medical alerts.'}`,

    // CFO Advisor
    cfoApproveDE: (name, remaining) =>
        `Coach, der Transfer von ${name} ist finanziell sauber gedeckt. Das NLZ-Budget bleibt unangetastet. Verbleibender Cashflow nach Abschluss: ${remaining} Millionen Euro.`,

    cfoApproveEN: (name, remaining) =>
        `Coach, the acquisition of ${name} is financially sound. NLZ budget remains untouched. Remaining cash flow post-deal: ${remaining} million Euro.`,

    cfoDeclineDE: (name, gap) =>
        `Coach, dieser Deal für ${name} geht nicht auf. Wir sind ${gap} Millionen Euro short. Neuverhandlung oder Zahlungsstruktur prüfen.`,

    cfoDeclineEN: (name, gap) =>
        `Coach, this deal for ${name} doesn't add up. We're ${gap} million Euro short. Consider renegotiating or adjusting the payment structure.`,

    // Media Director PR
    prTournamentDE: (player, revenue) =>
        `Coach, durch den Turniererfolg ist unsere Markenpräsenz signifikant gestiegen. ${germanGenitive(player)} Performance eignet sich ideal als Anker für das neue Sponsoring-Deck. Turnier-Einnahmen: ${revenue}. Empfehlung: Deck jetzt an die Partner senden – das Momentum ist optimal.`,

    prTournamentEN: (player, revenue) =>
        `Coach, tournament success has significantly boosted our brand presence. ${player}'s performance is ideal for the new sponsorship deck. Revenue: ${revenue}. Recommendation: send the deck to partners now – the momentum is perfect.`,
};

window.eliteBriefings = eliteBriefings;

// ── Upgraded speakAlert — V97 Neural Profile ──────────────────────────────
function speakAlertV97(text, persona) {
    if (!window.speechSynthesis) return;

    const lang = window.currentLang;

    // Apply elite vocabulary in German mode
    let finalText = lang === 'de' ? applyEliteVocab(text) : text;

    // Prosody injection via punctuation/pauses
    // Insert natural pauses around numbers and critical values
    finalText = finalText
        .replace(/(\d+[,.]\d+)/g, '... $1 ...')  // pause around decimal numbers
        .replace(/(\d{2,})\s*(Prozent|%)/g, '$1 Prozent')
        .replace(/(\d+)\s*(ms|Millisekunden)/g, '$1 Millisekunden')
        .replace(/€\s*(\d)/g, '... Euro $1');     // pause before Euro amounts

    const utter = new SpeechSynthesisUtterance(finalText);

    // Voice selection — prefer high-quality neural voices
    const waitForVoices = () => {
        const voices = speechSynthesis.getVoices();
        if (voices.length === 0) {
            setTimeout(waitForVoices, 100);
            return;
        }

        if (lang === 'de') {
            // Priority: neural/premium DE voices first, including macOS Safari specific voices
            const deVoice =
                voices.find(v => v.lang === 'de-DE' && /siri|premium|neural|enhanced|google/i.test(v.name)) ||
                voices.find(v => v.lang === 'de-DE' && /anna|markus/i.test(v.name)) ||
                voices.find(v => v.lang === 'de-DE' && v.localService === false) ||
                voices.find(v => v.lang === 'de-DE' && !/werner|fallback/i.test(v.name)) ||
                voices.find(v => v.lang === 'de-DE') ||
                voices.find(v => v.lang.startsWith('de'));

            if (deVoice) utter.voice = deVoice;
            utter.lang = 'de-DE';

            // Persona-based prosody tuning
            const prosody = {
                cmo: { rate: 0.88, pitch: 0.95 },  // calm, authoritative
                analyst: { rate: 0.92, pitch: 1.0 },  // confident
                cfo: { rate: 0.85, pitch: 0.9 },  // deliberate, precise
                media: { rate: 0.95, pitch: 1.05 },  // energetic
                advisor: { rate: 0.9, pitch: 0.95 },  // advisory
                analysis: { rate: 0.9, pitch: 1.0 },  // analytical
            };
            const p = prosody[persona] || { rate: 0.9, pitch: 1.0 };
            utter.rate = p.rate;
            utter.pitch = p.pitch;

        } else {
            const enVoice =
                voices.find(v => v.lang === 'en-US' && /siri|premium|neural|enhanced|google/i.test(v.name)) ||
                voices.find(v => v.lang === 'en-GB' && /siri|premium|neural|enhanced/i.test(v.name)) ||
                voices.find(v => v.lang.startsWith('en') && /samantha|daniel/i.test(v.name)) ||
                voices.find(v => v.lang === 'en-US' && v.localService === false) ||
                voices.find(v => v.lang === 'en-US');

            if (enVoice) utter.voice = enVoice;
            utter.lang = 'en-US';

            const prosody = {
                cmo: { rate: 0.92, pitch: 1.0 },
                analyst: { rate: 0.95, pitch: 1.0 },
                cfo: { rate: 0.88, pitch: 0.95 },
                media: { rate: 1.0, pitch: 1.05 },
                advisor: { rate: 0.92, pitch: 1.0 },
                analysis: { rate: 0.95, pitch: 1.0 },
            };
            const p = prosody[persona] || { rate: 0.93, pitch: 1.0 };
            utter.rate = p.rate;
            utter.pitch = p.pitch;
        }

        utter.volume = 1.0;

        // Log to system
        if (typeof addSystemLog === 'function') {
            addSystemLog(`[TTS/${persona?.toUpperCase() || 'TONI'}] ${text.slice(0, 80)}...`, 'cyan');
        }

        speechSynthesis.cancel();
        speechSynthesis.speak(utter);
    };

    // Some browsers need a delay for voices to load
    if (speechSynthesis.getVoices().length > 0) {
        waitForVoices();
    } else {
        speechSynthesis.onvoiceschanged = waitForVoices;
        setTimeout(waitForVoices, 250);
    }
}

// Override speakAlert globally with V97 version
window.speakAlert = speakAlertV97;

// ── Update elite German TTS across all existing functions ─────────────────
// Patch key briefing generators to use elite language
const _origBuildBriefingTTS = typeof buildBriefingTTS === 'function' ? buildBriefingTTS : null;
function buildBriefingTTSV97(b) {
    const lang = window.currentLang;
    const top3 = b.top3 || [];
    const topName = top3[0]?.name || (lang === 'de' ? 'unbekannt' : 'unknown');
    const topXG = top3[0]?.xg?.toFixed(2) || '—';
    const grade = b.tacticalGrade || '—';
    const alerts = (b.alerts || []).map(a => a.split(' ')[0]);

    if (lang === 'de') {
        return eliteBriefings.analystDailyDE(topName, grade, alerts);
    }
    return eliteBriefings.analystDailyEN(topName, grade, alerts);
}
window.buildBriefingTTS = buildBriefingTTSV97;

// Upgrade generateMasterAdvice to use elite language
const _origGenerateMasterAdvice = typeof generateMasterAdvice === 'function' ? generateMasterAdvice : null;
function generateMasterAdviceV97() {
    const d = window._currentDossierData;
    if (!d) return;

    const alertFlag = (d.bodyFat || 0) > 10.5;
    const lowHRV = (d.hrv || 80) < 60;
    const xgFloat = parseFloat(d.xg) || 0;
    const xgBeat = Math.round((xgFloat - 0.25) / 0.25 * 100);
    const brandScore = typeof updateImpactScore === 'function' ? updateImpactScore() : 75;
    const contractUrgent = (d.contractExpiry || 24) <= 12;

    let msg;
    if (window.currentLang === 'de') {
        const medPart = alertFlag
            ? `Achtung: Die kardiale Last bei ${d.playerName} ist im kritischen Bereich – HRV ${d.hrv} ms, Fettanalyse ${(d.bodyFat || 0).toFixed(1)}%. Belastungsreduktion zwingend.`
            : `Medizinische Freigabe für ${d.playerName}: vollständig im grünen Bereich.`;

        const tacPart = xgFloat > 0.35
            ? `${germanGenitive(d.playerName)} xG-Effizienz von ${d.xg} schlägt unser Modell${xgBeat > 0 ? ' um ' + xgBeat + ' Prozent' : ''}. Die Halbräume werden optimal genutzt.`
            : `xG-Wert bei ${d.playerName} rückläufig – aktuell ${d.xg}. Mehr Tiefengang im Vertikalspiel erforderlich.`;

        const finPart = contractUrgent
            ? `Vertragswarnung: Noch ${d.contractExpiry} Monate. Marktwert ${d.marketVal} Mio. – jetzt verlängern, solange das Umschaltspiel stark ist.`
            : `Vertragslage stabil: ${d.contractExpiry} Monate. Branding-Placement erhöht den Sponsorenwert um geschätzte ${Math.round(brandScore * 0.03)} Prozent.`;

        msg = `Coach: ${medPart} ${tacPart} ${finPart} Gesamtempfehlung: ${contractUrgent ? 'Vertrag verlängern.' : 'Position halten.'}`;
    } else {
        const medPart = alertFlag
            ? `Warning: ${d.playerName}'s cardiac load is in the critical zone – HRV ${d.hrv}ms, body fat ${(d.bodyFat || 0).toFixed(1)}%. Mandatory load reduction.`
            : `Medical clearance for ${d.playerName}: fully in the green zone.`;

        const tacPart = xgFloat > 0.35
            ? `${d.playerName}'s xG efficiency of ${d.xg} beats our model${xgBeat > 0 ? ' by ' + xgBeat + '%' : ''}. Half-space utilization is optimal.`
            : `${d.playerName}'s xG is declining – at ${d.xg}. More vertical play depth required.`;

        const finPart = contractUrgent
            ? `Contract alert: ${d.contractExpiry} months remaining. Market value €${d.marketVal}M – renew now while transition metrics are strong.`
            : `Contract stable: ${d.contractExpiry} months. Branding placement increases sponsor value by ~${Math.round(brandScore * 0.03)}%.`;

        msg = `Coach: ${medPart} ${tacPart} ${finPart} Overall recommendation: ${contractUrgent ? 'Renew contract now.' : 'Hold current position.'}`;
    }

    speakAlert(msg, 'analyst');
    const log = document.getElementById('dossier-advice-log');
    if (log) { log.textContent = '> ' + msg; log.style.color = '#a78bfa'; }
}
window.generateMasterAdvice = generateMasterAdviceV97;

// Patch Nagelsmann alert voice with elite CMO language
function nagelsmannAlertVoiceElite() {
    const bodyFat = parseFloat(document.getElementById('slider-bodyfat')?.value) || 9.5;
    const hrv = parseInt(document.getElementById('slider-hrv')?.value) || 75;
    const playerName = document.getElementById('dossier-player-name')?.textContent || 'Spieler';

    if (bodyFat > 10.5) {
        speakAlert(eliteBriefings.cmoHighBodyFat(playerName, bodyFat), 'cmo');
    } else if (hrv < 60) {
        speakAlert(eliteBriefings.cmoLowHRV(playerName, hrv), 'cmo');
    } else {
        speakAlert(eliteBriefings.cmoOK(playerName), 'cmo');
    }
}

// Override CMO briefing button if it exists
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btn-cmo-brief')?.addEventListener('click', nagelsmannAlertVoiceElite, true);
});


// ═══════════════════════════════════════════════════════════════════════════
// V98 — RESEARCH INTELLIGENCE PANEL + VERIFIED SOURCE LINKS
// ═══════════════════════════════════════════════════════════════════════════

// Source link database per player name
const researchSources = {
    default: [
        { label: 'Transfermarkt', url: 'https://www.transfermarkt.de/schnellsuche/ergebnis/schnellsuche?query=' },
        { label: 'Kicker', url: 'https://www.kicker.de/search?q=' },
        { label: 'FBref', url: 'https://fbref.com/search/search.fcgi?search=' },
        { label: 'Sofascore', url: 'https://www.sofascore.com/search/' },
    ],
    // Player-specific curated links
    'Wirtz': [
        { label: 'Transfermarkt — Wirtz Profil', url: 'https://www.transfermarkt.de/florian-wirtz/profil/spieler/521580' },
        { label: 'FBref — Wirtz Stats', url: 'https://fbref.com/en/players/1c5eb0b7/Florian-Wirtz' },
        { label: 'Kicker — Wirtz Artikel', url: 'https://www.kicker.de/florian-wirtz/spieler' },
        { label: 'Sofascore — Wirtz', url: 'https://www.sofascore.com/player/florian-wirtz/900037' },
    ],
    'Musiala': [
        { label: 'Transfermarkt — Musiala', url: 'https://www.transfermarkt.de/jamal-musiala/profil/spieler/580195' },
        { label: 'FBref — Musiala', url: 'https://fbref.com/en/players/21a66f6a/Jamal-Musiala' },
    ],
    'Sané': [
        { label: 'Transfermarkt — Sané', url: 'https://www.transfermarkt.de/leroy-sane/profil/spieler/243714' },
        { label: 'FBref — Sané', url: 'https://fbref.com/en/players/0d6d93a7/Leroy-Sane' },
    ],
};

// Simulated live form data (tagged [SIM] — clearly marked)
const simulatedFormData = {
    'Wirtz': {
        xg_last2: 0.71,
        goals_last2: 1,
        assists_last2: 2,
        duels_won: 68,
        progressive_carries: 14,
        form_trend: '+',
        market_value: '€ 130M',
        internal_xg: 0.58,
        deviation: '+22%',
        note_de: 'Externes Modell (+22%) liegt über interner xG-Projektion — Wirtz nutzt aktuell Halbräume überdurchschnittlich.',
        note_en: 'External model (+22%) exceeds internal xG projection — Wirtz is currently exploiting half-spaces above average.',
    },
};

function getSimData(playerName) {
    const key = Object.keys(simulatedFormData).find(k => playerName.includes(k));
    return key ? simulatedFormData[key] : null;
}

function getSourceLinks(playerName) {
    const key = Object.keys(researchSources).find(k => k !== 'default' && playerName.includes(k));
    if (key) return researchSources[key];
    // Build generic links using player name
    return researchSources.default.map(s => ({
        label: s.label,
        url: s.url + encodeURIComponent(playerName),
    }));
}

function renderResearchPanel(playerName) {
    // Inject into 360° Dossier if open
    let panel = document.getElementById('research-panel');
    if (!panel) {
        const dossier = document.getElementById('dossier-advice-log');
        if (!dossier || !dossier.parentNode) return;
        panel = document.createElement('div');
        panel.id = 'research-panel';
        panel.style.cssText = 'margin-top: 10px; border: 1px solid rgba(0,255,255,0.2); border-radius: 4px; padding: 10px; background: rgba(0,8,20,0.9);';
        dossier.parentNode.insertBefore(panel, dossier.nextSibling);
    }

    const sim = getSimData(playerName);
    const links = getSourceLinks(playerName);
    const lang = window.currentLang;

    let html = `<div style="font-family: var(--font-heading); font-size: 0.6rem; color: var(--accent-cyan); margin-bottom: 6px; letter-spacing: 1px;">
        🔍 ${lang === 'de' ? 'RESEARCH INTELLIGENCE' : 'RESEARCH INTELLIGENCE'}
        <span style="font-size: 0.5rem; color: #ff4b2b; margin-left: 8px; border: 1px solid #ff4b2b; padding: 1px 4px; border-radius: 2px;">⚠ SIM-DATEN — KEIN LIVE-ZUGRIFF</span>
    </div>`;

    if (sim) {
        html += `<div style="display: grid; grid-template-columns: repeat(3,1fr); gap: 6px; margin-bottom: 8px;">
            <div class="social-metric" style="padding:6px;">
                <div class="sm-label">xG letzte 2 Spiele <span style="color:#ff4b2b;font-size:0.5rem;">[SIM]</span></div>
                <div class="sm-value" style="font-size:1.1rem;color:var(--accent-cyan);">${sim.xg_last2}</div>
            </div>
            <div class="social-metric" style="padding:6px;">
                <div class="sm-label">Tore + Assists <span style="color:#ff4b2b;font-size:0.5rem;">[SIM]</span></div>
                <div class="sm-value" style="font-size:1.1rem;color:#00ff88;">${sim.goals_last2}G / ${sim.assists_last2}A</div>
            </div>
            <div class="social-metric" style="padding:6px;">
                <div class="sm-label">Externe vs. intern <span style="color:#ff4b2b;font-size:0.5rem;">[SIM]</span></div>
                <div class="sm-value" style="font-size:1.1rem;color:#ffd700;">${sim.deviation}</div>
            </div>
        </div>
        <div style="font-size:0.65rem; color:#aaa; margin-bottom:8px; border-left: 2px solid rgba(0,255,255,0.3); padding-left: 6px;">
            ${lang === 'de' ? sim.note_de : sim.note_en}
        </div>`;
    }

    // Source links
    html += `<div style="font-family: var(--font-heading); font-size: 0.58rem; color: #555; margin-bottom: 4px;">
        ${lang === 'de' ? 'VERIFIZIERTE QUELLEN:' : 'VERIFIED SOURCES:'}
    </div>
    <div style="display: flex; flex-wrap: wrap; gap: 5px;">`;
    links.forEach(link => {
        html += `<a href="${link.url}" target="_blank" rel="noopener"
            style="font-size:0.6rem; font-family:var(--font-mono); color:var(--accent-cyan);
                   border:1px solid rgba(0,255,255,0.3); padding:2px 7px; border-radius:3px;
                   text-decoration:none; transition: all 0.2s;"
            onmouseover="this.style.borderColor='#00ffff';this.style.background='rgba(0,255,255,0.08)'"
            onmouseout="this.style.borderColor='rgba(0,255,255,0.3)';this.style.background='transparent'"
            >🔗 ${link.label}</a>`;
    });
    html += '</div>';

    panel.innerHTML = html;
}

// ── Wirtz Test Briefing ───────────────────────────────────────────────────
function wirtzFormBriefingDE() {
    const sim = simulatedFormData['Wirtz'];
    const msg =
        `Coach, hier ist der Kurzbericht zur Formkurve von Florian Wirtz aus den letzten zwei Pflichtspielen. ` +
        `xG-Effizienz: ${sim.xg_last2} – das liegt deutlich über dem Saisonschnitt. ` +
        `Ein Tor, zwei Torvorlagen. Duelle gewonnen: ${sim.duels_won} Prozent. ` +
        `Progressive Carries: ${sim.progressive_carries} – klarer Aufwärtstrend im Vertikalspiel. ` +
        `Externes Marktwert-Modell: ${sim.market_value}. ` +
        `Abweichung zu unserem internen xG-Wert: plus 22 Prozent – Wirtz nutzt die Halbräume aktuell außergewöhnlich effektiv. ` +
        `Empfehlung: Vollbelastung beibehalten. Keine Einschränkungen notwendig.`;

    speakAlert(msg, 'analyst');

    const log = document.getElementById('dossier-advice-log');
    if (log) {
        log.innerHTML = `<div style="color:#a78bfa;">
            > RESEARCH BRIEFING [${new Date().toLocaleTimeString('de-DE')}]<br>
            <span style="color:#ccc; font-size:0.68rem; line-height:1.6;">${msg.replace(/\. /g, '.<br>')}</span><br>
            <span style="font-size:0.58rem; color:#555;">
                Quellen: <a href="https://www.transfermarkt.de/florian-wirtz/profil/spieler/521580" target="_blank" style="color:var(--accent-cyan);">Transfermarkt</a> ·
                <a href="https://fbref.com/en/players/1c5eb0b7/Florian-Wirtz" target="_blank" style="color:var(--accent-cyan);">FBref</a> ·
                <a href="https://www.kicker.de/florian-wirtz/spieler" target="_blank" style="color:var(--accent-cyan);">Kicker</a>
                <span style="color:#ff4b2b;"> [SIM-Daten, kein Live-Zugriff]</span>
            </span>
        </div>`;
        log.scrollTop = log.scrollHeight;
    }

    renderResearchPanel('Wirtz');
    addSystemLog('[V98] Wirtz Formkurven-Briefing abgeschlossen.', 'cyan');
}

// ── Voice command extension ───────────────────────────────────────────────
const _origHandleLeadAnalyst = typeof handleLeadAnalystCommand === 'function' ? handleLeadAnalystCommand : null;
function handleLeadAnalystCommandV98(upper) {
    if ((upper.includes('WIRTZ') || upper.includes('FORMKURVE')) && upper.includes('BERICHT')) {
        wirtzFormBriefingDE();
        return true;
    }
    if (upper.includes('RESEARCH') || upper.includes('RECHERCHE')) {
        const name = window._currentDossierData?.playerName || 'Spieler';
        renderResearchPanel(name);
        speakAlert(
            window.currentLang === 'de'
                ? `Research-Panel für ${name} geöffnet. Alle Quellen sind verlinkt und verifiziert. Hinweis: Daten basieren auf internem Modell.`
                : `Research panel opened for ${name}. All sources linked and verified. Note: data is based on internal model.`,
            'analyst'
        );
        return true;
    }
    if (_origHandleLeadAnalyst) return _origHandleLeadAnalyst(upper);
    return false;
}
window.handleLeadAnalystCommand = handleLeadAnalystCommandV98;

// Auto-render research panel when Dossier player changes
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('dossier-player-select')?.addEventListener('change', () => {
        const name = document.getElementById('dossier-player-name')?.textContent || '';
        if (name && name !== '—') setTimeout(() => renderResearchPanel(name), 200);
    });
    // Wirtz Briefing Button (adds inline to dossier if available)
    const masterBtn = document.getElementById('btn-master-advice');
    if (masterBtn && !document.getElementById('btn-wirtz-test')) {
        const wirtzBtn = document.createElement('button');
        wirtzBtn.id = 'btn-wirtz-test';
        wirtzBtn.className = 'cyber-btn';
        wirtzBtn.style.cssText = 'font-size:0.6rem;border-color:#00ffff;color:#00ffff;margin-left:6px;';
        wirtzBtn.textContent = '🔍 WIRTZ BERICHT';
        wirtzBtn.addEventListener('click', wirtzFormBriefingDE);
        masterBtn.parentNode?.insertBefore(wirtzBtn, masterBtn.nextSibling);
    }
});


// ═══════════════════════════════════════════════════════════════════════════
// V99 — LIVE DATA PROXY CLIENT + [LIVE]/[SIM] BADGE SYSTEM
// ═══════════════════════════════════════════════════════════════════════════

const PROXY_BASE = 'http://localhost:3001';
window._proxyOnline = false;

// ── Probe proxy health on startup ─────────────────────────────────────────
async function checkProxyHealth() {
    try {
        const resp = await fetch(`${PROXY_BASE}/health`, { signal: AbortSignal.timeout(2000) });
        if (resp.ok) {
            const data = await resp.json();
            window._proxyOnline = true;
            addCredibilityLog('✅', 'Stark Elite Proxy V99', 'ONLINE', `${PROXY_BASE}/health`, 'system');
            console.log('[V99] Proxy online:', data);
            // Update research panel badge
            document.querySelectorAll('.proxy-status-badge').forEach(el => {
                el.textContent = '🟢 LIVE PROXY ONLINE';
                el.style.color = '#00ff88';
                el.style.borderColor = '#00ff88';
            });
            return true;
        }
    } catch {/* proxy not running */ }
    window._proxyOnline = false;
    console.log('[V99] Proxy offline — SIM mode active');
    return false;
}

// ── Credibility Log ───────────────────────────────────────────────────────
function addCredibilityLog(icon, sourceName, tag, url, type) {
    const logEl = document.getElementById('system-log') || document.getElementById('voice-log');
    if (!logEl) return;

    const ts = new Date().toLocaleTimeString(window.currentLang === 'de' ? 'de-DE' : 'en-US');
    const row = document.createElement('div');
    row.style.cssText = 'font-size: 0.6rem; font-family: var(--font-mono); padding: 2px 0; border-bottom: 1px solid rgba(255,255,255,0.04); display: flex; gap: 6px; align-items: center;';

    const tagColor = tag === 'LIVE' ? '#00ff88' : tag === 'SIM' ? '#ffd700' : '#888';
    row.innerHTML = `
        <span style="color:${tagColor};font-weight:700;min-width:36px;">[${tag}]</span>
        <span style="color:#555;">${ts}</span>
        <span style="color:#ccc;">${icon} ${sourceName}</span>
        ${url ? `<a href="${url}" target="_blank" rel="noopener" style="color:rgba(0,255,255,0.7);text-decoration:none;font-size:0.55rem;">[Quelle ↗]</a>` : ''}
    `;
    logEl.insertBefore(row, logEl.firstChild);
    // Cap log at 40 entries
    while (logEl.children.length > 40) logEl.removeChild(logEl.lastChild);
}

// ── Fetch Kicker News ─────────────────────────────────────────────────────
async function fetchKickerNews(query = '') {
    const panel = document.getElementById('kicker-news-panel');

    if (!window._proxyOnline) {
        // SIM fallback
        const simNews = [
            { title: `[SIM] ${query || 'Fußball'}: Aktuelle Entwicklungen im Blick`, link: `https://www.kicker.de/search?q=${encodeURIComponent(query)}`, pubDate: new Date().toISOString(), tag: 'SIM' },
            { title: `[SIM] Bundesliga-Analyse: Pressing-Statistiken im Vergleich`, link: 'https://www.kicker.de', pubDate: new Date().toISOString(), tag: 'SIM' },
        ];
        renderNewsItems(simNews, panel);
        return;
    }

    try {
        const resp = await fetch(`${PROXY_BASE}/kicker/news?q=${encodeURIComponent(query)}`);
        const data = await resp.json();
        if (data.ok && data.items) {
            renderNewsItems(data.items, panel);
            addCredibilityLog('📰', 'Kicker', 'LIVE', 'https://newsfeed.kicker.de/news/fussball', 'kicker');
        }
    } catch (err) {
        console.warn('[V99] Kicker fetch failed:', err.message);
    }
}

function renderNewsItems(items, panel) {
    if (!panel) return;
    panel.innerHTML = items.slice(0, 5).map(item => {
        const tagColor = item.tag === 'LIVE' ? '#00ff88' : '#ffd700';
        const ts = item.pubDate ? new Date(item.pubDate).toLocaleString(window.currentLang === 'de' ? 'de-DE' : 'en-US') : '';
        return `<div style="padding: 5px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
            <span style="font-size:0.5rem;color:${tagColor};font-weight:700;font-family:var(--font-heading);">[${item.tag || 'NEWS'}]</span>
            <span style="font-size:0.55rem;color:#555;margin-left:4px;">${ts}</span><br>
            <a href="${item.link}" target="_blank" rel="noopener"
               style="font-size:0.68rem;color:#ccc;text-decoration:none;line-height:1.4;display:block;margin-top:2px;"
               onmouseover="this.style.color='#00ffff'" onmouseout="this.style.color='#ccc'">
                ${item.title}
            </a>
        </div>`;
    }).join('');
}

// ── Fetch player data (proxy or SIM) ─────────────────────────────────────
async function fetchPlayerLiveData(playerName) {
    let data, tag;

    if (window._proxyOnline) {
        try {
            const resp = await fetch(`${PROXY_BASE}/simulate/player?name=${encodeURIComponent(playerName)}`);
            const json = await resp.json();
            if (json.ok) { data = json.data; tag = json.tag; }
        } catch { /* fall through to SIM */ }
    }

    if (!data) {
        // Pure client-side SIM
        const seed = playerName.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
        const r = (min, max) => +(min + ((seed * 9301 + 49297) % 233280) / 233280 * (max - min)).toFixed(2);
        data = {
            xg_last5: r(0.2, 0.9), goals_last5: Math.floor(r(1, 6)),
            assists_last5: Math.floor(r(0, 4)), duels_won_pct: r(45, 75),
            progressive_carries: Math.floor(r(6, 20)), market_value_m: Math.floor(r(15, 120)),
            contract_months: Math.floor(r(6, 36)), form_trend: r(0, 1) > 0.5 ? '+' : '-',
        };
        tag = 'SIM';
    }

    // Update research panel live metrics
    updateResearchMetrics(playerName, data, tag);
    addCredibilityLog('👤', playerName, tag,
        tag === 'LIVE' ? `${PROXY_BASE}/simulate/player?name=${encodeURIComponent(playerName)}` : null,
        'player');
    return { data, tag };
}

function updateResearchMetrics(name, data, tag) {
    const tagColor = tag === 'LIVE' ? '#00ff88' : '#ffd700';
    const tagBadge = `<span style="color:${tagColor};font-size:0.5rem;font-weight:700;font-family:var(--font-heading);"> [${tag}]</span>`;

    const set = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = val;
    };

    // Update dossier financial quadrant with live market value
    const mvEl = document.getElementById('dq-marketval');
    if (mvEl) mvEl.innerHTML = `€ ${data.market_value_m}M${tagBadge}`;

    const contractEl = document.getElementById('dq-contract');
    if (contractEl) contractEl.innerHTML = `${data.contract_months} ${window.currentLang === 'de' ? 'Mon.' : 'mo.'}${tagBadge}`;

    // Update research panel stats
    const panel = document.getElementById('research-panel');
    if (panel) {
        const statGrid = panel.querySelector('.research-stat-grid');
        if (statGrid) {
            statGrid.innerHTML = `
                <div class="social-metric" style="padding:6px;">
                    <div class="sm-label">xG letzte 5${tagBadge}</div>
                    <div class="sm-value" style="font-size:1.1rem;color:var(--accent-cyan);">${data.xg_last5}</div>
                </div>
                <div class="social-metric" style="padding:6px;">
                    <div class="sm-label">G/A${tagBadge}</div>
                    <div class="sm-value" style="font-size:1.1rem;color:#00ff88;">${data.goals_last5}G/${data.assists_last5}A</div>
                </div>
                <div class="social-metric" style="padding:6px;">
                    <div class="sm-label">Marktwert${tagBadge}</div>
                    <div class="sm-value" style="font-size:1.1rem;color:#ffd700;">€${data.market_value_m}M</div>
                </div>`;
        }
    }
}

// ── Wire into Dossier & Research Panel ───────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    // Probe proxy on load
    await checkProxyHealth();

    // Inject Kicker news panel + status badge into Research panel
    const dossierModal = document.getElementById('modal-dossier');
    if (dossierModal) {
        new MutationObserver(async muts => {
            for (const m of muts) {
                if (!m.target.classList.contains('hidden')) {
                    // Add proxy status badge
                    let badge = document.getElementById('proxy-status-badge');
                    if (!badge) {
                        badge = document.createElement('div');
                        badge.id = 'proxy-status-badge';
                        badge.className = 'proxy-status-badge';
                        badge.style.cssText = 'font-size:0.55rem;font-family:var(--font-heading);color:#ff4b2b;border:1px solid #ff4b2b;padding:1px 6px;border-radius:3px;display:inline-block;margin-bottom:6px;';
                        badge.textContent = window._proxyOnline ? '🟢 LIVE PROXY ONLINE' : '🟡 SIM MODE (proxy offline)';
                        if (window._proxyOnline) { badge.style.color = '#00ff88'; badge.style.borderColor = '#00ff88'; }
                        const advLog = document.getElementById('dossier-advice-log');
                        if (advLog?.parentNode) advLog.parentNode.insertBefore(badge, advLog);
                    }

                    // Load player data
                    const name = document.getElementById('dossier-player-name')?.textContent || 'Musiala';
                    await fetchPlayerLiveData(name);
                    await fetchKickerNews(name);

                    // Inject Kicker news section if not present
                    if (!document.getElementById('kicker-news-panel')) {
                        const newsWrap = document.createElement('div');
                        newsWrap.style.cssText = 'margin-top:10px;border:1px solid rgba(255,100,0,0.2);border-radius:4px;padding:10px;background:rgba(0,8,20,0.9);';
                        newsWrap.innerHTML = `<div style="font-family:var(--font-heading);font-size:0.6rem;color:#ff6600;margin-bottom:6px;">📰 KICKER NEWS${window._proxyOnline ? ' <span style="color:#00ff88;font-size:0.5rem;">[LIVE]</span>' : ' <span style="color:#ffd700;font-size:0.5rem;">[SIM]</span>'}</div>
                            <div id="kicker-news-panel" style="max-height:120px;overflow-y:auto;">Loading...</div>`;
                        const panel = document.getElementById('research-panel');
                        if (panel) panel.appendChild(newsWrap);
                    }
                }
            }
        }).observe(dossierModal, { attributes: true, attributeFilter: ['class'] });
    }

    // Re-fetch when player switches
    document.getElementById('dossier-player-select')?.addEventListener('change', async () => {
        await new Promise(r => setTimeout(r, 250)); // wait for loadDossierData
        const name = document.getElementById('dossier-player-name')?.textContent || '';
        if (name && name !== '—') {
            await fetchPlayerLiveData(name);
            await fetchKickerNews(name);
        }
    });
});


// ═══════════════════════════════════════════════════════════════════════════
// V100 — TONI ONBOARDING + SHOPPING ENGINE + RED BULLETIN STATS
// ═══════════════════════════════════════════════════════════════════════════

// ── Toni Voice Onboarding ─────────────────────────────────────────────────
function initToniOnboarding() {
    const storedName = localStorage.getItem('toniUserName');
    if (storedName) {
        window.userName = storedName;
        greetReturningUser(storedName);
        return;
    }

    const overlay = document.getElementById('toni-onboarding');
    if (!overlay) return;
    overlay.style.display = 'flex';

    const msg = document.getElementById('onboard-msg');
    const nameWrap = document.getElementById('onboard-name-wrap');

    // Step 1: Greeting
    const greeting = 'Hallo. Ich bin Toni — dein persönlicher Analyse-Assistent der Stark Elite Suite. Ich koordiniere Medizin, Taktik, Finanzen und Scouting in Echtzeit. Gemeinsam treffen wir bessere Entscheidungen.';
    let i = 0;
    msg.textContent = '';
    const typeInterval = setInterval(() => {
        msg.textContent += greeting[i++];
        if (i >= greeting.length) {
            clearInterval(typeInterval);
            // Speak then ask for name
            speakAlert(greeting, 'analyst');
            setTimeout(() => {
                const q = 'Mit wem habe ich das Vergnügen?';
                msg.textContent = q;
                speakAlert(q, 'analyst');
                setTimeout(() => {
                    if (nameWrap) nameWrap.style.display = 'block';
                    document.getElementById('onboard-name-input')?.focus();
                }, 1800);
            }, greeting.length * 18 + 600);
        }
    }, 18);

    // Confirm name
    function confirmName() {
        const name = document.getElementById('onboard-name-input')?.value.trim();
        if (!name) return;
        window.userName = name;
        localStorage.setItem('toniUserName', name);
        const welcome = `Willkommen, ${name}. Stark Elite ist bereit. Viel Erfolg heute.`;
        msg.textContent = welcome;
        if (nameWrap) nameWrap.style.display = 'none';
        speakAlert(welcome, 'analyst');
        setTimeout(() => overlay.style.display = 'none', 3500);
        updateHeaderWithName(name);
    }

    document.getElementById('onboard-name-btn')?.addEventListener('click', confirmName);
    document.getElementById('onboard-name-input')?.addEventListener('keydown', e => { if (e.key === 'Enter') confirmName(); });
}

function skipOnboarding() {
    document.getElementById('toni-onboarding').style.display = 'none';
}
window.skipOnboarding = skipOnboarding;

function greetReturningUser(name) {
    if (window.isGreeted) return;
    window.isGreeted = true;

    window.userName = name;
    const hour = new Date().getHours();
    const timeGreet = hour < 12 ? 'Guten Morgen' : hour < 17 ? 'Guten Tag' : 'Guten Abend';
    const msg = `${timeGreet}, ${name}. Stark Elite Suite aktiv. Alle Systeme nominal.`;
    setTimeout(() => speakAlert(msg, 'analyst'), 2000);
    updateHeaderWithName(name);
}

function updateHeaderWithName(name) {
    // Inject name badge into header
    let badge = document.getElementById('user-name-badge');
    if (!badge) {
        badge = document.createElement('div');
        badge.id = 'user-name-badge';
        badge.style.cssText = 'font-family:var(--font-heading);font-size:0.6rem;color:#b8c5d6;letter-spacing:1px;border:1px solid rgba(204,0,0,0.3);padding:3px 10px;border-radius:12px;';
        document.querySelector('.status-bar')?.appendChild(badge);
    }
    badge.textContent = `👤 ${name.toUpperCase()}`;
}

// Per-module briefings for page sections
const moduleBriefings = {
    management: (lang) => lang === 'de'
        ? 'Willkommen im Management-Zentrum. Hier steuerst du Finanzen, Infrastruktur, Verträge und Event-Planung. Die KI hilft dir, Transfers gegen den Cashflow zu prüfen und Einkaufslisten automatisch zu generieren.'
        : 'Welcome to the Management Center. Here you control finances, infrastructure, contracts and event planning. AI assists with transfer checks against cash flow and automated procurement.',
    medical: (lang) => lang === 'de'
        ? 'Das medizinische Labor. Körperfett, Herzfrequenz, Asymmetrie — alle Vitalwerte deiner Spieler auf einen Blick. Nagelsmann-Alerts melden sich automatisch, wenn Grenzwerte überschritten werden.'
        : 'The medical laboratory. Body composition, heart rate, asymmetry — all player vitals at a glance. Nagelsmann alerts fire automatically when thresholds are exceeded.',
    tactic: (lang) => lang === 'de'
        ? 'Das taktische Kommandozentrum. Steuere Formation, Vertikalspiel und Pressing-Intensität. Im VR-Modus kannst du Spieler in Echtzeit auf dem Spielfeld positionieren.'
        : 'The tactical command center. Control formation, vertical play, and pressing intensity. In VR mode you can position players on the pitch in real time.',
    media: (lang) => lang === 'de'
        ? 'Das Media- und Kommunikations-Hub. Generiere Sponsoring-Decks, erstelle Spielberichte und verfolge deine Social-Media-Reichweite. KI-gestützte Post-Empfehlungen auf Knopfdruck.'
        : 'The media and communications hub. Generate sponsorship decks, create match reports and track social reach. AI-driven post recommendations on demand.',
};

function speakModuleBriefing(module) {
    const text = moduleBriefings[module]?.(window.currentLang || 'de');
    if (text) speakAlert(text, 'analyst');
}
window.speakModuleBriefing = speakModuleBriefing;

// Inject briefing buttons on module headers
document.addEventListener('DOMContentLoaded', () => {
    const moduleMap = {
        'modal-management': 'management',
        'modal-medical': 'medical',
        'modal-tactic': 'tactic',
        'modal-media': 'media',
    };
    Object.entries(moduleMap).forEach(([modalId, mod]) => {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        const h2 = modal.querySelector('h2');
        if (!h2) return;
        const briefBtn = document.createElement('button');
        briefBtn.className = 'cyber-btn';
        briefBtn.style.cssText = 'font-size:0.55rem;border-color:rgba(204,0,0,0.4);color:#cc0000;padding:2px 8px;margin-left:8px;';
        briefBtn.textContent = '🎙️ INTRO';
        briefBtn.addEventListener('click', () => speakModuleBriefing(mod));
        h2.appendChild(briefBtn);
    });
});

// ── Red Bulletin Editorial Stats Update ──────────────────────────────────
function updateRBStats() {
    // Player count from NLZ
    let players = 0;
    if (window.nlzAgeGroups) {
        Object.values(window.nlzAgeGroups).forEach(g => players += (g.players || []).length);
    }
    const setRB = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setRB('rb-stat-players', players > 0 ? players : '—');

    // Avg xG
    const xgVals = Object.values(window.xgDB || {});
    const avgXG = xgVals.length > 0 ? (xgVals.reduce((s, v) => s + v, 0) / xgVals.length).toFixed(2) : '—';
    setRB('rb-stat-xg', avgXG);

    // Fit players (HRV ok)
    const hrv = parseInt(document.getElementById('slider-hrv')?.value) || 75;
    const fit = hrv >= 60 ? (players > 0 ? players : '✓') : '⚠';
    setRB('rb-stat-fit', fit);
}
setInterval(updateRBStats, 3000);
document.addEventListener('DOMContentLoaded', () => setTimeout(updateRBStats, 1000));


// ═══════════════════════════════════════════════════════════════════════════
// V100 — SHOPPING ENGINE
// ═══════════════════════════════════════════════════════════════════════════

const shopDB = {
    tracksuit: [
        { shop: 'Amazon', name: 'Adidas Tiro 23 Training Suit', price_unit: 26.99, url: 'https://www.amazon.de/s?k=trainingsanzug+herren+adidas+tiro', logo: '🛒' },
        { shop: 'SportScheck', name: 'Nike Academy Pro Tracksuit', price_unit: 29.95, url: 'https://www.sportscheck.com/sportarten/fussball/bekleidung/trainingsanzuege/', logo: '🏪' },
        { shop: 'Decathlon', name: 'Kipsta F900 Football Training Suit', price_unit: 19.99, url: 'https://www.decathlon.de/search?Ntt=trainingsanzug+fussball', logo: '🏬' },
    ],
    jersey: [
        { shop: 'Amazon', name: 'Adidas Teamwear Jersey Custom', price_unit: 18.99, url: 'https://www.amazon.de/s?k=fussball+trikot+teamwear', logo: '🛒' },
        { shop: 'SportScheck', name: 'Nike Dri-FIT Academy Jersey', price_unit: 22.95, url: 'https://www.sportscheck.com/sportarten/fussball/bekleidung/trikots/', logo: '🏪' },
        { shop: 'Decathlon', name: 'Kipsta F500 Football Jersey', price_unit: 9.99, url: 'https://www.decathlon.de/search?Ntt=fussball+trikot', logo: '🏬' },
    ],
    shorts: [
        { shop: 'Amazon', name: 'Adidas Tiro 23 Training Shorts', price_unit: 12.99, url: 'https://www.amazon.de/s?k=fussball+shorts+adidas', logo: '🛒' },
        { shop: 'SportScheck', name: 'Nike Academy Pro Shorts', price_unit: 14.95, url: 'https://www.sportscheck.com/sportarten/fussball/bekleidung/hosen/', logo: '🏪' },
        { shop: 'Decathlon', name: 'Kipsta F500 Football Shorts', price_unit: 6.99, url: 'https://www.decathlon.de/search?Ntt=fussball+shorts', logo: '🏬' },
    ],
    ball: [
        { shop: 'Amazon', name: 'Adidas Tiro Club Training Ball (6er)', price_unit: 15.99, url: 'https://www.amazon.de/s?k=fussball+training+adidas', logo: '🛒' },
        { shop: 'SportScheck', name: 'Nike Academy Team Football', price_unit: 17.95, url: 'https://www.sportscheck.com/sportarten/fussball/baelle/', logo: '🏪' },
        { shop: 'Decathlon', name: 'Kipsta F550 Training Football', price_unit: 8.99, url: 'https://www.decathlon.de/search?Ntt=fussball+spielball', logo: '🏬' },
    ],
    gloves: [
        { shop: 'Amazon', name: 'Reusch Attrakt Starter GK Gloves', price_unit: 22.99, url: 'https://www.amazon.de/s?k=torwart+handschuhe', logo: '🛒' },
        { shop: 'SportScheck', name: 'adidas Predator Pro FS Gloves', price_unit: 34.95, url: 'https://www.sportscheck.com/sportarten/fussball/torwart/', logo: '🏪' },
        { shop: 'Decathlon', name: 'Kipsta F500 Shield Goalkeeper Gloves', price_unit: 12.99, url: 'https://www.decathlon.de/search?Ntt=torwart+handschuhe', logo: '🏬' },
    ],
};

function initShoppingEngine() {
    if (window._shoppingInitialized) return;
    window._shoppingInitialized = true;

    document.getElementById('btn-shop-search')?.addEventListener('click', runShoppingSearch);
    console.log('[V100] Shopping Engine initialized.');
}

function runShoppingSearch() {
    const type = document.getElementById('shop-item-type')?.value || 'tracksuit';
    const qty = parseInt(document.getElementById('shop-qty')?.value || 15);
    const items = shopDB[type] || shopDB.tracksuit;
    const grid = document.getElementById('shopping-grid');
    const bestBuyDiv = document.getElementById('shopping-bestbuy');
    const bestContent = document.getElementById('bestbuy-content');
    const logEl = document.getElementById('shopping-toni-log');

    if (!grid) return;

    // Sort by price ascending
    const sorted = [...items].sort((a, b) => a.price_unit - b.price_unit);
    const best = sorted[0];

    grid.innerHTML = items.map((item, idx) => {
        const isBest = item.shop === best.shop;
        const total = (item.price_unit * qty).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
        const unit = item.price_unit.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
        return `<div class="shop-card${isBest ? ' best-buy' : ''}">
            <div class="shop-name">${item.logo} ${item.shop.toUpperCase()}${isBest ? ' ⭐' : ''}</div>
            <div class="shop-product">${item.name}</div>
            <div class="shop-price">${total}</div>
            <div class="shop-unit-price">${unit} pro Stück × ${qty}</div>
            <a class="shop-link-btn" href="${item.url}" target="_blank" rel="noopener">🔗 ZUM SHOP [↗]</a>
        </div>`;
    }).join('');

    // Best buy summary
    if (bestBuyDiv && bestContent) {
        bestBuyDiv.style.display = 'block';
        const totalBest = (best.price_unit * qty).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
        bestContent.innerHTML = `<b>${best.shop}</b> — ${best.name}<br>Gesamt für ${qty} Stück: <b style="color:#f5c400;">${totalBest}</b> (${best.price_unit.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })} / Stück)`;
    }

    // Toni voice recommendation
    const bestTotal = (best.price_unit * qty).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
    const msg = window.currentLang === 'de'
        ? `Coach, bestes Preis-Leistungs-Verhältnis bei ${best.shop}: ${qty} ${type === 'tracksuit' ? 'Trainingsanzüge' : 'Artikel'} für ${bestTotal}. Das sind ${best.price_unit.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })} pro Stück — empfehle diesen Anbieter.`
        : `Coach, best value at ${best.shop}: ${qty} items for ${bestTotal}. That's ${best.price_unit.toLocaleString('en-US', { style: 'currency', currency: 'EUR' })} per unit — recommend this supplier.`;

    if (logEl) logEl.textContent = '> ' + msg;
    speakAlert(msg, 'cfo');
}

// Wire Shopping to modal open
document.addEventListener('DOMContentLoaded', () => {
    const shopModal = document.getElementById('modal-shopping');
    if (shopModal) {
        new MutationObserver(muts => muts.forEach(m => {
            if (!m.target.classList.contains('hidden')) {
                initShoppingEngine();
                if (typeof applyLocale === 'function') applyLocale(window.currentLang || 'de');
            }
        })).observe(shopModal, { attributes: true, attributeFilter: ['class'] });
    }
});

// Wire procurement btn to open shopping panel
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btn-procurement')?.addEventListener('click', () => {
        // Also open shopping comparison
        const shopModal = document.getElementById('modal-shopping');
        if (shopModal) {
            shopModal.classList.remove('hidden');
            setTimeout(initShoppingEngine, 100);
        }
    }, false);

    // V109: Auto-trigger Procurement Logic and simulate Market Value Tracker when CFO Suite opens
    const mgmtModal = document.getElementById('modal-management');
    if (mgmtModal) {
        let mvInterval;
        new MutationObserver(muts => muts.forEach(m => {
            if (!m.target.classList.contains('hidden')) {
                // Auto-trigger shopping search
                if (typeof runShoppingSearch === 'function') setTimeout(runShoppingSearch, 500);

                // Simulate Transfermarkt Market Value
                const mvEl = document.getElementById('val-market-value');
                if (mvEl && !mvInterval) {
                    let currentVal = 845.5;
                    mvInterval = setInterval(() => {
                        const change = (Math.random() * 2 - 0.9).toFixed(1); // Slight upward bias
                        currentVal = Math.max(0, currentVal + parseFloat(change));
                        mvEl.textContent = currentVal.toFixed(1);
                        mvEl.style.color = change >= 0 ? '#00ff88' : '#ff4b2b';
                        setTimeout(() => mvEl.style.color = 'var(--accent-cyan)', 500);
                    }, 4000);
                }
            } else {
                if (mvInterval) { clearInterval(mvInterval); mvInterval = null; }
            }
        })).observe(mgmtModal, { attributes: true, attributeFilter: ['class'] });
    }
});

// ── Launch onboarding on page load ────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initToniOnboarding, 1200);
});


// ═══════════════════════════════════════════════════════════════════════════
// V101 — SPEECH RECOGNITION (STT) ENGINE
// ═══════════════════════════════════════════════════════════════════════════

let _sttRecognition = null;
let _sttActive = false;

function initSTT(onResult, onError) {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
        console.warn('[STT] Web Speech API not supported in this browser.');
        if (onError) onError('not_supported');
        return null;
    }

    _sttRecognition = new SpeechRec();
    _sttRecognition.lang = 'de-DE';
    _sttRecognition.continuous = false;
    _sttRecognition.interimResults = true;
    _sttRecognition.maxAlternatives = 3;

    _sttRecognition.onstart = () => {
        _sttActive = true;
        document.getElementById('stt-icon')?.classList.add('stt-active');
        showSubtitle('🎤 Ich höre...');
    };

    _sttRecognition.onresult = (event) => {
        let interim = '', final = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const t = event.results[i][0].transcript;
            if (event.results[i].isFinal) final += t;
            else interim += t;
        }
        showSubtitle(final || interim);
        if (final && onResult) onResult(final.trim());
    };

    _sttRecognition.onerror = (event) => {
        _sttActive = false;
        document.getElementById('stt-icon')?.classList.remove('stt-active');
        hideSubtitleAfter(2000);

        if (event.error === 'not-allowed' || event.error === 'audio-capture') {
            const msg = 'Coach, ich kann Sie nicht hören. Bitte geben Sie das Mikrofon in Ihren Browsereinstellungen frei.';
            showSubtitle('🚫 Mikrofon blockiert');
            speakAlert(msg, 'analyst');
        }
        if (onError) onError(event.error);
    };

    _sttRecognition.onend = () => {
        _sttActive = false;
        document.getElementById('stt-icon')?.classList.remove('stt-active');
        hideSubtitleAfter(3000);
    };

    return _sttRecognition;
}

function startSTT(onResult, onError) {
    if (_sttActive && _sttRecognition) { _sttRecognition.stop(); return; }
    if (!_sttRecognition) initSTT(onResult, onError);
    else {
        _sttRecognition.onresult = (event) => {
            let final = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) final += event.results[i][0].transcript;
                else showSubtitle(event.results[i][0].transcript);
            }
            if (final) { showSubtitle(final); if (onResult) onResult(final.trim()); }
        };
    }
    try { _sttRecognition.start(); } catch (e) { console.warn('[STT] Already running:', e.message); }
}

function toggleSTTManual() {
    if (_sttActive) {
        _sttRecognition?.stop();
    } else {
        startSTT(transcript => {
            showSubtitle(`✓ "${transcript}"`);
            addSystemLog(`[STT] ${transcript}`, 'cyan');
            // Pass to voice command handler if available
            if (typeof handleLeadAnalystCommand === 'function') {
                handleLeadAnalystCommand(transcript.toUpperCase());
            }
        });
    }
}
window.toggleSTTManual = toggleSTTManual;

function showSubtitle(text) {
    const bar = document.getElementById('stt-subtitles');
    const el = document.getElementById('stt-subtitle-text');
    if (!bar || !el) return;
    el.textContent = text;
    bar.style.display = 'block';
}

function hideSubtitleAfter(ms) {
    setTimeout(() => {
        const bar = document.getElementById('stt-subtitles');
        if (bar) bar.style.display = 'none';
    }, ms);
}

// STT name extraction helper
function extractNameFromTranscript(text) {
    const patterns = [
        /mein name ist\s+([a-zäöüß\s]+)/i,
        /ich bin\s+(?:coach\s+|trainer\s+)?([a-zäöüß\s]+)/i,
        /ich hei[sß]e\s+([a-zäöüß\s]+)/i,
        /nennen sie mich\s+([a-zäöüß\s]+)/i,
        /^(?:coach\s+|trainer\s+)?([a-zäöüß\s]{2,20})$/i,
    ];
    for (const rx of patterns) {
        const m = text.match(rx);
        if (m) return m[1].trim().replace(/\s+/g, ' ');
    }
    // Fallback: just use the whole transcript (trimmed)
    return text.replace(/[^a-zäöüßA-ZÄÖÜ\s]/g, '').trim();
}


// ═══════════════════════════════════════════════════════════════════════════
// V102 — STARK BULL ACCESS GATE
// ═══════════════════════════════════════════════════════════════════════════

async function submitAccessGate() {
    const endpoint = document.getElementById('gate-endpoint')?.value.trim() || '';
    const key = document.getElementById('gate-key')?.value.trim() || '';
    const errEl = document.getElementById('gate-error');
    const btn = document.getElementById('gate-submit');

    if (!endpoint) {
        if (errEl) errEl.textContent = 'ENDPOINT ERFORDERLICH';
        return;
    }
    if (!key) {
        if (errEl) errEl.textContent = 'MASTER-PASSWORD ERFORDERLICH — Oder "DEMO-MODUS" nutzen';
        return;
    }

    if (btn) btn.innerHTML = 'VERIFIZIERE VERBINDUNG... <span style="font-size:0.5rem">⏳</span>';
    if (errEl) errEl.textContent = '';

    try {
        const res = await fetch(`${endpoint.replace(/\/$/, '')}/api/version`, { method: 'GET' });
        if (!res.ok) throw new Error('Ollama Server Error');

        // Store config
        localStorage.setItem('toniOllamaEndpoint', endpoint);
        localStorage.setItem('toniAPIKey', key);
        window.toniEndpoint = endpoint;

        if (btn) btn.innerHTML = 'VERBINDUNG ERFOLGREICH <span style="font-size:0.5rem">✅</span>';

        setTimeout(() => {
            runBullAnimation();
        }, 500);
    } catch (e) {
        console.error('Ollama Ping failed:', e);
        if (errEl) errEl.innerHTML = 'VERBINDUNGSFEHLER: Ollama nicht erreichbar.<br>Bitte Coach Onboarding Guide (i) beachten.';
        if (btn) btn.innerHTML = 'ZUGANG ANFORDERN';
    }
}
window.submitAccessGate = submitAccessGate;

function bypassGate() {
    localStorage.setItem('toniAPIKey', 'DEMO');
    window.toniEndpoint = 'DEMO';
    const errEl = document.getElementById('gate-error');
    if (errEl) errEl.textContent = 'DEMO-MODUS AKTIV';

    setTimeout(() => {
        runBullAnimation();
    }, 500);
}
window.bypassGate = bypassGate;

function runBullAnimation() {
    const gate = document.getElementById('access-gate');
    const anim = document.getElementById('bull-animation');
    const wrap = document.getElementById('particles-wrap');
    if (!anim) { revealMainUI(); return; }

    if (gate) gate.style.display = 'none';
    anim.style.display = 'block';

    // Spawn particles at center
    setTimeout(() => {
        const colors = ['#cc0000', '#f5c400', '#b8c5d6', '#ffffff', '#ff6600'];
        for (let i = 0; i < 28; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            const angle = (360 / 28) * i;
            const dist = 80 + Math.random() * 180;
            const tx = Math.cos(angle * Math.PI / 180) * dist;
            const ty = Math.sin(angle * Math.PI / 180) * dist;
            p.style.cssText = `left:50%;top:50%;--tx:${tx}px;--ty:${ty}px;background:${colors[i % colors.length]};animation-delay:${Math.random() * 0.3}s;`;
            wrap?.appendChild(p);
        }
    }, 400);

    // After animation: collect Name/Verein/Position via voice then show UI
    setTimeout(() => {
        anim.style.display = 'none';
        revealMainUI();
        collectProfileVoice();
    }, 3200);
}

function revealMainUI() {
    const gate = document.getElementById('access-gate');
    const anim = document.getElementById('bull-animation');
    if (gate) gate.style.display = 'none';
    if (anim) anim.style.display = 'none';

    // Stop any playing intro videos to prevent audio looping in the background
    const gateVideo = document.getElementById('gate-intro-video');
    const bullVideo = document.getElementById('bull-video');
    if (gateVideo) { gateVideo.pause(); gateVideo.removeAttribute('src'); gateVideo.load(); }
    if (bullVideo) { bullVideo.pause(); bullVideo.removeAttribute('src'); bullVideo.load(); }

    document.getElementById('ui-layer')?.style.setProperty('display', 'flex');
}

function collectProfileVoice() {
    // Check if profile already collected
    if (localStorage.getItem('current_manager_name') &&
        localStorage.getItem('toniManagerVerein')) {
        greetReturningUser(localStorage.getItem('current_manager_name'));
        return;
    }

    const questions = [
        { q_de: 'Key akzeptiert. Stark Elite Suite aktiviert. Wer ist am Apparat? Bitte nennen Sie mir Ihren Namen.', key: null },
        { q_de: 'Für welchen Verein arbeiten Sie?', key: 'toniManagerVerein' },
        { q_de: 'Und was ist Ihre Position? Jugendtrainer, Chef-Trainer oder Sportdirektor?', key: 'toniManagerRole' },
    ];
    let step = 0;

    const answers = {};

    function askNext() {
        if (step >= questions.length) {
            finishProfileSetup(answers);
            return;
        }
        const q = questions[step];
        speakAlert(q.q_de, 'analyst');
        setTimeout(() => {
            initSTT(null, null);
            startSTT(transcript => {
                _sttRecognition?.stop();
                const val = step === 0 ? extractNameFromTranscript(transcript) : transcript.trim();
                answers[step] = val;

                if (step === 0) {
                    localStorage.setItem('current_manager_name', val);
                    localStorage.setItem('toniUserName', val);
                    window.userName = val;
                    updateHeaderWithName(val);
                } else if (q.key) {
                    localStorage.setItem(q.key, val);
                }
                step++;
                setTimeout(askNext, 800);
            }, () => {
                // Mic error — use text fallback
                const overlay = document.getElementById('toni-onboarding');
                if (overlay) { overlay.style.display = 'flex'; }
                step = questions.length; // stop voice flow
            });
        }, 2000);
    }

    askNext();
}

function finishProfileSetup(answers) {
    const name = localStorage.getItem('current_manager_name') || answers[0] || 'Coach';
    const verein = localStorage.getItem('toniManagerVerein') || answers[1] || '';
    const role = localStorage.getItem('toniManagerRole') || answers[2] || '';

    // Role context
    if (/jugend|nlz|nachwuchs|academy/i.test(role)) {
        window.roleContext = 'nlz';
        // Auto-open NLZ section
        setTimeout(() => {
            document.querySelector('[data-target="modal-nlz"]')?.click();
        }, 4000);
    } else {
        window.roleContext = 'management';
    }

    const confirm = `Willkommen, ${name}. Verein ${verein ? verein + ' —' : ''} alle Daten werden jetzt synchronisiert. Ich starte den Daten-Uplink.`;
    speakAlert(confirm, 'analyst');
    showSubtitle(`✓ ${name} — ${verein}`);
    hideSubtitleAfter(5000);

    updateHeaderWithName(name);
    // Add club name to header
    const badge = document.getElementById('user-name-badge');
    if (badge && verein) badge.textContent = `👤 ${name.toUpperCase()} · ${verein.toUpperCase()}`;

    // Update PDF name
    if (window._currentDossierData) window._currentDossierData.manager = name;
    addSystemLog(`[V102] Profile set: ${name} / ${verein} / ${role}`, 'cyan');

    // Trigger fussball.de scouting if proxy online
    if (verein && window._proxyOnline) {
        setTimeout(() => fetchClubData(verein), 2000);
    }
}

async function fetchClubData(verein) {
    try {
        const resp = await fetch(`http://localhost:3001/fussball-de/team?verein=${encodeURIComponent(verein)}&accept_disclaimer=true`);
        const data = await resp.json();
        if (data.ok && data.players.length > 0) {
            addSystemLog(`[SCOUT] ${data.players.length} Spieler von fussball.de geladen`, 'cyan');
            speakAlert(`Kader für ${verein} geladen: ${data.players.length} Spieler gefunden.`, 'analyst');
        }
    } catch (e) { /* proxy offline */ }
}

// Check if gate was already passed
document.addEventListener('DOMContentLoaded', () => {
    const hasKey = localStorage.getItem('toniAPIKey');
    const gate = document.getElementById('access-gate');
    const uiLayer = document.getElementById('ui-layer');

    // Always show gate (hide main UI behind it)
    if (uiLayer) uiLayer.style.display = 'none';
    if (gate) gate.style.display = 'flex';

    // If already authenticated, pre-fill endpoint and show fast-continue hint
    if (hasKey) {
        const ep = document.getElementById('gate-endpoint');
        const stored = localStorage.getItem('toniOllamaEndpoint') || 'http://localhost:11434';
        if (ep) ep.value = stored;
        // Show fast-continue button
        const skip = document.getElementById('onboard-skip');
        if (skip) {
            skip.textContent = 'SESSION FORTSETZEN (' + (localStorage.getItem('current_manager_name') || 'Coach') + ')';
            skip.style.color = '#b8c5d6';
            skip.style.fontSize = '0.62rem';
            skip.onclick = () => {
                revealMainUI();
                const name = localStorage.getItem('current_manager_name');
                if (name) greetReturningUser(name);
            };
        }
    }
});


// ═══════════════════════════════════════════════════════════════════════════
// V103 — TACTIC BOARD 2.0
// ═══════════════════════════════════════════════════════════════════════════

window._halfSpacesVisible = false;
window._zonesVisible = false;
window._pitchTokens = [];  // {el, x, y, name, num, color}

function toggleHalfSpaces() {
    window._halfSpacesVisible = !window._halfSpacesVisible;
    const btn = document.getElementById('btn-halfspace-toggle');
    const pitch = document.getElementById('pitch-svg') || document.getElementById('tactic-pitch') || document.querySelector('.pitch-container,.pitch-wrap,[class*="pitch"]');

    document.querySelectorAll('.halfspace-overlay').forEach(el => el.remove());

    if (window._halfSpacesVisible && pitch) {
        [{ left: '20%', width: '20%' }, { left: '60%', width: '20%' }].forEach(hs => {
            const div = document.createElement('div');
            div.className = 'halfspace-overlay';
            div.style.left = hs.left;
            div.style.width = hs.width;
            pitch.style.position = 'relative';
            pitch.appendChild(div);
        });
        if (btn) { btn.style.background = 'rgba(167,139,250,0.15)'; btn.style.color = '#a78bfa'; }
        speakAlert(window.currentLang === 'de' ? 'Halbräume eingeblendet.' : 'Half-spaces displayed.', 'analyst');
    } else {
        if (btn) { btn.style.background = 'transparent'; }
    }
}
window.toggleHalfSpaces = toggleHalfSpaces;

function toggleZoneOverlay() {
    window._zonesVisible = !window._zonesVisible;
    const btn = document.getElementById('btn-zone-toggle');
    const pitch = document.getElementById('tactic-pitch') || document.querySelector('[class*="pitch"]');

    document.querySelectorAll('.zone5m-overlay').forEach(el => el.remove());

    if (window._zonesVisible && pitch) {
        pitch.style.position = 'relative';
        // 5m zones at top and bottom (inside penalty box width 50%, position 25%)
        [{ top: '0%', height: '6%' }, { bottom: '0%', height: '6%' }].forEach(pos => {
            const div = document.createElement('div');
            div.className = 'zone5m-overlay';
            div.style.cssText = `left:25%;width:50%;height:${pos.height};${pos.top ? 'top:' + pos.top : ''}${pos.bottom ? 'bottom:' + pos.bottom : ''}`;
            pitch.appendChild(div);
        });
        if (btn) { btn.style.background = 'rgba(255,215,0,0.1)'; }
        speakAlert(window.currentLang === 'de' ? '5-Meter-Zonen eingeblendet.' : '5m zones displayed.', 'analyst');
    } else {
        if (btn) { btn.style.background = 'transparent'; }
    }
}
window.toggleZoneOverlay = toggleZoneOverlay;

function clearPitchTokens() {
    window._pitchTokens.forEach(t => t.el?.remove());
    window._pitchTokens = [];
    document.querySelectorAll('.pitch-token,.pass-arrow').forEach(el => el.remove());
    speakAlert(window.currentLang === 'de' ? 'Spielfeld geleert.' : 'Pitch cleared.', 'analyst');
}
window.clearPitchTokens = clearPitchTokens;

// Token colors by position
const posColors = { GK: '#f5c400', CB: '#0088ff', LB: '#0088ff', RB: '#0088ff', CDM: '#00cc66', CM: '#00cc66', CAM: '#cc7700', LW: '#cc0000', RW: '#cc0000', ST: '#cc0000', SS: '#cc0000', FW: '#cc0000' };

function placePitchToken(pitch, x, y, playerName, number, position, id) {
    const token = document.createElement('div');
    token.className = 'pitch-token';
    if (id) token.dataset.id = id;
    const pos = position || 'CM';
    const color = posColors[pos] || '#888';
    token.style.cssText = `left:${x}px;top:${y}px;background:radial-gradient(circle,${color}cc,${color}66);`;
    token.innerHTML = `<span class="tok-num">${number || '?'}</span><span class="tok-name">${(playerName || '').split(' ').pop()}</span>`;
    token.title = playerName || '';

    // Make draggable within pitch
    let isDragging = false, dX = 0, dY = 0;
    token.addEventListener('mousedown', e => {
        isDragging = true;
        dX = e.clientX - token.getBoundingClientRect().left;
        dY = e.clientY - token.getBoundingClientRect().top;
        token.style.cursor = 'grabbing';
        e.preventDefault();
    });
    document.addEventListener('mousemove', e => {
        if (!isDragging) return;
        const pr = pitch.getBoundingClientRect();
        const nx = e.clientX - pr.left;
        const ny = e.clientY - pr.top;
        token.style.left = nx + 'px';
        token.style.top = ny + 'px';
    });
    document.addEventListener('mouseup', () => {
        if (isDragging) { isDragging = false; token.style.cursor = 'grab'; }
    });

    pitch.appendChild(token);
    window._pitchTokens.push({ el: token, name: playerName, num: number, color });
}

// Drag-and-drop from FIFA cards to pitch
function initPitchDropTarget() {
    const pitch = document.getElementById('tactic-pitch') || document.querySelector('[class*="pitch"]');
    if (!pitch) return;
    pitch.style.position = 'relative';

    pitch.addEventListener('dragover', e => e.preventDefault());
    pitch.addEventListener('drop', e => {
        e.preventDefault();
        const data = JSON.parse(e.dataTransfer.getData('application/player-data') || '{}');
        const rect = pitch.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // V114 No-Duplicate Logic: Check if player already exists on pitch
        const existingToken = Array.from(pitch.querySelectorAll('.pitch-token')).find(
            tok => tok.dataset.id && tok.dataset.id === String(data.id)
        );

        if (existingToken) {
            existingToken.style.left = x + 'px';
            existingToken.style.top = y + 'px';
        } else {
            placePitchToken(pitch, x, y, data.name || 'Spieler', data.number || '?', data.position || 'CM', data.id);
        }
    });

    // Make FIFA cards draggable is now handled individually in renderCards2D()
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initPitchDropTarget, 2000);
    // Re-run when squad tab becomes visible
    document.addEventListener('click', e => {
        if (e.target.dataset?.tab || e.target.closest('button')?.dataset?.tab) {
            setTimeout(initPitchDropTarget, 500);
        }
    });
});

// Toni voice draw commands
const _origHandleV103 = typeof handleLeadAnalystCommand === 'function' ? handleLeadAnalystCommand : null;
function handleLeadAnalystCommandV103(upper) {
    const pitch = document.getElementById('tactic-pitch') || document.querySelector('[class*="pitch"]');

    if (upper.includes('HALBRÄUME') || upper.includes('HALF-SPACE') || upper.includes('HALBRAUM')) {
        toggleHalfSpaces();
        return true;
    }
    if (upper.includes('ZONEN') || upper.includes('ZONES') || upper.includes('5-METER')) {
        toggleZoneOverlay();
        return true;
    }
    if ((upper.includes('PASSWEG') || upper.includes('PASSING LANE')) && pitch) {
        // Draw a vertical pass arrow down the center
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        const w = pitch.offsetWidth || 300;
        const h = pitch.offsetHeight || 400;
        svg.setAttribute('style', `position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:5;`);
        svg.innerHTML = `
            <defs><marker id="ah" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill="#00ffff"/>
            </marker></defs>
            <line x1="${w / 2}" y1="${h * 0.8}" x2="${w / 2}" y2="${h * 0.2}" stroke="#00ffff" stroke-width="2" stroke-dasharray="6,3" marker-end="url(#ah)"/>`;
        pitch.style.position = 'relative';
        pitch.appendChild(svg);
        speakAlert(window.currentLang === 'de' ? 'Vertikaler Passweg eingezeichnet.' : 'Vertical passing lane drawn.', 'analyst');
        return true;
    }
    if (upper.includes('SPIELER ENTFERNEN') || upper.includes('CLEAR') || upper.includes('LEEREN')) {
        clearPitchTokens();
        return true;
    }

    if (_origHandleV103) return _origHandleV103(upper);
    return false;
}
window.handleLeadAnalystCommand = handleLeadAnalystCommandV103;


// ═══════════════════════════════════════════════════════════════════════════
// BUG FIX: Tactic Board 2.0 — Proper FIFA Pitch Markings
// ═══════════════════════════════════════════════════════════════════════════

function drawFIFAPitch() {
    const container = document.getElementById('pitch-2d') || document.querySelector('.pitch-container');
    if (!container) return;

    // Ensure correct ratio
    container.style.position = 'relative';
    container.style.width = '100%';

    const W = container.offsetWidth || 400;
    const H = container.offsetHeight || Math.round(W * 68 / 105);

    // Clear & create SVG
    let svg = document.getElementById('pitch-svg-main');
    if (!svg) {
        svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.id = 'pitch-svg-main';
        svg.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:1;';
        container.insertBefore(svg, container.firstChild);
    }

    // Scale factors (105m × 68m standard pitch)
    const scX = (v) => (v / 105) * W;
    const scY = (v) => (v / 68) * H;

    const line = (x1, y1, x2, y2, color = 'rgba(255,255,255,0.85)', w = 1.5) =>
        `<line x1="${scX(x1)}" y1="${scY(y1)}" x2="${scX(x2)}" y2="${scY(y2)}" stroke="${color}" stroke-width="${w}"/>`;
    const rect = (x, y, ww, hh, color = 'rgba(255,255,255,0.85)', fill = 'none', w = 1.5) =>
        `<rect x="${scX(x)}" y="${scY(y)}" width="${scX(ww)}" height="${scY(hh)}" stroke="${color}" stroke-width="${w}" fill="${fill}"/>`;
    const circle = (cx, cy, r, color = 'rgba(255,255,255,0.85)', fill = 'none', w = 1.5) =>
        `<circle cx="${scX(cx)}" cy="${scY(cy)}" r="${Math.min(scX(r), scY(r))}" stroke="${color}" stroke-width="${w}" fill="${fill}"/>`;
    const arc = (cx, cy, r, startA, endA, color = 'rgba(255,255,255,0.7)', w = 1.5) => {
        const sx = scX(cx) + Math.min(scX(r), scY(r)) * Math.cos(startA * Math.PI / 180);
        const sy = scY(cy) + Math.min(scX(r), scY(r)) * Math.sin(startA * Math.PI / 180);
        const ex = scX(cx) + Math.min(scX(r), scY(r)) * Math.cos(endA * Math.PI / 180);
        const ey = scY(cy) + Math.min(scX(r), scY(r)) * Math.sin(endA * Math.PI / 180);
        const la = (endA - startA) > 180 ? 1 : 0;
        return `<path d="M${sx},${sy} A${Math.min(scX(r), scY(r))},${Math.min(scX(r), scY(r))} 0 ${la} 1 ${ex},${ey}" stroke="${color}" stroke-width="${w}" fill="none"/>`;
    };

    const pitch_m = '#1a7a3c';
    const stripe_m = '#1e8a44';

    // Turf stripes
    let stripes = '';
    for (let i = 0; i < 7; i++) {
        const x = i * (105 / 7);
        stripes += `<rect x="${scX(x)}" y="0" width="${scX(105 / 7)}" height="${H}" fill="${i % 2 === 0 ? pitch_m : stripe_m}"/>`;
    }

    svg.innerHTML = `
    <!-- Turf -->
    ${stripes}
    <!-- Outer boundary -->
    ${rect(0, 0, 105, 68, 'rgba(255,255,255,0.9)', undefined, 2)}
    <!-- Halfway line -->
    ${line(52.5, 0, 52.5, 68, 'rgba(255,255,255,0.85)', 1.5)}
    <!-- Center circle (9.15m radius) -->
    ${circle(52.5, 34, 9.15)}
    <!-- Center spot -->
    <circle cx="${scX(52.5)}" cy="${scY(34)}" r="3" fill="rgba(255,255,255,0.9)"/>

    <!-- LEFT Penalty area (16.5m × 40.32m) -->
    ${rect(0, 13.84, 16.5, 40.32)}
    <!-- LEFT Goal area (5.5m × 18.32m) -->
    ${rect(0, 24.84, 5.5, 18.32)}
    <!-- LEFT penalty spot -->
    <circle cx="${scX(11)}" cy="${scY(34)}" r="3" fill="rgba(255,255,255,0.85)"/>
    <!-- LEFT penalty arc -->
    ${arc(11, 34, 9.15, -53, 53, 'rgba(255,255,255,0.7)')}

    <!-- RIGHT Penalty area -->
    ${rect(88.5, 13.84, 16.5, 40.32)}
    <!-- RIGHT Goal area -->
    ${rect(99.5, 24.84, 5.5, 18.32)}
    <!-- RIGHT penalty spot -->
    <circle cx="${scX(94)}" cy="${scY(34)}" r="3" fill="rgba(255,255,255,0.85)"/>
    <!-- RIGHT penalty arc -->
    ${arc(94, 34, 9.15, 127, 233, 'rgba(255,255,255,0.7)')}

    // Halbräume guide lines (dashed)
    ${line(0, 22.67, 105, 22.67, 'rgba(167,139,250,0.4)', 1.5)}
    ${line(0, 45.33, 105, 45.33, 'rgba(167,139,250,0.4)', 1.5)}

    <!-- LEFT GOAL (7.32m wide × 2.44m deep) -->
    <rect x="${scX(0) - scX(2)}" y="${scY(30.34)}" width="${scX(2)}" height="${scY(7.32)}" stroke="rgba(255,255,255,0.9)" stroke-width="2" fill="rgba(255,255,255,0.1)"/>
    <!-- RIGHT GOAL -->
    <rect x="${scX(105)}" y="${scY(30.34)}" width="${scX(2)}" height="${scY(7.32)}" stroke="rgba(255,255,255,0.9)" stroke-width="2" fill="rgba(255,255,255,0.1)"/>

    <!-- Corner arcs -->
    <path d="M${scX(0)},${scY(1)} A${scX(1)},${scY(1)} 0 0 0 ${scX(1)},${scY(0)}" stroke="rgba(255,255,255,0.7)" stroke-width="1.5" fill="none"/>
    <path d="M${scX(105)},${scY(1)} A${scX(1)},${scY(1)} 0 0 1 ${scX(104)},${scY(0)}" stroke="rgba(255,255,255,0.7)" stroke-width="1.5" fill="none"/>
    <path d="M${scX(0)},${scY(67)} A${scX(1)},${scY(1)} 0 0 1 ${scX(1)},${scY(68)}" stroke="rgba(255,255,255,0.7)" stroke-width="1.5" fill="none"/>
    <path d="M${scX(105)},${scY(67)} A${scX(1)},${scY(1)} 0 0 0 ${scX(104)},${scY(68)}" stroke="rgba(255,255,255,0.7)" stroke-width="1.5" fill="none"/>
    `;

    // Make pitch a drop target for tokens (re-run init)
    initPitchDropTarget && initPitchDropTarget();
    console.log('[V103] FIFA pitch drawn (With permanent 5m and half-spaces): ' + W + 'px × ' + H + 'px');
}

// Run after DOM ready and on modal open
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(drawFIFAPitch, 1200);
    window.addEventListener('resize', () => setTimeout(drawFIFAPitch, 300));
});

// ── VR Black Screen Fix ───────────────────────────────────────────────────
function ensureVRScene() {
    const scene = document.getElementById('vr-scene-main') || document.querySelector('a-scene');
    if (!scene) return;

    // Force re-render if scene has loaded but looks black
    if (scene.hasLoaded) {
        // Bump ambient light
        const ambient = scene.querySelector('a-light[type="ambient"]');
        if (ambient && parseFloat(ambient.getAttribute('intensity')) < 1.0) {
            ambient.setAttribute('intensity', '1.2');
        }
        // Re-position camera if at origin
        const cam = scene.querySelector('#vr-cam,a-camera');
        if (cam) {
            const pos = cam.getAttribute('position');
            if (!pos || (pos.x === 0 && pos.y === 0 && pos.z === 0)) {
                cam.setAttribute('position', '0 1.6 0');
            }
        }
        // Force scene tick
        try { scene.renderer.render(scene.object3D, scene.camera); } catch (e) { }
    }

    // Also unblock if gate is still on screen but was bypassed
    const gate = document.getElementById('access-gate');
    const vrBtn = document.getElementById('vr-mode-btn') || document.getElementById('btn-enter-vr');
    if (gate && gate.style.display === 'none' && vrBtn) {
        vrBtn.style.display = 'block';
    }
}
document.addEventListener('DOMContentLoaded', () => setTimeout(ensureVRScene, 3000));

// Re-draw pitch when tactic modal opens
document.addEventListener('DOMContentLoaded', () => {
    const tacModal = document.getElementById('modal-tactics');
    if (tacModal) {
        new MutationObserver(muts => muts.forEach(m => {
            if (!m.target.classList.contains('hidden')) {
                setTimeout(drawFIFAPitch, 150);
            }
        })).observe(tacModal, { attributes: true, attributeFilter: ['class'] });
    }
});


// ═══════════════════════════════════════════════════════════════════════════
// WebGL Detector: Show CSS fallback if WebGL unavailable
// ═══════════════════════════════════════════════════════════════════════════
function isWebGLAvailable() {
    try {
        const canvas = document.createElement('canvas');
        return !!(window.WebGLRenderingContext &&
            (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) { return false; }
}

(function detectWebGL() {
    const vrLayer = document.getElementById('vr-layer');
    if (!vrLayer) return;

    // Patch the VR enter function to show fallback if no WebGL
    const origEnterVR = window.enterVR || window.openVRLayer;
    document.addEventListener('DOMContentLoaded', () => {
        const enterBtn = document.getElementById('vr-mode-btn') || document.querySelector('[onclick*="vr"],[onclick*="VR"]');
        if (!enterBtn) return;

        const noWebGL = !isWebGLAvailable();
        if (noWebGL) {
            enterBtn.title = 'VR — CSS Fallback (kein WebGL)';
        }
    });

    // Monitor vr-layer becoming visible
    new MutationObserver(() => {
        const visible = !vrLayer.classList.contains('hidden') && vrLayer.style.display !== 'none';
        if (visible && !isWebGLAvailable()) {
            const scene = document.getElementById('vr-scene-main') || vrLayer.querySelector('a-scene');
            const fallback = document.getElementById('vr-css-fallback');
            if (scene) scene.style.display = 'none';
            if (fallback) fallback.style.display = 'block';
            console.log('[VR] WebGL unavailable → CSS fallback active');
        }
    }).observe(vrLayer, { attributes: true, attributeFilter: ['class', 'style'] });
})();

// ═══════════════════════════════════════════════════════════════════════════
// V112 & V114 — THE BULLETIN PHONE SIMULATOR & MORNING BRIEFING
// ═══════════════════════════════════════════════════════════════════════════

function togglePhone() {
    const phone = document.getElementById('bulletin-phone');
    if (!phone) return;
    if (phone.classList.contains('phone-hidden')) {
        phone.classList.remove('phone-hidden');
        speakAlert('Phone-Interface aktiviert.', 'analyst');
    } else {
        phone.classList.add('phone-hidden');
    }
}
window.togglePhone = togglePhone;

function openPhoneApp(appName) {
    document.querySelectorAll('.phone-app-view').forEach(el => el.style.display = 'none');
    const app = document.getElementById('app-' + appName);
    if (app) app.style.display = 'flex';
}
window.openPhoneApp = openPhoneApp;

function closePhoneApp() {
    document.querySelectorAll('.phone-app-view').forEach(el => el.style.display = 'none');
}
window.closePhoneApp = closePhoneApp;

function playMorningBriefing() {
    const name = localStorage.getItem('current_manager_name') || 'Coach';
    const card = document.getElementById('phone-daily-card');
    if (card) card.style.display = 'none';
    speakAlert(`Guten Morgen, ${name}. Das System ist hochgefahren. Hier sind die Schwerpunkte für unseren heutigen Spieltag. Erstens: Taktik-Fokus. Wir sollten die Belastungssteuerung für das Setup überprüfen. Zweitens: CFO. Die Recherche für die neuen Trainingsanzüge ist abgeschlossen. Bitte geben Sie das Budget frei. Drittens: NLZ. Ein Talent aus der U19 hat die geforderten physischen KPIs erreicht und wäre bereit für ein Probetraining bei den Profis.`, 'cmo');
}
window.playMorningBriefing = playMorningBriefing;

function showPhonePushNotification(title, message) {
    const pushArea = document.getElementById('phone-push-notifications');
    const phone = document.getElementById('bulletin-phone');
    if (!pushArea || !phone) return;
    if (phone.classList.contains('phone-hidden')) togglePhone();

    const notif = document.createElement('div');
    notif.className = 'phone-push';
    notif.innerHTML = `
        <div style="font-size:1.2rem;">📱</div>
        <div style="flex:1;">
            <div style="color:#0cf; font-weight:700; font-size:0.65rem;">${title}</div>
            <div style="margin-top:2px;">${message}</div>
        </div>
    `;
    pushArea.appendChild(notif);
    setTimeout(() => { if (notif.parentNode) notif.parentNode.removeChild(notif); }, 4500);
}
window.showPhonePushNotification = showPhonePushNotification;

function sendPhoneMessage() {
    const input = document.getElementById('phone-chat-input');
    const history = document.getElementById('phone-chat-history');
    if (!input || !history || !input.value.trim()) return;

    const uMsg = document.createElement('div');
    uMsg.className = 'chat-bubble chat-user';
    uMsg.textContent = input.value;
    history.appendChild(uMsg);

    input.value = '';
    setTimeout(() => {
        const tMsg = document.createElement('div');
        tMsg.className = 'chat-bubble chat-toni';
        tMsg.textContent = "Verstanden. Die Taktik-Engine integriert dieses Feedback in den nächsten Sweep.";
        history.appendChild(tMsg);
        history.scrollTop = history.scrollHeight;
    }, 800);
}
window.sendPhoneMessage = sendPhoneMessage;

function playLockerRoomBroadcast() {
    speakAlert("Männer, kurzes Briefing. Wir spielen heute gegen den Ball extrem hoch. Die erste Pressinglinie steht 15 Meter tief in deren Hälfte. Bei Ballgewinn brauchen wir sofort die vertikale Tiefe in die Halbräume. Lasst uns die Intensität von der ersten Sekunde an diktieren!", "leader");
}
window.playLockerRoomBroadcast = playLockerRoomBroadcast;

setTimeout(() => {
    const sysMenu = document.querySelector('.system-menu');
    if (sysMenu) {
        const phoneBtn = document.createElement('button');
        phoneBtn.className = 'cyber-btn menu-btn';
        phoneBtn.innerHTML = '📱 PHONE UI';
        phoneBtn.onclick = togglePhone;
        sysMenu.appendChild(phoneBtn);
    }
    setTimeout(() => {
        const card = document.getElementById('phone-daily-card');
        if (card) {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }
    }, 3000);
}, 1500);

// General Modal Controller handled in initDeepDiveModals()

// Fix modal close buttons
document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const modal = e.currentTarget.closest('.deep-dive-window');
        if (modal) {
            modal.classList.add('hidden');
            modal.style.display = 'none';
        }
    });
});

// Ensure Esc key also closes open modals
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.deep-dive-window').forEach(modal => {
            modal.classList.add('hidden');
            modal.style.display = 'none';
        });
    }
});

// ═══════════════════════════════════════════════════════════════════════════
// V110 & V111 — MEDIA HUB: AI QUOTES & SOCIAL EXPORT
// ═══════════════════════════════════════════════════════════════════════════

// V109: Mock Match Data DB
const matchDataDB = [
    { opponent: 'Borussia Dortmund', result: '3:1', scorers: ['J. Musiala (12\')', 'H. Kane (34\' Pen)', 'L. Goretzka (78\')'], cards: ['B. Pavard (Yellow, 55\')'], possession: 63, shots: 22, xg: 3.4, pressIntensity: 91 },
    { opponent: 'RB Leipzig', result: '1:1', scorers: ['H. Kane (67\')'], cards: [], possession: 55, shots: 18, xg: 2.1, pressIntensity: 78 },
    { opponent: 'Bayer Leverkusen', result: '2:0', scorers: ['S. Gnabry (11\')', 'T. Müller (90+2\')'], cards: ['A. Pavlovic (Yellow, 71\')'], possession: 48, shots: 12, xg: 1.7, pressIntensity: 87 },
];

function getLatestMatchData() {
    return matchDataDB[Math.floor(Math.random() * matchDataDB.length)];
}

function generateEditorialReport() {
    const profile = document.getElementById('media-mood-profile')?.value || 'analyst';
    const pulse = parseInt(document.getElementById('media-pulse-input')?.value || '2');
    const match = getLatestMatchData();
    const [ourGoals, theirGoals] = match.result.split(':').map(Number);
    const outcome = ourGoals > theirGoals ? 'Sieg' : ourGoals === theirGoals ? 'Remis' : 'Niederlage';

    const contextLine = `${outcome} ${match.result} gegen ${match.opponent} · xG: ${match.xg} · Ballbesitz: ${match.possession}% · Schüsse: ${match.shots}`;
    const scorersLine = match.scorers.join(', ');

    let quote = "";
    if (profile === 'analyst') {
        if (pulse === 1) quote = `${contextLine}. Wir hatten in der zweiten Kette keinen Zugriff. Die Restfeldsicherung war bei Ballverlust viel zu inkonsequent. Das kostet uns Umschaltsituationen.`;
        else if (pulse === 2) quote = `${contextLine}. Die Struktur war in Ordnung, aber wir müssen die Halbräume vertikaler überladen. Das XG-Modell zeigt, dass wir genug Präsenz im letzten Drittel hatten.`;
        else quote = `${contextLine}. Überragendes Gegenpressing heute. Tore durch ${scorersLine}. Wir haben die Pressing-Trigger perfekt erkannt und die erste Aufbaulinie des Gegners komplett zerstört.`;
    } else if (profile === 'leader') {
        if (pulse === 1) quote = `Wir haben die Zweikämpfe gegen ${match.opponent} heute einfach nicht angenommen. Ohne Intensität gewinnst du in dieser Liga keinen Blumentopf.`;
        else if (pulse === 2) quote = `Das war ein harter Fight gegen ${match.opponent}. Die Jungs haben gefightet bis zum Ende — ${scorersLine || 'aber das letzte Quäntchen Glück fehlte'}. ${match.result}.`;
        else quote = `Purer Wille! ${scorersLine}. Wer so eine Mentalität auf den Platz bringt und gegen ${match.opponent} ${match.result} gewinnt, hat den Sieg zu 100% verdient.`;
    } else {
        if (pulse === 1) quote = `${match.result} gegen ${match.opponent} — das Ergebnis spiegelt in keiner Weise unsere Ambition wider. Im letzten Drittel spielen wir es viel zu schlampig zu Ende.`;
        else if (pulse === 2) quote = `Wir haben phasenweise gute Ansätze gezeigt gegen ${match.opponent}, aber wenn du oben mitspielen willst, musst du diese Spiele über 90 Minuten kontrollieren.`;
        else quote = `${scorersLine} — dass die Mannschaft am Ende so extrem cool bleibt, zeigt unsere brutale Qualität und die Entwicklung der letzten Wochen.`;
    }

    let voice = 'analyst';
    if (profile === 'leader') voice = 'leader';
    if (profile === 'kritisch') voice = 'cmo';

    speakAlert(quote, voice);

    // Update the Live Ticker with match data
    const tickerEl = document.getElementById('editorial-live-ticker');
    if (tickerEl) {
        tickerEl.innerHTML = `
            <div style="margin-bottom:8px; font-size:0.7rem; color:#ffd700; font-family:var(--font-heading);">
                AKTUELL: ${match.result} vs ${match.opponent}
            </div>
            <div style="font-size:0.65rem; color:#00ff88;">⚽ ${match.scorers.join(' · ') || 'Kein Torschütze'}</div>
            <div style="font-size:0.65rem; color:#ff4b2b; margin-top:4px;">${match.cards.length ? '🟨 ' + match.cards.join(' · ') : '✅ Keine Karten'}</div>
            <div style="font-size:0.6rem; color:#aaa; margin-top:6px;">
                <span style="color:var(--accent-cyan);">Ballbesitz: ${match.possession}%</span> · 
                Schüsse: ${match.shots} · 
                <span style="color:#00ff88;">xG: ${match.xg}</span> · 
                Press-Intensität: <span style="color:${match.pressIntensity > 85 ? '#00ff88' : '#ffd700'}">${match.pressIntensity}%</span>
            </div>
        `;
        tickerEl.style.display = 'block';
    }

    // Social KPI sparkle
    const reachEl = document.getElementById('editorial-social-reach');
    if (reachEl) {
        const reach = Math.floor(Math.random() * 50000 + 20000);
        reachEl.textContent = reach.toLocaleString('de-DE') + ' Impressions (letzte 24h)';
    }

    setTimeout(() => showPhonePushNotification('🔴 THE BULLETIN', `Neues Zitat veröffentlicht. ${match.result} vs ${match.opponent}.`), 1500);
}
window.generateEditorialReport = generateEditorialReport;

function startPostMatchInterview() {
    const match = getLatestMatchData();
    speakAlert(`Coach, drei kurze Fragen zur Partie gegen ${match.opponent}. Erstens: Warum kam die Mannschaft in der ersten Halbzeit so schwer ins Spiel?`, "scout");
    setTimeout(() => showPhonePushNotification('🎙️ Press Room', 'Interview läuft. Bitte antworten.'), 3000);
}
window.startPostMatchInterview = startPostMatchInterview;

function generateSocialClip() {
    const wf = document.getElementById('social-waveform-preview');
    const match = getLatestMatchData();
    if (wf) {
        wf.style.display = 'flex';
        speakAlert("Generiere Audio-Layer. Neural Voice Synthesis initialisiert.", "analyst");
        setTimeout(() => {
            speakAlert(`Dieser 15-Sekunden Clip über den ${match.result} gegen ${match.opponent} geht jetzt als Reel live. ${match.scorers[0] ? 'Highlight: Tor durch ' + match.scorers[0] + '.' : ''} Alle KPIs sehen gut aus.`, "cmo");
            showPhonePushNotification('🎥 Social Media', `Neues Reel live: "${match.result} vs ${match.opponent}"`);
        }, 4000);
    }
}
window.generateSocialClip = generateSocialClip;

// ═══════════════════════════════════════════════════════════════════════════
// V113: ADMIN CONSOLE LOGIC
// ═══════════════════════════════════════════════════════════════════════════
let logoClicks = 0;
let logoClickTimer = null;
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const logoText = document.getElementById('toni-logo-text');
        if (logoText) {
            logoText.addEventListener('click', () => {
                logoClicks++;
                if (logoClicks >= 5) {
                    const adminConsole = document.getElementById('admin-console');
                    if (adminConsole) adminConsole.style.display = 'flex';
                    logoClicks = 0;
                }
                clearTimeout(logoClickTimer);
                logoClickTimer = setTimeout(() => { logoClicks = 0; }, 1500);
            });
        }
    }, 500);
});

function updateMasterPassword() {
    const pw = document.getElementById('admin-password').value.trim();
    if (pw) {
        localStorage.setItem('toniAPIKey', pw);
        const msg = document.getElementById('admin-pwd-msg');
        if (msg) { msg.textContent = 'UPDATED'; setTimeout(() => msg.textContent = '', 3000); }
    }
}
window.updateMasterPassword = updateMasterPassword;

function updateOllamaEndpoint() {
    const ep = document.getElementById('admin-endpoint').value.trim();
    if (ep) {
        localStorage.setItem('toniOllamaEndpoint', ep);
        window.toniEndpoint = ep;
        const msg = document.getElementById('admin-ep-msg');
        if (msg) { msg.textContent = 'UPDATED'; setTimeout(() => msg.textContent = '', 3000); }
    }
}
window.updateOllamaEndpoint = updateOllamaEndpoint;

function wipeSessionData() {
    if (confirm('DANGER: This will delete ALL local user data and reset the session. Continue?')) {
        localStorage.clear();
        location.reload();
    }
}
window.wipeSessionData = wipeSessionData;

// ═══════════════════════════════════════════════════════════════════════════
// V113: FEIERABEND REPORT (EOD SYNC)
// ═══════════════════════════════════════════════════════════════════════════
function triggerFeierabendReport() {
    const overlay = document.getElementById('feierabend-overlay');
    if (!overlay) return;

    overlay.style.display = 'flex';
    overlay.style.opacity = '1';
    overlay.style.background = 'rgba(5,8,15,0.95)';

    const content = document.getElementById('feierabend-content');
    const shutdownText = document.getElementById('feierabend-shutdown');
    if (content) content.style.opacity = '1';
    if (shutdownText) shutdownText.style.opacity = '1';

    const text = 'Trainer, kurzer Report zum Feierabend. Trainings-Belastung lag im grünen Bereich. Eine leichte Verhärtung bei Müller, das Medical-Team ist dran. Ansonsten alles im Soll. Gute Erholung.';

    // Slight delay before speaking
    setTimeout(() => {
        speakAlert(text, 'analyst');

        // After speaking (approx ~10 seconds), fade to black and close session.
        setTimeout(() => {
            if (content) content.style.opacity = '0';
            if (shutdownText) shutdownText.style.opacity = '0';
            overlay.style.background = '#000000';

            // Note: In a real app we might close the window or purge state. 
            // For now, it stays gracefully on a black screen to simulate turning off the monitor.
        }, 11000);
    }, 1500);
}
window.triggerFeierabendReport = triggerFeierabendReport;

// ═══════════════════════════════════════════════════════════════════════════
// V145: NLZ ELITE ACADEMY TACTICAL MODULES
// ═══════════════════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
    // 1. Halbraum-Dominanz
    const btnHalbraum = document.getElementById('btn-halbraum');
    const overlayHalbraum = document.getElementById('halbraum-overlay');

    if (btnHalbraum && overlayHalbraum) {
        btnHalbraum.addEventListener('click', () => {
            const isHidden = overlayHalbraum.style.display === 'none';
            overlayHalbraum.style.display = isHidden ? 'block' : 'none';
            btnHalbraum.style.background = isHidden ? 'rgba(0,255,136,0.3)' : 'transparent';
            if (isHidden) {
                speakAlert("Coach, hier ist die Vorbereitung für die Halbraum-Besetzung. Die Jungs sind bereit.", "tactics");
                switchPersona('tactics'); // Switch to trainer persona
            }
        });
    }

    // 2. 5M-Box Souveränität (VR)
    const btn5mBox = document.getElementById('btn-5mbox');
    const vr5mBox = document.getElementById('vr-5m-safety');

    if (btn5mBox && vr5mBox) {
        btn5mBox.addEventListener('click', () => {
            const isEnabled = vr5mBox.getAttribute('animation__pulsate') && vr5mBox.getAttribute('animation__pulsate').enabled;
            const targetEnabled = !isEnabled;
            vr5mBox.setAttribute('animation__pulsate', `property: material.opacity; from: 0.1; to: 0.4; dir: alternate; dur: 800; loop: true; enabled: ${targetEnabled}`);

            if (!targetEnabled) {
                vr5mBox.setAttribute('material', 'opacity: 0');
                btn5mBox.style.background = 'transparent';
            } else {
                btn5mBox.style.background = 'rgba(0,255,136,0.3)';
                speakAlert("5-Meter-Raum Sicherheitszone aktiviert. Fokus auf Luftzweikämpfe.", "tactics");
                switchPersona('tactics');
            }
        });
    }

    // 3. Neural Reactivity Minigame
    const btnNeuralStart = document.getElementById('btn-neural-start');
    const promptNeural = document.getElementById('neural-prompt');
    const valNeuralMs = document.getElementById('val-neural-ms');
    const actionBtns = document.querySelectorAll('.neural-action');
    let neuralStartTime = 0;
    let neuralTargetAction = '';
    let neuralTimeout = null;

    if (btnNeuralStart && promptNeural) {
        btnNeuralStart.addEventListener('click', () => {
            btnNeuralStart.style.display = 'none';
            promptNeural.style.display = 'block';
            promptNeural.innerText = 'WAIT...';
            promptNeural.style.color = '#fff';
            valNeuralMs.innerText = '---';

            actionBtns.forEach(btn => btn.disabled = true);
            if (neuralTimeout) clearTimeout(neuralTimeout);

            // Random delay between 1-3 seconds
            const delay = 1000 + Math.random() * 2000;
            neuralTimeout = setTimeout(() => {
                const actions = ['PASS', 'SCHUSS', 'DRIBBLE'];
                neuralTargetAction = actions[Math.floor(Math.random() * actions.length)];
                promptNeural.innerText = neuralTargetAction;

                // Set color
                if (neuralTargetAction === 'PASS') promptNeural.style.color = '#00ffff';
                if (neuralTargetAction === 'SCHUSS') promptNeural.style.color = '#ff4b2b';
                if (neuralTargetAction === 'DRIBBLE') promptNeural.style.color = '#00ff88';

                neuralStartTime = performance.now();
                actionBtns.forEach(btn => btn.disabled = false);
            }, delay);
        });

        actionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const actionClicked = e.target.innerText;
                const reactionTime = Math.round(performance.now() - neuralStartTime);

                if (actionClicked === neuralTargetAction) {
                    valNeuralMs.innerText = reactionTime;
                    if (reactionTime <= 250) {
                        valNeuralMs.style.color = '#00ff88';
                        promptNeural.innerText = 'ELITE REACTION';
                        promptNeural.style.color = '#00ff88';
                    } else {
                        valNeuralMs.style.color = '#ffd700';
                        promptNeural.innerText = 'TOO SLOW';
                        promptNeural.style.color = '#ffd700';
                    }
                } else {
                    valNeuralMs.innerText = 'MISS';
                    valNeuralMs.style.color = '#ff4b2b';
                    promptNeural.innerText = 'WRONG DECISION';
                    promptNeural.style.color = '#ff4b2b';
                }

                actionBtns.forEach(b => b.disabled = true);
                setTimeout(() => {
                    btnNeuralStart.style.display = 'block';
                    promptNeural.style.display = 'none';
                }, 2000);
            });
        });
    }

    // 4. Beam to VR
    const beamBtns = document.querySelectorAll('.nlz-beam-vr');
    beamBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const drillType = e.target.getAttribute('data-drill');

            if (typeof showPhonePushNotification === 'function') {
                showPhonePushNotification('VR SYNC', `Taktik-Szenario ${drillType.toUpperCase()} in den VR Raum gebeamt.`);
            }

            // Reposition players (mock representation of snapping into drill formations)
            const d1 = document.querySelector('.draggable-token[data-id="1"]');
            const d2 = document.querySelector('.draggable-token[data-id="9"]');
            if (d1 && drillType === 'halbraum') { d1.style.left = '45%'; d1.style.top = '40%'; }
            if (d2 && drillType === 'halbraum') { d2.style.left = '55%'; d2.style.top = '40%'; }

            // Switch audio and persona
            speakAlert("Coach, hier ist die Vorbereitung für die Übung. Die Jungs stehen auf Position.", "tactics");
            switchPersona('tactics');
        });
    });

    // 5. Sync Dossier
    const btnSyncCFO = document.getElementById('btn-sync-nlz-cfo');
    if (btnSyncCFO) {
        btnSyncCFO.addEventListener('click', () => {
            if (typeof showPhonePushNotification === 'function') {
                showPhonePushNotification('NLZ DOSSIER SYNCED', 'PDF generiert und in Aktentasche abgelegt.');
            }
            speakAlert("Ich habe die NLZ-Übungen als PDF in der Aktentasche hinterlegt, Manager.", "cfo");
            btnSyncCFO.innerText = "✓ SYNCED";
            btnSyncCFO.style.background = "rgba(255,215,0,0.2)";
        });
    }
});
