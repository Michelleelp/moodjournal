// Write contact messages to Firestore without reading the messages collection.
import { addDoc, collection, serverTimestamp } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";
import { db } from "./firebase.js";

const contactForm = document.querySelector("#contact-form");
const thankYou = document.querySelector("#thank-you");
const sendAnotherButton = document.querySelector("#send-another-message");
const nameInput = document.querySelector("#contact-name");
const emailInput = document.querySelector("#contact-email");
const messageInput = document.querySelector("#contact-message");
const messageCounter = document.querySelector("#contact-message-counter");
const contactStatus = document.querySelector("#contact-status");
const submitButton = document.querySelector("#contact-submit");
const submitLabel = submitButton.querySelector(".contact-submit-label");

const fieldErrors = {
  name: document.querySelector("#contact-name-error"),
  email: document.querySelector("#contact-email-error"),
  message: document.querySelector("#contact-message-error")
};

const limits = { name: 100, email: 200, message: 2000 };
let cooldownUntil = 0;
let cooldownInterval = null;
let isSending = false;
let thankYouCelebrationTimer = null;

// Keep the character count in sync with the message textarea.
function updateMessageCounter() {
  messageCounter.textContent = `${messageInput.value.length} / ${limits.message} characters`;
}

// Associate each validation message with its field for both sighted and assistive users.
function setFieldError(input, errorElement, message) {
  errorElement.textContent = message;
  errorElement.hidden = !message;
  if (message) {
    input.setAttribute("aria-invalid", "true");
  } else {
    input.removeAttribute("aria-invalid");
  }
}

function clearFieldErrors() {
  setFieldError(nameInput, fieldErrors.name, "");
  setFieldError(emailInput, fieldErrors.email, "");
  setFieldError(messageInput, fieldErrors.message, "");
}

function showStatus(message, kind) {
  contactStatus.textContent = message;
  contactStatus.dataset.kind = kind;
  contactStatus.hidden = !message;
}

// Validate all fields before any write is attempted.
function validateContactForm() {
  clearFieldErrors();
  let isValid = true;
  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const message = messageInput.value.trim();

  if (!name) {
    setFieldError(nameInput, fieldErrors.name, "Please enter your name.");
    isValid = false;
  } else if (nameInput.value.length > limits.name) {
    setFieldError(nameInput, fieldErrors.name, "Your name must be 100 characters or fewer.");
    isValid = false;
  }

  if (emailInput.value.length > limits.email) {
    setFieldError(emailInput, fieldErrors.email, "Your email must be 200 characters or fewer.");
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setFieldError(emailInput, fieldErrors.email, "Please enter a valid email address.");
    isValid = false;
  }

  if (!message) {
    setFieldError(messageInput, fieldErrors.message, "Please write a message.");
    isValid = false;
  } else if (messageInput.value.length > limits.message) {
    setFieldError(messageInput, fieldErrors.message, "Your message must be 2,000 characters or fewer.");
    isValid = false;
  }

  return isValid;
}

// Enforce a short client-side cooldown and show how long remains when the form reopens.
function refreshCooldown() {
  if (isSending) {
    return;
  }

  const secondsRemaining = Math.ceil(Math.max(0, cooldownUntil - Date.now()) / 1000);
  if (secondsRemaining > 0) {
    submitButton.disabled = true;
    showStatus(`Please wait ${secondsRemaining} seconds before sending another message 💜`, "cooldown");
    if (cooldownInterval === null) {
      cooldownInterval = window.setInterval(refreshCooldown, 1000);
    }
    return;
  }

  submitButton.disabled = false;
  if (cooldownInterval !== null) {
    window.clearInterval(cooldownInterval);
    cooldownInterval = null;
  }
  if (contactStatus.dataset.kind === "cooldown") {
    showStatus("", "");
  }
}

function waitForAnimation() {
  return new Promise((resolve) => window.setTimeout(resolve, 240));
}

