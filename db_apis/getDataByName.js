const database = require("../services/database.js");
const create_json = require("./create_json");
const oracledb = require("oracledb");
const fs = require("fs");
const { Console } = require("console");
const BASE_DATA_FILE = "./baseData.json";
let result = "";
const empQuery = `
SELECT CASE WHEN LENGTH(TRIM(POSITION_NBR) || 'E') > 1  THEN 'E' || POSITION_NBR
    ELSE 'C' || EMPLID END "id" from SYSADM.PS_WT_SOA_EMPL_VW
    WHERE  #replaceme# 
`;
// WHERE REPORTS_TO IN (SELECT REPORTS_TO FROM SYSADM.PS_WT_SOA_EMPL_VW WHERE #replaceme# )
//    WHERE  #replaceme# 

const childQuery = `
SELECT CASE WHEN LENGTH(TRIM(POSITION_NBR) || 'E') > 1  THEN 'E' || POSITION_NBR
    ELSE 'C' || EMPLID END "id" from SYSADM.PS_WT_SOA_EMPL_VW
    where  WT_DEPT_ACRNYM NOT IN ( 'CNV','BRD')
         and trim(POSITION_NBR) is not null
         start with #replaceme#
connect by nocycle prior  POSITION_NBR = REPORTS_TO
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

async function get_data_by_name(context) {
  let binds = {};
  opts = {
    autoCommit: true,
    // batchErrors: true,  // continue processing even if there are data errors
    bindDefs: [{ type: oracledb.STRING }],
  };

  let baseData = JSON.parse(fs.readFileSync(BASE_DATA_FILE));
  let query = empQuery;
  let inClauseByBranch = "",
    inClauseByName = "";

  if (context.name) {
    const deptAndName = context.name.split(";");

    inClauseByBranch =
      "  WT_ORG_ACRNYM|| WT_DEPT_ACRNYM || WT_OFFICE_ACRNYM|| WT_BRANCH_ACRNYM = '" +
      deptAndName[0] +
      "'";
    inClauseByName = "  NAME = '" + deptAndName[1] + "'";
    query = query.replace(/#replaceme#/g, inClauseByName);
    //console.log(query);
    result = await database.simpleExecute("hrPool", query, binds, opts);
    empData = result.rows;
    let tempArray = [];
    empData.forEach((val, index) => {
      let parents = [];
      parents = familyTree(baseData, empData[index].id);
      //console.log(empData[index].id);
      //console.log(parents);
      parents.forEach((val, index) => {
        if (!tempArray.includes(String(parents[index]).padStart(6, "0"))) {
          tempArray.push(String(parents[index]).padStart(6, "0"));
        }
      });
    });
    query = childQuery;
    query = query.replace(/#replaceme#/g, inClauseByName);
    result = await database.simpleExecute("hrPool", query, binds, opts);
    childData = result.rows;
    childData.forEach((val, index) => {
      if (!tempArray.includes(String(childData[index].id).padStart(6, "0"))) {
        tempArray.push(String(childData[index].id).padStart(6, "0"));
      }
    });
    inClause = " ";
    tempArray.forEach((val, index) => {
      inClause += ",'" + tempArray[index] + "'";
    });

    inClause =
      "where CASE WHEN LENGTH(TRIM(POSITION_NBR) || 'E') > 1  THEN 'E' || POSITION_NBR ELSE 'C' || EMPLID END in (" +
      inClause.substr(2) +
      ")";

    query = dataQuery + inClause;
    //console.log(query);
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
          //forFn(item.children, id); 
        }
      }
    }
  };
  forFn(arr1, id);
  return temp;
}

module.exports.get_data_by_name = get_data_by_name;
