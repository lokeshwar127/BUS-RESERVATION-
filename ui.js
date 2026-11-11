/* ==========================================================================
   BHARAT BUS — MOTION & INTERACTION LAYER
   Presentation only. Does not read or change booking, wallet, seat or admin
   logic in app.js. Safe to remove without breaking the booking flow.
   ========================================================================== */
(function () {
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.addEventListener("DOMContentLoaded", () => {
    splitHeroTitle();
    initScrollProgress();
    initRipples();
    initEntranceAnimations();
    initBusListReveal();

    if (canHover && !reduceMotion) {
      document.body.classList.add("cursor-on");
      initCursorGlow();
      initTilt();
      initMagnetic();
    }
  });

  // 1. Letter-by-letter 3D reveal for "TRANSIT / IS / BUILT"
  //    Only the text inside the lines is changed; the container's transform
  //    is still controlled by app.js during scroll.
  function splitHeroTitle() {
    document.querySelectorAll(".monumental-stack > div").forEach((line, lineIndex) => {
      const text = line.textContent.trim();
      line.setAttribute("aria-label", text);
      line.textContent = "";
      [...text].forEach((ch, i) => {
        const span = document.createElement("span");
        span.className = "ltr";
        span.setAttribute("aria-hidden", "true");
        span.style.setProperty("--d", lineIndex * 260 + i * 70 + "ms");
        span.textContent = ch;
        line.appendChild(span);
      });
    });
  }

  // 2. Tricolour scroll progress bar
  function initScrollProgress() {
    const bar = document.getElementById("tricolorProgress");
    if (!bar) return;
    let queued = false;
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
      queued = false;
    };
    window.addEventListener("scroll", () => {
      if (!queued) { queued = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  // 3. Ripple on press for CTA buttons and nav pills
  function initRipples() {
    document.addEventListener("pointerdown", (e) => {
      const btn = e.target.closest && e.target.closest(".bharat-cta-btn, .step-pill");
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      const dot = document.createElement("span");
      dot.className = "ripple";
      dot.style.left = e.clientX - r.left + "px";
      dot.style.top = e.clientY - r.top + "px";
      btn.appendChild(dot);
      dot.addEventListener("animationend", () => dot.remove());
    });
  }

  // 4. Golden cursor light that eases toward the pointer
  function initCursorGlow() {
    const glow = document.getElementById("cursorGlow");
    if (!glow) return;
    let x = window.innerWidth / 2, y = window.innerHeight / 2;
    let tx = x, ty = y;
    window.addEventListener("pointermove", (e) => { tx = e.clientX; ty = e.clientY; }, { passive: true });
    const loop = () => {
      x += (tx - x) * 0.15;
      y += (ty - y) * 0.15;
      glow.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      requestAnimationFrame(loop);
    };
    loop();
  }

  // 5. 3D tilt + cursor sheen on glass cards
  function initTilt() {
    document.addEventListener("pointermove", (e) => {
      const card = e.target.closest && e.target.closest(".bharat-console-card");
      if (!card) return;
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      card.style.setProperty("--mx", px * 100 + "%");
      card.style.setProperty("--my", py * 100 + "%");
      card.style.transform =
        `perspective(1100px) rotateX(${((0.5 - py) * 4).toFixed(2)}deg) rotateY(${((px - 0.5) * 5).toFixed(2)}deg)`;
    });
    document.addEventListener("pointerout", (e) => {
      const card = e.target.closest && e.target.closest(".bharat-console-card");
      if (card && !card.contains(e.relatedTarget)) card.style.transform = "";
    });
  }

  // 6. Magnetic pull on primary buttons
  function initMagnetic() {
    document.addEventListener("pointermove", (e) => {
      const btn = e.target.closest && e.target.closest(".bharat-cta-btn");
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      btn.style.transform = `translate(${(dx * 0.12).toFixed(1)}px, ${(dy * 0.2).toFixed(1)}px)`;
    });
    document.addEventListener("pointerout", (e) => {
      const btn = e.target.closest && e.target.closest(".bharat-cta-btn");
      if (btn && !btn.contains(e.relatedTarget)) btn.style.transform = "";
    });
  }

  // 7. Staggered entrance: replays each time a booking step becomes visible
  function playStagger(root, selector) {
    const items = root.matches(selector) ? [root] : [...root.querySelectorAll(selector)];
    items.forEach((el, i) => {
      el.classList.remove("rise");
      el.style.setProperty("--d", Math.min(i * 90, 600) + "ms");
      void el.offsetWidth; // restart the animation
      el.classList.add("rise");
    });
  }

  function initEntranceAnimations() {
    const sectionIds = [
      "featuresBand", "passengerPortalSection", "adminPortalSection",
      "stepPage1", "stepPage2", "stepPage3", "stepPage4", "stepPage5", "stepPage6",
    ];
    const observer = new MutationObserver((records) => {
      records.forEach((r) => {
        const el = r.target;
        if (!el.classList.contains("hidden")) playStagger(el, ".bharat-console-card");
      });
    });
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      observer.observe(el, { attributes: true, attributeFilter: ["class"] });
      if (!el.classList.contains("hidden")) playStagger(el, ".bharat-console-card");
    });
  }

  // 8. Bus cards that app.js inserts into the list animate in as they arrive
  function initBusListReveal() {
    const list = document.getElementById("busListContainer");
    if (!list) return;
    new MutationObserver(() => {
      [...list.children].forEach((el, i) => {
        if (el.dataset.revealed) return;
        el.dataset.revealed = "1";
        el.classList.add("rise");
        el.style.setProperty("--d", Math.min(i * 90, 600) + "ms");
      });
    }).observe(list, { childList: true });
  }
})();