// Mood names and their display labels are shared by the picker and legend.
const monthMoodOptions = [
  { name: "Joy", key: "joy" },
  { name: "Sadness", key: "sadness" },
  { name: "Anger", key: "anger" },
  { name: "Fear", key: "fear" },
  { name: "Surprise", key: "surprise" },
  { name: "Disgust", key: "disgust" },
  { name: "Neutral", key: "neutral" }
];

const monthToggle = document.querySelector("#month-toggle");
const monthCalendarPanel = document.querySelector("#month-calendar-panel");
const monthTitle = document.querySelector("#month-title");
const monthDaysGrid = document.querySelector("#month-days-grid");
const monthLegend = document.querySelector("#month-legend");
const today = new Date();
let displayedMonth = new Date(today.getFullYear(), today.getMonth(), 1);
let monthData = loadMonthData(displayedMonth);
let todayHeartPopPending = false;

// Keep month storage keys in the yyyy-mm format for easy future syncing.
function getMonthStorageKey(monthDate) {
  const monthNumber = String(monthDate.getMonth() + 1).padStart(2, "0");
  return `moodjournal_month_${monthDate.getFullYear()}-${monthNumber}`;
}

// Keep automatic-color metadata separate so the existing day-to-mood data stays unchanged.
function getAutomaticDaysStorageKey(monthDate) {
  const monthNumber = String(monthDate.getMonth() + 1).padStart(2, "0");
  return `moodjournal_month_auto_${monthDate.getFullYear()}-${monthNumber}`;
}

// Load one month of day-to-mood data from local storage.
function loadMonthData(monthDate) {
  const serializedData = window.localStorage.getItem(getMonthStorageKey(monthDate));
  if (serializedData === null) {
    return {};
  }

  const parsedData = JSON.parse(serializedData);
  if (!parsedData || typeof parsedData !== "object" || Array.isArray(parsedData)) {
    throw new TypeError(`Saved mood data for ${getMonthStorageKey(monthDate)} must be an object.`);
  }
  return parsedData;
}

// Save the selected day-to-mood mapping for one month.
function saveMonthData(monthDate, data) {
  window.localStorage.setItem(getMonthStorageKey(monthDate), JSON.stringify(data));
}

function loadAutomaticallyColoredDays(monthDate) {
  const serializedDays = window.localStorage.getItem(getAutomaticDaysStorageKey(monthDate));
  if (serializedDays === null) {
    return new Set();
  }

  const parsedDays = JSON.parse(serializedDays);
  if (!Array.isArray(parsedDays) || parsedDays.some((day) => typeof day !== "string")) {
    throw new TypeError(`Automatic mood markers for ${getAutomaticDaysStorageKey(monthDate)} must be an array of day numbers.`);
  }
  return new Set(parsedDays);
}

function saveAutomaticallyColoredDays(monthDate, days) {
  const storageKey = getAutomaticDaysStorageKey(monthDate);
  if (days.size === 0) {
    window.localStorage.removeItem(storageKey);
    return;
  }
  window.localStorage.setItem(storageKey, JSON.stringify(Array.from(days)));
}

function removeAutomaticMoodMarker(monthDate, dayNumber) {
  const automaticDays = loadAutomaticallyColoredDays(monthDate);
  automaticDays.delete(String(dayNumber));
  saveAutomaticallyColoredDays(monthDate, automaticDays);
}

