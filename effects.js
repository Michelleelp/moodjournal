// Hide the optional logo cleanly when its placeholder image is unavailable.
document.querySelectorAll(".brand-logo").forEach((logo) => {
  const updateLogoVisibility = () => {
    logo.hidden = !logo.naturalWidth;
  };

  if (logo.complete) {
    updateLogoVisibility();
  } else {
    logo.addEventListener("load", updateLogoVisibility, { once: true });
    logo.addEventListener("error", updateLogoVisibility, { once: true });
  }
});

// Inject a shared control so the gentle emoji rain can be paused on every page.
const rainStorageKey = "moodjournal_emoji_rain_paused";
const reducedMotionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
let isRainPaused = localStorage.getItem(rainStorageKey) === "true";
let rainInterval = null;
const pendingSpawnTimers = new Set();
let rainLayer = null;

const rainToggle = document.createElement("button");
rainToggle.className = "emoji-rain-toggle";
rainToggle.type = "button";
rainToggle.setAttribute("aria-pressed", String(isRainPaused));
document.body.append(rainToggle);

// Keep the icon, accessible name, and hover tooltip in sync with the state.
function updateRainToggle() {
  const label = isRainPaused ? "Play background animation" : "Pause background animation";
  rainToggle.textContent = isRainPaused ? "▶" : "⏸";
  rainToggle.setAttribute("aria-label", label);
  rainToggle.setAttribute("data-tooltip", label);
  rainToggle.setAttribute("title", label);
  rainToggle.setAttribute("aria-pressed", String(isRainPaused));
}

// Create each drop with a random position, size, and slow fall duration.
function addEmojiDrop() {
  if (isRainPaused || !rainLayer || rainLayer.childElementCount >= 20) {
    return;
  }

  const emotionEmojis = ["😊", "😢", "😡", "😨", "😲", "😌", "😍", "😴"];
  const drop = document.createElement("span");
  const fallDuration = 10 + Math.random() * 8;
  const sizeRoll = Math.random();
  const fontSize = sizeRoll < 0.72
    ? 25 + Math.random() * 20
    : sizeRoll < 0.93
      ? 45 + Math.random() * 20
      : 65 + Math.random() * 26;

  drop.className = "emoji-rain-drop";
  drop.textContent = emotionEmojis[Math.floor(Math.random() * emotionEmojis.length)];
  drop.style.left = `${Math.random() * 100}%`;
  drop.style.fontSize = `${fontSize}px`;
  drop.style.setProperty("--fall-duration", `${fallDuration}s`);
  drop.addEventListener("animationend", () => drop.remove(), { once: true });
  rainLayer.append(drop);
}

// Start new drops only while the control is in its playing state.
function startEmojiRain() {
  if (reducedMotionPreference.matches || isRainPaused || !rainLayer) {
    return;
  }

  rainLayer.classList.remove("is-paused");
  for (let index = 0; index < 8; index += 1) {
    const timer = window.setTimeout(() => {
      pendingSpawnTimers.delete(timer);
      addEmojiDrop();
    }, index * 700);
    pendingSpawnTimers.add(timer);
  }
  rainInterval = window.setInterval(addEmojiDrop, 1400);
}

// Freeze existing CSS animations and cancel scheduled drops when paused.
function stopEmojiRain() {
  if (rainInterval !== null) {
    window.clearInterval(rainInterval);
    rainInterval = null;
  }
  pendingSpawnTimers.forEach((timer) => window.clearTimeout(timer));
  pendingSpawnTimers.clear();
  if (rainLayer) {
    rainLayer.classList.add("is-paused");
  }
}

// Persist the user's choice so it carries between page loads.
function setEmojiRainPaused(paused) {
  isRainPaused = paused;
  localStorage.setItem(rainStorageKey, String(isRainPaused));
  updateRainToggle();
  if (isRainPaused) {
    stopEmojiRain();
  } else {
    startEmojiRain();
  }
}

updateRainToggle();
if (!reducedMotionPreference.matches) {
  rainLayer = document.createElement("div");
  rainLayer.className = "emoji-rain";
  rainLayer.setAttribute("aria-hidden", "true");
  document.body.append(rainLayer);
  if (isRainPaused) {
    rainLayer.classList.add("is-paused");
  } else {
    startEmojiRain();
  }
}

rainToggle.addEventListener("click", () => setEmojiRainPaused(!isRainPaused));
