const sl = require("../db_apis/saveLogin.js");

async function post(req, res, next) {
  console.log(req.body);
  const rows = await sl.save_login(req.body);
  res.status(200).json(rows);
}

module.exports.post = post;
