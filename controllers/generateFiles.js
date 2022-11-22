const gf = require("../db_apis/generateFiles.js");

async function get(req, res, next) {
  const rows = await gf.generate_files();

  res.status(200).json(rows);
}

module.exports.get = get;
