(function () {
  'use strict';

  // Polyfill roundRect for 2D canvas safety
  if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
      const radius = typeof r === 'number' ? r : (Array.isArray(r) ? r[0] : 8);
      const rr = Math.min(radius, w * 0.5, h * 0.5);
      this.moveTo(x + rr, y);
      this.arcTo(x + w, y, x + w, y + h, rr);
      this.arcTo(x + w, y + h, x, y + h, rr);
      this.arcTo(x, y + h, x, y, rr);
      this.arcTo(x, y, x + w, y, rr);
      this.closePath();
      return this;
    };
  }

  function showWebGLFallback() {
    const shell = document.getElementById('game-shell');
    if (!shell) return;
    const card = document.createElement('div');
    card.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:#140b36;z-index:999;font-size:48px;';
    card.textContent = '🎳🌈⚠️🖥️';
    shell.appendChild(card);
  }

  if (typeof THREE === 'undefined') {
    showWebGLFallback();
    return;
  }

  // 8 Selectable Smiling Critters with Distinct Bowling Personalities & AI Archetypes
  const CRITTERS = [
    { id: 'dogday', emoji: '🐶', color: 0xff8c24, hex: '#ff8c24', accent: 0xffe066, icon: 'icons/dogday.jpg', archetype: 'all_rounder', strikeBoost: 0.03, spareSkill: 0.72, consistency: 0.86 },
    { id: 'catnap', emoji: '🐱', color: 0x9b5de5, hex: '#9b5de5', accent: 0xd8b4fe, icon: 'icons/catnap.jpg', archetype: 'curve_master', strikeBoost: 0.05, spareSkill: 0.78, consistency: 0.88 },
    { id: 'picky', emoji: '🐷', color: 0xff5ca8, hex: '#ff5ca8', accent: 0xffb3d9, icon: 'icons/picky.jpg', archetype: 'power_brawler', strikeBoost: 0.04, spareSkill: 0.62, consistency: 0.72 },
    { id: 'craftycorn', emoji: '🦄', color: 0x38bdf8, hex: '#38bdf8', accent: 0xf472b6, icon: 'icons/craftycorn.jpg', archetype: 'steady_artist', strikeBoost: 0.02, spareSkill: 0.84, consistency: 0.92 },
    { id: 'kickin', emoji: '🐥', color: 0xfacc15, hex: '#facc15', accent: 0xf97316, icon: 'icons/kickin.jpg', archetype: 'hot_streak', strikeBoost: 0.07, spareSkill: 0.58, consistency: 0.66 },
    { id: 'bobby', emoji: '🐻', color: 0xef4444, hex: '#ef4444', accent: 0xfca5a5, icon: 'icons/bobby.jpg', archetype: 'gentle_roller', strikeBoost: 0.01, spareSkill: 0.76, consistency: 0.90 },
    { id: 'hoppy', emoji: '🐰', color: 0x22c55e, hex: '#22c55e', accent: 0x86efac, icon: 'icons/hoppy.jpg', archetype: 'speed_striker', strikeBoost: 0.06, spareSkill: 0.66, consistency: 0.75 },
    { id: 'bubba', emoji: '🐘', color: 0x3b82f6, hex: '#3b82f6', accent: 0x93c5fd, icon: 'icons/bubba.jpg', archetype: 'tactical_pro', strikeBoost: 0.04, spareSkill: 0.82, consistency: 0.87 }
  ];

  // 8 Distinct Bowling Alleys with Unique Obstacles, Props, and Kid-Calibrated AI Progression (0.24 -> 0.68)
  const STAGES = [
    {
      index: 0,
      emoji: '🌈',
      laneColor: 0xf59e0b,
      laneStripe: 0xd97706,
      gutterColor: 0x3b1d82,
      railColor: 0xff4081,
      backdropColor: 0x201044,
      archColor: 0xffd740,
      obstacleType: 'none',
      aiSkill: 0.24,
      bonusPins: 0
    },
    {
      index: 1,
      emoji: '🍭',
      laneColor: 0xec4899,
      laneStripe: 0xbe185d,
      gutterColor: 0x581c87,
      railColor: 0x00e5ff,
      backdropColor: 0x38104c,
      archColor: 0xff80ab,
      obstacleType: 'candy_bumpers',
      aiSkill: 0.32,
      bonusPins: 1
    },
    {
      index: 2,
      emoji: '🎡',
      laneColor: 0x06b6d4,
      laneStripe: 0x0e7490,
      gutterColor: 0x1e3a8a,
      railColor: 0xffeb3b,
      backdropColor: 0x0d274c,
      archColor: 0x00e5ff,
      obstacleType: 'windmill',
      aiSkill: 0.38,
      bonusPins: 2
    },
    {
      index: 3,
      emoji: '🎪',
      laneColor: 0x10b981,
      laneStripe: 0x047857,
      gutterColor: 0x7f1d1d,
      railColor: 0xfde047,
      backdropColor: 0x14332a,
      archColor: 0xff5252,
      obstacleType: 'moving_gates',
      aiSkill: 0.44,
      bonusPins: 2
    },
    {
      index: 4,
      emoji: '🚀',
      laneColor: 0x8b5cf6,
      laneStripe: 0x5b21b6,
      gutterColor: 0x1e1b4b,
      railColor: 0x38bdf8,
      backdropColor: 0x0c1033,
      archColor: 0x7c4dff,
      obstacleType: 'laser_posts',
      aiSkill: 0.50,
      bonusPins: 3
    },
    {
      index: 5,
      emoji: '🏰',
      laneColor: 0xef4444,
      laneStripe: 0xb91c1c,
      gutterColor: 0x4a148c,
      railColor: 0xffd740,
      backdropColor: 0x2f0d1e,
      archColor: 0xe040fb,
      obstacleType: 'toy_blocks',
      aiSkill: 0.56,
      bonusPins: 3
    },
    {
      index: 6,
      emoji: '🌋',
      laneColor: 0xf97316,
      laneStripe: 0xc2410c,
      gutterColor: 0x7c2d12,
      railColor: 0xffea00,
      backdropColor: 0x3b150c,
      archColor: 0xff6e40,
      obstacleType: 'twin_spinners',
      aiSkill: 0.62,
      bonusPins: 4
    },
    {
      index: 7,
      emoji: '👑',
      laneColor: 0x38bdf8,
      laneStripe: 0x0284c7,
      gutterColor: 0x07194a,
      railColor: 0xffd700,
      backdropColor: 0x091e54,
      archColor: 0x00e676,
      obstacleType: 'royal_gauntlet',
      aiSkill: 0.68,
      bonusPins: 5
    }
  ];

  // Classic 10-Pin Bowling Triangle Coordinates (z negative down the lane)
  const PIN_BASE_Z = -21.0;
  const PIN_ROW_DZ = -1.25;
  const PIN_COL_DX = 1.28;

  function getTenPinOffsets() {
    const coords = [];
    const rows = [1, 2, 3, 4];
    let id = 0;
    for (let r = 0; r < rows.length; r++) {
      const count = rows[r];
      const z = PIN_BASE_Z + r * PIN_ROW_DZ;
      const startX = -((count - 1) * PIN_COL_DX) * 0.5;
      for (let c = 0; c < count; c++) {
        coords.push({
          id: id++,
          row: r,
          col: c,
          x: startX + c * PIN_COL_DX,
          z: z,
          isKingpin: (r === 0 && c === 0)
        });
      }
    }
    return coords;
  }

  const TEN_PIN_COORDS = getTenPinOffsets();

  // Persistent Progression State
  const SAVE_KEY = 'critters_bowling3d_save_v1';
  let saveState = {
    unlockedStage: 0,
    selectedStage: 0,
    selectedCritter: 'dogday',
    starsByStage: [0, 0, 0, 0, 0, 0, 0, 0]
  };

  function loadProgress() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed.unlockedStage === 'number') {
          saveState.unlockedStage = Math.max(0, Math.min(7, parsed.unlockedStage));
        }
        if (typeof parsed.selectedStage === 'number') {
          saveState.selectedStage = Math.max(0, Math.min(saveState.unlockedStage, parsed.selectedStage));
        }
        if (typeof parsed.selectedCritter === 'string' && CRITTERS.some(c => c.id === parsed.selectedCritter)) {
          saveState.selectedCritter = parsed.selectedCritter;
        }
        if (Array.isArray(parsed.starsByStage) && parsed.starsByStage.length === 8) {
          saveState.starsByStage = parsed.starsByStage.map(n => Math.max(0, Math.min(3, Number(n) || 0)));
        }
      }
    } catch (_) {}
  }

  function saveProgress() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(saveState));
    } catch (_) {}
  }

  loadProgress();

  // Web Audio Synthesizer (lazy initialization on user gesture + hardware-timed AudioContext scheduling)
  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.muted = false;
      this.lastPinSoundAt = 0;
    }

    ensure() {
      if (this.muted) return null;
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    }

    playTone(freq, dur, type = 'sine', vol = 0.14, slideFreq = null, delaySec = 0) {
      const ctx = this.ensure();
      if (!ctx) return;
      try {
        const t0 = ctx.currentTime + Math.max(0, delaySec);
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, t0);
        if (slideFreq) {
          osc.frequency.exponentialRampToValueAtTime(Math.max(40, slideFreq), t0 + dur);
        }
        gain.gain.setValueAtTime(0.0001, t0);
        gain.gain.linearRampToValueAtTime(vol, t0 + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t0);
        osc.stop(t0 + dur + 0.02);
      } catch (_) {}
    }

    playRoll() {
      this.playTone(165, 0.26, 'triangle', 0.16, 330, 0);
      this.playTone(95, 0.18, 'sine', 0.10, 145, 0.02);
    }

    playSelectChime() {
      this.playTone(540, 0.14, 'triangle', 0.15, 860, 0);
    }

    playCoinChime() {
      this.playTone(880, 0.09, 'sine', 0.12, 1320, 0);
      this.playTone(1320, 0.11, 'triangle', 0.09, 1760, 0.045);
    }

    playBumperBoing() {
      this.playTone(230, 0.17, 'sine', 0.16, 610, 0);
      this.playTone(345, 0.12, 'triangle', 0.10, 740, 0.015);
    }

    playPinHit(combo = 1) {
      const nowMs = performance.now();
      if (nowMs - this.lastPinSoundAt < 28) return;
      this.lastPinSoundAt = nowMs;
      const base = 360 + Math.min(12, combo) * 48;
      // Dual-oscillator maple-pin woody clatter transient
      this.playTone(base, 0.14, 'triangle', 0.18, base * 1.32, 0);
      this.playTone(base * 2.35, 0.055, 'square', 0.075, base * 1.65, 0.004);
    }

    playFeverChime() {
      // Magical 6-note ascending pentatonic harp glissando scheduled on AudioContext clock
      const notes = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
      for (let idx = 0; idx < notes.length; idx++) {
        const n = notes[idx];
        this.playTone(n, 0.24, 'triangle', 0.16, n * 1.04, idx * 0.055);
        this.playTone(n * 2, 0.16, 'sine', 0.07, n * 2.02, idx * 0.055 + 0.012);
      }
    }

    playStrikeFanfare() {
      const notes = [523.25, 659.25, 783.99, 1046.5];
      for (let idx = 0; idx < notes.length; idx++) {
        const n = notes[idx];
        const dur = idx === notes.length - 1 ? 0.36 : 0.22;
        this.playTone(n, dur, 'triangle', 0.18, n * 1.05, idx * 0.070);
      }
    }

    playDefeatMotif() {
      // Classic comical 4-note descending "wah-wah-wah-waaaah" trombone slide
      const steps = [
        { f: 293.66, slide: 282.0, dur: 0.22, delay: 0.0 },
        { f: 277.18, slide: 265.0, dur: 0.22, delay: 0.24 },
        { f: 261.63, slide: 250.0, dur: 0.22, delay: 0.48 },
        { f: 246.94, slide: 174.61, dur: 0.56, delay: 0.72 }
      ];
      for (let i = 0; i < steps.length; i++) {
        const s = steps[i];
        this.playTone(s.f, s.dur, 'sawtooth', 0.11, s.slide, s.delay);
        this.playTone(s.f * 0.5, s.dur, 'triangle', 0.13, s.slide * 0.5, s.delay);
      }
    }

    playPedal(pedalId) {
      if (pedalId === 1) {
        this.playTone(420, 0.26, 'sine', 0.17, 880, 0);
        this.playTone(630, 0.20, 'triangle', 0.11, 1120, 0.05);
      } else if (pedalId === 2) {
        this.playTone(300, 0.30, 'sawtooth', 0.15, 920, 0);
        this.playTone(450, 0.22, 'triangle', 0.12, 1180, 0.04);
      } else {
        this.playTone(140, 0.38, 'square', 0.17, 58, 0);
        this.playTone(92, 0.42, 'triangle', 0.16, 44, 0.02);
      }
    }
  }

  const sfx = new SoundEngine();

  // DOM References
  const canvas = document.getElementById('webgl-canvas');
  const stageRailEl = document.getElementById('stage-rail');
  const critterBarEl = document.getElementById('critter-bar');
  const frameDotsEl = document.getElementById('frame-dots');
  const miniPinRackEl = document.getElementById('mini-pin-rack');
  const feverClusterEl = document.getElementById('fever-cluster');
  const feverFillEl = document.getElementById('fever-bar-fill');
  const audioBtnEl = document.getElementById('audio-btn');
  const leaderboardEl = document.getElementById('leaderboard-rail');
  const bannerToastEl = document.getElementById('banner-toast');
  const bannerEmojisEl = document.getElementById('banner-emojis');
  const aimReadoutEl = document.getElementById('aim-Readout');
  const powerTrackEl = document.getElementById('power-oscillator-track');
  const powerFillEl = document.getElementById('power-oscillator-fill');
  const spinTrackEl = document.getElementById('spin-track');
  const spinKnobEl = document.getElementById('spin-knob');
  const spinLeftBtn = document.getElementById('spin-left-btn');
  const spinRightBtn = document.getElementById('spin-right-btn');
  const btnAimLeft = document.getElementById('btn-aim-left');
  const btnAimRight = document.getElementById('btn-aim-right');
  const btnRoll = document.getElementById('btn-roll');
  const pedalBtns = {
    1: document.getElementById('pedal-curve'),
    2: document.getElementById('pedal-fireball'),
    3: document.getElementById('pedal-bomb')
  };
  const pedalFills = {
    1: document.getElementById('fill-pedal-1'),
    2: document.getElementById('fill-pedal-2'),
    3: document.getElementById('fill-pedal-3')
  };
  const pedalPips = {
    1: document.getElementById('pips-pedal-1'),
    2: document.getElementById('pips-pedal-2'),
    3: document.getElementById('pips-pedal-3')
  };
  const podiumModalEl = document.getElementById('podium-modal');
  const podiumCardEl = document.getElementById('podium-card');
  const modalCrestEl = document.getElementById('modal-crest');
  const modalStarsEl = document.getElementById('modal-stars');
  const podiumStageEl = document.getElementById('podium-stage');
  const modalStandingsEl = document.getElementById('modal-standings');
  const btnRetry = document.getElementById('btn-retry');
  const btnNext = document.getElementById('btn-next');

  // Three.js Scene & Renderer Setup with Guarded Initialization + Real PCFSoftShadowMap
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
  } catch (_) {
    showWebGLFallback();
    return;
  }

  const threeRevision = parseInt(THREE.REVISION, 10) || 161;
  if ('useLegacyLights' in renderer && threeRevision >= 155) {
    renderer.useLegacyLights = false;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.85;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const maxAnisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy() || 4);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1e0e40);
  scene.fog = new THREE.FogExp2(0x1e0e40, 0.011);

  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / Math.max(1, window.innerHeight), 0.1, 160);
  const cameraBasePos = { x: 0, y: 4.2, z: 19.2, lookZ: -12.0 };
  function syncCameraProjection() {
    const aspect = window.innerWidth / Math.max(1, window.innerHeight);
    camera.aspect = aspect;
    // Dynamically widen vertical FOV on narrow portrait viewports so all 4 rival pedestals (x = ±5.85) stay framed
    camera.fov = aspect < 0.85 ? Math.min(68, Math.round(50 + (0.85 - aspect) * 42)) : 50;
    camera.updateProjectionMatrix();
  }
  syncCameraProjection();
  camera.position.set(0, 4.2, 19.2);
  camera.lookAt(0, 0.8, -12.0);

  // Build PMREM procedural studio environment so glossy bowling balls and gold crowns gleam
  let currentEnvRT = null;
  function buildStudioEnvironment() {
    if (currentEnvRT) {
      currentEnvRT.dispose();
      currentEnvRT = null;
    }
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envScene = new THREE.Scene();
    envScene.background = new THREE.Color(0x28155a);

    const ceilingGeo = new THREE.PlaneGeometry(40, 40);
    const ceilingMat = new THREE.MeshBasicMaterial({ color: 0xfff8e7, side: THREE.DoubleSide });
    const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
    ceiling.position.set(0, 15, 0);
    ceiling.rotation.x = Math.PI * 0.5;
    envScene.add(ceiling);

    const stripGeo = new THREE.PlaneGeometry(8, 36);
    const warmMat = new THREE.MeshBasicMaterial({ color: 0xffd54f, side: THREE.DoubleSide });
    const coolMat = new THREE.MeshBasicMaterial({ color: 0x40c4ff, side: THREE.DoubleSide });
    const stripL = new THREE.Mesh(stripGeo, warmMat);
    stripL.position.set(-14, 8, 0);
    stripL.rotation.y = Math.PI * 0.5;
    envScene.add(stripL);

    const stripR = new THREE.Mesh(stripGeo, coolMat);
    stripR.position.set(14, 8, 0);
    stripR.rotation.y = -Math.PI * 0.5;
    envScene.add(stripR);

    currentEnvRT = pmrem.fromScene(envScene, 0.04);
    scene.environment = currentEnvRT.texture;
    ceilingGeo.dispose();
    ceilingMat.dispose();
    stripGeo.dispose();
    warmMat.dispose();
    coolMat.dispose();
    pmrem.dispose();
  }
  buildStudioEnvironment();

  // WebGL context loss & restoration handlers
  canvas.addEventListener('webglcontextlost', e => {
    e.preventDefault();
  }, false);
  canvas.addEventListener('webglcontextrestored', () => {
    buildStudioEnvironment();
  }, false);

  // Calibrated Lighting Rig
  const hemiLight = new THREE.HemisphereLight(0xfff4d6, 0x2c1654, 0.62);
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xfffdf6, 2.05);
  dirLight.position.set(8, 22, 14);
  dirLight.target.position.set(0, 0, -9);
  scene.add(dirLight.target);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.set(2048, 2048);
  dirLight.shadow.camera.left = -13;
  dirLight.shadow.camera.right = 13;
  dirLight.shadow.camera.top = 16;
  dirLight.shadow.camera.bottom = -16;
  dirLight.shadow.camera.near = 1;
  dirLight.shadow.camera.far = 60;
  dirLight.shadow.bias = -0.0005;
  dirLight.shadow.normalBias = 0.02;
  scene.add(dirLight);

  const pinDeckSpot = new THREE.SpotLight(0xfff0b8, 24, 38, Math.PI * 0.34, 0.6, 1.8);
  pinDeckSpot.position.set(0, 7.8, PIN_BASE_Z + 2.5);
  pinDeckSpot.target.position.set(0, 0, -22.5);
  scene.add(pinDeckSpot.target);
  scene.add(pinDeckSpot);

  // Fallback Emoji Portrait CanvasTexture + LoadingManager for Critter Portraits
  function createFallbackPortraitTexture(critter) {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    const ctx = c.getContext('2d');

    ctx.fillStyle = critter.hex;
    ctx.beginPath();
    ctx.arc(128, 128, 124, 0, Math.PI * 2);
    ctx.fill();

    ctx.lineWidth = 10;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    ctx.font = '136px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(critter.emoji, 128, 136);

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = maxAnisotropy;
    return tex;
  }

  const loadingManager = new THREE.LoadingManager();
  const textureLoader = new THREE.TextureLoader(loadingManager);
  const critterTextures = {};

  CRITTERS.forEach(c => {
    critterTextures[c.id] = createFallbackPortraitTexture(c);
    textureLoader.load(
      c.icon,
      loadedTex => {
        loadedTex.colorSpace = THREE.SRGBColorSpace;
        loadedTex.anisotropy = maxAnisotropy;
        loadedTex.generateMipmaps = true;
        critterTextures[c.id] = loadedTex;
        applyPlayerCritterVisuals();
        syncRivalBillboardTextures();
      },
      undefined,
      () => {}
    );
  });

  // Shared Geometries & Pooled Tactile Effects (Zero GPU Leaks!)
  const sharedGeos = {
    pinBody: new THREE.LatheGeometry([
      new THREE.Vector2(0.01, 0.0),
      new THREE.Vector2(0.32, 0.04),
      new THREE.Vector2(0.42, 0.38),
      new THREE.Vector2(0.36, 0.82),
      new THREE.Vector2(0.20, 1.18),
      new THREE.Vector2(0.18, 1.42),
      new THREE.Vector2(0.30, 1.72),
      new THREE.Vector2(0.25, 1.98),
      new THREE.Vector2(0.01, 2.08)
    ], 20),
    pinStripe: new THREE.CylinderGeometry(0.21, 0.23, 0.14, 20),
    pinShadow: new THREE.CircleGeometry(0.46, 20),
    pinCrown: new THREE.CylinderGeometry(0.28, 0.20, 0.24, 12),
    ballOuter: new THREE.SphereGeometry(0.78, 28, 20),
    ballMedallion: new THREE.CircleGeometry(0.58, 28),
    ballRim: new THREE.RingGeometry(0.54, 0.64, 28),
    ballShadow: new THREE.CircleGeometry(0.78, 24),
    rivalPedestal: new THREE.CylinderGeometry(0.55, 0.68, 1.1, 18),
    rivalMedallion: new THREE.CircleGeometry(0.68, 24),
    rivalRim: new THREE.RingGeometry(0.63, 0.74, 24),
    aimDot: new THREE.SphereGeometry(0.16, 12, 10),
    starBurst: new THREE.OctahedronGeometry(0.24, 0),
    // Unit outer-radius shockwave ring so scale directly equals world radius!
    shockRing: new THREE.RingGeometry(0.76, 1.0, 28),
    coinDisc: new THREE.CylinderGeometry(0.32, 0.32, 0.07, 16),
    coinStar: new THREE.OctahedronGeometry(0.18, 0),
    bumperCyl: new THREE.CylinderGeometry(0.68, 0.68, 0.9, 20),
    bumperCap: new THREE.CylinderGeometry(0.75, 0.75, 0.18, 20),
    gateBox: new THREE.BoxGeometry(1.7, 1.1, 0.45),
    toyBlockBox: new THREE.BoxGeometry(1.18, 1.18, 1.18),
    spinnerBar: new THREE.BoxGeometry(3.4, 0.55, 0.45),
    spinnerHub: new THREE.CylinderGeometry(0.45, 0.45, 0.9, 16),
    laserBeam: new THREE.CylinderGeometry(0.09, 0.09, 1.0, 10),
    propPole: new THREE.CylinderGeometry(0.10, 0.10, 2.2, 10),
    propDisc: new THREE.CylinderGeometry(0.72, 0.72, 0.22, 20),
    propCone: new THREE.ConeGeometry(1.35, 2.6, 16),
    propTower: new THREE.CylinderGeometry(0.95, 1.05, 3.2, 14)
  };

  const sharedMats = {
    pinWhite: new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.20,
      metalness: 0.08
    }),
    pinGold: new THREE.MeshStandardMaterial({
      color: 0xffd700,
      emissive: 0x553800,
      roughness: 0.18,
      metalness: 0.78
    }),
    pinRedStripe: new THREE.MeshStandardMaterial({
      color: 0xff2a55,
      emissive: 0x330510,
      roughness: 0.25,
      metalness: 0.12
    }),
    shadowDecal: new THREE.MeshBasicMaterial({
      color: 0x070312,
      transparent: true,
      opacity: 0.38,
      depthWrite: false
    }),
    medallionRim: new THREE.MeshBasicMaterial({
      color: 0xffea70,
      side: THREE.DoubleSide,
      toneMapped: false
    }),
    fireAura: new THREE.MeshBasicMaterial({
      color: 0xff6d00,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.52,
      depthWrite: false,
      toneMapped: false
    }),
    laserBeamMat: new THREE.MeshBasicMaterial({
      color: 0x00f5d4,
      transparent: true,
      opacity: 0.85,
      toneMapped: false
    }),
    coinGoldMat: new THREE.MeshStandardMaterial({
      color: 0xffdf38,
      emissive: 0x8a5a00,
      roughness: 0.16,
      metalness: 0.85
    }),
    coinStarMat: new THREE.MeshBasicMaterial({
      color: 0xffffff,
      toneMapped: false
    })
  };

  // 1) 96-Slot Star Burst Pool + 2) 32-Slot Floor Shockwave Ring Pool + 3) 32-Slot Flying 3D Star Coin Pool
  const STAR_POOL_SIZE = 96;
  const RING_POOL_SIZE = 32;
  const COIN_POOL_SIZE = 32;

  const starPool = [];
  const ringPool = [];
  const coinPool = [];

  const particleGroup = new THREE.Group();
  scene.add(particleGroup);

  const paletteColors = [0xffd84d, 0xff4b91, 0x38ef7d, 0x00e5ff, 0xa855f7, 0xff8c32];
  const starPaletteMats = paletteColors.map(col => new THREE.MeshBasicMaterial({
    color: col,
    toneMapped: false
  }));

  for (let i = 0; i < STAR_POOL_SIZE; i++) {
    const mesh = new THREE.Mesh(sharedGeos.starBurst, starPaletteMats[i % starPaletteMats.length]);
    mesh.visible = false;
    particleGroup.add(mesh);
    starPool.push({
      mesh,
      active: false,
      life: 0,
      maxLife: 0.55,
      vx: 0,
      vy: 0,
      vz: 0
    });
  }

  for (let i = 0; i < RING_POOL_SIZE; i++) {
    // Each floor ring gets its own material so per-ring alpha fades smoothly to 0!
    const mat = new THREE.MeshBasicMaterial({
      color: paletteColors[i % paletteColors.length],
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
      depthWrite: false,
      toneMapped: false
    });
    const mesh = new THREE.Mesh(sharedGeos.shockRing, mat);
    mesh.rotation.x = -Math.PI * 0.5;
    mesh.visible = false;
    particleGroup.add(mesh);
    ringPool.push({
      mesh,
      mat,
      active: false,
      life: 0,
      maxLife: 0.48,
      startRadius: 0.35,
      targetRadius: 1.4
    });
  }

  for (let i = 0; i < COIN_POOL_SIZE; i++) {
    const g = new THREE.Group();
    const disc = new THREE.Mesh(sharedGeos.coinDisc, sharedMats.coinGoldMat);
    disc.rotation.x = Math.PI * 0.5;
    const emblem = new THREE.Mesh(sharedGeos.coinStar, sharedMats.coinStarMat);
    emblem.scale.set(1.1, 1.1, 0.55);
    g.add(disc, emblem);
    g.visible = false;
    particleGroup.add(g);
    coinPool.push({
      group: g,
      active: false,
      life: 0,
      maxLife: 0.82,
      x: 0,
      y: 0,
      z: 0,
      vx: 0,
      vy: 0,
      vz: 0
    });
  }

  function acquirePoolSlot(pool) {
    let oldest = pool[0];
    for (let i = 0; i < pool.length; i++) {
      if (!pool[i].active) return pool[i];
      if (pool[i].life > oldest.life) oldest = pool[i];
    }
    return oldest;
  }

  function spawnFloorShockwaveRing(x, z, targetRadius = 1.35, colorHex = 0xffd84d, duration = 0.46) {
    const r = acquirePoolSlot(ringPool);
    r.active = true;
    r.life = 0;
    r.maxLife = duration;
    r.startRadius = Math.max(0.25, targetRadius * 0.18);
    r.targetRadius = targetRadius;
    r.mat.color.setHex(colorHex);
    r.mat.opacity = 0.90;
    r.mesh.position.set(x, 0.05, z); // Grounded on the lane floor (y = 0.05)
    r.mesh.scale.set(r.startRadius, r.startRadius, 1);
    r.mesh.visible = true;
  }

  function spawnImpactBurst(x, y, z, count = 6, ringRadius = 1.25, ringColor = 0xffd84d) {
    if (ringRadius > 0) {
      spawnFloorShockwaveRing(x, z, ringRadius, ringColor, 0.45);
    }
    for (let s = 0; s < count; s++) {
      const p = acquirePoolSlot(starPool);
      p.active = true;
      p.life = 0;
      p.maxLife = 0.48 + Math.random() * 0.14;
      p.mesh.visible = true;
      p.mesh.position.set(x, Math.max(0.18, y), z);
      p.mesh.scale.setScalar(1.1);
      const angle = (s / Math.max(1, count)) * Math.PI * 2 + Math.random() * 0.5;
      const speed = 3.5 + Math.random() * 5.2;
      p.vx = Math.cos(angle) * speed;
      p.vy = 2.8 + Math.random() * 4.2;
      p.vz = Math.sin(angle) * speed;
    }
  }

  // Compute 3D World Target Behind Player's Leaderboard Card for Homing Star Coins
  const coinTargetWorld = new THREE.Vector3();
  let coinPulseTimeout = null;

  function getPlayerCardWorldPoint() {
    const playerCard = leaderboardEl.querySelector('.racer-card.is-player');
    let ndcX = 0.78;
    let ndcY = 0.52;
    if (playerCard && window.innerWidth > 0 && window.innerHeight > 0) {
      const rect = playerCard.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        const cx = rect.left + rect.width * 0.35;
        const cy = rect.top + rect.height * 0.5;
        ndcX = (cx / window.innerWidth) * 2 - 1;
        ndcY = -(cy / window.innerHeight) * 2 + 1;
      }
    }
    coinTargetWorld.set(ndcX, ndcY, 0.82).unproject(camera);
    return coinTargetWorld;
  }

  function pulsePlayerLeaderboardCard() {
    const playerCard = leaderboardEl.querySelector('.racer-card.is-player');
    if (!playerCard) return;
    playerCard.classList.add('coin-pulse');
    if (coinPulseTimeout) clearTimeout(coinPulseTimeout);
    coinPulseTimeout = setTimeout(() => {
      const card = leaderboardEl.querySelector('.racer-card.is-player');
      if (card) card.classList.remove('coin-pulse');
    }, 180);
  }

  function spawnFlyingStarCoins(x, y, z, count = 1) {
    for (let i = 0; i < count; i++) {
      const c = acquirePoolSlot(coinPool);
      c.active = true;
      c.life = 0;
      c.maxLife = 0.80 + i * 0.06;
      c.x = x + (Math.random() - 0.5) * 0.5;
      c.y = Math.max(0.4, y);
      c.z = z + (Math.random() - 0.5) * 0.5;
      c.vx = (Math.random() - 0.5) * 3.8;
      c.vy = 6.5 + Math.random() * 2.2;
      c.vz = (Math.random() - 0.5) * 3.2;
      c.group.position.set(c.x, c.y, c.z);
      c.group.scale.setScalar(1.0);
      c.group.visible = true;
    }
  }

  function updateParticles(dt) {
    // 1. Update Star Bursts
    for (let i = 0; i < starPool.length; i++) {
      const p = starPool[i];
      if (!p.active) continue;
      p.life += dt;
      if (p.life >= p.maxLife) {
        p.active = false;
        p.mesh.visible = false;
        continue;
      }
      const t = p.life / p.maxLife;
      p.mesh.position.x += p.vx * dt;
      p.mesh.position.y += p.vy * dt;
      p.mesh.position.z += p.vz * dt;
      p.vy -= 9.8 * dt;
      p.mesh.rotation.x += 6 * dt;
      p.mesh.rotation.y += 8 * dt;
      p.mesh.scale.setScalar(Math.max(0.05, 1.15 * (1 - t)));
    }

    // 2. Update Floor Shockwave Rings (with smooth per-ring alpha fade!)
    for (let i = 0; i < ringPool.length; i++) {
      const r = ringPool[i];
      if (!r.active) continue;
      r.life += dt;
      if (r.life >= r.maxLife) {
        r.active = false;
        r.mesh.visible = false;
        continue;
      }
      const t = r.life / r.maxLife;
      const easeOut = 1 - (1 - t) * (1 - t);
      const radius = r.startRadius + (r.targetRadius - r.startRadius) * easeOut;
      r.mesh.scale.set(radius, radius, 1);
      r.mat.opacity = 0.88 * (1 - t);
    }

    // 3. Update Flying 3D Star Coins (arc up for 0.35s, then home to Player Leaderboard Card!)
    let target = null;
    for (let i = 0; i < coinPool.length; i++) {
      const c = coinPool[i];
      if (!c.active) continue;
      c.life += dt;
      if (c.life >= c.maxLife) {
        c.active = false;
        c.group.visible = false;
        pulsePlayerLeaderboardCard();
        sfx.playCoinChime();
        continue;
      }
      if (c.life < 0.35) {
        c.x += c.vx * dt;
        c.y += c.vy * dt;
        c.z += c.vz * dt;
        c.vy -= 14.0 * dt;
      } else {
        if (!target) target = getPlayerCardWorldPoint();
        const homingProgress = (c.life - 0.35) / Math.max(0.1, c.maxLife - 0.35);
        const pull = Math.min(1, dt * (9.5 + homingProgress * 18.0));
        c.x += (target.x - c.x) * pull;
        c.y += (target.y - c.y) * pull;
        c.z += (target.z - c.z) * pull;
        c.group.scale.setScalar(Math.max(0.35, 1.0 - homingProgress * 0.55));
      }
      c.group.position.set(c.x, c.y, c.z);
      c.group.rotation.y += 12.0 * dt;
    }
  }

  // 4 3D Rival Upright Billboard Medallions on Pedestals Alongside the Alley
  const RIVAL_SLOTS = [
    { x: -5.55, z: -15.5 },
    { x: 5.55, z: -15.5 },
    { x: -5.85, z: -21.0 },
    { x: 5.85, z: -21.0 }
  ];
  const rivalBillboards = [];
  const rivalsGroup = new THREE.Group();
  scene.add(rivalsGroup);

  for (let i = 0; i < 4; i++) {
    const slot = RIVAL_SLOTS[i];
    const root = new THREE.Group();
    root.position.set(slot.x, 0, slot.z);

    const pedMat = new THREE.MeshStandardMaterial({
      color: 0x6d28d9,
      roughness: 0.3,
      metalness: 0.4
    });
    const ped = new THREE.Mesh(sharedGeos.rivalPedestal, pedMat);
    ped.position.y = 0.55;
    ped.castShadow = true;
    ped.receiveShadow = true;
    root.add(ped);

    const badgeGroup = new THREE.Group();
    badgeGroup.position.y = 1.95;

    const faceMat = new THREE.MeshBasicMaterial({
      map: critterTextures.catnap,
      side: THREE.DoubleSide,
      toneMapped: false
    });
    const faceMesh = new THREE.Mesh(sharedGeos.rivalMedallion, faceMat);
    const rimMesh = new THREE.Mesh(sharedGeos.rivalRim, sharedMats.medallionRim);
    rimMesh.position.z = 0.02;

    const crownMesh = new THREE.Mesh(sharedGeos.pinCrown, sharedMats.pinGold);
    crownMesh.position.set(0, 0.86, 0);
    crownMesh.visible = false;

    badgeGroup.add(faceMesh, rimMesh, crownMesh);
    root.add(badgeGroup);
    rivalsGroup.add(root);

    rivalBillboards.push({
      root,
      pedMat,
      badgeGroup,
      faceMat,
      crownMesh,
      baseY: 1.95,
      hopTimer: 0
    });
  }

  // Stage Environment Group & Disposables
  const alleyGroup = new THREE.Group();
  scene.add(alleyGroup);
  let stageDisposables = [];
  let stageAnimatedProps = [];
  let stageArchMat = null;
  let stageRailMat = null;
  let stageBaseArchColor = 0xffd740;
  let stageBaseRailColor = 0xff4081;

  function clearStageDisposables() {
    while (alleyGroup.children.length > 0) {
      alleyGroup.remove(alleyGroup.children[0]);
    }
    for (let i = 0; i < stageDisposables.length; i++) {
      const d = stageDisposables[i];
      if (d && typeof d.dispose === 'function') d.dispose();
    }
    stageDisposables = [];
    stageAnimatedProps = [];
    stageArchMat = null;
    stageRailMat = null;
  }

  // Procedural Lane Hardwood + Arrow Chevron Canvas Texture
  function createLaneTexture(stage) {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 1024;
    const ctx = c.getContext('2d');

    const baseColor = '#' + stage.laneColor.toString(16).padStart(6, '0');
    const stripeColor = '#' + stage.laneStripe.toString(16).padStart(6, '0');
    const railHex = '#' + stage.railColor.toString(16).padStart(6, '0');

    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, c.width, c.height);

    const planks = 16;
    const pw = c.width / planks;
    for (let i = 0; i < planks; i++) {
      if (i % 2 === 1) {
        ctx.fillStyle = stripeColor;
        ctx.globalAlpha = 0.48;
        ctx.fillRect(i * pw, 0, pw, c.height);
      }
      ctx.fillStyle = '#000000';
      ctx.globalAlpha = 0.10;
      ctx.fillRect(i * pw, 0, 2, c.height);
    }
    ctx.globalAlpha = 1.0;

    ctx.fillStyle = railHex;
    ctx.fillRect(0, 820, c.width, 14);

    ctx.fillStyle = '#fff8dc';
    for (let i = -3; i <= 3; i++) {
      const cx = c.width * 0.5 + i * 54;
      const cy = 620 - Math.abs(i) * 28;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 28);
      ctx.lineTo(cx - 14, cy + 16);
      ctx.lineTo(cx + 14, cy + 16);
      ctx.closePath();
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = maxAnisotropy;
    stageDisposables.push(tex);
    return tex;
  }

  // Dynamic Obstacles in the Current Stage
  let stageObstacles = [];

  function addBumperObstacle(x, z, mat, idx, sliding = false, amp = 0, speed = 0) {
    const g = new THREE.Group();
    const cyl = new THREE.Mesh(sharedGeos.bumperCyl, mat);
    cyl.position.y = 0.45;
    cyl.castShadow = true;
    cyl.receiveShadow = true;
    const cap = new THREE.Mesh(sharedGeos.bumperCap, sharedMats.pinGold);
    cap.position.y = 0.92;
    cap.castShadow = true;
    const shadow = new THREE.Mesh(sharedGeos.ballShadow, sharedMats.shadowDecal);
    shadow.rotation.x = -Math.PI * 0.5;
    shadow.position.y = 0.02;
    g.add(cyl, cap, shadow);
    g.position.set(x, 0, z);
    alleyGroup.add(g);

    const obs = {
      kind: 'bumper',
      group: g,
      x,
      z,
      vx: 0,
      radius: 0.72,
      sliding,
      baseX: x,
      amp,
      speed,
      phase: idx * 1.35,
      lastHit: -10
    };
    stageObstacles.push(obs);
    return obs;
  }

  function addSpinnerObstacle(x, z, speed, mat, idx) {
    const g = new THREE.Group();
    const hub = new THREE.Mesh(sharedGeos.spinnerHub, sharedMats.pinGold);
    hub.position.y = 0.45;
    hub.castShadow = true;
    const bar = new THREE.Mesh(sharedGeos.spinnerBar, mat);
    bar.position.y = 0.42;
    bar.castShadow = true;
    bar.receiveShadow = true;
    const shadow = new THREE.Mesh(sharedGeos.ballShadow, sharedMats.shadowDecal);
    shadow.rotation.x = -Math.PI * 0.5;
    shadow.position.y = 0.02;
    g.add(hub, bar, shadow);
    g.position.set(x, 0, z);
    alleyGroup.add(g);

    stageObstacles.push({
      kind: 'spinner',
      group: g,
      x,
      z,
      hubRadius: 0.45,
      halfW: 1.70,
      halfD: 0.225,
      angle: idx * 0.8,
      speed,
      lastHit: -10
    });
  }

  function addSliderObstacle(x, z, amp, speed, phase, mat) {
    const mesh = new THREE.Mesh(sharedGeos.gateBox, mat);
    mesh.position.set(x, 0.55, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    alleyGroup.add(mesh);

    stageObstacles.push({
      kind: 'slider',
      group: mesh,
      x,
      z,
      vx: 0,
      baseX: x,
      amp,
      speed,
      phase,
      halfW: 0.85,
      halfD: 0.225,
      lastHit: -10
    });
  }

  function buildAlleyForStage(stage) {
    clearStageDisposables();
    stageObstacles = [];

    scene.background.setHex(stage.backdropColor);
    scene.fog.color.setHex(stage.backdropColor);

    const laneTex = createLaneTexture(stage);
    const laneGeo = new THREE.BoxGeometry(8.4, 0.5, 39.5);
    const laneMat = new THREE.MeshStandardMaterial({
      map: laneTex,
      roughness: 0.28,
      metalness: 0.08,
      envMapIntensity: 0.42
    });
    stageDisposables.push(laneGeo, laneMat);
    const laneMesh = new THREE.Mesh(laneGeo, laneMat);
    laneMesh.position.set(0, -0.25, -7.75);
    laneMesh.receiveShadow = true;
    alleyGroup.add(laneMesh);

    // Sunken Pin Pit behind z = -27.5 (at y = -0.6)
    const pitGeo = new THREE.BoxGeometry(10.4, 0.4, 3.2);
    const pitMat = new THREE.MeshStandardMaterial({
      color: 0x0b051d,
      roughness: 0.8,
      metalness: 0.1
    });
    stageDisposables.push(pitGeo, pitMat);
    const pitMesh = new THREE.Mesh(pitGeo, pitMat);
    pitMesh.position.set(0, -0.8, -28.4);
    alleyGroup.add(pitMesh);

    // Left & Right Glowing Bumpers / Gutters + Kickback Sidewalls near Pin Deck
    const gutterGeo = new THREE.BoxGeometry(0.85, 0.35, 42);
    const gutterMat = new THREE.MeshStandardMaterial({
      color: stage.gutterColor,
      roughness: 0.42,
      metalness: 0.22
    });
    const railGeo = new THREE.CylinderGeometry(0.18, 0.18, 42, 14);
    const railMat = new THREE.MeshStandardMaterial({
      color: stage.railColor,
      emissive: stage.railColor,
      emissiveIntensity: 0.35,
      roughness: 0.22,
      metalness: 0.55
    });
    stageRailMat = railMat;
    stageBaseRailColor = stage.railColor;
    const kickbackGeo = new THREE.BoxGeometry(0.35, 2.4, 12.0);
    stageDisposables.push(gutterGeo, gutterMat, railGeo, railMat, kickbackGeo);

    [-4.6, 4.6].forEach(gx => {
      const g = new THREE.Mesh(gutterGeo, gutterMat);
      g.position.set(gx, -0.18, -9.0);
      g.receiveShadow = true;
      alleyGroup.add(g);

      const r = new THREE.Mesh(railGeo, railMat);
      r.rotation.x = Math.PI * 0.5;
      r.position.set(gx > 0 ? 4.35 : -4.35, 0.28, -9.0);
      r.castShadow = true;
      r.receiveShadow = true;
      alleyGroup.add(r);

      const kb = new THREE.Mesh(kickbackGeo, gutterMat);
      kb.position.set(gx > 0 ? 5.12 : -5.12, 1.0, -23.5);
      kb.receiveShadow = true;
      alleyGroup.add(kb);
    });

    // Overhead Rainbow Neon Arches along the lane
    const archGeo = new THREE.TorusGeometry(5.4, 0.18, 12, 36, Math.PI);
    const archMat = new THREE.MeshStandardMaterial({
      color: stage.archColor,
      emissive: stage.archColor,
      emissiveIntensity: 0.45,
      roughness: 0.22,
      metalness: 0.65
    });
    stageArchMat = archMat;
    stageBaseArchColor = stage.archColor;
    stageDisposables.push(archGeo, archMat);

    [-2, -10, -18, -26].forEach(az => {
      const arch = new THREE.Mesh(archGeo, archMat);
      arch.position.set(0, 0.0, az);
      arch.castShadow = true;
      alleyGroup.add(arch);
    });

    // Pin Deck Backboard (front face at z = -28.9)
    const backGeo = new THREE.BoxGeometry(11.2, 4.8, 0.6);
    const backMat = new THREE.MeshStandardMaterial({
      color: stage.gutterColor,
      roughness: 0.32,
      metalness: 0.35
    });
    stageDisposables.push(backGeo, backMat);
    const backboard = new THREE.Mesh(backGeo, backMat);
    backboard.position.set(0, 2.2, -29.2);
    backboard.receiveShadow = true;
    alleyGroup.add(backboard);

    const obsMat1 = new THREE.MeshStandardMaterial({
      color: stage.railColor,
      emissive: stage.railColor,
      emissiveIntensity: 0.20,
      roughness: 0.24,
      metalness: 0.32
    });
    const obsMat2 = new THREE.MeshStandardMaterial({
      color: stage.archColor,
      emissive: stage.archColor,
      emissiveIntensity: 0.22,
      roughness: 0.22,
      metalness: 0.45
    });
    stageDisposables.push(obsMat1, obsMat2);

    const type = stage.obstacleType;

    if (type === 'none') {
      [-5.5, 5.5].forEach(px => {
        [-6, -14, -22].forEach(pz => {
          const pole = new THREE.Mesh(sharedGeos.propPole, obsMat2);
          pole.position.set(px, 1.1, pz);
          pole.castShadow = true;
          const star = new THREE.Mesh(sharedGeos.starBurst, sharedMats.pinGold);
          star.scale.setScalar(2.2);
          star.position.set(px, 2.5, pz);
          alleyGroup.add(pole, star);
          stageAnimatedProps.push({ mesh: star, rotSpeed: 1.8 });
        });
      });
    } else if (type === 'candy_bumpers') {
      addBumperObstacle(-2.2, -10.5, obsMat1, 0, false);
      addBumperObstacle(2.2, -10.5, obsMat2, 1, false);

      [-5.4, 5.4].forEach((px, sIdx) => {
        [-5, -12, -19].forEach((pz, zIdx) => {
          const stick = new THREE.Mesh(sharedGeos.propPole, sharedMats.pinWhite);
          stick.position.set(px, 1.1, pz);
          const candy = new THREE.Mesh(sharedGeos.propDisc, (sIdx + zIdx) % 2 === 0 ? obsMat1 : obsMat2);
          candy.rotation.x = Math.PI * 0.5;
          candy.position.set(px, 2.35, pz);
          candy.castShadow = true;
          alleyGroup.add(stick, candy);
          stageAnimatedProps.push({ mesh: candy, rotZSpeed: 1.5 });
        });
      });
    } else if (type === 'windmill') {
      addSpinnerObstacle(0, -11.2, 1.9, obsMat1, 0);

      const wheelGroup = new THREE.Group();
      wheelGroup.position.set(0, 6.2, -30.5);
      const wheelRingGeo = new THREE.TorusGeometry(4.2, 0.22, 12, 32);
      stageDisposables.push(wheelRingGeo);
      const wheelRing = new THREE.Mesh(wheelRingGeo, obsMat2);
      wheelGroup.add(wheelRing);
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * Math.PI * 2;
        const gondola = new THREE.Mesh(sharedGeos.propDisc, k % 2 === 0 ? obsMat1 : sharedMats.pinGold);
        gondola.position.set(Math.cos(a) * 4.2, Math.sin(a) * 4.2, 0.2);
        wheelGroup.add(gondola);
      }
      alleyGroup.add(wheelGroup);
      stageAnimatedProps.push({ mesh: wheelGroup, rotZSpeed: 0.65 });
    } else if (type === 'moving_gates') {
      addSliderObstacle(-2.1, -9.8, 1.25, 1.8, 0, obsMat1);
      addSliderObstacle(2.1, -13.2, 1.25, 1.8, Math.PI, obsMat2);

      [-6.0, 6.0].forEach((px, idx) => {
        [-8, -18].forEach(pz => {
          const tent = new THREE.Mesh(sharedGeos.propCone, idx % 2 === 0 ? obsMat2 : obsMat1);
          tent.position.set(px, 1.3, pz);
          tent.castShadow = true;
          alleyGroup.add(tent);
        });
      });
    } else if (type === 'laser_posts') {
      const p1 = addBumperObstacle(-2.1, -9.2, obsMat1, 0, true, 1.05, 2.0);
      const p2 = addBumperObstacle(2.1, -9.2, obsMat2, 1, true, 1.05, 2.0);
      addBumperObstacle(0, -14.0, obsMat1, 2, true, 1.35, 2.3);

      const beamMesh = new THREE.Mesh(sharedGeos.laserBeam, sharedMats.laserBeamMat);
      beamMesh.rotation.z = Math.PI * 0.5;
      beamMesh.position.set(0, 0.58, -9.2);
      alleyGroup.add(beamMesh);
      stageObstacles.push({
        kind: 'laser_beam',
        group: beamMesh,
        postA: p1,
        postB: p2,
        z: -9.2,
        active: true,
        lastHit: -10
      });

      const planetGroup = new THREE.Group();
      planetGroup.position.set(-5.2, 6.8, -22.0);
      const planet = new THREE.Mesh(sharedGeos.ballOuter, obsMat2);
      planet.scale.setScalar(1.6);
      const pRing = new THREE.Mesh(sharedGeos.shockRing, obsMat1);
      pRing.scale.setScalar(4.2);
      pRing.rotation.x = 1.1;
      planetGroup.add(planet, pRing);
      alleyGroup.add(planetGroup);
      stageAnimatedProps.push({ mesh: planetGroup, rotSpeed: 0.8 });
    } else if (type === 'toy_blocks') {
      const blockX = [-2.25, -0.75, 0.75, 2.25];
      blockX.forEach((bx, idx) => {
        const bMesh = new THREE.Mesh(sharedGeos.toyBlockBox, idx % 2 === 0 ? obsMat1 : obsMat2);
        bMesh.position.set(bx, 0.59, -11.5);
        bMesh.castShadow = true;
        bMesh.receiveShadow = true;
        alleyGroup.add(bMesh);
        stageObstacles.push({
          kind: 'knockable_block',
          group: bMesh,
          homeX: bx,
          homeZ: -11.5,
          x: bx,
          y: 0.59,
          z: -11.5,
          vx: 0,
          vy: 0,
          vz: 0,
          knocked: false,
          knockedTimer: 0,
          radius: 0.72,
          lastHit: -10
        });
      });

      [-5.8, 5.8].forEach(px => {
        [-10, -24].forEach(pz => {
          const tower = new THREE.Mesh(sharedGeos.propTower, obsMat1);
          tower.position.set(px, 1.6, pz);
          tower.castShadow = true;
          const roof = new THREE.Mesh(sharedGeos.propCone, sharedMats.pinGold);
          roof.position.set(px, 3.9, pz);
          alleyGroup.add(tower, roof);
        });
      });
    } else if (type === 'twin_spinners') {
      addSpinnerObstacle(-1.85, -10.8, 2.25, obsMat1, 0);
      addSpinnerObstacle(1.85, -10.8, -2.25, obsMat2, 1);

      const lavaLight = new THREE.PointLight(0xff3d00, 32, 24, 1.6);
      lavaLight.position.set(0, 3.2, -11.0);
      alleyGroup.add(lavaLight);

      [-5.8, 5.8].forEach(px => {
        const volcano = new THREE.Mesh(sharedGeos.propCone, obsMat1);
        volcano.scale.set(1.4, 1.6, 1.4);
        volcano.position.set(px, 1.8, -12.0);
        alleyGroup.add(volcano);
      });
    } else if (type === 'royal_gauntlet') {
      addSliderObstacle(-2.2, -7.8, 1.45, 2.35, 0, obsMat1);
      addSliderObstacle(2.2, -11.4, 1.45, 2.35, 2.1, obsMat2);
      addSliderObstacle(0.0, -15.0, 1.55, 2.55, 4.2, sharedMats.pinGold);
      addSpinnerObstacle(-2.55, -13.2, 2.6, obsMat1, 0);
      addSpinnerObstacle(2.55, -13.2, -2.6, obsMat2, 1);

      [-5.6, 5.6].forEach(px => {
        [-7, -14, -22].forEach(pz => {
          const pillar = new THREE.Mesh(sharedGeos.propTower, sharedMats.pinGold);
          pillar.scale.set(0.65, 0.85, 0.65);
          pillar.position.set(px, 1.35, pz);
          pillar.castShadow = true;
          const crown = new THREE.Mesh(sharedGeos.pinCrown, obsMat2);
          crown.scale.setScalar(2.2);
          crown.position.set(px, 3.0, pz);
          alleyGroup.add(pillar, crown);
          stageAnimatedProps.push({ mesh: crown, rotSpeed: 2.2 });
        });
      });
    }
  }

  // 10 Bowling Pins + Stage Bonus Golden Pins Pool
  const MAX_PINS = 15;
  const pinEntities = [];
  const pinsGroup = new THREE.Group();
  scene.add(pinsGroup);

  for (let i = 0; i < MAX_PINS; i++) {
    const root = new THREE.Group();
    const tiltPivot = new THREE.Group();

    const body = new THREE.Mesh(sharedGeos.pinBody, sharedMats.pinWhite);
    body.castShadow = true;
    body.receiveShadow = true;
    const stripe1 = new THREE.Mesh(sharedGeos.pinStripe, sharedMats.pinRedStripe);
    stripe1.position.y = 1.25;
    stripe1.castShadow = true;
    const stripe2 = new THREE.Mesh(sharedGeos.pinStripe, sharedMats.pinRedStripe);
    stripe2.position.y = 1.48;
    stripe2.castShadow = true;
    const crown = new THREE.Mesh(sharedGeos.pinCrown, sharedMats.pinGold);
    crown.position.y = 2.12;
    crown.castShadow = true;
    crown.visible = false;

    tiltPivot.add(body, stripe1, stripe2, crown);

    const shadow = new THREE.Mesh(sharedGeos.pinShadow, sharedMats.shadowDecal);
    shadow.rotation.x = -Math.PI * 0.5;
    shadow.position.y = 0.02;

    root.add(tiltPivot, shadow);
    pinsGroup.add(root);

    pinEntities.push({
      index: i,
      root,
      tiltPivot,
      body,
      crown,
      shadow,
      active: false,
      standing: true,
      sleeping: false,
      isBonus: false,
      isKingpin: false,
      homeX: 0,
      homeZ: 0,
      x: 0,
      y: 0,
      z: 0,
      vx: 0,
      vy: 0,
      vz: 0,
      rx: 0,
      rz: 0,
      rvx: 0,
      rvz: 0
    });
  }

  // Player 3D Bowling Ball with Front-Mounted Upright Portrait Medallion + Per-Power 3D Aura & Vortex Ring
  const ballRoot = new THREE.Group();
  scene.add(ballRoot);

  const ballOuterMat = new THREE.MeshStandardMaterial({
    color: 0xff8c24,
    roughness: 0.08,
    metalness: 0.28,
    transparent: true,
    opacity: 0.28,
    depthWrite: false
  });
  const ballOuterMesh = new THREE.Mesh(sharedGeos.ballOuter, ballOuterMat);
  ballOuterMesh.position.y = 0.78;
  ballOuterMesh.castShadow = true;
  ballOuterMesh.renderOrder = 1;
  ballRoot.add(ballOuterMesh);

  const ballMedallionGroup = new THREE.Group();
  ballMedallionGroup.position.y = 0.78;
  const ballPortraitMat = new THREE.MeshBasicMaterial({
    map: critterTextures.dogday,
    side: THREE.DoubleSide,
    toneMapped: false
  });
  const ballPortraitMesh = new THREE.Mesh(sharedGeos.ballMedallion, ballPortraitMat);
  ballPortraitMesh.position.z = 0.96;
  ballPortraitMesh.renderOrder = 3;
  const ballRimMesh = new THREE.Mesh(sharedGeos.ballRim, sharedMats.medallionRim);
  ballRimMesh.position.z = 0.97;
  ballRimMesh.renderOrder = 4;
  ballMedallionGroup.add(ballPortraitMesh, ballRimMesh);
  ballRoot.add(ballMedallionGroup);

  const ballFireAuraMesh = new THREE.Mesh(sharedGeos.ballOuter, sharedMats.fireAura);
  ballFireAuraMesh.position.y = 0.78;
  ballFireAuraMesh.scale.setScalar(1.18);
  ballFireAuraMesh.renderOrder = 0;
  ballFireAuraMesh.visible = false;
  ballRoot.add(ballFireAuraMesh);

  const ballVortexMat = new THREE.MeshBasicMaterial({
    color: 0x00e5ff,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.82,
    depthWrite: false,
    toneMapped: false
  });
  const ballVortexRingMesh = new THREE.Mesh(sharedGeos.shockRing, ballVortexMat);
  ballVortexRingMesh.position.y = 0.78;
  ballVortexRingMesh.rotation.x = Math.PI * 0.38;
  ballVortexRingMesh.scale.setScalar(1.22);
  ballVortexRingMesh.visible = false;
  ballRoot.add(ballVortexRingMesh);

  const ballShadowMesh = new THREE.Mesh(sharedGeos.ballShadow, sharedMats.shadowDecal);
  ballShadowMesh.rotation.x = -Math.PI * 0.5;
  ballShadowMesh.position.y = 0.02;
  ballRoot.add(ballShadowMesh);

  // Dotted Aim Preview Curve Line on the Lane
  const AIM_DOT_COUNT = 12;
  const aimDots = [];
  const aimGroup = new THREE.Group();
  scene.add(aimGroup);
  const aimDotMat = new THREE.MeshBasicMaterial({
    color: 0xffea70,
    toneMapped: false
  });

  for (let i = 0; i < AIM_DOT_COUNT; i++) {
    const dot = new THREE.Mesh(sharedGeos.aimDot, aimDotMat);
    dot.position.y = 0.16;
    aimGroup.add(dot);
    aimDots.push(dot);
  }

  // Gameplay State Machine
  const TOTAL_FRAMES = 5;
  const BALL_START_Z = 7.2;
  const FIXED_DT = 1 / 120;

  const hudDirty = {
    leaderboard: false,
    miniRack: false,
    fever: false,
    rivals: false
  };

  function flushDirtyHUD() {
    if (hudDirty.rivals) {
      syncRivalBillboardTextures();
      hudDirty.rivals = false;
    }
    if (hudDirty.miniRack) {
      renderMiniPinRack();
      hudDirty.miniRack = false;
    }
    if (hudDirty.fever) {
      renderFeverHUD();
      hudDirty.fever = false;
    }
    if (hudDirty.leaderboard) {
      renderLeaderboard();
      hudDirty.leaderboard = false;
    }
  }

  const gameState = {
    stageIndex: saveState.selectedStage,
    playerCritterId: saveState.selectedCritter,
    phase: 'aiming', // 'aiming' | 'rolling' | 'settling' | 'finished'
    frame: 1,
    ballInFrame: 1, // 1 or 2
    frameResults: [], // 'strike' | 'spare' | 'open'
    aimX: 0, // -3.0 .. +3.0
    aimAngle: 0, // radians -0.20 .. +0.20
    spinCurve: 0, // -1.0 .. +1.0
    powerOsc: 0.85,
    powerDir: 1,
    ballBounceTimer: 0,
    ball: {
      x: 0,
      y: 0,
      z: BALL_START_Z,
      vx: 0,
      vz: 0,
      radius: 0.78,
      spin: 0,
      rollTimer: 0,
      trailTimer: 0,
      settleTimer: 0
    },
    activePower: 0, // 0 | 1 (Curve Spin) | 2 (Fireball) | 3 (Giant Bomb)
    pedals: {
      1: { charges: 3, maxCharges: 3, cooldown: 0, maxCooldown: 3.5 },
      2: { charges: 2, maxCharges: 2, cooldown: 0, maxCooldown: 5.0 },
      3: { charges: 2, maxCharges: 2, cooldown: 0, maxCooldown: 6.0 }
    },
    fever: 0, // 0..100
    feverActive: false,
    feverTimer: 0,
    trauma: 0,
    hitStopTimer: 0,
    slowMoTimer: 0,
    firstPinHitThisRoll: false,
    strikeSlowMoTriggeredThisRoll: false,
    lastHitStopTriggered: false,
    lastSlowMoTriggered: false,
    simTime: 0,
    racers: [],
    lastRank: 1,
    lastStars: 3
  };

  function addTrauma(amount) {
    gameState.trauma = Math.min(1.0, gameState.trauma + amount);
  }

  function triggerPedalRechargePop(pedalId) {
    const btn = pedalBtns[pedalId];
    if (!btn) return;
    btn.classList.remove('pedal-recharged');
    void btn.offsetWidth;
    btn.classList.add('pedal-recharged');
    setTimeout(() => {
      if (btn) btn.classList.remove('pedal-recharged');
    }, 450);
  }

  function refillPedalCharges(amount = 1, resetCooldowns = false) {
    for (let id = 1; id <= 3; id++) {
      const p = gameState.pedals[id];
      const prevCharges = p.charges;
      p.charges = Math.min(p.maxCharges, p.charges + amount);
      if (resetCooldowns) p.cooldown = 0;
      if (p.charges > prevCharges || resetCooldowns) {
        triggerPedalRechargePop(id);
      }
    }
    renderPedalsHUD();
  }

  // Trigger a 3D Rainbow Shockwave down the Alley + Supercharge Pedals!
  function triggerRainbowLaneWave() {
    if (!gameState.feverActive && gameState.fever < 40) return false;
    if (!gameState.feverActive) {
      gameState.feverActive = true;
      gameState.feverTimer = 9.0;
      gameState.fever = 100;
    }
    refillPedalCharges(1, true);
    showToast('🌈🔥🎳🔥🌈');
    sfx.playStrikeFanfare();
    addTrauma(0.45);

    const waveColors = [0xff2d55, 0xffd84d, 0x38ef7d, 0x00e5ff];
    [-2, -9, -16, -22].forEach((wz, idx) => {
      spawnFloorShockwaveRing(0, wz, 3.6, waveColors[idx % waveColors.length], 0.55);
      spawnImpactBurst(0, 0.8, wz, 5, 0);
    });
    updateBallVisuals();
    renderFeverHUD();
    return true;
  }

  function getCritterById(id) {
    return CRITTERS.find(c => c.id === id) || CRITTERS[0];
  }

  // Sync 3D Rival Billboard Textures & Leader Crown
  function syncRivalBillboardTextures() {
    const rivals = gameState.racers.filter(r => !r.isPlayer);
    let topScore = -1;
    let leaderId = null;
    for (let i = 0; i < gameState.racers.length; i++) {
      if (gameState.racers[i].score > topScore && gameState.racers[i].score > 0) {
        topScore = gameState.racers[i].score;
        leaderId = gameState.racers[i].id;
      }
    }

    for (let i = 0; i < 4; i++) {
      const bb = rivalBillboards[i];
      const rv = rivals[i];
      if (!bb || !rv) continue;
      bb.pedMat.color.setHex(rv.critter.color);
      const nextTex = critterTextures[rv.id] || critterTextures.catnap;
      if (bb.faceMat.map !== nextTex) {
        bb.faceMat.map = nextTex;
        bb.faceMat.needsUpdate = true;
      }
      bb.crownMesh.visible = (rv.id === leaderId);
    }
  }

  function initTournamentRoster() {
    const playerCritter = getCritterById(gameState.playerCritterId);
    const others = CRITTERS.filter(c => c.id !== playerCritter.id);
    const rivals = [];
    for (let k = 0; k < 4; k++) {
      rivals.push(others[(gameState.stageIndex * 2 + k) % others.length]);
    }

    gameState.racers = [
      {
        id: playerCritter.id,
        critter: playerCritter,
        isPlayer: true,
        score: 0,
        pinsKnocked: 0
      },
      ...rivals.map((rc, idx) => ({
        id: rc.id,
        critter: rc,
        isPlayer: false,
        aiIndex: idx,
        score: 0,
        pinsKnocked: 0
      }))
    ];
    syncRivalBillboardTextures();
  }

  function switchPlayerCritter(cid) {
    if (!CRITTERS.some(c => c.id === cid)) return false;
    const newCritter = getCritterById(cid);
    const playerEntry = gameState.racers.find(r => r.isPlayer);
    const collidingRival = gameState.racers.find(r => !r.isPlayer && r.id === cid);

    if (collidingRival && playerEntry) {
      collidingRival.id = playerEntry.id;
      collidingRival.critter = playerEntry.critter;
    }
    if (playerEntry) {
      playerEntry.id = cid;
      playerEntry.critter = newCritter;
    }

    gameState.playerCritterId = cid;
    saveState.selectedCritter = cid;
    saveProgress();

    gameState.ballBounceTimer = 0.26;
    sfx.playSelectChime();

    applyPlayerCritterVisuals();
    syncRivalBillboardTextures();
    renderCritterBar();
    renderLeaderboard();
    return true;
  }

  // Reset Pins for a Fresh Rack
  function rackAllPins() {
    const stage = STAGES[gameState.stageIndex];
    const bonusCount = stage.bonusPins || 0;

    for (let i = 0; i < MAX_PINS; i++) {
      const p = pinEntities[i];
      if (i < 10) {
        const coord = TEN_PIN_COORDS[i];
        p.active = true;
        p.standing = true;
        p.sleeping = false;
        p.isBonus = false;
        p.isKingpin = coord.isKingpin;
        p.homeX = coord.x;
        p.homeZ = coord.z;
      } else if (i - 10 < bonusCount) {
        const bIdx = i - 10;
        const spread = (bIdx - (bonusCount - 1) * 0.5) * 1.45;
        p.active = true;
        p.standing = true;
        p.sleeping = false;
        p.isBonus = true;
        p.isKingpin = false;
        p.homeX = spread;
        p.homeZ = PIN_BASE_Z + 4 * PIN_ROW_DZ - 0.6;
      } else {
        p.active = false;
        p.standing = false;
        p.sleeping = false;
        p.root.visible = false;
        continue;
      }

      p.x = p.homeX;
      p.y = 0;
      p.z = p.homeZ;
      p.vx = 0;
      p.vy = 0;
      p.vz = 0;
      p.rx = 0;
      p.rz = 0;
      p.rvx = 0;
      p.rvz = 0;

      p.body.material = (p.isKingpin || p.isBonus) ? sharedMats.pinGold : sharedMats.pinWhite;
      p.crown.visible = p.isKingpin || p.isBonus;
      p.root.visible = true;
      p.root.position.set(p.x, 0, p.z);
      p.tiltPivot.rotation.set(0, 0, 0);
      p.shadow.visible = true;
      p.shadow.position.set(0, 0.02, 0);
      p.shadow.scale.set(1, 1, 1);
    }

    for (let i = 0; i < stageObstacles.length; i++) {
      const obs = stageObstacles[i];
      obs.lastHit = -10;
      if (obs.kind === 'knockable_block') {
        obs.knocked = false;
        obs.knockedTimer = 0;
        obs.x = obs.homeX;
        obs.y = 0.59;
        obs.z = obs.homeZ;
        obs.vx = 0;
        obs.vy = 0;
        obs.vz = 0;
        obs.group.position.set(obs.homeX, 0.59, obs.homeZ);
        obs.group.rotation.set(0, 0, 0);
        obs.group.scale.setScalar(1);
        obs.group.visible = true;
      }
    }

    renderMiniPinRack();
  }

  function clearKnockedPinsForSpare() {
    for (let i = 0; i < MAX_PINS; i++) {
      const p = pinEntities[i];
      if (!p.active) continue;
      if (!p.standing) {
        p.root.visible = false;
      } else {
        p.x = p.homeX;
        p.y = 0;
        p.z = p.homeZ;
        p.vx = 0;
        p.vy = 0;
        p.vz = 0;
        p.rx = 0;
        p.rz = 0;
        p.rvx = 0;
        p.rvz = 0;
        p.sleeping = false;
        p.root.position.set(p.x, 0, p.z);
        p.tiltPivot.rotation.set(0, 0, 0);
        p.shadow.position.set(0, 0.02, 0);
        p.shadow.scale.set(1, 1, 1);
      }
    }
    renderMiniPinRack();
  }

  function countStandingCorePins() {
    let standing = 0;
    for (let i = 0; i < 10; i++) {
      if (pinEntities[i].active && pinEntities[i].standing) standing++;
    }
    return standing;
  }

  function resetBallToBowlerLine() {
    gameState.phase = 'aiming';
    gameState.ball.x = gameState.aimX;
    gameState.ball.y = 0;
    gameState.ball.z = BALL_START_Z;
    gameState.ball.vx = 0;
    gameState.ball.vz = 0;
    gameState.ball.rollTimer = 0;
    gameState.ball.trailTimer = 0;
    gameState.ball.settleTimer = 0;
    gameState.firstPinHitThisRoll = false;
    gameState.strikeSlowMoTriggeredThisRoll = false;
    updateBallVisuals();
    updateAimDots();
  }

  function applyPlayerCritterVisuals() {
    const critter = getCritterById(gameState.playerCritterId);
    ballOuterMat.color.setHex(critter.color);
    ballPortraitMat.map = critterTextures[critter.id] || critterTextures.dogday;
    ballPortraitMat.needsUpdate = true;
    updateBallVisuals();
  }

  // Distinct 3D Ball Aura & Vortex Ring Signatures per Active Power Pedal and Rainbow Fever!
  function updateBallVisuals() {
    const isCurve = gameState.activePower === 1;
    const isFire = gameState.activePower === 2;
    const isBomb = gameState.activePower === 3;
    const isFever = gameState.feverActive;

    const baseScale = isBomb ? 1.45 : ((isFire || isFever) ? 1.16 : (isCurve ? 1.06 : 1.0));
    gameState.ball.radius = 0.78 * baseScale;

    let sx = baseScale;
    let sy = baseScale;
    let bounceY = 0;
    if (gameState.ballBounceTimer > 0) {
      const phase = (gameState.ballBounceTimer / 0.26) * Math.PI * 2;
      const squash = Math.sin(phase) * 0.22;
      sx = baseScale * (1.0 + squash);
      sy = baseScale * (1.0 - squash * 0.8);
      bounceY = Math.abs(Math.sin(phase * 0.5)) * 0.55;
    }

    ballRoot.scale.set(sx, sy, sx);
    ballRoot.position.set(gameState.ball.x, gameState.ball.y + bounceY, gameState.ball.z);

    ballMedallionGroup.lookAt(camera.position.x, ballRoot.position.y + 0.78 * sy, camera.position.z);

    if (isFever) {
      const hue = (gameState.simTime * 1.45) % 1.0;
      sharedMats.fireAura.color.setHSL(hue, 0.95, 0.56);
      ballVortexMat.color.setHSL((hue + 0.35) % 1.0, 0.95, 0.62);
      ballFireAuraMesh.visible = true;
      ballVortexRingMesh.visible = true;
      ballVortexRingMesh.rotation.z = gameState.simTime * 8.0;
    } else if (isCurve) {
      sharedMats.fireAura.color.setHex(0x00e5ff);
      ballVortexMat.color.setHex(0x38bdf8);
      ballFireAuraMesh.visible = true;
      ballVortexRingMesh.visible = true;
      ballVortexRingMesh.rotation.z = gameState.simTime * 10.0;
    } else if (isFire) {
      sharedMats.fireAura.color.setHex(0xff9500);
      ballFireAuraMesh.visible = true;
      ballVortexRingMesh.visible = false;
    } else if (isBomb) {
      sharedMats.fireAura.color.setHex(0xd946ef);
      ballVortexMat.color.setHex(0xf472b6);
      ballFireAuraMesh.visible = true;
      ballVortexRingMesh.visible = true;
      ballVortexRingMesh.rotation.z = -gameState.simTime * 6.5;
    } else {
      ballFireAuraMesh.visible = false;
      ballVortexRingMesh.visible = false;
    }
  }

  function updateAimDots() {
    const show = gameState.phase === 'aiming';
    aimGroup.visible = show;
    if (!show) return;

    const effectiveSpin = gameState.spinCurve + (gameState.activePower === 1 ? 0.65 : 0);
    for (let i = 0; i < AIM_DOT_COUNT; i++) {
      const t = (i + 1) / AIM_DOT_COUNT;
      const dist = t * 24.5;
      const z = BALL_START_Z - dist;
      const x = gameState.aimX + Math.sin(gameState.aimAngle) * dist + 0.5 * effectiveSpin * (t * t) * 4.2;
      aimDots[i].position.set(Math.max(-3.3, Math.min(3.3, x)), 0.16, z);
      aimDots[i].scale.setScalar(1.0 - t * 0.35);
    }
  }

  function resetActiveParticles() {
    for (let i = 0; i < starPool.length; i++) {
      starPool[i].active = false;
      starPool[i].mesh.visible = false;
    }
    for (let i = 0; i < ringPool.length; i++) {
      ringPool[i].active = false;
      ringPool[i].mesh.visible = false;
    }
    for (let i = 0; i < coinPool.length; i++) {
      coinPool[i].active = false;
      coinPool[i].group.visible = false;
    }
    if (coinPulseTimeout) {
      clearTimeout(coinPulseTimeout);
      coinPulseTimeout = null;
    }
  }

  let edgeCaseListenersBound = false;
  function ensureEdgeCaseListeners() {
    if (edgeCaseListenersBound) return;
    edgeCaseListenersBound = true;

    window.addEventListener('pointercancel', () => {
      if (typeof dragState !== 'undefined') dragState.active = false;
      if (typeof spinDragging !== 'undefined') spinDragging = false;
      btnAimLeft.classList.remove('pressed');
      btnAimRight.classList.remove('pressed');
    });

    window.addEventListener('blur', () => {
      if (typeof dragState !== 'undefined') dragState.active = false;
      if (typeof spinDragging !== 'undefined') spinDragging = false;
      btnAimLeft.classList.remove('pressed');
      btnAimRight.classList.remove('pressed');
    });

    const handleViewportUpdate = () => {
      syncCameraProjection();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleViewportUpdate);
    window.addEventListener('orientationchange', handleViewportUpdate);

    window.addEventListener('keydown', e => {
      if (e.repeat) return;
      if (gameState.phase === 'finished' && !podiumModalEl.classList.contains('hidden')) {
        if (e.code === 'KeyR') {
          e.preventDefault();
          startStageMatch(gameState.stageIndex);
        } else if (e.code === 'Space' || e.code === 'Enter') {
          e.preventDefault();
          if (!btnNext.disabled && !btnNext.classList.contains('hidden')) {
            btnNext.click();
          } else {
            btnRetry.click();
          }
        }
      }
    });
  }

  function startStageMatch(stageIndex) {
    ensureEdgeCaseListeners();
    resetActiveParticles();
    gameState.stageIndex = Math.max(0, Math.min(7, stageIndex));
    saveState.selectedStage = gameState.stageIndex;
    saveProgress();

    podiumModalEl.classList.add('hidden');
    buildAlleyForStage(STAGES[gameState.stageIndex]);
    initTournamentRoster();
    applyPlayerCritterVisuals();

    gameState.frame = 1;
    gameState.ballInFrame = 1;
    gameState.frameResults = [];
    gameState.aimX = 0;
    gameState.aimAngle = 0;
    gameState.spinCurve = 0;
    gameState.activePower = 0;
    gameState.fever = 0;
    gameState.feverActive = false;
    gameState.feverTimer = 0;
    gameState.trauma = 0;
    gameState.hitStopTimer = 0;
    gameState.slowMoTimer = 0;

    gameState.pedals[1].charges = 3;
    gameState.pedals[1].cooldown = 0;
    gameState.pedals[2].charges = 2;
    gameState.pedals[2].cooldown = 0;
    gameState.pedals[3].charges = 2;
    gameState.pedals[3].cooldown = 0;

    rackAllPins();
    resetBallToBowlerLine();
    updateCamera(1.0);
    updateBallVisuals();
    renderStageRail();
    renderCritterBar();
    renderFrameDots();
    renderPedalsHUD();
    renderFeverHUD();
    renderLeaderboard();
  }

  function launchBall() {
    if (gameState.phase !== 'aiming') return false;

    sfx.playRoll();
    gameState.phase = 'rolling';
    gameState.ball.x = gameState.aimX;
    gameState.ball.y = 0;
    gameState.ball.z = BALL_START_Z;
    gameState.ball.rollTimer = 0;
    gameState.ball.trailTimer = 0;
    gameState.ball.settleTimer = 0;
    gameState.firstPinHitThisRoll = false;
    gameState.strikeSlowMoTriggeredThisRoll = false;

    const powerFactor = 0.86 + 0.24 * gameState.powerOsc;
    const baseSpeed = (gameState.activePower === 2 || gameState.feverActive) ? 28.5 : 23.5;
    const speed = baseSpeed * powerFactor;

    gameState.ball.vx = Math.sin(gameState.aimAngle) * speed;
    gameState.ball.vz = -Math.cos(gameState.aimAngle) * speed;

    let spinVal = gameState.spinCurve;
    if (gameState.activePower === 1) {
      spinVal += (gameState.aimX > 0 ? -0.75 : 0.75);
    }
    gameState.ball.spin = spinVal;

    // During Rainbow Fever, power pedal casts are supercharged with halved cooldown!
    if (gameState.activePower > 0) {
      const p = gameState.pedals[gameState.activePower];
      if (p) {
        if (!gameState.feverActive) {
          p.charges = Math.max(0, p.charges - 1);
        }
        p.cooldown = gameState.feverActive ? p.maxCooldown * 0.35 : p.maxCooldown;
      }
      renderPedalsHUD();
    }

    updateAimDots();
    return true;
  }

  function activatePedal(pedalId) {
    if (gameState.phase === 'finished') return false;
    const p = gameState.pedals[pedalId];
    if (!p || p.charges <= 0 || p.cooldown > 0) return false;

    if (gameState.activePower === pedalId) {
      return false;
    }

    gameState.activePower = pedalId;
    sfx.playPedal(pedalId);

    if (gameState.phase === 'rolling') {
      if (!gameState.feverActive) {
        p.charges = Math.max(0, p.charges - 1);
      }
      p.cooldown = gameState.feverActive ? p.maxCooldown * 0.35 : p.maxCooldown;
      if (pedalId === 1) {
        const targetX = getAverageStandingPinX();
        gameState.ball.vx = Math.max(-14, Math.min(14, gameState.ball.vx + (targetX - gameState.ball.x) * 3.8));
        spawnFloorShockwaveRing(gameState.ball.x, gameState.ball.z, 1.8, 0x00e5ff, 0.42);
      } else if (pedalId === 2) {
        gameState.ball.vz = Math.min(-29.0, gameState.ball.vz * 1.28);
        spawnFloorShockwaveRing(gameState.ball.x, gameState.ball.z, 2.2, 0xff9500, 0.45);
      } else if (pedalId === 3) {
        triggerBombShockwave(gameState.ball.x, gameState.ball.z, 4.4);
      }
    }

    updateBallVisuals();
    updateAimDots();
    renderPedalsHUD();
    return true;
  }

  function getAverageStandingPinX() {
    let sum = 0;
    let count = 0;
    for (let i = 0; i < MAX_PINS; i++) {
      if (pinEntities[i].active && pinEntities[i].standing) {
        sum += pinEntities[i].x;
        count++;
      }
    }
    return count > 0 ? sum / count : 0;
  }

  function triggerBombShockwave(cx, cz, blastRadius) {
    spawnFloorShockwaveRing(cx, cz, blastRadius, 0xd946ef, 0.55);
    spawnFloorShockwaveRing(cx, cz, blastRadius * 0.68, 0xffd84d, 0.42);
    spawnImpactBurst(cx, 0.6, cz, 12, 0);
    addTrauma(0.80);

    for (let i = 0; i < MAX_PINS; i++) {
      const pin = pinEntities[i];
      if (!pin.active || !pin.standing) continue;
      const dx = pin.x - cx;
      const dz = pin.z - cz;
      const dist = Math.hypot(dx, dz);
      if (dist <= blastRadius) {
        const nx = dist > 0.01 ? dx / dist : (Math.random() - 0.5);
        const nz = dist > 0.01 ? dz / dist : -1;
        knockDownPin(pin, nx * 13.5, nz * 15.0 - 4.0, false);
      }
    }
  }

  // Impulse-Aligned Pin Knockdown + Flying 3D Star Coins + Hit-Stop / Slow-Mo + Batched HUD
  function knockDownPin(pin, vx, vz, isDirectBallHit = false) {
    if (!pin.standing) return;
    pin.standing = false;
    pin.sleeping = false;
    pin.vx = vx + (Math.random() - 0.5) * 1.6;
    pin.vy = 2.8 + Math.random() * 2.2;
    pin.vz = vz - Math.random() * 1.8;

    const mag = Math.hypot(pin.vx, pin.vz) || 1;
    const dx = pin.vx / mag;
    const dz = pin.vz / mag;
    const rotRate = 8.8 + Math.random() * 2.2;
    pin.rvx = rotRate * dz;
    pin.rvz = -rotRate * dx;

    const player = gameState.racers[0];
    const feverMult = gameState.feverActive ? 2 : 1;
    const isSpecial = pin.isKingpin || pin.isBonus;
    const pts = (isSpecial ? 180 : 100) * feverMult;
    player.score += pts;
    player.pinsKnocked += 1;

    spawnFlyingStarCoins(pin.x, 1.2, pin.z, isSpecial ? 2 : 1);

    if (!gameState.feverActive) {
      gameState.fever = Math.min(100, gameState.fever + 11);
      if (gameState.fever >= 100) {
        triggerRainbowLaneWave();
      }
      hudDirty.fever = true;
    }

    if (isDirectBallHit && !gameState.firstPinHitThisRoll) {
      gameState.firstPinHitThisRoll = true;
      gameState.hitStopTimer = 0.05;
      gameState.lastHitStopTriggered = true;
      addTrauma(0.50);
    } else {
      addTrauma(0.25);
    }

    if (!gameState.strikeSlowMoTriggeredThisRoll && countStandingCorePins() === 0) {
      gameState.strikeSlowMoTriggeredThisRoll = true;
      gameState.slowMoTimer = 0.40;
      gameState.lastSlowMoTriggered = true;
      addTrauma(0.80);
      spawnFloorShockwaveRing(0, PIN_BASE_Z - 1.8, 4.0, 0x38ef7d, 0.56);
    }

    sfx.playPinHit(player.pinsKnocked % 10);
    spawnImpactBurst(pin.x, 0.9, pin.z, 5, 1.25, isSpecial ? 0xffd84d : 0x00e5ff);

    hudDirty.rivals = true;
    hudDirty.miniRack = true;
    hudDirty.leaderboard = true;
  }

  // Unified 2D Normal Contact Resolver (with minimum down-lane speed guardrail so ball never stalls!)
  function resolveContact(b, nx, nz, depth, obsVx, obsVz, obs, restitution = 0.58) {
    if (depth > 0) {
      b.x += nx * depth;
      b.z += nz * depth;
    }
    if (obs && typeof obs.lastHit === 'number' && (gameState.simTime - obs.lastHit) < 0.15) {
      return false;
    }
    const rvx = b.vx - obsVx;
    const rvz = b.vz - obsVz;
    const vn = rvx * nx + rvz * nz;
    if (vn < 0) {
      const j = -(1 + restitution) * vn;
      b.vx += j * nx;
      b.vz += j * nz;
    }
    b.vx = Math.max(-14, Math.min(14, b.vx));
    b.vz = Math.min(-8.5, b.vz);
    if (obs) {
      obs.lastHit = gameState.simTime;
    }
    addTrauma(0.28);
    spawnImpactBurst(b.x - nx * b.radius, 0.5, b.z - nz * b.radius, 4, 1.15, 0xff4b91);
    sfx.playBumperBoing();
    return true;
  }

  function cheerAllRivals(duration = 0.50) {
    for (let i = 0; i < rivalBillboards.length; i++) {
      rivalBillboards[i].hopTimer = Math.max(rivalBillboards[i].hopTimer, duration);
    }
  }

  // Ball-by-Ball AI Rival Bowling Simulation with Per-Critter Archetypes, 3D Pedestal Celebrations & Stage 1-2 Kid Rubber-Banding
  function simulateAIRivalsForRoll(isFrameEnd) {
    const stage = STAGES[gameState.stageIndex];
    const baseSkill = stage.aiSkill;
    const player = gameState.racers[0];

    for (let i = 1; i < gameState.racers.length; i++) {
      const rival = gameState.racers[i];
      const c = rival.critter;
      const slot = RIVAL_SLOTS[i - 1];
      let skill = baseSkill + (2.5 - i) * 0.03 + (c.strikeBoost || 0);

      // Kid-friendly rubber-banding on Stages 1-2 so a kid knocking down 7+ pins per frame reliably wins 3 stars on Stage 1!
      const isEarlyStage = gameState.stageIndex <= 1;
      const leadOverPlayer = rival.score - (player ? player.score : 0);
      if (isEarlyStage && leadOverPlayer > -140) {
        skill *= 0.58;
      }

      // Ball 1 of the frame for this rival
      if (!rival.frameBall || rival.frameBall === 0) {
        const strikeChance = Math.max(0.03, (skill - 0.14) * 0.42 + (c.strikeBoost || 0));
        const allowStrike = !(gameState.stageIndex === 0 && leadOverPlayer > -260);
        if (allowStrike && Math.random() < strikeChance) {
          rival.pinsKnocked += 10;
          rival.score += 10 * 88 + 210;
          rival.framePinsDown = 10;
          rival.frameBall = 2;
          rival.lastBadge = '⚡';
          if (rivalBillboards[i - 1]) {
            rivalBillboards[i - 1].hopTimer = 0.52;
          }
          if (slot) {
            spawnFloorShockwaveRing(slot.x, slot.z, 1.85, c.color, 0.48);
            spawnImpactBurst(slot.x, 1.95, slot.z, 5, 0, c.color);
          }
        } else {
          const variance = (1 - (c.consistency || 0.8)) * 3.2;
          const b1Pins = Math.max(3, Math.min(8, Math.round(3.8 + skill * 4.2 + (Math.random() - 0.45) * variance)));
          rival.pinsKnocked += b1Pins;
          rival.score += b1Pins * 84;
          rival.framePinsDown = b1Pins;
          rival.frameBall = 1;
          rival.lastBadge = b1Pins >= 7 ? '⭐' : '🎳';
          if (rivalBillboards[i - 1] && b1Pins >= 7) {
            rivalBillboards[i - 1].hopTimer = 0.28;
          }
        }
      }

      // Ball 2 (Spare Attempt) if the frame is ending and rival didn't strike on Ball 1
      if (isFrameEnd && rival.frameBall === 1 && rival.framePinsDown < 10) {
        const remaining = 10 - rival.framePinsDown;
        const spareProb = Math.max(0.06, (c.spareSkill || 0.7) * skill * (isEarlyStage ? 0.45 : 0.82));
        let b2Pins = 0;
        if (Math.random() < spareProb && !(gameState.stageIndex === 0 && leadOverPlayer > -160)) {
          b2Pins = remaining;
          rival.lastBadge = '✨';
          rival.score += b2Pins * 84 + 115;
          if (rivalBillboards[i - 1]) {
            rivalBillboards[i - 1].hopTimer = 0.40;
          }
          if (slot) {
            spawnFloorShockwaveRing(slot.x, slot.z, 1.45, c.accent || c.color, 0.38);
          }
        } else {
          b2Pins = Math.max(0, Math.min(remaining - 1, Math.round(remaining * (0.28 + skill * 0.42) * Math.random())));
          rival.score += b2Pins * 82;
          if (rival.framePinsDown + b2Pins >= 8) {
            rival.lastBadge = '⭐';
          }
        }
        rival.pinsKnocked += b2Pins;
        rival.framePinsDown += b2Pins;
        rival.frameBall = 2;
      }

      if (isFrameEnd) {
        rival.frameBall = 0;
        rival.framePinsDown = 0;
      }
    }

    syncRivalBillboardTextures();
    renderLeaderboard();
  }

  function completeCurrentDelivery() {
    const standingCore = countStandingCorePins();
    const knockedCore = 10 - standingCore;
    const player = gameState.racers[0];

    gameState.activePower = 0;
    renderPedalsHUD();

    if (gameState.ballInFrame === 1) {
      if (standingCore === 0) {
        player.score += 350;
        player.lastBadge = '⚡';
        gameState.frameResults.push('strike');
        refillPedalCharges(1, false);
        cheerAllRivals(0.55);
        sfx.playStrikeFanfare();
        showToast('🎳⚡⭐⭐⭐⚡🎳');
        simulateAIRivalsForRoll(true);
        advanceToNextFrame();
      } else {
        player.lastBadge = knockedCore >= 7 ? '⭐' : '🎳';
        simulateAIRivalsForRoll(false);
        gameState.ballInFrame = 2;
        clearKnockedPinsForSpare();
        resetBallToBowlerLine();
      }
    } else {
      if (standingCore === 0) {
        player.score += 180;
        player.lastBadge = '✨';
        gameState.frameResults.push('spare');
        refillPedalCharges(1, false);
        cheerAllRivals(0.42);
        sfx.playStrikeFanfare();
        showToast('🎳✨⭐⭐✨🎳');
      } else {
        player.lastBadge = knockedCore >= 7 ? '⭐' : '🎳';
        gameState.frameResults.push(knockedCore >= 7 ? 'good' : 'open');
        if (knockedCore >= 7) showToast('🎳👍✨');
      }
      simulateAIRivalsForRoll(true);
      advanceToNextFrame();
    }

    renderFrameDots();
    renderLeaderboard();
  }

  function advanceToNextFrame() {
    if (gameState.frame >= TOTAL_FRAMES) {
      finishTournamentMatch();
      return;
    }
    gameState.frame += 1;
    gameState.ballInFrame = 1;
    rackAllPins();
    resetBallToBowlerLine();
  }

  function finishTournamentMatch(forcedRank = null) {
    gameState.phase = 'finished';

    if (typeof forcedRank === 'number' && forcedRank >= 1 && forcedRank <= 5) {
      const rivals = gameState.racers.filter(r => !r.isPlayer);
      rivals.forEach((r, idx) => {
        r.score = 4200 - idx * 450;
      });
      const player = gameState.racers.find(r => r.isPlayer);
      if (forcedRank === 1) player.score = 4800;
      else if (forcedRank === 2) player.score = 3950;
      else if (forcedRank === 3) player.score = 3500;
      else if (forcedRank === 4) player.score = 3050;
      else player.score = 2400;
    }

    const sorted = [...gameState.racers].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.isPlayer ? -1 : 1;
    });

    const playerRank = sorted.findIndex(r => r.isPlayer) + 1;
    const stars = playerRank === 1 ? 3 : (playerRank === 2 ? 2 : (playerRank === 3 ? 1 : 0));
    const qualified = playerRank <= 3;

    gameState.lastRank = playerRank;
    gameState.lastStars = stars;

    if (qualified) {
      saveState.starsByStage[gameState.stageIndex] = Math.max(
        saveState.starsByStage[gameState.stageIndex] || 0,
        stars
      );
      if (gameState.stageIndex < 7 && saveState.unlockedStage <= gameState.stageIndex) {
        saveState.unlockedStage = gameState.stageIndex + 1;
      }
      saveProgress();
      sfx.playStrikeFanfare();
      cheerAllRivals(0.65);
      // Celebratory 3D lane fireworks behind the podium modal!
      const fwColors = [0xffd84d, 0x38ef7d, 0x00e5ff, 0xff4b91];
      [-4, -12, -20].forEach((fz, idx) => {
        const fx = (idx - 1) * 2.4;
        spawnFloorShockwaveRing(fx, fz, 3.2, fwColors[idx % fwColors.length], 0.58);
        spawnImpactBurst(fx, 1.4, fz, 6, 0, fwColors[(idx + 1) % fwColors.length]);
      });
    } else {
      sfx.playDefeatMotif();
    }

    syncRivalBillboardTextures();
    renderStageRail();
    renderLeaderboard();
    showPodiumModal(sorted, playerRank, stars, qualified);
  }

  function showPodiumModal(sortedRacers, playerRank, stars, qualified) {
    const isGrandFinale = qualified && gameState.stageIndex === 7;
    modalCrestEl.textContent = isGrandFinale
      ? '👑🏆🌈🎳🏆👑'
      : (qualified ? '🏆🌈🎳' : '😢💔🎳🔄');
    modalStarsEl.textContent = stars === 3 ? '⭐⭐⭐' : (stars === 2 ? '⭐⭐🖤' : (stars === 1 ? '⭐🖤🖤' : '🖤🖤🖤'));

    if (podiumCardEl) {
      podiumCardEl.classList.toggle('victory-mode', qualified);
      podiumCardEl.classList.toggle('defeat-mode', !qualified);
    }

    const podiumOrder = [
      { idx: 1, cls: 'second', medal: '🥈' },
      { idx: 0, cls: 'first', medal: '🥇' },
      { idx: 2, cls: 'third', medal: '🥉' }
    ];
    podiumStageEl.innerHTML = podiumOrder.map(p => {
      const r = sortedRacers[p.idx];
      if (!r) return '';
      const playerCls = r.isPlayer ? 'is-player-podium' : '';
      const haloHtml = r.isPlayer ? '<span class="player-podium-halo">👑✨</span>' : '';
      return `
        <div class="podium-column ${p.cls} ${playerCls}">
          ${haloHtml}
          <img class="podium-avatar" src="${r.critter.icon}" alt="${r.critter.emoji}" />
          <div class="podium-pedestal">
            <span>${p.medal}</span>
            <span>${r.critter.emoji}</span>
          </div>
        </div>
      `;
    }).join('');

    const rankMedals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
    modalStandingsEl.innerHTML = sortedRacers.map((r, i) => {
      const highlightCls = r.isPlayer ? (qualified ? 'player-highlight' : 'defeat-highlight') : '';
      const statusSuffix = (r.isPlayer && !qualified) ? '😢💔' : '';
      return `
        <div class="standing-chip ${highlightCls}">
          <span>${rankMedals[i]}</span>
          <img src="${r.critter.icon}" alt="${r.critter.emoji}" />
          <span>🎳${Math.max(1, Math.round(r.score / 100))}${statusSuffix}</span>
        </div>
      `;
    }).join('');

    const canAdvance = qualified && gameState.stageIndex < 7;
    btnNext.disabled = !canAdvance;
    if (canAdvance) {
      btnNext.classList.remove('hidden');
    } else {
      btnNext.classList.add('hidden');
    }

    podiumModalEl.classList.remove('hidden');
  }

  function wrapAngleSigned(a) {
    let r = (a + Math.PI) % (Math.PI * 2);
    if (r < 0) r += Math.PI * 2;
    return r - Math.PI;
  }

  // Fixed-Substep Physics Step
  function stepPhysicsSubstep(dt) {
    gameState.simTime += dt;

    if (gameState.ballBounceTimer > 0) {
      gameState.ballBounceTimer = Math.max(0, gameState.ballBounceTimer - dt);
    }

    // Cooldowns & Automatic Charge Regeneration + Rainbow Fever 3D Light Show!
    let pedalChanged = false;
    for (let id = 1; id <= 3; id++) {
      const p = gameState.pedals[id];
      if (p.cooldown > 0) {
        p.cooldown = Math.max(0, p.cooldown - dt);
        if (p.cooldown === 0) {
          // Automatically regenerate 1 charge when cooldown finishes so pedals never stay permanently empty!
          if (p.charges < p.maxCharges) {
            p.charges = Math.min(p.maxCharges, p.charges + 1);
          }
          triggerPedalRechargePop(id);
          // If charges are still below maxCharges, start next charge regeneration cycle
          if (p.charges < p.maxCharges) {
            p.cooldown = p.maxCooldown;
          }
        }
        pedalChanged = true;
      } else if (p.charges < p.maxCharges) {
        p.cooldown = p.maxCooldown;
        pedalChanged = true;
      }
    }
    if (pedalChanged) renderPedalsHUD();

    if (gameState.feverActive) {
      gameState.feverTimer -= dt;
      gameState.fever = Math.max(0, (gameState.feverTimer / 9.0) * 100);
      // Pulse the 4 overhead 3D neon arches and gutter rails with a synchronized HSL rainbow wave!
      const hue = (gameState.simTime * 1.15) % 1.0;
      if (stageArchMat) {
        stageArchMat.color.setHSL(hue, 0.95, 0.58);
        stageArchMat.emissive.setHSL(hue, 0.95, 0.55);
      }
      if (stageRailMat) {
        const railHue = (hue + 0.45) % 1.0;
        stageRailMat.color.setHSL(railHue, 0.95, 0.58);
        stageRailMat.emissive.setHSL(railHue, 0.95, 0.55);
      }
      if (gameState.feverTimer <= 0) {
        gameState.feverActive = false;
        gameState.fever = 0;
        if (stageArchMat) {
          stageArchMat.color.setHex(stageBaseArchColor);
          stageArchMat.emissive.setHex(stageBaseArchColor);
        }
        if (stageRailMat) {
          stageRailMat.color.setHex(stageBaseRailColor);
          stageRailMat.emissive.setHex(stageBaseRailColor);
        }
      }
      hudDirty.fever = true;
    }

    // Power oscillator during aiming (with Sweet-Spot Highlight Glow!)
    if (gameState.phase === 'aiming') {
      gameState.powerOsc += gameState.powerDir * dt * 1.15;
      if (gameState.powerOsc >= 1.0) {
        gameState.powerOsc = 1.0;
        gameState.powerDir = -1;
      } else if (gameState.powerOsc <= 0.25) {
        gameState.powerOsc = 0.25;
        gameState.powerDir = 1;
      }
      powerFillEl.style.width = `${Math.round(gameState.powerOsc * 100)}%`;
      if (powerTrackEl) {
        const inSweetSpot = gameState.powerOsc >= 0.76 && gameState.powerOsc <= 0.92;
        powerTrackEl.classList.toggle('in-sweetspot', inSweetSpot);
      }
      gameState.ball.x = gameState.aimX;
      updateBallVisuals();
      updateAimDots();
    } else if (powerTrackEl) {
      powerTrackEl.classList.remove('in-sweetspot');
    }

    // Sync phase-reactive #btn-roll affordance (ready-to-bowl pulse vs rolling-busy)
    const isAimingPhase = gameState.phase === 'aiming';
    btnRoll.classList.toggle('ready-to-bowl', isAimingPhase);
    btnRoll.classList.toggle('rolling-busy', !isAimingPhase);

    // Animate Stage Props
    for (let i = 0; i < stageAnimatedProps.length; i++) {
      const ap = stageAnimatedProps[i];
      if (ap.rotSpeed) ap.mesh.rotation.y += ap.rotSpeed * dt;
      if (ap.rotZSpeed) ap.mesh.rotation.z += ap.rotZSpeed * dt;
    }

    // Animate Stage Obstacles & Compute Exact Obstacle Velocities
    for (let i = 0; i < stageObstacles.length; i++) {
      const obs = stageObstacles[i];
      if (obs.kind === 'spinner') {
        obs.angle += obs.speed * dt;
        obs.group.rotation.y = obs.angle;
      } else if (obs.kind === 'slider') {
        const phaseArg = gameState.simTime * obs.speed + obs.phase;
        obs.x = obs.baseX + Math.sin(phaseArg) * obs.amp;
        obs.vx = obs.amp * obs.speed * Math.cos(phaseArg);
        obs.group.position.x = obs.x;
      } else if (obs.kind === 'bumper') {
        if (obs.sliding) {
          const phaseArg = gameState.simTime * obs.speed + obs.phase;
          obs.x = obs.baseX + Math.sin(phaseArg) * obs.amp;
          obs.vx = obs.amp * obs.speed * Math.cos(phaseArg);
          obs.group.position.x = obs.x;
        } else {
          obs.vx = 0;
        }
      } else if (obs.kind === 'laser_beam') {
        const span = Math.max(0.2, Math.abs(obs.postB.x - obs.postA.x));
        obs.group.position.x = (obs.postA.x + obs.postB.x) * 0.5;
        obs.group.scale.set(1, span, 1);
        obs.active = Math.sin(gameState.simTime * 3.2) > -0.35;
        obs.group.visible = obs.active;
      } else if (obs.kind === 'knockable_block' && obs.knocked && obs.group.visible) {
        obs.knockedTimer += dt;
        obs.x += obs.vx * dt;
        obs.y = Math.max(0.59, obs.y + obs.vy * dt);
        obs.z += obs.vz * dt;
        obs.vy -= 18.0 * dt;

        // Ground friction on knocked toy blocks
        if (obs.y <= 0.60) {
          obs.y = 0.59;
          obs.vy = 0;
          const bSpd = Math.hypot(obs.vx, obs.vz);
          const bDecel = 6.2 * dt;
          if (bSpd <= bDecel) {
            obs.vx = 0;
            obs.vz = 0;
          } else {
            obs.vx *= (bSpd - bDecel) / bSpd;
            obs.vz *= (bSpd - bDecel) / bSpd;
          }
        }

        // Kickback walls & Backboard containment for toy blocks
        if (Math.abs(obs.x) > 4.6) {
          obs.x = Math.sign(obs.x) * 4.6;
          obs.vx = -obs.vx * 0.4;
        }
        if (obs.z < -28.4) {
          obs.z = -28.4;
          obs.vz = Math.abs(obs.vz) * 0.35;
          obs.vx *= 0.5;
        }

        obs.group.position.set(obs.x, obs.y, obs.z);
        const moveSpd = Math.hypot(obs.vx, obs.vz);
        obs.group.rotation.x += moveSpd * 0.4 * dt;
        obs.group.rotation.y += moveSpd * 0.3 * dt;

        // Knocked toy blocks join the domino loop and knock standing pins!
        if (moveSpd > 0.6) {
          for (let pIdx = 0; pIdx < MAX_PINS; pIdx++) {
            const pin = pinEntities[pIdx];
            if (!pin.active || !pin.standing) continue;
            const pdx = pin.x - obs.x;
            const pdz = pin.z - obs.z;
            const pDist = Math.hypot(pdx, pdz);
            if (pDist < obs.radius + 0.48) {
              const pnx = pDist > 0.01 ? pdx / pDist : 0;
              const pnz = pDist > 0.01 ? pdz / pDist : -1;
              knockDownPin(pin, pnx * 11.0 + obs.vx * 0.5, pnz * 11.5 + obs.vz * 0.5, false);
            }
          }
        }

        // Smooth fade-out after 1.5s
        if (obs.knockedTimer > 1.2) {
          const fadeScale = Math.max(0, 1 - (obs.knockedTimer - 1.2) / 0.35);
          obs.group.scale.setScalar(fadeScale);
          if (obs.knockedTimer >= 1.55) {
            obs.group.visible = false;
          }
        }
      }
    }

    // Update 3D Rival Billboard Medallions with Continuous Spectator Idle Bob/Sway + Cheer Hops!
    for (let i = 0; i < rivalBillboards.length; i++) {
      const bb = rivalBillboards[i];
      const idleBob = Math.sin(gameState.simTime * 3.2 + i * 1.4) * 0.12;
      const idleSway = Math.cos(gameState.simTime * 2.5 + i * 1.7) * 0.07;
      let hopY = 0;
      if (bb.hopTimer > 0) {
        bb.hopTimer = Math.max(0, bb.hopTimer - dt);
        hopY = Math.sin((bb.hopTimer / 0.52) * Math.PI) * 0.88;
      }
      bb.badgeGroup.position.y = bb.baseY + idleBob + hopY;
      bb.badgeGroup.lookAt(camera.position.x, bb.badgeGroup.position.y, camera.position.z);
      bb.badgeGroup.rotation.z += idleSway;
    }

    // Update Rolling Bowling Ball
    if (gameState.phase === 'rolling') {
      const b = gameState.ball;
      b.rollTimer += dt;

      b.vx += b.spin * 4.2 * dt;

      const targetX = getAverageStandingPinX();
      const homingStrength = (gameState.activePower === 1 || gameState.feverActive) ? 2.4 : 0.75;
      if (b.z > PIN_BASE_Z + 1.5) {
        b.vx += (targetX - b.x) * homingStrength * dt;
      }

      b.vx = Math.max(-14, Math.min(14, b.vx));
      b.x += b.vx * dt;
      b.z += b.vz * dt;

      // Radius-aware bounce off glowing lane bumper rails (inner rail edge is at x = ±4.17)
      const maxBallX = Math.max(2.6, 4.17 - b.radius);
      if (b.x < -maxBallX) {
        b.x = -maxBallX;
        b.vx = Math.min(14, Math.abs(b.vx) * 0.72 + 1.2);
        spawnImpactBurst(b.x, 0.4, b.z, 3, 0.9, 0xff4081);
      } else if (b.x > maxBallX) {
        b.x = maxBallX;
        b.vx = Math.max(-14, -Math.abs(b.vx) * 0.72 - 1.2);
        spawnImpactBurst(b.x, 0.4, b.z, 3, 0.9, 0xff4081);
      }

      ballOuterMesh.rotation.x -= Math.abs(b.vz) * dt * 1.1;
      ballOuterMesh.rotation.z -= b.vx * dt * 0.6;

      // Distinct 3D Rolling Lane Particle & Shockwave Trails per Active Power Pedal & Rainbow Fever!
      b.trailTimer = (b.trailTimer || 0) + dt;
      if ((gameState.activePower > 0 || gameState.feverActive) && b.trailTimer >= 0.045) {
        b.trailTimer = 0;
        if (gameState.feverActive) {
          const rainbowCol = new THREE.Color().setHSL((gameState.simTime * 2.5) % 1.0, 0.98, 0.58).getHex();
          spawnImpactBurst(b.x, 0.45, b.z + 0.4, 2, 0.95, rainbowCol);
          spawnFloorShockwaveRing(b.x, b.z, 1.45, rainbowCol, 0.30);
        } else if (gameState.activePower === 1) {
          // Pedal 1 Curve Spin: Cyan vortex lane rings & sparkles
          spawnFloorShockwaveRing(b.x, b.z, 1.35, 0x00e5ff, 0.28);
          spawnImpactBurst(b.x, 0.45, b.z + 0.35, 1, 0.75, 0x00e5ff);
        } else if (gameState.activePower === 2) {
          // Pedal 2 Fireball Strike: Blazing gold-orange comet embers
          spawnImpactBurst(b.x, 0.55, b.z + 0.45, 2, 1.15, 0xff9500);
          spawnFloorShockwaveRing(b.x, b.z, 1.4, 0xff6d00, 0.26);
        } else if (gameState.activePower === 3) {
          // Pedal 3 Giant Bomb Ball: Magenta-purple heavy shockwave rings
          spawnFloorShockwaveRing(b.x, b.z, 1.85, 0xd946ef, 0.32);
          spawnImpactBurst(b.x, 0.65, b.z + 0.5, 2, 1.1, 0xd946ef);
        }
      }

      // Obstacle Collisions via Unified 2D Normal Contact Resolver
      const ignoreObstacles = (gameState.activePower === 2 || gameState.activePower === 3 || gameState.feverActive);
      for (let i = 0; i < stageObstacles.length; i++) {
        const obs = stageObstacles[i];
        if (obs.kind === 'knockable_block' && !obs.knocked) {
          const dx = b.x - obs.x;
          const dz = b.z - obs.z;
          const dist = Math.hypot(dx, dz);
          const minDist = b.radius + obs.radius;
          if (dist < minDist) {
            const nx = dist > 0.0001 ? dx / dist : 0;
            const nz = dist > 0.0001 ? dz / dist : 1;
            obs.knocked = true;
            obs.knockedTimer = 0;
            obs.vx = -nx * 7.5 + b.vx * 0.55;
            obs.vy = 3.8;
            obs.vz = b.vz * 0.68 - 3.5;
            if (!ignoreObstacles) {
              b.vz *= 0.92;
              b.vx = Math.max(-14, Math.min(14, b.vx + nx * 1.25));
            }
            gameState.racers[0].score += 60;
            spawnFlyingStarCoins(obs.x, 1.0, obs.z, 1);
            spawnImpactBurst(obs.x, 0.8, obs.z, 5, 1.3, 0xffd84d);
            addTrauma(0.26);
            sfx.playPinHit(3);
            hudDirty.leaderboard = true;
          }
        } else if (!ignoreObstacles) {
          if (obs.kind === 'bumper') {
            const dx = b.x - obs.x;
            const dz = b.z - obs.z;
            const dist = Math.hypot(dx, dz);
            const minDist = b.radius + obs.radius;
            if (dist < minDist) {
              const nx = dist > 0.0001 ? dx / dist : 0;
              const nz = dist > 0.0001 ? dz / dist : 1;
              resolveContact(b, nx, nz, minDist - dist, obs.vx || 0, 0, obs, 0.58);
            }
          } else if (obs.kind === 'slider') {
            // Circle vs AABB (1.7 x 0.45 box)
            const cx = Math.max(obs.x - obs.halfW, Math.min(obs.x + obs.halfW, b.x));
            const cz = Math.max(obs.z - obs.halfD, Math.min(obs.z + obs.halfD, b.z));
            const dx = b.x - cx;
            const dz = b.z - cz;
            const dist = Math.hypot(dx, dz);
            if (dist < b.radius) {
              let nx = 0;
              let nz = 1;
              let depth = b.radius - dist;
              if (dist > 0.0001) {
                nx = dx / dist;
                nz = dz / dist;
              } else {
                const penX = obs.halfW - Math.abs(b.x - obs.x);
                const penZ = obs.halfD - Math.abs(b.z - obs.z);
                if (penX < penZ) {
                  nx = b.x >= obs.x ? 1 : -1;
                  nz = 0;
                  depth = penX + b.radius;
                } else {
                  nx = 0;
                  nz = b.z >= obs.z ? 1 : -1;
                  depth = penZ + b.radius;
                }
              }
              resolveContact(b, nx, nz, depth, obs.vx || 0, 0, obs, 0.58);
            }
          } else if (obs.kind === 'spinner') {
            // Circle vs Hub (r = 0.45) + Rotated Blade OBB (3.4 x 0.45) with Tangential Velocity omega x r
            const dx = b.x - obs.x;
            const dz = b.z - obs.z;
            const hubDist = Math.hypot(dx, dz);
            const minHub = b.radius + obs.hubRadius;
            if (hubDist < minHub) {
              const nx = hubDist > 0.0001 ? dx / hubDist : 0;
              const nz = hubDist > 0.0001 ? dz / hubDist : 1;
              resolveContact(b, nx, nz, minHub - hubDist, 0, 0, obs, 0.58);
            } else {
              const cosA = Math.cos(-obs.angle);
              const sinA = Math.sin(-obs.angle);
              const lx = dx * cosA - dz * sinA;
              const lz = dx * sinA + dz * cosA;
              const clx = Math.max(-obs.halfW, Math.min(obs.halfW, lx));
              const clz = Math.max(-obs.halfD, Math.min(obs.halfD, lz));
              const dlx = lx - clx;
              const dlz = lz - clz;
              const lDist = Math.hypot(dlx, dlz);
              if (lDist < b.radius) {
                let nlx = 0;
                let nlz = 1;
                if (lDist > 0.0001) {
                  nlx = dlx / lDist;
                  nlz = dlz / lDist;
                } else {
                  nlz = lz >= 0 ? 1 : -1;
                }
                const cosW = Math.cos(obs.angle);
                const sinW = Math.sin(obs.angle);
                const nx = nlx * cosW - nlz * sinW;
                const nz = nlx * sinW + nlz * cosW;
                // Tangential blade velocity omega x r at contact point
                const tanVx = -obs.speed * dz;
                const tanVz = obs.speed * dx;
                resolveContact(b, nx, nz, b.radius - lDist, tanVx, tanVz, obs, 0.58);
              }
            }
          } else if (obs.kind === 'laser_beam' && obs.active) {
            const minX = Math.min(obs.postA.x, obs.postB.x);
            const maxX = Math.max(obs.postA.x, obs.postB.x);
            const cx = Math.max(minX, Math.min(maxX, b.x));
            const dx = b.x - cx;
            const dz = b.z - obs.z;
            const dist = Math.hypot(dx, dz);
            const minDist = b.radius + 0.12;
            if (dist < minDist) {
              const nx = dist > 0.0001 ? dx / dist : 0;
              const nz = dist > 0.0001 ? dz / dist : 1;
              resolveContact(b, nx, nz, minDist - dist, 0, 0, obs, 0.45);
            }
          }
        }
      }

      // Ball-to-Pin Collisions (with Finite Ball Mass & Deflection)
      const hitRadius = b.radius + (gameState.activePower === 3 ? 1.45 : (gameState.activePower === 2 ? 0.95 : 0.62));
      for (let i = 0; i < MAX_PINS; i++) {
        const pin = pinEntities[i];
        if (!pin.active || !pin.standing) continue;
        const dx = pin.x - b.x;
        const dz = pin.z - b.z;
        const dist = Math.hypot(dx, dz);
        if (dist <= hitRadius) {
          const nx = dist > 0.01 ? dx / dist : (Math.random() - 0.5) * 0.4;
          const nz = dist > 0.01 ? dz / dist : -1.0;

          if (gameState.activePower === 3) {
            triggerBombShockwave(b.x, b.z, 5.2);
            b.vz *= 0.985;
          } else {
            const impulse = 14.5;
            knockDownPin(pin, nx * impulse + b.vx * 0.45, nz * impulse + b.vz * 0.55, true);
            // Finite ball mass: heavy pins slow and deflect a normal ball, while Fireball/Fever plow through!
            if (gameState.activePower === 2 || gameState.feverActive) {
              b.vz *= 0.985;
              b.vx = Math.max(-14, Math.min(14, b.vx - nx * 0.32));
            } else {
              b.vz *= 0.94;
              b.vx = Math.max(-14, Math.min(14, b.vx - nx * 1.15));
            }
          }
        }
      }

      updateBallVisuals();

      if (b.z < -28.2 || b.rollTimer > 3.2) {
        gameState.phase = 'settling';
        b.settleTimer = 0;
      }
    }

    // Update Flying / Domino Knocked Pins (Pit, Backboard, Kickbacks, Coulomb Friction, Smooth Lie-Down)
    for (let i = 0; i < MAX_PINS; i++) {
      const pin = pinEntities[i];
      if (!pin.active || pin.standing || pin.sleeping) continue;

      pin.x += pin.vx * dt;
      pin.y += pin.vy * dt;
      pin.z += pin.vz * dt;
      pin.vy -= 18.0 * dt;

      // Air drag while airborne
      if (pin.y > 0.02) {
        pin.vx *= (1 - 0.85 * dt);
        pin.vz *= (1 - 0.85 * dt);
      }

      // Sunken Pin Pit floor behind z = -27.2 (y = -0.60)
      const groundY = pin.z < -27.2 ? -0.60 : 0.0;

      // Kickback sidewalls at x = ±4.95 for the pin deck & pit
      const wallX = 4.95;
      if (pin.x < -wallX) {
        pin.x = -wallX;
        pin.vx = Math.abs(pin.vx) * 0.4;
      } else if (pin.x > wallX) {
        pin.x = wallX;
        pin.vx = -Math.abs(pin.vx) * 0.4;
      }

      // Backboard plane at z = -28.6
      if (pin.z < -28.6) {
        pin.z = -28.6;
        if (pin.vz < 0) {
          pin.vz = -pin.vz * 0.35;
          pin.vx *= 0.5;
          pin.rvx *= 0.5;
          spawnFloorShockwaveRing(pin.x, -28.4, 0.95, 0xffffff, 0.32);
        }
      }

      pin.rx = wrapAngleSigned(pin.rx + pin.rvx * dt);
      pin.rz = wrapAngleSigned(pin.rz + pin.rvz * dt);

      // Ground contact: Coulomb friction, angular damping, smooth ease to horizontal lying angle ±PI/2
      if (pin.y <= groundY) {
        pin.y = groundY;
        if (pin.vy < 0) pin.vy = 0;

        const spd = Math.hypot(pin.vx, pin.vz);
        const decel = 6.5 * dt;
        if (spd <= decel) {
          pin.vx = 0;
          pin.vz = 0;
        } else {
          pin.vx *= (spd - decel) / spd;
          pin.vz *= (spd - decel) / spd;
        }

        const angDamp = Math.max(0, 1 - 6.5 * dt);
        pin.rvx *= angDamp;
        pin.rvz *= angDamp;

        const targetRx = (pin.rx >= 0 ? 1 : -1) * (Math.PI * 0.48);
        pin.rx += (targetRx - pin.rx) * Math.min(1, 8.5 * dt);

        if (spd < 0.05 && Math.hypot(pin.rvx, pin.rvz) < 0.08 && Math.abs(targetRx - pin.rx) < 0.04) {
          pin.vx = 0;
          pin.vz = 0;
          pin.rvx = 0;
          pin.rvz = 0;
          pin.rx = targetRx;
          pin.sleeping = true;
        }
      }

      pin.root.position.set(pin.x, pin.y, pin.z);
      pin.tiltPivot.rotation.set(pin.rx, 0, pin.rz);

      // Contact shadow stays on the lane surface (or hides once dropped into the sunken pit)
      if (groundY < -0.1) {
        pin.shadow.visible = false;
      } else {
        pin.shadow.visible = true;
        pin.shadow.position.y = 0.02 - pin.y;
        const heightShrink = Math.max(0.25, 1.0 - pin.y * 0.55);
        const tiltStretch = 1.0 + Math.min(1.65, Math.abs(pin.rx) * 0.85);
        pin.shadow.scale.set(heightShrink, heightShrink * tiltStretch, 1);
      }

      // Pin-to-Pin Domino Chain Collisions!
      if (Math.hypot(pin.vx, pin.vz) > 0.35) {
        for (let j = 0; j < MAX_PINS; j++) {
          if (i === j) continue;
          const other = pinEntities[j];
          if (!other.active || !other.standing) continue;
          const dx = other.x - pin.x;
          const dz = other.z - pin.z;
          const dist = Math.hypot(dx, dz);
          if (dist < 1.18) {
            const nx = dist > 0.01 ? dx / dist : (Math.random() - 0.5);
            const nz = dist > 0.01 ? dz / dist : -1.0;
            knockDownPin(other, nx * 11.5 + pin.vx * 0.5, nz * 12.0 + pin.vz * 0.5, false);
          }
        }
      }
    }

    if (gameState.phase === 'settling') {
      gameState.ball.settleTimer += dt;
      if (gameState.ball.settleTimer >= 0.65) {
        completeCurrentDelivery();
      }
    }

    updateParticles(dt);
    updateCamera(dt);
  }

  let physicsAccumulator = 0;
  function stepPhysics(dt, useTimeModifiers = false) {
    let effectiveDt = dt;
    if (useTimeModifiers) {
      if (gameState.hitStopTimer > 0) {
        gameState.hitStopTimer = Math.max(0, gameState.hitStopTimer - dt);
        effectiveDt = dt * 0.05;
      } else if (gameState.slowMoTimer > 0) {
        gameState.slowMoTimer = Math.max(0, gameState.slowMoTimer - dt);
        effectiveDt = dt * 0.35;
      }
    }

    physicsAccumulator += effectiveDt;
    let substeps = 0;
    while (physicsAccumulator >= FIXED_DT && substeps < 16) {
      stepPhysicsSubstep(FIXED_DT);
      physicsAccumulator -= FIXED_DT;
      substeps++;
    }
    flushDirtyHUD();
  }

  function smoothNoise1D(t, seed) {
    return (
      Math.sin(t + seed) * 0.55 +
      Math.sin(t * 2.13 + seed * 1.7) * 0.30 +
      Math.cos(t * 3.71 + seed * 2.3) * 0.15
    );
  }

  // Frame-Rate Independent Camera Follow + Separate Trauma^2 Smooth Shake & Roll
  function updateCamera(dt) {
    let targetZ = 19.2;
    let targetY = 4.2;
    let targetX = gameState.aimX * 0.35;
    let lookZ = -12.0;

    if (gameState.phase === 'rolling' || gameState.phase === 'settling') {
      const bz = Math.max(-18.5, gameState.ball.z);
      targetZ = bz + 7.2;
      targetY = 4.4;
      targetX = gameState.ball.x * 0.45;
      lookZ = Math.min(-21.5, bz - 8.5);
    }

    // Exponential damping 1 - exp(-6.5 * dt) is 100% frame-rate independent!
    const alpha = 1 - Math.exp(-6.5 * dt);
    cameraBasePos.x += (targetX - cameraBasePos.x) * alpha;
    cameraBasePos.y += (targetY - cameraBasePos.y) * alpha;
    cameraBasePos.z += (targetZ - cameraBasePos.z) * alpha;
    cameraBasePos.lookZ += (lookZ - cameraBasePos.lookZ) * alpha;

    // Decay trauma linearly at 1.6/s and compute shake = trauma^2
    if (gameState.trauma > 0) {
      gameState.trauma = Math.max(0, gameState.trauma - 1.6 * dt);
    }
    const shake = gameState.trauma * gameState.trauma;
    const nt = gameState.simTime * 25.0;
    const offsetX = 0.55 * shake * smoothNoise1D(nt, 1.1);
    const offsetY = 0.42 * shake * smoothNoise1D(nt, 3.7);
    const offsetZ = 0.25 * shake * smoothNoise1D(nt, 6.3);
    const rollRad = (2.5 * Math.PI / 180) * shake * smoothNoise1D(nt, 8.9);

    camera.position.set(
      cameraBasePos.x + offsetX,
      cameraBasePos.y + offsetY,
      cameraBasePos.z + offsetZ
    );
    camera.lookAt(cameraBasePos.x * 0.35, 0.8, cameraBasePos.lookZ);
    camera.rotation.z += rollRad;
    camera.updateMatrixWorld();
  }

  // UI Rendering Functions (100% Zero-Text Visual Icons & Emojis)
  function renderStageRail() {
    stageRailEl.innerHTML = STAGES.map((st, idx) => {
      const unlocked = idx <= saveState.unlockedStage;
      const active = idx === gameState.stageIndex;
      const stars = saveState.starsByStage[idx] || 0;
      const starStr = stars > 0 ? '⭐'.repeat(stars) : (unlocked ? '⚪' : '🔒');
      return `
        <button type="button"
          role="tab"
          aria-selected="${active ? 'true' : 'false'}"
          class="stage-pill ${active ? 'active' : ''} ${unlocked ? '' : 'locked'}"
          data-stage="${idx}"
          aria-label="Alley ${idx + 1}">
          <span>${st.emoji}</span>
          <span class="stage-stars">${starStr}</span>
        </button>
      `;
    }).join('');

    const activePill = stageRailEl.querySelector('.stage-pill.active');
    if (activePill && typeof activePill.scrollIntoView === 'function') {
      activePill.scrollIntoView({ inline: 'center', block: 'nearest' });
    }
  }

  function renderCritterBar() {
    critterBarEl.innerHTML = CRITTERS.map(c => {
      const active = c.id === gameState.playerCritterId;
      return `
        <button type="button"
          role="radio"
          aria-checked="${active ? 'true' : 'false'}"
          class="critter-chip ${active ? 'active' : ''}"
          data-critter="${c.id}"
          aria-label="${c.emoji}">
          <img src="${c.icon}" alt="${c.emoji}" />
        </button>
      `;
    }).join('');
  }

  function renderFrameDots() {
    const pips = [];
    for (let f = 1; f <= TOTAL_FRAMES; f++) {
      const res = gameState.frameResults[f - 1];
      const isCurrent = (f === gameState.frame && gameState.phase !== 'finished');
      let icon = '🎳';
      let cls = '';
      if (res === 'strike') {
        icon = '⚡';
        cls = 'strike';
      } else if (res === 'spare') {
        icon = '✨';
        cls = 'spare';
      } else if (res === 'good') {
        icon = '⭐';
      } else if (res === 'open') {
        icon = '🟢';
      }
      pips.push(`<div class="frame-pip ${cls} ${isCurrent ? 'current' : ''}">${icon}</div>`);
    }
    frameDotsEl.innerHTML = pips.join('');
  }

  const MINI_PIN_GRID = [
    { row: 4, col: 4 },
    { row: 3, col: 3 }, { row: 3, col: 5 },
    { row: 2, col: 2 }, { row: 2, col: 4 }, { row: 2, col: 6 },
    { row: 1, col: 1 }, { row: 1, col: 3 }, { row: 1, col: 5 }, { row: 1, col: 7 }
  ];

  function renderMiniPinRack() {
    miniPinRackEl.innerHTML = MINI_PIN_GRID.map((pos, idx) => {
      const standing = pinEntities[idx] && pinEntities[idx].standing;
      return `<span class="mini-pin-dot ${standing ? '' : 'down'}" style="grid-row:${pos.row};grid-column:${pos.col};"></span>`;
    }).join('');
  }

  function renderFeverHUD() {
    feverFillEl.style.width = `${Math.round(gameState.fever)}%`;
    feverClusterEl.classList.toggle('fever-active', gameState.feverActive);
  }

  function renderPedalsHUD() {
    for (let id = 1; id <= 3; id++) {
      const p = gameState.pedals[id];
      const btn = pedalBtns[id];
      const fill = pedalFills[id];
      const pipsEl = pedalPips[id];
      if (!btn || !fill || !pipsEl) continue;

      const ready = p.charges > 0 && p.cooldown <= 0;
      const pct = p.cooldown > 0
        ? Math.round(((p.maxCooldown - p.cooldown) / p.maxCooldown) * 100)
        : (p.charges > 0 ? 100 : 0);

      fill.style.width = `${pct}%`;
      btn.classList.toggle('ready', ready);
      btn.classList.toggle('cooldown', !ready);
      btn.classList.toggle('active-power', gameState.activePower === id);

      let dots = '';
      for (let c = 0; c < p.charges; c++) {
        dots += '<span class="pedal-pip"></span>';
      }
      pipsEl.innerHTML = dots;
    }

    // Apply elemental armed-pedal aura classes to #btn-roll and #aim-Readout
    const armedCurve = gameState.activePower === 1;
    const armedFire = gameState.activePower === 2;
    const armedBomb = gameState.activePower === 3;
    [btnRoll, aimReadoutEl].forEach(el => {
      if (!el) return;
      el.classList.toggle('armed-curve', armedCurve);
      el.classList.toggle('armed-fireball', armedFire);
      el.classList.toggle('armed-bomb', armedBomb);
    });
    const isAimingPhase = gameState.phase === 'aiming';
    btnRoll.classList.toggle('ready-to-bowl', isAimingPhase);
    btnRoll.classList.toggle('rolling-busy', !isAimingPhase);
  }

  function renderLeaderboard() {
    const sorted = [...gameState.racers].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.isPlayer ? -1 : 1;
    });
    const maxScore = Math.max(600, sorted[0] ? sorted[0].score : 600);
    const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];

    leaderboardEl.innerHTML = sorted.map((r, idx) => {
      const pct = Math.min(100, Math.round((r.score / maxScore) * 100));
      const badge = r.lastBadge || '🎳';
      return `
        <div class="racer-card ${r.isPlayer ? 'is-player' : ''}">
          <span class="rank-medal">${medals[idx]}</span>
          <img class="racer-avatar" src="${r.critter.icon}" alt="${r.critter.emoji}" />
          <div class="racer-meter-wrap">
            <div class="racer-meter-fill" style="width:${pct}%;background:${r.critter.hex};"></div>
          </div>
          <span class="racer-pin-pips">${badge}${r.pinsKnocked}</span>
        </div>
      `;
    }).join('');
  }

  let toastTimeout = null;
  function showToast(emojiStr) {
    bannerEmojisEl.textContent = emojiStr;
    bannerToastEl.classList.add('show');
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      bannerToastEl.classList.remove('show');
    }, 1150);
  }

  function setSpinCurve(val) {
    gameState.spinCurve = Math.max(-1.0, Math.min(1.0, val));
    spinKnobEl.style.left = `${50 + gameState.spinCurve * 42}%`;
    if (spinTrackEl) {
      spinTrackEl.setAttribute('aria-valuenow', String(Math.round(gameState.spinCurve * 100)));
    }
    if (gameState.phase === 'rolling') {
      gameState.ball.spin = gameState.spinCurve;
    }
    updateAimDots();
  }

  function adjustAim(dx, dSpin = 0) {
    if (gameState.phase === 'rolling') {
      gameState.ball.vx = Math.max(-12, Math.min(12, gameState.ball.vx + dx * 3.5));
      if (dSpin !== 0) setSpinCurve(gameState.spinCurve + dSpin);
      return;
    }
    if (gameState.phase !== 'aiming') return;
    gameState.aimX = Math.max(-3.0, Math.min(3.0, gameState.aimX + dx));
    gameState.aimAngle = Math.max(-0.20, Math.min(0.20, -gameState.aimX * 0.035));
    if (dSpin !== 0) {
      setSpinCurve(gameState.spinCurve + dSpin);
    }
    gameState.ball.x = gameState.aimX;
    updateBallVisuals();
    updateAimDots();
  }

  // Interactive Spin Glyph Buttons & Spin Track Slider
  if (spinLeftBtn) {
    spinLeftBtn.addEventListener('pointerdown', e => {
      e.preventDefault();
      setSpinCurve(gameState.spinCurve - 0.25);
      sfx.playSelectChime();
    });
  }
  if (spinRightBtn) {
    spinRightBtn.addEventListener('pointerdown', e => {
      e.preventDefault();
      setSpinCurve(gameState.spinCurve + 0.25);
      sfx.playSelectChime();
    });
  }

  let spinDragging = false;
  function updateSpinFromPointer(clientX) {
    if (!spinTrackEl) return;
    const rect = spinTrackEl.getBoundingClientRect();
    if (rect.width <= 0) return;
    const norm = ((clientX - rect.left) / rect.width) * 2 - 1;
    setSpinCurve(norm);
  }
  if (spinTrackEl) {
    spinTrackEl.addEventListener('pointerdown', e => {
      e.preventDefault();
      e.stopPropagation();
      spinDragging = true;
      updateSpinFromPointer(e.clientX);
      sfx.playSelectChime();
    });
    window.addEventListener('pointermove', e => {
      if (!spinDragging) return;
      updateSpinFromPointer(e.clientX);
    });
    window.addEventListener('pointerup', () => {
      spinDragging = false;
    });
  }

  window.addEventListener('keydown', e => {
    if (e.repeat) return;
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
      btnAimLeft.classList.add('pressed');
      adjustAim(-0.45, -0.18);
    } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
      btnAimRight.classList.add('pressed');
      adjustAim(0.45, 0.18);
    } else if (e.code === 'Digit1' || e.code === 'Numpad1') {
      activatePedal(1);
    } else if (e.code === 'Digit2' || e.code === 'Numpad2') {
      activatePedal(2);
    } else if (e.code === 'Digit3' || e.code === 'Numpad3') {
      activatePedal(3);
    } else if (e.code === 'KeyF') {
      if (triggerRainbowLaneWave()) sfx.playFeverChime();
    } else if (e.code === 'Space' || e.code === 'Enter' || e.code === 'ArrowUp' || e.code === 'KeyW') {
      e.preventDefault();
      if (gameState.phase === 'aiming') {
        launchBall();
      }
    }
  });

  if (feverClusterEl) {
    feverClusterEl.style.cursor = 'pointer';
    feverClusterEl.addEventListener('pointerdown', e => {
      e.preventDefault();
      if (triggerRainbowLaneWave()) sfx.playFeverChime();
    });
  }

  window.addEventListener('keyup', e => {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
      btnAimLeft.classList.remove('pressed');
    } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
      btnAimRight.classList.remove('pressed');
    }
  });

  btnAimLeft.addEventListener('pointerdown', e => {
    e.preventDefault();
    btnAimLeft.classList.add('pressed');
    adjustAim(-0.48, -0.2);
  });
  btnAimLeft.addEventListener('pointerup', () => btnAimLeft.classList.remove('pressed'));
  btnAimLeft.addEventListener('pointercancel', () => btnAimLeft.classList.remove('pressed'));
  btnAimLeft.addEventListener('pointerleave', () => btnAimLeft.classList.remove('pressed'));

  btnAimRight.addEventListener('pointerdown', e => {
    e.preventDefault();
    btnAimRight.classList.add('pressed');
    adjustAim(0.48, 0.2);
  });
  btnAimRight.addEventListener('pointerup', () => btnAimRight.classList.remove('pressed'));
  btnAimRight.addEventListener('pointercancel', () => btnAimRight.classList.remove('pressed'));
  btnAimRight.addEventListener('pointerleave', () => btnAimRight.classList.remove('pressed'));

  btnRoll.addEventListener('pointerdown', e => {
    e.preventDefault();
    launchBall();
  });

  [1, 2, 3].forEach(id => {
    pedalBtns[id].addEventListener('pointerdown', e => {
      e.preventDefault();
      activatePedal(id);
    });
  });

  stageRailEl.addEventListener('click', e => {
    const pill = e.target.closest('.stage-pill');
    if (!pill) return;
    const idx = Number(pill.dataset.stage);
    if (idx <= saveState.unlockedStage) {
      startStageMatch(idx);
    }
  });

  critterBarEl.addEventListener('click', e => {
    const chip = e.target.closest('.critter-chip');
    if (!chip) return;
    const cid = chip.dataset.critter;
    if (cid) {
      switchPlayerCritter(cid);
    }
  });

  audioBtnEl.addEventListener('click', () => {
    sfx.muted = !sfx.muted;
    audioBtnEl.textContent = sfx.muted ? '🔇' : '🔊';
  });

  btnRetry.addEventListener('click', () => {
    startStageMatch(gameState.stageIndex);
  });

  btnNext.addEventListener('click', () => {
    const nextIdx = Math.min(7, gameState.stageIndex + 1);
    if (nextIdx <= saveState.unlockedStage) {
      startStageMatch(nextIdx);
    }
  });

  let dragState = { active: false, startX: 0, startY: 0, lastX: 0 };
  canvas.addEventListener('pointerdown', e => {
    dragState.active = true;
    dragState.startX = e.clientX;
    dragState.startY = e.clientY;
    dragState.lastX = e.clientX;
  });

  window.addEventListener('pointermove', e => {
    if (!dragState.active) return;
    const dx = e.clientX - dragState.lastX;
    dragState.lastX = e.clientX;
    if (Math.abs(dx) > 1) {
      adjustAim(dx * 0.015, dx * 0.004);
    }
  });

  window.addEventListener('pointerup', e => {
    if (!dragState.active) return;
    dragState.active = false;
    const dy = dragState.startY - e.clientY;
    if (dy > 38 && gameState.phase === 'aiming') {
      launchBall();
    }
  });

  window.addEventListener('resize', () => {
    syncCameraProjection();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  function getMedallionNDC() {
    ballRoot.updateMatrixWorld(true);
    camera.updateMatrixWorld(true);
    const wp = new THREE.Vector3();
    ballPortraitMesh.getWorldPosition(wp);
    wp.project(camera);
    return { x: wp.x, y: wp.y, z: wp.z };
  }

  let lastTime = performance.now();
  function animate(now) {
    requestAnimationFrame(animate);
    const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) * 0.001));
    lastTime = now;

    stepPhysics(dt, true);
    renderer.render(scene, camera);
  }

  startStageMatch(saveState.selectedStage);
  requestAnimationFrame(animate);

  // Expose QA & Automation Hooks for Deterministic Testing
  window.BOWLING_QA = {
    getState: () => ({
      threeRevision,
      shadowMapEnabled: renderer.shadowMap.enabled,
      stageIndex: gameState.stageIndex,
      unlockedStage: saveState.unlockedStage,
      starsByStage: [...saveState.starsByStage],
      playerCritterId: gameState.playerCritterId,
      phase: gameState.phase,
      frame: gameState.frame,
      ballInFrame: gameState.ballInFrame,
      standingPins: countStandingCorePins(),
      fever: gameState.fever,
      feverActive: gameState.feverActive,
      activePower: gameState.activePower,
      trauma: gameState.trauma,
      lastHitStopTriggered: gameState.lastHitStopTriggered,
      lastSlowMoTriggered: gameState.lastSlowMoTriggered,
      medallionNDC: getMedallionNDC(),
      pedals: JSON.parse(JSON.stringify(gameState.pedals)),
      racers: gameState.racers.map(r => ({
        id: r.id,
        isPlayer: r.isPlayer,
        score: r.score,
        pinsKnocked: r.pinsKnocked
      })),
      lastRank: gameState.lastRank,
      lastStars: gameState.lastStars,
      starPoolSize: starPool.length,
      ringPoolSize: ringPool.length,
      coinPoolSize: coinPool.length,
      geometries: renderer.info.memory.geometries,
      textures: renderer.info.memory.textures
    }),
    getMedallionNDC: () => getMedallionNDC(),
    selectStage: idx => startStageMatch(idx),
    selectCritter: id => switchPlayerCritter(id),
    launchBall: () => launchBall(),
    activatePedal: id => activatePedal(id),
    stepSim: (seconds = 1.0, fps = 120) => {
      const frameDt = 1 / Math.max(15, fps);
      const frames = Math.max(1, Math.round(seconds * fps));
      for (let i = 0; i < frames; i++) {
        stepPhysics(frameDt, false);
      }
      renderer.render(scene, camera);
    },
    forceFinish: rank => finishTournamentMatch(rank)
  };
})();
