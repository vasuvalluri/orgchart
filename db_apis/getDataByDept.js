const database = require("../services/database.js");
const create_json = require("./create_json");
const oracledb = require("oracledb");
const fs = require("fs");
const BASE_DATA_FILE = "./baseData.json";
let result = "";
const deptEmpQuery = `
  select CASE WHEN LENGTH(TRIM(POSITION_NBR) || 'E') > 1  THEN 'E' || POSITION_NBR
 ELSE 'C' || EMPLID END "id" from SYSADM.PS_WT_SOA_EMPL_VW
  WHERE #replaceme#
`;
const dataQuery = `
with tablea as (
    select REPORTS_TO,sum(contractorcount) "contractorCount",
    sum(employeecount) "employeeCount",
    sum(vacantcount) "vacantCount"
     from (
                                               select REPORTS_TO,
                                                      trim(POSITION_NBR),
                                                      decode(trim(POSITION_NBR), '', 1, 0) contractorcount,
                                                      decode(trim(POSITION_NBR), '', 0, 1) employeecount,
                                                      decode(trim(NAME), '', 1, 0) vacantcount
                                               from SYSADM.PS_WT_SOA_EMPL_VW
                                               WHERE TRIM(REPORTS_TO) IS NOT NULL

                                           ) group by REPORTS_TO
  )
  select CASE WHEN TRIM(main.POSITION_NBR) IS NOT NULL THEN  'E' || main.POSITION_NBR ELSE 'C' || EMPLID END "id",DECODE(NAME,' ','Vacant',NAME) "name",DESCR "title",DEPTNAME "deptname",DEPTID "deptid",
  decode(case when main.REPORTS_TO = main.POSITION_NBR then null else  main.REPORTS_TO end,'400000',null,
    case when main.REPORTS_TO = main.POSITION_NBR then null else 'E' || main.REPORTS_TO end)  "parentid",
    nvl(tablea."contractorCount",0) "contractor_count",
    nvl(tablea."employeeCount",0) "employee_count",
    nvl(tablea."vacantCount",0) "vacant_count",
    '010' "relationship",
       decode (TRIM(main.POSITION_NBR),'','contractor', decode(trim(name),'','vacant','employee')) "className"
  from SYSADM.PS_WT_SOA_EMPL_VW main
  left outer join tablea on (main.POSITION_NBR = tablea.REPORTS_TO)
`;

async function get_data_by_dept(context) {
  let binds = {};
  opts = {
    autoCommit: true,
    // batchErrors: true,  // continue processing even if there are data errors
    bindDefs: [{ type: oracledb.STRING }],
  };

  let baseData = JSON.parse(fs.readFileSync(BASE_DATA_FILE));
  let query = deptEmpQuery;
  let inClause = "";
  if (context.depts) {
    let deptArray = context.depts.split(",");
    if (deptArray.length == 1) {
      inClause = " WT_ORG_ACRNYM = '" + deptArray[0] + "'";
    } else if (deptArray.length == 2) {
      inClause = " WT_ORG_ACRNYM = '" + deptArray[0] + "'";
      inClause += " AND WT_DEPT_ACRNYM ='" + deptArray[1].split("-")[0] + "'";
    } else if (deptArray.length == 3) {
      inClause = " WT_ORG_ACRNYM = '" + deptArray[0] + "'";
      inClause += " AND WT_DEPT_ACRNYM ='" + deptArray[1].split("-")[0] + "'";
      inClause += " AND WT_OFFICE_ACRNYM ='" + deptArray[2].split("-")[0] + "'";
    } else if (deptArray.length == 4) {
      inClause = " WT_ORG_ACRNYM = '" + deptArray[0] + "'";
      inClause += " AND WT_DEPT_ACRNYM ='" + deptArray[1].split("-")[0] + "'";
      inClause += " AND WT_OFFICE_ACRNYM ='" + deptArray[2].split("-")[0] + "'";
      inClause += " AND WT_BRANCH_ACRNYM ='" + deptArray[3].split("-")[0] + "'";
    }
    query = query.replace(/#replaceme#/g, inClause);
    result = await database.simpleExecute("hrPool", query, binds, opts);
    empData = result.rows;
    let tempArray = [];
    empData.forEach((val, index) => {
      let parents = [];
      parents = familyTree(baseData, empData[index].id);
      parents.forEach((val, index) => {
        if (!tempArray.includes(String(parents[index]).padStart(6, "0"))) {
          tempArray.push(String(parents[index]).padStart(6, "0"));
        }
      });
    });
    inClause = " ";
    if (tempArray.length > 0 && tempArray.length < 999) {
      tempArray.forEach((val, index) => {
        inClause += ",'" + val + "'";
      });

      inClause =
        "where CASE WHEN LENGTH(TRIM(POSITION_NBR) || 'E') > 1  THEN 'E' || POSITION_NBR ELSE 'C' || EMPLID END in (" +
        inClause.substring(2) +
        ")";
    } else {
      const n = 1000;
      let chunkSize = Math.ceil(tempArray.length / n);
      inClause = "WHERE ";
      const chunks = new Array(chunkSize)
        .fill()
        .map((_) => tempArray.splice(0, n));
      let tempInClause = " ";
      chunks.forEach((chunk, index) => {
        index == 0
          ? (tempInClause +=
              " CASE WHEN LENGTH(TRIM(POSITION_NBR) || 'E') > 1  THEN 'E' || POSITION_NBR ELSE 'C' || EMPLID END in (")
          : (tempInClause +=
              " OR CASE WHEN LENGTH(TRIM(POSITION_NBR) || 'E') > 1  THEN 'E' || POSITION_NBR ELSE 'C' || EMPLID END in (");
        chunk.forEach((val, i) => {
          i == 0
            ? (tempInClause += "'" + val + "'")
            : (tempInClause += ",'" + val + "'");
        });
        tempInClause += ") ";
      });
      inClause += tempInClause;
    }
    query = dataQuery + inClause;
    let whereClause = "";
    whereClause +=
      context.isShowContractors === "true"
        ? ""
        : " AND TRIM(POSITION_NBR) IS NOT NULL ";
    whereClause +=
      context.isShowVacant === "true" ? "" : " AND TRIM(name) IS NOT NULL ";
    query += whereClause;

    result = await database.simpleExecute("hrPool", query, binds, opts);
    let data = create_json.create_json(result.rows);
    return data[0];
  }

  //const data = create_json.create_json(result.rows);
  //const newData = { data: data };
  return null; //familyTree(data, [35098, 14120]);
  //return newData;
}

function familyTree(arr1, id) {
  var temp = [];
  var forFn = function (arr, id) {
    for (var i = 0; i < arr.length; i++) {
      var item = arr[i];
      if (item.id === id) {
        temp.push(item.id);
        forFn(arr1, item.parentid);
        break;
      } else {
        if (item.children) {
          // forFn(item.children, id);
        }
      }
    }
  };
  forFn(arr1, id);
  return temp;
}

module.exports.get_data_by_dept = get_data_by_dept;
