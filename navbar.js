// Shared authentication state is guest-only until a real login service is added.
var isLoggedIn = false;

const navbarHost = document.querySelector("#navbar");
const currentPage = window.location.pathname.split("/").pop().toLowerCase() || "index.html";

// Inject the shared navigation and show links appropriate to the current page.
function renderNavbar() {
  const journalCurrent = currentPage === "app.html";
  const contactCurrent = currentPage === "contact.html";
  // Keep only Sign Up for guests and use Logout for logged-in previews.
  const accountActions = isLoggedIn
    ? '<button class="nav-link nav-tab nav-tab-logout" id="nav-logout" type="button">Logout</button>'
    : '<button class="nav-link nav-tab nav-tab-signup" type="button" data-open-auth="signup">Sign Up</button>';

  navbarHost.innerHTML = `
    <nav class="navbar page-width" aria-label="Main navigation">
      <a class="brand" href="index.html" aria-label="MoodJournal home">
        <img class="brand-logo" src="assets/logo.png" alt="MoodJournal logo">
        <span>MoodJournal</span>
      </a>
      <button class="menu-toggle" id="menu-toggle" type="button" aria-expanded="false" aria-controls="main-menu">
        <span class="menu-toggle-label">Menu</span>
        <span aria-hidden="true">☰</span>
      </button>
      <div class="nav-links" id="main-menu">
        <a class="nav-link nav-tab nav-tab-journal${journalCurrent ? " is-current" : ""}" href="app.html"${journalCurrent ? ' aria-current="page"' : ""}>Journal</a>
        <a class="nav-link nav-tab nav-tab-contact${contactCurrent ? " is-current" : ""}" href="contact.html"${contactCurrent ? ' aria-current="page"' : ""}>Contact</a>
        <div class="nav-account-actions">${accountActions}</div>
      </div>
    </nav>
  `;

  const menuToggle = document.querySelector("#menu-toggle");
  const navLinks = document.querySelector("#main-menu");
  menuToggle.addEventListener("click", () => {
    const menuIsOpen = menuToggle.getAttribute("aria-expanded") !== "true";
    navLinks.classList.toggle("is-open", menuIsOpen);
    menuToggle.setAttribute("aria-expanded", String(menuIsOpen));
    menuToggle.querySelector(".menu-toggle-label").textContent = menuIsOpen ? "Close" : "Menu";
  });

  const logoutButton = document.querySelector("#nav-logout");
  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      isLoggedIn = false;
      renderNavbar();
      document.dispatchEvent(new CustomEvent("moodjournal:auth-change"));
    });
  }
}

// Add the reusable login/sign-up dialog once, regardless of the current page.
document.body.insertAdjacentHTML("beforeend", `
  <div class="auth-modal-backdrop" id="auth-modal" hidden>
    <section class="auth-modal-panel auth-card" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title" tabindex="-1">
      <button class="modal-close" id="modal-close" type="button" aria-label="Close sign-in dialog">×</button>
      <div class="section-eyebrow">Your gentle space awaits</div>
      <h2 id="auth-modal-title">Welcome to MoodJournal</h2>
      <p class="muted-copy">Log in or create an account to keep your journal history.</p>

      <!-- Shared login and sign-up tabs -->
      <div class="tab-list" role="tablist" aria-label="Account options">
        <button class="tab-button is-active" id="login-tab" type="button" role="tab" aria-selected="true" aria-controls="login-panel">Login</button>
        <button class="tab-button" id="signup-tab" type="button" role="tab" aria-selected="false" aria-controls="signup-panel">Sign Up</button>
      </div>

      <!-- Shared login form -->
      <form class="auth-form" id="login-panel" role="tabpanel" aria-labelledby="login-tab">
        <label for="login-email">Email</label>
        <input id="login-email" name="email" type="email" placeholder="you@example.com" autocomplete="email" required>
        <label for="login-password">Password</label>
        <input id="login-password" name="password" type="password" placeholder="Your password" autocomplete="current-password" required>
        <button class="button button-primary button-full" type="submit">Login <span aria-hidden="true">→</span></button>
      </form>

      <!-- Shared sign-up form -->
      <form class="auth-form" id="signup-panel" role="tabpanel" aria-labelledby="signup-tab" hidden>
        <label for="signup-email">Email</label>
        <input id="signup-email" name="email" type="email" placeholder="you@example.com" autocomplete="email" required>
        <label for="signup-password">Password</label>
        <input id="signup-password" name="password" type="password" placeholder="Create a password" autocomplete="new-password" required>
        <label for="confirm-password">Confirm password</label>
        <input id="confirm-password" name="confirm-password" type="password" placeholder="Type it one more time" autocomplete="new-password" required>
        <button class="button button-primary button-full" type="submit">Create account <span aria-hidden="true">→</span></button>
      </form>

      <!-- Shared space for password and account feedback -->
      <p class="form-message" id="auth-message" role="status" aria-live="polite"></p>
      <p class="privacy-note">A gentle reminder: it’s okay to feel it all. 💜</p>
    </section>
  </div>
`);

