// Preview journal entries are kept in this file until storage is connected.
const isLoggedIn = false;
const exampleEntries = [
  { date: "Today · 9:15 AM", text: "I got outside for a little walk and the sunshine felt so good.", mood: "😊" },
  { date: "Yesterday · 8:42 PM", text: "A busy day, but I’m proud of myself for getting through it.", mood: "🌤️" },
  { date: "Monday · 7:30 PM", text: "Had a lovely catch-up with a friend. Feeling grateful.", mood: "🥰" }
];

const entriesList = document.querySelector("#entries-list");
const entryCount = document.querySelector("#entry-count");
const guestEntryPrompt = document.querySelector("#guest-entry-prompt");
const loginLink = document.querySelector("#nav-login");
const logoutLink = document.querySelector("#nav-logout");

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

// Show saved-entry previews only for logged-in users; guests see the login prompt.
loginLink.hidden = isLoggedIn;
logoutLink.hidden = !isLoggedIn;
guestEntryPrompt.hidden = isLoggedIn;
entriesList.hidden = !isLoggedIn;
entryCount.hidden = !isLoggedIn;
if (isLoggedIn) {
  renderEntries(exampleEntries);
}

// Local mood details power the demo result until a mood service is connected.
const moodDetails = {
  joy: {
    name: "Joy",
    emoji: "😊",
    message: "Let yourself enjoy this bright moment; you deserve the good things in your life. Keep a little space for this happiness and let it recharge you."
  },
  sadness: {
    name: "Sadness",
    emoji: "😢",
    message: "You don’t have to push these feelings away; it’s okay to take things slowly. Be gentle with yourself and reach out to someone you trust if you need company."
  },
  anger: {
    name: "Anger",
    emoji: "😡",
    message: "It makes sense that strong feelings need space, and you can pause before deciding what to do next. Take a slow breath and give yourself kindness while the intensity settles."
  },
  fear: {
    name: "Fear",
    emoji: "😨",
    message: "You’re allowed to feel uncertain, and you don’t have to solve everything at once. Focus on one steady breath and one small thing you can do right now."
  },
  surprise: {
    name: "Surprise",
    emoji: "😲",
    message: "Unexpected moments can take time to settle, and you can give yourself that time. Notice what you need next, then take it one step at a time."
  },
  disgust: {
    name: "Disgust",
    emoji: "🤢",
    message: "It’s okay to have a strong reaction, and you can honor what feels uncomfortable to you. Give yourself space to reset and choose what feels right for you."
  },
  neutral: {
    name: "Neutral",
    emoji: "😌",
    message: "A steady or quiet mood is meaningful too, and you don’t need to make it into anything else. Keep checking in with yourself and let today unfold at your own pace."
  }
};

const resultEmoji = document.querySelector("#result-emoji");
const resultMood = document.querySelector("#result-mood");
const resultMessage = document.querySelector("#result-message");
const moodResult = document.querySelector("#mood-result");

// Show the chosen mood with its emoji, supportive copy, and animated card.
function showMood(moodName) {
  if (!Object.prototype.hasOwnProperty.call(moodDetails, moodName)) {
    throw new RangeError(`Unknown mood: ${moodName}`);
  }
  const mood = moodDetails[moodName];

  resultEmoji.textContent = mood.emoji;
  resultMood.textContent = mood.name;
  resultMessage.textContent = mood.message;
  moodResult.dataset.mood = moodName;

  if (moodResult.hidden) {
    moodResult.hidden = false;
    window.requestAnimationFrame(() => moodResult.classList.add("is-visible"));
  }
}

const analyzeButton = document.querySelector("#analyze-button");
const analyzeButtonLabel = document.querySelector("#analyze-button-label");
const analyzeButtonIcon = document.querySelector("#analyze-button-icon");
const journalText = document.querySelector("#journal-text");
const journalMessage = document.querySelector("#journal-message");

// TEMPORARY - replace with Hugging Face emotion model later
async function analyzeMood(text) {
  const normalizedText = text.toLowerCase();
  const keywordsByMood = {
    joy: ["happy", "great", "good", "excited", "love", "amazing", "glad", "proud", "fun"],
    sadness: ["sad", "cry", "lonely", "down", "hurt", "miss", "depressed", "tired of", "rain"],
    anger: ["angry", "mad", "hate", "furious", "annoyed", "upset", "frustrated"],
    fear: ["scared", "afraid", "anxious", "nervous", "worried", "panic", "stress"],
    surprise: ["surprised", "shocked", "wow", "unexpected", "suddenly"],
    disgust: ["disgusting", "gross", "nasty", "sick of", "awful"]
  };

  for (const [mood, keywords] of Object.entries(keywordsByMood)) {
    if (keywords.some((keyword) => normalizedText.includes(keyword))) {
      return mood;
    }
  }

  return "neutral";
}

// Validate the entry, show a brief loading state, and render its mood result.
analyzeButton.addEventListener("click", async () => {
  const entry = journalText.value.trim();
  if (!entry) {
    journalMessage.textContent = "Write a few words first 💜";
    journalMessage.hidden = false;
    journalText.focus();
    return;
  }

  journalMessage.textContent = "";
  journalMessage.hidden = true;
  analyzeButton.disabled = true;
  analyzeButtonLabel.textContent = "Analyzing... ✨";
  analyzeButtonIcon.hidden = true;

  try {
    const mood = await analyzeMood(entry);
    await new Promise((resolve) => window.setTimeout(resolve, 1000));
    showMood(mood);
    moodResult.scrollIntoView({ behavior: "smooth", block: "nearest" });
  } finally {
    analyzeButton.disabled = false;
    analyzeButtonLabel.textContent = "Analyze my mood";
    analyzeButtonIcon.hidden = false;
  }
});
