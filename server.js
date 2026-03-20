
// require("dotenv").config();
// const express = require("express");
// const fs = require("fs");
// const OpenAI = require("openai");

// const app = express();
// app.use(express.json());
// app.use(express.static("public"));

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY
// });

// const FILE = "data.json";

// /* =========================
//    INIT FILE
// ========================= */
// if (!fs.existsSync(FILE)) {
//   fs.writeFileSync(FILE, JSON.stringify({ schedule: [] }, null, 2));
// }

// /* =========================
//    UTIL FUNCTIONS
// ========================= */


// function generateSchedule(subjects, hours) {
//   const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

//   subjects = subjects.map(s => s.trim()).filter(Boolean);

//   // 🔥 AUTO TIME DIVISION
//   let perSubjectTime = subjects.length > 0 
//     ? Math.floor(hours / subjects.length)
//     : 0;

//   return days.map(day => ({
//     day,
//     tasks: subjects.map(sub => ({
//       subject: sub,
//       concepts: 0,
//       problems: 0,
//       time: perSubjectTime   // ✅ AUTO FILLED
//     }))
//   }));
// }

// // ✅ Streak (no change needed but improved logic)
// function calcStreak(data) {
//   let streak = 0;

//   data.forEach(d => {
//     let total = d.tasks.reduce((a,b)=>
//       a + (b.concepts||0) + (b.problems||0) + (b.time||0), 0
//     );

//     if(total > 0) streak++;
//   });

//   return streak;
// }

// // ✅ Progress (UPDATED: includes time)
// function calcProgress(data) {
//   let total = 0;
//   let done = 0;

//   data.forEach(d => {
//     d.tasks.forEach(t => {
//       total += 30; // concepts + problems + time
//       done += (t.concepts || 0) + (t.problems || 0) + (t.time || 0);
//     });
//   });

//   return total === 0 ? 0 : Math.min(100, Math.floor((done / total) * 100));
// }

// // Read file safely
// function readData() {
//   return JSON.parse(fs.readFileSync(FILE));
// }

// // Write file safely
// function writeData(data) {
//   fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
// }

// /* =========================
//    ROUTES
// ========================= */

// // ✅ Generate
// app.post("/generate", (req, res) => {
//   const { subjects, hours } = req.body;

//   if (!subjects || subjects.length === 0) {
//     return res.status(400).json({ error: "No subjects provided" });
//   }

//   const schedule = generateSchedule(subjects, hours);

//   writeData({ schedule });

//   res.json({ schedule });
// });

// // ✅ Get data
// app.get("/data", (req, res) => {
//   const data = readData();
//   const schedule = data.schedule || [];

//   res.json({
//     schedule,
//     streak: calcStreak(schedule),
//     progress: calcProgress(schedule)
//   });
// });

// // ✅ Save updates (no change needed)
// app.post("/save", (req, res) => {
//   writeData({ schedule: req.body });
//   res.json({ ok: true });
// });

// /* =========================
//    🤖 AI ROUTE (UPDATED)
// ========================= */

// app.post("/ai", async (req, res) => {
//   try {
//     const { schedule } = req.body;

//     let weakMap = {};
//     let strongMap = {};

//     let totalConcepts = 0;
//     let totalProblems = 0;
//     let totalTime = 0;   // 🔥 NEW

//     schedule.forEach(day => {
//       day.tasks.forEach(task => {
//         let total =
//           (task.concepts || 0) +
//           (task.problems || 0) +
//           (task.time || 0);  // 🔥 include time

//         totalConcepts += task.concepts || 0;
//         totalProblems += task.problems || 0;
//         totalTime += task.time || 0;

//         weakMap[task.subject] = (weakMap[task.subject] || 0) + total;
//         strongMap[task.subject] = (strongMap[task.subject] || 0) + total;
//       });
//     });

//     let weak = Object.entries(weakMap).sort((a,b)=>a[1]-b[1])[0]?.[0] || "None";
//     let strong = Object.entries(strongMap).sort((a,b)=>b[1]-a[1])[0]?.[0] || "None";

//     let localAI = `
// 📊 Performance:
// • Concepts: ${totalConcepts}
// • Problems: ${totalProblems}
// • Time Spent: ${totalTime} hrs

