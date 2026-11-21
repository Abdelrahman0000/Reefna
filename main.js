// ريفنا — smooth scroll + layered parallax + reveals
(function () {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Back-to-top works with or without Lenis
  const topBtn = document.getElementById('backToTop');

  if (reduced || typeof gsap === 'undefined') {
    document.querySelectorAll('.reveal').forEach((el) => {
      el.style.opacity = 1;
      el.style.transform = 'none';
    });
    if (topBtn) topBtn.addEventListener('click', () => window.scrollTo(0, 0));
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // --- damped inertial smooth scrolling (Lenis driving ScrollTrigger) ---
  let lenis = null;
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  if (topBtn) {
    topBtn.addEventListener('click', () => {
      if (lenis) lenis.scrollTo(0, { duration: 1.6 });
      else window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // --- layered parallax inside every scene (desktop only; phones get plain flow) ---
  const isMobile = window.matchMedia('(max-width: 640px)').matches;
  document.querySelectorAll('.scene').forEach((scene) => {
    if (isMobile) {
      scene.querySelectorAll('.reveal').forEach((el) => {
        el.style.opacity = 1;
        el.style.transform = 'none';
      });
      return;
    }
    scene.querySelectorAll('.layer[data-speed]').forEach((layer) => {
      const speed = parseFloat(layer.dataset.speed || '0.3');
      // slower layers drift with scroll; foreground moves against it
      const shift = (1 - speed) * 22; // percent of scene height
      gsap.fromTo(
        layer,
        { yPercent: -shift },
        {
          yPercent: shift,
          ease: 'none',
          scrollTrigger: {
            trigger: scene,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        }
      );
    });

    // slow ambient drift of the whole scene stack (base + overlays move together)
    const sceneStack = scene.querySelector('.layer-scene');
    if (sceneStack) {
      gsap.to(sceneStack, {
        scale: 1.05,
        duration: 14,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });
    }

    // headings / text fade-slide in on entry
    const reveals = scene.querySelectorAll('.reveal');
    if (reveals.length) {
      gsap.to(reveals, {
        opacity: 1,
        y: 0,
        duration: 1.1,
        ease: 'power3.out',
        stagger: 0.14,
        scrollTrigger: {
          trigger: scene,
          start: 'top 55%',
          toggleActions: 'play none none reverse',
        },
      });
    }
  });
})();
