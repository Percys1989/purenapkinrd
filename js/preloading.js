(function () {
  const preloader = document.getElementById("preloader");
  if (!preloader) return;

  const MIN_VISIBLE_MS = 2500; // transición breve sin crear una espera artificial
  const start = Date.now();

  function hidePreloader() {
    const elapsed = Date.now() - start;
    const remaining = Math.max(MIN_VISIBLE_MS - elapsed, 0);
    setTimeout(() => preloader.classList.add("is-hidden"), remaining);
  }

  window.addEventListener("load", hidePreloader);
  setTimeout(hidePreloader, 4000); // por si tarda demasiado
})();
