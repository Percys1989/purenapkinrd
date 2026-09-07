/**
 * i18n.js - PureNapkin
 * Controlador de cambio de idioma ES / EN
 */

function setLanguage(lang) {
  const targetLang = lang === "en" ? "en" : "es";

  // 1. Textos e innerHTML
  document.querySelectorAll("[data-es][data-en]").forEach((el) => {
    const text = el.getAttribute(`data-${targetLang}`);
    if (text !== null) {
      el.innerHTML = text;
    }
  });

  // 2. Placeholders de inputs y textareas
  document
    .querySelectorAll("[data-placeholder-es][data-placeholder-en]")
    .forEach((el) => {
      const ph = el.getAttribute(`data-placeholder-${targetLang}`);
      if (ph !== null) {
        el.setAttribute("placeholder", ph);
      }
    });

  // 3. Accesibilidad (aria-labels dinámicos)
  document.querySelectorAll("[data-aria-es][data-aria-en]").forEach((el) => {
    const label = el.getAttribute(`data-aria-${targetLang}`);
    if (label !== null) {
      el.setAttribute("aria-label", label);
    }
  });

  // 4. Actualizar estado visual de los botones
  const btnEs = document.getElementById("btn-es");
  const btnEn = document.getElementById("btn-en");
  if (btnEs && btnEn) {
    btnEs.classList.toggle("active", targetLang === "es");
    btnEn.classList.toggle("active", targetLang === "en");
  }

  // 5. Actualizar atributo lang del documento y guardar preferencia
  document.documentElement.lang = targetLang;
  localStorage.setItem("purenapkin_lang", targetLang);
}

// Inicialización automática al cargar el DOM
document.addEventListener("DOMContentLoaded", () => {
  const btnEs = document.getElementById("btn-es");
  const btnEn = document.getElementById("btn-en");

  if (btnEs) btnEs.addEventListener("click", () => setLanguage("es"));
  if (btnEn) btnEn.addEventListener("click", () => setLanguage("en"));

  // Cargar idioma guardado o por defecto 'es'
  const savedLang = localStorage.getItem("purenapkin_lang") || "es";
  if (savedLang === "en") {
    setLanguage("en");
  }
});