// 📉 Weak Subject: ${weak}

// 📈 Strong Subject: ${strong}

// 💡 Suggestions:
// • Spend more time on ${weak}
// • Balance concepts + problems
// • Track time consistently

// 🔥 Motivation:
// Consistency beats intensity. Keep going 🚀
//     `;

//     /* 🔹 OpenAI (optional) */
//     if (process.env.OPENAI_API_KEY) {
//       try {
//         const response = await openai.chat.completions.create({
//           model: "gpt-4.1-mini",
//           messages: [
//             {
//               role: "user",
//               content: `Analyze this study data and give structured insights:\n${JSON.stringify(schedule)}`
//             }
//           ]
//         });

//         return res.json({
//           text: response.choices[0].message.content
//         });

//       } catch (err) {
//         console.log("⚠️ OpenAI failed → using fallback");
//       }
//     }

//     // fallback
//     res.json({ text: localAI });

//   } catch (err) {
//     console.error(err);
//     res.json({
//       text: "⚠️ AI failed, but keep studying!"
//     });
//   }
// });

// /* =========================
//    SERVER
// ========================= */

// app.listen(3000, () => {
//   console.log("🚀 Server running at http://localhost:3000");
// });


require("dotenv").config();
const express = require("express");
const fs = require("fs");
const OpenAI = require("openai");

const app = express();
app.use(express.json());
app.use(express.static("public"));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const FILE = "data.json";

/* =========================
   INIT FILE
========================= */
if (!fs.existsSync(FILE)) {
  fs.writeFileSync(FILE, JSON.stringify({ users: {} }, null, 2));
}

/* =========================
   FILE HELPERS (🔥 SAFE)
========================= */
function readData() {
  let data = JSON.parse(fs.readFileSync(FILE));

  // 🔥 Auto-fix old structure
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

// REGISTER
app.post("/register", (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.json({ error: "Missing fields" });
    }

    let data = readData();

    if (data.users[email]) {
      return res.json({ error: "User already exists" });
    }

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

// LOGIN
app.post("/login", (req, res) => {
  try {
    const { email, password } = req.body;

    let data = readData();

    if (!data.users[email]) {
      return res.json({ error: "User not found" });
    }

    if (data.users[email].password !== password) {
      return res.json({ error: "Wrong password" });
    }

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
  const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

  subjects = subjects.map(s => s.trim()).filter(Boolean);

  let perSubjectTime = subjects.length > 0
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

// GENERATE
app.post("/generate", (req, res) => {
  try {
    const { subjects, hours, user } = req.body;

    let data = readData();

    if (!data.users[user]) {
      return res.json({ error: "User not found" });
    }

    data.users[user].schedule = generateSchedule(subjects, hours);

    writeData(data);

    res.json({ ok: true });

  } catch (err) {
    console.error("GENERATE ERROR:", err);
    res.json({ error: "Failed to generate schedule" });
  }
});

// GET DATA
app.get("/data", (req, res) => {
  try {
    const user = req.query.user;

    let data = readData();

    if (!data.users[user]) {
      return res.json({ schedule: [] });
    }

    res.json({
      schedule: data.users[user].schedule
    });

  } catch (err) {
    console.error("DATA ERROR:", err);
    res.json({ schedule: [] });
  }
});

// SAVE
app.post("/save", (req, res) => {
  try {
    const { user, schedule } = req.body;

    let data = readData();

    if (!data.users[user]) {
      return res.json({ error: "User not found" });
    }

    data.users[user].schedule = schedule;

    writeData(data);

    res.json({ ok: true });

  } catch (err) {
    console.error("SAVE ERROR:", err);
    res.json({ error: "Save failed" });
  }
});

/* =========================
   🤖 AI ROUTE (🔥 FIXED)
========================= */

app.post("/ai", (req, res) => {
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

    let weak = Object.entries(subjectMap)
      .sort((a,b)=>a[1]-b[1])[0]?.[0] || "None";

    let strong = Object.entries(subjectMap)
      .sort((a,b)=>b[1]-a[1])[0]?.[0] || "None";

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
    res.json({ text: "AI failed, try again!" });
  }
});

/* =========================
   SERVER
========================= */

app.listen(3000, () => {
  console.log("🚀 Server running at http://localhost:3000");
});