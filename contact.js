// Show a friendly confirmation without sending the form anywhere.
const isLoggedIn = false;
const contactForm = document.querySelector("#contact-form");
const thankYou = document.querySelector("#thank-you");
const loginLink = document.querySelector("#nav-login");
const logoutLink = document.querySelector("#nav-logout");

// Keep shared navigation in guest mode until authentication is connected.
loginLink.hidden = isLoggedIn;
logoutLink.hidden = !isLoggedIn;

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  thankYou.hidden = false;
  contactForm.reset();
});
