const database = require("../services/database.js");
const oracledb = require("oracledb");
let result = "";
const baseQuery = `
insert into login_log (email_address) values (:emailAddress)
`;

async function save_login(context) {
  let query = baseQuery;
  let binds = [context.emailAddress];
  opts = {
    autoCommit: true,
    // batchErrors: true,  // continue processing even if there are data errors
    //bindDefs: [{ type: oracledb.STRING }],
  };
  result = await database.simpleExecute("feedbackPool", query, binds, opts);
  return result.rowsAffected;
}
module.exports.save_login = save_login;
