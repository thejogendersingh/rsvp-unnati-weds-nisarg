/**
 * Mahal Swipe - Royal Wedding Invitation Logic
 * Aarav Malhotra weds Diya Sharma
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const introWrapper = document.getElementById('intro-wrapper');
  const peacockOverlay = introWrapper;
  const audioBtn = document.getElementById('audio-btn');
  const bgAudio = document.getElementById('bg-audio');
  const canvas = document.getElementById('particles-canvas');
  const ctx = canvas.getContext('2d');
  const cards = Array.from(document.querySelectorAll('.invitation-card'));
  const paginationContainer = document.getElementById('side-pagination');
  const langDropdown = document.getElementById('lang-dropdown');
  const langTrigger = document.getElementById('lang-trigger');
  const langCurrent = document.getElementById('lang-current');
  const langOptions = document.querySelectorAll('.lang-option');

  // Palace & Haveli Transition Elements
  const staticBgLayer = document.getElementById('static-bg-layer');
  const mahalSwipeLayer = document.getElementById('mahal-swipe-layer');
  const navLeft = document.getElementById('nav-left');
  const navRight = document.getElementById('nav-right');
  const swipeHintBar = document.getElementById('swipe-hint-bar');

  let currentCardIndex = 0;
  let currentPalaceIndex = 2;
  let isTransitioning = false;
  let isPalaceTransitioning = false;
  let isAudioPlaying = false;
  let isIntroOpened = false;

  // Set up audio source
  bgAudio.volume = 0.7;

  // =========================================================
  // 1. CELEBRATORY CONFETTI & GOLDEN DUST BURST
  // =========================================================
  function createConfettiBurst(originX, originY) {
    const burstContainer = document.createElement('div');
    burstContainer.style.position = 'fixed';
    burstContainer.style.left = '0';
    burstContainer.style.top = '0';
    burstContainer.style.width = '100vw';
    burstContainer.style.height = '100vh';
    burstContainer.style.pointerEvents = 'none';
    burstContainer.style.zIndex = '99999999';
    document.body.appendChild(burstContainer);

    const colors = ['#dfba73', '#ffd700', '#00e5ff', '#10b981', '#f3a4b5', '#ffffff'];
    const count = 42;

    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = Math.random() * 240 + 90;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed - 60;
      const size = Math.random() * 8 + 4;
      const color = colors[Math.floor(Math.random() * colors.length)];

      p.style.position = 'absolute';
      p.style.left = `${originX}px`;
      p.style.top = `${originY}px`;
      p.style.width = `${size}px`;
      p.style.height = `${size * (Math.random() > 0.5 ? 1.6 : 1)}px`;
      p.style.backgroundColor = color;
      p.style.borderRadius = Math.random() > 0.4 ? '50%' : '2px';
      p.style.boxShadow = `0 0 10px ${color}`;
      p.style.transition = 'transform 1.15s cubic-bezier(0.12, 0.8, 0.32, 1), opacity 1.15s ease-out';
      p.style.transform = 'translate3d(0, 0, 0) rotate(0deg) scale(1)';
      burstContainer.appendChild(p);

      requestAnimationFrame(() => {
        const rot = Math.random() * 720 - 360;
        p.style.transform = `translate3d(${vx}px, ${vy + 130}px, 0) rotate(${rot}deg) scale(0.2)`;
        p.style.opacity = '0';
      });
    }

    setTimeout(() => {
      burstContainer.remove();
    }, 1350);
  }

  // =========================================================
  // 2. PEACOCK MORPANKH INTRO & PALACE INVITATION BRIDGE
  // =========================================================
  function enterPalaceInvitation() {
    if (isIntroOpened) return;
    isIntroOpened = true;

    // Celebratory sparkles
    createConfettiBurst(window.innerWidth / 2, window.innerHeight * 0.48);
    setTimeout(() => {
      createConfettiBurst(window.innerWidth / 2 + 30, window.innerHeight * 0.42);
    }, 180);

    // Play wedding background shehnai audio
    bgAudio.play().then(() => {
      isAudioPlaying = true;
      audioBtn.classList.add('playing');
      updateAudioIcon(true);
    }).catch(err => {
      console.log('Audio autoplay info or user interaction:', err);
    });
  }

  // Listen for custom event from peacock-intro.js
  window.addEventListener('peacockIntroOpen', () => {
    enterPalaceInvitation();
  });

  // 2. AUDIO PLAY / MUTE TOGGLE
  function updateAudioIcon(playing) {
    if (playing) {
      audioBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
        </svg>`;
      audioBtn.setAttribute('aria-label', 'Mute music');
    } else {
      audioBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <line x1="23" y1="9" x2="17" y2="15"></line>
          <line x1="17" y1="9" x2="23" y2="15"></line>
        </svg>`;
      audioBtn.setAttribute('aria-label', 'Play music');
    }
  }

  audioBtn.addEventListener('click', () => {
    if (isAudioPlaying) {
      bgAudio.pause();
      isAudioPlaying = false;
      audioBtn.classList.remove('playing');
      updateAudioIcon(false);
    } else {
      bgAudio.play().then(() => {
        isAudioPlaying = true;
        audioBtn.classList.add('playing');
        updateAudioIcon(true);
      });
    }
  });

  // 3. LANGUAGE SWITCHER
  if (langTrigger && langDropdown) {
    langTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      langDropdown.classList.toggle('open');
    });
  }

  document.addEventListener('click', () => {
    if (langDropdown) {
      langDropdown.classList.remove('open');
    }
  });

  const translations = {
    en: {
      tagline: "Two hearts one journey a lifetime together",
      weds: "weds",
      scrollToBegin: "Scroll to begin",
      switchPalaces: "Swipe to Switch Palaces",
      dateTitle: "Date & Time",
      dateSubtitle: "When we will tie the knot",
      countdownTitle: "The Countdown",
      countdownSubtitle: "Counting down to our big day",
      eventsTitle: "Wedding Events",
      eventsSubtitle: "Join us for the celebrations",
      storyTitle: "Our Story",
      storySubtitle: "How it all began",
      galleryTitle: "Photo Gallery",
      gallerySubtitle: "Capturing our best moments",
      familiesTitle: "Our Families",
      familiesSubtitle: "With the blessings of our parents",
      groomFamily: "GROOM'S FAMILY",
      brideFamily: "BRIDE'S FAMILY",
      rsvpTitle: "RSVP",
      rsvpSubtitle: "Please let us know if you can make it",
      thankYouTitle: "Thank You",
      thankYouSubtitle: "For your love and support"
    },
    hi: {
      tagline: "दो दिल, एक सफर, उम्र भर का साथ",
      weds: "संग",
      scrollToBegin: "शुरू करने के लिए स्क्रॉल करें",
      switchPalaces: "महल बदलने के लिए स्वाइप करें",
      dateTitle: "शुभ लग्न एवं तिथि",
      dateSubtitle: "जब हम एक दूजे के होंगे",
      countdownTitle: "उल्टी गिनती",
      countdownSubtitle: "शुभ विवाह के पावन क्षण",
      eventsTitle: "मांगलिक कार्यक्रम",
      eventsSubtitle: "हमारे उत्सव में पधारें",
      storyTitle: "हमारी कहानी",
      storySubtitle: "प्यार की खूबसूरत शुरुआत",
      galleryTitle: "तस्वीरों की झलक",
      gallerySubtitle: "हमारी प्यारी यादें",
      familiesTitle: "हमारे परिवार",
      familiesSubtitle: "माता-पिता एवं बड़ों के आशीर्वाद से",
      groomFamily: "वर पक्ष",
      brideFamily: "वधू पक्ष",
      rsvpTitle: "निमंत्रण स्वीकार करें",
      rsvpSubtitle: "कृपया अपनी उपस्थिति दर्ज कराएं",
      thankYouTitle: "हार्दिक धन्यवाद",
      thankYouSubtitle: "आपके असीम स्नेह और आशीर्वाद हेतु"
    },
    gu: {
      tagline: "બે હૃદય, એક સફર, જીવનભરનો સાથ",
      weds: "સંગે",
      scrollToBegin: "શરૂ કરવા માટે સ્ક્રોલ કરો",
      switchPalaces: "મહેલ બદલવા માટે સ્વાઇપ કરો",
      dateTitle: "તારીખ અને સમય",
      dateSubtitle: "લગ્ન પ્રસંગ",
      countdownTitle: "કાઉન્ટડાઉન",
      countdownSubtitle: "લગ્નના શુભ દિવસ સુધી",
      eventsTitle: "શુભ પ્રસંગો",
      eventsSubtitle: "અમારા ઉત્સવમાં પધારો",
      storyTitle: "અમારી વાર્તા",
      storySubtitle: "પ્રેમની શરૂઆત",
      galleryTitle: "ફોટો ગેલેરી",
      gallerySubtitle: "શ્રેષ્ઠ પળો",
      familiesTitle: "અમારા પરિવારો",
      familiesSubtitle: "વડીલોના આશીર્વાદ સાથે",
      groomFamily: "વર પક્ષ",
      brideFamily: "કન્યા પક્ષ",
      rsvpTitle: "આરએસવીપી",
      rsvpSubtitle: "કૃપા કરીને તમારી ઉપસ્થિતિ જણાવો",
      thankYouTitle: "આભાર",
      thankYouSubtitle: "તમારા પ્રેમ અને સ્નેહ બદલ"
    },
    pa: {
      tagline: "ਦੋ ਦਿਲ, ਇੱਕ ਸਫ਼ਰ, ਸਦਾ ਲਈ ਸਾਥ",
      weds: "ਸੰਗ",
      scrollToBegin: "ਸ਼ੁਰੂ ਕਰਨ ਲਈ ਸਕ੍ਰੋਲ ਕਰੋ",
      switchPalaces: "ਮਹਿਲ ਬਦਲਣ ਲਈ ਸਵਾਈਪ ਕਰੋ",
      dateTitle: "ਮਿਤੀ ਅਤੇ ਸਮਾਂ",
      dateSubtitle: "ਵਿਆਹ ਦਾ ਸ਼ੁਭ ਦਿਹਾੜਾ",
      countdownTitle: "ਕਾਊਂਟਡਾਊਨ",
      countdownSubtitle: "ਖ਼ਾਸ ਦਿਨ ਤੱਕ ਦਾ ਸਮਾਂ",
      eventsTitle: "ਵਿਆਹ ਦੇ ਸਮਾਗਮ",
      eventsSubtitle: "ਖੁਸ਼ੀਆਂ ਵਿੱਚ ਸ਼ਾਮਲ ਹੋਵੋ",
      storyTitle: "ਸਾਡੀ ਕਹਾਣੀ",
      storySubtitle: "ਪਿਆਰ ਦਾ ਆਗਾਜ਼",
      galleryTitle: "ਫ਼ੋਟੋ ਗੈਲਰੀ",
      gallerySubtitle: "ਸਾਡੇ ਖ਼ਾਸ ਪਲ",
      familiesTitle: "ਸਾਡੇ ਪਰਿਵਾਰ",
      familiesSubtitle: "ਵੱਡਿਆਂ ਦੇ ਆਸ਼ੀਰਵਾਦ ਨਾਲ",
      groomFamily: "ਲਾੜੇ ਦਾ ਪਰਿਵਾਰ",
      brideFamily: "ਲਾੜੀ ਦਾ ਪਰਿਵਾਰ",
      rsvpTitle: "ਆਰ.ਐੱਸ.ਵੀ.ਪੀ.",
      rsvpSubtitle: "ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੀ ਆਮਦ ਦੱਸੋ",
      thankYouTitle: "ਧੰਨਵਾਦ",
      thankYouSubtitle: "ਤੁਹਾਡੇ ਪਿਆਰ ਅਤੇ ਅਸੀਸਾਂ ਲਈ"
    }
  };

  langOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      langOptions.forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      const lang = opt.dataset.lang;
      langCurrent.textContent = opt.dataset.name;
      langDropdown.classList.remove('open');
      applyLanguage(lang);
    });
  });

  function applyLanguage(lang) {
    const t = translations[lang] || translations.en;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (t[key]) el.textContent = t[key];
    });
  }

  // 4. SIDE PAGINATION SETUP
  cards.forEach((_, idx) => {
    const dot = document.createElement('div');
    dot.className = `page-dot ${idx === 0 ? 'active' : ''}`;
    dot.setAttribute('title', `Slide ${idx + 1}`);
    dot.addEventListener('click', () => goToCard(idx));
    paginationContainer.appendChild(dot);
  });

  const dots = document.querySelectorAll('.page-dot');

  function updatePagination() {
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentCardIndex);
    });
  }

  // =========================================================
  // 5. OFFICIAL MAHAL-SWIPE PALACE & ARCH THEMES (SHAADIKACARD)
  // =========================================================
  const palaceThemes = [
    {
      id: "theme-1",
      bg: "assets/base-1-mobile.webp",
      arch: "assets/media_1787051662761.webp",
      archClass: "mahal-image",
      gradient: "linear-gradient(135deg, rgba(255, 240, 245, 0.35) 0%, rgba(243, 210, 223, 0.35) 100%)"
    },
    {
      id: "theme-2",
      bg: "assets/base-2-mobile.webp",
      arch: "assets/arch-india-gate.webp",
      archClass: "mahal-image-lower",
      gradient: "linear-gradient(135deg, rgba(253, 244, 240, 0.35) 0%, rgba(238, 213, 202, 0.35) 100%)"
    },
    {
      id: "theme-3",
      bg: "assets/base-3-mobile.webp",
      arch: "assets/mahal.webp",
      archClass: "mahal-image-lower",
      gradient: "linear-gradient(135deg, rgba(253, 238, 244, 0.35) 0%, rgba(245, 203, 221, 0.35) 100%)"
    },
    {
      id: "theme-4",
      bg: "assets/base-4-mobile.webp",
      arch: "assets/media_1787051664439.webp",
      archClass: "mahal-image",
      gradient: "linear-gradient(135deg, rgba(252, 251, 248, 0.35) 0%, rgba(228, 226, 222, 0.35) 100%)"
    },
    {
      id: "theme-5",
      bg: "assets/base-5-mobile.webp",
      arch: "assets/media_1787051669265.webp",
      archClass: "mahal-image",
      gradient: "linear-gradient(135deg, rgba(247, 240, 250, 0.35) 0%, rgba(223, 209, 234, 0.35) 100%)"
    },
    {
      id: "theme-6",
      bg: "assets/base-6-mobile.webp",
      arch: "assets/media_1787051677037.webp",
      archClass: "mahal-image",
      gradient: "linear-gradient(135deg, rgba(253, 253, 240, 0.35) 0%, rgba(235, 225, 181, 0.35) 100%)"
    },
    {
      id: "theme-7",
      bg: "assets/base-7-mobile.webp",
      arch: "assets/arch-jodhpur.webp",
      archClass: "mahal-image-lower",
      gradient: "linear-gradient(135deg, rgba(255, 248, 242, 0.35) 0%, rgba(245, 220, 205, 0.35) 100%)"
    }
  ];

  // Preload all 7 palace bases and arches for instantaneous silky switching
  palaceThemes.forEach(t => {
    const bImg = new Image();
    bImg.src = t.bg;
    const aImg = new Image();
    aImg.src = t.arch;
  });

  // Switch Palace Theme (Parallax 3D Sliding Haveli Gate Transition)
  function switchPalace(direction) {
    if (isPalaceTransitioning || !staticBgLayer || !mahalSwipeLayer) return;
    isPalaceTransitioning = true;

    const nextIndex = (currentPalaceIndex + direction + palaceThemes.length) % palaceThemes.length;
    const nextTheme = palaceThemes[nextIndex];

    const currentBgSlide = staticBgLayer.querySelector('.bg-slide.current-bg');
    const currentArchSlide = mahalSwipeLayer.querySelector('.arch-slide.current-arch');

    // Create incoming background slide
    const newBgSlide = document.createElement('div');
    newBgSlide.className = `bg-slide ${direction > 0 ? 'bg-slide-in-right' : 'bg-slide-in-left'}`;
    newBgSlide.innerHTML = `
      <img src="${nextTheme.bg}" class="bg-image-full" alt="Palace Backdrop" />
      <div class="bg-gradient-overlay" style="background: ${nextTheme.gradient};"></div>
    `;

    // Create incoming arch slide
    const newArchSlide = document.createElement('div');
    newArchSlide.className = `arch-slide ${direction > 0 ? 'arch-slide-in-right' : 'arch-slide-in-left'}`;
    newArchSlide.innerHTML = `
      <img src="${nextTheme.arch}" class="${nextTheme.archClass}" alt="Haveli Arch" />
    `;

    // Animate out existing slides
    if (currentBgSlide) {
      currentBgSlide.classList.remove('current-bg');
      currentBgSlide.classList.add(direction > 0 ? 'bg-slide-out-left' : 'bg-slide-out-right');
    }
    if (currentArchSlide) {
      currentArchSlide.classList.remove('current-arch');
      currentArchSlide.classList.add(direction > 0 ? 'arch-slide-out-left' : 'arch-slide-out-right');
    }

    staticBgLayer.appendChild(newBgSlide);
    mahalSwipeLayer.appendChild(newArchSlide);

    currentPalaceIndex = nextIndex;

    // Optional haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(25);
    }

    setTimeout(() => {
      newBgSlide.className = 'bg-slide current-bg';
      newArchSlide.className = 'arch-slide current-arch';
      if (currentBgSlide && currentBgSlide.parentNode) currentBgSlide.parentNode.removeChild(currentBgSlide);
      if (currentArchSlide && currentArchSlide.parentNode) currentArchSlide.parentNode.removeChild(currentArchSlide);
      isPalaceTransitioning = false;
    }, 720);
  }

  // Update Navigation Controls (Swipe Hints)
  function updateNavControls() {
    if (swipeHintBar) {
      if (currentCardIndex === 0) {
        swipeHintBar.classList.remove('hidden');
        swipeHintBar.classList.remove('dimmed');
      } else {
        swipeHintBar.classList.add('dimmed');
      }
    }
  }

  // 6. CARD NAVIGATION (VERTICAL SCROLL & SWIPE)
  function goToCard(targetIndex) {
    if (isTransitioning || targetIndex === currentCardIndex) return;
    if (targetIndex < 0 || targetIndex >= cards.length) return;

    isTransitioning = true;
    const direction = targetIndex > currentCardIndex ? 'down' : 'up';
    const oldCard = cards[currentCardIndex];
    const newCard = cards[targetIndex];

    oldCard.className = `invitation-card ${direction === 'down' ? 'prev' : 'next'}`;
    newCard.className = `invitation-card active`;

    currentCardIndex = targetIndex;
    updatePagination();
    updateNavControls();

    setTimeout(() => {
      isTransitioning = false;
    }, 600);
  }

  // Initial nav control state
  updateNavControls();

  // Navigation Indicators click listeners
  if (navLeft) navLeft.addEventListener('click', () => switchPalace(-1));
  if (navRight) navRight.addEventListener('click', () => switchPalace(1));
  if (swipeHintBar) swipeHintBar.addEventListener('click', () => switchPalace(1));

  // Smooth Laptop Trackpad & Mouse Wheel Navigation (Vertical Card Scroll)
  let accumulatedDeltaY = 0;
  let wheelLock = false;
  let wheelResetTimer = null;

  window.addEventListener('wheel', (e) => {
    if (peacockOverlay && peacockOverlay.style.display !== 'none') return;

    // Check if user is scrolling inside a scrollable card or container (e.g. events list)
    const scrollableEl = e.target.closest('.events-list-scroll, .events-scrollable, .invitation-card');
    if (scrollableEl && scrollableEl.scrollHeight > scrollableEl.clientHeight) {
      const atTop = scrollableEl.scrollTop <= 2 && e.deltaY < 0;
      const atBottom = (scrollableEl.scrollTop + scrollableEl.clientHeight >= scrollableEl.scrollHeight - 2) && e.deltaY > 0;
      if (!atTop && !atBottom) {
        // Allow native inner scrolling
        return;
      }
    }

    if (wheelLock || isTransitioning) return;

    accumulatedDeltaY += e.deltaY;
    clearTimeout(wheelResetTimer);
    wheelResetTimer = setTimeout(() => {
      accumulatedDeltaY = 0;
    }, 180);

    // Require intentional accumulated scroll threshold to prevent accidental jump
    const SCROLL_THRESHOLD = 45;
    if (Math.abs(accumulatedDeltaY) >= SCROLL_THRESHOLD) {
      const direction = accumulatedDeltaY > 0 ? 1 : -1;
      accumulatedDeltaY = 0;
      wheelLock = true;
      goToCard(currentCardIndex + direction);

      // Dampen trackpad inertia momentum (700ms cooldown)
      setTimeout(() => {
        wheelLock = false;
        accumulatedDeltaY = 0;
      }, 700);
    }
  }, { passive: true });

  // Touch Swipe Navigation (Horizontal = Palaces, Vertical = Cards)
  let touchStartY = 0;
  let touchStartX = 0;
  let isMouseDragging = false;

  window.addEventListener('touchstart', (e) => {
    if (e.target.closest('#scratch-canvas, #scratch-hint-pill')) return;
    touchStartY = e.touches[0].clientY;
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  window.addEventListener('touchend', (e) => {
    if (peacockOverlay && peacockOverlay.style.display !== 'none') return;
    const touchEndY = e.changedTouches[0].clientY;
    const touchEndX = e.changedTouches[0].clientX;
    const diffY = touchStartY - touchEndY;
    const diffX = touchStartX - touchEndX;

    // Horizontal swipe: switch palace (Commented out for Single Palace mode)
    /*
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 35) {
      if (diffX > 0) {
        switchPalace(1); // Swipe left -> Next Palace
      } else {
        switchPalace(-1); // Swipe right -> Previous Palace
      }
    }
    else
    */
    // Vertical swipe: switch invitation card!
    if (Math.abs(diffY) > 35) {
      // Check if user is scrolling inside a scrollable container
      const scrollableEl = e.target.closest('.events-list-scroll, .story-scroll-container');
      if (scrollableEl && scrollableEl.scrollHeight > scrollableEl.clientHeight) {
        const atTop = scrollableEl.scrollTop <= 4 && diffY < 0;
        const atBottom = (scrollableEl.scrollTop + scrollableEl.clientHeight >= scrollableEl.scrollHeight - 4) && diffY > 0;
        if (!atTop && !atBottom) {
          // Allow inner scrolling, don't flip card!
          return;
        }
      }

      if (diffY > 0) {
        goToCard(currentCardIndex + 1);
      } else {
        goToCard(currentCardIndex - 1);
      }
    }
  }, { passive: true });

  // Mouse Drag Support for Desktop (Vertical cards)
  window.addEventListener('mousedown', (e) => {
    if (peacockOverlay && peacockOverlay.style.display !== 'none') return;
    if (e.target.closest('button') || e.target.closest('a') || e.target.closest('input') || 
        e.target.closest('select') || e.target.closest('textarea') || e.target.closest('.lang-dropdown') || 
        e.target.closest('.nav-indicator') || e.target.closest('.page-dot') || e.target.closest('#scratch-canvas') || e.target.closest('#scratch-hint-pill')) return;
    
    touchStartX = e.clientX;
    touchStartY = e.clientY;
    isMouseDragging = true;
  });

  window.addEventListener('mouseup', (e) => {
    if (!isMouseDragging) return;
    isMouseDragging = false;
    const diffX = touchStartX - e.clientX;
    const diffY = touchStartY - e.clientY;

    /* Single Palace mode: horizontal drag commented out
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
      if (diffX > 0) switchPalace(1);
      else switchPalace(-1);
    } else
    */
    if (Math.abs(diffY) > 40) {
      const scrollableEl = e.target.closest('.events-list-scroll, .story-scroll-container');
      if (scrollableEl && scrollableEl.scrollHeight > scrollableEl.clientHeight) {
        const atTop = scrollableEl.scrollTop <= 4 && diffY < 0;
        const atBottom = (scrollableEl.scrollTop + scrollableEl.clientHeight >= scrollableEl.scrollHeight - 4) && diffY > 0;
        if (!atTop && !atBottom) {
          return;
        }
      }
      if (diffY > 0) goToCard(currentCardIndex + 1);
      else goToCard(currentCardIndex - 1);
    }
  });

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    if (peacockOverlay && peacockOverlay.style.display !== 'none') return;
    /* Single Palace mode: Left/Right arrow keys commented out
    if (e.key === 'ArrowRight') {
      switchPalace(1);
    } else if (e.key === 'ArrowLeft') {
      switchPalace(-1);
    } else
    */
    if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
      goToCard(currentCardIndex + 1);
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      goToCard(currentCardIndex - 1);
    }
  });

  // Prompt buttons
  document.querySelectorAll('.scroll-prompt-btn, .scroll-next-btn').forEach(btn => {
    btn.addEventListener('click', () => goToCard(currentCardIndex + 1));
  });

  document.querySelectorAll('.scroll-top-btn').forEach(btn => {
    btn.addEventListener('click', () => goToCard(0));
  });

  // 6. LIVE COUNTDOWN TIMER (29th January 2027)
  const targetDate = new Date('2027-01-29T16:30:00+05:30').getTime();

  function updateCountdown() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance <= 0) {
      document.getElementById('days-count').textContent = '00';
      document.getElementById('hours-count').textContent = '00';
      document.getElementById('minutes-count').textContent = '00';
      document.getElementById('seconds-count').textContent = '00';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    const pad = (n) => String(n).padStart(2, '0');

    const daysEl = document.getElementById('days-count');
    const hoursEl = document.getElementById('hours-count');
    const minsEl = document.getElementById('minutes-count');
    const secsEl = document.getElementById('seconds-count');

    if (daysEl) daysEl.textContent = pad(days);
    if (hoursEl) hoursEl.textContent = pad(hours);
    if (minsEl) minsEl.textContent = pad(minutes);
    if (secsEl) secsEl.textContent = pad(seconds);
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  // =========================================================
  // 7. COUNTDOWN SCRATCH & REVEAL (ROYAL METALLIC FOIL)
  // =========================================================
  const scratchArea = document.getElementById('countdown-scratch-area');
  const scratchCanvas = document.getElementById('scratch-canvas');

  if (scratchCanvas && scratchArea) {
    const sCtx = scratchCanvas.getContext('2d', { willReadFrequently: true });
    let isScratching = false;
    let isRevealed = false;
    let scratchPointsCount = 0;

    function initScratchFoil() {
      if (isRevealed) return;
      const grid = document.getElementById('countdown-grid');
      const rect = grid ? grid.getBoundingClientRect() : scratchArea.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      
      const width = rect.width || scratchArea.offsetWidth || 280;
      const height = rect.height || scratchArea.offsetHeight || 66;

      scratchCanvas.width = width * dpr;
      scratchCanvas.height = height * dpr;
      scratchCanvas.style.width = `${width}px`;
      scratchCanvas.style.height = `${height}px`;

      sCtx.setTransform(1, 0, 0, 1, 0, 0);
      sCtx.scale(dpr, dpr);

      // 1. Draw rich royal gold & rose metallic gradient
      const grad = sCtx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#f5deb3');
      grad.addColorStop(0.25, '#d4af37');
      grad.addColorStop(0.5, '#faebd7');
      grad.addColorStop(0.75, '#c59b27');
      grad.addColorStop(1, '#eec082');

      sCtx.fillStyle = grad;
      sCtx.beginPath();
      if (sCtx.roundRect) {
        sCtx.roundRect(0, 0, width, height, 8);
      } else {
        sCtx.rect(0, 0, width, height);
      }
      sCtx.fill();

      // 2. Add soft golden glitter stippling
      sCtx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      for (let i = 0; i < 70; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const r = Math.random() * 1.5 + 0.5;
        sCtx.beginPath();
        sCtx.arc(x, y, r, 0, Math.PI * 2);
        sCtx.fill();
      }

      // 3. Delicate gold border
      sCtx.strokeStyle = 'rgba(197, 155, 39, 0.85)';
      sCtx.lineWidth = 1.5;
      sCtx.beginPath();
      if (sCtx.roundRect) {
        sCtx.roundRect(2, 2, width - 4, height - 4, 7);
      } else {
        sCtx.rect(2, 2, width - 4, height - 4);
      }
      sCtx.stroke();

      // 4. Elegant text directly on the canvas foil
      sCtx.fillStyle = '#6b2031';
      sCtx.font = 'bold 12px "Cinzel", "Cormorant Garamond", serif';
      sCtx.textAlign = 'center';
      sCtx.textBaseline = 'middle';
      sCtx.fillText('✦  SCRATCH TO REVEAL  ✦', width / 2, height / 2);
    }

    setTimeout(initScratchFoil, 100);
    setTimeout(initScratchFoil, 350);
    window.addEventListener('resize', () => {
      if (!isRevealed) initScratchFoil();
    });

    function scratch(e) {
      if (!isScratching || isRevealed) return;
      const rect = scratchCanvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      // Soft feathered brush
      sCtx.globalCompositeOperation = 'destination-out';
      const brushRadius = 26;
      const radialGrad = sCtx.createRadialGradient(x, y, 0, x, y, brushRadius);
      radialGrad.addColorStop(0, 'rgba(0, 0, 0, 1)');
      radialGrad.addColorStop(0.75, 'rgba(0, 0, 0, 0.85)');
      radialGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      sCtx.fillStyle = radialGrad;
      sCtx.beginPath();
      sCtx.arc(x, y, brushRadius, 0, Math.PI * 2);
      sCtx.fill();

      scratchPointsCount++;
      if (scratchPointsCount % 8 === 0) {
        checkScratchPercentage();
      }
    }

    function checkScratchPercentage() {
      if (isRevealed) return;
      const w = scratchCanvas.width;
      const h = scratchCanvas.height;
      if (w === 0 || h === 0) return;

      try {
        const imgData = sCtx.getImageData(0, 0, w, h);
        const data = imgData.data;
        let transparentPixels = 0;
        const totalSampled = data.length / 16;

        for (let i = 3; i < data.length; i += 16) {
          if (data[i] < 30) transparentPixels++;
        }

        const percentage = (transparentPixels / totalSampled) * 100;
        if (percentage > 25) {
          revealCountdown();
        }
      } catch (err) {
        if (scratchPointsCount > 25) {
          revealCountdown();
        }
      }
    }

    function revealCountdown() {
      if (isRevealed) return;
      isRevealed = true;
      scratchArea.classList.add('revealed');

      const rect = scratchArea.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      createConfettiBurst(centerX, centerY);

      setTimeout(() => {
        scratchCanvas.style.display = 'none';
      }, 600);
    }

    // Touch & Mouse Listeners
    scratchCanvas.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      isScratching = true;
      scratch(e);
    });

    window.addEventListener('mousemove', (e) => {
      if (isScratching) {
        scratch(e);
      }
    });

    window.addEventListener('mouseup', () => {
      if (isScratching) {
        isScratching = false;
        checkScratchPercentage();
      }
    });

    scratchCanvas.addEventListener('touchstart', (e) => {
      e.stopPropagation();
      isScratching = true;
      scratch(e);
    }, { passive: false });

    scratchCanvas.addEventListener('touchmove', (e) => {
      if (isScratching) {
        e.preventDefault();
        e.stopPropagation();
        scratch(e);
      }
    }, { passive: false });

    scratchCanvas.addEventListener('touchend', (e) => {
      e.stopPropagation();
      isScratching = false;
      checkScratchPercentage();
    });

    // Tap to reveal
    scratchCanvas.addEventListener('click', (e) => {
      e.stopPropagation();
      if (scratchPointsCount > 3) {
        revealCountdown();
      }
    });

    scratchCanvas.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      revealCountdown();
    });
  }

  // =========================================================
  // 8. RSVP SUBMIT LOGIC (DIRECT TO WHATSAPP 6289848189)
  // =========================================================
  const rsvpForm = document.getElementById('wedding-rsvp-form');
  const rsvpSuccess = document.getElementById('rsvp-success-msg');

  if (rsvpForm) {
    rsvpForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const guestName = document.getElementById('guest-name')?.value || '';
      const guestCount = document.getElementById('guest-count')?.value || '1';
      const attendance = document.querySelector('input[name="attendance"]:checked')?.value || 'attending';
      const guestMsg = document.getElementById('guest-msg')?.value || '';

      const attendanceText = attendance === 'attending' ? 'Joyfully Attending 🎉' : 'Regretfully Declines 🙏';
      let text = `*Wedding RSVP for Unnati & Nisarg*\n` +
                 `👤 *Name:* ${guestName}\n` +
                 `👥 *Guests:* ${guestCount}\n` +
                 `✨ *Status:* ${attendanceText}\n`;
      if (guestMsg.trim()) {
        text += `💌 *Message:* ${guestMsg}\n`;
      }

      createConfettiBurst(window.innerWidth / 2, window.innerHeight / 2);
      rsvpForm.style.display = 'none';
      if (rsvpSuccess) rsvpSuccess.style.display = 'block';

      // Redirect directly to WhatsApp with pre-filled details
      const waUrl = `https://wa.me/916289848189?text=${encodeURIComponent(text)}`;
      setTimeout(() => {
        window.open(waUrl, '_blank');
      }, 600);
    });
  }

  // 9. FALLING ROSE PETALS & PARTICLES CANVAS
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  class Petal {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : -30;
      this.size = Math.random() * 12 + 10;
      this.speedY = Math.random() * 1.2 + 0.8;
      this.speedX = Math.random() * 1.5 - 0.75;
      this.rotation = Math.random() * 360;
      this.rotationSpeed = (Math.random() - 0.5) * 2;
      this.oscillation = Math.random() * 0.04 + 0.01;
      this.oscillationStep = Math.random() * Math.PI * 2;
      this.opacity = Math.random() * 0.5 + 0.45;
      this.color = Math.random() > 0.3 ? '#f3a6b8' : '#e67389';
    }

    update() {
      this.y += this.speedY;
      this.oscillationStep += this.oscillation;
      this.x += Math.sin(this.oscillationStep) * 1.2 + this.speedX;
      this.rotation += this.rotationSpeed;

      if (this.y > height + 30 || this.x < -30 || this.x > width + 30) {
        this.reset();
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.globalAlpha = this.opacity;

      // Realistic rose petal path
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.moveTo(0, -this.size / 2);
      ctx.bezierCurveTo(this.size / 2, -this.size / 2, this.size / 1.5, this.size / 2, 0, this.size);
      ctx.bezierCurveTo(-this.size / 1.5, this.size / 2, -this.size / 2, -this.size / 2, 0, -this.size / 2);
      ctx.fill();

      // Delicate petal highlight
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore();
    }
  }

  class GoldParticle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : -10;
      this.size = Math.random() * 3 + 1;
      this.speedY = Math.random() * 0.8 + 0.4;
      this.speedX = Math.random() * 0.8 - 0.4;
      this.opacity = Math.random() * 0.6 + 0.2;
    }

    update() {
      this.y += this.speedY;
      this.x += this.speedX;
      if (this.y > height + 10) this.reset();
    }

    draw() {
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(223, 186, 115, ${this.opacity})`;
      ctx.shadowColor = '#dfba73';
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.restore();
    }
  }

  const petals = Array.from({ length: 30 }, () => new Petal());
  const sparkles = Array.from({ length: 25 }, () => new GoldParticle());

  function animateCanvas() {
    ctx.clearRect(0, 0, width, height);
    sparkles.forEach(s => { s.update(); s.draw(); });
    petals.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animateCanvas);
  }

  animateCanvas();

  // 10. CONFETTI BURST EFFECT
  function createConfettiBurst(originX, originY) {
    const burstParticles = [];
    const colors = ['#dfba73', '#ffd700', '#00e5ff', '#10b981', '#0f766e', '#f3a6b8', '#fff4d6', '#7b2d3e'];

    for (let i = 0; i < 60; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 3;
      burstParticles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1,
        decay: Math.random() * 0.02 + 0.015,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 10
      });
    }

    function renderBurst() {
      if (burstParticles.length === 0) return;

      burstParticles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.2; // gravity
        p.life -= p.decay;
        p.rotation += p.rotSpeed;

        if (p.life > 0) {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = p.life;
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.5);
          ctx.restore();
        } else {
          burstParticles.splice(idx, 1);
        }
      });

      if (burstParticles.length > 0) {
        requestAnimationFrame(renderBurst);
      }
    }

    renderBurst();
  }
});
