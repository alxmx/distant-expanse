/**
 * AR Museum Experience - Main Application Controller
 * Danmarks Tekniske Museum
 */

// ===== FEATURE DEFINITIONS =====
const FEATURES = [
    {
        id: 'bell_47g',
        name: 'Bell 47G Helicopter',
        description: 'Classic observation helicopter from the 1950s',
        modelPath: './assets/models/model1.glb',
        soundPath: './assets/sounds/sound1.mp3',
        color: '#2563eb',
        icon: '🚁',
        rarity: 'rare',
        soundDescription: 'Iconic helicopter rotor sounds',
        qrModel: 'ar-collect:model:bell_47g',
        qrSound: 'ar-collect:sound:bell_47g'
    },
    {
        id: 'ellehammer',
        name: 'Ellehammer Wings',
        description: 'Pioneer aviation artifact from Danish inventor',
        modelPath: './assets/models/model2.glb',
        soundPath: './assets/sounds/sound2.mp3',
        color: '#dc2626',
        icon: '✈️',
        rarity: 'epic',
        soundDescription: 'Wind tunnel simulation sounds',
        qrModel: 'ar-collect:model:ellehammer',
        qrSound: 'ar-collect:sound:ellehammer'
    },
    {
        id: 'glenten',
        name: 'Glenten Engine',
        description: 'Historic radial engine powering early aircraft',
        modelPath: './assets/models/model3.glb',
        soundPath: './assets/sounds/sound3.mp3',
        color: '#ea580c',
        icon: '⚙️',
        rarity: 'common',
        soundDescription: 'Powerful radial engine sounds',
        qrModel: 'ar-collect:model:glenten',
        qrSound: 'ar-collect:sound:glenten'
    },
    {
        id: 'saab',
        name: 'Saab Aircraft Wheels',
        description: 'Aviation landing gear from Swedish manufacturer',
        modelPath: './assets/models/model4.glb',
        soundPath: './assets/sounds/sound4.mp3',
        color: '#16a34a',
        icon: '🛞',
        rarity: 'uncommon',
        soundDescription: 'Hydraulic landing gear sounds',
        qrModel: 'ar-collect:model:saab',
        qrSound: 'ar-collect:sound:saab'
    }
];

// Paper plane instruction steps
const DART_STEPS = [
    { icon: '📄', title: 'Start with a rectangle', desc: 'Use A4 paper, landscape orientation' },
    { icon: '↕️', title: 'Fold lengthwise', desc: 'Create a center crease, then unfold' },
    { icon: '📐', title: 'Fold corners in', desc: 'Fold top corners to center line' },
    { icon: '⬇️', title: 'Fold top down', desc: 'Bring the pointed top down to the base' },
    { icon: '📐', title: 'Fold corners again', desc: 'Fold new corners to center, leaving tip visible' },
    { icon: '📖', title: 'Fold in half', desc: 'Fold along the center crease' },
    { icon: '💨', title: 'Make the wings', desc: 'Fold each side down to create wings' },
    { icon: '🚀', title: 'Launch it!', desc: 'Your dart is ready for flight!', final: true }
];

const GLIDER_STEPS = [
    { icon: '📄', title: 'Start with a rectangle', desc: 'Use A4 paper, portrait orientation' },
    { icon: '↕️', title: 'Fold lengthwise', desc: 'Create a center crease, then unfold' },
    { icon: '📐', title: 'Fold corners to center', desc: 'Fold top corners to meet at center' },
    { icon: '⬇️', title: 'Fold peak down', desc: 'Fold the top triangle down' },
    { icon: '📐', title: 'Fold corners again', desc: 'Fold outer corners to center' },
    { icon: '📐', title: 'Lock the fold', desc: 'Fold up the small triangle to lock' },
    { icon: '📖', title: 'Fold backwards', desc: 'Fold in half with design outside' },
    { icon: '💨', title: 'Create wings', desc: 'Fold wide wings for gliding' },
    { icon: '🚀', title: 'Launch it!', desc: 'Your glider is ready!', final: true }
];

// ===== APPLICATION STATE =====
let currentScreen = 'home';
let screenHistory = ['home'];
let unlockedFeatures = JSON.parse(localStorage.getItem('unlockedFeatures') || '[]');
let activeModelIndex = 0;
let currentAudio = null;
let mindarThree = null;
let isARActive = false;
let html5QrCode = null;
let loadedModels = {};

