const { readData, writeData, sendJson, allowCors, parseBody, generateSchedule } = require("./_lib/data");

module.exports = async (req, res) => {
  if (allowCors(req, res)) return;

  if (req.method !== "POST") {
    return sendJson(res, { error: "Method not allowed" }, 405);
  }

  try {
    const { subjects, hours, user } = await parseBody(req);
    const data = readData();

    if (!data.users[user]) {
      return sendJson(res, { error: "User not found" }, 404);
    }

    data.users[user].schedule = generateSchedule(subjects, hours);
    writeData(data);

    return sendJson(res, { ok: true });
  } catch (err) {
    console.error("GENERATE ERROR:", err);
    return sendJson(res, { error: "Generate failed" }, 500);
  }
};