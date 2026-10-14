'use strict';

/**
 * OPERATION: SHADOW STRIKE
 * Complete Vanilla JavaScript Tactical Top-Down Shooter
 */

// ==========================================
// 1. KONFIGURASI SENJATA, MUSUH, DAN WAVE
// ==========================================
const WEAPONS = [
  {
    id: 'ar',
    name: 'M4-VORTEX CARBINE',
    subtitle: 'AUTOMATIC ASSAULT RIFLE',
    damage: 30,
    fireRate: 0.11,
    magSize: 30,
    maxReserve: 180,
    reloadTime: 1.55,
    projectileSpeed: 1180,
    pellets: 1,
    spread: 0.042,
    recoil: 3.5,
    color: '#00e5ff',
    length: 28,
    bulletRadius: 3.2
  },
  {
    id: 'smg',
    name: 'K7-SPECTRE SMG',
    subtitle: 'HIGH-VELOCITY SUBMACHINE GUN',
    damage: 17,
    fireRate: 0.058,
    magSize: 45,
    maxReserve: 270,
    reloadTime: 1.25,
    projectileSpeed: 1080,
    pellets: 1,
    spread: 0.095,
    recoil: 5.2,
    color: '#ff9100',
    length: 22,
    bulletRadius: 2.6
  },
  {
    id: 'shotgun',
    name: 'SG-12 BREACHER',
    subtitle: 'TACTICAL SCATTER SHOTGUN',
    damage: 21,
    fireRate: 0.62,
    magSize: 8,
    maxReserve: 56,
    reloadTime: 2.0,
    projectileSpeed: 940,
    pellets: 7,
    spread: 0.27,
    recoil: 11.5,
    color: '#ff4d00',
    length: 30,
    bulletRadius: 3.0
  }
];

const ENEMY_TYPES = {
  ASSAULT: {
    type: 'ASSAULT',
    name: 'Assault Trooper',
    hp: 90,
    speed: 162,
    radius: 17,
    color: '#ff2a54',
    coreColor: '#ff758f',
    detectRange: 980,
    attackRange: 520,
    preferredMinDist: 210,
    fireCooldown: 1.15,
    bulletSpeed: 540,
    bulletDamage: 12,
    projectilesPerShot: 1,
    spread: 0.06,
    score: 100
  },
  RUNNER: {
    type: 'RUNNER',
    name: 'Recon Runner',
    hp: 55,
    speed: 255,
    radius: 14,
    color: '#ffbe0b',
    coreColor: '#fff3b0',
    detectRange: 1100,
    attackRange: 300,
    preferredMinDist: 85,
    fireCooldown: 0.72,
    bulletSpeed: 620,
    bulletDamage: 8,
    projectilesPerShot: 1,
    spread: 0.09,
    score: 130
  },
  HEAVY: {
    type: 'HEAVY',
    name: 'Heavy Juggernaut',
    hp: 250,
    speed: 96,
    radius: 25,
    color: '#b5179e',
    coreColor: '#f72585',
    detectRange: 1000,
    attackRange: 560,
    preferredMinDist: 240,
    fireCooldown: 1.75,
    bulletSpeed: 460,
    bulletDamage: 15,
    projectilesPerShot: 3,
    spread: 0.28,
    score: 250
  }
};

const WAVE_CONFIG = [
  { wave: 1, composition: ['ASSAULT', 'ASSAULT', 'ASSAULT', 'ASSAULT', 'RUNNER', 'RUNNER'], spawnInterval: 1.1, bonus: 250 },
  { wave: 2, composition: ['ASSAULT', 'ASSAULT', 'ASSAULT', 'ASSAULT', 'ASSAULT', 'ASSAULT', 'RUNNER', 'RUNNER', 'RUNNER', 'RUNNER'], spawnInterval: 0.95, bonus: 500 },
  { wave: 3, composition: ['ASSAULT', 'ASSAULT', 'ASSAULT', 'ASSAULT', 'ASSAULT', 'ASSAULT', 'ASSAULT', 'RUNNER', 'RUNNER', 'RUNNER', 'RUNNER', 'RUNNER', 'HEAVY', 'HEAVY'], spawnInterval: 0.85, bonus: 750 },
  { wave: 4, composition: ['ASSAULT', 'ASSAULT', 'ASSAULT', 'ASSAULT', 'ASSAULT', 'ASSAULT', 'ASSAULT', 'ASSAULT', 'RUNNER', 'RUNNER', 'RUNNER', 'RUNNER', 'RUNNER', 'RUNNER', 'HEAVY', 'HEAVY', 'HEAVY', 'HEAVY'], spawnInterval: 0.78, bonus: 1000 },
  { wave: 5, composition: ['ASSAULT', 'ASSAULT', 'ASSAULT', 'ASSAULT', 'ASSAULT', 'ASSAULT', 'ASSAULT', 'ASSAULT', 'ASSAULT', 'ASSAULT', 'RUNNER', 'RUNNER', 'RUNNER', 'RUNNER', 'RUNNER', 'RUNNER', 'RUNNER', 'RUNNER', 'HEAVY', 'HEAVY', 'HEAVY', 'HEAVY', 'HEAVY', 'HEAVY'], spawnInterval: 0.7, bonus: 2000 }
];

// ==========================================
// 2. UTILITAS MATEMATIKA & TABRAKAN
// ==========================================
const MathUtils = {
  clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  },
  lerp(a, b, t) {
    return a + (b - a) * t;
  },
  dist(x1, y1, x2, y2) {
    return Math.hypot(x2 - x1, y2 - y1);
  },
  randRange(min, max) {
    return min + Math.random() * (max - min);
  },
  circleRectCollide(cx, cy, cr, rx, ry, rw, rh) {
    const closestX = Math.max(rx, Math.min(cx, rx + rw));
    const closestY = Math.max(ry, Math.min(cy, ry + rh));
    const dx = cx - closestX;
    const dy = cy - closestY;
    return (dx * dx + dy * dy) < (cr * cr);
  },
  resolveCircleRect(entity, rect) {
    const closestX = Math.max(rect.x, Math.min(entity.x, rect.x + rect.w));
    const closestY = Math.max(rect.y, Math.min(entity.y, rect.y + rect.h));
    let dx = entity.x - closestX;
    let dy = entity.y - closestY;
    const distSq = dx * dx + dy * dy;
    const r = entity.radius;

    if (distSq < r * r) {
      const d = Math.sqrt(distSq);
      if (d > 0.0001) {
        const overlap = r - d;
        entity.x += (dx / d) * overlap;
        entity.y += (dy / d) * overlap;
      } else {
        // Pusat lingkaran tepat di dalam kotak
        const leftPen = (entity.x + r) - rect.x;
        const rightPen = (rect.x + rect.w) - (entity.x - r);
        const topPen = (entity.y + r) - rect.y;
        const bottomPen = (rect.y + rect.h) - (entity.y - r);
        const minPen = Math.min(leftPen, rightPen, topPen, bottomPen);
        if (minPen === leftPen) entity.x = rect.x - r;
        else if (minPen === rightPen) entity.x = rect.x + rect.w + r;
        else if (minPen === topPen) entity.y = rect.y - r;
        else entity.y = rect.y + rect.h + r;
      }
      return true;
    }
    return false;
  }
};

