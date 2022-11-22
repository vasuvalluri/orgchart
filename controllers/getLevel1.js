const level1 = require("../db_apis/getLevel1.js");

async function get(req, res, next) {
  const context = {};
  context.isShowContractors = req.params.isShowContractors;
  context.isShowVacant = req.params.isShowVacant;
  try {
    const rows = await level1.get_level1(context);
    if (rows) {
      res.status(200).json(rows);
    } else {
      res.status(404).end();
    }
  } catch (err) {
    next(err);
  }
}

module.exports.get = get;
