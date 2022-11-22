const database = require("../services/database.js");
const oracledb = require("oracledb");
let result = "";
const baseQuery = `
insert into feedback_log (email_address, feedback_text) values (:emailAddress, :feedBackText)
`;

async function save_feedback(context) {
  let query = baseQuery;
  let binds = [context.emailAddress, context.feedbackText];
  opts = {
    autoCommit: true,
    // batchErrors: true,  // continue processing even if there are data errors
    //bindDefs: [{ type: oracledb.STRING }],
  };
  result = await database.simpleExecute("feedbackPool", query, binds, opts);
  return result.rowsAffected;
}
module.exports.save_feedback = save_feedback;
