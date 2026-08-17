/* ===== Ranya Tajmer — script.js ===== */

// --- Koordinate gradova na mini mapi (SVG viewBox 0 0 400 160, nije geografski precizno) ---
const cityCoords = {
  "Mostar":          { x: 40,  y: 140 },
  "Split":           { x: 25,  y: 110 },
  "Berlin":          { x: 345, y: 20  },
  "Wolfsburg":       { x: 305, y: 28  },
  "Bad Langensalza": { x: 265, y: 45  },
  "Frankfurt":       { x: 225, y: 65  },
  "Sarajevo":        { x: 65,  y: 128 }
};

// --- Raspored putovanja (sva vremena su lokalna njemačka/bosanska vremena, CEST +02:00) ---
const schedule = [
  { start: "2026-08-18T07:00:00+02:00", end: "2026-08-18T09:00:00+02:00", text: "Na putu: Mostar → Split", from: "Mostar", to: "Split" },
  { start: "2026-08-18T09:00:00+02:00", end: "2026-08-18T11:20:00+02:00", text: "U Splitu, čeka let za Berlin", at: "Split" },
  { start: "2026-08-18T11:20:00+02:00", end: "2026-08-18T13:40:00+02:00", text: "U letu: Split → Berlin", from: "Split", to: "Berlin" },
  { start: "2026-08-18T13:40:00+02:00", end: "2026-08-22T08:47:00+02:00", text: "U Berlinu 🇩🇪", at: "Berlin" },
  { start: "2026-08-22T08:47:00+02:00", end: "2026-08-22T09:52:00+02:00", text: "Na putu: Berlin → Wolfsburg", from: "Berlin", to: "Wolfsburg" },
  { start: "2026-08-22T09:52:00+02:00", end: "2026-08-22T18:04:00+02:00", text: "U Wolfsburgu", at: "Wolfsburg" },
  { start: "2026-08-22T18:04:00+02:00", end: "2026-08-22T19:12:00+02:00", text: "Na putu: Wolfsburg → Berlin", from: "Wolfsburg", to: "Berlin" },
  { start: "2026-08-22T19:12:00+02:00", end: "2026-08-25T12:30:00+02:00", text: "U Berlinu 🇩🇪", at: "Berlin" },
  { start: "2026-08-25T12:30:00+02:00", end: "2026-08-25T17:00:00+02:00", text: "Na putu: Berlin → Bad Langensalza", from: "Berlin", to: "Bad Langensalza" },
  { start: "2026-08-25T17:00:00+02:00", end: "2026-08-27T12:00:00+02:00", text: "U Bad Langensalzi", at: "Bad Langensalza" },
  { start: "2026-08-27T12:00:00+02:00", end: "2026-08-27T15:00:00+02:00", text: "Na putu: Bad Langensalza → Frankfurt", from: "Bad Langensalza", to: "Frankfurt" },
  { start: "2026-08-27T15:00:00+02:00", end: "2026-08-27T20:40:00+02:00", text: "U Frankfurtu", at: "Frankfurt" },
  { start: "2026-08-27T20:40:00+02:00", end: "2026-08-27T22:25:00+02:00", text: "U letu: Frankfurt → Sarajevo", from: "Frankfurt", to: "Sarajevo" },
  { start: "2026-08-27T22:25:00+02:00", end: "2026-08-28T00:00:00+02:00", text: "U Sarajevu", at: "Sarajevo" },
  { start: "2026-08-28T00:00:00+02:00", end: "2026-08-28T02:30:00+02:00", text: "Na putu: Sarajevo → Mostar", from: "Sarajevo", to: "Mostar" }
];

const TRIP_START = new Date("2026-08-18T07:00:00+02:00");
const GERMANY_ENTRY = new Date("2026-08-18T13:40:00+02:00");
const GERMANY_EXIT = new Date("2026-08-27T20:40:00+02:00");
const RETURN_HOME = new Date("2026-08-28T02:30:00+02:00");

// --- Pomoćna funkcija za formatiranje brojeva ---
function pad(n) {
  return String(Math.max(0, n)).padStart(2, "0");
}

function breakdown(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
}

function setTimer(prefix, ms) {
  const { days, hours, minutes, seconds } = breakdown(ms);
  document.getElementById(`${prefix}-days`).textContent = pad(days);
  document.getElementById(`${prefix}-hours`).textContent = pad(hours);
  document.getElementById(`${prefix}-minutes`).textContent = pad(minutes);
  document.getElementById(`${prefix}-seconds`).textContent = pad(seconds);
}

