const { readData, sendJson, allowCors, parseBody } = require("./_lib/data");

module.exports = async (req, res) => {
  if (allowCors(req, res)) return;

  if (req.method !== "POST") {
    return sendJson(res, { error: "Method not allowed" }, 405);
  }

  try {
    const { email, password } = await parseBody(req);
    const data = readData();

    if (!data.users[email]) {
      return sendJson(res, { error: "User not found" }, 404);
    }

    if (data.users[email].password !== password) {
      return sendJson(res, { error: "Wrong password" }, 400);
    }

    return sendJson(res, { ok: true });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return sendJson(res, { error: "Login failed" }, 500);
  }
};