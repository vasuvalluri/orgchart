const names = require("../db_apis/getNames.js");

async function get(req, res, next) {
  try {
    const context = {};
    context.name = req.params.name;
    const rows = await names.get_names(context);
    if (req.params.name) {
      if (rows.length !== 0) {
        res.status(200).json(rows);
      } else {
        res.status(404).end();
      }
    } else {
      res.status(500).end();
    }
  } catch (err) {
    next(err);
  }
}

module.exports.get = get;
