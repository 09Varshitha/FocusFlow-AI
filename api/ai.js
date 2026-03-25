const { sendJson, allowCors, parseBody } = require("./_lib/data");

module.exports = async (req, res) => {
  if (allowCors(req, res)) return;

  if (req.method !== "POST") {
    return sendJson(res, { error: "Method not allowed" }, 405);
  }

  try {
    const { schedule = [] } = await parseBody(req);

    let totalConcepts = 0;
    let totalProblems = 0;
    let totalTime = 0;
    const subjectMap = {};

    schedule.forEach(day => {
      day.tasks.forEach(task => {
        totalConcepts += task.concepts || 0;
        totalProblems += task.problems || 0;
        totalTime += task.actualTime || 0;

        const total =
          (task.concepts || 0) +
          (task.problems || 0) +
          (task.actualTime || 0);

        subjectMap[task.subject] = (subjectMap[task.subject] || 0) + total;
      });
    });

    const weak =
      Object.entries(subjectMap).sort((a, b) => a[1] - b[1])[0]?.[0] || "None";

    const strong =
      Object.entries(subjectMap).sort((a, b) => b[1] - a[1])[0]?.[0] || "None";

    const text = `📊 Performance:
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
Consistency beats intensity 🚀`;

    return sendJson(res, { text });
  } catch (err) {
    console.error("AI ERROR:", err);
    return sendJson(res, { text: "AI failed" }, 500);
  }
};