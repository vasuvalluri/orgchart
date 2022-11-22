const sf = require("../db_apis/saveFeedback.js");

async function post(req, res, next) {
  console.log(req.body);
  const rows = await sf.save_feedback(req.body);
  res.status(200).json(rows);
}

module.exports.post = post;
