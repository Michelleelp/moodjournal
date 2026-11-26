// Show a friendly confirmation without sending the form anywhere.
const contactForm = document.querySelector("#contact-form");
const thankYou = document.querySelector("#thank-you");

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  thankYou.hidden = false;
  contactForm.reset();
});