// ===== NAVIGATION =====
function navigateTo(screenId) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));

    // Stop scanner if leaving scanner screen
    if (currentScreen === 'scanner' && screenId !== 'scanner') {
        stopScanner();
    }

    // Show target screen
    const targetScreen = document.getElementById(`${screenId}-screen`);
    if (targetScreen) {
        targetScreen.classList.add('active');

        // Add to history if different
        if (currentScreen !== screenId) {
            screenHistory.push(screenId);
            currentScreen = screenId;
        }


        // Screen-specific initialization
        if (screenId === 'ar') {
            initAR();
        } else if (screenId === 'scanner') {


            initScanner();
        } else if (screenId === 'collection') {
            updateCollectionScreen();
        } else if (screenId === 'route') {
            updateRouteScreen();
        } else if (screenId === 'home') {
            updateHomeScreen();
        } else if (screenId === 'instructions') {
            renderInstructions('dart');
        }

        // Show/hide floating menu (hide in AR and Scanner)
        const floatingMenu = document.getElementById('floating-menu');
        if (screenId === 'ar' || screenId === 'scanner') {
            floatingMenu.classList.add('hidden');
        } else {
            floatingMenu.classList.remove('hidden');
        }
    }
}

function goBack() {
    if (screenHistory.length > 1) {
        screenHistory.pop();
        const prevScreen = screenHistory[screenHistory.length - 1];
        navigateTo(prevScreen);
    }
}

// ===== FLOATING MENU =====
function toggleFabMenu() {
    const fabBtn = document.getElementById('fab-btn');
    const fabMenu = document.getElementById('fab-menu');

    fabBtn.classList.toggle('open');
    fabMenu.classList.toggle('open');
}

// ===== HOME SCREEN =====
function updateHomeScreen() {
    const totalUnlocked = unlockedFeatures.length;
    document.getElementById('collection-count').textContent = `${totalUnlocked} Items Collected`;

    // Update collection preview badges
    const preview = document.getElementById('collection-preview');
    preview.innerHTML = FEATURES.slice(0, 3).map((f, i) => {
        const hasModel = unlockedFeatures.includes(`${f.id}_model`);
        const hasSound = unlockedFeatures.includes(`${f.id}_sound`);
        const hasAny = hasModel || hasSound;
        return `<span class="collection-badge ${hasAny ? 'collected' : 'locked'}">${hasAny ? '★' : '?'}</span>`;
    }).join('');
}

// ===== INSTRUCTIONS SCREEN =====
function selectDesign(design, btn) {
    document.querySelectorAll('.design-option').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderInstructions(design);
}

function renderInstructions(design) {
    const steps = design === 'dart' ? DART_STEPS : GLIDER_STEPS;
    const container = document.getElementById('instruction-steps');

    container.innerHTML = steps.map((step, i) => `
        <div class="instruction-step ${step.final ? 'final' : ''}" style="animation-delay: ${i * 0.1}s;">
            <div class="step-number">${i + 1}</div>
            <div class="step-content">
                <div class="step-icon">${step.icon}</div>
                <div class="step-title">${step.title}</div>
                <div class="step-description">${step.desc}</div>
            </div>
        </div>
    `).join('');
}

