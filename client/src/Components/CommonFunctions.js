import { getPhoneEmail } from "../GraphService";
import { config } from "../Config";

let $ = require("jquery");
let names = {};
const IMAGE_URL = config.IMAGE_URL;

export function centerTheScreen() {
  const $container = $("#chart-container");
  $(".orgchart").css("transform", "");
  //$container.scrollTop(-150);
  $container.animate(
    {
      scrollLeft: ($container[0].scrollWidth - $container.width()) / 2,
    },
    500
  );
}
export function setImagesPhone(accessToken) {
  let $employee = $(".orgchart").find(".employee, .contractor");
  $employee.each(function (i, e) {
    const nodeId = $(e).attr("id");
    names[nodeId] = $(".orgchart")
      .find("#name" + nodeId)
      .html();
    const image_url = `${IMAGE_URL}${names[nodeId].replace(" ", "")}.jpeg`;
    imageExists(image_url, function (exists) {
      if (exists) {
        const imgHTML = `<img class="imgcircle"  src="${image_url}"></img>`;
        $(".orgchart")
          .find("#image" + nodeId)
          .html(imgHTML);
      }
    });
  });
  getPhoneEmail(accessToken, names).then((results) => {
    $employee.each(function (i, e) {
      const nodeId = $(e).attr("id");
      if (results[nodeId] !== undefined) {
        if (results[nodeId].mail === null) {
          $(".orgchart")
            .find("#email" + nodeId)
            .html("N/A");
        } else {
          $(".orgchart")
            .find("#email" + nodeId)
            .html(results[nodeId].mail);
        }

        if (results[nodeId].businessPhones[0] === null) {
          $(".orgchart")
            .find("#deskPhone" + nodeId)
            .html("N/A");
        } else {
          $(".orgchart")
            .find("#deskPhone" + nodeId)
            .html(results[nodeId].businessPhones[0]);
        }

        if (results[nodeId].mobilePhone === null) {
          $(".orgchart")
            .find("#mobilePhone" + nodeId)
            .html("N/A");
        } else {
          $(".orgchart")
            .find("#mobilePhone" + nodeId)
            .html(results[nodeId].mobilePhone);
        }
      } else {
        $(".orgchart")
          .find("#email" + nodeId)
          .html("N/A");
        $(".orgchart")
          .find("#deskPhone" + nodeId)
          .html("N/A");
        $(".orgchart")
          .find("#mobilePhone" + nodeId)
          .html("N/A");
      }
    });
  });
}

export function setLeafCollapsedMap(collapsedMap, chart) {
  var $leaf = $(".orgchart").find(".leaf");
  $leaf.each(function (i, e) {
    const nodeId = $(e).attr("id");
    const $siblings = chart.getRelatedNodes(findNode(nodeId), "siblings");
    let leafLength = 0;
    $siblings.each(function (i, e) {
      if ($(e).hasClass("leaf")) {
        leafLength += 1;
      }
    });

    if ($siblings.length === leafLength) {
      let $parentUL = $(e).parents("ul:first");
      if (!$parentUL.find("ul").length) {
        $parentUL.addClass("leaf");
      }
    }
  });

  var $hierarchy = $(".orgchart").find(".hierarchy:first");
  $hierarchy.find("div.node").each(function (i, e) {
    var parentItem = $(e).parents("li");
    collapsedMap[e.id] = $(parentItem).attr("class").split(/\s+/); //parentItem.hasClass( 'isCollapsedSibling' );
  });
}

export function checkIfImageExists(url, e, callback) {
  const img = new Image();
  img.src = url;
  if (img.complete) {
    callback(true);
  } else {
    img.onload = () => {
      callback(true);
    };
    img.onerror = () => {
      e.src = "person.png";
      callback(false);
    };
  }
}
export function centerOnNode(value) {
  if (value !== undefined) {
    //console.log("centeronnode");
    var $selNode = findNode(value);
    $selNode.addClass("focused");
    var $chart = $selNode.closest(".orgchart");
    $chart.css("transform", "");
    setTimeout(function () {
      var newX = window.parseInt(
        $chart.outerWidth(true) / 2 -
        ($selNode.offset().left - $chart.offset().left) -
        $selNode.outerWidth(true) / 2
      );
      var newY = window.parseInt(
        $chart.outerHeight(true) / 2 -
        ($selNode.offset().top - $chart.offset().top) -
        $selNode.outerHeight(true) / 2
      );
      $chart.css(
        "transform",
        "matrix(1, 0, 0, 1, " + newX + ", " + (newY - 100) + ")"
      );
    }, 50);
  } else {
    $(".orgchart").css("transform", "");
  }
}
export function findNode(id) {
  var $chart = $(".orgchart");
  $chart.addClass("noncollapsable");
  let foundNode = null;
  $chart.find(".node").filter(function (index, node) {
    if ($(node).attr("id") === id) foundNode = $(node);
  });
  $chart.removeClass("noncollapsable");
  return foundNode;
}
/*function printAllVals(key, obj) {
  for (let k in obj) {
    if (typeof obj[k] === "object") {
      printAllVals(key, obj[k]);
    } else {
      // base case, stop recurring
      if (obj[k] == key) {
        return obj;
      }
    }
  }
}
function searchTree(element, id) {
  if (element.id === id) {
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
}*/
export function imageExists(url, callback) {
  var img = new Image();
  img.onload = function () {
    callback(true);
  };
  img.onerror = function () {
    callback(false);
  };
  img.src = url;
}
/*const $contractor = $(".orgchart").find(".contractor");
  $contractor.each(function (i, e) {
    const nodeId = $(e).attr("id");
    const $node = findNode(nodeId).parents("li:first");
    if (isShowContractors) {
      $node.removeClass("hidden");
    } else {
      $node.addClass("hidden");
    }
  });
  const $vacant = $(".orgchart").find(".vacant");
  $vacant.each(function (i, e) {
    const nodeId = $(e).attr("id");
    const $node = findNode(nodeId).parents("li:first");
    if (isShowVacant) {
      $node.removeClass("hidden");
    } else {
      $node.addClass("hidden");
    }
  });*/