// Celebrate a successful write with a viewport-clipped burst from the Send button.
function playSendSparkles() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  const buttonBounds = submitButton.getBoundingClientRect();
  const burst = document.createElement("div");
  const symbols = ["✨", "⭐", "💜", "🌟"];
  const particleCount = 20 + Math.floor(Math.random() * 11);
  burst.className = "contact-sparkle-burst";
  burst.setAttribute("aria-hidden", "true");

  for (let index = 0; index < particleCount; index += 1) {
    const particle = document.createElement("span");
    const angle = Math.random() * Math.PI * 2;
    const distance = 55 + Math.random() * 125;
    particle.className = "contact-sparkle-particle";
    particle.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    particle.style.left = `${buttonBounds.left + buttonBounds.width / 2}px`;
    particle.style.top = `${buttonBounds.top + buttonBounds.height / 2}px`;
    particle.style.setProperty("--sparkle-x", `${Math.cos(angle) * distance}px`);
    particle.style.setProperty("--sparkle-y", `${Math.sin(angle) * distance}px`);
    particle.style.setProperty("--sparkle-size", `${15 + Math.random() * 18}px`);
    particle.style.setProperty("--sparkle-rotation", `${Math.random() * 720 - 360}deg`);
    particle.style.setProperty("--sparkle-duration", `${1050 + Math.random() * 300}ms`);
    particle.addEventListener("animationend", () => {
      particle.remove();
      if (!burst.childElementCount) {
        burst.remove();
      }
    }, { once: true });
    burst.append(particle);
  }

  document.body.append(burst);
  // Also clean up if the browser interrupts CSS animation events during navigation.
  window.setTimeout(() => burst.remove(), 1500);
}

// Fade the form away and reveal the thank-you panel only after a successful write.
async function showThankYou() {
  contactForm.classList.add("is-hiding");
  await waitForAnimation();
  contactForm.hidden = true;
  contactForm.classList.remove("is-hiding");

  thankYou.hidden = false;
  window.requestAnimationFrame(() => {
    thankYou.classList.add("is-visible", "is-celebrating");
    window.clearTimeout(thankYouCelebrationTimer);
    thankYouCelebrationTimer = window.setTimeout(() => {
      thankYou.classList.remove("is-celebrating");
      thankYouCelebrationTimer = null;
    }, 2000);
  });
}

// Reset to a clean form and reapply the signed-in email and any active cooldown.
async function showEmptyForm() {
  sendAnotherButton.disabled = true;
  thankYou.classList.remove("is-visible", "is-celebrating");
  window.clearTimeout(thankYouCelebrationTimer);
  thankYouCelebrationTimer = null;
  await waitForAnimation();
  thankYou.hidden = true;

  contactForm.reset();
  clearFieldErrors();
  showStatus("", "");
  updateMessageCounter();
  contactForm.classList.add("is-hiding");
  contactForm.hidden = false;
  window.requestAnimationFrame(() => contactForm.classList.remove("is-hiding"));
  prefillEmail();
  refreshCooldown();
  sendAnotherButton.disabled = false;
  nameInput.focus();
}

// Prefill only an empty email input so the user can still edit or keep their own address.
function prefillEmail(user) {
  const signedInUser = user || window.currentUser;
  if (signedInUser && signedInUser.email && !emailInput.value) {
    emailInput.value = signedInUser.email;
  }
}

contactForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  showStatus("", "");

  if (!validateContactForm()) {
    return;
  }

  if (Date.now() < cooldownUntil) {
    refreshCooldown();
    return;
  }

  isSending = true;
  submitButton.disabled = true;
  submitLabel.textContent = "Sending... ✨";

  try {
    const user = window.currentUser;
    const messageDocument = {
      name: nameInput.value.trim(),
      email: emailInput.value.trim(),
      message: messageInput.value.trim(),
      createdAt: serverTimestamp()
    };
    if (window.isLoggedIn && user && user.uid) {
      messageDocument.uid = user.uid;
    }

    await addDoc(collection(db, "messages"), messageDocument);
    // Keep a decorative failure from changing the success state of the saved message.
    try {
      playSendSparkles();
    } catch (error) {
      console.error("[MoodJournal] Could not play the contact celebration.", error);
    }
    cooldownUntil = Date.now() + 30000;
    contactForm.reset();
    updateMessageCounter();
    clearFieldErrors();
    showStatus("", "");
    await showThankYou();
  } catch (error) {
    console.error("[MoodJournal] Failed to save the contact message.", error);
    showStatus("Something went wrong, please try again 💜", "error");
  } finally {
    isSending = false;
    submitLabel.textContent = "Send";
    refreshCooldown();
  }
});

// Clear individual field errors as the visitor corrects their input.
nameInput.addEventListener("input", () => setFieldError(nameInput, fieldErrors.name, ""));
emailInput.addEventListener("input", () => setFieldError(emailInput, fieldErrors.email, ""));
messageInput.addEventListener("input", () => {
  updateMessageCounter();
  setFieldError(messageInput, fieldErrors.message, "");
});

sendAnotherButton.addEventListener("click", showEmptyForm);
document.addEventListener("moodjournal:auth-change", (event) => {
  const user = event.detail && event.detail.user ? event.detail.user : window.currentUser;
  prefillEmail(user);
});

prefillEmail();
updateMessageCounter();
refreshCooldown();
