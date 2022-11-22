const getDataByName = require("../db_apis/getDataByName.js");

async function get(req, res, next) {
  try {
    const context = {};
    context.name = req.params.name;
    const rows = await getDataByName.get_data_by_name(context);
    if (req.params.name) {
      if (rows) {
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
