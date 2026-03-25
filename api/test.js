const { sendJson, allowCors } = require("./_lib/data");

module.exports = async (req, res) => {
  if (allowCors(req, res)) return;
  sendJson(res, { status: "Server running ✅" });
};