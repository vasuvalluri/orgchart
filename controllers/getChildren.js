const children = require("../db_apis/getChildren.js");

async function get(req, res, next) {
  try {
    const context = {};
    context.id = req.params.id;
    context.isShowContractors = req.params.isShowContractors;
    context.isShowVacant = req.params.isShowVacant;
    if (context.id) {
      const rows = await children.get_children(context);
      if (rows !== undefined) {
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
