// Add a journal-only floating heart that follows the shared emoji-rain pause choice.
(() => {
  const pauseStorageKey = "moodjournal_emoji_rain_paused";
  const maxParticles = 24;
  const heartLayer = document.createElement("div");
  const heartButton = document.createElement("button");
  const heartGlyph = document.createElement("span");
  const heartWiggle = document.createElement("span");
  const reducedMotionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

  heartLayer.className = "floating-heart-layer";
  heartLayer.setAttribute("aria-label", "Floating journal heart");
  heartButton.className = "floating-heart-button";
  heartButton.type = "button";
  heartButton.setAttribute("aria-label", "Send a little love");
  heartButton.title = "Send a little love";
  heartGlyph.className = "floating-heart-glyph";
  heartWiggle.className = "floating-heart-wiggle";
  heartWiggle.textContent = "💜";
  heartGlyph.append(heartWiggle);
  heartButton.append(heartGlyph);
  heartLayer.append(heartButton);
  document.body.append(heartLayer);

  let isPaused = localStorage.getItem(pauseStorageKey) === "true";
  let isReducedMotion = reducedMotionPreference.matches;
  let animationFrameId = null;
  let returnAnimationTimer = null;
  let x = 0;
  let y = 0;
  let startX = 0;
  let startY = 0;
  let targetX = 0;
  let targetY = 0;
  let tripStart = 0;
  let tripDuration = 0;
  let heartSize = heartButton.getBoundingClientRect().width;

  // Keep the decorative layer transparent to pointer input except for the heart button.
  function updateLayerState() {
    heartLayer.classList.toggle("is-paused", isPaused || document.hidden);
    heartLayer.classList.toggle("is-reduced-motion", isReducedMotion);
  }

  function shouldWander() {
    return !isPaused && !isReducedMotion && !document.hidden;
  }

  function applyPosition() {
    heartButton.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  }

  // Choose viewport positions while avoiding visible controls where practical.
  function pickPosition() {
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = window.innerHeight;
    const navbar = document.querySelector(".site-header");
    const navbarBottom = navbar ? navbar.getBoundingClientRect().bottom : 0;
    const minX = Math.min(12, Math.max(0, viewportWidth - heartSize));
    const maxX = Math.max(minX, viewportWidth - heartSize - 12);
    const maxY = Math.max(8, viewportHeight - heartSize - 12);
    const minY = Math.min(navbarBottom + 12, maxY);
    const controls = Array.from(document.querySelectorAll(
      "a[href], button:not(.floating-heart-button), input, textarea, select, [role='button']"
    )).filter((element) => {
      if (element.closest(".floating-heart-layer") || element.closest("[hidden]")) {
        return false;
      }
      const bounds = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      return bounds.width > 0 && bounds.height > 0 &&
        style.display !== "none" && style.visibility !== "hidden" &&
        bounds.right > 0 && bounds.left < viewportWidth &&
        bounds.bottom > 0 && bounds.top < viewportHeight;
    });

    let fallbackPosition = { x: maxX, y: maxY };
    for (let attempt = 0; attempt < 36; attempt += 1) {
      const position = {
        x: minX + Math.random() * (maxX - minX),
        y: minY + Math.random() * (maxY - minY)
      };
      fallbackPosition = position;

      const overlapsControl = controls.some((control) => {
        const bounds = control.getBoundingClientRect();
        const clearance = 12;
        return position.x + heartSize + clearance > bounds.left &&
          position.x - clearance < bounds.right &&
          position.y + heartSize + clearance > bounds.top &&
          position.y - clearance < bounds.bottom;
      });

      if (!overlapsControl && Math.hypot(position.x - x, position.y - y) > 90) {
        return position;
      }
    }

    return fallbackPosition;
  }

  // Each journey lasts 6–10 seconds and changes only the compositor-friendly transform.
  function chooseNextTarget(now) {
    startX = x;
    startY = y;
    const target = pickPosition();
    targetX = target.x;
    targetY = target.y;
    tripStart = now;
    tripDuration = 6000 + Math.random() * 4000;
  }

  function animateHeart(now) {
    if (!shouldWander()) {
      animationFrameId = null;
      return;
    }

    const progress = Math.min(1, (now - tripStart) / tripDuration);
    const easedProgress = progress * progress * (3 - 2 * progress);
    x = startX + (targetX - startX) * easedProgress;
    y = startY + (targetY - startY) * easedProgress;
    applyPosition();

    if (progress === 1) {
      chooseNextTarget(now);
    }
    animationFrameId = window.requestAnimationFrame(animateHeart);
  }

  function stopWandering() {
    if (animationFrameId !== null) {
      window.cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  }

  function startWandering() {
    if (!shouldWander() || animationFrameId !== null) {
      return;
    }
    chooseNextTarget(performance.now());
    animationFrameId = window.requestAnimationFrame(animateHeart);
  }

  // Pop a small, bounded number of decorative hearts, then remove each after its animation.
  function popMiniHearts(amount) {
    if (isPaused || isReducedMotion || document.hidden) {
      return;
    }

    const remainingSlots = Math.max(0, maxParticles - heartLayer.querySelectorAll(".floating-heart-particle").length);
    const heartBounds = heartButton.getBoundingClientRect();
    const symbols = ["💜", "💕", "✨"];

    for (let index = 0; index < Math.min(amount, remainingSlots); index += 1) {
      const particle = document.createElement("span");
      const angle = Math.random() * Math.PI * 2;
      const distance = 28 + Math.random() * 48;
      particle.className = "floating-heart-particle";
      particle.setAttribute("aria-hidden", "true");
      particle.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      particle.style.left = `${heartBounds.left + heartBounds.width / 2}px`;
      particle.style.top = `${heartBounds.top + heartBounds.height / 2}px`;
      particle.style.setProperty("--drift-x", `${Math.cos(angle) * distance}px`);
      particle.style.setProperty("--drift-y", `${Math.sin(angle) * distance}px`);
      particle.style.setProperty("--particle-duration", `${650 + Math.random() * 250}ms`);
      particle.addEventListener("animationend", () => particle.remove(), { once: true });
      heartLayer.append(particle);
    }
  }

  // Clicks briefly burst the heart, then scale it back in while its path continues.
  function burstHeart() {
    if (isPaused || isReducedMotion || document.hidden) {
      return;
    }

    popMiniHearts(16);
    window.clearTimeout(returnAnimationTimer);
    heartGlyph.classList.remove("is-returning");
    heartGlyph.classList.add("is-bursting");
    returnAnimationTimer = window.setTimeout(() => {
      heartGlyph.classList.remove("is-bursting");
      heartGlyph.classList.add("is-returning");
    }, 220);
  }

  heartGlyph.addEventListener("animationend", (event) => {
    if (event.animationName === "heart-scale-in") {
      heartGlyph.classList.remove("is-returning");
    }
  });
  heartButton.addEventListener("click", burstHeart);
  heartButton.addEventListener("pointerenter", (event) => {
    if (event.pointerType === "mouse" || event.pointerType === "pen") {
      popMiniHearts(6);
    }
  });

  // Follow the same stored pause value as effects.js, including changes in other tabs.
  function syncPauseChoice() {
    const nextPaused = localStorage.getItem(pauseStorageKey) === "true";
    if (nextPaused === isPaused) {
      return;
    }

    isPaused = nextPaused;
    updateLayerState();
    if (shouldWander()) {
      startWandering();
    } else {
      stopWandering();
    }
  }

  document.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest(".emoji-rain-toggle")) {
      syncPauseChoice();
    }
  });
  window.addEventListener("storage", (event) => {
    if (event.key === pauseStorageKey) {
      syncPauseChoice();
    }
  });

  // Respect reduced motion and pause movement while the page is in the background.
  function updateMotionPreference() {
    const wasReducedMotion = isReducedMotion;
    isReducedMotion = reducedMotionPreference.matches;
    updateLayerState();

    if (isReducedMotion) {
      stopWandering();
      heartButton.style.removeProperty("transform");
      heartLayer.querySelectorAll(".floating-heart-particle").forEach((particle) => particle.remove());
    } else if (wasReducedMotion) {
      const initialPosition = pickPosition();
      x = initialPosition.x;
      y = initialPosition.y;
      applyPosition();
      startWandering();
    }
  }

  if (typeof reducedMotionPreference.addEventListener === "function") {
    reducedMotionPreference.addEventListener("change", updateMotionPreference);
  } else {
    reducedMotionPreference.addListener(updateMotionPreference);
  }

  document.addEventListener("visibilitychange", () => {
    updateLayerState();
    if (shouldWander()) {
      startWandering();
    } else {
      stopWandering();
    }
  });

  window.addEventListener("resize", () => {
    heartSize = heartButton.getBoundingClientRect().width;
    if (isReducedMotion) {
      return;
    }

    const position = pickPosition();
    x = position.x;
    y = position.y;
    applyPosition();
    if (shouldWander()) {
      startWandering();
    }
  });

  // Start in a corner for reduced-motion users; otherwise begin the first gentle journey.
  updateLayerState();
  if (!isReducedMotion) {
    const initialPosition = pickPosition();
    x = initialPosition.x;
    y = initialPosition.y;
    applyPosition();
    startWandering();
  }
})();