// ==========================================
// 3. SISTEM AUDIO PROSEDURAL (WEB AUDIO API)
// ==========================================
class AudioManager {
  constructor(settings) {
    this.settings = settings;
    this.ctx = null;
    this.activeVoices = 0;
    this.maxVoices = 12;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        try {
          this.ctx = new AudioCtx();
        } catch (e) {
          this.ctx = null;
        }
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  suspend() {
    if (this.ctx && this.ctx.state === 'running') {
      this.ctx.suspend().catch(() => {});
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  getGainValue(baseGain = 1.0) {
    return baseGain * (this.settings.masterVolume / 100) * (this.settings.sfxVolume / 100);
  }

  play(type) {
    if (!this.ctx || this.ctx.state !== 'running') return;
    if (this.activeVoices >= this.maxVoices) return;

    const vol = this.getGainValue(1.0);
    if (vol <= 0.001) return;

    try {
      const now = this.ctx.currentTime;
      this.activeVoices++;
      setTimeout(() => {
        this.activeVoices = Math.max(0, this.activeVoices - 1);
      }, 250);

      switch (type) {
        case 'shoot_ar':
          this._playTone(now, 'sawtooth', 260, 75, 0.11, vol * 0.26);
          this._playNoise(now, 0.08, vol * 0.22, 1400);
          break;
        case 'shoot_smg':
          this._playTone(now, 'square', 340, 110, 0.075, vol * 0.20);
          this._playNoise(now, 0.05, vol * 0.16, 2000);
          break;
        case 'shoot_shotgun':
          this._playTone(now, 'sawtooth', 160, 42, 0.22, vol * 0.38);
          this._playNoise(now, 0.18, vol * 0.35, 900);
          break;
        case 'enemy_shoot':
          this._playTone(now, 'triangle', 420, 140, 0.09, vol * 0.14);
          break;
        case 'reload_start':
          this._playTone(now, 'sine', 520, 380, 0.08, vol * 0.18);
          break;
        case 'reload_done':
          this._playTone(now, 'triangle', 420, 760, 0.12, vol * 0.24);
          break;
        case 'empty_click':
          this._playTone(now, 'square', 800, 600, 0.03, vol * 0.15);
          break;
        case 'hit':
          this._playTone(now, 'triangle', 190, 90, 0.05, vol * 0.18);
          break;
        case 'kill':
          this._playTone(now, 'sawtooth', 280, 55, 0.19, vol * 0.28);
          break;
        case 'player_hurt':
          this._playTone(now, 'sawtooth', 140, 48, 0.24, vol * 0.36);
          break;
        case 'pickup':
          this._playTone(now, 'sine', 580, 920, 0.14, vol * 0.22);
          break;
        case 'wave_start':
          this._playTone(now, 'sawtooth', 220, 440, 0.35, vol * 0.25);
          break;
        case 'wave_clear':
          this._playTone(now, 'triangle', 440, 880, 0.4, vol * 0.28);
          break;
        case 'gameover':
          this._playTone(now, 'sawtooth', 300, 70, 0.6, vol * 0.35);
          break;
        case 'victory':
          this._playTone(now, 'triangle', 330, 660, 0.25, vol * 0.3);
          this._playTone(now + 0.18, 'triangle', 440, 880, 0.4, vol * 0.3);
          break;
        case 'ui_click':
          this._playTone(now, 'sine', 660, 880, 0.04, vol * 0.15);
          break;
      }
    } catch (err) {
      // Fallback aman apabila browser memblokir node audio
    }
  }

  _playTone(startTime, waveType, startFreq, endFreq, duration, gainVal) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = waveType;
    osc.frequency.setValueAtTime(startFreq, startTime);
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), startTime + duration);

    gain.gain.setValueAtTime(gainVal, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  _playNoise(startTime, duration, gainVal, filterFreq) {
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(filterFreq, startTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(gainVal, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(startTime);
    noise.stop(startTime + duration);
  }
}

// ==========================================
// 4. ARENA DAN LEVEL DESIGN
// ==========================================
class Arena {
  constructor() {
    this.width = 2400;
    this.height = 1800;
    this.wallThickness = 40;
    this.obstacles = [];
    this.decorZones = [];
    this.spawnPoints = [];
    this.buildArena();
  }

  buildArena() {
    const W = this.width;
    const H = this.height;
    const T = this.wallThickness;

    // 1. Dinding Perimeter Luar
    this.obstacles = [
      { x: 0, y: 0, w: W, h: T, type: 'wall' },
      { x: 0, y: H - T, w: W, h: T, type: 'wall' },
      { x: 0, y: 0, w: T, h: H, type: 'wall' },
      { x: W - T, y: 0, w: T, h: H, type: 'wall' },

      // 2. Dinding Sekat Koridor & Struktur Taktis (Membuat lorong & ruang terbuka)
      { x: 460, y: 340, w: 280, h: 48, type: 'wall' },
      { x: 460, y: 340, w: 48, h: 240, type: 'wall' },

      { x: 1660, y: 340, w: 280, h: 48, type: 'wall' },
      { x: 1892, y: 340, w: 48, h: 240, type: 'wall' },

      { x: 460, y: 1412, w: 280, h: 48, type: 'wall' },
      { x: 460, y: 1220, w: 48, h: 240, type: 'wall' },

      { x: 1660, y: 1412, w: 280, h: 48, type: 'wall' },
      { x: 1892, y: 1220, w: 48, h: 240, type: 'wall' },

      // Pilar Sektor Tengah (Membiarkan titik tengah 1200,900 terbuka untuk spawn pemain)
      { x: 930, y: 650, w: 90, h: 90, type: 'wall' },
      { x: 1380, y: 650, w: 90, h: 90, type: 'wall' },
      { x: 930, y: 1060, w: 90, h: 90, type: 'wall' },
      { x: 1380, y: 1060, w: 90, h: 90, type: 'wall' },

      // 3. Peti Logam Industrial (Cover)
      { x: 1150, y: 420, w: 100, h: 65, type: 'crate' },
      { x: 1150, y: 1315, w: 100, h: 65, type: 'crate' },
      { x: 650, y: 860, w: 75, h: 80, type: 'crate' },
      { x: 1675, y: 860, w: 75, h: 80, type: 'crate' },

      { x: 260, y: 740, w: 80, h: 80, type: 'crate' },
      { x: 2060, y: 740, w: 80, h: 80, type: 'crate' },
      { x: 820, y: 210, w: 90, h: 60, type: 'crate' },
      { x: 1490, y: 210, w: 90, h: 60, type: 'crate' },
      { x: 820, y: 1530, w: 90, h: 60, type: 'crate' },
      { x: 1490, y: 1530, w: 90, h: 60, type: 'crate' }
    ];

    // 4. Elemen Dekoratif Lantai (Tidak menghalangi jalan)
    this.decorZones = [
      { x: 1200, y: 900, r: 140, label: 'HELIPAD // SECTOR ALPHA-09', color: 'rgba(0, 229, 255, 0.14)' },
      { x: 300, y: 300, r: 85, label: 'REACTOR BAY 01', color: 'rgba(255, 123, 0, 0.12)' },
      { x: 2100, y: 300, r: 85, label: 'REACTOR BAY 02', color: 'rgba(255, 123, 0, 0.12)' },
      { x: 300, y: 1500, r: 85, label: 'CARGO LIFT A', color: 'rgba(0, 229, 255, 0.1)' },
      { x: 2100, y: 1500, r: 85, label: 'CARGO LIFT B', color: 'rgba(0, 229, 255, 0.1)' }
    ];

    // 5. Titik Spawn Musuh yang Terverifikasi Bebas Rintangan
    this.spawnPoints = [
      { x: 200, y: 200 },
      { x: 1200, y: 180 },
      { x: 2200, y: 200 },
      { x: 180, y: 900 },
      { x: 2220, y: 900 },
      { x: 200, y: 1600 },
      { x: 1200, y: 1620 },
      { x: 2200, y: 1600 },
      { x: 640, y: 520 },
      { x: 1760, y: 520 },
      { x: 640, y: 1280 },
      { x: 1760, y: 1280 }
    ];
  }

  resolveEntityCollision(entity) {
    for (let i = 0; i < this.obstacles.length; i++) {
      MathUtils.resolveCircleRect(entity, this.obstacles[i]);
    }
    entity.x = MathUtils.clamp(entity.x, this.wallThickness + entity.radius, this.width - this.wallThickness - entity.radius);
    entity.y = MathUtils.clamp(entity.y, this.wallThickness + entity.radius, this.height - this.wallThickness - entity.radius);
  }

  isCircleColliding(x, y, radius) {
    for (let i = 0; i < this.obstacles.length; i++) {
      const ob = this.obstacles[i];
      if (MathUtils.circleRectCollide(x, y, radius, ob.x, ob.y, ob.w, ob.h)) {
        return true;
      }
    }
    return false;
  }

  hasLineOfSight(x1, y1, x2, y2) {
    const dist = MathUtils.dist(x1, y1, x2, y2);
    const steps = Math.ceil(dist / 28);
    if (steps <= 1) return true;

    const dx = (x2 - x1) / steps;
    const dy = (y2 - y1) / steps;

    for (let i = 1; i < steps; i++) {
      const px = x1 + dx * i;
      const py = y1 + dy * i;
      for (let j = 0; j < this.obstacles.length; j++) {
        const ob = this.obstacles[j];
        if (px >= ob.x && px <= ob.x + ob.w && py >= ob.y && py <= ob.y + ob.h) {
          return false;
        }
      }
    }
    return true;
  }

  draw(ctx, camera, canvasW, canvasH, time) {
    const startX = Math.max(0, Math.floor(camera.x / 80) * 80);
    const endX = Math.min(this.width, camera.x + canvasW + 80);
    const startY = Math.max(0, Math.floor(camera.y / 80) * 80);
    const endY = Math.min(this.height, camera.y + canvasH + 80);

    // Lantai Dasar Industri
    ctx.fillStyle = '#0d121a';
    ctx.fillRect(0, 0, this.width, this.height);

    // Pola Grid Taktis
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = startX; x <= endX; x += 80) {
      ctx.moveTo(x, startY);
      ctx.lineTo(x, endY);
    }
    for (let y = startY; y <= endY; y += 80) {
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
    }
    ctx.stroke();

    // Garis Sektor Sub-grid
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.05)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 0; x <= this.width; x += 400) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.height);
    }
    for (let y = 0; y <= this.height; y += 300) {
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
    }
    ctx.stroke();

    // Zona Dekoratif & Glow Reaktor
    const pulse = 0.85 + Math.sin(time * 2.5) * 0.15;
    for (let i = 0; i < this.decorZones.length; i++) {
      const z = this.decorZones[i];
      ctx.save();
      ctx.beginPath();
      ctx.arc(z.x, z.y, z.r, 0, Math.PI * 2);
      ctx.fillStyle = z.color;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = `rgba(0, 229, 255, ${0.22 * pulse})`;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(z.x, z.y, z.r * 0.65, 0, Math.PI * 2);
      ctx.setLineDash([10, 8]);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = 'rgba(230, 237, 243, 0.25)';
      ctx.font = '700 11px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(z.label, z.x, z.y + z.r + 18);
      ctx.restore();
    }