// ===== AR VIEW =====
async function initAR() {
    const container = document.getElementById('ar-container');
    const statusEl = document.getElementById('ar-status');
    const errorEl = document.getElementById('ar-error');

    // Check if already active
    if (isARActive) {
        console.log('AR already active');
        return;
    }

    // Check if MINDAR is available
    if (!window.MINDAR || !window.MINDAR.IMAGE) {
        console.log('MINDAR not ready, waiting...');
        showLoading('Loading AR library...');
        setTimeout(initAR, 300);
        return;
    }

    // Check if THREE is available
    if (!window.THREE) {
        console.log('THREE not ready, waiting...');
        showLoading('Loading 3D library...');
        setTimeout(initAR, 300);
        return;
    }

    // Check camera availability
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {

        console.error('Camera API not available');
        errorEl.classList.remove('hidden');
        document.getElementById('ar-error-message').textContent = 'Camera access not available. Please use HTTPS.';
        return;
    }

    try {
        showLoading('Initializing AR camera...');
        console.log('Starting MindAR...');

        // Clear container first
        container.innerHTML = '';


        // Initialize MindAR - matching working index-mindar.html configuration
        mindarThree = new window.MINDAR.IMAGE.MindARThree({
            container: container,
            imageTargetSrc: './markers/marker_v1.mind',
            maxTrack: 1,
            filterMinCF: 0.0001,
            filterBeta: 0.001,
            warmupTolerance: 5,
            missTolerance: 5
        });

        const { renderer, scene, camera } = mindarThree;

        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
        directionalLight.position.set(0, 10, 10);
        scene.add(directionalLight);

        // Create anchor
        const anchor = mindarThree.addAnchor(0);

        // Load models into anchor
        await loadModels(anchor.group);

        // Handle marker events
        anchor.onTargetFound = () => {
            console.log('Marker found!');
            updateARStatus(true, 'Marker detected');
        };

        anchor.onTargetLost = () => {
            console.log('Marker lost');
            updateARStatus(false, 'Point camera at marker');
        };

        // Start AR
        await mindarThree.start();
        isARActive = true;

        // Render loop
        renderer.setAnimationLoop(() => {
            renderer.render(scene, camera);
        });

        hideLoading();
        updateARStatus(false, 'Point camera at marker');

        // Update UI
        renderModelSelector();
        renderSoundControls();
        updateARStarCount();

    } catch (error) {
        console.error('AR Error:', error);
        hideLoading();
        errorEl.classList.remove('hidden');
        document.getElementById('ar-error-message').textContent = error.message;
    }
}

async function loadModels(group) {
    console.log('Loading 3D models...');
    const hasLoader = window.THREE && window.THREE.GLTFLoader;
    const loader = hasLoader ? new window.THREE.GLTFLoader() : null;

    for (let i = 0; i < FEATURES.length; i++) {
        const feature = FEATURES[i];
        let model;

        try {
            if (loader) {
                showLoading(`Loading ${feature.name}...`);
                console.log(`Loading GLB: ${feature.modelPath}`);

                const gltf = await new Promise((resolve, reject) => {
                    loader.load(
                        feature.modelPath,
                        (gltf) => resolve(gltf),
                        undefined,
                        (error) => reject(error)
                    );
                });

                model = gltf.scene;
                // Scale and position adjustment for GLB models
                model.scale.set(0.1, 0.1, 0.1);
                model.position.set(0, 0, 0);
            } else {
                throw new Error('GLTFLoader not available');
            }
        } catch (err) {
            console.warn(`Fallback to cube for ${feature.name}:`, err);
            // Create colored placeholder cube
            const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
            const material = new THREE.MeshBasicMaterial({ color: feature.color });
            model = new THREE.Mesh(geometry, material);
            model.position.set(0, 0.25, 0);
        }

        // Common model setup
        model.visible = (i === 0);
        model.name = feature.id;
        group.add(model);
        loadedModels[feature.id] = model;
    }

    console.log('All models initialized:', Object.keys(loadedModels));
}


function switchModel(index) {
    activeModelIndex = index;

    // Update model visibility
    Object.values(loadedModels).forEach((model, i) => {
        model.visible = (i === index);
    });

    // Update UI
    document.querySelectorAll('.model-btn').forEach((btn, i) => {
        btn.classList.toggle('active', i === index);
    });

    // Update name display
    const feature = FEATURES[index];
    const nameDisplay = document.getElementById('feature-name-display');
    if (nameDisplay && feature) {
        nameDisplay.textContent = feature.name;
        // Re-trigger animation
        nameDisplay.style.animation = 'none';
        nameDisplay.offsetHeight; /* trigger reflow */
        nameDisplay.style.animation = 'fadeIn 0.2s ease';
    }
}

function renderModelSelector() {
    const container = document.getElementById('model-selector');

    container.innerHTML = FEATURES.map((feature, i) => {
        const hasModel = unlockedFeatures.includes(`${feature.id}_model`) || unlockedFeatures.includes(feature.id);
        const isActive = i === activeModelIndex;

        return `
            <button class="model-btn ${isActive ? 'active' : ''} ${!hasModel ? 'locked' : ''}" 
                    onclick="switchModel(${i})"
                    style="border-color: ${isActive ? feature.color : 'transparent'};"
                    ${!hasModel ? 'disabled' : ''}>
                ${feature.icon}
            </button>
        `;
    }).join('');
}