// Apply AI mood colors only when today's color is empty or was previously set automatically.
function applyDetectedMoodToToday(moodKey, { force = false } = {}) {
  const mood = monthMoodOptions.find((option) => option.key === moodKey);
  if (!mood) {
    throw new RangeError(`Unknown detected mood: ${moodKey}`);
  }

  const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const dayKey = String(today.getDate());
  const currentMonthData = loadMonthData(currentMonth);
  const automaticDays = loadAutomaticallyColoredDays(currentMonth);
  const existingMood = currentMonthData[dayKey];
  if (existingMood && !automaticDays.has(dayKey) && !force) {
    return { applied: false, manual: true, existingMood };
  }

  currentMonthData[dayKey] = mood.name;
  saveMonthData(currentMonth, currentMonthData);
  if (force) {
    automaticDays.delete(dayKey);
  } else {
    automaticDays.add(dayKey);
  }
  saveAutomaticallyColoredDays(currentMonth, automaticDays);

  const isDisplayedMonth = displayedMonth.getFullYear() === currentMonth.getFullYear()
    && displayedMonth.getMonth() === currentMonth.getMonth();
  todayHeartPopPending = true;
  if (isDisplayedMonth) {
    monthData = currentMonthData;
    if (monthToggle.getAttribute("aria-expanded") === "true") {
      renderMonthCalendar();
    }
  }

  return { applied: true, mood: mood.name };
}

window.applyDetectedMoodToToday = applyDetectedMoodToToday;

// Close any open day palette and reset its cell's stacking order.
function closeOpenPalettes() {
  monthDaysGrid.querySelectorAll(".calendar-day.palette-open").forEach((dayCell) => {
    dayCell.classList.remove("palette-open");
    const palette = dayCell.querySelector(".month-palette");
    const heartButton = dayCell.querySelector(".calendar-heart-button");
    palette.hidden = true;
    heartButton.setAttribute("aria-expanded", "false");
  });
}

// Build a small, labeled color picker for one calendar day.
function createMoodPalette(dayNumber, columnNumber) {
  const palette = document.createElement("div");
  palette.className = "month-palette";
  palette.hidden = true;
  palette.setAttribute("role", "group");
  palette.setAttribute("aria-label", `Choose a mood for day ${dayNumber}`);

  if (columnNumber <= 2) {
    palette.classList.add("align-left");
  } else if (columnNumber >= 4) {
    palette.classList.add("align-right");
  }

  monthMoodOptions.forEach((mood) => {
    const option = document.createElement("button");
    option.className = "month-palette-option";
    option.dataset.mood = mood.key;
    option.type = "button";
    option.setAttribute("aria-label", mood.name);

    const swatch = document.createElement("span");
    swatch.className = "palette-swatch";
    swatch.setAttribute("aria-hidden", "true");
    const label = document.createElement("span");
    label.textContent = mood.name;
    option.append(swatch, label);

    option.addEventListener("click", () => {
      monthData[String(dayNumber)] = mood.name;
      saveMonthData(displayedMonth, monthData);
      removeAutomaticMoodMarker(displayedMonth, dayNumber);
      renderMonthCalendar();
    });
    palette.append(option);
  });

  const clearButton = document.createElement("button");
  clearButton.className = "month-palette-clear";
  clearButton.type = "button";
  clearButton.textContent = "Clear";
  clearButton.addEventListener("click", () => {
    delete monthData[String(dayNumber)];
    saveMonthData(displayedMonth, monthData);
    removeAutomaticMoodMarker(displayedMonth, dayNumber);
    renderMonthCalendar();
  });
  palette.append(clearButton);
  return palette;
}

