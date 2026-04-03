gsap.registerPlugin(ScrollTrigger);

/* ── Curseur animé dans l'indicateur ── */
gsap.to("#tl-cursor", {
  left: "140%",
  duration: 1.8,
  ease: "none",
  repeat: -1,
});

/* ── Pulse sur le point "en cours" ── */
gsap.to(".tl-dot-now", {
  boxShadow: "0 0 0 8px rgba(211,12,123,0.08), 0 0 28px rgba(211,12,123,0.7)",
  repeat: -1,
  yoyo: true,
  duration: 1.4,
  ease: "sine.inOut",
});

/* ── Pulse sur le badge "En cours" ── */
gsap.to(".tl-now-dot", {
  opacity: 0,
  repeat: -1,
  yoyo: true,
  duration: 0.8,
  ease: "sine.inOut",
});

/* ── Apparition des cartes au scroll ── */
gsap.from(".tl-node", {
  scrollTrigger: {
    trigger: "#tl-section",
    start: "top 70%",
    toggleActions: "play none none none",
  },
  opacity: 0,
  y: 32,
  duration: 0.8,
  stagger: 0.18,
  ease: "power3.out",
});

/* ── Hover : underline reveal + lift ── */
document.querySelectorAll(".tl-node").forEach((node) => {
  const card = node.querySelector(".tl-card");
  const accent = node.querySelector(".tl-accent");
  const dot = node.querySelector(".tl-dot:not(.tl-dot-now)");

  if (!card) return;

  node.addEventListener("mouseenter", () => {
    if (dot) gsap.to(dot, { scale: 1.7, duration: 0.25, ease: "back.out(2)" });
    if (accent) gsap.to(accent, { scaleX: 1, duration: 0.35, ease: "power2.out" });
    gsap.to(card, { y: -8, duration: 0.4, ease: "power2.out" });
  });

  node.addEventListener("mouseleave", () => {
    if (dot) gsap.to(dot, { scale: 1, duration: 0.2 });
    if (accent) gsap.to(accent, { scaleX: 0, duration: 0.25 });
    gsap.to(card, { y: 0, duration: 0.35, ease: "power2.inOut" });
  });
});

/* ── Drag-to-scroll ── */
const wrap = document.getElementById("tl-wrap");
const progress = document.getElementById("tl-progress");

let isDown = false, startX, scrollLeft;

wrap.addEventListener("mousedown", (e) => {
  isDown = true;
  wrap.style.cursor = "grabbing";
  startX = e.pageX - wrap.offsetLeft;
  scrollLeft = wrap.scrollLeft;
});
document.addEventListener("mouseup", () => {
  isDown = false;
  wrap.style.cursor = "grab";
});
document.addEventListener("mousemove", (e) => {
  if (!isDown) return;
  e.preventDefault();
  const x = e.pageX - wrap.offsetLeft;
  wrap.scrollLeft = scrollLeft - (x - startX) * 1.1;
});

/* ── Barre de progression ── */
wrap.addEventListener("scroll", () => {
  const max = wrap.scrollWidth - wrap.clientWidth;
  if (max > 0) progress.style.width = (wrap.scrollLeft / max) * 100 + "%";
});

/* ── Touch scroll mobile ── */
let touchStartX = null;
wrap.addEventListener("touchstart", (e) => {
  touchStartX = e.touches[0].clientX;
}, { passive: true });
wrap.addEventListener("touchmove", (e) => {
  if (touchStartX === null) return;
  wrap.scrollLeft += touchStartX - e.touches[0].clientX;
  touchStartX = e.touches[0].clientX;
}, { passive: true });
wrap.addEventListener("touchend", () => { touchStartX = null; });