// --- Glavna funkcija koja se poziva svake sekunde ---
function tick() {
  const now = new Date();

  // 1) Tajmer: vrijeme provedeno u Njemačkoj
  const elapsedLabel = document.getElementById("elapsed-label");
  if (now < GERMANY_ENTRY) {
    elapsedLabel.textContent = "Put za Njemačku počinje za";
    setTimer("e", GERMANY_ENTRY - now);
  } else if (now < GERMANY_EXIT) {
    elapsedLabel.textContent = "Vrijeme provedeno u Njemačkoj";
    setTimer("e", now - GERMANY_ENTRY);
  } else {
    elapsedLabel.textContent = "Ukupno provedeno u Njemačkoj";
    setTimer("e", GERMANY_EXIT - GERMANY_ENTRY);
  }

  // 2) Tajmer: povratak u Mostar
  const countdownLabel = document.getElementById("countdown-label");
  if (now < RETURN_HOME) {
    countdownLabel.textContent = "Povratak u Mostar za";
    setTimer("c", RETURN_HOME - now);
  } else {
    countdownLabel.textContent = "Ranya je stigla kući! 🏡";
    setTimer("c", 0);
  }

  // 3) Trenutna lokacija
  const locationText = document.getElementById("location-text");
  if (now < TRIP_START) {
    locationText.textContent = "U Mostaru, priprema za put ✨";
  } else if (now >= RETURN_HOME) {
    locationText.textContent = "Kod kuće, u Mostaru ❤";
  } else {
    const current = schedule.find(seg => now >= new Date(seg.start) && now < new Date(seg.end));
    locationText.textContent = current ? current.text : "U tranzitu...";
  }

  // 4) Progress bar cijelog putovanja
  updateProgressBar(now);

  // 5) Mapa — pozicija tačke koja predstavlja Ranyu
  updateMapDot(now);

  // 6) Brojač "zagrljaja koji fale"
  updateHugCounter(now);

  // 7) Konfeti kad stigne kući
  checkArrivalConfetti(now);

  // 8) Živi sat — trenutno vrijeme u Njemačkoj/Mostaru (ista vremenska zona)
  updateClock(now);

  updateBackground(now);
}

// --- Živi sat ---
function updateClock(now) {
  const el = document.getElementById("clock-text");
  const timeStr = new Intl.DateTimeFormat("bs-BA", {
    timeZone: "Europe/Berlin",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).format(now);
  el.textContent = `🕐 Lokalno vrijeme: ${timeStr}`;
}

// --- Progress bar ---
function updateProgressBar(now) {
  const total = RETURN_HOME - TRIP_START;
  const elapsed = now - TRIP_START;
  const percent = Math.min(100, Math.max(0, (elapsed / total) * 100));
  document.getElementById("progress-fill").style.width = `${percent}%`;
  document.getElementById("progress-percent").textContent = percent.toFixed(1);
}

// --- Mapa putovanja ---
function updateMapDot(now) {
  const dot = document.getElementById("travel-dot");
  let coord;

  if (now < TRIP_START) {
    coord = cityCoords["Mostar"];
  } else if (now >= RETURN_HOME) {
    coord = cityCoords["Mostar"];
  } else {
    const seg = schedule.find(s => now >= new Date(s.start) && now < new Date(s.end));
    if (!seg) {
      coord = cityCoords["Mostar"];
    } else if (seg.at) {
      coord = cityCoords[seg.at];
    } else {
      // U putovanju: interpolacija između dva grada prema proteklom vremenu segmenta
      const segStart = new Date(seg.start);
      const segEnd = new Date(seg.end);
      const fraction = (now - segStart) / (segEnd - segStart);
      const from = cityCoords[seg.from];
      const to = cityCoords[seg.to];
      coord = {
        x: from.x + (to.x - from.x) * fraction,
        y: from.y + (to.y - from.y) * fraction
      };
    }
  }

  dot.setAttribute("cx", coord.x);
  dot.setAttribute("cy", coord.y);
}

function renderCityMarkers() {
  const group = document.getElementById("city-markers");
  const uniqueCities = [...new Set(Object.keys(cityCoords))];
  uniqueCities.forEach(name => {
    const { x, y } = cityCoords[name];
    const wrapper = document.createElementNS("http://www.w3.org/2000/svg", "g");
    wrapper.setAttribute("class", "city-marker");

    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", x);
    circle.setAttribute("cy", y);
    circle.setAttribute("r", 3);

    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("x", x + 6);
    label.setAttribute("y", y + 3);
    label.textContent = name;

    wrapper.appendChild(circle);
    wrapper.appendChild(label);
    group.appendChild(wrapper);
  });
}

// --- Brojač zagrljaja koji fale (raste svake sekunde od polaska iz Mostara) ---
function updateHugCounter(now) {
  const el = document.getElementById("hug-count");
  const referenceEnd = now < RETURN_HOME ? now : RETURN_HOME;
  const secondsApart = Math.max(0, Math.floor((referenceEnd - TRIP_START) / 1000));
  // Jedan "dužan zagrljaj" svakih 15 sekundi razdvojenosti
  const hugs = Math.floor(secondsApart / 15);
  el.textContent = hugs.toLocaleString("bs-BA");
}

// --- Konfeti / padajuća srca kad se Ranya vrati kući ---
let confettiTriggered = false;
function checkArrivalConfetti(now) {
  if (now >= RETURN_HOME && !confettiTriggered) {
    confettiTriggered = true;
    launchConfetti();
  }
}

function launchConfetti() {
  const container = document.getElementById("confetti-container");
  const hearts = ["❤️", "💛", "💕", "✨"];
  const count = 60;

  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const span = document.createElement("span");
      span.className = "confetti-heart";
      span.textContent = hearts[Math.floor(Math.random() * hearts.length)];
      span.style.left = `${Math.random() * 100}vw`;
      span.style.fontSize = `${14 + Math.random() * 18}px`;
      span.style.animationDuration = `${3 + Math.random() * 3}s`;
      container.appendChild(span);
      setTimeout(() => span.remove(), 7000);
    }, i * 80);
  }
}

