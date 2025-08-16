// ============================================================
// Utilidades de selección
// ============================================================
// $  -> primer elemento que coincida (querySelector)
// $$ -> array de todos los que coincidan (querySelectorAll)
const $ = (q, ctx = document) => ctx.querySelector(q);
const $$ = (q, ctx = document) => Array.from(ctx.querySelectorAll(q));

// Puedes cambiar aquí tu correo de destino para el formulario:
const SITE_EMAIL = "tuemail@ejemplo.com";

// ============================================================
// 1) Tema claro/oscuro con persistencia en localStorage
//    - Si hay preferencia guardada, la usamos.
//    - Si no, respetamos el modo del sistema (prefers-color-scheme).
//    - Actualizamos aria-pressed del botón para accesibilidad.
// ============================================================
const root = document.documentElement;
const themeToggle = $('#themeToggle');

// Inicialización del tema
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
  root.setAttribute('data-theme', savedTheme);
} else {
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
}

// Sincroniza el estado accesible del botón (si existe)
if (themeToggle) {
  themeToggle.setAttribute('aria-pressed', root.getAttribute('data-theme') === 'dark' ? 'true' : 'false');
  themeToggle.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    themeToggle.setAttribute('aria-pressed', next === 'dark' ? 'true' : 'false');
  });
}

// ============================================================
// 2) Menú móvil (hamburger)
//    - Abre/cierra el menú.
//    - Cierra al navegar, al hacer clic fuera o al presionar Esc.
// ============================================================
const nav = $('#nav');
const navToggle = $('#navToggle');

if (nav && navToggle) {
  navToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  // Cierra al hacer clic en cualquier enlace del menú
  $$('.nav a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  }));

  // Cierra al hacer clic fuera del nav cuando está abierto
  document.addEventListener('click', (e) => {
    if (!nav.classList.contains('open')) return;
    const clickedInsideNav = nav.contains(e.target);
    const clickedToggle = navToggle.contains(e.target);
    if (!clickedInsideNav && !clickedToggle) {
      nav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });

  // Cierra con tecla Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('open')) {
      nav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.focus();
    }
  });
}

// ============================================================
// 3) Scroll suave para anclas internas (#seccion)
//    - Sólo para enlaces que empiezan con "#"
//    - En portfolio.html no interfiere con enlaces a index.html#...
// ============================================================
$$('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const hash = anchor.getAttribute('href');
    if (!hash || hash.length <= 1) return; // ignora "#"
    const target = $(hash);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ============================================================
// 4) Formulario de contacto con validación + mailto
//    - Valida nombre, email, mensaje (mínimos razonables).
//    - Abre el cliente de correo con subject/body prellenados.
//    - Muestra errores bajo cada campo.
// ============================================================
const form = $('#contactForm');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nombre = $('#nombre');
    const email = $('#email');
    const mensaje = $('#mensaje');

    let valid = true;

    // Limpia errores previos
    $$('.error', form).forEach(el => (el.textContent = ''));

    // Nombre
    const nombreVal = nombre.value.trim();
    if (nombreVal.length < 2) {
      $('[data-for="nombre"]').textContent = 'Ingresa un nombre válido (mínimo 2 caracteres).';
      valid = false;
    }

    // Email (validación simple)
    const emailVal = email.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    if (!emailRegex.test(emailVal)) {
      $('[data-for="email"]').textContent = 'Ingresa un correo válido.';
      valid = false;
    }

    // Mensaje
    const mensajeVal = mensaje.value.trim();
    if (mensajeVal.length < 10) {
      $('[data-for="mensaje"]').textContent = 'El mensaje debe tener al menos 10 caracteres.';
      valid = false;
    }

    if (!valid) return;

    // mailto (abre cliente de correo)
    const subject = encodeURIComponent(`Contacto: ${nombreVal}`);
    const body = encodeURIComponent(
      `Nombre: ${nombreVal}\nEmail: ${emailVal}\n\nMensaje:\n${mensajeVal}`
    );

    // IMPORTANTE: Cambia SITE_EMAIL arriba
    window.location.href = `mailto:${SITE_EMAIL}?subject=${subject}&body=${body}`;

    // Feedback visual y reseteo
    form.reset();
    alert('Gracias por tu mensaje. Se abrirá tu cliente de correo para enviar.');
  });

  // Validación "en vivo": al escribir, borra el error del campo
  [['nombre','nombre'], ['email','email'], ['mensaje','mensaje']].forEach(([id, key]) => {
    const input = document.getElementById(id);
    input?.addEventListener('input', () => {
      const err = $(`[data-for="${key}"]`);
      if (err?.textContent) err.textContent = '';
    });
  });
}

// ============================================================
// 5) Footer: año actual + botón "volver arriba"
// ============================================================
$('#year')?.append(new Date().getFullYear());

$('#toTop')?.addEventListener('click', (e) => {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
