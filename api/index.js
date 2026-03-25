// require("dotenv").config();
// const express = require("express");
// const fs = require("fs");
// const cors = require("cors");
// const OpenAI = require("openai");

// const app = express();
// app.use(express.json());

// // 🔥 PROPER CORS CONFIGURATION
// const allowedOrigins = [
//   "http://localhost:3000",                      // local dev
//   "https://stately-praline-a35df9.netlify.app" // your Netlify frontend
// ];

// app.use(cors({
//   origin: function(origin, callback){
//     // allow requests with no origin (Postman, curl, server-to-server)
//     if(!origin) return callback(null, true);
//     if(!allowedOrigins.includes(origin)){
//       const msg = `The CORS policy for this site does not allow access from the specified Origin.`;
//       return callback(new Error(msg), false);
//     }
//     return callback(null, true);
//   },
//   methods: ["GET","POST","PUT","DELETE","OPTIONS"],
//   allowedHeaders: ["Content-Type"],
//   credentials: true
// }));

// // ✅ Remove app.options("*") — Express v5 does not allow wildcard like that

// app.use(express.static("public"));

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY
// });

// const FILE = "data.json";

// /* =========================
//    INIT FILE
// ========================= */
// if (!fs.existsSync(FILE)) {
//   fs.writeFileSync(FILE, JSON.stringify({ users: {} }, null, 2));
// }

// /* =========================
//    FILE HELPERS
// ========================= */
// function readData() {
//   let data = JSON.parse(fs.readFileSync(FILE, "utf-8"));
//   if (!data.users) {
//     data = { users: {} };
//     writeData(data);
//   }
//   return data;
// }

// function writeData(data) {
//   fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
// }

// /* =========================
//    AUTH ROUTES
// ========================= */
// // REGISTER
// app.post("/register", (req, res) => {
//   try {
//     const { email, password } = req.body;
//     if (!email || !password) return res.json({ error: "Missing fields" });

//     let data = readData();
//     if (data.users[email]) return res.json({ error: "User already exists" });

//     data.users[email] = { password, schedule: [] };
//     writeData(data);
//     res.json({ ok: true });
//   } catch (err) {
//     console.error("REGISTER ERROR:", err);
//     res.json({ error: "Register failed" });
//   }
// });

// // LOGIN
// app.post("/login", (req, res) => {
//   try {
//     const { email, password } = req.body;
//     let data = readData();

//     if (!data.users[email]) return res.json({ error: "User not found" });
//     if (data.users[email].password !== password) return res.json({ error: "Wrong password" });

//     res.json({ ok: true });
//   } catch (err) {
//     console.error("LOGIN ERROR:", err);
//     res.json({ error: "Login failed" });
//   }
// });

// /* =========================
//    SCHEDULE
// ========================= */
// function generateSchedule(subjects, hours) {
//   const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
//   subjects = subjects.map(s => s.trim()).filter(Boolean);
//   let perSubjectTime = subjects.length > 0 ? Math.floor(hours / subjects.length) : 0;

//   return days.map(day => ({
//     day,
//     tasks: subjects.map(sub => ({
//       subject: sub,
//       concepts: 0,
//       problems: 0,
//       plannedTime: perSubjectTime,
//       actualTime: 0
//     }))
//   }));
// }

// // GENERATE
// app.post("/generate", (req, res) => {
//   try {
//     const { subjects, hours, user } = req.body;
//     let data = readData();

//     if (!data.users[user]) return res.json({ error: "User not found" });

//     data.users[user].schedule = generateSchedule(subjects, hours);
//     writeData(data);
//     res.json({ ok: true });
//   } catch (err) {
//     console.error("GENERATE ERROR:", err);
//     res.json({ error: "Failed to generate schedule" });
//   }
// });

// // GET DATA
// app.get("/data", (req, res) => {
//   try {
//     const user = req.query.user;
//     let data = readData();

