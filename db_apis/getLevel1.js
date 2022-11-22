const database = require("../services/database.js");
const create_json = require("./create_json");

const baseQuery = `
 with tablea as(
  select POSITION_NBR  from SYSADM.PS_WT_SOA_EMPL_VW where POSITION_NBR ='000240'), 
  tableb as (
    select  REPORTS_TO REPORTS_TO,sum(contractorcount) "contractorCount",
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
  decode(case when main.REPORTS_TO  = main.POSITION_NBR then null else  main.REPORTS_TO end,'400000',null,
    case when main.REPORTS_TO = main.POSITION_NBR then null else 'E' || main.REPORTS_TO end)  "parentid",
    nvl(tableb."contractorCount",0) "contractor_count",
    nvl(tableb."employeeCount",0) "employee_count",
    nvl(tableb."vacantCount",0) "vacant_count",
    '010' "relationship",
      decode (TRIM(main.POSITION_NBR),'','contractor', decode(trim(name),'','vacant','employee')) "className"
      from SYSADM.PS_WT_SOA_EMPL_VW main
      inner join tablea on (tablea.POSITION_NBR = REPORTS_TO or tablea.POSITION_NBR = main.POSITION_NBR)
      left outer join tableb on (main.POSITION_NBR = tableb.REPORTS_TO)
  `;

async function get_level1(context) {
  let query = baseQuery;
  let whereClause = " WHERE ";
  whereClause +=
    context.isShowContractors === "true"
      ? ""
      : " TRIM(main.POSITION_NBR) IS NOT NULL ";
  whereClause +=
    whereClause.length > 8 && context.isShowVacant !== "true" ? " AND " : "";
  whereClause +=
    context.isShowVacant === "true" ? "" : " TRIM(main.name) IS NOT NULL ";

  const binds = {};
  opts = {
    autoCommit: true,
  };
  if (whereClause.length > 8) {
    query += whereClause;
  }
  const result = await database.simpleExecute("hrPool", query, binds, opts);
  const data = create_json.create_json(result.rows);
  //console.log(data[0]);
  return data[0];
}
module.exports.get_level1 = get_level1;
