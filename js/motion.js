/* motion.js — scroll reveals, count-up stats, sticky-header shadow, intro-video modal.
   Progressive enhancement: everything degrades gracefully and respects reduced-motion. */
(function () {
  window.PSE = window.PSE || {};
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const revealSel = ".card, .gallery-item, .testimonial, .section-head, .spec-table, .product-hero, .info-list, .map-embed, .form-grid";

  /* ---- sticky header shadow ---- */
  const header = document.querySelector(".site-header");
  const onScroll = () => header && header.classList.toggle("scrolled", window.scrollY > 10);
  onScroll();
  addEventListener("scroll", onScroll, { passive: true });

  /* ---- scroll reveal ---- */
  const io = (!reduce && "IntersectionObserver" in window)
    ? new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
      }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" })
    : null;

  function scanReveal() {
    const fresh = [...document.querySelectorAll(revealSel)].filter((el) => !el.classList.contains("reveal"));
    fresh.forEach((el) => el.classList.add("reveal"));
    if (!io) { fresh.forEach((el) => el.classList.add("in")); return; }
    fresh.forEach((el) => {
      const sibs = [...el.parentElement.children].filter((c) => c.matches && c.matches(revealSel));
      const i = sibs.indexOf(el);
      if (i > 0) el.style.transitionDelay = Math.min(i * 0.08, 0.5) + "s";
      io.observe(el);
    });
  }
  window.PSE.scanReveal = scanReveal; // products.js calls this after injecting cards

  /* ---- count-up stats ---- */
  function countUp(el) {
    const target = parseFloat(el.getAttribute("data-count"));
    const suffix = el.getAttribute("data-suffix") || "";
    if (reduce || isNaN(target)) { el.textContent = target + suffix; return; }
    const dur = 1400, t0 = performance.now();
    const tick = (now) => {
      const p = Math.min((now - t0) / dur, 1);
      el.textContent = Math.floor(p * target) + suffix;
      if (p < 1) requestAnimationFrame(tick); else el.textContent = target + suffix;
    };
    requestAnimationFrame(tick);
  }
  const stats = [...document.querySelectorAll("[data-count]")];
  if ("IntersectionObserver" in window) {
    const io2 = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { countUp(e.target); io2.unobserve(e.target); } });
    }, { threshold: 0.5 });
    stats.forEach((s) => io2.observe(s));
  } else { stats.forEach(countUp); }

  /* ---- intro-video modal ---- */
  const modal = document.querySelector("[data-video-modal]");
  if (modal) {
    const vid = modal.querySelector("video");
    const open = () => { modal.classList.add("open"); document.body.style.overflow = "hidden"; if (vid) vid.play().catch(() => {}); };
    const close = () => { modal.classList.remove("open"); document.body.style.overflow = ""; if (vid) vid.pause(); };
    document.querySelectorAll("[data-video-open]").forEach((b) =>
      b.addEventListener("click", (e) => { e.preventDefault(); open(); }));
    modal.querySelectorAll("[data-video-close]").forEach((b) => b.addEventListener("click", close));
    modal.addEventListener("click", (e) => { if (e.target === modal) close(); });
    addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
  }

  document.addEventListener("DOMContentLoaded", scanReveal);
  scanReveal();
})();
