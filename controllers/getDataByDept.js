const getDataByDept = require("../db_apis/getDataByDept.js");

async function get(req, res, next) {
  try {
    const context = {};
    context.isShowContractors = req.params.isShowContractors;
    context.isShowVacant = req.params.isShowVacant;
    context.depts = req.params.depts;
    const rows = await getDataByDept.get_data_by_dept(context);
    //console.log(rows);
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
