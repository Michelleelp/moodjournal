# MoodJournal
Proyecto de Michelle Lozano

1. Create the front-end structure for a web app called MoodJournal using only HTML, CSS and JavaScript (no frameworks). Do NOT add Firebase or API calls yet, only the layout and basic UI behavior.

Files: index.html, app.html, contact.html, style.css (shared), and an empty script.js placeholder for each page (index.js, app.js, contact.js).

Design: soft purple and white color palette, cute and colorful style with emojis, rounded corners, soft shadows, friendly font from Google Fonts. Fully responsive (mobile and desktop). All text in English. Define the colors as CSS variables.

Shared navbar (on app.html and contact.html): logo placeholder (use a small img tag pointing to assets/logo.png with a 🌸 emoji as temporary fallback) + the name "MoodJournal", links "Journal" and "Contact", and a "Logout" button.

index.html: centered card with tabs "Login" and "Sign Up". Login has email and password. Sign Up has email, password and confirm password. Tabs switch with JavaScript. Include an empty area to show error messages.

app.html: a title, a textarea "How are you feeling today?", a button "Analyze my mood", and a result card (hidden until there is a result) showing a big emoji with a heartbeat CSS animation (grows and shrinks), the mood name, and a supportive message. Below it, a section "My past entries" showing a list of cards (date, text, mood emoji). Add a few fake example entries with JavaScript just to preview the design.

contact.html: a contact form with name, email and message, a "Send" button, and a "Thank you" message that appears after submitting (JavaScript only, no backend yet).

Add comments in the code explaining each section.



2. Update the existing MoodJournal front-end (index.html, app.html, contact.html, style.css, and the page JS files). Keep the soft purple and white cute style. Do NOT add Firebase or API calls yet.

1. Guest access: turn index.html into a welcome page. Show a friendly headline, a short description, and a big button "Start journaling" that goes to app.html without requiring login. Below it, show a smaller section "Want to save your history? Log in or sign up" with the existing Login / Sign Up tabs and forms (keep it as optional).

2. app.html must work for guests. In the "My past entries" section, if the user is not logged in, show a friendly message: "Log in to save and see your past entries 💜" with a Login button that goes to index.html. Keep the fake example entries only when a variable isLoggedIn is true (set it to false by default for now).

3. Navbar: remove the 🌸 emoji next to the name. Show only the text "MoodJournal" (keep an img placeholder prepared for assets/logo.png that is hidden if the file does not exist). Show a "Login" button when the user is a guest and a "Logout" button when logged in (use the isLoggedIn variable for now).

4. Emoji rain background on ALL pages: create a shared effects.js that makes emotion emojis (😊 😢 😡 😨 😲 😌 😍 😴) fall slowly from the top to the bottom of the screen like soft rain. Slow speed (about 10 to 18 seconds per fall), random horizontal positions, random sizes between 20px and 36px, low opacity (around 0.5), and no more than 20 emojis on screen at once. They must stay behind the content (position fixed, z-index behind, pointer-events none), and must not make text hard to read. Respect prefers-reduced-motion by disabling the animation.

Add comments in the code explaining each part. 

(IMPORVEMENTS- CHANGES DE DESIGN) (Decisión de diseño: Cambié el login obligatorio por un modo invitado con login opcional, para que sea más fácil entrar, sin perder el requisito de Firebase Authentication.)