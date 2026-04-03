gsap.registerPlugin(ScrollTrigger);

// ── Curseur animé dans l'indicateur ──────────────────────
gsap.to("#tl-cursor", { left: "140%", duration: 1.8, ease: "none", repeat: -1 });

// ── Pulse dot "En cours" ─────────────────────────────────
gsap.to(".tl-dot-now", {
  boxShadow: "0 0 0 8px rgba(211,12,123,0.08), 0 0 28px rgba(211,12,123,0.7)",
  repeat: -1, yoyo: true, duration: 1.4, ease: "sine.inOut",
});
gsap.to(".tl-now-dot", { opacity: 0, repeat: -1, yoyo: true, duration: 0.8, ease: "sine.inOut" });

// ══════════════════════════════════════════════════════════
//  SCROLL HORIZONTAL — section épinglée
// ══════════════════════════════════════════════════════════
const track    = document.getElementById("tl-track");
const wrap     = document.getElementById("tl-wrap");
const progress = document.getElementById("tl-progress");

const getEndX = () => -(track.scrollWidth - wrap.clientWidth);

// ── SVG reliant les dots (courbe de Bézier) ───────────────
let axisPathEl = null, axisHaloEl = null, axisPathLen = 0;

function buildAxisSVG() {
  const old = track.querySelector(".tl-axis-svg");
  if (old) old.remove();

  const dots = Array.from(track.querySelectorAll(".tl-dot"));
  if (!dots.length) return;

  const TR = track.getBoundingClientRect();
  if (!TR.width) return;

  const pts = dots.map((dot) => {
    const R = dot.getBoundingClientRect();
    return { x: R.left + R.width / 2 - TR.left, y: R.top + R.height / 2 - TR.top };
  });

  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const cpX = (pts[i - 1].x + pts[i].x) / 2;
    d += ` C ${cpX} ${pts[i - 1].y} ${cpX} ${pts[i].y} ${pts[i].x} ${pts[i].y}`;
  }

  const NS  = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(NS, "svg");
  svg.classList.add("tl-axis-svg");
  svg.style.cssText = `position:absolute;top:0;left:0;width:${track.scrollWidth}px;height:${TR.height}px;overflow:visible;pointer-events:none;z-index:3;`;

  axisHaloEl = document.createElementNS(NS, "path");
  axisHaloEl.setAttribute("d", d);
  axisHaloEl.setAttribute("fill", "none");
  axisHaloEl.setAttribute("stroke", "rgba(211,12,123,0.3)");
  axisHaloEl.setAttribute("stroke-width", "10");
  axisHaloEl.setAttribute("stroke-linecap", "round");

  axisPathEl = document.createElementNS(NS, "path");
  axisPathEl.setAttribute("d", d);
  axisPathEl.setAttribute("fill", "none");
  axisPathEl.setAttribute("stroke", "#d30c7b");
  axisPathEl.setAttribute("stroke-width", "2");
  axisPathEl.setAttribute("stroke-linecap", "round");

  svg.appendChild(axisHaloEl);
  svg.appendChild(axisPathEl);
  track.insertBefore(svg, track.firstChild);

  axisPathLen = axisPathEl.getTotalLength();
  [axisHaloEl, axisPathEl].forEach((p) => {
    p.style.strokeDasharray  = axisPathLen;
    p.style.strokeDashoffset = axisPathLen;
  });
}

// ── Révélation des cartes au scroll ──────────────────────
const animated = new Set();

function revealNodes() {
  document.querySelectorAll(".tl-node").forEach((node) => {
    if (animated.has(node)) return;
    const rect = node.getBoundingClientRect();
    if (rect.left >= window.innerWidth * 0.85) return;

    animated.add(node);
    const isAbove = node.style.flexDirection === "column-reverse";
    const dot     = node.querySelector(".tl-dot");

    gsap.timeline({ defaults: { ease: "power3.out" } })
      .fromTo(node,
        { autoAlpha: 0, y: isAbove ? -64 : 64, scale: 0.85, rotateY: 8 },
        { autoAlpha: 1, y: 0, scale: 1, rotateY: 0, duration: 0.65 })
      .fromTo(dot,
        { scale: 0, transformOrigin: "center center" },
        { scale: 1, duration: 0.5, ease: "back.out(4)" },
        "<0.12");
  });
}

// ── Ordre critique : SVG → masquer nodes → ScrollTrigger ─
requestAnimationFrame(() => {
  buildAxisSVG();
  gsap.set(".tl-node", { autoAlpha: 0 });

  gsap.to(track, {
    x: getEndX,
    ease: "none",
    scrollTrigger: {
      trigger: "#tl-section",
      start: "top top",
      end: () => "+=" + (track.scrollWidth - wrap.clientWidth),
      pin: true,
      scrub: 1.2,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onEnter: revealNodes,
      onUpdate(self) {
        if (axisPathLen) {
          const offset = axisPathLen * (1 - self.progress);
          axisPathEl.style.strokeDashoffset = offset;
          axisHaloEl.style.strokeDashoffset = offset;
        }
        if (progress) progress.style.width = self.progress * 100 + "%";
        revealNodes();
      },
    },
  });

  ScrollTrigger.addEventListener("refresh", buildAxisSVG);
});

// ── Hover : lift + accent underline ──────────────────────
document.querySelectorAll(".tl-node").forEach((node) => {
  const card   = node.querySelector(".tl-card");
  const accent = node.querySelector(".tl-accent");
  const dot    = node.querySelector(".tl-dot:not(.tl-dot-now)");
  if (!card) return;

  node.addEventListener("mouseenter", () => {
    if (dot)    gsap.to(dot,    { scale: 1.7, duration: 0.25, ease: "back.out(2)" });
    if (accent) gsap.set(accent, { clearProps: "transform" });
    if (accent) gsap.to(accent, { scaleX: 1, duration: 0.35, ease: "power2.out" });
    gsap.to(card, { y: -8, duration: 0.4, ease: "power2.out" });
  });
  node.addEventListener("mouseleave", () => {
    if (dot)    gsap.to(dot,    { scale: 1, duration: 0.2 });
    if (accent) gsap.to(accent, { scaleX: 0, duration: 0.25 });
    gsap.to(card, { y: 0, duration: 0.35, ease: "power2.inOut" });
  });
});
