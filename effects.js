// Set up an optional logo image and hide it cleanly when the placeholder file is absent.
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

// Respect reduced-motion preferences before creating any falling emoji.
const reducedMotionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
if (!reducedMotionPreference.matches) {
  const emotionEmojis = ["😊", "😢", "😡", "😨", "😲", "😌", "😍", "😴"];
  const maximumDrops = 20;
  const rainLayer = document.createElement("div");
  rainLayer.className = "emoji-rain";
  rainLayer.setAttribute("aria-hidden", "true");
  document.body.append(rainLayer);

  // Create each drop with its own horizontal position, size, and fall duration.
  const addEmojiDrop = () => {
    if (rainLayer.childElementCount >= maximumDrops) {
      return;
    }

    const drop = document.createElement("span");
    const fallDuration = 10 + Math.random() * 8;
    drop.className = "emoji-rain-drop";
    drop.textContent = emotionEmojis[Math.floor(Math.random() * emotionEmojis.length)];
    drop.style.left = `${Math.random() * 100}%`;
    drop.style.fontSize = `${20 + Math.random() * 16}px`;
    drop.style.setProperty("--fall-duration", `${fallDuration}s`);
    drop.addEventListener("animationend", () => drop.remove(), { once: true });
    rainLayer.append(drop);
  };

  // Seed a few drops, then keep a gentle pace without exceeding the screen limit.
  for (let index = 0; index < 8; index += 1) {
    window.setTimeout(addEmojiDrop, index * 700);
  }
  window.setInterval(addEmojiDrop, 1400);
}