//     if (!data.users[user]) return res.json({ schedule: [] });
//     res.json({ schedule: data.users[user].schedule });
//   } catch (err) {
//     console.error("DATA ERROR:", err);
//     res.json({ schedule: [] });
//   }
// });

// // SAVE
// app.post("/save", (req, res) => {
//   try {
//     const { user, schedule } = req.body;
//     let data = readData();

//     if (!data.users[user]) return res.json({ error: "User not found" });

//     data.users[user].schedule = schedule;
//     writeData(data);
//     res.json({ ok: true });
//   } catch (err) {
//     console.error("SAVE ERROR:", err);
//     res.json({ error: "Save failed" });
//   }
// });

// /* =========================
//    🤖 AI ROUTE
// ========================= */
// app.post("/ai", async (req, res) => {
//   try {
//     const { schedule } = req.body;

//     let totalConcepts = 0;
//     let totalProblems = 0;
//     let totalTime = 0;
//     let subjectMap = {};

//     schedule.forEach(day => {
//       day.tasks.forEach(task => {
//         totalConcepts += task.concepts || 0;
//         totalProblems += task.problems || 0;
//         totalTime += task.actualTime || 0;
//         let total = (task.concepts || 0) + (task.problems || 0) + (task.actualTime || 0);
//         subjectMap[task.subject] = (subjectMap[task.subject] || 0) + total;
//       });
//     });

//     let weak = Object.entries(subjectMap).sort((a,b)=>a[1]-b[1])[0]?.[0] || "None";
//     let strong = Object.entries(subjectMap).sort((a,b)=>b[1]-a[1])[0]?.[0] || "None";

//     let text = `
// 📊 Performance:
// • Concepts: ${totalConcepts}
// • Problems: ${totalProblems}
// • Time Spent: ${totalTime} hrs

// 📉 Weak Subject: ${weak}
// 📈 Strong Subject: ${strong}

// 💡 Suggestions:
// • Focus more on ${weak}
// • Practice daily
// • Track time consistently

// 🔥 Motivation:
// Consistency beats intensity 🚀
//     `;

//     res.json({ text });
//   } catch (err) {
//     console.error("AI ERROR:", err);
//     res.json({ text: "AI failed, try again!" });
//   }
// });

// /* =========================
//    SERVER
// ========================= */
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server running at http://localhost:${PORT}`);
// });



require("dotenv").config();

const express = require("express");
const fs = require("fs");
const cors = require("cors");
const path = require("path");
const OpenAI = require("openai");

const app = express();

/* =========================
   MIDDLEWARE
========================= */

app.use(express.json());

// Serve static files (index.html, style.css, script.js)
app.use(express.static(path.join(__dirname, "..")));

/* =========================
   CORS CONFIG
========================= */

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://your-project.vercel.app" // replace after deploy
];

app.use(cors({
  origin: function (origin, callback) {

    // allow Postman / curl / server-to-server
    if (!origin) return callback(null, true);

    if (!allowedOrigins.includes(origin)) {
      const msg =
        "The CORS policy for this site does not allow access from this Origin.";
      return callback(new Error(msg), false);
    }

    return callback(null, true);
  },

  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
  credentials: true
}));

/* =========================
   OPENAI (optional)
========================= */

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/* =========================
   DATA FILE
========================= */

const FILE = path.join(__dirname, "..", "data.json");

if (!fs.existsSync(FILE)) {
  fs.writeFileSync(FILE, JSON.stringify({ users: {} }, null, 2));
}

/* =========================
   FILE HELPERS
========================= */

function readData() {
  let data = JSON.parse(fs.readFileSync(FILE, "utf-8"));

  if (!data.users) {
    data = { users: {} };
    writeData(data);
  }

  return data;
}

function writeData(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

/* =========================
   AUTH ROUTES
========================= */

app.post("/register", (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.json({ error: "Missing fields" });

    let data = readData();

    if (data.users[email])
      return res.json({ error: "User already exists" });

    data.users[email] = {
      password,
      schedule: []
    };

    writeData(data);

    res.json({ ok: true });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.json({ error: "Register failed" });
  }
});

