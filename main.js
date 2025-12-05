// ------------------------------------------------------------------- //
// ------------------------------------------------------------------- //
// ---------- PASSWORD PROTECTION ----------
const passwordOverlay = document.getElementById("passwordOverlay");
const passwordInput = document.getElementById("passwordInput");
const submitPassword = document.getElementById("submitPassword");
const passwordError = document.getElementById("passwordError");
const mainContent = document.getElementById("mainContent");
const CORRECT_PASSWORD = "123321";

// Check if already authenticated
if (sessionStorage.getItem("authenticated") === "true") {
  passwordOverlay.style.display = "none";
  mainContent.style.display = "block";
} else {
  passwordOverlay.style.display = "flex";
  mainContent.style.display = "none";
}

// Password submission
submitPassword.addEventListener("click", checkPassword);
passwordInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    checkPassword();
  }
});

function checkPassword() {
  if (passwordInput.value === CORRECT_PASSWORD) {
    sessionStorage.setItem("authenticated", "true");
    passwordOverlay.style.display = "none";
    mainContent.style.display = "block";
  } else {
    passwordError.style.display = "block";
    passwordInput.value = "";
    setTimeout(() => passwordInput.focus(), 10);
  }
}

// ------------------------------------------------------------------- //
// ------------------------------------------------------------------- //
// ---------- VIDEO SWITCHER ----------
const frames = document.querySelectorAll(".videoFrame")
// const videoFrame = document.querySelector(".videoFrame");
const prevBtn = document.getElementById("prevVideo");
const prevBtn2 = document.getElementById("prevVideo2");
const nextBtn2 = document.getElementById("nextVideo2");
const nextBtn = document.getElementById("nextVideo");

// List of video embed URLs - replace with your actual video IDs
// const videos = [
//   "https://iframe.mediadelivery.net/embed/547925/9e7fd0f9-ef68-4a71-9f76-e8f81b01fed1?autoplay=true&loop=true&muted=true&preload=false&responsive=true",
//   "https://iframe.mediadelivery.net/embed/547925/569005f8-1f34-4898-9f6d-e26a5dabbb3b?autoplay=true&loop=true&muted=true&preload=false&responsive=true"
// ];


let videos = [];
const LIBRARY_ID = "555468";//"548916";
const ACCESS_KEY = "7308053d-7819-4f32-aba6dffb9a38-a0ad-4574";

async function loadVideosFromBunny() {
  const response = await fetch(
    `https://video.bunnycdn.com/library/${LIBRARY_ID}/videos`,
    {
      headers: { "AccessKey": ACCESS_KEY }
    }
  );

  const data = await response.json();

  const bunnyVideoUrls = data.items.map(v =>
    `https://iframe.mediadelivery.net/embed/${LIBRARY_ID}/${v.guid}?autoplay=true&loop=true&muted=true&preload=false&responsive=true`
  );

  // 🔥 Add Bunny videos to the existing list (keep handlers)
  videos.push(...bunnyVideoUrls);
}

// Load videos from Bunny CDN on startup
(async () => {
  await loadVideosFromBunny();
})();

let currentVideo = 0;

// Load video by changing iframe src
function loadVideo(index, frame) {
  frame.src = videos[index];
  currentVideo = index;
}

// Initialize first video
if (videos.length > 0) {
  loadVideo(0, frames[0]);
  loadVideo(0, frames[1]);
}

// Next and previous button click function
prevBtn.addEventListener("click", () => {
  currentVideo = (currentVideo - 1 + videos.length) % videos.length;
  loadVideo(currentVideo,frames[0]);
});

nextBtn.addEventListener("click", () => {
  currentVideo = (currentVideo + 1) % videos.length;
  loadVideo(currentVideo, frames[0]);
});

prevBtn2.addEventListener("click", () => {
  currentVideo = (currentVideo - 1 + videos.length) % videos.length;
  loadVideo(currentVideo, frames[1]);
});

nextBtn2.addEventListener("click", () => {
  currentVideo = (currentVideo + 1) % videos.length;
  loadVideo(currentVideo, frames[1]);
});

// // Optional: Keyboard navigation
// document.addEventListener("keydown", (e) => {
//   if (e.key === "ArrowLeft") {
//     prevBtn.click();
//   } else if (e.key === "ArrowRight") {
//     nextBtn.click();
//   }
// });