    // Rintangan: Dinding dan Peti Logam
    for (let i = 0; i < this.obstacles.length; i++) {
      const ob = this.obstacles[i];
      if (
        ob.x + ob.w < camera.x ||
        ob.x > camera.x + canvasW ||
        ob.y + ob.h < camera.y ||
        ob.y > camera.y + canvasH
      ) {
        continue;
      }

      if (ob.type === 'wall') {
        // Bayangan bawah dinding
        ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
        ctx.fillRect(ob.x + 6, ob.y + 8, ob.w, ob.h);

        // Badan dinding
        ctx.fillStyle = '#1b2330';
        ctx.fillRect(ob.x, ob.y, ob.w, ob.h);

        // Bevel dan garis biru elektrik
        ctx.strokeStyle = '#324156';
        ctx.lineWidth = 2;
        ctx.strokeRect(ob.x + 1, ob.y + 1, ob.w - 2, ob.h - 2);

        ctx.strokeStyle = 'rgba(0, 229, 255, 0.35)';
        ctx.lineWidth = 1;
        ctx.strokeRect(ob.x + 4, ob.y + 4, ob.w - 8, ob.h - 8);
      } else if (ob.type === 'crate') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(ob.x + 5, ob.y + 6, ob.w, ob.h);

        ctx.fillStyle = '#283140';
        ctx.fillRect(ob.x, ob.y, ob.w, ob.h);

        ctx.strokeStyle = '#ff7b00';
        ctx.lineWidth = 2;
        ctx.strokeRect(ob.x + 1, ob.y + 1, ob.w - 2, ob.h - 2);

        // Palang penguat peti logam
        ctx.fillStyle = '#1d2430';
        ctx.fillRect(ob.x + 8, ob.y + 8, ob.w - 16, ob.h - 16);

        ctx.strokeStyle = 'rgba(255, 123, 0, 0.45)';
        ctx.beginPath();
        ctx.moveTo(ob.x + 8, ob.y + 8);
        ctx.lineTo(ob.x + ob.w - 8, ob.y + ob.h - 8);
        ctx.moveTo(ob.x + ob.w - 8, ob.y + 8);
        ctx.lineTo(ob.x + 8, ob.y + ob.h - 8);
        ctx.stroke();
      }
    }
  }
}

// ==========================================
// 5. ENTITAS PEMAIN (OPERATOR)
// ==========================================
class Player {
  constructor(x, y) {
    this.reset(x, y);
  }

  reset(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 18;
    this.speed = 290;
    this.angle = 0;
    this.maxHp = 100;
    this.hp = 100;
    this.alive = true;

    this.invulnerableTimer = 0;
    this.walkCycle = 0;
    this.recoilOffset = 0;
    this.muzzleFlashTimer = 0;

    // Inisialisasi status amunisi untuk ke-3 senjata
    this.weaponStates = WEAPONS.map((w) => ({
      currentMag: w.magSize,
      reserveAmmo: w.maxReserve
    }));

    this.currentWeaponIndex = 0;
    this.fireTimer = 0;
    this.isReloading = false;
    this.reloadTimer = 0;
  }

  get currentWeapon() {
    return WEAPONS[this.currentWeaponIndex];
  }

  get currentAmmoState() {
    return this.weaponStates[this.currentWeaponIndex];
  }

  switchWeapon(index, audio) {
    if (index < 0 || index >= WEAPONS.length) return false;
    if (index === this.currentWeaponIndex) return false;

    this.currentWeaponIndex = index;
    this.isReloading = false;
    this.reloadTimer = 0;
    this.fireTimer = Math.min(this.fireTimer, 0.12);
    if (audio) audio.play('ui_click');
    return true;
  }

  startReload(audio) {
    if (!this.alive || this.isReloading) return false;
    const weapon = this.currentWeapon;
    const state = this.currentAmmoState;

    if (state.currentMag >= weapon.magSize) return false;
    if (state.reserveAmmo <= 0) {
      if (audio) audio.play('empty_click');
      return false;
    }

    this.isReloading = true;
    this.reloadTimer = weapon.reloadTime;
    if (audio) audio.play('reload_start');
    return true;
  }

  completeReload(audio) {
    const weapon = this.currentWeapon;
    const state = this.currentAmmoState;
    const needed = weapon.magSize - state.currentMag;
    const toLoad = Math.min(needed, state.reserveAmmo);

    state.currentMag += toLoad;
    state.reserveAmmo -= toLoad;
    this.isReloading = false;
    this.reloadTimer = 0;
    if (audio) audio.play('reload_done');
  }

  takeDamage(amount, audio) {
    if (!this.alive || this.invulnerableTimer > 0) return false;

    this.hp = Math.max(0, this.hp - amount);
    this.invulnerableTimer = 0.25; // Mencegah damage berulang setiap frame
    if (audio) audio.play('player_hurt');

    if (this.hp <= 0) {
      this.alive = false;
    }
    return true;
  }

  update(dt, input, arena, audio, spawnFootstepParticle) {
    if (!this.alive) return;

    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer = Math.max(0, this.invulnerableTimer - dt);
    }

    if (this.fireTimer > 0) {
      this.fireTimer = Math.max(0, this.fireTimer - dt);
    }

    if (this.muzzleFlashTimer > 0) {
      this.muzzleFlashTimer = Math.max(0, this.muzzleFlashTimer - dt);
    }

    this.recoilOffset = MathUtils.lerp(this.recoilOffset, 0, Math.min(1, dt * 16));

    // Proses Reload
    if (this.isReloading) {
      this.reloadTimer -= dt;
      if (this.reloadTimer <= 0) {
        this.completeReload(audio);
      }
    }

    // Input Pergerakan 8 Arah dengan Normalisasi Diagonal
    let moveX = 0;
    let moveY = 0;
    if (input.keys['KeyW'] || input.keys['ArrowUp']) moveY -= 1;
    if (input.keys['KeyS'] || input.keys['ArrowDown']) moveY += 1;
    if (input.keys['KeyA'] || input.keys['ArrowLeft']) moveX -= 1;
    if (input.keys['KeyD'] || input.keys['ArrowRight']) moveX += 1;

    if (input.touchJoystick.active) {
      moveX += input.touchJoystick.x;
      moveY += input.touchJoystick.y;
    }

