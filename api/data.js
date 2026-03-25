const { readData, sendJson, allowCors } = require("./_lib/data");

module.exports = async (req, res) => {
  if (allowCors(req, res)) return;

  if (req.method !== "GET") {
    return sendJson(res, { error: "Method not allowed" }, 405);
  }

  try {
    const url = new URL(req.url, "http://localhost");
    const user = url.searchParams.get("user");
    const data = readData();

    return sendJson(res, {
      schedule: data.users[user]?.schedule || []
    });
  } catch (err) {
    console.error("DATA ERROR:", err);
    return sendJson(res, { schedule: [] }, 500);
  }
};