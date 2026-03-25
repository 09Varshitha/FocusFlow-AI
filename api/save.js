const { readData, writeData, sendJson, allowCors, parseBody } = require("./_lib/data");

module.exports = async (req, res) => {
  if (allowCors(req, res)) return;

  if (req.method !== "POST") {
    return sendJson(res, { error: "Method not allowed" }, 405);
  }

  try {
    const { user, schedule } = await parseBody(req);
    const data = readData();

    if (!data.users[user]) {
      return sendJson(res, { error: "User not found" }, 404);
    }

    data.users[user].schedule = schedule;
    writeData(data);

    return sendJson(res, { ok: true });
  } catch (err) {
    console.error("SAVE ERROR:", err);
    return sendJson(res, { error: "Save failed" }, 500);
  }
};