function renderSoundControls() {
    const container = document.getElementById('sound-controls');

    container.innerHTML = FEATURES.map((feature, i) => {
        const hasSound = unlockedFeatures.includes(`${feature.id}_sound`) || unlockedFeatures.includes(feature.id);

        return `
            <button class="sound-btn ${!hasSound ? 'locked' : ''}" 
                    onclick="playSound('${feature.id}')"
                    id="sound-btn-${feature.id}"
                    ${!hasSound ? 'disabled' : ''}>
                <span class="sound-btn-icon">🔊</span>
                <span>${feature.icon}</span>
            </button>
        `;
    }).join('');
}

function playSound(featureId) {
    const feature = FEATURES.find(f => f.id === featureId);
    if (!feature) return;

    // Stop current audio if playing
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        document.querySelectorAll('.sound-btn').forEach(btn => btn.classList.remove('playing'));
    }

    // Play new audio
    currentAudio = new Audio(feature.soundPath);
    currentAudio.play().catch(err => console.warn('Audio play failed:', err));

    const btn = document.getElementById(`sound-btn-${featureId}`);
    if (btn) btn.classList.add('playing');

    currentAudio.onended = () => {
        btn?.classList.remove('playing');
        currentAudio = null;
    };

    // Update name display
    const nameDisplay = document.getElementById('feature-name-display');
    if (nameDisplay) {
        nameDisplay.textContent = `${feature.name} Audio`;
        // Re-trigger animation
        nameDisplay.style.animation = 'none';
        nameDisplay.offsetHeight; /* trigger reflow */
        nameDisplay.style.animation = 'fadeIn 0.2s ease';
    }
}

function updateARStatus(found, message) {
    const statusEl = document.getElementById('ar-status');
    const dot = statusEl.querySelector('.ar-status-dot');
    const text = statusEl.querySelector('span:last-child');

    dot.classList.toggle('found', found);
    text.textContent = message;
}

function updateARStarCount() {
    document.getElementById('ar-star-count').textContent = unlockedFeatures.length;
}

function stopAR() {
    if (mindarThree) {
        mindarThree.stop();
        mindarThree.renderer?.setAnimationLoop(null);
        isARActive = false;
        mindarThree = null;
        loadedModels = {};
    }

    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }

    // Clear container
    const container = document.getElementById('ar-container');
    container.innerHTML = '';
}

// ===== QR SCANNER =====
async function initScanner() {
    const scannerView = document.getElementById('scanner-view');

    if (html5QrCode) {
        try { await html5QrCode.stop(); } catch (e) { }
    }

    try {
        html5QrCode = new Html5Qrcode("scanner-view");

        await html5QrCode.start(
            { facingMode: "environment" },
            {
                fps: 10,
                // Use dynamic qrbox size (70% of smaller dimension)
                qrbox: (viewfinderWidth, viewfinderHeight) => {
                    const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
                    const size = Math.floor(minEdge * 0.7);
                    return { width: size, height: size };
                },
                aspectRatio: 1.333333
            },
            onScanSuccess,
            onScanFailure
        );

    } catch (err) {
        console.error('Scanner error:', err);
        alert('Could not start scanner: ' + err.message);
    }
}

function onScanSuccess(decodedText, decodedResult) {
    console.log('Scanned:', decodedText);

    // Parse QR code
    // Format: ar-collect:type:id or ar-feature:id (legacy)
    let featureId, type;

    if (decodedText.startsWith('ar-collect:')) {
        const parts = decodedText.split(':');
        type = parts[1]; // 'model' or 'sound'
        featureId = parts[2];
    } else if (decodedText.startsWith('ar-feature:')) {
        featureId = decodedText.split(':')[1];
        type = 'both';
    } else {
        showScanResult(false, 'Unknown QR Code', 'This QR code is not recognized.');
        return;
    }

    // Find feature
    const feature = FEATURES.find(f => f.id === featureId);
    if (!feature) {
        showScanResult(false, 'Unknown Feature', 'This feature was not found.');
        return;
    }

    // Unlock feature
    let unlockKey;
    if (type === 'both') {
        unlockKey = featureId;
    } else {
        unlockKey = `${featureId}_${type}`;
    }

    if (!unlockedFeatures.includes(unlockKey)) {
        unlockedFeatures.push(unlockKey);
        localStorage.setItem('unlockedFeatures', JSON.stringify(unlockedFeatures));

        const typeName = type === 'model' ? '3D Model' : type === 'sound' ? 'Sound' : 'Feature';
        showScanResult(
            true,
            `${feature.name} ${typeName}`,
            `You've collected ${unlockedFeatures.length} items!`
        );
    } else {
        showScanResult(
            true,
            'Already Collected',
            `You already have the ${feature.name} ${type}!`
        );
    }

    // Pause scanner
    if (html5QrCode) {
        html5QrCode.pause();
    }
}

