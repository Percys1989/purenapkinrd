(function () {
  const root = document.documentElement;
  const btn = document.getElementById("theme-toggle");
  if (!btn) return;

  const saved = localStorage.getItem("pn-theme");
  if (saved) root.setAttribute("data-theme", saved);

  btn.addEventListener("click", () => {
    const isEco = root.getAttribute("data-theme") === "eco";
    const next = isEco ? "" : "eco";
    if (next) root.setAttribute("data-theme", next);
    else root.removeAttribute("data-theme");
    localStorage.setItem("pn-theme", next);
  });
})();
