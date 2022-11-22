const database = require("../services/database.js");
const create_json = require("./create_json");

const baseQuery = `
SELECT distinct WT_ORG_ACRNYM "value", descr60 || '(' || WT_ORG_ACRNYM || ')' "label", null "reports_to"
from SYSADM.PS_WT_SOA_EMPL_VW
WHERE TRIM(WT_ORG_ACRNYM) IS NOT NULL AND WT_ORG_ACRNYM NOT IN ( 'CNV','BRD')
AND TRIM(POSITION_NBR) IS NOT NULL
union
select distinct  WT_DEPT_ACRNYM ||'-'|| WT_ORG_ACRNYM "value", DESCR60_ALT || '(' || WT_DEPT_ACRNYM || ')' "label", WT_ORG_ACRNYM "reports_to"
from SYSADM.PS_WT_SOA_EMPL_VW
WHERE TRIM(WT_ORG_ACRNYM) IS NOT NULL AND WT_ORG_ACRNYM NOT IN ( 'CNV','BRD')
AND TRIM(POSITION_NBR) IS NOT NULL
union
select distinct WT_OFFICE_ACRNYM ||'-' || WT_DEPT_ACRNYM ||'-'|| WT_ORG_ACRNYM  "value",DESCR60_ALT_ACA  || '(' || WT_OFFICE_ACRNYM || ')' "label", WT_DEPT_ACRNYM ||'-'|| WT_ORG_ACRNYM "reports_to"
from SYSADM.PS_WT_SOA_EMPL_VW
WHERE TRIM(WT_ORG_ACRNYM) IS NOT NULL AND WT_ORG_ACRNYM NOT IN ( 'CNV','BRD')
AND TRIM(POSITION_NBR) IS NOT NULL
union
select distinct WT_BRANCH_ACRNYM ||'-' || WT_OFFICE_ACRNYM ||'-' || WT_DEPT_ACRNYM ||'-'|| WT_ORG_ACRNYM "value",DESCR60_SRCH  || '(' || WT_BRANCH_ACRNYM || ')' "label", WT_OFFICE_ACRNYM ||'-' || WT_DEPT_ACRNYM ||'-'|| WT_ORG_ACRNYM "reports_to"
from SYSADM.PS_WT_SOA_EMPL_VW
WHERE TRIM(WT_ORG_ACRNYM) IS NOT NULL AND WT_ORG_ACRNYM NOT IN ( 'CNV','BRD')
AND TRIM(POSITION_NBR) IS NOT NULL 
  `;

async function get_departments() {
  let query = baseQuery;
  const binds = {};
  opts = {
    autoCommit: true,
  };
  const result = await database.simpleExecute("hrPool", query, binds, opts);
  const data = create_json.create_departments(result.rows);
  //console.log(data[0]);
  return data;
}
module.exports.get_departments = get_departments;