    const len = Math.hypot(moveX, moveY);
    if (len > 0) {
      moveX /= len;
      moveY /= len;

      this.x += moveX * this.speed * dt;
      this.y += moveY * this.speed * dt;
      arena.resolveEntityCollision(this);

      const prevCycle = this.walkCycle;
      this.walkCycle += dt * 11;
      if (Math.floor(this.walkCycle) !== Math.floor(prevCycle) && spawnFootstepParticle) {
        spawnFootstepParticle(this.x, this.y);
      }
    } else {
      this.walkCycle = 0;
    }
  }

  draw(ctx) {
    if (!this.alive) return;

    ctx.save();
    ctx.translate(this.x, this.y);

    // Indikator lingkaran taktis di bawah operator
    ctx.beginPath();
    ctx.arc(0, 0, this.radius + 5, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.rotate(this.angle);

    // Efek goyangan bahu saat bergerak
    const bob = Math.sin(this.walkCycle) * 2.2;
    const weapon = this.currentWeapon;
    const kick = this.recoilOffset;

    // Bayangan tubuh
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.arc(-2, 4, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Lengan dan Senjata
    ctx.fillStyle = '#334155';
    ctx.fillRect(4 - kick, 5 + bob * 0.4, 14, 6);
    ctx.fillRect(4 - kick, -11 + bob * 0.4, 12, 6);

    // Laras Senjata
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = weapon.color;
    ctx.lineWidth = 1.5;
    ctx.fillRect(8 - kick, -3, weapon.length, 6);
    ctx.strokeRect(8 - kick, -3, weapon.length, 6);

    // Muzzle Flash
    if (this.muzzleFlashTimer > 0) {
      const flashX = 8 - kick + weapon.length;
      ctx.fillStyle = '#fff3b0';
      ctx.beginPath();
      ctx.moveTo(flashX, 0);
      ctx.lineTo(flashX + 14, -7);
      ctx.lineTo(flashX + 9, 0);
      ctx.lineTo(flashX + 14, 7);
      ctx.closePath();
      ctx.fill();
    }

    // Bahu Operator
    ctx.fillStyle = this.invulnerableTimer > 0 ? '#ff2a54' : '#1e293b';
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-12, -15 + bob * 0.3, 22, 30, 6);
    ctx.fill();
    ctx.stroke();

    // Helm Taktis & Visor Biru Elektrik
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(0, 0, 11, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#00e5ff';
    ctx.beginPath();
    ctx.arc(4, 0, 6.5, -Math.PI * 0.38, Math.PI * 0.38);
    ctx.fill();

    ctx.restore();
  }
}

// ==========================================
// 6. AI MUSUH (STATE MACHINE)
// ==========================================
class Enemy {
  constructor(x, y, config, waveMultiplier = 1) {
    this.x = x;
    this.y = y;
    this.type = config.type;
    this.config = config;
    this.radius = config.radius;
    this.maxHp = Math.round(config.hp * waveMultiplier);
    this.hp = this.maxHp;
    this.speed = config.speed * (1 + (waveMultiplier - 1) * 0.15);
    this.angle = Math.random() * Math.PI * 2;
    this.alive = true;
    this.scoreReward = config.score;

    // State Machine: IDLE, CHASE, ATTACK, REPOSITION
    this.state = 'IDLE';
    this.stateTimer = MathUtils.randRange(0.5, 1.5);
    this.fireTimer = MathUtils.randRange(0.3, config.fireCooldown);
    this.strafeDir = Math.random() < 0.5 ? 1 : -1;
    this.hitFlashTimer = 0;
  }

  takeDamage(amount) {
    if (!this.alive) return false;
    this.hp -= amount;
    this.hitFlashTimer = 0.09;
    if (this.state === 'IDLE') {
      this.state = 'CHASE';
    }
    if (this.hp <= 0) {
      this.hp = 0;
      this.alive = false;
      return true; // Eliminated
    }
    return false;
  }

  update(dt, player, arena, allEnemies, fireCallback) {
    if (!this.alive) return;

    if (this.hitFlashTimer > 0) {
      this.hitFlashTimer = Math.max(0, this.hitFlashTimer - dt);
    }

    this.fireTimer = Math.max(0, this.fireTimer - dt);
    this.stateTimer -= dt;

    const distToPlayer = MathUtils.dist(this.x, this.y, player.x, player.y);
    const angleToPlayer = Math.atan2(player.y - this.y, player.x - this.x);
    const hasLOS = distToPlayer <= this.config.detectRange && arena.hasLineOfSight(this.x, this.y, player.x, player.y);

    // Evaluasi Transisi State Machine
    if (!player.alive) {
      this.state = 'IDLE';
    } else if (this.state === 'IDLE') {
      if (distToPlayer <= this.config.detectRange) {
        this.state = 'CHASE';
      }
    } else if (this.state === 'CHASE') {
      if (hasLOS && distToPlayer <= this.config.attackRange) {
        this.state = 'ATTACK';
        this.stateTimer = MathUtils.randRange(0.7, 1.4);
      }
    } else if (this.state === 'ATTACK') {
      if (!hasLOS || distToPlayer > this.config.attackRange * 1.15) {
        this.state = 'CHASE';
      } else if (distToPlayer < this.config.preferredMinDist || this.stateTimer <= 0) {
        this.state = 'REPOSITION';
        this.strafeDir = Math.random() < 0.5 ? 1 : -1;
        this.stateTimer = MathUtils.randRange(0.55, 1.1);
      }
    } else if (this.state === 'REPOSITION') {
      if (this.stateTimer <= 0) {
        this.state = hasLOS && distToPlayer <= this.config.attackRange ? 'ATTACK' : 'CHASE';
        this.stateTimer = MathUtils.randRange(0.8, 1.5);
      }
    }

    // Eksekusi Perilaku Berdasarkan State
    let moveDirX = 0;
    let moveDirY = 0;

    if (this.state === 'IDLE') {
      if (this.stateTimer <= 0) {
        this.angle += MathUtils.randRange(-0.8, 0.8);
        this.stateTimer = MathUtils.randRange(1.0, 2.2);
      }
      moveDirX = Math.cos(this.angle) * 0.25;
      moveDirY = Math.sin(this.angle) * 0.25;
    } else if (this.state === 'CHASE') {
      this.angle = angleToPlayer;
      const steerAngle = this.computeObstacleAvoidanceAngle(angleToPlayer, arena);
      moveDirX = Math.cos(steerAngle);
      moveDirY = Math.sin(steerAngle);
    } else if (this.state === 'ATTACK') {
      this.angle = angleToPlayer;
      // Runner tetap bergerak agresif sambil menembak
      if (this.type === 'RUNNER' && distToPlayer > 130) {
        moveDirX = Math.cos(angleToPlayer) * 0.75;
        moveDirY = Math.sin(angleToPlayer) * 0.75;
      } else {
        // Bergerak perlahan menyamping
        const perp = angleToPlayer + (Math.PI / 2) * this.strafeDir;
        moveDirX = Math.cos(perp) * 0.35;
        moveDirY = Math.sin(perp) * 0.35;
      }

      if (this.fireTimer <= 0 && hasLOS) {
        this.performAttack(fireCallback);
        this.fireTimer = this.config.fireCooldown * MathUtils.randRange(0.9, 1.15);
      }
    } else if (this.state === 'REPOSITION') {
      this.angle = angleToPlayer;
      // Jika terlalu dekat, mundur sedikit sambil strafing
      const backFactor = distToPlayer < this.config.preferredMinDist ? -0.6 : 0.2;
      const strafeAngle = angleToPlayer + (Math.PI / 2) * this.strafeDir;
      moveDirX = Math.cos(strafeAngle) * 0.8 + Math.cos(angleToPlayer) * backFactor;
      moveDirY = Math.sin(strafeAngle) * 0.8 + Math.sin(angleToPlayer) * backFactor;

      if (this.fireTimer <= 0 && hasLOS) {
        this.performAttack(fireCallback);
        this.fireTimer = this.config.fireCooldown;
      }
    }

    // Terapkan Pergerakan
    this.x += moveDirX * this.speed * dt;
    this.y += moveDirY * this.speed * dt;

    // Separasi antar-musuh agar tidak menumpuk di satu titik
    for (let i = 0; i < allEnemies.length; i++) {
      const other = allEnemies[i];
      if (other === this || !other.alive) continue;
      const dx = this.x - other.x;
      const dy = this.y - other.y;
      const d = Math.hypot(dx, dy);
      const minDist = this.radius + other.radius + 4;
      if (d > 0 && d < minDist) {
        const push = (minDist - d) * 0.5;
        this.x += (dx / d) * push;
        this.y += (dy / d) * push;
      }
    }

    arena.resolveEntityCollision(this);
  }

  computeObstacleAvoidanceAngle(targetAngle, arena) {
    const lookDist = this.radius + 28;
    const testX = this.x + Math.cos(targetAngle) * lookDist;
    const testY = this.y + Math.sin(targetAngle) * lookDist;

    if (!arena.isCircleColliding(testX, testY, this.radius * 0.85)) {
      return targetAngle;
    }

    // Uji sudut kiri dan kanan untuk memutari rintangan
    const offsets = [0.55, -0.55, 1.05, -1.05, 1.5, -1.5];
    for (let i = 0; i < offsets.length; i++) {
      const candidate = targetAngle + offsets[i] * this.strafeDir;
      const cx = this.x + Math.cos(candidate) * lookDist;
      const cy = this.y + Math.sin(candidate) * lookDist;
      if (!arena.isCircleColliding(cx, cy, this.radius * 0.85)) {
        return candidate;
      }
    }
    return targetAngle + Math.PI * 0.5 * this.strafeDir;
  }

  performAttack(fireCallback) {
    const count = this.config.projectilesPerShot;
    const totalSpread = this.config.spread;
    const muzzleX = this.x + Math.cos(this.angle) * (this.radius + 8);
    const muzzleY = this.y + Math.sin(this.angle) * (this.radius + 8);

    for (let i = 0; i < count; i++) {
      let shotAngle = this.angle;
      if (count === 1) {
        shotAngle += (Math.random() - 0.5) * totalSpread;
      } else {
        const t = i / (count - 1) - 0.5;
        shotAngle += t * totalSpread;
      }
      fireCallback(
        muzzleX,
        muzzleY,
        shotAngle,
        this.config.bulletSpeed,
        this.config.bulletDamage,
        this.config.color
      );
    }
  }

  draw(ctx) {
    if (!this.alive) return;

    ctx.save();
    ctx.translate(this.x, this.y);

    // Bayangan
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.arc(0, 4, this.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.rotate(this.angle);

    const fillCol = this.hitFlashTimer > 0 ? '#ffffff' : '#1b2230';
    const strokeCol = this.hitFlashTimer > 0 ? '#ffffff' : this.config.color;

    if (this.type === 'ASSAULT') {
      // Senjata musuh
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(6, -3, 20, 6);
      // Badan lingkaran lapis baja
      ctx.fillStyle = fillCol;
      ctx.strokeStyle = strokeCol;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (this.type === 'RUNNER') {
      // Bentuk berlian/segitiga aerodinamis cepat
      ctx.fillStyle = fillCol;
      ctx.strokeStyle = strokeCol;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(this.radius + 4, 0);
      ctx.lineTo(-this.radius, -this.radius * 0.85);
      ctx.lineTo(-this.radius * 0.5, 0);
      ctx.lineTo(-this.radius, this.radius * 0.85);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (this.type === 'HEAVY') {
      // Meriam ganda Heavy
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(8, -12, 22, 7);
      ctx.fillRect(8, 5, 22, 7);
      // Badan oktagon berlapis baja tebal
      ctx.fillStyle = fillCol;
      ctx.strokeStyle = strokeCol;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      const sides = 8;
      for (let i = 0; i < sides; i++) {
        const a = (i * Math.PI * 2) / sides;
        const px = Math.cos(a) * this.radius;
        const py = Math.sin(a) * this.radius;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // Visor / Inti menyala
    ctx.fillStyle = this.config.coreColor;
    ctx.beginPath();
    ctx.arc(5, 0, this.radius * 0.32, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Health Bar Musuh (Ditampilkan ketika terluka atau untuk Heavy)
    if (this.hp < this.maxHp || this.type === 'HEAVY') {
      const barW = this.radius * 2.1;
      const barH = 4;
      const barX = -barW / 2;
      const barY = -this.radius - 12;
      const ratio = MathUtils.clamp(this.hp / this.maxHp, 0, 1);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);
      ctx.fillStyle = this.config.color;
      ctx.fillRect(barX, barY, barW * ratio, barH);
    }

    ctx.restore();
  }
}

// ==========================================
// 7. PROYEKTIL, PARTIKEL, DAN DROP ITEM
// ==========================================
class Projectile {
  constructor(x, y, angle, speed, damage, isPlayer, color, radius = 3) {
    this.x = x;
    this.y = y;
    this.prevX = x;
    this.prevY = y;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.damage = damage;
    this.isPlayer = isPlayer;
    this.color = color;
    this.radius = radius;
    this.life = 1.6;
    this.active = true;
  }

  update(dt, arena, player, enemies, onHitCallback) {
    if (!this.active) return;

    this.prevX = this.x;
    this.prevY = this.y;
    this.life -= dt;
    if (this.life <= 0) {
      this.active = false;
      return;
    }

    // Sub-stepping untuk mencegah peluru cepat menembus dinding tipis
    const steps = 3;
    const stepDt = dt / steps;

    for (let s = 0; s < steps; s++) {
      this.x += this.vx * stepDt;
      this.y += this.vy * stepDt;

      // Cek tabrakan dengan dinding/rintangan arena
      if (arena.isCircleColliding(this.x, this.y, this.radius)) {
        this.active = false;
        onHitCallback('wall', this.x, this.y, null);
        return;
      }

      // Cek tabrakan dengan target
      if (this.isPlayer) {
        for (let i = 0; i < enemies.length; i++) {
          const enemy = enemies[i];
          if (!enemy.alive) continue;
          const d = MathUtils.dist(this.x, this.y, enemy.x, enemy.y);
          if (d <= this.radius + enemy.radius) {
            this.active = false;
            onHitCallback('enemy', this.x, this.y, enemy);
            return;
          }
        }
      } else if (player.alive) {
        const d = MathUtils.dist(this.x, this.y, player.x, player.y);
        if (d <= this.radius + player.radius) {
          this.active = false;
          onHitCallback('player', this.x, this.y, player);
          return;
        }
      }
    }
  }

  draw(ctx) {
    if (!this.active) return;

    ctx.save();
    // Tracer ekor proyektil
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.radius * 1.6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(this.prevX, this.prevY);
    ctx.lineTo(this.x, this.y);
    ctx.stroke();

    // Inti putih terang
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius * 0.75, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

class Particle {
  constructor(x, y, vx, vy, size, color, life, friction = 0.92) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.size = size;
    this.color = color;
    this.life = life;
    this.maxLife = life;
    this.friction = friction;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    const damp = Math.pow(this.friction, dt * 60);
    this.vx *= damp;
    this.vy *= damp;
    this.life -= dt;
  }

  draw(ctx) {
    if (this.life <= 0) return;
    const alpha = MathUtils.clamp(this.life / this.maxLife, 0, 1);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * alpha, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

class FloatingText {
  constructor(x, y, text, color) {
    this.x = x;
    this.y = y;
    this.text = text;
    this.color = color;
    this.life = 0.65;
    this.maxLife = 0.65;
  }

  update(dt) {
    this.y -= 38 * dt;
    this.life -= dt;
  }

  draw(ctx) {
    if (this.life <= 0) return;
    const alpha = MathUtils.clamp(this.life / this.maxLife, 0, 1);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = '800 13px "Segoe UI", sans-serif';
    ctx.fillStyle = this.color;
    ctx.textAlign = 'center';
    ctx.fillText(this.text, this.x, this.y);
    ctx.restore();
  }
}

class SupplyDrop {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type; // 'ammo' atau 'health'
    this.radius = 14;
    this.life = 14.0;
    this.active = true;
  }

  update(dt) {
    this.life -= dt;
    if (this.life <= 0) this.active = false;
  }

  draw(ctx, time) {
    if (!this.active) return;
    const pulse = 1 + Math.sin(time * 6) * 0.12;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(pulse, pulse);

    ctx.fillStyle = '#111927';
    ctx.strokeStyle = this.type === 'ammo' ? '#ff9100' : '#00e676';
    ctx.lineWidth = 2;
    ctx.fillRect(-11, -11, 22, 22);
    ctx.strokeRect(-11, -11, 22, 22);

    ctx.fillStyle = this.type === 'ammo' ? '#ff9100' : '#00e676';
    ctx.font = '900 11px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.type === 'ammo' ? 'AMMO' : '+HP', 0, 0);
    ctx.restore();
  }
}

// ==========================================
// 8. ENGINE UTAMA PERMAINAN (GAME CONTROLLER)
// ==========================================
class Game {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');

    this.settings = {
      masterVolume: 80,
      sfxVolume: 85,
      sensitivity: 75,
      screenShake: true,
      extraParticles: true
    };

    this.audio = new AudioManager(this.settings);
    this.arena = new Arena();
    this.player = new Player(1200, 900);

    // State Permainan: MENU, PLAYING, PAUSED, GAMEOVER, VICTORY
    this.state = 'MENU';
    this.previousScreenBeforeModal = 'MENU';

    this.camera = { x: 0, y: 0, shakeX: 0, shakeY: 0, shakeMagnitude: 0 };
    this.simTime = 0;

    // Koleksi Entitas
    this.enemies = [];
    this.projectiles = [];
    this.particles = [];
    this.floatingTexts = [];
    this.supplyDrops = [];
    this.maxParticles = 180;

    // Progresi Wave & Statistik
    this.currentWaveIndex = 0;
    this.waveSpawnQueue = [];
    this.waveSpawnTimer = 0;
    this.waveIntermissionTimer = 0;
    this.inWaveIntermission = false;
    this.bannerTimer = 0;

    this.score = 0;
    this.totalKills = 0;
    this.shotsFired = 0;
    this.shotsHit = 0;
    this.damageOverlayAlpha = 0;

    // Input State
    this.input = {
      keys: {},
      mouseDown: false,
      mouseScreenX: window.innerWidth / 2,
      mouseScreenY: window.innerHeight / 2,
      touchJoystick: { active: false, id: null, startX: 0, startY: 0, x: 0, y: 0 },
      touchFire: false
    };

    this.cacheDOM();
    this.bindEvents();
    this.resizeCanvas();

    this.lastFrameTime = performance.now();
    this.rafId = requestAnimationFrame((ts) => this.loop(ts));
  }

  cacheDOM() {
    this.dom = {
      hud: document.getElementById('hud'),
      damageOverlay: document.getElementById('damage-overlay'),
      healthBarFill: document.getElementById('health-bar-fill'),
      healthBarDamage: document.getElementById('health-bar-damage'),
      healthText: document.getElementById('health-text'),
      statusBadge: document.getElementById('status-badge'),
      waveNumber: document.getElementById('wave-number'),
      enemiesRemaining: document.getElementById('enemies-remaining'),
      scoreValue: document.getElementById('score-value'),
      waveBanner: document.getElementById('wave-banner'),
      waveBannerTitle: document.getElementById('wave-banner-title'),
      waveBannerSub: document.getElementById('wave-banner-sub'),
      reloadIndicator: document.getElementById('reload-indicator'),
      reloadProgressFill: document.getElementById('reload-progress-fill'),
      ammoWarning: document.getElementById('ammo-warning'),
      weaponName: document.getElementById('weapon-name'),
      weaponDesc: document.getElementById('weapon-desc'),
      ammoMag: document.getElementById('ammo-mag'),
      ammoReserve: document.getElementById('ammo-reserve'),
      slots: [
        document.getElementById('slot-1'),
        document.getElementById('slot-2'),
        document.getElementById('slot-3')
      ],
      screens: {
        mainMenu: document.getElementById('screen-main-menu'),
        howto: document.getElementById('screen-howto'),
        settings: document.getElementById('screen-settings'),
        pause: document.getElementById('screen-pause'),
        gameover: document.getElementById('screen-gameover'),
        victory: document.getElementById('screen-victory')
      },
      stats: {
        goScore: document.getElementById('go-score'),
        goWave: document.getElementById('go-wave'),
        goKills: document.getElementById('go-kills'),
        goAccuracy: document.getElementById('go-accuracy'),
        vicScore: document.getElementById('vic-score'),
        vicWave: document.getElementById('vic-wave'),
        vicKills: document.getElementById('vic-kills'),
        vicAccuracy: document.getElementById('vic-accuracy')
      },
      settingsInputs: {
        masterVol: document.getElementById('slider-master-vol'),
        valMasterVol: document.getElementById('val-master-vol'),
        sfxVol: document.getElementById('slider-sfx-vol'),
        valSfxVol: document.getElementById('val-sfx-vol'),
        sensitivity: document.getElementById('slider-sensitivity'),
        valSensitivity: document.getElementById('val-sensitivity'),
        screenShake: document.getElementById('toggle-screenshake'),
        particles: document.getElementById('toggle-particles')
      },
      touchControls: document.getElementById('touch-controls'),
      joystickZone: document.getElementById('joystick-zone'),
      joystickKnob: document.getElementById('joystick-knob')
    };
  }

  bindEvents() {
    window.addEventListener('resize', () => this.resizeCanvas());

    // Penanganan Keyboard
    window.addEventListener('keydown', (e) => {
      this.audio.init();

      if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }

      this.input.keys[e.code] = true;

      if (e.code === 'Escape') {
        if (this.state === 'PLAYING') {
          this.pauseGame();
        } else if (this.state === 'PAUSED') {
          this.resumeGame();
        }
        return;
      }

      if (this.state !== 'PLAYING') return;

      if (e.code === 'KeyR') {
        this.player.startReload(this.audio);
      } else if (e.code === 'Digit1') {
        this.player.switchWeapon(0, this.audio);
      } else if (e.code === 'Digit2') {
        this.player.switchWeapon(1, this.audio);
      } else if (e.code === 'Digit3') {
        this.player.switchWeapon(2, this.audio);
      }
    });

    window.addEventListener('keyup', (e) => {
      this.input.keys[e.code] = false;
    });

    // Penanganan Mouse & Koordinat Presisi
    window.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.input.mouseScreenX = e.clientX - rect.left;
      this.input.mouseScreenY = e.clientY - rect.top;
    });

    this.canvas.addEventListener('mousedown', (e) => {
      this.audio.init();
      if (e.button === 0) {
        this.input.mouseDown = true;
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) {
        this.input.mouseDown = false;
      }
    });

    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    // Otomatis Pause ketika Tab Tidak Aktif / Blur
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.state === 'PLAYING') {
        this.pauseGame();
      }
    });

    window.addEventListener('blur', () => {
      this.input.keys = {};
      this.input.mouseDown = false;
      if (this.state === 'PLAYING') {
        this.pauseGame();
      }
    });

    // Klik Slot Senjata di HUD
    this.dom.slots.forEach((slotEl, idx) => {
      slotEl.addEventListener('click', () => {
        if (this.state === 'PLAYING') {
          this.player.switchWeapon(idx, this.audio);
        }
      });
    });

    // Tombol Navigasi Menu & Layar
    const bindBtn = (id, handler) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('click', () => {
          this.audio.init();
          this.audio.play('ui_click');
          handler();
        });
      }
    };

    bindBtn('btn-play', () => this.startNewGame());
    bindBtn('btn-howto', () => {
      this.previousScreenBeforeModal = 'MENU';
      this.showScreen('howto');
    });
    bindBtn('btn-howto-back', () => this.showScreen('mainMenu'));

    bindBtn('btn-settings', () => {
      this.previousScreenBeforeModal = 'MENU';
      this.showScreen('settings');
    });
    bindBtn('btn-pause-settings', () => {
      this.previousScreenBeforeModal = 'PAUSED';
      this.showScreen('settings');
    });
    bindBtn('btn-settings-back', () => {
      if (this.previousScreenBeforeModal === 'PAUSED') {
        this.showScreen('pause');
      } else {
        this.showScreen('mainMenu');
      }
    });

    bindBtn('btn-hud-pause', () => {
      if (this.state === 'PLAYING') this.pauseGame();
    });
    bindBtn('btn-resume', () => this.resumeGame());
    bindBtn('btn-pause-restart', () => this.startNewGame());
    bindBtn('btn-pause-menu', () => this.returnToMainMenu());

    bindBtn('btn-go-retry', () => this.startNewGame());
    bindBtn('btn-go-menu', () => this.returnToMainMenu());

    bindBtn('btn-vic-playagain', () => this.startNewGame());
    bindBtn('btn-vic-menu', () => this.returnToMainMenu());

    // Event Listener Pengaturan (Settings)
    const sInputs = this.dom.settingsInputs;
    sInputs.masterVol.addEventListener('input', (e) => {
      this.settings.masterVolume = Number(e.target.value);
      sInputs.valMasterVol.textContent = `${this.settings.masterVolume}%`;
    });
    sInputs.sfxVol.addEventListener('input', (e) => {
      this.settings.sfxVolume = Number(e.target.value);
      sInputs.valSfxVol.textContent = `${this.settings.sfxVolume}%`;
    });
    sInputs.sensitivity.addEventListener('input', (e) => {
      this.settings.sensitivity = Number(e.target.value);
      sInputs.valSensitivity.textContent = `${this.settings.sensitivity}%`;
    });
    sInputs.screenShake.addEventListener('change', (e) => {
      this.settings.screenShake = e.target.checked;
    });
    sInputs.particles.addEventListener('change', (e) => {
      this.settings.extraParticles = e.target.checked;
    });

    // Dukungan Perangkat Sentuh Dasar
    this.setupTouchControls();
  }

  setupTouchControls() {
    window.addEventListener('touchstart', () => {
      this.dom.touchControls.classList.remove('hidden');
      this.audio.init();
    }, { once: true });

    const zone = this.dom.joystickZone;
    const knob = this.dom.joystickKnob;
    const maxRadius = 42;

    zone.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.changedTouches[0];
      const rect = zone.getBoundingClientRect();
      this.input.touchJoystick.active = true;
      this.input.touchJoystick.id = touch.identifier;
      this.input.touchJoystick.startX = rect.left + rect.width / 2;
      this.input.touchJoystick.startY = rect.top + rect.height / 2;
    });

    zone.addEventListener('touchmove', (e) => {
      e.preventDefault();
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier === this.input.touchJoystick.id) {
          const dx = t.clientX - this.input.touchJoystick.startX;
          const dy = t.clientY - this.input.touchJoystick.startY;
          const dist = Math.min(maxRadius, Math.hypot(dx, dy));
          const angle = Math.atan2(dy, dx);
          const kx = Math.cos(angle) * dist;
          const ky = Math.sin(angle) * dist;
          knob.style.transform = `translate(${kx}px, ${ky}px)`;
          this.input.touchJoystick.x = kx / maxRadius;
          this.input.touchJoystick.y = ky / maxRadius;
        }
      }
    });

    const resetJoystick = () => {
      this.input.touchJoystick.active = false;
      this.input.touchJoystick.x = 0;
      this.input.touchJoystick.y = 0;
      knob.style.transform = 'translate(0px, 0px)';
    };
    zone.addEventListener('touchend', resetJoystick);
    zone.addEventListener('touchcancel', resetJoystick);

    const btnFire = document.getElementById('btn-touch-fire');
    btnFire.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.input.touchFire = true;
    });
    btnFire.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.input.touchFire = false;
    });

    document.getElementById('btn-touch-reload').addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (this.state === 'PLAYING') this.player.startReload(this.audio);
    });

    document.getElementById('btn-touch-switch').addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (this.state === 'PLAYING') {
        const next = (this.player.currentWeaponIndex + 1) % WEAPONS.length;
        this.player.switchWeapon(next, this.audio);
      }
    });
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  showScreen(screenKey) {
    Object.values(this.dom.screens).forEach((el) => el.classList.remove('active'));
    if (screenKey && this.dom.screens[screenKey]) {
      this.dom.screens[screenKey].classList.add('active');
    }
  }

  // ==========================================
  // 9. MANAJEMEN STATE & WAVE
  // ==========================================
  startNewGame() {
    this.audio.resume();
    this.player.reset(1200, 900);
    this.enemies = [];
    this.projectiles = [];
    this.particles = [];
    this.floatingTexts = [];
    this.supplyDrops = [];

    this.score = 0;
    this.totalKills = 0;
    this.shotsFired = 0;
    this.shotsHit = 0;
    this.damageOverlayAlpha = 0;
    this.simTime = 0;

    this.currentWaveIndex = 0;
    this.startWave(0);

    this.state = 'PLAYING';
    this.dom.hud.classList.remove('hidden');
    this.showScreen(null);
    this.updateCamera(1);
    this.updateHUD();
  }

  pauseGame() {
    if (this.state !== 'PLAYING') return;
    this.state = 'PAUSED';
    this.input.mouseDown = false;
    this.input.keys = {};
    this.audio.suspend();
    this.showScreen('pause');
  }

  resumeGame() {
    if (this.state !== 'PAUSED') return;
    this.state = 'PLAYING';
    this.audio.resume();
    this.showScreen(null);
    this.lastFrameTime = performance.now();
  }

  returnToMainMenu() {
    this.state = 'MENU';
    this.audio.resume();
    this.dom.hud.classList.add('hidden');
    this.showScreen('mainMenu');
  }

  triggerGameOver() {
    this.state = 'GAMEOVER';
    this.audio.play('gameover');
    const acc = this.shotsFired > 0 ? Math.round((this.shotsHit / this.shotsFired) * 100) : 0;

    this.dom.stats.goScore.textContent = this.score.toLocaleString();
    this.dom.stats.goWave.textContent = `${this.currentWaveIndex + 1} / ${WAVE_CONFIG.length}`;
    this.dom.stats.goKills.textContent = this.totalKills;
    this.dom.stats.goAccuracy.textContent = `${acc}%`;

    this.showScreen('gameover');
  }

  triggerVictory() {
    this.state = 'VICTORY';
    this.audio.play('victory');
    const acc = this.shotsFired > 0 ? Math.round((this.shotsHit / this.shotsFired) * 100) : 0;

    this.dom.stats.vicScore.textContent = this.score.toLocaleString();
    this.dom.stats.vicWave.textContent = `${WAVE_CONFIG.length} / ${WAVE_CONFIG.length}`;
    this.dom.stats.vicKills.textContent = this.totalKills;
    this.dom.stats.vicAccuracy.textContent = `${acc}%`;

    this.showScreen('victory');
  }

  startWave(waveIdx) {
    this.currentWaveIndex = waveIdx;
    const cfg = WAVE_CONFIG[waveIdx];
    this.waveSpawnQueue = [...cfg.composition];
    this.waveSpawnTimer = 0.6;
    this.inWaveIntermission = false;

    this.showBanner(`WAVE ${cfg.wave}`, 'INCOMING HOSTILES', 2.4);
    this.audio.play('wave_start');
  }

  showBanner(title, subtitle, duration = 2.2) {
    this.dom.waveBannerTitle.textContent = title;
    this.dom.waveBannerSub.textContent = subtitle;
    this.dom.waveBanner.classList.remove('hidden');
    this.bannerTimer = duration;
  }

  spawnEnemyFromQueue() {
    if (this.waveSpawnQueue.length === 0) return;

    const typeKey = this.waveSpawnQueue.shift();
    const config = ENEMY_TYPES[typeKey];

    // Pilih titik spawn yang berjarak aman dari pemain (> 480px)
    const validSpawns = this.arena.spawnPoints.filter((sp) => {
      return MathUtils.dist(sp.x, sp.y, this.player.x, this.player.y) > 480;
    });

    const pool = validSpawns.length > 0 ? validSpawns : this.arena.spawnPoints;
    const basePoint = pool[Math.floor(Math.random() * pool.length)];

    // Cari koordinat di sekitar titik spawn yang tidak menumpuk dan tidak di dalam dinding
    let spawnX = basePoint.x;
    let spawnY = basePoint.y;
    for (let attempt = 0; attempt < 10; attempt++) {
      const candidateX = basePoint.x + MathUtils.randRange(-45, 45);
      const candidateY = basePoint.y + MathUtils.randRange(-45, 45);
      if (!this.arena.isCircleColliding(candidateX, candidateY, config.radius + 4)) {
        spawnX = candidateX;
        spawnY = candidateY;
        break;
      }
    }

    const waveScale = 1 + this.currentWaveIndex * 0.08;
    const enemy = new Enemy(spawnX, spawnY, config, waveScale);
    this.enemies.push(enemy);
    this.spawnParticles(spawnX, spawnY, config.color, 10, 120);
  }

  // ==========================================
  // 10. LOGIKA TEMBAKAN & EFEK VISUAL
  // ==========================================
  handlePlayerFiring() {
    if (!this.player.alive || this.player.isReloading) return;
    if (!this.input.mouseDown && !this.input.touchFire) return;
    if (this.player.fireTimer > 0) return;

    const weapon = this.player.currentWeapon;
    const ammoState = this.player.currentAmmoState;

    if (ammoState.currentMag <= 0) {
      this.player.fireTimer = 0.25;
      this.player.startReload(this.audio);
      return;
    }

    // Kurangi amunisi & setel cooldown
    ammoState.currentMag--;
    this.player.fireTimer = weapon.fireRate;
    this.player.recoilOffset = Math.min(12, this.player.recoilOffset + weapon.recoil);
    this.player.muzzleFlashTimer = 0.045;

    this.addScreenShake(weapon.recoil * 0.65);
    this.audio.play(`shoot_${weapon.id}`);

    const muzzleDist = this.player.radius + weapon.length - 4;
    const muzzleX = this.player.x + Math.cos(this.player.angle) * muzzleDist;
    const muzzleY = this.player.y + Math.sin(this.player.angle) * muzzleDist;

    for (let i = 0; i < weapon.pellets; i++) {
      const spreadOffset = (Math.random() - 0.5) * weapon.spread;
      const shotAngle = this.player.angle + spreadOffset;
      this.projectiles.push(
        new Projectile(
          muzzleX,
          muzzleY,
          shotAngle,
          weapon.projectileSpeed,
          weapon.damage,
          true,
          weapon.color,
          weapon.bulletRadius
        )
      );
      this.shotsFired++;
    }

    // Partikel selongsong & asap laras jika efek tambahan aktif
    if (this.settings.extraParticles) {
      const ejectAngle = this.player.angle + Math.PI * 0.5;
      this.addParticle(
        new Particle(
          this.player.x + Math.cos(ejectAngle) * 10,
          this.player.y + Math.sin(ejectAngle) * 10,
          Math.cos(ejectAngle) * MathUtils.randRange(60, 120),
          Math.sin(ejectAngle) * MathUtils.randRange(60, 120),
          2.2,
          '#ffd166',
          0.45
        )
      );
    }
  }

  addParticle(particle) {
    if (this.particles.length >= this.maxParticles) {
      this.particles.shift();
    }
    this.particles.push(particle);
  }

  spawnParticles(x, y, color, count, maxSpeed = 180) {
    const actualCount = this.settings.extraParticles ? count : Math.ceil(count * 0.45);
    for (let i = 0; i < actualCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = MathUtils.randRange(25, maxSpeed);
      this.addParticle(
        new Particle(
          x,
          y,
          Math.cos(angle) * speed,
          Math.sin(angle) * speed,
          MathUtils.randRange(2, 4.8),
          color,
          MathUtils.randRange(0.22, 0.55)
        )
      );
    }
  }

  addScreenShake(amount) {
    if (!this.settings.screenShake) return;
    this.camera.shakeMagnitude = Math.min(18, this.camera.shakeMagnitude + amount);
  }

  // ==========================================
  // 11. UPDATE SIMULASI UTAMA
  // ==========================================
  update(dt) {
    this.simTime += dt;

    // Timer Banner HUD
    if (this.bannerTimer > 0) {
      this.bannerTimer -= dt;
      if (this.bannerTimer <= 0) {
        this.dom.waveBanner.classList.add('hidden');
      }
    }

    // Fade Damage Vignette
    if (this.damageOverlayAlpha > 0) {
      this.damageOverlayAlpha = Math.max(0, this.damageOverlayAlpha - dt * 2.2);
      this.dom.damageOverlay.style.opacity = this.damageOverlayAlpha.toFixed(2);
    }

    // Hitung Sudut Bidikan Pemain berdasarkan Koordinat Mouse & Kamera
    const aimWorldX = this.camera.x + this.input.mouseScreenX;
    const aimWorldY = this.camera.y + this.input.mouseScreenY;
    if (!this.input.touchFire) {
      this.player.angle = Math.atan2(aimWorldY - this.player.y, aimWorldX - this.player.x);
    } else if (this.enemies.length > 0) {
      // Auto-aim bantu untuk layar sentuh
      let nearest = null;
      let minDist = Infinity;
      for (let i = 0; i < this.enemies.length; i++) {
        const e = this.enemies[i];
        if (!e.alive) continue;
        const d = MathUtils.dist(this.player.x, this.player.y, e.x, e.y);
        if (d < minDist) {
          minDist = d;
          nearest = e;
        }
      }
      if (nearest) {
        this.player.angle = Math.atan2(nearest.y - this.player.y, nearest.x - this.player.x);
      }
    }

    // Update Pemain
    this.player.update(dt, this.input, this.arena, this.audio, (fx, fy) => {
      if (this.settings.extraParticles) {
        this.addParticle(new Particle(fx, fy, 0, 0, 3, 'rgba(139, 155, 180, 0.35)', 0.3));
      }
    });

    this.handlePlayerFiring();

    // Manajemen Spawning Wave & Jeda Antar-Wave
    const activeEnemiesCount = this.enemies.length;
    if (this.inWaveIntermission) {
      this.waveIntermissionTimer -= dt;
      if (this.waveIntermissionTimer <= 0) {
        this.startWave(this.currentWaveIndex + 1);
      }
    } else {
      if (this.waveSpawnQueue.length > 0 && activeEnemiesCount < 12) {
        this.waveSpawnTimer -= dt;
        if (this.waveSpawnTimer <= 0) {
          this.spawnEnemyFromQueue();
          this.waveSpawnTimer = WAVE_CONFIG[this.currentWaveIndex].spawnInterval;
        }
      } else if (this.waveSpawnQueue.length === 0 && activeEnemiesCount === 0) {
        // Wave Selesai!
        const currentCfg = WAVE_CONFIG[this.currentWaveIndex];
        this.score += currentCfg.bonus;
        this.audio.play('wave_clear');

        // Pulihkan sebagian HP & tambah cadangan amunisi
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + 20);
        this.player.weaponStates.forEach((ws, idx) => {
          const w = WEAPONS[idx];
          ws.reserveAmmo = Math.min(w.maxReserve, ws.reserveAmmo + w.magSize * 2);
        });

        if (this.currentWaveIndex + 1 >= WAVE_CONFIG.length) {
          this.triggerVictory();
          return;
        } else {
          this.inWaveIntermission = true;
          this.waveIntermissionTimer = 3.4;
          this.showBanner(
            `WAVE ${currentCfg.wave} CLEARED`,
            `BONUS +${currentCfg.bonus} PTS // RESUPPLY RECEIVED`,
            3.0
          );
        }
      }
    }

    // Update Musuh
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      enemy.update(dt, this.player, this.arena, this.enemies, (mx, my, ang, spd, dmg, col) => {
        this.projectiles.push(new Projectile(mx, my, ang, spd, dmg, false, col, 3.6));
        this.audio.play('enemy_shoot');
      });

      // Serangan kontak fisik jarak dekat jika Runner menyentuh pemain
      if (enemy.alive && this.player.alive) {
        const d = MathUtils.dist(enemy.x, enemy.y, this.player.x, this.player.y);
        if (d < enemy.radius + this.player.radius + 2) {
          if (this.player.takeDamage(10, this.audio)) {
            this.damageOverlayAlpha = 0.85;
            this.addScreenShake(8);
            if (!this.player.alive) {
              this.triggerGameOver();
              return;
            }
          }
        }
      }
    }

    // Update Proyektil
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      proj.update(dt, this.arena, this.player, this.enemies, (hitType, hx, hy, target) => {
        if (hitType === 'wall') {
          this.spawnParticles(hx, hy, '#94a3b8', 5, 110);
        } else if (hitType === 'enemy' && target) {
          this.shotsHit++;
          const killed = target.takeDamage(proj.damage);
          this.spawnParticles(hx, hy, target.config.color, 8, 170);
          this.floatingTexts.push(new FloatingText(hx, hy - 10, `-${proj.damage}`, '#00e5ff'));

          if (killed) {
            this.score += target.scoreReward;
            this.totalKills++;
            this.audio.play('kill');
            this.addScreenShake(5);
            this.spawnParticles(target.x, target.y, target.config.color, 20, 240);
            this.floatingTexts.push(
              new FloatingText(target.x, target.y - 24, `+${target.scoreReward}`, '#ffbe0b')
            );

            // Peluang menjatuhkan Supply Drop (Amunisi atau HP)
            if (Math.random() < 0.35) {
              const dropType = this.player.hp < 60 && Math.random() < 0.45 ? 'health' : 'ammo';
              this.supplyDrops.push(new SupplyDrop(target.x, target.y, dropType));
            }
          } else {
            this.audio.play('hit');
          }
        } else if (hitType === 'player' && target) {
          if (target.takeDamage(proj.damage, this.audio)) {
            this.damageOverlayAlpha = 0.85;
            this.addScreenShake(9);
            this.spawnParticles(hx, hy, '#ff2a54', 10, 160);
            if (!this.player.alive) {
              this.triggerGameOver();
            }
          }
        }
      });

      if (!proj.active) {
        this.projectiles.splice(i, 1);
      }
    }

    // Bersihkan musuh yang sudah mati
    this.enemies = this.enemies.filter((e) => e.alive);

    // Update Supply Drops
    for (let i = this.supplyDrops.length - 1; i >= 0; i--) {
      const drop = this.supplyDrops[i];
      drop.update(dt);
      if (
        drop.active &&
        MathUtils.dist(this.player.x, this.player.y, drop.x, drop.y) <= this.player.radius + drop.radius + 4
      ) {
        drop.active = false;
        this.audio.play('pickup');
        if (drop.type === 'ammo') {
          this.player.weaponStates.forEach((ws, idx) => {
            const w = WEAPONS[idx];
            ws.reserveAmmo = Math.min(w.maxReserve, ws.reserveAmmo + w.magSize);
          });
          this.floatingTexts.push(new FloatingText(drop.x, drop.y, '+AMMO RESUPPLY', '#ff9100'));
        } else {
          this.player.hp = Math.min(this.player.maxHp, this.player.hp + 25);
          this.floatingTexts.push(new FloatingText(drop.x, drop.y, '+25 INTEGRITY', '#00e676'));
        }
      }
      if (!drop.active) {
        this.supplyDrops.splice(i, 1);
      }
    }

    // Update Partikel & Floating Text
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update(dt);
      if (this.particles[i].life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      this.floatingTexts[i].update(dt);
      if (this.floatingTexts[i].life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }

    this.updateCamera(dt);
    this.updateHUD();
  }

  updateCamera(dt) {
    const cw = this.canvas.width;
    const ch = this.canvas.height;

    // Pergeseran kamera dinamis mengikuti arah kursor sesuai pengaturan sensitivitas
    const sensFactor = (this.settings.sensitivity / 100) * 0.22;
    const offsetX = (this.input.mouseScreenX - cw / 2) * sensFactor;
    const offsetY = (this.input.mouseScreenY - ch / 2) * sensFactor;

    const targetX = MathUtils.clamp(this.player.x - cw / 2 + offsetX, 0, Math.max(0, this.arena.width - cw));
    const targetY = MathUtils.clamp(this.player.y - ch / 2 + offsetY, 0, Math.max(0, this.arena.height - ch));

    this.camera.x = MathUtils.lerp(this.camera.x, targetX, Math.min(1, dt * 10));
    this.camera.y = MathUtils.lerp(this.camera.y, targetY, Math.min(1, dt * 10));

    if (this.camera.shakeMagnitude > 0.1) {
      this.camera.shakeX = (Math.random() - 0.5) * 2 * this.camera.shakeMagnitude;
      this.camera.shakeY = (Math.random() - 0.5) * 2 * this.camera.shakeMagnitude;
      this.camera.shakeMagnitude *= Math.pow(0.82, dt * 60);
    } else {
      this.camera.shakeX = 0;
      this.camera.shakeY = 0;
      this.camera.shakeMagnitude = 0;
    }
  }

  updateHUD() {
    const hpRatio = MathUtils.clamp(this.player.hp / this.player.maxHp, 0, 1) * 100;
    this.dom.healthBarFill.style.width = `${hpRatio}%`;
    this.dom.healthBarDamage.style.width = `${hpRatio}%`;
    this.dom.healthText.textContent = `${Math.ceil(this.player.hp)} / ${this.player.maxHp}`;

    if (this.player.hp <= 30) {
      this.dom.healthBarFill.classList.add('critical');
      this.dom.statusBadge.textContent = 'STATUS: CRITICAL';
      this.dom.statusBadge.className = 'status-badge status-critical';
    } else if (this.player.hp <= 65) {
      this.dom.healthBarFill.classList.remove('critical');
      this.dom.statusBadge.textContent = 'STATUS: CAUTION';
      this.dom.statusBadge.className = 'status-badge status-warning';
    } else {
      this.dom.healthBarFill.classList.remove('critical');
      this.dom.statusBadge.textContent = 'STATUS: NOMINAL';
      this.dom.statusBadge.className = 'status-badge status-nominal';
    }

    const totalRemaining = this.enemies.length + this.waveSpawnQueue.length;
    this.dom.waveNumber.textContent = this.currentWaveIndex + 1;
    this.dom.enemiesRemaining.textContent = totalRemaining;
    this.dom.scoreValue.textContent = String(this.score).padStart(6, '0');

    const weapon = this.player.currentWeapon;
    const ammoState = this.player.currentAmmoState;
    this.dom.weaponName.textContent = weapon.name;
    this.dom.weaponDesc.textContent = weapon.subtitle;
    this.dom.ammoMag.textContent = ammoState.currentMag;
    this.dom.ammoReserve.textContent = ammoState.reserveAmmo;

    this.dom.slots.forEach((slotEl, idx) => {
      slotEl.classList.toggle('active', idx === this.player.currentWeaponIndex);
    });

    if (this.player.isReloading) {
      this.dom.reloadIndicator.classList.remove('hidden');
      const progress = MathUtils.clamp(1 - this.player.reloadTimer / weapon.reloadTime, 0, 1) * 100;
      this.dom.reloadProgressFill.style.width = `${progress}%`;
      this.dom.ammoWarning.classList.add('hidden');
    } else {
      this.dom.reloadIndicator.classList.add('hidden');
      if (ammoState.currentMag === 0 && ammoState.reserveAmmo === 0) {
        this.dom.ammoWarning.textContent = 'OUT OF AMMUNITION - SWITCH WEAPON [1/2/3]';
        this.dom.ammoWarning.classList.remove('hidden');
      } else if (ammoState.currentMag <= Math.ceil(weapon.magSize * 0.25)) {
        this.dom.ammoWarning.textContent = 'LOW AMMUNITION - PRESS [R] TO RELOAD';
        this.dom.ammoWarning.classList.remove('hidden');
      } else {
        this.dom.ammoWarning.classList.add('hidden');
      }
    }
  }

  // ==========================================
  // 12. RENDERING DAN CROSSHAIR TAKTIS
  // ==========================================
  render() {
    const ctx = this.ctx;
    const cw = this.canvas.width;
    const ch = this.canvas.height;

    ctx.clearRect(0, 0, cw, ch);

    if (this.state === 'MENU') {
      // Animasi kamera latar belakang saat di Menu Utama
      const t = performance.now() * 0.0004;
      const camX = 1200 - cw / 2 + Math.cos(t) * 280;
      const camY = 900 - ch / 2 + Math.sin(t * 0.8) * 180;
      ctx.save();
      ctx.translate(-camX, -camY);
      this.arena.draw(ctx, { x: camX, y: camY }, cw, ch, t * 4);
      ctx.restore();
      return;
    }

    ctx.save();
    ctx.translate(
      -(this.camera.x + this.camera.shakeX),
      -(this.camera.y + this.camera.shakeY)
    );

    // 1. Gambar Arena
    this.arena.draw(ctx, this.camera, cw, ch, this.simTime);

    // 2. Gambar Supply Drops
    for (let i = 0; i < this.supplyDrops.length; i++) {
      this.supplyDrops[i].draw(ctx, this.simTime);
    }

    // 3. Gambar Partikel Lantai & Percikan
    for (let i = 0; i < this.particles.length; i++) {
      this.particles[i].draw(ctx);
    }

    // 4. Gambar Proyektil
    for (let i = 0; i < this.projectiles.length; i++) {
      this.projectiles[i].draw(ctx);
    }

    // 5. Gambar Musuh
    for (let i = 0; i < this.enemies.length; i++) {
      this.enemies[i].draw(ctx);
    }

    // 6. Gambar Garis Bidik Laser Halus dari Senjata Pemain
    if (this.player.alive) {
      const aimX = this.camera.x + this.input.mouseScreenX;
      const aimY = this.camera.y + this.input.mouseScreenY;
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.14)';
      ctx.lineWidth = 1;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(this.player.x, this.player.y);
      ctx.lineTo(aimX, aimY);
      ctx.stroke();
      ctx.restore();
    }

    // 7. Gambar Pemain
    this.player.draw(ctx);

    // 8. Gambar Teks Indikator Damage/Skor
    for (let i = 0; i < this.floatingTexts.length; i++) {
      this.floatingTexts[i].draw(ctx);
    }

    ctx.restore();

    // 9. Gambar Crosshair Taktis di Ruang Layar (Screen Space)
    if (this.state === 'PLAYING') {
      this.drawCrosshair(ctx);
    }
  }

  drawCrosshair(ctx) {
    const mx = this.input.mouseScreenX;
    const my = this.input.mouseScreenY;
    const spreadGap = 7 + this.player.recoilOffset * 1.4;

    ctx.save();
    ctx.translate(mx, my);

    ctx.strokeStyle = this.player.isReloading ? '#ff7b00' : '#00e5ff';
    ctx.lineWidth = 2;

    // 4 Garis Reticle Dinamis
    ctx.beginPath();
    ctx.moveTo(-spreadGap - 8, 0);
    ctx.lineTo(-spreadGap, 0);
    ctx.moveTo(spreadGap, 0);
    ctx.lineTo(spreadGap + 8, 0);
    ctx.moveTo(0, -spreadGap - 8);
    ctx.lineTo(0, -spreadGap);
    ctx.moveTo(0, spreadGap);
    ctx.lineTo(0, spreadGap + 8);
    ctx.stroke();

    // Titik Tengah Presisi
    ctx.fillStyle = '#ff7b00';
    ctx.beginPath();
    ctx.arc(0, 0, 2, 0, Math.PI * 2);
    ctx.fill();

    // Lingkaran Indikator Reload pada Crosshair
    if (this.player.isReloading) {
      const weapon = this.player.currentWeapon;
      const ratio = MathUtils.clamp(1 - this.player.reloadTimer / weapon.reloadTime, 0, 1);
      ctx.beginPath();
      ctx.arc(0, 0, 16, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ratio);
      ctx.strokeStyle = '#ff7b00';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }

    ctx.restore();
  }

  // ==========================================
  // 13. GAME LOOP UTAMA
  // ==========================================
  loop(timestamp) {
    const rawDt = (timestamp - this.lastFrameTime) / 1000;
    this.lastFrameTime = timestamp;

    // Batasi delta time maksimal 0.05 detik (20 FPS minimum step) agar tidak loncat saat kembali dari tab lain
    const dt = Math.min(Math.max(rawDt, 0), 0.05);

    if (this.state === 'PLAYING') {
      this.update(dt);
    }

    this.render();
    this.rafId = requestAnimationFrame((ts) => this.loop(ts));
  }
}

// Inisialisasi Game saat DOM Siap
window.addEventListener('DOMContentLoaded', () => {
  window.shadowStrikeGame = new Game();
});