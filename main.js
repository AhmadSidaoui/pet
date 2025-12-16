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
let videos_2 = [];
const LIBRARY_ID = "548916"; //"555468";
const ACCESS_KEY = "15bc114d-2d31-4f33-898b567a6dd8-62ad-4ef3";//"7308053d-7819-4f32-aba6dffb9a38-a0ad-4574";

const LIBRARY_ID_2 = "555468";
const ACCESS_KEY_2 = "7308053d-7819-4f32-aba6dffb9a38-a0ad-4574";

const TARGET_COLLECTION_ID = "c487e2ed-7694-4ea9-b852-455bde9c5828";

async function loadVideosFromBunny() {
  const response = await fetch(
    `https://video.bunnycdn.com/library/${LIBRARY_ID}/videos`,
    {
      headers: { "AccessKey": ACCESS_KEY }
    }
  );

  const data = await response.json();

  // 🔥 FILTER BY COLLECTION HERE
  const filteredVideos = data.items.filter(video =>
    video.collectionId === TARGET_COLLECTION_ID
  );

  const bunnyVideoUrls = filteredVideos.map(video =>
    `https://iframe.mediadelivery.net/embed/${LIBRARY_ID}/${video.guid}?autoplay=true&loop=true&muted=true&preload=false&responsive=true`
  );

  // reset + push
  videos.length = 0;
  videos.push(...bunnyVideoUrls);
}


const TARGET_COLLECTION_ID_2 = "d1bb4e35-8a22-454f-9178-485da9fb67d6";


async function loadVideosFromBunny_2() {
  const response = await fetch(
    `https://video.bunnycdn.com/library/${LIBRARY_ID}/videos`,
    {
      headers: { "AccessKey": ACCESS_KEY }
    }
  );

  const data = await response.json();

  // 🔥 FILTER BY COLLECTION HERE
  const filteredVideos_2 = data.items.filter(video =>
    video.collectionId === TARGET_COLLECTION_ID_2
  );

  const bunnyVideoUrls = filteredVideos_2.map(video =>
    `https://iframe.mediadelivery.net/embed/${LIBRARY_ID}/${video.guid}?autoplay=true&loop=true&muted=true&preload=false&responsive=true`
  );

  // reset + push
  videos_2.length = 0;
  videos_2.push(...bunnyVideoUrls);
}




// Load videos from Bunny CDN on startup
(async () => {
  await loadVideosFromBunny();
  await loadVideosFromBunny_2();
})();

let currentVideo = 0;

// Load video by changing iframe src
function loadVideo(index, frame, vid) {
  frame.src = vid[index];
  currentVideo = index;
}

// Initialize first video
if (videos.length > 0) {
  loadVideo(0, frames[0], videos);
}
if (videos_2.length > 0) {
  loadVideo(0, frames[1], videos_2);
}

// Next and previous button click function
prevBtn.addEventListener("click", () => {
  currentVideo = (currentVideo - 1 + videos.length) % videos.length;
  loadVideo(currentVideo,frames[0], videos);
});

nextBtn.addEventListener("click", () => {
  currentVideo = (currentVideo + 1) % videos.length;
  loadVideo(currentVideo, frames[0], videos);
});

prevBtn2.addEventListener("click", () => {
  currentVideo = (currentVideo - 1 + videos_2.length) % videos_2.length;
  loadVideo(currentVideo, frames[1], videos_2);
});

nextBtn2.addEventListener("click", () => {
  currentVideo = (currentVideo + 1) % videos_2.length;
  loadVideo(currentVideo, frames[1], videos_2);
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

