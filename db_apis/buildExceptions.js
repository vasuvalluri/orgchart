const database = require("../services/database.js");
const create_json = require("./create_json");
const fs = require("fs");

const baseQuery = `select * from SYSADM.PS_WT_SOA_EMPL_VW
where REPORTS_TO not in (select POSITION_NBR from SYSADM.PS_WT_SOA_EMPL_VW)
  `;

async function create_exceptions_file() {
  let query = baseQuery;
  const binds = {};
  opts = {
    autoCommit: true,
  };
  const result = await database.simpleExecute("hrPool", query, binds, opts);
  console.log(result.rows);
  const data = create_json.create_csv(result.rows);
  fs.writeFile("./client/public/exception_report.csv", data, (err) => {
    if (err) {
      console.log("Error writing file", err);
    } else {
      console.log("Successfully wrote exceptions file at " + Date.now());
    }
  });
  return data;
}
module.exports.create_exceptions_file = create_exceptions_file;
