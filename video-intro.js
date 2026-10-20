/**
 * Royal Wedding Video Intro Controller
 * Replaces peacock animation with assets/intro-final.MP4
 * Features:
 *  - Smooth touch/tap to play
 *  - Ultra-smooth, slow opacity transition at the end
 *  - Seamless bridge to main palace invitation & music
 */

(function () {
  'use strict';

  class VideoIntro {
    constructor() {
      this.wrapper = document.getElementById('intro-wrapper');
      this.video = document.getElementById('intro-video');
      this.tapPrompt = document.getElementById('tap-prompt');
      this.ganeshBlock = document.getElementById('intro-ganesh-block');
      this.skipBtn = document.getElementById('intro-skip-btn');

      this.isPlaying = false;
      this.hasEnded = false;
      this.isFadingOut = false;
      this.fadeTriggerTime = 1.8; // Seconds before video ends to begin slow smooth fade

      this.init();
    }

    init() {
      if (!this.wrapper || !this.video) return;

      // Ensure playsinline, preloading and 100% MUTED intro video
      this.video.playsInline = true;
      this.video.muted = true;
      this.video.volume = 0;
      this.video.setAttribute('playsinline', '');
      this.video.setAttribute('webkit-playsinline', '');
      this.video.setAttribute('muted', '');

      // Bind interaction listeners
      const triggerStart = (e) => {
        if (!this.isPlaying && !this.hasEnded) {
          // Prevent default double fire on touch
          if (e && e.type === 'touchstart') {
            e.preventDefault();
          }

          // Pre-unlock main background audio during user gesture context
          const bgAudio = document.getElementById('bg-audio');
          if (bgAudio) {
            bgAudio.load();
          }

          this.startPlayback();
        }
      };

      // Listen for touch & click anywhere on wrapper or prompt
      this.wrapper.addEventListener('click', triggerStart);
      this.wrapper.addEventListener('touchstart', triggerStart, { passive: false });

      // Skip button
      if (this.skipBtn) {
        this.skipBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.finishIntro(true);
        });
        this.skipBtn.addEventListener('touchstart', (e) => {
          e.stopPropagation();
          this.finishIntro(true);
        });
      }

      // Video event listeners
      this.video.addEventListener('timeupdate', () => {
        if (!this.video.duration || this.isFadingOut) return;

        const timeLeft = this.video.duration - this.video.currentTime;
        if (timeLeft <= this.fadeTriggerTime && timeLeft > 0) {
          this.beginSmoothFadeOut();
        }
      });

      this.video.addEventListener('ended', () => {
        if (!this.isFadingOut) {
          this.beginSmoothFadeOut();
        }
      });

      // Handle video error gracefully (e.g. if file is missing, open directly)
      this.video.addEventListener('error', (err) => {
        console.warn('Intro video error, bypassing intro:', err);
        this.finishIntro(true);
      });
    }

    startPlayback() {
      this.isPlaying = true;

      // Softly hide tap prompt
      if (this.tapPrompt) {
        this.tapPrompt.classList.add('hide-prompt');
      }

      // Show video element with smooth fade-in
      if (this.video) {
        this.video.muted = true;
        this.video.volume = 0;
        this.video.classList.add('playing');
        
        // Show pink glassmorphism skip button gently after 500ms
        setTimeout(() => {
          if (this.skipBtn && !this.hasEnded) {
            this.skipBtn.classList.add('visible');
          }
        }, 500);

        this.video.play().catch((err) => {
          console.warn('Video playback:', err);
        });
      }
    }

    beginSmoothFadeOut() {
      if (this.isFadingOut || this.hasEnded) return;
      this.isFadingOut = true;

      // Trigger main palace invitation animations & play main background shehnai audio
      window.dispatchEvent(new CustomEvent('peacockIntroOpen'));

      const bgAudio = document.getElementById('bg-audio');
      if (bgAudio) {
        bgAudio.play().catch(e => console.log('bgAudio play:', e));
      }

      // Apply ultra-smooth slow opacity transition to the wrapper
      if (this.wrapper) {
        this.wrapper.classList.add('slow-fade-out');
      }

      // After slow opacity fade finishes completely (2200ms)
      setTimeout(() => {
        this.cleanup();
      }, 2300);
    }

    fadeAudioOut() {
      try {
        if (!this.video || this.video.muted) return;
        const startVolume = this.video.volume;
        const fadeInterval = 50;
        const step = startVolume / (1500 / fadeInterval);

        const fadeTimer = setInterval(() => {
          if (!this.video || this.video.volume <= 0.05) {
            clearInterval(fadeTimer);
            if (this.video) this.video.volume = 0;
          } else {
            this.video.volume = Math.max(0, this.video.volume - step);
          }
        }, fadeInterval);
      } catch (_) {}
    }

    finishIntro(immediate = false) {
      if (this.hasEnded) return;

      if (immediate) {
        this.hasEnded = true;
        this.isFadingOut = true;
        window.dispatchEvent(new CustomEvent('peacockIntroOpen'));
        if (this.wrapper) {
          this.wrapper.classList.add('slow-fade-out');
        }
        setTimeout(() => {
          this.cleanup();
        }, 1200);
      } else {
        this.beginSmoothFadeOut();
      }
    }

    cleanup() {
      this.hasEnded = true;
      if (this.video) {
        try {
          this.video.pause();
        } catch (_) {}
      }
      if (this.wrapper) {
        this.wrapper.style.display = 'none';
        this.wrapper.style.pointerEvents = 'none';
      }
    }
  }

  // Auto initialize on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    window.videoIntroInstance = new VideoIntro();
  });
})();