app.post("/login", (req, res) => {
  try {
    const { email, password } = req.body;

    let data = readData();

    if (!data.users[email])
      return res.json({ error: "User not found" });

    if (data.users[email].password !== password)
      return res.json({ error: "Wrong password" });

    res.json({ ok: true });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.json({ error: "Login failed" });
  }
});

/* =========================
   SCHEDULE
========================= */

function generateSchedule(subjects, hours) {

  const days = [
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
    "Sun"
  ];

  subjects = subjects
    .map(s => s.trim())
    .filter(Boolean);

  let perSubjectTime =
    subjects.length > 0
      ? Math.floor(hours / subjects.length)
      : 0;

  return days.map(day => ({
    day,
    tasks: subjects.map(sub => ({
      subject: sub,
      concepts: 0,
      problems: 0,
      plannedTime: perSubjectTime,
      actualTime: 0
    }))
  }));
}

/* =========================
   GENERATE
========================= */

app.post("/generate", (req, res) => {
  try {

    const { subjects, hours, user } = req.body;

    let data = readData();

    if (!data.users[user])
      return res.json({ error: "User not found" });

    data.users[user].schedule =
      generateSchedule(subjects, hours);

    writeData(data);

    res.json({ ok: true });

  } catch (err) {
    console.error("GENERATE ERROR:", err);
    res.json({
      error: "Failed to generate schedule"
    });
  }
});

/* =========================
   GET DATA
========================= */

app.get("/data", (req, res) => {
  try {

    const user = req.query.user;

    let data = readData();

    if (!data.users[user])
      return res.json({ schedule: [] });

    res.json({
      schedule: data.users[user].schedule
    });

  } catch (err) {
    console.error("DATA ERROR:", err);
    res.json({ schedule: [] });
  }
});

/* =========================
   SAVE
========================= */

app.post("/save", (req, res) => {
  try {

    const { user, schedule } = req.body;

    let data = readData();

    if (!data.users[user])
      return res.json({ error: "User not found" });

    data.users[user].schedule = schedule;

    writeData(data);

    res.json({ ok: true });

  } catch (err) {
    console.error("SAVE ERROR:", err);
    res.json({ error: "Save failed" });
  }
});

/* =========================
   AI ROUTE
========================= */

app.post("/ai", async (req, res) => {
  try {

    const { schedule } = req.body;

    let totalConcepts = 0;
    let totalProblems = 0;
    let totalTime = 0;

    let subjectMap = {};

    schedule.forEach(day => {
      day.tasks.forEach(task => {

        totalConcepts += task.concepts || 0;
        totalProblems += task.problems || 0;
        totalTime += task.actualTime || 0;

        let total =
          (task.concepts || 0) +
          (task.problems || 0) +
          (task.actualTime || 0);

        subjectMap[task.subject] =
          (subjectMap[task.subject] || 0) + total;

      });
    });

    let weak =
      Object.entries(subjectMap)
        .sort((a, b) => a[1] - b[1])[0]?.[0]
      || "None";

    let strong =
      Object.entries(subjectMap)
        .sort((a, b) => b[1] - a[1])[0]?.[0]
      || "None";

    let text = `
📊 Performance:
• Concepts: ${totalConcepts}
• Problems: ${totalProblems}
• Time Spent: ${totalTime} hrs

📉 Weak Subject: ${weak}
📈 Strong Subject: ${strong}

💡 Suggestions:
• Focus more on ${weak}
• Practice daily
• Track time consistently

🔥 Motivation:
Consistency beats intensity 🚀
`;

    res.json({ text });

  } catch (err) {
    console.error("AI ERROR:", err);

    res.json({
      text: "AI failed, try again!"
    });
  }
});

/* =========================
   EXPORT FOR VERCEL
========================= */

module.exports = app;