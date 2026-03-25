const { readData, writeData, sendJson, allowCors, parseBody } = require("./_lib/data");

module.exports = async (req, res) => {
  if (allowCors(req, res)) return;

  if (req.method !== "POST") {
    return sendJson(res, { error: "Method not allowed" }, 405);
  }

  try {
    const { email, password } = await parseBody(req);

    if (!email || !password) {
      return sendJson(res, { error: "Email and password required" }, 400);
    }

    const data = readData();
    if (!data.users) data.users = {};

    if (data.users[email]) {
      return sendJson(res, { error: "User already exists" }, 400);
    }

    data.users[email] = {
      password,
      schedule: []
    };

    writeData(data);
    return sendJson(res, { ok: true });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return sendJson(res, { error: "Registration failed" }, 500);
  }
};