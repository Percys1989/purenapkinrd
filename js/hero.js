/* --- Hero: slider (autoplay accesible) + parallax de scroll --- */
(function () {
  const hero = document.querySelector(".hero");
  const carousel = document.querySelector(".hero-carousel");
  const slides = document.querySelectorAll(".hero-slide");
  if (!hero || !carousel) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const isDesktop = window.matchMedia("(min-width: 769px)");

  /* ---- Slider ---- */
  let current = 0;
  let timer;

  const advance = () => {
    if (slides.length < 2) return;
    slides[current].classList.remove("active");
    current = (current + 1) % slides.length;
    slides[current].classList.add("active");
  };

  const startSlider = () => {
    if (document.hidden || reduceMotion.matches || slides.length < 2) return;
    clearInterval(timer);
    timer = setInterval(advance, 5000);
  };
  const stopSlider = () => clearInterval(timer);

  document.addEventListener("visibilitychange", () => {
    document.hidden ? stopSlider() : startSlider();
  });
  reduceMotion.addEventListener?.("change", (e) =>
    e.matches ? stopSlider() : startSlider(),
  );
  startSlider();

  /* ---- Parallax ---- */
  if (reduceMotion.matches || !isDesktop.matches) return; // solo desktop, sin reduced-motion

  const SPEED = 0.35; // qué tan lento se mueve el fondo respecto al scroll
  let ticking = false;

  function updateParallax() {
    const rect = hero.getBoundingClientRect();
    // Solo mover mientras el hero está en pantalla (evita cálculo innecesario)
    if (rect.bottom > 0 && rect.top < window.innerHeight) {
      const offset = window.scrollY * SPEED;
      carousel.style.transform = `translateY(${offset}px)`;
    }
    ticking = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    },
    { passive: true },
  );
})();
