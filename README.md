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