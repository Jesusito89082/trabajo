// ============================================================
// Helpers cortos
// ============================================================
const $  = (q, ctx = document) => ctx.querySelector(q);
const $$ = (q, ctx = document) => Array.from(ctx.querySelectorAll(q));

// Tu correo real
const SITE_EMAIL = "matarritamatarritajesus@gmail.com";

// ============================================================
// 1) Tema claro/oscuro con memoria y fallback robusto
// ============================================================
const root = document.documentElement;

// Aplica el tema tanto en <html> como en <body> (a prueba de balas)
const applyTheme = (mode) => {
  root.setAttribute('data-theme', mode);
  document.body?.setAttribute('data-theme', mode);
  // si hay botón(es), mantenemos aria-pressed actualizado
  $$('#themeToggle').forEach(btn => {
    btn.setAttribute('aria-pressed', mode === 'dark' ? 'true' : 'false');
  });
};

const getSavedTheme = () => localStorage.getItem('theme'); // 'dark' | 'light' | null
const setSavedTheme = (mode) => localStorage.setItem('theme', mode);
const userHasSavedTheme = () => !!getSavedTheme();
const systemPrefersDarkMQL = window.matchMedia?.('(prefers-color-scheme: dark)');

// Init temprano para evitar “flash”
(function initThemeEarly() {
  const saved = getSavedTheme();
  if (saved) {
    applyTheme(saved);
  } else {
    const prefersDark = systemPrefersDarkMQL?.matches;
    applyTheme(prefersDark ? 'dark' : 'light');
  }
})();

// Reacciona a cambios del sistema si no hay preferencia guardada
systemPrefersDarkMQL?.addEventListener?.('change', (e) => {
  if (!userHasSavedTheme()) applyTheme(e.matches ? 'dark' : 'light');
});

// Bind del/los botones cuando el DOM está listo
window.addEventListener('DOMContentLoaded', () => {
  const toggles = $$('#themeToggle');
  // Si no existe el botón en esta página, no pasa nada.
  toggles.forEach(btn => {
    btn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      setSavedTheme(next);
    });
  });
});

// Delegación de eventos como plan B (por si el botón se inyecta luego)
document.addEventListener('click', (e) => {
  const t = e.target.closest?.('#themeToggle');
  if (!t) return;
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  setSavedTheme(next);
});

// ============================================================
// 2) Menú móvil (hamburger)
// ============================================================
const nav = $('#nav');
const navToggle = $('#navToggle');

if (nav && navToggle) {
  navToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  // Cerrar al tocar cualquier link del menú
  $$('.nav a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  }));

  // Cerrar al hacer click fuera del menú
  document.addEventListener('click', (e) => {
    if (!nav.classList.contains('open')) return;
    const clickedInsideNav = nav.contains(e.target);
    const clickedToggle    = navToggle.contains(e.target);
    if (!clickedInsideNav && !clickedToggle) {
      nav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });

  // Cerrar con la tecla Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('open')) {
      nav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.focus();
    }
  });
}

// ============================================================
// 3) Scroll suave entre secciones (#ancla)
// ============================================================
const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
$$('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const hash = anchor.getAttribute('href');
    if (!hash || hash.length <= 1) return; // ignora "#"
    const target = $(hash);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    }
  });
});

// ============================================================
// 4) Formulario de contacto (validación + mailto)
// ============================================================
const form = $('#contactForm');
const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(v);

if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nombre  = $('#nombre');
    const email   = $('#email');
    const mensaje = $('#mensaje');

    let ok = true;

    // Limpio errores previos
    $$('.error', form).forEach(el => el.textContent = '');

    // Nombre
    const nombreVal = nombre.value.trim();
    if (nombreVal.length < 2) {
      $('[data-for="nombre"]').textContent = 'Ingresa un nombre válido (mínimo 2 caracteres).';
      ok = false;
    }

    // Email
    const emailVal = email.value.trim();
    if (!isValidEmail(emailVal)) {
      $('[data-for="email"]').textContent = 'Ingresa un correo válido.';
      ok = false;
    }

    // Mensaje
    const mensajeVal = mensaje.value.trim();
    if (mensajeVal.length < 10) {
      $('[data-for="mensaje"]').textContent = 'El mensaje debe tener al menos 10 caracteres.';
      ok = false;
    }

    if (!ok) return;

    // mailto (abre el cliente de correo del usuario)
    const subject = encodeURIComponent(`Contacto: ${nombreVal}`);
    const body = encodeURIComponent(
      `Nombre: ${nombreVal}\nEmail: ${emailVal}\n\nMensaje:\n${mensajeVal}`
    );

    window.location.href = `mailto:${SITE_EMAIL}?subject=${subject}&body=${body}`;

    // Feedback y reset
    form.reset();
    alert('¡Gracias por tu mensaje! Se abrirá tu cliente de correo para enviar.');
  });

  // Quitar el error de cada campo mientras se escribe
  [['nombre','nombre'], ['email','email'], ['mensaje','mensaje']].forEach(([id, key]) => {
    const input = document.getElementById(id);
    input?.addEventListener('input', () => {
      const err = $(`[data-for="${key}"]`);
      if (err?.textContent) err.textContent = '';
    });
  });
}

// ============================================================
// 5) Footer: año actual + “volver arriba”
// ============================================================
$('#year')?.append(new Date().getFullYear());
$('#toTop')?.addEventListener('click', (e) => {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
});