const authModal = document.querySelector("#auth-modal");
const authModalPanel = document.querySelector(".auth-modal-panel");
const authMessage = document.querySelector("#auth-message");
const loginTab = document.querySelector("#login-tab");
const signupTab = document.querySelector("#signup-tab");
const loginPanel = document.querySelector("#login-panel");
const signupPanel = document.querySelector("#signup-panel");
let previouslyFocusedElement = null;
let modalCloseTimer = null;

// Switch the visible modal form and update its accessible tab state.
function showAuthPanel(tabName) {
  const showSignup = tabName === "signup";
  const activeTab = showSignup ? signupTab : loginTab;
  const inactiveTab = showSignup ? loginTab : signupTab;
  const activePanel = showSignup ? signupPanel : loginPanel;
  const inactivePanel = showSignup ? loginPanel : signupPanel;

  activeTab.classList.add("is-active");
  activeTab.setAttribute("aria-selected", "true");
  inactiveTab.classList.remove("is-active");
  inactiveTab.setAttribute("aria-selected", "false");
  activePanel.hidden = false;
  inactivePanel.hidden = true;
  authMessage.textContent = "";
}

// Open the shared dialog on the requested tab and move focus into its form.
function openAuthModal(tabName) {
  if (authModal.hidden) {
    previouslyFocusedElement = document.activeElement;
  }
  window.clearTimeout(modalCloseTimer);
  showAuthPanel(tabName);
  authModal.hidden = false;
  window.requestAnimationFrame(() => {
    authModal.classList.add("is-open");
    const firstInput = (tabName === "signup" ? signupPanel : loginPanel).querySelector("input");
    firstInput.focus();
  });
}

// Close with a short exit transition, then return focus to the opener.
function closeAuthModal() {
  if (authModal.hidden) {
    return;
  }
  authModal.classList.remove("is-open");
  modalCloseTimer = window.setTimeout(() => {
    if (!authModal.classList.contains("is-open")) {
      authModal.hidden = true;
      if (previouslyFocusedElement && previouslyFocusedElement.isConnected) {
        previouslyFocusedElement.focus();
      }
    }
  }, 260);
}

renderNavbar();
document.addEventListener("click", (event) => {
  const authButton = event.target.closest("[data-open-auth]");
  if (!authButton) {
    return;
  }

  const menuToggle = document.querySelector("#menu-toggle");
  const navLinks = document.querySelector("#main-menu");
  navLinks.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.querySelector(".menu-toggle-label").textContent = "Menu";
  openAuthModal(authButton.dataset.openAuth);
});
loginTab.addEventListener("click", () => showAuthPanel("login"));
signupTab.addEventListener("click", () => showAuthPanel("signup"));
document.querySelector("#modal-close").addEventListener("click", closeAuthModal);
authModal.addEventListener("click", (event) => {
  if (event.target === authModal) {
    closeAuthModal();
  }
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeAuthModal();
  }
});

// Keep authentication forms frontend-only and validate sign-up confirmation.
[loginPanel, signupPanel].forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (form === signupPanel && form.elements.password.value !== form.elements["confirm-password"].value) {
      authMessage.textContent = "Those passwords don’t match yet. Please check and try again.";
      return;
    }
    authMessage.textContent = "Account sign-in isn’t connected in this preview. You can keep journaling as a guest. 💜";
  });
});
