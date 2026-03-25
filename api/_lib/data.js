const fs = require("fs");
const path = require("path");

const FILE = process.env.VERCEL
  ? "/tmp/data.json"
  : path.join(process.cwd(), "data.json");

function ensureFile() {
  try {
    if (!fs.existsSync(FILE)) {
      fs.writeFileSync(FILE, JSON.stringify({ users: {} }, null, 2));
    }
  } catch (err) {
    console.error("FILE ERROR:", err);
  }
}

function readData() {
  try {
    ensureFile();
    const raw = fs.readFileSync(FILE, "utf-8");
    if (!raw) return { users: {} };
    return JSON.parse(raw);
  } catch (err) {
    console.error("READ ERROR:", err);
    return { users: {} };
  }
}

function writeData(data) {
  try {
    ensureFile();
    fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("WRITE ERROR:", err);
  }
}

function sendJson(res, obj, status = 200) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(obj));
}

function allowCors(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.statusCode = 200;
    res.end();
    return true;
  }
  return false;
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => {
      body += chunk;
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

function generateSchedule(subjects, hours) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const cleanSubjects = (subjects || []).map(s => s.trim()).filter(Boolean);
  const perSubjectTime =
    cleanSubjects.length > 0 ? Math.floor(hours / cleanSubjects.length) : 0;

  return days.map(day => ({
    day,
    tasks: cleanSubjects.map(sub => ({
      subject: sub,
      concepts: 0,
      problems: 0,
      plannedTime: perSubjectTime,
      actualTime: 0
    }))
  }));
}

module.exports = {
  readData,
  writeData,
  sendJson,
  allowCors,
  parseBody,
  generateSchedule
};