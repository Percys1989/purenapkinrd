(function () {
  const preloader = document.getElementById("preloader");
  if (!preloader) return;

  const video = document.getElementById("preloader-video");
  const flash = document.getElementById("preloader-flash");
  const mark = document.getElementById("preloader-mark");
  const isDesktop = window.matchMedia("(min-width: 769px)").matches;

  const FLASH_AT = 4; // segundo del video en el que ocurre el destello
  const MIN_VISIBLE_MS = isDesktop ? 6200 : 2400;
  const start = Date.now();
  let revealed = false;

  function reveal() {
    if (revealed) return;
    revealed = true;
    if (flash) flash.classList.add("is-active");
    if (mark) mark.classList.add("is-revealed");
  }

  function hidePreloader() {
    const elapsed = Date.now() - start;
    const remaining = Math.max(MIN_VISIBLE_MS - elapsed, 0);
    setTimeout(() => preloader.classList.add("is-hidden"), remaining);
  }

  if (isDesktop && video) {
    video.addEventListener("timeupdate", () => {
      if (video.currentTime >= FLASH_AT) reveal();
    });
    video.play().catch(() => {
      // Autoplay bloqueado: revelamos el nombre igual, sin bloquear al usuario.
      reveal();
    });
  } else {
    setTimeout(reveal, 300);
  }

  window.addEventListener("load", hidePreloader);
  setTimeout(hidePreloader, 8000);
})();