function onScanFailure(error) {
    // Silent - QR code not found in frame
}

function showScanResult(success, title, message) {
    const modal = document.getElementById('scan-result-modal');
    const icon = document.getElementById('scan-result-icon');
    const titleEl = document.getElementById('scan-result-title');
    const messageEl = document.getElementById('scan-result-message');

    icon.textContent = success ? '✅' : '❌';
    titleEl.textContent = title;
    messageEl.textContent = message;

    modal.classList.add('open');
}

function closeScanResult() {
    const modal = document.getElementById('scan-result-modal');
    modal.classList.remove('open');

    // Resume scanner
    if (html5QrCode) {
        html5QrCode.resume();
    }
}

function stopScanner() {
    if (html5QrCode) {
        try {
            html5QrCode.stop();
        } catch (e) { }
        html5QrCode = null;
    }
}

// ===== COLLECTION SCREEN =====
function updateCollectionScreen() {
    const grid = document.getElementById('collection-grid');
    const statsCollected = document.getElementById('stats-collected');
    const statsProgress = document.getElementById('stats-progress');

    // Build collection items (4 models + 4 sounds = 8 total)
    const collectionItems = [];
    FEATURES.forEach(feature => {
        // Model item
        collectionItems.push({
            id: `${feature.id}_model`,
            name: feature.name,
            description: feature.description,
            type: 'model',
            icon: feature.icon,
            color: feature.color,
            rarity: feature.rarity,
            isUnlocked: unlockedFeatures.includes(`${feature.id}_model`) || unlockedFeatures.includes(feature.id)
        });
        // Sound item
        collectionItems.push({
            id: `${feature.id}_sound`,
            name: `${feature.name} Audio`,
            description: feature.soundDescription,
            type: 'sound',
            icon: '🎵',
            color: feature.color,
            rarity: feature.rarity,
            isUnlocked: unlockedFeatures.includes(`${feature.id}_sound`) || unlockedFeatures.includes(feature.id)
        });
    });

    // Count unlocked
    const totalPossible = collectionItems.length;
    const totalUnlocked = collectionItems.filter(item => item.isUnlocked).length;
    const percentage = Math.round((totalUnlocked / totalPossible) * 100);

    statsCollected.textContent = `${totalUnlocked} / ${totalPossible}`;
    statsProgress.textContent = `${percentage}% Complete`;

    // Render collection cards
    grid.innerHTML = collectionItems.map(item => {
        const typeLabel = item.type === 'model' ? '3D Model' : 'Sound';
        const typeBadgeClass = item.type === 'model' ? 'badge-model' : 'badge-sound';

        return `
            <div class="feature-card ${!item.isUnlocked ? 'locked' : ''}">
                <div class="feature-preview" style="background: linear-gradient(135deg, ${item.color}22 0%, ${item.color}44 100%); ${!item.isUnlocked ? 'filter: grayscale(0.8); opacity: 0.6;' : ''}">
                    <div class="feature-icon-circle" style="background: ${item.color};">${item.icon}</div>
                    <span class="feature-rarity rarity-${item.rarity}">${item.rarity}</span>
                </div>
                <div class="feature-info">
                    <div class="feature-name">${item.name}</div>
                    <div class="feature-desc">${item.description}</div>
                    <div class="feature-badges">
                        <span class="badge ${typeBadgeClass}">${typeLabel}</span>
                        <span class="badge ${item.isUnlocked ? 'badge-model' : 'badge-locked'}">
                            ${item.isUnlocked ? '✓ Collected' : '🔒 Locked'}
                        </span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}


// ===== ROUTE SCREEN =====
function updateRouteScreen() {
    const container = document.getElementById('waypoints-list');
    const progressValue = document.getElementById('route-progress-value');
    const progressFill = document.getElementById('route-progress-fill');

    // Build waypoints (alternating model and sound for each feature)
    const waypoints = [];
    FEATURES.forEach((feature, i) => {
        waypoints.push({
            feature,
            type: 'model',
            title: feature.name,
            icon: feature.icon,
            desc: feature.description,
            time: '2-3 min'
        });
        waypoints.push({
            feature,
            type: 'sound',
            title: `${feature.name} Audio`,
            icon: '🎵',
            desc: feature.soundDescription,
            time: '1 min'
        });
    });

    // Calculate progress
    const completedCount = waypoints.filter(w => {
        const key = `${w.feature.id}_${w.type}`;
        return unlockedFeatures.includes(key) || unlockedFeatures.includes(w.feature.id);
    }).length;

    const progress = Math.round((completedCount / waypoints.length) * 100);
    progressValue.textContent = `${progress}%`;
    progressFill.style.width = `${progress}%`;

    // Find first incomplete waypoint
    const activeIndex = waypoints.findIndex(w => {
        const key = `${w.feature.id}_${w.type}`;
        return !unlockedFeatures.includes(key) && !unlockedFeatures.includes(w.feature.id);
    });

    // Render waypoints
    container.innerHTML = `
        <div class="waypoints-line"></div>
        ${waypoints.map((waypoint, i) => {
        const key = `${waypoint.feature.id}_${waypoint.type}`;
        const isCompleted = unlockedFeatures.includes(key) || unlockedFeatures.includes(waypoint.feature.id);
        const isActive = i === activeIndex;

        return `
                <div class="waypoint">
                    <div class="waypoint-marker ${isCompleted ? 'completed' : isActive ? 'active' : 'inactive'}">
                        ${isCompleted ? '✓' : i + 1}
                    </div>
                    <div class="waypoint-card ${isActive ? 'active' : ''}">
                        <div class="waypoint-header">
                            <span class="waypoint-icon">${waypoint.icon}</span>
                            <span class="waypoint-title">${waypoint.title}</span>
                            ${isCompleted ? '<span class="waypoint-done">Done</span>' : ''}
                        </div>
                        <div class="waypoint-desc">${waypoint.desc}</div>
                        <div class="waypoint-meta">
                            <span>⏱️ ${waypoint.time}</span>
                            <span>📷 ${waypoint.type === 'model' ? '3D Model' : 'Sound'}</span>
                        </div>
                        ${isActive && !isCompleted ? `
                            <button class="btn btn-primary" style="margin-top: 12px; width: 100%;" onclick="navigateTo('scanner')">
                                Scan QR Code
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
    }).join('')}
    `;
}

// ===== LOADING =====
function showLoading(text = 'Loading...') {
    document.getElementById('loading-text').textContent = text;
    document.getElementById('loading-overlay').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loading-overlay').classList.add('hidden');
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('AR Museum Experience initialized');
    console.log('Unlocked features:', unlockedFeatures);

    // Initial screen updates
    updateHomeScreen();
    renderInstructions('dart');

    // Close fab menu when clicking outside
    document.addEventListener('click', (e) => {
        const fabMenu = document.getElementById('fab-menu');
        const fabBtn = document.getElementById('fab-btn');

        if (fabMenu.classList.contains('open') &&
            !fabMenu.contains(e.target) &&
            !fabBtn.contains(e.target)) {
            toggleFabMenu();
        }
    });
});

// Debug: Add function to unlock all features for testing
window.unlockAll = function () {
    FEATURES.forEach(f => {
        if (!unlockedFeatures.includes(`${f.id}_model`)) {
            unlockedFeatures.push(`${f.id}_model`);
        }
        if (!unlockedFeatures.includes(`${f.id}_sound`)) {
            unlockedFeatures.push(`${f.id}_sound`);
        }
    });
    localStorage.setItem('unlockedFeatures', JSON.stringify(unlockedFeatures));
    location.reload();
};

// Debug: Reset all progress
window.resetProgress = function () {
    unlockedFeatures = [];
    localStorage.removeItem('unlockedFeatures');
    location.reload();
};