// ------------------------------------------------------------------- //
// ------------------------------------------------------------------- //

// ---------- START/STOP TIMER WITH CSV BACKEND ----------
const currentTimer = document.getElementById("currentTimer");
const timestampTableBody = document.querySelector("#timestampTable tbody");
let timer = 0;
let timerInterval = null;

// Update timer display
function updateTimerDisplay() {
  currentTimer.textContent = timer.toFixed(2);
}

// Start timer
function startTimer() {
  if (!timerInterval) {
    const startTime = Date.now() - timer * 1000;
    timerInterval = setInterval(() => {
      timer = (Date.now() - startTime) / 1000;
      updateTimerDisplay();
    }, 50);
  }
}

// Stop timer and save to backend CSV
function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

// Save timestamp to backend
function saveTimestamp(time) {
  fetch("http://localhost:3000/timestamps", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ time }),
  }).then(() => loadTimestamps());
}

// Delete timestamp from backend
function deleteTimestamp(id) {
  fetch(`http://localhost:3000/timestamps/${id}`, { method: "DELETE" })
    .then(() => loadTimestamps());
}

// Render table
function renderTable(timestamps) {
  timestampTableBody.innerHTML = "";
  timestamps.forEach((t, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${t.time.toFixed(2)}</td>
      <td>${new Date(t.date).toLocaleString()}</td>
      <td><button class="delete-btn" data-id="${t.id}">Delete</button></td>
    `;
    timestampTableBody.appendChild(tr);
  });
  renderChart(timestamps);
}

// Load timestamps from backend CSV
function loadTimestamps() {
  fetch("http://localhost:3000/timestamps")
    .then(res => res.json())
    .then(data => renderTable(data));
}

// Handle delete button click
timestampTableBody.addEventListener("click", (e) => {
  if (e.target.classList.contains("delete-btn")) {
    const id = e.target.getAttribute("data-id");
    deleteTimestamp(id);
  }
});

// Spacebar toggles timer
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();
    if (timerInterval) stopTimer();
    else startTimer();
  }
  if (e.key === "s") {
    saveTimestamp(timer);
  }
  if (e.key === "r") {
    clearInterval(timerInterval);
    timerInterval = null;
    timer = 0;
    updateTimerDisplay();
  }
  if (e.key === "c") {
    saveTimestamp(timer);
    clearInterval(timerInterval);
    timerInterval = null;
    timer = 0;
    updateTimerDisplay();
  }
});

// Load timestamps on page load
loadTimestamps();

let chart; // global chart variable

function renderChart(timestamps) {
  const ctx = document.getElementById("durationChart").getContext("2d");

  const labels = timestamps.map(t => new Date(t.date).toLocaleTimeString());
  const data = timestamps.map(t => t.time / 60); // seconds → minutes

  const prejacSeconds = 180;
  const prejacMinutes = prejacSeconds / 60;

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "Duration (minutes)",
        data: data,
        fill: true,
        backgroundColor: function(context) {
          const value = context.dataset.data[context.dataIndex];
          return value <= prejacMinutes ? 'rgba(255,0,0,0.1)' : 'rgba(0,0,255,0.1)';
        },
        borderColor: "blue",
        tension: 0.2
      }]
    },
    options: {
      plugins: {
        annotation: {
          annotations: {
            prejacLine: {
              type: 'line',
              yMin: prejacMinutes,
              yMax: prejacMinutes,
              borderColor: 'red',
              borderWidth: 2,
              label: {
                display: true,
                content: 'prejac',
                position: 'center',
                color: 'red',
                yAdjust: -10,
                font: { weight: 'bold', size: 12 },
                backgroundColor: 'rgba(0,0,0,0)'
              }
            },
            shadedArea: {
              type: 'box',
              yMin: 0,
              yMax: prejacMinutes,
              backgroundColor: 'rgba(255,0,0,0.1)',
            }
          }
        }
      },
      scales: {
        x: { title: { display: true, text: "Timestamp" } },
        y: { title: { display: true, text: "Duration (minutes)" }, beginAtZero: true }
      }
    },
    plugins: [Chart.registry.getPlugin('annotation')]
  });
}