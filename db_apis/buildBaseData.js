const database = require("../services/database.js");
const create_json = require("./create_json");
const oracledb = require("oracledb");
const fs = require("fs");
const BASE_DATA_FILE = "./baseData.json";
let result = "";
const baseQuery = `
select * from (
select distinct CASE WHEN LENGTH(TRIM(POSITION_NBR) || 'E') > 1  THEN 'E' || POSITION_NBR
 ELSE 'C' || EMPLID END "id",
  DECODE(REPORTS_TO,'400000','',CASE WHEN TRIM(REPORTS_TO) IS NOT NULL THEN  'E' || REPORTS_TO ELSE '' END) "parentid"
from SYSADM.PS_WT_SOA_EMPL_VW
WHERE POSITION_NBR != '400000'
      and WT_ORG_ACRNYM != 'BRD'
and reports_to in (select distinct POSITION_NBR from sysadm.PS_WT_SOA_EMPL_VW))
where ("parentid" is NOT null
      or "id" = 'E000240')
      

order by 1
`;

const listToTree = (arr = []) => {
  let map = {},
    node,
    res = [],
    i;
  for (i = 0; i < arr.length; i += 1) {
    map[arr[i].id] = i;
    arr[i].children = [];
  }
  for (i = 0; i < arr.length; i += 1) {
    node = arr[i];
    if (node.parentid !== null) {
      arr[map[node.parentid]].children.push(node);
    } else {
      res.push(node);
    }
  }
  return res;
};
async function create_base_data_file() {
  let query = baseQuery;
  let binds = {};
  opts = {
    autoCommit: true,
    // batchErrors: true,  // continue processing even if there are data errors
    bindDefs: [{ type: oracledb.STRING }],
  };
  result = await database.simpleExecute("hrPool", query, binds, opts);
  const root = [];
  const map = {};
  let data = result.rows;

  data.forEach((node) => {
    if (!node.parentid) return root.push(node);
    let parentIndex = map[node.parentid];
    if (typeof parentIndex !== "number") {
      parentIndex = data.findIndex((el) => el.id === node.parentid);
      try {
        map[node.parentid] = parentIndex;
      } catch (err) {}
    }
    if (data[parentIndex]) {
      if (!data[parentIndex].children && parentIndex > 0) {
        return (data[parentIndex].children = [node]);
      }
      if (data[parentIndex].children == undefined) {
        data[parentIndex].children = [node];
      } else {
        data[parentIndex].children.push(node);
      }
    }
  });
  data.forEach((node) => {
    if (node.id === node.parentid)
      console.log("found it", node.id, node.parentid);
  });
  fs.writeFile(BASE_DATA_FILE, JSON.stringify(data), (err) => {
    if (err) {
      console.log("Error writing file", err);
    } else {
      console.log("Successfully wrote Base Data file at " + Date.now());
    }
  });
}

module.exports.create_base_data_file = create_base_data_file;
