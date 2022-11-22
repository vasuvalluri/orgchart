const oracledb = require("oracledb");
const database = require("../services/database.js");
const create_json = require("./create_json");
const baseQuery = `
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
  select CASE WHEN TRIM(main.POSITION_NBR) IS NOT NULL THEN  'E' || main.POSITION_NBR ELSE 'C' || EMPLID END "id",
  DECODE(NAME,' ','Vacant',NAME) "name",DESCR "title",DEPTNAME "deptname",deptid "deptid",
  decode(case when main.REPORTS_TO = main.POSITION_NBR then null else main.REPORTS_TO end,'400000',null,
    case when main.REPORTS_TO = main.POSITION_NBR then null else 'E' || main.REPORTS_TO end)  "parentid",
    nvl(tablea."contractorCount",0) "contractor_count",
    nvl(tablea."employeeCount",0) "employee_count",
    nvl(tablea."vacantCount",0) "vacant_count",
    '010' "relationship",
       decode (TRIM(main.POSITION_NBR),'','contractor', decode(trim(name),'','vacant','employee')) "className"
  from SYSADM.PS_WT_SOA_EMPL_VW main
  left outer join tablea on (main.POSITION_NBR = tablea.REPORTS_TO)`;
async function get_children(context) {
  let query = baseQuery;
  let binds = {};
  opts = {
    autoCommit: true,
    // batchErrors: true,  // continue processing even if there are data errors
    bindDefs: [{ type: oracledb.STRING, maxSize: 8 }],
  };
  let parentId = "'" + String(context.id).padStart(6, "0") + "'";
  query += " WHERE 'E' || main.REPORTS_TO = " + parentId;
  let whereClause = "";
  whereClause +=
    context.isShowContractors === "true"
      ? ""
      : " AND TRIM(main.POSITION_NBR) IS NOT NULL ";
  whereClause +=
    context.isShowVacant === "true" ? "" : " AND TRIM(main.name) IS NOT NULL ";
  query += whereClause;
  const result = await database.simpleExecute("hrPool", query, binds, opts);
  let data = create_json.create_children(
    result.rows,
    context.isShowContractors
  );
  return data;
}
module.exports.get_children = get_children;
