// Switch between the login and sign-up panels and provide local demo feedback.
const loginTab = document.querySelector("#login-tab");
const signupTab = document.querySelector("#signup-tab");
const loginPanel = document.querySelector("#login-panel");
const signupPanel = document.querySelector("#signup-panel");
const authMessage = document.querySelector("#auth-message");

function showAuthPanel(activeTab, activePanel, inactiveTab, inactivePanel) {
  activeTab.classList.add("is-active");
  activeTab.setAttribute("aria-selected", "true");
  inactiveTab.classList.remove("is-active");
  inactiveTab.setAttribute("aria-selected", "false");
  activePanel.hidden = false;
  inactivePanel.hidden = true;
  authMessage.textContent = "";
}

loginTab.addEventListener("click", () => {
  showAuthPanel(loginTab, loginPanel, signupTab, signupPanel);
});

signupTab.addEventListener("click", () => {
  showAuthPanel(signupTab, signupPanel, loginTab, loginPanel);
});

// Keep authentication frontend-only until a backend is added.
[loginPanel, signupPanel].forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (form === signupPanel && form.elements.password.value !== form.elements["confirm-password"].value) {
      authMessage.textContent = "Those passwords don’t match yet. Please check and try again.";
      return;
    }
    authMessage.textContent = "Thanks for stopping by! Account sign-in isn’t connected in this preview.";
  });
});
