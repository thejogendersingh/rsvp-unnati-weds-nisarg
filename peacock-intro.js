/**
 * Royal Peacock Feather Intro Animation
 * Integrated for Royal Wedding Invitation
 * From: thejogendersingh/morpankh-intro-invcraftmedia
 */

(function () {
  'use strict';

  const ASSETS = {
    featherRustle: 'animations/peacock-feather/feather-rustle.mp3',
    peacockFeather: 'animations/peacock-feather/peacock-feather.webp',
    peacockBody: 'animations/peacock-feather/peacock-body.webp',
    bgTexture: 'animations/peacock-feather/bg-feather-texture.webp'
  };

  const SPARKLE_COLORS = [
    "#D4AF37", "#FFDF78", "#4ADE80", "#67E8F9", "#FBBF24", "#FFFFFF"
  ];

  class PeacockAudioController {
    constructor() {
      this.soundEnabled = true;
      this.rustleAudio = null;
    }

    setEnabled(enabled) {
      this.soundEnabled = enabled;
    }

    getEnabled() {
      return this.soundEnabled;
    }

    attach(audioElem) {
      if (audioElem) {
        this.rustleAudio = audioElem;
      }
    }

    playFeatherRustle(speed = 1) {
      if (!this.soundEnabled) return;
      try {
        if (!this.rustleAudio) {
          this.rustleAudio = new Audio(ASSETS.featherRustle);
          this.rustleAudio.volume = 0.6;
        }
        const audio = this.rustleAudio;
        audio.currentTime = 0;
        audio.playbackRate = Math.min(4, Math.max(0.5, speed));
        audio.play().catch(e => console.log('Audio autoplay info:', e));
      } catch (err) {
        console.error('Audio error:', err);
      }
    }

    stopFeatherRustle() {
      if (this.rustleAudio) {
        try {
          this.rustleAudio.pause();
          this.rustleAudio.currentTime = 0;
        } catch (_) {}
      }
    }
  }

  const audioController = new PeacockAudioController();

  class PeacockIntro {
    constructor() {
      this.speedMultiplier = 0.75;
      this.isStarted = false;
      this.isComplete = false;
      this.isDismissed = false;
      this.isMobile = window.innerWidth < 640;
      this.dimensions = { width: window.innerWidth, height: window.innerHeight };
      this.featherNodes = [];
      this.goldenParticles = [];
      this.timings = {
        openingBaseDuration: 1.3,
        jiggleStartTime: 2.2,
        closingStartTime: 4.7,
        totalDuration: 6.4
      };

      // Canvas / Animation frame refs
      this.canvasRef = null;
      this.ctx = null;
      this.featherBitmap = null;
      this.animStartTime = null;
      this.rafId = null;
      this.rustleTimer = null;
      this.resetPromptTimer = null;
      this.autoOpenTimer = null;

      // DOM Elements
      this.wrapper = document.getElementById('intro-wrapper');
      this.backdrop = document.getElementById('intro-backdrop');
      this.stage = document.getElementById('intro-stage');
      this.headerContent = document.getElementById('intro-header-content');
      this.tapPrompt = document.getElementById('tap-prompt');
      this.peacockBodyAnchor = document.getElementById('peacock-body-anchor');
      this.peacockBodyMotion = document.getElementById('peacock-body-elem');
      this.feathersCluster = document.getElementById('peacock-feathers-cluster');
      this.canvas = document.getElementById('peacock-canvas');
      this.sparklesCluster = document.getElementById('peacock-sparkles-cluster');
      this.rustleAudio = document.getElementById('rustle-audio');

      // Toolbar elements (optional)
      this.replayBtn = document.getElementById('intro-replay-btn');
      this.speedBtns = document.querySelectorAll('.speed-btn');
      this.soundBtn = document.getElementById('intro-sound-btn');
      this.enterBtn = document.getElementById('intro-enter-btn');

      this.init();
    }

    init() {
      audioController.attach(this.rustleAudio);
      this.preloadImages();
      this.handleResize();
      this.generateNodesAndParticles();
      this.bindEvents();
    }

    preloadImages() {
      const img = new Image();
      img.onload = async () => {
        if ('createImageBitmap' in window) {
          try {
            this.featherBitmap = await createImageBitmap(img);
          } catch {
            this.featherBitmap = img;
          }
        } else {
          this.featherBitmap = img;
        }
      };
      img.src = ASSETS.peacockFeather;
    }

    handleResize() {
      const updateSize = () => {
        this.dimensions.width = window.innerWidth;
        this.dimensions.height = window.innerHeight;
        this.isMobile = this.dimensions.width < 640;

        const V = this.isMobile ? Math.min(0.28 * this.dimensions.height, 200) : Math.min(0.32 * this.dimensions.height, 260);
        const Z = Math.round(1024 / 682 * V);

        if (this.peacockBodyAnchor) {
          this.peacockBodyAnchor.style.width = `${Z}px`;
          this.peacockBodyAnchor.style.height = `${V}px`;
        }

        if (this.canvas) {
          if (this.isMobile) {
            this.canvas.style.display = 'block';
            if (this.feathersCluster) this.feathersCluster.style.display = 'none';
          } else {
            this.canvas.style.display = 'none';
            if (this.feathersCluster) this.feathersCluster.style.display = 'block';
          }
        }
      };

      updateSize();
      window.addEventListener('resize', () => {
        updateSize();
        this.generateNodesAndParticles();
      }, { passive: true });
    }

    generateNodesAndParticles() {
      const nodes = [];
      let idCounter = 0;

      const tiers = [
        { tierIndex: 0, count: this.isMobile ? 11 : 15, span: this.isMobile ? 138 : 148, lengthRatio: 1.0,  baseZIndex: 10, staggered: false, brightness: 1.0 },
        { tierIndex: 1, count: this.isMobile ? 10 : 14, span: this.isMobile ? 124 : 136, lengthRatio: 0.77, baseZIndex: 25, staggered: true,  brightness: 1.03 },
        { tierIndex: 2, count: this.isMobile ? 7  : 11, span: this.isMobile ? 96  : 106, lengthRatio: 0.56, baseZIndex: 40, staggered: false, brightness: 1.06 },
        { tierIndex: 3, count: this.isMobile ? 5  : 7,  span: this.isMobile ? 58  : 66,  lengthRatio: 0.38, baseZIndex: 55, staggered: false, brightness: 1.1 }
      ];

      tiers.forEach(tier => {
        const half = Math.floor(tier.count / 2);

        const addNode = (angle, isLeft, openDelay, openDuration, jiggleDelay, scale, distRatio, zIndex) => {
          nodes.push({
            id: idCounter++,
            tierIndex: tier.tierIndex,
            angle,
            scale,
            lengthRatio: tier.lengthRatio,
            openDelay,
            openDuration,
            jiggleDelay,
            isLeft,
            zIndex,
            brightness: tier.brightness,
            distRatio
          });
        };

        if (tier.staggered) {
          const step = tier.span / tier.count;
          for (let i = 0; i < half; i++) {
            const angle = (i + 0.5) * step;
            const distRatio = Math.min(1, angle / (tier.span / 2));
            const openDelay = 0.08 + 0.07 * tier.tierIndex + 0.65 * distRatio;
            const openDuration = 1.3 + 0.16 * distRatio;
            const jiggleDelay = 2.2 + 0.18 * distRatio + 0.04 * tier.tierIndex;
            const scale = Math.max(0.92, 1 - 0.06 * distRatio);
            addNode(angle, false, openDelay, openDuration, jiggleDelay, scale, distRatio, tier.baseZIndex + half - i);
            addNode(-angle, true, openDelay, openDuration, jiggleDelay, scale, distRatio, tier.baseZIndex + half - i);
          }
        } else {
          const step = tier.span / (tier.count - 1);
          addNode(0, true, 0.08 + 0.08 * tier.tierIndex, 1.3, 2.2 + 0.04 * tier.tierIndex, 1, 0, tier.baseZIndex + half + 5);
          for (let i = 1; i <= half; i++) {
            const angle = i * step;
            const distRatio = Math.min(1, angle / (tier.span / 2));
            const openDelay = 0.08 + 0.07 * tier.tierIndex + 0.65 * distRatio;
            const openDuration = 1.3 + 0.16 * distRatio;
            const jiggleDelay = 2.2 + 0.18 * distRatio + 0.04 * tier.tierIndex;
            const scale = Math.max(0.92, 1 - 0.06 * distRatio);
            addNode(angle, false, openDelay, openDuration, jiggleDelay, scale, distRatio, tier.baseZIndex + half - i);
            addNode(-angle, true, openDelay, openDuration, jiggleDelay, scale, distRatio, tier.baseZIndex + half - i);
          }
        }
      });

      this.featherNodes = nodes;

      // Golden Sparkle particles
      const particles = [];
      let seed = 4042;
      const rng = () => (seed = (9301 * seed + 49297) % 233280) / 233280;
      const count = this.isMobile ? 0 : 45;
      for (let i = 0; i < count; i++) {
        particles.push({
          id: i,
          x: (rng() - 0.5) * 88,
          y: -5 - 70 * rng(),
          size: 1.5 + 2 * rng(),
          delay: 0.3 + rng() * 5.1,
          duration: 1 + rng(),
          driftX: (rng() - 0.5) * 60,
          driftY: -20 - 40 * rng()
        });
      }
      this.goldenParticles = particles;

      this.injectDesktopKeyframes();
      this.renderDesktopFeathers();
      this.renderSparkles();
    }

    injectDesktopKeyframes() {
      let styleTag = document.getElementById('peacock-desktop-kf-v4');
      if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = 'peacock-desktop-kf-v4';
        document.head.appendChild(styleTag);
      }

      styleTag.textContent = this.featherNodes.map(node => {
        const t = node.angle;
        const a = node.scale;
        return `@keyframes pfm_${node.id} {
          0%       { opacity: 0;   transform: translate3d(0, 45px, 0) rotate(0deg) scale(0.3); }
          2.5%     { opacity: 1; }
          28%      { opacity: 1;   transform: translate3d(0, -2px, 0) rotate(${(1.02 * t).toFixed(4)}deg) scale(${(1.01 * a).toFixed(4)}); }
          35%      { opacity: 1;   transform: translate3d(0, 0, 0) rotate(${t.toFixed(4)}deg) scale(${a.toFixed(4)}); }
          65%      { opacity: 1;   transform: translate3d(0, 0, 0) rotate(${t.toFixed(4)}deg) scale(${a.toFixed(4)}); }
          72%      { opacity: 1;   transform: translate3d(0, 2px, 0) rotate(${(0.96 * t).toFixed(4)}deg) scale(${(0.97 * a).toFixed(4)}); }
          80%      { opacity: 1;   transform: translate3d(0, 9px, 0) rotate(${(0.72 * t).toFixed(4)}deg) scale(${(0.78 * a).toFixed(4)}); }
          88%      { opacity: 0.8; transform: translate3d(0, 24px, 0) rotate(${(0.18 * t).toFixed(4)}deg) scale(0.52); }
          94%      { opacity: 0.3; transform: translate3d(0, 40px, 0) rotate(0deg) scale(0.28); }
          99%,100% { opacity: 0;   transform: translate3d(0, 55px, 0) rotate(0deg) scale(0.15); }
        }`;
      }).join('\n');
    }

    renderDesktopFeathers() {
      if (!this.feathersCluster || this.isMobile) return;
      this.feathersCluster.innerHTML = '';

      const W = Math.min(0.78 * this.dimensions.height, 660);

      this.featherNodes.forEach(node => {
        const s = Math.round(W * node.lengthRatio);
        const o = Math.round((682 / 1024) * s);

        const motionNode = document.createElement('div');
        motionNode.className = 'peacock-motion-node';
        motionNode.dataset.id = node.id;
        motionNode.style.zIndex = node.zIndex;
        motionNode.style.width = `${o}px`;
        motionNode.style.height = `${s}px`;
        motionNode.style.marginLeft = `-${o / 2}px`;
        motionNode.style.opacity = '0';
        motionNode.style.transform = 'translate3d(0, 0, 0)';

        const quiverNode = document.createElement('div');
        quiverNode.className = 'peacock-quiver-node';

        const img = document.createElement('img');
        img.src = ASSETS.peacockFeather;
        img.alt = '';
        img.className = 'feather-img';
        img.draggable = false;

        quiverNode.appendChild(img);
        motionNode.appendChild(quiverNode);
        this.feathersCluster.appendChild(motionNode);
      });
    }

    renderSparkles() {
      if (!this.sparklesCluster || this.isMobile) return;
      this.sparklesCluster.innerHTML = '';

      this.goldenParticles.forEach(p => {
        const item = document.createElement('div');
        item.className = 'peacock-sparkle-item';
        item.style.setProperty('--p-dx', `${p.driftX}px`);
        item.style.setProperty('--p-dy', `${p.driftY}px`);
        item.style.setProperty('--p-dx-25', `${0.25 * p.driftX}px`);
        item.style.setProperty('--p-dy-25', `${0.25 * p.driftY}px`);
        item.style.setProperty('--p-dx-75', `${0.75 * p.driftX}px`);
        item.style.setProperty('--p-dy-75', `${0.75 * p.driftY}px`);
        item.style.left = `${p.x}vw`;
        item.style.top = `${p.y}vh`;
        item.style.width = `${p.size}px`;
        item.style.height = `${p.size}px`;
        item.style.backgroundColor = SPARKLE_COLORS[p.id % SPARKLE_COLORS.length];
        item.style.opacity = '0';

        this.sparklesCluster.appendChild(item);
      });
    }

    bindEvents() {
      const triggerAction = () => {
        if (!this.isStarted) {
          this.startAnimation();
        } else {
          this.openInvitation();
        }
      };

      if (this.stage) {
        this.stage.addEventListener('click', triggerAction);
      }
      if (this.tapPrompt) {
        this.tapPrompt.addEventListener('click', (e) => {
          e.stopPropagation();
          triggerAction();
        });
      }

      if (this.enterBtn) {
        this.enterBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.openInvitation();
        });
      }

      if (this.replayBtn) {
        this.replayBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.replay();
        });
      }

      this.speedBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.speedBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.speedMultiplier = parseFloat(btn.dataset.speed) || 1.0;
        });
      });

      if (this.soundBtn) {
        this.soundBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const next = !audioController.getEnabled();
          audioController.setEnabled(next);
          this.updateSoundBtnUI(next);
        });
      }
    }

    updateSoundBtnUI(enabled) {
      if (this.soundBtn) {
        if (enabled) {
          this.soundBtn.classList.remove('muted');
          this.soundBtn.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
            </svg>
          `;
          this.soundBtn.title = "Mute intro rustle";
        } else {
          this.soundBtn.classList.add('muted');
          this.soundBtn.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <line x1="23" y1="9" x2="17" y2="15"></line>
              <line x1="17" y1="9" x2="23" y2="15"></line>
            </svg>
          `;
          this.soundBtn.title = "Unmute intro rustle";
        }
      }
    }

    startAnimation() {
      if (this.isStarted) return;
      this.isStarted = true;
      this.isComplete = false;

      const n = this.speedMultiplier;
      const totalDur = this.timings.totalDuration / n;

      if (this.tapPrompt) {
        this.tapPrompt.classList.add('hidden');
      }

      if (this.headerContent) {
        this.headerContent.classList.add('fanned');
      }

      if (this.peacockBodyMotion) {
        this.peacockBodyMotion.classList.remove('peacock-body-resting');
        this.peacockBodyMotion.classList.add('peacock-body-motion');
        this.peacockBodyMotion.style.animationDuration = `${totalDur}s`;
      }

      this.rustleTimer = setTimeout(() => {
        audioController.playFeatherRustle(n);
      }, 1850 / n);

      if (this.isMobile) {
        this.startCanvasAnimation();
      } else {
        this.startDesktopDomAnimation();
      }

      this.startSparklesAnimation();

      // Right after the grand bloom and golden shimmer (~4.2s), immediately show hero section!
      const bloomDuration = (3.2 / n) * 1000;
      this.autoOpenTimer = setTimeout(() => {
        if (!this.isDismissed) {
          this.openInvitation();
        }
      }, bloomDuration);
    }

    startDesktopDomAnimation() {
      const n = this.speedMultiplier;
      const totalDur = this.timings.totalDuration / n;

      const nodes = this.feathersCluster ? this.feathersCluster.querySelectorAll('.peacock-motion-node') : [];
      nodes.forEach(el => {
        const id = parseInt(el.dataset.id, 10);
        const nodeData = this.featherNodes.find(d => d.id === id);
        if (!nodeData) return;

        const openDelay = nodeData.openDelay / n;
        const jiggleDelay = nodeData.jiggleDelay / n;

        el.style.opacity = '1';
        el.style.animationName = `pfm_${id}`;
        el.style.animationDelay = `${openDelay}s`;
        el.style.animationDuration = `${totalDur}s`;

        const quiverEl = el.querySelector('.peacock-quiver-node');
        if (quiverEl) {
          quiverEl.style.animationDelay = `${jiggleDelay}s`;
        }
      });
    }

    startSparklesAnimation() {
      if (!this.sparklesCluster || this.isMobile) return;
      const n = this.speedMultiplier;

      const sparkles = this.sparklesCluster.querySelectorAll('.peacock-sparkle-item');
      sparkles.forEach((el, index) => {
        const p = this.goldenParticles[index];
        if (!p) return;
        el.style.opacity = '1';
        el.style.animationDelay = `${p.delay / n}s`;
        el.style.animationDuration = `${p.duration / n}s`;
      });
    }

    startCanvasAnimation() {
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      if (!this.ctx) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.canvas.width = this.dimensions.width * dpr;
      this.canvas.height = this.dimensions.height * dpr;
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const n = this.speedMultiplier;
      const totalDur = this.timings.totalDuration / n;
      const rad = Math.PI / 180;
      const centerX = this.dimensions.width / 2;
      const baseY = 0.965 * this.dimensions.height;
      const maxFeatherHeight = Math.min(0.7 * this.dimensions.height, 500);

      const sortedNodes = [...this.featherNodes].map(node => {
        const t = node.angle;
        const a = node.scale;
        return {
          node,
          stops: [
            { t: 0,     opacity: 0, ty: 45, rot: 0,                 sc: 0.3 },
            { t: 0.025, opacity: 1, ty: 45, rot: 0,                 sc: 0.3 },
            { t: 0.28,  opacity: 1, ty: -2, rot: 1.02 * t,          sc: 1.01 * a },
            { t: 0.35,  opacity: 1, ty: 0,  rot: t,                 sc: a },
            { t: 0.72,  opacity: 1, ty: 0,  rot: t,                 sc: a },
            { t: 0.75,  opacity: 1, ty: 4,  rot: 0.85 * t,          sc: 0.85 * a },
            { t: 0.82,  opacity: 1, ty: 18, rot: 0.1 * t,           sc: 0.6 },
            { t: 0.92,  opacity: 0.4, ty: 38, rot: 0,               sc: 0.3 },
            { t: 0.98,  opacity: 0, ty: 52, rot: 0,                 sc: 0.2 },
            { t: 1.0,   opacity: 0, ty: 52, rot: 0,                 sc: 0.2 }
          ]
        };
      }).sort((a, b) => a.node.zIndex - b.node.zIndex);

      this.animStartTime = performance.now();
      const interpTarget = { opacity: 0, ty: 0, rot: 0, sc: 0 };

      const cubicEase = (progress) => {
        if (progress <= 0) return 0;
        if (progress >= 1) return 1;
        return progress * progress * (3 - 2 * progress);
      };

      const render = (now) => {
        const elapsedSec = (now - this.animStartTime) / 1000;
        this.ctx.clearRect(0, 0, this.dimensions.width, this.dimensions.height);

        for (const item of sortedNodes) {
          const { node, stops } = item;
          const nodeProgress = (elapsedSec - (node.openDelay / n)) / totalDur;
          if (nodeProgress < 0) continue;

          const clampedProgress = Math.max(0, Math.min(1, nodeProgress));
          let sIdx = 0;
          while (sIdx < stops.length - 2 && stops[sIdx + 1].t <= clampedProgress) {
            sIdx++;
          }
          const cStop = stops[sIdx];
          const nStop = stops[sIdx + 1] || cStop;
          const segDuration = nStop.t - cStop.t;
          const segProgress = segDuration > 0 ? (clampedProgress - cStop.t) / segDuration : 1;
          const eased = cubicEase(segProgress);

          interpTarget.opacity = cStop.opacity + (nStop.opacity - cStop.opacity) * eased;
          interpTarget.ty = cStop.ty + (nStop.ty - cStop.ty) * eased;
          interpTarget.rot = cStop.rot + (nStop.rot - cStop.rot) * eased;
          interpTarget.sc = cStop.sc + (nStop.sc - cStop.sc) * eased;

          let quiverOffset = 0;
          if (clampedProgress >= 0.35 && clampedProgress <= 0.72) {
            const quiverTime = elapsedSec - (node.jiggleDelay / n);
            if (quiverTime > 0) {
              quiverOffset = 1.2 * Math.sin((2 * Math.PI * quiverTime) / 0.18);
            }
          }

          const alpha = Math.max(0, Math.min(1, interpTarget.opacity));
          if (alpha < 0.005) continue;

          const h = Math.round(maxFeatherHeight * node.lengthRatio);
          const w = Math.round((682 / 1024) * h);

          this.ctx.save();
          this.ctx.globalAlpha = alpha;
          this.ctx.translate(centerX, baseY + interpTarget.ty);
          this.ctx.rotate((interpTarget.rot + quiverOffset) * rad);
          this.ctx.scale(interpTarget.sc, interpTarget.sc);
          if (this.featherBitmap) {
            this.ctx.drawImage(this.featherBitmap, -w / 2, -h, w, h);
          }
          this.ctx.restore();
        }

        if (elapsedSec < totalDur + 0.3) {
          this.rafId = requestAnimationFrame(render);
        }
      };

      this.rafId = requestAnimationFrame(render);
    }

    replay() {
      if (this.rustleTimer) clearTimeout(this.rustleTimer);
      if (this.resetPromptTimer) clearTimeout(this.resetPromptTimer);
      if (this.autoOpenTimer) clearTimeout(this.autoOpenTimer);
      if (this.rafId) cancelAnimationFrame(this.rafId);

      this.isStarted = false;
      this.isComplete = false;

      if (this.peacockBodyMotion) {
        this.peacockBodyMotion.classList.remove('peacock-body-motion');
        this.peacockBodyMotion.classList.add('peacock-body-resting');
        this.peacockBodyMotion.style.animationDuration = '3.6s';
      }

      if (this.feathersCluster) {
        const nodes = this.feathersCluster.querySelectorAll('.peacock-motion-node');
        nodes.forEach(el => {
          el.style.opacity = '0';
          el.style.animationName = 'none';
        });
      }

      if (this.sparklesCluster) {
        const sparkles = this.sparklesCluster.querySelectorAll('.peacock-sparkle-item');
        sparkles.forEach(el => {
          el.style.opacity = '0';
          el.style.animationName = 'none';
        });
      }

      if (this.ctx && this.canvas) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }

      // Immediately re-trigger
      setTimeout(() => {
        this.startAnimation();
      }, 50);
    }

    openInvitation() {
      if (this.isDismissed) return;
      this.isDismissed = true;

      if (this.rustleTimer) clearTimeout(this.rustleTimer);
      if (this.resetPromptTimer) clearTimeout(this.resetPromptTimer);
      if (this.autoOpenTimer) clearTimeout(this.autoOpenTimer);
      audioController.stopFeatherRustle();

      // Transition effect
      if (this.wrapper) {
        this.wrapper.classList.add('fade-out');
        setTimeout(() => {
          this.wrapper.style.display = 'none';
          if (this.rafId) cancelAnimationFrame(this.rafId);
        }, 1200);
      }

      // Notify the main application logic to play music and reveal palace cards
      window.dispatchEvent(new CustomEvent('peacockIntroOpen'));
    }

    showIntro() {
      this.isDismissed = false;
      if (this.wrapper) {
        this.wrapper.style.display = 'flex';
        // Force reflow
        void this.wrapper.offsetWidth;
        this.wrapper.classList.remove('fade-out');
      }
      this.replay();
    }
  }

  window.PeacockIntro = PeacockIntro;

  document.addEventListener('DOMContentLoaded', () => {
    window.peacockIntroInstance = new PeacockIntro();
  });
})();
