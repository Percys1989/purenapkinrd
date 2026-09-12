/**
 * i18n.js - PureNapkin
 * Controlador de cambio de idioma ES / EN / FR
 */

const SUPPORTED_LANGS = ["es", "en", "fr"];

function setLanguage(lang) {
  const targetLang = SUPPORTED_LANGS.includes(lang) ? lang : "es";

  // 1. Textos e innerHTML (con respaldo a español si falta la traducción)
  document.querySelectorAll("[data-es]").forEach((el) => {
    const text =
      el.getAttribute(`data-${targetLang}`) ?? el.getAttribute("data-es");
    if (text !== null) {
      el.innerHTML = text;
    }
  });

  // 2. Placeholders de inputs y textareas
  document.querySelectorAll("[data-placeholder-es]").forEach((el) => {
    const ph =
      el.getAttribute(`data-placeholder-${targetLang}`) ??
      el.getAttribute("data-placeholder-es");
    if (ph !== null) {
      el.setAttribute("placeholder", ph);
    }
  });

  // 3. Accesibilidad (aria-labels dinámicos)
  document.querySelectorAll("[data-aria-es]").forEach((el) => {
    const label =
      el.getAttribute(`data-aria-${targetLang}`) ??
      el.getAttribute("data-aria-es");
    if (label !== null) {
      el.setAttribute("aria-label", label);
    }
  });

  // 4. Actualizar estado visual de los botones
  const buttons = {
    es: document.getElementById("btn-es"),
    en: document.getElementById("btn-en"),
    fr: document.getElementById("btn-fr"),
  };
  Object.entries(buttons).forEach(([lang, btn]) => {
    if (btn) btn.classList.toggle("active", targetLang === lang);
  });

  // 5. Actualizar atributo lang del documento y guardar preferencia
  document.documentElement.lang = targetLang;
  localStorage.setItem("purenapkin_lang", targetLang);
}

// Inicialización automática al cargar el DOM
document.addEventListener("DOMContentLoaded", () => {
  const btnEs = document.getElementById("btn-es");
  const btnEn = document.getElementById("btn-en");
  const btnFr = document.getElementById("btn-fr");

  if (btnEs) btnEs.addEventListener("click", () => setLanguage("es"));
  if (btnEn) btnEn.addEventListener("click", () => setLanguage("en"));
  if (btnFr) btnFr.addEventListener("click", () => setLanguage("fr"));

  // Cargar idioma guardado o por defecto 'es'
  const savedLang = localStorage.getItem("purenapkin_lang") || "es";
  if (savedLang !== "es") {
    setLanguage(savedLang);
  }
});
