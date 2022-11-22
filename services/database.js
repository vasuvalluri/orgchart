const oracledb = require("oracledb");
const dbConfig = require("../config/database.js");

async function initialize() {
  console.log(`initializing ${dbConfig.hrPool.poolAlias}`);
  const pool = await oracledb.createPool(dbConfig.hrPool);
  console.log(`initializing ${dbConfig.feedbackPool.poolAlias}`);
  const feedbackPool = await oracledb.createPool(dbConfig.feedbackPool);
}

module.exports.initialize = initialize;

async function close() {
  await oracledb.getPool(dbConfig.hrPool).close();
  await oracledb.getPool(dbConfig.feedbackPool).close();
}

module.exports.close = close;

function simpleExecute(poolName, statement, binds = [], opts = {}) {
  return new Promise(async (resolve, reject) => {
    let conn;

    opts.outFormat = oracledb.OBJECT;
    opts.autoCommit = true;
    //console.log(opts)

    try {
      conn = await oracledb.getConnection(poolName);
      const result = await conn.execute(statement, binds, opts);
      resolve(result);
    } catch (err) {
      reject(err);
    } finally {
      if (conn) {
        // conn assignment worked, need to close
        try {
          await conn.close();
        } catch (err) {
          console.log(err);
        }
      }
    }
  });
}

module.exports.simpleExecute = simpleExecute;