// --- Parallax pozadina: oblačići (dan) / zvijezde (noć) ---
function renderParallax(now) {
  const layer = document.getElementById("parallax-layer");
  layer.innerHTML = "";
  const hour = getBerlinHour(now);
  const isNight = hour < 5 || hour >= 20;
  const count = 18;

  for (let i = 0; i < count; i++) {
    const el = document.createElement("div");
    el.className = isNight ? "drift star" : "drift cloud";
    const size = isNight ? 2 + Math.random() * 2 : 40 + Math.random() * 80;
    el.style.width = `${size}px`;
    el.style.height = `${isNight ? size : size * 0.4}px`;
    el.style.top = `${Math.random() * 90}%`;

    if (isNight) {
      el.style.left = `${Math.random() * 100}%`;
      el.style.animationDuration = `${2 + Math.random() * 3}s`;
      el.style.animationDelay = `${Math.random() * 3}s`;
    } else {
      el.style.animationDuration = `${40 + Math.random() * 40}s`;
      el.style.animationDelay = `${-Math.random() * 40}s`;
    }
    layer.appendChild(el);
  }
}

// --- Pozadina koja se mijenja prema dobu dana u Njemačkoj (Europe/Berlin) ---
function getBerlinHour(date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Berlin",
    hour: "2-digit",
    hour12: false
  }).formatToParts(date);
  const hourPart = parts.find(p => p.type === "hour");
  return parseInt(hourPart.value, 10);
}

function updateBackground(now) {
  const hour = getBerlinHour(now);
  const bg = document.getElementById("bg-layer");
  let colors;

  if (hour >= 5 && hour < 8) {
    // Zora
    colors = ["#2c3e50", "#e8a87c", "#f6d365"];
  } else if (hour >= 8 && hour < 17) {
    // Dan
    colors = ["#4facfe", "#00c9ff", "#a1c4fd"];
  } else if (hour >= 17 && hour < 20) {
    // Veče
    colors = ["#ff7e5f", "#feb47b", "#c38d9e"];
  } else {
    // Noć
    colors = ["#0f2027", "#203a43", "#2c5364"];
  }

  bg.style.background = `linear-gradient(160deg, ${colors[0]}, ${colors[1]} 55%, ${colors[2]})`;
}

// --- Theme toggle (svijetla / tamna tema) ---
const themeToggle = document.getElementById("theme-toggle");
const themeIcon = document.getElementById("theme-icon");
const savedTheme = localStorage.getItem("ranya-theme") || "dark";

function applyTheme(theme) {
  if (theme === "light") {
    document.documentElement.setAttribute("data-theme", "light");
    themeIcon.textContent = "☀️";
  } else {
    document.documentElement.removeAttribute("data-theme");
    themeIcon.textContent = "🌙";
  }
}

applyTheme(savedTheme);

themeToggle.addEventListener("click", () => {
  const isLight = document.documentElement.getAttribute("data-theme") === "light";
  const newTheme = isLight ? "dark" : "light";
  applyTheme(newTheme);
  localStorage.setItem("ranya-theme", newTheme);
});

// --- Pokretanje ---
renderCityMarkers();
renderParallax(new Date());
tick();
setInterval(tick, 1000);

// Parallax se ponovo generiše kad se promijeni doba dana (zora/dan/veče/noć)
let lastPeriod = null;
setInterval(() => {
  const now = new Date();
  const hour = getBerlinHour(now);
  const period = hour < 5 ? "night" : hour < 8 ? "dawn" : hour < 17 ? "day" : hour < 20 ? "evening" : "night";
  if (period !== lastPeriod) {
    lastPeriod = period;
    renderParallax(now);
  }
}, 30000);