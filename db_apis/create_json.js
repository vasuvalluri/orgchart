const fs = require("fs");

function create_departments(flatData) {
  const root = [];
  const map = {};

  flatData.forEach((node) => {
    if (!node.reports_to) return root.push(node);
    let parentIndex = map[node.reports_to];
    if (typeof parentIndex !== "number") {
      parentIndex = flatData.findIndex((el) => el.value === node.reports_to);
      try {
        map[node.reports_to] = parentIndex;
      } catch (err) {}
    }
    if (!flatData[parentIndex].children && parentIndex > 0) {
      return (flatData[parentIndex].children = [node]);
    }
    if (flatData[parentIndex].children == undefined) {
      flatData[parentIndex].children = [node];
    } else {
      flatData[parentIndex].children.push(node);
    }
  });
  return root;
}

function create_children(flatData, isShowContractors) {
  const root = {};
  //console.log(flatData);
  flatData.forEach((val, index) => {
    //flatData[index].id = parseInt(flatData[index].id);
    //flatData[index].parentid = parseInt(flatData[index].parentid);
    if (
      flatData[index].employee_count + flatData[index].contractor_count !=
      "0"
    ) {
      flatData[index].relationship = flatData[index].relationship.replaceAt(
        2,
        "1"
      );
    }
    if (!isNaN(flatData[index].parentid)) {
      flatData[index].relationship = flatData[index].relationship.replaceAt(
        0,
        "1"
      );
    }
    if (isShowContractors == "false") {
      if (
        flatData[index].employee_count + flatData[index].contractor_count ===
        flatData[index].contractor_count
      ) {
        flatData[index].relationship = flatData[index].relationship.replaceAt(
          2,
          "0"
        );
      }
    }
  });

  const dict_counts = read_file();
  flatData.forEach((node) => {
    if (dict_counts[node.id] != undefined) {
      node.employeeCount = dict_counts[node.id][0];
      node.contractorCount = dict_counts[node.id][1];
      node.vacantCount = dict_counts[node.id][2];
      if (parseInt(node.employeeCount) + parseInt(node.contractorCount) == 0) {
        node.className += " leaf";
      }
    } else {
      node.employeeCount = 0;
      node.contractorCount = 0;
      node.vacantCount = 0;
      node.className += " leaf";
    }
    if (root.children === undefined) {
      root.children = [node];
    } else {
      root.children.push(node);
    }
  });
  return root;
}

function read_file() {
  try {
    const child_counts = JSON.parse(fs.readFileSync("./childcounts.json"));
    let dict_counts = {};
    child_counts.forEach((data) => {
      dict_counts[data.id] = [
        data.employeeCount,
        data.contractorCount,
        data.vacantCount,
      ];
    });
    return dict_counts;
  } catch (err) {
    console.log(err);
    return;
  }
}

function create_json(flatData) {
  const root = [];
  const map = {};
  if (flatData.length == 1) {
    const dict_counts = read_file();
    //flatData[0].id = parseInt(flatData[0].id);
    //flatData[0].parentid = parseInt(flatData[0].parentid);
    try {
      flatData[0].employeeCount = dict_counts[flatData[0].id][0];
      flatData[0].contractorCount = dict_counts[flatData[0].id][1];
      flatData[0].vacantCount = dict_counts[flatData[0].id][2];
    } catch (error) {
      flatData[0].employeeCount = 0;
      flatData[0].contractorCount = 0;
      flatData[0].vacantCount = 0;
    }
    return flatData;
  } else {
    flatData.forEach((val, index) => {
      //flatData[index].id = parseInt(flatData[index].id);
      //flatData[index].parentid = parseInt(flatData[index].parentid);
      if (
        flatData[index].employee_count + flatData[index].contractor_count !=
        "0"
      ) {
        flatData[index].relationship = flatData[index].relationship.replaceAt(
          2,
          "1"
        );
      }
      if (!isNaN(flatData[index].parentid)) {
        flatData[index].relationship = flatData[index].relationship.replaceAt(
          0,
          "1"
        );
      }
    });
    const dict_counts = read_file();
    flatData.forEach((node) => {
      try {
        node.employeeCount = dict_counts[node.id][0];
        node.contractorCount = dict_counts[node.id][1];
        node.vacantCount = dict_counts[node.id][2];
        if (
          parseInt(node.employeeCount) + parseInt(node.contractorCount) ==
          0
        ) {
          node.className += " leaf";
        }
      } catch {
        node.employeeCount = 0;
        node.contractorCount = 0;
        node.vacantCount = 0;
        node.className += " leaf";
      }

      if (!node.parentid) return root.push(node);
      let parentIndex = map[node.parentid];
      if (typeof parentIndex !== "number") {
        parentIndex = flatData.findIndex((el) => el.id === node.parentid);
        try {
          map[node.parentid] = parentIndex;
        } catch (err) {}
      }
      if (flatData[parentIndex]) {
        if (!flatData[parentIndex].children && parentIndex > 0) {
          return (flatData[parentIndex].children = [node]);
        }
        if (flatData[parentIndex].children == undefined) {
          flatData[parentIndex].children = [node];
        } else {
          flatData[parentIndex].children.push(node);
        }
      }
    });
    return root;
  }
}

function create_csv(flatData) {
  const items = flatData;
  const replacer = (key, value) => (value === null ? "" : value); // specify how you want to handle null values here
  const header = Object.keys(items[0]);
  const csv = [
    header.join(","), // header row first
    ...items.map((row) =>
      header
        .map((fieldName) => JSON.stringify(row[fieldName], replacer))
        .join(",")
    ),
  ].join("\r\n");
  return csv;
}

String.prototype.replaceAt = function (index, char) {
  let a = this.split("");
  a[index] = char;
  return a.join("");
};
module.exports = {
  create_json,
  create_csv,
  create_children,
  read_file,
  create_departments,
};
