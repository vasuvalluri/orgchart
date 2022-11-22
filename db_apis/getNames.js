const database = require("../services/database.js");
const create_json = require("./create_json");

const baseQuery = `
 select distinct  WT_ORG_ACRNYM|| WT_DEPT_ACRNYM || WT_OFFICE_ACRNYM|| WT_BRANCH_ACRNYM "branch", Name "name" from SYSADM.PS_WT_SOA_EMPL_VW 
  `;

async function get_names(context) {
  let query = baseQuery;
  const binds = {};
  opts = {
    autoCommit: true,
  };
  if (context.name) {
    const whereClause = `WHERE UPPER(NAME) LIKE UPPER('%${context.name}%')`;
    query += whereClause;
    const result = await database.simpleExecute("hrPool", query, binds, opts);
    const data = result.rows;
    if (data.length === 0) {
      return null;
    } else {
      return data;
    }
  } else {
    return null;
  }
}
module.exports.get_names = get_names;
