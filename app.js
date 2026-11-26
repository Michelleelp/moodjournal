// Preview journal entries are kept in this file until storage is connected.
const exampleEntries = [
  { date: "Today · 9:15 AM", text: "I got outside for a little walk and the sunshine felt so good.", mood: "😊" },
  { date: "Yesterday · 8:42 PM", text: "A busy day, but I’m proud of myself for getting through it.", mood: "🌤️" },
  { date: "Monday · 7:30 PM", text: "Had a lovely catch-up with a friend. Feeling grateful.", mood: "🥰" }
];

const entriesList = document.querySelector("#entries-list");
const entryCount = document.querySelector("#entry-count");

function renderEntries(entries) {
  entriesList.replaceChildren();
  entries.forEach((entry) => {
    const card = document.createElement("article");
    card.className = "entry-card";

    const emoji = document.createElement("span");
    emoji.className = "entry-emoji";
    emoji.setAttribute("aria-hidden", "true");
    emoji.textContent = entry.mood;

    const content = document.createElement("div");
    content.className = "entry-content";
    const date = document.createElement("p");
    date.className = "entry-date";
    date.textContent = entry.date;
    const text = document.createElement("p");
    text.className = "entry-text";
    text.textContent = entry.text;

    content.append(date, text);
    card.append(emoji, content);
    entriesList.append(card);
  });
  entryCount.textContent = `${entries.length} ${entries.length === 1 ? "entry" : "entries"}`;
}

renderEntries(exampleEntries);

// A small keyword-based mood preview runs entirely in the browser.
const moodKeywords = [
  { terms: ["happy", "great", "joy", "excited", "good", "grateful", "love"], mood: "Feeling bright", emoji: "😊", message: "Let yourself enjoy this moment. You deserve to feel the good things. 🌼" },
  { terms: ["sad", "down", "lonely", "cry", "hard", "tired", "anxious", "worried", "stress"], mood: "Taking it gently", emoji: "🌧️", message: "It’s okay not to feel okay. Take one small breath at a time; you don’t have to figure it all out right now. 💜" },
  { terms: ["angry", "frustrated", "annoyed", "upset"], mood: "Working through it", emoji: "🌋", message: "Your feelings are valid. Give yourself a little space, and be gentle with yourself as you work through them. 🌱" }
];

const analyzeButton = document.querySelector("#analyze-button");
const journalText = document.querySelector("#journal-text");
const journalMessage = document.querySelector("#journal-message");
const moodResult = document.querySelector("#mood-result");

analyzeButton.addEventListener("click", () => {
  const entry = journalText.value.trim();
  if (!entry) {
    journalMessage.textContent = "Write a little about how you’re feeling first. 💜";
    journalText.focus();
    return;
  }

  const normalizedText = entry.toLowerCase();
  const matchedMood = moodKeywords.find((item) => item.terms.some((term) => normalizedText.includes(term)));
  const result = matchedMood || {
    mood: "Making space for today",
    emoji: "🌱",
    message: "Thank you for checking in with yourself. Whatever you’re feeling, it’s okay to take things at your own pace. 💜"
  };

  document.querySelector("#result-emoji").textContent = result.emoji;
  document.querySelector("#result-mood").textContent = result.mood;
  document.querySelector("#result-message").textContent = result.message;
  moodResult.hidden = false;
  journalMessage.textContent = "";
  moodResult.scrollIntoView({ behavior: "smooth", block: "nearest" });
});
