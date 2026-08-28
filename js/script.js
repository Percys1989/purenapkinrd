// ────────────────────────────────────────────────────────────
// CONFIGURACIÓN — reemplazar antes de publicar
// ────────────────────────────────────────────────────────────
// Número de WhatsApp corporativo: código de país + número, sin '+' ni espacios.
const WHATSAPP_NUMBER = "18095550123"; // ⚠️ Reemplazar con el número real antes de publicar

// Ruta al mailer PHP (relativa a index.html). Cambiar solo si se mueve el archivo.
const MAILER_ENDPOINT = "php/mailer.php";
// ────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  setupWhatsAppLinks();
  setupOrderForm();
  setupMobileNav();
});


function setupMobileNav() {
  const toggle = document.getElementById("nav-toggle");
  const menu = document.getElementById("primary-navigation");
  if (!toggle || !menu) return;

  const closeMenu = () => {
    toggle.classList.remove("is-open");
    menu.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Abrir menú");
  };

  toggle.addEventListener("click", () => {
    const isOpen = toggle.classList.toggle("is-open");
    menu.classList.toggle("is-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
  });

  menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
}

function setupWhatsAppLinks() {
  const baseMsg =
    "Hola Pure Napkin, quisiera más información sobre pedidos al por mayor.";
  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(baseMsg)}`;

  ["hero-wa", "wa-float", "nav-wa"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.href = waLink;
  });
}

function setupOrderForm() {
  const form = document.getElementById("order-form");
  if (!form) return;

  const noteEl = document.getElementById("form-note");
  const submitBtn = document.getElementById("submit-btn");
  const defaultNote = noteEl.textContent;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Honeypot anti-spam: si este campo oculto tiene valor, es un bot.
    if (form.website.value.trim() !== "") {
      return;
    }

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const payload = {
      empresa: form.empresa.value.trim(),
      contacto: form.contacto.value.trim(),
      email: form.email.value.trim(),
      telefono: form.telefono.value.trim(),
      cantidad: form.cantidad.value,
      mensaje: form.mensaje.value.trim(),
    };

    setSubmitting(true);
    showNote(defaultNote, null);

    try {
      const res = await fetch(MAILER_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        showNote(
          "¡Gracias! Recibimos su solicitud y le responderemos muy pronto.",
          "success",
        );
        form.reset();
      } else {
        showNote(
          data.message ||
            "No se pudo enviar el formulario. Intente de nuevo o escríbanos por WhatsApp.",
          "error",
        );
      }
    } catch (err) {
      showNote(
        "Hubo un problema de conexión. Intente de nuevo o escríbanos directo por WhatsApp.",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  });

  function setSubmitting(isSubmitting) {
    submitBtn.disabled = isSubmitting;
    submitBtn.textContent = isSubmitting ? "Enviando..." : "Enviar solicitud";
  }

  function showNote(text, type) {
    noteEl.textContent = text;
    noteEl.classList.remove("success", "error");
    if (type) noteEl.classList.add(type);
  }
}

/* --- Slider del hero (autoplay accesible) --- */
(function () {
  const slides = document.querySelectorAll(".hero-slide");
  if (slides.length < 2) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reduceMotion.matches) return;

  let current = 0;
  let timer;

  const advance = () => {
    slides[current].classList.remove("active");
    current = (current + 1) % slides.length;
    slides[current].classList.add("active");
  };

  const start = () => {
    if (document.hidden || reduceMotion.matches) return;
    clearInterval(timer);
    timer = setInterval(advance, 5000);
  };

  const stop = () => clearInterval(timer);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else start();
  });

  reduceMotion.addEventListener?.("change", (event) => {
    if (event.matches) stop();
    else start();
  });

  start();
})();
