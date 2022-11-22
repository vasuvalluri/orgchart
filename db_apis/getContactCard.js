const database = require("../services/database.js");
const create_json = require("./create_json");
const oracledb = require("oracledb");
const { get } = require("http");

const BASE_DATA_FILE = "./baseData.json";
let result = "";
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
  select NVL(TRIM(main.POSITION_NBR),EMPLID) "id",DECODE(NAME,' ','Vacant',NAME) "name",DESCR "title",DEPTNAME "deptname",DEPTID "deptid",
  decode(case when main.REPORTS_TO = main.POSITION_NBR then null else main.REPORTS_TO end,'400000',null,
    case when main.REPORTS_TO = main.POSITION_NBR then null else main.REPORTS_TO end)  "parentid",
    nvl(tablea."contractorCount",0) "contractor_count",
    nvl(tablea."employeeCount",0) "employee_count",
    nvl(tablea."vacantCount",0) "vacant_count",
    '010' "relationship",
       decode (TRIM(main.POSITION_NBR),'','contractor', decode(trim(name),'','vacant','employee')) "className"
  from SYSADM.PS_WT_SOA_EMPL_VW main
  left outer join tablea on (main.POSITION_NBR = tablea.REPORTS_TO)
`;
async function get_contact_card(context) {
  let binds = {};
  opts = {
    autoCommit: true,
    bindDefs: [{ type: oracledb.STRING }],
  };
  inClause =
    "where last_name = '" +
    context.surname +
    "' and first_name = '" +
    context.givenName +
    "'";

  let query = dataQuery + inClause;
  result = await database.simpleExecute("hrPool", query, binds, opts);
  const data = create_json.create_json(result.rows);
  return data[0];
}

module.exports.get_contact_card = get_contact_card;
