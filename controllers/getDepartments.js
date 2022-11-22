const departments = require("../db_apis/getDepartments.js");

async function get(req, res, next) {
  try {
    const rows = await departments.get_departments();
    if (req.params.id) {
      if (rows.length === 1) {
        res.status(200).json(rows[0]);
      } else {
        res.status(404).end();
      }
    } else {
      res.status(200).json(rows);
    }
  } catch (err) {
    next(err);
  }
}

module.exports.get = get;