// Render the selected month with Monday-first alignment and today's highlight.
function renderMonthCalendar() {
  const year = displayedMonth.getFullYear();
  const monthIndex = displayedMonth.getMonth();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const leadingDays = (new Date(year, monthIndex, 1).getDay() + 6) % 7;

  monthTitle.textContent = displayedMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric"
  });
  monthDaysGrid.replaceChildren();

  for (let blankDay = 0; blankDay < leadingDays; blankDay += 1) {
    const emptyCell = document.createElement("div");
    emptyCell.className = "calendar-empty-day";
    emptyCell.setAttribute("role", "gridcell");
    emptyCell.setAttribute("aria-hidden", "true");
    monthDaysGrid.append(emptyCell);
  }

  for (let dayNumber = 1; dayNumber <= daysInMonth; dayNumber += 1) {
    const columnNumber = (leadingDays + dayNumber - 1) % 7;
    const dayCell = document.createElement("div");
    dayCell.className = "calendar-day";
    dayCell.setAttribute("role", "gridcell");

    const isToday = year === today.getFullYear()
      && monthIndex === today.getMonth()
      && dayNumber === today.getDate();
    if (isToday) {
      dayCell.classList.add("is-today");
    }

    const heartButton = document.createElement("button");
    const storedMood = monthData[String(dayNumber)];
    const selectedMood = monthMoodOptions.find((mood) => mood.name === storedMood);
    if (storedMood && !selectedMood) {
      throw new RangeError(`Unknown saved mood "${storedMood}" for day ${dayNumber}.`);
    }
    heartButton.className = "calendar-heart-button";
    heartButton.type = "button";
    heartButton.textContent = selectedMood ? "♥" : "♡";
    heartButton.setAttribute("aria-haspopup", "true");
    heartButton.setAttribute("aria-expanded", "false");
    heartButton.setAttribute("aria-pressed", String(Boolean(selectedMood)));
    heartButton.setAttribute(
      "aria-label",
      selectedMood ? `${selectedMood.name} mood for day ${dayNumber}` : `Set mood for day ${dayNumber}`
    );
    if (selectedMood) {
      heartButton.dataset.mood = selectedMood.key;
      heartButton.title = selectedMood.name;
    } else {
      heartButton.title = `Set mood for day ${dayNumber}`;
    }
    if (isToday && todayHeartPopPending && monthToggle.getAttribute("aria-expanded") === "true") {
      heartButton.classList.add("is-auto-pop");
      heartButton.addEventListener("animationend", (event) => {
        if (event.animationName === "today-heart-pop") {
          heartButton.classList.remove("is-auto-pop");
        }
      }, { once: true });
      todayHeartPopPending = false;
    }

    const palette = createMoodPalette(dayNumber, columnNumber);
    heartButton.addEventListener("click", () => {
      const shouldOpen = palette.hidden;
      closeOpenPalettes();
      if (shouldOpen) {
        dayCell.classList.add("palette-open");
        palette.hidden = false;
        heartButton.setAttribute("aria-expanded", "true");
      }
    });

    const dayLabel = document.createElement("span");
    dayLabel.className = "calendar-day-number";
    dayLabel.textContent = String(dayNumber);
    dayCell.append(heartButton, palette, dayLabel);
    monthDaysGrid.append(dayCell);
  }
}

// Render the mood legend with the same names used in the day palette.
function renderMonthLegend() {
  monthMoodOptions.forEach((mood) => {
    const item = document.createElement("span");
    item.className = "month-legend-item";
    item.dataset.mood = mood.key;
    item.setAttribute("role", "listitem");

    const swatch = document.createElement("span");
    swatch.className = "month-legend-swatch";
    swatch.setAttribute("aria-hidden", "true");
    const label = document.createElement("span");
    label.textContent = mood.name;
    item.append(swatch, label);
    monthLegend.append(item);
  });
}

// Expand or collapse the calendar panel with accessible state updates.
monthToggle.addEventListener("click", () => {
  const isOpening = monthToggle.getAttribute("aria-expanded") !== "true";
  monthToggle.setAttribute("aria-expanded", String(isOpening));
  monthToggle.textContent = isOpening ? "Close" : "Open";
  monthCalendarPanel.classList.toggle("is-open", isOpening);
  monthCalendarPanel.setAttribute("aria-hidden", String(!isOpening));
  monthCalendarPanel.inert = !isOpening;
  if (isOpening) {
    renderMonthCalendar();
  }
});

// Navigate between months and load each month's saved guest data.
document.querySelector("#month-previous").addEventListener("click", () => {
  displayedMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() - 1, 1);
  monthData = loadMonthData(displayedMonth);
  renderMonthCalendar();
});
document.querySelector("#month-next").addEventListener("click", () => {
  displayedMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() + 1, 1);
  monthData = loadMonthData(displayedMonth);
  renderMonthCalendar();
});

// Dismiss an open palette when clicking outside the calendar or pressing Escape.
document.addEventListener("click", (event) => {
  if (!monthDaysGrid.contains(event.target)) {
    closeOpenPalettes();
  }
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeOpenPalettes();
  }
});

renderMonthLegend();
renderMonthCalendar();
