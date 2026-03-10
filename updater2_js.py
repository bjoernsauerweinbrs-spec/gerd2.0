import sys

with open('/Users/bjoernsauerwein/Toni2.0 Antigravity/main.js', 'r') as f:
    text = f.read()

v79_components = """
// --- V79 VR DATA VISUALIZATIONS ---

AFRAME.registerComponent('infinite-data-stream', {
    init: function () {
        this.timer = 0;
        this.columns = [];
        this.container = this.el;
    },
    tick: function (time, timeDelta) {
        this.timer += timeDelta;
        // Spawn interval
        if (this.timer > 100) {
            this.timer = 0;
            this.spawnColumn();
        }

        // Animate upwards
        for (let i = this.columns.length - 1; i >= 0; i--) {
            let col = this.columns[i];
            let pos = col.getAttribute('position');
            pos.y += 0.5; // speed
            if (pos.y > 100) {
                // Remove if too high
                this.container.removeChild(col);
                this.columns.splice(i, 1);
            } else {
                col.setAttribute('position', pos);
            }
        }
    },
    spawnColumn: function() {
        if (this.columns.length > 500) return; // limit
        
        const col = document.createElement('a-cylinder');
        // Random position in a wide far radius
        const rX = (Math.random() - 0.5) * 200;
        const rZ = -50 - (Math.random() * 100);
        
        col.setAttribute('radius', Math.random() > 0.9 ? '0.2' : '0.05');
        col.setAttribute('height', Math.random() * 5 + 1);
        col.setAttribute('color', Math.random() > 0.5 ? '#00ffff' : '#00ff00');
        col.setAttribute('material', 'opacity: 0.6; shader: flat; transparent: true');
        col.setAttribute('position', `${rX} -20 ${rZ}`);
        
        this.container.appendChild(col);
        this.columns.push(col);
    }
});

AFRAME.registerComponent('heartbeat-terrain', {
    schema: { intensity: { type: 'number', default: 0.5 } },
    init: function () {
        this.mesh = this.el.getObject3D('mesh');
        this.originalVertices = [];
        this.applyDisplacement();
    },
    update: function () {
        if (!this.mesh) this.mesh = this.el.getObject3D('mesh');
        this.applyDisplacement();
        
        // Mark critical zones (Red glow) if intensity is very high
        if (this.data.intensity > 0.8) {
            this.el.setAttribute('material', 'emissive: #ff4b2b; color: #1a0000; wireframe: true');
        } else {
            this.el.setAttribute('material', 'emissive: #00ffff; color: #050a0f; wireframe: true');
        }
    },
    applyDisplacement: function() {
        if (!this.mesh) return;
        const geometry = this.mesh.geometry;
        if (!geometry || !geometry.attributes.position) return;

        const positions = geometry.attributes.position;
        const count = positions.count;

        // Store original flat positions once
        if (this.originalVertices.length === 0) {
            for (let i = 0; i < count; i++) {
                this.originalVertices.push({
                    x: positions.getX(i),
                    y: positions.getY(i),
                    z: positions.getZ(i)
                });
            }
        }

        // Apply noise based on intensity
        for (let i = 0; i < count; i++) {
            const orig = this.originalVertices[i];
            // Simple procedural sine interference for mountains
            let noise = Math.sin(orig.x * 0.1) * Math.cos(orig.y * 0.1) * 10;
            // Add some random ruggedness tied to fixed vertex index so it doesn't flicker
            let rugged = (Math.sin(i * 123.456) * 2);
            
            // Adjust Z (which is upwards in local plane space)
            let zOffset = (noise + rugged) * this.data.intensity;
            positions.setZ(i, Math.max(0, zOffset)); // Only grow upwards
        }
        
        positions.needsUpdate = true;
        // Recompute normals for proper lighting if we were using std material
        geometry.computeVertexNormals();
    }
});

// Init components after DOM
function initV79VRData() {
    const horizon = document.getElementById('infinite-data-horizon');
    if (horizon) horizon.setAttribute('infinite-data-stream', '');
    
    const terrain = document.getElementById('heartbeat-terrain');
    if (terrain) terrain.setAttribute('heartbeat-terrain', 'intensity: 0.5');
    
    // Bind Sliders to Medical Alerts & Terrain sync
    const sliderBF = document.getElementById('slider-bodyfat');
    const valBF = document.getElementById('val-bodyfat');
    const sliderHRV = document.getElementById('slider-hrv');
    const valHRV = document.getElementById('val-hrv');
    
    if (sliderBF) {
        sliderBF.addEventListener('input', (e) => {
            const v = parseFloat(e.target.value);
            valBF.innerText = `${v.toFixed(1)}%`;
            if (v > 10.5) {
                // Trigger Warning
                valBF.style.color = '#ff4b2b';
                triggerMedicalAlert("Metabolic Inefficiency detected. Body Fat threshold exceeded.");
            } else {
                valBF.style.color = '';
            }
        });
    }

    if (sliderHRV) {
        sliderHRV.addEventListener('input', (e) => {
            const v = parseInt(e.target.value);
            valHRV.innerText = `${v}ms`;
            
            // Sync VR Terrain (Map 20-100 to Intensity 0.1 - 1.5. Lower HRV = Worse/Spikier in this logic, or vice versa)
            // Let's say lower HRV = higher intensity/stress terrain
            const intensity = 1.0 - ((v - 20) / 80); // Invert
            if (terrain) terrain.setAttribute('heartbeat-terrain', `intensity: ${intensity + 0.2}`);

            if (v < 55) { // Drop > 20% from 75ms
                valHRV.style.color = '#ff4b2b';
                triggerMedicalAlert("Overtraining risk. HRV dropped significantly.");
                pulseCardUI();
            } else {
                valHRV.style.color = 'var(--accent-magenta)';
            }
        });
    }
}

// Throttle voice alerts so it doesn't spam on slider drag
let alertTimeout = null;
function triggerMedicalAlert(msg) {
    if (alertTimeout) return;
    speakAlert(msg, 'cmo');
    
    // Pulse Red
    pulseCardUI();
    
    alertTimeout = setTimeout(() => { alertTimeout = null; }, 5000); // 5 sec cooldown
}

function pulseCardUI() {
    // Pulse 2D cards and VR hologram red
    document.querySelectorAll('.fifa-card').forEach(c => {
        c.classList.add('pulse-warning');
        setTimeout(() => c.classList.remove('pulse-warning'), 3000);
    });
    
    // VR
    const vrPitch = document.getElementById('pitch-container');
    if (vrPitch) {
        vrPitch.querySelectorAll('a-cylinder').forEach(cyl => {
            if (cyl.getAttribute('color') !== '#00ffff') return; // Only default players
            cyl.setAttribute('color', '#ff4b2b');
            cyl.setAttribute('animation__warn', 'property: scale; to: 1.2 1.2 1.2; dir: alternate; loop: true; dur: 500');
            setTimeout(() => {
                cyl.setAttribute('color', '#00ffff');
                cyl.removeAttribute('animation__warn');
                cyl.setAttribute('scale', '1 1 1');
            }, 3000);
        });
    }
}

// Voice Status Summarize
const oldCmdParser = document.getElementById('btn-send-cmd');
if (oldCmdParser) {
    // Since we can't easily overwrite the inline anonymous listener from previous steps, 
    // we attach a secondary one just for "Status"
    oldCmdParser.addEventListener('click', () => {
        const input = document.getElementById('input-voice-cmd');
        if (!input) return;
        const text = input.value.toLowerCase();
        if (text.includes('status')) {
            updateLiveTrainingPlan("SYSTEM STATUS", "GENERATING MEDICAL BRIEFING...");
            speakAlert("System Status: One active warning. HRV drops indicate overtraining risk for selected player. Suggesting recovery session.", "cmo");
            pulseCardUI();
        }
    });
}
"""

if "AFRAME.registerComponent('infinite-data-stream'" not in text:
    text += v79_components

# Add initV79VRData() to DOMContentLoaded
if "initV79VRData();" not in text:
    old_init = "initDeepDiveModals(); // V79 call"
    new_init = "initDeepDiveModals(); // V79 call\n    initV79VRData();"
    text = text.replace(old_init, new_init)

with open('/Users/bjoernsauerwein/Toni2.0 Antigravity/main.js', 'w') as f:
    f.write(text)

print("main.js updated with VR components and Medical Logic.")
