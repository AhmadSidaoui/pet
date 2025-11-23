const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = 3000;
const CSV_FILE = path.join(__dirname, "timestamps.csv");

app.use(cors());
app.use(bodyParser.json());

// Helper to read CSV
function readCSV() {
  if (!fs.existsSync(CSV_FILE)) return [];
  const data = fs.readFileSync(CSV_FILE, "utf8");
  return data
    .trim()
    .split("\n")
    .slice(1)
    .map((line) => {
      const [id, time, date] = line.split(",");
      return { id: parseInt(id), time: parseFloat(time), date };
    });
}


// Helper to write CSV
function writeCSV(data) {
  const csv = "id,time,date\n" + data.map((d) => `${d.id},${d.time},${d.date}`).join("\n");
  fs.writeFileSync(CSV_FILE, csv, "utf8");
}


// Get all timestamps
app.get("/timestamps", (req, res) => {
  res.json(readCSV());
});

// Add a timestamp
// Add a timestamp
app.post("/timestamps", (req, res) => {
  const { time } = req.body;
  const data = readCSV();
  const id = data.length ? data[data.length - 1].id + 1 : 1;

  const date = new Date().toISOString(); // ISO format timestamp
  data.push({ id, time, date });
  writeCSV(data);
  res.json({ success: true, id, time, date });
});


// Delete a timestamp
app.delete("/timestamps/:id", (req, res) => {
  const id = parseInt(req.params.id);
  let data = readCSV();
  data = data.filter((t) => t.id !== id);
  writeCSV(data);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});


























// const express = require("express");
// const fs = require("fs");
// const path = require("path");
// const bodyParser = require("body-parser");
// const cors = require("cors");
// const fetch = require("node-fetch"); // For calling Bunny Stream API

// const app = express();
// const PORT = 3000;

// const CSV_FILE = path.join(__dirname, "timestamps.csv");
// const VIDEOS_FILE = path.join(__dirname, "videos.json");

// app.use(cors());
// app.use(bodyParser.json());

// // Bunny API Key and Library ID
// const BUNNY_API_KEY = "df07a569-4a62-49df-b9d24b2fe698-f7c3-41e6";
// const BUNNY_LIBRARY_ID = "547925";
// const BUNNY_API_URL = `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos`;

// // --- CSV helpers ---
// function readCSV() {
// if (!fs.existsSync(CSV_FILE)) return [];
// const data = fs.readFileSync(CSV_FILE, "utf8");
// return data
// .trim()
// .split("\n")
// .slice(1)
// .map((line) => {
// const [id, videoId, time, date] = line.split(",");
// return { id: parseInt(id), videoId, time: parseFloat(time), date };
// });
// }

// function writeCSV(data) {
// const csv = "id,videoId,time,date\n" + data.map((d) => `${d.id},${d.videoId},${d.time},${d.date}`).join("\n");
// fs.writeFileSync(CSV_FILE, csv, "utf8");
// }

// // --- Videos JSON helpers ---
// function readVideos() {
// if (!fs.existsSync(VIDEOS_FILE)) return [];
// return JSON.parse(fs.readFileSync(VIDEOS_FILE, "utf8"));
// }

// function writeVideos(data) {
// fs.writeFileSync(VIDEOS_FILE, JSON.stringify(data, null, 2), "utf8");
// }

// // --- Fetch video list from Bunny Stream API ---
// async function fetchBunnyVideos() {
// const res = await fetch(BUNNY_API_URL, {
// headers: { AccessKey: BUNNY_API_KEY }
// });
// if (!res.ok) throw new Error("Failed to fetch Bunny videos");
// const json = await res.json();
// // Store locally
// const videos = json.items.map(v => ({ id: v.id, title: v.title, playbackUrl: v.playbackUrl }));
// writeVideos(videos);
// return videos;
// }

// // --- API endpoints ---

// // List videos
// app.get("/videos", async (req, res) => {
// try {
// const videos = await fetchBunnyVideos();
// res.json(videos);
// } catch (err) {
// res.status(500).json({ error: err.message });
// }
// });

// // List timestamps
// app.get("/timestamps", (req, res) => {
// res.json(readCSV());
// });

// // Add timestamp (associating with a videoId)
// app.post("/timestamps", (req, res) => {
// const { videoId, time } = req.body;
// if (!videoId || time === undefined) return res.status(400).json({ error: "videoId and time required" });

// const data = readCSV();
// const id = data.length ? data[data.length - 1].id + 1 : 1;
// const date = new Date().toISOString();
// data.push({ id, videoId, time, date });
// writeCSV(data);

// res.json({ success: true, id, videoId, time, date });
// });

// // Delete timestamp
// app.delete("/timestamps/:id", (req, res) => {
// const id = parseInt(req.params.id);
// let data = readCSV();
// data = data.filter((t) => t.id !== id);
// writeCSV(data);
// res.json({ success: true });
// });

// app.listen(PORT, () => {
// console.log(`Server running at http://localhost:${PORT}`);
// });
