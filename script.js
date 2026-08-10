/* ============================================================
   TuttiFrutti — script.js
   Principios de diseño:
   1) Nada depende de este archivo para ser visible o usable.
   2) Las mejoras (animaciones) son 100% progresivas: si algo
      falla (por ejemplo el CDN de la librería de animación),
      el sitio se ve y funciona igual, solo sin los adornos.
   ============================================================ */

// ---------- 1) Menú móvil (sin dependencias) ----------
const menuButton = document.querySelector(".menu-button");
const navLinks = document.querySelector(".nav-links");
if (menuButton && navLinks) {
  menuButton.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });
  navLinks.querySelectorAll("a").forEach((link) =>
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
    })
  );
}

// ---------- 2) Año del footer (siempre correcto) ----------
document.querySelectorAll("#year").forEach((el) => {
  el.textContent = new Date().getFullYear();
});

// ---------- 3) Reveal-on-scroll a prueba de fallos ----------
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const revealTargets = document.querySelectorAll(".anim-in");

if (!reduceMotion && revealTargets.length) {
  if ("IntersectionObserver" in window) {
    document.documentElement.classList.add("js-ready");

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -40px 0px" }
    );
    revealTargets.forEach((el) => io.observe(el));

    // Red de seguridad: si por lo que fuera algún elemento nunca
    // se marca como visible, se fuerza igual. Nunca queda oculto.
    window.setTimeout(() => {
      revealTargets.forEach((el) => el.classList.add("in-view"));
    }, 2200);
  }
  // Si el navegador no soporta IntersectionObserver, "js-ready" nunca
  // se agrega y la regla CSS por defecto deja todo visible.
}

// ---------- 4) Adornos opcionales con Motion (motion.dev) ----------
// Todo dentro de un try/catch: si el CDN falla, no rompe nada más.
(async () => {
  if (reduceMotion) return;
  try {
    const { animate, stagger } = await import(
      "https://cdn.jsdelivr.net/npm/motion@13.0.0/+esm"
    );

    const enter = { duration: 0.7, ease: [0.22, 1, 0.36, 1] };

    animate(".site-header", { opacity: [0, 1], y: [-18, 0] }, { ...enter, duration: 0.55 });

    if (document.querySelector(".hero")) {
      animate(
        ".hero-copy > *",
        { opacity: [0, 1], y: [24, 0] },
        { ...enter, delay: stagger(0.1, { startDelay: 0.12 }) }
      );
      animate(
        ".hero-art img",
        { opacity: [0, 1], scale: [0.85, 1], rotate: [-4, 0] },
        { ...enter, duration: 0.8, delay: stagger(0.11, { startDelay: 0.25 }) }
      );
      animate(
        ".hero-art .deco",
        { opacity: [0, 1], scale: [0.6, 1] },
        { ...enter, duration: 0.7, delay: stagger(0.09, { startDelay: 0.5 }) }
      );
      animate(
        ".google-play",
        { scale: [1, 1.025, 1] },
        { duration: 2.6, ease: "easeInOut", repeat: Infinity, delay: 1.4 }
      );

      // Ciclo suave de "brillo" entre las fichas de letra A / B / C,
      // para que el hero se sienta vivo y evocar el sorteo de letra del juego.
      const letters = document.querySelectorAll(".hero-letter");
      if (letters.length) {
        let i = 0;
        setInterval(() => {
          letters.forEach((el, idx) => {
            animate(
              el,
              { scale: idx === i ? [1, 1.08, 1] : 1 },
              { duration: 0.9, ease: "easeInOut" }
            );
          });
          i = (i + 1) % letters.length;
        }, 1900);
      }

      // Paralaje sutil del arte del hero según el mouse (solo con puntero fino)
      const heroArt = document.querySelector(".hero-art");
      if (heroArt && window.matchMedia("(pointer: fine)").matches) {
        heroArt.addEventListener("pointermove", (e) => {
          const rect = heroArt.getBoundingClientRect();
          const px = (e.clientX - rect.left) / rect.width - 0.5;
          const py = (e.clientY - rect.top) / rect.height - 0.5;
          animate(
            heroArt,
            { transform: `rotate(${px * 1.4}deg) translate(${px * 6}px, ${py * 6}px)` },
            { duration: 0.4, ease: "easeOut" }
          );
        });
        heroArt.addEventListener("pointerleave", () => {
          animate(heroArt, { transform: "rotate(0deg) translate(0,0)" }, { duration: 0.5 });
        });
      }
    }

    // Resorte al pasar el mouse / tocar tarjetas y botones
    document.querySelectorAll(".cta, .google-play, .note").forEach((element) => {
      element.addEventListener("pointerenter", () =>
        animate(element, { y: -4, scale: 1.015 }, { type: "spring", stiffness: 420, damping: 22 })
      );
      element.addEventListener("pointerleave", () =>
        animate(element, { y: 0, scale: 1 }, { type: "spring", stiffness: 420, damping: 26 })
      );
    });
  } catch (err) {
    // El CDN de Motion no estaba disponible: el sitio sigue 100% funcional,
    // simplemente sin estas animaciones extra.
    console.warn("TuttiFrutti: animaciones opcionales no disponibles.", err);
  }
})();
