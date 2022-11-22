const database = require("../services/database.js");
const fs = require("fs");
const { create } = require("domain");
const { convertToObject } = require("typescript");

const baseQuery = `
select * from (
    select DECODE(TRIM(POSITION_NBR),'','C' || EMPLID,'E' ||POSITION_NBR) "id",
  DECODE(REPORTS_TO,'400000','',CASE WHEN TRIM(REPORTS_TO) IS NULL THEN '' ELSE 'E' || REPORTS_TO END)  "parentId",
    0 "employeeCount", 0 "contractorCount",0 "vacantCount",
    DECODE(TRIM(POSITION_NBR),'','Contractor','Employee') "emplType",
    DECODE(NAME,' ','true','false') "vacant"
    from SYSADM.PS_WT_SOA_EMPL_VW
  WHERE REPORTS_TO IN ( SELECT POSITION_NBR FROM SYSADM.PS_WT_SOA_EMPL_VW )
      AND POSITION_NBR != '400000'
      and WT_ORG_ACRNYM != 'BRD')
      where ("parentId" is NOT null
      or "id" = 'E000240')
ORDER BY 1
  `;

async function create_child_counts_file() {
  let query = baseQuery;
  const binds = {};
  opts = {
    autoCommit: true,
  };
  const result = await database.simpleExecute("hrPool", query, binds, opts);
  let data = result.rows; //create_json.create_json(result.rows);
  data.forEach((val, index) => {
    data[index].contractorCount = parseInt(data[index].contractorCount);
    data[index].employeeCount = parseInt(data[index].employeeCount);
    data[index].vacantCount = parseInt(data[index].vacantCount);
  });
  const idMapping = data.reduce((acc, el, i) => {
    acc[el.id] = i;
    return acc;
  }, {});
  let root;

  data.forEach((el) => {
    // Handle the root element
    if (el.parentId === null) {
      root = el;
      return;
    }
    // Use our mapping to locate the parent element in our data array
    const parentEl = data[idMapping[el.parentId]];
    // Add our current el to its parent's `children` array
    parentEl.children = [...(parentEl.children || []), el];
  });
  function updateEmployeeCounts(n) {
    if (n.children == undefined) {
      if (n.emplType == "Employee") {
        return 1;
      } else {
        return 0;
      }
    }
    n.children.forEach(function (c) {
      if (c.children != undefined) {
        n.employeeCount += 1;
      }
      var r = updateEmployeeCounts(c);
      n.employeeCount += r;
    });
    return n.employeeCount;
  }
  function updateContractorCounts(n) {
    if (n.children == undefined) {
      if (n.emplType == "Contractor") {
        return 1;
      } else {
        return 0;
      }
    }
    n.children.forEach(function (c) {
      var r = updateContractorCounts(c);
      n.contractorCount += r;
    });
    return n.contractorCount;
  }
  function updateVacantCounts(n) {
    if (n.children == undefined) {
      if (n.vacant == "true") {
        return 1;
      } else {
        return 0;
      }
    }
    n.children.forEach(function (c) {
      if (c.vacant == "true" && c.children != undefined) {
        n.vacantCount += 1;
      }
      var r = updateVacantCounts(c);
      n.vacantCount += r;
    });

    return n.vacantCount;
  }
  updateEmployeeCounts(root);
  updateContractorCounts(root);
  updateVacantCounts(root);

  function searchTree(element, id) {
    if (element.id == id) {
      return element;
    } else if (element.children != null) {
      var i;
      var result = null;
      for (i = 0; result == null && i < element.children.length; i++) {
        result = searchTree(element.children[i], id);
      }

      return result;
    }
    return null;
  }
  data.forEach((val, index) => {
    let elem = data[index].id;
    const result = searchTree(root, elem);
    if (result != null) {
      data[index].childCount = result.childCount;
    }
  });
  data.forEach((el) => {
    delete el.children;
    if (isNaN(el.id)) {
      delete data[el.id];
    }
  });
  fs.writeFile("./childcounts.json", JSON.stringify(data), (err) => {
    if (err) {
      console.log("Error writing file", err);
    } else {
      console.log("Successfully wrote ChildCounts file at " + Date.now());
    }
  });
  return root;
}
module.exports.create_child_counts_file = create_child_counts_file;
